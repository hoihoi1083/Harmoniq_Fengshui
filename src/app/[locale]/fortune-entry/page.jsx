"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

export default function FortuneEntryPage({ params }) {
	const { locale } = use(params);
	const t = useTranslations("fortuneEntry");
	const searchParams = useSearchParams();
	const router = useRouter();
	const sessionId = searchParams.get("session_id");
	const concernType = searchParams.get("concern") || "";
	const specificProblem = searchParams.get("specificProblem") || "";
	const fromChat = searchParams.get("fromChat") === "true";

	const [step, setStep] = useState(1); // 1: Gender & Birthday, 2: Problem
	const [formData, setFormData] = useState({
		gender: "",
		birthday: "",
		birthTime: "",
		problem: "",
	});
	const [isVerifying, setIsVerifying] = useState(true);
	const [paymentVerified, setPaymentVerified] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Pre-fill specific problem from chat context
	useEffect(() => {
		if (fromChat && specificProblem) {
			setFormData((prev) => ({
				...prev,
				problem: specificProblem,
			}));
			console.log("💬 Pre-filled problem from chat:", specificProblem);
		}
	}, [fromChat, specificProblem]);

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
							birthday: data.birthday,
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
				const response = await fetch("/api/verify-fortune-payment", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ sessionId }),
				});

				const data = await response.json();
				if (data.status === 0) {
					setPaymentVerified(true);
				} else {
					setError(t("paymentFailed"));
				}
			} catch (err) {
				setError(t("verificationError"));
			} finally {
				setIsVerifying(false);
			}
		};

		verifyPayment();
	}, [sessionId]);

	const getConcernTitle = () => {
		const concernMapping = {
			financial: t("concerns.financial"),
			love: t("concerns.love"),
			health: t("concerns.health"),
			career: t("concerns.career"),
		};
		return concernMapping[concernType] || t("concerns.fortune");
	};

	const handleNextStep = () => {
		if (!formData.gender || !formData.birthday) {
			setError(t("fillGenderBirthday"));
			return;
		}
		setError("");
		setStep(2);
	};

	const handlePrevStep = () => {
		setStep(1);
		setError("");
	};

	const handleNoSpecificProblem = () => {
		const generalProblem = t("generalAnalysis", {
			concernTitle: getConcernTitle(),
		});

		setFormData((prev) => ({
			...prev,
			problem: generalProblem,
		}));

		setIsSubmitting(true);

		// Auto submit after setting general problem
		setTimeout(() => {
			// Redirect to feng-shui report with parameters including session_id
			const reportParams = new URLSearchParams({
				session_id: sessionId, // Include session_id for payment verification
				birthday: formData.birthday,
				concern: getConcernTitle(), // Use Chinese concern title
				problem: generalProblem,
				gender: formData.gender,
			});

			// Add birth time if provided
			if (formData.birthTime) {
				reportParams.set("birthTime", formData.birthTime);
			}

			window.location.href = `/feng-shui-report?${reportParams.toString()}`;
		}, 100);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (step === 1) {
			handleNextStep();
			return;
		}

		if (!formData.problem.trim()) {
			setError(t("enterSpecificQuestion"));
			return;
		}

		setIsSubmitting(true);

		try {
			// Redirect to feng-shui report with parameters including session_id
			const reportParams = new URLSearchParams({
				session_id: sessionId, // Include session_id for payment verification
				birthday: formData.birthday,
				concern: getConcernTitle(), // Use Chinese concern title
				problem: formData.problem,
				gender: formData.gender,
			});

			// Add birth time if provided
			if (formData.birthTime) {
				reportParams.set("birthTime", formData.birthTime);
			}

			window.location.href = `/feng-shui-report?${reportParams.toString()}`;
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
						<div className="mb-4 text-6xl text-red-500">❌</div>
						<h1 className="mb-4 text-2xl font-bold text-gray-800">
							{t("paymentVerificationFailed")}
						</h1>
						<p className="mb-6 text-gray-600">{error}</p>
						<button
							onClick={() => router.push("/price")}
							className="px-6 py-3 text-white bg-[#A3B116] rounded-lg hover:bg-[#8B9914]"
						>
							{t("returnToPricing")}
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
						<p className="text-gray-600">
							{t("fillDataPrompt", {
								concernTitle: getConcernTitle(),
							})}
						</p>
					</div>

					{/* Progress Steps */}
					<div className="flex items-center mb-8">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-[#A3B116] text-white" : "bg-gray-200 text-gray-600"} text-sm font-medium`}
						>
							1
						</div>
						<div
							className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-[#A3B116]" : "bg-gray-200"}`}
						></div>
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-[#A3B116] text-white" : "bg-gray-200 text-gray-600"} text-sm font-medium`}
						>
							2
						</div>
					</div>

					<h2 className="mb-6 text-xl font-bold text-gray-800">
						{step === 1
							? t("basicInfo")
							: t("analysisQuestion", {
									concernTitle: getConcernTitle(),
								})}
					</h2>

					<form onSubmit={handleSubmit} className="space-y-6">
						{step === 1 && (
							<>
								{/* Gender Selection with Images */}
								<div>
									<label className="block mb-4 text-sm font-medium text-gray-700">
										{t("selectGender")}{" "}
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
												className="w-24 h-24 mb-2 sm:w-30 sm:h-30 md:w-30 md:h-30 lg:w-30 lg:h-30 xl:w-30 xl:h-30"
											/>
											<span className="text-sm font-medium text-gray-700">
												{t("male")}
											</span>
										</div>
										<div
											onClick={() =>
												setFormData((prev) => ({
													...prev,
													gender: "female",
												}))
											}
											className={`flex flex-col items-center p-4 cursor-pointer transition-allg ${
												formData.gender === "female"
													? "border-[#A3B116] bg-[#A3B116]/10"
													: "border-gray-200 hover:border-gray-300"
											}`}
										>
											<img
												src="/images/hero/female.png"
												alt="Female"
												className="w-24 h-24 mb-2 sm:w-30 sm:h-30 md:w-30 md:h-30 lg:w-30 lg:h-30 xl:w-30 xl:h-30"
											/>
											<span className="text-sm font-medium text-gray-700">
												{t("female")}
											</span>
										</div>
									</div>
								</div>

								{/* Birthday Field */}
								<div>
									<label className="block mb-2 text-sm font-medium text-gray-700">
										{t("birthDate")}{" "}
										<span className="text-red-500">
											{t("required")}
										</span>
									</label>
									<input
										type="date"
										name="birthday"
										value={formData.birthday}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												birthday: e.target.value,
											}))
										}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B116]"
									/>
								</div>

								{/* Birth Time Field */}
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
										value={formData.birthTime || ""}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												birthTime: e.target.value,
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B116]"
									/>
									<p className="mt-1 text-xs text-gray-500">
										{t("birthTimeHelp")}
										{t("birthTimeDefault")}
									</p>
								</div>
							</>
						)}

						{step === 2 && (
							<>
								{/* Problem/Question Field */}
								<div>
									<label className="block mb-2 text-sm font-medium text-gray-700">
										{t("specificQuestion")}{" "}
										<span className="text-red-500">
											{t("required")}
										</span>
									</label>
									<textarea
										name="problem"
										value={formData.problem}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												problem: e.target.value,
											}))
										}
										placeholder={t("questionPlaceholder", {
											concernTitle: getConcernTitle(),
										})}
										rows="4"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A3B116] resize-none"
									/>
									<p className="mt-1 text-xs text-gray-500">
										{t("detailedDescriptionHelp")}
									</p>
								</div>

								{/* Summary */}
								<div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
									<h3 className="mb-2 text-sm font-medium text-gray-700">
										{t("confirmData")}
									</h3>
									<p className="text-sm text-gray-600">
										{t("gender")}:{" "}
										{formData.gender === "male"
											? t("male")
											: t("female")}
									</p>
									<p className="text-sm text-gray-600">
										{t("birthDate")}: {formData.birthday}
									</p>
									{formData.birthTime && (
										<p className="text-sm text-gray-600">
											{t("birthTime")}:{" "}
											{formData.birthTime}
										</p>
									)}
								</div>
							</>
						)}

						{error && (
							<div className="p-4 border border-red-200 rounded-lg bg-red-50">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}

						{/* Action Buttons */}
						{step === 2 && (
							<div className="pt-4 space-y-3">
								{/* No specific problem button */}
								<button
									type="button"
									onClick={handleNoSpecificProblem}
									disabled={
										formData.problem.trim() !== "" ||
										isSubmitting
									}
									className="w-full px-4 py-2 text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{t("noSpecificProblem")}
								</button>
							</div>
						)}

						<div className="flex gap-3 pt-4">
							{step === 2 && (
								<button
									type="button"
									onClick={handlePrevStep}
									className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
								>
									{t("previousStep")}
								</button>
							)}
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 bg-[#A3B116] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#8B9914] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<div className="flex items-center justify-center">
										<div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
										{step === 1
											? t("nextStep")
											: t("generatingReport")}
									</div>
								) : step === 1 ? (
									t("nextStep")
								) : (
									t("generateReport")
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
			<Footer />
		</div>
	);
}
