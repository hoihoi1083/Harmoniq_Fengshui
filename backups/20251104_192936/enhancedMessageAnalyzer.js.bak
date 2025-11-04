// 🤖 增強版智能消息分析器
// Enhanced Intelligent Message Analyzer for Smart-Chat2

class EnhancedMessageAnalyzer {
	constructor() {
		this.baziElements = {
			tianGan: [
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
			],
			diZhi: [
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
			],
		};

		this.fengShuiTerms = {
			十神: {
				explanation:
					"十神是八字命理的核心概念，以出生日的天干為中心，分析其他天干的關係。包括比肩、劫財、食神、傷官、正財、偏財、正官、偏官、正印、偏印十種關係，代表不同的人生面向和性格特質。",
				relevantServices: [
					"個人命理分析",
					"性格特質解讀",
					"天賦才能發掘",
				],
			},
			風水: {
				explanation:
					"風水是中國古代的空間佈局學，通過調整居住和工作環境的佈局、方位、色彩等要素，來改善人的運勢和生活品質。核心理念是讓人與環境和諧共處，引導正能量流動。",
				relevantServices: [
					"居家風水佈局",
					"辦公室風水調整",
					"商店風水規劃",
				],
			},
			吉位: {
				explanation:
					"吉位是指對個人運勢有正面幫助的方位，根據個人八字和流年運勢計算得出。在吉位放置重要物品、安排睡床或辦公桌，可以增強個人的整體運勢和特定領域的能量。",
				relevantServices: [
					"個人吉位測算",
					"家居吉位佈局",
					"辦公吉位規劃",
				],
			},
			流年: {
				explanation:
					"流年是指每一年的運勢變化，根據天干地支的年份與個人八字的相互作用來預測。流年運勢會影響感情、事業、財運、健康等各方面，了解流年有助於把握時機、趨吉避凶。",
				relevantServices: [
					"年度運勢預測",
					"重要時機把握",
					"趨吉避凶指導",
				],
			},
			八字: {
				explanation:
					"八字又稱四柱，是根據出生年、月、日、時的天干地支組合而成的命理系統。通過分析八字可以了解個人的性格特質、運勢走向、適合的發展方向等，是中華傳統命理學的核心。",
				relevantServices: [
					"完整八字解析",
					"性格特質分析",
					"人生規劃建議",
				],
			},
			食神: {
				explanation:
					"食神是十神之一，代表才華展現、創意表達和子女福澤。食神旺的人通常具有藝術天分、表達能力強，適合從事創作、表演或教育工作。在財運上，食神能生財，是間接求財的象徵。",
				relevantServices: ["才華分析", "事業方向指導", "子女運勢"],
			},
			五行: {
				explanation:
					"五行包括金、木、水、火、土五種基本元素，代表不同的能量特質。五行相生相剋的原理用於分析個人命理特徵，也用於風水佈局，通過平衡五行能量來改善運勢。",
				relevantServices: [
					"五行平衡調理",
					"個人五行分析",
					"五行風水佈局",
				],
			},
			桃花運: {
				explanation:
					"桃花運是指感情運勢，包括異性緣分、戀愛機會、婚姻運勢等。桃花運的好壞會影響個人的感情生活，通過命理分析和風水調整可以增強桃花運，改善感情狀況。",
				relevantServices: [
					"感情運勢分析",
					"桃花運提升",
					"合婚配對分析",
				],
			},
			貴人: {
				explanation:
					"貴人是指在人生路上能夠給予幫助、指導或機會的重要人物。貴人運的強弱影響事業發展和人際關係，通過了解自己的貴人方位和時機，可以更好地把握人生機遇。",
				relevantServices: [
					"貴人運分析",
					"人際關係改善",
					"事業發展指導",
				],
			},
		};
	}

