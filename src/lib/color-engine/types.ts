import { type LocalOklch } from "../color-spaces";

/**
 * Parsed color input from user (always in OKLCH format)
 */
export interface ParsedColor {
	oklch: LocalOklch;
	hex: string;
}

/**
 * Tone scale step (shade/tint/tone)
 */
export type Tone = "shade" | "tint" | "tone";

/**
 * Palette intent - what role a color plays in the theme
 */
export type PaletteIntent =
	| "primary"
	| "secondary"
	| "accent"
	| "support"
	| "destructive"
	| "success"
	| "warning";

/**
 * Theme token name matching shadcn/ui CSS variables
 */
export type ThemeToken =
	| "background"
	| "foreground"
	| "card"
	| "card-foreground"
	| "popover"
	| "popover-foreground"
	| "primary"
	| "primary-foreground"
	| "secondary"
	| "secondary-foreground"
	| "muted"
	| "muted-foreground"
	| "accent"
	| "accent-foreground"
	| "destructive"
	| "destructive-foreground"
	| "border"
	| "input"
	| "ring"
	| "chart-1"
	| "chart-2"
	| "chart-3"
	| "chart-4"
	| "chart-5"
	| "sidebar"
	| "sidebar-foreground"
	| "sidebar-primary"
	| "sidebar-primary-foreground"
	| "sidebar-accent"
	| "sidebar-accent-foreground"
	| "sidebar-border"
	| "sidebar-ring";

/**
 * Contrast pair for validation
 */
export interface ContrastPair {
	foreground: ThemeToken;
	background: ThemeToken;
	targetRatio: number;
}

/**
 * Single color input
 */
export interface SingleColorInput {
	type: "single";
	primary: ParsedColor;
}

/**
 * Dual color input
 */
export interface DualColorInput {
	type: "dual";
	primary: ParsedColor;
	secondary: ParsedColor;
}

/**
 * Color input union type
 */
export type ColorInput = SingleColorInput | DualColorInput;

/**
 * Palette anchors generated from input colors
 */
export interface PaletteAnchors {
	primary: LocalOklch;
	secondary: LocalOklch;
	accent: LocalOklch;
	destructive: LocalOklch;
	support?: LocalOklch;
}

/**
 * Theme tokens for light and dark modes
 */
export interface ThemeTokens {
	light: Record<ThemeToken, LocalOklch>;
	dark: Record<ThemeToken, LocalOklch>;
}

/**
 * Contrast validation result
 */
export interface ContrastResult {
	ratio: number;
	aa: boolean;
	aaa: boolean;
	apca: number;
}

/**
 * Contrast validation warning
 */
export interface ContrastWarning {
	token: ThemeToken;
	foreground: ThemeToken;
	background: ThemeToken;
	result: ContrastResult;
	warning: boolean;
}

/**
 * Generated theme with tokens and validation
 */
export interface GeneratedTheme {
	tokens: ThemeTokens;
	contrastWarnings: ContrastWarning[];
}
