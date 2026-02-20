"use client";
import React, { useState, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import FooterV2 from "@/components/home/FooterV2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const PricePage = () => {
	const locale = useLocale();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const scrollRef = useRef(null);
	const hasDraggedRef = useRef(false);
	const isJumpingRef = useRef(false);
	const carouselPeekPx = 56;
	const GAP_PX = 16;

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

	const scrollCarousel = (direction) => {
		const el = scrollRef.current;
		if (!el?.firstElementChild) return;
		const itemWidth = el.firstElementChild.offsetWidth + GAP_PX;
		el.scrollBy({
			left: direction === "prev" ? -itemWidth : itemWidth,
			behavior: "smooth",
		});
	};

	const handleCarouselCardClick = (card) => {
		if (hasDraggedRef.current) {
			hasDraggedRef.current = false;
			return;
		}
		const reportType = reportTypeMap[card.id];
		router.push(`/${locale}/report-preview?type=${reportType}`);
	};

	// Loop carousel: [lastCard, ...allCards, firstCard] for infinite feel
	const carouselCards =
		pricingCards.length >= 2
			? [
					pricingCards[pricingCards.length - 1],
					...pricingCards,
					pricingCards[0],
				]
			: pricingCards;

	useLayoutEffect(() => {
		const el = scrollRef.current;
		if (!el || !el.firstElementChild || carouselCards.length <= 1) return;

		let itemWidth = 0;
		let peek = carouselPeekPx;

		const setInitialScroll = () => {
			if (el.clientWidth < 100) return; // carousel not visible (e.g. desktop lg:hidden)
			const firstWidth = el.firstElementChild.offsetWidth;
			if (firstWidth <= 0) return;
			itemWidth = firstWidth + GAP_PX;
			peek = Math.min(carouselPeekPx, Math.floor(firstWidth * 0.2));
			el.style.scrollBehavior = "auto";
			el.scrollLeft = itemWidth - peek; // show bit of last (clone) on left, first card in view
			el.style.scrollBehavior = "";
		};

		// Defer so layout is complete (handles hydration / mobile first paint)
		const id = requestAnimationFrame(() => {
			requestAnimationFrame(setInitialScroll);
		});

		const handleScroll = () => {
			if (isJumpingRef.current) return;
			if (itemWidth <= 0) {
				const firstWidth = el.firstElementChild?.offsetWidth;
				if (firstWidth) {
					itemWidth = firstWidth + GAP_PX;
					peek = Math.min(
						carouselPeekPx,
						Math.floor(firstWidth * 0.2),
					);
				}
			}
			const maxScroll = el.scrollWidth - el.clientWidth;
			if (maxScroll <= 0) return;

			// Scrolled to very start (showing clone of last) -> jump to real last card
			if (el.scrollLeft <= 20) {
				isJumpingRef.current = true;
				el.style.scrollBehavior = "auto";
				el.scrollLeft = (carouselCards.length - 2) * itemWidth - peek;
				requestAnimationFrame(() => {
					el.style.scrollBehavior = "";
					isJumpingRef.current = false;
				});
			}
			// Scrolled to very end (showing clone of first) -> jump to real first card
			else if (el.scrollLeft >= maxScroll - 20) {
				isJumpingRef.current = true;
				el.style.scrollBehavior = "auto";
				el.scrollLeft = itemWidth - peek;
				requestAnimationFrame(() => {
					el.style.scrollBehavior = "";
					isJumpingRef.current = false;
				});
			}
		};

		el.addEventListener("scroll", handleScroll, { passive: true });

		// When carousel becomes visible (e.g. resize to mobile), set initial scroll
		const ro = new ResizeObserver(() => {
			if (el.scrollLeft < 10) setInitialScroll();
		});
		ro.observe(el);

		return () => {
			cancelAnimationFrame(id);
			el.removeEventListener("scroll", handleScroll);
			ro.disconnect();
		};
	}, [carouselCards.length]);

	const isLightCard = (imagePath) =>
		imagePath?.includes("fengshui.png") ||
		imagePath?.includes("couple.png") ||
		imagePath?.includes("career.png");

	const PricingCard = ({ card, noNavigate = false }) => {
		const useBlackText = isLightCard(card.image);
		return (
			<div
				className="relative overflow-hidden aspect-[16/9] w-full cursor-pointer group min-h-[140px] sm:min-h-[160px]"
				onClick={
					noNavigate
						? undefined
						: () => {
								const reportType = reportTypeMap[card.id];
								router.push(
									`/${locale}/report-preview?type=${reportType}`,
								);
							}
				}
			>
				<Image
					src={card.image}
					alt={card.title}
					fill
					className="object-contain"
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
					draggable={false}
				/>

				{/* Bottom Controls - responsive padding and sizes */}
				<div className="absolute z-10 flex items-center justify-between bottom-3 left-2 right-2 sm:bottom-4 sm:left-3 sm:right-3 md:bottom-6 md:left-6 md:right-6">
					<div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
						<button
							type="button"
							className="flex items-center justify-center flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 md:w-15 md:h-15 text-white transition-colors border rounded-full bg-black/70 hover:bg-black/90 border-white/40 touch-manipulation"
							aria-label={
								locale === "zh-CN" ? "預覽報告" : "預覽報告"
							}
						>
							<svg
								className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"
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
						<span
							className={`text-[16px] sm:text-md font-semibold md:text-xl drop-shadow-lg ${useBlackText ? "text-black" : "text-white"}`}
						>
							{locale === "zh-CN" ? "預覽報告" : "預覽報告"}
						</span>
					</div>
				</div>
			</div>
		);
	};

	return (
		<main className="w-full bg-[rgba(243,243,243,1)]">
			{/* Navbar - Non-sticky */}
			<div className="[&>nav]:!relative [&>nav]:!top-auto">
				<ShopNavbar />
			</div>

			{/* Main Content Area with Background */}
			<div
				className="relative w-full pb-8 sm:pb-12 bg-center bg-cover bg-no-repeat"
				style={{
					backgroundImage: "url('/images/price/price-bg.png')",
					backgroundColor: "#f5f5f5",
				}}
			>
				{/* Features Grid Section - max 2 rows on mobile (3+2 centered), 5 cols on desktop */}
				<section className="relative w-full px-4 py-10 sm:py-12 md:py-16 lg:py-24">
					<div className="container mx-auto max-w-full">
						<div className="flex flex-wrap justify-center gap-3 lg:gap-6">
							{features.map((feature) => (
								<div
									key={feature.id}
									className="flex flex-col items-center text-center min-w-0 flex-[0_1_calc((100%-1.5rem)/3)] lg:flex-[0_1_calc((100%-6rem)/5)]"
								>
									{/* Icon Container */}
									<div className="flex items-center justify-center flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 md:mb-4">
										<Image
											src={feature.icon}
											alt={feature.title}
											width={96}
											height={96}
											className="object-contain w-full h-full"
										/>
									</div>

									{/* Title */}
									<h3 className="mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm font-semibold text-[#073E31] md:text-base min-h-[2rem] flex items-center justify-center">
										{feature.title}
									</h3>

									{/* Description */}
									<p className="text-[10px] sm:text-xs md:text-sm w-full max-w-[95%] text-[#073E31] leading-relaxed">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Hero Section */}
				<section className="relative w-full py-1 sm:py-8 md:py-10">
					<div className="absolute inset-0" />
					<div className="container relative px-4 sm:px-6 mx-auto max-w-full">
						<h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center text-black">
							{locale === "zh-CN"
								? "解鎖進階分析"
								: "解鎖進階分析"}
						</h1>
					</div>
				</section>

				{/* Pricing Cards Section - carousel on mobile/small screen (touch), arrows on desktop */}
				<section className="relative w-full  py-8 sm:py-12 md:py-20 ">
					<div className="container mx-auto max-w-full">
						{/* Carousel: touch scroll on mobile; arrow buttons for desktop small screen */}
						<div className="relative lg:hidden">
							{/* Left arrow - desktop only (hidden on mobile so touch is primary) */}
							<button
								type="button"
								onClick={() => scrollCarousel("prev")}
								aria-label={
									locale === "zh-CN" ? "上一张" : "上一張"
								}
								className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-md border border-white/20"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							{/* Right arrow */}
							<button
								type="button"
								onClick={() => scrollCarousel("next")}
								aria-label={
									locale === "zh-CN" ? "下一张" : "下一張"
								}
								className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-md border border-white/20"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
							<div
								ref={scrollRef}
								role="region"
								aria-label="Pricing cards carousel"
								onTouchMove={() => {
									hasDraggedRef.current = true;
								}}
								className="flex overflow-x-auto overflow-y-hidden gap-4 pb-2 -mx-4 pl-4 pr-2 sm:pl-12 sm:pr-12 snap-x snap-mandatory overscroll-behavior-x-contain scrollbar-hide scroll-smooth"
								style={{ WebkitOverflowScrolling: "touch" }}
							>
								{carouselCards.map((card, index) => {
									const isCloneStart = index === 0;
									const isCloneEnd =
										index === carouselCards.length - 1;
									const key = isCloneStart
										? `carousel-clone-last-${card.id}`
										: isCloneEnd
											? `carousel-clone-first-${card.id}`
											: `carousel-${card.id}`;
									return (
										<div
											key={key}
											className="flex-shrink-0 snap-start w-[83vw] min-w-[80vw] sm:w-[80vw] sm:min-w-[80vw]"
											onClick={() =>
												handleCarouselCardClick(card)
											}
											onKeyDown={(e) => {
												if (
													e.key === "Enter" ||
													e.key === " "
												)
													handleCarouselCardClick(
														card,
													);
											}}
											role="button"
											tabIndex={0}
											aria-label={card.title}
										>
											<PricingCard
												card={card}
												noNavigate
											/>
										</div>
									);
								})}
							</div>
						</div>

						{/* Desktop: two-column grid */}
						<div className="hidden lg:grid grid-cols-2 gap-8">
							<div className="space-y-6 md:space-y-8">
								{leftCards.map((card) => (
									<PricingCard key={card.id} card={card} />
								))}
							</div>
							<div className="space-y-6 md:space-y-8">
								{rightCards.map((card) => (
									<PricingCard key={card.id} card={card} />
								))}
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* Newsletter Banner - Overlapping Footer (hidden on mobile, shown on desktop) */}
			<div className="relative z-10 -mb-6 px-4 sm:px-6 hidden md:block">
				<div className="container mx-auto max-w-full">
					<div className="bg-[#8B9F3A] rounded-2xl sm:rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-5 py-8 sm:px-8 sm:py-10 md:px-12">
							<div className="flex flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row text-center md:text-left">
								<div className="text-white">
									<h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
										{locale === "zh-CN"
											? "随时了解"
											: "隨時了解"}
									</h2>
									<h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
										{locale === "zh-CN"
											? "我们的最新优惠"
											: "我們的最新優惠"}
									</h2>
								</div>
								<div className="flex flex-col gap-3 w-full max-w-md md:w-auto md:min-w-[320px] lg:min-w-[400px]">
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
										className="h-11 sm:h-12 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-800 bg-white rounded-full"
									/>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="h-11 sm:h-12 px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base text-gray-800 bg-white rounded-full hover:bg-gray-100 touch-manipulation"
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
