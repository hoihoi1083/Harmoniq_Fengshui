/**
 * 🔄 Topic Switching Analysis Test
 *
 * Detailed examination of topic switching behavior:
 * 1. Measure exact response times for each switch
 * 2. Analyze full responses for topic switching
 * 3. Test all concern combinations
 * 4. Check if context is maintained
 */

const API_ENDPOINT = "https://www.harmoniqfengshui.com/api/smart-chat2";
const TIMEOUT = 40000; // 40 seconds to avoid premature timeouts

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

function logSection(title) {
	log("\n" + "─".repeat(80), "gray");
	log(`  ${title}`, "cyan");
	log("─".repeat(80), "gray");
}

async function sendMessage(message, sessionId, userId, locale = "zh-TW") {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
	const startTime = Date.now();

	try {
		log(`\n💬 Sending: "${message}"`, "yellow");
		log(`⏱️  Start time: ${new Date().toLocaleTimeString()}`, "gray");

		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message, sessionId, userId, locale }),
			signal: controller.signal,
		});

		const elapsedTime = Date.now() - startTime;
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();

		log(
			`\n⏱️  Response time: ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s)`,
			elapsedTime > 20000
				? "red"
				: elapsedTime > 10000
					? "yellow"
					: "green"
		);
		log(`📊 State: ${data.conversationState || "unknown"}`, "gray");
		log(
			`📍 Detected Topic: ${data.aiAnalysis?.detectedTopic || "N/A"}`,
			"blue"
		);
		log(`📈 Confidence: ${data.aiAnalysis?.confidence || "N/A"}`, "blue");
		log(`\n📝 FULL RESPONSE:`, "cyan");
		log("─".repeat(80), "gray");
		log(data.response || "(no response)", "white");
		log("─".repeat(80) + "\n", "gray");

		return { data, elapsedTime };
	} catch (error) {
		const elapsedTime = Date.now() - startTime;
		clearTimeout(timeoutId);

		if (error.name === "AbortError") {
			log(`\n❌ TIMEOUT after ${elapsedTime}ms`, "red");
			return { error: "timeout", elapsedTime };
		}
		log(`\n❌ Error: ${error.message}`, "red");
		return { error: error.message, elapsedTime };
	}
}

