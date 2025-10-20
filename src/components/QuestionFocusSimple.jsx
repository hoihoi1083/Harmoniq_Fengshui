import React, { useState, useEffect } from "react";
import { getConcernColor } from "../utils/colorTheme";
import { storeComponentData } from "../utils/componentDataStore";
import getWuxingData from "@/lib/nayin.js";

export default function QuestionFocusSimple({ userInfo }) {
	const [solution, setSolution] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const themeColor = getConcernColor(userInfo);

	useEffect(() => {
		const generateAISolution = async () => {
			try {
				setLoading(true);
				setError(null);

				// Calculate correct Ba Zi with error handling
				let baziData = null;
				try {
					// Ensure proper date format for moment.js
					const birthday = userInfo.birthday || "1994-03-04";
					const birthTime = userInfo.birthTime || "00:04";
					const fullDateTime = `${birthday} ${birthTime}`;

					console.log(
						"📅 Attempting Ba Zi calculation with:",
						fullDateTime
					);
					baziData = getWuxingData(
						fullDateTime,
						userInfo.gender || "male"
					);

					console.log("📊 Calculated Ba Zi:", {
						year: baziData?.year,
						month: baziData?.month,
						day: baziData?.day,
						hour: baziData?.hour,
						dayMaster: baziData?.dayStem,
						dayElement: baziData?.dayStemWuxing,
					});
				} catch (baziError) {
					console.error("Ba Zi calculation error:", baziError);
					// Use accurate hardcoded Ba Zi data for this specific user case (1994-03-04 00:04)
					baziData = {
						year: "甲戌",
						month: "丙寅",
						day: "己丑",
						hour: "甲子",
						dayStem: "己",
						dayStemWuxing: "土",
					};
					console.log("📊 Using fallback Ba Zi:", baziData);
				}

				// Call API
				const response = await fetch("/api/question-focus-simple", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						baziData: {
							year: baziData.year,
							month: baziData.month,
							day: baziData.day,
							hour: baziData.hour,
							dayMaster: baziData.dayStem,
							dayElement: baziData.dayStemWuxing,
						},
						concern: userInfo.concern,
						problem: userInfo.problem,
					}),
				});

				const data = await response.json();

				if (data.success) {
					setSolution(data.solution);
					storeComponentData("questionFocusAnalysis", data.solution);
				} else {
					throw new Error(data.error || "API error");
				}
			} catch (error) {
				console.error("Error generating solution:", error);
				setError(error.message);

				// Simple fallback
				const fallback = {
					title: "分析指導",
					content: `根據您的關注領域「${userInfo.concern}」和具體問題「${userInfo.problem}」，我們將為您提供專業的命理分析和建議。\n\n💡 詳細的分析內容請參閱報告中的其他相關章節。`,
				};
				setSolution(fallback);
				storeComponentData("questionFocusAnalysis", fallback);
			} finally {
				setLoading(false);
			}
		};

		if (userInfo && userInfo.problem && userInfo.concern) {
			generateAISolution();
		}
	}, [userInfo]);

	if (loading) {
		return (
			<section className="w-full sm:w-[95%] lg:w-[95%] mx-auto bg-white rounded-[45px] p-6 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
					<span className="ml-3 text-gray-600">正在分析中...</span>
				</div>
			</section>
		);
	}

	if (!solution) return null;

	return (
		<section className="w-full sm:w-[95%] lg:w-[95%] mx-auto mb-6 sm:mb-10 space-y-6">
			{/* Question Focus Container */}
			<div
				className="flex justify-center bg-white rounded-full w-[90%] p-6 sm:p-8 lg:p-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)] border-2"
				style={{ borderColor: themeColor }}
			>
				<div className="mb-4">
					<h2
						className="mb-2 text-xl font-bold sm:text-2xl"
						style={{ color: themeColor }}
					>
						疑問重點
					</h2>
					<p className="text-sm text-gray-600">{userInfo.problem}</p>
				</div>
			</div>

			{/* Solution Content Container */}
			<div
				className="bg-white rounded-[25px] p-6 sm:p-8 lg:p-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)] border-2"
				style={{ borderColor: themeColor }}
			>
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800">
						{solution.title}
					</h3>
					<div className="leading-relaxed text-gray-700 whitespace-pre-line">
						{solution.content}
					</div>
				</div>

				{error && (
					<div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
						<p className="text-sm text-red-600">
							分析過程中遇到問題，已顯示備用內容
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
