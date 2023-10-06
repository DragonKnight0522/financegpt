import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/config/mongodb";
import { plaidClient } from "@/config/plaid";
import { handleServerError } from "@/utils/util";
import Item from "@/models/item";
import User from "@/models/user";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });
		const items = await Item.find({ user: user._id });

		const getAccountAndUpdate = items.map(async (item) => {
			const accountsResponse = await plaidClient.accountsGet({
				access_token: item.ACCESS_TOKEN,
			});
			item.accounts = accountsResponse.data.accounts;

			// Save the updates and return the updated item
			const updatedItem = await item.save();
			return updatedItem;
		});

		// Wait for all updates to finish and collect the updated items
		const updatedItems = await Promise.all(getAccountAndUpdate);
		return NextResponse.json(updatedItems, { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};
