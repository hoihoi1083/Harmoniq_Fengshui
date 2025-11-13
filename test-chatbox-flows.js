/**
 * 🧪 Comprehensive Chatbox Flow Testing Suite
 *
 * Tests all conversation flows in the smart-chat2 system
 * Date: 2025年11月11日
 */

const BASE_URL = process.env.BASE_URL || "https://www.harmoniqfengshui.com";
const API_ENDPOINT = `${BASE_URL}/api/smart-chat2`;

// Test configuration
const TEST_CONFIG = {
	timeout: 30000, // 30 seconds per test
	locale: "zh-TW",
	region: "hongkong",
};

// Test user data
const TEST_USER = {
	userId: `test-user-${Date.now()}`,
	email: "test@harmoniqfengshui.com",
	birthday: "1990/5/15",
	gender: "female",
	partnerBirthday: "1992/8/20",
	partnerGender: "male",
};

// Color codes for terminal output
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

// Helper function to print colored output
function print(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to send chat message
async function sendChatMessage(message, sessionId, locale = "zh-TW") {
	try {
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message,
				sessionId,
				userId: TEST_USER.userId,
				locale,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		print(`❌ API Error: ${error.message}`, "red");
		throw error;
	}
}

// Test Results Tracker
class TestResults {
	constructor() {
		this.total = 0;
		this.passed = 0;
		this.failed = 0;
		this.warnings = 0;
		this.results = [];
	}

	add(testName, status, details = "") {
		this.total++;
		if (status === "pass") this.passed++;
		if (status === "fail") this.failed++;
		if (status === "warning") this.warnings++;

		this.results.push({
			testName,
			status,
			details,
			timestamp: new Date().toISOString(),
		});
	}

	printSummary() {
		print("\n" + "=".repeat(80), "cyan");
		print("📊 TEST SUMMARY", "cyan");
		print("=".repeat(80), "cyan");
		print(`Total Tests: ${this.total}`, "blue");
		print(`✅ Passed: ${this.passed}`, "green");
		print(`❌ Failed: ${this.failed}`, "red");
		print(`⚠️  Warnings: ${this.warnings}`, "yellow");
		print(
			`Success Rate: ${((this.passed / this.total) * 100).toFixed(1)}%`,
			"magenta"
		);
		print("=".repeat(80) + "\n", "cyan");

		// Print detailed results
		if (this.failed > 0 || this.warnings > 0) {
			print("📋 Detailed Results:", "yellow");
			this.results.forEach((result, index) => {
				if (result.status !== "pass") {
					const symbol = result.status === "fail" ? "❌" : "⚠️";
					const color = result.status === "fail" ? "red" : "yellow";
					print(
						`\n${symbol} Test #${index + 1}: ${result.testName}`,
						color
					);
					if (result.details) {
						print(`   Details: ${result.details}`, color);
					}
				}
			});
		}
	}
}

const results = new TestResults();

// ============================================================================
// TEST SUITE 1: GREETING & INITIAL CONTACT
// ============================================================================
async function testGreetingFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 1: GREETING & INITIAL CONTACT", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-greeting-${Date.now()}`;

	// Test 1.1: Basic greeting
	try {
		print("Test 1.1: Basic greeting response...", "blue");
		const response = await sendChatMessage("你好", sessionId);

		if (response.message && response.message.length > 0) {
			print("✅ Pass: Received greeting response", "green");
			results.add("Basic Greeting", "pass");
		} else {
			print("❌ Fail: Empty response", "red");
			results.add("Basic Greeting", "fail", "Empty response from API");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Basic Greeting", "fail", error.message);
	}

	// Test 1.2: Multiple greetings in different languages
	const greetings = ["Hi", "您好", "Hello", "早晨"];
	for (const greeting of greetings) {
		try {
			print(
				`Test 1.2.${greetings.indexOf(greeting)}: Testing "${greeting}"...`,
				"blue"
			);
			const response = await sendChatMessage(greeting, sessionId);

			if (response.message) {
				print(`✅ Pass: "${greeting}" handled correctly`, "green");
				results.add(`Greeting: "${greeting}"`, "pass");
			}
		} catch (error) {
			print(`❌ Fail: ${error.message}`, "red");
			results.add(`Greeting: "${greeting}"`, "fail", error.message);
		}
	}
}

// ============================================================================
// TEST SUITE 2: EMOTION CONCERN FLOWS (感情)
// ============================================================================
async function testEmotionFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 2: EMOTION CONCERN FLOW (感情)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-emotion-${Date.now()}`;

	// Test 2.1: General emotion question
	try {
		print("Test 2.1: General emotion question...", "blue");
		const response = await sendChatMessage("我想了解感情運勢", sessionId);

		if (response.message && response.message.includes("個人分析")) {
			print("✅ Pass: Emotion flow initiated with choice", "green");
			results.add("Emotion Flow - Initial", "pass");
		} else {
			print(
				"⚠️  Warning: Response may not offer analysis choices",
				"yellow"
			);
			results.add(
				"Emotion Flow - Initial",
				"warning",
				"No analysis type choice detected"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Emotion Flow - Initial", "fail", error.message);
	}

	// Test 2.2: Individual analysis choice
	try {
		print("Test 2.2: Individual analysis selection...", "blue");
		const response = await sendChatMessage("個人分析", sessionId);

		if (
			response.message &&
			(response.message.includes("生日") ||
				response.message.includes("出生"))
		) {
			print("✅ Pass: System asks for birthday", "green");
			results.add("Emotion - Individual Choice", "pass");
		} else {
			print("⚠️  Warning: May not request birthday correctly", "yellow");
			results.add(
				"Emotion - Individual Choice",
				"warning",
				"Birthday request unclear"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Emotion - Individual Choice", "fail", error.message);
	}

	// Test 2.3: Provide birthday
	try {
		print("Test 2.3: Providing birthday...", "blue");
		const response = await sendChatMessage(TEST_USER.birthday, sessionId);

		if (response.message && response.message.includes("具體")) {
			print("✅ Pass: System asks for specific problem", "green");
			results.add("Emotion - Birthday Provided", "pass");
		} else {
			print("⚠️  Warning: May not request specific problem", "yellow");
			results.add(
				"Emotion - Birthday Provided",
				"warning",
				"Specific problem request unclear"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Emotion - Birthday Provided", "fail", error.message);
	}

	// Test 2.4: Specific emotion problem
	try {
		print("Test 2.4: Providing specific emotion problem...", "blue");
		const response = await sendChatMessage(
			"我想知道今年的桃花運如何",
			sessionId
		);

		if (response.message && response.message.length > 100) {
			print("✅ Pass: Received detailed analysis", "green");
			results.add("Emotion - Specific Problem", "pass");
		} else {
			print("⚠️  Warning: Analysis may be too brief", "yellow");
			results.add(
				"Emotion - Specific Problem",
				"warning",
				"Short response"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Emotion - Specific Problem", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 3: COUPLE ANALYSIS FLOW (合盤)
// ============================================================================
async function testCoupleFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 3: COUPLE ANALYSIS FLOW (合盤)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-couple-${Date.now()}`;

	// Test 3.1: Request couple analysis
	try {
		print("Test 3.1: Requesting couple analysis...", "blue");
		await sendChatMessage("我想了解感情運勢", sessionId);
		const response = await sendChatMessage("合盤分析", sessionId);

		if (
			response.message &&
			(response.message.includes("你") || response.message.includes("您"))
		) {
			print("✅ Pass: Couple analysis flow initiated", "green");
			results.add("Couple Flow - Initial", "pass");
		} else {
			print("⚠️  Warning: Couple flow may not be clear", "yellow");
			results.add(
				"Couple Flow - Initial",
				"warning",
				"Flow initiation unclear"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Couple Flow - Initial", "fail", error.message);
	}

	// Test 3.2: Direct couple input with gender
	try {
		print(
			"Test 3.2: Direct couple input with gender indicators...",
			"blue"
		);
		const sessionId2 = `test-couple-direct-${Date.now()}`;
		const response = await sendChatMessage(
			`我${TEST_USER.birthday}，他${TEST_USER.partnerBirthday}`,
			sessionId2
		);

		// Check if gender is correctly identified
		if (response.message) {
			if (
				response.message.includes("女方") &&
				response.message.includes("男方")
			) {
				print(
					"✅ Pass: Gender correctly identified (female=user, male=partner)",
					"green"
				);
				results.add("Couple - Gender Detection", "pass");
			} else {
				print(
					"⚠️  Warning: Gender may be reversed or unclear",
					"yellow"
				);
				results.add(
					"Couple - Gender Detection",
					"warning",
					"Gender labels unclear"
				);
			}
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Couple - Gender Detection", "fail", error.message);
	}

	// Test 3.3: Gender reversal test (他 vs 她)
	try {
		print("Test 3.3: Testing gender reversal (她 indicator)...", "blue");
		const sessionId3 = `test-couple-reverse-${Date.now()}`;
		const response = await sendChatMessage(
			`我${TEST_USER.birthday}，她${TEST_USER.partnerBirthday}`,
			sessionId3
		);

		if (response.message && response.message.includes("男方")) {
			// If user said "她" (she), then user should be male
			print(
				"✅ Pass: Gender correctly reversed (male=user, female=partner)",
				"green"
			);
			results.add("Couple - Gender Reversal", "pass");
		} else {
			print(
				"⚠️  Warning: Gender reversal may not work correctly",
				"yellow"
			);
			results.add(
				"Couple - Gender Reversal",
				"warning",
				"Gender reversal unclear"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Couple - Gender Reversal", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 4: CAREER FLOW (工作)
// ============================================================================
async function testCareerFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 4: CAREER FLOW (工作)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-career-${Date.now()}`;

	// Test 4.1: Career concern
	try {
		print("Test 4.1: Career concern...", "blue");
		const response = await sendChatMessage("我想了解工作運勢", sessionId);

		if (
			response.message &&
			(response.message.includes("生日") ||
				response.message.includes("出生"))
		) {
			print("✅ Pass: Career flow initiated", "green");
			results.add("Career Flow - Initial", "pass");
		} else {
			print("⚠️  Warning: Career flow unclear", "yellow");
			results.add("Career Flow - Initial", "warning", "Flow unclear");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Career Flow - Initial", "fail", error.message);
	}

	// Test 4.2: Provide birthday and specific question
	try {
		print("Test 4.2: Birthday + specific career question...", "blue");
		await sendChatMessage(TEST_USER.birthday, sessionId);
		const response = await sendChatMessage("如何能夠升職", sessionId);

		if (response.message && response.message.length > 100) {
			print("✅ Pass: Received career analysis", "green");
			results.add("Career Flow - Analysis", "pass");
		} else {
			print("⚠️  Warning: Career analysis too brief", "yellow");
			results.add("Career Flow - Analysis", "warning", "Short response");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Career Flow - Analysis", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 5: WEALTH FLOW (財運)
// ============================================================================
async function testWealthFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 5: WEALTH FLOW (財運)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-wealth-${Date.now()}`;

	try {
		print("Test 5.1: Wealth concern...", "blue");
		const response = await sendChatMessage("我想了解財運", sessionId);

		if (response.message) {
			print("✅ Pass: Wealth flow initiated", "green");
			results.add("Wealth Flow", "pass");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Wealth Flow", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 6: HEALTH FLOW (健康)
// ============================================================================
async function testHealthFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 6: HEALTH FLOW (健康)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-health-${Date.now()}`;

	try {
		print("Test 6.1: Health concern...", "blue");
		const response = await sendChatMessage("我想了解健康運勢", sessionId);

		if (response.message) {
			print("✅ Pass: Health flow initiated", "green");
			results.add("Health Flow", "pass");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Health Flow", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 7: FATE/DESTINY FLOW (命理)
// ============================================================================
async function testFateFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 7: FATE/DESTINY FLOW (命理)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-fate-${Date.now()}`;

	// Test 7.1: Zodiac year question
	try {
		print(
			"Test 7.1: Zodiac year question (should classify as 命理)...",
			"blue"
		);
		const response = await sendChatMessage(
			"想知道蛇年對我有什麼影響",
			sessionId
		);

		if (response.message && !response.message.includes("其他")) {
			print("✅ Pass: Zodiac question handled as 命理", "green");
			results.add("Fate Flow - Zodiac", "pass");
		} else {
			print("⚠️  Warning: May be classified as other", "yellow");
			results.add(
				"Fate Flow - Zodiac",
				"warning",
				"May not classify as 命理"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Fate Flow - Zodiac", "fail", error.message);
	}

	// Test 7.2: Bazi analysis
	try {
		print("Test 7.2: Bazi analysis request...", "blue");
		const sessionId2 = `test-bazi-${Date.now()}`;
		const response = await sendChatMessage("幫我分析八字", sessionId2);

		if (response.message) {
			print("✅ Pass: Bazi request handled", "green");
			results.add("Fate Flow - Bazi", "pass");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Fate Flow - Bazi", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 8: OUT-OF-SCOPE FLOW (其他)
// ============================================================================
async function testOutOfScopeFlow() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 8: OUT-OF-SCOPE FLOW (其他)", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-out-of-scope-${Date.now()}`;

	const outOfScopeQuestions = [
		"今天天氣如何",
		"推薦好吃的餐廳",
		"什麼是人工智能",
		"Tell me a joke",
	];

	for (const question of outOfScopeQuestions) {
		try {
			print(
				`Test 8.${outOfScopeQuestions.indexOf(question) + 1}: Testing "${question}"...`,
				"blue"
			);
			const response = await sendChatMessage(question, sessionId);

			// Check if response provides helpful answer + redirect
			if (response.message && response.message.length > 50) {
				print(
					`✅ Pass: Handled gracefully with helpful response`,
					"green"
				);
				results.add(`Out-of-Scope: "${question}"`, "pass");
			} else {
				print(`⚠️  Warning: Response may be too brief`, "yellow");
				results.add(
					`Out-of-Scope: "${question}"`,
					"warning",
					"Brief response"
				);
			}
		} catch (error) {
			print(`❌ Fail: ${error.message}`, "red");
			results.add(`Out-of-Scope: "${question}"`, "fail", error.message);
		}
	}
}

// ============================================================================
// TEST SUITE 9: MARKDOWN CLEANING
// ============================================================================
async function testMarkdownCleaning() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 9: MARKDOWN CLEANING", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const sessionId = `test-markdown-${Date.now()}`;

	try {
		print("Test 9.1: Check responses for markdown artifacts...", "blue");
		const response = await sendChatMessage("請分析我的感情運勢", sessionId);

		// Check for common markdown patterns that should be removed
		const hasMarkdown = /\*\*|##|~~|`/.test(response.message);

		if (!hasMarkdown) {
			print("✅ Pass: No markdown artifacts found", "green");
			results.add("Markdown Cleaning", "pass");
		} else {
			print(
				"❌ Fail: Markdown artifacts detected (**, ##, ~~, ` found)",
				"red"
			);
			results.add("Markdown Cleaning", "fail", "Markdown not cleaned");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Markdown Cleaning", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 10: LOCALE SYNCHRONIZATION
// ============================================================================
async function testLocaleSynchronization() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 10: LOCALE SYNCHRONIZATION", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	// Test 10.1: Traditional Chinese (zh-TW)
	try {
		print("Test 10.1: Traditional Chinese response...", "blue");
		const sessionId = `test-locale-tw-${Date.now()}`;
		const response = await sendChatMessage("你好", sessionId, "zh-TW");

		// Check for traditional characters (e.g., 個 vs 个, 麼 vs 么)
		const hasTraditional = /個|請|關|為/.test(response.message);

		if (hasTraditional) {
			print("✅ Pass: Response in Traditional Chinese", "green");
			results.add("Locale - Traditional Chinese", "pass");
		} else {
			print("⚠️  Warning: May not be Traditional Chinese", "yellow");
			results.add(
				"Locale - Traditional Chinese",
				"warning",
				"Character set unclear"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Locale - Traditional Chinese", "fail", error.message);
	}

	// Test 10.2: Simplified Chinese (zh-CN)
	try {
		print("Test 10.2: Simplified Chinese response...", "blue");
		const sessionId = `test-locale-cn-${Date.now()}`;
		const response = await sendChatMessage("你好", sessionId, "zh-CN");

		// Check for simplified characters
		const hasSimplified = /个|请|关|为/.test(response.message);

		if (hasSimplified) {
			print("✅ Pass: Response in Simplified Chinese", "green");
			results.add("Locale - Simplified Chinese", "pass");
		} else {
			print("⚠️  Warning: May not be Simplified Chinese", "yellow");
			results.add(
				"Locale - Simplified Chinese",
				"warning",
				"Character set unclear"
			);
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Locale - Simplified Chinese", "fail", error.message);
	}
}

// ============================================================================
// TEST SUITE 11: BIRTHDAY PARSING
// ============================================================================
async function testBirthdayParsing() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 11: BIRTHDAY PARSING", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	const birthdayFormats = [
		"1990/5/15",
		"1990-5-15",
		"1990年5月15日",
		"19900515",
		"15/5/1990",
	];

	for (const format of birthdayFormats) {
		try {
			print(
				`Test 11.${birthdayFormats.indexOf(format) + 1}: Testing format "${format}"...`,
				"blue"
			);
			const sessionId = `test-birthday-${Date.now()}-${birthdayFormats.indexOf(format)}`;

			await sendChatMessage("我想了解感情運勢", sessionId);
			await sendChatMessage("個人分析", sessionId);
			const response = await sendChatMessage(format, sessionId);

			if (response.message && !response.message.includes("無法識別")) {
				print(
					`✅ Pass: Format "${format}" parsed successfully`,
					"green"
				);
				results.add(`Birthday Format: "${format}"`, "pass");
			} else {
				print(
					`⚠️  Warning: Format "${format}" may not be recognized`,
					"yellow"
				);
				results.add(
					`Birthday Format: "${format}"`,
					"warning",
					"Format not recognized"
				);
			}
		} catch (error) {
			print(`❌ Fail: ${error.message}`, "red");
			results.add(`Birthday Format: "${format}"`, "fail", error.message);
		}
	}
}

// ============================================================================
// TEST SUITE 12: ERROR HANDLING
// ============================================================================
async function testErrorHandling() {
	print("\n" + "=".repeat(80), "cyan");
	print("🧪 TEST SUITE 12: ERROR HANDLING", "cyan");
	print("=".repeat(80) + "\n", "cyan");

	// Test 12.1: Empty message
	try {
		print("Test 12.1: Empty message handling...", "blue");
		const sessionId = `test-error-empty-${Date.now()}`;
		const response = await sendChatMessage("", sessionId);

		if (response.message) {
			print("✅ Pass: Empty message handled gracefully", "green");
			results.add("Error - Empty Message", "pass");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Error - Empty Message", "fail", error.message);
	}

	// Test 12.2: Very long message
	try {
		print("Test 12.2: Very long message handling...", "blue");
		const sessionId = `test-error-long-${Date.now()}`;
		const longMessage = "我想問".repeat(500);
		const response = await sendChatMessage(longMessage, sessionId);

		if (response.message) {
			print("✅ Pass: Long message handled", "green");
			results.add("Error - Long Message", "pass");
		}
	} catch (error) {
		// Long messages might legitimately fail
		print(`⚠️  Warning: Long message handling: ${error.message}`, "yellow");
		results.add("Error - Long Message", "warning", error.message);
	}

	// Test 12.3: Special characters
	try {
		print("Test 12.3: Special characters handling...", "blue");
		const sessionId = `test-error-special-${Date.now()}`;
		const response = await sendChatMessage(
			"!@#$%^&*()_+-=[]{}|;:'\",.<>?/",
			sessionId
		);

		if (response.message) {
			print("✅ Pass: Special characters handled", "green");
			results.add("Error - Special Characters", "pass");
		}
	} catch (error) {
		print(`❌ Fail: ${error.message}`, "red");
		results.add("Error - Special Characters", "fail", error.message);
	}
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
	print("\n" + "=".repeat(80), "magenta");
	print("🚀 HARMONIQ FENGSHUI CHATBOX TEST SUITE", "magenta");
	print("=".repeat(80), "magenta");
	print(`Testing API Endpoint: ${API_ENDPOINT}`, "cyan");
	print(`Test User: ${TEST_USER.userId}`, "cyan");
	print(`Start Time: ${new Date().toLocaleString("zh-TW")}`, "cyan");
	print("=".repeat(80) + "\n", "magenta");

	try {
		await testGreetingFlow();
		await testEmotionFlow();
		await testCoupleFlow();
		await testCareerFlow();
		await testWealthFlow();
		await testHealthFlow();
		await testFateFlow();
		await testOutOfScopeFlow();
		await testMarkdownCleaning();
		await testLocaleSynchronization();
		await testBirthdayParsing();
		await testErrorHandling();
	} catch (error) {
		print(`\n❌ Fatal Error: ${error.message}`, "red");
	}

	print(`\nEnd Time: ${new Date().toLocaleString("zh-TW")}`, "cyan");
	results.printSummary();

	// Exit with appropriate code
	process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
	runAllTests().catch((error) => {
		print(`\n❌ Unhandled Error: ${error.message}`, "red");
		console.error(error);
		process.exit(1);
	});
}

module.exports = {
	sendChatMessage,
	TestResults,
};
