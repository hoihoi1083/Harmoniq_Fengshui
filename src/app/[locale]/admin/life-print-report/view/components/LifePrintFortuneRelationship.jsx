"use client";

import LifePrintPageDateFooter from "./LifePrintPageDateFooter";

/**
 * Relationship Fortune — 2 pages, design aligned with career (title bar, vertical section, table, numbered sub-headings)
 * Page 1: 感情運勢分析, summary bar + quote, 正緣特徵三重認證 (01/02/03 two-column)
 * Page 2: 三大情劫週期 (table), 婚姻法則 (01/02/03), 子女緣
 */
const RELATIONSHIP_RED = "#C41E3A";
const TEXT_DARK = "#2d2d2d";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
	position: "relative",
};

function isErrorResponse(analysis) {
	if (!analysis || typeof analysis !== "object") return true;
	if (analysis.response && !analysis.summary && !analysis.authenticity)
		return true;
	return false;
}

function stripBold(s) {
	if (s == null) return s;
	return typeof s === "string" ? s.replace(/\*\*/g, "") : s;
}

/** Full-width title bar: red background, white text */
function TitleBar({ children }) {
	return (
		<div
			style={{
				width: "50%",
				backgroundColor: RELATIONSHIP_RED,
				color: "#fff",
				fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				fontWeight: 700,
				fontSize: "17px",
				textAlign: "center",
				padding: "5px 12px",
				marginBottom: "12px",
				margin: "20px 0 20px 0",
				WebkitPrintColorAdjust: "exact",
				printColorAdjust: "exact",
			}}
		>
			{children}
		</div>
	);
}

/** Section title (red) + optional description; optional two-column for children */
function SectionVertical({ title, description, twoColumns, children }) {
	return (
		<div style={{ marginBottom: "18px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "stretch",
					marginBottom: description ? "5px" : "5px",
					gap: 0,
				}}
			>
				<span
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						fontSize: "30px",
						color: RELATIONSHIP_RED,
						letterSpacing: "0.2em",
						lineHeight: 1.4,
						flexShrink: 0,
					}}
				>
					{title}
				</span>
				{description && (
					<>
						<div
							style={{
								width: "1px",
								minHeight: "1em",
								backgroundColor: TEXT_DARK,
								margin: "0 14px",
								flexShrink: 0,
							}}
						/>
						<p
							style={{
								fontSize: "13px",
								lineHeight: 1.2,
								color: TEXT_DARK,
								margin: 0,
								fontFamily: "Noto Sans HK, sans-serif",
								flex: 1,
							}}
						>
							{description}
						</p>
					</>
				)}
			</div>
			{twoColumns ? (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "0 24px",
						alignItems: "start",
					}}
				>
					{children}
				</div>
			) : (
				children
			)}
		</div>
	);
}

/** Numbered sub-heading: red number + dark title (match career: 25px number, 18px title, 6px margins) */
function NumberedSubHeading({ num, title }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "baseline",
				gap: "6px",
				marginTop: "6px",
				marginBottom: "6px",
			}}
		>
			<span
				style={{
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 700,
					fontSize: "25px",
					color: RELATIONSHIP_RED,
				}}
			>
				{num}
			</span>
			<span
				style={{
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 700,
					fontSize: "18px",
					color: TEXT_DARK,
				}}
			>
				{title}
			</span>
		</div>
	);
}

const bodyText = {
	fontSize: "12px",
	lineHeight: 1.4,
	color: TEXT_DARK,
	fontFamily: "Noto Sans HK, sans-serif",
};

// Order for 正緣: 基本屬性, 年齡差距, 相識契機 (profession, ageGap, meetingChance)
const AUTH_KEYS = [
	{ key: "profession", title: "基本屬性" },
	{ key: "ageGap", title: "年齡差距" },
	{ key: "meetingChance", title: "相識契機" },
];

// Build table rows from romanticCycles (preserve order: 25歲前, 35歲危機, 45歲波動 or first three entries)
function getCycleRows(romanticCycles) {
	if (!romanticCycles || typeof romanticCycles !== "object") return [];
	return Object.entries(romanticCycles)
		.slice(0, 6)
		.map(([k, v]) => ({
			period: v?.period || k,
			fortune: v?.fortune || "",
			keyAction: v?.solution || "",
			riskWarning: [v?.dangerousYear, v?.crisis]
				.filter(Boolean)
				.join(" "),
		}));
}

