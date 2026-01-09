"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import ShopNavbar from "@/components/ShopNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";

export default function CategoriesPage() {
	const params = useParams();
	const locale = params.locale;

	const categories = [
		{
			id: "all",
			name: locale === "zh-CN" ? "全部商品" : "全部商品",
			image: "/images/shop-home/crystal.png",
			aspectRatio: "1368 / 578",
		},
		{
			id: "earring",
			name: locale === "zh-CN" ? "耳饰" : "耳飾",
			image: "/images/shop-home/earring.png",
			aspectRatio: "814 / 578",
		},
		{
			id: "bracelet",
			name: locale === "zh-CN" ? "手串" : "手串",
			image: "/images/shop-home/bracelet.png",
			aspectRatio: "1368 / 578",
		},
		{
			id: "necklace",
			name: locale === "zh-CN" ? "项链" : "項鏈",
			image: "/images/shop-home/bracelet.png",
			aspectRatio: "1368 / 578",
		},
		{
			id: "feng-shui",
			name: locale === "zh-CN" ? "风水摆件" : "風水擺件",
			image: "/images/shop-home/fengshuiproduct.png",
			aspectRatio: "1368 / 578",
		},
		{
			id: "ring",
			name: locale === "zh-CN" ? "戒指" : "戒指",
			image: "/images/shop-home/ring.png",
			aspectRatio: "814 / 578",
		},
		{
			id: "pendant",
			name: locale === "zh-CN" ? "吊坠" : "吊墜",
			image: "/images/shop-home/earring.png",
			aspectRatio: "814 / 578",
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<ShopNavbar />

			<div className="container px-4 mx-auto py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
					<Link href={`/${locale}`} className="hover:text-[#8B9F3A]">
						Home
					</Link>
					<ChevronRight className="w-4 h-4" />
					<Link href={`/${locale}/shop`} className="hover:text-[#8B9F3A]">
						Shop
					</Link>
					<ChevronRight className="w-4 h-4" />
					<span className="text-gray-900">
						{locale === "zh-CN" ? "分类" : "分類"}
					</span>
				</div>

				{/* Page Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
						{locale === "zh-CN" ? "浏览分类" : "瀏覽分類"}
					</h1>
					<p className="text-gray-600 text-lg max-w-2xl mx-auto">
						{locale === "zh-CN"
							? "探索我们精心策划的水晶和风水产品系列"
							: "探索我們精心策劃的水晶和風水產品系列"}
					</p>
				</div>

				{/* Categories Grid */}
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
						{categories.map((category) => (
							<Link
								key={category.id}
								href={`/${locale}/shop/all`}
								onClick={() => {
									// Store the selected category in sessionStorage
									if (typeof window !== 'undefined' && category.id !== 'all') {
										sessionStorage.setItem('selectedCategory', category.id);
									}
								}}
								className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
							>
								<div
									className="relative w-full overflow-hidden"
									style={{ aspectRatio: category.aspectRatio }}
								>
									<Image
										src={category.image}
										alt={category.name}
										fill
										className="object-cover group-hover:scale-110 transition-transform duration-500"
									/>
									{/* Overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
								{/* Category Name */}
								<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
									<div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 group-hover:bg-[#8B9F3A] transition-colors duration-300">
										<h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors">
											{category.name}
										</h3>
										<div className="flex items-center gap-2 mt-2 text-gray-600 group-hover:text-white transition-colors">
											<span className="text-sm">
												{locale === "zh-CN" ? "查看商品" : "查看商品"}
											</span>
											<ChevronRight className="w-4 h-4" />
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
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
								<Input
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
					<div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
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

					<div className="border-t border-gray-700 pt-8 mt-8">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-gray-400 text-sm">
								© 2025 HarmoniQ. {locale === "zh-CN" ? "保留所有权利" : "保留所有權利"}.
							</p>
							<div className="flex gap-2 items-center">
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
