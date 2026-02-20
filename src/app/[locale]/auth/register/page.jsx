"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShopNavbar from "@/components/ShopNavbar";
import { AntdSpin } from "antd-spin";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
	const router = useRouter();
	const t = useTranslations("register");
	const t2 = useTranslations("toast");
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});

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

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t("validation.nameRequired");
		}

		if (!formData.email.trim()) {
			newErrors.email = t("validation.emailRequired");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t("validation.emailInvalid");
		}

		if (!formData.password) {
			newErrors.password = t("validation.passwordRequired");
		} else if (formData.password.length < 8) {
			newErrors.password = t("validation.passwordMinLength");
		} else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password = t("validation.passwordFormat");
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = t("validation.confirmPasswordRequired");
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = t("validation.passwordMismatch");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			// Register user
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(t("messages.registerSuccess"));

				// Auto login after successful registration
				const result = await signIn("credentials", {
					email: formData.email,
					password: formData.password,
					redirect: false,
				});

				if (result?.error) {
					toast.warning(t("messages.registerSuccessLoginFailed"));
					router.push("/auth/login");
				} else {
					toast.success(t("messages.registerAndLoginSuccess"));
					router.push("/");
				}
			} else {
				if (data.message.includes("already exists")) {
					setErrors({ email: t("validation.emailExists") });
				} else {
					setErrors({
						general: data.message || t("messages.registerFailed"),
					});
				}
				toast.error(data.message || t("messages.registerFailed"));
			}
		} catch (error) {
			console.error("Registration error:", error);
			setErrors({ general: t("messages.registerFailed") });
			toast.error(t("messages.registerFailed"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ShopNavbar />
			<AntdSpin
				spinning={isLoading}
				fullscreen={true}
				tip={t2("processing")}
				className="bg-[#fff9]"
			/>
			<div className="flex flex-col items-center justify-center px-6 py-12 mx-auto bg-secondary md:bg-gray-50">
				<div className="w-full h-screen p-10 space-y-8 bg-secondary md:w-100 md:shadow-lg md:h-auto">
					<div className="flex flex-col items-center">
						<h1 className="text-5xl font-bold text-primary">
							HarmoniQ
						</h1>
						<p className="mt-16 text-[#086E56] text-sm text-center">
							{t("title")}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="mt-8 space-y-4">
						{errors.general && (
							<div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
								{errors.general}
							</div>
						)}

						<div>
							<input
								type="text"
								name="name"
								placeholder={t("form.namePlaceholder")}
								value={formData.name}
								onChange={handleInputChange}
								disabled={isLoading}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086E56] focus:border-[#086E56] disabled:opacity-50"
								required
							/>
							{errors.name && (
								<p className="mt-1 text-sm text-red-600">
									{errors.name}
								</p>
							)}
						</div>

						<div>
							<input
								type="email"
								name="email"
								placeholder={t("form.emailPlaceholder")}
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
								placeholder={t("form.passwordPlaceholder")}
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

						<div>
							<input
								type="password"
								name="confirmPassword"
								placeholder={t(
									"form.confirmPasswordPlaceholder"
								)}
								value={formData.confirmPassword}
								onChange={handleInputChange}
								disabled={isLoading}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086E56] focus:border-[#086E56] disabled:opacity-50"
								required
							/>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600">
									{errors.confirmPassword}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full px-4 py-3 font-medium text-white bg-[#086E56] transition-colors rounded-full hover:bg-[#25826D] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
						>
							{isLoading
								? t("form.registering")
								: t("form.register")}
						</button>

						{/* Login Link */}
						<div className="text-center">
							<p className="text-sm text-gray-600">
								{t("haveAccount")}{" "}
								<Link
									href="/auth/login"
									className="text-[#086E56] hover:text-[#25826D] font-medium underline"
								>
									{t("loginNow")}
								</Link>
							</p>
						</div>
					</form>

					<div className="mt-4 text-sm text-center text-gray-400">
						{t("termsAgreement")}
					</div>
				</div>
			</div>
		</div>
	);
}
