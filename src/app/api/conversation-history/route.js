import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongoose";
import ChatHistory from "@/models/ChatHistory";

export async function GET(request) {
	try {
		await connectMongo();

		const { searchParams } = new URL(request.url);
		const userEmail = searchParams.get("userEmail");
		const userId = searchParams.get("userId");
		const limit = parseInt(searchParams.get("limit")) || 20;

		// 支援兩種用戶識別方式：userEmail 或 userId（或兩者）
		if (!userEmail && !userId) {
			return NextResponse.json(
				{ error: "用戶識別參數不能為空 (userEmail 或 userId)" },
				{ status: 400 }
			);
		}

		console.log("📚 從ChatHistory獲取用戶對話歷史:", {
			userEmail,
			userId,
			limit,
		});

		// 從ChatHistory獲取對話歷史 - 查詢兩者以確保跨瀏覽器一致性
		const query = {
			$or: [
				...(userEmail ? [{ userEmail: userEmail }] : []),
				...(userId ? [{ userId: userId }] : []),
			],
		};

		console.log("🔍 Query:", JSON.stringify(query));

		const chatHistories = await ChatHistory.find(query)
			.sort({ updatedAt: -1 })
			.limit(limit)
			.lean();
		console.log(`📊 找到 ${chatHistories.length} 個對話記錄`);

		const conversationSummaries = chatHistories.map((chat) => {
			const lastMessage = chat.messages?.[chat.messages.length - 1];
			const lastUserMessage = chat.messages
				?.filter((msg) => msg.role === "user")
				?.slice(-1)[0];

			return {
				conversationId: chat.conversationId,
				sessionId: chat.sessionId || chat.conversationId,
				title:
					chat.title ||
					generateConversationTitle(
						chat.primaryConcern,
						lastUserMessage?.content
					),
				primaryConcern: chat.primaryConcern || "一般諮詢",
				messageCount: chat.messages?.length || 0,
				lastUpdated: chat.updatedAt,
				lastActivity: chat.updatedAt,
				conversationState: chat.conversationState,
				preview: generatePreview(lastUserMessage?.content || ""),
				hasDetailedHistory: true, // ChatHistory總是有詳細歷史
				topics:
					chat.context?.topics ||
					[chat.primaryConcern].filter(Boolean),
			};
		});

		return NextResponse.json({
			success: true,
			userEmail: userEmail,
			userId: userId,
			totalConversations: conversationSummaries.length,
			conversations: conversationSummaries,
		});
	} catch (error) {
		console.error("❌ 獲取對話歷史失敗:", error);
		return NextResponse.json(
			{
				error: "獲取對話歷史失敗",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// 輔助函數：生成對話標題 - 顯示實際用戶問題
function generateConversationTitle(primaryConcern, lastMessage) {
	// 優先使用實際的用戶問題作為標題
	if (lastMessage && typeof lastMessage === "string" && lastMessage.trim()) {
		// 清理和截取用戶問題，用作標題
		const cleanedMessage = lastMessage.replace(/\s+/g, " ").trim();

		// 如果消息太長，截取前40個字符並加上省略號
		if (cleanedMessage.length > 40) {
			return cleanedMessage.substring(0, 40) + "...";
		}

		return cleanedMessage;
	}

	// 備用方案：使用傳統的分類標題
	const concernTitles = {
		感情: "感情諮詢",
		工作: "事業運勢",
		事業: "事業運勢",
		財運: "財運分析",
		健康: "健康運勢",
		人際: "人際關係",
		子女: "子女運勢",
		居家佈局: "居家風水",
	};

	if (primaryConcern && concernTitles[primaryConcern]) {
		return concernTitles[primaryConcern];
	}

	return "風水諮詢";
}

// 輔助函數：生成預覽文字
function generatePreview(message) {
	if (!message) return "暫無內容";

	// 清理文字並截取前30個字符
	const cleaned = message.replace(/\s+/g, " ").trim();
	return cleaned.length > 30 ? cleaned.substring(0, 30) + "..." : cleaned;
}

// 輔助函數：提取話題標籤
function extractTopics(primaryConcern, lastMessage) {
	const topics = [];

	// 主要關注領域
	if (primaryConcern) {
		topics.push(primaryConcern);
	}

	// 從訊息內容提取其他話題
	if (lastMessage) {
		const topicKeywords = {
			感情: ["感情", "愛情", "桃花", "姻緣", "戀愛", "分手", "結婚"],
			事業: ["工作", "事業", "職場", "升職", "跳槽", "創業"],
			財運: ["財運", "賺錢", "投資", "理財", "收入", "金錢"],
			健康: ["健康", "身體", "養生", "病痛", "醫療"],
			人際: ["人際", "朋友", "同事", "合作", "社交"],
			子女: ["子女", "孩子", "教育", "學習", "考試"],
			居家: ["居家", "房子", "搬家", "裝修", "佈局"],
			八字: ["八字", "命盤", "五行", "天干", "地支"],
		};

		for (const [topic, keywords] of Object.entries(topicKeywords)) {
			if (keywords.some((keyword) => lastMessage.includes(keyword))) {
				if (!topics.includes(topic)) {
					topics.push(topic);
				}
			}
		}
	}

	return topics.slice(0, 3); // 最多返回3個話題
}

// 輔助函數：獲取最後一條用戶消息 - 支持兩種數據格式
function getLastUserMessage(lastMessage) {
	if (!lastMessage) return null;

	// 新格式：role/content
	if (lastMessage.role && lastMessage.content) {
		return lastMessage.role === "user" ? lastMessage.content : null;
	}

	// 舊格式：userMessage/assistantMessage
	if (lastMessage.userMessage) {
		return lastMessage.userMessage;
	}

	return null;
}
