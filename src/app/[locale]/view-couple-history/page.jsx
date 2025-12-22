"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, User, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ViewCoupleHistoryPage() {
	const [reportData, setReportData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("sessionId");

	useEffect(() => {
		if (sessionId) {
			fetchCoupleReport();
		}
	}, [sessionId]);

	const fetchCoupleReport = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/couple-complete-report?sessionId=${sessionId}`
			);

			if (!response.ok) {
				throw new Error("無法載入報告");
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "報告載入失敗");
			}

			setReportData(data);
			setError(null);
		} catch (err) {
			console.error("❌ Error loading couple report:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
					<p className="text-gray-600">載入報告中...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-3xl">❌</span>
					</div>
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						載入失敗
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all"
					>
						<ArrowLeft className="w-4 h-4" />
						返回首頁
					</Link>
				</div>
			</div>
		);
	}

	if (!reportData) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<p className="text-gray-600">請提供 sessionId 參數</p>
				</div>
			</div>
		);
	}

	const { metadata, summary, report } = reportData;

	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
			{/* Header */}
			<div className="bg-white shadow-md sticky top-0 z-10">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link
							href="/"
							className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
						>
							<ArrowLeft className="w-5 h-5" />
							<span>返回</span>
						</Link>
						<h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
							💕 夫妻配對報告
						</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Metadata Card */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="flex items-center gap-3 mb-4">
						<Heart className="w-6 h-6 text-pink-500" />
						<h2 className="text-2xl font-bold text-gray-800">
							報告資訊
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
							<User className="w-5 h-5 text-blue-600" />
							<div>
								<p className="text-sm text-gray-600">男方</p>
								<p className="font-semibold text-gray-800">
									{metadata?.birthday} ({metadata?.gender})
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
							<User className="w-5 h-5 text-pink-600" />
							<div>
								<p className="text-sm text-gray-600">女方</p>
								<p className="font-semibold text-gray-800">
									{metadata?.birthday2} ({metadata?.gender2})
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
							<Calendar className="w-5 h-5 text-purple-600" />
							<div>
								<p className="text-sm text-gray-600">
									報告生成時間
								</p>
								<p className="font-semibold text-gray-800">
									{new Date(
										metadata?.reportGeneratedAt
									).toLocaleString("zh-TW")}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
							<Heart className="w-5 h-5 text-green-600" />
							<div>
								<p className="text-sm text-gray-600">
									契合度分數
								</p>
								<p className="font-semibold text-gray-800">
									{summary?.compatibilityScore} (
									{summary?.compatibilityLevel})
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Core Suggestions */}
				{report?.coreSuggestions && (
					<CoreSuggestionsDisplay
						data={report.coreSuggestions}
					/>
				)}

				{/* Annual Analysis */}
				{report?.annualAnalysis && (
					<SectionCard
						title="流年分析"
						icon="📅"
						data={report.annualAnalysis}
					/>
				)}

				{/* MingJu Analysis */}
				{report?.mingJuAnalysis && (
					<SectionCard
						title="命局分析"
						icon="🔮"
						data={report.mingJuAnalysis}
					/>
				)}

				{/* God Explanation */}
				{report?.godExplanation && (
					<SectionCard
						title="十神分析"
						icon="⚡"
						data={report.godExplanation}
					/>
				)}

				{/* Season Analysis */}
				{report?.seasonAnalysis && (
					<SectionCard
						title="四季分析"
						icon="🌸"
						data={report.seasonAnalysis}
					/>
				)}

				{/* Problem Solution */}
				{report?.problemSolution && (
					<SectionCard
						title="問題解決方案"
						icon="💡"
						data={report.problemSolution}
					/>
				)}

				{/* Components Summary */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
					<h3 className="text-lg font-bold text-gray-800 mb-4">
						報告組件狀態
					</h3>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{reportData.rawComponents?.map((comp, index) => (
							<div
								key={index}
								className="p-3 bg-gray-50 rounded-lg"
							>
								<p className="text-sm font-medium text-gray-700">
									{comp.componentName}
								</p>
								<p className="text-xs text-gray-500">
									{new Date(
										comp.savedAt
									).toLocaleTimeString("zh-TW")}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

// Component to display Core Suggestions in detail
function CoreSuggestionsDisplay({ data }) {
	const [activeCategory, setActiveCategory] = useState(0);

	if (!data?.coreCategories || data.coreCategories.length === 0) {
		return null;
	}

	const currentCategory = data.coreCategories[activeCategory];

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
			<div className="flex items-center gap-3 mb-6">
				<span className="text-3xl">{data.coreIcon || "💕"}</span>
				<div>
					<h2 className="text-2xl font-bold text-gray-800">
						{data.title || "開運建議"}
					</h2>
					<p className="text-gray-600">
						{data.subtitle || "感情指南"}
					</p>
				</div>
			</div>

			{/* Category Tabs */}
			<div className="flex flex-wrap gap-2 mb-6">
				{data.coreCategories.map((category, index) => (
					<button
						key={index}
						onClick={() => setActiveCategory(index)}
						className={`px-4 py-2 rounded-full font-medium transition-all ${
							activeCategory === index
								? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						{category.title}
					</button>
				))}
			</div>

			{/* Current Category Content */}
			<div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
				<h3 className="text-xl font-bold text-gray-800 mb-4">
					{currentCategory.title}
				</h3>
				<p className="text-gray-600 mb-4">
					{currentCategory.subtitle}
				</p>

				{/* Render subsections */}
				{currentCategory.content?.subsections && (
					<div className="space-y-4">
						{currentCategory.content.subsections.map(
							(subsection, index) => (
								<div
									key={index}
									className="bg-white rounded-lg p-4 shadow-sm"
								>
									<h4 className="font-bold text-gray-800 mb-2">
										{subsection.title}
									</h4>
									<p className="text-gray-700 whitespace-pre-wrap">
										{subsection.content}
									</p>
								</div>
							)
						)}
					</div>
				)}

				{/* Render communication structure */}
				{currentCategory.content?.sections && (
					<div className="space-y-4">
						{currentCategory.content.sections.map(
							(section, index) => (
								<div
									key={index}
									className="bg-white rounded-lg p-4 shadow-sm"
								>
									<h4 className="font-bold text-gray-800 mb-3">
										{section.title}
									</h4>
									{section.type === "partner-styles" && (
										<div className="grid md:grid-cols-2 gap-4">
											<div className="p-3 bg-blue-50 rounded-lg">
												<p className="text-sm text-gray-600 mb-1">
													男方
												</p>
												<p className="text-gray-800">
													{section.maleStyle}
												</p>
											</div>
											<div className="p-3 bg-pink-50 rounded-lg">
												<p className="text-sm text-gray-600 mb-1">
													女方
												</p>
												<p className="text-gray-800">
													{section.femaleStyle}
												</p>
											</div>
										</div>
									)}
									{section.subsections && (
										<div className="space-y-3 mt-3">
											{section.subsections.map(
												(sub, idx) => (
													<div
														key={idx}
														className="p-3 bg-gray-50 rounded-lg"
													>
														<p className="font-semibold text-gray-800 mb-2">
															{sub.title}
														</p>
														{sub.maleStrategy && (
															<p className="text-sm text-gray-700 mb-1">
																<span className="font-medium">
																	男方：
																</span>
																{
																	sub.maleStrategy
																}
															</p>
														)}
														{sub.femaleStrategy && (
															<p className="text-sm text-gray-700">
																<span className="font-medium">
																	女方：
																</span>
																{
																	sub.femaleStrategy
																}
															</p>
														)}
														{sub.content && (
															<p className="text-gray-700">
																{sub.content}
															</p>
														)}
													</div>
												)
											)}
										</div>
									)}
								</div>
							)
						)}
					</div>
				)}

				{/* Render energy enhancement */}
				{currentCategory.content?.maleSection && (
					<div className="space-y-4">
						<div className="bg-white rounded-lg p-4 shadow-sm">
							<h4 className="font-bold text-gray-800 mb-3">
								{currentCategory.content.maleSection.title}
							</h4>
							{currentCategory.content.maleSection.actionAdvice?.map(
								(advice, idx) => (
									<p
										key={idx}
										className="text-gray-700 mb-2"
									>
										• {advice}
									</p>
								)
							)}
						</div>
						<div className="bg-white rounded-lg p-4 shadow-sm">
							<h4 className="font-bold text-gray-800 mb-3">
								{currentCategory.content.femaleSection.title}
							</h4>
							{currentCategory.content.femaleSection.actionAdvice?.map(
								(advice, idx) => (
									<p
										key={idx}
										className="text-gray-700 mb-2"
									>
										• {advice}
									</p>
								)
							)}
						</div>
						{currentCategory.content.sharedEnhancement && (
							<div className="bg-white rounded-lg p-4 shadow-sm">
								<h4 className="font-bold text-gray-800 mb-3">
									{
										currentCategory.content
											.sharedEnhancement.title
									}
								</h4>
								{currentCategory.content.sharedEnhancement
									.weeklyRitual && (
									<div className="mb-4">
										<p className="font-semibold text-gray-800 mb-2">
											{
												currentCategory.content
													.sharedEnhancement
													.weeklyRitual.title
											}
										</p>
										<p className="text-gray-700">
											{
												currentCategory.content
													.sharedEnhancement
													.weeklyRitual.content
											}
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Render relationship taboos */}
				{currentCategory.content?.sections?.some(
					(s) => s.subsections
				) && (
					<div className="space-y-4">
						{currentCategory.content.sections.map(
							(section, index) => (
								<div
									key={index}
									className="bg-white rounded-lg p-4 shadow-sm"
								>
									<h4 className="font-bold text-gray-800 mb-3">
										{section.title}
									</h4>
									{section.subsections?.map((sub, idx) => (
										<div
											key={idx}
											className="mb-3 last:mb-0"
										>
											<p className="font-semibold text-gray-800 mb-1">
												{sub.title}
											</p>
											<p className="text-gray-700">
												{sub.content}
											</p>
										</div>
									))}
								</div>
							)
						)}
					</div>
				)}
			</div>

			{/* Motto */}
			{data.motto && (
				<div className="mt-6 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl text-center">
					<p className="text-lg font-medium text-gray-800 italic">
						"{data.motto}"
					</p>
				</div>
			)}
		</div>
	);
}

// Generic section card for other components
function SectionCard({ title, icon, data }) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
			<div className="flex items-center gap-3 mb-4">
				<span className="text-2xl">{icon}</span>
				<h2 className="text-xl font-bold text-gray-800">{title}</h2>
			</div>
			<div className="bg-gray-50 rounded-xl p-4">
				<pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
					{JSON.stringify(data, null, 2)}
				</pre>
			</div>
		</div>
	);
}
