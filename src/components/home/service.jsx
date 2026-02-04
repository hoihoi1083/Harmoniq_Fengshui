"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Step from "./Step";
import useMobile from "../../app/hooks/useMobile";

const ServiceSection = () => {
	const t = useTranslations("home.services");
	const isMobile = useMobile();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Define steps data for the Step component
	const steps = [
		{
			num: "1",
			title: t("steps.step1.title"),
			subtitle: t("steps.step1.subtitle"),
			image: "/images/hero/hero-1.png",
		},
		{
			num: "2",
			title: t("steps.step2.title"),
			subtitle: t("steps.step2.subtitle"),
			image: "/images/hero/hero-2.png",
		},
		{
			num: "3",
			title: t("steps.step3.title"),
			subtitle: t("steps.step3.subtitle"),
			image: "/images/hero/hero-3.png",
		},
		{
			num: "4",
			title: t("steps.step4.title"),
			subtitle: t("steps.step4.subtitle"),
			image: "/images/hero/hero-4.png",
		},
	];

	return (
		<section
			className={`w-full py-8 md:py-16 bg-[#EFEFEF] rounded-t-[40px] md:rounded-t-[80px] relative z-10 `}
		>
			{/* Step Component at the top */}
			<div className="flex justify-center hidden w-full mb-8 md:block md:mb-16">
				<Step steps={steps} />
			</div>

			{/* Divider line */}
			<div className="flex justify-center w-full mb-8 md:mb-10">
				<hr className="w-5/6 border-t border-black md:w-5/6" />
			</div>

			<div className="w-full px-4 mx-auto sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80">
				{/* Feng Shui Service Card */}
				<div className="mb-8 md:mb-9">
					<div className="w-full">
						<div className="flex flex-col items-center gap-8 md:gap-8 lg:gap-20 lg:flex-row">
							{/* Left Content */}
							<div className="w-full p-4 md:p-6 lg:p-8 lg:w-1/2">
								<h2
									className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#635D3B]"
									style={{
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									{t("fengshui.title")}
								</h2>

								<h3
									className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-[#A3B116] font-semibold mb-3 md:mb-4"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{t("fengshui.subtitle1")}
								</h3>

								<p
									className="text-base md:text-lg lg:text-xl xl:text-2xl text-[#A3B116] font-medium mb-4 md:mb-6"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{t("fengshui.subtitle2")}
								</p>

								<p
									className="mb-6 md:mb-8 leading-relaxed text-[#515151] text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{t("fengshui.description")}
								</p>

								<Link href="/demo?category=fengshui">
									<button className="bg-[#A3B116] hover:bg-[#8A9A14] text-white px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full font-bold transition-colors duration-300 w-full sm:w-auto">
										<span
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
											className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
										>
											{t("fengshui.button")}
										</span>
									</button>
								</Link>
							</div>

							{/* Right Image */}
							<div className="relative w-full lg:w-1/2">
								<div className="relative flex items-center justify-center">
									<Image
										src="/images/hero/service-1.png"
										alt={t("fengshui.altText")}
										width={200}
										height={200}
										className="object-contain w-full h-auto max-w-full max-h-full"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Destiny Calculation Service Card */}
				<div className="mb-8 md:mb-16">
					<div className="w-full mx-auto">
						<div className="flex flex-col items-center gap-8 md:gap-12 lg:gap-20 lg:flex-row-reverse">
							{/* Right Content */}
							<div className="w-full p-4 md:p-6 lg:p-8 xl:p-12 lg:w-1/2">
								<h2
									className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#635D3B]"
									style={{
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									{t("destiny.title")}
								</h2>

								<h3
									className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-[#A3B116] font-semibold mb-3 md:mb-4"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{t("destiny.subtitle1")}
								</h3>

								<p
									className="text-base md:text-lg lg:text-xl xl:text-2xl text-[#A3B116] font-medium mb-4 md:mb-6"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{t("destiny.subtitle2")}
								</p>

								<p
									className="mb-6 md:mb-8 leading-relaxed text-[#515151] text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{t("destiny.description")}
								</p>

								<Link href="/demo?category=life">
									<button className="bg-[#A3B116] hover:bg-[#8A9A14] text-white px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full font-bold transition-colors duration-300 w-full sm:w-auto">
										<span
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
											className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
										>
											{t("destiny.button")}
										</span>
									</button>
								</Link>
							</div>

							{/* Left Image */}
							<div className="relative w-full lg:w-1/2">
								<div className="relative flex items-center justify-center">
									<Image
										src="/images/hero/service-2.png"
										alt={t("destiny.altText")}
										width={500}
										height={500}
										className="object-contain w-full h-auto max-w-full max-h-full"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ServiceSection;
