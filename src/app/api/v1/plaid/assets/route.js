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

		// You can specify up to two years of transaction history for an Asset
		// Report.
		const daysRequested = 10;

		// The `options` object allows you to specify a webhook for Asset Report
		// generation, as well as information that you want included in the Asset
		// Report. All fields are optional.
		const options = {
			client_report_id: `Custom Report ID ${user._id}`,
			// webhook: 'https://your-domain.tld/plaid-webhook',
			user: {
				client_user_id: `Custom Report ID ${user._id}`,
				first_name: user.family_name,
				middle_name: user.family_name || "",
				last_name: user.given_name,
				ssn: user.ssn || "",
				phone_number: user.phone_number || "",
				email: user.email || "",
			},
		};
		const configs = {
			access_tokens: [user.ACCESS_TOKEN],
			days_requested: daysRequested,
			options,
		};
		const assetReportCreateResponse = await plaidClient.assetReportCreate(
			configs
		);

		const assetReportToken =
			assetReportCreateResponse.data.asset_report_token;
		const getResponse = await getAssetReportWithRetries(
			client,
			assetReportToken
		);
		const pdfRequest = {
			asset_report_token: assetReportToken,
		};

		const pdfResponse = await plaidClient.assetReportPdfGet(pdfRequest, {
			responseType: "arraybuffer",
		});

		return NextResponse.json(
			{
				json: getResponse.data.report,
				pdf: pdfResponse.data.toString("base64"),
			},
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
