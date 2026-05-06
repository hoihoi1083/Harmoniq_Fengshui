"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import FooterV2 from "@/components/home/FooterV2";
import ShopAssistantWidget from "@/components/shop/ShopAssistantWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDisplayPrices } from "@/utils/regionalPricing";
import { REPORT_PRODUCT_ID_BY_TYPE } from "@/lib/reportProducts";
import { toast } from "react-toastify";

const ReportPreviewPage = () => {
	const locale = useLocale();
	const router = useRouter();
	const t = useTranslations("reportPreview");
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const reportType = searchParams.get("type") || "fengshui";

	const [email, setEmail] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [expandedContent, setExpandedContent] = useState(false);
	const [selectedRating, setSelectedRating] = useState("newest");
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [region, setRegion] = useState("hongkong");
	const [cartCount, setCartCount] = useState(0);

	// Sync region from localStorage (china → CNY, hongkong → HKD, taiwan → TWD)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const stored = localStorage.getItem("userRegion");
		if (stored && ["china", "hongkong", "taiwan"].includes(stored))
			setRegion(stored);
	}, []);

	// Fetch cart count so navbar badge is in sync on this page
	useEffect(() => {
		const fetchCartCount = async () => {
			try {
				const res = await fetch("/api/shop/cart");
				const data = await res.json();
				if (data.success) {
					const totalQuantity = data.data.items.reduce(
						(total, item) => total + item.quantity,
						0,
					);
					setCartCount(totalQuantity);
				}
			} catch (error) {
				console.error("Failed to fetch cart in report-preview:", error);
			}
		};

		if (session?.user) {
			fetchCartCount();
		}
	}, [session]);

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

	// Report type configuration with pricing and descriptions (title/description from i18n)
	const reportConfig = {
		fengshui: {
			title: t("fengshui.title"),
			price: 188,
			originalPrice: 388,
			description: t("fengshui.description"),
			endpoint: "/api/checkoutSessions/payment3",
			concernType: "fengshui",
		},
		life: {
			title: t("life.title"),
			price: 88,
			originalPrice: 168,
			description: t("life.description"),
			endpoint: "/api/checkoutSessions/payment4",
			concernType: "life",
		},
		relationship: {
			title: t("relationship.title"),
			price: 38,
			originalPrice: 68,
			description: t("relationship.description"),
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "love",
		},
		couple: {
			title: t("couple.title"),
			price: 88,
			originalPrice: 168,
			description: t("couple.description"),
			endpoint: "/api/payment-couple",
			concernType: "couple",
		},
		wealth: {
			title: t("wealth.title"),
			price: 38,
			originalPrice: 68,
			description: t("wealth.description"),
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "financial",
		},
		health: {
			title: t("health.title"),
			price: 38,
			originalPrice: 68,
			description: t("health.description"),
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "health",
		},
		career: {
			title: t("career.title"),
			price: 88,
			originalPrice: 168,
			description: t("career.description"),
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "career",
		},
	};

	const currentReport = reportConfig[reportType] || reportConfig.fengshui;
	const reportPreviewImageMap = {
		fengshui: "/images/report-preview/report.png",
		life: "/images/report-preview/life-report.png",
		relationship: "/images/report-preview/relationship-report.png",
		couple: "/images/report-preview/couple-report.png",
		wealth: "/images/report-preview/wealth-report.png",
		health: "/images/report-preview/health-report.png",
		career: "/images/report-preview/career-report.png",
	};

	// Regional pricing: show correct symbol and amounts for CNY / HKD / TWD
	const displayInfo = getDisplayPrices(locale, region);
	const currencySymbol = displayInfo.symbol;
	const priceInfo =
		displayInfo.prices[reportType] || displayInfo.prices.fengshui;
	const basePrice = priceInfo?.discount ?? currentReport.price;
	const currentOriginalPrice =
		priceInfo?.original ?? currentReport.originalPrice;

	// Printed report toggle and extra fee
	const [wantPrint, setWantPrint] = useState(false);
	const getPrintFee = () => {
		if (region === "taiwan") return 100;
		if (region === "china" || locale === "zh-CN") return 20;
		return 20;
	};
	const printFee = wantPrint ? getPrintFee() : 0;
	const currentPrice = basePrice + printFee;

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

	// Map report type -> admin-created Product productId
	const reportProductIds = REPORT_PRODUCT_ID_BY_TYPE;

	// Add selected report to cart instead of direct Stripe checkout
	const handleAddToCart = useCallback(async () => {
		if (!session) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(
				`/${locale}/auth/login?redirect=/report-preview?type=${reportType}`,
			);
			return;
		}

		setIsProcessingPayment(true);

		try {
			const productId =
				reportProductIds[reportType] || reportProductIds.fengshui;

			const response = await fetch("/api/shop/cart", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					productId,
					quantity: 1,
					// Always mark reports so invoice can show per-report form:
					// - "report-print" when user wants printed copy
					// - "report-digital" when email-only
					giftReportType: wantPrint
						? "report-print"
						: "report-digital",
				}),
			});

			if (response.ok) {
				const data = await response.json();
				const totalQuantity = data.data.items.reduce(
					(total, item) => total + item.quantity,
					0,
				);
				setCartCount(totalQuantity);
				const cartLabel =
					locale === "zh-CN" ? "查看购物车" : "查看購物車";
				const isMobile =
					typeof window !== "undefined" &&
					window.matchMedia &&
					window.matchMedia("(max-width: 640px)").matches;
				toast.success(
					<div className="flex flex-col gap-1">
						<span>
							{locale === "zh-CN"
								? "已加入购物车："
								: "已加入購物車："}
							{currentReport.title}
						</span>
						<button
							type="button"
							onClick={() => router.push(`/${locale}/cart`)}
							className="text-left underline font-medium"
						>
							{cartLabel}
						</button>
					</div>,
					{
						autoClose: 2800,
						position: isMobile ? "bottom-center" : "top-right",
						closeOnClick: false,
					},
				);
				setIsProcessingPayment(false);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Cart error");
			}
		} catch (error) {
			console.error("Add-to-cart error:", error);
			setIsProcessingPayment(false);
		}
	}, [session, locale, reportType, wantPrint, router]);

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
			author: t("review1Author"),
			rating: 4,
			date: t("review1Date"),
			comment: t("review1Comment"),
			verified: true,
		},
		{
			id: 2,
			author: t("review2Author"),
			rating: 4,
			date: t("review2Date"),
			comment: t("review2Comment"),
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
				<ShopNavbar cartCount={cartCount} />
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
								{t("breadcrumbHome")}
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
											src={
												reportPreviewImageMap[
													reportType
												] ||
												reportPreviewImageMap.fengshui
											}
											alt={t("reportImageAlt")}
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

								{/* Price Section - uses region (CNY/HKD/TWD) for symbol and amounts */}
								<div className="space-y-1 sm:space-y-2">
									<div className="flex flex-wrap items-center gap-2 sm:gap-3">
										<span className="text-2xl sm:text-3xl font-bold text-[#073E31]">
											{currencySymbol}
											{currentPrice}
										</span>
										<span className="text-base sm:text-lg text-gray-400 line-through">
											{currencySymbol}
											{currentOriginalPrice}
										</span>
										<span className="px-3 py-1 text-sm font-bold text-red-500 rounded bg-red-50">
											-
											{Math.round(
												((currentOriginalPrice -
													currentPrice) /
													currentOriginalPrice) *
													100,
											)}
											%
										</span>
									</div>

									{/* Print option toggle */}
									<div className="mt-2 flex items-start gap-2 text-xs sm:text-sm text-gray-700">
										<input
											id="want-print"
											type="checkbox"
											checked={wantPrint}
											onChange={(e) =>
												setWantPrint(e.target.checked)
											}
											className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#7E8A00] focus:ring-[#7E8A00]"
										/>
										<label
											htmlFor="want-print"
											className="leading-snug"
										>
											{locale === "zh-CN"
												? "需要纸本报告（加收运费及印刷成本）"
												: "需要紙本報告（加收運費及印刷成本）"}
										</label>
									</div>
								</div>

								{/* Description */}
								<div className="text-sm sm:text-base leading-relaxed text-gray-700">
									<p>{currentReport.description}</p>
								</div>

								{/* Divider Line */}
								<div className="border-t border-gray-300"></div>

								{/* Word Count */}
								<div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
									<span className="text-gray-600">
										{t("wordCount")}
									</span>
									<span className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg">
										{t("wordCountValue")}
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
										onClick={handleAddToCart}
										disabled={isProcessingPayment}
										className="w-full sm:w-auto px-10 py-3 text-sm sm:text-base font-semibold text-white transition bg-[#7E8A00] rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isProcessingPayment
											? t("processing")
											: t("buyNow")}
									</button>
								</div>

								{/* User Reviews Section */}
								{/* <div className="pt-4 sm:pt-6 border-t">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
										<h3 className="text-base sm:text-lg font-semibold text-[#073E31]">
											{t("userReviews")}
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
												<option value="mostRelevant">
													{t("sortMostRelevant")}
												</option>
												<option value="newest">
													{t("sortNewest")}
												</option>
											</select>
											<button className="bg-[#8B9F3A] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#7a8e2f]">
												{t("writeReview")}
											</button>
										</div>
									</div>
 */}
								{/* Rating Summary */}
								{/* <div className="flex items-center gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg bg-gray-50">
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
 */}
								{/* Review Cards */}
								{/* <div className="space-y-3 sm:space-y-4">
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
									</div> */}

								{/* Load More Reviews */}
								{/* <button className="w-full py-2.5 sm:py-3 mt-4 sm:mt-6 text-sm sm:text-base font-semibold text-white transition bg-black rounded-full hover:bg-gray-900">
										{t("moreReviews")}
									</button>
								</div> */}
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* 報告類統一說明 - above more calculations */}
			<section className="relative w-full px-4 py-6 sm:py-8 bg-white border-t border-gray-100">
				<div className="container mx-auto max-w-3xl">
					<div className="text-xs sm:text-sm text-gray-500 leading-relaxed space-y-6">
						{locale === "zh-CN" ? (
							<>
								<div>
									<p className="font-medium text-gray-600 mb-1">
										退款政策
									</p>
									<p className="whitespace-pre-line">
										请留意，本商品系基于您提供之生辰资讯专属定制，具有独一无二的个人属性。为保障您的权益，付款完成后两小时内，您可申请免费取消订单并全额退款。若超过两小时期限，恕不接受任何理由之退款、退换或修改服务。请您于付款前再次确认出生资讯正确无误。因资讯错误所致之内容差异，本公司概不负责。
									</p>
								</div>
								<div>
									<p className="font-medium text-gray-600 mb-1">
										发货方式
									</p>
									<p className="whitespace-pre-line">
										由于《个人命理能量报告》均由真人顾问亲自为您分析编写，量身定制需要投入必要的时间与心力，无法仓促完成。
										在您提交完整出生信息后，我们将在72小时内将电子版发送至您的邮箱，或在7天内完成报告的撰写、校对、精致印刷，寄到您的手中。感谢您的理解。这份等待，是为了交付一份不负您信任的诚意之作。
									</p>
								</div>
							</>
						) : (
							<>
								<div>
									<p className="font-medium text-gray-600 mb-1">
										退款政策
									</p>
									<p className="whitespace-pre-line">
										請留意，本商品係基於您提供之生辰資訊專屬定制，具有獨一無二的個人屬性。為保障您的權益，付款完成後兩小時內，您可申請免費取消訂單並全額退款。若超過兩小時期限，恕不接受任何理由之退款、退換或修改服務。請您於付款前再次確認出生資訊正確無誤。因資訊錯誤所致之內容差異，本公司概不負責。
									</p>
								</div>
								<div>
									<p className="font-medium text-gray-600 mb-1">
										發貨方式
									</p>
									<p className="whitespace-pre-line">
										由於《個人命理能量報告》均由真人顧問親自為您分析編寫，量身定制需要投入必要的時間與心力，無法倉促完成。
										在您提交完整出生資訊後，我們將在72小時內將電子版發送至您的郵箱，或在7天內完成報告的撰寫、校對、精緻印刷，寄到您的手中。感謝您的理解。這份等待，是為了交付一份不負您信任的誠意之作。
									</p>
								</div>
							</>
						)}
					</div>
				</div>
			</section>

			{/* More Calculations Section */}
			<section className="relative w-full px-4 py-8 sm:py-10 md:py-12 bg-white">
				<div className="container mx-auto max-w-full">
					<h2 className="text-2xl sm:text-3xl font-bold text-center text-[#073E31] mb-8 sm:mb-10 md:mb-12">
						{t("moreCalculations")}
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

										const cardPriceInfo =
											displayInfo.prices[key] ||
											displayInfo.prices.fengshui;
										const cardPrice =
											cardPriceInfo?.discount ??
											config.price;
										const cardOriginal =
											cardPriceInfo?.original ??
											config.originalPrice;
										const discount = Math.round(
											((cardOriginal - cardPrice) /
												cardOriginal) *
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
												onClick={(e) => {
													handleCardClick(e, key);
												}}
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
													<h3 className="font-semibold text-[#073E31] mb-1.5 sm:mb-2 text-md sm:text-lg line-clamp-2">
														{config.title}
													</h3>
													<div className="flex items-center gap-1.5 sm:gap-2">
														<span className="text-[#8B9F3A] font-bold text-md sm:text-lg">
															{currencySymbol}
															{cardPrice}
														</span>
														<span className="text-sm sm:text-md text-gray-400 line-through">
															{currencySymbol}
															{cardOriginal}
														</span>
														<span className="text-sm sm:text-md font-semibold text-red-500">
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
			{/* <div className="relative z-10 hidden -mb-6 md:block">
				<div className="container px-4 mx-auto">
					<div className="bg-[#8B9F3A] rounded-2xl sm:rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
							<div className="flex flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row">
								<div className="text-white text-center md:text-left">
									<h2 className="text-xl sm:text-2xl font-bold md:text-3xl">
										{t("stayUpdated")}
									</h2>
									<h2 className="text-xl sm:text-2xl font-bold md:text-3xl">
										{t("latestOffers")}
									</h2>
								</div>
								<div className="flex flex-col gap-2 sm:gap-3 w-full max-w-sm sm:max-w-none md:w-auto md:min-w-[320px] lg:min-w-[400px]">
									<Input
										type="email"
										placeholder={t("emailPlaceholder")}
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
										{t("subscribe")}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div> */}

			{/* Footer */}
			<FooterV2 />
			<ShopAssistantWidget locale={locale} />
		</main>
	);
};

export default ReportPreviewPage;
