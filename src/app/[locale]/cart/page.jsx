"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
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
	Facebook,
	Instagram,
	Mail,
} from "lucide-react";
import { toast } from "sonner";

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
				const totalQuantity = data.data?.items?.reduce(
					(total, item) => total + item.quantity,
					0
				) || 0;
				setCartCount(totalQuantity);
			}
		} catch (error) {
			console.error("Failed to fetch cart:", error);
			toast.error(
				locale === "zh-CN" ? "加载购物车失败" : "載入購物車失敗"
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
				const totalQuantity = data.data?.items?.reduce(
					(total, item) => total + item.quantity,
					0
				) || 0;
				setCartCount(totalQuantity);
				setCart(data.data);
				toast.success(
					locale === "zh-CN" ? "已更新数量" : "已更新數量"
				);
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(
				locale === "zh-CN" ? "更新失败" : "更新失敗"
			);
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
				const totalQuantity = data.data?.items?.reduce(
					(total, item) => total + item.quantity,
					0
				) || 0;
				setCartCount(totalQuantity);
				setCart(data.data);
				toast.success(
					locale === "zh-CN" ? "已移除商品" : "已移除商品"
				);
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(
				locale === "zh-CN" ? "移除失败" : "移除失敗"
			);
		} finally {
			setUpdating(false);
		}
	};

	const calculateSubtotal = () => {
		if (!cart?.items) return 0;
		return cart.items.reduce((total, item) => {
			const price = item.product.price;
			const discount = item.product.discount?.percentage || 0;
			const finalPrice = price * (1 - discount / 100);
			return total + finalPrice * item.quantity;
		}, 0);
	};

	const calculateDiscount = () => {
		return calculateSubtotal() * (discountPercentage / 100);
	};

	const calculateTotal = () => {
		return calculateSubtotal() - calculateDiscount();
	};

	const handleApplyPromo = () => {
		if (!promoCode.trim()) {
			toast.error(locale === "zh-CN" ? "请输入促销代码" : "請輸入促銷代碼");
			return;
		}

		// Example promo codes (you can replace with API call)
		const validCodes = {
			"SAVE25": 25,
			"WELCOME20": 20,
			"NEW15": 15
		};

		const discount = validCodes[promoCode.toUpperCase()];
		if (discount) {
			setDiscountPercentage(discount);
			toast.success(
				locale === "zh-CN" 
					? `促销代码已应用！享受 ${discount}% 折扣` 
					: `促銷代碼已應用！享受 ${discount}% 折扣`
			);
		} else {
			toast.error(locale === "zh-CN" ? "无效的促销代码" : "無效的促銷代碼");
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
				<div className="container mx-auto px-4 py-24 text-center">
					<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#6B8E23]" />
					<h2 className="text-2xl font-bold mb-2">
						{locale === "zh-CN" ? "请先登录" : "請先登入"}
					</h2>
					<p className="text-gray-600 mb-6">
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

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm mb-6">
					<Link href={`/${locale}`} className="text-gray-600 hover:text-[#6B8E23]">
						{locale === "zh-CN" ? "首页" : "首頁"}
					</Link>
					<ChevronRight className="w-4 h-4 text-gray-400" />
					<Link href={`/${locale}/shop`} className="text-gray-600 hover:text-[#6B8E23]">
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
					<div className="bg-gray-50 rounded-lg p-12 text-center">
						<ShoppingBag className="w-20 h-20 mx-auto mb-4 text-gray-400" />
						<h2 className="text-xl font-semibold mb-2">
							{locale === "zh-CN"
								? "购物车是空的"
								: "購物車是空的"}
						</h2>
						<p className="text-gray-600 mb-6">
							{locale === "zh-CN"
								? "快去添加一些幸运物品吧！"
								: "快去添加一些幸運物品吧！"}
						</p>
						<Button
							onClick={() => router.push(`/${locale}/shop`)}
							className="bg-[#6B8E23] hover:bg-[#8B9F3A] text-white"
						>
							{locale === "zh-CN" ? "开始购物" : "開始購物"}
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Cart Items */}
						<div className="lg:col-span-2 space-y-3">
							{cart.items.map((item) => {
								const product = item.product;
								const hasDiscount = product.discount?.percentage > 0;
								const discount = product.discount?.percentage || 0;
								const finalPrice = product.price * (1 - discount / 100);

								return (
									<div
										key={item._id}
										className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
									>
										{/* Product Image */}
										<div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
											{product.images?.length > 0 ? (
												<Image
													src={product.images[0]}
													alt={
														product.name[locale] ||
														product.name.zh_TW
													}
													fill
													className="object-cover"
												/>
											) : (
												<div className="flex items-center justify-center h-full">
													<Sparkles className="w-8 h-8 text-gray-400" />
												</div>
											)}
											{product.stock <= 5 && product.stock > 0 && (
												<div className="absolute top-1 right-1">
													<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
														{locale === "zh-CN" ? "库存紧张" : "庫存緊張"}
													</span>
												</div>
											)}
										</div>

										{/* Product Info */}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-base mb-1">
												{product.name[locale] || product.name.zh_TW}
											</h3>
											<p className="text-sm text-gray-500 mb-3">
												{product.description[locale]?.substring(0, 30) || 
												 product.description.zh_TW?.substring(0, 30)}
												{(product.description[locale]?.length > 30 || 
												  product.description.zh_TW?.length > 30) && "..."}
											</p>

											<div className="flex items-center justify-between">
												{/* Quantity Controls */}
												<div className="flex items-center gap-2 border border-gray-300 rounded-md">
													<button
														onClick={() =>
															updateQuantity(
																product._id,
																item.quantity - 1
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
																item.quantity + 1
															)
														}
														disabled={
															updating ||
															(!product.isDigital &&
																item.quantity >= product.stock)
														}
														className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														<Plus className="w-4 h-4" />
													</button>
												</div>

												{/* Price */}
												<div className="text-right">
												{hasDiscount && (
													<div className="text-xs text-gray-400 line-through mb-1">
														HK${(product.price * item.quantity).toFixed(0)}
													</div>
												)}
												<div className="text-lg font-bold text-[#2C2C2C]">
													HK${(finalPrice * item.quantity).toFixed(0)}
													</div>
												</div>
											</div>
										</div>

										{/* Remove Button */}
										<button
											onClick={() => removeItem(product._id)}
											disabled={updating}
											className="text-red-500 hover:bg-red-50 p-2 rounded disabled:opacity-50"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								);
							})}
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-gray-50 rounded-lg p-6 border border-gray-200 sticky top-24">
							<h2 className="text-xl font-bold mb-6 text-[#2C2C2C]">
								{locale === "zh-CN" ? "订单摘要" : "訂單摘要"}
							</h2>

							<div className="space-y-3 mb-6">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									{locale === "zh-CN" ? "小计" : "小計"}
								</span>
								<span className="font-medium text-[#2C2C2C]">
									HK${calculateSubtotal().toFixed(0)}
								</span>
							</div>
							{discountPercentage > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">
										{locale === "zh-CN" ? `折扣 (-${discountPercentage}%)` : `折扣 (-${discountPercentage}%)`}
									</span>
									<span className="font-medium text-red-500">
										-HK${calculateDiscount().toFixed(0)}
									</span>
								</div>
							)}
							<div className="border-t border-gray-300 pt-3">
								<div className="flex justify-between text-lg font-bold">
									<span className="text-[#2C2C2C]">
										{locale === "zh-CN" ? "总计" : "總計"}
								</span>
								<span className="text-[#2C2C2C]">
									HK${calculateTotal().toFixed(0)}
								</span>
							</div>
						</div>
					</div>

					{/* Promo Code Input */}
					<div className="mb-4">
						<div className="flex gap-2">
							<Input
								placeholder={locale === "zh-CN" ? "输入宣传码" : "輸入宣傳碼"}
								value={promoCode}
								onChange={(e) => setPromoCode(e.target.value)}
								className="flex-1 border-gray-300 focus:border-[#6B8E23] focus:ring-[#6B8E23]"
							/>
							<Button
								onClick={handleApplyPromo}
								className="bg-white border border-gray-300 text-[#2C2C2C] hover:bg-gray-50"
							>
								{locale === "zh-CN" ? "提交" : "提交"}
							</Button>
						</div>
					</div>

				<Button
					className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6 text-base font-medium flex items-center justify-center gap-2"
					onClick={() => router.push(`/${locale}/checkout`)}
				>
					{locale === "zh-CN" ? "前往付款" : "前往付款"}
					<ArrowRight className="w-5 h-5" />
				</Button>
			</div>
		</div>
	</div>
	)}
</div>

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
										className="bg-white rounded-full px-6 py-4 text-gray-800"
									/>
									<Button
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
