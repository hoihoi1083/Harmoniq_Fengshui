"use client";
import { useState } from "react";
import FAQ from "./FAQ";

const FortuneTips = () => {
	const [openIndex, setOpenIndex] = useState(0); // First item open by default

	const tips = [
		{
			number: "01",
			title: "關於風鈴｜我們的能量哲學",
			content: `風鈴——如風般靈動洞察，如鈴般清音指引。
我們深信，古老的東方智慧不應是高懸的玄奧理論，而是可感、可知、可用的生活能量。因此，我們打破傳統命理的模糊話語體系，致力於將深邃的五行、八卦原理，轉化為現代人可理解、可踐行的個人命理能量報告。
我們不做空洞的預測，而是專注於為您提供清晰的能量調頻工具，幫助您在紛繁變化中，找到內在的穩定與前進的清晰路徑。
一切始於理解，忠於改變。`,
		},
		{
			number: "02",
			title: "專屬產品｜能量解決方案",
			content: `風鈴的每一件产品都不再是單純的飾品，而是您個人能量方案的重要組件。
然而，真正的價值不在於物，而在於契合。因此，我們不出售孤立的產品。
您會收到一個完整的組合：一件精心設計的產品，一份為您獨身訂製的《個人命理能量報告》。這意味著一串手鏈、一件擺件，都將與您的生命節奏產生深層共鳴。
這即是風鈴提供的解決方案：有形載體 + 定制指引。`,
		},
		{
			number: "03",
			title: "大師親撰｜您的專屬報告",
			content: `這是我們承諾中最為核心、不可複制的部分。隨您產品所附的，絕非由AI批量生成或套用模板的冰冷文檔。
每一份《個人命理能量報告》，均由我們深諳東方玄學體系與能量心理學的真人顧問團隊親自分析、編寫。
顧問會基於您提供的性別、生日和問題，結合當前流年能量，進行多維度交叉分析，最終落筆成文。報告將為您清晰勾勒個人能量特質、當前週期課題，並具體闡釋為何推薦此件水晶，以及如何通過它進行有效的自我調頻。
這份報告，是專業、時間與誠意的結晶。`,
		},
		{
			number: "04",
			title: "年度重點｜2026丙午馬年",
			content: `2026丙午年，火能量極旺，象徵行動力與激情，但也易帶來急躁與競爭。成功關鍵在於疏導火勢，穩中求進，將充沛能量專注於核心目標，並注重根基穩固。
為助您平衡火旺之氣，穩固運勢根基，我們推薦：
黑曜石：強力化解負能量與過旺火氣，有助保持冷靜與清淨氣場
黃水晶：火生土，土生金。黃水晶能將今年的行動熱情轉化為穩固的財富積累與貴人助力
白水晶：淨化環境磁場，提升專注力與決策清晰度，避免能量混亂
風水關鍵：
流年喜星在正南方，請保持此處明亮整潔，可擺放綠色植物或紫色飾品來催旺貴人緣。切忌在此處堆放雜物。
善用能量，規劃先行，願您駕馭2026的澎湃動力，穩步達成目標。`,
		},
	];

	const toggleItem = (index) => {
		setOpenIndex(openIndex === index ? -1 : index);
	};

	return (
		<section
			className="relative w-full px-4 py-12 md:py-20 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80"
			style={{
				backgroundImage:
					"url(/images/demo/homepage-fortunetips-bg.png)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			<div className="mx-auto">
				{/* Header */}
				<div
					className="flex items-center justify-center  rounded-full md:w-40 md:h-10 bg-[#A4AF3B] flex-shrink-0 mb-16"
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					}}
				>
					<span className="font-bold text-white text-md md:text-2xl">
						命理小貼士
					</span>
				</div>

				{/* Accordion Items */}
				<div className="space-y-4 ">
					{tips.map((tip, index) => (
						<div
							key={index}
							className={`rounded-lg overflow-hidden transition-all duration-300 ${
								openIndex === index
									? "border-2 border-[#191A23]"
									: " border-2 border-[#191A23]"
							}`}
							style={
								openIndex === index
									? {
											background:
												"linear-gradient(to bottom, #363739, #676769)",
										}
									: {}
							}
						>
							{/* Header */}
							<button
								onClick={() => toggleItem(index)}
								className="flex items-center justify-between w-full px-8 py-6 transition-colors"
							>
								<div className="flex items-center gap-6">
									<span
										className={`text-5xl font-bold ${
											openIndex === index
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{tip.number}
									</span>
									<h3
										className={`text-xl font-medium ${
											openIndex === index
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{tip.title}
									</h3>
								</div>
								<div
									className={`w-10 h-10 rounded-full border flex items-center justify-center text-4xl font-extrabold ${
										openIndex === index
											? "border-[#F3F3F3] bg-[#F3F3F3] text-black"
											: "border-[#191A23] bg-[#F3F3F3] text-black"
									}`}
								>
									{openIndex === index ? "−" : "+"}
								</div>
							</button>

							{/* Content */}
							{openIndex === index && (
								<div className="px-8 pt-2 pb-8">
									<div className="pt-6 border-t border-gray-600">
										<p className="leading-relaxed text-white whitespace-pre-line">
											{tip.content}
										</p>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
			<FAQ />
		</section>
	);
};

export default FortuneTips;
