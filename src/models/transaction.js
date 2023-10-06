import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	account_id: { type: String, index: true },
	amount: { type: Number, index: true },
	iso_currency_code: String,
	unofficial_currency_code: String,
	category: { type: [String], index: true },
	category_id: String,
	check_number: String,
	date: { type: Date, index: true },
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
	payment_channel: { type: String, index: true },
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

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
