"use client";

import { useEffect, useContext, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";

import { Button } from "@tremor/react";

import { Products } from "plaid";
import { useDispatch, useSelector } from "react-redux";
import { setPlaidState } from "@/store/actions/usePlaid";
import { usePathname, useRouter } from "next/navigation";
import apiCall from "@/utils/apiCall";
import { setUserInfoState } from "@/store/actions/useUser";
import { isEmpty } from "@/utils/util";

const ConnectButton = ({ children }) => {
	const { linkToken, linkSuccess } = useSelector((state) => state.plaid);
	const { items: linkInfo } = useSelector((state) => state.user);

	const dispatch = useDispatch();

	const onSuccess = useCallback(
		(public_token, metadata) => {
			// check this institution and accounts already exist

			// If the access_token is needed, send public_token to server
			const exchangePublicTokenForAccessToken = async () => {
				const response = await apiCall.post(
					"/api/v1/plaid/set_access_token",
					{ public_token, metadata }
				);
				if (response.status !== 200) {
					dispatch(
						setPlaidState({
							isItemAccess: false,
						})
					);
					return;
				}
				const { isItemAccess, item_id } = await response.data;
				dispatch(setPlaidState({ isItemAccess: isItemAccess }));
				if (!isEmpty(item_id)) {
					dispatch(
						setUserInfoState({ items: [...linkInfo, metadata] })
					);
				}
			};
			exchangePublicTokenForAccessToken();
			dispatch(setPlaidState({ linkSuccess: true }));
		},
		[dispatch]
	);

	const config = {
		token: linkToken,
		onSuccess,
	};

	const { open, ready } = usePlaidLink(config);

	const handleOpenPlaidLink = () => {
		dispatch(setPlaidState({ isItemAccess: false, linkSuccess: false }));
		open();
	};

	return (
		<button
			className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
			onClick={handleOpenPlaidLink}
			disabled={!ready || !linkSuccess}
		>
			{children}
		</button>
	);
};

export default ConnectButton;
