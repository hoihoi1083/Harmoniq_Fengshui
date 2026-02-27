"use client";

import { generatePillarsAnalysis, parseAiToStrengthsAndSuggestions, ELEMENT_DESC as ELEMENT_DESC_MAP } from "../utils/individualAnalysisPrint";

/**
 * Couple print Page 1 - 基礎分析: same structure as CoupleAnnualAnalysis (couple-report 811-831).
 * Shows: two users with full 個人分析 (男方/女方 + 四柱 + 主要優勢 + 發展建議), compatibility, 五行互動, 想問的問題, 流年.
 * Styled to fit one A4 (210mm x 297mm, 15mm 20mm padding).
 */
const COUPLE_COLOR = "#D94075"; // 女方 pink
const BLUE_COLOR = "#4A90E2";   // 男方 blue
const ELEMENT_DESC = { 金: "金命", 木: "木命", 水: "水命", 火: "火命", 土: "土命" };
const COMPAT_MATRIX = {
	金: { 金: 70, 木: 40, 水: 85, 火: 35, 土: 80 },
	木: { 金: 40, 木: 75, 水: 80, 火: 85, 土: 45 },
	水: { 金: 85, 木: 80, 水: 70, 火: 30, 土: 50 },
	火: { 金: 35, 木: 85, 水: 30, 火: 75, 土: 80 },
	土: { 金: 80, 木: 45, 水: 50, 火: 80, 土: 70 },
};
const getLevel = (s) => (s >= 80 ? "優秀配對" : s >= 70 ? "良好配對" : s >= 60 ? "穩定配對" : "需要努力");

