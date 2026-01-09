import React, { useState, useEffect } from "react";
import Image from "next/image";

const TAB_CONFIG = {
	健康: {
		middle: {
			label: "疾厄宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#DEAB20",
		},
		right: {
			label: "調候與病源關鍵",
			img: "/images/report/health.png",
			selectedBg: "#389D7D",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#389D7D",
		},
	},
	財運: {
		middle: {
			label: "財星與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#DEAB20",
		},
		right: {
			label: "財星定位",
			img: "/images/report/money.png",
			selectedBg: "#D09900",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
	},
	事業: {
		middle: {
			label: "事業宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#DEAB20",
		},
		right: {
			label: "財星定位",
			img: "/images/report/money.png",
			selectedBg: "#3263C4",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#3263C4",
		},
	},
	感情: {
		middle: {
			label: "感情宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#DEAB20",
		},
		right: {
			label: "感情定位",
			img: "/images/report/heart2.png",
			selectedBg: "#C74772",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#C74772",
		},
	},
};

const TABS = ["日主特性", "middle", "right"];

function getTabConfig(concern) {
	return TAB_CONFIG[concern] || TAB_CONFIG["財運"];
}

function getTabLabel(tab, concern) {
	if (tab === "日主特性") return "日主特性";
	if (tab === "middle") return getTabConfig(concern).middle.label;
	if (tab === "right") return getTabConfig(concern).right.label;
	return "";
}

function getTabImg(tab, concern) {
	if (tab === "日主特性") return "/images/report/sun.png";
	if (tab === "middle") return getTabConfig(concern).middle.img;
	if (tab === "right") return getTabConfig(concern).right.img;
	return "";
}

function getTabBg(tab, concern, selected) {
	if (tab === "日主特性") return selected ? "#B4003C" : "#EFEFEF";
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
	if (tab === "日主特性") return selected ? "#FFFFFF" : "#B4003C";
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

// AI analysis function with enhanced confidence and fallback strategy
async function generateMingJuAnalysis(
	{ birthDateTime, gender, concern, problem, currentYear },
	tab
) {
	const concernArea = concern || "財運";

	// Create AI prompt based on tab and concern
	const prompt = createAIPrompt(concernArea, tab, {
		birthDateTime,
		gender,
		problem,
	});

	// Try AI API multiple times for better reliability
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			console.log(
				`AI Analysis Attempt ${attempt} for ${tab} - ${concernArea}`
			);

			// Call your AI API here (replace with your actual AI service)
			const response = await fetch("/api/ai-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					userInfo: { birthDateTime, gender, concern, problem },
					analysisType: `mingju_${tab}_${concernArea}`,
					currentYear,
					attempt,
					forceDetailed: true, // Request more detailed analysis
					confidence: "high", // Request high confidence response
				}),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.analysis && data.analysis.length > 50) {
					// Ensure substantial content
					console.log(`AI Success on attempt ${attempt}`);
					return {
						content: data.analysis,
						isAI: true,
						confidence: data.confidence || "medium",
					};
				}
			} else {
				console.log(
					`AI API failed on attempt ${attempt}:`,
					response.status
				);
			}
		} catch (error) {
			console.error(`AI analysis attempt ${attempt} failed:`, error);
		}

		// Wait before retry (except on last attempt)
		if (attempt < 3) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	// If all AI attempts fail, generate dynamic content based on user data
	console.log("AI failed, generating dynamic personalized content");
	return {
		content: generatePersonalizedContent(concernArea, tab, {
			birthDateTime,
			gender,
			problem,
		}),
		isAI: false,
		confidence: "medium",
	};
}

// Generate more personalized content based on user data
function generatePersonalizedContent(concernArea, tab, userInfo) {
	const { birthDateTime, gender, problem } = userInfo;

	// Extract birth year for more specific analysis
	const birthYear = birthDateTime
		? new Date(birthDateTime).getFullYear()
		: 2000;
	const age = new Date().getFullYear() - birthYear;
	const isYoung = age < 35;
	const isMidAge = age >= 35 && age < 55;
	const isElder = age >= 55;

	// Gender-specific adjustments - handle both English and Chinese input
	let genderRef = "男性"; // default to male
	if (gender === "female" || gender === "女" || gender === "女性") {
		genderRef = "女性";
	} else if (gender === "male" || gender === "男" || gender === "男性") {
		genderRef = "男性";
	}

	const lifeStage = isYoung ? "青年" : isMidAge ? "中年" : "長者";

	console.log(
		`Gender mapping: input="${gender}" -> output="${genderRef}", age=${age}, lifeStage="${lifeStage}"`
	);

	if (tab === "日主特性") {
		return generatePersonalizedDayMaster(
			concernArea,
			genderRef,
			lifeStage,
			problem
		);
	} else if (tab === "middle") {
		return generatePersonalizedMiddle(
			concernArea,
			genderRef,
			lifeStage,
			problem,
			birthYear
		);
	} else if (tab === "right") {
		return generatePersonalizedRight(
			concernArea,
			genderRef,
			lifeStage,
			problem,
			birthYear
		);
	}

	return getFallbackContent(concernArea, tab);
}

// Personalized Day Master analysis
function generatePersonalizedDayMaster(concern, gender, lifeStage, problem) {
	const stageAdvice = {
		青年: "正值奮鬥期，宜積極開拓",
		中年: "經驗豐富期，宜穩健發展",
		長者: "智慧成熟期，宜傳承指導",
	};

	const concernAdvice = {
		財運: `${gender}${lifeStage}階段，${stageAdvice[lifeStage]}財富基礎。天生具備敏銳的商業直覺與理財能力，但需注意不同人生階段的理財策略調整。`,
		事業: `${gender}${lifeStage}特質，${stageAdvice[lifeStage]}事業版圖。具備強烈的事業心與執行力，適合在專業領域深耕發展。`,
		健康: `${gender}${lifeStage}體質，${stageAdvice[lifeStage]}健康管理。注重身心平衡與預防保健，建立良好的生活作息習慣。`,
		感情: `${gender}${lifeStage}情感，${stageAdvice[lifeStage]}人際關係。感情豐富真誠，重視家庭與親情，但需學習情緒管理技巧。`,
	};

	// Filter out generic problem text
	const shouldIncludeProblem =
		problem &&
		!problem.includes("用戶選擇") &&
		!problem.includes("選項") &&
		problem.length > 10;

	return `根據你的出生信息分析，${concernAdvice[concern]}

優勢表現在決策果斷、直覺敏銳兩方面，能夠快速掌握機會並做出正確判斷。

然而需要注意的是，有時過於衝動、缺乏耐心的傾向，可能影響長期規劃的執行。

調候重點在於平衡陰陽五行，${lifeStage}階段特別需要注重${concern === "財運" ? "財庫穩固" : concern === "事業" ? "事業根基" : concern === "健康" ? "身心調養" : "感情和諧"}，長期策略宜採取穩健且具彈性的發展方針。`;
}

