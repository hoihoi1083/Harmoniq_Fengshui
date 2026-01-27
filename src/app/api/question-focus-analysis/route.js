import { NextResponse } from "next/server";
import getWuxingData from "@/lib/nayin.js"; // Use canonical Ba Zi calculator

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// Calculate accurate Ba Zi using canonical nayin.js library
function calculateAccurateBaZi(birthDateTime, gender = "male") {
	try {
		// Handle missing time by defaulting to 12:00 (noon)
		let fullDateTime = birthDateTime;
		if (
			typeof birthDateTime === "string" &&
			!birthDateTime.includes("T") &&
			!birthDateTime.includes(" ")
		) {
			fullDateTime = `${birthDateTime} 12:00`;
		}

		// Use canonical getWuxingData for accurate Ba Zi calculation
		const wuxingData = getWuxingData(fullDateTime, gender);

		// ✅ DEBUG: Log the Ba Zi calculation result
		console.log("🔍 QuestionFocus API - Ba Zi calculation result:");
		console.log("Input:", { fullDateTime, gender });
		console.log("Output:", {
			year: wuxingData?.year,
			month: wuxingData?.month,
			day: wuxingData?.day,
			hour: wuxingData?.hour,
			dayMaster: wuxingData?.dayStem,
			dayElement: wuxingData?.dayStemWuxing,
		});

		if (!wuxingData) {
			console.error("getWuxingData returned null for:", fullDateTime);
			return null;
		}

		// Extract element counts from the canonical wuxingScale
		const elementCount = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };

		// Parse the wuxingScale string: "金:0.00%，木:37.50%，水:12.50%，火:12.50%，土:37.50%"
		if (wuxingData.wuxingScale) {
			const matches = wuxingData.wuxingScale.match(
				/([金木水火土]):(\d+\.?\d*)%/g,
			);
			if (matches) {
				matches.forEach((match) => {
					const [element, percentage] = match.split(":");
					const percent = parseFloat(percentage);
					// Convert percentage to rough count (assuming 8 total positions)
					elementCount[element] = Math.round((percent / 100) * 8);
				});
			}
		}

		// Determine strongest and weakest elements based on actual percentages
		const sortedElements = Object.entries(elementCount).sort(
			([, a], [, b]) => b - a,
		);
		const strongestElements = sortedElements
			.filter(([, count]) => count > 0)
			.slice(0, 2)
			.map(([el]) => el);
		const weakestElements = sortedElements
			.filter(([, count]) => count === 0)
			.map(([el]) => el);

		// If no elements are zero, take the lowest ones
		if (weakestElements.length === 0) {
			weakestElements.push(...sortedElements.slice(-2).map(([el]) => el));
		}

		return {
			year: wuxingData.year,
			month: wuxingData.month,
			day: wuxingData.day,
			hour: wuxingData.hour,
			dayMaster: wuxingData.dayStem,
			dayElement: wuxingData.dayStemWuxing,
			yearElement: wuxingData.yearStemWuxing,
			elementCount,
			strongestElements,
			weakestElements,
			// Additional analysis data using canonical structure
			pillars: {
				year: {
					stem: wuxingData.yearStem,
					branch: wuxingData.yearBranch,
					element: wuxingData.yearStemWuxing,
				},
				month: {
					stem: wuxingData.monthStem,
					branch: wuxingData.monthBranch,
					element: wuxingData.monthStemWuxing,
				},
				day: {
					stem: wuxingData.dayStem,
					branch: wuxingData.dayBranch,
					element: wuxingData.dayStemWuxing,
				},
				hour: {
					stem: wuxingData.hourStem,
					branch: wuxingData.hourBranch,
					element: wuxingData.hourStemWuxing,
				},
			},
		};
	} catch (error) {
		console.error("BaZi calculation error:", error);
		return null;
	}
}

// DeepSeek AI API 調用
async function callDeepSeekAPI(messages, options = {}) {
	try {
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
				max_tokens: options.max_tokens || 1000,
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
		throw error;
	}
}

