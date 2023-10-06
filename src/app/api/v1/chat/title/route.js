import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError } from "@/utils/util";

import { dbConnect, getConnection } from "@/config/mongodb";
import User from "@/models/user";

await dbConnect();

export const POST = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { _id, title } = await request.json();
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);

		await Chat.findByIdAndUpdate(_id, { title });

		return NextResponse.json("success", { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};
