/**
 * Test Script for Birthday Flow
 * Tests the saved birthday confirmation logic without waiting for AI
 */

// Mock data
const testCases = [
	{
		name: "財運 - Saved Birthday - Choose 1",
		scenario: "User asks about 財運, has saved birthday, chooses option 1",
		steps: [
			{
				message: "我想中六合彩",
				expectedResponse: "contains saved birthday confirmation",
				expectedState: "awaiting_birthday_choice",
				checkPattern: /你上次的生日是.*請選擇.*1️⃣.*2️⃣/s,
			},
			{
				message: "1",
				expectedResponse: "generates analysis with saved birthday",
				expectedState: "asking_detailed_report",
				checkPattern: /📊.*你的命理基礎分析/s,
			},
		],
	},
	{
		name: "財運 - Saved Birthday - Choose 2",
		scenario:
			"User asks about 財運, has saved birthday, chooses option 2 (new birthday)",
		steps: [
			{
				message: "我想中六合彩",
				expectedResponse: "contains saved birthday confirmation",
				expectedState: "awaiting_birthday_choice",
				checkPattern: /你上次的生日是.*請選擇.*1️⃣.*2️⃣/s,
			},
			{
				message: "2",
				expectedResponse: "asks for new birthday",
				expectedState: "birthday_collection",
				checkPattern: /請告訴風鈴你的新生日/s,
			},
		],
	},
	{
		name: "健康 - Saved Birthday - Choose 1",
		scenario: "User asks about 健康, has saved birthday, chooses option 1",
		steps: [
			{
				message: "我想改善健康",
				expectedResponse: "contains saved birthday confirmation",
				expectedState: "awaiting_birthday_choice",
				checkPattern: /你上次的生日是.*請選擇.*1️⃣.*2️⃣/s,
			},
			{
				message: "1",
				expectedResponse: "generates analysis with saved birthday",
				expectedState: "asking_detailed_report",
				checkPattern: /📊.*你的命理基礎分析/s,
			},
		],
	},
	{
		name: "感情 - Choose Individual Analysis (1)",
		scenario: "User asks about 感情, chooses individual analysis",
		steps: [
			{
				message: "我想拍拖",
				expectedResponse: "asks to choose analysis type",
				expectedState: "birthday_collection",
				checkPattern: /1️⃣ 個人感情分析.*2️⃣ 合婚配對分析/s,
			},
			{
				message: "1",
				expectedResponse:
					"shows saved birthday confirmation for individual",
				expectedState: "awaiting_birthday_choice",
				checkPattern: /你上次的生日是.*1️⃣ 使用這個生日進行感情分析/s,
			},
			{
				message: "1",
				expectedResponse: "generates individual analysis",
				expectedState: "asking_detailed_report",
				checkPattern: /📊.*你的命理基礎分析/s,
			},
		],
	},
	{
		name: "感情 - Choose Couple Analysis (2)",
		scenario: "User asks about 感情, chooses couple analysis",
		steps: [
			{
				message: "我想拍拖",
				expectedResponse: "asks to choose analysis type",
				expectedState: "birthday_collection",
				checkPattern: /1️⃣ 個人感情分析.*2️⃣ 合婚配對分析/s,
			},
			{
				message: "2",
				expectedResponse:
					"asks for two birthdays directly (no saved check)",
				expectedState: "birthday_collection",
				checkPattern: /請先提供.*你的生日.*也可以一次提供雙方生日/s,
			},
		],
	},
];

// Display test results
console.log("=".repeat(80));
console.log("BIRTHDAY FLOW TEST CASES");
console.log("=".repeat(80));
console.log("\n");

