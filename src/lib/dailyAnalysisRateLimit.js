import DailyAnalysisLimit from "@/models/DailyAnalysisLimit";

/**
 * Rate limiting utility for daily analysis limits
 */
export class DailyAnalysisRateLimit {
	// 🔧 Configuration: Daily analysis limit per user
	static DAILY_LIMIT = process.env.DAILY_ANALYSIS_LIMIT
		? parseInt(process.env.DAILY_ANALYSIS_LIMIT)
		: 10;

	/**
	 * Check if user can perform analysis today
	 * @param {string} userEmail - User's email
	 * @param {string} userId - User's ID (fallback)
	 * @param {number} customLimit - Custom limit (default: 10)
	 * @returns {Promise<{canAnalyze: boolean, currentCount: number, limit: number, remaining: number}>}
	 */
	static async checkUserLimit(
		userEmail,
		userId,
		customLimit = this.DAILY_LIMIT
	) {
		try {
			return await DailyAnalysisLimit.canUserAnalyze(
				userEmail,
				userId,
				customLimit
			);
		} catch (error) {
			console.error("❌ Error checking user analysis limit:", error);
			// On error, allow analysis to prevent blocking users due to technical issues
			return {
				canAnalyze: true,
				currentCount: 0,
				limit: customLimit,
				remaining: customLimit,
				error: true,
			};
		}
	}

	/**
	 * Record a new analysis for the user
	 * @param {string} userEmail - User's email
	 * @param {string} userId - User's ID (fallback)
	 * @param {string} sessionId - Session ID
	 * @param {string} analysisType - "individual" or "couple"
	 * @param {string} topic - Analysis topic
	 * @param {string} originalMessage - User's original message
	 * @returns {Promise<Object>}
	 */
	static async recordAnalysis(
		userEmail,
		userId,
		sessionId,
		analysisType,
		topic,
		originalMessage
	) {
		try {
			const record = await DailyAnalysisLimit.incrementAnalysisCount(
				userEmail,
				userId,
				sessionId,
				analysisType,
				topic,
				originalMessage
			);

			console.log(
				`📊 Analysis recorded for user ${userEmail || userId}: ${record.analysisCount}/${this.DAILY_LIMIT}`
			);

			return {
				success: true,
				currentCount: record.analysisCount,
				limit: this.DAILY_LIMIT,
				remaining: Math.max(0, this.DAILY_LIMIT - record.analysisCount),
			};
		} catch (error) {
			console.error("❌ Error recording analysis:", error);
			return {
				success: false,
				error: error.message,
			};
		}
	}

	/**
	 * Get user's daily statistics
	 * @param {string} userEmail - User's email
	 * @param {string} userId - User's ID (fallback)
	 * @returns {Promise<Object>}
	 */
	static async getUserStats(userEmail, userId) {
		try {
			return await DailyAnalysisLimit.getUserDailyStats(
				userEmail,
				userId
			);
		} catch (error) {
			console.error("❌ Error getting user stats:", error);
			return {
				date: new Date().toISOString().split("T")[0],
				analysisCount: 0,
				analyses: [],
				canAnalyze: true,
				remaining: this.DAILY_LIMIT,
				error: true,
			};
		}
	}

	/**
	 * Generate rate limit exceeded response message
	 * @param {number} currentCount - Current analysis count
	 * @param {number} limit - Daily limit
	 * @returns {string}
	 */
	static generateLimitExceededMessage(
		currentCount,
		limit = this.DAILY_LIMIT,
		locale = "zh-TW"
	) {
		if (locale === "zh-CN") {
			return `🚫 今日分析次数已达上限

你今天已经使用了 ${currentCount}/${limit} 次免费分析服务。

为了确保服务品质，我们设定每日分析上限为 ${limit} 次。

🕐 **明日重置时间：** 香港时间 00:00

💡 **建议：**
• 明天再来获取更多免费分析

感谢你的理解与支持！`;
		}

		return `🚫 今日分析次數已達上限

你今天已經使用了 ${currentCount}/${limit} 次免費分析服務。

為了確保服務品質，我們設定每日分析上限為 ${limit} 次。

🕐 **明日重置時間：** 香港時間 00:00

💡 **建議：**
• 明天再來獲取更多免費分析

感謝你的理解與支持！`;
	}

	/**
	 * Generate approaching limit warning message
	 * @param {number} remaining - Remaining analyses
	 * @param {number} limit - Daily limit
	 * @returns {string|null}
	 */
	static generateWarningMessage(remaining, limit = this.DAILY_LIMIT) {
		if (remaining <= 2 && remaining > 0) {
			return `⚠️ 提醒：你今天還剩 ${remaining} 次免費分析機會。`;
		}
		return null;
	}

	/**
	 * Check if analysis type should be counted against limit
	 * @param {string} analysisType - Type of analysis
	 * @param {Object} context - Additional context
	 * @returns {boolean}
	 */
	static shouldCountAnalysis(analysisType, context = {}) {
		// Count both individual and couple analyses
		if (analysisType === "individual" || analysisType === "couple") {
			return true;
		}

		// Don't count follow-up questions or clarifications
		if (context.isFollowUp || context.isClarification) {
			return false;
		}

		return true;
	}
}

export default DailyAnalysisRateLimit;
