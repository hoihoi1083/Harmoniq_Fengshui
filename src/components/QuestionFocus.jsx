"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getConcernColor } from "../utils/colorTheme";
import {
	getComponentData,
	storeComponentData,
} from "../utils/componentDataStore";

export default function QuestionFocus({ userInfo }) {
	const [solution, setSolution] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if userInfo is provided
	if (!userInfo || !userInfo.problem) {
		return null;
	}

	const themeColor = getConcernColor(userInfo);

	// Debug color application
	console.log("🎨 QuestionFocus Color Debug:", {
		userInfo,
		concern: userInfo?.concern,
		themeColor,
		colorMapping: {
			財運: "#D09900",
			财运: "#D09900",
			感情: "#C74772",
			健康: "#389D7D",
			事業: "#3263C4",
			事业: "#3263C4",
		},
	});

	// Generate AI-powered solution
	useEffect(() => {
		const generateAISolution = async () => {
			// First check if we have existing historical data
			const existingData = getComponentData("questionFocusAnalysis");
			if (existingData) {
				console.log("📚 QuestionFocus using existing historical data");
				setSolution(existingData);
				setLoading(false);
				return;
			}

			try {
				console.log("🆕 QuestionFocus generating fresh analysis");
				setLoading(true);
				setError(null);

				const response = await fetch("/api/question-focus-analysis", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userInfo: userInfo,
					}),
				});

				const data = await response.json();

				if (data.success) {
					setSolution(data.solution);
					// Store the solution data for database saving
					storeComponentData("questionFocusAnalysis", data.solution);
					console.log(
						"📊 Stored QuestionFocus fresh data:",
						"SUCCESS"
					);
				} else {
					throw new Error(data.error || "分析失敗");
				}
			} catch (error) {
				console.error("Failed to generate AI solution:", error);
				setError(error.message);

				// Fallback to basic analysis and guidance
				const fallbackSolutions = {
					健康: {
						title: "健康分析指導",
						content: `根據您的生辰八字，您的體質特點需要特別關注五行平衡。關於您提到的健康問題，從命理角度分析主要與當前流年氣場和個人體質的五行配置相關。建議您可以通過調整作息、注意飲食平衡，以及選擇合適的調養時機來改善。\n\n💡 更詳細的體質分析、具體調養方法和時機選擇，請參閱報告中的其他相關章節，您將獲得更全面的健康管理方案。`,
					},
					財運: {
						title: "財運分析指導",
						content: `從您的八字來看，財運的發展與五行流通和時機把握密切相關。關於您的財務問題，命理上分析主要是當前流年對您的財星運勢產生了一定影響。建議您可以通過穩健理財、把握合適投資時機的方式來改善財務狀況。\n\n💡 更詳細的財運分析、投資時機和具體理財策略，請參閱報告中的其他相關章節，您將獲得更全面的財富管理指引。`,
					},
					感情: {
						title: "感情分析指導",
						content: `根據您的命盤配置，感情運勢與人際磁場和桃花時機有著重要關聯。關於您的感情困擾，從八字角度分析與當前的人際能量和情感週期相關。建議您可以通過提升個人魅力、選擇合適的溝通時機來改善感情狀況。\n\n💡 更詳細的桃花分析、最佳行動時機和具體感情策略，請參閱報告中的其他相關章節，您將獲得更全面的感情經營指引。`,
					},
					事業: {
						title: "事業分析指導",
						content: `從您的八字格局來看，事業發展與官星配置和流年運勢變化密切相關。關於您的職涯問題，命理分析顯示與當前的事業運勢週期和個人能力發揮有關。建議您可以通過提升專業技能、把握合適的行動時機來推進事業發展。\n\n💡 更詳細的事業運分析、最佳發展時機和具體職涯策略，請參閱報告中的其他相關章節，您將獲得更全面的事業規劃指引。`,
					},
				};

				const fallbackSolution = fallbackSolutions[
					userInfo.concern
				] || {
					title: "八字分析指導",
					content: `根據您的生辰資訊，您的命格具有獨特的五行特質。關於您提到的問題，從命理角度分析與您當前的運勢週期和個人氣場相關。建議您可以通過調整心態、把握合適時機來逐步改善現況。\n\n💡 更詳細的命理分析、具體改善方法和行動時機，請參閱報告中的其他相關章節，您將獲得更全面和針對性的解決方案。`,
				};
				setSolution(fallbackSolution);
				// Store fallback data too
				storeComponentData("questionFocusAnalysis", fallbackSolution);
				console.log(
					"📊 Stored QuestionFocus fallback data:",
					"SUCCESS"
				);
			} finally {
				setLoading(false);
			}
		};

		generateAISolution();
	}, [userInfo]);

	// Loading state
	if (loading) {
		return (
			<section className="w-full sm:w-[95%] lg:w-[95%] mx-auto bg-white rounded-[45px] p-6 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
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
							風水妹已經在運算問題分析中，請稍候
						</div>
					</div>
				</div>
			</section>
		);
	}

	// Error state (should not happen due to fallback)
	if (error && !solution) {
		return (
			<section className="w-full sm:w-[95%] lg:w-[95%] mx-auto bg-white rounded-[45px] p-6 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				<div className="py-10 text-center">
					<p className="text-red-600">
						分析服務暫時不可用，請稍後再試
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="w-full max-w-full sm:w-[97%] mx-auto p-3 sm:p-6 lg:p-10 mb-6 sm:mb-10">
			{/* Question Focus Section */}
			<div className="mb-6 sm:mb-8">
				<div
					className="border-4 rounded-[18px] sm:rounded-[30px] bg-white p-4 sm:p-6 mb-4 sm:mb-6"
					style={{ borderColor: themeColor }}
				>
					<h2
						className="mb-3 font-bold text-center sm:mb-4"
						style={{
							fontFamily: "Noto Serif TC, serif",
							color: themeColor,
							fontSize: "clamp(1.5rem, 4vw, 2rem)",
							lineHeight: 1.1,
						}}
					>
						疑問重點
					</h2>
					<div
						className="px-2 leading-relaxed text-center sm:px-4"
						style={{
							fontFamily: "Noto Sans HK, sans-serif",
							color: "#333",
							fontSize: "clamp(1rem, 3vw, 1.25rem)",
						}}
					>
						{userInfo.problem}
					</div>
				</div>
			</div>

			{/* Solution Section */}
			<div
				className="border-4 rounded-[18px] sm:rounded-[30px] bg-white p-4 sm:p-8"
				style={{ borderColor: themeColor }}
			>
				<h3
					className="mb-4 font-bold text-center sm:mb-6"
					style={{
						fontFamily: "Noto Serif TC, serif",
						color: themeColor,
						fontSize: "clamp(1.5rem, 4vw, 2rem)",
						lineHeight: 1.1,
					}}
				>
					{solution.title}
				</h3>
				<div
					className="px-2 leading-relaxed text-center sm:px-4"
					style={{
						fontFamily: "Noto Sans HK, sans-serif",
						color: "#333",
						fontSize: "clamp(1rem, 3vw, 1.125rem)",
						lineHeight: 1.8,
					}}
				>
					{solution.content}
				</div>
			</div>
		</section>
	);
}
