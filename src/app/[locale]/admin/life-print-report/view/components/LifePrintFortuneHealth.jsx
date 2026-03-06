"use client";

/**
 * Health Fortune — 2 pages
 * Page 1: full-width blue-green title bars, two-column numbered sub-sections, no hr under 01/02/03
 * Page 2: 神經免疫平衡, 全週期調養方案 (unchanged style)
 */
const BLUE_GREEN = "#088C6E";
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
	if (analysis.response && !analysis.summary && !analysis.systems)
		return true;
	return false;
}

/** Full-width title bar: blue-green background, white bold centered text */
function TitleBar({ children }) {
	return (
		<div
			style={{
				width: "40%",
				backgroundColor: BLUE_GREEN,
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

/** Title + vertical line + description (no background); title in blue-green */
function SectionTitleWithDescription({ title, description }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "stretch",
				marginBottom: "12px",
				gap: 0,
			}}
		>
			<div
				style={{
					flexShrink: 0,
					paddingRight: "14px",
					display: "flex",
					alignItems: "flex-start",
				}}
			>
				<span
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 700,
						fontSize: "30px",
						color: BLUE_GREEN,
						lineHeight: 1.4,
					}}
				>
					{title}
				</span>
			</div>
			{description && (
				<>
					<div
						style={{
							width: "1px",
							minHeight: "1.5em",
							backgroundColor: TEXT_DARK,
							flexShrink: 0,
						}}
					/>
					<p
						style={{
							fontSize: "13px",
							lineHeight: 1.7,
							color: TEXT_DARK,
							margin: 0,
							paddingLeft: "14px",
							fontFamily: "Noto Sans HK, sans-serif",
							flex: 1,
						}}
					>
						{description}
					</p>
				</>
			)}
		</div>
	);
}

/** Numbered sub-heading: no horizontal line under it. Use teal for page-2 style. */
function NumberedSubHeading({ num, title, teal }) {
	const color = teal ? BLUE_GREEN : TEXT_DARK;
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
					fontSize: teal ? "17px" : "22px",
					color,
				}}
			>
				{num}
			</span>
			<span
				style={{
					fontFamily: "Noto Serif TC, serif",
					fontWeight: 700,
					fontSize: teal ? "14px" : "18px",
					color,
				}}
			>
				{title}
			</span>
		</div>
	);
}

