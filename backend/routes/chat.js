const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const {
	getAIMessage,
	getChatInfo,
	getChatInfoById,
	deleteChatChannel,
	updateChatChannelTitle,
} = require("../controllers/chat");

router.get("/", authMiddleware, getChatInfo);

router.get("/:id", authMiddleware, getChatInfoById);

router.post("/", authMiddleware, getAIMessage);

router.delete("/:id", authMiddleware, deleteChatChannel);

router.post("/title", authMiddleware, updateChatChannelTitle);

module.exports = router;
