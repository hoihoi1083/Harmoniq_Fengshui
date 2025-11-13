/**
 * Admin utility to manage daily analysis rate limits
 * Usage: node admin-rate-limit.js [command] [options]
 */

const commands = {
	help: () => {
		console.log("🔧 Daily Analysis Rate Limit Admin Utility");
		console.log("=".repeat(50));
		console.log("\nAvailable commands:");
		console.log("• help - Show this help message");
		console.log("• stats <email|userId> - Get user's daily stats");
		console.log("• reset <email|userId> - Reset user's daily count");
		console.log("• cleanup [days] - Remove old records (default: 30 days)");
		console.log("• overview - Show overall system stats");
		console.log("\nExamples:");
		console.log("node admin-rate-limit.js stats john@example.com");
		console.log("node admin-rate-limit.js cleanup 7");
	},

	example: () => {
		console.log("🎯 Example Rate Limit Responses:");
		console.log("=".repeat(50));

		console.log("\n📊 Warning message (2 remaining):");
		console.log("⚠️ 提醒：您今天還剩 2 次免費分析機會。");

		console.log("\n🚫 Limit exceeded message:");
		console.log(`🚫 今日分析次數已達上限

您今天已經使用了 10/10 次免費分析服務。

為了確保服務品質，我們設定每日分析上限為 10 次。

🕐 **明日重置時間：** 香港時間 00:00

💡 **建議：**
• 明天再來獲取更多免費分析
• 或考慮升級到付費版本以獲得無限制分析

感謝您的理解與支持！`);

		console.log("\n✅ What gets tracked:");
		console.log("• Individual fortune analysis (感情、財運、工作、健康等)");
		console.log("• Couple compatibility analysis (合盤配對分析)");
		console.log("• Topic + birthday combinations");
		console.log("• Modal form submissions");

		console.log("\n❌ What doesn't get tracked:");
		console.log("• Follow-up questions");
		console.log("• Clarifications");
		console.log("• Report selections (1, 2, 3)");
		console.log("• General chat messages");
	},
};

const command = process.argv[2];

if (command && commands[command]) {
	commands[command]();
} else if (command === "example") {
	commands.example();
} else {
	commands.help();
}

console.log("\n" + "=".repeat(50));
console.log("💡 Note: This is a demonstration utility.");
console.log("For actual database operations, implement the functions using");
console.log("the DailyAnalysisRateLimit class in production code.");
