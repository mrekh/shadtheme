import {
	type LocalOklch,
	adjustHue,
	adjustLightness,
	clampOklch,
} from "../color-spaces";
import type { ColorInput, PaletteAnchors } from "./types";

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

/**
 * Harmony type for color generation
 */
export type HarmonyType =
	| "monochromatic"
	| "complementary"
	| "split-complementary"
	| "triadic"
	| "tetradic"
	| "analogous"
	| "square";

/**
 * Harmony configuration for UI display
 */
export interface HarmonyConfig {
	name: string;
	description: string;
	requiresSecondary?: boolean;
}

/**
 * Harmony configurations
 */
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
	square: {
		name: "Square",
		description: "Four colors evenly spaced around the color wheel",
	},
};

/**
 * Generate palette anchors based on input colors and harmony type
 */
export function generatePaletteAnchors(
	input: ColorInput,
	harmony: HarmonyType = "monochromatic",
): PaletteAnchors {
	const primary = input.primary.oklch;

	// If dual color input, use secondary directly (override harmony)
	if (input.type === "dual") {
		const secondary = input.secondary.oklch;
		return {
			primary: clampOklch(primary),
			secondary: clampOklch(secondary),
			accent: generateAccentFromPair(primary, secondary),
			destructive: generateDestructiveColor(primary),
		};
	}

	// Single color input - use harmony to generate secondary
	switch (harmony) {
		case "monochromatic": {
			const secondary = adjustLightness(primary, 0.15);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(secondary),
				accent: adjustLightness(primary, -0.1),
				destructive: generateDestructiveColor(primary),
			};
		}

		case "complementary": {
			const complement = adjustHue(primary, 180);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(complement, 0.1)),
				accent: clampOklch(complement),
				destructive: generateDestructiveColor(primary),
			};
		}

		case "split-complementary": {
			const complement = adjustHue(primary, 180);
			const split1 = adjustHue(complement, 30);
			const split2 = adjustHue(complement, -30);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(split1, 0.05)),
				accent: clampOklch(split2),
				destructive: generateDestructiveColor(primary),
			};
		}

		case "triadic": {
			const tri1 = adjustHue(primary, 120);
			const tri2 = adjustHue(primary, 240);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(tri1, 0.1)),
				accent: clampOklch(tri2),
				destructive: generateDestructiveColor(primary),
			};
		}

		case "tetradic": {
			// True tetradic (rectangle) uses 60°/180°/240° offsets
			const tet1 = adjustHue(primary, 60);
			const tet2 = adjustHue(primary, 180);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(tet1, 0.1)),
				accent: clampOklch(tet2),
				destructive: generateDestructiveColor(primary),
			};
		}

		case "analogous": {
			const analog1 = adjustHue(primary, 30);
			const analog2 = adjustHue(primary, -30);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(analog1, 0.05)),
				accent: clampOklch(analog2),
				destructive: generateDestructiveColor(primary),
			};
		}

		case "square": {
			// Square uses 90°/180°/270° offsets but keeps semantic destructive
			const square1 = adjustHue(primary, 90);
			const square2 = adjustHue(primary, 180);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(square1, 0.1)),
				accent: clampOklch(square2),
				destructive: generateDestructiveColor(primary),
			};
		}

		default:
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(primary, 0.15)),
				accent: clampOklch(adjustLightness(primary, -0.1)),
				destructive: generateDestructiveColor(primary),
			};
	}
}

/**
 * Generate accent color from primary/secondary pair
 */
function generateAccentFromPair(
	primary: LocalOklch,
	secondary: LocalOklch,
): LocalOklch {
	// Use midpoint hue, blend chroma, adjust lightness
	const primaryHue = primary.h ?? 0;
	const secondaryHue = secondary.h ?? 0;
	const hueDiff = Math.abs(primaryHue - secondaryHue);
	const midpointHue =
		hueDiff > 180
			? ((primaryHue + secondaryHue + 360) / 2) % 360
			: (primaryHue + secondaryHue) / 2;

	return clampOklch({
		mode: "oklch",
		l: (primary.l + secondary.l) / 2,
		c: Math.max(primary.c, secondary.c) * 0.8,
		h: midpointHue,
	});
}

/**
 * Generate destructive color (red/orange tones)
 * If primary is already red/orange (hue 0-50° or 350-360°), shift to magenta
 * to maintain semantic distinction
 */
function generateDestructiveColor(primary: LocalOklch): LocalOklch {
	const clampedPrimary = clampOklch(primary);
	const primaryHue = clampedPrimary.h ?? 0;

	// Detect if primary is in red/orange range (hue 0-50° or 350-360°)
	const isRedOrangePrimary =
		(primaryHue >= 0 && primaryHue <= 50) || primaryHue >= 350;

	let destructiveHue = 25; // Default warm red/orange

	if (isRedOrangePrimary) {
		// If primary is orange (30-50°), use pure red (10°)
		// If primary is red (0-30° or 350-360°), shift to magenta (340°)
		destructiveHue = primaryHue >= 30 && primaryHue <= 50 ? 10 : 340;
	}

	const targetLightness = clamp(clampedPrimary.l * 0.8 + 0.2, 0.4, 0.72);
	const targetChroma = clamp(clampedPrimary.c + 0.12, 0.18, 0.3);

	return clampOklch({
		mode: "oklch",
		l: targetLightness,
		c: targetChroma,
		h: destructiveHue,
	});
}
