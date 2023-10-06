import { NextResponse } from "next/server";

import { handleServerError } from "@/utils/util";

import { PLAID_PRODUCTS, ACCESS_TOKEN, ITEM_ID } from "@/config/plaid";

export const GET = async (request) => {
	try {
		return NextResponse.json(
			{
				item_id: ITEM_ID,
				access_token: ACCESS_TOKEN,
				products: PLAID_PRODUCTS,
			},
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
