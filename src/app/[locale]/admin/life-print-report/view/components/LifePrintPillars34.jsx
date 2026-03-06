"use client";

/**
 * Page 3: 年柱 + 月柱 (四柱排盤解析) — design matches reference: title + 天干/地支 labels (element colors), two columns, 總結 box.
 * Page 4: 日柱 + 時柱 (same layout)
 * Data: reportDocData { nianzhuData, yuezhuData, rizhuData, shizhuData }
 * Content keys: 天干XX (e.g. 天干己土), 地支XX (e.g. 地支卯木), 综合XX or 總結 for summary.
 */
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
};

const WUXING_PILLAR_COLORS = {
	金: "#B2A062",
	木: "#567156",
	水: "#939393",
	火: "#B4003C",
	土: "#D09900",
};

function getPillarContentObject(pillarData) {
	if (!pillarData) return null;
	const arr = Array.isArray(pillarData) ? pillarData : [pillarData];
	const content = arr[0];
	return typeof content === "object" && content !== null ? content : null;
}

function parsePillarContent(content, labelOverride) {
	if (!content) return null;
	const keys = Object.keys(content);
	const tianganKey = keys.find((k) => k.startsWith("天干"));
	const dizhiKey = keys.find((k) => k.startsWith("地支"));
	// Summary: 總結/总结, or 综合/綜合 (API uses 综合${stemElement}${branchElement} e.g. 综合土木)
	const summaryKey =
		keys.find((k) => k === "總結" || k === "总结") ||
		keys.find((k) => k.includes("综合") || k.includes("綜合")) ||
		keys.find((k) => k.includes("結") || k.includes("结")) ||
		// Fallback: any other key (third paragraph) that is not 天干* or 地支*
		keys.find((k) => k !== tianganKey && k !== dizhiKey && typeof content[k] === "string" && content[k].length > 20);
	if (!tianganKey || !dizhiKey) return null;
	const stemElement = tianganKey.slice(-1);
	const branchElement = dizhiKey.slice(-1);
	const summaryText = summaryKey ? content[summaryKey] : "";
	return {
		tianganLabel: labelOverride?.tianganLabel ?? tianganKey,
		dizhiLabel: labelOverride?.dizhiLabel ?? dizhiKey,
		stemColor: WUXING_PILLAR_COLORS[stemElement] || "#5A5A5A",
		branchColor: WUXING_PILLAR_COLORS[branchElement] || "#5A5A5A",
		stemText: content[tianganKey],
		branchText: content[dizhiKey],
		summaryText: typeof summaryText === "string" ? summaryText : String(summaryText || ""),
	};
}

function PillarBlockStyled({ title, pillarData, labelOverride }) {
	const content = getPillarContentObject(pillarData);
	const parsed = parsePillarContent(content, labelOverride);
	if (!parsed) return null;
	const {
		tianganLabel,
		dizhiLabel,
		stemColor,
		branchColor,
		stemText,
		branchText,
		summaryText,
	} = parsed;

	// Fix mistaken "年柱" in summary: content/DB often has 年柱 for every pillar; show correct 月柱/日柱/時柱
	const displaySummaryText =
		title === "年柱"
			? summaryText
			: summaryText.replace("年柱", title);

	const labelStyle = (bgColor) => ({
		display: "inline-block",
		padding: "6px 14px",
		borderRadius: "6px",
		fontFamily: "Noto Serif TC, serif",
		fontWeight: 900,
		fontSize: "14px",
		color: "#fff",
		backgroundColor: bgColor,
		textShadow: "0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
		marginLeft: "10px",
	});

	return (
		<div style={{ marginBottom: "28px" }}>
			{/* Title row: pillar name + 天干 label + 地支 label */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					marginBottom: "14px",
				}}
			>
				<div
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 900,
						fontSize: "28px",
						color: "#2d2d2d",
						textShadow: "0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
					}}
				>
					{title}
				</div>
				<span style={labelStyle(stemColor)}>{tianganLabel}</span>
				<span style={labelStyle(branchColor)}>{dizhiLabel}</span>
			</div>

			{/* Two columns: 天干 (left), 地支 (right) */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "20px",
					marginBottom: "14px",
				}}
			>
				<div>
					<div
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 900,
							fontSize: "16px",
							color: "#2d2d2d",
							marginBottom: "8px",
						}}
					>
						{tianganLabel}
					</div>
					<p
						style={{
							fontFamily: "Noto Sans TC, sans-serif",
							fontSize: "12px",
							lineHeight: 1.8,
							color: "#424242",
							margin: 0,
							textAlign: "justify",
						}}
					>
						{typeof stemText === "string" ? stemText : String(stemText || "")}
					</p>
				</div>
				<div>
					<div
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 900,
							fontSize: "16px",
							color: "#2d2d2d",
							marginBottom: "8px",
						}}
					>
						{dizhiLabel}
					</div>
					<p
						style={{
							fontFamily: "Noto Sans TC, sans-serif",
							fontSize: "12px",
							lineHeight: 1.8,
							color: "#424242",
							margin: 0,
							textAlign: "justify",
						}}
					>
						{typeof branchText === "string" ? branchText : String(branchText || "")}
					</p>
				</div>
			</div>

			{/* 總結: vertical label + light grey box */}
			{displaySummaryText && (
				<div
					style={{
						display: "flex",
						alignItems: "stretch",
						gap: "12px",
					}}
				>
					<div
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 900,
							fontSize: "22px",
							color: "#2d2d2d",
							writingMode: "vertical-rl",
							textOrientation: "mixed",
							letterSpacing: "0.2em",
							textShadow: "0.5px 0 0 currentColor, -0.5px 0 0 currentColor",
							flexShrink: 0,
						}}
					>
						總結
					</div>
					<div
						style={{
							flex: 1,
							backgroundColor: "#f0f0f0",
							borderRadius: "8px",
							padding: "14px 16px",
						}}
					>
						<p
							style={{
								fontFamily: "Noto Sans TC, sans-serif",
								fontSize: "12px",
								lineHeight: 1.8,
								color: "#424242",
								margin: 0,
								textAlign: "justify",
							}}
						>
							{displaySummaryText}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

