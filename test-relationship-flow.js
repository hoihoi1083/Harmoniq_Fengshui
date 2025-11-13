/**
 * 關係流程測試 - Relationship Flow Test
 * 測試 親情/友情 是否正確歸類到 "命理"
 * 測試 浪漫愛情 是否正確歸類到 "感情"
 */

const testCases = [
	// 浪漫愛情 - 應該歸類為 "感情"
	{
		category: "浪漫愛情",
		expectedTopic: "感情",
		messages: [
			"我想挽回前男友",
			"桃花運什麼時候來",
			"分手後很痛苦怎麼辦",
			"單身多久能脫單",
			"和女友吵架了",
			"追求對象不順利",
			"想結婚但對方不願意",
			"戀愛運勢如何",
		],
	},
	// 親情 - 應該歸類為 "命理"
	{
		category: "親情",
		expectedTopic: "命理",
		messages: [
			"和父母關係不好",
			"子女運勢如何",
			"家人不理解我",
			"和媽媽總是吵架",
			"父親最近健康問題",
			"和弟弟關係緊張",
		],
	},
	// 友情 - 應該歸類為 "命理"
	{
		category: "友情",
		expectedTopic: "命理",
		messages: [
			"朋友背叛我",
			"友情破裂怎麼辦",
			"和朋友疏遠了",
			"好朋友不理我",
			"人緣不好怎麼辦",
		],
	},
	// 人際關係 - 應該歸類為 "命理"
	{
		category: "人際關係",
		expectedTopic: "命理",
		messages: ["人際關係緊張", "社交恐懼", "人緣運勢", "貴人運"],
	},
];

const API_URL = "https://www.harmoniqfengshui.com/api/smart-chat2";

async function testRelationshipFlow() {
	console.log("🧪 開始測試關係流程分類...\n");

	let totalTests = 0;
	let passedTests = 0;
	let failedTests = 0;

	for (const testCase of testCases) {
		console.log(`\n${"=".repeat(60)}`);
		console.log(`📂 測試類別: ${testCase.category}`);
		console.log(`✅ 預期分類: ${testCase.expectedTopic}`);
		console.log(`${"=".repeat(60)}\n`);

		for (const message of testCase.messages) {
			totalTests++;

			try {
				console.log(`📝 測試訊息: "${message}"`);

				const response = await fetch(API_URL, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: message,
						sessionId: `test-${Date.now()}-${Math.random()
							.toString(36)
							.substring(7)}`,
						locale: "zh-TW",
					}),
				});

				if (!response.ok) {
					throw new Error(
						`HTTP ${response.status}: ${response.statusText}`
					);
				}

				const data = await response.json();
				const detectedTopic = data.detectedTopic || "未知";

				const isCorrect = detectedTopic === testCase.expectedTopic;

				if (isCorrect) {
					passedTests++;
					console.log(`   ✅ 通過 - 檢測到: ${detectedTopic}`);
				} else {
					failedTests++;
					console.log(
						`   ❌ 失敗 - 檢測到: ${detectedTopic} (預期: ${testCase.expectedTopic})`
					);
					console.log(
						`   📋 完整回應:`,
						JSON.stringify(data, null, 2)
					);
				}

				// 等待 1 秒避免 rate limit
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				failedTests++;
				console.log(`   ❌ 錯誤: ${error.message}`);
			}
		}
	}

	// 總結
	console.log(`\n${"=".repeat(60)}`);
	console.log(`📊 測試總結`);
	console.log(`${"=".repeat(60)}`);
	console.log(`總測試數: ${totalTests}`);
	console.log(
		`✅ 通過: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`
	);
	console.log(
		`❌ 失敗: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`
	);
	console.log(`${"=".repeat(60)}\n`);

	if (failedTests === 0) {
		console.log("🎉 所有測試通過！關係流程分類正常工作！");
	} else {
		console.log("⚠️ 部分測試失敗，請檢查 AI 分類邏輯。");
	}
}

// 執行測試
testRelationshipFlow().catch((error) => {
	console.error("💥 測試執行失敗:", error);
	process.exit(1);
});
