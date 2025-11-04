"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ComponentErrorBoundary } from "./ErrorHandling";
import { getConcernColor } from "../utils/colorTheme";
import getWuxingData from "../lib/nayin";
import { convertByRegion } from "@/utils/chineseConverter";

// Helper functions to map stems and branches to their elements
const getStemElement = (stem) => {
	const stemElements = {
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
	return stemElements[stem] || "木";
};

const getBranchElement = (branch) => {
	const branchElements = {
		子: "水",
		丑: "土",
		寅: "木",
		卯: "木",
		辰: "土",
		巳: "火",
		午: "火",
		未: "土",
		申: "金",
		酉: "金",
		戌: "土",
		亥: "水",
	};
	return branchElements[branch] || "火";
};

// Helper function to determine the relationship between two stems/branches (simplified)
const getRelationship = (stem1, stem2) => {
	// This is a simplified version - in real application would use proper 十神 calculation
	if (stem1 === stem2) return "比肩";
	// Add more sophisticated relationship calculation here based on 五行 theory
	return "相互作用";
};

// Helper function to get ten god relationship (simplified)
const getTenGodRelation = (flowStem, dayMaster) => {
	// Simplified ten god calculation - in real app would use proper 十神 rules
	if (flowStem === dayMaster) return "比肩";
	if (flowStem === "乙" && dayMaster === "己") return "七殺"; // 乙木克己土
	if (flowStem === "巳" && dayMaster === "己") return "傷官"; // 巳火被己土所生
	// Add more sophisticated calculations here
	return "待分析";
};

// Helper function to get yearly stems and branches
const getYearlyStems = (year) => {
	const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
	const branches = [
		"子",
		"丑",
		"寅",
		"卯",
		"辰",
		"巳",
		"午",
		"未",
		"申",
		"酉",
		"戌",
		"亥",
	];
	const stemIndex = (year - 4) % 10;
	const branchIndex = (year - 4) % 12;
	return { stem: stems[stemIndex], branch: branches[branchIndex] };
};

// Helper function to generate concern-specific fallback content
const getConcernSpecificContent = (
	concern,
	yearStem,
	yearBranch,
	userLocale = "zh-TW"
) => {
	// Get region for conversion
	const region = userLocale === "zh-CN" ? "china" : userLocale;

	const contentMap = {
		健康: {
			risks: convertByRegion(
				`健康方面需特別注意：${yearStem}${getStemElement(yearStem)}年易有情緒波動影響睡眠品質，${yearBranch}${getBranchElement(yearBranch)}沖擊可能導致消化系統敏感。建議定期健檢，注意作息規律。`,
				region
			),
			suggestions: convertByRegion(
				`健康養生建議：適合進行溫和運動如瑜伽、太極，多攝取應季蔬果。避免過度勞累，保持心境平和。可考慮中醫調理體質，增強免疫力。`,
				region
			),
			conclusion: convertByRegion(
				`2025年健康運勢整體穩定，但需注意防範小病痛累積。${yearStem}${yearBranch}年適合建立長期健康習慣，重視預防勝於治療，身心靈平衡發展將帶來良好體質基礎。`,
				region
			),
		},
		事業: {
			risks: convertByRegion(
				`事業發展風險：${yearStem}${getStemElement(yearStem)}年容易遇到決策分歧或合作夥伴意見不合，${yearBranch}${getBranchElement(yearBranch)}的變動能量可能帶來職場環境變化。需謹慎處理人際關係。`,
				region
			),
			suggestions: convertByRegion(
				`事業發展建議：適合主動學習新技能，建立專業優勢。把握${yearStem}年的機會拓展業務網絡，但避免過度擴張。穩紮穩打，注重品質勝過速度。`,
				region
			),
			conclusion: convertByRegion(
				`2025年事業運勢有突破機會，${yearStem}${yearBranch}年帶來新的發展契機。適合轉型升級或開拓新領域，但需平衡理想與現實，謹慎評估風險後再行動。`,
				region
			),
		},
		財運: {
			risks: convertByRegion(
				`財運風險提醒：${yearStem}${getStemElement(yearStem)}年易有衝動消費傾向，投資方面需避免跟風操作。${yearBranch}${getBranchElement(yearBranch)}的能量變化可能影響收入穩定性，需做好財務規劃。`,
				region
			),
			suggestions: convertByRegion(
				`財運提升建議：適合穩健投資策略，分散風險。增加技能投資自己，提升賺錢能力。記帳理財，控制不必要支出。可考慮長期儲蓄計劃。`,
				region
			),
			conclusion: convertByRegion(
				`2025年財運機會與挑戰並存，${yearStem}${yearBranch}年適合重新檢視財務狀況。通過學習理財知識和謹慎投資，有望建立更穩固的財富基礎。`,
				region
			),
		},
		感情: {
			risks: convertByRegion(
				`感情風險警示：${yearStem}${getStemElement(yearStem)}年容易因溝通不當引發誤會，${yearBranch}${getBranchElement(yearBranch)}的變動可能帶來感情考驗。單身者需避免過於挑剔，已婚者需注意包容理解。`,
				region
			),
			suggestions: convertByRegion(
				`感情經營建議：多關注伴侶的感受，增加互動時間。單身者可通過朋友介紹或參加社交活動認識合適對象。重視溝通技巧，學會表達和傾聽。`,
				region
			),
			conclusion: convertByRegion(
				`2025年感情運勢需要用心經營，${yearStem}${yearBranch}年帶來感情新機會。無論單身或有伴，都適合反思感情模式，提升情商，建立更成熟穩定的感情關係。`,
				region
			),
		},
	};

	// Support both simplified and traditional Chinese characters
	const supportedConcern =
		concern === "事业" ? "事業" : concern === "财运" ? "財運" : concern;
	return contentMap[supportedConcern] || contentMap["事業"];
};

export default function GanZhi({ userInfo, currentYear = 2025 }) {
	const locale = useLocale();
	const t = useTranslations("fengShuiReport.components.ganZhi");
	const [analysisData, setAnalysisData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeSection, setActiveSection] = useState("tianGan"); // Will be set dynamically

	// Helper to convert text based on locale
	const convertText = (text) => {
		const region = locale === "zh-CN" ? "china" : locale;
		return convertByRegion(text, region);
	};

	// Generate AI analysis based on user's birth info and current year
	const generateGanZhiAnalysis = (userInfo, year) => {
		const concern = userInfo?.concern || "事業";
		const problem = userInfo?.problem || "";
		const birthday = userInfo?.birthDateTime || "";
		const gender = userInfo?.gender || "male";

		// Calculate actual birth chart using the same system as other components
		let actualBaziData = null;
		let dayMaster = "丙"; // fallback
		let dayMasterElement = "火"; // fallback
		let fourPillars = null;

		try {
			// Calculate actual birth chart using imported getWuxingData
			if (birthday) {
				actualBaziData = getWuxingData(birthday, gender);
				dayMaster = actualBaziData.dayStem;
				dayMasterElement = actualBaziData.dayStemWuxing;
				fourPillars = {
					year: {
						stem: actualBaziData.yearStem,
						branch: actualBaziData.yearBranch,
					},
					month: {
						stem: actualBaziData.monthStem,
						branch: actualBaziData.monthBranch,
					},
					day: {
						stem: actualBaziData.dayStem,
						branch: actualBaziData.dayBranch,
					},
					hour: {
						stem: actualBaziData.hourStem,
						branch: actualBaziData.hourBranch,
					},
				};
				console.log("🎯 GanZhi calculated actual birth chart:", {
					dayMaster: dayMaster + dayMasterElement,
					fourPillars: `${fourPillars.year.stem}${fourPillars.year.branch}年 ${fourPillars.month.stem}${fourPillars.month.branch}月 ${fourPillars.day.stem}${fourPillars.day.branch}日 ${fourPillars.hour.stem}${fourPillars.hour.branch}時`,
				});
			}
		} catch (error) {
			console.error("❌ Failed to calculate actual birth chart:", error);
		}

		const prompt = `
角色设定：「你是一位资深八字命理师，精通事业格局与流年互动。请严格按以下结构生成报告，所有【】标题必须原文保留，专业术语需精确对应十神生克关系。」

客户资料：${birthday}出生，${gender === "male" ? "男性" : "女性"}，关注领域：${concern}
日主信息：${dayMaster}${dayMasterElement}日主
四柱信息：${fourPillars ? `${fourPillars.year.stem}${fourPillars.year.branch}年 ${fourPillars.month.stem}${fourPillars.month.branch}月 ${fourPillars.day.stem}${fourPillars.day.branch}日 ${fourPillars.hour.stem}${fourPillars.hour.branch}時` : "四柱待计算"}
具体问题：${problem}
当前年份：${year}年

生成规则：
1. 结构强制：依序输出7大模块，不可删改标题或调整顺序
2. 术语规范：
   - 刑冲合害需标注符号（如「寅巳刑」「未戌刑」）
   - 十神属性必须基于${dayMaster}${dayMasterElement}日主精确计算（如针对${dayMaster}日主，分析乙木、巳火等的十神关系）
   - 格局命名需含五行矛盾（例：「火炎土燥」「焦土熔金」）
3. 流年关键词：固定输出3个四字词＋破折号解释
4. 变量替换：方括号 [ ] 内为可替换字段，保持其他文字不变

【${year}流年詳解】
1.【流年干支作用】 - 分析${year}年乙巳如何与${dayMaster}${dayMasterElement}日主的原局互动
2.【流年天干乙木/地支巳火各自對${dayMaster}日主觸發的三重效應】  
3.【白話版實際表現】

重要：所有十神关系必须基于实际日主${dayMaster}${dayMasterElement}计算，不可使用其他日主的关系。

请根据客户的具体关注领域${concern}和问题"${problem}"，调整分析重点和建议方向。
`;

		// Generate content based on user's specific concern and actual birth data

		const yearGanZhi = getYearlyStems(year);
		const currentStem = yearGanZhi.stem;
		const currentBranch = yearGanZhi.branch;

		// Dynamic content based on user's concern
		const concernBasedAnalysis = {
			事業: {
				focus: "事業發展、職場競爭、創業機遇",
				risks: "合夥糾紛、職場人事、項目變動",
				advice: "穩固職業基礎、避免冒進擴張",
			},
			財運: {
				focus: "投資理財、收入變化、財富積累",
				risks: "投資虧損、破財風險、資金周轉",
				advice: "保守理財、避免高風險投資",
			},
			感情: {
				focus: "感情發展、婚戀機遇、人際關係",
				risks: "感情糾紛、第三者介入、關係破裂",
				advice: "理性溝通、避免感情衝動",
			},
			健康: {
				focus: "身體狀況、疾病預防、養生調理",
				risks: "健康問題、意外傷害、情緒波動",
				advice: "注重養生、定期檢查、情緒管理",
			},
			學業: {
				focus: "學習進展、考試運勢、技能提升",
				risks: "學習障礙、考試失利、專注力不足",
				advice: "穩扎穩打、系統學習、避免急躁",
			},
		};

		const analysis =
			concernBasedAnalysis[concern] || concernBasedAnalysis["事業"];

		// Generate dynamic description based on actual birth chart
		const flowYearDescription = actualBaziData
			? `針對${concern}領域的專業分析：${year}年乙巳流年與您的${dayMaster}${dayMasterElement}日主形成特定互动格局。天干乙木對${dayMaster}日主的作用，地支巳火對您日支${fourPillars.day.branch}${actualBaziData.dayBranchWuxing}的影響，都需要結合您的完整四柱（${fourPillars.year.stem}${fourPillars.year.branch}年 ${fourPillars.month.stem}${fourPillars.month.branch}月 ${fourPillars.day.stem}${fourPillars.day.branch}日 ${fourPillars.hour.stem}${fourPillars.hour.branch}時）進行分析。流年作用重點在於如何調和${dayMasterElement}與流年五行的關係，預防可能的${analysis.risks}，並把握${analysis.focus}的發展機會。`
			: `針對${concern}領域的專業分析：如同一陣東風來襲（${currentStem}木），引發各種變動，易生異動。流年作用重點在調和機緣，否則五行失調，導致${analysis.risks}。整體而言，此年干支提升${analysis.focus}的關注度，適合${analysis.advice}，惟需謹慎應對各種挑戰。`;

		return {
			title: `${year}年流年詳解`,
			description: flowYearDescription,
			actualBaziData: actualBaziData, // Pass the real birth chart data
			dayMaster: dayMaster,
			dayMasterElement: dayMasterElement,

			sections: {
				[`天干${currentStem}${getStemElement(currentStem)}-正印`]: {
					title: `天干${currentStem}${getStemElement(currentStem)}觸發三重效應`,
					subtitle: `天干${currentStem}${getStemElement(currentStem)}（正印）三重效應`,
					badges: [
						{
							text: "生身助劫",
							color: "bg-green-100 text-green-700",
						},
						{
							text: `${currentStem}庚合-合絆虛金`,
							color: "bg-yellow-100 text-yellow-700",
						},
						{
							text: "木焚添火",
							color: "bg-orange-100 text-orange-700",
						},
					],
					effects: [
						{
							title: "生身助劫",
							content: `強化日主自信/野心，同時助長劫財（火）奪財（金）之勢。在${concern}方面，貴人運存在，但助力可能體現在非直接層面（如建議、資質），或伴隨較高成本/付出。特別是在${problem ? `"${problem}"` : analysis.focus}方面需要特別注意。`,
						},
						{
							title: `${currentStem}庚合-合絆虛金`,
							content: `羈絆、阻礙與「金」相關的機遇（如金融操作、金屬相關項目、精密交易），或使此類機遇條件苛刻、進展遲緩。對於${concern}領域，可能表現為${analysis.risks}的情況出現。`,
						},
						{
							title: "木焚添火",
							content: `為地支${currentBranch}火提供燃料，加劇全局火炎熔金之勢。在${concern}方面容易出現過度激進或衝動的決策，需要特別謹慎。`,
						},
					],
				},
				[`地支${currentBranch}${getBranchElement(currentBranch)}-劫財`]:
					{
						title: `地支${currentBranch}${getBranchElement(currentBranch)}觸發三重效應`,
						subtitle: `地支${currentBranch}${getBranchElement(currentBranch)}（劫財/驛馬）三重效應`,
						badges: [
							{
								text: "劫財明奪",
								color: "bg-red-100 text-red-700",
							},
							{
								text: "刑動破基",
								color: "bg-purple-100 text-purple-700",
							},
							{
								text: "驛馬奔忙",
								color: "bg-blue-100 text-blue-700",
							},
						],
						effects: [
							{
								title: "劫財明奪（核心凶效）",
								content: `${currentBranch}火劫財強勢登場，直接、猛烈地克奪月干正財辛金。在${concern}領域，體現為：激烈競爭導致利潤削薄甚至虧損、合夥人/競爭對手搶奪利益、意外大額支出。${problem ? `針對"${problem}"的情況，` : ""}特別需要防範${analysis.risks}。`,
							},
							{
								title: `刑動破基（寅${currentBranch}刑）`,
								content: `動搖財富根基與穩定環境，導致收入來源中斷/不穩（如項目終止、客戶流失、崗位變動）、預期收益落空、墊付款難收回、因是非（官非、口舌）破財。在${concern}方面，需要特別注意基礎穩定性。`,
							},
							{
								title: "驛馬奔忙",
								content: `奔波勞碌求財，但多屬『火中取栗』，付出與回報嚴重不成正比，且加劇身心消耗與決策失誤風險。對於${concern}領域的發展，建議${analysis.advice}。`,
							},
						],
					},
			},

			ganZhiCore: {
				title: "流年干支作用",
				content: actualBaziData
					? `${year}年${currentStem}${currentBranch}流年對您${dayMaster}${dayMasterElement}日主的作用分析：天干${currentStem}木對${dayMaster}${dayMasterElement}日主形成${getRelationship(currentStem, dayMaster)}關係，地支${currentBranch}火對您的日支${fourPillars.day.branch}${actualBaziData.dayBranchWuxing}產生${getRelationship(currentBranch, fourPillars.day.branch)}作用。結合您的月柱${fourPillars.month.stem}${fourPillars.month.branch}和時柱${fourPillars.hour.stem}${fourPillars.hour.branch}，整體格局呈現${dayMasterElement}與流年五行的互動模式。針對${concern}領域，${problem ? `特別是"${problem}"相關的問題，` : ""}需要根據您實際的八字結構制定對應策略。`
					: `${currentStem}${currentBranch}流年作用分析：天干${currentStem}木與地支${currentBranch}火的組合，對不同日主會產生不同影響。針對${concern}領域，${problem ? `特別是"${problem}"相關的問題，` : ""}此年需要謹慎應對各種挑戰。`,
			},

			practicalManifestations: {
				title: "白話版實際表現",
				description: `此年${concern}運呈「生存保衛戰」格局，核心目標：保住${analysis.focus}穩定性、嚴控風險支出、杜絕投機行為、化解潛在糾紛、維持身心健康。${problem ? `針對您關心的"${problem}"，` : ""}建議${analysis.advice}，不求激進突破，但求穩健發展或減少損失。`,

				caseStudies: {
					title: "經典案例",
					cases: [
						{
							category: `${concern}領域 - 創業者/自僱人士`,
							description: `受${currentStem}木印星影響（政策風向、融資消息），可能啟動新項目（寅${currentBranch}刑動主變）。但${currentBranch}火劫財主強勢競爭者入場或合夥人反目爭利，寅${currentBranch}刑易致核心客戶流失、供應鏈斷裂、關鍵合約出問題。火旺熔金，項目極度燒錢、現金流斷裂風險高企。${problem ? `特別是關於"${problem}"的規劃需要格外謹慎。` : ""}`,
						},
						{
							category: `${concern}領域 - 職場人士`,
							description: `或有職責擴大、新項目機會（印），但面臨內部激烈競爭（劫財）、複雜人事鬥爭（刑）。實際收入（正財辛金）易受剋扣、扣薪、獎金縮水或遲發（火克金）。${currentBranch}未拱火，易因團隊失誤或過度承擔而背鍋、扣薪。${concern === "事業" || concern === "事业" ? "在職業發展上需要特別謹慎處理人際關係。" : `在${concern}方面需要平衡工作與個人需求。`}`,
						},
						{
							category: `${concern}領域 - 投資者/理財者`,
							description: `任何高風險投資（尤其股票、期貨、虛擬幣、礦產）大概率遭遇『熔斷式』虧損（火旺熔金象）。不動產相關操作（買賣、抵押）易遇糾紛、估值陷阱或流動性凍結（刑+土滯）。${concern === "財運" || concern === "财运" ? `針對您的理財需求，建議採取極度保守的策略。` : `即使關注${concern}，也要注意財務風險管控。`}`,
						},
					],
				},

				dangerZones: {
					title: "注意雷區",
					subtitle: "極度高危",
					zones: [
						{
							category: `${concern}領域高風險行為`,
							description:
								concern === "財運" || concern === "财运"
									? "包括但不限於：股市、幣圈、高槓桿、陌生領域創業、加盟。『火中取栗』在此年是字面意義的警告。"
									: `在${concern}方面避免過度激進或冒險的決策，特別是涉及重大變動的選擇。${problem ? `對於"${problem}"相關的決定需要三思而後行。` : ""}`,
						},
						{
							category: "合夥、借貸、擔保",
							description: `比劫奪財年，合夥必生嫌隙利爭，借貸難收回，擔保必惹禍上身。務必獨資、現金交易、不碰他人財務。${concern === "感情" ? "感情關係中也要避免金錢糾葛。" : ""}`,
						},
						{
							category: `過度擴張/${concern}領域急進`,
							description: `火旺火虛，表面繁榮下基礎極度脆弱。任何在${concern}領域的急進擴張都可能帶來風險。${analysis.advice}是當前最佳策略。`,
						},
						{
							category: "忽略契約與法律風險",
							description: `寅${currentBranch}刑易惹官非。任何協議務必條款清晰、合法合規，留存證據。避免口頭承諾。${concern === "事業" || concern === "事业" ? "商業合作中更要謹慎。" : ""}`,
						},
						{
							category: `忽視健康與情緒（影響${concern}發展）`,
							description: `焦躁之局損身心。健康崩潰（尤其心腦血管）是最大風險源。情緒失控易致決策連環錯。${concern}領域的發展也需要良好的身心狀態支撐。`,
						},
					],
				},
			},
		};
	};

	// Function to call AI API for real content generation
	const generateAIAnalysis = async (userInfo, year) => {
		// Calculate actual day master for this context
		let actualDayMaster = "乙";
		try {
			if (userInfo?.birthDateTime) {
				const baziData = getWuxingData(
					userInfo.birthDateTime,
					userInfo.gender || "male"
				);
				actualDayMaster = baziData.dayStem;
			}
		} catch (error) {
			console.error(
				"Failed to calculate day master in generateAIAnalysis:",
				error
			);
		}

		try {
			console.log("🌐 GanZhi component sending locale to API:", locale);
			const response = await fetch("/api/ganzhi-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userInfo,
					currentYear: year,
					locale: locale,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate AI analysis");
			}

			const data = await response.json();

			if (data.success) {
				return parseAIResponse(data, userInfo, year);
			} else {
				console.error(
					"❌ AI analysis failed - using fallback:",
					data.message || "AI analysis failed"
				);
				throw new Error(data.message || "AI analysis failed");
			}
		} catch (error) {
			console.error(
				"💥 AI Analysis Error - using fallback content:",
				error
			);
			// Fallback to mock data if AI fails
			const fallbackData = generateGanZhiAnalysis(userInfo, year);
			const yearGanZhi = getYearlyStems(year);
			// Ensure fallback data has proper parsedContent structure
			return {
				...fallbackData,
				parsedContent: {
					description:
						fallbackData.description || "流年分析載入中...",
					tianGan: {
						title: `天干${yearGanZhi.stem}${getStemElement(yearGanZhi.stem)}-${getTenGodRelation(yearGanZhi.stem, actualDayMaster)}`,
						effects: [
							{
								title: "職權提升",
								content:
									"天干在事業方面的正面影響，帶來升職機會和責任提升。",
							},
							{
								title: "合庚減洩",
								content:
									"需要注意創意發揮受限，建議以穩健執行為主。",
							},
							{
								title: "官星透出",
								content:
									"利於求名考績，但需防過於保守而錯失機會。",
							},
						],
						keyActions: [],
					},
					diZhi: {
						title: `地支${yearGanZhi.branch}${getBranchElement(yearGanZhi.branch)}-${getTenGodRelation(yearGanZhi.branch, actualDayMaster)}`,
						effects: [
							{
								title: "火旺生土",
								content:
									"增強日主能量，利於扛壓與長期項目推進，但需防固執己見。",
							},
							{
								title: "巳酉半合",
								content:
									"技術專業能力易受肯定，但需避免與同事的意見衝突。",
							},
							{
								title: "伏吟月支",
								content:
									"原有工作環境可能重複挑戰，需主動尋求突破。",
							},
						],
						keyActions: [],
					},
					practicalResults: "實際表現分析載入中...",
					risks: "風險分析載入中...",
					suggestions: "建議內容載入中...",
					conclusion: `${year}年為突破年，雖有壓力卻暗藏機遇，需平衡各方面因素。`,
				},
			};
		}
	};

	// Parse AI response into the expected format
	const parseAIResponse = (aiData, userInfo, year) => {
		const concern = userInfo?.concern || "事業";
		const problem = userInfo?.problem || "";
		const yearGanZhi = aiData.yearGanZhi;
		const analysis = aiData.analysis;

		// Calculate actual day master for this context
		let actualDayMaster = "乙";
		try {
			if (userInfo?.birthDateTime) {
				const baziData = getWuxingData(
					userInfo.birthDateTime,
					userInfo.gender || "male"
				);
				actualDayMaster = baziData.dayStem;
			}
		} catch (error) {
			console.error(
				"Failed to calculate day master in parseAIResponse:",
				error
			);
		}

		// Parse the AI analysis to extract structured content
		const parseAIContent = (text) => {
			console.log(
				"🔍 parseAIContent called with text length:",
				text?.length
			);

			// DEBUG: Log the last 500 chars to see what's actually there
			if (text && text.length > 500) {
				console.log("📄 Last 500 chars of AI response:");
				console.log(text.substring(text.length - 500));
			}

			// Remove duplicate standalone sections that appear AFTER 【注意事項】
			// Look for the pattern: after section 5 content, there's a newline followed by plain "建議" or "總結："
			// We want to keep everything UP TO but NOT INCLUDING these duplicate sections

			// Find where section 5 ends (after the last content of 總結要點)
			// Then remove everything after that if there's a standalone "建議" or "總結："
			const duplicatePatterns = [
				/\n[建議议]\s*\n/, // Standalone "建議" with newlines
				/\n[總总][結结][：:]\s*\n/, // Standalone "總結：" with newlines
			];

			let cleanedText = text;
			const section5Index = cleanedText.indexOf("### 5. 【注意事");
			console.log(`🔍 Section 5 starts at position: ${section5Index}`);

			for (const pattern of duplicatePatterns) {
				const match = cleanedText.search(pattern);
				console.log(
					`🔍 Pattern ${pattern} match at position: ${match}`
				);
				if (
					match !== -1 &&
					section5Index !== -1 &&
					match > section5Index
				) {
					console.log(
						`🧹 CUTTING at position ${match}, removing ${text.length - match} chars`
					);
					cleanedText = cleanedText.substring(0, match);
					break; // Cut at first match
				}
			}

			if (cleanedText.length < text.length) {
				console.log(
					`✂️ Total removed: ${text.length - cleanedText.length} chars of duplicate content`
				);
			}

			text = cleanedText;

			const result = {
				description: "",
				tianGan: {
					title: `天干${yearGanZhi?.stem || "乙"}${getStemElement(yearGanZhi?.stem || "乙")}-${getTenGodRelation(yearGanZhi?.stem || "乙", actualDayMaster)}`,
					effects: [],
					keyActions: [],
				},
				diZhi: {
					title: `地支${yearGanZhi?.branch || "巳"}${getBranchElement(yearGanZhi?.branch || "巳")}-${getTenGodRelation(yearGanZhi?.branch || "巳", actualDayMaster)}`,
					effects: [],
					keyActions: [],
				},
				practicalResults: "",
				risks: "",
				suggestions: "",
				conclusion: "",
			};

			if (!text || typeof text !== "string") {
				console.log("⚠️ Invalid text provided to parseAIContent");
				return result;
			}

			// Log a sample of the text for debugging
			console.log(
				"📄 Sample text (first 300 chars):",
				text.substring(0, 300)
			);
			console.log("🔍 Looking for patterns...");
			console.log(
				"- Contains ### 2. 【天干:",
				text.includes("### 2. 【天干")
			);
			console.log(
				"- Contains ### 3. 【地支:",
				text.includes("### 3. 【地支")
			);

			// Extract description - look for 格局特性 or take first meaningful paragraph
			let descMatch = text.match(/格局特性[：:]*(.*?)(?=[\n\r]|---)/s);
			if (!descMatch) {
				// If no 格局特性, take content from 八字分析 section
				descMatch = text.match(/\*\*八字[：:](.*?)(?=---|###)/s);
			}
			if (!descMatch) {
				// Fallback: take content after first heading until next section
				descMatch = text.match(/(?:###.*?\n)(.*?)(?=###|---)/s);
			}
			if (descMatch) {
				result.description = descMatch[1]
					.trim()
					.replace(/\*\*/g, "")
					.replace(/^\s*[\-\*]\s*/gm, "")
					.trim();
				console.log(
					"✅ Description extracted:",
					result.description.substring(0, 100)
				);
			} else {
				console.log("⚠️ No description pattern found");
			}

			// Extract 天干 effects with better parsing (supports both Traditional and Simplified)
			const tianGanSection = text.match(
				/### 2\. 【天干.*?[效应應]】(.*?)(?=### 3\.|---)/s
			);
			if (tianGanSection) {
				console.log("✅ TianGan section found");
				const tianGanText = tianGanSection[1];

				// Extract title - look for pattern like "天干乙木為**正官**" or "天干乙为**劫财**"
				const titleMatch = tianGanText.match(
					/天干(.+?)[為为]\*\*(.+?)\*\*/
				);
				if (titleMatch) {
					result.tianGan.title = `天干${titleMatch[1].trim()}-${titleMatch[2].trim()}`;
					console.log(
						"✅ TianGan title extracted:",
						result.tianGan.title
					);
				} else {
					// Fallback: extract from year info with actual relationship
					const stem = yearGanZhi?.stem || "乙";
					const tenGodRelation = getTenGodRelation(
						stem,
						actualDayMaster
					);
					result.tianGan.title = `天干${stem}${getStemElement(stem)}-${tenGodRelation}`;
					console.log(
						"⚠️ TianGan title fallback used with actual day master"
					);
				}

				// Extract numbered effects (1., 2., 3.)
				const effectMatches = tianGanText.match(
					/\d+\.\s*\*\*(.+?)\*\*[：:]*(.*?)(?=\d+\.|$)/gs
				);
				if (effectMatches) {
					result.tianGan.effects = effectMatches
						.slice(0, 3)
						.map((match, index) => {
							const effectMatch = match.match(
								/\d+\.\s*\*\*(.+?)\*\*[：:]*(.*)/s
							);
							return {
								title: effectMatch
									? effectMatch[1].trim()
									: `效應${index + 1}`,
								content: effectMatch
									? effectMatch[2].trim()
									: match
											.replace(
												/\d+\.\s*\*\*.*?\*\*[：:]*/,
												""
											)
											.trim(),
							};
						});
					console.log(
						`✅ Extracted ${result.tianGan.effects.length} TianGan effects`
					);
				} else {
					console.log("⚠️ No TianGan effects found with regex");
				}

				// If not enough effects, create fallback ones
				while (result.tianGan.effects.length < 3) {
					const index = result.tianGan.effects.length;
					result.tianGan.effects.push({
						title:
							["職權提升", "合庚減洩", "官星透出"][index] ||
							`效應${index + 1}`,
						content: `天干${yearGanZhi?.stem || "乙"}在${concern}方面的第${index + 1}重效應，具體影響需結合個人八字分析。`,
					});
				}
			} else {
				console.log("⚠️ TianGan section not found with regex");
			}

			// Extract 地支 effects with similar logic (supports both Traditional and Simplified)
			const diZhiSection = text.match(
				/### 3\. 【地支.*?[效应應]】(.*?)(?=### 4\.|---)/s
			);
			if (diZhiSection) {
				const diZhiText = diZhiSection[1];

				// Extract title - supports both 為 and 为
				const titleMatch = diZhiText.match(
					/地支(.+?)[為为]\*\*(.+?)\*\*/
				);
				if (titleMatch) {
					result.diZhi.title = `地支${titleMatch[1].trim()}-${titleMatch[2].trim()}`;
				} else {
					const branch = yearGanZhi?.branch || "巳";
					const branchRelation = getTenGodRelation(
						branch,
						actualDayMaster
					);
					result.diZhi.title = `地支${branch}${getBranchElement(branch)}-${branchRelation}`;
				}

				// Extract numbered effects
				const effectMatches = diZhiText.match(
					/\d+\.\s*\*\*(.+?)\*\*[：:]*(.*?)(?=\d+\.|$)/gs
				);
				if (effectMatches) {
					result.diZhi.effects = effectMatches
						.slice(0, 3)
						.map((match, index) => {
							const effectMatch = match.match(
								/\d+\.\s*\*\*(.+?)\*\*[：:]*(.*)/s
							);
							return {
								title: effectMatch
									? effectMatch[1].trim()
									: `效應${index + 1}`,
								content: effectMatch
									? effectMatch[2].trim()
									: match
											.replace(
												/\d+\.\s*\*\*.*?\*\*[：:]*/,
												""
											)
											.trim(),
							};
						});
				}

				// Fallback effects if needed
				while (result.diZhi.effects.length < 3) {
					const index = result.diZhi.effects.length;
					result.diZhi.effects.push({
						title:
							["火旺生土", "巳酉半合", "伏吟月支"][index] ||
							`效應${index + 1}`,
						content: `地支${yearGanZhi?.branch || "巳"}在${concern}方面的第${index + 1}重效應，需結合流年特點進行分析。`,
					});
				}
			}

			// Extract key actions from 關鍵作用 or similar sections (supports both Traditional and Simplified)
			const keyActionsMatch = text.match(
				/(?:\*\*[關关][鍵键]作用\*\*|\*\*[關关][鍵键][影响響]\*\*)[：:]?(.*?)(?=---|###)/s
			);
			if (keyActionsMatch) {
				const actions = keyActionsMatch[1]
					.split(/[-•]\s*/)
					.filter((action) => action.trim())
					.map((action) => action.trim())
					.slice(0, 2);
				result.tianGan.keyActions = actions;
			}

			// Extract practical results (supports both Traditional and Simplified)
			// Note: Section 4 is now the final section after our API prompt update
			const practicalMatch = text.match(
				/[實实][際际]表[現现]\s*(.*?)(?=【注意事[項项]】|$)/s
			);
			if (practicalMatch) {
				result.practicalResults = practicalMatch[1].trim();
			}

			// Extract risks and suggestions with improved parsing (supports both Traditional and Simplified)
			const noticeMatch = text.match(
				/### 4\. 【注意事[項项]】(.*?)(?=### |$)/s
			);
			console.log(
				"🔍 Notice section match result:",
				noticeMatch ? "FOUND" : "NOT FOUND"
			);
			if (noticeMatch) {
				console.log("📋 Notice text length:", noticeMatch[1]?.length);
				console.log(
					"📋 Notice text preview (first 200 chars):",
					noticeMatch[1]?.substring(0, 200)
				);

				let noticeText = noticeMatch[1]; // Cut off any standalone duplicate sections
				// Look for lines that are JUST "建議" or "總結：" without being part of "建议指引" or "总结要点"
				const cutoffPatterns = [
					/\n[建議议]\s*\n(?![指引導导])/s, // Plain "建議" not followed by "指引"
					/\n[總总][結结][：:]\s*\n/s, // "總結：" as standalone heading
				];

				for (const pattern of cutoffPatterns) {
					const cutIndex = noticeText.search(pattern);
					if (cutIndex !== -1) {
						noticeText = noticeText.substring(0, cutIndex);
						break;
					}
				}

				// Look for specific subsections (supports both Traditional and Simplified)
				console.log("🔍 Testing regex patterns against noticeText...");

				// Risk pattern - match simple headings from API prompt: "风险" or "風險"
				const riskMatch = noticeText.match(
					/[风風][险險]\s*\n(.*?)(?=[建議议]\s*\n|[总總][结結]|$)/s
				);
				if (riskMatch) {
					result.risks = riskMatch[1]
						.trim()
						.replace(/\*\*/g, "")
						.replace(/^\s*[\-\*]\s*/gm, "")
						.trim();
					console.log(
						`✅ Extracted risks (${result.risks.length} chars):`,
						result.risks.substring(0, 200)
					);
				} else {
					console.log(`❌ No risks match found in noticeText`);
					console.log("🔍 Looking for patterns manually...");
					if (noticeText.includes("风险"))
						console.log("✓ Found: 风险");
					if (noticeText.includes("風險"))
						console.log("✓ Found: 風險");
					if (noticeText.includes("建议"))
						console.log("✓ Found: 建议");
					if (noticeText.includes("建議"))
						console.log("✓ Found: 建議");
				}

				// Suggestion pattern - match simple "建议" or "建議" heading
				const suggestionMatch = noticeText.match(
					/[建議议]\s*\n(.*?)(?=[总總][结結]|$)/s
				);
				if (suggestionMatch) {
					result.suggestions = suggestionMatch[1]
						.trim()
						.replace(/\*\*/g, "")
						.replace(/^\s*[\-\*]\s*/gm, "")
						.trim();
					console.log(
						`✅ Extracted suggestions (${result.suggestions.length} chars):`,
						result.suggestions.substring(0, 200)
					);
				} else {
					console.log(`❌ No suggestions match found in noticeText`);
				}

				// Conclusion pattern - match "总结" or "總結" with optional colon
				const conclusionMatch = noticeText.match(
					/[总總][结結][：:]?\s*\n(.*?)$/s
				);
				if (conclusionMatch) {
					result.conclusion = conclusionMatch[1]
						.trim()
						.replace(/\*\*/g, "")
						.replace(/^\s*[\-\*]\s*/gm, "")
						.trim();
					console.log(
						`✅ Extracted conclusion (${result.conclusion.length} chars):`,
						result.conclusion.substring(0, 200)
					);
				} else {
					console.log(`❌ No conclusion match found in noticeText`);
				} // Fallback: if no specific subsections found, try to extract risks and suggestions differently
				if (!result.risks && !result.suggestions) {
					// Match plain "風險" or "风险" heading until "建议指引" or "建議指引"
					const riskFallback = noticeText.match(
						/[風风][險险]\s*\n(?:.*?[：:]\s*\n)?(.*?)(?=\n[建議议][指引導导][：:])/s
					);
					if (riskFallback) {
						result.risks = riskFallback[1]
							.trim()
							.replace(/\*\*/g, "");
					}

					// Match "建议指引：" or "建議指引：" until "总结要点" or "總結要點"
					const suggestionFallback = noticeText.match(
						/[建議议][指引導导][：:]\s*\n(?:.*?[：:]\s*\n)?(.*?)(?=\n[總总][結结]要点點[：:])/s
					);
					if (suggestionFallback) {
						result.suggestions = suggestionFallback[1]
							.trim()
							.replace(/\*\*/g, "");
					}

					// Match "总结要点：" or "總結要點：" until end
					const conclusionFallback = noticeText.match(
						/[總总][結结]要点點[：:]\s*\n(.*?)$/s
					);
					if (conclusionFallback) {
						result.conclusion = conclusionFallback[1]
							.trim()
							.replace(/\*\*/g, "");
					}
				}
			}

			// Extract conclusion
			const conclusionMatch = text.match(
				/(?:### [總总][結结]|[總总][結结]要点點)[：:]?(.*?)$/s
			);
			if (conclusionMatch) {
				result.conclusion = conclusionMatch[1].trim();
			} else {
				// Fallback conclusion
				result.conclusion = `2025年為${concern}突破年，雖有壓力卻暗藏機遇，需平衡「官星責任」與「印星自信」，並以金水調候避免過燥。主動爭取機會、強化專業表現，有望獲得實質進展。`;
			}
			return result;
		};

		const parsedContent = parseAIContent(analysis);

		// Ensure parsedContent is properly structured with fallbacks
		const concernContent = getConcernSpecificContent(
			concern,
			yearGanZhi?.stem || "乙",
			yearGanZhi?.branch || "巳",
			locale
		);
		const safeParsedContent = {
			description:
				parsedContent.description ||
				convertText(
					`針對${concern}領域的專業分析，基於您的八字和流年${yearGanZhi?.stem || "乙"}${yearGanZhi?.branch || "巳"}的相互作用。`
				),
			tianGan: {
				title:
					parsedContent.tianGan?.title ||
					convertText(
						`天干${yearGanZhi?.stem || "乙"}${getStemElement(yearGanZhi?.stem || "乙")}-${getTenGodRelation(yearGanZhi?.stem || "乙", actualDayMaster)}`
					),
				effects:
					parsedContent.tianGan?.effects?.length > 0
						? parsedContent.tianGan.effects
						: [
								{
									title: convertText("職權提升"),
									content: convertText(
										"天干在事業方面的正面影響，帶來升職機會和責任提升。"
									),
								},
								{
									title: convertText("合庚減洩"),
									content: convertText(
										"需要注意創意發揮受限，建議以穩健執行為主。"
									),
								},
								{
									title: convertText("官星透出"),
									content: convertText(
										"利於求名考績，但需防過於保守而錯失機會。"
									),
								},
							],
				keyActions: parsedContent.tianGan?.keyActions || [],
			},
			diZhi: {
				title:
					parsedContent.diZhi?.title ||
					convertText(
						`地支${yearGanZhi?.branch || "巳"}${getBranchElement(yearGanZhi?.branch || "巳")}-偏印`
					),
				effects:
					parsedContent.diZhi?.effects?.length > 0
						? parsedContent.diZhi.effects
						: [
								{
									title: convertText("火旺生土"),
									content: convertText(
										"增強日主能量，利於扛壓與長期項目推進，但需防固執己見。"
									),
								},
								{
									title: convertText("巳酉半合"),
									content: convertText(
										"技術專業能力易受肯定，但需避免與同事的意見衝突。"
									),
								},
								{
									title: convertText("伏吟月支"),
									content: convertText(
										"原有工作環境可能重複挑戰，需主動尋求突破。"
									),
								},
							],
				keyActions: parsedContent.diZhi?.keyActions || [],
			},
			practicalResults:
				parsedContent.practicalResults ||
				convertText(
					`在${concern}領域將呈現階段性變化，結合流年${yearGanZhi?.stem || "乙"}${yearGanZhi?.branch || "巳"}的影響，建議關注具體表現時機和調整策略。`
				),
			risks: parsedContent.risks || concernContent.risks,
			suggestions:
				parsedContent.suggestions || concernContent.suggestions,
			conclusion: parsedContent.conclusion || concernContent.conclusion,
		};
		return {
			title: `${year}年流年詳解`,
			description: safeParsedContent.description,
			aiAnalysis: analysis,
			baZi: aiData.baZi,
			yearGanZhi: yearGanZhi,
			parsedContent: safeParsedContent,
			concern: concern,
			problem: problem,
		};
	};

	useEffect(() => {
		const loadAnalysis = async () => {
			setIsLoading(true);
			try {
				// Check if data already exists in component data store (for historical reports)
				if (
					typeof window !== "undefined" &&
					window.componentDataStore?.ganZhiAnalysis
				) {
					const cachedData = window.componentDataStore.ganZhiAnalysis;

					// For historical reports, always use cached data if it exists
					// Historical reports are flagged when displaySavedReport populates the store
					const isHistoricalReport =
						window.componentDataStore?._isHistoricalReport ||
						(cachedData && !cachedData.userBirthDateTime);

					if (isHistoricalReport) {
						console.log(
							"📖 Using existing GanZhi data from component store (historical report)"
						);
						setAnalysisData(cachedData);
						setActiveSection("tianGan");
						setIsLoading(false);
						return;
					}

					// For fresh reports, validate that cached data matches current user parameters
					const cachedBirthDateTime = cachedData?.userBirthDateTime;
					const cachedGender = cachedData?.userGender;
					const cachedConcern = cachedData?.userConcern;

					const currentBirthDateTime = userInfo?.birthDateTime;
					const currentGender = userInfo?.gender;
					const currentConcern = userInfo?.concern;

					const cacheMatches =
						cachedBirthDateTime === currentBirthDateTime &&
						cachedGender === currentGender &&
						cachedConcern === currentConcern;

					console.log("🔍 GanZhi cache validation:", {
						cachedBirthDateTime,
						currentBirthDateTime,
						cachedGender,
						currentGender,
						cachedConcern,
						currentConcern,
						cacheMatches,
					});

					if (cacheMatches) {
						console.log(
							"📖 Using existing GanZhi data from component store (validated)"
						);
						setAnalysisData(cachedData);
						setActiveSection("tianGan");
						setIsLoading(false);
						return;
					} else {
						console.log(
							"🔄 Cache exists but doesn't match current user, generating fresh data"
						);
						// Clear invalid cache
						delete window.componentDataStore.ganZhiAnalysis;
					}
				}

				console.log("� GanZhi generating fresh AI analysis");

				const aiData = await generateAIAnalysis(userInfo, currentYear);

				// Add user parameters to the data for cache validation
				aiData.userBirthDateTime = userInfo?.birthDateTime;
				aiData.userGender = userInfo?.gender;
				aiData.userConcern = userInfo?.concern;

				setAnalysisData(aiData);
				// Store data globally for database saving
				if (typeof window !== "undefined") {
					window.componentDataStore = window.componentDataStore || {};
					window.componentDataStore.ganZhiAnalysis = aiData;
					console.log(
						"📊 Stored GanZhi data with user params:",
						"SUCCESS"
					);
				}
				// Set the active section to the first toggle option
				setActiveSection("tianGan");
			} catch (error) {
				console.error("Failed to load analysis:", error);
				// Fallback to mock data with proper structure using actual birth chart
				const mockData = generateGanZhiAnalysis(userInfo, currentYear);
				const yearGanZhi = getYearlyStems(currentYear);

				// Calculate actual birth chart for fallback too
				let actualDayMaster = "乙";
				let actualDayMasterElement = "木";
				try {
					if (userInfo?.birthDateTime) {
						const baziData = getWuxingData(
							userInfo.birthDateTime,
							userInfo.gender || "male"
						);
						actualDayMaster = baziData.dayStem;
						actualDayMasterElement = baziData.dayStemWuxing;
					}
				} catch (baziError) {
					console.error(
						"Fallback bazi calculation failed:",
						baziError
					);
				}

				// Convert mock data to expected format with actual day master
				const structuredMockData = {
					...mockData,
					parsedContent: {
						description:
							mockData.description ||
							`基於您的${actualDayMaster}${actualDayMasterElement}日主，分析${currentYear}年乙巳流年的影響。`,
						tianGan: {
							title: `天干${yearGanZhi.stem}${getStemElement(yearGanZhi.stem)}-${getTenGodRelation(yearGanZhi.stem, actualDayMaster)}`,
							effects: [
								{
									title: "職權提升",
									content:
										"天干在事業方面的正面影響，帶來升職機會和責任提升。",
								},
								{
									title: "合庚減洩",
									content:
										"需要注意創意發揮受限，建議以穩健執行為主。",
								},
								{
									title: "官星透出",
									content:
										"利於求名考績，但需防過於保守而錯失機會。",
								},
							],
							keyActions: [],
						},
						diZhi: {
							title: `地支${yearGanZhi.branch}${getBranchElement(yearGanZhi.branch)}-偏印`,
							effects: [
								{
									title: "火旺生土",
									content:
										"增強日主能量，利於扛壓與長期項目推進，但需防固執己見。",
								},
								{
									title: "巳酉半合",
									content:
										"技術專業能力易受肯定，但需避免與同事的意見衝突。",
								},
								{
									title: "伏吟月支",
									content:
										"原有工作環境可能重複挑戰，需主動尋求突破。",
								},
							],
							keyActions: [],
						},
						practicalResults: "實際表現分析載入中...",
						risks: "風險分析載入中...",
						suggestions: "建議內容載入中...",
						conclusion: `${currentYear}年為突破年，雖有壓力卻暗藏機遇，需平衡各方面因素。`,
					},
					yearGanZhi: {
						stem: currentYear === 2025 ? "乙" : "甲",
						branch: currentYear === 2025 ? "巳" : "午",
					},
				};

				// Add user parameters to the fallback data for cache validation
				structuredMockData.userBirthDateTime = userInfo?.birthDateTime;
				structuredMockData.userGender = userInfo?.gender;
				structuredMockData.userConcern = userInfo?.concern;

				setAnalysisData(structuredMockData);

				// Store fallback data globally for database saving
				if (typeof window !== "undefined") {
					window.componentDataStore = window.componentDataStore || {};
					window.componentDataStore.ganZhiAnalysis =
						structuredMockData;
					console.log(
						"📊 Stored GanZhi fallback data with user params:",
						"SUCCESS"
					);
				}

				setActiveSection("tianGan");
			} finally {
				setIsLoading(false);
			}
		};

		loadAnalysis();
	}, [userInfo, currentYear]);

	if (isLoading) {
		return (
			<div
				className="py-6 mx-auto mb-6 bg-white sm:py-8 lg:py-10 sm:mb-10"
				style={{
					width: "95%",
					borderRadius: "45px sm:45px md:45px lg:45px xl:45px",
					boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
				}}
			>
				<div className="flex flex-col items-center justify-center py-12 space-y-4">
					{/* Loading spinner */}
					<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

					{/* 小鈴 loading image */}
					<div className="flex items-center justify-center">
						<Image
							src="/images/風水妹/風水妹-loading.png"
							alt={t("loadingAlt")}
							width={120}
							height={120}
							className="object-contain"
						/>
					</div>

					{/* Loading text */}
					<div className="space-y-2 text-center">
						<div
							className="text-gray-700"
							style={{
								fontFamily: "Noto Sans HK, sans-serif",
								fontSize: "clamp(14px, 3.5vw, 16px)",
							}}
						>
							{t("loadingText")}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Safety check for analysisData structure
	if (!analysisData || !analysisData.parsedContent) {
		return (
			<div
				className="py-6 mx-auto mb-6 bg-white rounded-[45px] sm:py-8 lg:py-10 sm:mb-10"
				style={{
					width: "95%",
					boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
				}}
			>
				<div className="py-6 text-center sm:py-8">
					<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#A3B116] mx-auto mb-3 sm:mb-4"></div>
					<p
						className="text-[#5A5A5A] mb-2"
						style={{
							fontFamily: "Noto Sans HK, sans-serif",
							fontSize: "clamp(1rem, 3vw, 1.125rem)",
						}}
					>
						{t("loadingDataText")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<ComponentErrorBoundary componentName="GanZhi">
			<div
				className="py-6 mx-auto rounded-[45px] mb-6 bg-white sm:py-8 lg:py-10 sm:mb-10"
				style={{
					width: "95%",
					boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
				}}
			>
				{/* Header */}
				<div className="px-4 mb-6 sm:mb-8 sm:px-6 md:px-8 lg:px-13">
					<h2
						className="mb-3 font-bold text-center lg:text-left sm:mb-4"
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontSize: "clamp(1.75rem, 6vw, 3.5rem)",
							color: getConcernColor(userInfo),
							lineHeight: 1.1,
						}}
					>
						{t("title")}
					</h2>
					<p className="mb-4 text-lg">{t("subtitle")}</p>

					{/* Description */}
					<p
						className="mb-4 leading-relaxed text-gray-700 sm:mb-6"
						style={{
							fontFamily: "Noto Sans HK, sans-serif",
							fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
						}}
					>
						{analysisData?.description}
					</p>

					{/* Main Container with EFEFEF background */}
					<div
						className="bg-[#EFEFEF] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6"
						style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25)" }}
					>
						{/* Toggle Buttons */}
						<div className="flex flex-col gap-3 mb-4 sm:flex-row sm:gap-4 sm:mb-6">
							<button
								onClick={() => setActiveSection("tianGan")}
								className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex-1 sm:flex-none text-center ${
									activeSection === "tianGan"
										? "text-white"
										: "bg-white text-black"
								}`}
								style={{
									fontFamily: "Noto Sans HK, sans-serif",
									fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
									backgroundColor:
										activeSection === "tianGan"
											? getConcernColor(userInfo)
											: undefined,
								}}
							>
								{analysisData?.parsedContent?.tianGan?.title ||
									`天干${analysisData?.yearGanZhi?.stem || "乙"}${getStemElement(analysisData?.yearGanZhi?.stem || "乙")}-正官`}
							</button>
							<button
								onClick={() => setActiveSection("diZhi")}
								className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex-1 sm:flex-none text-center ${
									activeSection === "diZhi"
										? "text-white"
										: "bg-white text-black"
								}`}
								style={{
									fontFamily: "Noto Sans HK, sans-serif",
									fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
									backgroundColor:
										activeSection === "diZhi"
											? getConcernColor(userInfo)
											: undefined,
								}}
							>
								{analysisData?.parsedContent?.diZhi?.title ||
									`地支${analysisData?.yearGanZhi?.branch || "巳"}${getBranchElement(analysisData?.yearGanZhi?.branch || "巳")}-偏印`}
							</button>
						</div>

						{/* Content based on active section */}
						{activeSection === "tianGan" && (
							<div>
								{/* Title */}
								<h3
									className="mb-3 font-black sm:mb-4"
									style={{
										fontFamily: "Noto Serif TC, serif",
										color: getConcernColor(userInfo),
										fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
										lineHeight: 1.2,
									}}
								>
									天干{analysisData?.yearGanZhi?.stem || "乙"}
									{getStemElement(
										analysisData?.yearGanZhi?.stem || "乙"
									)}
									{convertText("觸發三重效應")}
								</h3>

								{/* Content from AI analysis */}
								<div
									className="mb-4 leading-relaxed text-gray-700 sm:mb-6"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
										fontSize:
											"clamp(0.875rem, 2.5vw, 1rem)",
									}}
								>
									{/* Extract content from sections 1 and 2 of AI analysis */}
								</div>

								{/* Key Actions Container */}
								{/* {analysisData?.parsedContent?.tianGan
									?.keyActions?.length > 0 && (
									<div
										className="bg-[#567156] text-white p-4 rounded-lg mb-6"
										style={{
											boxShadow:
												"0 4px 4px rgba(0,0,0,0.25)",
										}}
									>
										<h4
											className="mb-2 font-semibold"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
										>
											關鍵作用
										</h4>
										<ul className="space-y-2">
											{analysisData.parsedContent.tianGan.keyActions.map(
												(action, index) => (
													<li
														key={index}
														className="text-sm"
													>
														- {action}
													</li>
												)
											)}
										</ul>
									</div>
								)}
 */}
								{/* Three Cards */}
								<div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{(
										analysisData?.parsedContent?.tianGan
											?.effects || [
											{
												title: "職權提升",
												content:
													"天干在事業方面的正面影響，帶來升職機會和責任提升。",
											},
											{
												title: "合庚減洩",
												content:
													"需要注意創意發揮受限，建議以穩健執行為主。",
											},
											{
												title: "官星透出",
												content:
													"利於求名考績，但需防過於保守而錯失機會。",
											},
										]
									)
										.slice(0, 3)
										.map((effect, index) => (
											<div
												key={index}
												className="bg-white rounded-lg p-4 h-[200px] flex flex-col"
												style={{
													boxShadow:
														"0 4px 4px rgba(0,0,0,0.25)",
												}}
											>
												<div
													className="p-2 mb-3 text-center text-white rounded-lg"
													style={{
														backgroundColor:
															getConcernColor(
																userInfo
															),
													}}
												>
													<h4
														className="font-semibold"
														style={{
															fontFamily:
																"Noto Sans HK, sans-serif",
														}}
													>
														{effect.title}
													</h4>
												</div>
												<div className="flex-1 overflow-y-auto">
													<p
														className="text-black text-[15px] leading-relaxed"
														style={{
															fontFamily:
																"Noto Sans HK, sans-serif",
														}}
													>
														{effect.content}
													</p>
												</div>
											</div>
										))}
								</div>
							</div>
						)}

						{/* DiZhi Section */}
						{activeSection === "diZhi" && (
							<div>
								{/* Title */}
								<h3
									className="mb-3 font-black sm:mb-4"
									style={{
										fontFamily: "Noto Serif TC, serif",
										color: getConcernColor(userInfo),
										fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
										lineHeight: 1.2,
									}}
								>
									地支
									{analysisData?.yearGanZhi?.branch || "巳"}
									{getBranchElement(
										analysisData?.yearGanZhi?.branch || "巳"
									)}
									{convertText("觸發三重效應")}
								</h3>

								{/* Content from AI analysis */}
								<div
									className="mb-4 leading-relaxed text-gray-700 sm:mb-6"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
										fontSize:
											"clamp(0.875rem, 2.5vw, 1rem)",
									}}
								></div>

								{/* Three Cards */}
								<div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{(
										analysisData?.parsedContent?.diZhi
											?.effects || [
											{
												title: "火旺生土",
												content:
													"增強日主能量，利於扛壓與長期項目推進，但需防固執己見。",
											},
											{
												title: "巳酉半合",
												content:
													"技術專業能力易受肯定，但需避免與同事的意見衝突。",
											},
											{
												title: "伏吟月支",
												content:
													"原有工作環境可能重複挑戰，需主動尋求突破。",
											},
										]
									)
										.slice(0, 3)
										.map((effect, index) => (
											<div
												key={index}
												className="bg-white rounded-lg p-4 h-[200px] flex flex-col"
												style={{
													boxShadow:
														"0 4px 4px rgba(0,0,0,0.25)",
												}}
											>
												<div
													className="p-2 mb-3 text-center text-white rounded-lg"
													style={{
														backgroundColor:
															getConcernColor(
																userInfo
															),
													}}
												>
													<h4
														className="font-semibold"
														style={{
															fontFamily:
																"Noto Sans HK, sans-serif",
														}}
													>
														{effect.title}
													</h4>
												</div>
												<div className="flex-1 overflow-y-auto">
													<p
														className="text-black text-[15px] leading-relaxed"
														style={{
															fontFamily:
																"Noto Sans HK, sans-serif",
														}}
													>
														{effect.content}
													</p>
												</div>
											</div>
										))}
								</div>
							</div>
						)}
					</div>

					{/* Practical Results Section */}
					<div className="mb-4 sm:mb-6">
						<h3
							className="mb-3 font-semibold sm:mb-4"
							style={{
								fontFamily: "Noto Serif TC, serif",
								color: getConcernColor(userInfo),
								fontSize: "clamp(1.25rem, 4vw, 1.875rem)",
								lineHeight: 1.2,
							}}
						>
							{convertText("實際表現")}
						</h3>
						<div
							className="leading-relaxed text-black"
							style={{
								fontFamily: "Noto Sans HK, sans-serif",
								fontSize: "clamp(0.875rem, 2.5vw, 0.9375rem)",
							}}
							dangerouslySetInnerHTML={{
								__html:
									analysisData?.parsedContent?.practicalResults
										?.replace(
											/\*\*(.+?)\*\*/g,
											"<strong>$1</strong>"
										)
										?.replace(/\n/g, "<br/>") ||
									analysisData?.aiAnalysis
										?.split("### 4. 【實際表現】")[1]
										?.split("### 5.")[0]
										?.replace(
											/\*\*(.+?)\*\*/g,
											"<strong>$1</strong>"
										)
										?.replace(/\n/g, "<br/>") ||
									"內容載入中...",
							}}
						/>
					</div>

					{/* Notice Section */}
					<div
						className="p-4 mb-4 bg-white border-2 rounded-lg sm:p-6 sm:mb-6"
						style={{ borderColor: getConcernColor(userInfo) }}
					>
						<h3
							className="mb-3 font-semibold sm:mb-4"
							style={{
								fontFamily: "Noto Serif TC, serif",
								color: getConcernColor(userInfo),
								fontSize: "clamp(1.125rem, 3.5vw, 1.5625rem)",
								lineHeight: 1.2,
							}}
						>
							【注意事項】
						</h3>

						{/* Risk Section */}
						<div className="mb-3 sm:mb-4">
							<div className="px-3 py-2 mb-2 text-white bg-red-500 rounded-lg sm:px-4">
								<h4
									className="font-semibold"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
										fontSize:
											"clamp(1.125rem, 3.5vw, 1.5625rem)",
									}}
								>
									{convertText("風險")}
								</h4>
							</div>
							<div
								className="leading-relaxed text-black"
								style={{
									fontFamily: "Noto Sans HK, sans-serif",
									fontSize:
										"clamp(0.875rem, 2.5vw, 0.9375rem)",
								}}
								dangerouslySetInnerHTML={{
									__html:
										analysisData?.parsedContent?.risks
											?.replace(
												/\*\*(.+?)\*\*/g,
												"<strong>$1</strong>"
											)
											?.replace(/\n/g, "<br/>") ||
										analysisData?.aiAnalysis
											?.match(
												/\*\*[風风][險险]\*\*[：:]?(.*?)(?=\*\*[建議议]\*\*|-)/s
											)?.[1]
											?.replace(
												/\*\*(.+?)\*\*/g,
												"<strong>$1</strong>"
											)
											?.replace(/\n/g, "<br/>") ||
										"風險內容載入中...",
								}}
							/>
						</div>

						{/* Suggestions Section */}
						<div>
							<div className="px-3 py-2 mb-2 text-white bg-black rounded-lg sm:px-4">
								<h4
									className="font-semibold"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
										fontSize:
											"clamp(1.125rem, 3.5vw, 1.5625rem)",
									}}
								>
									{convertText("建議")}
								</h4>
							</div>
							<div
								className="leading-relaxed text-black"
								style={{
									fontFamily: "Noto Sans HK, sans-serif",
									fontSize:
										"clamp(0.875rem, 2.5vw, 0.9375rem)",
								}}
								dangerouslySetInnerHTML={{
									__html:
										analysisData?.parsedContent?.suggestions
											?.replace(
												/\*\*(.+?)\*\*/g,
												"<strong>$1</strong>"
											)
											?.replace(/\n/g, "<br/>") ||
										analysisData?.aiAnalysis
											?.match(
												/\*\*[建議议]\*\*[：:]?(.*?)(?=---|###|[總总][結结])/s
											)?.[1]
											?.replace(
												/\*\*(.+?)\*\*/g,
												"<strong>$1</strong>"
											)
											?.replace(/\n/g, "<br/>") ||
										"建議內容載入中...",
								}}
							/>
						</div>
					</div>

					{/* Conclusion */}
					<div>
						<h3
							className="mb-3 font-semibold text-red-500 sm:mb-4"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(1.125rem, 3.5vw, 1.5625rem)",
								lineHeight: 1.2,
							}}
						>
							{convertText("總結：")}
						</h3>
						<p
							className="leading-relaxed text-black"
							style={{
								fontFamily: "Noto Sans HK, sans-serif",
								fontSize: "clamp(0.875rem, 2.5vw, 0.9375rem)",
							}}
							dangerouslySetInnerHTML={{
								__html:
									analysisData?.parsedContent?.conclusion?.replace(
										/\*\*(.+?)\*\*/g,
										"<strong>$1</strong>"
									) ||
									analysisData?.aiAnalysis
										?.match(/### 總結[：:]?(.*?)$/s)?.[1]
										?.replace(
											/\*\*(.+?)\*\*/g,
											"<strong>$1</strong>"
										) ||
									"2025年為事業突破年，雖有壓力卻暗藏升職契機，需平衡「官星責任」與「印星自信」，並以金水調候避免過燥。主動爭取考核、強化專業表現，有望在體制內獲得實質晉升。",
							}}
						/>
					</div>
				</div>
			</div>
		</ComponentErrorBoundary>
	);
}
