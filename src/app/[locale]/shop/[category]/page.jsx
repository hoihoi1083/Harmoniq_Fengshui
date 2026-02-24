"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ChevronRight,
	ChevronLeft,
	ChevronDown,
	ChevronUp,
	SlidersHorizontal,
	Sparkles,
	ShoppingCart,
	Mail,
	Star,
} from "lucide-react";
import ShopNavbar from "@/components/ShopNavbar";
import FooterV2 from "@/components/home/FooterV2";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRegionDetectionWithRedirect } from "@/hooks/useRegionDetectionEnhanced";
import { getProductDisplayPrice } from "@/lib/productPrice";
import ProductCard from "@/components/shop/ProductCard";

function CategoryPageContent() {
	const { data: session } = useSession();
	const params = useParams();
	const { region } = useRegionDetectionWithRedirect({
		skipFirstRedirect: true,
	});
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = params.locale;
	const category = params.category;
	const searchQuery = searchParams.get("search");

	const [allProducts, setAllProducts] = useState([]);
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(1000);
	const [selectedProductType, setSelectedProductType] = useState(null);
	const [selectedElement, setSelectedElement] = useState(null);
	const [expandedSections, setExpandedSections] = useState({
		productType: true,
		price: true,
		crystalType: true,
		featured: true,
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [sortBy, setSortBy] = useState("most-popular");
	const [cartCount, setCartCount] = useState(0);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [currentReview, setCurrentReview] = useState(0);
	const reviewCarouselRef = useRef(null);

	// User reviews – expanded for carousel (defined early so useEffect can depend on it)
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
		{
			name: locale === "zh-CN" ? "王太太" : "王太太",
			rating: 5,
			text:
				locale === "zh-CN"
					? "给家人买了黑曜石手串，做工细致，能量感明显。客服很耐心地根据生辰推荐款式，非常贴心。"
					: "給家人買了黑曜石手串，做工細緻，能量感明顯。客服很耐心地根據生辰推薦款式，非常貼心。",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "林小姐" : "林小姐",
			rating: 5,
			text:
				locale === "zh-CN"
					? "粉晶和月光石搭配的手链太美了，戴了两个月感觉心情平稳很多，感情方面也有好的变化。值得回购。"
					: "粉晶和月光石搭配的手鏈太美了，戴了兩個月感覺心情平穩很多，感情方面也有好的變化。值得回購。",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "黄先生" : "黃先生",
			rating: 5,
			text:
				locale === "zh-CN"
					? "办公室放了绿幽灵摆件后，团队氛围和业绩都有改善。东西是正品，包装防震做得很好。"
					: "辦公室放了綠幽靈擺件後，團隊氛圍和業績都有改善。東西是正品，包裝防震做得很好。",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "何女士" : "何女士",
			rating: 5,
			text:
				locale === "zh-CN"
					? "第一次买水晶就选了这家，客服根据我的五行和需求推荐了白水晶和紫水晶，戴起来很舒服，推荐。"
					: "第一次買水晶就選了這家，客服根據我的五行和需求推薦了白水晶和紫水晶，戴起來很舒服，推薦。",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "吴小姐" : "吳小姐",
			rating: 5,
			text:
				locale === "zh-CN"
					? "石榴石手串色泽正，尺寸合适。买了专属能量报告，解读很详细，对了解自己的运势很有帮助。"
					: "石榴石手串色澤正，尺寸合適。買了專屬能量報告，解讀很詳細，對了解自己的運勢很有幫助。",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "郑先生" : "鄭先生",
			rating: 5,
			text:
				locale === "zh-CN"
					? "送女友的海蓝宝项链她很喜欢，说颜色通透。店家附了保养小卡，很用心。会再买其他款式。"
					: "送女友的海藍寶項鏈她很喜歡，說顏色通透。店家附了保養小卡，很用心。會再買其他款式。",
			verified: true,
		},
		{
			name: locale === "zh-CN" ? "刘太太" : "劉太太",
			rating: 5,
			text:
				locale === "zh-CN"
					? "家里风水摆件和手串都在这里买，品质稳定，价格合理。最近财运和家庭关系都有好转，会继续支持。"
					: "家裡風水擺件和手串都在這裡買，品質穩定，價格合理。最近財運和家庭關係都有好轉，會繼續支持。",
			verified: true,
		},
	];

	// Sync scroll position when currentReview changes (carousel with peek)
	useEffect(() => {
		const el = reviewCarouselRef.current;
		if (!el || reviews.length === 0) return;
		const cardWidthPx = 280;
		const gapPx = 24;
		const stepPx = cardWidthPx + gapPx;
		const peekPx = 32;
		const scrollLeft = Math.max(
			0,
			Math.min(
				currentReview * stepPx - peekPx,
				el.scrollWidth - el.clientWidth,
			),
		);
		el.scrollTo({ left: scrollLeft, behavior: "smooth" });
	}, [currentReview, reviews.length]);

	const handleNewsletterSubmit = () => {
		console.log("Newsletter subscribed with email:", email);
		setEmail("");
	};

	const PRODUCTS_PER_PAGE = 12;
	const totalPages = Math.max(
		1,
		Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
	);
	const paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * PRODUCTS_PER_PAGE,
		currentPage * PRODUCTS_PER_PAGE,
	);

	// Reset to page 1 when filters change (result set length changes)
	useEffect(() => {
		setCurrentPage(1);
	}, [
		filteredProducts.length,
		selectedProductType,
		selectedElement,
		searchQuery,
	]);

	// Clamp currentPage when total pages decreases (e.g. after filtering)
	useEffect(() => {
		setCurrentPage((p) => Math.min(p, totalPages));
	}, [totalPages]);

	// Close filter drawer on mobile when a filter is applied (so user sees results)
	useEffect(() => {
		setFilterDrawerOpen((open) => (open ? false : open));
	}, [selectedProductType, selectedElement]);

	// Fetch products from API
	useEffect(() => {
		fetchProducts();
	}, [category]);

	// Fetch cart count
	useEffect(() => {
		if (session?.user) {
			fetchCart();
		}
	}, [session]);

	const fetchCart = async () => {
		try {
			const res = await fetch("/api/shop/cart");
			const data = await res.json();
			if (data.success && data.data?.items) {
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

	const handleAddToCart = async (product, giftReportType) => {
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
					...(Array.isArray(product?.giftReportTypes) &&
					product.giftReportTypes.length > 0 &&
					giftReportType
						? { giftReportType }
						: {}),
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
				toast.success(
					locale === "zh-CN" ? "已加入购物车" : "已加入購物車",
				);
			} else {
				toast.error(
					data.error ||
						(locale === "zh-CN"
							? "加入购物车失败"
							: "加入購物車失敗"),
				);
			}
		} catch (error) {
			console.error("Failed to add to cart:", error);
			toast.error(
				locale === "zh-CN" ? "加入购物车失败" : "加入購物車失敗",
			);
		}
	};

	// Set category filter when URL changes or from sessionStorage
	useEffect(() => {
		if (category === "all" && typeof window !== "undefined") {
			// Check if there's a stored category selection
			const storedCategory = sessionStorage.getItem("selectedCategory");
			if (storedCategory) {
				setSelectedProductType(storedCategory);
				// Clear it after using
				sessionStorage.removeItem("selectedCategory");
			}
		} else if (category && category !== "all") {
			setSelectedProductType(category);
		}
	}, [category]);

	// Apply filters whenever filter state changes
	useEffect(() => {
		applyFilters();
	}, [
		allProducts,
		selectedProductType,
		selectedElement,
		minPrice,
		maxPrice,
		sortBy,
		searchQuery,
	]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/shop/products?limit=100`);
			const data = await res.json();

			console.log("API Response:", data);

			if (data.success) {
				let products = data.data.products;
				console.log("Total products from API:", products.length);

				// Filter by category if specified
				if (category && category !== "all") {
					const urlCategory = category.toLowerCase();

					// Category name keywords in different languages
					const categoryKeywords = {
						earring: ["耳環", "耳饰", "耳飾", "earring"],
						bracelet: ["手串", "手链", "手鍊", "bracelet", "charm"],
						ring: ["戒指", "ring"],
						necklace: ["项链", "項鏈", "necklace"],
						pendant: ["吊坠", "吊墜", "pendant"],
						"feng-shui": [
							"风水",
							"風水",
							"摆件",
							"擺件",
							"feng-shui",
							"decoration",
						],
					};

					const keywords = categoryKeywords[urlCategory] || [
						urlCategory,
					];

					products = products.filter((product) => {
						const productCategory =
							product.category?.toLowerCase() || "";
						const productNameZhCN =
							product.name?.["zh-CN"]?.toLowerCase() || "";
						const productNameZhTW =
							product.name?.["zh-TW"]?.toLowerCase() || "";
						const productName =
							typeof product.name === "string"
								? product.name.toLowerCase()
								: "";

						// Check if category field matches
						const categoryMatches = keywords.some((keyword) =>
							productCategory.includes(keyword.toLowerCase()),
						);

						// Check if product name contains the keyword
						const nameMatches = keywords.some(
							(keyword) =>
								productNameZhCN.includes(keyword) ||
								productNameZhTW.includes(keyword) ||
								productName.includes(keyword.toLowerCase()),
						);

						return categoryMatches || nameMatches;
					});

					console.log(
						"Products after category filter:",
						products.length,
						"for category:",
						category,
					);
				}

				setAllProducts(products);
			}
		} catch (error) {
			console.error("Failed to fetch products:", error);
			toast.error(locale === "zh-CN" ? "加载商品失败" : "載入商品失敗");
		} finally {
			setLoading(false);
		}
	};

	const applyFilters = () => {
		console.log(
			"🔍 applyFilters called - searchQuery:",
			searchQuery,
			"allProducts:",
			allProducts.length,
		);

		if (allProducts.length === 0) {
			setFilteredProducts([]);
			return;
		}

		let filtered = [...allProducts];

		// Filter by search query
		if (searchQuery && searchQuery.trim()) {
			console.log("🔍 Applying search filter for:", searchQuery);
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((p) => {
				const nameZhCN = p.name?.zh_CN?.toLowerCase() || "";
				const nameZhTW = p.name?.zh_TW?.toLowerCase() || "";
				const nameEn = p.name?.en?.toLowerCase() || "";
				const name =
					typeof p.name === "string" ? p.name.toLowerCase() : "";

				// DEBUG: Expanded logging to see actual data structure
				if (query === "i don't" || query === "i don't") {
					console.log("🔍 DEBUG Product:", {
						nameZhCN,
						nameZhTW,
						nameEn,
						name,
						rawName: p.name,
						productId: p._id,
						productKeys: Object.keys(p),
					});
					console.log(
						"🔍 Full product object:",
						JSON.stringify(p, null, 2),
					);
				}

				// Handle description which can be string or object
				const descZhCN = p.description?.zh_CN?.toLowerCase() || "";
				const descZhTW = p.description?.zh_TW?.toLowerCase() || "";
				const descEn = p.description?.en?.toLowerCase() || "";
				const description =
					typeof p.description === "string"
						? p.description.toLowerCase()
						: "";

				const category = p.category?.toLowerCase() || "";

				return (
					nameZhCN.includes(query) ||
					nameZhTW.includes(query) ||
					nameEn.includes(query) ||
					name.includes(query) ||
					descZhCN.includes(query) ||
					descZhTW.includes(query) ||
					descEn.includes(query) ||
					description.includes(query) ||
					category.includes(query)
				);
			});
			console.log(
				"🔍 After search filter:",
				filtered.length,
				"products found",
			);
		} else {
			// Only apply category filter if NOT searching
			// Filter by product type (sub-category)
			if (selectedProductType) {
				filtered = filtered.filter(
					(p) => p.category === selectedProductType,
				);
			}
		}

		// Filter by element type
		if (selectedElement) {
			filtered = filtered.filter(
				(p) => p.elementType === selectedElement,
			);
		}

		// Filter by price range
		filtered = filtered.filter(
			(p) => p.price >= minPrice && p.price <= maxPrice,
		);

		// Apply sorting
		if (sortBy === "price-low-high") {
			filtered.sort((a, b) => a.price - b.price);
		} else if (sortBy === "price-high-low") {
			filtered.sort((a, b) => b.price - a.price);
		} else if (sortBy === "newest") {
			filtered.sort(
				(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
			);
		} else if (sortBy === "most-popular") {
			filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
		}

		setFilteredProducts(filtered);
		console.log(
			"Filtered products:",
			filtered.length,
			"from",
			allProducts.length,
			searchQuery ? `searching for "${searchQuery}"` : "",
		);
	};

	// Category display names
	const categoryNames = {
		all: locale === "zh-CN" ? "全部商品" : "全部商品",
		casual: "Casual",
		formal: "Formal",
		earring: locale === "zh-CN" ? "耳饰" : "耳飾",
		bracelet: locale === "zh-CN" ? "手串" : "手串",
		"feng-shui": locale === "zh-CN" ? "风水摆件" : "風水擺件",
		ring: locale === "zh-CN" ? "戒指" : "戒指",
		necklace: locale === "zh-CN" ? "项链" : "項鏈",
		pendant: locale === "zh-CN" ? "吊坠" : "吊墜",
	};

	const productTypes = [
		{ id: "earring", label: locale === "zh-CN" ? "耳饰" : "耳飾" },
		{ id: "bracelet", label: locale === "zh-CN" ? "手串" : "手串" },
		{ id: "necklace", label: locale === "zh-CN" ? "项链" : "項鏈" },
		{ id: "ring", label: locale === "zh-CN" ? "戒指" : "戒指" },
		{ id: "pendant", label: locale === "zh-CN" ? "吊坠" : "吊墜" },
	];

	const elementTypes = [
		{ id: "Gold", label: locale === "zh-CN" ? "金" : "金", icon: "🔆" },
		{ id: "Wood", label: locale === "zh-CN" ? "木" : "木", icon: "🌳" },
		{ id: "Water", label: locale === "zh-CN" ? "水" : "水", icon: "💧" },
		{ id: "Fire", label: locale === "zh-CN" ? "火" : "火", icon: "🔥" },
		{ id: "Earth", label: locale === "zh-CN" ? "土" : "土", icon: "⛰️" },
	];

	const toggleSection = (section) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const categoryName =
		categoryNames[category] ||
		category.charAt(0).toUpperCase() + category.slice(1);

	// Display title: reflect active filters (product type, element) so it's not always "全部商品"
	const productTypeLabel = productTypes.find(
		(p) => p.id === selectedProductType,
	)?.label;
	const elementLabel = elementTypes.find(
		(e) => e.id === selectedElement,
	)?.label;
	const filterLabels = [productTypeLabel, elementLabel].filter(Boolean);
	const displayTitle =
		filterLabels.length > 0 ? filterLabels.join(" · ") : categoryName;

	// Count active filters
	const activeFilterCount = [
		searchQuery !== null && searchQuery.trim() !== "",
		selectedProductType !== null,
		selectedElement !== null,
		minPrice > 0 || maxPrice < 1000,
	].filter(Boolean).length;

	const clearAllFilters = () => {
		setSelectedProductType(null);
		setSelectedElement(null);
		setMinPrice(0);
		setMaxPrice(1000);
		// Clear search query by navigating to URL without search param
		router.push(`/${locale}/shop/all`);
	};

	const renderStars = (rating) => {
		const numRating = Number(rating) || 0;
		return (
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => (
					<span
						key={star}
						className={`text-sm ${
							star <= Math.floor(numRating)
								? "text-yellow-400"
								: star - 0.5 <= numRating
									? "text-yellow-400"
									: "text-gray-300"
						}`}
					>
						★
					</span>
				))}
				<span className="ml-1 text-xs text-gray-500">
					{numRating.toFixed(1)}
				</span>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-white">
			<ShopNavbar cartCount={cartCount} />
			{/* Hero Banner Section - responsive */}
			<section className="relative bg-gradient-to-br from-[#F5F5F0] via-[#FAFAF8] to-white overflow-hidden pt-10 pb-24 sm:pt-8 sm:pb-28 md:pt-10 md:pb-12 lg:pt-12 lg:pb-16 lg:min-h-[70vh] flex flex-col">
				{/* Crystal as background: always bottom-right, size scales with viewport */}
				<div
					className="absolute inset-0 z-0 pointer-events-none"
					aria-hidden
				>
					<div
						className="absolute right-0 bottom-0 w-[100vh] h-[100vh] min-h-[320px] max-w-[90vw]"
						style={{ aspectRatio: "1" }}
					>
						<Image
							src="/images/Shop-home/Crystal.png"
							alt=""
							fill
							className="object-contain object-[bottom_right] drop-shadow-2xl"
							priority
							onError={(e) => {
								e.currentTarget.style.display = "none";
								const next = e.currentTarget.nextElementSibling;
								if (next) next.style.display = "flex";
							}}
						/>
						<div className="hidden absolute inset-0 items-center justify-center bg-transparent">
							<Sparkles className="w-32 h-32 text-[#6B8E23] opacity-20" />
						</div>
						{/* Sparkles at top of image (positioned in visible area; container is 100vh bottom-aligned so top-2 was clipped) */}
						<div
							className="absolute top-[35%] left-2 sm:left-4 text-[#8B9F3A] opacity-80 animate-pulse z-10"
							aria-hidden
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-7 h-7 sm:w-9 sm:h-9 drop-shadow-sm"
							>
								<path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
							</svg>
						</div>
						<div
							className="absolute top-[35%] right-2 sm:right-4 text-[#8B9F3A] opacity-80 animate-pulse z-10"
							aria-hidden
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-7 h-7 sm:w-9 sm:h-9 drop-shadow-sm"
							>
								<path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
							</svg>
						</div>
					</div>
				</div>
				<div className="container px-4 sm:px-6 mx-auto relative z-10 flex-1 flex flex-col justify-center">
					<div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
						{/* Left Content */}
						<div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-7 max-w-xl">
							<div className="relative pr-10 sm:pr-12">
								<h1
									className="text-[2rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-[#6B8E23]"
									style={{
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										fontWeight: 700,
									}}
								>
									{locale === "zh-CN"
										? "探索与您气场相合的水晶能量"
										: "探索與您氣場相合的水晶能量"}
								</h1>
								{/* Decorative Sparkle */}
								<div className="absolute right-0 top-0 text-[#8B9F3A] opacity-80 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										className="animate-pulse w-full h-full"
									>
										<path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
									</svg>
								</div>
							</div>

							<p className="text-base mb-10 sm:text-lg text-gray-600 leading-relaxed">
								{locale === "zh-CN"
									? "浏览我们品类丰富的开运佳品，所有物件均经匠心力作与能量加持，旨在助您调和命理格局，契合个人运势，激发专属您的正向能量。"
									: "瀏覽我們品類豐富的開運佳品，所有物件均經匠心力作與能量加持，旨在助您調和命理格局，契合個人運勢，激發專屬您的正向能量。"}
							</p>

							{/* Promo banner - not a button */}
							<div className="w-full py-3 px-4 sm:py-4 sm:px-5 mb-6 sm:mb-8 lg:mb-10 bg-[#99A800] text-white text-center text-sm sm:text-base md:text-lg font-bold">
								{locale === "zh-CN"
									? "购买开运水晶 赠送专属水晶能量报告"
									: "購買開運水晶 贈送專屬水晶能量報告"}
							</div>

							<Button
								size="lg"
								className="w-full sm:w-auto bg-[#2C2C2C] hover:bg-[#1C1C1C] text-white px-8 py-4 sm:px-10 sm:py-5 lg:px-14 lg:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
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

						{/* Right side empty so background crystal shows through on desktop */}
						<div className="hidden lg:block" aria-hidden />
					</div>
				</div>
			</section>

			{/* Black Divider Bar */}
			<section className="bg-gray-900 py-3">
				<div className="container px-4 mx-auto"></div>
			</section>
			<div className="container px-4 mx-auto py-6 md:py-8">
				{/* Breadcrumb - hidden on mobile */}
				<div className="hidden md:flex items-center gap-2 text-sm text-gray-600 mb-6">
					<Link href={`/${locale}`} className="hover:text-[#8B9F3A]">
						Home
					</Link>
					<ChevronRight className="w-4 h-4" />
					<span className="text-gray-900">{categoryName}</span>
				</div>

				{/* Mobile filter drawer backdrop */}
				{filterDrawerOpen && (
					<div
						className="fixed inset-0 bg-black/40 z-30 lg:hidden"
						aria-hidden="true"
						onClick={() => setFilterDrawerOpen(false)}
					/>
				)}

				<div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
					{/* Left Sidebar - hidden on mobile, shown in drawer when filter button clicked */}
					<aside
						className={`
							w-full lg:w-64 flex-shrink-0 border border-gray-200 rounded-lg p-4
							fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
							h-full lg:h-auto max-w-[85vw] sm:max-w-sm lg:max-w-none
							bg-white shadow-xl lg:shadow-none
							transform transition-transform duration-300 ease-out
							overflow-y-auto
							${filterDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
						`}
					>
						{/* Mobile: close drawer button */}
						<div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 lg:hidden sticky top-0 bg-white z-10">
							<span className="font-semibold text-gray-800">
								{locale === "zh-CN" ? "篩選" : "篩選"}
							</span>
							<button
								type="button"
								onClick={() => setFilterDrawerOpen(false)}
								className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
								aria-label={
									locale === "zh-CN" ? "關閉" : "關閉"
								}
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="space-y-6">
							{/* Filter Header with Clear Button */}
							{activeFilterCount > 0 && (
								<div className="flex items-center justify-between pb-4 border-b border-gray-200">
									<span className="text-sm text-gray-600">
										{activeFilterCount}{" "}
										{locale === "zh-CN"
											? "个筛选器"
											: "個篩選器"}
									</span>
									<button
										onClick={clearAllFilters}
										className="text-sm text-[#8B9F3A] hover:text-[#6B7D2A] font-medium"
									>
										{locale === "zh-CN"
											? "清除全部"
											: "清除全部"}
									</button>
								</div>
							)}

							{/* Active Search Filter */}
							{searchQuery && (
								<div className="pb-4 border-b border-gray-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-700">
											{locale === "zh-CN"
												? "搜索"
												: "搜索"}
										</span>
									</div>
									<div className="flex items-center gap-2 bg-[#F0F4E8] px-3 py-2 rounded-lg">
										<span className="text-sm text-gray-700 flex-1 truncate">
											"{searchQuery}"
										</span>
										<button
											onClick={() =>
												router.push(
													`/${locale}/shop/all`,
												)
											}
											className="text-gray-500 hover:text-gray-700 flex-shrink-0"
											title={
												locale === "zh-CN"
													? "清除搜索"
													: "清除搜索"
											}
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								</div>
							)}

							{/* Product Type Section */}
							<div className="border-b border-gray-200 pb-4">
								<button
									onClick={() => toggleSection("productType")}
									className="flex items-center justify-between w-full mb-4"
								>
									<h3 className="font-bold text-lg">
										{locale === "zh-CN"
											? "产品类型"
											: "產品類型"}
									</h3>
									<SlidersHorizontal className="w-5 h-5 text-gray-400" />
								</button>
								{expandedSections.productType && (
									<div className="space-y-3">
										<button
											onClick={() =>
												setSelectedProductType(null)
											}
											className={`flex items-center justify-between w-full transition-colors ${
												selectedProductType === null
													? "text-[#8B9F3A] font-semibold"
													: "text-gray-700 hover:text-[#8B9F3A]"
											}`}
										>
											<span>
												{locale === "zh-CN"
													? "全部"
													: "全部"}
											</span>
											<ChevronRight className="w-4 h-4" />
										</button>
										{productTypes.map((item) => (
											<button
												key={item.id}
												onClick={() =>
													setSelectedProductType(
														item.id,
													)
												}
												className={`flex items-center justify-between w-full transition-colors ${
													selectedProductType ===
													item.id
														? "text-[#8B9F3A] font-semibold"
														: "text-gray-700 hover:text-[#8B9F3A]"
												}`}
											>
												<span>{item.label}</span>
												<ChevronRight className="w-4 h-4" />
											</button>
										))}
									</div>
								)}
							</div>

							{/* Price Range Section */}
							<div className="border-b border-gray-200 pb-4">
								<button
									onClick={() => toggleSection("price")}
									className="flex items-center justify-between w-full mb-4"
								>
									<h3 className="font-bold text-lg">
										{locale === "zh-CN" ? "价钱" : "價錢"}
									</h3>
									{expandedSections.price ? (
										<ChevronUp className="w-5 h-5 text-gray-400" />
									) : (
										<ChevronDown className="w-5 h-5 text-gray-400" />
									)}
								</button>
								{expandedSections.price && (
									<div className="space-y-5 px-1">
										{/* Price Display */}
										<div className="flex items-center justify-between">
											<div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-800">
												${minPrice}
											</div>
											<div className="h-px flex-1 mx-3 bg-gray-300"></div>
											<div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-800">
												${maxPrice}
											</div>
										</div>

										{/* Dual Range Slider */}
										<div className="relative h-5 flex items-center">
											{/* Background Track */}
											<div className="absolute h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-full shadow-inner"></div>

											{/* Active Range */}
											<div
												className="absolute h-2 bg-gradient-to-r from-[#8B9F3A] to-[#6d7d2e] rounded-full shadow-sm"
												style={{
													left: `${(minPrice / 1000) * 100}%`,
													right: `${100 - (maxPrice / 1000) * 100}%`,
												}}
											></div>

											{/* Min Slider */}
											<input
												type="range"
												min="0"
												max="1000"
												step="10"
												value={minPrice}
												onChange={(e) => {
													const value = Number(
														e.target.value,
													);
													if (value < maxPrice - 10) {
														setMinPrice(value);
													}
												}}
												className="absolute w-full h-5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-[#8B9F3A] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-[#8B9F3A] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110"
												style={{
													zIndex:
														minPrice >
														maxPrice - 100
															? 5
															: 3,
												}}
											/>

											{/* Max Slider */}
											<input
												type="range"
												min="0"
												max="1000"
												step="10"
												value={maxPrice}
												onChange={(e) => {
													const value = Number(
														e.target.value,
													);
													if (value > minPrice + 10) {
														setMaxPrice(value);
													}
												}}
												className="absolute w-full h-5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-[#8B9F3A] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-[#8B9F3A] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110"
												style={{ zIndex: 4 }}
											/>
										</div>
									</div>
								)}
							</div>

							{/* Crystal Type Filter Section */}
							<div className="border-b border-gray-200 pb-4">
								<button
									onClick={() => toggleSection("crystalType")}
									className="flex items-center justify-between w-full mb-4"
								>
									<h3 className="font-bold text-lg">
										{locale === "zh-CN"
											? "五行元素"
											: "五行元素"}
									</h3>
									{expandedSections.crystalType ? (
										<ChevronUp className="w-5 h-5 text-gray-400" />
									) : (
										<ChevronDown className="w-5 h-5 text-gray-400" />
									)}
								</button>
								{expandedSections.crystalType && (
									<div className="space-y-3">
										<button
											onClick={() =>
												setSelectedElement(null)
											}
											className={`flex items-center justify-between w-full transition-colors ${
												selectedElement === null
													? "text-[#8B9F3A] font-semibold"
													: "text-gray-700 hover:text-[#8B9F3A]"
											}`}
										>
											<span>
												{locale === "zh-CN"
													? "全部"
													: "全部"}
											</span>
											<ChevronRight className="w-4 h-4" />
										</button>
										{elementTypes.map((item) => (
											<button
												key={item.id}
												onClick={() =>
													setSelectedElement(item.id)
												}
												className={`flex items-center justify-between w-full transition-colors ${
													selectedElement === item.id
														? "text-[#8B9F3A] font-semibold"
														: "text-gray-700 hover:text-[#8B9F3A]"
												}`}
											>
												<span>
													{item.icon} {item.label}
												</span>
												<ChevronRight className="w-4 h-4" />
											</button>
										))}
									</div>
								)}
							</div>

							{/* Featured Section */}
							<div className="border-b border-gray-200 pb-4">
								<button
									onClick={() => toggleSection("featured")}
									className="flex items-center justify-between w-full mb-4"
								>
									<h3 className="font-bold text-lg">
										{locale === "zh-CN"
											? "精选推荐"
											: "精選推薦"}
									</h3>
									{expandedSections.featured ? (
										<ChevronUp className="w-5 h-5 text-gray-400" />
									) : (
										<ChevronDown className="w-5 h-5 text-gray-400" />
									)}
								</button>
								{expandedSections.featured && (
									<div className="space-y-3">
										{[
											{
												key: "2025",
												label:
													locale === "zh-CN"
														? "2025新年打造属蛇"
														: "2025新年打造屬蛇",
											},
											{
												key: "month",
												label:
													locale === "zh-CN"
														? "一月诞生石｜石榴石"
														: "一月誕生石｜石榴石",
											},
											{
												key: "featured",
												label:
													locale === "zh-CN"
														? "精选产品"
														: "精選產品",
											},
											{
												key: "star",
												label:
													locale === "zh-CN"
														? "天干系列"
														: "天干系列",
											},
										].map((item) => (
											<button
												key={item.key}
												className="flex items-center justify-between w-full text-gray-700 hover:text-[#8B9F3A] transition-colors"
											>
												<span>{item.label}</span>
												<ChevronRight className="w-4 h-4" />
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					</aside>

					{/* Right Content */}
					<main className="flex-1 min-w-0">
						{/* Header: title + mobile filter button + sort */}
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
							<div className="flex items-center gap-3 w-full sm:w-auto">
								<h1 className="text-2xl sm:text-3xl font-bold mb-0 flex-1 min-w-0">
									{searchQuery
										? locale === "zh-CN"
											? `"${searchQuery}" 的搜索结果`
											: `"${searchQuery}" 的搜索結果`
										: displayTitle}
								</h1>
								{/* Mobile: filter / adjustment button - opens drawer */}
								<button
									type="button"
									onClick={() => setFilterDrawerOpen(true)}
									className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 flex-shrink-0"
								>
									<SlidersHorizontal className="w-4 h-4" />
									{locale === "zh-CN" ? "篩選" : "篩選"}
								</button>
							</div>
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
								<p className="text-gray-500 text-sm">
									{loading
										? locale === "zh-CN"
											? "加载中..."
											: "載入中..."
										: `${locale === "zh-CN" ? "显示" : "顯示"} ${filteredProducts.length} ${locale === "zh-CN" ? "个产品" : "個產品"}`}
								</p>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-600">
										{locale === "zh-CN"
											? "排序："
											: locale === "zh-TW"
												? "排序："
												: "Sort by:"}
									</span>
									<select
										value={sortBy}
										onChange={(e) =>
											setSortBy(e.target.value)
										}
										className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9F3A]"
									>
										<option value="most-popular">
											{locale === "zh-CN"
												? "最受欢迎"
												: locale === "zh-TW"
													? "最受歡迎"
													: "Most Popular"}
										</option>
										<option value="price-low-high">
											{locale === "zh-CN"
												? "价格：低至高"
												: locale === "zh-TW"
													? "價格：低至高"
													: "Price: Low to High"}
										</option>
										<option value="price-high-low">
											{locale === "zh-CN"
												? "价格：高至低"
												: locale === "zh-TW"
													? "價格：高至低"
													: "Price: High to Low"}
										</option>
										<option value="newest">
											{locale === "zh-CN"
												? "最新上架"
												: locale === "zh-TW"
													? "最新上架"
													: "Newest"}
										</option>
									</select>
								</div>
							</div>
						</div>

						{/* Product Grid - 2 cols mobile, 2-3 cols desktop */}
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
						) : filteredProducts.length === 0 ? (
							<div className="text-center py-20">
								<Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500 text-lg">
									{locale === "zh-CN"
										? "暂无商品"
										: "暫無商品"}
								</p>
							</div>
						) : (
							<>
								<div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
									{paginatedProducts.map((product) => (
										<ProductCard
											key={product.id || product._id}
											product={product}
											onAddToCart={(p, giftReportType) => handleAddToCart(p, giftReportType)}
										/>
									))}
								</div>

								{/* Pagination - only show when more than 1 page */}
								{totalPages > 1 && (
									<div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 border-t border-gray-200 pt-6">
										<button
											disabled={currentPage <= 1}
											onClick={() =>
												setCurrentPage((p) =>
													Math.max(1, p - 1),
												)
											}
											className="flex items-center gap-1.5 sm:gap-2 py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-[#8B9F3A] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none min-w-0"
										>
											<ChevronRight className="w-4 h-4 flex-shrink-0 rotate-180" />
											<span className="whitespace-nowrap">
												{locale === "zh-CN"
													? "上一页"
													: locale === "zh-TW"
														? "上一頁"
														: "Previous"}
											</span>
										</button>
										<div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
											{(() => {
												const pages = [];
												if (totalPages <= 7) {
													for (
														let i = 1;
														i <= totalPages;
														i++
													)
														pages.push(i);
												} else {
													pages.push(
														1,
														2,
														3,
														"...",
														totalPages,
													);
												}
												return pages.map(
													(page, index) =>
														page === "..." ? (
															<span
																key={`ellipsis-${index}`}
																className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 text-sm"
															>
																…
															</span>
														) : (
															<button
																key={page}
																onClick={() =>
																	setCurrentPage(
																		page,
																	)
																}
																className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
																	page ===
																	currentPage
																		? "bg-[#8B9F3A] text-white"
																		: "text-gray-600 hover:bg-gray-100"
																}`}
															>
																{page}
															</button>
														),
												);
											})()}
										</div>
										<button
											disabled={currentPage >= totalPages}
											onClick={() =>
												setCurrentPage((p) =>
													Math.min(totalPages, p + 1),
												)
											}
											className="flex items-center gap-1.5 sm:gap-2 py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-[#8B9F3A] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none min-w-0"
										>
											<span className="whitespace-nowrap">
												{locale === "zh-CN"
													? "下一页"
													: locale === "zh-TW"
														? "下一頁"
														: "Next"}
											</span>
											<ChevronRight className="w-4 h-4 flex-shrink-0" />
										</button>
									</div>
								)}
							</>
						)}
					</main>
				</div>
			</div>

			{/* User Reviews Section - same as shop page */}
			<section className="py-12 md:py-16 bg-white">
				<div className="container px-4 mx-auto max-w-7xl">
					<div className="flex items-center justify-between mb-8 md:mb-12">
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
							{locale === "zh-CN" ? "用户评价" : "用戶評價"}
						</h2>
						<div className="flex gap-2 sm:gap-3">
							<button
								type="button"
								onClick={() => {
									setCurrentReview((prev) =>
										prev === 0
											? reviews.length - 1
											: prev - 1,
									);
								}}
								className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-[#8B7355] flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition-all"
							>
								<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
							</button>
							<button
								type="button"
								onClick={() => {
									setCurrentReview((prev) =>
										prev === reviews.length - 1
											? 0
											: prev + 1,
									);
								}}
								className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-[#8B7355] flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition-all"
							>
								<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
							</button>
						</div>
					</div>
					{/* Carousel: one card (+ peeks) on mobile; multiple cards + peeks on desktop */}
					<div
						ref={reviewCarouselRef}
						className="relative w-full overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide"
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						<style>{`
							.scrollbar-hide::-webkit-scrollbar { display: none; }
						`}</style>
						<div
							className="flex gap-6 items-stretch py-2"
							style={{
								paddingLeft: "32px",
								paddingRight: "32px",
								width: "max-content",
								minWidth: "100%",
							}}
						>
							{reviews.length > 0 &&
								reviews.map((review, index) => (
									<div
										key={index}
										className="flex-shrink-0 w-[280px]"
									>
										<div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-200 h-full">
											<div className="flex gap-1 mb-2 sm:mb-3">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
													/>
												))}
											</div>
											<div className="flex items-center gap-2 mb-2 sm:mb-3">
												<p className="font-bold text-sm sm:text-base text-[#8B7355]">
													{review.name}
												</p>
												{review.verified && (
													<div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
														<span className="text-white text-[10px] sm:text-xs">
															✓
														</span>
													</div>
												)}
											</div>
											<p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
												{review.text}
											</p>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			</section>

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
											className="h-11 sm:h-12 pl-11 pr-4 sm:px-12 py-3 sm:py-4 text-sm sm:text-base text-gray-800 bg-white rounded-full border-0 placeholder:text-gray-400 w-full"
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

export default function CategoryPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-white flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6B8E23] mx-auto mb-4"></div>
						<p className="text-lg text-gray-600">載入中...</p>
					</div>
				</div>
			}
		>
			<CategoryPageContent />
		</Suspense>
	);
}
