/** @type {import('next').NextConfig} */

const nextConfig = {
    // reactStrictMode: true,
    experimental: {
        serverActions: true
    },
    async rewrites() {
        return [
            {
                source: "/api/v1/:path*",
                // destination: `https://intense-earth-81896-ff92cf34b085.herokuapp.com/api/:path*`
                destination: `${process.env.NEXT_APP_API_HOST}/api/:path*` // Proxy to Backend
            }
        ];
    },
    images: {
        domains: ["images.unsplash.com", "via.placeholder.com"]
    }
};

module.exports = nextConfig;