	// 主要分析函數
	async analyzeMessage(message) {
		console.log("🔍 Enhanced Analyzer 開始分析:", message);

		// 0. 優先檢測情緒危機或嚴重負面情緒
		const emotionalCrisis = this.detectEmotionalCrisis(message);
		if (emotionalCrisis.isCrisis) {
			console.log("⚠️ 檢測到情緒危機，優先處理");
			return this.handleEmotionalCrisis(emotionalCrisis, message);
		}

		// 1. 檢測八字格式輸入
		const baziAnalysis = this.detectBaziInput(message);
		if (baziAnalysis.isBazi) {
			console.log("✅ 檢測到八字輸入");
			return await this.handleBaziInput(baziAnalysis, message);
		}

		// 2. 檢測問題+生日組合
		const contextualAnalysis = this.detectContextualInput(message);
		if (contextualAnalysis.hasContext) {
			console.log("✅ 檢測到情境輸入");
			return await this.handleContextualInput(
				contextualAnalysis,
				message
			);
		}

		// 2.5 檢測純生日輸入
		const birthdayOnlyAnalysis = this.detectBirthdayOnly(message);
		if (birthdayOnlyAnalysis.isBirthdayOnly) {
			console.log("✅ 檢測到生日輸入");
			return this.handleBirthdayOnlyInput(birthdayOnlyAnalysis, message);
		}

		// 2.6 檢測問候語和閒聊
		const greetingAnalysis = this.detectGreeting(message);
		if (greetingAnalysis.isGreeting) {
			console.log("✅ 檢測到問候語/閒聊");
			return this.handleGreeting(greetingAnalysis, message);
		}

		// 3. 檢測風水術語詢問
		const knowledgeQuery = this.detectKnowledgeQuery(message);
		if (knowledgeQuery.isKnowledgeQuery) {
			console.log("✅ 檢測到知識詢問");
			return this.handleKnowledgeQuery(knowledgeQuery, message);
		}

		// 4. 檢測專業諮詢問題
		const professionalQuery = this.detectProfessionalQuery(message);
		if (professionalQuery.isProfessional) {
			console.log("✅ 檢測到專業諮詢");
			return this.handleProfessionalQuery(professionalQuery, message);
		}

		// 5. 回退到常規AI分析
		console.log("⚡ 使用常規AI分析");
		return {
			analysisType: "general_ai",
			isEnhanced: false,
			requiresAIAnalysis: true,
		};
	}

	// 檢測八字格式輸入
	detectBaziInput(message) {
		// 匹配八字格式：庚午 己辰 庚午 戊辰
		const baziPattern =
			/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/;

		const match = message.match(baziPattern);
		if (match) {
			// 檢測是否包含分析領域
			const concernKeywords = {
				財運: ["財運", "賺錢", "投資", "理財", "收入", "金錢"],
				感情: ["感情", "愛情", "桃花", "戀愛", "婚姻", "配偶"],
				工作: ["工作", "事業", "職業", "升職", "跳槽", "創業"],
				健康: ["健康", "身體", "疾病", "養生", "調理"],
				人際關係: ["人際", "朋友", "貴人", "小人", "關係"],
				子女: ["子女", "孩子", "小孩", "生育", "懷孕"],
			};

			let detectedConcern = "綜合運勢";
			for (const [concern, keywords] of Object.entries(concernKeywords)) {
				if (keywords.some((keyword) => message.includes(keyword))) {
					detectedConcern = concern;
					break;
				}
			}

			return {
				isBazi: true,
				baziString: match[0],
				pillars: {
					year: match[1],
					month: match[2],
					day: match[3],
					hour: match[4],
				},
				concern: detectedConcern,
				originalMessage: message,
			};
		}

		return { isBazi: false };
	}