export default function CouplePrintPage1({
	name1,
	name2,
	birthday1,
	birthday2,
	birthTime1,
	birthTime2,
	question,
	wuxing1,
	wuxing2,
	annualResult,
	individual1Data,
	individual2Data,
	birthDateTime1,
	birthDateTime2,
}) {
	const now = new Date();
	const dateStr = now.toLocaleDateString("zh-TW").replace(/\//g, "/");

	const el1 = wuxing1?.dayStemWuxing || "木";
	const el2 = wuxing2?.dayStemWuxing || "火";
	const score = COMPAT_MATRIX[el1]?.[el2] ?? 60;
	const level = getLevel(score);

	const compatibility = annualResult?.compatibility || { score, level, description: "基於八字基礎分析的配對評估" };
	const user1Analysis = annualResult?.user1Analysis || { dominantElement: el1, elementType: ELEMENT_DESC[el1] || "木命" };
	const user2Analysis = annualResult?.user2Analysis || { dominantElement: el2, elementType: ELEMENT_DESC[el2] || "火命" };
	const elementInteraction = annualResult?.elementInteraction || { balance: "五行互動分析", missing: "", advice: `${el1}命與${el2}命的配對，建議注重五行調和` };
	const annualStrategy = annualResult?.annualStrategy || null;

	// Full individual analysis for Page 1 (same as web): pillars + 主要優勢 + 發展建議
	const bazi1 = individual1Data?.baziData ?? null;
	const bazi2 = individual2Data?.baziData ?? null;
	const pillarsAnalysis1 = bazi1 ? generatePillarsAnalysis(bazi1) : null;
	const pillarsAnalysis2 = bazi2 ? generatePillarsAnalysis(bazi2) : null;
	const parsed1 = parseAiToStrengthsAndSuggestions(individual1Data?.aiAnalysis ?? "", bazi1, wuxing1?.dayStemWuxing);
	const parsed2 = parseAiToStrengthsAndSuggestions(individual2Data?.aiAnalysis ?? "", bazi2, wuxing2?.dayStemWuxing);
	const gender1 = individual1Data?.gender ?? "第一人";
	const gender2 = individual2Data?.gender ?? "第二人";
	const elementLabel1 = wuxing1?.dayStemWuxing ? ELEMENT_DESC[wuxing1.dayStemWuxing] : (bazi1?.dayElement ? ELEMENT_DESC_MAP[bazi1.dayElement] : "土命");
	const elementLabel2 = wuxing2?.dayStemWuxing ? ELEMENT_DESC[wuxing2.dayStemWuxing] : (bazi2?.dayElement ? ELEMENT_DESC_MAP[bazi2.dayElement] : "火命");

	const currentYear = new Date().getFullYear();
	const strategyEntries = annualStrategy && typeof annualStrategy === "object" ? Object.entries(annualStrategy).slice(0, 2) : [];

	const renderIndividualColumn = (pillarsAnalysis, parsed, color, birthDateTime, genderLabel, elementLabel) => (
		<div
			className="p-2 border-2 border-gray-200 rounded-xl flex flex-col"
			style={{ backgroundColor: color === COUPLE_COLOR ? "#fef2f2" : "#eff6ff", minHeight: 0 }}
		>
			<div className="flex flex-wrap items-center gap-2 mb-2">
				<h4 style={{ fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif", fontSize: "14px", fontWeight: 700, color, margin: 0 }}>
					{genderLabel}
				</h4>
				<span style={{ padding: "3px 10px", borderRadius: "9999px", border: `2px solid ${color}`, color, fontSize: "11px", fontFamily: "Noto Serif TC, serif" }}>
					{birthDateTime}
				</span>
			</div>
			{pillarsAnalysis && (
				<div className="grid grid-cols-4 gap-1 mb-2">
					{Object.entries(pillarsAnalysis).map(([name, data]) => (
						<div key={name} className="overflow-hidden rounded bg-gray-100">
							<div className="py-0.5 text-center text-white" style={{ backgroundColor: color, fontSize: "9px", fontWeight: 700 }}>
								{name}
							</div>
							<div className="py-0.5 text-center text-white" style={{ backgroundColor: color, opacity: 0.95, fontSize: "11px" }}>
								{data.title.split("-")[1]}
							</div>
							<div className="p-1 bg-white" style={{ fontSize: "8px", lineHeight: "1.3", color: "#374151" }}>
								<div>{data.subtitle}</div>
								<div style={{ color: "#6b7280" }}>{data.description}</div>
							</div>
						</div>
					))}
				</div>
			)}
			<div className="flex-1 min-h-0 p-2 rounded-lg border border-gray-200" style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
				<div className="mb-1">
					<span className="inline-block px-2 py-0.5 rounded-full border-2" style={{ borderColor: color, color, fontSize: "10px", fontWeight: 600 }}>
						{genderLabel}{elementLabel}特性
					</span>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<h5 style={{ fontSize: "10px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>主要優勢：</h5>
						<ul style={{ margin: 0, paddingLeft: "14px", fontSize: "9px", lineHeight: "1.45", color: "#374151" }}>
							{(parsed.strengths || []).slice(0, 3).map((s, i) => (
								<li key={i}>{typeof s === "string" ? s.replace(/^[•\-*]\s*/, "") : s}</li>
							))}
						</ul>
					</div>
					<div>
						<h5 style={{ fontSize: "10px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>發展建議：</h5>
						<ul style={{ margin: 0, paddingLeft: "14px", fontSize: "9px", lineHeight: "1.45", color: "#374151" }}>
							{(parsed.suggestions || []).slice(0, 3).map((s, i) => (
								<li key={i}>{typeof s === "string" ? s.replace(/^[•\-*]\s*/, "") : s}</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div
			className="mx-auto bg-white page-break print-report-page1"
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
			{/* Header: 基礎分析 + date */}
			<div style={{ position: "relative", height: "52px", marginBottom: "12px" }}>
				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 900,
						fontSize: "28px",
						lineHeight: "110%",
						letterSpacing: "0.27em",
						color: COUPLE_COLOR,
					}}
				>
					基礎分析
				</div>
				<div
					style={{
						width: "70px",
						height: "0",
						marginTop: "8px",
						border: "1px solid #000",
					}}
				/>
				<div
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						fontFamily: "Noto Serif TC, serif",
						fontSize: "16px",
						color: "#424242",
					}}
				>
					{dateStr}
				</div>
			</div>

			{/* 男方 full width, 女方 full width below. 男方=blue, 女方=pink */}
			<div className="flex flex-col gap-3" style={{ marginBottom: "10px", minHeight: 0 }}>
				{renderIndividualColumn(pillarsAnalysis1, parsed1, gender1 === "男方" ? BLUE_COLOR : COUPLE_COLOR, birthDateTime1 || `${birthday1} ${birthTime1?.split("(")[0]?.trim() || ""}`, gender1, elementLabel1)}
				{renderIndividualColumn(pillarsAnalysis2, parsed2, gender2 === "男方" ? BLUE_COLOR : COUPLE_COLOR, birthDateTime2 || `${birthday2} ${birthTime2?.split("(")[0]?.trim() || ""}`, gender2, elementLabel2)}
			</div>
			<div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "6px" }}>
				第一人：{name1 || "—"}　第二人：{name2 || "—"}
			</div>

			{/* Row: Compatibility circle + Element combo */}
			<div className="flex items-center gap-3" style={{ marginBottom: "10px" }}>
				<div className="relative flex-shrink-0" style={{ width: "100px", height: "100px" }}>
					<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="40" fill="none" stroke="#817E7E" strokeWidth="8" />
						<circle
							cx="50"
							cy="50"
							r="40"
							fill="none"
							stroke={COUPLE_COLOR}
							strokeWidth="8"
							strokeLinecap="round"
							strokeDasharray={`${(compatibility.score * 251.2) / 100} 251.2`}
						/>
					</svg>
					<div
						className="absolute inset-0 flex flex-col items-center justify-center"
						style={{ pointerEvents: "none" }}
					>
						<span style={{ fontSize: "22px", fontWeight: 700, color: "#b45309" }}>
							{compatibility.score}
						</span>
						<span style={{ fontSize: "11px", color: "#4b5563" }}>{compatibility.level}</span>
					</div>
				</div>
				<div className="flex-1 p-3 rounded-xl border border-gray-200" style={{ backgroundColor: "#f9fafb" }}>
					<div className="flex flex-wrap items-center justify-center gap-2 mb-1">
						<span className="px-2 py-1 rounded-full text-white font-bold" style={{ backgroundColor: COUPLE_COLOR, fontSize: "12px" }}>
							{user1Analysis.dominantElement}
						</span>
						<span style={{ fontSize: "14px", color: "#9ca3af" }}>+</span>
						<span className="px-2 py-1 rounded-full text-white font-bold" style={{ backgroundColor: "#2563eb", fontSize: "12px" }}>
							{user2Analysis.dominantElement}
						</span>
						<span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "4px" }}>
							{user1Analysis.elementType} + {user2Analysis.elementType}
						</span>
					</div>
					<p style={{ fontSize: "12px", color: "#4b5563", textAlign: "center", margin: 0 }}>
						{elementInteraction.balance}
					</p>
				</div>
			</div>

			{/* 五行互動分析 */}
			<div style={{ marginBottom: "8px" }}>
				<h4 style={{ fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif", fontSize: "13px", fontWeight: 700, color: COUPLE_COLOR, marginBottom: "6px" }}>
					五行互動分析
				</h4>
				<div className="grid grid-cols-2 gap-2">
					<div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: "#E7E7E7" }}>
						<div style={{ fontSize: "11px", fontWeight: 600, color: COUPLE_COLOR, marginBottom: "4px" }}>元素互動</div>
						<p style={{ fontSize: "11px", lineHeight: "1.4", color: "#1f2937", margin: 0 }}>{elementInteraction.balance}</p>
						{elementInteraction.missing && (
							<p style={{ fontSize: "10px", lineHeight: "1.3", color: "#4b5563", margin: "4px 0 0 0" }}>{elementInteraction.missing}</p>
						)}
					</div>
					<div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: "#E7E7E7" }}>
						<div style={{ fontSize: "11px", fontWeight: 600, color: COUPLE_COLOR, marginBottom: "4px" }}>關係建議</div>
						<p style={{ fontSize: "11px", lineHeight: "1.4", color: "#1f2937", margin: 0 }}>{elementInteraction.advice}</p>
					</div>
				</div>
			</div>

			{/* 想問的問題 */}
			<div style={{ marginBottom: "8px" }}>
				<h4 style={{ fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif", fontSize: "13px", fontWeight: 700, color: COUPLE_COLOR, marginBottom: "4px" }}>
					想問的問題
				</h4>
				<div style={{ fontSize: "11px", lineHeight: "1.45", color: "#424242", fontFamily: "Noto Serif TC, serif", padding: "6px 10px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
					{question && question.trim() ? question.trim() : "感情關係和諧改善建議"}
				</div>
			</div>

			{/* 流年關鍵應對 */}
			{strategyEntries.length > 0 && (
				<div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: "#f9fafb" }}>
					<h4 style={{ fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif", fontSize: "12px", fontWeight: 700, color: COUPLE_COLOR, marginBottom: "6px" }}>
						{currentYear}流年關鍵應對策略
					</h4>
					<div className="grid grid-cols-2 gap-2">
						{strategyEntries.map(([year, strategy]) => (
							<div
								key={year}
								className="p-2 rounded-lg"
								style={{ backgroundColor: "#E7E7E7", fontSize: "11px", lineHeight: "1.4", color: "#1f2937" }}
							>
								<div style={{ fontWeight: 600, color: COUPLE_COLOR, marginBottom: "4px" }}>{year}年</div>
								<div>{strategy.monthlyFocus || strategy.description || ""}</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