function buildPillarLabels(wuxingData, pillar) {
	if (!wuxingData) return null;
	const map = {
		年柱: {
			stem: wuxingData.yearStem,
			stemWuxing: wuxingData.yearStemWuxing,
			branch: wuxingData.yearBranch,
			branchWuxing: wuxingData.yearBranchWuxing,
		},
		月柱: {
			stem: wuxingData.monthStem,
			stemWuxing: wuxingData.monthStemWuxing,
			branch: wuxingData.monthBranch,
			branchWuxing: wuxingData.monthBranchWuxing,
		},
		日柱: {
			stem: wuxingData.dayStem,
			stemWuxing: wuxingData.dayStemWuxing,
			branch: wuxingData.dayBranch,
			branchWuxing: wuxingData.dayBranchWuxing,
		},
		時柱: {
			stem: wuxingData.hourStem,
			stemWuxing: wuxingData.hourStemWuxing,
			branch: wuxingData.hourBranch,
			branchWuxing: wuxingData.hourBranchWuxing,
		},
	};
	const p = map[pillar];
	if (!p?.stem || !p?.branch) return null;
	return {
		tianganLabel: `天干${p.stem}${p.stemWuxing}`,
		dizhiLabel: `地支${p.branch}${p.branchWuxing}`,
	};
}

export default function LifePrintPillars34({ reportDocData, wuxingData }) {
	if (!reportDocData) return null;
	const { nianzhuData, yuezhuData, rizhuData, shizhuData } = reportDocData;
	const nianEntries = Object.entries(nianzhuData || {});
	const yueEntries = Object.entries(yuezhuData || {});
	const riEntries = Object.entries(rizhuData || {});
	const shiEntries = Object.entries(shizhuData || {});

	const nianContent = nianEntries[0]?.[1];
	const yueContent = yueEntries[0]?.[1];
	const riContent = riEntries[0]?.[1];
	const shiContent = shiEntries[0]?.[1];

	return (
		<>
			{/* Page 3: 年柱 + 月柱 — 四柱排盤解析 */}
			<div className="bg-white page-break" style={PAGE_STYLE}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "20px",
					}}
				>
					<h2
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 900,
							fontSize: "24px",
							color: "#2d2d2d",
							margin: 0,
						}}
					>
						四柱排盤解析
					</h2>
					<span
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontSize: "14px",
							color: "#424242",
							fontWeight: 500,
						}}
					>
						3
					</span>
				</div>
				<PillarBlockStyled
					title="年柱"
					pillarData={nianContent}
					labelOverride={buildPillarLabels(wuxingData, "年柱")}
				/>
				<PillarBlockStyled
					title="月柱"
					pillarData={yueContent}
					labelOverride={buildPillarLabels(wuxingData, "月柱")}
				/>
			</div>
			{/* Page 4: 日柱 + 時柱 */}
			<div className="bg-white page-break" style={PAGE_STYLE}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "20px",
					}}
				>
					<h2
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 900,
							fontSize: "24px",
							color: "#2d2d2d",
							margin: 0,
						}}
					>
						四柱排盤解析（續）
					</h2>
					<span
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontSize: "14px",
							color: "#424242",
							fontWeight: 500,
						}}
					>
						4
					</span>
				</div>
				<PillarBlockStyled
					title="日柱"
					pillarData={riContent}
					labelOverride={buildPillarLabels(wuxingData, "日柱")}
				/>
				<PillarBlockStyled
					title="時柱"
					pillarData={shiContent}
					labelOverride={buildPillarLabels(wuxingData, "時柱")}
				/>
			</div>
		</>
	);
}
