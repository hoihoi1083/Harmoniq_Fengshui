import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCoupleAnalysis } from "@/contexts/CoupleAnalysisContext";
import {
	calculateUnifiedElements,
	formatElementAnalysisForAI,
} from "@/lib/unifiedElementCalculation";
import {
	saveComponentContentWithUser,
	getSavedContent,
} from "@/utils/simpleCoupleContentSave";
import { getCoupleComponentData } from "@/utils/coupleComponentDataStore";

const TAB_CONFIG = {
	感情: {
		left: {
			label: "日月互動",
			img: "/images/report/sun.png",
			selectedBg: "#B4003C",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#B4003C",
		},
		middle: {
			label: "夫妻宮寅未暗合",
			img: "/images/report/star2.png",
			selectedBg: "#E8B923",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#E8B923",
		},
		right: {
			label: "五行氣機修補",
			img: "/images/report/heart.png",
			selectedBg: "#C74772",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#C74772",
		},
	},
	婚姻: {
		left: {
			label: "配對特性",
			img: "/images/report/couple.png",
			selectedBg: "#B4003C",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#B4003C",
		},
		middle: {
			label: "婚配格局分析",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#E8B923",
		},
		right: {
			label: "婚姻調候方案",
			img: "/images/report/marriage.png",
			selectedBg: "#4B6EB2",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#4B6EB2",
		},
	},
	家庭: {
		left: {
			label: "配對特性",
			img: "/images/report/couple.png",
			selectedBg: "#B4003C",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#B4003C",
		},
		middle: {
			label: "夫妻合盤分析",
			img: "/images/report/star2.png",
			selectedBg: "#E8B923",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#E8B923",
		},
		right: {
			label: "家庭和睦方案",
			img: "/images/report/family.png",
			selectedBg: "#389D7D",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#389D7D",
		},
	},
};

const TABS = ["left", "middle", "right"];

// Map Chinese concern names to English keys for translations
const CONCERN_KEY_MAP = {
	感情: "relationship",
	婚姻: "marriage",
	家庭: "family",
};

function getTabConfig(concern) {
	return TAB_CONFIG[concern] || TAB_CONFIG.感情;
}

function getTabLabel(tab, concern, t) {
	if (!t) return tab; // Fallback if no translation function
	const concernKey = CONCERN_KEY_MAP[concern] || "relationship";
	return t(`coupleMingJu.tabs.${concernKey}.${tab}`);
}

function getTabImg(tab, concern) {
	if (tab === "left") return getTabConfig(concern).left.img;
	if (tab === "middle") return getTabConfig(concern).middle.img;
	if (tab === "right") return getTabConfig(concern).right.img;
	return "/images/report/couple.png";
}

function getTabBg(tab, concern, selected) {
	if (tab === "left")
		return selected
			? getTabConfig(concern).left.selectedBg
			: getTabConfig(concern).left.unselectedBg;
	if (tab === "middle")
		return selected
			? getTabConfig(concern).middle.selectedBg
			: getTabConfig(concern).middle.unselectedBg;
	if (tab === "right")
		return selected
			? getTabConfig(concern).right.selectedBg
			: getTabConfig(concern).right.unselectedBg;
	return "#EFEFEF";
}

function getTabImgColor(tab, concern, selected) {
	if (tab === "left")
		return selected
			? getTabConfig(concern).left.selectedImg
			: getTabConfig(concern).left.unselectedImg;
	if (tab === "middle")
		return selected
			? getTabConfig(concern).middle.selectedImg
			: getTabConfig(concern).middle.unselectedImg;
	if (tab === "right")
		return selected
			? getTabConfig(concern).right.selectedImg
			: getTabConfig(concern).right.unselectedImg;
	return "#B4003C";
}

// AI analysis function for couple compatibility
async function generateCoupleMingJuAnalysis(
	{ user1, user2, concern, problem, currentYear },
	tab,
	isSimplified = false
) {
	const concernArea = concern || "感情";

	// Create AI prompt based on tab and concern
	const prompt = createCoupleAIPrompt(
		concernArea,
		tab,
		{
			user1,
			user2,
			problem,
			currentYear,
		},
		isSimplified
	);

	// Try AI API multiple times for better reliability
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			console.log(
				`AI Couple Analysis Attempt ${attempt} for ${tab} - ${concernArea}`
			);

			// Call couple-specific AI analysis endpoint
			const response = await fetch("/api/couple-mingju-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user1Birthday: user1.birthDateTime,
					user2Birthday: user2.birthDateTime,
					user1Name: user1.name || "男方",
					user2Name: user2.name || "女方",
					concern: concernArea,
					problem: problem,
					currentYear: currentYear,
					analysisType: tab,
					prompt: prompt,
					isSimplified: isSimplified,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.analysis && result.analysis.trim()) {
				console.log(`✅ AI Analysis Success for ${tab}`);
				return result.analysis;
			} else {
				throw new Error("Empty AI response");
			}
		} catch (error) {
			console.error(`❌ AI Analysis Attempt ${attempt} failed:`, error);
			if (attempt === 3) {
				// Final fallback
				return generateFallbackContent(
					tab,
					concernArea,
					user1,
					user2,
					isSimplified
				);
			}
		}
	}
}

