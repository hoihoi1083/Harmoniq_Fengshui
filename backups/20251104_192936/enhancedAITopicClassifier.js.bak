/**
 * 🚀 Deep Learning Integration Example for Smart-Chat2
 *
 * This shows how to integrate the deep learning enhancer with your existing system
 */

const DeepLearningEnhancer = require("../lib/deepLearningEnhancer");

class EnhancedAITopicClassifier {
	constructor(deepSeekApiKey, deepSeekApiUrl) {
		this.DEEPSEEK_API_KEY = deepSeekApiKey;
		this.DEEPSEEK_API_URL = deepSeekApiUrl;
		this.supportedTopics = [
			"感情",
			"財運",
			"工作",
			"健康",
			"人際關係",
			"子女",
		];

		// Initialize deep learning enhancer
		this.deepLearningEnhancer = new DeepLearningEnhancer();

		console.log("🧠 Deep Learning Enhanced AI Classifier Initialized");
	}

	// 🧠 Enhanced Message Analysis with Deep Learning
	async analyzeMessage(message, conversationContext = []) {
		try {
			console.log("🧠 Starting Deep Learning Enhanced Analysis...");

			// Step 1: Use deep learning pre-analysis
			const deepAnalysis =
				await this.deepLearningEnhancer.enhancedAnalyze(message, {
					conversationHistory: conversationContext,
					timestamp: new Date().toISOString(),
				});

			console.log("🧠 Deep Learning Analysis:", deepAnalysis);

			// Step 2: Enhanced prompt building with deep learning insights
			const enhancedPrompt = this.buildEnhancedAnalysisPrompt(
				message,
				deepAnalysis
			);

			// Step 3: Call AI with enhanced prompt
			const response = await this.callDeepSeekAPI([
				{
					role: "system",
					content: enhancedPrompt,
				},
				{
					role: "user",
					content: message,
				},
			]);

			const analysis = JSON.parse(response.choices[0].message.content);

			// Step 4: Enhance the response with deep learning insights
			const enhancedAnalysis = this.enhanceAnalysisWithDeepLearning(
				analysis,
				deepAnalysis
			);

			console.log("🤖 Enhanced AI Analysis Result:", enhancedAnalysis);

			return enhancedAnalysis;
		} catch (error) {
			console.error("🚨 Enhanced AI Analysis Failed:", error);
			return this.getFallbackAnalysis(message);
		}
	}

	// 🎯 Build Enhanced Analysis Prompt with Deep Learning Insights
	buildEnhancedAnalysisPrompt(message, deepAnalysis) {
		const basePrompt = `你是專業的風水命理分析師，配備了深度學習能力來更好地理解用戶需求。

## 深度學習分析結果：
- 檢測到的實體: ${JSON.stringify(deepAnalysis.entities)}
- 語義相似度: ${deepAnalysis.confidence}
- 情緒標記: ${JSON.stringify(deepAnalysis.preprocessed?.emotionalMarkers)}
- 風水術語: ${JSON.stringify(deepAnalysis.preprocessed?.fengShuiTerms)}
- 緊急程度: ${deepAnalysis.preprocessed?.urgency ? "高" : "低"}

## 我們提供的服務領域：
- 感情：戀愛、分手、復合、合婚、桃花運、婚姻
- 財運：賺錢、投資、理財、偏財運、正財運、個人財富  
- 工作：升職、跳槽、職場運勢、事業發展、工作機會、生意經營、創業、公司營運、商業決策
- 健康：身體健康、疾病、養生、健康運勢
- 人際關係：朋友關係、家庭關係、同事關係、社交運勢
- 子女：懷孕、生育、子女運、親子關係

## 知識庫匹配：
${deepAnalysis.knowledgeMatch ? this.formatKnowledgeMatch(deepAnalysis.knowledgeMatch) : "無特定匹配"}

請基於以上深度學習分析結果，更精準地分析用戶訊息並返回 JSON 格式：

{
    "isWithinScope": true/false,
    "detectedTopic": "感情|財運|工作|健康|人際關係|子女|其他",
    "specificProblem": "基於深度學習分析的具體問題描述",
    "confidence": 0.8,
    "aiResponse": "結合深度學習洞察的個性化回應",
    "serviceRecommendation": "基於用戶具體情況的服務建議",
    "deepLearningInsights": {
        "emotionalState": "用戶的情緒狀態分析",
        "urgencyLevel": "問題的緊急程度",
        "domainExpertise": "需要的專業領域深度",
        "recommendedApproach": "建議的諮詢方式"
    }
}

**重要增強規則：**
1. 利用深度學習分析結果提高分類準確性
2. 考慮用戶的情緒狀態和緊急程度
3. 根據風水術語和實體提供更專業的回應
4. 結合知識庫匹配結果給出具體建議
5. 如果檢測到焦慮或緊急情況，在回應中體現同理心

用戶訊息：${message}`;

		return basePrompt;
	}

