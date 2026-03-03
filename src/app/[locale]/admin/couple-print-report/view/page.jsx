"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import getWuxingData from "@/lib/nayin";
import CouplePrintCoverPage from "./components/CouplePrintCoverPage";
import CouplePrintPage1 from "./components/CouplePrintPage1";
import CouplePrintProblemSolution from "./components/CouplePrintProblemSolution";
import CouplePrintMingJuLeftMiddle from "./components/CouplePrintMingJuLeftMiddle";
import CouplePrintMingJuRight from "./components/CouplePrintMingJuRight";
import CouplePrintSeason from "./components/CouplePrintSeason";
import CouplePrintCoreSuggestion from "./components/CouplePrintCoreSuggestion";
import CouplePrintSummary from "./components/CouplePrintSummary";
import { parseCoupleCoreSuggestionContent } from "@/lib/coupleCoreSuggestionParse";
import { getConcernColor } from "@/utils/colorTheme";

const COUPLE_COLOR = "#D94075";

// Web-style left-tab prompt so API returns 【日干合盤分析】+ 五行調和方案 + 長期配對策略 (same as CoupleMingJu)
// dayMaster1/dayMaster2 e.g. 己土、丁火 — use so 日月互動 matches page 1 (土命/火命)
function getLeftMingJuPrompt(question, currentYear, isSimplified, dayMaster1, dayMaster2) {
	const dayPair = dayMaster1 && dayMaster2 ? (isSimplified ? `【日主】男方：${dayMaster1}，女方：${dayMaster2}。标题和第一段必须使用此配對，例如【${dayMaster1}${dayMaster2}合盘分析】及「${dayMaster1}配${dayMaster2}」。` : `【日主】男方：${dayMaster1}，女方：${dayMaster2}。標題和第一段必須使用此配對，例如【${dayMaster1}${dayMaster2}合盤分析】及「${dayMaster1}配${dayMaster2}」。`) : "";
	const base = isSimplified
		? `夫妻合盘分析：关注领域：感情，具体问题：${question}，分析年份：${currentYear}。${dayPair}【重要指示】你是专业的八字合盘命理大师，必须提供具体、准确、有说服力的夫妻合盘分析。避免模糊用词，要给出明确的判断和建议。请使用简体中文回应。`
		: `夫妻合盤分析：關注領域：感情，具體問題：${question}，分析年份：${currentYear}。${dayPair}【重要指示】你是專業的八字合盤命理大師，必須提供具體、準確、有說服力的夫妻合盤分析。避免模糊用詞，要給出明確的判斷和建議。請使用繁體中文回應。`;
	const format = isSimplified
		? `

请必须按照以下格式提供夫妻配对特性分析：

【标题格式】
【[男方日干][女方日干]合盘分析】

内容结构：
1. 第一段：[男方日干]配[女方日干]，[格局名称]，赋予[具体优势]；然[具体挑战]。全局需[调和方案]，具体长期配对策略如下：

2. 五行调和方案：
[列出3个具体的五行调和建议，包含方位、物品、时辰等]

3. 长期配对策略：
[针对当年年份的具体建议，包含季节、活动、风水布局等]

4. 最后段落：[深度分析说明双方命理互动关系和注意事项]

请严格按照此格式生成，确保包含所有必要元素。只输出上述格式内容，不要输出八字命盤、日主特性與命局深度解析等其它格式。`
		: `

請必須按照以下格式提供夫妻配對特性分析：

【標題格式】
【[男方日干][女方日干]合盤分析】

內容結構：
1. 第一段：[男方日干]配[女方日干]，[格局名稱]，賦予[具體優勢]；然[具體挑戰]。全局需[調和方案]，具體長期配對策略如下：

2. 五行調和方案：
[列出3個具體的五行調和建議，包含方位、物品、時辰等]

3. 長期配對策略：
[針對當年年份的具體建議，包含季節、活動、風水佈局等]

4. 最後段落：[深度分析說明雙方命理互動關係和注意事項]

請嚴格按照此格式生成，確保包含所有必要元素。只輸出上述格式內容，不要輸出八字命盤、日主特性與命局深度解析等其他格式。`;
	return base + format;
}

