import {
	IconCamera,
	IconChartBar,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconHelp,
	IconListDetails,
	IconReport,
	IconSearch,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

export interface SidebarNavItem {
	title: string;
	url: string;
	icon?: Icon;
}

export interface SidebarActionItem extends SidebarNavItem {
	icon: Icon;
}

export interface SidebarDocumentItem {
	name: string;
	url: string;
	icon: Icon;
}

export interface SidebarUser {
	name: string;
	email: string;
}

export interface SidebarData {
	user: SidebarUser;
	navMain: SidebarNavItem[];
	navSecondary: SidebarActionItem[];
	documents: SidebarDocumentItem[];
}

export const defaultSidebarData: SidebarData = {
	user: {
		name: "shadcn",
		email: "m@example.com",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "#",
			icon: IconDashboard,
		},
		{
			title: "Lifecycle",
			url: "#",
			icon: IconListDetails,
		},
		{
			title: "Analytics",
			url: "#",
			icon: IconChartBar,
		},
		{
			title: "Projects",
			url: "#",
			icon: IconFolder,
		},
		{
			title: "Team",
			url: "#",
			icon: IconUsers,
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
		},
		{
			title: "Search",
			url: "#",
			icon: IconSearch,
		},
	],
	documents: [
		{
			name: "Data Library",
			url: "#",
			icon: IconDatabase,
		},
		{
			name: "Reports",
			url: "#",
			icon: IconReport,
		},
		{
			name: "Word Assistant",
			url: "#",
			icon: IconFileWord,
		},
		{
			name: "Capture",
			url: "#",
			icon: IconCamera,
		},
		{
			name: "Proposal",
			url: "#",
			icon: IconFileDescription,
		},
		{
			name: "Prompts",
			url: "#",
			icon: IconFileAi,
		},
	],
};
