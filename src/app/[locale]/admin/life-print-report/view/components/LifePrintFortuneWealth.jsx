"use client";

import LifePrintPageDateFooter from "./LifePrintPageDateFooter";

/**
 * Wealth Fortune — 2 pages, design aligned with health/career (title bar, vertical section titles, numbered sub-headings)
 * Page 1: 財運運勢分析, summary bar + quote, 奠基期 + 爆發期 (two-column sub-sections)
 * Page 2: 守成期, 財富法則 (資產配比, 合作禁忌, 催財方位)
 */
const WEALTH_GOLD = "#B8860B";
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
	if (analysis.response && !analysis.summary && !analysis.threeStages)
		return true;
	return false;
}

/** Full-width title bar: gold/brown background, white text (match health: 17px) */
function TitleBar({ children }) {
	return (
		<div
			style={{
				width: "40%",
				backgroundColor: WEALTH_GOLD,
				color: "#fff",
				fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				fontWeight: 700,
				fontSize: "17px",
				textAlign: "center",
				padding: "5px 12px",
				marginBottom: "12px",
				WebkitPrintColorAdjust: "exact",
				printColorAdjust: "exact",
			}}
		>
			{children}
		</div>
	);
}

/** Section title with vertical bar (gold) + optional description — same pattern as health/career */
function SectionVertical({ title, description, children }) {
	return (
		<div style={{ marginBottom: "18px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "stretch",
					marginBottom: description ? "10px" : "12px",
					gap: 0,
				}}
			>
				<span
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						fontSize: "30px",
						color: WEALTH_GOLD,
						letterSpacing: "0.05em",
						lineHeight: 1.4,
						flexShrink: 0,
					}}
				>
					{title}
				</span>
				{description != null && description !== "" && (
					<>
						<div
							style={{
								width: "1px",
								minHeight: "1.2em",
								backgroundColor: TEXT_DARK,
								margin: "0 14px",
								flexShrink: 0,
							}}
						/>
						<p
							style={{
								fontSize: "13px",
								lineHeight: 1.7,
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
			{children}
		</div>
	);
}

/** Numbered sub-heading: teal/gold number + dark title (match health: 22px number, 18px title) */
function NumberedSubHeading({ num, title }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "baseline",
				gap: "6px",
				marginTop: "12px",
				marginBottom: "6px",
			}}
		>
			<span
				style={{
					fontFamily: "Noto Serif TC, serif",
					fontWeight: 700,
					fontSize: "22px",
					color: WEALTH_GOLD,
				}}
			>
				{num}
			</span>
			<span
				style={{
					fontFamily: "Noto Serif TC, serif",
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

function BulletList({ items }) {
	if (!items || items.length === 0) return null;
	return (
		<ul
			style={{
				margin: "0 0 8px 0",
				paddingLeft: "20px",
				fontSize: "13px",
				lineHeight: 1.75,
				color: TEXT_DARK,
				fontFamily: "Noto Sans HK, sans-serif",
			}}
		>
			{items.map((text, i) => (
				<li key={i} style={{ marginBottom: "4px" }}>
					{text}
				</li>
			))}
		</ul>
	);
}

/** Parse "1. xxx 2. yyy" into array for numbered list */
function parseNumberedItems(text) {
	if (!text || typeof text !== "string") return [];
	const trimmed = text.trim();
	const parts = trimmed
		.split(/\s*\d+[．.]\s*/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	return parts.length > 1 ? parts : [];
}

function NumberedList({ items }) {
	if (!items || items.length === 0) return null;
	return (
		<ol
			style={{
				margin: "0 0 8px 0",
				paddingLeft: "22px",
				fontSize: "13px",
				lineHeight: 1.75,
				color: TEXT_DARK,
				fontFamily: "Noto Sans HK, sans-serif",
			}}
		>
			{items.map((text, i) => (
				<li key={i} style={{ marginBottom: "6px" }}>
					{text}
				</li>
			))}
		</ol>
	);
}

const bodyText = {
	fontSize: "13px",
	lineHeight: 1.7,
	color: TEXT_DARK,
	fontFamily: "Noto Sans HK, sans-serif",
};

/** Remove markdown ** bold markers from AI content */
function stripBold(s) {
	if (s == null) return s;
	return typeof s === "string" ? s.replace(/\*\*/g, "") : s;
}

export default function LifePrintFortuneWealth({ data, pageNumber }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const summary = analysis.summary || {};
	const stages = analysis.threeStages || analysis.phases || {};
	const rules = analysis.wealthRules || {};

	const foundation = stages["奠基期"];
	const explosive = stages["爆發期"];
	const conservative = stages["守成期"];

	const summaryTitle = summary.title || "財運運勢";
	const summaryDesc = summary.description;

	const assetAlloc = rules.assetAllocation;
	const partnerships = rules.partnerships;
	const wealthDir = rules.wealthDirection;

	// Page 1: title, summary bar + quote, 奠基期, 爆發期 (two-column sub-sections)
	const hasPage1 =
		summaryDesc ||
		(foundation?.content && Object.keys(foundation.content).length > 0) ||
		(explosive?.content && Object.keys(explosive.content).length > 0);

	const page1 = hasPage1 ? (
		<div key="wealth-p1" className="bg-white page-break" style={PAGE_STYLE}>
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
					fontSize: "28px",
					color: WEALTH_GOLD,
					marginBottom: "8px",
					letterSpacing: "0.2em",
					width: "66%",
					paddingBottom: "6px",
				}}
			>
				財運運勢分析
			</h2>
			{summaryDesc && (
				<>
					<TitleBar>{stripBold(summaryTitle)}</TitleBar>
					<p
						style={{
							...bodyText,
							margin: "0 0 20px 0",
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
				</>
			)}

			{/* 奠基期 — title only "奠基期"; age + 大運 in description with age in bold */}
			{foundation?.content && (
				<SectionVertical
					title="奠基期"
					description={
						foundation.ageRange || foundation.fortune ? (
							<>
								{foundation.ageRange && (
									<strong>{foundation.ageRange}</strong>
								)}
								{foundation.fortune
									? ` ${foundation.fortune}`
									: ""}
								{foundation.content.phase1
									? `。${stripBold(
											[
												foundation.content.phase1.name,
												foundation.content.phase1
													.description,
											]
												.filter(Boolean)
												.join(" "),
										)}`
									: foundation.content.description
										? `。${stripBold(foundation.content.description)}`
										: ""}
							</>
						) : foundation.content.phase1 ? (
							stripBold(
								[
									foundation.content.phase1.name,
									foundation.content.phase1.description,
								]
									.filter(Boolean)
									.join(" "),
							)
						) : (
							stripBold(foundation.content.description)
						)
					}
				>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "16px 24px",
						}}
					>
						<div>
							{foundation.content.phase1?.keyYear && (
								<>
									<NumberedSubHeading
										num="01"
										title="關鍵年份"
									/>
									<p style={{ ...bodyText, margin: 0 }}>
										{stripBold(foundation.content.phase1.keyYear)}
									</p>
								</>
							)}
							{foundation.content.phase1?.trapYear && (
								<>
									<NumberedSubHeading
										num="02"
										title="致命陷阱"
									/>
									<p style={{ ...bodyText, margin: 0 }}>
										{stripBold(foundation.content.phase1.trapYear)}
									</p>
								</>
							)}
						</div>
						<div>
							{foundation.content.phase2 && (
								<>
									<NumberedSubHeading
										num="03"
										title="次階段"
									/>
									<p
										style={{
											...bodyText,
											margin: "0 0 6px 0",
										}}
									>
										{stripBold(foundation.content.phase2.name)}
									</p>
									{foundation.content.phase2.description && (
										<p
											style={{
												...bodyText,
												margin: "0 0 6px 0",
											}}
										>
											{stripBold(
												foundation.content.phase2
													.description,
											)}
										</p>
									)}
									{foundation.content.phase2.warning && (
										<p style={{ ...bodyText, margin: 0 }}>
											{stripBold(
												foundation.content.phase2
													.warning,
											)}
										</p>
									)}
								</>
							)}
						</div>
					</div>
				</SectionVertical>
			)}

			{/* 爆發期 — title only "爆發期"; age + 大運 in description with age in bold */}
			{explosive?.content && (
				<SectionVertical
					title="爆發期"
					description={
						explosive.ageRange || explosive.fortune ? (
							<>
								{explosive.ageRange && (
									<strong>{explosive.ageRange}</strong>
								)}
								{explosive.fortune
									? ` ${explosive.fortune}`
									: ""}
								{explosive.content.description
									? `。${stripBold(explosive.content.description)}`
									: ""}
							</>
						) : (
							stripBold(explosive.content.description)
						)
					}
				>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "16px 24px",
						}}
					>
						<div>
							{explosive.content.keyYear && (
								<>
									<NumberedSubHeading
										num="01"
										title="關鍵年份"
									/>
									<p style={{ ...bodyText, margin: 0 }}>
										{stripBold(explosive.content.keyYear)}
									</p>
								</>
							)}
							{explosive.content.industries && (
								<>
									<NumberedSubHeading
										num="02"
										title="核心領域"
									/>
									<p style={{ ...bodyText, margin: 0 }}>
										{stripBold(
											explosive.content.industries.replace(
												/^核心領域[：:]\s*/,
												"",
											),
										)}
									</p>
								</>
							)}
						</div>
						<div>
							{explosive.content.peakYear && (
								<>
									<NumberedSubHeading
										num="03"
										title="財富峰值"
									/>
									<p style={{ ...bodyText, margin: 0 }}>
										{stripBold(
											explosive.content.peakYear.replace(
												/^財富峰值[：:]\s*/,
												"",
											),
										)}
									</p>
								</>
							)}
						</div>
					</div>
				</SectionVertical>
			)}
		</div>
	) : null;

	// Page 2: 守成期, 財富法則 (資產配比, 合作禁忌, 催財方位)
	const hasPage2 =
		conservative?.content || assetAlloc || partnerships || wealthDir;

	const page2 = hasPage2 ? (
		<div key="wealth-p2" className="bg-white page-break" style={PAGE_STYLE}>
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

			{/* 守成期 — title only "守成期"; age + 大運 in description with age in bold */}
			{conservative?.content && (
				<SectionVertical
					title="守成期"
					description={
						conservative.ageRange || conservative.fortune ? (
							<>
								{conservative.ageRange && (
									<strong>{conservative.ageRange}</strong>
								)}
								{conservative.fortune
									? ` ${conservative.fortune}`
									: ""}
								{conservative.content.description
									? `。${stripBold(conservative.content.description)}`
									: ""}
							</>
						) : (
							stripBold(conservative.content.description)
						)
					}
				>
							{conservative.content.keyYear && (
						<div style={{ marginBottom: "12px" }}>
							<NumberedSubHeading num="01" title="關鍵年份" />
							<p style={{ ...bodyText, margin: 0 }}>
								{stripBold(conservative.content.keyYear)}
							</p>
						</div>
					)}
					{conservative.content.avoidIndustries && (
						<div>
							<NumberedSubHeading num="02" title="忌諱產業" />
							<p style={{ ...bodyText, margin: 0 }}>
								{stripBold(
									conservative.content.avoidIndustries.replace(
										/^忌諱產業[：:]\s*/,
										"",
									),
								)}
							</p>
						</div>
					)}
				</SectionVertical>
			)}

			{/* 財富法則 */}
			{(assetAlloc || partnerships || wealthDir) && (
				<div>
					<div
						style={{
							display: "flex",
							alignItems: "stretch",
							marginBottom: "16px",
							gap: 0,
						}}
					>
						<h3
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 700,
								fontSize: "30px",
								color: WEALTH_GOLD,
								lineHeight: 1.4,
								margin: 0,
							}}
						>
							財富法則
						</h3>
					</div>
					{assetAlloc && (
						<div style={{ marginBottom: "14px" }}>
							<NumberedSubHeading
								num="01"
								title={assetAlloc.title || "資產配比"}
							/>
							{(() => {
								const parts = [
									assetAlloc.realEstate,
									assetAlloc.preciousMetals,
									assetAlloc.cash,
								].filter(Boolean);
								const text = stripBold(parts.join("；"));
								const items = parseNumberedItems(text);
								return items.length > 1 ? (
									<NumberedList
										items={items.map((t) => stripBold(t))}
									/>
								) : (
									<p style={{ ...bodyText, margin: 0 }}>
										{text}
									</p>
								);
							})()}
						</div>
					)}
					{partnerships && (
						<div style={{ marginBottom: "14px" }}>
							<NumberedSubHeading
								num="02"
								title={partnerships.title || "合作禁忌"}
							/>
							<BulletList
								items={[
									partnerships.zodiacA &&
										stripBold(
											`${partnerships.zodiacA.animal}：${partnerships.zodiacA.description}`,
										),
									partnerships.zodiacB &&
										stripBold(
											`${partnerships.zodiacB.animal}：${partnerships.zodiacB.description}`,
										),
								].filter(Boolean)}
							/>
						</div>
					)}
					{wealthDir && (
						<div>
							<NumberedSubHeading
								num="03"
								title={wealthDir.title || "催財方位"}
							/>
							<p style={{ ...bodyText, margin: "0 0 6px 0" }}>
								{stripBold(wealthDir.location)} —{" "}
								{stripBold(wealthDir.description)}
							</p>
							{wealthDir.warning && (
								<p
									style={{
										...bodyText,
										margin: 0,
										fontWeight: 600,
									}}
								>
									{stripBold(wealthDir.warning)}
								</p>
							)}
						</div>
					)}
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
