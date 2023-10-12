const {
	Configuration,
	PlaidApi,
	Products,
	PlaidEnvironments,
} = require("plaid");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const Category = require("../models/category");

const { prettyPrintResponse, handleError, isEmpty } = require("../utils/util");
const { PLAID_PRODUCTS, PLAID_COUNTRY_CODES } = require("../config/plaid");
const User = require("../models/user");
const Item = require("../models/item");
const mongoose = require("mongoose");
const { getConnection } = require("../config/mongodb");
const ObjectId = mongoose.Types.ObjectId;

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
// const PLAID_PRODUCTS = (
// 	process.env.PLAID_PRODUCTS || Products.Transactions
// ).split(",");

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
// const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
// 	","
// );

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
// let ACCESS_TOKEN = null;
// let PUBLIC_TOKEN = null;
// let ITEM_ID = null;
// The payment_id is only relevant for the UK/EU Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store along with the Payment metadata, such as userId .
let PAYMENT_ID = null;
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
const client = new PlaidApi(configuration);

exports.info = (req, res, next) => {
	return res.json({
		item_id: ITEM_ID,
		access_token: ACCESS_TOKEN,
		products: PLAID_PRODUCTS,
	});
};

exports.createLinkToken = async (request, response, next) => {
	try {
		const { user } = request;
		const configs = {
			user: {
				// This should correspond to a unique id for the current user.
				client_user_id: `id-${user.name}`,
			},
			client_name: user.name,
			products: PLAID_PRODUCTS,
			country_codes: PLAID_COUNTRY_CODES,
			language: user.locale,
		};

		if (PLAID_REDIRECT_URI !== "") {
			configs.redirect_uri = PLAID_REDIRECT_URI;
		}

		if (PLAID_ANDROID_PACKAGE_NAME !== "") {
			configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
		}
		const createTokenResponse = await client.linkTokenCreate(configs);

		return response.json(createTokenResponse.data);
	} catch (err) {
		handleError(err, response);
	}
};

// For exchange public token to access token
exports.setAccessToken = async (request, response, next) => {
	try {
		const { user } = request;
		const { public_token: PUBLIC_TOKEN, metadata } = request.body;
		const { institution_id } = metadata.institution;
		const accountIds = metadata.accounts.map((item) => item.id);

		const itemData = await Item.findOne({
			user: user._id,
			"institution.institution_id": institution_id,
			accounts: {
				$elemMatch: {
					account_id: { $in: accountIds },
				},
			},
		});

		if (itemData) {
			const updateData = {
				ACCESS_TOKEN: itemData.ACCESS_TOKEN,
				ITEM_ID: itemData.ITEM_ID,
				TRANSFER_ID: itemData.TRANSFER_ID,
			};

			await User.findByIdAndUpdate(user._id, updateData);

			return response.json({ isItemAccess: true, item_id: null });
		} else {
			const tokenResponse = await client.itemPublicTokenExchange({
				public_token: PUBLIC_TOKEN,
			});
			// prettyPrintResponse(tokenResponse);
			// Save it to database
			const ACCESS_TOKEN = tokenResponse.data.access_token;
			const ITEM_ID = tokenResponse.data.item_id;
			let TRANSFER_ID = null;
			if (PLAID_PRODUCTS.includes(Products.Transfer)) {
				TRANSFER_ID = await authorizeAndCreateTransfer(
					client,
					ACCESS_TOKEN
				);
			}

			await User.findByIdAndUpdate(user._id, {
				ACCESS_TOKEN,
				ITEM_ID,
				TRANSFER_ID,
			});
			const newAccounts = metadata.accounts.map((account) => ({
				account_id: account.id.toString(),
				name: account.name,
				mask: account.mask,
				subtype: account.subtype,
				type: account.type,
			}));
			const newItem = new Item({
				user: new ObjectId(user._id),
				accounts: newAccounts,
				institution: metadata.institution,
				ACCESS_TOKEN,
				ITEM_ID,
				TRANSFER_ID,
			});
			await newItem.save();

			return response.json({ isItemAccess: true, item_id: newItem._id });
		}
	} catch (err) {
		return handleError(err, response);
	}
};

exports.auth = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const authResponse = await client.authGet({
				access_token: ACCESS_TOKEN,
			});
			prettyPrintResponse(authResponse);
			response.json(authResponse.data);
		})
		.catch(next);
};

