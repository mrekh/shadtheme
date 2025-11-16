import { type Oklch as LocalOklch, clampOklch } from "./color-spaces";

export interface ContrastResult {
	ratio: number;
	aa: boolean;
	aaa: boolean;
	apca: number;
}

/**
 * Calculate relative luminance from OKLCH lightness
 * OKLCH L is already perceptually uniform, so we can use it directly
 */
function getLuminance(color: LocalOklch): number {
	return color.l;
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
 * Simplified version - full APCA is more complex
 */
export function calculateAPCA(
	foreground: LocalOklch,
	background: LocalOklch,
): number {
	const l1 = getLuminance(foreground);
	const l2 = getLuminance(background);

	const delta = Math.abs(l1 - l2);
	return delta * 100;
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
 * Enforce AA contrast by adjusting colors
 */
export function enforceContrast(
	foreground: LocalOklch,
	background: LocalOklch,
	targetRatio: number = 4.5,
	maxIterations: number = 20,
): {
	foreground: LocalOklch;
	background: LocalOklch;
	success: boolean;
	iterations: number;
} {
	let fg = clampOklch(foreground);
	const bg = clampOklch(background);
	let iterations = 0;

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

		// Adjust foreground to increase contrast
		const fgLuminance = getLuminance(fg);
		const bgLuminance = getLuminance(bg);

		if (fgLuminance > bgLuminance) {
			// Foreground is lighter, make it lighter
			fg = clampOklch({ ...fg, l: Math.min(1, fg.l + 0.05) });
		} else {
			// Foreground is darker, make it darker
			fg = clampOklch({ ...fg, l: Math.max(0, fg.l - 0.05) });
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

/**
 * Validate all foreground/background pairs in a theme
 */
export function validateThemeContrast(
	theme: Record<string, LocalOklch>,
): Array<{
	token: string;
	foreground: string;
	background: string;
	result: ContrastResult;
	warning: boolean;
}> {
	const results: Array<{
		token: string;
		foreground: string;
		background: string;
		result: ContrastResult;
		warning: boolean;
	}> = [];

	const foregroundTokens = [
		"foreground",
		"card-foreground",
		"popover-foreground",
		"primary-foreground",
		"secondary-foreground",
		"muted-foreground",
		"accent-foreground",
		"destructive-foreground",
		"sidebar-foreground",
		"sidebar-primary-foreground",
		"sidebar-accent-foreground",
	];

	// Check each foreground against relevant backgrounds
	for (const fgToken of foregroundTokens) {
		const fg = theme[fgToken];
		if (!fg) continue;

		// Find corresponding background
		const bgToken = fgToken.replace("-foreground", "");
		const bg = theme[bgToken] || theme.background;

		if (bg) {
			const result = checkContrast(fg, bg);
			results.push({
				token: fgToken,
				foreground: fgToken,
				background: bgToken,
				result,
				warning: !result.aa,
			});
		}
	}

	return results;
}
