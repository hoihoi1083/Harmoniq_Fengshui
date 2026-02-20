"use client";

import React, {
	useRef,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import ShopNavbar from "@/components/ShopNavbar";
import Footer from "@/components/home/Footer";
import getWuxingData from "@/lib/nayin";
import HealthFortuneAnalysis from "@/components/HealthFortuneAnalysis";
import CareerFortuneAnalysis from "@/components/CareerFortuneAnalysis";
import WealthFortuneAnalysis from "@/components/WealthFortuneAnalysis";
import RelationshipFortuneAnalysis from "@/components/RelationshipFortuneAnalysis";
import fengshuiLoading from "../../public/images/風水妹/風水妹-loading.png";
import { convertByRegion } from "@/utils/chineseConverter";
import { useRegionDetection } from "@/hooks/useRegionDetection";

const wuxingColorMap = {
	金: "#B2A062",
	木: "#567156",
	水: "#939393",
	火: "#B4003C",
	土: "#DEAB20",
};

const ELEMENTS = ["金", "木", "水", "火", "土"];

export default function FourFortuneAnalysis({
	birthDateTime: propBirthDateTime,
	gender: propGender,
	sessionId: propSessionId,
	userInfo: propUserInfo,
	wuxingData: propWuxingData,
	onFortuneDataUpdate,
	showHistorical,
	fortuneDataState: propFortuneDataState,
}) {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("report");
	const sectionRefs = useRef([]);
	const { region } = useRegionDetection();

	// State management
	const [userInfo, setUserInfo] = useState(null);
	const [sections, setSections] = useState([{ title: "四大運勢分析" }]);
	const [activeTab, setActiveTab] = useState("fortune"); // "report" or "fortune"

	// Fortune data states for persistence
	const [fortuneDataState, setFortuneDataState] = useState({
		health: null,
		career: null,
		wealth: null,
		relationship: null,
	});

	// Get URL params
	const searchParams = useSearchParams();
	const birthDateTime =
		propBirthDateTime || searchParams.get("birthDateTime");
	const gender = propGender || searchParams.get("gender");
	const sessionId = propSessionId || searchParams.get("sessionId");

	// Initialize user info - prioritize props from Report.jsx
	useEffect(() => {
		if (propUserInfo) {
			// Use user info from Report.jsx if available
			setUserInfo(propUserInfo);
		} else if (birthDateTime && gender) {
			// Fallback to URL params
			setUserInfo({
				birthDateTime: birthDateTime,
				gender: gender,
				sessionId: sessionId,
			});
		}
	}, [propUserInfo, birthDateTime, gender, sessionId]);

	// Update section title when region changes
	useEffect(() => {
		if (region) {
			setSections([{ title: convertByRegion("四大運勢分析", region) }]);
		}
	}, [region]);

	// Use direct callback reference to prevent memoization loops

	// ✅ NEW: Load historical fortune data when showHistorical is true
	const loadedHistoricalRef = useRef(false);

	useEffect(() => {
		if (
			showHistorical &&
			propFortuneDataState &&
			Object.keys(propFortuneDataState).length > 0 &&
			!loadedHistoricalRef.current
		) {
			console.log("🎯 FourFortuneAnalysis - Loading historical data");
			console.log(
				"🎯 DEBUG - Full propFortuneDataState object:",
				propFortuneDataState
			);
			console.log(
				"🎯 DEBUG - propFortuneDataState keys:",
				Object.keys(propFortuneDataState || {})
			);

			// ✅ Check if any of the fortune data exists before loading
			const hasAnyData =
				propFortuneDataState.healthFortuneData ||
				propFortuneDataState.careerFortuneData ||
				propFortuneDataState.wealthFortuneData ||
				propFortuneDataState.relationshipFortuneData;

			if (!hasAnyData) {
				console.log(
					"⏳ No fortune data available yet, waiting for parent state update..."
				);
				return;
			}

			console.log(
				"✅ Fortune data available, loading historical data..."
			);

			const newState = {
				health: propFortuneDataState.healthFortuneData || null,
				career: propFortuneDataState.careerFortuneData || null,
				wealth: propFortuneDataState.wealthFortuneData || null,
				relationship:
					propFortuneDataState.relationshipFortuneData || null,
			};

			console.log("🎯 newState:", {
				health: !!newState.health,
				career: !!newState.career,
				wealth: !!newState.wealth,
				relationship: !!newState.relationship,
			});

			setFortuneDataState(newState);
			loadedHistoricalRef.current = true;

			// ✅ FIXED: Don't call parent callback in historical mode to prevent loops
			// Historical data is already loaded, no need to notify parent
		}

		// Reset flag when showHistorical changes to false
		if (!showHistorical) {
			loadedHistoricalRef.current = false;
		}
	}, [showHistorical, propFortuneDataState]);

	// ✅ REMOVED: Redundant auto-save that was causing infinite loops
	// Individual components already call handleFortuneUpdate which saves to parent

	// ✅ NEW: Handle fortune data updates from child components
	const handleFortuneUpdate = useCallback(
		(fortuneType, data) => {
			// console.log(`💾 Saving ${fortuneType} fortune analysis data`);
			const fortuneDataWithMeta = {
				...data,
				generatedAt: new Date().toISOString(),
				sessionId,
			};

			setFortuneDataState((prev) => ({
				...prev,
				[fortuneType]: fortuneDataWithMeta,
			}));

			// ✅ NEW: Also call the parent's onFortuneDataUpdate to persist to database
			// Don't call parent callback in historical mode to prevent loops
			if (onFortuneDataUpdate && !showHistorical) {
				// console.log(`🔄 Calling parent onFortuneDataUpdate for ${fortuneType} fortune`);
				onFortuneDataUpdate(fortuneType, fortuneDataWithMeta);
			}
		},
		[sessionId, showHistorical]
	);

	// Create stable callback references to prevent infinite loops
	const handleHealthUpdate = useCallback(
		(data) => handleFortuneUpdate("health", data),
		[handleFortuneUpdate]
	);
	const handleCareerUpdate = useCallback(
		(data) => handleFortuneUpdate("career", data),
		[handleFortuneUpdate]
	);
	const handleWealthUpdate = useCallback(
		(data) => handleFortuneUpdate("wealth", data),
		[handleFortuneUpdate]
	);
	const handleRelationshipUpdate = useCallback(
		(data) => handleFortuneUpdate("relationship", data),
		[handleFortuneUpdate]
	);

	// Analyze wuxing strength - same logic as Report.jsx
	const analyzeWuxingStrength = (elementCounts) => {
		const total = Object.values(elementCounts).reduce(
			(sum, count) => sum + count,
			0
		);
		const strongElements = [];
		const weakElements = [];

		Object.entries(elementCounts).forEach(([element, count]) => {
			const percentage = (count / total) * 100;
			if (percentage >= 25) {
				// 25% or more is considered strong
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
			// No particularly strong elements, find the strongest
			const maxCount = Math.max(...Object.values(elementCounts));
			const dominant = Object.entries(elementCounts).find(
				([_, count]) => count === maxCount
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

	// Determine useful gods based on wuxing balance
	const determineUsefulGods = (strengthAnalysis) => {
		const { strongElements, weakElements } = strengthAnalysis;

		let primaryGod = "正印";
		let auxiliaryGod = "食神";
		let strategy = "補缺";

		if (strongElements.length > 0) {
			// If there are strong elements, use strategy to balance
			strategy = "洩旺";
			if (strongElements.includes("火")) {
				primaryGod = "食神"; // Fire produces Earth
				auxiliaryGod = "財星"; // Fire consumes Wood
			} else if (strongElements.includes("土")) {
				primaryGod = "正官"; // Earth produces Metal
				auxiliaryGod = "正印"; // Earth consumes Fire
			}
		} else if (weakElements.length > 0) {
			// If there are weak elements, use strategy to strengthen
			strategy = "補缺";
			if (weakElements.includes("水")) {
				primaryGod = "正印"; // Metal produces Water
				auxiliaryGod = "比肩"; // Water itself
			}
		}

		return { primaryGod, auxiliaryGod, strategy };
	};

	// Calculate wuxing analysis
	const calculateWuxingAnalysis = (userInfo) => {
		if (!userInfo?.birthDateTime) return null;

		const wuxingData = getWuxingData(
			userInfo.birthDateTime,
			userInfo.gender
		);
		const elementCounts = {};
		const missingElements = [];

		// Count elements from all pillars
		ELEMENTS.forEach((element) => {
			let count = 0;
			const stemsBranches = [
				wuxingData.yearStemWuxing,
				wuxingData.yearBranchWuxing,
				wuxingData.monthStemWuxing,
				wuxingData.monthBranchWuxing,
				wuxingData.dayStemWuxing,
				wuxingData.dayBranchWuxing,
				wuxingData.hourStemWuxing,
				wuxingData.hourBranchWuxing,
			];

			stemsBranches.forEach((wuxing) => {
				if (wuxing === element) count++;
			});

			elementCounts[element] = count;
			if (count === 0) missingElements.push(element);
		});

		// Analyze element strength using the same logic as Report.jsx
		const strengthAnalysis = analyzeWuxingStrength(elementCounts);

		// Determine useful gods based on element balance
		const usefulGods = determineUsefulGods(strengthAnalysis);

		return {
			elementCounts,
			missingElements,
			wuxingData,
			strengthAnalysis,
			usefulGods,
		};
	};

	// Get wuxing analysis - prioritize prop data from Report.jsx
	const wuxingAnalysis = useMemo(() => {
		if (propWuxingData && userInfo) {
			// Use wuxingData passed from Report.jsx to ensure consistency
			return {
				wuxingData: propWuxingData,
				// Calculate other analysis parts using the same data
				...calculateWuxingAnalysis(userInfo),
			};
		}
		// Fallback to own calculation if no prop data
		return userInfo ? calculateWuxingAnalysis(userInfo) : null;
	}, [propWuxingData, userInfo]);

	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			{/* Navbar */}
			<ShopNavbar />

			{/* Main Content */}
			<div className="pt-4">
				{/* Header Section */}
				<div className="w-[95%] sm:w-[95%] lg:w-[90%] mx-auto px-3 sm:px-5 pt-4 sm:pt-10 lg:pt-10 pb-6 sm:pb-10 flex flex-col lg:flex-row bg-[#EFEFEF]">
					<div className="flex items-start justify-center flex-1 mb-6 lg:justify-start lg:mb-0">
						<h1
							ref={(el) => (sectionRefs.current[0] = el)}
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 800,
								fontSize: "clamp(32px, 6vw, 56px)",
								color: "#A3B116",
								lineHeight: 1.1,
								textAlign: "center",
							}}
							className="lg:text-left"
						>
							{sections[0]?.title}
						</h1>
					</div>
				</div>

				{/* Zodiac and Four Pillars Detail Section */}
				<section className="w-[95%] sm:w-[85%] mx-auto bg-white rounded-[24px] sm:rounded-[48px] lg:rounded-[80px] p-3 sm:p-3 lg:p-12 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.18)]">
					{(() => {
						const analysis = wuxingAnalysis;
						if (!analysis)
							return (
								<div className="flex flex-col items-center justify-center py-12 space-y-4">
									{/* Loading spinner */}
									<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

									{/* 小鈴 loading image */}
									<div className="flex items-center justify-center">
										<Image
											src={fengshuiLoading}
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											{convertByRegion(
												"小鈴正在分析您的命理資料",
												region
											)}
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											{convertByRegion(
												"請稍候，正在解析四大運勢",
												region
											)}
										</div>
									</div>
								</div>
							);

						const { wuxingData } = analysis;

						// Calculate zodiac from birth year
						const birthDate = new Date(userInfo.birthDateTime);
						const birthYear = birthDate.getFullYear();
						const zodiacAnimals = [
							"鼠",
							"牛",
							"虎",
							"兔",
							"龍",
							"蛇",
							"馬",
							"羊",
							"猴",
							"雞",
							"狗",
							"豬",
						];
						const userZodiac =
							zodiacAnimals[(birthYear - 1900) % 12];

						return (
							<div className="flex flex-col items-center justify-center gap-0 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
								{/* Left Side - Zodiac Animal */}
								<div className="w-full lg:w-[22%] flex items-center justify-center mb-4 lg:mb-0">
									<div className="text-center">
										<div className="flex items-center justify-center w-40 h-40 mx-8 mx-auto mt-3 mb-0 sm:mb-4 sm:w-50 sm:h-50 lg:w-90 lg:h-90">
											<Image
												src={`/images/animals/${
													userZodiac === "龍"
														? "dragon"
														: userZodiac === "鼠"
															? "mouse"
															: userZodiac ===
																  "牛"
																? "cow"
																: userZodiac ===
																	  "虎"
																	? "tiger"
																	: userZodiac ===
																		  "兔"
																		? "rabbit"
																		: userZodiac ===
																			  "蛇"
																			? "snake"
																			: userZodiac ===
																				  "馬"
																				? "horse"
																				: userZodiac ===
																					  "羊"
																					? "sheep"
																					: userZodiac ===
																						  "猴"
																						? "monkey"
																						: userZodiac ===
																							  "雞"
																							? "chicken"
																							: userZodiac ===
																								  "狗"
																								? "dog"
																								: userZodiac ===
																									  "豬"
																									? "pig"
																									: "mouse"
												}.png`}
												alt={userZodiac}
												width={328}
												height={328}
												className="object-contain"
											/>
										</div>
									</div>
								</div>

								<div className="w-full lg:w-[70%] flex flex-col gap-4 sm:gap-6">
									{/* Four Pillars in responsive layout */}
									<div className="flex flex-wrap justify-center gap-5 mt-4 mb-4 lg:justify-start sm:gap-4 sm:mb-6 lg:mt-10">
										{/* 年柱 */}
										{/* 年柱 */}
										<div className="bg-white border-2 border-black rounded-full px-3 sm:px-6 lg:px-10 py-2 min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] text-center flex-shrink-0">
											<div
												className="font-bold text-[#374A37]"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
													fontSize:
														"clamp(14px, 3vw, 18px)",
												}}
											>
												{convertByRegion(
													"年柱",
													region
												)}
												-
												<span className="text-[#A3B116]">
													{wuxingData.year}
												</span>
											</div>
										</div>

										{/* 月柱 */}
										<div className="bg-white border-2 border-black rounded-full px-3 sm:px-6 lg:px-10 py-2 min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] text-center flex-shrink-0">
											<div
												className="font-bold text-[#374A37]"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
													fontSize:
														"clamp(14px, 3vw, 18px)",
												}}
											>
												{convertByRegion(
													"月柱",
													region
												)}
												-
												<span className="text-[#A3B116]">
													{wuxingData.month}
												</span>
											</div>
										</div>

										{/* 日柱 */}
										<div className="bg-white border-2 border-black rounded-full px-3 sm:px-6 lg:px-10 py-2 min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] text-center flex-shrink-0">
											<div
												className="font-bold text-[#374A37]"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
													fontSize:
														"clamp(14px, 3vw, 18px)",
												}}
											>
												{convertByRegion(
													"日柱",
													region
												)}
												-
												<span className="text-[#A3B116]">
													{wuxingData.day}
												</span>
											</div>
										</div>

										{/* 時柱 */}
										<div className="bg-white border-2 border-black rounded-full px-3 sm:px-6 lg:px-10 py-2 min-w-[100px] sm:min-w-[120px] lg:min-w-[140px] text-center flex-shrink-0">
											<div
												className="font-bold text-[#374A37]"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
													fontSize:
														"clamp(14px, 3vw, 18px)",
												}}
											>
												{convertByRegion(
													"時柱",
													region
												)}
												-
												<span className="text-[#A3B116]">
													{wuxingData.hour}
												</span>
											</div>
										</div>
									</div>

									<div className="flex flex-row justify-center gap-4 sm:flex-row md:justify-start lg:justify-start xl:justify-start sm:justify-center sm:gap-8">
										{/* Left section - Wuxing Analysis */}
										<div
											className="px-4 py-3 text-white rounded-full shadow-lg sm:py-4 sm:px-8"
											style={{
												backgroundColor: "#A3B116",
												border: `3px solid #A3B116`,
												boxShadow: `0 4px 15px #A3B11640`,
											}}
										>
											<div
												className="text-lg font-bold text-center sm:text-xl"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												{convertByRegion(
													"五行",
													region
												)}
												-
												{convertByRegion(
													analysis.strengthAnalysis
														.strengthDesc,
													region
												)}
											</div>
										</div>

										{/* Right section - Missing Elements Analysis (Logic-based) */}
										<div
											className="px-4 py-3 text-white rounded-full shadow-lg sm:py-4 sm:px-8"
											style={{
												backgroundColor: "#A3B116",
											}}
										>
											<div
												className="text-lg font-bold text-center sm:text-xl"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												{convertByRegion(
													(() => {
														const missingElements =
															analysis
																.strengthAnalysis
																.weakElements ||
															[];
														if (
															missingElements.length ===
															0
														) {
															return "五行沒有缺失";
														} else if (
															missingElements.length ===
															1
														) {
															return `缺${missingElements[0]}`;
														} else if (
															missingElements.length ===
															2
														) {
															return `缺${missingElements.join("")}`;
														} else {
															return `缺${missingElements.slice(0, 2).join("")}等`;
														}
													})(),
													region
												)}
											</div>
										</div>
									</div>

									{/* Advice section like the image */}
									<div className="mt-4 sm:mt-6">
										<p
											className="text-sm sm:text-lg text-[#5A5A5A] text-start leading-relaxed"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontWeight: 400,
												lineHeight: 1.8,
											}}
										>
											{convertByRegion(
												(() => {
													const {
														primaryGod,
														auxiliaryGod,
														strategy,
													} =
														analysis.usefulGods ||
														{};

													if (
														!primaryGod ||
														!auxiliaryGod
													) {
														return "根據五行分析，需要進一步確認用神配置以達到最佳平衡效果。";
													}

													const strategyDesc = {
														補缺: "補足所缺",
														扶弱: "扶助偏弱",
														抑強: "抑制過強",
														瀉強: "化解過旺",
													};

													return `根據您的五行配置分析，建議以「${primaryGod}」為首選用神，「${auxiliaryGod}」為輔助用神。透過${strategyDesc[strategy] || "平衡調和"}的策略，兩者協同作用可有效調節五行能量，達到陰陽平衡，提升整體運勢發展。在日常生活中，可通過相應的顏色、方位、職業選擇等方式來強化這些有利元素的影響力。`;
												})(),
												region
											)}
										</p>
									</div>
								</div>
							</div>
						);
					})()}
				</section>

				{/* Health Fortune Analysis - Detailed Implementation */}
				<section className="w-[95%] sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-3 sm:p-8 lg:p-13 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
					{(() => {
						const analysis = wuxingAnalysis;
						// ✅ FIXED: In historical mode, check for historical data instead of analysis
						const shouldShowLoading = showHistorical
							? !fortuneDataState.health ||
								!fortuneDataState.health.analysis
							: !analysis;

						// Debug logging removed to prevent infinite loops

						if (shouldShowLoading) {
							return (
								<div className="flex flex-col items-center justify-center py-12 space-y-4">
									{/* Loading spinner */}
									<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

									{/* 小鈴 loading image */}
									<div className="flex items-center justify-center">
										<Image
											src={fengshuiLoading}
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											{convertByRegion(
												"小鈴正在生成健康運勢分析",
												region
											)}
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											{convertByRegion(
												"請稍候，正在分析身體健康運勢",
												region
											)}
										</div>
									</div>
								</div>
							);
						}

						return (
							<HealthFortuneAnalysis
								userInfo={userInfo}
								wuxingData={analysis.wuxingData}
								sessionId={sessionId}
								onDataUpdate={handleHealthUpdate}
								showHistorical={showHistorical}
								historicalData={fortuneDataState.health}
							/>
						);
					})()}
				</section>

				{/* Career Fortune Analysis - Detailed Implementation */}
				<section className="w-[95%] sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-3 sm:p-8 lg:p-13 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
					{(() => {
						const analysis = wuxingAnalysis;
						// ✅ FIXED: In historical mode, check for historical data instead of analysis
						const shouldShowLoading = showHistorical
							? !fortuneDataState.career ||
								!fortuneDataState.career.analysis
							: !analysis;

						if (shouldShowLoading) {
							return (
								<div className="flex flex-col items-center justify-center py-12 space-y-4">
									{/* Loading spinner */}
									<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

									{/* 小鈴 loading image */}
									<div className="flex items-center justify-center">
										<Image
											src={fengshuiLoading}
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											{convertByRegion(
												"小鈴正在生成事業運勢分析",
												region
											)}
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											{convertByRegion(
												"請稍候，正在解析事業發展運勢",
												region
											)}
										</div>
									</div>
								</div>
							);
						}

						return (
							<CareerFortuneAnalysis
								userInfo={userInfo}
								wuxingData={analysis.wuxingData}
								sessionId={sessionId}
								onDataUpdate={handleCareerUpdate}
								showHistorical={showHistorical}
								historicalData={fortuneDataState.career}
							/>
						);
					})()}
				</section>

				{/* Wealth Fortune Analysis - Detailed Implementation */}
				<section className="w-[95%] sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-3 sm:p-8 lg:p-13 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
					{(() => {
						const analysis = wuxingAnalysis;
						// ✅ FIXED: In historical mode, check for historical data instead of analysis
						const shouldShowLoading = showHistorical
							? !fortuneDataState.wealth ||
								!fortuneDataState.wealth.analysis
							: !analysis;

						if (shouldShowLoading) {
							return (
								<div className="flex flex-col items-center justify-center py-12 space-y-4">
									{/* Loading spinner */}
									<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

									{/* 小鈴 loading image */}
									<div className="flex items-center justify-center">
										<Image
											src={fengshuiLoading}
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											{convertByRegion(
												"小鈴正在生成財運運勢分析",
												region
											)}
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											{convertByRegion(
												"請稍候，正在分析財富運勢",
												region
											)}
										</div>
									</div>
								</div>
							);
						}

						return (
							<WealthFortuneAnalysis
								userInfo={userInfo}
								wuxingData={analysis.wuxingData}
								sessionId={sessionId}
								onDataUpdate={handleWealthUpdate}
								showHistorical={showHistorical}
								historicalData={fortuneDataState.wealth}
							/>
						);
					})()}
				</section>

				{/* Relationship Fortune Analysis - Detailed Implementation */}
				<section className="w-[95%] sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-3 sm:p-8 lg:p-13 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
					{(() => {
						const analysis = wuxingAnalysis;
						// ✅ FIXED: In historical mode, check for historical data instead of analysis
						const shouldShowLoading = showHistorical
							? !fortuneDataState.relationship ||
								!fortuneDataState.relationship.analysis
							: !analysis;

						if (shouldShowLoading) {
							return (
								<div className="flex flex-col items-center justify-center py-12 space-y-4">
									{/* Loading spinner */}
									<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>

									{/* 小鈴 loading image */}
									<div className="flex items-center justify-center">
										<Image
											src={fengshuiLoading}
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
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.875rem, 2.5vw, 1rem)",
												fontWeight: 500,
											}}
										>
											{convertByRegion(
												"小鈴正在生成感情運勢分析",
												region
											)}
										</div>
										<div
											className="text-gray-500"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontSize:
													"clamp(0.75rem, 2vw, 0.875rem)",
												fontWeight: 400,
											}}
										>
											{convertByRegion(
												"請稍候，正在分析桃花運勢",
												region
											)}
										</div>
									</div>
								</div>
							);
						}

						return (
							<RelationshipFortuneAnalysis
								userInfo={userInfo}
								wuxingData={analysis.wuxingData}
								sessionId={sessionId}
								onDataUpdate={handleRelationshipUpdate}
								showHistorical={showHistorical}
								historicalData={fortuneDataState.relationship}
							/>
						);
					})()}
				</section>
			</div>

			{/* Footer */}
			<Footer />
		</div>
	);
}
