"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";

const FooterV2 = () => {
	const locale = useLocale();

	const handleContactSubmit = () => {
		// Function to be implemented
		console.log("Contact submitted");
	};

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
							<a
								href={`/${locale}/about`}
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN" ? "关于我们" : "關於我們"}
							</a>
							<a
								href={`/${locale}/privacy`}
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN" ? "隐私政策" : "隱私政策"}
							</a>
							<a
								href={`/${locale}/terms`}
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN" ? "用户条款" : "用戶條款"}
							</a>
							<a
								href={`/${locale}/refunds`}
								className="hover:text-[#8B9F3A] transition-colors py-0.5"
							>
								{locale === "zh-CN"
									? "退换货政策"
									: "退換貨政策"}
							</a>
						</nav>
					</div>
					<div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
						<a
							href="https://facebook.com"
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
							href="https://instagram.com"
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
							href="https://www.threads.net"
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

				{/* Contact Row */}
				<div className="flex flex-col items-start gap-6 mt-8 sm:mt-10 md:mt-12 lg:flex-row lg:items-center lg:justify-between">
					<div className="w-full lg:w-auto">
						<div className="inline-block bg-[#9AA620] text-[#1C1F26] px-3 py-1.5 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
							{locale === "zh-CN" ? "联系我们：" : "聯絡我們："}
						</div>
						<p className="text-white/90 text-sm sm:text-base">
							{locale === "zh-CN" ? "电邮" : "電郵"}:
							info@gmail.com
						</p>
					</div>
					<div className="w-full max-w-full lg:max-w-[560px] rounded-xl sm:rounded-[20px] bg-[#2A2E36] p-4 sm:p-6">
						<div className="flex flex-col gap-3 sm:flex-row">
							<Input
								type="email"
								placeholder={
									locale === "zh-CN" ? "您的电邮" : "您的電郵"
								}
								className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base text-white bg-[#2A2E36] border border-white/80 rounded-full placeholder:text-white/70"
							/>
							<Button
								onClick={handleContactSubmit}
								className="h-11 sm:h-12 bg-[#9AA620] hover:bg-[#7E8B1D] text-[#1C1F26] rounded-full px-6 sm:px-8 font-semibold text-sm sm:text-base shrink-0"
							>
								{locale === "zh-CN" ? "联系我们" : "聯絡我們"}
							</Button>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="pt-6 sm:pt-8 mt-8 sm:mt-10 border-t border-white/20">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
						<p className="text-xs sm:text-sm text-white/60 order-2 md:order-1">
							© 2025 HarmoniQ.{" "}
							{locale === "zh-CN"
								? "保留所有权利"
								: "保留所有權利"}
							.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 order-1 md:order-2">
							{/* Visa */}
							<div className="bg-white rounded px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center min-w-[50px] h-[32px] sm:min-w-[60px] sm:h-[40px]">
								<svg
									viewBox="0 0 48 32"
									className="w-auto h-5 sm:h-6"
									fill="none"
								>
									<path
										d="M20.5 10.5L17.5 21.5H14.5L12.5 13C12.4 12.6 12.2 12.3 11.9 12.2C11.3 11.9 10.4 11.6 9.5 11.4L9.6 11H14.5C15.1 11 15.6 11.4 15.7 12L16.7 17.5L19.2 11H22.2L20.5 10.5ZM30.5 17.8C30.5 15.2 26.8 15 26.8 13.8C26.8 13.4 27.2 13 28.1 12.9C28.5 12.8 29.6 12.7 30.9 13.3L31.4 11.4C30.8 11.2 30 11 29 11C26.2 11 24.2 12.6 24.2 14.8C24.2 16.5 25.7 17.4 26.8 18C28 18.6 28.4 19 28.4 19.5C28.4 20.3 27.5 20.7 26.7 20.7C25.5 20.7 24.9 20.5 23.9 20L23.4 22C24.4 22.4 25.3 22.5 26.7 22.5C29.7 22.5 31.6 20.9 31.6 18.6L30.5 17.8ZM38.5 21.5H41L38.8 11H36.4C35.9 11 35.5 11.3 35.3 11.7L31.5 21.5H34.5L35.1 20H38.8L38.5 21.5ZM36.2 13.5L37.5 17.5H35.5L36.2 13.5ZM26.5 11L24.5 21.5H21.8L23.8 11H26.5Z"
										fill="#1434CB"
									/>
								</svg>
							</div>

							{/* Mastercard */}
							<div className="bg-white rounded px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center min-w-[50px] h-[32px] sm:min-w-[60px] sm:h-[40px]">
								<svg
									viewBox="0 0 48 32"
									className="w-auto h-5 sm:h-6"
									fill="none"
								>
									<circle
										cx="18"
										cy="16"
										r="10"
										fill="#EB001B"
									/>
									<circle
										cx="30"
										cy="16"
										r="10"
										fill="#F79E1B"
										fillOpacity="0.8"
									/>
								</svg>
							</div>

							{/* PayPal */}
							<div className="bg-white rounded px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center min-w-[50px] h-[32px] sm:min-w-[60px] sm:h-[40px]">
								<svg
									viewBox="0 0 48 32"
									className="w-auto h-5 sm:h-6"
									fill="none"
								>
									<path
										d="M20.5 9H15.5L12.5 23H16L18 13C18.2 11.9 19.1 11 20.2 11H23C25.2 11 26.5 12.3 26.5 14.5C26.5 16.7 24.8 18.5 22.5 18.5H21L20 23H22.5C27.2 23 31 19.2 31 14.5C31 9.8 27.2 9 24.5 9H20.5Z"
										fill="#003087"
									/>
									<path
										d="M17 16H14L12 23H15L17 16Z"
										fill="#009CDE"
									/>
								</svg>
							</div>

							{/* Apple Pay */}
							<div className="bg-white rounded px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center min-w-[50px] h-[32px] sm:min-w-[60px] sm:h-[40px]">
								<svg
									viewBox="0 0 48 32"
									className="w-auto h-5 sm:h-6"
									fill="none"
								>
									<path
										d="M16.5 11.5C17.2 10.6 17.7 9.3 17.5 8C16.4 8.1 15.1 8.8 14.3 9.7C13.6 10.5 13 11.8 13.2 13.1C14.4 13.2 15.7 12.5 16.5 11.5ZM17.5 13.3C15.8 13.2 14.3 14.3 13.5 14.3C12.7 14.3 11.4 13.4 10.1 13.4C8.4 13.4 6.8 14.4 5.9 16C4.1 19.1 5.4 23.7 7.1 26.2C7.9 27.4 8.9 28.7 10.1 28.7C11.4 28.6 11.9 27.9 13.4 27.9C14.9 27.9 15.3 28.7 16.7 28.7C18.1 28.7 19 27.5 19.8 26.3C20.7 24.9 21.1 23.6 21.1 23.5C21.1 23.5 18.4 22.4 18.4 19.3C18.4 16.7 20.5 15.5 20.6 15.4C19.4 13.6 17.6 13.4 17.5 13.3Z"
										fill="#000000"
									/>
									<path
										d="M28 13.5H31.5C33.4 13.5 34.5 14.6 34.5 16.2C34.5 17.8 33.3 19 31.4 19H29.5V22H28V13.5ZM29.5 17.8H31.2C32.4 17.8 33 17.2 33 16.2C33 15.2 32.4 14.7 31.2 14.7H29.5V17.8ZM35.5 19.8C35.5 18.3 36.6 17.3 38.5 17.3C39.2 17.3 39.8 17.4 40.2 17.6V17.3C40.2 16.4 39.7 15.9 38.7 15.9C38 15.9 37.5 16.2 37.3 16.6H36C36.2 15.4 37.3 14.6 38.8 14.6C40.5 14.6 41.5 15.5 41.5 17V22H40.2V21.1H40.1C39.7 21.7 39 22 38.2 22C36.8 22 35.5 21.2 35.5 19.8ZM40.2 19.2V18.9C39.9 18.7 39.4 18.6 38.8 18.6C37.8 18.6 37.1 19 37.1 19.7C37.1 20.4 37.7 20.8 38.5 20.8C39.5 20.8 40.2 20.2 40.2 19.2ZM42.5 26V24.8C42.7 24.9 43 24.9 43.2 24.9C44 24.9 44.4 24.6 44.7 23.7L44.8 23.4L42 14.8H43.6L45.5 21.7H45.6L47.5 14.8H49L46.2 23.8C45.6 25.5 44.9 26 43.3 26C43.1 26 42.7 26 42.5 26Z"
										fill="#000000"
									/>
								</svg>
							</div>

							{/* Google Pay */}
							<div className="bg-white rounded px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center min-w-[50px] h-[32px] sm:min-w-[60px] sm:h-[40px]">
								<svg
									viewBox="0 0 48 32"
									className="w-auto h-5 sm:h-6"
									fill="none"
								>
									<path
										d="M22.5 16.5V20H27.3C27.1 21.3 25.9 23.8 22.5 23.8C19.5 23.8 17.1 21.3 17.1 18.2C17.1 15.1 19.5 12.6 22.5 12.6C24.2 12.6 25.4 13.3 26.1 14L28.9 11.3C27.2 9.7 25 8.8 22.5 8.8C17.5 8.8 13.5 12.8 13.5 17.8C13.5 22.8 17.5 26.8 22.5 26.8C27.7 26.8 31 23.3 31 18.3C31 17.6 30.9 17.1 30.8 16.5H22.5Z"
										fill="#4285F4"
									/>
									<path
										d="M36 13.5H34V11.5H32V13.5H30V15.5H32V17.5H34V15.5H36V13.5Z"
										fill="#EA4335"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterV2;
