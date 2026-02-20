"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { get, post, patch } from "@/lib/ajax";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import ShopNavbar from "@/components/ShopNavbar";
import Footer from "@/components/home/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/utils/regionalPricing";
import FooterV2 from "@/components/home/FooterV2";

export default function DemoPage() {
	const t = useTranslations("demoPage");
	const locale = useLocale();
	const searchParams = useSearchParams();
	const { data: session } = useSession();
	const router = useRouter();
	const [activeTag, setActiveTag] = useState("fengshui");
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [currentCardType, setCurrentCardType] = useState("");
	const [existingReport, setExistingReport] = useState(null);
	const [showExistingReportDialog, setShowExistingReportDialog] =
		useState(false);
	const [couplePreviewType, setCouplePreviewType] = useState("compatibility"); // "compatibility" or "exclusive"
	// Newsletter email state
	const [email, setEmail] = useState("");

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
				"評估事業發展方向，預測機遇與挑戰，提供職業生涯規劃與催旺建議。",
			endpoint: "/api/checkoutSessions/payment-fortune-category",
			concernType: "career",
		},
	};

	// 🌍 Region detection for dynamic pricing
	const [currentRegion, setCurrentRegion] = useState("hongkong");

	// Debug dialog state changes
	useEffect(() => {
		console.log("🔔 Dialog state changed:", showExistingReportDialog);
		console.log("📄 Current existing report:", existingReport);
	}, [showExistingReportDialog]);

	// Debug: Force show dialog for testing (remove this later)
	useEffect(() => {
		if (existingReport && activeTag === "fengshui") {
			console.log(
				"🧪 TEST: Should show dialog for feng shui with existing report",
			);
		}
	}, [existingReport, activeTag]);

	// 🌍 Detect region changes for dynamic pricing
	useEffect(() => {
		const updateRegion = () => {
			if (typeof window !== "undefined") {
				const storedRegion =
					localStorage.getItem("userRegion") || "hongkong";
				setCurrentRegion(storedRegion);
				console.log(
					"🌍 Demo page - Current region updated to:",
					storedRegion,
				);
			}
		};

		// Initial region detection
		updateRegion();

		// Listen for storage changes (when user switches region)
		const handleStorageChange = (e) => {
			if (e.key === "userRegion") {
				updateRegion();
			}
		};

		window.addEventListener("storage", handleStorageChange);

		// Also check periodically in case region changes within same tab
		const interval = setInterval(updateRegion, 1000);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			clearInterval(interval);
		};
	}, []);

	// Handle URL parameters
	useEffect(() => {
		const category = searchParams.get("category");
		if (category && tags.find((tag) => tag.id === category)) {
			setActiveTag(category);
		}
	}, [searchParams]);

	// Check for existing reports when user is authenticated
	useEffect(() => {
		const checkExistingReports = async () => {
			if (!session?.user?.userId) {
				console.log("👤 No user session for report check");
				return;
			}

			console.log(
				"🔍 Checking for existing reports for user:",
				session.user.userId,
			);

			try {
				// Check for existing report in current locale
				const locale =
					typeof window !== "undefined"
						? window.location.pathname.split("/")[1]
						: "zh-CN";

				console.log("🌐 Current locale:", locale);

				const { status, data } = await get(
					`/api/reportUserDoc/${session.user.userId}/${locale === "zh-CN" ? "zh" : "tw"}`,
				);

				console.log("📊 API response - Status:", status, "Data:", data);

				if (status === 0 && data) {
					console.log("✅ Found existing report:", data);
					setExistingReport(data);
				} else {
					console.log("❌ No existing report found");
					setExistingReport(null);
				}
			} catch (error) {
				console.log("⚠️ Error checking existing reports:", error);
				// Silently handle error
			}
		};

		checkExistingReports();
	}, [session?.user?.userId]);

	const tags = [
		{
			id: "fengshui",
			name: t("tags.fengshui.name"),
			description: t("tags.fengshui.description"),
		},
		{
			id: "life",
			name: t("tags.life.name"),
			description: t("tags.life.description"),
		},
		{
			id: "wealth",
			name: t("tags.wealth.name"),
			description: t("tags.wealth.description"),
		},
		{
			id: "relationship",
			name: t("tags.relationship.name"),
			description: t("tags.relationship.description"),
		},
		{
			id: "couple",
			name: t("tags.couple.name"),
			description: t("tags.couple.description"),
		},
		{
			id: "health",
			name: t("tags.health.name"),
			description: t("tags.health.description"),
		},
		{
			id: "career",
			name: t("tags.career.name"),
			description: t("tags.career.description"),
		},
	];

	const activeTagInfo = tags.find((tag) => tag.id === activeTag);
	const activeTagTitle = activeTagInfo?.name || t("tags.fengshui.name");

	// Newsletter submit handler
	const handleNewsletterSubmit = () => {
		console.log("Newsletter subscribed with email:", email);
		setEmail("");
	};

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

			router.push(`/${locale}/demo?category=${key}`);
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

	const getContentForTag = (tagId) => {
		const content = {
			fengshui: {
				title: t("content.fengshui.title"),
				features: [
					t("content.fengshui.features.0"),
					t("content.fengshui.features.1"),
					t("content.fengshui.features.2"),
					t("content.fengshui.features.3"),
				],
				description: t("content.fengshui.description"),
				isSpecial: true,
				mainTitle: t("content.fengshui.mainTitle"),
				previewTitle: t("content.fengshui.previewTitle"),
				previewImage: "/images/demo/風水.png",
			},
			life: {
				title: t("content.life.title"),
				features: [
					t("content.life.features.0"),
					t("content.life.features.1"),
					t("content.life.features.2"),
					t("content.life.features.3"),
				],
				description: t("content.life.description"),
				isSpecial: true,
				mainTitle: t("content.life.mainTitle"),
				previewTitle: t("content.life.previewTitle"),
				previewImage: "/images/demo/命理.png",
			},
			wealth: {
				title: t("content.wealth.title"),
				features: [
					t("content.wealth.features.0"),
					t("content.wealth.features.1"),
					t("content.wealth.features.2"),
					t("content.wealth.features.3"),
				],
				description: t("content.wealth.description"),
				isSpecial: true,
				mainTitle: t("content.wealth.mainTitle"),
				previewTitle: t("content.wealth.previewTitle"),
				previewImage: "/images/demo/財運.png",
			},
			relationship: {
				title: t("content.relationship.title"),
				features: [
					t("content.relationship.features.0"),
					t("content.relationship.features.1"),
					t("content.relationship.features.2"),
					t("content.relationship.features.3"),
				],
				description: t("content.relationship.description"),
				isSpecial: true,
				mainTitle: t("content.relationship.mainTitle"),
				previewTitle: t("content.relationship.previewTitle"),
				previewImage: "/images/demo/感情.png",
			},
			health: {
				title: t("content.health.title"),
				features: [
					t("content.health.features.0"),
					t("content.health.features.1"),
					t("content.health.features.2"),
					t("content.health.features.3"),
				],
				description: t("content.health.description"),
				isSpecial: true,
				mainTitle: t("content.health.mainTitle"),
				previewTitle: t("content.health.previewTitle"),
				previewImage: "/images/demo/健康.png",
			},
			career: {
				title: t("content.career.title"),
				features: [
					t("content.career.features.0"),
					t("content.career.features.1"),
					t("content.career.features.2"),
					t("content.career.features.3"),
				],
				description: t("content.career.description"),
				isSpecial: true,
				mainTitle: t("content.career.mainTitle"),
				previewTitle: t("content.career.previewTitle"),
				previewImage: "/images/demo/事業.png",
			},
			couple: {
				title: t("content.couple.title"),
				features: [
					t("content.couple.features.0"),
					t("content.couple.features.1"),
					t("content.couple.features.2"),
					t("content.couple.features.3"),
				],
				description: t("content.couple.description"),
				isSpecial: true,
				isCouple: true,
				mainTitle: t("content.couple.mainTitle"),
				previewTitle: t("content.couple.previewTitle"),
				previewImage: "/images/demo/couple.png",
			},
		};
		return content[tagId] || content.fengshui;
	};

	// Payment functions
	// Handle viewing existing report
	const handleViewExistingReport = () => {
		setShowExistingReportDialog(false);
		router.push("/report");
	};

	// Handle retest (new payment for feng shui)
	const handleRetestWithPayment = async () => {
		if (!session?.user?.userId) return;

		try {
			setShowExistingReportDialog(false);

			// Reset user's lock status to require new payment
			await post(`/api/users/${session.user.userId}`, {
				isLock: true,
				genStatus: "none",
			});

			// Mark old reports as deleted
			await patch(`/api/reportUserDoc/${session.user.userId}`, {
				isDelete: 1,
			});

			// Proceed to feng shui payment
			await handleFengshuiDirectPayment();
		} catch (error) {
			console.error("Failed to prepare for retest:", error);
		}
	};

	// Handle feng shui payment with authentication checks
	const handleFengshuiPayment = async () => {
		console.log("🔍 Feng shui payment called");
		console.log("👤 Session user ID:", session?.user?.userId);
		console.log("📄 Existing report:", existingReport);

		// Check if user is logged in first
		if (!session?.user?.userId) {
			console.log("❌ No session, redirecting to login");
			// Redirect to login page immediately
			router.push("/auth/login");
			return;
		}

		if (existingReport) {
			console.log("✅ Found existing report, showing dialog");
			setShowExistingReportDialog(true);
			setCurrentCardType("fengshui");
		} else {
			console.log("🆕 No existing report, proceeding to payment");
			// Skip dialog and go directly to payment
			await handleFengshuiDirectPayment();
		}
	};

	// Direct feng shui payment
	const handleFengshuiDirectPayment = async () => {
		setIsProcessingPayment(true);
		setCurrentCardType("fengshui");

		try {
			const response = await fetch("/api/checkoutSessions/payment2", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quantity: 1,
					directPayment: true,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.data?.url) {
					window.location.href = data.data.url;
				} else {
					throw new Error("No checkout URL received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Payment error");
			}
		} catch (error) {
			console.error("Feng shui payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
		}
	};

	// Handle premium payment ($188 for fengshui, $88 for life)
	const handlePremiumPayment = async () => {
		// Check if user is logged in
		if (!session?.user?.userId) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(`/${locale}/auth/login?redirect=/demo`);
			return;
		}

		setIsProcessingPayment(true);
		setCurrentCardType("premium");

		try {
			let endpoint;
			if (activeTag === "fengshui") {
				endpoint = "/api/checkoutSessions/payment2"; // $188 fengshui premium
			} else if (activeTag === "life") {
				endpoint = "/api/checkoutSessions/payment4"; // $88 life premium
			} else {
				endpoint = "/api/checkoutSessions/payment4"; // $88 for other categories
			}

			// Get fresh locale and region from localStorage to ensure consistency
			const storedRegion = localStorage.getItem("userRegion");
			const regionToLocaleMap = {
				china: "zh-CN",
				hongkong: "zh-TW",
				taiwan: "zh-TW",
			};
			const freshLocale =
				regionToLocaleMap[storedRegion] || locale || "zh-TW";

			console.log(
				"💰 Demo page premium payment - Using fresh locale:",
				freshLocale,
				"from stored region:",
				storedRegion,
			);

			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quantity: 1,
					directPayment: true,
					locale: freshLocale, // Add locale parameter
					region: storedRegion, // Add region parameter for NTD support
				}),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.data?.url) {
					window.location.href = data.data.url;
				} else {
					throw new Error("No checkout URL received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Payment error");
			}
		} catch (error) {
			console.error("Premium payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
		}
	};

	// Handle $88 couple payment
	const handleCouplePayment = async () => {
		// Check if user is logged in
		if (!session?.user?.userId) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(`/${locale}/auth/login?redirect=/demo`);
			return;
		}

		setIsProcessingPayment(true);
		setCurrentCardType("couple");

		try {
			// Prepare request body
			const requestBody = {
				locale: locale, // Use current locale for couple analysis
			};

			// Create checkout session for couple analysis
			const response = await fetch("/api/payment-couple", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Couple Payment Response:", data);

				if (data.sessionId) {
					// Import Stripe and redirect to checkout
					const stripe = await import("@stripe/stripe-js").then(
						(mod) =>
							mod.loadStripe(
								process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
							),
					);

					if (stripe) {
						await stripe.redirectToCheckout({
							sessionId: data.sessionId,
						});
					} else {
						throw new Error("Failed to load Stripe");
					}
				} else {
					throw new Error("No session ID received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Payment error");
			}
		} catch (error) {
			console.error("Couple payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
		}
	};

	// Handle discounted payment ($188 for fengshui, $88 for life, $38 for others)
	const handleDiscountPayment = async () => {
		// Check if user is logged in (except for fengshui which has its own auth check)
		if (activeTag !== "fengshui" && !session?.user?.userId) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(`/${locale}/auth/login?redirect=/demo`);
			return;
		}

		setIsProcessingPayment(true);
		setCurrentCardType("discount");

		try {
			if (activeTag === "fengshui") {
				// For 風水測算, use the proper authentication flow
				setIsProcessingPayment(false); // Reset state before calling feng shui payment
				await handleFengshuiPayment();
				return;
			} else if (activeTag === "life") {
				// For 命理流年測算, use $88 payment
				// Get fresh locale and region from localStorage to ensure consistency
				const storedRegion = localStorage.getItem("userRegion");
				const regionToLocaleMap = {
					china: "zh-CN",
					hongkong: "zh-TW",
					taiwan: "zh-TW",
				};
				const freshLocale =
					regionToLocaleMap[storedRegion] || locale || "zh-TW";

				console.log(
					"💰 Demo page life payment - Using fresh locale:",
					freshLocale,
					"from stored region:",
					storedRegion,
				);

				const response = await fetch("/api/checkoutSessions/payment4", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						quantity: 1,
						directPayment: true,
						locale: freshLocale, // Add locale parameter
						region: storedRegion, // Add region parameter for NTD support
					}),
				});

				if (response.ok) {
					const data = await response.json();
					if (data.data?.url) {
						window.location.href = data.data.url;
					} else {
						throw new Error("No checkout URL received");
					}
				} else {
					const errorData = await response.json();
					throw new Error(errorData.message || "Payment error");
				}
			} else if (activeTag === "couple") {
				// For 感情合盤流年測算, use couple payment
				setIsProcessingPayment(false); // Reset state before calling couple payment
				await handleCouplePayment();
				return;
			} else {
				// For 感情, 財運, 健康, 事業 - use $38 fortune payment
				const concernMapping = {
					relationship: "love",
					wealth: "financial",
					health: "health",
					career: "career",
				};

				const concernType = concernMapping[activeTag] || "financial";

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
					"💰 Demo page individual payment - Using fresh locale:",
					freshLocale,
					"from stored region:",
					storedRegion,
				);

				const response = await fetch(
					"/api/checkoutSessions/payment-fortune-category",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							concernType: concernType, // Use concernType instead of concern for the category API
							locale: freshLocale, // 🔥 Fix: Add locale parameter like couple payment
							region: storedRegion, // Add region parameter for NTD support
						}),
					},
				);

				if (response.ok) {
					const data = await response.json();
					console.log("Demo Fortune Payment Response:", data);

					// Handle different response structures
					const sessionId = data.sessionId || data.data?.id;
					console.log("Demo Extracted session ID:", sessionId);

					if (sessionId) {
						const stripe = await import("@stripe/stripe-js").then(
							(mod) =>
								mod.loadStripe(
									process.env
										.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
								),
						);

						if (stripe) {
							await stripe.redirectToCheckout({
								sessionId: sessionId,
							});
						} else {
							throw new Error("Failed to load Stripe");
						}
					} else {
						console.error(
							"No session ID found in demo response:",
							data,
						);
						throw new Error("No session ID received");
					}
				} else {
					const errorData = await response.json();
					throw new Error(errorData.error || "Payment error");
				}
			}
		} catch (error) {
			console.error("Discount payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
		}
	};

	// Get pricing based on active tag and current region
	const getPricing = () => {
		// Get currency symbol for current region
		const currencySymbol = getCurrencySymbol(currentRegion);

		// Define regional pricing structures
		const getRegionalPricing = (baseHKPrices) => {
			const { original, discount } = baseHKPrices;

			switch (currentRegion) {
				case "china":
					return {
						originalPrice: `¥${original}`,
						discountPrice: `¥${discount}`,
						unit: t("pricing.perTime"),
					};
				case "taiwan":
					// Taiwan uses different pricing structure
					const taiwanMapping = {
						// Fengshui: HK$388 -> NT$1518, HK$188 -> NT$738
						388: { original: 1518, discount: 738 },
						// Life: HK$168 -> NT$668, HK$88 -> NT$368
						168: { original: 668, discount: 368 },
						// Couple: HK$188 -> NT$668, HK$88 -> NT$368
						188: { original: 668, discount: 368 },
						// Individual: HK$88 -> NT$368, HK$38 -> NT$168
						88: { original: 368, discount: 168 },
					};
					const taiwanPrices = taiwanMapping[original] || {
						original: 368,
						discount: 168,
					};
					return {
						originalPrice: `NT$${taiwanPrices.original}`,
						discountPrice: `NT$${taiwanPrices.discount}`,
						unit: t("pricing.perTime"),
					};
				case "hongkong":
				default:
					return {
						originalPrice: `HK$${original}`,
						discountPrice: `HK$${discount}`,
						unit: t("pricing.perTime"),
					};
			}
		};

		let pricing;
		if (activeTag === "fengshui") {
			pricing = getRegionalPricing({ original: 388, discount: 188 });
		} else if (activeTag === "life") {
			pricing = getRegionalPricing({ original: 168, discount: 88 });
		} else if (activeTag === "couple") {
			pricing = getRegionalPricing({ original: 188, discount: 88 });
		} else {
			// For 感情, 財運, 健康, 事業
			pricing = getRegionalPricing({ original: 88, discount: 38 });
		}

		console.log(
			"Current pricing for",
			activeTag,
			"region",
			currentRegion,
			":",
			pricing,
		);
		return pricing;
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Navbar */}
			<div className="[&>nav]:!relative [&>nav]:!top-auto">
				<ShopNavbar />
			</div>

			{/* Breadcrumb and Title */}
			<div className="w-[95%] mx-auto px-1 sm:px-2 md:px-4 pt-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2 mb-10 text-sm text-gray-600">
							<Link
								href="/"
								className="text-gray-900 hover:text-[#8B9F3A]"
							>
								{locale === "zh-CN" ? "首頁" : "首頁"}
							</Link>
							<span className="text-gray-400">{">"}</span>
							<Link
								href="/price"
								className="text-gray-900 hover:text-[#8B9F3A]"
							>
								{locale === "zh-CN" ? "命理測算" : "命理測算"}
							</Link>
							<span className="text-gray-400">{">"}</span>
							<Link
								href={`/report-preview?type=${activeTag}`}
								className="text-gray-900 hover:text-[#8B9F3A]"
							>
								{locale === "zh-CN" ? "報告預覽" : "報告預覽"}
							</Link>
							<span className="text-gray-400">{">"}</span>
							<span className="text-gray-900">
								{locale === "zh-CN"
									? "詳細報告內容"
									: "詳細報告內容"}
							</span>
						</div>
						<h1
							className="text-4xl font-bold md:text-5xl"
							style={{
								fontFamily: "Noto Serif TC, serif",
								WebkitTextStroke: "1px #073E31",
							}}
						>
							{activeTagTitle}
						</h1>
						<div className="flex items-center gap-3 mt-3">
							<div className="flex text-3xl text-yellow-400 md:text-4xl">
								{[...Array(4)].map((_, i) => (
									<span key={i}>★</span>
								))}
								<span className="text-gray-400">★</span>
							</div>
							<span className="text-lg font-bold text-gray-600 md:text-xl">
								4.5/5
							</span>
						</div>
					</div>
					<button
						onClick={handleDiscountPayment}
						disabled={isProcessingPayment}
						className="py-3 font-semibold text-white transition bg-black rounded-full px-30 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isProcessingPayment ? t("ui.processing") : "立即購買"}
					</button>
				</div>
			</div>

			{/* Content Section */}
			<div className="max-w-full px-4 pb-20 mx-auto">
				<div className="p-8">
					{(() => {
						const content = getContentForTag(activeTag);

						// Special layout for all tags except fengshui
						if (content.isSpecial) {
							return (
								<div className="space-y-12">
									{/* Section 2: 所需材料 */}
									<div className="relative text-start">
										<div className="flex items-center justify-between px-4 mb-8 md:px-0">
											<h2
												className="relative inline-block text-start text-[32px] md:text-[64px] ml-2 md:ml-10 font-extrabold text-[#635D3B] leading-[40px] md:leading-[90px] flex-1"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
													WebkitTextStroke:
														"1px #635D3B",
												}}
											>
												{t("sections.materialsNeeded")}
												<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 mt-2"></div>
											</h2>
										</div>

										{/* Fixed Chart Button */}
										<div className="fixed z-40 bottom-4 right-4">
											<Link
												href="/"
												className="flex items-center justify-center transition-transform duration-200 active:scale-95 hover:scale-105"
											>
												<Image
													src="/images/風水妹/chart-button.png"
													alt={t(
														"ui.paymentCalculation",
													)}
													width={250}
													height={250}
													className="cursor-pointer w-[110px] md:w-[220px] h-[110px] md:h-[220px]"
													style={{
														filter: "drop-shadow(0 8px 32px rgba(163, 177, 22, 0.22))",
													}}
												/>
											</Link>
										</div>

										<div className="flex justify-center px-4">
											<img
												src={
													activeTag === "fengshui"
														? currentRegion ===
															"china"
															? "/images/demo/material2-cny.png"
															: "/images/demo/material2.png"
														: currentRegion ===
															  "china"
															? "/images/demo/material-cny.png"
															: "/images/demo/material.png"
												}
												alt={t(
													"sections.materialsNeeded",
												)}
												className="h-auto max-w-full md:max-w-[80%] shadow-lg rounded-xl"
											/>
										</div>
									</div>

									{/* Section 3: 流年報告預覽 */}
									<div className="text-start">
										<div className="px-4 mb-8 md:px-0">
											<h2
												className="relative inline-block text-start ml-2 md:ml-10 text-[32px] md:text-[64px] font-extrabold text-[#635D3B] leading-[40px] md:leading-[90px]"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
													WebkitTextStroke:
														"1px #635D3B",
												}}
											>
												{content.previewTitle}
												<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 mt-2"></div>
											</h2>
										</div>

										{/* Special couple preview section with toggle buttons */}
										{activeTag === "couple" ? (
											<div className="flex flex-col items-center px-4 space-y-6 md:px-0">
												{/* Toggle Buttons */}
												{/* Toggle Buttons */}
												<div className="flex flex-row space-x-1 sm:space-x-2 md:flex-row md:space-y-0 md:space-x-14">
													<button
														onClick={() =>
															setCouplePreviewType(
																"compatibility",
															)
														}
														className={`px-4 sm:px-10 md:px-18 py-2 sm:py-3 font-bold text-xs sm:text-sm md:text-lg transition-colors duration-300 ${
															couplePreviewType ===
															"compatibility"
																? "bg-[#A3B116] text-white"
																: "bg-[#C1C1C1] text-black"
														}`}
														style={{
															borderRadius:
																"100px",
															fontFamily:
																"Noto Serif TC, serif",
															WebkitTextStroke:
																couplePreviewType ===
																"compatibility"
																	? "0.5px #FFFFFF"
																	: "0.5px #000000",
														}}
													>
														{t(
															"ui.coupleCompatibility",
														)}
													</button>
													<button
														onClick={() =>
															setCouplePreviewType(
																"exclusive",
															)
														}
														className={`px-4 sm:px-10 md:px-18 py-2 sm:py-3 font-bold text-xs sm:text-sm md:text-lg transition-colors duration-300 ${
															couplePreviewType ===
															"exclusive"
																? "bg-[#A3B116] text-white"
																: "bg-[#C1C1C1] text-black"
														}`}
														style={{
															borderRadius:
																"100px",
															fontFamily:
																"Noto Serif TC, serif",
															WebkitTextStroke:
																couplePreviewType ===
																"exclusive"
																	? "0.5px #FFFFFF"
																	: "0.5px #000000",
														}}
													>
														{t("ui.exclusivePlan")}
													</button>
												</div>

												{/* Dynamic Image based on selection */}
												<div className="flex justify-center">
													<img
														src={
															couplePreviewType ===
															"compatibility"
																? "/images/demo/合盤1.png"
																: "/images/demo/合盤2.png"
														}
														alt={
															couplePreviewType ===
															"compatibility"
																? t(
																		"ui.coupleCompatibilityReport",
																	)
																: t(
																		"ui.exclusivePlanReport",
																	)
														}
														className="h-auto max-w-[100%]"
													/>
												</div>
											</div>
										) : activeTag === "life" ? (
											/* Special life preview section with toggle buttons */
											<div className="flex flex-col items-center px-4 space-y-6 md:px-0">
												{/* Toggle Buttons */}
												<div className="flex flex-row space-x-1 sm:space-x-2 md:flex-row md:space-y-0 md:space-x-14">
													<button
														onClick={() =>
															setCouplePreviewType(
																"compatibility",
															)
														}
														className={`px-4 sm:px-10 md:px-18 py-2 sm:py-3 font-bold text-xs sm:text-sm md:text-lg transition-colors duration-300 ${
															couplePreviewType ===
															"compatibility"
																? "bg-[#A3B116] text-white"
																: "bg-[#C1C1C1] text-black"
														}`}
														style={{
															borderRadius:
																"100px",
															fontFamily:
																"Noto Serif TC, serif",
															WebkitTextStroke:
																couplePreviewType ===
																"compatibility"
																	? "0.5px #FFFFFF"
																	: "0.5px #000000",
														}}
													>
														{t(
															"content.life.toggleButton1",
														) || "年運分析"}
													</button>
													<button
														onClick={() =>
															setCouplePreviewType(
																"exclusive",
															)
														}
														className={`px-4 sm:px-10 md:px-18 py-2 sm:py-3 font-bold text-xs sm:text-sm md:text-lg transition-colors duration-300 ${
															couplePreviewType ===
															"exclusive"
																? "bg-[#A3B116] text-white"
																: "bg-[#C1C1C1] text-black"
														}`}
														style={{
															borderRadius:
																"100px",
															fontFamily:
																"Noto Serif TC, serif",
															WebkitTextStroke:
																couplePreviewType ===
																"exclusive"
																	? "0.5px #FFFFFF"
																	: "0.5px #000000",
														}}
													>
														{t(
															"content.life.toggleButton2",
														) || "命格詳解"}
													</button>
												</div>

												{/* Dynamic Image based on selection */}
												<div className="flex justify-center">
													<img
														src={
															couplePreviewType ===
															"compatibility"
																? "/images/demo/命理.png"
																: "/images/demo/命理2.png"
														}
														alt={
															couplePreviewType ===
															"compatibility"
																? t(
																		"content.life.previewAlt1",
																	) ||
																	"年運分析報告"
																: t(
																		"content.life.previewAlt2",
																	) ||
																	"命格詳解報告"
														}
														className="h-auto max-w-[100%]"
													/>
												</div>
											</div>
										) : (
											/* Regular preview for other categories */
											<div className="flex justify-center">
												<img
													src={content.previewImage}
													alt={content.previewTitle}
													className="h-auto max-w-[100%] "
												/>
											</div>
										)}
									</div>
								</div>
							);
						}
					})()}
				</div>
			</div>

			{/* Existing Report Dialog */}
			{showExistingReportDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
					<div className="w-full max-w-md p-4 mx-4 bg-white rounded-lg shadow-xl md:p-6">
						<h3 className="mb-4 text-lg font-bold text-gray-900 md:text-xl">
							{t("dialog.existingReport.title")}
						</h3>
						<p className="mb-6 text-sm text-gray-600 md:text-base">
							{t("dialog.existingReport.message")}
						</p>
						<div className="flex flex-col gap-4 md:flex-row">
							<button
								onClick={handleViewExistingReport}
								className="flex-1 px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg md:text-base hover:bg-blue-700"
							>
								{t("dialog.existingReport.viewReport")}
							</button>
							<button
								onClick={handleRetestWithPayment}
								className="flex-1 px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-lg md:text-base hover:bg-green-700"
								disabled={isProcessingPayment}
							>
								{isProcessingPayment
									? t("ui.processing")
									: t("dialog.existingReport.retest")}
							</button>
						</div>
						<button
							onClick={() => setShowExistingReportDialog(false)}
							className="w-full px-4 py-2 mt-3 text-sm text-gray-600 transition-colors bg-gray-200 rounded-lg md:text-base hover:bg-gray-300"
							disabled={isProcessingPayment}
						>
							{t("dialog.existingReport.cancel")}
						</button>
					</div>
				</div>
			)}

			{/* Add custom CSS for hiding scrollbar and 3D flip animation */}
			<style jsx>{`
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				.perspective-1000 {
					perspective: 1000px;
				}
				.transform-style-preserve-3d {
					transform-style: preserve-3d;
				}
				.backface-hidden {
					backface-visibility: hidden;
				}
				.rotate-y-180 {
					transform: rotateY(180deg);
				}
				.group:hover .group-hover\\:rotate-y-180 {
					transform: rotateY(180deg);
				}

				/* Enhanced payment button animations */
				button:hover {
					transform: scale(1.05) translateY(-2px);
				}

				button:active {
					transform: scale(0.98);
				}

				/* Pulse animation for payment button */
				@keyframes pulse-payment {
					0%,
					100% {
						box-shadow:
							0 8px 20px rgba(163, 177, 22, 0.3),
							0 4px 8px rgba(0, 0, 0, 0.1);
					}
					50% {
						box-shadow:
							0 12px 30px rgba(163, 177, 22, 0.5),
							0 6px 12px rgba(0, 0, 0, 0.15);
					}
				}

				.payment-button {
					animation: pulse-payment 2s ease-in-out infinite;
				}

				/* Glow effect for flip card on hover */
				.flip-card-glow:hover {
					filter: drop-shadow(0 8px 16px rgba(163, 177, 22, 0.2));
				}

				/* Galaxy Fold 5 specific styles (344px - 374px width) */
				@media screen and (max-width: 380px) {
					/* Ensure main title scales properly */
					h2 {
						font-size: clamp(24px, 6vw, 32px) !important;
						line-height: clamp(28px, 7vw, 40px) !important;
					}

					/* Reduce spacing in overlapping cards */
					.relative.flex.items-center.justify-center {
						margin-right: 8px !important;
					}

					/* Ensure buttons don't overflow */
					button {
						font-size: 10px !important;
						padding: 6px 8px !important;
						white-space: nowrap;
					}

					/* Price text scaling */
					.relative.inline-block span {
						font-size: clamp(1.2rem, 5vw, 1.5rem) !important;
					}

					/* Toggle buttons specific sizing */
					.flex.flex-row.space-x-1 button {
						padding: 8px 12px !important;
						font-size: 10px !important;
					}
				}
			`}</style>

			{/* More Calculations Section */}
			<section className="relative w-full px-4 py-12 bg-white">
				<div className="container mx-auto">
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
							<div className="inline-flex gap-6 px-0 pb-4 md:px-4">
								{Object.entries(reportConfig).map(
									([key, config]) => {
										// Skip the current report type
										if (key === activeTag) return null;

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
												className="flex-shrink-0 w-64 overflow-hidden transition cursor-pointer"
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
												<div className="p-4">
													<h3 className="font-semibold text-[#073E31] mb-2 text-sm line-clamp-2">
														{config.title}
													</h3>
													<div className="flex items-center gap-2">
														<span className="text-[#8B9F3A] font-bold text-sm">
															HK${config.price}
														</span>
														<span className="text-xs text-gray-400 line-through">
															HK$
															{
																config.originalPrice
															}
														</span>
														<span className="text-xs font-semibold text-red-500">
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

			{/* Newsletter Banner - Overlapping Footer */}
			<div className="relative z-10 -mb-6">
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
		</div>
	);
}
