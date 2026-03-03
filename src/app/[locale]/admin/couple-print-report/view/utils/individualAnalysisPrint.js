/**
 * Shared helpers for print individual analysis: pillar text + parse AI to strengths/suggestions.
 * Prefer AI-generated 主要優勢/發展建議 when the API returns them (use whenever we parse ≥1 item).
 * Fallback is by element (金/木/水/火/土); use fallbackElement when provided (e.g. from wuxing)
 * so 土命 always gets 土 fallback even if API bazi.dayElement differs.
 */

function generatePillarSubtitle(pillar, type) {
	const templates = {
		年: "祖業基礎，早年環境影響深遠",
		月: "父母影響，成長期性格形成",
		日: "本命特質，核心性格展現",
		時: "未來發展，晚年運勢趨向",
	};
	return (templates[type] || "") + `（${pillar || ""}）`;
}

function generatePillarDescription(pillar, type, meaning) {
	if (!pillar || typeof pillar !== "string") return "";
	const firstChar = pillar.charAt(0);
	const elementMap = {
		甲: "木",
		乙: "木",
		丙: "火",
		丁: "火",
		戊: "土",
		己: "土",
		庚: "金",
		辛: "金",
		壬: "水",
		癸: "水",
	};
	const element = elementMap[firstChar] || "土";
	const descriptions = {
		木: "生機勃勃，具有成長和創新的能力",
		火: "熱情活躍，具有領導和表達的天賦",
		土: "穩重踏實，具有包容和協調的特質",
		金: "堅毅果決，具有分析和執行的能力",
		水: "靈活變通，具有智慧和適應的本領",
	};
	return `${meaning}：${descriptions[element]}，${pillar}組合顯示良好的發展潛力。`;
}

export function generatePillarsAnalysis(bazi) {
	if (!bazi || !bazi.year) return null;
	return {
		年柱: {
			title: `年柱-${bazi.year}`,
			subtitle: generatePillarSubtitle(bazi.year, "年"),
			description: generatePillarDescription(
				bazi.year,
				"年",
				"祖業根基，早年環境",
			),
		},
		月柱: {
			title: `月柱-${bazi.month}`,
			subtitle: generatePillarSubtitle(bazi.month, "月"),
			description: generatePillarDescription(
				bazi.month,
				"月",
				"父母宮位，中年發展",
			),
		},
		日柱: {
			title: `日柱-${bazi.day}`,
			subtitle: generatePillarSubtitle(bazi.day, "日"),
			description: generatePillarDescription(
				bazi.day,
				"日",
				"自身性格，配偶關係",
			),
		},
		時柱: {
			title: `時柱-${bazi.hour}`,
			subtitle: generatePillarSubtitle(bazi.hour, "時"),
			description: generatePillarDescription(
				bazi.hour,
				"時",
				"子女宮位，晚年運勢",
			),
		},
	};
}

const FALLBACK_STRENGTHS = {
	金: [
		"決策能力強，能在關係中提供穩定支持",
		"有領導才能，善於處理感情中的實際問題",
		"注重細節，對伴侶的需求觀察入微",
	],
	木: [
		"創新能力強，為關係注入新鮮活力",
		"適應力佳，能靈活應對感情變化",
		"有成長潛力，願意為愛情持續進步",
	],
	水: [
		"溝通能力佳，善於表達內心感受",
		"直覺敏銳，能察覺伴侶的情緒變化",
		"善於變通，在關係中懂得適時退讓",
	],
	火: [
		"感染力強，能帶動伴侶的積極情緒",
		"積極進取，為關係發展提供動力",
		"善於表達，能讓對方感受到愛意",
	],
	土: [
		"穩定可靠，是伴侶可以依靠的支柱",
		"有責任心，對感情認真負責",
		"善於協調，能化解關係中的矛盾",
	],
};
const FALLBACK_SUGGESTIONS = {
	金: [
		"在感情中保持開放心態，接納對方的不同想法",
		"增強靈活性，避免過於固執己見",
		"培養耐心，給予關係更多時間發展",
	],
	木: [
		"加強專注力，避免在感情中三心二意",
		"培養持續性，為長期關係做好準備",
		"注重實際行動，用行動證明愛意",
	],
	水: [
		"增強穩定性，避免情緒波動影響關係",
		"培養決斷力，在重要時刻能做出明確選擇",
		"加強目標設定，與伴侶共同規劃未來",
	],
	火: [
		"培養冷靜思考，避免衝動傷害感情",
		"增強持續力，保持對關係的長期投入",
		"注重細節處理，關注伴侶的小需求",
	],
	土: [
		"增強變通能力，在關係中保持適度彈性",
		"培養創新思維，為感情注入新鮮元素",
		"擴展視野，與伴侶一起探索更廣闊的世界",
	],
};

