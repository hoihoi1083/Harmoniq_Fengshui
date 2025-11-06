"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

export default function BirthdayEntryPage({ params }) {
	const { locale } = use(params);
	const t = useTranslations("birthdayEntry");
	const searchParams = useSearchParams();
	const router = useRouter();
	const sessionId = searchParams.get("session_id");

	const [formData, setFormData] = useState({
		birthDate: "",
		birthTime: "",
		gender: "",
	});
	const [isVerifying, setIsVerifying] = useState(true);
	const [paymentVerified, setPaymentVerified] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Fetch and prefill user birthday data
	useEffect(() => {
		const fetchUserBirthday = async () => {
			try {
				const response = await fetch("/api/get-user-birthday");
				if (response.ok) {
					const data = await response.json();
					if (data.success && data.birthday) {
						setFormData((prev) => ({
							...prev,
							birthDate: data.birthday,
							birthTime: data.birthTime || "",
							gender: data.gender || prev.gender,
						}));
						console.log(
							"✅ Pre-filled birthday from database:",
							data.birthday,
							data.birthTime
						);
					}
				}
			} catch (error) {
				console.error("Error fetching user birthday:", error);
				// Don't show error to user, just fail silently
			}
		};

		fetchUserBirthday();
	}, []);

	// Verify payment on component mount
	useEffect(() => {
		const verifyPayment = async () => {
			if (!sessionId) {
				setError(t("invalidSession"));
				setIsVerifying(false);
				return;
			}

			try {
				const response = await fetch(`/api/verify-payment`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ sessionId }),
				});

				const data = await response.json();

				console.log("Payment verification response:", data);

				// Check for successful response (status: 0 means success in genSuccessData)
				if (data.status === 0 && data.data.payment_status === "paid") {
					setPaymentVerified(true);
				} else {
					setError(t("paymentFailed"));
				}
			} catch (err) {
				setError(t("verificationError"));
			}

			setIsVerifying(false);
		};

		verifyPayment();
	}, [sessionId, t]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.birthDate || !formData.gender) {
			setError(t("fillBirthDateAndGender"));
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			// Combine date and time for the report
			const birthDateTime = formData.birthTime
				? `${formData.birthDate}T${formData.birthTime}`
				: `${formData.birthDate}T12:00`; // Default to noon if no time provided

			// Redirect to report page with birth info
			router.push(
				`/report?birthDateTime=${encodeURIComponent(birthDateTime)}&gender=${formData.gender}&sessionId=${sessionId}`
			);
		} catch (err) {
			setError(t("submitError"));
			setIsSubmitting(false);
		}
	};

	if (isVerifying) {
		return (
			<div className="min-h-screen bg-[#EFEFEF] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B116] mx-auto mb-4"></div>
					<p className="text-lg text-gray-600">
						{t("verifyingPayment")}
					</p>
				</div>
			</div>
		);
	}

	if (!paymentVerified) {
		return (
			<div className="min-h-screen bg-[#EFEFEF]">
				<Navbar />
				<div className="container px-4 py-20 mx-auto">
					<div className="max-w-md p-8 mx-auto text-center bg-white rounded-lg shadow-lg">
						<div className="mb-4 text-6xl text-red-500">⚠️</div>
						<h1 className="mb-4 text-2xl font-bold text-gray-800">
							{t("paymentVerificationFailed")}
						</h1>
						<p className="mb-6 text-gray-600">{error}</p>
						<button
							onClick={() => router.push("/price")}
							className="bg-[#A3B116] text-white px-6 py-3 rounded-lg hover:bg-[#8B9914] transition-colors"
						>
							{t("returnToPurchase")}
						</button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#EFEFEF]">
			<Navbar />
			<div className="container px-4 py-20 mx-auto">
				<div className="max-w-md p-8 mx-auto bg-white shadow-lg rounded-xl">
					<div className="mb-8 text-center">
						<p className="text-gray-600">{t("fillDataPrompt")}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Birth Date */}
						<div>
							<label className="block mb-2 text-sm font-medium text-gray-700">
								{t("birthDate")}{" "}
								<span className="text-red-500">
									{t("required")}
								</span>
							</label>
							<input
								type="date"
								name="birthDate"
								value={formData.birthDate}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B116]"
								required
							/>
						</div>

						{/* Birth Time */}
						<div>
							<label className="block mb-2 text-sm font-medium text-gray-700">
								{t("birthTime")}{" "}
								<span className="text-gray-400">
									({t("optional")})
								</span>
							</label>
							<input
								type="time"
								name="birthTime"
								value={formData.birthTime}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B116]"
							/>
							<p className="mt-1 text-xs text-gray-500">
								{t("birthTimeHelp")}
							</p>
						</div>

						{/* Gender */}
						<div>
							<label className="block mb-4 text-sm font-medium text-gray-700">
								{t("gender")}{" "}
								<span className="text-red-500">
									{t("required")}
								</span>
							</label>
							<div className="flex justify-center gap-4">
								<div
									onClick={() =>
										setFormData((prev) => ({
											...prev,
											gender: "male",
										}))
									}
									className={`flex flex-col items-center p-4 cursor-pointer transition-all ${
										formData.gender === "male"
											? "border-[#A3B116] bg-[#A3B116]/10"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<img
										src="/images/hero/male.png"
										alt="Male"
										className="mb-2 w-30 h-30"
									/>
								</div>
								<div
									onClick={() =>
										setFormData((prev) => ({
											...prev,
											gender: "female",
										}))
									}
									className={`flex flex-col items-center p-4 cursor-pointer transition-all  ${
										formData.gender === "female"
											? "border-[#A3B116] bg-[#A3B116]/10"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<img
										src="/images/hero/female.png"
										alt="Female"
										className="mb-2 w-30 h-30"
									/>
								</div>
							</div>
						</div>

						{error && (
							<div className="p-4 border border-red-200 rounded-lg bg-red-50">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-[#A3B116] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#8B9914] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center">
									<div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
									{t("generatingReport")}
								</div>
							) : (
								t("generateReport")
							)}
						</button>
					</form>
				</div>
			</div>
			<Footer />
		</div>
	);
}
