/**
 * 🚫 Off-Topic Handling Analysis Test
 *
 * Comprehensive test of off-topic responses:
 * 1. Test various off-topic categories
 * 2. Analyze redirection strength
 * 3. Capture full responses
 * 4. Categorize redirection patterns
 */

const API_ENDPOINT = "https://www.harmoniqfengshui.com/api/smart-chat2";
const TIMEOUT = 30000;

const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	magenta: "\x1b[35m",
	gray: "\x1b[90m",
};

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBox(title, color = "cyan") {
	log("\n" + "═".repeat(80), color);
	log(`  ${title}`, color);
	log("═".repeat(80) + "\n", color);
}

async function sendMessage(message, sessionId, userId) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
	const startTime = Date.now();

	try {
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message,
				sessionId,
				userId,
				locale: "zh-TW",
			}),
			signal: controller.signal,
		});

		const elapsedTime = Date.now() - startTime;
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		return { data, elapsedTime, error: null };
	} catch (error) {
		const elapsedTime = Date.now() - startTime;
		clearTimeout(timeoutId);
		return {
			data: null,
			elapsedTime,
			error: error.name === "AbortError" ? "timeout" : error.message,
		};
	}
}

function analyzeRedirection(response) {
	if (!response) return { type: "NO_RESPONSE", score: 0 };

	// Strong redirection indicators
	const strongIndicators = [
		"抱歉",
		"不是小鈴的專長",
		"不在我的專業範圍",
		"我專注於命理",
		"我的專長是風水",
		"讓我回到命理分析",
	];

	// Weak redirection indicators
	const weakIndicators = [
		"其實",
		"你知道嗎",
		"不過",
		"說到",
		"也跟",
		"息息相關",
	];

	// Clear call-to-action
	const hasCTA =
		response.includes("想要開始分析") ||
		response.includes("請輸入") ||
		response.includes("讓小鈴");

	// Direct answer to off-topic (bad)
	const givesDirectAnswer =
		!response.includes("命理") &&
		!response.includes("風水") &&
		!response.includes("運勢");

	const strongCount = strongIndicators.filter((ind) =>
		response.includes(ind)
	).length;
	const weakCount = weakIndicators.filter((ind) =>
		response.includes(ind)
	).length;

	let type, score;
	if (strongCount > 0) {
		type = "STRONG_REDIRECT";
		score = 3;
	} else if (givesDirectAnswer) {
		type = "NO_REDIRECT";
		score = 0;
	} else if (weakCount > 0 && hasCTA) {
		type = "WEAK_REDIRECT";
		score = 1;
	} else {
		type = "UNCLEAR";
		score = 0.5;
	}

	return { type, score, hasCTA, strongCount, weakCount };
}

