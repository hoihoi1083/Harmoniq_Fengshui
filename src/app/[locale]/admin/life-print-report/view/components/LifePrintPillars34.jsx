"use client";

/**
 * Page 3: 年柱 + 月柱 (四柱排盤&納音解析)
 * Page 4: 日柱 + 時柱
 * Data: reportDocData { nianzhuData, yuezhuData, rizhuData, shizhuData }
 */
const LIFE_COLOR = "#A3B116";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
};

function getPillarContent(pillarData) {
	if (!pillarData) return [];
	const arr = Array.isArray(pillarData) ? pillarData : [pillarData];
	const content = arr[0];
	return typeof content === "object" && content !== null
		? Object.entries(content)
		: [];
}

function PillarBlock({ title, pillarData }) {
	const entries = getPillarContent(pillarData);
	if (!entries.length) return null;
	return (
		<div style={{ marginBottom: "16px" }}>
			<h3
				style={{
					fontFamily: "Noto Serif TC, serif",
					fontWeight: 800,
					fontSize: "18px",
					color: LIFE_COLOR,
					marginBottom: "8px",
				}}
			>
				{title}
			</h3>
			<div style={{ padding: "10px", background: "#f5f5f5", borderRadius: "8px" }}>
				{entries.map(([key, value]) => (
					<p
						key={key}
						style={{
							fontSize: "11px",
							lineHeight: 1.6,
							color: "#333",
							margin: "4px 0",
						}}
					>
						{typeof value === "string" ? value : String(value)}
					</p>
				))}
			</div>
		</div>
	);
}

export default function LifePrintPillars34({ reportDocData }) {
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
			{/* Page 3: 年柱 + 月柱 */}
			<div className="bg-white page-break" style={PAGE_STYLE}>
				<h2
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 800,
						fontSize: "22px",
						color: LIFE_COLOR,
						marginBottom: "16px",
					}}
				>
					四柱排盤 & 納音解析
				</h2>
				<PillarBlock title="年柱" pillarData={nianContent} />
				<PillarBlock title="月柱" pillarData={yueContent} />
			</div>
			{/* Page 4: 日柱 + 時柱 */}
			<div className="bg-white page-break" style={PAGE_STYLE}>
				<h2
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 800,
						fontSize: "22px",
						color: LIFE_COLOR,
						marginBottom: "16px",
					}}
				>
					四柱排盤 & 納音解析（續）
				</h2>
				<PillarBlock title="日柱" pillarData={riContent} />
				<PillarBlock title="時柱" pillarData={shiContent} />
			</div>
		</>
	);
}
