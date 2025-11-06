"use client";
import React, { useCallback, useEffect, useState } from "react";

export const useDotButton = (emblaApi) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState([]);

	const onDotButtonClick = useCallback(
		(index) => {
			if (!emblaApi) return;
			emblaApi.scrollTo(index);
		},
		[emblaApi]
	);

	const onPrevButtonClick = useCallback(() => {
		if (!emblaApi) return;
		emblaApi.scrollPrev();
	}, [emblaApi]);

	const onNextButtonClick = useCallback(() => {
		if (!emblaApi) return;
		emblaApi.scrollNext();
	}, [emblaApi]);

	const onInit = useCallback((emblaApi) => {
		setScrollSnaps(emblaApi.scrollSnapList());
	}, []);

	const onSelect = useCallback((emblaApi) => {
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onInit(emblaApi);
		onSelect(emblaApi);
		emblaApi
			.on("reInit", onInit)
			.on("reInit", onSelect)
			.on("select", onSelect);
	}, [emblaApi, onInit, onSelect]);

	return {
		selectedIndex,
		scrollSnaps,
		onDotButtonClick,
		onPrevButtonClick,
		onNextButtonClick,
	};
};

export const DotButton = ({ selected, ...restProps }) => (
	<button
		type="button"
		className={`relative rounded-full transition-colors duration-200 mx-1`}
		style={{
			width: "6px",
			height: "6px",
			backgroundColor: selected ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
		}}
		{...restProps}
	/>
);

export const ArrowButton = ({ direction, ...restProps }) => (
	<button
		type="button"
		className="flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
		{...restProps}
	>
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`text-white ${direction === "down" ? "rotate-180" : ""}`}
		>
			{/* Full arrow shape */}
			<path
				d="M12 2L12 22M12 2L6 8M12 2L18 8"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	</button>
);

export const CarouselControls = ({
	selectedIndex,
	scrollSnaps,
	onDotButtonClick,
	onPrevButtonClick,
	onNextButtonClick,
}) => (
	<div className="flex flex-row items-center gap-6 mt-10">
		{/* Top Arrow (Previous) */}
		<ArrowButton direction="up" onClick={onPrevButtonClick} />

		{/* Dots */}
		<div className="flex flex-row gap-4">
			{scrollSnaps.map((_, index) => (
				<DotButton
					key={index}
					selected={index === selectedIndex}
					onClick={() => onDotButtonClick(index)}
				/>
			))}
		</div>

		{/* Bottom Arrow (Next) */}
		<ArrowButton direction="down" onClick={onNextButtonClick} />
	</div>
);
