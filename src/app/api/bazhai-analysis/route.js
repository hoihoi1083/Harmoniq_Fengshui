import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// 命卦映射
const mingGuaMapping = {
	1: {
		trigram: "坎",
		group: "東四命",
		element: "水",
		direction: "north",
		name: "坎卦",
	},
	2: {
		trigram: "坤",
		group: "西四命",
		element: "土",
		direction: "southWest",
		name: "坤卦",
	},
	3: {
		trigram: "震",
		group: "東四命",
		element: "木",
		direction: "east",
		name: "震卦",
	},
	4: {
		trigram: "巽",
		group: "東四命",
		element: "木",
		direction: "southEast",
		name: "巽卦",
	},
	6: {
		trigram: "乾",
		group: "西四命",
		element: "金",
		direction: "northWest",
		name: "乾卦",
	},
	7: {
		trigram: "兌",
		group: "西四命",
		element: "金",
		direction: "west",
		name: "兌卦",
	},
	8: {
		trigram: "艮",
		group: "西四命",
		element: "土",
		direction: "northEast",
		name: "艮卦",
	},
	9: {
		trigram: "離",
		group: "東四命",
		element: "火",
		direction: "south",
		name: "離卦",
	},
};

// 2025年九宮飛星 (蛇年)
const flyingStars2025 = {
	east: {
		trigram: "震宮",
		element: "木",
		star2025: "九紫右弼星",
		description: "吉",
		angle: 90,
		wuxing: "火",
		energy: "陽",
	},
	southEast: {
		trigram: "巽宮",
		element: "木",
		star2025: "一白貪狼星",
		description: "吉",
		angle: 135,
		wuxing: "水",
		energy: "陽",
	},
	south: {
		trigram: "離宮",
		element: "火",
		star2025: "二黑巨門星",
		description: "凶",
		angle: 180,
		wuxing: "土",
		energy: "陰",
	},
	southWest: {
		trigram: "坤宮",
		element: "土",
		star2025: "八白左輔星",
		description: "吉",
		angle: 225,
		wuxing: "土",
		energy: "陰",
	},
	west: {
		trigram: "兌宮",
		element: "金",
		star2025: "三碧祿存星",
		description: "凶",
		angle: 270,
		wuxing: "金",
		energy: "陰",
	},
	northWest: {
		trigram: "乾宮",
		element: "金",
		star2025: "六白武曲星",
		description: "吉",
		angle: 315,
		wuxing: "金",
		energy: "陽",
	},
	north: {
		trigram: "坎宮",
		element: "水",
		star2025: "七赤破軍星",
		description: "中性",
		angle: 0,
		wuxing: "水",
		energy: "陽",
	},
	northEast: {
		trigram: "艮卦",
		element: "土",
		star2025: "五黃廉貞星",
		description: "凶",
		angle: 45,
		wuxing: "土",
		energy: "陽",
	},
};

// 八宅吉凶方位對應
const bazhaiFortune = {
	東四命: {
		大吉: ["east", "south", "north", "southEast"],
		大凶: ["west", "northWest", "southWest", "northEast"],
	},
	西四命: {
		大吉: ["west", "northWest", "southWest", "northEast"],
		大凶: ["east", "south", "north", "southEast"],
	},
};

// 計算個人命卦
function calculateMingGua(birthYear, userGender) {
	const year = parseInt(birthYear);
	if (isNaN(year) || year < 1900 || year > 2100) {
		throw new Error("Invalid birth year");
	}

	// Handle different gender formats
	let isMale = false;
	if (userGender === "male" || userGender === "男") {
		isMale = true;
	} else if (userGender === "female" || userGender === "女") {
		isMale = false;
	} else {
		throw new Error(`Unknown gender format: ${userGender}`);
	}

	// 根據出生年份計算命卦號碼 - 使用正確的八宅風水公式
	let remainder, mingGuaNumber;

	if (isMale) {
		// 男性公式: (100 - (年份後兩位)) % 9，如果為0則為9
		remainder = (100 - (year % 100)) % 9;
		mingGuaNumber = remainder === 0 ? 9 : remainder;
	} else {
		// 女性公式: ((年份後兩位) - 4) % 9，如果為0則為9
		remainder = ((year % 100) - 4) % 9;
		mingGuaNumber = remainder === 0 ? 9 : remainder;
	}

	// 處理特殊情況 (5卦轉換)
	if (mingGuaNumber === 5) {
		mingGuaNumber = isMale ? 2 : 8;
	}

	const mingGuaInfo = mingGuaMapping[mingGuaNumber];

	return {
		mingGuaNumber,
		...mingGuaInfo,
	};
}

