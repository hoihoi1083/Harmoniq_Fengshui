"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

const ShopFeatureBanner = ({
	imageSrc = "/images/hero/left-picture.png",
	title = "師傅一對一專屬訂製",
	title2 = "訂製報告",

	bulletItems = [
		"解開迷津，指引方向",
		"直面人生困惑難題",
		"深入剖析流年運勢",
		"一對一專屬命理測算",
	],
	bulletItems2 = [
		"獲取個性化命理報告",
		"按照我们的專屬建議",
		"迎接完美平衡的生活",
	],

	bulletImageSrc = "/images/hero/bullet.png",
	buttonText,
	buttonHref = "/demo",
}) => {
	const locale = useLocale();

	const resolvedButtonText =
		buttonText || (locale === "zh-CN" ? "进入聊天室" : "進入聊天室");

	return (
		<section className="w-full">
			<div className="relative overflow-hidden rounded-[28px] md:rounded-[36px] mb-30">
				<div className="grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] items-stretch justify-between">
					{/* Left Image */}
					<div className="relative w-full aspect-[16/16]">
						<Image
							src={imageSrc}
							alt=""
							fill
							className="object-cover"
							priority={false}
						/>
					</div>

					{/* Right Vertical Text + Bullets + Button */}
					<div className="flex flex-col items-center justify-center w-full gap-8 px-6 py-8 md:flex-col md:items-end md:justify-center md:pr-10 md:py-10">
						<div className="flex flex-row items-start gap-6">
							<div className="flex flex-col items-center gap-20">
								<div className="flex items-start gap-6">
									{bulletItems.map((item, index) => (
										<div
											key={index}
											className="flex flex-col items-center gap-3"
										>
											<div className="relative w-6 h-6 md:w-7 md:h-7">
												<Image
													src={bulletImageSrc}
													alt=""
													fill
													className="object-contain"
													sizes="28px"
												/>
											</div>
											<div
												className="text-[#2C2C2C] font-semibold text-lg md:text-xl tracking-[0.15em]"
												style={{
													writingMode: "vertical-rl",
													textOrientation: "upright",
													fontFamily:
														"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												}}
											>
												{item}
											</div>
										</div>
									))}
								</div>
								<Link href={buttonHref}>
									<button
										className="px-8 py-3 text-sm font-semibold text-white transition-all rounded-full shadow-md md:text-base hover:shadow-lg"
										style={{
											backgroundImage:
												"linear-gradient(90deg, #333537 0%, #C2C1C1 100%)",
										}}
									>
										{resolvedButtonText}
									</button>
								</Link>
							</div>
							<div
								className="font-bold  tracking-[0.1em]"
								style={{
									fontSize: "50px",
									writingMode: "vertical-rl",
									textOrientation: "upright",
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									backgroundImage:
										"linear-gradient(180deg, #929292 0%, #464646 100%)",
									WebkitBackgroundClip: "text",
									color: "transparent",
								}}
							>
								{title}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="relative overflow-hidden rounded-[28px] md:rounded-[36px] ">
				<div className="grid grid-cols-1 md:grid-cols-[0.7fr_0.3fr] items-stretch justify-between">
					<div className="flex flex-col items-center justify-center w-full gap-8 px-1 py-8 md:flex-col md:items-end md:justify-center md:py-10">
						<div className="flex flex-row items-start gap-6">
							<div className="flex flex-col items-start gap-1">
								<div
									className="font-bold"
									style={{
										fontSize: "88px",
										fontFamily: "Iowan Old Style",
										color: "transparent",
										backgroundImage:
											"linear-gradient(180deg, #FFFFFF 0%, #A6A6A6 100%)",
										WebkitBackgroundClip: "text",
									}}
								>
									HarmoniQ
								</div>
								<div className="flex items-start gap-6">
									<div
										className="font-bold  md:text-6xl tracking-[0.2em]"
										style={{
											fontSize: "60px",
											writingMode: "vertical-rl",
											textOrientation: "upright",
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											backgroundImage:
												"linear-gradient(180deg, #A6A6A6 0%, #FFFFFF 100%)",
											WebkitBackgroundClip: "text",
											color: "transparent",
										}}
									>
										{title2}
									</div>
									<div className="flex flex-col items-center gap-6">
										<div className="flex items-start gap-6">
											{bulletItems2.map((item, index) => (
												<div
													key={index}
													className="flex flex-col items-center gap-3"
												>
													<div
														className="text-[#EBEBEB] font-semibold text-lg md:text-xl tracking-[0.15em]"
														style={{
															writingMode:
																"vertical-rl",
															textOrientation:
																"upright",
															fontFamily:
																"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
														}}
													>
														{item}
													</div>
												</div>
											))}
										</div>
										<Link href={buttonHref}>
											<button className="px-10 py-3 text-sm font-semibold text-white transition-all border rounded-full shadow-md md:text-base hover:shadow-lg border-white/80">
												購買報告
											</button>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="relative w-full aspect-[16/16]">
						<Image
							src="/images/hero/right-picture.png"
							alt=""
							fill
							className="object-cover"
							priority={false}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ShopFeatureBanner;
