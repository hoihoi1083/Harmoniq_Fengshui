/**
 * Test Birthday Saving for New Users and Option 2 (New Birthday)
 *
 * Tests:
 * 1. New user enters birthday → Check if saved in database
 * 2. Existing user chooses option 2 (new birthday) → Check if updated in database
 */

const API_URL = "http://localhost:3000/api/smart-chat2";
const TEST_EMAIL_NEW = `newuser_${Date.now()}@test.com`; // New user with no saved birthday
const TEST_EMAIL_EXISTING = "hoihoi1083@gmail.com"; // Existing user with saved birthday

async function sendMessage(sessionId, message, email, userId) {
	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message,
			sessionId,
			userEmail: email,
			userId: userId,
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}

async function checkSavedBirthday(email) {
	// This will be checked via the API response when we send a new message
	// The API should show the saved birthday if it exists
	const testSession = `check_${Date.now()}`;
	const response = await sendMessage(
		testSession,
		"我想中六合彩",
		email,
		email
	);

	// If birthday is saved, response should show "你上次的生日是"
	const hasSavedBirthday = response.response.includes("你上次的生日是");

	if (hasSavedBirthday) {
		// Extract the saved birthday from response
		const match = response.response.match(
			/你上次的生日是：(\d{4})年(\d{1,2})月(\d{1,2})日/
		);
		if (match) {
			return {
				saved: true,
				birthday: `${match[1]}-${match[2]}-${match[3]}`,
			};
		}
	}

	return { saved: false, birthday: null };
}

console.log("\n🧪 BIRTHDAY SAVING TESTS");
console.log("=".repeat(80));

