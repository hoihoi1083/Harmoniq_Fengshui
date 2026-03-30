import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";
import { callDeepSeekAPI } from "@/lib/deepseekClient";
import { REPORT_PRODUCT_IDS } from "@/lib/reportProducts";
import { getShopAssistantSiteFacts } from "@/lib/shopAssistantSiteFacts";
import {
	computeWuxingBrief,
	extractBirthDateTimeFromText,
	inferConcernTagsFromText,
	isBirthDateOnlyMessage,
	rankProductsForWuxing,
	colorHintsForElements,
} from "@/lib/shopAssistantWuxing";

const MAX_USER_MESSAGES = 12;
/** 一般路徑／快速路徑共用查詢上限 */
const MAX_PRODUCTS_FETCH = 80;
/** 非五行個人化時傳給 LLM 的目錄筆數 */
const MAX_CATALOG_FOR_LLM = 28;

const CATEGORY_LABELS = {
	charm: { "zh-CN": "手串／飾品", "zh-TW": "手串／飾品" },
	decoration: { "zh-CN": "擺件／裝飾", "zh-TW": "擺件／裝飾" },
	ebook: { "zh-CN": "電子書", "zh-TW": "電子書" },
	service: { "zh-CN": "服務", "zh-TW": "服務" },
	consultation: { "zh-CN": "諮詢", "zh-TW": "諮詢" },
};

function productName(p, locale) {
	return locale === "zh-CN"
		? p.name?.zh_CN || p.name?.zh_TW
		: p.name?.zh_TW || p.name?.zh_CN;
}

function productLineCompact(p, locale) {
	const name = productName(p, locale) || "—";
	const hasGiftReport =
		Array.isArray(p.giftReportTypes) && p.giftReportTypes.length > 0;
	const giftToken = hasGiftReport ? "giftReport" : "";
	const tags = (p.tags || []).join(",") || "";
	const tagsOut = giftToken ? (tags ? `${tags},${giftToken}` : giftToken) : tags || "—";
	const el = p.elementType || "x";
	return `${String(p._id)}|${name}|${tagsOut}|${el}|${p.price}`;
}

function wantsProductCatalogOnly(text) {
	const s = (text || "").trim();
	if (s.length < 2 || s.length > 120) return false;

	// 1) 明確「要目錄/清單」的意圖（才走 fastPath）
	const catalogIntent =
		/有哪些(產品|商品)|有什麼(產品|商品)|有什么(产品|商品)|站(內|里|裡).*(有什麼|有什么)|店(內|里|裡).*(有什麼|有什么)|站產品有什麼|站产品有什么|站產品有咩|站产品有咩|站內商品|站内商品|全部(商品|產品|产品)|商品列表|產品列表|产品列表|catalog|product\s*list|list\s*(of\s*)?products|what\s*(do\s*you)?\s*sell|what\s*products/i.test(
			s,
		);
	if (!catalogIntent) return false;

	// 2) 只要是「求推薦/求建議/有情境困擾」就不要走列清單（走正常對話 + 精選推薦）
	const recommendationIntent =
		/適合|适合|推薦|推荐|推介|介紹下|介绍下|幫我|帮我|幫下|帮下|建議|建议|點揀|点揀|點選|怎么选|怎麼選|点买|買咩|买什么好|哪個|哪个|哪一款|哪一隻|哪只|最好|what\s*(should|can)\s*i\s*(buy|choose)|recommend/i.test(
			s,
		);

	const problemContext =
		/最近|一直|成日|總係|总是|覺得|觉得|困擾|困扰|唔開心|不開心|唔順|不顺|壓力|压力|焦慮|焦虑|緊張|紧张|吵架|冷戰|冷战|誤會|误会|磨合|衝突|冲突|溝通|沟通|相處|相处|關係|关系|改善|解決|解决|點算|怎么办|如何|怎麼|怎么/i.test(
			s,
		);

	const personalSignals =
		/財運|财运|桃花|感情|工作|事業|事业|健康|化煞|送禮|送礼|預算|预算|生日|八字|五行|缺|補|补|子女|親子|孩子|小孩|父母|家人|家庭|同事|上司|朋友|寵物|宠物|猫|狗|cat|dog|parent|kid|child|family|colleague/i.test(
			s,
		);

	return !(recommendationIntent || problemContext || personalSignals);
}

function sanitizeNoBoldStars(text) {
	if (typeof text !== "string") return "";
	return text.replaceAll("**", "");
}

function sanitizeProductLinksToWhitelist(text, allowedIds, locale) {
	if (typeof text !== "string") return "";
	const set = allowedIds instanceof Set ? allowedIds : new Set(allowedIds || []);
	// Replace any product markdown link whose id is not in whitelist with plain name.
	// Example: [Name](/zh-TW/shop/product/<id>)
	return text.replace(
		/\[([^\]]+)\]\((\/[a-z]{2}-[A-Z]{2}\/shop\/product\/([0-9a-f]{24}))\)/g,
		(full, name, _href, id) => (set.has(id) ? full : name),
	);
}

function countProductLinks(text) {
	if (typeof text !== "string") return 0;
	const re =
		/\[([^\]]+)\]\((\/[a-z]{2}-[A-Z]{2}\/shop\/product\/([0-9a-f]{24}))\)/g;
	let m;
	let c = 0;
	while ((m = re.exec(text)) !== null) c++;
	return c;
}

function extractProductIdsFromLinks(text) {
	if (typeof text !== "string") return [];
	const re =
		/\[([^\]]+)\]\((\/[a-z]{2}-[A-Z]{2}\/shop\/product\/([0-9a-f]{24}))\)/g;
	let m;
	const ids = new Set();
	while ((m = re.exec(text)) !== null) {
		const id = m[3];
		if (id) ids.add(id);
	}
	return [...ids];
}

function capProductLinksToMax(text, allowedIds, locale, max = 3) {
	if (typeof text !== "string") return "";
	const set = allowedIds instanceof Set ? allowedIds : new Set(allowedIds || []);
	let count = 0;
	return text.replace(
		/\[([^\]]+)\]\((\/[a-z]{2}-[A-Z]{2}\/shop\/product\/([0-9a-f]{24}))\)/g,
		(full, name, _href, id) => {
			if (set.has(id) && count < max) {
				count++;
				return full;
			}
			return name;
		},
	);
}

