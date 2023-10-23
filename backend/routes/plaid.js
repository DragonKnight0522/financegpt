const express = require("express");
const router = express.Router();

const {
	info,
	createLinkToken,
	setAccessToken,
	auth,
	transactions,
	investmentTransactions,
	identity,
	balance,
	holdings,
	liabilities,
	item,
	accounts,
	asserts,
	transfer,
	payment,
	incomeVerification,
	getAllCategories,
	transactionsSyncAll,
} = require("../controllers/plaid");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/info", info);

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
router.get("/create_link_token", authMiddleware, createLinkToken);

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
router.post("/set_access_token", authMiddleware, setAccessToken);

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
router.get("/auth", authMiddleware, auth);

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
router.get("/transactions", authMiddleware, transactions);

// Retrieve Investment Transactions for an Item
// https://plaid.com/docs/#investments
router.get("/investments_transactions", investmentTransactions);

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
router.get("/identity", identity);

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
router.get("/balance", balance);

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
router.get("/holdings", holdings);

// Retrieve Liabilities for an Item
// https://plaid.com/docs/#liabilities
router.get("/liabilities", liabilities);

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
router.get("/item", item);

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
router.get("/accounts", authMiddleware, accounts);

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
router.get("/assets", asserts);

router.get("/transfer", transfer);

// This functionality is only relevant for the UK/EU Payment Initiation product.
// Retrieve Payment for a specified Payment ID
router.get("/payment", payment);

// This endpoint is still supported but is no longer recommended
// For Income best practices, see https://github.com/plaid/income-sample instead
router.get("/income/verification/paystubs", incomeVerification);

router.get("/categories", getAllCategories);

// Retrieve Transactions for all Item
router.get("/transactions/all", authMiddleware, transactionsSyncAll);

module.exports = router;
