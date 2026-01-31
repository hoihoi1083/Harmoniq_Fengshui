import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

async function callAI(prompt, locale = "zh-TW") {
	// Determine language instruction based on locale
	const languageInstruction =
		locale === "zh-CN"
			? "你是专业的命理师，请根据用户的八字信息、关注领域和具体问题，提供简要的分析和建议。**必须使用简体中文**，绝对禁止繁体字。语气温和专业。"
			: "你是專業的命理師，請根據用戶的八字信息、關注領域和具體問題，提供簡要的分析和建議。**必須使用繁體中文**，絕對禁止簡體字。語氣溫和專業。";

	try {
		const response = await fetch(DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content: languageInstruction,
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 800,
			}),
		});

		if (!response.ok) {
			throw new Error(`AI API error: ${response.status}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	} catch (error) {
		console.error("AI API call failed:", error);
		throw error;
	}
}

export async function POST(request) {
	try {
		const {
			baziData,
			concern,
			problem,
			locale = "zh-TW",
		} = await request.json();

		if (!baziData || !concern || !problem) {
			const errorMsg =
				locale === "zh-CN" ? "缺少必要参数" : "缺少必要參數";
			return NextResponse.json({ error: errorMsg }, { status: 400 });
		}

		console.log("📊 Processing request:", { concern, problem, baziData });

		// Create language-specific prompt
		const languageRequirement =
			locale === "zh-CN"
				? "**必须使用简体中文**，绝对禁止繁体字"
				: "**必須使用繁體中文**，絕對禁止簡體字";

		const closingNote =
			locale === "zh-CN"
				? "💡 更详细分析，基于流年，十神，可参阅报告中的其他相关章节"
				: "💡 更詳細分析，基於流年，十神，可參閱報告中的其他相關章節";

		// Get current year GanZhi
		const currentYear = new Date().getFullYear();
		const ganList = [
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
		const zhiList = [
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
		const zodiacList = [
			"鼠",
			"牛",
			"虎",
			"兔",
			"龍",
			"蛇",
			"馬",
			"羊",
			"猴",
			"雞",
			"狗",
			"豬",
		];
		const zodiacListSimplified = [
			"鼠",
			"牛",
			"虎",
			"兔",
			"龙",
			"蛇",
			"马",
			"羊",
			"猴",
			"鸡",
			"狗",
			"猪",
		];
		const ganIndex = (currentYear - 4) % 10;
		const zhiIndex = (currentYear - 4) % 12;
		const currentYearGanZhi = ganList[ganIndex] + zhiList[zhiIndex];
		const currentYearZodiac =
			locale === "zh-CN"
				? zodiacListSimplified[zhiIndex]
				: zodiacList[zhiIndex];
		const currentYearText = `${currentYear}年${currentYearGanZhi}${currentYearZodiac}年`;

		// Create simple, clear prompt with locale-specific text
		const prompt =
			locale === "zh-CN"
				? `请基于以下信息提供简要分析：

【当前时间】${currentYearText}

八字信息：
年柱：${baziData.year}
月柱：${baziData.month}  
日柱：${baziData.day}
时柱：${baziData.hour}
日主：${baziData.dayMaster}${baziData.dayElement}

关注领域：${concern}
具体问题：${problem}

请提供：
1. 基于八字的简要分析（2-3句话）
2. 针对问题的建议（2-3句话）  
3. 最后必须加上「${closingNote}」

重要要求：
1. ${languageRequirement}
2. 必须准确引用上述八字四柱数据
3. 必须基于实际的五行统计进行分析
4. 针对用户的具体问题，从命理角度解释原因和背景
5. ⚠️ 当涉及时机分析时，必须关注未来年份（${currentYear}年${currentYearGanZhi}年起算），例如：${currentYear}年${currentYearGanZhi}${currentYearZodiac}年、${currentYear + 1}年、${currentYear + 2}年等
6. ⚠️ 绝对禁止提及${currentYear - 2}年、${currentYear - 1}年或过去年份，只能分析当前年份（${currentYear}年）和未来年份
7. 给出1-2个简要的方向性建议（不要太详细）
8. 最后加上备注，说明更详细的分析和解决方案在其他章节中，不要指明具体章节名称
9. 语调要个人化，直接对用户说话
10. 内容要具体，避免空泛的通用建议
11. 时机预测要基于五行流年循环，给出准确年份范围（从${currentYear}年开始）
12. ⚠️ 绝对禁止在分析内容中出现：乙巳、丙戌、壬戌、丙午、壬水等错误信息
13. 结尾必须使用：「${closingNote}」

格式要求：
- ${languageRequirement}
- 必须使用提供的八字信息（${baziData.year}、${baziData.month}、${baziData.day}、${baziData.hour}，日主${baziData.dayMaster}${baziData.dayElement}）
- 内容简洁实用，约150-200字
- 语气亲和专业
- 结尾统一使用指定文案`
				: `請基於以下信息提供簡要分析：

【當前時間】${currentYearText}

八字信息：
年柱：${baziData.year}
月柱：${baziData.month}  
日柱：${baziData.day}
時柱：${baziData.hour}
日主：${baziData.dayMaster}${baziData.dayElement}

關注領域：${concern}
具體問題：${problem}

請提供：
1. 基於八字的簡要分析（2-3句話）
2. 針對問題的建議（2-3句話）  
3. 最後必須加上「${closingNote}」

重要要求：
1. ${languageRequirement}
2. 必須準確引用上述八字四柱數據
3. 必須基於實際的五行統計進行分析
4. 針對用戶的具體問題，從命理角度解釋原因和背景
5. ⚠️ 當涉及時機分析時，必須關注未來年份（${currentYear}年${currentYearGanZhi}年起算），例如：${currentYear}年${currentYearGanZhi}${currentYearZodiac}年、${currentYear + 1}年、${currentYear + 2}年等
6. ⚠️ 絕對禁止提及${currentYear - 2}年、${currentYear - 1}年或過去年份，只能分析當前年份（${currentYear}年）和未來年份
7. 給出1-2個簡要的方向性建議（不要太詳細）
8. 最後加上備註，說明更詳細的分析和解決方案在其他章節中，不要指明具體章節名稱
9. 語調要個人化，直接對用戶說話
10. 內容要具體，避免空泛的通用建議
11. 時機預測要基於五行流年循環，給出準確年份範圍（從${currentYear}年開始）
12. ⚠️ 絕對禁止在分析內容中出現：乙巳、丙戌、壬戌、丙午、壬水等錯誤信息
13. 結尾必須使用：「${closingNote}」

格式要求：
- ${languageRequirement}
- 必須使用提供的八字信息（${baziData.year}、${baziData.month}、${baziData.day}、${baziData.hour}，日主${baziData.dayMaster}${baziData.dayElement}）
- 內容簡潔實用，約150-200字
- 語氣親和專業
- 結尾統一使用指定文案`;

		const aiResponse = await callAI(prompt, locale);

		console.log("✅ AI response received:", aiResponse.substring(0, 200));

		const titleSuffix = locale === "zh-CN" ? "分析指导" : "分析指導";
		const solution = {
			title: `${concern}${titleSuffix}`,
			content: aiResponse.trim(),
		};

		return NextResponse.json({
			success: true,
			solution: solution,
		});
	} catch (error) {
		console.error("API Error:", error);
		const errorMsg =
			error.locale === "zh-CN" ? "服务暂时不可用" : "服務暫時不可用";
		return NextResponse.json({ error: errorMsg }, { status: 500 });
	}
}
