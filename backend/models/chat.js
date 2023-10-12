const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	chat: [{ role: Number, message: String }],
	title: String,
});

module.exports = mongoose.model("Chat", chatSchema);
