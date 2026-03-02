"use client";

import Image from "next/image";

const ELEMENTS = ["金", "木", "水", "火", "土"];
const wuxingColorMap = {
	金: "#B2A062",
	木: "#567156",
	水: "#939393",
	火: "#B4003C",
	土: "#DEAB20",
};
const LIFE_COLOR = "#A3B116";
const zodiacAnimals = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"];
const strategyDesc = { 補缺: "補足所缺", 扶弱: "扶助偏弱", 抑強: "抑制過強", 瀉強: "化解過旺" };

export default function LifePrintPage1_FourPillars({ analysis, birthDateTime }) {
	if (!analysis?.wuxingData) return null;

	const { wuxingData, elementCounts, missingElements, strengthAnalysis, usefulGods } = analysis;
	const birthYear = birthDateTime ? new Date(birthDateTime).getFullYear() : new Date().getFullYear();
	const userZodiac = zodiacAnimals[(birthYear - 1900) % 12];

	const missingText =
		!missingElements?.length
			? "五行沒有缺失"
			: missingElements.length === 1
				? `缺${missingElements[0]}`
				: missingElements.length === 2
					? `缺${missingElements.join("")}`
					: `缺${missingElements.slice(0, 2).join("")}等`;

	const adviceText =
		usefulGods?.primaryGod && usefulGods?.auxiliaryGod
			? `根據您的五行配置分析，建議以「${usefulGods.primaryGod}」為首選用神，「${usefulGods.auxiliaryGod}」為輔助用神。透過${strategyDesc[usefulGods.strategy] || "平衡調和"}的策略，兩者協同作用可有效調節五行能量，達到陰陽平衡，提升整體運勢發展。在日常生活中，可通過相應的顏色、方位、職業選擇等方式來強化這些有利元素的影響力。`
			: "根據五行分析，需要進一步確認用神配置以達到最佳平衡效果。";

	const pageStyle = {
		width: "210mm",
		minHeight: "297mm",
		maxWidth: "210mm",
		padding: "15mm 18mm",
		boxSizing: "border-box",
		backgroundColor: "#fff",
	};

	return (
		<div className="bg-white page-break" style={pageStyle}>
			{/* Title: 四柱 */}
			<h1
				style={{
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 800,
					fontSize: "28px",
					color: LIFE_COLOR,
					marginBottom: "12px",
				}}
			>
				四柱
			</h1>

			{/* Five elements summary */}
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					gap: "12px",
					marginBottom: "16px",
					padding: "12px",
					background: "#f9fafb",
					borderRadius: "12px",
				}}
			>
				{ELEMENTS.map((element) => (
					<div key={element} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
						<span
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 700,
								fontSize: "14px",
								color: wuxingColorMap[element],
							}}
						>
							{element}
						</span>
						<span
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 900,
								fontSize: "16px",
								color: wuxingColorMap[element],
							}}
						>
							{elementCounts?.[element] ?? 0}
						</span>
					</div>
				))}
				<span style={{ marginLeft: "8px", fontSize: "13px", color: "#666" }}>
					{missingElements?.length === 0 ? "五行齊全，沒有嚴重缺失某一元素" : `${missingText}`}
				</span>
			</div>

			{/* Zodiac + Four Pillars */}
			<div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
				<div style={{ flex: "0 0 auto", textAlign: "center" }}>
					<Image
						src={`/images/animals/${userZodiac === "龍" ? "dragon" : userZodiac === "鼠" ? "mouse" : userZodiac === "牛" ? "cow" : userZodiac === "虎" ? "tiger" : userZodiac === "兔" ? "rabbit" : userZodiac === "蛇" ? "snake" : userZodiac === "馬" ? "horse" : userZodiac === "羊" ? "sheep" : userZodiac === "猴" ? "monkey" : userZodiac === "雞" ? "chicken" : userZodiac === "狗" ? "dog" : userZodiac === "豬" ? "pig" : "mouse"}.png`}
						alt={userZodiac}
						width={80}
						height={80}
						className="object-contain"
					/>
					<div style={{ fontWeight: 700, fontSize: "14px", color: "#374A37", marginTop: "4px" }}>生肖 {userZodiac}</div>
				</div>
				<div style={{ display: "flex", flexWrap: "wrap", gap: "10px", flex: 1 }}>
					{["年柱", "月柱", "日柱", "時柱"].map((label, i) => {
						const key = ["year", "month", "day", "hour"][i];
						const value = wuxingData[key] || "";
						return (
							<div
								key={key}
								style={{
									border: "2px solid #000",
									borderRadius: "9999px",
									padding: "8px 14px",
									textAlign: "center",
									fontSize: "13px",
									fontWeight: 700,
									color: "#374A37",
								}}
							>
								{label}-<span style={{ color: LIFE_COLOR }}>{value}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* 五行 - strengthDesc & 缺 */}
			<div style={{ display: "flex", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
				<div
					style={{
						padding: "8px 14px",
						background: LIFE_COLOR,
						color: "#fff",
						borderRadius: "9999px",
						fontWeight: 700,
						fontSize: "14px",
					}}
				>
					五行-{strengthAnalysis?.strengthDesc || "平衡"}
				</div>
				<div
					style={{
						padding: "8px 14px",
						background: LIFE_COLOR,
						color: "#fff",
						borderRadius: "9999px",
						fontWeight: 700,
						fontSize: "14px",
					}}
				>
					{missingText}
				</div>
			</div>

			{/* 用神 advice */}
			<p
				style={{
					fontFamily: "Noto Sans HK, sans-serif",
					fontSize: "12px",
					color: "#5A5A5A",
					lineHeight: 1.8,
					margin: 0,
				}}
			>
				{adviceText}
			</p>
		</div>
	);
}
