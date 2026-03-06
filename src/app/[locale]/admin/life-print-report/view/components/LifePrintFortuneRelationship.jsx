"use client";

/**
 * Page: 感情運勢 — one full A4 page
 */
const COLOR = "#E52E5C";
const TITLE = "感情運勢";
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

export default function LifePrintFortuneRelationship({ data }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	if (analysis.authenticity && typeof analysis.authenticity === "object") {
		parts.push(<div key="auth-head" style={{ marginTop: "12px", fontWeight: 700, fontSize: "12px" }}>正緣特徵三重認證</div>);
		["profession", "ageGap", "meetingChance"].forEach((k) => {
			const val = analysis.authenticity[k];
			if (!val?.description) return;
			const title = val.title || k;
			parts.push(
				<div key={`auth-${k}`} style={{ marginTop: "8px", padding: "8px", background: "#f5f5f5", borderRadius: "6px" }}>
					<strong style={{ fontSize: "12px" }}>{title}</strong>
					<p style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>{val.description}</p>
					{val.warning && <p style={{ margin: "2px 0", fontSize: "10px", color: "#555" }}>注意：{val.warning}</p>}
				</div>
			);
		});
	}
	if (analysis.romanticCycles && typeof analysis.romanticCycles === "object") {
		parts.push(<div key="cycles-head" style={{ marginTop: "12px", fontWeight: 700, fontSize: "12px" }}>三大情劫週期</div>);
		Object.entries(analysis.romanticCycles).forEach(([key, cycle]) => {
			if (!cycle) return;
			parts.push(
				<div key={`cycle-${key}`} style={{ marginTop: "8px", padding: "8px", background: "#fafafa", borderRadius: "6px" }}>
					<strong style={{ fontSize: "12px" }}>{cycle.period || key}</strong>
					{cycle.fortune && <span style={{ fontSize: "11px", color: "#555", marginLeft: "6px" }}>{cycle.fortune}</span>}
					{cycle.dangerousYear && <p style={{ margin: "4px 0 2px", fontSize: "11px" }}>危險流年：{cycle.dangerousYear}</p>}
					{cycle.crisis && <p style={{ margin: "2px 0", fontSize: "11px", lineHeight: 1.6 }}>危機：{cycle.crisis}</p>}
					{cycle.solution && <p style={{ margin: "2px 0", fontSize: "11px", lineHeight: 1.6 }}>化解：{cycle.solution}</p>}
				</div>
			);
		});
	}
	if (analysis.sections && typeof analysis.sections === "object") {
		Object.entries(analysis.sections).forEach(([key, val]) => {
			if (!val?.content) return;
			const c = val.content;
			const text = c.description || (typeof c === "string" ? c : "");
			parts.push(
				<div key={key} style={{ marginTop: "12px", padding: "8px", background: "#f5f5f5", borderRadius: "6px" }}>
					<strong style={{ fontSize: "12px" }}>{val.title || key}</strong>
					<p style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}>{text}</p>
				</div>
			);
		});
	}
	if (analysis.talents && typeof analysis.talents === "object") {
		Object.entries(analysis.talents).forEach(([key, val]) => {
			const content = val?.content;
			if (!content) return;
			if (Array.isArray(content)) {
				content.forEach((x, i) => {
					parts.push(<p key={`${key}-${i}`} style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}><strong>{x.name || val.title}：</strong>{x.description}</p>);
				});
			} else {
				parts.push(<div key={key} style={{ marginTop: "8px", fontSize: "11px", lineHeight: 1.6 }}><strong>{val.title || key}</strong>：{content.description || ""}</div>);
			}
		});
	}
	if (analysis.marriageRules) {
		const m = analysis.marriageRules;
		parts.push(<div key="marriage-head" style={{ marginTop: "12px", fontWeight: 700, fontSize: "12px" }}>婚姻法則</div>);
		if (m.bestYear?.description) parts.push(<div key="bestYear" style={{ marginTop: "8px", padding: "8px", background: "#fafafa", borderRadius: "6px" }}><strong>最佳婚年</strong>：{m.bestYear.year} — {m.bestYear.description}</div>);
		if (m.taboos?.financial?.description) parts.push(<p key="tabooF" style={{ margin: "6px 0", fontSize: "11px", lineHeight: 1.6 }}><strong>{m.taboos.financial.title}</strong>：{m.taboos.financial.description}</p>);
		if (m.taboos?.frequency?.description) parts.push(<p key="tabooFr" style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}><strong>{m.taboos.frequency.title}</strong>：{m.taboos.frequency.description}</p>);
		if (m.childrenFate?.description) parts.push(<div key="child" style={{ marginTop: "8px", padding: "6px", background: "#fafafa" }}><strong>子女緣</strong>{m.childrenFate.timing && `（${m.childrenFate.timing}）`}：{m.childrenFate.description}</div>);
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
