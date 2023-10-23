const User = require("../models/user");
const Item = require("../models/item");
const {
	handleError,
	isEmpty,
	calculateKPIs,
	calculateNetWorth,
} = require("../utils/util");

const { getLiabilitiesByToken } = require("./plaid");
const {
	createConnection,
	getConnection,
	checkConnection,
} = require("../config/mongodb");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getUserInfo = async (req, res, next) => {
	try {
		const { user } = req;
		const userInfo = await User.findOne(
			{ email: user.email },
			{ ACCESS_TOKEN: 0, ITEM_ID: 0, TRANSFER_ID: 0 }
		);

		const items = await Item.find(
			{ user: userInfo._id },
			{ institution: 1, accounts: 1 }
		);
		return res.send({ user: userInfo, items });
	} catch (error) {
		handleError(error);
	}
};

exports.deleteItemInfoById = async (req, res, next) => {
	try {
		const { user } = req;
		const { id } = req.params;
		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		const item = await Item.findByIdAndDelete(id);

		// Delete all the transaction Info related to this item (institution and account)
		const accountIds = item.accounts.map((account) => account.account_id);
		await Transaction.deleteMany({
			user: user._id,
			account_id: { $in: accountIds },
		});

		res.send("Account deleted successfully");
	} catch (error) {
		handleError(error);
	}
};

exports.deleteUserAccount = async (req, res, next) => {
	try {
		const { user } = req;

		// use only in development mode
		await User.findByIdAndDelete(user._id);

		await Item.deleteMany({ user: user._id });

		const { Transaction } = await getConnection(user._id, user.mongoDBURL);

		if (isEmpty(Transaction))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		Transaction.deleteMany({ user: user._id });

		res.send("User account deleted successfully");
	} catch (error) {
		handleError(error);
	}
};

exports.updateUserAccount = async (req, res, next) => {
	try {
		const { user } = req;
		const { userInfo } = req.body;
		await User.findByIdAndUpdate(user._id, { ...userInfo });

		// Create database connection.
		if (
			!isEmpty(userInfo.mongoDBURL) &&
			(!checkConnection(user._id) ||
				userInfo.mongoDBURL !== user.mongoDBURL)
		) {
			const conRes = await createConnection(
				user._id,
				userInfo.mongoDBURL
			);
			if (conRes !== 1) {
				return res.status(403).send({
					message: "Personal database connection error.",
				});
			}
		}

		res.send("User account updated successfully");
	} catch (error) {
		handleError(error);
	}
};