function appendGiftReportEmphasisIfNeeded(reply, productById, locale) {
	if (typeof reply !== "string") return reply;
	const hasGiftKeyword = /贈送報告|赠送报告/.test(reply);

	const ids = extractProductIdsFromLinks(reply);
	const hasGiftProduct = ids.some((id) => {
		const p = productById?.get(id);
		return Array.isArray(p?.giftReportTypes) && p.giftReportTypes.length > 0;
	});

	if (!hasGiftProduct || hasGiftKeyword) return reply;

	const isCn = locale === "zh-CN";
	const suffix = isCn
		? "\n\n另外提醒：你刚刚提到的这些含“赠送报告”的商品，都会附带按你的生日与问题生成的真人顾问详细分析。这样你买的不只是饰品，也是一起拿到对应的解读。"
		: "\n\n另外提醒：你剛剛提到的這些含「贈送報告」的商品，會附上一份依你的生日與你提出的問題生成的真人顧問詳細分析。這樣你買的不只是飾品，也一起拿到對應的解讀。";

	return reply + suffix;
}

function escapeRegExp(str) {
	return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function linkProductNamesInsteadOfViewText(text, products, locale, shopBase) {
	if (typeof text !== "string") return text;
	if (!Array.isArray(products) || products.length === 0) return text;

	let out = text;
	const maxLookups = Math.min(products.length, 12);

	for (let i = 0; i < maxLookups; i++) {
		const p = products[i];
		const name = productName(p, locale);
		if (!name) continue;
		const id = String(p._id);
		const link = `[${name}](${shopBase}/${id})`;

		// Common CTA text from the LLM/UI: "查看商品" / "查看詳情"
		const re1 = new RegExp(`${escapeRegExp(name)}\\\\s*查看商品`, "g");
		const re2 = new RegExp(`${escapeRegExp(name)}\\\\s*查看詳情`, "g");
		const re3 = new RegExp(`${escapeRegExp(name)}\\\\s*查看詳情`, "g");

		out = out.replace(re1, link);
		out = out.replace(re2, link);
		out = out.replace(re3, link);
	}

	// Remove leftover view CTA tokens to avoid "查看商品" showing alone.
	out = out.replace(/查看商品|查看詳情/g, "");
	return out;
}

function replaceGenericViewLinks(text, productById, locale) {
	if (typeof text !== "string") return text;
	if (!productById) return text;

	// Replace generic view-CTA links like:
	// [查看详情](/zh-CN/shop/product/<id>) -> [真实商品名](/zh-CN/shop/product/<id>)
	const re =
		/\[(查看詳情|查看详情|查看商品|查看詳細|查看詳細|查看內容|View details|View Detail)\]\((\/[a-z]{2}-[A-Z]{2}\/shop\/product\/([0-9a-f]{24}))\)/g;

	return text.replace(re, (_full, _label, href, id) => {
		const p = productById?.get(id);
		const name = productName(p, locale);
		return name ? `[${name}](${href})` : _full;
	});
}

function extractWeakChineseFromText(text) {
	if (typeof text !== "string") return [];
	const allowed = new Set(["金", "木", "水", "火", "土"]);
	// Try Traditional template: 相對偏弱五行：金、水。
	// Try Simplified template: 相对偏弱的五行（依比例）：金、水。
	const re =
		/相[對对]偏弱[的]?五行[^：:]*[：:]\s*([^\n。!！?？]+)/;
	const m = text.match(re);
	if (!m) return [];
	const raw = m[1] || "";
	// Split by 、 , / whitespace / and/or
	return raw
		.split(/[、,\s和以及以及]+/)
		.map((x) => x.trim())
		.filter((x) => allowed.has(x));
}

function extractPriorWeakChinese(messages) {
	if (!Array.isArray(messages)) return [];
	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i];
		if (msg?.role !== "assistant") continue;
		const weak = extractWeakChineseFromText(msg.content);
		if (weak.length) return weak;
	}
	return [];
}

function formatConcernTagsForLocale(tags, locale) {
	const isCn = locale === "zh-CN";
	const map = {
		wealth: isCn ? "财运" : "財運",
		love: isCn ? "感情" : "感情",
		career: isCn ? "事业" : "事業",
		health: isCn ? "健康" : "健康",
		protection: isCn ? "平安/化煞" : "平安/化煞",
	};
	return (Array.isArray(tags) ? tags : [])
		.map((t) => map[t] || t)
		.join(isCn ? "、" : "、");
}

function buildFastCatalogReply(products, locale) {
	const shopBase = `/${locale}/shop/product`;
	const isCn = locale === "zh-CN";
	const list = products.slice(0, 50);

	let out = isCn
		? "嗨，我是小风～先帮你快速整理目前店里在架上的商品，点击名称可以看详情：\n\n"
		: "嗨，我是小風～先幫你快速整理目前店裡在架上的商品，點名稱可以看詳情：\n\n";

	const byCat = {};
	for (const p of list) {
		const c = p.category || "charm";
		if (!byCat[c]) byCat[c] = [];
		byCat[c].push(p);
	}

	const order = [
		"charm",
		"decoration",
		"ebook",
		"consultation",
		"service",
	];
	for (const cat of order) {
		const catList = byCat[cat];
		if (!catList?.length) continue;
		const label = CATEGORY_LABELS[cat]?.[locale] || (isCn ? "其他" : "其他");
		out += `${label}\n`;
		for (const p of catList) {
			const n = productName(p, locale) || "商品";
			const tags = (p.tags || []).join("、") || "—";
			out += `- [${n}](${shopBase}/${p._id}) · ${tags} · 約 HKD ${p.price}\n`;
		}
		out += "\n";
	}

	out += isCn
		? "想针对财运、感情或送礼挑款，可以说说生日（例 1990-05-15）和近况，我再帮你结合五行意象细选～✨"
		: "想針對財運、感情或送禮挑款，可以說說生日（例 1990-05-15）和近況，我再幫你結合五行意象細選～✨";

	return out;
}

