"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RegionLanguageSelector from "@/components/RegionLanguageSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ShoppingCart,
	User,
	Search,
	LogOut,
	Sparkles,
	X,
	Menu,
} from "lucide-react";

export default function ShopNavbar({ onSearch, cartCount }) {
	const { data: session } = useSession();
	const locale = useLocale();
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showPromoBanner, setShowPromoBanner] = useState(true);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
		if (onSearch) {
			onSearch(value);
		}
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			const url = `/${locale}/shop/all?search=${encodeURIComponent(searchTerm.trim())}`;
			console.log(
				"🔍 ShopNavbar - Searching for:",
				searchTerm.trim(),
				"URL:",
				url,
			);
			router.push(url);
		}
	};

	return (
		<>
			{/* Promotional Banner */}

			{/* Main Navbar */}
			<nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
				<div className="container mx-auto px-1 sm:px-6">
					<div className="flex items-center justify-between h-14 sm:h-20">
						{/* Mobile: Hamburger + Logo. Desktop: Logo only (links to shop). */}
						<div className="flex items-center gap-1 min-w-0">
							{/* Hamburger - mobile only */}
							<button
								type="button"
								onClick={() => setMobileMenuOpen((o) => !o)}
								className="md:hidden pl-2 pr-0 rounded-md hover:bg-gray-100 text-gray-700 transition-colors shrink-0"
								aria-label={
									locale === "zh-CN" ? "菜单" : "選單"
								}
							>
								<Menu className="w-6 h-6" />
							</button>
							<Link
								href={`/${locale}/home`}
								className="flex items-center pr-5 hover:opacity-80 transition-opacity shrink-0"
							>
								<Image
									src="/images/logo/logo-desktop.png"
									alt="HarmoniQ Logo"
									width={681}
									height={132}
									className="h-6 w-auto sm:h-7 md:h-8"
									style={{
										filter: "none",
										backfaceVisibility: "hidden",
										WebkitFontSmoothing: "antialiased",
									}}
									quality={100}
									priority
								/>
							</Link>
						</div>

						{/* Navigation Links - desktop only */}
						<div className="hidden md:flex items-center gap-8">
							<Link
								href={`/${locale}/home`}
								className="text-gray-700 hover:text-[#6B8E23] font-medium transition-colors whitespace-nowrap"
							>
								首頁
							</Link>
							<Link
								href={`/${locale}`}
								className="text-gray-700 hover:text-[#6B8E23] font-medium transition-colors whitespace-nowrap"
							>
								風鈴資訊室
							</Link>
							<Link
								href={`/${locale}/shop/all`}
								className="text-gray-700 hover:text-[#6B8E23] font-medium transition-colors whitespace-nowrap"
							>
								風鈴商店
							</Link>
							<Link
								href={`/${locale}/price`}
								className="text-gray-700 hover:text-[#6B8E23] font-medium transition-colors whitespace-nowrap"
							>
								測算報告定價
							</Link>
						</div>

						{/* Search Bar */}
						<div className="hidden lg:flex flex-1 max-w-md mx-8">
							<form
								onSubmit={handleSearchSubmit}
								className="relative w-full"
							>
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<Input
									type="text"
									placeholder={
										locale === "zh-CN"
											? "搜索产品..."
											: "搜索產品..."
									}
									value={searchTerm}
									onChange={handleSearch}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSearchSubmit(e);
										}
									}}
									className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-[#6B8E23] rounded-full transition-all"
								/>
							</form>
						</div>

						{/* Right Actions: on mobile include Search icon */}
						<div className="flex items-center gap-2 sm:gap-4">
							{/* Mobile: Search icon to toggle search bar */}
							<button
								type="button"
								onClick={() => setMobileSearchOpen((o) => !o)}
								className="lg:hidden p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
								aria-label={
									locale === "zh-CN" ? "搜索" : "搜尋"
								}
							>
								<Search className="w-6 h-6 text-[#6B8E23]" />
							</button>
							{/* Region / Language: 中(CNY) · 港(HKD) · 台(TWD) */}
							<RegionLanguageSelector
								navTextColor="#1f2937"
								compact={true}
							/>

							{/* Cart */}
							<Link href={`/${locale}/cart`}>
								<Button
									variant="ghost"
									size="icon"
									className="relative hover:bg-gray-100 rounded-full"
								>
									<ShoppingCart className="w-6 h-6 text-[#6B8E23]" />
									{cartCount > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
											{cartCount}
										</span>
									)}
								</Button>
							</Link>

							{/* User Account: avatar when logged in, else user icon */}
							<div className="relative">
								<Button
									variant="ghost"
									size="icon"
									className="hover:bg-gray-100 rounded-full p-0 overflow-hidden"
									onClick={() =>
										setShowUserMenu(!showUserMenu)
									}
								>
									{session?.user ? (
										session.user.image ? (
											<span className="relative block w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
												<Image
													src={session.user.image}
													alt=""
													width={32}
													height={32}
													className="object-cover w-full h-full"
													unoptimized
												/>
											</span>
										) : (
											<span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6B8E23] text-white text-sm font-semibold shrink-0">
												{(
													session.user.name ||
													session.user.email ||
													"?"
												)
													.slice(0, 1)
													.toUpperCase()}
											</span>
										)
									) : (
										<User className="w-6 h-6 text-[#6B8E23]" />
									)}
								</Button>

								{/* User Dropdown Menu */}
								{showUserMenu && (
									<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
										{session?.user ? (
											<>
												<div className="px-4 py-3 border-b border-gray-100">
													<p className="text-sm font-medium text-gray-900 truncate">
														{session.user.email}
													</p>
												</div>
												<Link
													href={`/${locale}/orders`}
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
													onClick={() =>
														setShowUserMenu(false)
													}
												>
													{locale === "zh-CN"
														? "我的订单"
														: "我的訂單"}
												</Link>
												{session?.user?.role ===
													"admin" && (
													<Link
														href={`/${locale}/admin/shop`}
														className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
														onClick={() =>
															setShowUserMenu(
																false,
															)
														}
													>
														{locale === "zh-CN"
															? "商品管理"
															: "商品管理"}
													</Link>
												)}
												<button
													onClick={() => {
														signOut();
														setShowUserMenu(false);
													}}
													className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
												>
													<LogOut className="w-4 h-4" />
													{locale === "zh-CN"
														? "登出"
														: "登出"}
												</button>
											</>
										) : (
											<Link
												href={`/${locale}/auth/login`}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
												onClick={() =>
													setShowUserMenu(false)
												}
											>
												{locale === "zh-CN"
													? "登录"
													: "登入"}
											</Link>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Mobile hamburger menu panel */}
					{mobileMenuOpen && (
						<div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
							<div className="container mx-auto px-4 py-3 space-y-1">
								<Link
									href={`/${locale}/home`}
									className="block px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									首頁
								</Link>
								<Link
									href={`/${locale}`}
									className="block px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									風鈴資訊室
								</Link>
								<Link
									href={`/${locale}/shop/all`}
									className="block px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									風鈴商店
								</Link>
								<Link
									href={`/${locale}/price`}
									className="block px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									測算報告定價
								</Link>
							</div>
						</div>
					)}

					{/* Mobile Search Bar - shown when search icon is toggled */}
					<div
						className={`lg:hidden overflow-hidden transition-all duration-200 ${mobileSearchOpen ? "pb-4 max-h-20 opacity-100" : "max-h-0 opacity-0 pb-0"}`}
					>
						<form
							onSubmit={handleSearchSubmit}
							className="relative w-full"
						>
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<Input
								type="text"
								placeholder={
									locale === "zh-CN"
										? "搜索产品..."
										: "搜索產品..."
								}
								value={searchTerm}
								onChange={handleSearch}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSearchSubmit(e);
									}
								}}
								className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-[#6B8E23] rounded-full"
							/>
						</form>
					</div>
				</div>

				{/* Click outside to close user menu or mobile menu */}
				{(showUserMenu || mobileMenuOpen) && (
					<div
						className="fixed inset-0 z-40"
						onClick={() => {
							setShowUserMenu(false);
							setMobileMenuOpen(false);
						}}
					/>
				)}
			</nav>
		</>
	);
}
