"use client";

import { useState, useEffect } from "react";
import { ComponentErrorBoundary } from "./ErrorHandling";

export default function LiuNianGanZhi({ userInfo, currentYear = new Date().getFullYear() }) {
	const [analysisData, setAnalysisData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeSection, setActiveSection] = useState("天干乙木-正印");

	// Generate content based on user's birth year and current year
	const generateGanZhiAnalysis = () => {
		return {
			title: "流年干支作用",
			description:
				"如同一陣東風來襲（乙木），點燃原有的火苗（丙火），引發漣漪，但巨實相衝濟勢如場蕩適，易生異動。流年作用重點在調和機緣，否則火土失調，導致資金耗損。整體而言，此年干支提升財富野心，適合開拓新事業，惟需謹慎仍為營造價值的波折。",
			sections: {
				"天干乙木-正印": {
					title: "天干乙木觸發三重效應",
					badges: [
						{
							text: "生身助勢",
							color: "bg-green-100 text-green-700",
						},
						{
							text: "乙庚合-合財運榮",
							color: "bg-yellow-100 text-yellow-700",
						},
						{
							text: "未火派火",
							color: "bg-orange-100 text-orange-700",
						},
					],
					effects: [
						{
							title: "生身助勢",
							content:
								"強化日主自信心，同時助長勢頭（火）之勢。實人運存在，但助力略嫌遲緩且主質質（如提升、貴人）或評估較慢本/付出",
						},
						{
							title: "乙庚合-合財運榮",
							content:
								"親疏、阻礙與「金」相關的機遇（如金融操作、金屬相關項目、情容交易），拖慢此類競爭性略，進展延緩。",
						},
						{
							title: "未火派火",
							content: "今地支巳火供燃材，加劇全局火災含乙之勢。",
						},
					],
				},
				"地支巳火-劫財": {
					title: "地支巳火劫財效應",
					badges: [
						{ text: "競爭加劇", color: "bg-red-100 text-red-700" },
						{
							text: "合作糾紛",
							color: "bg-purple-100 text-purple-700",
						},
						{
							text: "資金外流",
							color: "bg-blue-100 text-blue-700",
						},
					],
					effects: [
						{
							title: "競爭環境激烈",
							content:
								"市場競爭白熱化，同行或合作夥伴可能形成威脅，需要更積極的策略應對。",
						},
						{
							title: "合作關係複雜",
							content:
								"合夥人或投資者關係緊張，可能出現利益分配不均或理念衝突。",
						},
						{
							title: "財務支出增加",
							content:
								"意外開支、投資失利或為他人承擔費用的情況增多。",
						},
					],
				},
			},
			yearlyPerformance: {
				title: "實際表現",
				description:
					"此年財運呈「生存保衛戰」，核心計畫重：保住正職收入（護辛金）、嚴控支出（防火炙）、杜絕投機含蒙（避劫財），實施多路謀略之火錢（動靜/印）、實智多元諮詢歷火就（動靜+印）。實質可能看機禀現（印），實施多路謀略歷火就調以付。",
				strategies: [
					{
						category: "情境預警",
						items: ["合夥人士", "職場人士", "投資者"],
					},
				],
				details:
					"等乙木印星影響（改善品品，戰爭退良），可能創新新項目（富巨印推土榮）。但巳印諸數較心客戶流失、供應鏈製、開環合的出問題。火旺治金，項目懸慢傑競，現金流問題嚴嚴，大量未完用現衍平台（技藝人/印方）需塑發自身管理兼詢加劇增大",
			},
			precautions: {
				title: "注意事項",
				items: [
					{
						category: "高風險投資",
						description:
							"股市、幣圈、高槓桿、隨生爆躍業、加盟、火中取栗等",
					},
					{ category: "合夥借貸擔保", description: "" },
					{ category: "過度擴張", description: "" },
					{ category: "容易契約/法律糾紛", description: "" },
					{ category: "惡健康/情緒", description: "" },
				],
				warning:
					"包括但不限於：股市、幣圈、高槓桿、隨生爆躍業、加盟、『火中取栗』在此年是矛盾意義的警告。",
			},
		};
	};

	useEffect(() => {
		// Simulate AI generation delay
		const timer = setTimeout(() => {
			const mockData = generateGanZhiAnalysis();
			setAnalysisData(mockData);
			setIsLoading(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, [userInfo, currentYear]);

	if (isLoading) {
		return (
			<div className="w-full sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-4 sm:p-8 lg:p-13 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				<div className="py-8 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B116] mx-auto mb-4"></div>
					<p
						className="text-lg text-[#5A5A5A]"
						style={{ fontFamily: "Noto Sans HK, sans-serif" }}
					>
						AI正在生成流年干支作用分析...
					</p>
				</div>
			</div>
		);
	}

	const currentSection = analysisData?.sections[activeSection];

	return (
		<ComponentErrorBoundary componentName="LiuNianGanZhi">
			<div className="w-full sm:w-[95%] lg:w-[85%] mx-auto bg-white rounded-[20px] sm:rounded-[26px] p-4 sm:p-8 lg:p-13 mb-6 sm:mb-10 shadow-[0_4px_5.3px_rgba(0,0,0,0.25)]">
				{/* Header */}
				<div className="mb-6 sm:mb-8">
					<h2
						className="font-bold text-[#A3B116] text-center lg:text-left mb-4"
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontSize: "clamp(32px, 6vw, 56px)",
						}}
					>
						{analysisData?.title}
					</h2>

					{/* Description */}
					<p
						className="mb-6 text-sm leading-relaxed text-gray-700 sm:text-base"
						style={{ fontFamily: "Noto Sans HK, sans-serif" }}
					>
						{analysisData?.description}
					</p>

					{/* Section Toggle Buttons */}
					<div className="flex flex-col gap-3 mb-6 sm:flex-row sm:gap-4">
						{Object.keys(analysisData?.sections || {}).map(
							(sectionKey) => (
								<button
									key={sectionKey}
									onClick={() => setActiveSection(sectionKey)}
									className={`px-4 sm:px-6 py-3 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
										activeSection === sectionKey
											? "bg-[#6B8E23] text-white shadow-lg"
											: sectionKey === "地支巳火-劫財"
												? "bg-gray-100 text-gray-700 hover:bg-gray-200"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{sectionKey}
								</button>
							)
						)}
					</div>
				</div>

				{/* Current Section Content */}
				{currentSection && (
					<div className="p-4 mb-6 bg-gray-50 rounded-2xl sm:p-6 lg:p-8">
						<h3
							className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl"
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							{currentSection.title}
						</h3>

						{/* Badges */}
						<div className="flex flex-wrap gap-2 mb-6">
							{currentSection.badges?.map((badge, index) => (
								<span
									key={index}
									className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
									style={{
										fontFamily: "Noto Sans HK, sans-serif",
									}}
								>
									{badge.text}
								</span>
							))}
						</div>

						{/* Effects */}
						<div className="space-y-4">
							{currentSection.effects?.map((effect, index) => (
								<div
									key={index}
									className="p-4 bg-white shadow-sm rounded-xl sm:p-5"
								>
									<h4
										className="text-lg font-semibold text-[#A3B116] mb-2"
										style={{
											fontFamily: "Noto Serif TC, serif",
										}}
									>
										{effect.title}
									</h4>
									<p
										className="text-sm leading-relaxed text-gray-700 sm:text-base"
										style={{
											fontFamily:
												"Noto Sans HK, sans-serif",
										}}
									>
										{effect.content}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Yearly Performance */}
				<div className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl sm:p-6 lg:p-8">
					<h3
						className="text-xl sm:text-2xl font-bold text-[#A3B116] mb-4"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						{analysisData?.yearlyPerformance?.title}
					</h3>

					<p
						className="mb-6 text-sm leading-relaxed text-gray-700 sm:text-base"
						style={{ fontFamily: "Noto Sans HK, sans-serif" }}
					>
						{analysisData?.yearlyPerformance?.description}
					</p>

					{/* Strategy Categories */}
					<div className="mb-6">
						<div className="flex flex-wrap gap-2 mb-4">
							<span
								className="px-3 py-1 bg-[#A3B116] text-white rounded-full text-sm font-medium"
								style={{
									fontFamily: "Noto Sans HK, sans-serif",
								}}
							>
								情境預警
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{analysisData?.yearlyPerformance?.strategies[0]?.items?.map(
								(item, index) => (
									<button
										key={index}
										className="px-4 py-2 text-sm font-medium text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
										style={{
											fontFamily:
												"Noto Sans HK, sans-serif",
										}}
									>
										{item}
									</button>
								)
							)}
						</div>
					</div>

					<div className="p-4 bg-white rounded-xl sm:p-5">
						<p
							className="text-sm leading-relaxed text-gray-700"
							style={{ fontFamily: "Noto Sans HK, sans-serif" }}
						>
							{analysisData?.yearlyPerformance?.details}
						</p>
					</div>
				</div>

				{/* Precautions */}
				<div className="p-4 bg-red-50 rounded-2xl sm:p-6 lg:p-8">
					<h3
						className="mb-4 text-xl font-bold text-red-600 sm:text-2xl"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						{analysisData?.precautions?.title}
					</h3>

					<div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-3">
						{analysisData?.precautions?.items?.map(
							(item, index) => (
								<div
									key={index}
									className="p-3 bg-white rounded-lg sm:p-4"
								>
									<h4
										className="mb-2 text-sm font-semibold text-red-600"
										style={{
											fontFamily:
												"Noto Sans HK, sans-serif",
										}}
									>
										{item.category}
									</h4>
									{item.description && (
										<p
											className="text-xs text-gray-600"
											style={{
												fontFamily:
													"Noto Sans HK, sans-serif",
											}}
										>
											{item.description}
										</p>
									)}
								</div>
							)
						)}
					</div>

					<div className="p-4 bg-red-100 rounded-lg">
						<p
							className="text-sm font-medium leading-relaxed text-red-700"
							style={{ fontFamily: "Noto Sans HK, sans-serif" }}
						>
							{analysisData?.precautions?.warning}
						</p>
					</div>
				</div>
			</div>
		</ComponentErrorBoundary>
	);
}