// Enhanced personalized middle content with BaZi elements
function generatePersonalizedMiddle(
	concern,
	gender,
	lifeStage,
	problem,
	birthYear
) {
	// Extract BaZi elements based on birth year
	const yearElements = {
		1984: {
			year: "甲子",
			element: "海中金",
			dayMaster: "甲木",
			strength: "偏弱",
		},
		1985: {
			year: "乙丑",
			element: "海中金",
			dayMaster: "乙木",
			strength: "中等",
		},
		2000: {
			year: "庚辰",
			element: "白臘金",
			dayMaster: "庚金",
			strength: "偏強",
		},
		1990: {
			year: "庚午",
			element: "路旁土",
			dayMaster: "庚金",
			strength: "中等",
		},
		1995: {
			year: "乙亥",
			element: "山頭火",
			dayMaster: "乙木",
			strength: "偏弱",
		},
	};

	const baziInfo = yearElements[birthYear] || {
		year: "庚子",
		element: "壁上土",
		dayMaster: "庚金",
		strength: "中等",
	};

	if (concern === "財運") {
		return JSON.stringify({
			财星核心: {
				主要内容: `${gender}${lifeStage}，${baziInfo.year}年${baziInfo.element}命，日主${baziInfo.dayMaster}${baziInfo.strength}，財星配置分析`,
				状态列表: [
					`財星根基：${baziInfo.dayMaster}生人，${lifeStage}階段財星${baziInfo.strength === "偏強" ? "得力有根" : baziInfo.strength === "偏弱" ? "虛浮少根" : "中平穩定"}`,
					`五行生剋：${baziInfo.element}納音，${gender}特質配合${baziInfo.dayMaster}日主，${baziInfo.strength === "偏強" ? "身強能勝財" : "身弱需助力"}`,
					`格局特點：${birthYear}年出生者多屬${baziInfo.dayMaster.includes("木") ? "木性溫和" : baziInfo.dayMaster.includes("金") ? "金性果斷" : baziInfo.dayMaster.includes("火") ? "火性急躁" : baziInfo.dayMaster.includes("水") ? "水性靈活" : "土性穩重"}特質`,
				],
				结论: `${baziInfo.dayMaster}日主配合${lifeStage}運勢，財運${baziInfo.strength === "偏強" ? "有力但需控制" : baziInfo.strength === "偏弱" ? "需要扶助方能發揮" : "穩定發展為宜"}`,
			},
			生财之源: {
				主要分析: `${baziInfo.dayMaster}日主的食傷星為生財之源，${gender}在${lifeStage}階段，${baziInfo.element}命格特質顯示創意與技能並重。根據${birthYear}年出生的命理特徵，最適合發展與${baziInfo.dayMaster.includes("木") ? "文創設計" : baziInfo.dayMaster.includes("金") ? "精密技術" : baziInfo.dayMaster.includes("火") ? "表演創意" : baziInfo.dayMaster.includes("水") ? "流通服務" : "不動產建設"}相關的事業。`,
				关键问题: {
					问题1: {
						名称: `${baziInfo.dayMaster}日主制財困難`,
						解释: `${baziInfo.strength === "偏弱" ? "身弱財多，難以駕馭大財，需要印比助身" : baziInfo.strength === "偏強" ? "身強財弱，需要食傷生財或流年助財" : "身財平衡，但需要適當調候"}`,
					},
					问题2: {
						名称: `${lifeStage}階段運勢特點`,
						解释: `${lifeStage === "青年" ? "大運剛起，根基未穩，宜累積實力" : lifeStage === "中年" ? "大運當旺，是發財關鍵期，把握機會" : "大運漸衰，宜守成保財，避免大投資"}`,
					},
				},
			},
			十神互动关键: {
				十神列表: [
					{
						名称: `印星（生${baziInfo.dayMaster}）`,
						作用: `${gender}貴人運配合印星，適合透過學習進修、前輩提攜來增強實力`,
					},
					{
						名称: `食傷（${baziInfo.dayMaster}生財）`,
						作用: `${lifeStage}優勢在創新思維，是主要生財工具，但需要落實執行`,
					},
					{
						名称: `比劫（與${baziInfo.dayMaster}同類）`,
						作用: `${birthYear}年代出生者競爭激烈，容易有合作分財或同行競爭問題`,
					},
				],
				格局核心: `${baziInfo.dayMaster}${baziInfo.strength}，${lifeStage}${baziInfo.strength === "偏弱" ? "宜助身再求財" : "可積極求財發展"}`,
			},
		});
	}

	// Add similar BaZi-based analysis for other concerns...
	else if (concern === "事業") {
		return JSON.stringify({
			事业根基: {
				主要内容: `${gender}${lifeStage}，${baziInfo.year}年${baziInfo.element}命，日主${baziInfo.dayMaster}特質分析事業根基`,
				状态列表: [
					`事業宮位：${baziInfo.dayMaster}坐支分析，${lifeStage}階段事業宮${baziInfo.strength === "偏強" ? "有力主導性強" : "需要扶助合作"}`,
					`職場特質：${baziInfo.element}納音特性，${gender}適合${baziInfo.dayMaster.includes("木") ? "成長型行業" : baziInfo.dayMaster.includes("金") ? "技術型工作" : "服務型事業"}發展`,
					`發展潛力：${birthYear}年出生世代，在${lifeStage}階段具備${baziInfo.strength === "偏強" ? "領導統御" : "專業技術"}優勢`,
				],
				结论: `${baziInfo.dayMaster}日主在事業發展上${baziInfo.strength === "偏強" ? "宜主導創業" : "宜專業深耕"}，配合${lifeStage}運勢節奏`,
			},
			事业发展: {
				主要分析: `根據${baziInfo.dayMaster}日主特質，${gender}在${lifeStage}階段最適合從事與${baziInfo.dayMaster.includes("木") ? "教育文化、環保綠能" : baziInfo.dayMaster.includes("金") ? "科技製造、金融投資" : baziInfo.dayMaster.includes("火") ? "傳媒娛樂、能源化工" : baziInfo.dayMaster.includes("水") ? "運輸物流、餐飲服務" : "建築房地產、農業土地"}相關的行業。`,
				关键问题: {
					问题1: {
						名称: `${baziInfo.dayMaster}日主發展瓶頸`,
						解释: `${baziInfo.strength === "偏弱" ? "能力有限需要團隊支持，不宜獨自承擔重責" : baziInfo.strength === "偏強" ? "個性強勢需要學習協調，避免孤軍奮戰" : "能力適中宜穩健發展"}`,
					},
					问题2: {
						名称: `${lifeStage}階段挑戰`,
						解释: `${lifeStage === "青年" ? "經驗不足需要多學習，把握每個成長機會" : lifeStage === "中年" ? "責任加重需要平衡，避免過度勞累" : "體力精神有限，宜傳承經驗指導後進"}`,
					},
				},
			},
			十神互动关键: {
				十神列表: [
					{
						名称: `官殺（管制${baziInfo.dayMaster}）`,
						作用: `事業中的上司制度，${baziInfo.strength === "偏強" ? "需要適當約束發揮更好" : "壓力過大需要緩解"}`,
					},
					{
						名称: `印星（生助${baziInfo.dayMaster}）`,
						作用: `學習進修的機會，${gender}在${lifeStage}階段特別需要知識技能提升`,
					},
					{
						名称: `食傷（${baziInfo.dayMaster}發揮）`,
						作用: `創新表現的能力，是在職場上展現才華的主要管道`,
					},
				],
				格局核心: `${baziInfo.dayMaster}${baziInfo.strength}格，${lifeStage}宜${baziInfo.strength === "偏強" ? "主動出擊創業" : "穩健發展專精"}`,
			},
		});
	}

	// Continue with other concerns but add BaZi elements...
	return getFallbackContent(concern, "middle");
}

