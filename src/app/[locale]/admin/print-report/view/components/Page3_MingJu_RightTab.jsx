// Page 3: 財星定位/感情定位/調候與病源關鍵 - MingJu Analysis (Right Tab)
import React from "react";
import { getConcernColor } from "@/utils/colorTheme";

const TAB_CONFIG = {
	健康: {
		middle: {
			label: "疾厄宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
		right: {
			label: "調候與病源關鍵",
			img: "/images/report/health.png",
			selectedBg: "#389D7D",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#389D7D",
		},
	},
	財運: {
		middle: {
			label: "財星與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
		right: {
			label: "財星定位",
			img: "/images/report/money.png",
			selectedBg: "#D09900",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
	},
	事業: {
		middle: {
			label: "事業宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
		right: {
			label: "事業定位",
			img: "/images/report/money.png",
			selectedBg: "#3263C4",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#3263C4",
		},
	},
	工作: {
		middle: {
			label: "事業宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
		right: {
			label: "事業定位",
			img: "/images/report/money.png",
			selectedBg: "#3263C4",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#3263C4",
		},
	},
	感情: {
		middle: {
			label: "感情宮與十神",
			img: "/images/report/star2.png",
			selectedBg: "#DEAB20",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#D09900",
		},
		right: {
			label: "感情定位",
			img: "/images/report/heart2.png",
			selectedBg: "#C74772",
			selectedImg: "#FFFFFF",
			unselectedBg: "#EFEFEF",
			unselectedImg: "#C74772",
		},
	},
};

function getTabConfig(concern) {
	return TAB_CONFIG[concern] || TAB_CONFIG["財運"];
}

function getTabLabel(tab, concern) {
	if (tab === "日主特性") return "日主特性";

	if (tab === "middle") {
		return getTabConfig(concern).middle.label;
	}
	if (tab === "right") {
		return getTabConfig(concern).right.label;
	}
	return "";
}

export default function Page3_MingJu_RightTab({
	userInfo,
	rightContent,
	locale = "zh-TW",
}) {
	const dateLocale = locale === "zh-CN" ? "zh-CN" : "zh-TW";
	const concern = userInfo?.concern || "財運";
	const concernColor = getConcernColor(concern);

	let extractedSummary = "";
	let contentForSections = rightContent;

	// Parse rightContent if it's JSON format
	if (typeof rightContent === "string" && rightContent.startsWith("{")) {
		try {
			const parsed = JSON.parse(rightContent);
			if (parsed.keywords && Array.isArray(parsed.keywords)) {
				// Convert all keywords to text format
				contentForSections = parsed.keywords
					.map((kw) => `${kw.text}\n${kw.description}`)
					.join("\n\n");

				// Use the 'analysis' field as summary if available
				if (parsed.analysis) {
					extractedSummary = parsed.analysis;
				}
			}
		} catch (e) {
			console.error("Failed to parse rightContent JSON:", e);
		}
	}

	// Parse content into sections
	const parseRightContent = (content) => {
		if (typeof content !== "string") return { sections: [] };
		const parts = content.split("\n\n").filter((p) => p.trim());
		const sections = [];

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const lines = part.split("\n");

			// Check if this looks like a section with a title
			if (lines.length >= 2) {
				const title = lines[0].trim();
				const text = lines.slice(1).join("\n").trim();

				// Add all sections
				if (title && text) {
					sections.push({ title, content: text });
				}
			}
		}

		return { sections };
	};

	const { sections } = parseRightContent(contentForSections);
	const summary = extractedSummary;

	return (
		<div
			className="page-break"
			style={{
				width: "210mm",
				minHeight: "297mm",
				maxHeight: "297mm",
				padding: "15mm 20mm",
				position: "relative",
				backgroundColor: "white",
				boxSizing: "border-box",
				overflow: "hidden",
				printColorAdjust: "exact",
				WebkitPrintColorAdjust: "exact",
			}}
		>
			{/* Date */}
			<div
				style={{
					position: "absolute",
					top: "16px",
					right: "16px",
					color: "#666",
				}}
			>
				{new Date().toLocaleDateString(dateLocale).replace(/\//g, "/")}
			</div>

			{/* Vertical Title - Two Columns */}
			<div
				style={{
					display: "flex",
					gap: "20px",
					marginBottom: "16px",
				}}
			>
				<div style={{ display: "flex", gap: "0px" }}>
					{/* First Column: 財星/感情/調候 */}
					<div style={{ writingMode: "vertical-rl" }}>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							{getTabLabel("right", concern).charAt(0)}
						</span>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							{getTabLabel("right", concern).charAt(1)}
						</span>
					</div>
					{/* Second Column: 定位 */}
					<div style={{ writingMode: "vertical-rl" }}>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							定
						</span>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							位
						</span>
					</div>
				</div>

				{/* Description */}
				<div style={{ flex: 1 }}>
					<div
						style={{
							fontSize: "13px",
							lineHeight: "1.6",
							marginBottom: "14px",
						}}
					>
						甚麼是
						{getTabLabel("right", concern).substring(0, 2)}
						甚麼是
						{getTabLabel("right", concern).substring(0, 2)}
						甚麼是
						{getTabLabel("right", concern).substring(0, 2)}
						甚麼是
						{getTabLabel("right", concern).substring(0, 2)}
						甚麼是
						{getTabLabel("right", concern).substring(0, 2)}。
					</div>
				</div>
			</div>

			{/* Content Sections in Two Columns */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "16px 20px",
					marginBottom: "16px",
				}}
			>
				{sections.map((section, index) => (
					<div key={index}>
						<h3
							style={{
								fontSize: "15px",
								fontWeight: "bold",
								color: concernColor,
								marginBottom: "6px",
							}}
						>
							{section.title}
						</h3>
						<p
							style={{
								fontSize: "12px",
								lineHeight: "1.6",
								textAlign: "justify",
							}}
						>
							{section.content}
						</p>
					</div>
				))}
			</div>

			{/* 總結 Section */}
			<div style={{ marginTop: "16px" }}>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: "8px",
						marginBottom: "8px",
					}}
				>
					<h2
						style={{
							fontSize: "36px",
							fontWeight: "bold",
							color: "#666",
							whiteSpace: "nowrap",
						}}
					>
						總結
					</h2>
					<div style={{ flex: 1, paddingTop: "12px" }}>
						<div
							style={{
								height: "3px",
								backgroundColor: concernColor,
								width: "70px",
							}}
						></div>
					</div>
				</div>
				<p
					style={{
						fontSize: "12px",
						lineHeight: "1.6",
						textAlign: "justify",
					}}
				>
					{summary}
				</p>
			</div>

			{/* Footer */}
			<div
				style={{
					marginTop: "12px",
					textAlign: "center",
					color: "#999",
					fontSize: "10px",
				}}
			>
				HarmoniQ Bell
			</div>
		</div>
	);
}
