"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
	Package,
	ShoppingBag,
	Eye,
	Clock,
	CheckCircle,
	Truck,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function MyOrdersPage() {
	const { data: session } = useSession();
	const locale = useLocale();
	const router = useRouter();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (session?.user) {
			fetchOrders();
		} else {
			setLoading(false);
		}
	}, [session]);

	const fetchOrders = async () => {
		try {
			const res = await fetch("/api/shop/orders");
			const data = await res.json();
			if (data.success) {
				setOrders(data.data);
			}
		} catch (error) {
			console.error("Failed to fetch orders:", error);
			toast.error(locale === "zh-CN" ? "加载订单失败" : "載入訂單失敗");
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		const statusConfig = {
			pending: {
				label: locale === "zh-CN" ? "待处理" : "待處理",
				color: "bg-yellow-100 text-yellow-800",
				icon: Clock,
			},
			paid: {
				label: locale === "zh-CN" ? "已支付" : "已支付",
				color: "bg-green-100 text-green-800",
				icon: CheckCircle,
			},
			processing: {
				label: locale === "zh-CN" ? "处理中" : "處理中",
				color: "bg-blue-100 text-blue-800",
				icon: Package,
			},
			shipped: {
				label: locale === "zh-CN" ? "已发货" : "已發貨",
				color: "bg-purple-100 text-purple-800",
				icon: Truck,
			},
			delivered: {
				label: locale === "zh-CN" ? "已送达" : "已送達",
				color: "bg-teal-100 text-teal-800",
				icon: CheckCircle,
			},
			completed: {
				label: locale === "zh-CN" ? "已完成" : "已完成",
				color: "bg-gray-100 text-gray-800",
				icon: CheckCircle,
			},
			cancelled: {
				label: locale === "zh-CN" ? "已取消" : "已取消",
				color: "bg-red-100 text-red-800",
				icon: Clock,
			},
		};
		const config = statusConfig[status] || statusConfig.pending;
		const IconComponent = config.icon;

		return (
			<Badge className={`${config.color} border-none`}>
				<IconComponent className="w-3 h-3 mr-1" />
				{config.label}
			</Badge>
		);
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
					<Package className="w-16 h-16 mx-auto mb-4 text-[#73897F]" />
					<h2 className="text-2xl font-bold mb-2">
						{locale === "zh-CN" ? "请先登录" : "請先登入"}
					</h2>
					<p className="text-gray-600 mb-6">
						{locale === "zh-CN"
							? "登录后即可查看订单"
							: "登入後即可查看訂單"}
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#EFEFEF] via-white to-[#EFEFEF]">
			<ShopNavbar />

			<div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] bg-clip-text text-transparent mb-2">
						{locale === "zh-CN" ? "我的订单" : "我的訂單"}
					</h1>
					<p className="text-gray-600 text-lg">
						{locale === "zh-CN"
							? `共 ${orders.length} 个订单`
							: `共 ${orders.length} 個訂單`}
					</p>
				</div>

				{orders.length === 0 ? (
					<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center border border-gray-100">
						<ShoppingBag className="w-20 h-20 mx-auto mb-4 text-[#73897F]" />
						<h2 className="text-xl font-semibold mb-2">
							{locale === "zh-CN" ? "还没有订单" : "還沒有訂單"}
						</h2>
						<p className="text-gray-600 mb-6">
							{locale === "zh-CN"
								? "快去选购一些幸运物品吧！"
								: "快去選購一些幸運物品吧！"}
						</p>
						<Button
							onClick={() => router.push(`/${locale}/shop`)}
							className="bg-gradient-to-r from-[#1C312E] to-[#1A3B2C] hover:from-[#2A4A3E] hover:to-[#2A4A3E]"
						>
							{locale === "zh-CN" ? "开始购物" : "開始購物"}
						</Button>
					</div>
				) : (
					<div className="space-y-6">
						{orders.map((order) => (
							<div
								key={order._id}
								className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
							>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
									<div>
										<div className="flex items-center gap-3 mb-2">
											<h3 className="font-semibold text-lg">
												{order.orderId}
											</h3>
											{getStatusBadge(order.status)}
										</div>
										<p className="text-sm text-gray-500">
											{new Date(
												order.createdAt
											).toLocaleString("zh-TW")}
										</p>
									</div>
									<div className="text-right">
										<p className="text-2xl font-bold text-[#1C312E]">
											{order.currency === "HKD" && "HK$"}
											{order.currency === "CNY" && "¥"}
											{order.currency === "USD" && "$"}
											{order.totalAmount}
										</p>
										<p className="text-sm text-gray-500">
											{order.items?.length || 0}{" "}
											{locale === "zh-CN"
												? "件商品"
												: "件商品"}
										</p>
									</div>
								</div>

								{/* Order Items Preview */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
									{order.items
										?.slice(0, 4)
										.map((item, index) => {
											const productImage =
												item.productImage || "";
											return (
												<div
													key={index}
													className="relative aspect-square rounded-lg overflow-hidden bg-gray-50"
												>
													{productImage ? (
														<Image
															src={productImage}
															alt="Product"
															fill
															className="object-cover"
														/>
													) : (
														<div className="flex items-center justify-center h-full bg-gradient-to-br from-[#73897F]/10 to-[#73897F]/5">
															<Sparkles className="w-8 h-8 text-[#73897F]" />
														</div>
													)}
												</div>
											);
										})}
								</div>

								<Button
									onClick={() =>
										router.push(
											`/${locale}/orders/${order._id}`
										)
									}
									variant="outline"
									className="w-full border-[#73897F]/30 hover:bg-[#73897F]/10"
								>
									<Eye className="w-4 h-4 mr-2" />
									{locale === "zh-CN"
										? "查看详情"
										: "查看詳情"}
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
