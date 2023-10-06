import { Configuration, PlaidApi, Products, PlaidEnvironments } from "plaid";
import { isEmpty } from "@/utils/util";

export const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
export const PLAID_SECRET = process.env.PLAID_SECRET;
export const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
export const PLAID_PRODUCTS = (
	process.env.PLAID_PRODUCTS || Products.Transactions
).split(",");

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
export const PLAID_COUNTRY_CODES = (
	process.env.PLAID_COUNTRY_CODES || "US"
).split(",");

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
export const PLAID_ANDROID_PACKAGE_NAME =
	process.env.PLAID_ANDROID_PACKAGE_NAME || "";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
export let ACCESS_TOKEN = null;
export let PUBLIC_TOKEN = null;
export let ITEM_ID = null;
// The payment_id is only relevant for the UK/EU Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store along with the Payment metadata, such as userId .
export let PAYMENT_ID = null;
// // The transfer_id is only relevant for Transfer ACH product.
// // We store the transfer_id in memory - in production, store it in a secure
// // persistent data store
// let TRANSFER_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

const configuration = new Configuration({
	basePath: PlaidEnvironments[PLAID_ENV],
	baseOptions: {
		headers: {
			"PLAID-CLIENT-ID": PLAID_CLIENT_ID,
			"PLAID-SECRET": PLAID_SECRET,
			"Plaid-Version": "2020-09-14",
		},
	},
});

let clientCached = null;

export const plaidClient = isEmpty(clientCached)
	? new PlaidApi(configuration)
	: clientCached;

export const getLiabilitiesByToken = async (ACCESS_TOKEN) => {
	const liabilitiesResponse = await plaidClient.liabilitiesGet({
		access_token: ACCESS_TOKEN,
	});
	return liabilitiesResponse.data;
};

export const calculateKPIs = (apiResponse) => {
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
export const calculateTotalMonthlyPayments = (apiResponse) => {
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
export const calculateNetWorth = (apiResponse) => {
	const { totalDebt, totalCurrentBalance } = calculateKPIs(apiResponse);

	return totalCurrentBalance - totalDebt;
};

// Define function to calculate credit utilization ratio
export const calculateCreditUtilization = (apiResponse) => {
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

// This is a helper function to authorize and create a Transfer after successful
// exchange of a public_token for an access_token. The TRANSFER_ID is then used
// to obtain the data about that particular Transfer.

export const authorizeAndCreateTransfer = async (client, accessToken) => {
	// We call /accounts/get to obtain first account_id - in production,
	// account_id's should be persisted in a data store and retrieved
	// from there.
	const accountsResponse = await client.accountsGet({
		access_token: accessToken,
	});
	const accountId = accountsResponse.data.accounts[0].account_id;

	const transferAuthorizationResponse =
		await client.transferAuthorizationCreate({
			access_token: accessToken,
			account_id: accountId,
			type: "credit",
			network: "ach",
			amount: "1.34",
			ach_class: "ppd",
			user: {
				legal_name: "FirstName LastName",
				email_address: "foobar@email.com",
				address: {
					street: "123 Main St.",
					city: "San Francisco",
					region: "CA",
					postal_code: "94053",
					country: "US",
				},
			},
		});
	const authorizationId = transferAuthorizationResponse.data.authorization.id;

	const transferResponse = await client.transferCreate({
		access_token: accessToken,
		account_id: accountId,
		authorization_id: authorizationId,
		description: "Payment",
	});
	return transferResponse.data.transfer.id;
};
