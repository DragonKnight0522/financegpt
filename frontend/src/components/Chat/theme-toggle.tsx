"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/Chat/ui/button";
import { IconMoon, IconSun } from "@/components/Chat/ui/icons";

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();
	const [_, startTransition] = React.useTransition();
	console.log(theme);
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => {
				startTransition(() => {
					setTheme(theme === "light" ? "dark" : "light");
				});
			}}
		>
			{!theme ? null : theme === "dark" ? (
				<IconMoon className="transition-all" />
			) : (
				<IconSun className="transition-all" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
