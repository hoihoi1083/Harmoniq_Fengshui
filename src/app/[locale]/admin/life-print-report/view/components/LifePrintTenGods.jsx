"use client";

/**
 * Page 6: 十神格局與內在關聯 (single page, compact layout)
 * Data: tenGodsAnalysis from wuxing-analysis API
 */
const LIFE_COLOR = "#A3B116";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "12mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
};
const GOD_NAMES = ["正印", "財星", "官殺", "劫比", "食傷"];

export default function LifePrintTenGods({ tenGodsAnalysis }) {
	if (!tenGodsAnalysis || typeof tenGodsAnalysis !== "object") return null;
	const entries = Object.entries(tenGodsAnalysis).filter(([k]) => GOD_NAMES.includes(k));
	if (!entries.length) return null;

	function renderGodBlock([godName, data]) {
		if (!data || typeof data !== "object") return null;
		const conflicts = data.coreConflicts?.conflicts || [];
		return (
			<div key={godName} style={{ marginBottom: "8px", padding: "6px 8px", background: "#f9fafb", borderRadius: "6px" }}>
				<div style={{ fontWeight: 800, fontSize: "12px", color: LIFE_COLOR, marginBottom: "2px" }}>{data.name || godName}</div>
				{data.meaning && <p style={{ fontSize: "10px", color: "#555", margin: "1px 0", lineHeight: 1.4 }}>{data.meaning}</p>}
				{data.expression && <p style={{ fontSize: "10px", lineHeight: 1.45, margin: "2px 0" }}>{data.expression}</p>}
				{conflicts.length > 0 && (
					<div style={{ marginTop: "4px" }}>
						{conflicts.map((c, i) => (
							<div key={i} style={{ fontSize: "9px", marginTop: "2px", paddingLeft: "6px", borderLeft: "2px solid #e5e7eb", lineHeight: 1.4 }}>
								<strong>{c.title}</strong>: {c.description}
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
			<h2 style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 800, fontSize: "18px", color: LIFE_COLOR, marginBottom: "10px" }}>
				十神格局與內在關聯
			</h2>
			{entries.map(renderGodBlock)}
		</div>
	);
}
