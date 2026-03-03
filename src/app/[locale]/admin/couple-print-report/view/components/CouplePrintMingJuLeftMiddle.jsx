"use client";

import Image from "next/image";

/**
 * Print page: 命局分析（一）— left (日月互動) + middle (夫妻宮寅未暗合) combined.
 * Topics as section headings (words only, no tabs). Content same format as web.
 */
const COUPLE_COLOR = "#B4003C";
const ACCENT = "#C74772";
/** Line height for vertical title 日月互動 (spacing between 日/月 and 互/動). e.g. 1, 1.2, 1.5 */
const VERTICAL_TITLE_LINE_HEIGHT = 1.2;
/** Dark red for numbered section titles (01 甲己合土 style) */
const NUMBER_TITLE_COLOR = "#8B2942";

/** Parse bullet text "**引水調候**：內容..." into { title, content }. Strips ** from content. */
function parseBulletTitleContent(text) {
	if (!text || typeof text !== "string")
		return { title: "", content: text || "" };
	const match = text.match(/^\s*\*\*(.+?)\*\*[：:]\s*(.*)/s);
	if (match) return { title: match[1].trim(), content: match[2].trim() };
	const colonIdx =
		text.indexOf("：") >= 0 ? text.indexOf("：") : text.indexOf(":");
	if (colonIdx > 0)
		return {
			title: text.slice(0, colonIdx).replace(/\*\*/g, "").trim(),
			content: text.slice(colonIdx + 1).trim(),
		};
	return { title: "", content: text.replace(/\*\*/g, "").trim() };
}

/** Extract the first complete {...} object by counting braces (handles } inside strings). */
function extractJsonObject(str) {
	const start = str.indexOf("{");
	if (start < 0) return null;
	let depth = 0;
	let inString = false;
	let escape = false;
	let quote = null;
	for (let i = start; i < str.length; i++) {
		const c = str[i];
		if (escape) {
			escape = false;
			continue;
		}
		if (c === "\\" && inString) {
			escape = true;
			continue;
		}
		if (!inString) {
			if (c === '"' || c === "'") {
				inString = true;
				quote = c;
				continue;
			}
			if (c === "{") depth++;
			else if (c === "}") {
				depth--;
				if (depth === 0) return str.slice(start, i + 1);
			}
			continue;
		}
		if (c === quote) inString = false;
	}
	return null;
}

function parseJsonContent(content) {
	if (content == null) return null;
	// Already parsed object (e.g. from API)
	if (typeof content === "object" && !Array.isArray(content)) return content;
	if (typeof content !== "string") return null;

	let clean = content
		.trim()
		.replace(/\uFEFF/g, "")
		.replace(/\r\n/g, "\n");
	// Strip markdown code fence
	if (clean.startsWith("```json"))
		clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
	else if (clean.startsWith("```"))
		clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
	// Strip leading title line e.g. "夫妻宮寅未暗合" so we start at {
	const firstBrace = clean.indexOf("{");
	if (firstBrace > 0) clean = clean.slice(firstBrace);
	const jsonStr = extractJsonObject(clean);
	if (!jsonStr) return null;
	// Fix common invalid JSON: trailing commas before ] or }
	const toParse = jsonStr.replace(/,(\s*[}\]])/g, "$1");
	try {
		return JSON.parse(toParse);
	} catch {
		return null;
	}
}

const MIDDLE_ACCENT = "#A47584";
const MIDDLE_BODY_SIZE = "12px";
const MIDDLE_TITLE_NUM_SIZE = "25px";
const MIDDLE_TITLE_TEXT_SIZE = "18px";

/** Map simplified Chinese JSON keys to traditional for display */
const MIDDLE_SECTION_DISPLAY_NAMES = {
	合盘核心: "合盤核心",
	夫妻互动关键: "夫妻互動關鍵",
};

