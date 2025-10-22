import { NextResponse } from "next/server";

// DeepSeek AI Service
async function callDeepSeekAPI(prompt, isSimplified = false) {
	const systemContent = isSimplified
		? "你是一位专业的风水命理大师，具备深厚的八字分析能力。请根据用户的具体问题生成专业建议。请全部使用简体中文回应。"
		: "你是一位專業的風水命理大師，具備深厚的八字分析能力。請根據用戶的具體問題生成專業建議。請全部使用繁體中文回應。";

	try {
		const response = await fetch(
			"https://api.deepseek.com/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [
						{
							role: "system",
							content: systemContent,
						},
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 6000,
					temperature: 0.8,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`DeepSeek API error: ${response.status}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	} catch (error) {
		console.error("DeepSeek API Error:", error);
		throw error;
	}
}

// Parse AI response into structured suggestions and taboos
function parseSpecificSuggestionContent(aiResponse, isSimplified = false) {
	try {
		console.log("Raw AI Response:", aiResponse);

		// Extract suggestions section
		const suggestionsMatch = aiResponse.match(
			/五大建議方案[：:](.*?)五大禁忌行為/s
		);
		let suggestionsText = suggestionsMatch
			? suggestionsMatch[1].trim()
			: "";

		if (!suggestionsText) {
			// Alternative pattern for suggestions
			const altSuggestionsMatch = aiResponse.match(
				/建議方案[：:]?(.*?)(?=禁忌|避免|注意)/s
			);
			suggestionsText = altSuggestionsMatch
				? altSuggestionsMatch[1].trim()
				: "";
		}

		// Extract taboos section
		const taboosMatch = aiResponse.match(
			/五大禁忌行為[：:](.*?)(?:\n\n|$)/s
		);
		let taboosText = taboosMatch ? taboosMatch[1].trim() : "";

		if (!taboosText) {
			// Alternative pattern for taboos
			const altTaboosMatch = aiResponse.match(/禁忌行為[：:]?(.*?)$/s);
			taboosText = altTaboosMatch ? altTaboosMatch[1].trim() : "";
		}

		console.log("Extracted suggestions text:", suggestionsText);
		console.log("Extracted taboos text:", taboosText);

		// Parse suggestions
		const suggestions = parseSuggestionsFromText(
			suggestionsText,
			isSimplified
		);

		// Parse taboos
		const taboos = parseTaboosFromText(taboosText, isSimplified);

		console.log("Parsed suggestions:", suggestions);
		console.log("Parsed taboos:", taboos);

		return {
			suggestions:
				suggestions.length > 0
					? suggestions
					: generateFallbackSuggestions(isSimplified),
			taboos:
				taboos.length > 0
					? taboos
					: generateFallbackTaboos(isSimplified),
		};
	} catch (error) {
		console.error("Parse error:", error);
		return {
			suggestions: generateFallbackSuggestions(isSimplified),
			taboos: generateFallbackTaboos(isSimplified),
		};
	}
}

function parseSuggestionsFromText(text, isSimplified = false) {
	const suggestions = [];

	// Primary pattern: numbered list (1. Title: Content)
	const primaryPattern =
		/(\d+)[、.\s]*([^：:\n]+)[：:]([^]+?)(?=\n\d+[、.\s]*[^：:\n]+[：:]|\n【|$)/gs;
	let matches = [...text.matchAll(primaryPattern)];

	// Fallback pattern: simple numbered format
	if (matches.length === 0) {
		const fallbackPattern = /(\d+)[、.\s]*([^]+?)(?=\n\d+[、.\s]|\n【|$)/g;
		matches = [...text.matchAll(fallbackPattern)];
	}

	// Additional fallback: Chinese numerals
	if (matches.length === 0) {
		const chinesePattern =
			/([一二三四五])[、.\s]*([^]+?)(?=\n[一二三四五][、.\s]|\n【|$)/g;
		matches = [...text.matchAll(chinesePattern)];
	}

	// Language-aware fallback text
	const suggestionText = isSimplified ? "建议" : "建議";
	const suggestionTypeText = isSimplified ? "建议型" : "建議型";

	// Process matches
	matches.forEach((match, index) => {
		if (index < 5) {
			// Limit to 5 suggestions
			let title, content;

			if (match[3]) {
				// Format: "1. Title: Content"
				title = match[2] || `${suggestionText} ${index + 1}`;
				content = match[3];
			} else {
				// Format: "1. Title+Content" - split on first colon if exists
				let fullText = match[2] || match[1] || "";
				let colonIndex =
					fullText.indexOf("：") || fullText.indexOf(":");
				if (colonIndex > 0 && colonIndex < fullText.length * 0.4) {
					title = fullText.substring(0, colonIndex);
					content = fullText.substring(colonIndex + 1);
				} else {
					title = `${suggestionText} ${index + 1}`;
					content = fullText;
				}
			}

			// Clean up content
			title = title.trim().replace(/[：:]/g, "");
			content = content.trim();

			// Remove newlines and clean up formatting
			content = content.replace(/\n+/g, " ").replace(/\s+/g, " ");

			// Clean up content length
			if (content.length > 150) {
				content = content.substring(0, 120) + "...";
			}

			// Remove any existing repetitive endings (both Simplified and Traditional)
			content = content.replace(
				/\.\.\.根据你的八字分析，建议持续观察并调整策略，以达到最佳效果。$/,
				""
			);
			content = content.replace(
				/根据你的八字分析，建议持续观察并调整策略，以达到最佳效果。$/,
				""
			);
			content = content.replace(
				/\.\.\.根據你的八字分析，建議持續觀察並調整策略，以達到最佳效果。$/,
				""
			);
			content = content.replace(
				/根據你的八字分析，建議持續觀察並調整策略，以達到最佳效果。$/,
				""
			);

			const icons = ["🎯", "💡", "⭐", "🚀", "🔮"];
			const categories = isSimplified
				? ["核心型", "实用型", "提升型", "突破型", "智慧型"]
				: ["核心型", "實用型", "提升型", "突破型", "智慧型"];

			suggestions.push({
				title: title,
				description: content,
				icon: icons[index] || "💫",
				category: categories[index] || suggestionTypeText,
			});
		}
	});

	return suggestions;
}

function parseTaboosFromText(text, isSimplified = false) {
	const taboos = [];

	// Primary pattern: numbered list (1. Title: Content)
	const primaryPattern =
		/(\d+)[、.\s]*([^：:\n]+)[：:]([^]+?)(?=\n\d+[、.\s]*[^：:\n]+[：:]|\n【|$)/gs;
	let matches = [...text.matchAll(primaryPattern)];

	// Fallback pattern: simple numbered format
	if (matches.length === 0) {
		const fallbackPattern = /(\d+)[、.\s]*([^]+?)(?=\n\d+[、.\s]|\n【|$)/g;
		matches = [...text.matchAll(fallbackPattern)];
	}

	// Additional fallback: Chinese numerals
	if (matches.length === 0) {
		const chinesePattern =
			/([一二三四五])[、.\s]*([^]+?)(?=\n[一二三四五][、.\s]|\n【|$)/g;
		matches = [...text.matchAll(chinesePattern)];
	}

	// Language-aware fallback text
	const tabooText = isSimplified ? "禁忌" : "禁忌";

	// Process matches
	matches.forEach((match, index) => {
		if (index < 5) {
			// Limit to 5 taboos
			let title, content;

			if (match[3]) {
				// Format: "1. Title: Content"
				title = match[2] || `${tabooText} ${index + 1}`;
				content = match[3];
			} else {
				// Format: "1. Title+Content" - split on first colon if exists
				let fullText = match[2] || match[1] || "";
				let colonIndex =
					fullText.indexOf("：") || fullText.indexOf(":");
				if (colonIndex > 0 && colonIndex < fullText.length * 0.4) {
					title = fullText.substring(0, colonIndex);
					content = fullText.substring(colonIndex + 1);
				} else {
					title = `${tabooText} ${index + 1}`;
					content = fullText;
				}
			}

			// Clean up content
			title = title.trim().replace(/[：:]/g, "");
			content = content.trim();

			// Remove newlines and clean up formatting
			content = content.replace(/\n+/g, " ").replace(/\s+/g, " ");

			// Clean up content length
			if (content.length > 150) {
				content = content.substring(0, 120) + "...";
			}

			// Remove any existing repetitive endings (both Simplified and Traditional)
			content = content.replace(
				/\.\.\.避免此行为可能导致的负面后果，建议谨慎处理相关事务。$/,
				""
			);
			content = content.replace(
				/避免此行为可能导致的负面后果，建议谨慎处理相关事务。$/,
				""
			);
			content = content.replace(
				/\.\.\.避免此行為可能導致的負面後果，建議謹慎處理相關事務。$/,
				""
			);
			content = content.replace(
				/避免此行為可能導致的負面後果，建議謹慎處理相關事務。$/,
				""
			);

			const icons = ["🚫", "⚠️", "❌", "🔴", "🛑"];
			const levels = isSimplified
				? ["严禁", "避免", "谨慎", "警惕", "注意"]
				: ["嚴禁", "避免", "謹慎", "警惕", "注意"];
			const consequences = isSimplified
				? ["影响运势", "阻碍发展", "增加风险", "损害利益", "破坏平衡"]
				: ["影響運勢", "阻礙發展", "增加風險", "損害利益", "破壞平衡"];
			const defaultConsequence = isSimplified
				? "可能影响整体运势"
				: "可能影響整體運勢";
			const defaultLevel = isSimplified ? "注意" : "注意";

			taboos.push({
				title: title,
				description: content,
				icon: icons[index] || "⛔",
				level: levels[index] || defaultLevel,
				consequence: consequences[index] || defaultConsequence,
			});
		}
	});

	return taboos;
}

function generateFallbackSuggestions(isSimplified = false) {
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const nextYear = now.getFullYear() + 1;

	// Generate future-focused timing based on current month
	let nearTermTiming = isSimplified ? "10月底前" : "10月底前";
	let midTermTiming = isSimplified
		? "接下来的冬季（11-1月）"
		: "接下來的冬季（11-1月）";
	let longTermTiming = isSimplified
		? `明年春季（${nextYear}年3-5月）`
		: `明年春季（${nextYear}年3-5月）`;

	if (currentMonth === 11) {
		nearTermTiming = isSimplified ? "11月底前" : "11月底前";
		midTermTiming = isSimplified ? "今年底（12月）" : "今年底（12月）";
		longTermTiming = isSimplified
			? `明年初（${nextYear}年1-2月）`
			: `明年初（${nextYear}年1-2月）`;
	} else if (currentMonth === 12) {
		nearTermTiming = isSimplified ? "12月底前" : "12月底前";
		midTermTiming = isSimplified
			? `明年初（${nextYear}年1月）`
			: `明年初（${nextYear}年1月）`;
		longTermTiming = isSimplified
			? `明年春季（${nextYear}年3-5月）`
			: `明年春季（${nextYear}年3-5月）`;
	}

	return isSimplified
		? [
				{
					title: "环境调整",
					description: `根据你的八字分析，建议${nearTermTiming}调整居住或工作环境，增强有利的风水元素。选择适合的方位和布局，有助于提升整体运势。`,
					icon: "🏠",
					category: "环境型",
				},
				{
					title: "时机把握",
					description: `依据你的命理周期，建议${midTermTiming}期间进行重要决策。关注个人运势周期，把握最佳行动时机，今年底前完成重要规划。`,
					icon: "⏰",
					category: "时机型",
				},
				{
					title: "个人提升",
					description: `针对你的八字特点，建议从现在开始加强相应的个人能力。透过学习和实践，在${longTermTiming}前提升自身竞争力和适应能力。`,
					icon: "📚",
					category: "提升型",
				},
				{
					title: "人际网络",
					description: `根据你的社交宫位分析，建议接下来几个月扩展有益的人际关系。与贵人建立良好关系，在${midTermTiming}建立稳固的合作基础。`,
					icon: "🤝",
					category: "人脉型",
				},
				{
					title: "心态调整",
					description: `基于你的性格特质，建议从现在开始保持积极正面的心态。透过冥想、运动等方式调节情绪，在${longTermTiming}达到内心平衡与和谐。`,
					icon: "🧘",
					category: "心理型",
				},
			]
		: [
				{
					title: "環境調整",
					description: `根據你的八字分析，建議${nearTermTiming}調整居住或工作環境，增強有利的風水元素。選擇適合的方位和佈局，有助於提升整體運勢。`,
					icon: "🏠",
					category: "環境型",
				},
				{
					title: "時機把握",
					description: `依據你的命理週期，建議${midTermTiming}期間進行重要決策。關注個人運勢週期，把握最佳行動時機，今年底前完成重要規劃。`,
					icon: "⏰",
					category: "時機型",
				},
				{
					title: "個人提升",
					description: `針對你的八字特點，建議從現在開始加強相應的個人能力。透過學習和實踐，在${longTermTiming}前提升自身競爭力和適應能力。`,
					icon: "📚",
					category: "提升型",
				},
				{
					title: "人際網絡",
					description: `根據你的社交宮位分析，建議接下來幾個月擴展有益的人際關係。與貴人建立良好關係，在${midTermTiming}建立穩固的合作基礎。`,
					icon: "🤝",
					category: "人脈型",
				},
				{
					title: "心態調整",
					description: `基於你的性格特質，建議從現在開始保持積極正面的心態。透過冥想、運動等方式調節情緒，在${longTermTiming}達到內心平衡與和諧。`,
					icon: "🧘",
					category: "心理型",
				},
			];
}

function generateFallbackTaboos(isSimplified = false) {
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const nextYear = now.getFullYear() + 1;

	// Generate future-focused timing
	let nearTermPeriod = isSimplified ? "10月底前" : "10月底前";
	let midTermPeriod = isSimplified
		? "接下来两个月（11-12月）"
		: "接下來兩個月（11-12月）";
	let yearEndPeriod = isSimplified ? "今年底" : "今年底";

	if (currentMonth === 11) {
		nearTermPeriod = isSimplified ? "11月底前" : "11月底前";
		midTermPeriod = isSimplified ? "接下来的12月" : "接下來的12月";
		yearEndPeriod = isSimplified ? "今年底" : "今年底";
	} else if (currentMonth === 12) {
		nearTermPeriod = isSimplified ? "12月底前" : "12月底前";
		midTermPeriod = isSimplified
			? `明年初（${nextYear}年1月）`
			: `明年初（${nextYear}年1月）`;
		yearEndPeriod = isSimplified ? "年底前" : "年底前";
	}

	return isSimplified
		? [
				{
					title: "冲动决策",
					description: `${nearTermPeriod}避免在情绪激动或压力大时做重要决定。冷静思考，咨询可靠建议后再行动，以免造成不必要的损失。`,
					icon: "🚫",
					level: "严禁",
					consequence: "可能导致重大失误",
				},
				{
					title: "负面环境",
					description: `${midTermPeriod}期间远离充满负能量的人和环境，避免长期处于消极氛围中。选择积极正面的环境，维持良好运势。`,
					icon: "⚠️",
					level: "避免",
					consequence: "影响个人气场",
				},
				{
					title: "过度劳累",
					description: `从现在到${yearEndPeriod}注意工作与生活平衡，避免过度透支身体和精神。适当休息和放松，保持身心健康状态。`,
					icon: "😵",
					level: "注意",
					consequence: "损害身体健康",
				},
				{
					title: "投机行为",
					description: `接下来几个月避免参与高风险投机活动，包括赌博、投机股票等。稳健理财，避免因贪心造成财务损失。`,
					icon: "🎰",
					level: "禁止",
					consequence: "财务风险增大",
				},
				{
					title: "忽视直觉",
					description: `${yearEndPeriod}前的重要决策不要完全忽视内心直觉和感受。适当相信第六感，但也要结合理性分析，避免错失机会。`,
					icon: "🔮",
					level: "警惕",
					consequence: "错失重要机会",
				},
			]
		: [
				{
					title: "衝動決策",
					description: `${nearTermPeriod}避免在情緒激動或壓力大時做重要決定。冷靜思考，諮詢可靠建議後再行動，以免造成不必要的損失。`,
					icon: "🚫",
					level: "嚴禁",
					consequence: "可能導致重大失誤",
				},
				{
					title: "負面環境",
					description: `${midTermPeriod}期間遠離充滿負能量的人和環境，避免長期處於消極氛圍中。選擇積極正面的環境，維持良好運勢。`,
					icon: "⚠️",
					level: "避免",
					consequence: "影響個人氣場",
				},
				{
					title: "過度勞累",
					description: `從現在到${yearEndPeriod}注意工作與生活平衡，避免過度透支身體和精神。適當休息和放鬆，保持身心健康狀態。`,
					icon: "😵",
					level: "注意",
					consequence: "損害身體健康",
				},
				{
					title: "投機行為",
					description: `接下來幾個月避免參與高風險投機活動，包括賭博、投機股票等。穩健理財，避免因貪心造成財務損失。`,
					icon: "🎰",
					level: "禁止",
					consequence: "財務風險增大",
				},
				{
					title: "忽視直覺",
					description: `${yearEndPeriod}前的重要決策不要完全忽視內心直覺和感受。適當相信第六感，但也要結合理性分析，避免錯失機會。`,
					icon: "🔮",
					level: "警惕",
					consequence: "錯失重要機會",
				},
			];
}

// Create structured prompt for specific suggestion analysis
function createSpecificSuggestionPrompt(userInfo, isSimplified = false) {
	const { birthDateTime, concern, problem, gender } = userInfo;

	// Get current date context
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
	const currentMonthName = `${currentMonth}月`;

	const concernTitles = isSimplified
		? {
				財運: "财务财运",
				事業: "事业发展",
				感情: "感情关系",
				健康: "健康养生",
				學業: "学业成就",
				工作: "工作职场",
			}
		: {
				財運: "財務財運",
				事業: "事業發展",
				感情: "感情關係",
				健康: "健康養生",
				學業: "學業成就",
				工作: "工作職場",
			};

	const concernTitle = concernTitles[concern] || concern;

	const languageInstruction = isSimplified
		? "**重要：请全部使用简体中文输出，不要使用繁体中文。例如：财运（正确）、財運（错误）；建议（正确）、建議（错误）；时间（正确）、時間（错误）**"
		: "**重要：請全部使用繁體中文輸出，不要使用簡體中文。例如：財運（正確）、财运（錯誤）；建議（正確）、建议（錯誤）；時間（正確）、时间（錯誤）**";

	return `请为用户的具体问题提供专业的风水命理建议分析：

${languageInstruction}

【用户资讯】
出生时间：${birthDateTime}
性别：${gender === "male" ? "男性" : "女性"}
关注领域：${concernTitle}
具体问题：${problem}

当前时间：${currentYear}年${currentMonth}月（现在是${currentMonthName}）

【分析要求】
请基于用户的八字命理和具体问题，生成：

五大建议方案：
1. [建议标题]：[具体可行的建议内容，约100字，包含实际操作方法和时间规划]
2. [建议标题]：[具体可行的建议内容，约100字，包含实际操作方法和时间规划]
3. [建议标题]：[具体可行的建议内容，约100字，包含实际操作方法和时间规划]
4. [建议标题]：[具体可行的建议内容，约100字，包含实际操作方法和时间规划]
5. [建议标题]：[具体可行的建议内容，约100字，包含实际操作方法和时间规划]

五大禁忌行为：
1. [禁忌标题]：[必须避免的行为，约100字，说明为什么要避免和可能后果]
2. [禁忌标题]：[必须避免的行为，约100字，说明为什么要避免和可能后果]
3. [禁忌标题]：[必须避免的行为，约100字，说明为什么要避免和可能后果]
4. [禁忌标题]：[必须避免的行为，约100字，说明为什么要避免和可能后果]
5. [禁忌标题]：[必须避免的行为，约100字，说明为什么要避免和可能后果]

**⚠️ 重要时间标注要求（现在是${currentYear}年${currentMonth}月）：**

1. **聚焦未来，不提过去**：
   - ✅ 正确：「接下来的秋末（10月底）」、「即将到来的冬季（11-1月）」
   - ❌ 错误：不要提及已经过去的月份（如3-5月、6-8月等）
   - 所有建议必须面向未来，从当前月份（${currentMonth}月）开始往后

2. **未来时间必须明确标注**：
   - ✅ 正确：「明年春季（2026年3-5月）」、「今年底（12月）」、「明年初（2026年1月）」
   - ✅ 正确：「接下来的冬季（11-1月）」、「10月底前」
   - ❌ 错误：「春季」（不明确）、「6月」（不知道哪一年）
   - 所有未来月份必须标注年份或使用「明年」「今年底」等明确时间副词

3. **明确标注月份范围**：
   - ✅ 正确：「冬季（11-1月）」、「明年春季（2026年3-5月）」、「10月底前」
   - ✅ 正确：「11-12月期间」、「明年1-2月」
   - ❌ 错误：「春季」（没有月份）、「夏天」（时间模糊）
   - 必须提供具体的月份范围，让用户清楚知道何时行动

**时间标注示例：**
建议方案示例：
- 「10月底前完成环境调整，在家中或办公室增加有利元素」
- 「接下来的冬季（11-1月）适合内部整顿，制定明年计划」
- 「今年底（12月）前处理重要事务，把握年度最后机会」
- 「明年春季（2026年3-5月）是展开新计划的最佳时机」
- 「明年初（2026年1-2月）可以启动重要项目」

禁忌行为示例：
- 「10月底前避免冲动决策，重要选择需要深思熟虑」
- 「接下来的两个月（11-12月）不宜进行高风险投资」
- 「今年底前避免与人发生重大冲突」

【格式要求】
- **必须严格按照数字编号格式：1. 2. 3. 4. 5.**
- 每个建议和禁忌都要具体可行
- 内容长度控制在80-120字左右
- 结合八字命理原理
- 针对具体问题提供解决方案
- **所有涉及时间的建议必须遵守上述时间标注要求**
- **从${currentMonth}月开始往后规划，不提过去时间**
- 语言专业但易懂
- ${languageInstruction}
- **必须提供完整的5个建议和5个禁忌，不可少于此数量**

请严格按照上述格式输出，确保内容的专业性、实用性和时间的明确性。

${languageInstruction}`;
}

export async function POST(request) {
	try {
		const { userInfo, locale } = await request.json();

		if (!userInfo) {
			return NextResponse.json(
				{ error: "User information is required" },
				{ status: 400 }
			);
		}

		// Determine language based on locale
		const isSimplified = locale === "china" || locale === "zh-CN";

		// Create the analysis prompt
		const prompt = createSpecificSuggestionPrompt(userInfo, isSimplified);

		console.log("Generated prompt:", prompt);

		// Call DeepSeek AI
		const aiResponse = await callDeepSeekAPI(prompt, isSimplified);

		console.log("AI Response received:", aiResponse);

		// Parse the AI response
		const parsedContent = parseSpecificSuggestionContent(
			aiResponse,
			isSimplified
		);

		// Structure the response
		const title = isSimplified ? "针对性建议" : "針對性建議";
		const subtitlePrefix = isSimplified ? "专门解决：" : "專門解決：";
		const defaultProblem = isSimplified ? "个人关注问题" : "個人關注問題";
		const genderText = isSimplified
			? userInfo.gender === "male"
				? "男性"
				: "女性"
			: userInfo.gender === "male"
				? "男性"
				: "女性";

		const analysisResult = {
			title: title,
			subtitle: `${subtitlePrefix}${userInfo.problem || defaultProblem}`,
			suggestions: parsedContent.suggestions,
			taboos: parsedContent.taboos,
			concern: userInfo.concern,
			problem: userInfo.problem,
			userBirthday: userInfo.birthDateTime,
			userGender: genderText,
			aiResponse: aiResponse,
			prompt: prompt,
		};

		return NextResponse.json({
			success: true,
			data: analysisResult,
		});
	} catch (error) {
		console.error("API Error:", error);

		// Try to get locale from the request body if available
		let isSimplified = false; // Default to Traditional Chinese
		try {
			const body = await request.json();
			const locale = body?.locale;
			isSimplified = locale === "china" || locale === "zh-CN";
		} catch (e) {
			// If we can't parse the request, use default
			console.log(
				"Could not determine locale from error context, using Traditional Chinese"
			);
		}

		const title = isSimplified ? "针对性建议" : "針對性建議";
		const subtitle = isSimplified
			? "基于传统风水命理的一般性建议"
			: "基於傳統風水命理的一般性建議";
		const concernText = isSimplified ? "综合" : "綜合";
		const problemText = isSimplified ? "一般性问题" : "一般性問題";
		const unspecifiedText = isSimplified ? "未指定" : "未指定";
		const defaultContent = isSimplified
			? "使用预设建议内容"
			: "使用預設建議內容";
		const systemText = isSimplified ? "系统预设分析" : "系統預設分析";

		// Return fallback content on error
		const fallbackData = {
			title: title,
			subtitle: subtitle,
			suggestions: generateFallbackSuggestions(isSimplified),
			taboos: generateFallbackTaboos(isSimplified),
			concern: concernText,
			problem: problemText,
			userBirthday: unspecifiedText,
			userGender: unspecifiedText,
			aiResponse: defaultContent,
			prompt: systemText,
		};

		return NextResponse.json({
			success: true,
			data: fallbackData,
			fallback: true,
		});
	}
}
