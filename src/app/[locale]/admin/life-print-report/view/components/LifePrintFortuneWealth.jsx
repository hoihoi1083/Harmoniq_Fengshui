"use client";

/**
 * Page: 財運運勢 — one full A4 page
 */
const COLOR = "#D9B815";
const TITLE = "財運運勢";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
};

function isErrorResponse(analysis) {
	if (!analysis || typeof analysis !== "object") return true;
	if (analysis.response && !analysis.summary && !analysis.systems) return true;
	return false;
}

export default function LifePrintFortuneWealth({ data }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	const stages = analysis.threeStages || analysis.phases;
	if (stages && typeof stages === "object") {
		["奠基期", "爆發期", "守成期"].forEach((key) => {
			const val = stages[key];
			if (!val) return;
			const c = val.content || {};
			parts.push(
				<div key={key} style={{ marginTop: "12px", padding: "8px", background: "#f5f5f5", borderRadius: "6px" }}>
					<strong style={{ fontSize: "12px" }}>{val.title || key}</strong>
					{val.ageRange && <span style={{ fontSize: "11px", color: "#555", marginLeft: "8px" }}>{val.ageRange} {val.fortune || ""}</span>}
					{c.phase1 && (
						<>
							{c.phase1.name && <p style={{ margin: "4px 0 2px", fontSize: "11px", fontWeight: 600 }}>{c.phase1.name}</p>}
							{c.phase1.description && <p style={{ margin: "2px 0", fontSize: "11px", lineHeight: 1.6 }}>{c.phase1.description}</p>}
							{c.phase1.keyYear && <p style={{ margin: "2px 0", fontSize: "11px" }}>{c.phase1.keyYear}</p>}
							{c.phase1.trapYear && <p style={{ margin: "2px 0", fontSize: "10px", color: "#555" }}>{c.phase1.trapYear}</p>}
						</>
					)}
					{c.phase2 && (
						<>
							{c.phase2.name && <p style={{ margin: "6px 0 2px", fontSize: "11px", fontWeight: 600 }}>{c.phase2.name}</p>}
							{c.phase2.description && <p style={{ margin: "2px 0", fontSize: "11px", lineHeight: 1.6 }}>{c.phase2.description}</p>}
							{c.phase2.warning && <p style={{ margin: "2px 0", fontSize: "10px", color: "#555" }}>{c.phase2.warning}</p>}
						</>
					)}
					{c.description && !c.phase1 && <p style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>{c.description}</p>}
					{c.keyYear && <p style={{ margin: "2px 0", fontSize: "11px" }}>{c.keyYear}</p>}
					{c.industries && <p style={{ margin: "2px 0", fontSize: "11px" }}>核心領域：{c.industries}</p>}
					{c.peakYear && <p style={{ margin: "2px 0", fontSize: "11px" }}>{c.peakYear}</p>}
					{c.avoidIndustries && <p style={{ margin: "2px 0", fontSize: "11px" }}>忌諱產業：{c.avoidIndustries}</p>}
				</div>
			);
		});
	}
	if (analysis.wealthRules) {
		const w = analysis.wealthRules;
		if (w.assetAllocation) {
			const a = w.assetAllocation;
			parts.push(
				<div key="asset" style={{ marginTop: "12px", padding: "8px", background: "#fafafa", borderRadius: "6px" }}>
					<strong style={{ fontSize: "12px" }}>{a.title || "資產配比"}</strong>
					<p style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>{[a.realEstate, a.preciousMetals, a.cash].filter(Boolean).join("；")}</p>
				</div>
			);
		}
		if (w.partnerships) {
			const p = w.partnerships;
			parts.push(<div key="part" style={{ marginTop: "8px" }}><strong style={{ fontSize: "12px" }}>{p.title || "合作禁忌"}</strong></div>);
			if (p.zodiacA?.description) parts.push(<p key="z1" style={{ margin: "2px 0", fontSize: "11px" }}>{p.zodiacA.animal}：{p.zodiacA.description}</p>);
			if (p.zodiacB?.description) parts.push(<p key="z2" style={{ margin: "2px 0", fontSize: "11px" }}>{p.zodiacB.animal}：{p.zodiacB.description}</p>);
		}
		if (w.wealthDirection) {
			const d = w.wealthDirection;
			parts.push(<div key="dir" style={{ marginTop: "8px" }}><strong style={{ fontSize: "12px" }}>{d.title || "催財方位"}</strong><p style={{ margin: "2px 0", fontSize: "11px" }}>{d.location} — {d.description}</p>{d.warning && <p style={{ margin: "2px 0", fontSize: "10px", color: "#555" }}>{d.warning}</p>}</div>);
		}
	}

	const summaryTitle = analysis.summary?.title;
	if (!summaryTitle && parts.length === 0) return null;

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
			<h2 style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 800, fontSize: "20px", color: COLOR, marginBottom: "8px", borderBottom: `3px solid ${COLOR}`, paddingBottom: "6px" }}>
				{TITLE}
			</h2>
			{summaryTitle && <p style={{ fontWeight: 700, fontSize: "14px", color: "#333", marginBottom: "10px" }}>{summaryTitle}</p>}
			<div style={{ fontFamily: "Noto Sans HK, sans-serif", color: "#333" }}>{parts}</div>
		</div>
	);
}
