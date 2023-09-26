import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	// `withAuth` augments your `Request` with the user's token.
	function middleware(req) {
		// const { pathname } = req.nextUrl;
		// console.log("req.nextauth.token", req.nextauth.token);
		// return NextResponse.redirect(new URL("/", request.url));
		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token }) => {
				return token?.accessToken;
			},
		},
	}
);

export const config = {
	matcher: "/dashboard/:path*",
};
