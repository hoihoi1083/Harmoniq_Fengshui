"use client";

/**
 * Print page: 命局分析（一）— left (日月互動) + middle (夫妻宮寅未暗合) combined.
 * Topics as section headings (words only, no tabs). Content same format as web.
 */
const COUPLE_COLOR = "#B4003C";
const ACCENT = "#C74772";

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
	return t === "【標題格式】" || t === "【标题格式】" || t === "內容結構：" || t === "內容結構" || t === "内容结构：" || t === "内容结构";
}

function formatLeftContent(content) {
	if (!content) return null;
	const lines = content.split("\n").filter((l) => l.trim());
	const titleLineIndex = lines.findIndex((l) => l.includes("合盤分析】"));
	if (titleLineIndex === -1) {
		return (
			<div
				className="whitespace-pre-line text-black leading-relaxed"
				style={{ fontSize: "13px", lineHeight: 1.7 }}
			>
				{content}
			</div>
		);
	}
	const titleLine = lines[titleLineIndex];
	const titleMatch = titleLine.match(/【(.+?)合盤分析】/);
	const elementPairing = titleMatch ? titleMatch[1] : "";
	const fullContent = lines.slice(titleLineIndex + 1).join(" ");
	const patternMatch = fullContent.match(/([^，。]+?格局)/);
	const patternDescription = patternMatch ? patternMatch[1] : "";
	const mainDescIndex = lines.findIndex(
		(l, i) =>
			i > titleLineIndex && l.includes("賦予") && l.includes("全局"),
	);
	const mainDescriptionRaw = mainDescIndex !== -1 ? lines[mainDescIndex] : "";
	const mainDescription = stripNumberedLabel(mainDescriptionRaw);
	const findSection = (startText) => {
		const start = lines.findIndex((l) => l.includes(startText));
		if (start === -1) return [];
		const out = [];
		for (let i = start; i < lines.length; i++) {
			const line = lines[i];
			if (
				i > start &&
				(line.includes("方案：") ||
					line.includes("策略：") ||
					line.includes("此局"))
			)
				break;
			out.push(line);
		}
		return out;
	};
	const wuxingSection = findSection("五行調和方案：");
	const strategySection = findSection("長期配對策略：");
	const restLines = lines.filter(
		(l) =>
			!l.includes("合盤分析】") &&
			!l.includes("五行調和方案：") &&
			!l.includes("長期配對策略：") &&
			!wuxingSection.includes(l) &&
			!strategySection.includes(l) &&
			l !== mainDescriptionRaw &&
			!isFormattingOnlyLine(l),
	);

	return (
		<div
			className="space-y-2"
			style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
		>
			{/* Title and Pattern - same as web formatLeftTabContent */}
			<div className="flex items-center justify-start gap-6">
				<h1
					className="text-[#C74772]"
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontSize: "15px",
						fontWeight: 400,
						lineHeight: 1,
						WebkitTextStroke: "1px #B4003C",
					}}
				>
					{elementPairing}
				</h1>
				{patternDescription && (
					<div
						className="bg-[#C74772] text-white  rounded-full"
						style={{ fontSize: "10px", fontWeight: 500 }}
					>
						{patternDescription}
					</div>
				)}
			</div>
			{/* Main Description */}
			{mainDescription && (
				<div
					className="leading-relaxed text-black"
					style={{ fontSize: "11px" }}
				>
					{mainDescription}
				</div>
			)}
			<div className="bg-[#EFEFEF] p-2  rounded-lg">
				{/* 五行調和方案 - same as web, without "2. 五行調和方案：" */}
				{wuxingSection.length > 0 && (
					<div className="text-black">
						{wuxingSection
							.map((line) => stripNumberedLabel(line))
							.filter((line) => line.trim() && !isFormattingOnlyLine(line))
							.map((line, i) => (
								<div
									key={i}
									className="mb-0"
									style={{ fontSize: "11px" }}
								>
									{line}
								</div>
							))}
					</div>
				)}
				{/* 長期配對策略 - same as web, without "3. 長期配對策略：" */}
				{strategySection.length > 0 && (
					<div className="text-black">
						{strategySection
							.map((line) => stripNumberedLabel(line))
							.filter((line) => line.trim() && !isFormattingOnlyLine(line))
							.map((line, i) => (
								<div
									key={i}
									className="mb-0"
									style={{ fontSize: "11px" }}
								>
									{line}
								</div>
							))}
					</div>
				)}
				{/* 最後段落 - without "4. 最後段落：" */}
				{restLines.filter((l) => !isFormattingOnlyLine(l)).length > 0 && (
					<div
						className="leading-relaxed text-black mt-2"
						style={{ fontSize: "11px" }}
					>
						{restLines
							.filter((l) => !isFormattingOnlyLine(l))
							.map((line, i) => (
								<p key={i} className="mb-1">
									{stripNumberedLabel(line)}
								</p>
							))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function CouplePrintMingJuLeftMiddle({
	leftContent,
	middleContent,
}) {
	const hasLeft = leftContent && leftContent.trim();
	const hasMiddle = middleContent && middleContent.trim();
	const middleData = hasMiddle ? parseJsonContent(middleContent) : null;

	if (!hasLeft && !hasMiddle) return null;

	return (
		<div
			className="mx-auto bg-white page-break"
			style={{
				width: "210mm",
				minHeight: "297mm",
				padding: "14mm 18mm",
				boxSizing: "border-box",
				overflow: "hidden",
			}}
		>
			{/* Card container */}
			<div
				style={{
					width: "100%",

					boxSizing: "border-box",
				}}
			>
				{/* Topic headings only (no tabs) */}
				{hasLeft && (
					<>
						<h3
							className="font-bold text-[#B4003C] mb-1"
							style={{
								fontSize: "16px",
								fontFamily: "Noto Sans HK, sans-serif",
							}}
						>
							日月互動
						</h3>
						<div
							className="mb-2"
							style={{ backgroundColor: "white", color: "black" }}
						>
							<div className="py-2">
								{formatLeftContent(leftContent)}
							</div>
						</div>
					</>
				)}

				{hasMiddle && (
					<>
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
					</>
				)}
			</div>
		</div>
	);
}
