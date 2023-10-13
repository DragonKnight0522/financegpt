"use client";

import { useEffect, useState } from "react";
import { getChats, removeChat } from "@/hooks/actions";
import { SidebarActions } from "@/components/Chat/sidebar-actions";
import { SidebarItem } from "@/components/Chat/sidebar-item";
import { usePathname } from "next/navigation";

export function SidebarList() {
	const [chats, setChats] = useState([]);
	const pathname = usePathname();

	useEffect(() => {
		const fetchData = async () => {
			const data = await getChats();
			setChats(data.data);
		};

		fetchData();
	}, [pathname]);

	return (
		<div className="flex-1 overflow-auto">
			{chats?.length ? (
				<div className="px-2 space-y-2">
					{chats.map((chat) => (
						<SidebarItem key={chat.id} chat={chat}>
							<SidebarActions
								chat={chat}
								removeChat={removeChat}
								// shareChat={shareChat}
							/>
						</SidebarItem>
					))}
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