// 判斷八宅吉凶
function getBazhaiResult(mingGuaGroup, roomDirection) {
	const auspicious = bazhaiFortune[mingGuaGroup]?.大吉 || [];
	const inauspicious = bazhaiFortune[mingGuaGroup]?.大凶 || [];

	if (auspicious.includes(roomDirection)) {
		return "大吉";
	} else if (inauspicious.includes(roomDirection)) {
		return "大凶";
	}
	return "中性";
}

// DeepSeek AI 调用函数
async function callDeepSeekAPI(prompt) {
	try {
		const response = await fetch(DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content:
							"你是一位專業的風水師，精通八宅風水和玄空飛星學說。請根據用戶提供的信息，生成專業、實用的風水分析建議。回答必須使用繁體中文，並嚴格按照要求的格式輸出。",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.3,
				max_tokens: 4000,
			}),
		});

		if (!response.ok) {
			throw new Error(`DeepSeek API error: ${response.status}`);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (!content) {
			throw new Error("No content from DeepSeek API");
		}

		return content;
	} catch (error) {
		throw error;
	}
}

// 強化的房間風水分析提示，完全依賴AI生成
function generateBazhaiPrompt(roomData, userProfile, mingGuaInfo) {
	const roomDirection = roomData.direction;
	const roomType = roomData.roomType; // Room type is already mapped in the calling function
	const fengShuiData = roomData.fengShuiData;
	const bazhaiStatus = roomData.bazhaiFortune;

	// 根據方位獲取2025年飛星和八宅吉凶
	const directionMapping = {
		east: {
			flyingStar: "九紫右弼星",
			element: "火",
			starType: "吉",
			bazhaiName: "五鬼",
		},
		southEast: {
			flyingStar: "一白貪狼星",
			element: "水",
			starType: "吉",
			bazhaiName: "禍害",
		},
		south: {
			flyingStar: "二黑巨門星",
			element: "土",
			starType: "凶",
			bazhaiName: "六煞",
		},
		southWest: {
			flyingStar: "八白左輔星",
			element: "土",
			starType: "吉",
			bazhaiName: "伏位",
		},
		west: {
			flyingStar: "七赤破軍星",
			element: "金",
			starType: "凶",
			bazhaiName: "延年",
		},
		northWest: {
			flyingStar: "三碧祿存星",
			element: "木",
			starType: "凶",
			bazhaiName: "天醫",
		},
		north: {
			flyingStar: "四綠文曲星",
			element: "木",
			starType: "吉",
			bazhaiName: "絕命",
		},
		northEast: {
			flyingStar: "五黃廉貞星",
			element: "土",
			starType: "凶",
			bazhaiName: "生氣",
		},
		center: {
			flyingStar: "六白武曲星",
			element: "金",
			starType: "吉",
			bazhaiName: "中宮",
		},
	};

	const directionInfo = directionMapping[roomDirection];
	const isLuckyStar = directionInfo.starType === "吉";

	// 根據房間類型定義合適的家具和使用方式
	const roomSpecificInfo = {
		臥室: {
			mainFurniture: ["床", "衣櫃", "梳妝台", "床頭櫃", "衣帽架"],
			activities: ["睡眠", "休息", "更衣"],
			placement: "床頭擺放",
			colors: "床品顏色",
			taboos: "睡眠禁忌",
			forbidden: [
				"沙發",
				"茶几",
				"餐桌",
				"爐灶",
				"馬桶",
				"洗手盆",
				"電視櫃",
			],
			specificNote:
				"這是臥室，絕對不可提及客廳家具如沙發、茶几、電視櫃等",
		},
		客廳: {
			mainFurniture: ["沙發", "茶几", "電視櫃", "書櫃", "展示櫃"],
			activities: ["聚會", "休閒", "接待客人"],
			placement: "沙發擺放",
			colors: "裝潢色調",
			taboos: "聚會禁忌",
			forbidden: ["床", "馬桶", "洗手盆", "爐灶", "浴缸", "衣櫃"],
			specificNote: "這是客廳，應專注於會客、娛樂相關的家具配置",
		},
		廚房: {
			mainFurniture: ["爐灶", "冰箱", "水槽", "櫥櫃", "餐具櫃", "工作台"],
			activities: ["烹飪", "食物處理", "儲存食物"],
			placement: "爐灶位置",
			colors: "廚具色彩",
			taboos: "烹飪禁忌",
			forbidden: [
				"床",
				"沙發",
				"茶几",
				"馬桶",
				"洗手盆",
				"電視櫃",
				"書櫃",
			],
			specificNote:
				"這是廚房，絕對不可提及客廳家具如沙發、茶几、電視櫃、書櫃等",
		},
		浴室: {
			mainFurniture: [
				"馬桶",
				"洗手盆",
				"浴缸",
				"鏡子",
				"收納櫃",
				"毛巾架",
			],
			activities: ["洗浴", "如廁", "梳洗"],
			placement: "衛浴設備",
			colors: "瓷磚顏色",
			taboos: "洗浴禁忌",
			forbidden: [
				"床",
				"沙發",
				"茶几",
				"爐灶",
				"餐桌",
				"衣櫃",
				"電視櫃",
				"書櫃",
			],
			specificNote: "這是浴室，只能提及衛浴相關設備",
		},
		書房: {
			mainFurniture: ["書桌", "椅子", "書櫃", "檯燈", "文件櫃"],
			activities: ["學習", "工作", "閱讀"],
			placement: "書桌朝向",
			colors: "書房色調",
			taboos: "學習禁忌",
			forbidden: ["床", "沙發", "茶几", "馬桶", "洗手盆", "爐灶", "餐桌"],
			specificNote: "這是書房，應專注於學習工作相關的家具配置",
		},
		餐廳: {
			mainFurniture: ["餐桌", "餐椅", "餐櫃", "酒櫃", "侍餐台"],
			activities: ["用餐", "聚餐", "家庭聚會"],
			placement: "餐桌擺放",
			colors: "餐廳色調",
			taboos: "用餐禁忌",
			forbidden: ["床", "馬桶", "洗手盆", "浴缸", "沙發", "茶几"],
			specificNote: "這是餐廳，應專注於用餐相關的家具配置",
		},
		陽台: {
			mainFurniture: ["植物盆栽", "花架", "遮陽傘", "休閒椅", "收納櫃"],
			activities: ["休閒", "觀景", "晾曬", "園藝"],
			placement: "植物擺放",
			colors: "陽台色調",
			taboos: "陽台禁忌",
			forbidden: [
				"床",
				"沙發",
				"茶几",
				"電視櫃",
				"書櫃",
				"馬桶",
				"洗手盆",
				"爐灶",
				"餐桌",
			],
			specificNote:
				"這是陽台，主要以植物盆栽和簡單休閒設施為主，不可提及室內家具如沙發、茶几、電視櫃等",
		},
	};

	const roomInfo = roomSpecificInfo[roomType] || roomSpecificInfo["客廳"];
	const furniture = roomInfo.mainFurniture.join("、");
	const forbiddenItems = roomInfo.forbidden.join("、");

	// 根據命卦和八宅位置生成個人化行為建議
	const mingGuaElement = mingGuaInfo.element;
	const mingGuaGroup = mingGuaInfo.group;
	const bazhaiPosition = directionInfo.bazhaiName;
	const isLucky = directionInfo.starType === "吉";

	// 🚨 CRITICAL VERIFICATION
	if (
		userProfile.birthYear == 1996 &&
		userProfile.gender === "male" &&
		mingGuaInfo.name !== "巽卦"
	) {
		// Critical error logging could be added here for debugging
	}

	return `
你是一位專業風水師，請根據以下信息生成專業的${roomType}風水分析報告。

【嚴重警告】：${roomInfo.specificNote}

【命卦確認】：
⚠️ 命主命卦為：${mingGuaInfo.name}（${mingGuaElement}元素，${mingGuaGroup}）
⚠️ 必須在所有個人化建議中使用此命卦，絕不可使用其他命卦！
⚠️ 禁止使用坤卦、艮卦等其他命卦，只能使用：${mingGuaInfo.name}

【房間限制】：
• 房間類型：${roomType}
• 只能提及這些家具：${furniture}
• 絕對禁止提及：${forbiddenItems}
• 如果提及禁用家具，分析將被拒絕

基礎信息：
• 房間編號：${roomData.roomId || `${roomType}-${roomDirection}`} （確保每個房間分析的獨特性）
• 房間方位：${roomDirection}
• 命主信息：${userProfile.birthYear}年出生${userProfile.gender === "male" ? "男" : "女"}性
• 命卦：${mingGuaInfo.name}（${mingGuaGroup}，${mingGuaElement}）
• 八宅位置：${bazhaiPosition}（${bazhaiStatus === "大吉" ? "吉位" : "凶位"}）
• 2025年飛星：${directionInfo.flyingStar}（${directionInfo.element}，${directionInfo.starType}星）
• 主要活動：${roomInfo.activities.join("、")}

【絕對要求】：
1. 每個建議必須檢查是否適合${roomType}
2. 只能提及${roomType}相關的${furniture}
3. 絕不可提及${forbiddenItems}
4. 所有建議必須符合${roomType}的實際功能
5. 在生成前必須再次確認房間類型為${roomType}
6. 針對房間編號${roomData.roomId || ""}，提供該特定房間的獨特分析（即使同類型房間也需不同建議）

請按以下嚴格的JSON格式輸出：

{
  "yearSummary": "${roomType}位於${roomDirection}方，2025年飛星${directionInfo.flyingStar}屬${directionInfo.element}（${directionInfo.starType}星），八宅位置為${bazhaiPosition}。對${mingGuaGroup}的${mingGuaInfo.name}卦命主在${roomType}中進行${roomInfo.activities.join("、")}活動的具體影響分析，包含星宿能量、方位特性、對命主的個人化影響，約120-150字",
  
  "recommendations": {
    "furniture": [
      "針對${furniture.split("、")[0]}的${roomType}專屬擺放建議，考慮${roomDirection}方位風水",
      "針對${furniture.split("、")[1] || furniture.split("、")[0]}的${roomType}配置建議，結合${bazhaiPosition}位置特性", 
      "針對${furniture.split("、")[2] || furniture.split("、")[0]}的${roomType}朝向建議，配合${directionInfo.element}元素",
      "其他${furniture}在${roomType}中的專業風水擺放要點"
    ],
    "colors": [
      "適合${roomType}的主色調建議，基於${directionInfo.element}元素五行相生",
      "適合${roomType}的輔助色彩，考慮${mingGuaElement}命卦元素平衡", 
      "${roomType}中應避免的顏色及風水原因，特別是與${directionInfo.flyingStar}相克色彩",
      "${roomType}的季節性色彩調整，配合2025年流年特點"
    ],
    "habits": [
      "針對${mingGuaInfo.name}卦命主在${roomType}中${roomInfo.activities.join("、")}的個人化行為建議",
      "結合${roomType}功能的具體生活指導，配合${bazhaiPosition}位置影響",
      "考慮${directionInfo.flyingStar}能量的${roomType}使用習慣建議", 
      "配合${mingGuaGroup}特質的${roomType}日常作息建議"
    ],
    "items": [
      "適合${roomType}的風水物品，針對${isLucky ? "吉星" : "凶星"}位置的專業建議",
      "配合${directionInfo.flyingStar}的${roomType}調理擺設",
      "增強${mingGuaElement}元素的${roomType}專用物品推薦",
      "針對${roomType}特定功能的實用風水用品"
    ]
  },
  
  "comprehensiveAdvice": {
    "overall": "${roomType}整體格局分析：詳述此${roomType}在整個住宅中的風水角色，${directionInfo.flyingStar}對${roomType}空間氣場的影響，以及與其他房間的風水互動。分析${bazhaiPosition}位置對${roomType}功能的影響，提供針對性優化建議。120-150字",
    
    "timing": "${roomType}最佳使用時間：根據${directionInfo.flyingStar}時辰特性，詳細說明${roomType}進行${roomInfo.activities.join("、")}的最佳時段。結合${mingGuaInfo.name}卦命主個人節律，推薦${roomType}的日常使用安排。包含適合和需要避免的具體時間。120-150字",
    
    "seasonal": "${roomType}季節性注意：分析${directionInfo.element}元素四季變化，詳述${roomType}在春夏秋冬各季節的風水要點。包含${roomType}的季節性調整、針對${directionInfo.flyingStar}的季節化解或強化措施。120-150字",
    
    "personal": "${roomType}個人化建議：⚠️必須使用命卦${mingGuaInfo.name}（${mingGuaElement}元素），絕不可使用其他命卦！深度結合${mingGuaInfo.name}卦（${mingGuaElement}元素）特質，提供專屬於命主的${roomType}風水建議。分析個人五行與${directionInfo.element}在${roomType}中的相互作用，推薦個性化的空間布局和專屬風水用品。120-150字",
    
    "maintenance": "${roomType}維護建議：提供${roomType}的長期風水維護指南，包含定期清潔、能量更新、擺設調整的具體方法。詳述如何保持${directionInfo.flyingStar}在${roomType}中的正面能量，避免負面影響。提供${roomType}的日常和年度維護步驟。120-150字"
  }
}

【最終檢查清單】：
✓ 確認房間類型：${roomType}
✓ 只提及允許家具：${furniture}  
✓ 絕不提及禁用家具：${forbiddenItems}
✓ 所有建議符合${roomType}實際功能
✓ JSON格式完全正確
✓ 使用繁體中文和專業風水術語
`;
}

