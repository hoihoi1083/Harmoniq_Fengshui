"use client";
import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";

const ComparisonTables = () => {
	const locale = useLocale();

	return (
		<div className="w-full ">
			{/* Shop Comparison Section */}
			<section>
				{/* Title Badge */}
				<div className="flex items-center justify-start mb-8 md:mb-12">
					<div
						className="flex items-center justify-center  rounded-full md:w-60 md:h-10 bg-[#A4AF3B] flex-shrink-0"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						<span className="text-xl font-bold text-white md:text-2xl">
							{locale === "zh-CN" ? "風鈴Shop" : "風鈴Shop"}
						</span>
					</div>
				</div>

				{/* Image Container for Shop Comparison Table */}
				<div className="flex items-center justify-center w-full mb-20">
					<div
						className="relative w-full"
						style={{ aspectRatio: "3195/1500" }}
					>
						<Image
							src="/images/comparison/shop-comparison.png"
							alt=""
							fill
							className="object-contain"
						/>
					</div>
				</div>
			</section>

			{/* Report Comparison Section */}
			<section>
				{/* Title Badge */}
				<div className="flex items-center justify-start mb-8 md:mb-12">
					<div
						className="flex items-center justify-center  rounded-full md:w-60 md:h-10 bg-[#A4AF3B] flex-shrink-0"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						<span className="text-xl font-bold text-white md:text-2xl">
							{locale === "zh-CN" ? "命理報告" : "命理報告"}
						</span>
					</div>
				</div>

				{/* Image Container for Report Comparison Table */}
				<div className="flex items-center justify-center w-full">
					<div
						className="relative w-full"
						style={{ aspectRatio: "3195/1260" }}
					>
						<Image
							src="/images/comparison/report-comparison.png"
							alt=""
							fill
							className="object-contain"
						/>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ComparisonTables;
