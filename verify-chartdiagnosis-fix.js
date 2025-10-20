// Direct verification of ChartDiagnosis accuracy fix
const {
	calculateUnifiedElements,
} = require("./src/lib/unifiedElementCalculation");

console.log("🔍 CHARTDIAGNOSIS ACCURACY VERIFICATION\n");

// Test data from user's birth dates
const femaleUser = { birthDateTime: "2010-03-04T00:04:00" };
const maleUser = { birthDateTime: "2002-08-03T02:02:00" };

// Calculate using our fixed unified elements function
const femaleElements = calculateUnifiedElements(
	femaleUser.birthDateTime,
	"female"
);
const maleElements = calculateUnifiedElements(maleUser.birthDateTime, "male");

console.log("📊 CORRECT CALCULATIONS (using calculateUnifiedElements):");
console.log(`Female (${femaleUser.birthDateTime}):`);
console.log(
	`  Day Master: ${femaleElements.dayMasterStem}${femaleElements.dayMasterElement}`
);
console.log(`  Month Branch: ${femaleElements.fourPillars.month.branch}`);
console.log(
	`  Expected Title: 命局：${femaleElements.dayMasterStem}${femaleElements.fourPillars.month.branch}月`
);
console.log();

console.log(`Male (${maleUser.birthDateTime}):`);
console.log(
	`  Day Master: ${maleElements.dayMasterStem}${maleElements.dayMasterElement}`
);
console.log(`  Month Branch: ${maleElements.fourPillars.month.branch}`);
console.log(
	`  Expected Title: 命局：${maleElements.dayMasterStem}${maleElements.fourPillars.month.branch}月`
);
console.log();

console.log("🏷️ WHAT CHARTDIAGNOSIS SHOULD NOW SHOW:");
console.log(
	`Female Title: 命局：${femaleElements.dayMasterStem}${femaleElements.fourPillars.month.branch}月`
);
console.log(
	`Male Title: 命局：${maleElements.dayMasterStem}${maleElements.fourPillars.month.branch}月`
);
console.log();

console.log("❌ PREVIOUS INCORRECT RESULTS (from user report):");
console.log("Female Title: 命局：辛辰月 (WRONG - showed 辛金)");
console.log("Male Title: 命局：辛酉月 (WRONG - showed 辛金)");
console.log();

console.log("✅ ACCURACY CHECK:");
const femaleCorrect = femaleElements.dayMasterStem === "癸";
const maleCorrect = maleElements.dayMasterStem === "癸";

console.log(
	`Female Day Master: ${femaleCorrect ? "✅ CORRECT (癸)" : "❌ INCORRECT"}`
);
console.log(
	`Male Day Master: ${maleCorrect ? "✅ CORRECT (癸)" : "❌ INCORRECT"}`
);

if (femaleCorrect && maleCorrect) {
	console.log(
		"\n🎉 SUCCESS: Our fix should now show correct day masters (both 癸水)!"
	);
	console.log(
		"The ChartDiagnosis API titles should no longer show incorrect 辛金."
	);
} else {
	console.log("\n⚠️ Unexpected result - need further investigation");
}
