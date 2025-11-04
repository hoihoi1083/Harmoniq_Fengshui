"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { getCoupleComponentData } from "@/utils/coupleComponentDataStore";
import {
	Heart,
	User,
	Calendar,
	Star,
	TrendingUp,
	AlertCircle,
} from "lucide-react";
import { useCoupleAnalysis } from "@/contexts/CoupleAnalysisContext";
import { EnhancedInitialAnalysis } from "@/lib/enhancedInitialAnalysis";
import { BaziCalculator } from "@/lib/baziCalculator";
import {
	calculateUnifiedElements,
	getPersonPrimaryElement,
} from "@/lib/unifiedElementCalculation";
import { saveComponentContentWithUser } from "@/utils/simpleCoupleContentSave";

// Helper function to calculate Ba Zi with accurate time-based hour pillar
const calculateBaziWithTime = (birthDateTime) => {
	try {
		// Handle missing time by defaulting to 12:00 (noon)
		let fullDateTime = birthDateTime;
		if (
			typeof birthDateTime === "string" &&
			!birthDateTime.includes("T") &&
			!birthDateTime.includes(" ")
		) {
			fullDateTime = `${birthDateTime} 12:00`;
		}

		const date = new Date(fullDateTime);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const hour = date.getHours();

		// Use BaziCalculator for accurate year and day pillars
		const yearPillar = BaziCalculator.getYearPillar(year);
		const dayPillar = BaziCalculator.getDayPillar(date);

		// Calculate month pillar using traditional 五虎遁法
		const monthPillarResult = BaziCalculator.getMonthPillar(year, month);
		const monthPillar = monthPillarResult.combined;

		// Calculate hour pillar based on actual birth time (defaults to noon if not specified)
		const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
		const dayStemIndex = BaziCalculator.tianGan.indexOf(dayPillar.tianGan);
		const hourStemIndex = (dayStemIndex * 12 + hourBranchIndex) % 10;
		const hourPillar =
			BaziCalculator.tianGan[hourStemIndex] +
			BaziCalculator.diZhi[hourBranchIndex];

		return {
			year: `${yearPillar.tianGan}${yearPillar.diZhi}`,
			month: monthPillar,
			day: `${dayPillar.tianGan}${dayPillar.diZhi}`,
			hour: hourPillar,
			yearElement: yearPillar.element,
			dayElement: dayPillar.element,
		};
	} catch (error) {
		console.error(
			"BaziCalculator error, using fallback calculation:",
			error
		);
		// Safer fallback with basic calculation instead of EnhancedInitialAnalysis
		return {
			year: `甲戌`, // Default fallback
			month: `丙寅`,
			day: `己丑`,
			hour: `甲子`,
			yearElement: `木`,
			dayElement: `土`,
		};
	}
};

// Helper function to convert month number to Chinese month name
const getChineseMonth = (monthNumber) => {
	const chineseMonths = [
		"一月",
		"二月",
		"三月",
		"四月",
		"五月",
		"六月",
		"七月",
		"八月",
		"九月",
		"十月",
		"十一月",
		"十二月",
	];
	return chineseMonths[monthNumber - 1] || "未知月份";
};