async function testOffTopicCategory(
	categoryName,
	questions,
	sessionId,
	userId
) {
	logBox(`OFF-TOPIC: ${categoryName}`, "magenta");

	const results = [];

	for (const question of questions) {
		log(`\n${"─".repeat(80)}`, "gray");
		log(`💬 Question: "${question}"`, "yellow");
		log("─".repeat(80), "gray");

		const result = await sendMessage(question, sessionId, userId);

		if (result.error) {
			log(`❌ Error: ${result.error}`, "red");
			results.push({ question, type: "ERROR", response: null });
			continue;
		}

		const response = result.data.response;
		const analysis = analyzeRedirection(response);

		log(`\n📝 FULL RESPONSE:`, "cyan");
		log("┌" + "─".repeat(78) + "┐", "gray");
		const lines = response.split("\n");
		lines.forEach((line) => {
			log(`│ ${line.substring(0, 76).padEnd(76)} │`, "white");
		});
		log("└" + "─".repeat(78) + "┘", "gray");

		log(`\n📊 ANALYSIS:`, "cyan");
		log(
			`   Type: ${analysis.type}`,
			analysis.score >= 2
				? "green"
				: analysis.score >= 1
					? "yellow"
					: "red"
		);
		log(
			`   Score: ${analysis.score}/3`,
			analysis.score >= 2 ? "green" : "yellow"
		);
		log(
			`   Has CTA: ${analysis.hasCTA ? "✅" : "❌"}`,
			analysis.hasCTA ? "green" : "red"
		);
		log(`   Strong indicators: ${analysis.strongCount}`, "gray");
		log(`   Weak indicators: ${analysis.weakCount}`, "gray");

		results.push({ question, ...analysis, response });

		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	return results;
}

async function runAllOffTopicTests() {
	logBox("🚫 OFF-TOPIC HANDLING ANALYSIS", "cyan");
	log(`Endpoint: ${API_ENDPOINT}`, "blue");

	const sessionId = `offtopic-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	// Initialize conversation
	log("\n📍 Initializing conversation...", "blue");
	await sendMessage("你好", sessionId, userId);
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const allResults = {};

	// Category 1: Weather & Environment
	allResults.weather = await testOffTopicCategory(
		"Weather & Environment",
		["今天天氣如何？", "明天會下雨嗎？", "現在幾度？"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 2: Food & Dining
	allResults.food = await testOffTopicCategory(
		"Food & Dining",
		["推薦好吃的餐廳", "哪裡有好吃的火鍋？", "今天吃什麼好？"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 3: Shopping & Products
	allResults.shopping = await testOffTopicCategory(
		"Shopping & Products",
		["哪支手機比較好？", "推薦筆記型電腦", "哪裡買衣服便宜？"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 4: Entertainment
	allResults.entertainment = await testOffTopicCategory(
		"Entertainment",
		["有什麼好看的電影？", "推薦Netflix影集", "最近有什麼音樂節？"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 5: Sports
	allResults.sports = await testOffTopicCategory(
		"Sports",
		["你覺得哪隊會贏？", "NBA誰會奪冠？", "推薦健身房"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 6: Travel
	allResults.travel = await testOffTopicCategory(
		"Travel",
		["去哪裡旅遊好？", "日本哪裡好玩？", "推薦住宿"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 7: General Knowledge
	allResults.knowledge = await testOffTopicCategory(
		"General Knowledge",
		["地球到月球多遠？", "什麼是量子力學？", "如何學習Python？"],
		sessionId,
		userId
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	// Category 8: Personal Chat
	allResults.personal = await testOffTopicCategory(
		"Personal Chat",
		["你幾歲？", "你是真人還是AI？", "你叫什麼名字？"],
		sessionId,
		userId
	);

	// ========================================================================
	// FINAL SUMMARY
	// ========================================================================
	logBox("📊 COMPREHENSIVE ANALYSIS", "cyan");

	const categories = Object.keys(allResults);
	const summary = {
		strong: 0,
		weak: 0,
		none: 0,
		total: 0,
	};

	categories.forEach((category) => {
		const results = allResults[category];
		const categoryScores = {
			strong: results.filter((r) => r.type === "STRONG_REDIRECT").length,
			weak: results.filter((r) => r.type === "WEAK_REDIRECT").length,
			none: results.filter(
				(r) => r.type === "NO_REDIRECT" || r.type === "ERROR"
			).length,
		};

		log(`\n${category.toUpperCase()}:`, "yellow");
		log(
			`  Strong Redirects: ${categoryScores.strong}/${results.length}`,
			"green"
		);
		log(
			`  Weak Redirects: ${categoryScores.weak}/${results.length}`,
			"yellow"
		);
		log(`  No Redirect: ${categoryScores.none}/${results.length}`, "red");

		summary.strong += categoryScores.strong;
		summary.weak += categoryScores.weak;
		summary.none += categoryScores.none;
		summary.total += results.length;
	});

	logBox("OVERALL STATISTICS", "cyan");
	log(`Total Questions: ${summary.total}`, "blue");
	log(
		`Strong Redirects: ${summary.strong} (${((summary.strong / summary.total) * 100).toFixed(1)}%)`,
		"green"
	);
	log(
		`Weak Redirects: ${summary.weak} (${((summary.weak / summary.total) * 100).toFixed(1)}%)`,
		"yellow"
	);
	log(
		`No Redirect: ${summary.none} (${((summary.none / summary.total) * 100).toFixed(1)}%)`,
		"red"
	);

	const effectiveness =
		((summary.strong + summary.weak * 0.5) / summary.total) * 100;
	log(
		`\nOverall Effectiveness: ${effectiveness.toFixed(1)}%`,
		effectiveness > 80 ? "green" : effectiveness > 60 ? "yellow" : "red"
	);

	// Examples of each type
	logBox("EXAMPLE RESPONSES", "cyan");

	log("\n✅ STRONG REDIRECT EXAMPLE:", "green");
	const strongExample = Object.values(allResults)
		.flat()
		.find((r) => r.type === "STRONG_REDIRECT");
	if (strongExample) {
		log(`Question: ${strongExample.question}`, "yellow");
		log(
			`Response: ${strongExample.response?.substring(0, 200)}...`,
			"white"
		);
	}

	log("\n⚠️  WEAK REDIRECT EXAMPLE:", "yellow");
	const weakExample = Object.values(allResults)
		.flat()
		.find((r) => r.type === "WEAK_REDIRECT");
	if (weakExample) {
		log(`Question: ${weakExample.question}`, "yellow");
		log(`Response: ${weakExample.response?.substring(0, 200)}...`, "white");
	}

	log("\n❌ NO REDIRECT EXAMPLE:", "red");
	const noneExample = Object.values(allResults)
		.flat()
		.find((r) => r.type === "NO_REDIRECT");
	if (noneExample) {
		log(`Question: ${noneExample.question}`, "yellow");
		log(`Response: ${noneExample.response?.substring(0, 200)}...`, "white");
	}

	logBox("✅ ANALYSIS COMPLETE", "green");
}

runAllOffTopicTests().catch((error) => {
	logBox(`❌ TEST FAILED: ${error.message}`, "red");
	console.error(error);
});
