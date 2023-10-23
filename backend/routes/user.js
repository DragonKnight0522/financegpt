const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const {
	getUserInfo,
	deleteItemInfoById,
	deleteUserAccount,
	updateUserAccount,
	handleGetDashboard,
	handleGetChartInfo,
	handleGetAllUsers,
	setUserPayByEmail,
} = require("../controllers/user");

router.get("/", authMiddleware, getUserInfo);

router.delete("/item/:id", authMiddleware, deleteItemInfoById);

router.delete("/", authMiddleware, deleteUserAccount);

router.post("/", authMiddleware, updateUserAccount);

router.get("/dashboard", authMiddleware, handleGetDashboard);

router.post("/charts", authMiddleware, handleGetChartInfo);

router.post("/users", authMiddleware, adminMiddleware, handleGetAllUsers);

router.post("/users/pay", authMiddleware, adminMiddleware, setUserPayByEmail);

module.exports = router;
