import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongo from "@/lib/mongoose";
import SmartUserIntent from "@/models/SmartUserIntent";
import ChatHistory from "@/models/ChatHistory"; // 🆕 新增：使用新的ChatHistory模型
import CoupleReportDoc from "@/models/CoupleReportDoc"; // 🎯 新增：合婚報告模型
import EnhancedConversationMemoryManager from "@/lib/enhancedConversationMemoryManager";
import DailyAnalysisRateLimit from "@/lib/dailyAnalysisRateLimit"; // 🚫 新增：每日分析限制
import { getLocaleAndRegionFromRequest } from "@/utils/regionalPricing"; // 🌍 新增：區域定價支援

// 🧹 Markdown 清理工具函數 - 移除格式標記符
function cleanMarkdownFormatting(text) {
	if (!text || typeof text !== "string") {
		return text;
	}

	// 移除 ** 粗體標記，保留內容
	let cleaned = text.replace(/\*\*(.*?)\*\*/g, "$1");

	// 移除其他常見 markdown 標記但保留內容
	cleaned = cleaned.replace(/\*(.*?)\*/g, "$1"); // 斜體 *text*
	cleaned = cleaned.replace(/`(.*?)`/g, "$1"); // 程式碼 `text`
	cleaned = cleaned.replace(/~~(.*?)~~/g, "$1"); // 刪除線 ~~text~~

	// 清理多餘的空行（超過2個連續換行）
	cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

	return cleaned;
}

// 🔧 生日解析工具函數 - 複製自 Smart-Chat
function parseFlexibleDate(dateString) {
	if (!dateString || typeof dateString !== "string") {
		return null;
	}

	// 移除多餘字符，統一格式
	let cleaned = dateString
		.replace(/[年月日]/g, "-")
		.replace(/[\/]/g, "-")
		.replace(/\s+/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

	// 嘗試各種日期格式
	const patterns = [
		/^(\d{4})-(\d{1,2})-(\d{1,2})$/,
		/^(\d{1,2})-(\d{1,2})-(\d{4})$/,
		/^(\d{4})(\d{2})(\d{2})$/,
	];

	for (const pattern of patterns) {
		const match = cleaned.match(pattern);
		if (match) {
			let year, month, day;

			if (pattern.source.includes("(\\d{4})-(\\d{1,2})-(\\d{1,2})")) {
				[, year, month, day] = match;
			} else if (
				pattern.source.includes("(\\d{1,2})-(\\d{1,2})-(\\d{4})")
			) {
				[, month, day, year] = match;
			} else {
				[, year, month, day] = match;
			}

			const date = new Date(
				parseInt(year),
				parseInt(month) - 1,
				parseInt(day)
			);

			// Dynamic year validation - allow up to current year + 1 for future planning
			const currentYear = new Date().getFullYear();
			if (
				!isNaN(date.getTime()) &&
				date.getFullYear() >= 1900 &&
				date.getFullYear() <= currentYear + 1
			) {
				return date;
			}
		}
	}

	return null;
}

// 🧹 Clean up lunar calendar terms from AI responses
function cleanLunarCalendarTerms(text) {
	if (!text || typeof text !== "string") return text;

	return (
		text
			// Remove 農曆 prefix from months
			.replace(/農曆([一二三四五六七八九十]+月)/g, "$1")
			.replace(/農曆([0-9]+月)/g, "$1")
			.replace(
				/農曆(正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月)/g,
				"$1"
			)
			// Remove 農曆 prefix from specific days
			.replace(/農曆(初[一二三四五六七八九十]+)/g, "每月$1")
			.replace(/農曆(十[一二三四五六七八九]+)/g, "每月$1")
			.replace(/農曆(廿[一二三四五六七八九十]+)/g, "每月$1")
			// Replace specific problematic phrases
			.replace(/農曆九月出生/g, "9月出生")
			.replace(/農曆十月出生/g, "10月出生")
			.replace(/農曆八月出生/g, "8月出生")
			.replace(/農曆七月出生/g, "7月出生")
			// Clean up day references
			.replace(/農曆初七/g, "每月7日")
			.replace(/農曆十五/g, "每月15日")
			.replace(/農曆十九/g, "每月19日")
			// Remove any remaining 農曆 references
			.replace(/農曆/g, "")
	);
}

// 🎂 檢查用戶是否有已保存的生日並生成相應消息
async function checkSavedBirthdayAndGenerateMessage(
	userEmail,
	userId,
	topic,
	aiResponse = null
) {
	try {
		// 搜索該用戶是否有已保存且確認的生日
		const existingBirthdayData = await SmartUserIntent.findOne({
			$or: [{ userEmail: userEmail }, { userId: userId }],
			userBirthday: { $exists: true, $ne: null },
			birthdayConfirmed: true,
		}).sort({ updatedAt: -1 });

		if (existingBirthdayData && existingBirthdayData.userBirthday) {
			// 格式化已保存的生日
			const savedDate = new Date(existingBirthdayData.userBirthday);
			const formattedDate = `${savedDate.getFullYear()}年${savedDate.getMonth() + 1}月${savedDate.getDate()}日`;

			const topicText = topic || "命理";

			// 如果有 AI 分析回應，先顯示分析，再顯示生日確認
			let fullMessage = "";
			if (aiResponse && aiResponse.trim()) {
				// 🔧 清理 AI 回應中的生日請求部分（因為我們會顯示生日確認菜單）
				let cleanedAiResponse = aiResponse
					// 移除生日格式範例部分
					.replace(
						/📅\s*生日格式範例[：:][^風]*風鈴會[^💕]*💕?/gs,
						""
					)
					// 移除生日請求相關句子
					.replace(
						/如果你願意分享生日[^。！？\n]*(。|！|？|\n|$)/g,
						""
					)
					.replace(/告訴.*?你的生日[^。！？\n]*(。|！|？|\n|$)/g, "")
					.replace(/請.*?提供.*?生日[^。！？\n]*(。|！？|\n|$)/g, "")
					// 清理多餘空行
					.replace(/\n{3,}/g, "\n\n")
					.trim();

				fullMessage = `${cleanedAiResponse}

───────────────────

風鈴發現你之前提供過生日資料呢！📅

你上次的生日是：**${formattedDate}**

請選擇：
1️⃣ 使用這個生日進行${topicText}分析
2️⃣ 我想使用其他生日

請回覆「1」或「2」～`;
			} else {
				fullMessage = `風鈴發現你之前提供過生日資料呢！📅

你上次的生日是：**${formattedDate}**

請選擇：
1️⃣ 使用這個生日進行${topicText}分析
2️⃣ 我想使用其他生日

請回覆「1」或「2」～`;
			}

			return {
				hasSavedBirthday: true,
				savedBirthday: existingBirthdayData.userBirthday,
				message: fullMessage,
			};
		}

		// 沒有保存的生日，返回標準請求消息
		return {
			hasSavedBirthday: false,
			savedBirthday: null,
			message: `告訴風鈴你的生日，我可以幫你看看${topic || "命理"}方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`,
		};
	} catch (error) {
		console.error("🚨 檢查已保存生日失敗:", error);
		// 錯誤時返回標準請求
		return {
			hasSavedBirthday: false,
			savedBirthday: null,
			message: `告訴風鈴你的生日，我可以幫你看看${topic || "命理"}方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日`,
		};
	}
}

// 🔧 檢測訊息中同時包含主題和生日的函數 - 使用AI分析而非關鍵詞
async function detectTopicAndBirthday(message, locale = "zh-TW") {
	if (!message || typeof message !== "string") {
		return null;
	}

	// 生日格式模式 - 支持多種格式
	const birthdayPatterns = [
		/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/g,
		/(\d{4}\-\d{1,2}\-\d{1,2})/g,
		/(\d{4}\/\d{1,2}\/\d{1,2})/g,
		/(\d{1,2}\/\d{1,2}\/\d{4})/g,
	];

	let detectedTopic = null;
	let detectedBirthday = null;

	// 🤖 使用AI分析主題 - 更準確的理解用戶意圖
	try {
		// 創建臨時的AI分析器實例
		const tempClassifier = new AITopicClassifier(locale);
		const aiAnalysis = await tempClassifier.analyzeMessage(message);

		// 如果AI檢測到有效主題且在服務範圍內
		if (
			aiAnalysis &&
			aiAnalysis.isWithinScope &&
			aiAnalysis.detectedTopic !== "其他"
		) {
			detectedTopic = aiAnalysis.detectedTopic;
			console.log(
				"🤖 AI檢測到主題:",
				detectedTopic,
				"信心度:",
				aiAnalysis.confidence
			);
		}
	} catch (error) {
		console.error("🚨 AI主題檢測失敗，使用備用關鍵詞檢測:", error);

		// 🔄 備用：關鍵詞檢測（僅在AI失敗時使用）
		const topicKeywords = {
			感情: [
				"感情",
				"愛情",
				"戀愛",
				"桃花",
				"分手",
				"復合",
				"婚姻",
				"單身",
				"測感情",
			],
			工作: [
				"工作",
				"事業",
				"職場",
				"升職",
				"跳槽",
				"生意",
				"經營",
				"創業",
				"公司",
				"商業",
				"工作運勢",
				"測工作",
			],
			財運: [
				"財運",
				"財富",
				"賺錢",
				"投資",
				"理財",
				"收入",
				"金錢",
				"偏財",
				"正財",
				"橫財",
				"測財運",
			],
			健康: [
				"健康",
				"身體",
				"疾病",
				"養生",
				"調理",
				"測健康",
				"癌症",
				"病",
				"生病",
				"手術",
				"醫生",
				"醫院",
				"治療",
			],
		};

		for (const [topic, keywords] of Object.entries(topicKeywords)) {
			if (keywords.some((keyword) => message.includes(keyword))) {
				detectedTopic = topic;
				console.log("🔄 備用關鍵詞檢測到主題:", detectedTopic);
				break;
			}
		}
	}

	// 檢測生日
	for (const pattern of birthdayPatterns) {
		const matches = message.matchAll(pattern);
		for (const match of matches) {
			const parsedDate = parseFlexibleDate(match[1]);
			if (parsedDate) {
				detectedBirthday = {
					original: match[1],
					parsed: parsedDate,
					standardFormat: `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`,
				};
				console.log("📅 檢測到生日:", detectedBirthday.standardFormat);
				break;
			}
		}
		if (detectedBirthday) break;
	}

	// 如果同時檢測到主題和生日，返回結果
	if (detectedTopic && detectedBirthday) {
		console.log(
			"✅ 同時檢測到主題和生日:",
			detectedTopic,
			"+",
			detectedBirthday.standardFormat
		);
		return {
			hasTopicAndBirthday: true,
			topic: detectedTopic,
			birthday: detectedBirthday,
			originalMessage: message,
		};
	}

	return null;
}

// 🔧 雙方生日解析函數 - 複製自 Smart-Chat
function parseCouplesBirthdays(message) {
	if (!message || typeof message !== "string") {
		return null;
	}

	// 檢測包含兩個生日的格式：支持所有性別組合，並識別性別
	const couplePatterns = [
		// 我XXX，她XXX (male user, female partner) - 如果說"她"，用戶應該是男性
		{
			pattern:
				/我\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,\s]*她\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			userGender: "male",
			partnerGender: "female",
		},
		// 我XXX，他XXX (female user, male partner) - 如果說"他"，用戶應該是女性
		{
			pattern:
				/我\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,\s]*他\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			userGender: "female",
			partnerGender: "male",
		},
		// 我的生日是XXX，他的生日是XXX (female user, male partner)
		{
			pattern:
				/我的生日是\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,\s]*他的生日是\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			userGender: "female",
			partnerGender: "male",
		},
		// 我的生日是XXX，她的生日是XXX (male user, female partner)
		{
			pattern:
				/我的生日是\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,\s]*她的生日是\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			userGender: "male",
			partnerGender: "female",
		},
		// 我XXX，對方XXX (gender neutral - assume female user)
		{
			pattern:
				/我\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,\s]*對方\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			userGender: "female",
			partnerGender: "unknown",
		},
		// Standard date formats with gender detection
		{
			pattern:
				/我\s*(\d{4}\-\d{1,2}\-\d{1,2})[，,\s]*他\s*(\d{4}\-\d{1,2}\-\d{1,2})/,
			userGender: "female",
			partnerGender: "male",
		},
		{
			pattern:
				/我\s*(\d{4}\-\d{1,2}\-\d{1,2})[，,\s]*她\s*(\d{4}\-\d{1,2}\-\d{1,2})/,
			userGender: "male",
			partnerGender: "female",
		},
		{
			pattern:
				/我\s*(\d{1,2}\/\d{1,2}\/\d{4})[，,\s]*他\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
			userGender: "female",
			partnerGender: "male",
		},
		{
			pattern:
				/我\s*(\d{1,2}\/\d{1,2}\/\d{4})[，,\s]*她\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
			userGender: "male",
			partnerGender: "female",
		},
		// Fallback: any two dates in one message (assume female user, unknown partner)
		{
			pattern:
				/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)[，,\s]*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日]?)/,
			userGender: "female",
			partnerGender: "unknown",
		},
		{
			pattern:
				/(\d{4}\-\d{1,2}\-\d{1,2})[，,\s]*(\d{4}\-\d{1,2}\-\d{1,2})/,
			userGender: "female",
			partnerGender: "unknown",
		},
	];

	for (const patternObj of couplePatterns) {
		const match = message.match(patternObj.pattern);
		if (match) {
			const userBirthday = parseFlexibleDate(match[1]);
			const partnerBirthday = parseFlexibleDate(match[2]);

			if (userBirthday && partnerBirthday) {
				return {
					hasCouplesBirthdays: true,
					userBirthday: userBirthday,
					partnerBirthday: partnerBirthday,
					userGender: patternObj.userGender,
					partnerGender: patternObj.partnerGender,
					rawText: match[0],
				};
			}
		}
	}

	return null;
}

// 🔧 格式化合婚分析回應 - 將結構化對象轉換為字符串
function formatCoupleAnalysisResponse(analysisResult) {
	if (!analysisResult || typeof analysisResult !== "object") {
		return analysisResult;
	}

	let formattedResponse = "";

	// 1. 雙方基礎分析
	if (analysisResult.basicAnalysis) {
		formattedResponse += analysisResult.basicAnalysis + "\n\n";
	}

	// 2. 針對具體問題回應
	if (analysisResult.problemResponse) {
		formattedResponse += analysisResult.problemResponse + "\n\n";
	}

	// 3. 配對分析
	if (analysisResult.compatibilityAnalysis) {
		formattedResponse += analysisResult.compatibilityAnalysis + "\n\n";
	}

	// 4. 實用解決方案
	if (analysisResult.practicalSolutions) {
		formattedResponse += analysisResult.practicalSolutions + "\n\n";
	}

	// 5. 專屬感情解析
	if (analysisResult.exclusiveInsights) {
		formattedResponse += analysisResult.exclusiveInsights + "\n\n";
	}

	// 6. 合婚報告推薦
	if (analysisResult.reportRecommendation) {
		const rec = analysisResult.reportRecommendation;
		formattedResponse += `───────────────────\n💎 **想要更深入的分析嗎？**\n根據你們的狀況，風鈴為你們推薦：\n\n`;

		if (rec.options && rec.options.length > 0) {
			// 處理多選項格式
			rec.options.forEach((option) => {
				formattedResponse += `**${option.number} ${option.title}** 價值${option.originalPrice}，限時優惠${option.price}\n`;
				if (option.features && option.features.length > 0) {
					option.features.forEach((feature) => {
						formattedResponse += `- ${feature}\n`;
					});
				}
				formattedResponse += `\n`;
			});
			formattedResponse += `${rec.action}`;
		} else {
			// 處理舊的單選項格式 (向後兼容)
			formattedResponse += `**${rec.title}** 價值${rec.originalPrice}，限時優惠${rec.price}\n`;
			if (rec.features && rec.features.length > 0) {
				rec.features.forEach((feature) => {
					formattedResponse += `- ${feature}\n`;
				});
			}
			formattedResponse += `\n${rec.action}`;
		}
	}

	return formattedResponse.trim();
}

// 🤖 AI 話題分類和問題檢測系統
class AITopicClassifier {
	constructor(locale = "zh-TW") {
		// AI 話題分類初始化
		this.DEEPSEEK_API_KEY =
			process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
		this.DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
		this.locale = locale; // 🌐 Store locale for AI response language

		console.log("🔧 AITopicClassifier 初始化");
		console.log(
			"📊 DEEPSEEK_API_KEY:",
			this.DEEPSEEK_API_KEY ? "已設置" : "未設置"
		);
		console.log("🌐 DEEPSEEK_API_URL:", this.DEEPSEEK_API_URL);
		console.log("🌐 Locale:", this.locale);

		// 🧠 MINIMAL ENHANCEMENT: Add conversation memory and emotional detection
		this.conversationMemory = new Map();
		this.successPatterns = new Map();
		this.emotionalKeywords = {
			urgent: [
				"急",
				"馬上",
				"立刻",
				"快",
				"倒閉",
				"完蛋",
				"救命",
				"緊急",
			],
			anxious: ["焦慮", "擔心", "緊張", "不安", "害怕", "煩惱"],
			confused: ["迷茫", "困惑", "不知道", "不懂", "搞不清楚", "不明白"],
			desperate: ["沒辦法", "絕望", "完了", "救救我", "走投無路"],
			repeated: ["還是", "依然", "仍然", "又", "再次", "繼續"],
		};
		console.log("🧠 Minimal Enhancement Initialized");

		// 我們提供的核心服務領域
		this.supportedTopics = {
			感情: [
				"戀愛",
				"分手",
				"復合",
				"合婚",
				"桃花運",
				"婚姻",
				"感情運勢",
				"感情",
				"愛情",
				"測感情",
			],
			財運: [
				"賺錢",
				"投資",
				"理財",
				"偏財運",
				"正財運",
				"破財",
				"財運",
				"測財運",
				"財富",
				"金錢",
			],
			工作: [
				"升職",
				"跳槽",
				"職場運勢",
				"事業發展",
				"工作機會",
				"職業規劃",
				"工作",
				"事業",
				"生意",
				"經營",
				"創業",
				"業務",
				"公司",
				"職場",
				"工作問題",
				"事業問題",
				"生意問題",
				"經營困難",
				"業績",
				"營收",
				"商業",
				"結束生意",
				"關閉公司",
				"停業",
				"轉行",
				"工作運勢",
				"測工作",
				"加薪",
				"加人工",
				"薪資",
				"薪水",
				"人工",
				"加工資",
				"薪資調整",
				"收入提升",
				"職場表現",
				"工作壓力",
				"老闆",
				"主管",
				"同事關係",
				"職業發展",
				"工作時機",
			],
			健康: [
				"身體健康",
				"疾病",
				"養生",
				"健康運勢",
				"身體調理",
				"健康",
				"身體",
				"測健康",
			],
			命理: [
				"命理",
				"八字",
				"紫微斗數",
				"命盤",
				"流年",
				"大運",
				"命運",
				"算命",
				"占卜",
				"預測",
				"運勢",
				"命格",
				"五行",
				"天干地支",
				"命理分析",
				"測命理",
				"生辰八字",
				"命理諮詢",
			],
			子女: [
				"懷孕",
				"生育",
				"子女運",
				"親子關係",
				"教育",
				"子女",
				"小孩",
				"測子女",
			],
			風水佈局: [
				"風水",
				"居家風水",
				"辦公室風水",
				"風水測量",
				"風水調整",
				"方位分析",
				"擺設建議",
				"風水原理",
				"風水知識",
				"佈局",
				"測風水",
				"風水方法",
			],
		};

		console.log(
			"🎯 supportedTopics 設置完成:",
			Object.keys(this.supportedTopics)
		);
	}

	// 🧠 MINIMAL ENHANCEMENT: Emotional State Detection
	detectEmotionalState(message) {
		const emotions = {};

		Object.entries(this.emotionalKeywords).forEach(
			([emotion, keywords]) => {
				emotions[emotion] = keywords.some((keyword) =>
					message.includes(keyword)
				);
			}
		);

		console.log("😊 Emotional state detected:", emotions);
		return emotions;
	}

	// 🧠 MINIMAL ENHANCEMENT: Update Conversation History
	updateConversationHistory(sessionId, message, response, topic) {
		if (!sessionId) return;

		if (!this.conversationMemory.has(sessionId)) {
			this.conversationMemory.set(sessionId, {
				messages: [],
				successfulAdvice: [],
				preferredTopic: null,
				emotionalPattern: [],
				irrelevantCount: 0, // Track irrelevant questions
				lastRelevantTopic: null,
			});
		}

		const session = this.conversationMemory.get(sessionId);

		// Track irrelevant questions
		if (topic === "其他") {
			session.irrelevantCount++;
			console.log(
				`📊 Irrelevant question count: ${session.irrelevantCount}`
			);
		} else {
			session.lastRelevantTopic = topic;
			// Reset counter on relevant question
			if (session.irrelevantCount > 0) {
				session.irrelevantCount = Math.max(
					0,
					session.irrelevantCount - 1
				);
			}
		}

		session.messages.push({
			message,
			response,
			topic,
			timestamp: new Date(),
			isRelevant: topic !== "其他",
		});

		// Keep only last 5 messages to avoid memory bloat
		if (session.messages.length > 5) {
			session.messages.shift();
		}

		console.log(
			`💭 Conversation history updated for ${sessionId}: ${session.messages.length} messages, irrelevant: ${session.irrelevantCount}`
		);
	}

	// 🧠 MINIMAL ENHANCEMENT: Get Conversation Context
	getConversationContext(sessionId) {
		if (!sessionId || !this.conversationMemory.has(sessionId)) {
			return { hasHistory: false, irrelevantCount: 0 };
		}

		const session = this.conversationMemory.get(sessionId);
		return {
			hasHistory: true,
			messageCount: session.messages.length,
			recentMessages: session.messages.slice(-3),
			preferredTopic: session.preferredTopic,
			irrelevantCount: session.irrelevantCount || 0,
			lastRelevantTopic: session.lastRelevantTopic,
		};
	}

	// 🎯 Determine redirect level based on conversation history
	determineRedirectLevel(context) {
		// Always use gentle approach - user prefers engaging, helpful responses
		// regardless of conversation history
		return "gentle"; // Always helpful answer + soft redirect
	}

	// 🎯 檢測用戶是否輸入了具體的服務名稱
	detectSpecificServiceRequest(message) {
		const cleanMessage = message.trim();

		// 精確的服務名稱匹配
		const serviceKeywords = {
			流年運勢分析: "命理",
			工作事業分析: "工作",
			感情運勢分析: "感情",
			感情分析: "感情",
			健康運勢: "健康",
			健康分析: "健康",
			財運分析: "財運",
			命理分析: "命理",
			八字分析: "命理",
		};

		// 檢查是否包含具體服務名稱
		for (const [serviceName, topic] of Object.entries(serviceKeywords)) {
			if (cleanMessage.includes(serviceName)) {
				console.log(
					`✅ 檢測到具體服務要求: ${serviceName} -> ${topic}`
				);
				return { serviceName, detectedTopic: topic };
			}
		}

		return null;
	}

	// 🎯 測算具體服務選擇引導
	generateSpecificServiceGuide(serviceName, detectedTopic) {
		const serviceGuides = {
			命理: `太好了！風鈴最擅長命理分析呢～✨

為了給你最準確的分析，請告訴風鈴你的**生日**：

📅 **請用以下格式提供生日：**
• 1999-03-15  
• 1999/3/15
• 1999年3月15日

我會為你提供專業的八字命理分析，包括流年運勢、五行特質和開運建議喔～💫`,

			感情: `太棒了！感情分析是風鈴的專業強項呢～💕

請提供你的生日，讓我幫你分析感情運勢：

📅 請用以下格式提供生日：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

我會幫你分析桃花運勢、感情走向和最佳戀愛時機～🌸`,

			工作: `好的！工作事業運勢分析交給風鈴就對了～💼

請告訴我你的生日，讓我為你分析事業運程：

📅 請用以下格式提供生日：
• 1999-03-15
• 1999/3/15
• 1999年3月15日

我會分析你的職場運勢、事業發展機會和最佳轉職時機喔～✨`,

			健康: `健康運勢分析來了！風鈴會用心為你解讀～🌿

請提供你的生日，讓我分析你的健康運程：

📅 請用以下格式提供生日：
• 1999-03-15
• 1999/3/15
• 1999年3月15日

我會為你分析身心健康狀況、養生建議和保健重點～💚`,

			財運: `財運分析！風鈴最喜歡幫人看財運了～💰

請告訴我你的生日，讓我分析你的財富運勢：

📅 請用以下格式提供生日：
• 1999-03-15
• 1999/3/15
• 1999年3月15日

我會幫你看正財偏財、投資理財和招財開運方法喔～✨`,
		};

		return serviceGuides[detectedTopic] || serviceGuides["命理"];
	}

	// 🎯 更新會話記憶
	updateConversationMemory(
		sessionId,
		userMessage,
		assistantResponse,
		metadata = {}
	) {
		if (!sessionId) return;

		if (!this.conversationMemory.has(sessionId)) {
			this.conversationMemory.set(sessionId, {
				messages: [],
				irrelevantCount: 0,
				preferredTopic: null,
				lastRelevantTopic: null,
			});
		}

		const session = this.conversationMemory.get(sessionId);

		// 添加消息到歷史
		session.messages.push(
			{ role: "user", content: userMessage, timestamp: new Date() },
			{
				role: "assistant",
				content: assistantResponse,
				timestamp: new Date(),
			}
		);

		// 更新元數據
		if (metadata.isServiceConfirmation) {
			session.awaitingBirthday = true;
		}
		if (metadata.awaitingBirthday) {
			session.awaitingBirthday = metadata.awaitingBirthday;
		}

		// 保持最近的20條消息
		if (session.messages.length > 20) {
			session.messages = session.messages.slice(-20);
		}

		this.conversationMemory.set(sessionId, session);
		console.log(`💭 會話記憶已更新 ${sessionId}:`, {
			messageCount: session.messages.length,
			awaitingBirthday: session.awaitingBirthday,
		});
	}

	// 🎯 獲取會話記憶
	getConversationMemory(sessionId) {
		if (!sessionId || !this.conversationMemory.has(sessionId)) {
			return null;
		}
		return this.conversationMemory.get(sessionId);
	}

	// 🎯 測算帶有分析額度信息的生日收集模板
	async generateBirthdayTemplate(userEmail, userId, topicText = "運勢") {
		let rateLimitInfo = "";

		try {
			const userStats = await DailyAnalysisRateLimit.getUserStats(
				userEmail,
				userId
			);
			const remainingAnalyses = userStats.remaining || 10;
			const dailyLimit = 10;

			rateLimitInfo = `\n\n📊 **今日分析額度**: 你每日可進行 ${dailyLimit} 次專業分析，目前還剩 ${remainingAnalyses} 次機會哦～`;
		} catch (error) {
			console.log("⚠️ 獲取分析額度信息失敗:", error);
		}

		return `

告訴風鈴你的生日，我可以幫你看看${topicText}方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕${rateLimitInfo}`;
	}

	// 🎯 Build customized prompt based on redirect level
	buildRedirectPrompt(question, redirectLevel, context) {
		// Get current date for context
		const currentDate = new Date();
		const currentDateStr = currentDate.toLocaleDateString("zh-TW", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
		});

		// 🌐 Determine language instruction based on locale
		const languageInstruction =
			this.locale === "zh-CN"
				? "必須使用簡體中文回應，不可使用繁體中文"
				: "必須使用繁體中文回應，不可使用簡體中文";

		const baseServices = `現有服務範圍：
- 感情運勢分析（桃花運、合婚配對）
- 工作事業分析（職場運勢、事業發展）  
- 財運分析（投資理財、收入提升）
- 健康運勢（身心調理、養生建議）
- 命理分析（八字解讀、流年運勢）`;

