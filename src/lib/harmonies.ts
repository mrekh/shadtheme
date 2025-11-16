import {
	type LocalOklch,
	adjustChroma,
	adjustHue,
	adjustLightness,
	clampOklch,
} from "./color-spaces";

export type HarmonyType =
	| "monochromatic"
	| "complementary"
	| "split-complementary"
	| "triadic"
	| "tetradic"
	| "analogous"
	| "rave-club"
	| "extra-terrestrial"
	| "party-bus"
	| "soft-pastels";

export interface HarmonyConfig {
	name: string;
	description: string;
	requiresSecondary?: boolean;
}

export const HARMONY_CONFIGS: Record<HarmonyType, HarmonyConfig> = {
	monochromatic: {
		name: "Monochromatic",
		description: "Single hue with varying lightness and chroma",
	},
	complementary: {
		name: "Complementary",
		description: "Opposite colors on the color wheel",
	},
	"split-complementary": {
		name: "Split Complementary",
		description: "Base color plus two adjacent to its complement",
	},
	triadic: {
		name: "Triadic",
		description: "Three evenly spaced colors",
	},
	tetradic: {
		name: "Tetradic",
		description: "Four colors forming a rectangle",
	},
	analogous: {
		name: "Analogous",
		description: "Adjacent colors on the color wheel",
	},
	"rave-club": {
		name: "Rave Club",
		description: "High chroma, vibrant neon colors",
	},
	"extra-terrestrial": {
		name: "Extra Terrestrial",
		description: "Cool, desaturated colors with blue-green tones",
	},
	"party-bus": {
		name: "Party Bus",
		description: "Warm, energetic colors with high saturation",
	},
	"soft-pastels": {
		name: "Soft Pastels",
		description: "Low chroma, high lightness colors",
	},
};

/**
 * Generate harmony colors from base color(s)
 */
