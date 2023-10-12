"use client";

import * as React from "react";

import { Button } from "@/components/Chat/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/Chat/ui/sheet";
import { IconSidebar } from "@/components/Chat/ui/icons";

export interface SidebarProps {
	children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
	return (
		<Sheet>
			{/* <SheetTrigger asChild>
				{pathname.includes("/dashboard/chat") && (
					<Button variant="ghost" className="p-0 -ml-2 h-9 w-9">
						<IconSidebar className="w-6 h-6" />
						<span className="sr-only">Toggle Sidebar</span>
					</Button>
				)}
			</SheetTrigger> */}
			<SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
				<SheetHeader className="p-4">
					<SheetTitle className="text-sm">Chat History</SheetTitle>
				</SheetHeader>
				{children}
			</SheetContent>
		</Sheet>
	);
}
