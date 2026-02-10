"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BaziCalculator } from "@/lib/baziCalculator";
import getWuxingData from "@/lib/nayin.js";
import Image from "next/image";
import { getConcernColor } from "@/utils/colorTheme";
import { MingJu } from "@/components/MingJu";
import CoverPage from "./components/CoverPage";
import Page1_BasicAnalysis from "./components/Page1_BasicAnalysis";
import Page2_MingJu_DayMaster from "./components/Page2_MingJu_DayMaster";
import Page3_MingJu_RightTab from "./components/Page3_MingJu_RightTab";
import Page2_DayMasterTraits from "./components/Page2_DayMasterTraits";
import Page3_WealthPosition from "./components/Page3_WealthPosition";
import Page4_2026Overview from "./components/Page4_2026Overview";
import Page5_6_CareerDetailed from "./components/Page5_6_CareerDetailed";
import Page7_Seasons from "./components/Page7_Seasons";
import Page8_9_Recommendations from "./components/Page8_9_Recommendations";
import Page10_Summary from "./components/Page10_Summary";

function PrintReportView() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = useLocale();

	const [aiContent, setAiContent] = useState(null);
	const [questionFocus, setQuestionFocus] = useState(null);
	const [baziData, setBaziData] = useState(null);
	const [wuxingAnalysis, setWuxingAnalysis] = useState(null);
	const [ganzhiAnalysis, setGanzhiAnalysis] = useState(null);
	const [jixiongData, setJixiongData] = useState(null);
	const [seasonData, setSeasonData] = useState(null);
	const [coreSuggestionData, setCoreSuggestionData] = useState(null);
	const [overallSummaryData, setOverallSummaryData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Get parameters from URL
	const concern = searchParams.get("concern") || "事業";
	const gender = searchParams.get("gender") || "male";
	const name = searchParams.get("name") || "";
	const birthday = searchParams.get("birthday") || "";
	const birthTime = searchParams.get("birthTime") || "";
	const productName = searchParams.get("productName") || "梨花木鑰匙珠砂掛墜";
	const question =
		searchParams.get("question") || `我想了解我的${concern}運勢`;

	// Helper functions from web-side (copied to avoid affecting web-side)
	const calculateWuxingAnalysis = (birthDateTime, genderParam) => {
		if (!birthDateTime) return null;

		const wuxingData = getWuxingData(birthDateTime, genderParam || "male");
		if (!wuxingData) return null;

		// Count elements in the four pillars
		const elementCounts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };

		// Count year stem and branch
		if (wuxingData.yearStemWuxing)
			elementCounts[wuxingData.yearStemWuxing]++;
		if (wuxingData.yearBranchWuxing)
			elementCounts[wuxingData.yearBranchWuxing]++;

		// Count month stem and branch
		if (wuxingData.monthStemWuxing)
			elementCounts[wuxingData.monthStemWuxing]++;
		if (wuxingData.monthBranchWuxing)
			elementCounts[wuxingData.monthBranchWuxing]++;

		// Count day stem and branch
		if (wuxingData.dayStemWuxing) elementCounts[wuxingData.dayStemWuxing]++;
		if (wuxingData.dayBranchWuxing)
			elementCounts[wuxingData.dayBranchWuxing]++;

		// Count hour stem and branch
		if (wuxingData.hourStemWuxing)
			elementCounts[wuxingData.hourStemWuxing]++;
		if (wuxingData.hourBranchWuxing)
			elementCounts[wuxingData.hourBranchWuxing]++;

		// Find missing elements
		const missingElements = Object.entries(elementCounts)
			.filter(([_, count]) => count === 0)
			.map(([element, _]) => element);

		return {
			wuxingData,
			elementCounts,
			missingElements,
		};
	};

	const analyzeWuxingStrength = (elementCounts) => {
		const total = Object.values(elementCounts).reduce(
			(sum, count) => sum + count,
			0,
		);
		const strongElements = [];
		const weakElements = [];

		Object.entries(elementCounts).forEach(([element, count]) => {
			const percentage = (count / total) * 100;
			if (percentage >= 25) {
				strongElements.push(element);
			} else if (count === 0) {
				weakElements.push(element);
			}
		});

		// Generate strength description
		let strengthDesc = "";
		if (strongElements.length === 1) {
			strengthDesc = `${strongElements[0]}旺`;
		} else if (strongElements.length === 2) {
			strengthDesc = `${strongElements.join("")}兩旺`;
		} else if (strongElements.length >= 3) {
			strengthDesc = `${strongElements.slice(0, 2).join("")}等多旺`;
		} else {
			const maxCount = Math.max(...Object.values(elementCounts));
			const dominant = Object.entries(elementCounts).find(
				([_, count]) => count === maxCount,
			)?.[0];
			strengthDesc = dominant ? `${dominant}為主` : "五行平衡";
		}

		return {
			strongElements,
			weakElements,
			strengthDesc,
			elementCounts,
		};
	};

	const determineUsefulGods = (strengthAnalysis) => {
		const { strongElements, weakElements, elementCounts } =
			strengthAnalysis;
		const elementCycle = ["木", "火", "土", "金", "水"];

		let primaryGod = "";
		let auxiliaryGod = "";

		// If there are missing elements, they become useful gods
		if (weakElements.length > 0) {
			primaryGod = weakElements[0];
			if (weakElements.length > 1) {
				auxiliaryGod = weakElements[1];
			} else {
				const primaryIndex = elementCycle.indexOf(primaryGod);
				const generatorIndex = (primaryIndex - 1 + 5) % 5;
				auxiliaryGod = elementCycle[generatorIndex];
			}
		}

		return { primaryGod, auxiliaryGod };
	};

	// No longer needed - we use wuxingData directly which is accurate

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);

				// 1. Calculate BaZi using web-side method
				const fullDateTime = `${birthday} ${birthTime.match(/(\d+):00/)?.[1] || "12"}:00`;
				const wuxingResult = calculateWuxingAnalysis(
					fullDateTime,
					gender,
				);

				if (!wuxingResult)
					throw new Error("Failed to calculate Wu Xing");
				setWuxingAnalysis(wuxingResult);

				// Use wuxingData for accurate BaZi display
				// Parse the pillar strings (e.g., "己卯" -> { heavenly: "己", earthly: "卯" })
				const parsePillar = (pillarStr) => {
					if (!pillarStr || pillarStr.length < 2)
						return { heavenly: "", earthly: "" };
					return { heavenly: pillarStr[0], earthly: pillarStr[1] };
				};

				setBaziData({
					fourPillars: {
						year: parsePillar(wuxingResult.wuxingData.year),
						month: parsePillar(wuxingResult.wuxingData.month),
						day: parsePillar(wuxingResult.wuxingData.day),
						hour: parsePillar(wuxingResult.wuxingData.hour),
					},
					dayMaster: wuxingResult.wuxingData.dayStem,
				});

				console.log("BaZi Data set:", {
					year: wuxingResult.wuxingData.year,
					month: wuxingResult.wuxingData.month,
					day: wuxingResult.wuxingData.day,
					hour: wuxingResult.wuxingData.hour,
				});

				// 2. Call Question Focus API (same as web-side)
				// 2-4. Call all APIs in parallel to speed up loading
				const [
					questionData,
					ganzhiData,
					jixiongResult,
					seasonResult,
					specificSuggestionResult,
					overallSummaryResult,
				] = await Promise.all([
					// Question Focus API
					fetch("/api/question-focus-simple", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							baziData: {
								year: wuxingResult.wuxingData.year,
								month: wuxingResult.wuxingData.month,
								day: wuxingResult.wuxingData.day,
								hour: wuxingResult.wuxingData.hour,
								dayMaster: wuxingResult.wuxingData.dayStem,
								dayElement:
									wuxingResult.wuxingData.dayStemWuxing,
							},
							concern: concern,
							problem: question,
							locale: locale,
						}),
					}).then((res) => res.json()),

					// GanZhi Analysis API (Page 4)
					fetch("/api/ganzhi-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo: {
								concern: concern,
								problem: question,
								birthDateTime: birthday,
								gender: gender,
							},
							baziData: {
								year: wuxingResult.wuxingData.year,
								month: wuxingResult.wuxingData.month,
								day: wuxingResult.wuxingData.day,
								hour: wuxingResult.wuxingData.hour,
								dayMaster: wuxingResult.wuxingData.dayStem,
								dayElement:
									wuxingResult.wuxingData.dayStemWuxing,
							},
							currentYear: new Date().getFullYear(),
							locale: locale,
						}),
					}).then((res) => res.json()),

					// JiXiong Analysis API (Pages 5-6)
					fetch("/api/jixiong-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo: {
								birthday: birthday,
								gender: gender,
								time: birthTime,
								concern: concern,
							},
							baziData: {
								year: wuxingResult.wuxingData.year,
								month: wuxingResult.wuxingData.month,
								day: wuxingResult.wuxingData.day,
								hour: wuxingResult.wuxingData.hour,
								dayMaster: wuxingResult.wuxingData.dayStem,
								dayElement:
									wuxingResult.wuxingData.dayStemWuxing,
							},
							locale: locale,
						}),
					}).then((res) => res.json()),

					// Season Analysis API (Page 7) - Same as web side
					fetch("/api/season-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo: {
								birthday: birthday,
								gender: gender,
								time: birthTime,
								concern: concern,
							},
							currentDate: {
								year: new Date().getFullYear(),
								month: new Date().getMonth() + 1,
								currentSeason: (() => {
									const month = new Date().getMonth() + 1;
									if (month >= 2 && month <= 4) return "春季";
									if (month >= 5 && month <= 7) return "夏季";
									if (month >= 8 && month <= 10)
										return "秋季";
									return "冬季";
								})(),
								relevantSeasons: (() => {
									const month = new Date().getMonth() + 1;
									if (month >= 2 && month <= 4)
										return ["春季", "夏季", "秋季", "冬季"];
									if (month >= 5 && month <= 7)
										return ["夏季", "秋季", "冬季", "春季"];
									if (month >= 8 && month <= 10)
										return ["秋季", "冬季", "春季", "夏季"];
									return ["冬季", "春季", "夏季", "秋季"];
								})(),
							},
							locale: locale,
						}),
					}).then((res) => res.json()),

					// Specific Suggestion Analysis API (Pages 8-9: 針對性建議 + 禁忌行為)
					fetch("/api/specific-suggestion-analysis", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userInfo: {
								birthday: birthday,
								gender: gender,
								time: birthTime,
								concern: concern,
							},
							locale: locale,
						}),
					}).then((res) => res.json()),

					// Overall Summary Analysis API (Page 10: 破關成蝶，格局煥新)
					// This call needs to happen AFTER other APIs to use their data
					// For now, we'll make the call and update it with real data after
					Promise.resolve({ success: false, placeholder: true }),
				]);

				console.log("Question Focus API response:", questionData);
				console.log("Season Analysis API response:", seasonResult);
				console.log(
					"Specific Suggestion API response:",
					specificSuggestionResult,
				);
				console.log(
					"Overall Summary API response:",
					overallSummaryResult,
				);

				if (questionData.success && questionData.solution) {
					setQuestionFocus(questionData.solution);
					if (questionData.solution.content) {
						let content = questionData.solution.content;
						content = content.replace(
							/您好，根據您提供的八字（[^）]+）[^：]+：\s*/g,
							"",
						);
						setAiContent(content);
					}
				} else {
					setAiContent(`您的${concern}運勢分析...`);
				}

				// Process GanZhi Analysis
				if (ganzhiData.success && ganzhiData.analysis) {
					setGanzhiAnalysis(ganzhiData.analysis);
				}

				// Process JiXiong Analysis
				if (jixiongResult.success && jixiongResult.analysis) {
					setJixiongData(jixiongResult.analysis);
				}

				// Process Season Analysis
				if (seasonResult.success && seasonResult.analysis) {
					setSeasonData(seasonResult.analysis);
				}

				// Process Specific Suggestion Analysis (針對性建議 + 禁忌行為)
				if (
					specificSuggestionResult.success &&
					specificSuggestionResult.data
				) {
					setCoreSuggestionData(specificSuggestionResult.data);
				}

				// Now call Overall Summary with real data from previous APIs
				const overallSummaryApiResult = await fetch(
					"/api/overall-summary",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							locale: locale,
							concernType: concern,
							questionFocusData:
								questionData.solution?.content || "",
							ganzhiData: ganzhiData.analysis || null,
							specificSuggestionData:
								specificSuggestionResult.data || null,
						}),
					},
				).then((res) => res.json());

				console.log(
					"Overall Summary API (with real data):",
					overallSummaryApiResult,
				);

				// Process Overall Summary Analysis (破關成蝶，格局煥新)
				if (
					overallSummaryApiResult.success &&
					overallSummaryApiResult.data
				) {
					setOverallSummaryData(overallSummaryApiResult.data);
				}

				setIsLoading(false);
			} catch (error) {
				console.error("Error loading data:", error);
				setAiContent(`載入失敗，請重試`);
				setIsLoading(false);
			}
		};

		if (birthday && birthTime) {
			loadData();
		}
	}, [birthday, birthTime, gender, concern, question, locale]);

	// Mark body so global print styles are skipped — print should match screen
	useEffect(() => {
		document.body.classList.add("print-report-view");
		return () => document.body.classList.remove("print-report-view");
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-12 h-12 mx-auto mb-4 border-b-2 border-gray-900 rounded-full animate-spin"></div>
					<p>生成報告中...</p>
				</div>
			</div>
		);
	}

	if (!baziData) {
		return (
			<div className="p-8 text-center">無法生成報告，請檢查輸入資料</div>
		);
	}

	return (
		<>
			{/* No-print controls */}
			<div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full p-4 bg-white shadow-md no-print">
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.back()}
						className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
					>
						返回
					</button>
					<h1 className="text-xl font-bold">
						{concern}報告 - 預覽模式
					</h1>
				</div>
				<button
					onClick={() => window.print()}
					className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
				>
					列印報告
				</button>
			</div>

			{/* Cover Page */}
			<CoverPage concern={concern} productName={productName} />

			<Page1_BasicAnalysis
				name={name}
				birthday={birthday}
				birthTime={birthTime}
				concern={concern}
				baziData={baziData}
				wuxingAnalysis={wuxingAnalysis}
				aiContent={aiContent}
				analyzeWuxingStrength={analyzeWuxingStrength}
			/>

			{/* Pages 2 & 3: MingJu Analysis */}
			<MingJu
				userInfo={{
					birthDateTime: birthday,
					gender: gender,
					concern: concern,
					problem: question,
				}}
				currentYear={new Date().getFullYear()}
				isPrintMode={true}
			/>

			{/* Page 4: 2026 Year Analysis */}
			{ganzhiAnalysis && (
				<Page4_2026Overview
					data={{
						year: {
							// Pass the raw AI analysis text
							aiAnalysis:
								ganzhiAnalysis.aiAnalysis || ganzhiAnalysis,
						},
						concern: concern,
						color: getConcernColor({ concern: concern }),
					}}
				/>
			)}

			{/* Pages 5-6: JiXiong Analysis (吉象 and 凶象) */}
			{jixiongData && (
				<Page5_6_CareerDetailed
					data={{
						jixiong: jixiongData.parsed || jixiongData,
						concern: concern,
						color: getConcernColor({ concern: concern }),
					}}
				/>
			)}

			{/* Page 7: Seasonal Analysis (關鍵季節) */}
			{seasonData && seasonData.parsed?.seasons && (
				<>
					{console.log("🌸 Page7 season data check:", {
						hasSeasonData: !!seasonData,
						hasParsed: !!seasonData.parsed,
						seasonsCount: seasonData.parsed?.seasons?.length,
					})}
					<Page7_Seasons
						data={{
							seasons: seasonData.parsed.seasons,
							concern: concern,
							color: getConcernColor({ concern: concern }),
						}}
					/>
				</>
			)}

			{/* Pages 8-9: 針對性建議 + 禁忌行為 */}
			{coreSuggestionData &&
				(coreSuggestionData.suggestions ||
					coreSuggestionData.taboos) && (
					<Page8_9_Recommendations
						data={{
							summary: coreSuggestionData,
							concern: concern,
							color: getConcernColor({ concern: concern }),
						}}
					/>
				)}

			{/* Page 10: 破關成蝶，格局煥新 */}
			{overallSummaryData && (
				<Page10_Summary
					data={{
						summary: overallSummaryData,
						concern: concern,
						color: getConcernColor({ concern: concern }),
					}}
				/>
			)}

			{/* Print Styles - aligned with screen so print preview matches browser */}
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
					/* Remove container padding and background in print */
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
						/* Match screen padding: px-12 py-10 = 3rem 2.5rem so print matches browser */
						padding: 2.5rem 3rem !important;
						margin: 0 !important;
						box-shadow: none !important;
						border: none !important;
					}
					.page-break:last-child {
						page-break-after: auto;
					}
					/* Override globals.css print rules so report headings/colors match screen */
					.page-break h1 {
						font-size: 48px !important;
						margin-top: 0 !important;
						margin-bottom: 0 !important;
						line-height: 1 !important;
					}
					.page-break h2 {
						font-size: 48px !important;
						margin-top: 0 !important;
						margin-bottom: 0 !important;
					}
					.page-break h3 {
						font-size: 25px !important;
						margin-top: 0 !important;
						margin-bottom: 0 !important;
					}
					.page-break p,
					.page-break span,
					.page-break li {
						color: inherit !important;
					}
					/* Page 7 關鍵季節: preserve colored title in print (match browser size + color) */
					.page-break .page-7-title {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
						color: var(--page-7-title-color) !important;
					}
					/* Page 10 Summary: restore larger title and varied heading sizes so print matches screen */
					.page-break.page-10-summary h1 {
						font-size: 6rem !important;
						margin-bottom: 5rem !important;
					}
					.page-break.page-10-summary h2 {
						font-size: 2.25rem !important;
					}
					.page-break.page-10-summary h3.text-5xl {
						font-size: 2.25rem !important;
					}
					.page-break.page-10-summary h3.text-3xl {
						font-size: 1.875rem !important;
					}
					.page-break.page-10-summary h3.text-2xl {
						font-size: 1.5rem !important;
					}
					.page-break.page-10-summary h3.mb-6 {
						margin-bottom: 1.5rem !important;
					}
					.page-break.page-10-summary .text-base {
						font-size: 1rem !important;
					}
					.page-break.page-10-summary .text-sm {
						font-size: 0.875rem !important;
					}
					.page-break.page-10-summary .text-xl {
						font-size: 1.25rem !important;
					}
					.page-break.page-10-summary .text-2xl {
						font-size: 1.5rem !important;
					}
					/* Page 10: use same padding as component (15mm 20mm) so print matches browser */
					.page-break.page-10-summary {
						padding: 15mm 20mm !important;
					}
					/* Lock Page 10 spacing to px so print matches browser (rem can differ in print) */
					.page-break.page-10-summary .mb-1 {
						margin-bottom: 4px !important;
					}
					.page-break.page-10-summary .mb-2 {
						margin-bottom: 8px !important;
					}
					.page-break.page-10-summary .mb-5 {
						margin-bottom: 20px !important;
					}
					.page-break.page-10-summary .mb-6 {
						margin-bottom: 24px !important;
					}
					.page-break.page-10-summary .mb-8 {
						margin-bottom: 32px !important;
					}
					.page-break.page-10-summary .mb-10 {
						margin-bottom: 40px !important;
					}
					.page-break.page-10-summary .mb-16 {
						margin-bottom: 64px !important;
					}
					.page-break.page-10-summary .mb-20 {
						margin-bottom: 80px !important;
					}
					.page-break.page-10-summary .mt-8 {
						margin-top: 32px !important;
					}
					.page-break.page-10-summary .gap-6 {
						gap: 24px !important;
					}
					.page-break.page-10-summary .gap-8 {
						gap: 32px !important;
					}
					.page-break.page-10-summary .gap-12 {
						gap: 48px !important;
					}
					/* Preserve gradient/background-clip text in print */
					.page-break.page-10-summary [style*="backgroundClip"],
					.page-break.page-10-summary [style*="background-clip"] {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					/* MingJu wrappers: no extra margin/padding in print so spacing matches browser */
					.print-report-mingju-wrapper {
						margin-top: 0 !important;
						padding: 0 !important;
					}
					/* MingJu Page 2 (日主特性) & Page 3 (財星定位): same padding and headings as browser */
					.page-break.print-report-mingju-page2,
					.page-break.print-report-mingju-page3 {
						padding: 15mm 20mm !important;
					}
					.page-break.print-report-mingju-page2 h2,
					.page-break.print-report-mingju-page3 h2 {
						font-size: 48px !important;
						margin-top: 0 !important;
						margin-bottom: 0 !important;
						line-height: 110% !important;
					}
					.page-break.print-report-mingju-page2 h3,
					.page-break.print-report-mingju-page3 h3 {
						font-size: 17px !important;
						margin-top: 0 !important;
						margin-bottom: 5px !important;
					}
					.page-break.print-report-mingju-page2 p,
					.page-break.print-report-mingju-page3 p {
						font-size: 14px !important;
						line-height: 1.6 !important;
					}
					/* Page 7 關鍵季節: lock padding and spacing so print matches browser */
					.page-break.page-7-seasons {
						padding: 15mm 20mm !important;
					}
					.page-break.page-7-seasons .page-7-header {
						margin-bottom: 32px !important;
					}
					.page-break.page-7-seasons .page-7-title {
						font-size: 2.25rem !important;
						margin-top: 0 !important;
						margin-bottom: 0 !important;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
						color: var(--page-7-title-color) !important;
					}
					/* space-y-10 between season blocks = 40px */
					.page-break.page-7-seasons .space-y-10 > * + * {
						margin-top: 40px !important;
					}
					.page-break.page-7-seasons .mb-2 {
						margin-bottom: 8px !important;
					}
					.page-break.page-7-seasons .mb-8 {
						margin-bottom: 32px !important;
					}
					.page-break.page-7-seasons .py-6 {
						padding-top: 24px !important;
						padding-bottom: 24px !important;
					}
					.page-break.page-7-seasons .text-sm {
						font-size: 0.875rem !important;
					}
					.page-break.page-7-seasons .text-md {
						font-size: 1rem !important;
					}
					.page-break.page-7-seasons [style*="backgroundClip"],
					.page-break.page-7-seasons [style*="background-clip"] {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					/* Current-season 現 badge: keep red background and white text in print */
					.page-break.page-7-seasons .page-7-current-badge {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
						background-color: #DC2626 !important;
					}
					.page-break.page-7-seasons .page-7-current-badge span {
						color: white !important;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					@page {
						size: A4;
						margin: 0;
					}
				}
				/* Screen preview - show A4 page boundaries clearly */
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
					.page-break::before {
						content: "";
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 15mm;
						border-bottom: 1px dashed #e5e7eb;
						pointer-events: none;
					}
					.page-break::after {
						content: "";
						position: absolute;
						bottom: 0;
						left: 0;
						right: 0;
						height: 15mm;
						border-top: 1px dashed #e5e7eb;
						pointer-events: none;
					}
				}
			`}</style>
		</>
	);
}

export default function PrintReportViewPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PrintReportView />
		</Suspense>
	);
}