function createCoupleAIPrompt(
	concern,
	tab,
	{ user1, user2, problem, currentYear },
	isSimplified = false
) {
	// Calculate unified element analysis for consistent results
	let elementAnalysisText = "";
	try {
		const user1Analysis = calculateUnifiedElements(
			user1.birthDateTime,
			user1.gender
		);
		const user2Analysis = calculateUnifiedElements(
			user2.birthDateTime,
			user2.gender
		);
		elementAnalysisText = formatElementAnalysisForAI(
			user1Analysis,
			user2Analysis
		);
	} catch (error) {
		console.warn("Element analysis failed, using basic info:", error);
		elementAnalysisText = isSimplified
			? `
基本资料：
男方生辰：${user1.birthDateTime}，性别：${user1.gender || "男"}
女方生辰：${user2.birthDateTime}，性别：${user2.gender || "女"}
`
			: `
基本資料：
男方生辰：${user1.birthDateTime}，性別：${user1.gender || "男"}
女方生辰：${user2.birthDateTime}，性別：${user2.gender || "女"}
`;
	}

	const baseContext = isSimplified
		? `夫妻合盘分析：
${elementAnalysisText}
关注领域：${concern}，具体问题：${problem}，分析年份：${currentYear}

【重要指示】你是专业的八字合盘命理大师，必须提供具体、准确、有说服力的夫妻合盘分析。避免模糊用词，要给出明确的判断和建议。请使用简体中文回应。`
		: `夫妻合盤分析：
${elementAnalysisText}
關注領域：${concern}，具體問題：${problem}，分析年份：${currentYear}

【重要指示】你是專業的八字合盤命理大師，必須提供具體、準確、有說服力的夫妻合盤分析。避免模糊用詞，要給出明確的判斷和建議。請使用繁體中文回應。`;

	if (tab === "left") {
		return isSimplified
			? `${baseContext}

请必须按照以下格式提供夫妻配对特性分析：

【标题格式】
【[男方日干][女方日干]合盘分析】

内容结构：
1. 第一段：[男方日干]配[女方日干]，[格局名称]，赋予[具体优势]；然[具体挑战]。全局需[调和方案]，具体长期配对策略如下：

2. 五行调和方案：
[列出3个具体的五行调和建议，包含方位、物品、时辰等]

3. 长期配对策略：
[针对当年年份的具体建议，包含季节、活动、风水布局等]

4. 最后段落：[深度分析说明双方命理互动关系和注意事项]

范例格式：
【辛金配戊土合盘分析】

辛金配戊土，土生金之正印格局，赋予稳定包容、财官相生之利；然金土皆燥，火炎土焦之忧。全局需水润金土，具体长期配对策略如下：

五行调和方案：
1. 北方水位布局黑曜石或鱼缸化解火燥
2. 随身佩戴海蓝宝石增强水气流通  
3. 亥子时辰（21-01时）为最佳沟通时段

长期配对策略：
2026丙午年需注意午火旺盛，建议：
- 立春后共同参与水相关活动（游泳、温泉）
- 秋季金旺时节进行重要家庭决策
- 卧室西方放置铜制摆件平衡金气

此局戊土正印护辛金，女方能有效缓解男方癸水食神之波动性，男方甲木正财可疏导女方戊土比肩之固执。惟双午火局需防2026年丙午火势过旺，建议立夏后减少南方行程，多运用黑色系衣着配饰调节。

请严格按照此格式生成，确保包含所有必要元素。`
			: `${baseContext}

請必須按照以下格式提供夫妻配對特性分析：

【標題格式】
【[男方日干][女方日干]合盤分析】

內容結構：
1. 第一段：[男方日干]配[女方日干]，[格局名稱]，賦予[具體優勢]；然[具體挑戰]。全局需[調和方案]，具體長期配對策略如下：

2. 五行調和方案：
[列出3個具體的五行調和建議，包含方位、物品、時辰等]

3. 長期配對策略：
[針對當年年份的具體建議，包含季節、活動、風水佈局等]

4. 最後段落：[深度分析說明雙方命理互動關係和注意事項]

範例格式：
【辛金配戊土合盤分析】

辛金配戊土，土生金之正印格局，賦予穩定包容、財官相生之利；然金土皆燥，火炎土焦之憂。全局需水潤金土，具體長期配對策略如下：

五行調和方案：
1. 北方水位佈局黑曜石或魚缸化解火燥
2. 隨身佩戴海藍寶石增強水氣流通  
3. 亥子時辰（21-01時）為最佳溝通時段

長期配對策略：
2026丙午年需注意午火旺盛，建議：
- 立春後共同參與水相關活動（游泳、溫泉）
- 秋季金旺時節進行重要家庭決策
- 臥室西方放置銅製擺件平衡金氣

此局戊土正印護辛金，女方能有效緩解男方癸水食神之波動性，男方甲木正財可疏導女方戊土比肩之固執。惟雙午火局需防2026年丙午火勢過旺，建議立夏後減少南方行程，多運用黑色系衣著配飾調節。

請嚴格按照此格式生成，確保包含所有必要元素。`;
	} else if (tab === "middle") {
		if (concern === "感情") {
			return isSimplified
				? `${baseContext}
      
你必须严格按照以下JSON格式回应，提供夫妻感情合盘的具体分析。

【重要】只返回纯JSON格式，不要包含任何markdown代码块标记（如\`\`\`json或\`\`\`），直接从{开始到}结束：

{
  "合盘核心": {
    "主要内容": "明确指出双方日干配对的核心格局和感情基础（如：甲木配己土，官印相生）",
    "状态列表": [
      "具体配对强弱：[提供具体证据，如男方日干得女方生扶或相克]",
      "具体感情互动：[明确说出双方在感情上的互动模式]", 
      "具体吸引力源：[说明双方相互吸引的命理基础]"
    ],
    "结论": "给出明确的感情配对总体评价，不要模糊用词"
  },
  "感情之源": {
    "主要分析": "具体分析双方感情宫位配置及相互影响，说明感情发展模式（约100字，要具体）",
    "关键问题": {
      "问题1": {
        "名称": "具体感情问题名称（如：水火不容易起冲突）",
        "解释": "具体解释这个问题的成因和对感情的影响（50字）"
      },
      "问题2": {
        "名称": "另一个具体感情挑战",
        "解释": "具体解释第二个问题及其解决方向（50字）"
      }
    }
  },
  "夫妻互动关键": {
    "互动列表": [
      {
        "方面": "具体互动方面（如：沟通模式）",
        "特点": "明确说明这方面的互动特点和建议（40字）"
      },
      {
        "方面": "第二个互动方面（如：性格互补）",
        "特点": "具体互动机制，不要模糊描述（40字）"
      },
      {
        "方面": "第三个互动方面（如：共同目标）",
        "特点": "明确的互动分析，要有说服力（40字）"
      }
    ],
    "格局核心": "用15字内准确概括夫妻配对的核心优势"
  }
}

【强制要求】：
- 必须提供具体的双方天干地支合盘分析
- 不允许使用"可能"、"或许"、"一般来说"等模糊词汇
- 每个分析都要有具体的合盘命理依据
- 总字数约350字，内容要实用有效`
				: `${baseContext}
      
你必須嚴格按照以下JSON格式回應，提供夫妻感情合盤的具體分析。

【重要】只返回純JSON格式，不要包含任何markdown代碼塊標記（如\`\`\`json或\`\`\`），直接從{開始到}結束：

{
  "合盤核心": {
    "主要内容": "明確指出雙方日干配對的核心格局和感情基礎（如：甲木配己土，官印相生）",
    "状态列表": [
      "具體配對強弱：[提供具體證據，如男方日干得女方生扶或相剋]",
      "具體感情互動：[明確說出雙方在感情上的互動模式]", 
      "具體吸引力源：[說明雙方相互吸引的命理基礎]"
    ],
    "结论": "給出明確的感情配對總體評價，不要模糊用詞"
  },
  "感情之源": {
    "主要分析": "具體分析雙方感情宮位配置及相互影響，說明感情發展模式（約100字，要具體）",
    "关键问题": {
      "问题1": {
        "名称": "具體感情問題名稱（如：水火不容易起衝突）",
        "解释": "具體解釋這個問題的成因和對感情的影響（50字）"
      },
      "问题2": {
        "名称": "另一個具體感情挑戰",
        "解释": "具體解釋第二個問題及其解決方向（50字）"
      }
    }
  },
  "夫妻互动关键": {
    "互动列表": [
      {
        "方面": "具體互動方面（如：溝通模式）",
        "特點": "明確說明這方面的互動特點和建議（40字）"
      },
      {
        "方面": "第二個互動方面（如：性格互補）",
        "特點": "具體互動機制，不要模糊描述（40字）"
      },
      {
        "方面": "第三個互動方面（如：共同目標）",
        "特點": "明確的互動分析，要有說服力（40字）"
      }
    ],
    "格局核心": "用15字內準確概括夫妻配對的核心優勢"
  }
}

【強制要求】：
- 必須提供具體的雙方天干地支合盤分析
- 不允許使用"可能"、"或許"、"一般來說"等模糊詞彙
- 每個分析都要有具體的合盤命理依據
- 總字數約350字，內容要實用有效`;
		} else if (concern === "婚姻") {
			return isSimplified
				? `${baseContext}
      
你必须严格按照以下JSON格式回应，提供婚姻方面的夫妻合盘分析。

【重要】只返回纯JSON格式，不要包含任何markdown代码块标记（如\`\`\`json或\`\`\`），直接从{开始到}结束：

{
  "婚姻根基": {
    "主要内容": "明确分析双方婚姻宫配置和夫妻星情况，说出具体婚姻格局",
    "状态列表": [
      "具体婚姻基础：[明确说出双方夫妻宫和夫妻星的配合情况]",
      "具体稳定性：[根据合盘配置给出明确的婚姻稳定度判断]",
      "具体成长潜力：[说明婚姻关系的发展空间和方向]"
    ],
    "结论": "对婚姻关系给出明确而非模糊的总结"
  },
  "婚姻发展": {
    "主要分析": "具体分析适合的婚姻经营模式和发展阶段，要给出明确建议（约100字）",
    "关键问题": {
      "问题1": {
        "名称": "具体婚姻发展障碍",
        "解释": "明确说明这个障碍的原因和解决方向（50字）"
      },
      "问题2": {
        "名称": "另一个具体婚姻挑战",
        "解释": "具体分析第二个挑战及应对策略（50字）"
      }
    }
  },
  "夫妻星配置": {
    "配置列表": [
      {
        "星神": "具体夫妻星名称（如：正官、正财）",
        "作用": "明确说明这个星神在婚姻中的作用（40字）"
      },
      {
        "星神": "第二个相关星神",
        "作用": "具体作用机制，不要模糊描述（40字）"
      },
      {
        "星神": "第三个重要星神",
        "作用": "明确的婚姻影响分析（40字）"
      }
    ],
    "格局核心": "用15字内准确概括婚姻格局的核心特质"
  }
}

【强制要求】：
- 必须提供具体的夫妻星和婚姻宫合盘分析
- 不允许使用模糊词汇，要有明确判断
- 每个分析都要有具体的命理依据
- 总字数约350字，重点关注婚姻稳定性`
				: `${baseContext}
      
你必須嚴格按照以下JSON格式回應，提供婚姻方面的夫妻合盤分析。

【重要】只返回純JSON格式，不要包含任何markdown代碼塊標記（如\`\`\`json或\`\`\`），直接從{開始到}結束：

{
  "婚姻根基": {
    "主要内容": "明確分析雙方婚姻宮配置和夫妻星情況，說出具體婚姻格局",
    "状态列表": [
      "具體婚姻基礎：[明確說出雙方夫妻宮和夫妻星的配合情況]",
      "具體穩定性：[根據合盤配置給出明確的婚姻穩定度判斷]",
      "具體成長潛力：[說明婚姻關係的發展空間和方向]"
    ],
    "结论": "對婚姻關係給出明確而非模糊的總結"
  },
  "婚姻发展": {
    "主要分析": "具體分析適合的婚姻經營模式和發展階段，要給出明確建議（約100字）",
    "关键问题": {
      "问题1": {
        "名称": "具體婚姻發展障礙",
        "解释": "明確說明這個障礙的原因和解決方向（50字）"
      },
      "问题2": {
        "名称": "另一個具體婚姻挑戰",
        "解释": "具體分析第二個挑戰及應對策略（50字）"
      }
    }
  },
  "夫妻星配置": {
    "配置列表": [
      {
        "星神": "具體夫妻星名稱（如：正官、正財）",
        "作用": "明確說明這個星神在婚姻中的作用（40字）"
      },
      {
        "星神": "第二個相關星神",
        "作用": "具體作用機制，不要模糊描述（40字）"
      },
      {
        "星神": "第三個重要星神",
        "作用": "明確的婚姻影響分析（40字）"
      }
    ],
    "格局核心": "用15字內準確概括婚姻格局的核心特質"
  }
}

【強制要求】：
- 必須提供具體的夫妻星和婚姻宮合盤分析
- 不允許使用模糊詞彙，要有明確判斷
- 每個分析都要有具體的命理依據
- 總字數約350字，重點關注婚姻穩定性`;
		} else if (concern === "家庭") {
			return isSimplified
				? `${baseContext}
      
你必须严格按照以下JSON格式回应，提供家庭方面的夫妻合盘分析。

【重要】只返回纯JSON格式，不要包含任何markdown代码块标记（如\`\`\`json或\`\`\`），直接从{开始到}结束：

{
  "家庭基础": {
    "主要内容": "明确分析双方家庭宫位和子女星配置，说出具体家庭格局",
    "状态列表": [
      "具体家庭根基：[明确说出双方在家庭建设上的优势配合]",
      "具体子女缘：[根据子女星配置分析生育和教养能力]",
      "具体家庭和谐度：[说明家庭氛围和相处模式]"
    ],
    "结论": "对家庭建设给出明确的总体评价"
  },
  "家庭经营": {
    "主要分析": "具体分析适合的家庭经营模式和分工安排，要给出明确建议（约100字）",
    "关键问题": {
      "问题1": {
        "名称": "具体家庭经营挑战",
        "解释": "明确说明这个挑战的原因和改善方向（50字）"
      },
      "问题2": {
        "名称": "另一个具体家庭问题",
        "解释": "具体分析第二个问题及解决策略（50字）"
      }
    }
  },
  "家庭角色配置": {
    "角色列表": [
      {
        "角色": "具体家庭角色（如：经济支柱、教育主导）",
        "分工": "明确说明这个角色的最佳分工安排（40字）"
      },
      {
        "角色": "第二个重要角色",
        "分工": "具体分工机制和配合方式（40字）"
      },
      {
        "角色": "第三个关键角色",
        "分工": "明确的角色定位和责任分配（40字）"
      }
    ],
    "格局核心": "用15字内准确概括家庭经营的核心优势"
  }
}

【强制要求】：
- 必须提供具体的家庭宫位和子女星合盘分析
- 不允许使用模糊词汇，要有明确的家庭经营建议
- 每个分析都要有具体的命理依据
- 总字数约350字，重点关注家庭和谐与发展`
				: `${baseContext}
      
你必須嚴格按照以下JSON格式回應，提供家庭方面的夫妻合盤分析。

【重要】只返回純JSON格式，不要包含任何markdown代碼塊標記（如\`\`\`json或\`\`\`），直接從{開始到}結束：

{
  "家庭基础": {
    "主要内容": "明確分析雙方家庭宮位和子女星配置，說出具體家庭格局",
    "状态列表": [
      "具體家庭根基：[明確說出雙方在家庭建設上的優勢配合]",
      "具體子女緣：[根據子女星配置分析生育和教養能力]",
      "具體家庭和諧度：[說明家庭氛圍和相處模式]"
    ],
    "结论": "對家庭建設給出明確的總體評價"
  },
  "家庭经营": {
    "主要分析": "具體分析適合的家庭經營模式和分工安排，要給出明確建議（約100字）",
    "关键问题": {
      "问题1": {
        "名称": "具體家庭經營挑戰",
        "解释": "明確說明這個挑戰的原因和改善方向（50字）"
      },
      "问题2": {
        "名称": "另一個具體家庭問題",
        "解释": "具體分析第二個問題及解決策略（50字）"
      }
    }
  },
  "家庭角色配置": {
    "角色列表": [
      {
        "角色": "具體家庭角色（如：經濟支柱、教育主導）",
        "分工": "明確說明這個角色的最佳分工安排（40字）"
      },
      {
        "角色": "第二個重要角色",
        "分工": "具體分工機制和配合方式（40字）"
      },
      {
        "角色": "第三個關鍵角色",
        "分工": "明確的角色定位和責任分配（40字）"
      }
    ],
    "格局核心": "用15字內準確概括家庭經營的核心優勢"
  }
}

【強制要求】：
- 必須提供具體的家庭宮位和子女星合盤分析
- 不允許使用模糊詞彙，要有明確的家庭經營建議
- 每個分析都要有具體的命理依據
- 總字數約350字，重點關注家庭和諧與發展`;
		}
	} else if (tab === "right") {
		if (concern === "感情") {
			return isSimplified
				? `${baseContext}

请提供感情调候策略的具体建议，必须按照以下JSON格式。

【重要】只返回纯JSON格式，不要包含任何markdown代码块标记（如\`\`\`json或\`\`\`），直接从{开始到}结束：

{
  "调候核心": {
    "五行调节": "明确指出双方需要的具体五行调节方案（如：男方需木火调候，女方需金水平衡）",
    "调候重点": "具体说明调候的重点时机和方法（60字）"
  },
  "实用建议": {
    "日常调和": [
      "具体的日常感情调和建议1（30字）",
      "具体的日常感情调和建议2（30字）",
      "具体的日常感情调和建议3（30字）"
    ],
    "时机把握": [
      "重要时机的把握建议1（30字）",
      "重要时机的把握建议2（30字）"
    ]
  },
  "长期策略": {
    "感情发展": "具体的长期感情发展策略和目标（80字）",
    "关键节点": "明确指出感情发展的关键节点和注意事项（60字）"
  }
}

要求300字，重点提供实用的调候建议。`
				: `${baseContext}

請提供感情調候策略的具體建議，必須按照以下JSON格式。

【重要】只返回純JSON格式，不要包含任何markdown代碼塊標記（如\`\`\`json或\`\`\`），直接從{開始到}結束：

{
  "调候核心": {
    "五行调节": "明確指出雙方需要的具體五行調節方案（如：男方需木火調候，女方需金水平衡）",
    "调候重点": "具體說明調候的重點時機和方法（60字）"
  },
  "实用建议": {
    "日常调和": [
      "具體的日常感情調和建議1（30字）",
      "具體的日常感情調和建議2（30字）",
      "具體的日常感情調和建議3（30字）"
    ],
    "时机把握": [
      "重要時機的把握建議1（30字）",
      "重要時機的把握建議2（30字）"
    ]
  },
  "长期策略": {
    "感情发展": "具體的長期感情發展策略和目標（80字）",
    "关键节点": "明確指出感情發展的關鍵節點和注意事項（60字）"
  }
}

要求300字，重點提供實用的調候建議。`;
		} else if (concern === "婚姻") {
			return isSimplified
				? `${baseContext}

请提供婚姻调候方案的具体建议，必须按照以下JSON格式。

【重要】只返回纯JSON格式，不要包含任何markdown代码块标记（如\`\`\`json或\`\`\`），直接从{开始到}结束：

{
  "调候核心": {
    "五行调节": "明确指出婚姻关系需要的具体五行调节（如：夫妻宫需要火土调和）",
    "调候重点": "具体说明婚姻调候的重点和方法（60字）"
  },
  "实用建议": {
    "婚姻经营": [
      "具体的婚姻经营建议1（30字）",
      "具体的婚姻经营建议2（30字）",
      "具体的婚姻经营建议3（30字）"
    ],
    "冲突化解": [
      "夫妻冲突化解方法1（30字）",
      "夫妻冲突化解方法2（30字）"
    ]
  },
  "长期策略": {
    "婚姻稳定": "具体的长期婚姻稳定策略（80字）",
    "成长目标": "明确的夫妻共同成长目标和路径（60字）"
  }
}

要求300字，重点提供实用的婚姻调候方案。`
				: `${baseContext}

請提供婚姻調候方案的具體建議，必須按照以下JSON格式。

【重要】只返回純JSON格式，不要包含任何markdown代碼塊標記（如\`\`\`json或\`\`\`），直接從{開始到}結束：

{
  "调候核心": {
    "五行调节": "明確指出婚姻關係需要的具體五行調節（如：夫妻宮需要火土調和）",
    "调候重点": "具體說明婚姻調候的重點和方法（60字）"
  },
  "实用建议": {
    "婚姻经营": [
      "具體的婚姻經營建議1（30字）",
      "具體的婚姻經營建議2（30字）",
      "具體的婚姻經營建議3（30字）"
    ],
    "冲突化解": [
      "夫妻衝突化解方法1（30字）",
      "夫妻衝突化解方法2（30字）"
    ]
  },
  "长期策略": {
    "婚姻稳定": "具體的長期婚姻穩定策略（80字）",
    "成长目标": "明確的夫妻共同成長目標和路徑（60字）"
  }
}

要求300字，重點提供實用的婚姻調候方案。`;
		} else if (concern === "家庭") {
			return isSimplified
				? `${baseContext}

请提供家庭和睦方案的具体建议，必须按照以下JSON格式。

【重要】只返回纯JSON格式，不要包含任何markdown代码块标记（如\`\`\`json或\`\`\`），直接从{开始到}结束：

{
  "调候核心": {
    "五行调节": "明确指出家庭和谐需要的具体五行调节（如：家庭气场需要土金调和）",
    "调候重点": "具体说明家庭调候的重点和实施方法（60字）"
  },
  "实用建议": {
    "家庭和谐": [
      "具体的家庭和谐建议1（30字）",
      "具体的家庭和谐建议2（30字）",
      "具体的家庭和谐建议3（30字）"
    ],
    "子女教养": [
      "子女教养的重点建议1（30字）",
      "子女教养的重点建议2（30字）"
    ]
  },
  "长期策略": {
    "家庭发展": "具体的长期家庭发展策略和愿景（80字）",
    "传承规划": "明确的家庭传承规划和价值延续（60字）"
  }
}

要求300字，重点提供实用的家庭经营方案。`
				: `${baseContext}

請提供家庭和睦方案的具體建議，必須按照以下JSON格式。

【重要】只返回純JSON格式，不要包含任何markdown代碼塊標記（如\`\`\`json或\`\`\`），直接從{開始到}結束：

{
  "调候核心": {
    "五行调节": "明確指出家庭和諧需要的具體五行調節（如：家庭氣場需要土金調和）",
    "调候重点": "具體說明家庭調候的重點和實施方法（60字）"
  },
  "实用建议": {
    "家庭和谐": [
      "具體的家庭和諧建議1（30字）",
      "具體的家庭和諧建議2（30字）",
      "具體的家庭和諧建議3（30字）"
    ],
    "子女教养": [
      "子女教養的重點建議1（30字）",
      "子女教養的重點建議2（30字）"
    ]
  },
  "长期策略": {
    "家庭发展": "具體的長期家庭發展策略和願景（80字）",
    "传承规划": "明確的家庭傳承規劃和價值延續（60字）"
  }
}

要求300字，重點提供實用的家庭經營方案。`;
		}
	}

	// Default fallback prompt
	return isSimplified
		? `${baseContext}

请提供${concern}方面的夫妻合盘分析，包含具体的配对特点、互动模式和调和建议。要求内容具体实用，避免模糊描述，约300字。`
		: `${baseContext}

請提供${concern}方面的夫妻合盤分析，包含具體的配對特點、互動模式和調和建議。要求內容具體實用，避免模糊描述，約300字。`;
}

