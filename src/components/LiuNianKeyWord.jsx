"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ComponentErrorBoundary } from "./ErrorHandling";
import { getConcernColor } from "../utils/colorTheme";
import {
	getComponentData,
	storeComponentData,
} from "../utils/componentDataStore";

export default function LiuNianKeyWord({ userInfo, currentYear = 2025 }) {
	const [analysisData, setAnalysisData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Generate personalized fallback content based on user data
	const generatePersonalizedFallback = () => {
		// Get concern from userInfo like other components
		const concern = userInfo?.concern || "事業";

		// Debug logging
		console.log("LiuNianKeyWord Debug:");
		console.log("- userInfo.concern:", userInfo?.concern);
		console.log("- Final concern used:", concern);
		console.log("- Full userInfo:", userInfo);

		const birthDateTime = userInfo?.birthDateTime || "";
		const gender = userInfo?.gender || "male";

		// Extract birth year for more specific analysis
		const birthYear = birthDateTime
			? new Date(birthDateTime).getFullYear()
			: 2000;
		const age = currentYear - birthYear;
		const isYoung = age < 35;
		const isMidAge = age >= 35 && age < 55;
		const lifeStage = isYoung ? "青年" : isMidAge ? "中年" : "長者";

		// Gender mapping
		const genderRef =
			gender === "female" || gender === "女" ? "女性" : "男性";

		// BaZi elements based on birth year
		const yearElements = {
			1984: { year: "甲子", element: "海中金", dayMaster: "甲木" },
			1990: { year: "庚午", element: "路旁土", dayMaster: "庚金" },
			2000: { year: "庚辰", element: "白臘金", dayMaster: "庚金" },
			1995: { year: "乙亥", element: "山頭火", dayMaster: "乙木" },
		};

		const baziInfo = yearElements[birthYear] || {
			year: "庚子",
			element: "壁上土",
			dayMaster: "庚金",
		};

		// Generate personalized keywords based on concern and user data
		const personalizedKeywords = {
			財運: [
				{
					id: 1,
					text: `${lifeStage}進財`,
					description: `${baziInfo.dayMaster}日主配${currentYear}年流年，${genderRef}${lifeStage}階段財運逐步上升，投資理財需謹慎`,
				},
				{
					id: 2,
					text: "理財考驗",
					description: `${baziInfo.element}命格遇流年沖剋，需防範投資風險，${lifeStage}宜保守理財為上策`,
				},
				{
					id: 3,
					text: "秋冬轉機",
					description: `根據${birthYear}年出生特質，下半年${concern}運勢轉佳，適合${genderRef}積極把握機會`,
				},
			],
			事業: [
				{
					id: 1,
					text: `${lifeStage}發展`,
					description: `${baziInfo.dayMaster}日主在${currentYear}年，${genderRef}事業運勢穩中有升，適合專業深耕`,
				},
				{
					id: 2,
					text: "職場挑戰",
					description: `${baziInfo.element}命格特質，${lifeStage}階段面臨同業競爭，需要提升個人競爭力`,
				},
				{
					id: 3,
					text: "貴人相助",
					description: `${birthYear}年出生者在${currentYear}年，適合透過人脈網絡拓展事業版圖`,
				},
			],
			感情: [
				{
					id: 1,
					text: `${lifeStage}桃花`,
					description: `${baziInfo.dayMaster}日主配流年，${genderRef}在${lifeStage}階段感情運勢漸入佳境`,
				},
				{
					id: 2,
					text: "關係考驗",
					description: `${baziInfo.element}命格遇${currentYear}年，現有感情關係需要用心經營維護`,
				},
				{
					id: 3,
					text: "春夏結緣",
					description: `根據${birthYear}年出生特質，上半年感情發展較為順遂，宜把握良機`,
				},
			],
			健康: [
				{
					id: 1,
					text: `${lifeStage}養生`,
					description: `${baziInfo.dayMaster}日主在${currentYear}年，${genderRef}需注重${lifeStage}階段的健康管理`,
				},
				{
					id: 2,
					text: "調養身心",
					description: `${baziInfo.element}命格特質，建議加強運動養生，預防慢性疾病`,
				},
				{
					id: 3,
					text: "冬季保健",
					description: `${birthYear}年出生者在年末需特別注意保暖，維護呼吸道健康`,
				},
			],
		};

		const keywords =
			personalizedKeywords[concern] || personalizedKeywords["事業"];
		const analysis = `${baziInfo.year}年${baziInfo.element}命，${currentYear}年流年疊加大運，${genderRef}${lifeStage}${concern}呈現「因人制宜，順勢而為」之象。`;

		return { keywords, analysis };
	};

	// Convert text AI response to keyword format
	const convertTextToKeywordFormat = (text, concern) => {
		// Extract keywords and analysis from text response
		const lines = text.split("\n").filter((line) => line.trim());

		// Try to extract keywords from text
		const keywords = [];
		let analysis = "";

		// Look for keyword patterns in the text
		lines.forEach((line, index) => {
			if (
				line.includes("關鍵詞") ||
				line.includes("关键词") ||
				line.match(/[一二三]、/)
			) {
				const keywordMatch = line.match(
					/[「『"]([^」』"]{2,4})[」』"]/
				);
				if (keywordMatch && keywords.length < 3) {
					keywords.push({
						id: keywords.length + 1,
						text: keywordMatch[1],
						description:
							lines[index + 1] || `${concern}運勢相關分析`,
					});
				}
			}

			if (
				line.includes("之象") ||
				line.includes("呈現") ||
				line.includes("流年")
			) {
				analysis = line;
			}
		});

		// Ensure we have 3 keywords
		while (keywords.length < 3) {
			const defaultKeywords = {
				財運: ["財源廣進", "謹慎理財", "投資時機"],
				事業: ["事業進展", "職場挑戰", "發展機遇"],
				感情: ["感情和諧", "關係考驗", "桃花運勢"],
				健康: ["身體調養", "預防保健", "活力充沛"],
				學業: ["學習進步", "專注力強", "考試運佳"],
			};

			const concernKeywords =
				defaultKeywords[concern] || defaultKeywords["事業"];
			keywords.push({
				id: keywords.length + 1,
				text: concernKeywords[keywords.length] || "運勢平穩",
				description: `${currentYear}年${concern}方面需要特別關注的重點`,
			});
		}

		if (!analysis) {
			analysis = `${currentYear}年流年運勢，${concern}呈現「穩中求進，機遇與挑戰並存」之象。`;
		}

		return { keywords, analysis };
	};

	// Generate AI analysis with retry mechanism
	const generateAIAnalysis = async () => {
		// Get concern from userInfo like other components
		const concern = userInfo?.concern || "事業";
		const problem = userInfo?.problem || "";
		const birthDateTime = userInfo?.birthDateTime || "";
		const gender = userInfo?.gender || "";

		const prompt = `
角色設定：你是一位資深八字命理師，精通流年分析與十神互動。請嚴格按以下JSON結構生成${currentYear}年流年關鍵詞報告。

用戶資訊：
- 出生時間：${birthDateTime}
- 性別：${gender}
- 關注領域：${concern}
- 具體問題：${problem}
- 分析年份：${currentYear}年

請必須按照以下JSON格式回應：
{
  "keywords": [
    {
      "id": 1,
      "text": "[四字關鍵詞1]",
      "description": "[具體的十神分析和影響，約40字，要包含專業術語]"
    },
    {
      "id": 2,
      "text": "[四字關鍵詞2]", 
      "description": "[具體的刑沖合害分析，約40字，要針對${concern}]"
    },
    {
      "id": 3,
      "text": "[四字關鍵詞3]",
      "description": "[大運流年互動分析，約40字，要有時間性]"
    }
  ],
  "analysis": "[${currentYear}年流年整體分析，約60字，格式：XX流年疊加XX大運，XX態勢，${concern}呈現「XXXX」之象]"
}

要求：
1. 根據用戶實際八字分析${currentYear}年流年特點
2. 三個關鍵詞必須針對${concern}領域
3. 分析要包含具體的十神、刑沖合害等專業術語
4. 內容要個性化，不要使用通用模板
5. 必須返回有效的JSON格式
6. 請使用繁體中文回應
`;

		// Try AI API multiple times for reliability
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				console.log(
					`LiuNian AI Analysis Attempt ${attempt} for ${concern}`
				);

				const response = await fetch("/api/ai-analysis", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						prompt,
						userInfo: { birthDateTime, gender, concern, problem },
						analysisType: `liunian_keywords_${concern}`,
						currentYear,
						attempt,
						forceDetailed: true,
						confidence: "high",
					}),
				});

				if (response.ok) {
					const data = await response.json();
					const responseText = data.analysis || data.content || "";
					console.log(`🔍 AI Response attempt ${attempt}:`, {
						dataKeys: Object.keys(data),
						responseTextLength: responseText.length,
						responseTextPreview: responseText.substring(0, 200),
					});

					if (responseText && responseText.length > 50) {
						console.log(
							`✅ LiuNian AI Success on attempt ${attempt}`
						);

						// Try to parse as JSON
						try {
							console.log("🔧 Trying to parse as JSON...");

							// Clean the response text first
							let cleanResponseText = responseText.trim();

							// Extract JSON if there's extra text
							const jsonMatch =
								cleanResponseText.match(/\{[\s\S]*\}/);
							if (jsonMatch) {
								cleanResponseText = jsonMatch[0];
								console.log("📋 Extracted JSON from response");
							}

							// Additional cleaning for common JSON issues
							cleanResponseText = cleanResponseText
								.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
								.replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
								.replace(
									/([{,]\s*)"([^"]+)":\s*"([^"]*)"([,}\]])/g,
									'$1"$2": "$3"$4'
								) // Fix quote issues
								.replace(
									/([{,]\s*)"([^"]+)":\s*([^",}\]]+)([,}\]])/g,
									(match, prefix, key, value, suffix) => {
										// Quote unquoted string values containing Chinese characters
										if (
											value.trim() &&
											!value
												.trim()
												.match(
													/^(true|false|null|\d+(\.\d+)?)$/
												) &&
											value
												.trim()
												.match(/[\u4e00-\u9fff]/)
										) {
											return `${prefix}"${key}": "${value.trim()}"${suffix}`;
										}
										return match;
									}
								);

							console.log(
								"🧹 Cleaned response text:",
								cleanResponseText.substring(0, 200) + "..."
							);

							const parsed = JSON.parse(cleanResponseText);
							console.log("✅ JSON parsed successfully:", parsed);
							if (parsed.keywords && parsed.analysis) {
								return parsed;
							} else {
								console.log(
									"❌ Missing keywords or analysis in parsed JSON"
								);
							}
						} catch (parseError) {
							console.log(
								"❌ Failed to parse AI JSON, using text analysis:",
								parseError.message
							);
							console.log("📝 Raw response text:", responseText);
							// Convert text response to required format
							return convertTextToKeywordFormat(
								responseText,
								concern
							);
						}
					} else {
						console.log(
							`❌ Response too short or empty on attempt ${attempt}`
						);
					}
				} else {
					console.log(
						`LiuNian AI API failed on attempt ${attempt}:`,
						response.status
					);
				}
			} catch (error) {
				console.error(
					`LiuNian AI analysis attempt ${attempt} failed:`,
					error
				);
			}

			// Wait before retry (except on last attempt)
			if (attempt < 3) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		// If all AI attempts fail, throw error to trigger fallback
		throw new Error("AI analysis failed after 3 attempts");
	};

	// Get minimal fallback when everything else fails
	const getMinimalFallback = (fallbackConcern) => {
		// Use the passed concern parameter if available
		const concern = fallbackConcern || userInfo?.concern || "事業";
		const keywords = [
			{
				id: 1,
				text: "運勢平穩",
				description: `${currentYear}年${concern}方面整體運勢平穩，需要耐心經營`,
			},
			{
				id: 2,
				text: "穩中求進",
				description: "建議採取穩健的策略，避免冒進的決策",
			},
			{
				id: 3,
				text: "順勢而為",
				description: "順應時勢變化，靈活調整個人規劃",
			},
		];
		const analysis = `${currentYear}年流年運勢呈現「穩中求進，順勢而為」之象。`;
		return { keywords, analysis };
	};

	useEffect(() => {
		const generateAnalysis = async () => {
			// Check if data already exists in component data store (for historical reports)
			const existingData = getComponentData("liuNianKeyWordAnalysis");
			if (existingData) {
				console.log(
					"📖 LiuNianKeyWord using existing data from component store"
				);
				const parsedData =
					typeof existingData === "string"
						? JSON.parse(existingData)
						: existingData;
				setAnalysisData(parsedData);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			console.log("🔮 LiuNian starting analysis...");
			console.log("🔮 userInfo:", userInfo);

			try {
				// Try AI analysis first
				console.log("🤖 Attempting AI analysis...");
				const aiData = await generateAIAnalysis();
				console.log("✅ LiuNian AI analysis successful:", aiData);
				setAnalysisData(aiData);
				// Store data for database saving
				storeComponentData(
					"liuNianKeyWordAnalysis",
					JSON.stringify(aiData)
				);
				console.log("📊 Stored LiuNianKeyWord fresh data:", "SUCCESS");
				setIsLoading(false);
				return;
			} catch (error) {
				console.error(
					"❌ LiuNian AI analysis failed, trying personalized fallback:",
					error
				);
			}

			try {
				// If AI fails, use personalized fallback
				const fallbackData = generatePersonalizedFallback();
				console.log("LiuNian using personalized fallback");
				setAnalysisData(fallbackData);
				// Store fallback data
				storeComponentData(
					"liuNianKeyWordAnalysis",
					JSON.stringify(fallbackData)
				);
				console.log(
					"📊 Stored LiuNianKeyWord fallback data:",
					"SUCCESS"
				);
				setIsLoading(false);
				return;
			} catch (fallbackError) {
				console.error(
					"LiuNian personalized fallback failed, using minimal content:",
					fallbackError
				);
			}

			try {
				// If everything fails, use minimal fallback
				const minimalData = getMinimalFallback();
				console.log("LiuNian using minimal fallback");
				setAnalysisData(minimalData);
			} catch (minimalError) {
				console.error("LiuNian all fallbacks failed:", minimalError);
				// Set a hardcoded emergency fallback
				setAnalysisData({
					keywords: [
						{
							id: 1,
							text: "運勢平穩",
							description: "整體運勢平穩，建議保持現狀",
						},
						{
							id: 2,
							text: "穩中求進",
							description: "採取穩健策略，避免冒進",
						},
						{
							id: 3,
							text: "順勢而為",
							description: "順應變化，靈活調整",
						},
					],
					analysis: "2025年流年運勢呈現「穩中求進」之象。",
				});
			}

			setIsLoading(false);
		};

		generateAnalysis();
	}, [
		userInfo?.concern,
		userInfo?.problem,
		userInfo?.birthDateTime,
		userInfo?.gender,
		userInfo?.concern, // Re-run when concern changes
	]);

	// Debug logging
	console.log("LiuNian render state:", {
		isLoading,
		analysisData: !!analysisData,
		userInfo,
		concern: userInfo?.concern,
		userInfoConcern: userInfo?.concern,
		problem: userInfo?.problem,
		birthDateTime: userInfo?.birthDateTime,
		gender: userInfo?.gender,
	});

	// Debug concern mismatch issue
	if (analysisData?.keywords) {
		console.log(
			"LiuNian Generated Keywords:",
			analysisData.keywords.map((k) => k.text)
		);
		console.log("LiuNian Expected Concern:", userInfo?.concern);
		console.log("LiuNian UserInfo Concern:", userInfo?.concern);
		console.log("LiuNian Analysis Text:", analysisData.analysis);
	}

	if (isLoading) {
		return (
			<ComponentErrorBoundary>
				<div className="w-full max-w-full sm:w-[97%] mx-auto bg-white rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] shadow-[0_4px_4px_rgba(0,0,0,0.18)] p-4 sm:p-8 lg:p-12">
					<div className="flex flex-col items-center justify-center py-12 space-y-4">
						{/* Loading spinner */}
						<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

						{/* 小鈴 loading image */}
						<div className="flex items-center justify-center">
							<Image
								src="/images/風水妹/風水妹-loading.png"
								alt="小鈴運算中"
								width={120}
								height={120}
								className="object-contain"
							/>
						</div>

						{/* Loading text */}
						<div className="space-y-2 text-center">
							<div
								className="text-gray-700"
								style={{
									fontFamily: "Noto Sans HK, sans-serif",
									fontSize: "clamp(14px, 3.5vw, 16px)",
								}}
							>
								小鈴已經在運算流年分析中，請稍候
							</div>
						</div>
					</div>
				</div>
			</ComponentErrorBoundary>
		);
	}

	if (!analysisData) {
		return (
			<ComponentErrorBoundary>
				<div className="w-[95%] mx-auto bg-white rounded-[45px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 space-y-6">
					<div className="text-center">
						<h3
							className="text-start text-[30px] font-extrabold text-black mb-3"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 800,
							}}
						>
							流年關鍵詞
						</h3>
						<div className="p-4 border rounded-lg bg-white/70 backdrop-blur-sm border-amber-200">
							<p
								className="text-center text-[15px] text-black leading-relaxed"
								style={{ fontFamily: "Noto Serif TC, serif" }}
							>
								{currentYear}
								年流年運勢呈現「穩中求進，順勢而為」之象。
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="relative p-6 overflow-hidden border-2 border-red-300 shadow-lg rounded-xl bg-gradient-to-br from-red-100 to-pink-100 border-opacity-20">
							<div className="absolute top-2 right-2 opacity-20">
								<span className="text-2xl">⭐</span>
							</div>
							<h4 className="mb-3 text-lg font-bold text-red-800">
								運勢平穩
							</h4>
							<p className="text-sm leading-relaxed text-red-700">
								整體運勢平穩，建議保持現狀
							</p>
						</div>
						<div className="relative p-6 overflow-hidden border-2 border-blue-300 shadow-lg rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-opacity-20">
							<div className="absolute top-2 right-2 opacity-20">
								<span className="text-2xl">🌟</span>
							</div>
							<h4 className="mb-3 text-lg font-bold text-blue-800">
								穩中求進
							</h4>
							<p className="text-sm leading-relaxed text-blue-700">
								採取穩健策略，避免冒進
							</p>
						</div>
						<div className="relative p-6 overflow-hidden border-2 border-green-300 shadow-lg rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border-opacity-20">
							<div className="absolute top-2 right-2 opacity-20">
								<span className="text-2xl">✨</span>
							</div>
							<h4 className="mb-3 text-lg font-bold text-green-800">
								順勢而為
							</h4>
							<p className="text-sm leading-relaxed text-green-700">
								順應變化，靈活調整
							</p>
						</div>
					</div>
				</div>
			</ComponentErrorBoundary>
		);
	}

	return (
		<ComponentErrorBoundary>
			<div className="w-full max-w-full sm:w-[97%] mx-auto bg-white rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] shadow-[0_4px_4px_rgba(0,0,0,0.18)] p-4 sm:p-8 lg:p-12 space-y-6">
				{/* Analysis Header */}
				<div className="text-center">
					<h3
						className="mb-2 font-extrabold text-center sm:mb-3"
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 800,
							color: getConcernColor(userInfo),
							fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
							lineHeight: 1.1,
						}}
					>
						流年關鍵詞
					</h3>
					<div className="p-2 sm:p-4">
						<p
							className="leading-relaxed text-center text-black"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(1rem, 3vw, 1.25rem)",
							}}
						>
							{analysisData.analysis}
						</p>
					</div>
				</div>

				{/* Keywords Grid */}
				<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
					{analysisData.keywords.map((keyword, index) => (
						<div
							key={keyword.id}
							className={`
										relative overflow-hidden rounded-xl p-4 sm:p-6 
										bg-gradient-to-br shadow-lg hover:shadow-xl 
										transform hover:-translate-y-1 transition-all duration-300
										border-2 border-opacity-20
										${
											index === 0
												? "from-red-100 to-pink-100 border-red-300"
												: index === 1
													? "from-blue-100 to-indigo-100 border-blue-300"
													: "from-green-100 to-emerald-100 border-green-300"
										}
									`}
						>
							<h4
								className={`
											font-bold mb-2 sm:mb-3 
											${
												index === 0
													? "text-red-800"
													: index === 1
														? "text-blue-800"
														: "text-green-800"
											}
										`}
								style={{
									fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
									fontFamily: "Noto Serif TC, serif",
								}}
							>
								{keyword.text}
							</h4>
							<p
								className={`
											leading-relaxed
											${
												index === 0
													? "text-red-700"
													: index === 1
														? "text-blue-700"
														: "text-green-700"
											}
										`}
								style={{
									fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
									fontFamily: "Noto Sans HK, sans-serif",
								}}
							>
								{keyword.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</ComponentErrorBoundary>
	);
}
