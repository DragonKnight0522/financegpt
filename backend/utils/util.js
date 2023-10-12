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
	// console.log(error);
	return res.status(500).json({ error });
};

const calculateKPIs = (apiResponse) => {
	let totalDebt = 0.0;
	let totalAvailableCredit = 0.0;
	let totalSpend = 0.0;
	let totalCurrentBalance = 0.0;

	apiResponse.accounts.forEach((account) => {
		const { available, current, limit } = account.balances;

		totalCurrentBalance += current || 0;

		if (account.type === "loan") {
			totalDebt += current;
		}

		if (account.type === "credit") {
			totalSpend += current;
			if (limit !== null) {
				totalAvailableCredit += limit;
			}
		}
	});

	return {
		totalDebt,
		totalAvailableCredit,
		totalSpend,
		totalCurrentBalance,
	};
};

// Define function to calculate total monthly payment obligations
const calculateTotalMonthlyPayments = (apiResponse) => {
	let totalMonthlyPayments = 0.0;

	apiResponse.liabilities?.credit?.forEach((credit) => {
		totalMonthlyPayments += credit.minimum_payment_amount;
	});

	apiResponse.liabilities?.mortgage?.forEach((mortgage) => {
		totalMonthlyPayments += mortgage.next_monthly_payment;
	});

	apiResponse.liabilities?.student?.forEach((student) => {
		totalMonthlyPayments += student.minimum_payment_amount;
	});

	return totalMonthlyPayments;
};

// Define function to calculate net worth
const calculateNetWorth = (apiResponse) => {
	const { totalDebt, totalCurrentBalance } = calculateKPIs(apiResponse);

	return totalCurrentBalance - totalDebt;
};

// Define function to calculate credit utilization ratio
const calculateCreditUtilization = (apiResponse) => {
	let totalCreditLimit = 0.0;
	let totalSpend = 0.0;

	apiResponse.accounts.forEach((account) => {
		if (account.type === "credit" && account.balances.limit !== null) {
			totalCreditLimit += account.balances.limit;
			totalSpend += account.balances.current;
		}
	});

	return totalCreditLimit > 0
		? ((totalSpend / totalCreditLimit) * 100).toFixed(2)
		: 0;
};

module.exports = {
	prettyPrintResponse,
	handleError,
	isEmpty,
	calculateKPIs,
	calculateTotalMonthlyPayments,
	calculateNetWorth,
	calculateCreditUtilization,
};
