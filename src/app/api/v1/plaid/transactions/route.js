import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError, isEmpty } from "@/utils/util";

import { dbConnect, getConnection } from "@/config/mongodb";
import { plaidClient } from "@/config/plaid";
import User from "@/models/user";
import Item from "@/models/item";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);
			
		// get
		const item = await Item.findOne({
			user: user._id,
			ACCESS_TOKEN: user.ACCESS_TOKEN,
		});

		// Set cursor to empty to receive all historical updates
		let cursor = isEmpty(item?.cursor) ? null : item.cursor;
		// New transaction updates since "cursor"
		let added = [];
		let modified = [];
		// Removed transaction ids
		let removed = [];
		let hasMore = true;
		// Iterate through each page of new transaction updates for item
		while (hasMore) {
			const request = {
				access_token: user.ACCESS_TOKEN,
				cursor: cursor,
			};
			const res = await plaidClient.transactionsSync(request);
			const data = res.data;
			// Add this page of results
			added = added.concat(data.added);
			modified = modified.concat(data.modified);
			removed = removed.concat(data.removed);
			hasMore = data.has_more;
			// Update cursor to the next cursor
			cursor = data.next_cursor;
		}

		// Update cursor for next new transaction
		item.cursor = cursor;
		await item.save();

		let addedData = added.map((added) => {
			added.user = user._id;
			return added;
		});
		await Transaction.insertMany(addedData);

		const updatePromises = modified.map((transaction) =>
			Transaction.findOneAndUpdate(
				{
					user: user._id,
					transaction_id: transaction.transaction_id,
				},
				transaction
			)
		);
		await Promise.all(updatePromises);

		let removeItemIds = removed.map((removed) => removed.transaction_id);
		await Transaction.deleteMany({
			user: user._id,
			transaction_id: { $in: removeItemIds },
		});

		return NextResponse.json(
			{
				added: added.length,
				modified: modified.length,
				removed: removed.length,
				updated:
					added.length > 0 ||
					modified.length > 0 ||
					removed.length > 0,
			},
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
