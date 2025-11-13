/**
 * Single flow test to diagnose timeout issue
 */

const API_ENDPOINT = "https://www.harmoniqfengshui.com/api/smart-chat2";

async function testConversation() {
	const sessionId = `test-${Date.now()}`;

	console.log("\n=== Step 1: Greeting ===");
	const response1 = await fetch(API_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			message: "你好",
			sessionId,
			userId: `user-${Date.now()}`,
			locale: "zh-TW",
		}),
	});

	const data1 = await response1.json();
	console.log("Status:", response1.status);
	console.log("Response:", data1.response?.substring(0, 150));
	console.log("ConversationState:", data1.conversationState);

	console.log("\n=== Waiting 3 seconds... ===");
	await new Promise((resolve) => setTimeout(resolve, 3000));

	console.log("\n=== Step 2: Ask about emotion ===");
	console.log("Sending request...");

	const startTime = Date.now();
	try {
		const response2 = await Promise.race([
			fetch(API_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "我想問感情",
					sessionId,
					userId: `user-${Date.now()}`,
					locale: "zh-TW",
				}),
			}),
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Timeout after 30s")), 30000)
			),
		]);

		const elapsed = Date.now() - startTime;
		console.log(`Request completed in ${elapsed}ms`);

		const data2 = await response2.json();
		console.log("Status:", response2.status);
		console.log("Response:", data2.response?.substring(0, 200));
		console.log("ConversationState:", data2.conversationState);
	} catch (error) {
		const elapsed = Date.now() - startTime;
		console.log(`Request failed after ${elapsed}ms: ${error.message}`);
	}
}

testConversation().catch(console.error);