export default function LifePrintFortuneRelationship({ data, pageNumber }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const summary = analysis.summary || {};
	const authenticity = analysis.authenticity || {};
	const romanticCycles = analysis.romanticCycles || {};
	const marriageRules = analysis.marriageRules || {};

	const summaryTitle = summary.title || "感情運勢";
	const summaryDesc = summary.description;

	const cycleRows = getCycleRows(romanticCycles);
	const bestYear = marriageRules.bestYear;
	const taboos = marriageRules.taboos || {};
	const childrenFate = marriageRules.childrenFate;

	// Page 1: title, summary bar + quote, 正緣特徵三重認證 (two-column)
	const hasAuth = AUTH_KEYS.some(({ key }) => authenticity[key]?.description);
	const hasPage1 = summaryDesc || hasAuth;

	const page1 = hasPage1 ? (
		<div
			key="relation-p1"
			className="bg-white page-break"
			style={PAGE_STYLE}
		>
			<LifePrintPageDateFooter />
			{pageNumber != null && (
				<div
					style={{
						position: "absolute",
						top: "15mm",
						right: "18mm",
						fontSize: "11px",
						color: TEXT_DARK,
						fontFamily: '"Noto Sans HK", sans-serif',
					}}
				>
					{pageNumber}
				</div>
			)}
			<h2
				style={{
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 700,
					fontSize: "35px",
					color: RELATIONSHIP_RED,
					marginBottom: "8px",
					letterSpacing: "0.2em",
				}}
			>
				感情運勢分析
			</h2>
			{summaryTitle && <TitleBar>{stripBold(summaryTitle)}</TitleBar>}
			{summaryDesc && (
				<p
					style={{
						...bodyText,
						margin: "20px 0 20px 0",
						paddingLeft: "20px",
						position: "relative",
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					<span
						style={{
							position: "absolute",
							left: "0",
							fontSize: "36px",
							lineHeight: 1,
							color: TEXT_DARK,
							fontFamily: "Noto Serif TC, serif",
						}}
						aria-hidden
					>
						"
					</span>
					{stripBold(summaryDesc)}
				</p>
			)}

			{/* 正緣特徵三重認證 */}
			{hasAuth && (
				<SectionVertical title="正緣特徵三重認證" twoColumns>
					{AUTH_KEYS.map(({ key, title }, i) => {
						const item = authenticity[key];
						if (!item?.description) return null;
						return (
							<div key={key} style={{ marginBottom: "14px" }}>
								<NumberedSubHeading
									num={String(i + 1).padStart(2, "0")}
									title={stripBold(item.title) || title}
								/>
								<p
									style={{
										...bodyText,
										margin: "0 0 6px 0",
									}}
								>
									{stripBold(item.description)}
								</p>
								{item.warning && (
									<p
										style={{
											...bodyText,
											margin: 0,
											fontWeight: 600,
										}}
									>
										注意：{stripBold(item.warning)}
									</p>
								)}
							</div>
						);
					})}
				</SectionVertical>
			)}
		</div>
	) : null;

	// Page 2: 三大情劫週期 table, 婚姻法則, 子女緣
	const hasPage2 =
		cycleRows.length > 0 ||
		bestYear ||
		taboos.financial ||
		taboos.frequency ||
		childrenFate;

	const page2 = hasPage2 ? (
		<div
			key="relation-p2"
			className="bg-white page-break"
			style={PAGE_STYLE}
		>
			<LifePrintPageDateFooter />
			{pageNumber != null && (
				<div
					style={{
						position: "absolute",
						top: "15mm",
						right: "18mm",
						fontSize: "11px",
						color: TEXT_DARK,
						fontFamily: '"Noto Sans HK", sans-serif',
					}}
				>
					{typeof pageNumber === "string" && pageNumber.includes("/")
						? pageNumber.replace(/^\d+/, (m) =>
								String(parseInt(m, 10) + 1),
							)
						: pageNumber}
				</div>
			)}

			{/* 三大情劫週期 — table */}
			{cycleRows.length > 0 && (
				<div style={{ marginBottom: "20px" }}>
					<h2
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							fontSize: "30px",
							color: RELATIONSHIP_RED,
							marginBottom: "8px",
							letterSpacing: "0.2em",
						}}
					>
						三大情劫週期
					</h2>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							fontSize: "12px",
							fontFamily: "Noto Sans HK, sans-serif",
						}}
					>
						<thead>
							<tr>
								<th
									style={{
										border: "1px solid #ccc",
										padding: "8px 10px",
										textAlign: "left",
										backgroundColor: "#f5f5f5",
										fontWeight: 700,
										color: TEXT_DARK,
									}}
								>
									時期
								</th>
								<th
									style={{
										border: "1px solid #ccc",
										padding: "8px 10px",
										textAlign: "left",
										backgroundColor: "#f5f5f5",
										fontWeight: 700,
										color: TEXT_DARK,
									}}
								>
									大運
								</th>
								<th
									style={{
										border: "1px solid #ccc",
										padding: "8px 10px",
										textAlign: "left",
										backgroundColor: "#f5f5f5",
										fontWeight: 700,
										color: TEXT_DARK,
									}}
								>
									關鍵動作
								</th>
								<th
									style={{
										border: "1px solid #ccc",
										padding: "8px 10px",
										textAlign: "left",
										backgroundColor: "#f5f5f5",
										fontWeight: 700,
										color: TEXT_DARK,
									}}
								>
									風險預警
								</th>
							</tr>
						</thead>
						<tbody>
							{cycleRows.map((row, i) => (
								<tr key={i}>
									<td
										style={{
											border: "1px solid #ddd",
											padding: "8px 10px",
											verticalAlign: "top",
											color: TEXT_DARK,
										}}
									>
										{stripBold(row.period)}
									</td>
									<td
										style={{
											border: "1px solid #ddd",
											padding: "8px 10px",
											verticalAlign: "top",
											color: TEXT_DARK,
										}}
									>
										{stripBold(row.fortune)}
									</td>
									<td
										style={{
											border: "1px solid #ddd",
											padding: "8px 10px",
											verticalAlign: "top",
											lineHeight: 1.6,
											color: TEXT_DARK,
										}}
									>
										{stripBold(row.keyAction)}
									</td>
									<td
										style={{
											border: "1px solid #ddd",
											padding: "8px 10px",
											verticalAlign: "top",
											lineHeight: 1.6,
											color: TEXT_DARK,
										}}
									>
										{stripBold(row.riskWarning)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* 婚姻法則 */}
			{(bestYear || taboos.financial || taboos.frequency) && (
				<SectionVertical title="婚姻法則">
					{bestYear?.description && (
						<div style={{ marginBottom: "12px" }}>
							<NumberedSubHeading
								num="01"
								title={bestYear.title || "最佳婚年"}
							/>
							<p style={{ ...bodyText, margin: 0 }}>
								{bestYear.year && (
									<>{stripBold(bestYear.year)} — </>
								)}
								{stripBold(bestYear.description)}
							</p>
						</div>
					)}
					{taboos.financial?.description && (
						<div style={{ marginBottom: "12px" }}>
							<NumberedSubHeading
								num="02"
								title={
									stripBold(taboos.financial.title) ||
									"禁止財務共有"
								}
							/>
							<p style={{ ...bodyText, margin: 0 }}>
								{stripBold(taboos.financial.description)}
							</p>
						</div>
					)}
					{taboos.frequency?.description && (
						<div>
							<NumberedSubHeading
								num="03"
								title={
									stripBold(taboos.frequency.title) ||
									"緩解水火相激"
								}
							/>
							<p style={{ ...bodyText, margin: 0 }}>
								{stripBold(taboos.frequency.description)}
							</p>
						</div>
					)}
				</SectionVertical>
			)}

			{/* 子女緣 */}
			{childrenFate && (
				<div style={{ marginBottom: "18px" }}>
					<div
						style={{
							display: "flex",
							alignItems: "stretch",
							marginBottom: "5px",
							gap: 0,
						}}
					>
						<div
							style={{
								width: "4px",
								minHeight: "1.2em",
								backgroundColor: RELATIONSHIP_RED,
								marginRight: "12px",
								flexShrink: 0,
							}}
						/>
						<span
							style={{
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: 700,
								fontSize: "30px",
								color: RELATIONSHIP_RED,
								letterSpacing: "0.2em",
								lineHeight: 1.4,
							}}
						>
							{childrenFate.title || "子女緣"}
						</span>
					</div>
					<p style={{ ...bodyText, margin: 0 }}>
						{childrenFate.timing && (
							<>（{stripBold(childrenFate.timing)}）：</>
						)}{" "}
						{stripBold(childrenFate.description)}
					</p>
				</div>
			)}
		</div>
	) : null;

	if (!hasPage1 && !hasPage2) return null;

	return (
		<>
			{page1}
			{page2}
		</>
	);
}
