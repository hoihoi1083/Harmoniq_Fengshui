/**
 * 🧪 Detailed Chatbox Flow Testing with Response Inspection
 *
 * This test provides detailed output of actual responses
 * Date: 2025年11月11日
 */

const BASE_URL = "https://www.harmoniqfengshui.com";
const API_ENDPOINT = `${BASE_URL}/api/smart-chat2`;

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
				userId: `test-user-${Date.now()}`,
				locale,
			}),
		});

		const text = await response.text();
		console.log("\n📨 Response Status:", response.status);
		console.log(
			"📨 Response Headers:",
			JSON.stringify([...response.headers.entries()], null, 2)
		);

		if (!response.ok) {
			console.log("❌ Error Response Body:", text);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		try {
			const data = JSON.parse(text);
			return data;
		} catch (e) {
			console.log("❌ Failed to parse JSON:", text.substring(0, 500));
			throw new Error("Invalid JSON response");
		}
	} catch (error) {
		console.log(`❌ Request Failed: ${error.message}`);
		throw error;
	}
}

// Test 1: Basic greeting
async function testBasicFlow() {
	console.log("\n" + "=".repeat(80));
	console.log("🧪 TEST: Basic Greeting Flow");
	console.log("=".repeat(80));

	const sessionId = `test-basic-${Date.now()}`;

	console.log("\n1️⃣ Sending greeting...");
	try {
		const response1 = await sendChatMessage("你好", sessionId);
		console.log("✅ Response 1:", JSON.stringify(response1, null, 2));
	} catch (error) {
		console.log("❌ Test failed at greeting:", error.message);
		return;
	}

	console.log("\n2️⃣ Asking about emotion...");
	try {
		const response2 = await sendChatMessage("我想了解感情運勢", sessionId);
		console.log("✅ Response 2:", JSON.stringify(response2, null, 2));
	} catch (error) {
		console.log("❌ Test failed at emotion question:", error.message);
		return;
	}

	console.log("\n3️⃣ Selecting individual analysis...");
	try {
		const response3 = await sendChatMessage("個人分析", sessionId);
		console.log("✅ Response 3:", JSON.stringify(response3, null, 2));
	} catch (error) {
		console.log("❌ Test failed at selection:", error.message);
		return;
	}

	console.log("\n4️⃣ Providing birthday...");
	try {
		const response4 = await sendChatMessage("1990/5/15", sessionId);
		console.log("✅ Response 4:", JSON.stringify(response4, null, 2));
	} catch (error) {
		console.log("❌ Test failed at birthday:", error.message);
		return;
	}

	console.log("\n5️⃣ Asking specific question...");
	try {
		const response5 = await sendChatMessage("今年桃花運如何", sessionId);
		console.log("✅ Response 5:", JSON.stringify(response5, null, 2));

		// Check for markdown
		if (response5.message) {
			const hasMarkdown = /\*\*|##/.test(response5.message);
			console.log(
				"\n📝 Markdown Check:",
				hasMarkdown ? "❌ Found ** or ##" : "✅ Clean"
			);
		}
	} catch (error) {
		console.log("❌ Test failed at specific question:", error.message);
		return;
	}
}

// Test 2: Couple analysis with gender
async function testCoupleGender() {
	console.log("\n" + "=".repeat(80));
	console.log("🧪 TEST: Couple Analysis Gender Detection");
	console.log("=".repeat(80));

	const sessionId = `test-couple-${Date.now()}`;

	console.log("\n1️⃣ Direct couple input: 我1995/3/15，他1996/8/20");
	try {
		const response = await sendChatMessage(
			"我1995/3/15，他1996/8/20",
			sessionId
		);
		console.log("✅ Response:", JSON.stringify(response, null, 2));

		if (response.message) {
			console.log("\n🔍 Gender Analysis:");
			const hasFemale1995 = /女方.*1995/i.test(response.message);
			const hasMale1996 = /男方.*1996/i.test(response.message);
			console.log(
				"  - Female (user) = 1995:",
				hasFemale1995 ? "✅" : "❌"
			);
			console.log(
				"  - Male (partner) = 1996:",
				hasMale1996 ? "✅" : "❌"
			);
		}
	} catch (error) {
		console.log("❌ Test failed:", error.message);
	}

	console.log("\n2️⃣ Reversed gender: 我1995/3/15，她1996/8/20");
	const sessionId2 = `test-couple-reverse-${Date.now()}`;
	try {
		const response = await sendChatMessage(
			"我1995/3/15，她1996/8/20",
			sessionId2
		);
		console.log("✅ Response:", JSON.stringify(response, null, 2));

		if (response.message) {
			console.log("\n🔍 Gender Analysis:");
			const hasMale1995 = /男方.*1995/i.test(response.message);
			const hasFemale1996 = /女方.*1996/i.test(response.message);
			console.log("  - Male (user) = 1995:", hasMale1995 ? "✅" : "❌");
			console.log(
				"  - Female (partner) = 1996:",
				hasFemale1996 ? "✅" : "❌"
			);
		}
	} catch (error) {
		console.log("❌ Test failed:", error.message);
	}
}