	// 🔧 Format Knowledge Match for Prompt
	formatKnowledgeMatch(knowledgeMatch) {
		if (!knowledgeMatch) return "無匹配結果";

		let formatted = "";

		if (
			knowledgeMatch.terminology &&
			Object.keys(knowledgeMatch.terminology).length > 0
		) {
			formatted +=
				"相關術語：" +
				Object.keys(knowledgeMatch.terminology).join(", ") +
				"\n";
		}

		if (knowledgeMatch.framework && knowledgeMatch.framework.length > 0) {
			formatted +=
				"分析框架：" + knowledgeMatch.framework.join(", ") + "\n";
		}

		if (
			knowledgeMatch.recommendations &&
			knowledgeMatch.recommendations.length > 0
		) {
			formatted +=
				"建議方案：" + knowledgeMatch.recommendations.join(", ") + "\n";
		}

		return formatted || "無特定匹配";
	}

	// 🎯 Enhance Analysis with Deep Learning
	enhanceAnalysisWithDeepLearning(analysis, deepAnalysis) {
		return {
			...analysis,
			// Add deep learning insights
			deepLearningScore: deepAnalysis.confidence,
			entityAnalysis: deepAnalysis.entities,
			emotionalAnalysis:
				deepAnalysis.preprocessed?.emotionalMarkers || {},
			fengShuiTermsDetected:
				deepAnalysis.preprocessed?.fengShuiTerms || [],
			urgencyDetected: deepAnalysis.preprocessed?.urgency || false,

			// Enhanced confidence calculation
			confidence: this.calculateEnhancedConfidence(
				analysis.confidence,
				deepAnalysis
			),

			// Add contextual insights
			contextualInsights: {
				domainRelevance:
					deepAnalysis.entityAnalysis?.domain_relevance || 0.5,
				semanticSimilarity:
					deepAnalysis.semanticAnalysis?.confidence || 0.5,
				knowledgeBaseMatch: deepAnalysis.knowledgeMatch ? 0.9 : 0.3,
			},
		};
	}

	// 📊 Calculate Enhanced Confidence Score
	calculateEnhancedConfidence(baseConfidence, deepAnalysis) {
		const deepLearningWeight = 0.4;
		const baseWeight = 0.6;

		const deepLearningConfidence = deepAnalysis.confidence || 0.5;

		// Combine base AI confidence with deep learning confidence
		const enhancedConfidence =
			baseConfidence * baseWeight +
			deepLearningConfidence * deepLearningWeight;

		// Boost confidence if we have strong entity matches
		const entityBoost = deepAnalysis.entities
			? Object.values(deepAnalysis.entities).flat().length * 0.05
			: 0;

		// Boost confidence if we have feng shui terminology
		const terminologyBoost =
			deepAnalysis.preprocessed?.fengShuiTerms?.length * 0.03 || 0;

		return Math.min(
			enhancedConfidence + entityBoost + terminologyBoost,
			1.0
		);
	}

