"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
	Send,
	User,
	MessageCircle,
	Clock,
	Sparkles,
	Brain,
	Mic,
	Menu,
	X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BirthdayModal from "@/components/BirthdayModal";
import ShopNavbar from "@/components/ShopNavbar";

export default function SmartChat2() {
	const { data: session } = useSession();
	const pathname = usePathname();

	// Get user's stored region preference directly
	const [userRegion, setUserRegion] = useState("hongkong");

	useEffect(() => {
		// Get stored region preference from localStorage
		console.log("🔄 Region detection useEffect running...");
		if (typeof window !== "undefined") {
			const storedRegion = localStorage.getItem("userRegion");
			console.log(
				"📱 Retrieved from localStorage - userRegion:",
				storedRegion,
			);
			if (storedRegion && ["china", "hongkong"].includes(storedRegion)) {
				setUserRegion(storedRegion);
				console.log("💾 Using stored region preference:", storedRegion);
			} else {
				console.log(
					"❌ No valid stored region found, using default:",
					"hongkong",
				);
			}
		}
	}, []);

	// Map region to locale
	const regionToLocale = {
		china: "zh-CN",
		hongkong: "zh-TW",
		taiwan: "zh-TW",
	};

	// Use stored region preference, fallback to URL-based detection
	const pathSegments = pathname?.split("/") || [];
	const urlLocale =
		pathSegments[1] === "zh-CN" || pathSegments[1] === "zh-TW"
			? pathSegments[1]
			: "zh-TW";

	// Calculate currentLocale reactively when userRegion changes
	const [currentLocale, setCurrentLocale] = useState(urlLocale);

	useEffect(() => {
		const calculatedLocale = regionToLocale[userRegion] || urlLocale;
		setCurrentLocale(calculatedLocale);
		console.log("🌍 Smart-chat2 region-based locale:", {
			userRegion,
			currentLocale: calculatedLocale,
			urlLocale,
		});
	}, [userRegion, urlLocale]);
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [sessionId, setSessionId] = useState("");
	const [isClient, setIsClient] = useState(false);
	const messagesEndRef = useRef(null);

	// Modal 相關狀態
	const [showBirthdayModal, setShowBirthdayModal] = useState(false);
	const [needsBirthdayInfo, setNeedsBirthdayInfo] = useState(false);
	const [concern, setConcern] = useState("");
	const [isCoupleAnalysis, setIsCoupleAnalysis] = useState(false);
	const [reportType, setReportType] = useState("");
	const [originalUserQuestion, setOriginalUserQuestion] = useState(""); // Track original question
	const [latestSpecificProblem, setLatestSpecificProblem] = useState(""); // Track the most recent specific problem

	// 對話歷史相關狀態
	const [conversationHistory, setConversationHistory] = useState([]);
	const [currentUserId, setCurrentUserId] = useState("");
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [showLandingPage, setShowLandingPage] = useState(true);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// 🔐 Payment context preservation for login flow
	const [pendingPayment, setPendingPayment] = useState(null);
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	// 客戶端初始化 - 添加防重複初始化邏輯
	useEffect(() => {
		// 防止重複初始化
		if (isInitialized) {
			console.log("⏭️ Smart-Chat2 已初始化，跳過重複初始化");
			return;
		}

		setIsClient(true);

		// 使用session中的email作為用戶ID，fallback到本地存儲的ID
		let userId;
		if (session?.user?.email) {
			userId = session.user.email;
		} else {
			userId = localStorage.getItem("feng-shui-user-id");
			if (!userId) {
				userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				localStorage.setItem("feng-shui-user-id", userId);
			}
		}

		// 如果用戶ID沒有變化，不需要重新初始化
		if (currentUserId === userId && messages.length > 1) {
			console.log("👤 用戶未變化，跳過重新初始化");
			return;
		}

		console.log("🔄 初始化 Smart-Chat2，用戶:", userId);

		setCurrentUserId(userId);

		const newSessionId = `smart-chat2-${Date.now()}`;
		setSessionId(newSessionId);

		// 初始狀態顯示落地頁，不設置歡迎消息
		setMessages([]);
		setShowLandingPage(true);

		// 加載對話歷史
		loadConversationHistory(userId);
		setIsInitialized(true);
	}, [session?.user?.email, isInitialized, currentUserId, messages.length]); // 只在用戶email變化時重新初始化，而不是整個session對象

	// 🔐 Check for pending payment after login and auto-resume
	useEffect(() => {
		if (!session || !isClient) return;

		const pendingPaymentData = localStorage.getItem("pendingPayment");
		if (pendingPaymentData) {
			try {
				const paymentContext = JSON.parse(pendingPaymentData);
				console.log(
					"💳 Found pending payment after login:",
					paymentContext,
				);

				// Clear the pending payment
				localStorage.removeItem("pendingPayment");

				// Show resuming message
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: "歡迎回來！正在為您繼續處理付款...",
						timestamp: new Date(),
					},
				]);

				// Resume payment after a short delay
				setTimeout(() => {
					resumePayment(paymentContext);
				}, 1000);
			} catch (error) {
				console.error("❌ Failed to parse pending payment:", error);
				localStorage.removeItem("pendingPayment");
			}
		}
	}, [session, isClient]);

	// Auto-scroll to bottom when new messages are added
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		// 隱藏落地頁，顯示正常聊天界面
		if (showLandingPage) {
			setShowLandingPage(false);
		}

		// 🔥 Special handling for couple analysis report selection
		console.log(
			"🔍 Before checking couple analysis - isCoupleAnalysis:",
			isCoupleAnalysis,
			"inputMessage:",
			inputMessage.trim(),
		);
		if (isCoupleAnalysis && inputMessage.trim() === "1") {
			console.log(
				"🎯 Couple analysis option 1 selected - redirecting directly to couple payment",
			);

			const userMessage = {
				role: "user",
				content: inputMessage.trim(),
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setInputMessage("");

			// Add response message about payment
			const responseMessage = {
				role: "assistant",
				content: "太好了！正在為您處理情侶合盤分析付款...",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, responseMessage]);

			// 🔧 Use state variables that should now be properly updated from API responses
			const problemToUse =
				latestSpecificProblem ||
				originalUserQuestion ||
				concern ||
				"感情關係和諧改善建議";

			console.log("🎯 Problem selection debug:", {
				latestSpecificProblem,
				originalUserQuestion,
				concern,
				selectedProblem: problemToUse,
			});

			console.log(
				"🔍 Final problem to use for couple payment:",
				problemToUse,
			);
			console.log("📊 Couple payment debug info:", {
				problemFromLastMessage,
				latestSpecificProblem,
				originalUserQuestion,
				concern,
				finalProblemToUse: problemToUse,
			});
			console.log(
				"🔍 All messages for debugging:",
				messages.map((msg) => ({
					role: msg.role,
					hasSpecificProblem: !!msg.specificProblem,
					hasAiAnalysis: !!msg.aiAnalysis,
					specificProblemValue: msg.specificProblem,
					contentPreview: msg.content?.substring(0, 50) + "...",
				})),
			);

			// 🔐 Check if user is logged in before payment
			if (!session) {
				console.log("🔒 User not logged in, saving payment context");

				// Save payment context to localStorage
				const paymentContext = {
					type: "couple",
					locale: currentLocale,
					specificProblem: problemToUse,
					concern: concern,
					sessionId: sessionId,
					timestamp: Date.now(),
				};

				localStorage.setItem(
					"pendingPayment",
					JSON.stringify(paymentContext),
				);

				// Show login prompt message
				const loginPromptMessage = {
					role: "assistant",
					content: "請先登入以繼續付款。登入後將自動為您繼續處理。",
					timestamp: new Date(),
				};

				setMessages((prev) => [...prev, loginPromptMessage]);

				// Redirect to login page with callback
				const loginUrl = `/${currentLocale}/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
				console.log("🔐 Redirecting to login:", loginUrl);

				setTimeout(() => {
					window.location.href = loginUrl;
				}, 1500);

				setIsLoading(false);
				return;
			}

			// Call couple payment API directly
			try {
				setIsLoading(true);

				// Get fresh locale from localStorage to ensure consistency
				const storedRegion = localStorage.getItem("userRegion");
				// 🔧 FIX: Use URL locale as source of truth
				const freshLocale = currentLocale;
				console.log(
					"💳 Couple payment - Using fresh locale:",
					freshLocale,
					"from URL (region:",
					storedRegion,
					"is for pricing only)",
				);
				console.log("🚀 Sending to payment-couple API:", {
					locale: freshLocale,
					specificProblem: problemToUse,
					concern: concern,
					fromChat: true,
					sessionId: sessionId,
				});

				const paymentResponse = await fetch("/api/payment-couple", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						locale: freshLocale, // Use fresh locale from localStorage
						specificProblem: problemToUse,
						concern: concern,
						fromChat: true,
						sessionId: sessionId,
					}),
				});

				if (paymentResponse.ok) {
					const paymentData = await paymentResponse.json();
					console.log("💳 Couple Payment Response:", paymentData);

					if (paymentData.sessionId) {
						// Import Stripe and redirect to checkout
						const stripePublicKey =
							process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
						if (!stripePublicKey) {
							throw new Error("Stripe public key not configured");
						}

						const stripe = await import("@stripe/stripe-js").then(
							(mod) => mod.loadStripe(stripePublicKey),
						);

						if (stripe) {
							console.log(
								"🚀 Redirecting to Stripe checkout for couple payment",
							);
							await stripe.redirectToCheckout({
								sessionId: paymentData.sessionId,
							});
						} else {
							throw new Error("Failed to load Stripe");
						}
					} else {
						throw new Error(
							"No session ID received from couple payment",
						);
					}
				} else {
					throw new Error(
						`Payment API error: ${paymentResponse.status}`,
					);
				}
			} catch (error) {
				console.error("💳 Couple payment error:", error);
				setIsLoading(false);

				// Show error message
				const errorMessage = {
					role: "assistant",
					content: "抱歉，付款處理時發生錯誤，請稍後再試。",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			}

			return;
		}

		const userMessage = {
			role: "user",
			content: inputMessage.trim(),
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/smart-chat2", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userMessage.content,
					sessionId: sessionId,
					userId: currentUserId,
				}),
			});

			const data = await response.json();

			console.log("🔍 完整 API 回應:", data);
			console.log("🔍 data.specificProblem:", data.specificProblem);
			console.log("🔍 data.concern:", data.concern);

			if (response.ok) {
				const assistantMessage = {
					role: "assistant",
					content: data.response,
					timestamp: new Date(),
					aiAnalysis: data.aiAnalysis,
					systemType: data.systemType,
					// 🔥 Store the specific problem from API response for later extraction
					specificProblem: data.specificProblem,
					specificQuestion: data.specificQuestion,
				};

				setMessages((prev) => [...prev, assistantMessage]);

				// 🔥 Always update specific problem when available in API response
				if (data.specificProblem) {
					console.log(
						"💾 Updating latestSpecificProblem from API response:",
						data.specificProblem,
					);
					setLatestSpecificProblem(data.specificProblem);

					// Only set original question if not already set
					if (!originalUserQuestion) {
						console.log(
							"📝 Setting originalUserQuestion:",
							data.specificProblem,
						);
						setOriginalUserQuestion(data.specificProblem);
					}
				}

				// Also update concern if available
				if (data.concern) {
					console.log(
						"💾 Updating concern from API response:",
						data.concern,
					);
					setConcern(data.concern);
				}

				// 🔄 Refresh conversation history after message is saved
				// Add a small delay to ensure database save completes
				setTimeout(() => {
					console.log("🔄 Refreshing conversation history...", {
						currentUserId,
						sessionEmail: session?.user?.email,
					});
					loadConversationHistory(currentUserId);
				}, 2000); // Increased to 2 seconds for reliable database sync

				// Payment 觸發邏輯 - Check for couple analysis from API response
				console.log(
					"🔍 檢查 Payment 觸發條件:",
					data.needsBirthdayInfo,
					data.shouldTriggerModal,
					"isCoupleAnalysis:",
					data.isCoupleAnalysis,
				);

				// 🎯 Set couple analysis flag if couple birthdays detected
				if (data.hasCouplesBirthdays || data.isCoupleAnalysis) {
					console.log(
						"🎯 Setting couple analysis to true due to couple birthdays detected",
					);
					setIsCoupleAnalysis(true);
				}

				if (data.needsBirthdayInfo || data.shouldTriggerModal) {
					setNeedsBirthdayInfo(true);
					setConcern(data.concern || "");
					setReportType(data.reportType || "");

					// 🔥 保存原始用戶問題 - 每次都更新最新的具體問題
					console.log(
						"🔔 檢查 API 回應中的 specificProblem:",
						data.specificProblem,
					);
					let problemToUse = "";
					if (data.specificProblem) {
						setLatestSpecificProblem(data.specificProblem);
						console.log(
							"💾 更新最新具體問題:",
							data.specificProblem,
						);

						// 只在第一次時設置原始問題
						if (!originalUserQuestion) {
							setOriginalUserQuestion(data.specificProblem);
							console.log(
								"📝 設置原始問題:",
								data.specificProblem,
							);
						}
						problemToUse = data.specificProblem;
					}

					// 🚀 直接觸發付款，跳過價格頁面
					console.log(
						"💳 直接觸發付款 - concern:",
						data.concern,
						"problem:",
						problemToUse,
					);

					// 🔥 檢查付款類型，決定使用哪個 API
					console.log(
						"💳 檢查付款類型 - paymentType:",
						data.paymentType,
						"concern:",
						data.concern,
						"problem:",
						problemToUse,
					);

					// 決定使用哪個付款 API
					const useComprehensivePayment =
						data.paymentType === "comprehensive";
					const usePremiumPayment = data.paymentType === "premium";

					let paymentEndpoint;
					if (useComprehensivePayment) {
						paymentEndpoint = "/api/checkoutSessions/payment4"; // Expert88 ($88)
					} else if (usePremiumPayment) {
						paymentEndpoint = "/api/checkoutSessions/payment2"; // Premium ($188)
					} else {
						paymentEndpoint =
							"/api/checkoutSessions/payment-fortune-category"; // Fortune ($38) with specific concern types
					}

					console.log(
						`💳 使用付款端點: ${paymentEndpoint} (comprehensive: ${useComprehensivePayment}, premium: ${usePremiumPayment})`,
					);

					// 直接觸發付款 API
					try {
						setIsLoading(true);

						// 🔐 Check if user is logged in before payment
						if (!session) {
							console.log(
								"🔒 User not logged in, saving payment context",
							);

							// Determine payment type
							const paymentType = useComprehensivePayment
								? "comprehensive"
								: usePremiumPayment
									? "premium"
									: "fortune";

							// Save payment context to localStorage
							const paymentContext = {
								type: paymentType,
								locale: currentLocale,
								concern: data.concern,
								specificProblem: problemToUse,
								sessionId: sessionId,
								timestamp: Date.now(),
							};

							localStorage.setItem(
								"pendingPayment",
								JSON.stringify(paymentContext),
							);

							// Show login prompt message
							const loginPromptMessage = {
								role: "assistant",
								content:
									"請先登入以繼續付款。登入後將自動為您繼續處理。",
								timestamp: new Date(),
							};

							setMessages((prev) => [
								...prev,
								loginPromptMessage,
							]);

							// Redirect to login page with callback
							const loginUrl = `/${currentLocale}/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
							console.log("🔐 Redirecting to login:", loginUrl);

							setTimeout(() => {
								window.location.href = loginUrl;
							}, 1500);

							setIsLoading(false);
							return;
						}

						let paymentResponse;

						if (useComprehensivePayment || usePremiumPayment) {
							// Get fresh locale and region from localStorage for comprehensive/premium payments
							const storedRegion =
								localStorage.getItem("userRegion");
							const regionToLocaleMap = {
								china: "zh-CN",
								hongkong: "zh-TW",
								taiwan: "zh-TW",
							};
							const freshLocale =
								regionToLocaleMap[storedRegion] ||
								currentLocale ||
								"zh-TW";

							console.log(
								"💰 Smart-chat2 comprehensive/premium payment - Using fresh locale:",
								freshLocale,
								"from stored region:",
								storedRegion,
							);

							// 使用 Stripe Checkout Session APIs (payment4 或 payment2)
							paymentResponse = await fetch(paymentEndpoint, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									quantity: 1, // 固定數量
									directPayment: true, // 標記為直接付款
									locale: freshLocale, // Add locale parameter
									region: storedRegion, // Add region parameter for NTD support
								}),
							});
						} else {
							// 將 concern 從中文轉換為英文以符合 FortuneDataModal 期望
							const concernMapping = {
								財運: "financial",
								健康: "health",
								事業: "career",
								工作: "career",
								感情: "love",
							};

							const englishConcern =
								concernMapping[data.concern] || "financial";

							// Get fresh locale from localStorage to ensure consistency
							const storedRegion =
								localStorage.getItem("userRegion");
							const regionToLocaleMap = {
								china: "zh-CN",
								hongkong: "zh-TW",
								taiwan: "zh-TW",
							};
							const freshLocale =
								regionToLocaleMap[storedRegion] ||
								currentLocale;

							// Enhanced locale debugging
							console.log(
								"🔥🔥🔥 INDIVIDUAL PAYMENT LOCALE DEBUG 🔥🔥🔥",
							);
							console.log(
								"💰 About to call fortune payment with locale:",
								freshLocale,
							);
							console.log("🔍 All locale variables:");
							console.log("   - userRegion (state):", userRegion);
							console.log(
								"   - currentLocale (state):",
								currentLocale,
							);
							console.log(
								"   - storedRegion (localStorage):",
								storedRegion,
							);
							console.log(
								"   - freshLocale (calculated):",
								freshLocale,
							);
							console.log("   - pathname:", pathname);
							console.log(
								"   - regionToLocaleMap:",
								regionToLocaleMap,
							);
							console.log(
								"🔥🔥🔥 END INDIVIDUAL PAYMENT DEBUG 🔥🔥🔥",
							);

							// 使用 fortune category API 來支持不同 concern types
							const requestPayload = {
								concernType: englishConcern, // Use concernType for the category API
								specificProblem: problemToUse,
								fromChat: true,
								locale: freshLocale, // 🔥 Fix: Use fresh locale from localStorage
								region: storedRegion, // Add region parameter for NTD support
							};

							console.log(
								"📤 INDIVIDUAL PAYMENT REQUEST PAYLOAD:",
								requestPayload,
							);

							paymentResponse = await fetch(paymentEndpoint, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify(requestPayload),
							});
						}

						if (paymentResponse.ok) {
							const paymentData = await paymentResponse.json();
							console.log(
								`💳 ${useComprehensivePayment ? "Expert88 ($88)" : usePremiumPayment ? "Premium ($188)" : "Fortune ($38)"} Payment Response:`,
								paymentData,
							);

							if (useComprehensivePayment || usePremiumPayment) {
								// 處理 Expert88/Premium 回應 - 直接重定向到 Stripe URL
								if (paymentData.data?.url) {
									window.location.href = paymentData.data.url;
								} else {
									throw new Error(
										`No checkout URL received from ${usePremiumPayment ? "Premium" : "Expert88"} payment`,
									);
								}
							} else {
								// 處理 Fortune payment 回應 - 使用 Stripe.js
								// Handle different response structures
								const sessionId =
									paymentData.sessionId ||
									paymentData.data?.id;
								console.log(
									"Smart-chat2 extracted session ID:",
									sessionId,
								);

								if (sessionId) {
									// Import Stripe and redirect to checkout
									const stripePublicKey =
										process.env
											.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
									if (!stripePublicKey) {
										throw new Error(
											"Stripe public key not configured",
										);
									}

									const stripe = await import(
										"@stripe/stripe-js"
									).then((mod) =>
										mod.loadStripe(stripePublicKey),
									);

									if (stripe) {
										await stripe.redirectToCheckout({
											sessionId: sessionId,
										});
									} else {
										throw new Error(
											"Failed to load Stripe",
										);
									}
								} else {
									console.error(
										"No session ID found in smart-chat2 response:",
										paymentData,
									);
									throw new Error(
										"No session ID received from Fortune payment",
									);
								}
							}
						} else {
							const errorData = await paymentResponse.json();
							throw new Error(errorData.error || "Payment error");
						}
					} catch (paymentError) {
						console.error(
							`💳 ${useComprehensivePayment ? "Comprehensive ($88)" : usePremiumPayment ? "Premium ($188)" : "Fortune ($38)"} payment error:`,
							paymentError,
						);
						setIsLoading(false);
						// Show error message to user
						setMessages((prev) => [
							...prev,
							{
								role: "assistant",
								content:
									"抱歉，付款過程中出現錯誤。請稍後再試。",
								timestamp: new Date(),
								isError: true,
							},
						]);
					}
				}
			} else {
				throw new Error(data.error || "請求失敗");
			}
		} catch (error) {
			console.error("發送訊息失敗:", error);
			const errorMessage = {
				role: "assistant",
				content: "抱歉，發送訊息時出現錯誤。請稍後再試。",
				timestamp: new Date(),
				isError: true,
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// 處理快捷標籤點擊
	const handleShortcutClick = (shortcutText) => {
		setInputMessage(shortcutText);
		// 自動聚焦到輸入框
		setTimeout(() => {
			const textarea = document.querySelector("textarea");
			if (textarea) {
				textarea.focus();
			}
		}, 100);
	};

	// 生日表單提交處理
	const handleBirthdaySubmit = async (birthdayData) => {
		setShowBirthdayModal(false);
		setIsLoading(true);

		console.log("🔥 Birthday submit received:", birthdayData);

		// For couple analysis, generate URL and redirect directly (payment already completed)
		if (birthdayData.isCoupleAnalysis || isCoupleAnalysis) {
			console.log(
				"📊 Couple analysis detected, generating report URL...",
			);

			// 優先使用最新的具體問題，然後是原始問題，最後是 concern
			const problemToUse =
				latestSpecificProblem ||
				originalUserQuestion ||
				concern ||
				"感情關係和諧改善建議";

			console.log("🔍 DEBUG - URL生成時的狀態檢查:");
			console.log("   latestSpecificProblem:", latestSpecificProblem);
			console.log("   originalUserQuestion:", originalUserQuestion);
			console.log("   concern:", concern);
			console.log("   problemToUse:", problemToUse);

			const reportUrl =
				`/couple-report?` +
				`birthday=${encodeURIComponent(birthdayData.userBirthday)}&` +
				`birthday2=${encodeURIComponent(birthdayData.partnerBirthday)}&` +
				`gender=${encodeURIComponent(birthdayData.userGender)}&` +
				`gender2=${encodeURIComponent(birthdayData.partnerGender)}&` +
				`concern=${encodeURIComponent(concern)}&` +
				`originalProblem=${encodeURIComponent(problemToUse)}&` +
				`reportType=${encodeURIComponent(reportType)}`;

			console.log("🚀 Opening couple report:", reportUrl);
			window.open(reportUrl, "_blank");
			setIsLoading(false);
			return;
		}

		// For individual analysis, continue with API call
		try {
			const response = await fetch("/api/smart-chat2", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userBirthday: birthdayData.birthday,
					gender: birthdayData.gender,
					partnerBirthday: birthdayData.partnerBirthday,
					partnerGender: birthdayData.partnerGender,
					concern: concern,
					isCoupleAnalysis:
						isCoupleAnalysis || birthdayData.isCoupleAnalysis,
					reportType: reportType,
					messageType: "birthday_submission",
					sessionId: sessionId,
					userId: currentUserId,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			const assistantMessage = {
				role: "assistant",
				content: data.response || data.message,
				timestamp: new Date(),
				aiAnalysis: data.aiAnalysis,
				systemType: data.systemType,
			};

			setMessages((prev) => [...prev, assistantMessage]);

			// 注意：移除不必要的對話歷史重新載入，減少API呼叫
			// 對話歷史會在頁面初始化時載入，之後不需要重複載入

			// Open report in new window if URL is provided
			if (data.reportUrl) {
				console.log("Opening report:", data.reportUrl);
				window.open(data.reportUrl, "_blank");
			}
		} catch (error) {
			console.error("生日提交錯誤:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "抱歉，處理生日資料時發生錯誤。請稍後再試。",
					timestamp: new Date(),
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// 🔐 Resume payment after login
	const resumePayment = async (paymentContext) => {
		try {
			setIsLoading(true);
			console.log("💳 Resuming payment with context:", paymentContext);

			const stripePublicKey =
				process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
			if (!stripePublicKey) {
				throw new Error("Stripe public key not configured");
			}

			if (paymentContext.type === "couple") {
				// Resume couple payment
				const paymentResponse = await fetch("/api/payment-couple", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						locale: paymentContext.locale,
						specificProblem: paymentContext.specificProblem,
						concern: paymentContext.concern,
						fromChat: true,
						sessionId: paymentContext.sessionId,
					}),
				});

				if (paymentResponse.ok) {
					const paymentData = await paymentResponse.json();
					console.log(
						"💳 Resumed Couple Payment Response:",
						paymentData,
					);

					if (paymentData.sessionId) {
						const stripe = await import("@stripe/stripe-js").then(
							(mod) => mod.loadStripe(stripePublicKey),
						);

						if (stripe) {
							console.log("🚀 Redirecting to Stripe checkout");
							await stripe.redirectToCheckout({
								sessionId: paymentData.sessionId,
							});
						}
					}
				} else {
					throw new Error(
						`Payment API error: ${paymentResponse.status}`,
					);
				}
			} else if (paymentContext.type === "comprehensive") {
				// Resume comprehensive ($88) payment
				const paymentResponse = await fetch(
					"/api/checkoutSessions/payment4",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							quantity: 1,
							directPayment: true,
							locale: paymentContext.locale,
							region: localStorage.getItem("userRegion"),
						}),
					},
				);

				if (paymentResponse.ok) {
					const paymentData = await paymentResponse.json();
					if (paymentData.data?.url) {
						window.location.href = paymentData.data.url;
					}
				}
			} else if (paymentContext.type === "premium") {
				// Resume premium ($188) payment
				const paymentResponse = await fetch(
					"/api/checkoutSessions/payment2",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							quantity: 1,
							directPayment: true,
							locale: paymentContext.locale,
							region: localStorage.getItem("userRegion"),
						}),
					},
				);

				if (paymentResponse.ok) {
					const paymentData = await paymentResponse.json();
					if (paymentData.data?.url) {
						window.location.href = paymentData.data.url;
					}
				}
			} else if (paymentContext.type === "fortune") {
				// Resume fortune ($38) payment
				const concernMapping = {
					財運: "financial",
					健康: "health",
					事業: "career",
					工作: "career",
					感情: "love",
				};

				const englishConcern =
					concernMapping[paymentContext.concern] || "financial";

				const paymentResponse = await fetch(
					"/api/checkoutSessions/payment-fortune-category",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							concernType: englishConcern,
							specificProblem: paymentContext.specificProblem,
							fromChat: true,
							locale: paymentContext.locale,
							region: localStorage.getItem("userRegion"),
						}),
					},
				);

				if (paymentResponse.ok) {
					const paymentData = await paymentResponse.json();
					const sessionId =
						paymentData.sessionId || paymentData.data?.id;

					if (sessionId) {
						const stripe = await import("@stripe/stripe-js").then(
							(mod) => mod.loadStripe(stripePublicKey),
						);

						if (stripe) {
							await stripe.redirectToCheckout({ sessionId });
						}
					}
				}
			}
		} catch (error) {
			console.error("❌ Resume payment error:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "抱歉，恢復付款時出現錯誤。請重新選擇報告。",
					timestamp: new Date(),
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// 加載對話歷史
	const loadConversationHistory = async (userId) => {
		try {
			setIsLoadingHistory(true);

			// 如果userId看起來像email，使用userEmail參數，否則使用userId參數
			const isEmail = userId.includes("@");
			const queryParam = isEmail
				? `userEmail=${encodeURIComponent(userId)}`
				: `userId=${encodeURIComponent(userId)}`;

			const response = await fetch(
				`/api/conversation-history?${queryParam}`,
			);

			if (response.ok) {
				const data = await response.json();
				setConversationHistory(data.conversations || []);
			} else {
				console.error("加載對話歷史失敗:", response.statusText);
			}
		} catch (error) {
			console.error("加載對話歷史錯誤:", error);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	// 加載特定對話
	const loadSpecificConversation = async (conversationId) => {
		try {
			setIsLoading(true);
			const response = await fetch(
				`/api/load-conversation?conversationId=${encodeURIComponent(conversationId)}`,
			);

			if (response.ok) {
				const data = await response.json();

				// 設置對話訊息 - 修正數據格式轉換
				if (
					data.conversation &&
					Array.isArray(data.conversation) &&
					data.conversation.length > 0
				) {
					// 轉換消息格式以匹配前端期望的格式
					const formattedMessages = data.conversation.map(
						(msg, index) => ({
							role: msg.role,
							content: msg.content || "",
							timestamp: new Date(msg.timestamp),
							aiAnalysis: msg.aiAnalysis || null,
							systemType: msg.systemType || "smart-chat2",
							id: msg.id || `loaded-${index}`,
						}),
					);

					// 添加初始歡迎消息（如果還沒有）
					const hasWelcomeMessage = formattedMessages.some(
						(msg) =>
							msg.role === "assistant" &&
							msg.content.includes("歡迎來到智能風水顧問"),
					);

					if (!hasWelcomeMessage) {
						formattedMessages.unshift({
							role: "assistant",
							content:
								"你好呀～我是小鈴！✨ 歡迎回到智能風水顧問 Smart-Chat2 (AI版)！\n\n繼續您之前的對話...",
							timestamp: new Date(
								data.metadata?.createdAt || Date.now(),
							),
							aiAnalysis: null,
							systemType: "smart-chat2",
						});
					}

					setMessages(formattedMessages);
					setShowLandingPage(false); // 載入對話時隱藏落地頁
				} else {
					// 如果沒有消息，設置默認歡迎消息
					setMessages([
						{
							role: "assistant",
							content:
								"你好呀～我是小鈴！✨ 歡迎來到智能風水顧問 Smart-Chat2 (AI版)！\n\n這是您之前的對話，請繼續...",
							timestamp: new Date(),
							aiAnalysis: null,
							systemType: "smart-chat2",
						},
					]);
					setShowLandingPage(false); // 載入對話時隱藏落地頁
				}

				// 設置對話相關狀態
				if (data.metadata) {
					const metadata = data.metadata;
					setSessionId(
						metadata.sessionId || `smart-chat2-${Date.now()}`,
					);
					setConcern(metadata.primaryConcern || "");
					setIsCoupleAnalysis(
						metadata.userData?.relationshipType === "couple" ||
							false,
					);
					setReportType("");
				}

				console.log(
					"對話加載成功:",
					data.metadata?.title || conversationId,
				);
			} else {
				console.error("加載對話失敗:", response.statusText);
				// 加載失敗時顯示錯誤消息
				setMessages([
					{
						role: "assistant",
						content: "抱歉，無法加載該對話記錄。請嘗試創建新對話。",
						timestamp: new Date(),
						isError: true,
					},
				]);
			}
		} catch (error) {
			console.error("加載對話錯誤:", error);
			setMessages([
				{
					role: "assistant",
					content: "載入對話時發生錯誤，請稍後再試。",
					timestamp: new Date(),
					isError: true,
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// 創建新對話
	const createNewConversation = () => {
		setMessages([]);
		setInputMessage("");
		setConcern("");
		setIsCoupleAnalysis(false);
		setReportType("");
		setSessionId(`smart-chat2-${Date.now()}`);
		setShowLandingPage(true);
	};

	// 格式化時間顯示
	const formatConversationTime = (timestamp) => {
		if (!timestamp) return "";

		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now - date) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString("zh-TW", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (diffInHours < 24 * 7) {
			const days = Math.floor(diffInHours / 24);
			return `${days}天前`;
		} else {
			return date.toLocaleDateString("zh-TW", {
				month: "short",
				day: "numeric",
			});
		}
	};

	const getTopicBadgeColor = (topic) => {
		const colors = {
			感情: "bg-pink-100 text-pink-800",
			財運: "bg-yellow-100 text-yellow-800",
			工作: "bg-blue-100 text-blue-800",
			健康: "bg-green-100 text-green-800",
			人際關係: "bg-purple-100 text-purple-800",
			子女: "bg-orange-100 text-orange-800",
			因緣: "bg-indigo-100 text-indigo-800",
			其他: "bg-gray-100 text-gray-800",
		};
		return colors[topic] || colors["其他"];
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
			{/* Navigation Bar */}
			<ShopNavbar />
			<div className="relative flex h-screen mt-16">
				{/* 移動端菜單按鈕 */}
				<button
					className="fixed z-50 p-2 bg-white rounded-lg shadow-lg md:hidden top-4 left-4"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					{isMobileMenuOpen ? (
						<X className="w-6 h-6 text-gray-600" />
					) : (
						<Menu className="w-6 h-6 text-gray-600" />
					)}
				</button>

				{/* 左側邊欄 - 響應式設計 */}
				<div
					className={`
					${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
					md:translate-x-0 transition-transform duration-300 ease-in-out
					fixed md:relative z-40 w-80 md:w-80 bg-[#EFEFEF] flex flex-col h-full
				`}
				>
					{/* 建立新的對話 */}
					<div
						className="bg-[#E0E0E0] rounded-lg m-4 p-4 cursor-pointer hover:bg-[#d0d0d0] transition-colors"
						onClick={createNewConversation}
					>
						<div className="flex items-center space-x-3">
							<img
								src="/images/風水妹/風水妹.png"
								alt="小鈴"
								className="w-10 h-10 rounded-full"
								onError={(e) => {
									e.target.style.display = "none";
								}}
							/>
							<div className="flex-1">
								<span className="font-medium text-gray-800">
									建立新的對話
								</span>
							</div>
							<div className="text-xl text-gray-800">+</div>
						</div>
					</div>

					{/* 歷史對話 */}
					<div className="bg-[#E0E0E0] rounded-lg mx-4 mb-4">
						<div className="p-4 border-b border-[#d0d0d0]">
							<h3 className="flex items-center justify-between font-medium text-gray-800">
								歷史對話
								{isLoadingHistory && (
									<div className="w-4 h-4 border-b-2 border-gray-800 rounded-full animate-spin"></div>
								)}
							</h3>
						</div>
						<div className="p-2 overflow-y-auto max-h-48">
							{conversationHistory.length === 0 ? (
								<div className="p-3 text-sm text-center text-gray-600">
									{isLoadingHistory
										? "載入中..."
										: "尚無歷史對話"}
								</div>
							) : (
								conversationHistory.map((conversation) => (
									<div
										key={conversation.conversationId}
										className="p-3 hover:bg-[#d0d0d0] rounded cursor-pointer transition-colors mb-1"
										onClick={() =>
											loadSpecificConversation(
												conversation.conversationId,
											)
										}
									>
										<div className="text-sm font-medium text-gray-800 truncate">
											{conversation.title || "未命名對話"}
										</div>
										<div className="flex items-center justify-between mt-1 text-xs text-gray-600">
											<span>
												{formatConversationTime(
													conversation.lastUpdated,
												)}
											</span>
											<span className="bg-[#d0d0d0] text-gray-800 px-2 py-0.5 rounded-full text-xs">
												{conversation.messageCount || 0}
											</span>
										</div>
										{conversation.topics &&
											conversation.topics.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-2">
													{conversation.topics
														.slice(0, 2)
														.map((topic, index) => (
															<span
																key={index}
																className="text-xs bg-[#c0c0c0] text-gray-800 px-2 py-0.5 rounded"
															>
																{topic ===
																"工作"
																	? "事業"
																	: topic}
															</span>
														))}
													{conversation.topics
														.length > 2 && (
														<span className="text-xs text-gray-600">
															+
															{conversation.topics
																.length - 2}
														</span>
													)}
												</div>
											)}
									</div>
								))
							)}
						</div>
					</div>

					{/* 付費報告預覽 */}
					<div className="px-4 mb-4">
						<div className="p-4 transition-colors bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer hover:bg-gray-50">
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-800">
									付費報告預覽
								</span>
								<div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
									<svg
										className="w-5 h-5 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* 功能區域 */}
					<div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
						{/* 其他功能 */}
						<Link href="/demo?category=fengshui">
							<div
								className="bg-[#768976] rounded-lg py-7 mb-3 cursor-pointer hover:bg-[#6b7d6b] transition-colors relative overflow-hidden"
								style={{
									backgroundImage:
										"url(/images/chatbox/house.png)",
									backgroundSize: "cover",
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
								}}
							></div>
						</Link>

						<Link href="/demo?category=life">
							<div
								className="bg-[#768976] rounded-lg py-7 mb-3 cursor-pointer hover:bg-[#6b7d6b] transition-colors relative overflow-hidden"
								style={{
									backgroundImage:
										"url(/images/chatbox/life.png)",
									backgroundSize: "cover",
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
								}}
							></div>
						</Link>

						<Link href="/demo?category=relationship">
							<div
								className="bg-[#768976] rounded-lg py-7 mb-3 cursor-pointer hover:bg-[#6b7d6b] transition-colors relative overflow-hidden"
								style={{
									backgroundImage:
										"url(/images/chatbox/relationship.png)",
									backgroundSize: "cover",
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
								}}
							></div>
						</Link>

						<Link href="/demo?category=career">
							<div
								className="bg-[#768976] rounded-lg py-7 mb-3 cursor-pointer hover:bg-[#6b7d6b] transition-colors relative overflow-hidden"
								style={{
									backgroundImage:
										"url(/images/chatbox/career.png)",
									backgroundSize: "cover",
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
								}}
							></div>
						</Link>

						<Link href="/demo?category=wealth">
							<div
								className="bg-[#768976] rounded-lg py-7 mb-3 cursor-pointer hover:bg-[#6b7d6b] transition-colors relative overflow-hidden"
								style={{
									backgroundImage:
										"url(/images/chatbox/wealth.png)",
									backgroundSize: "cover",
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
								}}
							></div>
						</Link>

						<Link href="/demo?category=health">
							<div
								className="bg-[#768976] rounded-lg py-7 mb-3 cursor-pointer hover:bg-[#6b7d6b] transition-colors relative overflow-hidden"
								style={{
									backgroundImage:
										"url(/images/chatbox/health.png)",
									backgroundSize: "cover",
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
								}}
							></div>
						</Link>
					</div>
				</div>

				{/* 移動端遮罩層 */}
				{isMobileMenuOpen && (
					<div
						className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
				)}

				{/* 右側聊天區域 - 更新背景樣式和響應式設計 */}
				<div
					className="flex flex-col flex-1 md:ml-0"
					style={{
						backgroundColor: "#EFEFEF",
						backgroundImage:
							"url(/images/report/housing-report-bg.png)",
						backgroundSize: "60%", // Try: "contain", "cover", "50%", "200px 150px"
						backgroundPosition: "bottom right", // Try: "top left", "bottom right", "50% 25%"
						backgroundRepeat: "no-repeat",
						boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.25)",
						border: "3px solid #E0E0E0",
					}}
				>
					{/* 聊天界面 */}
					<div className="flex flex-col flex-1 h-full">
						{/* 消息區域 */}
						<div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] pt-16 md:pt-6">
							{showLandingPage ? (
								/* 落地頁 */
								<div className="flex flex-col items-center justify-center h-full">
									{/* HarmoniQ Logo和小鈴 */}
									<div className="flex flex-row items-center ">
										<img
											src="/images/風水妹/風水妹.png"
											alt="小鈴"
											className=" w-50 h-50 md:w-50 md:h-50"
											onError={(e) => {
												e.target.style.display = "none";
											}}
										/>
										<div
											className="text-6xl font-bold md:text-6xl"
											style={{
												width: "280px",
												height: "60px",
												background:
													"linear-gradient(45deg, #A3B116, #374A37)",
												WebkitBackgroundClip: "text",
												WebkitTextFillColor:
													"transparent",
												backgroundClip: "text",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: "serif",
											}}
										>
											HarmoniQ
										</div>
									</div>

									{/* 輸入框 */}
									<div className="w-full max-w-2xl px-4 md:px-0">
										<div className="flex items-center bg-white border border-gray-300 rounded-full shadow-lg">
											<textarea
												value={inputMessage}
												onChange={(e) =>
													setInputMessage(
														e.target.value,
													)
												}
												onKeyPress={handleKeyPress}
												placeholder="請輸入訊息"
												className="flex-1 px-4 py-3 text-sm text-black placeholder-gray-500 bg-transparent resize-none md:px-6 md:py-4 md:text-base focus:outline-none"
												rows={1}
												disabled={isLoading}
											/>
											<div className="flex items-center px-3 space-x-1 md:px-4 md:space-x-2">
												<button className="p-1.5 md:p-2 text-gray-400 transition-colors hover:text-gray-600">
													<Mic className="w-4 h-4 md:w-5 md:h-5" />
												</button>
												<button
													onClick={handleSendMessage}
													disabled={
														!inputMessage.trim() ||
														isLoading
													}
													className="p-1.5 md:p-2 text-purple-600 transition-colors hover:text-purple-700 disabled:text-gray-300 disabled:cursor-not-allowed"
												>
													<Send className="w-4 h-4 md:w-5 md:h-5" />
												</button>
											</div>
										</div>
									</div>

									{/* 快捷標籤 */}
									<div className="flex flex-wrap justify-center gap-2 px-4 mt-5 md:gap-3 md:px-0">
										<button
											onClick={() =>
												handleShortcutClick("健康運勢")
											}
											className="flex items-center px-4 py-2 space-x-2 text-xs font-medium text-gray-700 transition-shadow bg-white border border-gray-200 rounded-full shadow-md md:px-6 md:py-3 md:text-sm hover:shadow-lg hover:text-gray-900"
										>
											<div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
												<span className="text-sm text-green-600">
													🍃
												</span>
											</div>
											<span>健康運勢</span>
										</button>
										<button
											onClick={() =>
												handleShortcutClick("感情運勢")
											}
											className="flex items-center px-4 py-2 space-x-2 text-xs font-medium text-gray-700 transition-shadow bg-white border border-gray-200 rounded-full shadow-md md:px-6 md:py-3 md:text-sm hover:shadow-lg hover:text-gray-900"
										>
											<div className="flex items-center justify-center w-6 h-6 bg-pink-100 rounded-full">
												<span className="text-sm text-pink-600">
													🌸
												</span>
											</div>
											<span>感情運勢</span>
										</button>
										<button
											onClick={() =>
												handleShortcutClick("財運運勢")
											}
											className="flex items-center px-4 py-2 space-x-2 text-xs font-medium text-gray-700 transition-shadow bg-white border border-gray-200 rounded-full shadow-md md:px-6 md:py-3 md:text-sm hover:shadow-lg hover:text-gray-900"
										>
											<div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
												<span className="text-sm text-yellow-600">
													💰
												</span>
											</div>
											<span>財運運勢</span>
										</button>
										<button
											onClick={() =>
												handleShortcutClick("事業運勢")
											}
											className="flex items-center px-4 py-2 space-x-2 text-xs font-medium text-gray-700 transition-shadow bg-white border border-gray-200 rounded-full shadow-md md:px-6 md:py-3 md:text-sm hover:shadow-lg hover:text-gray-900"
										>
											<div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
												<span className="text-sm text-blue-600">
													💼
												</span>
											</div>
											<span>事業運勢</span>
										</button>
									</div>
								</div>
							) : (
								/* 正常聊天消息 */
								messages.map((message, index) => (
									<div
										key={index}
										className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
									>
										{message.role === "user" ? (
											/* 用戶消息樣式 - 黃色背景黑色文字 */
											<div
												className="max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl shadow-md"
												style={{
													backgroundColor: "#CFE117",
												}}
											>
												<div className="text-sm font-medium text-black">
													{message.content || ""}
												</div>
											</div>
										) : (
											/* AI助手消息樣式 - 白色背景配小鈴頭像 */
											<div className="max-w-[95%] md:max-w-[90%] bg-white rounded-2xl shadow-md border border-gray-200">
												{/* 助手頭像和標題 */}
												<div className="flex items-center p-3 md:p-4">
													<img
														src="/images/風水妹/風水妹.png"
														alt="小鈴"
														className="w-10 h-10 mr-2 rounded-full md:w-12 md:h-12 md:mr-3"
														onError={(e) => {
															e.target.style.display =
																"none";
														}}
													/>
													<div>
														<div className="text-sm font-medium text-black md:text-base">
															風水妹
														</div>
													</div>
												</div>

												{/* 消息內容 */}
												<div className="px-3 pb-2 md:px-4">
													<div className="text-sm leading-relaxed text-black whitespace-pre-wrap">
														{message.content || ""}
													</div>
												</div>

												{/* AI 分析結果顯示 */}
												{/* {message.aiAnalysis && (
													<div className="p-2 mx-3 mb-3 text-xs border rounded-lg md:p-3 md:mx-4 md:mb-4 bg-gray-50">
														<div className="flex items-center gap-2 mb-2">
															<Sparkles
																size={14}
																className="text-purple-600"
															/>
															<span className="font-medium text-gray-700">
																AI 分析結果
															</span>
														</div>

														<div className="space-y-2">
															<div className="flex items-center gap-2">
																<span className="text-gray-600">
																	話題:
																</span>
																<Badge
																	className={getTopicBadgeColor(
																		message
																			.aiAnalysis
																			.detectedTopic
																	)}
																>
																	{
																		message
																			.aiAnalysis
																			.detectedTopic
																	}
																</Badge>
															</div>

															<div className="flex items-center gap-2">
																<span className="text-gray-600">
																	範圍內:
																</span>
																<Badge
																	variant={
																		message
																			.aiAnalysis
																			.isWithinScope
																			? "default"
																			: "secondary"
																	}
																>
																	{message
																		.aiAnalysis
																		.isWithinScope
																		? "✅ 是"
																		: "❌ 否"}
																</Badge>
															</div>

															<div className="flex items-center gap-2">
																<span className="text-gray-600">
																	信心度:
																</span>
																<span className="font-mono text-sm text-purple-600">
																	{(
																		message
																			.aiAnalysis
																			.confidence *
																		100
																	).toFixed(
																		0
																	)}
																	%
																</span>
															</div>

															{message.aiAnalysis
																.specificProblem && (
																<div>
																	<span className="text-gray-600">
																		具體問題:
																	</span>
																	<p className="mt-1 text-xs text-gray-800">
																		{
																			message
																				.aiAnalysis
																				.specificProblem
																		}
																	</p>
																</div>
															)}
														</div>
													</div>
												)} */}

												{/* 時間戳 */}
												<div className="px-3 pb-2 md:px-4 md:pb-3">
													<div className="text-xs text-gray-500">
														{isClient
															? (() => {
																	const date =
																		new Date(
																			message.timestamp,
																		);
																	const hours =
																		date
																			.getHours()
																			.toString()
																			.padStart(
																				2,
																				"0",
																			);
																	const minutes =
																		date
																			.getMinutes()
																			.toString()
																			.padStart(
																				2,
																				"0",
																			);
																	const seconds =
																		date
																			.getSeconds()
																			.toString()
																			.padStart(
																				2,
																				"0",
																			);
																	return `${hours}:${minutes}:${seconds}`;
																})()
															: "--:--:--"}
														{/* {message.systemType && (
															<span className="ml-2 text-purple-600">
																•{" "}
																{
																	message.systemType
																}
															</span>
														)} */}
													</div>
												</div>
											</div>
										)}
									</div>
								))
							)}

							{isLoading && (
								<div className="flex justify-start">
									<div className="bg-white border border-gray-200 shadow-md rounded-2xl">
										<div className="flex items-center p-3 md:p-4">
											<img
												src="/images/風水妹/風水妹.png"
												alt="小鈴"
												className="w-10 h-10 mr-2 rounded-full md:w-12 md:h-12 md:mr-3"
												onError={(e) => {
													e.target.style.display =
														"none";
												}}
											/>
											<div>
												<div className="font-medium text-black">
													風水妹
												</div>
											</div>
										</div>
										<div className="px-3 pb-3 md:px-4 md:pb-4">
											<div className="flex items-center space-x-2">
												<span className="text-sm text-black">
													小鈴費神運算中
												</span>
												<Brain className="w-4 h-4 text-purple-600 animate-pulse" />
												<div className="flex space-x-1">
													<div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
													<div
														className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
														style={{
															animationDelay:
																"0.1s",
														}}
													></div>
													<div
														className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
														style={{
															animationDelay:
																"0.2s",
														}}
													></div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Scroll anchor */}
							<div ref={messagesEndRef} />
						</div>

						{/* 輸入區域 - 只在非落地頁時顯示 */}
						{!showLandingPage && (
							<div className="flex-shrink-0 p-3 border-t border-gray-200 md:p-4 ">
								<div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg">
									<textarea
										value={inputMessage}
										onChange={(e) =>
											setInputMessage(e.target.value)
										}
										onKeyPress={handleKeyPress}
										placeholder="輸入任何問題，小鈴會分析並引導你..."
										className="flex-1 px-4 py-2 text-sm text-black placeholder-gray-500 bg-transparent resize-none md:px-6 md:py-3 md:text-base focus:outline-none"
										rows={1}
										disabled={isLoading}
									/>
									<div className="flex items-center px-3 space-x-1 md:px-4 md:space-x-2">
										<button
											onClick={handleSendMessage}
											disabled={
												!inputMessage.trim() ||
												isLoading
											}
											className="p-1.5 md:p-2 text-purple-600 transition-colors hover:text-purple-700 disabled:text-gray-300 disabled:cursor-not-allowed"
										>
											<Send className="w-4 h-4 md:w-5 md:h-5" />
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 生日信息收集模態框 */}
			{showBirthdayModal && (
				<BirthdayModal
					isOpen={showBirthdayModal}
					onClose={() => setShowBirthdayModal(false)}
					onSubmit={handleBirthdaySubmit}
					concern={concern}
					isCoupleAnalysis={isCoupleAnalysis}
					reportType={reportType}
				/>
			)}
		</div>
	);
}
