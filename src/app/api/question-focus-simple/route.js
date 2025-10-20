import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

async function callAI(prompt) {
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
						content:
							"你是專業的命理師，請根據用戶的八字信息、關注領域和具體問題，提供簡要的分析和建議。**必須使用繁體中文**，絕對禁止簡體字。語氣溫和專業。",
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
		const { baziData, concern, problem } = await request.json();

		if (!baziData || !concern || !problem) {
			return NextResponse.json(
				{ error: "缺少必要參數" },
				{ status: 400 }
			);
		}

		console.log("📊 Processing request:", { concern, problem, baziData });

		// Create simple, clear prompt
		const prompt = `請基於以下信息提供簡要分析：

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
3. 最後必須加上「💡 更詳細分析，基於流年，十神，可參閱報告中的其他相關章節」

重要要求：
1. **必須使用繁體中文**，絕對禁止簡體字
2. 必須準確引用上述八字四柱數據
3. 必須基於實際的五行統計進行分析
4. 針對用戶的具體問題，從命理角度解釋原因和背景
5. 當涉及時機分析時，必須提供具體年份（例如：2026年丙午火年、2027年丁未火土年等）
6. 給出1-2個簡要的方向性建議（不要太詳細）
7. 最後加上備註，說明更詳細的分析和解決方案在其他章節中，不要指明具體章節名稱
8. 語調要個人化，直接對用戶說話
9. 內容要具體，避免空泛的通用建議
10. 時機預測要基於五行流年循環，給出準確年份範圍
11. ⚠️ 絕對禁止在分析內容中出現：乙巳、丙戌、壬戌、丙午、壬水等錯誤信息
12. 結尾必須使用：「💡 更詳細分析，基於流年，十神，可參閱報告中的其他相關章節」

格式要求：
- **必須使用繁體中文**，禁止任何簡體字
- 必須使用提供的八字信息（${baziData.year}、${baziData.month}、${baziData.day}、${baziData.hour}，日主${baziData.dayMaster}${baziData.dayElement}）
- 內容簡潔實用，約150-200字
- 語氣親和專業
- 結尾統一使用指定文案`;

		const aiResponse = await callAI(prompt);

		console.log("✅ AI response received:", aiResponse.substring(0, 200));

		const solution = {
			title: `${concern}分析指導`,
			content: aiResponse.trim(),
		};

		return NextResponse.json({
			success: true,
			solution: solution,
		});
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json({ error: "服務暫時不可用" }, { status: 500 });
	}
}
