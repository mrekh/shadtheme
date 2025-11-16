"use client";

import { useState } from "react";

import { CheckIcon, ChevronDownIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useThemeDesigner } from "@/contexts/theme-designer-context";
import { serializeThemeCss } from "@/lib/color-engine";
import { cn } from "@/lib/utils";

export function ThemeExportPanel() {
	const { previewTheme, radius } = useThemeDesigner();
	const [copiedSection, setCopiedSection] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [liveMessage, setLiveMessage] = useState("");

	if (!previewTheme) {
		return null;
	}

	const css = serializeThemeCss(previewTheme.tokens, { radiusRem: radius });

	const allCss = [css.themeInline, css.root, css.dark].join("\n\n");

	const copyToClipboard = async (text: string, section: string) => {
		try {
			if (typeof navigator === "undefined" || !navigator.clipboard) {
				throw new Error("Clipboard API unavailable");
			}
			await navigator.clipboard.writeText(text);
			setCopiedSection(section);
			toast.success(`Copied ${section} to clipboard`);
			setTimeout(() => setCopiedSection(null), 2000);
			setLiveMessage(`Copied ${section} to clipboard.`);
		} catch {
			toast.error("Failed to copy to clipboard");
			setLiveMessage("Unable to copy to clipboard.");
		}
	};

	const copyAll = async () => {
		await copyToClipboard(allCss, "all");
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle asChild>
							<h2>Export Theme</h2>
						</CardTitle>
						<CardDescription>
							Copy contrast-safe CSS variables or individual sections to drop
							into your design system.
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={copyAll}
							className="h-8"
						>
							{copiedSection === "all" ? (
								<>
									<CheckIcon className="size-3" />
									Copied
								</>
							) : (
								<>
									<CopyIcon className="size-3" />
									Copy Theme
								</>
							)}
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<details
					open={isOpen}
					onToggle={(e) => setIsOpen(e.currentTarget.open)}
					className="group"
				>
					<summary className="hover:bg-muted hover:text-foreground flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm font-medium">
						<span>View Details</span>
						<ChevronDownIcon
							className={cn(
								"size-4 transition-transform",
								isOpen && "rotate-180",
							)}
						/>
					</summary>
					<div className="mt-4 space-y-4">
						{/* @theme inline */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">@theme inline</label>
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyToClipboard(css.themeInline, "theme")}
									className="h-8"
								>
									{copiedSection === "theme" ? (
										<>
											<CheckIcon className="size-3" />
											Copied
										</>
									) : (
										<>
											<CopyIcon className="size-3" />
											Copy
										</>
									)}
								</Button>
							</div>
							<pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md border p-3 text-xs">
								<code>{css.themeInline}</code>
							</pre>
						</div>

						{/* :root */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">:root</label>
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyToClipboard(css.root, "root")}
									className="h-8"
								>
									{copiedSection === "root" ? (
										<>
											<CheckIcon className="size-3" />
											Copied
										</>
									) : (
										<>
											<CopyIcon className="size-3" />
											Copy
										</>
									)}
								</Button>
							</div>
							<pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md border p-3 text-xs">
								<code>{css.root}</code>
							</pre>
						</div>

						{/* .dark */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">.dark</label>
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyToClipboard(css.dark, "dark")}
									className="h-8"
								>
									{copiedSection === "dark" ? (
										<>
											<CheckIcon className="size-3" />
											Copied
										</>
									) : (
										<>
											<CopyIcon className="size-3" />
											Copy
										</>
									)}
								</Button>
							</div>
							<pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md border p-3 text-xs">
								<code>{css.dark}</code>
							</pre>
						</div>
					</div>
					<span aria-live="polite" className="sr-only">
						{liveMessage}
					</span>
				</details>
			</CardContent>
		</Card>
	);
}
