import * as React from "react";
import ReactDOM from "react-dom";
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
		<header className="sticky top-0 z-10 flex w-full border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
			<div className="shadow-2 flex grow items-center justify-between px-4">
				<div className="flex h-full items-center">
					<div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-black">
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
											: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-600 dark:hover:border-gray-700 dark:hover:text-gray-300"
									} inline-flex items-center border-b-2 py-5 text-xs font-medium md:mx-2 md:px-1 md:text-sm `}
								>
									<Link href={item.href}>{item.label}</Link>
								</li>
							);
						})}
					</div>
				</div>
				<div className="flex items-center">
					{isTransactionsLoaded == false && (
						<div className="absolute left-0 top-0 h-screen w-screen">
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
