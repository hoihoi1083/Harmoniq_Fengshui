"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShopNavbar from "@/components/ShopNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import {
	ShoppingCart,
	Heart,
	Star,
	Truck,
	Shield,
	ArrowLeft,
	Sparkles,
	Plus,
	Minus,
	ChevronRight,
	MessageSquare,
	HelpCircle,
	Check,
	ZoomIn,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage() {
	const { data: session } = useSession();
	const params = useParams();
	const router = useRouter();
	const locale = useLocale();
	const [product, setProduct] = useState(null);
	const [relatedProducts, setRelatedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [activeTab, setActiveTab] = useState("reviews"); // reviews or faq
	const [selectedSize, setSelectedSize] = useState(null);
	const [cartCount, setCartCount] = useState(0);
	const [showZoom, setShowZoom] = useState(false);
	const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
	const imageRef = useRef(null);

	useEffect(() => {
		if (params.productId) {
			fetchProduct();
		}
		if (session?.user) {
			fetchCartCount();
		}
	}, [params.productId, session]);

	useEffect(() => {
		if (product) {
			fetchRelatedProducts();
		}
	}, [product]);

	const fetchProduct = async () => {
		try {
			const res = await fetch(`/api/shop/products/${params.productId}`);
			const data = await res.json();
			if (data.success) {
				setProduct(data.data);
				// Set default size if specifications exist
				if (data.data.specifications?.size) {
					setSelectedSize(data.data.specifications.size);
				}
			} else {
				toast.error(locale === "zh-CN" ? "商品不存在" : "商品不存在");
				router.push(`/${locale}/shop`);
			}
		} catch (error) {
			console.error("Failed to fetch product:", error);
			toast.error(locale === "zh-CN" ? "加载失败" : "載入失敗");
		} finally {
			setLoading(false);
		}
	};

	const handleImageMouseMove = (e) => {
		if (!imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setZoomPosition({ x, y });
	};

	const handleImageMouseEnter = () => {
		setShowZoom(true);
	};

	const handleImageMouseLeave = () => {
		setShowZoom(false);
	};

	const fetchRelatedProducts = async () => {
		try {
			// Fetch more products to have better recommendation pool
			const res = await fetch(`/api/shop/products?limit=50`);
			const data = await res.json();
			if (data.success && product) {
				const allProducts = data.data.products.filter(
					(p) => p._id !== params.productId,
				);

				// Smart recommendation algorithm
				// Priority 1: Same category and element (weight: 10)
				// Priority 2: Same category (weight: 5)
				// Priority 3: Same element type (weight: 3)
				// Priority 4: Similar price range (weight: 2)
				// Priority 5: Random (weight: 1)

				const scoredProducts = allProducts.map((p) => {
					let score = 1; // Base score

					// Same category and element - highest priority
					if (
						p.category === product.category &&
						p.elementType === product.elementType &&
						p.elementType !== "none"
					) {
						score += 10;
					}

					// Same category
					if (p.category === product.category) {
						score += 5;
					}

					// Same element type
					if (
						p.elementType === product.elementType &&
						p.elementType !== "none"
					) {
						score += 3;
					}

					// Similar price range (within 30% difference)
					const priceDiff = Math.abs(p.price - product.price);
					const priceRatio = priceDiff / product.price;
					if (priceRatio <= 0.3) {
						score += 2;
					}

					// Boost for featured products
					if (p.isFeatured) {
						score += 1;
					}

					// Boost for products with discounts
					if (p.discount && p.discount.percentage > 0) {
						score += 1;
					}

					// Add some randomness to avoid always showing same products
					score += Math.random() * 0.5;

					return { ...p, score };
				});

				// Sort by score (highest first) and take top 4
				const recommended = scoredProducts
					.sort((a, b) => b.score - a.score)
					.slice(0, 4);

				setRelatedProducts(recommended);
			}
		} catch (error) {
			console.error("Failed to fetch related products:", error);
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

	const handleAddToCart = async () => {
		if (!session?.user) {
			toast.error(locale === "zh-CN" ? "请先登录" : "請先登入");
			return;
		}

		setIsAddingToCart(true);
		try {
			const res = await fetch("/api/shop/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId: product._id,
					quantity: quantity,
				}),
			});

			const data = await res.json();
			if (data.success) {
				// Update cart count
				const totalQuantity = data.data.items.reduce(
					(total, item) => total + item.quantity,
					0,
				);
				setCartCount(totalQuantity);

				toast.success(
					locale === "zh-CN" ? "已添加到购物车" : "已加入購物車",
				);
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(locale === "zh-CN" ? "添加失败" : "加入失敗");
		} finally {
			setIsAddingToCart(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white">
				<ShopNavbar cartCount={cartCount} onSearch={() => {}} />
				<div className="flex items-center justify-center py-20">
					<div className="w-16 h-16 border-4 border-[#6B8E23] border-t-transparent rounded-full animate-spin" />
				</div>
			</div>
		);
	}

	if (!product) {
		return null;
	}

	const hasDiscount =
		product.discount &&
		product.discount.percentage > 0 &&
		(!product.discount.validUntil ||
			new Date(product.discount.validUntil) > new Date());

	const discountedPrice = hasDiscount
		? product.price * (1 - product.discount.percentage / 100)
		: product.price;

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

	// Mock reviews data
	const reviews = [
		{
			id: 1,
			name: "Thea L.",
			rating: 3.5,
			date: "04.01.2026",
			text:
				locale === "zh-CN"
					? "收到想要的瑪瑙原球，第一眼很滿意！買白水晶是希望能量護體，看他的人也會旺些！顏色也只差暗！單打6顆串小八卦！哪片都有你們能吧！前幾天到小過時！前幾天到超級現古語！"
					: "收到想要的瑪瑙原球，第一眼很滿意！買白水晶是希望能量護體，看他的人也會旺些！顏色也只差暗！單打6顆串小八卦！哪片都有你們能吧！前幾天到小過時！前幾天到超級現古語！",
			verified: true,
		},
		{
			id: 2,
			name: "趙錢",
			rating: 4,
			date: "01.01.2026",
			text:
				locale === "zh-CN"
					? "之前已结缘其他的宝贝的挂件，给验收了不亏么，要媳妇还不开心还是。其三个空间质感还贵！是入手之后还从今启动贵！完全重复讨贵！己也满意且也重归咱娃！口算正满意贵！己也联贵本咱宝！尤爱三公空气古宇！口算满意且卸贵诚爱古堂宝！"
					: "之前已結緣其他的寶貝的掛件，給驗收了不虧麼，要媳婦還不開心還是。其三個空間質感還貴！是入手之後還從今啟動貴！完全重複討貴！己也滿意且也重歸咱娃！口算正滿意貴！己也聯貴本咱寶！尤愛三公空氣古宇！口算滿意且卸貴誠愛古堂寶！",
			verified: true,
		},
		{
			id: 3,
			name: "宜靈 D.",
			rating: 4.5,
			date: "29.12.2025",
			text:
				locale === "zh-CN"
					? "一看就一个很好又缺乏洋洋洋，高丰在空旷坐相园又公人！但打到的好评在很高空香洋！白虾正手空乡堡！由空说过坚持年代开，尊誉已空好美洋！堆空该好人！女虐坏说来过！"
					: "一看就一個很好又缺乏洋洋洋，高豐在空曠坐相園又公人！但打到的好評在很高空香洋！白蝦正手空鄉堡！由空說過堅持年代開，尊譽已空好美洋！堆空該好人！女虐壞說來過！",
			verified: true,
		},
		{
			id: 4,
			name: "豐加本",
			rating: 4,
			date: "29.12.2025",
			text:
				locale === "zh-CN"
					? "开团很好宝宝手玩小很诚，给天妈珠也真很卸请里堡人！开启正二工开，给屋空还品诚！卸还正很好人！会全年年老宝！己屋说起吧！"
					: "開團很好寶寶手玩小很誠，給天媽珠也真很卸請里堡人！開啟正二工開，給屋空還品誠！卸還正很好人！會全年年老寶！己屋說起吧！",
			verified: true,
		},
	];

	// Mock FAQ data
	const faqs = [
		{
			question:
				locale === "zh-CN"
					? "如何清潔和保養水晶？"
					: "如何清潔和保養水晶？",
			answer:
				locale === "zh-CN"
					? "建議使用清水輕柔清潔，避免使用化學清潔劑。每月可以在月光下淨化能量。"
					: "建議使用清水輕柔清潔，避免使用化學清潔劑。每月可以在月光下淨化能量。",
		},
		{
			question:
				locale === "zh-CN"
					? "運送需要多長時間？"
					: "運送需要多長時間？",
			answer:
				locale === "zh-CN"
					? "一般3-5個工作日送達，偏遠地區可能需要7-10個工作日。"
					: "一般3-5個工作日送達，偏遠地區可能需要7-10個工作日。",
		},
		{
			question: locale === "zh-CN" ? "可以退換貨嗎？" : "可以退換貨嗎？",
			answer:
				locale === "zh-CN"
					? "收到商品後7天內如有品質問題可以退換貨，請保持商品完整包裝。"
					: "收到商品後7天內如有品質問題可以退換貨，請保持商品完整包裝。",
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<ShopNavbar cartCount={cartCount} onSearch={() => {}} />

			<div className="px-4 py-8 pt-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
				{/* Breadcrumb Navigation */}
				<nav className="flex items-center gap-2 mb-8 text-sm text-gray-500">
					<Link
						href={`/${locale}`}
						className="transition-colors hover:text-gray-700"
					>
						{locale === "zh-CN" ? "首页" : "首頁"}
					</Link>
					<ChevronRight className="w-4 h-4" />
					<Link
						href={`/${locale}/shop`}
						className="transition-colors hover:text-gray-700"
					>
						{locale === "zh-CN" ? "商店" : "商店"}
					</Link>
					<ChevronRight className="w-4 h-4" />
					<span className="font-medium text-gray-900 line-clamp-1">
						{product?.name[locale] || product?.name.zh_TW}
					</span>
				</nav>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
					{/* Left: Thumbnail Images */}
					<div className="order-2 lg:col-span-1 lg:order-1">
						<div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
							{product?.images &&
								product.images.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
											selectedImage === index
												? "border-[#8B7355] ring-2 ring-[#8B7355]/30"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<Image
											src={image}
											alt={`Thumbnail ${index + 1}`}
											fill
											className="object-cover"
										/>
									</button>
								))}
						</div>
					</div>

					{/* Center: Main Image */}
					<div className="order-1 lg:col-span-5 lg:order-2">
						<div
							ref={imageRef}
							className="relative overflow-visible aspect-square rounded-2xl bg-gray-50 group"
							onMouseMove={handleImageMouseMove}
							onMouseEnter={handleImageMouseEnter}
							onMouseLeave={handleImageMouseLeave}
						>
							<div className="relative w-full h-full overflow-hidden rounded-2xl">
								{product?.images &&
								product.images.length > 0 ? (
									<>
										<Image
											src={product.images[selectedImage]}
											alt={
												product.name[locale] ||
												product.name.zh_TW
											}
											fill
											className="object-contain p-8"
											priority
										/>
										{/* Zoom Icon Indicator */}
										<div className="absolute z-10 transition-opacity duration-300 opacity-0 top-4 right-4 group-hover:opacity-100">
											<div className="bg-black/50 backdrop-blur-sm rounded-full p-2.5">
												<ZoomIn className="w-5 h-5 text-white" />
											</div>
										</div>
									</>
								) : (
									<div className="flex items-center justify-center h-full">
										<Sparkles className="w-32 h-32 text-gray-300" />
									</div>
								)}
							</div>

							{/* Zoom Preview Popup */}
							{showZoom &&
								product?.images &&
								product.images.length > 0 && (
									<div className="absolute top-0 z-50 hidden ml-8 pointer-events-none left-full lg:block">
										<div className="w-[500px] h-[500px] border-4 border-white shadow-2xl rounded-2xl overflow-hidden bg-white">
											<div className="relative w-full h-full overflow-hidden">
												<div
													className="absolute w-[200%] h-[200%]"
													style={{
														left: `${-zoomPosition.x * 1}%`,
														top: `${-zoomPosition.y * 1}%`,
													}}
												>
													<Image
														src={
															product.images[
																selectedImage
															]
														}
														alt={`${product.name[locale] || product.name.zh_TW} - Zoomed`}
														fill
														className="object-contain"
														sizes="1500px"
													/>
												</div>
											</div>
										</div>
									</div>
								)}
						</div>
					</div>

					{/* Right: Product Info */}
					<div className="order-3 space-y-6 lg:col-span-6">
						{/* Product Title */}
						<h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
							{product?.name[locale] || product?.name.zh_TW}
						</h1>

						{/* Rating */}
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								{[...Array(5)].map((_, i) => {
									const rating =
										product?.rating?.average || 4.8;
									const fillPercentage = Math.min(
										Math.max(rating - i, 0),
										1,
									);
									return (
										<div
											key={i}
											className="relative w-5 h-5"
										>
											<Star
												className="absolute inset-0 text-gray-300"
												fill="currentColor"
											/>
											<div
												className="absolute inset-0 overflow-hidden"
												style={{
													width: `${
														fillPercentage * 100
													}%`,
												}}
											>
												<Star
													className="text-yellow-400"
													fill="currentColor"
												/>
											</div>
										</div>
									);
								})}
							</div>
							<span className="text-sm text-gray-600">
								{product?.rating?.average || 4.8}/5
							</span>
						</div>

						{/* Price */}
						<div className="space-y-2">
							<div className="flex items-baseline gap-3">
								<span className="text-3xl font-bold text-gray-900">
									{product?.currency === "HKD" && "HK$"}
									{product?.currency === "CNY" && "¥"}
									{product?.currency === "USD" && "$"}
									{hasDiscount
										? discountedPrice.toFixed(0)
										: product?.price}
								</span>
								{hasDiscount && (
									<>
										<span className="text-lg text-gray-400 line-through">
											{product?.currency === "HKD" &&
												"HK$"}
											{product?.currency === "CNY" && "¥"}
											{product?.currency === "USD" && "$"}
											{product?.price}
										</span>
										<Badge className="text-xs text-white bg-red-500">
											-{product?.discount?.percentage}%
										</Badge>
									</>
								)}
							</div>
						</div>

						{/* Description */}
						<div className="py-4 text-sm leading-relaxed text-gray-600 border-t border-b border-gray-200">
							<p>
								{product?.description[locale] ||
									product?.description.zh_TW}
							</p>
						</div>

						{/* Size Selector */}
						{product?.specifications?.size && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700">
										{locale === "zh-CN" ? "尺寸" : "尺寸"}
									</span>
								</div>
								<button
									onClick={() =>
										setSelectedSize(
											product.specifications.size,
										)
									}
									className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
										selectedSize ===
										product.specifications.size
											? "border-gray-900 bg-gray-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									{product.specifications.size}
								</button>
							</div>
						)}

						{/* Quantity Selector */}
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								size="icon"
								className="w-10 h-10 border-gray-300 rounded-md"
								onClick={() =>
									setQuantity(Math.max(1, quantity - 1))
								}
								disabled={quantity <= 1}
							>
								<Minus className="w-4 h-4" />
							</Button>
							<span className="w-12 font-medium text-center">
								{quantity}
							</span>
							<Button
								variant="outline"
								size="icon"
								className="w-10 h-10 border-gray-300 rounded-md"
								onClick={() =>
									setQuantity(
										Math.min(
											product?.stock || 99,
											quantity + 1,
										),
									)
								}
								disabled={quantity >= (product?.stock || 99)}
							>
								<Plus className="w-4 h-4" />
							</Button>
						</div>

						{/* Add to Cart Button */}
						<Button
							size="lg"
							className="w-full bg-[#6B8E23] hover:bg-[#5A7A1E] text-white h-14 text-base font-medium rounded-lg"
							onClick={handleAddToCart}
							disabled={
								(!product?.isDigital && product?.stock === 0) ||
								isAddingToCart
							}
						>
							{isAddingToCart ? (
								<div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
							) : null}
							{locale === "zh-CN" ? "加到購物車" : "加到購物車"}
						</Button>
					</div>
				</div>

				{/* Reviews and FAQ Section */}
				<div className="mt-16 border-t border-gray-200">
					{/* Tab Navigation */}
					<div className="flex gap-8 border-b border-gray-200">
						<button
							onClick={() => setActiveTab("reviews")}
							className={`py-4 px-2 font-medium transition-colors relative ${
								activeTab === "reviews"
									? "text-gray-900"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							<div className="flex items-center gap-2">
								<MessageSquare className="w-5 h-5" />
								{locale === "zh-CN" ? "用户评价" : "用戶評價"}
							</div>
							{activeTab === "reviews" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
							)}
						</button>
						<button
							onClick={() => setActiveTab("faq")}
							className={`py-4 px-2 font-medium transition-colors relative ${
								activeTab === "faq"
									? "text-gray-900"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							<div className="flex items-center gap-2">
								<HelpCircle className="w-5 h-5" />
								{locale === "zh-CN" ? "常见问题" : "常見問題"}
							</div>
							{activeTab === "faq" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
							)}
						</button>
					</div>

					{/* Tab Content */}
					<div className="py-8">
						{activeTab === "reviews" ? (
							<div className="space-y-6">
								{/* Reviews Filter */}
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">
										{locale === "zh-CN"
											? "用户评价"
											: "用戶評價"}{" "}
										({reviews.length})
									</h3>
									<select className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
										<option>
											{locale === "zh-CN"
												? "最新"
												: "最新"}
										</option>
										<option>
											{locale === "zh-CN"
												? "评分最高"
												: "評分最高"}
										</option>
									</select>
								</div>

								{/* Reviews List */}
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{reviews.map((review) => (
										<div
											key={review.id}
											className="p-6 space-y-3 bg-gray-50 rounded-xl"
										>
											{/* User Info and Rating */}
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 bg-gradient-to-br from-[#6B8E23] to-[#5A7A1E] rounded-full flex items-center justify-center text-white font-semibold">
														{review.name
															.charAt(0)
															.toUpperCase()}
													</div>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-medium text-gray-900">
																{review.name}
															</span>
															{review.verified && (
																<Check className="w-4 h-4 text-green-500" />
															)}
														</div>
														<div className="text-xs text-gray-500">
															{review.date}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-0.5">
													{[...Array(5)].map(
														(_, i) => {
															const isFilled =
																i <
																Math.floor(
																	review.rating,
																);
															const isHalf =
																!isFilled &&
																i <
																	review.rating;

															return (
																<div
																	key={i}
																	className="relative w-4 h-4"
																>
																	{isFilled ? (
																		<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
																	) : isHalf ? (
																		<>
																			<Star className="absolute inset-0 w-4 h-4 text-gray-300 fill-gray-300" />
																			<div className="absolute inset-0 w-1/2 overflow-hidden">
																				<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
																			</div>
																		</>
																	) : (
																		<Star className="w-4 h-4 text-gray-300 fill-gray-300" />
																	)}
																</div>
															);
														},
													)}
												</div>
											</div>

											{/* Review Text */}
											<p className="text-sm leading-relaxed text-gray-700">
												{review.text}
											</p>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="space-y-4">
								{faqs.map((faq, index) => (
									<div
										key={index}
										className="p-6 space-y-3 bg-gray-50 rounded-xl"
									>
										<h4 className="font-semibold text-gray-900">
											{faq.question}
										</h4>
										<p className="text-sm text-gray-700">
											{faq.answer}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Related Products Section */}
				{relatedProducts.length > 0 && (
					<div className="pt-16 mt-16 border-t border-gray-200">
						<h2 className="mb-8 text-2xl font-bold text-center text-gray-900">
							{locale === "zh-CN" ? "猜你喜欢" : "猜你喜歡"}
						</h2>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{relatedProducts.map((relatedProduct) => {
								const hasDiscount =
									relatedProduct.discount &&
									relatedProduct.discount.percentage > 0 &&
									(!relatedProduct.discount.validUntil ||
										new Date(
											relatedProduct.discount.validUntil,
										) > new Date());

								const discountedPrice = hasDiscount
									? relatedProduct.price *
										(1 -
											relatedProduct.discount.percentage /
												100)
									: relatedProduct.price;

								const rating =
									relatedProduct.rating?.average || 4.5;

								return (
									<Link
										key={relatedProduct._id}
										href={`/${locale}/shop/product/${relatedProduct._id}`}
										className="group"
									>
										<div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-xl hover:shadow-lg">
											{/* Product Image */}
											<div className="relative overflow-hidden aspect-square bg-gray-50">
												{relatedProduct.images &&
												relatedProduct.images.length >
													0 ? (
													<Image
														src={
															relatedProduct
																.images[0]
														}
														alt={
															relatedProduct.name[
																locale
															] ||
															relatedProduct.name
																.zh_TW
														}
														fill
														className="object-cover transition-transform duration-500 group-hover:scale-110"
														sizes="(max-width: 768px) 50vw, 25vw"
													/>
												) : (
													<div className="flex items-center justify-center h-full">
														<Sparkles className="w-16 h-16 text-gray-300" />
													</div>
												)}
												{hasDiscount && (
													<Badge className="absolute text-xs text-white bg-red-500 top-3 right-3">
														-
														{
															relatedProduct
																.discount
																.percentage
														}
														%
													</Badge>
												)}
											</div>

											{/* Product Info */}
											<div className="p-4 space-y-2">
												<h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
													{relatedProduct.name[
														locale
													] ||
														relatedProduct.name
															.zh_TW}
												</h3>

												{/* Star Rating */}
												<div className="flex items-center gap-0.5">
													{[...Array(5)].map(
														(_, i) => {
															const isFilled =
																i <
																Math.floor(
																	rating,
																);
															const isHalf =
																!isFilled &&
																i < rating;

															return (
																<div
																	key={i}
																	className="relative w-3.5 h-3.5"
																>
																	{isFilled ? (
																		<Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
																	) : isHalf ? (
																		<>
																			<Star className="absolute inset-0 w-3.5 h-3.5 text-gray-300 fill-gray-300" />
																			<div className="absolute inset-0 w-1/2 overflow-hidden">
																				<Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
																			</div>
																		</>
																	) : (
																		<Star className="w-3.5 h-3.5 text-gray-300 fill-gray-300" />
																	)}
																</div>
															);
														},
													)}
													<span className="ml-1 text-xs text-gray-600">
														{rating}/5
													</span>
												</div>

												{/* Price */}
												<div className="flex items-center gap-2">
													<span className="text-lg font-bold text-gray-900">
														$
														{hasDiscount
															? discountedPrice.toFixed(
																	0,
																)
															: relatedProduct.price}
													</span>
													{hasDiscount && (
														<span className="text-xs text-gray-400 line-through">
															$
															{
																relatedProduct.price
															}
														</span>
													)}
												</div>

												{/* Discount Badge */}
												{hasDiscount && (
													<span className="text-xs font-semibold text-red-500">
														-
														{
															relatedProduct
																.discount
																.percentage
														}
														%
													</span>
												)}
											</div>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<footer className="bg-[#2C2C2C] text-white pt-16 pb-8 mt-16">
				<div className="container px-4 py-12 mx-auto">
					{/* Top Section */}
					<div className="flex flex-col items-start justify-between gap-8 mb-12 md:flex-row">
						{/* Left Side - Logo and Links */}
						<div className="flex flex-col items-start gap-12 md:flex-row">
							<div>
								<div className="mb-6">
									<Image
										src="/images/logo/logo-desktop.png"
										alt="HarmoniQ Logo"
										width={681}
										height={132}
										className="w-auto h-8"
										style={{
											filter: "brightness(0) invert(1)",
										}}
										quality={100}
									/>
								</div>
								<div className="flex gap-6 text-white">
									<a
										href={`/${locale}/about`}
										className="hover:text-[#8B9F3A] transition-colors"
									>
										{locale === "zh-CN"
											? "关于我们"
											: "關於我們"}
									</a>
									<a
										href={`/${locale}/privacy`}
										className="hover:text-[#8B9F3A] transition-colors"
									>
										{locale === "zh-CN"
											? "隐私政策"
											: "隱私政策"}
									</a>
									<a
										href={`/${locale}/terms`}
										className="hover:text-[#8B9F3A] transition-colors"
									>
										{locale === "zh-CN"
											? "用户条款"
											: "用戶條款"}
									</a>
								</div>
								<div className="flex gap-4 mt-6">
									<a
										href="https://facebook.com"
										target="_blank"
										rel="noopener noreferrer"
										className="transition-opacity hover:opacity-80"
									>
										<Image
											src="/images/footer/Facebook.png"
											alt="Facebook"
											width={40}
											height={40}
											className="w-10 h-10"
										/>
									</a>
									<a
										href="https://instagram.com"
										target="_blank"
										rel="noopener noreferrer"
										className="transition-opacity hover:opacity-80"
									>
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
								{locale === "zh-CN"
									? "联系我们："
									: "聯絡我們："}
							</div>
							<div className="mb-6 space-y-3">
								<p className="text-white">
									{locale === "zh-CN" ? "电邮" : "電郵"}:
									info@gmail.com
								</p>
								<p className="text-white">
									{locale === "zh-CN" ? "电话" : "電話"}: +852
									0000 0000
								</p>
							</div>
							<div className="flex gap-3">
								<Input
									type="email"
									placeholder={
										locale === "zh-CN"
											? "您的电邮"
											: "您的電郵"
									}
									className="px-6 py-3 text-white bg-transparent border-2 border-white rounded-full placeholder:text-white/60"
								/>
								<Button className="bg-[#8B9F3A] hover:bg-[#6B8E23] text-[#2C2C2C] rounded-full px-8 py-3 font-bold">
									{locale === "zh-CN"
										? "联系我们"
										: "聯絡我們"}
								</Button>
							</div>
						</div>
					</div>

					{/* Bottom Section */}
					<div className="pt-8 mt-8 border-t border-gray-700">
						<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
							<p className="text-sm text-gray-400">
								© 2025 HarmoniQ.{" "}
								{locale === "zh-CN"
									? "保留所有权利"
									: "保留所有權利"}
								.
							</p>
							<div className="flex items-center gap-2">
								{/* Visa */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg
										viewBox="0 0 48 32"
										className="w-auto h-6"
										fill="none"
									>
										<path
											d="M20.5 10.5L17.5 21.5H14.5L12.5 13C12.4 12.6 12.2 12.3 11.9 12.2C11.3 11.9 10.4 11.6 9.5 11.4L9.6 11H14.5C15.1 11 15.6 11.4 15.7 12L16.7 17.5L19.2 11H22.2L20.5 10.5ZM30.5 17.8C30.5 15.2 26.8 15 26.8 13.8C26.8 13.4 27.2 13 28.1 12.9C28.5 12.8 29.6 12.7 30.9 13.3L31.4 11.4C30.8 11.2 30 11 29 11C26.2 11 24.2 12.6 24.2 14.8C24.2 16.5 25.7 17.4 26.8 18C28 18.6 28.4 19 28.4 19.5C28.4 20.3 27.5 20.7 26.7 20.7C25.5 20.7 24.9 20.5 23.9 20L23.4 22C24.4 22.4 25.3 22.5 26.7 22.5C29.7 22.5 31.6 20.9 31.6 18.6L30.5 17.8ZM38.5 21.5H41L38.8 11H36.4C35.9 11 35.5 11.3 35.3 11.7L31.5 21.5H34.5L35.1 20H38.8L38.5 21.5ZM36.2 13.5L37.5 17.5H35.5L36.2 13.5ZM26.5 11L24.5 21.5H21.8L23.8 11H26.5Z"
											fill="#1434CB"
										/>
									</svg>
								</div>
								{/* Mastercard */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg
										viewBox="0 0 48 32"
										className="w-auto h-6"
										fill="none"
									>
										<circle
											cx="18"
											cy="16"
											r="10"
											fill="#EB001B"
										/>
										<circle
											cx="30"
											cy="16"
											r="10"
											fill="#F79E1B"
											fillOpacity="0.8"
										/>
									</svg>
								</div>
								{/* PayPal */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg
										viewBox="0 0 48 32"
										className="w-auto h-6"
										fill="none"
									>
										<path
											d="M20.5 9H15.5L12.5 23H16L18 13C18.2 11.9 19.1 11 20.2 11H23C25.2 11 26.5 12.3 26.5 14.5C26.5 16.7 24.8 18.5 22.5 18.5H21L20 23H22.5C27.2 23 31 19.2 31 14.5C31 9.8 27.2 9 24.5 9H20.5Z"
											fill="#003087"
										/>
										<path
											d="M17 16H14L12 23H15L17 16Z"
											fill="#009CDE"
										/>
									</svg>
								</div>
								{/* Apple Pay */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg
										viewBox="0 0 48 32"
										className="w-auto h-6"
										fill="none"
									>
										<path
											d="M16.5 11.5C17.2 10.6 17.7 9.3 17.5 8C16.4 8.1 15.1 8.8 14.3 9.7C13.6 10.5 13 11.8 13.2 13.1C14.4 13.2 15.7 12.5 16.5 11.5ZM17.5 13.3C15.8 13.2 14.3 14.3 13.5 14.3C12.7 14.3 11.4 13.4 10.1 13.4C8.4 13.4 6.8 14.4 5.9 16C4.1 19.1 5.4 23.7 7.1 26.2C7.9 27.4 8.9 28.7 10.1 28.7C11.4 28.6 11.9 27.9 13.4 27.9C14.9 27.9 15.3 28.7 16.7 28.7C18.1 28.7 19 27.5 19.8 26.3C20.7 24.9 21.1 23.6 21.1 23.5C21.1 23.5 18.4 22.4 18.4 19.3C18.4 16.7 20.5 15.5 20.6 15.4C19.4 13.6 17.6 13.4 17.5 13.3Z"
											fill="#000000"
										/>
										<path
											d="M28 13.5H31.5C33.4 13.5 34.5 14.6 34.5 16.2C34.5 17.8 33.3 19 31.4 19H29.5V22H28V13.5ZM29.5 17.8H31.2C32.4 17.8 33 17.2 33 16.2C33 15.2 32.4 14.7 31.2 14.7H29.5V17.8ZM35.5 19.8C35.5 18.3 36.6 17.3 38.5 17.3C39.2 17.3 39.8 17.4 40.2 17.6V17.3C40.2 16.4 39.7 15.9 38.7 15.9C38 15.9 37.5 16.2 37.3 16.6H36C36.2 15.4 37.3 14.6 38.8 14.6C40.5 14.6 41.5 15.5 41.5 17V22H40.2V21.1H40.1C39.7 21.7 39 22 38.2 22C36.8 22 35.5 21.2 35.5 19.8ZM40.2 19.2V18.9C39.9 18.7 39.4 18.6 38.8 18.6C37.8 18.6 37.1 19 37.1 19.7C37.1 20.4 37.7 20.8 38.5 20.8C39.5 20.8 40.2 20.2 40.2 19.2ZM42.5 26V24.8C42.7 24.9 43 24.9 43.2 24.9C44 24.9 44.4 24.6 44.7 23.7L44.8 23.4L42 14.8H43.6L45.5 21.7H45.6L47.5 14.8H49L46.2 23.8C45.6 25.5 44.9 26 43.3 26C43.1 26 42.7 26 42.5 26Z"
											fill="#000000"
										/>
									</svg>
								</div>
								{/* Google Pay */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg
										viewBox="0 0 48 32"
										className="w-auto h-6"
										fill="none"
									>
										<path
											d="M22.5 16.5V20H27.3C27.1 21.3 25.9 23.8 22.5 23.8C19.5 23.8 17.1 21.3 17.1 18.2C17.1 15.1 19.5 12.6 22.5 12.6C24.2 12.6 25.4 13.3 26.1 14L28.9 11.3C27.2 9.7 25 8.8 22.5 8.8C17.5 8.8 13.5 12.8 13.5 17.8C13.5 22.8 17.5 26.8 22.5 26.8C27.7 26.8 31 23.3 31 18.3C31 17.6 30.9 17.1 30.8 16.5H22.5Z"
											fill="#4285F4"
										/>
										<path
											d="M36 13.5H34V11.5H32V13.5H30V15.5H32V17.5H34V15.5H36V13.5Z"
											fill="#EA4335"
										/>
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
