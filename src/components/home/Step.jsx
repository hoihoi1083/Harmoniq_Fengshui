"use client";
import React, { useState, useEffect } from "react";
import useMobile from "../../app/hooks/useMobile";

const Step = ({ steps }) => {
	const isMobile = useMobile();
	const [isClient, setIsClient] = useState(false);
	const [isSmallDesktop, setIsSmallDesktop] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Check for screen width to adjust layout
	useEffect(() => {
		const checkScreenSize = () => {
			if (typeof window !== "undefined") {
				setIsSmallDesktop(window.innerWidth < 1078);
			}
		};

		// Check on mount (only runs on client)
		checkScreenSize();

		// Add resize listener
		if (typeof window !== "undefined") {
			window.addEventListener("resize", checkScreenSize);
			return () => window.removeEventListener("resize", checkScreenSize);
		}
	}, []);

	// During SSR and initial hydration, render desktop layout to prevent mismatch
	if (!isClient) {
		return (
			<div className="w-[90%] flex items-center">
				<div
					className="flex w-full p-4 ml-4 md:p-6 lg:p-8 md:ml-6 lg:ml-10"
					style={{
						minHeight: "150px",
					}}
				>
					{steps.map((step) => (
						<div
							key={step.num}
							className="relative flex flex-col items-start justify-start flex-1 ml-3 overflow-hidden rounded-lg md:ml-5 lg:ml-7"
							style={{
								borderRadius: "20px",
								position: "relative",
							}}
						>
							{/* Background Image */}
							<div
								className="absolute inset-0 z-0"
								style={{
									backgroundImage: `url(${step.image})`,
									backgroundPosition: "center",
									backgroundRepeat: "no-repeat",
									opacity: 10.5,
								}}
							/>

							{/* Content overlay */}
							<div className="relative z-20 flex flex-col items-start w-full p-2 md:p-3">
								{/* Number with transparent circle effect */}
								<div
									className="relative flex items-center justify-center mb-3 md:mb-4"
									style={{
										width: "45px",
										height: "45px",
										borderRadius: "50%",
										background: "#A3B116",
										border: "1px solid #A3B116",
									}}
								>
									<span
										style={{
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											fontWeight: 1000,
											fontSize: "30px",
											color: "#FFFFFF",
											lineHeight: "1",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											width: "100%",
											height: "100%",
											transform: "translateX(-40px)",
										}}
									>
										{step.num}
									</span>
								</div>

								{/* Label below the number */}
								<div className="relative z-10 w-full">
									<div className="flex flex-col items-start">
										<span
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontWeight: 800,
												fontSize: "20px",
												lineHeight: "35px",
												color: "#374A37",
											}}
										>
											{step.title}
										</span>
										<span
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
												fontWeight: 800,
												fontSize: "20px",
												lineHeight: "35px",
												color: "#374A37",
											}}
										>
											{step.subtitle}
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// MOBILE LAYOUT - Enhanced responsiveness
	if (isMobile) {
		return (
			<div className="w-full px-4 sm:px-6">
				{/* Steps Container - Responsive width and height */}
				<div className="relative w-full max-w-sm mx-auto">
					{/* Single Steps Container */}
					<div
						className="relative"
						style={{
							minHeight: "100px",
							height: "auto",
						}}
					>
						{/* Steps Grid - 2x2 Layout */}
						<div className="grid h-full grid-cols-2 gap-2 sm:gap-3">
							{steps.map((step, index) => (
								<div
									key={step.num}
									className="relative flex flex-col items-center justify-center p-1 overflow-hidden rounded-xl"
									style={{
										minHeight: "65px",
										aspectRatio: "1.1/1",
									}}
								>
									{/* Background Image */}
									<div
										className="absolute inset-0 z-0 rounded-xl"
										style={{
											backgroundImage: `url(${step.image})`,
											backgroundSize: "45% auto",
											backgroundPosition: "center",
											backgroundRepeat: "no-repeat",
											opacity: 2.4,
										}}
									/>

									{/* Large Number in Background - Responsive size */}
									<div
										className="absolute inset-0 flex items-center justify-center z-2"
										style={{
											fontSize: "clamp(45px, 12vw, 65px)",
											fontWeight: "900",
											color: "rgba(163, 177, 22, 0.8)",
											fontFamily: "Noto Serif TC, serif",
											lineHeight: "1",
											pointerEvents: "none",
											textShadow:
												"0 2px 4px rgba(0,0,0,0.3)",
											transform: "translateX(-60px)",
										}}
									>
										{step.num}
									</div>

									{/* Content overlay */}
									<div className="relative z-10 flex flex-col items-center justify-center h-full space-y-0.5 text-center">
										{/* Step Content */}
										<div className="px-0.5 space-y-0.5">
											<h4
												className="font-bold leading-tight"
												style={{
													fontFamily:
														"Noto Sans HK, sans-serif",
													textShadow:
														"0 1px 2px rgba(0,0,0,0.5)",
													color: "#374A37",
													fontSize:
														"clamp(9px, 2.5vw, 18px)",
												}}
											>
												{step.title}
											</h4>
											<p
												className="leading-tight opacity-90"
												style={{
													fontFamily:
														"Noto Sans HK, sans-serif",
													textShadow:
														"0 1px 2px rgba(0,0,0,0.5)",
													color: "#374A37",
													fontSize:
														"clamp(7px, 2vw, 10px)",
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
		);
	}

	// DESKTOP LAYOUT - Keep MacBook Air 13" appearance but make it screen responsive
	return (
		<div className="flex items-center w-full">
			<div
				className={`w-full p-4 ml-4 md:p-6 lg:p-8 md:ml-6 lg:ml-10 ${
					isSmallDesktop
						? "grid grid-cols-2 gap-4 place-items-center justify-center"
						: "flex"
				}`}
			>
				{steps.map((step) => (
					<div
						key={step.num}
						className={`relative flex flex-col items-start justify-start overflow-hidden rounded-lg ${
							isSmallDesktop
								? "w-full"
								: "flex-1 ml-3 md:ml-5 lg:ml-7"
						}`}
						style={{
							borderRadius: "20px",
							minHeight: isSmallDesktop ? "120px" : "auto",
						}}
					>
						{/* Background Color */}
						<div className="absolute inset-0 z-0" />

						{/* Background Image */}
						<img
							src={step.image}
							alt=""
							className="absolute inset-0 z-0 object-contain w-auto h-auto"
							style={{
								width: "45%",
								height: "auto",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
							}}
						/>

						{/* Content overlay */}
						<div className="relative z-20 flex flex-col items-start w-full p-2 md:p-5">
							{/* Number with transparent circle effect - Responsive sizing */}
							<div
								className="relative flex items-center justify-center mb-2 md:mb-3"
								style={{
									width: "clamp(50px, 5vw, 40px)",
									height: "clamp(50px, 5vw, 40px)",
									borderRadius: "50%",
									background: "#A3B116",
								}}
							>
								<span
									style={{
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										fontWeight: 1000,
										fontSize: "clamp(30px, 3vw, 35px)",
										color: "#FFFFFF",
									}}
								>
									{step.num}
								</span>
							</div>

							{/* Label below the number - Responsive text sizing */}
							<div className="relative z-10 w-full">
								<div className="flex flex-col items-start">
									<span
										style={{
											fontFamily:
												"Noto Sans HK, sans-serif",
											fontWeight: 800,
											fontSize: "clamp(16px, 2vw, 20px)",
											lineHeight:
												"clamp(28px, 3.5vw, 35px)",
											color: "#374A37",
										}}
									>
										{step.title}
									</span>
									<span
										style={{
											fontFamily:
												"Noto Sans HK, sans-serif",
											fontWeight: 600,
											fontSize: "clamp(16px, 2vw, 18px)",
											lineHeight:
												"clamp(28px, 3.5vw, 35px)",
											color: "#374A37",
										}}
									>
										{step.subtitle}
									</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Step;