(async () => {
	try {
		// ============================================================================
		// TEST 1: New User Enters Birthday → Check if Saved
		// ============================================================================
		console.log("\n📋 TEST 1: New User Birthday Saving");
		console.log("=".repeat(80));

		const session1 = `test_new_user_${Date.now()}`;
		console.log(`📧 New user email: ${TEST_EMAIL_NEW}`);
		console.log(`🔑 SessionId: ${session1}\n`);

		// Step 1: New user asks about 財運
		console.log("📨 Step 1: New user asks '我想中六合彩'");
		const response1 = await sendMessage(
			session1,
			"我想中六合彩",
			TEST_EMAIL_NEW,
			TEST_EMAIL_NEW
		);
		const askingForBirthday =
			response1.response.includes("告訴風鈴你的生日") ||
			response1.response.includes("生日格式範例");
		console.log(
			`   Asking for birthday: ${askingForBirthday ? "✅ YES" : "❌ NO"}`
		);
		console.log(
			`   Should NOT show saved birthday menu: ${!response1.response.includes("你上次的生日是") ? "✅ PASS" : "❌ FAIL"}`
		);
		if (!askingForBirthday) {
			console.log(
				`   ⚠️  Response preview: ${response1.response.substring(0, 200)}...`
			);
		}
		console.log();

		// Step 2: User provides birthday
		console.log("📨 Step 2: User provides birthday '1992-7-10'");
		const response2 = await sendMessage(
			session1,
			"1992-7-10",
			TEST_EMAIL_NEW,
			TEST_EMAIL_NEW
		);
		const hasAnalysis =
			response2.response.includes("📊 你的命理基礎分析") ||
			response2.response.includes("出生年份");
		console.log(`   Has analysis: ${hasAnalysis ? "✅ YES" : "❌ NO"}\n`);

		// Step 3: Check if birthday was saved
		console.log("📨 Step 3: Check if birthday was saved in database");
		console.log(
			"   (Sending new question to trigger saved birthday check)"
		);
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for DB save
		const savedCheck1 = await checkSavedBirthday(TEST_EMAIL_NEW);
		console.log(
			`   Birthday saved: ${savedCheck1.saved ? "✅ YES" : "❌ NO"}`
		);
		if (savedCheck1.saved) {
			console.log(`   Saved birthday: ${savedCheck1.birthday}`);
			console.log(
				`   Matches input (1992-7-10): ${savedCheck1.birthday === "1992-7-10" ? "✅ YES" : "❌ NO"}`
			);
		}

		const test1Pass =
			askingForBirthday &&
			hasAnalysis &&
			savedCheck1.saved &&
			savedCheck1.birthday === "1992-7-10";
		console.log(
			`\n${test1Pass ? "✅" : "❌"} TEST 1: ${test1Pass ? "PASSED" : "FAILED"}`
		);

		// ============================================================================
		// TEST 2: Existing User Chooses Option 2 (New Birthday) → Check if Updated
		// ============================================================================
		console.log("\n\n📋 TEST 2: Update Birthday via Option 2");
		console.log("=".repeat(80));

		const session2 = `test_update_birthday_${Date.now()}`;
		console.log(`📧 Existing user email: ${TEST_EMAIL_EXISTING}`);
		console.log(`🔑 SessionId: ${session2}\n`);

		// Step 1: User with saved birthday asks question
		console.log("📨 Step 1: User asks '我想中六合彩'");
		const response2_1 = await sendMessage(
			session2,
			"我想中六合彩",
			TEST_EMAIL_EXISTING,
			TEST_EMAIL_EXISTING
		);
		const showsSavedMenu =
			response2_1.response.includes("你上次的生日是") &&
			response2_1.response.includes("請選擇");
		console.log(
			`   Shows saved birthday menu: ${showsSavedMenu ? "✅ YES" : "❌ NO"}`
		);

		// Extract current saved birthday
		const currentBirthdayMatch = response2_1.response.match(
			/你上次的生日是：(\d{4})年(\d{1,2})月(\d{1,2})日/
		);
		const currentBirthday = currentBirthdayMatch
			? `${currentBirthdayMatch[1]}-${currentBirthdayMatch[2]}-${currentBirthdayMatch[3]}`
			: "unknown";
		console.log(`   Current saved birthday: ${currentBirthday}\n`);

		// Step 2: User chooses option 2 (new birthday)
		console.log("📨 Step 2: User chooses '2' (enter new birthday)");
		const response2_2 = await sendMessage(
			session2,
			"2",
			TEST_EMAIL_EXISTING,
			TEST_EMAIL_EXISTING
		);
		const asksForNewBirthday =
			response2_2.response.includes("請告訴風鈴你的新生日");
		console.log(
			`   Asks for new birthday: ${asksForNewBirthday ? "✅ YES" : "❌ NO"}\n`
		);

		// Step 3: User provides new birthday
		const newBirthday = "1988-12-25";
		console.log(`📨 Step 3: User provides new birthday '${newBirthday}'`);
		const response2_3 = await sendMessage(
			session2,
			newBirthday,
			TEST_EMAIL_EXISTING,
			TEST_EMAIL_EXISTING
		);
		const hasAnalysis2 =
			response2_3.response.includes("📊 你的命理基礎分析") ||
			response2_3.response.includes("出生年份：1988");
		console.log(`   Has analysis: ${hasAnalysis2 ? "✅ YES" : "❌ NO"}`);
		console.log(
			`   Shows 1988 (new year): ${response2_3.response.includes("1988") ? "✅ YES" : "❌ NO"}\n`
		);

		// Step 4: Check if new birthday was saved
		console.log("📨 Step 4: Check if new birthday was saved in database");
		console.log(
			"   (Sending new question to trigger saved birthday check)"
		);
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for DB save
		const savedCheck2 = await checkSavedBirthday(TEST_EMAIL_EXISTING);
		console.log(
			`   Birthday saved: ${savedCheck2.saved ? "✅ YES" : "❌ NO"}`
		);
		if (savedCheck2.saved) {
			console.log(`   New saved birthday: ${savedCheck2.birthday}`);
			console.log(
				`   Matches new input (${newBirthday}): ${savedCheck2.birthday === newBirthday ? "✅ YES" : "❌ NO"}`
			);
			console.log(
				`   Different from old (${currentBirthday}): ${savedCheck2.birthday !== currentBirthday ? "✅ YES" : "❌ NO"}`
			);
		}

		const test2Pass =
			showsSavedMenu &&
			asksForNewBirthday &&
			hasAnalysis2 &&
			savedCheck2.saved &&
			savedCheck2.birthday === newBirthday;
		console.log(
			`\n${test2Pass ? "✅" : "❌"} TEST 2: ${test2Pass ? "PASSED" : "FAILED"}`
		);

		// ============================================================================
		// TEST SUMMARY
		// ============================================================================
		console.log("\n\n" + "=".repeat(80));
		console.log("📊 TEST SUMMARY");
		console.log("=".repeat(80));
		console.log(
			`TEST 1 (New User Birthday Saving): ${test1Pass ? "✅ PASSED" : "❌ FAILED"}`
		);
		console.log(
			`TEST 2 (Update via Option 2): ${test2Pass ? "✅ PASSED" : "❌ FAILED"}`
		);
		console.log(
			"\n" +
				(test1Pass && test2Pass
					? "🎉 ALL TESTS PASSED!"
					: "⚠️  SOME TESTS FAILED")
		);
		console.log("=".repeat(80) + "\n");

		// Exit with appropriate code
		process.exit(test1Pass && test2Pass ? 0 : 1);
	} catch (error) {
		console.error("\n❌ ERROR:", error);
		process.exit(1);
	}
})();
