"use client";

/**
 * Print page: 命局分析（二）— 五行氣機修補.
 * Three sections: 01 調侯核心 (two subtopics), 02 日常調和 (建議1-3 + 時機1-2), 03 長期策略 (two columns).
 * Layout and style match the reference print design.
 */
const PAGE_PADDING = "12mm 18mm";
/** Dark beige/brown for section title bars (調侯核心, 調侯重點, 建議1-3) */
const BAR_BG = "#A47584";
const BAR_TEXT = "#fff";
/** Section number + title (01 調侯核心): dark grey */
const SECTION_HEADER_COLOR = "#680F21";
const BODY_SIZE = "13px";
const BODY_LINE_HEIGHT = 1.7;
/** Light grey box for 時機1/時機2 */
const TIMING_BOX_BG = "#f5f5f5";
const TIMING_BOX_BORDER = "1px solid #333";

/** Try to extract and parse a JSON object from a string (handles leading text or fragment). */
function tryParseJsonString(str) {
	if (typeof str !== "string" || !str.trim()) return null;
	const trim = str.trim().replace(/\uFEFF/g, "");
	const firstBrace = trim.indexOf("{");
	if (firstBrace < 0) return null;
	let depth = 0;
	let inString = false;
	let escape = false;
	let quote = null;
	for (let i = firstBrace; i < trim.length; i++) {
		const c = trim[i];
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
				if (depth === 0) {
					const slice = trim.slice(firstBrace, i + 1);
					try {
						return JSON.parse(slice.replace(/,(\s*[}\]])/g, "$1"));
					} catch {
						return null;
					}
				}
			}
			continue;
		}
		if (c === quote) inString = false;
	}
	return null;
}

