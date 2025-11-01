const axios = require("axios");

const API_URL = "http://localhost:3000/api/smart-chat2";
const testEmail = "hoihoi1083@gmail.com";
const testUserId = "hoihoi1083@gmail.com";
const testSessionId = `test_session_${Date.now()}`;

console.log("\n🔬 SIMPLE BIRTHDAY TEST");
console.log("=".repeat(80));
console.log("SessionId:", testSessionId);
console.log("Email:", testEmail);
console.log("\n");

async function sendMessage(message) {
	try {
		const response = await axios.post(API_URL, {
			message,
			sessionId: testSessionId,
			userEmail: testEmail,
			userId: testUserId,
			locale: "zh-TW",
			region: "hongkong",
		});

		return response.data;
	} catch (error) {
		console.error("❌ Error:", error.response?.data || error.message);
		throw error;
	}
}

async function test() {
	console.log('📨 Step 1: Sending "我想中六合彩"...\n');
	const response1 = await sendMessage("我想中六合彩");
	console.log(
		"Response includes saved birthday menu:",
		response1.response.includes("你上次的生日是")
	);
	console.log("conversationState after Step 1:", response1.conversationState);
	console.log("");

	console.log('📨 Step 2: Sending "1" (use saved birthday)...\n');
	const response2 = await sendMessage("1");
	console.log("Response preview:", response2.response.substring(0, 200));
	console.log("conversationState after Step 2:", response2.conversationState);
	console.log("");
	console.log(
		"Has analysis:",
		response2.response.includes("八字") ||
			response2.response.includes("運勢")
	);
	console.log(
		"Is asking for birthday:",
		response2.response.includes("生日格式範例")
	);

	console.log("\n" + "=".repeat(80));
	console.log("✅ Check server console logs above for debug information");
}

test().catch(console.error);
