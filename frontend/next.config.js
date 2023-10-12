/** @type {import('next').NextConfig} */

const nextConfig = {
	async rewrites() {
		return [
			{
				source: "/api/v1/:path*",
				destination: `${process.env.NEXT_APP_API_HOST}/api/:path*`, // Proxy to Backend
			},
		];
	},
	images: {
		domains: ["images.unsplash.com", "via.placeholder.com"],
	},
	experimental: {
		serverActions: true,
	},
};

module.exports = nextConfig;
