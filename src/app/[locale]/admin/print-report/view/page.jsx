"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BaziCalculator } from "@/lib/baziCalculator";
import getWuxingData from "@/lib/nayin.js";
import Image from "next/image";
import { getConcernColor } from "@/utils/colorTheme";
import { MingJu } from "@/components/MingJu";
import Page4_2026Overview from "./components/Page4_2026Overview";
import Page5_6_CareerDetailed from "./components/Page5_6_CareerDetailed";
import Page7_Seasons from "./components/Page7_Seasons";

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
	const [isLoading, setIsLoading] = useState(true);

	// Get parameters from URL
	const concern = searchParams.get("concern") || "事業";
	const gender = searchParams.get("gender") || "male";
	const birthday = searchParams.get("birthday") || "";
	const birthTime = searchParams.get("birthTime") || "";
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
				const [questionData, ganzhiData, jixiongResult, seasonResult] =
					await Promise.all([
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
										if (month >= 2 && month <= 4)
											return "春季";
										if (month >= 5 && month <= 7)
											return "夏季";
										if (month >= 8 && month <= 10)
											return "秋季";
										return "冬季";
									})(),
									relevantSeasons: (() => {
										const month = new Date().getMonth() + 1;
										if (month >= 2 && month <= 4)
											return [
												"春季",
												"夏季",
												"秋季",
												"冬季",
											];
										if (month >= 5 && month <= 7)
											return [
												"夏季",
												"秋季",
												"冬季",
												"春季",
											];
										if (month >= 8 && month <= 10)
											return [
												"秋季",
												"冬季",
												"春季",
												"夏季",
											];
										return ["冬季", "春季", "夏季", "秋季"];
									})(),
								},
								locale: locale,
							}),
						}).then((res) => res.json()),
					]);

				console.log("Question Focus API response:", questionData);
				console.log("GanZhi Analysis API response:", ganzhiData);
				console.log("JiXiong Analysis API response:", jixiongResult);
				console.log("Season Analysis API response:", seasonResult);

				// Process Question Focus
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

			{/* A4 Page */}
			<div
				className="mx-auto mt-20 bg-white print-container "
				style={{
					minHeight: "297mm",
					padding: "20mm 15mm",
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<h1
						className="text-3xl font-bold"
						style={{ color: getConcernColor(concern) }}
					>
						基礎分析
					</h1>
					<div className="text-right">
						<div className="text-sm text-gray-600">
							{new Date()
								.toLocaleDateString("zh-TW")
								.replace(/\//g, "/")}
						</div>
						<div className="text-lg text-gray-600">
							生辰：
							{new Date(birthday).toLocaleDateString(
								"zh-TW",
							)}{" "}
							{birthTime.split("(")[0]}
						</div>
					</div>
				</div>

				{/* BaZi Chart - Matching 1.png exactly */}
				{wuxingAnalysis &&
					baziData &&
					(() => {
						// Get zodiac animal based on year branch
						const yearBranch = baziData.fourPillars.year.earthly;
						const branchToAnimal = {
							子: "mouse",
							丑: "cow",
							寅: "tiger",
							卯: "rabbit",
							辰: "dragon",
							巳: "snake",
							午: "horse",
							未: "sheep",
							申: "monkey",
							酉: "chicken",
							戌: "dog",
							亥: "pig",
						};
						const animalName =
							branchToAnimal[yearBranch] || "rabbit";

						return (
							<div className="p-8 mb-8 border-2 border-gray-400 rounded-2xl">
								<div className="flex gap-12">
									{/* Left side: Zodiac Animal with calligraphy style */}
									<div className="flex-shrink-0">
										<div className="relative w-48 h-48">
											{/* Pink circle background */}
											<div className="absolute inset-0 bg-pink-100 rounded-full opacity-60"></div>
											{/* Animal image */}
											<Image
												src={`/images/animals/${animalName}.png`}
												alt="zodiac"
												width={192}
												height={192}
												className="relative z-10 object-contain"
											/>
										</div>
									</div>

									{/* Right side: Four Pillars */}
									<div className="flex-1">
										<div className="flex items-center gap-6">
											{/* Labels column */}
											<div className="flex flex-col gap-12 text-center">
												<div className="text-sm text-gray-500">
													天
												</div>
												<div className="h-4 mx-auto border-l-2 border-gray-300 border-dashed"></div>
												<div className="text-sm text-gray-500">
													地
												</div>
											</div>

											{/* Pillars */}
											<div className="flex gap-4">
												{[
													{
														key: "year",
														label: "年",
														bgColor: "#B8A870",
													},
													{
														key: "month",
														label: "月",
														bgColor: "#B8A870",
													},
													{
														key: "day",
														label: "日",
														bgColor: "#8B9556",
													},
													{
														key: "hour",
														label: "時",
														bgColor: "#B4003C",
													},
												].map((pillar) => {
													const pillarData =
														baziData.fourPillars?.[
															pillar.key
														];
													if (!pillarData)
														return null;
													return (
														<div
															key={pillar.key}
															className="flex flex-col items-center gap-1"
														>
															<div className="mb-1 text-sm text-gray-600">
																{pillar.label}
															</div>
															<div
																className="flex items-center justify-center w-16 h-20 text-2xl font-bold text-white"
																style={{
																	backgroundColor:
																		pillar.bgColor,
																}}
															>
																{
																	pillarData.heavenly
																}
															</div>
															<div
																className="flex items-center justify-center w-16 h-20 text-2xl font-bold text-white"
																style={{
																	backgroundColor:
																		pillar.bgColor,
																}}
															>
																{
																	pillarData.earthly
																}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									</div>
								</div>

								{/* Bottom section: Five Elements + Info boxes */}
								{wuxingAnalysis &&
									(() => {
										const strengthAnalysis =
											analyzeWuxingStrength(
												wuxingAnalysis.elementCounts,
											);
										const colors = {
											金: "#B2A062",
											木: "#567156",
											水: "#939393",
											火: "#B4003C",
											土: "#DEAB20",
										};

										return (
											<div className="flex gap-8 mt-8">
												{/* Left: Five Elements Chart (smaller) */}
												<div className="w-1/2">
													<div className="flex items-end justify-center gap-3 mb-2 h-28">
														{Object.entries(
															wuxingAnalysis.elementCounts,
														).map(
															([
																element,
																count,
															]) => {
																const height =
																	count * 20 +
																	20;
																return (
																	<div
																		key={
																			element
																		}
																		className="flex flex-col items-center"
																	>
																		<div
																			className="w-12"
																			style={{
																				backgroundColor:
																					colors[
																						element
																					],
																				height: `${height}px`,
																			}}
																		></div>
																		<div
																			className="flex items-center justify-center gap-1 mt-1 text-xs font-bold"
																			style={{
																				height: "20px",
																			}}
																		>
																			<Image
																				src={`/images/elements/${element}.png`}
																				alt={
																					element
																				}
																				width={
																					16
																				}
																				height={
																					16
																				}
																				className="inline-block"
																			/>
																			<span>
																				{
																					element
																				}
																				{
																					count
																				}
																			</span>
																		</div>
																	</div>
																);
															},
														)}
													</div>
												</div>

												{/* Right: Info boxes */}
												<div className="flex flex-col justify-center w-1/2 space-y-2">
													<div className="px-4 py-3 font-bold text-center text-white bg-black">
														五行 -{" "}
														{
															strengthAnalysis.strengthDesc
														}
													</div>
													<div className="px-4 py-2 text-sm text-center text-white bg-black">
														{wuxingAnalysis
															.missingElements
															.length > 0
															? `${wuxingAnalysis.missingElements.join("、")}需要後天補充以達到平衡`
															: "五行齊全 - 沒有嚴重缺失某一元素"}
													</div>
												</div>
											</div>
										);
									})()}
							</div>
						);
					})()}

				{/* Quote Box */}
				{wuxingAnalysis &&
					(() => {
						const strengthAnalysis = analyzeWuxingStrength(
							wuxingAnalysis.elementCounts,
						);
						const usefulGods =
							determineUsefulGods(strengthAnalysis);
						return (
							<div className="p-6 mb-8 italic text-gray-700">
								根據您的五行配置分析，建議以「
								{usefulGods.primaryGod || "木"}」為吉運用神，「
								{usefulGods.auxiliaryGod || "金"}
								」為幫助用神。應優先運用性質具有成長性行動或有效調節的行動，達到提升整體運勢的效果。在日常生活中，可通過相關聯服方位、色系、職業選擇方式來達到起運的影響力。
							</div>
						);
					})()}

				{/* Analysis Sections */}
				<div className="space-y-6">
					{/* Combined Section with Left Vertical Text */}
					<div className="p-8 border-2 border-gray-300">
						<div className="flex gap-8">
							{/* Left: Vertical text "疑問" + "重點" */}
							<div className="flex items-start flex-shrink-0 gap-2">
								<div
									className="flex flex-col"
									style={{ writingMode: "vertical-rl" }}
								>
									<span className="text-6xl font-bold tracking-wider text-gray-700">
										疑問
									</span>
								</div>
								<div
									className="flex flex-col"
									style={{ writingMode: "vertical-rl" }}
								>
									<span
										className="text-6xl font-bold tracking-wider"
										style={{
											color: getConcernColor(concern),
										}}
									>
										重點
									</span>
								</div>
							</div>

							{/* Right: Content */}
							<div className="flex-1 pl-8 border-l-2 border-gray-400">
								{/* Title */}
								<h2 className="mb-6 text-2xl font-bold text-gray-800">
									一般{concern}分析
								</h2>

								{/* Subtitle in concern color */}
								<h3
									className="mb-4 text-xl font-bold"
									style={{ color: getConcernColor(concern) }}
								>
									{concern}分析指導
								</h3>

								{/* Content */}
								<div className="leading-relaxed text-gray-800 whitespace-pre-wrap">
									{aiContent ||
										questionFocus?.content ||
										"載入中..."}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Page 2 & 3: MingJu Analysis */}
				<div
					style={{ pageBreakBefore: "always", padding: "20mm 15mm" }}
				>
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
				</div>

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
			</div>

			{/* Print Styles */}
			<style jsx global>{`
				@media print {
					.no-print {
						display: none !important;
					}
					.print-container {
						margin: 0 auto !important;
						padding: 20mm 15mm !important;
					}
					@page {
						size: A4;
						margin: 0;
					}
					body {
						print-color-adjust: exact;
						-webkit-print-color-adjust: exact;
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
