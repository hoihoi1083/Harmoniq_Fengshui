"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import LanguageToggle from "./LanguageToggle";
import RegionLanguageSelector from "./RegionLanguageSelector";
import useMobile from "../app/hooks/useMobile";
import useNavbarMobile from "../app/hooks/useNavbarMobile";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import UnlockButton from "./UnlockButton";
import Avatar from "./Avatar";

export default function Navbar({ from, backgroundColor = "transparent" }) {
	const t = useTranslations("Navigation");
	const t2 = useTranslations("home.hero");
	const router = useRouter();
	const pathname = usePathname();

	const isMobile = useMobile();
	const isNavbarMobile = useNavbarMobile();
	const { data: session, status } = useSession();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isLogined = status === "authenticated" && session?.user?.userId;
	const isLoading = status === "loading";

	const isHome = pathname === "/home";
	const isContact = pathname === "/customer/contact";
	const navTextColor = isContact
		? "#fff"
		: isNavbarMobile && isHome
			? "#fff"
			: "#000";

	const scrollToSection = (sectionId) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	const navigateToSection = (sectionId) => {
		// If we're on the home page, just scroll
		if (pathname === "/home") {
			scrollToSection(sectionId);
		} else {
			// If we're on another page, navigate to home page with hash
			router.push(`/home#${sectionId}`);
		}
	};

	// Handle scrolling when coming from another page with hash
	useEffect(() => {
		if (typeof window !== "undefined") {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				// Small delay to ensure the page has loaded
				setTimeout(() => {
					scrollToSection(hash);
				}, 100);
			}
		}
	}, [pathname]);

	return (
		<nav
			className={`${isHome && !isNavbarMobile ? "fixed" : "absolute"} top-0 left-0 right-0 z-[70] h-16 ${isHome ? "backdrop-blur-[3px]" : "backdrop-blur-[0px]"}  ${
				!isHome && !isContact ? "bg-white shadow-sm" : ""
			}`}
			style={{
				fontFamily: "Noto Serif TC, serif",
				backgroundColor:
					backgroundColor === "transparent"
						? "rgba(255, 255, 255, 0.1)"
						: `#${backgroundColor.replace("#", "")}`,
			}}
		>
			<div className="h-full px-4">
				<div className="flex items-center justify-between h-full mx-auto max-w-7xl">
					<div className="flex items-center gap-6">
						{/* Mobile: Hamburger + Logo on left, Desktop: Logo on left */}
						{isNavbarMobile ? (
							<div className="flex items-center gap-3">
								<button
									onClick={() =>
										setIsMobileMenuOpen(!isMobileMenuOpen)
									}
									className="p-2 rounded-md hover:bg-[#A3B116]"
									style={{ color: navTextColor }}
								>
									{isMobileMenuOpen ? (
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									) : (
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 6h16M4 12h16M4 18h16"
											/>
										</svg>
									)}
								</button>

								{/* Logo for Mobile */}
								<Link
									href="/home"
									className="relative z-10 flex items-center"
								>
									<Image
										src={
											navTextColor === "#fff"
												? "/images/logo/logo-white.png"
												: "/images/logo/logo-black.png"
										}
										alt="HarmoniQ Logo"
										width={32}
										height={32}
										className="w-8 h-8"
										style={{
											filter: "none",
											backfaceVisibility: "hidden",
											WebkitFontSmoothing: "antialiased",
										}}
										priority
									/>
								</Link>
							</div>
						) : (
							<Link
								href="/home"
								className="relative z-10 flex items-center gap-2"
							>
								<Image
									src={
										navTextColor === "#fff"
											? "/images/logo/logo-desktop.png"
											: "/images/logo/logo-desktop.png"
									}
									alt="HarmoniQ Logo"
									width={681}
									height={132}
									className="h-8 mx-2 w-auto"
									style={{
										filter: "none",
										backfaceVisibility: "hidden",
										WebkitFontSmoothing: "antialiased",
									}}
									quality={100}
									priority
								/>
							</Link>
						)}{" "}
						{/* Navigation Links */}
						{!isNavbarMobile && (
							<div className="flex items-center gap-10 ">
								<Link
									href="/home"
									className={`px-3 py-1 rounded-full transition-all font-noto-sans-hk duration-200 hover:opacity-80 ${
										isHome ? "bg-[#A3B116]" : ""
									}`}
									style={{
										color: isHome ? "#fff" : navTextColor,
									}}
								>
									{t("home")}
								</Link>
								<Link
									href="/"
									className={`px-3 py-1 rounded-full transition-all font-noto-sans-hk duration-200 hover:opacity-80 ${
										pathname === "/" ? "bg-[#A3B116]" : ""
									}`}
									style={{
										color:
											pathname === "/"
												? "#fff"
												: navTextColor,
									}}
								>
									{t("smartChat")}
								</Link>
								{/* <button
									onClick={() => navigateToSection("theory")}
									className="transition-colors cursor-pointer hover:opacity-80"
									style={{
										fontFamily: "Noto Serif TC, serif",
										color: navTextColor,
									}}
								>
									{t("theory")}
								</button> */}
								<Link
									href="/price"
									className={`px-3 py-1 rounded-full transition-all font-noto-sans-hk duration-200 hover:opacity-80 ${
										pathname === "/price"
											? "bg-[#A3B116]"
											: ""
									}`}
									style={{
										color:
											pathname === "/price"
												? "#fff"
												: navTextColor,
									}}
								>
									{t("pricing")}
								</Link>
								<button
									onClick={() => navigateToSection("faq")}
									className={`px-3 py-1 rounded-full transition-all duration-200 font-noto-sans-hk cursor-pointer hover:opacity-80 ${
										pathname === "/home" &&
										typeof window !== "undefined" &&
										window.location.hash === "#faq"
											? "bg-[#A3B116]"
											: ""
									}`}
									style={{
										color:
											pathname === "/home" &&
											typeof window !== "undefined" &&
											window.location.hash === "#faq"
												? "#fff"
												: navTextColor,
									}}
								>
									{t("faq")}
								</button>
							</div>
						)}
					</div>

					<div className="flex items-center md:space-x-6">
						{/* Mobile: Language Switcher and Avatar on right */}
						{isNavbarMobile ? (
							<div className="flex items-center space-x-3">
								{/* Language Switcher for Mobile */}
								<RegionLanguageSelector
									navTextColor={navTextColor}
									compact={true}
								/>

								{/* User Avatar/Login for Mobile */}
								{isLoading ? (
									<div
										className="w-6 h-6 border-2 rounded-full border-t-transparent animate-spin"
										style={{ borderColor: navTextColor }}
									></div>
								) : isLogined && from !== "login" ? (
									<Avatar />
								) : (
									<div>
										<Link
											className="block text-xs px-2 py-1 bg-[#B4B4B4] rounded-full hover:bg-[#B4B4B4] focus:outline-none focus:text-primary"
											href={"/auth/login"}
											style={{
												fontFamily:
													"Noto Serif TC, serif",
												fontWeight: "bold",
												color: "black",
											}}
										>
											{t2("login")}
										</Link>
									</div>
								)}
							</div>
						) : (
							<div className="flex items-center space-x-4">
								<RegionLanguageSelector
									navTextColor={navTextColor}
								/>
								{isLoading ? (
									<div
										className="w-6 h-6 border-2 rounded-full border-t-transparent animate-spin"
										style={{ borderColor: navTextColor }}
									></div>
								) : isLogined && from !== "login" ? (
									<Avatar />
								) : (
									<div>
										<Link
											className="block text-sm px-1 py-2  bg-[#B4B4B4] rounded-full hover:bg-[#B4B4B4] focus:outline-none focus:text-primary"
											href={"/auth/login"}
											style={{
												fontFamily:
													"Noto Serif TC, serif",
												fontWeight: "bold",
												color: "black",
											}}
										>
											{t2("login")}
										</Link>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{isNavbarMobile && isMobileMenuOpen && (
				<div className="absolute top-16 left-0 right-0 bg-white/90 backdrop-blur-sm  border-b shadow-lg z-[80]">
					<div className="px-4 py-2 space-y-2">
						<Link
							href="/home"
							className="block px-4 py-2 text-gray-800 transition-colors rounded hover:bg-gray-100"
							onClick={() => setIsMobileMenuOpen(false)}
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							{t("home")}
						</Link>
						<Link
							href="/"
							className="block px-4 py-2 text-gray-800 transition-colors rounded hover:bg-gray-100"
							onClick={() => setIsMobileMenuOpen(false)}
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							{t("smartChat")}
						</Link>
						<Link
							href="/price"
							className="block px-4 py-2 text-gray-800 transition-colors rounded hover:bg-gray-100"
							onClick={() => setIsMobileMenuOpen(false)}
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							{t("pricing")}
						</Link>
						<button
							onClick={() => {
								navigateToSection("faq");
								setIsMobileMenuOpen(false);
							}}
							className="block w-full px-4 py-2 text-left text-gray-800 transition-colors rounded hover:bg-gray-100"
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							{t("faq")}
						</button>
						<div className="pt-2 mt-2 border-t">
							<RegionLanguageSelector navTextColor="#000" />
						</div>
					</div>
				</div>
			)}

			{/* Mobile Menu Overlay */}
			{isNavbarMobile && isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-transparent bg-opacity-25 z-[75]"
					onClick={() => setIsMobileMenuOpen(false)}
				></div>
			)}
		</nav>
	);
}
