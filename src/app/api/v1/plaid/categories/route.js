import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError } from "@/utils/util";

import { dbConnect } from "@/config/mongodb";
import { plaidClient } from "@/config/plaid";
import User from "@/models/user";
import Category from "@/models/category";

await dbConnect();

export const GET = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		let categories = await Category.find();

		if (categories.length === 0) {
			const response = await plaidClient.categoriesGet({});
			categories = response.data.categories;

			// Save the categories to MongoDB using Mongoose
			await Category.insertMany(categories);
		}

		return NextResponse.json({ categories }, { status: 201 });
	} catch (err) {
		handleServerError(err);
	}
};
