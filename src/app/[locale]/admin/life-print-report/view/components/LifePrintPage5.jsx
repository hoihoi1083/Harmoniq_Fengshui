"use client";

/**
 * Page 5: 五行分布表 + 五行流通阻礙點
 * Data: elementDistribution { elementCounts, elementStrengthMap }, elementFlowAnalysis { flowObstacles }
 */
const LIFE_COLOR = "#A3B116";
const wuxingColorMap = { 金: "#B2A062", 木: "#567156", 水: "#939393", 火: "#B4003C", 土: "#DEAB20" };
const ELEMENTS = ["金", "木", "水", "火", "土"];
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
};

export default function LifePrintPage5({ elementDistribution, elementFlowAnalysis }) {
	const dist = elementDistribution;
	const obstacles = elementFlowAnalysis?.flowObstacles || [];

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
			<h2 style={{ fontFamily: "Noto Serif TC, serif", fontWeight: 800, fontSize: "20px", color: LIFE_COLOR, marginBottom: "12px" }}>
				五行分布與流通阻礙
			</h2>

			{/* 五行分布表 */}
			{dist && (
				<>
					<h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "#333" }}>五行分布表</h3>
					<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "16px" }}>
						<thead>
							<tr style={{ background: LIFE_COLOR, color: "#fff" }}>
								<th style={{ padding: "6px 8px", textAlign: "left" }}>五行</th>
								<th style={{ padding: "6px 8px", textAlign: "center" }}>數值(包括藏干)</th>
								<th style={{ padding: "6px 8px", textAlign: "center" }}>強度</th>
								<th style={{ padding: "6px 8px", textAlign: "left" }}>特性</th>
								<th style={{ padding: "6px 8px", textAlign: "left" }}>對命主的影響</th>
							</tr>
						</thead>
						<tbody>
							{ELEMENTS.map((el) => {
								const count = dist.elementCounts?.[el] ?? 0;
								const strength = dist.elementStrengthMap?.[el] ?? "";
								return (
									<tr key={el} style={{ borderBottom: "1px solid #eee" }}>
										<td style={{ padding: "6px 8px", color: wuxingColorMap[el], fontWeight: 700 }}>{el}</td>
										<td style={{ padding: "6px 8px", textAlign: "center" }}>{count}</td>
										<td style={{ padding: "6px 8px", textAlign: "center" }}>{strength}</td>
										<td style={{ padding: "6px 8px" }}>—</td>
										<td style={{ padding: "6px 8px" }}>—</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</>
			)}

			{/* 五行流通阻礙點 */}
			{obstacles.length > 0 && (
				<>
					<h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "#333" }}>五行流通阻礙點</h3>
					<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						{obstacles.map((ob, i) => (
							<div key={i} style={{ padding: "10px", background: "#f5f5f5", borderRadius: "8px", borderLeft: `4px solid ${LIFE_COLOR}` }}>
								<div style={{ fontWeight: 700, fontSize: "12px", color: LIFE_COLOR, marginBottom: "4px" }}>{ob.title}</div>
								<p style={{ fontSize: "11px", lineHeight: 1.5, margin: "2px 0" }}>{ob.description}</p>
								{ob.lifeImpact && <p style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>{ob.lifeImpact}</p>}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
