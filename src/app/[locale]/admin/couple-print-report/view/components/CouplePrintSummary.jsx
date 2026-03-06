"use client";

// Couple print summary: "我們的2026" — content from AI via /api/couple-overall-summary (keyPhrase, coreThemes, shareableQuote, yearOverview)

import Image from "next/image";

const COUPLE_SUMMARY_COLOR = "#B4003C";

export default function CouplePrintSummary({ data }) {
	const { summary, concern, color } = data || {};

	if (!summary) {
		return null;
	}

	const currentYear = new Date().getFullYear();
	// Web API returns themes + quote; print layout uses coreThemes + shareableQuote
	const coreThemes = summary.coreThemes ?? summary.themes ?? [];
	const shareableQuote =
		summary.shareableQuote ??
		summary.quote ??
		"2026年，讓我們用愛與理解，共同書寫屬於我們的幸福篇章。";

	return (
		<div
			className="page-break relative bg-white h-[297mm] overflow-hidden flex flex-col"
			style={{ padding: "15mm 20mm" }}
		>
			{/* Date - Top Right (same as CouplePrintSeason) */}
			<div
				style={{
					fontFamily: "Noto Serif TC, serif",
					fontStyle: "extrabold",
					fontWeight: 400,
					fontSize: "20px",
					lineHeight: "14px",
					color: "#424242",
					textAlign: "right",
				}}
			>
				{new Date().toLocaleDateString("zh-TW").replace(/\//g, "/")}
			</div>

			{/* Title: 我們的 + year (same style as Page10 "我的2026") */}
			<div className="mb-8">
				<h1
					className="mb-10 font-bold text-8xl"
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						letterSpacing: "0.2em",
					}}
				>
					我們的
					<span
						style={{
							background: `linear-gradient(to bottom, ${color || COUPLE_SUMMARY_COLOR}, #880000)`,
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}
					>
						{currentYear}
					</span>
				</h1>
				<h2
					className="text-4xl font-bold"
					style={{
						color: color || COUPLE_SUMMARY_COLOR,
						letterSpacing: "0.2em",
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					}}
				>
					{summary.keyPhrase || "攜手同行，共創未來"}
				</h2>
			</div>

			<div className="mb-10 border-t-2 border-gray-800" />

			{/* Main: 核心洞察 (left) + Quote (right) — same as web content */}
			<div className="grid grid-cols-2 gap-8 mb-10">
				<div className="flex gap-6">
					<h3
						className="text-5xl font-bold"
						style={{
							background: `linear-gradient(to bottom, ${color || COUPLE_SUMMARY_COLOR}, #C74772)`,
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							writingMode: "vertical-rl",
						}}
					>
						核心洞察
					</h3>
					<div className="flex gap-8 ml-5">
						{coreThemes.map((theme, index) => (
							<div
								key={index}
								className="flex flex-col items-center"
							>
								<span
									className="mb-2 text-2xl"
									style={{
										color: color || COUPLE_SUMMARY_COLOR,
									}}
								>
									•
								</span>
								<p
									className="text-base font-medium"
									style={{
										writingMode: "vertical-lr",
										color: "#333",
										maxHeight: "150px",
										lineHeight: "1.8",
									}}
								>
									{theme}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center justify-center ml-15">
					<div
						className="relative flex items-center justify-center p-5 rounded-full w-55 h-55"
						style={{
							backgroundColor: "#FCE7F3",
							border: `2px solid ${color || COUPLE_SUMMARY_COLOR}`,
						}}
					>
						<p className="text-base font-medium leading-relaxed text-center text-gray-800">
							<span className="text-xl">「</span>
							{shareableQuote}
							<span className="text-2xl">」</span>
						</p>
					</div>
				</div>
			</div>

			<div className="mb-5 border-t-2 border-gray-800" />

			{/* 全年展望 — same as web yearOverview */}
			<div className="flex gap-6 mb-1">
				<h3
					className="text-3xl font-bold"
					style={{
						color: color || COUPLE_SUMMARY_COLOR,
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						borderRight: `2px solid ${color || COUPLE_SUMMARY_COLOR}`,
						paddingRight: "20px",
						letterSpacing: "0.2em",
					}}
				>
					全年展望
				</h3>
				<p className="flex-1 text-base leading-relaxed text-gray-800 whitespace-pre-line">
					{summary.yearOverview ||
						"2026年是你們感情深化的一年。珍惜彼此，用心經營，必能收穫更美好的未來。"}
				</p>
			</div>

			{/* Footer — same as CouplePrintSeason */}
			<div
				style={{
					position: "absolute",
					bottom: "15mm",
					left: "20mm",
				}}
			>
				<Image
					src="/images/report/bottom.png"
					alt=""
					width={30}
					height={10}
					style={{ objectFit: "contain" }}
				/>
			</div>
		</div>
	);
}