const CoupleAnnualAnalysis = ({
	user1,
	user2,
	calculateWuxingAnalysis,
	analyzeWuxingStrength,
	determineUsefulGods,
}) => {
	const { data: session } = useSession();
	const {
		analysisData,
		loading: aiLoading,
		error,
		annualAnalysisCache,
		setAnnualAnalysisCache,
	} = useCoupleAnalysis();
	const [analysisResult, setAnalysisResult] = useState(null);
	const [loading, setLoading] = useState(true);
	const [individualAnalysisData, setIndividualAnalysisData] = useState({
		user1: null,
		user2: null,
	});

	useEffect(() => {
		// Check for historical saved data first (highest priority)
		const historicalData = getCoupleComponentData("coupleAnnualAnalysis");
		if (historicalData) {
			console.log(
				"🏛️ Using historical couple annual analysis data from data store"
			);
			setAnalysisResult(historicalData);

			// If historical data includes individual analysis, set it
			if (historicalData.individualAnalysis) {
				console.log("🏛️ Found historical individual analysis data");
				setIndividualAnalysisData({
					user1: historicalData.individualAnalysis.user1,
					user2: historicalData.individualAnalysis.user2,
				});
			}

			setLoading(false);
			return;
		}

		// Check cache first to avoid re-loading
		if (annualAnalysisCache) {
			console.log("📋 Using cached annual analysis");
			setAnalysisResult(annualAnalysisCache);
			setLoading(false);
			return;
		}

		const generateAnnualAnalysis = async () => {
			if (analysisData) {
				// Use unified element calculation for consistency
				const user1BasicAnalysis = calculateUnifiedElements(
					user1.birthDateTime,
					user1.gender
				);
				const user2BasicAnalysis = calculateUnifiedElements(
					user2.birthDateTime,
					user2.gender
				);

				// Generate AI-powered annual analysis
				const annualInsights = await generateAnnualInsightsFromAI(
					user1,
					user2,
					user1BasicAnalysis,
					user2BasicAnalysis,
					analysisData
				);

				// 🔄 SYNCHRONIZED compatibility calculation - PRIORITY: Use context data first
				const calculatedCompatibilityScore =
					calculateBasicCompatibilityScore(
						user1BasicAnalysis,
						user2BasicAnalysis
					);

				// PRIORITY 1: Use context analysis data score if available (same as EnhancedCoupleSpecificProblemSolution)
				const contextScore = parseInt(
					analysisData.compatibility?.score
				);
				const finalCompatibilityScore =
					contextScore || calculatedCompatibilityScore;

				console.log(
					"🔄 CoupleAnnualAnalysis - Calculating compatibility score (SYNCHRONIZED):",
					{
						user1Element: user1BasicAnalysis?.dayMasterElement,
						user2Element: user2BasicAnalysis?.dayMasterElement,
						calculatedScore: calculatedCompatibilityScore,
						rawContextScore: analysisData.compatibility?.score,
						contextScore: contextScore,
						finalScore: finalCompatibilityScore,
						usingContextScore: !!contextScore,
						timestamp: new Date().toISOString(),
					}
				);

				const analysisResultData = {
					compatibility: {
						score: finalCompatibilityScore,
						level:
							analysisData.compatibility?.level ||
							getCompatibilityLevel(finalCompatibilityScore),
						description:
							analysisData.compatibility?.description ||
							"姻緣分析中...",
					},
					user1Analysis: {
						dominantElement:
							user1BasicAnalysis?.dayMasterElement || "未知",
						elementType: getElementTypeDescription(
							user1BasicAnalysis?.dayMasterElement
						),
						characteristics: getElementCharacteristics(
							user1BasicAnalysis?.dayMasterElement
						),
					},
					user2Analysis: {
						dominantElement:
							user2BasicAnalysis?.dayMasterElement || "未知",
						elementType: getElementTypeDescription(
							user2BasicAnalysis?.dayMasterElement
						),
						characteristics: getElementCharacteristics(
							user2BasicAnalysis?.dayMasterElement
						),
					},
					elementInteraction: generateElementInteractionAnalysis(
						user1BasicAnalysis?.dayMasterElement,
						user2BasicAnalysis?.dayMasterElement,
						analysisData
					),
					annualStrategy: annualInsights,
				};

				setAnalysisResult(analysisResultData);
				// Cache the result to prevent re-loading
				setAnnualAnalysisCache(analysisResultData);
				console.log("💾 Cached annual analysis for future use");

				// Note: Complete data will be saved when individual analyses are ready
				console.log(
					"⏳ Waiting for individual analyses to complete before saving..."
				);

				setLoading(false);
			} else if (!aiLoading && !analysisData) {
				// Fallback analysis without AI data
				generateFallbackAnnualAnalysis();
			}
		};

		generateAnnualAnalysis();
	}, [analysisData, aiLoading, user1, user2]);

	// Function to save complete analysis data including individual analysis
	const saveCompleteAnalysisData = (
		mainAnalysisData,
		user1Analysis,
		user2Analysis
	) => {
		const sessionId =
			`couple_${user1.birthDateTime}_${user2.birthDateTime}`.replace(
				/[^a-zA-Z0-9]/g,
				"_"
			);

		const completeData = {
			...mainAnalysisData,
			individualAnalysis: {
				user1: user1Analysis,
				user2: user2Analysis,
			},
		};

		console.log(
			"💾 Saving complete couple annual analysis with individual data:",
			{
				mainAnalysis: !!mainAnalysisData,
				user1Analysis: !!user1Analysis,
				user2Analysis: !!user2Analysis,
			}
		);

		saveComponentContentWithUser(
			session,
			sessionId,
			"coupleAnnualAnalysis",
			completeData,
			{
				birthday: user1.birthDateTime,
				birthday2: user2.birthDateTime,
				gender: user1.gender,
				gender2: user2.gender,
			}
		);
	};

	// Effect to save complete data when both individual analyses are ready
	useEffect(() => {
		if (
			analysisResult &&
			individualAnalysisData.user1 &&
			individualAnalysisData.user2
		) {
			console.log(
				"🔄 Both individual analyses ready, saving complete data..."
			);
			saveCompleteAnalysisData(
				analysisResult,
				individualAnalysisData.user1,
				individualAnalysisData.user2
			);
		}
	}, [
		analysisResult,
		individualAnalysisData,
		user1.birthDateTime,
		user2.birthDateTime,
	]);

	const generateFallbackAnnualAnalysis = () => {
		const user1BasicAnalysis = calculateUnifiedElements(
			user1.birthDateTime,
			user1.gender
		);
		const user2BasicAnalysis = calculateUnifiedElements(
			user2.birthDateTime,
			user2.gender
		);

		if (!user1BasicAnalysis || !user2BasicAnalysis) {
			setLoading(false);
			return;
		}

		const compatibilityScore = calculateBasicCompatibilityScore(
			user1BasicAnalysis,
			user2BasicAnalysis
		);

		// Use consistent score with context data priority
		const fallbackScore = 75; // Default fallback when no context data

		const fallbackResult = {
			compatibility: {
				score: fallbackScore,
				level: getCompatibilityLevel(fallbackScore),
				description: "基於八字基礎分析的配對評估",
			},
			user1Analysis: {
				dominantElement: user1BasicAnalysis.dayMasterElement,
				elementType: getElementTypeDescription(
					user1BasicAnalysis.dayMasterElement
				),
				characteristics: getElementCharacteristics(
					user1BasicAnalysis.dayMasterElement
				),
			},
			user2Analysis: {
				dominantElement: user2BasicAnalysis.dayMasterElement,
				elementType: getElementTypeDescription(
					user2BasicAnalysis.dayMasterElement
				),
				characteristics: getElementCharacteristics(
					user2BasicAnalysis.dayMasterElement
				),
			},
			elementInteraction: generateElementInteractionAnalysis(
				user1BasicAnalysis.dayMasterElement,
				user2BasicAnalysis.dayMasterElement
			),
			annualStrategy: generateBasicAnnualStrategy(
				user1BasicAnalysis.dayMasterElement,
				user2BasicAnalysis.dayMasterElement
			),
		};

		setAnalysisResult(fallbackResult);
		// Cache the fallback result too
		setAnnualAnalysisCache(fallbackResult);
		console.log("💾 Cached fallback annual analysis");

		// Note: Complete data will be saved when individual analyses are ready
		console.log(
			"⏳ Waiting for individual analyses to complete before saving fallback..."
		);

		setLoading(false);
	};

	// Generate AI-powered annual insights
	const generateAnnualInsightsFromAI = async (
		user1,
		user2,
		user1Analysis,
		user2Analysis,
		aiData
	) => {
		try {
			const currentYear = new Date().getFullYear();
			const nextYear = currentYear + 1;
			const currentMonth = new Date().getMonth() + 1;

			// Call AI service to generate annual strategic advice with timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => {
				controller.abort();
				console.log(
					"⏰ Annual analysis API call timed out after 60 seconds"
				);
			}, 60000); // 60 second timeout

			const response = await fetch("/api/couple-annual-analysis", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					user1Birthday: user1.birthDateTime,
					user2Birthday: user2.birthDateTime,
					user1Element: user1Analysis?.dominantElement,
					user2Element: user2Analysis?.dominantElement,
					currentYear,
					nextYear,
					currentMonth,
					compatibilityData: aiData.compatibility,
					requestType: "annual_strategy",
				}),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				const result = await response.json();
				return result.annualStrategy;
			}
		} catch (error) {
			if (error.name === "AbortError") {
				console.log(
					"⏰ Annual insights API call was aborted due to timeout"
				);
			} else {
				console.error("Error generating annual insights:", error);
			}
		}

		// Fallback to basic annual strategy
		return generateBasicAnnualStrategy(
			user1Analysis?.dominantElement,
			user2Analysis?.dominantElement
		);
	};

	const generateBasicAnnualStrategy = (element1, element2) => {
		const currentYear = new Date().getFullYear();
		const nextYear = currentYear + 1;
		const currentMonth = new Date().getMonth() + 1;

		// Generate basic monthly advice based on elements
		const monthlyAdvice = generateMonthlyAdvice(
			element1,
			element2,
			currentYear,
			nextYear,
			currentMonth
		);

		return {
			[currentYear]: {
				title: `${currentYear}年感情運勢`,
				description: generateYearlyDescription(
					element1,
					element2,
					currentYear
				),
				monthlyFocus: monthlyAdvice[currentYear],
				currentMonth: currentMonth, // Add current month information
			},
			[nextYear]: {
				title: `${nextYear}年關鍵應對策略`,
				description: generateYearlyDescription(
					element1,
					element2,
					nextYear
				),
				monthlyFocus: monthlyAdvice[nextYear],
			},
		};
	};

	const generateMonthlyAdvice = (
		element1,
		element2,
		currentYear,
		nextYear,
		currentMonth
	) => {
		const monthAdviceTemplates = {
			金: {
				caution: "避免重大決定，適合內省和規劃",
				positive: "財運旺盛，適合投資和事業發展",
				travel: "可安排短途旅行放鬆心情",
			},
			木: {
				caution: "注意人際關係，避免衝突",
				positive: "創意豐富，適合開展新項目",
				travel: "適合戶外活動和自然之旅",
			},
			水: {
				caution: "財務需謹慎，避免大額支出",
				positive: "直覺敏銳，適合重要決策",
				travel: "適合水邊休閒和養生之旅",
			},
			火: {
				caution: "情緒易波動，需要冷靜處理",
				positive: "人際關係活躍，適合社交活動",
				travel: "適合秋季賞楓和溫馨聚會",
			},
			土: {
				caution: "健康需要關注，工作壓力較大",
				positive: "穩定發展，適合長期規劃",
				travel: "適合田園風光和文化之旅",
			},
		};

		const getAdviceForMonth = (month, year, isPrimary = true) => {
			const element = isPrimary ? element1 : element2;
			const templates =
				monthAdviceTemplates[element] || monthAdviceTemplates["土"];

			// More specific advice based on current month
			if (month <= 4) return templates.caution;
			if (month <= 8) return templates.positive;

			// October-specific advice (month 10)
			if (month === 10) {
				return element === "火"
					? "適合秋季戶外活動，增進感情交流"
					: templates.travel;
			}

			return templates.travel;
		};

		return {
			[currentYear]:
				currentMonth <= 4
					? `${currentYear}年${currentMonth}月，${getAdviceForMonth(currentMonth, currentYear)}`
					: `${currentYear}年下半年，${getAdviceForMonth(currentMonth, currentYear)}`,
			[nextYear]: `${nextYear}年，${getAdviceForMonth(6, nextYear)}，建議提前設立共同儲備金`,
		};
	};

	const generateYearlyDescription = (element1, element2, year) => {
		const combinations = {
			金水: "金水相生，感情和諧穩定",
			水木: "水木相生，關係持續成長",
			木火: "木火相生，熱情洋溢",
			火土: "火土相生，感情踏實穩固",
			土金: "土金相生，相互支持",
			金火: "金火相剋，需要調和",
			火水: "水火不容，需要包容",
			水土: "水土相剋，需要理解",
			土木: "土木相剋，需要溝通",
			木金: "金克木，需要平衡",
		};

		const combination = `${element1}${element2}`;
		const reverseCombo = `${element2}${element1}`;

		return (
			combinations[combination] ||
			combinations[reverseCombo] ||
			"需要相互調適，增進理解"
		);
	};

	const generateElementInteractionAnalysis = (element1, element2, aiData) => {
		const analysis = {
			interaction:
				aiData?.compatibility?.description ||
				`${element1}命與${element2}命的相互作用`,
			balance: calculateElementBalance(element1, element2),
			missing: findMissingElements(element1, element2),
			advice:
				aiData?.advice?.[0] ||
				generateBasicInteractionAdvice(element1, element2),
		};

		return analysis;
	};

	const calculateElementBalance = (element1, element2) => {
		const generationCycle = {
			金: "水",
			水: "木",
			木: "火",
			火: "土",
			土: "金",
		};
		const destructionCycle = {
			金: "木",
			木: "土",
			土: "水",
			水: "火",
			火: "金",
		};

		if (
			generationCycle[element1] === element2 ||
			generationCycle[element2] === element1
		) {
			return "五行相生，關係和諧平衡";
		} else if (
			destructionCycle[element1] === element2 ||
			destructionCycle[element2] === element1
		) {
			return "五行相剋，需要調和平衡";
		} else {
			return "五行平和，關係穩定";
		}
	};

	const findMissingElements = (element1, element2) => {
		const allElements = ["金", "木", "水", "火", "土"];
		const presentElements = [element1, element2];
		const missing = allElements.filter(
			(el) => !presentElements.includes(el)
		);

		if (missing.length > 0) {
			return `建議增強${missing.join("、")}元素來完善五行平衡`;
		}
		return "五行元素齊全，建議保持平衡";
	};

	const generateBasicInteractionAdvice = (element1, element2) => {
		return `${element1}命與${element2}命的配對，建議在日常生活中注重五行調和，增進相互理解`;
	};

	const calculateBasicCompatibilityScore = (analysis1, analysis2) => {
		// Simple compatibility calculation based on day master elements
		const element1 = analysis1.dayMasterElement;
		const element2 = analysis2.dayMasterElement;

		const compatibilityMatrix = {
			金: { 金: 70, 木: 40, 水: 85, 火: 35, 土: 80 },
			木: { 金: 40, 木: 75, 水: 80, 火: 85, 土: 45 },
			水: { 金: 85, 木: 80, 水: 70, 火: 30, 土: 50 },
			火: { 金: 35, 木: 85, 水: 30, 火: 75, 土: 80 },
			土: { 金: 80, 木: 45, 水: 50, 火: 80, 土: 70 },
		};

		return compatibilityMatrix[element1]?.[element2] || 60;
	};

	const getCompatibilityLevel = (score) => {
		if (score >= 80) return "優秀配對";
		if (score >= 70) return "良好配對";
		if (score >= 60) return "穩定配對";
		return "需要努力";
	};

	const getElementTypeDescription = (element) => {
		const descriptions = {
			金: "金命",
			木: "木命",
			水: "水命",
			火: "火命",
			土: "土命",
		};
		return descriptions[element] || "未知命格";
	};

	const getElementCharacteristics = (element) => {
		const characteristics = {
			金: "堅毅果決，重信守義",
			木: "積極進取，富有創意",
			水: "機智靈活，善於變通",
			火: "熱情開朗，富有魅力",
			土: "踏實穩重，值得信賴",
		};
		return characteristics[element] || "性格特質分析中";
	};

	if (loading) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-sm">
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
								fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
								fontWeight: 500,
							}}
						>
							小鈴正在分析你們的流年運勢
						</div>
						<div
							className="text-gray-500"
							style={{
								fontFamily: "Noto Sans HK, sans-serif",
								fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
								fontWeight: 400,
							}}
						>
							請稍候，如果載入時間過長，請檢查網路連線
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-sm">
				<div className="text-center">
					<div className="mb-4">
						<div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
							<AlertCircle className="w-8 h-8 text-red-600" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-gray-900">
							年度分析載入失敗
						</h3>
						<p className="mb-4 text-sm text-gray-600">
							{error?.message?.includes("timeout") ||
							error?.message?.includes("fetch")
								? "請求超時或網路連線問題，請稍後重試。"
								: "載入年度分析時發生錯誤，請重新嘗試。"}
						</p>
						<p className="mb-6 text-xs text-gray-500">
							錯誤詳情: {error?.message || "未知錯誤"}
						</p>
					</div>

					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						重新嘗試
					</button>

					<div className="mt-4 text-xs text-gray-500">
						<p>💡 提示：如果問題持續發生，請嘗試：</p>
						<ul className="mt-2 text-left list-disc list-inside">
							<li>檢查網路連線是否正常</li>
							<li>重新整理瀏覽器頁面</li>
							<li>清除瀏覽器快取</li>
							<li>稍後再試</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}

	if (!analysisResult) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-sm">
				<div className="flex items-center justify-center text-gray-500">
					<AlertCircle className="w-6 h-6 mr-2" />
					暫無流年分析數據
				</div>
				<div className="mt-4 text-center">
					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-3 py-2 text-sm font-medium text-pink-600 border border-pink-300 rounded-md hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
					>
						重新載入
					</button>
				</div>
			</div>
		);
	}

	const {
		compatibility,
		user1Analysis,
		user2Analysis,
		elementInteraction,
		annualStrategy,
	} = analysisResult;

	// Helper function to determine element combination result
	const getElementCombinationResult = (element1, element2) => {
		// If both elements are the same
		if (element1 === element2) {
			return `五行${element1}重疊`;
		}

		// Check for missing elements
		const allElements = ["金", "木", "水", "火", "土"];
		const presentElements = [element1, element2];
		const missing = allElements.filter(
			(el) => !presentElements.includes(el)
		);

		// Five element generation and destruction cycles
		const generationCycle = {
			金: "水",
			水: "木",
			木: "火",
			火: "土",
			土: "金",
		};
		const destructionCycle = {
			金: "木",
			木: "土",
			土: "水",
			水: "火",
			火: "金",
		};

		// Check relationship
		if (
			generationCycle[element1] === element2 ||
			generationCycle[element2] === element1
		) {
			return missing.length > 0
				? `相生配對(缺${missing.join("、")})`
				: "五行相生";
		} else if (
			destructionCycle[element1] === element2 ||
			destructionCycle[element2] === element1
		) {
			return missing.length > 0
				? `相剋配對(缺${missing.join("、")})`
				: "五行相剋";
		} else {
			return missing.length > 0
				? `平和配對(缺${missing.join("、")})`
				: "五行平和";
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Main Analysis Section with Responsive Layout */}
			<div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6 lg:flex-row">
				{/* Left Side: Compatibility Circle - Responsive Size */}
				<div className="flex items-center justify-center py-4 sm:py-8 lg:w-1/3">
					<div className="relative">
						{/* Responsive Circular Progress */}
						<div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
							<svg
								className="w-full h-full transform -rotate-90"
								viewBox="0 0 100 100"
							>
								{/* Background circle - Updated color and thickness */}
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="#817E7E"
									strokeWidth="10"
								/>
								{/* Progress circle with gradient - Updated thickness */}
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="url(#annualGradient)"
									strokeWidth="10"
									strokeLinecap="round"
									strokeDasharray={`${(compatibility.score * 251.2) / 100} 251.2`}
									className="transition-all duration-1000 ease-out"
								/>
								{/* Gradient definition */}
								<defs>
									<linearGradient
										id="annualGradient"
										x1="0%"
										y1="0%"
										x2="100%"
										y2="0%"
									>
										<stop offset="0%" stopColor="#ec4899" />
										<stop
											offset="50%"
											stopColor="#f97316"
										/>
										<stop
											offset="100%"
											stopColor="#eab308"
										/>
									</linearGradient>
								</defs>
							</svg>
							{/* Score display - Responsive Typography */}
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span
									className="font-bold text-amber-600"
									style={{
										fontSize: "clamp(32px, 12vw, 64px)",
									}}
								>
									{compatibility.score}
								</span>
								<span
									className="mt-1 font-medium text-gray-600"
									style={{
										fontSize: "clamp(12px, 3vw, 18px)",
									}}
								>
									{compatibility.level}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side: Top and Bottom Sections */}
				<div className="flex flex-col w-95% gap-4 sm:gap-6 lg:w-2/3">
					{/* Top: Element Combination - Mobile Stacked, Desktop Inline */}
					<div className="p-3 border-2 border-gray-200 shadow-md sm:p-4 rounded-2xl sm:rounded-full bg-gradient-to-r from-pink-50 to-blue-50">
						{/* Element Combination Display - Single Row Layout */}
						<div className="flex items-center justify-center w-full gap-2 mb-3 sm:gap-3 sm:mb-4">
							{/* User 1 Element */}
							<div className="flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full sm:px-4">
								<div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-500 rounded-full sm:w-6 sm:h-6 sm:text-sm">
									{user1Analysis.dominantElement}
								</div>
								<span
									className="font-semibold text-pink-600"
									style={{
										fontSize: "clamp(7px, 3vw, 14px)",
									}}
								>
									{user1Analysis.elementType}
								</span>
							</div>

							{/* Plus Sign - Always visible */}
							<div
								className="font-bold text-gray-400"
								style={{
									fontSize: "clamp(10px, 3.5vw, 20px)",
								}}
							>
								+
							</div>

							{/* User 2 Element */}
							<div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full sm:px-4">
								<div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full sm:w-6 sm:h-6 sm:text-sm">
									{user2Analysis.dominantElement}
								</div>
								<span
									className="font-semibold text-blue-600"
									style={{
										fontSize: "clamp(7px, 3vw, 14px)",
									}}
								>
									{user2Analysis.elementType}
								</span>
							</div>

							{/* Equals Sign - Hidden on very small mobile */}
							<div
								className="hidden font-bold text-gray-400 sm:block"
								style={{
									fontSize: "clamp(10px, 4vw, 20px)",
								}}
							>
								=
							</div>

							{/* Smart Result */}
							<div className="px-3 py-2 bg-gray-100 rounded-full sm:px-4">
								<span
									className="font-semibold text-gray-700"
									style={{
										fontSize: "clamp(7px, 2.8vw, 14px)",
									}}
								>
									{getElementCombinationResult(
										user1Analysis.dominantElement,
										user2Analysis.dominantElement
									)}
								</span>
							</div>
						</div>

						{/* Element Balance Description */}
						<div className="text-center">
							<p
								className="leading-relaxed text-gray-600"
								style={{
									fontSize: "clamp(8px, 3vw, 14px)",
								}}
							>
								{elementInteraction.balance}
							</p>
						</div>
					</div>

					{/* Bottom: Annual Strategy Section */}
					<div className="bg-white w-full rounded-[20px] sm:rounded-[30px] shadow-md p-4 sm:p-8">
						{/* Title with gradient - Responsive */}
						<div className="mb-4 text-start sm:mb-6">
							<h3
								className="font-bold bg-gradient-to-r from-[#C74772] to-[#D09900] bg-clip-text text-transparent"
								style={{
									fontFamily: "Noto Serif TC",
									fontSize: "clamp(20px, 6vw, 35px)",
								}}
							>
								2025&2026流年關鍵應對策略
							</h3>
						</div>

						{/* Year Headers - Responsive Layout */}
						<div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-6">
							{Object.entries(annualStrategy).map(
								([year, strategy], index) => (
									<div key={year} className="flex-1">
										{/* Year Container with E7E7E7 background */}
										<div className="bg-[#E7E7E7] rounded-lg p-3 sm:p-4">
											{/* Year Title with border */}
											<div className="mb-3 text-center">
												<div className="inline-block px-3 py-2 border-2 border-[#C74772] rounded-full sm:px-4">
													<h4
														className="font-semibold text-[#C74773]"
														style={{
															fontFamily:
																"Noto Sans HK",
															fontSize:
																"clamp(12px, 3vw, 14px)",
														}}
													>
														{year === "2025"
															? `2025年${getChineseMonth(strategy.currentMonth || 10)}`
															: "2026年"}
													</h4>
												</div>
											</div>

											{/* Content */}
											<div className="text-center">
												<p
													className="leading-relaxed text-black"
													style={{
														fontFamily:
															"Noto Sans HK",
														fontSize:
															"clamp(11px, 2.8vw, 14px)",
													}}
												>
													{strategy.monthlyFocus}
												</p>
											</div>
										</div>
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Element Interaction Analysis */}
			<div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-md p-4 sm:p-8">
				{/* Title with gradient - Responsive */}
				<div className="mb-4 text-start sm:mb-6">
					<h3
						className="font-bold bg-gradient-to-r from-[#C74772] to-[#D09900] bg-clip-text text-transparent"
						style={{
							fontFamily: "Noto Serif TC",
							fontSize: "clamp(20px, 6vw, 35px)",
						}}
					>
						五行互動分析
					</h3>
				</div>

				{/* Content Layout - Mobile Stacked, Desktop Side by Side */}
				<div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-6">
					{/* Left: Element Interaction */}
					<div className="flex-1">
						<div className="bg-[#E7E7E7] rounded-lg p-3 sm:p-4">
							{/* Title with border */}
							<div className="mb-3 text-center">
								<div className="inline-block px-3 py-2 border-2 border-[#C74772] rounded-full sm:px-4">
									<h4
										className="font-semibold text-[#C74773]"
										style={{
											fontFamily: "Noto Sans HK",
											fontSize: "clamp(12px, 3vw, 14px)",
										}}
									>
										元素互動
									</h4>
								</div>
							</div>

							{/* Content */}
							<div className="space-y-2 text-center">
								<p
									className="leading-relaxed text-black"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(11px, 2.8vw, 14px)",
									}}
								>
									{elementInteraction.balance}
								</p>
								<p
									className="leading-relaxed text-black"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(10px, 2.5vw, 12px)",
									}}
								>
									{elementInteraction.missing}
								</p>
							</div>
						</div>
					</div>

					{/* Right: Relationship Advice */}
					<div className="flex-1">
						<div className="bg-[#E7E7E7] rounded-lg p-3 sm:p-4">
							{/* Title with border */}
							<div className="mb-3 text-center">
								<div className="inline-block px-3 py-2 border-2 border-[#C74772] rounded-full sm:px-4">
									<h4
										className="font-semibold text-[#C74773]"
										style={{
											fontFamily: "Noto Sans HK",
											fontSize: "clamp(12px, 3vw, 14px)",
										}}
									>
										關係建議
									</h4>
								</div>
							</div>

							{/* Content */}
							<div className="text-center">
								<p
									className="leading-relaxed text-black"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(11px, 2.8vw, 14px)",
									}}
								>
									{elementInteraction.advice}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Individual Analysis Sections */}
			{analysisResult && (
				<IndividualAnalysisSection
					user={user1}
					analysisData={analysisData}
					gender={user1.gender === "male" ? "男方" : "女方"}
					colorScheme={user1.gender === "male" ? "blue" : "pink"}
					userAnalysis={analysisResult.user1Analysis}
					savedIndividualData={individualAnalysisData.user1}
					onAnalysisReady={(analysisData) => {
						setIndividualAnalysisData((prev) => ({
							...prev,
							user1: analysisData,
						}));
					}}
				/>
			)}

			{analysisResult && (
				<IndividualAnalysisSection
					user={user2}
					analysisData={analysisData}
					gender={user2.gender === "male" ? "男方" : "女方"}
					colorScheme={user2.gender === "male" ? "blue" : "pink"}
					userAnalysis={analysisResult.user2Analysis}
					savedIndividualData={individualAnalysisData.user2}
					onAnalysisReady={(analysisData) => {
						setIndividualAnalysisData((prev) => ({
							...prev,
							user2: analysisData,
						}));
					}}
				/>
			)}
		</div>
	);
};

