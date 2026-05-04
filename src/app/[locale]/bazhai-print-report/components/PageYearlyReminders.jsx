import { localizeDirectionText } from "../bazhaiPrintHelpers";
import PrintPageFooter from "./PrintPageFooter";

export default function PageYearlyReminders({ yearlyAdvice, pageNum, totalPages }) {
	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className="text-4xl font-bold text-[#374A37] mb-6"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				流年提醒（2026年起，下元九運）
			</h2>
			<div className="space-y-3 print-page-content print-scale-90">
				<div className="rounded-xl p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100">
					<div className="font-bold text-red-700 mb-2 text-[18px]">2026年度重點提醒</div>
					<p className="text-sm leading-relaxed text-[#374151]">
						{localizeDirectionText(yearlyAdvice?.currentYear || "分析中...")}
					</p>
				</div>
				<div className="rounded-xl p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
					<div className="font-bold text-blue-700 mb-2 text-[18px]">下元九運影響</div>
					<p className="text-sm leading-relaxed text-[#374151]">
						{localizeDirectionText(yearlyAdvice?.nineStarCycle || "分析中...")}
					</p>
				</div>
				<div className="rounded-xl p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100">
					<div className="font-bold text-yellow-700 mb-2 text-[18px]">個人化年度建議</div>
					<p className="text-sm leading-relaxed text-[#374151]">
						{localizeDirectionText(yearlyAdvice?.personalizedAdvice || "分析中...")}
					</p>
				</div>
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
