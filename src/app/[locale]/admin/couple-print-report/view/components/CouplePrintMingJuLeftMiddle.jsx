"use client";

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

function parseJsonContent(content) {
	if (!content || typeof content !== "string") return null;
	let clean = content.trim();
	if (clean.startsWith("```json"))
		clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
	else if (clean.startsWith("```"))
		clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
	const match = clean.match(/\{[\s\S]*\}/);
	if (match) clean = match[0];
	try {
		return JSON.parse(clean);
	} catch {
		return null;
	}
}

function renderStructuredSections(data) {
	if (!data || typeof data !== "object") return null;
	return (
		<div className="space-y-2" style={{ marginTop: "12px" }}>
			{Object.entries(data).map(([section, sectionData], index) => (
				<div key={index}>
					<h3
						className="font-bold text-[#B4003C] mb-1"
						style={{
							fontSize: "13px",
							fontFamily: "Noto Sans HK, sans-serif",
						}}
					>
						{section}
					</h3>
					{sectionData.主要内容 && (
						<div className="mb-1">
							<p
								className="leading-relaxed text-gray-800"
								style={{ fontSize: "11px" }}
							>
								{sectionData.主要内容}
							</p>
						</div>
					)}
					{sectionData.主要分析 && (
						<div className="mb-1">
							<p
								className="leading-relaxed text-gray-800"
								style={{ fontSize: "11px" }}
							>
								{sectionData.主要分析}
							</p>
						</div>
					)}
					{sectionData.状态列表 && (
						<ul className=" mb-2 pl-4">
							{sectionData.状态列表.map((item, idx) => (
								<li key={idx} className="flex items-start">
									<span
										className="text-[#C74772] mr-2"
										style={{ fontSize: "11px" }}
									>
										•
									</span>
									<span
										className="text-gray-700"
										style={{ fontSize: "11px" }}
									>
										{item}
									</span>
								</li>
							))}
						</ul>
					)}
					{sectionData.关键问题 && (
						<div className="mb-1">
							<h4
								className="font-semibold text-gray-800 mb-1"
								style={{ fontSize: "13px" }}
							>
								關鍵問題：
							</h4>
							{Object.entries(sectionData.关键问题).map(
								([key, problem], idx) => (
									<div key={idx} className="mb-1 ml-3">
										<p
											className="font-medium text-[#4B6EB2]"
											style={{ fontSize: "11px" }}
										>
											{problem.名称}
										</p>
										<p
											className="text-gray-600"
											style={{ fontSize: "11px" }}
										>
											{problem.解释}
										</p>
									</div>
								),
							)}
						</div>
					)}
					{sectionData.互动列表 && (
						<div className="mb-1">
							<h4
								className="font-semibold text-gray-800 mb-1"
								style={{ fontSize: "13px" }}
							>
								互動分析：
							</h4>
							{sectionData.互动列表.map((item, idx) => (
								<div key={idx} className="mb-1 ml-4">
									<p
										className="font-medium text-[#4B6EB2]"
										style={{ fontSize: "11px" }}
									>
										{item.方面}
									</p>
									<p
										className="text-gray-600"
										style={{ fontSize: "11px" }}
									>
										{item.特點}
									</p>
								</div>
							))}
						</div>
					)}
					{sectionData.结论 && (
						<div className=" bg-white rounded border-l-4 border-[#B4003C]">
							<p
								className="font-medium text-gray-800"
								style={{ fontSize: "11px" }}
							>
								{sectionData.结论}
							</p>
						</div>
					)}
					{sectionData.格局核心 && (
						<div className=" bg-white rounded border-l-4 border-[#B4003C]">
							<p
								className="font-medium text-gray-800"
								style={{ fontSize: "11px" }}
							>
								核心：{sectionData.格局核心}
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

const SECTION_BAR_BG = "#";
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

	const wuxingStart = lines.findIndex((l) => l.includes("五行調和方案"));
	const strategyStart = lines.findIndex((l) => l.includes("長期配對策略"));
	const lastStart = lines.findIndex((l) => l.includes("最後段落"));

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
};

export default function CouplePrintMingJuLeftMiddle({
	leftContent,
	middleContent,
}) {
	const hasLeft = leftContent && leftContent.trim();
	const hasMiddle = middleContent && middleContent.trim();
	const middleData = hasMiddle ? parseJsonContent(middleContent) : null;

	if (!hasLeft && !hasMiddle) return null;

	return (
		<>
			{/* Page 1: Left — 日月互動 */}
			{hasLeft && (
				<div className="mx-auto bg-white page-break" style={pageStyle}>
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
				</div>
			)}

			{/* Page 2: Middle — 夫妻宮寅未暗合 */}
			{hasMiddle && (
				<div className="mx-auto bg-white page-break" style={pageStyle}>
					<div style={{ width: "100%", boxSizing: "border-box" }}>
						<h3
							className="font-bold text-[#B4003C] mb-1"
							style={{
								fontSize: "15px",
								fontFamily: "Noto Sans HK, sans-serif",
							}}
						>
							夫妻宮寅未暗合
						</h3>
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
				</div>
			)}
		</>
	);
}
