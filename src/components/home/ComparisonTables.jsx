"use client";
import React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

const ComparisonTables = () => {
	const t = useTranslations("home.compare");
	const locale = useLocale();
	const isZhCN = locale === "zh-CN";
	const shopComparisonSrc = isZhCN
		? "/images/comparison/shop-comparison-china.png"
		: "/images/comparison/shop-comparison.png";
	const reportComparisonSrc = isZhCN
		? "/images/comparison/report-comparison-china.png"
		: "/images/comparison/report-comparison.png";

	return (
		<div className="w-full py-10 md:px-6 md:py-1">
			{/* Shop Comparison Section */}
			<section className="mb-16 md:mb-24">
				{/* Title Badge - responsive */}
				<div className="flex items-center justify-start mb-6 md:mb-12">
					<div
						className="flex items-center justify-center rounded-full bg-[#A4AF3B] flex-shrink-0 px-5 py-1 min-h-10 w-auto sm:px-6 sm:py-3 md:w-60 md:h-10 md:px-0 md:py-0"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						<span className="text-lg font-bold text-white sm:text-xl md:text-2xl whitespace-nowrap">
							{t("shopTitle")}
						</span>
					</div>
				</div>

				{/* Shop Comparison: mobile-optimized image at max width on small screens, desktop image on md+ */}
				<div className="flex justify-center w-full mb-12 md:mb-20">
					{/* Mobile: full-width layout, no scroll */}
					<div className="relative w-full max-w-full block md:hidden">
						<Image
							src="/images/comparison/shop-comparison-mobile.png"
							alt=""
							width={800}
							height={1200}
							className="w-full h-auto object-contain"
							sizes="100vw"
						/>
					</div>
					{/* Desktop: original wide table */}
					<div
						className="relative w-full min-w-0 max-w-full hidden md:block"
						style={{ aspectRatio: "3195/1500" }}
					>
						<Image
							src={shopComparisonSrc}
							alt=""
							fill
							className="object-contain"
							sizes="(max-width: 1200px) 90vw, 1200px"
						/>
					</div>
				</div>
			</section>

			{/* Report Comparison Section */}
			<section>
				{/* Title Badge - responsive */}
				<div className="flex items-center justify-start mb-6 md:mb-12">
					<div
						className="flex items-center justify-center rounded-full bg-[#A4AF3B] flex-shrink-0 px-5 py-1 min-h-10 w-auto sm:px-6 sm:py-3 md:w-60 md:h-10 md:px-0 md:py-0"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						<span className="text-lg font-bold text-white sm:text-xl md:text-2xl whitespace-nowrap">
							{t("reportTitle")}
						</span>
					</div>
				</div>

				{/* Report Comparison: mobile-optimized image at max width on small screens, desktop image on md+ */}
				<div className="flex justify-center w-full">
					{/* Mobile: full-width layout, no scroll */}
					<div className="relative w-full max-w-full block md:hidden">
						<Image
							src="/images/comparison/report-comparison-mobile.png"
							alt=""
							width={800}
							height={1200}
							className="w-full h-auto object-contain"
							sizes="100vw"
						/>
					</div>
					{/* Desktop: original wide table */}
					<div
						className="relative w-full min-w-0 max-w-full hidden md:block"
						style={{ aspectRatio: "3195/1260" }}
					>
						<Image
							src={reportComparisonSrc}
							alt=""
							fill
							className="object-contain"
							sizes="(max-width: 1200px) 90vw, 1200px"
						/>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ComparisonTables;
