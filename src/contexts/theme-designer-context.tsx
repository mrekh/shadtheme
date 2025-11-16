"use client";

import {
	type ReactNode,
	createContext,
	startTransition,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from "react";

import {
	type GeneratedTheme,
	type HarmonyType,
	generateThemeFromInputs,
} from "@/lib/color-engine";
import { formatOklchCss } from "@/lib/color-spaces";

const DEFAULT_RADIUS = 0.65;
const DEFAULT_PRIMARY_HEX = "#8b5cf6";
const DEFAULT_HARMONY: HarmonyType = "complementary";
const DEFAULT_BACKGROUND_STRATEGY = "neutral";

export const RADIUS_OPTIONS = [
	{ value: 0, label: "Sharp" },
	{ value: 0.1, label: "Subtle" },
	{ value: 0.375, label: "Rounded" },
	{ value: 0.5, label: "Medium" },
	{ value: 0.625, label: "Large" },
	{ value: 0.9, label: "Extra Large" },
	{ value: 1, label: "Full" },
] as const;

export const HARMONY_OPTIONS: HarmonyType[] = [
	"complementary",
	"split-complementary",
	"monochromatic",
	"analogous",
	"triadic",
	"square",
];

type ThemeDesignerStatus = "idle" | "previewing" | "applying";
export type BackgroundStrategy = "neutral" | "primary";

interface ThemeDesignerInputs {
	primaryHex: string;
	harmony: HarmonyType;
	radius: number;
	backgroundStrategy: BackgroundStrategy;
}

interface AppliedThemeSnapshot {
	theme: GeneratedTheme | null;
	primaryHex: string;
	harmony: HarmonyType;
	radius: number;
	backgroundStrategy: BackgroundStrategy;
}

export interface ThemeDesignerState {
	status: ThemeDesignerStatus;
	inputs: ThemeDesignerInputs;
	previewTheme: GeneratedTheme | null;
	previewKey: string | null;
	applied: AppliedThemeSnapshot;
	error: string | null;
}

interface ThemeDesignerContextValue {
	primaryHex: string;
	harmony: HarmonyType;
	radius: number;
	backgroundStrategy: BackgroundStrategy;
	previewTheme: GeneratedTheme | null;
	appliedTheme: GeneratedTheme | null;
	appliedRadius: number;
	status: ThemeDesignerStatus;
	isApplying: boolean;
	error: string | null;
	hasPendingChanges: boolean;
	setPrimary: (hex: string) => void;
	setHarmony: (harmony: HarmonyType) => void;
	setRadius: (radius: number) => void;
	setBackgroundStrategy: (strategy: BackgroundStrategy) => void;
	generatePreview: () => void;
	applyTheme: () => void;
	resetTheme: () => void;
	getHarmonyPreview: (harmonyType: HarmonyType) => GeneratedTheme | null;
}

type ThemeDesignerAction =
	| { type: "SET_PRIMARY"; value: string }
	| { type: "SET_HARMONY"; value: HarmonyType }
	| { type: "SET_RADIUS"; value: number }
	| { type: "SET_BACKGROUND_STRATEGY"; value: BackgroundStrategy }
	| { type: "FORCE_PREVIEW" }
	| {
			type: "PREVIEW_SUCCESS";
			theme: GeneratedTheme | null;
			previewKey: string | null;
	  }
	| { type: "PREVIEW_ERROR"; message: string }
	| { type: "APPLY_START" }
	| { type: "APPLY_SUCCESS"; theme: GeneratedTheme | null }
	| { type: "RESET"; defaultTheme: GeneratedTheme | null };

const ThemeDesignerContext = createContext<
	ThemeDesignerContextValue | undefined
>(undefined);

function buildPreviewKey(
	primaryHex: string,
	harmony: HarmonyType,
	backgroundStrategy: BackgroundStrategy,
): string {
	return [primaryHex.toLowerCase(), harmony, backgroundStrategy].join("-");
}

export function createInitialState(
	defaultTheme: GeneratedTheme | null,
): ThemeDesignerState {
	const inputs: ThemeDesignerInputs = {
		primaryHex: DEFAULT_PRIMARY_HEX,
		harmony: DEFAULT_HARMONY,
		radius: DEFAULT_RADIUS,
		backgroundStrategy: DEFAULT_BACKGROUND_STRATEGY,
	};

	return {
		status: "idle",
		inputs,
		previewTheme: defaultTheme,
		previewKey: defaultTheme
			? buildPreviewKey(
					DEFAULT_PRIMARY_HEX,
					DEFAULT_HARMONY,
					DEFAULT_BACKGROUND_STRATEGY,
				)
			: null,
		applied: {
			theme: null,
			primaryHex: DEFAULT_PRIMARY_HEX,
			harmony: DEFAULT_HARMONY,
			radius: DEFAULT_RADIUS,
			backgroundStrategy: DEFAULT_BACKGROUND_STRATEGY,
		},
		error: null,
	};
}

export function themeDesignerReducer(
	state: ThemeDesignerState,
	action: ThemeDesignerAction,
): ThemeDesignerState {
	switch (action.type) {
		case "SET_PRIMARY": {
			if (action.value === state.inputs.primaryHex) return state;
			return {
				...state,
				status: "previewing",
				inputs: { ...state.inputs, primaryHex: action.value },
			};
		}
		case "SET_HARMONY": {
			if (action.value === state.inputs.harmony) return state;
			return {
				...state,
				status: "previewing",
				inputs: { ...state.inputs, harmony: action.value },
			};
		}
		case "SET_RADIUS":
			if (action.value === state.inputs.radius) return state;
			return {
				...state,
				inputs: { ...state.inputs, radius: action.value },
			};
		case "SET_BACKGROUND_STRATEGY":
			if (action.value === state.inputs.backgroundStrategy) return state;
			return {
				...state,
				status: "previewing",
				inputs: { ...state.inputs, backgroundStrategy: action.value },
			};
		case "FORCE_PREVIEW":
			if (state.status === "previewing") return state;
			return { ...state, status: "previewing" };
		case "PREVIEW_SUCCESS":
			return {
				...state,
				status: "idle",
				previewTheme: action.theme,
				previewKey: action.previewKey,
				error: null,
			};
		case "PREVIEW_ERROR":
			return {
				...state,
				status: "idle",
				error: action.message,
			};
		case "APPLY_START":
			return {
				...state,
				status: "applying",
				error: null,
			};
		case "APPLY_SUCCESS":
			return {
				...state,
				status: "idle",
				applied: {
					theme: action.theme,
					primaryHex: state.inputs.primaryHex,
					harmony: state.inputs.harmony,
					radius: state.inputs.radius,
					backgroundStrategy: state.inputs.backgroundStrategy,
				},
			};
		case "RESET":
			return createInitialState(action.defaultTheme);
		default:
			return state;
	}
}

export function computeHasPendingChanges(state: ThemeDesignerState): boolean {
	const { inputs, applied, previewTheme } = state;
	if (!applied.theme) {
		return Boolean(previewTheme);
	}

	return (
		applied.primaryHex !== inputs.primaryHex ||
		applied.harmony !== inputs.harmony ||
		applied.radius !== inputs.radius ||
		applied.backgroundStrategy !== inputs.backgroundStrategy
	);
}

function subscribeToThemeClassChange(callback: () => void) {
	if (typeof window === "undefined") {
		return () => undefined;
	}
	const observer = new MutationObserver(() => callback());
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	return () => observer.disconnect();
}

function getDefaultTheme(): GeneratedTheme | null {
	try {
		return generateThemeFromInputs(DEFAULT_PRIMARY_HEX, null, DEFAULT_HARMONY);
	} catch {
		return null;
	}
}

function applyThemeToDOM(
	tokens: GeneratedTheme["tokens"],
	radius: number,
	isDark: boolean = false,
) {
	if (typeof window === "undefined") return;

	const root = document.documentElement;
	const themeTokens = isDark ? tokens.dark : tokens.light;

	requestAnimationFrame(() => {
		for (const [key, value] of Object.entries(themeTokens)) {
			root.style.setProperty(`--${key}`, formatOklchCss(value));
		}

		root.style.setProperty("--radius", `${radius}rem`);
	});
}

function resetThemeInDOM() {
	if (typeof window === "undefined") return;

	const root = document.documentElement;
	const cssVars = [
		"background",
		"foreground",
		"card",
		"card-foreground",
		"popover",
		"popover-foreground",
		"primary",
		"primary-foreground",
		"secondary",
		"secondary-foreground",
		"muted",
		"muted-foreground",
		"accent",
		"accent-foreground",
		"destructive",
		"destructive-foreground",
		"border",
		"input",
		"ring",
		"chart-1",
		"chart-2",
		"chart-3",
		"chart-4",
		"chart-5",
		"sidebar",
		"sidebar-foreground",
		"sidebar-primary",
		"sidebar-primary-foreground",
		"sidebar-accent",
		"sidebar-accent-foreground",
		"sidebar-border",
		"sidebar-ring",
		"radius",
	];

	for (const varName of cssVars) {
		root.style.removeProperty(`--${varName}`);
	}
}

export function ThemeDesignerProvider({ children }: { children: ReactNode }) {
	const defaultTheme = useMemo(() => getDefaultTheme(), []);
	const [state, dispatch] = useReducer(
		themeDesignerReducer,
		defaultTheme,
		createInitialState,
	);

	const previewRequestRef = useRef(0);

	useEffect(() => {
		if (state.status !== "previewing") return;

		const previewKey = buildPreviewKey(
			state.inputs.primaryHex,
			state.inputs.harmony,
			state.inputs.backgroundStrategy,
		);

		if (previewKey === state.previewKey && state.previewTheme) {
			dispatch({
				type: "PREVIEW_SUCCESS",
				theme: state.previewTheme,
				previewKey,
			});
			return;
		}

		let cancelled = false;
		const requestId = ++previewRequestRef.current;
		const generationOptions = {
			backgroundStrategy: state.inputs.backgroundStrategy,
		};

		startTransition(() => {
			try {
				const theme = generateThemeFromInputs(
					state.inputs.primaryHex,
					null,
					state.inputs.harmony,
					generationOptions,
				);
				if (!cancelled && requestId === previewRequestRef.current) {
					dispatch({
						type: "PREVIEW_SUCCESS",
						theme,
						previewKey,
					});
				}
			} catch (error) {
				console.error("Failed to generate preview theme:", error);
				if (!cancelled && requestId === previewRequestRef.current) {
					dispatch({
						type: "PREVIEW_ERROR",
						message: "Unable to build theme preview. Check your color values.",
					});
				}
			}
		});

		return () => {
			cancelled = true;
		};
	}, [
		state.status,
		state.inputs.primaryHex,
		state.inputs.harmony,
		state.inputs.backgroundStrategy,
		state.previewTheme,
		state.previewKey,
	]);

	useEffect(() => {
		if (!state.applied.theme || typeof window === "undefined") return;

		const applyTokens = () => {
			const isDark = document.documentElement.classList.contains("dark");
			applyThemeToDOM(
				state.applied.theme!.tokens,
				state.applied.radius,
				isDark,
			);
		};

		const disconnect = subscribeToThemeClassChange(applyTokens);
		return disconnect;
	}, [state.applied.theme, state.applied.radius]);

	const setPrimary = useCallback((hex: string) => {
		dispatch({ type: "SET_PRIMARY", value: hex });
	}, []);

	const setHarmony = useCallback((harmony: HarmonyType) => {
		dispatch({ type: "SET_HARMONY", value: harmony });
	}, []);

	const setRadius = useCallback((radius: number) => {
		dispatch({ type: "SET_RADIUS", value: radius });
	}, []);

	const setBackgroundStrategy = useCallback((strategy: BackgroundStrategy) => {
		dispatch({ type: "SET_BACKGROUND_STRATEGY", value: strategy });
	}, []);

	const generatePreview = useCallback(() => {
		dispatch({ type: "FORCE_PREVIEW" });
	}, []);

	const applyTheme = useCallback(() => {
		if (state.status === "applying") return;

		const generationOptions = {
			backgroundStrategy: state.inputs.backgroundStrategy,
		};

		let themeToApply = state.previewTheme;
		if (!themeToApply) {
			try {
				themeToApply = generateThemeFromInputs(
					state.inputs.primaryHex,
					null,
					state.inputs.harmony,
					generationOptions,
				);
			} catch (error) {
				console.error("Failed to apply theme:", error);
				dispatch({
					type: "PREVIEW_ERROR",
					message: "Unable to build theme preview. Check your color values.",
				});
				return;
			}
		}

		if (!themeToApply) return;

		dispatch({ type: "APPLY_START" });
		if (typeof window !== "undefined") {
			const isDark = document.documentElement.classList.contains("dark");
			applyThemeToDOM(themeToApply.tokens, state.inputs.radius, isDark);
		}
		dispatch({ type: "APPLY_SUCCESS", theme: themeToApply });
	}, [
		state.status,
		state.previewTheme,
		state.inputs.primaryHex,
		state.inputs.harmony,
		state.inputs.backgroundStrategy,
		state.inputs.radius,
	]);

	const resetTheme = useCallback(() => {
		resetThemeInDOM();
		dispatch({ type: "RESET", defaultTheme });
	}, [defaultTheme]);

	const getHarmonyPreview = useCallback(
		(harmonyType: HarmonyType): GeneratedTheme | null => {
			try {
				return generateThemeFromInputs(
					state.inputs.primaryHex,
					null,
					harmonyType,
					{
						backgroundStrategy: state.inputs.backgroundStrategy,
					},
				);
			} catch {
				return null;
			}
		},
		[state.inputs.primaryHex, state.inputs.backgroundStrategy],
	);

	const hasPendingChanges = useMemo(
		() => computeHasPendingChanges(state),
		[state],
	);

	const value = useMemo<ThemeDesignerContextValue>(
		() => ({
			primaryHex: state.inputs.primaryHex,
			harmony: state.inputs.harmony,
			radius: state.inputs.radius,
			backgroundStrategy: state.inputs.backgroundStrategy,
			previewTheme: state.previewTheme,
			appliedTheme: state.applied.theme,
			appliedRadius: state.applied.radius,
			status: state.status,
			isApplying: state.status === "applying",
			error: state.error,
			hasPendingChanges,
			setPrimary,
			setHarmony,
			setRadius,
			setBackgroundStrategy,
			generatePreview,
			applyTheme,
			resetTheme,
			getHarmonyPreview,
		}),
		[
			state,
			hasPendingChanges,
			setPrimary,
			setHarmony,
			setRadius,
			setBackgroundStrategy,
			generatePreview,
			applyTheme,
			resetTheme,
			getHarmonyPreview,
		],
	);

	return (
		<ThemeDesignerContext.Provider value={value}>
			{children}
		</ThemeDesignerContext.Provider>
	);
}

export function useThemeDesigner() {
	const context = useContext(ThemeDesignerContext);
	if (!context) {
		throw new Error(
			"useThemeDesigner must be used within ThemeDesignerProvider",
		);
	}
	return context;
}