function renderStructuredSections(data) {
	if (!data || typeof data !== "object") return null;

	const entries = Object.entries(data);
	const sectionNum = (i) => String(i + 1).padStart(2, "0");
	const sectionDisplayName = (key) =>
		MIDDLE_SECTION_DISPLAY_NAMES[key] || key;

	const SectionHeader = ({ num, title }) => (
		<div
			style={{
				display: "flex",
				alignItems: "baseline",
				gap: "8px",
				marginBottom: "px",
			}}
		>
			<span
				style={{
					fontSize: MIDDLE_TITLE_NUM_SIZE,
					fontWeight: 700,
					color: "red",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				}}
			>
				{num}
			</span>
			<span
				style={{
					fontSize: MIDDLE_TITLE_TEXT_SIZE,
					fontWeight: 700,
					color: "black",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				}}
			>
				{title}
			</span>
		</div>
	);

	const SubBlock = ({ label, children }) => (
		<div style={{ marginBottom: "5px" }}>
			<div
				style={{
					backgroundColor: MIDDLE_ACCENT,
					color: "#fff",
					fontSize: "15px",
					fontWeight: 700,
					padding: "8px 10px",
					marginBottom: "8px",
					textAlign: "center",
					fontFamily: "Noto Sans HK, sans-serif",
				}}
			>
				{label}
			</div>
			<p
				style={{
					fontSize: MIDDLE_BODY_SIZE,
					lineHeight: 1.7,
					color: "#333",
					margin: 0,
				}}
			>
				{children}
			</p>
		</div>
	);

	return (
		<div style={{ marginTop: "5px" }}>
			{entries.map(([section, sectionData], index) => (
				<div key={index} style={{ marginBottom: "5px" }}>
					<SectionHeader
						num={sectionNum(index)}
						title={sectionDisplayName(section)}
					/>

					{/* 合盤核心: 主要内容 + 状态列表 + 结论 box */}
					{sectionData.主要内容 && (
						<p
							style={{
								fontSize: MIDDLE_BODY_SIZE,
								lineHeight: 1.7,
								color: "#333",
								marginBottom: "10px",
							}}
						>
							{sectionData.主要内容}
						</p>
					)}
					{sectionData.主要分析 && (
						<p
							style={{
								fontSize: MIDDLE_BODY_SIZE,
								lineHeight: 1.7,
								color: "#333",
								marginBottom: "5px",
							}}
						>
							{sectionData.主要分析}
						</p>
					)}
					{sectionData.状态列表 &&
						sectionData.状态列表.length > 0 && (
							<ul
								style={{
									margin: "0 0 12px 0",
									paddingLeft: "20px",
									fontSize: MIDDLE_BODY_SIZE,
									lineHeight: 1.7,
									color: "#333",
								}}
							>
								{sectionData.状态列表.map((item, idx) => (
									<li
										key={idx}
										style={{ marginBottom: "4px" }}
									>
										· {item}
									</li>
								))}
							</ul>
						)}
					{sectionData.结论 && (
						<div
							style={{
								border: "1px solid",
								borderRadius: "8px",
								padding: "12px 14px",
								marginTop: "8px",
							}}
						>
							<p
								style={{
									fontSize: MIDDLE_BODY_SIZE,
									fontWeight: 700,
									lineHeight: 1.7,
									color: "#333",
									margin: 0,
								}}
							>
								{sectionData.结论}
							</p>
						</div>
					)}

					{/* 关键问题: two-column layout */}
					{sectionData.关键问题 &&
						Object.keys(sectionData.关键问题).length > 0 && (
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "20px 24px",
									marginTop: "12px",
								}}
							>
								{Object.entries(sectionData.关键问题).map(
									([key, problem]) => (
										<SubBlock
											key={key}
											label={problem.名称}
										>
											{problem.解释}
										</SubBlock>
									),
								)}
							</div>
						)}

					{/* 互动列表: two-column for first two, then full-width 格局核心 */}
					{sectionData.互动列表 &&
						sectionData.互动列表.length > 0 && (
							<>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "20px 24px",
										marginTop: "12px",
									}}
								>
									{sectionData.互动列表
										.slice(0, 2)
										.map((item, idx) => (
											<SubBlock
												key={idx}
												label={item.方面}
											>
												{item.特點 ?? item.特点}
											</SubBlock>
										))}
								</div>
								{sectionData.互动列表.length > 2 &&
									sectionData.互动列表
										.slice(2)
										.map((item, idx) => (
											<SubBlock
												key={idx}
												label={item.方面}
											>
												{item.特點 ?? item.特点}
											</SubBlock>
										))}
								{/* {sectionData.格局核心 && (
									<div style={{ marginTop: "12px" }}>
										<div
											style={{
												backgroundColor: MIDDLE_ACCENT,
												color: "#fff",
												fontSize: "13px",
												fontWeight: 700,
												padding: "8px 12px",
												marginBottom: "8px",
												textAlign: "center",
												fontFamily:
													"Noto Sans HK, sans-serif",
												width: "100%",
												boxSizing: "border-box",
											}}
										>
											格局核心
										</div>
										<p
											style={{
												fontSize: MIDDLE_BODY_SIZE,
												lineHeight: 1.7,
												color: "#333",
												margin: 0,
											}}
										>
											{sectionData.格局核心}
										</p>
									</div>
								)} */}
							</>
						)}

					{/* 格局核心 only (no 互动列表) */}
					{sectionData.格局核心 &&
						(!sectionData.互动列表 ||
							sectionData.互动列表.length === 0) && (
							<div style={{ marginTop: "12px" }}>
								<div
									style={{
										backgroundColor: MIDDLE_ACCENT,
										color: "#fff",
										fontSize: "13px",
										fontWeight: 700,
										padding: "8px 12px",
										marginBottom: "8px",
										textAlign: "center",
										fontFamily: "Noto Sans HK, sans-serif",
										width: "100%",
										boxSizing: "border-box",
									}}
								>
									格局核心
								</div>
								<p
									style={{
										fontSize: MIDDLE_BODY_SIZE,
										lineHeight: 1.7,
										color: "#333",
										margin: 0,
									}}
								>
									{sectionData.格局核心}
								</p>
							</div>
						)}
				</div>
			))}
		</div>
	);
}

