"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import getWuxingData from "@/lib/nayin.js";
import { generateHealthFortunePrompt } from "@/lib/healthFortunePrompt";
import { generateCareerFortunePrompt } from "@/lib/careerFortunePrompt";
import { generateWealthFortunePrompt } from "@/lib/wealthFortunePrompt";
import { generateRelationshipFortunePrompt } from "@/lib/relationshipFortunePrompt";
import LifePrintCoverPage from "./components/LifePrintCoverPage";
import Page1_BasicAnalysis from "../../print-report/view/components/Page1_BasicAnalysis";
import LifePrintPillars34 from "./components/LifePrintPillars34";
import LifePrintPage5 from "./components/LifePrintPage5";
import LifePrintTenGods from "./components/LifePrintTenGods";
import LifePrintResolveTips from "./components/LifePrintResolveTips";
import LifePrintFourFortune from "./components/LifePrintFourFortune";

function LifePrintReportViewInner() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = useLocale();

	const [fullAnalysis, setFullAnalysis] = useState(null);
	const [reportDocData, setReportDocData] = useState(null);
	const [elementDistribution, setElementDistribution] = useState(null);
	const [elementFlowAnalysis, setElementFlowAnalysis] = useState(null);
	const [wuxingAnalysisResult, setWuxingAnalysisResult] = useState(null);
	const [fourFortuneData, setFourFortuneData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const name = searchParams.get("name") || "";
	const gender = searchParams.get("gender") || "male";
	const birthday = searchParams.get("birthday") || "";
	const birthTime = searchParams.get("birthTime") || "";
	const productName = searchParams.get("productName") || "梨花木鑰匙珠砂掛墜";

	function analyzeWuxingStrength(elementCounts) {
		const total = Object.values(elementCounts).reduce(
			(sum, count) => sum + count,
			0,
		);
		const strongElements = [];
		const weakElements = [];
		Object.entries(elementCounts).forEach(([element, count]) => {
			const percentage = total ? (count / total) * 100 : 0;
			if (percentage >= 25) strongElements.push(element);
			else if (count === 0) weakElements.push(element);
		});
		let strengthDesc = "";
		if (strongElements.length === 1)
			strengthDesc = `${strongElements[0]}旺`;
		else if (strongElements.length === 2)
			strengthDesc = `${strongElements.join("")}兩旺`;
		else if (strongElements.length >= 3)
			strengthDesc = `${strongElements.slice(0, 2).join("")}等多旺`;
		else {
			const maxCount = Math.max(...Object.values(elementCounts), 0);
			const dominant = Object.entries(elementCounts).find(
				([, c]) => c === maxCount,
			)?.[0];
			strengthDesc = dominant ? `${dominant}為主` : "五行平衡";
		}
		return { strongElements, weakElements, strengthDesc, elementCounts };
	}

	function determineUsefulGods(strengthAnalysis) {
		const { strongElements, weakElements, elementCounts } =
			strengthAnalysis || {};
		const elementCycle = ["木", "火", "土", "金", "水"];
		const strategyDesc = {
			補缺: "補足所缺",
			扶弱: "扶助偏弱",
			抑強: "抑制過強",
			瀉強: "化解過旺",
		};
		let primaryGod = "";
		let auxiliaryGod = "";
		let strategy = "";
		if (weakElements?.length > 0) {
			primaryGod = weakElements[0];
			auxiliaryGod =
				weakElements[1] ||
				elementCycle[(elementCycle.indexOf(primaryGod) - 1 + 5) % 5];
			strategy = "補缺";
		} else if (!strongElements?.length) {
			const minCount = Math.min(...Object.values(elementCounts || {}), 1);
			const weakest = Object.entries(elementCounts || {})
				.filter(([, c]) => c === minCount)
				.map(([e]) => e);
			primaryGod = weakest[0] || "";
			auxiliaryGod =
				elementCycle[(elementCycle.indexOf(primaryGod) - 1 + 5) % 5];
			strategy = "扶弱";
		} else if (strongElements?.length >= 2) {
			const strongest = strongElements[0];
			const idx = elementCycle.indexOf(strongest);
			primaryGod = elementCycle[(idx + 1) % 5];
			auxiliaryGod = elementCycle[(idx + 2) % 5];
			strategy = "抑強";
		} else if (strongElements?.length === 1) {
			const idx = elementCycle.indexOf(strongElements[0]);
			primaryGod = elementCycle[(idx + 1) % 5];
			auxiliaryGod = elementCycle[(idx + 2) % 5];
			strategy = "瀉強";
		}
		const s = strategyDesc[strategy] || "平衡調和";
		return {
			primaryGod,
			auxiliaryGod,
			strategy,
			adviceText:
				primaryGod && auxiliaryGod
					? `根據您的五行配置分析，建議以「${primaryGod}」為首選用神，「${auxiliaryGod}」為輔助用神。透過${s}的策略，兩者協同作用可有效調節五行能量，達到陰陽平衡，提升整體運勢發展。在日常生活中，可通過相應的顏色、方位、職業選擇等方式來強化這些有利元素的影響力。`
					: "",
		};
	}

	function calculateWuxingAnalysis(birthDateTime, genderParam) {
		if (!birthDateTime) return null;
		const wuxingData = getWuxingData(birthDateTime, genderParam || "male");
		if (!wuxingData) return null;
		const elementCounts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
		[
			wuxingData.yearStemWuxing,
			wuxingData.yearBranchWuxing,
			wuxingData.monthStemWuxing,
			wuxingData.monthBranchWuxing,
			wuxingData.dayStemWuxing,
			wuxingData.dayBranchWuxing,
			wuxingData.hourStemWuxing,
			wuxingData.hourBranchWuxing,
		].forEach((w) => {
			if (w && elementCounts[w] !== undefined) elementCounts[w]++;
		});
		const missingElements = Object.entries(elementCounts)
			.filter(([, c]) => c === 0)
			.map(([e]) => e);
		const strengthAnalysis = analyzeWuxingStrength(elementCounts);
		const usefulGods = determineUsefulGods(strengthAnalysis);
		return {
			wuxingData,
			elementCounts,
			missingElements,
			strengthAnalysis,
			usefulGods,
		};
	}

	function calculateComprehensiveElementDistribution(userInfo) {
		if (!userInfo?.birthDateTime) return null;
		try {
			const wuxingData = getWuxingData(
				userInfo.birthDateTime,
				userInfo.gender,
			);
			if (!wuxingData) return null;
			const elementCounts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
			[
				wuxingData.yearStemWuxing,
				wuxingData.monthStemWuxing,
				wuxingData.dayStemWuxing,
				wuxingData.hourStemWuxing,
			].forEach((el) => {
				if (elementCounts[el] !== undefined) elementCounts[el] += 3;
			});
			[
				wuxingData.yearBranchWuxing,
				wuxingData.monthBranchWuxing,
				wuxingData.dayBranchWuxing,
				wuxingData.hourBranchWuxing,
			].forEach((el) => {
				if (elementCounts[el] !== undefined) elementCounts[el] += 2;
			});
			[
				wuxingData.yearBranchHiddenStems,
				wuxingData.monthBranchHiddenStems,
				wuxingData.dayBranchHiddenStems,
				wuxingData.hourBranchHiddenStems,
			].forEach((data) => {
				if (Array.isArray(data))
					data.forEach((stem) => {
						if (
							stem?.element &&
							elementCounts[stem.element] !== undefined
						)
							elementCounts[stem.element] += 1;
					});
			});
			const elementStrengthMap = {};
			Object.entries(elementCounts).forEach(([el, count]) => {
				if (count >= 15) elementStrengthMap[el] = "★★★★★";
				else if (count >= 12) elementStrengthMap[el] = "★★★★";
				else if (count >= 8) elementStrengthMap[el] = "★★★";
				else if (count >= 5) elementStrengthMap[el] = "★★";
				else if (count > 0) elementStrengthMap[el] = "★";
				else elementStrengthMap[el] = "";
			});
			return { elementCounts, elementStrengthMap, wuxingData };
		} catch (e) {
			return null;
		}
	}

	useEffect(() => {
		const loadData = async () => {
			if (!birthday || !birthTime) {
				setIsLoading(false);
				return;
			}
			try {
				setIsLoading(true);
				const hourMatch = birthTime.match(/(\d+):00/);
				const hour = hourMatch ? hourMatch[1] : "12";
				const fullDateTime = `${birthday} ${hour}:00`;
				const userInfo = { birthDateTime: fullDateTime, gender };

				const analysis = calculateWuxingAnalysis(fullDateTime, gender);
				if (!analysis) throw new Error("Failed to calculate Wu Xing");
				setFullAnalysis(analysis);

				const dist =
					calculateComprehensiveElementDistribution(userInfo);
				setElementDistribution(dist);

				const wuxingData = analysis.wuxingData;
				// Use same prompt generators as web so API returns same structure
				const healthPrompt = generateHealthFortunePrompt(
					userInfo,
					wuxingData,
				);
				const careerPrompt = generateCareerFortunePrompt(
					userInfo,
					wuxingData,
				);
				const wealthPrompt = generateWealthFortunePrompt(
					userInfo,
					wuxingData,
				);
				const relationshipPrompt = generateRelationshipFortunePrompt(
					userInfo,
					wuxingData,
				);

				const [
					pillarRes,
					flowRes,
					wuxingRes,
					healthRes,
					careerRes,
					wealthRes,
					relationshipRes,
				] = await Promise.all([
					fetch("/api/report-pillar-data", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							birthDateTime: fullDateTime,
							gender,
							locale,
						}),
					}).then((r) => r.json()),
					fetch("/api/element-flow-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ userInfo }),
					}).then((r) => r.json()),
					fetch("/api/wuxing-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ userInfo }),
					}).then((r) => r.json()),
					fetch("/api/health-fortune-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo,
							wuxingData,
							prompt: healthPrompt,
						}),
					}).then((r) => r.json()),
					fetch("/api/career-fortune-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo,
							wuxingData,
							prompt: careerPrompt,
						}),
					}).then((r) => r.json()),
					fetch("/api/wealth-fortune-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo,
							wuxingData,
							prompt: wealthPrompt,
						}),
					}).then((r) => r.json()),
					fetch("/api/relationship-fortune-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo,
							wuxingData,
							prompt: relationshipPrompt,
						}),
					}).then((r) => r.json()),
				]);

				if (pillarRes && !pillarRes.error) setReportDocData(pillarRes);
				if (flowRes?.flowObstacles) setElementFlowAnalysis(flowRes);
				else if (flowRes?.analysis?.flowObstacles)
					setElementFlowAnalysis(flowRes.analysis);
				if (wuxingRes?.analysis)
					setWuxingAnalysisResult(wuxingRes.analysis);

				// Only use analysis with expected structure (same as web); reject error-shaped responses (e.g. { response: "請提供..." })
				const valid = (res) =>
					res?.analysis &&
					typeof res.analysis === "object" &&
					!res.analysis.response &&
					(res.analysis.summary ||
						res.analysis.systems ||
						res.analysis.talents ||
						res.analysis.phases ||
						res.analysis.threeStages ||
						res.analysis.sections ||
						res.analysis.authenticity ||
						res.analysis.romanticCycles);
				setFourFortuneData({
					health: valid(healthRes)
						? { analysis: healthRes.analysis }
						: null,
					career: valid(careerRes)
						? { analysis: careerRes.analysis }
						: null,
					wealth: valid(wealthRes)
						? { analysis: wealthRes.analysis }
						: null,
					relationship: valid(relationshipRes)
						? { analysis: relationshipRes.analysis }
						: null,
				});
			} catch (err) {
				console.error("Life print report load error:", err);
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, [birthday, birthTime, gender, locale]);

	useEffect(() => {
		document.body.classList.add("print-report-view");
		return () => document.body.classList.remove("print-report-view");
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#EFEFEF]">
				<div className="text-center">
					<div className="w-12 h-12 mx-auto mb-4 border-b-2 border-teal-600 rounded-full animate-spin" />
					<p>生成命理報告中...</p>
				</div>
			</div>
		);
	}

	if (!fullAnalysis?.wuxingData) {
		return (
			<div className="p-8 text-center min-h-screen flex items-center justify-center">
				無法生成報告，請檢查出生日期與時辰
			</div>
		);
	}

	const fullDateTime = `${birthday} ${birthTime.match(/(\d+):00/)?.[1] || "12"}:00`;
	const wuxingAnalysisForPage1 = {
		elementCounts: fullAnalysis.elementCounts,
		missingElements: fullAnalysis.missingElements,
	};
	const usefulGods =
		fullAnalysis.usefulGods ||
		determineUsefulGods(fullAnalysis.strengthAnalysis);
	const aiContentForPage2 = usefulGods.adviceText || "";
	const parsePillar = (str) =>
		!str || str.length < 2
			? { heavenly: "", earthly: "" }
			: { heavenly: str[0], earthly: str[1] };
	const wd = fullAnalysis.wuxingData;
	const baziData = {
		fourPillars: {
			year: parsePillar(wd.year),
			month: parsePillar(wd.month),
			day: parsePillar(wd.day),
			hour: parsePillar(wd.hour),
		},
		dayMaster: wd.dayStem,
	};
	const birthTimeDisplay = birthTime.split("(")[0] || birthTime;

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
					<h1 className="text-xl font-bold">命理報告 - 預覽</h1>
				</div>
				<button
					onClick={() => window.print()}
					className="px-6 py-2 font-bold text-white rounded-lg hover:bg-teal-700"
					style={{ backgroundColor: "#0d9488" }}
				>
					列印報告
				</button>
			</div>

			<div className="print-report-pages bg-[#E5E7EB] py-8 px-4 min-h-screen">
				<LifePrintCoverPage
					productName={productName}
					baziData={baziData}
					wuxingAnalysis={wuxingAnalysisForPage1}
					analyzeWuxingStrength={analyzeWuxingStrength}
				/>

				{/* Pages 3–4: 四柱排盤 年柱+月柱, 日柱+時柱 */}
				<LifePrintPillars34
					reportDocData={reportDocData}
					wuxingData={fullAnalysis?.wuxingData}
				/>

				{/* Page 5: 五行分布表 + 五行流通阻礙點 */}
				<LifePrintPage5
					elementDistribution={elementDistribution}
					elementFlowAnalysis={elementFlowAnalysis}
				/>

				{/* Pages 6–7: 十神格局與內在關聯 */}
				<LifePrintTenGods
					tenGodsAnalysis={wuxingAnalysisResult?.tenGodsAnalysis}
					wuxingData={fullAnalysis?.wuxingData}
				/>

				{/* Page 8: 核心矛盾 + 化解提示 */}
				<LifePrintResolveTips
					lifeAdvice={wuxingAnalysisResult?.lifeAdvice}
					tenGodsAnalysis={wuxingAnalysisResult?.tenGodsAnalysis}
				/>

				{/* Pages 9–10: 健康+事業, 財運+感情 */}
				<LifePrintFourFortune fourFortuneData={fourFortuneData} />
			</div>

			<style jsx global>{`
				@media print {
					.no-print {
						display: none !important;
					}
					.print-report-pages {
						background: white !important;
						padding: 0 !important;
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
						min-height: 297mm !important;
						max-height: none !important;
						overflow: visible !important;
						box-sizing: border-box;
						margin: 0 !important;
						box-shadow: none !important;
						border: none !important;
					}
					.page-break:last-child {
						page-break-after: auto;
					}
				}
				@media screen {
					.page-break {
						width: 210mm;
						min-height: 297mm;
						max-height: none;
						overflow: hidden;
						box-sizing: border-box;
						margin: 0 auto 20px;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						border: 1px solid #d1d5db;
						position: relative;
						background: white;
					}
				}
			`}</style>
		</>
	);
}

export default function LifePrintReportView() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					Loading...
				</div>
			}
		>
			<LifePrintReportViewInner />
		</Suspense>
	);
}
