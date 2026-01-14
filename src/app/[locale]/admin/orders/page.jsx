"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShopNavbar from "@/components/ShopNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Package,
	Truck,
	CheckCircle,
	XCircle,
	Clock,
	Eye,
	Search,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const locale = useLocale();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (status === "loading") return;

		if (status === "unauthenticated" || !session?.user) {
			toast.error("請先登入以訪問管理頁面");
			router.push(`/${locale}/auth/login`);
			return;
		}

		const isAdmin =
			session.user.userId === "harmoniqadmin" ||
			session.user.email === "harmoniqadmin@harmoniq.com";

		if (!isAdmin) {
			toast.error("您沒有權限訪問此頁面");
			router.push(`/${locale}/shop`);
			return;
		}

		fetchOrders();
	}, [status, session, locale, router]);

	const fetchOrders = async () => {
		try {
			const res = await fetch("/api/admin/orders");
			const data = await res.json();
			if (data.success) {
				setOrders(data.data);
			}
		} catch (error) {
			console.error("Failed to fetch orders:", error);
			toast.error("載入訂單失敗");
		} finally {
			setLoading(false);
		}
	};

	const updateOrderStatus = async (orderId, newStatus) => {
		try {
			const res = await fetch(`/api/admin/orders/${orderId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			const data = await res.json();
			if (data.success) {
				toast.success("訂單狀態已更新");
				fetchOrders();
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error("更新失敗");
		}
	};

	const getStatusBadge = (status) => {
		const statusConfig = {
			pending: {
				label: "待處理",
				color: "bg-yellow-100 text-yellow-800",
			},
			paid: { label: "已支付", color: "bg-green-100 text-green-800" },
			processing: { label: "處理中", color: "bg-blue-100 text-blue-800" },
			shipped: {
				label: "已發貨",
				color: "bg-purple-100 text-purple-800",
			},
			delivered: { label: "已送達", color: "bg-teal-100 text-teal-800" },
			completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
			cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
		};
		const config = statusConfig[status] || statusConfig.pending;
		return (
			<Badge className={`${config.color} border-none`}>
				{config.label}
			</Badge>
		);
	};

	const filteredOrders = orders
		.filter(
			(order) => filterStatus === "all" || order.status === filterStatus
		)
		.filter((order) =>
			searchQuery
				? order.orderId
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					order.userEmail
						?.toLowerCase()
						.includes(searchQuery.toLowerCase())
				: true
		);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<ShopNavbar />
				<div className="flex items-center justify-center h-[80vh] pt-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C312E] mx-auto mb-4"></div>
						<p className="text-gray-600">載入中...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			<ShopNavbar />

			<div className="container mx-auto px-4 pt-24 pb-12">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-[#1C312E] mb-2">
						訂單管理
					</h1>
					<p className="text-gray-600">
						管理所有商店訂單 ({orders.length})
					</p>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-xl shadow-sm p-4 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<Input
								placeholder="搜索訂單號或郵箱..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={filterStatus}
							onValueChange={setFilterStatus}
						>
							<SelectTrigger>
								<SelectValue placeholder="所有狀態" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">所有狀態</SelectItem>
								<SelectItem value="pending">待處理</SelectItem>
								<SelectItem value="paid">已支付</SelectItem>
								<SelectItem value="processing">
									處理中
								</SelectItem>
								<SelectItem value="shipped">已發貨</SelectItem>
								<SelectItem value="delivered">
									已送達
								</SelectItem>
								<SelectItem value="completed">
									已完成
								</SelectItem>
								<SelectItem value="cancelled">
									已取消
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Orders List */}
				<div className="space-y-4">
					{filteredOrders.length === 0 ? (
						<div className="bg-white rounded-xl shadow-sm p-12 text-center">
							<Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
							<p className="text-gray-600">沒有找到訂單</p>
						</div>
					) : (
						filteredOrders.map((order) => (
							<div
								key={order._id}
								className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="font-semibold text-lg">
												{order.orderId}
											</h3>
											{getStatusBadge(order.status)}
											{order.paymentStatus === "paid" && (
												<Badge className="bg-green-100 text-green-800 border-none">
													<CheckCircle className="w-3 h-3 mr-1" />
													已付款
												</Badge>
											)}
										</div>
										<div className="text-sm text-gray-600 space-y-1">
											<p>
												客戶：{" "}
												{order.shippingAddress
													?.fullName || "N/A"}
											</p>
											<p>郵箱： {order.userEmail}</p>
											<p>
												金額：{order.currency} $
												{order.totalAmount}
											</p>
											<p>
												商品數量：{" "}
												{order.items?.length || 0}
											</p>
											<p>
												下單時間：{" "}
												{new Date(
													order.createdAt
												).toLocaleString("zh-TW")}
											</p>
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<Select
											value={order.status}
											onValueChange={(newStatus) =>
												updateOrderStatus(
													order._id,
													newStatus
												)
											}
										>
											<SelectTrigger className="w-full md:w-40">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">
													待處理
												</SelectItem>
												<SelectItem value="paid">
													已支付
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
												<SelectItem value="completed">
													已完成
												</SelectItem>
												<SelectItem value="cancelled">
													已取消
												</SelectItem>
											</SelectContent>
										</Select>

										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												router.push(
													`/${locale}/admin/orders/${order._id}`
												)
											}
											className="w-full md:w-40"
										>
											<Eye className="w-4 h-4 mr-2" />
											查看詳情
										</Button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
