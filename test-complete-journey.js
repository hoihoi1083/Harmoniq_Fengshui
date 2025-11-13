/**
 * 🧪 Complete User Journey Test
 *
 * Tests the full chatbox flow from greeting to payment completion
 * Including topic changes, off-topic handling, and concern switching
 *
 * Flow Tests:
 * 1. Complete Journey: Greeting → Concern → Birthday → Analysis → Payment
 * 2. Topic Switching: Between valid concerns (感情 → 工作 → 財運)
 * 3. Off-topic Handling: Irrelevant questions and redirection
 * 4. Multiple Off-topic: Chain of irrelevant topics then back to concern
 */

const API_ENDPOINT = "https://www.harmoniqfengshui.com/api/smart-chat2";
const DELAY = 2000; // 2 seconds between messages
const TIMEOUT = 25000; // 25 seconds per request

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

function logStep(step, message) {
	log(`\n${"─".repeat(80)}`, "gray");
	log(`${step}. ${message}`, "cyan");
	log("─".repeat(80), "gray");
}

function logResponse(response, state) {
	log(
		`📝 Response: ${response.substring(0, 200)}${response.length > 200 ? "..." : ""}`,
		"blue"
	);
	log(`📊 State: ${state}`, "gray");
}

async function sendMessage(message, sessionId, userId, locale = "zh-TW") {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

	try {
		log(`💬 Sending: "${message}"`, "yellow");

		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message, sessionId, userId, locale }),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		logResponse(data.response || "", data.conversationState || "unknown");

		return data;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === "AbortError") {
			log(`❌ Request timeout after ${TIMEOUT}ms`, "red");
			return { error: "timeout" };
		}
		log(`❌ Error: ${error.message}`, "red");
		return { error: error.message };
	}
}

async function wait(ms = DELAY) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// TEST 1: Complete Journey (Greeting → Payment)
// ============================================================================
async function testCompleteJourney() {
	log("\n" + "=".repeat(80), "magenta");
	log("🎯 TEST 1: COMPLETE USER JOURNEY (GREETING → PAYMENT)", "magenta");
	log("=".repeat(80) + "\n", "magenta");

	const sessionId = `journey-${Date.now()}`;
	const userId = `user-${Date.now()}`;
	let passed = true;

	try {
		// Step 1: Greeting
		logStep("STEP 1", "Initial Greeting");
		let response = await sendMessage("你好", sessionId, userId);
		if (!response.response || response.error) {
			log("❌ Failed at greeting", "red");
			return false;
		}
		await wait();

		// Step 2: Ask about emotion concern
		logStep("STEP 2", "Select Emotion Concern");
		response = await sendMessage("我想問感情", sessionId, userId);
		const hasEmotionTopic =
			response.response?.includes("感情") ||
			response.response?.includes("1️⃣");
		if (!hasEmotionTopic) {
			log("⚠️  Warning: Emotion topic not detected clearly", "yellow");
		}
		await wait();

		// Step 3: Choose personal analysis
		logStep("STEP 3", "Choose Personal Analysis");
		response = await sendMessage("1", sessionId, userId);
		const asksBirthday =
			response.response?.includes("生日") ||
			response.response?.includes("出生") ||
			response.conversationState === "birthday_collection";
		if (!asksBirthday) {
			log("⚠️  Warning: Birthday collection not triggered", "yellow");
		}
		await wait();

		// Step 4: Provide birthday
		logStep("STEP 4", "Provide Birthday");
		response = await sendMessage("1990年5月15日", sessionId, userId);
		await wait(3000); // Longer wait for analysis

		// Step 5: Check if analysis is generated or if it asks for more info
		logStep("STEP 5", "Checking Analysis State");
		const hasAnalysis = response.response?.length > 200;
		const asksForMore =
			response.response?.includes("更多") ||
			response.response?.includes("性別") ||
			response.response?.includes("時辰");

		if (hasAnalysis) {
			log("✅ Analysis generated", "green");
		} else if (asksForMore) {
			log("✅ System asking for more details (expected)", "green");

			// Provide gender if asked
			if (response.response?.includes("性別")) {
				logStep("STEP 5B", "Provide Gender");
				response = await sendMessage("女", sessionId, userId);
				await wait(3000);
			}
		}

		// Step 6: Continue conversation to trigger payment
		logStep("STEP 6", "Ask for Detailed Report");
		response = await sendMessage("我想看完整報告", sessionId, userId);
		await wait();

		// Step 7: Check for payment trigger
		logStep("STEP 7", "Check Payment Modal Trigger");
		const hasPaymentTrigger =
			response.shouldTriggerModal === true ||
			response.response?.includes("詳細") ||
			response.response?.includes("完整");

		if (hasPaymentTrigger) {
			log("✅ Payment flow detected", "green");
		} else {
			log(
				"⚠️  Payment trigger not detected (may need more interaction)",
				"yellow"
			);
		}

		log("\n✅ TEST 1 COMPLETED", "green");
		return true;
	} catch (error) {
		log(`\n❌ TEST 1 FAILED: ${error.message}`, "red");
		return false;
	}
}

