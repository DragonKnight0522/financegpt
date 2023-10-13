const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
	id: String,
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	title: String,
	messages: [{ role: String, content: String }],
	path: String,
	createdAt: Date,
});

module.exports = mongoose.model("Chat", chatSchema);
