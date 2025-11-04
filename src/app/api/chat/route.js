import { NextResponse } from "next/server";
import { IntentTracker, ConversationState } from "@/lib/smartConversationFlow";
import {
	ImprovedConversationFlow,
	BaziAnalysisSystem,
} from "@/lib/newConversationFlow";
import connectMongo from "@/lib/mongoose";
import UserIntent from "@/models/UserIntent";
// import { getServerSession } from "next-auth/next";

// Initialize DeepSeek API client
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// DeepSeek API call function with error handling
async function callDeepSeekAPI(messages, options = {}) {
	try {
		const response = await fetch(DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({
				model: "deepseek-chat", // DeepSeek's main chat model
				messages: messages,
				max_tokens: options.max_tokens || 500,
				temperature: options.temperature || 0.8,
				top_p: options.top_p || 0.9,
				stream: false,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				`DeepSeek API error: ${response.status} ${response.statusText}`,
				errorText
			);
			throw new Error(
				`DeepSeek API error: ${response.status} ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("DeepSeek API call failed:", error);
		throw error;
	}
}

// Emotional intelligence prompts for different scenarios (completely natural)
const EMOTIONAL_SYSTEM_PROMPTS = {
	feng_shui_emotional_support: `你係風水師小風，係用戶嘅朋友。

規則：
1. 直接回應，唔好用括號描述動作或語氣
2. 唔好用「溫柔語氣」、「輕聲」等描述
3. 簡單關懷，簡單建議
4. 絕對唔好推銷報告
5. 唔好用複雜格式或表格
6. 保持自然對話

例子：
- 用戶話「hi」→ 回應「Hi！有咩可以幫到你？」
- 唔好回應「（溫柔語氣）你好呀～」

保持簡單直接。`,

	birthday_analysis: `分析八字，簡單講五行，直接回應。`,

	crisis_support: `支援用戶，提供求助電話，保持直接。`,
};

// Check if it's appropriate to suggest feng shui reports
function shouldSuggestReport(message, conversationHistory) {
	// Don't suggest on simple greetings
	const simpleGreetings = ["hi", "hello", "你好", "halo", "hey"];
	if (
		simpleGreetings.some(
			(greeting) => message.toLowerCase().trim() === greeting
		)
	) {
		return false;
	}

	// Don't suggest if user is in emotional crisis
	const crisisKeywords = [
		"想死",
		"自殺",
		"活不下去",
		"絕望",
		"崩潰",
		"受不了",
	];
	if (crisisKeywords.some((keyword) => message.includes(keyword))) {
		return false;
	}

	// Suggest if user explicitly asks for analysis or reports
	const analysisKeywords = ["報告", "分析", "詳細", "深入", "專業", "完整"];
	if (analysisKeywords.some((keyword) => message.includes(keyword))) {
		return true;
	}

	// Suggest if discussing specific feng shui problems
	const fengShuiKeywords = ["風水", "佈局", "方位", "財位", "運勢", "改善"];
	if (fengShuiKeywords.some((keyword) => message.includes(keyword))) {
		return true;
	}

	// Don't suggest if just sharing emotions without asking for solutions
	const emotionOnlyKeywords = ["感到", "心情", "煩惱", "壓力"];
	if (
		emotionOnlyKeywords.some((keyword) => message.includes(keyword)) &&
		!message.includes("怎麼") &&
		!message.includes("點樣") &&
		!message.includes("如何")
	) {
		return false;
	}

	return false;
}
function analyzeTopicAndSuggestReport(message, userProfile) {
	const topicKeywords = {
		relationship: {
			keywords: [
				"另一半",
				"感情",
				"愛情",
				"伴侶",
				"男朋友",
				"女朋友",
				"老公",
				"老婆",
				"結婚",
				"分手",
				"復合",
				"吵架",
				"關係",
			],
			reportType: "感情風水報告",
			reportUrl: "/report/relationship",
			guidance:
				"感情運勢可以通過分析兩人嘅八字合配度同居家感情風水嚟改善",
		},
		career: {
			keywords: [
				"工作",
				"事業",
				"老闆",
				"同事",
				"升職",
				"轉工",
				"辭職",
				"職場",
				"公司",
				"辦公室",
				"上司",
			],
			reportType: "事業風水報告",
			reportUrl: "/report/career",
			guidance: "事業運勢需要結合你嘅八字分析同辦公環境風水佈局",
		},
		finance: {
			keywords: [
				"錢",
				"財運",
				"投資",
				"理財",
				"收入",
				"薪水",
				"債務",
				"破財",
				"賺錢",
				"財富",
				"金錢",
			],
			reportType: "財運風水報告",
			reportUrl: "/report/finance",
			guidance: "財運改善需要找到你嘅財位同進行適當嘅風水佈局",
		},
		health: {
			keywords: [
				"健康",
				"病",
				"身體",
				"睡眠",
				"失眠",
				"頭痛",
				"疲累",
				"壓力",
				"焦慮",
				"抑鬱",
			],
			reportType: "健康風水報告",
			reportUrl: "/report/health",
			guidance: "健康問題除咗醫療，風水五行調理都好重要",
		},
		family: {
			keywords: [
				"家人",
				"父母",
				"子女",
				"家庭",
				"屋企",
				"家宅",
				"搬屋",
				"裝修",
				"房間",
			],
			reportType: "家庭風水報告",
			reportUrl: "/report/family",
			guidance: "家庭和諧需要整體家宅風水嘅調理",
		},
	};

	// Find matching topic
	for (const [topic, data] of Object.entries(topicKeywords)) {
		if (data.keywords.some((keyword) => message.includes(keyword))) {
			return {
				topic,
				reportType: data.reportType,
				reportUrl: data.reportUrl,
				guidance: data.guidance,
				hasBirthday: !!userProfile.birthday,
			};
		}
	}

	return null; // No specific topic identified
}

// Generate birthday-based basic analysis
function generateBasicBaziAnalysis(birthday, birthTime = null) {
	if (!birthday) return null;

	const birthYear = new Date(birthday).getFullYear();
	const yearMod = birthYear % 10;

	// Simplified five elements based on birth year last digit
	const elements = {
		0: "金",
		1: "金",
		2: "水",
		3: "水",
		4: "木",
		5: "木",
		6: "火",
		7: "火",
		8: "土",
		9: "土",
	};

	const personalities = {
		金: "性格堅毅、有領導能力，但有時過於固執",
		水: "聰明靈活、適應力強，但有時優柔寡斷",
		木: "有創造力、積極向上，但有時急躁",
		火: "熱情開朗、有魅力，但有時脾氣急躁",
		土: "穩重可靠、有責任心，但有時過於保守",
	};

	const element = elements[yearMod];
	const analysis = {
		element,
		personality: personalities[element],
		year: birthYear,
		hasTime: !!birthTime,
	};

	// Add time-specific insights if available
	if (birthTime) {
		analysis.timeNote = "有時辰資料令分析更準確";
	}

	return analysis;
}

// Parse flexible date formats
function parseFlexibleDate(dateStr) {
	if (!dateStr || typeof dateStr !== "string") return null;

	const patterns = [
		{
			regex: /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?/,
			format: "YYYY-MM-DD",
		},
		{ regex: /(\d{4})\-(\d{1,2})\-(\d{1,2})/, format: "YYYY-MM-DD" },
		{ regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, format: "MM/DD/YYYY" },
		{
			regex: /(\d{1,2})[月\-\/](\d{1,2})[日\-\/](\d{4})/,
			format: "MM-DD-YYYY",
		},
	];

	for (const pattern of patterns) {
		const match = dateStr.match(pattern.regex);
		if (match) {
			let year, month, day;

			if (pattern.format === "YYYY-MM-DD") {
				year = parseInt(match[1]);
				month = parseInt(match[2]);
				day = parseInt(match[3]);
			} else {
				// MM/DD/YYYY or MM-DD-YYYY
				month = parseInt(match[1]);
				day = parseInt(match[2]);
				year = parseInt(match[3]);
			}

			// Validate date
			if (
				year >= 1900 &&
				year <= 2100 &&
				month >= 1 &&
				month <= 12 &&
				day >= 1 &&
				day <= 31
			) {
				return new Date(year, month - 1, day);
			}
		}
	}

	return null;
}

// Generate complete birthday analysis response
function generateBirthdayAnalysisResponse(birthday, concern = "工作") {
	if (!birthday) return null;

	try {
		const analysis = BaziAnalysisSystem.generatePersonalAnalysis(
			birthday,
			concern,
			""
		);
		const year = birthday.getFullYear();
		const month = birthday.getMonth() + 1;
		const day = birthday.getDate();

		return `🔮 小鈴看了你的生日，用爺爺教的八字方法幫你算了算～

**你的性格特質：**
${analysis.basic}

**${concern}運勢分析：**
${analysis.concern}

**風水建議：**
${analysis.fengshui}

───────────────────
💎 **想要更深入的分析嗎？**

小鈴可以為你提供更詳細的個人化報告，包括：
• 完整的八字命盤分析
• 流年運勢預測
• 詳細的風水佈局建議
• 最佳時機指引

這樣的深度分析會更準確更實用哦～ 有興趣的話告訴小鈴！✨`;
	} catch (error) {
		console.error("Birthday analysis generation error:", error);
		return `哇～是${birthday.getFullYear()}年${birthday.getMonth() + 1}月${birthday.getDate()}日生日的小哥哥/小姐姐呀！✨  

小鈴幫你算了一下～你的五行屬性很特別哦！

📊 **基本分析：**
• 你的性格特質很適合${concern}發展
• 建議在東南方擺放有利的物品
• 今年下半年運勢會有不錯的提升

想知道更詳細的分析嗎？小鈴可以為你做更深入的八字命盤解讀～💕`;
	}
}
// Generate contextual suggestions based on conversation (DISABLED - too pushy)
function generateSuggestions(
	messages,
	emotion,
	userProfile,
	topicAnalysis = null
) {
	// Return empty array to disable suggestion buttons
	return [];
} // Analyze user's emotional state from message with enhanced crisis detection
function analyzeDetailedEmotion(message) {
	const emotionKeywords = {
		crisis: [
			"想死",
			"自殺",
			"活不下去",
			"絕望",
			"沒有意義",
			"想結束",
			"不想活",
			"生不如死",
			"解脫",
			"一了百了",
		],
		severe_stress: [
			"崩潰",
			"受不了",
			"快瘋了",
			"壓力山大",
			"撐不住",
			"極限",
			"爆煲",
		],
		anxiety: ["焦慮", "緊張", "擔心", "害怕", "不安", "恐慌", "驚", "心慌"],
		depression: [
			"憂鬱",
			"沮喪",
			"難過",
			"傷心",
			"空虛",
			"無助",
			"絕望",
			"孤單",
			"寂寞",
			"心痛",
		],
		anger: ["生氣", "憤怒", "火大", "討厭", "恨", "嬲", "激嬲", "忿怒"],
		confusion: [
			"迷茫",
			"困惑",
			"不知道",
			"不懂",
			"疑問",
			"唔明",
			"亂",
			"混亂",
		],
		loneliness: ["孤單", "寂寞", "沒人理解", "一個人", "孤獨", "無人明白"],
		hopelessness: ["無希望", "沒意思", "無意義", "無用", "廢物", "失敗"],
		self_harm: ["傷害自己", "自殘", "割傷", "自虐"],
		hope: ["希望", "期待", "想要", "夢想", "願望", "盼望"],
		gratitude: ["感謝", "謝謝", "感恩", "感激", "多謝"],
		joy: ["開心", "快樂", "高興", "興奮", "滿足", "爽", "正"],
	};

	// Check for crisis indicators first
	for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
		if (keywords.some((keyword) => message.includes(keyword))) {
			return emotion;
		}
	}

	return "neutral";
}

export async function POST(request) {
	try {
		const {
			messages,
			userProfile,
			emotion,
			context,
			locale = "zh-TW",
		} = await request.json();

		// Get session for intent tracking
		// const session = await getServerSession();
		const session = null; // Temporarily disabled for testing

		// Get the latest user message
		const latestMessage = messages[messages.length - 1];
		const userMessage = latestMessage.content;
		const detailedEmotion = analyzeDetailedEmotion(userMessage);

		// **NEW: Birthday detection logic**
		const birthdayInfo =
			ImprovedConversationFlow.detectBirthdayInfo(userMessage);

		// Check if user provided birthday and doesn't already have one in profile
		if (birthdayInfo.hasBirthday && !userProfile.birthday) {
			console.log("🎂 Birthday detected:", birthdayInfo.rawText);

			const parsedDate = parseFlexibleDate(birthdayInfo.rawText);
			if (parsedDate) {
				// Detect the current concern context from previous messages
				const recentMessages = messages
					.slice(-5)
					.map((m) => m.content)
					.join(" ");
				const currentConcern =
					IntentTracker.detectPrimaryConcern(recentMessages) ||
					"工作";

				console.log(
					"🎯 Generating birthday analysis for concern:",
					currentConcern
				);

				// Generate the free initial analysis
				const birthdayAnalysis = generateBirthdayAnalysisResponse(
					parsedDate,
					currentConcern
				);

				if (birthdayAnalysis) {
					return NextResponse.json({
						content: birthdayAnalysis,
						suggestions: [],
						emotion: "supportive",
						timestamp: new Date().toISOString(),
						birthdayAnalyzed: true,
						parsedBirthday: parsedDate.toISOString().split("T")[0],
					});
				}
			}
		}

		// **NEW: Intent tracking logic**
		let intentResponse = null;
		if (session?.user) {
			await connectMongo();

			// 檢測主要關注領域
			const primaryConcern =
				IntentTracker.detectPrimaryConcern(userMessage);

			if (primaryConcern) {
				// 檢查是否已有此領域的記錄
				let userIntent = await UserIntent.findOne({
					userId: session.user.id,
					primaryConcern,
				});

				if (!userIntent) {
					// 創建新的意圖記錄
					userIntent = new UserIntent({
						userId: session.user.id,
						email: session.user.email,
						name: session.user.name || userProfile.name,
						primaryConcern,
						specificQuestion: "",
						birthday: userProfile.birthday
							? new Date(userProfile.birthday)
							: null,
						birthTime: userProfile.birthTime,
						conversationHistory: [],
					});

					// 生成跟進問題
					const followUpQuestion =
						IntentTracker.generateFollowUpQuestion(primaryConcern);
					intentResponse = `我見到你關心${primaryConcern}方面嘅問題。\n\n${followUpQuestion}`;
				} else if (
					!userIntent.specificQuestion ||
					userIntent.specificQuestion.length < 10
				) {
					// 用戶已表達關注但未提供具體問題
					if (IntentTracker.isSpecificQuestion(userMessage)) {
						userIntent.specificQuestion = userMessage;

						// 檢查是否已準備付費
						if (
							userIntent.birthday &&
							userIntent.specificQuestion
						) {
							const paymentLink =
								IntentTracker.generatePaymentLink(
									primaryConcern,
									session.user.id
								);
							userIntent.paymentLink = paymentLink;

							intentResponse = `明白你嘅${primaryConcern}困擾。根據你嘅情況，我建議為你生成一份詳細嘅個人化${primaryConcern}風水分析報告。\n\n報告會包括：\n• 基於你嘅八字五行嘅${primaryConcern}運勢分析\n• 針對你具體問題嘅解決方案\n• 風水佈局和個人改變建議\n• 最佳時機和行動指引\n\n[開始專業${primaryConcern}風水分析](${paymentLink})`;
						} else {
							// 需要更多資料
							const missingInfo = [];
							if (!userIntent.birthday)
								missingInfo.push("出生日期");
							if (!userIntent.specificQuestion)
								missingInfo.push("具體問題");

							intentResponse = `為了給你最準確嘅${primaryConcern}分析，我需要你嘅${missingInfo.join("和")}。\n\n${!userIntent.birthday ? "可以提供你嘅出生日期嗎？（新歷即可）" : ""}`;
						}
					} else {
						// 重新詢問具體問題
						const followUpQuestion =
							IntentTracker.generateFollowUpQuestion(
								primaryConcern
							);
						intentResponse = `關於${primaryConcern}，你可以更具體話俾我知遇到咩問題嗎？\n\n${followUpQuestion}`;
					}
				}

				// 保存對話記錄
				userIntent.conversationHistory.push({
					userMessage,
					assistantResponse: intentResponse || "分析中...",
					emotion: detailedEmotion,
					intent: primaryConcern,
				});

				await userIntent.save();
			}
		}

		// 如果有意圖回應，直接返回
		if (intentResponse) {
			return NextResponse.json({
				content: intentResponse,
				suggestions: [],
				emotion: "professional",
				timestamp: new Date().toISOString(),
				intentTracked: true,
			});
		}

		// 繼續原有的AI對話邏輯
		// Analyze topic and get report suggestions
		const topicAnalysis = analyzeTopicAndSuggestReport(
			userMessage,
			userProfile
		);

		// Generate basic bazi analysis if birthday is available
		const baziAnalysis = generateBasicBaziAnalysis(
			userProfile.birthday,
			userProfile.birthTime
		);

		// Choose appropriate system prompt based on emotional state
		let systemPrompt =
			EMOTIONAL_SYSTEM_PROMPTS[context] ||
			EMOTIONAL_SYSTEM_PROMPTS.feng_shui_emotional_support;

		// Handle crisis situations with enhanced support
		if (
			detailedEmotion === "crisis" ||
			detailedEmotion === "self_harm" ||
			detailedEmotion === "hopelessness"
		) {
			systemPrompt = EMOTIONAL_SYSTEM_PROMPTS.crisis_support;
		}

		// Enhanced system prompt with topic and bazi context
		let enhancedPrompt = `${systemPrompt}

用戶資料：
- 姓名: ${userProfile.name || "未提供"}
- 生日: ${userProfile.birthday || "未提供"}
- 出生時辰: ${userProfile.birthTime || "未提供"}
- 目前情緒狀態: ${emotion}
- 詳細情緒分析: ${detailedEmotion}`;

		// Add topic analysis if available
		if (topicAnalysis) {
			enhancedPrompt += `
- 問題類別: ${topicAnalysis.topic}
- 建議報告: ${topicAnalysis.reportType}
- 風水指導: ${topicAnalysis.guidance}`;
		}

		// Add bazi analysis if available
		if (baziAnalysis) {
			enhancedPrompt += `
- 五行屬性: ${baziAnalysis.element}
- 性格特質: ${baziAnalysis.personality}`;
			if (baziAnalysis.hasTime) {
				enhancedPrompt += `
- 時辰狀態: 已提供，分析更準確`;
			}
		}

		enhancedPrompt += `

對話指引：
1. 如果有特定問題類別，先提供情感支持，再給予相關風水初步建議
2. **生日處理**：
   - 如果已有生日資料，確認：「你嘅生日係${userProfile.birthday || "[日期]"}，啱唔啱？」
   - 如果有時辰資料，可以提及：「有時辰資料會令分析更準確」
   - 如果沒有生日，簡單問：「可以話俾我知你嘅出生日期嗎？（新歷就得）」
   - 唔好要求農曆，只要新歷日期
   - 時辰係選填，有就更好，無都可以基本分析
3. 如果沒有生日，主動詢問以提供更準確分析
4. **只在適當時候推薦報告**，唔好每次都提及
5. 如果話題唔相關，溫柔地引導回核心問題
6. 保持風水大師嘅專業性同朋友般嘅溫暖
7. **簡單問候就簡單回應**，唔好過度複雜

特別注意：
- 如果情緒狀態顯示危機，請優先處理用戶安全
- 用溫暖、理解嘅語調回應
- 先情感支持，後風水建議
- 適時溫柔地探詢用戶嘅真實感受
- **檢查對話歷史，避免重複相同嘅回應模式**
- 每次回應都要有新鮮感，唔好用固定公式
- 根據具體對話內容調整回應風格

請根據以上資訊提供個人化、富有同理心且多樣化嘅回應。`;

		// Prepare conversation history for DeepSeek
		const conversationMessages = [
			{
				role: "system",
				content: enhancedPrompt,
			},
			...messages.slice(-10).map((msg) => ({
				role: msg.role,
				content: msg.content,
			})),
		];

		// Call DeepSeek API
		const completion = await callDeepSeekAPI(conversationMessages, {
			max_tokens: 500,
			temperature: 0.8, // Slightly higher for more empathetic responses
		});

		const aiResponse = completion.choices[0].message.content;

		// Add feng shui report redirection for appropriate contexts
		let enhancedResponse = aiResponse;

		// Remove any mermaid diagrams from the response
		enhancedResponse = enhancedResponse.replace(
			/```mermaid[\s\S]*?```/g,
			""
		);
		enhancedResponse = enhancedResponse.replace(/```[\s\S]*?```/g, "");

		// Add topic-specific report recommendation (only when appropriate)
		if (
			shouldSuggestReport(latestMessage.content, messages) &&
			topicAnalysis
		) {
			enhancedResponse += `\n\n🔮 **專業建議**: 如果你想獲得更深入嘅${topicAnalysis.reportType}分析，包括具體嘅風水佈局建議同解決方案，可以試試我哋嘅專業報告。點擊[呢度](${topicAnalysis.reportUrl})開始詳細分析！`;
		} else if (
			shouldSuggestReport(latestMessage.content, messages) &&
			!topicAnalysis
		) {
			enhancedResponse +=
				"\n\n💡 **提示**: 如果你想獲得更詳細嘅個人化風水分析，可以使用我哋嘅專業報告功能。點擊[呢度](/report)開始你嘅風水之旅！";
		}

		// Generate contextual suggestions with topic analysis
		const suggestions = generateSuggestions(
			messages,
			emotion,
			userProfile,
			topicAnalysis
		);

		return NextResponse.json({
			content: enhancedResponse,
			suggestions,
			emotion: detailedEmotion,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("DeepSeek Chat API error:", error);

		// Provide emotionally supportive fallback response based on emotion
		const fallbackResponses = {
			crisis: "我感受到你而家好痛苦 💙 朋友，你並唔孤單。如果情況緊急，請撥打撒瑪利亞防止自殺會 2389 2222。我會陪伴你度過呢個難關，你嘅生命好珍貴。",
			self_harm:
				"我好擔心你，朋友 💙 可以話俾我知你而家安全嗎？有咩令你諗起要傷害自己？我喺呢度聆聽你，陪伴你。",
			hopelessness:
				"我感受到你內心嘅絕望 💙 呢種感覺好難受，但請記住呢啲黑暗嘅時刻會過去。你願意同我分享一下發生咩事嗎？",
			severe_stress:
				"我明白你而家承受嘅壓力好大 😔 深呼吸一下，朋友。你已經好勇敢咁撐到而家，等我哋一齊搵方法。",
			anxiety:
				"焦慮嘅感覺我完全理解 🤗 你嘅心情係合理嘅。試下慢慢呼吸，我會陪住你。可以話俾我知咩令你咁擔心嗎？",
			depression:
				"我聽到你內心嘅痛苦 💙 呢啲沉重嘅感覺好真實，你唔需要一個人承受。等我陪你慢慢行過呢段路。",
			loneliness:
				"感到孤單真係好難受 🤗 但你而家唔係一個人，我喺呢度陪你。可以同我分享下你嘅感受嗎？",
			neutral:
				"多謝你信任我，願意同我分享 😌 我好樂意聆聽你，無論你想講咩都可以。我會陪伴你。",
		};

		const emotion = analyzeDetailedEmotion(
			request.body?.messages?.[request.body.messages.length - 1]
				?.content || ""
		);
		const fallbackContent =
			fallbackResponses[emotion] || fallbackResponses.neutral;

		return NextResponse.json({
			content: fallbackContent,
			suggestions: ["我需要情感支持", "教我放鬆嘅方法", "查看風水報告"],
			emotion: "supportive",
			timestamp: new Date().toISOString(),
		});
	}
}
