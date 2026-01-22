import { NextResponse } from 'next/server';

/**
 * Overall Summary Analysis API
 * 
 * This API generates a comprehensive life stage summary for the user's feng shui report.
 * It synthesizes data from all previous analyses to create:
 * 1. An 8-12 character catchphrase for 2026
 * 2. Core themes across life areas
 * 3. A shareable inspirational quote
 * 
 * Strategy: EXTRACTIVE (synthesize existing data) not GENERATIVE (create new predictions)
 */

export async function POST(request) {
	try {
		const body = await request.json();
		const {
			locale,
			concernType,
			questionFocusData,
			coreSuggestionData,
			ganzhiData,
			specificSuggestionData,
		} = body;

		// Validate required data
		if (!questionFocusData || !coreSuggestionData) {
			return NextResponse.json(
				{ error: 'Missing required analysis data' },
				{ status: 400 }
			);
		}

		const isSimplified = locale === 'zh-CN';

		// Build comprehensive context from all analyses
		const contextParts = [];

		// 1. Question Focus Analysis
		if (questionFocusData) {
			contextParts.push(`【用戶關注焦點】\n${questionFocusData}`);
		}

		// 2. Core Suggestions by category
		if (coreSuggestionData) {
			Object.entries(coreSuggestionData).forEach(([category, content]) => {
				contextParts.push(`【${category}建議】\n${content}`);
			});
		}

		// 3. GanZhi Analysis
		if (ganzhiData) {
			if (ganzhiData.tianGan) {
				contextParts.push(`【天干分析】\n${ganzhiData.tianGan}`);
			}
			if (ganzhiData.diZhi) {
				contextParts.push(`【地支分析】\n${ganzhiData.diZhi}`);
			}
			if (ganzhiData.practicalResults) {
				contextParts.push(`【流年實際表現】\n${ganzhiData.practicalResults}`);
			}
		}

		// 4. Specific Suggestions
		if (specificSuggestionData) {
			Object.entries(specificSuggestionData).forEach(([category, content]) => {
				contextParts.push(`【${category}具體建議】\n${content}`);
			});
		}

		const fullContext = contextParts.join('\n\n---\n\n');

		// Prepare prompt for AI
		const systemPrompt = `你是一位資深命理師，擅長從多維度分析中提煉核心洞察，為用戶創造易於分享的人生總結。

**你的任務**：
基於用戶的完整命理分析報告，提煉出一個簡潔、有力、易於分享的2026年人生總結。

**重要原則**：
1. **提煉而非創造**：只從已有分析中提取關鍵信息，不要編造新的預測
2. **簡潔有力**：使用精煉的語言，避免冗長
3. **正向激勵**：即使面對挑戰，也要用積極的語氣表達
4. **易於分享**：適合在社交媒體、朋友圈分享的格式`;

		const userPrompt = `請基於以下完整的命理分析報告，為用戶生成一個2026年的人生總結：

${fullContext}

---

請嚴格按照以下JSON格式輸出（不要包含markdown代碼塊標記）：

{
  "keyPhrase": "8-12個字的2026年關鍵詞",
  "coreThemes": [
    "第一個核心主題（20字內）",
    "第二個核心主題（20字內）",
    "第三個核心主題（20字內）"
  ],
  "shareableQuote": "一句激勵人心、適合分享的金句（30-50字）",
  "yearOverview": "簡要總結2026年的整體運勢走向（80-120字）"
}

**格式要求**：
1. keyPhrase：必須8-12個字，概括全年核心特質（例：「穩中求進，蓄勢待發」）
2. coreThemes：3個主題，各20字內，涵蓋事業/財運/感情/健康的核心洞察
3. shareableQuote：30-50字，正能量，朗朗上口，適合社交分享
4. yearOverview：80-120字，綜合各方面分析，給出全年整體方向

**範例**：
{
  "keyPhrase": "厚積薄發，穩健前行",
  "coreThemes": [
    "事業需韜光養晦，積累實力",
    "財運宜穩健理財，避免投機",
    "感情需真誠溝通，培養默契"
  ],
  "shareableQuote": "2026年，不是衝鋒的時刻，而是蓄勢的階段。每一分耕耘，都是未來豐收的種子。",
  "yearOverview": "2026年整體呈現穩中有進的態勢。上半年適合打好基礎、積累資源，下半年可見成效顯現。事業上需低調務實，財運宜守不宜攻，感情需用心經營。把握住年中關鍵時機，腳踏實地前行，必能為未來鋪就堅實之路。"
}`;

		// Call DeepSeek API
		const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				temperature: 0.7,
				max_tokens: 1000,
			}),
		});

		if (!deepseekResponse.ok) {
			const errorData = await deepseekResponse.json();
			console.error('DeepSeek API Error:', errorData);
			return NextResponse.json(
				{ error: 'AI service error', details: errorData },
				{ status: 500 }
			);
		}

		const deepseekData = await deepseekResponse.json();
		let aiResponse = deepseekData.choices[0]?.message?.content || '';

		// Clean response - remove markdown code blocks if present
		aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

		// Parse JSON response
		let summaryData;
		try {
			summaryData = JSON.parse(aiResponse);
		} catch (parseError) {
			console.error('Failed to parse AI response as JSON:', aiResponse);
			return NextResponse.json(
				{ error: 'Invalid AI response format', raw: aiResponse },
				{ status: 500 }
			);
		}

		// Validate response structure
		if (!summaryData.keyPhrase || !summaryData.coreThemes || !summaryData.shareableQuote || !summaryData.yearOverview) {
			return NextResponse.json(
				{ error: 'Incomplete AI response', data: summaryData },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: summaryData,
		});

	} catch (error) {
		console.error('Overall Summary API Error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}
