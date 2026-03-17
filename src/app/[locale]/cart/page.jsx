"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import FooterV2 from "@/components/home/FooterV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import {
	ShoppingBag,
	Trash2,
	Plus,
	Minus,
	ChevronRight,
	Sparkles,
	ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRegionDetection } from "@/hooks/useRegionDetectionEnhanced";
import { getProductDisplayPrice } from "@/lib/productPrice";
import { getProductName, getProductDescription } from "@/lib/productLocale";

const GIFT_REPORT_LABELS = {
	wealth: "財運",
	love: "感情",
	career: "事業",
	health: "健康",
};

export default function CartPage() {
	const { data: session } = useSession();
	const locale = useLocale();
	const router = useRouter();
	const [cart, setCart] = useState(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [cartCount, setCartCount] = useState(0);
	const [promoCode, setPromoCode] = useState("");
	const [discountPercentage, setDiscountPercentage] = useState(0);
	const { region } = useRegionDetection();

	useEffect(() => {
		if (session?.user) {
			fetchCart();
		} else {
			setLoading(false);
		}
	}, [session]);

	const fetchCart = async () => {
		try {
			const res = await fetch("/api/shop/cart");
			const data = await res.json();
			if (data.success) {
				setCart(data.data);
				const totalQuantity =
					data.data?.items?.reduce(
						(total, item) => total + item.quantity,
						0,
					) || 0;
				setCartCount(totalQuantity);
			}
		} catch (error) {
			console.error("Failed to fetch cart:", error);
			toast.error(
				locale === "zh-CN" ? "加载购物车失败" : "載入購物車失敗",
			);
		} finally {
			setLoading(false);
		}
	};

	const updateQuantity = async (productId, newQuantity) => {
		if (newQuantity < 1) return;

		setUpdating(true);
		try {
			const res = await fetch("/api/shop/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId,
					quantity: newQuantity,
					setAbsolute: true, // Set quantity to exact value, not add
				}),
			});

			const data = await res.json();
			if (data.success) {
				const totalQuantity =
					data.data?.items?.reduce(
						(total, item) => total + item.quantity,
						0,
					) || 0;
				setCartCount(totalQuantity);
				setCart(data.data);
				toast.success(locale === "zh-CN" ? "已更新数量" : "已更新數量");
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(locale === "zh-CN" ? "更新失败" : "更新失敗");
		} finally {
			setUpdating(false);
		}
	};

	const removeItem = async (productId) => {
		setUpdating(true);
		try {
			const res = await fetch("/api/shop/cart", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productId }),
			});

			const data = await res.json();
			if (data.success) {
				const totalQuantity =
					data.data?.items?.reduce(
						(total, item) => total + item.quantity,
						0,
					) || 0;
				setCartCount(totalQuantity);
				setCart(data.data);
				toast.success(locale === "zh-CN" ? "已移除商品" : "已移除商品");
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(locale === "zh-CN" ? "移除失败" : "移除失敗");
		} finally {
			setUpdating(false);
		}
	};

	const calculateSubtotal = () => {
		if (!cart?.items) return 0;
		return cart.items.reduce((total, item) => {
			const { discountedPrice } = getProductDisplayPrice(
				item.product,
				region,
			);
			let finalPrice =
				discountedPrice ??
				item.product.price *
					(1 - (item.product.discount?.percentage || 0) / 100);

			// Extra fee for printed report items
			if (item.giftReportType === "report-print") {
				const extraPerUnit =
					region === "taiwan"
						? 100
						: region === "china"
						  ? 20
						  : 20;
				finalPrice += extraPerUnit;
			}

			return total + finalPrice * item.quantity;
		}, 0);
	};

	const cartSummarySymbol = cart?.items?.length
		? getProductDisplayPrice(cart.items[0].product, region).symbol
		: "HK$";

	const calculateDiscount = () => {
		return calculateSubtotal() * (discountPercentage / 100);
	};

	const calculateTotal = () => {
		return calculateSubtotal() - calculateDiscount();
	};

	const handleApplyPromo = () => {
		if (!promoCode.trim()) {
			toast.error(
				locale === "zh-CN" ? "请输入促销代码" : "請輸入促銷代碼",
			);
			return;
		}

		// Example promo codes (you can replace with API call)
		const validCodes = {
			SAVE25: 25,
			WELCOME20: 20,
			NEW15: 15,
		};

		const discount = validCodes[promoCode.toUpperCase()];
		if (discount) {
			setDiscountPercentage(discount);
			toast.success(
				locale === "zh-CN"
					? `促销代码已应用！享受 ${discount}% 折扣`
					: `促銷代碼已應用！享受 ${discount}% 折扣`,
			);
		} else {
			toast.error(
				locale === "zh-CN" ? "无效的促销代码" : "無效的促銷代碼",
			);
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

	if (!session?.user) {
		return (
			<div className="min-h-screen bg-white">
				<ShopNavbar cartCount={cartCount} onSearch={() => {}} />
				<div className="container px-4 py-24 mx-auto text-center">
					<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#6B8E23]" />
					<h2 className="mb-2 text-2xl font-bold">
						{locale === "zh-CN" ? "请先登录" : "請先登入"}
					</h2>
					<p className="mb-6 text-gray-600">
						{locale === "zh-CN"
							? "登录后即可查看购物车"
							: "登入後即可查看購物車"}
					</p>
					<Button
						onClick={() => router.push(`/${locale}/auth/signin`)}
						className="bg-[#6B8E23] hover:bg-[#8B9F3A] text-white"
					>
						{locale === "zh-CN" ? "去登录" : "前往登入"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<ShopNavbar cartCount={cartCount} onSearch={() => {}} />

			<div className="px-4 py-8 mx-auto max-w-7xl">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 mb-6 text-sm">
					<Link
						href={`/${locale}`}
						className="text-gray-600 hover:text-[#6B8E23]"
					>
						{locale === "zh-CN" ? "首页" : "首頁"}
					</Link>
					<ChevronRight className="w-4 h-4 text-gray-400" />
					<Link
						href={`/${locale}/shop/all`}
						className="text-gray-600 hover:text-[#6B8E23]"
					>
						{locale === "zh-CN" ? "商店" : "商店"}
					</Link>
					<ChevronRight className="w-4 h-4 text-gray-400" />
					<span className="text-gray-900">
						{locale === "zh-CN" ? "购物车" : "購物車"}
					</span>
				</div>

				{/* Header */}
				<h1 className="text-3xl font-bold text-[#2C2C2C] mb-8">
					{locale === "zh-CN" ? "购物车" : "購物車"}
				</h1>

				{!cart?.items || cart.items.length === 0 ? (
					<div className="p-12 text-center rounded-lg bg-gray-50">
						<ShoppingBag className="w-20 h-20 mx-auto mb-4 text-gray-400" />
						<h2 className="mb-2 text-xl font-semibold">
							{locale === "zh-CN"
								? "购物车是空的"
								: "購物車是空的"}
						</h2>
						<p className="mb-6 text-gray-600">
							{locale === "zh-CN"
								? "快去添加一些幸运物品吧！"
								: "快去添加一些幸運物品吧！"}
						</p>
						<Button
							onClick={() => router.push(`/${locale}/shop/all`)}
							className="bg-[#6B8E23] hover:bg-[#8B9F3A] text-white"
						>
							{locale === "zh-CN" ? "开始购物" : "開始購物"}
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Cart Items */}
						<div className="space-y-3 lg:col-span-2">
							{cart.items.map((item) => {
								const product = item.product;
								const { price, discountedPrice, symbol } =
									getProductDisplayPrice(product, region);
								const hasDiscount =
									product.discount?.percentage > 0;
								let finalPrice = discountedPrice ?? price;

								// Extra fee for printed report items
								if (item.giftReportType === "report-print") {
									const extraPerUnit =
										region === "taiwan"
											? 100
											: region === "china"
											  ? 20
											  : 20;
									finalPrice += extraPerUnit;
								}

								return (
									<div
										key={item._id}
										className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg"
									>
										{/* Product Image */}
										<div className="relative flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-100 rounded-lg">
											{product.images?.length > 0 ? (
												<Image
													src={product.images[0]}
													alt={getProductName(product, locale)}
													fill
													className="object-cover"
												/>
											) : (
												<div className="flex items-center justify-center h-full">
													<Sparkles className="w-8 h-8 text-gray-400" />
												</div>
											)}
											{product.stock <= 5 &&
												product.stock > 0 && (
													<div className="absolute top-1 right-1">
														<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
															{locale === "zh-CN"
																? "库存紧张"
																: "庫存緊張"}
														</span>
													</div>
												)}
										</div>

										{/* Product Info */}
										<div className="flex-1 min-w-0">
											<h3 className="mb-1 text-base font-semibold">
												{getProductName(product, locale)}
											</h3>
											{item.giftReportType && (
												<p className="mb-1 text-sm text-[#6B8E23]">
													{locale === "zh-CN"
														? "贈送報告"
														: "贈送報告"}
													:{" "}
													{GIFT_REPORT_LABELS[
														item.giftReportType
													] || item.giftReportType}
												</p>
											)}
											<p className="mb-3 text-sm text-gray-500">
												{getProductDescription(product, locale)?.substring(0, 30)}
												{getProductDescription(product, locale)?.length > 30 &&
													"..."}
											</p>

											<div className="flex items-center justify-between">
												{/* Quantity Controls */}
												<div className="flex items-center gap-2 border border-gray-300 rounded-md">
													<button
														onClick={() =>
															updateQuantity(
																product._id,
																item.quantity -
																	1,
															)
														}
														disabled={
															updating ||
															item.quantity <= 1
														}
														className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														<Minus className="w-4 h-4" />
													</button>
													<span className="px-4 font-medium">
														{item.quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(
																product._id,
																item.quantity +
																	1,
															)
														}
														disabled={
															updating ||
															(!product.isDigital &&
																item.quantity >=
																	product.stock)
														}
														className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														<Plus className="w-4 h-4" />
													</button>
												</div>

												{/* Price */}
												<div className="text-right">
													{hasDiscount && (
														<div className="mb-1 text-xs text-gray-400 line-through">
															{symbol}
															{(
																price *
																item.quantity
															).toFixed(0)}
														</div>
													)}
													<div className="text-lg font-bold text-[#2C2C2C]">
														{symbol}
														{(
															finalPrice *
															item.quantity
														).toFixed(0)}
													</div>
												</div>
											</div>
										</div>

										{/* Remove Button */}
										<button
											onClick={() =>
												removeItem(product._id)
											}
											disabled={updating}
											className="p-2 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								);
							})}
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="sticky p-6 border border-gray-200 rounded-lg bg-gray-50 top-24">
								<h2 className="text-xl font-bold mb-6 text-[#2C2C2C]">
									{locale === "zh-CN"
										? "订单摘要"
										: "訂單摘要"}
								</h2>

								<div className="mb-6 space-y-3">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											{locale === "zh-CN"
												? "小计"
												: "小計"}
										</span>
										<span className="font-medium text-[#2C2C2C]">
											{cartSummarySymbol}
											{calculateSubtotal().toFixed(0)}
										</span>
									</div>
									{discountPercentage > 0 && (
										<div className="flex justify-between text-sm">
											<span className="text-gray-600">
												{locale === "zh-CN"
													? `折扣 (-${discountPercentage}%)`
													: `折扣 (-${discountPercentage}%)`}
											</span>
											<span className="font-medium text-red-500">
												-{cartSummarySymbol}
												{calculateDiscount().toFixed(0)}
											</span>
										</div>
									)}
									<div className="pt-3 border-t border-gray-300">
										<div className="flex justify-between text-lg font-bold">
											<span className="text-[#2C2C2C]">
												{locale === "zh-CN"
													? "总计"
													: "總計"}
											</span>
											<span className="text-[#2C2C2C]">
												{cartSummarySymbol}
												{calculateTotal().toFixed(0)}
											</span>
										</div>
									</div>
								</div>

								{/* Promo Code Input */}
								<div className="mb-4">
									<div className="flex gap-2">
										<Input
											placeholder={
												locale === "zh-CN"
													? "输入宣传码"
													: "輸入宣傳碼"
											}
											value={promoCode}
											onChange={(e) =>
												setPromoCode(e.target.value)
											}
											className="flex-1 border-gray-300 focus:border-[#6B8E23] focus:ring-[#6B8E23]"
										/>
										<Button
											onClick={handleApplyPromo}
											className="bg-white border border-gray-300 text-[#2C2C2C] hover:bg-gray-50"
										>
											{locale === "zh-CN"
												? "提交"
												: "提交"}
										</Button>
									</div>
								</div>

								<Button
									className="flex items-center justify-center w-full gap-2 py-6 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800"
									onClick={() =>
										router.push(`/${locale}/checkout`)
									}
								>
									{locale === "zh-CN"
										? "前往付款"
										: "前往付款"}
									<ArrowRight className="w-5 h-5" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Newsletter Banner - Overlapping Footer */}
			<div className="relative z-10 -mb-10">
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
										className="px-6 py-4 text-gray-800 bg-white rounded-full"
									/>
									<Button
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
		</div>
	);
}
