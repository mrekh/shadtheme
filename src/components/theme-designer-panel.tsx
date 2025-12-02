"use client";

import {
	useCallback,
	useDeferredValue,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";

import Color from "color";
import { Loader2Icon, PaletteIcon, SparklesIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";

import { Confetti } from "@/components/confetti";
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
		title: "Neutral",
		description: "Softly desaturated surfaces",
	},
	{
		value: "primary",
		title: "Primary-toned",
		description: "Blend primary into backgrounds",
	},
];

// Section wrapper component for visual grouping
function Section({
	title,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
					{title}
				</span>
				<div className="bg-border h-px flex-1" />
			</div>
			{children}
		</div>
	);
}

// Animated color swatch component
function ColorSwatch({
	color,
	size = "md",
	className,
}: {
	color: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}) {
	const sizeClasses = {
		sm: "size-4",
		md: "size-10",
		lg: "size-14",
	};

	return (
		<motion.div
			className={cn(
				"border-border/50 shrink-0 rounded-lg border shadow-sm",
				sizeClasses[size],
				className,
			)}
			style={{ backgroundColor: color }}
			whileHover={{ scale: 1.05 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
		/>
	);
}

export function ThemeDesignerPanel() {
	const {
		primaryHex,
		secondaryHex,
		harmony,
		radius,
		backgroundStrategy,
		previewTheme,
		isApplying,
		status,
		error,
		hasPendingChanges,
		setPrimary,
		setSecondary,
		setHarmony,
		setRadius,
		setBackgroundStrategy,
		applyTheme,
		resetTheme,
		getHarmonyPreview,
	} = useThemeDesigner();

	// Primary color picker state
	const [colorPickerOpen, setColorPickerOpen] = useState(false);
	const [tempColorHex, setTempColorHex] = useState(primaryHex);
	const [hexInput, setHexInput] = useState(primaryHex);
	const [inputError, setInputError] = useState<string | null>(null);
	const primaryColorInputId = useId();
	const primaryColorHelpId = `${primaryColorInputId}-help`;
	const primaryColorErrorId = `${primaryColorInputId}-error`;

	// Secondary color picker state
	const [secondaryPickerOpen, setSecondaryPickerOpen] = useState(false);
	const [tempSecondaryHex, setTempSecondaryHex] = useState(secondaryHex ?? "");
	const [secondaryHexInput, setSecondaryHexInput] = useState(
		secondaryHex ?? "",
	);
	const [secondaryInputError, setSecondaryInputError] = useState<string | null>(
		null,
	);
	const secondaryColorInputId = useId();
	const secondaryColorHelpId = `${secondaryColorInputId}-help`;
	const secondaryColorErrorId = `${secondaryColorInputId}-error`;

	// Confetti celebration state
	const [showConfetti, setShowConfetti] = useState(false);
	const prevStatusRef = useRef(status);

	// Trigger confetti when theme is successfully applied
	useEffect(() => {
		if (prevStatusRef.current === "applying" && status === "idle") {
			setShowConfetti(true);
		}
		prevStatusRef.current = status;
	}, [status]);

	const handleConfettiComplete = useCallback(() => {
		setShowConfetti(false);
	}, []);

	useEffect(() => {
		setHexInput(primaryHex);
	}, [primaryHex]);

	useEffect(() => {
		setSecondaryHexInput(secondaryHex ?? "");
	}, [secondaryHex]);

	// Handlers for dialog open state - sync temp color only when opening
	const handleColorPickerOpenChange = (open: boolean) => {
		setColorPickerOpen(open);
		if (open) {
			// Sync temp color with current primary when dialog opens
			setTempColorHex(primaryHex);
			setHexInput(primaryHex);
		}
	};

	const handleSecondaryPickerOpenChange = (open: boolean) => {
		setSecondaryPickerOpen(open);
		if (open) {
			// Sync temp color with current secondary when dialog opens
			const currentSecondary = secondaryHex ?? "";
			setTempSecondaryHex(currentSecondary);
			setSecondaryHexInput(currentSecondary);
		}
	};

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

	const handleSecondaryHexInputChange = (value: string) => {
		// Allow clearing the secondary color
		if (!value) {
			setSecondaryHexInput("");
			setSecondary(null);
			setSecondaryInputError(null);
			return;
		}

		const normalized = value.startsWith("#") ? value : `#${value}`;
		setSecondaryHexInput(normalized);

		if (!/^#[0-9a-fA-F]{0,6}$/.test(normalized)) {
			setSecondaryInputError("Use up to six hex characters (0-9, A-F).");
			return;
		}

		setSecondaryInputError(null);
		if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
			setSecondary(normalized.toLowerCase());
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

	const handleSecondaryColorChange = (
		value: Parameters<typeof Color.rgb>[0],
	) => {
		if (Array.isArray(value) && value.length >= 3) {
			const [r, g, b] = value;
			const hex = `#${[r, g, b]
				.map((x) => Math.round(x).toString(16).padStart(2, "0"))
				.join("")}`;
			setTempSecondaryHex(hex);
			setSecondaryHexInput(hex);
			setSecondaryInputError(null);
		}
	};

	const handleSecondaryPickerClose = () => {
		setSecondaryPickerOpen(false);
		setTempSecondaryHex(secondaryHex ?? "");
	};

	const handleSecondaryPickerApply = () => {
		if (tempSecondaryHex) {
			setSecondary(tempSecondaryHex);
			setSecondaryHexInput(tempSecondaryHex);
		}
		setSecondaryInputError(null);
		setSecondaryPickerOpen(false);
	};

	const handleClearSecondary = () => {
		setSecondary(null);
		setSecondaryHexInput("");
		setTempSecondaryHex("");
		setSecondaryInputError(null);
	};

	// Get preview colors for a specific harmony - only show colors that differ between harmonies
	const getHarmonyPreviewColors = (harmonyType: string) => {
		const theme = harmonyPreviews[harmonyType];
		if (!theme) return null;
		const tokens = theme.tokens.light;
		// Only show secondary and accent (the harmony-derived colors)
		// Primary is always the same across harmonies, so we exclude it
		return [tokens.secondary, tokens.accent];
	};

	return (
		<>
			<Confetti
				isActive={showConfetti}
				onComplete={handleConfettiComplete}
				duration={1500}
			/>
			<Card className="w-full">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2">
						<SparklesIcon className="text-primary size-5" />
						Theme Designer
					</CardTitle>
					<CardDescription>
						Craft a contrast-safe shadcn/ui theme with your brand colors.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-8 pt-4">
					{error && (
						<p
							role="alert"
							className="text-destructive text-sm"
							aria-live="polite"
						>
							{error}
						</p>
					)}

					{/* COLORS SECTION */}
					<Section title="Colors">
						<div className="grid gap-6 md:grid-cols-2">
							{/* Primary Color */}
							<div className="space-y-2">
								<Label htmlFor={primaryColorInputId} className="text-sm">
									Primary Color
								</Label>
								<div className="flex items-center gap-3">
									<ColorSwatch color={primaryHex} size="lg" />
									<div className="flex flex-1 gap-2">
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
										<Dialog
											open={colorPickerOpen}
											onOpenChange={handleColorPickerOpenChange}
										>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													type="button"
													aria-label="Open color picker"
												>
													<PaletteIcon className="size-4" />
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-md">
												<DialogHeader>
													<DialogTitle>Pick Primary Color</DialogTitle>
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
														<Button
															variant="outline"
															onClick={handleColorPickerClose}
														>
															Cancel
														</Button>
														<Button onClick={handleColorPickerApply}>
															Apply
														</Button>
													</div>
												</div>
											</DialogContent>
										</Dialog>
									</div>
								</div>
								<p
									id={primaryColorHelpId}
									className="text-muted-foreground text-xs"
								>
									Six-digit hex code (e.g., #8b5cf6)
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

							{/* Secondary Color */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor={secondaryColorInputId} className="text-sm">
										Secondary Color
										<span className="text-muted-foreground ml-1 text-xs">
											(optional)
										</span>
									</Label>
									{secondaryHex && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleClearSecondary}
											className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
										>
											<XIcon className="size-3" />
											Clear
										</Button>
									)}
								</div>
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"size-14 shrink-0 rounded-lg border shadow-sm transition-all",
											secondaryHex
												? "border-border/50"
												: "border-muted-foreground/30 bg-muted/50 border-dashed",
										)}
										style={{
											backgroundColor: secondaryHex ?? undefined,
										}}
									/>
									<div className="flex flex-1 gap-2">
										<Input
											id={secondaryColorInputId}
											className="flex-1 font-mono text-sm"
											placeholder="Auto from harmony…"
											value={secondaryHexInput}
											onChange={(event) =>
												handleSecondaryHexInputChange(event.target.value.trim())
											}
											aria-invalid={Boolean(secondaryInputError)}
											aria-describedby={
												secondaryInputError
													? `${secondaryColorHelpId} ${secondaryColorErrorId}`
													: secondaryColorHelpId
											}
										/>
										<Dialog
											open={secondaryPickerOpen}
											onOpenChange={handleSecondaryPickerOpenChange}
										>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													type="button"
													aria-label="Open secondary color picker"
												>
													<PaletteIcon className="size-4" />
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-md">
												<DialogHeader>
													<DialogTitle>Pick Secondary Color</DialogTitle>
												</DialogHeader>
												<div className="space-y-4">
													<ColorPicker
														value={tempSecondaryHex || primaryHex}
														onChange={handleSecondaryColorChange}
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
														<Button
															variant="outline"
															onClick={handleSecondaryPickerClose}
														>
															Cancel
														</Button>
														<Button onClick={handleSecondaryPickerApply}>
															Apply
														</Button>
													</div>
												</div>
											</DialogContent>
										</Dialog>
									</div>
								</div>
								<p
									id={secondaryColorHelpId}
									className="text-muted-foreground text-xs"
								>
									{secondaryHex
										? "Custom color overrides harmony"
										: "Leave empty for auto-generated"}
								</p>
								{secondaryInputError && (
									<p
										id={secondaryColorErrorId}
										role="alert"
										className="text-destructive text-xs"
									>
										{secondaryInputError}
									</p>
								)}
							</div>
						</div>
					</Section>

					{/* HARMONY SECTION */}
					<Section title="Harmony">
						<div className="relative">
							<div
								className={cn(
									"grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3",
									secondaryHex && "pointer-events-none opacity-50 select-none",
								)}
							>
								{HARMONY_OPTIONS.map((harmonyType) => {
									const config = HARMONY_CONFIGS[harmonyType];
									const isSelected = harmony === harmonyType;
									const previewColors = getHarmonyPreviewColors(harmonyType);

									return (
										<motion.button
											key={harmonyType}
											type="button"
											onClick={() => setHarmony(harmonyType)}
											aria-disabled={!!secondaryHex}
											className={cn(
												"group relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-colors",
												isSelected
													? "border-primary bg-primary/5"
													: "border-border bg-card hover:border-primary/50",
											)}
											whileHover={secondaryHex ? {} : { scale: 1.02 }}
											whileTap={secondaryHex ? {} : { scale: 0.98 }}
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 25,
											}}
										>
											<div className="flex items-center gap-2">
												<div
													className={cn(
														"flex size-4 items-center justify-center rounded-full border-2 transition-colors",
														isSelected
															? "border-primary bg-primary"
															: "border-muted-foreground/50",
													)}
												>
													{isSelected && (
														<motion.div
															className="bg-primary-foreground size-1.5 rounded-full"
															initial={{ scale: 0 }}
															animate={{ scale: 1 }}
															transition={{
																type: "spring",
																stiffness: 500,
																damping: 25,
															}}
														/>
													)}
												</div>
												<span className="text-sm font-medium">
													{config.name}
												</span>
											</div>
											<p className="text-muted-foreground line-clamp-2 text-xs">
												{config.description}
											</p>
											{previewColors ? (
												<div className="flex gap-2">
													{previewColors.map((color, idx) => (
														<motion.div
															key={idx}
															className="border-border/50 h-8 flex-1 rounded-md border shadow-sm"
															style={{
																backgroundColor: formatOklchCss(color),
															}}
															initial={false}
															animate={{
																scale: isSelected ? 1 : 0.95,
																opacity: isSelected ? 1 : 0.8,
															}}
															transition={{
																type: "spring",
																stiffness: 300,
																damping: 20,
															}}
														/>
													))}
												</div>
											) : (
												<div className="flex gap-2">
													{Array.from({ length: 2 }).map((_, idx) => (
														<Skeleton
															key={idx}
															className="border-border/50 h-8 flex-1 rounded-md border"
														/>
													))}
												</div>
											)}
										</motion.button>
									);
								})}
							</div>

							{/* Blur overlay when secondary color is set */}
							{secondaryHex && (
								<div className="bg-background/60 absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-sm">
									<p className="text-muted-foreground px-4 text-center text-sm">
										Harmony is overridden by your custom secondary color
									</p>
								</div>
							)}
						</div>
					</Section>

					{/* STYLE SECTION */}
					<Section title="Style">
						<div className="space-y-6">
							{/* Surface Style */}
							<div className="space-y-3">
								<Label className="text-sm">Surface Style</Label>
								<div className="grid grid-cols-2 gap-3">
									{BACKGROUND_STRATEGY_OPTIONS.map((option) => {
										const isSelected = option.value === backgroundStrategy;

										return (
											<motion.button
												key={option.value}
												type="button"
												onClick={() => setBackgroundStrategy(option.value)}
												className={cn(
													"group relative flex flex-col gap-1 rounded-xl border-2 p-3 text-left transition-colors",
													isSelected
														? "border-primary bg-primary/5"
														: "border-border bg-card hover:border-primary/50",
												)}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 25,
												}}
											>
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"flex size-4 items-center justify-center rounded-full border-2 transition-colors",
															isSelected
																? "border-primary bg-primary"
																: "border-muted-foreground/50",
														)}
													>
														{isSelected && (
															<motion.div
																className="bg-primary-foreground size-1.5 rounded-full"
																initial={{ scale: 0 }}
																animate={{ scale: 1 }}
																transition={{
																	type: "spring",
																	stiffness: 500,
																	damping: 25,
																}}
															/>
														)}
													</div>
													<span className="text-sm font-medium">
														{option.title}
													</span>
												</div>
												<p className="text-muted-foreground text-xs">
													{option.description}
												</p>
											</motion.button>
										);
									})}
								</div>
							</div>

							{/* Radius Selection */}
							<div className="space-y-3">
								<Label className="text-sm">
									Border Radius
									<span className="text-muted-foreground ml-2 font-normal">
										{RADIUS_OPTIONS.find((o) => o.value === radius)?.label}
									</span>
								</Label>
								<TooltipProvider delayDuration={0}>
									<ToggleGroup
										type="single"
										value={radius.toString()}
										onValueChange={(value) => {
											if (value) setRadius(parseFloat(value));
										}}
										variant="outline"
										spacing={0}
										className="border-input inline-flex flex-wrap gap-0 overflow-hidden rounded-lg border"
									>
										{RADIUS_OPTIONS.map((option) => {
											// Create visual representation of border radius
											const radiusPercent = Math.round(option.value * 100);
											const borderRadius = `${radiusPercent}%`;
											const isSelected = radius === option.value;
											return (
												<Tooltip key={option.value}>
													<TooltipTrigger asChild>
														<ToggleGroupItem
															value={option.value.toString()}
															aria-label={option.label}
															className={cn(
																"relative transition-colors",
																isSelected &&
																	"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
															)}
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
						</div>
					</Section>

					{/* PREVIEW SECTION */}
					{deferredPreviewTheme && (
						<Section title="Preview">
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
										<motion.div
											key={token}
											className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-3"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 25,
											}}
										>
											<motion.div
												className="border-border/50 h-12 w-full rounded-md border shadow-sm"
												style={{ backgroundColor: formatOklchCss(color) }}
												whileHover={{ scale: 1.02 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 25,
												}}
											/>
											<div className="text-xs">
												<div className="font-medium">{name}</div>
												<div className="text-muted-foreground truncate font-mono text-[10px]">
													{formatOklchCss(color)}
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						</Section>
					)}
				</CardContent>
				<CardFooter className="flex justify-between gap-3 border-t pt-6">
					<Button variant="outline" onClick={resetTheme} disabled={isApplying}>
						Reset to Default
					</Button>
					<Button
						onClick={applyTheme}
						disabled={!hasChanges || isApplying}
						className="min-w-32 gap-2"
					>
						{isApplying ? (
							<>
								<Loader2Icon className="size-4 animate-spin" />
								Applying…
							</>
						) : status === "previewing" ? (
							<>
								<Loader2Icon className="size-4 animate-spin" />
								Generating…
							</>
						) : (
							<>
								<SparklesIcon className="size-4" />
								Apply Theme
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</>
	);
}
