"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

const TargetedSuggestionsSection = ({ femaleUser, maleUser, analysisData }) => {
	const [targetedSuggestionsData, setTargetedSuggestionsData] =
		useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;

		if (femaleUser && maleUser && analysisData && isMounted) {
			generateTargetedSuggestions();
		}

		return () => {
			isMounted = false;
		};
	}, [femaleUser, maleUser, analysisData]);

	const generateTargetedSuggestions = async () => {
		setLoading(true);
		console.log("🎯 Starting Targeted Suggestions generation...", {
			femaleUser: femaleUser?.name,
			maleUser: maleUser?.name,
			hasAnalysisData: !!analysisData,
		});

		try {
			const requestBody = {
				femaleUser,
				maleUser,
				femaleBazi: analysisData?.female?.bazi,
				maleBazi: analysisData?.male?.bazi,
				femalePillars: analysisData?.female?.pillars,
				malePillars: analysisData?.male?.pillars,
				requestType: "targeted_suggestions",
			};

			console.log(
				"📤 Sending targeted suggestions request body:",
				requestBody
			);

			const response = await fetch("/api/targeted-suggestions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody),
			});

			console.log(
				"📥 Targeted suggestions response status:",
				response.status,
				response.ok
			);

			if (response.ok) {
				const data = await response.json();
				console.log("✅ Received targeted suggestions API data:", data);
				setTargetedSuggestionsData(data);
			} else {
				console.log(
					"Targeted suggestions API response not OK, status:",
					response.status
				);
				// Fallback data structure
				setTargetedSuggestionsData(getFallbackData());
			}
		} catch (error) {
			console.error("Targeted Suggestions generation failed:", error);
			setTargetedSuggestionsData(getFallbackData());
		} finally {
			setLoading(false);
		}
	};

	const getFallbackData = () => ({
		elementBalance: {
			title: "增強特定元素平衡（如土元素穩定官星）",
			description: "提供實用方法（如佩戴黃玉手鏈，或在臥室放陶瓷暖光燈）",
			methods: [
				{
					icon: "💎",
					title: "佩戴黃玉手鏈",
					description:
						"選擇天然黃玉材質，增強土元素能量，穩定官星配置，建議戴在左手以接收正面能量。",
				},
				{
					icon: "🏮",
					title: "臥室陶瓷暖光燈",
					description:
						"在臥室西南方（土位）放置陶瓷材質的暖光燈具，每晚點亮30分鐘以上，強化土氣穩定性。",
				},
			],
		},
		communicationTransformation: {
			title: "轉化溝通模式",
			description:
				"當能量過旺時，用互補方式疏導（如共同烹飪溫性食物，中和寒涼）",
			methods: [
				{
					icon: "🍲",
					title: "共同烹飪溫性食物",
					description:
						"定期一起準備薑汁紅糖茶、桂圓紅棗湯等溫性食材，在烹飪過程中增進溝通，以食物的溫和屬性中和情緒的寒涼。",
				},
				{
					icon: "🌱",
					title: "協調五行活動",
					description:
						"根據雙方八字特點選擇平衡活動，如土旺者適合園藝，水旺者適合書法，互相參與對方擅長的領域。",
				},
			],
		},
		anchorRitual: {
			title: "心錨儀式",
			description:
				"推薦每日行動，如雙手按小腹默念肯定語（如'土厚載物，水火既濟'），強化包容力",
			methods: [
				{
					icon: "🙏",
					title: "晨間冥想儀式",
					description:
						"每日清晨雙手輕按小腹（丹田位置），緩慢深呼吸，默念'土厚載物，水火既濟'三遍，建立內在穩定感。",
				},
				{
					icon: "💫",
					title: "睡前肯定語",
					description:
						"就寢前進行相同動作，改念'包容如海，穩如泰山'，強化對伴侶的理解與接納能力。",
				},
			],
		},
		energyValidationCase: {
			title: "能量印證案例",
			description:
				"分享類似配置案例（如女火土旺/男金水旺夫妻），經過調整後轉化為正面成果",
			caseStudy: {
				configuration: "女火土旺 / 男金水旺",
				initialChallenge:
					"初期因五行差異導致溝通模式不同，女方直接熱情，男方內斂理性，容易產生誤解。",
				adjustmentProcess:
					"透過居家佈置調整（客廳增加金屬風鈴、臥室放置綠色植物）以及行為調和（女方學習傾聽技巧、男方表達情感需求），逐步建立互補節奏。",
				positiveOutcome:
					"六個月後，男方的理性思維幫助女方事業決策更加穩健，事業營收提升40%；女方的熱情活力激發男方創意靈感，共同開發的項目獲得市場認可。",
				keyInsight: "將五行差異轉化為創造力，而非對立力量。",
			},
		},
	});

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
							小鈴正在生成針對性建議
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

	if (!targetedSuggestionsData) {
		return null;
	}

	return (
		<div
			className="w-full bg-[#F5F5F5] shadow-lg"
			style={{
				padding: "clamp(20px, 5vw, 32px)",
				borderRadius: "clamp(20px, 5vw, 30px)",
			}}
		>
			{/* Header */}
			<div style={{ marginBottom: "clamp(24px, 6vw, 32px)" }}>
				<div
					className="flex items-center"
					style={{ marginBottom: "clamp(12px, 3vw, 16px)" }}
				>
					<h3
						className="font-bold text-[#C74772]"
						style={{
							fontSize: "clamp(24px, 6vw, 42px)",
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						破除"克"的焦慮
					</h3>
				</div>
			</div>

			{/* Three Action Categories */}
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
				style={{
					gap: "clamp(16px, 4vw, 24px)",
					marginBottom: "clamp(24px, 6vw, 32px)",
				}}
			>
				{/* Element Balance */}
				<div
					className="bg-[#A5385C] text-white"
					style={{
						padding: "clamp(16px, 4vw, 24px)",
						borderRadius: "clamp(16px, 4vw, 20px)",
					}}
				>
					<h4
						className="font-bold"
						style={{
							fontSize: "clamp(14px, 3.5vw, 18px)",
							marginBottom: "clamp(10px, 2.5vw, 12px)",
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						{targetedSuggestionsData?.elementBalance?.title ||
							"增強特定元素平衡"}
					</h4>
					<p
						className="opacity-90"
						style={{
							fontSize: "clamp(12px, 3vw, 14px)",
							marginBottom: "clamp(12px, 3vw, 16px)",
						}}
					>
						{targetedSuggestionsData?.elementBalance?.description ||
							"提供實用方法增強元素平衡"}
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "clamp(10px, 2.5vw, 12px)",
						}}
					>
						{targetedSuggestionsData?.elementBalance?.methods?.map(
							(method, index) => (
								<div
									key={index}
									className="text-black bg-white bg-opacity-20"
									style={{
										padding: "clamp(10px, 2.5vw, 12px)",
										borderRadius: "clamp(6px, 1.5vw, 8px)",
									}}
								>
									<div className="flex items-start">
										<span
											style={{
												fontSize:
													"clamp(16px, 4vw, 18px)",
												marginRight:
													"clamp(6px, 1.5vw, 8px)",
											}}
										>
											{method?.icon || "💎"}
										</span>
										<div>
											<h5
												className="font-medium"
												style={{
													fontSize:
														"clamp(12px, 3vw, 14px)",
													marginBottom:
														"clamp(4px, 1vw, 6px)",
												}}
											>
												{method?.title || "建議方法"}
											</h5>
											<p
												className="opacity-90"
												style={{
													fontSize:
														"clamp(10px, 2.5vw, 12px)",
													lineHeight: "1.5",
												}}
											>
												{method?.description ||
													"具體實施建議"}
											</p>
										</div>
									</div>
								</div>
							)
						) || []}
					</div>
				</div>

				{/* Communication Transformation */}
				<div
					className="bg-[#A5385C] text-white"
					style={{
						padding: "clamp(16px, 4vw, 24px)",
						borderRadius: "clamp(16px, 4vw, 20px)",
					}}
				>
					<h4
						className="font-bold"
						style={{
							fontSize: "clamp(14px, 3.5vw, 18px)",
							marginBottom: "clamp(10px, 2.5vw, 12px)",
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						{targetedSuggestionsData?.communicationTransformation
							?.title || "轉化溝通模式"}
					</h4>
					<p
						className="opacity-90"
						style={{
							fontSize: "clamp(12px, 3vw, 14px)",
							marginBottom: "clamp(12px, 3vw, 16px)",
						}}
					>
						{targetedSuggestionsData?.communicationTransformation
							?.description || "當能量過旺時，用互補方式疏導"}
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "clamp(10px, 2.5vw, 12px)",
						}}
					>
						{targetedSuggestionsData?.communicationTransformation?.methods?.map(
							(method, index) => (
								<div
									key={index}
									className="text-black bg-white bg-opacity-20"
									style={{
										padding: "clamp(10px, 2.5vw, 12px)",
										borderRadius: "clamp(6px, 1.5vw, 8px)",
									}}
								>
									<div className="flex items-start">
										<span
											style={{
												fontSize:
													"clamp(16px, 4vw, 18px)",
												marginRight:
													"clamp(6px, 1.5vw, 8px)",
											}}
										>
											{method?.icon || "🍲"}
										</span>
										<div>
											<h5
												className="font-medium"
												style={{
													fontSize:
														"clamp(12px, 3vw, 14px)",
													marginBottom:
														"clamp(4px, 1vw, 6px)",
												}}
											>
												{method?.title || "溝通方法"}
											</h5>
											<p
												className="opacity-90"
												style={{
													fontSize:
														"clamp(10px, 2.5vw, 12px)",
													lineHeight: "1.5",
												}}
											>
												{method?.description ||
													"具體溝通建議"}
											</p>
										</div>
									</div>
								</div>
							)
						) || []}
					</div>
				</div>

				{/* Anchor Ritual */}
				<div
					className="bg-[#A5385C] text-white"
					style={{
						padding: "clamp(16px, 4vw, 24px)",
						borderRadius: "clamp(16px, 4vw, 20px)",
					}}
				>
					<h4
						className="font-bold"
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontSize: "clamp(16px, 4vw, 18px)",
							marginBottom: "clamp(8px, 2vw, 12px)",
						}}
					>
						{targetedSuggestionsData?.anchorRitual?.title ||
							"心錨儀式"}
					</h4>
					<p
						className="opacity-90"
						style={{
							fontSize: "clamp(12px, 3vw, 14px)",
							marginBottom: "clamp(12px, 3vw, 16px)",
						}}
					>
						{targetedSuggestionsData?.anchorRitual?.description ||
							"每日雙手按小腹默念肯定語，強化包容力"}
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "clamp(8px, 2vw, 12px)",
						}}
					>
						{targetedSuggestionsData?.anchorRitual?.methods?.map(
							(method, index) => (
								<div
									key={index}
									className="text-black bg-white bg-opacity-20"
									style={{
										padding: "clamp(10px, 2.5vw, 12px)",
										borderRadius: "clamp(6px, 1.5vw, 8px)",
									}}
								>
									<div className="flex items-start">
										<span
											style={{
												fontSize:
													"clamp(16px, 4vw, 18px)",
												marginRight:
													"clamp(6px, 1.5vw, 8px)",
											}}
										>
											{method?.icon || "🙏"}
										</span>
										<div>
											<h5
												className="font-medium"
												style={{
													fontSize:
														"clamp(12px, 3vw, 14px)",
													marginBottom:
														"clamp(4px, 1vw, 6px)",
												}}
											>
												{method?.title || "心錨方法"}
											</h5>
											<p
												className="opacity-90"
												style={{
													fontSize:
														"clamp(10px, 2.5vw, 12px)",
													lineHeight: "1.5",
												}}
											>
												{method?.description ||
													"具體儀式建議"}
											</p>
										</div>
									</div>
								</div>
							)
						) || []}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TargetedSuggestionsSection;
