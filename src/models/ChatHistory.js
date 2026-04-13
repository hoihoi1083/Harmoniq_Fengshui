import mongoose from "mongoose";

// Clear cached model to ensure schema updates take effect
if (mongoose.models.ChatHistory) {
	delete mongoose.models.ChatHistory;
}

const ChatHistorySchema = new mongoose.Schema(
	{
		// Conversation identifiers
		conversationId: {
			type: String,
			required: true,
			index: true,
		},
		sessionId: {
			type: String,
			required: true,
			index: true,
		},
		userId: {
			type: String,
			required: true,
			index: true,
		},
		userEmail: {
			type: String,
			required: false,
		},

		// Which product owns this thread (sidebar / load filtering)
		chatProduct: {
			type: String,
			default: "smart-chat2",
			index: true,
		},
		// comfort-chat: server may append one birthday invite; only once per thread
		comfortBirthdayInviteSent: {
			type: Boolean,
			default: false,
		},

		// Conversation metadata
		title: {
			type: String,
			required: true,
		},
		primaryConcern: {
			type: String,
			enum: [
				"工作",
				"事業",
				"感情",
				"財運",
				"子女",
				"人際關係",
				"健康",
				"因緣",
				"命理", // Added for 命理 topic
				"風水佈局",
				"其他",
			],
			required: false,
		},
		conversationState: {
			type: String,
			enum: [
				"initial",
				"ai_analyzing",
				"birthday_collection",
				"awaiting_birthday_choice", // 🎂 等待用戶選擇使用已保存或輸入新生日
				"asking_detailed_report",
				"concern_detected", // Added for topic detection state
				// 新增：支持感情流程中選擇 A/B/C/D 之後的狀態
				"asking_relationship_type",
				"ready_for_detailed_report",
				"collecting_payment_info",
				"completed",
			],
			default: "initial",
		}, // Messages array
		messages: [
			{
				messageId: {
					type: String,
					required: true,
				},
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
				aiAnalysis: {
					detectedTopic: String,
					isWithinScope: Boolean,
					confidence: Number,
					specificProblem: String,
				},
				systemType: {
					type: String,
					default: "smart-chat2",
				},
			},
		],

		// Conversation statistics
		stats: {
			totalMessages: {
				type: Number,
				default: 0,
			},
			lastActivity: {
				type: Date,
				default: Date.now,
			},
			userEngagement: {
				type: Number,
				min: 0,
				max: 1,
				default: 0.5,
			},
		},

		// Context preservation
		context: {
			topics: [String],
			lastTopic: String,
			conversationSummary: String,
			emotionalState: String,
		},

		// User data (if collected)
		userData: {
			userBirthday: Date,
			partnerBirthday: Date,
			gender: String,
			partnerGender: String,
			relationshipType: String,
		},

		// Status flags
		isActive: {
			type: Boolean,
			default: true,
		},
		isArchived: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		indexes: [
			{ userId: 1, conversationId: 1 },
			{ userId: 1, isActive: 1 },
			{ sessionId: 1 },
			{ "stats.lastActivity": -1 },
			{ createdAt: -1 },
		],
	}
);

// Instance methods
ChatHistorySchema.methods.addMessage = function (
	role,
	content,
	aiAnalysis = null,
	systemType = "smart-chat2"
) {
	const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	this.messages.push({
		messageId,
		role,
		content,
		timestamp: new Date(),
		aiAnalysis,
		systemType,
	});

	this.stats.totalMessages = this.messages.length;
	this.stats.lastActivity = new Date();

	return messageId;
};

ChatHistorySchema.methods.updateContext = function (
	topic,
	emotionalState = null
) {
	if (topic && !this.context.topics.includes(topic)) {
		this.context.topics.push(topic);
	}

	if (topic) {
		this.context.lastTopic = topic;
	}

	if (emotionalState) {
		this.context.emotionalState = emotionalState;
	}
};

ChatHistorySchema.methods.generateSummary = function () {
	const messageCount = this.stats.totalMessages;
	const primaryConcern = this.primaryConcern || "一般諮詢";

	if (messageCount === 0) {
		return `剛開始的${primaryConcern}對話`;
	} else if (messageCount < 5) {
		return `${primaryConcern}初步討論（${messageCount}輪）`;
	} else {
		return `${primaryConcern}深入討論（${messageCount}輪）`;
	}
};

export default mongoose.models.ChatHistory ||
	mongoose.model("ChatHistory", ChatHistorySchema);