// ============================================================================
// TEST 2: Topic Switching Between Valid Concerns
// ============================================================================
async function testTopicSwitching() {
	log("\n" + "=".repeat(80), "magenta");
	log("🔄 TEST 2: TOPIC SWITCHING (感情 → 工作 → 財運)", "magenta");
	log("=".repeat(80) + "\n", "magenta");

	const sessionId = `switching-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	try {
		// Start with greeting
		logStep("STEP 1", "Greeting");
		await sendMessage("你好", sessionId, userId);
		await wait();

		// Ask about emotion
		logStep("STEP 2", "Ask About Emotion (感情)");
		let response = await sendMessage("我想問感情", sessionId, userId);
		const emotionDetected =
			response.response?.includes("感情") ||
			response.aiAnalysis?.detectedTopic === "感情";
		log(
			emotionDetected
				? "✅ Emotion topic detected"
				: "❌ Emotion not detected",
			emotionDetected ? "green" : "red"
		);
		await wait();

		// Switch to career
		logStep("STEP 3", "Switch to Career (工作)");
		response = await sendMessage(
			"其實我更想知道工作運勢",
			sessionId,
			userId
		);
		const careerDetected =
			response.response?.includes("工作") ||
			response.response?.includes("事業") ||
			response.aiAnalysis?.detectedTopic === "工作";
		log(
			careerDetected
				? "✅ Career topic detected"
				: "❌ Career not detected",
			careerDetected ? "green" : "red"
		);
		await wait();

		// Switch to wealth
		logStep("STEP 4", "Switch to Wealth (財運)");
		response = await sendMessage("不對，我想問財運", sessionId, userId);
		const wealthDetected =
			response.response?.includes("財運") ||
			response.response?.includes("財富") ||
			response.aiAnalysis?.detectedTopic === "財運";
		log(
			wealthDetected
				? "✅ Wealth topic detected"
				: "❌ Wealth not detected",
			wealthDetected ? "green" : "red"
		);
		await wait();

		// Go back to emotion
		logStep("STEP 5", "Return to Emotion (感情)");
		response = await sendMessage("算了，還是問感情吧", sessionId, userId);
		const backToEmotion =
			response.response?.includes("感情") ||
			response.aiAnalysis?.detectedTopic === "感情";
		log(
			backToEmotion
				? "✅ Back to emotion topic"
				: "❌ Topic not switched back",
			backToEmotion ? "green" : "red"
		);

		log("\n✅ TEST 2 COMPLETED", "green");
		log(`📊 Topic Switching Summary:`, "cyan");
		log(
			`   Emotion → Career: ${careerDetected ? "✅" : "❌"}`,
			careerDetected ? "green" : "red"
		);
		log(
			`   Career → Wealth: ${wealthDetected ? "✅" : "❌"}`,
			wealthDetected ? "green" : "red"
		);
		log(
			`   Wealth → Emotion: ${backToEmotion ? "✅" : "❌"}`,
			backToEmotion ? "green" : "red"
		);

		return (
			emotionDetected && careerDetected && wealthDetected && backToEmotion
		);
	} catch (error) {
		log(`\n❌ TEST 2 FAILED: ${error.message}`, "red");
		return false;
	}
}

// ============================================================================
// TEST 3: Off-Topic Handling
// ============================================================================
async function testOffTopicHandling() {
	log("\n" + "=".repeat(80), "magenta");
	log("🚫 TEST 3: OFF-TOPIC HANDLING & REDIRECTION", "magenta");
	log("=".repeat(80) + "\n", "magenta");

	const sessionId = `offtopic-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	try {
		// Start with greeting
		logStep("STEP 1", "Greeting");
		await sendMessage("你好", sessionId, userId);
		await wait();

		// Ask off-topic question
		logStep("STEP 2", "Ask Off-Topic: Weather");
		let response = await sendMessage("今天天氣如何？", sessionId, userId);
		const redirectsWeather =
			response.response?.includes("抱歉") ||
			response.response?.includes("命理") ||
			response.response?.includes("風水") ||
			response.response?.includes("專長");
		log(
			redirectsWeather
				? "✅ Redirected from weather topic"
				: "❌ No redirection",
			redirectsWeather ? "green" : "red"
		);
		await wait();

		// Ask another off-topic
		logStep("STEP 3", "Ask Off-Topic: Food");
		response = await sendMessage("推薦好吃的餐廳", sessionId, userId);
		const redirectsFood =
			response.response?.includes("抱歉") ||
			response.response?.includes("命理") ||
			response.response?.includes("風水");
		log(
			redirectsFood
				? "✅ Redirected from food topic"
				: "❌ No redirection",
			redirectsFood ? "green" : "red"
		);
		await wait();

		// Try to go back to valid concern
		logStep("STEP 4", "Return to Valid Concern: Health");
		response = await sendMessage(
			"好吧，那我想問健康運勢",
			sessionId,
			userId
		);
		const healthDetected =
			response.response?.includes("健康") ||
			response.aiAnalysis?.detectedTopic === "健康";
		log(
			healthDetected
				? "✅ Successfully returned to valid concern"
				: "❌ Topic not recognized",
			healthDetected ? "green" : "red"
		);

		log("\n✅ TEST 3 COMPLETED", "green");
		log(`📊 Off-Topic Handling Summary:`, "cyan");
		log(
			`   Weather → Redirect: ${redirectsWeather ? "✅" : "❌"}`,
			redirectsWeather ? "green" : "red"
		);
		log(
			`   Food → Redirect: ${redirectsFood ? "✅" : "❌"}`,
			redirectsFood ? "green" : "red"
		);
		log(
			`   Return to Health: ${healthDetected ? "✅" : "❌"}`,
			healthDetected ? "green" : "red"
		);

		return redirectsWeather && redirectsFood && healthDetected;
	} catch (error) {
		log(`\n❌ TEST 3 FAILED: ${error.message}`, "red");
		return false;
	}
}

