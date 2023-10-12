import * as React from "react";
import Link from "next/link";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import usePlaidInit from "@/hooks/usePlaidInit";
import useGetTransactionsSync from "@/hooks/useGetTransactionsSync";
import useGetAccounts from "@/hooks/useGetAccounts";
import { getUserInfo } from "@/store/actions/useUser";
import WelcomeModal from "./WelcomeModal";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Chat/sidebar";
import { SidebarList } from "@/components/Chat/sidebar-list";
import { ClearHistory } from "@/components/Chat/clear-history";
import { SidebarFooter } from "@/components/Chat/sidebar-footer";
import { clearChats } from "@/hooks/actions";

const Navbar = () => {
	const { linkSuccess, isItemAccess, isTransactionsLoaded } = useSelector(
		(state) => state.plaid
	);

	const dispatch = useDispatch();
	const pathname = usePathname();

	const navItems = [
		{
			label: "Dashboard",
			href: "/dashboard",
		},
		{
			label: "Chat",
			href: "/dashboard/chat",
		},
		{
			label: "Transactions",
			href: "/dashboard/transaction",
		},
	];

	usePlaidInit();
	useGetTransactionsSync();

	const fetchData = useCallback(() => {
		dispatch(getUserInfo());
	}, [dispatch]);

	useEffect(() => {
		if (isItemAccess && linkSuccess) fetchData();
	}, [isItemAccess, linkSuccess]);

	return (
		<header className="sticky top-0 z-10 flex w-full px-4 border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
			<div className="flex items-center justify-between flex-grow px-4 shadow-2">
				<div className="flex items-center h-full">
					<Sidebar>
						<React.Suspense
							fallback={<div className="flex-1 overflow-auto" />}
						>
							{/* @ts-ignore */}
							<SidebarList />
						</React.Suspense>
						<SidebarFooter>
							<ClearHistory clearChats={clearChats} />
						</SidebarFooter>
					</Sidebar>
					<div className="flex items-center justify-center w-10 h-10 mr-4 font-bold text-black bg-gray-200 rounded-full">
						Q
					</div>
					<div className="flex gap-2">
						{navItems.map((item, index) => {
							return (
								<li
									key={index}
									className={`${
										pathname == item.href
											? "border-slate-500 text-gray-900 dark:text-gray-100"
											: "border-transparent text-gray-500 dark:text-gray-600 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-700"
									} inline-flex items-center md:px-1 md:mx-2 py-5 border-b-2 text-xs md:text-sm font-medium `}
								>
									<Link href={item.href}>{item.label}</Link>
								</li>
							);
						})}
					</div>
				</div>
				<div className="flex items-center">
					{isTransactionsLoaded == false && (
						<div className="absolute top-0 left-0 w-screen h-screen">
							<img
								className="m-auto mt-[50vh]"
								src="/loading.svg"
							/>
						</div>
					)}
				</div>
				<div className="flex items-center gap-3">
					<ul className="flex items-center gap-2">
						<DarkModeSwitcher />
					</ul>
					<DropdownUser />
				</div>
			</div>
			<WelcomeModal />
		</header>
	);
};

export default Navbar;
