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
				/([金木水火土]):(\d+\.?\d*)%/g
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
			([, a], [, b]) => b - a
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

當前年份：2025年（乙巳年 - 木火年）

十年天干地支循環參考（2020-2029）：
2020庚子(金水)、2021辛丑(金土)、2022壬寅(水木)、2023癸卯(水木)、2024甲辰(木土)、2025乙巳(木火)、2026丙午(火火)、2027丁未(火土)、2028戊申(土金)、2029己酉(土金)

要求：
1. 回答必須使用繁體中文
2. 語氣溫和、專業、具有同理心
3. 必須基於提供的準確八字四柱進行分析
4. 針對用戶的具體問題給出簡要的方向性建議
5. 當提到流年時機時，必須提供具體年份範圍（例如：2026-2027年的火年、2028-2029年的金年等）
6. 回答格式為JSON，包含title和content兩個字段
7. title應該是簡潔的標題（10字以內）
8. content結構：八字簡析 + 問題分析 + 簡要建議方向 + 章節引導備註（200-300字）
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
			userPrompt.substring(0, 500)
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
			response.substring(0, 500)
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
						aiResponse.content.includes(pattern)
					);

					if (hasWrongPatterns) {
						console.warn(
							"⚠️ [API DEBUG] AI generated wrong Ba Zi patterns, correcting..."
						);

						// Replace wrong patterns with correct ones
						let correctedContent = aiResponse.content;

						// Replace wrong patterns with correct patterns
						correctedContent = correctedContent.replace(
							/乙巳/g,
							baziData.year
						);
						correctedContent = correctedContent.replace(
							/丙戌/g,
							baziData.month
						);
						correctedContent = correctedContent.replace(
							/壬戌/g,
							baziData.day
						);
						correctedContent = correctedContent.replace(
							/丙午/g,
							baziData.hour
						);
						correctedContent = correctedContent.replace(
							/壬水/g,
							`${baziData.dayMaster}${baziData.dayElement}`
						);

						// Also replace other wrong patterns
						correctedContent = correctedContent.replace(
							/辛巳/g,
							baziData.year
						);
						correctedContent = correctedContent.replace(
							/戊午/g,
							baziData.day
						);
						correctedContent = correctedContent.replace(
							/戊土/g,
							`${baziData.dayMaster}${baziData.dayElement}`
						);

						aiResponse.content = correctedContent;
						console.log(
							"✅ [API DEBUG] Content corrected, preview:",
							correctedContent.substring(0, 200)
						);
					} else {
						console.log(
							"✅ [API DEBUG] AI response passed Ba Zi validation"
						);
					}
				}
			} else {
				// Fallback: create structured response from plain text
				aiResponse = {
					title: `${concern}指導建議`,
					content: response.trim(),
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
				content: `從您的生辰來看，財運的發展與五行流通和時機把握密切相關。關於您的財務問題，命理上分析主要是當前流年對您的財星運勢產生了一定影響。建議您可以通過穩健理財、把握合適投資時機的方式來改善財務狀況。\n\n💡 更詳細的財運分析、投資時機和具體理財策略，請參閱報告中的其他相關章節，您將獲得更全面的財富管理指引。`,
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
				{ status: 400 }
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
			{ status: 500 }
		);
	}
}
