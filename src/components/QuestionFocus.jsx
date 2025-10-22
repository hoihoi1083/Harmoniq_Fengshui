import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getConcernColor } from "../utils/colorTheme";
import { storeComponentData } from "../utils/componentDataStore";
import getWuxingData from "@/lib/nayin.js";

export default function QuestionFocus({ userInfo }) {
	const [solution, setSolution] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const themeColor = getConcernColor(userInfo);

	useEffect(() => {
		console.log("🔍 QuestionFocus useEffect triggered:", {
			userInfo,
			loading,
		});

		const generateAISolution = async () => {
			try {
				console.log("🚀 Starting AI solution generation...");
				setLoading(true);
				setError(null);

				// Check if data already exists in component data store (for historical reports)
				if (
					typeof window !== "undefined" &&
					window.componentDataStore?.questionFocusAnalysis
				) {
					const cachedData =
						window.componentDataStore.questionFocusAnalysis;

					// For historical reports, always use cached data
					const isHistoricalReport =
						window.componentDataStore?._isHistoricalReport ||
						(cachedData &&
							typeof cachedData === "object" &&
							cachedData.title);

					if (isHistoricalReport) {
						console.log(
							"📖 Using existing QuestionFocus data from component store (historical report)"
						);
						setSolution(cachedData);
						setLoading(false);
						return;
					}
				}

				// Calculate correct Ba Zi with error handling
				let baziData = null;
				try {
					// Parse and validate the date - handle both birthDateTime and separate birthday/birthTime
					let birthday, birthTime, fullDateTime;

					if (userInfo.birthDateTime) {
						// If birthDateTime is provided (format: "1999-09-11 14:04")
						fullDateTime = userInfo.birthDateTime;
						const parts = fullDateTime.split(" ");
						birthday = parts[0];
						birthTime = parts[1];
					} else {
						// If separate birthday and birthTime are provided
						birthday = userInfo.birthday;
						birthTime = userInfo.birthTime;

						if (!birthday || !birthTime) {
							throw new Error("Missing birthday or birth time");
						}

						fullDateTime = `${birthday} ${birthTime}`;
					}

					if (!fullDateTime || !birthday || !birthTime) {
						throw new Error("Invalid birth date/time format");
					}

					console.log(
						"📅 Attempting Ba Zi calculation with:",
						fullDateTime
					);
					console.log("📅 User birthday:", birthday);
					console.log("📅 User birth time:", birthTime);
					console.log("📅 User gender:", userInfo.gender);

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

					// Validate that we got a proper result
					if (!baziData || !baziData.year || !baziData.dayStem) {
						throw new Error(
							"Ba Zi calculation returned invalid data"
						);
					}
				} catch (baziError) {
					console.error("Ba Zi calculation error:", baziError);
					// Re-throw the error to be handled by the outer catch block
					throw new Error(
						`Ba Zi calculation failed: ${baziError.message}`
					);
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
				console.log(
					"✅ AI solution generation completed, setting loading to false"
				);
				setLoading(false);
			}
		};

		if (userInfo && userInfo.problem && userInfo.concern) {
			console.log(
				"✅ UserInfo validation passed, calling generateAISolution"
			);
			generateAISolution();
		} else {
			console.log("❌ UserInfo validation failed:", {
				userInfo: !!userInfo,
				problem: !!userInfo?.problem,
				concern: !!userInfo?.concern,
			});
		}
	}, [userInfo]);

	console.log("🔍 QuestionFocus render state:", {
		loading,
		solution: !!solution,
		error,
	});

	if (loading) {
		return (
			<section className="w-full sm:w-[95%] lg:w-[95%] mx-auto mb-6 sm:mb-10 space-y-6 flex flex-col items-center">
				<div className="w-full max-w-full sm:w-[97%] mx-auto bg-white rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] shadow-[0_4px_4px_rgba(0,0,0,0.18)] p-4 sm:p-8 lg:p-12">
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
								風水妹已經在分析您的疑問重點，請稍候
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (!solution) return null;

	return (
		<section className="w-full sm:w-[95%] lg:w-[95%] mx-auto mb-6 sm:mb-10 space-y-6 flex flex-col items-center">
			{/* Question Focus Container */}
			<div
				className="bg-white rounded-full w-[90%] flex justify-center p-6 sm:p-8 lg:p-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)] border-2"
				style={{ borderColor: themeColor }}
			>
				<div className="mb-4 text-center">
					<h2
						className="mb-2 text-xl font-bold sm:text-2xl"
						style={{ color: themeColor }}
					>
						疑問重點
					</h2>
					<p className="text-xl text-gray-600">{userInfo.problem}</p>
				</div>
			</div>

			{/* Solution Content Container */}
			<div
				className="flex flex-col justify-center bg-white rounded-[40px] w-[90%] p-6 sm:p-8 lg:p-15 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)] border-2"
				style={{ borderColor: themeColor }}
			>
				<div className="space-y-4 text-center">
					<h3
						className="text-2xl font-semibold text-gray-800"
						style={{ color: themeColor }}
					>
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
