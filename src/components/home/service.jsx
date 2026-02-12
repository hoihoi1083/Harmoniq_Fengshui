"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Step from "./Step";
import ShopFeatureBanner from "./ShopFeatureBanner";
import ServiceDemoTags from "./ServiceDemoTags";
import useMobile from "../../app/hooks/useMobile";

const ServiceSection = () => {
	const t = useTranslations("home.services");
	const locale = useLocale();
	const isMobile = useMobile();
	const [isClient, setIsClient] = useState(false);
	const [products, setProducts] = useState([]);
	const [loadingProducts, setLoadingProducts] = useState(true);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const res = await fetch("/api/shop/products?limit=100");
				const data = await res.json();
				if (data.success) {
					setProducts(data.data.products || []);
				}
			} catch (error) {
				console.error("Failed to fetch products:", error);
			} finally {
				setLoadingProducts(false);
			}
		};

		fetchProducts();
	}, []);

	// Define steps data for the Step component
	const steps = [
		{
			num: "1",
			title: t("steps.step1.title"),
			subtitle: t("steps.step1.subtitle"),
			image: "/images/hero/hero-1.png",
		},
		{
			num: "2",
			title: t("steps.step2.title"),
			subtitle: t("steps.step2.subtitle"),
			image: "/images/hero/hero-2.png",
		},
		{
			num: "3",
			title: t("steps.step3.title"),
			subtitle: t("steps.step3.subtitle"),
			image: "/images/hero/hero-3.png",
		},
		{
			num: "4",
			title: t("steps.step4.title"),
			subtitle: t("steps.step4.subtitle"),
			image: "/images/hero/hero-4.png",
		},
	];

	const luckyProducts = products
		.filter((product) => product.isFeatured)
		.slice(0, 4);

	const hotProducts = products
		.filter((product) => (product.soldCount || product.sold || 0) > 0)
		.sort(
			(a, b) =>
				(b.soldCount || b.sold || 0) - (a.soldCount || a.sold || 0),
		)
		.slice(0, 4);

	// Horizontal carousel: touch + mouse drag to scroll (single row on small screens)
	const carouselScrollRef = useRef(null);
	const dragStartX = useRef(0);
	const dragScrollLeft = useRef(0);

	const handleCarouselDragStart = (e) => {
		const container = e.currentTarget;
		carouselScrollRef.current = container;
		dragStartX.current =
			e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
		dragScrollLeft.current = container.scrollLeft;
		if (e.type === "mousedown") {
			e.preventDefault();
			window.addEventListener("mousemove", handleCarouselDragMove);
			window.addEventListener("mouseup", handleCarouselDragEnd);
		}
	};

	const handleCarouselDragMove = (e) => {
		if (!carouselScrollRef.current) return;
		const x = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
		const dx = dragStartX.current - x;
		carouselScrollRef.current.scrollLeft = dragScrollLeft.current + dx;
		if (e.type === "touchmove") e.preventDefault();
	};

	const handleCarouselDragEnd = () => {
		window.removeEventListener("mousemove", handleCarouselDragMove);
		window.removeEventListener("mouseup", handleCarouselDragEnd);
		carouselScrollRef.current = null;
	};

	const handleCarouselTouchEnd = () => {
		carouselScrollRef.current = null;
	};

	return (
		<section
			className={`w-full md:py-16 py-8 bg-[#EFEFEF] rounded-t-[40px] md:rounded-t-[80px] relative z-10 `}
			style={{
				backgroundImage:
					"linear-gradient(to bottom, transparent 93%, rgba(239, 239, 239, 1.0) 100%), url(/images/hero/select-bg.png)",
				backgroundSize: "cover",
				backgroundPosition: "top",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Step Component at the top */}
			<div className="flex justify-center hidden w-full mb-3 md:block ">
				<Step steps={steps} />
			</div>

			{/* Shop Preview Section */}
			<div className="w-full px-4 mx-auto sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-80">
				{/* 2026 Lucky Crystals */}
				<section className="py-1 md:py-10">
					<h2
						className="text-4xl md:text-5xl lg:text-5xl font-bold text-center md:mb-20 mb-5 text-[#2C2C2C]"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						{locale === "zh-CN" ? "2026幸运水晶" : "2026幸運水晶"}
					</h2>
					{loadingProducts ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6B8E23] mx-auto mb-3" />
								<p className="text-sm text-gray-600">
									{locale === "zh-CN"
										? "加载中..."
										: "載入中..."}
								</p>
							</div>
						</div>
					) : luckyProducts.length > 0 ? (
						<>
							{/* Single-row carousel on small/mobile: touch + mouse drag */}
							<div
								className="flex md:hidden overflow-x-auto gap-4 mb-6 pb-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
								style={{
									scrollbarWidth: "none",
									msOverflowStyle: "none",
								}}
								onMouseDown={handleCarouselDragStart}
								onTouchStart={handleCarouselDragStart}
								onTouchMove={handleCarouselDragMove}
								onTouchEnd={handleCarouselTouchEnd}
							>
								{luckyProducts.map((product) => {
									const hasDiscount =
										product.discount &&
										product.discount.percentage > 0 &&
										(!product.discount.validUntil ||
											new Date(
												product.discount.validUntil,
											) > new Date());
									const discountedPrice = hasDiscount
										? product.price *
											(1 -
												product.discount.percentage /
													100)
										: product.price;
									const rating =
										product.rating?.average || 4.5;
									return (
										<div
											key={product._id}
											className="flex-shrink-0 w-[260px] snap-start"
										>
											<Link
												href={`/${locale}/shop/product/${product._id}`}
												className="group block"
											>
												<div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg">
													<div className="relative overflow-hidden bg-gray-100 aspect-square">
														{product.images
															?.length > 0 ? (
															<Image
																src={
																	product
																		.images[0]
																}
																alt={
																	product
																		.name[
																		locale
																	] ||
																	product.name
																		.zh_TW
																}
																fill
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																sizes="260px"
															/>
														) : (
															<div className="w-full h-full" />
														)}
													</div>
													<div className="p-3 space-y-2">
														<h3 className="text-sm font-semibold text-[#8B7355] line-clamp-2 min-h-[2.5rem]">
															{product.name[
																locale
															] ||
																product.name
																	.zh_TW}
														</h3>
														<div className="flex items-center gap-2">
															<div className="flex">
																{[
																	...Array(5),
																].map(
																	(_, i) => (
																		<svg
																			key={
																				i
																			}
																			className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																		</svg>
																	),
																)}
															</div>
															<span className="text-xs text-gray-500">
																{rating.toFixed(
																	1,
																)}
																/5
															</span>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-lg font-bold text-[#6B8E23]">
																HK$
																{hasDiscount
																	? discountedPrice.toFixed(
																			0,
																		)
																	: product.price}
															</span>
															{hasDiscount && (
																<>
																	<span className="text-xs text-gray-400 line-through">
																		HK$
																		{
																			product.price
																		}
																	</span>
																	<span className="text-xs font-semibold text-red-500">
																		-
																		{
																			product
																				.discount
																				.percentage
																		}
																		%
																	</span>
																</>
															)}
														</div>
													</div>
												</div>
											</Link>
										</div>
									);
								})}
							</div>
							{/* Grid on md+ */}
							<div className="hidden md:grid grid-cols-2 gap-4 mb-6 md:grid-cols-4 md:gap-6">
								{luckyProducts.map((product) => {
									const hasDiscount =
										product.discount &&
										product.discount.percentage > 0 &&
										(!product.discount.validUntil ||
											new Date(
												product.discount.validUntil,
											) > new Date());

									const discountedPrice = hasDiscount
										? product.price *
											(1 -
												product.discount.percentage /
													100)
										: product.price;

									const rating =
										product.rating?.average || 4.5;

									return (
										<Link
											key={product._id}
											href={`/${locale}/shop/product/${product._id}`}
											className="group"
										>
											<div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg">
												<div className="relative overflow-hidden bg-gray-100 aspect-square">
													{product.images &&
													product.images.length >
														0 ? (
														<Image
															src={
																product
																	.images[0]
															}
															alt={
																product.name[
																	locale
																] ||
																product.name
																	.zh_TW
															}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="(max-width: 768px) 50vw, 25vw"
														/>
													) : (
														<div className="w-full h-full" />
													)}
												</div>
												<div className="p-3 space-y-2">
													<h3 className="text-sm md:text-base font-semibold text-[#8B7355] line-clamp-2 min-h-[2.5rem]">
														{product.name[locale] ||
															product.name.zh_TW}
													</h3>
													<div className="flex items-center gap-2">
														<div className="flex">
															{[...Array(5)].map(
																(_, i) => (
																	<svg
																		key={i}
																		className={`w-3.5 h-3.5 ${
																			i <
																			Math.floor(
																				rating,
																			)
																				? "text-yellow-400"
																				: "text-gray-300"
																		}`}
																		fill="currentColor"
																		viewBox="0 0 20 20"
																	>
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																	</svg>
																),
															)}
														</div>
														<span className="text-xs text-gray-500">
															{rating.toFixed(1)}
															/5
														</span>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-lg font-bold text-[#6B8E23]">
															HK$
															{hasDiscount
																? discountedPrice.toFixed(
																		0,
																	)
																: product.price}
														</span>
														{hasDiscount && (
															<>
																<span className="text-xs text-gray-400 line-through">
																	HK$
																	{
																		product.price
																	}
																</span>
																<span className="text-xs font-semibold text-red-500">
																	-
																	{
																		product
																			.discount
																			.percentage
																	}
																	%
																</span>
															</>
														)}
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
							<div className="text-center md:mt-15 mt-5">
								<Link href={`/${locale}/shop/all`}>
									<button className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-8 py-3 rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all">
										{locale === "zh-CN"
											? "浏览更多"
											: "瀏覽更多"}
									</button>
								</Link>
							</div>
						</>
					) : null}
				</section>

				{/* Hot Products */}
				<section className="md:py-20 py-10">
					<h2
						className="text-4xl md:text-5xl lg:text-5xl font-bold text-center md:mb-20 mb-5 text-[#2C2C2C]"
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						}}
					>
						{locale === "zh-CN" ? "热销产品" : "熱銷產品"}
					</h2>
					{loadingProducts ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6B8E23] mx-auto mb-3" />
								<p className="text-sm text-gray-600">
									{locale === "zh-CN"
										? "加载中..."
										: "載入中..."}
								</p>
							</div>
						</div>
					) : hotProducts.length > 0 ? (
						<>
							{/* Single-row carousel on small/mobile */}
							<div
								className="flex md:hidden overflow-x-auto gap-4 mb-6 pb-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
								style={{
									scrollbarWidth: "none",
									msOverflowStyle: "none",
								}}
								onMouseDown={handleCarouselDragStart}
								onTouchStart={handleCarouselDragStart}
								onTouchMove={handleCarouselDragMove}
								onTouchEnd={handleCarouselTouchEnd}
							>
								{hotProducts.map((product) => {
									const hasDiscount =
										product.discount &&
										product.discount.percentage > 0 &&
										(!product.discount.validUntil ||
											new Date(
												product.discount.validUntil,
											) > new Date());
									const discountedPrice = hasDiscount
										? product.price *
											(1 -
												product.discount.percentage /
													100)
										: product.price;
									const rating =
										product.rating?.average || 4.5;
									return (
										<div
											key={product._id}
											className="flex-shrink-0 w-[260px] snap-start"
										>
											<Link
												href={`/${locale}/shop/product/${product._id}`}
												className="group block"
											>
												<div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg">
													<div className="relative overflow-hidden bg-gray-100 aspect-square">
														{product.images
															?.length > 0 ? (
															<Image
																src={
																	product
																		.images[0]
																}
																alt={
																	product
																		.name[
																		locale
																	] ||
																	product.name
																		.zh_TW
																}
																fill
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																sizes="260px"
															/>
														) : (
															<div className="w-full h-full" />
														)}
													</div>
													<div className="p-3 space-y-2">
														<h3 className="text-sm font-semibold text-[#8B7355] line-clamp-2 min-h-[2.5rem]">
															{product.name[
																locale
															] ||
																product.name
																	.zh_TW}
														</h3>
														<div className="flex items-center gap-2">
															<div className="flex">
																{[
																	...Array(5),
																].map(
																	(_, i) => (
																		<svg
																			key={
																				i
																			}
																			className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
																			fill="currentColor"
																			viewBox="0 0 20 20"
																		>
																			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																		</svg>
																	),
																)}
															</div>
															<span className="text-xs text-gray-500">
																{rating.toFixed(
																	1,
																)}
																/5
															</span>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-lg font-bold text-[#6B8E23]">
																HK$
																{hasDiscount
																	? discountedPrice.toFixed(
																			0,
																		)
																	: product.price}
															</span>
															{hasDiscount && (
																<>
																	<span className="text-xs text-gray-400 line-through">
																		HK$
																		{
																			product.price
																		}
																	</span>
																	<span className="text-xs font-semibold text-red-500">
																		-
																		{
																			product
																				.discount
																				.percentage
																		}
																		%
																	</span>
																</>
															)}
														</div>
													</div>
												</div>
											</Link>
										</div>
									);
								})}
							</div>
							{/* Grid on md+ */}
							<div className="hidden md:grid grid-cols-2 gap-4 mb-6 md:grid-cols-4 md:gap-6">
								{hotProducts.map((product) => {
									const hasDiscount =
										product.discount &&
										product.discount.percentage > 0 &&
										(!product.discount.validUntil ||
											new Date(
												product.discount.validUntil,
											) > new Date());

									const discountedPrice = hasDiscount
										? product.price *
											(1 -
												product.discount.percentage /
													100)
										: product.price;

									const rating =
										product.rating?.average || 4.5;

									return (
										<Link
											key={product._id}
											href={`/${locale}/shop/product/${product._id}`}
											className="group"
										>
											<div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg">
												<div className="relative overflow-hidden bg-gray-100 aspect-square">
													{product.images &&
													product.images.length >
														0 ? (
														<Image
															src={
																product
																	.images[0]
															}
															alt={
																product.name[
																	locale
																] ||
																product.name
																	.zh_TW
															}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="(max-width: 768px) 50vw, 25vw"
														/>
													) : (
														<div className="w-full h-full" />
													)}
												</div>
												<div className="p-3 space-y-2">
													<h3 className="text-sm md:text-base font-semibold text-[#8B7355] line-clamp-2 min-h-[2.5rem]">
														{product.name[locale] ||
															product.name.zh_TW}
													</h3>
													<div className="flex items-center gap-2">
														<div className="flex">
															{[...Array(5)].map(
																(_, i) => (
																	<svg
																		key={i}
																		className={`w-3.5 h-3.5 ${
																			i <
																			Math.floor(
																				rating,
																			)
																				? "text-yellow-400"
																				: "text-gray-300"
																		}`}
																		fill="currentColor"
																		viewBox="0 0 20 20"
																	>
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																	</svg>
																),
															)}
														</div>
														<span className="text-xs text-gray-500">
															{rating.toFixed(1)}
															/5
														</span>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-lg font-bold text-[#6B8E23]">
															HK$
															{hasDiscount
																? discountedPrice.toFixed(
																		0,
																	)
																: product.price}
														</span>
														{hasDiscount && (
															<>
																<span className="text-xs text-gray-400 line-through">
																	HK$
																	{
																		product.price
																	}
																</span>
																<span className="text-xs font-semibold text-red-500">
																	-
																	{
																		product
																			.discount
																			.percentage
																	}
																	%
																</span>
															</>
														)}
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
							<div className="text-center md:mt-15 mt-5">
								<Link href={`/${locale}/shop/all`}>
									<button className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-8 py-3 rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg transition-all">
										{locale === "zh-CN"
											? "浏览更多"
											: "瀏覽更多"}
									</button>
								</Link>
							</div>
						</>
					) : null}
				</section>

				<div className="md:mt-35 mt-1">
					<ShopFeatureBanner />
				</div>
				<div className="md:mt-15 mt-5">
					<ServiceDemoTags />
				</div>
			</div>
		</section>
	);
};

export default ServiceSection;
