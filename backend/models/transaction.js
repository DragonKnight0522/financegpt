const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	account_id: String,
	amount: Number,
	iso_currency_code: String,
	unofficial_currency_code: String,
	category: [String],
	category_id: String,
	check_number: String,
	date: Date,
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
	name: String,
	merchant_name: String,
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
	payment_channel: String,
	pending: Boolean,
	pending_transaction_id: String,
	personal_finance_category: {
		primary: String,
		detailed: String,
	},
	transaction_id: String,
	transaction_code: String,
	transaction_type: String,
});

module.exports = mongoose.model("Transaction", transactionSchema);
