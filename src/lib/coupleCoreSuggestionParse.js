/**
 * Parse couple core suggestion API raw content into the same structures
 * used by the web CoupleCoreSuggestion (關係發展建議, 能量提升建議, 感情關係禁忌).
 * Used by couple print report page 6 so print matches web content.
 */

function cleanMarkdownFormatting(text) {
	if (!text) return text;
	return text
		.replace(/\*\*(.*?)\*\*/g, "$1")
		.replace(/\*\*\s*/g, "")
		.replace(/\s*\*\*/g, "");
}

const CONVERT_MAP = {
	计划: "計劃", 约会: "約會", 时机与方法: "時機與方法", 时机: "時機", 发展: "發展", 过程: "過程",
	说话: "說話", 沟通: "溝通", 经济: "經濟", 财务: "財務", 诚实: "誠實", 诚信: "誠信", 学习: "學習",
	沟通禁忌: "溝通禁忌", 行为禁忌: "行為禁忌", 环境禁忌: "環境禁忌", 行为: "行為",
	实践: "實踐", 实际: "實際", 实现: "實現", 应该: "應該", 应当: "應當", 选择: "選擇", 环境: "環境",
	围绕: "圍繞", 创造: "創造", 营造: "營造", 维护: "維護", 维持: "維持", 关系: "關係", 问题: "問題",
	处理: "處理", 联系: "聯系", 连接: "連接", 设计: "設計", 装饰: "裝飾", 风格: "風格", 样式: "樣式",
	颜色: "顏色", 颜值: "顏值", 质量: "質量", 质感: "質感", 共同制定年度计划: "共同制定年度計劃",
	制定: "制定", 讨论: "討論", 决定: "決定", 项目: "項目", 规划: "規劃", 管理: "管理", 资源: "資源",
	资金: "資金", 资产: "資產", 协调: "協調", 协商: "協商", 调整: "調整", 调节: "調節", 调和: "調和",
	运气: "運氣", 运势: "運勢", 行动建议: "行動建議", 升温: "升溫", 庆典: "慶典", 温暖: "溫暖",
	压力: "壓力", 节点: "節點", 绿色: "綠色", 练习: "練習", 习惯: "習慣",
};

function convertToTraditionalChinese(text) {
	if (!text) return text;
	let out = text;
	for (const [s, t] of Object.entries(CONVERT_MAP)) {
		out = out.replace(new RegExp(s, "g"), t);
	}
	return out;
}

function cleanContent(text) {
	if (!text) return text;
	let cleaned = cleanMarkdownFormatting(text);
	cleaned = convertToTraditionalChinese(cleaned);
	return cleaned;
}

function extractCategoryContent(fullContent, categoryTitle, sectionPattern) {
	try {
		if (categoryTitle === "感情關係禁忌") {
			if (
				fullContent &&
				(fullContent.includes("溝通禁忌") ||
					fullContent.includes("行為禁忌") ||
					fullContent.includes("環境禁忌") ||
					(fullContent.includes("女方忌用") && fullContent.includes("男方忌用")) ||
					fullContent.includes("約會避開") ||
					fullContent.includes("同房禁忌"))
			) {
				return parseRelationshipTaboosContent(fullContent);
			}
			return getFallbackTaboos();
		}

		const patterns = [
			new RegExp(`${sectionPattern}[：:]?([\\s\\S]*?)(?=(?:一、|二、|三、|四、|###|$))`, "g"),
			new RegExp(`${categoryTitle}[：:]?([\\s\\S]*?)(?=(?:關係發展|溝通建議|能量提升|感情關係|$))`, "g"),
			new RegExp(`【${categoryTitle}】([\\s\\S]*?)(?=【|$)`, "g"),
		];

		for (const pattern of patterns) {
			pattern.lastIndex = 0;
			const match = pattern.exec(fullContent);
			if (match && match[1] && match[1].trim().length > 50) {
				if (categoryTitle === "關係發展建議") {
					return parseRelationshipDevelopmentContent(match[1].trim());
				}
				if (categoryTitle === "能量提升建議") {
					return parseEnergyEnhancementContent(match[1].trim());
				}
				if (categoryTitle === "感情關係禁忌") {
					return parseRelationshipTaboosContent(match[1].trim());
				}
				return { type: "text", content: cleanContent(match[1].trim()) };
			}
		}
		if (categoryTitle === "關係發展建議") return getFallbackRelationship();
		if (categoryTitle === "能量提升建議") return getFallbackEnergy();
		return getFallbackTaboos();
	} catch (e) {
		if (categoryTitle === "關係發展建議") return getFallbackRelationship();
		if (categoryTitle === "能量提升建議") return getFallbackEnergy();
		return getFallbackTaboos();
	}
}

