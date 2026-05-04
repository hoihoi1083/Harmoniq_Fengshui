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
