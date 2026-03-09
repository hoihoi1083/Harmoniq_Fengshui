"use client";

import Image from "next/image";

/**
 * Life print report cover - A4, same layout as fortune/couple cover.
 * Title: 命理報告 (not 事業報告).
 * Includes BaZi chart section at bottom (from Page1_BasicAnalysis).
 */
const LIFE_COLOR = "#A3B116";

// 天干 → 五行 (for pillar background by element)
const TIANGAN_TO_WUXING = {
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
const WUXING_PILLAR_COLORS = {
	金: "#B2A062",
	木: "#567156",
	水: "#939393",
	火: "#B4003C",
	土: "#D09900",
};
const getPillarBgColor = (heavenly) =>
	WUXING_PILLAR_COLORS[TIANGAN_TO_WUXING[heavenly]] || "#8B9556";

export default function LifePrintCoverPage({
	productName,
	baziData,
	wuxingAnalysis,
	analyzeWuxingStrength,
}) {
	const now = new Date();
	const year = now.getFullYear();

	// Cover section height: reserves space so BaZi chart sits exactly below (gray box ends at 35mm + 150mm = 185mm)
	const COVER_SECTION_HEIGHT = "175mm";

	return (
		<div
			className="bg-white page-break"
			style={{
				width: "210mm",
				minHeight: "297mm",
				position: "relative",
				overflow: "visible",
				backgroundColor: "white",
			}}
		>
			{/* Cover block: fixed height so next section flows directly below */}
			<div
				style={{
					position: "relative",
					width: "100%",
					height: COVER_SECTION_HEIGHT,
					flexShrink: 0,
				}}
			>
				<div
					style={{
						position: "absolute",
						top: "35mm",
						left: "35mm",
						width: "135mm",
						height: "110mm",
						backgroundColor: "#EDEDED",
						zIndex: 0,
					}}
				/>

				<div
					style={{
						position: "absolute",
						top: "20mm",
						left: "25mm",
						zIndex: 2,
					}}
				>
					<div
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "25px",
							fontWeight: 700,
							letterSpacing: "1.8em",
							color: "#000000",
							marginBottom: "0px",
						}}
					>
						個人化訂製專屬
					</div>
					<div
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "130px",
							fontWeight: 900,
							color: LIFE_COLOR,
							lineHeight: "1.1",
							letterSpacing: "0.05em",
							marginBottom: "28px",
						}}
					>
						命理報告
					</div>
				</div>

				<div
					style={{
						position: "absolute",
						bottom: "10mm",
						left: "35mm",
						zIndex: 2,
					}}
				>
					<div style={{ marginBottom: "12px" }}>
						<span
							style={{
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontSize: "25px",
								fontWeight: 700,
								color: "#000000",
								letterSpacing: "0.3em",
								paddingBottom: "4px",
							}}
						>
							產品
						</span>
					</div>
					<div
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "16px",
							fontWeight: 400,
							color: "#000000",
							marginBottom: "12px",
						}}
					>
						{productName || "梨花木鑰匙珠砂掛墜"}
					</div>
					<div
						style={{
							fontFamily: "serif",
							fontSize: "25px",
							fontWeight: 900,
							color: "#000000",
							letterSpacing: "0.05em",
						}}
					>
						風鈴開運吉物
					</div>
				</div>

				<div
					style={{
						position: "absolute",
						top: "35mm",
						right: "5mm",
						bottom: "25mm",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "space-between",
						zIndex: 2,
					}}
				>
					<div
						style={{
							width: "2px",
							flexGrow: 1,
							backgroundColor: "#000000",
							margin: "0px 0px 90px 20px",
						}}
					/>
					<div
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "90px",
							fontWeight: 900,
							color: "#000000",
							transformOrigin: "center",
							letterSpacing: "0.15em",
							transform: "rotate(-90deg)",
						}}
					>
						{year}
					</div>
				</div>
			</div>

			{/* BaZi Chart section — flows directly below the cover block */}
			{wuxingAnalysis &&
				baziData &&
				analyzeWuxingStrength &&
				(() => {
					const yearBranch = baziData.fourPillars.year.earthly;
					const branchToAnimal = {
						子: "mouse",
						丑: "cow",
						寅: "tiger",
						卯: "rabbit",
						辰: "dragon",
						巳: "snake",
						午: "horse",
						未: "sheep",
						申: "monkey",
						酉: "chicken",
						戌: "dog",
						亥: "pig",
					};
					const animalName = branchToAnimal[yearBranch] || "rabbit";

					return (
						<div
							className="p-4 mb-6 border-1 border-gray-400 rounded-2xl"
							style={{ margin: "0 15mm 15mm 15mm" }}
						>
							<div className="flex gap-10">
								{/* Left side: Zodiac Animal */}
								<div className="flex-shrink-0">
									<div
										className="relative w-44 h-44"
										style={{ marginTop: "30px" }}
									>
										<Image
											src={`/images/animals/${animalName}.png`}
											alt="zodiac"
											width={170}
											height={170}
											className="relative z-10 object-contain"
										/>
									</div>
								</div>

								{/* Right side: Four Pillars */}
								<div className="flex-1">
									<div
										className="flex items-center gap-6"
										style={{ position: "relative" }}
									>
										<div
											style={{
												position: "absolute",
												top: "47%",
												left: "0",
												right: "0",
												height: "0",
												borderTop: "2px dashed #cccccc",
												transform: "translateY(25px)",
												zIndex: 0,
											}}
										/>
										<div
											className="flex flex-col"
											style={{
												height: "180px",
												paddingTop: "55px",
											}}
										>
											<div
												style={{
													fontSize: "20px",
													fontFamily:
														"Noto Serif TC, serif",
													fontWeight: 900,
													marginBottom: "50px",
													textShadow:
														"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
												}}
												className="text-gray-700"
											>
												天
											</div>
											<div
												style={{
													fontSize: "20px",
													fontFamily:
														"Noto Serif TC, serif",
													fontWeight: 900,
													textShadow:
														"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
												}}
												className="text-gray-700"
											>
												地
											</div>
										</div>
										<div
											className="flex gap-12"
											style={{
												position: "relative",
												zIndex: 1,
											}}
										>
											{[
												{ key: "year", label: "年" },
												{ key: "month", label: "月" },
												{ key: "day", label: "日" },
												{ key: "hour", label: "時" },
											].map((pillar) => {
												const pillarData =
													baziData.fourPillars?.[
														pillar.key
													];
												if (!pillarData) return null;
												const bgColor =
													getPillarBgColor(
														pillarData.heavenly,
													);
												return (
													<div
														key={pillar.key}
														className="flex flex-col items-center"
													>
														<div
															className="mb-2"
															style={{
																fontSize:
																	"20px",
																fontWeight: 900,
																color: "#000",
																fontFamily:
																	"Noto Serif TC, serif",
																textShadow:
																	"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
															}}
														>
															{pillar.label}
														</div>
														<div
															className="relative"
															style={{
																width: "40px",
																height: "150px",
																backgroundColor:
																	bgColor,
															}}
														>
															<div
																className="flex items-center justify-center font-bold text-white"
																style={{
																	height: "50%",
																	fontSize:
																		"26px",
																	fontWeight: 900,
																	fontFamily:
																		"Noto Serif TC, serif",
																	textShadow:
																		"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
																}}
															>
																{
																	pillarData.heavenly
																}
															</div>
															<div
																className="flex items-center justify-center font-bold text-white"
																style={{
																	height: "50%",
																	fontSize:
																		"26px",
																	fontWeight: 900,
																	fontFamily:
																		"Noto Serif TC, serif",
																	textShadow:
																		"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
																}}
															>
																{
																	pillarData.earthly
																}
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</div>

							{/* Five Elements + Info boxes */}
							{(() => {
								const strengthAnalysis = analyzeWuxingStrength(
									wuxingAnalysis.elementCounts,
								);
								const colors = {
									金: "#B2A062",
									木: "#567156",
									水: "#939393",
									火: "#B4003C",
									土: "#D09900",
								};
								return (
									<div className="flex gap-8 mt-0">
										<div className="w-1/2">
											<div
												style={{ position: "relative" }}
											>
												<div
													className="flex items-end justify-center mb-0 gap-9"
													style={{ height: "150px" }}
												>
													{Object.entries(
														wuxingAnalysis.elementCounts,
													).map(
														([element, count]) => {
															const height =
																count * 30 + 30;
															return (
																<div
																	key={
																		element
																	}
																	className="flex flex-col items-center"
																>
																	<div
																		style={{
																			backgroundColor:
																				colors[
																					element
																				],
																			height: `${height}px`,
																			width: "15px",
																		}}
																	/>
																</div>
															);
														},
													)}
												</div>
												<div
													style={{
														width: "100%",
														height: "2px",
														backgroundColor:
															"#000000",
														marginBottom: "12px",
													}}
												/>
												<div className="flex justify-center gap-6">
													{Object.entries(
														wuxingAnalysis.elementCounts,
													).map(
														([element, count]) => (
															<div
																key={element}
																className="flex items-center gap-1"
															>
																<Image
																	src={`/images/elements/${element}.png`}
																	alt={
																		element
																	}
																	width={20}
																	height={20}
																	style={{
																		objectFit:
																			"contain",
																	}}
																	className="inline-block"
																/>
																<span
																	style={{
																		fontSize:
																			"14px",
																		fontWeight:
																			"bold",
																	}}
																>
																	{count}
																</span>
															</div>
														),
													)}
												</div>
											</div>
										</div>
										<div className="flex flex-col justify-center w-1/2 space-y-3">
											<div
												className="text-center text-white bg-black"
												style={{
													fontSize: "16px",
													fontFamily:
														"Noto Serif TC, serif",
													fontWeight: 900,
													padding: "16px 20px",
													textShadow:
														"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
												}}
											>
												五行 -{" "}
												{strengthAnalysis.strengthDesc}
											</div>
											<div
												className="text-center text-white bg-black"
												style={{
													fontSize: "16px",
													fontFamily:
														"Noto Serif TC, serif",
													fontWeight: 900,
													padding: "16px 20px",
													textShadow:
														"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
												}}
											>
												{wuxingAnalysis.missingElements
													.length > 0
													? `${wuxingAnalysis.missingElements.join("、")}需要後天補充以達到平衡`
													: "五行齊全 - 沒有嚴重缺失某一元素"}
											</div>
										</div>
									</div>
								);
							})()}
						</div>
					);
				})()}
		</div>
	);
}