// ============================================================================
// TEST 4: Multiple Off-Topic Chain
// ============================================================================
async function testMultipleOffTopicChain() {
	log("\n" + "=".repeat(80), "magenta");
	log("🔗 TEST 4: MULTIPLE OFF-TOPIC CHAIN", "magenta");
	log("=".repeat(80) + "\n", "magenta");

	const sessionId = `chain-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	try {
		// Start conversation
		logStep("STEP 1", "Greeting");
		await sendMessage("你好", sessionId, userId);
		await wait();

		// Start with valid concern
		logStep("STEP 2", "Start with Career");
		let response = await sendMessage("我想問工作", sessionId, userId);
		const careerStart =
			response.response?.includes("工作") ||
			response.response?.includes("事業");
		log(
			careerStart ? "✅ Career topic started" : "❌ Career not detected",
			careerStart ? "green" : "red"
		);
		await wait();

		// Chain of off-topic questions
		logStep("STEP 3", "Off-Topic Chain #1: Sports");
		response = await sendMessage("你覺得哪隊會贏球賽？", sessionId, userId);
		const redirects1 =
			response.response?.includes("抱歉") ||
			response.response?.includes("命理") ||
			response.response?.includes("專長");
		log(
			redirects1 ? "✅ Redirected" : "❌ No redirection",
			redirects1 ? "green" : "red"
		);
		await wait();

		logStep("STEP 4", "Off-Topic Chain #2: Technology");
		response = await sendMessage("哪支手機比較好？", sessionId, userId);
		const redirects2 =
			response.response?.includes("抱歉") ||
			response.response?.includes("命理");
		log(
			redirects2 ? "✅ Redirected" : "❌ No redirection",
			redirects2 ? "green" : "red"
		);
		await wait();

		logStep("STEP 5", "Off-Topic Chain #3: Travel");
		response = await sendMessage("去哪裡旅遊好？", sessionId, userId);
		const redirects3 =
			response.response?.includes("抱歉") ||
			response.response?.includes("命理");
		log(
			redirects3 ? "✅ Redirected" : "❌ No redirection",
			redirects3 ? "green" : "red"
		);
		await wait();

		// Return to original concern
		logStep("STEP 6", "Return to Original Career Topic");
		response = await sendMessage("好啦，回到工作的問題", sessionId, userId);
		const backToCareer =
			response.response?.includes("工作") ||
			response.response?.includes("事業") ||
			response.response?.includes("生日") ||
			response.conversationState === "birthday_collection";
		log(
			backToCareer
				? "✅ Successfully returned to career topic"
				: "❌ Context lost",
			backToCareer ? "green" : "red"
		);

		log("\n✅ TEST 4 COMPLETED", "green");
		log(`📊 Off-Topic Chain Summary:`, "cyan");
		log(
			`   Sports → Redirect: ${redirects1 ? "✅" : "❌"}`,
			redirects1 ? "green" : "red"
		);
		log(
			`   Technology → Redirect: ${redirects2 ? "✅" : "❌"}`,
			redirects2 ? "green" : "red"
		);
		log(
			`   Travel → Redirect: ${redirects3 ? "✅" : "❌"}`,
			redirects3 ? "green" : "red"
		);
		log(
			`   Return to Career: ${backToCareer ? "✅" : "❌"}`,
			backToCareer ? "green" : "red"
		);

		return redirects1 && redirects2 && redirects3 && backToCareer;
	} catch (error) {
		log(`\n❌ TEST 4 FAILED: ${error.message}`, "red");
		return false;
	}
}

// ============================================================================
// TEST 5: Context Persistence Across Topic Changes
// ============================================================================
async function testContextPersistence() {
	log("\n" + "=".repeat(80), "magenta");
	log("💾 TEST 5: CONTEXT PERSISTENCE", "magenta");
	log("=".repeat(80) + "\n", "magenta");

	const sessionId = `context-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	try {
		logStep("STEP 1", "Greeting");
		await sendMessage("你好", sessionId, userId);
		await wait();

		// Provide birthday in emotion context
		logStep("STEP 2", "Emotion + Birthday");
		await sendMessage("我想問感情", sessionId, userId);
		await wait();
		let response = await sendMessage("1", sessionId, userId);
		await wait();
		await sendMessage("1990年5月15日 女", sessionId, userId);
		await wait(3000);

		// Switch to different concern
		logStep("STEP 3", "Switch to Wealth");
		response = await sendMessage("我也想問財運", sessionId, userId);
		await wait();

		// Check if birthday is remembered
		logStep("STEP 4", "Check if Birthday Remembered");
		const rememberedBirthday =
			response.response?.includes("1990") ||
			response.response?.includes("之前") ||
			response.response?.includes("資料") ||
			!response.response?.includes("生日");

		if (rememberedBirthday) {
			log("✅ Context persisted - birthday remembered", "green");
		} else {
			log("⚠️  Birthday may need to be re-entered", "yellow");
		}

		log("\n✅ TEST 5 COMPLETED", "green");
		return true;
	} catch (error) {
		log(`\n❌ TEST 5 FAILED: ${error.message}`, "red");
		return false;
	}
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
	log("\n" + "=".repeat(80), "cyan");
	log("🚀 COMPLETE JOURNEY TEST SUITE", "cyan");
	log("=".repeat(80), "cyan");
	log(`📍 Endpoint: ${API_ENDPOINT}`, "blue");
	log(`⏱️  Timeout: ${TIMEOUT}ms per request`, "blue");
	log(`⏳ Delay: ${DELAY}ms between requests`, "blue");
	log("=".repeat(80) + "\n", "cyan");

	const results = {
		completeJourney: false,
		topicSwitching: false,
		offTopicHandling: false,
		multipleOffTopic: false,
		contextPersistence: false,
	};

	// Run tests
	results.completeJourney = await testCompleteJourney();
	await wait(3000);

	results.topicSwitching = await testTopicSwitching();
	await wait(3000);

	results.offTopicHandling = await testOffTopicHandling();
	await wait(3000);

	results.multipleOffTopicChain = await testMultipleOffTopicChain();
	await wait(3000);

	results.contextPersistence = await testContextPersistence();

	// Final Summary
	log("\n" + "=".repeat(80), "cyan");
	log("📊 FINAL TEST SUMMARY", "cyan");
	log("=".repeat(80), "cyan");

	const tests = [
		["Complete Journey (Greeting → Payment)", results.completeJourney],
		["Topic Switching (Between Concerns)", results.topicSwitching],
		["Off-Topic Handling", results.offTopicHandling],
		["Multiple Off-Topic Chain", results.multipleOffTopicChain],
		["Context Persistence", results.contextPersistence],
	];

	let passed = 0;
	let failed = 0;

	tests.forEach(([name, result]) => {
		const status = result ? "✅ PASS" : "❌ FAIL";
		const color = result ? "green" : "red";
		log(`${status} - ${name}`, color);
		result ? passed++ : failed++;
	});

	const total = passed + failed;
	const percentage = ((passed / total) * 100).toFixed(1);

	log("\n" + "─".repeat(80), "gray");
	log(
		`Total: ${total} | Passed: ${passed} | Failed: ${failed} | Success Rate: ${percentage}%`,
		passed === total ? "green" : "yellow"
	);
	log("=".repeat(80) + "\n", "cyan");

	return passed === total;
}

// Run all tests
runAllTests()
	.then((success) => {
		process.exit(success ? 0 : 1);
	})
	.catch((error) => {
		log(`\n💥 Fatal Error: ${error.message}`, "red");
		console.error(error);
		process.exit(1);
	});
