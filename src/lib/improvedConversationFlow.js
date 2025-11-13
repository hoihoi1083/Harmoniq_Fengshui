// 改進的對話流程系統 - 自然對話式引導
export class ImprovedConversationFlow {
	// 檢測主要關注領域
	static detectPrimaryConcern(message) {
		const concernPatterns = {
			感情: [
				"感情",
				"愛情",
				"另一半",
				"男朋友",
				"女朋友",
				"老公",
				"老婆",
				"結婚",
				"分手",
				"復合",
				"戀愛",
				"情侶",
				"單身",
				"拍拖",
				"bf",
				"gf",
				"喜歡",
				"暗戀",
				"桃花運",
				"桃花",
				"脫單",
				"覓對象",
			],
			工作: [
				"工作",
				"事業",
				"職場",
				"老闆",
				"上司",
				"同事",
				"升職",
				"轉工",
				"辭職",
				"面試",
				"薪水",
				"公司",
				"返工",
				"job",
				"創業",
				"生意",
			],
			財運: [
				"錢",
				"財運",
				"投資",
				"理財",
				"收入",
				"薪水",
				"債務",
				"破財",
				"賺錢",
				"財富",
				"金錢",
				"股票",
				"買樓",
				"儲錢",
				"經濟",
			],
			健康: [
				"健康",
				"病",
				"身體",
				"睡眠",
				"失眠",
				"頭痛",
				"疲累",
				"壓力",
				"焦慮",
				"抑鬱",
				"痛",
				"唔舒服",
				"生病",
			],
			人際關係: [
				"人際",
				"朋友",
				"關係",
				"相處",
				"社交",
				"人緣",
				"小人",
				"貴人",
				"衝突",
				"合作",
				"同朋友",
				"家人",
			],
			子女: [
				"子女",
				"小朋友",
				"孩子",
				"懷孕",
				"生育",
				"教育",
				"學習",
				"考試",
				"升學",
				"囝囝",
				"女女",
				"湊仔",
			],
			因緣: [
				"因緣",
				"機會",
				"運氣",
				"命運",
				"緣分",
				"時機",
				"選擇",
				"決定",
				"運勢",
				"風水",
			],
			居家佈局: [
				"居家",
				"家居",
				"佈局",
				"布局",
				"房間",
				"臥室",
				"客廳",
				"廚房",
				"浴室",
				"陽台",
				"裝修",
				"傢俱",
				"擺設",
				"方位",
				"位置",
				"空間",
				"家具",
				"床位",
				"書桌",
				"沙發",
				"鏡子",
				"植物",
				"顏色",
				"燈光",
			],
		};

		for (const [concern, keywords] of Object.entries(concernPatterns)) {
			if (keywords.some((keyword) => message.includes(keyword))) {
				return concern;
			}
		}
		return null;
	}

	// 檢測情緒狀態
	static detectEmotion(message) {
		const emotionPatterns = {
			困擾: [
				"困擾",
				"煩惱",
				"不知道",
				"唔知",
				"迷茫",
				"困惑",
				"擔心",
				"焦慮",
				"問題",
				"有問題",
				"麻煩",
				"頭痛",
				"唔明",
				"煩",
			],
			沮喪: [
				"沮喪",
				"失落",
				"難過",
				"傷心",
				"絕望",
				"無助",
				"痛苦",
				"唔開心",
				"不開心",
				"失望",
			],
			憤怒: [
				"生氣",
				"憤怒",
				"不爽",
				"火大",
				"嬲",
				"激嬲",
				"討厭",
				"忿",
				"氣",
			],
			壓力: [
				"壓力",
				"緊張",
				"累",
				"攰",
				"撐不住",
				"受不了",
				"好累",
				"辛苦",
				"壓力大",
			],
			希望: [
				"希望",
				"想要",
				"期待",
				"渴望",
				"改善",
				"提升",
				"變好",
				"想",
				"想知道",
				"幫到",
			],
		};

		for (const [emotion, keywords] of Object.entries(emotionPatterns)) {
			if (keywords.some((keyword) => message.includes(keyword))) {
				return emotion;
			}
		}
		return "平靜";
	}

	// 其他檢測方法的簡化版本
	static detectBirthdayInfo(message) {
		return { hasBirthday: false };
	}

	static detectConcernAndProblem(message) {
		return { concern: null, hasSpecificProblem: false };
	}

	static detectTopicChange(message, currentConcern) {
		const newConcern = this.detectPrimaryConcern(message);

		// 如果檢測到新的關注領域，且與之前不同
		if (newConcern && currentConcern && newConcern !== currentConcern) {
			return {
				hasTopicChange: true,
				previousTopic: currentConcern,
				newTopic: newConcern,
				hasNewProblem: this.hasSpecificProblemDescription(message),
			};
		}

		return {
			hasTopicChange: false,
			previousTopic: currentConcern,
			newTopic: newConcern,
			hasNewProblem: false,
		};
	}

	static detectRelationshipAnalysisChoice(message) {
		const individualPatterns = [
			"個人分析",
			"个人分析",
			"個人",
			"单人分析",
			"單人分析",
			"我自己",
			"個人感情",
			"個人嘅",
			"個人的",
			"自己的",
			"只要我",
			"選擇1",
			"1️⃣",
			"1", // 添加單純數字1
		];

		const couplePatterns = [
			"合盤分析",
			"合盤",
			"合盤配對分析",
			"合盤深度分析",
			"雙方合盤深度分析",
			"配對",
			"配对",
			"兩人",
			"两人",
			"雙人",
			"双人",
			"情侶",
			"情侣",
			"夫妻",
			"伴侶",
			"伴侣",
			"對象",
			"对象",
			"選擇2",
			"2️⃣",
			"2", // 添加單純數字2
		];

		// 檢查是否是生日格式，如果是則不進行關係選擇檢測
		const birthdayPattern =
			/\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/;
		if (birthdayPattern.test(message.trim())) {
			return null;
		}

		// 检查完整匹配优先
		if (individualPatterns.some((pattern) => message.includes(pattern))) {
			return "individual";
		}

		if (couplePatterns.some((pattern) => message.includes(pattern))) {
			return "couple";
		}

		return null;
	}

	// 新增：檢測報告類型選擇
	static detectReportTypeChoice(message) {
		const trimmedMessage = message.trim();

		// 檢查是否是純數字選擇
		if (trimmedMessage === "1") {
			return "detailed_concern"; // 詳細關注領域報告
		} else if (trimmedMessage === "2") {
			return "comprehensive"; // 綜合命理報告
		} else if (trimmedMessage === "3") {
			return "layout"; // 居家佈局報告
		}

		// 檢查文字選擇
		if (
			message.includes("詳細報告") ||
			message.includes("感情的詳細") ||
			message.includes("合盤的詳細")
		) {
			return "detailed_concern";
		} else if (
			message.includes("綜合命理") ||
			message.includes("八字命盤") ||
			message.includes("全面分析")
		) {
			return "comprehensive";
		} else if (
			message.includes("居家佈局") ||
			message.includes("風水空間") ||
			message.includes("佈局報告")
		) {
			return "layout";
		}

		return null;
	}

	static generateCoupleAnalysisExplanation() {
		return "合盤分析是根據兩人的八字來看關係配對度的風水方法。";
	}
}
