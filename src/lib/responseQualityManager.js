// 🎯 Smart-Chat3 Response Quality Manager
// Phase 1 Implementation - Advanced response quality with templates

class ResponseQualityManager {
	constructor() {
		this.responseTemplates = {
			// Topic detection responses with confidence levels
			topicDetected: {
				high_confidence: [
					"很好！我清楚理解你想了解{topic}方面的問題。✨",
					"明白了！{topic}確實是你關心的重點。讓我為你詳細分析～",
					"太好了！{topic}方面的諮詢是我的專長。😊",
					"完全理解！{topic}是很重要的人生領域，我來幫你分析。🎯",
				],
				medium_confidence: [
					"根據我的分析，你應該是想了解{topic}方面的問題，對嗎？",
					"我理解你的關注點是{topic}，讓我為你分析一下～",
					"從你的描述來看，{topic}是你的主要關切？",
					"我感覺你想諮詢{topic}相關的問題，我來為你解析。",
				],
				low_confidence: [
					"我想確認一下，你是否想了解{topic}方面的問題？",
					"為了給你最準確的分析，請問你是想諮詢{topic}相關的事情嗎？",
					"我需要確認一下你的主要關注點，是關於{topic}嗎？",
					"讓我確認理解正確，你想詢問的是{topic}方面的問題？",
				],
			},

			// Information collection responses with different approaches
			needMoreInfo: {
				birthday: [
					"為了給你更準確的{topic}分析，我需要你的生日資料。📅",
					"想為你做專業的{topic}分析，可以提供你的出生日期嗎？",
					"生日資料能幫我為你做更精準的{topic}運勢分析～",
					"有了你的生日資訊，我就能為你做詳細的{topic}命理分析！",
				],
				relationship_status: [
					"想了解你的{topic}狀況，可以告訴我你目前的感情狀態嗎？💕",
					"為了給你適合的{topic}建議，想了解一下你的關係狀況。",
					"你目前是單身還是有伴侶呢？這樣我能給你更貼切的{topic}分析。",
					"感情狀況會影響{topic}分析的方向，方便分享一下嗎？",
				],
				specific_concern: [
					"能更具體說說你在{topic}方面遇到的困擾嗎？🤔",
					"想深入了解你的{topic}問題，可以詳細描述一下嗎？",
					"為了給你最有幫助的{topic}建議，可以說說具體的情況？",
					"告訴我更多關於{topic}的細節，我能提供更精準的分析。",
				],
			},

			// Transitioning between topics with context awareness
			transitioning: {
				smooth: [
					"從{previousTopic}到{newTopic}，讓我為你做全面分析！✨",
					"我們從{previousTopic}延伸到{newTopic}的討論～",
					"結合{previousTopic}的分析，{newTopic}也是重要考量。",
					"很好！{previousTopic}和{newTopic}確實有關聯，我一併為你分析。",
				],
				clarifying: [
					"我理解你從{previousTopic}轉向關注{newTopic}，",
					"明白你想從{previousTopic}轉換到{newTopic}的分析，",
					"好的，我們將焦點從{previousTopic}轉到{newTopic}上。",
					"收到！讓我們把重點從{previousTopic}移到{newTopic}。",
				],
			},

			// Confidence-based response starters
			confidence: {
				high: [
					"我很確信這是你關心的重點，",
					"根據你的描述，我有把握這是主要問題，",
					"從專業角度來看，這確實是關鍵所在，",
					"我完全理解你的關注焦點，",
				],
				medium: [
					"根據我的分析，這應該是你的主要關注，",
					"從你的話語中，我理解這是重要議題，",
					"結合你的情況，這很可能是核心問題，",
					"我覺得這是你想要了解的重點，",
				],
				low: [
					"我想確認一下，你是否想了解",
					"為了給你最準確的建議，想確認你的意思是",
					"請讓我確認理解正確，你想詢問的是",
					"讓我再確認一下，你關心的是否是",
				],
			},

			// Error handling responses with graceful degradation
			error_handling: {
				ai_service_down: [
					"AI分析暫時不可用，讓我用傳統風水方式幫你分析。🔧",
					"系統正在調整中，我先為你提供基礎的風水建議。",
					"技術更新中，讓我用經驗為你做初步分析。",
					"分析服務重啟中，我用備用方案為你解答。",
				],
				low_confidence: [
					"我需要更多資訊來確保分析的準確性。🎯",
					"為了給你最好的建議，請提供更多詳細資料。",
					"想為你做更精準的分析，可以補充一些資訊嗎？",
					"多一些細節能幫我給你更準確的風水建議。",
				],
				ambiguous_input: [
					"讓我確認一下你的意思，🤔",
					"為了避免誤解，我想確認你指的是",
					"請幫我澄清一下，你想了解的是",
					"讓我重新理解你的問題，你是想問",
				],
				data_error: [
					"我來重新整理一下資料，📊",
					"讓我重新分析你的資訊，",
					"我需要重新確認一下數據，",
					"資料處理出現問題，讓我重新來。",
				],
				network_error: [
					"網路連線不穩定，我正在重新連接... 🌐",
					"連線中斷了，讓我重新建立連接。",
					"網路問題導致延遲，請稍等片刻。",
					"系統連線重建中，馬上為你恢復服務。",
				],
			},

			// Encouragement and support responses
			encouragement: [
				"不用擔心，風水問題都有解決方案的！💪",
				"相信經過調整，情況會改善的！✨",
				"每個問題都是改善的機會！🌟",
				"我會陪你一步步找到最佳方案。😊",
			],
		};

		// 語調適配器 - 根據用戶語調調整回應風格
		this.toneAdapters = {
			formal: {
				greeting: "你好，我來為你分析",
				transition: "讓我為你詳細說明",
				question: "請問你想了解",
				conclusion: "根據分析結果，建議你",
				politeness: "請問",
			},
			casual: {
				greeting: "哈囉～讓小鈴幫你看看",
				transition: "來來來，我們聊聊",
				question: "想知道你比較關心",
				conclusion: "我覺得你可以試試",
				politeness: "",
			},
			emotional: {
				greeting: "我理解你的感受，讓我們一起面對",
				transition: "我會陪你一步步分析",
				question: "可以跟我說說你的感受嗎",
				conclusion: "相信經過調整，情況會改善的",
				politeness: "如果方便的話",
			},
			urgent: {
				greeting: "我感受到你的急迫，馬上為你處理",
				transition: "讓我快速為你分析重點",
				question: "最迫切需要解決的是",
				conclusion: "建議你立即採取以下行動",
				politeness: "需要你",
			},
			confused: {
				greeting: "我來幫你理清思路",
				transition: "讓我們一步步來分析",
				question: "我們先從最重要的開始",
				conclusion: "整理一下重點建議",
				politeness: "可以先",
			},
		};

		// 情感關鍵字檢測
		this.emotionalKeywords = {
			urgent: [
				"急",
				"緊急",
				"馬上",
				"立刻",
				"快",
				"趕緊",
				"來不及",
				"deadline",
			],
			worried: ["擔心", "煩惱", "困擾", "焦慮", "不安", "害怕", "緊張"],
			hopeful: ["希望", "期待", "想要", "渴望", "盼望", "期盼", "祈求"],
			confused: ["不知道", "困惑", "不確定", "搞不清楚", "迷茫", "糊塗"],
			sad: ["難過", "傷心", "痛苦", "沮喪", "失落", "絕望", "心痛"],
			formal: ["你", "請問", "麻煩", "勞煩", "打擾", "冒昧"],
		};
	}

