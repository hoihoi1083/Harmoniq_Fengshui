"use client";

/**
 * Career Fortune — 2 pages, design aligned with health (title bar, vertical section titles, teal numbered sub-headings)
 * Page 1: 事業運勢分析, summary bar + quote + description, 天賦特質解碼 (01/02/03)
 * Page 2: 二十年黃金賽道 (table), 權力巔峰標誌 (01/02), 策略建議 (辦公室, 01 禁忌事項, 02 流年, 終身禁忌)
 */
const CAREER_BLUE = "#0A58A6";
const TEAL = "#088C6E";
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
	if (analysis.response && !analysis.summary && !analysis.talents)
		return true;
	return false;
}

/** Full-width title bar: career blue background, white text (match health: 17px) */
function TitleBar({ children }) {
	return (
		<div
			style={{
				width: "40%",
				backgroundColor: CAREER_BLUE,
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

/** Vertical section title (dark blue) + optional description on the right; points can be in two columns */
function SectionVertical({ title, description, twoColumns, children }) {
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
						fontSize: "35px",
						color: CAREER_BLUE,
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

/** Numbered sub-heading: teal number + dark title (match health: 22px number, 18px title) */
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
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 700,
					fontSize: "25px",
					color: CAREER_BLUE,
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

export default function LifePrintFortuneCareer({ data, pageNumber }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const summary = analysis.summary || {};
	const talents = analysis.talents || {};
	const strategies = analysis.strategies || {};

	const tianfu = talents["天賦特質解碼"];
	const goldenTrack = talents["二十年黃金賽道"];
	const powerPeak = talents["權力巔峰標誌"];

	const summaryTitle = summary.title || "事業運勢";
	const summaryDesc = summary.description;

	// 天賦特質解碼: content can be array of { name, description, attention } or single object/string
	const tianfuContent = tianfu?.content;
	const tianfuItems = Array.isArray(tianfuContent)
		? tianfuContent
		: tianfuContent &&
			  typeof tianfuContent === "object" &&
			  !tianfuContent.periods
			? [tianfuContent]
			: typeof tianfuContent === "string"
				? [{ description: tianfuContent }]
				: [];

	// 二十年黃金賽道: periods array for table
	const periods = goldenTrack?.content?.periods || [];

	// Page 1
	const page1 = (
		<div key="career-p1" className="bg-white page-break" style={PAGE_STYLE}>
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
					color: CAREER_BLUE,
					marginBottom: "8px",
					letterSpacing: "0.2em",
				}}
			>
				事業運勢分析
			</h2>

			{summaryTitle && <TitleBar>{summaryTitle}</TitleBar>}
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
					{summaryDesc}
				</p>
			)}

			{/* 天賦特質解碼: title + optional section description (to the right of title), then 01/02/03 items in two columns */}
			{tianfu && (
				<SectionVertical
					title={tianfu.title || "天賦特質解碼"}
					description={tianfu.description ?? tianfu.intro}
					twoColumns
				>
					{tianfuItems.map((item, i) => {
						const name =
							typeof item === "object" ? item.name : null;
						const desc =
							typeof item === "object"
								? item.description
								: String(item);
						const attention =
							typeof item === "object" ? item.attention : null;
						const title =
							name ||
							(typeof item === "object" && item.title) ||
							`項目${i + 1}`;
						return (
							<div key={i} style={{ marginBottom: "14px" }}>
								<NumberedSubHeading
									num={String(i + 1).padStart(2, "0")}
									title={title}
								/>
								{desc && (
									<p
										style={{
											...bodyText,
											margin: "0 0 6px 0",
										}}
									>
										{desc}
									</p>
								)}
								{attention && (
									<p
										style={{
											...bodyText,
											margin: 0,
											fontWeight: 600,
										}}
									>
										注意：{attention}
									</p>
								)}
							</div>
						);
					})}
				</SectionVertical>
			)}
		</div>
	);

	// Page 2: table + 權力巔峰標誌 + 策略建議
	const hasPage2 =
		periods.length > 0 ||
		powerPeak?.content ||
		strategies.officeLayout ||
		strategies.annualStrategy ||
		strategies.lifelongTaboo;

	const page2 = hasPage2 ? (
		<div key="career-p2" className="bg-white page-break" style={PAGE_STYLE}>
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

			{/* 二十年黃金賽道 — table */}
			{periods.length > 0 && (
				<div style={{ marginBottom: "20px" }}>
					<h2
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							fontSize: "35px",
							color: CAREER_BLUE,
							marginBottom: "8px",
							letterSpacing: "0.2em",
						}}
					>
						二十年黃金賽道
					</h2>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							fontSize: "13px",
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
									大運時期
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
									運
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
									特性
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
									對命主的影響
								</th>
							</tr>
						</thead>
						<tbody>
							{periods.map((p, i) => (
								<tr key={i}>
									<td
										style={{
											border: "1px solid #ddd",
											padding: "8px 10px",
											verticalAlign: "top",
											color: TEXT_DARK,
										}}
									>
										{p.years || ""}
									</td>
									<td
										style={{
											border: "1px solid #ddd",
											padding: "8px 10px",
											verticalAlign: "top",
											color: TEXT_DARK,
										}}
									>
										{p.luck || ""}
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
										{[p.action, p.bestYear]
											.filter(Boolean)
											.join(" ")}
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
										{p.warning || ""}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* 權力巔峰標誌 */}
			{powerPeak?.content && (
				<SectionVertical
					title={powerPeak.title || "權力巔峰標誌"}
					description={
						powerPeak.content.peakDescription ||
						powerPeak.content.description
					}
					twoColumns
				>
					{powerPeak.content.bestPartners && (
						<div style={{ marginBottom: "12px" }}>
							<NumberedSubHeading num="01" title="最佳合作" />
							<p style={{ ...bodyText, margin: 0 }}>
								{powerPeak.content.bestPartners}
							</p>
						</div>
					)}
					{powerPeak.content.avoidIndustries && (
						<div>
							<NumberedSubHeading num="02" title="避免" />
							<p style={{ ...bodyText, margin: 0 }}>
								{powerPeak.content.avoidIndustries}
							</p>
						</div>
					)}
				</SectionVertical>
			)}

			{/* 策略建議 */}
			{(strategies.officeLayout ||
				strategies.annualStrategy ||
				strategies.lifelongTaboo) && (
				<SectionVertical
					title="策略建議"
					description={
						strategies.officeLayout?.description ||
						strategies.officeLayout?.details
					}
					twoColumns
				>
					{strategies.officeLayout?.warning && (
						<div style={{ marginBottom: "12px" }}>
							<NumberedSubHeading num="01" title="禁忌事項" />
							<p style={{ ...bodyText, margin: 0 }}>
								{strategies.officeLayout.warning}
							</p>
						</div>
					)}
					{strategies.annualStrategy && (
						<div style={{ marginBottom: "12px" }}>
							<NumberedSubHeading num="02" title="流年" />
							<p style={{ ...bodyText, margin: 0 }}>
								{strategies.annualStrategy.description ||
									strategies.annualStrategy.benefit}
							</p>
						</div>
					)}
					{strategies.lifelongTaboo?.warning && (
						<div>
							<div
								style={{
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontWeight: 700,
									fontSize: "35px",
									color: CAREER_BLUE,
									marginBottom: "8px",
									letterSpacing: "0.2em",
								}}
							>
								終身禁忌
							</div>
							{parseNumberedItems(
								strategies.lifelongTaboo.warning,
							).length > 1 ? (
								<NumberedList
									items={parseNumberedItems(
										strategies.lifelongTaboo.warning,
									)}
								/>
							) : (
								<p style={{ ...bodyText, margin: 0 }}>
									{strategies.lifelongTaboo.warning}
								</p>
							)}
						</div>
					)}
				</SectionVertical>
			)}
		</div>
	) : null;

	const hasPage1 = summaryDesc || tianfuItems.length > 0;
	if (!hasPage1 && !hasPage2) return null;

	return (
		<>
			{page1}
			{page2}
		</>
	);
}