/**
 * Parse AI analysis text for 主要優勢 and 發展建議. Prefer AI whenever we get ≥1 item per list.
 * @param {string} aiText - Raw response from individual-analysis API
 * @param {object} bazi - { dayElement } from API (used for fallback when no override)
 * @param {string} [fallbackElement] - Optional 金|木|水|火|土 from wuxing (dayStemWuxing) so fallback matches displayed 命
 */
export function parseAiToStrengthsAndSuggestions(
	aiText,
	bazi,
	fallbackElement,
) {
	const strengths = [];
	const suggestions = [];
	const el =
		fallbackElement &&
		["金", "木", "水", "火", "土"].includes(fallbackElement)
			? fallbackElement
			: bazi?.dayElement || "土";

	if (!aiText || typeof aiText !== "string") {
		return {
			strengths: FALLBACK_STRENGTHS[el] || FALLBACK_STRENGTHS.土,
			suggestions: FALLBACK_SUGGESTIONS[el] || FALLBACK_SUGGESTIONS.土,
		};
	}

	const clean = aiText
		.replace(/\*\*/g, "")
		.replace(/✨|🌙|💖|🎯|💡|～|~/g, "");
	const lines = clean.split(/\n/);
	let section = null; // "strengths" | "suggestions"
	const bullet = /^[\s]*[•\-*\d.①②③）、]、?\s*/;

	for (const raw of lines) {
		const line = raw.trim();
		if (!line) continue;
		if (line.includes("主要優勢") || line.match(/^主要優勢[：:]?\s*$/)) {
			section = "strengths";
			const after = line.replace(/^主要優勢[：:]?\s*/, "").trim();
			if (after.length >= 5 && after !== line)
				strengths.push(after.replace(bullet, "").trim());
			continue;
		}
		if (line.includes("發展建議") || line.match(/^發展建議[：:]?\s*$/)) {
			section = "suggestions";
			const after = line.replace(/^發展建議[：:]?\s*/, "").trim();
			if (after.length >= 5 && after !== line)
				suggestions.push(after.replace(bullet, "").trim());
			continue;
		}
		const content = line
			.replace(bullet, "")
			.replace(/^[：:]\s*/, "")
			.trim();
		if (content.length < 5) continue;
		if (section === "strengths") strengths.push(content);
		else if (section === "suggestions") suggestions.push(content);
	}

	const fallbackS = FALLBACK_STRENGTHS[el] || FALLBACK_STRENGTHS.土;
	const fallbackG = FALLBACK_SUGGESTIONS[el] || FALLBACK_SUGGESTIONS.土;
	return {
		strengths: strengths.length >= 1 ? strengths.slice(0, 6) : fallbackS,
		suggestions:
			suggestions.length >= 1 ? suggestions.slice(0, 6) : fallbackG,
	};
}

export const ELEMENT_DESC = {
	金: "金命",
	木: "木命",
	水: "水命",
	火: "火命",
	土: "土命",
};
