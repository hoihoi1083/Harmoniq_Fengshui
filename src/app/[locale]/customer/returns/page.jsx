"use client";

import React from "react";
import { useLocale } from "next-intl";

function highlightParts(text, phrases) {
	if (!text || !phrases?.length) return text;
	const parts = [];
	let remaining = text;
	let keyIdx = 0;
	while (remaining.length > 0) {
		let found = null;
		let earliest = remaining.length;
		for (const p of phrases) {
			const idx = remaining.indexOf(p);
			if (idx >= 0 && idx < earliest) {
				earliest = idx;
				found = p;
			}
		}
		if (found === null) {
			parts.push(remaining);
			break;
		}
		if (earliest > 0) parts.push(remaining.slice(0, earliest));
		parts.push(
			<span key={`hl-${keyIdx++}`} className="text-[#5a6b2a]">
				{found}
			</span>,
		);
		remaining = remaining.slice(earliest + found.length);
	}
	return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

export default function ReturnsPage() {
	const locale = useLocale();
	// Content: Traditional Chinese (zh-TW); same text for zh-CN unless you add simplified version
	const content = {
		title: "退換貨政策",
		intro: "感謝您的選購。為保障您的購物權益，請務必仔細閱讀以下條款。",
		sections: [
			{
				title: "購物保障",
				body: `根據相關消費者權益條例，您於商品送達後享有 七天冷靜期 的權利。
請留意，此冷靜期旨在讓您有充分時間檢視商品，並非試用期。如需退貨，商品必須保持未經使用、未經損壞的完整狀態（包含商品、所有原裝包裝、配件及贈品），否則我們可能無法受理您的退貨申請。`,
			},
			{
				title: "退換貨程序指引",
				numbered: true,
				items: [
					{
						label: "收到瑕疵或錯誤商品：",
						text: "若發現商品存在可見瑕疵、損壞或與您訂購的款式不符，請於收貨後 7 日內，通過在線客服「小鈴」 提供清晰照片，我們會立即為您跟進。",
						highlight: ["小鈴"],
					},
					{
						label: "換貨安排：",
						text: "如確認為我方責任，我們將免費為您安排補寄正確商品。請您將原商品完整包裝後寄回，相關運費由我方承擔。",
						highlight: "all",
					},
					{
						label: "一般退貨安排：",
						text: "若基於個人原因（如改變主意、尺寸不合等）申請退貨，請確保商品符合上述「完整狀態」要求。客服人員將告知您指定的退貨地址與方式（如順豐站、便利店寄件等）。",
						highlight: ["完整狀態"],
						sub: "請注意：非質量問題的退換貨，所有涉及之物流費用需由買家自理。",
					},
				],
			},
			{
				title: "關於商品瑕疵的特別說明",
				bulleted: true,
				intro: "由於天然水晶及手工飾品的特性，以下情況屬於正常現象，並非質量瑕疵，敬請理解與知悉：",
				items: [
					{ label: "圖片與實物色差：", text: "不同顯示設備的顯色效果各異，商品顏色均以實物為準。" },
					{ label: "天然材質與手工痕跡：", text: "天然水晶每顆紋路皆獨一無二；手工製作飾品表面可能存有微量膠痕或鑲嵌細微不平。" },
					{ label: "銀飾特性：", text: "為減少過敏，部分銀飾採用非電鍍工藝，接觸空氣後可能自然氧化變暗；細小部件（如耳針）可能因材質柔軟而有輕微彎曲。" },
					{ label: "不可避免的輕微痕跡：", text: "金屬部件在生產或包裝過程中可能產生極細微的摩擦劃痕。" },
					{ label: "合理尺寸誤差：", text: "手工測量可能存在約 0.5-1厘米 的合理誤差範圍。" },
					{ label: "使用與保養提示：", text: "長期接觸汗水可能影響飾品表面光澤。易出汗體質者，建議定期以乾布清潔貼身佩戴的首飾。" },
				],
			},
			{
				title: "最後提示",
				body: `我們在出貨前已進行嚴格檢查。如您遇有上述說明之外的重大瑕疵、運輸損毀或發貨錯誤，請務必於收貨後 15 日內 聯絡我們的在線客服並提供憑證，我們定當積極為您妥善處理。`,
			},
		],
	};

	return (
		<div className="py-20 bg-[#EFEFEF] min-h-screen">
			<div className="max-w-4xl px-6 mx-auto">
				{/* Header */}
				<div className="mt-10 mb-10 text-center">
					<h1 className="mb-2 text-4xl font-bold font-lora text-brown">
						{content.title}
					</h1>
					<p className="max-w-2xl mx-auto mt-4 mb-2 font-lora text-brown-light">
						{content.intro}
					</p>
				</div>
				{/* Sections */}
				<div className="space-y-6">
					{content.sections.map((section, index) => (
						<section
							key={index}
							className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
						>
							{section.numbered ? (
								<>
									<h2 className="font-lora text-xl font-semibold text-brown mb-4 pl-4 border-l-4 border-[#5a6b2a]">
										{section.title}
									</h2>
									<div className="space-y-4 font-lora text-brown-light">
										{section.items.map((item, i) => (
											<div key={i} className="pl-0">
												<p className="mb-1">
													<span className="font-semibold text-brown">
														{i + 1}. {item.label}
													</span>
													{item.highlight === "all" ? (
														<span className="text-[#5a6b2a]">
															{" "}
															{item.text}
														</span>
													) : (
														<>
															{" "}
															{highlightParts(
																item.text,
																item.highlight || [],
															)}
														</>
													)}
												</p>
												{item.sub && (
													<p className="mt-2 ml-4 text-[#5a6b2a]">
														<span className="mr-1.5">○</span>
														{item.sub}
													</p>
												)}
											</div>
										))}
									</div>
								</>
							) : section.bulleted ? (
								<>
									<h2 className="font-lora text-xl font-semibold text-brown mb-4 pl-4 border-l-4 border-[#5a6b2a]">
										{section.title}
									</h2>
									<div className="space-y-3 font-lora text-brown-light">
										{section.intro && (
											<p className="mb-4 whitespace-pre-wrap">
												{section.intro}
											</p>
										)}
										<ul className="list-none space-y-3 pl-0">
											{section.items.map((item, i) => (
												<li key={i} className="flex gap-2">
													<span className="text-brown flex-shrink-0">•</span>
													<span>
														<span className="font-medium text-brown">
															{item.label}
														</span>{" "}
														{item.text}
													</span>
												</li>
											))}
										</ul>
									</div>
								</>
							) : (
								<>
									<h2 className="font-lora text-xl font-semibold text-brown mb-4">
										{section.title}
									</h2>
									<div className="space-y-4">
										<p className="font-lora text-brown-light whitespace-pre-wrap">
											{section.body}
										</p>
									</div>
								</>
							)}
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