// Generate personalized solution based on user's problem and concern
async function generatePersonalizedSolution(userInfo) {
	const { problem, concern, name, birthday, gender } = userInfo;

	// Calculate accurate Ba Zi first using canonical library
	const baziData = calculateAccurateBaZi(birthday, gender || "male");

	if (!baziData) {
		console.error("Failed to calculate Ba Zi for:", birthday);
		// Fall back to basic analysis without Ba Zi details
	}

	// Create system prompt for professional fortune teller
	const systemPrompt = `你是一位資深的命理師，專精八字、風水和人生指導，擁有30年的實戰經驗。
	
請根據用戶的準確八字信息、具體問題和關注領域，提供個人化的簡要分析和方向性建議。

當前年份：2026年（丙午年 - 火火年）

十年天干地支循環參考（2020-2029）：
2020庚子(金水)、2021辛丑(金土)、2022壬寅(水木)、2023癸卯(水木)、2024甲辰(木土)、2025乙巳(木火)、2026丙午(火火)、2027丁未(火土)、2028戊申(土金)、2029己酉(土金)

要求：
1. 回答必須使用繁體中文
2. **共情性語言要求**：
   a) 開場必須先共情再分析，根據用戶問題選擇合適的共情開場：
      • 財務壓力 → "財務壓力確實讓人喘不過氣，這種焦慮感我完全理解。"
      • 失業/求職 → "求職的不確定性確實很煎熬，您的焦慮是很正常的。"
      • 感情問題 → "感情的傷痛最觸動人心，給自己一點時間慢慢來。"
      • 健康擔憂 → "健康問題總是讓人擔心，您的重視是對的。"
      • 事業迷茫 → "職涯十字路口確實讓人迷茫，您的困惑我能感同身受。"
   b) 分析過程中使用"我理解"、"確實"等共鳴詞彙，用"您"而不是"你"
   c) 建議時給予希望：先承認困難，再給出希望和轉機
   d) 結尾必須鼓勵："相信自己"、"一步一步來"、"記得照顧好自己"
3. 必須基於提供的準確八字四柱進行分析
4. 針對用戶的具體問題給出簡要的方向性建議
5. 當提到流年時機時，必須提供具體年份範圍（例如：2026-2027年的火年、2028-2029年的金年等）
6. 回答格式為JSON，包含title和content兩個字段
7. title應該是簡潔的標題（10字以內）
8. content結構：共情開場 + 八字簡析 + 問題分析 + 簡要建議方向 + 鼓勵結尾 + 章節引導備註（250-350字）
9. 最後要加上備註說明更詳細的內容在其他章節中
10. 必須準確引用提供的八字數據，不可憑空猜測
11. ⚠️ 嚴格要求：分析中提及八字時，必須使用提供的準確數據，絕對不要使用其他八字組合
12. ⚠️ 禁止使用：不可在分析中出現乙巳、丙戌、壬戌、丙午、壬水等錯誤的八字信息

回答格式範例：
{
  "title": "八字分析指導",
  "content": "根據您的八字（提供的準確四柱信息），日主為X，五行偏X，這樣的命格特點是..。關於您提到的（具體問題），從命理角度分析主要是因為...。預計在2026-2027年的火土流年會有明顯改善機會。建議您可以通過...的方式來改善。\n\n💡 更詳細和針對性的分析與建議，請參閱報告中的其他相關章節，您將獲得更全面的解決方案。"
}`;

	// Create detailed user prompt with actual Ba Zi calculations
	let userPrompt;

	if (baziData) {
		userPrompt = `用戶資訊：
姓名：${name}
生日：${birthday}
關注領域：${concern}
具體問題：${problem}

準確八字分析：
年柱：${baziData.year}（${baziData.pillars.year.element}）
月柱：${baziData.month}（${baziData.pillars.month.element}）
日柱：${baziData.day}（${baziData.pillars.day.element}）<- 日主為${baziData.dayMaster}${baziData.dayElement}
時柱：${baziData.hour}

⚠️ 重要提醒：分析時必須使用以上準確的八字組合：
- 年柱必須是：${baziData.year}（不是乙巳或其他）
- 月柱必須是：${baziData.month}（不是丙戌或其他）
- 日柱必須是：${baziData.day}（不是壬戌或其他）
- 時柱必須是：${baziData.hour}（不是丙午或其他）
- 日主必須是：${baziData.dayMaster}${baziData.dayElement}（不是壬水或其他）

五行統計：
金：${baziData.elementCount["金"]}個
木：${baziData.elementCount["木"]}個  
水：${baziData.elementCount["水"]}個
火：${baziData.elementCount["火"]}個
土：${baziData.elementCount["土"]}個

五行特點：${baziData.strongestElements.join("、")}較旺，${baziData.weakestElements.join("、")}偏弱

請基於以上準確的八字數據進行分析，不要憑空推測或使用其他八字信息。

重要要求：
1. 必須準確引用上述八字四柱數據
2. 必須基於實際的五行統計進行分析
3. 針對用戶的具體問題，從命理角度解釋原因和背景
4. 當涉及時機分析時，必須提供具體年份（例如：2026年丙午火年、2027年丁未火土年等）
5. 給出1-2個簡要的方向性建議（不要太詳細）
6. 最後加上備註，說明更詳細的分析和解決方案在其他章節中，不要指明具體章節名稱
7. 語調要個人化，直接對用戶說話
8. 內容要具體，避免空泛的通用建議
9. 時機預測要基於五行流年循環，給出準確年份範圍
10. ⚠️ 絕對禁止在分析內容中出現：乙巳、丙戌、壬戌、丙午、壬水等錯誤信息

分析時間戳：${new Date().toISOString()}
生成要求：必須基於提供的準確八字數據，不可使用任何其他八字組合進行分析。`;

		// Add server-side logging to debug what's being sent to AI
		console.log("🔍 [API DEBUG] Sending to AI:");
		console.log("🔍 [API DEBUG] Ba Zi Data:", {
			year: baziData.year,
			month: baziData.month,
			day: baziData.day,
			hour: baziData.hour,
			dayMaster: baziData.dayMaster,
			dayElement: baziData.dayElement,
		});
		console.log(
			"🔍 [API DEBUG] User Prompt (first 500 chars):",
			userPrompt.substring(0, 500),
		);
	} else {
		// Fallback prompt without detailed Ba Zi
		userPrompt = `用戶資訊：
姓名：${name}
生日：${birthday}
關注領域：${concern}
具體問題：${problem}

請結合用戶的生辰信息，對其具體問題進行個人化分析和指導。注意：由於技術原因無法計算詳細八字，請提供基於生辰的一般性分析。`;
	}

	const messages = [
		{
			role: "system",
			content: systemPrompt,
		},
		{
			role: "user",
			content: userPrompt,
		},
	];

	try {
		const response = await callDeepSeekAPI(messages, {
			temperature: 0.7,
			max_tokens: 1000,
		});

		console.log(
			"🔍 [API DEBUG] Raw AI Response:",
			response.substring(0, 500),
		);

		// Parse AI response
		let aiResponse;
		try {
			// Try to extract JSON from response
			const jsonMatch = response.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				aiResponse = JSON.parse(jsonMatch[0]);
				console.log("🔍 [API DEBUG] Parsed AI Response:", {
					title: aiResponse.title,
					contentPreview: aiResponse.content?.substring(0, 300),
				});

				// Server-side validation and correction of AI response
				if (baziData && aiResponse.content) {
					const wrongPatterns = [
						"乙巳",
						"丙戌",
						"壬戌",
						"丙午",
						"壬水",
						"辛巳",
						"戊午",
						"戊土",
					];
					const hasWrongPatterns = wrongPatterns.some((pattern) =>
						aiResponse.content.includes(pattern),
					);

					if (hasWrongPatterns) {
						console.warn(
							"⚠️ [API DEBUG] AI generated wrong Ba Zi patterns, correcting...",
						);

						// Replace wrong patterns with correct ones
						let correctedContent = aiResponse.content;

						// Replace wrong patterns with correct patterns
						correctedContent = correctedContent.replace(
							/乙巳/g,
							baziData.year,
						);
						correctedContent = correctedContent.replace(
							/丙戌/g,
							baziData.month,
						);
						correctedContent = correctedContent.replace(
							/壬戌/g,
							baziData.day,
						);
						correctedContent = correctedContent.replace(
							/丙午/g,
							baziData.hour,
						);
						correctedContent = correctedContent.replace(
							/壬水/g,
							`${baziData.dayMaster}${baziData.dayElement}`,
						);

						// Also replace other wrong patterns
						correctedContent = correctedContent.replace(
							/辛巳/g,
							baziData.year,
						);
						correctedContent = correctedContent.replace(
							/戊午/g,
							baziData.day,
						);
						correctedContent = correctedContent.replace(
							/戊土/g,
							`${baziData.dayMaster}${baziData.dayElement}`,
						);

						aiResponse.content = correctedContent;
						console.log(
							"✅ [API DEBUG] Content corrected, preview:",
							correctedContent.substring(0, 200),
						);
					} else {
						console.log(
							"✅ [API DEBUG] AI response passed Ba Zi validation",
						);
					}

					// Remove all ** markers from the content (except for the emoji 💡 note)
					// Keep the emoji note intact, but remove bold markers from the main text
					const parts = aiResponse.content.split("💡");
					if (parts.length > 1) {
						// Remove ** from main text, keep emoji note as is
						parts[0] = parts[0].replace(/\*\*/g, "");
						aiResponse.content = parts.join("💡");
					} else {
						// No emoji note, just remove all **
						aiResponse.content = aiResponse.content.replace(
							/\*\*/g,
							"",
						);
					}
				}
			} else {
				// Fallback: create structured response from plain text
				aiResponse = {
					title: `${concern}指導建議`,
					content: response.trim().replace(/\*\*/g, ""), // Remove ** markers
				};
			}
		} catch (parseError) {
			console.error("Failed to parse AI response:", parseError);
			// Fallback response
			aiResponse = {
				title: `${concern}指導建議`,
				content: response.trim(),
			};
		}

		return aiResponse;
	} catch (error) {
		console.error("AI generation failed:", error);

		// Fallback to basic analysis and guidance based on concern type
		const fallbackSolutions = {
			健康: {
				title: "健康分析指導",
				content: `根據您的生辰信息，您的體質特點需要特別關注五行平衡。關於您提到的健康問題，從命理角度分析主要與當前流年氣場和個人體質的配置相關。建議您可以通過調整作息、注意飲食平衡，以及選擇合適的調養時機來改善。\n\n💡 更詳細的體質分析、具體調養方法和時機選擇，請參閱報告中的其他相關章節，您將獲得更全面的健康管理方案。`,
			},
			財運: {
				title: "財運分析指導",
				content: `您好，根據您提供的八字（己卯、葵西、丙寅、乙未），日主為丙火，財庫在西月，財星當令，年時干透乙巳與己卯與乙木印相呼應，意味著您具備以智慧策劃能力或專業技能獲取錢財的潛力。然而目前命局丙火生於西月，財庫當令，雖然干支貴為財官旺盛，但也代表您容易在理財或管控上需要投入較多心力，意味著收入雖然有來源，但也容易因為突發支出或計劃外花費而感到吃緊。\n\n您的命局丙火生於西月，財庫在西月，財星當令，年時干透乙木與己土相呼應，意味著您具備以智慧策劃能力或專業技能獲取錢財的潛力。然而目前命局中，官印相生的組合，卻也帶來壓力，意味著收入雖然有來源，但也容易因為責任、壓力或計劃外花費而感到吃緊，甚至透支心力。\n\n針對財運，您命中的財庫在西月，雖然干支貴為財官旺盛，但關鍵在於年時干透乙木轉化為印星，意味著您具備以知識、技術化為財富的能力。但目前在晚年干支卻也帶來壓力，意味著收入雖有來源，但也容易因為突發支出或計劃外花費而感到吃緊。建議您專注於將自身的知識和技術化為穩健的現金流，規格化、品牌化，這能有效將「傷官佩印」的組合轉為智慧獲取錢財的正向能量，然而目前的流年也對您的財星運勢產生了一定影響。\n\n針對財運，您命中的財庫在西月中暗藏暗財庫相對應的情況在於某年干支支天地雙合年時能夠打開財庫，讓財富迸發，但目前在目前的流年和進展中暗能轉化為壓力或計劃外開銷，建議您可以穩健理財、掌握合適投資時機的方式來改善財務狀況。在2025年乙巳年火木年，流年木火通明，能更好地承載命中財官，是極開拓打的好時機。在2027年丁未年火土年，流年干支受生益財，能穩健積累。\n\n建議您專注於將自身的知識和技術規格化、品牌化，這能有效將「傷官佩印」的組合轉為穩健財源。同時，留意與專業領域或大型機會的合作機會，雖有規定束縛或合作帶來的壓力，但長遠看是穩健的財富增長策略。2027年丁未年火土年、2028年戊申年土金年、2029年己酉年土金年期間，流年干支能更好地承載命中財官，是極佳開拓和積累財富的好時機。\n\n💡 更詳細分析，基於流年、十神、可參閱報告中的其他相關章節。`,
			},
			感情: {
				title: "感情分析指導",
				content: `根據您的命盤配置，感情運勢與人際磁場和桃花時機有著重要關聯。關於您的感情困擾，從命理角度分析與當前的人際能量和情感週期相關。建議您可以通過提升個人魅力、選擇合適的溝通時機來改善感情狀況。\n\n💡 更詳細的桃花分析、最佳行動時機和具體感情策略，請參閱報告中的其他相關章節，您將獲得更全面的感情經營指引。`,
			},
			事業: {
				title: "事業分析指導",
				content: `從您的命格來看，事業發展與官星配置和流年運勢變化密切相關。關於您的職涯問題，命理分析顯示與當前的事業運勢週期和個人能力發揮有關。建議您可以通過提升專業技能、把握合適的行動時機來推進事業發展。\n\n💡 更詳細的事業運分析、最佳發展時機和具體職涯策略，請參閱報告中的其他相關章節，您將獲得更全面的事業規劃指引。`,
			},
		};
		return (
			fallbackSolutions[concern] || {
				title: "命理分析指導",
				content: `根據您的生辰資訊，您的命格具有獨特的特質。關於您提到的問題，從命理角度分析與您當前的運勢週期和個人氣場相關。建議您可以通過調整心態、把握合適時機來逐步改善現況。\n\n💡 更詳細的命理分析、具體改善方法和行動時機，請參閱報告中的其他相關章節，您將獲得更全面和針對性的解決方案。`,
			}
		);
	}
}

// API endpoint
export async function POST(request) {
	try {
		const body = await request.json();
		const { userInfo } = body;

		// Validate required fields
		if (!userInfo || !userInfo.problem || !userInfo.concern) {
			return NextResponse.json(
				{ error: "缺少必要的用戶資訊" },
				{ status: 400 },
			);
		}

		// Generate AI-powered solution
		const solution = await generatePersonalizedSolution(userInfo);

		return NextResponse.json({
			success: true,
			solution: solution,
		});
	} catch (error) {
		console.error("Question Focus Analysis API Error:", error);
		return NextResponse.json(
			{
				error: "分析服務暫時不可用，請稍後再試",
				fallback: true,
			},
			{ status: 500 },
		);
	}
}
