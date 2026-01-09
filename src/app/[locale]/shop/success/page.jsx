"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight, Home, Sparkles } from "lucide-react";

export default function ShopSuccessPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = useLocale();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);

	const sessionId = searchParams.get("session_id");
	const orderId = searchParams.get("order_id");

	useEffect(() => {
		if (orderId) {
			fetchOrder();
		} else {
			setLoading(false);
		}
	}, [orderId]);

	const fetchOrder = async () => {
		try {
			const res = await fetch(`/api/shop/orders/${orderId}`);
			const data = await res.json();
			if (data.success) {
				setOrder(data.data);
			}
		} catch (error) {
			console.error("Failed to fetch order:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#EFEFEF] via-white to-[#EFEFEF]">
			<Navbar />

			<div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
				<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 text-center">
					{/* Success Icon */}
					<div className="mb-8 flex justify-center relative">
						{/* Animated sparkles */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Sparkles className="w-8 h-8 text-yellow-400 absolute -top-4 -left-4 animate-pulse" />
							<Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 right-4 animate-pulse delay-100" />
							<Sparkles className="w-7 h-7 text-yellow-500 absolute bottom-2 -left-6 animate-pulse delay-200" />
							<Sparkles className="w-5 h-5 text-yellow-400 absolute -bottom-4 right-2 animate-pulse delay-300" />
						</div>

						<div className="relative">
							<div className="absolute inset-0 bg-green-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
							<div className="relative h-24 w-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
								<CheckCircle className="w-12 h-12 text-white" />
							</div>
						</div>
					</div>

					{/* Success Message */}
					<h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent">
						{locale === "zh-CN" ? "支付成功！" : "支付成功！"}
					</h1>
					<p className="text-lg text-gray-600 mb-8">
						{locale === "zh-CN"
							? "感谢您的购买！我们已收到您的订单。"
							: "感謝您的購買！我們已收到您的訂單。"}
					</p>

					{/* Order Details */}
					{loading ? (
						<div className="flex justify-center my-8">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C312E]"></div>
						</div>
					) : order ? (
						<div className="bg-gradient-to-br from-[#73897F]/10 to-[#73897F]/5 rounded-2xl p-6 mb-8">
							<div className="flex items-center justify-center gap-2 mb-4">
								<Package className="w-5 h-5 text-[#1C312E]" />
								<h2 className="text-xl font-semibold text-[#1C312E]">
									{locale === "zh-CN"
										? "订单信息"
										: "訂單資訊"}
								</h2>
							</div>
							<div className="space-y-2 text-left max-w-md mx-auto">
								<div className="flex justify-between">
									<span className="text-gray-600">
										{locale === "zh-CN"
											? "订单号："
											: "訂單號："}
									</span>
									<span className="font-semibold text-[#1C312E]">
										{order.orderId}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										{locale === "zh-CN"
											? "金额："
											: "金額："}
									</span>
									<span className="font-semibold text-[#1C312E]">
										{order.currency === "HKD" && "HK$"}
										{order.currency === "CNY" && "¥"}
										{order.currency === "USD" && "$"}
										{order.totalAmount.toFixed(0)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										{locale === "zh-CN"
											? "状态："
											: "狀態："}
									</span>
									<span className="font-semibold text-green-600">
										{locale === "zh-CN"
											? "已支付"
											: "已支付"}
									</span>
								</div>
							</div>
						</div>
					) : null}

					{/* Next Steps */}
					<div className="mb-8 p-6 bg-blue-50 rounded-2xl text-left">
						<h3 className="font-semibold text-lg mb-3 text-[#1C312E]">
							{locale === "zh-CN"
								? "接下来会发生什么？"
								: "接下來會發生什麼？"}
						</h3>
						<ul className="space-y-2 text-gray-700">
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									{locale === "zh-CN"
										? "您将收到订单确认邮件"
										: "您將收到訂單確認郵件"}
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									{locale === "zh-CN"
										? "我们会尽快处理您的订单"
										: "我們會盡快處理您的訂單"}
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									{locale === "zh-CN"
										? "订单发货后，您将收到物流跟踪信息"
										: "訂單發貨後，您將收到物流跟蹤資訊"}
								</span>
							</li>
						</ul>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						{orderId && (
							<Button
								onClick={() =>
									router.push(`/${locale}/orders/${orderId}`)
								}
								className="bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E] h-12"
								size="lg"
							>
								<Package className="w-5 h-5 mr-2" />
								{locale === "zh-CN"
									? "查看订单详情"
									: "查看訂單詳情"}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						)}
						<Button
							onClick={() => router.push(`/${locale}/shop`)}
							variant="outline"
							className="border-[#73897F]/30 hover:bg-[#73897F]/10 h-12"
							size="lg"
						>
							<Home className="w-5 h-5 mr-2" />
							{locale === "zh-CN" ? "继续购物" : "繼續購物"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
