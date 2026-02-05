"use client";
import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import WhyChooseUs from "./WhyChooseUs";
import ComparisonTables from "./ComparisonTables";

const TestimonialSection = () => {
	const locale = useLocale();
	const t = useTranslations("home.testimonials");

	// Sample testimonial data
	const testimonials = [
		{
			id: 1,
			quote: "HarmoniQ改變了我的家庭。透過上個八字/建立家居平面圖，我們的智慧風水命理分析系統用先進的智慧技術，為您提供深度的風水命理解析。",
			name: "Donald C.",
			avatar: "/images/testimonials/avatar-1.png",
		},
		{
			id: 2,
			quote: "HarmoniQ改變了我的家庭。我們的小家伙更加安定，我們在一起享受看更加和諧的家庭時光。能量流力工作和家庭生活融為完美的平衡！就連我的朋友也注意到了氣氛的積極變化。",
			name: "Emily R.",
			avatar: "/images/testimonials/avatar-2.png",
		},
		{
			id: 3,
			quote: "HarmoniQ改變了我們的家庭。我們的小家伙更加安定，我們在一起享受更加和諧的家庭時光。能量流力工作和家庭生活融為完美的平衡！就連我的朋友也注意到了氣氛的積極變化。",
			name: "Emily R.",
			avatar: "/images/testimonials/avatar-3.png",
		},
		{
			id: 4,
			quote: "HarmoniQ改變了我們的家庭。我們的小家伙更加安定，我們在一起享受看更加和諧的家庭時光。能量流力工作和家庭生活融為完美的平衡！就連我的朋友也注意到了氣氛的積極變化。",
			name: "Emily R.",
			avatar: "/images/testimonials/avatar-4.png",
		},
	];

	return (
		<section
			className="relative w-full px-4 py-12 md:py-20 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80"
			style={{
				backgroundImage: "url(/images/demo/homepage-demo-bg.png)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Title Section */}
			<div className="flex items-center justify-start gap-6 mb-12 md:mb-16">
				<div
					className="flex items-center justify-center w-40 h-20 rounded-full md:w-56 md:h-28 bg-[#A4AF3B] flex-shrink-0"
					style={{
						fontFamily: "Iowan Old Style, serif",
					}}
				>
					<span className="text-2xl font-bold text-white md:text-4xl">
						{locale === "zh-CN" ? "用戶評價" : "用戶評價"}
					</span>
				</div>
				<p className="text-sm md:text-base text-[#666666] leading-relaxed">
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
						className="bg-[#D9D9D9] rounded-2xl p-6 md:p-8 flex flex-col justify-between min-h-[400px] md:min-h-[450px]"
					>
						{/* Quote Text */}
						<p className="text-sm md:text-base text-[#666666] leading-relaxed mb-6 line-clamp-6">
							"{testimonial.quote}"
						</p>

						{/* Quotation Mark Icon */}
						<div className="text-5xl md:text-6xl text-[#999999] mb-4">
							"
						</div>

						{/* User Info - Avatar and Name */}
						<div className="flex items-center gap-3">
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
					className="bg-black hover:bg-[#1C1C1C] text-white px-6 md:px-8 py-3 md:py-3 rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all"
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
