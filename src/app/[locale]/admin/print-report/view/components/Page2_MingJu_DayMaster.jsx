// Page 2: 日主特性 - MingJu Analysis (Day Master Traits)
import React from "react";
import { getConcernColor } from "@/utils/colorTheme";
import getWuxingData from "@/lib/nayin";

// Helper function to get accurate Ba Zi data using nayin.js
const getAccurateBaziInfo = (birthDateTime, gender = "male") => {
	try {
		// Use nayin.js to get accurate Ba Zi data
		const wuxingData = getWuxingData(birthDateTime, gender);

		// Extract day master and strength analysis
		const dayMaster = wuxingData.dayStem + wuxingData.dayStemWuxing;
		const yearPillar = wuxingData.yearStem + wuxingData.yearBranch;
		const nayin = wuxingData.nayin;

		// Analyze day master strength based on the wuxing scale
		const wuxingScale = wuxingData.wuxingScale || "";
		const dayElement = wuxingData.dayStemWuxing;

		// Parse wuxing scale to determine strength
		let strength = "中等";
		if (wuxingScale) {
			const elementMatch = wuxingScale.match(
				new RegExp(`${dayElement}:(\\d+\\.?\\d*)%`),
			);
			if (elementMatch) {
				const percentage = parseFloat(elementMatch[1]);
				if (percentage > 35) strength = "偏強";
				else if (percentage < 20) strength = "偏弱";
			}
		}

		// Determine characteristics based on day element
		let characteristics = "";
		let strengths = "";
		let weaknesses = "";

		const elementInfoMap = {
			木: {
				characteristics: "生發向上，成長創新",
				strengths: "創造力強，充滿活力",
				weaknesses: "有時過於理想化",
			},
			火: {
				characteristics: "熱情如火，積極主動",
				strengths: "充滿熱情，感染力強",
				weaknesses: "有時過於衝動",
			},
			土: {
				characteristics: "穩重厚實，包容踏實",
				strengths: "穩重可靠，包容性強",
				weaknesses: "有時缺乏變通",
			},
			金: {
				characteristics: "堅定果決，執行力強",
				strengths: "意志堅定，果斷執行",
				weaknesses: "有時過於剛硬",
			},
			水: {
				characteristics: "靈活變通，智慧深邃",
				strengths: "靈活應變，智慧過人",
				weaknesses: "有時過於多慮",
			},
		};

		const elementInfo = elementInfoMap[dayElement] || elementInfoMap["水"];

		return {
			year: yearPillar,
			element: nayin,
			dayMaster: dayMaster,
			strength: strength,
			characteristics: characteristics,
			strengths: strengths,
			weaknesses: weaknesses,
			// Additional data from nayin.js for more detailed analysis
			wuxingData: wuxingData,
		};
	} catch (error) {
		console.error("Error getting accurate Ba Zi info:", error);
		// Fallback to default data if nayin.js fails
		return {
			year: "庚子",
			element: "壁上土",
			dayMaster: "庚金",
			strength: "中等",
			characteristics: "穩重務實，循序漸進",
			strengths: "穩重可靠、務實進取",
			weaknesses: "有時過於保守、需要創新",
			wuxingData: null,
		};
	}
};

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
			label: "財星定位",
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
			label: "財星定位",
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

	// Map concern types
	const concernMap = {
		健康: "health",
		財運: "wealth",
		事業: "career",
		工作: "career",
		感情: "relationship",
	};

	if (tab === "middle") {
		return getTabConfig(concern).middle.label;
	}
	if (tab === "right") {
		return getTabConfig(concern).right.label;
	}
	return "";
}

// Helper to render JSON format content
const renderPrintJSON = (content) => {
	if (!content || typeof content !== "string") return null;

	try {
		// Try parsing as JSON
		const parsed = JSON.parse(content);

		// Handle keywords format (right tab)
		if (parsed.keywords) {
			return (
				<>
					{parsed.keywords.map((keyword, idx) => (
						<div key={idx} style={{ marginBottom: "12px" }}>
							<h4
								style={{
									fontSize: "14px",
									fontWeight: "bold",
									marginBottom: "4px",
									color: "#333",
								}}
							>
								{keyword.text}
							</h4>
							<p
								style={{
									lineHeight: "1.6",
									fontSize: "12px",
								}}
							>
								{keyword.description}
							</p>
						</div>
					))}
					{parsed.analysis && (
						<div
							style={{
								marginTop: "48px",
								padding: "15px",
								backgroundColor: "#f5f5f5",
								borderRadius: "8px",
							}}
						>
							<p style={{ lineHeight: "1.8" }}>
								{parsed.analysis}
							</p>
						</div>
					)}
				</>
			);
		}

		return null;
	} catch (e) {
		// If not JSON, return as plain text
		return content;
	}
};

