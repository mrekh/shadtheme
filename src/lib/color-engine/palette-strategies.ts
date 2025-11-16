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
 * Build a tone scale from a base color
 * @param base - Base color in OKLCH
 * @param steps - Number of steps in the scale (should be odd, center is base)
 * @param lightnessRange - Range of lightness adjustment (e.g., 0.3 means ±30% lightness)
 */
export function buildToneScale(
	base: LocalOklch,
	steps: number = 9,
	lightnessRange: number = 0.4,
): LocalOklch[] {
	const clamped = clampOklch(base);
	const center = Math.floor(steps / 2);
	const scale: LocalOklch[] = [];

	for (let i = 0; i < steps; i++) {
		const delta = (i - center) / center;
		const lightnessDelta = delta * lightnessRange;
		scale.push(clampOklch({ ...clamped, l: clamped.l + lightnessDelta }));
	}

	return scale;
}

/**
 * Shift chroma while preserving lightness and hue
 */
export function shiftChroma(color: LocalOklch, delta: number): LocalOklch {
	return clampOklch({
		...color,
		c: Math.max(0, Math.min(0.4, color.c + delta)),
	});
}

/**
 * Shift hue within a band (useful for analogous colors)
 */
export function shiftHueBand(color: LocalOklch, delta: number): LocalOklch {
	return adjustHue(color, delta);
}

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
			const tet1 = adjustHue(primary, 90);
			const tet2 = adjustHue(primary, 180);
			const tet3 = adjustHue(primary, 270);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(tet1, 0.1)),
				accent: clampOklch(tet2),
				destructive: clampOklch(tet3),
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
			const square1 = adjustHue(primary, 90);
			const square2 = adjustHue(primary, 180);
			const square3 = adjustHue(primary, 270);
			return {
				primary: clampOklch(primary),
				secondary: clampOklch(adjustLightness(square1, 0.1)),
				accent: clampOklch(square2),
				destructive: clampOklch(square3),
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
 * If primary is already red-ish, shift it; otherwise use standard red
 */
function generateDestructiveColor(primary: LocalOklch): LocalOklch {
	const baseHue = 25; // warm red/orange
	const clampedPrimary = clampOklch(primary);

	const targetLightness = clamp(clampedPrimary.l * 0.8 + 0.2, 0.4, 0.72);
	const targetChroma = clamp(clampedPrimary.c + 0.12, 0.18, 0.3);

	return clampOklch({
		mode: "oklch",
		l: targetLightness,
		c: targetChroma,
		h: baseHue,
	});
}
