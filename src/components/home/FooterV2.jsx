"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const FooterV2 = () => {
	const locale = useLocale();

	return (
		<footer className="bg-[#1C1F26] w-full text-white pt-8 pb-8 sm:pt-10 sm:pb-10 rounded-t-2xl sm:rounded-t-3xl md:rounded-t-[60px]">
			<div className="container px-4 py-5 sm:px-6 md:px-12 lg:px-16 xl:px-24 mx-auto max-w-full">
				{/* Top Row: Logo, Links, Socials */}
				<div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-col gap-4 w-full md:w-auto md:flex-row md:items-center md:gap-8">
						<Image
							src="/images/logo/logo-desktop.png"
							alt="HarmoniQ Logo"
							width={681}
							height={132}
							className="w-50 h-10"
							quality={100}
						/>
						<nav className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 lg:gap-8 text-sm text-white/90">
							<Link
								href="/customer/contact"
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN" ? "联系我们" : "聯絡我們"}
							</Link>
							<Link
								href="/customer/privacy"
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN" ? "隐私政策" : "隱私政策"}
							</Link>
							<Link
								href="/customer/terms"
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN" ? "用户条款" : "用戶條款"}
							</Link>
							<Link
								href="/customer/returns"
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN"
									? "退换货政策"
									: "退換貨政策"}
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
						<a
							href="https://www.facebook.com/profile.php?id=61578389876952"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-opacity hover:opacity-80"
							aria-label="Facebook"
						>
							<Image
								src="/images/footer/Facebook.png"
								alt=""
								width={40}
								height={40}
								className="w-8 h-8 sm:w-9 sm:h-9"
							/>
						</a>
						<a
							href="https://www.instagram.com/harmoniqbell_luckyshop/"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-opacity hover:opacity-80"
							aria-label="Instagram"
						>
							<Image
								src="/images/footer/Instagram.png"
								alt=""
								width={40}
								height={40}
								className="w-8 h-8 sm:w-9 sm:h-9"
							/>
						</a>
						<a
							href="https://www.threads.com/@harmoniqbell_luckyshop?hl=zh-hk"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-opacity hover:opacity-80"
							aria-label="Threads"
						>
							<Image
								src="/images/footer/Threads.png"
								alt=""
								width={40}
								height={40}
								className="w-8 h-8 sm:w-9 sm:h-9"
							/>
						</a>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="pt-6 sm:pt-8 mt-8 sm:mt-10 border-t border-white/20">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
						<p className="text-xs sm:text-sm text-white/60 order-2 md:order-1">
							© 2026 HarmoniQ.{" "}
							{locale === "zh-CN"
								? "保留所有权利"
								: "保留所有權利"}
							.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 order-1 md:order-2">
							{[
								{
									src: "/images/footer/payments/visa.svg",
									alt: "Visa",
								},
								{
									src: "/images/footer/payments/mastercard.svg",
									alt: "Mastercard",
								},
								{
									src: "/images/footer/payments/applepay.svg",
									alt: "Apple Pay",
								},
								{
									src: "/images/footer/payments/googlepay.svg",
									alt: "Google Pay",
								},
							].map((m) => (
								<div
									key={m.alt}
									className="bg-white rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-center h-[44px] sm:h-[52px]"
								>
									<Image
										src={m.src}
										alt={m.alt}
										width={90}
										height={56}
										className="w-full h-full object-contain"
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterV2;
