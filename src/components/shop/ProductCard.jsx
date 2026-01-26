"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Sparkles, ZoomIn } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function ProductCard({ product, onAddToCart }) {
	const locale = useLocale();
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [showZoom, setShowZoom] = useState(false);
	const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
	const imageRef = useRef(null);

	const handleAddToCart = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		setIsAddingToCart(true);
		try {
			await onAddToCart(product);
			toast.success(
				locale === "zh-CN" ? "已添加到购物车" : "已加入購物車",
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

	const discountedPrice = hasDiscount
		? product.price * (1 - product.discount.percentage / 100)
		: product.price;

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

	// Handle mouse movement for zoom
	const handleMouseMove = (e) => {
		if (!imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setZoomPosition({ x, y });
	};

	const handleMouseEnter = () => {
		setShowZoom(true);
	};

	const handleMouseLeave = () => {
		setShowZoom(false);
	};

	return (
		<Link href={`/${locale}/shop/product/${product._id}`}>
			<div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#1C312E] hover:-translate-y-2">
				{/* Product Image */}
				<div
					ref={imageRef}
					className="relative overflow-hidden aspect-square bg-gradient-to-br from-gray-50 to-gray-100"
					onMouseMove={handleMouseMove}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{product.images && product.images.length > 0 ? (
						<>
							<Image
								src={
									product.thumbnailImage || product.images[0]
								}
								alt={product.name[locale] || product.name.zh_TW}
								fill
								className="object-cover transition-transform duration-700 group-hover:scale-110"
								sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
							/>

							{/* Zoom Icon Indicator */}
							<div className="absolute z-10 transition-opacity duration-300 opacity-0 top-3 right-3 group-hover:opacity-100">
								<div className="p-2 rounded-full bg-black/50 backdrop-blur-sm">
									<ZoomIn className="w-4 h-4 text-white" />
								</div>
							</div>

							{/* Zoom Preview Popup */}
							{showZoom && (
								<div className="absolute inset-0 z-30 pointer-events-none">
									<div
										className="absolute right-0 top-0 w-[200%] h-[200%] border-4 border-white shadow-2xl rounded-lg overflow-hidden"
										style={{
											transform: "translate(50%, 0)",
											maxWidth: "400px",
											maxHeight: "400px",
										}}
									>
										<Image
											src={
												product.thumbnailImage ||
												product.images[0]
											}
											alt={`${product.name[locale] || product.name.zh_TW} - Zoomed`}
											fill
											className="object-cover"
											style={{
												transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
												transform: `scale(2)`,
												objectPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
											}}
											sizes="400px"
										/>
									</div>
								</div>
							)}
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

				{/* Product Info */}
				<div className="p-5 space-y-3">
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
						{product.name[locale] || product.name.zh_TW}
					</h3>

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
					{product.tags && product.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{product.tags.slice(0, 2).map((tag, index) => (
								<span
									key={index}
									className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#73897F]/10 to-[#73897F]/5 text-[#1C312E] rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Price and Actions */}
					<div className="flex items-center justify-between pt-3 border-t border-gray-100">
						<div className="flex flex-col">
							{hasDiscount && (
								<span className="text-xs text-gray-400 line-through">
									{product.currency === "HKD" && "HK$"}
									{product.currency === "CNY" && "¥"}
									{product.currency === "USD" && "$"}
									{product.price}
								</span>
							)}
							<span className="text-xl font-bold bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent">
								{product.currency === "HKD" && "HK$"}
								{product.currency === "CNY" && "¥"}
								{product.currency === "USD" && "$"}
								{hasDiscount
									? discountedPrice.toFixed(0)
									: product.price}
							</span>
						</div>

						<div className="flex gap-2">
							<Button
								size="sm"
								variant="ghost"
								className="w-10 h-10 p-0 transition-colors rounded-full hover:bg-red-50 hover:text-red-500"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									toast.success(
										locale === "zh-CN"
											? "已添加到收藏"
											: "已加入收藏",
									);
								}}
							>
								<Heart className="w-4 h-4" />
							</Button>
							<Button
								size="sm"
								className="h-10 px-4 rounded-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E] shadow-lg hover:shadow-xl transition-all"
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