// Strip only the number prefix (1. 2. 3. 4.); keep section titles 五行調和方案：, 長期配對策略：, 最後段落：. Remove "1. 第一段：" entirely for first paragraph.
function stripNumberedLabel(text) {
	if (!text || typeof text !== "string") return text;
	return text
		.replace(/^1\.\s*第一段[：:]?\s*/, "")
		.replace(/^2\.\s*/, "")
		.replace(/^3\.\s*/, "")
		.replace(/^4\.\s*/, "");
}

// Lines we never show (prompt/format leftovers)
function isFormattingOnlyLine(line) {
	const t = (line || "").trim();
	return (
		t === "【標題格式】" ||
		t === "【标题格式】" ||
		t === "內容結構：" ||
		t === "內容結構" ||
		t === "内容结构：" ||
		t === "内容结构"
	);
}

/** Dark beige for section title bars (五行調和方案, 長期配對策略) — was "#" (invalid). */
const SECTION_BAR_BG = "#A47584";
const VERTICAL_TITLE_COLOR = "#666666";

function parseLeftContentSections(content) {
	if (!content || typeof content !== "string")
		return {
			elementPairing: "",
			mainDescription: "",
			wuxingBullets: [],
			strategyBullets: [],
			summaryParagraph: "",
		};
	const lines = content
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

	let elementPairing = "";
	const titleLineIndex = lines.findIndex((l) => l.includes("合盤分析】"));
	if (titleLineIndex >= 0) {
		const m = lines[titleLineIndex].match(/【(.+?)合盤分析】/);
		if (m) elementPairing = m[1].trim();
	}
	if (!elementPairing && lines.length > 0) {
		const pairLine = lines.find(
			(l) => l.includes("配") && l.length <= 12 && l.length >= 4,
		);
		if (pairLine) elementPairing = pairLine;
	}

	let mainDescription = "";
	const descIdx = lines.findIndex(
		(l, i) =>
			(i > titleLineIndex || titleLineIndex < 0) &&
			l.includes("賦予") &&
			l.includes("全局"),
	);
	if (descIdx >= 0) mainDescription = stripNumberedLabel(lines[descIdx]);

	const wuxingStart = lines.findIndex(
		(l) => l.includes("五行調和方案") || l.includes("五行调和方案"),
	);
	const strategyStart = lines.findIndex(
		(l) => l.includes("長期配對策略") || l.includes("长期配对策略"),
	);
	const lastStart = lines.findIndex(
		(l) => l.includes("最後段落") || l.includes("最后段落"),
	);

	const extractBullets = (startIdx, endIdx) => {
		if (startIdx < 0) return [];
		const end = endIdx > startIdx ? endIdx : lines.length;
		const block = lines.slice(startIdx + 1, end).join("\n");
		return block
			.split(/\n/)
			.map((s) => s.trim())
			.filter(
				(s) =>
					s.startsWith("- ") ||
					s.startsWith("－") ||
					s.startsWith("• "),
			)
			.map((s) => s.replace(/^[-－•]\s*/, "").trim())
			.filter(Boolean);
	};

	let wuxingBullets = extractBullets(
		wuxingStart,
		strategyStart >= 0
			? strategyStart
			: lastStart >= 0
				? lastStart
				: lines.length,
	);
	let strategyBullets = extractBullets(
		strategyStart,
		lastStart >= 0 ? lastStart : lines.length,
	);

	// If API returned all 6 under 五行 only, or duplicated in both: first 3 = 五行調和方案, last 3 = 長期配對策略
	if (wuxingBullets.length >= 6 && strategyBullets.length <= 3) {
		const firstThree = wuxingBullets.slice(0, 3);
		const lastThree = wuxingBullets.slice(3, 6);
		wuxingBullets = firstThree;
		if (strategyBullets.length === 0) strategyBullets = lastThree;
	} else if (
		wuxingBullets.length === 6 &&
		strategyBullets.length === 6 &&
		JSON.stringify(wuxingBullets) === JSON.stringify(strategyBullets)
	) {
		wuxingBullets = wuxingBullets.slice(0, 3);
		strategyBullets = strategyBullets.slice(3, 6);
	}

	let summaryParagraph = "";
	if (lastStart >= 0) {
		const lastLine = lines[lastStart];
		const afterColon = lastLine.replace(/^[^：:]*[：:]\s*/, "").trim();
		const rest = lines
			.slice(lastStart + 1)
			.map((l) => stripNumberedLabel(l))
			.filter((l) => !isFormattingOnlyLine(l))
			.join(" ")
			.trim();
		summaryParagraph = [afterColon, rest].filter(Boolean).join(" ");
	}

	return {
		elementPairing,
		mainDescription,
		wuxingBullets,
		strategyBullets,
		summaryParagraph,
	};
}

