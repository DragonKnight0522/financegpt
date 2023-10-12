import React, { useRef } from "react";
import classNames from "classnames";
import Link from "next/link";
import Image from "next/image";
import {
	CalendarIcon,
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	FolderIcon,
	HomeIcon,
	ChatIcon,
	DatabaseIcon,
} from "@heroicons/react/solid";
import { usePathname } from "next/navigation";

const defaultNavItems = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: <HomeIcon className="w-6 h-6" />,
	},
	{
		label: "Chat",
		href: "/dashboard/chat",
		icon: <ChatIcon className="w-6 h-6" />,
	},
	{
		label: "Transaction",
		href: "/dashboard/transaction",
		icon: <FolderIcon className="w-6 h-6" />,
	},
	{
		label: "Debt",
		href: "/dashboard/debt",
		icon: <DatabaseIcon className="w-6 h-6" />,
	},
	{
		label: "Tax",
		href: "/dashboard/tax",
		icon: <DatabaseIcon className="w-6 h-6" />,
	},
	{
		label: "Retirement",
		href: "/dashboard/retirement",
		icon: <DatabaseIcon className="w-6 h-6" />,
	},
];

// add NavItem prop to component prop
const Sidebar = ({
	collapsed,
	navItems = defaultNavItems,
	shown,
	setCollapsed,
}) => {
	const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;
	const pathname = usePathname();
	return (
		<div
			className={`${collapsed ? "w-16" : "w-[300px]"} ${
				shown ? "" : "-translate-x-full"
			} bg-gray-700 text-zinc-50 h-screen md:translate-x-0 transition-all duration-300 ease-in-out sticky top-0`}
		>
			<div className="inset-0 flex flex-col justify-between h-screen md:h-full">
				<div
					className={`${
						collapsed
							? "py-4 justify-center"
							: "p-4 justify-between"
					} flex items-center border-b border-b-gray-800 transition-none`}
				>
					{!collapsed && (
						<span className="whitespace-nowrap">Finance GPT</span>
					)}
					<button
						className="grid w-10 h-10 rounded-full opacity-0 place-content-center hover:bg-gray-800 md:opacity-100"
						onClick={() => setCollapsed(!collapsed)}
					>
						<Icon className="w-5 h-5" />
					</button>
				</div>
				<nav className="flex-grow">
					<ul className="flex flex-col items-stretch gap-2 my-2">
						{navItems.map((item, index) => {
							return (
								<li
									key={index}
									className={`${
										pathname == item.href
											? "bg-gray-900"
											: ""
									} ${
										collapsed
											? "rounded-full p-2 mx-3 w-10 h-10"
											: "rounded-md p-2 mx-3 gap-4 "
									} text-gray-100 hover:bg-gray-900 flex
										transition-colors duration-300`}
								>
									<Link
										href={item.href}
										className={`flex w-full ${
											collapsed ? "" : "gap-2"
										}`}
									>
										{item.icon}{" "}
										<span>{!collapsed && item.label}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</div>
	);
};
export default Sidebar;
