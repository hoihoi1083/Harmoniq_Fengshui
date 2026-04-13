import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongo from "@/lib/mongoose";
import ChatHistory from "@/models/ChatHistory";
import { callDeepSeekAPI } from "@/lib/deepseekClient";

const CHAT_PRODUCT = "comfort-chat";
const MSG_SYSTEM = "comfort-chat";

function clipTitle(text) {
	if (!text || typeof text !== "string") return "聊天";
	const cleaned = text.replace(/\s+/g, " ").trim();
	if (cleaned.length <= 40) return cleaned || "聊天";
	return cleaned.substring(0, 40) + "...";
}

/** 對話裡是否已出現過生日／生肖線索（避免重複邀請、啟用深度五行模式） */
function transcriptMentionsBirthOrZodiac(textBlob) {
	if (!textBlob || typeof textBlob !== "string") return false;
	const westernYmd =
		/\d{4}[-/．.\uFF0E]\s*\d{1,2}[-/．.\uFF0E]\s*\d{1,2}/.test(textBlob);
	return (
		/(生肖|屬(鼠|牛|虎|兔|龍|蛇|馬|羊|猴|雞|鸡|狗|豬|猪)|生日|出生|陽曆|阳历|西历|西曆)/.test(
			textBlob,
		) ||
		/\d{4}\s*年\s*\d{1,2}\s*月/.test(textBlob) ||
		westernYmd
	);
}

/** 本則用戶訊息是否主要在補生日／生肖（宜寫滿：整理＋連回前文＋建議） */
function userMessageIsPrimarilyBirthInfo(text) {
	if (!text || typeof text !== "string") return false;
	const t = text.trim();
	if (t.length > 96) return false;
	return transcriptMentionsBirthOrZodiac(t);
}

function assistantMentionsBirthInvite(text) {
	if (!text || typeof text !== "string") return false;
	return /(生日|生肖|屬什麼)/.test(text);
}

function buildBirthdayInviteAppend(locale) {
	return locale === "zh-CN"
		? "你要是愿意的话，可以告诉我阳历生日或属相，我能把五行说得更贴你一些；不说也完全没关系。"
		: "你若願意，可以跟我說陽曆生日或生肖，五行我能講得更貼你一點；不說也完全沒關係。";
}

