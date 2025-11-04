/**
 * 🎯 MINIMAL ENHANCEMENT: 80% Benefits, 20% Effort
 * Focus on what actually matters for user experience
 */

class MinimalEnhancement {
	constructor() {
		// Simple conversation memory (no complex deep learning)
		this.conversationMemory = new Map();

		// Simple success tracking
		this.successPatterns = new Map();

		// Emotional keywords (easy to maintain)
		this.emotionalKeywords = {
			urgent: ["急", "馬上", "立刻", "快", "倒閉", "完蛋"],
			anxious: ["焦慮", "擔心", "緊張", "不安", "害怕"],
			confused: ["迷茫", "困惑", "不知道", "不懂", "搞不清楚"],
			desperate: ["沒辦法", "絕望", "完了", "救救我"],
		};
	}

	// 🎯 ENHANCEMENT 1: Emotional Tone Adjustment (5 minutes to implement)
	detectEmotionalState(message) {
		const emotions = {};

		Object.entries(this.emotionalKeywords).forEach(
			([emotion, keywords]) => {
				emotions[emotion] = keywords.some((keyword) =>
					message.includes(keyword)
				);
			}
		);

		return emotions;
	}

	// 🎯 ENHANCEMENT 2: Conversation Memory (15 minutes to implement)
	updateConversationHistory(sessionId, message, response, topic) {
		if (!this.conversationMemory.has(sessionId)) {
			this.conversationMemory.set(sessionId, {
				messages: [],
				successfulAdvice: [],
				preferredTopic: null,
				emotionalPattern: [],
			});
		}

		const session = this.conversationMemory.get(sessionId);
		session.messages.push({
			message,
			response,
			topic,
			timestamp: new Date(),
		});

		// Keep only last 10 messages to avoid memory bloat
		if (session.messages.length > 10) {
			session.messages.shift();
		}
	}

	// 🎯 ENHANCEMENT 3: Context-Aware Prompting (10 minutes to implement)
	buildEnhancedPrompt(message, sessionId) {
		const basePrompt = `你是專業的風水命理分析師，請分析用戶的問題並分類。`;

		// Add emotional context
		const emotions = this.detectEmotionalState(message);
		let emotionalContext = "";

		if (emotions.urgent) {
			emotionalContext +=
				"⚠️ 用戶情況緊急，請提供立即可行的建議，語氣要安撫和支持。\n";
		}
		if (emotions.anxious) {
			emotionalContext += "💙 用戶顯得焦慮，請用溫暖同理的語氣回應。\n";
		}
		if (emotions.confused) {
			emotionalContext += "🔍 用戶感到迷茫，請提供清晰具體的步驟指導。\n";
		}
		if (emotions.desperate) {
			emotionalContext += "🤗 用戶情緒低落，請優先提供心理支持和希望。\n";
		}

		// Add conversation context
		let conversationContext = "";
		if (this.conversationMemory.has(sessionId)) {
			const session = this.conversationMemory.get(sessionId);
			if (session.messages.length > 0) {
				const recentMessages = session.messages.slice(-3);
				conversationContext = `\n📚 用戶對話歷史：\n${recentMessages
					.map(
						(m) =>
							`- 之前問題: ${m.message.substring(0, 50)}... (話題: ${m.topic})`
					)
					.join("\n")}\n\n請基於對話歷史提供更個人化的建議。\n`;
			}
		}

		return (
			basePrompt +
			"\n" +
			emotionalContext +
			conversationContext +
			"\n現在請分析以下用戶訊息：" +
			message
		);
	}

	// 🎯 ENHANCEMENT 4: Success Learning (20 minutes to implement)
	learnFromSuccess(topic, specificProblem, advice, userSatisfied) {
		const key = `${topic}_${specificProblem}`;

		if (!this.successPatterns.has(key)) {
			this.successPatterns.set(key, {
				totalAttempts: 0,
				successfulAdvice: [],
				successRate: 0,
			});
		}

		const pattern = this.successPatterns.get(key);
		pattern.totalAttempts++;

		if (userSatisfied) {
			pattern.successfulAdvice.push(advice);
			pattern.successRate =
				pattern.successfulAdvice.length / pattern.totalAttempts;
		}

		this.successPatterns.set(key, pattern);
	}