	// 💡 Enhanced Response Generation with Deep Learning
	async generateEnhancedResponse(analysis, originalMessage) {
		try {
			// Use deep learning insights to generate more contextual responses
			const deepLearningPrompt = this.buildDeepLearningResponsePrompt(
				analysis,
				originalMessage
			);

			const response = await this.generateAIResponse(deepLearningPrompt);

			return response;
		} catch (error) {
			console.error("🚨 Enhanced Response Generation Failed:", error);
			// Fallback to original response generation
			return this.generateStandardResponse(analysis, originalMessage);
		}
	}

	// 🎭 Build Deep Learning Response Prompt
	buildDeepLearningResponsePrompt(analysis, originalMessage) {
		return `基於深度學習分析結果，為用戶生成個性化的風水建議：

用戶訊息: "${originalMessage}"

深度學習分析:
- 話題: ${analysis.detectedTopic}
- 具體問題: ${analysis.specificProblem}
- 情緒狀態: ${JSON.stringify(analysis.emotionalAnalysis)}
- 檢測到的風水術語: ${analysis.fengShuiTermsDetected.join(", ") || "無"}
- 緊急程度: ${analysis.urgencyDetected ? "高" : "一般"}
- 領域相關性: ${analysis.contextualInsights?.domainRelevance * 100}%

請基於以上深度學習洞察，生成一個：
1. 體現同理心和理解的開場
2. 針對具體問題的專業風水建議
3. 考慮用戶情緒狀態的語氣調整
4. 包含實用的具體操作建議
5. 保持風鈴親切專業的特色

回應要求:
- 長度控制在150-200字
- 使用適當的emoji增加親和力
- 如果用戶焦慮，要更加溫暖安撫
- 如果檢測到專業術語，可以給出更深入的建議
- 保持正面積極的態度`;
	}

	// 🔄 Learning and Adaptation Methods
	async learnFromUserFeedback(message, analysis, userSatisfaction) {
		// Store interaction for learning
		await this.deepLearningEnhancer.learnFromInteraction(
			message,
			analysis,
			{
				satisfaction: userSatisfaction,
				timestamp: new Date().toISOString(),
			}
		);

		console.log("📚 Learning from user feedback...");
	}

	// 📈 Get Learning Analytics
	getLearningAnalytics() {
		const patterns = this.deepLearningEnhancer.user_interaction_patterns;

		const analytics = {
			totalInteractions: 0,
			topCategories: [],
			averageSatisfaction: 0,
			improvementAreas: [],
		};

		// Analyze patterns
		for (const [key, pattern] of patterns.entries()) {
			analytics.totalInteractions += pattern.count;
			analytics.topCategories.push({
				category: key,
				count: pattern.count,
				satisfaction: pattern.satisfaction_score,
			});
		}

		// Sort by frequency
		analytics.topCategories.sort((a, b) => b.count - a.count);

		return analytics;
	}

	// ... Include other methods from your original AITopicClassifier
	async callDeepSeekAPI(messages, options = {}) {
		const requestData = {
			model: "deepseek-chat",
			messages: messages,
			temperature: options.temperature || 0.3,
			max_tokens: options.max_tokens || 1000,
			stream: false,
		};

		const response = await fetch(this.DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			throw new Error(`DeepSeek API error: ${response.status}`);
		}

		return await response.json();
	}

	async generateAIResponse(prompt) {
		try {
			const response = await this.callDeepSeekAPI(
				[
					{
						role: "system",
						content:
							"你是專業且親切的風鈴，請根據深度學習分析結果提供個性化建議。",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				{
					temperature: 0.7,
					max_tokens: 400,
				}
			);

			return response.choices[0].message.content.trim();
		} catch (error) {
			console.error("🚨 AI Response Generation Failed:", error);
			throw error;
		}
	}

	getFallbackAnalysis(message) {
		return {
			isWithinScope: false,
			detectedTopic: "其他",
			specificProblem: "無法分析的問題",
			confidence: 0.3,
			aiResponse: "抱歉，我需要更多信息來幫助你。",
			serviceRecommendation: "請提供更詳細的問題描述",
		};
	}

	generateStandardResponse(analysis, originalMessage) {
		return `了解到你在${analysis.detectedTopic}方面遇到問題，讓風鈴來幫你分析！✨`;
	}
}

module.exports = EnhancedAITopicClassifier;
