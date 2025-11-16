import { type LocalOklch, adjustLightness, clampOklch } from "../color-spaces";
import { ensureContrast } from "./contrast";
import type { PaletteAnchors, ThemeToken } from "./types";

/**
 * Generate neutral background colors from primary hue
 * Creates a neutral ladder with low chroma, preserving subtle hue
 */
function generateNeutralLadder(
	primary: LocalOklch,
	isDark: boolean,
): {
	background: LocalOklch;
	card: LocalOklch;
	popover: LocalOklch;
	muted: LocalOklch;
	border: LocalOklch;
	input: LocalOklch;
} {
	// Extract hue from primary but use very low chroma for neutrals
	const neutralHue = primary.h ?? 0;
	const lowChroma = Math.min(0.01, primary.c * 0.1);

	if (isDark) {
		const background = clampOklch({
			mode: "oklch",
			l: 0.08,
			c: lowChroma,
			h: neutralHue,
		});
		const card = clampOklch({
			mode: "oklch",
			l: 0.14,
			c: lowChroma,
			h: neutralHue,
		});
		const popover = clampOklch({
			mode: "oklch",
			l: 0.165,
			c: lowChroma,
			h: neutralHue,
		});
		const muted = clampOklch({
			mode: "oklch",
			l: 0.22,
			c: lowChroma * 1.5,
			h: neutralHue,
		});
		const border = clampOklch({
			mode: "oklch",
			l: 0.32,
			c: lowChroma * 2,
			h: neutralHue,
		});
		const input = clampOklch({
			mode: "oklch",
			l: 0.36,
			c: lowChroma * 2,
			h: neutralHue,
		});

		return {
			background,
			card,
			popover,
			muted,
			border,
			input,
		};
	}

	// Light theme
	return {
		background: clampOklch({
			mode: "oklch",
			l: 0.995,
			c: lowChroma * 0.4,
			h: neutralHue,
		}),
		card: clampOklch({
			mode: "oklch",
			l: 0.988,
			c: lowChroma * 0.5,
			h: neutralHue,
		}),
		popover: clampOklch({
			mode: "oklch",
			l: 0.984,
			c: lowChroma * 0.6,
			h: neutralHue,
		}),
		muted: clampOklch({
			mode: "oklch",
			l: 0.955,
			c: lowChroma * 0.8,
			h: neutralHue,
		}),
		border: clampOklch({
			mode: "oklch",
			l: 0.9,
			c: lowChroma * 1.5,
			h: neutralHue,
		}),
		input: clampOklch({
			mode: "oklch",
			l: 0.915,
			c: lowChroma * 1.7,
			h: neutralHue,
		}),
	};
}

function generatePrimaryBackgroundNeutrals(
	base: LocalOklch,
	isDark: boolean,
): {
	background: LocalOklch;
	card: LocalOklch;
	popover: LocalOklch;
	muted: LocalOklch;
	border: LocalOklch;
	input: LocalOklch;
} {
	const normalized = clampOklch({
		mode: "oklch",
		l: base.l,
		c: Math.max(0.002, base.c * 0.4),
		h: base.h ?? 0,
	});

	if (!isDark) {
		const background = clampOklch({
			...normalized,
			l: Math.min(0.995, normalized.l + 0.22),
			c: normalized.c * 0.75,
		});
		const card = adjustLightness(background, -0.01);
		const popover = adjustLightness(background, -0.015);
		const muted = clampOklch({
			...adjustLightness(background, -0.1),
			c: Math.max(0.002, background.c * 0.55),
		});
		const border = clampOklch({
			mode: "oklch",
			l: Math.max(0, background.l - 0.16),
			c: background.c * 0.3,
			h: background.h,
		});
		const input = clampOklch({
			mode: "oklch",
			l: Math.max(0, background.l - 0.12),
			c: background.c * 0.35,
			h: background.h,
		});
		return { background, card, popover, muted, border, input };
	}

	const background = clampOklch({
		...normalized,
		l: Math.max(0.06, normalized.l - 0.32),
		c: normalized.c * 1.1,
	});
	const card = adjustLightness(background, 0.05);
	const popover = adjustLightness(background, 0.07);
	const muted = clampOklch({
		...adjustLightness(background, 0.14),
		c: background.c * 0.8,
	});
	const border = clampOklch({
		mode: "oklch",
		l: Math.min(0.7, background.l + 0.42),
		c: background.c * 0.3,
		h: background.h,
	});
	const input = clampOklch({
		mode: "oklch",
		l: Math.min(0.58, background.l + 0.32),
		c: background.c * 0.35,
		h: background.h,
	});
	return { background, card, popover, muted, border, input };
}

/**
 * Generate foreground color that contrasts with background
 */
