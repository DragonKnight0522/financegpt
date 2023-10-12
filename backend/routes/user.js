const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const {
	getUserInfo,
	deleteItemInfoById,
	deleteUserAccount,
	updateUserAccount,
	handleGetDashboard
} = require("../controllers/user");

router.get("/", authMiddleware, getUserInfo);

router.delete("/item/:id", authMiddleware, deleteItemInfoById);

router.delete("/", authMiddleware, deleteUserAccount);

router.post("/", authMiddleware, updateUserAccount);

router.post("/dashboard", authMiddleware, handleGetDashboard);

module.exports = router;
