"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import getWuxingData from "@/lib/nayin";

const years = Array.from({ length: new Date().getFullYear() - 1926 + 1 }, (_, i) => 1926 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i + 1);

const UploadPersonal = () => {
	const t = useTranslations("upload");
	const params = useParams();
	const locale = params?.locale || "zh-TW";
	const [gender, setGender] = useState("");
	const [year, setYear] = useState("");
	const [month, setMonth] = useState("");
	const [day, setDay] = useState("");
	const [hour, setHour] = useState("");
	const [loading, setLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { data: session, status } = useSession();
	const { userData, forceRefresh } = useUser();

	// Form validation function
	const validateForm = () => {
		const missingFields = [];

		if (!gender) missingFields.push(t("gender"));
		if (!year) missingFields.push(t("year"));
		if (!month) missingFields.push(t("month"));
		if (!day) missingFields.push(t("day"));
		if (!hour) missingFields.push(t("hour"));

		if (missingFields.length > 0) {
			const message =
				t("pleaseCompleteFields") + ": " + missingFields.join(", ");
			toast.warning(message);
			return false;
		}

		return true;
	};

	// Save form data to localStorage
	const saveFormData = () => {
		try {
			const formData = {
				gender,
				year,
				month,
				day,
				hour,
			};
			localStorage.setItem(
				"personalReportFormData",
				JSON.stringify(formData)
			);
			console.log("Personal form data saved to localStorage");
		} catch (error) {
			console.error("Error saving form data:", error);
		}
	};

	// Load form data from localStorage
	const loadFormData = () => {
		try {
			const savedData = localStorage.getItem("personalReportFormData");
			if (savedData) {
				const formData = JSON.parse(savedData);
				setGender(formData.gender || "");
				setYear(formData.year || "");
				setMonth(formData.month || "");
				setDay(formData.day || "");
				setHour(formData.hour || "");
				console.log("Personal form data loaded from localStorage");
			}
		} catch (error) {
			console.error("Error loading form data:", error);
		}
	};

	// Clear saved data
	const clearSavedData = () => {
		localStorage.removeItem("personalReportFormData");
		sessionStorage.removeItem("personalReportUserData");
		console.log("Personal saved data cleared");
	};

	// Enhanced initialization effect
	useEffect(() => {
		const initializeData = async () => {
			if (isInitialized) return;

			console.log(
				"Initializing personal component, loading saved data..."
			);
			console.log("Session status:", status);

			loadFormData();
			setIsInitialized(true);
		};

		initializeData();
	}, []);

	// Save form data whenever it changes
	useEffect(() => {
		if (isInitialized && (gender || year || month || day || hour)) {
			saveFormData();
		}
	}, [gender, year, month, day, hour, isInitialized]);

	const handleStart = async () => {
		if (isSubmitting) return; // Prevent double submission
		setIsSubmitting(true);
		setLoading(true);

		try {
			// Validate form first
			if (!validateForm()) {
				return;
			}

			// CLEAR ALL OLD DATA to prevent conflicts
			console.log("🧹 Clearing all old saved data...");
			localStorage.removeItem("personalReportFormData");
			sessionStorage.removeItem("personalReportUserData");

			const birthDateTime = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:00`;

			// Generate fresh user data with current form input (personal report only needs gender and birth date)
			const userData = {
				gender,
				birthDateTime,
				reportType: "personal", // Mark as personal report
			};

			// Save FRESH data to sessionStorage (UserContext will prioritize this)
			sessionStorage.setItem(
				"personalReportUserData",
				JSON.stringify(userData)
			);
			console.log(
				"💾 Saved FRESH personal userData to sessionStorage:",
				userData
			);

			// Force UserContext to refresh with new data
			if (forceRefresh) {
				forceRefresh();
			}

			// Calculate actual wuxing data using the same function as the report
			const wuxingData = getWuxingData(birthDateTime, gender);
			console.log("🔮 Calculated wuxing data:", wuxingData);

			// Generate report data to save in analysisResult with ACTUAL calculated values
			const analysisResult = {
				userInfo: userData,
				generatedAt: new Date().toISOString(),
				reportType: "personal_report",
				birthYear: year,
				nayin: wuxingData.nayin,
				wuxingJu: wuxingData.wuxingJu,
				bazi: {
					year: wuxingData.year,
					month: wuxingData.month,
					day: wuxingData.day,
					hour: wuxingData.hour,
				},
				mingPalace: wuxingData.mingPalace,
				bodyPalace: wuxingData.bodyPalace,
				wuxingScale: wuxingData.wuxingScale,
			};

			console.log(
				"📊 Personal analysis result with calculated data:",
				analysisResult
			);

			// Track personal report generation
			await trackPersonalReportGeneration(
				{ gender, birthDateTime },
				analysisResult
			);

			toast.success("正在為你分析個人命卦...");

			// Redirect to free personal report page
			router.push(`/${locale}/freePersonal`);
		} catch (error) {
			console.error("Error in handleStart:", error);
			toast.error("生成個人報告時發生錯誤");
		} finally {
			setLoading(false);
			setIsSubmitting(false);
		}
	};

	// Track personal report generation
	const trackPersonalReportGeneration = async (userInfo, analysis) => {
		try {
			const response = await fetch(
				"/api/track-personal-report-generation",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userInfo,
						analysisResult: analysis,
						locale: locale || "zh-TW",
						timeSpentOnPage: 0,
						referrer: document.referrer || "",
						sessionId:
							sessionStorage.getItem("ga_session_id") ||
							`session_${Date.now()}`,
						isAnonymous: true,
					}),
				}
			);

			if (response.ok) {
				const result = await response.json();
				console.log("✅ Personal report generation tracked:", result);
			} else {
				console.error("❌ Failed to track personal report generation");
			}
		} catch (error) {
			console.error(
				"❌ Error tracking personal report generation:",
				error
			);
		}
	};

	return (
		<div
			className="relative flex flex-col items-center justify-start w-full min-h-screen px-4 py-6 mb-10 text-center sm:px-6 md:px-8 lg:px-0"
			style={{
				backgroundImage: "url('/images/report/freebg.png')",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "right center",
				backgroundSize: "contain",
			}}
		>
			{/* Mobile background overlay with blur */}
			<div
				className="absolute inset-0 bg-white/20 backdrop-blur-sm sm:hidden"
				style={{ zIndex: 1 }}
			></div>

			{/* Title */}
			<h1
				className="relative z-10 mt-3 mb-2 mb-4 text-2xl leading-tight md:text-3xl lg:text-4xl sm:leading-normal"
				style={{
					fontFamily: '"Noto Serif TC", serif',
					fontWeight: 900,
					color: "#374A37",
				}}
			>
				個人命卦分析
			</h1>

			{/* User Info Form */}
			<div className="relative z-10 w-full max-w-4xl mx-auto lg:right-[130px]">
				<div className="p-1 rounded-xl">
					{/* Form Body */}
					<div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
						<h2
							className="text-2xl md:text-3xl lg:text-4xl"
							style={{
								fontFamily: '"Noto Serif TC", serif',
								fontWeight: 900,
								color: "#000000",
								marginBottom: "16px",
								textAlign: "start",
							}}
						>
							{t("personalInfo")}
						</h2>
						<p
							className="text-base md:text-lg lg:text-xl"
							style={{
								fontFamily: '"Noto Serif TC", serif',
								fontWeight: 700,
								color: "#777777",
								marginBottom: "24px",
								textAlign: "start",
							}}
						>
							請填寫你的基本資料以進行個人命卦分析
						</p>

						{/* Gender */}
						<div className="space-y-2">
							<label
								className="block text-xl text-left md:text-2xl lg:text-3xl"
								style={{
									fontFamily: '"Noto Serif TC", serif',
									fontWeight: 900,
									color: "#004F44",
								}}
							>
								{t("gender")}
							</label>
							{/* Custom Radio Buttons for Gender */}
							<div className="flex space-x-4">
								<label className="flex items-center cursor-pointer">
									<input
										type="radio"
										name="gender"
										value="male"
										checked={gender === "male"}
										onChange={(e) =>
											setGender(e.target.value)
										}
										className="sr-only"
									/>
									<div
										className="w-6 h-6 mr-2 rounded-full"
										style={{
											backgroundColor:
												gender === "male"
													? "#004F44"
													: "#D9D9D9",
										}}
									></div>
									<span
										className="text-sm md:text-base"
										style={{
											fontFamily:
												'"Noto Serif TC", serif',
										}}
									>
										{t("male")}
									</span>
								</label>
								<label className="flex items-center cursor-pointer">
									<input
										type="radio"
										name="gender"
										value="female"
										checked={gender === "female"}
										onChange={(e) =>
											setGender(e.target.value)
										}
										className="sr-only"
									/>
									<div
										className="w-6 h-6 mr-2 rounded-full"
										style={{
											backgroundColor:
												gender === "female"
													? "#004F44"
													: "#D9D9D9",
										}}
									></div>
									<span
										className="text-sm md:text-base"
										style={{
											fontFamily:
												'"Noto Serif TC", serif',
										}}
									>
										{t("female")}
									</span>
								</label>
							</div>
						</div>

						{/* Birth Date Time */}
						<div className="space-y-2">
							<label
								className="block text-xl text-left md:text-2xl lg:text-3xl"
								style={{
									fontFamily: '"Noto Serif TC", serif',
									fontWeight: 900,
									color: "#004F44",
								}}
							>
								{t("birthDateTime")}
							</label>
							<div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap">
								<select
									className="px-3 py-3 text-sm border-0 sm:text-base focus:outline-none"
									style={{
										borderRadius: "100px",
										backgroundColor: "#FFFFFF",
										boxShadow:
											"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
										fontFamily: '"Noto Serif TC", serif',
										width: "100%",
										maxWidth: "158px",
									}}
									value={year}
									onChange={(e) => setYear(e.target.value)}
								>
									<option value="">{t("year")}</option>
									{years.map((y) => (
										<option key={y} value={y}>
											{y}
										</option>
									))}
								</select>
								<select
									className="px-3 py-3 text-sm border-0 sm:text-base focus:outline-none"
									style={{
										borderRadius: "100px",
										backgroundColor: "#FFFFFF",
										boxShadow:
											"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
										fontFamily: '"Noto Serif TC", serif',
										width: "100%",
										maxWidth: "158px",
									}}
									value={month}
									onChange={(e) => setMonth(e.target.value)}
								>
									<option value="">{t("month")}</option>
									{months.map((m) => (
										<option key={m} value={m}>
											{m}
										</option>
									))}
								</select>
								<select
									className="px-3 py-3 text-sm border-0 sm:text-base focus:outline-none"
									style={{
										borderRadius: "100px",
										backgroundColor: "#FFFFFF",
										boxShadow:
											"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
										fontFamily: '"Noto Serif TC", serif',
										width: "100%",
										maxWidth: "158px",
									}}
									value={day}
									onChange={(e) => setDay(e.target.value)}
								>
									<option value="">{t("day")}</option>
									{days.map((d) => (
										<option key={d} value={d}>
											{d}
										</option>
									))}
								</select>
								<select
									className="px-3 py-3 text-sm border-0 sm:text-base focus:outline-none"
									style={{
										borderRadius: "100px",
										backgroundColor: "#FFFFFF",
										boxShadow:
											"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
										fontFamily: '"Noto Serif TC", serif',
										width: "100%",
										maxWidth: "158px",
									}}
									value={hour}
									onChange={(e) => setHour(e.target.value)}
								>
									<option value="">{t("hour")}</option>
									{hours.map((h) => (
										<option key={h} value={h}>
											{h}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Modal Footer */}
					<div className="sticky bottom-0 z-10 flex flex-col items-start p-4 space-y-3 sm:p-6">
						<button
							className="w-full max-w-[200px] py-3 text-base font-bold text-white transition-all duration-200 rounded-lg shadow-lg sm:text-lg bg-[#004F44] hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleStart}
							disabled={loading || status === "loading"}
						>
							{loading
								? "分析中..."
								: status === "loading"
									? "檢查中..."
									: "開始分析"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UploadPersonal;
