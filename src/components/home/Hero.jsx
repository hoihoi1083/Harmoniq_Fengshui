"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import useMobile from "../../app/hooks/useMobile";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useResponsiveScale } from "../../hooks/useResponsiveScale";
import { useRegionDetection } from "@/hooks/useRegionDetectionEnhanced";

export default function Hero() {
	const t = useTranslations("home.hero");
	const isMobile = useMobile();
	const { scaleRatio, isMobileLayout } = useResponsiveScale();
	const { region } = useRegionDetection();
	const [isClient, setIsClient] = useState(false);

	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [loading, setLoading] = useState(true);

	// Background overlay carousel state
	const [bgOverlayIndex, setBgOverlayIndex] = useState(0);
	const [prevBgOverlayIndex, setPrevBgOverlayIndex] = useState(0);
	const [bgFade, setBgFade] = useState(false);

	// Hero images carousel state (separate)
	const [heroIndex, setHeroIndex] = useState(0);

	// Desktop hero: two slides (0 = 為您結緣開運, 1 = 購買開運水晶) — auto or manual switch
	const [desktopHeroSlide, setDesktopHeroSlide] = useState(0);
	// Mobile hero: two-slide carousel (same as desktop)
	const [mobileHeroSlide, setMobileHeroSlide] = useState(0);

	// Desktop hero: drag to switch (mouse or touch)
	const [dragStartX, setDragStartX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const DRAG_THRESHOLD = 80;

	// Background overlay effects
	const backgroundOverlayEffects = [
		{ color: "#1C312E", opacity: 0.6 },
		{ color: "#1A3B2C", opacity: 0.5 },
		{ color: "#73897F", opacity: 0.1 },
	];

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		let timer;
		let end = null;

		const fetchEndTime = async () => {
			try {
				const res = await fetch("/api/countdown-end");
				const data = await res.json();
				end = data.endTime;

				const updateCountdown = () => {
					const diff = end - Date.now();
					if (diff <= 0) {
						setTimeLeft({
							days: 0,
							hours: 0,
							minutes: 0,
							seconds: 0,
						});
						clearInterval(timer);
					} else {
						const days = Math.floor(diff / (1000 * 60 * 60 * 24));
						const hours = Math.floor(
							(diff / (1000 * 60 * 60)) % 24,
						);
						const minutes = Math.floor((diff / (1000 * 60)) % 60);
						const seconds = Math.floor((diff / 1000) % 60);
						setTimeLeft({ days, hours, minutes, seconds });
					}
				};

				updateCountdown();
				timer = setInterval(updateCountdown, 1000);
			} catch (error) {
			} finally {
				setLoading(false);
			}
		};

		fetchEndTime();

		return () => clearInterval(timer);
	}, []);

	// Background overlay carousel effect
	useEffect(() => {
		const interval = setInterval(() => {
			setPrevBgOverlayIndex(bgOverlayIndex);
			setBgFade(true);
			setTimeout(() => {
				setBgOverlayIndex(
					(prev) => (prev + 1) % backgroundOverlayEffects.length,
				);
				setBgFade(false);
			}, 800);
		}, 3500);
		return () => clearInterval(interval);
	}, [bgOverlayIndex]);

	const handleBgOverlayClick = (idx) => {
		if (idx !== bgOverlayIndex) {
			setPrevBgOverlayIndex(bgOverlayIndex);
			setBgFade(true);
			setTimeout(() => {
				setBgOverlayIndex(idx);
				setBgFade(false);
			}, 800);
		}
	};

	const handleHeroDotClick = (idx) => {
		if (idx !== heroIndex) {
			setHeroIndex(idx);
		}
	};

	// Desktop hero: auto-advance every 5.5s
	useEffect(() => {
		if (isMobile) return;
		const interval = setInterval(() => {
			setDesktopHeroSlide((prev) => (prev + 1) % 2);
		}, 5500);
		return () => clearInterval(interval);
	}, [isMobile]);

	// Mobile hero: auto-advance every 5.5s (same as desktop)
	useEffect(() => {
		if (!isMobile) return;
		const interval = setInterval(() => {
			setMobileHeroSlide((prev) => (prev + 1) % 2);
		}, 5500);
		return () => clearInterval(interval);
	}, [isMobile]);

	const handleDesktopSlideDot = (idx) => {
		setDesktopHeroSlide(idx);
	};

	const mobileTouchStartXRef = useRef(0);
	const handleMobileHeroTouchStart = (e) => {
		if (!e.touches?.[0]) return;
		mobileTouchStartXRef.current = e.touches[0].clientX;
	};
	const handleMobileHeroTouchEnd = (e) => {
		if (!e.changedTouches?.[0]) return;
		const dx = e.changedTouches[0].clientX - mobileTouchStartXRef.current;
		if (Math.abs(dx) > DRAG_THRESHOLD) {
			setMobileHeroSlide((prev) => (dx > 0 ? 0 : 1));
		}
	};

	// Drag to switch desktop hero (mouse) — use ref for startX so move handler sees latest
	const dragStartXRef = useRef(0);
	const handleDesktopHeroMouseDown = (e) => {
		if (isMobile) return;
		setIsDragging(true);
		dragStartXRef.current = e.clientX;
		setDragStartX(e.clientX);
	};
	const handleDesktopHeroMouseMove = (e) => {
		if (!isDragging || isMobile) return;
		const dx = e.clientX - dragStartXRef.current;
		if (Math.abs(dx) > DRAG_THRESHOLD) {
			if (dx > 0) setDesktopHeroSlide(0);
			else setDesktopHeroSlide(1);
			setIsDragging(false);
		}
	};
	const handleDesktopHeroMouseUp = () => {
		setIsDragging(false);
	};

	// Attach mouse move/up to window when dragging so we don't lose cursor
	useEffect(() => {
		if (isMobile || !isDragging) return;
		window.addEventListener("mousemove", handleDesktopHeroMouseMove);
		window.addEventListener("mouseup", handleDesktopHeroMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleDesktopHeroMouseMove);
			window.removeEventListener("mouseup", handleDesktopHeroMouseUp);
		};
	}, [isMobile, isDragging]);

	// Touch to switch desktop hero (e.g. trackpad or touch screen on desktop)
	const handleDesktopHeroTouchStart = (e) => {
		if (isMobile) return;
		dragStartXRef.current = e.touches[0].clientX;
	};
	const handleDesktopHeroTouchEnd = (e) => {
		if (isMobile) return;
		const endX = e.changedTouches[0].clientX;
		const dx = endX - dragStartXRef.current;
		if (Math.abs(dx) > DRAG_THRESHOLD) {
			if (dx > 0) setDesktopHeroSlide(0);
			else setDesktopHeroSlide(1);
		}
	};

	const links = {
		social: [
			{
				icon: "/images/footer/Facebook.png",
				href: "https://www.facebook.com/profile.php?id=61578389876952",
			},
			{
				icon: "/images/footer/Instagram.png",
				href: "https://www.instagram.com/harmoniq_fengshui/",
			},
			{
				icon: "/images/footer/thread-grey.png",
				href: "https://www.threads.net",
			},
		],
	};
	const steps = [
		{
			num: 1,
			image: "/images/hero/hero-1-white.png",
			title: "風鈴聊天室",
			subtitle: "免費測評房間/命理",
		},
		{
			num: 2,
			image: "/images/hero/hero-2-white.png",
			title: "選擇報告",
			subtitle: "挑選心儀測算模式",
		},
		{
			num: 3,
			image: "/images/hero/hero-3-white.png",
			title: "填寫信息",
			subtitle: "輸入生辰八字",
		},
		{
			num: 4,
			image: "/images/hero/hero-4-white.png",
			title: "解鎖專屬定製報告",
			subtitle: "收到詳細分析和建議",
		},
	];

	// MOBILE LAYOUT — two-slide carousel (same as desktop: touch, dots, auto-advance)
	if (isMobile) {
		return (
			<div
				className="relative w-full min-h-[750px]   overflow-hidden select-none"
				onTouchStart={handleMobileHeroTouchStart}
				onTouchEnd={handleMobileHeroTouchEnd}
			>
				{/* Mobile Slide 0 */}
				<div
					className="absolute inset-0 z-[5] transition-opacity duration-500"
					style={{
						opacity: mobileHeroSlide === 0 ? 1 : 0,
						pointerEvents: mobileHeroSlide === 0 ? "auto" : "none",
					}}
				>
					<div className="absolute inset-0 z-0">
						<Image
							src={
								region === "china"
									? "/images/hero/hero-bg-2.png"
									: "/images/hero/hero-bg-2.png"
							}
							alt="Hero background"
							fill
							className="object-cover object-right"
							priority={true}
						/>
					</div>
					<div
						className="absolute inset-0 z-[1]"
						style={{
							background:
								"linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
						}}
					/>
					<div className="relative z-10 flex flex-col px-4 py-8 mt-15">
						{/* Header Section */}
						<div className="flex flex-col pt-5 pb-1">
							{/* HarmoniQ Brand Name - right aligned */}
							{/* Main Title */}
							<h1
								className="justify-center px-2 mb-8 text-[60px] sm:text-[90px] md:text-[100px] text-start"
								style={{
									fontFamily: "Noto Serif TC, serif",
									fontWeight: 800,
									color: "#E8E2DA",
									lineHeight: "1.2",
									textShadow: "0 2px 4px rgba(0,0,0,0.3)",
									letterSpacing: "0.1em",
								}}
							>
								{t("title")}
							</h1>
							<div
								className="relative flex items-start mb-2 "
								style={{ minHeight: "60px" }}
							>
								<div className="w-full ml-2">
									<p className="text-base sm:text-lg font-nano-sans-hk  text-[#FEF8EF] mb-0">
										{t("subtitle1")}
									</p>
									<p className="text-base sm:text-lg font-nano-sans-hk  text-[#FEF8EF] mb-2">
										{t("subtitle2")}
									</p>
								</div>
							</div>
							<div className="ml-2">
								<Link
									href="/shop/all"
									className="inline-flex items-center justify-center rounded-full font-bold w-fit transition-transform duration-200 active:scale-95 hover:scale-105"
									style={{
										height: "42px",
										marginBottom: "10px",
										padding: "0 40px",
										fontSize: "16px",
										fontFamily: "noto sans hk",
										fontWeight: 900,
										backgroundColor: "#A3B116",
										letterSpacing: "0.01em",
										color: "#FFFFFF",
										boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
									}}
								>
									{t("shopCta")}
								</Link>
							</div>
						</div>

						{/* Steps Section */}
						<div className="flex flex-col justify-center flex-1 px-2">
							{/* Steps Title with Subtitle1 and Button in a row */}
							{/* <div className="flex justify-end mb-0">
							<Link
								href="/"
								className="flex items-center justify-center transition-transform duration-200 active:scale-95 hover:scale-105"
							>
								<Image
									src="/images/風水妹/chart-button.png"
									alt={t("cta")}
									width={180}
									height={10}
									className="cursor-pointer"
									style={{
										filter: "drop-shadow(0 8px 32px rgba(163, 177, 22, 0.22))",
									}}
								/>
							</Link>
						</div> */}
							{/* Steps Container - Single Container with 80% width and 165px height */}
							<div className="relative flex flex-row w-full ">
								{/* Single Steps Container */}
								<div
									className="relative p-3 border w-[90%] shadow-xl backdrop-blur-sm bg-white/15 border-white/30 rounded-3xl"
									style={{
										minHeight: "180px",
										height: "180px",
									}}
								>
									{/* Steps Grid - 2x2 Layout */}
									<div className="grid h-full grid-cols-2 gap-2">
										{steps.map((step, index) => (
											<div
												key={step.num}
												className="relative flex flex-col items-start justify-start p-1 overflow-hidden rounded-xl"
												style={{
													minHeight: "70px",
												}}
											>
												{/* Background Image */}
												<div
													className="absolute inset-0 z-0 rounded-xl"
													style={{
														backgroundImage: `url(${step.image})`,
														backgroundSize:
															"50% auto",
														backgroundPosition:
															"85% 30%",
														backgroundRepeat:
															"no-repeat",
														opacity: 0.7,
													}}
												/>

												{/* Large Number in Background */}
												<div
													className="absolute inset-0 flex items-start justify-start z-1"
													style={{
														fontSize: "60px",
														fontWeight: "900",
														color: "rgba(232, 226, 218, 0.35)",
														fontFamily:
															"Noto Serif TC, serif",
														lineHeight: "1",
														pointerEvents: "none",
													}}
												>
													{step.num}
												</div>

												{/* Content overlay */}
												<div className="relative z-10 flex flex-col items-center justify-center h-full space-y-1 text-center">
													{/* Step Content */}
													<div className="px-1 space-y-1">
														<h4
															className="text-[#FEF8EF] font-bold text-sm sm:text-[20px] leading-tight"
															style={{
																fontFamily:
																	"Noto Sans HK, sans-serif",
																textShadow:
																	"0 1px 2px rgba(0,0,0,0.5)",
															}}
														>
															{step.title}
														</h4>
														<p
															className="text-[#FEF8EF] text-[10px] sm:text-[14px] opacity-90 leading-tight"
															style={{
																fontFamily:
																	"Noto Sans HK, sans-serif",
																textShadow:
																	"0 1px 2px rgba(0,0,0,0.5)",
															}}
														>
															{step.subtitle}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Spacing */}
						<div className="flex-shrink-0 h-8" />
					</div>
				</div>

				{/* Mobile Slide 1: same words as image + step container, same level as slide 0 */}
				<div
					className="absolute inset-0 z-[5] transition-opacity duration-500"
					style={{
						opacity: mobileHeroSlide === 1 ? 1 : 0,
						pointerEvents: mobileHeroSlide === 1 ? "auto" : "none",
					}}
				>
					<div
						className="absolute inset-0 z-0"
						style={{ backgroundColor: "#E8E2DA" }}
					>
						<Image
							src={"/images/hero/hero-bg-2.2.png"}
							alt="Hero background"
							fill
							className="object-cover object-bottom"
							priority={true}
						/>
					</div>
					<div
						className="absolute inset-0 z-[1]"
						style={{
							background:
								"linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
						}}
					/>
					<div className="relative z-10 flex flex-col px-4 py-8 mt-15">
						<div className="flex flex-col pt-5 pb-1">
							<h1
								className="justify-center px-2 mb-2 text-[35px] sm:text-[40px] md:text-[50px] text-start"
								style={{
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontWeight: 900,
									color: "#99A800",
									textShadow: "0 1px 2px rgba(0,0,0,0.1)",
								}}
							>
								{t("slide2Title")}
							</h1>
							<div
								className="relative flex items-start mb-2 "
								style={{ minHeight: "60px" }}
							>
								<div className="w-full ">
									<h1
										className="justify-center px-2 mb-2 text-[40px] sm:text-[40px] md:text-[50px] text-start"
										style={{
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											fontWeight: 600,
											color: "#333",
										}}
									>
										{t("slide2Subtitle")}
									</h1>
									<p
										className="px-2 text-start text-base font-nano-sans-hk mb-4"
										style={{ color: "#333" }}
									>
										{t("slide2Description")}
									</p>
								</div>
							</div>
							<div className="ml-2">
								<Link
									href="/shop/all"
									className="inline-flex items-center justify-center rounded-full font-bold w-fit transition-transform duration-200 active:scale-95 hover:scale-105"
									style={{
										height: "42px",
										marginBottom: "10px",
										padding: "0 40px",
										fontSize: "16px",
										fontFamily: "noto sans hk",
										fontWeight: 900,
										backgroundColor: "#A3B116",
										letterSpacing: "0.01em",
										color: "#FFFFFF",
										boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
									}}
								>
									{t("shopCta")}
								</Link>
							</div>
						</div>
						<div className="flex flex-col justify-center flex-1 px-2">
							<div className="relative flex flex-row w-full ">
								<div
									className="relative p-3 border w-[90%] shadow-xl backdrop-blur-sm bg-[#676769] border-white/30 rounded-3xl"
									style={{
										minHeight: "180px",
										height: "180px",
									}}
								>
									<div className="grid h-full grid-cols-2 gap-2">
										{steps.map((step) => (
											<div
												key={step.num}
												className="relative flex flex-col items-start justify-start p-1 overflow-hidden rounded-xl"
												style={{ minHeight: "70px" }}
											>
												<div
													className="absolute inset-0 z-0 rounded-xl"
													style={{
														backgroundImage: `url(${step.image})`,
														backgroundSize:
															"50% auto",
														backgroundPosition:
															"85% 30%",
														backgroundRepeat:
															"no-repeat",
														opacity: 0.7,
													}}
												/>
												<div
													className="absolute inset-0 flex items-start justify-start z-1"
													style={{
														fontSize: "60px",
														fontWeight: "900",
														color: "rgba(232, 226, 218, 0.35)",
														fontFamily:
															"Noto Serif TC, serif",
														lineHeight: "1",
														pointerEvents: "none",
													}}
												>
													{step.num}
												</div>
												<div className="relative z-10 flex flex-col items-center justify-center h-full space-y-1 text-center">
													<div className="px-1 space-y-1">
														<h4
															className="text-[#FEF8EF] font-bold text-sm sm:text-[20px] leading-tight"
															style={{
																fontFamily:
																	"Noto Sans HK, sans-serif",
																textShadow:
																	"0 1px 2px rgba(0,0,0,0.5)",
															}}
														>
															{step.title}
														</h4>
														<p
															className="text-[#FEF8EF] text-[10px] sm:text-[14px] opacity-90 leading-tight"
															style={{
																fontFamily:
																	"Noto Sans HK, sans-serif",
																textShadow:
																	"0 1px 2px rgba(0,0,0,0.5)",
															}}
														>
															{step.subtitle}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
						<div className="flex-shrink-0 h-8" />
					</div>
				</div>

				<div
					className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3"
					style={{ pointerEvents: "auto" }}
				>
					{[0, 1].map((idx) => (
						<button
							key={idx}
							type="button"
							aria-label={idx === 0 ? "Slide 1" : "Slide 2"}
							onClick={() => setMobileHeroSlide(idx)}
							className="rounded-full transition-all duration-300"
							style={{
								width: mobileHeroSlide === idx ? 24 : 10,
								height: 10,
								backgroundColor:
									mobileHeroSlide === idx
										? "#8DC63F"
										: "rgba(0,0,0,0.2)",
							}}
						/>
					))}
				</div>

				<div
					className="absolute bottom-0 left-0 pointer-events-none right-6 z-5 transition-opacity duration-300"
					style={{
						height: "80px",
						background:
							"linear-gradient(to bottom, transparent 0%, rgba(239,239,239,0.1) 50%, rgba(239,239,239,0.3) 100%)",
						borderTopLeftRadius: "30px",
						borderTopRightRadius: "30px",
						opacity: mobileHeroSlide === 0 ? 1 : 0,
					}}
				/>
			</div>
		);
	}

	// DESKTOP LAYOUT — two slides with auto/manual switch
	return (
		<div className="relative w-full">
			<section
				className="relative flex items-center h-[90vh] w-full select-none"
				style={{
					fontFamily: "Noto Serif TC, serif",
					margin: 0,
					padding: 0,
					overflow: "hidden",
					cursor: "default",
				}}
				onMouseDown={handleDesktopHeroMouseDown}
				onMouseLeave={handleDesktopHeroMouseUp}
				onTouchStart={handleDesktopHeroTouchStart}
				onTouchEnd={handleDesktopHeroTouchEnd}
			>
				{/* ========== SLIDE 0: 為您結緣開運 (current) ========== */}
				<div
					className="absolute inset-0 z-[5] transition-opacity duration-500"
					style={{
						opacity: desktopHeroSlide === 0 ? 1 : 0,
						pointerEvents: desktopHeroSlide === 0 ? "auto" : "none",
					}}
				>
					<div className="absolute inset-0 z-0 w-full h-full">
						<Image
							src={
								region === "china"
									? "/images/hero/hero-bg-2.png"
									: "/images/hero/hero-bg-2.png"
							}
							alt="Hero background"
							fill
							className="object-cover w-full h-full"
							style={{
								objectFit: "cover",
								width: "100%",
								height: "100%",
							}}
							priority={true}
						/>
					</div>
					<div
						className="absolute inset-0 z-[1]"
						style={{
							background:
								"linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
						}}
					/>
					{/* Circles */}
					<div
						className="absolute z-10 pointer-events-none"
						style={{
							top: "50%",
							left: "22%",
							transform: "translate(-50%, -50%)",
							width: "980px",
							height: "980px",
							border: "130px solid rgba(255, 255, 255, 0.08)",
							borderRadius: "50%",
							background: "transparent",
						}}
						aria-hidden="true"
					/>
					<div
						className="absolute z-10 pointer-events-none"
						style={{
							top: "50%",
							left: "22%",
							transform: "translate(-50%, -50%)",
							width: "520px",
							height: "520px",
							border: "2px solid rgba(255, 255, 255, 0.7)",
							borderRadius: "50%",
							background: "transparent",
						}}
						aria-hidden="true"
					/>
					<div
						className="absolute left-0 right-0 z-10 pointer-events-none"
						style={{
							top: "52%",
							height: 0,
							borderTop: "1px solid rgba(255, 255, 255, 0.6)",
							width: "100%",
						}}
						aria-hidden="true"
					/>
					<div
						className="absolute left-0 top-20 bottom-0 z-20 flex flex-col justify-center pl-[8vw] pr-[20%] md:pl-[10vw] md:pr-[35%]"
						style={{
							writingMode: "horizontal-tb",
							direction: "ltr",
						}}
					>
						<h1
							className="font-bold mb-6"
							style={{
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
								fontSize: "clamp(58px, 5vw, 68px)",
								lineHeight: "1.1",
								letterSpacing: "0.02em",
								color: "#FFFFFF",
								textShadow: "0 2px 12px rgba(0,0,0,0.3)",
								writingMode: "horizontal-tb",
								whiteSpace: "nowrap",
							}}
						>
							{t("title")}
						</h1>
						<p
							className="mb-8"
							style={{
								fontFamily: "noto sans hk",
								fontSize: "clamp(15px, 1.2vw, 18px)",
								lineHeight: "1.7",
								color: "rgba(255, 255, 255, 0.95)",
								textShadow: "0 1px 6px rgba(0,0,0,0.3)",
								maxWidth: "560px",
								writingMode: "horizontal-tb",
							}}
						>
							{t("heroDescription")}
						</p>
						<Link
							href="/shop/all"
							className="inline-flex items-center justify-center rounded-full font-bold w-fit transition-transform duration-200 hover:scale-105"
							style={{
								height: "42px",
								padding: "0 40px",
								fontSize: "16px",
								fontFamily: "noto sans hk",
								fontweight: "900",
								backgroundColor: "#A3B116",
								letterSpacing: "0.01em",
								color: "#FFFFFF",
								boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
							}}
						>
							{t("shopCta")}
						</Link>
					</div>
					{/* Chart CTA (slide 0 only) */}
					<div
						className="absolute z-20"
						style={{
							top: "calc(43%)",
							right: "5%",
							pointerEvents: "auto",
						}}
					>
						{/* <Link
							href="/"
							className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
						>
							<Image
								src="/images/風水妹/chart-button.png"
								alt={t("cta")}
								width={400}
								height={150}
								className="cursor-pointer w-[300px] h-[300px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px]"
								style={{
									filter: "drop-shadow(0 8px 32px rgba(163, 177, 22, 0.22))",
								}}
							/>
						</Link> */}
					</div>
				</div>

				{/* ========== SLIDE 1: 購買開運水晶 (left text + right image area) ========== */}
				<div
					className="absolute inset-0 z-[5] transition-opacity duration-500"
					style={{
						opacity: desktopHeroSlide === 1 ? 1 : 0,
						pointerEvents: desktopHeroSlide === 1 ? "auto" : "none",
					}}
				>
					{/* Background image for slide 1 */}
					<div className="absolute inset-0 z-0 w-full h-[100vh]">
						<Image
							src="/images/hero/hero-bg-2.2.png"
							alt=""
							fill
							className="object-cover"
							style={{ objectFit: "cover" }}
						/>
					</div>
					{/* Optional dark gradient overlay for text readability */}
					{/* <div
						className="absolute inset-0 z-[1]"
						style={{
							background:
								"linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 50%)",
						}}
					/> */}
					{/* Left: text block — same position as Slide 0 (absolute top-20 bottom-0, same padding) */}
					<div
						className="absolute left-0 top-20 bottom-0 z-10 flex flex-col justify-center pl-[8vw] pr-[20%] md:pl-[10vw] md:pr-[35%]"
						style={{
							writingMode: "horizontal-tb",
							direction: "ltr",
						}}
					>
						{/* Rectangular shape with blur behind text */}
						<div
							className="absolute rounded-2xl -z-10"
							style={{
								left: "-0.5rem",
								right: "26.5rem",
								top: "7.5rem",
								bottom: "7.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.45)",
								backdropFilter: "blur(1px)",
								WebkitBackdropFilter: "blur(4px)",
							}}
						/>
						<div className="relative z-0">
							<h1
								className="font-bold mb-0"
								style={{
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontSize: "clamp(45px, 4.2vw, 56px)",
									lineHeight: "1.15",
									color: "#99A800",
								}}
							>
								{t("slide2Title")}
							</h1>
							<h2
								className="font-bold mb-6"
								style={{
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontSize: "clamp(64px, 2.2vw, 32px)",
									lineHeight: "1.3",
									color: "#191A23",
								}}
							>
								{t("slide2Subtitle")}
							</h2>
							<p
								className="mb-5"
								style={{
									fontFamily: "noto sans hk",
									fontSize: "clamp(18px, 1.1vw, 17px)",
									color: "black",
									maxWidth: "520px",
								}}
							>
								{t("slide2Description")}
							</p>
							<Link
								href="/shop/all"
								className="inline-flex items-center justify-center rounded-full font-bold w-fit transition-transform duration-200 hover:scale-105"
								style={{
									height: "42px",
									padding: "0 40px",
									fontSize: "16px",
									fontFamily: "noto sans hk",
									fontweight: "900",
									backgroundColor: "#A3B116",
									letterSpacing: "0.01em",
									color: "#FFFFFF",
									boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
								}}
							>
								{t("shopCta")}
							</Link>
						</div>
					</div>
				</div>

				{/* Desktop hero carousel dots */}
				<div
					className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3"
					style={{ pointerEvents: "auto" }}
				>
					{[0, 1].map((idx) => (
						<button
							key={idx}
							type="button"
							aria-label={idx === 0 ? "Slide 1" : "Slide 2"}
							onClick={() => handleDesktopSlideDot(idx)}
							className="rounded-full transition-all duration-300"
							style={{
								width: idx === desktopHeroSlide ? 24 : 10,
								height: 10,
								backgroundColor:
									idx === desktopHeroSlide
										? "#8DC63F"
										: "rgba(0, 0, 0, 0.2)",
							}}
						/>
					))}
				</div>

				{/* Social icons at top right */}
				<div
					className="fixed flex flex-col space-y-8 z-390"
					style={{
						pointerEvents: "auto",
						top: "90px",
						right: "82px",
					}}
				>
					{links.social.map((social, index) =>
						social.href ? (
							<a
								key={index}
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								className="transition-opacity hover:opacity-80"
							>
								<Image
									src={social.icon}
									alt=""
									width={40}
									height={40}
									style={{
										filter: "brightness(0) invert(0.7)",
									}}
								/>
							</a>
						) : (
							<Image
								key={index}
								src={social.icon}
								alt=""
								width={30}
								height={30}
								style={{ filter: "brightness(0) invert(0.7)" }}
							/>
						),
					)}
				</div>

				{/* Extended Bottom Section - Creates seamless transition */}
				<div
					className="absolute bottom-0 left-0 right-0 z-[4]"
					style={{
						height: "200px",
						background:
							"linear-gradient(to bottom, transparent 0%, rgba(239, 239, 239, 0.3) 70%, rgba(239, 239, 239, 0.8) 100%)",
					}}
				/>

				{/* Group below the line: title2, subtitle1 */}
				{/* <div
					className="absolute z-20 flex flex-col items-start -translate-x-1/2 left-[40%]"
					style={{
						top: "calc(38% + 60px)",
						width: "947px",
						pointerEvents: "none",
					}}
				>
					<span
						className="block whitespace-nowrap"
						style={{
							fontSize: "25px",
							lineHeight: "36px",
							fontWeight: 500,
							color: "#FEF8EF",
							fontFamily: "Noto Serif TC, serif",
							textAlign: "start",
						}}
					>
						{t("title2")}
					</span>
					<span
						className="block mt-2 whitespace-nowrap"
						style={{
							fontSize: "25px",
							lineHeight: "36px",
							fontWeight: 500,
							color: "#FEF8EF",
							fontFamily: "Noto Serif TC, serif",
							textAlign: "start",
						}}
					>
						{t("subtitle1")}
					</span>
				</div>
 */}
			</section>
		</div>
	);
}
