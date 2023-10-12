const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const { signin } = require("../controllers/auth");

router.post("/signin", signin);

module.exports = router;
