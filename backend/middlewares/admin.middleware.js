const User = require("../models/user");

module.exports = async (req, res, next) => {
	if (req.user.email === process.env.ADMIN_EMAIL) {
		next();
	} else {
		console.log("Authorization header is not Admin");
		res.sendStatus(401);
	}
};
