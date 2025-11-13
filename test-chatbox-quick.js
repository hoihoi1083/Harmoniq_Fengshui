/**
 * 🧪 Quick Chatbox Flow Testing
 * Tests key conversation flows with timeout protection
 */

const BASE_URL = "https://www.harmoniqfengshui.com";
const API_ENDPOINT = `${BASE_URL}/api/smart-chat2`;
const TIMEOUT = 20000; // 20 seconds - increased for follow-up messages

const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function print(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sendMessage(message, sessionId, locale = "zh-TW") {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

	try {
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message,
				sessionId,
				userId: `test-${Date.now()}`,
				locale,
			}),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === "AbortError") {
			throw new Error("Request timeout");
		}
		throw error;
	}
}

async function runTests() {
	print("\n" + "=".repeat(80), "cyan");
	print("🚀 QUICK CHATBOX TEST SUITE", "cyan");
	print("=".repeat(80), "cyan");
	print(`Endpoint: ${API_ENDPOINT}`, "blue");
	print(`Timeout: ${TIMEOUT}ms`, "blue");
	print("=".repeat(80) + "\n", "cyan");

	let passed = 0;
	let failed = 0;

	// Test 1: Greeting Flow
	print("📋 TEST 1: Greeting Flow", "yellow");
	try {
		const sessionId = `test-greeting-${Date.now()}`;
		const response = await sendMessage("你好", sessionId);

		if (response && response.response && response.response.length > 0) {
			print("✅ Pass: Got greeting response", "green");
			print(
				`   Response: ${response.response.substring(0, 100)}...`,
				"blue"
			);
			passed++;
		} else {
			print("❌ Fail: Empty response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Test 2: Emotion Flow
	print("\n📋 TEST 2: Emotion Flow", "yellow");
	try {
		const sessionId = `test-emotion-${Date.now()}`;
		await sendMessage("你好", sessionId);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await sendMessage("我想問感情", sessionId);

		if (response && response.response) {
			const hasChoices =
				response.response.includes("1️⃣") ||
				response.response.includes("2️⃣");
			const hasEmotion = response.response.includes("感情");

			if (hasChoices || hasEmotion) {
				print("✅ Pass: Emotion flow triggered", "green");
				print(
					`   Response: ${response.response.substring(0, 150)}...`,
					"blue"
				);
				passed++;
			} else {
				print("⚠️  Warning: Unexpected response format", "yellow");
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				failed++;
			}
		} else {
			print("❌ Fail: No response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Test 3: Couple Analysis Flow
	print("\n📋 TEST 3: Couple Analysis Flow", "yellow");
	try {
		const sessionId = `test-couple-${Date.now()}`;
		await sendMessage("你好", sessionId);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await sendMessage("我想做合盤分析", sessionId);

		if (response && response.response) {
			const hasBirthday =
				response.response.includes("生日") ||
				response.response.includes("出生");
			const hasCouple =
				response.response.includes("合盤") ||
				response.response.includes("配對");

			if (hasBirthday || hasCouple) {
				print("✅ Pass: Couple analysis flow triggered", "green");
				print(
					`   Response: ${response.response.substring(0, 150)}...`,
					"blue"
				);
				passed++;
			} else {
				print("⚠️  Warning: Unexpected response format", "yellow");
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				failed++;
			}
		} else {
			print("❌ Fail: No response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Test 4: Career Flow
	print("\n📋 TEST 4: Career Flow", "yellow");
	try {
		const sessionId = `test-career-${Date.now()}`;
		await sendMessage("你好", sessionId);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await sendMessage("我想問工作運勢", sessionId);

		if (response && response.response) {
			const hasCareer =
				response.response.includes("工作") ||
				response.response.includes("事業");
			const hasBirthday =
				response.response.includes("生日") ||
				response.response.includes("出生");

			if (hasCareer || hasBirthday) {
				print("✅ Pass: Career flow triggered", "green");
				print(
					`   Response: ${response.response.substring(0, 150)}...`,
					"blue"
				);
				passed++;
			} else {
				print("⚠️  Warning: Unexpected response format", "yellow");
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				failed++;
			}
		} else {
			print("❌ Fail: No response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Test 5: Markdown Cleaning
	print("\n📋 TEST 5: Markdown Cleaning", "yellow");
	try {
		const sessionId = `test-markdown-${Date.now()}`;
		await sendMessage("你好", sessionId);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await sendMessage("告訴我關於命理的事", sessionId);

		if (response && response.response) {
			const hasMarkdown =
				response.response.includes("**") ||
				response.response.includes("##");

			if (!hasMarkdown) {
				print("✅ Pass: No markdown artifacts found", "green");
				passed++;
			} else {
				print("❌ Fail: Found markdown artifacts (**, ##)", "red");
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				failed++;
			}
		} else {
			print("❌ Fail: No response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Test 6: Simplified Chinese Locale
	print("\n📋 TEST 6: Simplified Chinese (zh-CN)", "yellow");
	try {
		const sessionId = `test-zhcn-${Date.now()}`;
		const response = await sendMessage("你好", sessionId, "zh-CN");

		if (response && response.response) {
			// Check for simplified characters (简体)
			const hasSimplified =
				response.response.includes("风水") || // 風水 in simplified
				response.response.includes("认识") || // 認識 in simplified
				!response.response.includes("風水"); // Should NOT have traditional

			if (hasSimplified) {
				print("✅ Pass: Simplified Chinese response received", "green");
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				passed++;
			} else {
				print(
					"⚠️  Warning: Response may not be in simplified Chinese",
					"yellow"
				);
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				failed++;
			}
		} else {
			print("❌ Fail: No response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Test 7: Out of Scope
	print("\n📋 TEST 7: Out of Scope Handling", "yellow");
	try {
		const sessionId = `test-outofscope-${Date.now()}`;
		await sendMessage("你好", sessionId);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const response = await sendMessage("今天天氣如何？", sessionId);

		if (response && response.response) {
			const hasPoliteDecline =
				response.response.includes("抱歉") ||
				response.response.includes("命理") ||
				response.response.includes("風水") ||
				response.response.includes("專長");

			if (hasPoliteDecline) {
				print(
					"✅ Pass: Handled out-of-scope question appropriately",
					"green"
				);
				print(
					`   Response: ${response.response.substring(0, 150)}...`,
					"blue"
				);
				passed++;
			} else {
				print("⚠️  Warning: Unclear if handled properly", "yellow");
				print(
					`   Response: ${response.response.substring(0, 100)}...`,
					"blue"
				);
				failed++;
			}
		} else {
			print("❌ Fail: No response", "red");
			failed++;
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		failed++;
	}

	// Summary
	print("\n" + "=".repeat(80), "cyan");
	print("📊 TEST SUMMARY", "cyan");
	print("=".repeat(80), "cyan");
	print(`Total Tests: ${passed + failed}`, "blue");
	print(`✅ Passed: ${passed}`, "green");
	print(`❌ Failed: ${failed}`, "red");
	print(
		`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`,
		"yellow"
	);
	print("=".repeat(80) + "\n", "cyan");
}

runTests().catch((error) => {
	print(`\n💥 Fatal Error: ${error.message}`, "red");
	process.exit(1);
});
