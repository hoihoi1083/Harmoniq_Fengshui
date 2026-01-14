"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ArrowLeft,
	Package,
	Truck,
	CheckCircle,
	Clock,
	User,
	Mail,
	Phone,
	MapPin,
	CreditCard,
	Calendar,
	Hash,
	Edit2,
	Save,
	X,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

export default async function AdminOrderDetailPage({ params }) {
	const { orderId, locale } = await params;
	return <AdminOrderDetailContent orderId={orderId} locale={locale} />;
}

function AdminOrderDetailContent({ orderId, locale }) {
	const router = useRouter();
	const { data: session } = useSession();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [editingTracking, setEditingTracking] = useState(false);
	const [trackingNumber, setTrackingNumber] = useState("");

	// Fetch order details
	useEffect(() => {
		const fetchOrder = async () => {
			try {
				const response = await fetch(`/api/admin/orders/${orderId}`, {
					cache: 'no-store',
					headers: {
						'Cache-Control': 'no-cache',
						'Content-Type': 'application/json'
					}
				});
				const data = await response.json();
				console.log("Admin order API response:", data);
				if (response.ok && data.success) {
					console.log("Setting admin order:", data.order);
					setOrder(data.order);
					setTrackingNumber(data.order.trackingNumber || "");
				} else {
					console.error("Admin order fetch failed:", data);
					toast.error("Failed to load order");
					router.push("/admin/orders");
				}
			} catch (error) {
				console.error("Error fetching order:", error);
				toast.error("Failed to load order");
			} finally {
				setLoading(false);
			}
		};

		if (orderId) {
			fetchOrder();
		}
	}, [orderId, router]);

	// Check admin access
	useEffect(() => {
		if (
			!loading &&
			(!session || session.user?.email !== "harmoniqadmin@harmoniq.com")
		) {
			toast.error("Admin access required");
			router.push("/");
		}
	}, [session, loading, router]);

	// Update order status
	const handleStatusUpdate = async (newStatus) => {
		setUpdating(true);
		try {
			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				const data = await response.json();
				setOrder(data.order);
				toast.success("Order status updated successfully");
			} else {
				toast.error("Failed to update order status");
			}
		} catch (error) {
			console.error("Error updating order:", error);
			toast.error("Failed to update order status");
		} finally {
			setUpdating(false);
		}
	};

	// Update tracking number
	const handleTrackingUpdate = async () => {
		if (!trackingNumber.trim()) {
			toast.error("Please enter a tracking number");
			return;
		}

		setUpdating(true);
		try {
			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					trackingNumber: trackingNumber.trim(),
					status: "shipped",
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setOrder(data.order);
				setEditingTracking(false);
				toast.success("Tracking number updated and customer notified");
			} else {
				toast.error("Failed to update tracking number");
			}
		} catch (error) {
			console.error("Error updating tracking:", error);
			toast.error("Failed to update tracking number");
		} finally {
			setUpdating(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
				<div className="text-center">
					<Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
					<h2 className="text-2xl font-bold mb-2">訂單不存在</h2>
					<Button
						onClick={() => router.push("/admin/orders")}
						className="mt-4"
					>
						返回訂單列表
					</Button>
				</div>
			</div>
		);
	}

	const getStatusIcon = (status) => {
		switch (status) {
			case "pending":
				return <Clock className="w-5 h-5 text-yellow-500" />;
			case "paid":
				return <CheckCircle className="w-5 h-5 text-blue-500" />;
			case "processing":
				return <Package className="w-5 h-5 text-purple-500" />;
			case "shipped":
				return <Truck className="w-5 h-5 text-green-500" />;
			case "delivered":
				return <CheckCircle className="w-5 h-5 text-green-600" />;
			default:
				return <Clock className="w-5 h-5 text-gray-500" />;
		}
	};

	const getStatusText = (status) => {
		const statusMap = {
			pending: "待付款",
			paid: "已付款",
			processing: "處理中",
			shipped: "已發貨",
			delivered: "已送達",
			cancelled: "已取消",
		};
		return statusMap[status] || status;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<Button
						onClick={() => router.push("/admin/orders")}
						variant="ghost"
						className="mb-4"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						返回訂單列表
					</Button>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-slate-800">
								訂單詳情
							</h1>
							<p className="text-slate-600 mt-1">
								訂單編號: {order.orderId}
							</p>
						</div>
						<div className="flex items-center gap-2">
						{getStatusIcon(order.status)}
						<span className="font-medium">
							{getStatusText(order.status)}
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Order Management */}
					<div className="lg:col-span-1 space-y-6">
						{/* Status Management */}
						<Card className="p-6 bg-white border-slate-200 shadow-lg">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
								<Package className="w-5 h-5 text-blue-600" />
								訂單管理
							</h2>

							<div className="space-y-4">
								{/* Status Selector */}
								<div>
									<label className="block text-sm font-medium mb-2">
										訂單狀態
									</label>
									<Select
									value={order.status}
										onValueChange={handleStatusUpdate}
										disabled={updating}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">
												待付款
											</SelectItem>
											<SelectItem value="paid">
												已付款
											</SelectItem>
											<SelectItem value="processing">
												處理中
											</SelectItem>
											<SelectItem value="shipped">
												已發貨
											</SelectItem>
											<SelectItem value="delivered">
												已送達
											</SelectItem>
											<SelectItem value="cancelled">
												已取消
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Tracking Number */}
								<div>
									<label className="block text-sm font-medium mb-2">
										物流追蹤號
									</label>
									{editingTracking ? (
										<div className="space-y-2">
											<Input
												value={trackingNumber}
												onChange={(e) =>
													setTrackingNumber(
														e.target.value
													)
												}
												placeholder="輸入物流追蹤號"
												disabled={updating}
											/>
											<div className="flex gap-2">
												<Button
													onClick={
														handleTrackingUpdate
													}
													disabled={updating}
													className="flex-1"
													size="sm"
												>
													<Save className="w-4 h-4 mr-2" />
													保存
												</Button>
												<Button
													onClick={() => {
														setEditingTracking(
															false
														);
														setTrackingNumber(
															order.trackingNumber ||
																""
														);
													}}
													variant="outline"
													size="sm"
													disabled={updating}
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<div className="flex-1 px-3 py-2 bg-gray-50 rounded border">
												{order.trackingNumber ||
													"未設置"}
											</div>
											<Button
												onClick={() =>
													setEditingTracking(true)
												}
												variant="outline"
												size="sm"
											>
												<Edit2 className="w-4 h-4" />
											</Button>
										</div>
									)}
								</div>

								{/* Order Dates */}
								<div className="space-y-2 pt-4 border-t">
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-600">
											創建時間
										</span>
										<span className="font-medium">
											{new Date(
												order.createdAt
											).toLocaleString("zh-TW")}
										</span>
									</div>
									{order.paidAt && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-600">
												付款時間
											</span>
											<span className="font-medium">
												{new Date(
													order.paidAt
												).toLocaleString("zh-TW")}
											</span>
										</div>
									)}
									{order.shippedAt && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-600">
												發貨時間
											</span>
											<span className="font-medium">
												{new Date(
													order.shippedAt
												).toLocaleString("zh-TW")}
											</span>
										</div>
									)}
								</div>
							</div>
						</Card>

						{/* Customer Info */}
						<Card className="p-6 bg-white border-slate-200 shadow-lg">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
								<User className="w-5 h-5 text-blue-600" />
								客戶資訊
							</h2>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<User className="w-4 h-4 mt-1 text-gray-500" />
									<div>
										<p className="text-sm text-gray-600">
											姓名
										</p>
										<p className="font-medium">
											{order.shippingAddress?.fullName ||
												"N/A"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Mail className="w-4 h-4 mt-1 text-gray-500" />
									<div>
										<p className="text-sm text-gray-600">
											郵箱
										</p>
										<p className="font-medium break-all">
											{order.userEmail ||
												order.userId ||
												"N/A"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="w-4 h-4 mt-1 text-gray-500" />
									<div>
										<p className="text-sm text-gray-600">
											電話
										</p>
										<p className="font-medium">
											{order.shippingAddress?.phone ||
												"N/A"}
										</p>
									</div>
								</div>
							</div>
						</Card>
					</div>

					{/* Right Column - Order Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Order Items */}
						<Card className="p-6 bg-white border-slate-200 shadow-lg">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
								<Package className="w-5 h-5 text-blue-600" />
								訂單商品
							</h2>
							<div className="space-y-4">
								{order.items.map((item, index) => {
									const product = item.productId || {};
									const productName = product.name 
										? (typeof product.name === 'string' ? product.name : (product.name[locale] || product.name.zh_TW || product.name.en))
										: item.productName || "商品";
									return (
										<div
											key={index}
											className="flex gap-4 pb-4 border-b last:border-b-0"
										>
											<div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
												{product.images?.[0] ||
												item.productImage ? (
													<img
														src={
															product
																.images?.[0] ||
															item.productImage
														}
														alt={productName}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<Package className="w-8 h-8 text-gray-400" />
													</div>
												)}
											</div>
											<div className="flex-1">
												<h3 className="font-semibold text-gray-800">
													{productName}
												</h3>
												<p className="text-sm text-gray-600 mt-1">
													數量: {item.quantity}
												</p>
												<p className="text-sm text-blue-600 font-medium mt-1">
													{order.currency === "HKD"
														? "HK$"
														: "$"}
													{item.price?.toFixed(2) ||
														"0.00"}
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-gray-800">
													{order.currency === "HKD"
														? "HK$"
														: "$"}
													{(
														item.price *
														item.quantity
													).toFixed(2)}
												</p>
											</div>
										</div>
									);
								})}

								{/* Order Total */}
								<div className="pt-4 space-y-2">
									<div className="flex justify-between text-gray-600">
										<span>小計</span>
										<span>
											{order.currency === "HKD"
												? "HK$"
												: "$"}
											{order.totalAmount?.toFixed(2)}
										</span>
									</div>
									<div className="flex justify-between text-gray-600">
										<span>運費</span>
										<span>
											{order.shippingFee > 0
												? `${order.currency === "HKD" ? "HK$" : "$"}${order.shippingFee.toFixed(2)}`
												: "免運費"}
										</span>
									</div>
									<div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t">
										<span>總計</span>
										<span>
											{order.currency === "HKD"
												? "HK$"
												: "$"}
											{order.totalAmount?.toFixed(2)}
										</span>
									</div>
								</div>
							</div>
						</Card>

						{/* Shipping Address */}
						<Card className="p-6 bg-white border-slate-200 shadow-lg">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
								<MapPin className="w-5 h-5 text-blue-600" />
								配送地址
							</h2>
							<div className="space-y-2">
								<p className="font-medium">
									{order.shippingAddress?.fullName}
								</p>
								<p className="text-gray-600">
									{order.shippingAddress?.phone}
								</p>
								<p className="text-gray-700">
									{order.shippingAddress?.address}
								</p>
								<p className="text-gray-700">
									{order.shippingAddress?.city},{" "}
									{order.shippingAddress?.province}{" "}
									{order.shippingAddress?.postalCode}
								</p>
								<p className="text-gray-700">
									{order.shippingAddress?.country}
								</p>
							</div>
						</Card>

						{/* Payment Info */}
						<Card className="p-6 bg-white border-slate-200 shadow-lg">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
								<CreditCard className="w-5 h-5 text-blue-600" />
								支付資訊
							</h2>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600">
										支付方式
									</p>
									<p className="font-medium">
										{order.paymentMethod || "Stripe"}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										交易ID
									</p>
									<p className="font-medium text-xs break-all">
										{order.stripePaymentIntentId || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										訂單狀態
									</p>
									<p className="font-medium">
										{getStatusText(order.paymentStatus)}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										幣種
									</p>
									<p className="font-medium">
										{order.currency || "HKD"}
									</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