const SUBSECTION_TITLES = {
	actionAdvice: "行動建議",
	bestTiming: "時機與方法",
	precautions: "注意事項",
	destinyGuidance: "命理指引",
};

function parseRelationshipDevelopmentContent(content) {
	try {
		const cleanedContent = cleanContent(content);
		const analysisMatch = cleanedContent.match(/(?:具体分析|具體分析)[：:]?([\s\S]*?)(?=(?:行动建议|行動建議|时机与方法|時機與方法|注意事项|注意事項)|$)/);
		const actionMatch = cleanedContent.match(/(?:行动建议|行動建議)[：:]?([\s\S]*?)(?=(?:时机与方法|時機與方法|注意事项|注意事項)|$)/);
		const timingMatch = cleanedContent.match(/(?:时机与方法|時機與方法)[：:]?([\s\S]*?)(?=(?:注意事项|注意事項)|$)/);
		const noteMatch = cleanedContent.match(/(?:注意事项|注意事項)[：:]?([\s\S]*?)$/);
		const structuredContent = {
			analysis: analysisMatch ? analysisMatch[1].trim() : "",
			actions: actionMatch ? actionMatch[1].trim() : "",
			timing: timingMatch ? timingMatch[1].trim() : "",
			notes: noteMatch ? noteMatch[1].trim() : "",
		};

		const subsections = [];
		const actionPattern = /(?:行動建議|行动建议)[：:]?([\s\S]*?)(?=時機與方法|时机与方法|注意事項|注意事项|具体分析|具體分析|###|$)/i;
		const actionContentMatch = content.match(actionPattern);
		if (actionContentMatch && actionContentMatch[1]) {
			const actionContent = cleanContent(actionContentMatch[1].trim());
			if (actionContent.length > 20) {
				subsections.push({ title: SUBSECTION_TITLES.actionAdvice, color: "bg-yellow-500", content: actionContent });
			}
		}
		const timingPattern = /(?:時機與方法|时机与方法)[：:]?([\s\S]*?)(?=注意事項|注意事项|行動建議|行动建议|具体分析|具體分析|###|$)/i;
		const timingContentMatch = content.match(timingPattern);
		if (timingContentMatch && timingContentMatch[1]) {
			const timingContent = cleanContent(timingContentMatch[1].trim());
			if (timingContent.length > 20) {
				subsections.push({ title: SUBSECTION_TITLES.bestTiming, color: "bg-yellow-500", content: timingContent });
			}
		}
		const notesPattern = /(?:注意事項|注意事项)[：:]?([\s\S]*?)(?=行動建議|行动建议|時機與方法|时机与方法|具体分析|具體分析|###|$)/i;
		const notesContentMatch = content.match(notesPattern);
		if (notesContentMatch && notesContentMatch[1]) {
			const notesContent = cleanContent(notesContentMatch[1].trim());
			if (notesContent.length > 20) {
				subsections.push({ title: SUBSECTION_TITLES.precautions, color: "bg-yellow-500", content: notesContent });
			}
		}
		if (subsections.length < 2) {
			const analysisPattern = /(?:具体分析|具體分析)[：:]?([\s\S]*?)(?=行動建議|行动建议|時機與方法|时机与方法|注意事項|注意事项|###|$)/i;
			const analysisContentMatch = content.match(analysisPattern);
			if (analysisContentMatch && analysisContentMatch[1]) {
				let analysisContent = analysisContentMatch[1].trim();
				if (/建議|方法|時機|注意|避免|適合|宜|應該/.test(analysisContent)) {
					const practicalSentences = analysisContent
						.split(/[。！？]/)
						.filter((s) => /建議|方法|時機|注意|避免|適合|宜|應該|最佳/.test(s))
						.map((s) => s.trim() + "。")
						.join("");
					if (practicalSentences.length > 20) {
						subsections.push({ title: SUBSECTION_TITLES.destinyGuidance, color: "bg-yellow-500", content: cleanContent(practicalSentences) });
					}
				}
			}
		}
		if (subsections.length === 0) {
			subsections.push(
				{ title: SUBSECTION_TITLES.actionAdvice, color: "bg-yellow-500", content: structuredContent.actions || "避免重大關係決策（如同居、購房），優先經營日常溫情。" },
				{ title: SUBSECTION_TITLES.bestTiming, color: "bg-yellow-500", content: structuredContent.timing || "每月安排一次「無目的約會」（如深夜散步、看星星），脫離現實壓力場景。" },
				{ title: SUBSECTION_TITLES.precautions, color: "bg-yellow-500", content: structuredContent.notes || "男方主動策劃驚喜（丁火需木火激發熱情），例如親手製作禮物。" }
			);
		}
		return { type: "subsections", subsections };
	} catch (e) {
		return { type: "text", content: content };
	}
}

function extractActionAdvice(content, gender) {
	const patterns = [
		`\\*\\*${gender}提升建議[：]*\\*\\*[\\s\\S]*?行動建議[：]*([\\s\\S]*?)(?=開運物|\\*\\*女方|\\*\\*共同|$)`,
		`${gender}提升建議[\\s\\S]*?行動建議[：]*([\\s\\S]*?)(?=開運物|${gender === "男方" ? "女方" : "共同"}|$)`,
	];
	for (const pattern of patterns) {
		const regex = new RegExp(pattern, "i");
		const match = content.match(regex);
		if (match && match[1]) {
			const actionText = match[1].trim();
			let actionItems = actionText
				.split(/•|\n/)
				.map((item) => cleanContent(item.trim()))
				.filter((item) => item.length > 5 && !item.includes("開運物") && !item.includes("女方") && !item.includes("共同"));
			if (actionItems && actionItems.length > 0) return actionItems.slice(0, 3);
		}
	}
	const directPattern = new RegExp(`\\*\\*${gender}提升建議[：]*\\*\\*[\\s\\S]*?•([^•]*?)•([^•]*?)(?=開運物|\\*\\*|$)`, "i");
	const directMatch = content.match(directPattern);
	if (directMatch) {
		const items = [];
		if (directMatch[1]) items.push(cleanContent(directMatch[1].trim()));
		if (directMatch[2]) items.push(cleanContent(directMatch[2].trim()));
		return items;
	}
	return [];
}

function extractAccessories(content, gender) {
	const patterns = [
		`\\*\\*${gender}提升建議[：]*\\*\\*[\\s\\S]*?開運物[：]*([\\s\\S]*?)(?=\\*\\*女方|\\*\\*共同|\\*\\*|$)`,
		`${gender}提升建議[\\s\\S]*?開運物[：]*([\\s\\S]*?)(?=${gender === "男方" ? "女方" : "共同"}|$)`,
	];
	for (const pattern of patterns) {
		const regex = new RegExp(pattern, "i");
		const match = content.match(regex);
		if (match && match[1]) {
			const accessoryText = cleanContent(match[1].trim().replace(/^\s*：\s*/, ""));
			const accessories = accessoryText
				.split(/[、，,]/)
				.map((item) => cleanContent(item.trim()))
				.filter((item) => item.length > 0 && !item.includes("女方") && !item.includes("共同") && !item.includes("建議"));
			return accessories.length > 0 ? accessories : [accessoryText];
		}
	}
	return [];
}

function extractWeeklyRitual(content) {
	const patterns = [/\*\* 每週儀式：([\s\S]*?)(?=\*\*|$)/, /每週儀式[：]*([^場合]*?)(?=場合|$)/i, /每週六[^。]*。?/];
	for (const pattern of patterns) {
		const match = content.match(pattern);
		if (match && match[1]) return cleanContent(match[1].trim());
		if (match && match[0] && pattern.source.includes("每週六")) return cleanContent(match[0]);
	}
	const alt = [/每週[^。]*共同[^。]*。/, /定期[^。]*活動[^。]*。/, /共同[^。]*儀式[^。]*。/];
	for (const p of alt) {
		const m = content.match(p);
		if (m) return cleanContent(m[0]);
	}
	return "";
}

function extractSituationTable(content) {
	try {
		const patterns = [/\*\* 場合色彩搭配：([\s\S]*?)(?=###|$)/, /場合色彩搭配[：]*([^#]*?)(?=###|四、|$)/i, /重要商務場合[：]*([^#]*?)(?=###|四、|$)/i];
		let tableContent = null;
		for (const pattern of patterns) {
			const match = content.match(pattern);
			if (match && match[1]) {
				tableContent = cleanContent(match[1].trim());
				break;
			}
		}
		if (!tableContent) return [];
		const situations = [];
		const situationNames = ["重要商務場合", "社交聚會", "居家生活"];
		for (const situationName of situationNames) {
			const situationPattern = new RegExp(`${situationName}[：]*([\\s\\S]*?)(?=${situationNames.filter((s) => s !== situationName).join("|")}|$)`, "i");
			const situationMatch = tableContent.match(situationPattern);
			if (situationMatch && situationMatch[1]) {
				const situationText = cleanContent(situationMatch[1].trim());
				const maleMatch = situationText.match(/[-–]*\s*男方[：]*([^\n]*)/);
				const femaleMatch = situationText.match(/[-–]*\s*女方[：]*([^\n]*)/);
				const energyMatch = situationText.match(/[-–]*\s*能量作用[：]*([^\n]*)/);
				if (maleMatch && femaleMatch) {
					situations.push({
						title: situationName,
						colors: { male: [cleanContent(maleMatch[1].trim())], female: [cleanContent(femaleMatch[1].trim())] },
						energyFunction: energyMatch ? cleanContent(energyMatch[1].trim()) : "五行調和",
					});
				}
			}
		}
		return situations;
	} catch (e) {
		return [];
	}
}

function parseEnergyEnhancementContent(content) {
	try {
		const energyStructure = {
			title: "能量提升建議",
			type: "energy-enhancement",
			maleSection: {
				title: "男方提升建議",
				actionAdvice: extractActionAdvice(content, "男方"),
				accessories: extractAccessories(content, "男方"),
			},
			femaleSection: {
				title: "女方提升建議",
				actionAdvice: extractActionAdvice(content, "女方"),
				accessories: extractAccessories(content, "女方"),
			},
			sharedEnhancement: {
				title: "共同能量場強化",
				weeklyRitual: { title: "每週儀式", content: extractWeeklyRitual(content) },
				situations: extractSituationTable(content),
			},
		};
		const energyAnalysisMatch = content.match(/雙方五行[^。]*互補關係[^。]*。/);
		if (energyAnalysisMatch) energyStructure.analysis = energyAnalysisMatch[0];
		const fengShuiMatch = content.match(/居家風水[^。]*。|家居佈置[^。]*。|擺放[^。]*。/g);
		if (fengShuiMatch && fengShuiMatch.length > 0) energyStructure.fengShuiSuggestions = fengShuiMatch;
		const luckyColorsMatch = content.match(/年度幸運色系[：:]?([^。]*)/);
		if (luckyColorsMatch) energyStructure.luckyColors = cleanContent(luckyColorsMatch[1].trim());
		return energyStructure;
	} catch (e) {
		return { type: "text", content: cleanContent(content) };
	}
}

function parseRelationshipTaboosContent(content) {
	try {
		content = cleanContent(content || "");
		const tabooStructure = { type: "relationship-taboos", title: "感情關係禁忌", sections: [], monthlyNote: null };
		const lines = content.split("\n").filter((line) => line.trim() !== "");
		let currentSection = null;
		let currentSubsection = null;
		let collectingContent = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line === "溝通禁忌") {
				currentSection = { title: "溝通禁忌", color: "bg-pink-600", subsections: [] };
				tabooStructure.sections.push(currentSection);
				continue;
			}
			if (line === "行為禁忌") {
				currentSection = { title: "行為禁忌", color: "bg-red-600", subsections: [] };
				tabooStructure.sections.push(currentSection);
				continue;
			}
			if (line === "環境禁忌") {
				currentSection = { title: "環境禁忌", color: "bg-red-800", subsections: [] };
				tabooStructure.sections.push(currentSection);
				continue;
			}
			if (line.startsWith("每月初")) {
				tabooStructure.monthlyNote = { title: "每月初", content: cleanContent(line) };
				continue;
			}
			if (currentSection) {
				if (["女方忌用", "男方忌用", "春季", "夏季", "戊月", "約會避開", "同房禁忌"].includes(line)) {
					if (currentSubsection && collectingContent.trim()) {
						currentSubsection.content = collectingContent.trim();
						collectingContent = "";
					}
					currentSubsection = { title: line, content: "" };
					currentSection.subsections.push(currentSubsection);
				} else if (currentSubsection && line !== "") {
					if (collectingContent) collectingContent += " ";
					collectingContent += line;
				}
			}
		}
		if (currentSubsection && collectingContent.trim()) currentSubsection.content = collectingContent.trim();

		if (tabooStructure.sections.length === 0) {
			tabooStructure.sections = [
				{
					title: "溝通禁忌",
					color: "bg-pink-600",
					subsections: [
						{ title: "女方忌用", content: "「你總是…」「為什麼不…」（黃木食神受剋易引爆情緒）" },
						{ title: "男方忌用", content: "「隨便」「以後再說」（子水七殺過量拖延強化冷暴力）" },
					],
				},
				{
					title: "行為禁忌",
					color: "bg-red-600",
					subsections: [
						{ title: "春季", content: "避免在申時（15-17時）討論敏感話題，因此時金氣旺盛易引發爭執" },
						{ title: "夏季", content: "忌在臥室西北方放置尖銳物品，防止金木相剋影響感情" },
						{ title: "戊月", content: "2026年農曆九月需特別注意財務規劃，避免因金錢問題產生隔閡" },
					],
				},
				{
					title: "環境禁忌",
					color: "bg-red-800",
					subsections: [
						{ title: "約會避開", content: "約會避開：火鍋店（火氣過重）、地下室（水氣滯沉）" },
						{ title: "同房禁忌", content: "子時（23-1點）宜砂，易成心結；可改為備忘錄次日再議" },
					],
				},
			];
		}
		if (!tabooStructure.monthlyNote) {
			tabooStructure.monthlyNote = { title: "每月初", content: "化解方法：在客廳東南方懸掛牡丹圖（木火相生），共同佩戴鴛鴦玉佩增強緣分" };
		}
		return tabooStructure;
	} catch (e) {
		return { type: "text", content: content };
	}
}

function getFallbackRelationship() {
	return {
		type: "subsections",
		subsections: [
			{ title: SUBSECTION_TITLES.actionAdvice, color: "bg-yellow-500", content: "根據夫妻雙方八字合盤分析，建議在春季加強溝通，夏季注意情緒管理，秋季深化感情，冬季規劃未來。" },
			{ title: SUBSECTION_TITLES.bestTiming, color: "bg-yellow-500", content: "重點把握關鍵時間節點，避免在不利時期做重大決定。" },
			{ title: SUBSECTION_TITLES.precautions, color: "bg-yellow-500", content: "避免在情緒激動時討論重要問題，選擇合適時機溝通。" },
		],
	};
}

function getFallbackEnergy() {
	return {
		title: "能量提升建議",
		type: "energy-enhancement",
		maleSection: { title: "男方提升建議", actionAdvice: ["適量運動，保持作息規律"], accessories: ["適合的開運飾品"] },
		femaleSection: { title: "女方提升建議", actionAdvice: ["冥想或靜心活動"], accessories: ["適合的開運飾品"] },
		sharedEnhancement: { title: "共同能量場強化", weeklyRitual: { title: "每週儀式", content: "每週安排共同活動，增進感情。" }, situations: [] },
	};
}

function getFallbackTaboos() {
	return parseRelationshipTaboosContent(`感情關係禁忌
溝通禁忌
女方忌用
「你總是…」「為什麼不…」（黃木食神受剋易引爆情緒）

男方忌用
「隨便」「以後再說」（子水七殺過量拖延強化冷暴力）

行為禁忌
春季
避免在申時（15-17時）討論敏感話題

夏季
忌在臥室西北方放置尖銳物品

戊月
注意財務規劃，避免因金錢問題產生隔閡

環境禁忌
約會避開
火鍋店（火氣過重）、地下室（水氣滯沉）

同房禁忌
子時（23-1點）宜砂，易成心結；可改為備忘錄次日再議

每月初
化解方法：在客廳東南方懸掛牡丹圖（木火相生），共同佩戴鴛鴦玉佩增強緣分`);
}

/**
 * Parse raw API content into the three sections shown on web:
 * 關係發展建議, 能量提升建議, 感情關係禁忌.
 * @param {string} fullContent - analysis.content from /api/couple-core-suggestion-analysis
 * @returns {{ relationshipDevelopment: object, energyEnhancement: object, relationshipTaboos: object }}
 */
export function parseCoupleCoreSuggestionContent(fullContent) {
	if (!fullContent || typeof fullContent !== "string") {
		return {
			relationshipDevelopment: getFallbackRelationship(),
			energyEnhancement: getFallbackEnergy(),
			relationshipTaboos: getFallbackTaboos(),
		};
	}
	return {
		relationshipDevelopment: extractCategoryContent(fullContent, "關係發展建議", "關係發展策略"),
		energyEnhancement: extractCategoryContent(fullContent, "能量提升建議", "能量提升方案"),
		relationshipTaboos: extractCategoryContent(fullContent, "感情關係禁忌", "感情關係禁忌"),
	};
}
