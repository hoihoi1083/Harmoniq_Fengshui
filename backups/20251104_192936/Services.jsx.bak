import React from "react";
import Image from "next/image";
import Link from "next/link";
import Step from "./Step";

const ServiceSection = () => {
	// Define steps data for the Step component
	const steps = [
		{
			num: "1",
			title: "風鈴聊天室",
			subtitle: "免費測評房間/命理",
			image: "/images/hero/hero-1.png",
		},
		{
			num: "2",
			title: "分享報告",
			subtitle: "獲得付費測算優惠",
			image: "/images/hero/hero-2.png",
		},
		{
			num: "3",
			title: "填寫信息移動模組",
			subtitle: "輸入生辰八字",
			image: "/images/hero/hero-3.png",
		},
		{
			num: "4",
			title: "解鎖專屬定製報告",
			subtitle: "收到詳細分析和建議",
			image: "/images/hero/hero-4.png",
		},
	];

	return (
		<section
			className="w-full py-8 md:py-16 bg-[#EFEFEF] md:rounded-t-[80px] relative z-10"
			style={{
				marginTop: "-70px",
				paddingTop: "70px",
			}}
		>
			{/* Step Component at the top */}
			<div className="flex justify-center w-full mb-8 md:mb-16">
				<Step steps={steps} />
			</div>

			{/* Divider line */}
			<div className="w-full flex justify-center mb-8 md:mb-16">
				<hr className="w-3/4 md:w-1/2 border-t border-gray-300" />
			</div>

			<div className="w-full px-4 mx-auto sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80">
				{/* Feng Shui Service Card */}
				<div className="mb-8 md:mb-16">
					<div className="w-full">
						<div className="flex flex-col items-center gap-8 md:gap-8 lg:gap-20 lg:flex-row">
							{/* Left Content */}
							<div className="w-full p-4 md:p-6 lg:p-8 lg:w-1/2">
								<h2
									className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#635D3B]"
									style={{
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									風水測算
								</h2>

								<h3
									className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-[#A3B116] font-semibold mb-3 md:mb-4"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									洞悉宅運秘碼，調和天地之氣
								</h3>

								<p
									className="text-base md:text-lg lg:text-xl xl:text-2xl text-[#A3B116] font-medium mb-4 md:mb-6"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									讓家成為幸福與財運的源泉
								</p>

								<p
									className="mb-6 md:mb-8 leading-relaxed text-[#515151] text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									基於八宅理論與玄空飛星，結合八字、性別、房屋朝向與平面圖，量身策劃專屬您的風水格局。
								</p>

								<Link href="/price">
									<button className="bg-[#A3B116] hover:bg-[#8A9A14] text-white px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full font-bold transition-colors duration-300 w-full sm:w-auto">
										<span
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
											className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
										>
											開始風水測算
										</span>
									</button>
								</Link>
							</div>

							{/* Right Image */}
							<div className="relative w-full lg:w-1/2">
								<div className="relative flex items-center justify-center">
									<Image
										src="/images/hero/service-1.png"
										alt="風水測算服務"
										width={200}
										height={200}
										className="object-contain w-full h-auto max-w-full max-h-full"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Destiny Calculation Service Card */}
				<div className="mb-8 md:mb-16">
					<div className="w-full mx-auto">
						<div className="flex flex-col items-center gap-8 md:gap-12 lg:gap-20 lg:flex-row-reverse">
							{/* Right Content */}
							<div className="w-full p-4 md:p-6 lg:p-8 xl:p-12 lg:w-1/2">
								<h2
									className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#635D3B]"
									style={{
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									命理測算
								</h2>

								<h3
									className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-[#A3B116] font-semibold mb-3 md:mb-4"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									解讀生命密碼
								</h3>

								<p
									className="text-base md:text-lg lg:text-xl xl:text-2xl text-[#A3B116] font-medium mb-4 md:mb-6"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									指引您的智慧與幸運之路
								</p>

								<p
									className="mb-6 md:mb-8 leading-relaxed text-[#515151] text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									透過四柱八字、五行與十神深度解析個人命理，結合時期特質，為明路保途的助您把握人生關鍵。
								</p>

								<Link href="/price">
									<button className="bg-[#A3B116] hover:bg-[#8A9A14] text-white px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full font-bold transition-colors duration-300 w-full sm:w-auto">
										<span
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
											className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
										>
											開始命理測算
										</span>
									</button>
								</Link>
							</div>

							{/* Left Image */}
							<div className="relative w-full lg:w-1/2">
								<div className="relative flex items-center justify-center">
									<Image
										src="/images/hero/service-2.png"
										alt="命理測算服務"
										width={500}
										height={500}
										className="object-contain w-full h-auto max-w-full max-h-full"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ServiceSection;
