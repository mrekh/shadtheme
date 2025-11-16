import { type Oklch, converter, parse } from "culori";

export type { Oklch };

/**
 * Local OKLCH type for internal use
 */
export type LocalOklch = {
	mode: "oklch";
	l: number;
	c: number;
	h: number;
	alpha?: number;
};

/**
 * Parse a color string (hex, rgb, oklch, etc.) and convert to OKLCH
 */
export function parseToOklch(color: string): LocalOklch | null {
	try {
		const parsed = parse(color);
		if (!parsed) return null;

		const oklch = converter("oklch")(parsed);
		if (!oklch || typeof oklch.l !== "number") return null;

		return clampOklch({
			mode: "oklch",
			l: oklch.l ?? 0,
			c: oklch.c ?? 0,
			h: oklch.h ?? 0,
		});
	} catch {
		return null;
	}
}

/**
 * Format OKLCH color as CSS string
 * Rounds values to 3 decimal places for precision
 */
export function formatOklchCss(color: Oklch | LocalOklch): string {
	const c = clampOklch(color);
	const l = Math.round(c.l * 1000) / 1000;
	const chroma = Math.round(c.c * 1000) / 1000;
	const h = Math.round((c.h ?? 0) * 1000) / 1000;
	const alpha =
		"alpha" in c && c.alpha !== undefined
			? ` / ${Math.round(c.alpha * 1000) / 1000}`
			: "";
	return `oklch(${l} ${chroma} ${h}${alpha})`;
}

/**
 * Clamp OKLCH values to valid ranges
 */
export function clampOklch(color: Oklch | LocalOklch): LocalOklch {
	return {
		mode: "oklch",
		l: Math.max(0, Math.min(1, color.l ?? 0)),
		c: Math.max(0, Math.min(0.4, color.c ?? 0)),
		h: color.h ?? 0,
		alpha: "alpha" in color ? color.alpha : undefined,
	};
}

/**
 * Convert OKLCH to hex for color pickers
 */
export function oklchToHex(color: Oklch | LocalOklch): string {
	try {
		const rgb = converter("rgb")(color as Oklch);
		if (!rgb) return "#000000";

		const r = Math.round((rgb.r ?? 0) * 255);
		const g = Math.round((rgb.g ?? 0) * 255);
		const b = Math.round((rgb.b ?? 0) * 255);

		return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
	} catch {
		return "#000000";
	}
}

/**
 * Adjust lightness of an OKLCH color
 */
export function adjustLightness(
	color: Oklch | LocalOklch,
	delta: number,
): LocalOklch {
	const clamped = clampOklch(color);
	return clampOklch({
		...clamped,
		l: clamped.l + delta,
	});
}

/**
 * Adjust chroma of an OKLCH color
 */
export function adjustChroma(
	color: Oklch | LocalOklch,
	delta: number,
): LocalOklch {
	const clamped = clampOklch(color);
	return clampOklch({
		...clamped,
		c: clamped.c + delta,
	});
}

/**
 * Adjust hue of an OKLCH color
 */
export function adjustHue(
	color: Oklch | LocalOklch,
	delta: number,
): LocalOklch {
	const clamped = clampOklch(color);
	let h = (clamped.h ?? 0) + delta;
	// Normalize hue to 0-360
	while (h < 0) h += 360;
	while (h >= 360) h -= 360;
	return clampOklch({
		...clamped,
		h,
	});
}
