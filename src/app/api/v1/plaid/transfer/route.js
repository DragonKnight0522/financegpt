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

		const transferGetResponse = await plaidClient.transferGet({
			transfer_id: user.TRANSFER_ID,
		});

		return NextResponse.json(
			{
				error: null,
				transfer: transferGetResponse.data.transfer,
			},
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
