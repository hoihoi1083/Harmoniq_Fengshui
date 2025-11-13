/**
 * 🔀 Context Switch Test: Valid Concern → Off-Topic → Back to Concern
 *
 * This test simulates realistic user behavior:
 * 1. User starts with valid concern (感情/工作/財運)
 * 2. Mid-conversation, switches to irrelevant topics
 * 3. Tries to return to original concern
 *
 * We test:
 * - How chatbot handles interruption
 * - Whether context is maintained
 * - Quality of redirection back to service
 * - Response consistency
 */

const API_ENDPOINT = "https://www.harmoniqfengshui.com/api/smart-chat2";
const TIMEOUT = 35000;

const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	magenta: "\x1b[35m",
	gray: "\x1b[90m",
	bold: "\x1b[1m",
};

function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBox(title, color = "cyan") {
	log("\n" + "═".repeat(80), color);
	log(`  ${title}`, color);
	log("═".repeat(80) + "\n", color);
}

function logStep(stepNum, description) {
	log(`\n${"─".repeat(80)}`, "gray");
	log(`📍 STEP ${stepNum}: ${description}`, "cyan");
	log("─".repeat(80), "gray");
}

async function sendMessage(message, sessionId, userId) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
	const startTime = Date.now();

	try {
		log(`\n💬 User: "${message}"`, "yellow");

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

		log(
			`⏱️  Response time: ${(elapsedTime / 1000).toFixed(2)}s`,
			elapsedTime > 20000
				? "red"
				: elapsedTime > 10000
					? "yellow"
					: "green"
		);
		log(`📊 State: ${data.conversationState || "unknown"}`, "gray");
		log(`📍 Topic: ${data.aiAnalysis?.detectedTopic || "N/A"}`, "blue");
		log(`\n🤖 Chatbot Response:`, "cyan");
		log("┌" + "─".repeat(78) + "┐", "gray");

		const responseText = data.response || "(no response)";
		const lines = responseText.split("\n");
		lines.forEach((line) => {
			// Wrap long lines
			if (line.length > 76) {
				const chunks = line.match(/.{1,76}/g) || [line];
				chunks.forEach((chunk) => {
					log(`│ ${chunk.padEnd(76)} │`, "white");
				});
			} else {
				log(`│ ${line.padEnd(76)} │`, "white");
			}
		});

		log("└" + "─".repeat(78) + "┘\n", "gray");

		return { data, elapsedTime, error: null };
	} catch (error) {
		const elapsedTime = Date.now() - startTime;
		clearTimeout(timeoutId);

		if (error.name === "AbortError") {
			log(`❌ TIMEOUT after ${(elapsedTime / 1000).toFixed(2)}s`, "red");
			return { data: null, elapsedTime, error: "timeout" };
		}
		log(`❌ Error: ${error.message}`, "red");
		return { data: null, elapsedTime, error: error.message };
	}
}

async function wait(ms = 2000) {
	log(`⏳ Waiting ${ms}ms...\n`, "gray");
	await new Promise((resolve) => setTimeout(resolve, ms));
}

function analyzeRedirection(response) {
	if (!response)
		return { isRedirect: false, strength: "NONE", details: "No response" };

	const strongIndicators = [
		"抱歉",
		"不是小鈴的專長",
		"不在我的專業",
		"我專注於",
	];
	const weakIndicators = [
		"其實",
		"你知道嗎",
		"不過",
		"說到",
		"也跟",
		"息息相關",
	];
	const concernMentioned =
		response.includes("感情") ||
		response.includes("工作") ||
		response.includes("財運") ||
		response.includes("健康") ||
		response.includes("命理") ||
		response.includes("風水");

	const hasStrong = strongIndicators.some((ind) => response.includes(ind));
	const hasWeak = weakIndicators.some((ind) => response.includes(ind));

	if (hasStrong && concernMentioned) {
		return {
			isRedirect: true,
			strength: "STRONG",
			details: "Clear boundary + redirect to services",
		};
	} else if (hasWeak && concernMentioned) {
		return {
			isRedirect: true,
			strength: "WEAK",
			details: "Tries to relate topic to feng shui",
		};
	} else if (concernMentioned) {
		return {
			isRedirect: true,
			strength: "MODERATE",
			details: "Mentions services without clear boundary",
		};
	} else {
		return {
			isRedirect: false,
			strength: "NONE",
			details: "Engages with off-topic without redirect",
		};
	}
}