// Enhanced personalized right content with BaZi elements
function generatePersonalizedRight(
	concern,
	gender,
	lifeStage,
	problem,
	birthYear
) {
	// Extract BaZi elements based on birth year
	const yearElements = {
		1984: {
			year: "甲子",
			element: "海中金",
			dayMaster: "甲木",
			strength: "偏弱",
			lucky: "水木",
		},
		1985: {
			year: "乙丑",
			element: "海中金",
			dayMaster: "乙木",
			strength: "中等",
			lucky: "水木",
		},
		2000: {
			year: "庚辰",
			element: "白臘金",
			dayMaster: "庚金",
			strength: "偏強",
			lucky: "土金",
		},
		1990: {
			year: "庚午",
			element: "路旁土",
			dayMaster: "庚金",
			strength: "中等",
			lucky: "土火",
		},
		1995: {
			year: "乙亥",
			element: "山頭火",
			dayMaster: "乙木",
			strength: "偏弱",
			lucky: "木火",
		},
	};

	const baziInfo = yearElements[birthYear] || {
		year: "庚子",
		element: "壁上土",
		dayMaster: "庚金",
		strength: "中等",
		lucky: "土金",
	};

	if (concern === "財運") {
		return JSON.stringify({
			核心论述: {
				财星本体: `${gender}${lifeStage}，${baziInfo.year}年${baziInfo.element}命，日主${baziInfo.dayMaster}，財星以金為主體`,
				财星状态: `財星如同${baziInfo.dayMaster.includes("木") ? "樹木需要修剪才能結果" : baziInfo.dayMaster.includes("金") ? "金屬需要錘鍊才能成器" : baziInfo.dayMaster.includes("火") ? "火焰需要燃料才能旺盛" : baziInfo.dayMaster.includes("水") ? "流水需要河道才能奔騰" : "土地需要耕耘才能豐收"}，${gender}在${lifeStage}階段理財特質為${baziInfo.strength === "偏強" ? "積極進取但需控制風險" : baziInfo.strength === "偏弱" ? "保守穩健需要助力" : "平衡發展穩中求進"}`,
				财源: `透過${baziInfo.dayMaster.includes("木") ? "創意文化、教育培訓" : baziInfo.dayMaster.includes("金") ? "技術服務、精密製造" : baziInfo.dayMaster.includes("火") ? "傳媒娛樂、能源化工" : baziInfo.dayMaster.includes("水") ? "流通貿易、餐飲服務" : "房地產建築、農業土地"}等專業技能生財，但受制於${lifeStage}階段的${lifeStage === "青年" ? "經驗不足" : lifeStage === "中年" ? "責任繁重" : "體力精神有限"}`,
				破财之源: `${baziInfo.dayMaster}日主最怕${baziInfo.dayMaster.includes("木") ? "金克太重" : baziInfo.dayMaster.includes("金") ? "火克太旺" : baziInfo.dayMaster.includes("火") ? "水克太盛" : baziInfo.dayMaster.includes("水") ? "土克太實" : "木克太猛"}，體現在同輩競爭、衝動決策、${gender}特有的理財盲點`,
				调候关键: `根據${baziInfo.element}命格，需要${baziInfo.lucky}調候，具體為${baziInfo.lucky.includes("水") ? "理性規劃" : ""}${baziInfo.lucky.includes("木") ? "成長學習" : ""}${baziInfo.lucky.includes("火") ? "積極行動" : ""}${baziInfo.lucky.includes("土") ? "穩健基礎" : ""}${baziInfo.lucky.includes("金") ? "精準執行" : ""}雙重平衡`,
			},
			财运特质: {
				总体特征: `${gender}${lifeStage}，${baziInfo.dayMaster}日主${baziInfo.strength}，財運偏向${baziInfo.strength === "偏強" ? "主動進取型，適合創業投資" : baziInfo.strength === "偏弱" ? "穩健保守型，適合儲蓄理財" : "平衡發展型，適合多元配置"}`,
				特质列表: [
					{
						标题: `${baziInfo.dayMaster}日主理財特質`,
						说明: `${baziInfo.dayMaster.includes("木") ? "成長性投資，重視長期價值" : baziInfo.dayMaster.includes("金") ? "精準投資，重視技術分析" : baziInfo.dayMaster.includes("火") ? "積極投資，重視趨勢把握" : baziInfo.dayMaster.includes("水") ? "靈活投資，重視資金流動" : "穩健投資，重視資產配置"}，${baziInfo.strength === "偏強" ? "有魄力但需控制" : "謹慎穩重需要信心"}`,
					},
					{
						标题: `${lifeStage}階段收入特色`,
						说明: `${gender}在${lifeStage}期，收入來源以${lifeStage === "青年" ? "學習成長為主，重視技能累積" : lifeStage === "中年" ? "專業發揮為主，重視事業發展" : "經驗傳承為主，重視穩定保值"}，配合${baziInfo.element}命格特質`,
					},
					{
						标题: "支出管理風格",
						说明: `根據${baziInfo.dayMaster}特質，在生活品質與儲蓄之間${baziInfo.strength === "偏強" ? "敢於消費享受但需要節制" : baziInfo.strength === "偏弱" ? "注重節約但不要過度節省" : "尋求平衡適度消費"}，重視實用性投資`,
					},
					{
						标题: `${baziInfo.element}命格投資建議`,
						说明: `${lifeStage}階段適合${baziInfo.lucky.includes("水") ? "流動性較高的投資" : ""}${baziInfo.lucky.includes("木") ? "成長型股票或基金" : ""}${baziInfo.lucky.includes("火") ? "積極型投資組合" : ""}${baziInfo.lucky.includes("土") ? "不動產或穩健型投資" : ""}${baziInfo.lucky.includes("金") ? "定存或貴金屬投資" : ""}，配合${gender}特質${baziInfo.strength === "偏強" ? "可承擔中高風險" : "宜選擇低風險標的"}`,
					},
				],
			},
		});
	}

	// Add similar BaZi-enhanced content for other concerns...
	else if (concern === "事業") {
		return JSON.stringify({
			核心论述: {
				事业本质: `${gender}${lifeStage}，${baziInfo.year}年${baziInfo.element}命，日主${baziInfo.dayMaster}特質決定事業本質`,
				事业状态: `事業如同${baziInfo.dayMaster.includes("木") ? "大樹成長需要時間培育" : baziInfo.dayMaster.includes("金") ? "精工製作需要技術琢磨" : "專業發展需要持續精進"}，${gender}在${lifeStage}階段需要${baziInfo.strength === "偏強" ? "積極主導開創新局" : baziInfo.strength === "偏弱" ? "團隊合作穩健發展" : "平衡推進多元發展"}`,
				发展途径: `透過${baziInfo.dayMaster.includes("木") ? "教育文化、環保創新" : baziInfo.dayMaster.includes("金") ? "科技製造、金融服務" : baziInfo.dayMaster.includes("火") ? "傳媒娛樂、新能源" : baziInfo.dayMaster.includes("水") ? "運輸物流、服務業" : "建築房地產、農業"}相關專業發展，但需注意${lifeStage}階段特有挑戰`,
				阻碍之源: `${baziInfo.dayMaster}日主在事業發展中最大阻礙是${baziInfo.strength === "偏強" ? "過於自信獨斷，不善合作" : baziInfo.strength === "偏弱" ? "缺乏自信魄力，錯失機會" : "猶豫不決，難以抉擇"}，加上${lifeStage}階段的特殊壓力`,
				调候关键: `根據${baziInfo.element}納音，事業發展需要${baziInfo.lucky}五行調候，重點是${baziInfo.lucky.includes("水") ? "理性規劃" : ""}${baziInfo.lucky.includes("木") ? "持續學習" : ""}${baziInfo.lucky.includes("火") ? "積極行動" : ""}${baziInfo.lucky.includes("土") ? "穩固基礎" : ""}${baziInfo.lucky.includes("金") ? "精準執行" : ""}的平衡發展`,
			},
			事业特质: {
				总体特征: `${gender}${lifeStage}，${baziInfo.dayMaster}日主事業運特徵為${baziInfo.strength === "偏強" ? "領導型，適合管理創業" : baziInfo.strength === "偏弱" ? "專業型，適合技術深耕" : "平衡型，適合團隊協作"}發展模式`,
				特质列表: [
					{
						标题: `${baziInfo.dayMaster}日主職場特質`,
						说明: `${baziInfo.dayMaster.includes("木") ? "成長學習能力強，適應性佳" : baziInfo.dayMaster.includes("金") ? "執行力強，注重效率" : baziInfo.dayMaster.includes("火") ? "創新熱情，表達能力佳" : baziInfo.dayMaster.includes("水") ? "靈活變通，人際關係好" : "穩重可靠，組織能力強"}，${baziInfo.strength === "偏強" ? "領導潛質突出" : "專業能力扎實"}`,
					},
					{
						标题: `${lifeStage}發展方向`,
						说明: `${gender}在${lifeStage}期，適合往${baziInfo.dayMaster.includes("木") ? "創新成長" : baziInfo.dayMaster.includes("金") ? "技術精進" : baziInfo.dayMaster.includes("火") ? "表現創意" : baziInfo.dayMaster.includes("水") ? "服務流通" : "管理建設"}方向發展，配合${baziInfo.element}命格優勢`,
					},
					{
						标题: "團隊合作模式",
						说明: `根據${baziInfo.dayMaster}特質，在團隊中適合扮演${baziInfo.strength === "偏強" ? "領導主導" : baziInfo.strength === "偏弱" ? "專業支援" : "協調平衡"}角色，重視${gender}特有的溝通優勢`,
					},
					{
						标题: `${baziInfo.element}命格發展策略`,
						说明: `${lifeStage}階段事業策略宜${baziInfo.lucky.includes("水") ? "靈活應變保持學習" : ""}${baziInfo.lucky.includes("木") ? "持續成長擴大影響" : ""}${baziInfo.lucky.includes("火") ? "積極表現爭取機會" : ""}${baziInfo.lucky.includes("土") ? "穩健經營建立基礎" : ""}${baziInfo.lucky.includes("金") ? "精準定位發揮專長" : ""}，配合${baziInfo.strength}特質發展`,
					},
				],
			},
		});
	}

	// Continue with other concerns...
	return getFallbackContent(concern, "right");
}

