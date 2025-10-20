// Compare calculateBazi vs calculateUnifiedElements accuracy
const { BaziCalculator } = require("./src/lib/baziCalculator");
const {
	calculateUnifiedElements,
} = require("./src/lib/unifiedElementCalculation");

console.log("🔍 COMPARING calculateBazi vs calculateUnifiedElements\n");

// Test dates
const testDate1 = new Date("2002-08-03T02:02:00");
const testDate2 = new Date("2010-03-04T00:04:00");

console.log("=== TEST DATE 1: 2002-08-03 02:02 (Male) ===");
console.log("Current BaziCalculator.getDayPillar:");
try {
	const currentDay1 = BaziCalculator.getDayPillar(testDate1);
	console.log(
		`Day Pillar: ${currentDay1.tianGan}${currentDay1.diZhi} (Day Master: ${currentDay1.tianGan})`
	);
	console.log(`Element: ${currentDay1.element}`);
} catch (error) {
	console.log("Error with BaziCalculator:", error.message);
}

console.log("\nAccurate calculateUnifiedElements:");
const accurate1 = calculateUnifiedElements("2002-08-03T02:02:00", "male");
console.log(
	`Day Pillar: ${accurate1.fourPillars.day.stem}${accurate1.fourPillars.day.branch} (Day Master: ${accurate1.dayMasterStem})`
);
console.log(`Element: ${accurate1.dayMasterElement}`);

console.log("\n=== TEST DATE 2: 2010-03-04 00:04 (Female) ===");
console.log("Current BaziCalculator.getDayPillar:");
try {
	const currentDay2 = BaziCalculator.getDayPillar(testDate2);
	console.log(
		`Day Pillar: ${currentDay2.tianGan}${currentDay2.diZhi} (Day Master: ${currentDay2.tianGan})`
	);
	console.log(`Element: ${currentDay2.element}`);
} catch (error) {
	console.log("Error with BaziCalculator:", error.message);
}

console.log("\nAccurate calculateUnifiedElements:");
const accurate2 = calculateUnifiedElements("2010-03-04T00:04:00", "female");
console.log(
	`Day Pillar: ${accurate2.fourPillars.day.stem}${accurate2.fourPillars.day.branch} (Day Master: ${accurate2.dayMasterStem})`
);
console.log(`Element: ${accurate2.dayMasterElement}`);

console.log("\n=== ACCURACY CHECK ===");
// Compare if currentDay exists first
let currentDay1, currentDay2;
try {
	currentDay1 = BaziCalculator.getDayPillar(testDate1);
	currentDay2 = BaziCalculator.getDayPillar(testDate2);
} catch (error) {
	console.log("Error accessing BaziCalculator:", error.message);
	process.exit(1);
}

const match1 = currentDay1?.tianGan === accurate1.dayMasterStem;
const match2 = currentDay2?.tianGan === accurate2.dayMasterStem;
console.log(`Date 1 Day Master: ${match1 ? "✅ MATCH" : "❌ MISMATCH"}`);
console.log(`Date 2 Day Master: ${match2 ? "✅ MATCH" : "❌ MISMATCH"}`);

if (!match1 || !match2) {
	console.log("\n🔧 SOLUTION: Fix BaziCalculator.getDayPillar calculation");
	console.log(
		"The current algorithm is using a simple modulo calculation that is inaccurate."
	);
	console.log(
		"We need to implement the proper lunisolar-based calculation from calculateUnifiedElements."
	);
}