function analyzeContextRetention(response, originalConcern) {
	const mentionsOriginal = response.includes(originalConcern);
	const asksBirthday = response.includes("生日") || response.includes("出生");
	const hasChoices = response.includes("1️⃣") || response.includes("2️⃣");

	return {
		remembersOriginalConcern: mentionsOriginal,
		continuesFlow: asksBirthday || hasChoices,
		score:
			(mentionsOriginal ? 1 : 0) + (asksBirthday || hasChoices ? 1 : 0),
	};
}

// ============================================================================
// TEST SCENARIO 1: Emotion → Weather → Back to Emotion
// ============================================================================
async function testEmotionToWeather() {
	logBox("TEST 1: EMOTION → WEATHER → BACK TO EMOTION", "magenta");

	const sessionId = `test1-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	// Step 1: Greeting
	logStep(1, "Initial Greeting");
	await sendMessage("你好", sessionId, userId);
	await wait();

	// Step 2: Ask about emotion
	logStep(2, "Ask About Emotion (Valid Concern)");
	const emotionResponse = await sendMessage("我想問感情", sessionId, userId);
	await wait(3000);

	// Step 3: Suddenly ask about weather (off-topic)
	logStep(3, "Switch to Weather (Off-Topic)");
	const weatherResponse = await sendMessage(
		"今天天氣如何？",
		sessionId,
		userId
	);
	const weatherRedirect = analyzeRedirection(weatherResponse.data?.response);
	log(`\n📊 Redirection Analysis:`, "cyan");
	log(
		`   Is Redirect: ${weatherRedirect.isRedirect ? "✅" : "❌"}`,
		weatherRedirect.isRedirect ? "green" : "red"
	);
	log(
		`   Strength: ${weatherRedirect.strength}`,
		weatherRedirect.strength === "STRONG"
			? "green"
			: weatherRedirect.strength === "WEAK"
				? "yellow"
				: "red"
	);
	log(`   Details: ${weatherRedirect.details}`, "gray");
	await wait();

	// Step 4: Try to go back to emotion
	logStep(4, "Return to Original Concern (Emotion)");
	const backToEmotion = await sendMessage(
		"好吧，我想繼續問感情的事",
		sessionId,
		userId
	);
	const contextRetention = analyzeContextRetention(
		backToEmotion.data?.response,
		"感情"
	);
	log(`\n📊 Context Retention Analysis:`, "cyan");
	log(
		`   Remembers Original Concern: ${contextRetention.remembersOriginalConcern ? "✅" : "❌"}`,
		contextRetention.remembersOriginalConcern ? "green" : "red"
	);
	log(
		`   Continues Flow: ${contextRetention.continuesFlow ? "✅" : "❌"}`,
		contextRetention.continuesFlow ? "green" : "red"
	);
	log(
		`   Score: ${contextRetention.score}/2`,
		contextRetention.score === 2
			? "green"
			: contextRetention.score === 1
				? "yellow"
				: "red"
	);

	return {
		scenario: "Emotion → Weather → Emotion",
		redirectStrength: weatherRedirect.strength,
		contextScore: contextRetention.score,
	};
}

// ============================================================================
// TEST SCENARIO 2: Career → Food → Back to Career
// ============================================================================
async function testCareerToFood() {
	logBox("TEST 2: CAREER → FOOD → BACK TO CAREER", "magenta");

	const sessionId = `test2-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	logStep(1, "Initial Greeting");
	await sendMessage("你好", sessionId, userId);
	await wait();

	logStep(2, "Ask About Career (Valid Concern)");
	await sendMessage("我想問工作運勢", sessionId, userId);
	await wait(3000);

	logStep(3, "Switch to Food Recommendation (Off-Topic)");
	const foodResponse = await sendMessage("推薦好吃的餐廳", sessionId, userId);
	const foodRedirect = analyzeRedirection(foodResponse.data?.response);
	log(`\n📊 Redirection Analysis:`, "cyan");
	log(
		`   Is Redirect: ${foodRedirect.isRedirect ? "✅" : "❌"}`,
		foodRedirect.isRedirect ? "green" : "red"
	);
	log(
		`   Strength: ${foodRedirect.strength}`,
		foodRedirect.strength === "STRONG"
			? "green"
			: foodRedirect.strength === "WEAK"
				? "yellow"
				: "red"
	);
	log(`   Details: ${foodRedirect.details}`, "gray");
	await wait();

	logStep(4, "Return to Career");
	const backToCareer = await sendMessage(
		"算了，還是想問工作的事",
		sessionId,
		userId
	);
	const contextRetention = analyzeContextRetention(
		backToCareer.data?.response,
		"工作"
	);
	log(`\n📊 Context Retention Analysis:`, "cyan");
	log(
		`   Remembers Original Concern: ${contextRetention.remembersOriginalConcern ? "✅" : "❌"}`,
		contextRetention.remembersOriginalConcern ? "green" : "red"
	);
	log(
		`   Continues Flow: ${contextRetention.continuesFlow ? "✅" : "❌"}`,
		contextRetention.continuesFlow ? "green" : "red"
	);
	log(
		`   Score: ${contextRetention.score}/2`,
		contextRetention.score === 2 ? "green" : "yellow"
	);

	return {
		scenario: "Career → Food → Career",
		redirectStrength: foodRedirect.strength,
		contextScore: contextRetention.score,
	};
}

