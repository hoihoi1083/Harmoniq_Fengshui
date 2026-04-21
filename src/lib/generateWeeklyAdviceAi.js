/**
 * Generate personalized weekly email copy (main sections, 7 daily lines, conclusion)
 * via DeepSeek, using the same API keys as other fortune routes.
 */

/** Static copy when API unavailable or for layout tests (`skipAi` without manual body). */
export const STATIC_WEEKLY_EMAIL_COPY = {
	mainSections: [
		"本週能量節奏適合整理居住與工作空間的「動線」與採光，讓氣場更流通。可先從最常停留的角落開始，避免一次大改造成壓力。",
		"五行調和上，宜以柔和方式補足本週所需，例如用顏色、材質與植物做小幅調整，重在平衡而非極端。",
		"情緒與作息方面，建議維持固定睡眠時段，白天短暫離開螢幕、接觸自然光，有助穩定思緒。",
	],
	dailyOneLiners: [
		"週一：開局宜穩，先處理瑣事再談大事。",
		"週二：溝通順暢，適合短會與對齊進度。",
		"週三：注意體力節奏，午後可短休。",
		"週四：財務與資源配置可再檢視一遍。",
		"週五：收尾與整理，為下週留白。",
		"週六：適合居家小調整與陪伴。",
		"週日：靜心回顧，輕量規劃即可。",
	],
	weeklyConclusion:
		"綜觀本週節奏：前半可偏重整理與溝通，中段留意體力與資源配置，後半適合收尾與留白。願您在空間與作息之間取得平衡，以一種從容、穩定的步調迎接下一週。",
};

function getApiKey() {
	const k = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
	if (!k || k === "your_actual_deepseek_api_key_here") return null;
	return k;
}

function stripJsonFence(text) {
	if (!text || typeof text !== "string") return text;
	const t = text.trim();
	const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
	return m ? m[1].trim() : t;
}

function escapeRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Email already shows「{name} 您好」— remove repeated name / 暱稱 at line starts in AI body copy.
 */
function stripRecipientNameFromCopy(text, name) {
	const n = name?.trim();
	if (!n || !text || typeof text !== "string") return text;
	let s = text;
	const lead = new RegExp(`^${escapeRegExp(n)}[，,、：:\\s]+`);
	s = s.replace(lead, "");
	s = s.replace(
		new RegExp(`\\n${escapeRegExp(n)}[，,、：:\\s]+`, "g"),
		"\n",
	);
	return s.trim();
}

function sanitizeWeeklyCopyFields(obj, recipientName) {
	const name = recipientName?.trim() || "";
	return {
		mainSections: obj.mainSections.map((p) =>
			stripRecipientNameFromCopy(p, name),
		),
		dailyOneLiners: obj.dailyOneLiners.map((p) =>
			stripRecipientNameFromCopy(p, name),
		),
		weeklyConclusion: stripRecipientNameFromCopy(
			obj.weeklyConclusion,
			name,
		),
	};
}

function normalizeAiPayload(parsed) {
	const mainSections = Array.isArray(parsed.mainSections)
		? parsed.mainSections.map((s) => String(s).trim()).filter(Boolean)
		: [];
	const dailyOneLiners = Array.isArray(parsed.dailyOneLiners)
		? parsed.dailyOneLiners.map((s) => String(s).trim()).filter(Boolean)
		: [];
	const weeklyConclusion = parsed.weeklyConclusion
		? String(parsed.weeklyConclusion).trim()
		: "";

	if (mainSections.length < 3 || dailyOneLiners.length !== 7 || !weeklyConclusion) {
		return null;
	}
	return {
		mainSections: mainSections.slice(0, 5),
		dailyOneLiners,
		weeklyConclusion,
	};
}

/**
 * @param {object} params
 * @param {string} params.weekLabel e.g. 2026年第16週（4/13–4/19）
 * @param {Date|string} params.birthDateTime
 * @param {object} params.bazi — result of calculateAccurateBaZi
 * @param {string} [params.recipientName]
 * @returns {Promise<{ mainSections: string[], dailyOneLiners: string[], weeklyConclusion: string, source: 'ai'|'fallback', error?: string }>}
 */
