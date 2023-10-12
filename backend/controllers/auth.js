const { handleError, isEmpty } = require("../utils/util");
const User = require("../models/user");
const { createConnection, checkConnection } = require("../config/mongodb");

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

		let userInfo = await User.findOneAndUpdate(
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
				includeResultMetadata: true,
			}
		);

		let user = null;
		let isNewUser = false;

		if (!userInfo.ok) {
			res.status(500).json({ error: "Error in creating/updating user" });
		} else {
			user = userInfo.value;
			isNewUser = userInfo.lastErrorObject.updatedExisting ? false : true;

			// Check DB Connection
			if (!isEmpty(user.mongoDBURL) && !checkConnection(user._id)) {
				const res = await createConnection(user._id, user.mongoDBURL);
				if (res !== 1)
					return res.json({
						message: "Personal database connection error.",
						isNewUser,
					});
			}

			// now you have isNewUser to represent if the user is newly created or not.
			res.json({ message: "success", isNewUser });
		}
	} catch (err) {
		handleError(err, res);
	}
};
