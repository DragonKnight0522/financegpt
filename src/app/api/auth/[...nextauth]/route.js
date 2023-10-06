import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import apiCall from "@/utils/apiCall";
import { checkConnection, createConnection, dbConnect } from "@/config/mongodb";
import User from "@/models/user";
import { handleServerError, isEmpty } from "@/utils/util";

export const authOptions = {
	pages: {
		signIn: "/",
	},
	session: {
		strategy: "jwt",
		// maxAge: process.env.JWT_EXPIRE, // 1 day
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	callbacks: {
		async signIn({ account, profile, user }) {
			if (account.provider === "google") {
				try {
					// const res = await apiCall.post(
					// 	`${process.env.NEXT_APP_API_HOST}/api/auth/signin`,
					// 	profile
					// );
					await dbConnect();

					const {
						email,
						name,
						picture: image,
						given_name,
						family_name,
						locale,
					} = profile;

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
							rawResult: true,
						}
					);

					if (userInfo.ok) {
						user.isNewUser = userInfo.lastErrorObject.upserted
							? true
							: false;
						userInfo = userInfo.value;
						// Check DB Connection
						if (
							!isEmpty(userInfo.mongoDBURL) &&
							!checkConnection(userInfo._id)
						) {
							const res = await createConnection(
								userInfo._id,
								userInfo.mongoDBURL
							);
							if (res !== 1) return false;
						}
					}
				} catch (err) {
					handleServerError(err);
				}
				return true;
			}
			return false;
		},
		async jwt({ token, user, account, trigger, session }) {
			if (user) {
				token = { user, accessToken: account.id_token };
			}
			if (trigger === "update") {
				token.user.isNewUser = session.isNewUser;
			}
			return token;
		},
		async session({ session, token, req }) {
			session.accessToken = token.accessToken;
			session = { ...session, ...token };
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
