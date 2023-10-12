exports.PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
exports.PLAID_SECRET = process.env.PLAID_SECRET;
exports.PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
exports.PLAID_PRODUCTS = (
	process.env.PLAID_PRODUCTS || Products.Transactions
).split(",");

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
exports.PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(
	","
);

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
exports.PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
exports.PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";