/** 移除模型愛寫的「（先接住情緒）」等獨立括號行，避免露餡像 AI */
function stripAiParenthesisStageDirections(text) {
	if (!text || typeof text !== "string") return text;
	return text
		.split("\n")
		.filter((line) => !/^（[^）]{1,40}）\s*$/.test(line.trim()))
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

/** 去掉 **粗體**、行首條列符（* / - / 數字.），讀起來像真人傳訊而非 Markdown */
function stripMarkdownishFormatting(text) {
	if (!text || typeof text !== "string") return text;
	let s = text.replace(/\*\*([^*]*)\*\*/g, "$1");
	s = s.replace(/\*\*/g, "");
	s = s.replace(/^\s*\*\s+/gm, "");
	s = s.replace(/^\s*-\s+/gm, "");
	s = s.replace(/^\s*[•·]\s+/gm, "");
	s = s.replace(/^\s*\d+\.\s+/gm, "");
	return s.replace(/\n{3,}/g, "\n\n").trim();
}

function buildSystemPrompt(
	locale,
	{
		prevAssistantTail = "",
		birthContextActive = false,
		birthPrimaryTurn = false,
	} = {},
) {
	const useSimplified = locale === "zh-CN";
	const langRule = useSimplified
		? "請一律使用簡體中文回覆。"
		: "請一律使用繁體中文回覆。";

	const noRepeatClosing = prevAssistantTail
		? `\n【上一則你的結尾節錄】${prevAssistantTail}\n本則回覆的最後一句**必須換句式**，不可同義重複上一則的問法或結構。\n`
		: "";

	const birthDepthBlock = birthContextActive
		? `
【對話已有生日或生肖】用戶已分享資料，**五行／四柱可當主菜之一**（仍要像聊天、講人話），不必再當「只點綴兩句」：
- **扣緊對方上一則在煩的事**（工作、關係、情緒等）：一半用命盤／五行**映照**處境與心情，一半給**具體可做的**安撫與建議（例如學習節奏、怎麼跟老闆對齊期待、小環境或作息、一句可說出口的話），**不要只背課式堆柱象**。
- 長度可比平常更飽滿，約 **5～9 個短段落**（口語短句、像傳訊）；**禁止** Markdown（含 ** 與行首 * / 數字. 條列）。
- 仍**不斷吉凶、不恐嚇**；術語邊講邊翻成白話。
${birthPrimaryTurn ? "\n- 【本則幾乎只在補資料】務必寫滿：簡述你對日期／生肖的理解（換算與一兩個柱象重點即可，有把握再寫，不確定就說個大概）→ **立刻連回前文話題** → 分析與建議 → 溫和收尾讓對方好接。" : ""}`
		: "";

	return `你是「小鈴」。**主軸是像朋友一樣聊天**——有時對方只是隨口講一句，有時是在說心事。你懂一點風水五行，但**不是每句都要開課**；五行像偶爾揮一下翅膀的天使，**有靈感、對得上再帶**，帶了也要講人話。${birthContextActive ? " **若對話裡已有生日／生肖，見下方【對話已有生日或生肖】，可講深、講具體。**" : ""}
${noRepeatClosing}
${birthDepthBlock}

${langRule}

怎麼分話題（很重要）：
- **閒聊、生活小事**（想吃東西、天氣、碎碎念）：以**正常對話**為主，口語自然，可長可短。五行頂多**一兩句順口帶過**，可以不帶；不要硬扯半篇。
- **只說情緒、沒講原因**（「心情不好」「很不開心」）：**不可以只回兩三句就結束**。要寫得**飽滿、像真的在陪對方坐一會兒**：至少 **4 個短段落**（每段兩三行即可），須包含：①具體接住（例如願意說出來本身就不容易、不必急著立刻好起來）②陪伴感（慢慢來、不勉強一次講完）③**一小段**生活化五行聯想（兩三句白話，像在聊天，勿長篇講義）④最後**一句**溫和邀請對方多說——**用開放式**，避免「是發生了事還是單純悶悶的」這種二選一審問感；可改為「心裡最佔位置的是哪一件，如果想說可以慢慢帶過」這類。全程**不要自己編對方的故事**。
- **已講出具體事**（老闆、工作、吵架）：安慰**對準那件事**；五行可以自然多一點，仍用白話、像聊天，不要講義腔。

五行／風水${birthContextActive ? "（已有生日／生肖時可加深，見上文【對話已有生日或生肖】）" : "（點綴，不是主菜）"}：
- 用「我會這樣聯想啦」的閒聊感；語氣溫和，不斷吉凶、不恐嚇、不堆砌術語。
- **禁止**口頭禪式開場：「從五行的角度看」當標籤句；要講就揉進句子裡。
- 用戶若已提供生肖或陽曆生日可講得更貼；沒有就別硬算。
- 偶爾可提醒：傳統文化與生活參考，不能取代現場堪輿或醫療。

說話方式：
- 像**真人傳訊**：口語、短句。**閒聊**可長可短；**只有情緒、沒講原因**時**不可過短**（見上文最少段落）。一般情況大約 **3～7 個短段落**；**不要為了長而長**，也**不要敷衍兩句就丟一個問句**。
- **絕對禁止**寫進給用戶的正文：**雙星號粗體**、\`# 標題\`、行首 \`* \` 或 \`- \` 條列、行首 \`1. \` \`2. \` 這種排版。要列幾點就寫成完整句子分段，或用「一是…二是…」「也可以試試看，先…再…」這種口語，像 LINE 聊天。
- **禁止**舞台動作與多個 emoji。

反 AI 露餡（極重要）：
- **絕對禁止**單獨一行的「（……）」步驟標籤；**禁止**註解自己在寫什麼；只對用戶說話。
- **禁止**任何看起來像 Markdown／簡報條列的符號（**、* 開頭列點、數字加點）；後台會刪掉但你要從一開始就不要寫。

收尾（要有，但不能每次都同一個模具）：
- 最後**一句**讓對方好接；若提示裡有【上一則你的結尾節錄】，本則**不可**重複同一問法或同義模板。
- **禁止**高頻空泛收尾（不要照抄這些句式）：「你現在最想做的是什麼」「今晚想吃點什麼」「想聊聊發生什麼事了嗎」「還是單純想吐苦水」——若要關心，**換字、換角度，且扣住用戶上一句裡的具體詞**。
- **禁止**心理測驗式「是A還是B」；**禁止**「是想…還是想…還是…」多岔路；**禁止**「今天發生什麼事了嗎？還是單純悶悶的？」這類**二選一追問**當整則主軸（可改開放式關心）。
- **禁止在正文裡問陽曆生日或生肖**（系統有時會自動加一句）。
- ${useSimplified ? "收尾用簡體。" : "收尾用繁體。"}

生日／生肖：
- 你**不要**在回覆裡主動問；用戶說了再自然接住。不推銷、不綁付費。

情緒與安全：
- 少講大道理、多接住；不要冒充醫療診斷或開藥。
- 自殘、自殺或緊急危險：簡短關心，請對方立刻找緊急電話或信任的人。

嚴格禁止（銷售）：
- 不得推銷商品、付費報告、課程；不提供購買連結或引導結帳。用戶問哪裡買，只說這裡純聊天、不賣東西即可。`;
}

export async function POST(request) {
	try {
		const session = await auth();
		const body = await request.json();
		const {
			message,
			sessionId,
			userId,
			locale = "zh-TW",
			messageType,
			userEmail: bodyEmail,
		} = body;

		if (messageType === "birthday_submission") {
			return NextResponse.json({
				response:
					"謝謝你願意分享。我們可以用風水與五行的角度陪你聊運勢與心境調整；若你方便，之後在對話裡簡述生肖或生日、或想談的空間與煩惱即可，我會用溫和的方式回你。這裡只做交流參考，不推銷任何商品或付費報告喔～",
				systemType: MSG_SYSTEM,
				aiAnalysis: null,
			});
		}

		if (!message || typeof message !== "string" || !message.trim()) {
			return NextResponse.json(
				{ error: "訊息不能為空" },
				{ status: 400 }
			);
		}
		if (!sessionId || !userId) {
			return NextResponse.json(
				{ error: "缺少 sessionId 或 userId" },
				{ status: 400 }
			);
		}

		const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "AI 服務未配置" },
				{ status: 500 }
			);
		}

		await connectMongo();

		const userEmail =
			session?.user?.email || bodyEmail || "anonymous";

		let chatHistory = await ChatHistory.findOne({
			conversationId: sessionId,
			userId,
		});

		if (
			chatHistory &&
			chatHistory.chatProduct &&
			chatHistory.chatProduct !== CHAT_PRODUCT
		) {
			return NextResponse.json(
				{ error: "會話與此聊天室類型不符" },
				{ status: 400 }
			);
		}

		if (!chatHistory) {
			chatHistory = new ChatHistory({
				conversationId: sessionId,
				sessionId,
				userId,
				userEmail,
				title: clipTitle(message.trim()),
				primaryConcern: "其他",
				conversationState: "initial",
				chatProduct: CHAT_PRODUCT,
				messages: [],
				context: {
					topics: [],
					lastTopic: "",
					conversationSummary: "",
					emotionalState: "",
				},
			});
		}

		const prior = (chatHistory.messages || [])
			.slice(-32)
			.map((m) => ({
				role: m.role,
				content: m.content,
			}));

		const priorUserTurns = (chatHistory.messages || []).filter(
			(m) => m.role === "user"
		).length;
		const userTurnIndex = priorUserTurns + 1;

		const transcriptSoFar = [
			...(chatHistory.messages || []).map((m) => m.content || ""),
			message.trim(),
		].join("\n");

		const msgs = chatHistory.messages || [];
		let prevAssistantTail = "";
		for (let i = msgs.length - 1; i >= 0; i--) {
			if (msgs[i].role === "assistant") {
				const c = msgs[i].content || "";
				prevAssistantTail = c
					.slice(Math.max(0, c.length - 200))
					.replace(/\s+/g, " ")
					.trim();
				break;
			}
		}

		const birthContextActive =
			transcriptMentionsBirthOrZodiac(transcriptSoFar);
		const birthPrimaryTurn = userMessageIsPrimarilyBirthInfo(
			message.trim(),
		);

		const dsMessages = [
			{
				role: "system",
				content: buildSystemPrompt(locale, {
					prevAssistantTail,
					birthContextActive,
					birthPrimaryTurn,
				}),
			},
			...prior,
			{ role: "user", content: message.trim() },
		];

		const dsRes = await callDeepSeekAPI(
			dsMessages,
			{ temperature: 0.62, max_tokens: 3000 },
			apiKey
		);

		let assistantText =
			dsRes?.choices?.[0]?.message?.content?.trim() ||
			"我在這裡陪你，慢慢說也可以。";

		assistantText = stripAiParenthesisStageDirections(assistantText);
		assistantText = stripMarkdownishFormatting(assistantText);

		const needBirthInvite =
			userTurnIndex >= 3 &&
			!chatHistory.comfortBirthdayInviteSent &&
			!transcriptMentionsBirthOrZodiac(transcriptSoFar);

		if (needBirthInvite) {
			if (assistantMentionsBirthInvite(assistantText)) {
				chatHistory.comfortBirthdayInviteSent = true;
			} else {
				assistantText = `${assistantText}\n\n${buildBirthdayInviteAppend(locale)}`;
				chatHistory.comfortBirthdayInviteSent = true;
			}
		}

		chatHistory.chatProduct = CHAT_PRODUCT;
		chatHistory.addMessage("user", message.trim(), null, MSG_SYSTEM);
		chatHistory.addMessage("assistant", assistantText, null, MSG_SYSTEM);

		if (!chatHistory.title || chatHistory.title === "風水諮詢") {
			chatHistory.title = clipTitle(message.trim());
		}

		await chatHistory.save();

		return NextResponse.json({
			response: assistantText,
			systemType: MSG_SYSTEM,
			aiAnalysis: null,
		});
	} catch (error) {
		console.error("comfort-chat API error:", error);
		return NextResponse.json(
			{ error: "處理請求失敗", details: error.message },
			{ status: 500 }
		);
	}
}