/** 僅生日一句時由伺服器直接組回覆，避免 LLM 重複聊天室裡的長篇開場白 */
function buildDeterministicWuxingShopReply({
	locale,
	shopBase,
	birthDT,
	wx,
	picks,
	concernTags = [],
}) {
	const isCn = locale === "zh-CN";
	const weakStr = (wx.weakChinese || []).join("、") || "—";
	const colorLine =
		(wx.weakChinese || []).length > 0
			? colorHintsForElements(wx.weakChinese, locale)
			: colorHintsForElements(
					[wx.wuxingData.dayStemWuxing || "木"],
					locale,
				);

	let body = isCn
		? `收到你的公历生日 ${birthDT}。\n\n`
		: `收到你的公曆生日 ${birthDT}。\n\n`;

	body += isCn
		? `五行比例（参考）：${wx.wuxingData.wuxingScale}\n\n相对偏弱的五行：${weakStr}。\n\n色系意象（文化联想）：${colorLine}\n\n日主：${wx.wuxingData.dayStem}（${wx.wuxingData.dayStemWuxing}）\n\n`
		: `五行比例（參考）：${wx.wuxingData.wuxingScale}\n\n相對偏弱五行：${weakStr}。\n\n色系意象（文化聯想）：${colorLine}\n\n日主：${wx.wuxingData.dayStem}（${wx.wuxingData.dayStemWuxing}）\n\n`;

	body += isCn
		? "结合以上意象，下面三款店里的商品在五行标签或常见配色上可能更贴近你的参考方向（可按眼缘再细选）：\n\n"
		: "結合以上意象，下面三款店裡的商品在五行標籤或常見配色上可能更貼近你的參考方向（可按眼緣再細選）：\n\n";

	for (const p of picks.slice(0, 3)) {
		const n = productName(p, locale) || (isCn ? "商品" : "商品");
		const tags = (p.tags || []).join("、") || "—";
		body += `- [${n}](${shopBase}/${p._id}) · ${tags} · 約 HKD ${p.price}\n`;
	}

	const hasAnyGiftReport = picks
		.slice(0, 3)
		.some((p) => Array.isArray(p.giftReportTypes) && p.giftReportTypes.length > 0);
	if (hasAnyGiftReport) {
		body += isCn
			? "\n這幾款若有標示含赠送报告：會附帶依你的生日與你填寫的問題，由真人顾问做更详尽的改善分析。"
			: "\n這幾款若有標示含贈送報告：會附帶依你的生日與你填寫的問題，由真人顧問做更詳盡的改善分析。";
	}

	const concernLabel = formatConcernTagsForLocale(concernTags, locale);
	if (concernLabel) {
		body += isCn
			? `\n你刚刚提到「${concernLabel}」，如果要我继续按这个方向帮你再收窄到 1～3 款，我可以直接给你“必买清单”～✨`
			: `\n你剛剛提到「${concernLabel}」，如果要我繼續按這個方向幫你再收窄到 1～3 款，我可以直接給你「必買清單」～✨`;
	} else {
		body += isCn
			? "\n若想针对财运、感情或送礼再收窄范围，跟我多说一句就可以～✨"
			: "\n若想針對財運、感情或送禮再收窄範圍，跟我多說一句就可以～✨";
	}

	return body;
}

function wantsGiftReportFaq(text) {
	const s = (text || "").trim();
	if (!s) return false;
	// 贈送報告/报告相关 FAQ：必须包含「报告/电子版/紙本/贈送報告」关键词，
	// 否则容易误判成“没收到产品”的情况。
	const hasReportKeywords = /贈送報告|赠送报告|報告|报告|電子版|电子版|紙本|纸本|72小時|72小时|真人顧問|真人顾问/i.test(
		s,
	);
	if (!hasReportKeywords) return false;

	// 贈送報告/買到後/拿報告/何時收到/退款/退換等
	return /贈送報告|赠送报告|買到後|买到后|買到之後|买到之后|報告有什麼|报告有什么|報告內容|报告内容|怎麼拿報告|怎么拿报告|多久收到|何時收到|何时收到|尚未收到|还没收到|未收到|沒收到|到貨|到货|寄出|发出|送达|到达|退款|退換|退换|售後|售后/i.test(
		s,
	);
}

function wantsProductRecommendation(text) {
	const s = (text || "").trim();
	if (!s) return false;
	return /推薦|推荐|挑|挑款|挑選|点选|點選|買什麼|买什么|買咩|买咩|送礼|送禮|財運|财运|感情|事業|事业|健康|化煞|招財|招财|護身|保護|protection|wealth|love|career|health/i.test(
		s,
	);
}

function wantsDeliveryOrTrackingFaq(text) {
	const s = (text || "").trim();
	if (!s) return false;
	// 物流/到货/追踪相关（包含“没收到/未收到”）
	return /多久收到|何時收到|何时收到|到貨|到货|發貨|发货|出貨|出货|物流|追蹤|追踪|進度|进度|寄出|到达|送达|没收到|沒收到|未收到|收不到|尚未收到|還沒收到|还没收到/i.test(
		s,
	);
}

function wantsReturnsOrRefundFaq(text) {
	const s = (text || "").trim();
	if (!s) return false;
	return /退款|退換|退换|退貨|退货|售後|售后|退換貨|退换货|取消訂單|取消订单|不满意|不滿意/i.test(
		s,
	);
}

function wantsMissingEmailOrReportFaq(text) {
	const s = (text || "").trim();
	if (!s) return false;
	// 只处理“报告/电子版/纸本”的没收到
	const hasReport =
		/(報告|报告|贈送報告|赠送报告|電子版|电子版|紙本|纸本|72小時|72小时)/i.test(
			s,
		);
	const missing =
		/(没收到|未收到|收不到|沒收到|还没收到|還沒收到|尚未收到|没有收到|沒有收到)/i.test(
			s,
		);
	return hasReport && missing;
}