	// 檢測用戶語調和情感狀態
	detectUserTone(message, emotionalContext = {}) {
		// 檢測正式語言模式
		if (
			this.emotionalKeywords.formal.some((keyword) =>
				message.includes(keyword)
			)
		) {
			return "formal";
		}

		// 檢測情感困擾
		if (
			this.emotionalKeywords.worried.some((keyword) =>
				message.includes(keyword)
			) ||
			this.emotionalKeywords.sad.some((keyword) =>
				message.includes(keyword)
			)
		) {
			return "emotional";
		}

		// 檢測緊急性
		if (
			this.emotionalKeywords.urgent.some((keyword) =>
				message.includes(keyword)
			)
		) {
			return "urgent";
		}

		// 檢測困惑狀態
		if (
			this.emotionalKeywords.confused.some((keyword) =>
				message.includes(keyword)
			)
		) {
			return "confused";
		}

		// 預設為親切隨和
		return "casual";
	}

	// 生成基於模板和信心度的回應
	generateResponse(
		templateType,
		templateKey,
		variables = {},
		confidence = "medium"
	) {
		const templates = this.responseTemplates[templateType]?.[templateKey];
		if (!templates) return "";

		let templateArray;
		if (confidence && templates[confidence]) {
			templateArray = templates[confidence];
		} else {
			templateArray = Array.isArray(templates) ? templates : [templates];
		}

		const template =
			templateArray[Math.floor(Math.random() * templateArray.length)];

		// 替換模板中的變數
		let response = template;
		for (const [key, value] of Object.entries(variables)) {
			response = response.replace(new RegExp(`{${key}}`, "g"), value);
		}

		return response;
	}