/** Parse plain-text right content into three sections + subsections for 五行氣機修補. */
function parseRightContent(content) {
	if (content == null) return null;

	// If string, try parsing as JSON first (API may return stringified JSON)
	if (typeof content === "string") {
		const obj = tryParseJsonString(content);
		if (obj && typeof obj === "object" && !Array.isArray(obj))
			content = obj;
	}

	// Already an object (e.g. from API JSON)
	if (typeof content === "object" && !Array.isArray(content)) {
		// Top-level may be 调候核心/实用建议/长期策略, or AI may return only 感情发展/关键节点
		const s1 = content.调候核心 ?? content.調候核心;
		const s2 = content.实用建议 ?? content.實用建議;
		let s3 = content.长期策略 ?? content.長期策略;
		if (
			!s3 &&
			(content.感情发展 ??
				content.感情發展 ??
				content.关键节点 ??
				content.關鍵節點)
		) {
			s3 = {
				感情发展: content.感情发展 ?? content.感情發展,
				关键节点: content.关键节点 ?? content.關鍵節點,
			};
		}
		return {
			section1: s1
				? {
						wuxingContent: s1.五行调节 ?? s1.五行調節 ?? "",
						focusContent: s1.调候重点 ?? s1.調候重點 ?? "",
					}
				: null,
			section2: s2
				? {
						suggestions: [
							s2.日常调和?.[0] ?? s2.日常調和?.[0] ?? "",
							s2.日常调和?.[1] ?? s2.日常調和?.[1] ?? "",
							s2.日常调和?.[2] ?? s2.日常調和?.[2] ?? "",
						].filter(Boolean),
						timings: [
							s2.时机把握?.[0] ?? s2.時機把握?.[0] ?? "",
							s2.时机把握?.[1] ?? s2.時機把握?.[1] ?? "",
						].filter(Boolean),
					}
				: null,
			section3: s3
				? (() => {
						// 长期策略 may be a stringified object (e.g. "{\"感情发展\":\"...\",\"关键节点\":\"...\"}")
						let s3Obj = s3;
						if (
							typeof s3 === "string" &&
							s3.trim().startsWith("{")
						) {
							try {
								const parsed = JSON.parse(
									s3.replace(/,(\s*[}\]])/g, "$1"),
								);
								if (parsed && typeof parsed === "object")
									s3Obj = parsed;
							} catch (_) {}
						}
						const main =
							typeof s3Obj === "string"
								? s3Obj
								: (s3Obj.主段落 ??
									s3Obj.main ??
									s3Obj.感情发展 ??
									s3Obj.感情發展 ??
									"");
						const n1 = s3Obj.关键节点一 ?? s3Obj.關鍵節點一 ?? "";
						const n2 = s3Obj.关键节点二 ?? s3Obj.關鍵節點二 ?? "";
						const keyNode = s3Obj.关键节点 ?? s3Obj.關鍵節點 ?? "";
						return {
							mainParagraph: main,
							node1: n1 || keyNode,
							node2: n2,
						};
					})()
				: null,
		};
	}
	if (typeof content !== "string") return null;

	const raw = content
		.trim()
		.replace(/\uFEFF/g, "")
		.replace(/\r\n/g, "\n");

	// Section 1: 调候核心 — 五行調節 + 調候重點
	const coreStart = raw.search(/调候核心|調候核心/);
	const practicalStart = raw.search(/实用建议|實用建議/);
	const strategyStart = raw.search(/长期策略|長期策略/);

	let section1 = null;
	if (coreStart >= 0) {
		const block1 =
			practicalStart >= 0
				? raw.slice(coreStart, practicalStart)
				: raw.slice(coreStart);
		const wuxingLabel =
			block1.indexOf("五行調節：") >= 0
				? "五行調節："
				: block1.indexOf("五行调节：") >= 0
					? "五行调节："
					: null;
		const focusLabel =
			block1.indexOf("調候重點：") >= 0
				? "調候重點："
				: block1.indexOf("调候重点：") >= 0
					? "调候重点："
					: null;
		let wuxingContent = "";
		let focusContent = "";
		if (wuxingLabel !== null) {
			const start = block1.indexOf(wuxingLabel) + wuxingLabel.length;
			const end =
				focusLabel !== null
					? block1.indexOf(focusLabel)
					: block1.length;
			wuxingContent = block1.slice(start, end).trim();
		}
		if (focusLabel !== null) {
			const start = block1.indexOf(focusLabel) + focusLabel.length;
			focusContent = block1.slice(start).trim();
		}
		section1 = { wuxingContent, focusContent };
	}

	// Section 2: 实用建议 — 日常調和 (建議1,2,3) + 時機把握 (時機1,2)
	let section2 = null;
	if (practicalStart >= 0) {
		const block2 =
			strategyStart >= 0
				? raw.slice(practicalStart, strategyStart)
				: raw.slice(practicalStart);
		const dailyLabel =
			block2.indexOf("日常調和：") >= 0
				? "日常調和："
				: block2.indexOf("日常调和：") >= 0
					? "日常调和："
					: null;
		const timingLabel =
			block2.indexOf("時機把握：") >= 0
				? "時機把握："
				: block2.indexOf("时机把握：") >= 0
					? "时机把握："
					: null;
		let dailyBlock = "";
		let timingBlock = "";
		if (dailyLabel !== null) {
			const start = block2.indexOf(dailyLabel) + dailyLabel.length;
			const end =
				timingLabel !== null
					? block2.indexOf(timingLabel)
					: block2.length;
			dailyBlock = block2.slice(start, end).trim();
		}
		if (timingLabel !== null) {
			timingBlock = block2
				.slice(block2.indexOf(timingLabel) + timingLabel.length)
				.trim();
		}
		// Parse 建议1：... 建议2：... 建议3： (allow • or - or newline before label)
		const suggestions = [];
		for (const label of ["建议", "建議"]) {
			const re = new RegExp(
				`${label}([123])[：:]\\s*([\\s\\S]*?)(?=${label}[123][：:]|時機把握|时机把握|$)`,
				"g",
			);
			let sm;
			while (
				(sm = re.exec(dailyBlock)) !== null &&
				suggestions.length < 3
			) {
				suggestions.push(sm[2].trim());
			}
			if (suggestions.length > 0) break;
		}
		// Parse 时机1：... 时机2： (or 時機1/2)
		const timings = [];
		for (const label of ["时机", "時機"]) {
			const re = new RegExp(
				`${label}([12])[：:]\\s*([\\s\\S]*?)(?=${label}[12][：:]|$)`,
				"g",
			);
			let sm;
			while ((sm = re.exec(timingBlock)) !== null && timings.length < 2) {
				timings.push(sm[2].trim());
			}
			if (timings.length > 0) break;
		}
		section2 = { suggestions, timings };
	}

	// Section 3: 长期策略 — intro paragraph + 关键节点一 + 关键节点二
	let section3 = null;
	if (strategyStart >= 0) {
		const block3 = raw.slice(strategyStart);
		const node1Label =
			block3.indexOf("关键节点一：") >= 0
				? "关键节点一："
				: block3.indexOf("關鍵節點一：") >= 0
					? "關鍵節點一："
					: null;
		const node2Label =
			block3.indexOf("关键节点二：") >= 0
				? "关键节点二："
				: block3.indexOf("關鍵節點二：") >= 0
					? "關鍵節點二："
					: null;
		let mainParagraph = "";
		let node1 = "";
		let node2 = "";
		if (node1Label !== null) {
			const introEnd = block3.indexOf(node1Label);
			mainParagraph = block3
				.slice(0, introEnd)
				.replace(/^[\s\S]*?(长期策略|長期策略)\s*/, "")
				.trim();
			const node1Start = block3.indexOf(node1Label) + node1Label.length;
			const node1End =
				node2Label !== null
					? block3.indexOf(node2Label)
					: block3.length;
			node1 = block3.slice(node1Start, node1End).trim();
		}
		if (node2Label !== null) {
			node2 = block3
				.slice(block3.indexOf(node2Label) + node2Label.length)
				.trim();
		}
		if (!mainParagraph && !node1 && !node2) {
			mainParagraph = block3
				.replace(/^[\s\S]*?(长期策略|長期策略)\s*/, "")
				.trim();
		}
		section3 = { mainParagraph, node1, node2 };
	}

	if (!section1 && !section2 && !section3) return null;
	return { section1, section2, section3 };
}

