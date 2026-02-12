"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRegionDetection } from "@/hooks/useRegionDetectionEnhanced";
import { useMobile } from "../../hooks/useMobile";

export default function ServiceDemoTags() {
	const t = useTranslations("home.demo");
	const scrollContainerRef = useRef(null);
	const isMobile = useMobile();
	const { region } = useRegionDetection();
	const [isAutoScrolling, setIsAutoScrolling] = useState(false);
	const autoScrollRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
	const [hasDragged, setHasDragged] = useState(false);

	const scrollConfig = {
		speed: { desktop: 2 },
		edgeThreshold: 100,
		smoothness: 1,
	};

	const getImagePath = (baseName) => {
		if (region === "china") {
			const nameWithoutExtension = baseName.replace(".png", "");
			return `/images/demo/${nameWithoutExtension}-china.png`;
		}
		return `/images/demo/${baseName}`;
	};

	const tags = [
		{
			id: "fengshui",
			name: t("tags.fengshui.name"),
			image: getImagePath("fengshui.png"),
			description: t("tags.fengshui.description"),
		},
		{
			id: "life",
			name: t("tags.life.name"),
			image: getImagePath("life.png"),
			description: t("tags.life.description"),
		},
		{
			id: "relationship",
			name: t("tags.relationship.name"),
			image: getImagePath("relationship.png"),
			description: t("tags.relationship.description"),
		},
		{
			id: "couple",
			name: t("tags.couple.name"),
			image: getImagePath("couple.png"),
			description: t("tags.couple.description"),
		},
		{
			id: "career",
			name: t("tags.career.name"),
			image: getImagePath("career.png"),
			description: t("tags.career.description"),
		},
		{
			id: "health",
			name: t("tags.health.name"),
			image: getImagePath("health.png"),
			description: t("tags.health.description"),
		},
		{
			id: "wealth",
			name: t("tags.wealth.name"),
			image: getImagePath("wealth.png"),
			description: t("tags.wealth.description"),
		},
	];

	const startAutoScroll = (direction) => {
		if (isAutoScrolling || isMobile) return;

		setIsAutoScrolling(true);
		const scrollSpeed =
			scrollConfig.speed.desktop * scrollConfig.smoothness;

		const scroll = () => {
			if (!scrollContainerRef.current) return;

			const container = scrollContainerRef.current;
			const currentScroll = container.scrollLeft;
			const maxScroll = container.scrollWidth - container.clientWidth;

			if (direction === "left" && currentScroll > 0) {
				container.scrollLeft = Math.max(0, currentScroll - scrollSpeed);
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
	};

	const stopAutoScroll = () => {
		setIsAutoScrolling(false);
		if (autoScrollRef.current) {
			cancelAnimationFrame(autoScrollRef.current);
			autoScrollRef.current = null;
		}
	};

	const handleContainerMouseMove = (e) => {
		if (isDragging) {
			handleMouseMoveOnDesktopAndMobile(e);
		} else if (!isMobile) {
			handleMouseMove(e);
		}
	};

	const handleMouseMove = (e) => {
		if (!scrollContainerRef.current || isMobile || isDragging) return;

		const container = scrollContainerRef.current;
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
	};

	const handleImageClick = (e, tagId) => {
		if (hasDragged) {
			e.preventDefault();
			return;
		}

		window.location.href = `/demo?category=${tagId}`;
	};

	const handleMouseDown = (e) => {
		if (!scrollContainerRef.current) return;

		stopAutoScroll();

		setIsDragging(true);
		setHasDragged(false);
		setDragStart({
			x: e.pageX - scrollContainerRef.current.offsetLeft,
			scrollLeft: scrollContainerRef.current.scrollLeft,
		});
	};

	const handleMouseMoveOnDesktopAndMobile = (e) => {
		if (!isDragging || !scrollContainerRef.current) return;

		e.preventDefault();
		const x = e.pageX - scrollContainerRef.current.offsetLeft;
		const walk = (x - dragStart.x) * 2;

		if (Math.abs(walk) > 5) {
			setHasDragged(true);
		}

		scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
	};

	const handleMouseUp = () => {
		setIsDragging(false);
		setTimeout(() => setHasDragged(false), 100);
	};

	const handleTouchStart = (e) => {
		if (!isMobile || !scrollContainerRef.current) return;

		setIsDragging(true);
		setHasDragged(false);
		const touch = e.touches[0];
		setDragStart({
			x: touch.pageX - scrollContainerRef.current.offsetLeft,
			scrollLeft: scrollContainerRef.current.scrollLeft,
		});
	};

	const handleTouchMove = (e) => {
		if (!isMobile || !isDragging || !scrollContainerRef.current) return;

		e.preventDefault();
		const touch = e.touches[0];
		const x = touch.pageX - scrollContainerRef.current.offsetLeft;
		const walk = (x - dragStart.x) * 2;

		if (Math.abs(walk) > 5) {
			setHasDragged(true);
		}

		scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
	};

	const handleTouchEnd = () => {
		if (!isMobile) return;

		setIsDragging(false);
		setTimeout(() => setHasDragged(false), 100);
	};

	return (
		<div className="w-full mb-6 sm:mb-8 ">
			<div
				ref={scrollContainerRef}
				className="flex gap-4 sm:gap-6 md:gap-8 py-4 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory touch-pan-x"
				style={{
					scrollbarWidth: "none",
					msOverflowStyle: "none",
					cursor: isDragging ? "grabbing" : "grab",
				}}
				onMouseMove={handleContainerMouseMove}
				onMouseLeave={() => {
					if (!isMobile && !isDragging) {
						stopAutoScroll();
					} else if (isDragging) {
						handleMouseUp();
					}
				}}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onTouchStart={isMobile ? handleTouchStart : undefined}
				onTouchMove={isMobile ? handleTouchMove : undefined}
				onTouchEnd={isMobile ? handleTouchEnd : undefined}
			>
				{tags.map((tag) => (
					<div
						key={tag.id}
						className="relative flex-shrink-0 group snap-center"
					>
						<div
							className="relative transition-transform duration-300 rounded-lg cursor-pointer hover:scale-102 active:scale-100"
							onClick={(e) => handleImageClick(e, tag.id)}
							style={{ userSelect: "none" }}
						>
							<img
								src={tag.image}
								alt={tag.name}
								className="object-contain rounded-lg w-38 h-28 sm:w-62 sm:h-43  lg:w-65 "
								draggable={false}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