exports.handleGetDashboard = async (req, res, next) => {
	try {
		const { user } = req;

		const { Transaction, Kpi } = await getConnection(
			user._id,
			user.mongoDBURL
		);
		if (isEmpty(Transaction))
			return res.status(403).json("Personal Database Connection Error");

		const now = new Date();
		let monthCnt = now.getMonth() + 1;
		const firstDate = new Date(now.getFullYear(), 0, 1);
		// Calculate Spend and Transaction Info from Transaction DB
		const transactionRes = await Transaction.aggregate([
			{
				$match: {
					user: new ObjectId(user._id), // convert string to ObjectId for matching
				},
			},
			{
				$group: {
					_id: "$user",
					totalOutcome: {
						$sum: {
							$cond: [{ $gte: ["$amount", 0] , }, "$amount", 0],
						},
					},
					totalIncome: {
						$sum: {
							$cond: [{ $lt: ["$amount", 0] }, "$amount", 0],
						},
					},
					transactionCount: { $sum: 1 },
				},
			},
		]);

		// Calculate Spend and Transaction Info from Transaction DB
		const items = await Item.find({ user: user._id });
		const getTotalDebtInfoPromises = items?.map(async (item) => {
			const res = await getLiabilitiesByToken(item.ACCESS_TOKEN);
			const kpis = calculateKPIs(res);
			const netWorth = calculateNetWorth(res);
			return {
				kpis,
				netWorth,
			};
		});

		const infos = await Promise.all(getTotalDebtInfoPromises);
		const totalInfos = infos.reduce(
			(acc, currValue) => ({
				kpis: {
					totalCurrentBalance:
						acc.kpis.totalCurrentBalance +
						currValue.kpis.totalCurrentBalance,
					mainContributor:
						acc.kpis.mainContributor.totalCurrentBalance >
						currValue.kpis.mainContributor.totalCurrentBalance
							? acc.kpis.mainContributor
							: currValue.kpis.mainContributor,
					totalDebt: acc.kpis.totalDebt + currValue.kpis.totalDebt,
					totalAvailableCredit:
						acc.kpis.totalAvailableCredit +
						currValue.kpis.totalAvailableCredit,
					totalSpend: acc.kpis.totalSpend + currValue.kpis.totalSpend,
					maxCreditLimit:
						acc.kpis.maxCreditLimit + currValue.kpis.maxCreditLimit,
				},
				netWorth: acc.netWorth + currValue.netWorth,
			}),
			{
				kpis: {
					totalCurrentBalance: 0,
					mainContributor: {},
					totalDebt: 0,
					totalAvailableCredit: 0,
					totalSpend: 0,
					maxCreditLimit: 0,
				},
				netWorth: 0,
			}
		);

		const kpis = [
			{
				title: "Total Balance",
				metric: totalInfos.kpis.totalCurrentBalance,
				// metricPrev: transPrevCount,
				delta: totalInfos.kpis.mainContributor?.name,
				text: "Total sum money in checking, savings, investments balance  across checking accounts",
				type: "",
			},
			{
				title: "Total transactions",
				metric: transactionRes[0]?.transactionCount,
				// metricPrev: transPrevCount,
				delta: Math.abs(
					transactionRes[0]?.transactionCount / monthCnt
				).toFixed(2),
				text: "Transactions count",
				type: "",
			},
			{
				title: "Money In",
				metric: Math.abs(transactionRes[0]?.totalIncome),
				// metricPrev: transPrevCount,
				delta: Math.abs(
					transactionRes[0]?.totalIncome / monthCnt
				).toFixed(2),
				text: "Total sum deposited into a saving or checking accounts",
				type: "$ ",
			},
			{
				title: "Money Out",
				metric: transactionRes[0]?.totalOutcome,
				// metricPrev: transPrevCount,
				delta: Math.abs(
					transactionRes[0]?.totalOutcome / monthCnt
				).toFixed(2),
				text: "Total sum spent or paid to a merchant",
				type: "$ ",
			},
			{
				title: "Current Debt",
				metric: totalInfos.kpis.totalDebt,
				// metricPrev: transPrevCount,
				// delta: transDelta.toFixed(2),
				text: "Sum of current  balance on all credit cards",
				type: "",
			},
			{
				title: "Available Credit",
				metric: totalInfos.kpis.totalAvailableCredit,
				// metricPrev: transPrevCount,
				// delta: transDelta.toFixed(2),
				text: "Sum of available credit",
				type: "",
			},
			{
				title: "Max Credit Limit",
				metric: totalInfos.kpis.maxCreditLimit,
				// metricPrev: transPrevCount,
				// delta: transDelta.toFixed(2),
				text: "Sum of all credit limits",
				type: "",
			},
			{
				title: "Net Worth",
				metric: totalInfos.netWorth,
				// metricPrev: transPrevCount,
				// delta: transDelta.toFixed(2),
				text: "Total Balance - Current Debt",
				type: "",
			},
		];

		user.kpis = kpis;
		await user.save();

		return res.send({ kpis });
	} catch (error) {
		handleError(error);
	}
};

