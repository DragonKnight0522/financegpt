const User = require("../models/user");

module.exports = async (req, res, next) => {
	const authorization = req.header("Authorization");
	if (authorization) {
		let token = authorization.split(" ")[1];
		var segments = token.split(".");
		if (segments.length !== 3) {
			throw new Error("Not enough or too many segments");
		}
		// All segment should be base64
		var payloadSeg = segments[1];

		// base64 decode and parse JSON
		var decode = JSON.parse(base64urlDecode(payloadSeg));
		// const decode = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ email: decode.email });

		if (user) {
			req.user = user;
			// console.log(req.user?.email);
			next();
		} else {
			console.log("User Not Found");
			res.status(401).send("Unauthorised");
		}
	} else {
		console.log("Authorization header is not found");
		res.sendStatus(401);
	}
};

function base64urlDecode(str) {
	return new Buffer(base64urlUnescape(str), "base64").toString();
}

function base64urlUnescape(str) {
	str += Array(5 - (str.length % 4)).join("=");
	return str.replace(/\-/g, "+").replace(/_/g, "/");
}
