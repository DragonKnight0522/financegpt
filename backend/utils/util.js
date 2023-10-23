const util = require("util");

const prettyPrintResponse = (response) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

const isEmpty = (value) =>
	value === undefined ||
	value === null ||
	(typeof value === "object" && Object.keys(value).length === 0) ||
	(typeof value === "string" && value.trim().length === 0);

const handleError = (error, res) => {
	console.log(error);
	return res.status(500).json({ error });
};

const calculateKPIs = (apiResponse) => {
	let totalCurrentBalance = 0.0;
	let mainContributor = "";
	let mainContributorBalance = 0;
	let totalDebt = 0.0;
	let totalAvailableCredit = 0.0;
	let totalSpend = 0.0;
	let maxCreditLimit = 0.0;

	apiResponse.accounts.forEach((account) => {
		let { available, current, limit } = account.balances;
		if (available == null) available = 0;
		if (current == null) current = 0;
		if (limit == null) limit = 0;

		

		if (account.type === "savings" || account.type == "investment" || account.type === "depository") {
			totalCurrentBalance += available;
		}

		if (current > mainContributorBalance) {
			mainContributorBalance = available;
			mainContributor = account;
			mainContributor.totalCurrentBalance = current;
		}

		if (account.type === "loan") {
			totalDebt += current;
		}

		if (account.type === "credit") {
			maxCreditLimit += limit;
			totalSpend += current;
			totalAvailableCredit += available;
		}

	});

	return {
		totalCurrentBalance,
		mainContributor,
		totalDebt,
		totalAvailableCredit,
		totalSpend,
		maxCreditLimit,
	};
};

// Define function to calculate net worth
const calculateNetWorth = (apiResponse) => {
	const { totalDebt, totalCurrentBalance } = calculateKPIs(apiResponse);

	return totalCurrentBalance - totalDebt;
};

module.exports = {
	prettyPrintResponse,
	handleError,
	isEmpty,
	calculateKPIs,
	calculateNetWorth,
};
