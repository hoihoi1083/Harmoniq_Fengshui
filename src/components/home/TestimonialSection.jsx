"use client";
import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import WhyChooseUs from "./WhyChooseUs";
import ComparisonTables from "./ComparisonTables";

const TestimonialSection = () => {
	const locale = useLocale();

	// Sample testimonial data
	const testimonials = [
		{
			id: 1,
			quote: "一直容易疲勞，買了白水晶，贈送的報告建議超具體，照做一週，白天精神明顯變好，入睡也快了。這報告就像懂我的私人顧問，把複雜知識變成能直接用的行動指南，非常有用！",
			name: "Donald C.",
			avatar: "/images/testimonials/avatar-1.png",
		},
		{
			id: 2,
			quote: "以前對理財很迷茫。報告幫我分析出屬情感消費型，並給出5%啟動法設立自動儲蓄。現在對管理錢財有了清晰頭緒，感覺未來規劃踏實很多。",
			name: "Emily R.",
			avatar: "/images/testimonials/avatar-2.png",
		},
		{
			id: 3,
			quote: "這份分析神準！指出我和男朋友是問題解決型和情感傾聽型的溝通差異，一看就恍然大悟。提供的具體對話建議，讓我們馬上實踐，爭吵真的減少了。",
			name: "Kelly F.",
			avatar: "/images/testimonials/avatar-3.png",
		},
		{
			id: 4,
			quote: "事業運報告幫我定位在穩定突破期，點出優勢是資源整合，給出具體90天行動建議。我突然覺得職涯道路清晰了，這報告就像專業職場導師，對規劃幫助極大。",
			name: "Charlie P.",
			avatar: "/images/testimonials/avatar-4.png",
		},
	];

	return (
		<section
			className="relative w-full px-4 py-12 md:py-20 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80"
			style={{
				backgroundImage:
					"linear-gradient(to bottom, transparent 95%, rgba(239, 239, 239, 1.0) 100%),url(/images/demo/homepage-demo-bg.png)",
				backgroundSize: "99%",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Title Section */}
			<div className="flex items-center justify-start gap-6 mb-12 md:mb-16">
				<div
					className="flex items-center justify-center  rounded-full md:w-40 md:h-10 bg-[#A4AF3B] flex-shrink-0"
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					}}
				>
					<span className="font-bold text-white text-md md:text-2xl">
						{locale === "zh-CN" ? "用戶評價" : "用戶評價"}
					</span>
				</div>
				<p className="text-sm leading-relaxed text-black md:text-base w-[60%]">
					{locale === "zh-CN"
						? "透過上傳八字/建立家居平面圖，我們的智慧風水命理分析系統利用先進的智慧技術，結合傳統風水命理學的核心理論，為您提供深度的風水命理解析。"
						: "透過上傳八字/建立家居平面圖，我們的智慧風水命理分析系統利用先進的智慧技術，結合傳統風水命理學的核心理論，為您提供深度的風水命理解析。"}
				</p>
			</div>

			{/* Testimonial Cards Grid */}
			<div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
				{testimonials.map((testimonial) => (
					<div
						key={testimonial.id}
						className="bg-[#D9D9D9] rounded-2xl p-6 md:p-8 flex flex-col justify-between border border-[#A4AF3B] min-h-[200px] md:min-h-[250px]"
					>
						{/* Quote Text */}
						<p className="text-sm  text-[#666666] leading-relaxed  line-clamp-6">
							"{testimonial.quote}"
						</p>

						{/* Quotation Mark Icon */}
						<div className="text-5xl md:text-6xl text-right text-[#999999] ">
							"
						</div>

						{/* User Info - Avatar and Name */}
						<div className="flex items-center gap-3 -mt-4 md:-mt-9">
							<div className="relative flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-300 rounded-full md:w-14 md:h-14">
								<Image
									src={testimonial.avatar}
									alt={testimonial.name}
									fill
									className="object-cover"
								/>
							</div>
							<span className="text-sm md:text-base font-semibold text-[#333333]">
								{testimonial.name}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Learn More Button */}
			<div className="flex justify-end">
				<button
					className="bg-black hover:bg-[#1C1C1C] text-white px-6 md:px-18 py-3 md:py-3 rounded-[10px] text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all"
					onClick={() => {
						// Function to be implemented
						console.log("Learn more clicked");
					}}
				>
					{locale === "zh-CN" ? "了解更多" : "了解更多"}
				</button>
			</div>
			<WhyChooseUs />
			<ComparisonTables />
		</section>
	);
};

export default TestimonialSection;