// 整體住宅八宅風水分析提示 - 也完全依賴AI生成
function generateOverallBazhaiPrompt(roomAnalyses, userProfile, mingGuaInfo) {
	const auspiciousRooms = roomAnalyses.filter(
		(r) => r.bazhaiFortune === "大吉"
	);
	const inauspiciousRooms = roomAnalyses.filter(
		(r) => r.bazhaiFortune === "大凶"
	);

	// 獲取所有房間方位
	const allDirections = roomAnalyses.map((r) => r.direction).join("、");
	const roomTypes = roomAnalyses.map((r) => r.roomType).join("、");

	// 計算命卦基本信息
	const mingGuaElement = mingGuaInfo.element;
	const birthYear = userProfile.birthYear;
	const gender = userProfile.gender === "male" ? "男" : "女";
	const age = 2025 - parseInt(birthYear);

	return `
你是一位資深風水師，請根據以下整體住宅信息生成專業的八宅綜合分析報告。

基礎住宅信息：
• 命主：${birthYear}年出生${gender}性（${age}歲）
• 命卦：${mingGuaInfo.name}（${mingGuaInfo.group}，${mingGuaInfo.element}）
• 涉及房間：${roomTypes}
• 覆蓋方位：${allDirections}
• 吉位房間：${auspiciousRooms.length}個
• 凶位房間：${inauspiciousRooms.length}個
• 分析年份：2026年（丙午馬年）

【要求】：請生成完整的綜合風水分析，包含：

請按以下JSON格式輸出：

{
  "overallAnalysis": "全屋風水綜合分析：基於${mingGuaInfo.name}卦命主的整體住宅風水評估，結合2025年飛星布局，詳述住宅的總體風水格局、能量流向、以及對居住者的綜合影響。分析吉凶房間的分佈平衡，提出整體優化策略。200-250字",
  
  "personalMingGuaAnalysis": "個人命卦深度分析：詳述${mingGuaInfo.name}卦（${mingGuaInfo.group}，${mingGuaInfo.element}）的五行特質、個性特點、運勢傾向。分析命主與當前住宅的匹配度，以及2025年的個人運勢趨勢。結合年齡（${age}歲）和性別（${gender}性）的生命階段特點，提供個性化的風水調整建議。200-250字",
  
  "annualForecast": "2025年運勢預測：基於命主${mingGuaInfo.name}卦與2025年玄空飛星的互動，詳細預測各方面運勢發展。包含事業、財運、健康、感情等方面的具體走向，指出需要特別注意的月份和方位，提供全年的風水調整時機建議。分析流年對住宅各房間的影響變化。200-250字",
  
  "recommendations": {
    "layout": "空間布局優化建議：基於八宅理論和飛星布局，提供具體的房間功能調整、家具重新配置、空間動線優化等建議",
    "colors": "整體色彩搭配方案：結合命主${mingGuaElement}元素和各房間的飛星特性，提供全屋色彩協調方案",
    "timing": "重要活動時機選擇：提供搬遷、裝修、重大決策等重要活動的最佳時機建議",
    "remedies": "化煞增運措施：針對凶位房間的具體化解方法，以及吉位房間的能量強化建議"
  },
  
  "monthlyGuidance": {
    "spring": "春季風水要點（2-4月）：詳述春季的風水調整重點，包含季節轉換時的注意事項",
    "summer": "夏季風水要點（5-7月）：夏季的風水維護和能量調節建議", 
    "autumn": "秋季風水要點（8-10月）：秋季的風水布局調整和運勢提升方法",
    "winter": "冬季風水要點（11月-1月）：冬季的風水保養和來年準備建議"
  }
}

【輸出要求】：
- 嚴格按照JSON格式輸出，確保可被程式正確解析
- 內容專業實用，避免空泛理論
- 使用繁體中文和傳統風水術語
- 每個建議都要具體可執行
- 結合現代生活實際情況
`;
}

