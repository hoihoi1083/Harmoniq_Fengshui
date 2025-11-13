"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
	DotButton,
	useDotButton,
	CarouselControls,
} from "./EmblaCarouselDotButton";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "@/lib/embla-carousel-autoplay/src";
import { useResponsiveScale } from "../../../hooks/useResponsiveScale";
import "./css/embla.css";

const slideData = [
	{
		img: "/images/hero/slide1.jpg",
		author: "Mr. & Mrs Wong",
		profileKey: "p1",
		commentKey: "c1",
	},
	{
		img: "/images/hero/slide2.jpg",
		author: "Patrick & Sharon",
		profileKey: "p2",
		commentKey: "c2",
	},
	{
		img: "/images/hero/slide3.jpg",
		author: "Amanda",
		profileKey: "p3",
		commentKey: "c3",
	},
	{
		img: "/images/hero/slide4.jpg",
		author: "Mr & Mrs Cheng",
		profileKey: "p4",
		commentKey: "c4",
	},
	{
		img: "/images/hero/slide5.jpg",
		author: "Steven",
		profileKey: "p5",
		commentKey: "c5",
	},
];

// Animation variants for vertical movement (cards only)
const cardVariants = {
	front: {
		y: 0,
		scale: 1,
		zIndex: 10,
		opacity: 1,
	},
	back: {
		y: -80,
		scale: 0.95,
		zIndex: 5,
		opacity: 0.8,
	},
	exit: {
		y: 80,
		scale: 0.9,
		opacity: 0,
		transition: { duration: 0.5 },
	},
};

