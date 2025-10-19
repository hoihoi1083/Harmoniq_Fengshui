// Test structured format update for MingJu component
console.log("🧪 Testing v4 structured format update...");

console.log("\n📋 Changes Made:");
console.log("1. Updated prompt to explicitly request plain text (not JSON)");
console.log("2. Added format example in prompt");
console.log("3. Modified response parsing to prioritize structured content");
console.log("4. Updated cache version to v4_no_json_format");

console.log("\n🎯 Expected Structured Format:");
console.log("【日主基本分析】");
console.log("您的日主是乙木，月令酉金，整體格局為...");
console.log("");
console.log("【優勢分析】");
console.log("1. 具體優勢一...");
console.log("2. 具體優勢二...");
console.log("");
console.log("【劣勢分析】");
console.log("1. 需要注意的地方...");
console.log("");
console.log("【調候建議】");
console.log("具體的五行調候方案...");
console.log("");
console.log("【健康策略】");
console.log("針對健康領域的具體策略...");
console.log("");
console.log("【流年影響】");
console.log("分析2025年對健康的影響...");

console.log("\n🔧 Test Instructions:");
console.log("1. Clear cache: window.clearMingJuCache()");
console.log("2. Generate new content");
console.log("3. Check console for: '✅ Structured Plain Text Success'");
console.log("4. Verify content contains section headers");

console.log("\n🚨 If still showing old format:");
console.log("- Check console for JSON fallback warnings");
console.log("- AI may still be returning JSON format");
console.log("- May need additional prompt refinement");