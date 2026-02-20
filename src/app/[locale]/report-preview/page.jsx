"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import FooterV2 from "@/components/home/FooterV2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ReportPreviewPage = () => {
	const locale = useLocale();
	const router = useRouter();
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const reportType = searchParams.get("type") || "fengshui";

	const [email, setEmail] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [expandedContent, setExpandedContent] = useState(false);
	const [selectedRating, setSelectedRating] = useState("最經");
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	// Carousel scroll state and refs
	const carouselRef = useRef(null);
	const autoScrollRef = useRef(null);
	const [isAutoScrolling, setIsAutoScrolling] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
	const [hasDragged, setHasDragged] = useState(false);

	const scrollConfig = {
		speed: { desktop: 2 },
		edgeThreshold: 100,
		smoothness: 1,
	};

	// Report type configuration with pricing and descriptions
	const reportConfig = {
		fengshui: {
			title: "風水測算報告",
			price: 188,
			originalPrice: 388,
			description:
				"運用八字與風水結合，分析住宅與辦公環境的磁場能量，提供針對性的改善建議，優化整體運勢。",
			endpoint: "/api/checkoutSessions/payment3",
			concernType: "fengshui",
		},
		life: {
			title: "命理測算報告",
			price: 88,
			originalPrice: 168,
			description:
				"深入分析個人八字命盤，解讀人生軌跡與發展方向，預示未來運勢，提供人生指引。",
			endpoint: "/api/checkoutSessions/payment4",
			concernType: "life",
		},
		relationship: {
			title: "感情流年測算",
			price: 38,
			originalPrice: 68,
			description:
				"針對感情領域的專深分析，洞察感情運勢變化，提供感情建議與催旺方向。",
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "love",
		},
		couple: {
			title: "合盤流年測算",
			price: 88,
			originalPrice: 168,
			description:
				"兩人命盤配對分析，深度瞭解彼此性格差異與相處之道，增進感情和諧度。",
			endpoint: "/api/payment-couple",
			concernType: "couple",
		},
		wealth: {
			title: "財運流年測算",
			price: 38,
			originalPrice: 68,
			description:
				"分析財運走勢與偏財機會，預測收入變化，提供理財策略與催旺建議。",
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "financial",
		},
		health: {
			title: "健康流年測算",
			price: 38,
			originalPrice: 68,
			description:
				"評估健康狀況與亞健康風險，提供調理建議與預防方向，守護身心健康。",
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "health",
		},
		career: {
			title: "事業流年測算",
			price: 88,
			originalPrice: 168,
			description:
				"職業發展趨勢分析，工作機會掌握，事業瓶頸突破，助力職涯成功。",
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "career",
		},
	};

	const currentReport = reportConfig[reportType] || reportConfig.fengshui;

	const handleNewsletterSubmit = () => {
		// Function to be implemented
		console.log("Newsletter subscribed with email:", email);
		setEmail("");
	};

	// Handle payment - extracted and adapted from page-V1.jsx
	const handlePayment = useCallback(async () => {
		// Check if user is logged in
		if (!session) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(
				`/${locale}/auth/login?redirect=/report-preview?type=${reportType}`,
			);
			return;
		}

		setIsProcessingPayment(true);

		try {
			// Get fresh locale from localStorage to ensure consistency
			const storedRegion = localStorage.getItem("userRegion");
			const regionToLocaleMap = {
				china: "zh-CN",
				hongkong: "zh-TW",
				taiwan: "zh-TW",
			};
			const freshLocale =
				regionToLocaleMap[storedRegion] || locale || "zh-TW";

			console.log(
				"💰 Report preview payment - Using locale:",
				freshLocale,
				"from region:",
				storedRegion,
			);

			// Prepare request body
			const requestBody = {
				locale: freshLocale,
				region: storedRegion,
			};

			// Add concernType for fortune category endpoint
			if (
				currentReport.endpoint ===
				"/api/checkoutSessions/payment-fortune-category"
			) {
				requestBody.concernType = currentReport.concernType;
			}

			// For couple payment, add couple-specific data
			if (reportType === "couple") {
				requestBody.isCoupleAnalysis = true;
			}

			console.log("Request body:", requestBody);

			// Create checkout session
			const response = await fetch(currentReport.endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Payment Response:", data);

				// Handle different response structures
				let checkoutUrl = null;
				let sessionId = null;

				// Try different response formats
				if (data.data?.url) {
					checkoutUrl = data.data.url;
				} else if (data.url) {
					checkoutUrl = data.url;
				} else if (data.sessionId) {
					sessionId = data.sessionId;
				} else if (data.data?.id) {
					sessionId = data.data.id;
				}

				if (checkoutUrl) {
					// Redirect to Stripe checkout
					window.location.href = checkoutUrl;
				} else if (sessionId) {
					// Import Stripe and redirect to checkout
					const stripe = await import("@stripe/stripe-js").then(
						(mod) =>
							mod.loadStripe(
								process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
							),
					);

					if (stripe) {
						await stripe.redirectToCheckout({ sessionId });
					} else {
						throw new Error("Failed to load Stripe");
					}
				} else {
					console.error(
						"No checkout URL or session ID found in response:",
						data,
					);
					throw new Error("No checkout information received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Payment error");
			}
		} catch (error) {
			console.error("Payment error:", error);
			setIsProcessingPayment(false);
			// You could show an error message to the user here
		}
	}, [
		session,
		locale,
		reportType,
		currentReport.endpoint,
		currentReport.concernType,
	]);
	// Carousel scroll handlers - auto-scroll on mouse proximity and drag
	const startAutoScroll = useCallback(
		(direction) => {
			if (isAutoScrolling) return;

			setIsAutoScrolling(true);
			const scrollSpeed =
				scrollConfig.speed.desktop * scrollConfig.smoothness;

			const scroll = () => {
				if (!carouselRef.current) return;

				const container = carouselRef.current;
				const currentScroll = container.scrollLeft;
				const maxScroll = container.scrollWidth - container.clientWidth;

				if (direction === "left" && currentScroll > 0) {
					container.scrollLeft = Math.max(
						0,
						currentScroll - scrollSpeed,
					);
					autoScrollRef.current = requestAnimationFrame(scroll);
				} else if (direction === "right" && currentScroll < maxScroll) {
					container.scrollLeft = Math.min(
						maxScroll,
						currentScroll + scrollSpeed,
					);
					autoScrollRef.current = requestAnimationFrame(scroll);
				} else {
					stopAutoScroll();
				}
			};

			autoScrollRef.current = requestAnimationFrame(scroll);
		},
		[isAutoScrolling, scrollConfig.speed.desktop, scrollConfig.smoothness],
	);

	const stopAutoScroll = useCallback(() => {
		setIsAutoScrolling(false);
		if (autoScrollRef.current) {
			cancelAnimationFrame(autoScrollRef.current);
			autoScrollRef.current = null;
		}
	}, []);

	const handleContainerMouseMove = useCallback(
		(e) => {
			if (isDragging) {
				handleMouseMoveOnDesktop(e);
			} else {
				handleMouseMoveForAutoScroll(e);
			}
		},
		[isDragging],
	);

	const handleMouseMoveForAutoScroll = useCallback(
		(e) => {
			if (!carouselRef.current || isDragging) return;

			const container = carouselRef.current;
			const rect = container.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const containerWidth = rect.width;
			const edgeThreshold = scrollConfig.edgeThreshold;

			stopAutoScroll();

			if (mouseX < edgeThreshold && container.scrollLeft > 0) {
				startAutoScroll("left");
			} else if (mouseX > containerWidth - edgeThreshold) {
				const maxScroll = container.scrollWidth - container.clientWidth;
				if (container.scrollLeft < maxScroll) {
					startAutoScroll("right");
				}
			}
		},
		[
			isDragging,
			scrollConfig.edgeThreshold,
			stopAutoScroll,
			startAutoScroll,
		],
	);

	const handleCardClick = useCallback(
		(e, key) => {
			if (hasDragged) {
				e.preventDefault();
				return;
			}

			router.push(`/${locale}/report-preview?type=${key}`);
		},
		[hasDragged, locale, router],
	);

	const handleMouseDown = useCallback(
		(e) => {
			if (!carouselRef.current) return;

			stopAutoScroll();

			setIsDragging(true);
			setHasDragged(false);
			setDragStart({
				x: e.pageX - carouselRef.current.offsetLeft,
				scrollLeft: carouselRef.current.scrollLeft,
			});
		},
		[stopAutoScroll],
	);

	const handleMouseMoveOnDesktop = useCallback(
		(e) => {
			if (!isDragging || !carouselRef.current) return;

			e.preventDefault();
			const x = e.pageX - carouselRef.current.offsetLeft;
			const walk = (x - dragStart.x) * 2;

			if (Math.abs(walk) > 5) {
				setHasDragged(true);
			}

			carouselRef.current.scrollLeft = dragStart.scrollLeft - walk;
		},
		[isDragging, dragStart.x, dragStart.scrollLeft],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setTimeout(() => setHasDragged(false), 100);
	}, []);

	const handleMouseLeave = useCallback(() => {
		if (!isDragging) {
			stopAutoScroll();
		} else if (isDragging) {
			handleMouseUp();
		}
	}, [isDragging, stopAutoScroll, handleMouseUp]);
	const reviews = [
		{
			id: 1,
			author: "郭鈺",
			rating: 4,
			date: "01.01.2026",
			comment:
				"之前買過很購股票的美股跌片，很常常少了點什么。換成這個自水晶馬現材質，價格好，優勢卻跳搖了不夠！不太覺得，手機上去的溜。",
			verified: true,
		},
		{
			id: 2,
			author: "單加柔",
			rating: 4,
			date: "29.12.2025",
			comment:
				"卉洛的路人找操找我拔女化意見，溫白水晶欠太陽，馬顏旭佳佳氣，開幼架標篇正人。用了三個月，店裡的客流盤實有起來說，而且少了很多的時間分配，盡管商務仲沒人生了。",
			verified: true,
		},
	];

	return (
		<main className="w-full">
			<style>{`
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
			`}</style>

			{/* Navbar - Non-sticky */}
			<div className="[&>nav]:!relative [&>nav]:!top-auto">
				<ShopNavbar />
			</div>

			{/* Main Content Area */}
			<div className="relative w-full pb-8 sm:pb-12 bg-white">
				{/* Breadcrumb Navigation */}
				<div className="px-4 py-4 sm:py-6 md:py-8 bg-white">
					<div className="container mx-auto">
						<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
							<a
								href="/"
								className="text-gray-900 hover:text-[#8B9F3A]"
							>
								{locale === "zh-CN" ? "首頁" : "首頁"}
							</a>
							<span className="text-gray-400">{">"}</span>
							<span className="text-gray-900">
								{currentReport.title}
							</span>
						</div>
					</div>
				</div>

				{/* Content Section */}
				<section className="relative w-full px-1 py-2 sm:py-4">
					<div className="container mx-auto max-w-full">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* Left Column - Images (bottom on mobile, left on desktop) */}
							<div className="order-2 px-0 lg:order-1 lg:px-6">
								<div className="space-y-4">
									{/* Report Preview Image */}
									<div className="relative w-full">
										<Image
											src="/images/report-preview/report.png"
											alt={
												locale === "zh-CN"
													? "報告預覽"
													: "報告預覽"
											}
											width={400}
											height={500}
											className="w-full h-auto rounded-lg"
										/>
									</div>
								</div>
							</div>

							{/* Right Column - Details (top on mobile, right on desktop) */}
							<div className="order-1 space-y-6 lg:order-2">
								{/* Title and Rating */}
								<div>
									<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#073E31] mb-2 sm:mb-3">
										{currentReport.title}
									</h1>
									<div className="flex items-center gap-1.5 sm:gap-2">
										<div className="flex text-yellow-400">
											{[...Array(4)].map((_, i) => (
												<span key={i}>★</span>
											))}
											<span className="text-gray-400">
												★
											</span>
										</div>
										<span className="font-semibold text-gray-600">
											4.5/5
										</span>
									</div>
								</div>

								{/* Price Section */}
								<div className="space-y-1 sm:space-y-2">
									<div className="flex flex-wrap items-center gap-2 sm:gap-3">
										<span className="text-2xl sm:text-3xl font-bold text-[#073E31]">
											HK${currentReport.price}.00
										</span>
										<span className="text-base sm:text-lg text-gray-400 line-through">
											HK${currentReport.originalPrice}.00
										</span>
										<span className="px-3 py-1 text-sm font-bold text-red-500 rounded bg-red-50">
											-
											{Math.round(
												((currentReport.originalPrice -
													currentReport.price) /
													currentReport.originalPrice) *
													100,
											)}
											%
										</span>
									</div>
								</div>

								{/* Description */}
								<div className="text-sm sm:text-base leading-relaxed text-gray-700">
									<p>{currentReport.description}</p>
								</div>

								{/* Expandable Content */}
								<button
									onClick={() =>
										(window.location.href = `/demo?category=${reportType}`)
									}
									className="flex items-center justify-center w-full sm:w-auto px-4 py-3 text-sm sm:text-base font-semibold text-white transition bg-[#7E8A00] rounded-full hover:bg-gray-900"
								>
									<span>
										{locale === "zh-CN"
											? "了解詳細報告內容"
											: "了解詳細報告內容"}
									</span>
								</button>

								{/* Divider Line */}
								<div className="border-t border-gray-300"></div>

								{/* Word Count */}
								<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
									<span className="text-gray-600">
										{locale === "zh-CN" ? "字數" : "字數"}
									</span>
									<span className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg">
										{locale === "zh-CN"
											? "約15000字"
											: "約15000字"}
									</span>
								</div>
								{/* Divider Line */}
								<div className="border-t border-gray-300"></div>

								{/* Quantity Selector */}
								{/* <div className="flex items-center gap-4">
									<button
										onClick={() =>
											setQuantity(
												Math.max(1, quantity - 1),
											)
										}
										className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
									>
										−
									</button>
									<span className="px-6 py-2 font-semibold border border-gray-300 rounded-lg">
										{quantity}
									</span>
									<button
										onClick={() =>
											setQuantity(quantity + 1)
										}
										className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
									>
										+
									</button>
								</div> */}

								{/* Action Buttons */}
								<div className="space-y-3">
									<button
										onClick={handlePayment}
										disabled={isProcessingPayment}
										className="w-full sm:w-auto px-4 py-3 text-sm sm:text-base font-semibold text-white transition bg-[#7E8A00] rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isProcessingPayment
											? "處理中..."
											: "立即購買"}
									</button>
								</div>

								{/* User Reviews Section */}
								<div className="pt-4 sm:pt-6 border-t">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
										<h3 className="text-base sm:text-lg font-semibold text-[#073E31]">
											{locale === "zh-CN"
												? "用户評論"
												: "用户評論"}
										</h3>
										<div className="flex items-center gap-2 sm:gap-3">
											<select
												value={selectedRating}
												onChange={(e) =>
													setSelectedRating(
														e.target.value,
													)
												}
												className="px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg"
											>
												<option value="最經">
													{locale === "zh-CN"
														? "最經"
														: "最經"}
												</option>
												<option value="最新">
													{locale === "zh-CN"
														? "最新"
														: "最新"}
												</option>
											</select>
											<button className="bg-[#8B9F3A] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#7a8e2f]">
												{locale === "zh-CN"
													? "寫評論"
													: "寫評論"}
											</button>
										</div>
									</div>

									{/* Rating Summary */}
									<div className="flex items-center gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg bg-gray-50">
										<div>
											<div className="text-3xl sm:text-4xl font-bold text-[#073E31]">
												4.6
											</div>
										</div>
										<div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
											{[5, 4, 3, 2, 1].map((star) => (
												<div
													key={star}
													className="flex items-center gap-2"
												>
													<span className="w-4 text-sm text-gray-600">
														{star}
													</span>
													<div className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
														<div
															className="h-full bg-[#8B9F3A]"
															style={{
																width: `${
																	star === 5
																		? 90
																		: star ===
																			  4
																			? 75
																			: 50
																}%`,
															}}
														></div>
													</div>
													<span className="w-8 text-sm text-gray-600">
														123
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Review Cards */}
									<div className="space-y-3 sm:space-y-4">
										{reviews.map((review) => (
											<div
												key={review.id}
												className="p-3 sm:p-4 rounded-lg bg-gray-50"
											>
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-[#073E31]">
															{review.author}
														</span>
														{review.verified && (
															<span className="text-xs text-green-500">
																✓
															</span>
														)}
													</div>
													<span className="text-xs text-gray-500">
														{review.date}
													</span>
												</div>
												<div className="flex gap-1 mb-2">
													{[
														...Array(review.rating),
													].map((_, i) => (
														<span
															key={i}
															className="text-yellow-400"
														>
															★
														</span>
													))}
													{[
														...Array(
															5 - review.rating,
														),
													].map((_, i) => (
														<span
															key={i}
															className="text-gray-300"
														>
															★
														</span>
													))}
												</div>
												<p className="text-sm leading-relaxed text-gray-700">
													{review.comment}
												</p>
												<div className="flex items-center gap-4 mt-3">
													<button className="text-xs text-gray-500 hover:text-[#8B9F3A]">
														···
													</button>
												</div>
											</div>
										))}
									</div>

									{/* Load More Reviews */}
									<button className="w-full py-2.5 sm:py-3 mt-4 sm:mt-6 text-sm sm:text-base font-semibold text-white transition bg-black rounded-full hover:bg-gray-900">
										{locale === "zh-CN"
											? "更多評價"
											: "更多評價"}
									</button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* More Calculations Section */}
			<section className="relative w-full px-4 py-8 sm:py-10 md:py-12 bg-white">
				<div className="container mx-auto max-w-full">
					<h2 className="text-2xl sm:text-3xl font-bold text-center text-[#073E31] mb-8 sm:mb-10 md:mb-12">
						{locale === "zh-CN" ? "更多測算" : "更多測算"}
					</h2>

					{/* Scrollable Carousel */}
					<div className="relative w-full overflow-hidden">
						<div
							ref={carouselRef}
							className="w-full overflow-x-auto scrollbar-hide touch-pan-x"
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								cursor: isDragging ? "grabbing" : "grab",
							}}
							onMouseMove={handleContainerMouseMove}
							onMouseLeave={handleMouseLeave}
							onMouseDown={handleMouseDown}
							onMouseUp={handleMouseUp}
						>
							<div className="inline-flex gap-4 sm:gap-6 px-0 pb-4 md:px-4">
								{Object.entries(reportConfig).map(
									([key, config]) => {
										// Skip the current report type
										if (key === reportType) return null;

										// Calculate discount percentage
										const discount = Math.round(
											((config.originalPrice -
												config.price) /
												config.originalPrice) *
												100,
										);

										// Get image path (using actual images from public/images/report-preview)
										const imageMap = {
											fengshui:
												"/images/report-preview/fengshui.png",
											life: "/images/report-preview/life.png",
											relationship:
												"/images/report-preview/relationship.png",
											couple: "/images/report-preview/couple.png",
											wealth: "/images/report-preview/wealth.png",
											health: "/images/report-preview/health.png",
											career: "/images/report-preview/career.png",
										};

										return (
											<div
												key={key}
												className="flex-shrink-0 w-52 sm:w-64 overflow-hidden transition cursor-pointer"
												onClick={(e) =>
													handleCardClick(e, key)
												}
											>
												<div className="relative w-full overflow-hidden aspect-square">
													<Image
														src={
															imageMap[key] ||
															"/images/report-preview/default.png"
														}
														alt={config.title}
														fill
														className="object-cover transition hover:scale-110"
													/>
												</div>
												<div className="p-3 sm:p-4">
													<h3 className="font-semibold text-[#073E31] mb-1.5 sm:mb-2 text-xs sm:text-sm line-clamp-2">
														{config.title}
													</h3>
													<div className="flex items-center gap-1.5 sm:gap-2">
														<span className="text-[#8B9F3A] font-bold text-xs sm:text-sm">
															HK${config.price}
														</span>
														<span className="text-[10px] sm:text-xs text-gray-400 line-through">
															HK$
															{
																config.originalPrice
															}
														</span>
														<span className="text-[10px] sm:text-xs font-semibold text-red-500">
															-{discount}%
														</span>
													</div>
												</div>
											</div>
										);
									},
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter Banner - Overlapping Footer (hidden on mobile) */}
			<div className="relative z-10 hidden -mb-6 md:block">
				<div className="container px-4 mx-auto">
					<div className="bg-[#8B9F3A] rounded-2xl sm:rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
							<div className="flex flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row">
								<div className="text-white text-center md:text-left">
									<h2 className="text-xl sm:text-2xl font-bold md:text-3xl">
										{locale === "zh-CN"
											? "随时了解"
											: "隨時了解"}
									</h2>
									<h2 className="text-xl sm:text-2xl font-bold md:text-3xl">
										{locale === "zh-CN"
											? "我们的最新优惠"
											: "我們的最新優惠"}
									</h2>
								</div>
								<div className="flex flex-col gap-2 sm:gap-3 w-full max-w-sm sm:max-w-none md:w-auto md:min-w-[320px] lg:min-w-[400px]">
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
										className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-800 bg-white rounded-full"
									/>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-gray-800 bg-white rounded-full hover:bg-gray-100"
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

export default ReportPreviewPage;
