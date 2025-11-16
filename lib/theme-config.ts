/**
 * Theme Configuration System
 *
 * This file defines available themes and their metadata.
 * Based on the forge-bi project theming pattern.
 */

export const themes = {
	default: {
		name: "MSK Air Default",
		description: "Clean, professional theme for air quality monitoring",
		colors: {
			mode: "professional",
			accent: "blue",
		},
		features: {
			supportsDarkMode: true,
		},
	},
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeConfig = (typeof themes)[ThemeName];

/**
 * Get theme configuration by name
 */
export function getTheme(name: ThemeName): ThemeConfig {
	return themes[name];
}

/**
 * Get all available themes
 */
export function getAllThemes(): typeof themes {
	return themes;
}