function generateContrastForeground(
	background: LocalOklch,
	{
		preferLight,
		baseLightnessLight = 0.92,
		baseLightnessDark = 0.16,
		minChroma = 0.01,
	}: {
		preferLight?: boolean;
		baseLightnessLight?: number;
		baseLightnessDark?: number;
		minChroma?: number;
	} = {},
): LocalOklch {
	const shouldUseLight =
		typeof preferLight === "boolean" ? preferLight : background.l < 0.55;
	const seed = clampOklch({
		mode: "oklch",
		l: shouldUseLight ? baseLightnessLight : baseLightnessDark,
		c: Math.max(minChroma, (background.c ?? 0) * 0.25),
		h: background.h ?? 0,
	});

	const { foreground } = ensureContrast(seed, background, {
		targetRatio: 4.5,
	});
	return clampOklch(foreground);
}

function generateForeground(background: LocalOklch): LocalOklch {
	return generateContrastForeground(background);
}

/**
 * Generate primary foreground (high contrast with primary background)
 */
function generatePrimaryForeground(primary: LocalOklch): LocalOklch {
	const preferLight = primary.l < 0.55;
	return generateContrastForeground(primary, {
		preferLight,
		baseLightnessLight: 0.94,
		baseLightnessDark: 0.18,
		minChroma: 0.008,
	});
}

/**
 * Generate ring color (focus indicator)
 */
function generateRing(primary: LocalOklch, isDark: boolean): LocalOklch {
	if (isDark) {
		return clampOklch({
			mode: "oklch",
			l: 0.38,
			c: primary.c * 0.5,
			h: primary.h ?? 0,
		});
	}

	return clampOklch({
		mode: "oklch",
		l: 0.702,
		c: primary.c * 0.3,
		h: primary.h ?? 0,
	});
}

/**
 * Generate chart colors (5 distinct colors with good contrast)
 */
function generateChartColors(
	primary: LocalOklch,
	isDark: boolean,
): {
	"chart-1": LocalOklch;
	"chart-2": LocalOklch;
	"chart-3": LocalOklch;
	"chart-4": LocalOklch;
	"chart-5": LocalOklch;
} {
	const baseHue = primary.h ?? 0;
	const hueSteps = [0, 60, 120, 180, 240]; // Spread around color wheel

	return {
		"chart-1": clampOklch({
			mode: "oklch",
			l: isDark ? 0.488 : 0.811,
			c: isDark ? 0.243 : 0.111,
			h: (baseHue + hueSteps[0]) % 360,
		}),
		"chart-2": clampOklch({
			mode: "oklch",
			l: isDark ? 0.696 : 0.606,
			c: isDark ? 0.17 : 0.25,
			h: (baseHue + hueSteps[1]) % 360,
		}),
		"chart-3": clampOklch({
			mode: "oklch",
			l: isDark ? 0.769 : 0.541,
			c: isDark ? 0.188 : 0.281,
			h: (baseHue + hueSteps[2]) % 360,
		}),
		"chart-4": clampOklch({
			mode: "oklch",
			l: isDark ? 0.627 : 0.491,
			c: isDark ? 0.265 : 0.27,
			h: (baseHue + hueSteps[3]) % 360,
		}),
		"chart-5": clampOklch({
			mode: "oklch",
			l: isDark ? 0.645 : 0.432,
			c: isDark ? 0.246 : 0.232,
			h: (baseHue + hueSteps[4]) % 360,
		}),
	};
}

/**
 * Generate sidebar colors (similar to background but with primary hue bias)
 */
function generateSidebarColors(
	primary: LocalOklch,
	background: LocalOklch,
	isDark: boolean,
): {
	sidebar: LocalOklch;
	"sidebar-foreground": LocalOklch;
	"sidebar-primary": LocalOklch;
	"sidebar-primary-foreground": LocalOklch;
	"sidebar-accent": LocalOklch;
	"sidebar-accent-foreground": LocalOklch;
	"sidebar-border": LocalOklch;
	"sidebar-ring": LocalOklch;
} {
	const primaryHue = primary.h ?? 0;
	const sidebarBg = isDark
		? clampOklch({
				mode: "oklch",
				l: 0.21,
				c: Math.min(0.01, primary.c * 0.2),
				h: primaryHue,
			})
		: clampOklch({
				mode: "oklch",
				l: 0.985,
				c: Math.min(0.003, primary.c * 0.1),
				h: primaryHue,
			});

	const sidebarForeground = generateForeground(sidebarBg);
	const sidebarPrimary = isDark
		? adjustLightness(primary, -0.1)
		: clampOklch(primary);
	const sidebarPrimaryForeground = generatePrimaryForeground(sidebarPrimary);
	const sidebarAccent = isDark
		? clampOklch({
				mode: "oklch",
				l: 0.274,
				c: Math.min(0.01, primary.c * 0.3),
				h: primaryHue,
			})
		: clampOklch({
				mode: "oklch",
				l: 0.967,
				c: Math.min(0.007, primary.c * 0.2),
				h: primaryHue,
			});
	const sidebarAccentForeground = generateForeground(sidebarAccent);
	const sidebarBorder = isDark
		? clampOklch({
				mode: "oklch",
				l: 1,
				c: 0,
				h: 0,
				alpha: 0.1,
			})
		: clampOklch({
				mode: "oklch",
				l: 0.929,
				c: Math.min(0.013, primary.c * 0.3),
				h: primaryHue,
			});
	const sidebarRing = generateRing(primary, isDark);

	return {
		sidebar: sidebarBg,
		"sidebar-foreground": sidebarForeground,
		"sidebar-primary": clampOklch(sidebarPrimary),
		"sidebar-primary-foreground": clampOklch(sidebarPrimaryForeground),
		"sidebar-accent": clampOklch(sidebarAccent),
		"sidebar-accent-foreground": clampOklch(sidebarAccentForeground),
		"sidebar-border": clampOklch(sidebarBorder),
		"sidebar-ring": clampOklch(sidebarRing),
	};
}

