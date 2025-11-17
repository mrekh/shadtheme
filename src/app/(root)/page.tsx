import { RootComponents } from "@/app/(root)/components/root-components";
import { BlockDisplay } from "@/components/block-display";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { ThemeDesignerPanel } from "@/components/theme-designer-panel";
import { ThemeExportPanel } from "@/components/theme-export-panel";

import data from "./data.json";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Header outside sidebar - full width */}
			<SiteHeader />

			<SectionContainer className="space-y-4 py-10 text-center">
				<h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					Generate more than +100M shadcn UI themes, easily.
				</h1>
				<p className="text-muted-foreground text-lg">
					Pick a color harmony, preview contrast-safe tokens, and ship a
					polished interface without touching a spreadsheet.
				</p>
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
					<BlockDisplay
						className="bg-card border shadow-sm md:p-6"
						style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
					>
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
