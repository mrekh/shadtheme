"use client";

import {
	startTransition,
	useDeferredValue,
	useEffect,
	useId,
	useMemo,
	useState,
} from "react";

import Color from "color";

import {
	ColorPicker,
	ColorPickerAlpha,
	ColorPickerFormat,
	ColorPickerHue,
	ColorPickerSelection,
} from "@/components/kibo-ui/color-picker";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type BackgroundStrategy,
	HARMONY_OPTIONS,
	RADIUS_OPTIONS,
	useThemeDesigner,
} from "@/contexts/theme-designer-context";
import { HARMONY_CONFIGS } from "@/lib/color-engine/palette-strategies";
import { formatOklchCss } from "@/lib/color-spaces";
import { cn } from "@/lib/utils";

const BACKGROUND_STRATEGY_OPTIONS: {
	value: BackgroundStrategy;
	title: string;
	description: string;
}[] = [
	{
		value: "neutral",
		title: "Neutral surfaces",
		description: "Keep cards and panels softly desaturated in both modes.",
	},
	{
		value: "primary",
		title: "Primary-toned surfaces",
		description: "Blend your primary hue into the supporting backgrounds.",
	},
];

export function ThemeDesignerPanel() {
	const {
		primaryHex,
		harmony,
		radius,
		backgroundStrategy,
		previewTheme,
		isApplying,
		status,
		error,
		hasPendingChanges,
		setPrimary,
		setHarmony,
		setRadius,
		setBackgroundStrategy,
		applyTheme,
		resetTheme,
		getHarmonyPreview,
	} = useThemeDesigner();

	const [colorPickerOpen, setColorPickerOpen] = useState(false);
	const [tempColorHex, setTempColorHex] = useState(primaryHex);
	const [hexInput, setHexInput] = useState(primaryHex);
	const [inputError, setInputError] = useState<string | null>(null);
	const primaryColorInputId = useId();
	const primaryColorHelpId = `${primaryColorInputId}-help`;
	const primaryColorErrorId = `${primaryColorInputId}-error`;

	useEffect(() => {
		setHexInput(primaryHex);
	}, [primaryHex]);

	// Sync tempColorHex when dialog opens/closes or primaryHex changes externally
	useEffect(() => {
		if (!colorPickerOpen) return;
		if (primaryHex.toLowerCase() === tempColorHex.toLowerCase()) return;
		startTransition(() => {
			setTempColorHex(primaryHex);
		});
	}, [colorPickerOpen, primaryHex, tempColorHex]);

	const handleHexInputChange = (value: string) => {
		const normalized = value.startsWith("#") ? value : `#${value}`;
		setHexInput(normalized);

		if (!/^#[0-9a-fA-F]{0,6}$/.test(normalized)) {
			setInputError("Use up to six hex characters (0-9, A-F).");
			return;
		}

		setInputError(null);
		if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
			setPrimary(normalized.toLowerCase());
		}
	};

	// Use deferred value for preview theme to prevent blocking UI during rapid changes
	const deferredPreviewTheme = useDeferredValue(previewTheme);

	// Memoize harmony previews to avoid recalculation
	const harmonyPreviews = useMemo(() => {
		const previews: Record<string, ReturnType<typeof getHarmonyPreview>> = {};
		for (const harmonyType of HARMONY_OPTIONS) {
			try {
				const preview = getHarmonyPreview(harmonyType);
				previews[harmonyType] = preview;
			} catch {
				previews[harmonyType] = null;
			}
		}
		return previews;
	}, [getHarmonyPreview]);

	const hasChanges = Boolean(deferredPreviewTheme) && hasPendingChanges;

	const handleColorChange = (value: Parameters<typeof Color.rgb>[0]) => {
		// ColorPicker passes [r, g, b, alpha] where r,g,b are 0-255
		if (Array.isArray(value) && value.length >= 3) {
			const [r, g, b] = value;
			const hex = `#${[r, g, b]
				.map((x) => Math.round(x).toString(16).padStart(2, "0"))
				.join("")}`;
			// Only update temp state, not global state (prevents infinite loop)
			setTempColorHex(hex);
			setHexInput(hex);
			setInputError(null);
		}
	};

	const handleColorPickerClose = () => {
		setColorPickerOpen(false);
		setTempColorHex(primaryHex); // Reset to original
	};

	const handleColorPickerApply = () => {
		setPrimary(tempColorHex); // Apply the temp color
		setHexInput(tempColorHex);
		setInputError(null);
		setColorPickerOpen(false);
	};

	// Get preview colors for a specific harmony
	const getHarmonyPreviewColors = (harmonyType: string) => {
		const theme = harmonyPreviews[harmonyType];
		if (!theme) return null;
		const tokens = theme.tokens.light;
		return [
			tokens.primary,
			tokens.secondary,
			tokens.accent,
			tokens.destructive,
		];
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle asChild>
					<h2>Theme Designer</h2>
				</CardTitle>
				<CardDescription>
					Dial in your primary color, experiment with harmonies, and tweak
					radius settings to craft a contrast-safe shadcn/ui theme.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{error && (
					<p
						role="alert"
						className="text-destructive text-sm"
						aria-live="polite"
					>
						{error}
					</p>
				)}

				{/* Primary Color Selection */}
				<div className="space-y-2">
					<Label htmlFor={primaryColorInputId}>Primary Color</Label>
					<div className="flex items-center gap-2">
						<div
							className="border-border size-10 shrink-0 rounded-md border-2 shadow-sm"
							style={{ backgroundColor: primaryHex }}
						/>
						<Input
							id={primaryColorInputId}
							className="flex-1 font-mono text-sm"
							placeholder="#8b5cf6"
							value={hexInput}
							onChange={(event) =>
								handleHexInputChange(event.target.value.trim())
							}
							aria-invalid={Boolean(inputError)}
							aria-describedby={
								inputError
									? `${primaryColorHelpId} ${primaryColorErrorId}`
									: primaryColorHelpId
							}
						/>
						<Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="icon" type="button">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
									</svg>
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>Pick a Color</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<ColorPicker
										value={tempColorHex}
										onChange={handleColorChange}
										className="h-64"
									>
										<ColorPickerSelection />
										<ColorPickerHue />
										<ColorPickerAlpha />
										<div className="flex items-center gap-2">
											<ColorPickerFormat />
										</div>
									</ColorPicker>
									<div className="flex justify-end gap-2">
										<Button variant="outline" onClick={handleColorPickerClose}>
											Cancel
										</Button>
										<Button onClick={handleColorPickerApply}>Apply</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
					<p id={primaryColorHelpId} className="text-muted-foreground text-xs">
						Use a six-digit hex code such as #8b5cf6.
					</p>
					{inputError && (
						<p
							id={primaryColorErrorId}
							role="alert"
							className="text-destructive text-xs"
						>
							{inputError}
						</p>
					)}
				</div>

				{/* Color Harmony Selection */}
				<div className="space-y-3">
					<Label>Color Harmony</Label>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{HARMONY_OPTIONS.map((harmonyType) => {
							const config = HARMONY_CONFIGS[harmonyType];
							const isSelected = harmony === harmonyType;
							const previewColors = getHarmonyPreviewColors(harmonyType);

							return (
								<button
									key={harmonyType}
									type="button"
									onClick={() => setHarmony(harmonyType)}
									className={cn(
										"group hover:border-primary relative flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all",
										isSelected
											? "border-primary bg-primary/5"
											: "border-border bg-card",
									)}
								>
									<div className="flex items-center gap-1.5">
										<div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-current">
											{isSelected && (
												<div className="h-2 w-2 rounded-full bg-current" />
											)}
										</div>
										<span className="text-sm font-medium">{config.name}</span>
									</div>
									<p className="text-muted-foreground text-xs">
										{config.description}
									</p>
									{previewColors ? (
										<div className="flex gap-1">
											{previewColors.map((color, idx) => (
												<div
													key={idx}
													className="border-border/50 h-4 flex-1 rounded border"
													style={{
														backgroundColor: formatOklchCss(color),
													}}
												/>
											))}
										</div>
									) : (
										<div className="flex gap-1">
											{Array.from({ length: 4 }).map((_, idx) => (
												<Skeleton
													key={idx}
													className="border-border/50 h-4 flex-1 rounded border"
												/>
											))}
										</div>
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Surface Style */}
				<div className="space-y-3">
					<Label>Surface Style</Label>
					<p className="text-muted-foreground text-sm">
						Choose how background surfaces derive their color palette.
					</p>
					<div className="grid gap-3 md:grid-cols-2">
						{BACKGROUND_STRATEGY_OPTIONS.map((option) => {
							const isSelected = option.value === backgroundStrategy;

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setBackgroundStrategy(option.value)}
									className={cn(
										"group hover:border-primary relative flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all",
										isSelected
											? "border-primary bg-primary/5"
											: "border-border bg-card",
									)}
								>
									<div className="flex items-center gap-1.5">
										<div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-current">
											{isSelected && (
												<div className="h-2 w-2 rounded-full bg-current" />
											)}
										</div>
										<span className="text-sm font-medium">{option.title}</span>
									</div>
									<p className="text-muted-foreground text-xs">
										{option.description}
									</p>
								</button>
							);
						})}
					</div>
				</div>

				{/* Radius Selection */}
				<div className="space-y-3">
					<Label>Border Radius</Label>
					<TooltipProvider delayDuration={0}>
						<ToggleGroup
							type="single"
							value={radius.toString()}
							onValueChange={(value) => {
								if (value) setRadius(parseFloat(value));
							}}
							variant="outline"
							spacing={0}
							className="border-input flex flex-wrap gap-0 overflow-hidden rounded-md border"
						>
							{RADIUS_OPTIONS.map((option) => {
								// Create visual representation of border radius
								const radiusPercent = Math.round(option.value * 100);
								const borderRadius = `${radiusPercent}%`;
								return (
									<Tooltip key={option.value}>
										<TooltipTrigger asChild>
											<ToggleGroupItem
												value={option.value.toString()}
												aria-label={option.label}
											>
												<div
													className="size-4 border-2 border-current"
													style={{ borderRadius }}
												/>
											</ToggleGroupItem>
										</TooltipTrigger>
										<TooltipContent>
											<p>{option.label}</p>
										</TooltipContent>
									</Tooltip>
								);
							})}
						</ToggleGroup>
					</TooltipProvider>
				</div>

				{/* Preview Colors */}
				{deferredPreviewTheme && (
					<div className="space-y-3">
						<Label>Preview Colors</Label>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{[
								{ name: "Primary", token: "primary" },
								{ name: "Secondary", token: "secondary" },
								{ name: "Accent", token: "accent" },
								{ name: "Muted", token: "muted" },
							].map(({ name, token }) => {
								const color =
									deferredPreviewTheme.tokens.light[
										token as keyof typeof deferredPreviewTheme.tokens.light
									];
								return (
									<div
										key={token}
										className="flex flex-col gap-1.5 rounded-md border p-2"
									>
										<div
											className="border-border/50 h-12 w-full rounded border"
											style={{ backgroundColor: formatOklchCss(color) }}
										/>
										<div className="text-xs">
											<div className="font-medium">{name}</div>
											<div className="text-muted-foreground font-mono text-[10px]">
												{formatOklchCss(color)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-between gap-2">
				<Button variant="outline" onClick={resetTheme} disabled={isApplying}>
					Reset to Default
				</Button>
				<Button
					onClick={applyTheme}
					disabled={!hasChanges || isApplying}
					className="min-w-24"
				>
					{isApplying
						? "Applying..."
						: status === "previewing"
							? "Generating…"
							: "Apply Theme"}
				</Button>
			</CardFooter>
		</Card>
	);
}
