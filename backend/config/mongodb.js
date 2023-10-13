const mongoose = require("mongoose");
const ChatModel = require("../models/chat");
const TransactionModel = require("../models/transaction");
const LiabilityModel = require("../models/liability");
const { isEmpty } = require("../utils/util");

mongoose
	.connect(process.env.MONGO_URL, { useNewUrlParser: true })
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch(() => {
		console.log("Couldn't connect to MongoDB");
	});

let connections = {};

const createConnection = async (userId, mongoDBURL) => {
	return new Promise((resolve, reject) => {
		try {
			if (!isEmpty(connections[userId]))
				return resolve(connections[userId]?.conn?.readyState);

			const conn = mongoose.createConnection(mongoDBURL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});

			conn.on("connected", () => {
				// console.log(
				// 	"MongoDB Connection Established Successfully!",
				// 	userId
				// );
				const Chat = conn.model("Chat", ChatModel.schema);
				const Transaction = conn.model(
					"Transaction",
					TransactionModel.schema
				);
				const Liability = conn.model(
					"Liability",
					LiabilityModel.schema
				);
				connections[userId] = { conn, Chat, Transaction, Liability };
				return resolve(conn.readyState);
			});

			conn.on("error", (err) => {
				// console.error(
				// 	`MongoDB Connection ${userId} Error: ${err.message}`
				// );
				return resolve(conn.readyState);
			});

			conn.on("disconnected", () => {
				// console.warn("MongoDB Connection Disconnected", userId);
				return resolve(conn.readyState);
			});
		} catch (e) {
			return resolve(e);
		}
	});
};

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection", reason);
});

const getConnection = async (userId, mongoDBURL) => {
	if (checkConnection(userId)) return connections[userId];
	else {
		// console.log("Not Found Connection, Recreating connection");
		const res = await createConnection(userId, mongoDBURL);
		if (res !== 1) {
			// console.log("Recreating failed");
			return {};
		}
		// console.log("Recreating success");
		return connections[userId];
	}
};

const checkConnection = (userId) => {
	if (isEmpty(connections[userId])) return false;
	else {
		const { conn } = connections[userId];
		if (conn.readyState === 1) return true;
		else {
			delete connections[userId];
			return false;
		}
	}
};

module.exports = {
	connections,
	createConnection,
	getConnection,
	checkConnection,
};