	// 檢測情緒危機或嚴重負面情緒
	detectEmotionalCrisis(message) {
		const crisisKeywords = [
			"沒希望",
			"絕望",
			"想死",
			"活不下去",
			"痛苦",
			"崩潰",
			"受不了",
			"太累了",
			"放棄",
			"無助",
			"孤獨",
			"沒意思",
			"沒意義",
			"空虛",
			"失落",
			"抑鬱",
		];

		const severityLevels = {
			high: ["想死", "活不下去", "絕望"],
			medium: ["沒希望", "崩潰", "受不了", "放棄"],
			low: ["痛苦", "太累了", "無助", "孤獨", "失落"],
		};

		for (const keyword of crisisKeywords) {
			if (message.includes(keyword)) {
				let severity = "low";
				if (severityLevels.high.includes(keyword)) severity = "high";
				else if (severityLevels.medium.includes(keyword))
					severity = "medium";

				return {
					isCrisis: true,
					severity: severity,
					triggerKeyword: keyword,
					originalMessage: message,
				};
			}
		}

		return { isCrisis: false };
	}

	// 處理情緒危機
	handleEmotionalCrisis(analysis, originalMessage) {
		const { severity, triggerKeyword } = analysis;

		let response = "";
		let topic = "工作"; // 情緒危機映射到工作（因為移除了因緣）

		if (severity === "high") {
			response = `我能感受到你現在很痛苦😔 這種感覺真的很不容易...

請記住，人生中最黑暗的時刻往往也是轉機的開始。每個人都會遇到低潮期，這不代表你不夠好，而是生命在為你準備新的開始。

🌟 **從命理角度來說：**
人生有起有落是自然規律，就像月圓月缺、四季輪替。現在的困難可能正是你人生重要轉捩點的前兆。

💫 **建議你：**
• 先好好休息，給自己一些時間
• 找信任的朋友或家人聊聊
• 如果需要，尋求專業心理協助

如果你願意，也可以告訴我你的生日，我幫你看看接下來的運勢走向，或許能給你一些希望和方向。

你並不孤單，我會陪伴你度過這段艱難時期 💙`;
		} else if (severity === "medium") {
			response = `聽到你說${triggerKeyword}，我很心疼你現在的狀況😌

每個人都會有感覺撞牆的時候，這種感受很真實也很正常。但請相信，困境是暫時的，人生總會有轉機。

🌅 **從風水命理的角度：**
困頓期往往是能量轉換的過程，就像黎明前的黑暗。這段時間雖然辛苦，但也在為接下來的好運積蓄能量。

💝 **給你一些溫暖的建議：**
• 允許自己感受這些情緒，但不要被困住
• 嘗試做一些讓你感到平靜的事情
• 回想一下過去克服困難的經歷

如果你想了解未來的運勢走向，可以提供生日讓我幫你分析。有時候知道「好事即將到來」就能給我們繼續前進的力量。

我會陪著你一起面對 🌸`;
		} else {
			response = `感受到你現在的心情有些低落💙 生活中遇到挫折和困擾是很正常的，你願意表達出來已經很勇敢了。

每個人的人生都有高低起伏，就像自然界的潮汐變化。現在的困難不會永遠持續下去。

🌟 **一些溫暖提醒：**
• 給自己一些耐心和寬容
• 困難往往是成長的機會
• 相信自己有度過難關的能力

如果你想從命理角度了解目前的狀況和未來的發展，可以告訴我你的生日。有時候了解運勢走向能幫助我們更有信心面對挑戰。

記住，你比想像中更堅強 ✨`;
		}

		return {
			analysisType: "emotional_support",
			isEnhanced: true,
			requiresAIAnalysis: false,
			response: response,
			isWithinScope: true,
			detectedTopic: topic,
			specificProblem: `情緒支持 - ${triggerKeyword}`,
			confidence: 0.95,
			emotionalCrisis: analysis,
			needsGentleApproach: true,
		};
	}
	detectBirthdayOnly(message) {
		const birthdayPattern =
			/(\d{4})[\/\-年]\s*(\d{1,2})[\/\-月]\s*(\d{1,2})[日號]?/;
		const match = message.match(birthdayPattern);

		if (match) {
			// 檢查是否包含明確問題描述（排除問題+生日組合）
			const problemKeywords = [
				"工作",
				"感情",
				"財運",
				"健康",
				"事業",
				"愛情",
				"金錢",
				"失業",
				"分手",
				"問題",
				"困擾",
				"沒了",
				"不順",
			];
			const hasExplicitProblem = problemKeywords.some((keyword) =>
				message.includes(keyword)
			);

			if (!hasExplicitProblem) {
				return {
					isBirthdayOnly: true,
					year: match[1],
					month: match[2],
					day: match[3],
					birthday: `${match[1]}/${match[2]}/${match[3]}`,
				};
			}
		}

		return { isBirthdayOnly: false };
	}