testCases.forEach((test, index) => {
	console.log(`\n📋 Test ${index + 1}: ${test.name}`);
	console.log(`   Scenario: ${test.scenario}`);
	console.log(`   Steps:`);

	test.steps.forEach((step, stepIndex) => {
		console.log(`\n   Step ${stepIndex + 1}:`);
		console.log(`   📨 Message: "${step.message}"`);
		console.log(`   ✅ Expected Response: ${step.expectedResponse}`);
		console.log(`   📌 Expected State: ${step.expectedState}`);
		console.log(`   🔍 Check Pattern: ${step.checkPattern}`);
	});

	console.log("\n   " + "-".repeat(70));
});

console.log("\n\n" + "=".repeat(80));
console.log("KEY DIFFERENCES TO VERIFY:");
console.log("=".repeat(80));

console.log(`
1. OTHER TOPICS (財運, 健康, 工作, etc.):
   ✅ Show saved birthday immediately
   ✅ When user types "1" → Use saved birthday → Generate analysis
   ✅ When user types "2" → Ask for new birthday
   ✅ State: awaiting_birthday_choice

2. RELATIONSHIP TOPIC (感情):
   ✅ First ask: Individual (1) or Couple (2)?
   ✅ If choose "1" (Individual):
      - Check for saved birthday
      - Show confirmation (state: awaiting_birthday_choice)
      - User types "1" → Use saved birthday
      - User types "2" → Ask for new birthday
   ✅ If choose "2" (Couple):
      - NO saved birthday check
      - Directly ask for two birthdays
      - User provides: "我1995/3/15，她1996/8/20"

3. CRITICAL CODE PATHS:
   
   Path A: Other topics saved birthday handler
   - Line ~6233: Set state = awaiting_birthday_choice
   - Line ~4017: Check if state === awaiting_birthday_choice
   - Line ~4043: If message === "1" → Use saved birthday
   
   Path B: Relationship - Individual analysis
   - Line ~4607: Check for saved birthday when "1" chosen
   - Line ~4629: Set state = awaiting_birthday_choice
   - Line ~4017: Check if state === awaiting_birthday_choice
   - Line ~4043: If message === "1" → Use saved birthday
   
   Path C: Relationship - Couple analysis
   - Line ~4672: relationshipAnalysisType = "couple"
   - Line ~4670: Directly ask for two birthdays
   - NO state = awaiting_birthday_choice
   - Line ~3408: Detect couple birthdays pattern
`);

console.log("\n" + "=".repeat(80));
console.log("MANUAL TESTING CHECKLIST:");
console.log("=".repeat(80));

const checklist = [
	"[ ] Test 財運 + saved birthday + choose 1 → Should generate analysis",
	"[ ] Test 財運 + saved birthday + choose 2 → Should ask for new birthday",
	"[ ] Test 健康 + saved birthday + choose 1 → Should generate analysis",
	"[ ] Test 感情 + choose 1 (individual) → Should show saved birthday",
	"[ ] Test 感情 + choose 1 + choose 1 again → Should generate analysis",
	"[ ] Test 感情 + choose 2 (couple) → Should ask for two birthdays",
	"[ ] Test couple birthdays: 我1995/3/15，她1996/8/20 → Should show 👨男方 👩女方",
];

checklist.forEach((item) => console.log(`   ${item}`));

console.log("\n" + "=".repeat(80));
console.log("DEBUGGING TIPS:");
console.log("=".repeat(80));

console.log(`
1. Check console logs for:
   🔍 當前 userIntent 狀態: {...}
   - Should show conversationState value
   
2. When choosing "1" after saved birthday message:
   - Log should show: exists: true
   - Log should show: conversationState: "awaiting_birthday_choice"
   - Log should show: message: "1"
   
3. If condition at line ~4017 NOT triggering:
   - userIntent might be null
   - conversationState might not be set correctly
   - Check if userIntent was saved in previous step
   
4. For relationship flow:
   - First "1" → Sets relationshipAnalysisType = "individual"
   - Shows saved birthday → Sets conversationState = "awaiting_birthday_choice"
   - Second "1" → Should use saved birthday
`);

console.log("\n" + "=".repeat(80));
console.log("Run this with: node test-birthday-flow.js");
console.log("=".repeat(80) + "\n");
