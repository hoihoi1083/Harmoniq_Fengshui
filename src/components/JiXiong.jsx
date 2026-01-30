"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ComponentErrorBoundary } from "./ErrorHandling";

const JiXiong = memo(function JiXiong({
	userInfo,
	calculateWuxingAnalysis,
	analyzeWuxingStrength,
	determineUsefulGods,
	setGlobalReportData,
}) {
	const locale = useLocale();
	const t = useTranslations("fengShuiReport.components.jiXiong");
	const [analysisData, setAnalysisData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if userInfo is provided
	if (!userInfo) {
		return null;
	}

	useEffect(() => {
		const fetchJiXiongAnalysis = async () => {
			if (!userInfo) return;

			try {
				setIsLoading(true);
				setError(null);

				// Check if data already exists in component data store (for historical reports)
				if (
					typeof window !== "undefined" &&
					window.componentDataStore?.jiXiongAnalysis
				) {
					console.log(
						"📖 Using existing JiXiong data from component store",
					);
					setAnalysisData(window.componentDataStore.jiXiongAnalysis);
					setIsLoading(false);
					return;
				}

				console.log("� JiXiong generating fresh AI analysis");

				// Calculate traditional analysis data
				let calculatedWuxing = null;
				let strengthData = null;
				let usefulGodsData = null;

				if (calculateWuxingAnalysis) {
					calculatedWuxing = calculateWuxingAnalysis(userInfo);
				}

				if (analyzeWuxingStrength && calculatedWuxing) {
					strengthData = analyzeWuxingStrength(calculatedWuxing);
				}

				if (determineUsefulGods && strengthData) {
					usefulGodsData = determineUsefulGods(strengthData);
				}

				// Fetch AI-generated JiXiong analysis
				const response = await fetch("/api/jixiong-analysis", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userInfo: {
							birthday:
								userInfo.birthDateTime || userInfo.birthday,
							gender: userInfo.gender,
							time: userInfo.time || "00:00:00", // Default time if not provided
							concern: userInfo.concern || "財運",
						},
						locale: locale, // Pass locale for language-aware AI generation
					}),
				});

				if (!response.ok) {
					throw new Error(`API request failed: ${response.status}`);
				}

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || "Analysis failed");
				}

				// Check if we have valid analysis data
				if (result.analysis.parsed.error) {
					throw new Error(result.analysis.parsed.error);
				}

				// Check if we actually have content
				const hasJixiang =
					result.analysis.parsed.jixiang &&
					result.analysis.parsed.jixiang.length > 0;
				const hasXiongxiang =
					result.analysis.parsed.xiongxiang &&
					result.analysis.parsed.xiongxiang.length > 0;

				if (!hasJixiang && !hasXiongxiang) {
					throw new Error(
						"AI response was incomplete or truncated. Please try again.",
					);
				}

				const analysis = {
					primaryConcern: userInfo.concern || "財運",
					jixiang: result.analysis.parsed.jixiang,
					xiongxiang: result.analysis.parsed.xiongxiang,
					seasonInfo: result.analysis.parsed.seasonInfo,
					fullContent: result.analysis.parsed.fullContent,
					wuxingAnalysis: calculatedWuxing,
					strengthData: strengthData,
					usefulGods: usefulGodsData,
					timestamp: result.analysis.timestamp,
				};

				setAnalysisData(analysis);

				// Store data globally for database saving
				if (typeof window !== "undefined") {
					window.componentDataStore = window.componentDataStore || {};
					window.componentDataStore.jiXiongAnalysis = analysis;
					console.log("📊 Stored JiXiong data:", "SUCCESS");
				}

				// Set global report data for report page
				if (setGlobalReportData) {
					setGlobalReportData((prevData) => ({
						...prevData,
						jixiongData: analysis,
					}));
				}
			} catch (error) {
				console.error("JiXiong analysis error:", error);
				setError(error.message);

				// Fallback to basic analysis without AI
				const fallbackAnalysis = {
					primaryConcern: userInfo.concern || "財運",
					jixiang: getFallbackJixiang(userInfo.concern),
					xiongxiang: getFallbackXiongxiang(userInfo.concern),
					seasonInfo: "請根據個人情況謹慎分析關鍵時期。",
					error: "AI分析暫時不可用，顯示基礎分析。",
				};

				setAnalysisData(fallbackAnalysis);
			} finally {
				setIsLoading(false);
			}
		};

		fetchJiXiongAnalysis();
	}, [
		userInfo,
		calculateWuxingAnalysis,
		analyzeWuxingStrength,
		determineUsefulGods,
		setGlobalReportData,
	]);

	// Fallback functions for when AI is unavailable
	const getFallbackJixiang = (concern) => {
		const fallbacks = {
			財運: [
				{
					title: "印星護持",
					content:
						"通過提升個人資質和信用獲得財運保護，建議投資學習和品德修養。",
				},
				{
					title: "技能避險",
					content:
						"依靠專業技能獲得穩定收益，避免高風險投資，專注本職工作。",
				},
				{
					title: "根基穩固",
					content: "在保守策略下維持現有財務基礎，避免大幅投資變動。",
				},
			],
			事業: [
				{
					title: "身強勝任",
					content:
						"個人能力強，能夠承擔工作壓力，容易獲得上司信任和認可。",
				},
				{
					title: "印綬生身",
					content: "有貴人提攜或學習機會，通過提升技能獲得事業發展。",
				},
				{
					title: "食神吐秀",
					content:
						"創意和專業技能得以發揮，在工作中展現才華獲得機會。",
				},
			],
			工作: [
				{
					title: "身強勝任",
					content:
						"工作能力強，表現穩定可靠，容易獲得同事和上司信任。",
				},
				{
					title: "技能提升",
					content: "有學習和進修機會，通過提升專業技能獲得發展。",
				},
				{
					title: "穩定發展",
					content: "工作環境相對穩定，適合穩扎穩打的職業發展策略。",
				},
			],
			感情: [
				{
					title: "貴人相助",
					content: "容易遇到真心相待的對象，感情關係中有正面影響。",
				},
				{
					title: "溝通順暢",
					content: "表達能力強，能夠與伴侶良好溝通，關係和諧。",
				},
				{
					title: "關係穩定",
					content: "感情基礎穩固，雙方性格互補，關係發展穩定。",
				},
			],
			健康: [
				{
					title: "體質良好",
					content: "基礎體質不錯，有較強的抗病能力和恢復力。",
				},
				{
					title: "精神穩定",
					content: "精神狀態平穩，睡眠質量好，心理健康狀況良好。",
				},
				{
					title: "調理得當",
					content: "通過適當的養生調理，能夠維持較好的健康狀態。",
				},
			],
		};
		// Support both simplified and traditional Chinese characters
		const supportedConcern =
			concern === "事业" ? "事業" : concern === "财运" ? "財運" : concern;
		return fallbacks[supportedConcern] || fallbacks.財運;
	};

	const getFallbackXiongxiang = (concern) => {
		const fallbacks = {
			財運: [
				{
					title: "比劫奪財",
					content:
						"競爭激烈導致利益受損，需要防範合作風險和意外支出。",
				},
				{
					title: "投資風險",
					content:
						"高風險投資容易虧損，應該避免投機行為，選擇穩健策略。",
				},
				{
					title: "財源不穩",
					content:
						"收入來源可能不穩定，需要提前做好財務規劃和風險防範。",
				},
			],
			事業: [
				{
					title: "競爭激烈",
					content: "職場競爭加劇，同事間爭奪資源，需防範被搶奪功勞。",
				},
				{
					title: "才華埋沒",
					content:
						"個人才能難以發揮，容易被繁重事務拖累，需要主動爭取機會。",
				},
				{
					title: "決策失誤",
					content: "容易因急躁做出錯誤決策，需要保持冷靜和理性分析。",
				},
			],
			工作: [
				{
					title: "工作壓力",
					content: "工作壓力較大，需要注意身心平衡，避免過度勞累。",
				},
				{
					title: "人際複雜",
					content:
						"職場人際關係複雜，需要謹慎處理同事關係，避免衝突。",
				},
				{
					title: "變動較大",
					content: "工作環境可能有較大變動，需要提前準備應對策略。",
				},
			],
			感情: [
				{
					title: "外界干擾",
					content: "感情關係容易受外界影響，需防範第三者介入。",
				},
				{
					title: "溝通障礙",
					content: "與伴侶溝通可能出現問題，需要更多耐心和理解。",
				},
				{
					title: "性格衝突",
					content: "雙方性格差異可能導致衝突，需要學會包容和妥協。",
				},
			],
			健康: [
				{
					title: "體質偏弱",
					content: "體質相對較弱，需要注意養生保健，避免過度勞累。",
				},
				{
					title: "情緒波動",
					content: "情緒容易波動，需要注意心理調節和壓力管理。",
				},
				{
					title: "慢性問題",
					content: "可能有慢性健康問題，需要定期檢查和持續調理。",
				},
			],
		};
		// Support both simplified and traditional Chinese characters
		const supportedConcern =
			concern === "事业" ? "事業" : concern === "财运" ? "財運" : concern;
		return fallbacks[supportedConcern] || fallbacks.財運;
	};

	if (isLoading) {
		return (
			<ComponentErrorBoundary componentName="JiXiong">
				<div className="w-full max-w-full sm:w-[97%] mx-auto bg-white rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] shadow-[0_4px_4px_rgba(0,0,0,0.18)] p-4 sm:p-8 lg:p-12">
					<div className="flex flex-col items-center justify-center py-12 space-y-4">
						{/* Loading spinner */}
						<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

						{/* 小鈴 loading image */}
						<div className="flex items-center justify-center">
							<Image
								src="/images/風水妹/風水妹-loading.png"
								alt="小鈴運算中"
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
								{t("loading")}
							</div>
						</div>
					</div>
				</div>
			</ComponentErrorBoundary>
		);
	}

	if (error) {
		return (
			<ComponentErrorBoundary componentName="JiXiong">
				<div className="flex items-center justify-center p-6 sm:p-8">
					<div className="text-center">
						<p
							className="mb-3 text-red-600 sm:mb-4"
							style={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
						>
							{t("error")}
							{error}
						</p>
						<p
							className="text-gray-600"
							style={{
								fontSize: "clamp(0.875rem, 2.5vw, 0.875rem)",
							}}
						>
							{t("showingBasicAnalysis")}
						</p>
					</div>
				</div>
			</ComponentErrorBoundary>
		);
	}

	return (
		<ComponentErrorBoundary componentName="JiXiong">
			<section
				className="mx-0 mb-6 sm:mb-10"
				style={{
					width: "95%",
				}}
			>
				<div className="w-full px-4 sm:px-6 md:px-8 lg:px-13">
					{/* Header */}

					{/* Analysis Content */}
					{analysisData && (
						<>
							<div className="flex flex-col mb-6 sm:mb-8 lg:flex-row lg:gap-6 xl:gap-8">
								{/* Left Side - 吉象 */}
								<div className="w-full mb-6 sm:mb-8 lg:w-1/2 lg:mb-0">
									<div className="h-full p-4 sm:p-6 bg-white rounded-[15px] sm:rounded-[20px]">
										<h2
											className="mb-4 font-bold text-center sm:mb-6 sm:text-left"
											style={{
												color: "#AD7F00",
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontWeight: 700,
												fontSize:
													"clamp(1.5rem, 4vw, 1.875rem)",
												lineHeight: 1.2,
											}}
										>
											{t("auspicious")}
										</h2>{" "}
										<div className="space-y-4 sm:space-y-6">
											{analysisData.jixiang.map(
												(item, index) => (
													<div
														key={index}
														className="p-1 sm:p-4 min-h-[200px] sm:min-h-[250px] flex flex-col"
													>
														<div
															className="flex items-center justify-center mb-2 sm:mb-3 font-bold text-white rounded-lg w-full max-w-[200px] mx-auto h-[35px] sm:h-[40px]"
															style={{
																backgroundColor:
																	"#AD7F00",
																boxShadow:
																	"0 4px 4px rgba(0,0,0,0.25)",
																fontFamily:
																	"Noto Sans HK, sans-serif",
																fontSize:
																	"clamp(0.875rem, 2.5vw, 1rem)",
															}}
														>
															{item.title}
														</div>
														<div
															className="flex-1 overflow-y-auto"
															style={{
																maxHeight:
																	"300px",
															}}
														>
															<div
																className="leading-relaxed text-black space-y-2"
																style={{
																	fontSize:
																		"clamp(0.875rem, 2.5vw, 0.9375rem)",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{item.content.split(/\n/).filter(line => line.trim() && (line.includes('•') || line.includes('・') || /^\d+\./.test(line.trim()))).map((point, idx) => (
																	<div key={idx} className="ml-2">{point.trim()}</div>
																))}
															</div>
														</div>
													</div>
												),
											)}
										</div>
									</div>
								</div>

								{/* Right Side - 凶象 */}
								<div className="w-full lg:w-1/2">
									<div className="bg-white rounded-[15px] sm:rounded-[20px] p-4 sm:p-6 h-full">
										<h2
											className="mb-4 font-bold text-center text-black sm:mb-6 sm:text-left"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontWeight: 700,
												fontSize:
													"clamp(1.5rem, 4vw, 1.875rem)",
												lineHeight: 1.2,
											}}
										>
											{t("inauspicious")}
										</h2>{" "}
										<div className="space-y-4 sm:space-y-6">
											{analysisData.xiongxiang.map(
												(item, index) => (
													<div
														key={index}
														className="p-3 sm:p-4 min-h-[200px] sm:min-h-[250px] flex flex-col"
													>
														<div
															className="flex items-center justify-center mb-2 sm:mb-3 font-bold text-white rounded-lg w-full max-w-[200px] mx-auto h-[35px] sm:h-[40px]"
															style={{
																backgroundColor:
																	"black",
																boxShadow:
																	"0 4px 4px rgba(0,0,0,0.25)",
																fontFamily:
																	"Noto Sans HK, sans-serif",
																fontSize:
																	"clamp(0.875rem, 2.5vw, 1rem)",
															}}
														>
															{item.title}
														</div>
														<div
															className="flex-1 overflow-y-auto"
															style={{
																maxHeight:
																	"300px",
															}}
														>
															<div
																className="leading-relaxed text-gray-800 space-y-2"
																style={{
																	fontSize:
																		"clamp(0.875rem, 2.5vw, 0.9375rem)",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{item.content.split(/\n/).filter(line => line.trim() && (line.includes('•') || line.includes('・') || /^\d+\./.test(line.trim()))).map((point, idx) => (
																	<div key={idx} className="ml-2">{point.trim()}</div>
																))}
															</div>
														</div>
													</div>
												),
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Useful Gods Analysis - Removed as requested */}
						</>
					)}

					{/* Fallback if no analysis data */}
					{!analysisData && (
						<div className="py-6 text-center sm:py-8">
							<p
								className="text-gray-500"
								style={{
									fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
								}}
							>
								{t("noData")}
							</p>
						</div>
					)}
				</div>
			</section>
		</ComponentErrorBoundary>
	);
});

export default JiXiong;
