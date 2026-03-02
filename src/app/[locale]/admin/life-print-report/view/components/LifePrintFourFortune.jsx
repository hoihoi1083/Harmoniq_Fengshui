"use client";

/**
 * Pages 9–12: 四大運勢 — one full A4 page per section (same structure as web)
 * Page 9: 健康運勢
 * Page 10: 事業運勢
 * Page 11: 財運運勢
 * Page 12: 感情運勢
 */
const SECTION_COLORS = { health: "#088C6E", career: "#0A58A6", wealth: "#D9B815", relationship: "#E52E5C" };
const SECTION_TITLES = { health: "健康運勢", career: "事業運勢", wealth: "財運運勢", relationship: "感情運勢" };
const SECTION_ORDER = ["health", "career", "wealth", "relationship"];

function isErrorResponse(analysis) {
	if (!analysis || typeof analysis !== "object") return true;
	if (analysis.response && !analysis.summary && !analysis.systems) return true;
	return false;
}

function renderHealthContent(analysis) {
	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	if (analysis.systems && typeof analysis.systems === "object") {
		["腎骨系統核心", "代謝循環特質", "神經免疫平衡"].forEach((key) => {
			const sys = analysis.systems[key];
			if (!sys?.content) return;
			const c = sys.content;
			parts.push(
				<div key={key} style={{ marginTop: "8px", padding: "6px", background: "#f5f5f5", borderRadius: "6px" }}>
					<strong style={{ fontSize: "11px" }}>{sys.title || key}</strong>
					{c.description && <p style={{ margin: "2px 0", fontSize: "10px", lineHeight: 1.5 }}>{c.description}</p>}
					{c.advantages && <p style={{ margin: "2px 0", fontSize: "10px" }}>優勢：{c.advantages}</p>}
					{c.risks && Array.isArray(c.risks) && <p style={{ margin: "2px 0", fontSize: "10px" }}>風險：{c.risks.map((r) => (r.period ? `${r.period}: ` : "") + (r.description || "")).join("；")}</p>}
					{c.keyYears && <p style={{ margin: "2px 0", fontSize: "10px" }}>關鍵年份：{c.keyYears}</p>}
					{c.bloodCharacteristics && <p style={{ margin: "2px 0", fontSize: "10px" }}>血液：{c.bloodCharacteristics}</p>}
					{c.digestiveFeatures && <p style={{ margin: "2px 0", fontSize: "10px" }}>消化：{c.digestiveFeatures}</p>}
					{c.skinConcerns && <p style={{ margin: "2px 0", fontSize: "10px" }}>皮膚：{c.skinConcerns}</p>}
					{c.mentalState && <p style={{ margin: "2px 0", fontSize: "10px" }}>心神：{c.mentalState}</p>}
					{c.immuneSystem && <p style={{ margin: "2px 0", fontSize: "10px" }}>免疫：{c.immuneSystem}</p>}
				</div>
			);
		});
	}
	const regimen = analysis.careRegimen || analysis.advice;
	if (regimen) {
		parts.push(
			<div key="regimen" style={{ marginTop: "8px", fontSize: "10px", lineHeight: 1.5 }}>
				{regimen.diet && <p>飲食：{regimen.diet}</p>}
				{regimen.exercise && <p>運動：{regimen.exercise}</p>}
				{regimen.acupoints && <p>穴位：{regimen.acupoints}</p>}
				{regimen.lifeStageReminder && <p>大運提醒：{regimen.lifeStageReminder}</p>}
			</div>
		);
	}
	return parts;
}