	// 根據用戶輸入適配語調
	adaptToneToUser(userMessage, emotionalContext = {}) {
		const detectedTone = this.detectUserTone(userMessage, emotionalContext);
		return this.toneAdapters[detectedTone] || this.toneAdapters.casual;
	}

	// 生成高品質完整回應
	generateQualityResponse(context) {
		const {
			messageType, // topicDetected, needMoreInfo, transitioning, etc.
			subType, // specific template key
			variables = {}, // template variables
			confidence = "medium", // high, medium, low
			userMessage,
			emotionalContext = {},
			conversationHistory = [],
		} = context;

		// 適配語調
		const toneAdapter = this.adaptToneToUser(userMessage, emotionalContext);

		// 生成基礎回應
		let response = this.generateResponse(
			messageType,
			subType,
			variables,
			confidence
		);

		// 如果是高信心度的主題檢測，添加語調適配的開場
		if (messageType === "topicDetected" && confidence === "high") {
			response = `${toneAdapter.greeting}～ ${response}`;
		}

		// 根據信心度添加信心標記
		if (confidence !== "high") {
			const confidencePhrase = this.generateResponse(
				"confidence",
				confidence,
				{}
			);
			if (confidencePhrase) {
				response = `${confidencePhrase}${response}`;
			}
		}

		// 為情感困擾的用戶添加鼓勵
		if (
			toneAdapter === this.toneAdapters.emotional &&
			Math.random() > 0.7
		) {
			const encouragement =
				this.responseTemplates.encouragement[
					Math.floor(
						Math.random() *
							this.responseTemplates.encouragement.length
					)
				];
			response += `\n\n${encouragement}`;
		}

		return response;
	}

	// 回應品質驗證
	validateResponseQuality(response, context) {
		const validationChecks = {
			hasEmoji: /[✨😊🌸💰🔮🏠👥💼🌿👶🎯💕🤔📅💪🌟🔧📊🌐]/.test(response),
			hasPersonalization:
				response.includes("你") || response.includes("你"),
			appropriateLength: response.length > 15 && response.length < 800,
			hasClearAction:
				response.includes("分析") ||
				response.includes("建議") ||
				response.includes("了解") ||
				response.includes("確認"),
			matchesTone: this.checkToneConsistency(response, context),
			hasEncouragement:
				context.userMessage &&
				this.emotionalKeywords.worried.some((k) =>
					context.userMessage.includes(k)
				)
					? response.includes("不用擔心") ||
						response.includes("會改善") ||
						response.includes("💪")
					: true,
			noRepetition: !this.hasExcessiveRepetition(response),
			professionalQuality: this.checkProfessionalQuality(response),
		};

		const score =
			Object.values(validationChecks).filter(Boolean).length /
			Object.keys(validationChecks).length;

		return {
			score: score,
			passed: score >= 0.75, // 提高品質門檻
			checks: validationChecks,
			suggestions: this.generateImprovementSuggestions(validationChecks),
			confidence: this.calculateConfidence(score, context),
		};
	}

