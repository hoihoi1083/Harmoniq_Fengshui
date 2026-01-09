"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import Link from "next/link";
import ShopNavbar from "@/components/ShopNavbar";
import ProductCard from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
	Search,
	Filter,
	ShoppingCart,
	Sparkles,
	TrendingUp,
	Star,
	ChevronLeft,
	ChevronRight,
	Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function ShopPage() {
	const { data: session } = useSession();
	const locale = useLocale();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedElement, setSelectedElement] = useState("all");
	const [cartCount, setCartCount] = useState(0);
	const [currentReview, setCurrentReview] = useState(0);
	const [email, setEmail] = useState("");

	useEffect(() => {
		fetchProducts();
		if (session?.user) {
			fetchCartCount();
		}
	}, [session]);

	const fetchProducts = async () => {
		try {
			const res = await fetch("/api/shop/products?limit=100");
			const data = await res.json();
			if (data.success) {
				setProducts(data.data.products);
			}
		} catch (error) {
			console.error("Failed to fetch products:", error);
			toast.error(locale === "zh-CN" ? "加载商品失败" : "載入商品失敗");
		} finally {
			setLoading(false);
		}
	};

	const fetchCartCount = async () => {
		try {
			const res = await fetch("/api/shop/cart");
			const data = await res.json();
			if (data.success) {
				// Count total quantity of all items
				const totalQuantity = data.data.items.reduce(
					(total, item) => total + item.quantity,
					0
				);
				setCartCount(totalQuantity);
			}
		} catch (error) {
			console.error("Failed to fetch cart:", error);
		}
	};

	const handleAddToCart = async (product) => {
		if (!session?.user) {
			toast.error(locale === "zh-CN" ? "请先登录" : "請先登入");
			return;
		}

		try {
			const res = await fetch("/api/shop/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId: product._id,
					quantity: 1,
				}),
			});

			const data = await res.json();
			if (data.success) {
				// Count total quantity of all items
				const totalQuantity = data.data.items.reduce(
					(total, item) => total + item.quantity,
					0
				);
				setCartCount(totalQuantity);
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			throw error;
		}
	};

	// Filter products
	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			searchTerm === "" ||
			product.name.zh_TW
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			product.name.zh_CN
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			product.description.zh_TW
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			product.description.zh_CN
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesCategory =
			selectedCategory === "all" || product.category === selectedCategory;

		const matchesElement =
			selectedElement === "all" ||
			product.elementType === selectedElement;

		return matchesSearch && matchesCategory && matchesElement;
	});

	// Categories
	const categories = [
		{ value: "all", label: locale === "zh-CN" ? "全部" : "全部" },
		{ value: "charm", label: locale === "zh-CN" ? "开运物品" : "開運物品" },
		{
			value: "decoration",
			label: locale === "zh-CN" ? "风水摆设" : "風水擺設",
		},
		{ value: "ebook", label: locale === "zh-CN" ? "电子书" : "電子書" },
		{
			value: "service",
			label: locale === "zh-CN" ? "服务套餐" : "服務套餐",
		},
	];

	// Elements
	const elements = [
		{ value: "all", label: locale === "zh-CN" ? "全部" : "全部" },
		{ value: "wood", emoji: "🌳", label: locale === "zh-CN" ? "木" : "木" },
		{ value: "fire", emoji: "🔥", label: locale === "zh-CN" ? "火" : "火" },
		{
			value: "earth",
			emoji: "🏔️",
			label: locale === "zh-CN" ? "土" : "土",
		},
		{
			value: "metal",
			emoji: "⚔️",
			label: locale === "zh-CN" ? "金" : "金",
		},
		{
			value: "water",
			emoji: "💧",
			label: locale === "zh-CN" ? "水" : "水",
		},
	];

	// User reviews
	const reviews = [
		{
			name: locale === "zh-CN" ? "陈女士" : "陳女士",
			rating: 5,
			text:
				locale === "zh-CN"
					? "买了黄水晶手链后，工作上确实有了很多好机会！店家服务也很好，还送了一本电子指南。非常推荐！"
					: "買了黃水晶手鏈後，工作上確實有了很多好機會！店家服務也很好，還送了一本電子指南。非常推薦！",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "李先生" : "李先生",
			rating: 5,
			text:
				locale === "zh-CN"
					? "收到的水晶很漂亮，质量很好！按照八字推荐的元素选的，戴上后感觉运势确实有提升。会继续光顾！"
					: "收到的水晶很漂亮，質量很好！按照八字推薦的元素選的，戴上後感覺運勢確實有提升。會繼續光顧！",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "张女士" : "張女士",
			rating: 5,
			text:
				locale === "zh-CN"
					? "朋友推荐的这家店，果然没让我失望！水晶能量很强，包装精美，客服态度专业。已经介绍给身边朋友了。"
					: "朋友推薦的這家店，果然沒讓我失望！水晶能量很強，包裝精美，客服態度專業。已經介紹給身邊朋友了。",
			verified: true,
		},
	];

	// Categories for browsing section
	const browseCategories = [
		{
			name: locale === "zh-CN" ? "耳饰" : "耳飾",
			image: "/images/category-earrings.jpg",
			bgColor: "from-pink-50 to-purple-50",
		},
		{
			name: locale === "zh-CN" ? "手串" : "手串",
			image: "/images/category-bracelet.jpg",
			bgColor: "from-blue-50 to-indigo-50",
		},
		{
			name: locale === "zh-CN" ? "风水摆件" : "風水擺件",
			image: "/images/category-decoration.jpg",
			bgColor: "from-yellow-50 to-amber-50",
		},
		{
			name: locale === "zh-CN" ? "戒指" : "戒指",
			image: "/images/category-ring.jpg",
			bgColor: "from-rose-50 to-red-50",
		},
	];

	const handleNewsletterSubmit = (e) => {
		e.preventDefault();
		if (email) {
			toast.success(
				locale === "zh-CN" ? "订阅成功！" : "訂閱成功！"
			);
			setEmail("");
		}
	};

	// Get featured products (2026 Lucky Crystals)
	const luckyProducts = products.filter((p) => p.isFeatured).slice(0, 4);
	
	// Get hot products (best sellers) - use soldCount since it's the actual DB field
	const hotProducts = products
		.filter((p) => (p.soldCount || p.sold || 0) > 0)
		.sort((a, b) => (b.soldCount || b.sold || 0) - (a.soldCount || a.sold || 0))
		.slice(0, 4);

	const handleSearchFromNavbar = (term) => {
		setSearchTerm(term);
		// Scroll to all products section if searching
		if (term) {
			setTimeout(() => {
				document
					.getElementById("all-products")
					?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	};

	return (
		<div className="min-h-screen bg-white">
			<ShopNavbar cartCount={cartCount} onSearch={handleSearchFromNavbar} />

			{/* Hero Banner Section */}
			<section className="relative bg-gradient-to-br from-[#F5F5F0] via-[#FAFAF8] to-white py-20 lg:py-32 overflow-hidden">
				<div className="container px-4 mx-auto relative z-10">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<div className="space-y-6 lg:space-y-8">
							<div className="relative">
								<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#6B8E23] leading-tight">
									{locale === "zh-CN"
										? "探索与您气场相合的水晶能量"
										: "探索與您氣場相合的水晶能量"}
								</h1>
								{/* Decorative Sparkle */}
								<div className="absolute -right-4 top-0 text-[#8B9F3A] opacity-80">
									<svg
										width="48"
										height="48"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="animate-pulse"
									>
										<path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
									</svg>
								</div>
							</div>
							
							<p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
								{locale === "zh-CN"
									? "浏览我们品类丰富的开运佳品，所有物件均经匠心力作与能量加持，旨在助您调和命理格局，契合个人运势，激发专属您的正向能量。"
									: "瀏覽我們品類豐富的開運佳品，所有物件均經匠心力作與能量加持，旨在助您調和命理格局，契合個人運勢，激發專屬您的正向能量。"}
							</p>
							
							<Button
								size="lg"
								className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
								onClick={() => {
									document
										.getElementById("products-section")
										?.scrollIntoView({ behavior: "smooth" });
								}}
							>
								{locale === "zh-CN" ? "开始购物" : "開始購物"}
							</Button>
						</div>

						{/* Right Image */}
						<div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
							<div className="relative w-full h-full">
								<Image
									src="/images/shop-home/crystal.png"
									alt="Crystal Energy"
									fill
									className="object-contain drop-shadow-2xl"
									priority
									onError={(e) => {
										e.currentTarget.style.display = "none";
										e.currentTarget.nextElementSibling.style.display = "flex";
									}}
								/>
								{/* Fallback if image not found */}
								<div className="hidden absolute inset-0 items-center justify-center">
									<Sparkles className="w-32 h-32 text-[#6B8E23] opacity-20" />
								</div>
							</div>
							
							{/* Decorative Sparkles */}
							<div className="absolute bottom-20 right-10 text-[#8B9F3A] opacity-60 animate-pulse">
								<svg
									width="64"
									height="64"
									viewBox="0 0 24 24"
									fill="currentColor"
									style={{ animationDelay: "0.5s" }}
								>
									<path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
								</svg>
							</div>
							<div className="absolute top-20 left-10 text-[#8B9F3A] opacity-40 animate-pulse">
								<svg
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="currentColor"
									style={{ animationDelay: "1s" }}
								>
									<path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
				
				{/* Bottom Wave Decoration */}
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
			</section>

			{/* Black Divider Bar */}
			<section className="bg-gray-900 py-8">
				<div className="container px-4 mx-auto"></div>
			</section>

			{/* 2026 Lucky Crystals Section */}
			<section id="products-section" className="py-16 bg-white">
				<div className="container px-4 mx-auto">
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
						{locale === "zh-CN" ? "2026幸运水晶" : "2026幸運水晶"}
					</h2>
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6B8E23] mx-auto mb-4"></div>
								<p className="text-lg text-gray-600">
									{locale === "zh-CN" ? "加载中..." : "載入中..."}
								</p>
							</div>
						</div>
					) : luckyProducts.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
								{luckyProducts.map((product) => {
									const hasDiscount =
										product.discount &&
										product.discount.percentage > 0 &&
										(!product.discount.validUntil ||
											new Date(product.discount.validUntil) > new Date());

									const discountedPrice = hasDiscount
										? product.price * (1 - product.discount.percentage / 100)
										: product.price;

									// Use actual product rating or default to 4.5
									const rating = product.rating?.average || 4.5;
									const ratingCount = product.rating?.count || 0;

									return (
										<Link
											key={product._id}
											href={`/${locale}/shop/product/${product._id}`}
											className="group"
										>
											<div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
												{/* Product Image */}
												<div className="relative aspect-square overflow-hidden bg-gray-100">
													{product.images && product.images.length > 0 ? (
														<Image
															src={product.images[0]}
															alt={product.name[locale] || product.name.zh_TW}
															fill
															className="object-cover group-hover:scale-110 transition-transform duration-500"
															sizes="(max-width: 768px) 50vw, 25vw"
														/>
													) : (
														<div className="flex items-center justify-center h-full">
															<Sparkles className="w-16 h-16 text-gray-300" />
														</div>
													)}
												</div>

												{/* Product Info */}
												<div className="p-4 space-y-2">
													{/* Product Name */}
													<h3 className="font-semibold text-[#8B7355] text-base line-clamp-2 min-h-[3rem]">
														{product.name[locale] || product.name.zh_TW}
													</h3>

													{/* Star Rating */}
													<div className="flex items-center gap-2">
														<div className="flex gap-0.5">
															{[...Array(5)].map((_, i) => {
																const fillPercentage = Math.min(
																	Math.max(rating - i, 0),
																	1
																);
																return (
																	<div key={i} className="relative w-4 h-4">
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
														<span className="text-sm text-gray-600">
															{rating}/5
														</span>
													</div>

													{/* Price */}
													<div className="flex items-center gap-2">
														<span className="text-2xl font-bold text-[#6B8E23]">
															${hasDiscount ? discountedPrice.toFixed(0) : product.price}
														</span>
														{hasDiscount && (
															<>
																<span className="text-sm text-gray-400 line-through">
																	${product.price}
																</span>
																<span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">
																	-{product.discount.percentage}%
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
							<div className="text-center">
								<Button
									size="lg"
									className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
									onClick={() => {
										document
											.getElementById("all-products")
											?.scrollIntoView({ behavior: "smooth" });
									}}
								>
									{locale === "zh-CN" ? "浏览更多" : "瀏覽更多"}
								</Button>
							</div>
						</>
					) : (
						<div className="text-center py-12">
							<p className="text-gray-500">
								{locale === "zh-CN"
									? "暂无精选商品"
									: "暫無精選商品"}
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Hot Products Section */}
			<section id="hot-products" className="py-16 bg-white border-t border-gray-200">
				<div className="container px-4 mx-auto">
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
						{locale === "zh-CN" ? "热销产品" : "熱銷產品"}
					</h2>
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2E7D32] mx-auto mb-4"></div>
								<p className="text-lg text-gray-600">
									{locale === "zh-CN" ? "加载中..." : "載入中..."}
								</p>
							</div>
						</div>
					) : hotProducts.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
								{hotProducts.map((product) => {
									const hasDiscount =
										product.discount &&
										product.discount.percentage > 0 &&
										(!product.discount.validUntil ||
											new Date(product.discount.validUntil) > new Date());

									const discountedPrice = hasDiscount
										? product.price * (1 - product.discount.percentage / 100)
										: product.price;

									const rating = product.rating?.average || 4.0;
									const ratingCount = product.rating?.count || 0;
									const soldCount = product.soldCount || product.sold || 0;

									return (
										<Link
											key={product._id}
											href={`/${locale}/shop/product/${product._id}`}
											className="group"
										>
											<div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
												{/* Product Image with Badges */}
												<div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
													{product.images && product.images.length > 0 ? (
														<Image
															src={product.images[0]}
															alt={product.name[locale] || product.name.zh_TW}
															fill
															className="object-cover group-hover:scale-105 transition-transform duration-700"
															sizes="(max-width: 768px) 100vw, 33vw"
														/>
													) : (
														<div className="flex items-center justify-center h-full">
															<TrendingUp className="w-20 h-20 text-gray-300" />
														</div>
													)}
													
													{/* Hot Badge */}
													<div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
														🔥 {locale === "zh-CN" ? "热销" : "熱銷"}
													</div>
													
													{/* Discount Badge */}
													{hasDiscount && (
														<div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
															-{product.discount.percentage}%
														</div>
													)}
													
													{/* Element Badge */}
													{product.elementType && product.elementType !== "none" && (
														<div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
															{product.elementType === "wood" && "🌳"}
															{product.elementType === "fire" && "🔥"}
															{product.elementType === "earth" && "🌍"}
															{product.elementType === "metal" && "⚙️"}
															{product.elementType === "water" && "💧"}
															{product.elementType}
														</div>
													)}
												</div>

												{/* Product Info */}
												<div className="p-5 space-y-3 flex flex-col flex-grow">
													{/* Category Tags */}
													<div className="flex gap-2 flex-wrap min-h-[28px]">
														{product.tags && product.tags.slice(0, 2).map((tag, idx) => (
															<span key={idx} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full font-medium">
																{tag}
															</span>
														))}
													</div>
													
													{/* Product Name */}
													<h3 className="font-bold text-gray-900 text-lg line-clamp-2 h-14 group-hover:text-[#6B8E23] transition-colors">
														{product.name[locale] || product.name.zh_TW}
													</h3>

													{/* Rating & Sold Count */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1">
															<div className="flex">
																{[...Array(5)].map((_, i) => (
																	<svg
																		key={i}
																		className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
																		fill="currentColor"
																		viewBox="0 0 20 20"
																	>
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																	</svg>
																))}
															</div>
															<span className="text-xs text-gray-600 ml-1">
																{rating.toFixed(1)} ({ratingCount > 0 ? ratingCount : "100"})
															</span>
														</div>
														<span className="text-xs text-gray-500">
															{locale === "zh-CN" ? "已售" : "已售"} {soldCount}
														</span>
													</div>

													{/* Price & Action */}
													<div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
														<div className="flex flex-col">
															{hasDiscount && (
																<span className="text-xs text-gray-400 line-through">
																	HK${product.price}
																</span>
															)}
															<span className="text-2xl font-bold text-[#6B8E23]">
																HK${hasDiscount ? discountedPrice.toFixed(0) : product.price}
															</span>
														</div>
														<div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6B8E23] text-white group-hover:bg-[#2E7D32] transition-colors">
															<ShoppingCart className="w-5 h-5" />
														</div>
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
							<div className="text-center">
								<Button
									size="lg"
									className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
									onClick={() => {
										document
											.getElementById("all-products")
											?.scrollIntoView({ behavior: "smooth" });
									}}
								>
									{locale === "zh-CN" ? "浏览更多" : "瀏覽更多"}
								</Button>
							</div>
						</>
					) : (
						<div className="text-center py-12">
							<p className="text-gray-500">
								{locale === "zh-CN"
									? "暂无热销商品"
									: "暫無熱銷商品"}
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Category Browse Section */}
			<section className="py-16 bg-white">
				<div className="container px-4 mx-auto max-w-6xl">
					<div className="bg-[#F0F0F0] rounded-[3rem] p-8 md:p-12 border-4 border-[#A3A3A3]">
						<h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
							{locale === "zh-CN" ? "分类浏览" : "分類瀏覽"}
						</h2>
						<div className="space-y-6">
							{/* First Row: 耳飾 40% + 手串 60% */}
							<div className="grid gap-6" style={{ gridTemplateColumns: '40% 60%' }}>
								{/* 耳飾 - 40% */}
								<Link
									href={`/${locale}/shop/all`}
							onClick={() => {
								if (typeof window !== 'undefined') {
									sessionStorage.setItem('selectedCategory', 'earring');
								}
							}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div className="relative w-full" style={{ aspectRatio: '814 / 578' }}>
										<Image
											src="/images/shop-home/earring.png"
											alt={locale === "zh-CN" ? "耳饰" : "耳飾"}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>

								{/* 手串 - 60% */}
								<Link
									href={`/${locale}/shop/all`}
							onClick={() => {
								if (typeof window !== 'undefined') {
									sessionStorage.setItem('selectedCategory', 'bracelet');
								}
							}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div className="relative w-full" style={{ aspectRatio: '1368 / 578' }}>
										<Image
											src="/images/shop-home/bracelet.png"
											alt={locale === "zh-CN" ? "手串" : "手串"}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>
							</div>

							{/* Second Row: 風水擺件 70% + 戒指 30% */}
							<div className="grid gap-6" style={{ gridTemplateColumns: '70% 30%' }}>
								{/* 風水擺件 - 70% */}
								<Link
									href={`/${locale}/shop/all`}
							onClick={() => {
								if (typeof window !== 'undefined') {
									sessionStorage.setItem('selectedCategory', 'feng-shui');
								}
							}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div className="relative w-full" style={{ aspectRatio: '1368 / 578' }}>
										<Image
											src="/images/shop-home/fengshuiproduct.png"
											alt={locale === "zh-CN" ? "风水摆件" : "風水擺件"}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>

								{/* 戒指 - 30% */}
								<Link
									href={`/${locale}/shop/all`}
							onClick={() => {
								if (typeof window !== 'undefined') {
									sessionStorage.setItem('selectedCategory', 'ring');
								}
							}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div className="relative w-full" style={{ aspectRatio: '814 / 578' }}>
										<Image
											src="/images/shop-home/ring.png"
											alt={locale === "zh-CN" ? "戒指" : "戒指"}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* User Reviews Section */}
			<section className="py-16 bg-white">
				<div className="container px-4 mx-auto max-w-7xl">
					<div className="flex items-center justify-between mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							{locale === "zh-CN" ? "用户评价" : "用戶評價"}
						</h2>
						<div className="flex gap-3">
							<button
								onClick={() =>
									setCurrentReview((prev) =>
										prev === 0 ? reviews.length - 1 : prev - 1
									)
								}
								className="w-10 h-10 rounded-full bg-white border-2 border-[#8B7355] flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition-all"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button
								onClick={() =>
									setCurrentReview((prev) =>
										prev === reviews.length - 1 ? 0 : prev + 1
									)
								}
								className="w-10 h-10 rounded-full bg-white border-2 border-[#8B7355] flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition-all"
							>
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>
					</div>
					<div className="relative overflow-visible">
						{/* Review Cards */}
						<div
							className="flex transition-all duration-500 ease-in-out gap-6 justify-center items-center"
						>
							{reviews.map((review, index) => {
								// Calculate positions relative to current review
								const isActive = index === currentReview;
								const isPrev = index === (currentReview - 1 + reviews.length) % reviews.length;
								const isNext = index === (currentReview + 1) % reviews.length;
								const isPrev2 = index === (currentReview - 2 + reviews.length) % reviews.length;
								const isNext2 = index === (currentReview + 2) % reviews.length;
								
								const isVisible = isActive || isPrev || isNext || isPrev2 || isNext2;
								
								if (!isVisible) return null;

								return (
									<div
										key={index}
										className="flex-shrink-0 w-[280px] opacity-100 scale-100 transition-all duration-500"
									>
										<div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200 h-full">
											{/* Stars */}
											<div className="flex gap-1 mb-3">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className="w-5 h-5 fill-yellow-400 text-yellow-400"
													/>
												))}
											</div>
											{/* User Info */}
											<div className="flex items-center gap-2 mb-3">
												<p className="font-bold text-base text-[#8B7355]">
													{review.name}
												</p>
												{review.verified && (
													<div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
														<span className="text-white text-xs">✓</span>
													</div>
												)}
											</div>
											{/* Review Text */}
											<p className="text-gray-700 leading-relaxed text-sm">
												{review.text}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter Banner - Overlapping Footer */}
			<div className="relative z-10 -mb-16">
				<div className="container px-4 mx-auto">
					<div className="bg-[#8B9F3A] rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-8 md:px-12 py-10">
							<div className="flex flex-col md:flex-row items-center justify-between gap-8">
								<div className="text-white">
									<h2 className="text-2xl md:text-3xl font-bold">
										{locale === "zh-CN" ? "随时了解" : "隨時了解"}
									</h2>
									<h2 className="text-2xl md:text-3xl font-bold">
										{locale === "zh-CN" ? "我们的最新优惠" : "我們的最新優惠"}
									</h2>
								</div>
								<div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[400px]">
									<Input
										type="email"
										placeholder={locale === "zh-CN" ? "输入您的电邮地址" : "輸入您的電郵地址"}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="bg-white rounded-full px-6 py-4 text-gray-800"
									/>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-8 py-4 font-bold"
									>
										{locale === "zh-CN" ? "订阅我们" : "訂閱我們"}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-[#2C2C2C] text-white pt-24 pb-8">
				<div className="container px-4 mx-auto py-12">
					{/* Top Section */}
					<div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
						{/* Left Side - Logo and Links */}
						<div className="flex flex-col md:flex-row items-start gap-12">
							<div>
							<div className="mb-6">
								<Image
									src="/images/logo/logo-desktop.png"
									alt="HarmoniQ Logo"
									width={681}
									height={132}
									className="h-8 w-auto"
									style={{
										filter: "brightness(0) invert(1)",
									}}
									quality={100}
								/>
							</div>
							<div className="flex gap-6 text-white">
								<a href={`/${locale}/about`} className="hover:text-[#8B9F3A] transition-colors">
									{locale === "zh-CN" ? "关于我们" : "關於我們"}
								</a>
								<a href={`/${locale}/privacy`} className="hover:text-[#8B9F3A] transition-colors">
									{locale === "zh-CN" ? "隐私政策" : "隱私政策"}
								</a>
								<a href={`/${locale}/terms`} className="hover:text-[#8B9F3A] transition-colors">
									{locale === "zh-CN" ? "用户条款" : "用戶條款"}
								</a>
							</div>
							<div className="flex gap-4 mt-6">
								<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
									<Image
										src="/images/footer/Facebook.png"
										alt="Facebook"
										width={40}
										height={40}
										className="w-10 h-10"
									/>
								</a>
								<a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
									<Image
										src="/images/footer/Instagram.png"
										alt="Instagram"
										width={40}
										height={40}
										className="w-10 h-10"
									/>
								</a>
							</div>
							</div>

						</div>
						{/* Right Side - Contact Form */}
						<div className="w-full md:w-auto">
							<div className="inline-block bg-[#8B9F3A] text-[#2C2C2C] px-4 py-2 rounded-full font-bold mb-4">
								{locale === "zh-CN" ? "联系我们：" : "聯絡我們："}
							</div>
							<div className="space-y-3 mb-6">
								<p className="text-white">{locale === "zh-CN" ? "电邮" : "電郵"}: info@gmail.com</p>
								<p className="text-white">{locale === "zh-CN" ? "电话" : "電話"}: +852 0000 0000</p>
							</div>
							<div className="flex gap-3">
								<Input
									type="email"
									placeholder={locale === "zh-CN" ? "您的电邮" : "您的電郵"}
									className="bg-transparent border-2 border-white text-white placeholder:text-white/60 rounded-full px-6 py-3"
								/>
								<Button className="bg-[#8B9F3A] hover:bg-[#6B8E23] text-[#2C2C2C] rounded-full px-8 py-3 font-bold">
									{locale === "zh-CN" ? "联系我们" : "聯絡我們"}
								</Button>
							</div>
						</div>
					</div>

					{/* Bottom Section */}
					<div className="border-t border-gray-700 pt-8 mt-8">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-gray-400 text-sm">
								© 2025 HarmoniQ. {locale === "zh-CN" ? "保留所有权利" : "保留所有權利"}.
							</p>
							<div className="flex gap-2 items-center">
								{/* Visa */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<path d="M20.5 10.5L17.5 21.5H14.5L12.5 13C12.4 12.6 12.2 12.3 11.9 12.2C11.3 11.9 10.4 11.6 9.5 11.4L9.6 11H14.5C15.1 11 15.6 11.4 15.7 12L16.7 17.5L19.2 11H22.2L20.5 10.5ZM30.5 17.8C30.5 15.2 26.8 15 26.8 13.8C26.8 13.4 27.2 13 28.1 12.9C28.5 12.8 29.6 12.7 30.9 13.3L31.4 11.4C30.8 11.2 30 11 29 11C26.2 11 24.2 12.6 24.2 14.8C24.2 16.5 25.7 17.4 26.8 18C28 18.6 28.4 19 28.4 19.5C28.4 20.3 27.5 20.7 26.7 20.7C25.5 20.7 24.9 20.5 23.9 20L23.4 22C24.4 22.4 25.3 22.5 26.7 22.5C29.7 22.5 31.6 20.9 31.6 18.6L30.5 17.8ZM38.5 21.5H41L38.8 11H36.4C35.9 11 35.5 11.3 35.3 11.7L31.5 21.5H34.5L35.1 20H38.8L38.5 21.5ZM36.2 13.5L37.5 17.5H35.5L36.2 13.5ZM26.5 11L24.5 21.5H21.8L23.8 11H26.5Z" fill="#1434CB"/>
									</svg>
								</div>
								{/* Mastercard */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<circle cx="18" cy="16" r="10" fill="#EB001B"/>
										<circle cx="30" cy="16" r="10" fill="#F79E1B" fillOpacity="0.8"/>
									</svg>
								</div>
								{/* PayPal */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<path d="M20.5 9H15.5L12.5 23H16L18 13C18.2 11.9 19.1 11 20.2 11H23C25.2 11 26.5 12.3 26.5 14.5C26.5 16.7 24.8 18.5 22.5 18.5H21L20 23H22.5C27.2 23 31 19.2 31 14.5C31 9.8 27.2 9 24.5 9H20.5Z" fill="#003087"/>
										<path d="M17 16H14L12 23H15L17 16Z" fill="#009CDE"/>
									</svg>
								</div>
								{/* Apple Pay */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<path d="M16.5 11.5C17.2 10.6 17.7 9.3 17.5 8C16.4 8.1 15.1 8.8 14.3 9.7C13.6 10.5 13 11.8 13.2 13.1C14.4 13.2 15.7 12.5 16.5 11.5ZM17.5 13.3C15.8 13.2 14.3 14.3 13.5 14.3C12.7 14.3 11.4 13.4 10.1 13.4C8.4 13.4 6.8 14.4 5.9 16C4.1 19.1 5.4 23.7 7.1 26.2C7.9 27.4 8.9 28.7 10.1 28.7C11.4 28.6 11.9 27.9 13.4 27.9C14.9 27.9 15.3 28.7 16.7 28.7C18.1 28.7 19 27.5 19.8 26.3C20.7 24.9 21.1 23.6 21.1 23.5C21.1 23.5 18.4 22.4 18.4 19.3C18.4 16.7 20.5 15.5 20.6 15.4C19.4 13.6 17.6 13.4 17.5 13.3Z" fill="#000000"/>
										<path d="M28 13.5H31.5C33.4 13.5 34.5 14.6 34.5 16.2C34.5 17.8 33.3 19 31.4 19H29.5V22H28V13.5ZM29.5 17.8H31.2C32.4 17.8 33 17.2 33 16.2C33 15.2 32.4 14.7 31.2 14.7H29.5V17.8ZM35.5 19.8C35.5 18.3 36.6 17.3 38.5 17.3C39.2 17.3 39.8 17.4 40.2 17.6V17.3C40.2 16.4 39.7 15.9 38.7 15.9C38 15.9 37.5 16.2 37.3 16.6H36C36.2 15.4 37.3 14.6 38.8 14.6C40.5 14.6 41.5 15.5 41.5 17V22H40.2V21.1H40.1C39.7 21.7 39 22 38.2 22C36.8 22 35.5 21.2 35.5 19.8ZM40.2 19.2V18.9C39.9 18.7 39.4 18.6 38.8 18.6C37.8 18.6 37.1 19 37.1 19.7C37.1 20.4 37.7 20.8 38.5 20.8C39.5 20.8 40.2 20.2 40.2 19.2ZM42.5 26V24.8C42.7 24.9 43 24.9 43.2 24.9C44 24.9 44.4 24.6 44.7 23.7L44.8 23.4L42 14.8H43.6L45.5 21.7H45.6L47.5 14.8H49L46.2 23.8C45.6 25.5 44.9 26 43.3 26C43.1 26 42.7 26 42.5 26Z" fill="#000000"/>
									</svg>
								</div>
								{/* Google Pay */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<path d="M22.5 16.5V20H27.3C27.1 21.3 25.9 23.8 22.5 23.8C19.5 23.8 17.1 21.3 17.1 18.2C17.1 15.1 19.5 12.6 22.5 12.6C24.2 12.6 25.4 13.3 26.1 14L28.9 11.3C27.2 9.7 25 8.8 22.5 8.8C17.5 8.8 13.5 12.8 13.5 17.8C13.5 22.8 17.5 26.8 22.5 26.8C27.7 26.8 31 23.3 31 18.3C31 17.6 30.9 17.1 30.8 16.5H22.5Z" fill="#4285F4"/>
										<path d="M36 13.5H34V11.5H32V13.5H30V15.5H32V17.5H34V15.5H36V13.5Z" fill="#EA4335"/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
