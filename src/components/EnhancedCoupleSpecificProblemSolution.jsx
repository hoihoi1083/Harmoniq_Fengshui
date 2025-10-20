"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Heart, Users, Target } from "lucide-react";
import { calculateUnifiedElements } from "@/lib/unifiedElementCalculation";
import { useCoupleAnalysis } from "@/contexts/CoupleAnalysisContext";
import {
	saveComponentContentWithUser,
	getSavedContent,
} from "@/utils/simpleCoupleContentSave";
import { getCoupleComponentData } from "@/utils/coupleComponentDataStore";
import ChartDiagnosisSection from "./ChartDiagnosisSection";
import EmergencyFengShuiSection from "./EmergencyFengShuiSection";
import RestartChemistrySection from "./RestartChemistrySection";
import StarChartGuidanceSection from "./StarChartGuidanceSection";
import FengShuiTransformationSection from "./FengShuiTransformationSection";
import RelationshipMethodSection from "./RelationshipMethodSection";
import KeyAnalysisSection from "./KeyAnalysisSection";
import TargetedSuggestionsSection from "./TargetedSuggestionsSection";

const EnhancedCoupleSpecificProblemSolution = ({
	user1,
	user2,
	specificProblem,
}) => {
	const { data: session } = useSession();
	const { analysisData: contextAnalysisData } = useCoupleAnalysis();
	const [analysisData, setAnalysisData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [problemCategory, setProblemCategory] = useState(null);
	const [subsectionData, setSubsectionData] = useState({});
	const [databaseDataLoaded, setDatabaseDataLoaded] = useState(false);

	// Extract birth information from users
	const femaleUser = user1?.gender === "female" ? user1 : user2;
	const maleUser = user1?.gender === "male" ? user1 : user2;

	// Calculate compatibility score based on BaZi elements (same logic as CoupleAnnualAnalysis)
	const calculateBasicCompatibilityScore = (analysis1, analysis2) => {
		if (!analysis1?.dayMasterElement || !analysis2?.dayMasterElement) {
			return 75; // Default score if elements can't be calculated
		}

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

	// Function to handle subsection data collection
	const handleSubsectionData = (sectionName, data) => {
		console.log(`📊 Received data from ${sectionName}:`, !!data);
		setSubsectionData((prev) => ({
			...prev,
			[sectionName]: data,
		}));
	};

	// Function to save complete data including all subsections
	const saveCompleteAnalysisData = (baseData, subsections) => {
		const sessionId =
			`couple_${user1.birthDateTime}_${user2.birthDateTime}`.replace(
				/[^a-zA-Z0-9]/g,
				"_"
			);

		const completeData = {
			...baseData,
			subsections: subsections,
			completedAt: new Date().toISOString(),
		};

		console.log(
			"💾 Saving complete EnhancedCoupleSpecificProblemSolution data:",
			{
				baseData: !!baseData,
				subsectionsCount: Object.keys(subsections).length,
				subsections: Object.keys(subsections),
			}
		);

		saveComponentContentWithUser(
			session,
			sessionId,
			"enhancedCoupleSpecificProblemSolution",
			completeData,
			{
				birthday: user1.birthDateTime,
				birthday2: user2.birthDateTime,
				gender: user1.gender,
				gender2: user2.gender,
				specificProblem: specificProblem,
				problemCategory: problemCategory,
			}
		);
	};

	// Effect to save complete data when all subsections are ready
	useEffect(() => {
		if (analysisData && Object.keys(subsectionData).length > 0) {
			console.log(
				"🔄 Checking if all expected subsections are ready...",
				{
					analysisData: !!analysisData,
					subsectionsCount: Object.keys(subsectionData).length,
					subsectionKeys: Object.keys(subsectionData),
				}
			);

			// Save complete data (we'll collect subsections as they become available)
			const timeoutId = setTimeout(() => {
				saveCompleteAnalysisData(analysisData, subsectionData);
			}, 2000); // Wait 2 seconds to collect more subsections

			return () => clearTimeout(timeoutId);
		}
	}, [
		analysisData,
		subsectionData,
		user1.birthDateTime,
		user2.birthDateTime,
		specificProblem,
	]);

	// � STABLE compatibility score with robust synchronization
	const [stableScore, setStableScore] = useState(null);
	const [contextDataStable, setContextDataStable] = useState(false);

	// Enhanced synchronization with context data stability detection
	const compatibilityScore = useMemo(() => {
		console.log(
			"🔄 EnhancedCoupleSpecificProblemSolution - Calculating compatibility score",
			{
				hasContextData: !!contextAnalysisData,
				contextScore: contextAnalysisData?.compatibility?.score,
				contextDataStable,
				currentStableScore: stableScore,
				femaleUser: !!femaleUser,
				maleUser: !!maleUser,
			}
		);

		// PRIORITY 0: If we already have a stable score, use it to prevent changes
		if (stableScore !== null) {
			console.log(
				"🔒 EnhancedCoupleSpecificProblemSolution - Using LOCKED stable score:",
				stableScore
			);
			return stableScore;
		}

		// PRIORITY 1: Wait for context data to stabilize before using it
		if (contextAnalysisData?.compatibility?.score && contextDataStable) {
			const calculatedScore = parseInt(
				contextAnalysisData.compatibility.score
			);
			console.log(
				"✅ EnhancedCoupleSpecificProblemSolution - Using STABLE context score (SYNCHRONIZED):",
				{
					rawScore: contextAnalysisData.compatibility.score,
					parsedScore: calculatedScore,
					contextDataStable,
					timestamp: new Date().toISOString(),
				}
			);
			return calculatedScore;
		}

		// PRIORITY 2: Still waiting for context data to stabilize
		if (contextAnalysisData === null || !contextDataStable) {
			console.log(
				"⏳ EnhancedCoupleSpecificProblemSolution - Waiting for STABLE context data, using temporary score"
			);
			return 75; // Temporary while waiting for stable data
		}

		// PRIORITY 3: Context data is stable but no score - calculate locally
		if (femaleUser?.birthDateTime && maleUser?.birthDateTime) {
			try {
				const user1Analysis = calculateUnifiedElements(
					femaleUser.birthDateTime,
					femaleUser.gender
				);
				const user2Analysis = calculateUnifiedElements(
					maleUser.birthDateTime,
					maleUser.gender
				);

				const calculatedScore = calculateBasicCompatibilityScore(
					user1Analysis,
					user2Analysis
				);

				console.log(
					"⚠️ EnhancedCoupleSpecificProblemSolution - Using calculated score (FALLBACK):",
					calculatedScore
				);
				return calculatedScore;
			} catch (error) {
				console.error("Error calculating compatibility:", error);
				return 75; // Default fallback
			}
		}

		// Ultimate fallback
		console.log(
			"❌ EnhancedCoupleSpecificProblemSolution - Using ultimate fallback score"
		);
		return 75;
	}, [
		femaleUser,
		maleUser,
		contextAnalysisData,
		contextDataStable,
		stableScore,
	]);

	// Detect when context data has stabilized (check immediately and on updates)
	useEffect(() => {
		if (contextAnalysisData?.compatibility?.score && !contextDataStable) {
			// Check if data is immediately available (synchronous case)
			if (contextAnalysisData.compatibility.score) {
				console.log(
					"📊 EnhancedCoupleSpecificProblemSolution - Context data IMMEDIATELY stable"
				);
				setContextDataStable(true);
				return;
			}

			// Fallback minimal delay for edge cases
			const stabilityTimer = setTimeout(() => {
				console.log(
					"📊 EnhancedCoupleSpecificProblemSolution - Context data marked as STABLE (delayed)"
				);
				setContextDataStable(true);
			}, 50); // Minimal 50ms delay for edge cases

			return () => clearTimeout(stabilityTimer);
		}
	}, [contextAnalysisData, contextDataStable]);

	// Lock the score only when we have stable context data
	useEffect(() => {
		if (
			stableScore === null &&
			contextDataStable &&
			contextAnalysisData?.compatibility?.score &&
			compatibilityScore !== 75 // Don't lock temporary scores
		) {
			console.log(
				"🔒 EnhancedCoupleSpecificProblemSolution - LOCKING STABLE score to prevent changes:",
				compatibilityScore
			);
			setStableScore(compatibilityScore);
		}
	}, [
		compatibilityScore,
		stableScore,
		contextAnalysisData,
		contextDataStable,
	]);

	// Format birth date for display
	const formatBirthDate = (birthDateTime) => {
		if (!birthDateTime) return "未提供";
		try {
			const date = new Date(birthDateTime);
			return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
		} catch (error) {
			return birthDateTime;
		}
	};

	// Format BaZi description with structured content
	const formatBaziDescription = (rawDescription) => {
		if (!rawDescription) return "八字分析生成中...";

		// If content is too long (over 300 characters), extract key points
		if (rawDescription.length > 300) {
			// Try to extract structured sections
			const sections = rawDescription.split(/[**]|[###]|[\n]{2,}/);
			const keyPoints = [];

			// Look for key analysis patterns
			const patterns = [
				/日主分析[：:](.{1,120})/,
				/十神特質[：:](.{1,120})/,
				/關鍵矛盾[：:](.{1,120})/,
				/性格特性[：:](.{1,120})/,
				/主要優勢[：:](.{1,120})/,
				/核心特質(.{1,120})/,
			];

			for (const pattern of patterns) {
				const match = rawDescription.match(pattern);
				if (match && match[1]) {
					keyPoints.push(match[1].trim().replace(/[*#]/g, ""));
					if (keyPoints.length >= 2) break; // Limit to 2 key points
				}
			}

			// If we found structured content, use it
			if (keyPoints.length > 0) {
				return keyPoints.join(" ");
			}

			// Otherwise, truncate intelligently
			const sentences = rawDescription.split(/[。！？]/);
			let result = "";
			for (const sentence of sentences) {
				if (result.length + sentence.length < 200) {
					result += sentence + "。";
				} else {
					break;
				}
			}
			return result || rawDescription.substring(0, 180) + "...";
		}

		// For shorter content, clean up formatting
		return rawDescription.replace(/[*#]/g, "").trim();
	};

	// Categorize problem when specificProblem changes
	useEffect(() => {
		if (specificProblem) {
			const category = categorizeLocalProblem(specificProblem);
			setProblemCategory(category);
		}
	}, [specificProblem]);

	// Load saved data from database first (highest priority) - TEMPORARILY DISABLED for Ba Zi fix
	useEffect(() => {
		console.log(
			"🐛 DEBUG: useEffect triggered - user1:",
			user1,
			"user2:",
			user2
		);
		console.log("🐛 DEBUG: femaleUser:", femaleUser, "maleUser:", maleUser);

		if (user1 && user2) {
			const loadSavedData = async () => {
				const sessionId =
					`couple_${user1.birthDateTime}_${user2.birthDateTime}`.replace(
						/[^a-zA-Z0-9]/g,
						"_"
					);

				try {
					console.log(
						"🔍 Loading EnhancedCoupleSpecificProblemSolution data from database for session:",
						sessionId
					);
					const result = await getSavedContent(sessionId);

					console.log("🐛 DEBUG: getSavedContent result:", result);
					console.log("🐛 DEBUG: result.success:", result.success);
					console.log(
						"🐛 DEBUG: result.savedContent:",
						result.savedContent
					);
					console.log(
						"🐛 DEBUG: savedContent keys:",
						result.savedContent
							? Object.keys(result.savedContent)
							: "no savedContent"
					);

					if (
						result.success &&
						result.savedContent &&
						result.savedContent
							.enhancedCoupleSpecificProblemSolution
					) {
						console.log(
							"🏛️ Found saved EnhancedCoupleSpecificProblemSolution data in database:",
							result.savedContent
								.enhancedCoupleSpecificProblemSolution
						);
						const savedData =
							result.savedContent
								.enhancedCoupleSpecificProblemSolution;

						setAnalysisData(savedData);
						setDatabaseDataLoaded(true);
						setLoading(false);

						// Also set subsection data if available
						if (savedData.subsections) {
							setSubsectionData(savedData.subsections);
						}

						// Set problem category from saved metadata if available
						if (
							result.metadata &&
							result.metadata.problemCategory
						) {
							setProblemCategory(result.metadata.problemCategory);
						}

						return;
					} else {
						console.log(
							"🔍 No saved EnhancedCoupleSpecificProblemSolution data found in database",
							result
						);
					}
				} catch (error) {
					console.error(
						"❌ Error loading saved EnhancedCoupleSpecificProblemSolution data:",
						error
					);
				}

				// Mark as loaded even if no data found, so fresh generation can proceed
				setDatabaseDataLoaded(true);
			};

			loadSavedData();
		}
	}, [user1.birthDateTime, user2.birthDateTime]);

	// Generate couple analysis when component mounts or data changes (fallback)
	useEffect(() => {
		// Skip if database data was already loaded
		if (databaseDataLoaded) return;

		if (femaleUser && maleUser && specificProblem) {
			// Check for historical data from browser storage (fallback)
			const historicalData = getCoupleComponentData(
				"enhancedCoupleSpecificProblemSolution"
			);
			if (historicalData) {
				console.log(
					"📚 Loading historical data from browser storage for Enhanced Couple Specific Problem Solution"
				);
				setAnalysisData(historicalData);
				setLoading(false);
			} else {
				generateCoupleAnalysis();
			}
		}
	}, [femaleUser, maleUser, specificProblem, databaseDataLoaded]);

	// Local problem categorization function
	const categorizeLocalProblem = (problem) => {
		if (!problem) return null;

		const problemLower = problem.toLowerCase();
		console.log("🔍 Categorizing problem:", problem);
		console.log("🔍 Problem lowercase:", problemLower);

		// 感情降溫類 keywords
		if (
			problemLower.includes("冷戰") ||
			problemLower.includes("降溫") ||
			problemLower.includes("疏遠") ||
			problemLower.includes("冷淡") ||
			problemLower.includes("感情淡") ||
			problemLower.includes("不理我")
		) {
			return {
				category: "emotion_cooling",
				categoryName: "感情降溫類",
				color: "bg-pink-100 border-pink-300 text-pink-800",
				icon: "Heart",
			};
		}

		// 特殊情境類 keywords
		if (
			problemLower.includes("異地") ||
			problemLower.includes("長距離") ||
			problemLower.includes("工作") ||
			problemLower.includes("家庭") ||
			problemLower.includes("父母") ||
			(problemLower.includes("朋友") &&
				!problemLower.includes("男朋友") &&
				!problemLower.includes("女朋友")) ||
			problemLower.includes("環境") ||
			problemLower.includes("壓力")
		) {
			console.log("📍 Matched 特殊情境類");
			return {
				category: "special_situation",
				categoryName: "特殊情境類",
				color: "bg-blue-100 border-blue-300 text-blue-800",
				icon: "Globe",
			};
		}

		// 禁忌破解話術 keywords
		if (
			problemLower.includes("說錯話") ||
			problemLower.includes("話術") ||
			problemLower.includes("溝通") ||
			problemLower.includes("誤會") ||
			problemLower.includes("爭吵") ||
			problemLower.includes("口角") ||
			problemLower.includes("吵架") ||
			problemLower.includes("禁忌")
		) {
			console.log("📍 Matched 禁忌破解話術");
			return {
				category: "taboo_breaking",
				categoryName: "禁忌破解話術",
				color: "bg-purple-100 border-purple-300 text-purple-800",
				icon: "Shield",
			};
		}

		// Default to 感情降溫類
		return {
			category: "emotion_cooling",
			categoryName: "感情降溫類",
			color: "bg-pink-100 border-pink-300 text-pink-800",
			icon: "Heart",
		};
	};

	const renderCategoryIcon = (iconName) => {
		switch (iconName) {
			case "Heart":
				return <Heart className="w-6 h-6" />;
			case "Globe":
				return <Users className="w-6 h-6" />;
			case "Shield":
				return <Target className="w-6 h-6" />;
			default:
				return <Heart className="w-6 h-6" />;
		}
	};

	const generateCoupleAnalysis = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				"/api/couple-specific-problem-analysis",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						femaleUser,
						maleUser,
						specificProblem,
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				setAnalysisData(data);

				// Note: Complete data will be saved when subsections are ready
				console.log(
					"⏳ Base analysis ready, waiting for subsections..."
				);
			} else {
				// Try to get data from response even if not ok
				try {
					const errorData = await response.json();
					if (errorData.female && errorData.male) {
						setAnalysisData(errorData);

						// Note: Complete data will be saved when subsections are ready
						console.log(
							"⏳ Base analysis ready (from error response), waiting for subsections..."
						);
					} else {
						throw new Error("No valid data in response");
					}
				} catch (parseError) {
					throw new Error(
						`HTTP ${response.status}: ${response.statusText}`
					);
				}
			}
		} catch (error) {
			console.error("Analysis generation failed:", error);
			// Set error state with user's actual birth dates
			setAnalysisData({
				error: true,
				message: `分析失敗: ${error.message}. 請檢查網路連接或稍後重試。`,
				female: {
					birthDate: formatBirthDate(femaleUser.birthDateTime),
					bazi: "計算失敗",
					description: "無法生成分析，請稍後重試",
					pillars: [
						"計算中...",
						"計算中...",
						"計算中...",
						"計算中...",
					],
				},
				male: {
					birthDate: formatBirthDate(maleUser.birthDateTime),
					bazi: "計算失敗",
					description: "無法生成分析，請稍後重試",
					pillars: [
						"計算中...",
						"計算中...",
						"計算中...",
						"計算中...",
					],
				},
			});
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div
				className="w-full bg-white shadow-lg"
				style={{
					padding: "clamp(24px, 6vw, 32px)",
					borderRadius: "clamp(12px, 3vw, 16px)",
				}}
			>
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
								fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
								fontWeight: 500,
							}}
						>
							風水妹正在分析您的專屬問題
						</div>
						<div
							className="text-gray-500"
							style={{
								fontFamily: "Noto Sans HK, sans-serif",
								fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
								fontWeight: 400,
							}}
						>
							請稍候，正在制定個人化解決方案
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state if analysis failed
	if (analysisData?.error) {
		return (
			<div
				className="w-full bg-white shadow-lg"
				style={{
					padding: "clamp(24px, 6vw, 32px)",
					borderRadius: "clamp(12px, 3vw, 16px)",
				}}
			>
				<div className="text-center">
					<div
						className="mx-auto mb-4 text-red-500"
						style={{
							width: "clamp(48px, 12vw, 64px)",
							height: "clamp(48px, 12vw, 64px)",
						}}
					>
						<Target className="w-full h-full" />
					</div>
					<h3
						className="mb-3 font-semibold text-red-800"
						style={{ fontSize: "clamp(16px, 4vw, 18px)" }}
					>
						分析失敗
					</h3>
					<p
						className="mb-4 text-gray-600"
						style={{ fontSize: "clamp(13px, 3.2vw, 15px)" }}
					>
						{analysisData.message}
					</p>
					<button
						onClick={() => {
							setAnalysisData(null);
							generateCoupleAnalysis();
						}}
						className="text-white transition-colors bg-pink-500 hover:bg-pink-600"
						style={{
							padding:
								"clamp(8px, 2vw, 12px) clamp(20px, 5vw, 24px)",
							borderRadius: "clamp(6px, 1.5vw, 8px)",
							fontSize: "clamp(13px, 3.2vw, 15px)",
						}}
					>
						重新分析
					</button>
				</div>
			</div>
		);
	}

	const renderSectionsByCategory = () => {
		if (!problemCategory || !analysisData) return null;

		const { category } = problemCategory;

		if (category === "emotion_cooling") {
			// 感情降溫類: ChartDiagnosisSection + EmergencyFengShuiSection + RestartChemistrySection
			return (
				<div className="space-y-6 sm:space-y-8">
					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							盤面診斷
						</h2>
					</div>
					<ChartDiagnosisSection
						femaleUser={femaleUser}
						maleUser={maleUser}
						analysisData={analysisData}
						savedData={subsectionData.chartDiagnosis}
						onDataReady={(data) =>
							handleSubsectionData("chartDiagnosis", data)
						}
					/>

					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							風水急救
						</h2>
					</div>
					<div className="mb-6 sm:mb-8">
						<EmergencyFengShuiSection
							femaleUser={femaleUser}
							maleUser={maleUser}
							analysisData={analysisData}
							savedData={subsectionData.emergencyFengShui}
							onDataReady={(data) =>
								handleSubsectionData("emergencyFengShui", data)
							}
						/>
					</div>

					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							重啟默契
						</h2>
					</div>
					<div className="mb-6 sm:mb-8">
						<RestartChemistrySection
							femaleUser={femaleUser}
							maleUser={maleUser}
							analysisData={analysisData}
							savedData={subsectionData.restartChemistry}
							onDataReady={(data) =>
								handleSubsectionData("restartChemistry", data)
							}
						/>
					</div>
				</div>
			);
		}

		if (category === "special_situation") {
			// 特殊情境類: StarChartGuidanceSection + FengShuiTransformationSection + RelationshipMethodSection
			return (
				<div className="space-y-6 sm:space-y-8">
					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							星盤指引
						</h2>
					</div>
					<StarChartGuidanceSection
						femaleUser={femaleUser}
						maleUser={maleUser}
						analysisData={analysisData}
					/>

					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							風水轉化
						</h2>
					</div>
					<div className="mb-6 sm:mb-8">
						<FengShuiTransformationSection
							femaleUser={femaleUser}
							maleUser={maleUser}
							analysisData={analysisData}
						/>
					</div>

					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							相處心法
						</h2>
					</div>
					<div className="mb-6 sm:mb-8">
						<RelationshipMethodSection
							femaleUser={femaleUser}
							maleUser={maleUser}
							analysisData={analysisData}
						/>
					</div>
				</div>
			);
		}

		if (category === "taboo_breaking") {
			// 禁忌破解話術: KeyAnalysisSection + TargetedSuggestionsSection + RestartChemistrySection
			return (
				<div className="space-y-6 sm:space-y-8">
					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							關鍵分析
						</h2>
					</div>
					<KeyAnalysisSection
						femaleUser={femaleUser}
						maleUser={maleUser}
						analysisData={analysisData}
					/>

					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							針對性建議
						</h2>
					</div>
					<div className="mb-6 sm:mb-8">
						<TargetedSuggestionsSection
							femaleUser={femaleUser}
							maleUser={maleUser}
							analysisData={analysisData}
						/>
					</div>

					<div className="mb-4 sm:mb-6">
						<h2
							className="font-bold text-[#374A37]"
							style={{
								fontSize: "clamp(28px, 7vw, 36px)",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							重啟默契
						</h2>
					</div>
					<div className="mb-6 sm:mb-8">
						<RestartChemistrySection
							femaleUser={femaleUser}
							maleUser={maleUser}
							analysisData={analysisData}
						/>
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="w-full space-y-6 sm:space-y-8">
			{/* Main Analysis Section with New Layout */}
			<div
				className="flex flex-col gap-4 sm:gap-6 lg:flex-row"
				style={{ padding: "clamp(4px, 4vw, 4px)" }}
			>
				{/* Left Side: Large Compatibility Circle (Full Height) */}
				<div className="flex items-center justify-center py-6 sm:py-8 lg:w-1/3">
					<div className="relative">
						{/* Larger Circular Progress */}
						<div
							className="relative"
							style={{
								width: "clamp(240px, 60vw, 320px)",
								height: "clamp(240px, 60vw, 320px)",
							}}
						>
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
									stroke="url(#enhancedGradient)"
									strokeWidth="10"
									strokeLinecap="round"
									strokeDasharray={`${(compatibilityScore * 251.2) / 100} 251.2`}
									className="transition-all duration-1000 ease-out"
								/>
								{/* Gradient definition */}
								<defs>
									<linearGradient
										id="enhancedGradient"
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
							{/* Score display */}
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span
									className="font-bold text-amber-600"
									style={{
										fontSize: "clamp(48px, 12vw, 80px)",
									}}
								>
									{compatibilityScore}
								</span>
								<span
									className="mt-1 font-medium text-center text-gray-600 sm:mt-2"
									style={{
										fontSize: "clamp(14px, 3.5vw, 18px)",
									}}
								>
									{getCompatibilityLevel(compatibilityScore)}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side: BaZi Cards */}
				<div className="flex flex-col gap-4 sm:gap-6 lg:w-2/3">
					{/* BaZi Analysis Cards */}
					{analysisData && (
						<div className="flex flex-col gap-4 sm:gap-6">
							{/* Female BaZi Card */}
							<div
								className="overflow-hidden bg-white shadow-lg"
								style={{
									borderRadius: "clamp(20px, 5vw, 30px)",
								}}
							>
								<div
									className="bg-gradient-to-r from-pink-100 to-purple-100"
									style={{
										padding:
											"clamp(16px, 4vw, 24px) clamp(20px, 5vw, 24px)",
									}}
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<h3
											className="font-bold text-[#C74772]"
											style={{
												fontSize:
													"clamp(24px, 6vw, 36px)",
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											您的八字
										</h3>
										<div
											className="bg-white border-2 border-[#C74772] rounded-full self-start sm:self-center"
											style={{
												padding:
													"clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)",
											}}
										>
											<span
												className="text-[#C74772]"
												style={{
													fontSize:
														"clamp(11px, 2.8vw, 14px)",
												}}
											>
												{analysisData.female.birthDate}
											</span>
										</div>
									</div>
								</div>

								<div
									style={{
										padding: "clamp(16px, 4vw, 24px)",
									}}
								>
									{/* Four Pillars Display */}
									<div className="mb-4 sm:mb-6">
										<div className="flex flex-wrap gap-2">
											{analysisData.female.pillars?.map(
												(pillar, index) => (
													<div
														key={index}
														className="bg-white border border-[#DeaB20] rounded-full"
														style={{
															padding:
																"clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)",
														}}
													>
														<span
															className="font-medium text-[#6F5100]"
															style={{
																fontSize:
																	"clamp(8px, 2.8vw, 14px)",
															}}
														>
															{pillar}
														</span>
													</div>
												)
											)}
										</div>
									</div>

									{/* Description */}
									<div
										className="leading-relaxed text-gray-700"
										style={{
											fontSize: "clamp(12px, 3vw, 14px)",
											lineHeight: "1.6",
											minHeight:
												"clamp(60px, 15vw, 80px)", // Ensure consistent height
										}}
									>
										{formatBaziDescription(
											analysisData.female.description
										)}
									</div>
								</div>
							</div>

							{/* Male BaZi Card */}
							<div
								className="overflow-hidden bg-white shadow-lg"
								style={{
									borderRadius: "clamp(20px, 5vw, 30px)",
								}}
							>
								<div
									className="bg-gradient-to-r from-blue-100 to-indigo-100"
									style={{
										padding:
											"clamp(16px, 4vw, 24px) clamp(20px, 5vw, 24px)",
									}}
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<h3
											className="font-bold text-[#C74772]"
											style={{
												fontSize:
													"clamp(24px, 6vw, 36px)",
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											伴侶八字
										</h3>
										<div
											className="bg-white border-2 border-[#C74772] rounded-full self-start sm:self-center"
											style={{
												padding:
													"clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)",
											}}
										>
											<span
												className="text-[#C74772]"
												style={{
													fontSize:
														"clamp(11px, 2.8vw, 14px)",
												}}
											>
												{analysisData.male.birthDate}
											</span>
										</div>
									</div>
								</div>

								<div
									style={{
										padding: "clamp(16px, 4vw, 24px)",
									}}
								>
									{/* Four Pillars Display */}
									<div className="mb-4 sm:mb-6">
										<div className="flex flex-wrap gap-2">
											{analysisData.male.pillars?.map(
												(pillar, index) => (
													<div
														key={index}
														className="bg-white border border-[#DeaB20] rounded-full"
														style={{
															padding:
																"clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)",
														}}
													>
														<span
															className="font-medium text-[#6F5100]"
															style={{
																fontSize:
																	"clamp(8px, 2.8vw, 14px)",
															}}
														>
															{pillar}
														</span>
													</div>
												)
											)}
										</div>
									</div>

									{/* Description */}
									<div
										className="leading-relaxed text-gray-700"
										style={{
											fontSize: "clamp(12px, 3vw, 14px)",
											lineHeight: "1.6",
											minHeight:
												"clamp(60px, 15vw, 80px)", // Ensure consistent height
										}}
									>
										{formatBaziDescription(
											analysisData.male.description
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Problem Category Section */}
			{specificProblem && problemCategory && (
				<div
					className="mb-6 rounded-full sm:mb-8"
					style={{
						background: "linear-gradient(45deg, #b4003c, #d09900)",
						padding: "clamp(3px, 0.8vw, 4px)",
					}}
				>
					<div
						className="bg-white rounded-full"
						style={{ padding: "clamp(6px, 1.5vw, 8px)" }}
					>
						<div className="flex items-center justify-center">
							<div className="flex-1 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<h3
										className="font-bold text-gray-800"
										style={{
											fontSize: "clamp(16px, 4vw, 18px)",
										}}
									>
										問題類型：{problemCategory.categoryName}
									</h3>
								</div>
								<div
									style={{
										padding: "clamp(6px, 1.5vw, 8px)",
									}}
								>
									<p
										className="leading-relaxed text-[#515151] text-center"
										style={{
											fontSize: "clamp(20px, 5vw, 32px)",
										}}
									>
										{specificProblem}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Dynamic Sections Based on Category */}
			{renderSectionsByCategory()}
		</div>
	);
};

export default EnhancedCoupleSpecificProblemSolution;
