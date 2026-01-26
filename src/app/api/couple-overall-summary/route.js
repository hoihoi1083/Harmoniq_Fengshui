import { NextResponse } from 'next/server';

/**
 * Couple Overall Summary Analysis API
 * 
 * This API generates a comprehensive relationship summary for couple's feng shui report.
 * It synthesizes data from all couple analyses to create:
 * 1. An 8-12 character relationship catchphrase for 2026
 * 2. Core relationship themes
 * 3. A shareable couple motto/quote
 * 
 * Strategy: EXTRACTIVE (synthesize existing data) not GENERATIVE (create new predictions)
 */

export async function POST(request) {
	try {
		const body = await request.json();
		const {
			locale,
			concernType,
			coupleCoreSuggestionData,
			coupleAnnualData,
			coupleSeasonData,
			coupleSpecificData,
			user1Info,
			user2Info,
		} = body;

		// Validate required data
		if (!coupleCoreSuggestionData) {
			return NextResponse.json(
				{ error: 'Missing required couple analysis data' },
				{ status: 400 }
			);
		}

		const isSimplified = locale === 'zh-CN';

		// Build comprehensive context from all couple analyses
		const contextParts = [];

		// 1. User basic info
		if (user1Info && user2Info) {
			contextParts.push(`【夫妻基本信息】\n男方：${user1Info.birthday || ''}\n女方：${user2Info.birthday || ''}`);
		}

		// 2. Core Couple Suggestions
		if (coupleCoreSuggestionData) {
			if (typeof coupleCoreSuggestionData === 'string') {
				contextParts.push(`【核心感情建議】\n${coupleCoreSuggestionData}`);
			} else {
				Object.entries(coupleCoreSuggestionData).forEach(([category, content]) => {
					contextParts.push(`【${category}】\n${content}`);
				});
			}
		}

		// 3. Annual Analysis
		if (coupleAnnualData) {
			if (typeof coupleAnnualData === 'string') {
				contextParts.push(`【流年運勢】\n${coupleAnnualData}`);
			} else {
				contextParts.push(`【流年運勢】\n${JSON.stringify(coupleAnnualData)}`);
			}
		}

		// 4. Seasonal Analysis
		if (coupleSeasonData) {
			if (typeof coupleSeasonData === 'string') {
				contextParts.push(`【四季相處】\n${coupleSeasonData}`);
			} else {
				contextParts.push(`【四季相處】\n${JSON.stringify(coupleSeasonData)}`);
			}
		}

		// 5. Specific Problem Solutions
		if (coupleSpecificData) {
			if (typeof coupleSpecificData === 'string') {
				contextParts.push(`【具體問題解決】\n${coupleSpecificData}`);
			} else {
				contextParts.push(`【具體問題解決】\n${JSON.stringify(coupleSpecificData)}`);
			}
		}

		const fullContext = contextParts.join('\n\n---\n\n');

		// Prepare prompt for AI
		const systemPrompt = `你是一位資深感情命理師，擅長從多維度夫妻分析中提煉核心洞察，為夫妻創造易於分享的感情總結。

**你的任務**：
基於夫妻的完整命理合盤分析報告，提煉出一個簡潔、有力、易於分享的2026年感情總結。

**重要原則**：
1. **提煉而非創造**：只從已有分析中提取關鍵信息，不要編造新的預測
2. **簡潔有力**：使用精煉的語言，避免冗長
3. **正向激勵**：即使面對挑戰，也要用積極、溫暖的語氣表達
4. **易於分享**：適合夫妻在社交媒體、朋友圈分享的格式
5. **共情語言**：用溫暖、理解的語氣，讓夫妻感受到被理解`;

		const userPrompt = `請基於以下完整的夫妻命理合盤分析報告，為這對夫妻生成一個2026年的感情總結：

${fullContext}

---

請嚴格按照以下JSON格式輸出（不要包含markdown代碼塊標記）：

{
  "keyPhrase": "8-12個字的2026年感情關鍵詞",
  "coreThemes": [
    "第一個核心關係主題（20字內）",
    "第二個核心關係主題（20字內）",
    "第三個核心關係主題（20字內）"
  ],
  "shareableQuote": "一句溫暖感人、適合夫妻分享的感情箴言（30-50字）",
  "yearOverview": "簡要總結2026年的夫妻感情走向（80-120字）"
}

**格式要求**：
1. keyPhrase：必須8-12個字，概括全年感情核心特質（例：「相伴相守，攜手前行」「互助成長，情比金堅」）
2. coreThemes：3個關係主題，各20字內，涵蹈溝通/信任/成長/親密度的核心洞察
3. shareableQuote：30-50字，溫暖正能量，朗朗上口，適合夫妻社交分享
4. yearOverview：80-120字，綜合各方面分析，給出全年感情整體方向

**範例**：
{
  "keyPhrase": "互相成就，共同成長",
  "coreThemes": [
    "溝通需更真誠，傾聽對方心聲",
    "分工要更明確，互補各自優勢",
    "信任需持續建立，化解舊日芥蒂"
  ],
  "shareableQuote": "2026年，不是改變對方，而是理解對方。每一次的包容與支持，都讓感情更加堅固。",
  "yearOverview": "2026年你們的感情將進入深化期。上半年適合處理累積的小摩擦，重建溝通模式；下半年可見關係更加穩固。面對挑戰時記得互相支持，把握關鍵時刻深度溝通，用包容與理解經營這段珍貴的感情，必能攜手走過風雨，迎來更美好的未來。"
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
		const aiContent = deepseekData.choices?.[0]?.message?.content || '';

		console.log('🤖 AI Raw Response:', aiContent);

		// Parse the JSON response
		let parsedData;
		try {
			// Try to extract JSON from markdown code blocks if present
			const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
			                  aiContent.match(/(\{[\s\S]*\})/);
			
			if (jsonMatch) {
				parsedData = JSON.parse(jsonMatch[1]);
			} else {
				throw new Error('No JSON found in response');
			}
		} catch (parseError) {
			console.error('Failed to parse AI response:', parseError);
			console.error('Raw content:', aiContent);
			
			// Return fallback data
			return NextResponse.json({
				success: true,
				data: {
					keyPhrase: '攜手同行，共創未來',
					themes: [
						'溝通是感情的橋樑',
						'理解是相處的基石',
						'信任是關係的根本'
					],
					quote: '2026年，讓我們用愛與理解，共同書寫屬於我們的幸福篇章。',
					yearOverview: '2026年是你們感情深化的一年。珍惜彼此，用心經營，必能收穫更美好的未來。'
				}
			});
		}

		// Map the parsed data to our component's expected format
		const summaryData = {
			keyPhrase: parsedData.keyPhrase || '攜手同行，共創未來',
			themes: parsedData.coreThemes || [
				'溝通是感情的橋樑',
				'理解是相處的基石',
				'信任是關係的根本'
			],
			quote: parsedData.shareableQuote || '2026年，讓我們用愛與理解，共同書寫屬於我們的幸福篇章。',
			yearOverview: parsedData.yearOverview || '2026年是你們感情深化的一年。珍惜彼此，用心經營，必能收穫更美好的未來。'
		};

		console.log('✅ Couple Summary Generated:', summaryData);

		return NextResponse.json({
			success: true,
			data: summaryData
		});

	} catch (error) {
		console.error('Error generating couple overall summary:', error);
		return NextResponse.json(
			{ error: 'Failed to generate couple summary', details: error.message },
			{ status: 500 }
		);
	}
}
