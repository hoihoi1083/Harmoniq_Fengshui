"use client";

import { useState, use } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { AntdSpin } from "antd-spin";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

export default function LoginPage({ searchParams }) {
	const router = useRouter();
	const t = useTranslations("login");
	const t2 = useTranslations("toast");
	const params = use(searchParams);

	const [isLoading, setIsLoading] = useState(false);
	const [showEmailLogin, setShowEmailLogin] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});

	const handleSignIn = async (provider) => {
		setIsLoading(true);
		toast.info(t2("loading"), { autoClose: 5000 });
		try {
			await signIn(provider, {
				redirect: true,
				callbackUrl: "/price", // Redirect to price page after login
			});
			setIsLoading(false);
		} catch (error) {
			console.error(`Error signing in with ${provider}:`, error);
			setIsLoading(false);
			toast.error(t("loginFailed"));
		}
	};

	const handleEmailLogin = async (e) => {
		e.preventDefault();
		setErrors({});
		if (!formData.email || !formData.password) {
			setErrors({ general: t("fillAllFields") });
			return;
		}
		setIsLoading(true);
		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
				callbackUrl: "/price", // Redirect to price page after login
			});

			if (result?.error) {
				setErrors({ general: t("invalidCredentials") });
				toast.error(t("loginFailedCheckCredentials"));
			} else {
				toast.success(t("loginSuccess"));
				router.push("/price");
			}
		} catch (error) {
			console.error("Login error:", error);
			setErrors({ general: t("loginFailedTryAgain") });
			toast.error(t("loginFailedTryAgain"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar from="login" />
			<AntdSpin
				spinning={isLoading}
				fullscreen={true}
				tip={t2("loading2")}
				className="bg-[#fff9]"
			/>
			<div className="flex flex-col items-center justify-center px-6 py-12 mx-auto mt-10 bg-white md:bg-gray-50">
				<div
					className="w-full h-screen p-10 space-y-8 bg-white rounded-[40px] md:w-100 md:h-auto"
					style={{ boxShadow: "0 4px 5.8px rgba(0, 0, 0, 0.4)" }}
				>
					<div className="flex flex-col items-center">
						<div className="flex items-center gap-2">
							<Image
								src="/images/logo/logo-black.png"
								alt="HarmoniQ Logo"
								width={32}
								height={32}
								className="w-8 h-8"
							/>
							<span
								className="text-2xl font-bold"
								style={{
									fontFamily: "Noto Serif TC, serif",
									color: "#000",
								}}
							>
								HarmoniQ
							</span>
						</div>
						<p className="mt-5 text-sm text-center text-black">
							{showEmailLogin ? t("emailLoginTitle") : t("tip1")}
						</p>
					</div>

					{!showEmailLogin ? (
						<div className="mt-8 space-y-4">
							{/* OAuth Buttons */}
							<button
								onClick={() => handleSignIn("google")}
								disabled={isLoading}
								className={`cursor-pointer flex items-center justify-center w-full px-4 py-3 font-medium text-black bg-white border border-black transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-50 ${isLoading ? "opacity-50" : ""}`}
							>
								<svg
									className="w-5 h-5 mr-2"
									viewBox="0 0 24 24"
								>
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								{t("Google")}
							</button>{" "}
							<button
								onClick={() => handleSignIn("apple")}
								disabled={isLoading}
								className={`cursor-pointer flex items-center justify-center w-full px-4 py-3 font-medium text-black bg-white border border-black transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-50 ${isLoading ? "opacity-50" : ""}`}
							>
								<svg
									className="w-5 h-5 mr-2 icon"
									viewBox="0 0 1024 1024"
								>
									<path
										d="M505.173333 238.933333c126.293333 0 221.866667-95.573333 221.866667-221.866666 0-10.24-10.24-17.066667-17.066667-17.066667-126.293333 0-221.866667 95.573333-221.866666 221.866667 0 10.24 6.826667 17.066667 17.066666 17.066666zM911.36 720.213333c-3.413333-3.413333-6.826667-6.826667-10.24-6.826666-78.506667-13.653333-139.946667-85.333333-139.946667-167.253334 0-68.266667 40.96-129.706667 105.813334-157.013333 3.413333-3.413333 10.24-6.826667 10.24-10.24s0-10.24-3.413334-13.653333c-51.2-68.266667-119.466667-92.16-163.84-92.16-40.96 0-75.093333 10.24-105.813333 20.48-30.72 6.826667-58.026667 13.653333-81.92 13.653333-27.306667 0-58.026667-6.826667-88.746667-17.066667-37.546667-6.826667-78.506667-17.066667-116.053333-17.066666-85.333333 0-204.8 109.226667-204.8 307.2s133.12 443.733333 238.933333 443.733333c58.026667 0 92.16-13.653333 119.466667-23.893333 17.066667-6.826667 34.133333-10.24 51.2-10.24s30.72 6.826667 51.2 10.24c27.306667 10.24 61.44 23.893333 119.466667 23.893333 85.333333 0 174.08-150.186667 218.453333-290.133333 3.413333-3.413333 0-6.826667 0-13.653334z"
										fill="#000000"
									/>
								</svg>
								{t("Apple")}
							</button>
							{/* Divider */}
							<div className="flex items-center my-6">
								<div className="flex-1 border-t border-gray-300"></div>
								<span className="px-4 text-sm text-gray-500">
									{t("or")}
								</span>
								<div className="flex-1 border-t border-gray-300"></div>
							</div>
							{/* Email Login Button */}
							<button
								onClick={() => setShowEmailLogin(true)}
								disabled={isLoading}
								className="flex items-center justify-center w-full px-4 py-3 font-medium text-[#086E56] bg-white border-2 border-[#086E56] transition-colors rounded-full hover:bg-[#086E56] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
							>
								<svg
									className="w-5 h-5 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								{t("emailLogin")}
							</button>
							{/* Register Link */}
							<div className="text-center">
								<p className="text-sm text-gray-600">
									{t("noAccount")}{" "}
									<Link
										href="/auth/register"
										className="text-[#086E56] hover:text-[#25826D] font-medium underline"
									>
										{t("registerNow")}
									</Link>
								</p>
							</div>
						</div>
					) : (
						/* Email Login Form */
						<form
							onSubmit={handleEmailLogin}
							className="mt-8 space-y-4"
						>
							{errors.general && (
								<div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
									{errors.general}
								</div>
							)}

							<div>
								<input
									type="email"
									name="email"
									placeholder={t("emailPlaceholder")}
									value={formData.email}
									onChange={handleInputChange}
									disabled={isLoading}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086E56] focus:border-[#086E56] disabled:opacity-50"
									required
								/>
								{errors.email && (
									<p className="mt-1 text-sm text-red-600">
										{errors.email}
									</p>
								)}
							</div>

							<div>
								<input
									type="password"
									name="password"
									placeholder={t("passwordPlaceholder")}
									value={formData.password}
									onChange={handleInputChange}
									disabled={isLoading}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086E56] focus:border-[#086E56] disabled:opacity-50"
									required
								/>
								{errors.password && (
									<p className="mt-1 text-sm text-red-600">
										{errors.password}
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full px-4 py-3 font-medium text-white bg-[#086E56] transition-colors rounded-full hover:bg-[#25826D] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
							>
								{isLoading ? t("loggingIn") : t("login")}
							</button>

							{/* Back Button */}
							<button
								type="button"
								onClick={() => {
									setShowEmailLogin(false);
									setFormData({ email: "", password: "" });
									setErrors({});
								}}
								disabled={isLoading}
								className="w-full px-4 py-3 font-medium text-[#086E56] bg-white border border-gray-300 transition-colors rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
							>
								{t("back")}
							</button>

							{/* Register Link */}
							<div className="text-center">
								<p className="text-sm text-gray-600">
									{t("noAccount")}{" "}
									<Link
										href="/auth/register"
										className="text-[#086E56] hover:text-[#25826D] font-medium underline"
									>
										{t("registerNow")}
									</Link>
								</p>
							</div>
						</form>
					)}

					<div className="mt-4 text-sm text-center text-gray-400">
						{t("tip2Before")}
						<Link
							href="/terms"
							className="text-[#086E56] hover:text-[#25826D] underline"
						>
							{t("tip2Terms")}
						</Link>
						{t("tip2And")}
						<Link
							href="/privacy"
							className="text-[#086E56] hover:text-[#25826D] underline"
						>
							{t("tip2Privacy")}
						</Link>
						{t("tip2After")}
					</div>
				</div>
			</div>
		</div>
	);
}
