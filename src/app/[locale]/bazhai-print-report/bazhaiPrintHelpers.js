export const DIRECTION_ZH = {
	north: "正北",
	northEast: "東北",
	east: "正東",
	southEast: "東南",
	south: "正南",
	southWest: "西南",
	west: "正西",
	northWest: "西北",
	center: "中宮",
};

export function localizeDirectionText(input) {
	if (!input) return input;
	const text = String(input);
	const replacements = [
		[/northEast/gi, "東北"],
		[/southEast/gi, "東南"],
		[/southWest/gi, "西南"],
		[/northWest/gi, "西北"],
		[/\bNorth East\b/gi, "東北"],
		[/\bSouth East\b/gi, "東南"],
		[/\bSouth West\b/gi, "西南"],
		[/\bNorth West\b/gi, "西北"],
		[/\bnorth\b/gi, "正北"],
		[/\bsouth\b/gi, "正南"],
		[/\beast\b/gi, "正東"],
		[/\bwest\b/gi, "正西"],
	];
	const normalized = replacements.reduce(
		(acc, [pattern, value]) => acc.replace(pattern, value),
		text,
	);
	return normalized.replace(/\(center\)|\bcenter\b/gi, "中心");
}

export function parseOverallSections(analysis) {
	if (!analysis) return [];
	if (typeof analysis === "object") {
		return [
			analysis.overallAnalysis,
			analysis.personalMingGuaAnalysis,
			analysis.annualForecast,
		].filter(Boolean);
	}
	if (typeof analysis !== "string") return [];
	try {
		const matched = analysis.match(/\{[\s\S]*\}/);
		const parsed = JSON.parse(matched ? matched[0] : analysis);
		return [
			parsed.overallAnalysis,
			parsed.personalMingGuaAnalysis,
			parsed.annualForecast,
		].filter(Boolean);
	} catch {
		return [analysis];
	}
}

/**
 * Breaks overall-analysis prose into bullet-friendly lines: respects newlines,
 * leading bullets / numbering, then sentence boundaries (。；).
 */
export function splitOverallSectionIntoPoints(raw) {
	const text = String(raw ?? "").trim();
	if (!text) return [];

	const stripMarkers = (line) =>
		line
			.replace(/^[-*•·]\s+/, "")
			.replace(/^\d+[\.\、．]\s*/, "")
			.replace(/^[（(][一二三四五六七八九十\d]+[）)]\s*/, "")
			.trim();

	const lines = text.split(/\r?\n/).map((l) => stripMarkers(l.trim())).filter(Boolean);
	if (lines.length > 1) return lines;

	const single = lines[0] || text;
	const bySentence = single
		.split(/(?<=[。；])\s*/)
		.map((s) => s.trim())
		.filter(Boolean);
	if (bySentence.length > 1) return bySentence;

	return [single];
}

function truncateSummaryLine(text, maxChars) {
	const s = String(text ?? "").trim();
	if (!s || s.length <= maxChars) return s;
	const slice = s.slice(0, maxChars);
	const pauses = ["。", "；", "，", "、"];
	let cut = -1;
	for (const p of pauses) {
		const i = slice.lastIndexOf(p);
		if (i > cut) cut = i;
	}
	if (cut >= Math.floor(maxChars * 0.45)) {
		return slice.slice(0, cut + 1);
	}
	return `${slice.replace(/[，、；：]\s*$/, "").trimEnd()}…`;
}

/**
 * Fewer, shorter bullets for print — easier to scan at a glance.
 */
export function condenseSummaryPoints(raw, options = {}) {
	const maxItems = options.maxItems ?? 4;
	const maxChars = options.maxChars ?? 96;
	const points = splitOverallSectionIntoPoints(raw);
	return points
		.slice(0, maxItems)
		.map((p) => truncateSummaryLine(p, maxChars));
}

export function parseRoomAI(aiText) {
	if (!aiText)
		return {
			yearSummary: "",
			recommendations: [],
			overallAdvice: "",
			personalAdvice: "",
			recommendationGroups: {
				furniture: [],
				colors: [],
				habits: [],
				items: [],
			},
		};
	try {
		const parsed =
			typeof aiText === "object"
				? aiText
				: JSON.parse((aiText.match(/\{[\s\S]*\}/) || [aiText])[0]);
		const rec = parsed?.recommendations || {};
		const recommendations = [
			...(rec.furniture || []),
			...(rec.colors || []),
			...(rec.habits || []),
			...(rec.items || []),
		].filter(Boolean);
		return {
			yearSummary: parsed?.yearSummary || "",
			recommendations,
			overallAdvice: parsed?.comprehensiveAdvice?.overall || "",
			personalAdvice: parsed?.comprehensiveAdvice?.personal || "",
			recommendationGroups: {
				furniture: rec.furniture || [],
				colors: rec.colors || [],
				habits: rec.habits || [],
				items: rec.items || [],
			},
		};
	} catch {
		return {
			yearSummary: String(aiText),
			recommendations: [],
			overallAdvice: "",
			personalAdvice: "",
			recommendationGroups: {
				furniture: [],
				colors: [],
				habits: [],
				items: [],
			},
		};
	}
}

export function chunkArray(list, size) {
	const chunks = [];
	for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
	return chunks;
}

/**
 * Flatten settings + room chunks into ordered render slots (cover | section | roomChunk …).
 */
export function buildBazhaiPrintSlots(pageSettings, roomPageChunks) {
	const slots = [];
	for (const row of pageSettings) {
		if (!row.enabled) continue;
		if (row.id === "roomDetails") {
			for (let i = 0; i < roomPageChunks.length; i++) {
				slots.push({
					kind: "roomDetails",
					rooms: roomPageChunks[i],
					chunkIndex: i,
				});
			}
			continue;
		}
		slots.push({ kind: row.id });
	}
	return slots;
}
