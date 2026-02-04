import { NextResponse } from "next/server";

// Function to clean markdown formatting from AI responses
function cleanMarkdownFormatting(content) {
	return (
		content
			// Remove markdown headers (###, ##, #)
			.replace(/#{1,6}\s*/g, "")
			// Remove markdown bold (**text**)
			.replace(/\*\*(.*?)\*\*/g, "$1")
			// Remove markdown italic (*text*)
			.replace(/\*(.*?)\*/g, "$1")
			// Remove markdown bullet points (- item)
			.replace(/^[\s]*-[\s]+/gm, "")
			// Remove numbered lists (1. item)
			.replace(/^[\s]*\d+\.[\s]+/gm, "")
			// Remove extra empty lines (more than 2 consecutive)
			.replace(/\n{3,}/g, "\n\n")
			// Clean up any remaining markdown artifacts
			.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links [text](url)
			.trim()
	);
}

// Function to remove biographical introduction paragraph
function removeBiographicalIntro(content) {
	// Remove first paragraph that starts with birth info
	const lines = content.split("\n");
	const firstParagraphEnd = lines.findIndex(
		(line, index) =>
			index > 0 && line.trim() === "" && lines[index - 1].includes("詳細")
	);

	if (firstParagraphEnd > 0) {
		// Remove first paragraph and its trailing empty line
		return lines
			.slice(firstParagraphEnd + 1)
			.join("\n")
			.trim();
	}

	return content;
}

export async function POST(request) {
	console.log("🔥 AI Analysis API called at:", new Date().toISOString());

	// Read request body once and store the data
	let requestData;
	try {
		requestData = await request.json();
	} catch (error) {
		console.error("❌ Failed to parse request body:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Invalid request body",
			},
			{ status: 400 }
		);
	}

	const {
		prompt,
		userInfo,
		concern,
		problem,
		analysisType,
		locale = "zh-TW",
	} = requestData;

	// Extract concern from userInfo if not provided at top level
	const finalConcern = concern || userInfo?.concern;

	// Check if this is a 日主特性 request (should return plain text)
	const isRiZhuTeXing = analysisType && analysisType.includes("日主特性");

	console.log("📝 Request data:", {
		concern: finalConcern,
		userBirthday: userInfo?.birthDateTime,
		gender: userInfo?.gender,
	});

	try {
		// Real AI Analysis using DeepSeek API
		console.log("🚀 Calling DeepSeek API for LiuNian analysis...");
		const startTime = Date.now();

		// Locale-aware language instruction
		const languageInstruction =
			locale === "zh-CN" ? "请使用简体中文回应" : "請使用繁體中文回應";

		const systemPromptBase =
			locale === "zh-CN"
				? "你是一位资深八字命理师，精通流年分析与命理调候。"
				: "你是一位資深八字命理師，精通流年分析與命理調候。";

		const deepseekResponse = await fetch(
			"https://api.deepseek.com/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [
						{
							role: "system",
							content: `${systemPromptBase}

重要指示：
1. 如果用戶要求日主特性分析，請提供詳細的白話分析文章（400-500字），不要JSON格式，不要markdown標記
2. 如果用戶要求其他分析類型，請嚴格按JSON格式回應，不要任何markdown標記或詩詞引用
3. 必须基于用户的实际出生时间和2025年流年特点
4. 内容要既专业又通俗易懂，多用生活化的比喻和解释
5. 提供具体的时间安排、饮食建议、生活指导
6. 解释命理原理，让普通人也能理解
7. ${languageInstruction}

對於日主特性：請寫成完整文章，包含：
- 流年與命局互動分析
- 性格特質深度解讀  
- 具体生活調理建議
- 時辰養生方案
- 長期調候體系

對於其他分析：必須嚴格返回純淨JSON格式，不要任何額外文字、標記或詩句：
{
  "keywords": [
    {"id": 1, "text": "關鍵詞1", "description": "專業描述內容"},
    {"id": 2, "text": "關鍵詞2", "description": "專業描述內容"},
    {"id": 3, "text": "關鍵詞3", "description": "專業描述內容"}
  ],
  "analysis": "綜合分析總結（見下方 analysis 格式要求）"
}

【analysis 欄位格式要求】適用於財運/事業/感情/健康等所有報告類型：
- analysis 須為一段連貫的總結文字（約300字），結構為：先「綜合而言」的整體定位與特質，再寫「針對XXX」或「建議」的當年/流年重點。
- 在「綜合而言」那一段中，必須自然嵌入兩個 2～4 字的關鍵詞，用全形「」括起來，例：……根基在於「精緻」與「堅韌」……。
- 在寫當年流年或建議的那一段中，再嵌入兩個 2～4 字的關鍵詞用「」括起來，例：……建議今年重點在於「內部強化」與「慎選夥伴」……。
- 關鍵詞須與該報告類型相符（財運：理財特質/策略；事業：職涯特質/策略；感情：緣分/相處特質；健康：體質/調理重點）。共 4 個關鍵詞即可，可用全形「」或『』括起（例：「精緻」或『可靠』），報告會自動將它們以藍色橢圓重點樣式顯示。

禁止事項：
- 不要使用 > 引用標記
- 不要使用 ** 或 # 等markdown標記  
- 不要添加詩詞或文學性開頭
- JSON回應必須直接以 { 開始`,
						},
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 1500,
					temperature: 0.7,
					stream: false,
				}),
			}
		);

		const apiTime = Date.now() - startTime;
		console.log(`⏱️ DeepSeek API took: ${apiTime}ms`);

		if (!deepseekResponse.ok) {
			console.error("❌ DeepSeek API error:", deepseekResponse.status);
			throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
		}

		console.log("📥 Parsing DeepSeek response...");
		const deepseekData = await deepseekResponse.json();
		let aiContent = deepseekData.choices[0].message.content;

		console.log("✅ AI Content received, length:", aiContent.length);
		console.log("📋 Raw AI content:", aiContent.substring(0, 200) + "...");

		// Handle validation based on analysis type
		try {
			if (isRiZhuTeXing) {
				// For 日主特性, validate as plain text
				if (
					aiContent &&
					typeof aiContent === "string" &&
					aiContent.length > 200
				) {
					console.log(
						"✅ 日主特性 plain text validation successful, length:",
						aiContent.length
					);

					// Clean markdown formatting and remove biographical intro for 日主特性
					aiContent = cleanMarkdownFormatting(aiContent);
					aiContent = removeBiographicalIntro(aiContent);
					console.log(
						"🧹 Cleaned markdown formatting and removed biographical intro"
					);
				} else {
					throw new Error("日主特性 content too short or invalid");
				}
			} else {
				// For other tabs, validate as JSON
				// Clean the content first - remove markdown headers and poetic quotes
				let cleanedContent = aiContent
					.replace(/^>\s*.*$/gm, "") // Remove lines starting with >
					.replace(/^\*\*.*\*\*$/gm, "") // Remove markdown headers
					.replace(/^#{1,6}\s.*$/gm, "") // Remove # headers
					.replace(/^---.*$/gm, "") // Remove horizontal rules
					.trim();

				// Extract JSON from the cleaned response
				const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					// Get the largest/last JSON object if multiple exist
					const allMatches = cleanedContent.match(
						/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g
					);
					if (allMatches && allMatches.length > 0) {
						aiContent = allMatches[allMatches.length - 1];
					} else {
						aiContent = jsonMatch[0];
					}
				} else {
					// If no JSON found, try to find it in the original content
					const originalJsonMatch = aiContent.match(/\{[\s\S]*\}/);
					if (originalJsonMatch) {
						aiContent = originalJsonMatch[0];
					} else {
						throw new Error(
							"No JSON structure found in AI response"
						);
					}
				}

				// Test parse to validate JSON
				const testParse = JSON.parse(aiContent);
				console.log("✅ JSON validation successful");

				// Support both old (keywords) and new (sections) format
				const hasOldFormat =
					testParse.keywords &&
					Array.isArray(testParse.keywords) &&
					testParse.analysis;
				const hasNewFormat =
					testParse.sections && Array.isArray(testParse.sections);
				const hasSingleSection = testParse.title && testParse.content; // AI returned single section instead of sections array

				if (hasOldFormat) {
					// Validate old format - keywords array and analysis string
					if (
						typeof testParse.analysis === "string" &&
						testParse.keywords.length > 0
					) {
						// Validate each keyword has required fields
						const validKeywords = testParse.keywords.every(
							(keyword) =>
								keyword.text &&
								keyword.description &&
								typeof keyword.text === "string" &&
								typeof keyword.description === "string"
						);

						if (validKeywords) {
							console.log(
								"✅ Old JSON structure validated (keywords format)"
							);
						} else {
							throw new Error(
								"Invalid keyword structure - missing text or description fields"
							);
						}
					} else {
						throw new Error(
							"Invalid old format - missing analysis string or empty keywords"
						);
					}
				} else if (hasNewFormat) {
					// Validate new format - sections array
					if (testParse.sections.length > 0) {
						// Validate each section has required fields
						const validSections = testParse.sections.every(
							(section) =>
								section.title &&
								section.content &&
								typeof section.title === "string" &&
								typeof section.content === "string"
						);

						if (validSections) {
							console.log(
								`✅ New JSON structure validated (sections format) - ${testParse.sections.length} sections found`
							);

							// Encourage complete 3-section structure but accept what we get
							if (testParse.sections.length < 3) {
								console.log(
									`⚠️ Received ${testParse.sections.length} section(s), preferably would have 3 complete sections for richer analysis`
								);
							} else {
								console.log(
									"🎉 Complete 3-section structure received!"
								);
							}
						} else {
							throw new Error(
								"Invalid section structure - missing title or content fields"
							);
						}
					} else {
						throw new Error(
							"Invalid new format - empty sections array"
						);
					}
				} else if (hasSingleSection) {
					// Handle case where AI returns single section instead of sections array
					console.log(
						"🔧 Converting single section to sections array format"
					);

					// Wrap single section in sections array
					const wrappedContent = {
						sections: [testParse],
					};

					aiContent = JSON.stringify(wrappedContent);
					console.log(
						"✅ Single section converted to sections array format"
					);
				} else {
					throw new Error(
						"Invalid JSON structure - missing both keywords/analysis and sections format"
					);
				}
			}
		} catch (jsonError) {
			console.error("❌ JSON validation failed:", jsonError.message);
			console.log(
				"� Raw AI content that failed parsing:",
				aiContent.substring(0, 500)
			);

			// Try one more aggressive cleaning attempt
			try {
				console.log("🔧 Attempting aggressive content cleaning...");
				let aggressiveClean = aiContent
					// Remove everything before first {
					.substring(aiContent.indexOf("{"))
					// Remove everything after last }
					.substring(0, aiContent.lastIndexOf("}") + 1)
					// Clean any remaining problematic characters
					.replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
					.replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
					.trim();

				console.log(
					"🧪 Testing aggressively cleaned content:",
					aggressiveClean.substring(0, 200)
				);
				const testParse = JSON.parse(aggressiveClean);

				// If successful, use the cleaned content
				aiContent = aggressiveClean;
				console.log("✅ Aggressive cleaning successful!");
			} catch (secondError) {
				console.error(
					"❌ Aggressive cleaning also failed:",
					secondError.message
				);
				console.log("�🔄 Falling back to personalized content...");

				// Generate fallback content using already parsed request data
				const fallbackContent = generatePersonalizedFallback(
					finalConcern,
					userInfo
				);
				aiContent = JSON.stringify(fallbackContent);
			}
		}

		console.log("📤 Sending response...");

		return NextResponse.json({
			success: true,
			content: aiContent,
			message: `AI analysis generated successfully in ${apiTime}ms`,
		});
	} catch (error) {
		console.error("💥 AI Analysis API Error:", error);

		// Fallback to personalized mock response based on user's actual data
		console.log("🔄 Using personalized fallback response...");
		const mockAIResponse = generatePersonalizedFallback(
			finalConcern,
			userInfo
		);

		return NextResponse.json({
			success: true,
			content: mockAIResponse,
			message:
				"Using personalized fallback analysis (API error: " +
				error.message +
				")",
			fallback: true,
		});
	}
}

