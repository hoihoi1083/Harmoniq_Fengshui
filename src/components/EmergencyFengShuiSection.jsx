"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const EmergencyFengShuiSection = ({
	femaleUser,
	maleUser,
	analysisData,
	savedData,
	onDataReady,
	isSimplified = false,
}) => {
	const t = useTranslations("coupleReport.emergencyFengShuiSection");
	const [fengShuiData, setFengShuiData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Check for saved data first
		if (savedData) {
			console.log("🏛️ Using saved EmergencyFengShui data:", savedData);
			setFengShuiData(savedData);
			setLoading(false);

			// Notify parent component that saved data is ready
			if (onDataReady) {
				onDataReady(savedData);
			}
			return;
		}

		// Generate new data if no saved data
		if (femaleUser && maleUser && analysisData) {
			generateFengShuiRecommendations();
		}
	}, [femaleUser, maleUser, analysisData, savedData]);

	const generateFengShuiRecommendations = async () => {
		setLoading(true);
		console.log("🔥 Starting Emergency Feng Shui generation...", {
			femaleUser: femaleUser?.name,
			maleUser: maleUser?.name,
			hasAnalysisData: !!analysisData,
		});

		try {
			// Add timeout to prevent AbortError
			const controller = new AbortController();
			const timeoutId = setTimeout(() => {
				controller.abort();
				console.log("⏰ Feng Shui API call timed out after 60 seconds");
			}, 60000);

			const requestBody = {
				femaleUser,
				maleUser,
				femaleBazi: analysisData?.female?.bazi,
				maleBazi: analysisData?.male?.bazi,
				femalePillars: analysisData?.female?.pillars,
				malePillars: analysisData?.male?.pillars,
				requestType: "emergency_feng_shui",
				isSimplified,
			};

			console.log("📤 Sending request body:", requestBody);

			const response = await fetch("/api/emergency-feng-shui", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			console.log("📥 Response status:", response.status, response.ok);

			if (response.ok) {
				const data = await response.json();
				console.log("✅ Received API data:", data);
				setFengShuiData(data);

				// Notify parent component that data is ready
				if (onDataReady) {
					onDataReady(data);
				}
			} else {
				console.log("API response not OK, status:", response.status);
				// Fallback data structure
				setFengShuiData({
					recommendations: [
						{
							title: "臥室東側放置銅製擺件",
							description:
								"在臥室東側放置小型銅製龍鳳擺件或金屬風鈴，能調和金木相剋的能量，增強感情穩定性，每日清晨整理一次。",
							color: "#B08D57",
						},
						{
							title: "客廳點燃粉色蠟燭",
							description:
								"每晚7-9點在客廳點燃粉色或暖黃色蠟燭30分鐘，營造溫馨氛圍，粉色屬火能溫暖感情，促進深度溝通交流。",
							color: "#C4839F",
						},
						{
							title: "床頭擺放紅色靠枕",
							description:
								"在床頭放置紅色或粉色抱枕，激活愛情能量，紅色屬火能溫暖雙方感情，建議選用絲質或棉質材料效果更佳。",
							color: "#7B8B5C",
						},
					],
				});

				// Notify parent component that fallback data is ready
				if (onDataReady) {
					onDataReady({
						recommendations: [
							{
								title: "臥室東側放置銅製擺件",
								description:
									"在臥室東側放置小型銅製龍鳳擺件或金屬風鈴，能調和金木相剋的能量，增強感情穩定性，每日清晨整理一次。",
								color: "#B08D57",
							},
							{
								title: "客廳點燃粉色蠟燭",
								description:
									"每晚7-9點在客廳點燃粉色或暖黃色蠟燭30分鐘，營造溫馨氛圍，粉色屬火能溫暖感情，促進深度溝通交流。",
								color: "#C4839F",
							},
							{
								title: "床頭擺放紅色靠枕",
								description:
									"在床頭放置紅色或粉色抱枕，激活愛情能量，紅色屬火能溫暖雙方感情，建議選用絲質或棉質材料效果更佳。",
								color: "#7B8B5C",
							},
						],
					});
				}
			}
		} catch (error) {
			// Handle AbortError specifically (timeout case)
			if (error.name === "AbortError") {
				console.log(
					"⏰ Emergency Feng Shui API call was aborted due to timeout"
				);
			} else {
				console.error("Emergency Feng Shui generation failed:", error);
			}

			// Provide actual feng shui recommendations as fallback
			setFengShuiData({
				recommendations: [
					{
						title: "臥室擺放金屬擺件",
						description:
							"在臥室東側放置小型銅製飾品或金屬風鈴，能調和五行能量，增強感情穩定性，建議每晚睡前整理一次，保持金屬表面光亮。",
						color: "#B08D57",
					},
					{
						title: "床頭點燃暖色蠟燭",
						description:
							"每晚點燃暖黃色蠟燭約30分鐘，營造溫馨氛圍，暖光能柔化彼此情緒，促進深度溝通，建議使用天然蜂蠟蠟燭效果更佳。",
						color: "#C4839F",
					},
					{
						title: "客廳西南角鋪紅毯",
						description:
							"在客廳西南方向鋪設小塊紅色或暖色地毯，激活坤土能量，增強家庭和諧與包容心，紅色屬火能溫暖感情氣場。",
						color: "#7B8B5C",
					},
				],
			});

			// Notify parent component that fallback data is ready
			if (onDataReady) {
				onDataReady({
					recommendations: [
						{
							title: "臥室擺放金屬擺件",
							description:
								"在臥室東側放置小型銅製飾品或金屬風鈴，能調和五行能量，增強感情穩定性，建議每晚睡前整理一次，保持金屬表面光亮。",
							color: "#B08D57",
						},
						{
							title: "床頭點燃暖色蠟燭",
							description:
								"每晚點燃暖黃色蠟燭約30分鐘，營造溫馨氛圍，暖光能柔化彼此情緒，促進深度溝通，建議使用天然蜂蠟蠟燭效果更佳。",
							color: "#C4839F",
						},
						{
							title: "客廳西南角鋪紅毯",
							description:
								"在客廳西南方向鋪設小塊紅色或暖色地毯，激活坤土能量，增強家庭和諧與包容心，紅色屬火能溫暖感情氣場。",
							color: "#7B8B5C",
						},
					],
				});
			}
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div
				className="w-full bg-white shadow-lg"
				style={{
					padding: "clamp(20px, 5vw, 32px)",
					borderRadius: "clamp(20px, 5vw, 30px)",
				}}
			>
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
							{t("loadingMessage")}
						</div>
						<div
							className="text-gray-500"
							style={{
								fontFamily: "Noto Sans HK, sans-serif",
								fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
								fontWeight: 400,
							}}
						>
							{t("loadingSubMessage")}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!fengShuiData) {
		return null;
	}

	return (
		<div
			className="w-full bg-white shadow-lg"
			style={{
				padding: "clamp(20px, 5vw, 32px)",
				borderRadius: "clamp(20px, 5vw, 30px)",
			}}
		>
			{/* Subtitle */}
			<div style={{ marginBottom: "clamp(24px, 6vw, 32px)" }}>
				<h3
					className="font-bold text-[#C74772]"
					style={{
						fontSize: "clamp(24px, 6vw, 42px)",
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					{t("subtitle")}
				</h3>
			</div>

			{/* Recommendations Grid */}
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
				style={{ gap: "clamp(16px, 4vw, 24px)" }}
			>
				{fengShuiData.recommendations?.map((item, index) => (
					<div
						key={index}
						className="bg-[#EFEFEF]"
						style={{
							padding: "clamp(12px, 3vw, 16px)",
							borderRadius: "clamp(8px, 2vw, 12px)",
							gap: "clamp(10px, 2.5vw, 12px)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						{/* Title Badge */}
						<div className="flex justify-center">
							<div
								className="inline-block font-medium text-white rounded-full"
								style={{
									padding:
										"clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)",
									fontSize: "clamp(13px, 3.2vw, 18px)",
									background:
										"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
									fontFamily: "Noto Sans TC, sans-serif",
								}}
							>
								{item.title}
							</div>
						</div>

						{/* Content Box */}
						<div style={{ padding: "clamp(12px, 3vw, 16px)" }}>
							<p
								className="text-gray-800"
								style={{
									fontSize: "clamp(12px, 3vw, 16px)",
									lineHeight: "1.6",
									fontFamily: "Noto Sans TC, sans-serif",
								}}
							>
								{item.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default EmergencyFengShuiSection;
