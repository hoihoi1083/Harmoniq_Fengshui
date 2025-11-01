/**
 * 🎂 Birthday Memorization Feature - Complete Test Suite
 *
 * This script tests:
 * 1. Saving birthday to database with birthdayConfirmed flag
 * 2. Detecting saved birthday and showing confirmation message
 * 3. Handling user response "1" (use saved birthday)
 * 4. Handling user response "2" (enter new birthday)
 * 5. Saving new birthday and passing to analysis
 */

import mongoose from "mongoose";

// Color codes for better readability
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

const log = {
	title: (msg) =>
		console.log(
			`\n${colors.bright}${colors.cyan}${"=".repeat(80)}${colors.reset}`
		),
	section: (msg) =>
		console.log(`\n${colors.bright}${colors.blue}📋 ${msg}${colors.reset}`),
	test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`),
	success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
	error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
	info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
	data: (label, data) =>
		console.log(`${colors.blue}📊 ${label}:${colors.reset}`, data),
};

// Test configuration
const TEST_CONFIG = {
	userEmail: "test-birthday-memorization@test.com",
	userId: "test-birthday-user-123",
	sessionId1: "test-session-first-time",
	sessionId2: "test-session-second-time",
	sessionId3: "test-session-new-birthday",
	firstBirthday: "1999-03-15",
	newBirthday: "2000-05-20",
	locale: "zh-TW",
};

// MongoDB Connection
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/your-database";

let SmartUserIntent;

async function connectDB() {
	try {
		await mongoose.connect(MONGODB_URI);
		log.success("Connected to MongoDB");

		// Import the model
		const { default: SmartUserIntentModel } = await import(
			"./src/models/SmartUserIntent.js"
		);
		SmartUserIntent = SmartUserIntentModel;

		return true;
	} catch (error) {
		log.error(`Database connection failed: ${error.message}`);
		return false;
	}
}

async function disconnectDB() {
	await mongoose.disconnect();
	log.info("Disconnected from MongoDB");
}

// Helper function to simulate API call
async function simulateAPICall(endpoint, payload) {
	log.info(`Simulating API call to ${endpoint}`);
	log.data("Payload", payload);

	const response = await fetch(`http://localhost:3000${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json();
	log.data("Response Status", response.status);

	return { status: response.status, data };
}

