import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	institution: {
		institution_id: String,
		name: String,
	},
	accounts: [
		{
			account_id: {
				type: String,
				required: true,
			},
			balances: {
				available: { type: Number, default: 0 },
				current: { type: Number, default: 0 },
				iso_currency_code: { type: String, default: "USD" },
				limit: Number,
				unofficial_currency_code: String,
			},
			mask: String,
			name: String,
			official_name: String,
			persistent_account_id: String,
			subtype: String,
			type: { type: String },
		},
	],
	cursor: String,
	ACCESS_TOKEN: String,
	ITEM_ID: String,
	TRANSFER_ID: String,
});

export default mongoose.models.Item || mongoose.model("Item", itemSchema);
