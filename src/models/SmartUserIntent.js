import mongoose from "mongoose";

// Clear cached model to ensure schema updates take effect
if (mongoose.models.SmartUserIntent) {
	delete mongoose.models.SmartUserIntent;
}

const SmartUserIntentSchema = new mongoose.Schema(
	{
		// 用戶基本信息
		userEmail: {
			type: String,
			required: false, // 改為非必需，因為現在支援userId
			index: true,
		},

		// 🆕 新增：用戶ID (用於localStorage識別)
		userId: {
			type: String,
			required: false,
			index: true,
		},

		sessionId: {
			type: String,
			index: true,
		},

		// 關注領域和問題
		primaryConcern: {
			type: String,
			enum: [
				"工作",
				"感情",
				"財運",
				"子女",
				"人際關係",
				"健康",
				"因緣",
				"風水佈局",
				"其他",
			],
			required: false,
		},

		// 🆕 新增：非核心領域的用戶輸入處理
		nonCoreUserInput: {
			type: String,
			maxlength: 500,
		},

		// 🆕 新增：AI對非核心輸入的分析結果
		nonCoreAnalysis: {
			isTypo: {
				type: Boolean,
				default: false,
			},
			suggestedCoreArea: {
				type: String,
				enum: [
					"工作",
					"感情",
					"財運",
					"子女",
					"人際關係",
					"健康",
					"因緣",
					"風水佈局",
					"其他",
				],
			},
			aiResponse: {
				type: String,
				maxlength: 1000,
			},
			analysisTimestamp: {
				type: Date,
				default: Date.now,
			},
		},

		// 🤖 新增：AI用戶分群分析
		aiAnalysis: {
			userType: {
				type: String,
				enum: ["新手用戶", "回頭客", "專業用戶"],
			},
			emotionalState: {
				type: String,
				enum: ["平靜", "焦慮", "興奮", "困惑", "絕望", "希望"],
			},
			urgencyLevel: {
				type: String,
				enum: ["低", "中", "高", "緊急"],
			},
			conversationPattern: {
				type: String,
				enum: ["探索型", "問題解決型", "決策支持型", "學習型"],
			},
			serviceDepth: {
				type: String,
				enum: ["快速諮詢", "標準分析", "深度服務", "專家諮詢"],
			},
			personalityType: {
				type: String,
				enum: ["理性分析型", "感性直覺型", "務實行動型", "謹慎保守型"],
			},
			engagementLevel: {
				type: String,
				enum: ["低", "中", "高"],
			},
			topicFocus: [
				{
					type: String,
					enum: [
						"感情",
						"財運",
						"工作",
						"健康",
						"人際關係",
						"子女",
						"因緣",
						"風水佈局",
						"其他",
					],
				},
			],
			communicationStyle: {
				type: String,
				enum: ["直接", "委婉", "詳細", "簡潔"],
			},
			recommendedApproach: {
				type: String,
				enum: ["引導式", "支持式", "分析式", "教育式"],
			},
			confidence: {
				type: Number,
				min: 0,
				max: 1,
				default: 0.5,
			},
			lastAnalyzed: {
				type: Date,
				default: Date.now,
			},
		},

		relationshipAnalysisType: {
			type: String,
			enum: ["individual", "couple"],
			required: false,
		},

		// 🎯 新增：分手狀態選擇 (A, B, C, D)
		breakupStatus: {
			type: String,
			enum: ["A", "B", "C", "D"],
			required: false,
		},

		// 🌸 新增：用戶的感情狀態（用於個性化感情分析）
		emotionalState: {
			type: String,
			enum: [
				"just_broke_up", // 剛分手，還很難過
				"ready_to_restart", // 分手一段時間了，想重新開始
				"long_single", // 單身很久，想找對象
				"has_crush", // 有喜歡的人，想脫單
				"want_reconcile", // 想復合，但不確定
				"new_relationship", // 剛開始交往，想了解配對度
				"looking_for_new", // 已經放下，想找新對象
				"long_term_relationship", // 交往一段時間，想看未來發展
				"healing", // 🎯 新增：療傷階段
				"new_beginning", // 🎯 新增：準備新開始
				"understand_reasons", // 🎯 新增：想了解分手原因
			],
			required: false,
		},

		specificQuestion: {
			type: String,
			maxlength: 500,
		},

		// 🔧 FIX: 保存原始詳細問題描述，用於報告生成時保持問題的具體性
		originalSpecificProblem: {
			type: String,
			maxlength: 1000,
		},

		// 對話狀態管理
		conversationState: {
			type: String,
			enum: [
				"initial",
				"concern_detected",
				"asking_specific",
				"asking_relationship_type",
				"emotion_state_selection", // 🎯 新增：分手後的情感狀態選擇
				"breakup_guidance_provided", // 🎯 新增：分手指導已提供
				"waiting_confirmation",
				"problem_confirmed",
				"ready_for_modal",
				"ready_for_report",
				"birthday_collected",
				"birthday_provided", // 🔧 修復：添加缺失的狀態
				"birthday_collection",
				"awaiting_birthday_choice", // 🎂 新增：等待用戶選擇使用已保存生日或輸入新生日
				"asking_partner_birthday",
				"asking_detailed_report",
				"ready_for_detailed_report",
				"ready_for_payment",
				"confirming_birthday",
				"confirming_partner_birthday",
				"collecting_payment_info", // 🎯 新增：收集付款信息狀態
				"report_generated", // 🎯 新增：報告已生成狀態
				"ai_analyzing", // 🤖 新增：AI 分析中狀態
				"ai_analyzed", // 🤖 新增：AI 分析完成狀態
				"choice_selection", // 🔧 新增：用戶選擇狀態 (for 1️⃣2️⃣ responses)
			],
			default: "initial",
		},

		conversationActive: {
			type: Boolean,
			default: true,
		},

		readyForPayment: {
			type: Boolean,
			default: false,
		},

		// 對話歷史
		conversationHistory: [
			{
				role: {
					type: String,
					enum: ["user", "assistant"],
					required: true,
				},
				content: {
					type: String,
					required: true,
				},
				timestamp: {
					type: Date,
					default: Date.now,
				},
				detectedConcern: String,
				state: String,
			},
		],

		// 付款相關
		paymentCompleted: {
			type: Boolean,
			default: false,
		},

		paymentAmount: {
			type: Number,
			min: 0,
		},

		paymentDate: {
			type: Date,
		},

		serviceType: {
			type: String,
			enum: [
				"work-analysis",
				"relationship-analysis",
				"wealth-analysis",
				"children-analysis",
				"social-analysis",
				"love-analysis",
				"destiny-analysis",
			],
		},

		// 用戶生辰八字資料
		birthDate: {
			type: Date,
		},

		userBirthday: {
			type: Date,
		},

		partnerBirthday: {
			type: Date,
		},

		birthdayConfirmed: {
			type: Boolean,
			default: false,
		},

		partnerBirthdayConfirmed: {
			type: Boolean,
			default: false,
		},

		birthTime: {
			type: String,
		},

		gender: {
			type: String,
			enum: ["male", "female"],
		},

		// 報告生成
		reportGenerated: {
			type: Boolean,
			default: false,
		},

		reportContent: {
			baziAnalysis: {
				yearElement: String,
				dayElement: String,
				strengthAnalysis: {
					description: String,
					advice: String,
				},
				personality: String,
			},
			currentSituation: String,
			futureOutlook: String,
			specificAdvice: String,
			fengShuiSolutions: String,
			timingAdvice: String,
			generatedAt: {
				type: Date,
				default: Date.now,
			},
		},
	},
	{
		timestamps: true,
		indexes: [
			{ userEmail: 1, conversationActive: 1 },
			{ userId: 1, conversationActive: 1 }, // 新增userId索引
			{ userEmail: 1, paymentCompleted: 1 },
			{ userId: 1, paymentCompleted: 1 }, // 新增userId索引
			{ createdAt: -1 },
		],
	}
);

// 添加實例方法
SmartUserIntentSchema.methods.isConversationComplete = function () {
	return (
		this.conversationState === "ready_for_payment" || this.paymentCompleted
	);
};

SmartUserIntentSchema.methods.getProgress = function () {
	const states = [
		"initial",
		"concern_detected",
		"asking_specific",
		"waiting_confirmation",
		"asking_detailed_report",
		"ready_for_detailed_report",
		"ready_for_payment",
	];
	const currentIndex = states.indexOf(this.conversationState);
	return {
		current: currentIndex + 1,
		total: states.length,
		percentage: Math.round(((currentIndex + 1) / states.length) * 100),
	};
};

export default mongoose.models.SmartUserIntent ||
	mongoose.model("SmartUserIntent", SmartUserIntentSchema);
