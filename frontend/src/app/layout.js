"use client";

import { SessionProvider } from "next-auth/react";
import { Provider, useSelector } from "react-redux";
import { Inter } from "next/font/google";
import store from "../store";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { dm_sans, inter } from "@/lib/fonts";
import Head from 'next/head';

const metadata = {
    description:
        "Connect all of your accounts to browse transactions, analyze spend & use your personal AI assistant to ask Q&A for precise insights to your financial position",
    title: "Qashboard |  Personal Finance AI Assistant"
};

const font = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
    return (
        <>
        <Head>
            <title>Qashboard</title>
        </Head>
        <html
            lang="en"
            className={`${inter.variable} ${dm_sans.variable}`}
            suppressHydrationWarning
        >
            <SessionProvider>
                <Provider store={store}>
                    <body className="font-sans scroll-smooth">
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
        </>
    );
}