function generateFallbackContent(
	tab,
	concern,
	user1,
	user2,
	isSimplified = false
) {
	const user1Name = user1.name || (isSimplified ? "男方" : "男方");
	const user2Name = user2.name || (isSimplified ? "女方" : "女方");

	if (tab === "left") {
		return isSimplified
			? `${user1Name}与${user2Name}的八字配对分析：

根据双方生辰八字，此配对展现出独特的五行互动格局。双方在性格特质上既有互补优势，也存在需要调和的差异。

配对优势：
• 五行互补：双方的日干五行形成良性互动，有助于相互支持
• 性格平衡：在处事方式上能够互相补足，形成稳定的配对基础

需要注意：
• 沟通调和：不同的表达方式可能需要更多理解和包容
• 节奏协调：在生活步调上需要找到平衡点

调和建议：
建议双方多关注对方的五行特质，在日常相处中运用相生原理，避免相克情况。通过适当的风水调节和时机把握，可以增进感情和谐，建立长久稳定的关系。

此配对具有良好的发展潜力，关键在于双方的理解与配合。`
			: `${user1Name}與${user2Name}的八字配對分析：

根據雙方生辰八字，此配對展現出獨特的五行互動格局。雙方在性格特質上既有互補優勢，也存在需要調和的差異。

配對優勢：
• 五行互補：雙方的日干五行形成良性互動，有助於相互支持
• 性格平衡：在處事方式上能夠互相補足，形成穩定的配對基礎

需要注意：
• 溝通調和：不同的表達方式可能需要更多理解和包容
• 節奏協調：在生活步調上需要找到平衡點

調和建議：
建議雙方多關注對方的五行特質，在日常相處中運用相生原理，避免相剋情況。通過適當的風水調節和時機把握，可以增進感情和諧，建立長久穩定的關係。

此配對具有良好的發展潛力，關鍵在於雙方的理解與配合。`;
	} else if (tab === "middle") {
		const simplifiedContent = {
			合盘核心: {
				主要内容: `${user1Name}与${user2Name}的八字合盘显示良好的配对基础`,
				状态列表: [
					"配对强弱：双方日干形成稳定的相互关系",
					"感情互动：在情感表达上有互补特质",
					"吸引力源：基于五行相生的天然吸引力",
				],
				结论: "整体配对评价为良好，具有发展潜力",
			},
			感情之源: {
				主要分析:
					"双方的感情宫位配置较为和谐，男方的理性与女方的感性形成良好互补，感情发展呈现稳定上升趋势。",
				关键问题: {
					问题1: {
						名称: "沟通方式差异",
						解释: "双方在表达感情的方式上有所不同，需要多一些耐心和理解。",
					},
					问题2: {
						名称: "生活节奏调和",
						解释: "在日常生活安排上需要找到双方都舒适的平衡点。",
					},
				},
			},
			夫妻互动关键: {
				互动列表: [
					{
						方面: "情感交流",
						特点: "建议多用行动表达关爱，减少语言上的误解",
					},
					{
						方面: "生活规划",
						特点: "在重大决定上多商量，发挥各自的优势特质",
					},
					{
						方面: "相处模式",
						特点: "保持适当的个人空间，同时增进共同兴趣",
					},
				],
				格局核心: "互补配对，和谐发展",
			},
		};

		const traditionalContent = {
			合盤核心: {
				主要内容: `${user1Name}與${user2Name}的八字合盤顯示良好的配對基礎`,
				状态列表: [
					"配對強弱：雙方日干形成穩定的相互關係",
					"感情互動：在情感表達上有互補特質",
					"吸引力源：基於五行相生的天然吸引力",
				],
				结论: "整體配對評價為良好，具有發展潛力",
			},
			感情之源: {
				主要分析:
					"雙方的感情宮位配置較為和諧，男方的理性與女方的感性形成良好互補，感情發展呈現穩定上升趨勢。",
				关键问题: {
					问题1: {
						名称: "溝通方式差異",
						解释: "雙方在表達感情的方式上有所不同，需要多一些耐心和理解。",
					},
					问题2: {
						名称: "生活節奏調和",
						解释: "在日常生活安排上需要找到雙方都舒適的平衡點。",
					},
				},
			},
			夫妻互动关键: {
				互动列表: [
					{
						方面: "情感交流",
						特點: "建議多用行動表達關愛，減少語言上的誤解",
					},
					{
						方面: "生活規劃",
						特點: "在重大決定上多商量，發揮各自的優勢特質",
					},
					{
						方面: "相處模式",
						特點: "保持適當的個人空間，同時增進共同興趣",
					},
				],
				格局核心: "互補配對，和諧發展",
			},
		};

		return JSON.stringify(
			isSimplified ? simplifiedContent : traditionalContent,
			null,
			2
		);
	} else if (tab === "right") {
		const simplifiedContent = {
			调候核心: {
				五行调节: `${user1Name}需要调和火土之气，${user2Name}适合平衡金水能量`,
				调候重点:
					"重点在于双方的五行平衡，建议在季节转换时特别注意情感调节",
			},
			实用建议: {
				日常调和: [
					"多在自然环境中约会，增进五行和谐",
					"选择适合的颜色和饰品辅助调候",
					"注意饮食搭配，避免五行相克的食物组合",
				],
				时机把握: [
					"在吉利的时辰进行重要决定和沟通",
					"利用流年大运的有利时机推进感情发展",
				],
			},
			长期策略: {
				感情发展:
					"建议循序渐进，在稳固感情基础的同时，规划未来的共同目标和发展方向。",
				关键节点:
					"特别注意农历的重要节气，这些时间点对感情发展有重要影响。",
			},
		};

		const traditionalContent = {
			调候核心: {
				五行调节: `${user1Name}需要調和火土之氣，${user2Name}適合平衡金水能量`,
				调候重点:
					"重點在於雙方的五行平衡，建議在季節轉換時特別注意情感調節",
			},
			实用建议: {
				日常调和: [
					"多在自然環境中約會，增進五行和諧",
					"選擇適合的顏色和飾品輔助調候",
					"注意飲食搭配，避免五行相剋的食物組合",
				],
				时机把握: [
					"在吉利的時辰進行重要決定和溝通",
					"利用流年大運的有利時機推進感情發展",
				],
			},
			长期策略: {
				感情发展:
					"建議循序漸進，在穩固感情基礎的同時，規劃未來的共同目標和發展方向。",
				关键节点:
					"特別注意農曆的重要節氣，這些時間點對感情發展有重要影響。",
			},
		};

		return JSON.stringify(
			isSimplified ? simplifiedContent : traditionalContent,
			null,
			2
		);
	}

	return isSimplified
		? `分析中...请稍候，正在为您生成专业的夫妻合盘${concern}分析报告。`
		: `分析中...請稍候，正在為您生成專業的夫妻合盤${concern}分析報告。`;
}

