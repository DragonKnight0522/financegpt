const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { handleError, isEmpty } = require("../utils/util");
const { getConnection } = require("../config/mongodb");

exports.getChatInfo = async (req, res, next) => {
	try {
		const { user } = req;
		const { Chat } = getConnection(user._id);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		let chatHistory = await Chat.find({ user: user._id });
		return res.send({ chatHistory });
	} catch (error) {
		handleError(error);
	}
};

exports.getAIMessage = async (req, res, next) => {
	try {
		const { user } = req;
		const { message, _id, title } = req.body;
		const { Chat } = getConnection(user._id);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		let chatChannel;
		if (isEmpty(_id)) {
			chatChannel = await new Chat().save();
		} else {
			chatChannel = await Chat.findById(_id);
		}
		// const aiResponse = await getResponseOpenAI();
		const aiResponse =
			"This is long sen open ai response about " +
			message +
			"\n the second paragraph is also here" +
			"\n the third paragraph is also here";
		chatChannel.title = title;
		chatChannel.user = user._id;
		chatChannel.chat.push({ role: 1, message });
		chatChannel.chat.push({ role: 0, message: aiResponse });
		await chatChannel.save();

		return res.send({
			message: aiResponse,
			_id: chatChannel._id,
		});
	} catch (error) {
		handleError(error);
	}
};

exports.deleteChatChannel = async (req, res, next) => {
	try {
		const { user } = req;
		const { id } = req.params;
		const { Chat } = getConnection(user._id);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		if (id == "all")
			await Chat.deleteMany({ user: new ObjectId(user._id) });
		else await Chat.findByIdAndDelete(id);
		res.json("success");
	} catch (error) {
		handleError(error);
	}
};

exports.updateChatChannelTitle = async (req, res, next) => {
	try {
		const { user } = req;
		const { _id, title } = req.body;
		const { Chat } = getConnection(user._id);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		await Chat.findByIdAndUpdate(_id, { title });
		res.json("success");
	} catch (error) {
		handleError(error);
	}
};
