import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { handleServerError, isEmpty } from "@/utils/util";

import { dbConnect, getConnection } from "@/config/mongodb";
import User from "@/models/user";

await dbConnect();

export const POST = async (request) => {
	try {
		const { user: userInfo } = await getServerSession(authOptions);
		const user = await User.findOne({ email: userInfo.email });

		const {
			filter: {
				currentPage,
				pageSize,
				filterDate,
				merchantName,
				priceRange,
				selectedAccounts,
				selectedCategories,
				selectedPaymentChannel,
			},
		} = await request.json();

		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return NextResponse.json(
				{ message: "Personal Database Connection Error" },
				{ status: 403 }
			);

		let query = { user: user._id };

		if (!isEmpty(filterDate?.startDate)) {
			query.date = { $gte: filterDate.startDate };
		}
		if (!isEmpty(filterDate?.endDate)) {
			query.date = { ...query.date, $lte: filterDate.endDate };
		}

		if (priceRange.minPrice !== "") {
			query.amount = { $gte: priceRange.minPrice };
		}
		if (priceRange.maxPrice !== "") {
			query.amount = { ...query.amount, $lte: priceRange.maxPrice };
		}

		if (merchantName !== "") {
			query.merchant_name = {
				$regex: new RegExp(merchantName),
				$options: "i",
			};
		}

		if (selectedPaymentChannel != "all") {
			query.payment_channel = selectedPaymentChannel;
		}

		if (selectedAccounts.length > 0) {
			query.account_id = { $in: selectedAccounts };
		}

		if (selectedCategories.length > 0) {
			query.category = { $in: selectedCategories };
		}

		const totalFilteredData = await Transaction.countDocuments(query);
		const data = await Transaction.find(query)
			.sort({ date: "desc" })
			.skip((currentPage - 1) * pageSize)
			.limit(pageSize);

		return NextResponse.json(
			{ size: totalFilteredData, data },
			{ status: 201 }
		);
	} catch (err) {
		handleServerError(err);
	}
};