	// 處理純生日輸入
	handleBirthdayOnlyInput(analysis, originalMessage) {
		return {
			analysisType: "birthday_analysis",
			isEnhanced: true,
			requiresAIAnalysis: true, // 改為使用AI生成完整分析
			isWithinScope: true,
			detectedTopic: "命理",
			specificProblem: "一般命理分析",
			confidence: 0.95,
			userContext: {
				birthday: analysis.birthday,
				hasBasicInfo: true,
			},
			birthdayData: analysis,
			needsGeneralAnalysis: true,
		};
	}

	// 檢測問候語和閒聊
	detectGreeting(message) {
		const greetingPatterns = [
			// 直接問候
			/^(你好|你好|hi|hello|嗨|hey)/i,
			// 稱呼問候
			/^(你好|你好|嗨|哈囉)[，,]?\s*(風鈴|老師|大師|師傅)/i,
			// 客套話
			/^(早安|午安|晚安|早上好|下午好|晚上好)/i,
			// 感謝用語
			/^(謝謝|感謝|多謝)/i,
			// 寒暄
			/^(最近好嗎|近來如何|怎麼樣)/i,
		];

		// 檢查是否匹配問候語模式
		for (const pattern of greetingPatterns) {
			if (pattern.test(message)) {
				return {
					isGreeting: true,
					greetingType: "direct",
					originalMessage: message,
				};
			}
		}

		// 檢測簡短的閒聊或社交互動
		if (message.length <= 20) {
			const casualPatterns = [
				/在嗎/,
				/在線嗎/,
				/有空嗎/,
				/可以聊嗎/,
				/忙嗎/,
				/睡了嗎/,
				/^^$/, // 表情符號
			];

			for (const pattern of casualPatterns) {
				if (pattern.test(message)) {
					return {
						isGreeting: true,
						greetingType: "casual",
						originalMessage: message,
					};
				}
			}
		}

		return { isGreeting: false };
	}

	// 處理問候語
	handleGreeting(analysis, originalMessage) {
		const responses = {
			direct: [
				`你好呀～我是風鈴！✨ 很高興認識你！

我是解難專家，可以幫你分析人生各方面的問題和運勢。無論你在感情、工作、財運或健康方面遇到什麼問題，我都很樂意為你提供分析和建議！

你現在有什麼特別想了解的問題嗎？還是想先看看我能提供哪些服務呢？

我可以為你分析以下領域的風水運勢：

🌸 **感情** - 桃花運、姻緣配對
💼 **工作** - 事業發展、職場運勢
💰 **財運** - 投資理財、收入提升
🌿 **健康** - 身心調理、養生建議

你對哪一種有興趣？`,
			],
			casual: [
				`我在呢！✨ 有什麼想了解的風水命理問題嗎？

我可以為你分析以下領域的風水運勢：

🌸 **感情** - 桃花運、姻緣配對
💼 **工作** - 事業發展、職場運勢
💰 **財運** - 投資理財、收入提升
🌿 **健康** - 身心調理、養生建議

你對哪一種有興趣？`,
			],
		};

		const responseType = analysis.greetingType || "direct";
		const responseList = responses[responseType] || responses.direct;
		const response =
			responseList[Math.floor(Math.random() * responseList.length)];

		return {
			analysisType: "greeting",
			isEnhanced: true,
			requiresAIAnalysis: false,
			isWithinScope: true,
			detectedTopic: "問候",
			specificProblem: "閒聊問候",
			confidence: 0.95,
			response: response,
			greetingData: analysis,
		};
	}
	輸入;
	detectContextualInput(message) {
		const patterns = [
			// 問題在前，生日在後：工作沒了，2004/3/5
			/(.+?)[，,]\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			// 生日在前，問題在後：2004/3/5，工作沒了
			/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,]\s*(.+)/,
			// 問題和生日混合：最近感情不順 1995年3月15日
			/(.+?)\s+(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)\s+(.+)/,
		];

