"use client";

/**
 * Page 8: 化解提示
 * Data: lifeAdvice.tips from wuxing-analysis API
 */
const LIFE_COLOR = "#A3B116";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
};

export default function LifePrintResolveTips({ lifeAdvice }) {
	const tips = lifeAdvice?.tips;
	if (!tips || !Array.isArray(tips) || tips.length === 0) return null;

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
			<h2 style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 800, fontSize: "22px", color: LIFE_COLOR, marginBottom: "14px" }}>
				化解提示
			</h2>
			<p style={{ fontSize: "12px", lineHeight: 1.6, color: "#555", marginBottom: "14px" }}>
				透過這些策略，你可以在生活和工作中更好地平衡才華與壓力，發揮自己的潛力，迎接機會的來臨。
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				{tips.map((tip, i) => (
					<div key={i} style={{ padding: "12px", border: `2px solid ${LIFE_COLOR}`, borderRadius: "8px", background: "#fefefe" }}>
						<div style={{ fontWeight: 700, fontSize: "14px", color: LIFE_COLOR, marginBottom: "6px" }}>{tip.title}</div>
						<p style={{ fontSize: "11px", lineHeight: 1.6, margin: "2px 0" }}>{tip.content}</p>
						{tip.example && <p style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>例：{tip.example}</p>}
					</div>
				))}
			</div>
		</div>
	);
}