		switch (redirectLevel) {
			case "firm":
				return `用戶問題：${question}

當前日期：${currentDateStr}（僅作為內部參考，不需要在回應中提及具體日期）

你是風鈴，用戶已經連續問了多個與風水命理無關的問題。需要友善但堅定地引導用戶使用你的專業服務。

重要指示：${languageInstruction}，不要包含字數統計標記。如果需要提及時間，請確保是當前的2025年，避免提及2024年或過去的時間。只在真正需要時間背景的情況下才提及日期。

回應風格：
- 先簡短回答問題，然後自然地說明風水命理分析能解決更深層的問題
- 主動推薦具體服務並說明價值，創造緊迫感和需求感
- 用自然對話的方式，避免機械式的回應

語氣要求：友善但堅定，專注於服務銷售
${baseServices}

重點：不要只是介紹服務，要說明為什麼用戶需要這些分析，強調能解決的問題和帶來的好處。

**專業術語運用：**
- 對於飲食相關問題，可適當提及五行元素（金木水火土）與食材的對應關係
- 展現專業權威性，增加服務說服力

**結尾要求：**
- 根據用戶問題的內容，推薦1-2個最相關的服務
- 使用格式：想要開始分析的話，請輸入：「XXX分析」
- 在服務推薦後添加一句強調緊迫性和價值的結語，要有多樣化表達
- 最後可選擇添加多樣化的結尾句，避免重複使用同一句
- 不要列出所有5個服務，只推薦最相關的`;

			case "moderate":
				return `用戶問題：${question}

當前日期：${currentDateStr}（僅作為內部參考，不需要在回應中提及具體日期）

你是風鈴，用戶問了一些與風水命理無關的問題。需要在回答的同時積極推薦你的專業服務。

重要指示：${languageInstruction}，不要包含字數統計標記。如果需要提及時間，請確保是當前的2025年，避免提及2024年或過去的時間。只在真正需要時間背景的情況下才提及日期。

回應風格：
- 先給出實用答案，然後自然地連結問題與運勢命理的關係
- 說明專業分析能提供的具體幫助，主動推薦最相關的服務並強調效果
- 用自然對話的方式，避免機械式的回應

${baseServices}

重點：要讓用戶感覺到他們的問題其實與運勢有關，你的專業分析能提供更深層的解答。

**專業術語運用：**
- 對於飲食相關問題，可適當提及五行元素（金木水火土）與食材的對應關係
- 對於顏色、材質、方位相關問題，可引用風水五行理論

**結尾要求：**
- 根據用戶問題的內容，推薦1-2個最相關的服務
- 使用格式：想了解的話，請輸入：「XXX分析」
- 在服務推薦後添加一句吸引人的結語，可從相關類別中選擇多樣化表達
- 最後可選擇添加多樣化的結尾句，避免重複使用同一句
- 不要列出所有5個服務，只推薦最相關的`;

			case "gentle":
			default:
				return `用戶問題：${question}

當前日期：${currentDateStr}（僅作為內部參考，不需要在回應中提及具體日期）

你是友善的風鈴，用戶問了一個與風水命理無關的問題。請給用戶實用回答，然後積極引導他們了解你的專業服務。

重要指示：${languageInstruction}，不要包含字數統計標記。如果需要提及時間，請確保是當前的2025年，避免提及2024年或過去的時間。只在真正需要時間背景的情況下才提及日期，不要強制在每個回應中都包含。

回應風格：
- 先給出實用的答案或建議（要具體有用），然後巧妙連結問題與命理運勢的關係
- 說明你的專業分析能提供更深入的幫助，推薦最相關的服務並強調能解決的問題
- 用風鈴的親切語氣，但要展現專業權威性
- 用自然對話的方式，避免機械式列點回應

${baseServices}

重點：不只是回答表面問題，要讓用戶意識到背後可能有運勢因素，你的專業分析能提供根本解決方案。主動創造需求，不要只是被動介紹服務。

**專業術語運用：**
- 對於飲食相關問題，可適當提及五行元素（金木水火土）與食材的對應關係
- 對於顏色、材質、方位相關問題，可引用風水五行理論
- 用專業但易懂的方式說明五行與日常生活的關聯

**結尾要求：**
- 根據用戶問題，推薦1-2個最相關的服務
- 使用格式：想要開始分析的話，請輸入：「XXX分析」
- 在服務推薦後添加一句吸引人的結語，可從以下選項中選擇：

**禮物/購物相關：**
「讓風鈴用專業視角幫你選出最開運的選擇吧！」
「一起為他挑選帶來好運的心意禮物～」
「讓每份禮物都成為幸運的開始！」

**飲食/健康相關：**
「讓我為你找出最適合的養生搭配，提升整體運勢！」
「一起用五行智慧打造專屬你的健康食譜～」
「讓每一餐都成為滋養運勢的能量來源！」

**工作/事業相關：**
「助你找到事業發展的最佳時機和策略！」
「讓風鈴為你的職場路指引明燈～」
「一起開創屬於你的成功運勢！」

**感情/關係相關：**
「讓風鈴幫你解開感情迷霧，找到真愛方向！」
「一起為你的愛情運勢注入正能量～」
「讓每段緣分都開花結果！」

**其他生活問題：**
「讓專業命理為你的生活帶來更多好運！」
「一起用古老智慧解決現代煩惱～」
「讓風鈴成為你人生路上的貴人！」

- 最後可選擇添加以下其中一句（避免每次都重複）：
「或有任何其他疑問，都可以直接同我講」
「有什麼想了解的，隨時找風鈴聊聊～」
「期待為你解答更多人生疑惑！」
「風鈴隨時在這裡為你服務呢！」
「或者你也可以跟我分享其他想法～」

- 例如：食物相關推薦「健康運勢」，工作相關推薦「工作事業分析」，感情相關推薦「感情分析」等
- 不要列出所有5個服務選項`;
		}
	}

	// 💼 工作分析流程 - 使用AI測算contextual回應
	async generateCareerFlow(analysis, originalMessage) {
		try {
			// 🤖 總是測算新的詳細AI回應，提供更好的用戶體驗
			const specificProblem = analysis.specificProblem || originalMessage;

			const aiResponse = await this.generateAIResponse(
				`用戶說: "${originalMessage}"
				
分析結果: ${specificProblem}

請以風鈴的身份，針對這個具體的工作問題，提供自然對話式的回應。

回應內容要求:
- 回應要豐富充實，至少3-4個段落，提供深度內容
- 用自然對話的方式回應，就像知心朋友在深度聊天
- 先深度表達理解和同理心
- 提供多個層面的實用建議，自然融入對話中
- 可以分享職場智慧、人生感悟
- 語氣要溫暖親切且有深度，像風鈴在面對面深談
- 適當使用emoji增加親切感
- 最後自然地邀請分享生日做進一步分析

回應風格:
- 內容豐富、有深度、溫暖且實用
- 像朋友間的深度對話，不是簡短回答
- 要有層次感和深度

請避免:
- 簡短或表面的回應
- 編號列點式回應
- 機械式的用詞
- 房屋風水佈局建議

重點關注: 深度心理支持、職場智慧、人生策略、實用溝通技巧`
			);

			// AI回應 + 生日分析邀請
			return (
				aiResponse +
				`

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
			);
		} catch (error) {
			console.error("AI測算工作回應失敗:", error);

			// 備用回應 - 根據關鍵詞判斷
			const lowerProblem = specificProblem.toLowerCase();
			let response = "";

			if (
				lowerProblem.includes("生意") ||
				lowerProblem.includes("經營") ||
				lowerProblem.includes("創業")
			) {
				response = `聽到你在生意經營上遇到問題，我完全理解這種困擾！💼

**生意風水的關鍵要素：**
🏢 店面或辦公室的位置和朝向很重要
💰 收銀台要背靠實牆，面向大門
🌱 在財位放置綠色植物能催旺生意
🔥 適當的照明和通風讓財氣流通

生意的成敗不只看努力，時機和風水佈局也很關鍵！`;
			} else if (
				lowerProblem.includes("升職") ||
				lowerProblem.includes("晉升") ||
				lowerProblem.includes("職場")
			) {
				response = `哇～想升職呀！風鈴知道一個小秘密哦！✨

辦公桌要對著門口坐，這樣機會才會看到你～  
還有！左邊放綠色小盆栽，右邊放黃色小東西，這樣老闆就會注意到你啦！

想不想知道更多升職的小魔法呀？`;
			} else {
				response = `了解到你在工作上遇到挑戰，讓風鈴來幫你分析一下！💪

**工作運勢提升建議：**
🎯 保持工作區域整潔有序
🌟 在辦公桌放置小型水晶增強能量  
📋 定期檢視和調整工作目標
🤝 維持良好的人際關係`;
			}

			response += `

告訴風鈴你的生日，我可以幫你看看事業運勢和最佳發展時機！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;

			return response;
		}
	}

	// 💰 財運分析流程 - 使用AI測算contextual回應
	async generateWealthFlow(analysis, originalMessage) {
		try {
			// 🤖 總是測算新的詳細AI回應，提供更好的用戶體驗
			const specificProblem = analysis.specificProblem || originalMessage;

			const aiResponse = await this.generateAIResponse(
				`用戶說: "${originalMessage}"
				
分析結果: ${specificProblem}

請以風鈴的身份，針對這個具體的財運問題，提供自然對話式的回應。

回應內容要求:
- 回應要豐富充實，至少3-4個段落，提供深度財務洞察
- 用自然對話的方式回應，就像理財顧問朋友在深度聊天
- 先深度表達理解，可以分享理財心得
- 提供多個層面的理財建議，自然融入對話中
- 可以分享投資智慧、財務管理經驗
- 語氣要溫暖親切且專業，像風鈴在面對面深談理財
- 適當使用emoji增加親切感
- 最後自然地邀請分享生日做進一步分析

回應風格:
- 內容豐富、有深度、溫暖且實用
- 像理財朋友間的深度對話，不是簡短回答
- 要有財務層次感和深度

請避免:
- 簡短或表面的回應
- 編號列點式回應
- 機械式的用詞
- 房屋風水佈局建議

重點關注: 深度財務分析、理財智慧、投資策略、財務心理學`
			);

			return (
				aiResponse +
				`

告訴風鈴你的生日，我可以幫你看看財運方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
			);
		} catch (error) {
			console.error("AI測算財運回應失敗:", error);
			return `哇～你想了解財運呀！風鈴最喜歡幫人解決問題啦！✨

每個人的運勢都不一樣呢，就像每個人的生日不一樣一樣！

告訴風鈴你的生日，我可以幫你看看財運方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;
		}
	}

	// 🌿 健康分析流程 - 使用AI測算contextual回應
	async generateHealthFlow(analysis, originalMessage) {
		try {
			// 🤖 總是測算新的詳細AI回應，提供更好的用戶體驗
			const specificProblem = analysis.specificProblem || originalMessage;

			const aiResponse = await this.generateAIResponse(
				`用戶說: "${originalMessage}"
				
分析結果: ${specificProblem}

請以風鈴的身份，針對這個具體的健康問題，提供自然對話式的回應。

回應內容要求:
- 回應要豐富充實，至少3-4個段落，提供深度健康關懷
- 用自然對話的方式回應，就像關心健康的知心朋友在深度聊天
- 先深度表達關心，可以分享養生心得
- 提供多個層面的健康建議，自然融入對話中
- 可以分享養生智慧、健康管理經驗
- 語氣要溫暖關懷且有深度，像風鈴在面對面深談健康
- 適當使用emoji增加關懷感
- 最後自然地邀請分享生日做進一步分析

回應風格:
- 內容豐富、有深度、溫暖且關懷
- 像健康朋友間的深度對話，不是簡短回答
- 要有健康層次感和深度

請避免:
- 簡短或表面的回應
- 編號列點式回應
- 醫療建議或機械式用詞
- 房屋風水佈局建議

重點關注: 深度健康關懷、養生智慧、生活品質提升、身心平衡`
			);

			return (
				aiResponse +
				`

告訴風鈴你的生日，我可以幫你看看健康方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
			);
		} catch (error) {
			console.error("AI測算健康回應失敗:", error);
			return `哇～你想了解健康呀！風鈴最喜歡幫人解決問題啦！✨

每個人的運勢都不一樣呢，就像每個人的生日不一樣一樣！

告訴風鈴你的生日，我可以幫你看看健康方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;
		}
	}

	// � 命理分析流程
	async generateMingliFlow(analysis, originalMessage) {
		try {
			// 🤖 總是生成新的詳細AI回應，提供更好的用戶體驗
			const specificProblem = analysis.specificProblem || originalMessage;

			const aiResponse = await this.generateAIResponse(
				`用戶說: "${originalMessage}"
				
分析結果: ${specificProblem}

請以風鈴的身份，針對這個具體的命理問題，提供自然對話式的回應。

回應內容要求:
- 回應要豐富充實，至少3-4個段落，提供深度人生智慧
- 用自然對話的方式回應，就像人生導師朋友在深度聊天
- 先深度表達理解，可以分享命理心得
- 提供多個層面的人生建議，自然融入對話中
- 可以分享人生智慧、命理經驗
- 語氣要溫暖有智慧感且深度，像風鈴在面對面深談人生
- 適當使用emoji增加溫暖感
- 最後自然地邀請分享生日做進一步分析

回應風格:
- 內容豐富、有深度、溫暖且有智慧
- 像人生導師間的深度對話，不是簡短回答
- 要有人生哲理層次感和深度

請避免:
- 簡短或表面的回應
- 編號列點式回應
- 過於玄學的用語或機械式用詞
- 房屋風水佈局建議

重點關注: 深度人生洞察、命理智慧、性格成長、人生規劃`
			);

			return (
				aiResponse +
				`

告訴風鈴你的生日，我可以幫你做命理分析哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的命理分析，如果你覺得有幫助，還可以做更詳細的完整八字報告哦～🔮💕`
			);
		} catch (error) {
			console.error("AI測算命理回應失敗:", error);
			return `哇～你想了解命理呀！風鈴最喜歡幫人解析運勢啦！🔮✨

每個人的命理格局都不一樣呢，就像每顆星星的位置都獨一無二！

告訴風鈴你的生日，我可以幫你做命理分析哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的命理分析，如果你覺得有幫助，還可以做更詳細的完整八字報告哦～🔮💕`;
		}
	}

	// 👶 子女分析流程 - 已停用（不再提供此服務）
	// generateChildrenFlow(analysis, originalMessage) {
	// 	// 🤖 優先使用已有的 AI 分析結果
	// 	if (analysis.aiResponse) {
	// 		console.log("✅ 使用已有的 AI 子女分析結果");
	// 		const fengShuiGreeting = `哇～你想了解子女呀！風鈴最喜歡幫人解決問題啦！✨

	// `;

	// 		const fengShuiAdvice = `

	// 建議在家中東方（文昌位）擺放書籍或文具，促進子女學業運勢！保持孩子房間整潔明亮，床頭靠牆有安全感～👶

	// 子女房避免擺放刀劍類裝飾，多用溫暖色調營造溫馨氛圍。親子溝通也很重要，耐心陪伴最珍貴！💕`;

	// 		// 組合：問候 + AI回應 + 建議
	// 		return (
	// 			fengShuiGreeting +
	// 			analysis.aiResponse +
	// 			fengShuiAdvice +
	// 			`

	// 告訴風鈴你的生日，我可以幫你看看子女方面的運勢哦！

	// 📅 **生日格式範例：**
	// • 1999-03-15
	// • 1999/3/15
	// • 1999年3月15日

	// 風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
	// 		);
	// 	}

	// 	// 備用模板回應
	// 	return `哇～你想了解子女呀！風鈴最喜歡幫人解決問題啦！✨

	// 每個人的運勢都不一樣呢，就像每個人的生日不一樣一樣！

	// 告訴風鈴你的生日，我可以幫你看看子女方面的運勢哦！

	// 📅 **生日格式範例：**
	// • 1999-03-15
	// • 1999/3/15
	// • 1999年3月15日

	// 風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;
	// }

	// 🔮 因緣分析流程 - 已停用（不再提供此服務）
	// generateDestinyFlow(analysis, originalMessage) {
	// 	// 🤖 優先使用已有的 AI 分析結果
	// 	if (analysis.aiResponse) {
	// 		console.log("✅ 使用已有的 AI 因緣分析結果");
	// 		const fengShuiGreeting = `哇～你想了解因緣呀！風鈴最喜歡幫人解決問題啦！✨

	// `;

	// 		const fengShuiAdvice = `

	// 建議在家中南方擺放紅色物品或燈飾，增強機會運勢！保持開放的心態，主動參與社交活動，好機緣會自然出現～🔮

	// 記得要相信緣分，同時也要主動創造機會。穿戴紫色或金色飾品，有助提升貴人運！✨`;

	// 		// 組合：問候 + AI回應 + 建議
	// 		return (
	// 			fengShuiGreeting +
	// 			analysis.aiResponse +
	// 			fengShuiAdvice +
	// 			`

	// 告訴風鈴你的生日，我可以幫你看看因緣方面的運勢哦！

	// 📅 **生日格式範例：**
	// • 1999-03-15
	// • 1999/3/15
	// • 1999年3月15日

	// 風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
	// 		);
	// 	}

	// 	// 備用模板回應
	// 	return `哇～你想了解因緣呀！風鈴最喜歡幫人解決問題啦！✨

	// 每個人的運勢都不一樣呢，就像每個人的生日不一樣一樣！

	// 告訴風鈴你的生日，我可以幫你看看因緣方面的運勢哦！

	// 📅 **生日格式範例：**
	// • 1999-03-15
	// • 1999/3/15
	// • 1999年3月15日

	// 風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;
	// }

	// 🔄 預設流程 - 使用AI測算詳細回應
	async generateDefaultFlow(analysis, originalMessage) {
		try {
			// 🤖 總是生成新的詳細AI回應，提供更好的用戶體驗
			const specificProblem = analysis.specificProblem || originalMessage;
			const topic = analysis.detectedTopic || "運勢";

			const aiResponse = await this.generateAIResponse(
				`用戶說: "${originalMessage}"
				
分析結果: ${specificProblem}

請以風鈴的身份，針對這個具體的${topic}問題，提供自然對話式的回應。

回應風格要求:
- 用自然對話的方式回應，就像朋友聊天一樣
- 先表達理解關心，然後自然地分享一些建議
- 語氣要溫暖親切，像風鈴在面對面聊天
- 避免列點式、條列式的機械化回應
- 建議要融入在對話中，不要刻意分段編號
- 適當使用emoji，但不要過多
- 最後自然地邀請分享生日做進一步分析

請避免:
- 編號列點 (1. 2. 3. 4.)
- 標題式分段 (如 ✨建議、💫方法等)
- 過於結構化的回應
- 機械式的用詞
- 房屋風水佈局建議

要像真人對話: 溫暖、自然、有同理心的朋友建議`
			);

			return (
				aiResponse +
				`

告訴風鈴你的生日，我可以幫你看看${topic}方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`
			);
		} catch (error) {
			console.error("AI測算默認回應失敗:", error);
			// 備用模板回應
			return `哇～你想了解${analysis.detectedTopic}呀！風鈴最喜歡幫人解決問題啦！✨

每個人的運勢都不一樣呢，就像每個人的生日不一樣一樣！

告訴風鈴你的生日，我可以幫你看看${analysis.detectedTopic}方面的運勢哦！

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;
		}
	}

	// 🎯 測算服務選單
	generateServiceMenu() {
		return `

我可以為你分析以下領域的風水運勢：

🌸 **感情** - 桃花運、姻緣配對
💼 **工作** - 事業發展、職場運勢
💰 **財運** - 投資理財、收入提升
🌿 **健康** - 身心調理、養生建議

你想了解哪一種？？？？`;
	}

	// 🎯 使用 AI 分析用戶消息 (Enhanced with minimal features)
	async analyzeMessage(message, sessionId = null) {
		try {
			// 🎯 優先檢查問候語
			if (this.isGreeting(message)) {
				console.log("👋 檢測到問候語，使用專用回應");
				const greetingResponse = this.generateGreetingResponse();

				// 🧠 ENHANCEMENT: Store conversation history
				if (sessionId) {
					this.updateConversationHistory(
						sessionId,
						message,
						greetingResponse.aiResponse,
						greetingResponse.detectedTopic
					);
				}

				return greetingResponse;
			}

			// 🧠 ENHANCEMENT: Detect emotional state
			const emotions = this.detectEmotionalState(message);

			// 🧠 ENHANCEMENT: Get conversation context
			const context = this.getConversationContext(sessionId);

			// 🧠 ENHANCEMENT: Build enhanced prompt with context
			const analysisPrompt = this.buildEnhancedAnalysisPrompt(
				message,
				emotions,
				context
			);

			const response = await this.callDeepSeekAPI([
				{
					role: "system",
					content: analysisPrompt,
				},
				{
					role: "user",
					content: message,
				},
			]);

			let analysis;
			try {
				analysis = JSON.parse(response.choices[0].message.content);
				console.log("🤖 Enhanced AI Analysis Result:", analysis);
			} catch (parseError) {
				console.error("🚨 JSON解析失敗，AI回應格式不正確:", {
					error: parseError.message,
					rawResponse: response.choices[0].message.content,
					message: message,
				});
				// 使用備用分析邏輯
				throw new Error(`JSON解析失敗: ${parseError.message}`);
			}

			// 🧠 ENHANCEMENT: Store conversation history
			if (sessionId) {
				this.updateConversationHistory(
					sessionId,
					message,
					analysis.aiResponse,
					analysis.detectedTopic
				);
			}

			return analysis;
		} catch (error) {
			console.error("🚨 AI 分析失敗:", error);
			return this.getFallbackAnalysis(message);
		}
	}

	// 🎯 建立 AI 分析提示詞
	// 🎯 檢測問候語
	isGreeting(message) {
		const greetingPatterns = [
			/^(你好|你好|嗨|哈囉|hello|hi)([，,！!。.]|\s*$)/i,
			/^(早安|晚安|午安)([，,！!。.]|\s*$)/i,
			/^(風鈴)([，,！!。.]|\s*$)/i,
		];

		return greetingPatterns.some((pattern) => pattern.test(message.trim()));
	}

	// 🎯 測算問候回應
	generateGreetingResponse() {
		return {
			isWithinScope: true,
			detectedTopic: "問候",
			specificProblem: "用戶問候",
			confidence: 0.95,
			aiResponse: `你好呀～我是風鈴！✨ 很高興認識你！

我是專業的風水命理師，可以幫你分析人生各方面的運勢。無論你在感情、工作、財運或健康方面遇到什麼問題，我都很樂意為你提供專業的風水分析和建議！

你現在有什麼特別想了解的問題嗎？還是想先看看我能提供哪些服務呢？`,
			serviceRecommendation: "",
		};
	}

	buildAnalysisPrompt(message) {
		// 🎯 先檢查是否為問候語
		if (this.isGreeting(message)) {
			return null; // 直接使用問候回應，跳過AI分析
		}

		// Get current date for context
		const currentDate = new Date();
		const currentDateStr = currentDate.toLocaleDateString("zh-TW", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
		});

		// 🌐 Determine language instruction based on locale
		const languageInstruction =
			this.locale === "zh-CN"
				? "必須使用簡體中文回應，不可使用繁體中文"
				: "必須使用繁體中文回應，不可使用簡體中文";

		return `你是專業的風水命理分析師，請分析用戶的問題並分類。

當前日期：${currentDateStr}（僅作為內部參考，不需要在每個回應中都提及具體日期）

重要指示：1. ${languageInstruction} 2. 在回應中所有日期和月份都必須使用新歷（西曆/公曆），例如1月、2月、3月等，不要使用農歷 3. 不要在回應中包含字數統計標記 4. 如果需要提及時間，請確保是當前的2025年，避免提及2024年或過去的時間 5. 只在真正需要時間背景的情況下才提及日期，不要強制在每個回應中都包含。

我們提供的服務領域：
- 感情：戀愛、分手、復合、合婚、桃花運、婚姻
- 財運：賺錢、投資、理財、偏財運、正財運、個人財富  
- 工作：升職、跳槽、職場運勢、事業發展、工作機會、生意經營、創業、公司營運、商業決策
- 健康：身體健康、疾病、養生、健康運勢

請分析用戶訊息並返回 JSON 格式：

{
    "isWithinScope": true/false,
    "detectedTopic": "感情|財運|工作|健康|其他",
    "specificProblem": "簡潔問題描述 - 如果用戶只說'感情'就寫'一般感情諮詢'，'財運'就寫'一般財運諮詢'",
    "confidence": 0.8,
    "aiResponse": "禮貌回應用戶訊息，如果不在服務範圍內請提供友善的確認回應",
    "serviceRecommendation": "建議用戶使用我們的哪項服務"
}

**重要分類規則：**
1. 生意經營、創業、公司營運、商業決策 → 歸類為「工作」
2. 個人投資、理財、財富增長 → 歸類為「財運」 
3. 如果用戶輸入很簡單（如只是"感情"、"財運"），specificProblem應該保持簡潔，如"一般感情諮詢"或"一般財運諮詢"
4. 如果問題不在我們服務範圍內（如天氣、科技、日常閒聊等），請設定 isWithinScope 為 false，並在 aiResponse 中提供禮貌友善的回應，自然地確認用戶的話題
5. 對於數字或選擇類輸入（如"1"、"2"），通常表示用戶在回應選項，設為不在範圍內
6. aiResponse 應該禮貌回應用戶，不要直接說"不在服務範圍"，而是自然地承接話題
7. 在 serviceRecommendation 中智能引導到相關的風水服務

用戶訊息：${message}`;
	}

	// 🧠 MINIMAL ENHANCEMENT: Build Enhanced Analysis Prompt with Context
	buildEnhancedAnalysisPrompt(message, emotions, context) {
		// Get current date for context
		const currentDate = new Date();
		const currentDateStr = currentDate.toLocaleDateString("zh-TW", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long",
		});

		// 🌐 Determine language instruction based on locale
		const languageInstruction =
			this.locale === "zh-CN"
				? "必須使用簡體中文回應，不可使用繁體中文"
				: "必須使用繁體中文回應，不可使用簡體中文";

		const basePrompt = `你是專業的風水命理分析師，請分析用戶的問題並分類。

當前日期：${currentDateStr}（僅作為內部參考，不需要在每個回應中都提及具體日期）

重要指示：1. ${languageInstruction} 2. 在回應中所有日期和月份都必須使用新歷（西曆/公曆），例如1月、2月、3月等，不要使用農歷 3. 不要在回應中包含字數統計標記 4. 如果需要提及時間，請確保是當前的2025年，避免提及2024年或過去的時間 5. 只在真正需要時間背景的情況下才提及日期，不要強制在每個回應中都包含。

我們提供的服務領域：
- 感情：戀愛、分手、復合、合婚、桃花運、婚姻、感情問題、約會、結婚
- 財運：賺錢、投資、理財、偏財運、正財運、個人財富、投資收益、財務狀況  
- 工作：升職、跳槽、職場運勢、事業發展、工作機會、生意經營、創業、公司營運、商業決策、加薪、加人工、薪資調整、職場表現、工作壓力、同事關係、老闆關係、職業發展
- 健康：身體健康、疾病、養生、健康運勢、醫療、身體不適、精神健康

**重要分類指導：**
- 加薪、加人工、薪資調整、收入提升等問題應歸類為「工作」
- 投資、理財、財富增長等問題應歸類為「財運」
- 職場人際關係、與同事/老闆的關係問題應歸類為「工作」
- 一般朋友、家庭關係問題應歸類為「感情」或「命理」`;

		// Add emotional context
		let emotionalContext = "";
		if (emotions.urgent) {
			emotionalContext +=
				"\n⚠️ 用戶情況緊急，請提供立即可行的建議，語氣要安撫和支持。";
		}
		if (emotions.anxious) {
			emotionalContext += "\n💙 用戶顯得焦慮，請用溫暖同理的語氣回應。";
		}
		if (emotions.confused) {
			emotionalContext += "\n🔍 用戶感到迷茫，請提供清晰具體的步驟指導。";
		}
		if (emotions.desperate) {
			emotionalContext += "\n🤗 用戶情緒低落，請優先提供心理支持和希望。";
		}
		if (emotions.repeated) {
			emotionalContext +=
				"\n🔄 用戶可能是重複問題，請確認是否需要深入或不同的解決方案。";
		}

		// Add conversation context
		let conversationContext = "";
		if (context.hasHistory && context.messageCount > 0) {
			conversationContext = `\n\n📚 用戶對話歷史 (${context.messageCount} 次對話):\n`;
			context.recentMessages.forEach((msg, index) => {
				conversationContext += `${index + 1}. 問題: "${msg.message.substring(0, 30)}..." (話題: ${msg.topic})\n`;
			});
			conversationContext +=
				"\n請基於對話歷史提供更個人化和連貫的建議。如果是重複問題，請深入探討或提供進階解決方案。";
		}

		const jsonFormat = `

請分析用戶訊息並返回 JSON 格式：

{
    "isWithinScope": true/false,
    "detectedTopic": "感情|財運|工作|健康|其他",
    "specificProblem": "基於情緒狀態和對話歷史的具體問題描述",
    "confidence": 0.8,
    "aiResponse": "結合情緒狀態和對話歷史的個性化回應",
    "serviceRecommendation": "基於用戶具體情況和歷史的服務建議"
}

**重要增強規則：**
1. 基於情緒狀態調整回應語氣和內容
2. 利用對話歷史提供連續性建議
3. 如果是重複問題，提供更深入的解決方案
4. 緊急情況優先提供立即可行的建議
5. 考慮用戶的情緒需求，不只是技術建議
6. **aiResponse 必須使用繁體中文回應，語言風格要溫暖親切**
7. **對於不在服務範圍內的問題（其他話題），請提供實用的回答建議，然後自然地引導到風水命理服務**
8. **不要推薦不存在的服務，只能推薦以下實際提供的服務：感情運勢分析、工作事業分析、財運分析、健康運勢**
9. **serviceRecommendation 只能從以上8種實際服務中選擇，不要創造新的服務名稱**

用戶訊息：${message}`;

		return basePrompt + emotionalContext + conversationContext + jsonFormat;
	}

	// 🎯 調用 DeepSeek API
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
			const errorText = await response.text();
			console.error("🚨 DeepSeek API Error Details:", {
				status: response.status,
				statusText: response.statusText,
				errorBody: errorText,
				apiKey: this.DEEPSEEK_API_KEY
					? `${this.DEEPSEEK_API_KEY.substring(0, 10)}...`
					: "undefined",
			});
			throw new Error(
				`DeepSeek API error: ${response.status} - ${errorText}`
			);
		}

		return await response.json();
	}

	// 🎯 測算AI回應（用於動態回應測算）
	async generateAIResponse(prompt) {
		try {
			// Get current date for context
			const currentDate = new Date();
			const currentDateStr = currentDate.toLocaleDateString("zh-TW", {
				year: "numeric",
				month: "long",
				day: "numeric",
				weekday: "long",
			});

			// 🌐 Determine language instruction based on locale
			const languageInstruction =
				this.locale === "zh-CN"
					? "必須使用簡體中文回應，不可使用繁體中文"
					: "必須使用繁體中文回應，不可使用簡體中文";

			const response = await this.callDeepSeekAPI(
				[
					{
						role: "system",
						content: `你是專業且親切的風鈴，請根據用戶的具體問題提供相關的風水建議。

當前日期：${currentDateStr}（請在回應中使用這個準確的日期作為參考，不要提及過時的年份如2024年等）

重要指示：1. ${languageInstruction} 2. 所有日期和月份都必須使用新歷（西曆/公曆），不要使用農歷。例如：1月、2月、3月等，避免使用農曆1月、農曆8月等表達方式 3. 🚫 嚴格禁止任何農曆用詞：農曆九月、農曆十月、農曆初七、農曆十五等 4. ✅ 正確用法：9月出生、10月出生、每月7日、15日等 5. 不要在回應中包含字數統計如（72字）等標記 6. 保持風鈴親切可愛的語氣風格 7. 請確保所有時間相關的回應都基於當前日期${currentDateStr}，避免提及2024年或過去的時間。`,
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

			return cleanLunarCalendarTerms(
				response.choices[0].message.content.trim()
			);
		} catch (error) {
			console.error("🚨 AI回應測算失敗:", error);
			throw error;
		}
	}

	// 🎯 備用分析邏輯（當 AI 失敗時）
	getFallbackAnalysis(message) {
		console.log("🔧 進入備用分析模式");
		console.log(
			"🔍 檢查 this.supportedTopics:",
			this.supportedTopics ? "存在" : "不存在"
		);

		// 如果沒有訊息，返回默認分析
		if (!message || typeof message !== "string") {
			console.log("⚠️ 訊息為空或無效，返回默認分析");
			return {
				isWithinScope: true,
				detectedTopic: "感情",
				specificProblem: "生日資料收集",
				confidence: 0.8,
				aiResponse: "",
			};
		}

		if (!this.supportedTopics) {
			console.log("⚠️ supportedTopics 未定義，使用硬編碼備用");
			// 如果 supportedTopics 未定義，使用硬編碼的備用值
			const fallbackTopics = {
				感情: [
					"戀愛",
					"分手",
					"復合",
					"合婚",
					"桃花運",
					"婚姻",
					"感情運勢",
					"感情",
				],
				財運: [
					"賺錢",
					"投資",
					"理財",
					"事業財運",
					"偏財運",
					"正財運",
					"破財",
					"財運",
				],
				工作: [
					"升職",
					"跳槽",
					"職場運勢",
					"事業發展",
					"工作機會",
					"職業規劃",
					"工作",
					"事業",
					"生意",
					"經營",
					"創業",
					"業務",
					"公司",
					"職場",
					"工作問題",
					"事業問題",
					"生意問題",
					"經營困難",
					"業績",
					"營收",
					"商業",
					"加薪",
					"加人工",
					"薪資",
					"薪水",
					"人工",
					"加工資",
					"薪資調整",
					"收入提升",
					"職場表現",
					"工作壓力",
					"老闆",
					"主管",
				],
				健康: [
					"身體健康",
					"疾病",
					"養生",
					"健康運勢",
					"身體調理",
					"健康",
				],

				子女: ["懷孕", "生育", "子女運", "親子關係", "教育", "子女"],
			};

			const lowerMessage = message.toLowerCase();

			// 簡單關鍵詞匹配
			for (const [topic, keywords] of Object.entries(fallbackTopics)) {
				if (
					keywords.some((keyword) => lowerMessage.includes(keyword))
				) {
					console.log(`✅ 匹配到話題: ${topic}`);
					return {
						isWithinScope: true,
						detectedTopic: topic,
						specificProblem: message,
						confidence: 0.6,
						aiResponse: "",
						serviceRecommendation: `建議諮詢${topic}相關的風水分析`,
					};
				}
			}
		} else {
			const lowerMessage = message.toLowerCase();

			// 簡單關鍵詞匹配
			for (const [topic, keywords] of Object.entries(
				this.supportedTopics
			)) {
				if (
					keywords.some((keyword) => lowerMessage.includes(keyword))
				) {
					console.log(`✅ 匹配到話題: ${topic}`);
					return {
						isWithinScope: true,
						detectedTopic: topic,
						specificProblem: message,
						confidence: 0.6,
						aiResponse: "",
						serviceRecommendation: `建議諮詢${topic}相關的風水分析`,
					};
				}
			}
		}

		console.log("❌ 未匹配到任何話題");
		// 不在服務範圍內 - 讓 AI 測算動態回應而不是使用靜態回應
		return {
			isWithinScope: false,
			detectedTopic: "其他",
			specificProblem: message,
			confidence: 0.5,
			aiResponse: "", // 🎯 留空讓 generateOutOfScopeResponse 調用 DeepSeek API
			serviceRecommendation: "",
		};
	}

	// 🎯 測算服務引導回應

	async generateServiceGuidance(analysis, originalMessage, sessionId = null) {
		if (analysis.isWithinScope) {
			return await this.generateScopeResponse(
				analysis,
				originalMessage,
				sessionId
			);
		} else {
			return await this.generateOutOfScopeResponse(
				analysis,
				originalMessage,
				sessionId
			);
		}
	}

	// 🎯 測算範圍內問題的回應
	async generateScopeResponse(analysis, originalMessage, sessionId = null) {
		const topic = analysis.detectedTopic;

		// 為不同核心領域提供個性化的流程引導
		switch (topic) {
			case "問候":
				// 🎯 問候語直接返回分析中的回應，並添加服務選單
				return (
					analysis.aiResponse +
					`\n\n我可以為你分析以下領域的風水運勢：

🌸 **感情** - 桃花運、姻緣配對
💼 **工作** - 事業發展、職場運勢
💰 **財運** - 投資理財、收入提升
🌿 **健康** - 身心調理、養生建議
🔮 **命理** - 八字分析、流年運勢

你對哪一種有興趣？`
				);
			case "感情":
				return this.generateEmotionFlow(analysis, originalMessage);
			case "工作":
				return await this.generateCareerFlow(analysis, originalMessage);
			case "財運":
				return await this.generateWealthFlow(analysis, originalMessage);
			case "健康":
				return await this.generateHealthFlow(analysis, originalMessage);
			case "命理":
				return await this.generateMingliFlow(analysis, originalMessage);
			case "其他":
				// 🤖 「其他」話題使用智能回應
				return await this.generateOutOfScopeResponse(
					analysis,
					originalMessage,
					sessionId
				);
			default:
				return await this.generateDefaultFlow(
					analysis,
					originalMessage
				);
		}
	}

	// 🌸 感情分析流程 - 完全複製 smart-chat 邏輯
	generateEmotionFlow(analysis, originalMessage) {
		// 檢查原始用戶訊息是否明確提到分手相關（使用 smart-chat 的檢測邏輯）
		const hasBreakupKeywords =
			originalMessage &&
			typeof originalMessage === "string" &&
			(originalMessage.includes("分手") ||
				originalMessage.includes("分開"));

		if (hasBreakupKeywords) {
			// 分手特殊流程 - 如果有AI回應則使用
			if (analysis.aiResponse) {
				console.log("✅ 使用已有的 AI 分手分析結果");
				return `哇～分手真的很難過呢... 風鈴給你一個大大的抱抱！🤗💕

${analysis.aiResponse}

讓風鈴了解一下你的感情狀況：

**💕 請選擇你的感情狀態：**
- A. 剛分手，還很難過
- B. 分手一段時間了，想重新開始
- C. 想復合，但不確定
- D. 已經放下，想找新對象

根據你的狀態，風鈴會為你量身打造最適合的感情指導～💕`;
			}

			// 分手備用回應
			return `哇～分手真的很難過呢... 風鈴給你一個大大的抱抱！🤗💕

雖然現在心情不好，但爺爺說每一次結束都是新開始的機會呢！

首先，讓風鈴了解一下你的感情狀況：

**💕 請選擇你的感情狀態：**
- A. 剛分手，還很難過
- B. 分手一段時間了，想重新開始
- C. 想復合，但不確定
- D. 已經放下，想找新對象

根據你的狀態，風鈴會為你量身打造最適合的感情指導～💕`;
		}

		// 一般感情問題 - 如果有AI回應則先顯示
		if (analysis.aiResponse) {
			console.log("✅ 使用已有的 AI 感情分析結果");
			return `💕 ${analysis.aiResponse}

為了提供最適合的分析，請選擇：

**1️⃣ 個人感情分析
- 分析你的桃花運勢和感情特質
- 提供感情運勢建議和風水調整
- 適合單身或想了解個人感情運的朋友

**2️⃣ 合婚配對分析
- 分析你和伴侶的八字契合度
- 提供雙方感情走向和發展建議  
- 適合想了解感情配對度的情侶

你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
		}

		// 一般感情問題 - 完全複製 smart-chat 的經典流程
		return `💕 了解你想詢問感情方面的問題！

為了提供最適合的分析，請選擇：

**1️⃣ 個人感情分析
- 分析你的桃花運勢和感情特質
- 提供感情運勢建議和風水調整
- 適合單身或想了解個人感情運的朋友

**2️⃣ 合婚配對分析 
- 分析你和伴侶的八字契合度
- 提供雙方感情走向和發展建議  
- 適合想了解感情配對度的情侶

你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
	}

	// 🎯 測算範圍外問題的回應
	// 🎯 測算範圍外問題的智能回應
	async generateOutOfScopeResponse(
		analysis,
		originalMessage = "",
		sessionId = null
	) {
		// � Determine language instruction based on locale
		const languageInstruction =
			this.locale === "zh-CN"
				? "必須使用簡體中文回應，不可使用繁體中文"
				: "必須使用繁體中文回應，不可使用簡體中文";

		// �🎯 檢測是否為八字輸入
		const isBaziInput = this.detectBaziInput(
			originalMessage || analysis.specificProblem || ""
		);

		// 🧠 Check conversation context for redirect strategy
		const context = this.getConversationContext(sessionId);
		const redirectLevel = this.determineRedirectLevel(context);

		console.log(
			`🎯 Redirect level: ${redirectLevel}, irrelevant count: ${context.irrelevantCount || 0}`
		);

		// 🎯 For irrelevant questions, always use DeepSeek backup for consistent helpful responses
		// Skip the direct AI response to ensure consistent engaging tone

		// 🤖 備用：使用 DeepSeek 測算回應
		try {
			// Customize prompt based on redirect level
			const answerPrompt = this.buildRedirectPrompt(
				analysis.specificProblem,
				redirectLevel,
				context
			);

			console.log("🚀 準備調用 DeepSeek API 測算備用回應...");

			const aiAnswer = await this.callDeepSeekAPI([
				{
					role: "system",
					content:
						"你是親切可愛的風鈴，善於先回答用戶問題再自然地介紹自己的專業服務。你只提供風水命理相關服務，不要推薦不存在的服務。\n\n⚠️ 重要指示：\n1. ${languageInstruction}\n2. 所有日期和月份都必須嚴格使用西曆（公曆），絕對不可使用農曆用詞\n3. 🚫 禁止用詞：「農曆十月」「陰曆八月」「農曆四月」等\n4. ✅ 正確用法：「10月出生者」「十月份」「8月」等\n5. 當前是2025年10月19日，請確保回應基於2025年，不可提及2024年\n6. 用戶提供的生日是西曆日期，請據此分析\n7. 不要在回應中包含字數統計標記\n8. 保持風鈴親切可愛的語氣風格",
				},
				{
					role: "user",
					content: answerPrompt,
				},
			]);

			console.log(
				"🤖 DeepSeek 備用回應:",
				JSON.stringify(aiAnswer, null, 2)
			);

			// 檢查回應格式並提取內容
			let responseText = null;
			if (typeof aiAnswer === "string" && aiAnswer.trim()) {
				responseText = aiAnswer.trim();
			} else if (aiAnswer && aiAnswer.choices && aiAnswer.choices[0]) {
				responseText = aiAnswer.choices[0].message?.content?.trim();
			} else if (aiAnswer && aiAnswer.content) {
				responseText = aiAnswer.content.trim();
			}

			console.log("📝 提取的備用回應文字:", responseText);

			if (responseText) {
				console.log("✅ 使用 DeepSeek 智能回應（備用方案）");

				// 🎯 替換重複的轉折語句
				responseText = this.diversifyTransitionPhrases(responseText);

				// 移除硬編碼服務推薦

				// 移除八字輸入硬編碼服務選單
				return cleanLunarCalendarTerms(responseText);
			} else {
				console.log("⚠️ 回應為空，使用默認回應");
			}
		} catch (error) {
			console.error("🔥 測算智能回應失敗:", error);
		}

		// 🔄 最終備用回應
		let response = "謝謝你跟我分享這個！😊";

		response += `\n\n雖然這個話題很有趣，不過風鈴主要專精於風水命理方面的分析哦～`;

		// 移除硬編碼服務推薦

		// 🎯 如果是八字輸入，添加服務選單
		if (isBaziInput) {
			console.log("🔮 檢測到八字輸入，添加服務選單");
			return response + this.generateServiceMenu();
		}

		return response;
	}

	// 🎯 智能服務推薦 - 根據問題內容推薦相關的2個服務
	generateSmartServiceRecommendation(originalMessage, sessionId = null) {
		const allServices = {
			感情: "🌸 **感情** - 桃花運、姻緣配對",
			工作: "💼 **工作** - 事業發展、職場運勢",
			財運: "💰 **財運** - 投資理財、收入提升",
			健康: "🌿 **健康** - 身心調理、養生建議",
			命理: "🔮 **命理** - 八字分析、流年運勢",
		};

		// Check conversation context for better recommendations
		const context = this.getConversationContext(sessionId);
		let contextualBoost = {};

		if (context.hasHistory && context.preferredTopic) {
			// Boost the previously discussed topic
			contextualBoost[context.preferredTopic] = 2;
			console.log(
				`🔍 上下文增強: ${context.preferredTopic} 話題獲得優先推薦`
			);
		}

		// 定義問題類型與服務的關聯度 - Enhanced categorization
		const questionServiceMapping = {
			// 飲食相關 -> 健康 + 命理
			food: {
				keywords: [
					"吃",
					"食物",
					"料理",
					"菜",
					"餐廳",
					"美食",
					"烹飪",
					"食譜",
					"營養",
					"飲食",
					"減肥",
					"瘦身",
					"節食",
					"外食",
				],
				services: ["健康", "命理"],
				responseType: "lifestyle",
			},
			// 技術/工作相關 -> 工作 + 命理
			tech: {
				keywords: [
					"手機",
					"電腦",
					"軟體",
					"程式",
					"APP",
					"網站",
					"科技",
					"系統",
					"bug",
					"閃退",
				],
				services: ["工作", "命理"],
			},
			// 娛樂相關 -> 感情 + 命理
			entertainment: {
				keywords: [
					"電影",
					"韓劇",
					"音樂",
					"遊戲",
					"旅遊",
					"娛樂",
					"休閒",
					"看劇",
					"追劇",
				],
				services: ["感情", "命理"],
			},
			// 理財相關 -> 財運 + 命理
			finance: {
				keywords: [
					"錢",
					"投資",
					"股票",
					"房價",
					"買房",
					"理財",
					"存款",
					"貸款",
					"消費",
					"價格",
				],
				services: ["財運", "命理"],
			},
			// 學習相關 -> 工作 + 命理
			education: {
				keywords: [
					"學習",
					"考試",
					"課程",
					"書",
					"知識",
					"技能",
					"語言",
					"學校",
					"教育",
				],
				services: ["工作", "命理"],
			},
			// 社交關係 -> 感情 + 命理
			social: {
				keywords: [
					"朋友",
					"家人",
					"同事",
					"關係",
					"相處",
					"聊天",
					"社交",
					"交友",
				],
				services: ["感情", "命理"],
			},
			// 健康相關 -> 健康 + 命理
			health: {
				keywords: [
					"累",
					"疲勞",
					"睡眠",
					"運動",
					"身體",
					"健康",
					"醫院",
					"藥",
					"休息",
					"壓力",
				],
				services: ["健康", "命理"],
			},
			// 購物相關 -> 財運 + 命理
			shopping: {
				keywords: [
					"買",
					"購物",
					"商品",
					"品牌",
					"衣服",
					"化妝品",
					"用品",
					"選擇",
					"推薦",
				],
				services: ["財運", "命理"],
			},
			// 天氣/出行 -> 健康 + 命理
			weather: {
				keywords: [
					"天氣",
					"出門",
					"旅行",
					"交通",
					"路線",
					"地點",
					"戶外",
					"活動",
				],
				services: ["健康", "命理"],
			},
		};

		console.log("🔍 分析問題內容以推薦相關服務:", originalMessage);

		// 分析問題內容，找出最相關的服務類型
		let bestMatch = null;
		let maxMatches = 0;

		for (const [category, config] of Object.entries(
			questionServiceMapping
		)) {
			let matchCount = 0;
			for (const keyword of config.keywords) {
				if (originalMessage.includes(keyword)) {
					matchCount++;
				}
			}

			if (matchCount > maxMatches) {
				maxMatches = matchCount;
				bestMatch = config.services;
			}
		}

		// 如果沒有找到特定匹配，使用預設組合
		if (!bestMatch || maxMatches === 0) {
			console.log("🎲 未找到特定匹配，使用預設服務組合");
			bestMatch = ["感情", "命理"]; // 預設推薦最通用的兩個服務
		}

		console.log("🎯 推薦服務:", bestMatch);

		// 生成自然多變的推薦方式
		return this.generateNaturalServiceRecommendation(
			bestMatch,
			originalMessage
		);
	}

	// 🎨 生成自然多變的服務推薦 - 專注於銷售導向
	generateNaturalServiceRecommendation(recommendedServices, originalMessage) {
		const allServices = {
			感情: "🌸 **感情** - 桃花運、姻緣配對",
			工作: "💼 **工作** - 事業發展、職場運勢",
			財運: "💰 **財運** - 投資理財、收入提升",
			健康: "🌿 **健康** - 身心調理、養生建議",
			命理: "🔮 **命理** - 八字分析、流年運勢",
		};

		// 直接的服務導向引導語句
		const directIntroTemplates = [
			"不過風鈴最專業的是幫你分析運勢，特別擅長：",
			"剛好風鈴能從專業的角度幫你看看：",
			"其實這類問題背後都有運勢因素，我可以幫你分析：",
			"風鈴專精的風水命理分析能幫你了解：",
			"讓風鈴用專業的命理分析來幫你看看：",
			"從風水命理的角度，我能為你分析：",
		];

		// 銷售導向的結尾詢問
		const salesEndingTemplates = [
			"想了解哪個對你最有幫助？",
			"對哪個分析比較有興趣？",
			"想先從哪個開始深入了解？",
			"哪個領域你比較想改善？",
			"想看看哪方面的運勢指導？",
		];

		// 隨機選擇引導語和結尾
		const selectedIntro =
			directIntroTemplates[
				Math.floor(Math.random() * directIntroTemplates.length)
			];
		const selectedEnding =
			salesEndingTemplates[
				Math.floor(Math.random() * salesEndingTemplates.length)
			];

		// 生成服務選單
		const serviceList = recommendedServices
			.map((service) => allServices[service])
			.join("\n");

		return `\n\n${selectedIntro}

${serviceList}

${selectedEnding}`;
	}

	// 🎯 多樣化轉折語句 - 強制替換重複的「說到這個」
	diversifyTransitionPhrases(responseText) {
		const alternatives = [
			"順便提一下",
			"既然聊到這裡",
			"談到這個",
			"剛好想到",
			"對了",
			"其實",
			"你知道嗎",
			"巧的是",
			"讓我想到",
			"關於這點",
			"說起來",
			"補充一下",
			"另外",
			"這讓我聯想到",
			"從另一個角度來看",
		];

		// 計算出現次數，如果多次出現「說到這個」就進行替換
		const matches = responseText.match(/說到這個/g);
		if (matches && matches.length > 0) {
			console.log(
				`🔄 檢測到 ${matches.length} 次「說到這個」，進行多樣化替換`
			);

			// 隨機選擇替代詞
			const randomAlternative =
				alternatives[Math.floor(Math.random() * alternatives.length)];
			responseText = responseText.replace(/說到這個/g, randomAlternative);

			console.log(`✨ 已替換為「${randomAlternative}」`);
		}

		return cleanLunarCalendarTerms(responseText);
	}

	// 🔮 檢測是否為八字輸入
	detectBaziInput(message) {
		if (!message || typeof message !== "string") return false;

		// 天干地支模式檢測
		const heavenlyStems = [
			"甲",
			"乙",
			"丙",
			"丁",
			"戊",
			"己",
			"庚",
			"辛",
			"壬",
			"癸",
		];
		const earthlyBranches = [
			"子",
			"丑",
			"寅",
			"卯",
			"辰",
			"巳",
			"午",
			"未",
			"申",
			"酉",
			"戌",
			"亥",
		];

		// 檢測八字格式 (例如: 丙子,甲午,丙申,戊子 或 丙子 甲午 丙申 戊子)
		const baziPattern =
			/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]+([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/;

		if (baziPattern.test(message)) {
			console.log("🔮 檢測到完整八字格式:", message);
			return true;
		}

		// 檢測是否包含多個天干地支組合
		let stemBranchCount = 0;
		for (const stem of heavenlyStems) {
			for (const branch of earthlyBranches) {
				const combination = stem + branch;
				if (message.includes(combination)) {
					stemBranchCount++;
				}
			}
		}

		// 如果有3個或以上天干地支組合，很可能是八字
		if (stemBranchCount >= 3) {
			console.log(
				"🔮 檢測到多個天干地支組合，疑似八字:",
				message,
				"組合數:",
				stemBranchCount
			);
			return true;
		}

		return false;
	}

	// 🔮 檢測八字+主題組合並生成詳細分析 (類似生日分析)
	async detectBaziWithTopicAnalysis(message, sessionId) {
		if (!this.detectBaziInput(message)) {
			return null;
		}

		console.log("🔮 檢測到八字輸入，開始主題分析:", message);

		// 提取八字
		const baziPattern =
			/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/;
		const baziMatch = message.match(baziPattern);

		let baziString = "";
		if (baziMatch) {
			baziString = `${baziMatch[1]} ${baziMatch[2]} ${baziMatch[3]} ${baziMatch[4]}`;
		}

		// 使用AI分析主題
		try {
			const classifier = new AITopicClassifier(locale);
			const topicAnalysis = await classifier.analyzeMessage(
				message,
				sessionId
			);

			console.log("🔍 八字主題分析結果:", topicAnalysis);

			// 如果檢測到具體主題，生成詳細分析
			if (
				topicAnalysis &&
				topicAnalysis.isWithinScope &&
				topicAnalysis.detectedTopic &&
				topicAnalysis.detectedTopic !== "其他"
			) {
				console.log(
					`🎯 檢測到八字+${topicAnalysis.detectedTopic}組合，生成詳細分析`
				);

				const detailedAnalysis =
					await this.generateBaziDetailedAnalysis(
						baziString,
						topicAnalysis.detectedTopic,
						topicAnalysis.specificProblem,
						message
					);

				return {
					analysisType: "bazi_topic_analysis",
					detectedTopic: topicAnalysis.detectedTopic,
					specificProblem: topicAnalysis.specificProblem,
					baziString: baziString,
					response: detailedAnalysis,
					isWithinScope: true,
					requiresServiceMenu: false, // 不需要服務選單，直接提供分析
				};
			} else {
				// 純八字輸入，提供服務選單
				console.log("🔮 純八字輸入，提供服務選單");
				return {
					analysisType: "bazi_only",
					baziString: baziString,
					requiresServiceMenu: true,
					isWithinScope: true,
				};
			}
		} catch (error) {
			console.error("❌ 八字主題分析失敗:", error);
			return {
				analysisType: "bazi_only",
				baziString: baziString,
				requiresServiceMenu: true,
				isWithinScope: true,
			};
		}
	}

	// 🔮 生成詳細八字分析 (類似生日分析的效果)
	async generateBaziDetailedAnalysis(
		baziString,
		topic,
		specificProblem,
		originalMessage
	) {
		// 🌐 Determine language instruction based on locale
		const languageInstruction =
			this.locale === "zh-CN"
				? "必須使用簡體中文回應，不可使用繁體中文"
				: "必須使用繁體中文回應，不可使用簡體中文";
		const topicMap = {
			感情: "感情運勢",
			工作: "工作運勢",
			財運: "財運分析",
			健康: "健康運勢",
			子女: "子女運勢",
		};

		const displayTopic = topicMap[topic] || topic;

		const detailedPrompt = `用戶提供八字：${baziString}
詢問主題：${displayTopic}
具體問題：${specificProblem}
原始訊息：${originalMessage}

請以風鈴的身份，按照以下格式測算詳細的八字分析報告：

🔮 風鈴看了你的八字，發現你有很特別的${displayTopic}潛質呢！💼

**1. 命盤速讀**
八字：${baziString}
五行屬性：[根據八字分析五行屬性，如：土命/火命等]
${displayTopic}宮主星：[分析對應主星，如：天府星（穩重權威）]
   - 關鍵格局：
     身強/身弱：[分析日主強弱]
     用神：[分析用神，如：火（溫暖調候，生機盎然）]
     大運節點：[分析當前大運]

💖 哈囉親愛的[五行]命小夥伴！讓風鈴為你解鎖${new Date().getFullYear()}年的${displayTopic}密碼～  

**2. 年度預警**  
✨【成就星】[時間範圍]「[吉星名稱]」發威！[具體建議和機會]～  
⚠️【小人煞】小心屬「[生肖]」的[相關人士][注意事項]，[具體防範建議]喔！  

⚠️ 關鍵指示：
1. 所有日期和月份必須嚴格使用西曆（公曆），例如：1月、2月、3月等
2. 🚫 絕對禁止使用農曆、陰曆用詞，如「農曆十月」「陰曆八月」等表達
3. ✅ 正確示例：「10月出生者」「十月份」「8月」
4. ❌ 錯誤示例：「農曆十月出生者」「陰曆八月」
5. 當前是2025年10月，分析需基於2025年時間軸
6. 用戶生日是西曆格式，請據此進行命理分析

**3. ${displayTopic}分析**  
[針對用戶具體問題的分析，約100-150字，要具體實用]

**4. 風水小貼士**  
🪑 [居家風水建議]
🎨 [顏色搭配建議] 
💻 [配件或擺設建議]

[五行]命寶寶記得多用「[五行相生原理]」原理，[具體建議]能讓你[效果]！✨ 有問題隨時喚醒風鈴喔～

───────────────────
💎 **想要更深入的分析嗎？**
**1️⃣ 详细报告** 價值$88，限時優惠$38
**2️⃣ 综合命理报告** 價值$168，限時優惠$88  


要求：
1. 保持風鈴可愛親切的語氣，使用表情符號和可愛語助詞
2. 提供具體實用的建議，避免空泛描述
3. 重點分析用戶關注的${displayTopic}領域
4. 總長度約400-500字
5. 格式要完整，包含所有必要部分
6. 所有日期和月份都必須嚴格使用西曆（公曆），如1月、2月、3月等，絕對不可使用農曆用詞
7. 當前日期是2025年10月19日，請確保分析基於2025年時間軸，不可提及2024年
8. 特別注意：用戶的生日是西曆日期，不是農曆，請據此分析命理特質`;

		try {
			const classifier = new AITopicClassifier(locale);
			const aiResponse = await classifier.callDeepSeekAPI([
				{
					role: "system",
					content:
						"你是專業的風水命理顧問風鈴，擅長八字分析和運勢預測。請按照指定格式測算詳細且實用的分析報告。\n\n⚠️ 重要指示：\n1. ${languageInstruction}\n2. 所有日期和月份都必須嚴格使用西曆（公曆），如：1月、2月、3月等\n3. 🚫 絕對禁止使用農曆、陰曆用詞，如「農曆十月」「陰曆八月」等\n4. ✅ 正確示例：「10月出生者」「十月出生」「10月份」\n5. ❌ 錯誤示例：「農曆十月出生者」「陰曆八月」「農曆四月」\n6. 當前是2025年10月19日，請確保分析基於2025年，不可提及2024年\n7. 用戶提供的生日是西曆日期，請據此進行命理分析\n8. 不要在回應中包含字數統計標記\n9. 保持風鈴專業且親切的語氣\n10. 如果需要提及月份，直接說「10月」「八月」等，不要加「農曆」「陰曆」前綴",
				},
				{
					role: "user",
					content: detailedPrompt,
				},
			]);

			// 提取AI回應內容
			if (
				aiResponse &&
				aiResponse.choices &&
				aiResponse.choices[0] &&
				aiResponse.choices[0].message
			) {
				return cleanLunarCalendarTerms(
					aiResponse.choices[0].message.content
				);
			} else if (typeof aiResponse === "string") {
				return cleanLunarCalendarTerms(aiResponse);
			} else {
				throw new Error("AI回應格式異常");
			}
		} catch (error) {
			console.error("❌ 生成詳細八字分析失敗:", error);
			return `🔮 風鈴看了你的八字 ${baziString}，很想為你分析${displayTopic}呢！

不過系統暫時有點忙碌，請稍後重試，或者你可以：

📞 聯絡客服取得人工分析
💬 重新發送你的八字和問題
🎯 選擇其他分析服務

風鈴會盡快為你提供專業的${displayTopic}分析！✨`;
		}
	}
}

// 🔮 輔助函數：從會話歷史中獲取最後的八字數據
async function getLastBaziFromSession(sessionId) {
	try {
		// 首先嘗試從增強版對話歷史中查找
		const memoryManager = new EnhancedConversationMemoryManager();
		const recentHistory = await memoryManager.getRecentHistory(
			sessionId,
			10
		);

		if (recentHistory && recentHistory.length > 0) {
			const classifier = new AITopicClassifier(locale);

			for (const msg of recentHistory) {
				if (
					msg.userMessage &&
					classifier.detectBaziInput(msg.userMessage)
				) {
					// 提取八字字符串
					const baziPattern =
						/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/;
					const baziMatch = msg.userMessage.match(baziPattern);

					if (baziMatch) {
						const baziString = `${baziMatch[1]} ${baziMatch[2]} ${baziMatch[3]} ${baziMatch[4]}`;
						console.log("🔮 從會話歷史中找到八字:", baziString);
						return baziString;
					}
				}
			}
		}

		// 備用方案：從ChatHistory的messages中查找
		const chatHistory = await ChatHistory.findOne({
			$or: [{ conversationId: sessionId }, { sessionId: sessionId }],
		});

		if (chatHistory && chatHistory.messages) {
			const classifier = new AITopicClassifier(locale);

			for (const message of chatHistory.messages) {
				if (
					message.role === "user" &&
					message.content &&
					classifier.detectBaziInput(message.content)
				) {
					const baziPattern =
						/([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])[,，\s]*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/;
					const baziMatch = message.content.match(baziPattern);

					if (baziMatch) {
						const baziString = `${baziMatch[1]} ${baziMatch[2]} ${baziMatch[3]} ${baziMatch[4]}`;
						console.log("🔮 從ChatHistory中找到八字:", baziString);
						return baziString;
					}
				}
			}
		}

		console.log("⚠️ 會話歷史中未找到八字數據");
		return null;
	} catch (error) {
		console.error("❌ 獲取會話歷史八字失敗:", error);
		return null;
	}
}

// 🎯 主要 API 處理函數
export async function POST(request) {
	try {
		await connectMongo();

		// 🔐 獲取用戶會話信息
		const session = await auth();
		const userEmailFromSession = session?.user?.email;

		const {
			message,
			sessionId,
			userEmail = userEmailFromSession || "anonymous",
			userId = userEmailFromSession ||
				`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 使用email作為主要ID，fallback到生成ID
			userBirthday,
			partnerBirthday,
			gender,
			partnerGender,
			reportType,
			region: clientRegion, // 🌍 新增：從前端傳來的區域設定
			locale: clientLocale, // 🌐 新增：從前端傳來的語言設定 (zh-CN 或 zh-TW)
		} = await request.json();
		console.log("📥 Smart-Chat2 收到的請求數據:", {
			message: message,
			messageType: typeof message,
			userBirthday: userBirthday,
			gender: gender,
			reportType: reportType,
			sessionId: sessionId,
			userId: userId, // 🆕 新增：記錄userId
			userEmail: userEmail, // 🆕 新增：記錄用戶email
			sessionUser: userEmailFromSession, // 🆕 新增：會話中的用戶信息
		});

		// 🌍 檢測用戶區域以支援動態定價顯示
		// 🌐 優先使用前端傳來的 locale 設定（用於AI回應語言），然後是區域設定，最後從請求標頭檢測
		let region, locale;
		if (
			clientRegion &&
			["china", "hongkong", "taiwan"].includes(clientRegion)
		) {
			region = clientRegion;
			// 🌐 優先使用前端傳來的 locale，否則根據區域映射
			if (clientLocale && ["zh-CN", "zh-TW"].includes(clientLocale)) {
				locale = clientLocale;
				console.log(
					`🌐 Smart-Chat2 - 使用前端 locale: ${locale} (AI將使用此語言回應)`
				);
			} else {
				// 根據區域設定對應的語言環境
				const regionToLocale = {
					china: "zh-CN",
					hongkong: "zh-TW",
					taiwan: "zh-TW",
				};
				locale = regionToLocale[region];
				console.log(
					`🌍 Smart-Chat2 - 使用前端區域: ${region} (locale: ${locale})`
				);
			}
		} else {
			// 從請求標頭檢測
			const detected = getLocaleAndRegionFromRequest(request);
			locale = detected.locale;
			region = detected.region;
			console.log(
				`🌍 Smart-Chat2 - 從標頭檢測區域: ${region} (locale: ${locale})`
			);
		}
		if (!message?.trim() && !userBirthday && !reportType) {
			return NextResponse.json(
				{ error: "訊息不能為空" },
				{ status: 400 }
			);
		}

		console.log("🤖 Smart-Chat2 收到訊息:", message);

		// 🔧 特殊處理：模態框提交生日和性別的情況 (複製自 Smart-Chat)
		if (userBirthday && gender && !message?.trim()) {
			console.log("🎯 Smart-Chat2 處理生日提交:", {
				userBirthday,
				gender,
				reportType,
			});

			// 🚫 檢查每日分析限制
			const rateLimitCheck = await DailyAnalysisRateLimit.checkUserLimit(
				userEmail,
				userId
			);
			if (!rateLimitCheck.canAnalyze) {
				const limitMessage =
					DailyAnalysisRateLimit.generateLimitExceededMessage(
						rateLimitCheck.currentCount,
						rateLimitCheck.limit
					);

				return NextResponse.json({
					response: limitMessage,
					analysis: {
						isWithinScope: false,
						detectedTopic: "rate_limit_exceeded",
						specificProblem: "每日分析次數已達上限",
						confidence: 1.0,
						rateLimited: true,
						currentCount: rateLimitCheck.currentCount,
						limit: rateLimitCheck.limit,
					},
					reportUrl: null,
					shouldTriggerModal: false,
				});
			}

			let userIntent = await SmartUserIntent.findOne({
				sessionId: sessionId,
				conversationActive: true,
			}).sort({ createdAt: -1 });

			if (!userIntent) {
				// 如果沒有找到會話上下文，創建一個新的
				console.log("📝 Smart-Chat2 創建新的會話上下文:", sessionId);

				// 映射 reportType 到有效的 primaryConcern 值
				let mappedConcern = "感情"; // 默認值
				if (reportType && reportType.includes("感情"))
					mappedConcern = "感情";
				else if (reportType && reportType.includes("財運"))
					mappedConcern = "財運";
				else if (reportType && reportType.includes("工作"))
					mappedConcern = "工作";
				else if (reportType && reportType.includes("健康"))
					mappedConcern = "健康";
				else if (reportType && reportType.includes("人際"))
					mappedConcern = "感情";
				userIntent = new SmartUserIntent({
					sessionId: sessionId,
					userEmail: userEmail,
					userId: userId, // 🆕 新增：保存userId
					conversationActive: true,
					primaryConcern: mappedConcern,
					specificQuestion: `想了解${mappedConcern}方面的運勢和風水建議`,
					originalSpecificProblem: message, // 🔧 保存原始用戶訊息
					originalUserMessage: message, // 🆕 永不覆蓋的原始訊息
					relationshipAnalysisType: partnerBirthday
						? "couple"
						: "individual",
					conversationState: "birthday_collection",
					createdAt: new Date(),
				});
			}

			// 解析生日
			const parsedDate = parseFlexibleDate(userBirthday);
			if (parsedDate) {
				userIntent.userBirthday = parsedDate;
				userIntent.birthdayConfirmed = true; // 🎂 標記生日已確認
				userIntent.conversationState = "ready_for_detailed_report";

				// 處理情侶分析的伴侶生日
				if (
					partnerBirthday &&
					userIntent.relationshipAnalysisType === "couple"
				) {
					const parsedPartnerDate =
						parseFlexibleDate(partnerBirthday);
					if (parsedPartnerDate) {
						userIntent.partnerBirthday = parsedPartnerDate;
						console.log(
							"🎯 Smart-Chat2 設置伴侶生日:",
							parsedPartnerDate
						);
					}
				}

				// 保持原有的關注領域
				const originalConcern = userIntent.primaryConcern || "綜合運勢";
				const concern = originalConcern;
				const problem =
					userIntent.specificQuestion ||
					`想了解${concern}方面的運勢和風水建議`;

				// 生成報告URL
				let reportUrl;
				if (
					userIntent.relationshipAnalysisType === "couple" &&
					userIntent.partnerBirthday
				) {
					// 情侶報告
					const partnerDate = userIntent.partnerBirthday;
					const partnerDateString = `${partnerDate.getFullYear()}-${String(partnerDate.getMonth() + 1).padStart(2, "0")}-${String(partnerDate.getDate()).padStart(2, "0")}`;

					const params = new URLSearchParams({
						birthdate: userBirthday,
						gender: gender,
						partnerBirthdate: partnerDateString,
						partnerGender: partnerGender || "女",
						concern: concern,
						relationshipType: "couple",
						// 🔧 新增：傳遞原始具體問題到報告頁面
						originalProblem:
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							"感情變淡，關係疏離",
					});

					reportUrl = `/zh-CN/couple-report?${params.toString()}`;
					console.log("🎯 Smart-Chat2 生成情侶報告URL:", reportUrl);
				} else {
					// 個人報告
					const params = new URLSearchParams({
						birthday: userBirthday,
						gender: gender,
						concern: concern,
						// 🔧 修正：使用原始具體問題而不是通用問題
						problem:
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							problem,
					});
					reportUrl = `/zh-CN/feng-shui-report?${params.toString()}`;
					console.log("🎯 Smart-Chat2 生成個人報告URL:", reportUrl);
				}

				await userIntent.save();

				// 🚫 記錄分析次數
				const analysisType =
					userIntent.relationshipAnalysisType || "individual";
				await DailyAnalysisRateLimit.recordAnalysis(
					userEmail,
					userId,
					sessionId,
					analysisType,
					concern,
					userIntent.originalSpecificProblem ||
						userIntent.specificQuestion
				);

				// 🚫 檢查是否接近限制並添加警告
				const updatedStats = await DailyAnalysisRateLimit.getUserStats(
					userEmail,
					userId
				);
				const warningMessage =
					DailyAnalysisRateLimit.generateWarningMessage(
						updatedStats.remaining
					);

				const responseText = `✨ 太好了！你的專屬${concern}報告已經準備好了！\n\n正在為你打開報告頁面...${warningMessage ? "\n\n" + warningMessage : ""}`;

				return NextResponse.json({
					response: responseText,
					conversationState: "report_generated",
					systemType: "smart-chat2",
					reportUrl: reportUrl,
					timestamp: new Date().toISOString(),
					analysisStats: {
						currentCount: updatedStats.analysisCount,
						remaining: updatedStats.remaining,
						limit: 10,
					},
				});
			}
		}

		// 檢查會話歷史和上下文
		let userIntent = await SmartUserIntent.findOne({
			sessionId: sessionId,
			conversationActive: true,
		}).sort({ createdAt: -1 });

		console.log("🔍 加載 userIntent:", {
			found: !!userIntent,
			sessionId: sessionId,
			conversationState: userIntent?.conversationState,
			primaryConcern: userIntent?.primaryConcern,
			message: message?.trim()
		});
		
		// 🐛 DEBUG: Add state info to response for debugging
		const debugInfo = {
			loadedState: userIntent?.conversationState,
			loadedConcern: userIntent?.primaryConcern,
			message: message?.trim(),
			sessionId: sessionId
		};

		// 檢查是否為生日輸入
		const birthdayPattern = /^(\d{4}[-/年]?\d{1,2}[-/月]?\d{1,2}[日]?)$/;
		const isBirthdayInput = message
			? birthdayPattern.test(message.replace(/\s/g, ""))
			: false;

		// 🔧 優先檢查是否為合婚分析中的雙方生日輸入
		const couplesBirthdayData = message
			? parseCouplesBirthdays(message)
			: null;

		// 🔧 新增：檢查是否同時包含主題和生日 - 使用AI分析
		const topicAndBirthdayData = message
			? await detectTopicAndBirthday(message, locale)
			: null;

		// 🔧 檢查是否為選擇回應 (1, 2, 3, 1️⃣, 2️⃣, 3️⃣ 等 + 文字選項)
		const choicePattern =
			/^[123]$|^[123]️⃣$|^選擇\s*[123]$|^第\s*[123]$|^option\s*[123]$/i;
		const textChoicePattern =
			/^(個人分析|個人感情分析|合婚分析|合婚配對分析|個人|合婚|配對)$/i;
		const isChoiceInput = message
			? choicePattern.test(message.trim()) ||
				textChoicePattern.test(message.trim())
			: false;

		// 🔧 檢查是否為分手狀態選擇 (A, B, C, D)
		const breakupChoicePattern = /^[ABCD]$|^[ABCD]\.?/i;
		const breakupTextPattern =
			/^(剛分手.*難過|分手一段時間.*重新開始|想復合.*不確定|已經放下.*新對象)/i;
		const isBreakupChoice = message
			? breakupChoicePattern.test(message.trim()) ||
				breakupTextPattern.test(message.trim())
			: false;

		// 🎯 檢查是否為具體服務要求
		const classifier = new AITopicClassifier(locale);
		const conversationContext =
			classifier.getConversationContext(sessionId);
		const specificServiceRequest = message
			? classifier.detectSpecificServiceRequest(message)
			: null;

		console.log("🔍 具體服務檢測:", {
			message: message,
			specificServiceRequest: specificServiceRequest,
			hasRecentMessages: conversationContext.hasHistory,
			messageCount: conversationContext.messageCount,
		});

		let response, analysis;
		let shouldTriggerModal = false;
		let reportUrl = null;

		// 🎯 優先處理具體服務要求
		if (specificServiceRequest) {
			console.log("✅ 檢測到具體服務要求，引導用戶提供生日");

			response = classifier.generateSpecificServiceGuide(
				specificServiceRequest.serviceName,
				specificServiceRequest.detectedTopic
			);

			// 記錄到會話歷史
			classifier.updateConversationMemory(sessionId, message, response, {
				requestedService: specificServiceRequest.serviceName,
				detectedTopic: specificServiceRequest.detectedTopic,
				awaitingBirthday: true,
			});

			// 🔧 映射 detectedTopic 到有效的 primaryConcern 值
			const topicMapping = {
				命理: "其他",
				命理分析: "其他",
				八字: "其他",
				紫微斗數: "其他",
				占卜: "其他",
				運勢: "其他",
			};

			const mappedTopic =
				topicMapping[specificServiceRequest.detectedTopic] ||
				specificServiceRequest.detectedTopic;

			// 🔧 更新 UserIntent 以保持主題上下文一致性
			if (userIntent) {
				console.log(
					`📝 更新 UserIntent: ${userIntent.primaryConcern} -> ${specificServiceRequest.detectedTopic} (mapped to: ${mappedTopic})`
				);
				userIntent.primaryConcern = mappedTopic;
				userIntent.specificQuestion = `用戶請求${specificServiceRequest.serviceName}`;
				userIntent.originalSpecificProblem = `用戶請求${specificServiceRequest.serviceName}`;
				userIntent.conversationState = "birthday_collection";
				await userIntent.save();
			}

			// 保存到數據庫
			try {
				let chatHistory = await ChatHistory.findOne({ sessionId });

				if (!chatHistory) {
					chatHistory = new ChatHistory({
						conversationId: sessionId,
						sessionId: sessionId,
						userId: userId,
						userEmail: userEmail,
						title: `${specificServiceRequest.serviceName}諮詢`,
						primaryConcern: mappedTopic,
						conversationState: "awaiting_birthday",
						messages: [],
						context: {
							topics: [mappedTopic],
							lastTopic: mappedTopic,
						},
						userData: {},
					});
				}

				// 添加用戶消息和助手回應
				chatHistory.addMessage("user", message);
				chatHistory.addMessage("assistant", response);

				await chatHistory.save();
			} catch (error) {
				console.error("💾 保存聊天記錄失敗:", error);
			}

			// 🔢 獲取用戶當前分析額度信息並添加到回應中
			try {
				const userStats = await DailyAnalysisRateLimit.getUserStats(
					userEmail,
					userId
				);
				const remainingAnalyses = userStats.remaining || 10;
				const dailyLimit = 10;

				// 在原回應後添加額度信息
				const rateLimitInfo = `\n\n📊 今日分析額度: 你每日可進行 ${dailyLimit} 次專業分析，目前還剩 ${remainingAnalyses} 次機會哦～`;
				response = response + rateLimitInfo;
			} catch (error) {
				console.log("⚠️ 獲取分析額度信息失敗:", error);
			}

			return NextResponse.json({
				response: response,
				detectedTopic: specificServiceRequest.detectedTopic,
				requestedService: specificServiceRequest.serviceName,
				systemType: "smart-chat2",
				timestamp: new Date().toISOString(),
			});
		}

		// 🔍 Debug couple analysis condition
		console.log("🔍 DEBUG - 合婚分析條件檢查:");
		console.log("   couplesBirthdayData:", !!couplesBirthdayData);
		console.log(
			"   userIntent?.relationshipAnalysisType:",
			userIntent?.relationshipAnalysisType
		);
		console.log(
			"   條件是否滿足:",
			couplesBirthdayData &&
				userIntent?.relationshipAnalysisType === "couple"
		);

		if (
			couplesBirthdayData &&
			userIntent?.relationshipAnalysisType === "couple"
		) {
			// 🎯 處理合婚分析的雙方生日輸入
			console.log("🎯 檢測到合婚分析中的雙方生日:", couplesBirthdayData);

			// 🚫 檢查每日初步分析限制（合婚分析）
			const rateLimitCheck = await DailyAnalysisRateLimit.checkUserLimit(
				userEmail,
				userId
			);
			if (!rateLimitCheck.canAnalyze) {
				const limitMessage =
					DailyAnalysisRateLimit.generateLimitExceededMessage(
						rateLimitCheck.currentCount,
						rateLimitCheck.limit
					);

				return NextResponse.json({
					response: limitMessage,
					analysis: {
						isWithinScope: false,
						detectedTopic: "rate_limit_exceeded",
						specificProblem: "每日分析次數已達上限",
						confidence: 1.0,
						rateLimited: true,
						currentCount: rateLimitCheck.currentCount,
						limit: rateLimitCheck.limit,
					},
					shouldTriggerModal: false,
				});
			}

			try {
				// 更新用戶資料
				userIntent.userBirthday = couplesBirthdayData.userBirthday;
				userIntent.partnerBirthday =
					couplesBirthdayData.partnerBirthday;
				userIntent.conversationState = "asking_detailed_report";

				// 🔮 生成合婚分析報告 - 使用原始用戶訊息
				const { EnhancedInitialAnalysis } = await import(
					"../../../lib/enhancedInitialAnalysis.js"
				);

				// 🔧 使用相同的優先級鏈確保原始訊息被使用
				const specificQuestionForAnalysis =
					userIntent.originalUserMessage ||
					userIntent.originalSpecificProblem ||
					userIntent.specificQuestion ||
					"合婚配對分析";

				console.log("🔍 DEBUG - 合婚分析原始訊息來源:");
				console.log(
					"   userIntent.originalUserMessage:",
					userIntent.originalUserMessage
				);
				console.log(
					"   userIntent.originalSpecificProblem:",
					userIntent.originalSpecificProblem
				);
				console.log(
					"   userIntent.specificQuestion:",
					userIntent.specificQuestion
				);
				console.log(
					"🔍 傳遞給 generateCoupleAnalysis 的具體問題:",
					specificQuestionForAnalysis
				);

				const coupleAnalysisResult =
					await EnhancedInitialAnalysis.generateCoupleAnalysis(
						couplesBirthdayData.userBirthday,
						couplesBirthdayData.partnerBirthday,
						specificQuestionForAnalysis,
						region,
						couplesBirthdayData.userGender,
						couplesBirthdayData.partnerGender,
						locale
					); // 🔧 轉換結構化對象為格式化字符串
				if (
					typeof coupleAnalysisResult === "object" &&
					coupleAnalysisResult.basicAnalysis
				) {
					response =
						formatCoupleAnalysisResponse(coupleAnalysisResult);
					console.log(
						"🔧 DEBUG - 格式化後的response類型:",
						typeof response
					);
					console.log(
						"🔧 DEBUG - 格式化後的response長度:",
						response?.length
					);
				} else {
					response = coupleAnalysisResult; // 向後兼容字符串回應
					console.log(
						"🔧 DEBUG - 使用原始response，類型:",
						typeof response
					);
				}

				analysis = {
					detectedTopic: "感情",
					isWithinScope: true,
					confidence: 0.95,
					// 🔧 修正：保持原始具體問題，不要被覆蓋
					specificProblem:
						userIntent.originalSpecificProblem ||
						userIntent.specificQuestion ||
						"合婚配對分析",
				};

				// 🔍 Debug: 顯示生日處理後的分析結果
				console.log("📊 生日處理後的分析結果:");
				console.log(
					"   分析的 specificProblem:",
					analysis.specificProblem
				);
				console.log(
					"   來源 - originalSpecificProblem:",
					userIntent.originalSpecificProblem
				);
				console.log(
					"   來源 - specificQuestion:",
					userIntent.specificQuestion
				);

				// 🚫 記錄分析次數
				await DailyAnalysisRateLimit.recordAnalysis(
					userEmail,
					userId,
					sessionId,
					"couple", // 合婚分析類型
					"感情",
					userIntent.originalUserMessage ||
						userIntent.originalSpecificProblem ||
						userIntent.specificQuestion
				);
			} catch (error) {
				console.error("❌ 生成合婚分析失敗:", error);
				response = "很抱歉，在分析你們的八字時遇到了問題，請稍後再試。";
				analysis = {
					detectedTopic: "感情",
					isWithinScope: true,
					confidence: 0.8,
					specificProblem: "系統錯誤",
				};
			}
		} else if (topicAndBirthdayData) {
			// 🎯 NEW: 處理同時包含主題和生日的輸入
			console.log("🎯 檢測到主題+生日組合:", topicAndBirthdayData);

			// 🚫 檢查每日分析限制
			const rateLimitCheck = await DailyAnalysisRateLimit.checkUserLimit(
				userEmail,
				userId
			);
			if (!rateLimitCheck.canAnalyze) {
				const limitMessage =
					DailyAnalysisRateLimit.generateLimitExceededMessage(
						rateLimitCheck.currentCount,
						rateLimitCheck.limit
					);

				return NextResponse.json({
					response: limitMessage,
					analysis: {
						isWithinScope: false,
						detectedTopic: "rate_limit_exceeded",
						specificProblem: "每日分析次數已達上限",
						confidence: 1.0,
						rateLimited: true,
						currentCount: rateLimitCheck.currentCount,
						limit: rateLimitCheck.limit,
					},
					reportUrl: null,
					shouldTriggerModal: false,
				});
			}

			try {
				// 創建或更新用戶意圖
				if (!userIntent) {
					userIntent = new SmartUserIntent({
						sessionId: sessionId,
						userEmail: userEmail,
						userId: userId, // 🆕 新增：保存userId
						conversationActive: true,
						primaryConcern: topicAndBirthdayData.topic,
						specificQuestion:
							topicAndBirthdayData.originalMessage ||
							`想了解${topicAndBirthdayData.topic}方面的運勢`,
						originalUserMessage:
							topicAndBirthdayData.originalMessage, // 🆕 永不覆蓋的原始訊息
						relationshipAnalysisType: "individual",
						conversationState: "asking_detailed_report",
						createdAt: new Date(),
					});
				} else {
					// 🎂 更新現有的用戶意圖 - 保持原始主題，不覆蓋
					// 如果用戶已經有 primaryConcern，保持不變（用戶可能在輸入新生日）
					if (!userIntent.primaryConcern) {
						userIntent.primaryConcern = topicAndBirthdayData.topic;
					}
					// 保持原始問題，不用生日日期覆蓋
					if (!userIntent.originalUserMessage) {
						userIntent.originalUserMessage =
							topicAndBirthdayData.originalMessage;
					}
					userIntent.conversationState = "asking_detailed_report";
				}

				// 設置生日
				userIntent.userBirthday = topicAndBirthdayData.birthday.parsed;
				userIntent.birthdayConfirmed = true; // 🎂 標記生日已確認

				// � 檢查每日初步分析限制（topic+birthday組合）
				const rateLimitCheck =
					await DailyAnalysisRateLimit.checkUserLimit(
						userEmail,
						userId
					);
				if (!rateLimitCheck.canAnalyze) {
					const limitMessage =
						DailyAnalysisRateLimit.generateLimitExceededMessage(
							rateLimitCheck.currentCount,
							rateLimitCheck.limit
						);

					await userIntent.save();

					return NextResponse.json({
						response: limitMessage,
						analysis: {
							isWithinScope: false,
							detectedTopic: "rate_limit_exceeded",
							specificProblem: "每日分析次數已達上限",
							confidence: 1.0,
							rateLimited: true,
							currentCount: rateLimitCheck.currentCount,
							limit: rateLimitCheck.limit,
						},
						shouldTriggerModal: false,
					});
				}

				// �🔮 直接生成初步分析報告
				const { EnhancedInitialAnalysis } = await import(
					"../../../lib/enhancedInitialAnalysis.js"
				);

				// 🎯 使用用戶原始主題，而不是 AI 重新檢測的主題
				const analysisTopic =
					userIntent.primaryConcern || topicAndBirthdayData.topic;
				console.log(
					`🎯 使用主題進行分析: ${analysisTopic} (原始: ${userIntent.primaryConcern}, AI檢測: ${topicAndBirthdayData.topic})`
				);

				if (analysisTopic === "感情") {
					// 🔧 優先使用原始用戶訊息，而非AI分析的通用描述
					const specificQuestionForAnalysis =
						userIntent.originalUserMessage ||
						topicAndBirthdayData.originalMessage ||
						userIntent.originalSpecificProblem ||
						userIntent.specificQuestion ||
						"一般感情分析";

					console.log("🔍 DEBUG - 分析原始訊息來源:");
					console.log(
						"   userIntent.originalUserMessage:",
						userIntent.originalUserMessage
					);
					console.log(
						"   topicAndBirthdayData.originalMessage:",
						topicAndBirthdayData?.originalMessage
					);
					console.log(
						"   userIntent.originalSpecificProblem:",
						userIntent.originalSpecificProblem
					);
					console.log(
						"   userIntent.specificQuestion:",
						userIntent.specificQuestion
					);
					console.log(
						"🔍 傳遞給 generateLoveAnalysis 的具體問題:",
						specificQuestionForAnalysis
					);
					response =
						await EnhancedInitialAnalysis.generateLoveAnalysis(
							topicAndBirthdayData.birthday.parsed,
							specificQuestionForAnalysis,
							locale
						);
				} else if (analysisTopic === "財運") {
					response =
						await EnhancedInitialAnalysis.generateFinanceAnalysis(
							topicAndBirthdayData.birthday.parsed,
							userIntent.originalSpecificProblem ||
								userIntent.specificQuestion ||
								topicAndBirthdayData.originalMessage ||
								"財運諮詢",
							locale
						);
				} else if (analysisTopic === "工作") {
					response =
						await EnhancedInitialAnalysis.generateWorkAnalysis(
							topicAndBirthdayData.birthday.parsed,
							userIntent.originalSpecificProblem ||
								userIntent.specificQuestion ||
								topicAndBirthdayData.originalMessage ||
								"工作運勢",
							locale
						);
				} else if (analysisTopic === "健康") {
					response =
						await EnhancedInitialAnalysis.generateHealthAnalysis(
							topicAndBirthdayData.birthday.parsed,
							userIntent.originalSpecificProblem ||
								userIntent.specificQuestion ||
								topicAndBirthdayData.originalMessage ||
								"健康運勢",
							locale
						);
				} else {
					// 其他領域使用通用分析
					response =
						await EnhancedInitialAnalysis.generatePersonalAnalysis(
							topicAndBirthdayData.birthday.parsed,
							analysisTopic,
							userIntent.originalSpecificProblem ||
								userIntent.specificQuestion ||
								topicAndBirthdayData.originalMessage ||
								`${analysisTopic}諮詢`,
							locale
						);
				}

				// 添加詳細報告選項菜單 - 現在使用 enhancedInitialAnalysis 中的方法
				response += EnhancedInitialAnalysis.getReportRecommendations(
					analysisTopic,
					region
				);

				analysis = {
					isWithinScope: true,
					detectedTopic: analysisTopic,
					specificProblem: `${analysisTopic}運勢分析`,
					confidence: 0.95,
					birthdayProvided: true,
					topicAndBirthdayDetected: true,
				};
				console.log("✅ 主題+生日分析生成成功");

				// 🚫 記錄分析次數
				await DailyAnalysisRateLimit.recordAnalysis(
					userEmail,
					userId,
					sessionId,
					"individual", // topic+birthday組合都是個人分析
					analysisTopic,
					userIntent.originalUserMessage ||
						topicAndBirthdayData.originalMessage
				);
			} catch (error) {
				console.error("❌ 主題+生日分析失敗:", error);
				// 備用回應
				response = `🎉 太好了！你想了解${topicAndBirthdayData.topic}，生日是 ${topicAndBirthdayData.birthday.original}！

讓風鈴為你做詳細的${topicAndBirthdayData.topic}分析～

正在為你計算八字和運勢...

根據你的出生日期，我會從以下角度為你分析：
🔮 **八字命盤** - 你的基本運勢特質
⭐ **流年運勢** - 今年的${topicAndBirthdayData.topic}運勢如何
💫 **開運建議** - 專門針對${topicAndBirthdayData.topic}的風水調整

稍等一下，讓我為你準備專業的分析報告... ✨`;

				analysis = {
					isWithinScope: true,
					detectedTopic: analysisTopic,
					specificProblem: `${analysisTopic}運勢分析`,
					confidence: 0.8,
					birthdayProvided: true,
					topicAndBirthdayDetected: true,
				};
			}
		} else if (isBreakupChoice && userIntent?.primaryConcern === "感情") {
			// 檢查ChatHistory中是否有分手狀態選項
			const chatHistory = await ChatHistory.findOne({
				$or: [{ conversationId: sessionId }, { sessionId: sessionId }],
			});

			const hasBreakupOptions = chatHistory?.messages?.some(
				(msg) =>
					msg.role === "assistant" &&
					(msg.content.includes("A. 剛分手，還很難過") ||
						msg.content.includes("請選擇你的感情狀態"))
			);

			if (hasBreakupOptions) {
				// 🔧 處理分手狀態選擇 (A, B, C, D) - 分手特殊邏輯後續回應
				console.log("🎯 檢測到分手狀態選擇:", message);

				let breakupChoice = message.trim().toUpperCase().charAt(0);
				if (!["A", "B", "C", "D"].includes(breakupChoice)) {
					// 如果不是字母，嘗試從文字中判斷
					const text = message.toLowerCase();
					if (text.includes("剛分手") || text.includes("難過")) {
						breakupChoice = "A";
					} else if (
						text.includes("分手一段時間") ||
						text.includes("重新開始")
					) {
						breakupChoice = "B";
					} else if (
						text.includes("復合") ||
						text.includes("不確定")
					) {
						breakupChoice = "C";
					} else if (
						text.includes("放下") ||
						text.includes("新對象")
					) {
						breakupChoice = "D";
					}
				}

				switch (breakupChoice) {
					case "A":
						// A. 剛分手，還很難過
						response = `風鈴完全理解你現在的心情，剛分手真的很痛苦... 

給自己一些時間療傷是很重要的，不要急著壓抑情緒哦！

**🌸 現階段最重要的建議：
**情感修復期** - 允許自己悲傷，但不要沉溺太久
**能量清理** - 整理房間，特別是感情角落（西南方）
**自我照顧** - 多接觸陽光，避免長期待在陰暗空間

**💕 感情風水調整：
- 收起合照但不要丟掉，放在抽屜裡
- 在床頭放粉水晶，幫助療癒心傷
- 多穿粉色或白色，有淨化負能量的效果

要記住，每一次結束都是為了更好的開始！風鈴會陪著你走過這段路的 🤗

為了提供最適合的分析，請選擇：

如要增加個人能量，可選
1️⃣ 個人感情分析
- 分析你的桃花運勢和感情特質
- 提供感情運勢建議和風水調整
- 適合單身或想了解個人感情運的朋友

如要看是否跟伴侶合適，可選
2️⃣ 合婚配對分析
- 分析你和伴侶的八字契合度
- 提供雙方感情走向和發展建議  
- 適合想了解感情配對度的情侶

你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
						break;

					case "B":
						// B. 分手一段時間了，想重新開始
						response = `🌟 太好了！能夠準備好重新開始，代表你已經成長了很多呢！

現在是最適合重新出發的時候，風鈴來幫你做好準備！

**🎯 重新開始的黃金準則：**
**心境調整** - 放下過去包袱，專注未來可能
**桃花佈局** - 活化感情能量，吸引對的人
**自信提升** - 從內而外散發魅力

**💖 招桃花風水秘技：**
- 西南方放置粉水晶樹或玫瑰花
- 床頭櫃成雙成對擺設，象徵感情圓滿
- 穿戴粉色或紅色增強桃花運
- 保持笑容，正能量最吸引人！

為了提供最適合的分析，請選擇：

如要增加個人能量，可選
1️⃣ 個人感情分析
- 分析你的桃花運勢和感情特質
- 提供感情運勢建議和風水調整
- 適合單身或想了解個人感情運的朋友

如要看是否跟伴侶合適，可選
2️⃣ 合婚配對分析
- 分析你和伴侶的八字契合度
- 提供雙方感情走向和發展建議  
- 適合想了解感情配對度的情侶

你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
						break;

					case "C":
						// C. 想復合，但不確定
						response = `💭 想復合的心情風鈴很理解，但這確實需要謹慎考慮呢...

讓我們一起分析一下復合的可能性和最佳策略！

**🤔 復合前的重要思考：**
**分手原因** - 根本問題是否已經解決？
**成長空間** - 這段時間你們都有改變嗎？
**未來願景** - 對感情的期待是否一致？

**💕 風水調整建議：**
- 在感情角落放置和合符或成對物品
- 選擇農曆十五前後進行溝通，月圓人團圓
- 保持內心平靜，多給自己時間思考

復合不是唯一的選擇，最重要的是你的幸福！

為了提供最適合的分析，請選擇：

如要增加個人能量，可選
1️⃣ 個人感情分析
- 分析你的桃花運勢和感情特質
- 提供感情運勢建議和風水調整
- 適合單身或想了解個人感情運的朋友

如要看是否跟伴侶合適，可選
2️⃣ 合婚配對分析
- 分析你和伴侶的八字契合度
- 提供雙方感情走向和發展建議  
- 適合想了解感情配對度的情侶

你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
						break;

					case "D":
						// D. 已經放下，想找新對象
						response = `✨ 哇！你的心境調整得真好，能夠放下過去迎向未來，這份勇氣很棒呢！

現在就是你桃花大開的最佳時機，風鈴來幫你吸引理想對象！

**🌹 全新開始的能量準備：**
**空間清理** - 徹底整理感情角落，清除舊能量
**形象提升** - 改變髮型或風格，煥然一新
**社交擴展** - 主動參與活動，增加認識機會

**💖 強力招桃花佈局：**
- 感情區（西南方）放置粉水晶球或鮮花
- 臥室保持整潔明亮，床單選用粉色系
- 梳妝台擺放雙數物品，象徵成雙成對
- 隨身配戴紅繩或粉晶，增強個人魅力

最好的愛情會在你準備好的時候出現，相信自己值得被好好愛！

為了提供最適合的分析，請選擇：

如要增加個人能量，可選
1️⃣ 個人感情分析
- 分析你的桃花運勢和感情特質
- 提供感情運勢建議和風水調整
- 適合單身或想了解個人感情運的朋友

如要看是否跟伴侶合適，可選
2️⃣ 合婚配對分析
- 分析你和伴侶的八字契合度
- 提供雙方感情走向和發展建議  
- 適合想了解感情配對度的情侶

你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
						break;

					default:
						response = `抱歉，我沒有理解你的選擇 😅 

請重新選擇你的感情狀態：

💕 請選擇你的感情狀態：
- A. 剛分手，還很難過
- B. 分手一段時間了，想重新開始  
- C. 想復合，但不確定
- D. 已經放下，想找新對象

直接回覆字母 A、B、C 或 D 即可！`;
						break;
				}

				// 記錄分手狀態選擇
				userIntent.breakupStatus = breakupChoice;
				userIntent.conversationState = "asking_relationship_type"; // 設定為詢問關係分析類型狀態
				await userIntent.save();

				analysis = {
					detectedTopic: "感情",
					isWithinScope: true,
					confidence: 0.95,
					specificProblem: `分手狀態選擇_${breakupChoice}`,
				};
			}
		}
		
		// 🔍 Debug: 檢查 userIntent 狀態
		if (message?.trim() === "1" || message?.trim() === "2") {
			console.log("🔍 當前 userIntent 狀態:", {
				exists: !!userIntent,
				conversationState: userIntent?.conversationState,
				message: message?.trim(),
				sessionId: sessionId
			});
		}
		
		// 🎂 檢查是否為生日確認選擇 ("1" 或 "2")
		if (
			(message.trim() === "1" || message.trim() === "2") &&
			userIntent?.conversationState === "awaiting_birthday_choice"
		) {
			console.log("🎂 檢測到生日選擇:", message.trim(), "狀態:", userIntent?.conversationState);
			// 🎂 查詢資料庫中是否有已保存的生日
			const existingSavedBirthday = await SmartUserIntent.findOne({
				$or: [{ userEmail: userEmail }, { userId: userId }],
				userBirthday: { $exists: true, $ne: null },
				birthdayConfirmed: true,
			}).sort({ updatedAt: -1 });

			if (!existingSavedBirthday) {
				console.log("⚠️ 用戶選擇了 1 或 2，但沒有找到已保存的生日");
				// 如果沒有已保存的生日，要求輸入
				response = `抱歉，風鈴沒有找到你之前保存的生日記錄呢。

請告訴風鈴你的生日：

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;

				analysis = {
					detectedTopic: userIntent.primaryConcern || "其他",
					isWithinScope: true,
					confidence: 0.95,
					specificProblem: "等待輸入生日",
				};
			} else if (message.trim() === "1") {
				// 用戶選擇使用已保存的生日
				console.log(
					"🎂 用戶選擇使用已保存的生日:",
					existingSavedBirthday.userBirthday
				);

				// 🚫 檢查每日初步分析限制
				const rateLimitCheck =
					await DailyAnalysisRateLimit.checkUserLimit(
						userEmail,
						userId
					);
				if (!rateLimitCheck.canAnalyze) {
					const limitMessage =
						DailyAnalysisRateLimit.generateLimitExceededMessage(
							rateLimitCheck.currentCount,
							rateLimitCheck.limit
						);

					return NextResponse.json({
						response: limitMessage,
						analysis: {
							isWithinScope: false,
							detectedTopic: "rate_limit_exceeded",
							specificProblem: "每日分析次數已達上限",
							confidence: 1.0,
							rateLimited: true,
							currentCount: rateLimitCheck.currentCount,
							limit: rateLimitCheck.limit,
						},
						shouldTriggerModal: false,
					});
				}

				// 🎂 將已保存的生日更新到當前 userIntent
				userIntent.userBirthday = existingSavedBirthday.userBirthday;
				userIntent.birthdayConfirmed = true;

				// 使用已保存的生日生成分析
				const { EnhancedInitialAnalysis } = await import(
					"../../../lib/enhancedInitialAnalysis.js"
				);

				const concern = userIntent.primaryConcern || "綜合運勢";
				const specificQuestion =
					userIntent.originalUserMessage ||
					userIntent.originalSpecificProblem ||
					userIntent.specificQuestion ||
					`想了解${concern}方面的運勢`;

				// 根據主題生成相應分析
				if (concern === "感情") {
					response =
						await EnhancedInitialAnalysis.generateLoveAnalysis(
							existingSavedBirthday.userBirthday,
							specificQuestion,
							locale
						);
				} else if (concern === "財運") {
					response =
						await EnhancedInitialAnalysis.generateFinanceAnalysis(
							existingSavedBirthday.userBirthday,
							specificQuestion,
							locale
						);
				} else if (concern === "工作" || concern === "事業") {
					response =
						await EnhancedInitialAnalysis.generateWorkAnalysis(
							existingSavedBirthday.userBirthday,
							specificQuestion,
							locale
						);
				} else if (concern === "健康") {
					response =
						await EnhancedInitialAnalysis.generateHealthAnalysis(
							existingSavedBirthday.userBirthday,
							specificQuestion,
							locale
						);
				} else if (concern === "命理") {
					response =
						await EnhancedInitialAnalysis.generateFateAnalysis(
							existingSavedBirthday.userBirthday,
							specificQuestion,
							locale
						);
				} else {
					response =
						await EnhancedInitialAnalysis.generatePersonalAnalysis(
							existingSavedBirthday.userBirthday,
							concern,
							specificQuestion,
							locale
						);
				}

				// 🎯 添加報告選擇部分
				response += `\n\n───────────────────
💎 想要更深入的分析嗎？
根據你的狀況，風鈴為你推薦：

1️⃣ 一份關於${concern}的詳細報告 價值HK$88，限時優惠HK$38
- 深入分析你的${concern}運勢，提供具體建議和改善方案
- 詳細的五行調理方法
- 最佳行動時機指導

2️⃣ 一份綜合命理報告 價值HK$168，限時優惠HK$88
- 全面的八字命盤分析，包含各方面運勢預測
- 流年大運走勢分析
- 人際關係和事業發展建議

請回覆「1」或「2」選擇你想要的報告～`;

				// 更新狀態
				userIntent.conversationState = "asking_detailed_report";
				await userIntent.save();

				// 📊 記錄成功分析
				await DailyAnalysisRateLimit.recordAnalysis(
					userEmail,
					userId,
					sessionId,
					"individual",
					concern,
					userIntent.originalUserMessage || specificQuestion
				);

				analysis = {
					detectedTopic: concern,
					isWithinScope: true,
					confidence: 0.95,
					specificProblem: specificQuestion,
				};
			} else {
				// 用戶選擇輸入新生日
				console.log("🎂 用戶選擇輸入新生日");

				response = `好的！請告訴風鈴你的新生日～

📅 生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，然後你可以選擇是否需要更詳細的報告！✨`;

				// 保持在 birthday_collection 狀態，但清除已保存的生日標記，允許輸入新的
				userIntent.conversationState = "birthday_collection";
				// 不清除 userBirthday，這樣如果用戶不輸入新的，仍可使用舊的
				await userIntent.save();

				analysis = {
					detectedTopic: userIntent.primaryConcern || "其他",
					isWithinScope: true,
					confidence: 0.95,
					specificProblem: "等待輸入新生日",
				};
			}
		} else if (isBirthdayInput && userIntent?.primaryConcern) {
			// 生日輸入 - 生成初步分析報告 (完全複製 smart-chat 邏輯)

			// 🚫 檢查每日初步分析限制（生日輸入）
			const rateLimitCheck = await DailyAnalysisRateLimit.checkUserLimit(
				userEmail,
				userId
			);
			if (!rateLimitCheck.canAnalyze) {
				const limitMessage =
					DailyAnalysisRateLimit.generateLimitExceededMessage(
						rateLimitCheck.currentCount,
						rateLimitCheck.limit
					);

				return NextResponse.json({
					response: limitMessage,
					analysis: {
						isWithinScope: false,
						detectedTopic: "rate_limit_exceeded",
						specificProblem: "每日分析次數已達上限",
						confidence: 1.0,
						rateLimited: true,
						currentCount: rateLimitCheck.currentCount,
						limit: rateLimitCheck.limit,
					},
					shouldTriggerModal: false,
				});
			}

			try {
				// 解析並標準化生日格式
				const cleanedDate = message
					.replace(/[年月日]/g, "-")
					.replace(/[/]/g, "-");
				const dateMatch = cleanedDate.match(
					/(\d{4})-(\d{1,2})-(\d{1,2})/
				);
				let standardDate;
				if (dateMatch) {
					const [, year, month, day] = dateMatch;
					standardDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
				} else {
					standardDate = message;
				}

				// 🎂 保存生日到資料庫
				userIntent.userBirthday = new Date(standardDate);
				userIntent.birthdayConfirmed = true;
				console.log("🎂 生日已保存並標記為已確認:", standardDate);

				// 🔮 生成初步分析報告 - 與 smart-chat 完全相同
				const { EnhancedInitialAnalysis } = await import(
					"../../../lib/enhancedInitialAnalysis.js"
				);

				if (userIntent.primaryConcern === "感情") {
					if (userIntent.relationshipAnalysisType === "individual") {
						// 🔧 使用相同的優先級鏈確保原始訊息被使用
						const specificQuestionForAnalysis =
							userIntent.originalUserMessage ||
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							"個人感情分析";

						console.log("🔍 DEBUG - 多步流程分析原始訊息來源:");
						console.log(
							"   userIntent.originalUserMessage:",
							userIntent.originalUserMessage
						);
						console.log(
							"   userIntent.originalSpecificProblem:",
							userIntent.originalSpecificProblem
						);
						console.log(
							"   userIntent.specificQuestion:",
							userIntent.specificQuestion
						);
						console.log(
							"🔍 傳遞給 generateLoveAnalysis 的具體問題:",
							specificQuestionForAnalysis
						);

						response =
							await EnhancedInitialAnalysis.generateLoveAnalysis(
								new Date(standardDate),
								specificQuestionForAnalysis,
								locale
							);
					} else if (
						userIntent.relationshipAnalysisType === "couple"
					) {
						// 🔧 使用相同的優先級鏈確保原始訊息被使用
						const specificQuestionForAnalysis =
							userIntent.originalUserMessage ||
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							"合婚配對分析準備";

						response =
							await EnhancedInitialAnalysis.generateLoveAnalysis(
								new Date(standardDate),
								specificQuestionForAnalysis,
								locale
							);
						// 為合婚分析添加對方生日選項
						response += `\n\n💕 想做完整合婚分析嗎？\n如果你有伴侶，可以提供對方的生日，我可以為你們做八字配對分析，看看感情相容度哦！`;
					} else {
						// 🔧 使用相同的優先級鏈確保原始訊息被使用
						const specificQuestionForAnalysis =
							userIntent.originalUserMessage ||
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							"一般感情分析";

						response =
							await EnhancedInitialAnalysis.generateLoveAnalysis(
								new Date(standardDate),
								specificQuestionForAnalysis,
								locale
							);
					}
				} else if (userIntent.primaryConcern === "財運") {
					response =
						await EnhancedInitialAnalysis.generateFinanceAnalysis(
							new Date(standardDate),
							userIntent.specificQuestion || "財運諮詢",
							locale
						);
				} else if (userIntent.primaryConcern === "工作") {
					response =
						await EnhancedInitialAnalysis.generateWorkAnalysis(
							new Date(standardDate),
							userIntent.specificQuestion || "工作運勢",
							locale
						);
				} else {
					// 其他領域使用通用分析
					response =
						await EnhancedInitialAnalysis.generatePersonalAnalysis(
							new Date(standardDate),
							userIntent.primaryConcern,
							userIntent.specificQuestion ||
								`${userIntent.primaryConcern}諮詢`,
							locale
						);
				}

				// 添加詳細報告選項菜單
				response += EnhancedInitialAnalysis.getReportRecommendations(
					userIntent.primaryConcern,
					region
				);

				// 🚫 記錄分析次數
				await DailyAnalysisRateLimit.recordAnalysis(
					userEmail,
					userId,
					sessionId,
					userIntent.relationshipAnalysisType || "individual",
					userIntent.primaryConcern,
					userIntent.originalUserMessage ||
						userIntent.originalSpecificProblem ||
						userIntent.specificQuestion
				);

				// 設置狀態為詢問詳細報告
				userIntent.conversationState = "asking_detailed_report";
				await userIntent.save();
				console.log("💾 用戶意圖已保存，包含生日和確認狀態");
			} catch (error) {
				console.error("🚨 初步分析生成失敗:", error);
				// 備用回應
				response = `🎉 太好了！你的生日是 ${message}，讓我為你做詳細的${userIntent.primaryConcern}分析～

正在為你計算八字和運勢...

根據你的出生日期，我會從以下角度為你分析：
🔮 **八字命盤** - 你的基本運勢特質
⭐ **流年運勢** - 今年的${userIntent.primaryConcern}運勢如何
💫 **開運建議** - 專門針對${userIntent.primaryConcern}的風水調整

稍等一下，讓我為你準備專業的分析報告... ✨

(請等待系統為你測算詳細的${userIntent.primaryConcern}分析報告)`;
			}

			analysis = {
				isWithinScope: true,
				detectedTopic: userIntent.primaryConcern,
				// 🔧 FIX: 使用原始詳細問題而不是通用描述
				specificProblem:
					userIntent.originalSpecificProblem ||
					(userIntent.relationshipAnalysisType === "individual"
						? "個人感情分析"
						: userIntent.relationshipAnalysisType === "couple"
							? "合婚配對分析"
							: `${userIntent.primaryConcern}諮詢`),
				confidence: 0.95,
				birthdayProvided: true,
			};
		} else if (reportType && !message?.trim() && !userBirthday) {
			// 🔧 處理報告類型請求 (僅報告類型，無訊息和生日)
			console.log("🎯 檢測到報告類型請求:", reportType);

			if (!userIntent) {
				return NextResponse.json(
					{
						response: "請先開始一個對話再請求報告。",
						systemType: "smart-chat2",
					},
					{ status: 400 }
				);
			}

			if (reportType === "detailed_concern") {
				// 處理詳細關注領域報告請求
				const concernName = userIntent.primaryConcern || "運勢";

				// 檢查是否有足夠資料生成報告
				if (
					userIntent.relationshipAnalysisType === "couple" &&
					userIntent.userBirthday &&
					userIntent.partnerBirthday
				) {
					// 合婚分析詳細報告 - 先生成並保存到數據庫
					try {
						// 🔮 生成合婚分析數據 (使用現有的 EnhancedInitialAnalysis 邏輯)
						const userDateString = userIntent.userBirthday
							.toISOString()
							.split("T")[0];
						const partnerDateString = userIntent.partnerBirthday
							.toISOString()
							.split("T")[0];

						// 生成基本的合婚分析數據 (簡化版，用於報告保存)
						const basicCoupleAnalysis = {
							compatibility: 75, // Number instead of "75%"
							userElement: "金",
							partnerElement: "木",
							advice: "金木相配需要磨合，但能互相促進成長",
							fengShuiAdvice:
								"居家多用水元素協調金木相剋，如藍綠色裝飾品",
							userPersonality: "理性穩重，做事有條理",
							partnerPersonality: "活潑創新，富有想像力",
							userLoveStyle: "深情專一，重視承諾",
							partnerLoveStyle: "熱情表達，喜歡浪漫",
						};

						// 🎯 創建並保存詳細合婚報告到數據庫 (複製自 Smart-Chat 邏輯)
						const coupleReport = new CoupleReportDoc({
							userId: userId, // Use the authenticated user's ID from session
							sessionId: sessionId,
							language: "zh-CN",
							userProfile: {
								birthday: userIntent.userBirthday,
								gender: "male", // 默認值，可以後續改進
								element: basicCoupleAnalysis.userElement,
								personality:
									basicCoupleAnalysis.userPersonality,
								loveStyle: basicCoupleAnalysis.userLoveStyle,
							},
							partnerProfile: {
								birthday: userIntent.partnerBirthday,
								gender: "female", // 默認值，可以後續改進
								element: basicCoupleAnalysis.partnerElement,
								personality:
									basicCoupleAnalysis.partnerPersonality,
								loveStyle: basicCoupleAnalysis.partnerLoveStyle,
							},
							compatibilityAnalysis: {
								overallScore: basicCoupleAnalysis.compatibility,
								relationshipAdvice: basicCoupleAnalysis.advice,
								developmentAdvice:
									"建議多參與共同活動，增進彼此了解",
								specificAdvice:
									"建議多溝通，理解彼此不同的表達方式",
								communicationAdvice:
									"建議多溝通，理解彼此不同的表達方式",
								challenges: "性格差異較大，需要耐心磨合",
								strengths: "能夠互補，共同成長",
							},
							yearlyFortune: {
								currentYear:
									"今年感情運勢整體向好，適合深化關係",
								bestTiming: "春秋兩季是感情發展的好時機",
								warnings: "夏季需要注意溝通問題，避免爭執",
							},
							fengShuiLayout: {
								bedroom: "床頭朝東南方，使用粉色或淺藍色床品",
								livingRoom: "客廳放置成對裝飾品，增強感情和諧",
								colors: "粉色、金色、淺綠色",
								items: "玫瑰石英、成對的擺件、鮮花",
								generalAdvice:
									basicCoupleAnalysis.fengShuiAdvice,
							},
							reportMetadata: {
								concern: "感情",
								reportType: "detailed_concern",
								generatedAt: new Date(),
								// 🔧 新增：保存原始具體問題，用於報告中的針對性建議
								originalSpecificProblem:
									userIntent.originalSpecificProblem ||
									userIntent.specificQuestion ||
									"感情變淡，關係疏離",
							},
						});

						const savedReport = await coupleReport.save();
						console.log(
							"🔮 Smart-Chat2 合婚報告已保存，ID:",
							savedReport._id
						);

						// 🎯 使用報告 ID 生成正確的 URL (與 Smart-Chat 一致)
						reportUrl = `/zh-CN/couple-report?id=${savedReport._id}`;

						// 🔍 Debug: 顯示URL生成信息
						console.log("🔗 生成的合婚報告URL:");
						console.log("   報告ID:", savedReport._id);
						console.log("   完整URL:", reportUrl);

						response = `✨ 太好了！你的專屬${concernName}詳細報告已經準備好了！\n\n正在為你打開報告頁面...`;
					} catch (error) {
						console.error(
							"❌ Smart-Chat2 生成合婚報告失敗:",
							error
						);
						response = `抱歉，生成報告時發生錯誤，請稍後再試。`;
						reportUrl = null;
					}
				} else if (userIntent.userBirthday) {
					// 個人分析詳細報告
					const params = new URLSearchParams({
						birthday: userIntent.userBirthday
							.toISOString()
							.split("T")[0],
						gender: "男", // 默認值，可以後續改進
						concern: concernName,
						// 🔧 修正：使用原始具體問題
						problem:
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							`${concernName}分析`,
					});
					reportUrl = `/zh-CN/feng-shui-report?${params.toString()}`;

					response = `✨ 太好了！你的專屬${concernName}詳細報告已經準備好了！\n\n正在為你打開報告頁面...`;
				} else {
					// 缺少生日資料，觸發模態框
					response = `✨ 太好了！我將為你生成一份專業的${concernName}詳細報告。

這份報告將包含：
🎯 深度${concernName}分析
📈 具體改善建議  
🔮 時機把握指導
🏠 相關風水調整

正在準備你的專屬報告...`;
					shouldTriggerModal = true;
				}

				analysis = {
					isWithinScope: true,
					detectedTopic: concernName,
					specificProblem: `用戶選擇詳細${concernName}報告`,
					confidence: 0.95,
					reportChoice: true,
				};

				return NextResponse.json({
					response,
					analysis,
					reportUrl,
					shouldTriggerModal,
					systemType: "smart-chat2",
				});
			}
		} else if (
			isChoiceInput &&
			userIntent?.primaryConcern &&
			userIntent?.conversationState !== "asking_detailed_report" &&
			userIntent?.conversationState !== "awaiting_birthday_choice"
		) {
			console.log("🔵 進入 isChoiceInput 處理區塊，當前狀態:", {
				conversationState: userIntent?.conversationState,
				primaryConcern: userIntent?.primaryConcern,
				message: message?.trim()
			});
			// 🔧 處理用戶選擇回應 (1️⃣2️⃣ 等 + 文字選項) - 僅當不在詢問詳細報告或生日確認狀態
			let choice = message.match(/[12]/)?.[0];

			// 🔧 處理文字選項轉換為數字
			if (!choice) {
				const textMessage = message.trim();
				if (/^(個人分析|個人感情分析|個人)$/i.test(textMessage)) {
					choice = "1";
				} else if (
					/^(合婚分析|合婚配對分析|合婚|配對)$/i.test(textMessage)
				) {
					choice = "2";
				}
			}

			if (userIntent.primaryConcern === "感情") {
				if (choice === "1") {
					// 🔧 檢查是否有已保存的生日
					const existingSavedBirthday = await SmartUserIntent.findOne(
						{
							$or: [{ userId: userId }, { userEmail: userEmail }],
							userBirthday: { $exists: true, $ne: null },
							birthdayConfirmed: true,
						}
					).sort({ updatedAt: -1 });

					if (existingSavedBirthday?.userBirthday) {
						// ✅ 找到已保存生日，詢問是否使用
						const formattedDate = new Date(
							existingSavedBirthday.userBirthday
						).toLocaleDateString("zh-TW", {
							year: "numeric",
							month: "long",
							day: "numeric",
						});

						response = `好！我會為你進行個人感情分析 🌸

風鈴發現你之前提供過生日資料呢！📅

你上次的生日是：${formattedDate}

請選擇：
1️⃣ 使用這個生日進行感情分析
2️⃣ 我想使用其他生日

請回覆「1」或「2」～`;

						userIntent.conversationState =
							"awaiting_birthday_choice";
						console.log(
							"✅ 找到已保存生日，詢問用戶是否使用（個人分析）"
						);
					} else {
						// ❌ 沒有已保存生日，直接詢問
						response = `好！我會為你進行個人感情分析 🌸

為咗更準確分析你嘅感情運勢，我需要你嘅出生日期。

請提供：出生年月日（例如：1990年5月15日）`;
					}

					userIntent.relationshipAnalysisType = "individual";

					// 🔧 新增：保存原始具體問題，優先使用用戶原始訊息
					if (!userIntent.originalSpecificProblem) {
						userIntent.originalSpecificProblem =
							userIntent.originalUserMessage ||
							userIntent.specificQuestion;
						console.log(
							"💾 保存原始具體問題（個人分析）:",
							userIntent.originalSpecificProblem
						);
					}

					// 🔍 Debug: 顯示當前狀態
					console.log("📊 個人分析選擇後的狀態:");
					console.log(
						"   specificQuestion:",
						userIntent.specificQuestion
					);
					console.log(
						"   originalSpecificProblem:",
						userIntent.originalSpecificProblem
					);
				} else if (choice === "2") {
					// 🔧 完全複製 smart-chat 合婚分析回應
					response = `💕 好的！為了進行準確的合婚分析，我需要你們雙方的生日資料。

請先提供**你的生日**（年月日），例如：1995年3月15日

💡 小貼士：你也可以一次提供雙方生日，例如：「我1995/3/15，她1996/8/20」`;
					userIntent.relationshipAnalysisType = "couple";

					// 🔧 新增：保存原始具體問題，優先使用用戶原始訊息
					if (!userIntent.originalSpecificProblem) {
						userIntent.originalSpecificProblem =
							userIntent.originalUserMessage ||
							userIntent.specificQuestion;
						console.log(
							"💾 保存原始具體問題（合婚分析）:",
							userIntent.originalSpecificProblem
						);
					}

					// 🔍 Debug: 顯示當前狀態
					console.log("📊 合婚分析選擇後的狀態:");
					console.log(
						"   specificQuestion:",
						userIntent.specificQuestion
					);
					console.log(
						"   originalSpecificProblem:",
						userIntent.originalSpecificProblem
					);
				}
			} else {
				// 🔧 檢查用戶是否已經提供過八字資料 - 從ChatHistory查找
				const chatHistory = await ChatHistory.findOne({
					$or: [
						{ conversationId: sessionId },
						{ sessionId: sessionId },
					],
				});

				const hasBaziAnalysis = chatHistory?.messages?.some(
					(msg) =>
						msg.role === "assistant" &&
						(msg.content.includes("八字") ||
							msg.content.includes("風鈴看了你的八字") ||
							msg.content.includes("🔮 **八字命盤**"))
				);

				console.log(
					`🔍 檢查八字分析狀態: hasBaziAnalysis=${hasBaziAnalysis}, choice=${choice}`
				);

				if (hasBaziAnalysis) {
					// 用戶已經做過八字分析，直接觸發模態框
					console.log("✅ 用戶已有八字分析，觸發模態框");
					if (choice === "1") {
						response = `好的！我來為你準備詳細的${userIntent.primaryConcern}分析報告 ✨

這份報告將包含：
🎯 深度${userIntent.primaryConcern}分析
📈 具體改善建議  
🔮 時機把握指導
🏠 相關風水調整

正在準備你的專屬報告...`;
						shouldTriggerModal = true;
					} else if (choice === "2") {
						response = `好的！我來為你準備綜合命理報告 ✨

這份報告將包含：
🎯 深度八字分析
📈 各領域運勢預測
🔮 時機把握指導
🏠 風水調整建議

正在準備你的專屬報告...`;
						shouldTriggerModal = true;
					}
				} else {
					// 用戶尚未提供資料，要求生日
					console.log("❌ 用戶尚未提供資料，要求生日");
					response = `好的！告訴風鈴你的生日，我來為你做${userIntent.primaryConcern}分析：

📅生日格式範例：
• 1999-03-15
• 1999/3/15  
• 1999年3月15日

風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕`;
				}
			}

			analysis = {
				isWithinScope: true,
				detectedTopic: userIntent.primaryConcern,
				specificProblem: `用戶選擇: ${userIntent.primaryConcern}分析選項${choice}`,
				confidence: 0.9,
				choiceResponse: true,
			};

			// 🔧 新增：保存userIntent的更改（包括originalSpecificProblem）
			await userIntent.save();
		} else if (userIntent?.conversationState === "asking_detailed_report") {
			// 🔧 優先檢查是否為報告選擇 (1, 2, 3)
			const reportChoice = message.trim();

			if (
				reportChoice === "1" ||
				reportChoice.includes("詳細報告") ||
				reportChoice.includes("第一") ||
				reportChoice === "2" ||
				reportChoice.includes("綜合") ||
				reportChoice.includes("第二") ||
				reportChoice === "3" ||
				reportChoice.includes("居家") ||
				reportChoice.includes("佈局") ||
				reportChoice.includes("第三")
			) {
				console.log("🎯 檢測到報告選擇:", reportChoice);

				if (
					reportChoice === "1" ||
					reportChoice.includes("詳細報告") ||
					reportChoice.includes("第一")
				) {
					// 選擇1：關注領域詳細報告 - 使用 handleFortunePayment 邏輯
					userIntent.reportType = "detailed_concern";
					const concernName = userIntent.primaryConcern || "運勢";

					// 🔧 簡化邏輯：默認為個人分析，只有在明確有伴侶生日時才做合婚分析
					if (
						concernName === "感情" &&
						userIntent.relationshipAnalysisType === "couple" &&
						userIntent.partnerBirthday &&
						userIntent.userBirthday
					) {
						// 有完整雙方生日的合婚分析 - 仍使用合婚分析
						shouldTriggerModal = true;
						userIntent.conversationState =
							"collecting_payment_info";
						response = `💕 太好了！準備為你們製作專屬的合婚分析報告！

這份報告將包含：
🌸 雙方八字深度配對分析
💫 感情發展趨勢預測  
🔮 關係和諧改善建議
🏠 增進感情的風水佈局

請填寫付款資訊，我們立即開始製作你們的專屬報告～`;

						// 🔧 保護原始問題：保持用戶最初的具體問題而不是覆蓋為選擇報告
						analysis = {
							isWithinScope: true,
							detectedTopic: "感情",
							specificProblem:
								userIntent.originalSpecificProblem ||
								"用戶選擇合婚詳細報告",
							confidence: 0.95,
							reportChoice: true,
							paymentType: "couple", // 🔥 修改：合婚分析使用 couple payment API
						};

						console.log("🔒 合婚報告選擇時保護原始問題:");
						console.log(
							"   originalSpecificProblem:",
							userIntent.originalSpecificProblem
						);
						console.log(
							"   分析中的 specificProblem:",
							analysis.specificProblem
						);
					} else {
						// 🔥 所有其他情況都做個人分析報告 - 使用 handleFortunePayment 邏輯
						shouldTriggerModal = true;
						userIntent.conversationState =
							"collecting_payment_info";

						// 🔧 智能推斷實際關注領域
						let actualConcern = concernName;
						if (userIntent.originalSpecificProblem) {
							const originalProblem =
								userIntent.originalSpecificProblem.toLowerCase();
							if (
								originalProblem.includes("財運") ||
								originalProblem.includes("賺錢") ||
								originalProblem.includes("投資") ||
								originalProblem.includes("理財")
							) {
								actualConcern = "財運";
							} else if (
								originalProblem.includes("工作") ||
								originalProblem.includes("事業") ||
								originalProblem.includes("職業") ||
								originalProblem.includes("升職")
							) {
								actualConcern = "工作";
							} else if (
								originalProblem.includes("健康") ||
								originalProblem.includes("身體") ||
								originalProblem.includes("養生")
							) {
								actualConcern = "健康";
							} else if (
								originalProblem.includes("人際") ||
								originalProblem.includes("朋友") ||
								originalProblem.includes("貴人")
							) {
								actualConcern = "感情";
							} else if (
								originalProblem.includes("子女") ||
								originalProblem.includes("孩子") ||
								originalProblem.includes("教育")
							) {
								actualConcern = "子女";
							}
						}

						response = `🌟 太棒了！準備為你製作專屬的${actualConcern}詳細分析報告！

這份報告將包含：
🔮 深入的個人${actualConcern}分析
📈 未來運勢趨勢預測
💡 具體改善建議和方案
🏠 專屬風水佈局建議

請填寫個人資料，我們立即開始製作你的專屬報告～`;

						// 🔧 保護原始問題：使用用戶最初的具體問題而不是覆蓋為選擇報告
						analysis = {
							isWithinScope: true,
							detectedTopic: actualConcern,
							specificProblem:
								userIntent.originalSpecificProblem ||
								`用戶選擇${actualConcern}詳細報告`,
							confidence: 0.95,
							reportChoice: true,
							paymentType: "fortune", // 🔥 新增：選擇1使用 handleFortunePayment 邏輯 (regional pricing)
						};

						console.log("🔒 報告選擇時保護原始問題:");
						console.log(
							"   originalSpecificProblem:",
							userIntent.originalSpecificProblem
						);
						console.log(
							"   分析中的 specificProblem:",
							analysis.specificProblem
						);
					}
				} else if (
					reportChoice === "2" ||
					reportChoice.includes("綜合") ||
					reportChoice.includes("第二")
				) {
					// 🔧 檢查是否為合婚分析情境
					if (
						userIntent.relationshipAnalysisType === "couple" &&
						userIntent.partnerBirthday &&
						userIntent.userBirthday
					) {
						// 合婚情境下的選擇2：綜合命理報告
						userIntent.reportType = "comprehensive";
						userIntent.conversationState =
							"collecting_payment_info";
						shouldTriggerModal = true;

						response = `🔮 很棒的選擇！為你製作綜合命理報告！

這份報告將包含：
📊 全面的八字命盤分析，包含各方面運勢預測
🌟 流年大運走勢分析
🎯 人際關係和事業發展建議

請填寫付款資訊，我們立即開始製作你的專屬報告～`;

						analysis = {
							isWithinScope: true,
							detectedTopic: "綜合運勢",
							specificProblem: "用戶選擇綜合命理報告",
							confidence: 0.95,
							reportChoice: true,
							paymentType: "comprehensive", // 使用綜合報告付款API
						};
					} else {
						// 非合婚情境的選擇2：綜合命理報告
						userIntent.reportType = "comprehensive";
						userIntent.conversationState =
							"collecting_payment_info";
						shouldTriggerModal = true;

						response = `🔮 很棒的選擇！綜合命理報告是最全面的分析！

這份報告將包含：
📊 完整八字命盤解析
🌟 各領域運勢預測（感情、工作、財運、健康等）
🎯 人生重要時機把握
🏠 全方位風水佈局建議

請填寫個人資料，準備製作你的專屬綜合命理報告～`;

						analysis = {
							isWithinScope: true,
							detectedTopic: "綜合運勢",
							specificProblem: "用戶選擇綜合命理報告",
							confidence: 0.95,
							reportChoice: true,
							paymentType: "comprehensive", // 🔥 新增：標記使用 couple payment API
						};
					}
				} else if (
					reportChoice === "3" ||
					reportChoice.includes("居家") ||
					reportChoice.includes("佈局") ||
					reportChoice.includes("第三")
				) {
					// 選擇3：居家佈局報告
					userIntent.reportType = "home_layout";
					userIntent.conversationState = "collecting_payment_info";
					shouldTriggerModal = true;

					response = `🏠 很棒的選擇！居家佈局對運勢提升非常重要。

我將為你客製化一份居家風水佈局方案，包含：
🎨 空間配色建議
📐 家具擺放指導  
🌿 植物擺設方案
💎 招財開運佈局

請填寫個人資料，我們開始製作你的專屬佈局方案～`;

					analysis = {
						isWithinScope: true,
						detectedTopic: "居家佈局",
						specificProblem: "用戶選擇居家佈局報告",
						confidence: 0.95,
						reportChoice: true,
						paymentType: "premium", // 🔥 新增：標記使用 premium payment API (payment2)
					};
				}

				// 直接返回結果，不進行其他處理
				return NextResponse.json({
					response: cleanMarkdownFormatting(response),
					aiAnalysis: analysis,
					conversationState: userIntent.conversationState,
					systemType: "smart-chat2",
					timestamp: new Date().toISOString(),
					concern:
						userIntent?.primaryConcern || analysis?.detectedTopic,
					emotion: "hopeful",
					shouldTriggerModal: shouldTriggerModal,
					paymentType: analysis?.paymentType, // 🔥 新增：傳遞付款類型
					reportUrl: null,
					needsBirthday: false,
					specificQuestion: analysis?.specificProblem,
					// 🔥 添加 specificProblem 到早期返回回應中
					specificProblem:
						analysis?.specificProblem ||
						userIntent?.specificQuestion ||
						message,
					relationshipAnalysisType:
						userIntent?.relationshipAnalysisType,
					isCoupleAnalysis:
						userIntent?.relationshipAnalysisType === "couple",
				});
			}

			// 🔧 優先檢查核心主題切換 - 在enhanced analyzer之前
			const coreTopics = [
				"感情",
				"財運",
				"工作",
				"健康",
				"子女",
				"風水佈局",
				"居家佈局",
			];

			// 首先嘗試直接關鍵詞匹配（更可靠）
			let detectedTopic = null;
			const topicKeywords = {
				感情: [
					"感情",
					"愛情",
					"戀愛",
					"桃花",
					"分手",
					"復合",
					"婚姻",
					"單身",
				],
				工作: [
					"工作",
					"事業",
					"職場",
					"升職",
					"跳槽",
					"生意",
					"經營",
					"創業",
				],
				財運: ["財運", "財富", "賺錢", "投資", "理財", "收入", "金錢"],
				健康: [
					"健康",
					"身體",
					"疾病",
					"養生",
					"調理",
					"癌症",
					"病",
					"生病",
					"手術",
					"醫生",
					"醫院",
					"治療",
				],
			};

			// 直接關鍵詞檢測
			for (const [topic, keywords] of Object.entries(topicKeywords)) {
				if (keywords.some((keyword) => message.includes(keyword))) {
					detectedTopic = topic;
					console.log(
						"🎯 在報告選擇狀態下直接檢測到主題切換:",
						detectedTopic
					);
					break;
				}
			}

			// 如果檢測到核心主題，執行切換
			if (detectedTopic && coreTopics.includes(detectedTopic)) {
				console.log(
					"🔄 在報告選擇狀態下執行核心主題切換:",
					detectedTopic
				);

				// 🔧 無論是關鍵詞還是AI檢測到的主題，都使用AI分析獲取具體問題
				let specificProblem = `${detectedTopic}分析`;
				let confidence = 1.0;
				let analysisType = "topic_switch";
				let aiResponse = "";

				try {
					console.log("🤖 使用AI分析獲取具體問題描述");
					const classifier = new AITopicClassifier(locale);
					const aiAnalysis = await classifier.analyzeMessage(
						message,
						sessionId
					);

					if (aiAnalysis && aiAnalysis.specificProblem) {
						specificProblem = aiAnalysis.specificProblem;
						confidence = aiAnalysis.confidence || 0.9;
						analysisType = "keyword_topic_with_ai_problem";
						aiResponse = aiAnalysis.aiResponse || "";
						console.log(
							"✅ AI分析獲取到具體問題:",
							specificProblem
						);
					} else {
						console.log("⚠️ AI分析未獲取到具體問題，使用默認描述");
					}
				} catch (error) {
					console.error("❌ AI分析具體問題失敗:", error);
				}

				// 組合AI回應和主題切換訊息
				let combinedResponse = "";

				// 🌸 感情主題特殊處理 - 需要先選擇個人分析或合婚分析
				if (detectedTopic === "感情") {
					if (aiResponse && aiResponse.trim()) {
						combinedResponse = `${aiResponse}\n\n💫 已為你切換到感情分析！\n\n為了提供最適合的分析，請選擇：\n\n1️⃣ 個人感情分析\n- 分析你的桃花運勢和感情特質\n- 提供感情運勢建議和風水調整\n- 適合單身或想了解個人感情運的朋友\n\n2️⃣ 合婚配對分析\n- 分析你和伴侶的八字契合度\n- 提供雙方感情走向和發展建議\n- 適合想了解感情配對度的情侶\n\n你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
					} else {
						combinedResponse = `💫 已為你切換到感情分析！\n\n為了提供最適合的分析，請選擇：\n\n1️⃣ 個人感情分析\n- 分析你的桃花運勢和感情特質\n- 提供感情運勢建議和風水調整\n- 適合單身或想了解個人感情運的朋友\n\n2️⃣ 合婚配對分析\n- 分析你和伴侶的八字契合度\n- 提供雙方感情走向和發展建議\n- 適合想了解感情配對度的情侶\n\n你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
					}
				} else {
					// 🎂 其他主題 - 檢查是否有已保存的生日
					const birthdayCheck =
						await checkSavedBirthdayAndGenerateMessage(
							userEmail,
							userId,
							detectedTopic
						);

					if (aiResponse && aiResponse.trim()) {
						combinedResponse = `${aiResponse}\n\n💫 已為你切換到${detectedTopic}分析！\n\n${birthdayCheck.message}`;
					} else {
						combinedResponse = `💫 已為你切換到${detectedTopic}分析！\n\n${birthdayCheck.message}`;
					}
					
					// 🔧 如果找到已保存的生日，設置狀態為等待選擇
					if (birthdayCheck.hasSavedBirthday) {
						userIntent.conversationState = "awaiting_birthday_choice";
					}
				} // 重置會話狀態並更新主要關注點
				// 🔧 映射 detectedTopic 到有效的 primaryConcern 值 (防止無效枚舉值)
				const topicMappingLocal = {
					命理: "其他",
					命理分析: "其他",
					八字: "其他",
					紫微斗數: "其他",
					占卜: "其他",
					運勢: "其他",
				};
				const mappedDetectedTopic =
					topicMappingLocal[detectedTopic] || detectedTopic;

				userIntent.primaryConcern = mappedDetectedTopic;
				// 🌸 感情主題需要先選擇分析類型
				if (detectedTopic === "感情") {
					userIntent.conversationState = "asking_relationship_type";
				} else {
					userIntent.conversationState = "birthday_collection";
				}
				userIntent.reportType = null;
				// 🔧 更新具體問題為新主題的問題，避免使用舊主題的問題
				userIntent.originalSpecificProblem = specificProblem;
				userIntent.specificQuestion = specificProblem; // 更新資料庫狀態
				await userIntent.save();

				// 🔢 獲取用戶當前分析額度信息
				let rateLimitInfo = null;
				try {
					const userStats = await DailyAnalysisRateLimit.getUserStats(
						userEmail,
						userId
					);
					rateLimitInfo = {
						current: userStats.analysisCount || 0,
						limit: 10,
						remaining: userStats.remaining || 10,
					};
				} catch (error) {
					console.log("⚠️ 獲取用戶分析額度信息失敗:", error);
					// 🔧 即使獲取失敗，也顯示預設額度
					rateLimitInfo = {
						current: 0,
						limit: 10,
						remaining: 10,
					};
				}

				// 🎯 添加額度信息到回應訊息
				const quotaMessage = rateLimitInfo
					? `\n\n📊 今日分析額度: 你每日可進行 ${rateLimitInfo.limit} 次初步分析，目前還剩 ${rateLimitInfo.remaining} 次機會哦～`
					: "";

				return NextResponse.json({
					response: cleanMarkdownFormatting(
						combinedResponse + quotaMessage
					),
					conversationState:
						detectedTopic === "感情"
							? "asking_relationship_type"
							: "birthday_collection",
					systemType: "smart-chat2",
					timestamp: new Date().toISOString(),
					concern: detectedTopic,
					needsBirthday: detectedTopic !== "感情", // 感情主題先不要birthday，先選擇類型
					specificQuestion: specificProblem,
					aiAnalysis: {
						detectedTopic: detectedTopic,
						isWithinScope: true,
						confidence: confidence,
						analysisType: analysisType,
						specificProblem: specificProblem,
						rateLimitInfo: rateLimitInfo,
					},
				});
			}

			// 🔧 如果關鍵詞匹配失敗，使用AI分析檢測是否為主題切換
			if (!detectedTopic) {
				console.log("🤖 關鍵詞匹配失敗，使用AI分析檢測主題切換");
				try {
					const classifier = new AITopicClassifier(locale);
					const aiTopicAnalysis = await classifier.analyzeMessage(
						message,
						sessionId
					);

					if (
						aiTopicAnalysis &&
						aiTopicAnalysis.isWithinScope &&
						aiTopicAnalysis.detectedTopic &&
						aiTopicAnalysis.detectedTopic !== "其他" &&
						coreTopics.includes(aiTopicAnalysis.detectedTopic)
					) {
						console.log(
							"🎯 AI檢測到核心主題切換:",
							aiTopicAnalysis.detectedTopic
						);

						// 組合AI回應和主題切換訊息
						let combinedResponse = "";

						// 🌸 感情主題特殊處理 - 需要先選擇個人分析或合婚分析
						if (aiTopicAnalysis.detectedTopic === "感情") {
							if (
								aiTopicAnalysis.aiResponse &&
								aiTopicAnalysis.aiResponse.trim()
							) {
								combinedResponse = `${aiTopicAnalysis.aiResponse}\n\n💫 已為你切換到感情分析！\n\n為了提供最適合的分析，請選擇：\n\n1️⃣ 個人感情分析\n- 分析你的桃花運勢和感情特質\n- 提供感情運勢建議和風水調整\n- 適合單身或想了解個人感情運的朋友\n\n2️⃣ 合婚配對分析\n- 分析你和伴侶的八字契合度\n- 提供雙方感情走向和發展建議\n- 適合想了解感情配對度的情侶\n\n你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
							} else {
								combinedResponse = `💫 已為你切換到感情分析！\n\n為了提供最適合的分析，請選擇：\n\n1️⃣ 個人感情分析\n- 分析你的桃花運勢和感情特質\n- 提供感情運勢建議和風水調整\n- 適合單身或想了解個人感情運的朋友\n\n2️⃣ 合婚配對分析\n- 分析你和伴侶的八字契合度\n- 提供雙方感情走向和發展建議\n- 適合想了解感情配對度的情侶\n\n你想要哪種分析呢？回覆「個人分析」或「合婚分析」即可～`;
							}
						} else {
							// 🎂 其他主題 - 檢查是否有已保存的生日
							const birthdayCheck =
								await checkSavedBirthdayAndGenerateMessage(
									userEmail,
									userId,
									aiTopicAnalysis.detectedTopic,
									aiTopicAnalysis.aiResponse // 🎯 傳入 AI 分析內容
								);

							if (
								aiTopicAnalysis.aiResponse &&
								aiTopicAnalysis.aiResponse.trim()
							) {
								// 如果有已保存的生日，birthdayCheck.message 已經包含了 AI 分析
								// 如果沒有已保存的生日，需要手動組合
								if (birthdayCheck.hasSavedBirthday) {
									combinedResponse = `💫 已為你切換到${aiTopicAnalysis.detectedTopic}分析！\n\n${birthdayCheck.message}`;
								} else {
									combinedResponse = `${aiTopicAnalysis.aiResponse}\n\n💫 已為你切換到${aiTopicAnalysis.detectedTopic}分析！\n\n${birthdayCheck.message}`;
								}
							} else {
								combinedResponse = `💫 已為你切換到${aiTopicAnalysis.detectedTopic}分析！\n\n${birthdayCheck.message}`;
							}
							
							// 🔧 如果找到已保存的生日，設置狀態為等待選擇
							if (birthdayCheck.hasSavedBirthday) {
								userIntent.conversationState = "awaiting_birthday_choice";
							}
						}

						// 重置會話狀態並更新主要關注點
						userIntent.primaryConcern =
							aiTopicAnalysis.detectedTopic;
						// 🌸 感情主題需要先選擇分析類型
						if (aiTopicAnalysis.detectedTopic === "感情") {
							userIntent.conversationState =
								"asking_relationship_type";
						} else {
							userIntent.conversationState =
								"birthday_collection";
						}
						userIntent.reportType = null;
						// 🔧 更新具體問題為新主題的問題，避免使用舊主題的問題
						userIntent.originalSpecificProblem =
							aiTopicAnalysis.specificProblem;
						userIntent.specificQuestion =
							aiTopicAnalysis.specificProblem; // 更新資料庫狀態
						await userIntent.save();

						// 🔢 獲取用戶當前分析額度信息
						let rateLimitInfo = null;
						try {
							const userStats =
								await DailyAnalysisRateLimit.getUserStats(
									userEmail,
									userId
								);
							rateLimitInfo = {
								current: userStats.analysisCount || 0,
								limit: 10,
								remaining: userStats.remaining || 10,
							};
						} catch (error) {
							console.log("⚠️ 獲取用戶分析額度信息失敗:", error);
							// 🔧 即使獲取失敗，也顯示預設額度
							rateLimitInfo = {
								current: 0,
								limit: 10,
								remaining: 10,
							};
						}

						// 🎯 添加額度信息到回應訊息
						const quotaMessage = rateLimitInfo
							? `\n\n📊 今日分析額度: 你每日可進行 ${rateLimitInfo.limit} 次初步分析，目前還剩 ${rateLimitInfo.remaining} 次機會哦～`
							: "";

						return NextResponse.json({
							response: cleanMarkdownFormatting(
								combinedResponse + quotaMessage
							),
							conversationState:
								aiTopicAnalysis.detectedTopic === "感情"
									? "asking_relationship_type"
									: "birthday_collection",
							systemType: "smart-chat2",
							timestamp: new Date().toISOString(),
							concern: aiTopicAnalysis.detectedTopic,
							needsBirthday:
								aiTopicAnalysis.detectedTopic !== "感情", // 感情主題先不要birthday，先選擇類型
							specificQuestion:
								aiTopicAnalysis.specificProblem ||
								`${aiTopicAnalysis.detectedTopic}分析`,
							aiAnalysis: {
								detectedTopic: aiTopicAnalysis.detectedTopic,
								isWithinScope: true,
								confidence: aiTopicAnalysis.confidence || 0.9,
								analysisType: "ai_topic_switch",
								specificProblem:
									aiTopicAnalysis.specificProblem,
								rateLimitInfo: rateLimitInfo,
							},
						});
					}
				} catch (error) {
					console.error("❌ AI主題切換檢測失敗:", error);
				}
			}

			// 🔧 如果不是核心主題切換，才使用enhanced analyzer
			try {
				const EnhancedMessageAnalyzer = require("../../../lib/enhancedMessageAnalyzer.js");
				const enhancedAnalyzer = new EnhancedMessageAnalyzer();
				const enhancedResult =
					await enhancedAnalyzer.analyzeMessage(message);

				if (
					enhancedResult.isEnhanced &&
					enhancedResult.analysisType === "greeting"
				) {
					console.log(
						"🧠 在報告選擇狀態下檢測到問候語，提供友善回應"
					);

					return NextResponse.json({
						response: cleanMarkdownFormatting(
							enhancedResult.response
						),
						aiAnalysis: enhancedResult,
						conversationState: "asking_detailed_report",
						systemType: "smart-chat2",
						timestamp: new Date().toISOString(),
						concern: userIntent?.primaryConcern || "一般",
						emotion: "positive",
						shouldTriggerModal: false,
						reportUrl: null,
						needsBirthday: false,
						specificQuestion: "問候語",
						isCoupleAnalysis: false,
					});
				}

				// 🔧 新增：檢查是否為服務諮詢，優先處理
				if (
					enhancedResult.isEnhanced &&
					enhancedResult.analysisType === "service_explanation"
				) {
					console.log(
						"🧠 在報告選擇狀態下檢測到服務諮詢，提供服務說明"
					);

					return NextResponse.json({
						response: cleanMarkdownFormatting(
							enhancedResult.response
						),
						aiAnalysis: enhancedResult,
						conversationState: userIntent.conversationState,
						systemType: "smart-chat2",
						timestamp: new Date().toISOString(),
						concern: userIntent?.primaryConcern || "服務諮詢",
						emotion: "positive",
						shouldTriggerModal: false,
						reportUrl: null,
						needsBirthday: false,
						specificQuestion: "服務諮詢",
						isCoupleAnalysis: false,
					});
				}

				// 🔧 新增：檢查是否為非風水命理話題，提供動態AI回應
				if (
					enhancedResult.requiresAIAnalysis ||
					(!enhancedResult.isEnhanced &&
						enhancedResult.analysisType === "general_ai")
				) {
					console.log(
						"🧠 在報告選擇狀態下檢測到非核心話題，使用AI分析"
					);

					// 使用 AI Topic Classifier 進行分析
					const classifier = new AITopicClassifier(locale);
					let topicAnalysis = await classifier.analyzeMessage(
						message,
						sessionId
					);

					// 如果 AI 分析失敗，使用 fallback
					if (!topicAnalysis || !topicAnalysis.detectedTopic) {
						topicAnalysis = classifier.getFallbackAnalysis(message);
					}

					// 如果檢測到非核心話題，提供動態回應
					if (
						!topicAnalysis.isWithinScope ||
						topicAnalysis.detectedTopic === "其他"
					) {
						console.log(
							"✅ 在報告選擇狀態下檢測到其他話題，提供AI動態回應"
						);

						const aiResponse =
							await classifier.generateOutOfScopeResponse(
								topicAnalysis,
								message
							);

						return NextResponse.json({
							response: cleanMarkdownFormatting(aiResponse),
							aiAnalysis: topicAnalysis,
							conversationState: userIntent.conversationState,
							systemType: "smart-chat2",
							timestamp: new Date().toISOString(),
							concern: userIntent?.primaryConcern || "其他",
							emotion: "neutral",
							shouldTriggerModal: false,
							reportUrl: null,
							needsBirthday: false,
							specificQuestion: message,
							isCoupleAnalysis: false,
						});
					}
				}

				if (
					enhancedResult.isEnhanced &&
					enhancedResult.analysisType === "knowledge_explanation"
				) {
					console.log("🧠 在報告選擇狀態下檢測到知識詢問，優先處理");

					// 生成AI回應
					const classifier = new AITopicClassifier(locale);
					const knowledgePrompt = `用戶詢問：${message}

請作為專業的風水命理老師，用不超過200字簡潔專業地解釋這個概念。要求：
1. 解釋清楚易懂
2. 突出實際應用價值  
3. 保持專業權威性
4. 語氣親切自然
5. 最後可以提及如果想了解個人狀況可以提供生日做分析

請直接給出解釋，不要說"我來解釋"之類的開場白。`;

					response = await classifier.callDeepSeekAPI([
						{
							role: "system",
							content:
								"你是專業的風水命理顧問風鈴，擅長用簡潔易懂的方式解釋傳統概念。\n\n⚠️ 重要指示：\n1. ${languageInstruction}\n2. 所有日期和月份都必須嚴格使用西曆（公曆），如1月、2月、3月等\n3. 🚫 絕對禁止使用農曆、陰曆用詞，如「農曆十月」「陰曆八月」等\n4. ✅ 正確示例：「10月出生者」「十月份」「8月生人」\n5. ❌ 錯誤示例：「農曆十月出生者」「陰曆八月」\n6. 當前是2025年10月19日，請確保分析基於2025年，不可提及2024年\n7. 用戶提供的生日是西曆日期，請據此分析\n8. 不要在回應中包含字數統計標記\n9. 保持專業且親切的語氣",
						},
						{
							role: "user",
							content: knowledgePrompt,
						},
					]);

					// 🔧 提取AI回應內容
					if (
						response &&
						response.choices &&
						response.choices[0] &&
						response.choices[0].message
					) {
						response = response.choices[0].message.content;
					}

					analysis = enhancedResult;
				} else if (
					enhancedResult.isEnhanced &&
					enhancedResult.detectedTopic === "其他"
				) {
					console.log(
						"🔧 在報告選擇狀態下檢測到其他話題，重置狀態並處理"
					);
					// 重置會話狀態，讓其他話題能夠正常處理
					userIntent.conversationState = "ai_analyzing";
					throw new Error("Reset state for other topics");
				} else if (
					enhancedResult.isEnhanced &&
					enhancedResult.analysisType === "emotional_support"
				) {
					console.log(
						"💙 在報告選擇狀態下檢測到情緒危機，優先提供支持"
					);
					response = enhancedResult.response;
					analysis = enhancedResult;
				} else {
					// 不是知識詢問，繼續處理報告選擇
					throw new Error(
						"Not a knowledge query, continue with report choice"
					);
				}
			} catch (enhanceError) {
				// 🔧 處理詳細報告選擇 (1, 2, 3)
				const reportChoice = message.trim();

				if (
					reportChoice === "1" ||
					reportChoice.includes("詳細報告") ||
					reportChoice.includes("第一")
				) {
					// 選擇1：關注領域詳細報告 - 使用 handleFortunePayment 邏輯
					userIntent.reportType = "detailed_concern";

					const concernName = userIntent.primaryConcern || "運勢";

					// 🔧 檢查是否為合婚分析，需要特殊處理
					if (
						userIntent.relationshipAnalysisType === "couple" &&
						userIntent.primaryConcern === "感情"
					) {
						// 合婚分析需要兩個生日
						if (
							userIntent.userBirthday &&
							userIntent.partnerBirthday
						) {
							shouldTriggerModal = true;
							userIntent.conversationState =
								"collecting_payment_info";
							console.log(
								"✅ 合婚分析 - 用戶同意詳細報告，已有兩個生日，觸發模態框"
							);
						} else {
							// 缺少生日資料，需要重新收集
							userIntent.conversationState =
								"birthday_collection";
							response = `💕 好的！為了進行準確的合婚分析，我需要你們雙方的生日資料。
                        
請先提供你的生日（年月日），例如：1995年3月15日

💡 小貼士：你也可以一次提供雙方生日，例如：「我1995/3/15，她1996/8/20」`;
							console.log("⚠️ 合婚分析 - 缺少生日資料，重新收集");
						}
					} else {
						// 個人分析或其他分析
						shouldTriggerModal = true;
						userIntent.conversationState =
							"collecting_payment_info";
					}

					if (shouldTriggerModal) {
						response = `✨ 太好了！我將為你生成一份專業的${concernName}詳細報告。

這份報告將包含：
🎯 深度${concernName}分析
📈 具體改善建議  
🔮 時機把握指導
🏠 相關風水調整

正在準備你的專屬報告...`;
					}

					analysis = {
						isWithinScope: true,
						detectedTopic: concernName,
						// 🔧 FIX: 使用原始詳細問題而不是通用描述
						specificProblem:
							userIntent.originalSpecificProblem ||
							`用戶選擇詳細${concernName}報告`,
						confidence: 0.95,
						reportChoice: true,
						paymentType:
							userIntent.relationshipAnalysisType === "couple"
								? "couple"
								: "fortune", // 🔥 新增：合婚使用couple，個人使用fortune API
					};
				} else if (
					reportChoice === "2" ||
					reportChoice.includes("綜合") ||
					reportChoice.includes("命理") ||
					reportChoice.includes("第二")
				) {
					// 選擇2：綜合命理報告 - 使用 $88 couple payment API
					userIntent.reportType = "comprehensive";
					userIntent.conversationState = "collecting_payment_info";

					response = `🌟 極佳的選擇！綜合命理報告是最全面的分析。

這份完整報告將包含：
📊 八字命盤全解析
🔮 各領域運勢預測
💫 流年大運走勢
🎯 人生重要時機
🏠 全方位風水建議

請填寫個人資料，讓我為你打造專屬的命理藍圖～`;

					shouldTriggerModal = true;
					analysis = {
						isWithinScope: true,
						detectedTopic: "綜合命理",
						specificProblem: "用戶選擇綜合命理報告",
						confidence: 0.95,
						reportChoice: true,
						paymentType: "comprehensive", // 🔥 新增：標記使用 couple payment API
					};
				} else if (
					reportChoice === "3" ||
					reportChoice.includes("居家") ||
					reportChoice.includes("佈局") ||
					reportChoice.includes("第三")
				) {
					// 選擇3：居家佈局報告
					userIntent.reportType = "home_layout";
					userIntent.conversationState = "collecting_payment_info";

					response = `🏠 很棒的選擇！居家佈局對運勢提升非常重要。

我將為你客製化一份居家風水佈局方案，包含：
🎨 空間配色建議
📐 家具擺放指導  
🌿 植物擺設方案
💎 招財開運佈局

請填寫個人資料，我們開始製作你的專屬佈局方案～`;

					shouldTriggerModal = true;
					analysis = {
						isWithinScope: true,
						detectedTopic: "居家佈局",
						specificProblem: "用戶選擇居家佈局報告",
						confidence: 0.95,
						reportChoice: true,
						paymentType: "premium", // 🔥 新增：標記使用 premium payment API (payment2)
					};
				} else {
					// 無效選擇，重新提示
					const concernName = userIntent.primaryConcern || "運勢";
					response = `請選擇你想要的分析類型：

1️⃣ 一份關於${concernName}的詳細報告 價值$88，限時優惠$38
- 深入分析你的${concernName}運勢，提供具體建議和改善方案

2️⃣ 一份綜合命理報告 價值$168，限時優惠$88  
- 全面的八字命盤分析，包含各方面運勢預測

請回覆「1」或「2」～`;

					analysis = {
						isWithinScope: true,
						detectedTopic: userIntent.primaryConcern,
						specificProblem: "用戶需要重新選擇報告類型",
						confidence: 0.8,
						choiceResponse: true,
					};
				}
			} // 關閉 catch (enhanceError) 塊
		} else if (userIntent?.conversationState === "bazi_topic_selection") {
			// 🔮 處理八字主題選擇狀態
			console.log("🔮 用戶在八字主題選擇狀態，分析主題選擇:", message);

			const classifier = new AITopicClassifier(locale);
			const topicAnalysis = await classifier.analyzeMessage(
				message,
				sessionId
			);

			if (
				topicAnalysis &&
				topicAnalysis.isWithinScope &&
				topicAnalysis.detectedTopic &&
				topicAnalysis.detectedTopic !== "其他"
			) {
				console.log(
					`🎯 用戶選擇${topicAnalysis.detectedTopic}主題，生成詳細八字分析`
				);

				// 從會話歷史中獲取之前的八字數據
				const previousBaziMessage =
					await getLastBaziFromSession(sessionId);

				if (previousBaziMessage) {
					const detailedAnalysis =
						await classifier.generateBaziDetailedAnalysis(
							previousBaziMessage,
							topicAnalysis.detectedTopic,
							topicAnalysis.specificProblem,
							message
						);

					// 重置對話狀態
					userIntent.conversationState = "completed";
					await userIntent.save();

					return NextResponse.json({
						response: cleanMarkdownFormatting(detailedAnalysis),
						aiAnalysis: {
							isWithinScope: true,
							detectedTopic: topicAnalysis.detectedTopic,
							specificProblem: topicAnalysis.specificProblem,
							analysisType: "bazi_topic_analysis",
							confidence: 0.9,
						},
						conversationState: "completed",
						systemType: "smart-chat2",
						timestamp: new Date().toISOString(),
						concern: topicAnalysis.detectedTopic,
						emotion: "positive",
						shouldTriggerModal: false,
						reportUrl: null,
						needsBirthday: false,
						specificQuestion: topicAnalysis.specificProblem,
						isCoupleAnalysis: false,
					});
				} else {
					// 找不到之前的八字數據，重新請求
					response = `🔮 抱歉，我需要你重新提供八字資料才能為你分析${topicAnalysis.detectedTopic}呢！

請按照格式提供你的八字：
例如：丙子,甲午,丙申,戊子,測${topicAnalysis.detectedTopic}

這樣我就能為你做詳細的${topicAnalysis.detectedTopic}分析啦～✨`;

					userIntent.conversationState = "asking_bazi_reentry";
					await userIntent.save();
				}
			} else {
				// 無法識別主題，提供引導
				response = `🔮 我沒有完全理解你想了解的主題呢～

請直接告訴我你想了解的領域，例如：
• 我想了解感情
• 幫我看工作運
• 分析財運
• 看看健康
• 子女運勢

這樣我就能為你做精準的八字分析啦！✨`;
			}

			// 更新 UserIntent
			await userIntent.save();

			return NextResponse.json({
				response: cleanMarkdownFormatting(response),
				aiAnalysis: topicAnalysis || {
					isWithinScope: false,
					detectedTopic: "其他",
					specificProblem: "主題選擇",
				},
				conversationState: userIntent.conversationState,
				systemType: "smart-chat2",
				timestamp: new Date().toISOString(),
				concern: "其他",
				emotion: "positive",
				shouldTriggerModal: false,
				reportUrl: null,
				needsBirthday: false,
				specificQuestion: "八字主題選擇",
				isCoupleAnalysis: false,
			});
		} else {
			// � 優先檢測八字+主題組合分析 (新增功能)
			const classifier = new AITopicClassifier(locale);
			const baziTopicResult =
				await classifier.detectBaziWithTopicAnalysis(
					message,
					sessionId
				);

			if (baziTopicResult) {
				console.log(
					"🔮 檢測到八字分析需求:",
					baziTopicResult.analysisType
				);

				if (baziTopicResult.analysisType === "bazi_topic_analysis") {
					// 八字+主題組合，提供詳細分析
					console.log(
						`🎯 提供${baziTopicResult.detectedTopic}的詳細八字分析`
					);

					return NextResponse.json({
						response: cleanMarkdownFormatting(
							baziTopicResult.response
						),
						aiAnalysis: {
							isWithinScope: true,
							detectedTopic: baziTopicResult.detectedTopic,
							specificProblem: baziTopicResult.specificProblem,
							analysisType: "bazi_topic_analysis",
							confidence: 0.9,
						},
						conversationState: "completed",
						systemType: "smart-chat2",
						timestamp: new Date().toISOString(),
						concern: baziTopicResult.detectedTopic,
						emotion: "positive",
						shouldTriggerModal: false,
						reportUrl: null,
						needsBirthday: false,
						specificQuestion: baziTopicResult.specificProblem,
						isCoupleAnalysis: false,
					});
				} else if (baziTopicResult.analysisType === "bazi_only") {
					// 純八字輸入，提供服務選單
					console.log("🔮 純八字輸入，生成服務選單回應");

					const serviceMenuResponse = `🔮 風鈴看到你的八字了：${baziTopicResult.baziString}

我可以為你分析以下任何一個領域：

🌸 **感情運勢** - 桃花運、合婚配對、感情發展
💼 **事業工作** - 職場運勢、升職機會、事業發展  
💰 **財運分析** - 投資理財、收入提升、財運走向
🌿 **健康運勢** - 身心調理、健康狀況、養生建議

你想了解哪個方面呢？直接告訴我「我想了解感情」或「幫我看工作」即可～✨`;

					return NextResponse.json({
						response: cleanMarkdownFormatting(serviceMenuResponse),
						aiAnalysis: {
							isWithinScope: true,
							detectedTopic: "其他",
							specificProblem: "八字輸入",
							analysisType: "bazi_service_menu",
							confidence: 0.9,
						},
						conversationState: "bazi_topic_selection",
						systemType: "smart-chat2",
						timestamp: new Date().toISOString(),
						concern: "其他",
						emotion: "positive",
						shouldTriggerModal: false,
						reportUrl: null,
						needsBirthday: false,
						specificQuestion: "八字分析服務選擇",
						isCoupleAnalysis: false,
					});
				}
			}

			// �🚀 使用增強版分析器 - 支持八字、情境、知識問答等
			let enhancedResult = null; // 🔧 定義 enhancedResult 變量
			try {
				const EnhancedMessageAnalyzer = require("../../../lib/enhancedMessageAnalyzer.js");
				const enhancedAnalyzer = new EnhancedMessageAnalyzer();
				enhancedResult = await enhancedAnalyzer.analyzeMessage(message);

				if (enhancedResult.isEnhanced) {
					// 🎯 優先處理問候語
					if (enhancedResult.analysisType === "greeting") {
						console.log("✅ 檢測到問候語，提供友善回應");

						// 🔢 獲取用戶當前分析額度信息
						let rateLimitInfo = null;
						try {
							const userStats =
								await DailyAnalysisRateLimit.getUserStats(
									userEmail,
									userId
								);
							rateLimitInfo = {
								current: userStats.analysisCount || 0,
								limit: 10,
								remaining: userStats.remaining || 10,
							};
						} catch (error) {
							console.log("⚠️ 獲取用戶分析額度信息失敗:", error);
						}

						// 將 rate limit 信息添加到 enhancedResult
						const enhancedResultWithRateLimit = {
							...enhancedResult,
							rateLimitInfo: rateLimitInfo,
						};

						return NextResponse.json({
							response: cleanMarkdownFormatting(
								enhancedResult.response
							),
							aiAnalysis: enhancedResultWithRateLimit,
							conversationState: "ai_analyzing",
							systemType: "smart-chat2",
							timestamp: new Date().toISOString(),
							concern: "一般",
							emotion: "positive",
							shouldTriggerModal: false,
							reportUrl: null,
							needsBirthday: false,
							specificQuestion: "問候語",
							isCoupleAnalysis: false,
						});
					}

					// 使用增強分析結果 + 自然對話生成
					console.log("✅ 使用增強版分析結果");
					analysis = enhancedResult;

					// 🔧 確保主題映射到有效的數據庫enum值
					if (analysis.detectedTopic) {
						const analyzer = new EnhancedMessageAnalyzer();
						analysis.detectedTopic = analyzer.mapTopicToValidEnum(
							analysis.detectedTopic
						);
					}

					// 🎭 使用內建的自然對話優化
					if (enhancedResult.analysisType === "contextual") {
						// 為情境分析添加更人性化的語言
						response = enhanceContextualResponse(
							enhancedResult,
							userIntent,
							message
						);
					} else if (enhancedResult.analysisType === "bazi_direct") {
						// 八字分析已經很好，保持原樣
						response = enhancedResult.response;
					} else if (
						enhancedResult.analysisType === "bazi_analysis" &&
						enhancedResult.requiresAIAnalysis
					) {
						// 新的八字分析，需要AI處理
						console.log("🔮 八字分析需要 AI 處理");
						const classifier = new AITopicClassifier(locale);

						// 為八字分析生成專門的AI回應
						const baziPrompt = `用戶提供八字：${message}

請以風鈴的身份，用可愛親切的語氣為用戶分析八字。八字資料：
- 八字：${enhancedResult.baziData?.baziString || ""}
- 主要分析領域：${enhancedResult.specificProblem || "八字分析"}

請按照以下格式生成回應：

🔮 風鈴看了你的八字，發現你有很特別的${enhancedResult.detectedTopic || "運勢"}潛質呢！✨

**1. 命盤速讀**
八字：${enhancedResult.baziData?.baziString || ""}
五行屬性：[分析五行屬性]
[主要分析領域]宮主星：[對應主星]
   - 關鍵格局：
     [身強弱分析]
     用神：[用神分析]
     大運節點：[當前大運分析]

💖 哈囉親愛的[五行]命寶寶！風鈴來幫你分析${enhancedResult.detectedTopic || "運勢"}啦～根據你的五行特質，[年份]年會是[運勢特點]的一年呢！(´▽\`ʃ♡ƪ)

**2. 年度預警**  
✨成就星：[最佳時機]最旺！適合[具體建議]，記得把握[時間點]的黃金期～  
⚠️小人煞：[注意時期]有[煞星]！要避開[避免事項]，[注意事項]要[具體建議]喔！(๑•̀д•́)

注意：所有月份時間都使用新歷（西曆），例如：1月、2月、3月等，不要使用農歷。

**3. 你的${enhancedResult.detectedTopic || "運勢"}分析**  
最近是不是感覺[觀察描述]呀？(歪頭) 未來3個月會有[預測內容]～記得發揮[命格優勢]的優勢，但[時期]後要[注意事項]唷！(๑¯◡¯๑)

**4. 開運小秘訣**  
🏡居家：在[方位]放[開運物品]（[最佳時機]最招運！）  
👛配件：選[顏色][材質][物品]，裡面放[開運配件]～  
💫行動：每[時間]的[時辰]最利喔！（偷偷說：[具體建議]很適合你）

[五行]命寶寶記得要多用[幸運顏色]系物品增強運氣呢～風鈴祝你[祝福語]！٩(◕‿◕)۶

───────────────────
💎 **想要更深入的分析嗎？**
**1️⃣ 详细报告** 價值$88，限時優惠$38
**2️⃣ 综合命理报告** 價值$168，限時優惠$88  

要求：
1. 保持風鈴可愛親切的語氣
2. 使用表情符號和可愛的語助詞
3. 提供具體實用的建議
4. 約400-500字
5. 重點分析用戶關注的領域（${enhancedResult.detectedTopic || "整體運勢"}）
6. 所有日期和月份都必須使用新歷（西曆/公曆），例如1月、2月、3月等，不要使用農歷`;

						try {
							const aiResponse = await classifier.callDeepSeekAPI(
								[
									{
										role: "system",
										content:
											"你是專業的風水命理顧問風鈴，擅長八字分析和運勢預測。\n\n⚠️ 重要指示：\n1. ${languageInstruction}\n2. 所有日期和月份都必須嚴格使用西曆（公曆），如1月、2月、3月等\n3. 🚫 絕對禁止使用農曆、陰曆用詞，如「農曆十月」「陰曆八月」等\n4. ✅ 正確示例：「10月出生者」「十月份」「8月生人」\n5. ❌ 錯誤示例：「農曆十月出生者」「陰曆八月」\n6. 當前是2025年10月19日，請確保分析基於2025年，不可提及2024年\n7. 用戶提供的生日是西曆日期，請據此分析\n8. 不要在回應中包含字數統計標記\n9. 保持專業且親切的語氣",
									},
									{
										role: "user",
										content: baziPrompt,
									},
								]
							);

							// 🔧 提取AI回應內容
							if (
								aiResponse &&
								aiResponse.choices &&
								aiResponse.choices[0] &&
								aiResponse.choices[0].message
							) {
								response =
									aiResponse.choices[0].message.content;
							} else {
								response = aiResponse;
							}
							console.log("✅ 八字 AI 回應生成成功");
						} catch (error) {
							console.error("❌ 八字 AI 回應生成失敗:", error);
							response = `很抱歉，系統暫時無法處理你的八字分析請求。請稍後重試或聯絡客服。`;
						}
					} else if (
						enhancedResult.analysisType === "emotional_support"
					) {
						// 情緒支持回應，直接使用不做修改
						console.log("💙 提供情緒支持回應");
						response = enhancedResult.response;
					} else if (
						enhancedResult.analysisType === "birthday_analysis"
					) {
						// 生日分析回應，使用enhancedResponse
						console.log("🎂 處理生日分析");

						// 🔧 檢查是否有之前請求的服務上下文（如健康運勢分析）
						console.log(
							`🔍 檢查上下文恢復 - sessionId: ${sessionId}`
						);
						const conversationMemory =
							classifier.getConversationMemory(sessionId);
						console.log(`🔍 獲取到的會話記憶:`, conversationMemory);

						if (
							conversationMemory &&
							conversationMemory.requestedService &&
							conversationMemory.detectedTopic
						) {
							console.log(
								`🎯 恢復之前的服務請求: ${conversationMemory.requestedService} -> ${conversationMemory.detectedTopic}`
							);

							// 更新 analysis 對象以包含正確的主題上下文
							analysis.detectedTopic =
								conversationMemory.detectedTopic;
							analysis.specificProblem = `用戶提供生日進行${conversationMemory.detectedTopic}分析，之前請求了${conversationMemory.requestedService}`;

							// 更新 userIntent 以保持一致性
							if (userIntent) {
								userIntent.primaryConcern =
									conversationMemory.detectedTopic;
								userIntent.originalSpecificProblem =
									analysis.specificProblem;
								userIntent.specificQuestion =
									analysis.specificProblem;
							}
						} else {
							console.log(
								`⚠️ 未找到可恢復的上下文 - conversationMemory存在: ${!!conversationMemory}, requestedService: ${conversationMemory?.requestedService}, detectedTopic: ${conversationMemory?.detectedTopic}`
							);
						}

						response = enhancedResult.enhancedResponse;
					} else if (
						enhancedResult.analysisType ===
							"knowledge_explanation" &&
						enhancedResult.requiresAIAnalysis
					) {
						// 知識詢問使用AI分析，不使用硬編碼回應
						console.log("🧠 知識詢問使用 AI 分析");
						const classifier = new AITopicClassifier(locale);

						// 生成專門針對知識詢問的AI回應
						const knowledgePrompt = `用戶詢問：${message}

請作為專業的風水命理老師，用不超過200字簡潔專業地解釋這個概念。要求：
1. 解釋清楚易懂
2. 突出實際應用價值  
3. 保持專業權威性
4. 語氣親切自然
5. 最後可以提及如果想了解個人狀況可以提供生日做分析

請直接給出解釋，不要說"我來解釋"之類的開場白。`;

						response = await classifier.callDeepSeekAPI([
							{
								role: "system",
								content:
									"你是專業的風水命理顧問，擅長用簡潔易懂的方式解釋傳統概念。重要指示：1. ${languageInstruction} 2. 不要在回應中包含字數統計標記 3. 保持專業且親切的語氣",
							},
							{
								role: "user",
								content: knowledgePrompt,
							},
						]);

						// 🔧 提取AI回應內容
						if (
							response &&
							response.choices &&
							response.choices[0] &&
							response.choices[0].message
						) {
							response = response.choices[0].message.content;
						}

						// 保持增強分析的結果但更新響應類型
						analysis = { ...enhancedResult, response: response };
					} else {
						// 其他類型保持原樣，檢查不同的回應字段
						if (enhancedResult.response) {
							response = enhancedResult.response;
						} else if (enhancedResult.enhancedResponse) {
							response = enhancedResult.enhancedResponse;
						} else {
							console.log(
								"⚠️ 增強結果沒有response或enhancedResponse字段"
							);
							response = "抱歉，我正在處理你的請求，請稍候。";
						}
					}
					console.log("🎭 已應用自然對話優化");
				} else {
					// 使用 AI 分析進行精準的話題檢測和問題理解
					console.log("⚡ 使用 AI 分析進行話題檢測");
					const classifier = new AITopicClassifier(locale);
					analysis = await classifier.analyzeMessage(
						message,
						sessionId
					);

					// 如果 AI 分析失敗，才使用關鍵詞匹配作為後備
					if (!analysis || !analysis.isWithinScope) {
						console.log("⚡ AI 分析失敗，使用關鍵詞匹配後備");
						analysis = classifier.getFallbackAnalysis(message);
					}

					// 🎂 先生成標準的服務引導回應（包含 AI 分析）
					const standardResponse =
						await classifier.generateServiceGuidance(
							analysis,
							message,
							sessionId
						);

					// 🎂 然後檢查是否有已保存的生日
					let birthdayCheckResult = null;
					if (
						analysis.isWithinScope &&
						analysis.detectedTopic !== "感情" &&
						analysis.detectedTopic !== "問候"
					) {
						console.log("🎂 檢查是否有已保存的生日...");

						// 提取 AI 分析部分（去除生日請求部分）
						let aiAnalysisOnly = standardResponse;
						// 移除生日請求的部分
						const birthdayRequestIndex =
							aiAnalysisOnly.indexOf("\n\n告訴風鈴你的生日");
						if (birthdayRequestIndex > 0) {
							aiAnalysisOnly = aiAnalysisOnly.substring(
								0,
								birthdayRequestIndex
							);
						}

						birthdayCheckResult =
							await checkSavedBirthdayAndGenerateMessage(
								userEmail,
								userId,
								analysis.detectedTopic,
								aiAnalysisOnly // 🎯 傳入 AI 分析內容
							);
					}

					// 如果有已保存的生日，使用包含 AI 分析的確認訊息；否則使用標準引導訊息
					if (
						birthdayCheckResult &&
						birthdayCheckResult.hasSavedBirthday
					) {
						console.log(
							"✅ 找到已保存的生日，使用包含 AI 分析的確認訊息"
						);
						response = birthdayCheckResult.message;

						// 🔢 添加分析額度信息
						try {
							const userStats =
								await DailyAnalysisRateLimit.getUserStats(
									userEmail,
									userId
								);
							const remainingAnalyses = userStats.remaining || 10;
							const dailyLimit = 10;
							const rateLimitInfo = `\n\n📊 今日分析額度: 你每日可進行 ${dailyLimit} 次初步分析，目前還剩 ${remainingAnalyses} 次機會哦～`;
							response = response + rateLimitInfo;
						} catch (error) {
							console.log("⚠️ 獲取分析額度信息失敗:", error);
						}
						
						// 🔧 設置狀態為等待生日選擇
						if (userIntent) {
							userIntent.conversationState = "awaiting_birthday_choice";
							await userIntent.save();
							console.log("✅ 已設置 conversationState = awaiting_birthday_choice, sessionId:", sessionId);
						} else {
							// 創建新的 userIntent
							console.log("⚠️ userIntent 不存在，創建新的 userIntent, sessionId:", sessionId);
							const newUserIntent = new SmartUserIntent({
								sessionId: sessionId,
								userId: userId,
								userEmail: userEmail,
								primaryConcern: analysis.detectedTopic || "財運",
								conversationState: "awaiting_birthday_choice",
								conversationActive: true,
							});
							await newUserIntent.save();
							console.log("✅ 已創建新 userIntent 並設置 conversationState = awaiting_birthday_choice, _id:", newUserIntent._id);
						}
					} else {
						console.log("📝 未找到已保存的生日，使用標準引導訊息");
						response = standardResponse;
					}

					// 🔢 如果回應包含生日收集模板，添加分析額度信息
					if (
						response.includes(
							"風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕"
						)
					) {
						try {
							const userStats =
								await DailyAnalysisRateLimit.getUserStats(
									userEmail,
									userId
								);
							const remainingAnalyses = userStats.remaining || 10;
							const dailyLimit = 10;

							const rateLimitInfo = `\n\n📊 **今日分析額度**: 你每日可進行 ${dailyLimit} 次初步分析，目前還剩 ${remainingAnalyses} 次機會哦～`;
							response = response + rateLimitInfo;
						} catch (error) {
							console.log("⚠️ 獲取分析額度信息失敗:", error);
						}
					}
				}
			} catch (enhancedError) {
				console.error(
					"🚨 增強分析器錯誤，回退到 AI 分析:",
					enhancedError
				);
				// 使用 AI 分析作為主要方法
				const classifier = new AITopicClassifier(locale);
				try {
					analysis = await classifier.analyzeMessage(
						message,
						sessionId
					);
				} catch (aiError) {
					console.error("🚨 AI 分析也失敗，使用關鍵詞後備:", aiError);
					analysis = classifier.getFallbackAnalysis(message);
				}

				// 🎂 先生成標準的服務引導回應（包含 AI 分析）
				const standardResponse =
					await classifier.generateServiceGuidance(
						analysis,
						message,
						sessionId
					);

				// 🎂 然後檢查是否有已保存的生日
				let birthdayCheckResult = null;
				if (
					analysis.isWithinScope &&
					analysis.detectedTopic !== "感情" &&
					analysis.detectedTopic !== "問候"
				) {
					console.log("🎂 檢查是否有已保存的生日...");

					// 提取 AI 分析部分（去除生日請求部分）
					let aiAnalysisOnly = standardResponse;
					// 移除生日請求的部分
					const birthdayRequestIndex =
						aiAnalysisOnly.indexOf("\n\n告訴風鈴你的生日");
					if (birthdayRequestIndex > 0) {
						aiAnalysisOnly = aiAnalysisOnly.substring(
							0,
							birthdayRequestIndex
						);
					}

					birthdayCheckResult =
						await checkSavedBirthdayAndGenerateMessage(
							userEmail,
							userId,
							analysis.detectedTopic,
							aiAnalysisOnly // 🎯 傳入 AI 分析內容
						);
				}

				// 如果有已保存的生日，使用包含 AI 分析的確認訊息；否則使用標準引導訊息
				if (
					birthdayCheckResult &&
					birthdayCheckResult.hasSavedBirthday
				) {
					console.log(
						"✅ 找到已保存的生日，使用包含 AI 分析的確認訊息"
					);
					response = birthdayCheckResult.message;

					// 🔢 添加分析額度信息
					try {
						const userStats =
							await DailyAnalysisRateLimit.getUserStats(
								userEmail,
								userId
							);
						const remainingAnalyses = userStats.remaining || 10;
						const dailyLimit = 10;
						const rateLimitInfo = `\n\n📊 今日分析額度: 你每日可進行 ${dailyLimit} 次初步分析，目前還剩 ${remainingAnalyses} 次機會哦～`;
						response = response + rateLimitInfo;
					} catch (error) {
						console.log("⚠️ 獲取分析額度信息失敗:", error);
					}
					
					// 🔧 設置狀態為等待生日選擇
					if (userIntent) {
						userIntent.conversationState = "awaiting_birthday_choice";
						await userIntent.save();
						console.log("✅ 已設置 conversationState = awaiting_birthday_choice");
					} else {
						// 創建新的 userIntent
						console.log("⚠️ userIntent 不存在，創建新的 userIntent");
						const newUserIntent = new SmartUserIntent({
							sessionId: sessionId,
							userId: userId,
							userEmail: userEmail,
							primaryConcern: analysis.detectedTopic || "財運",
							conversationState: "awaiting_birthday_choice",
							conversationActive: true,
						});
						await newUserIntent.save();
						console.log("✅ 已創建新 userIntent 並設置 conversationState = awaiting_birthday_choice");
					}
				} else {
					console.log("📝 未找到已保存的生日，使用標準引導訊息");
					response = standardResponse;
				}

				// 🔢 如果回應包含生日收集模板，添加分析額度信息
				if (
					response.includes(
						"風鈴會先給你一個簡單的分析，如果你覺得有幫助，還可以做更詳細的完整報告哦～💕"
					)
				) {
					try {
						const userStats =
							await DailyAnalysisRateLimit.getUserStats(
								userEmail,
								userId
							);
						const remainingAnalyses = userStats.remaining || 10;
						const dailyLimit = 10;

						const rateLimitInfo = `\n\n📊 **今日分析額度**: 你每日可進行 ${dailyLimit} 次專業分析，目前還剩 ${remainingAnalyses} 次機會哦～`;
						response = response + rateLimitInfo;
					} catch (error) {
						console.log("⚠️ 獲取分析額度信息失敗:", error);
					}
				}
			}
		}

		// 保存會話記錄
		try {
			if (!userIntent) {
				// 🎂 檢查是否顯示了已保存生日選單
				const showedSavedBirthdayMenu = response.includes('你上次的生日是') && response.includes('請選擇');
				
				userIntent = new SmartUserIntent({
					userEmail: userEmail,
					userId: userId, // 🆕 新增：保存userId
					sessionId: sessionId,
					// 🎯 移除 conversationHistory - 改用ChatHistory存儲
					conversationState: showedSavedBirthdayMenu ? "awaiting_birthday_choice" : "birthday_collection", // 🎂 根據是否顯示保存生日選單設置狀態
					specificQuestion: analysis.specificProblem,
					primaryConcern: analysis.isWithinScope
						? analysis.detectedTopic
						: null,
					// 🔧 FIX: 保存原始詳細問題描述，用於報告生成
					originalSpecificProblem: analysis.specificProblem,
					originalUserMessage: message, // 🆕 永不覆蓋的原始訊息
				});
				console.log("✅ 創建 userIntent，狀態:", userIntent.conversationState, "顯示了保存生日選單:", showedSavedBirthdayMenu);
			} else if (isBirthdayInput) {
				// 更新狀態為詢問詳細報告
				userIntent.conversationState = "asking_detailed_report";

				// 🔧 解析並標準化生日格式
				const cleanedDate = message
					.replace(/[年月日]/g, "-")
					.replace(/[/]/g, "-");
				const dateMatch = cleanedDate.match(
					/(\d{4})-(\d{1,2})-(\d{1,2})/
				);
				if (dateMatch) {
					const [, year, month, day] = dateMatch;
					const standardDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
					userIntent.userBirthday = new Date(standardDate);
					userIntent.birthdayConfirmed = true; // 🎂 標記生日已確認
				} else {
					userIntent.userBirthday = new Date(message); // 嘗試直接解析
					userIntent.birthdayConfirmed = true; // 🎂 標記生日已確認
				} // 🔧 FIX: 確保原始用戶訊息被保存且永不覆蓋
				if (
					!userIntent.originalUserMessage &&
					topicAndBirthdayData?.originalMessage
				) {
					userIntent.originalUserMessage =
						topicAndBirthdayData.originalMessage;
				}
				if (!userIntent.originalSpecificProblem) {
					userIntent.originalSpecificProblem =
						userIntent.originalUserMessage ||
						topicAndBirthdayData?.originalMessage ||
						userIntent.specificQuestion ||
						"一般諮詢";
				}

				// 設置正確的問題描述
				if (
					!userIntent.specificQuestion ||
					userIntent.specificQuestion.includes("生日分析")
				) {
					if (userIntent.relationshipAnalysisType === "individual") {
						userIntent.specificQuestion = "個人感情分析";
					} else if (
						userIntent.relationshipAnalysisType === "couple"
					) {
						userIntent.specificQuestion = "合婚配對分析";
					} else {
						userIntent.specificQuestion = `${userIntent.primaryConcern}諮詢`;
					}
				}
			} else if (analysis && analysis.isWithinScope) {
				// 更新主要關注點 - 映射到有效的數據庫enum值
				const previousConcern = userIntent.primaryConcern;

				// 使用增強分析器的映射功能
				let mappedTopic = analysis.detectedTopic;
				if (analysis.isEnhanced) {
					// 如果是增強分析結果，需要映射到有效的enum值
					const EnhancedMessageAnalyzer = require("../../../lib/enhancedMessageAnalyzer.js");
					const analyzer = new EnhancedMessageAnalyzer();
					mappedTopic = analyzer.mapTopicToValidEnum(
						analysis.detectedTopic
					);
				} else {
					// 即使不是增強結果，也要確保映射到有效enum值
					const topicMapping = {
						感情: "感情",
						財運: "財運",
						工作: "工作",
						健康: "健康",
						其他: "其他", // 🔧 修復：保持其他話題為其他，不要轉換為感情
					};
					mappedTopic =
						topicMapping[analysis.detectedTopic] || "其他";
				}

				userIntent.primaryConcern = mappedTopic;

				// 🎯 FIX: 不覆蓋已存在的 specificQuestion (例如用戶選擇輸入新生日時)
				// 只在以下情況更新 specificQuestion:
				// 1. specificQuestion 還未設置
				// 2. 或者是臨時狀態消息（如"等待輸入新生日"）且現在有更好的問題描述
				const shouldUpdateSpecificQuestion =
					!userIntent.specificQuestion ||
					userIntent.specificQuestion === "等待輸入新生日" ||
					userIntent.specificQuestion.includes("數字") ||
					userIntent.specificQuestion.includes("无法确定");

				if (shouldUpdateSpecificQuestion) {
					userIntent.specificQuestion = analysis.specificProblem;
				}

				// 🔧 FIX: 當用戶提出新問題時，更新 originalSpecificProblem
				// 允許在主題改變或提出新的實質性問題時更新原始問題
				const shouldUpdateOriginalProblem =
					analysis.specificProblem &&
					analysis.specificProblem.trim().length > 0 &&
					analysis.confidence > 0.7 && // 只有高信心度的分析才更新
					!analysis.specificProblem.includes("用戶選擇") && // 不是選項選擇
					!analysis.specificProblem.includes("无法确定") && // 不是不明確輸入
					!analysis.specificProblem.includes("数字") && // 不是數字輸入
					(!userIntent.originalSpecificProblem || // 尚未設置原始問題
						previousConcern !== mappedTopic || // 主題已改變
						(userIntent.originalSpecificProblem &&
							userIntent.originalSpecificProblem.includes(
								"今天天氣很好"
							))); // 原始問題是無關話題，應該更新

				if (shouldUpdateOriginalProblem) {
					userIntent.originalSpecificProblem =
						analysis.specificProblem;
					console.log(
						`🆕 更新 originalSpecificProblem: ${analysis.specificProblem}`
					);
					console.log(
						`   原因: ${
							!userIntent.originalSpecificProblem
								? "初次設置"
								: previousConcern !== mappedTopic
									? "主題改變"
									: "更新無關話題"
						}`
					);
				} else {
					console.log(
						`🔒 保護原始問題，不覆蓋: ${userIntent.originalSpecificProblem}`
					);
					console.log(
						`   當前分析結果: ${analysis.specificProblem} (信心度: ${analysis.confidence})`
					);
				}

				// 🔧 重要修復：當從一個話題切換到另一個話題時，重置原始問題
				if (
					previousConcern && // 之前有關注領域
					previousConcern !== mappedTopic // 主題發生變化
				) {
					console.log(
						`🔄 主題從 ${previousConcern} 切換到 ${mappedTopic}，重置原始問題和關係分析類型`
					);
					userIntent.originalSpecificProblem =
						analysis.specificProblem; // 重置原始問題
					userIntent.relationshipAnalysisType = "individual";
					userIntent.partnerBirthday = null; // 清除伴侶生日
					userIntent.conversationState = "concern_detected"; // 重置對話狀態
				} else if (
					previousConcern === "感情" &&
					analysis.detectedTopic !== "感情"
				) {
					console.log(`🔄 從感情切換到其他領域，重置關係分析類型`);
					userIntent.relationshipAnalysisType = "individual";
					userIntent.partnerBirthday = null; // 清除伴侶生日
					userIntent.conversationState = "concern_detected"; // 重置對話狀態
				}

				// 🔧 額外檢查：如果原始問題明顯不相關，強制更新
				const isOriginalProblemUnrelated =
					userIntent.originalSpecificProblem &&
					analysis.specificProblem &&
					userIntent.originalSpecificProblem !==
						analysis.specificProblem &&
					// 天氣問題不應該出現在其他分析中
					(userIntent.originalSpecificProblem.includes("天氣") ||
						userIntent.originalSpecificProblem.includes("吃什麼") ||
						// 感情問題不應該出現在工作分析中
						(mappedTopic === "工作" &&
							userIntent.originalSpecificProblem.includes(
								"女朋友"
							)) ||
						(mappedTopic === "工作" &&
							userIntent.originalSpecificProblem.includes(
								"感情"
							)) ||
						// 工作問題不應該出現在感情分析中
						(mappedTopic === "感情" &&
							userIntent.originalSpecificProblem.includes(
								"工作"
							)) ||
						(mappedTopic === "感情" &&
							userIntent.originalSpecificProblem.includes(
								"升職"
							)));

				if (isOriginalProblemUnrelated) {
					console.log(
						`🔄 檢測到原始問題不相關，強制更新: "${userIntent.originalSpecificProblem}" → "${analysis.specificProblem}"`
					);
					userIntent.originalSpecificProblem =
						analysis.specificProblem;
				}
			}

			// 🎯 移除對話歷史存儲到SmartUserIntent - 改為只存到ChatHistory
			// SmartUserIntent現在只存儲業務邏輯狀態，不存儲對話內容

			// 保存 AI 分析結果到 SmartUserIntent
			userIntent.aiAnalysis = {
				...analysis,
				originalMessage: message, // 🔧 保存原始用戶訊息
				lastAnalyzed: new Date(),
			};

			await userIntent.save();

			// 🔍 DEBUG - 檢查response類型before保存到ChatHistory
			console.log("🔍 DEBUG - 保存前response檢查:");
			console.log("   response類型:", typeof response);
			console.log(
				"   response是否為object:",
				typeof response === "object"
			);
			console.log(
				"   response預覽:",
				typeof response === "string"
					? response.substring(0, 100)
					: "[OBJECT]"
			);

			// 🆕 保存對話到ChatHistory模型 (主要存儲)
			await saveToChatHistory(
				sessionId,
				userId,
				message,
				response,
				analysis,
				userIntent
			);
		} catch (dbError) {
			console.error("🚨 數據庫保存失敗:", dbError);
		}

		// 🔧 處理模態框提交（生日+性別+報告類型）

		// 檢查是否為模態框提交
		if (userBirthday && gender && !message?.trim()) {
			console.log("🎯 檢測到模態框提交:", {
				userBirthday,
				gender,
				reportType,
			});

			// 解析生日
			const parsedDate = parseFlexibleDate(userBirthday);
			if (parsedDate) {
				userIntent.userBirthday = parsedDate;
				userIntent.birthdayConfirmed = true; // 🎂 標記生日已確認
				userIntent.conversationState = "ready_for_detailed_report";

				// 保持原有的關注領域，不要被覆蓋
				const originalConcern = userIntent.primaryConcern || "綜合運勢";
				const concern = originalConcern;
				const problem =
					userIntent.specificQuestion ||
					`想了解${concern}方面的運勢和風水建議`;

				// 🔧 檢查是否為合婚分析
				if (
					userIntent.relationshipAnalysisType === "couple" &&
					userIntent.partnerBirthday
				) {
					// 合婚分析：生成合婚報告URL
					const params = new URLSearchParams({
						userBirthday: userBirthday,
						partnerBirthday: userIntent.partnerBirthday
							.toISOString()
							.split("T")[0],
						userGender: gender,
						concern: concern,
						// 🔧 修正：使用原始具體問題
						problem:
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							problem,
						analysisType: "couple",
						// 🔧 新增：傳遞原始具體問題到報告頁面
						originalProblem:
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							"感情變淡，關係疏離",
					});

					reportUrl = `/zh-CN/couple-report?${params.toString()}`;
					console.log("💕 Smart-Chat2 生成合婚報告URL:", reportUrl);
				} else {
					// 個人分析：生成個人報告URL
					const params = new URLSearchParams({
						birthday: userBirthday,
						gender: gender,
						concern: concern,
						// 🔧 修正：使用原始具體問題
						problem:
							userIntent.originalSpecificProblem ||
							userIntent.specificQuestion ||
							problem,
					});

					reportUrl = `/zh-CN/feng-shui-report?${params.toString()}`;
					console.log("📊 Smart-Chat2 生成詳細報告URL:", reportUrl);
				}

				return NextResponse.json({
					response:
						"✨ 專屬風水分析報告已生成！正在為你打開報告頁面...",
					concern: concern,
					emotion: "hopeful",
					conversationState: "ready_for_detailed_report",
					hasReport: true,
					shouldTriggerModal: false,
					reportUrl: reportUrl,
					needsBirthday: false,
					specificQuestion: problem,
					systemType: "smart-chat2",
				});
			}
		}

		// 🔍 DEBUG: 檢查 specificProblem 的值
		console.log("🔍 API 回應準備階段 - specificProblem 檢查:");
		console.log("   analysis?.specificProblem:", analysis?.specificProblem);
		console.log(
			"   userIntent?.specificQuestion:",
			userIntent?.specificQuestion
		);
		console.log("   message:", message);
		console.log(
			"   最終 specificProblem 值:",
			analysis?.specificProblem || userIntent?.specificQuestion || message
		);

		// 🔢 獲取用戶當前分析額度信息並添加到 analysis
		let finalAnalysis = analysis;
		try {
			const userStats = await DailyAnalysisRateLimit.getUserStats(
				userEmail,
				userId
			);
			const rateLimitInfo = {
				current: userStats.analysisCount || 0,
				limit: 10,
				remaining: userStats.remaining || 10,
			};

			console.log("🔢 Debug - Rate Limit Info:", rateLimitInfo);
			console.log("🔢 Debug - User Stats:", userStats);

			// 將 rate limit 信息添加到 analysis 對象
			finalAnalysis = {
				...analysis,
				rateLimitInfo: rateLimitInfo,
			};
		} catch (error) {
			console.log("⚠️ 獲取用戶分析額度信息失敗:", error);
		}

		return NextResponse.json({
			response: cleanMarkdownFormatting(response),
			aiAnalysis: finalAnalysis,
			conversationState: userIntent?.conversationState || "ai_analyzed",
			systemType: "smart-chat2",
			timestamp: new Date().toISOString(),
			// 🔧 添加 Smart-Chat 兼容的字段
			concern: userIntent?.primaryConcern || analysis?.detectedTopic,
			emotion: "neutral",
			shouldTriggerModal: shouldTriggerModal,
			reportUrl: reportUrl,
			reportType: userIntent?.reportType,
			needsBirthday: !userIntent?.userBirthday,
			specificQuestion: userIntent?.specificQuestion,
			// 🔥 修正：添加 specificProblem 到回應中，確保前端可以接收到具體問題描述
			specificProblem:
				analysis?.specificProblem ||
				userIntent?.specificQuestion ||
				message,
			relationshipAnalysisType: userIntent?.relationshipAnalysisType,
			isCoupleAnalysis: userIntent?.relationshipAnalysisType === "couple",
			// 🎯 Add couple birthdays detection flag for frontend
			hasCouplesBirthdays: couplesBirthdayData ? true : false,
		});
	} catch (error) {
		console.error("🚨 Smart-Chat2 錯誤:", error);

		return NextResponse.json(
			{
				response:
					"抱歉，系統暫時遇到問題。不過我還是很想幫你！不如告訴我你的生日，讓我為你做個簡單的運勢分析？ 📅 格式：1990-05-15",
				error: "系統錯誤",
				systemType: "smart-chat2",
			},
			{ status: 500 }
		);
	}
}

