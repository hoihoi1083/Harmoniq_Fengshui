"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
	CheckCircle,
	Package,
	Truck,
	MapPin,
	Phone,
	Mail,
	Calendar,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderConfirmationPage() {
	const { data: session } = useSession();
	const locale = useLocale();
	const router = useRouter();
	const params = useParams();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (session?.user && params.orderId) {
			fetchOrder();
		} else if (!session?.user) {
			setLoading(false);
		}
	}, [session, params.orderId]);

	const fetchOrder = async () => {
		try {
			const res = await fetch(`/api/shop/orders/${params.orderId}`);
			const data = await res.json();
			console.log("Order API response:", data);
			if (data.success && data.data) {
				console.log("Setting order:", data.data);
				setOrder(data.data);
			} else {
				console.error("Order fetch failed:", data);
				toast.error(locale === "zh-CN" ? "订单不存在" : "訂單不存在");
			}
		} catch (error) {
			console.error("Failed to fetch order:", error);
			toast.error(locale === "zh-CN" ? "加载订单失败" : "載入訂單失敗");
		} finally {
			setLoading(false);
		}
	};

	const getStatusText = (status) => {
		const statusMap = {
			pending: locale === "zh-CN" ? "待处理" : "待處理",
			processing: locale === "zh-CN" ? "处理中" : "處理中",
			shipped: locale === "zh-CN" ? "已发货" : "已發貨",
			delivered: locale === "zh-CN" ? "已送达" : "已送達",
			cancelled: locale === "zh-CN" ? "已取消" : "已取消",
		};
		return statusMap[status] || status;
	};

	const getPaymentStatusText = (status) => {
		const statusMap = {
			pending: locale === "zh-CN" ? "待支付" : "待支付",
			paid: locale === "zh-CN" ? "已支付" : "已支付",
			failed: locale === "zh-CN" ? "支付失败" : "支付失敗",
			refunded: locale === "zh-CN" ? "已退款" : "已退款",
		};
		return statusMap[status] || status;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<Navbar />
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
				<Navbar />
				<div className="container mx-auto px-4 py-24 text-center">
					<Package className="w-16 h-16 mx-auto mb-4 text-[#73897F]" />
					<h2 className="text-2xl font-bold mb-2">
						{locale === "zh-CN" ? "请先登录" : "請先登入"}
					</h2>
					<Button
						onClick={() => router.push(`/${locale}/auth/signin`)}
						className="bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E] mt-4"
					>
						{locale === "zh-CN" ? "去登录" : "前往登入"}
					</Button>
				</div>
			</div>
		);
	}

	if (!order && !loading) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<Navbar />
				<div className="container mx-auto px-4 py-24 text-center">
					<Package className="w-16 h-16 mx-auto mb-4 text-[#73897F]" />
					<h2 className="text-2xl font-bold mb-2">
						{locale === "zh-CN" ? "订单不存在" : "訂單不存在"}
					</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#EFEFEF] via-white to-[#EFEFEF]">
			<Navbar />

			<div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
				{/* Success Header */}
				<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 mb-10 text-center border border-gray-100 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-50" />
					<div className="relative z-10">
						<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 mb-6 shadow-lg">
							<CheckCircle className="w-14 h-14 text-white" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent mb-4">
							{locale === "zh-CN"
								? "订单创建成功！"
								: "訂單建立成功！"}
						</h1>
						<p className="text-xl text-gray-600 mb-6">
							{locale === "zh-CN"
								? "我们已收到您的订单，将尽快为您处理"
								: "我們已收到您的訂單，將盡快為您處理"}
						</p>
						<div className="inline-flex items-center gap-3 text-base text-gray-500 bg-white/80 px-6 py-3 rounded-full shadow-md">
							<Calendar className="w-5 h-5" />
							<span className="font-medium">
								{new Date(order.createdAt).toLocaleString(
									locale === "zh-CN" ? "zh-CN" : "zh-TW",
									{
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									}
								)}
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Order Details */}
					<div className="lg:col-span-2 space-y-8">
						{/* Order Items */}
						<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100">
							<h2 className="text-2xl font-bold mb-6 text-[#1C312E] flex items-center gap-3">
								<Package className="w-7 h-7" />
								{locale === "zh-CN" ? "订单商品" : "訂單商品"}
							</h2>
							<div className="space-y-6">
								{order.items && order.items.length > 0 ? (
									order.items.map((item, index) => {
										// Handle both populated and non-populated productId
										const product = item.productId || {};
										const productName = product.name
											? product.name[locale] ||
												product.name.zh_TW
											: item.productName || "Product";
										const productImage =
											product.images?.[0] ||
											item.productImage ||
											"";
										const finalPrice =
											item.price *
											(1 - (item.discount || 0) / 100);

										return (
											<div
												key={item._id || index}
												className="flex gap-5 pb-6 border-b last:border-b-0 hover:bg-gray-50 p-4 rounded-xl transition-colors"
											>
												<div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
													{productImage ? (
														<Image
															src={productImage}
															alt={productName}
															fill
															className="object-cover"
														/>
													) : (
														<div className="flex items-center justify-center h-full bg-gradient-to-br from-[#73897F]/10 to-[#73897F]/5">
															<Sparkles className="w-8 h-8 text-[#73897F]" />
														</div>
													)}
												</div>
												<div className="flex-1">
													<h3 className="font-semibold mb-1">
														{productName}
													</h3>
													{product.description && (
														<p className="text-sm text-gray-500 mb-2 line-clamp-2">
															{product
																.description[
																locale
															] ||
																product
																	.description
																	.zh_TW}
														</p>
													)}
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600">
															{locale === "zh-CN"
																? "数量"
																: "數量"}
															: {item.quantity}
														</span>
														<span className="text-lg font-bold text-[#1C312E]">
															{order.currency ===
																"HKD" && "HK$"}
															{order.currency ===
																"CNY" && "¥"}
															{order.currency ===
																"USD" && "$"}
															{(
																finalPrice *
																item.quantity
															).toFixed(0)}
														</span>
													</div>
												</div>
											</div>
										);
									})
								) : (
									<p className="text-gray-500 text-center py-8">
										{locale === "zh-CN"
											? "無商品信息"
											: "無商品資訊"}
									</p>
								)}
							</div>
						</div>

						{/* Shipping Information */}
						<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100">
							<div className="flex items-center gap-3 mb-6">
								<div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] flex items-center justify-center">
									<MapPin className="w-5 h-5 text-white" />
								</div>
								<h2 className="text-2xl font-bold text-[#1C312E]">
									{locale === "zh-CN"
										? "配送信息"
										: "配送資訊"}
								</h2>
							</div>
							<div className="space-y-4 text-base bg-gray-50 p-6 rounded-2xl">
								<div className="flex items-start gap-3">
									<span className="font-semibold text-gray-700 min-w-[80px]">
										{locale === "zh-CN"
											? "收件人："
											: "收件人："}
									</span>
									<span className="text-gray-900">
									{order.shippingAddress?.fullName || "N/A"}
									</span>
								</div>
								<div className="flex items-start gap-3">
									<span className="font-semibold text-gray-700 min-w-[80px]">
										{locale === "zh-CN"
											? "电话："
											: "電話："}
									</span>
									<span className="text-gray-900">
									{order.shippingAddress?.phone || "N/A"}
									</span>
								</div>
								<p>
									<span className="font-medium">
										{locale === "zh-CN"
											? "邮箱："
											: "郵箱："}
									</span>
									<span>{order.userEmail || order.userId || "N/A"}</span>
								</p>
								<p>
									<span className="font-medium">
										{locale === "zh-CN"
											? "地址："
											: "地址："}
									</span>
									<span>
									{order.shippingAddress?.address || ""},{" "}
									{order.shippingAddress?.city || ""}
									{order.shippingAddress?.province &&
										`, ${order.shippingAddress.province}`}
									{order.shippingAddress?.postalCode &&
										` ${order.shippingAddress.postalCode}`}
									, {order.shippingAddress?.country || ""}
									</span>
								</p>
								{order.notes && (
									<p>
										<span className="font-medium">
											{locale === "zh-CN"
												? "备注："
												: "備註："}
										</span>
										<span>{order.notes}</span>
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1 space-y-6">
						{/* Order Info */}
						<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100 sticky top-24">
							<h2 className="text-2xl font-bold mb-6 text-[#1C312E]">
								{locale === "zh-CN" ? "订单信息" : "訂單資訊"}
							</h2>
							<div className="space-y-5 text-base">
								<div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl">
									<span className="text-sm text-gray-600">
										{locale === "zh-CN"
											? "订单编号"
											: "訂單編號"}
									</span>
									<span className="font-mono text-xs text-[#1C312E] font-semibold break-all">
										{order._id}
									</span>
								</div>
								<div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
									<span className="text-gray-700 font-medium">
										{locale === "zh-CN"
											? "订单状态"
											: "訂單狀態"}
									</span>
									<span className="font-bold text-[#1C312E] px-3 py-1 bg-white rounded-full shadow-sm">
										{getStatusText(order.status)}
									</span>
								</div>
								<div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
									<span className="text-gray-700 font-medium">
										{locale === "zh-CN"
											? "支付状态"
											: "支付狀態"}
									</span>
									<span className="font-bold text-orange-600 px-3 py-1 bg-white rounded-full shadow-sm">
										{getPaymentStatusText(
											order.paymentStatus
										)}
									</span>
								</div>
							</div>
						</div>

						{/* Price Summary */}
						<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100">
							<h2 className="text-2xl font-bold mb-6 text-[#1C312E]">
								{locale === "zh-CN" ? "订单金额" : "訂單金額"}
							</h2>
							<div className="space-y-4">
								<div className="flex justify-between text-base p-3 bg-gray-50 rounded-xl">
									<span className="text-gray-700 font-medium">
										{locale === "zh-CN" ? "小计" : "小計"}
									</span>
									<span className="font-medium">
										HK${(order.subtotal || order.totalAmount || 0).toFixed(0)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">
										{locale === "zh-CN" ? "运费" : "運費"}
									</span>
									<span className="font-semibold text-[#1C312E]">
										{(order.shippingFee || 0) === 0
											? locale === "zh-CN"
												? "免费"
												: "免費"
											: `HK$${(order.shippingFee || 0).toFixed(0)}`}
									</span>
								</div>
								<div className="border-t border-gray-200 pt-5 mt-4">
									<div className="flex justify-between items-center text-xl font-bold p-4 bg-gradient-to-r from-[#73897F]/10 to-[#73897F]/5 rounded-xl">
										<span className="text-gray-700">
											{locale === "zh-CN"
												? "总计"
												: "總計"}
										</span>
										<span className="text-2xl bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent">
												HK${(order.total || order.totalAmount || 0).toFixed(0)}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="space-y-4">
							<Button
								className="w-full bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E] h-12 text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
								onClick={() => router.push(`/${locale}/shop`)}
							>
								<Sparkles className="w-4 h-4 mr-2" />
								{locale === "zh-CN" ? "继续购物" : "繼續購物"}
							</Button>
							<Button
								variant="outline"
								className="w-full border-2 border-gray-200 hover:bg-gray-50 h-12 text-base rounded-xl transition-all hover:-translate-y-0.5"
								onClick={() => window.print()}
							>
								{locale === "zh-CN" ? "打印订单" : "列印訂單"}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
