import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError, isEmpty } from "@/utils/util";

import { dbConnect, getConnection } from "@/config/mongodb";
import User from "@/models/user";
import Item from "@/models/item";

await dbConnect();

export const DELETE = async (request, { params }) => {
	try {
		const { id } = params;

		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);

		// get
		const item = await Item.findByIdAndDelete(id);

		const accountIds = item.accounts.map((account) => account.account_id);
		await Transaction.deleteMany({
			user: user._id,
			account_id: { $in: accountIds },
		});

		return NextResponse.json("Account deleted successfully", {
			status: 201,
		});
	} catch (err) {
		handleServerError(err);
	}
};
