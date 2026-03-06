"use client";

/**
 * Page: 事業運勢 — one full A4 page
 */
const COLOR = "#0A58A6";
const TITLE = "事業運勢";
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

export default function LifePrintFortuneCareer({ data }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	if (analysis.talents && typeof analysis.talents === "object") {
		Object.entries(analysis.talents).forEach(([key, val]) => {
			if (!val?.content) return;
			const c = val.content;
			const title = val.title || key;
			if (Array.isArray(c)) {
				const items = c.map((x, i) => (
					<p key={i} style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>
						{x.name && <strong>{x.name}：</strong>}{x.description}{x.attention && ` 注意：${x.attention}`}
					</p>
				));
				parts.push(
					<div key={key} style={{ marginTop: "12px", padding: "8px", background: "#f5f5f5", borderRadius: "6px" }}>
						<strong style={{ fontSize: "12px" }}>{title}</strong>
						{items}
					</div>
				);
				return;
			}
			if (c.periods && Array.isArray(c.periods)) {
				const periodTexts = c.periods.map((p) => `${p.years || ""} ${p.luck || ""} — ${p.action || ""} ${p.bestYear || ""} ${p.warning ? `注意：${p.warning}` : ""}`.trim());
				parts.push(
					<div key={key} style={{ marginTop: "12px", padding: "8px", background: "#f5f5f5", borderRadius: "6px" }}>
						<strong style={{ fontSize: "12px" }}>{title}</strong>
						{periodTexts.map((text, i) => <p key={i} style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>{text}</p>)}
					</div>
				);
				return;
			}
			const lines = [c.description, c.peakDescription, c.bestPartners && `最佳合作：${c.bestPartners}`, c.avoidIndustries && `避開：${c.avoidIndustries}`].filter(Boolean);
			parts.push(
				<div key={key} style={{ marginTop: "12px", padding: "8px", background: "#f5f5f5", borderRadius: "6px" }}>
					<strong style={{ fontSize: "12px" }}>{title}</strong>
					{lines.map((line, i) => <p key={i} style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>{line}</p>)}
				</div>
			);
		});
	}
	if (analysis.strategies) {
		const s = analysis.strategies;
		parts.push(<div key="strat" style={{ marginTop: "12px" }}><strong style={{ fontSize: "12px" }}>策略建議</strong></div>);
		if (s.officeLayout) {
			parts.push(<p key="office" style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>辦公室：{s.officeLayout.description || s.officeLayout.details}</p>);
			if (s.officeLayout.warning) parts.push(<p key="officeW" style={{ margin: "2px 0", fontSize: "10px", color: "#555" }}>{s.officeLayout.warning}</p>);
		}
		if (s.annualStrategy) {
			parts.push(<p key="annual" style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>流年：{s.annualStrategy.description || s.annualStrategy.benefit}</p>);
		}
		if (s.lifelongTaboo?.warning) parts.push(<p key="taboo" style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>終身禁忌：{s.lifelongTaboo.warning}</p>);
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
