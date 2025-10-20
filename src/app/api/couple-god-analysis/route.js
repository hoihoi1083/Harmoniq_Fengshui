import { NextRequest, NextResponse } from "next/server";
import { EnhancedInitialAnalysis } from "@/lib/enhancedInitialAnalysis";
import getWuxingData from "@/lib/nayin";
import { calculateUnifiedElements } from "@/lib/unifiedElementCalculation";

export async function POST(request) {
	try {
		const {
			user1Birthday,
			user2Birthday,
			user1Name,
			user2Name,
			compatibilityData,
			analysisType,
		} = await request.json();

		if (!user1Birthday || !user2Birthday) {
			return NextResponse.json(
				{ error: "Missing required birthday information" },
				{ status: 400 }
			);
		}

		console.log("🔍 Starting Ten Gods analysis for:", {
			user1Birthday,
			user2Birthday,
			user1Name,
			user2Name,
		});

		// Generate AI-powered Ten Gods interaction analysis
		const godExplanations = await generateTenGodsInteractionAnalysis(
			user1Birthday,
			user2Birthday,
			user1Name,
			user2Name,
			compatibilityData
		);

		console.log(
			"✅ Generated Ten Gods explanations:",
			godExplanations.length,
			"items"
		);

		return NextResponse.json({
			success: true,
			godExplanations,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("❌ Error in couple god analysis:", error);

		// Return fallback content with real bazi data
		const fallbackExplanations = await generateFallbackGodAnalysis(
			user1Birthday,
			user2Birthday,
			user1Name,
			user2Name
		);

		return NextResponse.json({
			success: true,
			godExplanations: fallbackExplanations,
			timestamp: new Date().toISOString(),
			warning: "Using fallback analysis due to error: " + error.message,
		});
	}
}

async function generateTenGodsInteractionAnalysis(
	user1Birthday,
	user2Birthday,
	user1Name,
	user2Name,
	compatibilityData
) {
	try {
		console.log("🎯 Generating AI-powered Ten Gods analysis...");

		// Get detailed bazi analysis for both users using unified element calculation
		const user1Elements = calculateUnifiedElements(user1Birthday, "male");
		const user2Elements = calculateUnifiedElements(user2Birthday, "female");

		// Get traditional bazi data structure for detailed calculations
		const user1BaziData = getWuxingData(user1Birthday, "male");
		const user2BaziData = getWuxingData(user2Birthday, "female");

		// Override with correct day master elements from unified calculation
		user1BaziData.dayStem = user1Elements.dayMasterStem;
		user1BaziData.dayStemWuxing = user1Elements.dayMasterElement;
		user2BaziData.dayStem = user2Elements.dayMasterStem;
		user2BaziData.dayStemWuxing = user2Elements.dayMasterElement;

		// Calculate actual Ten Gods for both users
		const user1TenGods = calculateTenGodsFromBazi(user1BaziData);
		const user2TenGods = calculateTenGodsFromBazi(user2BaziData);

		// Debug logging to verify unified element calculation
		console.log("🔍 Unified Element Calculation Results:");
		console.log(
			`男方 (${user1Birthday}): ${user1BaziData.dayStem}${user1BaziData.dayStemWuxing} (Day Master)`
		);
		console.log(
			`女方 (${user2Birthday}): ${user2BaziData.dayStem}${user2BaziData.dayStemWuxing} (Day Master)`
		);
		console.log("🎯 Ten Gods Calculation:");
		console.log(`男方 Ten Gods:`, user1TenGods.primaryGods);
		console.log(`女方 Ten Gods:`, user2TenGods.primaryGods);

		// CRITICAL: Verify day master accuracy
		console.log("⚠️ Day Master Verification:");
		console.log(
			`男方實際日主: ${user1Elements.dayMasterStem}${user1Elements.dayMasterElement}`
		);
		console.log(
			`女方實際日主: ${user2Elements.dayMasterStem}${user2Elements.dayMasterElement}`
		);

		// Generate accurate Ten Gods interactions between the two people
		const maleDayMaster =
			user1Elements.dayMasterStem + user1Elements.dayMasterElement;
		const femaleDayMaster =
			user2Elements.dayMasterStem + user2Elements.dayMasterElement;

		// Calculate how each person's day master affects the other
		const maleToFemaleGod = getTenGodName(
			user2Elements.dayMasterStem,
			user1Elements.dayMasterStem,
			user2Elements.dayMasterElement
		);
		const femaleToMaleGod = getTenGodName(
			user1Elements.dayMasterStem,
			user2Elements.dayMasterStem,
			user1Elements.dayMasterElement
		);

		console.log("🎭 Cross Ten Gods Analysis:");
		console.log(
			`男方${maleDayMaster} 對 女方${femaleDayMaster} = ${maleToFemaleGod}`
		);
		console.log(
			`女方${femaleDayMaster} 對 男方${maleDayMaster} = ${femaleToMaleGod}`
		);

		// Create comprehensive prompt with actual Ten Gods data
		const prompt = `作為頂尖的八字命理分析師，請根據以下雙方八字信息，進行深度的「十神互動精微解讀」分析：

**基本信息：**
- ${user1Name}（男方）：${user1Birthday}
- ${user2Name}（女方）：${user2Birthday}
- 男方八字：${user1BaziData.yearStem}${user1BaziData.yearBranch} ${user1BaziData.monthStem}${user1BaziData.monthBranch} ${user1BaziData.dayStem}${user1BaziData.dayBranch} ${user1BaziData.hourStem}${user1BaziData.hourBranch}
- 女方八字：${user2BaziData.yearStem}${user2BaziData.yearBranch} ${user2BaziData.monthStem}${user2BaziData.monthBranch} ${user2BaziData.dayStem}${user2BaziData.dayBranch} ${user2BaziData.hourStem}${user2BaziData.hourBranch}

**正確的日主與十神關係：**
- 男方日主：${maleDayMaster}
- 女方日主：${femaleDayMaster}
- 男方對女方的十神：${user1Name}${maleDayMaster}${maleToFemaleGod}
- 女方對男方的十神：${user2Name}${femaleDayMaster}${femaleToMaleGod}

**分析要求：**
請基於正確的日主和十神配置，提供2個關鍵的十神互動分析：

**第一個分析（女方→男方）：**
請分析${user2Name}${femaleDayMaster}對${user1Name}${maleDayMaster}的${femaleToMaleGod}關係

**第二個分析（男方→女方）：**
請分析${user1Name}${maleDayMaster}對${user2Name}${femaleDayMaster}的${maleToFemaleGod}關係

每個分析請包含：
1. 具體的互動機制（150-200字）
2. 關鍵要點和注意事項（100-150字）
3. 實用的化解建議（100-150字）

**格式要求：**
1. 使用正確的日主天干地支和十神名稱
2. 格式：${user2Name}${femaleDayMaster}${femaleToMaleGod} → ${user1Name}${maleDayMaster}
3. 格式：${user1Name}${maleDayMaster}${maleToFemaleGod} → ${user2Name}${femaleDayMaster}
4. 說明組合的核心機制和化解建議

**重要：必須使用正確的日主（${maleDayMaster}和${femaleDayMaster}），不要使用其他柱的天干。**

請用繁體中文回答。`;

		console.log("🤖 Calling AI API with prompt...");

		// Call AI service for Ten Gods analysis
		const aiResponse =
			await EnhancedInitialAnalysis.generateCoupleAIAnalysis(
				new Date(user1Birthday),
				new Date(user2Birthday),
				user1BaziData.dayStemWuxing || "土",
				user2BaziData.dayStemWuxing || "土",
				prompt
			);

		console.log(
			"🎉 AI Response received:",
			aiResponse ? "Success" : "Failed"
		);

		if (!aiResponse) {
			throw new Error("AI response is empty");
		}

		// Parse and structure the AI response
		const structuredExplanations = parseGodInteractionResponse(
			aiResponse,
			user1BaziData,
			user2BaziData,
			user1Name,
			user2Name,
			user1TenGods,
			user2TenGods
		);

		console.log(
			"📊 Parsed explanations:",
			structuredExplanations.length,
			"items"
		);

		if (structuredExplanations.length === 0) {
			throw new Error("Failed to parse AI response into structured data");
		}

		return structuredExplanations;
	} catch (error) {
		console.error("❌ Error generating AI god analysis:", error);

		// Generate fallback content with real bazi data
		return await generateFallbackGodAnalysis(
			user1Birthday,
			user2Birthday,
			user1Name,
			user2Name
		);
	}
}

// Calculate actual Ten Gods from bazi data
function calculateTenGodsFromBazi(baziData) {
	const dayElement = baziData.dayStemWuxing; // Use correct property name
	const dayHeavenlyStem = baziData.dayStem; // Use correct property name

	// Get all pillars
	const pillars = [
		{ heavenly: baziData.yearStem, earthly: baziData.yearBranch },
		{ heavenly: baziData.monthStem, earthly: baziData.monthBranch },
		{ heavenly: baziData.dayStem, earthly: baziData.dayBranch },
		{ heavenly: baziData.hourStem, earthly: baziData.hourBranch },
	];

	const tenGods = [];
	const primaryGods = [];

	// Calculate Ten Gods for each pillar
	pillars.forEach((pillar, index) => {
		if (pillar.heavenly && pillar.heavenly !== dayHeavenlyStem) {
			const godName = getTenGodName(
				dayHeavenlyStem,
				pillar.heavenly,
				dayElement
			);
			if (godName) {
				tenGods.push(
					`${pillar.heavenly}${getElementFromStem(pillar.heavenly)}${godName}`
				);
				if (index < 2) {
					// Year and Month pillars are primary
					primaryGods.push(
						`${pillar.heavenly}${getElementFromStem(pillar.heavenly)}${godName}`
					);
				}
			}
		}
	});

	// Ensure we have at least one primary god
	if (primaryGods.length === 0 && tenGods.length > 0) {
		primaryGods.push(tenGods[0]);
	}

	return {
		allGods: tenGods,
		primaryGods:
			primaryGods.length > 0
				? primaryGods
				: [`${dayHeavenlyStem}${dayElement}比肩`],
	};
}

// Get Ten God name based on relationship
function getTenGodName(dayMaster, targetStem, dayElement) {
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

	const targetElement = stemToElement[targetStem];
	const dayMasterType = ["甲", "丙", "戊", "庚", "壬"].includes(dayMaster)
		? "yang"
		: "yin";
	const targetType = ["甲", "丙", "戊", "庚", "壬"].includes(targetStem)
		? "yang"
		: "yin";
	const samePolarity = dayMasterType === targetType;

	// Five element relationships
	if (dayElement === targetElement) {
		return samePolarity ? "比肩" : "劫財";
	}

	// Check what day element produces
	const productions = {
		木: "火",
		火: "土",
		土: "金",
		金: "水",
		水: "木",
	};
	if (productions[dayElement] === targetElement) {
		return samePolarity ? "食神" : "傷官";
	}

	// Check what produces day element
	const producers = {
		火: "木",
		土: "火",
		金: "土",
		水: "金",
		木: "水",
	};
	if (producers[dayElement] === targetElement) {
		return samePolarity ? "偏印" : "正印";
	}

	// Check what day element conquers
	const conquers = {
		木: "土",
		火: "金",
		土: "水",
		金: "木",
		水: "火",
	};
	if (conquers[dayElement] === targetElement) {
		return samePolarity ? "偏財" : "正財";
	}

	// Check what conquers day element
	const conquered = {
		土: "木",
		金: "火",
		水: "土",
		木: "金",
		火: "水",
	};
	if (conquered[dayElement] === targetElement) {
		return samePolarity ? "七殺" : "正官";
	}

	return "比肩";
}

// Get element from heavenly stem
function getElementFromStem(stem) {
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
	return stemToElement[stem] || "土";
}

function parseGodInteractionResponse(
	aiResponse,
	user1Bazi,
	user2Bazi,
	user1Name,
	user2Name,
	user1TenGods,
	user2TenGods
) {
	// Parse the AI response and extract structured god interaction data
	const explanations = [];

	// Split by common section indicators and arrows
	const sections = aiResponse.split(
		/(?=\d+[\.\)、])|(?=女方.*→)|(?=男方.*→)|(?=財星對沖)|(?=官殺混雜)|(?=印星)|(?=食神)|(?=正財)|(?=偏財)/
	);

	for (const section of sections) {
		const trimmedSection = section.trim();
		if (trimmedSection.length < 30) continue; // Skip very short sections

		let currentExplanation = {
			category: "互動神",
			fromGod: "",
			toGod: "",
			interaction: "",
			keyIssues: "",
			problems: [],
			solution: "",
		};

		// Enhanced arrow pattern matching to capture specific god names
		const arrowPatterns = [
			// Pattern 1: 女方XXX偏印 → 男方XXX食神
			/(女方)([^→]*?)(偏印|正印|食神|傷官|偏財|正財|偏官|七殺|正官|比肩|劫財)[^→]*?→\s*(男方)([^。]*?)(偏印|正印|食神|傷官|偏財|正財|偏官|七殺|正官|比肩|劫財)/,
			// Pattern 2: 男方XXX正官 → 女方XXX七殺
			/(男方)([^→]*?)(偏印|正印|食神|傷官|偏財|正財|偏官|七殺|正官|比肩|劫財)[^→]*?→\s*(女方)([^。]*?)(偏印|正印|食神|傷官|偏財|正財|偏官|七殺|正官|比肩|劫財)/,
			// Pattern 3: Simple 女方XXX → 男方XXX
			/(女方)([^→]+)→\s*(男方)([^。]+)/,
			// Pattern 4: Simple 男方XXX → 女方XXX
			/(男方)([^→]+)→\s*(女方)([^。]+)/,
		];

		let matchFound = false;
		for (const pattern of arrowPatterns) {
			const arrowMatch = trimmedSection.match(pattern);
			if (arrowMatch) {
				if (arrowMatch.length >= 6) {
					// Full pattern with god names
					currentExplanation.fromGod =
						arrowMatch[1] + arrowMatch[2] + arrowMatch[3];
					currentExplanation.toGod =
						arrowMatch[4] + arrowMatch[5] + arrowMatch[6];
				} else {
					// Simple pattern
					currentExplanation.fromGod =
						arrowMatch[1] + arrowMatch[2].trim();
					currentExplanation.toGod =
						arrowMatch[3] + arrowMatch[4].trim();
				}
				matchFound = true;
				break;
			}
		}

		// If arrow pattern found, extract the rest of the content
		if (matchFound) {
			// Post-process god names to ensure gender prefixes
			if (
				currentExplanation.fromGod &&
				!currentExplanation.fromGod.includes("女方") &&
				!currentExplanation.fromGod.includes("男方")
			) {
				currentExplanation.fromGod = `女方${currentExplanation.fromGod}`;
			}
			if (
				currentExplanation.toGod &&
				!currentExplanation.toGod.includes("女方") &&
				!currentExplanation.toGod.includes("男方")
			) {
				currentExplanation.toGod = `男方${currentExplanation.toGod}`;
			}

			// Extract the rest of the content after the arrow
			const afterArrow = trimmedSection.substring(
				trimmedSection.indexOf("→") + 1
			);
			const sentences = afterArrow.split(/[。；]/);

			for (const sentence of sentences) {
				const cleanSentence = sentence.trim();
				if (cleanSentence.length < 5) continue;

				if (
					cleanSentence.includes("此為") ||
					cleanSentence.includes("組合")
				) {
					currentExplanation.interaction += cleanSentence + "。";
				} else if (
					cleanSentence.includes("關鍵") ||
					cleanSentence.includes("注意")
				) {
					currentExplanation.keyIssues += cleanSentence + "。";
				} else if (
					cleanSentence.includes("化解") ||
					cleanSentence.includes("建議")
				) {
					currentExplanation.solution += cleanSentence + "。";
				} else if (currentExplanation.interaction === "") {
					currentExplanation.interaction += cleanSentence + "。";
				}
			}
		}

		// Clean up and validate the explanation
		if (
			currentExplanation.interaction.trim() ||
			currentExplanation.problems.length > 0
		) {
			currentExplanation.interaction =
				currentExplanation.interaction.trim();
			currentExplanation.keyIssues = currentExplanation.keyIssues.trim();
			currentExplanation.solution = currentExplanation.solution.trim();

			// Use real Ten Gods data instead of hardcoded values
			if (!currentExplanation.fromGod) {
				const isFirstSection = explanations.length === 0;
				if (isFirstSection) {
					// First section: female -> male
					currentExplanation.fromGod =
						user2TenGods.primaryGods[0] || `${user2Name}主要十神`;
					currentExplanation.toGod =
						user1TenGods.primaryGods[0] || `${user1Name}主要十神`;
				} else {
					// Second section: male -> female
					currentExplanation.fromGod =
						user1TenGods.primaryGods[0] || `${user1Name}主要十神`;
					currentExplanation.toGod =
						user2TenGods.primaryGods[0] || `${user2Name}主要十神`;
				}
			}
			if (!currentExplanation.toGod) {
				const isFirstSection = explanations.length === 0;
				currentExplanation.toGod = isFirstSection
					? user1TenGods.primaryGods[0] || `${user1Name}主要十神`
					: user2TenGods.primaryGods[0] || `${user2Name}主要十神`;
			}

			explanations.push(currentExplanation);
		}
	}

	// If parsing failed, generate based on real bazi data
	if (explanations.length === 0) {
		return generateRealBaziFallback(
			user1Bazi,
			user2Bazi,
			user1TenGods,
			user2TenGods,
			user1Name,
			user2Name
		);
	}

	return explanations;
}

function generateRealBaziFallback(
	user1Bazi,
	user2Bazi,
	user1TenGods,
	user2TenGods,
	user1Name,
	user2Name
) {
	// Generate explanations based on real bazi calculations
	const explanations = [];

	console.log("🔍 Fallback Debug - Raw Ten Gods:");
	console.log("Female Ten Gods:", user2TenGods.primaryGods);
	console.log("Male Ten Gods:", user1TenGods.primaryGods);

	// First analysis: Female -> Male
	const rawFemaleGod =
		user2TenGods.primaryGods[0] || `${user2Bazi.dayStemWuxing || "五行"}命`;
	const rawMaleGod =
		user1TenGods.primaryGods[0] || `${user1Bazi.dayStemWuxing || "五行"}命`;

	// Ensure gender prefixes are added
	const femaleGod = rawFemaleGod.includes("女方")
		? rawFemaleGod
		: `女方${rawFemaleGod}`;
	const maleGod = rawMaleGod.includes("男方")
		? rawMaleGod
		: `男方${rawMaleGod}`;

	console.log("🎯 Processed Ten Gods:");
	console.log("Female God:", femaleGod);
	console.log("Male God:", maleGod);

	explanations.push({
		category: "互動分析",
		fromGod: femaleGod,
		toGod: maleGod,
		interaction: `此為${femaleGod}與${maleGod}的互動組合。基於實際八字分析，雙方在五行能量上形成特定的相互作用關係。`,
		keyIssues: `關鍵在於理解${user2Bazi.dayStemWuxing || "女方"}命與${user1Bazi.dayStemWuxing || "男方"}命的五行生剋關係，以及如何在日常相處中化解潛在衝突。`,
		problems: [],
		solution: `建議雙方根據各自的五行特質調整相處模式，${user2Name}發揮${user2Bazi.dayStemWuxing || "女方"}的優勢，${user1Name}善用${user1Bazi.dayStemWuxing || "男方"}的特質，達到互補平衡。`,
	});

	// Second analysis: Male -> Female (if we have enough data)
	if (
		user1TenGods.primaryGods.length > 1 ||
		user2TenGods.primaryGods.length > 1
	) {
		const rawMaleGod2 =
			user1TenGods.primaryGods[1] || user1TenGods.primaryGods[0];
		const rawFemaleGod2 =
			user2TenGods.primaryGods[1] || user2TenGods.primaryGods[0];

		// Ensure gender prefixes are added
		const maleGod2 = rawMaleGod2.includes("男方")
			? rawMaleGod2
			: `男方${rawMaleGod2}`;
		const femaleGod2 = rawFemaleGod2.includes("女方")
			? rawFemaleGod2
			: `女方${rawFemaleGod2}`;

		explanations.push({
			category: "相互影響",
			fromGod: maleGod2,
			toGod: femaleGod2,
			interaction: `${maleGod2}對${femaleGod2}產生的影響分析。這個組合反映了雙方在不同層面的互動模式。`,
			keyIssues: `需要注意的是雙方的能量表達方式差異，避免因理解偏差而產生誤會。`,
			problems: [],
			solution: `建議透過增進溝通理解，讓雙方的優勢特質能夠相互支持而非對立。`,
		});
	}

	return explanations;
}

async function generateFallbackGodAnalysis(
	user1Birthday,
	user2Birthday,
	user1Name,
	user2Name
) {
	console.log(
		"🔄 Generating fallback Ten Gods analysis with real bazi data..."
	);

	// Generate real bazi data for fallback
	const user1Elements = calculateUnifiedElements(user1Birthday, "male");
	const user2Elements = calculateUnifiedElements(user2Birthday, "female");

	const user1BaziData = getWuxingData(user1Birthday, "male");
	const user2BaziData = getWuxingData(user2Birthday, "female");

	// Override with correct day master elements
	user1BaziData.dayStem = user1Elements.dayMasterStem;
	user1BaziData.dayStemWuxing = user1Elements.dayMasterElement;
	user2BaziData.dayStem = user2Elements.dayMasterStem;
	user2BaziData.dayStemWuxing = user2Elements.dayMasterElement;

	const user1TenGods = calculateTenGodsFromBazi(user1BaziData);
	const user2TenGods = calculateTenGodsFromBazi(user2BaziData);

	return generateRealBaziFallback(
		user1BaziData,
		user2BaziData,
		user1TenGods,
		user2TenGods,
		user1Name,
		user2Name
	);
}
