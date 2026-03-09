"use client";

import Image from "next/image";

/**
 * Couple print report cover page - A4, same layout as fortune CoverPage
 * Title: 姻緣合盤報告
 * Bottom: compatibility circle + element boxes + interaction bar + yearly recommendation (same as attached design)
 */
const COUPLE_COLOR = "#D94075";
const SCORE_COLOR = "#b45309";
const CIRCLE_GRADIENT_START = "#D289A1";
const CIRCLE_GRADIENT_END = "#ABBDC7";
const BAR_GRADIENT_START = "#CC91A7";
const BAR_GRADIENT_END = "#95A7B9";
const ELEMENT_COLOR = {
	金: "#B2A062",
	木: "#567156",
	水: "#3b82f6",
	火: "#B4003C",
	土: "#D09900",
};

export default function CouplePrintCoverPage({
	productName,
	compatibility,
	user1Analysis,
	user2Analysis,
	elementInteraction,
	wuxing1,
	wuxing2,
	gender1,
	gender2,
	annualStrategy,
}) {
	const now = new Date();
	const year = now.getFullYear();

	// Female = left pink box, Male = right blue box. 壬水/丁火 = dayStem + dayStemWuxing
	const femaleWuxing = gender1 === "female" ? wuxing1 : wuxing2;
	const maleWuxing = gender1 === "male" ? wuxing1 : wuxing2;
	const femaleElementDisplay =
		femaleWuxing?.dayStem && femaleWuxing?.dayStemWuxing
			? femaleWuxing.dayStem + femaleWuxing.dayStemWuxing
			: (user1Analysis?.dominantElement ||
					user2Analysis?.dominantElement ||
					"水") + "命";
	const maleElementDisplay =
		maleWuxing?.dayStem && maleWuxing?.dayStemWuxing
			? maleWuxing.dayStem + maleWuxing.dayStemWuxing
			: (user2Analysis?.dominantElement ||
					user1Analysis?.dominantElement ||
					"火") + "命";
	const femaleEl =
		femaleWuxing?.dayStemWuxing ||
		user1Analysis?.dominantElement ||
		user2Analysis?.dominantElement ||
		"水";
	const maleEl =
		maleWuxing?.dayStemWuxing ||
		user2Analysis?.dominantElement ||
		user1Analysis?.dominantElement ||
		"火";

	const compat = compatibility || { score: 78, level: "良緣" };
	const balance = elementInteraction?.balance || "五行相生，關係和諧平衡";
	// Use current year (e.g. 2026), not next year, for the recommendation
	const currentYearStrategy =
		annualStrategy && annualStrategy[year]
			? annualStrategy[year]
			: null;
	const yearLabel = `${year}年`;
	const rawDescription =
		currentYearStrategy?.description || currentYearStrategy?.monthlyFocus || "";
	// Prefer showing the full "整體趨勢" paragraph; API structure is:
	// [ "1. YYYY年感情運勢分析" ] 整體趨勢：...。 [ - YYYY年N月（農曆...）：... ] [ 重點月份 / 具體建議 ... ]
	const trendLabel = "整體趨勢：";
	const trendStart = rawDescription.indexOf(trendLabel);
	const trendOnly =
		trendStart >= 0
			? (() => {
					const afterLabel = rawDescription.slice(trendStart + trendLabel.length);
					// End at next section: " - 2026年N月" style, or "重點月份", "具體建議", etc.
					// Match " - 2026年8月" style bullets, not "2026丙午年" in the first sentence
					const bulletMatch = /\s-\s*\d{4}年\d?月/.exec(afterLabel);
					const candidates = [
						bulletMatch?.index,
						afterLabel.indexOf("重點月份"),
						afterLabel.indexOf("具體建議"),
						afterLabel.indexOf("具體的"),
						afterLabel.indexOf("需要注意"),
					].filter((i) => typeof i === "number" && i >= 0);
					const end =
						candidates.length > 0 ? Math.min(...candidates) : afterLabel.length;
					return (trendLabel + afterLabel.slice(0, end)).trim();
				})()
			: null;
	const fullYearlyText = trendOnly !== null ? trendOnly : rawDescription;
	const maxLen = 220;
	const yearlyText =
		fullYearlyText.length <= maxLen
			? fullYearlyText
			: (() => {
					const slice = fullYearlyText.slice(0, maxLen + 1);
					const lastSentenceEnd = Math.max(
						slice.lastIndexOf("。"),
						slice.lastIndexOf("！"),
						slice.lastIndexOf("？"),
						slice.lastIndexOf("；"),
					);
					const cut =
						lastSentenceEnd >= 0 && lastSentenceEnd > maxLen * 0.5
							? lastSentenceEnd + 1
							: maxLen;
					return fullYearlyText.slice(0, cut).trim() + "…";
				})();
	const showCompatibilityBlock =
		compatibility != null && compat?.score != null;
	const femaleElColor = ELEMENT_COLOR[femaleEl] || "#374151";
	const maleElColor = ELEMENT_COLOR[maleEl] || "#374151";

	return (
		<div
			className="bg-white page-break"
			style={{
				width: "210mm",
				height: "297mm",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "white",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: "35mm",
					left: "35mm",
					width: "135mm",
					height: "150mm",
					backgroundColor: "#EDEDED",
					zIndex: 0,
				}}
			/>
			{/* <div
				style={{
					position: "absolute",
					top: "6mm",
					left: "10mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				命
			</div>
			<div
				style={{
					position: "absolute",
					top: "6mm",
					right: "5mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				理
			</div>
			<div
				style={{
					position: "absolute",
					bottom: "6mm",
					left: "10mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				報
			</div>
			<div
				style={{
					position: "absolute",
					bottom: "6mm",
					right: "5mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				告
			</div> */}

			<div
				style={{
					position: "absolute",
					top: "30mm",
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
						color: COUPLE_COLOR,
						lineHeight: "1.1",
						letterSpacing: "0.05em",
						marginBottom: "28px",
					}}
				>
					姻緣合盤
					<br />
					報告
				</div>
			</div>

			<div
				style={{
					position: "absolute",
					bottom: "102mm",
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
					bottom: "120mm",
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

			{/* Compatibility section at bottom (same as attached picture) */}
			{showCompatibilityBlock && (
				<div
					style={{
						position: "absolute",
						bottom: "18mm",
						left: "35mm",
						right: "30mm",
						zIndex: 2,
						padding: "10px 14px",
						border: "1px solid #e5e0d8",
						borderRadius: "16px",
						boxSizing: "border-box",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "flex-start",
							gap: "12px",
						}}
					>
						{/* Left: circular score */}
						<div
							className="flex-shrink-0"
							style={{
								width: "190px",
								height: "190px",
								position: "relative",
							}}
						>
							<svg
								className="w-full h-full"
								style={{ transform: "rotate(-90deg)" }}
								viewBox="0 0 100 100"
							>
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="#e5e0d8"
									strokeWidth="10"
								/>
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="url(#coverCompatCircleGrad)"
									strokeWidth="10"
									strokeLinecap="round"
									strokeDasharray={`${(compat.score * 251.2) / 100} 251.2`}
								/>
								<defs>
									<linearGradient
										id="coverCompatCircleGrad"
										x1="0%"
										y1="0%"
										x2="100%"
										y2="0%"
									>
										<stop
											offset="0%"
											stopColor={CIRCLE_GRADIENT_START}
										/>
										<stop
											offset="100%"
											stopColor={CIRCLE_GRADIENT_END}
										/>
									</linearGradient>
								</defs>
							</svg>
							<div
								style={{
									position: "absolute",
									inset: 0,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									pointerEvents: "none",
								}}
							>
								<span
									style={{
										fontSize: "40px",
										fontWeight: 700,
										color: SCORE_COLOR,
										lineHeight: 1,
									}}
								>
									{compat.score}
								</span>
								<span
									style={{
										fontSize: "20px",
										color: SCORE_COLOR,
										marginTop: "2px",
									}}
								>
									{compat.level}
								</span>
							</div>
						</div>
						{/* Right: two element boxes + gradient bar + yearly text */}
						<div style={{ flex: 1, minWidth: 0 }}>
							<div
								style={{
									display: "flex",
									gap: "8px",
									marginBottom: "8px",
								}}
							>
								{/* Female box: no border, bg #DFDFDF, element word color by element */}
								<div
									style={{
										flex: 1,
										display: "flex",
										alignItems: "center",
										gap: "13px",
										padding: "6px 10px",
										backgroundColor: "#DFDFDF",
										borderRadius: "10px",
									}}
								>
									<Image
										src="/images/report-print/female.png"
										alt=""
										width={24}
										height={24}
										style={{ objectFit: "contain" }}
									/>
									<Image
										src={`/images/elements/${femaleEl}.png`}
										alt=""
										width={18}
										height={18}
										style={{ objectFit: "contain" }}
									/>
									<span
										style={{
											fontSize: "13px",
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											fontWeight: 700,
											color: femaleElColor,
										}}
									>
										{femaleElementDisplay}
									</span>
								</div>
								{/* Male box: no border, bg #DFDFDF, element word color by element */}
								<div
									style={{
										flex: 1,
										display: "flex",
										alignItems: "center",
										gap: "13px",
										padding: "6px 10px",
										backgroundColor: "#DFDFDF",
										borderRadius: "10px",
									}}
								>
									<Image
										src="/images/report-print/male.png"
										alt=""
										width={24}
										height={24}
										style={{ objectFit: "contain" }}
									/>
									<Image
										src={`/images/elements/${maleEl}.png`}
										alt=""
										width={18}
										height={18}
										style={{ objectFit: "contain" }}
									/>
									<span
										style={{
											fontSize: "13px",
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											fontWeight: 700,
											color: maleElColor,
										}}
									>
										{maleElementDisplay}
									</span>
								</div>
							</div>
							{/* Gradient bar: #CC91A7 → #95A7B9 */}
							<div
								style={{
									background: `linear-gradient(90deg, ${BAR_GRADIENT_START}, ${BAR_GRADIENT_END})`,
									borderRadius: "8px",
									padding: "6px 10px",
									textAlign: "center",
									marginBottom: "8px",
								}}
							>
								<span
									style={{
										fontSize: "15px",
										color: "#fff",
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",

										fontWeight: 900,
									}}
								>
									{balance}
								</span>
							</div>
							{/* Year + recommendation paragraph */}
							{yearlyText && (
								<>
									<div
										style={{
											fontSize: "15px",
											fontWeight: 700,
											color: SCORE_COLOR,
											marginBottom: "4px",
										}}
									>
										{yearLabel}
									</div>
									<p
										style={{
											fontSize: "11px",
											lineHeight: 1.55,
											color: "#374151",
											margin: 0,
										}}
									>
										{yearlyText}
									</p>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