async function wait(ms = 2000) {
	log(`\n⏳ Waiting ${ms}ms...`, "gray");
	await new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// TEST 1: Sequential Topic Switching with Timing
// ============================================================================
async function testSequentialTopicSwitching() {
	logBox("TEST 1: SEQUENTIAL TOPIC SWITCHING", "magenta");

	const sessionId = `sequential-${Date.now()}`;
	const userId = `user-${Date.now()}`;
	const results = [];

	// Greeting
	logSection("STEP 1: Initial Greeting");
	const greeting = await sendMessage("你好", sessionId, userId);
	results.push({ step: "Greeting", time: greeting.elapsedTime });
	await wait(3000);

	// Topic 1: Emotion
	logSection("STEP 2: Topic - 感情 (Emotion)");
	const emotion = await sendMessage("我想問感情", sessionId, userId);
	results.push({ step: "感情 (Emotion)", time: emotion.elapsedTime });
	await wait(3000);

	// Switch to Career
	logSection("STEP 3: Switch to 工作 (Career)");
	const career = await sendMessage("其實我想問工作運勢", sessionId, userId);
	results.push({ step: "Switch to 工作", time: career.elapsedTime });
	await wait(3000);

	// Switch to Wealth
	logSection("STEP 4: Switch to 財運 (Wealth)");
	const wealth = await sendMessage(
		"不對，我比較想知道財運",
		sessionId,
		userId
	);
	results.push({ step: "Switch to 財運", time: wealth.elapsedTime });
	await wait(3000);

	// Switch to Health
	logSection("STEP 5: Switch to 健康 (Health)");
	const health = await sendMessage("算了，我想問健康", sessionId, userId);
	results.push({ step: "Switch to 健康", time: health.elapsedTime });
	await wait(3000);

	// Back to Emotion
	logSection("STEP 6: Back to 感情 (Emotion)");
	const backToEmotion = await sendMessage(
		"還是想問感情吧",
		sessionId,
		userId
	);
	results.push({ step: "Back to 感情", time: backToEmotion.elapsedTime });

	// Summary
	logBox("TIMING SUMMARY", "cyan");
	results.forEach((result) => {
		const timeInSeconds = (result.time / 1000).toFixed(2);
		const color =
			result.time > 20000
				? "red"
				: result.time > 10000
					? "yellow"
					: "green";
		log(`${result.step.padEnd(25)} ${timeInSeconds}s`, color);
	});

	const avgTime =
		results.reduce((sum, r) => sum + r.time, 0) / results.length;
	log(`\nAverage response time: ${(avgTime / 1000).toFixed(2)}s`, "cyan");

	return results;
}

// ============================================================================
// TEST 2: Rapid Topic Switching (No waiting)
// ============================================================================
async function testRapidTopicSwitching() {
	logBox("TEST 2: RAPID TOPIC SWITCHING (Stress Test)", "magenta");

	const sessionId = `rapid-${Date.now()}`;
	const userId = `user-${Date.now()}`;
	const results = [];

	logSection("STEP 1: Greeting");
	await sendMessage("你好", sessionId, userId);
	await wait(2000);

	const switches = [
		"我想問感情",
		"不對，工作更重要",
		"還是財運比較實際",
		"健康第一",
		"命理呢？",
		"還是感情吧",
	];

	for (let i = 0; i < switches.length; i++) {
		logSection(`RAPID SWITCH ${i + 1}/${switches.length}`);
		const result = await sendMessage(switches[i], sessionId, userId);
		results.push({
			message: switches[i],
			time: result.elapsedTime,
			success: !result.error,
		});
		await wait(1000); // Minimal wait
	}

	// Summary
	logBox("RAPID SWITCHING SUMMARY", "cyan");
	results.forEach((result, i) => {
		const timeStr = result.time
			? `${(result.time / 1000).toFixed(2)}s`
			: "TIMEOUT";
		const status = result.success ? "✅" : "❌";
		const color = result.success ? "green" : "red";
		log(
			`${status} Switch ${i + 1}: ${timeStr.padEnd(10)} - ${result.message}`,
			color
		);
	});

	return results;
}

// ============================================================================
// TEST 3: Same Topic Repeated
// ============================================================================
async function testRepeatedTopicMention() {
	logBox("TEST 3: REPEATED TOPIC MENTION", "magenta");

	const sessionId = `repeated-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	logSection("Setup");
	await sendMessage("你好", sessionId, userId);
	await wait(2000);

	logSection("First mention: 感情");
	const first = await sendMessage("我想問感情", sessionId, userId);
	await wait(3000);

	logSection("Repeat same topic: 感情 again");
	const repeat = await sendMessage("我還是想問感情的事", sessionId, userId);
	await wait(3000);

	logSection("Third time: 感情");
	const third = await sendMessage("感情問題", sessionId, userId);

	logBox("ANALYSIS", "cyan");
	log(
		`First mention: ${(first.elapsedTime / 1000).toFixed(2)}s`,
		first.elapsedTime > 15000 ? "yellow" : "green"
	);
	log(
		`Repeat mention: ${(repeat.elapsedTime / 1000).toFixed(2)}s`,
		repeat.elapsedTime > 15000 ? "yellow" : "green"
	);
	log(
		`Third mention: ${(third.elapsedTime / 1000).toFixed(2)}s`,
		third.elapsedTime > 15000 ? "yellow" : "green"
	);

	if (repeat.elapsedTime < first.elapsedTime * 0.8) {
		log("\n✅ Response faster on repeat (possible caching)", "green");
	} else {
		log("\n⚠️  No significant speed improvement on repeat", "yellow");
	}
}

// ============================================================================
// TEST 4: Topic Switch from Mid-Conversation
// ============================================================================
async function testMidConversationSwitch() {
	logBox("TEST 4: MID-CONVERSATION TOPIC SWITCH", "magenta");

	const sessionId = `midconv-${Date.now()}`;
	const userId = `user-${Date.now()}`;

	logSection("Start conversation flow");
	await sendMessage("你好", sessionId, userId);
	await wait(2000);

	await sendMessage("我想問感情", sessionId, userId);
	await wait(3000);

	await sendMessage("1", sessionId, userId); // Choose personal analysis
	await wait(3000);

	logSection(
		"MID-CONVERSATION SWITCH: Change topic while in birthday collection"
	);
	const midSwitch = await sendMessage(
		"等等，我想改問工作",
		sessionId,
		userId
	);

	logBox("ANALYSIS", "cyan");
	log(
		`Response time: ${(midSwitch.elapsedTime / 1000).toFixed(2)}s`,
		midSwitch.elapsedTime > 15000 ? "yellow" : "green"
	);

	if (midSwitch.data?.conversationState === "birthday_collection") {
		log("✅ Stayed in birthday collection state", "green");
	} else {
		log(`📊 Changed to: ${midSwitch.data?.conversationState}`, "blue");
	}
}

// ============================================================================
// MAIN
// ============================================================================
async function runAllTests() {
	logBox("🔄 TOPIC SWITCHING ANALYSIS SUITE", "cyan");
	log(`Endpoint: ${API_ENDPOINT}`, "blue");
	log(`Timeout: ${TIMEOUT}ms`, "blue");

	try {
		await testSequentialTopicSwitching();
		await wait(5000);

		await testRapidTopicSwitching();
		await wait(5000);

		await testRepeatedTopicMention();
		await wait(5000);

		await testMidConversationSwitch();

		logBox("✅ ALL TESTS COMPLETED", "green");
	} catch (error) {
		logBox(`❌ TEST SUITE FAILED: ${error.message}`, "red");
		console.error(error);
	}
}

runAllTests();
