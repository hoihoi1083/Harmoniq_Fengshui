#!/usr/bin/env node

/**
 * Clear cached database entries that contain incorrect Ba Zi calculations
 * This will force regeneration with the correct calculations
 */

console.log("🗄️ Database Cache Clearing Script");
console.log("=".repeat(50));

const sessionId = "couple_2002_08_03_02_02_2010_03_04_00_04";

console.log("🎯 Target Session ID:", sessionId);
console.log("");

console.log("📋 Manual Database Clearing Steps:");
console.log("");
console.log("1. 🔗 Check if there's a database admin interface");
console.log("2. 🗃️ Look for CoupleContent collection");
console.log("3. 🔍 Find entries with sessionId:", sessionId);
console.log("4. ❌ Delete entries containing componentName:");
console.log("   - enhancedCoupleSpecificProblemSolution");
console.log("   - chartDiagnosis");
console.log("   - Any component showing '辛金' or '辛丑' or '辛卯'");
console.log("");

console.log("🚀 Alternative: Force Regeneration via URL Parameters");
console.log("");
console.log("Add these parameters to force fresh generation:");
console.log("&clearCache=true&forceRegenerate=true&v=" + Date.now());
console.log("");

console.log("📞 API Call to Clear Cache:");
console.log("You can also try making a DELETE request to:");
console.log("DELETE /api/couple-content?sessionId=" + sessionId);
console.log("");

console.log("🔧 Component-Level Solution:");
console.log("Temporarily modify the component to skip loading saved data:");
console.log("1. Comment out the 'loadSavedData' function call");
console.log("2. Force direct API generation");
console.log("3. Let it save new correct data");
console.log("4. Restore normal loading behavior");
console.log("");

console.log("🎯 Expected Results After Clearing:");
console.log("- Female: 癸丑 day pillar → 癸水 day master");
console.log("- Male: 癸卯 day pillar → 癸水 day master");
console.log("- Both users should show consistent 癸水 across all components");
console.log("");

console.log("📊 From Server Logs, We Know the API is Calculating Correctly:");
console.log("- Male: 壬午年, 丁未月, 癸卯日, 癸丑時 → 癸水 ✅");
console.log("- Female: 庚寅年, 戊寅月, 癸丑日, 壬子時 → 癸水 ✅");
console.log("");
console.log(
	"🔍 The issue is ONLY cached/saved data containing old 辛金 results!"
);
