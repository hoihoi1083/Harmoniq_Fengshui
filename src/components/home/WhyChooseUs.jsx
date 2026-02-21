"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const WhyChooseUs = () => {
	const t = useTranslations("home.whyChooseUs");

	const features = [
		{ id: 1, icon: "/images/features/product-select.png", title: t("feature1.title"), description: t("feature1.description") },
		{ id: 2, icon: "/images/features/gift-report.png", title: t("feature2.title"), description: t("feature2.description") },
		{ id: 3, icon: "/images/features/master-custom.png", title: t("feature3.title"), description: t("feature3.description") },
		{ id: 4, icon: "/images/features/life-style.png", title: t("feature4.title"), description: t("feature4.description") },
		{ id: 5, icon: "/images/features/complete-experience.png", title: t("feature5.title"), description: t("feature5.description") },
	];

	return (
		<section className="relative w-full px-0 py-8 md:py-10 ">
			{/* Title Section */}
			<div className="flex items-center justify-start mb-10 md:mb-16">
				<div
					className="flex items-center justify-center rounded-full bg-[#A4AF3B] flex-shrink-0 px-5 py-1 min-h-10 w-auto sm:px-6 sm:py-3 md:w-60 md:h-10 md:px-0 md:py-0"
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					}}
				>
					<span className="text-lg font-bold text-white sm:text-xl md:text-2xl whitespace-nowrap">
						{t("title")}
					</span>
				</div>
			</div>

			{/* Features Grid: 1 row on lg+, 2 rows (3+2 centered) on smaller */}
			<div className="flex flex-wrap justify-center gap-4">
				{features.map((feature) => (
					<div
						key={feature.id}
						className="flex flex-col items-center text-center flex-[0_1_calc((100%-2*1rem)/3)] min-w-0 max-w-[calc((100%-2*1rem)/3)] lg:flex-[0_1_calc((100%-4*1rem)/5)] lg:max-w-[calc((100%-4*1rem)/5)]"
					>
						{/* Icon Container - fixed height so all icons align */}
						<div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mb-3 sm:w-16 sm:h-16 sm:mb-4 lg:w-20 lg:h-20">
							<Image
								src={feature.icon}
								alt={feature.title}
								width={96}
								height={96}
								className="object-contain w-full h-full"
							/>
						</div>

						{/* Title - min-height so all descriptions start at same level */}
						<h3 className="text-sm font-semibold text-[#073E31] mb-2 min-h-[2.75rem] flex items-center justify-center sm:text-base sm:mb-3 sm:min-h-[3rem] lg:text-base lg:min-h-[3rem]">
							{feature.title}
						</h3>

						{/* Description - responsive size, compact width */}
						<p className="text-[9px] text-[#666666] leading-relaxed w-full max-w-[95%] sm:text-sm lg:text-sm">
							{feature.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default WhyChooseUs;
