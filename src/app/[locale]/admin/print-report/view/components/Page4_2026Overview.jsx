// Page 4: 2026流年詳解 - Styled exactly like the attached image
import Image from "next/image";

export default function Page4_2026Overview({ data, locale = "zh-TW" }) {
	const isCn = locale === "zh-CN";
	const dateLocale = locale === "zh-CN" ? "zh-CN" : "zh-TW";
	const { year, concern, color } = data;

	// Extract year analysis - the API response is in aiAnalysis
	const rawAnalysis = year?.aiAnalysis || "";

	// Parse sections from the raw API response (markdown format)
	const parseGanzhiContent = (rawText) => {
		if (!rawText) return { ganzhiEffect: "", practicalResults: "" };

		// Extract 【流年干支作用】 section (section 1)
		const ganzhiMatch = rawText.match(
			/### 1\. 【(?:流年干支作用|流年干支作用)】\s*([\s\S]*?)(?=### 2\.|### 【|$)/,
		);
		let ganzhiEffect = ganzhiMatch ? ganzhiMatch[1].trim() : "";

		// Extract 【流年實際表現】 special section (after section 3, before section 4)
		const practicalMatch = rawText.match(
			/### 【(?:流年實際表現|流年实际表现)】\s*([\s\S]*?)(?=### 4\.|$)/,
		);
		let practicalResults = practicalMatch ? practicalMatch[1].trim() : "";

		// Remove AI instruction text
		if (practicalResults) {
			practicalResults = practicalResults.replace(
				/\*{0,2}重要[:：].*?必須包含具體生活場景示例。?\*{0,2}\s*/s,
				"",
			);
		}

		// Clean up the content - remove markdown formatting but keep structure
		const cleanContent = (text) => {
			if (!text) return "";
			return (
				text
					// Remove analysis prefix
					.replace(
						/^分析2026年丙午(?:對|对)原局的整體作用[:：]\s*/m,
						"",
					)
					// Remove markdown bold
					.replace(/\*\*/g, "")
					// Keep line breaks for structure
					.trim()
			);
		};

		return {
			ganzhiEffect: cleanContent(ganzhiEffect),
			practicalResults: cleanContent(practicalResults),
		};
	};

	const parsedContent = parseGanzhiContent(rawAnalysis);
	const ganzhiEffect = parsedContent.ganzhiEffect;
	const practicalResults = parsedContent.practicalResults;

	// Parse the practical results section structure
	const parsePracticalResults = (text) => {
		if (!text) return [];

		// Split by main sections (時間點與變化, 影響程度與形式, 可能情況與挑戰)
		const sections = [];
		const mainSectionRegex =
			/^- (時間點與變化|时间点与变化|影響程度與形式|影响程度与形式|可能情況與挑戰|可能情况与挑战)[:：]/gm;

		let matches = [...text.matchAll(mainSectionRegex)];

		for (let i = 0; i < matches.length; i++) {
			const sectionTitle = matches[i][1];
			const startIndex = matches[i].index + matches[i][0].length;
			const endIndex =
				i < matches.length - 1 ? matches[i + 1].index : text.length;
			const sectionContent = text.substring(startIndex, endIndex).trim();

			// For 時間點與變化, parse time period subsections
			if (sectionTitle === "時間點與變化") {
				const timeSubsections = [];

				// Split by time period patterns: 年初（1-3月）, 年中（4-6月，農曆三月至五月）, etc.
				// Match patterns like: 年初（...）： or 年中（...）：
				const timePattern =
					/(?:年初|年中|下半年|年末|\*\*明年\*\*[^：（]*?)（[^）]+）：/g;
				const matches = [...sectionContent.matchAll(timePattern)];

				if (matches.length > 0) {
					for (let i = 0; i < matches.length; i++) {
						const timeTitle = matches[i][0]
							.replace(/：$/, "")
							.trim(); // Remove trailing ：
						const startIdx =
							matches[i].index + matches[i][0].length;
						const endIdx =
							i < matches.length - 1
								? matches[i + 1].index
								: sectionContent.length;
						const sectionText = sectionContent
							.substring(startIdx, endIdx)
							.trim();

						// Split by 💡 實際場景：marker
						const parts = sectionText.split(
							/💡\s*(?:實際場景|实际场景)[:：]/,
						);
						const mainContent = parts[0].trim();

						// Parse scenarios (if exists)
						const scenarios = [];
						if (parts.length > 1) {
							// The scenario content might contain multiple items separated by commas or 、
							const scenarioText = parts[1].trim();
							// Split by patterns like "，X月" or "、X月" to separate individual scenarios
							const items = scenarioText.split(/[，、](?=\d+月)/);
							for (const item of items) {
								const cleaned = item.trim();
								if (cleaned) {
									scenarios.push(cleaned);
								}
							}
						}

						timeSubsections.push({
							title: timeTitle,
							mainContent: mainContent,
							scenarios:
								scenarios.length > 0
									? scenarios
									: [
											parts.length > 1
												? scenarioText || ""
												: "",
										],
						});
					}
				}

				// If no time subsections found, treat as regular section
				if (timeSubsections.length > 0) {
					sections.push({
						title: sectionTitle,
						timeSubsections,
					});
				} else {
					// No time periods found, treat as regular content
					const parts = sectionContent.split(
						/💡\s*(?:實際場景|实际场景)[:：]/,
					);
					sections.push({
						title: sectionTitle,
						mainContent: parts[0].trim().replace(/^- /, ""),
						scenario: parts[1] ? parts[1].trim() : "",
					});
				}
			} else {
				// For other sections, just split by 💡 實際場景
				const parts = sectionContent.split(
					/💡\s*(?:實際場景|实际场景)[:：]/,
				);
				sections.push({
					title: sectionTitle,
					mainContent: parts[0].trim().replace(/^- /, ""),
					scenario: parts[1] ? parts[1].trim() : "",
				});
			}
		}

		return sections;
	};

	const structuredResults = parsePracticalResults(practicalResults);

	return (
		<div
			className="page-break bg-white h-[297mm] overflow-hidden relative"
			style={{
				padding: "15mm 20mm",
				boxSizing: "border-box",
			}}
		>
			{/* Header with title and date on same line */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "30px",
					paddingBottom: "8px",
					borderBottom: "1px solid #e5e7eb",
				}}
			>
				<h1
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "36px",
						fontWeight: "bold",
						color: "#666",
						margin: "0",
						lineHeight: "1.2",
					}}
				>
					2026丙午年 <span style={{ margin: "0 12px" }}>|</span>{" "}
					<span style={{ color: color }}>
						{isCn ? "流年详解" : "流年詳解"}
					</span>
				</h1>
				<div
					style={{
						fontSize: "20px",
						color: "#666",
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					{new Date().toLocaleDateString(dateLocale).replace(/\//g, "/")}
				</div>
			</div>

			{/* Content Section 1 - 流年干支作用 */}
			<div style={{ marginBottom: "30px" }}>
				<h3
					style={{
						color: color,
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "20px",
						fontWeight: "bold",
						marginBottom: "20px",
						marginTop: "0",
					}}
				>
					{isCn ? "01 流年干支作用" : "01 流年干支作用"}
				</h3>
				<p
					style={{
						fontSize: "13px",
						lineHeight: "1.65",
						textAlign: "justify",
						color: "#333",
						margin: "0",
					}}
				>
					{ganzhiEffect || (isCn ? "内容载入中..." : "內容載入中...")}
				</p>
			</div>

			{/* Content Section 2 - 在專案領域的具體表現 */}
			<div style={{ marginBottom: "32px" }}>
				<h3
					style={{
						color: color,
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "20px",
						fontWeight: "bold",
						marginBottom: "20px",
						marginTop: "0",
					}}
				>
					{isCn ? "02 在专项领域的具体表现" : "02 在專案領域的具體表現"}
				</h3>

				{structuredResults.length > 0 ? (
					structuredResults.map((section, idx) => (
						<div key={idx} style={{ marginBottom: "10px" }}>
							{/* Section Title */}
							<h4
								style={{
									color: color,
									fontFamily: "Noto Serif TC, serif",
									fontSize: "15px",
									fontWeight: "bold",
									marginBottom: "5px",
									marginTop: "0",
								}}
							>
								{section.title}
							</h4>

							{/* Time subsections for 時間點與變化 */}
							{section.timeSubsections ? (
								section.timeSubsections.map(
									(timeSub, subIdx) => (
										<div
											key={subIdx}
											style={{
												marginBottom: "5px",
												marginLeft: "20px",
											}}
										>
											<h5
												style={{
													fontSize: "13px",
													fontWeight: "bold",
													color: color,
													marginBottom: "5px",
													marginTop: "0",
												}}
											>
												{timeSub.title}
											</h5>
											{timeSub.mainContent && (
												<p
													style={{
														fontSize: "14px",
														lineHeight: "1.65",
														color: "#333",
														margin: "0 0 5px 0",
													}}
												>
													{timeSub.mainContent}
												</p>
											)}
											{/* {timeSub.scenarios && timeSub.scenarios.length > 0 && (
												<div
													style={{
														fontSize: "13px",
														lineHeight: "1.65",
														color: "#555",
														margin: "6px 0 0 0",
														backgroundColor: "#f9f9f9",
														padding: "8px 12px",
														borderRadius: "4px",
													}}
												>
													<span style={{ fontWeight: "900", color: "#333" }}>
														實際場景：
													</span>
													{timeSub.scenarios.join('，')}
												</div>
											)} */}
										</div>
									),
								)
							) : (
								/* Regular sections */
								<>
									<p
										style={{
											fontSize: "13px",
											lineHeight: "1.65",
											color: "#333",
											margin: "0 0 8px 0",
											marginLeft: "20px",
										}}
									>
										{section.mainContent}
									</p>
									{section.scenario && (
										<p
											style={{
												fontSize: "13px",
												lineHeight: "1.65",
												color: "#555",
												margin: "0",
												marginLeft: "20px",
											}}
										>
											<span style={{ fontWeight: "900" }}>
												{isCn ? "实际场景：" : "實際場景："}
											</span>
											{section.scenario}
										</p>
									)}
								</>
							)}
						</div>
					))
				) : (
					<div
						style={{
							fontSize: "14px",
							lineHeight: "1.65",
							textAlign: "justify",
							color: "#333",
						}}
					>
						{practicalResults || (isCn ? "内容载入中..." : "內容載入中...")}
					</div>
				)}
			</div>

			{/* Footer */}
			<div
				style={{
					position: "absolute",
					bottom: "15mm",
					left: "20mm",
					width: "auto",
					height: "auto",
				}}
			>
				<Image
					src="/images/report/bottom.png"
					alt="Footer decoration"
					width={30}
					height={10}
					style={{
						objectFit: "contain",
					}}
				/>
			</div>
		</div>
	);
}
