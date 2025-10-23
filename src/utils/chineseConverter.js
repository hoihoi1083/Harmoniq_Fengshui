/**
 * Traditional to Simplified Chinese Converter
 * For region-specific content conversion (China uses Simplified Chinese)
 */

// Comprehensive mapping of Traditional to Simplified Chinese characters
// Focus on common BaZi and Feng Shui terminology
const traditionalToSimplified = {
	// Five Elements (五行)
	齊: "齐",
	嚴: "严",
	沒: "没",
	缺: "缺",

	// Four Pillars (四柱)
	柱: "柱",
	時: "时",

	// General characters
	個: "个",
	們: "们",
	來: "来",
	這: "这",
	為: "为",
	過: "过",
	會: "会",
	還: "还",
	開: "开",
	關: "关",
	動: "动",
	見: "见",
	現: "现",
	學: "学",
	習: "习",
	業: "业",
	產: "产",
	經: "经",
	運: "运",
	進: "进",
	達: "达",
	選: "选",
	適: "适",
	質: "质",
	際: "际",
	種: "种",
	類: "类",
	點: "点",
	從: "从",
	對: "对",
	應: "应",
	當: "当",
	無: "无",
	與: "与",
	處: "处",
	態: "态",
	應: "应",
	該: "该",
	國: "国",
	際: "际",
	發: "发",
	變: "变",

	// User-specific additions
	據: "据",
	議: "议",
	選: "选",
	輔: "辅",
	助: "助",
	過: "过",
	補: "补",
	調: "调",
	節: "节",
	達: "达",
	陰: "阴",
	陽: "阳",
	勢: "势",
	發: "发",
	展: "展",
	顏: "颜",
	職: "职",
	擇: "择",
	強: "强",
	響: "响",
	確: "确",
	認: "认",
	進: "进",
	確: "确",
	協: "协",
	透: "透",
	協: "协",
	調: "调",
	節: "节",
	達: "达",
	陰: "阴",
	陽: "阳",
	衡: "衡",
	勢: "势",
	發: "发",
	展: "展",
	顏: "颜",
	職: "职",
	擇: "择",
	強: "强",
	響: "响",
	確: "确",
	認: "认",
	進: "进",
	確: "确",
	協: "协",
	扶: "扶",
	偏: "偏",
	抑: "抑",
	瀉: "泻",
	化: "化",
	旺: "旺",
	平: "平",
	和: "和",
	員: "员",
	際: "际",
	聽: "听",
	説: "说",
	話: "话",
	語: "语",
	讀: "读",
	寫: "写",
	長: "长",
	門: "门",
	間: "间",
	問: "问",
	題: "题",
	現: "现",
	實: "实",
	際: "际",
	歷: "历",
	歡: "欢",
	觀: "观",
	覺: "觉",
	認: "认",
	識: "识",
	議: "议",
	記: "记",
	計: "计",
	設: "设",
	許: "许",
	論: "论",
	訴: "诉",
	診: "诊",
	證: "证",
	評: "评",
	試: "试",
	詢: "询",
	該: "该",
	詳: "详",
	誌: "志",
	認: "认",
	誤: "误",
	説: "说",
	請: "请",
	諸: "诸",
	課: "课",
	調: "调",
	談: "谈",
	論: "论",
	謝: "谢",
	講: "讲",
	護: "护",
	譯: "译",
	議: "议",
	讓: "让",
	讚: "赞",
	變: "变",
	響: "响",
	顧: "顾",
	顯: "显",
	風: "风",
	飛: "飞",
	養: "养",
	餘: "余",
	館: "馆",
	駕: "驾",
	驗: "验",
	體: "体",
	高: "高",
	鬥: "斗",
	麗: "丽",
	點: "点",
	黨: "党",
	齊: "齐",
	龍: "龙",
	龜: "龟",
};

/**
 * Convert Traditional Chinese text to Simplified Chinese
 * @param {string} text - Traditional Chinese text
 * @returns {string} - Simplified Chinese text
 */
export const convertToSimplified = (text) => {
	if (!text || typeof text !== "string") return text;

	let result = text;

	// Replace each traditional character with its simplified version
	for (const [trad, simp] of Object.entries(traditionalToSimplified)) {
		result = result.replace(new RegExp(trad, "g"), simp);
	}

	return result;
};

/**
 * Convert text based on region
 * @param {string} text - Original text (Traditional Chinese)
 * @param {string} region - 'china', 'hongkong', or 'taiwan'
 * @returns {string} - Converted text
 */
export const convertByRegion = (text, region) => {
	if (region === "china") {
		return convertToSimplified(text);
	}
	return text; // Keep Traditional for Hong Kong and Taiwan
};

/**
 * React hook wrapper for region-based text conversion
 * @param {string} text - Text to convert
 * @param {string} region - Current region
 * @returns {string} - Converted text
 */
export const useRegionalText = (text, region) => {
	return convertByRegion(text, region);
};

export default {
	convertToSimplified,
	convertByRegion,
	useRegionalText,
};
