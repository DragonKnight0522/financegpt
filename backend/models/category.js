const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
	category_id: {
		type: String,
		required: true,
	},
	group: {
		type: String,
		required: true,
	},
	hierarchy: [String],
});

module.exports = mongoose.model("Category", categorySchema);
