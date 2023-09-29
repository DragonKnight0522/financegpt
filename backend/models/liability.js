const mongoose = require("mongoose");

const liabilitiesSchema = new mongoose.Schema({
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	credit: [
		{
			account_id: { type: String, required: true },
			aprs: [
				{
					apr_percentage: Number,
					apr_type: String,
					balance_subject_to_apr: Number,
					interest_charge_amount: Number,
				},
			],
			is_overdue: Boolean,
			last_payment_amount: Number,
			last_payment_date: Date,
			last_statement_issue_date: Date,
			last_statement_balance: Number,
			minimum_payment_amount: Number,
			next_payment_due_date: Date,
		},
	],
	mortgage: [
		{
			account_id: { type: String, required: true },
			account_number: String,
			current_late_fee: Number,
			escrow_balance: Number,
			has_pmi: Boolean,
			has_prepayment_penalty: Boolean,
			interest_rate: {
				percentage: Number,
				type: String,
			},
			last_payment_amount: Number,
			last_payment_date: Date,
			loan_term: String,
			loan_type_description: String,
			maturity_date: Date,
			next_monthly_payment: Number,
			next_payment_due_date: Date,
			origination_date: Date,
			origination_principal_amount: Number,
			past_due_amount: Number,
			property_address: {
				city: String,
				country: String,
				postal_code: String,
				region: String,
				street: String,
			},
			ytd_interest_paid: Number,
			ytd_principal_paid: Number,
		},
	],
	student: [
		{
			account_id: { type: String, required: true },
			account_number: String,
			disbursement_dates: [Date],
			expected_payoff_date: Date,
			guarantor: String,
			interest_rate_percentage: Number,
			is_overdue: Boolean,
			last_payment_amount: Number,
			last_payment_date: Date,
			last_statement_issue_date: Date,
			loan_name: String,
			loan_status: {
				end_date: Date,
				type: String,
			},
			minimum_payment_amount: Number,
			next_payment_due_date: Date,
			origination_date: Date,
			origination_principal_amount: Number,
			outstanding_interest_amount: Number,
			payment_reference_number: String,
			pslf_status: {
				estimated_eligibility_date: Date,
				payments_made: Number,
				payments_remaining: Number,
			},
			repayment_plan: {
				description: String,
				type: String,
			},
			sequence_number: String,
			servicer_address: {
				city: String,
				country: String,
				postal_code: String,
				region: String,
				street: String,
			},
			ytd_interest_paid: Number,
			ytd_principal_paid: Number,
		},
	],
});

module.exports = mongoose.model("Liability", liabilitiesSchema);