// 生成年度風水建議的AI提示詞
function generateYearlyAdvicePrompt(userProfile, mingGuaInfo) {
	const currentYear = new Date().getFullYear();
	const age = currentYear - parseInt(userProfile.birthYear);
	const gender =
		userProfile.gender === "male"
			? "男"
			: userProfile.gender === "female"
				? "女"
				: userProfile.gender;

	console.log("Yearly Advice - User Profile:", userProfile);
	console.log("Yearly Advice - Detected Gender:", gender);

	return `你是一位資深的風水大師，請根據以下信息為用戶生成${currentYear}年度的個人化風水建議：

**重要提醒：用戶為${gender}性，所有分析和建議都必須基於${gender}性的特質和需求，請勿混淆性別！**

【用戶基本資料】：
- 出生年份：${userProfile.birthYear}年
- 性別：${gender}性 (重要！請確認這是${gender}性用戶)
- 年齡：${age}歲
- 命卦：${mingGuaInfo.name}（${mingGuaInfo.group}，五行屬${mingGuaInfo.element}）
- 生肖：${getChineseZodiac(userProfile.birthYear)}

【分析要求】：
請提供專業、實用的年度風水建議，內容要結合用戶的個人命卦特質和${currentYear}年的流年運勢。
**所有建議都必須適用於${gender}性用戶，包括但不限於：服裝顏色建議、飾品選擇、房間布局偏好等。**

請嚴格按照以下JSON格式輸出：

{
  "currentYear": "${currentYear}年度重點提醒：結合${gender}性用戶命卦${mingGuaInfo.name}和流年特點，分析本年度的整體運勢趨勢，重點提醒需要注意的方位和時機，提供具體的風水調整建議。內容要實用具體，避免空泛理論。120-150字",
  
  "nineStarCycle": "下元九運影響分析：詳述2024-2043年九運期間對${gender}性${mingGuaInfo.name}卦命主的影響，分析九紫火星當運對${mingGuaInfo.element}元素命主的具體影響，提供這個20年週期內的風水策略建議。120-150字",
  
  "personalizedAdvice": "個人化年度建議：基於${age}歲${gender}性${mingGuaInfo.name}卦命主的特質，結合生命階段和運勢週期，提供本年度的個人化風水實踐建議。包含適合${gender}性的居家布局、重要決策時機、季節性調整等具體可行的建議。120-150字"
}

【輸出要求】：
- 嚴格按照JSON格式輸出，確保可被程式正確解析
- 使用繁體中文和傳統風水術語
- 內容要專業準確，結合用戶的具體命卦特質
- 建議要實用可執行，避免抽象理論
- 每個建議控制在120-150字之間
- **請確保性別資訊正確：用戶為${gender}性，所有建議都要符合${gender}性的需求和特質**
- 如果是男性：重點關注事業運、財運、健康等方面的風水建議
- 如果是女性：可以關注人際關係、家庭和諧、美容健康等方面
`;
}

