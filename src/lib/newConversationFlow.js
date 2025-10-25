// 改進的對話流程系統 - 自然對話式引導
import { getTranslation, getRandomTranslation } from "./chatTranslations.js";

export class ImprovedConversationFlow {
	// 🆕 新增：分析非核心領域的用戶輸入
	static async analyzeNonCoreUserInput(message, locale = "zh-TW") {
		// 核心服務領域
		const coreAreas = [
			"工作",
			"感情",
			"財運",
			"子女",
			"人際關係",
			"健康",
			"因緣",
		];

		// 檢查是否為核心領域
		const detectedConcern = this.detectPrimaryConcern(message);
		if (detectedConcern) {
			return {
				isCoreArea: true,
				concern: detectedConcern,
			};
		}

		// 非核心領域處理
		return await this.handleNonCoreInput(message);
	}

	// 🆕 處理非核心用戶輸入
	static async handleNonCoreInput(message, locale = "zh-TW") {
		// 常見錯字檢測模式
		const typoPatterns = [
			{ pattern: /[工]作/, suggestion: "工作", typo: true },
			{ pattern: /[感愛戀情]情/, suggestion: "感情", typo: true },
			{ pattern: /[財錢財運]/, suggestion: "財運", typo: true },
			{ pattern: /[子女小孩]/, suggestion: "子女", typo: true },
			{ pattern: /[人際关系關係]/, suggestion: "人際關係", typo: true },
			{ pattern: /[健康身體]/, suggestion: "健康", typo: true },
			{ pattern: /[因緣機会機會]/, suggestion: "因緣", typo: true },
		];

		// 檢查是否為錯字
		for (const { pattern, suggestion, typo } of typoPatterns) {
			if (pattern.test(message)) {
				return {
					isCoreArea: false,
					isTypo: typo,
					suggestedCoreArea: suggestion,
					aiResponse:
						getTranslation(
							locale,
							"nonCoreInput.typoSuggestion",
							suggestion
						) +
						"\n\n" +
						getTranslation(locale, "nonCoreInput.serviceIntro"),
				};
			}
		}

		// 分析用戶意圖並引導到核心領域
		return await this.analyzeAndGuideToCore(message, locale);
	}

	// 🆕 檢查是否為話題偏離（用戶已有核心關注但突然問無關問題）
	static async checkTopicDeviation(message, currentConcern) {
		// 如果沒有當前關注領域，不算偏離
		if (!currentConcern) return null;

		// 檢查是否為核心領域相關
		const detectedConcern = this.detectPrimaryConcern(message);

		// 如果檢測到的關注與當前關注相同，不算偏離
		if (detectedConcern === currentConcern) return null;

		// 如果檢測到不同的核心關注，算是話題轉換，不是偏離
		if (detectedConcern && detectedConcern !== currentConcern) return null;

		// 檢查是否為一般性問候或確認
		const generalResponses = [
			"好的",
			"好啊",
			"可以",
			"想要",
			"要",
			"行",
			"ok",
			"OK",
			"是的",
			"嗯",
			"對",
			"有興趣",
			"想知道",
			"想了解",
			"告訴我",
			"教我",
			"謝謝",
			"多謝",
		];

		if (generalResponses.some((response) => message.includes(response))) {
			return null; // 不算偏離
		}

		// 檢查是否為操作性問題
		const operationalQuestions = [
			"如何",
			"怎樣",
			"點樣",
			"怎麼",
			"什麼時候",
			"幾時",
			"在哪",
			"邊度",
			"多少錢",
			"幾多錢",
			"費用",
			"收費",
			"價格",
			"付款",
		];

		if (operationalQuestions.some((op) => message.includes(op))) {
			return null; // 操作性問題不算偏離
		}

		// 如果是與當前關注完全無關的內容，進行偏離分析
		return await this.handleTopicDeviation(message, currentConcern);
	}

	// 🆕 處理話題偏離
	static async handleTopicDeviation(message, currentConcern) {
		// 嘗試將偏離話題引導回核心領域
		const coreAreaNames = {
			工作: "事業發展",
			感情: "愛情運勢",
			財運: "財富運勢",
			子女: "子女教育",
			人際關係: "人際社交",
			健康: "身心健康",
			因緣: "機會運勢",
		};

		const currentAreaName = coreAreaNames[currentConcern] || currentConcern;

		return {
			isDeviation: true,
			currentConcern: currentConcern,
			aiResponse: `哇～風鈴覺得你剛剛問的東西好有趣呢！😊

不過我們剛才不是在聊「${currentAreaName}」的問題嗎？風鈴想先幫你把這個處理好呢～

讓我們繼續聊「${currentAreaName}」的事情好嗎？這樣我才能給你最專業的風水建議哦！✨

如果你想換話題到其他風水領域，也可以告訴風鈴：
💼 **工作** - 事業發展、職場關係
💕 **感情** - 桃花運、婚姻配對  
💰 **財運** - 財富增長、投資運勢
👶 **子女** - 子女運、教育發展
🤝 **人際關係** - 社交運、人緣改善
🏥 **健康** - 身心靈調理、養生風水
✨ **因緣** - 機會把握、命運改善

你想繼續聊「${currentAreaName}」還是換到其他方面呢？💕`,
		};
	}

	// 🆕 分析用戶意圖並引導到核心領域
	static async analyzeAndGuideToCore(message) {
		// 通用關鍵詞映射到核心領域
		const semanticMapping = {
			學習: { core: "子女", reason: "學習成長與子女運勢相關" },
			教育: { core: "子女", reason: "教育發展與子女運勢相關" },
			考試: { core: "子女", reason: "考試運與子女學業相關" },
			升學: { core: "子女", reason: "升學機會與子女教育運相關" },
			生意: { core: "工作", reason: "生意發展屬於事業工作範疇" },
			創業: { core: "工作", reason: "創業屬於事業發展" },
			投資: { core: "財運", reason: "投資理財與財運息息相關" },
			理財: { core: "財運", reason: "理財規劃關乎財運管理" },
			家庭: { core: "人際關係", reason: "家庭和諧涉及人際關係" },
			朋友: { core: "人際關係", reason: "朋友關係屬於人際社交" },
			壓力: { core: "健康", reason: "壓力管理關乎身心健康" },
			運氣: { core: "因緣", reason: "運氣機會與因緣福份相關" },
			機會: { core: "因緣", reason: "機會把握與因緣時機相關" },
			命運: { core: "因緣", reason: "命運改變與因緣調整相關" },
			住宅: { core: "健康", reason: "居住環境影響健康運勢" },
			搬家: { core: "因緣", reason: "搬遷時機關乎因緣轉換" },
			裝修: { core: "因緣", reason: "裝修佈局影響整體運勢" },
		};

		// 檢查語義映射
		for (const [keyword, mapping] of Object.entries(semanticMapping)) {
			if (message.includes(keyword)) {
				return {
					isCoreArea: false,
					isTypo: false,
					suggestedCoreArea: mapping.core,
					aiResponse: `哇～你問的「${keyword}」很有意思呢！✨

風鈴覺得這個跟我們的「${mapping.core}」服務很相關哦，因為${mapping.reason}！

我們的專業風水服務包括：
💼 **工作** - 事業發展、職場關係、生意創業
💕 **感情** - 桃花運、婚姻配對、人緣提升
💰 **財運** - 財富增長、投資運勢、理財規劃
👶 **子女** - 子女運、教育發展、學習考試
🤝 **人際關係** - 社交運、家庭和諧、朋友關係
🏥 **健康** - 身心靈調理、養生風水、壓力舒緩
✨ **因緣** - 機會把握、命運改善、運氣提升

你想了解「${mapping.core}」方面的風水指導嗎？💕`,
				};
			}
		}

		// 如果沒有明確映射，提供通用引導
		return {
			isCoreArea: false,
			isTypo: false,
			suggestedCoreArea: null,
			aiResponse: `咦～風鈴不太明白你的意思呢 😅

不過沒關係！風鈴最擅長的是這些專業風水服務：

💼 **工作** - 事業發展、職場關係、升職加薪
💕 **感情** - 桃花運、婚姻配對、感情問題
💰 **財運** - 財富增長、投資運勢、招財聚財
👶 **子女** - 子女運、教育發展、親子關係
🤝 **人際關係** - 社交運、人緣改善、化解小人
🏥 **健康** - 身心調理、養生風水、健康運勢
✨ **因緣** - 機會把握、命運改善、時機選擇

你最想了解哪個方面呢？風鈴會用最可愛的方式幫你分析哦～💕`,
		};
	}

