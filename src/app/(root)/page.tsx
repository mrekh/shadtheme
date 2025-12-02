import { RootComponents } from "@/app/(root)/components/root-components";
import { BlockDisplay } from "@/components/block-display";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { AnimatedOrb } from "@/components/hero/animated-orb";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { ThemeDesignerPanel } from "@/components/theme-designer-panel";
import { ThemeExportPanel } from "@/components/theme-export-panel";
import { Badge } from "@/components/ui/badge";

import data from "./data.json";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Header outside sidebar - full width */}
			<SiteHeader />

			{/* Hero Section with animated orb */}
			<SectionContainer className="relative pt-4 pb-4 text-center md:pt-6 md:pb-6">
				{/* Animated background orb */}
				<AnimatedOrb />

				{/* Content overlay */}
				<div className="relative z-10 -mt-20 space-y-4 md:-mt-24">
					<Badge
						variant="secondary"
						className="mx-auto mb-4 px-3 py-1 text-xs font-medium"
					>
						100M+ possible themes
					</Badge>
					<h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
						Generate stunning shadcn/ui themes in seconds
					</h1>
					<p className="text-muted-foreground mx-auto max-w-2xl text-base text-balance sm:text-lg">
						Pick a color harmony, preview contrast-safe tokens, and ship a
						polished interface without touching a spreadsheet.
					</p>
				</div>
			</SectionContainer>

			<main id="main-content" className="flex flex-1 flex-col">
				{/* Theme Designer Panel */}
				<SectionContainer className="space-y-4 py-6">
					<ThemeDesignerPanel />
					<ThemeExportPanel />
				</SectionContainer>

				{/* Container wrapper for sidebar and content */}
				<SectionContainer className="flex-1 py-4" padded>
					<DashboardShell>
						<div className="flex flex-1 flex-col gap-4 py-2 md:gap-6 md:py-4">
							<SectionCards />
							<div className="px-2 sm:px-4 lg:px-6">
								<ChartAreaInteractive />
							</div>
							<DataTable data={data} />
						</div>
					</DashboardShell>
				</SectionContainer>

				{/* Components showcase section */}
				<SectionContainer className="py-10">
					<BlockDisplay>
						<RootComponents />
					</BlockDisplay>
				</SectionContainer>
			</main>

			{/* Footer */}
			<footer className="border-t py-8">
				<SectionContainer className="text-muted-foreground text-center text-sm">
					Built with 💙 by{" "}
					<a
						href="https://www.trybyte.app"
						target="_blank"
						rel="noreferrer"
						className="text-primary font-medium"
					>
						Byte
					</a>
					, The GEO tool SEO teams need.
				</SectionContainer>
			</footer>
		</div>
	);
}