/** Parse "1. xxx 2. yyy 3. zzz" or "個人化飲食方案：1. ... 2. ..." into array of strings for numbered list */
function parseNumberedItems(text) {
	if (!text || typeof text !== "string") return [];
	const trimmed = text.trim();
	const parts = trimmed
		.split(/\s*\d+[．.]\s*/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	if (parts.length > 1) return parts;
	return [];
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

export default function LifePrintFortuneHealth({ data, pageNumber }) {
	const analysis = data?.analysis || data;
	if (!analysis || isErrorResponse(analysis)) return null;

	const summary = analysis.summary || {};
	const systems = analysis.systems || {};
	const regimen = analysis.careRegimen || analysis.advice || {};

	const shengu = systems["腎骨系統核心"];
	const daixie = systems["代謝循環特質"];
	const shenjing = systems["神經免疫平衡"];

	const summaryTitle = summary.title || "健康運勢分析";
	const summaryDesc = summary.description;

	const bodyTextStyle = {
		fontSize: "13px",
		lineHeight: 1.7,
		color: TEXT_DARK,
		fontFamily: "Noto Sans HK, sans-serif",
	};

	// Page 1: exact match to image — main title + thin line, full-width blue-green bars, two-column sub-sections, no hr under 01/02/03
	const page1 = (
		<div key="health-p1" className="bg-white page-break" style={PAGE_STYLE}>
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
					color: BLUE_GREEN,
					marginBottom: "8px",
					letterSpacing: "0.2em",
				}}
			>
				健康運勢分析
			</h2>
			{/* Section 1: 水土交戰 — full-width bar + paragraph with large quote */}
			{summaryDesc && (
				<>
					<TitleBar>{summaryTitle}</TitleBar>
					<p
						style={{
							...bodyTextStyle,
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
						{summaryDesc}
					</p>
				</>
			)}

			{/* Section 2: 腎骨系統核心 — title (blue-green) | vertical line | description, then two-column 01/02 | 03 */}
			{shengu?.content && (
				<div style={{ marginBottom: "20px" }}>
					<SectionTitleWithDescription
						title="腎骨系統核心"
						description={shengu.content.description}
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "16px 24px",
						}}
					>
						<div>
							{shengu.content.advantages && (
								<>
									<NumberedSubHeading num="01" title="優勢" />
									<BulletList
										items={[shengu.content.advantages]}
									/>
								</>
							)}
							{shengu.content.risks &&
								Array.isArray(shengu.content.risks) &&
								shengu.content.risks.length > 0 && (
									<>
										<NumberedSubHeading
											num="02"
											title="風險"
										/>
										<BulletList
											items={shengu.content.risks.map(
												(r) =>
													(r.period
														? `${r.period}：${r.description || ""}`
														: r.description || ""
													).trim(),
											)}
										/>
									</>
								)}
						</div>
						<div>
							{shengu.content.keyYears && (
								<>
									<NumberedSubHeading
										num="03"
										title="未來大運期間"
									/>
									<BulletList
										items={[shengu.content.keyYears]}
									/>
								</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Section 3: 代謝循環特質 — title (blue-green) | vertical line | description, then two-column 01/02 | 03 */}
			{daixie?.content && (
				<div>
					<SectionTitleWithDescription
						title="代謝循環特質"
						description={daixie.content.description}
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "16px 24px",
						}}
					>
						<div>
							{daixie.content.bloodCharacteristics && (
								<>
									<NumberedSubHeading num="01" title="血液" />
									<BulletList
										items={[
											daixie.content.bloodCharacteristics,
										]}
									/>
								</>
							)}
							{daixie.content.skinConcerns && (
								<>
									<NumberedSubHeading num="02" title="皮膚" />
									<BulletList
										items={[daixie.content.skinConcerns]}
									/>
								</>
							)}
						</div>
						<div>
							{daixie.content.digestiveFeatures && (
								<>
									<NumberedSubHeading num="03" title="消化" />
									<BulletList
										items={[
											daixie.content.digestiveFeatures,
										]}
									/>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);

	// Page 2: 神經免疫平衡, 全週期調養方案
	const shenjingContent = shenjing?.content;
	const hasRegimen =
		regimen.diet ||
		regimen.exercise ||
		regimen.acupoints ||
		regimen.lifeStageReminder;
	const hasPage2 = shenjingContent || hasRegimen;

	const page2 = hasPage2 ? (
		<div key="health-p2" className="bg-white page-break" style={PAGE_STYLE}>
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

			{shenjingContent && (
				<div style={{ marginBottom: "22px" }}>
					{/* Title (blue-green) | vertical line | description — same as page 1 sections */}
					<SectionTitleWithDescription
						title="神經免疫平衡"
						description={shenjingContent.description}
					/>
					{/* 01 優勢: show when API has advantages or mentalState/immuneSystem/seasonalCare */}
					{(shenjingContent.advantages ||
						shenjingContent.mentalState ||
						shenjingContent.immuneSystem ||
						shenjingContent.seasonalCare) && (
						<div>
							<NumberedSubHeading num="01" title="優勢" />
							<BulletList
								items={
									shenjingContent.advantages
										? [shenjingContent.advantages]
										: [
												shenjingContent.mentalState,
												shenjingContent.immuneSystem,
												shenjingContent.seasonalCare,
											].filter(Boolean)
								}
							/>
						</div>
					)}
				</div>
			)}

			{/* 全週期調養方案: dark gray heading + light gray vertical bar, then 01-04 via NumberedSubHeading rule */}
			{hasRegimen && (
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
								color: BLUE_GREEN,
								lineHeight: 1.4,
								marginRight: "12px",
							}}
						>
							全週期調養方案
						</h3>
						<div
							style={{
								width: "1px",
								minHeight: "49px",
								flexShrink: 0,
								backgroundColor: "black",
							}}
						/>
					</div>
					{[
						{
							num: "01",
							title: "個人化飲食方案",
							content: regimen.diet,
						},
						{
							num: "02",
							title: "運動建議",
							content: regimen.exercise,
						},
						{
							num: "03",
							title: "經絡調養",
							content: regimen.acupoints,
						},
						{
							num: "04",
							title: "大運提醒",
							content: regimen.lifeStageReminder,
						},
					]
						.filter((item) => item.content)
						.map((item) => {
							const items = parseNumberedItems(item.content);
							return (
								<div
									key={item.num}
									style={{ marginBottom: "14px" }}
								>
									<NumberedSubHeading
										num={item.num}
										title={item.title}
									/>
									{items.length > 1 ? (
										<NumberedList items={items} />
									) : (
										<p
											style={{
												fontSize: "13px",
												lineHeight: 1.7,
												color: TEXT_DARK,
												margin: 0,
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
										>
											{item.content}
										</p>
									)}
								</div>
							);
						})}
				</div>
			)}
		</div>
	) : null;

	const hasPage1 = summaryDesc || shengu?.content || daixie?.content;
	if (!hasPage1 && !hasPage2) return null;

	return (
		<>
			{page1}
			{page2}
		</>
	);
}
