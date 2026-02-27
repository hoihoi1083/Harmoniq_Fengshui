"use client";

import { generatePillarsAnalysis, parseAiToStrengthsAndSuggestions, ELEMENT_DESC } from "../utils/individualAnalysisPrint";

/**
 * Print version of IndividualAnalysisSection: 男方/女方 with four pillar cards,
 * 主要優勢, 發展建議. 男方=blue, 女方=pink.
 */
const COUPLE_COLOR = "#D94075"; // 女方 pink
const BLUE_COLOR = "#4A90E2";  // 男方 blue

export default function CouplePrintIndividualSection({
	genderLabel,
	birthDateTime,
	baziData,
	elementType,
	aiAnalysis,
	isFirstPerson,
}) {
	const color = genderLabel === "男方" ? BLUE_COLOR : COUPLE_COLOR;
	const pillars = baziData ? generatePillarsAnalysis(baziData) : null;
	const { strengths, suggestions } = parseAiToStrengthsAndSuggestions(aiAnalysis || "", baziData);
	const elementLabel = elementType || (baziData?.dayElement ? ELEMENT_DESC[baziData.dayElement] : "土命");

	return (
		<div
			className="mx-auto bg-white page-break"
			style={{
				width: "210mm",
				minHeight: "297mm",
				maxHeight: "297mm",
				padding: "12mm 18mm",
				boxSizing: "border-box",
				overflow: "hidden",
			}}
		>
			{/* Header: 男方/女方 + birth date pill */}
			<div className="flex flex-wrap items-center gap-3 mb-4">
				<h2
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 900,
						fontSize: "28px",
						color,
						margin: 0,
					}}
				>
					{genderLabel}
				</h2>
				<div
					style={{
						padding: "6px 14px",
						borderRadius: "9999px",
						border: `2px solid ${color}`,
						color,
						fontSize: "13px",
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					{birthDateTime}
				</div>
			</div>

			{/* Four Pillars */}
			{pillars && (
				<div className="grid grid-cols-4 gap-2 mb-5">
					{Object.entries(pillars).map(([name, data]) => (
						<div key={name} className="overflow-hidden rounded-lg bg-gray-100">
							<div
								className="p-2 text-center text-white"
								style={{ backgroundColor: color, fontSize: "12px", fontWeight: 700, fontFamily: "Noto Sans HK, sans-serif" }}
							>
								{name}
							</div>
							<div className="p-2 text-center text-white" style={{ backgroundColor: color, opacity: 0.95, fontSize: "14px" }}>
								{data.title.split("-")[1]}
							</div>
							<div className="p-2 bg-white" style={{ fontSize: "10px", lineHeight: "1.35", color: "#374151" }}>
								<div className="mb-1">{data.subtitle}</div>
								<div style={{ color: "#6b7280" }}>{data.description}</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 男方/女方○命特性 pill + 主要優勢 & 發展建議 */}
			<div className="p-4 rounded-xl border border-gray-200" style={{ backgroundColor: color === COUPLE_COLOR ? "#fef2f2" : "#eff6ff" }}>
				<div className="mb-3">
					<span
						className="inline-block px-3 py-1.5 rounded-full border-2"
						style={{ borderColor: color, color, fontSize: "13px", fontWeight: 600 }}
					>
						{genderLabel}
						{elementLabel}
						特性
					</span>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111", marginBottom: "8px", fontFamily: "Noto Sans HK, sans-serif" }}>
							主要優勢：
						</h4>
						<ul style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", lineHeight: "1.6", color: "#374151" }}>
							{(strengths || []).map((s, i) => (
								<li key={i} style={{ marginBottom: "4px" }}>
									{typeof s === "string" ? s.replace(/^[•\-*]\s*/, "") : s}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111", marginBottom: "8px", fontFamily: "Noto Sans HK, sans-serif" }}>
							發展建議：
						</h4>
						<ul style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", lineHeight: "1.6", color: "#374151" }}>
							{(suggestions || []).map((s, i) => (
								<li key={i} style={{ marginBottom: "4px" }}>
									{typeof s === "string" ? s.replace(/^[•\-*]\s*/, "") : s}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