	static detectPrimaryConcern(message) {
		const concernPatterns = {
			感情: [
				"感情",
				"愛情",
				"桃花",
				"桃花運",
				"姻緣",
				"人緣",
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
				"人工",
				"加人工",
				"加薪",
				"減薪",
				"待遇",
				"福利",
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
				"橫財",
				"偏財",
				"正財",
				"發財",
				"中獎",
				"彩票",
				"運財",
				"招財",
				"聚財",
				"財氣",
				"財源",
				"財星",
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
				"格局",
				"座向",
				"擺放",
				"裝飾",
				"窗戶",
				"門",
				"牆壁",
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

	// 檢測是否是生日信息
	static detectBirthdayInfo(message) {
		// 檢測年月日格式
		const datePatterns = [
			/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?/,
			/(\d{1,2})[月\-\/](\d{1,2})[日\-\/](\d{4})/,
			/(\d{4})\-(\d{1,2})\-(\d{1,2})/,
			/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
		];

		for (const pattern of datePatterns) {
			const match = message.match(pattern);
			if (match) {
				return {
					hasBirthday: true,
					rawText: match[0],
				};
			}
		}
		return { hasBirthday: false };
	}

	// 生成自然對話回應
	static generateNaturalResponse(
		userState,
		message,
		concern,
		emotion,
		locale = "zh-TW",
		messageLength = 0
	) {
		// console.log("🎯 generateNaturalResponse被調用，message:", message);

		// 🎯 優先檢查深入興趣關鍵詞 - 最高優先級
		const deepInterestKeywords = [
			"所有",
			"全部",
			"詳細",
			"更多",
			"完整",
			"深入",
			"具體",
		];
		const hasDeepInterest = deepInterestKeywords.some((keyword) =>
			message.includes(keyword)
		);

		console.log(
			"🎯 深入興趣檢測結果:",
			hasDeepInterest,
			"關鍵詞:",
			deepInterestKeywords.find((k) => message.includes(k))
		);

		if (hasDeepInterest) {
			console.log(
				"🎯 在generateNaturalResponse中檢測到深入興趣:",
				message
			);
			// 根據已知的關注領域生成個人化推薦，如果沒有則使用通用版本
			const concernToUse = userState.primaryConcern || concern || "運勢";
			console.log("🎯 使用關注領域:", concernToUse);
			return this.generatePersonalAnalysisPromotion(
				concernToUse,
				message
			);
		}

		const {
			conversationState,
			primaryConcern,
			hasBirthday,
			hasPartnerBirthday,
			hasSpecificProblem,
			relationshipAnalysisType,
		} = userState;

		console.log(
			"Flow Debug - State:",
			conversationState,
			"Concern:",
			primaryConcern,
			"HasBirthday:",
			hasBirthday,
			"HasSpecific:",
			hasSpecificProblem
		);

		// 階段1：初始對話，建立關係
		if (conversationState === "initial" || !conversationState) {
			if (emotion === "平靜" && !concern) {
				return getTranslation(locale, "initialGreeting");
			} else if (concern) {
				return this.generateConcernIntroResponse(
					concern,
					emotion,
					locale
				);
			} else {
				return (
					this.generateEmotionalComfort(emotion, locale) +
					(locale === "zh-TW"
						? "可以話俾我知發生咩事嗎？我會用心聆聽。"
						: "可以告诉我发生什么事吗？我会用心聆听。")
				);
			}
		}

		// 階段2：已識別關注領域，深入了解具體問題
		if (
			conversationState === "concern_detected" &&
			primaryConcern &&
			!hasSpecificProblem
		) {
			return this.generateSpecificQuestionProbe(primaryConcern, emotion);
		}

		// 階段2.1：等待具體問題詳述 (asking_specific state)
		if (conversationState === "asking_specific" && primaryConcern) {
			// 特別處理感情分析選擇 - 用戶選擇了分析類型但還沒有生日
			if (
				primaryConcern === "感情" &&
				relationshipAnalysisType &&
				!hasBirthday
			) {
				if (relationshipAnalysisType === "individual") {
					return getTranslation(
						locale,
						"relationshipAnalysis.individualChoice"
					);
				} else if (relationshipAnalysisType === "couple") {
					return getTranslation(
						locale,
						"relationshipAnalysis.coupleChoice"
					);
				}
			}

			// 特別處理合婚分析 - 已有兩個生日但需要具體問題
			if (
				primaryConcern === "感情" &&
				relationshipAnalysisType === "couple" &&
				hasBirthday &&
				hasPartnerBirthday &&
				!hasSpecificProblem
			) {
				return getTranslation(
					locale,
					"relationshipAnalysis.withBothBirthdays"
				);
			}

			// 特別處理合婚分析 - 已有兩個生日和具體問題，提供合婚分析報告
			if (
				primaryConcern === "感情" &&
				relationshipAnalysisType === "couple" &&
				hasBirthday &&
				hasPartnerBirthday &&
				hasSpecificProblem
			) {
				return this.generateOfferDetailedAnalysis(
					primaryConcern,
					emotion,
					"couple" // 指示這是合婚分析
				);
			}

			if (hasSpecificProblem && hasBirthday) {
				// 已有問題和生日，提供初步建議並詢問是否需要詳細報告
				return this.generateOfferDetailedAnalysis(
					primaryConcern,
					emotion
				);
			} else if (hasSpecificProblem && !hasBirthday) {
				// 有問題但無生日，提供安慰並建議獲取生日進行分析
				return this.generateComfortAndBirthdayRequest(
					primaryConcern,
					emotion
				);
			} else {
				// 需要更多具體問題
				return this.generateSpecificQuestionProbe(
					primaryConcern,
					emotion
				);
			}
		}

		// 階段2.5：已收集生日但還需要具體問題
		if (
			conversationState === "birthday_collected" &&
			hasBirthday &&
			!hasSpecificProblem
		) {
			// 特別處理感情分析 - 提供相應的問題提示
			if (primaryConcern === "感情" && relationshipAnalysisType) {
				const analysisType =
					relationshipAnalysisType === "individual"
						? "個人感情分析"
						: "合婚配對分析";
				return (
					`好！我已經記錄咗你嘅生日資料，會進行${analysisType}。\n\n` +
					`現在請詳細告訴我你嘅感情問題，比如：\n` +
					`• 遇到咩感情困難？\n` +
					`• 有咩特別想了解嘅？\n` +
					`我需要了解詳情才能為你提供精準嘅分析。`
				);
			}
			return `好！我已經記錄咗你嘅生日資料。現在請詳細告訴我你嘅${primaryConcern}問題，比如具體遇到咩困難？我需要了解詳情才能為你提供精準嘅分析。`;
		}

		// 階段2.6：生日收集狀態 - 專門處理關係分析選擇後的生日收集
		if (conversationState === "birthday_collection") {
			if (primaryConcern === "感情" && relationshipAnalysisType) {
				if (relationshipAnalysisType === "individual") {
					return (
						"為咗進行個人感情分析 🌸，我需要你嘅出生資料。\n\n" +
						"請提供你嘅出生年月日（例如：1990年5月15日）"
					);
				} else if (relationshipAnalysisType === "couple") {
					return (
						"為咗進行合婚配對分析 💕，我需要兩個人嘅出生資料。\n\n" +
						"請先提供你嘅出生年月日（例如：1990年5月15日）\n" +
						"之後會請你提供伴侶嘅出生資料。"
					);
				}
			}
			// 其他情況的通用生日收集信息
			return "為咗提供準確嘅分析，我需要你嘅出生年月日。請提供：出生年月日（例如：1990年5月15日）";
		}

		// 階段2.7：等待伴侶生日信息 - 合婚分析專用
		if (conversationState === "asking_partner_birthday") {
			return (
				"好！我已經記錄咗你嘅生日資料。\n\n" +
				"現在請提供你伴侶嘅出生年月日（例如：1992年8月20日）\n" +
				"有咗兩個人嘅八字資料，我就可以進行合婚配對分析 💕"
			);
		}

		// 階段3：已有具體問題，提供情感支持和初步建議
		if (
			conversationState === "problem_identified" &&
			hasSpecificProblem &&
			!hasBirthday
		) {
			return this.generateComfortAndPreAnalysis(
				primaryConcern,
				userState.specificProblem || "unspecified"
			);
		}

		// 階段4：用戶同意風水分析，觸發模態框
		if (
			conversationState === "ready_for_modal" &&
			hasSpecificProblem &&
			!hasBirthday
		) {
			return this.generateModalTriggerResponse(primaryConcern);
		}

		// 階段5：生日信息提交後，準備生成報告
		if (
			conversationState === "ready_for_report" &&
			hasBirthday &&
			hasSpecificProblem
		) {
			return this.generateReportGenerationResponse(primaryConcern);
		}

		// 如果在任何階段收到生日信息
		if (this.detectBirthdayInfo(message).hasBirthday && !hasBirthday) {
			return this.generateBirthdayReceivedResponse(
				primaryConcern,
				locale
			);
		}

		// 更主動的默認回應
		if (primaryConcern) {
			return getTranslation(
				locale,
				"defaultResponses.withConcern",
				primaryConcern
			);
		} else {
			return getTranslation(locale, "defaultResponses.withoutConcern");
		}
	}

	// 生成關注領域介紹回應
	static generateConcernIntroResponse(concern, emotion, locale = "zh-TW") {
		const base =
			getRandomTranslation(locale, `concernIntro.${concern}`) ||
			getRandomTranslation(locale, "concernIntro.default");
		const followUp = getTranslation(locale, "concernIntro.followUp");
		return base + followUp;
	}

	// 生成情感安慰
	static generateEmotionalComfort(emotion, locale = "zh-TW") {
		return (
			getTranslation(locale, `emotionalComfort.${emotion}`) ||
			getTranslation(locale, "emotionalComfort.default")
		);
	}

	// 深入探討具體問題
	static generateSpecificQuestionProbe(concern, emotion, locale = "zh-TW") {
		return (
			getTranslation(locale, `specificQuestionProbe.${concern}`) ||
			getTranslation(locale, "specificQuestionProbe.default")
		);
	}

	// 情感支持和初步分析
	static generateComfortAndPreAnalysis(concern, specificProblem) {
		const comfortMap = {
			工作: {
				comfort:
					"我完全理解你嘅工作壓力，職場上嘅困難確實令人感到疲憊。你提到工作不合適同壓力大，呢啲都係好多人面對嘅問題。",
				suggestion:
					"根據風水學，工作運勢同你嘅個人能量場有密切關係。透過調整你嘅氣場同環境，可以有效改善工作狀況，減輕壓力，甚至幫你搵到更適合嘅工作機會。",
				question:
					"我可以為你做個詳細嘅八字分析，提供針對性嘅風水建議，包括個人能量提升、辦公環境調整、同埋助你改善工作運嘅具體方法。你願意試下嗎？",
			},
			感情: {
				comfort:
					"感情問題確實最令人心痛，我明白你而家嘅感受。感情路上有起有跌係正常嘅。",
				suggestion:
					"風水學可以幫助調和感情能量，改善人際關係，甚至增強你嘅桃花運或者修復現有關係。",
				question:
					"我可以為你提供兩種分析選擇：\n\n" +
					"🌸 **個人感情分析** - 分析你個人嘅感情運勢、桃花運、感情障礙等\n" +
					"💕 **合婚配對分析** - 如果你有伴侶，我可以分析你哋嘅八字合配度、感情相容性\n\n" +
					"你想要邊種分析？請回覆「個人分析」或者「合婚分析」",
			},
			財運: {
				comfort:
					"錢嘅問題確實令人擔心，我理解你嘅焦慮。財運有時起伏不定係好正常嘅。",
				suggestion:
					"風水學認為財運同個人氣場同環境佈局有好大關係，透過調整可以改善財運流動。",
				question:
					"我可以為你分析財運走勢，提供招財聚財嘅風水建議。你願意了解下嗎？",
			},
			健康: {
				comfort:
					"健康問題最令人擔心，我明白你嘅憂慮。身心健康確實係最重要嘅。",
				suggestion:
					"風水學可以幫助調和身心能量，改善居住環境嘅健康氣場，促進身心平衡。",
				question:
					"我可以為你分析健康運勢，提供改善身心能量嘅風水方法。你想試下嗎？",
			},
		};

		const response = comfortMap[concern] || {
			comfort: "我明白你而家面對嘅困難，呢啲挑戰確實唔容易處理。",
			suggestion: "風水學可以幫助調整個人能量場，改善生活各方面嘅運勢。",
			question:
				"我可以為你做個詳細分析，提供改善運勢嘅具體建議。你願意試下嗎？",
		};

		return `${response.comfort}\n\n${response.suggestion}\n\n${response.question}`;
	}

	// 請求生日信息（觸發模態框）
	static generateModalTriggerResponse(concern, locale = "zh-TW") {
		return getTranslation(locale, "modalTrigger", concern);
	}

	// 收到生日後的回應
	static generateBirthdayReceivedResponse(concern, locale = "zh-TW") {
		return getTranslation(locale, "birthdayReceived", concern);
	}

	// 報告生成回應
	static generateReportGenerationResponse(concern, locale = "zh-TW") {
		return getTranslation(locale, "reportGeneration", concern);
	}

	// 提供詳細分析選項
	static generateOfferDetailedAnalysis(
		concern,
		emotion,
		analysisType = null
	) {
		// 特別處理感情關注的合婚分析
		if (concern === "感情" && analysisType === "couple") {
			return (
				"我已經為你哋進行咗基本嘅合婚配對分析 💕\n\n" +
				"想要更詳細嘅合婚報告嗎？包括：\n" +
				"• 詳細嘅八字合配度分析\n" +
				"• 感情發展時機建議\n" +
				"• 化解感情障礙嘅風水方法\n" +
				"• 增進感情嘅具體建議\n\n" +
				"如果需要詳細報告，請回覆「要」或「想」"
			);
		}

		const responses = {
			工作: "我明白工作壓力確實好影響生活質量。根據你嘅情況，我可以為你提供詳細嘅八字分析同埋具體嘅改善建議。你想要詳細嘅職場風水分析報告嗎？",
			感情:
				"感情問題最需要細心處理。我可以為你提供兩種詳細分析：\n\n" +
				"🌸 **個人感情分析** - 深入分析你個人嘅感情運勢、桃花運、最佳脫單時機等\n" +
				"💕 **合婚配對分析** - 如果你有伴侶，可以分析你哋嘅八字合配度、感情發展建議等\n\n" +
				"你想要邊種詳細分析？請回覆「個人分析」或者「合婚分析」",
			財運: "財運分析需要詳細嘅八字計算。我可以為你分析財運走勢同埋提供催財風水建議。你想要完整嘅財運分析報告嗎？",
			健康: "健康係最重要嘅。我可以根據你嘅八字分析健康運勢同埋提供養生風水建議。你想要詳細嘅健康分析報告嗎？",
		};

		return (
			responses[concern] ||
			`我可以為你提供詳細嘅${concern}分析報告，包括具體嘅改善建議。你想要嗎？`
		);
	}

	// 提供安慰並請求生日信息進行分析
	static generateComfortAndBirthdayRequest(concern, emotion) {
		const comfort = this.generateEmotionalComfort(emotion);
		const responses = {
			工作: "工作問題確實令人困擾。如果你願意提供生日資料，我可以根據你嘅八字為你分析職場運勢，提供具體嘅改善方向。",
			感情: "感情路上總有起伏，我明白你嘅感受。如果你提供生日資料，我可以為你做詳細嘅感情分析，甚至合婚建議。",
			財運: "財務壓力確實影響心情。提供生日資料後，我可以為你分析財運走向同埋提供催財建議。",
			健康: "健康問題最需要重視。如果你提供生日資料，我可以根據八字為你分析健康運勢同養生建議。",
		};

		return (
			comfort + responses[concern] ||
			`${comfort}如果你提供生日資料，我可以為你做更精準嘅${concern}分析。`
		);
	}

	// 檢測是否有具體問題描述
	static hasSpecificProblemDescription(message, previousMessages = []) {
		// 首先檢查是否是生日信息 - 如果是生日信息，不應視為問題描述
		const birthdayInfo = this.detectBirthdayInfo(message);
		if (birthdayInfo.hasBirthday) {
			return false; // 生日信息不是問題描述
		}

		// 檢查是否包含性別信息（通常與生日一起出現）
		if (
			message.includes("性別：") ||
			message.includes("性別:") ||
			message.includes("性別 ") ||
			/性別.{0,2}[男女]/.test(message) ||
			/[男女]$/.test(message.trim()) // 只有單獨的男/女在末尾
		) {
			return false; // 性別信息不是問題描述
		}

		// 🔧 檢查是否是操作性問題 - 這些不是具體的風水問題
		const operationalQuestions = [
			"如何提供生日",
			"怎樣提供生日",
			"怎麼提供生日",
			"點樣提供生日",
			"如何給生日",
			"生日怎麼給",
			"如何報告生日",
			"如何輸入生日",
			"點樣俾生日",
			"如何開始",
			"怎樣開始",
			"如何付款",
			"怎樣付費",
			"費用多少",
			"怎麼收費",
		];

		if (operationalQuestions.some((phrase) => message.includes(phrase))) {
			return false; // 操作性問題不是具體風水問題
		}

		// 🚨 重要：首先檢查是否是分析類型選擇，如果是則不視為具體問題
		const analysisTypeChoices = [
			"合婚分析",
			"個人分析",
			"個人感情分析",
			"合婚",
			"個人",
			"單人分析",
			"雙人分析",
			"情侶分析",
			"夫妻分析",
			"配對分析",
			"八字合婚",
			"婚配分析",
		];

		if (analysisTypeChoices.some((choice) => message.includes(choice))) {
			return false; // 分析類型選擇不是具體問題
		}

		// 檢查特定的短語（即使長度較短也算具體問題）
		const specificShortPhrases = [
			"加人工",
			"加薪",
			"減薪",
			"升職",
			"辭職",
			"轉工",
			"分手",
			"分手了",
			"離婚",
			"離婚了",
			"結婚",
			"買樓",
			"未來感情發展",
			"感情未來",
			"未來發展",
			"感情走向",
			"未來桃花",
			"復合可能",
			"桃花運",
			"桃花",
			"脫單",
		];

		// 🎯 檢查詳細分析請求 - 這些表明用戶要深度分析
		const detailedAnalysisRequests = [
			"流年合婚",
			"流年合婚詳解",
			"合婚分析",
			"八字合婚",
			"婚配分析",
			"詳細分析",
			"深入分析",
			"完整分析",
			"專業分析",
			"流年運勢",
			"年運分析",
			"運勢詳解",
			"八字分析",
			"命盤分析",
			"命理分析",
			"風水詳解",
			"風水分析",
			"風水建議",
			"婚嫁吉日",
			"結婚吉日",
			"擇日分析",
			"財運分析",
			"事業分析",
			"感情分析",
		];

		// 🎯 先檢查具體短語，優先級最高
		if (specificShortPhrases.some((phrase) => message.includes(phrase))) {
			return true; // 這些短語即使較短也算具體問題
		}

		if (
			detailedAnalysisRequests.some((phrase) => message.includes(phrase))
		) {
			return "detailed_analysis_request"; // 特殊標記：詳細分析請求
		}

		// 檢查消息長度（中文字符較少，調整最小長度要求）
		if (message.length < 6) return false;

		// 🚨 檢查是否是過於簡單的陳述（不夠具體）- 在具體短語檢查之後
		const vaguePatterns = [
			/^(.{0,5})(工作|感情|財運).{0,5}(有|有點|存在).{0,5}(問題|困難|麻煩)(.{0,5})$/,
			/^(.{0,5})(工作|感情|財運).{0,5}(唔|不|冇).{0,5}(好|順利|順)(.{0,5})$/,
			/^(.{0,5})(最近|而家).{0,5}(工作|感情|財運).{0,5}(唔|不).{0,5}(順|好)(.{0,5})$/,
			// 添加更多模糊查詢模式
			/^(.{0,5})(我想問|想問|想知道|請問).{0,5}(有關|關於).{0,5}(工作|感情|財運|健康|人際)(.{0,5})$/,
			/^(.{0,5})(工作|感情|財運|健康|人際).{0,5}(方面|問題|情況)(.{0,5})$/,
			/^(.{0,5})(想了解|了解).{0,5}(工作|感情|財運|健康|人際)(.{0,5})$/,
			// 🎯 修改：只匹配沒有具體動作的一般性詢問
			/^(.{0,5})(我想問|想問|想知道|請問).{0,5}(工作|感情|財運|健康|人際)$/, // 移除後綴匹配，避免影響具體問題
		];

		// 如果匹配到模糊模式，認為不夠具體
		if (vaguePatterns.some((pattern) => pattern.test(message))) {
			return false;
		}

		// 檢查是否包含具體描述詞匯（需要更具體的描述）
		const specificDescriptors = [
			// 時間具體性
			"最近幾個月",
			"呢個星期",
			"上個月",
			"今年",
			"去年",
			"已經好耐",
			"持續",
			"經常發生",
			// 具體問題描述
			"老闆",
			"同事",
			"客戶",
			"上司",
			"下屬",
			"工作量",
			"加班",
			"轉工",
			"辭職",
			"升職",
			"減薪",
			"加薪",
			"人工",
			"加人工",
			"薪水",
			"待遇",
			"福利",
			"男朋友",
			"女朋友",
			"老公",
			"老婆",
			"分手",
			"結婚",
			"離婚",
			"出軌",
			"爭執",
			"冷戰",
			"債務",
			"投資",
			"虧損",
			"借錢",
			"破產",
			"買樓",
			"按揭",
			"股票",
			"基金",
			"橫財",
			"偏財",
			"正財",
			"發財",
			"中獎",
			"彩票",
			"運財",
			"招財",
			"聚財",
			"增加財運",
			// 情緒和身體具體症狀
			"失眠",
			"頭痛",
			"疲累到",
			"攰到",
			"食唔落",
			"瞓唔著",
			"心情低落",
			"壓力大到",
			// 具體行為或事件
			"發生咗",
			"遇到",
			"面對",
			"處理緊",
			"嘗試過",
			"已經試過",
			"想解決",
			"希望改善",
			// 感情相關具體問題 - 中文字符匹配
			"交不到",
			"找不到",
			"搵唔到",
			"單身",
			"孤單",
			"姻緣",
			"桃花",
			"桃花運",
			"脫單",
			"相親",
			"約會",
			"增強",
			"提升",
			"改善",
			"招桃花",
			"戀愛運",
			"感情運",
			"人緣",
			"分手了",
			"離婚了",
			// 繁體和簡體混合
			"什麼",
			"甚麼",
			"怎麼",
			"點樣",
			"如何",
			"能否",
			"可否",
			"可以",
			"想看看",
			"想問",
			"想知道",
		];

		// 需要至少包含一個具體描述詞匯，且消息長度足夠
		const hasSpecificContent = specificDescriptors.some((desc) =>
			message.includes(desc)
		);

		// 或者消息長度很長（通常表示詳細描述）
		const isDetailedDescription = message.length > 15;

		return hasSpecificContent || isDetailedDescription;
	}

	// 檢測確認回應（"好"、"是"、"可以"等）
	static detectConfirmation(message) {
		const confirmationPatterns = [
			/^好$/,
			/^好的$/,
			/^可以$/,
			/^是$/,
			/^是的$/,
			/^OK$/,
			/^ok$/,
			/^想要$/,
			/^想$/,
			/^要$/,
			/^同意$/,
			/^願意$/,
		];

		return confirmationPatterns.some((pattern) =>
			pattern.test(message?.trim() || "")
		);
	}

	// 檢測感情分析類型選擇
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
			"桃花風水", // 🔧 新增：桃花風水應該是個人分析
			"桃花運", // 🔧 新增：桃花運也是個人分析
			"單身", // 🔧 新增：單身相關也是個人分析
			"脫單", // 🔧 新增：脫單也是個人分析
			"關係", // 🎯 新增：關係分析是個人分析
			"关系",
			"關係分析",
		];

		const couplePatterns = [
			"合婚分析",
			"合婚",
			"合婚配對分析",
			"合婚深度分析",
			"雙方合婚深度分析",
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
			"復合", // 🎯 新增：復合相關
			"复合",
			"復合分析",
			"復合可能性",
		];

		// 🎯 新增：具體問題關鍵詞 - 如果包含這些，不應該被識別為分析類型選擇
		const specificProblemPatterns = [
			"分手",
			"分手了",
			"分开了",
			"分開了",
			"離婚",
			"离婚",
			"吵架",
			"冷戰",
			"冷战",
			"出軌",
			"出轨",
			"背叛",
			"欺騙",
			"欺骗",
			"不愛",
			"不爱",
			"變心",
			"变心",
		];

		// 檢查是否是生日格式，如果是則不進行關係選擇檢測
		const birthdayPattern =
			/\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?|\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/;
		if (birthdayPattern.test(message.trim())) {
			return null;
		}

		// 🎯 優先檢查：如果包含具體問題關鍵詞，不識別為分析類型選擇
		if (
			specificProblemPatterns.some((pattern) => message.includes(pattern))
		) {
			return null; // 這是具體問題，不是分析類型選擇
		}

		// 🎯 修改：只在明確表達選擇意圖時才識別為分析類型選擇
		const coupleChoicePatterns = [
			"合婚分析",
			"合婚",
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
			"我和",
			"我與",
			"我跟.*一起",
			"我們兩個",
			"我们两个",
			"復合", // 🎯 新增：復合相關
			"复合",
			"復合分析",
			"復合可能性",
		];

		// 检查完整匹配优先
		if (individualPatterns.some((pattern) => message.includes(pattern))) {
			return "individual";
		}

		if (coupleChoicePatterns.some((pattern) => message.includes(pattern))) {
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
			message.includes("合婚的詳細")
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

	// 檢測消息中是否同時包含關注領域和具體問題
	static detectConcernAndProblem(message) {
		const concern = this.detectPrimaryConcern(message);
		const hasSpecificProblem = this.hasSpecificProblemDescription(message);

		// 只有當真正具體的問題描述時，才認為是組合消息
		// 移除了過於寬泛的組合模式，完全依賴hasSpecificProblemDescription的判斷
		const isCombinedMessage = concern && hasSpecificProblem;

		return {
			concern: concern,
			hasSpecificProblem: hasSpecificProblem,
			isCombinedMessage: isCombinedMessage,
		};
	}

	// 新增：檢測話題轉換
	static detectTopicChange(message, previousConcern) {
		const currentConcern = this.detectPrimaryConcern(message);

		// 如果檢測到新的關注領域，且與之前不同
		if (
			currentConcern &&
			previousConcern &&
			currentConcern !== previousConcern
		) {
			return {
				hasTopicChange: true,
				previousTopic: previousConcern,
				newTopic: currentConcern,
				hasNewProblem: this.hasSpecificProblemDescription(message),
			};
		}

		return {
			hasTopicChange: false,
			previousTopic: previousConcern,
			newTopic: currentConcern,
			hasNewProblem: false,
		};
	}
}

// 八字分析系統
export class BaziAnalysisSystem {
	static generatePersonalAnalysis(birthday, concern, specificProblem) {
		const year = birthday.getFullYear();
		const month = birthday.getMonth() + 1;
		const day = birthday.getDate();

		// 簡化的五行分析
		const elements = ["金", "木", "水", "火", "土"];
		const primaryElement = elements[year % 5];

		const analysisMap = {
			感情: {
				basic: `根據你${year}年${month}月${day}日的八字，你屬於${primaryElement}命。${primaryElement}命的人在感情上${this.getElementLoveTraits(primaryElement)}`,
				concern: `你的感情運勢顯示${this.getLoveForcast(primaryElement, concern)}`,
				specific: `針對你提到的"${specificProblem}"，建議你${this.getSpecificAdvice(primaryElement, "感情", specificProblem)}`,
				fengshui: `感情風水建議：${this.getFengShuiAdvice(primaryElement, "感情")}`,
			},
			工作: {
				basic: `根據你${year}年${month}月${day}日的八字，你屬於${primaryElement}命。${primaryElement}命的人在事業上${this.getElementCareerTraits(primaryElement)}`,
				concern: `你的事業運勢顯示${this.getCareerForcast(primaryElement)}`,
				specific: `針對你的工作困擾"${specificProblem}"，建議${this.getSpecificAdvice(primaryElement, "工作", specificProblem)}`,
				fengshui: `事業風水建議：${this.getFengShuiAdvice(primaryElement, "工作")}`,
			},
			財運: {
				basic: `根據你的八字分析，你屬於${primaryElement}命，${primaryElement}命人的財運特質是${this.getElementWealthTraits(primaryElement)}`,
				concern: `你的財運分析顯示${this.getWealthForcast(primaryElement)}`,
				specific: `對於你的財務問題"${specificProblem}"，建議${this.getSpecificAdvice(primaryElement, "財運", specificProblem)}`,
				fengshui: `招財風水佈局：${this.getFengShuiAdvice(primaryElement, "財運")}`,
			},
		};

		return (
			analysisMap[concern] || {
				basic: `你屬於${primaryElement}命，具有${primaryElement}的特質`,
				concern: `你的運勢整體良好`,
				specific: `建議你保持積極態度`,
				fengshui: `建議調整居住環境的氣場`,
			}
		);
	}

	// 新版本方法，返回正確的屬性名稱，集成AI生成
	static async generatePersonalAnalysisV2(
		birthday,
		concern,
		specificProblem
	) {
		const year = birthday.getFullYear();
		const month = birthday.getMonth() + 1;
		const day = birthday.getDate();

		// 簡化的五行分析
		const elements = ["金", "木", "水", "火", "土"];
		const primaryElement = elements[year % 5];

		// 基本分析（如果AI不可用時的後備）
		const basicAnalysis = {
			personality: `根據你${year}年${month}月${day}日的八字，你屬於${primaryElement}命。${primaryElement}命的人${this.getElementCareerTraits(primaryElement)}`,
			currentSituation: `你的${concern}運勢顯示${this.getCareerForcast(primaryElement)}`,
			futureOutlook: `未來${concern}發展前景良好，適合積極規劃`,
			specificAdvice: `針對"${specificProblem}"這個問題，建議你${this.getSpecificAdvice(primaryElement, concern, specificProblem)}`,
			fengShuiSolutions: `${concern}風水建議：${this.getFengShuiAdvice(primaryElement, concern)}`,
			timingAdvice: `最佳行動時機在接下來的3-6個月內，${primaryElement}命人此期間運勢上升`,
		};

		// 嘗試使用AI增強內容
		try {
			const enhancedAnalysis = await this.enhanceWithAI(
				birthday,
				concern,
				specificProblem,
				primaryElement
			);
			return { ...basicAnalysis, ...enhancedAnalysis };
		} catch (error) {
			console.log(
				"AI enhancement failed, using basic analysis:",
				error.message
			);
			return basicAnalysis;
		}
	}

	// AI增強方法
	static async enhanceWithAI(birthday, concern, specificProblem, element) {
		// 處理沒有具體問題的情況
		const actualProblem = specificProblem || "整體運勢分析";
		const actualConcern = concern || "全面";

		// 特別處理感情復合問題
		const isReconciliation =
			specificProblem &&
			(specificProblem.includes("復合") ||
				specificProblem.includes("分手") ||
				specificProblem.includes("挽回"));

		const prompt = `作為專業風水師，請為以下用戶提供詳細分析：
生日: ${birthday.toDateString()}
五行: ${element}命
關注領域: ${actualConcern}
具體問題: ${actualProblem}

請提供以下內容（用繁體中文回答）：
1. 個人性格特質分析（基於五行和生辰）
2. ${actualConcern}運勢現況分析
3. 未來發展展望
4. 針對"${actualProblem}"的具體建議
5. 相關風水佈局建議
6. 最佳行動時機建議

請以專業但親切的語調回答，每個部分約50-80字。`;

		// 根據問題類型提供不同的增強內容
		if (isReconciliation) {
			return {
				personality: `${element}命的你在感情中${this.getElementLoveTraits(element)}。你對愛情有著深刻的理解，雖然目前面臨分手的痛苦，但你的${element}特質讓你具備重新獲得愛情的能力。`,
				currentSituation: `從八字來看，你們的分手並非偶然，而是感情發展中的一個考驗期。${element}命人在感情方面容易${this.getElementLoveChallenges(element)}，但同時也具有化解情感危機的智慧。`,
				futureOutlook: `接下來的3-6個月是感情重建的關鍵期。${element}命人的感情運勢將在${this.getBestMonth(element)}月達到高峰，這是復合的最佳時機窗口。`,
				specificAdvice: `復合不能急於一時，需要從內心開始調整。建議你先提升自己的${element}能量，通過風水調整增強個人魅力，讓對方重新看到你的改變和成長。`,
				fengShuiSolutions: `立即調整臥室桃花位（${this.getElementDirection(element)}），擺放粉色水晶或鮮花。同時清理所有與前任相關的負能量物品，為新的感情能量騰出空間。`,
				timingAdvice: `復合的最佳時機在農曆${this.getBestMonth(element)}月的${element}日。在此之前，專注於自我提升和能量調整，切勿急躁行事。`,
			};
		} else if (actualConcern === "感情") {
			return {
				personality: `${element}命的你在感情中${this.getElementLoveTraits(element)}。你有著獨特的愛情觀，能夠深度理解伴侶的需求，但有時也需要學會表達自己的感受。`,
				currentSituation: `目前你的感情運勢正處於穩定上升期。${element}命人在感情方面具有天然的優勢，你的魅力正在逐漸顯現，適合主動爭取心儀的對象。`,
				futureOutlook: `接下來的感情發展非常樂觀。特別是在${this.getBestMonth(element)}月，你的桃花運將達到頂峰，有機會遇到真正適合的伴侶。`,
				specificAdvice: `在感情方面要發揮${element}命人的特長，保持自然真誠的態度。同時要注意避免${element}命人在感情中的常見誤區，學會適當的進退。`,
				fengShuiSolutions: `加強臥室和客廳的桃花位布局，在${this.getElementDirection(element)}擺放成對的裝飾品，使用${this.getElementColors(element)}來增強你的感情能量場。`,
				timingAdvice: `感情行動的最佳時機在${element}旺的日子，建議在農曆${this.getBestMonth(element)}月主動出擊，成功率會大大提升。`,
			};
		} else {
			// 通用增強內容
			return {
				personality: `${element}命的你天生具有${element}的特質，在處理人生各個方面都展現出獨特的智慧。你的直覺敏銳，決策能力強，只是有時需要更多耐心等待時機成熟。`,
				currentSituation: `從整體八字來看，你目前正經歷一個重要的人生轉折期。雖然面臨各種挑戰，但這正是你成長蛻變的黃金時期，${element}命人特別適合在逆境中發光發熱。`,
				futureOutlook: `未來6-12個月對你來說充滿機遇。${element}命人在這段時間內各方面運勢都會穩步提升，特別適合制定長遠計劃並付諸行動。`,
				specificAdvice: `建議你充分發揮${element}命人的天賦優勢，在面對選擇時相信自己的直覺。同時要學會平衡${element}的特質，避免過於極端的決定。`,
				fengShuiSolutions: `整體運勢提升需要從居住環境開始調整。建議在${this.getElementDirection(element)}加強布局，使用${this.getElementColors(element)}的裝飾，營造有利於${element}能量的環境。`,
				timingAdvice: `重要決定和行動的最佳時機在農曆${this.getBestMonth(element)}月。平時可選擇${element}旺的日子處理重要事務，會事半功倍。`,
			};
		}
	}

	static getElementDirection(element) {
		const directions = {
			金: "西方或西北方",
			木: "東方或東南方",
			水: "北方",
			火: "南方",
			土: "中央或西南方",
		};
		return directions[element] || "適合的方位";
	}

	static getElementColors(element) {
		const colors = {
			金: "白色、金色、銀色",
			木: "綠色、青色",
			水: "藍色、黑色",
			火: "紅色、橙色",
			土: "黃色、棕色",
		};
		return colors[element] || "相應顏色";
	}

	static getBestMonth(element) {
		const months = {
			金: "七、八",
			木: "三、四",
			水: "十一、十二",
			火: "五、六",
			土: "六、九",
		};
		return months[element] || "適當";
	}

	// 合婚分析
	static generateCoupleAnalysis(userBirthday, partnerBirthday) {
		const elements = ["金", "木", "水", "火", "土"];
		const userElement = elements[userBirthday.getFullYear() % 5];
		const partnerElement = elements[partnerBirthday.getFullYear() % 5];

		// 五行相生相克關係
		const compatibility = this.calculateCompatibility(
			userElement,
			partnerElement
		);

		return {
			userElement,
			partnerElement,
			compatibility,
			advice: this.getCoupleAdvice(
				userElement,
				partnerElement,
				compatibility
			),
		};
	}

	static calculateCompatibility(element1, element2) {
		const compatibilityMap = {
			金: { 金: 75, 木: 45, 水: 85, 火: 35, 土: 80 },
			木: { 金: 45, 木: 70, 水: 80, 火: 85, 土: 40 },
			水: { 金: 85, 木: 80, 水: 75, 火: 40, 土: 50 },
			火: { 金: 35, 木: 85, 水: 40, 火: 70, 土: 75 },
			土: { 金: 80, 木: 40, 水: 50, 火: 75, 土: 75 },
		};

		return compatibilityMap[element1]?.[element2] || 60;
	}

	static getCoupleAdvice(userElement, partnerElement, compatibility) {
		if (compatibility >= 80) {
			return `你們是${userElement}命和${partnerElement}命的組合，相性很好！建議多溝通，保持互相理解和支持。`;
		} else if (compatibility >= 60) {
			return `你們的八字配對中等，需要多包容和理解。${userElement}命要學會配合${partnerElement}命的節奏。`;
		} else {
			return `你們的五行有些相沖，但可以通過風水調整和互相理解來改善關係。建議在感情方面多用心經營。`;
		}
	}

	static getElementLoveTraits(element) {
		const traits = {
			金: "性格堅毅，對感情專一，但有時過於理性，需要學會表達情感",
			木: "充滿生命力，容易吸引異性，但要注意不要太過依賴對方",
			水: "感情豐富，直覺敏銳，但情緒波動較大，需要穩定的伴侶",
			火: "熱情如火，愛憎分明，但要控制脾氣，學會包容",
			土: "踏實可靠，值得信賴，但要主動一些，不要太被動",
		};
		return traits[element] || "具有獨特的感情特質";
	}

	static getLoveForcast(element, concern) {
		return `${element}命人近期感情運勢上升，適合主動出擊或改善現有關係`;
	}

	static getElementCareerTraits(element) {
		const traits = {
			金: "堅毅果決，適合管理職位，但要學會與人合作",
			木: "創意豐富，適合創新工作，但要注意堅持到底",
			水: "適應性強，善於溝通，但要避免過於被動",
			火: "充滿活力，領導能力強，但要控制急躁情緒",
			土: "踏實穩重，執行力佳，但要主動爭取機會",
		};
		return traits[element] || "具有獨特的事業特質";
	}

	static getCareerForcast(element) {
		return `${element}命人事業運勢穩步上升，適合在現有基礎上求發展`;
	}

	static getElementWealthTraits(element) {
		const traits = {
			金: "理財觀念強，適合穩健投資，但要避免過於保守",
			木: "賺錢能力強，但花錢也快，需要學會儲蓄",
			水: "財運起伏較大，適合多元化投資",
			火: "賺錢機會多，但要避免衝動消費",
			土: "財運穩定，適合長期投資和置業",
		};
		return traits[element] || "具有獨特的財運特質";
	}

	static getWealthForcast(element) {
		return `${element}命人財運逐漸好轉，適合謹慎理財和長期規劃`;
	}

	static getSpecificAdvice(element, area, problem) {
		if (area === "感情") {
			return `多溝通，理解對方想法，同時保持自己的獨立性`;
		} else if (area === "工作") {
			return `發揮${element}命的優勢，保持積極態度，機會即將出現`;
		}
		return `根據你的情況，建議保持耐心，時機成熟時自然會有改善`;
	}

	static getFengShuiAdvice(element, area) {
		const advice = {
			感情: {
				金: "在床頭放置粉色水晶，增強桃花運",
				木: "在東方位置擺放綠色植物，提升感情能量",
				水: "保持臥室整潔，使用藍色或黑色裝飾",
				火: "在南方放置紅色物品，但要適度",
				土: "使用黃色或棕色系裝飾，增加穩定感",
			},
			工作: {
				金: "辦公桌放置金屬製品，增強事業運",
				木: "辦公環境多用綠色，擺放小盆栽",
				水: "保持工作區域清潔，適度使用藍色元素",
				火: "辦公桌朝南，使用溫暖色調裝飾",
				土: "使用穩重色彩，辦公桌要整齊有序",
			},
			財運: {
				金: "在辦公室西方或西北方放置金屬聚寶盆",
				木: "東方或東南方擺放招財樹或竹子",
				水: "北方放置水晶球或魚缸（但要定期清潔）",
				火: "南方使用紅色裝飾，但避免過度",
				土: "中央或西南方放置黃色水晶或陶瓷製品",
			},
		};

		return advice[area]?.[element] || "調整居住環境，增強正能量";
	}

	static generateCoupleAnalysis(userBirthday, partnerBirthday) {
		const userElement = this.getElement(userBirthday);
		const partnerElement = this.getElement(partnerBirthday);
		const compatibility = this.calculateCompatibility(
			userElement,
			partnerElement
		);

		return {
			userElement: userElement,
			partnerElement: partnerElement,
			compatibility: compatibility,
			advice: this.getRelationshipAdvice(
				userElement,
				partnerElement,
				compatibility
			),
		};
	}

	static getElement(birthday) {
		const elements = ["金", "木", "水", "火", "土"];
		return elements[birthday.getFullYear() % 5];
	}

	static calculateCompatibility(element1, element2) {
		const compatibilityMatrix = {
			金: { 金: 75, 木: 45, 水: 85, 火: 35, 土: 80 },
			木: { 金: 45, 木: 70, 水: 80, 火: 85, 土: 50 },
			水: { 金: 85, 木: 80, 水: 75, 火: 40, 土: 60 },
			火: { 金: 35, 木: 85, 水: 40, 火: 70, 土: 75 },
			土: { 金: 80, 木: 50, 水: 60, 火: 75, 土: 80 },
		};

		return compatibilityMatrix[element1]?.[element2] || 65;
	}

	static getRelationshipAdvice(userElement, partnerElement, compatibility) {
		if (compatibility >= 80) {
			return "你們的八字非常相配！五行相生，感情會越來越好。建議多溝通，珍惜這段緣分。";
		} else if (compatibility >= 60) {
			return "你們的八字配對不錯，需要互相理解和包容。建議在溝通上多花心思，關係會更穩定。";
		} else {
			return "你們的八字存在一些衝突，但這不代表不能在一起。建議通過風水調整和心態調節來改善關係。";
		}
	}

	// 解釋合婚分析如何運作
	static generateCoupleAnalysisExplanation() {
		return `**💕 合婚配對分析係點樣運作嘅？**

我嘅專業合婚分析會幫你了解兩個人嘅感情配對度，包括：

**🔮 八字五行分析**
• 根據雙方出生年月日，計算各自嘅五行屬性
• 分析兩人五行係相生、相剋還係相和
• 評估整體合配度百分比

**💖 感情運勢預測**
• 分析感情發展嘅最佳時機
• 預測可能遇到嘅感情挑戰
• 提供增進感情嘅具體建議

**🏠 風水調整方案**
• 為你們嘅居住環境提供風水建議
• 推薦適合嘅風水擺設和顏色搭配
• 化解感情障礙嘅風水方法

**📊 詳細分析報告**
基本分析免費提供，詳細報告會包含：
• 完整八字合婚圖表
• 個人化感情建議
• 未來一年感情運勢
• 專業風水調整方案

想開始合婚分析嗎？我需要你同伴侶嘅出生年月日。`;
	}

	// 感情特質分析
	static getElementLoveTraits(element) {
		const traits = {
			金: "堅定專一，對愛情有著明確的標準。一旦認定對方，會全心全意付出，但有時過於理性，需要學會表達溫柔",
			木: "溫柔體貼，富有包容心。在愛情中善於照顧對方，但有時會因為太過遷就而失去自我，需要保持適當的堅持",
			水: "感情豐富，直覺敏銳。能夠深度理解伴侶的內心世界，但情緒變化較大，需要學會穩定自己的情感狀態",
			火: "熱情奔放，愛憎分明。在感情中充滿激情和活力，但有時過於衝動，需要學會冷靜思考和耐心等待",
			土: "忠誠可靠，重視承諾。在愛情中能給予對方強烈的安全感，但有時過於固執，需要學會變通和適應",
		};
		return traits[element] || "在感情中有著獨特的魅力";
	}

	// 感情挑戰分析
	static getElementLoveChallenges(element) {
		const challenges = {
			金: "過於理性而忽略感性需求",
			木: "太過遷就而失去個人立場",
			水: "情緒波動影響關係穩定",
			火: "衝動行事而忽略後果",
			土: "固執己見而缺乏變通",
		};
		return challenges[element] || "在感情表達上需要改進";
	}

	// 🎯 檢測用戶是否表現出深入興趣（新增）
	static detectDeepInterest(message, conversationHistory = []) {
		// 檢測表達全面興趣的關鍵詞
		const deepInterestKeywords = [
			"所有",
			"全部",
			"詳細",
			"更多",
			"完整",
			"深入",
			"具體",
			"詳細一點",
			"詳細啲",
			"更詳細",
			"全面",
			"徹底",
			"完全",
			"every",
			"all",
			"detail",
			"more",
			"complete",
		];

		// 檢測表達迫切需要的詞語
		const urgencyKeywords = [
			"需要",
			"想要",
			"必須",
			"一定要",
			"馬上",
			"立即",
			"急需",
			"迫切",
			"想知道",
			"想了解",
			"希望",
		];

		// 檢測持續關注的模式
		const continuousInterest = [
			"還有呢",
			"仲有咩",
			"然後呢",
			"跟住呢",
			"接下來",
			"下一步",
			"that's it",
			"what else",
			"anything else",
			"more tips",
		];

		const hasDeepInterest = deepInterestKeywords.some((keyword) =>
			message.includes(keyword)
		);

		const hasUrgency = urgencyKeywords.some((keyword) =>
			message.includes(keyword)
		);

		const hasContinuousInterest = continuousInterest.some((phrase) =>
			message.includes(phrase)
		);

		// 檢查對話歷史中是否已經多次詢問相關問題
		const conversationTurns = conversationHistory.length;
		const hasMultipleQuestions = conversationTurns >= 3; // 3輪對話以上

		return {
			hasDeepInterest,
			hasUrgency,
			hasContinuousInterest,
			hasMultipleQuestions,
			shouldPromotePersonalAnalysis:
				hasDeepInterest ||
				(hasUrgency && hasContinuousInterest) ||
				hasMultipleQuestions,
		};
	}

	// 🎯 生成個人分析推薦回應（新增）
	static generatePersonalAnalysisPromotion(concern, userMessage) {
		const promotionTemplates = {
			財運: {
				intro: "我了解你對財運改善很有興趣！💰",
				explanation:
					"不過每個人的財運格局都不同，同樣的風水布局對不同八字的人效果會差很多。",
				value:
					"如果你提供出生日期，我可以根據你的個人八字進行精準分析：\n" +
					"• 你的天生財運格局和特質\n" +
					"• 最適合你的催財風水方案\n" +
					"• 你的財運高峰期和注意時機\n" +
					"• 個人化的招財建議和方法",
				cta: "這樣的個人化分析會比一般建議更有效果。你想試試嗎？",
			},
			工作: {
				intro: "我感受到你對工作發展很重視！💼",
				explanation:
					"每個人的事業運走向都不同，需要根據個人八字來看最適合的發展方向。",
				value:
					"如果你提供出生日期，我可以為你分析：\n" +
					"• 你的事業運勢和職場性格\n" +
					"• 最適合你的工作方向和發展時機\n" +
					"• 提升工作運的風水布局\n" +
					"• 化解職場困難的具體方法",
				cta: "這樣的分析能幫你找到最適合的事業發展路徑。想了解嗎？",
			},
			感情: {
				intro: "看得出你對感情很用心！💕",
				explanation:
					"感情運勢跟個人八字和桃花運密切相關，需要個人化分析才能給出精準建議。",
				value:
					"如果你提供出生日期，我可以為你分析：\n" +
					"• 你的桃花運勢和感情特質\n" +
					"• 最佳的脫單時機和感情發展期\n" +
					"• 提升桃花運的風水方法\n" +
					"• 適合你的伴侶類型和相處模式",
				cta: "個人化的感情分析會比一般建議更有針對性。你有興趣嗎？",
			},
			健康: {
				intro: "健康確實是最重要的財富！🏥",
				explanation:
					"每個人的體質和健康運勢都不同，需要根據個人八字來制定養生方案。",
				value:
					"如果你提供出生日期，我可以為你分析：\n" +
					"• 你的體質特點和健康運勢\n" +
					"• 最適合你的養生方法和注意事項\n" +
					"• 促進健康的風水布局\n" +
					"• 預防疾病的個人化建議",
				cta: "個人化的健康分析能幫你制定最適合的養生計劃。想試試嗎？",
			},
		};

		const template = promotionTemplates[concern] || {
			intro: `我看得出你對${concern}很關心！`,
			explanation:
				"每個人的運勢格局都不同，需要根據個人八字來提供精準建議。",
			value: `如果你提供出生日期，我可以為你進行個人化的${concern}分析，包括運勢走向、改善方法和最佳時機。`,
			cta: "個人化分析會比一般建議更有效果。你有興趣嗎？",
		};

		return `${template.intro}\n\n${template.explanation}\n\n${template.value}\n\n${template.cta}`;
	}
}
