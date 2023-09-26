// import { prisma } from "@/lib/prisma";
// import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import axios from "axios";

// import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import apiCall from "@/utils/apiCall";

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
					await apiCall.post(
						`${process.env.NEXT_APP_API_HOST}/api/auth/signin`,
						profile
					);
				} catch (err) {
					console.log(err);
				}
				return true;
			}
			return false;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token = { user, accessToken: account.id_token };
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session = { ...session, ...token };
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };