"use client";

/**
 * Print page: 命局分析（二）— right tab (五行氣機修補) only.
 * Content and layout match web CoupleMingJu renderStructuredContent(right).
 */
const COUPLE_COLOR = "#C74772";
const PAGE_PADDING = "12mm 18mm";

function parseJsonContent(content) {
	if (!content || typeof content !== "string") return null;
	let clean = content.trim();
	if (clean.startsWith("```json")) clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
	else if (clean.startsWith("```")) clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
	const match = clean.match(/\{[\s\S]*\}/);
	if (match) clean = match[0];
	try {
		return JSON.parse(clean);
	} catch {
		return null;
	}
}

export default function CouplePrintMingJuRight({ rightContent }) {
	const data = rightContent && rightContent.trim() ? parseJsonContent(rightContent) : null;

	if (!rightContent || !rightContent.trim()) return null;

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
			<h2
				style={{
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					fontSize: "22px",
					letterSpacing: "0.2em",
					color: COUPLE_COLOR,
					marginBottom: "12px",
				}}
			>
				命局分析（二）
			</h2>

			<h3 className="font-bold text-[#B4003C] mb-3" style={{ fontSize: "14px" }}>
				五行氣機修補
			</h3>

			{data && typeof data === "object" ? (
				<div className="space-y-4">
					{Object.entries(data).map(([section, sectionData], index) => (
						<div key={index} className="p-3 rounded-lg bg-[#EFEFEF]">
							<h3 className="font-bold text-[#B4003C] mb-2" style={{ fontSize: "13px" }}>
								{section}
							</h3>
							{sectionData.五行调节 && (
								<div className="mb-2">
									<h4 className="font-semibold text-gray-800 mb-0.5" style={{ fontSize: "12px" }}>五行調節：</h4>
									<p className="ml-3 text-gray-700" style={{ fontSize: "11px" }}>{sectionData.五行调节}</p>
								</div>
							)}
							{sectionData.调候重点 && (
								<div className="mb-2">
									<h4 className="font-semibold text-gray-800 mb-0.5" style={{ fontSize: "12px" }}>調候重點：</h4>
									<p className="ml-3 text-gray-700" style={{ fontSize: "11px" }}>{sectionData.调候重点}</p>
								</div>
							)}
							{sectionData.日常调和 && (
								<div className="mb-2">
									<h4 className="font-semibold text-gray-800 mb-0.5" style={{ fontSize: "12px" }}>日常調和：</h4>
									<ul className="ml-4 space-y-0.5">
										{sectionData.日常调和.map((item, idx) => (
											<li key={idx} className="flex items-start">
												<span className="text-[#C74772] mr-1">•</span>
												<span style={{ fontSize: "11px" }}>{item}</span>
											</li>
										))}
									</ul>
								</div>
							)}
							{sectionData.时机把握 && (
								<div className="mb-2">
									<h4 className="font-semibold text-gray-800 mb-0.5" style={{ fontSize: "12px" }}>時機把握：</h4>
									<ul className="ml-4 space-y-0.5">
										{sectionData.时机把握.map((item, idx) => (
											<li key={idx} className="flex items-start">
												<span className="text-[#C74772] mr-1">•</span>
												<span style={{ fontSize: "11px" }}>{item}</span>
											</li>
										))}
									</ul>
								</div>
							)}
							{sectionData.感情发展 && (
								<div className="mt-2 p-2 bg-white rounded border-l-4 border-[#B4003C]">
									<p className="font-medium text-gray-800" style={{ fontSize: "11px" }}>{sectionData.感情发展}</p>
								</div>
							)}
							{sectionData.关键节点 && (
								<div className="mt-2 p-2 bg-white rounded border-l-4 border-[#B4003C]">
									<p className="font-medium text-gray-800" style={{ fontSize: "11px" }}>{sectionData.关键节点}</p>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="whitespace-pre-wrap text-gray-700" style={{ fontSize: "11px" }}>
					{rightContent.replace(/\*\*/g, "").substring(0, 3000)}
				</div>
			)}
		</div>
	);
}
