import moment from "moment";
import getWuxingData from "@/lib/nayin";

const CN_TO_ELEMENT = {
	金: "metal",
	木: "wood",
	水: "water",
	火: "fire",
	土: "earth",
};

const ELEMENT_COLORS_TW = {
	金: "白色、金色、銀色系",
	木: "綠色、青色系",
	水: "黑色、深藍色系",
	火: "紅色、紫色、粉色系",
	土: "黃色、米色、咖啡色系",
};

const ELEMENT_COLORS_CN = {
	金: "白色、金色、银色系",
	木: "绿色、青色系",
	水: "黑色、深蓝色系",
	火: "红色、紫色、粉色系",
	土: "黄色、米色、咖啡色系",
};

/** 從一句話內擷取生日（無則 null） */
export function extractBirthDateTimeFromText(text) {
	if (!text || typeof text !== "string") return null;
	const s = text.trim();

	// 重要：如果訊息串中同時含有多個日期（例如先輸入 1984，後又輸入 1999），
	// 這裡要抓「最後一次出現」的生日，避免一直沿用舊生日。
	let lastMatch = null;

	let re1 =
		/(\d{4})\s*[-/年]\s*(\d{1,2})\s*[-/月]\s*(\d{1,2})(?:\s*日)?(?:\s+(\d{1,2}):(\d{2}))?/g;
	{
		let m;
		while ((m = re1.exec(s)) !== null) lastMatch = m;
		if (lastMatch) {
			const y = lastMatch[1];
			const mo = lastMatch[2].padStart(2, "0");
			const d = lastMatch[3].padStart(2, "0");
			const hh = lastMatch[4] != null ? lastMatch[4].padStart(2, "0") : "12";
			const mm = lastMatch[5] != null ? lastMatch[5] : "00";
			return `${y}-${mo}-${d} ${hh}:${mm}:00`;
		}
	}

	let re2 =
		/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日(?:\s*(\d{1,2})\s*時)?/g;
	{
		let m;
		lastMatch = null;
		while ((m = re2.exec(s)) !== null) lastMatch = m;
		if (lastMatch) {
			const y = lastMatch[1];
			const mo = lastMatch[2].padStart(2, "0");
			const d = lastMatch[3].padStart(2, "0");
			const hour = lastMatch[4] != null ? parseInt(lastMatch[4], 10) : 12;
			return moment(`${y}-${mo}-${d} ${hour}:00:00`).format(
				"YYYY-MM-DD HH:mm:ss",
			);
		}
	}

	let re3 = /(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/g;
	{
		let m;
		lastMatch = null;
		while ((m = re3.exec(s)) !== null) lastMatch = m;
		if (lastMatch) {
			const y = lastMatch[1];
			const mo = lastMatch[2];
			const d = lastMatch[3];
			const hh = lastMatch[4] != null ? lastMatch[4] : "12";
			const mm = lastMatch[5] != null ? lastMatch[5] : "00";
			return `${y}-${mo}-${d} ${hh}:${mm}:00`;
		}
	}

	return null;
}

/**
 * 使用者訊息是否「幾乎只有生日」：此時若仍把長篇開場白一併送給 LLM，模型容易重複開場而非給分析。
 * 用於改走伺服器直接組好的五行＋商品連結回覆。
 */
export function isBirthDateOnlyMessage(text) {
	if (!text || typeof text !== "string") return false;
	const t = text.trim();
	if (t.length > 36) return false;
	if (extractBirthDateTimeFromText(t) == null) return false;
	if (
		/我|妳|想|財運|财运|感情|健康|事業|事业|推薦|推荐|買|买|送禮|送礼|運勢|运势|不好|幫我|帮我|生日|八字|五行|缺|補|补|問題|问题|哪|如何|怎麼|怎么|男|女|幫|帮|需要|想要|希望|麻煩|麻烦/.test(
			t,
		)
	)
		return false;
	return true;
}

export function parseWuxingPercentages(wuxingScale) {
	const map = {};
	if (!wuxingScale || typeof wuxingScale !== "string") return map;
	const re = /([金木水火土]):(\d+\.?\d*)%/g;
	let m;
	while ((m = re.exec(wuxingScale)) !== null) {
		map[m[1]] = parseFloat(m[2]);
	}
	return map;
}

/** 取比例最低的一至二行（「相對偏弱」） */
export function weakestWuxingElements(percentMap) {
	const entries = Object.entries(percentMap).filter(
		([, v]) => typeof v === "number" && !Number.isNaN(v),
	);
	if (entries.length === 0) return [];
	entries.sort((a, b) => a[1] - b[1]);
	const minVal = entries[0][1];
	return entries.filter(([, v]) => v <= minVal + 0.5).slice(0, 2).map(([k]) => k);
}

export function wuxingChineseToProductElement(ch) {
	return CN_TO_ELEMENT[ch] || null;
}

export function colorHintsForElements(elements, locale) {
	const table = locale === "zh-CN" ? ELEMENT_COLORS_CN : ELEMENT_COLORS_TW;
	return elements.map((e) => `${e}：${table[e] || "—"}`).join("；");
}

/** 從使用者全文猜測商品 tags（英文，與 Product.tags 一致） */
export function inferConcernTagsFromText(text) {
	if (!text) return [];
	const t = text.toLowerCase();
	const tags = [];
	if (/財運|财运|招財|招财|金錢|金钱|wealth|money/i.test(text)) tags.push("wealth");
	if (/感情|桃花|姻緣|姻缘|戀愛|恋爱|love|relationship/i.test(text))
		tags.push("love");
	if (/事業|事业|工作|職場|职场|career|job/i.test(text)) tags.push("career");
	if (/健康|身體|身体|health/i.test(text)) tags.push("health");
	if (/平安|化煞|保護|保护|protection/i.test(text)) tags.push("protection");

	// Relationship / family / communication
	if (
		/父母|親子|孩子|小孩|家庭|家人|长辈|長輩|溝通|沟通|冷戰|冷战|吵架|吵架|磨合|相處|相处|誤會|误会/i.test(
			text,
		)
	) {
		tags.push("love");
		tags.push("protection");
	}

	// Workplace (colleagues / bosses)
	if (/同事|上司|老板|老闆|職場|职场/i.test(text)) tags.push("career");

	// Pets
	if (/寵物|宠物|貓|猫|狗|cat|dog/i.test(text)) tags.push("protection");

	// Stress / sleep -> health + protection
	if (/壓力|压力|焦慮|焦虑|失眠|睡眠|緊張|紧张/i.test(text)) {
		tags.push("health");
		tags.push("protection");
	}

	return [...new Set(tags)];
}

/**
 * 以五行偏弱 + 關注面向挑候選商品（lean 查詢在 route 內完成，此函式做篩選排序）
 */
export function rankProductsForWuxing(products, weakChineseElements, concernTags) {
	const weakDb = weakChineseElements
		.map(wuxingChineseToProductElement)
		.filter(Boolean);
	const scored = products.map((p) => {
		let score = 0;
		if (weakDb.length && weakDb.includes(p.elementType)) score += 3;
		if (concernTags.length && (p.tags || []).some((tag) => concernTags.includes(tag)))
			score += 2;
		if (p.isFeatured) score += 0.5;
		score += Math.min((p.soldCount || 0) / 100, 2);
		return { p, score };
	});
	scored.sort((a, b) => b.score - a.score);
	return scored.map((x) => x.p);
}

/**
 * @returns {{ ok: boolean, wuxingData?: object, weakChinese?: string[], percentMap?: object, error?: string }}
 */
export function computeWuxingBrief(birthDateTime, gender = "male") {
	try {
		let dt = birthDateTime;
		if (
			typeof dt === "string" &&
			!dt.includes("T") &&
			!dt.includes(" ") &&
			/^\d{4}-\d{2}-\d{2}$/.test(dt)
		) {
			dt = `${dt} 12:00:00`;
		}
		const wuxingData = getWuxingData(dt, gender === "female" ? "female" : "male");
		if (!wuxingData?.wuxingScale) {
			return { ok: false, error: "no wuxing scale" };
		}
		const percentMap = parseWuxingPercentages(wuxingData.wuxingScale);
		const weakChinese = weakestWuxingElements(percentMap);
		return { ok: true, wuxingData, weakChinese, percentMap };
	} catch (e) {
		return { ok: false, error: e.message };
	}
}
