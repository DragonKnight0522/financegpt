import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { dbConnect } from "@/config/mongodb";
import { getServerSession } from "next-auth";
import { handleServerError } from "@/utils/util";
import {
	PLAID_ANDROID_PACKAGE_NAME,
	PLAID_COUNTRY_CODES,
	PLAID_PRODUCTS,
	PLAID_REDIRECT_URI,
	plaidClient,
} from "@/config/plaid";
import User from "@/models/user";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const configs = {
			user: {
				// This should correspond to a unique id for the current user.
				client_user_id: `id-${user.name}`,
			},
			client_name: user.name,
			products: PLAID_PRODUCTS,
			country_codes: PLAID_COUNTRY_CODES,
			language: user.locale,
		};

		if (PLAID_REDIRECT_URI !== "") {
			configs.redirect_uri = PLAID_REDIRECT_URI;
		}

		if (PLAID_ANDROID_PACKAGE_NAME !== "") {
			configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
		}
		const createTokenResponse = await plaidClient.linkTokenCreate(configs);

		return NextResponse.json(createTokenResponse.data, { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};
