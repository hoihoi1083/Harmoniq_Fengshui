"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useResponsiveScale } from "../../hooks/useResponsiveScale";

export default function Features() {
	const t = useTranslations("home.features");
	const { scaleRatio, isMobileLayout } = useResponsiveScale();

	const features = [
		{
			title: t("title1"),
			description: t("subtitle1"),
			icon: "/images/hero/feature1.png",
		},
		{
			title: t("title2"),
			description: t("subtitle2"),
			icon: "/images/hero/feature2.png",
		},
		{
			title: t("title3"),
			description: t("subtitle3"),
			icon: "/images/hero/feature3.png",
		},
		{
			title: t("title4"),
			description: t("subtitle4"),
			icon: "/images/hero/feature4.png",
		},
	];

	if (isMobileLayout) {
		// Mobile layout - optimized for small screens
		return (
			<section
				className="w-full px-4 py-0 sm:px-6 sm:py-0"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				{/* Green line above title - responsive width */}
				<div
					className="mb-4 sm:mb-6"
					style={{
						width: "clamp(150px, 50vw, 200px)",
						height: "2px",
						backgroundColor: "#374A37",
					}}
				/>

				<h3
					className="mb-6 text-left sm:mb-8"
					style={{
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 800,
						fontSize: "clamp(28px, 8vw, 36px)", // Responsive font size
						color: "#635D3B",
						fontStyle: "normal",
						lineHeight: "1.2",
					}}
				>
					{t("title")}
				</h3>

				{/* Mobile grid - single column layout */}
				<div className="flex flex-row justify-center w-full gap-4 my-6 sm:gap-6 sm:my-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex flex-col items-center p-0 text-center transition-transform duration-200 rounded-lg hover:scale-105 sm:p-4"
						>
							<div className="flex items-center justify-center">
								<Image
									src={feature.icon}
									alt={feature.title}
									width={120}
									height={120}
									className="object-contain"
								/>
							</div>
							<h3
								className="mb-2 text-center font-nano-sans-hk"
								style={{
									fontWeight: 800,
									fontSize: "clamp(14px, 4vw, 18px)", // Responsive font size
									color: "#000",
									fontStyle: "normal",
									lineHeight: "1.3",
								}}
							>
								{feature.title}
							</h3>
							<p
								className="text-center font-nano-sans-hk"
								style={{
									fontWeight: 800,
									fontSize: "clamp(10px, 3vw, 10px)", // Responsive font size
									color: "#073E31",
									fontStyle: "normal",
									lineHeight: "1.4",
								}}
							>
								{feature.description}
							</p>
						</div>
					))}
				</div>

				{/* Mobile read more - responsive */}
				<div className="flex justify-start w-full mb-4 sm:mb-6">
					<span
						className="transition-colors duration-200 cursor-pointer hover:text-gray-600"
						style={{
							fontFamily: "Noto Sans HK, sans-serif",
							fontWeight: 400,
							fontSize: "clamp(16px, 4.5vw, 20px)", // Responsive font size
							color: "#000",
							textDecoration: "underline",
							fontStyle: "normal",
						}}
					>
						{t("readMore")}
					</span>
				</div>

				{/* Mobile social icons - responsive spacing */}
				<div className="flex items-center justify-start w-full gap-4 sm:gap-6">
					<a
						href="https://www.facebook.com/profile.php?id=61578389876952"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-all duration-200 hover:opacity-80 hover:scale-110"
					>
						<Image
							src="/images/footer/Facebook.png"
							alt={t("facebookAlt")}
							width={32}
							height={32}
							className="w-6 h-6 sm:w-7 sm:h-7"
							style={{
								filter: "brightness(0) saturate(100%)",
							}}
						/>
					</a>
					<a
						href="https://www.instagram.com/harmoniqbell_luckyshop/"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-all duration-200 hover:opacity-80 hover:scale-110"
					>
						<Image
							src="/images/footer/Instagram.png"
							alt={t("instagramAlt")}
							width={32}
							height={32}
							className="w-6 h-6 sm:w-7 sm:h-7"
							style={{
								filter: "brightness(0) saturate(100%)",
							}}
						/>
					</a>
				</div>
			</section>
		);
	}

	// Desktop layout - original with scaling applied by parent container
	return (
		<section
			className="w-full p-15"
			style={{ fontFamily: "Noto Serif TC, serif" }}
		>
			{/* Green line above title - original dimensions */}
			<div
				className="mb-18"
				style={{
					width: "343px",
					height: "2px",
					backgroundColor: "#374A37",
				}}
			/>

			<h3
				className="mb-12 ml-10 text-6xl text-left"
				style={{
					fontFamily: "Noto Serif TC, serif",
					fontWeight: 800,
					color: "#635D3B",
					fontStyle: "normal",
				}}
			>
				{t("title")}
			</h3>

			{/* Content moved to the right */}
			<div className="ml-1">
				<div className="grid w-full grid-cols-4 my-10">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex flex-col items-center text-center"
						>
							<Image
								src={feature.icon}
								alt={feature.title}
								width={105}
								height={105}
								className="object-contain mb-4"
							/>
							<h3
								className="mb-1 text-center"
								style={{
									fontFamily: "Acme, sans-serif",
									fontWeight: 400,
									fontSize: "20px",
									color: "#000",
									fontStyle: "normal",
								}}
							>
								{feature.title}
							</h3>
							<p
								className="text-center"
								style={{
									fontFamily: "ABeeZee, sans-serif",
									fontWeight: 400,
									fontSize: "15px",
									color: "#073E31",
									fontStyle: "normal",
								}}
							>
								{feature.description}
							</p>
						</div>
					))}
				</div>

				{/* First row: Read more */}
				<div className="flex justify-start w-full mb-7">
					<span
						style={{
							fontFamily: "Noto Sans HK, sans-serif",
							fontWeight: 400,
							fontSize: "20px",
							color: "#000",
							textDecoration: "underline",
							fontStyle: "normal",
						}}
					>
						{t("readMore")}
					</span>
				</div>

				{/* Second row: Facebook Instagram */}
				<div className="flex items-center justify-start w-full gap-8">
					<a
						href="https://www.facebook.com/profile.php?id=61578389876952"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-opacity hover:opacity-80"
					>
						<Image
							src="/images/footer/Facebook.png"
							alt={t("facebookAlt")}
							width={32}
							height={32}
							className="w-10 h-10"
							style={{
								filter: "brightness(0) saturate(100%)",
							}}
						/>
					</a>
					<a
						href="https://www.instagram.com/harmoniqbell_luckyshop/"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-opacity hover:opacity-80"
					>
						<Image
							src="/images/footer/Instagram.png"
							alt={t("instagramAlt")}
							width={32}
							height={32}
							className="w-10 h-10"
							style={{
								filter: "brightness(0) saturate(100%)",
							}}
						/>
					</a>
				</div>
			</div>
		</section>
	);
}