// 獲取生肖的輔助函數
function getChineseZodiac(birthYear) {
	const zodiacAnimals = [
		"鼠",
		"牛",
		"虎",
		"兔",
		"龍",
		"蛇",
		"馬",
		"羊",
		"猴",
		"雞",
		"狗",
		"豬",
	];
	return zodiacAnimals[(birthYear - 1900) % 12];
}

// 生成綜合建議的AI提示詞
function generateComprehensiveAdvicePrompt(
	roomAnalyses,
	userProfile,
	mingGuaInfo
) {
	const currentYear = new Date().getFullYear();
	const age = currentYear - parseInt(userProfile.birthYear);
	const gender =
		userProfile.gender === "male"
			? "男"
			: userProfile.gender === "female"
				? "女"
				: userProfile.gender;

	console.log("Comprehensive Advice - User Profile:", userProfile);
	console.log("Comprehensive Advice - Detected Gender:", gender);

	// 分析吉凶房間
	const auspiciousRooms = roomAnalyses.filter(
		(room) =>
			room.fengShuiAnalysis?.starType === "吉" ||
			room.bazhaiFortuneResult === "吉"
	);
	const inauspiciousRooms = roomAnalyses.filter(
		(room) =>
			room.fengShuiAnalysis?.starType === "凶" ||
			room.bazhaiFortuneResult === "凶"
	);

	const roomSummary = roomAnalyses.map((room) => ({
		type: room.roomType || room.type,
		direction: room.direction,
		fortune: room.bazhaiFortuneResult,
		element: room.fengShuiAnalysis?.element,
		star: room.fengShuiAnalysis?.flyingStar,
	}));

	return `你是一位資深的風水大師，請根據以下完整的房屋風水分析，為用戶生成專業的綜合建議：

【用戶基本資料】：
- 命卦：${mingGuaInfo.name}（${mingGuaInfo.group}，五行屬${mingGuaInfo.element}）
- 年齡：${age}歲，性別：${gender}性
- 生肖：${getChineseZodiac(userProfile.birthYear)}

【房屋風水分析】：
- 總房間數：${roomAnalyses.length}間
- 吉位房間數：${auspiciousRooms.length}間
- 凶位房間數：${inauspiciousRooms.length}間

【各房間詳情】：
${roomSummary
	.map(
		(room) =>
			`- ${room.type}：位於${room.direction}方，${room.fortune}位，${room.element}元素，${room.star}星`
	)
	.join("\n")}

【分析要求】：
請提供專業、全面的風水綜合建議，內容要實用具體，避免空泛理論。
**重要提醒：用戶為${gender}性，請確保所有建議都符合${gender}性的特質和需求。**

請嚴格按照以下格式輸出純文字內容（不要JSON格式）：

【${currentYear}年度風水總結】
根據您的${mingGuaInfo.name}卦命格特性與居住空間的完整分析... (分析整體格局優勢與挑戰，150-200字)

【整體居住策略】
建議您以個人命卦為核心，結合房屋各區域的風水特性... (提供具體的布局調整策略，150-200字)

【生活習慣調整】
配合各房間的風水特性調整日常作息... (給出實用的生活建議，100-150字)

【長期發展建議】
風水布局需要時間發酵，建議您耐心執行各項建議... (提供長期規劃和維護建議，100-150字)

【輸出要求】：
- 使用繁體中文和傳統風水術語
- 內容要專業準確，結合用戶的具體命卦和房屋情況
- 建議要實用可執行，避免抽象理論
- 總字數控制在500-700字之間
- 輸出純文字，不要使用JSON或其他格式
- **請務必確保所有內容都適用於${gender}性用戶**
`;
}

