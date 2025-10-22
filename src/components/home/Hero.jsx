"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import useMobile from "../../app/hooks/useMobile";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
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
							(diff / (1000 * 60 * 60)) % 24
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
					(prev) => (prev + 1) % backgroundOverlayEffects.length
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
			title: "填寫信息移動模組",
			subtitle: "輸入生辰八字 提交平面圖",
		},
		{
			num: 4,
			image: "/images/hero/hero-4-white.png",
			title: "解鎖專屬定製報告",
			subtitle: "收到詳細分析和建議",
		},
	];

	// MOBILE LAYOUT - Redesigned according to requirements
	if (isMobile) {
		return (
			<div className="relative w-full min-h-[40vh] overflow-hidden b">
				{/* Background Image */}
				<div className="absolute inset-0 z-0">
					<Image
						src="/images/hero/mainmobilebg.png" // <-- updated here
						alt="Hero background"
						fill
						className="object-cover object-center"
						priority={true}
					/>
				</div>

				{/* Background Overlay with animation */}
				{/* <div
					className={`absolute inset-0 z-1 transition-all duration-1000 ${
						bgFade ? "opacity-50" : "opacity-100"
					}`}
					style={{
						backgroundColor:
							backgroundOverlayEffects[bgOverlayIndex].color,
						opacity:
							backgroundOverlayEffects[bgOverlayIndex].opacity,
					}}
				/> */}

				{/* Main Content Container */}
				<div className="relative z-10 flex flex-col px-4 py-8 mt-15">
					{/* Header Section */}
					<div className="flex flex-col pt-5 pb-1">
						{/* HarmoniQ Brand Name - right aligned */}
						<p
							className="mb-1 ml-2"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "25px",
								color: "#E8E2DA",
								fontWeight: 800,
								lineHeight: "1",
							}}
						>
							{" "}
							打造您的
						</p>
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
						{/* Title2 */}
						<p className="px-2 text-start text-lg sm:text-xl  text-[#FEF8EF] font-nano-sans-hk">
							{t("title2")}
						</p>
						<div
							className="relative flex items-start mb-0 "
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
					</div>

					{/* Steps Section */}
					<div className="flex flex-col justify-center flex-1 px-2">
						{/* Steps Title with Subtitle1 and Button in a row */}
						<div className="flex justify-end mb-0">
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
						</div>
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
													backgroundSize: "50% auto",
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

				{/* Bottom Gradient Overlay */}
				<div
					className="absolute bottom-0 left-0 pointer-events-none right-6 z-5"
					style={{
						height: "80px",
						background:
							"linear-gradient(to bottom, transparent 0%, rgba(239, 239, 239, 0.1) 50%, rgba(239, 239, 239, 0.3) 100%)",
						borderTopLeftRadius: "30px",
						borderTopRightRadius: "30px",
					}}
				/>
			</div>
		);
	}

	// DESKTOP LAYOUT (keeping your existing desktop code)
	return (
		<div className="relative w-full overflow-hidden">
			<section
				className="relative flex items-center overflow-hidden"
				style={{
					fontFamily: "Noto Serif TC, serif",
					minHeight: "100vh",
					transform: `scale(${scaleRatio})`,
					transformOrigin: "top center",
					// width: `${100 / scaleRatio}%`,
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				{/* Static Background Image - Responsive (right side only) */}
				<div
					className="inset-0 z-0 "
					style={{ width: `${100 / scaleRatio}%` }}
				>
					<Image
						src={
							region === "china"
								? "/images/hero/hero-bg-china.png"
								: "/images/hero/hero-bg.png"
						}
						alt="Hero background"
						fill
						className="object-cover  scale-110 sm:object-left-top md:object-[left_top] lg:object-[left_top]"
						priority={true}
					/>
				</div>

				{/* Previous overlay for crossfade */}
				{/* <div
					className={`absolute inset-0 z-1 w-full transition-opacity duration-1000 ${bgFade ? "opacity-100" : "opacity-0"}`}
					style={{
						backgroundColor:
							backgroundOverlayEffects[prevBgOverlayIndex].color,
						opacity: bgFade
							? backgroundOverlayEffects[prevBgOverlayIndex]
									.opacity
							: 0,
					}}
				/> */}

				{/* Current overlay */}
				{/* <div
					className={`absolute inset-0 z-1 w-full transition-opacity duration-1000 ${bgFade ? "opacity-0" : "opacity-100"}`}
					style={{
						backgroundColor:
							backgroundOverlayEffects[bgOverlayIndex].color,
						opacity: bgFade
							? 0
							: backgroundOverlayEffects[bgOverlayIndex].opacity,
					}}
				/> */}

				{/* Title 1 above the line */}
				{/* <div
					className="absolute z-20 -translate-x-1/2 left-1/2"
					style={{
						top: "25%",
						left: "33%",
						width: "832px",
						height: "160px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						overflow: "hidden",
						pointerEvents: "none",
					}}
				> */}
				{/* <span
						className="block whitespace-nowrap"
						style={{
							fontSize: "95px",
							lineHeight: "160px",
							fontWeight: 800,
							color: "#FEF8EF",
							fontFamily: "Noto Serif TC, serif",
							width: "100%",
							textAlign: "center",
						}}
					>
						{t("title")}
					</span>
				</div> */}

				{/* Decorative: Centered White Horizontal Line */}
				{/* <div
					className="absolute left-0 right-0 z-10 pointer-events-none"
					style={{
						top: "45%",
						height: 0,
						borderTop: `${2 * scaleRatio}px solid #FEF8EF`,
						width: "100%",
						opacity: 0.7,
					}}
				/>
 */}
				{/* Decorative: Large White Circle on Left */}
				{/* <div
					className="absolute z-10 pointer-events-none"
					style={{
						top: "45%",
						left: "5vw",
						transform: "translateY(-50%)",
						width: `${525 * scaleRatio}px`,
						height: `${525 * scaleRatio}px`,
						border: `${2.5 * scaleRatio}px solid #FEF8EF`,
						borderRadius: "50%",
						background: "transparent",
						opacity: 0.7,
					}}
				/> */}

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
						)
					)}
				</div>

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
				{/* Button positioned further right */}
				<div
					className="absolute z-20"
					style={{
						top: "calc(43%)",
						right: "5%",
						pointerEvents: "auto",
					}}
				>
					<Link
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
					</Link>
				</div>

				{/* Extended Bottom Section - Creates seamless transition */}
				<div
					className="absolute bottom-0 left-0 right-0 z-5"
					style={{
						height: "200px",
						background:
							"linear-gradient(to bottom, transparent 0%, rgba(239, 239, 239, 0.3) 70%, rgba(239, 239, 239, 0.8) 100%)",
					}}
				/>
			</section>
		</div>
	);
}
