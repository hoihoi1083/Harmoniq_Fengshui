"use client";

import Image from "next/image";
import LifePrintPageDateFooter from "./LifePrintPageDateFooter";

/**
 * Page 5: 五行分佈 深度解析 + 五行疏通阻礙點
 * Layout matches reference: table with icons/stars, then obstacle points (01+02 side-by-side, 03 full width).
 * Data: elementDistribution { elementCounts, elementStrengthMap }, elementFlowAnalysis { flowObstacles }
 */
const TITLE_COLOR = "#4a5d4a";
const ELEMENTS = ["金", "木", "水", "火", "土"];
const PAGE_STYLE = {
	width: "210mm",
	minHeight: "297mm",
	maxWidth: "210mm",
	padding: "15mm 18mm",
	boxSizing: "border-box",
	backgroundColor: "#fff",
	position: "relative",
};

/** Map strength string (★–★★★★★) to 0–5 for trait/influence lookup. Same logic as Report.jsx / PersonalReportDisplay.jsx */
function getStarCount(strength) {
	if (!strength || typeof strength !== "string") return 0;
	const n = (strength.match(/★/g) || []).length;
	return Math.min(n, 5);
}

/** 特性 (element trait by strength). Source: PersonalReportDisplay.jsx */
function getElementTrait(element, starCount) {
	const traits = {
		金: ["缺失", "微弱", "平穩", "強勁", "剛硬密集", "過旺失控"],
		木: [
			"缺失",
			"孤立無根",
			"生機初現",
			"茂盛生長",
			"繁茂昌盛",
			"過旺失控",
		],
		水: [
			"缺失",
			"涓涓細流",
			"清澈流動",
			"潛藏暗流",
			"波濤洶湧",
			"氾濫成災",
		],
		火: [
			"缺失",
			"微弱燭光",
			"溫暖照明",
			"外顯熾熱",
			"烈火燎原",
			"燥熱失控",
		],
		土: [
			"缺失",
			"貧瘠薄弱",
			"基礎穩固",
			"鬆散無力",
			"厚重包容",
			"過厚阻滯",
		],
	};
	return traits[element]?.[starCount] ?? "—";
}

/** 對命主的影響 (influence on life master). Source: PersonalReportDisplay.jsx */
function getElementInfluence(element, starCount) {
	const influences = {
		金: [
			"缺乏規則意識，做事散漫",
			"略顯謹慎，但執行力不足",
			"做事有條理，講原則",
			"追求完美，有責任心",
			"追求完美、重規則壓力，身心易疲憊",
			"過於嚴苛，壓力過大",
		],
		木: [
			"缺乏創新思維，適應力差",
			"創造力受限，難將靈感系統化落地",
			"有一定創意和適應能力",
			"創意豐富，適應力強",
			"創新能力出眾，但可能好高騖遠",
			"想法過多，難以落實",
		],
		水: [
			"思維僵化，缺乏靈活性",
			"思考較慢，但內心敏感",
			"思維靈活，有一定智慧",
			"直覺敏銳，但思慮多，易焦慮失眠",
			"智慧超群，但可能過度分析",
			"思慮過度，容易憂鬱",
		],
		火: [
			"缺乏熱情，行動力不足",
			"內向含蓄，不善表達",
			"有一定熱情和行動力",
			"行動力強、熱情主動，但易急躁衝動",
			"熱情四射，但容易衝動",
			"過於急躁，易發脾氣",
		],
		土: [
			"財運差，缺乏安全感",
			"財運一般，較為保守",
			"財運穩定，有儲蓄習慣",
			"財運不穩，存錢實力，易衝動消費",
			"財運豐厚，但可能過於保守",
			"過於固執，缺乏變通",
		],
	};
	return influences[element]?.[starCount] ?? "—";
}