// Create structured prompts for AI with enhanced confidence
function createAIPrompt(concern, tab, userInfo) {
	const { birthDateTime, gender, problem } = userInfo;

	const baseContext = `用戶生辰：${birthDateTime}，性別：${gender}，關注領域：${concern}，具體問題：${problem}

【重要指示】你是專業的八字命理大師，必須提供具體、準確、有說服力的分析。避免模糊用詞，要給出明確的判斷和建議。`;

	if (tab === "日主特性") {
		return `${baseContext}

請必須按照以下格式提供具體分析（不要用模糊詞彙）：

分析用戶的日主特性，必須包含：
1. 明確指出日干五行和月令的具體關係
2. 具體列出2個明確優勢（用事實說話）
3. 具體列出2個明確劣勢（不要模糊）
4. 提供具體的調候方案（說出具體五行）
5. 給出針對${concern}的具體長期策略

格式要求：
[具體日干]生於[具體月令]，[明確坐支分析]，賦予[具體優勢1、具體優勢2]；然[具體劣勢1、具體劣勢2]。全局[具體調候需求]，[具體長期策略]

必須約250字，用專業術語配合具體建議，避免空泛描述。`;
	} else if (tab === "middle") {
		if (concern === "財運") {
			return `${baseContext}
      
你必須嚴格按照以下JSON格式回應，提供具體而非模糊的分析：

{
  "财星核心": {
    "主要内容": "明確指出正財或偏財的具體位置和狀態（如：正財庚金透於時干）",
    "状态列表": [
      "具體財星強弱狀態：[提供具體證據，如得月令生扶或受克制]",
      "具體受生受克情況：[明確說出哪個十神生克，如被傷官泄氣]", 
      "具體根基情況：[說明地支藏干情況和支撐力度]"
    ],
    "结论": "給出明確的財星總體評價，不要模糊用詞"
  },
  "生财之源": {
    "主要分析": "具體分析食傷位置、強弱及生財能力，說明是什麼類型的才華技能（約100字，要具體）",
    "关键问题": {
      "问题1": {
        "名称": "具體問題名稱（如：土燥不生金）",
        "解释": "具體解釋這個問題的成因和影響，不要空泛（50字）"
      },
      "问题2": {
        "名称": "另一個具體問題名稱",
        "解释": "具體解釋第二個問題，提供明確分析（50字）"
      }
    }
  },
  "十神互动关键": {
    "十神列表": [
      {
        "名称": "具體十神名稱（具體五行）",
        "作用": "明確說明這個十神如何影響財運，要具體（40字）"
      },
      {
        "名称": "第二個十神（具體五行）",
        "作用": "具體作用機制，不要模糊描述（40字）"
      },
      {
        "名称": "第三個十神（具體五行）",
        "作用": "明確的影響分析，要有說服力（40字）"
      }
    ],
    "格局核心": "用15字內準確概括核心矛盾，要有針對性"
  }
}

【強制要求】：
- 必須提供具體的天干地支分析
- 不允許使用"可能"、"或許"、"一般來說"等模糊詞彙
- 每個分析都要有具體的命理依據
- 總字數約300字，內容要實用有效`;
		} else if (concern === "事業") {
			return `${baseContext}
      
你必須嚴格按照以下JSON格式回應，提供事業方面的具體分析：

{
  "事业根基": {
    "主要内容": "明確分析事業宮位置和十神配置，說出具體優勢",
    "状态列表": [
      "具體事業根基：[明確說出日支或其他宮位的事業特質]",
      "具體發展潛力：[根據十神配置給出明確判斷]",
      "具體競爭優勢：[說明在職場上的具體優勢]"
    ],
    "结论": "對事業發展給出明確而非模糊的總結"
  },
  "事业发展": {
    "主要分析": "具體分析適合的事業方向和發展模式，要給出明確建議（約100字）",
    "关键问题": {
      "问题1": {
        "名称": "具體事業發展障礙",
        "解释": "明確說明這個障礙的原因和解決方向（50字）"
      },
      "问题2": {
        "名称": "另一個具體挑戰",
        "解释": "具體分析第二個挑戰及應對策略（50字）"
      }
    }
  },
  "十神互动关键": {
    "十神列表": [
      {
        "名称": "具體十神（五行）",
        "作用": "明確說明對事業的具體影響（40字）"
      },
      {
        "名称": "第二個十神（五行）",
        "作用": "具體的事業影響分析（40字）"
      },
      {
        "名称": "第三個十神（五行）",
        "作用": "明確的作用機制（40字）"
      }
    ],
    "格局核心": "15字內準確概括事業發展的核心特點"
  }
}

必須提供具體的職業建議和發展策略，避免空泛描述。`;
		}
		// Add similar enhanced prompts for other concerns...
	} else if (tab === "right") {
		if (concern === "財運") {
			return `${baseContext}
      
你必須嚴格按照以下JSON格式回應，提供實用的財運定位分析：

{
  "核心论述": {
    "财星本体": "明確說明正財偏財的具體配置和特質",
    "财星状态": "用生動比喻描述財星狀態，加上具體風險警示（60字）",
    "财源": "具體說明生財途徑和制約因素，要實用",
    "破财之源": "明確指出破財的具體原因，不要模糊",
    "调候关键": "具體說明需要哪些五行調候，要有可操作性"
  },
  "财运特质": {
    "总体特征": "用40字準確概括財運總體特徵，要有說服力",
    "特质列表": [
      {
        "标题": "第一個財運特質標題",
        "说明": "具體的表現和實用建議，要可執行（40字）"
      },
      {
        "标题": "第二個財運特質標題",
        "说明": "具體分析和建議，要有針對性（40字）"
      },
      {
        "标题": "第三個財運特質標題",
        "说明": "明確的特質說明和應對方法（40字）"
      },
      {
        "标题": "第四個財運特質標題",
        "说明": "具體的財運建議，要實用有效（40字）"
      }
    ]
  }
}

【強制要求】：
- 必須提供可執行的理財建議
- 不允許模糊或空泛的描述
- 每個建議都要有具體的操作方向
- 總字數約350字，要實用性為主，避免理論空談`;
		}
		// Add other concerns for right tab...
	}

	return `${baseContext}\n你是專業命理師，必須根據八字提供具體、準確、有說服力的${concern}分析。避免模糊用詞，要給出明確判斷。`;
}

