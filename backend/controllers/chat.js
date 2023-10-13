const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { handleError, isEmpty } = require("../utils/util");
const { getConnection } = require("../config/mongodb");

exports.getChatInfo = async (req, res, next) => {
	try {
		const { user } = req;
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		let chatHistory = await Chat.find({ user: user._id });
		return res.send(chatHistory);
	} catch (error) {
		handleError(error);
	}
};

exports.getChatInfoById = async (req, res, next) => {
	try {
		const { user } = req;
		const { id } = req.params;
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		let chatHistory = await Chat.findOne({ user: user._id, id });
		return res.send(chatHistory);
	} catch (error) {
		handleError(error);
	}
};

exports.getAIMessage = async (req, res, next) => {
	try {
		const { user } = req;
		const { messages, previewToken, id } = req.body;
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		const aiResponse = "well done! ";
		res.write(aiResponse);

		const title = messages[0].content.substring(0, 100);
		const createdAt = Date.now();
		const path = `/dashboard/chat/${id}`;
		const payload = {
			id,
			title,
			user: user._id,
			createdAt,
			path,
			messages: [
				...messages,
				{
					content: aiResponse,
					role: "assistant",
				},
			],
		};

		await Chat.findOneAndUpdate(
			{ id },
			{ $setOnInsert: payload },
			{
				new: true,
				upsert: true,
			}
		);

		res.write(aiResponse);
		return res.end();
	} catch (error) {
		handleError(error, res);
	}
};

exports.deleteChatChannel = async (req, res, next) => {
	try {
		const { user } = req;
		const { id } = req.params;
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
		if (isEmpty(Chat))
			return res
				.status(403)
				.json({ message: "Personal Database Connection Error" });

		if (id == "all")
			await Chat.deleteMany({ user: new ObjectId(user._id) });
		else await Chat.deleteMany({ id });
		res.json("success");
	} catch (error) {
		handleError(error);
	}
};

exports.updateChatChannelTitle = async (req, res, next) => {
	try {
		const { user } = req;
		const { _id, title } = req.body;
		const { Chat } = await getConnection(user._id, user.mongoDBURL);
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
