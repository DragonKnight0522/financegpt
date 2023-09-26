const { handleError } = require("../utils/util");
const User = require('../models/user');

// signin & signup
exports.signin = async (req, res) => {
	try {
		const {
			email,
			name,
			picture: image,
			given_name,
			family_name,
			locale,
		} = req.body;
		
		let user = await User.findOneAndUpdate(
			{ email },
			{
				$setOnInsert: {
					email,
					name,
					image,
					given_name,
					family_name: family_name || "",
					locale,
				},
			},
			{
				new: true,
				upsert: true,
			}
		);
		if (!user) {
			res.status(500).json({ error: "Error in creating/updating user" });
		} else {
			res.json("success");
		}
	} catch (err) {
		handleError(err, res);
	}
};
