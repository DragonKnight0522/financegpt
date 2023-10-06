import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError } from "@/utils/util";

import { dbConnect } from "@/config/mongodb";
import { plaidClient } from "@/config/plaid";
import User from "@/models/user";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		// Pull the Item - this includes information about available products,
		// billed products, webhook information, and more.
		const itemResponse = await plaidClient.itemGet({
			access_token: user.ACCESS_TOKEN,
		});
		// Also pull information about the institution
		const configs = {
			institution_id: itemResponse.data.item.institution_id,
			country_codes: PLAID_COUNTRY_CODES,
		};
		const instResponse = await plaidClient.institutionsGetById(configs);

		return NextResponse.json(
			{
				item: itemResponse.data.item,
				institution: instResponse.data.institution,
			},
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
