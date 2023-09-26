"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
	const { theme } = useSelector((state) => state.theme);
	const [collapsed, setSidebarCollapsed] = useState(false);
	const [showSidebar, setShowSidebar] = useState(true);
	const pathname = usePathname();

	// useEffect(() => {
	// 	window.scrollTo(0, 0);
	// }, [pathname]);

	return (
		<>
			<div
				className={`${theme} ${
					collapsed
						? "grid-cols-sidebar-collapsed "
						: "grid-cols-sidebar "
				} grid bg-zinc-100 min-h-screen transition-[grid-template-columns] duration-300 ease-in-out`}
			>
				<Sidebar
					collapsed={collapsed}
					setCollapsed={setSidebarCollapsed}
					shown={showSidebar}
				/>
				<div className="relative bg-gray-50 dark:bg-slate-900">
					<Navbar
						sidebarOpen={showSidebar}
						setSidebarOpen={setShowSidebar}
					/>
					<div className="w-[90%] m-auto">{children}</div>
				</div>
			</div>
		</>
	);
}
