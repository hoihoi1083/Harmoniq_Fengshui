import mongoose from "mongoose";

const coupleAnalysisReportSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		sessionId: {
			type: String,
			required: true,
			index: true,
		},
		language: {
			type: String,
			required: true,
			default: "zh-CN",
		},
		isDeleted: {
			type: Number,
			default: 0,
			index: true,
		},

		// Enhanced User Profile
		userProfile: {
			birthday: {
				type: Date,
				required: true,
			},
			gender: {
				type: String,
				enum: ["male", "female"],
				required: true,
			},
			element: String, // 日主五行
			personality: String, // 性格特質
			loveStyle: String, // 感情模式
			baziPillars: [String], // 四柱八字 [年柱, 月柱, 日柱, 時柱]
			dayMasterElement: String, // 日主元素
		},

		// Enhanced Partner Profile
		partnerProfile: {
			birthday: {
				type: Date,
				required: true,
			},
			gender: {
				type: String,
				enum: ["male", "female"],
				required: true,
			},
			element: String, // 日主五行
			personality: String, // 性格特質
			loveStyle: String, // 感情模式
			baziPillars: [String], // 四柱八字 [年柱, 月柱, 日柱, 時柱]
			dayMasterElement: String, // 日主元素
		},

		// Enhanced Compatibility Analysis
		compatibilityAnalysis: {
			overallScore: {
				type: Number,
				required: true,
				min: 0,
				max: 100,
			},
			compatibilityLevel: String, // 優秀配對, 良好配對, etc.
			elementInteraction: String, // 五行相生相剋關係
			relationshipAdvice: String, // 感情相處建議
			developmentAdvice: String, // 發展建議
			specificAdvice: String, // 針對性建議
			strengthsAndChallenges: {
				strengths: [String], // 關係優勢
				challenges: [String], // 潛在挑戰
			},
		},

		// Problem Analysis (New Feature)
		problemAnalysis: {
			originalProblem: String, // 用戶原始問題
			problemCategory: String, // 問題類別名稱
			categoryType: {
				type: String,
				enum: [
					"emotion_cooling",
					"special_situation",
					"taboo_breaking",
				],
			},
			keyIssues: [String], // 關鍵問題點
			rootCauses: [String], // 根本原因分析
		},

		// Detailed Solutions by Category (New Feature)
		solutions: {
			// 感情降溫類解決方案
			emotionCooling: {
				chartDiagnosis: {
					diagnosis: String, // 盤面診斷結果
					keyFindings: [String], // 關鍵發現
					recommendations: [String], // 建議
				},
				emergencyFengShui: {
					urgentActions: [String], // 緊急風水措施
					placements: [String], // 物品擺放
					colors: [String], // 緊急調色
				},
				restartChemistry: {
					methods: [String], // 重啟默契方法
					timing: String, // 最佳時機
					activities: [String], // 建議活動
				},
			},

			// 特殊情境類解決方案
			specialSituation: {
				starChartGuidance: {
					guidance: String, // 星盤指引
					favorablePeriods: [String], // 有利時期
					strategies: [String], // 應對策略
				},
				fengShuiTransformation: {
					transformations: [String], // 風水轉化方法
					environmentChanges: [String], // 環境改變
					energyAdjustments: [String], // 能量調整
				},
				relationshipMethod: {
					methods: [String], // 相處心法
					communication: [String], // 溝通技巧
					principles: [String], // 相處原則
				},
			},

			// 禁忌破解話術解決方案
			tabooBreaking: {
				keyAnalysis: {
					analysis: String, // 關鍵分析
					taboos: [String], // 識別的禁忌
					patterns: [String], // 行為模式
				},
				targetedSuggestions: {
					suggestions: [String], // 針對性建議
					scripts: [String], // 推薦話術
					timing: [String], // 說話時機
				},
				restartChemistry: {
					methods: [String], // 重啟默契方法
					healingProcess: [String], // 修復過程
					preventiveMeasures: [String], // 預防措施
				},
			},
		},

		// Enhanced Yearly Fortune
		yearlyFortune: {
			currentYear: String, // 今年運勢
			bestTiming: String, // 最佳時機
			warnings: String, // 注意事項
			monthlyGuidance: [
				{
					month: String,
					fortune: String,
					advice: String,
				},
			],
		},

		// Enhanced Feng Shui Layout
		fengShuiLayout: {
			bedroom: String, // 臥室布置
			livingRoom: String, // 客廳擺設
			colors: String, // 開運顏色
			items: String, // 吉祥物品
			generalAdvice: String, // 總體風水建議
			specificPlacements: [
				{
					area: String, // 區域
					item: String, // 物品
					placement: String, // 擺放位置
					purpose: String, // 作用
				},
			],
		},

		// Additional Analysis Data (New)
		analysisDetails: {
			wuxingAnalysis: {
				userElements: {
					strong: [String], // 旺盛元素
					weak: [String], // 缺乏元素
					balanced: [String], // 平衡元素
				},
				partnerElements: {
					strong: [String],
					weak: [String],
					balanced: [String],
				},
				interaction: String, // 五行互動分析
			},
			usefulGods: [String], // 喜用神
			tabooElements: [String], // 忌用元素
			luckyDirections: [String], // 吉方
			luckyNumbers: [Number], // 幸運數字
		},

		// Enhanced Report Metadata
		reportMetadata: {
			concern: {
				type: String,
				default: "感情",
			},
			reportType: {
				type: String,
				default: "couple_analysis",
			},
			analysisDepth: {
				type: String,
				enum: ["basic", "standard", "comprehensive"],
				default: "comprehensive",
			},
			version: {
				type: String,
				default: "2.0", // Enhanced version
			},
			generatedAt: {
				type: Date,
				default: Date.now,
			},
			updatedAt: Date,
			deletedAt: Date,
		},
	},
	{
		timestamps: true,
		indexes: [
			{ userId: 1, isDeleted: 1 },
			{ sessionId: 1 },
			{ createdAt: -1 },
			{ "reportMetadata.generatedAt": -1 },
			{ "problemAnalysis.categoryType": 1 },
			{ "compatibilityAnalysis.overallScore": -1 },
		],
	}
);

