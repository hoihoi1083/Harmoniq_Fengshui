"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import FAQ from "./FAQ";

const FortuneTips = () => {
	const t = useTranslations("home.fortuneTips");
	const [openIndex, setOpenIndex] = useState(0); // First item open by default

	const tips = [
		{ number: t("tip1.number"), title: t("tip1.title"), content: t("tip1.content") },
		{ number: t("tip2.number"), title: t("tip2.title"), content: t("tip2.content") },
		{ number: t("tip3.number"), title: t("tip3.title"), content: t("tip3.content") },
		{ number: t("tip4.number"), title: t("tip4.title"), content: t("tip4.content") },
	];

	const toggleItem = (index) => {
		setOpenIndex(openIndex === index ? -1 : index);
	};

	return (
		<section className="relative w-full px-4 py-1 sm:px-6 md:px-12 md:py-20 lg:px-20 xl:px-32 2xl:px-80">
			{/* Background: only on md and up, none on mobile */}
			<div
				className="absolute inset-0 hidden md:block pointer-events-none"
				aria-hidden
				style={{
					backgroundImage:
						"url(/images/demo/homepage-fortunetips-bg.png)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			/>
			<div className="relative mx-auto">
				{/* Header - responsive badge */}
				<div className="flex items-center justify-start mb-10 md:mb-16">
					<div
						className="flex items-center justify-center rounded-full bg-[#A4AF3B] flex-shrink-0 px-5 py-1 min-h-10 w-auto sm:px-6 sm:py-3 md:w-40 md:h-10 md:px-0 md:py-0"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						<span className="font-bold text-white text-base sm:text-lg md:text-2xl whitespace-nowrap">
							{t("title")}
						</span>
					</div>
				</div>

				{/* Accordion Items */}
				<div className="space-y-3 sm:space-y-4">
					{tips.map((tip, index) => (
						<div
							key={index}
							className={`rounded-lg overflow-hidden transition-all duration-300 border-2 border-[#191A23] ${
								openIndex !== index
									? "shadow-[0_1px_0_#000000] md:shadow-none"
									: ""
							}`}
							style={
								openIndex === index
									? {
											background:
												"linear-gradient(to bottom, #363739, #676769)",
										}
									: {}
							}
						>
							{/* Header */}
							<button
								onClick={() => toggleItem(index)}
								className="flex items-center justify-between w-full px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 transition-colors gap-3"
							>
								<div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
									<span
										className={`text-3xl font-bold flex-shrink-0 sm:text-4xl md:text-5xl ${
											openIndex === index
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{tip.number}
									</span>
									<h3
										className={`text-base font-medium text-left sm:text-lg md:text-xl ${
											openIndex === index
												? "text-white"
												: "text-gray-900"
										}`}
									>
										{tip.title}
									</h3>
								</div>
								<div
									className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl md:text-4xl font-extrabold ${
										openIndex === index
											? "border-[#F3F3F3] bg-[#F3F3F3] text-black"
											: "border-[#191A23] bg-[#F3F3F3] text-black"
									}`}
								>
									{openIndex === index ? "−" : "+"}
								</div>
							</button>

							{/* Content */}
							{openIndex === index && (
								<div className="px-4 pt-0 pb-6 sm:px-6 sm:pb-7 md:px-8 md:pt-2 md:pb-8">
									<div className="pt-4 sm:pt-6 border-t border-gray-600">
										<p className="text-sm sm:text-base leading-relaxed text-white whitespace-pre-line">
											{tip.content}
										</p>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
			<FAQ />
		</section>
	);
};

export default FortuneTips;