// Test 1: First time user - Save birthday
async function test1_SaveBirthdayFirstTime() {
	log.title();
	log.section("TEST 1: First Time User - Save Birthday to Database");
	log.title();

	try {
		// Clean up test data
		log.test("Cleaning up any existing test data...");
		await SmartUserIntent.deleteMany({
			$or: [
				{ userEmail: TEST_CONFIG.userEmail },
				{ userId: TEST_CONFIG.userId },
			],
		});
		log.success("Test data cleaned");

		// Step 1: User asks a question
		log.test('Step 1: User asks "我想測財運"');
		let response = await simulateAPICall("/api/smart-chat2", {
			message: "我想測財運",
			sessionId: TEST_CONFIG.sessionId1,
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"AI Response Preview",
			response.data.response?.substring(0, 100) + "..."
		);

		// Check if it asks for birthday
		if (
			response.data.response?.includes("生日") ||
			response.data.response?.includes("出生")
		) {
			log.success("System correctly asks for birthday");
		} else {
			log.error("System did not ask for birthday");
		}

		// Step 2: User provides birthday
		log.test(
			`Step 2: User provides birthday "${TEST_CONFIG.firstBirthday}"`
		);
		response = await simulateAPICall("/api/smart-chat2", {
			message: TEST_CONFIG.firstBirthday,
			sessionId: TEST_CONFIG.sessionId1,
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"Analysis Response Preview",
			response.data.response?.substring(0, 100) + "..."
		);

		// Step 3: Verify birthday was saved in database
		log.test("Step 3: Verifying birthday was saved to database...");
		const savedIntent = await SmartUserIntent.findOne({
			userEmail: TEST_CONFIG.userEmail,
			sessionId: TEST_CONFIG.sessionId1,
		}).sort({ updatedAt: -1 });

		if (!savedIntent) {
			log.error("No UserIntent found in database");
			return false;
		}

		log.data("Saved UserIntent", {
			userBirthday: savedIntent.userBirthday,
			birthdayConfirmed: savedIntent.birthdayConfirmed,
			primaryConcern: savedIntent.primaryConcern,
			conversationState: savedIntent.conversationState,
		});

		// Verify birthday
		if (savedIntent.userBirthday) {
			const savedDate = new Date(savedIntent.userBirthday)
				.toISOString()
				.split("T")[0];
			if (savedDate === TEST_CONFIG.firstBirthday) {
				log.success(`✅ Birthday correctly saved: ${savedDate}`);
			} else {
				log.error(
					`Birthday mismatch: Expected ${TEST_CONFIG.firstBirthday}, Got ${savedDate}`
				);
				return false;
			}
		} else {
			log.error("Birthday not saved to database");
			return false;
		}

		// Verify birthdayConfirmed flag
		if (savedIntent.birthdayConfirmed === true) {
			log.success("✅ birthdayConfirmed flag is set to true");
		} else {
			log.error(
				`birthdayConfirmed is ${savedIntent.birthdayConfirmed}, expected true`
			);
			return false;
		}

		log.success(
			"TEST 1 PASSED: Birthday saved successfully with confirmation flag ✅"
		);
		return true;
	} catch (error) {
		log.error(`TEST 1 FAILED: ${error.message}`);
		console.error(error);
		return false;
	}
}

// Test 2: Returning user - Detect saved birthday and show confirmation
async function test2_DetectSavedBirthday() {
	log.title();
	log.section(
		"TEST 2: Returning User - Detect Saved Birthday & Show Confirmation"
	);
	log.title();

	try {
		// Step 1: User switches to a different topic
		log.test('Step 1: User asks "我想測工作" (different topic)');
		const response = await simulateAPICall("/api/smart-chat2", {
			message: "我想測工作",
			sessionId: TEST_CONFIG.sessionId2, // New session
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"System Response Preview",
			response.data.response?.substring(0, 200) + "..."
		);

		// Step 2: Check if system shows saved birthday confirmation
		const responseText = response.data.response || "";

		const checks = [
			{
				condition:
					responseText.includes("1999") &&
					responseText.includes("3") &&
					responseText.includes("15"),
				message: "Shows saved birthday date (1999-03-15)",
			},
			{
				condition:
					responseText.includes("1️⃣") || responseText.includes("1"),
				message: "Shows option 1 (use saved birthday)",
			},
			{
				condition:
					responseText.includes("2️⃣") || responseText.includes("2"),
				message: "Shows option 2 (enter new birthday)",
			},
			{
				condition:
					responseText.includes("發現") ||
					responseText.includes("之前") ||
					responseText.includes("提供過"),
				message: "Mentions previously provided birthday",
			},
		];

		let allChecksPassed = true;
		checks.forEach((check) => {
			if (check.condition) {
				log.success(`✅ ${check.message}`);
			} else {
				log.error(`❌ ${check.message}`);
				allChecksPassed = false;
			}
		});

		// Step 3: Verify conversationState is birthday_collection
		const userIntent = await SmartUserIntent.findOne({
			userEmail: TEST_CONFIG.userEmail,
			sessionId: TEST_CONFIG.sessionId2,
		}).sort({ updatedAt: -1 });

		if (userIntent) {
			log.data("ConversationState", userIntent.conversationState);
			if (userIntent.conversationState === "birthday_collection") {
				log.success(
					"✅ ConversationState is correctly set to birthday_collection"
				);
			} else {
				log.error(
					`ConversationState is ${userIntent.conversationState}, expected birthday_collection`
				);
				allChecksPassed = false;
			}
		}

		if (allChecksPassed) {
			log.success(
				"TEST 2 PASSED: Saved birthday detected and confirmation shown ✅"
			);
			return true;
		} else {
			log.error("TEST 2 FAILED: Some checks did not pass");
			return false;
		}
	} catch (error) {
		log.error(`TEST 2 FAILED: ${error.message}`);
		console.error(error);
		return false;
	}
}

// Test 3: User chooses "1" (use saved birthday)
async function test3_UseSavedBirthday() {
	log.title();
	log.section('TEST 3: User Chooses "1" - Use Saved Birthday');
	log.title();

	try {
		// Step 1: User responds with "1"
		log.test('Step 1: User responds with "1"');
		const response = await simulateAPICall("/api/smart-chat2", {
			message: "1",
			sessionId: TEST_CONFIG.sessionId2,
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"Analysis Response Preview",
			response.data.response?.substring(0, 200) + "..."
		);

		// Step 2: Check if analysis was generated
		const responseText = response.data.response || "";
		const analysisData = response.data.analysis || {};

		const checks = [
			{
				condition: responseText.length > 100,
				message: "Generated analysis (response length > 100 chars)",
			},
			{
				condition:
					responseText.includes("工作") ||
					responseText.includes("事業"),
				message: "Analysis is about work/career topic",
			},
			{
				condition:
					analysisData.detectedTopic === "工作" ||
					analysisData.detectedTopic === "事業",
				message: `Detected topic is work (got: ${analysisData.detectedTopic})`,
			},
			{
				condition:
					analysisData.birthdayProvided === true ||
					analysisData.isWithinScope === true,
				message: "Analysis metadata indicates birthday was used",
			},
		];

		let allChecksPassed = true;
		checks.forEach((check) => {
			if (check.condition) {
				log.success(`✅ ${check.message}`);
			} else {
				log.error(`❌ ${check.message}`);
				allChecksPassed = false;
			}
		});

		// Step 3: Verify conversationState changed to asking_detailed_report
		const userIntent = await SmartUserIntent.findOne({
			userEmail: TEST_CONFIG.userEmail,
			sessionId: TEST_CONFIG.sessionId2,
		}).sort({ updatedAt: -1 });

		if (userIntent) {
			log.data("ConversationState", userIntent.conversationState);
			if (userIntent.conversationState === "asking_detailed_report") {
				log.success(
					"✅ ConversationState updated to asking_detailed_report"
				);
			} else {
				log.error(
					`ConversationState is ${userIntent.conversationState}, expected asking_detailed_report`
				);
				allChecksPassed = false;
			}

			// Verify birthday is still the original one
			const savedDate = new Date(userIntent.userBirthday)
				.toISOString()
				.split("T")[0];
			if (savedDate === TEST_CONFIG.firstBirthday) {
				log.success(`✅ Birthday remains unchanged: ${savedDate}`);
			} else {
				log.error(`Birthday changed unexpectedly: ${savedDate}`);
				allChecksPassed = false;
			}
		}

		if (allChecksPassed) {
			log.success(
				"TEST 3 PASSED: Saved birthday used successfully for analysis ✅"
			);
			return true;
		} else {
			log.error("TEST 3 FAILED: Some checks did not pass");
			return false;
		}
	} catch (error) {
		log.error(`TEST 3 FAILED: ${error.message}`);
		console.error(error);
		return false;
	}
}

// Test 4: User chooses "2" (enter new birthday) - Part A: Request new birthday
async function test4a_RequestNewBirthday() {
	log.title();
	log.section('TEST 4A: User Chooses "2" - Request New Birthday');
	log.title();

	try {
		// Setup: Ask a new question to trigger birthday confirmation again
		log.test('Setup: User asks "我想測健康"');
		await simulateAPICall("/api/smart-chat2", {
			message: "我想測健康",
			sessionId: TEST_CONFIG.sessionId3,
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		// Step 1: User responds with "2"
		log.test('Step 1: User responds with "2" (enter new birthday)');
		const response = await simulateAPICall("/api/smart-chat2", {
			message: "2",
			sessionId: TEST_CONFIG.sessionId3,
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"System Response Preview",
			response.data.response?.substring(0, 200) + "..."
		);

		// Step 2: Check if system asks for new birthday
		const responseText = response.data.response || "";

		const checks = [
			{
				condition:
					responseText.includes("生日") ||
					responseText.includes("出生"),
				message: "Asks for birthday",
			},
			{
				condition:
					responseText.includes("新") ||
					responseText.includes("其他"),
				message: 'Mentions "new" or "other" birthday',
			},
			{
				condition:
					responseText.includes("格式") ||
					responseText.includes("範例") ||
					responseText.includes("例如"),
				message: "Shows birthday format examples",
			},
		];

		let allChecksPassed = true;
		checks.forEach((check) => {
			if (check.condition) {
				log.success(`✅ ${check.message}`);
			} else {
				log.error(`❌ ${check.message}`);
				allChecksPassed = false;
			}
		});

		// Step 3: Verify conversationState remains birthday_collection
		const userIntent = await SmartUserIntent.findOne({
			userEmail: TEST_CONFIG.userEmail,
			sessionId: TEST_CONFIG.sessionId3,
		}).sort({ updatedAt: -1 });

		if (userIntent) {
			log.data("ConversationState", userIntent.conversationState);
			if (userIntent.conversationState === "birthday_collection") {
				log.success("✅ ConversationState remains birthday_collection");
			} else {
				log.error(
					`ConversationState is ${userIntent.conversationState}, expected birthday_collection`
				);
				allChecksPassed = false;
			}
		}

		if (allChecksPassed) {
			log.success(
				"TEST 4A PASSED: System correctly asks for new birthday ✅"
			);
			return true;
		} else {
			log.error("TEST 4A FAILED: Some checks did not pass");
			return false;
		}
	} catch (error) {
		log.error(`TEST 4A FAILED: ${error.message}`);
		console.error(error);
		return false;
	}
}

// Test 4: User chooses "2" (enter new birthday) - Part B: Save new birthday
async function test4b_SaveNewBirthday() {
	log.title();
	log.section("TEST 4B: Save New Birthday & Generate Analysis");
	log.title();

	try {
		// Step 1: User provides new birthday
		log.test(
			`Step 1: User provides new birthday "${TEST_CONFIG.newBirthday}"`
		);
		const response = await simulateAPICall("/api/smart-chat2", {
			message: TEST_CONFIG.newBirthday,
			sessionId: TEST_CONFIG.sessionId3,
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"Analysis Response Preview",
			response.data.response?.substring(0, 200) + "..."
		);

		// Step 2: Check if analysis was generated
		const responseText = response.data.response || "";
		const analysisData = response.data.analysis || {};

		const checks = [
			{
				condition: responseText.length > 100,
				message: "Generated analysis (response length > 100 chars)",
			},
			{
				condition: responseText.includes("健康"),
				message: "Analysis is about health topic",
			},
			{
				condition: analysisData.detectedTopic === "健康",
				message: `Detected topic is health (got: ${analysisData.detectedTopic})`,
			},
		];

		let allChecksPassed = true;
		checks.forEach((check) => {
			if (check.condition) {
				log.success(`✅ ${check.message}`);
			} else {
				log.error(`❌ ${check.message}`);
				allChecksPassed = false;
			}
		});

		// Step 3: Verify new birthday was saved in database
		log.test("Step 3: Verifying new birthday was saved to database...");
		const userIntent = await SmartUserIntent.findOne({
			userEmail: TEST_CONFIG.userEmail,
			sessionId: TEST_CONFIG.sessionId3,
		}).sort({ updatedAt: -1 });

		if (userIntent) {
			const savedDate = new Date(userIntent.userBirthday)
				.toISOString()
				.split("T")[0];
			log.data("Saved Birthday", savedDate);
			log.data("Birthday Confirmed", userIntent.birthdayConfirmed);

			if (savedDate === TEST_CONFIG.newBirthday) {
				log.success(`✅ New birthday correctly saved: ${savedDate}`);
			} else {
				log.error(
					`Birthday mismatch: Expected ${TEST_CONFIG.newBirthday}, Got ${savedDate}`
				);
				allChecksPassed = false;
			}

			if (userIntent.birthdayConfirmed === true) {
				log.success("✅ birthdayConfirmed flag is set to true");
			} else {
				log.error(
					`birthdayConfirmed is ${userIntent.birthdayConfirmed}, expected true`
				);
				allChecksPassed = false;
			}

			if (userIntent.conversationState === "asking_detailed_report") {
				log.success(
					"✅ ConversationState updated to asking_detailed_report"
				);
			} else {
				log.error(
					`ConversationState is ${userIntent.conversationState}, expected asking_detailed_report`
				);
				allChecksPassed = false;
			}
		} else {
			log.error("UserIntent not found in database");
			allChecksPassed = false;
		}

		if (allChecksPassed) {
			log.success(
				"TEST 4B PASSED: New birthday saved and analysis generated ✅"
			);
			return true;
		} else {
			log.error("TEST 4B FAILED: Some checks did not pass");
			return false;
		}
	} catch (error) {
		log.error(`TEST 4B FAILED: ${error.message}`);
		console.error(error);
		return false;
	}
}

// Test 5: Verify new birthday is used in subsequent sessions
async function test5_VerifyNewBirthdayPersisted() {
	log.title();
	log.section("TEST 5: Verify New Birthday is Used in Next Session");
	log.title();

	try {
		// Step 1: Start a new session and ask a question
		log.test('Step 1: User asks "我想測學業" in new session');
		const response = await simulateAPICall("/api/smart-chat2", {
			message: "我想測學業",
			sessionId: "test-session-verify-new-birthday",
			userId: TEST_CONFIG.userId,
			userEmail: TEST_CONFIG.userEmail,
			locale: TEST_CONFIG.locale,
		});

		log.data(
			"System Response Preview",
			response.data.response?.substring(0, 200) + "..."
		);

		// Step 2: Check if system shows the NEW birthday (2000-05-20)
		const responseText = response.data.response || "";

		const checks = [
			{
				condition:
					responseText.includes("2000") &&
					responseText.includes("5") &&
					responseText.includes("20"),
				message: "Shows new birthday date (2000-05-20)",
			},
			{
				condition: !responseText.includes("1999"),
				message: "Does NOT show old birthday (1999-03-15)",
			},
			{
				condition:
					responseText.includes("1️⃣") || responseText.includes("1"),
				message: "Shows option 1 (use saved birthday)",
			},
			{
				condition:
					responseText.includes("2️⃣") || responseText.includes("2"),
				message: "Shows option 2 (enter new birthday)",
			},
		];

		let allChecksPassed = true;
		checks.forEach((check) => {
			if (check.condition) {
				log.success(`✅ ${check.message}`);
			} else {
				log.error(`❌ ${check.message}`);
				allChecksPassed = false;
			}
		});

		if (allChecksPassed) {
			log.success("TEST 5 PASSED: New birthday persisted correctly ✅");
			return true;
		} else {
			log.error("TEST 5 FAILED: Some checks did not pass");
			return false;
		}
	} catch (error) {
		log.error(`TEST 5 FAILED: ${error.message}`);
		console.error(error);
		return false;
	}
}

// Cleanup function
async function cleanup() {
	log.section("Cleanup: Removing test data...");
	try {
		await SmartUserIntent.deleteMany({
			$or: [
				{ userEmail: TEST_CONFIG.userEmail },
				{ userId: TEST_CONFIG.userId },
			],
		});
		log.success("Test data removed successfully");
	} catch (error) {
		log.error(`Cleanup failed: ${error.message}`);
	}
}

// Main test runner
async function runAllTests() {
	console.log("\n");
	log.title();
	console.log(
		`${colors.bright}${colors.cyan}🎂 BIRTHDAY MEMORIZATION FEATURE - COMPLETE TEST SUITE${colors.reset}`
	);
	log.title();
	console.log(
		`${colors.blue}Test User: ${TEST_CONFIG.userEmail}${colors.reset}`
	);
	console.log(
		`${colors.blue}First Birthday: ${TEST_CONFIG.firstBirthday}${colors.reset}`
	);
	console.log(
		`${colors.blue}New Birthday: ${TEST_CONFIG.newBirthday}${colors.reset}`
	);
	console.log("\n");

	const connected = await connectDB();
	if (!connected) {
		log.error("Failed to connect to database. Exiting...");
		process.exit(1);
	}

	const results = {
		test1: false,
		test2: false,
		test3: false,
		test4a: false,
		test4b: false,
		test5: false,
	};

	try {
		// Run tests sequentially
		results.test1 = await test1_SaveBirthdayFirstTime();

		if (results.test1) {
			results.test2 = await test2_DetectSavedBirthday();
		} else {
			log.error("Skipping Test 2 due to Test 1 failure");
		}

		if (results.test2) {
			results.test3 = await test3_UseSavedBirthday();
		} else {
			log.error("Skipping Test 3 due to Test 2 failure");
		}

		if (results.test1) {
			results.test4a = await test4a_RequestNewBirthday();

			if (results.test4a) {
				results.test4b = await test4b_SaveNewBirthday();
			} else {
				log.error("Skipping Test 4B due to Test 4A failure");
			}
		} else {
			log.error("Skipping Test 4A and 4B due to Test 1 failure");
		}

		if (results.test4b) {
			results.test5 = await test5_VerifyNewBirthdayPersisted();
		} else {
			log.error("Skipping Test 5 due to Test 4B failure");
		}
	} catch (error) {
		log.error(`Test execution error: ${error.message}`);
		console.error(error);
	}

	// Print summary
	log.title();
	log.section("TEST SUMMARY");
	log.title();

	const tests = [
		{ name: "TEST 1: Save Birthday First Time", result: results.test1 },
		{ name: "TEST 2: Detect Saved Birthday", result: results.test2 },
		{ name: "TEST 3: Use Saved Birthday", result: results.test3 },
		{ name: "TEST 4A: Request New Birthday", result: results.test4a },
		{ name: "TEST 4B: Save New Birthday", result: results.test4b },
		{
			name: "TEST 5: Verify New Birthday Persisted",
			result: results.test5,
		},
	];

	let passedCount = 0;
	tests.forEach((test) => {
		if (test.result) {
			log.success(`${test.name}`);
			passedCount++;
		} else {
			log.error(`${test.name}`);
		}
	});

	console.log("\n");
	const allPassed = passedCount === tests.length;
	if (allPassed) {
		console.log(
			`${colors.bright}${colors.green}🎉 ALL TESTS PASSED! (${passedCount}/${tests.length})${colors.reset}`
		);
	} else {
		console.log(
			`${colors.bright}${colors.red}⚠️  SOME TESTS FAILED (${passedCount}/${tests.length} passed)${colors.reset}`
		);
	}
	console.log("\n");

	// Cleanup
	await cleanup();

	await disconnectDB();

	process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
