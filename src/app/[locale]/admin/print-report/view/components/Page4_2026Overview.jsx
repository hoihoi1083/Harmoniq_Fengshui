// Page 4: 2026流年詳解 - Styled exactly like the attached image

export default function Page4_2026Overview({ data }) {
	const { year, concern, color } = data;

	// Extract year analysis - the API response is in aiAnalysis
	const rawAnalysis = year?.aiAnalysis || "";

	// Parse sections from the raw API response (markdown format)
	const parseGanzhiContent = (rawText) => {
		if (!rawText) return { ganzhiEffect: "", practicalResults: "" };

		// Extract 【流年干支作用】 section (section 1)
		const ganzhiMatch = rawText.match(
			/### 1\. 【流年干支作用】\s*([\s\S]*?)(?=### 2\.|### 【|$)/,
		);
		let ganzhiEffect = ganzhiMatch ? ganzhiMatch[1].trim() : "";

		// Extract 【流年實際表現】 special section (after section 3, before section 4)
		const practicalMatch = rawText.match(
			/### 【流年實際表現】\s*([\s\S]*?)(?=### 4\.|$)/,
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
					.replace(/^分析2026年丙午對原局的整體作用[:：]\s*/m, "")
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

	return (
		<div
			className="page-break bg-white h-[297mm] overflow-hidden relative"
			style={{
				padding: "15mm 20mm",
				boxSizing: "border-box",
			}}
		>
			{/* Date */}
			<div
				className="absolute top-5 right-8 text-gray-500"
				style={{ fontSize: "11px" }}
			>
				12/12/12
			</div>

			{/* Horizontal Title */}
			<div style={{ marginBottom: "20px", paddingBottom: "8px" }}>
				<h1
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontSize: "36px",
						fontWeight: "bold",
						color: "#666",
						marginBottom: "0",
						lineHeight: "1.2",
					}}
				>
					<span>2026</span>
					<span style={{ margin: "0 12px" }}>|</span>
					<span>流年</span>
				</h1>
				<h2
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontSize: "36px",
						fontWeight: "bold",
						marginBottom: "0",
						lineHeight: "1.2",
					}}
				>
					<span style={{ color: "#666" }}>丙午年</span>
					<span style={{ margin: "0 12px", color: "#666" }}>|</span>
					<span style={{ color: color }}>詳解</span>
				</h2>
			</div>

			{/* Subtitle */}
			<div
				style={{
					fontSize: "14px",
					color: "#666",
					marginBottom: "20px",
				}}
			>
				流年干支作用
			</div>

			{/* Content in Two Columns */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "0 32px",
					marginBottom: "16px",
				}}
			>
				{/* Left Column - 流年干支作用 */}
				<div>
					<h3
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
							fontSize: "16px",
							fontWeight: "bold",
							marginBottom: "12px",
							marginTop: "0",
						}}
					>
						流年干支作用
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
						{ganzhiEffect || "內容載入中..."}
					</p>
				</div>

				{/* Right Column - 在專案領域的具體表現 */}
				<div>
					<h3
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
							fontSize: "16px",
							fontWeight: "bold",
							marginBottom: "12px",
							marginTop: "0",
						}}
					>
						在專案領域的具體表現
					</h3>
					<div
						style={{
							fontSize: "13px",
							lineHeight: "1.65",
							textAlign: "justify",
							color: "#333",
						}}
					>
						{practicalResults || "內容載入中..."}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div
				className="absolute bottom-5 left-8 text-black font-bold"
				style={{ fontSize: "10px" }}
			>
				HarmoniQ Bell
			</div>
		</div>
	);
}
