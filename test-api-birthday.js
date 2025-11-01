/**
 * Automated API Test for Birthday Flow
 * This actually calls your API and tests the flow
 */

const testSessionId = `test-${Date.now()}`;
const testEmail = "hoihoi1083@gmail.com"; // Use your actual email that has saved birthday
const testUserId = "hoihoi1083@gmail.com";

async function callAPI(message, customSessionId = null) {
	const response = await fetch("http://localhost:3000/api/smart-chat2", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message: message,
			sessionId: customSessionId || testSessionId,
			userEmail: testEmail,
			userId: testUserId,
			locale: "zh-CN",
		}),
	});

	if (!response.ok) {
		throw new Error(
			`API returned ${response.status}: ${response.statusText}`
		);
	}

	return await response.json();
}

async function test1_FinanceWithSavedBirthday() {
	console.log("\n" + "=".repeat(80));
	console.log("TEST 1: 財運 + Saved Birthday + Choose 1");
	console.log("=".repeat(80));

	try {
		// Step 1: Ask about 財運
		console.log("\n📨 Step 1: Sending '我想中六合彩'");
		const response1 = await callAPI("我想中六合彩");

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response1.response.substring(0, 200) + "..."
		);
		console.log(
			"   Has '你上次的生日是':",
			response1.response.includes("你上次的生日是")
		);
		console.log("   Has '請選擇':", response1.response.includes("請選擇"));
		console.log("   Has '1️⃣':", response1.response.includes("1️⃣"));
		console.log("   Has '2️⃣':", response1.response.includes("2️⃣"));

		if (!response1.response.includes("你上次的生日是")) {
			console.log("\n❌ FAIL: Should show saved birthday confirmation");
			return false;
		}

		// Step 2: Choose option 1
		console.log("\n📨 Step 2: Sending '1' (use saved birthday)");
		const response2 = await callAPI("1");

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response2.response.substring(0, 200) + "..."
		);
		console.log(
			"   Has analysis:",
			response2.response.includes("📊") ||
				response2.response.includes("命理")
		);
		console.log(
			"   NOT asking for birthday again:",
			!response2.response.includes("告訴風鈴你的生日")
		);

		if (response2.response.includes("告訴風鈴你的生日")) {
			console.log(
				"\n❌ FAIL: Should NOT ask for birthday again - should use saved birthday!"
			);
			console.log("\n🔍 Full response:", response2.response);
			return false;
		}

		console.log("\n✅ TEST 1 PASSED!");
		return true;
	} catch (error) {
		console.error("\n❌ TEST 1 FAILED:", error.message);
		return false;
	}
}

async function test1b_FinanceWithNewBirthday() {
	console.log("\n" + "=".repeat(80));
	console.log("TEST 1B: 財運 + Saved Birthday + Choose 2 (New Birthday)");
	console.log("=".repeat(80));

	const sessionId1b = `test-finance-new-${Date.now()}`;

	try {
		// Step 1: Ask about 財運
		console.log("\n📨 Step 1: Sending '我想中六合彩'");
		const response1 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "我想中六合彩",
				sessionId: sessionId1b,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Has '你上次的生日是':",
			response1.response.includes("你上次的生日是")
		);
		console.log("   Has '請選擇':", response1.response.includes("請選擇"));

		if (!response1.response.includes("你上次的生日是")) {
			console.log("\n❌ FAIL: Should show saved birthday confirmation");
			return false;
		}

		// Step 2: Choose option 2 (new birthday)
		console.log("\n📨 Step 2: Sending '2' (enter new birthday)");
		const response2 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "2",
				sessionId: sessionId1b,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response2.response.substring(0, 200) + "..."
		);
		console.log(
			"   Asks for new birthday:",
			response2.response.includes("請告訴風鈴你的新生日")
		);
		console.log(
			"   Has birthday format examples:",
			response2.response.includes("生日格式範例")
		);

		if (!response2.response.includes("請告訴風鈴你的新生日")) {
			console.log("\n❌ FAIL: Should ask for new birthday!");
			console.log("\n🔍 Full response:", response2.response);
			return false;
		}

		// Step 3: Provide new birthday
		console.log("\n📨 Step 3: Sending '1990-5-20' (new birthday)");
		const response3 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "1990-5-20",
				sessionId: sessionId1b,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response3.response.substring(0, 200) + "..."
		);
		console.log(
			"   Has analysis:",
			response3.response.includes("📊") ||
				response3.response.includes("命理")
		);
		console.log("   Shows 1990:", response3.response.includes("1990"));

		if (!response3.response.includes("1990")) {
			console.log(
				"\n⚠️ WARNING: Should use new birthday (1990) for analysis"
			);
		}

		console.log("\n✅ TEST 1B PASSED!");
		return true;
	} catch (error) {
		console.error("\n❌ TEST 1B FAILED:", error.message);
		return false;
	}
}