	// 檢查語調一致性
	checkToneConsistency(response, context) {
		const detectedTone = this.detectUserTone(context.userMessage || "");
		const adapter = this.toneAdapters[detectedTone];

		if (detectedTone === "formal") {
			return response.includes("你") || response.includes("請問");
		}
		if (detectedTone === "emotional") {
			return (
				response.includes("理解") ||
				response.includes("陪你") ||
				/[💪✨🌟]/.test(response)
			);
		}
		if (detectedTone === "urgent") {
			return (
				response.includes("馬上") ||
				response.includes("立即") ||
				response.includes("快速")
			);
		}

		return true; // 休閒語調較寬鬆
	}

	// 檢查是否有過度重複
	hasExcessiveRepetition(response) {
		const words = response.split(/[\s，。！？、]+/);
		const wordCount = {};

		for (const word of words) {
			if (word.length > 1) {
				wordCount[word] = (wordCount[word] || 0) + 1;
			}
		}

		// 檢查是否有詞語重複超過3次
		return Object.values(wordCount).some((count) => count > 3);
	}

	// 檢查專業品質
	checkProfessionalQuality(response) {
		// 檢查是否包含專業術語或建議
		const professionalTerms = [
			"風水",
			"命理",
			"運勢",
			"分析",
			"建議",
			"調整",
			"改善",
		];
		const hasProfessionalTerms = professionalTerms.some((term) =>
			response.includes(term)
		);

		// 檢查是否有明確的服務導向
		const hasServiceOrientation =
			response.includes("為你") ||
			response.includes("幫你") ||
			response.includes("讓我") ||
			response.includes("我來");

		return hasProfessionalTerms && hasServiceOrientation;
	}

	// 計算回應信心度
	calculateConfidence(qualityScore, context) {
		let confidence = "medium";

		if (qualityScore >= 0.9) confidence = "high";
		else if (qualityScore < 0.6) confidence = "low";

		// 根據上下文調整信心度
		if (context.conversationHistory?.length > 3) {
			// 長對話中信心度稍微提高
			if (confidence === "medium") confidence = "high";
		}

		return confidence;
	}

	// 生成改進建議
	generateImprovementSuggestions(checks) {
		const suggestions = [];

		if (!checks.hasEmoji) suggestions.push("添加適當的表情符號增加親和力");
		if (!checks.hasPersonalization) suggestions.push("使用更個人化的稱呼");
		if (!checks.appropriateLength) suggestions.push("調整回應長度");
		if (!checks.hasClearAction) suggestions.push("明確說明下一步行動");
		if (!checks.matchesTone) suggestions.push("調整語調以匹配用戶風格");
		if (!checks.hasEncouragement) suggestions.push("為困擾的用戶添加鼓勵");
		if (!checks.noRepetition) suggestions.push("減少重複詞語");
		if (!checks.professionalQuality) suggestions.push("增加專業風水術語");

		return suggestions;
	}

	// 緊急修復回應品質
	repairResponse(response, validationResult, context) {
		let repairedResponse = response;

		// 修復缺少表情符號
		if (!validationResult.checks.hasEmoji) {
			const emojis = ["✨", "😊", "🌟"];
			const randomEmoji =
				emojis[Math.floor(Math.random() * emojis.length)];
			repairedResponse += ` ${randomEmoji}`;
		}

		// 修復缺少個人化稱呼
		if (!validationResult.checks.hasPersonalization) {
			repairedResponse = repairedResponse.replace(/我來/, "我來為你");
		}

		// 修復語調不匹配
		if (!validationResult.checks.matchesTone) {
			const tone = this.detectUserTone(context.userMessage || "");
			const adapter = this.toneAdapters[tone];

			if (tone === "formal" && !repairedResponse.includes("你")) {
				repairedResponse = repairedResponse.replace(/您/g, "你");
			}
		}

		return repairedResponse;
	}
}

export default ResponseQualityManager;