// Instance methods
coupleAnalysisReportSchema.methods.getFormattedReport = function () {
	return {
		title: "增強版合盤配對分析報告",
		reportId: this._id,
		userElement: this.userProfile.element,
		partnerElement: this.partnerProfile.element,
		compatibility: this.compatibilityAnalysis.overallScore,
		problemCategory: this.problemAnalysis.categoryType,
		solutionType: this.getSolutionType(),
		reportDate: this.reportMetadata.generatedAt,
		version: this.reportMetadata.version,
	};
};

coupleAnalysisReportSchema.methods.getSolutionType = function () {
	const category = this.problemAnalysis.categoryType;
	switch (category) {
		case "emotion_cooling":
			return "感情降溫類解決方案";
		case "special_situation":
			return "特殊情境類解決方案";
		case "taboo_breaking":
			return "禁忌破解話術解決方案";
		default:
			return "綜合解決方案";
	}
};

// Static methods
coupleAnalysisReportSchema.statics.findByUserId = function (
	userId,
	options = {}
) {
	const query = { userId, isDeleted: 0 };
	const sort = options.sort || { createdAt: -1 };
	const limit = options.limit || 10;

	return this.find(query).sort(sort).limit(limit);
};

coupleAnalysisReportSchema.statics.getReportStats = async function (userId) {
	const stats = await this.aggregate([
		{ $match: { userId, isDeleted: 0 } },
		{
			$group: {
				_id: "$problemAnalysis.categoryType",
				count: { $sum: 1 },
				avgScore: { $avg: "$compatibilityAnalysis.overallScore" },
				latestReport: { $max: "$createdAt" },
			},
		},
	]);

	return stats;
};

// Pre-save middleware
coupleAnalysisReportSchema.pre("save", function (next) {
	if (this.isModified() && !this.isNew) {
		this.reportMetadata.updatedAt = new Date();
	}
	next();
});

// Export model
export default mongoose.models.CoupleAnalysisReport ||
	mongoose.model("CoupleAnalysisReport", coupleAnalysisReportSchema);
