"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import WhyChooseUs from "./WhyChooseUs";
import ComparisonTables from "./ComparisonTables";

const TestimonialSection = () => {
	const t = useTranslations("home.testimonials");
	const scrollRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	// Same pattern as ServiceDemoTags: store drag start for the whole drag
	const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
	const isDraggingRef = useRef(false);

	const handleMouseDown = (e) => {
		if (!scrollRef.current || e.button !== 0) return;
		scrollRef.current.style.scrollBehavior = "auto";
		dragStartRef.current = {
			x: e.clientX - scrollRef.current.getBoundingClientRect().left,
			scrollLeft: scrollRef.current.scrollLeft,
		};
		isDraggingRef.current = true;
		setIsDragging(true);

		const onDocMouseMove = (e) => {
			if (!scrollRef.current) return;
			e.preventDefault();
			const x = e.clientX - scrollRef.current.getBoundingClientRect().left;
			const walk = x - dragStartRef.current.x;
			scrollRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk;
		};

		const onDocMouseUp = () => {
			document.removeEventListener("mousemove", onDocMouseMove);
			document.removeEventListener("mouseup", onDocMouseUp);
			if (scrollRef.current) scrollRef.current.style.scrollBehavior = "";
			isDraggingRef.current = false;
			setIsDragging(false);
		};

		document.addEventListener("mousemove", onDocMouseMove);
		document.addEventListener("mouseup", onDocMouseUp);
	};

	const handleMouseMove = (e) => {
		if (!isDraggingRef.current || !scrollRef.current) return;
		e.preventDefault();
		const x = e.clientX - scrollRef.current.getBoundingClientRect().left;
		const walk = x - dragStartRef.current.x;
		scrollRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk;
	};

	const handleMouseUp = () => {
		isDraggingRef.current = false;
		setIsDragging(false);
	};

	const handleMouseLeave = () => {
		if (isDragging) handleMouseUp();
	};

	// Sample testimonial data
	const testimonials = [
		{
			id: 1,
			quote: "一直容易疲勞，買了白水晶，贈送的報告建議超具體，照做一週，白天精神明顯變好，入睡也快了。這報告就像懂我的私人顧問，把複雜知識變成能直接用的行動指南，非常有用！",
			name: "Donald C.",
			avatar: "/images/testimonials/avatar-1.png",
		},
		{
			id: 2,
			quote: "以前對理財很迷茫。報告幫我分析出屬情感消費型，並給出5%啟動法設立自動儲蓄。現在對管理錢財有了清晰頭緒，感覺未來規劃踏實很多。",
			name: "Emily R.",
			avatar: "/images/testimonials/avatar-2.png",
		},
		{
			id: 3,
			quote: "這份分析神準！指出我和男朋友是問題解決型和情感傾聽型的溝通差異，一看就恍然大悟。提供的具體對話建議，讓我們馬上實踐，爭吵真的減少了。",
			name: "Kelly F.",
			avatar: "/images/testimonials/avatar-3.png",
		},
		{
			id: 4,
			quote: "事業運報告幫我定位在穩定突破期，點出優勢是資源整合，給出具體90天行動建議。我突然覺得職涯道路清晰了，這報告就像專業職場導師，對規劃幫助極大。",
			name: "Charlie P.",
			avatar: "/images/testimonials/avatar-4.png",
		},
	];

	return (
		<section
			className="relative w-full px-4 py-1 md:py-20 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80"
			style={{
				backgroundImage:
					"linear-gradient(to bottom, transparent 95%, rgba(239, 239, 239, 1.0) 100%),url(/images/demo/homepage-demo-bg.png)",
				backgroundSize: "99%",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Title Section */}
			<div className="flex flex-col md:flex-row md:items-center items-start gap-4 md:gap-6 mb-10 md:mb-16">
				<div
					className="flex items-center justify-center rounded-full px-5 py-2 md:w-40 md:h-10 md:px-0 md:py-0 bg-[#A4AF3B] flex-shrink-0"
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					}}
				>
					<span className="font-bold text-white text-base sm:text-lg md:text-2xl">
						{t("title")}
					</span>
				</div>
				<p className="text-xs sm:text-base leading-relaxed text-black md:text-base w-full md:w-[60%]">
					{t("description")}
				</p>
			</div>

			{/* Testimonial Cards - single row, horizontal scroll (touch/drag) */}
			<div
				ref={scrollRef}
				role="region"
				aria-label="Testimonials carousel"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				
				className={`flex overflow-x-auto overflow-y-hidden scrollbar-hide gap-4 md:gap-6 mb-12 pb-2 mx-1 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 snap-x snap-mandatory overscroll-behavior-x-contain [scrollbar-width:thin] ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
				style={{
					WebkitOverflowScrolling: "touch",
					scrollBehavior: isDragging ? "auto" : "smooth",
				}}
			>
				{testimonials.map((testimonial) => (
					<div
						key={testimonial.id}
						className="flex-shrink-0 snap-start w-[68vw] min-w-[68vw] sm:w-[300px] sm:min-w-[300px] md:w-[340px] md:min-w-[340px] bg-[#D9D9D9] rounded-xl md:rounded-2xl p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between border border-[#A4AF3B] min-h-[150px] sm:min-h-[200px] md:min-h-[230px] lg:min-h-[250px]"
					>
						{/* Quote Text */}
						<p className="text-xs sm:text-sm text-[#666666] leading-relaxed line-clamp-5 sm:line-clamp-6">
							"{testimonial.quote}"
						</p>

						{/* Quotation Mark Icon */}
						<div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-right text-[#999999]">
							"
						</div>

						{/* User Info - Avatar and Name */}
						<div className="flex items-center gap-2 sm:gap-3 -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-9">
							<div className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 overflow-hidden bg-gray-300 rounded-full">
								<Image
									src={testimonial.avatar}
									alt={testimonial.name}
									fill
									className="object-cover"
									draggable={false}
								/>
							</div>
							<span className="text-xs sm:text-sm md:text-base font-semibold text-[#333333]">
								{testimonial.name}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Learn More Button */}
			<div className="flex justify-end">
				<button
					className="bg-black hover:bg-[#1C1C1C] text-white px-6 md:px-18 py-3 md:py-3 rounded-[10px] text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all"
					onClick={() => {
						// Function to be implemented
						console.log("Learn more clicked");
					}}
				>
					{t("learnMore")}
				</button>
			</div>
			<WhyChooseUs />
			<ComparisonTables />
		</section>
	);
};

export default TestimonialSection;
