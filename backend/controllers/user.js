const User = require("../models/user");
const Item = require("../models/item");
const {
	handleError,
	isEmpty,
	calculateKPIs,
	calculateTotalMonthlyPayments,
	calculateNetWorth,
	calculateCreditUtilization,
} = require("../utils/util");

const { getLiabilitiesByToken } = require("./plaid");
const {
	createConnection,
	getConnection,
	checkConnection,
} = require("../config/mongodb");

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
		await User.findByIdAndDelete(user._id);
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
			(!isEmpty(userInfo.mongoDBURL) && !checkConnection(user._id)) ||
			userInfo.mongoDBURL !== user.mongoDBURL
		) {
			const conRes = await createConnection(
				user._id,
				userInfo.mongoDBURL
			);
			if (conRes !== 1) {
				console.log(conRes);
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
		const {
			filterDate: { filterDate },
		} = req.body;

		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return res.status(403).json("Personal Database Connection Error");

		const start_date = new Date(filterDate.startDate);
		const end_date = new Date(filterDate.endDate);
		// Calculate Spend and Transaction Info from Transaction DB
		const transactionRes = await Transaction.aggregate([
			{
				$facet: {
					previousPeriod: [
						// Transactions before startDate
						{
							$match: {
								user: user._id,
								date: {
									$lt: start_date,
								},
							},
						},
						{
							$group: {
								_id: null,
								totalPreviousSpend: { $sum: "$amount" },
								totalPreviousTransactionCount: { $sum: 1 },
							},
						},
						{
							$project: {
								_id: 0,
							},
						},
					],
					currentPeriod: [
						// Transactions between start_date and end_date
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
								totalSpend: { $sum: "$amount" },
								totalTransactionCount: { $sum: 1 },
							},
						},
						{
							$project: {
								_id: 0,
							},
						},
					],
					data: [
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
								_id: {
									$dateToString: {
										format: "%Y-%m-%d",
										date: "$date",
									},
								},
								spend: { $sum: "$amount" },
								count: { $sum: 1 },
							},
						},
						{
							$project: {
								_id: 0,
								date: "$_id",
								spend: 1,
								count: 1,
							},
						},
						{
							$sort: {
								date: 1,
							},
						},
					],
				},
			},
		]);

		const spendMoney = isEmpty(transactionRes[0]?.currentPeriod[0])
			? 0
			: transactionRes[0]?.currentPeriod[0]?.totalSpend;
		const spendPrevMoney = isEmpty(transactionRes[0]?.previousPeriod[0])
			? 0
			: transactionRes[0]?.previousPeriod[0]?.totalPreviousSpend;
		const spendDelta =
			spendPrevMoney != 0 ? (spendMoney * 100) / spendPrevMoney : 0;

		const transCount = isEmpty(transactionRes[0]?.currentPeriod[0])
			? 0
			: transactionRes[0]?.currentPeriod[0]?.totalTransactionCount;
		const transPrevCount = isEmpty(transactionRes[0]?.previousPeriod[0])
			? 0
			: transactionRes[0]?.previousPeriod[0]
					?.totalPreviousTransactionCount;
		const transDelta =
			transPrevCount != 0 ? (transCount * 100) / transPrevCount : 0;

		// Calculate Spend and Transaction Info from Transaction DB
		const items = await Item.find({ user: user._id });
		const getTotalDebtInfoPromises = items?.map(async (item) => {
			const res = await getLiabilitiesByToken(item.ACCESS_TOKEN);
			const kpis = calculateKPIs(res);
			const totalMonthlyPayments = calculateTotalMonthlyPayments(res);
			const netWorth = calculateNetWorth(res);
			const creditUtilization = calculateCreditUtilization(res);
			return {
				kpis,
				totalMonthlyPayments,
				netWorth,
				creditUtilization,
			};
		});

		const infos = await Promise.all(getTotalDebtInfoPromises);
		const totalInfos = infos.reduce(
			(acc, currValue) => ({
				kpis: {
					totalDebt: (acc.kpis.totalDebt = currValue.kpis.totalDebt),
					totalAvailableCredit: (acc.kpis.totalAvailableCredit =
						currValue.kpis.totalAvailableCredit),
					totalSpend: (acc.kpis.totalSpend =
						currValue.kpis.totalSpend),
					totalCurrentBalance: (acc.kpis.totalCurrentBalance =
						currValue.kpis.totalCurrentBalance),
				},
				totalMonthlyPayments: (acc.totalMonthlyPayments =
					currValue.totalMonthlyPayments),
				netWorth: (acc.netWorth = currValue.netWorth),
				creditUtilization: (acc.creditUtilization =
					currValue.creditUtilization),
			}),
			{
				kpis: {
					totalDebt: 0,
					totalAvailableCredit: 0,
					totalSpend: 0,
					totalCurrentBalance: 0,
				},
				totalMonthlyPayments: 0,
				netWorth: 0,
				creditUtilization: 0,
			}
		);

		const kpis = [
			{
				title: "Spend",
				metric: spendMoney + spendPrevMoney,
				metricPrev: spendPrevMoney,
				delta: spendDelta.toFixed(2),
				text: "Some Text Information related to Spend money",
				type: "$ ",
			},
			{
				title: "Dept",
				metric: totalInfos.kpis.totalDebt,
				text: "Some Text Information related to Spend money",
				type: "$ ",
			},
			{
				title: "Transaction Count",
				metric: transCount + transPrevCount,
				metricPrev: transPrevCount,
				delta: transDelta.toFixed(2),
				text: "Some Text Information related to Transactions",
				type: "",
			},
			{
				title: "Total Available Credit",
				metric: totalInfos.kpis.totalAvailableCredit,
				text: "Some Text Information related to Transactions",
				type: "$ ",
			},
			{
				title: "Monthly Payments",
				metric: totalInfos.totalMonthlyPayments,
				text: "Some Text Information related to Spend money",
				type: "$ ",
			},
			{
				title: "Net Worth",
				metric: totalInfos.netWorth,
				text: "Some Text Information related to Spend money",
				type: "$ ",
			},
			{
				title: "Credit Utilization",
				metric: totalInfos.creditUtilization,
				text: "Some Text Information related to Spend money",
				type: "$ ",
			},
		];

		return res.send({ kpis, data: transactionRes[0]?.data });
	} catch (error) {
		handleError(error);
	}
};
