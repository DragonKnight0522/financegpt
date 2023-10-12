const admin = require.main.require("firebase-admin");

module.exports = (req, res, next) => {
	const authorization = req.header("Authorization");
	if (authorization) {
		let token = authorization.split(" ");
		admin
			.auth()
			.verifyIdToken(token[1])
			.then((decodedToken) => {
				console.log(decodedToken);
				if (decodedToken.role == "admin") {
					res.locals.user = decodedToken;
					next();
				} else {
					console.log("Admin Only Allowed");
					res.sendStatus(401);
				}
			})
			.catch((err) => {
				console.log(err);
				res.sendStatus(401);
			});
	} else {
		console.log("Authorization header is not found");
		res.sendStatus(401);
	}
};