export async function generateWeeklyAdviceWithAi({
	weekLabel,
	birthDateTime,
	bazi,
	recipientName = "使用者",
}) {
	const fallback = { ...STATIC_WEEKLY_EMAIL_COPY, source: "fallback" };

	const apiKey = getApiKey();
	if (!bazi || !bazi.year) {
		return { ...fallback, error: "missing_bazi" };
	}

	if (!apiKey) {
		console.warn(
			"[weeklyAdviceAi] No DEEPSEEK_API_KEY/API_KEY — using static fallback",
		);
		return { ...fallback, error: "no_api_key" };
	}

	const birthIso =
		birthDateTime instanceof Date
			? birthDateTime.toISOString()
			: String(birthDateTime);

	const pillars = `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`;
	const dayMaster = bazi.dayMaster || bazi.dayStem || "";
	const dayElement = bazi.dayElement || "";

	const userPrompt = `你是 HarmoniqFengShui 電子報撰稿助手。請依「本週」時序與下列命主資訊，撰寫繁體中文內容（語氣溫和、具體、可執行；屬生活風水與文化參考，避免誇大或醫療投資承諾）。

讀者暱稱（僅供你了解背景；禁止在下列 JSON 任何欄位中寫出此名或重複稱呼）：${recipientName}
本週標籤：${weekLabel}
出生日期時間（ISO）：${birthIso}
八字四柱：${pillars}
日主：${dayMaster}；日主五行傾向：${dayElement || "（依四柱推斷）"}

請只輸出一個 JSON 物件（不要 markdown、不要註解），鍵名必須完全一致：
{
  "mainSections": [ "第一段", "第二段", "第三段" ],
  "dailyOneLiners": [ "週一：……", "週二：……", "週三：……", "週四：……", "週五：……", "週六：……", "週日：……" ],
  "weeklyConclusion": "一段總結本週並銜接下一週的結語"
}

硬性規則：
- 稱呼：電子報開頭已由系統顯示「${recipientName} 您好」，因此 mainSections、dailyOneLiners、weeklyConclusion 內一律不要出現「${recipientName}」、任何讀者姓名或暱稱；請用「您」或省略主語。
- mainSections：恰好 3 個字串；每段約 90–220 字，須呼應日主／五行與「居住空間、動線、採光、情緒節奏」至少其中兩項，且三段角度有區隔。
- dailyOneLiners：恰好 7 句，依序為週一到週日；每句以「週一：」到「週日：」開頭，每句 20–45 字。
- weeklyConclusion：單一段落，約 120–200 字，收束本週並給予正向、節制的生活提醒。
`;

	try {
		const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
				Accept: "application/json",
			},
			body: JSON.stringify({
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content:
							"你是專精五行與生活風水文案的助理，只輸出合法 JSON 物件，鍵名與使用者指定一致，內容為繁體中文。內文不得重複讀者姓名或暱稱（開頭問候已由版面呈現），請用「您」或省略主語。",
					},
					{ role: "user", content: userPrompt },
				],
				temperature: 0.55,
				max_tokens: 3500,
				stream: false,
			}),
		});

		if (!response.ok) {
			const errText = await response.text();
			console.error("[weeklyAdviceAi] DeepSeek HTTP", response.status, errText);
			return { ...fallback, error: `http_${response.status}` };
		}

		const data = await response.json();
		const raw = data?.choices?.[0]?.message?.content;
		if (!raw) {
			console.error("[weeklyAdviceAi] Empty choices", data);
			return { ...fallback, error: "empty_response" };
		}

		let parsed;
		try {
			parsed = JSON.parse(stripJsonFence(raw));
		} catch (e) {
			console.error("[weeklyAdviceAi] JSON parse failed", raw?.slice(0, 400));
			return { ...fallback, error: "json_parse" };
		}

		const normalized = normalizeAiPayload(parsed);
		if (!normalized) {
			console.error("[weeklyAdviceAi] Validation failed", parsed);
			return { ...fallback, error: "validation" };
		}

		const cleaned = sanitizeWeeklyCopyFields(normalized, recipientName);

		return { ...cleaned, source: "ai" };
	} catch (e) {
		console.error("[weeklyAdviceAi]", e);
		return { ...fallback, error: e.message || "unknown" };
	}
}
