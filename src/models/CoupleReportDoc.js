import mongoose from "mongoose";

const coupleReportSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		sessionId: {
			type: String,
			required: true,
		},
		language: {
			type: String,
			required: true,
			default: "zh-CN",
		},
		isDelete: {
			type: Number,
			default: 0,
		},
		// 用戶資料
		userProfile: {
			birthday: {
				type: Date,
				required: true,
			},
			gender: {
				type: String,
				enum: ["male", "female"],
			},
			element: String, // 五行
			personality: String, // 性格特質
			loveStyle: String, // 感情模式
		},
		// 伴侶資料
		partnerProfile: {
			birthday: {
				type: Date,
				required: true,
			},
			gender: {
				type: String,
				enum: ["male", "female"],
			},
			element: String, // 五行
			personality: String, // 性格特質
			loveStyle: String, // 感情模式
		},
		// 配對分析
		compatibilityAnalysis: {
			overallScore: Number, // 總體契合度
			relationshipAdvice: String, // 感情相處建議
			developmentAdvice: String, // 發展建議
			specificAdvice: String, // 針對性建議
		},
		// 流年運勢
		yearlyFortune: {
			currentYear: String, // 今年運勢
			bestTiming: String, // 最佳時機
			warnings: String, // 注意事項
		},
		// 風水布局
		fengShuiLayout: {
			bedroom: String, // 臥室布置
			livingRoom: String, // 客廳擺設
			colors: String, // 開運顏色
			items: String, // 吉祥物品
			generalAdvice: String, // 總體風水建議
		},
		// 報告元數據
		reportMetadata: {
			concern: String, // 主要關注領域
			reportType: String, // 報告類型
			generatedAt: {
				type: Date,
				default: Date.now,
			},
		},
	},
	{
		timestamps: true,
		indexes: [
			{ userId: 1, isDelete: 1 },
			{ sessionId: 1 },
			{ createdAt: -1 },
		],
	}
);

// 添加實例方法
coupleReportSchema.methods.getFormattedReport = function () {
	return {
		title: "合盤配對分析報告",
		userElement: this.userProfile.element,
		partnerElement: this.partnerProfile.element,
		compatibility: this.compatibilityAnalysis.overallScore,
		reportDate: this.reportMetadata.generatedAt,
	};
};

export default mongoose.models.CoupleReportDoc ||
	mongoose.model("CoupleReportDoc", coupleReportSchema);
