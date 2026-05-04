import { localizeDirectionText } from "../bazhaiPrintHelpers";
import PrintPageFooter from "./PrintPageFooter";

export default function PageConclusion({
	conclusionData,
	conciseCoreSummary,
	actionItems,
	pageNum,
	totalPages,
}) {
	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className="text-4xl font-bold text-[#374A37] mb-6"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				結論
			</h2>
			<div className="space-y-3 print-page-content print-scale-90">
				<div className="rounded-2xl p-5 bg-gradient-to-r from-[#EEF8D8] via-[#F7FDEB] to-[#E8F7EF] border border-[#DDE7CC]">
					<div className="text-[22px] font-bold text-[#374A37] mb-2">你的家，正在往更好的方向前進</div>
					<p className="text-sm leading-relaxed text-[#374151]">
						{localizeDirectionText(conclusionData.compatibilityText)}
					</p>
					<p className="text-sm leading-relaxed text-[#374151] mt-2">
						目前吉位 {conclusionData.luckyCount} 處、凶位 {conclusionData.unluckyCount}{" "}
						處。只要按節奏優先調整，整體居住體感與穩定度會逐步上升。
					</p>
				</div>
				<div className="grid grid-cols-2 gap-3 items-stretch">
					<div className="rounded-xl p-4 border border-[#F3DDB8] bg-[#FFF9EE] h-full">
						<div className="font-bold text-[#9A6A00] mb-2">✨ 核心重點</div>
						<p className="text-sm leading-relaxed text-[#374151]">
							{conciseCoreSummary}
						</p>
					</div>
					<div className="rounded-xl p-4 border border-[#D6E7F9] bg-[#F4F9FF] h-full">
						<div className="font-bold text-[#235A96] mb-2">🧭 下一步行動</div>
						<ol className="list-decimal pl-5 space-y-1 text-sm text-[#374151]">
							{actionItems.map((item) => (
								<li key={item}>
									{item}
								</li>
							))}
						</ol>
					</div>
				</div>
				<div className="rounded-xl p-4 border border-[#E7D4F9] bg-[#FBF6FF]">
					<div className="font-bold text-[#6E3FA8] mb-2">💬 年度與個人提醒</div>
					<p className="text-sm leading-relaxed text-[#374151] mb-2">
						{localizeDirectionText(conclusionData.annualFocus || "年度重點整理中...")}
					</p>
					<p className="text-sm leading-relaxed text-[#374151]">
						{localizeDirectionText(conclusionData.personalized || "個人化建議整理中...")}
					</p>
				</div>
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
