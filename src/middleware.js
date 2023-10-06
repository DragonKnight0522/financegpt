import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isEmpty } from "@/utils/util";

export default withAuth(
	async function middleware(request) {
		const { user } = await request.nextauth.token;
		if (isEmpty(user))
			return NextResponse.redirect(new URL("/", request.url));
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
	matcher: ["/api/:path*", "/dashboard/:path*"],
};
