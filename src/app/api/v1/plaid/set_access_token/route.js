import { NextResponse } from "next/server";

import { Products } from "plaid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError } from "@/utils/util";

import { dbConnect, ObjectId } from "@/config/mongodb";
import {
	plaidClient,
	PLAID_PRODUCTS,
	authorizeAndCreateTransfer,
} from "@/config/plaid";
import User from "@/models/user";
import Item from "@/models/item";

await dbConnect();

export const POST = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { public_token: PUBLIC_TOKEN, metadata } = await request.json();
		const { institution_id } = metadata.institution;
		const accountIds = metadata.accounts.map((item) => item.id);

		const itemData = await Item.findOne({
			user: user._id,
			"institution.institution_id": institution_id,
			accounts: {
				$elemMatch: {
					account_id: { $in: accountIds },
				},
			},
		});

		if (itemData) {
			const updateData = {
				ACCESS_TOKEN: itemData.ACCESS_TOKEN,
				ITEM_ID: itemData.ITEM_ID,
				TRANSFER_ID: itemData.TRANSFER_ID,
			};

			await User.findByIdAndUpdate(user._id, updateData);

			return NextResponse.json(
				{ isItemAccess: true, item_id: null },
				{ status: 201 }
			);
		} else {
			const tokenResponse = await plaidClient.itemPublicTokenExchange({
				public_token: PUBLIC_TOKEN,
			});
			// prettyPrintResponse(tokenResponse);
			// Save it to database
			const ACCESS_TOKEN = tokenResponse.data.access_token;
			const ITEM_ID = tokenResponse.data.item_id;
			let TRANSFER_ID = null;
			if (PLAID_PRODUCTS.includes(Products.Transfer)) {
				TRANSFER_ID = await authorizeAndCreateTransfer(
					plaidClient,
					ACCESS_TOKEN
				);
			}

			await User.findByIdAndUpdate(user._id, {
				ACCESS_TOKEN,
				ITEM_ID,
				TRANSFER_ID,
			});
			const newAccounts = metadata.accounts.map((account) => ({
				account_id: account.id.toString(),
				name: account.name,
				mask: account.mask,
				subtype: account.subtype,
				type: account.type,
			}));
			const newItem = new Item({
				user: new ObjectId(user._id),
				accounts: newAccounts,
				institution: metadata.institution,
				ACCESS_TOKEN,
				ITEM_ID,
				TRANSFER_ID,
			});
			await newItem.save();

			return NextResponse.json(
				{ isItemAccess: true, item_id: newItem._id },
				{ status: 201 }
			);
		}
	} catch (err) {
		handleServerError(err);
	}
};
