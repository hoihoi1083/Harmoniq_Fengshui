"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
	Package,
	ShoppingBag,
	Store,
	TrendingUp,
	DollarSign,
	Clock,
	CheckCircle,
	BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard({ params }) {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [stats, setStats] = useState({
		todayOrders: 0,
		pendingOrders: 0,
		completedOrders: 0,
		totalProducts: 0,
		totalRevenue: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
		} else if (
			status === "authenticated" &&
			session?.user?.email !== "harmoniqadmin@harmoniq.com"
		) {
			router.push("/");
		} else if (status === "authenticated") {
			fetchStats();
		}
	}, [status, session, router]);

	const fetchStats = async () => {
		try {
			// Fetch real stats from your API
			const [ordersRes, productsRes] = await Promise.all([
				fetch("/api/admin/orders", {
					cache: 'no-store',
					headers: {
						'Cache-Control': 'no-cache'
					}
				}),
				fetch("/api/shop/products?limit=1000", {
					cache: 'no-store',
					headers: {
						'Cache-Control': 'no-cache'
					}
				}),
			]);

			const ordersData = await ordersRes.json();
			const productsData = await productsRes.json();

			if (ordersData.success && ordersData.orders) {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				const todayOrders = ordersData.orders.filter(
					(order) => new Date(order.createdAt) >= today
				).length;

				const pendingOrders = ordersData.orders.filter(
					(order) => order.paymentStatus === "pending"
				).length;

				const completedOrders = ordersData.orders.filter(
					(order) => order.paymentStatus === "paid" || order.status === "delivered"
				).length;

				const totalRevenue = ordersData.orders
					.filter((order) => order.paymentStatus === "paid")
					.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

				setStats({
					todayOrders,
					pendingOrders,
					completedOrders,
					totalProducts: productsData.data?.products?.length || 0,
					totalRevenue: totalRevenue.toFixed(0),
				});
			}
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		} finally {
			setLoading(false);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (
		!session ||
		session.user.email !== "harmoniqadmin@harmoniq.com"
	) {
		return null;
	}

	const mainActions = [
		{
			title: "商店管理",
			title_en: "Shop Management",
			description: "管理所有產品與庫存",
			description_en: "Manage all products and inventory",
			icon: Store,
			href: "/admin/shop",
			color: "from-blue-500 to-blue-600",
		},
		{
			title: "訂單管理",
			title_en: "Orders",
			description: "查看和處理所有訂單",
			description_en: "View and process all orders",
			icon: ShoppingBag,
			href: "/admin/orders",
			color: "from-green-500 to-green-600",
		},
		{
			title: "產品列表",
			title_en: "Products",
			description: "瀏覽所有商品",
			description_en: "Browse all products",
			icon: Package,
			href: "/admin/products",
			color: "from-purple-500 to-purple-600",
		},
		{
			title: "數據分析",
			title_en: "Analytics",
			description: "查看銷售與業績報告",
			description_en: "View sales and performance reports",
			icon: BarChart3,
			href: "/admin/analytics",
			color: "from-orange-500 to-orange-600",
		},
	];

	const quickStats = [
		{
			label: "今日訂單",
			label_en: "Today's Orders",
			value: stats.todayOrders,
			icon: ShoppingBag,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			label: "待處理",
			label_en: "Pending",
			value: stats.pendingOrders,
			icon: Clock,
			color: "text-orange-600",
			bgColor: "bg-orange-50",
		},
		{
			label: "已完成",
			label_en: "Completed",
			value: stats.completedOrders,
			icon: CheckCircle,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			label: "總產品",
			label_en: "Total Products",
			value: stats.totalProducts,
			icon: Package,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-slate-800 mb-2">
						管理員儀表板
					</h1>
					<p className="text-slate-600 text-lg">
						Admin Dashboard - Welcome back
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{quickStats.map((stat, index) => (
						<Card
							key={index}
							className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-white"
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-slate-600 mb-1">
										{stat.label}
									</p>
									<p className="text-xs text-slate-500 mb-2">
										{stat.label_en}
									</p>
									<p className="text-3xl font-bold text-slate-800">
										{stat.value}
									</p>
								</div>
								<div
									className={`${stat.bgColor} p-4 rounded-xl`}
								>
									<stat.icon
										className={`w-7 h-7 ${stat.color}`}
									/>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Revenue Card */}
				<Card className="p-8 mb-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm opacity-90 mb-1">總收入 / Total Revenue</p>
							<p className="text-4xl font-bold">HK${stats.totalRevenue}</p>
							<p className="text-sm opacity-80 mt-2">已付款訂單累計</p>
						</div>
						<div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
							<DollarSign className="w-12 h-12" />
						</div>
					</div>
				</Card>

				{/* Main Actions */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-slate-800 mb-6">
						主要功能
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{mainActions.map((action, index) => (
							<Link key={index} href={action.href}>
								<Card
									className={`p-6 h-full hover:scale-[1.03] transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl`}
								>
									<div className="mb-4">
										<div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm w-fit">
											<action.icon className="w-7 h-7" />
										</div>
									</div>
									<h3 className="text-xl font-bold mb-1">
										{action.title}
									</h3>
									<p className="text-xs mb-3 opacity-90">
										{action.title_en}
									</p>
									<p className="text-sm text-white/90">
										{action.description}
									</p>
									<p className="text-xs text-white/70 mt-1">
										{action.description_en}
									</p>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
