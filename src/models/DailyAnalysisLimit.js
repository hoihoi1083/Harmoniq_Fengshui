import mongoose from "mongoose";

// Clear cached model to ensure schema updates take effect
if (mongoose.models.DailyAnalysisLimit) {
	delete mongoose.models.DailyAnalysisLimit;
}

const DailyAnalysisLimitSchema = new mongoose.Schema(
	{
		// User identification (can be email or userId)
		userEmail: {
			type: String,
			required: false,
			index: true,
		},

		userId: {
			type: String,
			required: false,
			index: true,
		},

		// Date tracking (YYYY-MM-DD format for easy querying)
		date: {
			type: String,
			required: true,
			index: true,
		},

		// Analysis count for the day
		analysisCount: {
			type: Number,
			default: 0,
			min: 0,
		},

		// Analysis details for debugging/tracking
		analyses: [
			{
				sessionId: String,
				analysisType: {
					type: String,
					enum: ["individual", "couple"],
					required: true,
				},
				topic: {
					type: String,
					enum: [
						"工作",
						"事業",
						"感情",
						"財運",
						"子女",
						"人際關係",
						"健康",
						"命理",
						"因緣",
						"風水佈局",
						"其他",
					],
				},
				timestamp: {
					type: Date,
					default: Date.now,
				},
				originalMessage: String,
			},
		],

		// Last updated timestamp
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
		indexes: [
			{ userEmail: 1, date: 1 },
			{ userId: 1, date: 1 },
			{ date: 1 }, // For cleanup operations
		],
	}
);

// Static method to get today's date string
DailyAnalysisLimitSchema.statics.getTodayDateString = function () {
	const today = new Date();
	return today.toISOString().split("T")[0]; // YYYY-MM-DD format
};

// Static method to check if user can perform analysis
DailyAnalysisLimitSchema.statics.canUserAnalyze = async function (
	userEmail,
	userId,
	limit = 5
) {
	const today = this.getTodayDateString();

	// Find or create today's record
	let record = await this.findOne({
		$or: [
			{ userEmail: userEmail, date: today },
			{ userId: userId, date: today },
		],
	});

	if (!record) {
		return { canAnalyze: true, currentCount: 0, limit: limit };
	}

	return {
		canAnalyze: record.analysisCount < limit,
		currentCount: record.analysisCount,
		limit: limit,
		remaining: Math.max(0, limit - record.analysisCount),
	};
};

// Static method to increment analysis count
DailyAnalysisLimitSchema.statics.incrementAnalysisCount = async function (
	userEmail,
	userId,
	sessionId,
	analysisType,
	topic,
	originalMessage
) {
	const today = this.getTodayDateString();

	// Find or create today's record
	let record = await this.findOne({
		$or: [
			{ userEmail: userEmail, date: today },
			{ userId: userId, date: today },
		],
	});

	if (!record) {
		record = new this({
			userEmail: userEmail,
			userId: userId,
			date: today,
			analysisCount: 0,
			analyses: [],
		});
	}

	// Add analysis record
	record.analyses.push({
		sessionId: sessionId,
		analysisType: analysisType,
		topic: topic,
		timestamp: new Date(),
		originalMessage: originalMessage,
	});

	// Increment count
	record.analysisCount += 1;
	record.lastUpdated = new Date();

	await record.save();
	return record;
};

// Static method to get user's daily stats
DailyAnalysisLimitSchema.statics.getUserDailyStats = async function (
	userEmail,
	userId
) {
	const today = this.getTodayDateString();

	const record = await this.findOne({
		$or: [
			{ userEmail: userEmail, date: today },
			{ userId: userId, date: today },
		],
	});

	if (!record) {
		return {
			date: today,
			analysisCount: 0,
			analyses: [],
			canAnalyze: true,
			remaining: 5,
		};
	}

	return {
		date: record.date,
		analysisCount: record.analysisCount,
		analyses: record.analyses,
		canAnalyze: record.analysisCount < 5,
		remaining: Math.max(0, 5 - record.analysisCount),
		lastUpdated: record.lastUpdated,
	};
};

// Static method for cleanup old records (optional - for maintenance)
DailyAnalysisLimitSchema.statics.cleanupOldRecords = async function (
	daysToKeep = 30
) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
	const cutoffDateString = cutoffDate.toISOString().split("T")[0];

	const result = await this.deleteMany({
		date: { $lt: cutoffDateString },
	});

	return result;
};

export default mongoose.models.DailyAnalysisLimit ||
	mongoose.model("DailyAnalysisLimit", DailyAnalysisLimitSchema);