function buildGiftReportFaqReply(locale) {
	const isCn = locale === "zh-CN";
	const base = `/${locale}`;
	const ordersLink = isCn
		? `[我的订单](${base}/orders)`
		: `[我的訂單](${base}/orders)`;
	const reportIntroLink = isCn
		? `[报告介绍与购买说明](${base}/report-preview)`
		: `[報告介紹與購買說明](${base}/report-preview)`;
	const returnsLink = isCn
		? `[退换货政策](${base}/customer/returns)`
		: `[退換貨政策](${base}/customer/returns)`;
	const termsLink = isCn
		? `[用户条款](${base}/customer/terms)`
		: `[用戶條款](${base}/customer/terms)`;
	const contactLink = isCn
		? `[联系我们](${base}/customer/contact)`
		: `[聯絡我們](${base}/customer/contact)`;

	if (isCn) {
		return [
			"收到！关于“赠送报告”，流程大致如下（细节以站内页面为准）：",
			"",
			"1) 报告是什么",
			"取决于你购买含“赠送报告”的商品与下单时选择的类型（财运/感情/事业/健康等）。提交生辰与问题后，由真人顾问撰写，并会围绕你的问题给出更详盡的改善方向与逐项分析。",
			"",
			"2) 如何填写与提交",
			`付款完成后登录账号，打开 ${ordersLink}，进入该订单详情，填写性别、出生日期，并对每一项赠送报告提交你的问题（提交后通常不可再改，以页面提示为准）。`,
			"",
			"3) 何时收到",
			"电子版：提交完整出生信息后，目标 72 小时内发到你的注册邮箱。",
			"纸本：如商品包含纸本或你另购报告类商品，约 7 天内完成撰写、校对、印刷并寄出（个案或假期可能顺延）。",
			"",
			"4) 需要注意",
			"填写错误的个人资料：建议 24 小时内通过电邮联系在线客服更正。",
			"",
			`如你想看与“单独购买报告/退款/发货方式”相关的细节：可先打开 ${reportIntroLink}，退款与退换可查看 ${returnsLink} 与 ${termsLink}。`,
			"",
			`有任何具体问题，也可以到 ${contactLink} 留言，我会帮你一起确认。`,
			"",
			"如果你想把财运/感情/事业/健康的方向再具体化到日常佩戴，我也可以顺便从店里给你挑 1～2 个更贴合的饰品方向。",
		].join("\n");
	}

	return [
		"收到！關於「贈送報告」，流程大致如下（細節以站內頁面為準）：",
		"",
		"1) 報告是什麼",
		"取決於你購買含「贈送報告」的商品，以及下單時選擇的類型（財運/感情/事業/健康等）。提交生辰與問題後，由真人顧問撰寫，並會針對你的問題給出更詳盡的改善方向與逐項分析。",
		"",
		"2) 如何填寫與提交",
		`付款完成後登入帳號，打開 ${ordersLink}，進入該筆訂單詳情，填寫性別、出生日期，並對每一種贈送報告提交你的問題（提交後通常不可再改，以頁面提示為準）。`,
		"",
		"3) 何時收到",
		"電子版：提交完整出生資訊後，目標 72 小時內寄到你的註冊信箱。",
		"紙本：如商品包含紙本或你另購報告類商品，約 7 天內完成撰寫、校對、印刷並寄出（個案或假期可能順延）。",
		"",
		"4) 需要注意",
		"填寫錯誤的個人資料：建議 24 小時內透過電郵聯絡客服更正。",
		"",
		`若你想看與「單獨購買報告/退款/發貨方式」相關的細節：可先打開 ${reportIntroLink}，退款與退換可查看 ${returnsLink} 與 ${termsLink}。`,
		"",
		`有任何具體問題，也可以到 ${contactLink} 留言，我會幫你一起確認。`,
		"",
		"如果你想把財運/感情/事業/健康的方向再具體化到日常佩戴，我也可以順便從店裡幫你挑 1～2 個更貼合的飾品方向。",
	].join("\n");
}

function buildDeliveryOrTrackingFaqReply(locale) {
	const isCn = locale === "zh-CN";
	const base = `/${locale}`;
	const ordersLink = isCn ? `[我的订单](${base}/orders)` : `[我的訂單](${base}/orders)`;
	const contactLink = isCn ? `[联系我们](${base}/customer/contact)` : `[聯絡我們](${base}/customer/contact)`;

	if (isCn) {
		return [
			"收到！关于「多久到 / 发货进度 / 物流追踪」，你可以这样查：",
			"",
			"1) 实体商品物流：以订单状态为准，你可以到 " + ordersLink + " 看出货与到货进度。",
			"2) 报告类（电子版/纸本）：电子版目标 72 小时寄到注册邮箱；纸本约 7 天完成并寄出。",
			"",
			"如果你告诉我你问的是「实体商品 / 电子版报告 / 纸本报告」哪一种，我可以帮你更精确地判断重点；超过预计时间也可以到 " +
				contactLink +
				" 留言。",
		].join("\n");
	}

	return [
		"收到！關於「多久到／發貨進度／物流追蹤」，你可以這樣查：",
		"",
		"1) 實體商品物流：以訂單狀態為準，你可以到 " + ordersLink + " 看出貨與到貨進度。",
		"2) 報告類（電子版/紙本）：電子版目標 72 小時寄到註冊信箱；紙本約 7 天完成並寄出。",
		"",
		"如果你告訴我你問的是「實體商品／電子版報告／紙本報告」哪一種，我可以幫你更精確地判斷重點；超過預計時間也可以到 " +
			contactLink +
			" 留言。",
	].join("\n");
}

function buildReturnsRefundFaqReply(locale) {
	const isCn = locale === "zh-CN";
	const base = `/${locale}`;
	const returnsLink = isCn ? `[退换货政策](${base}/customer/returns)` : `[退換貨政策](${base}/customer/returns)`;
	const termsLink = isCn ? `[用户条款](${base}/customer/terms)` : `[用戶條款](${base}/customer/terms)`;

	if (isCn) {
		return [
			"收到！关于「退换/退款」，先给你一个快速对齐：",
			"",
			"1) 定制命理报告类：以商品页/订单页提示的取消与退款时限为准。",
			"2) 实体商品：通常需满足“完整状态”，并在收货后约 7 天内提出。",
			"",
			"你可以先看 " + returnsLink + " 和 " + termsLink + "；如果你告诉我订单里是哪一项（实体/报告），我也能把重点讲得更贴近你的情况。",
		].join("\n");
	}

	return [
		"收到！關於「退換／退款」，先給你一個快速對齊：",
		"",
		"1) 客製命理報告類：以商品頁/訂單頁提示的取消與退款時限為準。",
		"2) 實體商品：通常需滿足「完整狀態」，並在收貨後約 7 天內提出。",
		"",
		"你可以先看 " + returnsLink + " 與 " + termsLink + "；如果你告訴我訂單裡是哪一項（實體/報告），我也能把重點講得更貼近你的情況。",
	].join("\n");
}

