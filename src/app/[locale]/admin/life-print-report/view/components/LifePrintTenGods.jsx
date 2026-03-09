"use client";

import LifePrintPageDateFooter from "./LifePrintPageDateFooter";

/**
 * Pages 6–7: 十神格局與內在關聯
 * Page 6: 正印、財星、官殺 (two-column layout)
 * Page 7: 比劫、食傷 (two-column layout)
 * Design: title, element pill (green), meaning pills (grey), intro paragraph, 實際表現, bullets (但...).
 * Element for each ten god: from wuxingData (which pillar stem has this ten god) → stem+element e.g. 甲木; else fallback from tenGodsAnalysis.element + default stem.
 */
const TITLE_COLOR = "#4a5d4a";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	position: "relative",
};
const GOD_ORDER_PAGE1 = ["正印", "財星", "官殺"];
const GOD_ORDER_PAGE2 = ["劫比", "食傷"];
const GOD_MEANINGS = {
	正印: "主學業、貴人、長輩緣",
	財星: "主財富、物質、配偶",
	官殺: "主事業、權威、責任",
	劫比: "主朋友、競爭、協作",
	食傷: "主創意、表達、子女",
};
// Map our god key to possible stemTenGod names from pillars
const TEN_GOD_MATCH = {
	正印: ["正印"],
	財星: ["正財", "偏財"],
	官殺: ["正官", "七殺"],
	劫比: ["比肩", "劫財"],
	食傷: ["食神", "傷官"],
};
const ELEMENT_TO_STEM = { 木: "甲", 火: "丙", 土: "戊", 金: "庚", 水: "壬" };
const WUXING_COLORS = {
	金: "#B2A062",
	木: "#567156",
	水: "#939393",
	火: "#B4003C",
	土: "#D09900",
};
function getElementColor(elementDisplay) {
	if (!elementDisplay || typeof elementDisplay !== "string") return "#c5d0a8";
	const el = elementDisplay.trim().slice(-1);
	return WUXING_COLORS[el] || "#c5d0a8";
}

function getElementDisplay(godName, tenGodsAnalysis, wuxingData) {
	const data = tenGodsAnalysis?.[godName];
	const elementOnly = data?.element || "";
	const matches = TEN_GOD_MATCH[godName] || [];
	if (wuxingData && matches.length) {
		const pillars = [
			[
				wuxingData.yearStem,
				wuxingData.yearStemWuxing,
				wuxingData.yearStemTenGod,
			],
			[
				wuxingData.monthStem,
				wuxingData.monthStemWuxing,
				wuxingData.monthStemTenGod,
			],
			[
				wuxingData.dayStem,
				wuxingData.dayStemWuxing,
				wuxingData.dayStemTenGod,
			],
			[
				wuxingData.hourStem,
				wuxingData.hourStemWuxing,
				wuxingData.hourStemTenGod,
			],
		];
		for (const [stem, wuxing, tenGod] of pillars) {
			if (stem && wuxing && matches.includes(tenGod))
				return `${stem}${wuxing}`;
		}
	}
	if (elementOnly && ELEMENT_TO_STEM[elementOnly])
		return `${ELEMENT_TO_STEM[elementOnly]}${elementOnly}`;
	return elementOnly ? `${elementOnly}` : "—";
}

