"use client";

import { SessionProvider } from "next-auth/react";
import { Provider, useSelector } from "react-redux";
import { Inter } from "next/font/google";
import store from "../store";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

const metadata = {
	description:
		"This personal finance dashboard; chat uses Plaid API requests; Firebase Auth, Collections to aggregate account info across multiple accounts. Designed for personal use and storage. Insights provided by GPT4",
	title: "AI enabled personal accountant",
};

const font = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<SessionProvider>
				<Provider store={store}>
					<body className="scroll-smooth">
						<Providers
							attribute="class"
							defaultTheme="system"
							enableSystem
						>
							{children}
						</Providers>
						<Toaster />
					</body>
				</Provider>
			</SessionProvider>
		</html>
	);
}
