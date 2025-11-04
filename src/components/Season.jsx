"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ComponentErrorBoundary } from "./ErrorHandling";
import { getConcernColor } from "../utils/colorTheme";
import {
	getComponentData,
	storeComponentData,
} from "../utils/componentDataStore";

export default function Season({ userInfo, currentYear = 2025 }) {
	const locale = useLocale();
	const t = useTranslations("fengShuiReport.components.season");
	const [analysisData, setAnalysisData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
	const [error, setError] = useState(null);
	const [loadingMessage, setLoadingMessage] = useState(t("analyzingSeasons"));
	const [requestInProgress, setRequestInProgress] = useState(false);

	// Get current date and determine current season
	const getCurrentSeasonInfo = () => {
		const now = new Date();
		const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
		const currentDate = now.getDate();

		// Define Chinese lunar seasons (approximate)
		// Spring: 寅卯辰月 (Feb-Apr), Summer: 巳午未月 (May-Jul)
		// Autumn: 申酉戌月 (Aug-Oct), Winter: 亥子丑月 (Nov-Jan)
		let currentSeason, seasonStatus;

		if (currentMonth >= 2 && currentMonth <= 4) {
			currentSeason = "春季";
			seasonStatus = "current";
		} else if (currentMonth >= 5 && currentMonth <= 7) {
			currentSeason = "夏季";
			seasonStatus = "current";
		} else if (currentMonth >= 8 && currentMonth <= 10) {
			currentSeason = "秋季";
			seasonStatus = "current";
		} else {
			currentSeason = "冬季";
			seasonStatus = "current";
		}

		// Determine relevant seasons (current + future)
		const allSeasons = ["春季", "夏季", "秋季", "冬季"];
		const currentSeasonIndex = allSeasons.indexOf(currentSeason);

		// Get current and future seasons for this year + next year if needed
		let relevantSeasons = [];

		if (currentMonth >= 2 && currentMonth <= 4) {
			// Spring: show current spring, summer, autumn, winter
			relevantSeasons = ["春季", "夏季", "秋季", "冬季"];
		} else if (currentMonth >= 5 && currentMonth <= 7) {
			// Summer: show current summer, autumn, winter, next spring
			relevantSeasons = ["夏季", "秋季", "冬季", "春季"];
		} else if (currentMonth >= 8 && currentMonth <= 10) {
			// Autumn: show current autumn, winter, next spring, next summer
			relevantSeasons = ["秋季", "冬季", "春季", "夏季"];
		} else {
			// Winter: show current winter, next spring, next summer, next autumn
			relevantSeasons = ["冬季", "春季", "夏季", "秋季"];
		}

		return {
			currentSeason,
			currentMonth,
			currentDate,
			relevantSeasons,
			isLatePart: currentDate > 15, // Consider second half of month as "late"
		};
	};

	// Generate AI analysis based on user's birth info and current year
	const generateSeasonAnalysis = async (userInfo, year) => {
		// Prevent duplicate requests in development mode
		if (requestInProgress) {
			console.log("Request already in progress, skipping duplicate");
			return;
		}

		setRequestInProgress(true);

		try {
			console.log("🔮 Season analysis starting... (v3 - Date Aware)");

			// Get current season info
			const seasonInfo = getCurrentSeasonInfo();
			console.log("📅 Current season info:", seasonInfo);

			// Update loading message
			setLoadingMessage("正在分析八字與季節運勢...");

			// Simple fetch - let server handle all timeouts and retries
			const response = await fetch("/api/season-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userInfo: {
						birthday:
							userInfo?.birthDateTime || userInfo?.birthday || "",
						gender: userInfo?.gender || "male",
						time: userInfo?.time || "",
						concern: userInfo?.concern || "財運",
					},
					currentDate: {
						year: new Date().getFullYear(),
						month: seasonInfo.currentMonth,
						date: seasonInfo.currentDate,
						currentSeason: seasonInfo.currentSeason,
						relevantSeasons: seasonInfo.relevantSeasons,
						isLatePart: seasonInfo.isLatePart,
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

			console.log("✅ Season analysis successful");
			setRequestInProgress(false);

			return {
				title: result.analysis.parsed.title,
				seasons: result.analysis.parsed.seasons,
				year,
				concern: userInfo?.concern || "財運",
				userBirthday:
					userInfo?.birthDateTime || userInfo?.birthday || "",
				userGender: userInfo?.gender === "male" ? "男性" : "女性",
				fullContent: result.analysis.parsed.fullContent,
				timestamp: result.analysis.timestamp,
				currentSeason: seasonInfo.currentSeason,
				currentMonth: seasonInfo.currentMonth,
			};
		} catch (error) {
			console.error("❌ Season analysis failed:", error);

			// Always use fallback data on any error
			setLoadingMessage("載入分析資料時發生問題，正在使用備用資料...");
			setRequestInProgress(false);

			return getMinimalFallbackData(
				userInfo?.concern || "財運",
				year,
				userInfo
			);
		}
	};

	// Enhanced fallback with useful content when AI is unavailable
	const getMinimalFallbackData = (concern, year, userInfo) => {
		const seasonInfo = getCurrentSeasonInfo();
		const currentMonth = seasonInfo.currentMonth;

		// Update content based on current date context
		const getSeasonContext = (seasonName) => {
			const now = new Date();
			const currentSeason = seasonInfo.currentSeason;

			if (seasonName === currentSeason) {
				return "【當前季節】";
			} else if (
				seasonInfo.relevantSeasons.indexOf(seasonName) <=
				seasonInfo.relevantSeasons.indexOf(currentSeason)
			) {
				return "【即將到來】";
			} else {
				return "【未來參考】";
			}
		};

		const fallbackContent = {
			財運: {
				spring: `春季木旺生發，利於學習充實、建立人脈關係。適合制定財務計劃，但需謹慎投資，避免過度冒險。`,
				summer: `夏季火旺能量強烈，財運起伏較大。宜保守理財，避免投機，專注正業收入，控制支出。`,
				autumn: `秋季金旺收穫期，適合整理財務、回收投資。可考慮穩健理財產品，為冬季做準備。`,
				winter: `冬季水旺沉澱期，適合深度規劃來年財務目標。宜儲蓄積累，學習理財知識，厚積薄發。`,
			},
			健康: {
				spring: `春季養肝正當時，多進行戶外運動，調節情緒。飲食宜清淡，多吃綠色蔬菜，注意情緒管理。`,
				summer: `夏季心火旺盛，需注意防暑降溫。避免劇烈運動，多補充水分，保持充足睡眠。`,
				autumn: `秋季養肺潤燥，適合進補調理。多吃滋陰食物如梨、銀耳，注意保暖，預防感冒。`,
				winter: `冬季腎氣收藏，宜早睡晚起養精神。適合溫補食療，避免過度消耗，儲備來年活力。`,
			},
			事業: {
				spring: `春季創意萌發，適合學習新技能、拓展人脈。可制定年度職業規劃，但行動需穩健。`,
				summer: `夏季行動力強，適合推進重要項目。需控制情緒，避免衝動決策，維護職場關係。`,
				autumn: `秋季收穫總結，適合展示工作成果。可考慮晉升機會，整理職業經驗，為轉換做準備。`,
				winter: `冬季深度思考，適合制定長期職業目標。宜充電學習，建立專業基礎，準備來年發展。`,
			},
			感情: {
				spring: `春季感情生發，單身者易遇良緣。有伴者關係升溫，適合深化感情，但需保持理性。`,
				summer: `夏季情感熱烈，容易產生激情。需控制情緒波動，避免因衝動傷害關係，保持溝通。`,
				autumn: `秋季感情成熟，適合考慮長期承諾。可規劃婚姻大事，但需慎重考慮現實因素。`,
				winter: `冬季感情深化，適合培養情感深度。透過深度交流增進理解，規劃共同未來。`,
			},
		};

		const content = fallbackContent[concern] || fallbackContent["財運"];

		// Order seasons based on current date - put current season first
		const currentSeasonName = seasonInfo.currentSeason;
		const seasonOrder = seasonInfo.relevantSeasons;

		const baseSeasonsData = [
			{
				name: "春季",
				period: "寅卯辰月，木旺",
				icon: "🌸",
				color: "bg-green-500",
				content: content.spring,
				keyPoints: ["木旺生發", "制定計劃", "謹慎行動"],
			},
			{
				name: "夏季",
				period: "巳午未月，火土極旺",
				icon: "☀️",
				color: "bg-red-500",
				content: content.summer,
				keyPoints: ["火旺能量", "控制情緒", "保守策略"],
			},
			{
				name: "秋季",
				period: "申酉戌月，金旺",
				icon: "🍂",
				color: "bg-yellow-500",
				content: content.autumn,
				keyPoints: ["金旺收穫", "整理總結", "穩健投資"],
			},
			{
				name: "冬季",
				period: "亥子丑月，水旺",
				icon: "❄️",
				color: "bg-blue-500",
				content: content.winter,
				keyPoints: ["水旺沉澱", "深度規劃", "厚積薄發"],
			},
		];

		// Add time context to season names and reorder based on current season
		const allSeasons = baseSeasonsData.map((season) => ({
			...season,
			name: season.name + getSeasonContext(season.name),
		}));

		// Reorder seasons based on relevance (current season first)
		const reorderedSeasons = seasonOrder
			.map((seasonName) =>
				allSeasons.find((season) => season.name.includes(seasonName))
			)
			.filter(Boolean);

		return {
			title: `關鍵季節 (${concern}指南) - 當前：${currentSeasonName}`,
			seasons: reorderedSeasons,
			year,
			concern,
			userBirthday: userInfo?.birthDateTime || userInfo?.birthday || "",
			userGender: userInfo?.gender === "male" ? "男性" : "女性",
			currentSeason: currentSeasonName,
			currentMonth: seasonInfo.currentMonth,
			error: null,
		};
	};

	useEffect(() => {
		let isMounted = true;

		// Validate required parameters before making API call
		if (userInfo && (userInfo.birthDateTime || userInfo.birthday)) {
			// Check if data already exists in component data store (for historical reports)
			const existingData = getComponentData("seasonAnalysis");
			if (existingData) {
				console.log(
					"📖 Season using existing data from component store"
				);
				setAnalysisData(existingData);
				// Set active season to current season if available
				if (existingData.currentSeason && existingData.seasons) {
					const currentSeasonIndex = existingData.seasons.findIndex(
						(season) => season.name === existingData.currentSeason
					);
					if (currentSeasonIndex >= 0) {
						setActiveSeasonIndex(currentSeasonIndex);
					}
				}
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			// Add 5-second delay to stagger API calls and reduce server load
			console.log(
				"⏳ Staggering Season API call to avoid server resource conflicts..."
			);
			setTimeout(() => {
				if (isMounted) {
					// Use AI to generate analysis
					generateSeasonAnalysis(userInfo, currentYear)
						.then((analysis) => {
							if (isMounted && analysis) {
								setAnalysisData(analysis);
								// Set active season to current season (first in reordered array)
								setActiveSeasonIndex(0);
								// Store data for database saving
								storeComponentData("seasonAnalysis", analysis);
								console.log(
									"📊 Stored Season fresh data:",
									"SUCCESS"
								);
								console.log(
									"🎯 Set active season to current:",
									analysis.currentSeason
								);
							}
						})
						.catch((error) => {
							if (isMounted) {
								console.error(
									"Season analysis error in useEffect:",
									error
								);
								setError(error.message);
								// Set minimal fallback if generateSeasonAnalysis doesn't return fallback
								setAnalysisData(
									getMinimalFallbackData(
										userInfo.concern || "財運",
										currentYear,
										userInfo
									)
								);
							}
						})
						.finally(() => {
							if (isMounted) {
								setIsLoading(false);
								setRequestInProgress(false);
							}
						});
				}
			}, 5000); // 5-second delay to reduce server load
		} else {
			// If no valid userInfo, show fallback immediately
			console.warn(
				"Season component: Missing required userInfo or birthday"
			);
			setAnalysisData(
				getMinimalFallbackData("財運", currentYear, userInfo || {})
			);
			setIsLoading(false);
		}

		// Cleanup function
		return () => {
			isMounted = false;
			setRequestInProgress(false);
		};
	}, [userInfo, currentYear]);

	if (isLoading) {
		return (
			<section
				className="relative mx-auto bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[26px] p-4 sm:p-8 md:p-12 lg:p-20 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]"
				style={{ width: "95%" }}
			>
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
			</section>
		);
	}

	if (!analysisData) {
		return (
			<section
				className="relative mx-auto bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[26px] p-4 sm:p-8 md:p-12 lg:p-20 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]"
				style={{ width: "95%" }}
			>
				<div className="py-6 text-center sm:py-8">
					<p
						className="text-gray-500"
						style={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
					>
						{t("noData")}
					</p>
				</div>
			</section>
		);
	}

	return (
		<ComponentErrorBoundary componentName="Season">
			<section
				className="relative mx-auto bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[26px] p-4 sm:p-8 md:p-12 lg:p-20 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]"
				style={{ width: "95%" }}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-6 sm:mb-8">
					<div>
						<h2
							className="text-center sm:text-left"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
								fontWeight: 800,
								color: getConcernColor(userInfo),
								lineHeight: 1.2,
							}}
						>
							{t("title")}
						</h2>
						{/* Current Season Indicator */}
						{analysisData?.currentSeason && (
							<div className="mt-2">
								<span
									className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
									style={{
										backgroundColor: (() => {
											const colorMap = {
												春季: "#7cb856",
												夏季: "#B4003C",
												秋季: "#DEAB20",
												冬季: "#568CB8",
											};
											return (
												colorMap[
													analysisData.currentSeason
												] || "#666"
											);
										})(),
									}}
								>
									{t("current")}
									{analysisData.currentSeason} (
									{analysisData.currentMonth}月)
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Error Message */}
				{analysisData?.error && (
					<div className="p-3 mb-4 bg-yellow-100 border border-yellow-400 rounded-lg sm:mb-6">
						<p
							className="text-yellow-700"
							style={{
								fontSize: "clamp(0.875rem, 2.5vw, 0.875rem)",
							}}
						>
							⚠️ {analysisData.error}
						</p>
					</div>
				)}

				{/* Season Icons */}
				<div className="flex justify-center mb-6 sm:mb-8">
					<div className="flex justify-between w-full max-w-xs sm:max-w-md">
						{(() => {
							// Extract original season name without time context tags
							const getOriginalSeasonName = (seasonName) => {
								return seasonName
									.replace(/【[^】]*】/g, "")
									.trim();
							};

							return analysisData.seasons.map((season, index) => {
								const getSeasonBgColor = (
									seasonName,
									isActive
								) => {
									const originalName =
										getOriginalSeasonName(seasonName);
									const colorMap = {
										春季: isActive
											? "bg-[#7cb856]"
											: "bg-[#EFEFEF]",
										夏季: isActive
											? "bg-[#B4003C]"
											: "bg-[#EFEFEF]",
										秋季: isActive
											? "bg-[#DEAB20]"
											: "bg-[#EFEFEF]",
										冬季: isActive
											? "bg-[#568CB8]"
											: "bg-[#EFEFEF]",
									};
									return (
										colorMap[originalName] ||
										(isActive
											? "bg-gray-600"
											: "bg-[#EFEFEF]")
									);
								};

								// Extract original season name without time context tags
								const getOriginalSeasonName = (seasonName) => {
									return seasonName
										.replace(/【[^】]*】/g, "")
										.trim();
								};

								const getSeasonImage = (seasonName) => {
									const originalName =
										getOriginalSeasonName(seasonName);
									const imageMap = {
										春季: "/images/report/spring.png",
										夏季: "/images/report/summer.png",
										秋季: "/images/report/autumn.png",
										冬季: "/images/report/winter.png",
									};
									return (
										imageMap[originalName] ||
										"/images/report/spring.png"
									);
								};

								const getImageFilter = (
									seasonName,
									isActive
								) => {
									if (isActive) {
										// When selected, make image white
										return "brightness(0) invert(1)";
									} else {
										// When unselected, match the background color
										const originalName =
											getOriginalSeasonName(seasonName);
										const filterMap = {
											春季: "hue-rotate(60deg) saturate(0.8) brightness(0.6)",
											夏季: "hue-rotate(330deg) saturate(1.2) brightness(0.4)",
											秋季: "hue-rotate(40deg) saturate(1.1) brightness(0.7)",
											冬季: "hue-rotate(200deg) saturate(0.9) brightness(0.5)",
										};
										return (
											filterMap[originalName] || "none"
										);
									}
								};

								return (
									<div key={season.name} className="relative">
										<button
											onClick={() =>
												setActiveSeasonIndex(index)
											}
											className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${getSeasonBgColor(
												season.name,
												activeSeasonIndex === index
											)} ${
												activeSeasonIndex === index
													? "transform scale-110"
													: "hover:scale-105"
											}`}
										>
											<img
												src={getSeasonImage(
													season.name
												)}
												alt={season.name}
												className="w-6 h-6 sm:w-8 sm:h-8"
												style={{
													filter: getImageFilter(
														season.name,
														activeSeasonIndex ===
															index
													),
												}}
											/>
										</button>
										{/* Current Season Badge */}
										{analysisData?.currentSeason ===
											getOriginalSeasonName(
												season.name
											) && (
											<div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
												現在
											</div>
										)}
									</div>
								);
							});
						})()}
					</div>
				</div>

				{/* Active Season Content */}
				{(() => {
					// Extract original season name without time context tags
					const getOriginalSeasonName = (seasonName) => {
						return seasonName.replace(/【[^】]*】/g, "").trim();
					};

					return (
						<div className="p-4 mb-6 sm:p-6 sm:mb-8">
							<div className="flex items-center mb-3 sm:mb-4">
								<div className="w-full">
									{/* Season Name with Color */}
									<h3
										className={`font-bold mb-2 ${(() => {
											const originalName =
												getOriginalSeasonName(
													analysisData.seasons[
														activeSeasonIndex
													].name
												);
											const colorMap = {
												春季: "text-[#7cb856]",
												夏季: "text-[#B4003C]",
												秋季: "text-[#DEAB20]",
												冬季: "text-[#568CB8]",
											};
											return (
												colorMap[originalName] ||
												"text-gray-800"
											);
										})()}`}
										style={{
											fontSize:
												"clamp(1.25rem, 4vw, 1.5rem)",
										}}
									>
										{
											analysisData.seasons[
												activeSeasonIndex
											].name
										}
									</h3>

									{/* Period with Season Background */}
									<div
										className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white font-medium ${(() => {
											const originalName =
												getOriginalSeasonName(
													analysisData.seasons[
														activeSeasonIndex
													].name
												);
											const colorMap = {
												春季: "bg-[#7cb856]",
												夏季: "bg-[#B4003C]",
												秋季: "bg-[#DEAB20]",
												冬季: "bg-[#568CB8]",
											};
											return (
												colorMap[originalName] ||
												"bg-gray-600"
											);
										})()}`}
										style={{
											fontSize:
												"clamp(0.875rem, 2.5vw, 1rem)",
										}}
									>
										{
											analysisData.seasons[
												activeSeasonIndex
											].period
										}
									</div>
								</div>
							</div>

							{/* Season Description - Organized Content */}
							<div className="p-4 sm:p-6">
								<div className="space-y-3 leading-relaxed text-gray-700 sm:space-y-4">
									{(() => {
										const content =
											analysisData.seasons[
												activeSeasonIndex
											].content;

										// Simple check - if no meaningful content, show loading
										if (
											!content ||
											content.trim().length < 10
										) {
											return (
												<div className="flex items-center justify-center py-6 sm:py-8">
													<div className="w-5 h-5 border-b-2 rounded-full sm:w-6 sm:h-6 animate-spin border-amber-600"></div>
													<span
														className="ml-3 text-gray-600"
														style={{
															fontSize:
																"clamp(0.875rem, 2.5vw, 1rem)",
														}}
													>
														正在分析中...
													</span>
												</div>
											);
										}

										// Simple content cleaning - just remove obvious system messages
										let displayContent = content
											.replace(
												/以上分析由DeepSeek生成，僅供參考。.*$/gm,
												""
											)
											.replace(
												/命理之說旨在啟發思路，切勿全信。.*$/gm,
												""
											)
											.replace(
												/--\s*免責聲明：以上內容由DeepSeek生成.*$/gms,
												""
											)
											.replace(/免責聲明：.*$/gms, "")
											.replace(
												/以上內容由DeepSeek生成.*$/gms,
												""
											)
											.replace(
												/命理分析並非精密科學.*$/gms,
												""
											)
											.replace(
												/實際決策請務必結合現實情況.*$/gms,
												""
											)
											.replace(/--\s*總結：.*$/gms, "")
											.replace(/總結：.*$/gms, "")
											.replace(/^：\s*/gm, "")
											.replace(/\n--\s*$/gm, "")
											.replace(/--$/gm, "")
											.replace(/^###\s*/gm, "") // Remove ### markdown headers but keep the content
											.replace(/^\s*###\s*$/gm, "")
											.trim();

										// If after cleaning we have no content, show loading
										if (displayContent.length < 10) {
											return (
												<div className="flex items-center justify-center py-6 sm:py-8">
													<div className="w-5 h-5 border-b-2 rounded-full sm:w-6 sm:h-6 animate-spin border-amber-600"></div>
													<span
														className="ml-3 text-gray-600"
														style={{
															fontSize:
																"clamp(0.875rem, 2.5vw, 1rem)",
														}}
													>
														正在分析中...
													</span>
												</div>
											);
										}

										// Display the content as-is, without complex parsing
										return (
											<div className="space-y-3 sm:space-y-4">
												<p
													className="leading-relaxed text-gray-700 whitespace-pre-line"
													style={{
														fontSize:
															"clamp(0.875rem, 2.5vw, 1rem)",
													}}
												>
													{displayContent}
												</p>
											</div>
										);
									})()}
								</div>
							</div>
						</div>
					);
				})()}

				{/* AI Prompt Section */}
			</section>
		</ComponentErrorBoundary>
	);
}
