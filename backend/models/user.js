const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	// Basic user info from Google OAuth. These are mandatory.
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		index: true,
	},

	// More detailed user info from Google OAuth. These are optional.
	family_name: String,
	given_name: String,
	image: String,
	locale: {
		type: String,
		default: "en",
	},

	// User setting information input by the user directly into the application
	country: String,
	state: String,
	city: String,
	salary: { type: Number },
	payday: { type: Number },
	openAiKey: String,

	// Information regarding the current selected plaid API
	ACCESS_TOKEN: String,
	ITEM_ID: String,
	TRANSFER_ID: String,
});

module.exports = mongoose.model("User", userSchema);