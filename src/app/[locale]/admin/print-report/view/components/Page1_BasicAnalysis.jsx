import Image from "next/image";
import { getConcernColor } from "@/utils/colorTheme";

export default function Page1_BasicAnalysis({
	name,
	birthday,
	birthTime,
	concern,
	baziData,
	wuxingAnalysis,
	aiContent,
	analyzeWuxingStrength,
}) {
	return (
		<div className="mx-auto mt-15" style={{ padding: "15px" }}>
			{/* Page 1 - A4 sized with visible boundaries */}
			<div
				className="mx-auto bg-white page-break"
				style={{
					width: "210mm",
					minHeight: "297mm",
					maxHeight: "297mm",
					padding: "15mm 20mm",
					boxSizing: "border-box",
					overflow: "hidden",
					position: "relative",
				}}
			>
				{/* Header Section with Figma Layout */}
				<div
					style={{
						position: "relative",
						height: "80px",
						marginBottom: "0px",
					}}
				>
					{/* 基礎分析 Title */}
					<div
						style={{
							position: "absolute",
							left: "0",
							top: "0",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontStyle: "normal",
							fontWeight: 900,
							fontSize: "34px",
							lineHeight: "110%",
							display: "flex",
							alignItems: "center",
							letterSpacing: "0.27em",
							color: getConcernColor(concern),
						}}
					>
						基礎分析
					</div>

					{/* Vertical Line */}
					<div
						style={{
							position: "absolute",
							width: "70px",
							height: "0px",
							left: "140px",
							top: "30px",
							border: "1px solid #000000",
							transform: "rotate(90deg)",
						}}
					></div>

					{/* Name and Birthday */}
					<div
						style={{
							position: "absolute",
							width: "367px",
							height: "48px",
							left: "185px",
							top: "25px",
							fontFamily: "Noto Serif TC, serif",
							fontStyle: "normal",
							fontWeight: 900,
							fontSize: "15px",
							lineHeight: "14px",
							color: "#424242",
							display: "flex",
							flexDirection: "column",
							gap: "8px",
						}}
					>
						<div>姓名：{name || "未提供"}</div>
						<div>
							生辰：
							{new Date(birthday)
								.toLocaleDateString("zh-TW")
								.replace(/\//g, "/")}{" "}
							{birthTime.split("(")[0]}
						</div>
					</div>

					{/* Report Generation Date - Top Right */}
					<div
						style={{
							position: "absolute",
							right: "0",
							top: "0",
							fontFamily: "Noto Serif TC, serif",
							fontStyle: "extrabold",
							fontWeight: 400,
							fontSize: "20px",
							lineHeight: "14px",
							color: "#424242",
							textAlign: "right",
						}}
					>
						{new Date()
							.toLocaleDateString("zh-TW")
							.replace(/\//g, "/")}
					</div>
				</div>

				{/* BaZi Chart - Matching 1.png exactly */}
				{wuxingAnalysis &&
					baziData &&
					(() => {
						// Get zodiac animal based on year branch
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
						const animalName =
							branchToAnimal[yearBranch] || "rabbit";

						return (
							<div className="p-6 mb-6 border-2 border-gray-400 rounded-2xl">
								<div className="flex gap-10">
									{/* Left side: Zodiac Animal with calligraphy style */}
									<div className="flex-shrink-0">
										<div
											className="relative w-44 h-44"
											style={{ marginTop: "30px" }}
										>
											{/* Animal image */}
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
											{/* Horizontal grey dotted line behind pillars */}
											<div
												style={{
													position: "absolute",
													top: "47%",
													left: "0",
													right: "0",
													height: "0",
													borderTop:
														"2px dashed #cccccc",
													transform:
														"translateY(25px)",
													zIndex: 0,
												}}
											></div>

											{/* Labels column */}
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

											{/* Pillars */}
											<div
												className="flex gap-12"
												style={{
													position: "relative",
													zIndex: 1,
												}}
											>
												{[
													{
														key: "year",
														label: "年",
														bgColor: "#B8A870",
													},
													{
														key: "month",
														label: "月",
														bgColor: "#B8A870",
													},
													{
														key: "day",
														label: "日",
														bgColor: "#8B9556",
													},
													{
														key: "hour",
														label: "時",
														bgColor: "#B4003C",
													},
												].map((pillar) => {
													const pillarData =
														baziData.fourPillars?.[
															pillar.key
														];
													if (!pillarData)
														return null;
													return (
														<div
															key={pillar.key}
															className="flex flex-col items-center"
														>
															{/* Label */}
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
															{/* Single pillar box with dotted line */}
															<div
																className="relative"
																style={{
																	width: "40px",
																	height: "150px",
																	backgroundColor:
																		pillar.bgColor,
																}}
															>
																{/* Top section - Heavenly */}
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

																{/* Bottom section - Earthly */}
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

								{/* Bottom section: Five Elements + Info boxes */}
								{wuxingAnalysis &&
									(() => {
										const strengthAnalysis =
											analyzeWuxingStrength(
												wuxingAnalysis.elementCounts,
											);
										const colors = {
											金: "#B2A062",
											木: "#567156",
											水: "#939393",
											火: "#B4003C",
											土: "#DEAB20",
										};

										return (
											<div className="flex gap-8 mt-0">
												{/* Left: Five Elements Chart (smaller) */}
												<div className="w-1/2">
													<div
														style={{
															position:
																"relative",
														}}
													>
														{/* Bars container */}
														<div
															className="flex items-end justify-center mb-0 gap-9"
															style={{
																height: "150px",
															}}
														>
															{Object.entries(
																wuxingAnalysis.elementCounts,
															).map(
																([
																	element,
																	count,
																]) => {
																	const height =
																		count *
																			30 +
																		30;
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
																			></div>
																		</div>
																	);
																},
															)}
														</div>
														{/* Black horizontal line */}
														<div
															style={{
																width: "100%",
																height: "2px",
																backgroundColor:
																	"#000000",
																marginBottom:
																	"12px",
															}}
														></div>
														{/* Icons with numbers */}
														<div className="flex justify-center gap-6">
															{Object.entries(
																wuxingAnalysis.elementCounts,
															).map(
																([
																	element,
																	count,
																]) => {
																	return (
																		<div
																			key={
																				element
																			}
																			className="flex items-center gap-1"
																		>
																			<Image
																				src={`/images/elements/${element}.png`}
																				alt={
																					element
																				}
																				width={
																					20
																				}
																				height={
																					20
																				}
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
																				{
																					count
																				}
																			</span>
																		</div>
																	);
																},
															)}
														</div>
													</div>
												</div>

												{/* Right: Info boxes */}
												<div className="flex flex-col justify-center w-1/2 space-y-3">
													<div
														className="text-center text-white bg-black"
														style={{
															fontSize: "16px",
															fontFamily:
																"Noto Serif TC, serif",
															fontWeight: 900,
															padding:
																"16px 20px",
															textShadow:
																"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
														}}
													>
														五行 -{" "}
														{
															strengthAnalysis.strengthDesc
														}
													</div>
													<div
														className="text-center text-white bg-black"
														style={{
															fontSize: "16px",
															fontFamily:
																"Noto Serif TC, serif",
															fontWeight: 900,
															padding:
																"16px 20px",
															textShadow:
																"0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
														}}
													>
														{wuxingAnalysis
															.missingElements
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

				{/* Explanatory Text */}
				{wuxingAnalysis &&
					(() => {
						const strengthAnalysis = analyzeWuxingStrength(
							wuxingAnalysis.elementCounts,
						);
						const primaryGod =
							wuxingAnalysis.missingElements[0] ||
							strengthAnalysis.weakElements[0] ||
							"水";
						const secondaryGod =
							wuxingAnalysis.missingElements[1] ||
							strengthAnalysis.weakElements[1] ||
							"金";

						return (
							<div
								style={{
									position: "relative",
									marginTop: "20px",
									padding: "0 20px",
								}}
							>
								<div
									style={{
										position: "absolute",
										left: "30px",
										top: "-10px",
										fontSize: "60px",
										fontFamily: "Georgia, serif",
										color: "#999999",
										lineHeight: "1",
									}}
								>
									"
								</div>
								<div
									className="text-gray-700"
									style={{
										fontSize: "15px",
										lineHeight: "20px",
										fontFamily: "Noto Serif TC, serif",
										fontWeight: 600,
										textAlign: "justify",
										color: "#424242",
										paddingLeft: "40px",
									}}
								>
									根據你的五行配置分析，建議以「{primaryGod}
									」為首選用神，「{secondaryGod}
									」為輔助用神。透過補足所缺的策略，兩者協同作用可有效調節五行能量，達到陰陽平衡，提升整體運勢發展。在日常生活中，可通過相應的顏色、方位、職業選擇等方式來強化這些有利元素的影響力
								</div>
							</div>
						);
					})()}

				{/* Key Points Section */}
				{aiContent && (
					<div className="mt-0 " style={{ padding: "16px" }}>
						<div className="flex gap-6">
							{/* Left: Vertical Title */}
							<div className="flex-shrink-0">
								<div style={{ display: "flex", gap: "8px" }}>
									<h2
										style={{
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											fontStyle: "normal",
											fontWeight: 900,
											fontSize: "48px",
											lineHeight: "110%",
											letterSpacing: "0.27em",
											color: getConcernColor(concern),
											writingMode: "vertical-rl",
											textOrientation: "upright",
										}}
									>
										疑問
									</h2>
									<h2
										style={{
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											fontStyle: "normal",
											fontWeight: 900,
											fontSize: "48px",
											lineHeight: "110%",
											letterSpacing: "0.27em",
											color: getConcernColor(concern),
											writingMode: "vertical-rl",
											textOrientation: "upright",
										}}
									>
										重點
									</h2>
								</div>
							</div>
							<div
								className="flex-1 pt-0"
								style={{
									borderLeft: "2px solid #d1d5db",
									paddingLeft: "16px",
								}}
							>
								<h3
									className="mb-10 font-bold"
									style={{
										fontSize: "25px",
										color: getConcernColor(concern),
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									}}
								>
									一般{concern}分析
								</h3>
								<h4
									className="mb-3 font-semibold"
									style={{
										fontSize: "25px",
										color: getConcernColor(concern),
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									}}
								>
									{concern}分析指導
								</h4>
								<div
									className="text-gray-700"
									style={{
										fontSize: "15px",
										lineHeight: "1.3",
									}}
								>
									{aiContent
										.replace(/\*\*/g, "")
										.substring(0, 350)}
									...
									<div
										className="mt-3 text-gray-500"
										style={{ fontSize: "11px" }}
									></div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Footer with bottom.png image */}
				<div
					style={{
						position: "absolute",
						bottom: "15mm",
						left: "20mm",
						width: "auto",
						height: "auto",
					}}
				>
					<Image
						src="/images/report/bottom.png"
						alt="Footer decoration"
						width={30}
						height={10}
						style={{
							objectFit: "contain",
						}}
					/>
				</div>
			</div>
		</div>
	);
}
