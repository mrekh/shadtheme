"use client";

import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type SidebarShellStyle = CSSProperties & {
	["--sidebar-width"]?: string;
	["--header-height"]?: string;
};

const shellStyle: SidebarShellStyle = {
	"--sidebar-width": "calc(var(--spacing) * 60)",
	"--header-height": "calc(var(--spacing) * 12)",
	borderRadius: "calc(var(--radius) * 1.5)",
};

const insetStyle: CSSProperties = {
	borderRadius: "var(--radius)",
};

export interface DashboardShellProps {
	children: ReactNode;
	sidebar?: ReactNode;
	className?: string;
	insetClassName?: string;
	contentClassName?: string;
}

export function DashboardShell({
	children,
	className,
	insetClassName,
	contentClassName,
	sidebar = <AppSidebar variant="inset" />,
}: DashboardShellProps) {
	return (
		<SidebarProvider
			className={cn(
				// Base styles
				"dashboard-shell relative overflow-hidden",
				// Colors and theming
				"bg-sidebar text-sidebar-foreground",
				"[&_[data-sidebar=sidebar]]:bg-sidebar [&_[data-sidebar=sidebar]]:text-sidebar-foreground",
				// Border and shadow
				"border-border/50 border shadow-md",
				// Padding
				"p-3 md:p-4",
				// Sidebar container overrides for embedded mode
				"[&_[data-slot=sidebar-container]]:!relative",
				"[&_[data-slot=sidebar-container]]:inset-0",
				"[&_[data-slot=sidebar-container]]:w-full",
				"[&_[data-slot=sidebar-gap]]:hidden",
				className,
			)}
			style={shellStyle}
		>
			{sidebar}
			<SidebarInset
				className={cn(
					"bg-card flex w-full flex-1",
					"border-border/40 border",
					"p-3 md:p-4",
					"shadow-sm",
					insetClassName,
				)}
				style={insetStyle}
			>
				<div
					className={cn(
						"@container/main mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4",
						contentClassName,
					)}
				>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
