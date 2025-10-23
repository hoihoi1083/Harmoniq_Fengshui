"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CoupleAnalysisContext = createContext();

export const useCoupleAnalysis = () => {
	const context = useContext(CoupleAnalysisContext);
	if (!context) {
		throw new Error(
			"useCoupleAnalysis must be used within a CoupleAnalysisProvider"
		);
	}
	return context;
};

export const CoupleAnalysisProvider = ({
	children,
	user1,
	user2,
	specificProblem,
	isSimplified = false,
	initialData, // Pre-saved data to prevent AI generation
}) => {
	const [analysisData, setAnalysisData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [apiCallMade, setApiCallMade] = useState(false); // Prevent multiple API calls

	// Cache for component-specific analysis to prevent re-loading
	// Initialize with saved data if available
	const [annualAnalysisCache, setAnnualAnalysisCache] = useState(
		initialData?.annualAnalysis || null
	);
	const [godAnalysisCache, setGodAnalysisCache] = useState(
		initialData?.godExplanation || null
	);
	const [individualAnalysisCache, setIndividualAnalysisCache] = useState({});
	const [coupleMingJuCache, setCoupleMingJuCache] = useState(
		initialData?.mingJuAnalysis || null
	);
	const [coupleSeasonCache, setCoupleSeasonCache] = useState(
		initialData?.seasonAnalysis || null
	);
	const [coupleCoreSuggestionCache, setCoupleCoreSuggestionCache] = useState(
		initialData?.coreSuggestions || null
	);

	// Generate stable session ID based on user data
	const stableSessionId =
		user1?.birthDateTime && user2?.birthDateTime
			? `couple-analysis-${user1.birthDateTime.replace(/[^0-9]/g, "")}-${user2.birthDateTime.replace(/[^0-9]/g, "")}`
			: `couple-analysis-${Date.now()}`;

	useEffect(() => {
		// If we have initial data (saved data), skip API calls
		if (initialData) {
			console.log(
				"📋 CoupleAnalysisProvider received initialData:",
				initialData
			);
			console.log("📋 InitialData keys:", Object.keys(initialData));
			console.log(
				"📋 InitialData values check:",
				Object.keys(initialData).map((key) => ({
					[key]: !!initialData[key],
				}))
			);

			// Check if we have any valid saved content
			const hasValidData = Object.values(initialData).some(
				(value) => value !== null && value !== undefined
			);
			console.log("📋 Has valid saved data:", hasValidData);

			if (hasValidData) {
				console.log("✅ Using saved data, skipping AI generation");
				console.log("📋 Cache states:", {
					annualAnalysisCache: !!annualAnalysisCache,
					godAnalysisCache: !!godAnalysisCache,
					coupleMingJuCache: !!coupleMingJuCache,
					coupleSeasonCache: !!coupleSeasonCache,
					coupleCoreSuggestionCache: !!coupleCoreSuggestionCache,
				});
				setAnalysisData({ saved: true }); // Set minimal data to indicate ready
				setLoading(false);
				return;
			} else {
				console.log("❌ InitialData exists but no valid content found");
			}
		} else {
			console.log("❌ No initialData provided to CoupleAnalysisProvider");
		}

		const fetchAnalysis = async () => {
			if (!user1?.birthDateTime || !user2?.birthDateTime) {
				setLoading(false);
				return;
			}

			// Prevent multiple API calls with the same session
			if (apiCallMade) {
				console.log(
					"⚠️ API call already made for this session, skipping..."
				);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setApiCallMade(true); // Mark API call as made
				console.log(
					"🔮 Fetching comprehensive couple analysis with stable sessionId:",
					stableSessionId
				);

				const response = await fetch("/api/couple-analysis", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						birthday: user1.birthDateTime,
						birthday2: user2.birthDateTime,
						gender: user1.gender || "male",
						gender2: user2.gender || "female",
						problem:
							specificProblem ||
							(isSimplified
								? "感情关系和谐改善建议"
								: "感情關係和諧改善建議"),
						sessionId: stableSessionId, // Use stable session ID
						isSimplified: isSimplified,
					}),
				});

				if (!response.ok) {
					throw new Error(
						`Analysis request failed: ${response.status}`
					);
				}

				const result = await response.json();

				if (result.success && result.data) {
					console.log(
						"✅ Couple analysis completed successfully with stable score:",
						result.data?.compatibility?.score
					);
					setAnalysisData(result.data);
					setError(null);
				} else {
					throw new Error(result.error || "Analysis failed");
				}
			} catch (err) {
				console.error("❌ Failed to fetch couple analysis:", err);
				setError(err.message);
				setAnalysisData(null);
				setApiCallMade(false); // Reset on error to allow retry
			} finally {
				setLoading(false);
			}
		};

		fetchAnalysis();
	}, [user1, user2, specificProblem, initialData]);

	const value = {
		analysisData,
		loading,
		error,
		// Cache management
		annualAnalysisCache,
		setAnnualAnalysisCache,
		godAnalysisCache,
		setGodAnalysisCache,
		individualAnalysisCache,
		setIndividualAnalysisCache,
		coupleMingJuCache,
		setCoupleMingJuCache,
		coupleSeasonCache,
		setCoupleSeasonCache,
		coupleCoreSuggestionCache,
		setCoupleCoreSuggestionCache,
		refetch: () => {
			setAnalysisData(null);
			setError(null);
			setApiCallMade(false); // Reset API call flag to allow refetch
			// Clear all caches when refetching
			setAnnualAnalysisCache(null);
			setGodAnalysisCache(null);
			setIndividualAnalysisCache({});
			setCoupleMingJuCache(null);
			setCoupleSeasonCache(null);
			setCoupleCoreSuggestionCache(null);
			// Re-trigger the useEffect
			setLoading(true);
		},
	};

	return (
		<CoupleAnalysisContext.Provider value={value}>
			{children}
		</CoupleAnalysisContext.Provider>
	);
};
