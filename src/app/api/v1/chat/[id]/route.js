import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError, isEmpty } from "@/utils/util";

import { dbConnect, getConnection, ObjectId } from "@/config/mongodb";
import User from "@/models/user";

await dbConnect();

export const DELETE = async (request, { params }) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const { id } = params;
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);

		if (id == "all")
			await Chat.deleteMany({ user: new ObjectId(user._id) });
		else await Chat.findByIdAndDelete(id);

		return NextResponse.json("success", { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};
