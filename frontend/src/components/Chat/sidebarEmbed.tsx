"use client";

import * as React from "react";
export interface SidebarProps {
	children?: React.ReactNode;
}

export function SidebarEmbed({ children }: SidebarProps) {
	return (
		<>
			<div
				data-state="open"
				className="peer absolute inset-y-0 z-30 hidden h-full -translate-x-full flex-col border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]"
			>
				<div className="p-4">
					<p className="text-sm">Chat History</p>
				</div>
				{children}
			</div>
		</>
	);
}