exports.transactions = async (request, response, next) => {
	try {
		const { user } = request;
		const { Transaction } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Transaction))
			return response
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		// get
		const item = await Item.findOne({
			user: user._id,
			ACCESS_TOKEN: user.ACCESS_TOKEN,
		});

		// Set cursor to empty to receive all historical updates
		let cursor = isEmpty(item?.cursor) ? null : item.cursor;
		// New transaction updates since "cursor"
		let added = [];
		let modified = [];
		// Removed transaction ids
		let removed = [];
		let hasMore = true;
		// Iterate through each page of new transaction updates for item
		while (hasMore) {
			const request = {
				access_token: user.ACCESS_TOKEN,
				cursor: cursor,
			};
			const res = await client.transactionsSync(request);
			const data = res.data;
			// Add this page of results
			added = added.concat(data.added);
			modified = modified.concat(data.modified);
			removed = removed.concat(data.removed);
			hasMore = data.has_more;
			// Update cursor to the next cursor
			cursor = data.next_cursor;
		}

		// Update cursor for next new transaction
		item.cursor = cursor;
		await item.save();

		let addedData = added.map((added) => {
			added.user = user._id;
			return added;
		});
		await Transaction.insertMany(addedData);

		const updatePromises = modified.map((transaction) =>
			Transaction.findOneAndUpdate(
				{
					user: user._id,
					transaction_id: transaction.transaction_id,
				},
				transaction
			)
		);
		await Promise.all(updatePromises);

		let removeItemIds = removed.map((removed) => removed.transaction_id);
		await Transaction.deleteMany({
			user: user._id,
			transaction_id: { $in: removeItemIds },
		});
		return response.json({
			added: added.length,
			modified: modified.length,
			removed: removed.length,
			updated:
				added.length > 0 || modified.length > 0 || removed.length > 0,
		});
	} catch (error) {
		handleError(error);
	}
};

exports.investmentTransactions = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const startDate = moment()
				.subtract(30, "days")
				.format("YYYY-MM-DD");
			const endDate = moment().format("YYYY-MM-DD");
			const configs = {
				access_token: ACCESS_TOKEN,
				start_date: startDate,
				end_date: endDate,
			};
			const investmentTransactionsResponse =
				await client.investmentsTransactionsGet(configs);
			prettyPrintResponse(investmentTransactionsResponse);
			response.json({
				error: null,
				investments_transactions: investmentTransactionsResponse.data,
			});
		})
		.catch(next);
};

exports.identity = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const identityResponse = await client.identityGet({
				access_token: ACCESS_TOKEN,
			});
			prettyPrintResponse(identityResponse);
			response.json({ identity: identityResponse.data.accounts });
		})
		.catch(next);
};
// Retrieve real-time balance information
exports.balance = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const balanceResponse = await client.accountsBalanceGet({
				access_token: ACCESS_TOKEN,
			});
			prettyPrintResponse(balanceResponse);
			response.json(balanceResponse.data);
		})
		.catch(next);
};

exports.holdings = async (request, response, next) => {
	try {
		const holdingsResponse = await client.investmentsHoldingsGet({
			access_token: ACCESS_TOKEN,
		});
		prettyPrintResponse(holdingsResponse);
		response.json({ error: null, holdings: holdingsResponse.data });
	} catch (err) {
		return handleError(err, response);
	}
};

exports.liabilities = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const liabilitiesResponse = await client.liabilitiesGet({
				access_token: ACCESS_TOKEN,
			});
			prettyPrintResponse(liabilitiesResponse);
			response.json({
				error: null,
				liabilities: liabilitiesResponse.data,
			});
		})
		.catch(next);
};

exports.item = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			// Pull the Item - this includes information about available products,
			// billed products, webhook information, and more.
			const itemResponse = await client.itemGet({
				access_token: ACCESS_TOKEN,
			});
			// Also pull information about the institution
			const configs = {
				institution_id: itemResponse.data.item.institution_id,
				country_codes: PLAID_COUNTRY_CODES,
			};
			const instResponse = await client.institutionsGetById(configs);
			prettyPrintResponse(itemResponse);
			response.json({
				item: itemResponse.data.item,
				institution: instResponse.data.institution,
			});
		})
		.catch(next);
};

exports.accounts = async (request, response, next) => {
	try {
		const { user } = request;
		const items = await Item.find({ user: user._id });

		const getAccountAndUpdate = items.map(async (item) => {
			const accountsResponse = await client.accountsGet({
				access_token: item.ACCESS_TOKEN,
			});
			item.accounts = accountsResponse.data.accounts;

			// Save the updates and return the updated item
			const updatedItem = await item.save();
			return updatedItem;
		});

		// Wait for all updates to finish and collect the updated items
		const updatedItems = await Promise.all(getAccountAndUpdate);
		response.json(updatedItems);
	} catch (err) {
		handleError(err);
	}
};

