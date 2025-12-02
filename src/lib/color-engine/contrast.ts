import { APCAcontrast, sRGBtoY } from "apca-w3";
import { converter } from "culori";

import { type LocalOklch, clampOklch } from "../color-spaces";
import type { ContrastResult } from "./types";

const toRgb = converter("rgb");

/**
 * Calculate relative luminance per WCAG 2.1 specification
 * Converts from OKLCH to sRGB and applies the proper luminance formula
 * @see https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(color: LocalOklch): number {
	const rgb = toRgb(color);
	if (!rgb) return 0;

	// WCAG 2.1 relative luminance formula
	// First linearize each sRGB channel
	const linearize = (c: number): number => {
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	};

	const r = linearize(rgb.r ?? 0);
	const g = linearize(rgb.g ?? 0);
	const b = linearize(rgb.b ?? 0);

	// Then apply luminance coefficients
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG 2.1 contrast ratio
 */
export function calculateContrastRatio(
	foreground: LocalOklch,
	background: LocalOklch,
): number {
	const l1 = getLuminance(foreground);
	const l2 = getLuminance(background);

	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate APCA (Advanced Perceptual Contrast Algorithm) contrast
 * Uses the official apca-w3 library for accurate Lc (lightness contrast) values
 * Returns absolute Lc value (0-105+, higher = more contrast)
 */
export function calculateAPCA(
	foreground: LocalOklch,
	background: LocalOklch,
): number {
	try {
		// Convert OKLCH to sRGB
		const fgRgb = toRgb(foreground);
		const bgRgb = toRgb(background);

		if (!fgRgb || !bgRgb) return 0;

		// Convert to 0-255 range for sRGBtoY
		const fgArray: [number, number, number] = [
			Math.round((fgRgb.r ?? 0) * 255),
			Math.round((fgRgb.g ?? 0) * 255),
			Math.round((fgRgb.b ?? 0) * 255),
		];
		const bgArray: [number, number, number] = [
			Math.round((bgRgb.r ?? 0) * 255),
			Math.round((bgRgb.g ?? 0) * 255),
			Math.round((bgRgb.b ?? 0) * 255),
		];

		// Calculate luminances
		const fgY = sRGBtoY(fgArray);
		const bgY = sRGBtoY(bgArray);

		// Calculate APCA contrast - returns Lc with polarity
		const contrast = APCAcontrast(fgY, bgY);

		// Return absolute value for easier comparison
		return Math.abs(Number(contrast));
	} catch {
		// Fallback to simplified calculation if APCA fails
		return Math.abs(foreground.l - background.l) * 100;
	}
}

/**
 * Check contrast compliance
 */
export function checkContrast(
	foreground: LocalOklch,
	background: LocalOklch,
): ContrastResult {
	const ratio = calculateContrastRatio(foreground, background);
	const apca = calculateAPCA(foreground, background);

	return {
		ratio,
		aa: ratio >= 4.5, // AA standard for normal text
		aaa: ratio >= 7, // AAA standard
		apca,
	};
}

/**
 * Options for contrast enforcement
 */
export interface ContrastEnforcementOptions {
	targetRatio?: number;
	maxDelta?: number;
	preferLightness?: boolean;
	maxIterations?: number;
}

/**
 * Ensure contrast between foreground and background meets target ratio
 * Strategy:
 * 1. First try adjusting foreground lightness (preferred)
 * 2. If that fails, try adjusting background lightness slightly
 * 3. Try combinations of both foreground and background adjustments
 * 4. As last resort, adjust chroma to increase contrast
 */
export function ensureContrast(
	foreground: LocalOklch,
	background: LocalOklch,
	options: ContrastEnforcementOptions = {},
): {
	foreground: LocalOklch;
	background: LocalOklch;
	success: boolean;
	iterations: number;
} {
	const { targetRatio = 4.5, maxIterations = 100 } = options;

	let fg = clampOklch(foreground);
	let bg = clampOklch(background);
	let iterations = 0;
	const step = 0.02;
	const bgStep = 0.01; // Smaller step for background to preserve design intent

	// Phase 1: Adjust foreground only (preferred)
	const phase1Limit = Math.floor(maxIterations * 0.6);
	while (iterations < phase1Limit) {
		const ratio = calculateContrastRatio(fg, bg);

		if (ratio >= targetRatio) {
			return {
				foreground: fg,
				background: bg,
				success: true,
				iterations,
			};
		}

		const fgLuminance = getLuminance(fg);
		const bgLuminance = getLuminance(bg);
		const isFgLighter = fgLuminance >= bgLuminance;

		if (isFgLighter) {
			fg = clampOklch({ ...fg, l: Math.min(1, fg.l + step) });
		} else {
			fg = clampOklch({ ...fg, l: Math.max(0, fg.l - step) });
		}

		iterations++;
	}

	// Phase 2: Continue with foreground, but also try slight background adjustments
	const phase2Limit = Math.floor(maxIterations * 0.9);
	while (iterations < phase2Limit) {
		const ratio = calculateContrastRatio(fg, bg);

		if (ratio >= targetRatio) {
			return {
				foreground: fg,
				background: bg,
				success: true,
				iterations,
			};
		}

		const fgLuminance = getLuminance(fg);
		const bgLuminance = getLuminance(bg);
		const isFgLighter = fgLuminance >= bgLuminance;

		// Continue adjusting foreground
		if (isFgLighter) {
			fg = clampOklch({ ...fg, l: Math.min(1, fg.l + step) });
		} else {
			fg = clampOklch({ ...fg, l: Math.max(0, fg.l - step) });
		}

		// Occasionally try adjusting background slightly to help contrast
		if (iterations % 3 === 0) {
			if (isFgLighter) {
				bg = clampOklch({ ...bg, l: Math.max(0, bg.l - bgStep) });
			} else {
				bg = clampOklch({ ...bg, l: Math.min(1, bg.l + bgStep) });
			}
		}

		iterations++;
	}

	// Phase 3: Last resort - try extreme foreground adjustments
	const extremeStep = 0.05;

	while (iterations < maxIterations) {
		const ratio = calculateContrastRatio(fg, bg);

		if (ratio >= targetRatio) {
			return {
				foreground: fg,
				background: bg,
				success: true,
				iterations,
			};
		}

		const fgLuminance = getLuminance(fg);
		const bgLuminance = getLuminance(bg);
		const isFgLighter = fgLuminance >= bgLuminance;

		if (isFgLighter) {
			fg = clampOklch({ ...fg, l: Math.min(1, fg.l + extremeStep) });
		} else {
			fg = clampOklch({ ...fg, l: Math.max(0, fg.l - extremeStep) });
		}

		iterations++;
	}

	return {
		foreground: fg,
		background: bg,
		success: false,
		iterations,
	};
}
