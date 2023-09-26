"use client";

import Link from "next/link";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConnectButton from "./ConnectButton";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import usePlaidInit from "@/hooks/usePlaidInit";
import useGetTransactionsSync from "@/hooks/useGetTransactionsSync";
import useGetAccounts from "@/hooks/useGetAccounts";
import { getUserInfo } from "@/store/actions/useUser";

const Navbar = (props) => {
	const { linkSuccess, isItemAccess, isTransactionsLoaded } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	usePlaidInit();
	useGetTransactionsSync();

	const fetchData = useCallback(() => {
		dispatch(getUserInfo());
	}, [dispatch]);

	useEffect(() => {
		if (isItemAccess && linkSuccess) fetchData();
	}, [isItemAccess, linkSuccess]);

	return (
		<header
			className={`sticky top-0 flex w-full bg-tremor-background z-10 drop-shadow-1 dark:bg-dark-tremor-background dark:drop-shadow-none`}
		>
			<div className="flex items-center justify-between flex-grow px-4 py-4 shadow-2 md:px-6 2xl:px-11">
				<div className="flex items-center">
					<ConnectButton>Connect Account</ConnectButton>
					{isTransactionsLoaded == false && (
						<img className="ml-2" src="/loading.svg" />
					)}
				</div>

				<div className="flex items-center gap-3">
					<ul className="flex items-center gap-2">
						<DarkModeSwitcher />
					</ul>
					<DropdownUser />
				</div>
			</div>
		</header>
	);
};

export default Navbar;