exports.getUserAccountInfo = async (access_token) => {
	const accountsResponse = await client.accountsGet({
		access_token,
	});
	return accountsResponse.data;
};

exports.asserts = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			// You can specify up to two years of transaction history for an Asset
			// Report.
			const daysRequested = 10;

			// The `options` object allows you to specify a webhook for Asset Report
			// generation, as well as information that you want included in the Asset
			// Report. All fields are optional.
			const options = {
				client_report_id: "Custom Report ID #123",
				// webhook: 'https://your-domain.tld/plaid-webhook',
				user: {
					client_user_id: "Custom User ID #456",
					first_name: "Alice",
					middle_name: "Bobcat",
					last_name: "Cranberry",
					ssn: "123-45-6789",
					phone_number: "555-123-4567",
					email: "alice@example.com",
				},
			};
			const configs = {
				access_tokens: [ACCESS_TOKEN],
				days_requested: daysRequested,
				options,
			};
			const assetReportCreateResponse = await client.assetReportCreate(
				configs
			);
			prettyPrintResponse(assetReportCreateResponse);
			const assetReportToken =
				assetReportCreateResponse.data.asset_report_token;
			const getResponse = await getAssetReportWithRetries(
				client,
				assetReportToken
			);
			const pdfRequest = {
				asset_report_token: assetReportToken,
			};

			const pdfResponse = await client.assetReportPdfGet(pdfRequest, {
				responseType: "arraybuffer",
			});
			prettyPrintResponse(getResponse);
			prettyPrintResponse(pdfResponse);
			response.json({
				json: getResponse.data.report,
				pdf: pdfResponse.data.toString("base64"),
			});
		})
		.catch(next);
};

exports.transfer = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const transferGetResponse = await client.transferGet({
				transfer_id: TRANSFER_ID,
			});
			prettyPrintResponse(transferGetResponse);
			response.json({
				error: null,
				transfer: transferGetResponse.data.transfer,
			});
		})
		.catch(next);
};

exports.payment = async (request, response, next) => {
	try {
		const paymentGetResponse = await client.paymentInitiationPaymentGet({
			payment_id: PAYMENT_ID,
		});
		prettyPrintResponse(paymentGetResponse);
		response.json({ error: null, payment: paymentGetResponse.data });
	} catch (err) {
		return handleError(err, response);
	}
};

exports.incomeVerification = (request, response, next) => {
	Promise.resolve()
		.then(async function () {
			const paystubsGetResponse =
				await client.incomeVerificationPaystubsGet({
					access_token: ACCESS_TOKEN,
				});
			prettyPrintResponse(paystubsGetResponse);
			response.json({ error: null, paystubs: paystubsGetResponse.data });
		})
		.catch(next);
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.

const getAssetReportWithRetries = (
	client,
	asset_report_token,
	ms = 1000,
	retriesLeft = 20
) =>
	new Promise((resolve, reject) => {
		const request = {
			asset_report_token,
		};

		client
			.assetReportGet(request)
			.then(resolve)
			.catch(() => {
				setTimeout(() => {
					if (retriesLeft === 1) {
						reject(
							"Ran out of retries while polling for asset report"
						);
						return;
					}
					getAssetReportWithRetries(
						client,
						asset_report_token,
						ms,
						retriesLeft - 1
					).then(resolve);
				}, ms);
			});
	});

// This is a helper function to authorize and create a Transfer after successful
// exchange of a public_token for an access_token. The TRANSFER_ID is then used
// to obtain the data about that particular Transfer.

const authorizeAndCreateTransfer = async (client, accessToken) => {
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
	prettyPrintResponse(transferAuthorizationResponse);
	const authorizationId = transferAuthorizationResponse.data.authorization.id;

	const transferResponse = await client.transferCreate({
		access_token: accessToken,
		account_id: accountId,
		authorization_id: authorizationId,
		description: "Payment",
	});
	prettyPrintResponse(transferResponse);
	return transferResponse.data.transfer.id;
};

// Get All Categories stored in the firestore. If it doesn't exist then get all categories from plaid api.

exports.getAllCategories = async (req, res) => {
	try {
		let categories = await Category.find();

		if (categories.length === 0) {
			const response = await client.categoriesGet({});
			categories = response.data.categories;

			// Save the categories to MongoDB using Mongoose
			await Category.insertMany(categories);
		}

		return res.json({ categories });
	} catch (error) {
		handleError(error);
	}
};

exports.getLiabilitiesByToken = async (ACCESS_TOKEN) => {
	const liabilitiesResponse = await client.liabilitiesGet({
		access_token: ACCESS_TOKEN,
	});
	return liabilitiesResponse.data;
};
