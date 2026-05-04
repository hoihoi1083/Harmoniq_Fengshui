import { localizeDirectionText } from "../bazhaiPrintHelpers";
import PrintPageFooter from "./PrintPageFooter";

export default function PageOverallSummary({
	overallSections,
	comprehensiveAdvice,
	pageNum,
	totalPages,
}) {
	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className="text-4xl font-bold text-[#374A37] mb-6"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				綜合分析摘要
			</h2>
			<div className="space-y-3 print-page-content print-scale-90">
				{overallSections.map((text, idx) => (
					<div key={`overall-${idx}`} className="border border-gray-200 rounded-xl p-4">
						<p className="text-sm leading-relaxed text-[#374151]">
							{localizeDirectionText(text)}
						</p>
					</div>
				))}
				{comprehensiveAdvice && (
					<div className="border border-gray-200 rounded-xl p-4">
						<p className="text-sm leading-relaxed text-[#374151]">
							{localizeDirectionText(comprehensiveAdvice)}
						</p>
					</div>
				)}
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
