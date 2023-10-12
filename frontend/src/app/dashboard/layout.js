"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
	const { theme } = useSelector((state) => state.theme);
	// const [collapsed, setSidebarCollapsed] = useState(false);
	// const [showSidebar, setShowSidebar] = useState(true);
	const pathname = usePathname();

	// useEffect(() => {
	// 	window.scrollTo(0, 0);
	// }, [pathname]);

	return (
		<>
			<div className={`${theme} grid min-h-screen`}>
				{/* <Sidebar
					collapsed={collapsed}
					setCollapsed={setSidebarCollapsed}
					shown={showSidebar}
				/> */}
				<div className="relative bg-gray-50 bg-muted/50">
					<Navbar />
					{children}
				</div>
			</div>
		</>
	);
}
