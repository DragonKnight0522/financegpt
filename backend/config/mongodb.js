const mongoose = require("mongoose");

mongoose
	.connect(process.env.MONGO_URL, { useNewUrlParser: true })
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch(() => {
		console.log("Couldn't connect to MongoDB");
	});
