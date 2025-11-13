/**
 * 🔀 Quick Context Switch Test
 * Simplified version with shorter waits to get faster results
 */

const API_ENDPOINT = "https://www.harmoniqfengshui.com/api/smart-chat2";
const TIMEOUT = 30000;

async function sendMessage(message, sessionId, userId) {
	try {
		const start = Date.now();
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message,
				sessionId,
				userId,
				locale: "zh-TW",
			}),
		});
		const data = await response.json();
		const time = Date.now() - start;

		console.log(`\n💬 User: "${message}"`);
		console.log(
			`⏱️  ${(time / 1000).toFixed(2)}s | State: ${data.conversationState || "unknown"}`
		);
		console.log(`\n🤖 Response:\n${data.response}\n`);
		console.log("─".repeat(80));

		return data;
	} catch (error) {
		console.log(`❌ Error: ${error.message}`);
		return null;
	}
}

async function test() {
	console.log("\n🔀 CONTEXT SWITCH TEST: Concern → Off-Topic → Back\n");

	const session = `test-${Date.now()}`;
	const user = `user-${Date.now()}`;

	// 1. Greeting
	console.log("📍 STEP 1: Greeting");
	await sendMessage("你好", session, user);
	await new Promise((r) => setTimeout(r, 1500));

	// 2. Ask about emotion
	console.log("\n📍 STEP 2: Ask About Emotion (VALID CONCERN)");
	const emotion = await sendMessage("我想問感情", session, user);
	await new Promise((r) => setTimeout(r, 2000));

	// 3. Interrupt with weather (OFF-TOPIC)
	console.log("\n📍 STEP 3: Switch to Weather (OFF-TOPIC INTERRUPTION)");
	const weather = await sendMessage("今天天氣如何？", session, user);

	// Analyze redirection
	const hasApology = weather?.response?.includes("抱歉");
	const mentionsFengShui =
		weather?.response?.includes("命理") ||
		weather?.response?.includes("風水");
	const hasCTA =
		weather?.response?.includes("想要開始") ||
		weather?.response?.includes("請輸入");

	console.log("\n📊 REDIRECTION ANALYSIS:");
	console.log(`   Has Apology ("抱歉"): ${hasApology ? "✅" : "❌"}`);
	console.log(`   Mentions Services: ${mentionsFengShui ? "✅" : "❌"}`);
	console.log(`   Has CTA: ${hasCTA ? "✅" : "❌"}`);
	console.log(
		`   Strength: ${hasApology ? "STRONG" : mentionsFengShui ? "WEAK" : "NONE"}`
	);

	await new Promise((r) => setTimeout(r, 2000));

	// 4. Return to emotion
	console.log("\n📍 STEP 4: Return to Emotion (BACK TO CONCERN)");
	const backToEmotion = await sendMessage(
		"好吧，回到感情的問題",
		session,
		user
	);

	// Analyze context retention
	const remembers = backToEmotion?.response?.includes("感情");
	const continues =
		backToEmotion?.response?.includes("生日") ||
		backToEmotion?.response?.includes("1️⃣");

	console.log("\n📊 CONTEXT RETENTION:");
	console.log(`   Remembers "感情": ${remembers ? "✅" : "❌"}`);
	console.log(`   Continues Flow: ${continues ? "✅" : "❌"}`);

	console.log("\n✅ TEST COMPLETE\n");
}

test().catch(console.error);