async function test2_RelationshipIndividual() {
	console.log("\n" + "=".repeat(80));
	console.log(
		"TEST 2: 感情 + Choose Individual (1) + Choose Saved Birthday (1)"
	);
	console.log("=".repeat(80));

	const sessionId2 = `test-rel-${Date.now()}`;

	try {
		// Step 1: Ask about relationship
		console.log("\n📨 Step 1: Sending '我想拍拖'");
		const response1 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "我想拍拖",
				sessionId: sessionId2,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Has '個人感情分析':",
			response1.response.includes("個人感情分析")
		);
		console.log(
			"   Has '合婚配對分析':",
			response1.response.includes("合婚配對分析")
		);

		if (!response1.response.includes("個人感情分析")) {
			console.log("\n❌ FAIL: Should ask to choose analysis type");
			return false;
		}

		// Step 2: Choose individual analysis
		console.log("\n📨 Step 2: Sending '1' (individual analysis)");
		const response2 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "1",
				sessionId: sessionId2,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response2.response.substring(0, 200) + "..."
		);
		console.log(
			"   Has '你上次的生日是':",
			response2.response.includes("你上次的生日是")
		);
		console.log(
			"   Has '使用這個生日進行感情分析':",
			response2.response.includes("使用這個生日進行感情分析")
		);

		if (!response2.response.includes("你上次的生日是")) {
			console.log("\n❌ FAIL: Should show saved birthday confirmation");
			return false;
		}

		// Step 3: Choose to use saved birthday
		console.log("\n📨 Step 3: Sending '1' (use saved birthday)");
		const response3 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "1",
				sessionId: sessionId2,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response3.response.substring(0, 200) + "..."
		);
		console.log(
			"   Has analysis:",
			response3.response.includes("📊") ||
				response3.response.includes("命理")
		);
		console.log(
			"   NOT asking for birthday again:",
			!response3.response.includes("告訴風鈴你的生日")
		);

		if (response3.response.includes("告訴風鈴你的生日")) {
			console.log(
				"\n❌ FAIL: Should NOT ask for birthday again - should use saved birthday!"
			);
			console.log("\n🔍 Full response:", response3.response);
			return false;
		}

		console.log("\n✅ TEST 2 PASSED!");
		return true;
	} catch (error) {
		console.error("\n❌ TEST 2 FAILED:", error.message);
		return false;
	}
}