export async function POST(request) {
	try {
		const body = await request.json();
		const { rooms, userProfile, designSummary } = body;

		if (!rooms || !userProfile) {
			return NextResponse.json(
				{ error: "Missing rooms or userProfile data" },
				{ status: 400 }
			);
		}

		if (!DEEPSEEK_API_KEY) {
			return NextResponse.json(
				{ error: "AI service not configured" },
				{ status: 500 }
			);
		}

		// 計算命主命卦 - 優先使用前端傳來的正確計算結果
		let mingGuaInfo;
		try {
			if (userProfile.mingGuaInfo && userProfile.mingGuaInfo.name) {
				// 使用前端已計算的命卦信息
				mingGuaInfo = userProfile.mingGuaInfo;
			} else {
				// 備用：使用API計算
				const calculationResult = calculateMingGua(
					userProfile.birthYear,
					userProfile.gender
				);
				mingGuaInfo = calculationResult; // calculationResult already contains the spread mingGuaInfo
			}
		} catch (error) {
			return NextResponse.json(
				{ error: "Failed to calculate Ming Gua: " + error.message },
				{ status: 500 }
			);
		}

		const roomAnalyses = [];

		// 對每個房間進行AI分析 - 並行處理以提升性能
		const roomAnalysisPromises = rooms
			.filter(
				(item) =>
					item &&
					item.direction &&
					(item.roomType || item.data?._type || item.type)
			)
			.map(async (item) => {
				// Handle center rooms with special feng shui data
				let fengShuiData;
				let bazhaiFortuneResult;

				if (item.direction === "center") {
					// Center rooms have neutral feng shui properties
					fengShuiData = {
						direction: "center",
						flyingStar: "五黃",
						element: "土",
						starType: "凶",
						description: "中宮位，房屋的心臟地帶",
					};
					bazhaiFortuneResult = "中性"; // Neutral position
				} else {
					fengShuiData = flyingStars2025[item.direction];
					if (!fengShuiData) return null;

					bazhaiFortuneResult = getBazhaiResult(
						mingGuaInfo.group,
						item.direction
					);
				}

				// 計算命卦與方位的相容性
				const mingGuaCompatibility =
					item.direction === "center"
						? true
						: bazhaiFortuneResult === "大吉";

				// Enhanced room type mapping with multiple fallbacks
				let roomType =
					item.roomType ||
					item.data?._type ||
					item.data?.type ||
					item.type;

				// Map English room types to Chinese
				const roomTypeMapping = {
					living_room: "客廳",
					bedroom: "臥室",
					dining_room: "餐廳",
					kitchen: "廚房",
					bathroom: "浴室",
					study_room: "書房",
					storage_room: "儲物房",
					balcony: "陽台",
					garden: "花園",
					garage: "車庫",
					corridor: "走廊",
					room: "房間",
				};

				// Apply mapping if needed
				roomType = roomTypeMapping[roomType] || roomType || "房間";

				const roomData = {
					roomId: item.id, // Add unique room ID
					direction: item.direction,
					roomType: roomType, // Use the mapped room type
					fengShuiData,
					bazhaiFortune: bazhaiFortuneResult,
				};

				// 完全使用AI生成分析內容
				const prompt = generateBazhaiPrompt(
					roomData,
					userProfile,
					mingGuaInfo
				);

				const aiAnalysis = await callDeepSeekAPI(prompt);

				return {
					roomId: item.id,
					roomType: roomType, // Use the mapped room type
					direction: item.direction,
					fengShuiData,
					bazhaiFortune: bazhaiFortuneResult,
					mingGuaCompatibility,
					aiAnalysis,
					position: item.position,
					size: item.size,
					timestamp: new Date().toISOString(),
				};
			});

		// 等待所有房間分析完成
		const completedAnalyses = await Promise.all(roomAnalysisPromises);
		roomAnalyses.push(
			...completedAnalyses.filter((analysis) => analysis !== null)
		);

		if (roomAnalyses.length === 0) {
			return NextResponse.json(
				{ error: "No valid rooms found for analysis" },
				{ status: 400 }
			);
		}

		// 生成整體住宅AI分析
		const overallPrompt = generateOverallBazhaiPrompt(
			roomAnalyses,
			userProfile,
			mingGuaInfo
		);
		const overallAnalysis = await callDeepSeekAPI(overallPrompt);

		// 生成年度風水建議
		console.log(
			"About to generate yearly advice for gender:",
			userProfile.gender
		);
		const yearlyAdvicePrompt = generateYearlyAdvicePrompt(
			userProfile,
			mingGuaInfo
		);
		console.log(
			"Yearly advice prompt includes gender:",
			yearlyAdvicePrompt.includes(userProfile.gender)
		);
		const yearlyAdviceResponse = await callDeepSeekAPI(yearlyAdvicePrompt);
		console.log(
			"AI yearly advice response preview:",
			yearlyAdviceResponse.substring(0, 200)
		);

		let yearlyAdvice = null;
		try {
			yearlyAdvice = JSON.parse(yearlyAdviceResponse);
		} catch (parseError) {
			console.error("Failed to parse yearly advice:", parseError);
			// 提供備用的年度建議
			yearlyAdvice = {
				currentYear: "正在為您量身定制年度風水建議...",
				nineStarCycle: "正在分析九運週期對您的影響...",
				personalizedAdvice: "正在生成個人化建議...",
			};
		}

		// 生成綜合建議
		console.log(
			"About to generate comprehensive advice for gender:",
			userProfile.gender
		);
		const comprehensiveAdvicePrompt = generateComprehensiveAdvicePrompt(
			roomAnalyses,
			userProfile,
			mingGuaInfo
		);
		console.log(
			"Comprehensive advice prompt includes gender:",
			comprehensiveAdvicePrompt.includes(userProfile.gender)
		);
		const comprehensiveAdvice = await callDeepSeekAPI(
			comprehensiveAdvicePrompt
		);
		console.log(
			"AI comprehensive advice response preview:",
			comprehensiveAdvice.substring(0, 200)
		);

		return NextResponse.json({
			success: true,
			data: {
				roomAnalyses,
				overallAnalysis,
				yearlyAdvice,
				comprehensiveAdvice,
				mingGuaInfo,
				userProfile,
				designSummary: designSummary || { compassRotation: 0 },
				analysisDate: new Date().toISOString(),
				apiVersion: "2.0.0",
			},
		});
	} catch (error) {
		console.error("API Error:", error.message);
		return NextResponse.json(
			{
				error: "Analysis failed",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
