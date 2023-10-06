import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError } from "@/utils/util";

import { dbConnect } from "@/config/mongodb";
import { plaidClient } from "@/config/plaid";
import User from "@/models/user";
import moment from "moment";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
		const endDate = moment().format("YYYY-MM-DD");
		const configs = {
			access_token: user.ACCESS_TOKEN,
			start_date: startDate,
			end_date: endDate,
		};
		const investmentTransactionsResponse =
			await plaidClient.investmentsTransactionsGet(configs);

		return NextResponse.json(
			{
				error: null,
				investments_transactions: investmentTransactionsResponse.data,
			},
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