// Web-style middle-tab prompt (JSON) for 感情 - same as CoupleMingJu createCoupleAIPrompt middle
// dayMaster1/dayMaster2 e.g. 己土、丁火 — so 合盤核心 日主 matches Page 1
function getMiddleMingJuPrompt(question, currentYear, isSimplified, dayMaster1, dayMaster2) {
	const dayHint =
		dayMaster1 && dayMaster2
			? isSimplified
				? `【日主】男方：${dayMaster1}，女方：${dayMaster2}。分析中必须使用此日主，合盘核心的「主要内容」开头请写「男方为${dayMaster1}命，女方为${dayMaster2}命」。`
				: `【日主】男方：${dayMaster1}，女方：${dayMaster2}。分析中必須使用此日主，合盤核心的「主要内容」開頭請寫「男方為${dayMaster1}命，女方為${dayMaster2}命」。`
			: "";
	const base = isSimplified
		? `夫妻合盘分析：关注领域：感情，具体问题：${question}，分析年份：${currentYear}。${dayHint}必须使用简体中文回应。`
		: `夫妻合盤分析：關注領域：感情，具體問題：${question}，分析年份：${currentYear}。${dayHint}必須使用繁體中文回應。`;
	const jsonFormat = isSimplified
		? `

你必须严格按照以下JSON格式回应，提供夫妻感情合盘的具体分析。只返回纯JSON格式，不要包含任何markdown代码块标记，直接从{开始到}结束：

{
  "合盘核心": {
    "主要内容": "明确指出双方日干配对的核心格局和感情基础",
    "状态列表": ["具体配对强弱", "具体感情互动", "具体吸引力源"],
    "结论": "给出明确的感情配对总体评价"
  },
  "感情之源": {
    "主要分析": "具体分析双方感情宫位配置及相互影响",
    "关键问题": {
      "问题1": { "名称": "具体感情问题名称", "解释": "具体解释" },
      "问题2": { "名称": "另一个具体感情挑战", "解释": "具体解释" }
    }
  },
  "夫妻互动关键": {
    "互动列表": [
      { "方面": "具体互动方面", "特点": "说明和建议" },
      { "方面": "第二个互动方面", "特点": "具体机制" },
      { "方面": "第三个互动方面", "特点": "明确分析" }
    ],
    "格局核心": "用15字内概括夫妻配对的核心优势"
  }
}`
		: `

你必須嚴格按照以下JSON格式回應，提供夫妻感情合盤的具體分析。只返回純JSON格式，不要包含任何markdown代碼塊標記，直接從{開始到}結束：

{
  "合盤核心": {
    "主要内容": "明確指出雙方日干配對的核心格局和感情基礎",
    "状态列表": ["具體配對強弱", "具體感情互動", "具體吸引力源"],
    "结论": "給出明確的感情配對總體評價"
  },
  "感情之源": {
    "主要分析": "具體分析雙方感情宮位配置及相互影響",
    "关键问题": {
      "问题1": { "名称": "具體感情問題名稱", "解释": "具體解釋" },
      "问题2": { "名称": "另一個具體感情挑戰", "解释": "具體解釋" }
    }
  },
  "夫妻互动关键": {
    "互动列表": [
      { "方面": "具體互動方面", "特點": "說明和建議" },
      { "方面": "第二個互動方面", "特點": "具體機制" },
      { "方面": "第三個互動方面", "特點": "明確分析" }
    ],
    "格局核心": "用15字內概括夫妻配對的核心優勢"
  }
}`;
	return base + jsonFormat;
}

function parseBirthTimeToHour(birthTimeStr) {
	if (!birthTimeStr || typeof birthTimeStr !== "string") return "12";
	const match = birthTimeStr.match(/(\d+):00/);
	return match ? match[1].padStart(2, "0") : "12";
}

