"use client";

import { startTransition, useEffect, useState } from "react";

import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themes = [
	{
		key: "system",
		icon: Monitor,
		label: "System theme",
	},
	{
		key: "light",
		icon: Sun,
		label: "Light theme",
	},
	{
		key: "dark",
		icon: Moon,
		label: "Dark theme",
	},
];

export type ThemeSwitcherProps = {
	className?: string;
};

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	if (!mounted) {
		return (
			<div
				className={cn(
					"bg-muted/60 h-8 w-20 animate-pulse rounded-full",
					className,
				)}
				aria-hidden="true"
			/>
		);
	}

	const currentTheme = theme || "system";

	return (
		<div
			className={cn(
				"bg-background ring-border relative isolate flex h-8 rounded-full p-1 ring-1",
				className,
			)}
		>
			{themes.map(({ key, icon: Icon, label }) => {
				const isActive = currentTheme === key;

				return (
					<button
						aria-label={label}
						className="relative h-6 w-6 rounded-full"
						key={key}
						onClick={() => setTheme(key)}
						type="button"
					>
						{isActive && (
							<motion.div
								className="bg-primary/20 ring-primary/40 dark:bg-primary/30 absolute inset-0 rounded-full ring-1 ring-inset"
								layoutId="activeTheme"
								transition={{ type: "spring", duration: 0.5 }}
							/>
						)}
						<Icon
							className={cn(
								"relative z-10 m-auto h-4 w-4",
								isActive ? "text-foreground" : "text-muted-foreground",
							)}
						/>
					</button>
				);
			})}
		</div>
	);
};