// Generate personalized fallback based on actual user data (not hardcoded)
function generatePersonalizedFallback(concern, userInfo) {
	const birthDateTime = userInfo?.birthDateTime || "";
	const gender = userInfo?.gender || "male";
	const currentYear = 2025;

	console.log("🎯 generatePersonalizedFallback called with:", {
		concern,
		birthDateTime,
		gender,
	});

	// Extract birth year for personalized analysis
	const birthYear = birthDateTime
		? new Date(birthDateTime).getFullYear()
		: 2000;
	const age = currentYear - birthYear;
	const lifeStage = age < 35 ? "青年" : age < 55 ? "中年" : "長者";
	const genderRef = gender === "female" || gender === "女" ? "女性" : "男性";

	// BaZi elements based on birth year (simplified for fallback)
	const yearElements = {
		1984: { year: "甲子", element: "海中金", dayMaster: "甲木" },
		1990: { year: "庚午", element: "路旁土", dayMaster: "庚金" },
		1996: { year: "丙子", element: "澗下水", dayMaster: "丙火" },
		2000: { year: "庚辰", element: "白臘金", dayMaster: "庚金" },
		1995: { year: "乙亥", element: "山頭火", dayMaster: "乙木" },
	};

	const baziInfo = yearElements[birthYear] || {
		year: "庚子",
		element: "壁上土",
		dayMaster: "庚金",
	};

	if (concern === "健康") {
		const healthResponse = {
			keywords: [
				{
					id: 1,
					text: "滋陰降火",
					description: `${baziInfo.dayMaster}日主遇${currentYear}乙巳年，火旺易耗陰液，${genderRef}${lifeStage}需重點滋陰降火調理`,
				},
				{
					id: 2,
					text: "養心安神",
					description: `${baziInfo.element}命格配流年，心火偏旺，${genderRef}宜早睡養陰血，保持心情平和`,
				},
				{
					id: 3,
					text: "潤肺護膚",
					description: `${birthYear}年生人逢流年克金，易致肺燥，${lifeStage}需多親近水木環境養護`,
				},
			],
			analysis: `${currentYear}年流年疊加大運，${genderRef}健康呈現「${baziInfo.dayMaster}火旺傷陰，調候養生」之象。`,
		};
		return JSON.stringify(healthResponse);
	}

	if (concern === "財運") {
		const wealthResponse = {
			keywords: [
				{
					id: 1,
					text: `${lifeStage}進財`,
					description: `${baziInfo.dayMaster}日主配${currentYear}年流年，${genderRef}${lifeStage}階段財運逐步上升，投資理財需謹慎`,
				},
				{
					id: 2,
					text: "理財考驗",
					description: `${baziInfo.element}命格遇流年，需防範投資風險，${lifeStage}宜保守理財為上策`,
				},
				{
					id: 3,
					text: "秋冬轉機",
					description: `根據${birthYear}年${baziInfo.year}特質，下半年財運轉佳，適合${genderRef}積極把握機會`,
				},
			],
			analysis: `${currentYear}年流年疊加大運，${genderRef}財運呈現「${baziInfo.dayMaster}生財有道，謹慎經營」之象。`,
		};
		return JSON.stringify(wealthResponse);
	}

	if (concern === "事業") {
		const careerResponse = {
			keywords: [
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
					description: `${birthYear}年生人在${currentYear}年，適合透過人脈網絡拓展事業版圖`,
				},
			],
			analysis: `${currentYear}年流年疊加大運，${genderRef}事業呈現「${baziInfo.dayMaster}穩中求進，順勢而為」之象。`,
		};
		return JSON.stringify(careerResponse);
	}

	// Default response for other concerns
	return JSON.stringify({
		keywords: [
			{
				id: 1,
				text: `${lifeStage}運勢`,
				description: `${baziInfo.dayMaster}日主配${currentYear}年流年，${genderRef}${concern}方面呈現穩定發展趨勢`,
			},
			{
				id: 2,
				text: "流年考驗",
				description: `${baziInfo.element}命格特質，${lifeStage}需要謹慎應對各種挑戰`,
			},
			{
				id: 3,
				text: "調候平衡",
				description: `根據${birthYear}年出生特質，宜保持身心平衡，順應自然`,
			},
		],
		analysis: `${currentYear}年流年疊加大運，${genderRef}${concern}呈現「${baziInfo.dayMaster}調候有序，漸入佳境」之象。`,
	});
}
