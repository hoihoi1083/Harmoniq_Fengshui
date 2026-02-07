"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import Navbar from "@/components/Navbar";
import FooterV2 from "@/components/home/FooterV2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ReportPreviewPage = () => {
	const locale = useLocale();
	const [email, setEmail] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [expandedContent, setExpandedContent] = useState(false);
	const [selectedRating, setSelectedRating] = useState("最經");

	const handleNewsletterSubmit = () => {
		// Function to be implemented
		console.log("Newsletter subscribed with email:", email);
		setEmail("");
	};

	const reviews = [
		{
			id: 1,
			author: "郭鈺",
			rating: 4,
			date: "01.01.2026",
			comment:
				"之前買過很購股票的美股跌片，很常常少了點什么。換成這個自水晶馬現材質，價格好，優勢卻跳搖了不夠！不太覺得，手機上去的溜。",
			verified: true,
		},
		{
			id: 2,
			author: "單加柔",
			rating: 4,
			date: "29.12.2025",
			comment:
				"卉洛的路人找操找我拔女化意見，溫白水晶欠太陽，馬顏旭佳佳氣，開幼架標篇正人。用了三個月，店裡的客流盤實有起來說，而且少了很多的時間分配，盡管商務仲沒人生了。",
			verified: true,
		},
	];

	return (
		<main className="w-full">
			{/* Navbar - Non-sticky */}
			<div className="[&>nav]:!relative [&>nav]:!top-auto">
				<Navbar />
			</div>

			{/* Main Content Area */}
			<div className="relative w-full pb-12 bg-white">
				{/* Breadcrumb Navigation */}
				<div className="px-4 py-8 bg-white ">
					<div className="container mx-auto">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<a
								href="/"
								className="text-gray-900 hover:text-[#8B9F3A]"
							>
								{locale === "zh-CN" ? "首頁" : "首頁"}
							</a>
							<span className="text-gray-400">{">"}</span>
							<span className="text-gray-900">
								{locale === "zh-CN"
									? "命理測算報告預覽"
									: "命理測算報告預覽"}
							</span>
						</div>
					</div>
				</div>

				{/* Content Section */}
				<section className="relative w-full px-4 ">
					<div className="container mx-auto">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* Left Column - Images */}
							<div className="px-6 ">
								<div className="space-y-4">
									{/* Report Preview Image */}
									<div className="relative w-full">
										<Image
											src="/images/report-preview/report.png"
											alt={
												locale === "zh-CN"
													? "報告預覽"
													: "報告預覽"
											}
											width={400}
											height={500}
											className="w-full h-auto rounded-lg"
										/>
									</div>
								</div>
							</div>

							{/* Right Column - Details */}
							<div className="space-y-6">
								{/* Title and Rating */}
								<div>
									<h1 className="text-2xl font-bold text-[#073E31] mb-3">
										{locale === "zh-CN"
											? "命理測算報告"
											: "命理測算報告"}
									</h1>
									<div className="flex items-center gap-2">
										<div className="flex text-yellow-400">
											{[...Array(4)].map((_, i) => (
												<span key={i}>★</span>
											))}
											<span className="text-gray-400">
												★
											</span>
										</div>
										<span className="font-semibold text-gray-600">
											4.5/5
										</span>
									</div>
								</div>

								{/* Price Section */}
								<div className="space-y-2">
									<div className="flex items-center gap-3">
										<span className="text-3xl font-bold text-[#073E31]">
											HK$88.00
										</span>
										<span className="text-lg text-gray-400 line-through">
											HK$188.00
										</span>
										<span className="px-3 py-1 text-sm font-bold text-red-500 rounded bg-red-50">
											-54%
										</span>
									</div>
								</div>

								{/* Description */}
								<div className="text-sm leading-relaxed text-gray-700">
									<p>
										{locale === "zh-CN"
											? "「金錢流年測算」結合傳統命理與現代符號論分，主要透過個人出生時間（八字、紀農「數字」）盤杞佔卜工具，來推測和分析未來一年（流年）中的財運管勢、擠發機會、財務風險以及應對方向。"
											: "「金錢流年測算」結合傳統命理與現代符號論分，主要透過個人出生時間（八字、紀農「數字」）盤杞佔卜工具，來推測和分析未來一年（流年）中的財運管勢、擠發機會、財務風險以及應對方向。"}
									</p>
								</div>

								{/* Expandable Content */}
								<button
									onClick={() =>
										setExpandedContent(!expandedContent)
									}
									className="flex items-center justify-between w-full px-4 py-3 font-semibold text-white transition bg-black rounded-full hover:bg-gray-900"
								>
									<span>
										{locale === "zh-CN"
											? "了解詳細報告內容"
											: "了解詳細報告內容"}
									</span>
									<span
										className={`transform transition ${
											expandedContent ? "rotate-180" : ""
										}`}
									>
										▼
									</span>
								</button>

								{/* Word Count */}
								<div className="flex items-center gap-3 text-sm">
									<span className="text-gray-600">
										{locale === "zh-CN" ? "字數" : "字數"}
									</span>
									<span className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg">
										{locale === "zh-CN"
											? "約15000字"
											: "約15000字"}
									</span>
								</div>

								{/* Quantity Selector */}
								{/* <div className="flex items-center gap-4">
									<button
										onClick={() =>
											setQuantity(
												Math.max(1, quantity - 1),
											)
										}
										className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
									>
										−
									</button>
									<span className="px-6 py-2 font-semibold border border-gray-300 rounded-lg">
										{quantity}
									</span>
									<button
										onClick={() =>
											setQuantity(quantity + 1)
										}
										className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
									>
										+
									</button>
								</div> */}

								{/* Action Buttons */}
								<div className="space-y-3">
									<button className="w-full px-4 py-3 font-semibold text-white transition bg-black rounded-full hover:bg-gray-900">
										{locale === "zh-CN"
											? "立即購買"
											: "立即購買"}
									</button>
								</div>

								{/* User Reviews Section */}
								<div className="pt-6 border-t">
									<div className="flex items-center justify-between mb-6">
										<h3 className="text-lg font-semibold text-[#073E31]">
											{locale === "zh-CN"
												? "用户評論"
												: "用户評論"}
										</h3>
										<div className="flex items-center gap-3">
											<select
												value={selectedRating}
												onChange={(e) =>
													setSelectedRating(
														e.target.value,
													)
												}
												className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg"
											>
												<option value="最經">
													{locale === "zh-CN"
														? "最經"
														: "最經"}
												</option>
												<option value="最新">
													{locale === "zh-CN"
														? "最新"
														: "最新"}
												</option>
											</select>
											<button className="bg-[#8B9F3A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#7a8e2f]">
												{locale === "zh-CN"
													? "寫評論"
													: "寫評論"}
											</button>
										</div>
									</div>

									{/* Rating Summary */}
									<div className="flex items-center gap-8 p-4 mb-6 rounded-lg bg-gray-50">
										<div>
											<div className="text-4xl font-bold text-[#073E31]">
												4.6
											</div>
										</div>
										<div className="flex-1 space-y-2">
											{[5, 4, 3, 2, 1].map((star) => (
												<div
													key={star}
													className="flex items-center gap-2"
												>
													<span className="w-4 text-sm text-gray-600">
														{star}
													</span>
													<div className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
														<div
															className="h-full bg-[#8B9F3A]"
															style={{
																width: `${
																	star === 5
																		? 90
																		: star ===
																			  4
																			? 75
																			: 50
																}%`,
															}}
														></div>
													</div>
													<span className="w-8 text-sm text-gray-600">
														123
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Review Cards */}
									<div className="space-y-4">
										{reviews.map((review) => (
											<div
												key={review.id}
												className="p-4 rounded-lg bg-gray-50"
											>
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-[#073E31]">
															{review.author}
														</span>
														{review.verified && (
															<span className="text-xs text-green-500">
																✓
															</span>
														)}
													</div>
													<span className="text-xs text-gray-500">
														{review.date}
													</span>
												</div>
												<div className="flex gap-1 mb-2">
													{[
														...Array(review.rating),
													].map((_, i) => (
														<span
															key={i}
															className="text-yellow-400"
														>
															★
														</span>
													))}
													{[
														...Array(
															5 - review.rating,
														),
													].map((_, i) => (
														<span
															key={i}
															className="text-gray-300"
														>
															★
														</span>
													))}
												</div>
												<p className="text-sm leading-relaxed text-gray-700">
													{review.comment}
												</p>
												<div className="flex items-center gap-4 mt-3">
													<button className="text-xs text-gray-500 hover:text-[#8B9F3A]">
														···
													</button>
												</div>
											</div>
										))}
									</div>

									{/* Load More Reviews */}
									<button className="w-full py-3 mt-6 font-semibold text-white transition bg-black rounded-full hover:bg-gray-900">
										{locale === "zh-CN"
											? "更多評價"
											: "更多評價"}
									</button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* More Calculations Section */}
			<section className="relative w-full px-4 py-12 bg-white">
				<div className="container mx-auto">
					<h2 className="text-3xl font-bold text-center text-[#073E31] mb-12">
						{locale === "zh-CN" ? "更多測算" : "更多測算"}
					</h2>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{/* Card 1 */}
						<div className="overflow-hidden transition border border-gray-200 rounded-2xl hover:shadow-lg">
							<div className="relative w-full overflow-hidden bg-gray-100 aspect-square">
								<Image
									src="/images/report-preview/fengshui.png"
									alt="風水運用測算"
									fill
									className="object-cover transition hover:scale-105"
								/>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-[#073E31] mb-2 text-sm">
									{locale === "zh-CN"
										? "風水運用測算"
										: "風水運用測算"}
								</h3>
								<div className="flex items-center gap-2">
									<span className="text-[#8B9F3A] font-bold">
										HK$88
									</span>
									<span className="text-sm text-gray-400 line-through">
										HK$368
									</span>
									<span className="text-xs font-semibold text-red-500">
										-76%
									</span>
								</div>
							</div>
						</div>

						{/* Card 2 */}
						<div className="overflow-hidden transition border border-gray-200 rounded-2xl hover:shadow-lg">
							<div className="relative w-full overflow-hidden bg-gray-100 aspect-square">
								<Image
									src="/images/report-preview/zodiac.png"
									alt="生肖運年測算"
									fill
									className="object-cover transition hover:scale-105"
								/>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-[#073E31] mb-2 text-sm">
									{locale === "zh-CN"
										? "生肖運年測算"
										: "生肖運年測算"}
								</h3>
								<div className="flex items-center gap-2">
									<span className="text-[#8B9F3A] font-bold">
										HK$88
									</span>
									<span className="text-sm text-gray-400 line-through">
										HK$188
									</span>
									<span className="text-xs font-semibold text-red-500">
										-53%
									</span>
								</div>
							</div>
						</div>

						{/* Card 3 */}
						<div className="overflow-hidden transition border border-gray-200 rounded-2xl hover:shadow-lg">
							<div className="relative w-full overflow-hidden bg-gray-100 aspect-square">
								<Image
									src="/images/report-preview/compatibility.png"
									alt="感情流年測算"
									fill
									className="object-cover transition hover:scale-105"
								/>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-[#073E31] mb-2 text-sm">
									{locale === "zh-CN"
										? "感情流年測算"
										: "感情流年測算"}
								</h3>
								<div className="flex items-center gap-2">
									<span className="text-[#8B9F3A] font-bold">
										HK$88
									</span>
									<span className="text-sm text-gray-400 line-through">
										HK$188
									</span>
									<span className="text-xs font-semibold text-red-500">
										-53%
									</span>
								</div>
							</div>
						</div>

						{/* Card 4 */}
						<div className="overflow-hidden transition border border-gray-200 rounded-2xl hover:shadow-lg">
							<div className="relative w-full overflow-hidden bg-gray-100 aspect-square">
								<Image
									src="/images/report-preview/destiny.png"
									alt="幸運地年分測算"
									fill
									className="object-cover transition hover:scale-105"
								/>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-[#073E31] mb-2 text-sm">
									{locale === "zh-CN"
										? "幸運地年分測算"
										: "幸運地年分測算"}
								</h3>
								<div className="flex items-center gap-2">
									<span className="text-[#8B9F3A] font-bold">
										HK$88
									</span>
									<span className="text-sm text-gray-400 line-through">
										HK$188
									</span>
									<span className="text-xs font-semibold text-red-500">
										-53%
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter Banner - Overlapping Footer */}
			<div className="relative z-10 -mb-6">
				<div className="container px-4 mx-auto">
					<div className="bg-[#8B9F3A] rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-8 py-10 md:px-12">
							<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
								<div className="text-white">
									<h2 className="text-2xl font-bold md:text-3xl">
										{locale === "zh-CN"
											? "随时了解"
											: "隨時了解"}
									</h2>
									<h2 className="text-2xl font-bold md:text-3xl">
										{locale === "zh-CN"
											? "我们的最新优惠"
											: "我們的最新優惠"}
									</h2>
								</div>
								<div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[400px]">
									<Input
										type="email"
										placeholder={
											locale === "zh-CN"
												? "输入您的电邮地址"
												: "輸入您的電郵地址"
										}
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="px-6 py-4 text-gray-800 bg-white rounded-full"
									/>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="px-8 py-4 font-bold text-gray-800 bg-white rounded-full hover:bg-gray-100"
									>
										{locale === "zh-CN"
											? "订阅我们"
											: "訂閱我們"}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<FooterV2 />
		</main>
	);
};

export default ReportPreviewPage;