export default function CommentsCarousel() {
	const t = useTranslations("home.comments");
	const { scaleRatio, isMobileLayout } = useResponsiveScale();
	const [currentCardIndex, setCurrentCardIndex] = useState(0);

	// Mobile carousel setup with partial view options
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: true,
			align: "center",
			containScroll: "trimSnaps",
			slidesToScroll: 1,
		},
		[Autoplay({ playOnInit: true, delay: 4000 })]
	);
	const { selectedIndex, scrollSnaps, onDotButtonClick } =
		useDotButton(emblaApi);

	const ratings = [4.9, 5.0, 4.8, 4.8, 4.9];

	// Auto animate cards every 4 seconds for desktop
	useEffect(() => {
		if (!isMobileLayout) {
			const interval = setInterval(() => {
				setCurrentCardIndex((prev) => (prev + 1) % slideData.length);
			}, 4000);
			return () => clearInterval(interval);
		}
	}, [isMobileLayout]);

	// Sync Embla carousel with state for mobile
	useEffect(() => {
		if (emblaApi && isMobileLayout) {
			const onSelect = () => {
				setCurrentCardIndex(emblaApi.selectedScrollSnap());
			};
			emblaApi.on("select", onSelect);
			return () => emblaApi.off("select", onSelect);
		}
	}, [emblaApi, isMobileLayout]);

	const getNextCardIndex = (currentIndex) => {
		return (currentIndex + 1) % slideData.length;
	};

	// Mobile Layout - horizontal carousel with green background and side previews
	if (isMobileLayout) {
		return (
			<div className="w-full px-4 py-0">
				<div className="relative">
					{/* Green Rectangle Background */}
					<div
						className="absolute z-0 "
						style={{
							width: "600px", // Slightly wider to accommodate side previews
							height: "200px",
							backgroundColor: "#374A37",
							borderRadius: "15px",
							top: "80%",
							transform: "translate(-50%, -50%)",
							overflow: "visible",
						}}
					></div>
					<Image
						src="/images/hero/carouselbg.png"
						alt="Carousel Background"
						fill
						className="object-cover scale-130"
						style={{
							borderRadius: "15px",
							transformOrigin: "center",
							objectPosition: "top center", // Change this to adjust image position
						}}
					/>

					{/* Mobile Carousel Container */}
					<div
						className="relative z-10 embla__viewport"
						ref={emblaRef}
						style={{
							width: "100%",
							height: "337px",
							overflow: "visible", // Changed to visible to show side cards
						}}
					>
						<div
							className="embla__container"
							style={{
								display: "flex",
								height: "80%",
							}}
						>
							{slideData.map((slide, index) => (
								<div
									className="embla__slide"
									key={index}
									style={{
										flex: "0 0 90%", // Changed to 70% to show side cards
										minWidth: 0,
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										padding: "0px 5px", // Reduced padding
									}}
								>
									{/* Card Content */}
									<div
										className={`flex flex-col px-4 py-5 mt-20 bg-white shadow-lg rounded-xl transition-all duration-300 ${
											index === selectedIndex
												? "scale-100 opacity-100"
												: "scale-90 opacity-70"
										}`}
										style={{
											width: "200%",
											maxWidth: "500px",
											height: "100%",
											overflow: "hidden",
										}}
									>
										<p
											className="font-medium text-[#111]"
											style={{
												fontSize:
													index === selectedIndex
														? "clamp(16px, 4vw, 18px)"
														: "clamp(14px, 3.5vw, 16px)",
											}}
										>
											{slide.author}
										</p>
										<span
											className="text-[#888888]"
											style={{
												fontSize:
													index === selectedIndex
														? "clamp(13px, 3.5vw, 14px)"
														: "clamp(11px, 3vw, 12px)",
											}}
										>
											{t(slide.profileKey)}
										</span>
										<div className="flex items-center mt-2">
											<div className="flex gap-1">
												{Array.from({ length: 5 }).map(
													(_, idx) => (
														<div
															key={idx}
															className={`relative ${
																index ===
																selectedIndex
																	? "w-4 h-4"
																	: "w-3 h-3"
															}`}
														>
															<Image
																src="/images/hero/vector.png"
																fill
																alt=""
															/>
														</div>
													)
												)}
											</div>
											<span
												className="text-[#111] ml-2"
												style={{
													fontSize:
														index === selectedIndex
															? "clamp(13px, 3.5vw, 14px)"
															: "clamp(11px, 3vw, 12px)",
												}}
											>
												({ratings[index].toFixed(1)})
											</span>
										</div>
										<p
											className="text-[#4A4A4A] leading-5 mt-3"
											style={{
												fontSize:
													index === selectedIndex
														? "clamp(12px, 3vw, 14px)"
														: "clamp(10px, 2.5vw, 12px)",
												display:
													index === selectedIndex
														? "block"
														: "-webkit-box",
												WebkitLineClamp:
													index === selectedIndex
														? "none"
														: 2,
												WebkitBoxOrient: "vertical",
												overflow:
													index === selectedIndex
														? "visible"
														: "hidden",
											}}
										>
											{t(slide.commentKey)}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Mobile Dot Controls using EmblaCarouselDotButton */}
					<div className="flex justify-center mt-6">
						<div className="flex gap-2">
							{scrollSnaps.map((_, index) => (
								<DotButton
									key={index}
									selected={index === selectedIndex}
									onClick={() => onDotButtonClick(index)}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Desktop Layout - original with background
	return (
		<div
			className="relative flex flex-col ml-20"
			style={{
				width: "1000px",
				height: "510px",
			}}
		>
			{/* Static background - solid green color */}
			<div
				className="absolute inset-0 rounded-[60px]"
				style={{
					width: "1000px",
					height: "1110px",
					zIndex: 1,
					backgroundColor: "#374A37",
				}}
			></div>

			{/* Background image overlay */}
			<div
				className="absolute rounded-[60px] overflow-visible"
				style={{
					width: "1200px",
					height: "1300px",
					zIndex: 2,
					left: "-250px",
					top: "-160px",
				}}
			>
				<Image
					src="/images/hero/carouselbg.png"
					alt="Carousel Background"
					fill
					className="object-cover rounded-[60px]"
					style={{
						transform: "scale(0.95)",
					}}
				/>
			</div>

			{/* Cards section on the left */}
			<div
				className="relative z-20 flex flex-col justify-center mb-15 mt-100"
				style={{
					width: "400px",
					height: "1110px",
					paddingLeft: "23px",
				}}
			>
				{/* Cards container with vertical motion */}
				<div
					className="relative"
					style={{
						width: "320px",
						height: "300px",
					}}
				>
					{/* Current Card (Front) - with motion */}
					<motion.div
						key={`current-${currentCardIndex}`}
						variants={cardVariants}
						initial="back"
						animate="front"
						exit="exit"
						transition={{
							duration: 0.6,
							ease: "easeInOut",
						}}
						className="absolute"
						style={{
							width: "320px",
							left: "-120px",
							top: "30px",
						}}
					>
						<div className="flex flex-col px-6 py-8 bg-white shadow-lg rounded-2xl">
							<p className="text-xl text-[#111] font-medium mt-1">
								{slideData[currentCardIndex].author}
							</p>
							<span className="text-[#888888] text-base">
								{t(slideData[currentCardIndex].profileKey)}
							</span>
							<div className="flex items-center mt-3">
								<div className="flex">
									{Array.from({ length: 5 }).map((_, idx) => (
										<div
											key={idx}
											className="relative w-5 h-5"
										>
											<Image
												src="/images/hero/vector.png"
												fill
												alt=""
											/>
										</div>
									))}
								</div>
								<span className="text-[#111] ml-2 text-base">
									({ratings[currentCardIndex].toFixed(1)})
								</span>
							</div>
							<p className="text-[#4A4A4A] leading-6 mt-3 text-base">
								{t(slideData[currentCardIndex].commentKey)}
							</p>
						</div>
					</motion.div>

					{/* Next Card (Back) - with motion */}
					<motion.div
						key={`next-${getNextCardIndex(currentCardIndex)}`}
						variants={cardVariants}
						initial="back"
						animate="back"
						transition={{
							duration: 0.6,
							ease: "easeInOut",
						}}
						className="absolute"
						style={{
							width: "320px",
							left: "0px",
							top: "0px",
						}}
					>
						<div className="flex flex-col px-6 py-8 bg-white border border-gray-100 shadow-md rounded-2xl">
							<p className="text-xl text-[#111] font-medium mt-1">
								{
									slideData[
										getNextCardIndex(currentCardIndex)
									].author
								}
							</p>
							<span className="text-[#888888] text-base">
								{t(
									slideData[
										getNextCardIndex(currentCardIndex)
									].profileKey
								)}
							</span>
							<div className="flex items-center mt-3">
								<div className="flex">
									{Array.from({ length: 5 }).map((_, idx) => (
										<div
											key={idx}
											className="relative w-5 h-5"
										>
											<Image
												src="/images/hero/vector.png"
												fill
												alt=""
											/>
										</div>
									))}
								</div>
								<span className="text-[#111] ml-2 text-base">
									(
									{ratings[
										getNextCardIndex(currentCardIndex)
									].toFixed(1)}
									)
								</span>
							</div>
							<p className="text-[#4A4A4A] leading-6 mt-3 text-base">
								{t(
									slideData[
										getNextCardIndex(currentCardIndex)
									].commentKey
								)}
							</p>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Carousel controls on the right side */}
			<div
				className="relative z-30 flex flex-col items-center justify-center"
				style={{
					width: "268px",
					height: "1px",
					right: "5px",
					top: "30px",
				}}
			>
				<CarouselControls
					selectedIndex={currentCardIndex}
					scrollSnaps={slideData.map((_, index) => index)}
					onDotButtonClick={setCurrentCardIndex}
					onPrevButtonClick={() =>
						setCurrentCardIndex((prev) =>
							prev === 0 ? slideData.length - 1 : prev - 1
						)
					}
					onNextButtonClick={() =>
						setCurrentCardIndex(
							(prev) => (prev + 1) % slideData.length
						)
					}
				/>
			</div>
		</div>
	);
}
