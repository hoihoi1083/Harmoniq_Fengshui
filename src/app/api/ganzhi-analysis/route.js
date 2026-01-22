import { NextResponse } from "next/server";
import { convertToSimplified } from "@/utils/chineseConverter";

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
			currentYear = new Date().getFullYear(),
			locale = "zh-TW",
		} = await request.json();

		console.log("🌐 GanZhi API received locale:", locale);

		if (!userInfo) {
			return NextResponse.json(
				{ error: "用戶信息缺失" },
				{ status: 400 },
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
天干${yearGanZhi.stem}触发三重效应
1. **职权提升**：具体分析...
2. **合庚减泄**：具体分析...
3. **官星透出**：具体分析...

### 3. 【地支${yearGanZhi.branch}效应】
地支${yearGanZhi.branch}为**偏印**（示例）
地支${yearGanZhi.branch}触发三重效应
1. **学习能力**：具体分析...
2. **创意思维**：具体分析...
3. **人际变化**：具体分析...

### 【流年实际表现】
**重要：此部分请综合天干与地支的影响，提供全年完整的实际表现分析，按时间顺序（年初到年尾）呈现。**

在${concern}领域的具体表现：
- **时间点与变化**：从年初到年尾，分阶段说明不同时期的变化（例如：年初受天干影响如何，年中受地支影响如何，某特定月份的关键时点）
- **影响程度与形式**：整体影响的程度和具体表现方式
- **可能情况与挑战**：全年可能遇到的主要情况或挑战

**格式要求**：
1. 必须使用子标题如「- 时间点与变化：」「- 影响程度与形式：」「- 可能情况与挑战：」
2. 按时间顺序整合天干和地支的影响，形成完整的全年分析
3. 注意：当前是${new Date().getMonth() + 1}月，如提及未来月份请明确标示"明年"或具体月份范围
4. 如使用季节词汇，请明确指出对应的具体月份（例：春季指明年3-5月）

### 4. 【注意事项】
风险
针对${concern}领域可能出现的具体风险，包括：
- 时间节点上的注意事项
- 具体会在哪些时间点或情况下出现变化（注意：当前是${new Date().getMonth() + 1}月，如提及未来月份请明确标示"明年"或具体月份范围）
- 如使用季节或其他时间词汇，请明确指出对应的具体月份（例：春季指明年3-5月）
- 可能遇到的困难或障碍
- 需要避免的行为或决策

建议
针对${concern}领域的具体建议：
- 最佳行动时机和策略
- 具体会在哪些时间点或情况下出现变化（注意：当前是${new Date().getMonth() + 1}月，如提及未来月份请明确标示"明年"或具体月份范围）
- 如使用季节或其他时间词汇，请明确指出对应的具体月份（例：春季指明年3-5月）
- 如何化解不利因素
- 具体的改善方法和步骤

总结
结合八字和流年特点，总结${concern}在${currentYear}年的整体运势走向，提供核心建议和关键提醒。

**重要提醒**：以上4个部分（流年干支作用、天干效应、地支效应、注意事项）已经包含所有必要内容，请勿在【注意事项】之后再添加额外的"建议"或"总结"段落。所有建议内容应整合在【注意事项】的**建议**中，所有总结内容应整合在【注意事项】的**总结**中。

**严格禁止**：绝对不可在任何地方提及"2025年"，当前分析年份为${currentYear}年（${yearGanZhi.stem}${yearGanZhi.branch}年），所有总结必须明确写"${currentYear}年"。

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
天干${yearGanZhi.stem}觸發三重效應
1. **職權提升**：具體分析...
2. **合庚減洩**：具體分析...
3. **官星透出**：具體分析...

### 3. 【地支${yearGanZhi.branch}效應】
地支${yearGanZhi.branch}為**偏印**（示例）
地支${yearGanZhi.branch}觸發三重效應
1. **學習能力**：具體分析...
2. **創意思維**：具體分析...
3. **人際變化**：具體分析...

### 【流年實際表現】
**重要：此部分請綜合天干與地支的影響，提供全年完整的實際表現分析，按時間順序（年初到年尾）呈現。必須包含具體生活場景示例。**

在${concern}領域的具體表現：
- **時間點與變化**：從年初到年尾，分階段說明不同時期的變化（例如：年初受天干影響如何，年中受地支影響如何，某特定月份的關鍵時點）
  💡 實際場景：1-3月工作機會增多可主動爭取，6-8月宜穩健保守避免冒進，10-12月適合總結規劃明年
- **影響程度與形式**：整體影響的程度和具體表現方式
  💡 實際場景：上半年人際互動頻繁需注意溝通技巧，下半年財務波動大需做好預算控制
- **可能情況與挑戰**：全年可能遇到的主要情況或挑戰
  💡 實際場景：3月可能有職位調動機會需慎重評估，7月注意健康檢查，11月處理家庭重要事務

**格式要求**：
1. 必須使用子標題如「- 時間點與變化：」「- 影響程度與形式：」「- 可能情況與挑戰：」
2. 每個分析點後必須提供 💡 實際場景，包含2-3個具體時間點的可執行建議
3. 按時間順序整合天干和地支的影響，形成完整的全年分析
4. 注意：當前是${new Date().getMonth() + 1}月，如提及未來月份請明確標示"明年"或具體月份範圍
5. 如使用季節詞彙，請明確指出對應的具體月份（例：春季指明年3-5月）

### 4. 【注意事項】
風險
針對${concern}領域可能出現的具體風險，包括：
- 時間節點上的注意事項
- 具體會在哪些時間點或情況下出現變化（注意：當前是${new Date().getMonth() + 1}月，如提及未來月份請明確標示"明年"或具體月份範圍）
- 如使用季節或其他時間詞彙，請明確指出對應的具體月份（例：春季指明年3-5月）
- 可能遇到的困難或障礙
- 需要避免的行為或決策

建議
針對${concern}領域的具體建議：
- **最佳行動時機和策略**：具體說明最佳時機（注意：當前是${new Date().getMonth() + 1}月，如提及未來月份請明確標示"明年"或具體月份範圍，如使用季節詞彙請明確指出對應月份）
- **如何化解不利因素**：具體化解方法
- **具體的改善方法和步驟**：可執行的具體步驟

**━━━━━━ 重要：這是整個分析的結尾 ━━━━━━**

**🚫 絕對禁止規則**：
1. 【注意事項】的"建議"部分是整個分析的**最後一個部分**
2. 寫完"建議"的最後一個字後，**立即停筆**，不要添加任何內容
3. **禁止**添加以下任何內容：
   ❌ 任何形式的"建議"標題（如：建議、財運提升建議、總結性建議等）
   ❌ 任何形式的"總結"段落
   ❌ 任何額外的說明文字
   ❌ 任何收尾語句
4. 如果你發現自己在寫第二次"建議"或"總結"，請立即刪除

**✅ 正確結構**（只有這4個部分，沒有其他）：
第1部分：【流年干支作用】
第2部分：【天干XX效應】
第3部分：【地支XX效應】
第4部分：【注意事項】- 包含"風險"和"建議"兩個小節，然後立即結束

**嚴格禁止**：不可提及"2025年"，當前分析年份為${currentYear}年（${yearGanZhi.stem}${yearGanZhi.branch}年）。`;

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
			},
		);

		console.log("✅ AI GanZhi analysis completed");

		// Convert to Simplified Chinese if needed
		let finalContent = aiContent;
		if (locale === "zh-CN") {
			console.log(
				"🔄 Converting Traditional Chinese to Simplified Chinese...",
			);
			console.log(
				"📝 Sample BEFORE conversion:",
				aiContent.substring(0, 200),
			);
			finalContent = convertToSimplified(aiContent);
			console.log(
				"📝 Sample AFTER conversion:",
				finalContent.substring(0, 200),
			);
			console.log("✅ Conversion completed");
		}

		// Log the COMPLETE AI response for debugging
		console.log("=".repeat(80));
		console.log("📋 COMPLETE AI RESPONSE (Full Text):");
		console.log("=".repeat(80));
		console.log(finalContent);
		console.log("=".repeat(80));
		console.log(`📊 Total length: ${finalContent.length} characters`);
		console.log("=".repeat(80));

		return NextResponse.json({
			success: true,
			analysis: finalContent,
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
			{ status: 500 },
		);
	}
}
