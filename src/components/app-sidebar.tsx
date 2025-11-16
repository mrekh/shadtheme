"use client";

import * as React from "react";

import { IconInnerShadowTop } from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type SidebarData, defaultSidebarData } from "@/lib/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	data?: SidebarData;
}

export function AppSidebar({
	data = defaultSidebarData,
	...props
}: AppSidebarProps) {
	return (
		<Sidebar collapsible="offcanvas" className="h-full" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="#">
								<IconInnerShadowTop className="size-5!" />
								<span className="text-base font-semibold">Acme Inc.</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="flex-1 overflow-y-auto pb-6">
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
