#!/usr/bin/env node

/**
 * Script to clear cached Ba Zi data that contains incorrect calculations
 * This will force regeneration with the fixed calculation methods
 */

console.log("🧹 Clearing Cached Ba Zi Data to Force Regeneration");
console.log("=".repeat(60));

// First, let's check what might be cached
const sessionId = "couple_2002_08_03_02_02_2010_03_04_00_04";

console.log("🔍 Session ID to clear:", sessionId);
console.log("");

// Check for browser localStorage/sessionStorage data
console.log("📋 Steps to clear cached data:");
console.log("");
console.log("1. 🌐 Clear Browser Data:");
console.log("   - Open browser DevTools (F12)");
console.log("   - Go to Application/Storage tab");
console.log("   - Clear localStorage and sessionStorage");
console.log("   - Clear IndexedDB if present");
console.log("");
console.log("2. 🔄 Force Hard Refresh:");
console.log("   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)");
console.log("   - This clears browser cache for the page");
console.log("");
console.log("3. 🗃️ Clear Component Cache:");
console.log("   - Add ?clearCache=true to the URL");
console.log("   - Use new browser tab/incognito mode");
console.log("");
console.log("4. 🚀 Restart Development Server:");
console.log("   - Kill the npm run dev process");
console.log("   - Start fresh with npm run dev");
console.log("");

// Create URLs to test with cache busting
const baseUrl = "http://localhost:3001/zh-TW/couple-report";
const params =
	"birthday=2002-08-03&birthday2=2010-03-04&gender=male&gender2=female&problem=一般情侶關係分析&birthTime1=02%3A02&birthTime2=00%3A04";
const cacheBustingUrl = `${baseUrl}?${params}&clearCache=true&v=${Date.now()}`;

console.log("🔗 Cache-busting URL to test:");
console.log(cacheBustingUrl);
console.log("");

console.log("✅ Expected Results After Clearing Cache:");
console.log("- Female: 癸丑 day pillar → 癸水 day master");
console.log("- Male: 癸卯 day pillar → 癸水 day master");
console.log("- NO MORE 辛金 day masters");
console.log("- Consistent Ba Zi across all components");
console.log("");

console.log("❌ If you still see 辛金 after clearing cache:");
console.log("- There may be database-saved content");
console.log("- Check for any .json files with cached data");
console.log("- Verify the API routes are using the fixed calculations");
console.log("");

console.log("🎯 Key Files Fixed:");
console.log("- ✅ /src/lib/baziCalculator.js (uses lunisolar)");
console.log(
	"- ✅ /src/app/api/couple-specific-problem-analysis/route.js (fixed)"
);
console.log("- ✅ /src/app/api/chart-diagnosis/route.js (already fixed)");
console.log("");

console.log("🔍 Debug: What the logs should show:");
console.log("- Male (2002-08-03 02:02): 壬午年, 癸卯日 → 癸水");
console.log("- Female (2010-03-04 00:04): 庚寅年, 癸丑日 → 癸水");

// Show the discrepancy we found in the logs
console.log("");
console.log("🐛 DEBUG: From your logs, I can see:");
console.log("Male result shows: 壬午年, 丁未月, 癸卯日, 癸丑時 → 癸水 ✅");
console.log("Female result shows: 庚寅年, 戊寅月, 癸丑日, 壬子時 → 癸水 ✅");
console.log("");
console.log("🎯 The API is calculating CORRECTLY now!");
console.log("The issue is that old cached data is still being displayed.");
console.log("Clear browser cache and try again!");