function renderCareerContent(analysis) {
	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	if (analysis.talents && typeof analysis.talents === "object") {
		Object.entries(analysis.talents).forEach(([key, val]) => {
			if (!val?.content) return;
			const c = val.content;
			const title = val.title || key;
			// 天賦特質解碼: content is array of { name, description, attention }
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
			// 二十年黃金賽道: content is { periods: [{ years, luck, action, bestYear, warning }] }
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
			// 權力巔峰標誌: content is { peakYear, peakDescription, bestPartners, avoidIndustries }
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
	return parts;
}

function renderWealthContent(analysis) {
	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	// API returns threeStages (奠基期 / 爆發期 / 守成期), not phases
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
					{/* 奠基期 has phase1, phase2 */}
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
					{/* 爆發期 / 守成期: description, keyYear, industries, peakYear, avoidIndustries */}
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
	return parts;
}

function renderRelationshipContent(analysis) {
	const parts = [];
	if (analysis.summary?.description) {
		parts.push(<p key="sum-desc" style={{ margin: "4px 0 10px", fontSize: "12px", lineHeight: 1.7 }}>{analysis.summary.description}</p>);
	}
	// API returns authenticity (正緣特徵): profession, ageGap, meetingChance
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
	// API returns romanticCycles (三大情劫週期): 25歲前, 35歲危機, 45歲波動
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
	// sections / talents (if present from other API shape)
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
	// marriageRules: bestYear, taboos (financial + frequency), childrenFate
	if (analysis.marriageRules) {
		const m = analysis.marriageRules;
		parts.push(<div key="marriage-head" style={{ marginTop: "12px", fontWeight: 700, fontSize: "12px" }}>婚姻法則</div>);
		if (m.bestYear?.description) parts.push(<div key="bestYear" style={{ marginTop: "8px", padding: "8px", background: "#fafafa", borderRadius: "6px" }}><strong>最佳婚年</strong>：{m.bestYear.year} — {m.bestYear.description}</div>);
		if (m.taboos?.financial?.description) parts.push(<p key="tabooF" style={{ margin: "6px 0", fontSize: "11px", lineHeight: 1.6 }}><strong>{m.taboos.financial.title}</strong>：{m.taboos.financial.description}</p>);
		if (m.taboos?.frequency?.description) parts.push(<p key="tabooFr" style={{ margin: "4px 0", fontSize: "11px", lineHeight: 1.6 }}><strong>{m.taboos.frequency.title}</strong>：{m.taboos.frequency.description}</p>);
		if (m.childrenFate?.description) parts.push(<div key="child" style={{ marginTop: "8px", padding: "6px", background: "#fafafa" }}><strong>子女緣</strong>{m.childrenFate.timing && `（${m.childrenFate.timing}）`}：{m.childrenFate.description}</div>);
	}
	return parts;
}

function renderAnalysisContent(fortuneType, analysis) {
	if (isErrorResponse(analysis)) return null;
	switch (fortuneType) {
		case "health": return renderHealthContent(analysis);
		case "career": return renderCareerContent(analysis);
		case "wealth": return renderWealthContent(analysis);
		case "relationship": return renderRelationshipContent(analysis);
		default: {
			if (analysis.summary?.description) return <p style={{ fontSize: "11px", lineHeight: 1.6 }}>{analysis.summary.description}</p>;
			return null;
		}
	}
}

export default function LifePrintFourFortune({ fourFortuneData }) {
	if (!fourFortuneData || typeof fourFortuneData !== "object") return null;

	const pageStyle = {
		width: "210mm",
		minHeight: "297mm",
		maxWidth: "210mm",
		padding: "15mm 18mm",
		boxSizing: "border-box",
		backgroundColor: "#fff",
	};

	// One full A4 page per section: 健康 → 事業 → 財運 → 感情
	return (
		<>
			{SECTION_ORDER.map((key) => {
				const data = fourFortuneData[key] || fourFortuneData[`${key}FortuneData`];
				const analysis = data?.analysis || data;
				if (!analysis || isErrorResponse(analysis)) return null;
				const title = SECTION_TITLES[key];
				const color = SECTION_COLORS[key];
				const summaryTitle = analysis.summary?.title;
				const body = renderAnalysisContent(key, analysis);
				if (!summaryTitle && !body) return null;
				return (
					<div key={key} className="bg-white page-break" style={pageStyle}>
						<h2 style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 800, fontSize: "20px", color, marginBottom: "8px", borderBottom: `3px solid ${color}`, paddingBottom: "6px" }}>
							{title}
						</h2>
						{summaryTitle && <p style={{ fontWeight: 700, fontSize: "14px", color: "#333", marginBottom: "10px" }}>{summaryTitle}</p>}
						<div style={{ fontFamily: "Noto Sans HK, sans-serif", color: "#333" }}>
							{body}
						</div>
					</div>
				);
			})}
		</>
	);
}
