"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Download, Share2, Headphones, ArrowRight } from "lucide-react";
import { useCoupleAnalysis } from "@/contexts/CoupleAnalysisContext";
import { getCoupleComponentData } from "@/utils/coupleComponentDataStore";
import { EnhancedInitialAnalysis } from "@/lib/enhancedInitialAnalysis";
import { saveComponentContentWithUser } from "@/utils/simpleCoupleContentSave";

const CoupleGodExplain = ({ user1, user2 }) => {
	const { data: session } = useSession();
	const { analysisData, godAnalysisCache, setGodAnalysisCache } =
		useCoupleAnalysis();
	const [godExplanations, setGodExplanations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Check for historical saved data first (highest priority)
		const historicalData = getCoupleComponentData("coupleGodExplain");
		if (historicalData) {
			console.log(
				"🏛️ Using historical couple god explanation data from data store"
			);
			// Extract godExplanations from the saved data structure
			const explanations =
				historicalData.godExplanations || historicalData || [];
			setGodExplanations(Array.isArray(explanations) ? explanations : []);
			setLoading(false);
			return;
		}

		// Check cache first to avoid re-loading
		if (godAnalysisCache) {
			console.log("📋 Using cached god analysis");
			setGodExplanations(godAnalysisCache);
			setLoading(false);
			return;
		}

		const generateGodExplanations = async () => {
			if (!user1?.birthDateTime || !user2?.birthDateTime) {
				setError("缺少生辰資料");
				setLoading(false);
				return;
			}

			try {
				// Generate AI-powered Ten Gods interaction analysis
				const explanations = await fetchGodInteractionAnalysis(
					user1,
					user2,
					analysisData
				);
				setGodExplanations(explanations);
				// Cache the result to prevent re-loading
				setGodAnalysisCache(explanations);
				console.log("💾 Cached god analysis for future use");

				// Save to database immediately
				const sessionId =
					`couple_${user1.birthDateTime}_${user2.birthDateTime}`.replace(
						/[^a-zA-Z0-9]/g,
						"_"
					);
				saveComponentContentWithUser(
					session,
					sessionId,
					"coupleGodExplain",
					{ explanations },
					{
						birthday: user1.birthDateTime,
						birthday2: user2.birthDateTime,
						gender: user1.gender,
						gender2: user2.gender,
					}
				);

				setLoading(false);
			} catch (err) {
				console.error("Error generating god explanations:", err);
				setError("分析生成失敗");
				setLoading(false);
			}
		};

		generateGodExplanations();
	}, [user1, user2, analysisData]);

	const fetchGodInteractionAnalysis = async (user1, user2, coupleData) => {
		try {
			console.log("🎯 Fetching Ten Gods interaction analysis...");

			// Generate unique cache key to ensure fresh content
			const timestamp = Date.now();
			const randomSeed = Math.random().toString(36).substring(7);
			const cacheKey = `${timestamp}_${randomSeed}`;

			const response = await fetch("/api/couple-god-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache, no-store, must-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				},
				body: JSON.stringify({
					user1Birthday: user1.birthDateTime,
					user2Birthday: user2.birthDateTime,
					user1Name: user1.name || "男方",
					user2Name: user2.name || "女方",
					compatibilityData: coupleData,
					analysisType: "ten_gods_interaction",
					cacheKey: cacheKey, // Add unique cache key
					timestamp: timestamp, // Cache buster
				}),
			});

			if (!response.ok) {
				throw new Error(
					`API request failed: ${response.status} ${response.statusText}`
				);
			}

			const result = await response.json();
			console.log("📊 Ten Gods API response:", result);

			if (result.warning) {
				console.warn("⚠️ API Warning:", result.warning);
			}

			return result.godExplanations || [];
		} catch (error) {
			console.error("❌ Ten Gods API call failed:", error);
			throw error;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gray-50">
				<div className="max-w-full mx-auto sm:max-w-4xl">
					<div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
						<div
							className="border-b-2 border-pink-500 rounded-full animate-spin"
							style={{
								width: "clamp(24px, 6vw, 32px)",
								height: "clamp(24px, 6vw, 32px)",
							}}
						></div>
						<span
							className="ml-2 text-gray-600 sm:ml-3"
							style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
						>
							正在生成十神互動精微解讀...
						</span>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gray-50">
				<div className="max-w-full mx-auto sm:max-w-4xl">
					<div className="px-4 py-12 text-center sm:py-16 lg:py-20">
						<div
							className="mb-3 text-red-500 sm:mb-4"
							style={{ fontSize: "clamp(16px, 4vw, 18px)" }}
						>
							分析生成失敗
						</div>
						<div
							className="text-gray-600"
							style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
						>
							{error}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen my-6 sm:my-8 lg:my-12">
			<div className="max-w-full px-3 mx-auto sm:px-4 lg:px-6">
				{/* Header - Responsive */}
				<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
					<h1
						className="font-bold text-center text-gray-800 sm:text-left"
						style={{ fontSize: "clamp(24px, 6vw, 32px)" }}
					>
						十神互動精微解讀
					</h1>
					{/* <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
						<button className="flex items-center justify-center gap-2 px-3 py-2 text-white transition-colors bg-pink-500 rounded-full sm:px-4 hover:bg-pink-600">
							<Download className="w-3 h-3 sm:w-4 sm:h-4" />
							<span style={{ fontSize: "clamp(12px, 3vw, 14px)" }}>下載報告</span>
						</button>
						<button className="flex items-center justify-center gap-2 px-3 py-2 text-white transition-colors bg-pink-500 rounded-full sm:px-4 hover:bg-pink-600">
							<Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
							<span style={{ fontSize: "clamp(12px, 3vw, 14px)" }}>分享您的結果</span>
						</button>
					</div> */}
				</div>

				{/* God Interaction Cards - Responsive */}
				<div className="space-y-4 sm:space-y-6">
					{godExplanations.map((explanation, index) => (
						<div
							key={index}
							className="w-full bg-white shadow-md"
							style={{
								borderRadius: "clamp(15px, 4vw, 30px)",
								padding: "clamp(16px, 4vw, 24px)",
							}}
						>
							<GodInteractionCard
								explanation={explanation}
								index={index}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const GodInteractionCard = ({ explanation, index }) => {
	const getGodColor = (explanation, isFromGod = true) => {
		// In the Ten Gods analysis:
		// - user1 is typically male (should be blue #4B6EB2)
		// - user2 is typically female (should be pink #C74772)

		const godName = isFromGod ? explanation.fromGod : explanation.toGod;

		// Check if god name explicitly mentions gender
		if (godName.includes("女方")) {
			return "#C74772"; // Female color - pink
		}
		if (godName.includes("男方")) {
			return "#4B6EB2"; // Male color - blue
		}

		// For interactions without explicit gender markers,
		// assume fromGod is from female (user2) and toGod is from male (user1)
		// based on the typical structure of the analysis
		if (isFromGod) {
			return "#C74772"; // Female color - pink (fromGod is typically female)
		} else {
			return "#4B6EB2"; // Male color - blue (toGod is typically male)
		}
	};

	return (
		<div className="space-y-3 sm:space-y-4">
			{/* Interaction Direction Header - Responsive */}
			<div className="flex items-center justify-center mb-4 sm:mb-6">
				<div className="flex flex-col items-center w-full max-w-lg gap-3 sm:flex-row sm:gap-4">
					<div
						className="w-full font-medium text-center text-white rounded-full sm:w-auto"
						style={{
							backgroundColor: getGodColor(explanation, true),
							padding:
								"clamp(8px, 2vw, 12px) clamp(16px, 4vw, 40px)",
							fontSize: "clamp(14px, 3.5vw, 18px)",
						}}
					>
						{explanation.fromGod || "女方金偏印"}
					</div>
					<ArrowRight
						className="text-gray-400 transform rotate-90 sm:rotate-0"
						style={{
							width: "clamp(16px, 4vw, 24px)",
							height: "clamp(16px, 4vw, 24px)",
						}}
					/>
					<div
						className="w-full font-medium text-center text-white rounded-full sm:w-auto"
						style={{
							backgroundColor: getGodColor(explanation, false),
							padding:
								"clamp(8px, 2vw, 12px) clamp(16px, 4vw, 40px)",
							fontSize: "clamp(14px, 3.5vw, 18px)",
						}}
					>
						{explanation.toGod || "男方己土食神"}
					</div>
				</div>
			</div>

			{/* 互動分析 Card - Responsive */}
			<div
				className="bg-[#EFEFEF] shadow-lg rounded-lg"
				style={{ padding: "clamp(12px, 3vw, 16px)" }}
			>
				<div className="text-black">
					<div className="mb-2 sm:mb-3">
						<h3
							className="mb-1 font-semibold text-gray-800 sm:mb-2"
							style={{ fontSize: "clamp(16px, 4vw, 18px)" }}
						>
							互動分析
						</h3>
						<div
							className="leading-relaxed text-gray-700"
							style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
						>
							{explanation.interaction || "分析中..."}
						</div>
					</div>

					{/* Key Issues within interaction analysis - Responsive */}
					{explanation.keyIssues && (
						<div
							className="mt-2 border-l-4 border-orange-400 rounded-r-lg bg-orange-50 sm:mt-3"
							style={{
								padding:
									"clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)",
							}}
						>
							<h4
								className="mb-1 font-semibold text-orange-600 sm:mb-2"
								style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
							>
								關鍵要點
							</h4>
							<p
								className="leading-relaxed text-gray-700"
								style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
							>
								{explanation.keyIssues}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* 相互影響 Card - Responsive */}
			<div
				className="bg-[#EFEFEF] shadow-lg rounded-lg"
				style={{ padding: "clamp(12px, 3vw, 16px)" }}
			>
				<div className="text-black">
					<div className="mb-2 sm:mb-3">
						<h3
							className="mb-1 font-semibold text-gray-800 sm:mb-2"
							style={{ fontSize: "clamp(16px, 4vw, 18px)" }}
						>
							相互影響
						</h3>

						{/* Mutual Effects Analysis - Responsive */}
						{explanation.effects ? (
							<div
								className="leading-relaxed text-gray-700"
								style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
							>
								{explanation.effects}
							</div>
						) : (
							<div
								className="leading-relaxed text-gray-700"
								style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
							>
								{explanation.interaction
									? `這種${explanation.fromGod}與${explanation.toGod}的互動，會在雙方關係中產生深層的相互影響，需要特別注意平衡和調和。`
									: "相互影響分析中..."}
							</div>
						)}
					</div>

					{/* Problems section within mutual influence - Responsive */}
					{explanation.problems &&
						explanation.problems.length > 0 && (
							<div
								className="mt-2 border-l-4 border-red-400 rounded-r-lg bg-red-50 sm:mt-3"
								style={{
									padding:
										"clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)",
								}}
							>
								<h4
									className="mb-1 font-semibold text-red-600 sm:mb-2"
									style={{
										fontSize: "clamp(14px, 3.5vw, 16px)",
									}}
								>
									潛在問題
								</h4>
								<div className="space-y-1">
									{explanation.problems.map(
										(problem, idx) => (
											<p
												key={idx}
												className="leading-relaxed text-gray-700"
												style={{
													fontSize:
														"clamp(12px, 3vw, 14px)",
												}}
											>
												• {problem}
											</p>
										)
									)}
								</div>
							</div>
						)}

					{/* Solution section within mutual influence - Responsive */}
					{explanation.solution && (
						<div
							className="mt-2 border-l-4 border-green-400 rounded-r-lg bg-green-50 sm:mt-3"
							style={{
								padding:
									"clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)",
							}}
						>
							<h4
								className="mb-1 font-semibold text-green-600 sm:mb-2"
								style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
							>
								化解之道
							</h4>
							<p
								className="leading-relaxed text-gray-700"
								style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
							>
								{explanation.solution}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CoupleGodExplain;
