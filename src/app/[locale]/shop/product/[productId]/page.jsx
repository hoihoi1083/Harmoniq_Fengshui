"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
	Mail,
} from "lucide-react";
import { toast } from "sonner";
import FooterV2 from "@/components/home/FooterV2";
import { useRegionDetectionWithRedirect } from "@/hooks/useRegionDetectionEnhanced";
import { getProductDisplayPrice } from "@/lib/productPrice";
import { REPORT_PRODUCT_IDS } from "@/lib/reportProducts";
import { getProductName, getProductDescription } from "@/lib/productLocale";

export default function ProductDetailPage() {
	const { data: session } = useSession();
	const params = useParams();
	const router = useRouter();
	const locale = useLocale();
	const { region } = useRegionDetectionWithRedirect({
		skipFirstRedirect: true,
	});
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
	const [email, setEmail] = useState("");
	const [selectedGiftReport, setSelectedGiftReport] = useState(null);
	const [showGiftReportWarning, setShowGiftReportWarning] = useState(false);
	const [showLoginWarning, setShowLoginWarning] = useState(false);
	const imageRef = useRef(null);
	const relatedCarouselRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const dragStart = useRef({ x: 0, scrollLeft: 0 });
	const didDragRef = useRef(false);

	// Gift report type labels (財運, 感情, 事業, 健康)
	const GIFT_REPORT_LABELS = {
		wealth: locale === "zh-CN" ? "财运" : "財運",
		love: locale === "zh-CN" ? "感情" : "感情",
		career: locale === "zh-CN" ? "事业" : "事業",
		health: locale === "zh-CN" ? "健康" : "健康",
	};

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

	useEffect(() => {
		if (session?.user) setShowLoginWarning(false);
	}, [session?.user]);

	const fetchProduct = async () => {
		try {
			const res = await fetch(`/api/shop/products/${params.productId}`, {
				cache: "no-store",
				headers: { "Cache-Control": "no-cache" },
			});
			const data = await res.json();
			if (data.success) {
				setProduct(data.data);
				// Set default size if specifications exist
				if (data.data.specifications?.size) {
					setSelectedSize(data.data.specifications.size);
				}
			} else {
				toast.error(locale === "zh-CN" ? "商品不存在" : "商品不存在");
				router.push(`/${locale}/shop/all`);
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
					(p) =>
						p._id !== params.productId &&
						!REPORT_PRODUCT_IDS.includes(p.productId),
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
			setShowLoginWarning(true);
			toast.error(locale === "zh-CN" ? "请先登录" : "請先登入");
			return;
		}
		setShowLoginWarning(false);
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

		setIsAddingToCart(true);
		try {
			const res = await fetch("/api/shop/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId: product._id,
					quantity: quantity,
					...(Array.isArray(product.giftReportTypes) &&
					product.giftReportTypes.length > 0 &&
					selectedGiftReport
						? { giftReportType: selectedGiftReport }
						: {}),
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
				throw new Error(
					data.error ||
						(locale === "zh-CN" ? "添加失败" : "加入失敗"),
				);
			}
		} catch (error) {
			const message =
				typeof error?.message === "string"
					? error.message
					: locale === "zh-CN"
						? "添加失败"
						: "加入失敗";
			toast.error(message);
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleNewsletterSubmit = () => {
		console.log("Newsletter subscribed with email:", email);
		setEmail("");
	};

	// Related products carousel: mouse drag to scroll (works from cards or gaps; document listeners so drag continues over cards)
	const onRelatedDocMove = useCallback((e) => {
		e.preventDefault();
		if (!relatedCarouselRef.current) return;
		const dx = e.pageX - dragStart.current.x;
		relatedCarouselRef.current.scrollLeft =
			dragStart.current.scrollLeft - dx;
		didDragRef.current = true;
	}, []);
	const onRelatedDocUp = useCallback(() => {
		document.removeEventListener("mousemove", onRelatedDocMove, {
			capture: true,
		});
		document.removeEventListener("mouseup", onRelatedDocUp, {
			capture: true,
		});
		setIsDragging(false);
		setTimeout(() => {
			didDragRef.current = false;
		}, 0);
	}, [onRelatedDocMove]);
	const handleRelatedMouseDown = useCallback(
		(e) => {
			if (!relatedCarouselRef.current) return;
			didDragRef.current = false;
			setIsDragging(true);
			dragStart.current = {
				x: e.pageX,
				scrollLeft: relatedCarouselRef.current.scrollLeft,
			};
			document.addEventListener("mousemove", onRelatedDocMove, {
				passive: false,
				capture: true,
			});
			document.addEventListener("mouseup", onRelatedDocUp, {
				capture: true,
			});
		},
		[onRelatedDocMove, onRelatedDocUp],
	);

	// Clean up document listeners if component unmounts during drag
	useEffect(() => {
		return () => {
			document.removeEventListener("mousemove", onRelatedDocMove, {
				capture: true,
			});
			document.removeEventListener("mouseup", onRelatedDocUp, {
				capture: true,
			});
		};
	}, [onRelatedDocMove, onRelatedDocUp]);

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

	const display = getProductDisplayPrice(product, region);
	const discountedPrice = display.discountedPrice;
	const displayPrice = display.price;
	const symbol = display.symbol;

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

			<div className="px-4 py-8 pt-5 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
						href={`/${locale}/shop/all`}
						className="transition-colors hover:text-gray-700"
					>
						{locale === "zh-CN" ? "商店" : "商店"}
					</Link>
					<ChevronRight className="w-4 h-4" />
					<span className="font-medium text-gray-900 line-clamp-1">
						{product ? getProductName(product, locale) : ""}
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
											alt={getProductName(product, locale)}
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
														alt={`${getProductName(product, locale)} - Zoomed`}
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
							{product ? getProductName(product, locale) : ""}
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

						{/* Price (by region: 中/港/台) */}
						<div className="space-y-2">
							<div className="flex items-baseline gap-3">
								<span className="text-3xl font-bold text-gray-900">
									{symbol}
									{hasDiscount
										? discountedPrice.toFixed(0)
										: displayPrice.toFixed(0)}
								</span>
								{hasDiscount && (
									<>
										<span className="text-lg text-gray-400 line-through">
											{symbol}
											{displayPrice.toFixed(0)}
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
								{product ? getProductDescription(product, locale) : ""}
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

						{/* Gift report type (choose one as gift) */}
						{Array.isArray(product?.giftReportTypes) &&
							product.giftReportTypes.length > 0 && (
								<div className="space-y-3">
									<span className="text-sm font-medium text-gray-700">
										{locale === "zh-CN"
											? "选择赠送报告类型"
											: "選擇贈送報告類型"}
									</span>
									<div className="flex flex-wrap gap-2">
										{product.giftReportTypes.map((type) => (
											<button
												key={type}
												type="button"
												onClick={() => {
													setSelectedGiftReport(
														selectedGiftReport ===
															type
															? null
															: type,
													);
													setShowGiftReportWarning(
														false,
													);
												}}
												className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
													selectedGiftReport === type
														? "border-[#6B8E23] bg-[#6B8E23]/10 text-[#6B8E23]"
														: "border-gray-200 hover:border-gray-300"
												}`}
											>
												{GIFT_REPORT_LABELS[type] ||
													type}
											</button>
										))}
									</div>
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
						{(() => {
							const needsLogin = !session?.user;
							const needsGiftReport =
								Array.isArray(product?.giftReportTypes) &&
								product.giftReportTypes.length > 0 &&
								!selectedGiftReport;
							const outOfStock =
								!product?.isDigital && product?.stock === 0;
							// Allow click when not logged in or gift report missing, so we can show the warning
							const isDisabled = outOfStock || isAddingToCart;
							const buttonText = isAddingToCart
								? locale === "zh-CN"
									? "加入中..."
									: "加入中..."
								: needsLogin
									? locale === "zh-CN"
										? "请先登录"
										: "請先登入"
									: needsGiftReport
										? locale === "zh-CN"
											? "请选择赠送报告类型"
											: "請選擇贈送報告類型"
										: locale === "zh-CN"
											? "加入购物车"
											: "加到購物車";
							return (
								<div className="space-y-2">
									<Button
										size="lg"
										className="w-full bg-[#6B8E23] hover:bg-[#5A7A1E] text-white h-14 text-base font-medium rounded-lg disabled:opacity-90"
										onClick={handleAddToCart}
										disabled={isDisabled}
									>
										{isAddingToCart ? (
											<div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
										) : null}
										{buttonText}
									</Button>
									{showLoginWarning && needsLogin && (
										<p
											role="alert"
											className="text-sm text-amber-600 font-medium flex items-center gap-1.5"
										>
											<span className="inline-flex w-4 h-4 rounded-full bg-amber-500 text-white text-xs items-center justify-center flex-shrink-0">
												!
											</span>
											{locale === "zh-CN"
												? "请先登录后再加入购物车"
												: "請先登入後再加入購物車"}
										</p>
									)}
									{showGiftReportWarning &&
										Array.isArray(
											product?.giftReportTypes,
										) &&
										product.giftReportTypes.length > 0 && (
											<p
												role="alert"
												className="text-sm text-amber-600 font-medium flex items-center gap-1.5"
											>
												<span className="inline-flex w-4 h-4 rounded-full bg-amber-500 text-white text-xs items-center justify-center flex-shrink-0">
													!
												</span>
												{locale === "zh-CN"
													? "请先选择赠送报告类型后再加入购物车"
													: "請先選擇贈送報告類型後再加入購物車"}
											</p>
										)}
								</div>
							);
						})()}
					</div>
				</div>
				{/* Policy / 统一说明 - small grey text */}
				<div className="px-4 py-8 sm:px-6 lg:px-8 border-t border-gray-100">
					<div className="mx-auto max-w-4xl">
						<div className="text-xs sm:text-sm text-gray-500 leading-relaxed space-y-6">
							{locale === "zh-CN" ? (
								<>
									<div>
										<p className="font-medium text-gray-600 mb-1">
											退款及退换货政策：
										</p>
										<p className="whitespace-pre-line">
											本商品送达后享有【七天冷静期】的权利。
											请留意，此冷静期旨在让您有充分时间检视商品，并非试用期。如需退货，商品必须保持未经使用、未经损坏的完整状态（包含商品、所有原装包装、配件及赠品），否则我们可能无法受理您的退货申请。如有任何商品质量或物流运输问题，请在收货后7日内联络我们的在线客服并提供凭证，我们定当积极为您妥善处理。
										</p>
									</div>
								</>
							) : (
								<>
									<div>
										<p className="font-medium text-gray-600 mb-1">
											退款及退換貨政策：
										</p>
										<p className="whitespace-pre-line">
											本商品送達後享有【七天冷靜期】的權利。
											請留意，此冷靜期旨在讓您有充分時間檢視商品，並非試用期。如需退貨，商品必須保持未經使用、未經損壞的完整狀態（包含商品、所有原裝包裝、配件及贈品），否則我們可能無法受理您的退貨申請。如有任何商品質量或物流運輸問題，請在收貨後7日內聯絡我們的在線客服並提供憑證，我們定當積極為您妥善處理。
										</p>
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Reviews and FAQ Section */}
				{/* <div className="mt-16 border-t border-gray-200"> */}
				{/* Tab Navigation */}
				{/* <div className="flex gap-8 border-b border-gray-200">
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
 */}
				{/* Tab Content */}
				{/* <div className="py-8">
						{activeTab === "reviews" ? (
							<div className="space-y-6">
								{/* Reviews Filter */}
				{/* <div className="flex items-center justify-between">
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
 */}
				{/* Reviews List */}
				{/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{reviews.map((review) => (
										<div
											key={review.id}
											className="p-6 space-y-3 bg-gray-50 rounded-xl"
										> */}
				{/* User Info and Rating */}
				{/* <div className="flex items-start justify-between">
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
											</div> */}

				{/* Review Text */}
				{/* <p className="text-sm leading-relaxed text-gray-700">
												{review.text}
											</p>
										</div> */}
				{/* ))} */}
				{/* </div>
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
 */}
				{/* Related Products Section - 4 items, carousel on narrow screens */}
				{relatedProducts.length > 0 && (
					<div className="pt-16 mt-16 border-t border-gray-200">
						<h2 className="mb-8 text-2xl font-bold text-center text-gray-900">
							{locale === "zh-CN" ? "猜你喜欢" : "猜你喜歡"}
						</h2>
						<div
							ref={relatedCarouselRef}
							className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide select-none snap-x snap-mandatory"
							style={{
								WebkitOverflowScrolling: "touch",
								cursor: isDragging ? "grabbing" : "grab",
							}}
							onMouseDown={handleRelatedMouseDown}
							role="region"
							aria-label={
								locale === "zh-CN" ? "相关产品" : "相關產品"
							}
						>
							{relatedProducts.map((relatedProduct) => {
								const hasDiscount =
									relatedProduct.discount &&
									relatedProduct.discount.percentage > 0 &&
									(!relatedProduct.discount.validUntil ||
										new Date(
											relatedProduct.discount.validUntil,
										) > new Date());

								const relDisplay = getProductDisplayPrice(
									relatedProduct,
									region,
								);
								const discountedPrice =
									relDisplay.discountedPrice;
								const displayPrice = relDisplay.price;
								const relSymbol = relDisplay.symbol;

								const rating =
									relatedProduct.rating?.average || 4.5;

								return (
									<Link
										key={relatedProduct._id}
										href={`/${locale}/shop/product/${relatedProduct._id}`}
										className="group flex-shrink-0 w-[280px] sm:w-[260px] md:w-[280px] lg:w-[calc(25%-18px)] min-w-[260px] snap-start"
										style={{ scrollSnapAlign: "start" }}
										draggable={false}
										onDragStart={(e) => e.preventDefault()}
										onClick={(e) => {
											if (didDragRef.current)
												e.preventDefault();
										}}
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
															getProductName(relatedProduct, locale)
														}
														fill
														draggable={false}
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
													{getProductName(relatedProduct, locale)}
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
														{relSymbol}
														{hasDiscount
															? discountedPrice.toFixed(
																	0,
																)
															: displayPrice.toFixed(
																	0,
																)}
													</span>
													{hasDiscount && (
														<span className="text-xs text-gray-400 line-through">
															{relSymbol}
															{displayPrice.toFixed(
																0,
															)}
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

			{/* Newsletter Banner - mobile: stacked, centered, envelope icon; desktop: same as price page */}
			<div className="relative z-10 -mb-6 px-4 sm:px-6">
				<div className="container mx-auto max-w-full">
					<div className="bg-[#8B9F3A] rounded-2xl sm:rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="px-5 py-8 sm:px-8 sm:py-10 md:px-12">
							<div className="flex flex-col items-center justify-between gap-6 md:gap-8 md:flex-row text-center md:text-left">
								<div className="text-white w-full md:w-auto">
									<h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
										{locale === "zh-CN"
											? "随时了解"
											: "隨時了解"}
									</h2>
									<h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
										{locale === "zh-CN"
											? "我们的最新优惠"
											: "我們的最新優惠"}
									</h2>
								</div>
								<div className="flex flex-col gap-4 w-full max-w-md md:w-auto md:min-w-[320px] lg:min-w-[400px]">
									{/* Email input with envelope icon - full width on mobile */}
									<div className="relative w-full">
										<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
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
											className="h-11 sm:h-12 pl-11 pr-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-800 bg-white rounded-full border-0 placeholder:text-gray-400 w-full"
										/>
									</div>
									<Button
										onClick={handleNewsletterSubmit}
										size="lg"
										className="h-11 sm:h-12 px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base text-gray-800 bg-white rounded-full hover:bg-gray-100 touch-manipulation w-full"
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
		</div>
	);
}
