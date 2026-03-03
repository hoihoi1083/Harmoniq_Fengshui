"use client";

import {
	generatePillarsAnalysis,
	parseAiToStrengthsAndSuggestions,
	ELEMENT_DESC,
} from "../utils/individualAnalysisPrint";

/**
 * Print individual block matching fortune print report page 1:
 * Light gray container, 姓名/生辰 header, 4-pillar Bazi (gold bar + dashed separators), quote + recommendation paragraph.
 * 男方=blue, 女方=pink (accent only; container is neutral).
 */
const COUPLE_COLOR = "#D94075";
const BLUE_COLOR = "#4A90E2";
const GOLD_BAR = "#D4A84B";
const CONTAINER_BG = "#DFDFDF";
const CONTAINER_BORDER = "#333333";
/** Space between 年/月/日/時 and 干支 in the gold bar title. Change this to adjust (e.g. "0.25em", "6px", "0" for no space). */
const TITLE_LABEL_GAP = "0.35em";

export default function CouplePrintIndividualSection({
	name,
	genderLabel,
	birthDateTime,
	baziData,
	elementType,
	aiAnalysis,
}) {
	const color = genderLabel === "男方" ? BLUE_COLOR : COUPLE_COLOR;
	const pillars = baziData ? generatePillarsAnalysis(baziData) : null;
	const { strengths, suggestions } = parseAiToStrengthsAndSuggestions(
		aiAnalysis || "",
		baziData,
	);
	const elementLabel =
		elementType ||
		(baziData?.dayElement ? ELEMENT_DESC[baziData.dayElement] : "土命");
	const primaryEl =
		baziData?.dayElement ||
		(typeof elementLabel === "string" && elementLabel[0]) ||
		"水";
	const secondaryMap = { 金: "水", 木: "火", 水: "金", 火: "木", 土: "金" };
	const secondaryEl = secondaryMap[primaryEl] || "金";

	// Recommendation paragraph: 用神-style (like fortune print page 1) + optional strengths/suggestions
	const baseText = `根據您的五行配置分析，建議以「${primaryEl}」為首選用神，「${secondaryEl}」為輔助用神。透過補足所缺的策略，兩者協同作用可有效調節五行能量，達到陰陽平衡，提升整體運勢發展。`;
	const extra =
		strengths?.length > 0 || suggestions?.length > 0
			? `在日常生活中，可通過相應的顏色、方位、職業選擇等方式來強化這些有利元素的影響力。主要優勢：${(strengths || []).slice(0, 2).join("；")}。發展建議：${(suggestions || []).slice(0, 2).join("、")}。`
			: "在日常生活中，可通過相應的顏色、方位、職業選擇等方式來強化這些有利元素的影響力。";
	const recommendationText = baseText + extra;

	const pillarOrder = ["年柱", "月柱", "日柱", "時柱"];
	const pillarEntries = pillars
		? pillarOrder
				.map((key) => ({
					key,
					label: key.replace("柱", ""),
					data: pillars[key],
				}))
				.filter((e) => e.data)
		: [];

	return (
		<div style={{ marginBottom: "40px" }}>
			{/* Gray container: header + Bazi only */}
			<div
				style={{
					border: `1px solid ${CONTAINER_BORDER}`,
					borderRadius: "12px",
					padding: "14px 16px",
					boxSizing: "border-box",
				}}
			>
				{/* Header: 姓名 + 生辰 side by side */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						marginBottom: "12px",
						fontFamily: "Noto Serif TC, serif",
						fontSize: "15px",
						fontWeight: 700,
						color: "#424242",
					}}
				>
					<span>
						姓名：
						{name || (genderLabel === "男方" ? "先生" : "小姐")}
					</span>
					<span>生辰：{birthDateTime || "—"}</span>
				</div>

				{/* Bazi: 4 columns, gold bar + subtitle + description, dashed vertical separators, white bg */}
				{pillarEntries.length > 0 && (
					<div
						style={{
							display: "flex",
							backgroundColor: "#fff",
							overflow: "hidden",
						}}
					>
						{pillarEntries.map(({ key, label, data }, idx) => {
							const ganZhi = data.title.split("-")[1] || "";
							const subtitleWithoutBracket = (
								data.subtitle || ""
							).replace(/[（(][^）)]+[）)]\s*$/, "");
							return (
								<div
									key={key}
									style={{
										flex: 1,
										minWidth: 0,
										borderLeft:
											idx > 0
												? "1px dashed #cccccc"
												: "none",
									}}
								>
									{/* Gold bar: 年/月/日/時 + 干支 */}
									<div
										style={{
											backgroundColor: GOLD_BAR,
											color: "white",
											fontSize: "14px",
											fontWeight: 800,
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											textAlign: "center",
											padding: "8px 6px",
										}}
									>
										{label}
										<span style={{ marginLeft: "12px" }}>
											{ganZhi}
										</span>
									</div>
									{/* Middle: subtitle (干支 removed from bracket) */}
									<div
										style={{
											padding: "6px 8px",
											fontSize: "10px",
											lineHeight: 1.4,
											color: "#374151",
											fontFamily:
												"Noto Sans HK, sans-serif",
										}}
									>
										{subtitleWithoutBracket}
									</div>
									{/* Bottom: description paragraph */}
									<div
										style={{
											padding: "8px",
											fontSize: "12px",
											lineHeight: 1.55,
											color: "#4b5563",
											fontFamily: "Noto Serif TC, serif",
										}}
									>
										{data.description}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Recommendation: large gray quote + paragraph — outside and below the container */}
			<div
				style={{
					position: "relative",
					paddingLeft: "36px",
					marginTop: "22px",
				}}
			>
				<div
					style={{
						position: "absolute",
						left: 0,
						top: "-4px",
						fontSize: "48px",
						fontFamily: "Georgia, serif",
						color: "#999999",
						lineHeight: 1,
					}}
					aria-hidden
				>
					"
				</div>
				<p
					style={{
						margin: 0,
						fontSize: "14px",
						lineHeight: 1.7,
						color: "#424242",
						fontFamily: "Noto Serif TC, serif",
						textAlign: "justify",
					}}
				>
					{recommendationText}
				</p>
			</div>
		</div>
	);
}
