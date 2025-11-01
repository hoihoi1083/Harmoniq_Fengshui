/**
 * 🎂 Birthday Memorization - Database-Only Test
 *
 * This test directly verifies database operations without requiring the server to run.
 * Tests:
 * 1. Saving birthday with birthdayConfirmed flag
 * 2. Querying for saved birthday
 * 3. Updating birthday to a new value
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Colors
const c = {
	reset: "\x1b[0m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	bold: "\x1b[1m",
};

const log = {
	test: (msg) => console.log(`\n${c.yellow}🧪 ${msg}${c.reset}`),
	pass: (msg) => console.log(`${c.green}✅ ${msg}${c.reset}`),
	fail: (msg) => console.log(`${c.red}❌ ${msg}${c.reset}`),
	info: (msg) => console.log(`${c.cyan}ℹ️  ${msg}${c.reset}`),
	data: (label, val) => console.log(`${c.blue}📊 ${label}:${c.reset}`, val),
};

// Test data
const TEST_USER = {
	userEmail: "birthday-test@example.com",
	userId: "test-user-123",
	sessionId: "test-session-001",
	firstBirthday: new Date("1999-03-15"),
	newBirthday: new Date("2000-05-20"),
};

let SmartUserIntent;

async function connectDB() {
	try {
		const MONGODB_URI = process.env.MONGODB_URI;
		if (!MONGODB_URI) {
			throw new Error("MONGODB_URI not found in environment variables");
		}

		await mongoose.connect(MONGODB_URI);
		log.pass("Connected to MongoDB");

		// Dynamically import model
		const modelModule = await import("./src/models/SmartUserIntent.js");
		SmartUserIntent = modelModule.default;

		return true;
	} catch (error) {
		log.fail(`Database connection failed: ${error.message}`);
		return false;
	}
}

async function test1_SaveBirthday() {
	log.test("TEST 1: Save birthday with birthdayConfirmed = true");

	try {
		// Clean up
		await SmartUserIntent.deleteMany({
			userEmail: TEST_USER.userEmail,
		});

		// Create new intent with birthday
		const newIntent = await SmartUserIntent.create({
			sessionId: TEST_USER.sessionId,
			userId: TEST_USER.userId,
			userEmail: TEST_USER.userEmail,
			primaryConcern: "財運",
			specificQuestion: "我想測財運",
			userBirthday: TEST_USER.firstBirthday,
			birthdayConfirmed: true,
			conversationState: "asking_detailed_report",
			conversationActive: true,
		});

		log.data("Created UserIntent ID", newIntent._id);
		log.data("Birthday", newIntent.userBirthday);
		log.data("Birthday Confirmed", newIntent.birthdayConfirmed);

		if (newIntent.userBirthday && newIntent.birthdayConfirmed === true) {
			log.pass("Birthday saved with confirmation flag ✅");
			return true;
		} else {
			log.fail("Birthday or confirmation flag not set correctly");
			return false;
		}
	} catch (error) {
		log.fail(`Test 1 failed: ${error.message}`);
		return false;
	}
}

async function test2_QuerySavedBirthday() {
	log.test("TEST 2: Query for saved birthday (as system would do)");

	try {
		// Query using the helper function logic
		const existingBirthday = await SmartUserIntent.findOne({
			$or: [
				{ userEmail: TEST_USER.userEmail },
				{ userId: TEST_USER.userId },
			],
			userBirthday: { $exists: true, $ne: null },
			birthdayConfirmed: true,
		}).sort({ updatedAt: -1 });

		if (!existingBirthday) {
			log.fail("No saved birthday found");
			return false;
		}

		log.data("Found Birthday", existingBirthday.userBirthday);
		log.data("Birthday Confirmed", existingBirthday.birthdayConfirmed);
		log.data("Primary Concern", existingBirthday.primaryConcern);

		const savedDate = new Date(existingBirthday.userBirthday);
		const expectedDate = TEST_USER.firstBirthday;

		if (
			savedDate.toISOString().split("T")[0] ===
			expectedDate.toISOString().split("T")[0]
		) {
			log.pass("Correct birthday retrieved ✅");
			return true;
		} else {
			log.fail(
				`Birthday mismatch: Expected ${expectedDate}, Got ${savedDate}`
			);
			return false;
		}
	} catch (error) {
		log.fail(`Test 2 failed: ${error.message}`);
		return false;
	}
}

async function test3_UpdateToNewBirthday() {
	log.test('TEST 3: Update to new birthday when user chooses option "2"');

	try {
		// Simulate creating a new session with new topic
		const newSession = await SmartUserIntent.create({
			sessionId: "test-session-002",
			userId: TEST_USER.userId,
			userEmail: TEST_USER.userEmail,
			primaryConcern: "健康",
			specificQuestion: "我想測健康",
			conversationState: "birthday_collection",
			conversationActive: true,
		});

		log.info("Created new session for health topic");

		// User chooses to enter new birthday - update the intent
		newSession.userBirthday = TEST_USER.newBirthday;
		newSession.birthdayConfirmed = true;
		newSession.conversationState = "asking_detailed_report";
		await newSession.save();

		log.data("Updated Birthday", newSession.userBirthday);
		log.data("Birthday Confirmed", newSession.birthdayConfirmed);

		// Verify by querying again (should get the new birthday)
		const latestBirthday = await SmartUserIntent.findOne({
			$or: [
				{ userEmail: TEST_USER.userEmail },
				{ userId: TEST_USER.userId },
			],
			userBirthday: { $exists: true, $ne: null },
			birthdayConfirmed: true,
		}).sort({ updatedAt: -1 });

		const latestDate = new Date(latestBirthday.userBirthday);
		const expectedDate = TEST_USER.newBirthday;

		if (
			latestDate.toISOString().split("T")[0] ===
			expectedDate.toISOString().split("T")[0]
		) {
			log.pass("New birthday saved and retrieved correctly ✅");
			return true;
		} else {
			log.fail(
				`Birthday mismatch: Expected ${expectedDate}, Got ${latestDate}`
			);
			return false;
		}
	} catch (error) {
		log.fail(`Test 3 failed: ${error.message}`);
		return false;
	}
}

async function test4_VerifyBirthdayInChoice1Flow() {
	log.test('TEST 4: Verify birthday is used when user chooses option "1"');

	try {
		// Get the saved birthday (simulating what happens when user chooses "1")
		const savedIntent = await SmartUserIntent.findOne({
			$or: [
				{ userEmail: TEST_USER.userEmail },
				{ userId: TEST_USER.userId },
			],
			userBirthday: { $exists: true, $ne: null },
			birthdayConfirmed: true,
		}).sort({ updatedAt: -1 });

		if (!savedIntent) {
			log.fail("No saved birthday found");
			return false;
		}

		log.info('Simulating: User chose "1" to use saved birthday');

		// Create a new session that would use this birthday
		const analysisSession = await SmartUserIntent.create({
			sessionId: "test-session-003",
			userId: TEST_USER.userId,
			userEmail: TEST_USER.userEmail,
			primaryConcern: "工作",
			specificQuestion: "我想測工作",
			userBirthday: savedIntent.userBirthday, // Use the saved birthday
			birthdayConfirmed: true,
			conversationState: "asking_detailed_report",
			conversationActive: true,
		});

		log.data("Analysis uses birthday", analysisSession.userBirthday);
		log.data("Primary Concern", analysisSession.primaryConcern);

		// Verify the birthday matches
		const usedDate = new Date(analysisSession.userBirthday);
		const savedDate = new Date(savedIntent.userBirthday);

		if (usedDate.toISOString() === savedDate.toISOString()) {
			log.pass("Saved birthday correctly passed to analysis ✅");
			return true;
		} else {
			log.fail("Birthday mismatch in analysis flow");
			return false;
		}
	} catch (error) {
		log.fail(`Test 4 failed: ${error.message}`);
		return false;
	}
}

async function test5_CheckBirthdayConfirmedQuery() {
	log.test("TEST 5: Verify birthdayConfirmed filter works correctly");

	try {
		// Create an entry WITHOUT birthdayConfirmed (or false)
		const unconfirmedEntry = await SmartUserIntent.create({
			sessionId: "test-session-unconfirmed",
			userId: TEST_USER.userId,
			userEmail: TEST_USER.userEmail,
			primaryConcern: "健康", // Use valid enum value
			userBirthday: new Date("1998-01-01"),
			birthdayConfirmed: false, // Not confirmed
			conversationActive: true,
		});

		log.info("Created unconfirmed birthday entry");

		// Query WITH birthdayConfirmed: true filter
		const confirmedOnly = await SmartUserIntent.find({
			userEmail: TEST_USER.userEmail,
			userBirthday: { $exists: true, $ne: null },
			birthdayConfirmed: true,
		}).sort({ updatedAt: -1 });

		log.data("Confirmed birthdays found", confirmedOnly.length);

		// Should not include the unconfirmed entry
		const hasUnconfirmed = confirmedOnly.some(
			(entry) => entry.sessionId === "test-session-unconfirmed"
		);

		if (!hasUnconfirmed) {
			log.pass(
				"birthdayConfirmed filter works correctly - excludes unconfirmed ✅"
			);
			return true;
		} else {
			log.fail(
				"birthdayConfirmed filter failed - included unconfirmed entry"
			);
			return false;
		}
	} catch (error) {
		log.fail(`Test 5 failed: ${error.message}`);
		return false;
	}
}

async function cleanup() {
	log.info("Cleaning up test data...");
	await SmartUserIntent.deleteMany({
		userEmail: TEST_USER.userEmail,
	});
	log.pass("Test data removed");
}

async function runTests() {
	console.log(`\n${c.bold}${c.cyan}${"=".repeat(80)}${c.reset}`);
	console.log(
		`${c.bold}${c.cyan}🎂 Birthday Memorization - Database Tests${c.reset}`
	);
	console.log(`${c.bold}${c.cyan}${"=".repeat(80)}${c.reset}\n`);

	const connected = await connectDB();
	if (!connected) {
		process.exit(1);
	}

	const results = [];

	try {
		results.push(await test1_SaveBirthday());
		results.push(await test2_QuerySavedBirthday());
		results.push(await test3_UpdateToNewBirthday());
		results.push(await test4_VerifyBirthdayInChoice1Flow());
		results.push(await test5_CheckBirthdayConfirmedQuery());

		await cleanup();
	} catch (error) {
		log.fail(`Test execution error: ${error.message}`);
		console.error(error);
	}

	// Summary
	console.log(`\n${c.bold}${c.cyan}${"=".repeat(80)}${c.reset}`);
	console.log(`${c.bold}TEST SUMMARY${c.reset}`);
	console.log(`${c.cyan}${"=".repeat(80)}${c.reset}\n`);

	const passed = results.filter((r) => r).length;
	const total = results.length;

	if (passed === total) {
		console.log(
			`${c.bold}${c.green}✅ ALL ${total} TESTS PASSED!${c.reset}\n`
		);
	} else {
		console.log(
			`${c.bold}${c.red}⚠️  ${total - passed} TEST(S) FAILED (${passed}/${total} passed)${c.reset}\n`
		);
	}

	await mongoose.disconnect();
	process.exit(passed === total ? 0 : 1);
}

runTests();