function formatLeftContent(content) {
	if (!content) return null;

	const {
		elementPairing,
		mainDescription,
		wuxingBullets,
		strategyBullets,
		summaryParagraph,
	} = parseLeftContentSections(content);

	const hasStructured =
		elementPairing ||
		mainDescription ||
		wuxingBullets.length > 0 ||
		strategyBullets.length > 0 ||
		summaryParagraph;
	if (!hasStructured)
		return (
			<div className="whitespace-pre-line text-black leading-relaxed">
				{content}
			</div>
		);

	return (
		<div
			style={{
				fontFamily:
					"Noto Serif TC, Noto Sans HK, system-ui, sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					gap: "20px",
					marginBottom: "16px",
				}}
			>
				<div style={{ display: "flex" }}>
					{/* First Column: 日 月 — lineHeight controls spacing between chars */}
					<div
						style={{
							writingMode: "vertical-rl",
							lineHeight: VERTICAL_TITLE_LINE_HEIGHT,
						}}
					>
						<span
							style={{
								fontSize: "60px",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: "bold",
								letterSpacing: "0",
								color: "#A47584",
							}}
						>
							日
						</span>
						<span
							style={{
								fontSize: "60px",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: "bold",
								letterSpacing: "0",
								color: "#A47584",
							}}
						>
							月
						</span>
					</div>
					{/* Second Column: 互 動 */}
					<div
						className="border-r-1"
						style={{
							writingMode: "vertical-rl",
							lineHeight: VERTICAL_TITLE_LINE_HEIGHT,
						}}
					>
						<span
							style={{
								fontSize: "60px",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: "bold",
								letterSpacing: "0",
							}}
						>
							互
						</span>
						<span
							style={{
								fontSize: "60px",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: "bold",
								letterSpacing: "0",
							}}
						>
							動
						</span>
					</div>
				</div>
				<div style={{ flex: 1 }}>
					{elementPairing && (
						<div
							style={{
								display: "inline-block",
								backgroundColor: SECTION_BAR_BG,
								color: "#fff",
								fontSize: "15px",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: 800,
								padding: "5px 40px",
								marginBottom: "16px",
							}}
						>
							{elementPairing}
						</div>
					)}
					{mainDescription && (
						<p
							style={{
								fontSize: "13px",
								lineHeight: 1.5,
								color: "#333",
								textAlign: "justify",
								margin: 0,
							}}
						>
							{mainDescription}
						</p>
					)}
				</div>
			</div>

			{wuxingBullets.length > 0 && (
				<div style={{ marginBottom: "20px" }}>
					<div
						style={{
							width: "25%",
							backgroundColor: SECTION_BAR_BG,
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							color: "#fff",
							fontSize: "17px",
							fontWeight: 900,
							padding: "6px",
							marginBottom: "5px",
							textAlign: "center",
						}}
					>
						五行調和方案
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px 28px",
							fontSize: "11px",
							lineHeight: 1.65,
							color: "#333",
						}}
					>
						{wuxingBullets.map((text, idx) => {
							const { title, content } =
								parseBulletTitleContent(text);
							return (
								<div
									key={idx}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "6px",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "baseline",
											gap: "6px",
										}}
									>
										<span
											style={{
												fontSize: "20px",
												fontWeight: 700,
												color: NUMBER_TITLE_COLOR,
												fontFamily:
													"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											}}
										>
											{String(idx + 1).padStart(2, "0")}
										</span>
										{title && (
											<span
												style={{
													fontSize: "20px",
													fontWeight: 700,
													color: NUMBER_TITLE_COLOR,
													fontFamily:
														"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												}}
											>
												{title}
											</span>
										)}
									</div>
									<div
										style={{
											width: "40%",
											height: "1px",
											backgroundColor: "#333",
											minWidth: "60px",
										}}
									/>
									<div
										style={{
											color: "#444",
											fontWeight: 400,
											fontSize: "13px",
										}}
									>
										· {content}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{strategyBullets.length > 0 && (
				<div style={{ marginBottom: "20px" }}>
					<div
						style={{
							width: "25%",
							backgroundColor: SECTION_BAR_BG,
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							color: "#fff",
							fontSize: "17px",
							fontWeight: 900,
							padding: "6px",
							marginBottom: "5px",
							textAlign: "center",
						}}
					>
						長期配對策略
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px 28px",
							fontSize: "11px",
							lineHeight: 1.65,
							color: "#333",
						}}
					>
						{strategyBullets.map((text, idx) => {
							const { title, content } =
								parseBulletTitleContent(text);
							return (
								<div
									key={idx}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "6px",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "baseline",
											gap: "6px",
										}}
									>
										<span
											style={{
												fontSize: "20px",
												fontWeight: 700,
												color: NUMBER_TITLE_COLOR,
												fontFamily:
													"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											}}
										>
											{String(idx + 1).padStart(2, "0")}
										</span>
										{title && (
											<span
												style={{
													fontSize: "20px",
													fontWeight: 700,
													color: NUMBER_TITLE_COLOR,
													fontFamily:
														"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												}}
											>
												{title}
											</span>
										)}
									</div>
									<div
										style={{
											width: "40%",
											height: "1px",
											backgroundColor: "#333",
											minWidth: "60px",
										}}
									/>
									<div
										style={{
											color: "#444",
											fontWeight: 400,
											fontSize: "13px",
										}}
									>
										· {content}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{summaryParagraph && (
				<div
					style={{
						marginTop: "24px",
						borderRadius: "16px",
						border: "1px solid",
						padding: "24px 22px",
						display: "flex",
						gap: "12px",
						alignItems: "flex-start",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "12px",
						}}
					>
						<span
							style={{
								writingMode: "vertical-rl",
								textOrientation: "upright",
								fontSize: "50px",
								fontWeight: 700,
								lineHeight: 1,
								color: "#A47584",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							}}
						>
							總結
						</span>
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<p
							style={{
								fontSize: "13px",
								lineHeight: 1.8,
								color: "#333",
								textAlign: "justify",
								margin: 0,
							}}
						>
							{summaryParagraph}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

const pageStyle = {
	width: "210mm",
	minHeight: "297mm",
	padding: "14mm 18mm",
	boxSizing: "border-box",
	overflow: "hidden",
	position: "relative",
};

/** Top date + footer — same as CouplePrintSeason (Page7_Seasons) */
const dateStyle = {
	fontFamily: "Noto Serif TC, serif",
	fontStyle: "extrabold",
	fontWeight: 400,
	fontSize: "20px",
	lineHeight: "14px",
	color: "#424242",
	textAlign: "right",
};

export default function CouplePrintMingJuLeftMiddle({
	leftContent,
	middleContent,
}) {
	const hasLeft =
		leftContent != null &&
		(typeof leftContent !== "string" || leftContent.trim() !== "");
	const hasMiddle =
		middleContent != null &&
		(typeof middleContent !== "string" || middleContent.trim() !== "");
	const middleData = hasMiddle ? parseJsonContent(middleContent) : null;

	if (!hasLeft && !hasMiddle) return null;

	return (
		<>
			{/* Page 1: Left — 日月互動 */}
			{hasLeft && (
				<div className="mx-auto bg-white page-break" style={pageStyle}>
					<div
						style={{
							position: "absolute",
							right: "18mm",
							top: "8mm",
							...dateStyle,
						}}
					>
						{new Date()
							.toLocaleDateString("zh-TW")
							.replace(/\//g, "/")}
					</div>
					<div style={{ width: "100%", boxSizing: "border-box" }}>
						<div
							style={{
								backgroundColor: "white",
								color: "black",
							}}
						>
							{formatLeftContent(leftContent)}
						</div>
					</div>
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
			)}

			{/* Page 2: Middle — 夫妻宮寅未暗合 */}
			{hasMiddle && (
				<div className="mx-auto bg-white page-break" style={pageStyle}>
					<div
						style={{
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							marginBottom: "12px",
						}}
					>
						<h3
							className="font-bold text-[#A47584] mb-1"
							style={{
								fontSize: "35px",
								letterSpacing: "0.20em",
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontWeight: 700,
							}}
						>
							夫妻宮寅未暗合
						</h3>
						<div style={dateStyle}>
							{new Date()
								.toLocaleDateString("zh-TW")
								.replace(/\//g, "/")}
						</div>
					</div>
					<div style={{ width: "100%", boxSizing: "border-box" }}>
						<div
							style={{
								fontFamily:
									"system-ui, -apple-system, sans-serif",
							}}
						>
							{middleData ? (
								renderStructuredSections(middleData)
							) : (
								<div
									className="whitespace-pre-wrap text-gray-700 leading-relaxed"
									style={{ fontSize: "11px" }}
								>
									{middleContent
										.replace(/\*\*/g, "")
										.substring(0, 2500)}
								</div>
							)}
						</div>
					</div>
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
			)}
		</>
	);
}
