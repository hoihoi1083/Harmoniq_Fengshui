"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRegionDetectionWithRedirect } from "@/hooks/useRegionDetectionEnhanced";
import { getProductDisplayPrice } from "@/lib/productPrice";
import { getProductName } from "@/lib/productLocale";

export default function ProductCard({
	product,
	onAddToCart,
	showGiftReport = true,
}) {
	const locale = useLocale();
	const { region } = useRegionDetectionWithRedirect({
		skipFirstRedirect: true,
	});
	const display = getProductDisplayPrice(product, region);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [hoveredCell, setHoveredCell] = useState(null); // 0-8 for 3x3 grid, null when not hovering
	const [selectedGiftReport, setSelectedGiftReport] = useState(null);
	const [showGiftReportWarning, setShowGiftReportWarning] = useState(false);

	const images = product?.images?.length ? product.images : [];
	const activeImageIndex =
		images.length === 0 ? 0 : (hoveredCell !== null ? hoveredCell % images.length : 0);
	const displayImageSrc =
		images.length > 0
			? (activeImageIndex === 0 ? (product.thumbnailImage || images[0]) : images[activeImageIndex])
			: null;

	const GIFT_REPORT_LABELS = {
		wealth: locale === "zh-CN" ? "财运" : "財運",
		love: locale === "zh-CN" ? "感情" : "感情",
		career: locale === "zh-CN" ? "事业" : "事業",
		health: locale === "zh-CN" ? "健康" : "健康",
	};

	const handleAddToCart = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (showGiftReport) {
			const reportTypes = Array.isArray(product?.giftReportTypes)
				? product.giftReportTypes
				: [];
			if (reportTypes.length > 0 && !selectedGiftReport) {
				setShowGiftReportWarning(true);
				toast.error(
					locale === "zh-CN"
						? "请选择一种赠送报告类型"
						: "請選擇一種贈送報告類型",
				);
				return;
			}
			setShowGiftReportWarning(false);
		}

		setIsAddingToCart(true);
		try {
			await onAddToCart(
				product,
				showGiftReport ? selectedGiftReport || undefined : undefined,
			);
			const productName = getProductName(product, locale);
			const cartLabel = locale === "zh-CN" ? "查看购物车" : "查看購物車";
			const isMobile =
				typeof window !== "undefined" &&
				window.matchMedia &&
				window.matchMedia("(max-width: 640px)").matches;
			toast.success(
				<div className="flex flex-col gap-1">
					<span>
						{locale === "zh-CN" ? "已加入购物车：" : "已加入購物車："}
						{productName}
					</span>
					<button
						type="button"
						onClick={() => {
							if (typeof window !== "undefined") {
								window.location.href = `/${locale}/cart`;
							}
						}}
						className="text-left underline font-medium"
					>
						{cartLabel}
					</button>
				</div>,
				{
					autoClose: 2800,
					position: isMobile ? "bottom-center" : "top-right",
					closeOnClick: false,
				},
			);
		} catch (error) {
			toast.error(locale === "zh-CN" ? "添加失败" : "加入失敗");
		} finally {
			setIsAddingToCart(false);
		}
	};

	// Calculate discount
	const hasDiscount =
		product.discount &&
		product.discount.percentage > 0 &&
		(!product.discount.validUntil ||
			new Date(product.discount.validUntil) > new Date());

	const discountedPrice = display.discountedPrice;
	const displayPrice = display.price;
	const symbol = display.symbol;

	// Get product rating
	const rating = product.rating?.average || 0;
	const ratingCount = product.rating?.count || 0;

	// Get element emoji
	const getElementEmoji = (element) => {
		const elementEmojis = {
			wood: "🌳",
			fire: "🔥",
			earth: "🏔️",
			metal: "⚔️",
			water: "💧",
		};
		return elementEmojis[element] || "✨";
	};

	// Get element name
	const getElementName = (element) => {
		const elementNames = {
			wood: locale === "zh-CN" ? "木" : "木",
			fire: locale === "zh-CN" ? "火" : "火",
			earth: locale === "zh-CN" ? "土" : "土",
			metal: locale === "zh-CN" ? "金" : "金",
			water: locale === "zh-CN" ? "水" : "水",
		};
		return elementNames[element] || "";
	};

	return (
		<Link href={`/${locale}/shop/product/${product._id}`} className="h-full flex">
			<div className="group relative w-full h-full flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#1C312E] hover:-translate-y-2">
				{/* Product Image - 3x3 grid hover shows different image per cell */}
				<div
					className="relative overflow-hidden aspect-square flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100"
					onMouseLeave={() => setHoveredCell(null)}
				>
					{displayImageSrc ? (
						<>
							<Image
								key={activeImageIndex}
								src={displayImageSrc}
								alt={getProductName(product, locale)}
								fill
								className="object-cover transition-opacity duration-200"
								sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
							/>

							{/* Invisible 3x3 grid: hover each square to show a different image */}
							<div className="absolute inset-0 z-10 grid grid-cols-3 grid-rows-3">
								{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
									<div
										key={index}
										className="w-full h-full"
										onMouseEnter={() => setHoveredCell(index)}
										aria-hidden
									/>
								))}
							</div>
						</>
					) : (
						<div className="flex items-center justify-center h-full bg-gradient-to-br from-[#73897F]/10 to-[#73897F]/5">
							<Sparkles className="w-16 h-16 text-[#73897F]" />
						</div>
					)}

					{/* Gradient overlay on hover */}
					<div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/40 to-transparent group-hover:opacity-100" />

					{/* Badges */}
					<div className="absolute z-10 flex flex-col gap-2 top-3 left-3">
						{product.isFeatured && (
							<Badge className="text-white border-0 shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400">
								⭐ {locale === "zh-CN" ? "精选" : "精選"}
							</Badge>
						)}
						{hasDiscount && (
							<Badge className="font-bold text-white bg-red-500 border-0 shadow-lg">
								-{product.discount.percentage}%
							</Badge>
						)}
					</div>

					{/* Out of stock overlay */}
					{!product.isDigital && product.stock === 0 && (
						<div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
							<Badge
								variant="destructive"
								className="px-4 py-2 text-lg"
							>
								{locale === "zh-CN" ? "售罄" : "售罄"}
							</Badge>
						</div>
					)}
				</div>

				{/* Product Info - flex-1 so price/actions sit at bottom for equal-height cards */}
				<div className="flex-1 flex flex-col min-w-0 p-4 sm:p-5 space-y-3">
					{/* Element Badge */}
					{product.elementType && (
						<div>
							<Badge
								variant="outline"
								className="text-xs font-normal border-[#73897F]/30"
							>
								{getElementEmoji(product.elementType)}{" "}
								{getElementName(product.elementType)}
							</Badge>
						</div>
					)}

					{/* Product Name */}
					<h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] group-hover:text-[#1C312E] transition-colors">
						{getProductName(product, locale)}
					</h3>

					{/* Gift report type - fixed min-height so rating starts at same vertical position on every card (1 or 2 rows of tags) */}
					{showGiftReport &&
						Array.isArray(product?.giftReportTypes) &&
						product.giftReportTypes.length > 0 && (
							<div className="space-y-1.5 min-h-[5rem] sm:min-h-0">
								<span className="text-xs font-medium text-gray-600">
									{locale === "zh-CN"
										? "選擇贈送報告類型"
										: "選擇贈送報告類型"}
								</span>
								<div className="flex flex-wrap gap-1.5">
									{product.giftReportTypes.map((type) => (
										<button
											key={type}
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setSelectedGiftReport(
													selectedGiftReport === type
														? null
														: type,
												);
												setShowGiftReportWarning(false);
											}}
											className={`px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-all ${
												selectedGiftReport === type
													? "border-[#6B8E23] bg-[#6B8E23]/10 text-[#6B8E23]"
													: "border-gray-200 hover:border-gray-300"
											}`}
										>
											{GIFT_REPORT_LABELS[type] || type}
										</button>
									))}
								</div>
								{showGiftReportWarning && (
									<p
										role="alert"
										className="text-xs text-amber-600 font-medium flex items-center gap-1"
									>
										<span className="inline-flex w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[10px] items-center justify-center flex-shrink-0">
											!
										</span>
										{locale === "zh-CN"
											? "請先選擇贈送報告類型"
											: "請先選擇贈送報告類型"}
									</p>
								)}
							</div>
						)}

					{/* Star Rating */}
					{rating > 0 && (
						<div className="flex items-center gap-2">
							<div className="flex gap-0.5">
								{[...Array(5)].map((_, i) => {
									const fillPercentage = Math.min(
										Math.max(rating - i, 0),
										1,
									);
									return (
										<div
											key={i}
											className="relative w-4 h-4"
										>
											{/* Background star */}
											<svg
												className="absolute inset-0 text-gray-300"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
											{/* Filled star */}
											<div
												className="absolute inset-0 overflow-hidden"
												style={{
													width: `${fillPercentage * 100}%`,
												}}
											>
												<svg
													className="text-yellow-400"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
												</svg>
											</div>
										</div>
									);
								})}
							</div>
							<span className="text-xs text-gray-600">
								{rating.toFixed(1)}
								{ratingCount > 0 && ` (${ratingCount})`}
							</span>
						</div>
					)}

					{/* Tags */}
					{/* {product.tags && product.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{product.tags.map((tag, index) => (
								<span
									key={index}
									className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#73897F]/10 to-[#73897F]/5 text-[#1C312E] rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					)} */}

					{/* Price and Actions - on mobile stack so price has full width (no truncation) and buttons fit; equal-height: mt-auto */}
					<div className="pt-3 mt-auto border-t border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 min-w-0">
						{/* Price: own row on mobile so HK$949 always visible */}
						<div className="flex flex-col">
							{hasDiscount &&
								displayPrice !== discountedPrice && (
									<span className="text-xs text-gray-400 line-through">
										{symbol}
										{displayPrice.toFixed(0)}
									</span>
								)}
							<span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent">
								{symbol}
								{hasDiscount
									? discountedPrice.toFixed(0)
									: displayPrice.toFixed(0)}
							</span>
						</div>

						{/* Buttons: row below price on mobile, same row on sm+ */}
						<div className="flex gap-2 justify-end flex-shrink-0">
							<Button
								size="sm"
								className="h-9 w-9 sm:h-10 sm:px-4 sm:w-auto p-0 rounded-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E] shadow-lg hover:shadow-xl transition-all"
								onClick={handleAddToCart}
								disabled={
									(!product.isDigital &&
										product.stock === 0) ||
									isAddingToCart
								}
							>
								{isAddingToCart ? (
									<div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
								) : (
									<ShoppingCart className="w-4 h-4" />
								)}
							</Button>
						</div>
					</div>

					{/* Sold count */}
					{product.soldCount > 0 && (
						<div className="flex items-center gap-1 text-xs text-gray-500">
							<span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
							{locale === "zh-CN" ? "已售" : "已售"}{" "}
							{product.soldCount}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
