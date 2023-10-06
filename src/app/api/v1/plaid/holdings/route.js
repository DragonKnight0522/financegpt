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

		const holdingsResponse = await plaidClient.investmentsHoldingsGet({
			access_token: user.ACCESS_TOKEN,
		});

		return NextResponse.json(
			{ error: null, holdings: holdingsResponse.data },
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