// ============================================================================
// TEST SCENARIO 3: Wealth → Multiple Off-Topics → Back to Wealth
// ============================================================================
async function testMultipleOffTopicInterruptions() {
	logBox("TEST 3: WEALTH → MULTIPLE OFF-TOPICS → WEALTH", "magenta");

	const sessionId = `test3-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	logStep(1, "Initial Greeting");
	await sendMessage("你好", sessionId, userId);
	await wait();

	logStep(2, "Ask About Wealth (Valid Concern)");
	await sendMessage("我想問財運", sessionId, userId);
	await wait(3000);

	logStep(3, "First Off-Topic: Shopping");
	const shopping = await sendMessage("哪支手機比較好？", sessionId, userId);
	const shoppingRedirect = analyzeRedirection(shopping.data?.response);
	log(
		`📊 Redirect Strength: ${shoppingRedirect.strength}`,
		shoppingRedirect.strength === "STRONG" ? "green" : "yellow"
	);
	await wait();

	logStep(4, "Second Off-Topic: Entertainment");
	const entertainment = await sendMessage(
		"有什麼好看的電影？",
		sessionId,
		userId
	);
	const entertainmentRedirect = analyzeRedirection(
		entertainment.data?.response
	);
	log(
		`📊 Redirect Strength: ${entertainmentRedirect.strength}`,
		entertainmentRedirect.strength === "STRONG" ? "green" : "yellow"
	);
	await wait();

	logStep(5, "Third Off-Topic: Travel");
	const travel = await sendMessage("去哪裡旅遊好？", sessionId, userId);
	const travelRedirect = analyzeRedirection(travel.data?.response);
	log(
		`📊 Redirect Strength: ${travelRedirect.strength}`,
		travelRedirect.strength === "STRONG" ? "green" : "yellow"
	);
	await wait();

	logStep(6, "Return to Wealth After Multiple Interruptions");
	const backToWealth = await sendMessage("回到財運的問題", sessionId, userId);
	const contextRetention = analyzeContextRetention(
		backToWealth.data?.response,
		"財運"
	);
	log(`\n📊 Context Retention After Multiple Off-Topics:`, "cyan");
	log(
		`   Remembers Original Concern: ${contextRetention.remembersOriginalConcern ? "✅" : "❌"}`,
		contextRetention.remembersOriginalConcern ? "green" : "red"
	);
	log(
		`   Continues Flow: ${contextRetention.continuesFlow ? "✅" : "❌"}`,
		contextRetention.continuesFlow ? "green" : "red"
	);

	return {
		scenario: "Wealth → 3 Off-Topics → Wealth",
		redirections: [
			shoppingRedirect.strength,
			entertainmentRedirect.strength,
			travelRedirect.strength,
		],
		contextScore: contextRetention.score,
	};
}

// ============================================================================
// TEST SCENARIO 4: Mid-Flow Interruption (Birthday Collection)
// ============================================================================
async function testMidFlowInterruption() {
	logBox("TEST 4: INTERRUPT DURING BIRTHDAY COLLECTION", "magenta");

	const sessionId = `test4-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	logStep(1, "Start Emotion Analysis Flow");
	await sendMessage("你好", sessionId, userId);
	await wait();
	await sendMessage("我想問感情", sessionId, userId);
	await wait(3000);

	logStep(2, "Choose Personal Analysis");
	await sendMessage("1", sessionId, userId);
	await wait(3000);

	logStep(3, "Interrupt When Asked for Birthday → Ask About Sports");
	const interrupt = await sendMessage("你覺得哪隊會贏？", sessionId, userId);
	const interruptRedirect = analyzeRedirection(interrupt.data?.response);
	log(`\n📊 Redirection During Flow:`, "cyan");
	log(
		`   Strength: ${interruptRedirect.strength}`,
		interruptRedirect.strength === "STRONG" ? "green" : "yellow"
	);
	log(
		`   Maintains Flow State: ${interrupt.data?.conversationState === "birthday_collection" ? "✅" : "❌"}`,
		interrupt.data?.conversationState === "birthday_collection"
			? "green"
			: "red"
	);
	await wait();

	logStep(4, "Try to Continue Original Flow");
	const continueFlow = await sendMessage("1990年5月15日", sessionId, userId);
	log(`\n📊 Flow Continuation:`, "cyan");
	log(
		`   Accepts Birthday: ${continueFlow.data?.conversationState !== "birthday_collection" ? "✅" : "❌"}`,
		continueFlow.data?.conversationState !== "birthday_collection"
			? "green"
			: "yellow"
	);

	return {
		scenario: "Mid-Flow Interruption (Birthday Collection)",
		redirectStrength: interruptRedirect.strength,
		maintainedState:
			interrupt.data?.conversationState === "birthday_collection",
	};
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
	logBox("🔀 CONTEXT SWITCH TEST SUITE", "cyan");
	log(
		"Testing user behavior: Valid Concern → Off-Topic → Back to Concern",
		"blue"
	);
	log(`Endpoint: ${API_ENDPOINT}`, "gray");
	log(`Timeout: ${TIMEOUT}ms\n`, "gray");

	const results = [];

	try {
		results.push(await testEmotionToWeather());
		await wait(5000);

		results.push(await testCareerToFood());
		await wait(5000);

		results.push(await testMultipleOffTopicInterruptions());
		await wait(5000);

		results.push(await testMidFlowInterruption());

		// Summary
		logBox("📊 FINAL SUMMARY", "cyan");

		results.forEach((result, index) => {
			log(`\nTest ${index + 1}: ${result.scenario}`, "yellow");
			if (result.redirectStrength) {
				log(
					`  Redirect Strength: ${result.redirectStrength}`,
					result.redirectStrength === "STRONG"
						? "green"
						: result.redirectStrength === "WEAK"
							? "yellow"
							: "red"
				);
			}
			if (result.redirections) {
				log(
					`  Redirections: ${result.redirections.join(" → ")}`,
					"blue"
				);
			}
			if (result.contextScore !== undefined) {
				log(
					`  Context Retention: ${result.contextScore}/2`,
					result.contextScore === 2
						? "green"
						: result.contextScore === 1
							? "yellow"
							: "red"
				);
			}
			if (result.maintainedState !== undefined) {
				log(
					`  Maintained State: ${result.maintainedState ? "✅" : "❌"}`,
					result.maintainedState ? "green" : "red"
				);
			}
		});

		logBox("✅ ALL TESTS COMPLETED", "green");
	} catch (error) {
		logBox(`❌ TEST SUITE FAILED: ${error.message}`, "red");
		console.error(error);
	}
}

runAllTests();