function TenGodCard({ godName, data, elementDisplay }) {
	if (!data || typeof data !== "object") return null;
	const meaning = data.meaning || GOD_MEANINGS[godName] || "";
	const expression = data.expression || "";
	const realManifestation = data.realManifestation || [];
	const conflicts = data.coreConflicts?.conflicts || [];

	return (
		<div
			style={{
				marginBottom: "1px",
				padding: "1px",
				position: "relative",
			}}
		>
			{/* Ten God name */}
			<div style={{ display: "flex", alignItems: "center" }}>
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						fontSize: "35px",
						color: "#969E7E",
						marginBottom: "5px",
					}}
				>
					{data.name || godName}
				</div>
				{/* Pills row: element (green) + meaning (grey) */}
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "8px",
						alignItems: "center",
						marginBottom: "5px",
						marginLeft: "45px",
					}}
				>
					<span
						style={{
							display: "inline-block",
							padding: "6px 12px",
							borderRadius: "6px",
							background: getElementColor(elementDisplay),
							letterSpacing: "0.20em",
							textAlign: "center",
							justifyContent: "center",
							color: "white",
							fontSize: "15px",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 900,
						}}
					>
						{elementDisplay}
					</span>
					<span
						style={{
							display: "inline-block",
							padding: "6px 12px",
							borderRadius: "6px",
							background: "#BBBBBB",
							letterSpacing: "0.20em",
							textAlign: "center",
							justifyContent: "center",
							color: "white",
							fontSize: "15px",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 900,
						}}
					>
						{meaning}
					</span>
				</div>
			</div>
			{/* Intro paragraph */}
			{expression && (
				<p
					style={{
						fontSize: "13px",
						lineHeight: 1.25,
						color: "#424242",
						margin: "0 0 5px 0",
					}}
				>
					{expression}
				</p>
			)}
			{/* 實際表現 */}
			{realManifestation?.length > 0 && (
				<>
					<div
						style={{
							fontSize: "25px",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							color: "#969E7E",
							letterSpacing: "0.20em",
							marginBottom: "10px",
						}}
					>
						實際表現
					</div>
					<p
						style={{
							fontSize: "13px",
							lineHeight: 1.25,
							color: "#424242",
							margin: "0 0 10px 0",
						}}
					>
						{Array.isArray(realManifestation)
							? realManifestation.join(" ")
							: realManifestation}
					</p>
				</>
			)}
			{/* Conflict blocks: tag (subtitle) with AI color + description & example */}
			{conflicts.length > 0 && (
				<div
					style={{
						marginTop: "5px",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					{conflicts.map((c, i) => {
						const tagBg =
							c.color === "red"
								? "#c45c5c"
								: c.color === "purple"
									? "#7b6b9e"
									: c.color === "green"
										? "#5a7a5a"
										: "#888";
						return (
							<div
								key={i}
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "flex-start",
									gap: "10px",
									marginBottom: "10px",
								}}
							>
								<span
									style={{
										flexShrink: 0,
										padding: "4px 10px",
										borderRadius: "6px",
										background: "#969E7E",
										color: "#fff",
										fontSize: "12px",
										fontWeight: 700,
									}}
								>
									{c.title || ""}
								</span>
								<span
									style={{
										flex: 1,
										minWidth: 0,
										fontSize: "12px",
										lineHeight: 1.7,
										color: "#424242",
									}}
								>
									{c.description}
									{c.example && (
										<span style={{ color: "#666" }}>
											（例：{c.example}）
										</span>
									)}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function TenGodsPage({ godNames, tenGodsAnalysis, wuxingData, pageNum }) {
	const cards = godNames
		.map((godName) => {
			const data = tenGodsAnalysis?.[godName];
			if (!data) return null;
			const elementDisplay = getElementDisplay(
				godName,
				tenGodsAnalysis,
				wuxingData,
			);
			return { godName, data, elementDisplay };
		})
		.filter(Boolean);

	if (!cards.length) return null;

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
			<LifePrintPageDateFooter />
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "10px",
				}}
			>
				<h2
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						letterSpacing: "0.20em",
						fontSize: "24px",
						color: "#969E7E",
						margin: 0,
					}}
				>
					十神格局與內在關聯
				</h2>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
				{cards.map(({ godName, data, elementDisplay }) => (
					<TenGodCard
						key={godName}
						godName={godName}
						data={data}
						elementDisplay={elementDisplay}
					/>
				))}
			</div>
		</div>
	);
}

export default function LifePrintTenGods({ tenGodsAnalysis, wuxingData }) {
	if (!tenGodsAnalysis || typeof tenGodsAnalysis !== "object") return null;

	const hasPage1 = GOD_ORDER_PAGE1.some((k) => tenGodsAnalysis[k]);
	const hasPage2 = GOD_ORDER_PAGE2.some((k) => tenGodsAnalysis[k]);

	return (
		<>
			{hasPage1 && (
				<TenGodsPage
					godNames={GOD_ORDER_PAGE1}
					tenGodsAnalysis={tenGodsAnalysis}
					wuxingData={wuxingData}
					pageNum={6}
				/>
			)}
			{hasPage2 && (
				<TenGodsPage
					godNames={GOD_ORDER_PAGE2}
					tenGodsAnalysis={tenGodsAnalysis}
					wuxingData={wuxingData}
					pageNum={7}
				/>
			)}
		</>
	);
}