export default function LifePrintPage5({
	elementDistribution,
	elementFlowAnalysis,
}) {
	const dist = elementDistribution;
	const obstacles = elementFlowAnalysis?.flowObstacles || [];

	return (
		<div className="bg-white page-break" style={PAGE_STYLE}>
			<LifePrintPageDateFooter />
			{/* Page title row with page number */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<div />
			</div>

			{/* Section 1: 五行分佈 深度解析 */}
			<div style={{ marginBottom: "24px" }}>
				<p
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 800,
						fontSize: "40px",
						lineHeight: "0.6",
						color: "#969E7E",
						letterSpacing: "0.20em",
						margin: 0,
						paddingBottom: "0px",
					}}
				>
					五行分佈
				</p>
				<p
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontWeight: 800,
						paddingTop: "0px",
						fontSize: "40px",
						color: "#969E7E",
						letterSpacing: "0.20em",
						margin: 0,
						marginBottom: "4px",
					}}
				>
					深度解析
				</p>

				{dist && (
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							fontSize: "12px",
							fontFamily: "Noto Sans TC, sans-serif",
						}}
					>
						<thead>
							<tr
								style={{
									borderBottom: "2px solid #2d2d2d",
									fontWeight: 700,
									color: "#2d2d2d",
								}}
							>
								<th
									style={{
										padding: "10px 8px",
										textAlign: "left",
										width: "18%",
									}}
								>
									五行
								</th>
								<th
									style={{
										padding: "10px 8px",
										textAlign: "center",
										width: "12%",
									}}
								>
									數量
								</th>
								<th
									style={{
										padding: "10px 8px",
										textAlign: "center",
										width: "15%",
									}}
								>
									強度
								</th>
								<th
									style={{
										padding: "10px 8px",
										textAlign: "left",
										width: "20%",
									}}
								>
									特性
								</th>
								<th
									style={{
										padding: "10px 8px",
										textAlign: "left",
									}}
								>
									對命主的影響
								</th>
							</tr>
						</thead>
						<tbody>
							{ELEMENTS.map((el) => {
								const count = dist.elementCounts?.[el] ?? 0;
								const strength =
									dist.elementStrengthMap?.[el] ?? "";
								const starCount = getStarCount(strength);
								const trait = getElementTrait(el, starCount);
								const influence = getElementInfluence(
									el,
									starCount,
								);
								return (
									<tr
										key={el}
										style={{
											borderBottom: "1px solid #ddd",
											color: "#2d2d2d",
										}}
									>
										<td
											style={{
												padding: "10px 8px",
												verticalAlign: "middle",
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
												}}
											>
												<Image
													src={`/images/elements/${el}.png`}
													alt={el}
													width={24}
													height={24}
													style={{
														objectFit: "contain",
													}}
												/>
												<span
													style={{ fontWeight: 600 }}
												>
													{el}
												</span>
											</div>
										</td>
										<td
											style={{
												padding: "10px 8px",
												textAlign: "center",
												fontWeight: 500,
											}}
										>
											{count}
										</td>
										<td
											style={{
												padding: "10px 8px",
												textAlign: "center",
												fontWeight: 500,
												color: "#000",
											}}
										>
											{strength || "—"}
										</td>
										<td
											style={{
												padding: "10px 8px",
												lineHeight: 1.4,
											}}
										>
											{trait}
										</td>
										<td
											style={{
												padding: "10px 8px",
												lineHeight: 1.5,
											}}
										>
											{influence}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>

			{/* Section 2: 五行疏通阻礙點 */}
			<div style={{ marginTop: "28px" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						marginBottom: "16px",
					}}
				>
					<h2
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							fontSize: "30px",
							color: "#969E7E",
							margin: 0,
							letterSpacing: "0.20em",
						}}
					>
						五行疏通阻礙點
					</h2>
					<div
						style={{
							width: "1px",
							height: "35px",
							backgroundColor: "#999",
							borderRadius: "2px",
						}}
					/>
				</div>

				{obstacles.length > 0 && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "20px",
						}}
					>
						{obstacles.slice(0, 2).map((ob, i) => (
							<div
								key={i}
								style={{
									padding: "6px",
								}}
							>
								<div
									style={{
										fontWeight: 900,
										fontSize: "21px",
										color: "#2d2d2d",
										marginBottom: "10px",
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									{String(i + 1).padStart(2, "0")} {ob.title}
								</div>
								<ul
									style={{
										margin: 0,
										paddingLeft: "18px",
										fontSize: "12px",
										lineHeight: 1.75,
										color: "#424242",
									}}
								>
									<li style={{ marginBottom: "6px" }}>
										{ob.description}
									</li>
									{ob.lifeImpact && (
										<li style={{ marginBottom: 0 }}>
											{ob.lifeImpact}
										</li>
									)}
								</ul>
								<div
									style={{
										width: "100px",
										marginTop: "20px",
										height: "1px",
										backgroundColor: "#999",
										borderRadius: "2px",
									}}
								/>
							</div>
						))}
					</div>
				)}

				{obstacles.length > 2 && (
					<div
						style={{
							marginTop: "10px",
							padding: "6px",
						}}
					>
						<div
							style={{
								fontWeight: 900,
								fontSize: "21px",
								color: "#2d2d2d",
								marginBottom: "10px",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							03 {obstacles[2].title}
						</div>
						<ul
							style={{
								margin: 0,
								paddingLeft: "18px",
								fontSize: "12px",
								lineHeight: 1.75,
								color: "#424242",
							}}
						>
							<li style={{ marginBottom: "6px" }}>
								{obstacles[2].description}
							</li>
							{obstacles[2].lifeImpact && (
								<li style={{ marginBottom: 0 }}>
									{obstacles[2].lifeImpact}
								</li>
							)}
						</ul>
						<div
							style={{
								width: "100px",
								marginTop: "20px",
								height: "1px",
								backgroundColor: "#999",
								borderRadius: "2px",
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
