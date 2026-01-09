// Fortune Period Calculator - 大運計算器
// Calculates personalized 10-year fortune periods based on birth date

import getWuxingData from "./nayin";

/**
 * Calculate fortune periods for a person based on their birth date
 * @param {string} birthDateTime - Birth date and time
 * @param {string} gender - Gender ('male' or 'female')
 * @param {number} currentYear - Current year for calculations
 * @returns {Object} Fortune periods with years and descriptions
 */
export function calculateFortunePeriods(
	birthDateTime,
	gender,
	currentYear = new Date().getFullYear()
) {
	if (!birthDateTime || !gender) {
		console.error(
			"Birth date and gender are required for fortune period calculation"
		);
		return getDefaultFortunePeriods();
	}

	try {
		// Get the wuxing data which contains the current dayun (大運)
		const wuxingData = getWuxingData(birthDateTime, gender);

		if (!wuxingData || !wuxingData.dayunGanzhi) {
			console.error("Unable to calculate wuxing data");
			return getDefaultFortunePeriods();
		}

		const birthDate = new Date(birthDateTime);
		const birthYear = birthDate.getFullYear();
		const currentAge = currentYear - birthYear;

		// Calculate the starting age for 大運 (typically starts around age 5-8 depending on gender and birth month)
		const dayunStartAge = calculateDayunStartAge(birthDate, gender);

		// Generate fortune periods (each 大運 lasts 10 years)
		const fortunePeriods = generateFortunePeriods(
			wuxingData.dayunGanzhi,
			birthYear,
			dayunStartAge,
			currentYear,
			currentAge
		);

		return {
			currentDayun: wuxingData.dayunGanzhi,
			currentAge,
			birthYear,
			periods: fortunePeriods,
		};
	} catch (error) {
		console.error("Error calculating fortune periods:", error);
		return getDefaultFortunePeriods();
	}
}

/**
 * Calculate the starting age for 大運 based on birth date and gender
 * This is a simplified calculation - in real practice this would be more complex
 */
function calculateDayunStartAge(birthDate, gender) {
	// Simplified calculation: typically starts between age 1-10
	// Real calculation would consider birth month, day, and other factors
	const month = birthDate.getMonth() + 1;

	// Basic approximation based on traditional methods
	if (gender === "male") {
		return month % 2 === 1 ? 7 : 5; // Yang years for males
	} else {
		return month % 2 === 0 ? 6 : 4; // Yin years for females
	}
}

/**
 * Generate sequential fortune periods based on the current dayun
 */
function generateFortunePeriods(
	currentDayun,
	birthYear,
	startAge,
	currentYear,
	currentAge
) {
	const tianGan = [
		"甲",
		"乙",
		"丙",
		"丁",
		"戊",
		"己",
		"庚",
		"辛",
		"壬",
		"癸",
	];
	const diZhi = [
		"子",
		"丑",
		"寅",
		"卯",
		"辰",
		"巳",
		"午",
		"未",
		"申",
		"酉",
		"戌",
		"亥",
	];

	// Find current dayun position
	const currentStem = currentDayun[0];
	const currentBranch = currentDayun[1];
	const stemIndex = tianGan.indexOf(currentStem);
	const branchIndex = diZhi.indexOf(currentBranch);

	if (stemIndex === -1 || branchIndex === -1) {
		console.error("Invalid dayun format:", currentDayun);
		return getDefaultPeriodsList();
	}

	const periods = [];
	const currentDayunAge =
		Math.floor((currentAge - startAge) / 10) * 10 + startAge;

	// Generate previous, current, and future periods
	for (let i = -2; i <= 3; i++) {
		const periodAge = currentDayunAge + i * 10;
		const periodStartYear = birthYear + periodAge;
		const periodEndYear = periodStartYear + 9;

		// Calculate the dayun for this period
		const newStemIndex = (stemIndex + i + 10) % 10;
		const newBranchIndex = (branchIndex + i + 12) % 12;
		const periodDayun = tianGan[newStemIndex] + diZhi[newBranchIndex];

		// Determine if this is past, current, or future
		let status = "future";
		if (currentYear >= periodStartYear && currentYear <= periodEndYear) {
			status = "current";
		} else if (currentYear > periodEndYear) {
			status = "past";
		}

		periods.push({
			dayun: periodDayun,
			ageRange: `${periodAge}-${periodAge + 9}歲`,
			yearRange: `${periodStartYear}-${periodEndYear}`,
			status: status,
			startYear: periodStartYear,
			endYear: periodEndYear,
			startAge: periodAge,
			endAge: periodAge + 9,
		});
	}

	return periods.sort((a, b) => a.startYear - b.startYear);
}

/**
 * Get default fortune periods as fallback
 */
function getDefaultFortunePeriods() {
	return {
		currentDayun: "丙寅",
		currentAge: 25,
		birthYear: 2000,
		periods: getDefaultPeriodsList(),
	};
}

function getDefaultPeriodsList() {
	return [
		{
			dayun: "甲子",
			ageRange: "15-24歲",
			yearRange: "2015-2024",
			status: "past",
			startYear: 2015,
			endYear: 2024,
			startAge: 15,
			endAge: 24,
		},
		{
			dayun: "丙寅",
			ageRange: "25-34歲",
			yearRange: "2025-2034",
			status: "current",
			startYear: 2025,
			endYear: 2034,
			startAge: 25,
			endAge: 34,
		},
		{
			dayun: "丁卯",
			ageRange: "35-44歲",
			yearRange: "2035-2044",
			status: "future",
			startYear: 2035,
			endYear: 2044,
			startAge: 35,
			endAge: 44,
		},
		{
			dayun: "壬戌",
			ageRange: "45-54歲",
			yearRange: "2045-2054",
			status: "future",
			startYear: 2045,
			endYear: 2054,
			startAge: 45,
			endAge: 54,
		},
	];
}

/**
 * Get current and upcoming fortune periods for display
 */
export function getCurrentFortunePeriods(
	birthDateTime,
	gender,
	currentYear = new Date().getFullYear()
) {
	const fortuneData = calculateFortunePeriods(
		birthDateTime,
		gender,
		currentYear
	);

	// Find current and next 2-3 periods for display
	const currentPeriods = fortuneData.periods
		.filter(
			(period) =>
				period.status === "current" || period.status === "future"
		)
		.slice(0, 3);

	return {
		current: fortuneData.currentDayun,
		periods: currentPeriods,
		birthYear: fortuneData.birthYear,
		currentAge: fortuneData.currentAge,
	};
}

/**
 * Format fortune period for display in components
 */
export function formatFortunePeriod(period, includeAge = true) {
	if (includeAge) {
		return `${period.dayun}運（${period.yearRange}）`;
	}
	return `${period.dayun}運`;
}

export default calculateFortunePeriods;
