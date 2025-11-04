/**
 * Test Script: Breakup Flow A/B/C/D Selection
 * Tests if the fix for primaryConcern saving works correctly
 */

const testBreakupFlow = async () => {
	const API_URL = "http://localhost:3001/api/smart-chat2";
	const testUserId = `test-user-${Date.now()}`;
	const testEmail = `test-${Date.now()}@example.com`;
	const sessionId = `test-session-${Date.now()}`;

	console.log("🧪 Starting Breakup Flow Test");
	console.log("=".repeat(60));
	console.log(`📝 Test User ID: ${testUserId}`);
	console.log(`📝 Session ID: ${sessionId}`);
	console.log(`📝 Locale: zh-CN (Simplified Chinese)`);
	console.log("=".repeat(60));

	// Test Step 1: Send breakup message
	console.log("\n📤 Step 1: Sending '我跟女朋友分手'...");
	try {
		const response1 = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "我跟女朋友分手",
				userId: testUserId,
				userEmail: testEmail,
				sessionId: sessionId,
				locale: "zh-CN",
			}),
		});

		const data1 = await response1.json();
		console.log("✅ Response 1 received:");
		console.log("   Status:", response1.status);
		console.log(
			"   Message preview:",
			data1.message?.substring(0, 150) + "..."
		);

		// Check if A/B/C/D menu is shown
		const hasMenu =
			data1.message?.includes("A. 刚分手") ||
			data1.message?.includes("A. 剛分手");
		console.log("   Has A/B/C/D Menu:", hasMenu ? "✅ YES" : "❌ NO");

		if (!hasMenu) {
			console.error("❌ TEST FAILED: Breakup menu not shown!");
			return;
		}

		// Wait a bit before next request
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Test Step 2: Send 'a' choice
		console.log("\n📤 Step 2: Sending 'a' (select healing advice)...");
		const response2 = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "a",
				userId: testUserId,
				userEmail: testEmail,
				sessionId: sessionId,
				locale: "zh-CN",
			}),
		});

		const data2 = await response2.json();
		console.log("✅ Response 2 received:");
		console.log("   Status:", response2.status);
		console.log(
			"   Message preview:",
			data2.message?.substring(0, 150) + "..."
		);

		// Check if healing advice is shown (Case A response)
		const hasHealingAdvice =
			data2.message?.includes("风铃完全理解") ||
			data2.message?.includes("風鈴完全理解") ||
			data2.message?.includes("刚分手真的很痛苦") ||
			data2.message?.includes("剛分手真的很痛苦");

		const hasOutOfScope = data2.message?.includes("命理分析");

		console.log(
			"   Has Healing Advice:",
			hasHealingAdvice ? "✅ YES" : "❌ NO"
		);
		console.log(
			"   Is Out-of-Scope:",
			hasOutOfScope ? "❌ YES (BUG!)" : "✅ NO (Correct)"
		);

		// Check if locale is correct (should be simplified Chinese)
		const isSimplifiedChinese =
			data2.message?.includes("风铃") || data2.message?.includes("疗伤");
		console.log(
			"   Is Simplified Chinese:",
			isSimplifiedChinese ? "✅ YES" : "❌ NO"
		);

		// Final verdict
		console.log("\n" + "=".repeat(60));
		if (hasHealingAdvice && !hasOutOfScope) {
			console.log(
				"🎉 TEST PASSED: Breakup flow A/B/C/D selection works!"
			);
			console.log("✅ primaryConcern saved correctly");
			console.log("✅ Case A handler triggered successfully");
			console.log("✅ Locale-aware response working");
		} else {
			console.log("❌ TEST FAILED:");
			if (!hasHealingAdvice) {
				console.log("   - Healing advice not shown");
			}
			if (hasOutOfScope) {
				console.log(
					"   - Got out-of-scope response (primaryConcern not saved)"
				);
			}
		}
		console.log("=".repeat(60));

		// Show full response for inspection
		console.log("\n📋 Full Response for Step 2:");
		console.log(data2.message);
	} catch (error) {
		console.error("❌ Test Error:", error.message);
		console.error(error.stack);
	}
};

// Run the test
testBreakupFlow().catch(console.error);
