import mongoose from "mongoose";

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

export default mongoose.models.Category ||
	mongoose.model("Category", categorySchema);