function CouplePrintReportView() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = useLocale();
	const isSimplified = locale === "zh-CN";

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const name1 = searchParams.get("name1") || "";
	const name2 = searchParams.get("name2") || "";
	const gender1 = searchParams.get("gender1") || "male";
	const gender2 = searchParams.get("gender2") || "female";
	const birthday1 = searchParams.get("birthday1") || "";
	const birthday2 = searchParams.get("birthday2") || "";
	const birthTime1 = searchParams.get("birthTime1") || "";
	const birthTime2 = searchParams.get("birthTime2") || "";
	const productName = searchParams.get("productName") || "梨花木鑰匙珠砂掛墜";
	const question = searchParams.get("question") || "感情關係和諧改善建議";

	const [annualData, setAnnualData] = useState(null);
	const [mingJuLeft, setMingJuLeft] = useState(null);
	const [mingJuMiddle, setMingJuMiddle] = useState(null);
	const [mingJuRight, setMingJuRight] = useState(null);
	const [seasonData, setSeasonData] = useState(null);
	const [coreSuggestionParsedData, setCoreSuggestionParsedData] = useState(null);
	const [overallSummaryData, setOverallSummaryData] = useState(null);
	const [problemSolutionData, setProblemSolutionData] = useState(null);
	const [problemSubsections, setProblemSubsections] = useState(null); // chartDiagnosis, emergencyFengShui, restartChemistry for 感情降溫類
	const [wuxing1, setWuxing1] = useState(null);
	const [wuxing2, setWuxing2] = useState(null);
	const [page1AnnualResult, setPage1AnnualResult] = useState(null);
	const [individual1Data, setIndividual1Data] = useState(null);
	const [individual2Data, setIndividual2Data] = useState(null);

	const hour1 = parseBirthTimeToHour(birthTime1);
	const hour2 = parseBirthTimeToHour(birthTime2);
	const birthDateTime1 = `${birthday1} ${hour1}:00`;
	const birthDateTime2 = `${birthday2} ${hour2}:00`;

	useEffect(() => {
		const load = async () => {
			if (!birthday1 || !birthday2 || !birthTime1 || !birthTime2) {
				setError("缺少生日或時辰");
				setLoading(false);
				return;
			}

			const user1Info = {
				birthday: birthDateTime1,
				gender: gender1,
				name: name1 || (isSimplified ? "男方" : "男方"),
			};
			const user2Info = {
				birthday: birthDateTime2,
				gender: gender2,
				name: name2 || (isSimplified ? "女方" : "女方"),
			};

			const seasonInfo = (() => {
				const m = new Date().getMonth() + 1;
				if (m >= 2 && m <= 4) return { currentMonth: m, currentSeason: "春季", relevantSeasons: ["春季", "夏季", "秋季", "冬季"] };
				if (m >= 5 && m <= 7) return { currentMonth: m, currentSeason: "夏季", relevantSeasons: ["夏季", "秋季", "冬季", "春季"] };
				if (m >= 8 && m <= 10) return { currentMonth: m, currentSeason: "秋季", relevantSeasons: ["秋季", "冬季", "春季", "夏季"] };
				return { currentMonth: m, currentSeason: "冬季", relevantSeasons: ["冬季", "春季", "夏季", "秋季"] };
			})();

			const currentYear = new Date().getFullYear();

			try {
				setLoading(true);
				setError(null);

				const wuxing1 = getWuxingData(birthDateTime1, gender1);
				const wuxing2 = getWuxingData(birthDateTime2, gender2);
				const user1Element = wuxing1?.dayStemWuxing || "木";
				const user2Element = wuxing2?.dayStemWuxing || "火";

				const [annualRes, mingJuLeftRes, mingJuMiddleRes, mingJuRightRes, seasonRes, coreRes] = await Promise.all([
					fetch("/api/couple-annual-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user1Birthday: birthDateTime1,
							user2Birthday: birthDateTime2,
							user1Element,
							user2Element,
							currentYear,
							nextYear: currentYear + 1,
							currentMonth: seasonInfo.currentMonth,
							compatibilityData: {},
							isSimplified,
						}),
					}).then((r) => r.json()),
					fetch("/api/couple-mingju-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user1Birthday: birthDateTime1,
							user2Birthday: birthDateTime2,
							user1Name: user1Info.name,
							user2Name: user2Info.name,
							concern: "感情",
							problem: question,
							currentYear,
							analysisType: "left",
							prompt: getLeftMingJuPrompt(
								question,
								currentYear,
								isSimplified,
								wuxing1?.dayStem && wuxing1?.dayStemWuxing ? wuxing1.dayStem + wuxing1.dayStemWuxing : null,
								wuxing2?.dayStem && wuxing2?.dayStemWuxing ? wuxing2.dayStem + wuxing2.dayStemWuxing : null,
							),
							isSimplified,
						}),
					}).then((r) => r.json()),
					fetch("/api/couple-mingju-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user1Birthday: birthDateTime1,
							user2Birthday: birthDateTime2,
							user1Name: user1Info.name,
							user2Name: user2Info.name,
							concern: "感情",
							problem: question,
							currentYear,
							analysisType: "middle",
							prompt: getMiddleMingJuPrompt(
								question,
								currentYear,
								isSimplified,
								wuxing1?.dayStem && wuxing1?.dayStemWuxing ? wuxing1.dayStem + wuxing1.dayStemWuxing : null,
								wuxing2?.dayStem && wuxing2?.dayStemWuxing ? wuxing2.dayStem + wuxing2.dayStemWuxing : null,
							),
							isSimplified,
						}),
					}).then((r) => r.json()),
					fetch("/api/couple-mingju-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user1Birthday: birthDateTime1,
							user2Birthday: birthDateTime2,
							user1Name: user1Info.name,
							user2Name: user2Info.name,
							concern: "感情",
							problem: question,
							currentYear,
							analysisType: "right",
							prompt: isSimplified
								? `夫妻合盤分析，關注領域：感情，具體問題：${question}，分析年份：${currentYear}。請提供感情調候策略的具體建議，必須按照以下JSON格式。只返回純JSON，不要markdown。{"调候核心":{"五行调节":"明確指出雙方需要的具體五行調節方案","调候重点":"具體說明調候的重點時機和方法"},"实用建议":{"日常调和":["建議1","建議2","建議3"],"时机把握":["時機1","時機2"]},"长期策略":{"感情发展":"具體的長期感情發展策略","关键节点":"感情發展的關鍵節點和注意事項"}}`
								: `請全程使用繁體中文撰寫所有內容（JSON 內文字也須為繁體）。夫妻合盤分析，關注領域：感情，具體問題：${question}，分析年份：${currentYear}。請提供感情調候策略的具體建議，必須按照以下 JSON 格式。只返回純 JSON，不要 markdown。{"调候核心":{"五行调节":"明確指出雙方需要的具體五行調節方案","调候重点":"具體說明調候的重點時機和方法"},"实用建议":{"日常调和":["建議1","建議2","建議3"],"时机把握":["時機1","時機2"]},"长期策略":{"感情发展":"具體的長期感情發展策略","关键节点":"感情發展的關鍵節點和注意事項"}}`,
							isSimplified,
						}),
					}).then((r) => r.json()),
					fetch("/api/couple-season-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user1Info,
							user2Info,
							currentYear,
							currentDate: seasonInfo,
							concern: "感情",
							isSimplified,
						}),
					}).then((r) => r.json()),
					fetch("/api/couple-core-suggestion-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user1Info,
							user2Info,
							currentYear,
							concern: "感情",
							isSimplified,
						}),
					}).then((r) => r.json()),
				]);

				setWuxing1(wuxing1);
				setWuxing2(wuxing2);
				const u1El = wuxing1?.dayStemWuxing || "木";
				const u2El = wuxing2?.dayStemWuxing || "火";
				const compatMatrix = { 金: { 金: 70, 木: 40, 水: 85, 火: 35, 土: 80 }, 木: { 金: 40, 木: 75, 水: 80, 火: 85, 土: 45 }, 水: { 金: 85, 木: 80, 水: 70, 火: 30, 土: 50 }, 火: { 金: 35, 木: 85, 水: 30, 火: 75, 土: 80 }, 土: { 金: 80, 木: 45, 水: 50, 火: 80, 土: 70 } };
				const compatScore = compatMatrix[u1El]?.[u2El] ?? 60;
				const compatLevel = compatScore >= 80 ? "優秀配對" : compatScore >= 70 ? "良好配對" : compatScore >= 60 ? "穩定配對" : "需要努力";
				const genCycle = { 金: "水", 水: "木", 木: "火", 火: "土", 土: "金" };
				const destCycle = { 金: "木", 木: "土", 土: "水", 水: "火", 火: "金" };
				const balanceText =
					genCycle[u1El] === u2El || genCycle[u2El] === u1El
						? "五行相生，關係和諧平衡"
						: destCycle[u1El] === u2El || destCycle[u2El] === u1El
							? "五行相剋，需要調和平衡"
							: "五行平和，關係穩定";
				const allEl = ["金", "木", "水", "火", "土"];
				const present = [u1El, u2El];
				const missingEl = allEl.filter((e) => !present.includes(e));
				const missingText =
					missingEl.length > 0 ? `建議增強${missingEl.join("、")}元素來完善五行平衡` : "五行元素齊全，建議保持平衡";
				setPage1AnnualResult({
					compatibility: { score: compatScore, level: compatLevel, description: "基於八字基礎分析的配對評估" },
					user1Analysis: { dominantElement: u1El, elementType: ({ 金: "金命", 木: "木命", 水: "水命", 火: "火命", 土: "土命" })[u1El] || "木命" },
					user2Analysis: { dominantElement: u2El, elementType: ({ 金: "金命", 木: "木命", 水: "水命", 火: "火命", 土: "土命" })[u2El] || "火命" },
					elementInteraction: {
						balance: balanceText,
						missing: missingText,
						advice: `${u1El}命與${u2El}命的配對，建議在日常生活中注重五行調和，增進相互理解`,
					},
					annualStrategy: annualRes.annualStrategy || null,
				});

				if (annualRes.annualStrategy) setAnnualData(annualRes.annualStrategy);
				if (mingJuLeftRes.analysis) setMingJuLeft(mingJuLeftRes.analysis);
				if (mingJuMiddleRes.analysis) setMingJuMiddle(mingJuMiddleRes.analysis);
				if (mingJuRightRes.analysis) setMingJuRight(mingJuRightRes.analysis);
				if (seasonRes.success && seasonRes.analysis?.parsed?.seasons) {
					const seasons = seasonRes.analysis.parsed.seasons.map((s) => ({
						name: s.name?.replace(/【[^】]*】/, "") || s.name,
						badge: s.period || "",
						timeRange: "",
						content: s.content || "",
						color: s.name?.includes("春") ? "#10B981" : s.name?.includes("夏") ? "#DC2626" : s.name?.includes("秋") ? "#F59E0B" : "#3B82F6",
					}));
					setSeasonData({ seasons, concern: "感情", color: COUPLE_COLOR });
				}
				if (coreRes.success && coreRes.analysis?.content) {
					const parsed = parseCoupleCoreSuggestionContent(coreRes.analysis.content);
					setCoreSuggestionParsedData({
						...parsed,
						color: COUPLE_COLOR,
					});
				}

				const overallPayload = {
					locale: locale === "zh-CN" ? "zh-CN" : "zh-TW",
					concernType: "感情",
					coupleCoreSuggestionData: coreRes.analysis?.content || "",
					coupleAnnualData: annualRes.annualStrategy || null,
					coupleSeasonData: seasonRes.analysis?.content || null,
					coupleSpecificData: mingJuLeftRes.analysis || null,
					user1Info,
					user2Info,
				};
				const overallRes = await fetch("/api/couple-overall-summary", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(overallPayload),
				}).then((r) => r.json());
				if (overallRes.data) setOverallSummaryData(overallRes.data);

				const femaleUser = gender1 === "female" ? { birthDateTime: birthDateTime1, gender: "female", name: name1 } : { birthDateTime: birthDateTime2, gender: "female", name: name2 };
				const maleUser = gender1 === "male" ? { birthDateTime: birthDateTime1, gender: "male", name: name1 } : { birthDateTime: birthDateTime2, gender: "male", name: name2 };
				const problemRes = await fetch("/api/couple-specific-problem-analysis", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						femaleUser,
						maleUser,
						specificProblem: question,
						isSimplified,
					}),
				}).then((r) => r.json());
				if (problemRes.female && problemRes.male) {
					setProblemSolutionData({
						question,
						female: problemRes.female,
						male: problemRes.male,
						raw: problemRes.rawResponse || "",
					});
					// 感情降溫類: fetch same subsection content as web (盤面診斷、風水急救、重啟默契)
					const isEmotionCooling = (function categorize(q) {
						if (!q || typeof q !== "string") return false;
						const p = q.trim().toLowerCase();
						if (/冷戰|降溫|疏遠|冷淡|感情淡|不理我/.test(p)) return true;
						if (/異地|長距離|工作|家庭|父母|環境|壓力/.test(p)) return false;
						if (/朋友/.test(p) && !/男朋友|女朋友/.test(p)) return false;
						if (/說錯話|話術|溝通|誤會|爭吵|口角|吵架|禁忌/.test(p)) return false;
						return true; // default 感情降溫類
					})(question);
					if (isEmotionCooling && question) {
						const analysisData = { female: problemRes.female, male: problemRes.male };
						const payloadChart = { femaleUser, maleUser, requestType: "chart_diagnosis", isSimplified };
						const payloadFengShui = { femaleUser: { ...femaleUser, birthDate: femaleUser.birthDateTime }, maleUser: { ...maleUser, birthDate: maleUser.birthDateTime }, femaleBazi: problemRes.female?.bazi, maleBazi: problemRes.male?.bazi, femalePillars: problemRes.female?.pillars, malePillars: problemRes.male?.pillars, requestType: "emergency_feng_shui", isSimplified };
						const payloadChemistry = { femaleUser: { ...femaleUser, birthDate: femaleUser.birthDateTime }, maleUser: { ...maleUser, birthDate: maleUser.birthDateTime }, femaleBazi: problemRes.female?.bazi, maleBazi: problemRes.male?.bazi, femalePillars: problemRes.female?.pillars, malePillars: problemRes.male?.pillars, requestType: "restart_chemistry", isSimplified };
						try {
							const [chartRes, fengRes, chemRes] = await Promise.all([
								fetch("/api/chart-diagnosis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadChart) }).then((r) => r.ok ? r.json() : null),
								fetch("/api/emergency-feng-shui", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadFengShui) }).then((r) => r.ok ? r.json() : null),
								fetch("/api/restart-chemistry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadChemistry) }).then((r) => r.ok ? r.json() : null),
							]);
							setProblemSubsections({
								chartDiagnosis: chartRes?.female ? chartRes : null,
								emergencyFengShui: fengRes?.recommendations ? fengRes : null,
								restartChemistry: chemRes?.iceBreakers ? chemRes : null,
							});
						} catch (e) {
							console.warn("Problem subsections fetch failed:", e);
							setProblemSubsections(null);
						}
					} else {
						setProblemSubsections(null);
					}
				}

				// Fetch individual analysis for both users (same as CoupleAnnualAnalysis IndividualAnalysisSection)
				const individualQuestion = isSimplified
					? `請以專業、結構化的方式分析此人的八字特性，包含：1. 性格特性 2. 主要優勢（感情關係中的3個個人優勢）3. 發展建議（3個具體感情發展建議）。請使用簡體中文。`
					: `請以專業、結構化的方式分析此人的八字特性，包含：1. 性格特性 2. 主要優勢（感情關係中的3個個人優勢）3. 發展建議（3個具體感情發展建議）。請使用繁體中文。`;
				try {
					const [ind1, ind2] = await Promise.all([
						fetch("/api/individual-analysis", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								birthDateTime: birthDateTime1,
								dominantElement: wuxing1?.dayStemWuxing || "木",
								category: "感情",
								specificQuestion: individualQuestion,
								gender: gender1 === "male" ? "男" : "女",
							}),
						}).then((r) => r.json()).catch(() => ({ success: false })),
						fetch("/api/individual-analysis", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								birthDateTime: birthDateTime2,
								dominantElement: wuxing2?.dayStemWuxing || "火",
								category: "感情",
								specificQuestion: individualQuestion,
								gender: gender2 === "male" ? "男" : "女",
							}),
						}).then((r) => r.json()).catch(() => ({ success: false })),
					]);
					setIndividual1Data({
						aiAnalysis: (ind1.success && ind1.aiAnalysis) ? ind1.aiAnalysis : `第一人（${gender1 === "male" ? "男方" : "女方"}）\n生辰：${birthDateTime1}\n\n個人分析暫時無法載入，請稍後重試或於網頁版查看完整內容。`,
						gender: gender1 === "male" ? "男方" : "女方",
						baziData: ind1.success && ind1.baziData ? ind1.baziData : null,
					});
					setIndividual2Data({
						aiAnalysis: (ind2.success && ind2.aiAnalysis) ? ind2.aiAnalysis : `第二人（${gender2 === "male" ? "男方" : "女方"}）\n生辰：${birthDateTime2}\n\n個人分析暫時無法載入，請稍後重試或於網頁版查看完整內容。`,
						gender: gender2 === "male" ? "男方" : "女方",
						baziData: ind2.success && ind2.baziData ? ind2.baziData : null,
					});
				} catch (e) {
					console.warn("Individual analysis fetch failed:", e);
					setIndividual1Data({
						aiAnalysis: `第一人（${gender1 === "male" ? "男方" : "女方"}）\n生辰：${birthDateTime1}\n\n個人分析暫時無法載入。`,
						gender: gender1 === "male" ? "男方" : "女方",
						baziData: null,
					});
					setIndividual2Data({
						aiAnalysis: `第二人（${gender2 === "male" ? "男方" : "女方"}）\n生辰：${birthDateTime2}\n\n個人分析暫時無法載入。`,
						gender: gender2 === "male" ? "男方" : "女方",
						baziData: null,
					});
				}
			} catch (err) {
				console.error("Couple print report load error:", err);
				setError(err.message || "載入失敗");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [birthday1, birthday2, birthTime1, birthTime2, gender1, gender2, question, locale, isSimplified]);

	useEffect(() => {
		document.body.classList.add("print-report-view");
		return () => document.body.classList.remove("print-report-view");
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-12 h-12 mx-auto mb-4 border-b-2 border-gray-900 rounded-full animate-spin" />
					<p>生成報告中...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 text-center">
				<p className="text-red-600 mb-4">{error}</p>
				<button
					onClick={() => router.back()}
					className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
				>
					返回
				</button>
			</div>
		);
	}

	const concern = "感情";
	const color = getConcernColor(concern);

	return (
		<>
			<div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full p-4 bg-white shadow-md no-print">
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.back()}
						className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
					>
						返回
					</button>
					<h1 className="text-xl font-bold">姻緣合盤報告 - 預覽模式</h1>
				</div>
				<button
					onClick={() => window.print()}
					className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
				>
					列印報告
				</button>
			</div>

			<CouplePrintCoverPage
				productName={productName}
				compatibility={page1AnnualResult?.compatibility}
				user1Analysis={page1AnnualResult?.user1Analysis}
				user2Analysis={page1AnnualResult?.user2Analysis}
				elementInteraction={page1AnnualResult?.elementInteraction}
				wuxing1={wuxing1}
				wuxing2={wuxing2}
				gender1={gender1}
				gender2={gender2}
				annualStrategy={page1AnnualResult?.annualStrategy}
			/>

			<CouplePrintPage1
				name1={name1}
				name2={name2}
				birthday1={birthday1}
				birthday2={birthday2}
				birthTime1={birthTime1}
				birthTime2={birthTime2}
				question={question}
				wuxing1={wuxing1}
				wuxing2={wuxing2}
				annualResult={page1AnnualResult}
				individual1Data={individual1Data}
				individual2Data={individual2Data}
				birthDateTime1={birthDateTime1}
				birthDateTime2={birthDateTime2}
			/>

			{/* Page 3: 命局分析（一）— left (日月互動) + middle (夫妻宮寅未暗合) combined, same format as web */}
			{(mingJuLeft || mingJuMiddle) && (
				<CouplePrintMingJuLeftMiddle leftContent={mingJuLeft} middleContent={mingJuMiddle} />
			)}
			{/* Page 4: 命局分析（二）— right (五行氣機修補) only, same format as web */}
			{mingJuRight && <CouplePrintMingJuRight rightContent={mingJuRight} />}

			{seasonData?.seasons?.length > 0 && (
				<CouplePrintSeason data={seasonData} />
			)}

			{coreSuggestionParsedData && (
				<CouplePrintCoreSuggestion data={coreSuggestionParsedData} />
			)}

			{overallSummaryData && (
				<CouplePrintSummary
					data={{
						summary: overallSummaryData,
						concern,
						color,
					}}
				/>
			)}

			{problemSolutionData && (
				<CouplePrintProblemSolution data={problemSolutionData} subsections={problemSubsections} />
			)}

			<style jsx global>{`
				@media print {
					.no-print {
						display: none !important;
					}
					body {
						print-color-adjust: exact;
						-webkit-print-color-adjust: exact;
						margin: 0;
						padding: 0;
						background: white;
					}
					body > div {
						margin: 0 !important;
						padding: 0 !important;
						background: white !important;
					}
					.page-break {
						page-break-after: always;
						page-break-inside: avoid;
						width: 210mm !important;
						height: 297mm !important;
						max-height: 297mm !important;
						overflow: hidden !important;
						box-sizing: border-box;
						padding: 15mm 20mm !important;
						margin: 0 !important;
						box-shadow: none !important;
						border: none !important;
					}
					.page-break:last-child {
						page-break-after: auto;
					}
					@page {
						size: A4;
						margin: 0;
					}
				}
				@media screen {
					.page-break {
						width: 210mm;
						min-height: 297mm;
						max-height: 297mm;
						overflow: hidden;
						box-sizing: border-box;
						margin: 0 auto 20px;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						border: 1px solid #d1d5db;
						position: relative;
					}
				}
			`}</style>
		</>
	);
}

export default function CouplePrintReportViewPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CouplePrintReportView />
		</Suspense>
	);
}
