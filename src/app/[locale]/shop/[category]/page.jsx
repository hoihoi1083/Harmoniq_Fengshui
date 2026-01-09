"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ChevronRight,
	ChevronDown,
	ChevronUp,
	SlidersHorizontal,
	Sparkles,
	ShoppingCart,
} from "lucide-react";
import ShopNavbar from "@/components/ShopNavbar";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function CategoryPage() {
	const { data: session } = useSession();
	const params = useParams();
	const locale = params.locale;
	const category = params.category;

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
				toast.success(locale === "zh-CN" ? "已加入购物车" : "已加入購物車");
			} else {
				toast.error(data.error || (locale === "zh-CN" ? "加入购物车失败" : "加入購物車失敗"));
			}
		} catch (error) {
			console.error("Failed to add to cart:", error);
			toast.error(locale === "zh-CN" ? "加入购物车失败" : "加入購物車失敗");
		}
	};

	// Set category filter when URL changes or from sessionStorage
	useEffect(() => {
		if (category === 'all' && typeof window !== 'undefined') {
			// Check if there's a stored category selection
			const storedCategory = sessionStorage.getItem('selectedCategory');
			if (storedCategory) {
				setSelectedProductType(storedCategory);
				// Clear it after using
				sessionStorage.removeItem('selectedCategory');
			}
		} else if (category && category !== 'all') {
			setSelectedProductType(category);
		}
	}, [category]);

	// Apply filters whenever filter state changes
	useEffect(() => {
		applyFilters();
	}, [allProducts, selectedProductType, selectedElement, minPrice, maxPrice, sortBy]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/shop/products?limit=100`);
			const data = await res.json();
			
			console.log('API Response:', data);
			
			if (data.success) {
				let products = data.data.products;
				console.log('Total products from API:', products.length);
				
				// Filter by category if specified
				if (category && category !== 'all') {
					const urlCategory = category.toLowerCase();
					
					// Category name keywords in different languages
					const categoryKeywords = {
						'earring': ['耳環', '耳饰', '耳飾', 'earring'],
						'bracelet': ['手串', '手链', '手鍊', 'bracelet', 'charm'],
						'ring': ['戒指', 'ring'],
						'necklace': ['项链', '項鏈', 'necklace'],
						'pendant': ['吊坠', '吊墜', 'pendant'],
						'feng-shui': ['风水', '風水', '摆件', '擺件', 'feng-shui', 'decoration']
					};
					
					const keywords = categoryKeywords[urlCategory] || [urlCategory];
					
					products = products.filter(product => {
						const productCategory = product.category?.toLowerCase() || '';
						const productNameZhCN = product.name?.['zh-CN']?.toLowerCase() || '';
						const productNameZhTW = product.name?.['zh-TW']?.toLowerCase() || '';
						const productName = typeof product.name === 'string' ? product.name.toLowerCase() : '';
						
						// Check if category field matches
						const categoryMatches = keywords.some(keyword => 
							productCategory.includes(keyword.toLowerCase())
						);
						
						// Check if product name contains the keyword
						const nameMatches = keywords.some(keyword => 
							productNameZhCN.includes(keyword) || 
							productNameZhTW.includes(keyword) ||
							productName.includes(keyword.toLowerCase())
						);
						
						return categoryMatches || nameMatches;
					});
					
					console.log('Products after category filter:', products.length, 'for category:', category);
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
		if (allProducts.length === 0) {
			setFilteredProducts([]);
			return;
		}
		
		let filtered = [...allProducts];
		
		// Filter by product type (sub-category)
		if (selectedProductType) {
			filtered = filtered.filter(p => p.category === selectedProductType);
		}
		
		// Filter by element type
		if (selectedElement) {
			filtered = filtered.filter(p => p.elementType === selectedElement);
		}
		
		// Filter by price range
		filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
		
		// Apply sorting
		if (sortBy === "price-low-high") {
			filtered.sort((a, b) => a.price - b.price);
		} else if (sortBy === "price-high-low") {
			filtered.sort((a, b) => b.price - a.price);
		} else if (sortBy === "newest") {
			filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		} else if (sortBy === "most-popular") {
			filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
		}
		
		setFilteredProducts(filtered);
		console.log('Filtered products:', filtered.length, 'from', allProducts.length);
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

	const categoryName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);

	// Count active filters
	const activeFilterCount = [
		selectedProductType !== null,
		selectedElement !== null,
		minPrice > 0 || maxPrice < 1000
	].filter(Boolean).length;

	const clearAllFilters = () => {
		setSelectedProductType(null);
		setSelectedElement(null);
		setMinPrice(0);
		setMaxPrice(1000);
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
				<span className="ml-1 text-xs text-gray-500">{numRating.toFixed(1)}</span>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-white">
			<ShopNavbar cartCount={cartCount} />

			<div className="container px-4 mx-auto py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
					<Link href={`/${locale}`} className="hover:text-[#8B9F3A]">
						Home
					</Link>
					<ChevronRight className="w-4 h-4" />
					<span className="text-gray-900">{categoryName}</span>
				</div>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left Sidebar */}
					<aside className="w-full lg:w-64 flex-shrink-0">
						<div className="space-y-6">
							{/* Filter Header with Clear Button */}
							{activeFilterCount > 0 && (
								<div className="flex items-center justify-between pb-4 border-b border-gray-200">
									<span className="text-sm text-gray-600">
										{activeFilterCount} {locale === "zh-CN" ? "个筛选器" : "個篩選器"}
									</span>
									<button
										onClick={clearAllFilters}
										className="text-sm text-[#8B9F3A] hover:text-[#6B7D2A] font-medium"
									>
										{locale === "zh-CN" ? "清除全部" : "清除全部"}
									</button>
								</div>
							)}

							{/* Product Type Section */}
							<div className="border-b border-gray-200 pb-4">
								<button
									onClick={() => toggleSection("productType")}
									className="flex items-center justify-between w-full mb-4"
								>
									<h3 className="font-bold text-lg">
										{locale === "zh-CN" ? "产品类型" : "產品類型"}
									</h3>
									<SlidersHorizontal className="w-5 h-5 text-gray-400" />
								</button>
								{expandedSections.productType && (
									<div className="space-y-3">
										<button
											onClick={() => setSelectedProductType(null)}
											className={`flex items-center justify-between w-full transition-colors ${
												selectedProductType === null 
													? "text-[#8B9F3A] font-semibold" 
													: "text-gray-700 hover:text-[#8B9F3A]"
											}`}
										>
											<span>{locale === "zh-CN" ? "全部" : "全部"}</span>
											<ChevronRight className="w-4 h-4" />
										</button>
										{productTypes.map((item) => (
											<button
												key={item.id}
												onClick={() => setSelectedProductType(item.id)}
												className={`flex items-center justify-between w-full transition-colors ${
													selectedProductType === item.id 
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
												right: `${100 - (maxPrice / 1000) * 100}%`
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
												const value = Number(e.target.value);
												if (value < maxPrice - 10) {
													setMinPrice(value);
												}
											}}
											className="absolute w-full h-5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-[#8B9F3A] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-3 [&::-moz-range-thumb]:border-[#8B9F3A] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:hover:scale-110"
											style={{ zIndex: minPrice > maxPrice - 100 ? 5 : 3 }}
										/>
										
										{/* Max Slider */}
										<input
											type="range"
											min="0"
											max="1000"
											step="10"
											value={maxPrice}
											onChange={(e) => {
												const value = Number(e.target.value);
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
										{locale === "zh-CN" ? "五行元素" : "五行元素"}
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
											onClick={() => setSelectedElement(null)}
											className={`flex items-center justify-between w-full transition-colors ${
												selectedElement === null 
													? "text-[#8B9F3A] font-semibold" 
													: "text-gray-700 hover:text-[#8B9F3A]"
											}`}
										>
											<span>{locale === "zh-CN" ? "全部" : "全部"}</span>
											<ChevronRight className="w-4 h-4" />
										</button>
										{elementTypes.map((item) => (
											<button
												key={item.id}
												onClick={() => setSelectedElement(item.id)}
												className={`flex items-center justify-between w-full transition-colors ${
													selectedElement === item.id 
														? "text-[#8B9F3A] font-semibold" 
														: "text-gray-700 hover:text-[#8B9F3A]"
												}`}
											>
												<span>{item.icon} {item.label}</span>
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
										{locale === "zh-CN" ? "精选推荐" : "精選推薦"}
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
												label: locale === "zh-CN" ? "精选产品" : "精選產品",
											},
											{
												key: "star",
												label: locale === "zh-CN" ? "天干系列" : "天干系列",
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
					<main className="flex-1">
						{/* Header */}
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
							<div>
								<h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
								<p className="text-gray-500 text-sm">
									{loading
										? locale === "zh-CN" ? "加载中..." : "載入中..."
										: `${locale === "zh-CN" ? "显示" : "顯示"} ${filteredProducts.length} ${locale === "zh-CN" ? "个产品" : "個產品"}`
									}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-gray-600">
									{locale === "zh-CN" ? "排序：" : "Sort by:"}
								</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9F3A]"
								>
									<option value="most-popular">
										{locale === "zh-CN" ? "最受欢迎" : "Most Popular"}
									</option>
									<option value="price-low-high">
										{locale === "zh-CN" ? "价格：低至高" : "Price: Low to High"}
									</option>
									<option value="price-high-low">
										{locale === "zh-CN" ? "价格：高至低" : "Price: High to Low"}
									</option>
									<option value="newest">
										{locale === "zh-CN" ? "最新上架" : "Newest"}
									</option>
								</select>
							</div>
						</div>

						{/* Product Grid */}
						{loading ? (
							<div className="flex items-center justify-center py-20">
								<div className="text-center">
									<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6B8E23] mx-auto mb-4"></div>
									<p className="text-lg text-gray-600">
										{locale === "zh-CN" ? "加载中..." : "載入中..."}
									</p>
								</div>
							</div>
						) : filteredProducts.length === 0 ? (
							<div className="text-center py-20">
								<Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500 text-lg">
									{locale === "zh-CN" ? "暂无商品" : "暫無商品"}
								</p>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
									{filteredProducts.map((product) => {
										// Handle product name - extract string from object or use directly
										let productName = '';
										if (typeof product.name === 'object' && product.name !== null) {
											productName = product.name[locale] || product.name['zh-TW'] || product.name['zh-CN'] || product.name['en'] || '';
										} else {
											productName = String(product.name || '');
										}
										
										const hasDiscount = product.discount && product.discount.percentage > 0 && (!product.discount.validUntil || new Date(product.discount.validUntil) > new Date());
										const discountedPrice = hasDiscount ? product.price * (1 - product.discount.percentage / 100) : product.price;
										const rating = product.rating?.average || 4.0;
										const ratingCount = product.rating?.count || 0;
										const soldCount = product.soldCount || product.sold || 0;
										
										return (
											<Link
												key={product.id || product._id}
												href={`/${locale}/shop/product/${product._id || product.id}`}
												className="group"
											>
												<div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
													{/* Product Image with Badges */}
													<div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
													{product.images && product.images.length > 0 ? (
														<Image
															src={product.images[0]}
															alt={productName}
															fill
															className="object-cover group-hover:scale-105 transition-transform duration-700"
															sizes="(max-width: 768px) 100vw, 33vw"
														/>
													) : (
														<div className="flex items-center justify-center h-full">
															<Sparkles className="w-20 h-20 text-gray-300" />
														</div>
													)}
													
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
														{productName}
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
														<Button 
															size="sm" 
															className="bg-[#6B8E23] hover:bg-[#5a7a1d] text-white rounded-full px-4"
															onClick={(e) => {
																e.preventDefault();
															handleAddToCart(product);
															}}
														>
															<ShoppingCart className="w-4 h-4" />
														</Button>
													</div>
												</div>
											</div>
										</Link>
										);
									})}
								</div>

								{/* Pagination */}
								<div className="flex items-center justify-between border-t border-gray-200 pt-6">
									<button className="flex items-center gap-2 text-gray-600 hover:text-[#8B9F3A] transition-colors">
										<ChevronRight className="w-4 h-4 rotate-180" />
										{locale === "zh-CN" ? "上一页" : "Previous"}
									</button>
									<div className="flex items-center gap-2">
										{[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
											<button
												key={index}
												onClick={() => typeof page === "number" && setCurrentPage(page)}
												disabled={page === "..."}
												className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
													page === currentPage
														? "bg-[#8B9F3A] text-white"
														: page === "..."
															? "text-gray-400 cursor-default"
															: "text-gray-600 hover:bg-gray-100"
												}`}
											>
												{page}
											</button>
										))}
									</div>
									<button className="flex items-center gap-2 text-gray-600 hover:text-[#8B9F3A] transition-colors">
										{locale === "zh-CN" ? "下一页" : "Next"}
										<ChevronRight className="w-4 h-4" />
									</button>
								</div>
							</>
						)}
					</main>
				</div>
			</div>

			{/* Newsletter Section */}
			<div className="relative z-10 -mb-16">
				<div className="container px-4 mx-auto">
					<div className="bg-[#8B9F3A] rounded-3xl overflow-hidden max-w-5xl mx-auto">
						<div className="flex flex-col md:flex-row items-center justify-between p-12 gap-8">
							<div className="text-white text-center md:text-left">
								<h2 className="text-3xl md:text-4xl font-bold mb-4">
									{locale === "zh-CN" ? "随时了解" : "隨時瞭解"}
									<br />
									{locale === "zh-CN" ? "我们的最新优惠" : "我們的最新優惠"}
								</h2>
							</div>
							<div className="flex flex-col gap-4 w-full md:w-auto">
								<input
									type="email"
									placeholder={
										locale === "zh-CN" ? "输入您的邮箱地址" : "輸入您的郵箱地址"
									}
									className="px-6 py-4 rounded-full w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-white"
								/>
								<Button className="bg-white hover:bg-gray-100 text-[#2C2C2C] rounded-full px-8 py-4 font-bold">
									{locale === "zh-CN" ? "订阅我们" : "訂閱我們"}
								</Button>
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
									<a
										href={`/${locale}/about`}
										className="hover:text-[#8B9F3A] transition-colors"
									>
										{locale === "zh-CN" ? "关于我们" : "關於我們"}
									</a>
									<a
										href={`/${locale}/privacy`}
										className="hover:text-[#8B9F3A] transition-colors"
									>
										{locale === "zh-CN" ? "隐私政策" : "隱私政策"}
									</a>
									<a
										href={`/${locale}/terms`}
										className="hover:text-[#8B9F3A] transition-colors"
									>
										{locale === "zh-CN" ? "用户条款" : "用戶條款"}
									</a>
								</div>
								<div className="flex gap-4 mt-6">
									<a
										href="https://facebook.com"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:opacity-80 transition-opacity"
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
										className="hover:opacity-80 transition-opacity"
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
								{locale === "zh-CN" ? "联系我们：" : "聯絡我們："}
							</div>
							<div className="space-y-3 mb-6">
								<p className="text-white">
									{locale === "zh-CN" ? "电邮" : "電郵"}: info@gmail.com
								</p>
								<p className="text-white">
									{locale === "zh-CN" ? "电话" : "電話"}: +852 0000 0000
								</p>
							</div>
							<div className="flex gap-3">
								<input
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
								{/* Payment logos */}
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<path
											d="M20.5 10.5L17.5 21.5H14.5L12.5 13C12.4 12.6 12.2 12.3 11.9 12.2C11.3 11.9 10.4 11.6 9.5 11.4L9.6 11H14.5C15.1 11 15.6 11.4 15.7 12L16.7 17.5L19.2 11H22.2L20.5 10.5ZM30.5 17.8C30.5 15.2 26.8 15 26.8 13.8C26.8 13.4 27.2 13 28.1 12.9C28.5 12.8 29.6 12.7 30.9 13.3L31.4 11.4C30.8 11.2 30 11 29 11C26.2 11 24.2 12.6 24.2 14.8C24.2 16.5 25.7 17.4 26.8 18C28 18.6 28.4 19 28.4 19.5C28.4 20.3 27.5 20.7 26.7 20.7C25.5 20.7 24.9 20.5 23.9 20L23.4 22C24.4 22.4 25.3 22.5 26.7 22.5C29.7 22.5 31.6 20.9 31.6 18.6L30.5 17.8ZM38.5 21.5H41L38.8 11H36.4C35.9 11 35.5 11.3 35.3 11.7L31.5 21.5H34.5L35.1 20H38.8L38.5 21.5ZM36.2 13.5L37.5 17.5H35.5L36.2 13.5ZM26.5 11L24.5 21.5H21.8L23.8 11H26.5Z"
											fill="#1434CB"
										/>
									</svg>
								</div>
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<circle cx="18" cy="16" r="10" fill="#EB001B" />
										<circle cx="30" cy="16" r="10" fill="#F79E1B" fillOpacity="0.8" />
									</svg>
								</div>
								<div className="bg-white rounded px-3 py-2 flex items-center justify-center min-w-[60px] h-[40px]">
									<svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
										<path
											d="M20.5 9H15.5L12.5 23H16L18 13C18.2 11.9 19.1 11 20.2 11H23C25.2 11 26.5 12.3 26.5 14.5C26.5 16.7 24.8 18.5 22.5 18.5H21L20 23H22.5C27.2 23 31 19.2 31 14.5C31 9.8 27.2 9 24.5 9H20.5Z"
											fill="#003087"
										/>
										<path d="M17 16H14L12 23H15L17 16Z" fill="#009CDE" />
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