export default function Page2_MingJu_DayMaster({ userInfo, leftContent, middleContent }) {
	const concern = userInfo?.concern || "財運";
	const concernColor = getConcernColor(concern);

	// Get BaZi info for display
	const baziInfo = getAccurateBaziInfo(
		userInfo?.birthDateTime,
		userInfo?.gender,
	);

	// Parse leftContent into sections
	const parseSections = (content) => {
		if (!content || content === "內容載入中...")
			return {
				characteristics: [],
				sections: [],
			};

		// Split by emoji numbers to get sections
		const sectionRegex = /[1-5]️⃣\s*([^\n]+)/g;
		const allSections = [];
		let match;

		while ((match = sectionRegex.exec(content)) !== null) {
			allSections.push({
				title: match[1].trim(),
				startIndex: match.index + match[0].length,
			});
		}

		// Extract content for each section
		const sectionsWithContent = allSections.map((section, idx) => {
			const endIndex =
				idx < allSections.length - 1
					? allSections[idx + 1].startIndex -
					  allSections[idx + 1].title.length -
					  3
					: content.length;
			const sectionContent = content.substring(
				section.startIndex,
				endIndex,
			);

			// Extract bullet points
			const bullets = sectionContent
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.startsWith("•"))
				.map((line) => line.replace(/^\s*•\s*/, "").trim());

			return {
				title: section.title,
				content: bullets,
			};
		});

		// First section is characteristics (日主特質)
		const characteristics =
			sectionsWithContent.length > 0
				? sectionsWithContent[0].content
				: [];
		// Rest are the 4 sections
		const sections = sectionsWithContent.slice(1);

		return { characteristics, sections };
	};

	const { characteristics, sections } = parseSections(leftContent);

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
				{new Date().toLocaleDateString("zh-TW").replace(/\//g, "/")}
			</div>

			{/* Vertical Title */}
			<div
				style={{
					display: "flex",
					gap: "32px",
					marginBottom: "40px",
				}}
			>
				<div style={{ display: "flex", gap: "0px" }}>
					{/* First Column: 日主 */}
					<div style={{ writingMode: "vertical-rl" }}>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: "#666",
								letterSpacing: "0",
							}}
						>
							日
						</span>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: "#666",
								letterSpacing: "0",
							}}
						>
							主
						</span>
					</div>
					{/* Second Column: 特性 */}
					<div style={{ writingMode: "vertical-rl" }}>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							特
						</span>
						<span
							style={{
								fontSize: "60px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							性
						</span>
					</div>
				</div>

				<div style={{ flex: 1 }}>
					<div
						style={{
							fontSize: "15px",
							fontWeight: "bold",
							marginBottom: "24px",
							lineHeight: "1.8",
						}}
					>
						{baziInfo?.dayMaster}
						{baziInfo?.strength}，{baziInfo?.element}
						，例：{baziInfo?.characteristics}
					</div>
				</div>
			</div>

			{/* Characteristics section - bullets from 日主特質 */}
			{characteristics.length > 0 && (
				<div
					style={{
						fontSize: "14px",
						lineHeight: "1.6",
						marginBottom: "24px",
					}}
				>
					{characteristics.map((point, idx) => (
						<div
							key={idx}
							style={{
								marginBottom: "4px",
							}}
						>
							• {point}
						</div>
					))}
				</div>
			)}

			{/* Four sections in two-column grid */}
			{sections.length > 0 && (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "20px 32px",
						marginTop: "16px",
					}}
				>
					{sections.map((section, index) => (
						<div key={index}>
							<h3
								style={{
									fontSize: "16px",
									fontWeight: "bold",
									color: concernColor,
									marginBottom: "12px",
								}}
							>
								{String(index + 1).padStart(2, "0")}{" "}
								{section.title}
							</h3>
							<div
								style={{
									fontSize: "12px",
									lineHeight: "1.6",
								}}
							>
								{section.content.map((point, idx) => (
									<div
										key={idx}
										style={{
											marginBottom: "4px",
										}}
									>
										• {point}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Middle Tab Section */}
			<div style={{ marginTop: "24px" }}>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: "24px",
						marginBottom: "20px",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "3px",
						}}
					>
						<h2
							style={{
								fontSize: "20px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							{
								getTabLabel("middle", concern).split("與")[0]
							}
						</h2>
						<h2
							style={{
								fontSize: "20px",
								fontWeight: "bold",
								color: concernColor,
							}}
						>
							&
						</h2>
						<h2
							style={{
								fontSize: "20px",
								fontWeight: "bold",
								color: concernColor,
								letterSpacing: "0",
							}}
						>
							十神
						</h2>
					</div>
					<div style={{ flex: 1, paddingTop: "16px" }}>
						<div
							style={{
								height: "3px",
								backgroundColor: concernColor,
								width: "80px",
								marginBottom: "16px",
							}}
						></div>
						<div
							style={{
								fontSize: "13px",
								lineHeight: "1.6",
							}}
						>
							{renderPrintJSON(middleContent)}
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div
				style={{
					position: "absolute",
					bottom: "16px",
					left: 0,
					right: 0,
					textAlign: "center",
					color: "#999",
					fontSize: "15px",
				}}
			>
				HarmoniQ Bell
			</div>
		</div>
	);
}