// 🆕 新增：保存對話到ChatHistory模型的輔助函數
async function saveToChatHistory(
	sessionId,
	userId,
	userMessage,
	assistantResponse,
	aiAnalysis,
	userIntent
) {
	try {
		// 查找或創建ChatHistory記錄
		let chatHistory = await ChatHistory.findOne({
			conversationId: sessionId,
			userId: userId,
		});

		if (!chatHistory) {
			// 創建新的對話記錄
			chatHistory = new ChatHistory({
				conversationId: sessionId,
				sessionId: sessionId,
				userId: userId,
				userEmail: userIntent?.userEmail || "anonymous",
				title: generateConversationTitle(
					userIntent?.primaryConcern,
					userMessage
				),
				primaryConcern: userIntent?.primaryConcern || "其他",
				conversationState: userIntent?.conversationState || "initial",
				messages: [],
				context: {
					topics: userIntent?.primaryConcern
						? [userIntent.primaryConcern]
						: [],
					lastTopic: userIntent?.primaryConcern,
					conversationSummary: "",
					emotionalState: aiAnalysis?.emotionalState,
				},
				userData: {
					userBirthday: userIntent?.userBirthday,
					partnerBirthday: userIntent?.partnerBirthday,
					gender: userIntent?.gender,
					partnerGender: userIntent?.partnerGender,
					relationshipType: userIntent?.relationshipAnalysisType,
				},
			});
		}

		// 添加用戶消息
		if (userMessage) {
			chatHistory.addMessage("user", userMessage);
		}

		// 添加助手回應
		if (assistantResponse) {
			// 🔧 Safety: 確保回應是字符串格式
			let formattedResponse = assistantResponse;
			if (
				typeof assistantResponse === "object" &&
				assistantResponse.basicAnalysis
			) {
				console.log("🔧 SAFETY - 在ChatHistory中格式化對象回應");
				formattedResponse =
					formatCoupleAnalysisResponse(assistantResponse);
			}
			chatHistory.addMessage("assistant", formattedResponse, aiAnalysis);
		}

		// 更新上下文
		if (aiAnalysis && aiAnalysis.detectedTopic) {
			chatHistory.updateContext(
				aiAnalysis.detectedTopic,
				aiAnalysis.emotionalState
			);
		}

		// 更新對話狀態
		if (userIntent?.conversationState) {
			chatHistory.conversationState = userIntent.conversationState;
		}

		// 保存到數據庫
		await chatHistory.save();

		console.log(`💾 對話已保存到ChatHistory: ${sessionId}`);
		return chatHistory;
	} catch (error) {
		console.error("❌ 保存ChatHistory失敗:", error);
		return null;
	}
}

