import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
	user: {
		// reference to User model
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	chat: [{ role: Number, message: String }],
	title: String,
});

export default mongoose.models.Chat ||mongoose.model("Chat", chatSchema);