// Test 3: Markdown cleaning
async function testMarkdownCleaning() {
	console.log("\n" + "=".repeat(80));
	console.log("🧪 TEST: Markdown Cleaning");
	console.log("=".repeat(80));

	const sessionId = `test-markdown-${Date.now()}`;

	console.log("\n1️⃣ Asking for analysis (should have clean text)...");
	try {
		const response = await sendChatMessage("幫我分析八字", sessionId);
		console.log("✅ Response:", JSON.stringify(response, null, 2));

		if (response.message) {
			const patterns = {
				"**": /\*\*/g,
				"##": /##/g,
				"~~": /~~/g,
				"`": /`/g,
			};

			console.log("\n📝 Markdown Pattern Check:");
			for (const [name, pattern] of Object.entries(patterns)) {
				const matches = response.message.match(pattern);
				console.log(
					`  - ${name}: ${matches ? `❌ Found ${matches.length} occurrences` : "✅ Clean"}`
				);
			}
		}
	} catch (error) {
		console.log("❌ Test failed:", error.message);
	}
}

// Test 4: Locale consistency
async function testLocaleConsistency() {
	console.log("\n" + "=".repeat(80));
	console.log("🧪 TEST: Locale Consistency");
	console.log("=".repeat(80));

	console.log("\n1️⃣ Testing Traditional Chinese (zh-TW)...");
	const sessionTW = `test-locale-tw-${Date.now()}`;
	try {
		const response = await sendChatMessage("你好", sessionTW, "zh-TW");
		console.log("✅ Response:", JSON.stringify(response, null, 2));

		if (response.message) {
			const traditionalChars =
				response.message.match(/[個請關為種過這]/g);
			const simplifiedChars = response.message.match(/[个请关为种过这]/g);
			console.log("\n📊 Character Analysis:");
			console.log(
				`  - Traditional chars found: ${traditionalChars ? traditionalChars.length : 0}`
			);
			console.log(
				`  - Simplified chars found: ${simplifiedChars ? simplifiedChars.length : 0}`
			);
		}
	} catch (error) {
		console.log("❌ Test failed:", error.message);
	}

	console.log("\n2️⃣ Testing Simplified Chinese (zh-CN)...");
	const sessionCN = `test-locale-cn-${Date.now()}`;
	try {
		const response = await sendChatMessage("你好", sessionCN, "zh-CN");
		console.log("✅ Response:", JSON.stringify(response, null, 2));

		if (response.message) {
			const traditionalChars =
				response.message.match(/[個請關為種過這]/g);
			const simplifiedChars = response.message.match(/[个请关为种过这]/g);
			console.log("\n📊 Character Analysis:");
			console.log(
				`  - Traditional chars found: ${traditionalChars ? traditionalChars.length : 0}`
			);
			console.log(
				`  - Simplified chars found: ${simplifiedChars ? simplifiedChars.length : 0}`
			);
		}
	} catch (error) {
		console.log("❌ Test failed:", error.message);
	}
}

// Test 5: Out of scope handling
async function testOutOfScope() {
	console.log("\n" + "=".repeat(80));
	console.log("🧪 TEST: Out-of-Scope Handling");
	console.log("=".repeat(80));

	const sessionId = `test-out-of-scope-${Date.now()}`;

	console.log("\n1️⃣ Asking off-topic question...");
	try {
		const response = await sendChatMessage("今天天氣如何", sessionId);
		console.log("✅ Response:", JSON.stringify(response, null, 2));

		if (response.message) {
			console.log("\n📊 Response Analysis:");
			console.log(
				`  - Response length: ${response.message.length} chars`
			);
			console.log(
				`  - Contains service recommendation: ${response.message.includes("風水") || response.message.includes("命理") ? "✅" : "❌"}`
			);
		}
	} catch (error) {
		console.log("❌ Test failed:", error.message);
	}
}

// Main runner
async function runTests() {
	console.log("\n" + "=".repeat(80));
	console.log("🚀 DETAILED CHATBOX FLOW TESTS");
	console.log("=".repeat(80));
	console.log(`API Endpoint: ${API_ENDPOINT}`);
	console.log(`Start Time: ${new Date().toLocaleString("zh-TW")}`);
	console.log("=".repeat(80));

	try {
		await testBasicFlow();
		await testCoupleGender();
		await testMarkdownCleaning();
		await testLocaleConsistency();
		await testOutOfScope();
	} catch (error) {
		console.log("\n❌ Fatal error:", error);
	}

	console.log("\n" + "=".repeat(80));
	console.log("✅ TESTS COMPLETED");
	console.log(`End Time: ${new Date().toLocaleString("zh-TW")}`);
	console.log("=".repeat(80) + "\n");
}

runTests().catch(console.error);
