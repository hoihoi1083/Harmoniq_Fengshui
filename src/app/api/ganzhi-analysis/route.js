import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// DeepSeek AI API 調用
async function callDeepSeekAPI(messages, options = {}) {
	try {
		const maxTokens = options.max_tokens || 2000;
		console.log("📊 DeepSeek API call with max_tokens:", maxTokens);

		const response = await fetch(DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({
				model: "deepseek-chat",
				messages: messages,
				temperature: options.temperature || 0.7,
				max_tokens: maxTokens,
				stream: false,
			}),
		});

		if (!response.ok) {
			throw new Error(`DeepSeek API error: ${response.status}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	} catch (error) {
		console.error("DeepSeek API call failed:", error);
		throw new Error("AI分析服務暫時不可用，請稍後再試");
	}
}

// Helper function to calculate yearly stems and branches
function getYearlyStems(year) {
	const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
	const branches = [
		"子",
		"丑",
		"寅",
		"卯",
		"辰",
		"巳",
		"午",
		"未",
		"申",
		"酉",
		"戌",
		"亥",
	];
	const stemIndex = (year - 4) % 10;
	const branchIndex = (year - 4) % 12;
	return { stem: stems[stemIndex], branch: branches[branchIndex] };
}

// Generate BaZi from birthday (simplified calculation)
function generateBaZi(birthDateTime) {
	if (!birthDateTime) return null;

	try {
		const date = new Date(birthDateTime);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hour = date.getHours();

		// This is a simplified BaZi calculation - in reality, this would be much more complex
		const yearGanZhi = getYearlyStems(year);

		// Simplified month, day, hour calculations (real BaZi calculation would be more accurate)
		const stems = [
			"甲",
			"乙",
			"丙",
			"丁",
			"戊",
			"己",
			"庚",
			"辛",
			"壬",
			"癸",
		];
		const branches = [
			"子",
			"丑",
			"寅",
			"卯",
			"辰",
			"巳",
			"午",
			"未",
			"申",
			"酉",
			"戌",
			"亥",
		];

		const monthStem = stems[(month - 1) % 10];
		const monthBranch = branches[(month - 1) % 12];
		const dayStem = stems[(day - 1) % 10];
		const dayBranch = branches[(day - 1) % 12];
		const hourStem = stems[Math.floor(hour / 2) % 10];
		const hourBranch = branches[Math.floor(hour / 2) % 12];

		return {
			year: `${yearGanZhi.stem}${yearGanZhi.branch}`,
			month: `${monthStem}${monthBranch}`,
			day: `${dayStem}${dayBranch}`,
			hour: `${hourStem}${hourBranch}`,
		};
	} catch (error) {
		console.error("BaZi calculation error:", error);
		return null;
	}
}

export async function POST(request) {
	try {
		const {
			userInfo,
			currentYear = 2025,
			locale = "zh-TW",
		} = await request.json();

		console.log("🌐 GanZhi API received locale:", locale);

		if (!userInfo) {
			return NextResponse.json(
				{ error: "用戶信息缺失" },
				{ status: 400 }
			);
		}

		const concern = userInfo.concern || "事業";
		const problem = userInfo.problem || "";
		const birthday = userInfo.birthDateTime || "";
		const gender = userInfo.gender || "male";

		// Generate BaZi
		const baZi = generateBaZi(birthday);
		const yearGanZhi = getYearlyStems(currentYear);

		// Locale-aware text
		const languageInstruction =
			locale === "zh-CN"
				? "**重要：你必须将所有输出内容（包括标题、描述、效应说明等所有文字）全部使用简体中文。不要使用繁体字。**"
				: "**重要：請使用繁體中文回應。**";

		const systemPromptBase =
			locale === "zh-CN"
				? "你是一位资深八字命理师，精通干支作用与流年互动分析。请根据用户的八字和关注领域提供专业的流年干支作用分析。"
				: "你是一位資深八字命理師，精通干支作用與流年互動分析。請根據用戶的八字和關注領域提供專業的流年干支作用分析。";

		const analysisRequirements =
			locale === "zh-CN"
				? `分析要求：
1. 必须基于实际的干支五行生克制化原理
2. 针对用户具体关注的${concern}领域提供针对性分析
3. 结合流年${currentYear}年（${yearGanZhi.stem}${yearGanZhi.branch}）的特性
4. 提供具体的实际表现和建议
5. 重要时间标示规则：当前是${currentYear}年${new Date().getMonth() + 1}月，提及未来月份时必须明确标示"明年"，使用季节词汇时须注明具体月份范围

${languageInstruction}
请以专业但易懂的方式回应。`
				: `分析要求：
1. 必須基於實際的干支五行生克制化原理
2. 針對用戶具體關注的${concern}領域提供針對性分析
3. 結合流年${currentYear}年（${yearGanZhi.stem}${yearGanZhi.branch}）的特性
4. 提供具體的實際表現和建議
5. 重要時間標示規則：當前是${currentYear}年${new Date().getMonth() + 1}月，提及未來月份時必須明確標示"明年"，使用季節詞彙時須註明具體月份範圍

${languageInstruction}
請以專業但易懂的方式回應。`;

		const systemPrompt = `${systemPromptBase}

${analysisRequirements}`;

		const genderText =
			locale === "zh-CN"
				? gender === "male"
					? "男性"
					: "女性"
				: gender === "male"
					? "男性"
					: "女性";

		const needCalculation =
			locale === "zh-CN" ? "需要进一步计算" : "需要進一步計算";
		const overallFortune = locale === "zh-CN" ? "整体运势" : "整體運勢";

		const userPrompt =
			locale === "zh-CN"
				? `请分析以下信息：

客户资料：
- 出生时间：${birthday}
- 性别：${genderText}
- 八字：${baZi ? `${baZi.year} ${baZi.month} ${baZi.day} ${baZi.hour}` : needCalculation}
- 关注领域：${concern}
- 具体问题：${problem || overallFortune}
- 当前年份：${currentYear}年（${yearGanZhi.stem}${yearGanZhi.branch}）

**重要格式要求**：请严格按照以下markdown格式回应：

### 1. 【流年干支作用】
分析${currentYear}年${yearGanZhi.stem}${yearGanZhi.branch}对原局的整体作用...

### 2. 【天干${yearGanZhi.stem}效应】
天干${yearGanZhi.stem}为**正官**（示例）
1. **职权提升**：具体分析...
2. **合庚减泄**：具体分析...
3. **官星透出**：具体分析...

### 3. 【地支${yearGanZhi.branch}效应】
地支${yearGanZhi.branch}为**偏印**（示例）
1. **学习能力**：具体分析...
2. **创意思维**：具体分析...
3. **人际变化**：具体分析...

### 4. 【实际表现】
在${concern}领域的具体表现：
- 具体会在哪些时间点或情况下出现变化（注意：当前是${new Date().getMonth() + 1}月，如提及未来月份请明确标示"明年"或具体月份范围）
- 实际的影响程度和表现形式
- 可能遇到的具体情况或挑战
- 如使用季节或其他时间词汇，请明确指出对应的具体月份（例：春季指明年3-5月）

### 5. 【注意事项】
**风险提醒**：
针对${concern}领域可能出现的具体风险，包括：
- 时间节点上的注意事项
- 具体会在哪些时间点或情况下出现变化（注意：当前是${new Date().getMonth() + 1}月，如提及未来月份请明确标示"明年"或具体月份范围）
- 如使用季节或其他时间词汇，请明确指出对应的具体月份（例：春季指明年3-5月）
- 可能遇到的困难或障碍
- 需要避免的行为或决策

**建议指引**：
针对${concern}领域的具体建议：
- 最佳行动时机和策略
- 具体会在哪些时间点或情况下出现变化（注意：当前是${new Date().getMonth() + 1}月，如提及未来月份请明确标示"明年"或具体月份范围）
- 如使用季节或其他时间词汇，请明确指出对应的具体月份（例：春季指明年3-5月）
- 如何化解不利因素
- 具体的改善方法和步骤

**总结要点**：
结合八字和流年特点，总结${concern}在${currentYear}年的整体运势走向，提供核心建议和关键提醒。

**重要提醒**：以上5个部分（流年干支作用、天干效应、地支效应、实际表现、注意事项）已经包含所有必要内容，请勿在【注意事项】之后再添加额外的"建议"或"总结"段落。所有建议内容应整合在【注意事项】的**建议指引**中，所有总结内容应整合在【注意事项】的**总结要点**中。

请确保每个部分都针对${concern}领域提供具体、实用的内容，避免使用通用的建议。`
				: `請分析以下信息：

客戶資料：
- 出生時間：${birthday}
- 性別：${genderText}
- 八字：${baZi ? `${baZi.year} ${baZi.month} ${baZi.day} ${baZi.hour}` : needCalculation}
- 關注領域：${concern}
- 具體問題：${problem || overallFortune}
- 當前年份：${currentYear}年（${yearGanZhi.stem}${yearGanZhi.branch}）

**重要格式要求**：請嚴格按照以下markdown格式回應：

### 1. 【流年干支作用】
分析${currentYear}年${yearGanZhi.stem}${yearGanZhi.branch}對原局的整體作用...

### 2. 【天干${yearGanZhi.stem}效應】
天干${yearGanZhi.stem}為**正官**（示例）
1. **職權提升**：具體分析...
2. **合庚減洩**：具體分析...
3. **官星透出**：具體分析...

### 3. 【地支${yearGanZhi.branch}效應】
地支${yearGanZhi.branch}為**偏印**（示例）
1. **學習能力**：具體分析...
2. **創意思維**：具體分析...
3. **人際變化**：具體分析...

### 4. 【實際表現】
在${concern}領域的具體表現：
- 具體會在哪些時間點或情況下出現變化（注意：當前是${new Date().getMonth() + 1}月，如提及未來月份請明確標示"明年"或具體月份範圍）
- 實際的影響程度和表現形式
- 可能遇到的具體情況或挑戰
- 如使用季節或其他時間詞彙，請明確指出對應的具體月份（例：春季指明年3-5月）

### 5. 【注意事項】
**風險提醒**：
針對${concern}領域可能出現的具體風險，包括：
- 時間節點上的注意事項
- 具體會在哪些時間點或情況下出現變化（注意：當前是${new Date().getMonth() + 1}月，如提及未來月份請明確標示"明年"或具體月份範圍）
- 如使用季節或其他時間詞彙，請明確指出對應的具體月份（例：春季指明年3-5月）
- 可能遇到的困難或障礙
- 需要避免的行為或決策

**建議指引**：
針對${concern}領域的具體建議：
- 最佳行動時機和策略
- 具體會在哪些時間點或情況下出現變化（注意：當前是${new Date().getMonth() + 1}月，如提及未來月份請明確標示"明年"或具體月份範圍）
- 如使用季節或其他時間詞彙，請明確指出對應的具體月份（例：春季指明年3-5月）
- 如何化解不利因素
- 具體的改善方法和步驟

**總結要點**：
結合八字和流年特點，總結${concern}在${currentYear}年的整體運勢走向，提供核心建議和關鍵提醒。

**重要提醒**：以上5個部分（流年干支作用、天干效應、地支效應、實際表現、注意事項）已經包含所有必要內容，請勿在【注意事項】之後再添加額外的"建議"或"總結"段落。所有建議內容應整合在【注意事項】的**建議指引**中，所有總結內容應整合在【注意事項】的**總結要點**中。

請確保每個部分都針對${concern}領域提供具體、實用的內容，避免使用通用的建議。`;

		console.log("🚀 Calling DeepSeek API for GanZhi analysis...");
		console.log("📝 Language instruction:", languageInstruction);

		const aiContent = await callDeepSeekAPI(
			[
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: userPrompt,
				},
			],
			{
				max_tokens: 4000, // Increased from 2000 to allow complete 5-section response
				temperature: 0.7,
			}
		);

		console.log("✅ AI GanZhi analysis completed");

		return NextResponse.json({
			success: true,
			analysis: aiContent,
			baZi: baZi,
			yearGanZhi: yearGanZhi,
			userInfo: {
				concern,
				problem,
				birthday,
				gender,
			},
		});
	} catch (error) {
		console.error("💥 GanZhi Analysis API Error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "生成干支分析時發生錯誤",
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
