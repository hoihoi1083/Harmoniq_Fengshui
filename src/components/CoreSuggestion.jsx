"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ComponentErrorBoundary } from "./ErrorHandling";
import { getConcernColor } from "../utils/colorTheme";

export default function CoreSuggestion({ userInfo, currentYear = 2025 }) {
	const [analysisData, setAnalysisData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

	// Generate AI analysis based on user's birth info and concern
	const generateCoreSuggestionAnalysis = async (userInfo, year) => {
		try {
			const response = await fetch("/api/core-suggestion-analysis", {
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
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Analysis failed");
			}

			// Transform AI response into component structure
			return transformAIResponseToComponentData(
				result.analysis,
				userInfo,
				year
			);
		} catch (error) {
			console.error("Core Suggestion AI analysis error:", error);
			// Return minimal fallback structure only when AI completely fails
			return getFallbackComponentData(
				userInfo?.concern || "財運",
				year,
				userInfo
			);
		}
	};

	// Transform AI response to component data structure
	const transformAIResponseToComponentData = (
		analysisData,
		userInfo,
		year
	) => {
		const concern = userInfo?.concern || "財運";

		// Create category structure from AI data with subsections
		const coreCategories = analysisData.parsed.categories.map(
			(category, index) => {
				// Generate buttons based on subsections if available
				const buttons = category.subsections
					? Object.keys(category.subsections).map(
							(subsectionName, idx) => ({
								label: subsectionName,
								color: getSubsectionButtonColor(
									subsectionName,
									idx
								),
							})
						)
					: generateButtonsForCategory(category.title, concern);

				// Create details from subsections
				const details = category.subsections
					? Object.entries(category.subsections).map(
							([name, content]) => ({
								title: name,
								content: content,
							})
						)
					: parseContentToDetails(category.content);

				return {
					title: category.title,
					subtitle: "AI 個人化分析",
					icon: category.icon,
					color: category.color,
					buttons: buttons,
					content: {
						title: category.title,
						description:
							category.content.substring(0, 200) +
							(category.content.length > 200 ? "..." : ""),
						details: details,
						subsections: category.subsections || {},
					},
				};
			}
		);

		// Create icon list
		const coreIconList = coreCategories.map((category, index) => ({
			icon: category.icon,
			label: category.title,
			color: category.color,
			active: index === 0,
		}));

		return {
			title: "開運建議",
			subtitle: `(基於您的八字：${userInfo?.birthDateTime || userInfo?.birthday || ""})`,
			coreIcon: "⭐",
			iconColor: "bg-amber-500",
			coreTitle: "五行調和",
			coreIconList: coreIconList,
			coreCategories: coreCategories,
			motto: extractMottoFromContent(analysisData.content, concern),
			coreStrategy: analysisData.parsed.coreStrategy,
			year,
			concern,
			userBirthday: userInfo?.birthDateTime || userInfo?.birthday || "",
			userGender: userInfo?.gender === "male" ? "男性" : "女性",
			fullContent: analysisData.content,
			timestamp: analysisData.timestamp,
		};
	};

	// Get button color for subsections
	const getSubsectionButtonColor = (subsectionName, index) => {
		const colors = [
			"bg-amber-100 text-amber-800",
			"bg-blue-100 text-blue-800",
			"bg-green-100 text-green-800",
			"bg-red-100 text-red-800",
			"bg-purple-100 text-purple-800",
			"bg-pink-100 text-pink-800",
		];
		return colors[index % colors.length];
	};

	// Generate buttons for each category
	const generateButtonsForCategory = (categoryTitle, concern) => {
		const buttonMappings = {
			五行調和: [
				{ label: "佩戴", color: "bg-amber-100 text-amber-800" },
				{ label: "環境", color: "bg-yellow-100 text-yellow-800" },
				{ label: "飲食", color: "bg-green-100 text-green-800" },
				{ label: "活動", color: "bg-blue-100 text-blue-800" },
			],
			行為心性: [
				{ label: "作息", color: "bg-red-100 text-red-800" },
				{ label: "情緒", color: "bg-pink-100 text-pink-800" },
				{ label: "決策", color: "bg-orange-100 text-orange-800" },
				{ label: "禁忌", color: "bg-purple-100 text-purple-800" },
			],
			風水輔助: [
				{ label: "方位", color: "bg-green-100 text-green-800" },
				{ label: "化煞", color: "bg-teal-100 text-teal-800" },
				{ label: "布局", color: "bg-emerald-100 text-emerald-800" },
				{ label: "禁忌", color: "bg-lime-100 text-lime-800" },
			],
			擇時調養: [
				{ label: "黃金期", color: "bg-blue-100 text-blue-800" },
				{ label: "禁忌期", color: "bg-red-100 text-red-800" },
			],
			擇時而動: [
				{ label: "最佳時機", color: "bg-blue-100 text-blue-800" },
				{ label: "禁忌時段", color: "bg-red-100 text-red-800" },
			],
		};

		return buttonMappings[categoryTitle] || buttonMappings["五行調和"];
	};

	// Parse content into detail points
	const parseContentToDetails = (content) => {
		if (!content) return [];

		// Split content by common separators
		const details = content
			.split(/[。！？\n]/)
			.filter((detail) => detail.trim().length > 10)
			.slice(0, 6) // Limit to 6 details for UI
			.map((detail) => detail.trim());

		return details;
	};

	// Extract motto from AI content
	const extractMottoFromContent = (content, concern) => {
		// Try to find motto-like statements
		const mottoPatterns = [
			/箴言[：:]([^。\n]*)/,
			/核心理念[：:]([^。\n]*)/,
			/重要提醒[：:]([^。\n]*)/,
		];

		for (let pattern of mottoPatterns) {
			const match = content.match(pattern);
			if (match && match[1]) {
				return match[1].trim();
			}
		}

		// Fallback mottos by concern
		const fallbackMottos = {
			健康: "健康是人生最大的財富，預防勝於治療，調養重於進補。",
			財運: "財不入急門，穩中求進方能長久。根基穩固，財運自來。",
			工作: "事業如登山，穩扎穩打勝過急功近利。專注提升自身實力，機會自然降臨。",
			事業: "創業維艱，守成不易。順應天時，借助地利，團結人和。",
			感情: "感情如水，需要耐心灌溉。真誠溝通，相互理解，方能開花結果。",
		};

		return (
			fallbackMottos[concern] || "順應自然規律，把握人生節奏，必有所成。"
		);
	};

	// Minimal fallback when AI completely fails
	const getFallbackComponentData = (concern, year, userInfo) => {
		return {
			title: "開運建議",
			subtitle: "(AI分析服務暫時不可用)",
			coreIcon: "⭐",
			iconColor: "bg-amber-500",
			coreTitle: "五行調和",
			coreIconList: [
				{
					icon: "⭐",
					label: "五行調和",
					color: "bg-amber-500",
					active: true,
				},
				{
					icon: "❤️",
					label: "行為心性",
					color: "bg-red-500",
					active: false,
				},
				{
					icon: "⚙️",
					label: "風水輔助",
					color: "bg-green-500",
					active: false,
				},
				{
					icon: "🕒",
					label: "擇時調養",
					color: "bg-blue-500",
					active: false,
				},
			],
			coreCategories: [
				{
					title: "五行調和",
					subtitle: "等待AI分析",
					icon: "⭐",
					color: "bg-amber-500",
					buttons: [
						{
							label: "等待分析",
							color: "bg-gray-100 text-gray-600",
						},
					],
					content: {
						title: "AI分析中",
						description:
							"正在為您生成個人化的五行調和建議，請稍候...",
						details: [
							"AI分析服務暫時無法使用",
							"請稍後重試或聯繫客服",
							"系統正在嘗試重新連線",
						],
					},
				},
			],
			motto: "AI分析服務暫時不可用，請稍後重試。",
			coreStrategy: "等待AI分析",
			year,
			concern,
			userBirthday: userInfo?.birthDateTime || userInfo?.birthday || "",
			userGender: userInfo?.gender === "male" ? "男性" : "女性",
			error: "AI分析服務暫時不可用，系統正在嘗試重新連線。",
		};
	};

	useEffect(() => {
		if (userInfo?.concern && userInfo?.birthDateTime) {
			// Check if data already exists in component data store (for historical reports)
			if (
				typeof window !== "undefined" &&
				window.componentDataStore?.coreSuggestionAnalysis
			) {
				console.log(
					"📖 Using existing CoreSuggestion data from component store"
				);
				setAnalysisData(
					window.componentDataStore.coreSuggestionAnalysis
				);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			generateCoreSuggestionAnalysis(userInfo, currentYear)
				.then((analysis) => {
					setAnalysisData(analysis);
					// Store data globally for database saving
					if (typeof window !== "undefined") {
						window.componentDataStore =
							window.componentDataStore || {};
						window.componentDataStore.coreSuggestionAnalysis =
							analysis;
						console.log(
							"📊 Stored CoreSuggestion data:",
							"SUCCESS"
						);
					}
					setIsLoading(false);
				})
				.catch((error) => {
					console.error("Failed to generate AI analysis:", error);
					// Set fallback data with error state
					setAnalysisData(
						getFallbackComponentData(
							userInfo?.concern || "財運",
							currentYear,
							userInfo
						)
					);
					setIsLoading(false);
				});
		} else {
			setIsLoading(false);
		}
	}, [userInfo, currentYear]);

	if (isLoading) {
		return (
			<section className="relative w-full sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-4 sm:p-12 lg:p-20 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				<div className="flex flex-col items-center justify-center py-12 space-y-4">
					{/* Loading spinner */}
					<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

					{/* 風水妹 loading image */}
					<div className="flex items-center justify-center">
						<Image
							src="/images/風水妹/風水妹-loading.png"
							alt="風水妹運算中"
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
							風水妹已經在運算開運建議中，請稍候
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (!analysisData) {
		return (
			<section className="relative w-full sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-4 sm:p-12 lg:p-20 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				<div className="py-8 text-center text-gray-500">
					無法載入開運建議資料
				</div>
			</section>
		);
	}

	const activeCategory = analysisData.coreCategories[activeCategoryIndex];

	return (
		<ComponentErrorBoundary componentName="CoreSuggestion">
			<section className="relative mx-auto mb-6 sm:mb-10 bg-white w-full sm:w-[95%] lg:w-[95%] rounded-[20px] sm:rounded-[26px] p-4 sm:p-8 md:p-12 lg:p-20 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				{/* Header */}
				<div className="flex items-center justify-between mb-6 sm:mb-8">
					<div className="w-full">
						<h2
							className="font-extrabold text-center sm:text-left"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
								fontWeight: 800,
								color: getConcernColor(userInfo),
								lineHeight: 1.2,
							}}
						>
							核心原則
						</h2>
						<p
							className="mt-2 text-sm text-gray-600 sm:text-base"
							style={{
								fontFamily: "Noto Sans TC, sans-serif",
								lineHeight: 1.5,
							}}
						>
							基於您的八字命理，著重於長期的生活調整和基礎運勢提升。
						</p>
					</div>
				</div>

				{/* Core Icons Section */}
				<div
					className="p-3 mb-6 bg-gray-100 sm:p-6 sm:mb-8 rounded-xl"
					style={{ boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)" }}
				>
					<div className="flex flex-wrap items-center justify-between w-full gap-0 mb-4 sm:gap-0 sm:mb-6">
						{analysisData.coreIconList.map((item, index) => {
							const getButtonBgColor = (itemLabel, isActive) => {
								const colorMap = {
									五行調和: isActive
										? "bg-[#DEAB20]"
										: "bg-white",
									行為心性: isActive
										? "bg-[#D7542D]"
										: "bg-white",
									風水輔助: isActive
										? "bg-[#8FA940]"
										: "bg-white",
									擇時而動: isActive
										? "bg-[#5270AD]"
										: "bg-white",
								};
								return (
									colorMap[itemLabel] ||
									(isActive ? "bg-[#DEAB20]" : "bg-white")
								);
							};

							const getItemImage = (itemLabel) => {
								const imageMap = {
									五行調和: "/images/report/star.png",
									行為心性: "/images/report/heart.png",
									風水輔助: "/images/report/fengshui.png",
									擇時而動: "/images/report/clock.png",
									擇時調養: "/images/report/clock.png",
								};
								return (
									imageMap[itemLabel] ||
									"/images/report/star2.png"
								);
							};

							const getImageFilter = (isActive) => {
								return isActive
									? "brightness(0) invert(1)"
									: "none";
							};

							return (
								<button
									key={index}
									onClick={() =>
										setActiveCategoryIndex(index)
									}
									className={`flex flex-col items-center space-y-1 sm:space-y-2 transition-all duration-300 flex-1 min-w-[70px] max-w-[120px] sm:max-w-none ${
										activeCategoryIndex === index
											? "transform scale-110"
											: "hover:scale-105"
									}`}
								>
									<div
										className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 ${getButtonBgColor(
											item.label,
											activeCategoryIndex === index
										)}`}
										style={{
											boxShadow:
												"0 4px 4px rgba(0, 0, 0, 0.25)",
										}}
									>
										<img
											src={getItemImage(item.label)}
											alt={item.label}
											className="w-6 h-6 sm:w-8 sm:h-8"
											style={{
												filter: getImageFilter(
													activeCategoryIndex ===
														index
												),
											}}
										/>
									</div>
									<span
										className={`text-xs sm:text-sm font-medium ${
											activeCategoryIndex === index
												? "text-gray-800"
												: "text-gray-500"
										}`}
									>
										{item.label}
									</span>
								</button>
							);
						})}
					</div>

					{/* Active Category Title */}
					<div className="text-center">
						<h3
							className="font-bold"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(1.25rem, 4vw, 2rem)",
								fontWeight: 700,
								color: (() => {
									const colorMap = {
										五行調和: "#DEAB20",
										行為心性: "#D7542D",
										風水輔助: "#8FA940",
										擇時而動: "#5270AD",
									};
									return (
										colorMap[
											analysisData.coreIconList[
												activeCategoryIndex
											]?.label
										] || "#DEAB20"
									);
								})(),
								marginBottom: "8px",
							}}
						>
							{activeCategory.title}
						</h3>
					</div>

					{/* Subsection Cards */}
					<div className="flex flex-wrap justify-center max-w-6xl gap-4 mx-auto mt-6 sm:gap-6 sm:mt-8">
						{activeCategory.content.subsections &&
							Object.entries(
								activeCategory.content.subsections
							).map(
								(
									[subsectionName, subsectionContent],
									index
								) => {
									// Define card colors based on index
									const cardColors = [
										{
											bg: "bg-amber-100",
											text: "text-amber-800",
											border: "border-amber-200",
										},
										{
											bg: "bg-blue-100",
											text: "text-blue-800",
											border: "border-blue-200",
										},
										{
											bg: "bg-green-100",
											text: "text-green-800",
											border: "border-green-200",
										},
										{
											bg: "bg-purple-100",
											text: "text-purple-800",
											border: "border-purple-200",
										},
										{
											bg: "bg-red-100",
											text: "text-red-800",
											border: "border-red-200",
										},
										{
											bg: "bg-indigo-100",
											text: "text-indigo-800",
											border: "border-indigo-200",
										},
									];
									const colorScheme =
										cardColors[index % cardColors.length];

									return (
										<div
											key={subsectionName}
											className={`p-3 sm:p-4 transition-shadow bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg w-full max-w-sm flex-shrink-0`}
											style={{
												minWidth: "280px",
												maxWidth: "320px",
											}}
										>
											<div
												className={`text-center p-2 sm:p-4 rounded-lg mb-3 sm:mb-4 ${colorScheme.bg}`}
											>
												<h4
													className={`font-bold text-base sm:text-lg ${colorScheme.text}`}
												>
													{subsectionName}
												</h4>
											</div>
											<div className="space-y-2 sm:space-y-3">
												<div>
													<div className="text-xs leading-relaxed text-gray-700 sm:text-sm text-start">
														{subsectionContent}
													</div>
												</div>
											</div>
										</div>
									);
								}
							)}
					</div>
				</div>
			</section>
		</ComponentErrorBoundary>
	);
}
