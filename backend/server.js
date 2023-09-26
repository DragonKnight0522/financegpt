const express = require("express");
const bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");

const app = express();

// Mongodb configuration
require("./config/mongodb");

// Routes
const authRoutes = require("./routes/auth");
const plaidRoutes = require("./routes/plaid");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const transactionRoutes = require("./routes/transaction");

// Middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plaid", plaidRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Listen on provided port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
