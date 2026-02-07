"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FooterV2 from "@/components/home/FooterV2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PricePage = () => {
	const locale = useLocale();
	const router = useRouter();
	const [email, setEmail] = useState("");

	// Map card IDs to report types
	const reportTypeMap = {
		1: "fengshui",
		2: "life",
		3: "relationship",
		4: "couple",
		5: "wealth",
		6: "health",
		7: "career",
	};

	const handleNewsletterSubmit = () => {
		// Function to be implemented
		console.log("Newsletter subscribed with email:", email);
		setEmail("");
	};

	const features = [
		{
			id: 1,
			icon: "/images/features/product-select.png",
			title: locale === "zh-CN" ? "商品嚴選" : "商品嚴選",
			description:
				locale === "zh-CN"
					? "所有商品均經過挑選與檢查，購買安心無壓力"
					: "所有商品均經過挑選與檢查，購買安心無壓力",
		},
		{
			id: 2,
			icon: "/images/features/gift-report.png",
			title: locale === "zh-CN" ? "贈送八字命理報告" : "贈送八字命理報告",
			description:
				locale === "zh-CN"
					? "每一筆訂單，都附贈大師參與的專屬命理分析報告"
					: "每一筆訂單，都附贈大師參與的專屬命理分析報告",
		},
		{
			id: 3,
			icon: "/images/features/master-custom.png",
			title: locale === "zh-CN" ? "大師親自定制" : "大師親自定制",
			description:
				locale === "zh-CN"
					? "大師根據個人情況整理重點，請你清楚知道該做下一步需要思與調整的方向"
					: "大師根據個人情況整理重點，請你清楚知道該做下一步需要思與調整的方向",
		},
		{
			id: 4,
			icon: "/images/features/life-style.png",
			title: locale === "zh-CN" ? "報告生活化" : "報告生活化",
			description:
				locale === "zh-CN"
					? "重點放在實際生活中的影響與建議，一看就懂，一看就明"
					: "重點放在實際生活中的影響與建議，一看就懂，一看就明",
		},
		{
			id: 5,
			icon: "/images/features/complete-experience.png",
			title: locale === "zh-CN" ? "完整體驗" : "完整體驗",
			description:
				locale === "zh-CN"
					? "購買時選自物的同時，也能獲得一份有依據有溫度的個人解開"
					: "購買時選自物的同時，也能獲得一份有依據有溫度的個人解開",
		},
	];

	const pricingCards = [
		{
			id: 1,
			column: "left",
			image: "/images/price/fengshui.png",
			title: locale === "zh-CN" ? "風水測算" : "風水測算",
			price: "HKD$88",
			originalPrice: "$188",
			features: [
				locale === "zh-CN" ? "命主八字基礎分析" : "命主八字基礎分析",
				locale === "zh-CN" ? "命盤核心分析" : "命盤核心分析",
				locale === "zh-CN" ? "針對性分析推薦" : "針對性分析推薦",
				locale === "zh-CN" ? "運勢流年解釋" : "運勢流年解釋",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
		{
			id: 2,
			column: "right",
			image: "/images/price/life.png",
			title: locale === "zh-CN" ? "命理測算" : "命理測算",
			price: "HKD$88",
			originalPrice: "$168",
			features: [
				locale === "zh-CN" ? "命主八字基礎分析" : "命主八字基礎分析",
				locale === "zh-CN" ? "命盤核心分析" : "命盤核心分析",
				locale === "zh-CN" ? "針對性分析推薦" : "針對性分析推薦",
				locale === "zh-CN" ? "運勢流年解釋" : "運勢流年解釋",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
		{
			id: 3,
			column: "left",
			image: "/images/price/relationship.png",
			title: locale === "zh-CN" ? "感情流年測算" : "感情流年測算",
			price: "HKD$38",
			originalPrice: "$68",
			features: [
				locale === "zh-CN" ? "命主八字基礎分析" : "命主八字基礎分析",
				locale === "zh-CN" ? "命盤核心分析" : "命盤核心分析",
				locale === "zh-CN" ? "針對性分析推薦" : "針對性分析推薦",
				locale === "zh-CN" ? "運勢流年解釋" : "運勢流年解釋",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
		{
			id: 4,
			column: "right",
			image: "/images/price/couple.png",
			title: locale === "zh-CN" ? "合盤流年測算" : "合盤流年測算",
			price: "HKD$88",
			originalPrice: "$168",
			features: [
				locale === "zh-CN" ? "命盤配對分析" : "命盤配對分析",
				locale === "zh-CN" ? "合盤核心交互" : "合盤核心交互",
				locale === "zh-CN" ? "深入了解彼此" : "深入了解彼此",
				locale === "zh-CN" ? "生肖配對分析" : "生肖配對分析",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
		{
			id: 5,
			column: "left",
			image: "/images/price/wealth.png",
			title: locale === "zh-CN" ? "財運流年測算" : "財運流年測算",
			price: "HKD$38",
			originalPrice: "$68",
			features: [
				locale === "zh-CN" ? "命主八字基礎分析" : "命主八字基礎分析",
				locale === "zh-CN" ? "命盤核心分析" : "命盤核心分析",
				locale === "zh-CN" ? "針對性分析推薦" : "針對性分析推薦",
				locale === "zh-CN" ? "運勢流年解釋" : "運勢流年解釋",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
		{
			id: 6,
			column: "right",
			image: "/images/price/health.png",
			title: locale === "zh-CN" ? "健康流年測算" : "健康流年測算",
			price: "HKD$38",
			originalPrice: "$68",
			features: [
				locale === "zh-CN" ? "命主八字基礎分析" : "命主八字基礎分析",
				locale === "zh-CN" ? "命盤核心分析" : "命盤核心分析",
				locale === "zh-CN" ? "針對性分析推薦" : "針對性分析推薦",
				locale === "zh-CN" ? "運勢流年解釋" : "運勢流年解釋",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
		{
			id: 7,
			column: "left",
			image: "/images/price/career.png",
			title: locale === "zh-CN" ? "事業流年測算" : "事業流年測算",
			price: "HKD$88",
			originalPrice: "$168",
			features: [
				locale === "zh-CN" ? "命主八字基礎分析" : "命主八字基礎分析",
				locale === "zh-CN" ? "命盤核心分析" : "命盤核心分析",
				locale === "zh-CN" ? "針對性分析推薦" : "針對性分析推薦",
				locale === "zh-CN" ? "運勢流年解釋" : "運勢流年解釋",
				locale === "zh-CN" ? "深度關鍵建議" : "深度關鍵建議",
			],
			label: locale === "zh-CN" ? "限時優惠" : "限時優惠",
		},
	];

	const leftCards = pricingCards.filter((card) => card.column === "left");
	const rightCards = pricingCards.filter((card) => card.column === "right");

	const PricingCard = ({ card }) => (
		<div
			className="relative overflow-hidden aspect-[16/9] w-full cursor-pointer group"
			onClick={() => {
				const reportType = reportTypeMap[card.id];
				router.push(`/${locale}/report-preview?type=${reportType}`);
			}}
		>
			<Image
				src={card.image}
				alt={card.title}
				fill
				className="object-contain "
				sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
			/>

			{/* Bottom Controls */}
			<div className="absolute z-10 flex items-center justify-between bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
				{/* Preview Button */}
				<div className="flex items-center gap-2 md:gap-3">
					<button className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white transition-colors border rounded-full md:w-12 md:h-12 bg-black/70 hover:bg-black/90 border-white/40">
						<svg
							className="w-4 h-4 md:w-5 md:h-5"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</button>
					<span className="text-xs font-semibold text-white md:text-sm drop-shadow-lg">
						{locale === "zh-CN" ? "預覽報告" : "預覽報告"}
					</span>
				</div>
			</div>
		</div>
	);

	return (
		<main className="w-full bg-[rgba(243,243,243,1)]">
			{/* Navbar - Non-sticky */}
			<div className="[&>nav]:!relative [&>nav]:!top-auto">
				<Navbar />
			</div>

			{/* Main Content Area with Background */}
			<div
				className="relative w-full pb-12 bg-center bg-cover"
				style={{
					backgroundImage: "url('/images/price/price-bg.png')",
					backgroundColor: "#f5f5f5",
				}}
			>
				{/* Features Grid Section */}
				<section className="relative w-full px-4 py-12 md:py-26">
					<div className="container mx-auto">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 md:gap-8">
							{features.map((feature) => (
								<div
									key={feature.id}
									className="flex flex-col items-center h-full text-center"
								>
									{/* Icon Container */}
									<div className="flex items-center justify-center flex-shrink-0 w-20 h-20 mb-4 md:w-14 md:h-14">
										<Image
											src={feature.icon}
											alt={feature.title}
											width={96}
											height={96}
											className="object-contain w-full h-full"
										/>
									</div>

									{/* Title */}
									<h3 className="mb-3 text-base font-semibold text-[#073E31] md:text-sm">
										{feature.title}
									</h3>

									{/* Description */}
									<p className="text-sm md:text-xs w-[80%] text-[#073E31] leading-relaxed">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Hero Section */}
				<section className="relative w-full py-10 md:py-8">
					<div className="absolute inset-0 "></div>
					<div className="container relative px-4 mx-auto">
						<h1 className="text-4xl font-bold text-center text-black md:text-5xl lg:text-6xl">
							{locale === "zh-CN"
								? "解鎖進階分析"
								: "解鎖進階分析"}
						</h1>
					</div>
				</section>

				{/* Pricing Cards Section */}
				<section className="relative w-full px-4 py-12 md:py-20 md:px-8">
					<div className="container mx-auto">
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
							{/* Left Column */}
							<div className="space-y-6 md:space-y-8">
								{leftCards.map((card) => (
									<PricingCard key={card.id} card={card} />
								))}
							</div>

							{/* Right Column */}
							<div className="space-y-6 md:space-y-8">
								{rightCards.map((card) => (
									<PricingCard key={card.id} card={card} />
								))}
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* Newsletter Banner - Overlapping Footer */}
			<div className="relative z-10 -mb-6 ">
				<div className="container px-4 mx-auto">
					<div className="bg-[#8B9F3A] rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-8 py-10 md:px-12">
							<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
								<div className="text-white">
									<h2 className="text-2xl font-bold md:text-3xl">
										{locale === "zh-CN"
											? "随时了解"
											: "隨時了解"}
									</h2>
									<h2 className="text-2xl font-bold md:text-3xl">
										{locale === "zh-CN"
											? "我们的最新优惠"
											: "我們的最新優惠"}
									</h2>
								</div>
								<div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[400px]">
									<Input
										type="email"
										placeholder={
											locale === "zh-CN"
												? "输入您的电邮地址"
												: "輸入您的電郵地址"
										}
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="px-6 py-4 text-gray-800 bg-white rounded-full"
									/>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="px-8 py-4 font-bold text-gray-800 bg-white rounded-full hover:bg-gray-100"
									>
										{locale === "zh-CN"
											? "订阅我们"
											: "訂閱我們"}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<FooterV2 />
		</main>
	);
};

export default PricePage;