function buildMissingEmailOrReportFaqReply(locale) {
	const isCn = locale === "zh-CN";
	const base = `/${locale}`;
	const ordersLink = isCn ? `[我的订单](${base}/orders)` : `[我的訂單](${base}/orders)`;
	const contactLink = isCn ? `[联系我们](${base}/customer/contact)` : `[聯絡我們](${base}/customer/contact)`;

	if (isCn) {
		return [
			"收到！如果你说的是「电子/纸本报告没收到」，可以先按这几步排查：",
			"",
			"1) 先确认预计时间：电子版目标 72 小时寄到注册邮箱；纸本约 7 天完成并寄出。",
			"2) 检查垃圾邮件/订阅过滤（Spam/Junk）。",
			"3) 到 " + ordersLink + " 看订单状态，并确认你提交的信息与问题是否已完成。",
			"",
			"若仍超过预计时间或你不确定原因，可以到 " + contactLink + " 留言，我们再帮你确认。",
		].join("\n");
	}

	return [
		"收到！如果你說的是「電子/紙本報告還沒收到」，可以先按這幾步排查：",
		"",
		"1) 先確認預計時間：電子版目標 72 小時寄到註冊信箱；紙本約 7 天完成並寄出。",
		"2) 檢查垃圾郵件/訂閱過濾（Spam/Junk）。",
		"3) 到 " + ordersLink + " 看訂單狀態，並確認你提交的資訊與問題是否已完成。",
		"",
		"若仍超過預計時間或你不確定原因，可以到 " + contactLink + " 留言，我們再幫你確認。",
	].join("\n");
}