		for (const pattern of patterns) {
			const match = message.match(pattern);
			if (match) {
				let problem, birthday;

				// 判斷哪個是問題，哪個是生日
				if (/\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?/.test(match[1])) {
					birthday = match[1];
					problem = match[2];
				} else {
					problem = match[1];
					birthday = match[2];
				}

				// 分析問題類型
				const problemType = this.analyzeProblemType(problem);

				return {
					hasContext: true,
					problem: problem.trim(),
					birthday: birthday.trim(),
					problemType: problemType,
					originalMessage: message,
				};
			}
		}

		return { hasContext: false };
	}

	// 檢測風水術語詢問
	detectKnowledgeQuery(message) {
		// 檢測是否在詢問專業術語 - 只匹配明確的定義性問題
		const queryPatterns = [
			/什麼是(.+?)[\?？]?$/,
			/(.+?)是什麼[\?？]?$/,
			/(.+?)是什麼意思[\?？]?$/,
			/解釋一下(.+?)[\?？]?$/,
			/(.+?)的意思[\?？]?$/,
			/請問(.+?)[\?？]?$/,
			/(.+?)怎麼解釋[\?？]?$/,
			/(.+?)代表什麼[\?？]?$/,
		];

		for (const pattern of queryPatterns) {
			const match = message.match(pattern);
			if (match) {
				const term = match[1].trim();
				if (this.fengShuiTerms[term]) {
					return {
						isKnowledgeQuery: true,
						term: term,
						queryType: "definition",
						originalMessage: message,
					};
				}
			}
		}

		// 移除直接術語檢測 - 避免干擾正常諮詢請求
		// 只有明確的定義性問題才會被視為知識詢問
		// 例如: "我想增桃花運" 是諮詢請求，不是知識詢問
		// 例如: "什麼是桃花運?" 才是知識詢問

		return { isKnowledgeQuery: false };
	}

	// 檢測專業諮詢問題
	detectProfessionalQuery(message) {
		const professionalPatterns = [
			/提供什麼服務/,
			/有什麼服務/,
			/你們的服務/,
			/我們是如何運作/,
			/如何運作/,
			/怎麼運作/,
			/如何收費/,
			/準確率/,
			/可信度/,
			/怎麼算/,
			/報告包含什麼/,
			/需要提供什麼資料/,
			/想了解.*服務/,
			/服務內容/,
			/有哪些服務/,
		];

		for (const pattern of professionalPatterns) {
			if (pattern.test(message)) {
				return {
					isProfessional: true,
					queryType: "service_inquiry",
					originalMessage: message,
				};
			}
		}

		return { isProfessional: false };
	}

	// 分析問題類型
	analyzeProblemType(problem) {
		const problemKeywords = {
			work_problem: [
				"工作沒了",
				"失業",
				"被裁",
				"找不到工作",
				"跳槽失敗",
			],
			relationship_issue: [
				"分手",
				"感情不順",
				"單身",
				"戀愛困難",
				"婚姻問題",
			],
			financial_concern: [
				"沒錢",
				"經濟困難",
				"投資失敗",
				"虧錢",
				"財運差",
			],
			health_worry: ["身體不好", "生病", "健康問題", "體質差"],
			career_confusion: ["不知道做什麼", "迷茫", "方向不明", "職業規劃"],
		};

		for (const [type, keywords] of Object.entries(problemKeywords)) {
			if (keywords.some((keyword) => problem.includes(keyword))) {
				return type;
			}
		}

		return "general_concern";
	}

	// 處理八字輸入
	async handleBaziInput(analysis, originalMessage) {
		const { baziString, pillars, concern } = analysis;

		// 八字輸入應該觸發AI分析，就像生日輸入一樣
		// 將主題映射到有效的數據庫enum值
		const mappedTopic = this.mapTopicToValidEnum(concern);

		return {
			analysisType: "bazi_analysis",
			isEnhanced: true,
			requiresAIAnalysis: true, // 觸發AI分析
			isWithinScope: true,
			detectedTopic: mappedTopic, // 使用映射後的主題
			specificProblem: `八字分析：${concern}`,
			needsGeneralAnalysis: true, // 需要完整分析
			confidence: 0.95,
			baziData: analysis,
			originalBaziString: baziString,
		};
	}

	// 處理情境輸入
	async handleContextualInput(analysis, originalMessage) {
		const { problem, birthday, problemType } = analysis;

		// 生成情境感知回應
		const contextualResponse = this.generateContextualResponse(
			problem,
			birthday,
			problemType
		);

		// 判斷領域
		const detectedTopic = this.mapProblemTypeToTopic(problemType);

		return {
			analysisType: "contextual",
			isEnhanced: true,
			response: contextualResponse,
			isWithinScope: true,
			detectedTopic: detectedTopic,
			specificProblem: problem,
			confidence: 0.9,
			contextData: analysis,
		};
	}

	// 處理知識詢問
	handleKnowledgeQuery(analysis, originalMessage) {
		const { term } = analysis;

		// 返回結構讓AI來分析和回答
		return {
			analysisType: "knowledge_explanation",
			isEnhanced: true,
			requiresAIAnalysis: true, // 改為使用AI分析
			isWithinScope: true,
			detectedTopic: "風水知識",
			specificProblem: `詢問${term}的含義`,
			confidence: 0.95,
			knowledgeQuery: {
				term: term,
				originalMessage: originalMessage,
				isKnowledgeRequest: true,
				requestedExplanation: `請解釋什麼是${term}，不超過200字，要專業但易懂`,
			},
			knowledgeData: analysis,
		};
	}

	// 處理專業諮詢
	handleProfessionalQuery(analysis, originalMessage) {
		const serviceResponse = `🌟 很高興你對我們的服務感興趣！

**我們的專業風水命理分析包含：**

🏠 **風水佈局規劃**
• 居家/辦公空間優化
• 個人化吉位測算
• 開運物品建議

🔮 **個人命理分析**
• 基於生辰八字的深度解析
• 性格特質與天賦發掘
• 人生運勢走向預測

� **專業運勢報告**
針對不同人生領域提供深度分析：
• 🌿 **健康運勢** - 身心調理指導、養生建議
• 💰 **財運分析** - 投資理財時機、收入提升方案  
• 💼 **事業發展** - 職場運勢、升遷轉職建議
• � **感情姻緣** - 桃花運勢、情感發展預測
• 💕 **八字合婚** - 雙方配對分析、關係和諧建議

📊 **運作方式：**
1. 提供基本資料（生日、性別）
2. AI智能初步分析 + 專業命理師覆核
3. 生成個人化詳細報告
4. 提供具體改善建議

**準確率說明：**
我們結合傳統命理學與現代數據分析，準確率達85%以上，特別在性格分析和趨勢預測方面表現優異。

想要開始分析嗎？只需要告訴我你的生日就可以了！✨`;

		return {
			analysisType: "service_explanation",
			isEnhanced: true,
			response: serviceResponse,
			isWithinScope: true,
			detectedTopic: "服務諮詢",
			specificProblem: "了解服務內容",
			confidence: 0.95,
		};
	}

	// 生成八字分析回應
	generateBaziAnalysis(pillars, concern) {
		const { year, month, day, hour } = pillars;

		// 簡單的五行分析（實際應用中會更複雜）
		const elements = this.analyzeBaziElements(pillars);

		let response = `哇！你提供的八字很清楚呢！✨

**你的命盤：**
年柱：${year}  月柱：${month}  日柱：${day}  時柱：${hour}

從你的八字來看：`;

		if (concern === "財運") {
			response += `
💰 **財運特點：**
• 命中${elements.dominant}氣較旺，適合${this.getCareerSuggestion(elements.dominant)}
• 財星${elements.wealth}，${this.getWealthAnalysis(elements)}
• 今年運勢${this.getCurrentYearLuck()}

**具體建議：**
• 投資方向：${this.getInvestmentAdvice(elements)}
• 開運顏色：${this.getLuckyColors(elements)}
• 最佳時機：${this.getBestTiming()}`;
		} else if (concern === "感情") {
			response += `
💕 **感情運勢：**
• 你的桃花位在${this.getPeachBlossomPosition(pillars)}
• 感情模式：${this.getLovePattern(elements)}
• 適合對象：${this.getSuitablePartner(elements)}

**感情建議：**
• 有利時間：${this.getLoveTimings()}
• 開運方位：${this.getLoveDirections()}
• 注意事項：${this.getLoveWarnings(elements)}`;
		} else {
			response += `
🌟 **整體運勢：**
• 命格特點：${this.getPersonalityTraits(elements)}
• 天賦領域：${this.getTalentAreas(elements)}
• 發展建議：${this.getDevelopmentAdvice(elements)}`;
		}

		response += `

想要更詳細的分析和具體改善方案嗎？我可以為你製作完整的${concern}報告，包含：
📈 深度運勢分析
🎯 個人化建議方案
🏠 相關風水佈局
⭐ 重要時機把握

現在就為你準備專業報告嗎？`;

		return response;
	}

	// 生成情境感知回應
	generateContextualResponse(problem, birthday, problemType) {
		const supportMessages = {
			work_problem:
				"失業真的很讓人焦慮呢... 抱抱你！🤗 不過這也許是新機會的開始哦！",
			relationship_issue: "感情的事情總是最讓人牽掛... 我理解你的心情 💜",
			financial_concern:
				"經濟壓力確實很大，不過困難是暫時的！讓我幫你看看轉機在哪裡 💪",
			health_worry: "身體健康最重要，要好好照顧自己呢 🌿",
			general_concern: "聽起來你遇到了一些挑戰，讓風鈴來幫你分析一下！",
		};

		const supportMessage =
			supportMessages[problemType] || supportMessages["general_concern"];

		// 解析生日
		const birthYear = this.extractBirthYear(birthday);
		const zodiacSign = this.getZodiacSign(birthday);
		const age = new Date().getFullYear() - birthYear;

		let response = `${supportMessage}

從你的生日 ${birthday} 來看，你${birthYear}年出生，今年${age}歲`;

		if (zodiacSign) {
			response += `，是${zodiacSign}`;
		}

		response += `，正值人生的重要階段呢！

**根據你的情況分析：**`;

		// 根據問題類型提供針對性建議
		if (problemType === "work_problem") {
			response += `
🌟 你的出生年份顯示你很有適應力和創新精神
🎯 目前這個階段對你來說是轉機年，舊的結束意味著新的開始
💪 適合考慮轉向新興領域或發揮創意才能

**當前建議：**
• 可以考慮線上工作或創意產業
• 近期（未來3個月）是求職的好時機
• 面試時建議穿著穩重色系增加成功率`;
		} else if (problemType === "relationship_issue") {
			response += `
💕 你的命格顯示有著深厚的感情運勢
🌸 雖然現在遇到挫折，但桃花運其實很不錯
✨ 重要的是要先學會愛自己，好的感情才會來

**感情建議：**
• 這段時間適合充實自己，提升內在魅力
• 參加社交活動能帶來新的緣分
• 保持正面心態，好運自然會來`;
		} else {
			response += `
🔮 你的生日顯示這是個重要的轉折期
⭐ 雖然現在有挑戰，但也蘊含著新的機遇
🌈 關鍵是要掌握正確的時機和方法`;
		}

		response += `

想要更詳細的分析和解決方案嗎？告訴我你是男生還是女生，我就能為你做完整的命理分析，找出最適合的改善方法！

風鈴的分析報告會包含：
🎯 問題根源分析
📈 改善時機建議  
🏠 相關風水調整
💫 開運方法指導

讓我來幫你化解困境，迎接好運！✨`;

		return response;
	}

	// 輔助方法們
	analyzeBaziElements(pillars) {
		// 簡化的五行分析，實際會更複雜
		return {
			dominant: "火",
			wealth: "透出",
			balance: "偏旺",
		};
	}

	extractBirthYear(birthday) {
		const match = birthday.match(/(\d{4})/);
		return match ? parseInt(match[1]) : null;
	}

	getZodiacSign(birthday) {
		// 簡化的生肖計算
		const year = this.extractBirthYear(birthday);
		if (!year) return null;

		const zodiacs = [
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
		return zodiacs[(year - 1900) % 12];
	}

	mapProblemTypeToTopic(problemType) {
		const mapping = {
			work_problem: "工作",
			relationship_issue: "感情",
			financial_concern: "工作", // 將財務問題映射到工作（通常是事業相關）
			health_worry: "健康",
			career_confusion: "工作",
			general_concern: "工作", // 一般關切映射到工作
		};

		return mapping[problemType] || "工作";
	}

	// 映射新主題到有效的數據庫enum值
	mapTopicToValidEnum(topic) {
		const topicMapping = {
			風水知識: "風水佈局", // 風水知識映射到風水佈局
			風水佈局: "風水佈局", // 風水佈局保持不變
			服務諮詢: "感情", // 映射到有效的enum值
			綜合運勢: "工作", // 一般運勢映射到工作
			命理: "感情", // 一般命理分析映射到感情
			其他: "感情", // 其他類別映射到感情
			工作: "工作",
			感情: "感情",
			財運: "財運", // 財運相關保持財運分類
			健康: "健康",
			人際關係: "人際關係",
			子女: "子女",
			因緣: "工作", // 移除因緣，映射到工作
		};

		return topicMapping[topic] || "工作"; // 默認映射到工作而非感情
	} // 更多輔助方法（簡化實現）
	getCareerSuggestion(element) {
		return "金融科技相關行業";
	}
	getWealthAnalysis(elements) {
		return "有不錯的賺錢能力，但需注意理財";
	}
	getCurrentYearLuck() {
		return "整體向上，下半年更佳";
	}
	getInvestmentAdvice(elements) {
		return "穩健型投資，避免高風險投機";
	}
	getLuckyColors(elements) {
		return "金色、白色、藍色";
	}
	getBestTiming() {
		return "春秋兩季，上午時段";
	}
	getPeachBlossomPosition(pillars) {
		return "東南方";
	}
	getLovePattern(elements) {
		return "深情專一型，重視精神交流";
	}
	getSuitablePartner(elements) {
		return "溫和穩重、有共同興趣的對象";
	}
	getLoveTimings() {
		return "春季和秋季，特別是3月和9月";
	}
	getLoveDirections() {
		return "東南方和西北方";
	}
	getLoveWarnings(elements) {
		return "避免過於急躁，感情需要時間培養";
	}
	getPersonalityTraits(elements) {
		return "理性務實，有領導才能";
	}
	getTalentAreas(elements) {
		return "分析判斷、計劃執行、團隊協調";
	}
	getDevelopmentAdvice(elements) {
		return "發揮組織能力，適合管理或專業技術路線";
	}
}

// 導出增強分析器
module.exports = EnhancedMessageAnalyzer;
