"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BaziAnalysisSystem } from "@/lib/newConversationFlow";
import { ArrowLeft, Calendar, User, Target, AlertCircle } from "lucide-react";
import FiveElement from "@/components/FiveElement";
import Zodiac from "@/components/Zodiac";
import LiuNianKeyWord from "@/components/LiuNianKeyWord";
import { MingJu } from "@/components/MingJu";
import LiuNianGanZhi from "@/components/LiuNianGanZhi";
import GanZhi from "@/components/GanZhi";
import JiXiong from "@/components/JiXiong";
import Season from "@/components/Season";
import CoreSuggestion from "@/components/CoreSuggestion";
import SpecificSuggestion from "@/components/SpecificSuggestion";
import QuestionFocus from "@/components/QuestionFocus";
import SavedReportDisplay from "@/components/SavedReportDisplay";
import getWuxingData from "@/lib/nayin";
import { LoadingProvider } from "@/utils/LoadingStateManagement";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import ReportStatusBanner from "@/components/ReportStatusBanner";
import { getConcernColor } from "@/utils/colorTheme";

// Global data store for component-generated data
if (typeof window !== "undefined") {
	window.componentDataStore = window.componentDataStore || {};
}

export default function FengShuiReportPage() {
	const t = useTranslations("fengShuiReport.page");
	const [reportData, setReportData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [historicalDataReady, setHistoricalDataReady] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	// Helper function to determine if components should render
	const shouldRenderComponents = () => {
		const hasReportData = !!reportData;
		const isHistorical = reportData?.isHistoricalReport;
		const dataReady = historicalDataReady;

		console.log("🎯 shouldRenderComponents check:", {
			hasReportData,
			isHistorical,
			dataReady,
			result: hasReportData && (!isHistorical || dataReady),
		});

		if (!reportData) return false;
		// For historical reports, wait until data is ready
		if (reportData.isHistoricalReport) {
			return historicalDataReady;
		}
		// For fresh reports, render immediately
		return true;
	};

	// Helper function to get concern-specific section titles
	const getSectionTitle = (concern) => {
		// Normalize concern to handle both simplified and traditional Chinese
		const normalizedConcern =
			concern === "财运" ? "財運" : concern === "事业" ? "事業" : concern;

		const titleMap = {
			財運: t("sectionWealthSummary"),
			感情: t("sectionRelationshipSummary"),
			健康: t("sectionHealthSummary"),
			事業: t("sectionCareerSummary"),
		};
		return titleMap[normalizedConcern] || t("sectionFortuneSummary");
	};

	// Five Elements analysis functions
	const calculateWuxingAnalysis = (userInfo) => {
		if (!userInfo?.birthDateTime) return null;

		const wuxingData = getWuxingData(
			userInfo.birthDateTime,
			userInfo.gender || "male"
		);

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
			0
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

	const determineUsefulGods = (strengthAnalysis) => {
		const { strongElements, weakElements, elementCounts } =
			strengthAnalysis;
		const elementCycle = ["木", "火", "土", "金", "水"];

		let primaryGod = "";
		let auxiliaryGod = "";
		let strategy = "";

		// Strategy 1: If there are missing elements, they become useful gods
		if (weakElements.length > 0) {
			primaryGod = weakElements[0];
			if (weakElements.length > 1) {
				auxiliaryGod = weakElements[1];
			} else {
				const primaryIndex = elementCycle.indexOf(primaryGod);
				const generatorIndex = (primaryIndex - 1 + 5) % 5;
				auxiliaryGod = elementCycle[generatorIndex];
			}
			strategy = "補缺";
		}
		// Strategy 2: If elements are relatively balanced, support the weakest
		else if (strongElements.length === 0) {
			const minCount = Math.min(...Object.values(elementCounts));
			const weakestElements = Object.entries(elementCounts)
				.filter(([_, count]) => count === minCount)
				.map(([element, _]) => element);

			primaryGod = weakestElements[0];
			const primaryIndex = elementCycle.indexOf(primaryGod);
			const generatorIndex = (primaryIndex - 1 + 5) % 5;
			auxiliaryGod = elementCycle[generatorIndex];
			strategy = "扶弱";
		}
		// Strategy 3: If there are overly strong elements, use restraining elements
		else if (strongElements.length >= 2) {
			const strongestElement = strongElements[0];
			const strongestIndex = elementCycle.indexOf(strongestElement);
			const restrainingIndex = (strongestIndex + 1) % 5;
			primaryGod = elementCycle[restrainingIndex];

			const secondaryRestrainingIndex = (restrainingIndex + 1) % 5;
			auxiliaryGod = elementCycle[secondaryRestrainingIndex];
			strategy = "抑強";
		}
		// Strategy 4: Single strong element - moderate restraint
		else if (strongElements.length === 1) {
			const strongElement = strongElements[0];
			const strongIndex = elementCycle.indexOf(strongElement);

			const drainingIndex = (strongIndex + 1) % 5;
			primaryGod = elementCycle[drainingIndex];

			const restrainingIndex = (strongIndex + 2) % 5;
			auxiliaryGod = elementCycle[restrainingIndex];
			strategy = "瀉強";
		}

		return {
			primaryGod,
			auxiliaryGod,
			strategy,
		};
	};

	useEffect(() => {
		checkAndGenerateReport();
	}, []);

	const checkAndGenerateReport = async () => {
		try {
			// Get session ID from URL parameters (check both possible parameter names)
			const sessionId =
				searchParams.get("sessionId") || searchParams.get("session_id");

			if (!sessionId) {
				setError(t("errorMissingSession"));
				setLoading(false);
				return;
			}

			console.log("Checking report for session:", sessionId);

			// Get URL parameters to pass to the API
			const birthday = searchParams.get("birthday");
			const birthTime = searchParams.get("birthTime");
			const gender = searchParams.get("gender");
			const concern = searchParams.get("concern");
			const problem = searchParams.get("problem");
			const partnerBirthday = searchParams.get("partnerBirthday");

			// Create URL with parameters for the API call
			const apiUrl = new URL(
				"/api/fortune-report",
				window.location.origin
			);
			if (birthday) apiUrl.searchParams.set("birthday", birthday);
			if (birthTime) apiUrl.searchParams.set("birthTime", birthTime);
			if (gender) apiUrl.searchParams.set("gender", gender);
			if (concern) apiUrl.searchParams.set("concern", concern);
			if (problem) apiUrl.searchParams.set("problem", problem);
			if (partnerBirthday)
				apiUrl.searchParams.set("partnerBirthday", partnerBirthday);

			// Check if report already exists and payment is verified
			const checkResponse = await fetch(apiUrl.toString(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ sessionId }),
			});

			const checkData = await checkResponse.json();

			console.log("API Response received:");
			console.log("- status:", checkData.status);
			console.log("- reportExists:", checkData.reportExists);
			console.log("- reportGenerated:", checkData.reportGenerated);
			console.log("- canGenerateNew:", checkData.data?.canGenerateNew);
			console.log("- sessionId:", sessionId);
			console.log("- Full response:", JSON.stringify(checkData, null, 2));

			if (checkData.status !== 0) {
				if (checkData.paymentRequired) {
					setError(t("errorPaymentIncomplete"));
				} else {
					setError(t("errorCheckReportStatus") + checkData.error);
				}
				setLoading(false);
				return;
			}

			// Check if we should show existing report or generate fresh content
			const showHistorical =
				searchParams.get("showHistorical") === "true";

			// Check if report content actually has meaningful data
			const hasActualContent =
				checkData.data?.reportContent &&
				Object.values(checkData.data.reportContent).some(
					(value) => value !== null && value !== undefined
				);

			console.log("🔍 Content check:", {
				reportExists: checkData.reportExists,
				reportGenerated: checkData.reportGenerated,
				hasActualContent: hasActualContent,
				showHistorical: showHistorical,
				reportContent: checkData.data?.reportContent,
			});

			if (
				checkData.reportExists &&
				checkData.reportGenerated &&
				hasActualContent &&
				showHistorical
			) {
				// Show saved historical content
				console.log("✅ Displaying saved historical report content");
				await displaySavedReport(checkData.data);
			} else if (checkData.data?.canGenerateNew) {
				// Generate fresh content (default behavior or no saved content)
				if (showHistorical && !hasActualContent) {
					console.log(
						"⚠️ Historical content requested but no saved data found, generating fresh content"
					);
				} else {
					console.log("✅ Generating fresh content for this session");
				}
				await generateNewReport(sessionId, checkData.data.userInputs);
			} else {
				console.error("❌ Cannot generate report!");
				console.error(
					"- Full checkData:",
					JSON.stringify(checkData, null, 2)
				);
				setError(t("errorReportGenerationFailed"));
				setLoading(false);
			}
		} catch (err) {
			console.error("Report check error:", err);
			setError(t("errorCheckingReport"));
			setLoading(false);
		}
	};

	const displaySavedReport = async (savedData) => {
		try {
			console.log("📖 Displaying saved report content:", savedData);

			// Double-check that we actually have content to display
			if (
				!savedData.reportContent ||
				Object.keys(savedData.reportContent).length === 0
			) {
				console.log(
					"⚠️ Saved data exists but reportContent is empty, falling back to fresh generation"
				);
				await generateNewReport(
					savedData.sessionId,
					savedData.userInputs
				);
				return;
			}

			// Import component data store utility
			const { storeComponentData, clearComponentData } = await import(
				"../../../utils/componentDataStore"
			);

			// Clear any existing data
			clearComponentData();

			// Set flag to indicate this is a historical report (so components won't generate fresh data)
			if (typeof window !== "undefined") {
				window.componentDataStore = window.componentDataStore || {};
				window.componentDataStore._isHistoricalReport = true;
			}

			// Pre-populate component data store with saved content
			console.log(
				"📥 Pre-populating component data store with saved content..."
			);

			// Map saved content to component data store
			const { reportContent } = savedData;

			if (reportContent.fiveElementAnalysis) {
				storeComponentData(
					"fiveElementAnalysis",
					reportContent.fiveElementAnalysis
				);
			}

			if (reportContent.zodiacAnalysis) {
				storeComponentData(
					"zodiacAnalysis",
					reportContent.zodiacAnalysis
				);
			}

			if (reportContent.liuNianKeyWordAnalysis) {
				// Parse JSON string if it's stored as string
				const liuNianData =
					typeof reportContent.liuNianKeyWordAnalysis === "string"
						? JSON.parse(reportContent.liuNianKeyWordAnalysis)
						: reportContent.liuNianKeyWordAnalysis;
				storeComponentData("liuNianKeyWordAnalysis", liuNianData);
			}

			if (reportContent.mingJuAnalysis) {
				storeComponentData(
					"mingJuAnalysis",
					reportContent.mingJuAnalysis
				);
			}

			if (reportContent.ganZhiAnalysis) {
				storeComponentData(
					"ganZhiAnalysis",
					reportContent.ganZhiAnalysis
				);
			}

			if (reportContent.jiXiongAnalysis) {
				storeComponentData(
					"jiXiongAnalysis",
					reportContent.jiXiongAnalysis
				);
			}

			if (reportContent.seasonAnalysis) {
				storeComponentData(
					"seasonAnalysis",
					reportContent.seasonAnalysis
				);
			}

			if (reportContent.coreSuggestionAnalysis) {
				storeComponentData(
					"coreSuggestionAnalysis",
					reportContent.coreSuggestionAnalysis
				);
			}

			if (reportContent.specificSuggestionAnalysis) {
				storeComponentData(
					"specificSuggestionAnalysis",
					reportContent.specificSuggestionAnalysis
				);
			}

			if (reportContent.questionFocusAnalysis) {
				storeComponentData(
					"questionFocusAnalysis",
					reportContent.questionFocusAnalysis
				);
			}

			console.log(
				"✅ Component data store populated with historical content"
			);

			// Create proper birthDateTime for historical reports too
			// Default to 12:00 PM (noon) if no birth time is provided for better accuracy
			const historicalBirthday = savedData.userInputs.birthday;
			const historicalBirthTime = savedData.userInputs.birthTime;
			let historicalBirthDateTime = historicalBirthday;
			if (historicalBirthTime) {
				historicalBirthDateTime = `${historicalBirthday} ${historicalBirthTime}`;
			} else {
				// Default to noon (12:00 PM) for better astrological accuracy
				historicalBirthDateTime = `${historicalBirthday} 12:00`;
			}

			// Create report data structure from saved content
			const reportData = {
				birthday: historicalBirthDateTime, // Use combined birthDateTime
				birthTime: historicalBirthTime,
				gender: savedData.userInputs.gender,
				concern: savedData.userInputs.concern,
				problem: savedData.userInputs.problem,
				partnerBirthday: savedData.userInputs.partnerBirthday,
				// Use saved content instead of generating new
				savedReportContent: savedData.reportContent,
				isHistoricalReport: true,
			};

			// Set historical data as ready
			setHistoricalDataReady(true);
			setReportData(reportData);
			setLoading(false);
		} catch (err) {
			console.error("Error displaying saved report:", err);
			setError("顯示已儲存報告時出現錯誤");
			setLoading(false);
		}
	};

	const generateNewReport = async (sessionId, userInputs) => {
		try {
			// Clear historical report flag for fresh generation
			if (typeof window !== "undefined" && window.componentDataStore) {
				window.componentDataStore._isHistoricalReport = false;
			}

			// Get parameters from URL or use stored user inputs
			const birthday =
				searchParams.get("birthday") || userInputs.birthday;
			const birthTime =
				searchParams.get("birthTime") || userInputs.birthTime;
			const gender = searchParams.get("gender") || userInputs.gender;
			const concern = searchParams.get("concern") || userInputs.concern;
			const problem = searchParams.get("problem") || userInputs.problem;
			const partnerBirthday =
				searchParams.get("partnerBirthday") ||
				userInputs.partnerBirthday;

			// Create proper birthDateTime by combining birthday and birthTime
			// Default to 12:00 PM (noon) if no birth time is provided for better accuracy
			let birthDateTime = birthday;
			if (birthTime) {
				// Combine date and time: "2024-10-13" + "14:30" = "2024-10-13 14:30"
				birthDateTime = `${birthday} ${birthTime}`;
			} else {
				// Default to noon (12:00 PM) for better astrological accuracy
				birthDateTime = `${birthday} 12:00`;
			}

			// Debug logging
			console.log("Generating new report with params:");
			console.log("- birthday:", birthday);
			console.log("- birthTime:", birthTime);
			console.log("- birthDateTime:", birthDateTime);
			console.log("- gender:", gender);
			console.log("- concern:", concern);
			console.log("- problem:", problem);
			console.log("- partnerBirthday:", partnerBirthday);

			if (!birthday || !concern || !problem) {
				setError("缺少必要的分析參數");
				setLoading(false);
				return;
			}

			const birthdayDate = new Date(birthDateTime);
			console.log(
				"🔍 Calling BaziAnalysisSystem.generatePersonalAnalysisV2..."
			);

			// Instead of relying on BaziAnalysisSystem, we'll collect data from components directly
			const analysisPromises = [];
			const analysisResults = {};

			// Create a promise-based approach to collect all component data
			const collectComponentData = async () => {
				return new Promise((resolve) => {
					// Set up observers for each component
					const componentData = {
						fiveElementAnalysis: null,
						zodiacAnalysis: null,
						liuNianKeyWordAnalysis: null,
						mingJuAnalysis: null,
						ganZhiAnalysis: null,
						jiXiongAnalysis: null,
						seasonAnalysis: null,
						coreSuggestionAnalysis: null,
						specificSuggestionAnalysis: null,
					};

					let completedComponents = 0;
					const totalComponents = Object.keys(componentData).length;

					// Function to check if all components are loaded
					const checkCompletion = () => {
						if (completedComponents >= totalComponents) {
							console.log(
								"🎉 All components loaded successfully!"
							);
							resolve(componentData);
						}
					};

					// Set up component data collection with timeout
					const collectWithTimeout = async () => {
						// Wait for components to initialize and load
						await new Promise((resolve) =>
							setTimeout(resolve, 5000)
						); // 5 second timeout

						// Try to collect data from global component states or localStorage
						// This is a fallback approach since we can't directly await component loading
						completedComponents = totalComponents; // Force completion for now
						resolve(componentData);
					};

					collectWithTimeout();
				});
			};

			// For now, let's use the original analysis but with better structure detection
			const analysis =
				await BaziAnalysisSystem.generatePersonalAnalysisV2(
					birthdayDate,
					concern,
					problem
				);

			console.log("📊 Analysis result:");
			console.log("- analysis:", analysis);
			console.log(
				"- analysis keys:",
				analysis ? Object.keys(analysis) : "null"
			);

			// Log all properties to see the actual structure
			if (analysis) {
				Object.keys(analysis).forEach((key) => {
					console.log(`- analysis.${key}:`, analysis[key]);
				});
			}

			let coupleAnalysis = null;
			if (partnerBirthday && concern === "感情") {
				const partnerBirthdayDate = new Date(partnerBirthday);
				coupleAnalysis = BaziAnalysisSystem.generateCoupleAnalysis(
					birthdayDate,
					partnerBirthdayDate
				);
				console.log("💑 Couple analysis result:", coupleAnalysis);
			}

			const reportData = {
				birthday: birthDateTime, // Use the combined birthDateTime
				birthTime,
				gender,
				concern,
				problem,
				partnerBirthday,
				analysis,
				coupleAnalysis,
			};

			// Prepare initial report content (basic info from generatePersonalAnalysisV2)
			const reportContentToSave = {
				// Map the actual analysis structure
				basicAnalysis: analysis,
				coupleAnalysis: coupleAnalysis,
				initialSaveTime: new Date().toISOString(),
				// Component-specific analyses will be saved later
				fiveElementAnalysis: null,
				zodiacAnalysis: null,
				liuNianKeyWordAnalysis: null,
				mingJuAnalysis: null, // Note: MingJu handles its own internal analysis
				ganZhiAnalysis: null,
				jiXiongAnalysis: null,
				seasonAnalysis: null,
				coreSuggestionAnalysis: null,
				specificSuggestionAnalysis: null,
			};

			console.log("💾 Saving report content to database:");
			console.log(
				"- reportContentToSave:",
				JSON.stringify(reportContentToSave, null, 2)
			);

			// Save the generated report to database
			const saveResponse = await fetch("/api/fortune-report", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					sessionId,
					reportContent: reportContentToSave,
				}),
			});

			const saveData = await saveResponse.json();
			console.log("💾 Save response:", saveData);
			if (saveData.status === 0) {
				console.log("✅ Report saved successfully to database");
			} else {
				console.warn(
					"❌ Failed to save report to database:",
					saveData.error
				);
			}

			setHistoricalDataReady(false); // This is fresh content, not historical
			setReportData(reportData);
			setLoading(false);

			// Start background process to save complete content after components load
			setTimeout(() => {
				saveCompleteReportContent(
					sessionId,
					birthdayDate,
					concern,
					problem,
					partnerBirthday,
					gender
				);
			}, 80000); // Wait 80 seconds for all AI components to complete (extended for Season)
		} catch (err) {
			console.error("Report generation error:", err);
			setError(t("errorGeneratingReport"));
			setLoading(false);
		}
	};

	const saveCompleteReportContent = async (
		sessionId,
		birthdayDate,
		concern,
		problem,
		partnerBirthday,
		gender
	) => {
		try {
			console.log(
				"🔄 Starting background save of complete report content..."
			);
			console.log("📋 Session ID for background save:", sessionId);

			// Wait additional time to ensure all components are fully loaded
			await new Promise((resolve) => setTimeout(resolve, 15000));

			// Try to collect actual data from the loaded components
			const completeReportContent = await collectLoadedComponentData(
				birthdayDate,
				concern,
				problem,
				gender
			);

			console.log(
				"💾 Saving complete report content:",
				completeReportContent
			);

			// Update the database with complete content
			const updateResponse = await fetch("/api/fortune-report", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					sessionId,
					reportContent: completeReportContent,
				}),
			});

			const updateData = await updateResponse.json();
			if (updateData.status === 0) {
				console.log("✅ Complete report content saved successfully!");
			} else {
				console.warn(
					"❌ Failed to save complete content:",
					updateData.error
				);
			}
		} catch (error) {
			console.error("❌ Error saving complete report content:", error);
		}
	};

	const collectLoadedComponentData = async (
		birthdayDate,
		concern,
		problem,
		gender
	) => {
		console.log(
			"🗃️ Checking for component-generated data in global store..."
		);
		console.log(
			"🗃️ Available keys:",
			Object.keys(window.componentDataStore || {})
		);

		// Log what we have from the global store
		console.log("📊 Data from component store:");
		const componentFields = [
			"fiveElementAnalysis",
			"zodiacAnalysis",
			"liuNianKeyWordAnalysis",
			"mingJuAnalysis",
			"ganZhiAnalysis",
			"jiXiongAnalysis",
			"seasonAnalysis",
			"coreSuggestionAnalysis",
			"specificSuggestionAnalysis",
			"questionFocusAnalysis",
		];

		componentFields.forEach((field) => {
			const hasData = window.componentDataStore?.[field];
			console.log(`  ${field}: ${hasData ? "HAS_DATA" : "MISSING"}`);
		});

		// Use data from global store (generated by components) as primary source
		const completeContent = {
			fiveElementAnalysis:
				window.componentDataStore?.fiveElementAnalysis || null,
			zodiacAnalysis: window.componentDataStore?.zodiacAnalysis || null,
			liuNianKeyWordAnalysis:
				window.componentDataStore?.liuNianKeyWordAnalysis || null,
			mingJuAnalysis: window.componentDataStore?.mingJuAnalysis || null,
			ganZhiAnalysis: window.componentDataStore?.ganZhiAnalysis || null,
			jiXiongAnalysis: window.componentDataStore?.jiXiongAnalysis || null,
			seasonAnalysis: window.componentDataStore?.seasonAnalysis || null,
			coreSuggestionAnalysis:
				window.componentDataStore?.coreSuggestionAnalysis || null,
			specificSuggestionAnalysis:
				window.componentDataStore?.specificSuggestionAnalysis || null,
			questionFocusAnalysis:
				window.componentDataStore?.questionFocusAnalysis || null,
			reportGeneratedAt: new Date().toISOString(),
		};

		// Log collection results
		componentFields.forEach((field) => {
			const hasData = completeContent[field];
			console.log(
				`✅ Collected ${field}: ${hasData ? "SUCCESS" : "NULL"}`
			);
		});

		console.log("📊 Complete component data collection results:", {
			liuNianKeyWordAnalysis: completeContent.liuNianKeyWordAnalysis
				? "HAS_DATA"
				: "NULL",
			ganZhiAnalysis: completeContent.ganZhiAnalysis
				? "HAS_DATA"
				: "NULL",
			jiXiongAnalysis: completeContent.jiXiongAnalysis
				? "HAS_DATA"
				: "NULL",
			seasonAnalysis: completeContent.seasonAnalysis
				? "HAS_DATA"
				: "NULL",
			coreSuggestionAnalysis: completeContent.coreSuggestionAnalysis
				? "HAS_DATA"
				: "NULL",
			specificSuggestionAnalysis:
				completeContent.specificSuggestionAnalysis
					? "HAS_DATA"
					: "NULL",
			questionFocusAnalysis: completeContent.questionFocusAnalysis
				? "HAS_DATA"
				: "NULL",
		});

		return completeContent;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#EFEFEF]">
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
								fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
								fontWeight: 500,
							}}
						>
							{t("loadingTitle")}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
				<div className="text-center">
					<AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
					<p className="mb-4 text-red-600">{error}</p>
					<button
						onClick={() => router.back()}
						className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
					>
						{t("errorReturn")}
					</button>
				</div>
			</div>
		);
	}

	// Handle new report request
	const handleNewReportRequest = () => {
		// Redirect to pricing page or main page for new analysis
		router.push("/price?newReport=true");
	};

	// For historical reports, add a banner but use normal component rendering
	const showHistoricalBanner = reportData?.isHistoricalReport;

	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			<Navbar from="report" />
			<LoadingProvider>
				<div
					className="container w-full px-4 py-8 mx-auto"
					style={{ paddingTop: "80px" }}
				>
					{/* Historical Report Banner */}
					{showHistoricalBanner && (
						<div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
							<p className="text-yellow-800">
								<strong>{t("historicalBanner")}</strong>
								{t("historicalBannerText")}
								<a
									href="/price"
									className="ml-2 text-blue-600 underline hover:text-blue-800"
								>
									{t("historicalBannerLink")}
								</a>
							</p>
						</div>
					)}

					{/* 頭部 */}
					<div className="mb-8 ml-0 md:ml-[5%]">
						<h1
							className="mb-2 font-extrabold text-center md:text-left"
							style={{
								fontFamily: "Noto Serif TC, Serif",
								fontWeight: 800,
								color: getConcernColor({
									concern: reportData?.concern,
								}),
								fontSize: "clamp(2rem, 6vw, 60px)",
								lineHeight: 1.1,
							}}
						>
							{t("sectionBasicAnalysis")}
						</h1>
					</div>

					{/* Five Elements Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6" style={{ width: "100%" }}>
							<FiveElement
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
								}}
								calculateWuxingAnalysis={
									calculateWuxingAnalysis
								}
								analyzeWuxingStrength={analyzeWuxingStrength}
								determineUsefulGods={determineUsefulGods}
							/>
						</div>
					)}

					{/* Zodiac and Four Pillars Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<Zodiac
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								calculateWuxingAnalysis={
									calculateWuxingAnalysis
								}
								analyzeWuxingStrength={analyzeWuxingStrength}
								determineUsefulGods={determineUsefulGods}
							/>
						</div>
					)}

					{/* Question Focus Section */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<QuestionFocus
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
							/>
						</div>
					)}

					{/* Liu Nian Key Word Analysis */}
					{/* {shouldRenderComponents() && (
						<div className="mb-6">
							<LiuNianKeyWord
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								currentYear={new Date().getFullYear()}
							/>
						</div>
					)} */}
					<div className="mb-8 ml-0 md:ml-[5%]">
						<h1
							className="mb-2 font-extrabold text-center md:text-left"
							style={{
								fontFamily: "Noto Serif TC, Serif",
								fontWeight: 800,
								color: getConcernColor({
									concern: reportData?.concern,
								}),
								fontSize: "clamp(2rem, 6vw, 60px)",
								lineHeight: 1.1,
							}}
						>
							{t("sectionCoreAnalysis")}
						</h1>
					</div>
					{/* Ming Ju Core Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<MingJu
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								currentYear={new Date().getFullYear()}
							/>
						</div>
					)}
					<div className="mb-6 sm:mb-8 ml-0 md:ml-[5%]">
						<h1
							className="mb-2 font-extrabold text-center md:text-left"
							style={{
								fontFamily: "Noto Serif TC, Serif",
								fontWeight: 800,
								color: getConcernColor({
									concern: reportData?.concern,
								}),
								fontSize: "clamp(2rem, 6vw, 60px)",
								lineHeight: 1.1,
							}}
						>
							{t("sectionFlowYear")}
						</h1>
					</div>
					{/* Gan Zhi Detailed Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<GanZhi
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								currentYear={new Date().getFullYear()}
							/>
						</div>
					)}
					<div className="mb-6 sm:mb-8 ml-0 md:ml-[5%]">
						<h1
							className="mb-2 font-extrabold text-center md:text-left"
							style={{
								fontFamily: "Noto Serif TC, Serif",
								fontWeight: 800,
								color: getConcernColor({
									concern: reportData?.concern,
								}),
								fontSize: "clamp(2rem, 6vw, 60px)",
								lineHeight: 1.1,
							}}
						>
							{getSectionTitle(reportData?.concern)}
						</h1>
					</div>
					{/* Ji Xiong Analysis */}
					{shouldRenderComponents() && (
						<div className="flex justify-center mb-6">
							<JiXiong
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								calculateWuxingAnalysis={
									calculateWuxingAnalysis
								}
								analyzeWuxingStrength={analyzeWuxingStrength}
								determineUsefulGods={determineUsefulGods}
							/>
						</div>
					)}

					{/* Season Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<Season
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								currentYear={new Date().getFullYear()}
							/>
						</div>
					)}
					<div className="mb-8 ml-0 md:ml-[5%]">
						<h1
							className="mb-2 font-extrabold text-center md:text-left"
							style={{
								fontFamily: "Noto Serif TC, Serif",
								fontWeight: 800,
								color: getConcernColor({
									concern: reportData?.concern,
								}),
								fontSize: "clamp(2rem, 6vw, 60px)",
								lineHeight: 1.1,
							}}
						>
							{t("sectionLuckAdvice")}
						</h1>
					</div>
					{/* Core Suggestion Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<CoreSuggestion
								userInfo={{
									birthDateTime: reportData.birthday,
									birthTime: reportData.birthTime,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								currentYear={new Date().getFullYear()}
							/>
						</div>
					)}

					{/* Specific Suggestion Analysis */}
					{shouldRenderComponents() && (
						<div className="mb-6">
							<SpecificSuggestion
								userInfo={{
									birthDateTime: reportData.birthday,
									gender: reportData.gender,
									concern: reportData.concern,
									problem: reportData.problem,
								}}
								currentYear={new Date().getFullYear()}
							/>
						</div>
					)}
				</div>
			</LoadingProvider>
			<Footer />
		</div>
	);
}
