const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const {
	getAIMessage,
	getChatInfo,
	deleteChatChannel,
	updateChatChannelTitle,
} = require("../controllers/chat");

router.get("/", authMiddleware, getChatInfo);

router.post("/", authMiddleware, getAIMessage);

router.delete("/:id", authMiddleware, deleteChatChannel);

router.post("/title", authMiddleware, updateChatChannelTitle);

module.exports = router;