/**
 * Map palette anchors to all theme tokens for a given mode
 */
export function mapPaletteToTokens(
	anchors: PaletteAnchors,
	isDark: boolean,
	options?: { backgroundStrategy?: "neutral" | "primary" },
): Record<ThemeToken, LocalOklch> {
	let neutrals = generateNeutralLadder(anchors.primary, isDark);
	if (options?.backgroundStrategy === "primary") {
		neutrals = generatePrimaryBackgroundNeutrals(anchors.primary, isDark);
	}
	const foreground = generateForeground(neutrals.background);
	const cardForeground = generateForeground(neutrals.card);
	const popoverForeground = generateForeground(neutrals.popover);
	const mutedForeground = generateForeground(neutrals.muted);

	// Primary colors
	const primary = isDark
		? clampOklch({
				...anchors.primary,
				l: Math.max(0.3, anchors.primary.l - 0.1),
			})
		: clampOklch(anchors.primary);
	const primaryForeground = generatePrimaryForeground(primary);

	// Secondary colors
	const secondary = isDark
		? clampOklch(adjustLightness(anchors.secondary, -0.15))
		: clampOklch(anchors.secondary);
	const secondaryForeground = generateForeground(secondary);

	// Accent colors
	const accent = isDark
		? clampOklch(adjustLightness(anchors.accent, -0.15))
		: clampOklch(anchors.accent);
	const accentForeground = generateForeground(accent);

	// Destructive colors
	const destructive = isDark
		? clampOklch(adjustLightness(anchors.destructive, -0.1))
		: clampOklch(anchors.destructive);
	const destructiveForeground = generatePrimaryForeground(destructive);

	const ring = generateRing(anchors.primary, isDark);
	const charts = generateChartColors(anchors.primary, isDark);
	const sidebar = generateSidebarColors(
		anchors.primary,
		neutrals.background,
		isDark,
	);

	// Build complete token map
	const tokens: Partial<Record<ThemeToken, LocalOklch>> = {
		background: neutrals.background,
		foreground,
		card: neutrals.card,
		"card-foreground": cardForeground,
		popover: neutrals.popover,
		"popover-foreground": popoverForeground,
		primary: clampOklch(primary),
		"primary-foreground": clampOklch(primaryForeground),
		secondary: clampOklch(secondary),
		"secondary-foreground": clampOklch(secondaryForeground),
		muted: neutrals.muted,
		"muted-foreground": clampOklch(mutedForeground),
		accent: clampOklch(accent),
		"accent-foreground": clampOklch(accentForeground),
		destructive: clampOklch(destructive),
		"destructive-foreground": clampOklch(destructiveForeground),
		border: neutrals.border,
		input: neutrals.input,
		ring: clampOklch(ring),
		...charts,
		...sidebar,
	};

	// Ensure all required tokens are present
	const allTokens: Record<ThemeToken, LocalOklch> = tokens as Record<
		ThemeToken,
		LocalOklch
	>;

	return allTokens;
}

/**
 * Apply contrast enforcement to all foreground/background pairs
 */
export function enforceTokenContrast(
	tokens: Record<ThemeToken, LocalOklch>,
): Record<ThemeToken, LocalOklch> {
	const fixed: Record<ThemeToken, LocalOklch> = { ...tokens };

	// Define contrast pairs
	const pairs: Array<[ThemeToken, ThemeToken]> = [
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
	];

	for (const [fgToken, bgToken] of pairs) {
		const fg = fixed[fgToken];
		const bg = fixed[bgToken] ?? fixed.background;
		if (!fg || !bg) continue;

		const result = ensureContrast(fg, bg, {
			targetRatio: 4.5,
			preferLightness: true,
		});
		fixed[fgToken] = result.foreground;
	}

	return fixed;
}