async function test3_RelationshipCouple() {
	console.log("\n" + "=".repeat(80));
	console.log("TEST 3: 感情 + Choose Couple (2) + Provide Both Birthdays");
	console.log("=".repeat(80));

	const sessionId3 = `test-couple-${Date.now()}`;

	try {
		// Step 1: Ask about relationship
		console.log("\n📨 Step 1: Sending '我想拍拖'");
		const response1 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "我想拍拖",
				sessionId: sessionId3,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received - asks to choose type");

		// Step 2: Choose couple analysis
		console.log("\n📨 Step 2: Sending '2' (couple analysis)");
		const response2 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "2",
				sessionId: sessionId3,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response2.response.substring(0, 200) + "..."
		);
		console.log(
			"   Asks for birthdays:",
			response2.response.includes("請先提供")
		);
		console.log(
			"   NOT showing saved birthday:",
			!response2.response.includes("你上次的生日是")
		);

		if (response2.response.includes("你上次的生日是")) {
			console.log(
				"\n❌ FAIL: Couple analysis should NOT check for saved birthday"
			);
			return false;
		}

		// Step 3: Provide both birthdays
		console.log("\n📨 Step 3: Sending '我1995/3/15，她1996/8/20'");
		const response3 = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "我1995/3/15，她1996/8/20",
				sessionId: sessionId3,
				userEmail: testEmail,
				userId: testUserId,
				locale: "zh-CN",
			}),
		}).then((r) => r.json());

		console.log("\n✅ Response received:");
		console.log(
			"   Response preview:",
			response3.response.substring(0, 300) + "..."
		);
		console.log("   Has 男方:", response3.response.includes("男方"));
		console.log("   Has 女方:", response3.response.includes("女方"));
		console.log(
			"   Has couple analysis:",
			response3.response.includes("合婚") ||
				response3.response.includes("配對")
		);

		if (!response3.response.includes("男方")) {
			console.log(
				"\n⚠️ WARNING: Should show 男方 (user gender should be male when saying 她)"
			);
		}

		console.log("\n✅ TEST 3 PASSED!");
		return true;
	} catch (error) {
		console.error("\n❌ TEST 3 FAILED:", error.message);
		return false;
	}
}

// Run all tests
async function runAllTests() {
	console.log("\n\n");
	console.log("█".repeat(80));
	console.log("██" + " ".repeat(76) + "██");
	console.log(
		"██" +
			" ".repeat(20) +
			"BIRTHDAY FLOW API TESTS" +
			" ".repeat(33) +
			"██"
	);
	console.log("██" + " ".repeat(76) + "██");
	console.log("█".repeat(80));

	console.log("\n⚙️  Testing against: http://localhost:3000/api/smart-chat2");
	console.log("📧 Test email:", testEmail);
	console.log("👤 Test userId:", testUserId);

	const results = [];

	// Run tests sequentially
	results.push(await test1_FinanceWithSavedBirthday());
	await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s between tests

	results.push(await test1b_FinanceWithNewBirthday());
	await new Promise((resolve) => setTimeout(resolve, 1000));

	results.push(await test2_RelationshipIndividual());
	await new Promise((resolve) => setTimeout(resolve, 1000));

	results.push(await test3_RelationshipCouple());

	// Summary
	console.log("\n\n" + "█".repeat(80));
	console.log("██" + " ".repeat(76) + "██");
	console.log("██" + " ".repeat(30) + "TEST SUMMARY" + " ".repeat(34) + "██");
	console.log("██" + " ".repeat(76) + "██");
	console.log("█".repeat(80));

	const passed = results.filter((r) => r).length;
	const total = results.length;

	console.log(`\n   Total Tests: ${total}`);
	console.log(`   ✅ Passed: ${passed}`);
	console.log(`   ❌ Failed: ${total - passed}`);

	if (passed === total) {
		console.log("\n   🎉 ALL TESTS PASSED! 🎉\n");
	} else {
		console.log("\n   ⚠️  SOME TESTS FAILED - Check logs above\n");
	}

	console.log("█".repeat(80) + "\n\n");
}

// Check if server is running first
async function checkServer() {
	try {
		const response = await fetch("http://localhost:3000/api/smart-chat2", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "test",
				sessionId: "test",
				userEmail: "test@test.com",
				userId: "test",
			}),
		});
		return true;
	} catch (error) {
		console.error(
			"\n❌ ERROR: Cannot connect to server at http://localhost:3000"
		);
		console.error("   Make sure your Next.js server is running!");
		console.error("   Run: npm run dev\n");
		return false;
	}
}

// Main execution
(async () => {
	const serverRunning = await checkServer();
	if (serverRunning) {
		await runAllTests();
	}
})();
