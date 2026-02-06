"use client";
import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";

const ComparisonTables = () => {
	const locale = useLocale();

	return (
		<div className="w-full px-4 py-12 md:py-20 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80">
			{/* Shop Comparison Section */}
			<section>
				{/* Title Badge */}
				<div className="flex items-center justify-start mb-8 md:mb-12">
					<div
						className="flex items-center justify-center px-8 py-3 rounded-full md:px-10 md:py-4 bg-[#A4AF3B]"
						style={{
							fontFamily: "Iowan Old Style, serif",
						}}
					>
						<span className="text-xl font-bold text-white md:text-2xl">
							{locale === "zh-CN" ? "風鈴Shop" : "風鈴Shop"}
						</span>
					</div>
				</div>

				{/* Image Container for Shop Comparison Table */}
				<div className="w-full bg-[#EFEFEF] rounded-2xl p-6 md:p-8 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
					<div className="relative w-full h-full">
						{/* Placeholder - User will add image later */}
						<div className="flex items-center justify-center w-full h-full">
							<p className="text-sm text-gray-400 md:text-base">
								Shop Comparison Table Image
							</p>
						</div>
						{/* Uncomment when image is ready:
						<Image
							src="/images/comparison/shop-comparison.png"
							alt="Shop Comparison"
							fill
							className="object-contain"
						/>
						*/}
					</div>
				</div>
			</section>

			{/* Report Comparison Section */}
			<section>
				{/* Title Badge */}
				<div className="flex items-center justify-start mb-8 md:mb-12">
					<div
						className="flex items-center justify-center px-8 py-3 rounded-full md:px-10 md:py-4 bg-[#A4AF3B]"
						style={{
							fontFamily: "Iowan Old Style, serif",
						}}
					>
						<span className="text-xl font-bold text-white md:text-2xl">
							{locale === "zh-CN" ? "命理報告" : "命理報告"}
						</span>
					</div>
				</div>

				{/* Image Container for Report Comparison Table */}
				<div className="w-full bg-[#EFEFEF] rounded-2xl p-6 md:p-8 flex items-center justify-center ">
					<div className="relative w-full h-full">
						{/* Placeholder - User will add image later */}
						<div className="flex items-center justify-center w-full h-full">
							<p className="text-sm text-gray-400 md:text-base">
								Report Comparison Table Image
							</p>
						</div>
						{/* Uncomment when image is ready:
						<Image
							src="/images/comparison/report-comparison.png"
							alt="Report Comparison"
							fill
							className="object-contain"
						/>
						*/}
					</div>
				</div>
			</section>
		</div>
	);
};

export default ComparisonTables;
