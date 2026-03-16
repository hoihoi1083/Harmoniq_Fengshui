"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import Link from "next/link";
import ShopNavbar from "@/components/ShopNavbar";
import ProductCard from "@/components/shop/ProductCard";
import FooterV2 from "@/components/home/FooterV2";
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
import { useRegionDetectionWithRedirect } from "@/hooks/useRegionDetectionEnhanced";
import { getProductDisplayPrice } from "@/lib/productPrice";

export default function ShopPage() {
	const { data: session } = useSession();
	const locale = useLocale();
	const { region } = useRegionDetectionWithRedirect({
		skipFirstRedirect: true,
	});
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
					0,
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
					0,
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
			toast.success(locale === "zh-CN" ? "订阅成功！" : "訂閱成功！");
			setEmail("");
		}
	};

	// Get featured products (2026 Lucky Crystals)
	const luckyProducts = products.filter((p) => p.isFeatured).slice(0, 4);

	// Get hot products (best sellers) - use soldCount since it's the actual DB field
	const hotProducts = products
		.filter((p) => (p.soldCount || p.sold || 0) > 0)
		.sort(
			(a, b) =>
				(b.soldCount || b.sold || 0) - (a.soldCount || a.sold || 0),
		)
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
			<ShopNavbar
				cartCount={cartCount}
				onSearch={handleSearchFromNavbar}
			/>

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
										?.scrollIntoView({
											behavior: "smooth",
										});
								}}
							>
								{locale === "zh-CN" ? "开始购物" : "開始購物"}
							</Button>
						</div>

						{/* Right Image */}
						<div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
							<div className="relative w-full h-full">
								<Image
									src="/images/Shop-home/Crystal.png"
									alt="Crystal Energy"
									fill
									className="object-contain drop-shadow-2xl"
									priority
									onError={(e) => {
										e.currentTarget.style.display = "none";
										e.currentTarget.nextElementSibling.style.display =
											"flex";
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
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
						{locale === "zh-CN" ? "2026幸运水晶" : "2026幸運水晶"}
					</h2>
					<p className="text-xs md:text-sm text-center text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
						{locale === "zh-CN" ? (
							<>
								2026年是丙午火马年，气场「火」元素非常旺盛。因此，今年挑选幸运水晶的核心逻辑，不再是单纯地「生火」，而是要「平衡」与「转化」这股强大的能量，使之为己所用。
								<br />
								土属性(黄色系)水晶，将过旺的火气转化为稳定的财气与执行力。
								<br />
								水属性(黑色、蓝色系)水晶，制衡过旺的火，让人冷静思考，守住财库。
								<br />
								白色、紫色系水晶安神静心，减少因烦躁而引发的口舌是非。
							</>
						) : (
							<>
								2026年是丙午火馬年，氣場「火」元素非常旺盛。因此，今年挑選幸運水晶的核心邏輯，不再是單純地「生火」，而是要「平衡」與「轉化」這股強大的能量，使之為己所用。
								<br />
								土屬性(黃色系)水晶，將過旺的火氣轉化為穩定的財氣與執行力。
								<br />
								水屬性(黑色、藍色系)水晶，制衡過旺的火，讓人冷靜思考，守住財庫。
								<br />
								白色、紫色系水晶安神靜心，減少因煩躁而引發的口舌是非。
							</>
						)}
					</p>
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6B8E23] mx-auto mb-4"></div>
								<p className="text-lg text-gray-600">
									{locale === "zh-CN"
										? "加载中..."
										: "載入中..."}
								</p>
							</div>
						</div>
					) : luckyProducts.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
								{luckyProducts.map((product) => (
									<ProductCard
										key={product._id}
										product={product}
										onAddToCart={(p) => handleAddToCart(p)}
										showGiftReport={false}
									/>
								))}
							</div>
							<div className="text-center">
								<Link href={`/${locale}/shop/all`}>
									<Button
										size="lg"
										className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
									>
										{locale === "zh-CN"
											? "浏览更多"
											: "瀏覽更多"}
									</Button>
								</Link>
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
			<section
				id="hot-products"
				className="py-16 bg-white border-t border-gray-200"
			>
				<div className="container px-4 mx-auto">
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
						{locale === "zh-CN" ? "热销产品" : "熱銷產品"}
					</h2>
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2E7D32] mx-auto mb-4"></div>
								<p className="text-lg text-gray-600">
									{locale === "zh-CN"
										? "加载中..."
										: "載入中..."}
								</p>
							</div>
						</div>
					) : hotProducts.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
								{hotProducts.map((product) => (
									<ProductCard
										key={product._id}
										product={product}
										onAddToCart={(p) => handleAddToCart(p)}
										showGiftReport={false}
									/>
								))}
							</div>
							<div className="text-center">
								<Link href={`/${locale}/shop/all`}>
									<Button
										size="lg"
										className="bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
									>
										{locale === "zh-CN"
											? "浏览更多"
											: "瀏覽更多"}
									</Button>
								</Link>
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
							<div
								className="grid gap-6"
								style={{ gridTemplateColumns: "40% 60%" }}
							>
								{/* 耳飾 - 40% */}
								<Link
									href={`/${locale}/shop/all`}
									onClick={() => {
										if (typeof window !== "undefined") {
											sessionStorage.setItem(
												"selectedCategory",
												"earring",
											);
										}
									}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div
										className="relative w-full"
										style={{ aspectRatio: "814 / 578" }}
									>
										<Image
											src="/images/Shop-home/earring.png"
											alt={
												locale === "zh-CN"
													? "耳饰"
													: "耳飾"
											}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>

								{/* 手串 - 60% */}
								<Link
									href={`/${locale}/shop/all`}
									onClick={() => {
										if (typeof window !== "undefined") {
											sessionStorage.setItem(
												"selectedCategory",
												"bracelet",
											);
										}
									}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div
										className="relative w-full"
										style={{ aspectRatio: "1368 / 578" }}
									>
										<Image
											src="/images/Shop-home/bracelet.png"
											alt={
												locale === "zh-CN"
													? "手串"
													: "手串"
											}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>
							</div>

							{/* Second Row: 風水擺件 70% + 戒指 30% */}
							<div
								className="grid gap-6"
								style={{ gridTemplateColumns: "70% 30%" }}
							>
								{/* 風水擺件 - 70% */}
								<Link
									href={`/${locale}/shop/all`}
									onClick={() => {
										if (typeof window !== "undefined") {
											sessionStorage.setItem(
												"selectedCategory",
												"feng-shui",
											);
										}
									}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div
										className="relative w-full"
										style={{ aspectRatio: "1368 / 578" }}
									>
										<Image
											src="/images/Shop-home/fengshuiproduct.png"
											alt={
												locale === "zh-CN"
													? "风水摆件"
													: "風水擺件"
											}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									</div>
								</Link>

								{/* 戒指 - 30% */}
								<Link
									href={`/${locale}/shop/all`}
									onClick={() => {
										if (typeof window !== "undefined") {
											sessionStorage.setItem(
												"selectedCategory",
												"ring",
											);
										}
									}}
									className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white block"
								>
									<div
										className="relative w-full"
										style={{ aspectRatio: "814 / 578" }}
									>
										<Image
											src="/images/Shop-home/ring.png"
											alt={
												locale === "zh-CN"
													? "戒指"
													: "戒指"
											}
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
										prev === 0
											? reviews.length - 1
											: prev - 1,
									)
								}
								className="w-10 h-10 rounded-full bg-white border-2 border-[#8B7355] flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition-all"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button
								onClick={() =>
									setCurrentReview((prev) =>
										prev === reviews.length - 1
											? 0
											: prev + 1,
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
						<div className="flex transition-all duration-500 ease-in-out gap-6 justify-center items-center">
							{reviews.map((review, index) => {
								// Calculate positions relative to current review
								const isActive = index === currentReview;
								const isPrev =
									index ===
									(currentReview - 1 + reviews.length) %
										reviews.length;
								const isNext =
									index ===
									(currentReview + 1) % reviews.length;
								const isPrev2 =
									index ===
									(currentReview - 2 + reviews.length) %
										reviews.length;
								const isNext2 =
									index ===
									(currentReview + 2) % reviews.length;

								const isVisible =
									isActive ||
									isPrev ||
									isNext ||
									isPrev2 ||
									isNext2;

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
														<span className="text-white text-xs">
															✓
														</span>
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
										{locale === "zh-CN"
											? "随时了解"
											: "隨時了解"}
									</h2>
									<h2 className="text-2xl md:text-3xl font-bold">
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
										className="bg-white rounded-full px-6 py-4 text-gray-800"
									/>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="bg-white text-gray-800 hover:bg-gray-100 rounded-full px-8 py-4 font-bold"
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

			<FooterV2 />
		</div>
	);
}
