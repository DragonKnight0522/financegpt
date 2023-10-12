import * as React from "react";
import { SidebarEmbed } from "@/components/Chat/sidebarEmbed";
import { SidebarList } from "@/components/Chat/sidebar-list";
import { ClearHistory } from "@/components/Chat/clear-history";
import { SidebarFooter } from "@/components/Chat/sidebar-footer";
import { clearChats } from "@/hooks/actions";

export default function ChatLayout({ children }) {
	return (
		<div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
			<SidebarEmbed>
				<React.Suspense
					fallback={<div className="flex-1 overflow-auto" />}
				>
					<SidebarList />
				</React.Suspense>
				<SidebarFooter>
					<span></span>
					<ClearHistory clearChats={clearChats} />
				</SidebarFooter>
			</SidebarEmbed>
			{children}
		</div>
	);
}
