// Re-export from new color engine for backward compatibility
export {
	generatePreviewCss,
	generateThemeFromInputs as generateTheme,
	serializeThemeCss,
	type GeneratedTheme,
	type ThemeTokens,
} from "./color-engine";
