"use client";

/**
 * A4 page that displays a title and markdown-style text (for 命局 / 流年 / 核心建議 / 總結 / 專屬問題 等).
 */
const COUPLE_COLOR = "#D94075";

export default function CouplePrintTextPage({ title, content, pageClass = "" }) {
	if (!content || !content.trim()) return null;

	return (
		<div
			className={`mx-auto bg-white page-break ${pageClass}`}
			style={{
				width: "210mm",
				minHeight: "297mm",
				maxHeight: "297mm",
				padding: "15mm 20mm",
				boxSizing: "border-box",
				overflow: "hidden",
				position: "relative",
			}}
		>
			<h2
				style={{
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					fontSize: "34px",
					letterSpacing: "0.27em",
					color: COUPLE_COLOR,
					marginBottom: "24px",
				}}
			>
				{title}
			</h2>
			<div
				style={{
					fontFamily: "Noto Serif TC, serif",
					fontSize: "14px",
					lineHeight: "1.8",
					color: "#424242",
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
				}}
			>
				{content.replace(/\*\*/g, "").substring(0, 3500)}
			</div>
		</div>
	);
}
