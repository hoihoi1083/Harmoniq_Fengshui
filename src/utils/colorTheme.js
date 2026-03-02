/**
 * Color Theme Utility for Fortune Report Components
 * Maps user concerns to specific color schemes
 */

export const getThemeColors = (concern) => {
	const colorMap = {
		財運: "#D09900",
		财运: "#D09900", // Simplified Chinese variant
		感情: "#C74772",
		健康: "#389D7D",
		事業: "#3263C4",
		事业: "#3263C4", // Simplified Chinese variant for career
		命理: "#A3B116", // Life report (命理報告)
	};

	// Default fallback color
	const defaultColor = "#D09900";

	return colorMap[concern] || defaultColor;
};

// Alternative function that returns the concern-based color
// Can accept either userInfo object or concern string directly
export const getConcernColor = (userInfoOrConcern) => {
	let concern;

	// Handle both userInfo object and direct concern string
	if (typeof userInfoOrConcern === "string") {
		concern = userInfoOrConcern;
	} else if (userInfoOrConcern && userInfoOrConcern.concern) {
		concern = userInfoOrConcern.concern;
	} else {
		return "#D09900"; // Default color
	}

	return getThemeColors(concern);
};

// Helper function to get lighter/darker variants of the theme color
export const getColorVariants = (concern) => {
	const baseColor = getThemeColors(concern);

	// You can add logic here to generate lighter/darker variants if needed
	return {
		primary: baseColor,
		light: baseColor + "20", // Add transparency for lighter variant
		dark: baseColor,
		background: baseColor + "10", // Very light background
	};
};

// Update getThemeColors to return object format for compatibility
export const getThemeColorsObject = (concern) => {
	const baseColor = getThemeColors(concern);
	return {
		primary: baseColor,
		light: baseColor + "20",
		dark: baseColor,
		background: baseColor + "10",
	};
};
