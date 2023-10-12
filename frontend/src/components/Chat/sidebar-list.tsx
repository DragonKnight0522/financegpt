"use client";

import { useEffect, useState } from "react";
import { getChats, removeChat, shareChat } from "@/hooks/actions";
import { SidebarActions } from "@/components/Chat/sidebar-actions";
import { SidebarItem } from "@/components/Chat/sidebar-item";
import { type Chat } from "@/lib/types";
import { useSession } from "next-auth/react";

export async function SidebarList() {
	const { data: session } = useSession();
	const [chats, setChats] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const userID: any = session?.user;
			if (userID?.id) {
				const data = await getChats(userID.id);
				setChats(data);
			}
		};

		fetchData();
	}, []);

	function isChat(obj: any): obj is Chat {
		return !!obj && typeof obj.message === "string";
	}

	return (
		<div className="flex-1 overflow-auto">
			{chats?.length ? (
				<div className="px-2 space-y-2">
					{chats.map(
						(chat) =>
							isChat(chat) && (
								<SidebarItem key={chat.id} chat={chat}>
									<SidebarActions
										chat={chat}
										removeChat={removeChat}
										shareChat={shareChat}
									/>
								</SidebarItem>
							)
					)}
				</div>
			) : (
				<div className="p-8 text-center">
					<p className="text-sm text-muted-foreground">
						No chat history
					</p>
				</div>
			)}
		</div>
	);
}