// Structured content renderer for JSON responses
function renderStructuredContent(concern, tab, content) {
	try {
		// Check if content exists and is not empty
		if (
			!content ||
			typeof content !== "string" ||
			content.trim().length === 0
		) {
			console.warn("📝 renderStructuredContent: 內容為空或無效");
			return (
				<div className="p-3 border border-yellow-200 rounded-lg sm:p-4 bg-yellow-50">
					<p
						className="text-yellow-800"
						style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
					>
						正在載入分析內容...
					</p>
				</div>
			);
		}

		// Clean content by removing markdown code blocks and extra whitespace
		let cleanContent = content.trim();

		// Remove markdown JSON code blocks if present
		if (cleanContent.startsWith("```json")) {
			cleanContent = cleanContent
				.replace(/^```json\s*/, "")
				.replace(/\s*```$/, "");
		} else if (cleanContent.startsWith("```")) {
			cleanContent = cleanContent
				.replace(/^```\s*/, "")
				.replace(/\s*```$/, "");
		}

		// Try to find JSON content if wrapped in other text
		const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			cleanContent = jsonMatch[0];
		}

		// Check if cleanContent is valid before parsing
		if (!cleanContent || cleanContent.trim().length === 0) {
			console.warn("📝 renderStructuredContent: 清理後內容為空");
			return (
				<div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
					<p className="text-yellow-800">正在處理分析內容...</p>
				</div>
			);
		}

		// Try to fix common JSON syntax errors
		cleanContent = cleanContent
			// Fix missing closing braces for objects in arrays
			.replace(/(\s*"特點":\s*"[^"]*")\s*\]/g, "$1\n      }\n    ]")
			// Ensure proper closing of nested objects
			.replace(
				/("\s*),?\s*\]\s*,?\s*\}\s*$/g,
				'"\n      }\n    ],\n    "格局核心": "土生金發，剛柔並濟"\n  }\n}'
			)
			// Fix missing closing braces in general
			.replace(/("\s*),?\s*\]\s*$/g, '"\n      }\n    ]\n  }\n}');

		console.log("🔧 Cleaned content before parsing:", cleanContent);

		const data = JSON.parse(cleanContent);

		return (
			<div className="space-y-6">
				{Object.entries(data).map(([section, sectionData], index) => (
					<div
						key={index}
						className="p-3 sm:p-4 lg:p-4 rounded-lg bg-[#EFEFEF] shadow-lg"
					>
						<h3
							className="font-bold text-[#B4003C] mb-2 sm:mb-3"
							style={{ fontSize: "clamp(12px, 4vw, 18px)" }}
						>
							{section}
						</h3>

						{sectionData.主要内容 && (
							<div className="mb-2 sm:mb-3">
								<p
									className="leading-relaxed text-gray-800"
									style={{
										fontSize: "clamp(10px, 3.5vw, 16px)",
									}}
								>
									{sectionData.主要内容}
								</p>
							</div>
						)}

						{sectionData.主要分析 && (
							<div className="mb-2 sm:mb-3">
								<p
									className="leading-relaxed text-gray-800"
									style={{
										fontSize: "clamp(10px, 3.5vw, 16px)",
									}}
								>
									{sectionData.主要分析}
								</p>
							</div>
						)}

						{sectionData.状态列表 && (
							<div className="mb-2 sm:mb-3">
								<ul className="space-y-1 sm:space-y-2">
									{sectionData.状态列表.map((item, idx) => (
										<li
											key={idx}
											className="flex items-start"
										>
											<span
												className="text-[#C74772] mr-1 sm:mr-2"
												style={{
													fontSize:
														"clamp(14px, 3.5vw, 16px)",
												}}
											>
												•
											</span>
											<span
												className="text-gray-700"
												style={{
													fontSize:
														"clamp(14px, 3.5vw, 16px)",
												}}
											>
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{sectionData.关键问题 && (
							<div className="mb-2 sm:mb-3">
								<h4
									className="mb-1 font-semibold text-gray-800 sm:mb-2"
									style={{
										fontSize: "clamp(14px, 3.8vw, 16px)",
									}}
								>
									關鍵問題：
								</h4>
								{Object.entries(sectionData.关键问题).map(
									([key, problem], idx) => (
										<div
											key={idx}
											className="mb-1 ml-3 sm:mb-2 sm:ml-4"
										>
											<p
												className="font-medium text-[#4B6EB2]"
												style={{
													fontSize:
														"clamp(13px, 3.3vw, 15px)",
												}}
											>
												{problem.名称}
											</p>
											<p
												className="text-gray-600"
												style={{
													fontSize:
														"clamp(12px, 3vw, 14px)",
												}}
											>
												{problem.解释}
											</p>
										</div>
									)
								)}
							</div>
						)}

						{sectionData.互动列表 && (
							<div className="mb-2 sm:mb-3">
								<h4
									className="mb-1 font-semibold text-gray-800 sm:mb-2"
									style={{
										fontSize: "clamp(14px, 3.8vw, 16px)",
									}}
								>
									互動分析：
								</h4>
								{sectionData.互动列表.map((item, idx) => (
									<div key={idx} className="mb-2 ml-4">
										<p className="font-medium text-[#4B6EB2]">
											{item.方面}
										</p>
										<p className="text-sm text-gray-600">
											{item.特點}
										</p>
									</div>
								))}
							</div>
						)}

						{sectionData.配置列表 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									配置分析：
								</h4>
								{sectionData.配置列表.map((item, idx) => (
									<div key={idx} className="mb-2 ml-4">
										<p className="font-medium text-[#4B6EB2]">
											{item.星神 || item.角色}
										</p>
										<p className="text-sm text-gray-600">
											{item.作用 || item.分工}
										</p>
									</div>
								))}
							</div>
						)}

						{sectionData.角色列表 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									角色分析：
								</h4>
								{sectionData.角色列表.map((item, idx) => (
									<div key={idx} className="mb-2 ml-4">
										<p className="font-medium text-[#4B6EB2]">
											{item.角色}
										</p>
										<p className="text-sm text-gray-600">
											{item.分工}
										</p>
									</div>
								))}
							</div>
						)}

						{sectionData.日常调和 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									日常調和：
								</h4>
								<ul className="space-y-1">
									{sectionData.日常调和.map((item, idx) => (
										<li
											key={idx}
											className="flex items-start ml-4"
										>
											<span className="text-[#C74772] mr-2">
												•
											</span>
											<span className="text-sm text-gray-700">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{sectionData.婚姻经营 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									婚姻經營：
								</h4>
								<ul className="space-y-1">
									{sectionData.婚姻经营.map((item, idx) => (
										<li
											key={idx}
											className="flex items-start ml-4"
										>
											<span className="text-[#C74772] mr-2">
												•
											</span>
											<span className="text-sm text-gray-700">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{sectionData.家庭和谐 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									家庭和諧：
								</h4>
								<ul className="space-y-1">
									{sectionData.家庭和谐.map((item, idx) => (
										<li
											key={idx}
											className="flex items-start ml-4"
										>
											<span className="text-[#C74772] mr-2">
												•
											</span>
											<span className="text-sm text-gray-700">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{sectionData.结论 && (
							<div className="mt-3 p-3 bg-white rounded border-l-4 border-[#B4003C]">
								<p className="font-medium text-gray-800">
									{sectionData.结论}
								</p>
							</div>
						)}

						{sectionData.格局核心 && (
							<div className="mt-3 p-3 bg-white rounded border-l-4 border-[#B4003C]">
								<p className="font-medium text-gray-800">
									核心：{sectionData.格局核心}
								</p>
							</div>
						)}

						{sectionData.五行调节 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									五行調節：
								</h4>
								<p className="ml-4 text-gray-700">
									{sectionData.五行调节}
								</p>
							</div>
						)}

						{sectionData.调候重点 && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									調候重點：
								</h4>
								<p className="ml-4 text-gray-700">
									{sectionData.调候重点}
								</p>
							</div>
						)}

						{(sectionData.感情发展 ||
							sectionData.婚姻稳定 ||
							sectionData.家庭发展) && (
							<div className="mb-3">
								<h4 className="mb-2 font-semibold text-gray-800">
									長期策略：
								</h4>
								<p className="ml-4 text-gray-700">
									{sectionData.感情发展 ||
										sectionData.婚姻稳定 ||
										sectionData.家庭发展}
								</p>
							</div>
						)}
					</div>
				))}
			</div>
		);
	} catch (error) {
		console.error("❌ Error parsing structured content:", error);
		console.error("📄 Content that failed to parse:", content);

		// Try to extract readable content from the malformed JSON
		let readableContent = content;
		try {
			// Extract key-value pairs that are readable
			const contentLines = content.split("\n").filter((line) => {
				const trimmed = line.trim();
				return trimmed && !trimmed.match(/^[{}\[\],]*$/);
			});

			if (contentLines.length > 0) {
				readableContent = contentLines
					.map((line) =>
						line
							.replace(/^\s*["']|["'],?\s*$/g, "")
							.replace(/^\s*["}]\s*/, "")
					)
					.filter((line) => line.length > 0)
					.join("\n");
			}
		} catch (extractError) {
			console.warn("Failed to extract readable content:", extractError);
		}

		// If content exists, show it as formatted text
		if (
			content &&
			typeof content === "string" &&
			content.trim().length > 0
		) {
			return (
				<div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
					<div className="mb-2">
						<p className="text-sm font-medium text-blue-600">
							⚠️ 內容格式正在調整中，顯示原始分析結果：
						</p>
					</div>
					<div className="space-y-2">
						{readableContent.split("\n").map((line, index) => {
							const trimmedLine = line.trim();
							if (!trimmedLine) return null;

							// Check if it's a title/header (contains Chinese characters and colon)
							if (trimmedLine.match(/[\u4e00-\u9fff].*[:：]/)) {
								return (
									<h4
										key={index}
										className="mt-3 mb-1 font-bold text-gray-800"
									>
										{trimmedLine}
									</h4>
								);
							}
							// Regular content
							return (
								<p
									key={index}
									className="ml-2 leading-relaxed text-gray-700"
								>
									{trimmedLine}
								</p>
							);
						})}
					</div>
				</div>
			);
		} else {
			return (
				<div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
					<p className="text-gray-600">暫無分析內容，請稍後再試。</p>
				</div>
			);
		}
	}
}

// Strip markdown ** for display
function stripMarkdownBold(text) {
	if (!text || typeof text !== "string") return text;
	return text.replace(/\*\*/g, "");
}

// Function to format the left tab (日月互動) content with special layout
function formatLeftTabContent(content) {
	if (!content) return null;

	// Parse the content to extract different sections
	const lines = content.split("\n").filter((line) => line.trim());

	// Normalize line for matching (AI may return **五行調和方案：** or 長期配對策略（針對2026丙午年）：)
	const normalizedLine = (line) => stripMarkdownBold(line);
	const lineIncludes = (line, str) => normalizedLine(line).includes(str);

	// Find the title line that contains 【...合盤分析】
	let titleLineIndex = lines.findIndex((line) => line.includes("合盤分析】"));

	let elementPairing = "";
	let patternDescription = "";
	let mainDescription = "";
	let contentStartIndex = 0;

	if (titleLineIndex !== -1) {
		const titleLine = lines[titleLineIndex];
		const titleMatch = titleLine.match(/【(.+?)合盤分析】/);
		elementPairing = titleMatch ? titleMatch[1] : "";
		contentStartIndex = titleLineIndex + 1;

		const fullContent = lines.slice(contentStartIndex).join(" ");
		const patternMatch = fullContent.match(/([^，。]+?格局)/);
		if (patternMatch) patternDescription = patternMatch[1];

		const mainDescIndex = lines.findIndex(
			(line, index) =>
				index > titleLineIndex &&
				line.includes("賦予") &&
				line.includes("全局")
		);
		if (mainDescIndex !== -1) mainDescription = lines[mainDescIndex];
	} else {
		// Alternate format: first line = 戊土配戊土, second = 比肩成林之格局, no 【】
		if (lines.length > 0) {
			elementPairing = lines[0].trim();
			if (lines.length > 1 && lines[1].includes("格局")) {
				patternDescription = lines[1].trim();
			}
			contentStartIndex = patternDescription ? 2 : 1;
		}
		const mainDescIndex = lines.findIndex(
			(line, index) =>
				index >= contentStartIndex &&
				line.includes("賦予") &&
				line.includes("全局")
		);
		if (mainDescIndex !== -1) mainDescription = lines[mainDescIndex];
	}

	// Find sections (match with or without ** and with optional suffix e.g. （針對2026丙午年）)
	const findSectionContent = (startText) => {
		const startIndex = lines.findIndex((line) => lineIncludes(line, startText));
		if (startIndex === -1) return [];

		const sectionLines = [];
		for (let i = startIndex; i < lines.length; i++) {
			const line = lines[i];
			const norm = normalizedLine(line);
			if (
				i > startIndex &&
				(norm.includes("方案：") ||
					norm.includes("策略：") ||
					norm.includes("此局") ||
					norm.includes("深度分析說明"))
			) {
				break;
			}
			sectionLines.push(line);
		}
		return sectionLines;
	};

	const wuxingSection = findSectionContent("五行調和方案");
	let strategySection = findSectionContent("長期配對策略");
	// Web: drop any line that is the repeated intro paragraph (賦予+全局) from strategy section
	strategySection = strategySection.filter(
		(line) =>
			!line.trim().includes("賦予") || !line.trim().includes("全局")
	);

	const isInSection = (line) =>
		wuxingSection.includes(line) || strategySection.includes(line);
	let remainingLines = lines.filter(
		(line) =>
			!line.includes("合盤分析】") &&
			!lineIncludes(line, "五行調和方案") &&
			!lineIncludes(line, "長期配對策略") &&
			!isInSection(line) &&
			line !== mainDescription
	);
	// Exclude duplicate main description (same paragraph appearing again) — web only
	const mainDescTrimmed = (mainDescription || "").trim();
	const isDuplicateIntroParagraph = (line) => {
		const t = line.trim();
		if (!t) return false;
		if (t === mainDescTrimmed) return true;
		// Any line that is the intro paragraph (賦予 + 全局), with or without 具體長期配對策略如下
		if (t.includes("賦予") && t.includes("全局")) return true;
		return false;
	};
	remainingLines = remainingLines.filter(
		(line) => !isDuplicateIntroParagraph(line)
	);
	// Exclude "深度分析說明雙方命理互動關係和注意事項" and everything after it
	const depthAnalysisIndex = remainingLines.findIndex((line) =>
		lineIncludes(line, "深度分析說明")
	);
	if (depthAnalysisIndex !== -1) {
		remainingLines = remainingLines.slice(0, depthAnalysisIndex);
	}

	return (
		<div className="space-y-6">
			{/* Title and Pattern */}
			<div className="flex items-center justify-start space-x-10">
				<h1
					className="text-[#C74772]"
					style={{
						fontFamily: "'Noto Serif TC', serif",
						fontSize: "clamp(25px, 4vw, 56px)",
						fontWeight: "400",
						lineHeight: "1.0",
						WebkitTextStroke: "1px #B4003C",
					}}
				>
					{elementPairing}
				</h1>
				{patternDescription && (
					<div
						className="bg-[#C74772] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full"
						style={{
							fontSize: "clamp(8px, 2.5vw, 16px)",
							fontWeight: "500",
						}}
					>
						{patternDescription}
					</div>
				)}
			</div>

			{/* Main Description - Responsive */}
			{mainDescription && (
				<div
					className="leading-relaxed text-black"
					style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
				>
					{stripMarkdownBold(mainDescription)}
				</div>
			)}

			{/* 五行調和方案 Section */}
			{wuxingSection.length > 0 && (
				<div className="bg-[#EFEFEF] p-4 rounded-lg">
					<div className="text-black">
						{wuxingSection.map((line, index) => (
							<div key={index} className="mb-1">
								{stripMarkdownBold(line)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* 長期配對策略 Section */}
			{strategySection.length > 0 && (
				<div className="bg-[#EFEFEF] p-4 rounded-lg">
					<div className="text-black">
						{strategySection.map((line, index) => (
							<div key={index} className="mb-1">
								{stripMarkdownBold(line)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Remaining content (depth analysis block excluded) */}
			{remainingLines.length > 0 && (
				<div
					className="leading-relaxed text-black"
					style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
				>
					{remainingLines.map((line, index) => (
						<div key={index} className="mb-2">
							{stripMarkdownBold(line)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function CoupleMingJu({
	user1,
	user2,
	currentYear,
	isSimplified = false,
}) {
	const { data: session } = useSession();
	const { coupleMingJuCache, setCoupleMingJuCache } = useCoupleAnalysis();
	const t = useTranslations("coupleReport");

	const [selectedTab, setSelectedTab] = useState("left");
	const [tabContent, setTabContent] = useState("");
	const [aiContent, setAiContent] = useState("");
	const [loading, setLoading] = useState(true);
	const [contentCache, setContentCache] = useState({});
	const [preloadingTabs, setPreloadingTabs] = useState(new Set());
	const [allTabsLoaded, setAllTabsLoaded] = useState(false);
	const [initialLoad, setInitialLoad] = useState(true);
	const [databaseDataLoaded, setDatabaseDataLoaded] = useState(false);

	const concern = "感情"; // Default concern for couple analysis

	// Create a unique cache key for this tab and couple info combination
	const getCacheKey = (tab, user1, user2, currentYear) => {
		return `${tab}_${user1.birthDateTime}_${user2.birthDateTime}_${concern}_${currentYear}`;
	};

	// Load saved data from database first (highest priority) - only once per session
	useEffect(() => {
		console.log(
			"🐛 DEBUG: CoupleMingJu useEffect triggered - user1:",
			user1,
			"user2:",
			user2
		);

		const loadSavedData = async () => {
			const sessionId =
				`couple_${user1.birthDateTime}_${user2.birthDateTime}`.replace(
					/[^a-zA-Z0-9]/g,
					"_"
				);

			try {
				console.log(
					"🔍 Loading CoupleMingJu data from database for session:",
					sessionId
				);
				const result = await getSavedContent(sessionId);

				console.log("🐛 DEBUG: getSavedContent result:", result);
				console.log("🐛 DEBUG: result.success:", result.success);
				console.log(
					"🐛 DEBUG: result.savedContent:",
					result.savedContent
				);
				console.log(
					"🐛 DEBUG: savedContent keys:",
					result.savedContent
						? Object.keys(result.savedContent)
						: "no savedContent"
				);

				if (
					result.success &&
					result.savedContent &&
					result.savedContent.coupleMingJu
				) {
					console.log(
						"🏛️ Found saved CoupleMingJu data in database:",
						result.savedContent.coupleMingJu
					);
					const savedMingJuData = result.savedContent.coupleMingJu;

					// Convert organized data back to flat cache structure
					const flatCache = {};
					Object.keys(savedMingJuData).forEach((tab) => {
						if (typeof savedMingJuData[tab] === "object") {
							Object.assign(flatCache, savedMingJuData[tab]);
						}
					});

					console.log(
						"🔄 Converted saved data to flat cache:",
						Object.keys(flatCache)
					);

					// Populate content cache with flattened saved data
					setContentCache(flatCache);
					setAllTabsLoaded(true);
					setInitialLoad(false);
					setDatabaseDataLoaded(true);

					// Set initial tab content
					const currentTabKey = getCacheKey(
						selectedTab,
						user1,
						user2,
						currentYear
					);
					const currentTabContent = flatCache[currentTabKey] || "";

					if (selectedTab === "left") {
						setTabContent(
							typeof currentTabContent === "string"
								? currentTabContent
								: ""
						);
					} else {
						setAiContent(
							typeof currentTabContent === "string"
								? currentTabContent
								: ""
						);
					}

					setLoading(false);
					return;
				} else {
					console.log(
						"🔍 No saved CoupleMingJu data found in database",
						result
					);
				}
			} catch (error) {
				console.error(
					"❌ Error loading saved CoupleMingJu data:",
					error
				);
			}
		};

		loadSavedData();
	}, [user1.birthDateTime, user2.birthDateTime, currentYear]);

	// Update tab content when selectedTab changes and database data is loaded
	useEffect(() => {
		if (databaseDataLoaded && Object.keys(contentCache).length > 0) {
			const currentTabKey = getCacheKey(
				selectedTab,
				user1,
				user2,
				currentYear
			);
			const currentTabContent = contentCache[currentTabKey] || "";

			console.log(
				`🔄 Updating tab content from database data for ${selectedTab}:`,
				currentTabKey,
				!!currentTabContent
			);

			if (selectedTab === "left") {
				setTabContent(
					typeof currentTabContent === "string"
						? currentTabContent
						: ""
				);
			} else {
				setAiContent(
					typeof currentTabContent === "string"
						? currentTabContent
						: ""
				);
			}
			setLoading(false);
		}
	}, [
		selectedTab,
		databaseDataLoaded,
		contentCache,
		user1,
		user2,
		currentYear,
	]);

	// Check for historical saved data from browser storage (fallback)
	useEffect(() => {
		// Skip if database data was already loaded
		if (databaseDataLoaded) return;

		const historicalData = getCoupleComponentData("coupleMingJu");
		if (historicalData) {
			console.log(
				"🏛️ Using historical couple MingJu data from data store"
			);

			// Populate content cache with historical data
			setContentCache(historicalData);

			// Set current tab content based on the cache key structure
			const currentTabKey = getCacheKey(
				selectedTab,
				user1,
				user2,
				currentYear
			);
			const currentTabContent = historicalData[currentTabKey] || "";

			if (selectedTab === "left") {
				setTabContent(
					typeof currentTabContent === "string"
						? currentTabContent
						: ""
				);
			} else {
				setAiContent(
					typeof currentTabContent === "string"
						? currentTabContent
						: ""
				);
			}

			setAllTabsLoaded(true);
			setInitialLoad(false);
			setLoading(false);
			return;
		}
	}, [
		selectedTab,
		user1.birthDateTime,
		user2.birthDateTime,
		concern,
		currentYear,
		databaseDataLoaded,
	]);

	// Check global couple MingJu cache first
	useEffect(() => {
		// Skip if database data was already loaded
		if (databaseDataLoaded) return;

		if (coupleMingJuCache) {
			console.log("📋 Using global cached couple MingJu analysis");
			setContentCache(coupleMingJuCache);
			setAllTabsLoaded(true);
			setInitialLoad(false);

			// Set content for current tab
			const currentCacheKey = getCacheKey(
				selectedTab,
				user1,
				user2,
				currentYear
			);
			if (coupleMingJuCache[currentCacheKey]) {
				const cached = coupleMingJuCache[currentCacheKey];
				if (selectedTab === "left") {
					setTabContent(cached);
				} else {
					setAiContent(cached);
				}
				setLoading(false);
			}
		}
	}, [
		coupleMingJuCache,
		selectedTab,
		user1,
		user2,
		currentYear,
		databaseDataLoaded,
	]);

	// Clear cache when user info changes significantly
	useEffect(() => {
		if (!coupleMingJuCache) {
			setContentCache({});
			setPreloadingTabs(new Set());
			setAllTabsLoaded(false);
			setInitialLoad(true);
			setLoading(true);
		}
	}, [user1.birthDateTime, user2.birthDateTime, coupleMingJuCache]);

	// Preload content for all tabs when component mounts or user info changes
	useEffect(() => {
		if (coupleMingJuCache && Object.keys(coupleMingJuCache).length > 0) {
			return; // Skip if we already have global cache
		}

		async function preloadAllTabs() {
			console.log("🚀 Starting couple MingJu preload for all tabs...");
			console.log("🔍 User1 info:", user1);
			console.log("🔍 User2 info:", user2);
			console.log("🔍 Current year:", currentYear);

			const loadPromises = TABS.map(async (tab) => {
				const cacheKey = getCacheKey(tab, user1, user2, currentYear);
				console.log(`🔑 Cache key for ${tab}:`, cacheKey);

				// Skip if already cached
				if (contentCache[cacheKey]) {
					console.log(`📋 Tab ${tab} already cached`);
					return;
				}

				console.log(`⏳ Preloading couple content for ${tab}`);
				setPreloadingTabs((prev) => new Set([...prev, tab]));

				try {
					console.log(
						`🤖 Calling generateCoupleMingJuAnalysis for ${tab}...`
					);
					const result = await generateCoupleMingJuAnalysis(
						{
							user1,
							user2,
							concern,
							problem: "夫妻合盤命理分析",
							currentYear,
						},
						tab,
						isSimplified
					);

					console.log(
						`✅ Generated content for ${tab}:`,
						result?.substring(0, 100)
					);

					setContentCache((prev) => {
						const updated = { ...prev, [cacheKey]: result };
						console.log(`💾 Cached content for ${tab}`);

						// Note: Database save will happen when all tabs are loaded
						console.log(
							`⏳ Tab ${tab} ready, waiting for all tabs to complete...`
						);

						return updated;
					});

					setPreloadingTabs((prev) => {
						const updated = new Set(prev);
						updated.delete(tab);
						return updated;
					});

					// If this is the currently selected tab, show the content immediately
					if (tab === selectedTab) {
						if (tab === "left") {
							setTabContent(result);
						} else {
							setAiContent(result);
						}
						setLoading(false);
					}
				} catch (error) {
					console.error(`❌ Failed to preload ${tab}:`, error);
					setPreloadingTabs((prev) => {
						const updated = new Set(prev);
						updated.delete(tab);
						return updated;
					});

					// Set fallback content for current tab if it failed to load
					if (tab === selectedTab) {
						const fallback = generateFallbackContent(
							tab,
							concern,
							user1,
							user2
						);
						if (tab === "left") {
							setTabContent(fallback);
						} else {
							setAiContent(fallback);
						}
						setLoading(false);
					}
				}
			});

			try {
				await Promise.allSettled(loadPromises);
				console.log("🎉 All couple MingJu tabs preload completed");
				setAllTabsLoaded(true);
				setInitialLoad(false);
			} catch (error) {
				console.error("❌ Error during preload:", error);
				setInitialLoad(false);
			}
		}

		preloadAllTabs();
	}, [user1, user2, currentYear, selectedTab]);

	// Save complete data to database when all tabs are loaded
	const saveCompleteCoupleMingJuData = (completeContentCache) => {
		const sessionId =
			`couple_${user1.birthDateTime}_${user2.birthDateTime}`.replace(
				/[^a-zA-Z0-9]/g,
				"_"
			);

		// Organize content by tabs
		const organizedContent = {};

		// Group content by tab (left, middle, right)
		Object.keys(completeContentCache).forEach((cacheKey) => {
			// Extract tab from cache key (format: "left_..." or "middle_..." or "right_...")
			const tabMatch = cacheKey.match(/^(left|middle|right)_/);
			if (tabMatch) {
				const tab = tabMatch[1];
				if (!organizedContent[tab]) {
					organizedContent[tab] = {};
				}
				organizedContent[tab][cacheKey] =
					completeContentCache[cacheKey];
			}
		});

		console.log("💾 Saving complete CoupleMingJu data to database:", {
			sessionId,
			tabsCount: Object.keys(organizedContent).length,
			tabs: Object.keys(organizedContent),
		});

		saveComponentContentWithUser(
			session,
			sessionId,
			"coupleMingJu",
			organizedContent,
			{
				birthday: user1.birthDateTime,
				birthday2: user2.birthDateTime,
				gender: user1.gender,
				gender2: user2.gender,
			}
		);
	};

	// Update global cache when local cache changes - moved to separate effect to avoid render issues
	useEffect(() => {
		// Only update global cache when we're not in initial loading phase
		if (
			Object.keys(contentCache).length > 0 &&
			allTabsLoaded &&
			!initialLoad
		) {
			// Use setTimeout to ensure this runs after current render cycle
			const timeoutId = setTimeout(() => {
				setCoupleMingJuCache(contentCache);
				console.log("💾 Updated global couple MingJu cache");

				// Save complete data to database
				saveCompleteCoupleMingJuData(contentCache);
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [
		contentCache,
		allTabsLoaded,
		initialLoad,
		setCoupleMingJuCache,
		user1.birthDateTime,
		user2.birthDateTime,
		user1.gender,
		user2.gender,
	]);

	// Handle tab selection - improved caching logic
	useEffect(() => {
		const cacheKey = getCacheKey(selectedTab, user1, user2, currentYear);
		console.log(`🔄 Tab changed to ${selectedTab}, cache key: ${cacheKey}`);

		// Check both local cache and global cache
		const cachedContent =
			contentCache[cacheKey] ||
			(coupleMingJuCache && coupleMingJuCache[cacheKey]);

		if (cachedContent) {
			console.log(`📋 Found cached content for ${selectedTab}`);
			if (selectedTab === "left") {
				setTabContent(cachedContent);
			} else {
				setAiContent(cachedContent);
			}
			setLoading(false);
		} else {
			console.log(
				`⏳ No cached content for ${selectedTab}, checking if loading...`
			);

			// Only show loading if we're in initial load or preloading this specific tab
			if (initialLoad || preloadingTabs.has(selectedTab)) {
				setLoading(true);

				// Wait for content to be available
				const checkForContent = () => {
					const updatedContent =
						contentCache[cacheKey] ||
						(coupleMingJuCache && coupleMingJuCache[cacheKey]);
					if (updatedContent) {
						if (selectedTab === "left") {
							setTabContent(updatedContent);
						} else {
							setAiContent(updatedContent);
						}
						setLoading(false);
					} else if (!preloadingTabs.has(selectedTab)) {
						// If not currently loading, provide fallback
						const fallback = generateFallbackContent(
							selectedTab,
							concern,
							user1,
							user2
						);
						if (selectedTab === "left") {
							setTabContent(fallback);
						} else {
							setAiContent(fallback);
						}
						setLoading(false);
					} else {
						// Still loading, check again shortly
						setTimeout(checkForContent, 500);
					}
				};

				checkForContent();
			} else {
				// Not loading and no cache, provide immediate fallback
				const fallback = generateFallbackContent(
					selectedTab,
					concern,
					user1,
					user2
				);
				if (selectedTab === "left") {
					setTabContent(fallback);
				} else {
					setAiContent(fallback);
				}
				setLoading(false);
			}
		}
	}, [
		selectedTab,
		contentCache,
		coupleMingJuCache,
		user1,
		user2,
		currentYear,
		initialLoad,
		preloadingTabs,
	]);

	// Helper function to get selected tab background color
	const getSelectedTabBg = (tab) => {
		if (tab === "left") return "#B4003C";
		if (tab === "middle") return getTabConfig(concern).middle.selectedBg;
		if (tab === "right") return getTabConfig(concern).right.selectedBg;
		return "#B4003C";
	};

	// Handle tab click - simplified without unnecessary loading
	const handleTabClick = (tab) => {
		if (tab !== selectedTab) {
			const cacheKey = getCacheKey(tab, user1, user2, currentYear);
			const hasContent =
				contentCache[cacheKey] ||
				(coupleMingJuCache && coupleMingJuCache[cacheKey]);

			// Only set loading if we don't have content and are actively preloading
			if (!hasContent && preloadingTabs.has(tab)) {
				setLoading(true);
			}

			setSelectedTab(tab);
		}
	};

	return (
		<div
			className="mx-auto shadow-md"
			style={{
				width: "100%",
				backgroundColor: "white",
				borderRadius: "clamp(20px, 5vw, 45px)",
				boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
				padding: "clamp(16px, 4vw, 60px)",
			}}
		>
			<div className="px-2 sm:px-4 lg:px-8">
				{/* Tabs - Responsive Layout */}
				<div className="flex items-center justify-center gap-4 px-2 mb-6 sm:px-4 sm:mb-8 lg:mb-8 sm:gap-8 lg:gap-16 xl:gap-20">
					{TABS.map((tab) => {
						const isSelected = selectedTab === tab;
						const label = getTabLabel(tab, concern, t);
						const imgSrc = getTabImg(tab, concern);
						const bgColor = getTabBg(tab, concern, isSelected);
						const imgColor = getTabImgColor(
							tab,
							concern,
							isSelected
						);

						return (
							<div
								key={tab}
								className="flex flex-col items-center mb-4 sm:mb-6 lg:mb-10"
							>
								<button
									className="flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
									style={{
										width: "clamp(60px, 15vw, 90px)",
										height: "clamp(60px, 15vw, 90px)",
										borderRadius: "50%",
										backgroundColor: bgColor,
										boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
									}}
									onClick={() => handleTabClick(tab)}
								>
									<Image
										src={imgSrc}
										alt={label}
										width={0}
										height={0}
										sizes="100vw"
										style={{
											width: "clamp(20px, 5vw, 32px)",
											height: "clamp(20px, 5vw, 32px)",
											filter: (() => {
												if (isSelected) {
													return "brightness(0) invert(1)";
												}

												// When unselected, use the color that would be the background when selected
												const unselectedColor =
													getTabImgColor(
														tab,
														concern,
														false
													);

												if (
													unselectedColor ===
													"#E8B923"
												) {
													return "brightness(0) saturate(100%) invert(85%) sepia(50%) saturate(2000%)  brightness(95%) contrast(102%)";
												} else if (
													unselectedColor ===
													"#E8B923"
												) {
													return "brightness(0) saturate(100%) invert(85%) sepia(50%) saturate(2000%)  brightness(95%) contrast(102%)";
												} else if (
													unselectedColor ===
													"#C74772"
												) {
													return "brightness(0) saturate(100%) invert(35%) sepia(89%) saturate(2000%) hue-rotate(320deg) brightness(95%) contrast(102%)";
												} else if (
													unselectedColor ===
													"#4B6EB2"
												) {
													return "brightness(0) saturate(100%) invert(35%) sepia(89%) saturate(2000%) hue-rotate(200deg) brightness(95%) contrast(102%)";
												} else if (
													unselectedColor ===
													"#389D7D"
												) {
													return "brightness(0) saturate(100%) invert(45%) sepia(67%) saturate(1000%) hue-rotate(150deg) brightness(85%) contrast(102%)";
												} else if (
													unselectedColor ===
													"#B4003C"
												) {
													return "brightness(0) saturate(100%) invert(15%) sepia(89%) saturate(2000%) hue-rotate(330deg) brightness(95%) contrast(102%)";
												}

												return "none";
											})(),
										}}
									/>
								</button>
								<div
									className="mt-2 text-center sm:mt-3 lg:mt-4"
									style={{
										width: "clamp(80px, 20vw, 100px)",
										fontSize: "clamp(10px, 2.5vw, 14px)",
										lineHeight: "1.2",
										color: isSelected
											? getSelectedTabBg(tab)
											: "#999",
										fontWeight: isSelected
											? "bold"
											: "normal",
									}}
								>
									{label}
								</div>
							</div>
						);
					})}
				</div>

				{/* Content - Responsive */}
				<div className="px-2 sm:px-4 lg:px-4">
					{selectedTab === "left" ? (
						<div
							className="min-h-[250px] sm:min-h-[300px] lg:min-h-[300px]"
							style={{
								backgroundColor: "white",
								color: "black",
								fontSize: "clamp(13px, 3.2vw, 15px)",
							}}
						>
							{loading ? (
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											小鈴正在分析夫妻合盤配對
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											請稍候，正在深度解析日月互動
										</div>
									</div>
								</div>
							) : (
								<div className="py-3 sm:py-4">
									{formatLeftTabContent(tabContent)}
								</div>
							)}
						</div>
					) : (
						<div className="min-h-[250px] sm:min-h-[300px] lg:min-h-[300px]">
							{loading ? (
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											小鈴正在分析夫妻姻緣配對
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											請稍候，正在生成專屬合盤建議
										</div>
									</div>
								</div>
							) : (
								<div
									style={{
										fontFamily:
											"system-ui, -apple-system, sans-serif",
									}}
								>
									{selectedTab === "middle" ||
									selectedTab === "right" ? (
										aiContent &&
										typeof aiContent === "string" &&
										aiContent.trim().length > 0 ? (
											renderStructuredContent(
												concern,
												selectedTab,
												aiContent
											)
										) : (
											<div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
												<p className="text-gray-600">
													正在載入分析內容...
												</p>
											</div>
										)
									) : (
										<div
											className="leading-relaxed text-black whitespace-pre-line"
											style={{
												fontSize:
													"clamp(14px, 3.5vw, 16px)",
											}}
										>
											{aiContent || "正在載入內容..."}
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default CoupleMingJu;