/** Title bar: dark beige background, white text, rounded */
function TitleBar({ children }) {
	return (
		<div
			style={{
				width: "35%",
				textAlign: "center",
				backgroundColor: BAR_BG,
				color: BAR_TEXT,
				padding: "5px 12px",
				fontSize: "17px",
				fontWeight: 900,
				fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				marginBottom: "8px",
			}}
		>
			{children}
		</div>
	);
}

/** Section header: "01 調侯核心" style — large bold dark grey */
function SectionHeader({ num, title }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "baseline",
				gap: "8px",
				marginBottom: "10px",
				marginTop: "10px",
			}}
		>
			<span
				style={{
					fontSize: "25px",
					fontWeight: 700,
					color: SECTION_HEADER_COLOR,
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				}}
			>
				{num}
			</span>
			<span
				style={{
					fontSize: "20px",
					fontWeight: 700,
					color: SECTION_HEADER_COLOR,
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
				}}
			>
				{title}
			</span>
		</div>
	);
}

export default function CouplePrintMingJuRight({ rightContent }) {
	const parsed =
		rightContent != null &&
		(typeof rightContent !== "string" || rightContent.trim() !== "")
			? parseRightContent(rightContent)
			: null;

	if (
		!rightContent ||
		(typeof rightContent === "string" && !rightContent.trim())
	)
		return null;

	const hasStructured =
		parsed && (parsed.section1 || parsed.section2 || parsed.section3);

	return (
		<div
			className="mx-auto bg-white page-break"
			style={{
				width: "210mm",
				minHeight: "297mm",
				padding: PAGE_PADDING,
				boxSizing: "border-box",
				overflow: "hidden",
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
				五行氣機修補
			</h3>

			{hasStructured ? (
				<div
					style={{
						fontFamily: "system-ui, -apple-system, sans-serif",
					}}
				>
					{/* Section 01: 調侯核心 — two subtopics */}
					{parsed.section1 && (
						<>
							<SectionHeader num="01" title="調侯核心" />
							{parsed.section1.wuxingContent && (
								<>
									<TitleBar>調侯核心</TitleBar>
									<p
										style={{
											width: "100%",
											fontSize: BODY_SIZE,
											color: "#333",
											margin: "0 0 12px 0",
											textAlign: "justify",
										}}
									>
										{parsed.section1.wuxingContent}
									</p>
								</>
							)}
							{parsed.section1.focusContent && (
								<>
									<TitleBar>調侯重點</TitleBar>
									<p
										style={{
											fontSize: BODY_SIZE,
											color: "#333",
											margin: 0,
											textAlign: "justify",
										}}
									>
										{parsed.section1.focusContent}
									</p>
								</>
							)}
						</>
					)}

					{/* Section 02: 日常調和 — 建議1/2/3 in 3 columns, then 時機1/2 in 2 columns */}
					{parsed.section2 && (
						<>
							<SectionHeader num="02" title="日常調和" />
							{parsed.section2.suggestions &&
								parsed.section2.suggestions.length > 0 && (
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr 1fr",
											gap: "16px 20px",
											marginBottom: "16px",
										}}
									>
										{parsed.section2.suggestions
											.slice(0, 3)
											.map((text, i) => (
												<div key={i}>
													<TitleBar>
														建議{i + 1}
													</TitleBar>
													<p
														style={{
															fontSize: BODY_SIZE,
															color: "#333",
															margin: 0,
															textAlign:
																"justify",
														}}
													>
														{text}
													</p>
												</div>
											))}
									</div>
								)}
							{parsed.section2.timings &&
								parsed.section2.timings.length > 0 && (
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "16px 20px",
										}}
									>
										{parsed.section2.timings
											.slice(0, 2)
											.map((text, i) => (
												<div
													key={i}
													style={{
														backgroundColor:
															TIMING_BOX_BG,
														border: TIMING_BOX_BORDER,
														borderRadius: "8px",
														padding: "10px 8px",
													}}
												>
													<div
														style={{
															fontSize: "13px",
															fontWeight: 700,
															color: SECTION_HEADER_COLOR,
															marginBottom: "3px",
														}}
													>
														時機{i + 1}
													</div>
													<p
														style={{
															fontSize: BODY_SIZE,
															lineHeight:
																BODY_LINE_HEIGHT,
															color: "#333",
															margin: 0,
															textAlign:
																"justify",
														}}
													>
														{text}
													</p>
												</div>
											))}
									</div>
								)}
						</>
					)}

					{/* Section 03: 長期策略 — two columns */}
					{parsed.section3 && (
						<>
							<SectionHeader num="03" title="長期策略" />
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "20px 24px",
								}}
							>
								<div>
									{parsed.section3.mainParagraph && (
										<p
											style={{
												fontSize: BODY_SIZE,
												color: "#333",
												margin: 0,
												textAlign: "justify",
											}}
										>
											{parsed.section3.mainParagraph}
										</p>
									)}
								</div>
								<div>
									{parsed.section3.node1 && (
										<p
											style={{
												fontSize: BODY_SIZE,
												color: "#333",
												margin: "0 0 10px 0",
												textAlign: "justify",
											}}
										>
											{parsed.section3.node1}
										</p>
									)}
									{parsed.section3.node2 && (
										<p
											style={{
												fontSize: BODY_SIZE,
												color: "#333",
												margin: 0,
												textAlign: "justify",
											}}
										>
											{parsed.section3.node2}
										</p>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			) : (
				<div
					className="whitespace-pre-wrap text-gray-700"
					style={{ fontSize: "11px" }}
				>
					{typeof rightContent === "string"
						? rightContent.replace(/\*\*/g, "").substring(0, 3500)
						: String(rightContent)}
				</div>
			)}
		</div>
	);
}