	// 🎯 Get suggestions based on past success
	getSuccessBasedSuggestions(topic, specificProblem) {
		const key = `${topic}_${specificProblem}`;
		const pattern = this.successPatterns.get(key);

		if (pattern && pattern.successfulAdvice.length > 0) {
			return {
				hasHistory: true,
				suggestions: pattern.successfulAdvice.slice(-3), // Last 3 successful advice
				successRate: pattern.successRate,
			};
		}

		return { hasHistory: false };
	}
}

// 🚀 EASY INTEGRATION with your existing system
class EnhancedSmartChat2 {
	constructor(deepSeekApiKey, deepSeekApiUrl) {
		this.DEEPSEEK_API_KEY = deepSeekApiKey;
		this.DEEPSEEK_API_URL = deepSeekApiUrl;
		this.enhancement = new MinimalEnhancement();
	}

	// Modified version of your existing analyzeMessage method
	async analyzeMessage(message, sessionId = null) {
		try {
			// Build enhanced prompt with minimal enhancements
			const enhancedPrompt = this.enhancement.buildEnhancedPrompt(
				message,
				sessionId
			);

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

			// Store conversation for future reference
			if (sessionId) {
				this.enhancement.updateConversationHistory(
					sessionId,
					message,
					analysis.aiResponse,
					analysis.detectedTopic
				);
			}

			console.log("🎯 Enhanced Analysis Result:", analysis);
			return analysis;
		} catch (error) {
			console.error("🚨 Enhanced Analysis Failed:", error);
			return this.getFallbackAnalysis(message);
		}
	}

	// Enhanced response generation with success patterns
	async generateEnhancedCareerFlow(analysis, originalMessage, sessionId) {
		try {
			// Check if we have successful patterns for this type of problem
			const successSuggestions =
				this.enhancement.getSuccessBasedSuggestions(
					analysis.detectedTopic,
					analysis.specificProblem
				);

			let promptAddition = "";
			if (successSuggestions.hasHistory) {
				promptAddition = `\n\n📊 成功案例參考 (成功率: ${Math.round(successSuggestions.successRate * 100)}%):\n${successSuggestions.suggestions.join("\n")}\n\n請參考以上成功案例，但要根據當前用戶的具體情況調整建議。`;
			}

			const enhancedPrompt = `用戶說: "${originalMessage}"
            
分析結果: ${analysis.specificProblem}

請以風鈴的身份，針對這個具體的工作/生意問題，提供相關的風水建議和回應。

回應要求:
1. 要親切友善，用風鈴的語氣
2. 針對具體問題給出相關風水建議
3. 包含實用的風水佈局建議
4. 保持正面積極的態度
5. 不要超過200字

${promptAddition}

風鈴語氣特點: 親切、專業、帶有一點可愛的語氣，會用✨💼🌱等emoji`;

			const aiResponse = await this.generateAIResponse(enhancedPrompt);

			return (
				aiResponse +
				`

告訴風鈴你的生日，我可以幫你看看事業運勢和最佳發展時機！

📅 **生日格式範例：**
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
			);
		} catch (error) {
			console.error("Enhanced career flow failed:", error);
			// Fallback to your existing method
			return this.generateCareerFlowOriginal(analysis, originalMessage);
		}
	}

	// Method to track user satisfaction (call this when user gives feedback)
	recordUserSatisfaction(
		sessionId,
		topic,
		specificProblem,
		advice,
		satisfied
	) {
		this.enhancement.learnFromSuccess(
			topic,
			specificProblem,
			advice,
			satisfied
		);
	}

	// Your existing methods...
	async callDeepSeekAPI(messages, options = {}) {
		// Your existing implementation
	}

	async generateAIResponse(prompt) {
		// Your existing implementation
	}

	getFallbackAnalysis(message) {
		// Your existing implementation
	}
}

module.exports = { MinimalEnhancement, EnhancedSmartChat2 };