// Content rendering with structured layout
function renderStructuredContent(concernArea, tab, aiContent) {
	const containerStyle = {
		backgroundColor: "#ECECEC",
		borderRadius: "20px",
		boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
		padding: "20px",
		marginBottom: "16px",
	};

	// Color schemes per concern
	const colorSchemes = {
		財運: { primary: "#D09900", secondary: "#B4003C", accent: "#389D7D" },
		事業: { primary: "#3263C4", secondary: "#B4003C", accent: "#389D7D" },
		健康: { primary: "#389D7D", secondary: "#B4003C", accent: "#D09900" },
		感情: { primary: "#C74772", secondary: "#B4003C", accent: "#389D7D" },
	};

	const colors = colorSchemes[concernArea] || colorSchemes["財運"];

	// Try to parse AI JSON response
	let parsedContent = null;
	try {
		if (typeof aiContent === "string" && aiContent.trim().startsWith("{")) {
			parsedContent = JSON.parse(aiContent);
			console.log("Successfully parsed JSON content:", parsedContent);
		}
	} catch (error) {
		console.log("Failed to parse JSON, using text content as-is");
	}

	if (tab === "middle") {
		// Always render structured layout - use parsed AI content or fallback structure
		if (parsedContent) {
			// Use AI JSON content
			const firstKey = Object.keys(parsedContent)[0];
			const secondKey = Object.keys(parsedContent)[1];
			const thirdKey = Object.keys(parsedContent)[2];

			const sectionTitles = {
				財運: {
					first: "財星核心",
					second: "生財之源",
					third: "十神互動關鍵",
				},
				事業: {
					first: "事業根基",
					second: "十神解析",
					third: "十神互動關鍵",
				},
				健康: {
					first: "健康根基",
					second: "病源分析",
					third: "十神互動關鍵",
				},
				感情: {
					first: "感情根基",
					second: "感情分析",
					third: "十神互動關鍵",
				},
			};

			const titles = sectionTitles[concernArea];

			return (
				<div className="space-y-4">
					{/* First Section */}
					<div style={containerStyle}>
						<h3
							className="mb-3 text-lg font-bold"
							style={{ color: colors.secondary }}
						>
							【{titles.first}】
						</h3>
						<div className="leading-relaxed text-gray-800">
							<p className="mb-2">
								{parsedContent[firstKey]?.主要内容}
							</p>
							{parsedContent[firstKey]?.状态列表 && (
								<ul className="ml-2 space-y-1 list-disc list-inside">
									{parsedContent[firstKey].状态列表.map(
										(item, index) => (
											<li key={index}>{item}</li>
										)
									)}
								</ul>
							)}
							<p
								className="mt-3 font-semibold"
								style={{ color: colors.secondary }}
							>
								【結論】{parsedContent[firstKey]?.结论}
							</p>
						</div>
					</div>

					{/* Second Section */}
					<div style={containerStyle}>
						<h3
							className="mb-3 text-lg font-bold"
							style={{ color: colors.secondary }}
						>
							【{titles.second}】
						</h3>
						<div className="leading-relaxed text-gray-800">
							<p className="mb-3">
								{parsedContent[secondKey]?.主要分析}
							</p>

							{parsedContent[secondKey]?.关键问题 &&
								Object.entries(
									parsedContent[secondKey].关键问题
								).map(([key, problem], index) => (
									<div
										key={index}
										className="p-3 mb-2 bg-white rounded-lg"
									>
										<h4
											className="mb-2 font-semibold"
											style={{ color: colors.primary }}
										>
											{problem.名称}
										</h4>
										<p className="text-sm text-gray-700">
											{problem.解释}
										</p>
									</div>
								))}
						</div>
					</div>

					{/* Third Section */}
					<div style={containerStyle}>
						<h3
							className="mb-3 text-lg font-bold"
							style={{ color: colors.secondary }}
						>
							【{titles.third}】
						</h3>
						<div className="space-y-2 leading-relaxed text-gray-800">
							{parsedContent[thirdKey]?.十神列表?.map(
								(item, index) => (
									<div
										key={index}
										className="flex items-start"
									>
										<span
											className="mr-2 font-semibold"
											style={{ color: colors.accent }}
										>
											•
										</span>
										<span>
											<strong>{item.名称}</strong>：
											{item.作用}
										</span>
									</div>
								)
							)}
							<p
								className="p-2 mt-3 font-semibold bg-white rounded-lg"
								style={{ color: colors.secondary }}
							>
								【格局核心】{parsedContent[thirdKey]?.格局核心}
							</p>
						</div>
					</div>
				</div>
			);
		} else {
			// Use structured fallback for middle tab
			return renderStructuredFallbackMiddle(
				concernArea,
				colors,
				containerStyle
			);
		}
	}

	if (tab === "right") {
		if (parsedContent) {
			// Use AI JSON content
			const coreKey = Object.keys(parsedContent)[0];
			const traitsKey = Object.keys(parsedContent)[1];

			const sectionTitles = {
				財運: { first: "核心論述", second: "財運特質" },
				事業: { first: "核心論述", second: "事業特質" },
				健康: { first: "核心論述", second: "健康特質" },
				感情: { first: "核心論述", second: "感情特質" },
			};

			const titles = sectionTitles[concernArea];

			return (
				<div className="space-y-4">
					{/* Core Analysis Section */}
					<div style={containerStyle}>
						<h3
							className="mb-3 text-lg font-bold"
							style={{ color: colors.secondary }}
						>
							{titles.first}
						</h3>
						<div className="space-y-3 leading-relaxed text-gray-800">
							{Object.entries(parsedContent[coreKey] || {}).map(
								([key, value], index) => (
									<div key={index}>
										<h4
											className="mb-1 font-semibold"
											style={{ color: colors.primary }}
										>
											【
											{key
												.replace(
													/([a-z])([A-Z])/g,
													"$1$2"
												)
												.replace(/[_]/g, "")}
											】
										</h4>
										<p>{value}</p>
									</div>
								)
							)}
						</div>
					</div>

					{/* Traits Section */}
					<div style={containerStyle}>
						<h3
							className="mb-3 text-lg font-bold"
							style={{ color: colors.secondary }}
						>
							【{titles.second}】
						</h3>
						<div className="leading-relaxed text-gray-800">
							{parsedContent[traitsKey]?.总体特征 && (
								<div className="p-3 mb-3 bg-white rounded-lg">
									<p className="mb-2 text-sm italic text-gray-600">
										總體特徵：
										{parsedContent[traitsKey].总体特征}
									</p>
								</div>
							)}
							<div className="space-y-2">
								{parsedContent[traitsKey]?.特质列表?.map(
									(trait, index) => (
										<div
											key={index}
											className="flex items-start"
										>
											<span
												className="mr-2 font-semibold"
												style={{
													color: colors.primary,
												}}
											>
												•
											</span>
											<span>
												<strong>{trait.标题}</strong>：
												{trait.说明}
											</span>
										</div>
									)
								)}
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			// Use structured fallback for right tab
			return renderStructuredFallbackRight(
				concernArea,
				colors,
				containerStyle
			);
		}
	}

	// Return fallback content for other tabs/concerns
	return getFallbackContent(concernArea, tab);
}

// Structured fallback for middle tab
function renderStructuredFallbackMiddle(concernArea, colors, containerStyle) {
	if (concernArea === "財運") {
		return (
			<div className="space-y-4">
				{/* 財星核心 Section */}
				<div style={containerStyle}>
					<h3
						className="mb-3 text-lg font-bold"
						style={{ color: colors.secondary }}
					>
						【財星核心】
					</h3>
					<div className="leading-relaxed text-gray-800">
						<p className="mb-2">
							正財辛金，透於月干，為核心財源（薪資、正業收入）。然辛金：
						</p>
						<ul className="ml-2 space-y-1 list-disc list-inside">
							<li>
								弱：僅得未土（月支）微根，且未為燥土生金乏力
							</li>
							<li>
								受克：被年干己土（傷官）泄氣，被日主丙火（劫財特性）猛烈克制（丙辛合克）
							</li>
							<li>無生：全局缺強金（比助）、水（官殺護財）</li>
						</ul>
						<p
							className="mt-3 font-semibold"
							style={{ color: colors.secondary }}
						>
							【結論】正財根基不穩，易被爭奪、克損、遲滯。偏財不顯。
						</p>
					</div>
				</div>

				{/* 生財之源 Section */}
				<div style={containerStyle}>
					<h3
						className="mb-3 text-lg font-bold"
						style={{ color: colors.secondary }}
					>
						【生財之源】
					</h3>
					<div className="leading-relaxed text-gray-800">
						<p className="mb-3">
							己土（年干傷官）、未土（月支藏己丁乙，主氣己土傷官）、寅中戊土（食神）。食傷旺代表有才華、點子、技術、服務能力，是生財的資本。
						</p>

						<div className="p-3 mb-2 bg-white rounded-lg">
							<h4
								className="mb-2 font-semibold"
								style={{ color: colors.primary }}
							>
								火旺土燥
							</h4>
							<p className="text-sm text-gray-700">
								火勢過旺導致土質焦燥，失去滋潤生金的能力，象徵才華雖多但難以轉化為實際財富。
							</p>
						</div>

						<div className="p-3 bg-white rounded-lg">
							<h4
								className="mb-2 font-semibold"
								style={{ color: colors.primary }}
							>
								焦土難生金（財）
							</h4>
							<p className="text-sm text-gray-700">
								燥土雖有生金之意，但因缺乏水潤而無法有效生財，需要調候平衡方能發揮生財功能。
							</p>
						</div>
					</div>
				</div>

				{/* 十神互動關鍵 Section */}
				<div style={containerStyle}>
					<h3
						className="mb-3 text-lg font-bold"
						style={{ color: colors.secondary }}
					>
						【十神互動關鍵】
					</h3>
					<div className="space-y-2 leading-relaxed text-gray-800">
						<div className="flex items-start">
							<span
								className="mr-2 font-semibold"
								style={{ color: colors.accent }}
							>
								•
							</span>
							<span>
								<strong>印星（乙木）</strong>
								：生身間接加劇克財，雖主貴人助力，但方式間接
							</span>
						</div>
						<div className="flex items-start">
							<span
								className="mr-2 font-semibold"
								style={{ color: colors.primary }}
							>
								•
							</span>
							<span>
								<strong>傷官（己土）</strong>
								：才華創新，是生財關鍵，但易惹是非
							</span>
						</div>
						<div className="flex items-start">
							<span
								className="mr-2 font-semibold"
								style={{ color: colors.secondary }}
							>
								•
							</span>
							<span>
								<strong>比劫（丙火）</strong>
								：奪財最凶之神！體現為競爭對手、合夥爭利
							</span>
						</div>
						<p
							className="p-2 mt-3 font-semibold bg-white rounded-lg"
							style={{ color: colors.secondary }}
						>
							【財運格局核心】食傷生財但財弱受克，比劫虎視眈眈
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Add other concerns fallback structure here
	return getFallbackContent(concernArea, "middle");
}

// Structured fallback for right tab
function renderStructuredFallbackRight(concernArea, colors, containerStyle) {
	if (concernArea === "財運") {
		return (
			<div className="space-y-4">
				{/* 核心論述 Section */}
				<div style={containerStyle}>
					<h3
						className="mb-3 text-lg font-bold"
						style={{ color: colors.secondary }}
					>
						核心論述
					</h3>
					<div className="space-y-3 leading-relaxed text-gray-800">
						<div>
							<h4
								className="mb-1 font-semibold"
								style={{ color: colors.primary }}
							>
								【財星本體】
							</h4>
							<p>金（辛金正財 - 核心，庚金偏財 - 弱或不顯）</p>
						</div>
						<div>
							<h4
								className="mb-1 font-semibold"
								style={{ color: colors.primary }}
							>
								【財星狀態】
							</h4>
							<p>
								辛金正財 -
								虛透、弱、受克（丙火克、己土泄）。如同脆弱的金屬暴露在熔爐（火局）旁，隨時有被熔毀風險。
							</p>
						</div>
						<div>
							<h4
								className="mb-1 font-semibold"
								style={{ color: colors.primary }}
							>
								【財源】
							</h4>
							<p>
								食傷土旺（己、未、戊） -
								代表技能、創意、服務、付出。但受制於火旺土燥不生金和火旺直接熔金雙重打壓。
							</p>
						</div>
						<div>
							<h4
								className="mb-1 font-semibold"
								style={{ color: colors.primary }}
							>
								【破財之源】
							</h4>
							<p>
								比劫火旺（丙火日主、流年巳火） - 直接劫奪財星金
							</p>
						</div>
						<div>
							<h4
								className="mb-1 font-semibold"
								style={{ color: colors.primary }}
							>
								【調候關鍵】
							</h4>
							<p>
								水（官殺/調候） -
								制火護金，潤土生金，通關水火，護財穩局
							</p>
							<p>強金（庚申酉） - 助辛抗火</p>
						</div>
					</div>
				</div>

				{/* 財運特質 Section */}
				<div style={containerStyle}>
					<h3
						className="mb-3 text-lg font-bold"
						style={{ color: colors.secondary }}
					>
						【財運特質】
					</h3>
					<div className="leading-relaxed text-gray-800">
						<div className="p-3 mb-3 bg-white rounded-lg">
							<p className="mb-2 text-sm italic text-gray-600">
								總體特徵：以正財為主的穩健型財運，但面臨競爭激烈與資金周轉挑戰，需要謹慎理財與適當調候。
							</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-start">
								<span
									className="mr-2 font-semibold"
									style={{ color: colors.primary }}
								>
									•
								</span>
								<span>
									<strong>正財為主，偏財難求</strong>
									：宜專注本職、專業技能獲取正財
								</span>
							</div>
							<div className="flex items-start">
								<span
									className="mr-2 font-semibold"
									style={{ color: colors.primary }}
								>
									•
								</span>
								<span>
									<strong>勞碌求財，周轉不靈</strong>
									：付出多但回報易被克奪遲滯
								</span>
							</div>
							<div className="flex items-start">
								<span
									className="mr-2 font-semibold"
									style={{ color: colors.primary }}
								>
									•
								</span>
								<span>
									<strong>不動產雙刃劍</strong>
									：土重可視為潛在資產，但流動性差
								</span>
							</div>
							<div className="flex items-start">
								<span
									className="mr-2 font-semibold"
									style={{ color: colors.primary }}
								>
									•
								</span>
								<span>
									<strong>合作風險高</strong>
									：比劫奪財特性，合夥借貸易引發財務糾紛
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Add other concerns fallback structure here
	return getFallbackContent(concernArea, "right");
}

// Fallback static content (your existing content)
function getFallbackContent(concernArea, tab) {
	if (tab === "日主特性") {
		if (concernArea === "財運") {
			return `丙火坐寅得長生，時柱乙未雙印生身，形成「身強印旺」之格局，火旺土燥之勢明顯。

優勢在於決策迅捷，火性炎上，敏銳善捕捉新興財機，己土傷官助力顯著。

然而，劣勢亦不容忽視，土重導致資金周轉率低，財運受滯；火克金失衡，易引發衝動投資之患。

調候之急務在於「金水相生」，以平衡格局，抑制木火過旺之擴張欲，方能穩固根基，化劣為優。`;
		} else if (concernArea === "事業") {
			return `甲木生於春月得時，坐支寅木得地，藏甲丙戊三神，賦予創新思維、執行力強兩大優勢；然木過旺易沖動、缺乏耐性兩項劣勢。

全局金弱制木不力，調候需金來修剪，長期策略宜發展需要創意與變通的行業，避免過於保守的傳統領域。`;
		} else if (concernArea === "健康") {
			return `乙木生於秋令，坐支酉金克身，形成「木金相戰」格局，賦予意志堅韌、適應力強兩項優勢；然易緊張焦慮、消化系統敏感兩項劣勢。

全局土重濕重，調候急需火來暖局燥土，長期策略重在情志調養與規律作息。`;
		} else if (concernArea === "感情") {
			return `丁火生於冬月，坐支子水沖剋，形成「水火既濟」格局，賦予感情豐富、直觀敏銳兩項優勢；然易情緒波動、過度敏感兩項劣勢。

全局水旺火弱，調候需木來通關生火，長期策略在於培養穩定情緒與理性溝通能力。`;
		}
	}

	if (tab === "middle") {
		if (concernArea === "財運") {
			return `【財星核心】
正財辛金，透於月干，為核心財源（薪資、正業收入）。然辛金：
• 弱：僅得未土（月支）微根，且未為燥土生金乏力
• 受克：被年干己土（傷官）泄氣，被日主丙火（劫財特性）猛烈克制（丙辛合克）
• 無生：全局缺強金（比助）、水（官殺護財）

【結論】正財根基不穩，易被爭奪、克損、遲滯。偏財不顯。

【生財之源】
己土（年干傷官）、未土（月支藏己丁乙，主氣己土傷官）、寅中戊土（食神）。食傷旺代表有才華、點子、技術、服務能力，是生財的資本。

關鍵問題：火旺土燥，焦土難生金（財）

【十神互動關鍵】
• 印星（乙木）：生身間接加劇克財，雖主貴人助力，但方式間接
• 傷官（己土）：才華創新，是生財關鍵，但易惹是非
• 比劫（丙火）：奪財最凶之神！體現為競爭對手、合夥爭利

【財運格局核心】食傷生財但財弱受克，比劫虎視眈眈`;
		} else if (concernArea === "事業") {
			return `【事業根基】
日支寅木為事業根基，藏甲丙戊三神，象徵創新活力與執行能力並重的根基特質。

【十神解析】
• 比肩+日支：主創業精神，利新興科技行業
• 食神+時支：主技術才華，風險在於好高騖遠  
• 偏印+年支：主變通能力，矛盾點在於缺乏持續性

【結論】全局呈現「木旺金弱缺制衡」複雜格局，創意有餘而執行力待加強。`;
		} else if (concernArea === "健康") {
			return `【健康根基】
日支酉金為健康根基，藏辛金主氣，象徵呼吸系統與免疫調節的根基特質。

【十神解析】
• 七殺+日支：主免疫力，利強化體質方向
• 偏財+月支：主代謝功能，風險警示在於過度消耗
• 傷官+時支：主神經系統，矛盾點在於易緊張焦慮

【結論】全局呈現「金木相戰需調和」複雜格局，重在平衡陰陽氣血。`;
		} else if (concernArea === "感情") {
			return `【感情根基】
日支子水為感情根基，藏癸水主氣，象徵情感深度與直覺敏銳的根基特質。

【十神解析】  
• 正官+日支：主責任感，利穩定關係方向
• 偏印+月支：主直覺力，風險警示在於過度猜疑
• 食神+時支：主表達能力，矛盾點在於情緒化表達

【結論】全局呈現「水火需既濟調和」複雜格局，感情豐富但需理性引導。`;
		}
	}

	if (tab === "right") {
		if (concernArea === "財運") {
			return `【財星本體】
金（辛金正財 - 核心，庚金偏財 - 弱或不顯）

【財星狀態】  
辛金正財 - 虛透、弱、受克（丙火克、己土泄）。如同脆弱的金屬暴露在熔爐（火局）旁，隨時有被熔毀風險。

【財源】
食傷土旺（己、未、戊） - 代表技能、創意、服務、付出。但受制於火旺土燥不生金和火旺直接熔金雙重打壓。

【破財之源】
比劫火旺（丙火日主、流年巳火） - 直接劫奪財星金

【調候關鍵】
水（官殺/調候） - 制火護金，潤土生金，通關水火，護財穩局
強金（庚申酉） - 助辛抗火

【財運特質】
• 正財為主，偏財難求：宜專注本職、專業技能獲取正財
• 勞碌求財，周轉不靈：付出多但回報易被克奪遲滯  
• 不動產雙刃劍：土重可視為潛在資產，但流動性差
• 合作風險高：比劫奪財特性，合夥借貸易引發財務糾紛`;
		} else if (concernArea === "事業") {
			return `【財星本質】
正偏財屬性以金為主，食傷土為生財之源

【生財機制與問題】
木旺金弱導致「大樹難成材需修剪」核心矛盾

【策略】適合創意設計行業，亟需金來平衡破解「創意有餘執行不足」三維困局`;
		} else if (concernArea === "健康") {
			return `【調候需求】
水火既濟，金木相和

【病源關鍵】
金木相戰易致呼吸與神經系統失調，土重濕滯影響脾胃運化

【健康策略】
春養肝、夏養心、長夏養脾、秋養肺、冬養腎，順應五行生剋調養身心`;
		} else if (concernArea === "感情") {
			return `【感情本體】
水火既濟格局，官殺水為配偶星

【感情狀態】
水火相沖如冰火兩重天，感情豐富但易波動，配偶星受日主火克制風險需注意

【感情來源】  
正官水代表穩定關係但受制於火旺克水

【破感之源】
比劫火旺易與人爭奪感情，傷官土重易口舌傷情

【調候關鍵】
木（通關） - 化水生火，調和矛盾
土（食傷） - 表達情感，但需適度

【感情特質】
• 感情豐富深邃：水主情感，層次豐富但易多變
• 表達直接熱烈：火主表達，真誠熱情但易衝動  
• 需要情感滋養：水火平衡時最佳，一方偏強易失衡`;
		}
	}

	return "分析內容生成中...";
}

export function MingJu({ userInfo, currentYear }) {
	const [selectedTab, setSelectedTab] = useState("日主特性");
	const [tabContent, setTabContent] = useState("");
	const [aiContent, setAiContent] = useState("");
	const [loading, setLoading] = useState(false);
	const concern = userInfo.concern || "財運";

	useEffect(() => {
		async function getContent() {
			setLoading(true);
			try {
				const result = await generateMingJuAnalysis(
					{ ...userInfo, currentYear },
					selectedTab
				);
				setTabContent(result.content);
				// Always set aiContent to the generated content, whether AI or personalized
				setAiContent(result.content);
			} catch (error) {
				console.error("Error generating content:", error);
				setTabContent("內容載入失敗，請稍後再試。");
				setAiContent("");
			} finally {
				setLoading(false);
			}
		}
		getContent();
	}, [selectedTab, userInfo, currentYear]);

	return (
		<div className="max-w-4xl p-8 mx-auto bg-white shadow-lg rounded-xl">
			{/* Header Title */}
			<div className="mb-8 text-center">
				<h2 className="text-2xl font-bold text-[#B4003C] mb-2">
					{getTabLabel(selectedTab, concern)}
				</h2>
			</div>

			{/* Tabs */}
			<div className="flex items-center justify-between px-4 mb-8">
				{TABS.map((tab) => {
					const isSelected = selectedTab === tab;
					const label = getTabLabel(tab, concern);
					const imgSrc = getTabImg(tab, concern);
					const bgColor = getTabBg(tab, concern, isSelected);
					const imgColor = getTabImgColor(tab, concern, isSelected);

					return (
						<div key={tab} className="flex flex-col items-center">
							<button
								className="flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
								style={{
									width: 90,
									height: 90,
									borderRadius: "50%",
									backgroundColor: bgColor,
									boxShadow: isSelected
										? "0 4px 16px rgba(0,0,0,0.1)"
										: "0 2px 8px rgba(0,0,0,0.05)",
								}}
								onClick={() => setSelectedTab(tab)}
							>
								<Image
									src={imgSrc}
									alt={label}
									width={32}
									height={32}
									style={{
										filter: isSelected
											? "brightness(0) invert(1)"
											: `brightness(0) saturate(100%) invert(29%) sepia(67%) saturate(5988%) hue-rotate(345deg) brightness(92%) contrast(102%)`,
									}}
								/>
							</button>
							<span
								className="mt-3 text-sm font-semibold leading-tight text-center"
								style={{
									color: isSelected ? bgColor : "#666",
									maxWidth: 80,
								}}
							>
								{label}
							</span>
						</div>
					);
				})}
			</div>

			{/* Content Area */}
			<div className="mt-6">
				<div className="bg-[#EFEFEF] rounded-xl p-6 min-h-[300px]">
					{loading ? (
						<div className="flex items-center justify-center h-40">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B4003C]"></div>
							<span className="ml-3 text-gray-600">
								AI 分析中...
							</span>
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
								renderStructuredContent(
									concern,
									selectedTab,
									aiContent
								)
							) : (
								<div className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
									{tabContent}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
