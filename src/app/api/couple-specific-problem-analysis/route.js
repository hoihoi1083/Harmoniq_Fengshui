import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const {
			femaleUser,
			maleUser,
			specificProblem,
			isSimplified = false,
		} = await request.json();

		console.log(
			"📥 /api/couple-specific-problem-analysis received isSimplified:",
			isSimplified,
		);

		// Format birth date for display
		const formatBirthDate = (birthDateTime) => {
			if (!birthDateTime) return "未提供";
			try {
				const date = new Date(birthDateTime);
				return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
			} catch (error) {
				return birthDateTime;
			}
		};

		// Use the fixed BaziCalculator directly to ensure consistency
		const calculateBaZi = (birthDateTime) => {
			try {
				console.log(`🧪 calculateBaZi called for: ${birthDateTime}`);

				// Import BaziCalculator that we know works correctly
				const {
					BaziCalculator,
				} = require("../../../lib/baziCalculator.js");

				const date = new Date(birthDateTime);
				const year = date.getFullYear();

				// Use the fixed BaziCalculator methods - pass date object to handle CNY correctly
				const yearPillar = BaziCalculator.getYearPillar(date);
				const dayPillar = BaziCalculator.getDayPillar(date);

				// Calculate month and hour using the same approach as EnhancedInitialAnalysis
				const month = date.getMonth() + 1;
				const hour = date.getHours();

				// Calculate month using traditional 五虎遁法 - pass date object to handle CNY correctly
				const monthPillarResult = BaziCalculator.getMonthPillar(
					date,
					month,
				);
				const monthPillar = monthPillarResult.combined;

				// Simplified hour pillar calculation
				const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
				const dayStemIndex = BaziCalculator.tianGan.indexOf(
					dayPillar.tianGan,
				);
				const hourStemIndex =
					(dayStemIndex * 12 + hourBranchIndex) % 10;
				const hourPillar =
					BaziCalculator.tianGan[hourStemIndex] +
					BaziCalculator.diZhi[hourBranchIndex];

				const result = {
					year: `${yearPillar.tianGan}${yearPillar.diZhi}`,
					month: monthPillar,
					day: `${dayPillar.tianGan}${dayPillar.diZhi}`,
					hour: hourPillar,
					dayStem: dayPillar.tianGan,
					dayBranch: dayPillar.diZhi,
				};

				console.log(
					`✅ BaziCalculator result for ${birthDateTime}:`,
					result,
				);
				return result;
			} catch (error) {
				console.error("BaziCalculator import failed:", error);

				// Fallback to manual calculation if import fails
				const date = new Date(birthDateTime);
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				const hour = date.getHours();

				// Heavenly Stems (天干)
				const heavenlyStems = [
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
				// Earthly Branches (地支)
				const earthlyBranches = [
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

				// Calculate year pillar (年柱)
				const yearStemIndex = (year - 4) % 10;
				const yearBranchIndex = (year - 4) % 12;
				const yearPillar =
					heavenlyStems[yearStemIndex] +
					earthlyBranches[yearBranchIndex];

				// Calculate month pillar (月柱) - simplified calculation
				const monthStemIndex = ((year - 4) * 12 + month - 1) % 10;
				const monthBranchIndex = (month + 1) % 12;
				const monthPillar =
					heavenlyStems[monthStemIndex] +
					earthlyBranches[monthBranchIndex];

				// Calculate day pillar (日柱) - simplified calculation
				const daysSinceReference = Math.floor(
					(date - new Date("1900-01-01")) / (1000 * 60 * 60 * 24),
				);
				const dayStemIndex = (daysSinceReference + 9) % 10;
				const dayBranchIndex = (daysSinceReference + 11) % 12;
				const dayPillar =
					heavenlyStems[dayStemIndex] +
					earthlyBranches[dayBranchIndex];

				// Calculate hour pillar (時柱)
				const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
				const hourStemIndex =
					(dayStemIndex * 12 + hourBranchIndex) % 10;
				const hourPillar =
					heavenlyStems[hourStemIndex] +
					earthlyBranches[hourBranchIndex];

				const fallbackResult = {
					year: yearPillar,
					month: monthPillar,
					day: dayPillar,
					hour: hourPillar,
					dayStem: heavenlyStems[dayStemIndex],
					dayBranch: earthlyBranches[dayBranchIndex],
				};

				console.log(
					`⚠️ Fallback calculation result for ${birthDateTime}:`,
					fallbackResult,
				);
				return fallbackResult;
			}
		}; // Generate BaZi analysis based on actual birth date
		const generateBaZiAnalysis = (birthDateTime, gender) => {
			const baziData = calculateBaZi(birthDateTime);
			const formattedDate = formatBirthDate(birthDateTime);

			// Create pillars array (bilingual support)
			const pillarLabels = isSimplified
				? ["年柱-", "月柱-", "日柱-", "时柱-"] // Simplified Chinese
				: ["年柱-", "月柱-", "日柱-", "時柱-"]; // Traditional Chinese

			const pillars = [
				`${pillarLabels[0]}${baziData.year}`,
				`${pillarLabels[1]}${baziData.month}`,
				`${pillarLabels[2]}${baziData.day}`,
				`${pillarLabels[3]}${baziData.hour}`,
			];

			// Create bazi string
			const baziString = `${baziData.year} ${baziData.month} ${baziData.day} ${baziData.hour}`;

			// Generate description based on day master (bilingual support)
			const dayMaster = baziData.dayStem;
			const dayBranch = baziData.dayBranch;

			// Element descriptions - Traditional Chinese
			const elementDescriptionsTraditional = {
				甲: "甲木如大樹，性格正直，具有領導能力",
				乙: "乙木如花草，性格溫和，適應力強",
				丙: "丙火如太陽，性格熱情，充滿活力",
				丁: "丁火如燭光，性格溫暖，富有創造力",
				戊: "戊土如山嶽，性格穩重，值得信賴",
				己: "己土如田園，性格務實，善於包容",
				庚: "庚金如刀劍，性格果斷，意志堅強",
				辛: "辛金如珠寶，性格細膩，追求完美",
				壬: "壬水如江河，性格靈活，智慧深邃",
				癸: "癸水如雨露，性格柔和，富有同情心",
			};

			// Element descriptions - Simplified Chinese
			const elementDescriptionsSimplified = {
				甲: "甲木如大树，性格正直，具有领导能力",
				乙: "乙木如花草，性格温和，适应力强",
				丙: "丙火如太阳，性格热情，充满活力",
				丁: "丁火如烛光，性格温暖，富有创造力",
				戊: "戊土如山岳，性格稳重，值得信赖",
				己: "己土如田园，性格务实，善于包容",
				庚: "庚金如刀剑，性格果断，意志坚强",
				辛: "辛金如珠宝，性格细腻，追求完美",
				壬: "壬水如江河，性格灵活，智慧深邃",
				癸: "癸水如雨露，性格柔和，富有同情心",
			};

			const elementDescriptions = isSimplified
				? elementDescriptionsSimplified
				: elementDescriptionsTraditional;
			const fallbackText = isSimplified
				? "性格独特，具有独特的人格魅力"
				: "性格獨特，具有獨特的人格魅力";

			// Map day stem to element
			const stemToElement = {
				甲: "木",
				乙: "木",
				丙: "火",
				丁: "火",
				戊: "土",
				己: "土",
				庚: "金",
				辛: "金",
				壬: "水",
				癸: "水",
			};

			const element = stemToElement[dayMaster] || "土";
			const description = `日主${dayMaster}${element}，${elementDescriptions[dayMaster] || fallbackText}`;

			return {
				birthDate: formattedDate,
				bazi: baziString,
				description: description,
				pillars: pillars,
			};
		}; // Calculate real BaZi for both users
		const femaleAnalysis = generateBaZiAnalysis(
			femaleUser.birthDateTime,
			"female",
		);
		const maleAnalysis = generateBaZiAnalysis(
			maleUser.birthDateTime,
			"male",
		);

		// Generate AI analysis prompt with actual BaZi data (bilingual support)
		const traditionalPrompt = `我理解每對夫妻都會遇到各種挑戰，讓我根據你們的真實八字資訊，提供專業的建議：

女方資訊：
- 出生時間：${femaleAnalysis.birthDate}
- 八字：${femaleAnalysis.bazi}
- 性別：女

男方資訊：
- 出生時間：${maleAnalysis.birthDate}
- 八字：${maleAnalysis.bazi}  
- 性別：男

具體問題：${specificProblem}

請基於這些真實的八字資訊，提供專業的合盤分析和針對具體問題的建議。重點分析兩人的五行互補性、相沖相合情況，以及如何解決提到的具體問題。

**請使用繁體中文回答**

請按照以下格式回覆：

1. **您的八字（女，${femaleAnalysis.birthDate}）**  
   八字：${femaleAnalysis.bazi}  
   （基於真實八字的詳細格局分析和性格特點）

2. **伴侶八字（男，${maleAnalysis.birthDate}）**  
   八字：${maleAnalysis.bazi}  
   （基於真實八字的詳細格局分析和性格特點）

3. **具體解決方案**
   
💡 **實際場景示例：**
- 溝通問題：設定每週固定的「深度對話時間」，關掉手機電視，面對面聊30分鐘
- 經濟衝突：建立透明的家庭帳本，每月一起檢視收支，共同決策大額開支
- 家務分工：製作家務清單，根據各自工作時間和擅長領域合理分配
- 婆媳矛盾：男方要做好「橋樑」角色，理解雙方立場，避免讓女方直接衝突
- 生育觀念：坦誠表達對孩子的期待和擔憂，尋求雙方都能接受的時間表

請提供基於真實八字的專業命理分析，結合實際生活情境給出可行建議。請確保使用繁體中文（台灣用語）。`;

		const simplifiedPrompt = `我理解每对夫妻都会遇到各种挑战，让我根据你们的真实八字信息，提供专业的建议：

女方信息：
- 出生时间：${femaleAnalysis.birthDate}
- 八字：${femaleAnalysis.bazi}
- 性别：女

男方信息：
- 出生时间：${maleAnalysis.birthDate}
- 八字：${maleAnalysis.bazi}  
- 性别：男

具体问题：${specificProblem}

请基于这些真实的八字信息，提供专业的合盘分析和针对具体问题的建议。重点分析两人的五行互补性、相冲相合情况，以及如何解决提到的具体问题。

**请使用简体中文回答**

请按照以下格式回复：

1. **您的八字（女，${femaleAnalysis.birthDate}）**  
   八字：${femaleAnalysis.bazi}  
   （基于真实八字的详细格局分析和性格特点）

2. **伴侣八字（男，${maleAnalysis.birthDate}）**  
   八字：${maleAnalysis.bazi}  
   （基于真实八字的详细格局分析和性格特点）

3. **具体解决方案**
   
💡 **实际场景示例：**
- 沟通问题：设定每周固定的「深度对话时间」，关掉手机电视，面对面聊30分钟
- 经济冲突：建立透明的家庭账本，每月一起检视收支，共同决策大额开支
- 家务分工：制作家务清单，根据各自工作时间和擅长领域合理分配
- 婆媳矛盾：男方要做好「桥梁」角色，理解双方立场，避免让女方直接冲突
- 生育观念：坦诚表达对孩子的期待和担忧，寻求双方都能接受的时间表

请提供基于真实八字的专业命理分析，结合实际生活情境给出可行建议。请确保使用简体中文（中国大陆用语）。`;

		const prompt = isSimplified ? simplifiedPrompt : traditionalPrompt;
		console.log(
			"🎯 /api/couple-specific-problem-analysis using prompt:",
			isSimplified ? "SIMPLIFIED (简体)" : "TRADITIONAL (繁體)",
		);

		// Make API call to DeepSeek
		const deepseekResponse = await fetch(
			"https://api.deepseek.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [
						{
							role: "system",
							content:
								"你是專業的八字命理分析師，精通八字合盤分析。請提供準確的八字計算和詳細的命理解讀。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 2000,
					temperature: 0.7,
				}),
			},
		);

		if (!deepseekResponse.ok) {
			throw new Error("DeepSeek API request failed");
		}

		const deepseekData = await deepseekResponse.json();
		const aiResponse = deepseekData.choices[0]?.message?.content || "";

		console.log("🤖 AI Response received, length:", aiResponse.length);
		console.log("🤖 AI Response preview:", aiResponse.substring(0, 500));

		// Parse the AI response to extract structured data
		const parseAnalysisResponse = (response) => {
			console.log(
				"🔍 PARSING AI RESPONSE - Full response length:",
				response.length,
			);
			console.log("🔍 First 500 characters:", response.substring(0, 500));
			console.log(
				"🔍 Last 500 characters:",
				response.substring(response.length - 500),
			);

			const sections = {
				female: {
					birthDate: formatBirthDate(femaleUser.birthDateTime),
					bazi: "",
					description: "",
					pillars: [],
				},
				male: {
					birthDate: formatBirthDate(maleUser.birthDateTime),
					bazi: "",
					description: "",
					pillars: [],
				},
			};

			// Parse female section
			console.log("🔍 Attempting to match female pattern...");
			const femaleMatch = response.match(
				/#{0,4}\s*1\.\s*\*\*您的八字（女[^）]*）\*\*\s*\*\*八字[：:]([^\n*]*)\*\*\s*([\s\S]*?)(?=#{0,4}\s*2\.|$)/,
			);
			if (femaleMatch) {
				console.log("✅ Female pattern matched!");
				console.log("   - BaZi:", femaleMatch[1].trim());
				console.log(
					"   - Description length:",
					femaleMatch[2].trim().length,
				);
				sections.female.bazi = femaleMatch[1].trim();
				sections.female.description = femaleMatch[2]
					.replace(/（([^）]*)）/, "$1")
					.trim(); // Extract pillars from bazi (bilingual support)
				const baziElements = femaleMatch[1].trim().split(/\s+/);
				if (baziElements.length >= 4) {
					const pillarLabels = isSimplified
						? ["年柱-", "月柱-", "日柱-", "时柱-"]
						: ["年柱-", "月柱-", "日柱-", "時柱-"];

					sections.female.pillars = [
						`${pillarLabels[0]}${baziElements[0] || "甲子"}`,
						`${pillarLabels[1]}${baziElements[1] || "乙丑"}`,
						`${pillarLabels[2]}${baziElements[2] || "丙寅"}`,
						`${pillarLabels[3]}${baziElements[3] || "丁卯"}`,
					];
				}
			} else {
				console.log("❌ Female pattern DID NOT match!");
			}

			// Parse male section
			console.log("🔍 Attempting to match male pattern...");
			const maleMatch = response.match(
				/#{0,4}\s*2\.\s*\*\*伴[侣侶]八字（男[^）]*）\*\*\s*\*\*八字[：:]([^\n*]*)\*\*\s*([\s\S]*?)(?=\n\n#{1,4}\s|---|\*\*\*|针对|关系发展|专业提醒|$)/,
			);
			if (maleMatch) {
				console.log("✅ Male pattern matched!");
				console.log("   - BaZi:", maleMatch[1].trim());
				console.log(
					"   - Description length:",
					maleMatch[2].trim().length,
				);
				sections.male.bazi = maleMatch[1].trim();
				sections.male.description = maleMatch[2]
					.replace(/（([^）]*)）/, "$1")
					.trim();

				// Extract pillars from bazi (bilingual support)
				const baziElements = maleMatch[1].trim().split(/\s+/);
				if (baziElements.length >= 4) {
					const pillarLabels = isSimplified
						? ["年柱-", "月柱-", "日柱-", "时柱-"]
						: ["年柱-", "月柱-", "日柱-", "時柱-"];

					sections.male.pillars = [
						`${pillarLabels[0]}${baziElements[0] || "戊辰"}`,
						`${pillarLabels[1]}${baziElements[1] || "己巳"}`,
						`${pillarLabels[2]}${baziElements[2] || "庚午"}`,
						`${pillarLabels[3]}${baziElements[3] || "辛未"}`,
					];
				}
			} else {
				console.log("❌ Male pattern DID NOT match!");
			}

			console.log("📋 PARSE RESULTS:", {
				female: {
					hasBazi: !!sections.female.bazi,
					baziLength: sections.female.bazi?.length || 0,
					hasDescription: !!sections.female.description,
					descriptionLength: sections.female.description?.length || 0,
				},
				male: {
					hasBazi: !!sections.male.bazi,
					baziLength: sections.male.bazi?.length || 0,
					hasDescription: !!sections.male.description,
					descriptionLength: sections.male.description?.length || 0,
				},
			});

			return sections;
		};

		let analysisData = parseAnalysisResponse(aiResponse);

		console.log("📊 Parsed female data:", {
			hasBazi: !!analysisData.female.bazi,
			hasDescription: !!analysisData.female.description,
			descriptionLength: analysisData.female.description?.length || 0,
		});
		console.log("📊 Parsed male data:", {
			hasBazi: !!analysisData.male.bazi,
			hasDescription: !!analysisData.male.description,
			descriptionLength: analysisData.male.description?.length || 0,
		});

		// Use real calculated BaZi if AI parsing failed or returned empty
		if (
			!analysisData.female.bazi ||
			analysisData.female.bazi.trim() === ""
		) {
			analysisData.female = {
				...femaleAnalysis,
				description:
					analysisData.female.description ||
					femaleAnalysis.description,
			};
		}

		if (!analysisData.male.bazi || analysisData.male.bazi.trim() === "") {
			analysisData.male = {
				...maleAnalysis,
				description:
					analysisData.male.description || maleAnalysis.description,
			};
		}

		// Ensure we always have the real BaZi data as backup
		analysisData.female.realBazi = femaleAnalysis.bazi;
		analysisData.male.realBazi = maleAnalysis.bazi;

		return NextResponse.json({
			success: true,
			female: analysisData.female,
			male: analysisData.male,
			rawResponse: aiResponse,
		});
	} catch (error) {
		console.error("Couple analysis error:", error);

		// Calculate real BaZi even if everything else fails
		try {
			const femaleAnalysis = generateBaZiAnalysis(
				femaleUser.birthDateTime,
				"female",
			);
			const maleAnalysis = generateBaZiAnalysis(
				maleUser.birthDateTime,
				"male",
			);

			return NextResponse.json({
				success: false,
				female: femaleAnalysis,
				male: maleAnalysis,
				error: "AI analysis failed, but real BaZi calculated successfully",
			});
		} catch (calcError) {
			console.error("BaZi calculation also failed:", calcError);
			return NextResponse.json({
				success: false,
				error: "Both AI analysis and BaZi calculation failed",
				female: {
					birthDate:
						formatBirthDate(femaleUser?.birthDateTime) || "未提供",
					bazi: "計算失敗",
					description: "無法計算八字，請檢查出生時間格式",
					pillars: [
						"年柱-未知",
						"月柱-未知",
						"日柱-未知",
						"時柱-未知",
					],
				},
				male: {
					birthDate:
						formatBirthDate(maleUser?.birthDateTime) || "未提供",
					bazi: "計算失敗",
					description: "無法計算八字，請檢查出生時間格式",
					pillars: [
						"年柱-未知",
						"月柱-未知",
						"日柱-未知",
						"時柱-未知",
					],
				},
			});
		}
	}
}
