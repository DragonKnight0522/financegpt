import mongoose from "mongoose";
import ChatModel from "@/models/chat";
import TransactionModel from "@/models/transaction";
import LiabilityModel from "@/models/liability";
import { isEmpty } from "@/utils/util";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
	throw new Error(
		"Please define the MONGO_URL environment variable inside .env.local"
	);
}

let cached = { conn: null, promise: null };

let connections = {};

export const ObjectId = mongoose.Types.ObjectId;

export const dbConnect = async () => {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose.connect(MONGO_URL, opts);
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
};

export const getConnection = async (userId, mongoDBURL) => {
	if (checkConnection(userId)) return connections[userId];
	else {
		const res = await createConnection(userId, mongoDBURL);
		if (res !== 1) {
			console.log("Not Found Connection");
			return {};
		}
		return connections[userId];
	}
};

export const checkConnection = (userId) => {
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

export const createConnection = async (userId, mongoDBURL) => {
	return new Promise((resolve, reject) => {
		try {
			if (!isEmpty(connections[userId]))
				return resolve(connections[userId]?.conn?.readyState);

			const conn = mongoose.createConnection(mongoDBURL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});

			conn.on("connected", () => {
				console.log(
					"MongoDB Connection Established Successfully!",
					userId
				);
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
				console.error(
					`MongoDB Connection ${userId} Error: ${err.message}`
				);
				return resolve(conn.readyState);
			});

			conn.on("disconnected", () => {
				console.warn("MongoDB Connection Disconnected", userId);
				return resolve(conn.readyState);
			});
		} catch (e) {
			return resolve(e);
		}
	});
};
