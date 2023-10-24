import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const { token } = req.nextauth;
        const { user } = token;
        if (!pathname.includes("/dashboard/checkout") && !user.isPro) {
            return NextResponse.redirect(
                new URL("/dashboard/checkout", req.url)
            );
        } else return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                return token?.accessToken;
            }
        }
    }
);

export const config = {
    matcher: "/dashboard/:path*"
};
