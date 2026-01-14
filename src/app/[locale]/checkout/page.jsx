"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
	ShoppingBag,
	ArrowLeft,
	Sparkles,
	CreditCard,
	MapPin,
	Phone,
	Mail,
	User,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
	const { data: session } = useSession();
	const locale = useLocale();
	const router = useRouter();
	const [cart, setCart] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Shipping information
	const [shippingInfo, setShippingInfo] = useState({
		fullName: "",
		email: session?.user?.email || "",
		phone: "",
		address: "",
		city: "",
		state: "",
		postalCode: "",
		country: "香港",
		notes: "",
	});

	// Billing same as shipping
	const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
	const [billingInfo, setBillingInfo] = useState({
		fullName: "",
		address: "",
		city: "",
		state: "",
		postalCode: "",
		country: "香港",
	});

	useEffect(() => {
		if (session?.user) {
			fetchCart();
			setShippingInfo((prev) => ({
				...prev,
				email: session.user.email,
			}));
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

	const calculateSubtotal = () => {
		if (!cart?.items) return 0;
		return cart.items.reduce((total, item) => {
			const price = item.product.price;
			const discount = item.product.discount?.percentage || 0;
			const finalPrice = price * (1 - discount / 100);
			return total + finalPrice * item.quantity;
		}, 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate required fields
		if (
			!shippingInfo.fullName ||
			!shippingInfo.phone ||
			!shippingInfo.address ||
			!shippingInfo.city
		) {
			toast.error(
				locale === "zh-CN" ? "请填写所有必填项" : "請填寫所有必填項"
			);
			return;
		}

		setSubmitting(true);

		try {
			const checkoutData = {
				items: cart.items.map((item) => ({
					productId: item.product._id,
					quantity: item.quantity,
					price: item.product.price,
					discount: item.product.discount?.percentage || 0,
				})),
				shippingInfo,
				billingInfo: billingSameAsShipping ? shippingInfo : billingInfo,
				locale,
			};

			const res = await fetch("/api/shop/create-checkout-session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(checkoutData),
			});

			const data = await res.json();

			if (data.success && data.url) {
				// Redirect to Stripe checkout
				window.location.href = data.url;
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			console.error("Checkout error:", error);
			toast.error(
				locale === "zh-CN" ? "结账失败，请重试" : "結帳失敗，請重試"
			);
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<ShopNavbar />
				<div className="flex items-center justify-center h-[80vh] pt-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C312E] mx-auto mb-4"></div>
						<p className="text-gray-600">
							{locale === "zh-CN" ? "加载中..." : "載入中..."}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<ShopNavbar />
				<div className="container mx-auto px-4 py-24 text-center">
					<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#73897F]" />
					<h2 className="text-2xl font-bold mb-2">
						{locale === "zh-CN" ? "请先登录" : "請先登入"}
					</h2>
					<p className="text-gray-600 mb-6">
						{locale === "zh-CN"
							? "登录后即可结账"
							: "登入後即可結帳"}
					</p>
					<Button
						onClick={() => router.push(`/${locale}/auth/signin`)}
						className="bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E]"
					>
						{locale === "zh-CN" ? "去登录" : "前往登入"}
					</Button>
				</div>
			</div>
		);
	}

	if (!cart?.items || cart.items.length === 0) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<ShopNavbar />
				<div className="container mx-auto px-4 py-24 text-center">
					<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#73897F]" />
					<h2 className="text-2xl font-bold mb-2">
						{locale === "zh-CN" ? "购物车是空的" : "購物車是空的"}
					</h2>
					<p className="text-gray-600 mb-6">
						{locale === "zh-CN"
							? "快去添加一些幸运物品吧！"
							: "快去添加一些幸運物品吧！"}
					</p>
					<Button
						onClick={() => router.push(`/${locale}/shop`)}
						className="bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E]"
					>
						{locale === "zh-CN" ? "开始购物" : "開始購物"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#EFEFEF] via-white to-[#EFEFEF]">
			<ShopNavbar />

			<div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
				{/* Header */}
				<div className="mb-10">
					<Button
						variant="ghost"
						onClick={() => router.push(`/${locale}/cart`)}
						className="mb-6 hover:bg-white hover:shadow-md transition-all rounded-full"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						{locale === "zh-CN" ? "返回购物车" : "返回購物車"}
					</Button>
					<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent">
						{locale === "zh-CN" ? "结账" : "結帳"}
					</h1>
					<p className="text-gray-600 mt-2 text-lg">
						{locale === "zh-CN" ? "完成您的订单" : "完成您的訂單"}
					</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Checkout Form */}
						<div className="lg:col-span-2 space-y-6">
							{/* Shipping Information */}
							<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100">
								<div className="flex items-center gap-3 mb-8">
									<div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] flex items-center justify-center">
										<MapPin className="w-5 h-5 text-white" />
									</div>
									<h2 className="text-2xl font-bold text-[#1C312E]">
										{locale === "zh-CN"
											? "配送信息"
											: "配送資訊"}
									</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="md:col-span-2">
										<Label htmlFor="fullName">
											{locale === "zh-CN"
												? "姓名"
												: "姓名"}{" "}
											<span className="text-red-500">
												*
											</span>
										</Label>
										<Input
											id="fullName"
											value={shippingInfo.fullName}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													fullName: e.target.value,
												})
											}
											required
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="email">
											{locale === "zh-CN"
												? "电子邮箱"
												: "電子郵箱"}
										</Label>
										<Input
											id="email"
											type="email"
											value={shippingInfo.email}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													email: e.target.value,
												})
											}
											className="mt-1"
											disabled
										/>
									</div>

									<div>
										<Label htmlFor="phone">
											{locale === "zh-CN"
												? "联系电话"
												: "聯絡電話"}{" "}
											<span className="text-red-500">
												*
											</span>
										</Label>
										<Input
											id="phone"
											type="tel"
											value={shippingInfo.phone}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													phone: e.target.value,
												})
											}
											required
											className="mt-1"
											placeholder="+852 1234 5678"
										/>
									</div>

									<div className="md:col-span-2">
										<Label htmlFor="address">
											{locale === "zh-CN"
												? "详细地址"
												: "詳細地址"}{" "}
											<span className="text-red-500">
												*
											</span>
										</Label>
										<Input
											id="address"
											value={shippingInfo.address}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													address: e.target.value,
												})
											}
											required
											className="mt-1"
											placeholder={
												locale === "zh-CN"
													? "街道地址、门牌号等"
													: "街道地址、門牌號等"
											}
										/>
									</div>

									<div>
										<Label htmlFor="city">
											{locale === "zh-CN"
												? "城市"
												: "城市"}{" "}
											<span className="text-red-500">
												*
											</span>
										</Label>
										<Input
											id="city"
											value={shippingInfo.city}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													city: e.target.value,
												})
											}
											required
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="state">
											{locale === "zh-CN"
												? "区域"
												: "區域"}
										</Label>
										<Input
											id="state"
											value={shippingInfo.state}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													state: e.target.value,
												})
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="postalCode">
											{locale === "zh-CN"
												? "邮政编码"
												: "郵政編碼"}
										</Label>
										<Input
											id="postalCode"
											value={shippingInfo.postalCode}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													postalCode: e.target.value,
												})
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="country">
											{locale === "zh-CN"
												? "国家/地区"
												: "國家/地區"}
										</Label>
										<Input
											id="country"
											value={shippingInfo.country}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													country: e.target.value,
												})
											}
											className="mt-1"
										/>
									</div>

									<div className="md:col-span-2">
										<Label htmlFor="notes">
											{locale === "zh-CN"
												? "订单备注"
												: "訂單備註"}
										</Label>
										<Textarea
											id="notes"
											value={shippingInfo.notes}
											onChange={(e) =>
												setShippingInfo({
													...shippingInfo,
													notes: e.target.value,
												})
											}
											className="mt-1"
											rows={3}
											placeholder={
												locale === "zh-CN"
													? "如有特殊要求，请在此说明"
													: "如有特殊要求，請在此說明"
											}
										/>
									</div>
								</div>
							</div>

							{/* Billing Information */}
							<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100">
								<div className="flex items-center gap-3 mb-8">
									<div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] flex items-center justify-center">
										<CreditCard className="w-5 h-5 text-white" />
									</div>
									<h2 className="text-2xl font-bold text-[#1C312E]">
										{locale === "zh-CN"
											? "账单地址"
											: "帳單地址"}
									</h2>
								</div>

								<div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-[#73897F]/10 to-[#73897F]/5 rounded-xl">
									<Checkbox
										id="billingSame"
										checked={billingSameAsShipping}
										onCheckedChange={
											setBillingSameAsShipping
										}
										className="data-[state=checked]:bg-[#1C312E]"
									/>
									<label
										htmlFor="billingSame"
										className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										{locale === "zh-CN"
											? "账单地址与配送地址相同"
											: "帳單地址與配送地址相同"}
									</label>
								</div>

								{!billingSameAsShipping && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
										<div className="md:col-span-2">
											<Label htmlFor="billingFullName">
												{locale === "zh-CN"
													? "姓名"
													: "姓名"}
											</Label>
											<Input
												id="billingFullName"
												value={billingInfo.fullName}
												onChange={(e) =>
													setBillingInfo({
														...billingInfo,
														fullName:
															e.target.value,
													})
												}
												className="mt-1"
											/>
										</div>

										<div className="md:col-span-2">
											<Label htmlFor="billingAddress">
												{locale === "zh-CN"
													? "详细地址"
													: "詳細地址"}
											</Label>
											<Input
												id="billingAddress"
												value={billingInfo.address}
												onChange={(e) =>
													setBillingInfo({
														...billingInfo,
														address: e.target.value,
													})
												}
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor="billingCity">
												{locale === "zh-CN"
													? "城市"
													: "城市"}
											</Label>
											<Input
												id="billingCity"
												value={billingInfo.city}
												onChange={(e) =>
													setBillingInfo({
														...billingInfo,
														city: e.target.value,
													})
												}
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor="billingState">
												{locale === "zh-CN"
													? "区域"
													: "區域"}
											</Label>
											<Input
												id="billingState"
												value={billingInfo.state}
												onChange={(e) =>
													setBillingInfo({
														...billingInfo,
														state: e.target.value,
													})
												}
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor="billingPostalCode">
												{locale === "zh-CN"
													? "邮政编码"
													: "郵政編碼"}
											</Label>
											<Input
												id="billingPostalCode"
												value={billingInfo.postalCode}
												onChange={(e) =>
													setBillingInfo({
														...billingInfo,
														postalCode:
															e.target.value,
													})
												}
												className="mt-1"
											/>
										</div>

										<div>
											<Label htmlFor="billingCountry">
												{locale === "zh-CN"
													? "国家/地区"
													: "國家/地區"}
											</Label>
											<Input
												id="billingCountry"
												value={billingInfo.country}
												onChange={(e) =>
													setBillingInfo({
														...billingInfo,
														country: e.target.value,
													})
												}
												className="mt-1"
											/>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 sticky top-24">
								<div className="flex items-center gap-3 mb-8">
									<div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] flex items-center justify-center">
										<ShoppingBag className="w-5 h-5 text-white" />
									</div>
									<h2 className="text-2xl font-bold text-[#1C312E]">
										{locale === "zh-CN"
											? "订单摘要"
											: "訂單摘要"}
									</h2>
								</div>

								{/* Cart Items */}
								<div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
									{cart.items.map((item) => {
										const product = item.product;
										const hasDiscount =
											product.discount?.percentage > 0;
										const finalPrice = hasDiscount
											? product.price *
												(1 -
													product.discount
														.percentage /
														100)
											: product.price;

										return (
											<div
												key={item._id}
												className="flex gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
											>
												<div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white shadow-sm">
													{product.images?.length >
													0 ? (
														<Image
															src={
																product
																	.images[0]
															}
															alt={
																product.name[
																	locale
																] ||
																product.name
																	.zh_TW
															}
															fill
															className="object-cover"
														/>
													) : (
														<div className="flex items-center justify-center h-full bg-gradient-to-br from-[#73897F]/10 to-[#73897F]/5">
															<Sparkles className="w-6 h-6 text-[#73897F]" />
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{product.name[locale] ||
															product.name.zh_TW}
													</p>
													<p className="text-xs text-gray-500">
														{locale === "zh-CN"
															? "数量"
															: "數量"}
														: {item.quantity}
													</p>
													<p className="text-sm font-semibold text-[#1C312E]">
														HK$
														{(
															finalPrice *
															item.quantity
														).toFixed(0)}
													</p>
												</div>
											</div>
										);
									})}
								</div>

								<div className="space-y-4 mb-6 border-t pt-4">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											{locale === "zh-CN"
												? "小计"
												: "小計"}
										</span>
										<span className="font-medium">
											HK${calculateSubtotal().toFixed(0)}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											{locale === "zh-CN"
												? "运费"
												: "運費"}
										</span>
										<span className="font-medium text-[#1C312E]">
											{locale === "zh-CN"
												? "免费"
												: "免費"}
										</span>
									</div>
									<div className="border-t border-gray-200 pt-6 mt-4">
										<div className="flex justify-between text-xl font-bold">
											<span className="text-gray-700">
												{locale === "zh-CN"
													? "总计"
													: "總計"}
											</span>
											<span className="text-2xl bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent">
												HK$
												{calculateSubtotal().toFixed(0)}
											</span>
										</div>
									</div>
								</div>

								<Button
									type="submit"
									disabled={submitting}
									className="w-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E] h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
									size="lg"
								>
									{submitting ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
											{locale === "zh-CN"
												? "跳转到支付..."
												: "跳轉到支付..."}
										</>
									) : (
										<>
											<CreditCard className="w-5 h-5 mr-2" />
											{locale === "zh-CN"
												? "前往支付"
												: "前往支付"}
										</>
									)}
								</Button>

								<p className="text-xs text-center text-gray-500 mt-4">
									{locale === "zh-CN"
										? "点击后将跳转到 Stripe 安全支付页面"
										: "點擊後將跳轉到 Stripe 安全支付頁面"}
								</p>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
