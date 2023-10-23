const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
	// same field
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	name: String,
	amount: { type: Number, index: true },
	account_id: { type: String, index: true },
	date: { type: Date, index: true },

	iso_currency_code: String,
	unofficial_currency_code: String,

	// only transaction fields
	category: { type: [String], index: true },
	payment_channel: { type: String, index: true },

	category_id: String,
	check_number: String,
	datetime: Date,
	authorized_date: Date,
	authorized_datetime: Date,
	location: {
		address: String,
		city: String,
		region: String,
		postal_code: String,
		country: String,
		lat: Number,
		lon: Number,
		store_number: String,
	},
	merchant_name: { type: String, index: true },
	payment_meta: {
		by_order_of: String,
		payee: String,
		payer: String,
		payment_method: String,
		payment_processor: String,
		ppd_id: String,
		reason: String,
		reference_number: String,
	},
	pending: Boolean,
	pending_transaction_id: String,
	personal_finance_category: {
		primary: String,
		detailed: String,
	},
	transaction_id: String,
	transaction_code: String,
	transaction_type: String,

	cancel_transaction_id: String,
	fees: Number,
	investment_transaction_id: String,
	price: Number,
	quantity: Number,
	security_id: String,
	subtype: String,
	type: String,
});

module.exports = mongoose.model("Transaction", transactionSchema);
