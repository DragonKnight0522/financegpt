const { getConnection } = require("../config/mongodb");
const { isEmpty, handleError } = require("../utils/util");

// get Transactions with filter and sort
exports.getTransaction = async (req, res, next) => {
	try {
		const {
			filter: {
				currentPage,
				pageSize,
				filterDate,
				priceRange,
				selectedAccounts,
				selectedCategories,
				selectedPaymentChannel,
			},
		} = req.body;
		const user = req.user;
		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		let query = { user: user._id };

		if (!isEmpty(filterDate?.startDate) || !user.storeAYear) {
			let start_date = new Date(filterDate.startDate);
			if (!user.storeAYear) {
				const now = new Date();
				const firstDate = new Date(now.getFullYear(), 0, 1);
				if (start_date < firstDate) start_date = firstDate;
			}
			query.date = { $gte: start_date };
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

		res.send({ size: totalFilteredData, data });
	} catch (error) {
		handleError(error);
	}
};