exports.handleGetChartInfo = async (req, res, next) => {
	try {
		const { user } = req;
		const { filterDate } = req.body;

		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return res.status(403).json("Personal Database Connection Error");

		let start_date = new Date(filterDate.startDate);
		if (!user.storeAYear) {
			const now = new Date();
			const firstDate = new Date(now.getFullYear(), 0, 1);
			if (start_date < firstDate) start_date = firstDate;
		}
		const end_date = new Date(filterDate.endDate);

		// get Total Count for categories percentage
		const totalCountData = await Transaction.aggregate([
			{
				$match: {
					user: user._id,
					date: {
						$gte: start_date,
						$lte: end_date,
					},
				},
			},
			{
				$group: {
					_id: null,
					totalCount: { $sum: 1 },
				},
			},
		]);
		const totalCount =
			totalCountData.length > 0 ? totalCountData[0].totalCount : 0;

		// Calculate Spend and Transaction Info from Transaction DB
		const data = await Transaction.aggregate([
			{
				$match: {
					user: user._id,
					date: {
						$gte: start_date,
						$lte: end_date,
					},
				},
			},
			{
				$facet: {
					chartData: [
							// Filter out negative transactions (deposits)
							{
							  $match: {
								amount: { $gte: 0 },
								category: {"$ne": "Credit Card"}
							  }
							},
							// Group by month and calculate spend and count for each month
							{
							  $group: {
								_id: {
								  month: { $month: "$date" },
								  year: { $year: "$date" },
								},
								spend: { $sum: "$amount" },
								count: { $sum: 1 },
							  }
							},
							// Sort the result by year, then month
							{
							  $sort: {
								"_id.year": 1,
								"_id.month": 1
							  },
							},
							{
							  $group: {
								_id: null,
								data: {
								  $push: {
									month: "$_id.month",
									year: "$_id.year",
									spend: "$spend",
									count: "$count"
								  }
								}
							  }
							},
							{
							  $project: {
								cumulativeData: {
								  $reduce: {
									input: "$data",
									initialValue: { sum: 0, count: 0, data: [] },
									in: {
									  $let: {
										vars: {
										  newSum: { $add: ["$$value.sum", "$$this.spend"] },
										  newCount: { $add: ["$$value.count", "$$this.count"] }
										},
										in: {
										  sum: "$$newSum",
										  count: "$$newCount",
										  data: {
											$concatArrays: [
											  "$$value.data",
											  [
												{
												  month: "$$this.month",
												  year: "$$this.year",
												  spend: "$$newSum",
												  count: "$$newCount"
												}
											  ]
											]
										  }
										}
									  }
									}
								  }
								}
							  }
							},
							{
							  $unwind: "$cumulativeData.data"
							},
							{
							  $project: {
								_id: 0,
								sortKey: {
								  $concat: [
									{ $substr: ["$cumulativeData.data.year", 0, 4] },
									"-",
									{ $substr: [{ $cond: [{ $lt: ["$cumulativeData.data.month", 10] }, { $concat: ["0", { $substr: ["$cumulativeData.data.month", 0, 2] }] }, { $substr: ["$cumulativeData.data.month", 0, 2] }] }, 0, 2] }
								  ]
								},
								date: {
								  $concat: [
									{ $substr: ["$cumulativeData.data.month", 0, 2] },
									"-",
									{ $substr: ["$cumulativeData.data.year", 0, 4] }
								  ]
								},
								spend: "$cumulativeData.data.spend",
								count: "$cumulativeData.data.count"
							  }
							},
							{
							  $sort: {
								sortKey: 1
							  }
							}
						  ],
				
					chartDataByMonth: [
							// Filter out negative transactions (deposits)
							{
							  $match: {
								amount: { $gte: 0 },
								category: { "$ne": "Credit Card" }
							  }
							},
							// Group by month and year, and calculate spend and count for each month
							{
							  $group: {
								_id: {
								  month: { $month: "$date" },
								  year: { $year: "$date" },
								},
								spend: { $sum: "$amount" },
								count: { $sum: 1 },
							  }
							},
							// Sort the result by year, then month
							{
							  $sort: {
								"_id.year": 1,
								"_id.month": 1
							  }
							},
							// Project fields into the desired format
							{
							  $project: {
								_id: 0,
								date: {
								  $concat: [
									{ $substr: [{ $cond: [
									  { $lt: ["$_id.month", 10] },
									  { $concat: ["0", { $substr: ["$_id.month", 0, 2] }] },
									  { $substr: ["$_id.month", 0, 2] }
									] }, 0, 2 ] },
									"-",
									{ $substr: ["$_id.year", 0, 4] }
								  ]
								},
								spend: "$spend",
								count: "$count"
							  }
							}
						  ],
					barListData: [
						{
							$group: {
								_id: "$name",
								total: { $sum: "$amount" },
								value: { $sum: 1 },
							},
						},
						{
							$match: {
								value: { $gt: 5 },
							},
						},
						{
							$project: {
								_id: 0,
								name: "$_id",
								total: 1,
								value: 1,
							},
						},
						{
							$sort: {
								value: -1,
							},
						},
					],
					donutChartData: [
						// Filter out negative transactions (deposits)
						{
							$match: {
							  amount: { $gte: 0 },
							  category: {"$ne": "Credit Card"}
							}
						  },
						{
							$group: {
								_id: "$category",
								totalAmount: { $sum: "$amount" },
								totalCount: { $sum: 1 },
							},
						},
						{
							$project: {
								_id: 0,
								// category: "$_id",
								name: { $arrayElemAt: ["$_id", -1] },
								totalAmount: 1,
								totalCount: 1,
								percent: {
									$multiply: [
										{
											$divide: [
												"$totalCount",
												{ $literal: totalCount },
											],
										},
										100,
									],
								},
							},
						},
						{
							$sort: {
								percent: -1,
							},
						},
						{
							$limit: 5,
						},
					],
					donutAsBarData: [
						// Filter out negative transactions (deposits)
						{
							$match: {
							  amount: { $gte: 0 },
							  category: {"$ne": "Credit Card"}
							}
						  },
						{
							$group: {
								_id: "$category",
								totalAmount: { $sum: "$amount" },
								totalCount: { $sum: 1 },
							},
						},
						{
							$project: {
								_id: 0,
								// category: "$_id",
								name: { $arrayElemAt: ["$_id", -1] },
								totalAmount: 1,
								totalCount: 1,
								value: {
									$round: [
										{
											$multiply: [
												{
													$divide: [
														"$totalCount",
														{ $literal: totalCount }
													]
												},
												100
											]
										},
										2
									]
								},
							},
						},
						{
							$sort: {
								value: -1,
							},
						},
						{
							$limit: 10,
						},
					]
				},
			},
		]);

		return res.send({ ...data[0] });
	} catch (error) {
		handleError(error);
	}
};

exports.handleGetAllUsers = async (req, res, next) => {
	try {
		const {
			filter: { searchKey, currentPage, pageSize, selectedPayStatus },
		} = req.body;

		let queryObj = {};
		if (searchKey.length > 0) {
			queryObj.$or = [
				{ name: { $regex: searchKey, $options: "i" } },
				{ email: { $regex: searchKey, $options: "i" } },
			];
		}

		if (selectedPayStatus !== "all") {
			queryObj.isPro = selectedPayStatus === "payed" ? true : false;
		}

		let totalFilteredData = await User.find(queryObj).countDocuments();
		let data = await User.find(queryObj)
			.select("email name isPro")
			.skip((currentPage - 1) * pageSize)
			.limit(pageSize)
			.sort({ createdAt: "desc" });

		res.send({ size: totalFilteredData, data });
	} catch (error) {
		handleError(error);
	}
};

exports.setUserPayByEmail = async (req, res, next) => {
	try {
		const { email, isPro } = req.body;

		let data = await User.findOneAndUpdate(
			{ email },
			{ isPro },
			{ new: true }
		);
		res.send(data.isPro);
	} catch (error) {
		handleError(error);
	}
};