export function generateHarmony(
	primary: LocalOklch,
	secondary: LocalOklch | null,
	harmony: HarmonyType,
): {
	primary: LocalOklch;
	secondary: LocalOklch;
	accent: LocalOklch;
	destructive: LocalOklch;
} {
	switch (harmony) {
		case "monochromatic": {
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(primary, 0.15);
			return {
				primary: clampOklch(primary),
				secondary: secondaryColor,
				accent: adjustLightness(primary, -0.1),
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "complementary": {
			const complement = adjustHue(primary, 180);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(complement, 0.1);
			return {
				primary: clampOklch(primary),
				secondary: secondaryColor,
				accent: complement,
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "split-complementary": {
			const complement = adjustHue(primary, 180);
			const split1 = adjustHue(complement, 30);
			const split2 = adjustHue(complement, -30);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(split1, 0.05);
			return {
				primary: clampOklch(primary),
				secondary: secondaryColor,
				accent: split2,
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "triadic": {
			const tri1 = adjustHue(primary, 120);
			const tri2 = adjustHue(primary, 240);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(tri1, 0.1);
			return {
				primary: clampOklch(primary),
				secondary: secondaryColor,
				accent: tri2,
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "tetradic": {
			const tet1 = adjustHue(primary, 90);
			const tet2 = adjustHue(primary, 180);
			const tet3 = adjustHue(primary, 270);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(tet1, 0.1);
			return {
				primary: clampOklch(primary),
				secondary: secondaryColor,
				accent: tet2,
				destructive: tet3,
			};
		}

		case "analogous": {
			const analog1 = adjustHue(primary, 30);
			const analog2 = adjustHue(primary, -30);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(analog1, 0.05);
			return {
				primary: clampOklch(primary),
				secondary: secondaryColor,
				accent: analog2,
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "rave-club": {
			const boosted = adjustChroma(primary, 0.15);
			const neon = adjustLightness(boosted, -0.1);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustHue(neon, 60);
			return {
				primary: clampOklch(boosted),
				secondary: secondaryColor,
				accent: neon,
				destructive: adjustHue(neon, 120),
			};
		}

		case "extra-terrestrial": {
			const cool = adjustHue(primary, -30);
			const desaturated = adjustChroma(cool, -0.1);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(desaturated, 0.1);
			return {
				primary: clampOklch(desaturated),
				secondary: secondaryColor,
				accent: adjustHue(desaturated, -60),
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "party-bus": {
			const warm = adjustHue(primary, 20);
			const saturated = adjustChroma(warm, 0.1);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(saturated, 0.15);
			return {
				primary: clampOklch(saturated),
				secondary: secondaryColor,
				accent: adjustHue(saturated, -40),
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
		}

		case "soft-pastels": {
			const light = adjustLightness(primary, 0.2);
			const soft = adjustChroma(light, -0.15);
			const secondaryColor = secondary
				? clampOklch(secondary)
				: adjustLightness(soft, 0.1);
			return {
				primary: clampOklch(soft),
				secondary: secondaryColor,
				accent: adjustLightness(soft, -0.05),
				destructive: { mode: "oklch", l: 0.7, c: 0.15, h: 27.325 },
			};
		}

		default:
			return {
				primary: clampOklch(primary),
				secondary: secondary
					? clampOklch(secondary)
					: adjustLightness(primary, 0.15),
				accent: adjustLightness(primary, -0.1),
				destructive: { mode: "oklch", l: 0.577, c: 0.245, h: 27.325 },
			};
	}
}

/**
 * Generate semantic color tokens for light theme
 */
export function generateLightTheme(
	harmony: ReturnType<typeof generateHarmony>,
): Record<string, LocalOklch> {
	const { primary, secondary, accent, destructive } = harmony;

	const primaryClamped = clampOklch(primary);
	const secondaryClamped = clampOklch(secondary);
	const accentClamped = clampOklch(accent);
	const destructiveClamped = clampOklch(destructive);
	const foreground: LocalOklch = {
		mode: "oklch",
		l: 0.129,
		c: 0.042,
		h: 264.695,
	};

	return {
		background: { mode: "oklch", l: 1, c: 0, h: 0 },
		foreground,
		card: { mode: "oklch", l: 1, c: 0, h: 0 },
		"card-foreground": foreground,
		popover: { mode: "oklch", l: 1, c: 0, h: 0 },
		"popover-foreground": foreground,
		primary: primaryClamped,
		"primary-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		secondary: secondaryClamped,
		"secondary-foreground": foreground,
		muted: { mode: "oklch", l: 0.968, c: 0.007, h: 247.896 },
		"muted-foreground": { mode: "oklch", l: 0.554, c: 0.046, h: 257.417 },
		accent: accentClamped,
		"accent-foreground": foreground,
		destructive: destructiveClamped,
		"destructive-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		border: { mode: "oklch", l: 0.929, c: 0.013, h: 255.508 },
		input: { mode: "oklch", l: 0.929, c: 0.013, h: 255.508 },
		ring: { mode: "oklch", l: 0.704, c: 0.04, h: 256.788 },
		"chart-1": { mode: "oklch", l: 0.646, c: 0.222, h: 41.116 },
		"chart-2": { mode: "oklch", l: 0.6, c: 0.118, h: 184.704 },
		"chart-3": { mode: "oklch", l: 0.398, c: 0.07, h: 227.392 },
		"chart-4": { mode: "oklch", l: 0.828, c: 0.189, h: 84.429 },
		"chart-5": { mode: "oklch", l: 0.769, c: 0.188, h: 70.08 },
		sidebar: { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		"sidebar-foreground": foreground,
		"sidebar-primary": primaryClamped,
		"sidebar-primary-foreground": {
			mode: "oklch",
			l: 0.984,
			c: 0.003,
			h: 247.858,
		},
		"sidebar-accent": { mode: "oklch", l: 0.968, c: 0.007, h: 247.896 },
		"sidebar-accent-foreground": foreground,
		"sidebar-border": { mode: "oklch", l: 0.929, c: 0.013, h: 255.508 },
		"sidebar-ring": { mode: "oklch", l: 0.704, c: 0.04, h: 256.788 },
	};
}

/**
 * Generate semantic color tokens for dark theme
 */
export function generateDarkTheme(
	harmony: ReturnType<typeof generateHarmony>,
): Record<string, LocalOklch> {
	const { primary, secondary, accent, destructive } = harmony;

	// Dark theme uses darker backgrounds and lighter foregrounds
	const darkPrimary = adjustLightness(primary, -0.1);
	const darkSecondary = adjustLightness(secondary, -0.15);

	return {
		background: { mode: "oklch", l: 0.129, c: 0.042, h: 264.695 },
		foreground: { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		card: { mode: "oklch", l: 0.208, c: 0.042, h: 265.755 },
		"card-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		popover: { mode: "oklch", l: 0.208, c: 0.042, h: 265.755 },
		"popover-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		primary: clampOklch({ ...darkPrimary, l: Math.max(0.3, darkPrimary.l) }),
		"primary-foreground": { mode: "oklch", l: 0.208, c: 0.042, h: 265.755 },
		secondary: clampOklch(darkSecondary),
		"secondary-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		muted: { mode: "oklch", l: 0.279, c: 0.041, h: 260.031 },
		"muted-foreground": { mode: "oklch", l: 0.704, c: 0.04, h: 256.788 },
		accent: clampOklch(adjustLightness(accent, -0.15)),
		"accent-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		destructive: clampOklch(adjustLightness(destructive, -0.1)),
		"destructive-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		border: { mode: "oklch", l: 1, c: 0, h: 0, alpha: 0.1 },
		input: { mode: "oklch", l: 1, c: 0, h: 0, alpha: 0.15 },
		ring: { mode: "oklch", l: 0.551, c: 0.027, h: 264.364 },
		"chart-1": { mode: "oklch", l: 0.488, c: 0.243, h: 264.376 },
		"chart-2": { mode: "oklch", l: 0.696, c: 0.17, h: 162.48 },
		"chart-3": { mode: "oklch", l: 0.769, c: 0.188, h: 70.08 },
		"chart-4": { mode: "oklch", l: 0.627, c: 0.265, h: 303.9 },
		"chart-5": { mode: "oklch", l: 0.645, c: 0.246, h: 16.439 },
		sidebar: { mode: "oklch", l: 0.208, c: 0.042, h: 265.755 },
		"sidebar-foreground": { mode: "oklch", l: 0.984, c: 0.003, h: 247.858 },
		"sidebar-primary": { mode: "oklch", l: 0.488, c: 0.243, h: 264.376 },
		"sidebar-primary-foreground": {
			mode: "oklch",
			l: 0.984,
			c: 0.003,
			h: 247.858,
		},
		"sidebar-accent": { mode: "oklch", l: 0.279, c: 0.041, h: 260.031 },
		"sidebar-accent-foreground": {
			mode: "oklch",
			l: 0.984,
			c: 0.003,
			h: 247.858,
		},
		"sidebar-border": { mode: "oklch", l: 1, c: 0, h: 0, alpha: 0.1 },
		"sidebar-ring": { mode: "oklch", l: 0.551, c: 0.027, h: 264.364 },
	};
}
