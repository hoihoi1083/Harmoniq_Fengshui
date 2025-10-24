"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

const ReportHistoryPage = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale || "zh-TW";
	const t = useTranslations("reportHistory");
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalCount: 0,
		hasNextPage: false,
		hasPrevPage: false,
	});

	// Couple reports state
	const [coupleReports, setCoupleReports] = useState([]);
	const [coupleLoading, setCoupleLoading] = useState(true);
	const [coupleError, setCoupleError] = useState(null);
	const [couplePagination, setCouplePagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalCount: 0,
		hasNextPage: false,
		hasPrevPage: false,
	});

	// Life reports state
	const [lifeReports, setLifeReports] = useState([]);
	const [lifeLoading, setLifeLoading] = useState(true);
	const [lifeError, setLifeError] = useState(null);
	const [lifePagination, setLifePagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalCount: 0,
		hasNextPage: false,
		hasPrevPage: false,
	});

	useEffect(() => {
		if (status === "loading") return;
		if (status === "unauthenticated") {
			// Check if user has session storage data
			const storedEmail = localStorage.getItem("userEmail");
			if (!storedEmail) {
				router.push(`/${locale}/auth/login`);
				return;
			}
		}
		fetchReports();
		fetchCoupleReports();
		fetchLifeReports();
	}, [session, status, locale]);

	const fetchReports = async (page = 1) => {
		try {
			setLoading(true);
			let userEmail = session?.user?.email;
			let userId = session?.user?.id || session?.user?.userId;

			// Fallback to localStorage if not authenticated
			if (!userEmail && !userId) {
				userEmail = localStorage.getItem("userEmail");
				userId = localStorage.getItem("userId");
			}

			if (!userEmail && !userId) {
				setError(t("errors.userInfo"));
				return;
			}

			const queryParams = new URLSearchParams({
				...(userEmail && { userEmail }),
				...(userId && { userId }),
				page: page.toString(),
				limit: "12",
			});

			const response = await fetch(`/api/reports/history?${queryParams}`);
			const data = await response.json();

			if (data.status === 0) {
				setReports(data.data.reports);
				setPagination(data.data.pagination);
				setError(null);
			} else {
				setError(data.error || t("errors.fetchFailed"));
			}
		} catch (err) {
			console.error("Fetch reports error:", err);
			setError(t("errors.networkError"));
		} finally {
			setLoading(false);
		}
	};

	const fetchCoupleReports = async (page = 1) => {
		try {
			setCoupleLoading(true);
			let userEmail = session?.user?.email;
			let userId = session?.user?.id || session?.user?.userId;

			// Fallback to localStorage if not authenticated
			if (!userEmail && !userId) {
				userEmail = localStorage.getItem("userEmail");
				userId = localStorage.getItem("userId");
			}

			if (!userEmail && !userId) {
				setCoupleError(t("errors.userInfo"));
				return;
			}

			const params = new URLSearchParams({
				limit: "12",
				page: page.toString(),
			});

			if (userEmail) params.append("userEmail", userEmail);
			if (userId) params.append("userId", userId);

			const response = await fetch(
				`/api/reports/couple-history?${params}`
			);
			const data = await response.json();

			if (data.status === 0) {
				setCoupleReports(data.data.reports);
				setCouplePagination(data.data.pagination);
				setCoupleError(null);
			} else {
				setCoupleError(data.error || t("errors.coupleFetchFailed"));
			}
		} catch (err) {
			console.error("Error fetching couple reports:", err);
			setCoupleError(t("errors.networkError"));
		} finally {
			setCoupleLoading(false);
		}
	};

	const fetchLifeReports = async (page = 1) => {
		try {
			setLifeLoading(true);

			// 🔍 DEBUG: Log session data to understand the structure
			console.log("🔍 Session data for life reports:", {
				fullSession: session,
				userEmail: session?.user?.email,
				userId: session?.user?.id,
				userUserId: session?.user?.userId,
				allUserProps: session?.user ? Object.keys(session.user) : null,
			});

			let userEmail = session?.user?.email;
			let userId = session?.user?.id || session?.user?.userId;

			// Fallback to localStorage if not authenticated
			if (!userEmail && !userId) {
				userEmail = localStorage.getItem("userEmail");
				userId = localStorage.getItem("userId");
				console.log("🔍 Using localStorage fallback:", {
					userEmail,
					userId,
				});
			}

			if (!userEmail && !userId) {
				setLifeError(t("errors.userInfo"));
				return;
			}

			console.log("🔍 Final parameters for life reports API:", {
				userEmail,
				userId,
			});

			const params = new URLSearchParams({
				limit: "12",
				page: page.toString(),
			});

			// Try multiple session properties to find the correct user identifier
			const possibleEmails = [
				session?.user?.email,
				session?.user?.userEmail,
				userEmail,
				localStorage.getItem("userEmail"),
			].filter(Boolean);

			const possibleUserIds = [
				session?.user?.userId,
				session?.user?.id,
				userId,
				localStorage.getItem("userId"),
			].filter(Boolean);

			console.log("🔍 All possible identifiers:", {
				possibleEmails,
				possibleUserIds,
			});

			// Use the first available email or userId
			if (possibleEmails.length > 0) {
				params.append("userEmail", possibleEmails[0]);
			}
			if (possibleUserIds.length > 0) {
				params.append("userId", possibleUserIds[0]);
			}

			const response = await fetch(`/api/reports/life-history?${params}`);
			const data = await response.json();

			if (data.status === 0) {
				setLifeReports(data.data.reports);
				setLifePagination(data.data.pagination);
				setLifeError(null);
			} else {
				setLifeError(data.error || t("errors.lifeFetchFailed"));
			}
		} catch (err) {
			console.error("Error fetching life reports:", err);
			setLifeError(t("errors.networkError"));
		} finally {
			setLifeLoading(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return t("gender.unknown");
		const date = new Date(dateString);
		return date.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "zh-TW", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

	const formatBirthday = (birthday) => {
		if (!birthday) return t("gender.unknown");
		return birthday.replace(/-/g, "/");
	};

	const getReportTypeLabel = (type) => {
		switch (type) {
			case "fortune":
				return t("fortuneReports.concerns.事業");
			case "couple":
				return t("coupleReports.title");
			case "bazhai":
				return t("fortuneReports.concerns.事業");
			default:
				return t("fortuneReports.concerns.事業");
		}
	};

	const getConcernLabel = (concern) => {
		// Map simplified Chinese to traditional Chinese keys
		const concernMapping = {
			事业: "事業",
			事業: "事業",
			感情: "感情",
			财运: "財運",
			財運: "財運",
			健康: "健康",
			学业: "學業",
			學業: "學業",
		};

		const concernKey = concernMapping[concern] || concern || "事業";
		return t(`fortuneReports.concerns.${concernKey}`, {
			defaultValue: concern || "事業",
		});
	};

	const getConcernImage = (concern) => {
		// Normalize concern to traditional Chinese for image lookup
		const concernMapping = {
			事业: "事業",
			事業: "事業",
			感情: "感情",
			财运: "財運",
			財運: "財運",
			健康: "健康",
			学业: "學業",
			學業: "學業",
		};

		const normalizedConcern = concernMapping[concern] || concern || "事業";

		const imageMap = {
			事業: "/images/demo/career.png",
			感情: "/images/demo/relationship.png",
			財運: "/images/demo/wealth.png",
			健康: "/images/demo/health.png",
			學業: "/images/demo/career.png", // Using career image for study as fallback
		};
		return imageMap[normalizedConcern] || "/images/demo/career.png";
	};

	const getGenderLabel = (gender) => {
		if (gender === "male") return t("gender.male");
		if (gender === "female") return t("gender.female");
		return t("gender.unknown");
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			fetchReports(newPage);
		}
	};

	const handleCouplePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= couplePagination.totalPages) {
			fetchCoupleReports(newPage);
		}
	};

	const handleLifePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= lifePagination.totalPages) {
			fetchLifeReports(newPage);
		}
	};

	if (loading && reports.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50">
				<Navbar />
				<div className="flex items-center justify-center flex-1 py-8">
					<div className="text-center">
						<div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
						<p className="text-gray-600">{t("loading")}</p>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: "#EFEFEF" }}>
			<Navbar />
			<div className="py-20">
				<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8 text-start">
						<h1
							className="mb-2  text-[60px] font-bold"
							style={{
								color: "#567156",
								fontFamily: "Noto Serif TC, serif",
								WebkitTextStroke: "1px #567156",
							}}
						>
							{t("title")}
						</h1>
						<p
							className=" text-[30px]"
							style={{
								color: "#567156",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							{t("subtitle")}
						</p>
					</div>

					{/* 合盤報告 Section */}
					<div className="mb-12">
						<h2
							className="pb-2 mb-6 text-[30px] font-bold border-b-2 border-blue-600"
							style={{
								color: "#567156",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							{t("coupleReports.title")}
						</h2>

						{coupleLoading ? (
							<div className="py-8 text-center">
								<div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
								<p className="mt-2 text-gray-600">
									{t("coupleReports.loading")}
								</p>
							</div>
						) : coupleError ? (
							<div className="py-8 text-center">
								<div className="p-4 border border-red-200 rounded-md bg-red-50">
									<p className="text-red-600">
										{coupleError}
									</p>
								</div>
							</div>
						) : coupleReports.length === 0 ? (
							<div className="py-8 text-center">
								<div className="p-8 border border-gray-200 rounded-md bg-gray-50">
									<p className="text-lg text-gray-500">
										{t("coupleReports.noRecords")}
									</p>
									<p className="mt-2 text-sm text-gray-400">
										{t("coupleReports.noRecordsHint")}
									</p>
								</div>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{coupleReports.map((report, index) => (
										<div
											key={report.sessionId}
											className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow-md hover:shadow-lg"
										>
											{/* Report Image */}
											<div className="relative h-48 overflow-hidden">
												<img
													src="/images/demo/couple.png"
													alt="合盤分析"
													className="object-cover object-top w-full h-full"
												/>
											</div>

											{/* Report Info */}
											<div className="p-4">
												<div className="space-y-3">
													{/* Title */}
													<div className="text-center">
														<h3 className="mb-1 text-lg font-bold text-gray-900">
															{t(
																"coupleReports.card.title"
															)}
														</h3>
													</div>

													{/* Two People Info */}
													<div className="text-center">
														<h4 className="mb-1 text-lg font-semibold text-gray-900">
															{t(
																"coupleReports.card.person1"
															)}
															(
															{getGenderLabel(
																report
																	.userInputs
																	?.gender
															)}
															)：
														</h4>
														<p className="font-medium text-gray-700">
															{formatBirthday(
																report
																	.userInputs
																	?.birthday
															)}
														</p>
														<h4 className="mt-2 mb-1 text-lg font-semibold text-gray-900">
															{t(
																"coupleReports.card.person2"
															)}
															(
															{getGenderLabel(
																report
																	.userInputs
																	?.gender2
															)}
															)：
														</h4>
														<p className="font-medium text-gray-700">
															{formatBirthday(
																report
																	.userInputs
																	?.birthday2
															)}
														</p>
													</div>

													{/* Generation Date */}
													<div className="pt-2 text-center border-t border-gray-100">
														<p className="text-sm font-medium text-gray-700">
															{t(
																"coupleReports.card.calculationDate"
															)}
															:{" "}
															{formatDate(
																report.reportGeneratedAt ||
																	report.createdAt
															)}
														</p>
													</div>

													{/* Status Badge */}
													<div className="text-center">
														<span
															className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
																report.reportGenerated
																	? "bg-green-100 text-green-800"
																	: "bg-yellow-100 text-yellow-800"
															}`}
														>
															{report.reportGenerated
																? t(
																		"coupleReports.card.statusCompleted"
																	)
																: t(
																		"coupleReports.card.statusProcessing"
																	)}
														</span>
													</div>
												</div>

												{/* Action Button */}
												<div className="mt-4">
													{report.reportGenerated && (
														<Link
															href={`/${locale}/couple-report?sessionId=${report.sessionId}`}
															className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
														>
															{t(
																"coupleReports.card.viewReport"
															)}
														</Link>
													)}
												</div>
											</div>
										</div>
									))}
								</div>

								{couplePagination.totalPages > 1 && (
									<div className="flex items-center justify-center mt-8 space-x-2">
										<button
											onClick={() =>
												handleCouplePageChange(
													couplePagination.currentPage -
														1
												)
											}
											disabled={
												!couplePagination.hasPrevPage
											}
											className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{t("pagination.previous")}
										</button>
										<span className="px-3 py-2 text-sm font-medium text-gray-700">
											{couplePagination.currentPage} /{" "}
											{couplePagination.totalPages}
										</span>
										<button
											onClick={() =>
												handleCouplePageChange(
													couplePagination.currentPage +
														1
												)
											}
											disabled={
												!couplePagination.hasNextPage
											}
											className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{t("pagination.next")}
										</button>
									</div>
								)}
							</>
						)}
					</div>

					{/* 人生報告 Section */}
					<div className="mb-12">
						<h2
							className="pb-2 mb-6  text-[30px] font-bold border-b-2 border-green-600"
							style={{
								color: "#567156",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							{t("lifeReports.title")}
						</h2>

						{lifeLoading ? (
							<div className="py-8 text-center">
								<div className="w-8 h-8 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
								<p className="mt-2 text-gray-600">
									{t("lifeReports.loading")}
								</p>
							</div>
						) : lifeError ? (
							<div className="py-8 text-center">
								<div className="p-4 border border-red-200 rounded-md bg-red-50">
									<p className="text-red-600">{lifeError}</p>
								</div>
							</div>
						) : lifeReports.length === 0 ? (
							<div className="py-8 text-center">
								<div className="p-8 border border-gray-200 rounded-md bg-gray-50">
									<p className="text-lg text-gray-500">
										{t("lifeReports.noRecords")}
									</p>
									<p className="mt-2 text-sm text-gray-400">
										{t("lifeReports.noRecordsHint")}
									</p>
								</div>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{lifeReports.map((report, index) => (
										<div
											key={report._id}
											className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow-md hover:shadow-lg"
										>
											{/* Report Image */}
											<div className="relative h-48 overflow-hidden">
												<img
													src="/images/demo/life.png"
													alt="人生分析"
													className="object-cover object-top w-full h-full"
												/>
											</div>

											{/* Report Info */}
											<div className="p-4">
												<div className="space-y-3">
													{/* Title */}
													<div className="text-center">
														<h3 className="mb-1 text-lg font-bold text-gray-900">
															{t(
																"lifeReports.card.title"
															)}
														</h3>
													</div>

													{/* Birthday and Gender */}
													<div className="text-center">
														<h4 className="mb-1 text-lg font-semibold text-gray-900">
															{t(
																"lifeReports.card.person"
															)}
															(
															{getGenderLabel(
																report
																	.userInputs
																	?.gender
															)}
															)：
														</h4>
														<p className="font-medium text-gray-700">
															{report.userInputs
																?.birthday
																? formatBirthday(
																		report
																			.userInputs
																			.birthday
																	)
																: t(
																		"gender.unknown"
																	)}
														</p>
													</div>

													{/* Generation Date */}
													<div className="pt-2 text-center border-t border-gray-100">
														<p className="text-sm font-medium text-gray-700">
															{t(
																"lifeReports.card.calculationDate"
															)}
															:{" "}
															{formatDate(
																report.reportGeneratedAt ||
																	report.updatedAt
															)}
														</p>
													</div>

													{/* Status Badge */}
													<div className="text-center">
														<span
															className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
																report.reportGenerated
																	? "bg-green-100 text-green-800"
																	: "bg-yellow-100 text-yellow-800"
															}`}
														>
															{report.reportGenerated
																? t(
																		"lifeReports.card.statusCompleted"
																	)
																: t(
																		"lifeReports.card.statusProcessing"
																	)}
														</span>
													</div>
												</div>

												{/* Action Button */}
												<div className="mt-4">
													{report.reportGenerated && (
														<Link
															href={`/${locale}/report?sessionId=${report.sessionId}&birthDateTime=${report.userInputs?.birthday || ""}&gender=${report.userInputs?.gender || ""}&showHistorical=true`}
															className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-green-600 border border-transparent rounded-md hover:bg-green-700"
														>
															{t(
																"lifeReports.card.viewReport"
															)}
														</Link>
													)}
												</div>
											</div>
										</div>
									))}
								</div>

								{lifePagination.totalPages > 1 && (
									<div className="flex items-center justify-center mt-8 space-x-2">
										<button
											onClick={() =>
												handleLifePageChange(
													lifePagination.currentPage -
														1
												)
											}
											disabled={
												!lifePagination.hasPrevPage
											}
											className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{t("pagination.previous")}
										</button>
										<span className="px-3 py-2 text-sm font-medium text-gray-700">
											{lifePagination.currentPage} /{" "}
											{lifePagination.totalPages}
										</span>
										<button
											onClick={() =>
												handleLifePageChange(
													lifePagination.currentPage +
														1
												)
											}
											disabled={
												!lifePagination.hasNextPage
											}
											className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{t("pagination.next")}
										</button>
									</div>
								)}
							</>
						)}
					</div>

					{/* 個人流年報告 Section */}
					<div className="mb-8">
						<h2
							className="pb-2 mb-6   text-[30px] font-bold border-b-2 border-blue-600"
							style={{
								color: "#567156",
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							{t("fortuneReports.title")}
						</h2>
					</div>

					{/* Error State */}
					{error && (
						<div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="w-5 h-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-red-800">
										{error}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Reports Grid */}
					{reports.length === 0 ? (
						<div className="py-12 text-center">
							<div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full">
								<svg
									className="w-12 h-12 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-medium text-gray-900">
								{t("fortuneReports.noRecords")}
							</h3>
							<p className="mb-4 text-gray-500">
								{t("fortuneReports.noRecordsHint")}
							</p>
							<Link
								href={`/${locale}/fortune-entry`}
								className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
							>
								{t("fortuneReports.startCalculation")}
							</Link>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{reports.map((report, index) => (
									<div
										key={report.sessionId}
										className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow-md hover:shadow-lg"
									>
										{/* Report Image */}
										<div className="relative h-48 overflow-hidden">
											<img
												src={getConcernImage(
													report.userInputs?.concern
												)}
												alt={`${getConcernLabel(report.userInputs?.concern)}分析`}
												className="object-cover object-top w-full h-full"
											/>
										</div>{" "}
										{/* Report Info */}
										<div className="p-4">
											<div className="space-y-3">
												{/* Title */}
												<div className="text-center">
													<h3 className="mb-1 text-lg font-bold text-gray-900">
														{getConcernLabel(
															report.userInputs
																?.concern
														)}
														{t(
															"fortuneReports.card.titleSuffix"
														)}
													</h3>
												</div>

												{/* Birthday and Gender */}
												<div className="text-center">
													<h4 className="mb-1 text-lg font-semibold text-gray-900">
														{t(
															"fortuneReports.card.person"
														)}
														(
														{getGenderLabel(
															report.userInputs
																?.gender
														)}
														)：
													</h4>
													<p className="font-medium text-gray-700">
														{formatBirthday(
															report.userInputs
																?.birthday
														)}
													</p>
												</div>

												{/* Generation Date */}
												<div className="pt-2 text-center border-t border-gray-100">
													<p className="text-sm font-medium text-gray-700">
														{t(
															"fortuneReports.card.calculationDate"
														)}
														:{" "}
														{formatDate(
															report.reportGeneratedAt ||
																report.createdAt
														)}
													</p>
												</div>

												{/* Status Badge */}
												<div className="text-center">
													<span
														className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
															report.reportGenerated
																? "bg-green-100 text-green-800"
																: "bg-yellow-100 text-yellow-800"
														}`}
													>
														{report.reportGenerated
															? t(
																	"fortuneReports.card.statusCompleted"
																)
															: t(
																	"fortuneReports.card.statusProcessing"
																)}
													</span>
												</div>
											</div>

											{/* Action Button */}
											<div className="mt-4">
												<Link
													href={`/${locale}/feng-shui-report?sessionId=${
														report.sessionId
													}&birthday=${report.userInputs?.birthday || ""}&gender=${
														report.userInputs
															?.gender || ""
													}&concern=${report.userInputs?.concern || ""}&problem=${
														report.userInputs
															?.problem || ""
													}&showHistorical=true`}
													className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
												>
													{t(
														"fortuneReports.card.viewReport"
													)}
												</Link>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex items-center justify-between mt-8">
									<div className="flex items-center text-sm text-gray-700">
										<span>
											{t("pagination.showing")}{" "}
											{(pagination.currentPage - 1) * 12 +
												1}{" "}
											{t("pagination.to")}{" "}
											{Math.min(
												pagination.currentPage * 12,
												pagination.totalCount
											)}{" "}
											{t("pagination.of")}{" "}
											{pagination.totalCount}{" "}
											{t("pagination.items")}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() =>
												handlePageChange(
													pagination.currentPage - 1
												)
											}
											disabled={!pagination.hasPrevPage}
											className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{t("pagination.previous")}
										</button>
										<span className="px-3 py-2 text-sm font-medium text-gray-700">
											{pagination.currentPage} /{" "}
											{pagination.totalPages}
										</span>
										<button
											onClick={() =>
												handlePageChange(
													pagination.currentPage + 1
												)
											}
											disabled={!pagination.hasNextPage}
											className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{t("pagination.next")}
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default ReportHistoryPage;