// Individual Analysis Section Component
const IndividualAnalysisSection = ({
	user,
	analysisData,
	gender,
	colorScheme,
	userAnalysis,
	savedIndividualData,
	onAnalysisReady,
}) => {
	const { individualAnalysisCache, setIndividualAnalysisCache } =
		useCoupleAnalysis();
	const [baziData, setBaziData] = useState(null);
	const [individualAnalysis, setIndividualAnalysis] = useState(null);
	const [loading, setLoading] = useState(true);

	const colors = {
		pink: {
			primary: "pink-500",
			light: "pink-50",
			border: "pink-200",
			text: "pink-600",
			gradient: "from-pink-100 to-pink-50",
		},
		blue: {
			primary: "blue-500",
			light: "blue-50",
			border: "blue-200",
			text: "blue-600",
			gradient: "from-blue-100 to-blue-50",
		},
	};

	const color = colors[colorScheme];

	useEffect(() => {
		// Check for saved individual data first (highest priority)
		if (savedIndividualData) {
			console.log(
				`🏛️ Using saved individual analysis data for ${gender}`,
				savedIndividualData
			);
			setBaziData(savedIndividualData.baziData);
			setIndividualAnalysis(savedIndividualData.analysis);

			// Notify parent that saved data is loaded
			if (onAnalysisReady) {
				console.log(
					`📤 Sending saved individual analysis data for ${gender} to parent`
				);
				onAnalysisReady(savedIndividualData);
			}

			setLoading(false);
			return;
		}

		// Create a unique cache key for this user
		const userCacheKey = `${user?.birthDateTime}_${gender}`;

		// Check cache second to avoid re-loading
		if (individualAnalysisCache[userCacheKey]) {
			console.log(`📋 Using cached individual analysis for ${gender}`);
			const cached = individualAnalysisCache[userCacheKey];
			setBaziData(cached.baziData);
			setIndividualAnalysis(cached.analysis);

			// Notify parent component that cached analysis is ready
			if (onAnalysisReady) {
				const completeIndividualData = {
					baziData: cached.baziData,
					analysis: cached.analysis,
					gender: gender,
					user: user,
				};
				console.log(
					`📤 Sending cached individual analysis data for ${gender} to parent`
				);
				onAnalysisReady(completeIndividualData);
			}

			setLoading(false);
			return;
		}

		const generateIndividualAnalysis = async () => {
			if (!user?.birthDateTime) {
				setLoading(false);
				return;
			}

			try {
				// Generate Bazi data using accurate time-based calculation
				const birthday = new Date(user.birthDateTime);
				const bazi = calculateBaziWithTime(user.birthDateTime);
				setBaziData(bazi);

				// Try to get AI analysis for this individual via API with timeout
				let aiAnalysis = null;
				try {
					const controller = new AbortController();
					const timeoutId = setTimeout(() => {
						controller.abort();
						console.log(
							`⏰ Individual analysis API call for ${gender} timed out after 45 seconds`
						);
					}, 45000); // 45 second timeout

					const response = await fetch("/api/individual-analysis", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							birthDateTime: user.birthDateTime,
							dominantElement:
								userAnalysis?.dominantElement ||
								bazi.yearElement,
							category: "感情",
							specificQuestion: `請以專業、結構化的方式分析${gender}的八字特性，包含：
1. 性格特性：${userAnalysis?.dominantElement || bazi.yearElement}命的核心性格特質
2. 主要優勢：在感情關係中的3個主要個人優勢（如：溝通能力強、責任心重、善於理解他人等個人特質，不要包含風水建議或外在建議）
3. 發展建議：3個具體的感情發展建議（可包含行為建議、溝通方式、注意事項等）
請避免使用角色扮演、表情符號或過於口語化的表達方式，保持專業分析風格。主要優勢請聚焦於個人內在特質，發展建議可包含具體行動指導。`,
							gender: gender,
						}),
						signal: controller.signal,
					});

					clearTimeout(timeoutId);

					if (response.ok) {
						const data = await response.json();
						aiAnalysis = parseIndividualAIAnalysis(
							data.aiAnalysis,
							bazi
						);
					} else {
						console.log("API call failed, using basic analysis");
					}
				} catch (error) {
					if (error.name === "AbortError") {
						console.log(
							`⏰ Individual analysis API call for ${gender} was aborted due to timeout`
						);
					} else {
						console.log(
							"AI analysis failed, using basic analysis:",
							error
						);
					}
				}

				// Generate analysis using available data
				const analysis =
					aiAnalysis ||
					generateBasicIndividualAnalysis(bazi, userAnalysis);
				setIndividualAnalysis(analysis);

				// Cache the results to prevent re-loading
				const userCacheKey = `${user?.birthDateTime}_${gender}`;
				setIndividualAnalysisCache((prev) => ({
					...prev,
					[userCacheKey]: {
						baziData: bazi,
						analysis: analysis,
					},
				}));
				console.log(`💾 Cached individual analysis for ${gender}`);

				// Notify parent component that analysis is ready
				if (onAnalysisReady) {
					const completeIndividualData = {
						baziData: bazi,
						analysis: analysis,
						gender: gender,
						user: user,
					};
					console.log(
						`📤 Sending individual analysis data for ${gender} to parent`
					);
					onAnalysisReady(completeIndividualData);
				}

				setLoading(false);
			} catch (error) {
				console.error("Error generating individual analysis:", error);
				setLoading(false);
			}
		};

		generateIndividualAnalysis();
	}, [user, userAnalysis, gender, savedIndividualData]);

	const parseIndividualAIAnalysis = (aiText, bazi) => {
		// Enhanced parsing to handle various AI response formats and fix strengths/suggestions categorization
		console.log(`🔍 Parsing AI analysis for ${gender}:`, aiText);

		if (!aiText || typeof aiText !== "string") {
			console.log("⚠️ Invalid AI text, using basic analysis");
			return {
				characteristics: generateBasicCharacteristics(bazi),
				strengths: generateBasicStrengths(bazi),
				suggestions: generateBasicSuggestions(bazi),
				pillarsAnalysis: generatePillarsAnalysis(bazi),
			};
		}

		// Clean up the text and remove casual elements
		let cleanText = aiText
			.replace(
				/✨|🌙|💖|🎯|🔍|💡|🌱|～|~|唷|啦|哦|呢|⚠️|🌸|💑|💞|💧/g,
				""
			) // Remove emojis and casual particles
			.replace(/小鈴[^。！？]*[。！？]/g, "") // Remove 小鈴 sentences
			.replace(/叮鈴鈴.*$/g, "") // Remove promotional content
			.replace(/解鎖.*報告.*$/gm, "") // Remove unlock promotion
			.replace(/嗨～.*風水師.*～/g, "") // Remove character introduction
			.replace(/以上分析基於.*$/gm, ""); // Remove disclaimer text

		// Split content and clean up
		const lines = cleanText
			.split(/[。！？\n]/)
			.filter((line) => line.trim() && line.length > 10);

		let characteristics = "";
		let strengths = [];
		let suggestions = [];
		let currentSection = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Skip empty lines, promotional content, casual phrases, and feng shui advice
			if (
				!line ||
				line.includes("小鈴") ||
				line.includes("解鎖") ||
				line.includes("專屬") ||
				line.includes("偷偷告訴") ||
				line.includes("小人煞") ||
				line.includes("桃花位") ||
				line.includes("約會方式") ||
				line.includes("約會秘訣") ||
				line.includes("魅力提升") ||
				line.includes("居家桃花位") ||
				line.includes("佩戴") ||
				line.includes("放置") ||
				line.includes("客廳") ||
				line.includes("東南") ||
				line.includes("粉水晶") ||
				line.includes("綠植") ||
				line.includes("換水") ||
				line.includes("藍色飾品") ||
				line.includes("水克火") ||
				line.includes("玻璃花瓶") ||
				line.includes("鮮花") ||
				line.includes("珍珠飾品") ||
				line.includes("薄荷香包") ||
				line.includes("流年氣場") ||
				line.match(/^\*{1,3}\d+\./) ||
				line.length < 10
			)
				continue;

			// Detect section changes
			if (
				line.includes("特性") ||
				line.includes("性格") ||
				line.includes("個性") ||
				line.includes("問題核心")
			) {
				currentSection = "characteristics";
				// Extract meaningful content from the line
				const meaningfulContent = line
					.replace(/.*特性|.*性格|.*個性|.*問題核心[：:]*/, "")
					.replace(/^[：:]+/, "")
					.trim();
				if (meaningfulContent.length > 10) {
					characteristics += meaningfulContent + " ";
				}
				continue;
			} else if (
				line.includes("優勢") ||
				line.includes("長處") ||
				line.includes("強項") ||
				line.includes("成就")
			) {
				currentSection = "strengths";
				continue;
			} else if (
				line.includes("建議") ||
				line.includes("注意") ||
				line.includes("發展") ||
				line.includes("解決方向")
			) {
				currentSection = "suggestions";
				continue;
			}

			// Add content to appropriate section
			const cleanLine = line
				.replace(/^[*•\-\d\.①②③]+\s*/, "")
				.replace(/^[：:]+/, "")
				.trim();

			if (cleanLine.length > 10) {
				// Only meaningful content
				// Check if this is actually feng shui advice that got misclassified as strength
				const isFengShuiAdvice =
					cleanLine.includes("時機") ||
					cleanLine.includes("解鎖") ||
					cleanLine.includes("佩戴") ||
					cleanLine.includes("放置") ||
					cleanLine.includes("客廳") ||
					cleanLine.includes("東南") ||
					cleanLine.includes("選擇") ||
					cleanLine.includes("水邊") ||
					cleanLine.includes("散步") ||
					cleanLine.includes("傾聽") ||
					cleanLine.includes("幽默") ||
					cleanLine.includes("藍色系") ||
					cleanLine.includes("衣著") ||
					cleanLine.includes("週三") ||
					cleanLine.includes("戶外活動") ||
					cleanLine.includes("氣場") ||
					cleanLine.includes("溪流") ||
					cleanLine.includes("工作壓力") ||
					cleanLine.includes("書店") ||
					cleanLine.includes("咖啡廳");

				switch (currentSection) {
					case "characteristics":
						// Extract core personality info, skip promotional content
						if (
							!cleanLine.includes("時機") &&
							!cleanLine.includes("時辰") &&
							!cleanLine.includes("閃耀")
						) {
							characteristics += cleanLine + " ";
						}
						break;
					case "strengths":
						// Only add genuine personality strengths, not feng shui advice
						if (
							!isFengShuiAdvice &&
							(cleanLine.includes("能力") ||
								cleanLine.includes("才能") ||
								cleanLine.includes("優點") ||
								cleanLine.includes("特質") ||
								cleanLine.includes("長處") ||
								cleanLine.includes("強項"))
						) {
							strengths.push(cleanLine);
						} else if (isFengShuiAdvice) {
							// If it's feng shui advice, move it to suggestions
							suggestions.push(cleanLine);
						}
						break;
					case "suggestions":
						if (
							!cleanLine.includes("時機") &&
							!cleanLine.includes("解鎖") &&
							cleanLine.length > 15
						) {
							suggestions.push(cleanLine);
						}
						break;
					default:
						// If no section identified yet, check if it's a meaningful characteristic
						if (
							!characteristics &&
							cleanLine.length > 20 &&
							!cleanLine.includes("時機") &&
							!cleanLine.includes("解鎖") &&
							(cleanLine.includes("性格") ||
								cleanLine.includes("特質") ||
								cleanLine.includes("命"))
						) {
							characteristics += cleanLine + " ";
						}
				}
			}
		}

		// Clean up and provide fallbacks - if AI analysis is poor, use basic analysis
		const finalCharacteristics =
			characteristics.trim() || generateBasicCharacteristics(bazi);
		let finalStrengths = strengths.length > 0 ? strengths.slice(0, 3) : [];
		let finalSuggestions =
			suggestions.length > 0 ? suggestions.slice(0, 3) : [];

		// If we don't have genuine strengths, use basic ones instead of feng shui advice
		if (finalStrengths.length === 0) {
			finalStrengths = generateBasicStrengths(bazi);
		}

		// If suggestions are empty, use basic ones
		if (finalSuggestions.length === 0) {
			finalSuggestions = generateBasicSuggestions(bazi);
		}

		console.log(`✅ Parsed analysis for ${gender}:`, {
			characteristics: finalCharacteristics.substring(0, 100) + "...",
			strengthsCount: finalStrengths.length,
			suggestionsCount: finalSuggestions.length,
		});

		return {
			characteristics: finalCharacteristics,
			strengths: finalStrengths,
			suggestions: finalSuggestions,
			pillarsAnalysis: generatePillarsAnalysis(bazi),
		};
	};

	const generateBasicIndividualAnalysis = (bazi, userAnalysis) => {
		return {
			characteristics:
				userAnalysis?.characteristics ||
				generateBasicCharacteristics(bazi),
			strengths: generateBasicStrengths(bazi),
			suggestions: generateBasicSuggestions(bazi),
			pillarsAnalysis: generatePillarsAnalysis(bazi),
		};
	};

	const generateBasicCharacteristics = (bazi) => {
		const elementCharacteristics = {
			金: "具有堅毅果決的性格，重信守義，善於分析判斷。做事有條理，追求完美，但有時過於挑剔。",
			木: "性格積極進取，富有創意和想象力。善於成長和適應，具有仁慈之心，但有時缺乏耐性。",
			水: "機智靈活，善於變通和適應環境。直覺敏銳，善於觀察，但有時過於敏感或情緒化。",
			火: "熱情開朗，富有魅力和感染力。積極主動，善於表達，但有時過於急躁或衝動。",
			土: "踏實穩重，值得信賴。有責任心，善於照顧他人，但有時過於保守或固執。",
		};

		return elementCharacteristics[bazi.yearElement] || "性格特質分析中...";
	};

	const generateBasicStrengths = (bazi) => {
		const elementStrengths = {
			金: [
				"決策能力強，能在關係中提供穩定支持",
				"有領導才能，善於處理感情中的實際問題",
				"注重細節，對伴侶的需求觀察入微",
			],
			木: [
				"創新能力強，為關係注入新鮮活力",
				"適應力佳，能靈活應對感情變化",
				"有成長潛力，願意為愛情持續進步",
			],
			水: [
				"溝通能力佳，善於表達內心感受",
				"直覺敏銳，能察覺伴侶的情緒變化",
				"善於變通，在關係中懂得適時退讓",
			],
			火: [
				"感染力強，能帶動伴侶的積極情緒",
				"積極進取，為關係發展提供動力",
				"善於表達，能讓對方感受到愛意",
			],
			土: [
				"穩定可靠，是伴侶可以依靠的支柱",
				"有責任心，對感情認真負責",
				"善於協調，能化解關係中的矛盾",
			],
		};

		return (
			elementStrengths[bazi.yearElement] || [
				"具備獨特的感情優勢，值得深入發掘",
			]
		);
	};

	const generateBasicSuggestions = (bazi) => {
		const elementSuggestions = {
			金: [
				"在感情中保持開放心態，接納對方的不同想法",
				"增強靈活性，避免過於固執己見",
				"培養耐心，給予關係更多時間發展",
			],
			木: [
				"加強專注力，避免在感情中三心二意",
				"培養持續性，為長期關係做好準備",
				"注重實際行動，用行動證明愛意",
			],
			水: [
				"增強穩定性，避免情緒波動影響關係",
				"培養決斷力，在重要時刻能做出明確選擇",
				"加強目標設定，與伴侶共同規劃未來",
			],
			火: [
				"培養冷靜思考，避免衝動傷害感情",
				"增強持續力，保持對關係的長期投入",
				"注重細節處理，關注伴侶的小需求",
			],
			土: [
				"增強變通能力，在關係中保持適度彈性",
				"培養創新思維，為感情注入新鮮元素",
				"擴展視野，與伴侶一起探索更廣闊的世界",
			],
		};

		return (
			elementSuggestions[bazi.yearElement] || [
				"持續在感情中自我完善，創造更美好的關係",
			]
		);
	};

	const generatePillarsAnalysis = (bazi) => {
		const pillarDescriptions = {
			年柱: {
				title: "年柱-庚辰",
				subtitle: "白臘金全庫地，廣室豐饒度豐主",
				description: "根基深厚文化傳承，喜歡方正的事務，聰明力青誠實。",
			},
			月柱: {
				title: "月柱-戊寅",
				subtitle: "戊土陽性長表，真木食神運程巧乙",
				description:
					"土粒物資牢固象徵，慎則高神運進高祖，取心十率易遍總或益處。",
			},
			日柱: {
				title: "日柱-丁卯",
				subtitle: "丁火曼陽想身自由慣地，抗爭純和歲聯數",
				description: "資財豐富，內心清淨自由地鬥志，抗爭和和歲紀關。",
			},
			時柱: {
				title: "時柱-丙午",
				subtitle: "午火此群斜性內河，呈裔連接清水平台",
				description: "易有得勝過行述雍度，需敏感務期友高保清。",
			},
		};

		// Generate more realistic pillar analysis based on actual bazi data
		return {
			年柱: {
				title: `年柱-${bazi.year}`,
				subtitle: generatePillarSubtitle(bazi.year, "年"),
				description: generatePillarDescription(
					bazi.year,
					"年",
					"祖業根基，早年環境"
				),
			},
			月柱: {
				title: `月柱-${bazi.month}`,
				subtitle: generatePillarSubtitle(bazi.month, "月"),
				description: generatePillarDescription(
					bazi.month,
					"月",
					"父母宮位，中年發展"
				),
			},
			日柱: {
				title: `日柱-${bazi.day}`,
				subtitle: generatePillarSubtitle(bazi.day, "日"),
				description: generatePillarDescription(
					bazi.day,
					"日",
					"自身性格，配偶關係"
				),
			},
			時柱: {
				title: `時柱-${bazi.hour}`,
				subtitle: generatePillarSubtitle(bazi.hour, "時"),
				description: generatePillarDescription(
					bazi.hour,
					"時",
					"子女宮位，晚年運勢"
				),
			},
		};
	};

	const generatePillarSubtitle = (pillar, type) => {
		const templates = {
			年: "祖業基礎，早年環境影響深遠",
			月: "父母影響，成長期性格形成",
			日: "本命特質，核心性格展現",
			時: "未來發展，晚年運勢趨向",
		};

		return templates[type] + `（${pillar}）`;
	};

	const generatePillarDescription = (pillar, type, meaning) => {
		// Get first character of pillar to determine element
		const firstChar = pillar.charAt(0);
		const elementMap = {
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

		const element = elementMap[firstChar] || "土";

		const descriptions = {
			木: "生機勃勃，具有成長和創新的能力",
			火: "熱情活躍，具有領導和表達的天賦",
			土: "穩重踏實，具有包容和協調的特質",
			金: "堅毅果決，具有分析和執行的能力",
			水: "靈活變通，具有智慧和適應的本領",
		};

		return `${meaning}：${descriptions[element]}，${pillar}組合顯示良好的發展潛力。`;
	};

	if (loading) {
		return (
			<div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
				<div className="flex items-center justify-center">
					<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>
					<span className="ml-3 text-gray-600">
						分析{gender}八字中...
					</span>
				</div>
			</div>
		);
	}

	if (!baziData || !individualAnalysis) {
		return (
			<div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
				<div className="flex items-center justify-center text-gray-500">
					<AlertCircle className="w-6 h-6 mr-2" />
					{gender}八字分析暫無數據
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-md p-4 sm:p-8 mb-4 sm:mb-6">
			{/* Header with gender and birth date - Responsive Layout */}
			<div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:items-center sm:gap-4 sm:mb-8">
				{/* Gender Title */}
				<h3
					className={`font-bold ${colorScheme === "pink" ? "text-[#C74772]" : "text-[#4A90E2]"}`}
					style={{
						fontFamily: "Noto Serif TC",
						fontSize: "clamp(24px, 6vw, 48px)",
					}}
				>
					{gender}
				</h3>

				{/* Birth Date Pill */}
				<div
					className={`px-4 py-2 rounded-full border-2 sm:px-6 ${
						colorScheme === "pink"
							? "border-[#C74772] text-[#C74772]"
							: "border-[#4A90E2] text-[#4A90E2]"
					}`}
				>
					<span
						className="font-medium"
						style={{
							fontFamily: "Noto Sans HK",
							fontSize: "clamp(12px, 3vw, 18px)",
						}}
					>
						{user.birthDateTime}
					</span>
				</div>
			</div>

			{/* Four Pillars Grid - Responsive Grid */}
			<div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 sm:mb-8">
				{Object.entries(individualAnalysis.pillarsAnalysis).map(
					([pillarName, pillarData]) => (
						<div
							key={pillarName}
							className="overflow-hidden bg-gray-100 rounded-lg"
						>
							{/* Pillar Header */}
							<div
								className={`p-3 text-center text-white sm:p-4 ${
									colorScheme === "pink"
										? "bg-[#C74772]"
										: "bg-[#4A90E2]"
								}`}
							>
								<h4
									className="font-bold"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(14px, 3.5vw, 18px)",
									}}
								>
									{pillarName}
								</h4>
								<p
									className="opacity-90"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(11px, 2.8vw, 14px)",
									}}
								>
									{pillarData.title.split("-")[1]}
								</p>
							</div>

							{/* Pillar Content */}
							<div className="p-3 bg-gray-100 sm:p-4">
								<p
									className="mb-2 leading-relaxed text-gray-700"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(10px, 2.5vw, 13px)",
									}}
								>
									{pillarData.subtitle}
								</p>
								<p
									className="leading-relaxed text-gray-600"
									style={{
										fontFamily: "Noto Sans HK",
										fontSize: "clamp(9px, 2.2vw, 11px)",
									}}
								>
									{pillarData.description}
								</p>
							</div>
						</div>
					)
				)}
			</div>

			{/* Element Characteristics Section */}
			<div
				className={`rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 ${
					colorScheme === "pink" ? "bg-pink-50" : "bg-blue-50"
				}`}
			>
				{/* Section Title */}
				<div className="mb-4">
					<div className="inline-block px-3 py-2 border-2 border-[#C74772] rounded-full mb-4 sm:px-4">
						<h4
							className="font-semibold text-[#C74773]"
							style={{
								fontFamily: "Noto Sans HK",
								fontSize: "clamp(14px, 3.5vw, 18px)",
							}}
						>
							{gender}
							{userAnalysis?.elementType}特性
						</h4>
					</div>
				</div>

				{/* Characteristics Description */}
				<div className="p-3 mb-4 bg-white rounded-lg sm:p-4">
					<p
						className="leading-relaxed text-black"
						style={{
							fontFamily: "Noto Sans HK",
							fontSize: "clamp(12px, 3vw, 16px)",
						}}
					>
						{individualAnalysis.characteristics}
					</p>
				</div>

				{/* Strengths and Suggestions Layout - Mobile Stacked, Desktop Side by Side */}
				<div className="grid gap-4 sm:gap-6 md:grid-cols-2">
					{/* Strengths */}
					<div className="p-3 bg-white rounded-lg sm:p-4">
						<h5
							className="mb-3 font-semibold text-gray-800"
							style={{
								fontFamily: "Noto Sans HK",
								fontSize: "clamp(14px, 3.5vw, 18px)",
							}}
						>
							主要優勢：
						</h5>
						<ul className="space-y-2">
							{individualAnalysis.strengths.map(
								(strength, index) => (
									<li
										key={index}
										className="flex items-start gap-2 text-gray-700 sm:items-center sm:gap-3"
									>
										<div
											className={`w-2 h-2 rounded-full mt-2 sm:w-3 sm:h-3 sm:mt-0 flex-shrink-0 ${
												colorScheme === "pink"
													? "bg-[#C74772]"
													: "bg-[#4A90E2]"
											}`}
										></div>
										<span
											style={{
												fontFamily: "Noto Sans HK",
												fontSize:
													"clamp(11px, 2.8vw, 14px)",
											}}
										>
											{typeof strength === "string"
												? strength
												: strength.replace(
														/^[•\-\*]\s*/,
														""
													)}
										</span>
									</li>
								)
							)}
						</ul>
					</div>

					{/* Suggestions */}
					<div className="p-3 bg-white rounded-lg sm:p-4">
						<h5
							className="mb-3 font-semibold text-gray-800"
							style={{
								fontFamily: "Noto Sans HK",
								fontSize: "clamp(14px, 3.5vw, 18px)",
							}}
						>
							發展建議：
						</h5>
						<ul className="space-y-2">
							{individualAnalysis.suggestions.map(
								(suggestion, index) => (
									<li
										key={index}
										className="flex items-start gap-2 text-gray-700 sm:items-center sm:gap-3"
									>
										<div
											className={`w-2 h-2 rounded-full mt-2 sm:w-3 sm:h-3 sm:mt-0 flex-shrink-0 ${
												colorScheme === "pink"
													? "bg-[#C74772]"
													: "bg-[#4A90E2]"
											}`}
										></div>
										<span
											style={{
												fontFamily: "Noto Sans HK",
												fontSize:
													"clamp(11px, 2.8vw, 14px)",
											}}
										>
											{typeof suggestion === "string"
												? suggestion
												: suggestion.replace(
														/^[•\-\*]\s*/,
														""
													)}
										</span>
									</li>
								)
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoupleAnnualAnalysis;
