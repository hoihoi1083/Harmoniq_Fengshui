import {
	condenseSummaryPoints,
	localizeDirectionText,
} from "../bazhaiPrintHelpers";
import PrintPageFooter from "./PrintPageFooter";

const SECTION_TITLES = ["整體格局與宅命", "命卦與個人特質", "年度流年重點"];

/** Main blocks: top N bullets, each capped for one-glance reading */
const SECTION_CONDENSE = { maxItems: 3, maxChars: 88 };
/** Bottom “綜合調整” — keep very short to avoid repeating the three blocks */
const ADVICE_CONDENSE = { maxItems: 2, maxChars: 96 };

export default function PageOverallSummary({
	overallSections,
	comprehensiveAdvice,
	pageNum,
	totalPages,
}) {
	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className="text-4xl font-bold text-[#374A37] mb-5"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				綜合分析摘要
			</h2>
			<div className="space-y-3 print-page-content print-scale-90">
				{overallSections.map((text, idx) => {
					const points = condenseSummaryPoints(text, SECTION_CONDENSE).map(
						(p) => localizeDirectionText(p),
					);
					const title = SECTION_TITLES[idx] ?? `重點摘要 ${idx + 1}`;
					return (
						<section
							key={`overall-${idx}`}
							className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
						>
							<div className="border-b border-[#E8EDE0] bg-[#F6F8F3] px-4 py-2.5">
								<h3
									className="text-[15px] font-bold text-[#374A37] tracking-wide"
									style={{
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									{idx + 1}. {title}
								</h3>
							</div>
							<ul className="px-4 py-2.5 space-y-1.5 list-none">
								{points.map((point, i) => (
									<li
										key={`${idx}-pt-${i}`}
										className="flex gap-2 text-[12px] leading-snug text-[#374151]"
									>
										<span
											className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FA16E]"
											aria-hidden
										/>
										<span className="min-w-0">{point}</span>
									</li>
								))}
							</ul>
						</section>
					);
				})}
				{comprehensiveAdvice ? (
					<section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
						<div className="border-b border-[#E8EDE0] bg-[#F6F8F3] px-4 py-2.5">
							<h3
								className="text-[15px] font-bold text-[#374A37] tracking-wide"
								style={{ fontFamily: "Noto Serif TC, serif" }}
							>
								{overallSections.length + 1}. 綜合調整建議
							</h3>
						</div>
						<ul className="px-4 py-2.5 space-y-1.5 list-none">
							{condenseSummaryPoints(
								comprehensiveAdvice,
								ADVICE_CONDENSE,
							).map((point, i) => (
								<li
									key={`comp-${i}`}
									className="flex gap-2 text-[12px] leading-snug text-[#374151]"
								>
									<span
										className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FA16E]"
										aria-hidden
									/>
									<span className="min-w-0">
										{localizeDirectionText(point)}
									</span>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
