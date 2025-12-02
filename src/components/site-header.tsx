"use client";

import { GithubIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";

export function SiteHeader() {
	const { theme, setTheme } = useTheme();

	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b">
			<a
				href="#main-content"
				className="focus-visible:bg-primary focus-visible:text-primary-foreground sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:rounded-md focus-visible:px-3 focus-visible:py-1"
			>
				Skip to content
			</a>
			<div className="mx-auto flex w-full max-w-[80%] items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<h1 className="font-mono text-base font-medium">shadcntheme</h1>
				<div className="ml-auto flex items-center gap-2">
					<a
						href="https://github.com/mrekh/shadtheme"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:bg-accent focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
						aria-label="GitHub repository"
					>
						<GithubIcon className="h-5 w-5" />
					</a>
					<ThemeSwitcher
						value={theme as "light" | "dark" | "system"}
						onChange={setTheme}
					/>
				</div>
			</div>
		</header>
	);
}
