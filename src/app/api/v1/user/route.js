import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError, isEmpty } from "@/utils/util";

import { checkConnection, createConnection, dbConnect } from "@/config/mongodb";
import User from "@/models/user";
import Item from "@/models/item";

await dbConnect();

export const GET = async () => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne(
			{ email: userInfo.email },
			{ ACCESS_TOKEN: 0, ITEM_ID: 0, TRANSFER_ID: 0 }
		);

		const items = await Item.find(
			{ user: user._id },
			{ institution: 1, accounts: 1 }
		);

		return NextResponse.json({ user, items }, { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};

export const DELETE = async () => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);

		await User.findOneAndDelete({ email: userInfo.email });

		return NextResponse.json("User account deleted successfully", {
			status: 201,
		});
	} catch (err) {
		handleServerError(err);
	}
};

export const POST = async (request) => {
	try {
		const { user: session } = await getServerSession(authOptions);
		const user = await User.findOne({ email: session.email });

		const { userInfo } = await request.json();
		await User.findByIdAndUpdate(user._id, { ...userInfo });

		// Create database connection.
		if (
			(!isEmpty(userInfo.mongoDBURL) && !checkConnection(user._id)) ||
			userInfo.mongoDBURL !== user.mongoDBURL
		) {
			const conRes = await createConnection(
				user._id,
				userInfo.mongoDBURL
			);
			if (conRes !== 1) {
				console.log(conRes);

				return NextResponse.json(
					{ message: "Personal database connection error." },
					{ status: 403 }
				);
			}
		}

		return NextResponse.json("User account updated successfully", {
			status: 201,
		});
	} catch (err) {
		handleServerError(err);
	}
};
