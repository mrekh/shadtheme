import {
	type LocalOklch,
	formatOklchCss,
	oklchToHex,
	parseToOklch,
} from "../color-spaces";
import { checkContrast } from "./contrast";
import type { HarmonyType } from "./palette-strategies";
import { generatePaletteAnchors } from "./palette-strategies";
import { enforceTokenContrast, mapPaletteToTokens } from "./token-map";
import type {
	ColorInput,
	ContrastWarning,
	GeneratedTheme,
	ParsedColor,
	ThemeToken,
	ThemeTokens,
} from "./types";

// Re-export types for convenience
export type { HarmonyType } from "./palette-strategies";
export type {
	ColorInput,
	ContrastWarning,
	GeneratedTheme,
	ParsedColor,
	ThemeTokens,
} from "./types";

/**
 * Parse color string to ParsedColor
 */
function parseColor(color: string): ParsedColor | null {
	const oklch = parseToOklch(color);
	if (!oklch) return null;

	return {
		oklch,
		hex: oklchToHex(oklch),
	};
}

/**
 * Generate theme from color inputs
 */
export function generateThemeFromInputs(
	primaryColor: string,
	secondaryColor: string | null,
	harmony: HarmonyType = "monochromatic",
	options?: { backgroundStrategy?: "neutral" | "primary" },
): GeneratedTheme | null {
	// Parse primary color
	const primary = parseColor(primaryColor);
	if (!primary) return null;

	// Parse secondary color if provided
	const secondary = secondaryColor ? parseColor(secondaryColor) : null;

	// Build color input
	const input: ColorInput = secondary
		? { type: "dual", primary, secondary }
		: { type: "single", primary };

	// Generate palette anchors
	const anchors = generatePaletteAnchors(input, harmony);

	// Map to tokens for light and dark themes
	const lightTokensRaw = mapPaletteToTokens(anchors, false, {
		backgroundStrategy: options?.backgroundStrategy,
	});
	const darkTokensRaw = mapPaletteToTokens(anchors, true, {
		backgroundStrategy: options?.backgroundStrategy,
	});

	// Enforce contrast
	const lightTokens = enforceTokenContrast(lightTokensRaw);
	const darkTokens = enforceTokenContrast(darkTokensRaw);

	const tokens: ThemeTokens = {
		light: lightTokens,
		dark: darkTokens,
	};

	// Validate contrast and generate warnings
	const contrastWarnings = validateThemeContrast(tokens);

	return {
		tokens,
		contrastWarnings,
	};
}

/**
 * Validate all foreground/background pairs in a theme
 */
function validateThemeContrast(tokens: ThemeTokens): ContrastWarning[] {
	const warnings: ContrastWarning[] = [];

	const pairs: Array<[string, string]> = [
		["foreground", "background"],
		["card-foreground", "card"],
		["popover-foreground", "popover"],
		["primary-foreground", "primary"],
		["secondary-foreground", "secondary"],
		["muted-foreground", "muted"],
		["accent-foreground", "accent"],
		["destructive-foreground", "destructive"],
		["sidebar-foreground", "sidebar"],
		["sidebar-primary-foreground", "sidebar-primary"],
		["sidebar-accent-foreground", "sidebar-accent"],
		["sidebar-border", "sidebar"],
		["sidebar-ring", "sidebar"],
	];

	// Check both light and dark themes
	for (const [, themeTokens] of [
		["light", tokens.light],
		["dark", tokens.dark],
	] as const) {
		for (const [fgToken, bgToken] of pairs) {
			const fg = themeTokens[fgToken as keyof typeof themeTokens];
			const bg =
				themeTokens[bgToken as keyof typeof themeTokens] ??
				themeTokens.background;

			if (!fg || !bg) continue;

			const result = checkContrast(fg, bg);
			warnings.push({
				token: fgToken as ThemeToken,
				foreground: fgToken as ThemeToken,
				background: bgToken as ThemeToken,
				result,
				warning: !result.aa,
			});
		}
	}

	return warnings;
}

/**
 * Serialize theme tokens to CSS custom properties
 */
export function serializeThemeCss(
	tokens: ThemeTokens,
	options?: { radiusRem?: number },
): {
	themeInline: string;
	root: string;
	dark: string;
} {
	const radiusValue =
		typeof options?.radiusRem === "number"
			? `${options.radiusRem}rem`
			: "0.625rem";

	const themeInline = `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}`;

	const root = `:root {
  --radius: ${radiusValue};
${Object.entries(tokens.light)
	.map(([key, value]) => `  --${key}: ${formatOklchCss(value)};`)
	.join("\n")}
}`;

	const dark = `.dark {
${Object.entries(tokens.dark)
	.map(([key, value]) => `  --${key}: ${formatOklchCss(value)};`)
	.join("\n")}
}`;

	return {
		themeInline,
		root,
		dark,
	};
}

/**
 * Generate CSS for live preview (scoped to a wrapper)
 */
function buildPreviewVars(entries: [string, LocalOklch][]): string {
	return entries
		.map(
			([key, value]) =>
				`  --${key}: ${formatOklchCss(value)};\n  --color-${key}: var(--${key});`,
		)
		.join("\n");
}

export function generatePreviewCss(tokens: ThemeTokens): string {
	const lightVars = buildPreviewVars(Object.entries(tokens.light));
	const darkVars = buildPreviewVars(Object.entries(tokens.dark));

	return `
[data-theme-preview] {
${lightVars}
}

[data-theme-preview].dark {
${darkVars}
}
`;
}