export async function POST(request) {
	try {
		const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ success: false, error: "AI not configured" },
				{ status: 503 },
			);
		}

		const body = await request.json();
		const locale = body.locale === "zh-CN" ? "zh-CN" : "zh-TW";
		const siteFactsBlock = getShopAssistantSiteFacts(locale);
		const rawMessages = Array.isArray(body.messages) ? body.messages : [];

		const messages = rawMessages
			.filter(
				(m) =>
					m &&
					(m.role === "user" || m.role === "assistant") &&
					typeof m.content === "string",
			)
			.map((m) => ({
				role: m.role,
				content: m.content.slice(0, 4000),
			}))
			.slice(-MAX_USER_MESSAGES);

		if (messages.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No messages" },
				{ status: 400 },
			);
		}

		const lastUser = [...messages].reverse().find((m) => m.role === "user");
		if (!lastUser) {
			return NextResponse.json(
				{ success: false, error: "No user message" },
				{ status: 400 },
			);
		}

		const genderRaw = body.gender;
		const genderNorm =
			genderRaw === "female" || genderRaw === "女" ? "female" : "male";

		const recentUserBlob = messages
			.filter((m) => m.role === "user")
			.slice(-4)
			.map((m) => m.content)
			.join("\n");

		const birthFromBody =
			(typeof body.birthDateTime === "string" &&
				body.birthDateTime.trim()) ||
			(typeof body.birthday === "string" && body.birthday.trim()) ||
			"";
		const birthFromLastUser = extractBirthDateTimeFromText(lastUser.content);
		const asksUseBirthdayContext =
			/根據.*(生日|生辰|八字|五行)|根据.*(生日|生辰|八字|五行)|沿用.*(生日|生辰)|用.*(生日|八字|五行)|按.*(生日|八字|五行)|我的(生日|生辰|八字|五行)|剛剛.*生日|刚刚.*生日/.test(
				lastUser.content,
			);
		const birthFromRecentIfRequested = asksUseBirthdayContext
			? extractBirthDateTimeFromText(recentUserBlob)
			: null;
		const birthDT = birthFromBody || birthFromLastUser || birthFromRecentIfRequested;

		await dbConnect();
		const allProducts = await Product.find({
			isActive: true,
			productId: { $nin: REPORT_PRODUCT_IDS },
		})
			.sort({ soldCount: -1, isFeatured: -1, updatedAt: -1 })
			.limit(MAX_PRODUCTS_FETCH)
			.select(
				"name tags elementType price category isFeatured soldCount giftReportTypes",
			)
			.lean();

		const isCn = locale === "zh-CN";
		const pagesBase = `/${locale}`;
		const shopBase = `${pagesBase}/shop/product`;
		const langLine = isCn
			? "請使用簡體中文回覆。"
			: "請使用繁體中文回覆。";

		const replyFormatRule = isCn
			? `【回复格式】不要使用粗体标记（不要输出双星号）。勿使用反引号包网址、勿贴裸露路径、勿输出「[订单编号]」等占位字样。请用口语说明步骤；需要导页时仅用带标题的 Markdown 链接，例如 [我的订单](${pagesBase}/orders)、[报告介绍与购买说明](${pagesBase}/report-preview)。`
			: `【回覆格式】不要使用粗體標記（不要輸出雙星號）。勿使用反引號包網址、勿貼裸露路徑（如 /zh-TW/...）、勿輸出「[訂單編號]」等技術佔位字樣。請用口語說明步驟；需要導頁時僅用帶標題的 Markdown 連結，例如 [我的訂單](${pagesBase}/orders)、[報告介紹與購買說明](${pagesBase}/report-preview)。`;

		// —— 1) 有生辰：系統算五行 → 篩商品 → DeepSeek 寫說明（僅供參考）——
		if (birthDT) {
			const wx = computeWuxingBrief(birthDT, genderNorm);
			if (wx.ok && wx.wuxingData) {
				const concernTags = inferConcernTagsFromText(recentUserBlob);

				const ranked = rankProductsForWuxing(
					allProducts,
					wx.weakChinese || [],
					concernTags,
				);
				let picks = ranked.slice(0, 10);
				if (picks.length === 0) picks = allProducts.slice(0, 10);

				const catalog = picks
					.map((p) => productLineCompact(p, locale))
					.join("\n");

				const weakStr = (wx.weakChinese || []).join("、") || "—";
				const colorLine =
					(wx.weakChinese || []).length > 0
						? colorHintsForElements(wx.weakChinese, locale)
						: colorHintsForElements(
								[wx.wuxingData.dayStemWuxing || "木"],
								locale,
							);

				const genderLabel = genderNorm === "female" ? "女" : "男";

				const wuxingFacts = isCn
					? [
							`用户提供的生辰：${birthDT}`,
							`性别：${genderLabel}`,
							`四柱：年${wx.wuxingData.year} 月${wx.wuxingData.month} 日${wx.wuxingData.day} 时${wx.wuxingData.hour}`,
							`五行比例（系统估算）：${wx.wuxingData.wuxingScale}`,
							`相对偏弱的五行（依比例）：${weakStr}`,
							`日主：${wx.wuxingData.dayStem}（${wx.wuxingData.dayStemWuxing}）`,
							`颜色意象（文化参考，非医疗建议）：${colorLine}`,
						].join("\n")
					: [
							`使用者提供生辰：${birthDT}`,
							`性別：${genderLabel}`,
							`四柱：年${wx.wuxingData.year} 月${wx.wuxingData.month} 日${wx.wuxingData.day} 時${wx.wuxingData.hour}`,
							`五行比例（系統估算）：${wx.wuxingData.wuxingScale}`,
							`相對偏弱五行（依比例）：${weakStr}`,
							`日主：${wx.wuxingData.dayStem}（${wx.wuxingData.dayStemWuxing}）`,
							`顏色意象（文化參考，非醫療建議）：${colorLine}`,
						].join("\n");

				const dateOnly = isBirthDateOnlyMessage(lastUser.content);
				if (dateOnly) {
					if (picks.length > 0) {
						const reply = buildDeterministicWuxingShopReply({
							locale,
							shopBase,
							birthDT,
							wx,
							picks,
							concernTags,
						});
						return NextResponse.json({
							success: true,
							reply,
							meta: {
								wuxingPath: true,
								deterministic: true,
								weakChinese: wx.weakChinese,
								concernTags,
								catalogSize: picks.length,
								fastPath: false,
							},
						});
					}
					const replyNoStock = isCn
						? `已读取你的生日 ${birthDT}，五行比例（参考）：${wx.wuxingData.wuxingScale}；相对偏弱：${(wx.weakChinese || []).join("、") || "—"}。目前店里暂无可推荐的上架商品，请稍后再来逛逛～`
						: `已讀取你的生日 ${birthDT}，五行比例（參考）：${wx.wuxingData.wuxingScale}；相對偏弱：${(wx.weakChinese || []).join("、") || "—"}。目前店裡暫無可推薦的上架商品，請稍後再來逛逛～`;
					return NextResponse.json({
						success: true,
						reply: replyNoStock,
						meta: {
							wuxingPath: true,
							deterministic: true,
							noProducts: true,
							fastPath: false,
						},
					});
				}

				const systemContent = `你是「小風」，HarmoniQ 風鈴商城購物助理，語氣溫暖、有同理心。

【格式要求】不要輸出任何「溫馨提醒／僅供文化與娛樂參考／不能替代專業」之類的免責前綴或段落；直接進入分析與建議即可。

【禁止】對話紀錄裡若有一段助理的長篇自我介紹或開場白，請勿重複、抄寫或改寫那段內容；請直接依使用者「最新一則訊息」與下方【命理與五行資訊】作答。

【偏題但仍可聊】若使用者順便問穿搭、心情、生活小事：先用五行／顏色意象合理呼應對方問題，再銜接列表中的飾品建議；不要拒答說自己不懂。

你的任務：
1) 用白話簡述「五行比例」與「相對偏弱」代表什麼（避免絕對化、勿說一定改運）。
2) 說明「顏色意象」如何作為選購水晶／飾品時的參考（文化聯想即可）。
3) 若使用者訊息中有財運／感情／健康等關鍵字，併入同理回應。
4) 只能推薦【可推薦商品】列表內的商品；每件用 1～2 句說明為何「可能」適合（可連結五行、標籤、色系意象），並附 Markdown 連結：[顯示名](${shopBase}/MongoId)，MongoId 须与列表 id 一致。
   若該商品在標籤欄位包含 giftReport（代表含贈送報告），務必強調：購買后會附帶依使用者生日與問題生成的真人顧問更詳盡改善分析，讓使用者覺得「不只是拿到飾品，而是一起拿到對應解讀」。
5) 回覆精簡為主（約 400 字內除非使用者要求更細）。
6) ${langLine}

${siteFactsBlock}

${replyFormatRule}

若使用者問贈送報告、買到後要做什麼、報告何時寄達、與實體商品物流差異、退款／退換／條款：請用上面【站內事實】與當前語系的條款摘要回答；並在提到「贈送報告內容」時，務必強調它會更詳盡地針對用戶提交的問題給出改善方向與逐項分析，不只是簡短回覆。不要只用閒聊或「分享心情」帶過流程。

【命理與五行資訊】
${wuxingFacts}

【可推薦商品】（每行：MongoId|名稱|標籤|element代碼|HKD）
${catalog}`;

				const data = await callDeepSeekAPI(
					[
						{ role: "system", content: systemContent },
						...messages,
					],
					{ temperature: 0.65, max_tokens: 900 },
					apiKey,
				);

				let reply =
					data?.choices?.[0]?.message?.content?.trim() ||
					(isCn
						? "抱歉，我暫時無法回覆，請稍後再試。"
						: "抱歉，我暫時無法回覆，請稍後再試。");
				reply = sanitizeNoBoldStars(reply);
				reply = sanitizeProductLinksToWhitelist(
					reply,
					new Set(picks.map((p) => String(p._id))),
					locale,
				);
				const allowedIdsForBirth = new Set(picks.map((p) => String(p._id)));
				const productByIdForBirth = new Map(
					picks.map((p) => [String(p._id), p]),
				);
				reply = replaceGenericViewLinks(reply, productByIdForBirth, locale);
				reply = capProductLinksToMax(reply, allowedIdsForBirth, locale, 3);
				if (
					countProductLinks(reply) === 0 &&
					wantsProductRecommendation(lastUser.content)
				) {
					const top3 = picks.slice(0, 3);
					const isCn = locale === "zh-CN";
					const lead = isCn
						? "\n\n我也先帮你挑 1～3 款更贴近参考（含链接）：\n"
						: "\n\n我也先幫你挑 1～3 款更貼近參考（含連結）：\n";
					let extra = lead;
					for (const p of top3) {
						const n = productName(p, locale) || (isCn ? "商品" : "商品");
						extra += `- [${n}](${shopBase}/${p._id})\n`;
					}
					reply = sanitizeNoBoldStars(reply + extra);
				}
				reply = appendGiftReportEmphasisIfNeeded(
					reply,
					productByIdForBirth,
					locale,
				);

				return NextResponse.json({
					success: true,
					reply,
					meta: {
						wuxingPath: true,
						weakChinese: wx.weakChinese,
						concernTags,
						catalogSize: picks.length,
						fastPath: false,
					},
				});
			}
			// 生辰無法計算時，繼續走後續邏輯
		}

		// —— 1.5) 非新生日：若聊天前面已出現「相對偏弱五行」，則用它做精準挑款（避免 LLM 漂移）——
		if (!birthDT) {
			const priorWeakChinese = extractPriorWeakChinese(messages);
			const concernTags = inferConcernTagsFromText(lastUser.content);
			// Only apply when user is explicitly asking for a specific aspect (wealth/love/career/health/protection)
			if (priorWeakChinese.length && concernTags.length) {
				const ranked = rankProductsForWuxing(
					allProducts,
					priorWeakChinese,
					concernTags,
				);
				let picks = ranked.slice(0, 3);
				if (picks.length === 0) picks = allProducts.slice(0, 3);

				const weakStr = priorWeakChinese.join("、") || "—";
				const concernLabel = formatConcernTagsForLocale(concernTags, locale);
				let reply = isCn
					? `收到！我先沿用你刚刚的五行参考（相对偏弱：${weakStr}），再把重点放在“${concernLabel}”这个方向，帮你更精确地挑款。\n\n先给你三款我觉得比较贴近的选择：\n\n`
					: `收到！我先沿用你剛剛的五行參考（相對偏弱：${weakStr}），再把重點放在「${concernLabel}」這個方向，幫你更精準地挑款。\n\n先給你三款我覺得比較貼近的選擇：\n\n`;

				const shopBaseLink = shopBase;
				const hasAnyGiftReport = picks.some(
					(p) => Array.isArray(p.giftReportTypes) && p.giftReportTypes.length > 0,
				);
				for (const p of picks) {
					const n = productName(p, locale) || (isCn ? "商品" : "商品");
					const tags = (p.tags || []).join("、") || "—";
					// Make product name itself the link (no separate "查看詳情" button text).
					reply += `- [${n}](${shopBaseLink}/${p._id})（${tags}）· 約 HKD ${p.price}\n`;
				}
				if (hasAnyGiftReport) {
					reply += isCn
						? "\n补充一句：这几款若有标示“赠送报告”，会附带依你的生日与问题，由真人顾问做更详尽的改善分析。"
						: "\n補充一句：這幾款若有標示「贈送報告」，會附帶依你的生日與問題，由真人顧問做更詳盡的改善分析。";
				}

				reply += isCn
					? "\n如果你告诉我预算范围、以及偏好手串/吊坠/摆件，我可以再帮你收窄到 1～3 款更像“必买款”。"
					: "\n如果你告訴我預算範圍、以及偏好手串/吊墜/擺件，我可以再幫你收窄到 1～3 款更像「必買款」。";

				return NextResponse.json({
					success: true,
					reply: sanitizeNoBoldStars(reply),
					meta: {
						wuxingPath: false,
						wxFollowUp: true,
						priorWeakChinese,
						concernTags,
						catalogSize: picks.length,
						fastPath: false,
					},
				});
			}
		}

		// —— 1.8) 站內 FAQ 快速回覆（避免 LLM 胡說/輸出過長）——
		// 這裡先處理「物流/退換/報告沒收到」；若同時命中「贈送報告」，交由後續既有分支處理（優先級更高）。
		if (wantsDeliveryOrTrackingFaq(lastUser.content) && !wantsGiftReportFaq(lastUser.content)) {
			const reply = sanitizeNoBoldStars(buildDeliveryOrTrackingFaqReply(locale));
			return NextResponse.json({
				success: true,
				reply,
				meta: { catalogSize: 0, fastPath: true, wuxingPath: false },
			});
		}
		if (wantsReturnsOrRefundFaq(lastUser.content) && !wantsGiftReportFaq(lastUser.content)) {
			const reply = sanitizeNoBoldStars(buildReturnsRefundFaqReply(locale));
			return NextResponse.json({
				success: true,
				reply,
				meta: { catalogSize: 0, fastPath: true, wuxingPath: false },
			});
		}
		if (wantsMissingEmailOrReportFaq(lastUser.content) && !wantsGiftReportFaq(lastUser.content)) {
			const reply = sanitizeNoBoldStars(buildMissingEmailOrReportFaqReply(locale));
			return NextResponse.json({
				success: true,
				reply,
				meta: { catalogSize: 0, fastPath: true, wuxingPath: false },
			});
		}

		// —— 2) 純列商品快速路徑 ——
		if (wantsProductCatalogOnly(lastUser.content)) {
			const reply = sanitizeNoBoldStars(buildFastCatalogReply(allProducts, locale));
			return NextResponse.json({
				success: true,
				reply,
				meta: { catalogSize: allProducts.length, fastPath: true },
			});
		}

		// —— 2.5) 贈送報告／報告交付 FAQ（避免 LLM 輸出 Markdown 粗體 **）——
		if (wantsGiftReportFaq(lastUser.content)) {
			const reply = sanitizeNoBoldStars(buildGiftReportFaqReply(locale));
			return NextResponse.json({
				success: true,
				reply,
				meta: { catalogSize: 0, fastPath: true, wuxingPath: false },
			});
		}

		// —— 3) 一般對話（精簡目錄）——
		const forLlm = allProducts.slice(0, MAX_CATALOG_FOR_LLM);
		const catalog = forLlm
			.map((p) => productLineCompact(p, locale))
			.join("\n");

		const systemContent = `你是「小風」，HarmoniQ 風鈴商城的購物助理。語氣溫暖、有同理心，像可信賴的朋友；樂意自然閒聊，不必把每句話都變成推銷。

【與購物無關或僅部分相關的問題】（例如：今天穿什麼、穿搭顏色、心情、瑣碎生活請教）
- 先好好回答使用者的題目：給清楚、實用、有條理的建議（可從場合、天氣、舒適、顏色搭配、心情儀式感等一般角度談），不要說「我不太懂所以幫不上」或過度強調自己只會賣東西。
- 收尾再用一到兩句輕鬆帶到店內定位：例如配件／手串／水晶可為整體造型加分、當作穿搭點綴或小儀式感；若對方願意，也可提西曆生日讓站內五行參考協助挑飾品（實際運算由網站程式處理）。
- 若「目前可售商品列表」裡有真的貼題的品項（例如使用者談穿搭收尾就談飾品搭配），可附 1～2 個 Markdown 連結；若沒有特別合適的，不必硬塞連結，溫和邀請對方之後想挑禮物或飾品再找你即可。
- 收尾帶商品時語氣像朋友支招，避免硬推銷。

${siteFactsBlock}

${replyFormatRule}

【報告／物流／售後／條款類問題】若使用者問「買到後報告有什麼」「贈送報告內容」「怎麼拿報告」「多久收到」「實體商品和報告是分開的嗎」「怎麼退換」「跟你們條款寫的一樣嗎」：請先依上方【站內事實】（已含與用戶條款／退換貨頁對齊的摘要）清楚說明，必要時在結尾附上【站內事實】裡的 Markdown 官方連結；說完後若合適，可再一句歡迎對方收到後跟你分享心得。不可只用閒聊式回覆取代上述說明。若問題超出摘要，請請使用者打開對應官方頁面閱讀全文。

規則：
1) 你只能根據下方「目前可售商品列表」介紹或推薦商品，不可捏造列表以外的商品。
2) 若使用者談財運、感情、健康等困擾，先表達理解，可溫和提問（例如想加強哪一方面、預算）；若願意提供西曆生日（可含時間），可說明會依系統五行參考協助挑款（實際計算由網站程式處理）。
3) 命理／風水僅作文化與娛樂參考，不代替醫療、法律、財務等專業建議。
4) 運費、到貨天數、退款截止時間等具體數字與條件請以【站內事實】及條款頁為準，並可附上其中 Markdown 連結；其餘政策請建議查看站內「聯絡我們」「用戶條款」「退換貨政策」；不要編造站內未載明的細節。
5) 推薦商品時請附帶站內連結，格式一律為 Markdown 連結：[商品顯示名](${shopBase}/MongoId)，MongoId 為下列每行最前方 id。
若該商品在標籤欄位包含 giftReport（代表含贈送報告），請務必強調：購買會附帶依使用者生日與問題生成的真人顧問更詳盡分析，讓使用者覺得「值回票價」。
6) 回覆盡量精簡扼要（除非使用者要求詳細）；與購物無關的題也可略長一點，把「先答題、再輕帶商品」說清楚即可。
7) 商品列表每行格式：MongoId|名稱|標籤(逗號分隔)|五行代碼|HKD價格
8) ${langLine}

【目前可售商品列表】
${catalog}`;

		const data = await callDeepSeekAPI(
			[{ role: "system", content: systemContent }, ...messages],
			{
				temperature: 0.7,
				max_tokens: 850,
			},
			apiKey,
		);

		let reply =
			data?.choices?.[0]?.message?.content?.trim() ||
			(isCn
				? "抱歉，我暫時無法回覆，請稍後再試。"
				: "抱歉，我暫時無法回覆，請稍後再試。");
		reply = sanitizeNoBoldStars(reply);
		reply = sanitizeProductLinksToWhitelist(
			reply,
			new Set(forLlm.map((p) => String(p._id))),
			locale,
		);
		const productByIdForLlm = new Map(forLlm.map((p) => [String(p._id), p]));
		reply = replaceGenericViewLinks(reply, productByIdForLlm, locale);
		reply = linkProductNamesInsteadOfViewText(
			reply,
			forLlm,
			locale,
			shopBase,
		);
		const allowedIdsForLlm = new Set(forLlm.map((p) => String(p._id)));
		reply = capProductLinksToMax(reply, allowedIdsForLlm, locale, 3);
		if (countProductLinks(reply) === 0 && wantsProductRecommendation(lastUser.content)) {
			const concernTagsNow = inferConcernTagsFromText(recentUserBlob);
			const ranked = rankProductsForWuxing(allProducts, [], concernTagsNow);
			let picks = ranked.slice(0, 3);
			if (picks.length === 0) picks = allProducts.slice(0, 3);

			const isCn = locale === "zh-CN";
			const lead = isCn
				? "如果你想更快挑到合适的，我先给你 1～3 个参考（含链接）：\n"
				: "如果你想更快挑到合適的，我先給你 1～3 個參考（含連結）：\n";
			let extra = lead;
			for (const p of picks) {
				const n = productName(p, locale) || (isCn ? "商品" : "商品");
				extra += `- [${n}](${shopBase}/${p._id})\n`;
			}
			reply = sanitizeNoBoldStars(reply + "\n" + extra);
			reply = capProductLinksToMax(reply, allowedIdsForLlm, locale, 3);
		}
		const productByIdAll = new Map(
			allProducts.map((p) => [String(p._id), p]),
		);
		reply = appendGiftReportEmphasisIfNeeded(
			reply,
			productByIdAll,
			locale,
		);

		return NextResponse.json({
			success: true,
			reply,
			meta: {
				catalogSize: forLlm.length,
				fastPath: false,
				wuxingPath: false,
			},
		});
	} catch (error) {
		console.error("shop assistant:", error);
		return NextResponse.json(
			{ success: false, error: error.message || "Server error" },
			{ status: 500 },
		);
	}
}
