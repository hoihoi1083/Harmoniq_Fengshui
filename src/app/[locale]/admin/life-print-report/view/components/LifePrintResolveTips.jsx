"use client";

import LifePrintPageDateFooter from "./LifePrintPageDateFooter";

/**
 * Page 8: 核心矛盾 - 才華vs壓力 (above) + 化解提示
 * Design matches reference: olive accent, left-wider two-column, grey dividers.
 */
const OLIVE = "#8F997E";
const TEXT_DARK = "#2d2d2d";
const TEXT_BODY = "#424242";
const DIVIDER_GREY = "#d0d0ce";
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	position: "relative",
};

// Build 3 core-contradiction items from tenGodsAnalysis: 食傷, 劫比, 正印
function buildCoreContradictionItems(tenGodsAnalysis) {
	if (!tenGodsAnalysis) return [];
	const labels = [
		{ key: "食傷", num: "01", title: "傷官vs生財" },
		{ key: "劫比", num: "02", title: "劫財vs奪財" },
		{ key: "正印", num: "03", title: "正印救場" },
	];
	return labels
		.map(({ key, num, title }) => {
			const god = tenGodsAnalysis[key];
			const conflict = god?.coreConflicts?.conflicts?.[0];
			if (!conflict) return null;
			return {
				num,
				title,
				description: conflict.description || "",
				example: conflict.example || "",
			};
		})
		.filter(Boolean);
}

const blockContentStyle = {
	margin: 0,
	paddingLeft: "18px",
	fontSize: "14px",
	lineHeight: 1.75,
	color: TEXT_BODY,
	fontFamily: "Noto Serif TC, serif",
};
const dividerStyle = {
	width: "100%",
	height: "1px",
	backgroundColor: DIVIDER_GREY,
	marginTop: "14px",
	border: "none",
};

function CoreBlock({ item, showDivider }) {
	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					marginBottom: "8px",
				}}
			>
				<span
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						fontSize: "27px",
						color: "#60680F",
					}}
				>
					{item.num}
				</span>
				<span
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						fontSize: "19px",
						color: TEXT_DARK,
						letterSpacing: "0.13em",
					}}
				>
					{item.title}
				</span>
			</div>
			<ul style={blockContentStyle}>
				{item.description && (
					<li style={{ marginBottom: "4px" }}>{item.description}</li>
				)}
				{item.example && (
					<li style={{ marginBottom: 0 }}>例如：{item.example}</li>
				)}
			</ul>
			{showDivider && <hr style={dividerStyle} />}
		</div>
	);
}

function TipBlock({ tip, num, showDivider }) {
	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "baseline",
					gap: "6px",
					marginBottom: "8px",
				}}
			>
				<span
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 700,
						fontSize: "27px",
						color: "#60680F",
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
					{tip.title}
				</span>
			</div>
			<ul style={blockContentStyle}>
				{tip.content && (
					<li style={{ marginBottom: "4px" }}>{tip.content}</li>
				)}

				{tip.example && (
					<li style={{ marginBottom: 0 }}>例如：{tip.example}</li>
				)}
				{showDivider && <hr style={dividerStyle} />}
			</ul>
		</div>
	);
}

export default function LifePrintResolveTips({
	lifeAdvice,
	tenGodsAnalysis,
	pageNumber,
}) {
	const tips = lifeAdvice?.tips;
	const coreItems = buildCoreContradictionItems(tenGodsAnalysis);
	const hasCore = coreItems.length > 0;
	const hasTips = tips && Array.isArray(tips) && tips.length > 0;
	if (!hasCore && !hasTips) return null;

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
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

			{/* 核心矛盾 - 才華vs壓力 */}
			{hasCore && (
				<div style={{ marginBottom: "40px" }}>
					<h2
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							fontSize: "30px",
							color: "#969E7E",
							marginBottom: "16px",
							letterSpacing: "0.2em",
						}}
					>
						核心矛盾 - 才華vs壓力
					</h2>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1.2fr 1fr",
							gap: "20px 24px",
						}}
					>
						{coreItems[0] && (
							<CoreBlock item={coreItems[0]} showDivider={true} />
						)}
						{coreItems[1] && (
							<CoreBlock item={coreItems[1]} showDivider={true} />
						)}
					</div>
					{coreItems.length >= 3 && (
						<div style={{ marginTop: "18px" }}>
							<CoreBlock item={coreItems[2]} showDivider={true} />
						</div>
					)}
				</div>
			)}

			{/* 化解提示 */}
			{hasTips && (
				<div>
					<h2
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							fontSize: "30px",
							color: "#969E7E",
							marginBottom: "16px",
							letterSpacing: "0.2em",
						}}
					>
						化解提示
					</h2>
					<p
						style={{
							fontSize: "15px",
							lineHeight: 1.6,
							color: TEXT_DARK,
							marginBottom: "16px",
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						透過這些策略，你可以在生活和工作中更好地平衡才華與壓力，發揮自己的潛力，迎接機會的來臨。
					</p>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1.2fr 1fr",
							gap: "20px 24px",
						}}
					>
						{tips[0] && (
							<TipBlock
								tip={tips[0]}
								num="01"
								showDivider={true}
							/>
						)}
						{tips[1] && (
							<TipBlock
								tip={tips[1]}
								num="02"
								showDivider={true}
							/>
						)}
					</div>
					{tips.length >= 3 && (
						<div style={{ marginTop: "18px" }}>
							<TipBlock
								tip={tips[2]}
								num="03"
								showDivider={true}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
