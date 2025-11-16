declare module "culori" {
	export interface Oklch {
		mode: "oklch";
		l: number;
		c: number;
		h?: number;
		alpha?: number;
	}

	export interface Rgb {
		mode: "rgb";
		r: number;
		g: number;
		b: number;
		alpha?: number;
	}

	export type Color = Oklch | Rgb | string | Record<string, unknown>;

	export function parse(color: string): Color | null;
	export function converter<T extends string>(
		mode: T,
	): (
		color: Color,
	) => T extends "oklch" ? Oklch : T extends "rgb" ? Rgb : Color;
	export function formatOklch(color: Oklch | Color): string;
}
