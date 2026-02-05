"use client";
import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

const WhyChooseUs = () => {
	const locale = useLocale();
	const t = useTranslations("home.whychoose");

	const features = [
		{
			id: 1,
			icon: "/images/features/product-select.png",
			title: "商品嚴選",
			description: "所有商品均經過挑選與檢查，購買安心無壓力",
		},
		{
			id: 2,
			icon: "/images/features/gift-report.png",
			title: "贈送八字命理報告",
			description: "每一筆訂單，都附贈大師參與的專屬命理分析報告",
		},
		{
			id: 3,
			icon: "/images/features/master-custom.png",
			title: "大師親自定制",
			description:
				"大師根據個人情況整理重點，請你清楚知道該做下一步需要思與調整的方向",
		},
		{
			id: 4,
			icon: "/images/features/life-style.png",
			title: "報告生活化",
			description: "重點放在實際生活中的影響與建議，一看就懂，一看就明",
		},
		{
			id: 5,
			icon: "/images/features/complete-experience.png",
			title: "完整體驗",
			description:
				"購買時選自物的同時，也能獲得一份有依據有溫度的個人解開",
		},
	];

	return (
		<section className="relative w-full px-4 py-12 md:py-20 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80 ">
			{/* Title Section */}
			<div className="flex items-center justify-center mb-12 md:mb-16">
				<div
					className="flex items-center justify-center px-8 py-4 rounded-full md:px-12 md:py-6 bg-[#A4AF3B]"
					style={{
						fontFamily: "Iowan Old Style, serif",
					}}
				>
					<span className="text-2xl font-bold text-white md:text-3xl">
						{locale === "zh-CN"
							? "為何選擇我們？"
							: "為何選擇我們？"}
					</span>
				</div>
			</div>

			{/* Features Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 md:gap-8">
				{features.map((feature) => (
					<div
						key={feature.id}
						className="flex flex-col items-center h-full text-center"
					>
						{/* Icon Container */}
						<div className="flex items-center justify-center flex-shrink-0 w-20 h-20 mb-4 md:w-24 md:h-24">
							<Image
								src={feature.icon}
								alt={feature.title}
								width={96}
								height={96}
								className="object-contain w-full h-full"
							/>
						</div>

						{/* Title */}
						<h3 className="text-base md:text-lg font-semibold text-[#333333] mb-3">
							{feature.title}
						</h3>

						{/* Description */}
						<p className="text-sm md:text-sm text-[#666666] leading-relaxed">
							{feature.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default WhyChooseUs;