// 🆕 新增：生成對話標題的輔助函數 - 顯示實際用戶問題
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
		工作: "工作運勢",
		財運: "財運分析",
		健康: "健康運勢",
	};

	if (primaryConcern && concernTitles[primaryConcern]) {
		return concernTitles[primaryConcern];
	}

	return "風水諮詢";
}

// 🎭 內建自然對話優化函數
function enhanceContextualResponse(enhancedResult, userIntent, message) {
	const { contextData } = enhancedResult;
	if (!contextData) return enhancedResult.response;

	const { problem, birthday, problemType } = contextData;

	// 提取年齡信息
	const birthYear = birthday.match(/(\d{4})/)?.[1];
	const age = birthYear ? new Date().getFullYear() - parseInt(birthYear) : 25;

	// 情感支持語句
	const supportMessages = {
		work_problem:
			"失業真的很讓人焦慮呢... 抱抱你！🤗 不過這也許是新機會的開始哦！",
		relationship_issue: "感情的事情總是最讓人牽掛... 我理解你的心情 💜",
		financial_concern:
			"經濟壓力確實很大，不過困難是暫時的！讓我幫你看看轉機在哪裡 💪",
		health_worry: "身體健康最重要，要好好照顧自己呢 🌿",
		general_concern: "聽起來你遇到了一些挑戰，讓風鈴來幫你分析一下！",
	};

	const supportMessage =
		supportMessages[problemType] || supportMessages["general_concern"];

	let response = `${supportMessage}\n\n從你的生日 ${birthday}來看，你現在${age}歲，正值人生的重要階段！\n\n`;

	// 根據問題類型提供建議
	if (problemType === "work_problem") {
		response += `🎯 **關於工作問題：**
這個年齡遇到職業轉換很正常，其實是個重新定位的好機會！
• 你的年紀正適合學習新技能或轉換跑道
• 建議考慮線上工作或新興產業
• 面試穿著建議：深藍色或灰色增加專業感`;
	} else if (problemType === "relationship_issue") {
		response += `💕 **關於感情問題：**
${age}歲的感情經歷都是成長的養分，別太擔心！
• 這個階段重點是提升自己，好的感情自然會來
• 多參與興趣活動，容易遇到合適的人
• 心態調整：保持開放但不急躁`;
	} else if (problemType === "financial_concern") {
		response += `💰 **關於財務問題：**
經濟困難是暫時的，重要的是建立正確的理財觀念！
• 優先處理必要支出，減少不必要消費
• 考慮發展副業或提升技能增加收入
• 投資自己永遠是最好的投資`;
	} else {
		response += `🌟 面對這個問題，重要的是保持正面心態和積極行動！`;
	}

	response += `\n\n💫 每個困難都是成長的機會！\n\n🔮 **專業建議：**
想要更詳細的分析和解決方案嗎？只需要告訴我你的性別，就能為你生成專屬的指導報告！`;

	return response;
}
