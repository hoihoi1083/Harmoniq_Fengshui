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
		<div className="mx-auto mt-20" style={{ padding: "20px" }}>
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
						height: "120px",
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
										<div className="relative w-44 h-44">
											{/* Pink circle background */}
											<div className="absolute inset-0 bg-pink-100 rounded-full opacity-60"></div>
											{/* Animal image */}
											<Image
												src={`/images/animals/${animalName}.png`}
												alt="zodiac"
												width={176}
												height={176}
												className="relative z-10 object-contain"
											/>
										</div>
									</div>

									{/* Right side: Four Pillars */}
									<div className="flex-1">
										<div className="flex items-center gap-6">
											{/* Labels column */}
											<div className="flex flex-col gap-10 text-center">
												<div
													style={{ fontSize: "14px" }}
													className="text-gray-500"
												>
													天
												</div>
												<div className="h-4 mx-auto border-l-2 border-gray-300 border-dashed"></div>
												<div
													style={{ fontSize: "14px" }}
													className="text-gray-500"
												>
													地
												</div>
											</div>

											{/* Pillars */}
											<div className="flex gap-4">
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
															className="flex flex-col items-center gap-1"
														>
															<div
																className="mb-1"
																style={{
																	fontSize:
																		"14px",
																}}
															>
																{pillar.label}
															</div>
															<div
																className="flex items-center justify-center w-16 font-bold text-white h-18"
																style={{
																	backgroundColor:
																		pillar.bgColor,
																	fontSize:
																		"24px",
																}}
															>
																{
																	pillarData.heavenly
																}
															</div>
															<div
																className="flex items-center justify-center w-16 font-bold text-white h-18"
																style={{
																	backgroundColor:
																		pillar.bgColor,
																	fontSize:
																		"24px",
																}}
															>
																{
																	pillarData.earthly
																}
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
											<div className="flex gap-8 mt-6">
												{/* Left: Five Elements Chart (smaller) */}
												<div className="w-1/2">
													<div className="flex items-end justify-center h-24 gap-3 mb-2">
														{Object.entries(
															wuxingAnalysis.elementCounts,
														).map(
															([
																element,
																count,
															]) => {
																const height =
																	count * 20 +
																	20;
																return (
																	<div
																		key={
																			element
																		}
																		className="flex flex-col items-center"
																	>
																		<div
																			className="w-10"
																			style={{
																				backgroundColor:
																					colors[
																						element
																					],
																				height: `${height}px`,
																			}}
																		></div>
																		<div
																			className="flex items-center justify-center gap-1 mt-1 text-xs font-bold"
																			style={{
																				height: "20px",
																			}}
																		>
																			<Image
																				src={`/images/elements/${element}.png`}
																				alt={
																					element
																				}
																				width={
																					16
																				}
																				height={
																					16
																				}
																				className="inline-block"
																			/>
																			<span>
																				{
																					element
																				}
																				{
																					count
																				}
																			</span>
																		</div>
																	</div>
																);
															},
														)}
													</div>
												</div>

												{/* Right: Info boxes */}
												<div className="flex flex-col justify-center w-1/2 space-y-2">
													<div
														className="px-4 py-3 font-bold text-center text-white bg-black"
														style={{
															fontSize: "15px",
														}}
													>
														五行 -{" "}
														{
															strengthAnalysis.strengthDesc
														}
													</div>
													<div
														className="px-4 py-2 text-center text-white bg-black"
														style={{
															fontSize: "13px",
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
				<div
					className="px-4 py-3 mt-5 text-gray-700"
					style={{ fontSize: "13px", lineHeight: "1.7" }}
				>
					根據您的五行配置分析，建議從「天」為吉運用場，「金」為對助用場。應優先運用其雷局或成長性行動或有效圖的行動，達到提升整體運勢的效果。在日常生活中，可運過相應調節方位、色系、職業選擇方式來達到追求的影響力。
				</div>

				{/* Key Points Section */}
				{aiContent && (
					<div
						className="mt-5 border-2 border-gray-300 rounded-lg"
						style={{ padding: "16px" }}
					>
						<div className="flex gap-6">
							{/* Left: Vertical Title */}
							<div className="flex-shrink-0">
								<h2
									className="font-black"
									style={{
										fontSize: "42px",
										lineHeight: "1.2",
										letterSpacing: "0.05em",
										writingMode: "vertical-rl",
										textOrientation: "upright",
									}}
								>
									疑重問點
								</h2>
							</div>

							{/* Right: Content */}
							<div
								className="flex-1 pt-2"
								style={{
									borderLeft: "2px solid #d1d5db",
									paddingLeft: "16px",
								}}
							>
								<h3
									className="mb-2 font-bold"
									style={{
										fontSize: "16px",
										color: getConcernColor(concern),
									}}
								>
									一般財運分析
								</h3>
								<h4
									className="mb-3 font-semibold"
									style={{
										fontSize: "14px",
										color: "#B8A870",
									}}
								>
									財運分析指導
								</h4>
								<div
									className="text-gray-700"
									style={{
										fontSize: "13px",
										lineHeight: "1.7",
									}}
								>
									{aiContent.substring(0, 350)}...
									<div
										className="mt-3 text-gray-500"
										style={{ fontSize: "11px" }}
									></div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
