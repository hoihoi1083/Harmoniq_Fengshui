// Centralized accurate BaZi calculation utility
// This replaces all the individual calculateBaZi functions with a single accurate implementation

import moment from "moment";
import lunisolar from "lunisolar";
import { takeSound } from "@lunisolar/plugin-takesound";
import { char8ex } from "@lunisolar/plugin-char8ex";

// Extend lunisolar with required plugins
lunisolar.extend(takeSound).extend(char8ex);

/**
 * Accurate BaZi calculation using lunisolar library
 * Replaces all the inaccurate calculateBaZi functions throughout the codebase
 * @param {string|Date} birthDateTime - Birth date and time
 * @returns {Object} Accurate BaZi calculation result
 */
export function calculateAccurateBaZi(birthDateTime) {
	try {
		// Normalize date format
		let dateStr;
		if (birthDateTime instanceof Date) {
			dateStr = moment(birthDateTime).format("YYYY-MM-DD HH:mm:ss");
		} else {
			// Handle string input - add default time if missing
			if (!birthDateTime.includes("T") && !birthDateTime.includes(" ")) {
				dateStr = `${birthDateTime} 12:00:00`;
			} else {
				dateStr = moment(birthDateTime).format("YYYY-MM-DD HH:mm:ss");
			}
		}

		// Calculate using lunisolar library
		const lsr = lunisolar(dateStr);

		return {
			year: `${lsr.char8.year.stem.name}${lsr.char8.year.branch.name}`,
			month: `${lsr.char8.month.stem.name}${lsr.char8.month.branch.name}`,
			day: `${lsr.char8.day.stem.name}${lsr.char8.day.branch.name}`,
			hour: `${lsr.char8.hour.stem.name}${lsr.char8.hour.branch.name}`,
			dayMaster: lsr.char8.day.stem.name,
			dayBranch: lsr.char8.day.branch.name,
			monthBranch: lsr.char8.month.branch.name,
			yearStem: lsr.char8.year.stem.name,
			yearBranch: lsr.char8.year.branch.name,
			monthStem: lsr.char8.month.stem.name,
			dayStem: lsr.char8.day.stem.name,
			hourStem: lsr.char8.hour.stem.name,
			hourBranch: lsr.char8.hour.branch.name,
			// Element information
			dayElement: lsr.char8.day.stem.e5.name,
			yearElement: lsr.char8.year.stem.e5.name,
			// Nayin information
			yearNayin: lsr.char8.year.takeSound,
			monthNayin: lsr.char8.month.takeSound,
			dayNayin: lsr.char8.day.takeSound,
			hourNayin: lsr.char8.hour.takeSound,
		};
	} catch (error) {
		console.error("calculateAccurateBaZi error:", error);
		// Return fallback calculation if lunisolar fails
		return calculateFallbackBaZi(birthDateTime);
	}
}

/**
 * Fallback BaZi calculation (simple algorithm for emergency use)
 * @param {string|Date} birthDateTime
 * @returns {Object} Basic BaZi calculation
 */
function calculateFallbackBaZi(birthDateTime) {
	const date = new Date(birthDateTime);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();

	const heavenlyStems = [
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
	const earthlyBranches = [
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

	// Basic calculations (not as accurate as lunisolar)
	const yearStemIndex = (year - 4) % 10;
	const yearBranchIndex = (year - 4) % 12;
	const daysSinceReference = Math.floor(
		(date - new Date("1900-01-01")) / (1000 * 60 * 60 * 24)
	);
	const dayStemIndex = (daysSinceReference + 9) % 10;
	const dayBranchIndex = (daysSinceReference + 11) % 12;
	const monthStemIndex = ((year - 4) * 12 + month - 1) % 10;
	const monthBranchIndex = (month + 1) % 12;
	const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
	const hourStemIndex = (dayStemIndex * 12 + hourBranchIndex) % 10;

	return {
		year: heavenlyStems[yearStemIndex] + earthlyBranches[yearBranchIndex],
		month:
			heavenlyStems[monthStemIndex] + earthlyBranches[monthBranchIndex],
		day: heavenlyStems[dayStemIndex] + earthlyBranches[dayBranchIndex],
		hour: heavenlyStems[hourStemIndex] + earthlyBranches[hourBranchIndex],
		dayMaster: heavenlyStems[dayStemIndex],
		dayBranch: earthlyBranches[dayBranchIndex],
		monthBranch: earthlyBranches[monthBranchIndex],
		yearStem: heavenlyStems[yearStemIndex],
		yearBranch: earthlyBranches[yearBranchIndex],
		monthStem: heavenlyStems[monthStemIndex],
		dayStem: heavenlyStems[dayStemIndex],
		hourStem: heavenlyStems[hourStemIndex],
		hourBranch: earthlyBranches[hourBranchIndex],
		dayElement: getElementFromStem(heavenlyStems[dayStemIndex]),
		yearElement: getElementFromStem(heavenlyStems[yearStemIndex]),
	};
}

/**
 * Get element from heavenly stem
 * @param {string} stem
 * @returns {string}
 */
function getElementFromStem(stem) {
	const elementMap = {
		甲: "木",
		乙: "木",
		丙: "火",
		丁: "火",
		戊: "土",
		己: "土",
		庚: "金",
		辛: "金",
		壬: "水",
		癸: "水",
	};
	return elementMap[stem] || "土";
}

export default { calculateAccurateBaZi };
