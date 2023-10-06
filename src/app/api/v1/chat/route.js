import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError, isEmpty } from "@/utils/util";

import { dbConnect, getConnection } from "@/config/mongodb";
import User from "@/models/user";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);

		let chatHistory = await Chat.find({ user: user._id });

		return NextResponse.json({ chatHistory }, { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};

export const POST = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { message, _id, title } = await request.json();
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);

		let chatChannel;
		if (isEmpty(_id)) {
			chatChannel = await new Chat().save();
		} else {
			chatChannel = await Chat.findById(_id);
		}
		// const aiResponse = await getResponseOpenAI();
		const aiResponse =
			"This is long sen open ai response about " +
			message +
			"\n the second paragraph is also here" +
			"\n the third paragraph is also here";
		chatChannel.title = title;
		chatChannel.user = user._id;
		chatChannel.chat.push({ role: 1, message });
		chatChannel.chat.push({ role: 0, message: aiResponse });
		await chatChannel.save();

		return NextResponse.json(
			{ message: aiResponse, _id: chatChannel._id },
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
