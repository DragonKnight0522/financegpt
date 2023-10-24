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

const Navbar = () => {
    const { isTransactionsLoaded } = useSelector(state => state.plaid);

    const dispatch = useDispatch();
    const pathname = usePathname();

    const navItems = [
        {
            label: "Accounts",
            href: "/dashboard"
        },
        {
            label: "Analyze",
            href: "/dashboard/charts"
        },
        {
            label: "Chat",
            href: "/dashboard/chat"
        },
        {
            label: "Explore",
            href: "/dashboard/transaction"
        }
    ];

    usePlaidInit();
    useGetTransactionsSync();

    const fetchData = useCallback(() => {
        dispatch(getUserInfo());
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <header className="sticky top-0 z-10 flex w-full px-4 border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
            <div className="relative flex items-center justify-between px-4 shadow-2 grow">
                <div className="flex items-center justify-center my-2 mr-4 font-bold text-black bg-gray-100 rounded-full w-11 h-11">
                    {/* Q */}
                    <img
                        width={"100%"}
                        height={"100%"}
                        src="https://assets-global.website-files.com/652f138fe3158780149d6e3e/6530681bec2b36fea6c68f03_Minimalist%20Orange%20Online%20Link%20Store%20Market%20Logo%20(2).png"
                    />
                </div>
                <div className="absolute flex gap-2 space-x-4 transform -translate-x-1/2 left-1/2">
                    {navItems.map((item, index) => {
                        return (
                            <li
                                key={index}
                                className={`${
                                    pathname == item.href
                                        ? "border-slate-500 text-gray-900 dark:text-gray-100"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-600 dark:hover:border-gray-700 dark:hover:text-gray-300"
                                } inline-flex items-center border-b-2 py-5 text-xs font-medium md:mx-2 md:px-1 md:text-sm`}
                            >
                                <Link href={item.href}>{item.label}</Link>
                            </li>
                        );
                    })}
                </div>
                <div>
                    <div className="flex items-center">
                        {isTransactionsLoaded == false && (
                            <div className="absolute top-0 left-0 w-screen h-screen">
                                <img
                                    className="m-auto mt-[50vh]"
                                    src="/Loading.svg"
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
            </div>
            <WelcomeModal />
        </header>
    );
};

export default Navbar;
