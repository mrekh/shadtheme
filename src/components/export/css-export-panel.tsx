"use client";

import * as React from "react";

import { CopyIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeDesigner } from "@/contexts/theme-designer-context";
import { serializeThemeCss } from "@/lib/color-engine";

export function CssExportPanel() {
	const { previewTheme, radius } = useThemeDesigner();

	const cssOutput = React.useMemo(() => {
		if (!previewTheme) return null;
		return serializeThemeCss(previewTheme.tokens, { radiusRem: radius });
	}, [previewTheme, radius]);

	const handleCopy = React.useCallback((content: string) => {
		if (typeof navigator === "undefined" || !navigator.clipboard) {
			toast.error("Clipboard is not available.");
			return;
		}
		navigator.clipboard.writeText(content).then(
			() => {
				toast.success("Copied to clipboard!");
			},
			() => toast.error("Failed to copy to clipboard."),
		);
	}, []);

	const handleDownload = React.useCallback(
		(content: string, filename: string) => {
			if (typeof window === "undefined") {
				toast.error("Downloads are not available in this environment.");
				return;
			}
			const blob = new Blob([content], { type: "text/css" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("Downloaded!");
		},
		[],
	);

	if (!cssOutput) {
		return (
			<div className="space-y-4">
				<Card className="p-4">
					<p className="text-muted-foreground text-sm">
						Generate a theme to see CSS output
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Card className="p-4">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold">Generated CSS</h3>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const fullCss = `${cssOutput.themeInline}\n\n${cssOutput.root}\n\n${cssOutput.dark}`;
								handleDownload(fullCss, "theme.css");
							}}
						>
							<DownloadIcon className="mr-2 size-4" />
							Download All
						</Button>
					</div>
				</div>

				<Tabs defaultValue="theme-inline" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="theme-inline">@theme inline</TabsTrigger>
						<TabsTrigger value="root">:root</TabsTrigger>
						<TabsTrigger value="dark">.dark</TabsTrigger>
					</TabsList>

					<TabsContent value="theme-inline" className="mt-4">
						<div className="relative">
							<pre className="bg-muted max-h-96 overflow-auto rounded-md p-4 text-xs">
								<code>{cssOutput.themeInline}</code>
							</pre>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2"
								onClick={() => handleCopy(cssOutput.themeInline)}
							>
								<CopyIcon className="size-4" />
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="root" className="mt-4">
						<div className="relative">
							<pre className="bg-muted max-h-96 overflow-auto rounded-md p-4 text-xs">
								<code>{cssOutput.root}</code>
							</pre>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2"
								onClick={() => handleCopy(cssOutput.root)}
							>
								<CopyIcon className="size-4" />
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="dark" className="mt-4">
						<div className="relative">
							<pre className="bg-muted max-h-96 overflow-auto rounded-md p-4 text-xs">
								<code>{cssOutput.dark}</code>
							</pre>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2"
								onClick={() => handleCopy(cssOutput.dark)}
							>
								<CopyIcon className="size-4" />
							</Button>
						</div>
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
}
