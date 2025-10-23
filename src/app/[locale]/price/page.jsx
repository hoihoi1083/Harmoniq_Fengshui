"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/Navbar";
import FAQ from "@/components/home/FAQ";
import PricePromo from "../../../components/PricePromo";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRegionDetectionWithRedirect } from "@/hooks/useRegionDetectionEnhanced";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { get, post, patch } from "@/lib/ajax";

// Function to get region-specific image path for desktop only
const getRegionSpecificImage = (category, region) => {
	// Only apply region-specific images for desktop - mobile keeps original
	const regionSuffix =
		{
			china: "cny",
			hongkong: "hkd",
			taiwan: "ntd",
		}[region] || "hkd"; // Default to HKD

	// Handle special cases - removed together handling since we now use couple

	// Special case: wealth-hkd.png doesn't exist, so fall back to original for HKD

	return `/images/price/${category}-${regionSuffix}.png`;
};

export default function YourPage() {
	const t = useTranslations("pricePage");
	const featuresT = useTranslations("home.features");
	const locale = useLocale(); // Get current locale
	const { data: session } = useSession();
	const router = useRouter();

	// Region detection hook
	const { region, regionConfig } = useRegionDetectionWithRedirect({
		autoRedirect: false, // Don't auto-redirect on price page
		skipFirstRedirect: true,
	});

	const [isUnlocked, setIsUnlocked] = useState(false);
	const [promoCode, setPromoCode] = useState("");
	const [showPromoInput, setShowPromoInput] = useState(false);
	const [promoError, setPromoError] = useState("");
	const [copied, setCopied] = useState(false);

	// Force re-render trigger for region changes
	const [renderKey, setRenderKey] = useState(0);

	// Region selection state - now using detected region instead
	// const [selectedRegion, setSelectedRegion] = useState("hongkong");

	// Sharing states (simplified without Facebook SDK)
	const [sharing, setSharing] = useState(false);
	const [showShareConfirm, setShowShareConfirm] = useState(false);
	const [showPromoModal, setShowPromoModal] = useState(false);
	const [sharePromoCode, setSharePromoCode] = useState("");

	// Square feet popup states
	const [showSqftPopup, setShowSqftPopup] = useState(false);
	const [sqftValue, setSqftValue] = useState("");
	const [sqftError, setSqftError] = useState("");
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [currentCardType, setCurrentCardType] = useState(""); // Track which card is being processed

	// Add new state for existing report check
	const [showExistingReportDialog, setShowExistingReportDialog] =
		useState(false);
	const [existingReport, setExistingReport] = useState(null);
	const [checkingExistingReport, setCheckingExistingReport] = useState(false);

	// Chat-originated payment states
	const [chatParams, setChatParams] = useState({
		fromChat: false,
		concern: "",
		specificProblem: "",
		isCoupleAnalysis: false,
	});

	const validPromoCodes = ["UNLOCK2025", "HARMONIQ", "FENGSHUI"];

	// Regional pricing configuration - memoized
	const getRegionalPrice = useCallback(
		(basePrice) => {
			const priceMap = {
				china: {
					38: 38, // CNY ¥38
					88: 88, // CNY ¥88
					168: 168, // CNY ¥168
					188: 188, // CNY ¥188
					388: 388, // CNY ¥388
				},
				hongkong: {
					38: 38, // HKD HK$38
					88: 88, // HKD HK$88
					168: 168, // HKD HK$168
					188: 188, // HKD HK$188
					388: 388, // HKD HK$388
				},
				taiwan: {
					38: 158, // TWD NT$158 (was $38)
					88: 368, // TWD NT$368 (was $88)
					168: 668, // TWD NT$668 (was $168)
					188: 748, // TWD NT$748 (was $188)
					388: 1528, // TWD NT$1528 (was $388)
				},
			};

			return priceMap[region]?.[basePrice] || basePrice;
		},
		[region]
	); // Re-create when region changes

	// Get currency symbol and formatting - memoized for performance
	const formatPrice = useCallback(
		(basePrice) => {
			const price = getRegionalPrice(basePrice);
			const symbols = {
				china: "¥",
				hongkong: "HK$",
				taiwan: "NT$",
			};

			const symbol = symbols[region] || "HK$"; // Default to HK$ for other regions
			return `${symbol}${price}`;
		},
		[region]
	); // Re-create when region changes

	// Force instant re-render when region changes
	useEffect(() => {
		if (region) {
			setRenderKey((prev) => prev + 1);
			console.log(
				`⚡ Price page instant re-render for region: ${region}`
			);
		}
	}, [region]);

	// Check URL parameters for chat-originated payments
	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const fromChat = urlParams.get("fromChat") === "true";
			const concern = urlParams.get("concern") || "";
			const specificProblem = urlParams.get("specificProblem") || "";
			const isCoupleAnalysis =
				urlParams.get("isCoupleAnalysis") === "true";
			const paymentType = urlParams.get("type") || "";

			// Additional couple parameters
			const userBirthday = urlParams.get("userBirthday") || "";
			const partnerBirthday = urlParams.get("partnerBirthday") || "";
			const userGender = urlParams.get("userGender") || "";
			const partnerGender = urlParams.get("partnerGender") || "";
			const sessionId = urlParams.get("sessionId") || "";

			if (fromChat || paymentType === "couple") {
				setChatParams({
					fromChat: fromChat || paymentType === "couple",
					concern,
					specificProblem,
					isCoupleAnalysis:
						isCoupleAnalysis || paymentType === "couple",
					userBirthday,
					partnerBirthday,
					userGender,
					partnerGender,
					sessionId,
				});

				// Auto-trigger payment for chat-originated or couple payments
				console.log("🚀 Payment detected:", {
					concern,
					specificProblem,
					isCoupleAnalysis,
					paymentType,
					userBirthday,
					partnerBirthday,
				});

				// Trigger payment after a short delay to ensure component is mounted
				setTimeout(() => {
					if (isCoupleAnalysis || paymentType === "couple") {
						// For couple analysis, go to {formatPrice(88)} couple payment
						handleCouplePayment();
					} else {
						// For individual analysis, go to $38 fortune payment
						handleFortunePayment(concern || "financial");
					}
				}, 500);
			}
		}
	}, []);

	// Get pricing info based on region
	const getPricingInfo = () => {
		if (region === "china") {
			return {
				currency: "¥",
				premiumPrice: "5",
				subscriptionPrice: "10",
				unit: t("perSqm"),
				minimumValue: 38,
				minimumNote: t("minimumAreaNote"),
				inputLabel: t("areaInputLabel"),
				placeholder: t("areaPlaceholder"),
				validationError: t("areaValidationError"),
			};
		} else {
			return {
				currency: "$",
				premiumPrice: "1",
				subscriptionPrice: "3.8",
				unit: t("perSqft"),
				minimumValue: 380,
				minimumNote: t("sqftMinimumNote"),
				inputLabel: t("sqftInputLabelNew"),
				placeholder: t("sqftPlaceholderNew"),
				validationError: t("sqftValidationError"),
			};
		}
	};

	const pricingInfo = getPricingInfo();

	// Get current domain dynamically
	const getCurrentDomain = () => {
		if (typeof window !== "undefined") {
			return window.location.origin;
		}
		return "https://www.harmoniqfengshui.com";
	};

	const handlePromoSubmit = () => {
		if (validPromoCodes.includes(promoCode.toUpperCase())) {
			setIsUnlocked(true);
			setShowPromoInput(false);
			setPromoError("");
		} else {
			setPromoError(t("promoError"));
		}
	};

	// Check for existing reports when user is authenticated
	useEffect(() => {
		const checkExistingReports = async () => {
			if (!session?.user?.userId) return;

			setCheckingExistingReport(true);
			try {
				// Check for existing report in current locale
				const locale =
					typeof window !== "undefined"
						? window.location.pathname.split("/")[1]
						: "zh-CN";

				const { status, data } = await get(
					`/api/reportUserDoc/${session.user.userId}/${locale === "zh-CN" ? "zh" : "tw"}`
				);

				if (status === 0 && data) {
					setExistingReport(data);
				}
			} catch (error) {
			} finally {
				setCheckingExistingReport(false);
			}
		};

		checkExistingReports();
	}, [session?.user?.userId]);

	// Handle premium button click - Direct payment without sqft input
	const handlePremiumClick = async () => {
		// Check if user is logged in first
		if (!session?.user?.userId) {
			// Redirect to login page immediately
			router.push("/auth/login");
			return;
		}

		if (existingReport) {
			setShowExistingReportDialog(true);
			setCurrentCardType("premium");
		} else {
			// Skip sqft popup and go directly to payment
			await handlePremiumDirectPayment();
		}
	};

	// Handle direct premium payment without sqft calculation
	const handlePremiumDirectPayment = async () => {
		setIsProcessingPayment(true);
		setCurrentCardType("premium");

		try {
			// Choose API endpoint based on region for direct payment
			let endpoint;
			if (region === "china") {
				endpoint = "/api/checkoutSessions/payment2-sqm";
			} else {
				endpoint = "/api/checkoutSessions/payment2";
			}

			// Create request body for one-time payment (no area multiplication)
			const requestBody = {
				quantity: 1, // Fixed quantity for one-time payment
				region: region,
				directPayment: true, // Flag to indicate this is a direct payment without area calculation
			};

			// Create checkout session
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.data?.url) {
					// Redirect to Stripe checkout
					window.location.href = data.data.url;
				} else {
					throw new Error("No checkout URL received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || t("paymentError"));
			}
		} catch (error) {
			console.error("Premium direct payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
			// You could show an error message to the user here
		}
	};

	// Handle subscription button click
	const handleSubscriptionClick = () => {
		// Check if user is logged in first
		if (!session?.user?.userId) {
			// Redirect to login page immediately
			router.push("/auth/login");
			return;
		}

		if (existingReport) {
			setShowExistingReportDialog(true);
			setCurrentCardType("subscription");
		} else {
			setCurrentCardType("subscription");
			setShowSqftPopup(true);
			setSqftError("");
			setSqftValue("");
		}
	};

	// Handle viewing existing report
	const handleViewExistingReport = () => {
		setShowExistingReportDialog(false);
		router.push("/report");
	};

	// Handle retest (new payment)
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

			// Proceed to payment based on card type
			if (currentCardType === "premium") {
				// Use direct payment for premium
				await handlePremiumDirectPayment();
			} else {
				// Use sqft popup for subscription
				setShowSqftPopup(true);
				setSqftError("");
				setSqftValue("");
			}
		} catch (error) {
			setSqftError("Failed to prepare for retest. Please try again.");
		}
	};

	// Handle area submission (updated for region-based pricing)
	const handleSqftSubmit = async () => {
		const area = parseFloat(sqftValue);
		const minValue = pricingInfo.minimumValue;

		// Validation based on selected region
		if (!sqftValue || isNaN(area) || area < minValue) {
			setSqftError(pricingInfo.validationError);
			return;
		}

		setIsProcessingPayment(true);
		setSqftError("");

		try {
			// Choose API endpoint based on card type and region
			let endpoint;
			if (region === "china") {
				// Use China-specific square meter endpoints
				endpoint =
					currentCardType === "premium"
						? "/api/checkoutSessions/payment2-sqm"
						: "/api/checkoutSessions/payment1-sqm";
			} else {
				// Use regular Hong Kong endpoints
				endpoint =
					currentCardType === "premium"
						? "/api/checkoutSessions/payment2"
						: "/api/checkoutSessions/payment1";
			}

			// Create request body based on region
			const requestBody = {
				quantity: Math.ceil(area), // Round up to nearest whole number
			};

			if (region === "china") {
				requestBody.squareMeters = area;
			} else {
				requestBody.squareFeet = area;
			}

			// Add region info
			requestBody.region = region;

			// Create checkout session
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.data?.url) {
					// Redirect to Stripe checkout
					window.location.href = data.data.url;
				} else {
					throw new Error("No checkout URL received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || t("paymentError"));
			}
		} catch (error) {
			setSqftError(t("paymentError"));
			setIsProcessingPayment(false);
		}
	};

	// Handle expert188 payment (direct payment without sqft)
	const handleExpert188Payment = async () => {
		setIsProcessingPayment(true);
		setCurrentCardType("expert188");

		try {
			// Create checkout session for expert188
			const response = await fetch("/api/checkoutSessions/payment3", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quantity: 1, // Fixed quantity for expert plan
				}),
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Expert188 Payment Response:", data);
				console.log(
					"Looking for URL at data.data.url:",
					data.data?.url
				);

				if (data.data?.url) {
					// Redirect to Stripe checkout
					window.location.href = data.data.url;
				} else {
					throw new Error("No checkout URL received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Payment error");
			}
		} catch (error) {
			console.error("Expert188 payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
		}
	};

	// Handle expert88 payment (direct payment without sqft)
	const handleExpert88Payment = async () => {
		// Check if user is logged in
		if (!session) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(`/${locale}/auth/login?redirect=/price`);
			return;
		}

		setIsProcessingPayment(true);
		setCurrentCardType("expert88");

		try {
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
				"💰 Price page life payment - Using fresh locale:",
				freshLocale,
				"from stored region:",
				storedRegion
			);

			// Create checkout session for expert88
			const response = await fetch("/api/checkoutSessions/payment4", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quantity: 1, // Fixed quantity for expert plan
					locale: freshLocale, // Add locale parameter
					region: storedRegion, // Add region parameter for NTD support
				}),
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Expert88 Payment Response:", data);
				console.log(
					"Looking for URL at data.data.url:",
					data.data?.url
				);

				if (data.data?.url) {
					// Redirect to Stripe checkout
					window.location.href = data.data.url;
				} else {
					// Check if it's an authentication error
					if (
						data.code === "401" ||
						data.message?.includes("未授權") ||
						data.message?.includes("unauthorized")
					) {
						console.log(
							"❌ Authentication required, redirecting to login"
						);
						router.push(`/${locale}/auth/login?redirect=/price`);
					} else {
						throw new Error("No checkout URL received");
					}
				}
			} else {
				const errorData = await response.json();
				// Check if it's an authentication error
				if (response.status === 401 || errorData.code === "401") {
					console.log(
						"❌ Authentication required, redirecting to login"
					);
					router.push(`/${locale}/auth/login?redirect=/price`);
				} else {
					throw new Error(errorData.message || "Payment error");
				}
			}
		} catch (error) {
			console.error("Expert88 payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
		}
	};

	// Handle $38 fortune payment with concern type
	const handleFortunePayment = async (concernType) => {
		// Check if user is logged in
		if (!session) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(`/${locale}/auth/login?redirect=/price`);
			return;
		}

		setIsProcessingPayment(true);
		setCurrentCardType(`fortune_${concernType}`);

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
				"💰 Price page individual payment - Using fresh locale:",
				freshLocale,
				"from stored region:",
				storedRegion
			);

			// Prepare request body with chat context if available
			const requestBody = {
				concern: concernType, // financial, love, health, career
				locale: freshLocale, // 🔥 Fix: Add locale parameter like couple payment
				region: storedRegion, // 🔥 Add region parameter for NTD support
			};

			// Include chat-specific data if coming from chat
			if (chatParams.fromChat) {
				requestBody.specificProblem = chatParams.specificProblem;
				requestBody.fromChat = true;
				console.log(
					"💬 Adding chat context to fortune payment:",
					requestBody
				);
			}

			// Create checkout session for fortune reading with specific concern type
			const response = await fetch(
				"/api/checkoutSessions/payment-fortune-category",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						...requestBody,
						concernType: concernType, // Use concernType instead of concern for the category API
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log("Fortune Payment Response:", data);

				// Handle different response structures
				const sessionId = data.sessionId || data.data?.id;
				console.log("Extracted session ID:", sessionId);

				if (sessionId) {
					// Import Stripe and redirect to checkout
					const stripe = await import("@stripe/stripe-js").then(
						(mod) =>
							mod.loadStripe(
								process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
							)
					);

					if (stripe) {
						await stripe.redirectToCheckout({
							sessionId: sessionId,
						});
					} else {
						throw new Error("Failed to load Stripe");
					}
				} else {
					console.error("No session ID found in response:", data);
					throw new Error("No session ID received");
				}
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "Payment error");
			}
		} catch (error) {
			console.error("Fortune payment error:", error);
			setIsProcessingPayment(false);
			setCurrentCardType("");
			// You could show an error message to the user here
		}
	};

	// Handle {formatPrice(88)} couple payment
	const handleCouplePayment = async () => {
		// Check if user is logged in
		if (!session) {
			console.log("❌ User not logged in, redirecting to login page");
			router.push(`/${locale}/auth/login?redirect=/price`);
			return;
		}

		setIsProcessingPayment(true);
		setCurrentCardType("couple");

		try {
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
				"💰 Price page couple payment - Using fresh locale:",
				freshLocale,
				"from stored region:",
				storedRegion
			);

			// Prepare request body with chat context if available
			const requestBody = {
				locale: freshLocale, // Use detected locale
				region: storedRegion, // 🔥 Add region parameter for NTD support
			};

			// Include chat-specific data if coming from chat
			if (chatParams.fromChat) {
				requestBody.specificProblem = chatParams.specificProblem;
				requestBody.concern = chatParams.concern;
				requestBody.fromChat = true;

				// Add couple-specific data
				if (chatParams.userBirthday)
					requestBody.userBirthday = chatParams.userBirthday;
				if (chatParams.partnerBirthday)
					requestBody.partnerBirthday = chatParams.partnerBirthday;
				if (chatParams.userGender)
					requestBody.userGender = chatParams.userGender;
				if (chatParams.partnerGender)
					requestBody.partnerGender = chatParams.partnerGender;
				if (chatParams.sessionId)
					requestBody.sessionId = chatParams.sessionId;

				console.log(
					"💬 Adding chat context to couple payment:",
					requestBody
				);
			}

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
								process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
							)
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
			// You could show an error message to the user here
		}
	};

	// Handle popup close
	const handleSqftPopupClose = () => {
		if (!isProcessingPayment) {
			setShowSqftPopup(false);
			setSqftValue("");
			setSqftError("");
			setCurrentCardType("");
		}
	};

	// Simplified Facebook share - Facebook will use Open Graph meta tags
	const handleFacebookShare = () => {
		setSharing(true);

		// Use the current page URL instead of just the domain
		const shareUrl =
			typeof window !== "undefined"
				? window.location.href
				: "https://www.harmoniqfengshui.com/price";

		// Add explicit content for sharing (fallback method)
		const shareText = encodeURIComponent(t("shareText"));

		// Try with more explicit parameters
		const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
			shareUrl
		)}&quote=${shareText}`; // Open Facebook share dialog in new window
		const popup = window.open(
			facebookShareUrl,
			"facebook-share",
			"width=600,height=500,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no"
		);

		if (popup) {
			// Track when popup was opened
			const openedAt = Date.now();

			// Check if popup is closed (indicating user completed or cancelled sharing)
			const checkClosed = setInterval(() => {
				try {
					if (popup.closed) {
						clearInterval(checkClosed);
						setSharing(false);
						setTimeout(() => setShowShareConfirm(true), 500);
					}
				} catch (error) {
					clearInterval(checkClosed);
					setSharing(false);
				}
			}, 500);

			// Safety timeout to stop checking after 5 minutes
			setTimeout(() => {
				if (!popup.closed) {
					clearInterval(checkClosed);
					setSharing(false);
				}
			}, 300000); // 5 minutes

			// Focus on the popup window
			popup.focus();
		} else {
			// Popup was blocked
			setSharing(false);
			alert(t("facebookShareAlert") + shareUrl);

			// Show confirmation dialog anyway in case user shares manually
			setTimeout(() => setShowShareConfirm(true), 1000);
		}
	};

	// Copy to clipboard function
	const copyToClipboard = (text) => {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard
				.writeText(text)
				.then(() => {})
				.catch((err) => {});
		} else {
			// Fallback for older browsers or non-HTTPS
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand("copy");
				console.log("Copied to clipboard (fallback):", text);
			} catch (err) {}
			document.body.removeChild(textArea);
		}
	};

	// Handle share confirmation
	const handleShareConfirm = async (confirmed) => {
		setShowShareConfirm(false);
		if (confirmed) {
			try {
				const response = await fetch("/api/send-promo", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: "user@example.com",
						contentShared: "HarmoniQ Feng Shui Website",
						shareMethod: "facebook_browser",
						shareUrl: "https://www.harmoniqfengshui.com",
					}),
				});

				if (response.ok) {
					const data = await response.json();
					setSharePromoCode(data.code);
					setShowPromoModal(true);
				} else {
				}
			} catch (error) {}
		}
	};

	// Create features array at component level to avoid hook issues
	const mobileFeatures = [
		{
			title: featuresT("title1"),
			description: featuresT("subtitle1"),
			icon: "/images/hero/feature1.png",
		},
		{
			title: featuresT("title2"),
			description: featuresT("subtitle2"),
			icon: "/images/hero/feature2.png",
		},
		{
			title: featuresT("title3"),
			description: featuresT("subtitle3"),
			icon: "/images/hero/feature3.png",
		},
		{
			title: featuresT("title4"),
			description: featuresT("subtitle4"),
			icon: "/images/hero/feature4.png",
		},
	];

	const desktopFeatures = [
		{
			title: featuresT("title1"),
			description: featuresT("subtitle1"),
			icon: "/images/hero/feature1.png",
		},
		{
			title: featuresT("title2"),
			description: featuresT("subtitle2"),
			icon: "/images/hero/feature2.png",
		},
		{
			title: featuresT("title3"),
			description: featuresT("subtitle3"),
			icon: "/images/hero/feature3.png",
		},
		{
			title: featuresT("title4"),
			description: featuresT("subtitle4"),
			icon: "/images/hero/feature4.png",
		},
	];

	return (
		<>
			<div
				className="min-h-screen bg-center bg-no-repeat bg-cover"
				style={{
					backgroundImage: "url('/images/hero/Tipsbg.png')",
					backgroundColor: "#EFEFEF",
					fontFamily: '"Noto Serif TC", serif',
				}}
			>
				<Navbar />

				<section
					className="self-stretch flex flex-col items-center justify-start mb-25 gap-16 sm:gap-24 lg:gap-[164px] max-w-full text-center text-2xl sm:text-3xl lg:text-[40px] text-[#073e31] font-[ABeeZee] px-4 sm:px-6 lg:px-0"
					style={{ fontFamily: '"Noto Serif TC", serif' }}
				>
					<div className="w-full max-w-[1200px] flex flex-col items-center justify-start mt-18 gap-5 sm:gap-20 lg:gap-[40px]">
						{/* Title Section */}
						{/* Features Section */}

						{/* Mobile Layout - Green Background Bar - Full Width */}
						<div className="block lg:hidden w-screen bg-gradient-to-r from-[#A3B116] to-[#374A37] py-4 -mx-4 sm:-mx-6">
							<div className="grid grid-cols-4  max-w-[1200px] mx-auto">
								{mobileFeatures.map((feature, index) => (
									<div
										key={index}
										className="flex flex-col items-center text-center"
									>
										<img
											src={feature.icon}
											alt={feature.title}
											className="w-20 h-20 brightness-0 invert"
										/>
										<div className="text-[23px] font-black font-noto-sans-hk mb-1 text-[#E8FF00]">
											{feature.title}
										</div>
										<div className="text-[12px] font-bold text-white opacity-90 font-noto-sans-hk">
											{feature.description}
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="w-full max-w-[1200px] px-4 sm:px-6  lg:px-0 flex justify-center">
							{/* Desktop Layout - Original Style */}
							<div className="w-[90%] hidden grid-cols-4 lg:grid place-items-center">
								{desktopFeatures.map((feature, index) => (
									<div
										key={index}
										className="flex flex-row items-center text-center"
									>
										<Image
											src={feature.icon}
											alt={feature.title}
											width={100}
											height={100}
											className="object-contain mb-4"
										/>
										<div className="flex flex-col items-center justify-center ">
											<h3
												className="mb-1 text-center"
												style={{
													fontFamily:
														"Acme, sans-serif",
													fontWeight: 400,
													fontSize: "15px",
													color: "#000",
													fontStyle: "normal",
												}}
											>
												{feature.title}
											</h3>
											<p
												className="text-center"
												style={{
													fontFamily:
														"ABeeZee, sans-serif",
													fontWeight: 400,
													fontSize: "13px",
													color: "#073E31",
													fontStyle: "normal",
												}}
											>
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div
							className="w-full max-w-[960px] flex flex-col items-start justify-start gap-3 sm:gap-8 lg:gap-1 px-4 sm:px-6 lg:px-0"
							style={{ fontFamily: '"Noto Serif TC", serif' }}
						>
							<h2 className="self-stretch relative text-center  font-bold sm:text-center text-black text-3xl sm:text-4xl md:text-5xl lg:text-[48px]">
								{t("title")}
							</h2>
							<div className="flex justify-center w-full lg:hidden sm:justify-end">
								<button
									className="bg-[#A3B116] hover:bg-[#8B9914] text-white px-4 py-2 sm:px-6 sm:py-2 text-[16px] sm:text-[18px] md:text-[20px] rounded-full font-medium transition-colors duration-300"
									style={{
										boxShadow:
											"0 4px 12px rgba(0, 0, 0, 0.25)",
									}}
									onClick={() => router.push("/demo")}
								>
									{t("previewButton")}
								</button>
							</div>

							{/* Region Selection Section - Updated to be bigger and more obvious */}
							{/* <div className="flex flex-col items-center w-full">
								<div>
									<p
										className="mb-4 text-xl font-bold text-[#073e31]"
										style={{
											fontFamily:
												'"Noto Serif TC", serif',
										}}
									>
										{t("regionSelection")}
									</p>
									<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
										<div
											onClick={() =>
												setSelectedRegion("hongkong")
											}
											className={`cursor-pointer px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 border-3 ${
												region === "hongkong"
													? "bg-[#096e56] text-white border-[#096e56] shadow-lg transform scale-105"
													: "bg-white text-[#073e31] border-[#096e56] hover:bg-[#f0fdf4] hover:border-[#19ad6b]"
											}`}
											style={{
												fontFamily:
													'"Noto Serif TC", serif',
											}}
										>
											🇭🇰 {t("regionHongKong")}
											{region === "hongkong" && (
												<div className="mt-1 text-sm font-medium opacity-90">
													✓ 已選擇
												</div>
											)}
										</div>
										<div
											onClick={() =>
												setSelectedRegion("china")
											}
											className={`cursor-pointer px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 border-3 ${
												region === "china"
													? "bg-[#096e56] text-white border-[#096e56] shadow-lg transform scale-105"
													: "bg-white text-[#073e31] border-[#096e56] hover:bg-[#f0fdf4] hover:border-[#19ad6b]"
											}`}
											style={{
												fontFamily:
													'"Noto Serif TC", serif',
											}}
										>
											🇨🇳 {t("regionChina")}
											{region === "china" && (
												<div className="mt-1 text-sm font-medium opacity-90">
													✓ 已選擇
												</div>
											)}
										</div>
									</div>
								</div>
							</div> */}
						</div>
						{/* Second Hero Section with Cards on Left, Image on Right */}
						{/* Mobile Layout - Matches first hero section format */}
						<div className="block lg:hidden w-full max-w-[1200px] px-4 sm:px-6 mb-8">
							{/* Title */}
							<h3
								className=" text-[#073e31] mb-6 text-left text-3xl font-bold"
								style={{ WebkitTextStroke: "0.5px #073e31" }}
							>
								{t("destinyCalculation")}
							</h3>

							{/* Content Layout - Image left, Features right */}
							<div className="flex flex-row gap-2 mb-6 sm:justify-center md:justify-center">
								{/* Left side - Image */}
								<div className="flex flex-col w-40 gap-2 sm:w-48 md:w-80 sm:gap-3 md:gap-4">
									<Image
										src="/images/hero/button-1.png"
										alt={t("destinyCalculation")}
										width={150}
										height={150}
										className="object-contain w-full h-auto rounded-lg sm:rounded-xl md:rounded-2xl"
									/>
								</div>

								{/* Right side - Features List */}
								<div>
									{[
										"destinyFeature_1",
										"destinyFeature_2",
										"destinyFeature_3",
										"destinyFeature_4",
										"destinyFeature_5",
										"destinyFeature_6",
									].map((featureKey, index) => (
										<div
											key={index}
											className="flex items-center gap-3 mb-3 sm:gap-4 md:gap-5 sm:mb-4 md:mb-5"
										>
											<div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-[#A3B116] rounded-full flex items-center justify-center flex-shrink-0">
												<svg
													className="w-2 h-2 text-white sm:w-3 sm:h-3 md:w-4 md:h-4"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											<span className="text-[#073e31] text-[11px] sm:text-[13px] md:text-[20px] font-noto-sans-hk font-medium">
												{t(featureKey)}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Pricing Cards */}
							<div className="relative max-w-sm mx-auto">
								{/* Green Limited Time Offer Card - On Top */}
								<div
									className="bg-gradient-to-r from-[#E8F37A] to-[#A6B41B] rounded-2xl p-4 relative z-10"
									style={{
										boxShadow:
											"0 17px 15px rgba(87, 105, 103, 0.25)",
									}}
								>
									<div className="flex items-center justify-between">
										<div>
											<div
												className="text-[#374A37] text-2xl sm:text-2xl  mb-1"
												style={{
													WebkitTextStroke:
														"0.7px #374A37",
												}}
											>
												{t("limitedTimeOffer")}
											</div>
											<button
												onClick={handleExpert88Payment}
												className="bg-white text-[#A3B116] font-noto-sans-hk px-10 sm:px-6 py-2 rounded-full text-sm sm:text-sm font-bold"
											>
												{t("paymentCalculation")}
											</button>
										</div>
										<div className="text-right">
											<div className="mb-1 text-2xl font-extrabold text-black font-noto-sans-hk sm:text-3xl">
												{formatPrice(88)}
											</div>
											<div className="text-xs sm:text-sm text-[#073e31] opacity-80">
												/ {t("perTime")}
											</div>
										</div>
									</div>
								</div>

								{/* White Premium Version Card - Behind/Bottom */}
								<div className="relative z-0 p-4 -mt-4 bg-white border border-gray-200 shadow-lg rounded-2xl">
									<div className="flex items-center justify-between pt-4 ml-6">
										<div
											className="text-[#374A37] text-2xl sm:text-2xl  mb-1"
											style={{
												WebkitTextStroke:
													"0.7px #374A37",
											}}
										>
											{t("premiumVersion2")}
										</div>
										<div className="text-right">
											<div className="mb-1 text-2xl font-extrabold text-black line-through font-noto-sans-hk opacity-70 sm:text-3xl">
												{formatPrice(168)}
											</div>
											<div className="text-xs sm:text-sm text-[#073e31] opacity-80">
												/ {t("perTime")}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Desktop Layout - Original */}
						<div className="hidden w-full px-4 mx-auto lg:block max-w-7xl">
							<div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
								{/* Left Side - Cards Container */}
								<div className="flex flex-col items-center justify-center">
									<div className="relative w-full max-w-2xl">
										{/* Main white card - made responsive */}
										<div className="relative w-full max-w-[550px] min-h-[400px] bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 mx-auto">
											{/* Small green discount card overlay - positioned at top-left */}
											<div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 bg-gradient-to-b from-[#E9F47C] to-[#A3B116] rounded-2xl w-[360px] lg:w-[360px] py-8 shadow-lg z-10">
												{/* "最多用戶選擇" Badge */}
												<div className="absolute -right-1 sm:-right-[-0.5rem] transform bg-white/50 text-[#111827] px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
													{t("mostUserChoice")}
												</div>

												<div className="pt-1 text-center text-white">
													<div className="flex items-baseline justify-center gap-1 mb-1 -translate-x-10">
														<span className="relative inline-block">
															{/* Background stroke layer */}
															<span
																className="absolute inset-0 font-noto-sans-hk text-stroke-white"
																style={{
																	fontSize:
																		"44px",
																	fontWeight:
																		"900",
																	WebkitTextFillColor:
																		"transparent",
																	WebkitTextStroke:
																		"10px white", // Custom thicker stroke
																}}
																aria-hidden="true"
															>
																{formatPrice(
																	88
																)}
															</span>
															{/* Foreground gradient text */}
															<span
																className="relative bg-gradient-to-r from-[#99A800] to-[#5D6600] font-noto-sans-hk bg-clip-text text-transparent"
																style={{
																	fontSize:
																		"44px",
																	fontWeight:
																		"900",
																	backgroundImage:
																		"linear-gradient(to right, #99A800, #5D6600)",
																	WebkitBackgroundClip:
																		"text",
																}}
															>
																{formatPrice(
																	88
																)}
															</span>
														</span>
														<span className="text-xs font-bold text-black sm:text-sm opacity-90">
															/ {t("perTime")}
														</span>
													</div>
													<div
														className="font-['Noto_Serif_TC, serif'] font-extrabold text-[#284628] text-lg sm:text-3xl lg:text-[35px] translate-x-15"
														style={{
															WebkitTextStroke:
																"1.5px #284628",
														}}
													>
														{t("limitedTimeOffer")}
													</div>
												</div>
											</div>{" "}
											{/* Main card content */}
											<div className="flex flex-col w-full h-full gap-5 pt-2">
												{/* Original price section - moved to right */}
												<div className="mb-6 text-right">
													<div className="flex items-baseline justify-end gap-2 mb-2">
														<span
															className="font-bold text-gray-400 line-through "
															style={{
																fontSize:
																	"clamp(0.1rem, 2vw, 2rem)",
															}}
														>
															{formatPrice(168)}
														</span>
														<span
															className="font-bold text-gray-400"
															style={{
																fontSize:
																	"clamp(0.2rem, 1.5vw, 1rem)",
															}}
														>
															/ {t("perTime")}
														</span>
													</div>
													<div
														className="font-bold text-gray-400 text-34xl"
														style={{
															WebkitTextStroke:
																"1px #9CA3AF",
														}}
													>
														{t("premiumVersion2")}
													</div>
												</div>

												{/* Features in 2-column grid */}
												<div className="flex-1 mb-3">
													<div className="grid grid-cols-2 gap-y-4 gap-x-8">
														{[
															"destinyFeature_1",
															"destinyFeature_2",
															"destinyFeature_3",
															"destinyFeature_4",
															"destinyFeature_5",
															"destinyFeature_6",
														].map(
															(
																featureKey,
																index
															) => (
																<div
																	key={index}
																	className="flex items-start gap-3"
																>
																	<div
																		className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
																		style={{
																			backgroundColor:
																				"#E8E2DA",
																		}}
																	>
																		<svg
																			className="w-4 h-4 text-black"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path
																				fillRule="evenodd"
																				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																				clipRule="evenodd"
																			/>
																		</svg>
																	</div>
																	<span
																		className="text-[17px] leading-relaxed text-black"
																		style={{
																			fontFamily:
																				'"Noto sans HK',
																		}}
																	>
																		{t(
																			featureKey
																		)}
																	</span>
																</div>
															)
														)}
													</div>
												</div>

												{/* Button */}
												<div className="flex justify-center">
													<button
														onClick={
															handleExpert88Payment
														}
														className="bg-gradient-to-b from-[#BDCF0C] to-[#7B8700] hover:from-[#A3B116] hover:to-[#5D6600] text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
														style={{
															width: "342px",
															height: "48px",
															borderRadius:
																"20px",
														}}
														disabled={
															isProcessingPayment &&
															currentCardType ===
																"expert88"
														}
													>
														{isProcessingPayment &&
														currentCardType ===
															"expert88"
															? t("processing")
															: t(
																	"paymentCalculation"
																)}
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Right Side - Image */}
								<div className="flex flex-col items-center justify-center">
									{/* Title above image */}

									<div className="relative max-w-[600px] w-full">
										<img
											src={
												region === "china"
													? "/images/hero/button-5-china.png"
													: "/images/hero/button-5.png"
											}
											alt={t("destinyCalculation")}
											className="object-contain w-full h-auto rounded-lg"
										/>
										{/* Button positioned to the right side and higher than center */}
										<div className="absolute inset-0 flex items-center justify-end pr-4 sm:pr-8 md:pr-12">
											<div className="flex justify-end w-full transform -translate-y-20 sm:-translate-y-30 md:-translate-y-31">
												<button
													className="bg-[#A3B116] hover:bg-[#8B9914] text-white px-4 py-2 sm:px-6 sm:py-2 text-[16px] sm:text-[18px] md:text-[20px] rounded-full font-medium transition-colors duration-300"
													style={{
														boxShadow:
															"0 4px 12px rgba(0, 0, 0, 0.25)",
													}}
													onClick={() =>
														router.push(
															"/demo?category=life"
														)
													}
												>
													{t("previewButton")}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* New Hero Section with Image and Cards */}
						{/* Mobile Layout - Matches attached image */}

						<div className="block lg:hidden w-full max-w-[1200px] px-4 sm:px-6 relative">
							{/* Coming Soon Overlay */}
							<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/15 backdrop-blur-xs rounded-2xl">
								<div className="bg-gradient-to-r from-[#E8F37A] to-[#A3B116] px-8 py-4 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
									<div className="text-center">
										<div
											className="text-2xl font-bold text-[#374A37] mb-2"
											style={{
												WebkitTextStroke: "1px #374A37",
											}}
										>
											✨ Coming Soon ✨
										</div>
										<div className="text-sm text-[#374A37] font-medium">
											敬請期待
										</div>
									</div>
								</div>
							</div>

							{/* Title */}
							<h3
								className=" text-[#073e31] mb-6 text-left text-3xl font-bold"
								style={{ WebkitTextStroke: "0.5px #073e31" }}
							>
								{t("fengShuiCalculation")}
							</h3>

							{/* Content Layout - Features left, Image right */}
							<div className="flex flex-row gap-2 mb-6 sm:justify-center md:justify-center">
								{/* Left side - Features List */}
								<div>
									{[
										"premiumFeature2_1",
										"premiumFeature2_2",
										"premiumFeature2_3",
										"premiumFeature2_4",
										"premiumFeature2_5",
										"premiumFeature2_6",
									].map((featureKey, index) => (
										<div
											key={index}
											className="flex items-center gap-3 mb-3 sm:gap-4 md:gap-5 sm:mb-4 md:mb-5"
										>
											<div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-[#A3B116] rounded-full flex items-center justify-center flex-shrink-0">
												<svg
													className="w-2 h-2 text-white sm:w-3 sm:h-3 md:w-4 md:h-4"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											<span className="text-[#073e31] text-[11px] sm:text-[13px] md:text-[20px] font-noto-sans-hk font-medium">
												{t(featureKey)}
											</span>
										</div>
									))}
								</div>

								{/* Right side - Furniture Images */}
								<div className="flex flex-col w-40 gap-2 sm:w-48 md:w-56 sm:gap-3 md:gap-4">
									<Image
										src="/images/hero/button-2.png"
										alt="furniture"
										width={150}
										height={150}
										className="object-contain w-full h-auto rounded-lg sm:rounded-xl md:rounded-2xl"
									/>
								</div>
							</div>

							{/* Pricing Cards */}
							<div className="relative max-w-sm mx-auto">
								{/* Green Limited Time Offer Card - On Top */}
								<div
									className="bg-gradient-to-r from-[#E8F37A] to-[#A6B41B] rounded-2xl p-4 relative z-10"
									style={{
										boxShadow:
											"0 17px 15px rgba(87, 105, 103, 0.25)",
									}}
								>
									<div className="flex items-center justify-between">
										<div>
											<div
												className="text-[#374A37] text-2xl sm:text-2xl  mb-1"
												style={{
													WebkitTextStroke:
														"0.7px #374A37",
												}}
											>
												{t("limitedTimeOffer")}
											</div>
											<button
												onClick={handlePremiumClick}
												className="bg-white text-[#A3B116] font-noto-sans-hk px-10 sm:px-6 py-2 rounded-full text-sm sm:text-sm font-bold"
											>
												{t("paymentCalculation")}
											</button>
										</div>
										<div className="text-right">
											<div className="mb-1 text-2xl font-extrabold text-black font-noto-sans-hk sm:text-3xl">
												{formatPrice(188)}
											</div>
											<div className="text-xs sm:text-sm text-[#073e31] opacity-80">
												/ {t("perTime")}
											</div>
										</div>
									</div>
								</div>

								{/* White Premium Version Card - Behind/Bottom */}
								<div className="relative z-0 p-4 -mt-4 bg-white border border-gray-200 shadow-lg rounded-2xl">
									<div className="flex items-center justify-between pt-4 ml-6">
										<div
											className="text-[#374A37] text-2xl sm:text-2xl  mb-1"
											style={{
												WebkitTextStroke:
													"0.7px #374A37",
											}}
										>
											{t("premiumVersion2")}
										</div>
										<div className="text-right">
											<div className="mb-1 text-2xl font-extrabold text-black line-through font-noto-sans-hk opacity-70 sm:text-3xl">
												{formatPrice(388)}
											</div>
											<div className="text-xs sm:text-sm text-[#073e31] opacity-80">
												/ {t("perTime")}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Desktop Layout - Original */}
						<div className="hidden lg:flex w-full max-w-[1200px] flex-col lg:flex-row items-center justify-center gap-8 lg:gap-8 px-4 sm:px-6 lg:px-0 relative">
							{/* Coming Soon Overlay - Desktop */}
							<div className="absolute inset-0 bg-black/15 backdrop-blur-[2px] rounded-3xl z-30 flex items-center justify-center">
								<div className="bg-gradient-to-br from-[#E8F37A] via-[#CFDC5A] to-[#A3B116] px-12 py-8 rounded-3xl shadow-2xl border-4 border-white/30 transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500">
									<div className="relative text-center">
										{/* Decorative elements */}
										<div className="absolute w-8 h-8 rounded-full -top-4 -left-4 bg-white/40 animate-pulse"></div>
										<div className="absolute w-6 h-6 delay-300 rounded-full -bottom-4 -right-4 bg-white/40 animate-pulse"></div>
										<div className="absolute w-4 h-4 delay-700 rounded-full -top-2 -right-6 bg-white/30 animate-pulse"></div>

										{/* Main content */}
										<div
											className="text-4xl font-bold text-[#374A37] mb-3"
											style={{
												WebkitTextStroke:
													"1.5px #374A37",
											}}
										>
											✨ Coming Soon ✨
										</div>
										<div className="text-lg text-[#374A37] font-medium mb-2">
											敬請期待
										</div>
										<div className="text-sm text-[#2D3A2D] opacity-80">
											New Features Loading...
										</div>
									</div>
								</div>
							</div>

							{/* Left side - Image (50% width) */}
							<div className="relative flex flex-col items-center justify-center w-full lg:w-1/2">
								<div className="relative max-w-[600px] w-full">
									<Image
										src="/images/hero/button-4.png"
										alt={t("fengshuiCalculation")}
										width={400}
										height={400}
										className="object-contain w-full h-auto"
										priority
									/>
									{/* Button positioned to the left and a bit higher */}
									<div className="absolute inset-0 flex items-center justify-start pl-4 sm:pl-8 md:pl-12">
										<div className="flex justify-start w-full transform -translate-y-8 sm:-translate-y-12">
											<button
												className="bg-[#A3B116] hover:bg-[#8B9914] text-white px-4 py-2 sm:px-6 sm:py-2 text-[16px] sm:text-[18px] md:text-[20px] rounded-full font-medium transition-colors duration-300"
												style={{
													boxShadow:
														"0 4px 12px rgba(0, 0, 0, 0.25)",
												}}
												onClick={() =>
													router.push("/demo")
												}
											>
												{t("previewButton")}
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* Right side - 3D Hover Rotating Price Cards (50% width) */}
							<div className="flex justify-center w-full lg:w-1/2">
								{/* Left Side - Cards Container */}
								<div className="flex flex-col items-center justify-center">
									<div className="relative w-full max-w-2xl">
										{/* Main white card - made responsive */}
										<div className="relative w-full max-w-[700px] min-h-[400px] bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 mx-auto">
											{/* Small green discount card overlay - positioned at top-left */}
											<div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 bg-gradient-to-b from-[#E9F47C] to-[#A3B116] rounded-2xl px-8 sm:px-12 lg:px-18 py-2 shadow-lg z-10">
												{/* "最多用戶選擇" Badge */}
												<div className="absolute  -right-1 sm:-right-[-0.5rem] transform bg-white/50 text-[#111827] px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
													{t("mostUserChoice")}
												</div>

												<div className="pt-1 text-center text-white">
													<div className="flex items-baseline justify-center gap-1 mb-1 -translate-x-10">
														<span className="relative inline-block">
															{/* Background stroke layer */}
															<span
																className="absolute inset-0 font-noto-sans-hk text-stroke-white"
																style={{
																	fontSize:
																		"44px",
																	fontWeight:
																		"900",
																	WebkitTextFillColor:
																		"transparent",
																	WebkitTextStroke:
																		"10px white", // Custom thicker stroke
																}}
																aria-hidden="true"
															>
																{formatPrice(
																	188
																)}
															</span>
															{/* Foreground gradient text */}
															<span
																className="relative bg-gradient-to-r from-[#99A800] to-[#5D6600] font-noto-sans-hk bg-clip-text text-transparent"
																style={{
																	fontSize:
																		"44px",
																	fontWeight:
																		"900",
																	backgroundImage:
																		"linear-gradient(to right, #99A800, #5D6600)",
																	WebkitBackgroundClip:
																		"text",
																}}
															>
																{formatPrice(
																	188
																)}
															</span>
														</span>
														<span className="text-xs font-bold text-black sm:text-sm opacity-90">
															/ {t("perTime")}
														</span>
													</div>
													<div
														className="font-['Noto_Serif_TC, serif'] font-extrabold text-[#284628] text-lg sm:text-xl lg:text-[35px] translate-x-15"
														style={{
															WebkitTextStroke:
																"1.5px #284628",
														}}
													>
														{t("limitedTimeOffer")}
													</div>
												</div>
											</div>{" "}
											{/* Main card content */}
											<div className="flex flex-col w-full h-full gap-5 pt-2">
												{/* Original price section - moved to right */}
												<div className="mb-6 text-right">
													<div className="flex items-baseline justify-end gap-2 mb-2">
														<span
															className="font-bold text-gray-400 line-through "
															style={{
																fontSize:
																	"clamp(0.1rem, 2vw, 1.25rem)",
															}}
														>
															{formatPrice(388)}
														</span>
														<span
															className="font-bold text-gray-400"
															style={{
																fontSize:
																	"clamp(0.2rem, 1.5vw, 1rem)",
															}}
														>
															/ {t("perTime")}
														</span>
													</div>
													<div
														className="font-bold text-gray-400 text-34xl"
														style={{
															WebkitTextStroke:
																"1px #9CA3AF",
														}}
													>
														{t("premiumVersion2")}
													</div>
												</div>

												{/* Features in 2-column grid */}
												<div className="flex-1 mb-3">
													<div className="grid grid-cols-2 gap-y-4 gap-x-8">
														{[
															"premiumFeature2_1",
															"premiumFeature2_2",
															"premiumFeature2_3",
															"premiumFeature2_4",
															"premiumFeature2_5",
															"premiumFeature2_6",
														].map(
															(
																featureKey,
																index
															) => (
																<div
																	key={index}
																	className="flex items-start gap-3"
																>
																	<div
																		className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
																		style={{
																			backgroundColor:
																				"#E8E2DA",
																		}}
																	>
																		<svg
																			className="w-4 h-4 text-black"
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path
																				fillRule="evenodd"
																				d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																				clipRule="evenodd"
																			/>
																		</svg>
																	</div>
																	<span
																		className="text-[17px] leading-relaxed text-black"
																		style={{
																			fontFamily:
																				'"Noto sans HK',
																		}}
																	>
																		{t(
																			featureKey
																		)}
																	</span>
																</div>
															)
														)}
													</div>
												</div>

												{/* Button */}
												<div className="flex justify-center">
													<button
														onClick={
															handlePremiumClick
														}
														className="bg-gradient-to-b from-[#BDCF0C] to-[#7B8700] hover:from-[#A3B116] hover:to-[#5D6600] text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
														style={{
															width: "342px",
															height: "48px",
															borderRadius:
																"20px",
														}}
														disabled={
															isProcessingPayment &&
															currentCardType ===
																"expert88"
														}
													>
														{isProcessingPayment &&
														currentCardType ===
															"expert88"
															? t("processing")
															: t(
																	"paymentCalculation"
																)}
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Personal Fortune Analysis Section */}
						<div className="w-full px-1 sm:px-4">
							{/* Header */}
							<div className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row sm:gap-8 sm:mb-10 lg:mb-12">
								<h2
									className=" font-bold text-[#AEB116] lg:text-[#AEB116] px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-left sm:text-left  "
									style={{
										fontSize: "clamp(2rem, 8vw, 4rem)", // Responsive font size
										WebkitTextStroke: "1px #AEB116	", // Thicker white border
									}}
								>
									{t("personalFortuneAnalysis")}
								</h2>
								<button
									className="bg-[#A3B116] hover:bg-[#8B9914] text-white px-4 sm:px-6 py-2 text-base sm:text-lg lg:text-[20px] rounded-full font-medium transition-colors duration-300 shadow-lg"
									onClick={() =>
										router.push("/demo?category=wealth")
									}
								>
									{t("previewButton")}
								</button>
							</div>

							{/* Cards Grid */}
							<div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] mx-auto grid  lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
								{/* Financial Fortune Card */}
								{/* Mobile Version */}
								<div className="block w-full max-w-sm mx-auto my-8 lg:hidden">
									<div className="relative w-full max-w-lg bg-white shadow-lg rounded-2xl">
										{/* Top Section - Green with image and title */}
										<div className="absolute px-4 py-3 top-[-40px] left-[-30px]">
											<div className="w-45">
												<img
													src="/images/price/wealth-mobile.png"
													alt={t("coupleAnalysis")}
													className="object-cover w-full h-full"
												/>
											</div>
										</div>

										{/* Bottom Section - White with features and pricing */}
										<div className="px-4 py-10">
											<div className="flex gap-4">
												{/* Left - Features List */}
												<div className="flex-1 mt-3 space-y-1">
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("basicAnalysis")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"formatPatternAnalysis"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"wealthAnalysis"
															)}
														</span>
													</div>

													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"fortuneSummary"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("fortuneAdvice")}
														</span>
													</div>
												</div>

												{/* Right - Pricing Section */}
												<div className="flex flex-col items-end gap-2">
													{/* Light Version */}
													<div className="absolute top-[-25px] right-[0px] rounded-[20px] px-4 py-2 min-w-[80px] flex flex-col items-start bg-gradient-to-br from-[#E1ED71] to-[#A9B720]">
														<div
															className="mb-1 font-bold"
															style={{
																fontSize:
																	"18px",
																color: "#3F581F",
																WebkitTextStroke:
																	"0.5px #3F581F",
															}}
														>
															輕享版
														</div>
														<div className="flex flex-row items-end">
															<div
																className="w-full font-bold font-noto-sans-hk"
																style={{
																	fontSize:
																		"18px",
																	color: "#3F581F",
																	textAlign:
																		"end",
																}}
															>
																{formatPrice(
																	38
																)}
															</div>
															<div
																className="w-full font-noto-sans-hk"
																style={{
																	fontSize:
																		"12px",
																	color: "#3F581F",
																}}
															>
																/ 每次
															</div>
														</div>
														<button
															onClick={() =>
																handleFortunePayment(
																	"financial"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_financial"
															}
															className="mt-2 w-full bg-white text-[#A3B116] text-xs font-medium py-1 px-2 rounded-[30px] hover:bg-gray-100 transition-colors"
															style={{
																WebkitTextStroke:
																	"0.5px #A3B116",
															}}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_financial"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>

													{/* Premium Version */}
													<div className="text-start mt-15 min-w-[80px]">
														<div
															className="mb-1 text-[24px] font-medium text-[#A1A1A1]"
															style={{
																WebkitTextStroke:
																	"1px #A1A1A1",
															}}
														>
															尊享版
														</div>
														<div className="flex flex-row items-end justify-end">
															<div
																className="text-[20px] font-nano-sans-hk line-through"
																style={{
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"1px #A1A1A1",
																	fontWeight:
																		"extrabold",
																}}
															>
																{formatPrice(
																	88
																)}
															</div>
															<div className="text-xs text-[#A1A1A1]">
																/ 每次
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								{/* Financial Fortune Card-Desktop */}
								<div className="hidden w-full max-w-xs mx-auto overflow-hidden bg-white shadow-lg lg:block rounded-xl sm:rounded-2xl">
									{/* Card Image Header */}
									<div className="relative h-32 overflow-hidden ">
										<div className="relative h-32 overflow-hidden">
											<Image
												src={getRegionSpecificImage(
													"wealth",
													region
												)}
												alt={t("wealthFortune")}
												fill
											/>
										</div>
									</div>
									{/* Card Content */}
									<div className="p-3 sm:p-4">
										{/* Flip Card Container */}
										<div className="relative h-28 group perspective-1000">
											{/* Card Inner (Flip Container) */}
											<div className="relative w-full h-full transition-transform duration-700 ">
												{/* Front Side - Premium Version ({formatPrice(88)}) */}
												<div className="absolute inset-0 w-full h-full mb-2 bg-white ">
													<div className="flex flex-col justify-between ">
														<div className="flex flex-col mb-5 sm:flex-row sm:items-center sm:justify-between">
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"18px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																{t(
																	"premiumPlan"
																)}
															</span>
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"20px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																<span className="line-through">
																	{formatPrice(
																		88
																	)}
																</span>
																/
																<span className="text-[9px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-gradient-to-b from-[#E8F37A] to-[#A3B116] text-black py-2 text-sm rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															style={{
																boxShadow:
																	"0 12px 15.5px rgba(49, 67, 67, 0.2)",
															}}
															onClick={() =>
																handleFortunePayment(
																	"financial"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_financial"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_financial"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>

												{/* Back Side - Light Version ($38) */}
												<div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg border-2 border-[#A3B116] shadow-sm rotate-y-180">
													<div className="flex flex-col justify-between h-full p-3">
														<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
															<span className="text-[16px] sm:text-sm font-bold text-[#A3B116]">
																{t("lightPlan")}
															</span>
															<span className="text-[28px] sm:text-lg font-bold text-[#A3B116]">
																{formatPrice(
																	38
																)}
																/
																<span className="text-[10px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-[#A3B116] hover:bg-[#8B9914] text-white py-2 text-sm rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															onClick={() =>
																handleFortunePayment(
																	"financial"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_financial"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_financial"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>
											</div>
										</div>

										{/* Features */}
										<div className="space-y-2 text-xs">
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("basicAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("destinyExplanation")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("wealthAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("wealthSummary")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("luckAdvice")}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Love Fortune Card */}
								{/* Mobile Version */}
								<div className="block w-full max-w-sm mx-auto my-8 lg:hidden">
									<div className="relative w-full max-w-lg bg-white shadow-lg rounded-2xl">
										{/* Top Section - Green with image and title */}
										<div className="absolute px-4 py-3 top-[-40px] left-[-30px]">
											<div className="w-45">
												<img
													src="/images/price/love-mobile.png"
													alt={t("coupleAnalysis")}
													className="object-cover w-full h-full"
												/>
											</div>
										</div>

										{/* Bottom Section - White with features and pricing */}
										<div className="px-4 py-10">
											<div className="flex gap-4">
												{/* Left - Features List */}
												<div className="flex-1 mt-3 space-y-1">
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("basicAnalysis")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"formatPatternAnalysis"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("loveAnalysis")}
														</span>
													</div>

													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("loveSummary")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("fortuneAdvice")}
														</span>
													</div>
												</div>

												{/* Right - Pricing Section */}
												<div className="flex flex-col items-end gap-2">
													{/* Light Version */}
													<div className="absolute top-[-25px] right-[0px] rounded-[20px] px-4 py-2 min-w-[80px] flex flex-col items-start bg-gradient-to-br from-[#E1ED71] to-[#A9B720]">
														<div
															className="mb-1 font-bold"
															style={{
																fontSize:
																	"18px",
																color: "#3F581F",
																WebkitTextStroke:
																	"0.5px #3F581F",
															}}
														>
															輕享版
														</div>
														<div className="flex flex-row items-end">
															<div
																className="w-full font-bold font-noto-sans-hk"
																style={{
																	fontSize:
																		"18px",
																	color: "#3F581F",
																	textAlign:
																		"end",
																}}
															>
																{formatPrice(
																	38
																)}
															</div>
															<div
																className="w-full font-noto-sans-hk"
																style={{
																	fontSize:
																		"12px",
																	color: "#3F581F",
																}}
															>
																/ 每次
															</div>
														</div>
														<button
															onClick={() =>
																handleFortunePayment(
																	"love"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_love"
															}
															className="mt-2 w-full bg-white text-[#A3B116] text-xs font-medium py-1 px-2 rounded-[30px] hover:bg-gray-100 transition-colors"
															style={{
																WebkitTextStroke:
																	"0.5px #A3B116",
															}}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_love"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>

													{/* Premium Version */}
													<div className="text-start mt-15 min-w-[80px]">
														<div
															className="mb-1 text-[24px] font-medium text-[#A1A1A1]"
															style={{
																WebkitTextStroke:
																	"1px #A1A1A1",
															}}
														>
															尊享版
														</div>
														<div className="flex flex-row items-end justify-end">
															<div
																className="text-[20px] font-nano-sans-hk line-through"
																style={{
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"1px #A1A1A1",
																	fontWeight:
																		"extrabold",
																}}
															>
																{formatPrice(
																	88
																)}
															</div>
															<div className="text-xs text-[#A1A1A1]">
																/ 每次
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								{/* Love Fortune Card-Desktop */}
								<div className="hidden overflow-hidden bg-white shadow-lg lg:block rounded-2xl">
									{/* Card Image Header */}
									<div className="relative h-32 overflow-hidden ">
										<div className="relative h-32 overflow-hidden">
											<Image
												src={getRegionSpecificImage(
													"relationship",
													region
												)}
												alt={t("loveFortune")}
												fill
											/>
										</div>
									</div>
									{/* Card Content */}
									<div className="p-4">
										{/* Flip Card Container */}
										<div className="relative h-28 group perspective-1000">
											{/* Card Inner (Flip Container) */}
											<div className="relative w-full h-full transition-transform duration-700 ">
												{/* Front Side - Premium Version ({formatPrice(88)}) */}
												<div className="absolute inset-0 w-full h-full mb-2 bg-white ">
													<div className="flex flex-col justify-between ">
														<div className="flex flex-col mb-5 sm:flex-row sm:items-center sm:justify-between">
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"18px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																{t(
																	"premiumPlan"
																)}
															</span>
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"20px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																<span className="line-through">
																	{formatPrice(
																		88
																	)}
																</span>
																/
																<span className="text-[9px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-gradient-to-b from-[#E8F37A] to-[#A3B116] text-black py-2 text-sm rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															style={{
																boxShadow:
																	"0 12px 15.5px rgba(49, 67, 67, 0.2)",
															}}
															onClick={() =>
																handleFortunePayment(
																	"love"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_love"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_love"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>

												{/* Back Side - Light Version ($38) */}
												<div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg border-2 border-[#A3B116] shadow-sm rotate-y-180">
													<div className="flex flex-col justify-between h-full p-3">
														<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
															<span className="text-[16px] sm:text-sm font-bold text-[#A3B116]">
																{t("lightPlan")}
															</span>
															<span className="text-[28px] sm:text-lg font-bold text-[#A3B116]">
																{formatPrice(
																	38
																)}
																/
																<span className="text-[10px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-[#A3B116] hover:bg-[#8B9914] text-white py-2 text-sm rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															onClick={() =>
																handleFortunePayment(
																	"love"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_love"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_love"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>
											</div>
										</div>

										{/* Features */}
										<div className="space-y-2 text-xs">
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("basicAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("destinyExplanation")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("loveAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("loveSummary")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("luckAdvice")}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Health Fortune Card */}
								{/* Mobile Version */}
								<div className="block w-full max-w-sm mx-auto my-8 lg:hidden">
									<div className="relative w-full max-w-lg bg-white shadow-lg rounded-2xl">
										{/* Top Section - Green with image and title */}
										<div className="absolute px-4 py-3 top-[-40px] left-[-30px]">
											<div className="w-45">
												<img
													src="/images/price/health-mobile.png"
													alt={t("coupleAnalysis")}
													className="object-cover w-full h-full"
												/>
											</div>
										</div>

										{/* Bottom Section - White with features and pricing */}
										<div className="px-4 py-10">
											<div className="flex gap-4">
												{/* Left - Features List */}
												<div className="flex-1 mt-3 space-y-1">
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("basicAnalysis")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"formatPatternAnalysis"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"healthAnalysis"
															)}
														</span>
													</div>

													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("healthSummary")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("fortuneAdvice")}
														</span>
													</div>
												</div>

												{/* Right - Pricing Section */}
												<div className="flex flex-col items-end gap-2">
													{/* Light Version */}
													<div className="absolute top-[-25px] right-[0px] rounded-[20px] px-4 py-2 min-w-[80px] flex flex-col items-start bg-gradient-to-br from-[#E1ED71] to-[#A9B720]">
														<div
															className="mb-1 font-bold"
															style={{
																fontSize:
																	"18px",
																color: "#3F581F",
																WebkitTextStroke:
																	"0.5px #3F581F",
															}}
														>
															輕享版
														</div>
														<div className="flex flex-row items-end">
															<div
																className="w-full font-bold font-noto-sans-hk"
																style={{
																	fontSize:
																		"18px",
																	color: "#3F581F",
																	textAlign:
																		"end",
																}}
															>
																{formatPrice(
																	38
																)}
															</div>
															<div
																className="w-full font-noto-sans-hk"
																style={{
																	fontSize:
																		"12px",
																	color: "#3F581F",
																}}
															>
																/ 每次
															</div>
														</div>
														<button
															onClick={() =>
																handleFortunePayment(
																	"health"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_health"
															}
															className="mt-2 w-full bg-white text-[#A3B116] text-xs font-medium py-1 px-2 rounded-[30px] hover:bg-gray-100 transition-colors"
															style={{
																WebkitTextStroke:
																	"0.5px #A3B116",
															}}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_health"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>

													{/* Premium Version */}
													<div className="text-start mt-15 min-w-[80px]">
														<div
															className="mb-1 text-[24px] font-medium text-[#A1A1A1]"
															style={{
																WebkitTextStroke:
																	"1px #A1A1A1",
															}}
														>
															尊享版
														</div>
														<div className="flex flex-row items-end justify-end">
															<div
																className="text-[20px] font-nano-sans-hk line-through"
																style={{
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"1px #A1A1A1",
																	fontWeight:
																		"extrabold",
																}}
															>
																{formatPrice(
																	88
																)}
															</div>
															<div className="text-xs text-[#A1A1A1]">
																/ 每次
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								{/* Health Fortune Card-Desktop */}
								<div className="hidden w-full max-w-xs mx-auto overflow-hidden bg-white shadow-lg lg:block rounded-2xl">
									{/* Card Image Header */}
									<div className="relative h-32 overflow-hidden">
										<div className="relative h-32 overflow-hidden">
											<Image
												src={getRegionSpecificImage(
													"health",
													region
												)}
												alt={t("healthFortune")}
												fill
											/>
										</div>
									</div>
									{/* Card Content */}
									<div className="p-4">
										{/* Flip Card Container */}
										<div className="relative h-28 group perspective-1000">
											{/* Card Inner (Flip Container) */}
											<div className="relative w-full h-full transition-transform duration-700 ">
												{/* Front Side - Premium Version ({formatPrice(88)}) */}
												<div className="absolute inset-0 w-full h-full mb-2 bg-white ">
													<div className="flex flex-col justify-between ">
														<div className="flex flex-col mb-5 sm:flex-row sm:items-center sm:justify-between">
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"18px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																{t(
																	"premiumPlan"
																)}
															</span>
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"20px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																<span className="line-through">
																	{formatPrice(
																		88
																	)}
																</span>
																/
																<span className="text-[9px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>

														<button
															className="w-full bg-gradient-to-b from-[#E8F37A] to-[#A3B116] text-black py-2 text-sm rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															style={{
																boxShadow:
																	"0 12px 15.5px rgba(49, 67, 67, 0.2)",
															}}
															onClick={() =>
																handleFortunePayment(
																	"health"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_health"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_health"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>

												{/* Back Side - Light Version ($38) */}
												<div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg border-2 border-[#A3B116] shadow-sm rotate-y-180">
													<div className="flex flex-col justify-between h-full p-3">
														<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
															<span className="text-[16px] sm:text-sm font-bold text-[#A3B116]">
																{t("lightPlan")}
															</span>
															<span className="text-[28px] sm:text-lg font-bold text-[#A3B116]">
																{formatPrice(
																	38
																)}
																/
																<span className="text-[10px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-[#A3B116] hover:bg-[#8B9914] text-white py-2 text-sm rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															onClick={() =>
																handleFortunePayment(
																	"health"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_health"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_health"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>
											</div>
										</div>

										{/* Features */}
										<div className="space-y-2 text-xs">
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("basicAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("destinyExplanation")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("healthAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("healthSummary")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("luckAdvice")}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Career Fortune Card */}
								{/* Mobile Version */}
								<div className="block w-full max-w-sm mx-auto my-8 lg:hidden">
									<div className="relative w-full max-w-lg bg-white shadow-lg rounded-2xl">
										{/* Top Section - Green with image and title */}
										<div className="absolute px-4 py-3 top-[-40px] left-[-30px]">
											<div className="w-45">
												<img
													src="/images/price/career-mobile.png"
													alt={t("coupleAnalysis")}
													className="object-cover w-full h-full"
												/>
											</div>
										</div>

										{/* Bottom Section - White with features and pricing */}
										<div className="px-4 py-10">
											<div className="flex gap-4">
												{/* Left - Features List */}
												<div className="flex-1 mt-3 space-y-1">
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("basicAnalysis")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"formatPatternAnalysis"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"careerAnalysis"
															)}
														</span>
													</div>

													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("careerSummary")}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t("fortuneAdvice")}
														</span>
													</div>
												</div>

												{/* Right - Pricing Section */}
												<div className="flex flex-col items-end gap-2">
													{/* Light Version */}
													<div className="absolute top-[-25px] right-[0px] rounded-[20px] px-4 py-2 min-w-[80px] flex flex-col items-start bg-gradient-to-br from-[#E1ED71] to-[#A9B720]">
														<div
															className="mb-1 font-bold"
															style={{
																fontSize:
																	"18px",
																color: "#3F581F",
																WebkitTextStroke:
																	"0.5px #3F581F",
															}}
														>
															輕享版
														</div>
														<div className="flex flex-row items-end">
															<div
																className="w-full font-bold font-noto-sans-hk"
																style={{
																	fontSize:
																		"18px",
																	color: "#3F581F",
																	textAlign:
																		"end",
																}}
															>
																{formatPrice(
																	38
																)}
															</div>
															<div
																className="w-full font-noto-sans-hk"
																style={{
																	fontSize:
																		"12px",
																	color: "#3F581F",
																}}
															>
																/ 每次
															</div>
														</div>
														<button
															onClick={() =>
																handleFortunePayment(
																	"career"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_career"
															}
															className="mt-2 w-full bg-white text-[#A3B116] text-xs font-medium py-1 px-2 rounded-[30px] hover:bg-gray-100 transition-colors"
															style={{
																WebkitTextStroke:
																	"0.5px #A3B116",
															}}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_career"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>

													{/* Premium Version */}
													<div className="text-start mt-15 min-w-[80px]">
														<div
															className="mb-1 text-[24px] font-medium text-[#A1A1A1]"
															style={{
																WebkitTextStroke:
																	"1px #A1A1A1",
															}}
														>
															尊享版
														</div>
														<div className="flex flex-row items-end justify-end">
															<div
																className="text-[20px] font-nano-sans-hk line-through"
																style={{
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"1px #A1A1A1",
																	fontWeight:
																		"extrabold",
																}}
															>
																{formatPrice(
																	88
																)}
															</div>
															<div className="text-xs text-[#A1A1A1]">
																/ 每次
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								{/* Career Fortune Card-Desktop */}
								<div className="hidden overflow-hidden bg-white shadow-lg lg:block rounded-2xl">
									{/* Card Image Header */}
									<div className="relative h-32 overflow-hidden">
										<Image
											src={getRegionSpecificImage(
												"career",
												region
											)}
											alt={t("careerFortune")}
											fill
										/>
									</div>

									{/* Card Content */}
									<div className="p-4">
										{/* Flip Card Container */}
										<div className="relative h-28 group perspective-1000">
											{/* Card Inner (Flip Container) */}
											<div className="relative w-full h-full transition-transform duration-700 ">
												{/* Front Side - Premium Version ({formatPrice(88)}) */}
												<div className="absolute inset-0 w-full h-full mb-2 bg-white ">
													<div className="flex flex-col justify-between ">
														<div className="flex flex-col mb-5 sm:flex-row sm:items-center sm:justify-between">
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"18px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																{t(
																	"premiumPlan"
																)}
															</span>
															<span
																className="font-bold"
																style={{
																	fontFamily:
																		"Noto Serif TC, serif",
																	fontSize:
																		"20px",
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"0.5px #A1A1A1",
																}}
															>
																<span className="line-through">
																	{formatPrice(
																		88
																	)}
																</span>
																/
																<span className="text-[9px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-gradient-to-b from-[#E8F37A] to-[#A3B116] text-black py-2 text-sm rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															style={{
																boxShadow:
																	"0 12px 15.5px rgba(49, 67, 67, 0.2)",
															}}
															onClick={() =>
																handleFortunePayment(
																	"career"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_career"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_career"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>

												{/* Back Side - Light Version ($38) */}
												<div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg border-2 border-[#A3B116] shadow-sm rotate-y-180">
													<div className="flex flex-col justify-between h-full p-3">
														<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
															<span className="text-[16px] sm:text-sm font-bold text-[#A3B116]">
																{t("lightPlan")}
															</span>
															<span className="text-[28px] sm:text-lg font-bold text-[#A3B116]">
																{formatPrice(
																	38
																)}
																/
																<span className="text-[10px]">
																	{t(
																		"perTime"
																	)}
																</span>
															</span>
														</div>
														<button
															className="w-full bg-[#A3B116] hover:bg-[#8B9914] text-white py-2 text-sm rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
															onClick={() =>
																handleFortunePayment(
																	"career"
																)
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"fortune_career"
															}
														>
															{isProcessingPayment &&
															currentCardType ===
																"fortune_career"
																? t(
																		"processing2"
																	)
																: t(
																		"paymentCalculation"
																	)}
														</button>
													</div>
												</div>
											</div>
										</div>

										{/* Features */}
										<div className="space-y-2 text-xs">
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("basicAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("destinyExplanation")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("careerAnalysis")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("careerSummary")}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="flex items-center justify-center w-5 h-5 rounded-full"
													style={{
														backgroundColor:
															"#A3B116",
													}}
												>
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<span
													className="text-xs sm:text-sm text-[#111827]"
													style={{
														fontFamily:
															"Noto Sans HK, sans-serif",
													}}
												>
													{t("luckAdvice")}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Couple's Fortune Analysis Section */}
						<div className="w-full px-2 mx-auto sm:px-4 max-w-7xl">
							{/* Header */}
							<div className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row sm:gap-8 sm:mb-10 lg:mb-12">
								<h2
									className=" font-bold text-[#AEB116] lg:text-[#AEB116] px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-left sm:text-left  "
									style={{
										fontSize: "clamp(2rem, 8vw, 4rem)", // Responsive font size
										WebkitTextStroke: "1px #AEB116	", // Thicker white border
									}}
								>
									{t("coupleAnalysisTitle")}
								</h2>
								<button
									className="bg-[#A3B116] hover:bg-[#8B9914] text-white px-4 sm:px-6 py-2 text-base sm:text-lg lg:text-[20px] rounded-full font-medium transition-colors duration-300 shadow-lg"
									onClick={() =>
										router.push("/demo?category=couple")
									}
								>
									{t("previewButton")}
								</button>
							</div>

							{/* Main Card Container - Mobile-first design matching image */}
							<div className="relative w-full max-w-4xl px-2 mx-auto sm:px-0">
								{/* Mobile Layout - Single unified card */}
								<div className="flex justify-center block mt-15 lg:hidden">
									<div className="relative w-full max-w-sm bg-white shadow-lg rounded-2xl">
										{/* Top Section - Green with image and title */}
										<div className="absolute px-4 py-3 top-[-60px] left-[-30px]">
											<div className="w-40 h-30 ">
												<img
													src="/images/price/couple.png"
													alt={t("coupleAnalysis")}
													className="object-cover w-full h-full"
												/>
											</div>
										</div>

										{/* Bottom Section - White with features and pricing */}
										<div className="px-4 py-10">
											<div className="flex gap-4">
												{/* Left - Features List */}
												<div className="flex-1 space-y-1 mt-7">
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"coupleFeature_1"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"coupleFeature_2"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"coupleFeature_3"
															)}
														</span>
													</div>

													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"coupleFeature_4"
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A3B116]">
															<svg
																className="w-2 h-2 text-white"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-gray-700 font-noto-sans-hk">
															{t(
																"coupleFeature_5"
															)}
														</span>
													</div>
												</div>

												{/* Right - Pricing Section */}
												<div className="flex flex-col items-end gap-2">
													{/* Light Version */}
													<div className="absolute top-[-25px] right-[0px] rounded-[20px] px-4 py-2 min-w-[80px] flex flex-col items-start bg-gradient-to-br from-[#E1ED71] to-[#A9B720]">
														<div
															className="mb-1 font-bold"
															style={{
																fontSize:
																	"18px",
																color: "#3F581F",
																WebkitTextStroke:
																	"0.5px #3F581F",
															}}
														>
															輕享版
														</div>
														<div className="flex flex-row items-end">
															<div
																className="w-full font-bold font-noto-sans-hk"
																style={{
																	fontSize:
																		"18px",
																	color: "#3F581F",
																	textAlign:
																		"end",
																}}
															>
																{formatPrice(
																	88
																)}
															</div>
															<div
																className="w-full font-noto-sans-hk"
																style={{
																	fontSize:
																		"14px",
																	color: "#3F581F",
																}}
															>
																/ 每次
															</div>
														</div>
														<button
															onClick={
																handleCouplePayment
															}
															disabled={
																isProcessingPayment &&
																currentCardType ===
																	"couple"
															}
															className="mt-2 w-full bg-white text-[#A3B116] text-xs font-medium py-1 px-2 rounded-[30px] hover:bg-gray-100 transition-colors"
															style={{
																WebkitTextStroke:
																	"0.5px #A3B116",
															}}
														>
															付費測算
														</button>
													</div>

													{/* Premium Version */}
													<div className="text-start mt-15 min-w-[80px]">
														<div
															className="mb-1 text-[24px] font-medium text-[#A1A1A1]"
															style={{
																WebkitTextStroke:
																	"1px #A1A1A1",
															}}
														>
															尊享版
														</div>
														<div className="flex flex-row items-end justify-end">
															<div
																className="text-[17px] font-nano-sans-hk line-through"
																style={{
																	color: "#A1A1A1",
																	WebkitTextStroke:
																		"1px #A1A1A1",
																	fontWeight:
																		"extrabold",
																}}
															>
																{formatPrice(
																	168
																)}
															</div>
															<div className="text-xs text-[#A1A1A1]">
																/ 每次
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Desktop Layout - Original overlay design */}
								<div className="hidden lg:block">
									{/* Image Card - Separate and positioned higher, more to the left */}
									<div className="relative z-20 mb-[-370px]">
										<div className="w-[400px] h-[400px] lg:-ml-1 bg-gradient-to-br from-[#A3B116] to-[#8B9914] p-4 rounded-3xl shadow-2xl">
											{/* Couple Image Placeholder */}
											<div className="relative">
												<div className="rounded-2xl">
													<img
														src={getRegionSpecificImage(
															"couple",
															region
														)}
														alt={t(
															"coupleAnalysis"
														)}
														className="object-cover fill rounded-xl"
													/>
												</div>
												<div className="relative w-full mt-5 transition-transform duration-700">
													<button
														onClick={
															handleCouplePayment
														}
														disabled={
															isProcessingPayment &&
															currentCardType ===
																"couple"
														}
														className="w-full py-2 mt-4 font-black text-[#AEB116] bg-white border-2 border-[#A3B116] rounded-[40px] hover:bg-white hover:text-[#A3B116] transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
														style={{
															fontSize:
																"clamp(1rem, 6vw, 2rem)",
														}}
													>
														{isProcessingPayment &&
														currentCardType ===
															"couple"
															? t("processing2")
															: t(
																	"paymentCalculation"
																)}
													</button>
												</div>
											</div>
										</div>
									</div>

									{/* Button Card - White background overlapping below */}
									<div
										className="relative z-10 w-full max-w-[742px] min-h-[385px] bg-white rounded-[30px] ml-16"
										style={{
											boxShadow:
												"0 12px 15.5px rgba(49, 67, 67, 0.2)",
										}}
									>
										<div className="flex flex-col h-full">
											{/* Content aligned to right side */}
											<div className="flex flex-col items-end justify-start w-full p-8">
												<div className="flex justify-end w-full">
													{/* Features List - Right aligned */}
													<div className="mb-6 space-y-4 mr-30">
														<div className="flex items-center gap-3">
															<div
																className="flex items-center justify-center rounded-full w-7 h-7"
																style={{
																	backgroundColor:
																		"#A3B116",
																}}
															>
																<svg
																	className="w-5 h-5 text-white"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<span
																className="text-[20px]"
																style={{
																	color: "#111827",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{t(
																	"coupleFeature_1"
																)}
															</span>
														</div>
														<div className="flex items-center gap-3">
															<div
																className="flex items-center justify-center rounded-full w-7 h-7"
																style={{
																	backgroundColor:
																		"#A3B116",
																}}
															>
																<svg
																	className="w-5 h-5 text-white"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<span
																className="text-[20px]"
																style={{
																	color: "#111827",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{t(
																	"coupleFeature_2"
																)}
															</span>
														</div>
														<div className="flex items-center gap-3">
															<div
																className="flex items-center justify-center rounded-full w-7 h-7"
																style={{
																	backgroundColor:
																		"#A3B116",
																}}
															>
																<svg
																	className="w-5 h-5 text-white"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<span
																className="text-[20px]"
																style={{
																	color: "#111827",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{t(
																	"coupleFeature_3"
																)}
															</span>
														</div>
														<div className="flex items-center gap-3">
															<div
																className="flex items-center justify-center rounded-full w-7 h-7"
																style={{
																	backgroundColor:
																		"#A3B116",
																}}
															>
																<svg
																	className="w-5 h-5 text-white"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<span
																className="text-[20px]"
																style={{
																	color: "#111827",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{t(
																	"coupleFeature_4"
																)}
															</span>
														</div>
														<div className="flex items-center gap-3">
															<div
																className="flex items-center justify-center rounded-full w-7 h-7"
																style={{
																	backgroundColor:
																		"#A3B116",
																}}
															>
																<svg
																	className="w-5 h-5 text-white"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path
																		fillRule="evenodd"
																		d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</div>
															<span
																className="text-[20px]"
																style={{
																	color: "#111827",
																	fontFamily:
																		"Noto Sans HK, sans-serif",
																}}
															>
																{t(
																	"coupleFeature_5"
																)}
															</span>
														</div>
													</div>
												</div>

												{/* Premium Version Pricing - Right aligned */}
												<div className="flex justify-end mt-7">
													<div className="flex flex-row gap-5 text-right align-center">
														<div
															className="text-4xl font-semibold "
															style={{
																color: "#A1A1A1",
																WebkitTextStroke:
																	"1px #A1A1A1",
															}}
														>
															{t(
																"premiumVersionTitle"
															)}
														</div>
														<div
															className="text-4xl font-black"
															style={{
																color: "#A1A1A1",
															}}
														>
															<span className="line-through font-noto-sans-hk">
																{formatPrice(
																	168
																)}
															</span>
															<span className="text-[20px]">
																/
																{t(
																	"perTimeUnit"
																)}
															</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Area Input Popup (Updated for region-based input) */}
				{showSqftPopup && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
						<div className="relative w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl animate-fade-in">
							<div className="text-center">
								{/* Icon */}
								<div className="mb-6 text-5xl">🏠</div>

								{/* Title */}
								<h3 className="mb-4 text-xl font-bold text-gray-800">
									{t("sqftPopupTitleNew")}
								</h3>

								{/* Description */}
								<p className="mb-6 text-sm leading-relaxed text-gray-600">
									{t("sqftPopupDescNew")}
									<br />
									<span className="font-medium text-red-600">
										{pricingInfo.minimumNote}
									</span>
								</p>

								{/* Input */}
								<div className="mb-6">
									<label className="block mb-2 text-sm font-medium text-left text-gray-700">
										{pricingInfo.inputLabel}
									</label>
									<input
										type="number"
										value={sqftValue}
										onChange={(e) =>
											setSqftValue(e.target.value)
										}
										placeholder={pricingInfo.placeholder}
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-lg focus:border-[#096e56] focus:outline-none transition-colors"
										min={pricingInfo.minimumValue}
										step="1"
										disabled={isProcessingPayment}
									/>
									{sqftError && (
										<p className="mt-2 text-sm text-center text-red-500">
											{sqftError}
										</p>
									)}
								</div>

								{/* Buttons */}
								<div className="flex gap-3">
									<button
										onClick={handleSqftSubmit}
										disabled={isProcessingPayment}
										className="flex-1 px-6 py-3 font-medium text-white bg-[#096e56] hover:bg-[#19ad6b] transition-all duration-200 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isProcessingPayment
											? t("processing")
											: t("buyNow")}
									</button>
									<button
										onClick={handleSqftPopupClose}
										disabled={isProcessingPayment}
										className="flex-1 px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{t("cancel")}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Share Confirmation Modal - Only show for Hong Kong */}
				{region === "hongkong" && showShareConfirm && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
						<div className="relative max-w-md p-6 bg-white shadow-2xl rounded-2xl">
							<div className="text-center">
								<div className="mb-4 text-4xl">🤔</div>
								<h3 className="mb-3 text-lg font-bold text-gray-800">
									{t("shareConfirmTitle")}
								</h3>
								<p className="mb-6 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
									{t("shareConfirmDesc")}
								</p>
								<div className="flex gap-3">
									<button
										onClick={() => handleShareConfirm(true)}
										className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-[#096e56] rounded-lg hover:bg-[#19ad6b] shadow-md hover:shadow-lg"
									>
										{t("yesShared")}
									</button>
									<button
										onClick={() =>
											handleShareConfirm(false)
										}
										className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
									>
										{t("cancel")}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Add Existing Report Dialog */}
				<AlertDialog
					open={showExistingReportDialog}
					onOpenChange={setShowExistingReportDialog}
				>
					<AlertDialogContent
						style={{ fontFamily: '"Noto Serif TC", serif' }}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{t("existingReportFound")}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{t("existingReportDescription")}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleViewExistingReport}
							>
								{t("viewExistingReport")}
							</AlertDialogAction>
							<AlertDialogAction
								onClick={handleRetestWithPayment}
								className="bg-orange-500 hover:bg-orange-600"
							>
								{t("retestWithPayment")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Show loading state while checking for existing reports */}
				{/* {checkingExistingReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="p-6 bg-white rounded-lg">
                            <div className="w-8 h-8 mx-auto border-b-2 border-green-500 rounded-full animate-spin"></div>
                            <p className="mt-2 text-center">
                                {t("checkingExistingReports")}
                            </p>
                        </div>
                    </div>
                )} */}

				<FAQ />
				<Footer />
			</div>

			<style jsx global>
				{`
					@layer utilities {
						.animate-fade-in {
							animation: fadeIn 0.3s ease-out;
						}
						@keyframes fadeIn {
							from {
								opacity: 0;
								transform: scale(0.95);
							}
							to {
								opacity: 1;
								transform: scale(1);
							}
						}

						/* 3D Hover Circular Motion Animation Utilities */
						.perspective-1000 {
							perspective: 1000px;
						}

						.preserve-3d {
							transform-style: preserve-3d;
						}

						.transform-gpu {
							transform: translate3d(0, 0, 0);
						}

						/* Card Positioning in 3D Space - Side by side, clearly visible */
						.card-orbit-front {
							transform: rotateY(0deg) translateZ(20px);
						}

						.card-orbit-back {
							transform: rotateY(-15deg) translateZ(-10px)
								scale(0.95);
						}

						/* Hover effect for back card - circular motion to center front */
						.card-orbit-back:hover {
							transform: rotateY(0deg) translateZ(50px)
								translateX(-140px) scale(1) !important;
						}

						/* Smooth transitions for all transforms */
						.card-orbit-front,
						.card-orbit-back {
							transition: transform 1s ease-in-out;
						}

						/* Additional hover scale effects for front card */
						.card-orbit-front:hover {
							transform: rotateY(0deg) translateZ(30px)
								scale(1.05);
						}

						/* Second Hero Section - Better positioning to match first section */
						.card-orbit-front-right {
							transform: rotateY(0deg) translateZ(20px)
								translateX(20px);
						}

						.card-orbit-back-right {
							transform: rotateY(-25deg) translateZ(-20px)
								translateX(-80px) scale(0.9);
						}

						/* Hover effect for back card in second section - smooth motion to center-right */
						.card-orbit-back-right:hover {
							transform: rotateY(10deg) translateZ(50px)
								translateX(20px) scale(1) !important;
						}

						/* Smooth transitions for second section cards */
						.card-orbit-front-right,
						.card-orbit-back-right {
							transition: transform 1s ease-in-out;
						}

						/* Additional hover effects for front card in second section - minimal movement */
						.card-orbit-front-right:hover {
							transform: rotateY(-3deg) translateZ(30px)
								translateX(15px) scale(1.05);
						}

						/* First Hero Section - Better positioning to avoid overlap */
						.card-orbit-front-left {
							transform: rotateY(0deg) translateZ(20px)
								translateX(-20px);
							z-index: 10;
						}

						.card-orbit-back-left {
							transform: rotateY(25deg) translateZ(-20px)
								translateX(80px) scale(0.9);
							z-index: 5;
						}

						/* Hover effect for back card in first section - smooth motion to center-left */
						.card-orbit-back-left:hover {
							transform: rotateY(-10deg) translateZ(50px)
								translateX(-20px) scale(1) !important;
							z-index: 30 !important;
						}

						/* Smooth transitions for first section cards */
						.card-orbit-front-left,
						.card-orbit-back-left {
							transition:
								transform 1s ease-in-out,
								z-index 0s ease-in-out;
						}

						/* Additional hover effects for front card in first section - minimal movement */
						.card-orbit-front-left:hover {
							transform: rotateY(3deg) translateZ(30px)
								translateX(-15px) scale(1.05);
							z-index: 15;
						}
					}
				`}
			</style>
		</>
	);
}
