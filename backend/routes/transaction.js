const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const {
	getTransaction,
} = require("../controllers/transaction");

router.post("/getData", authMiddleware, getTransaction);

module.exports = router;
