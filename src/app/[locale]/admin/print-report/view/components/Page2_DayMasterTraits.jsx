// Page 2: 日主特性 - 4-box grid layout (優勢分析, 劣勢與挑戰, 調候與策略, 針對性建議)

export default function Page2_DayMasterTraits({ data }) {
	const { dayMaster, concern, color } = data;

	// Extract analysis sections from dayMaster
	const analysis = dayMaster?.analysis || {};

	const sections = [
		{
			title: "優勢分析",
			icon: "💪",
			content: analysis.strengths || "正在分析中...",
			bgColor: `${color}15`,
		},
		{
			title: "劣勢與挑戰",
			icon: "⚠️",
			content: analysis.weaknesses || "正在分析中...",
			bgColor: "#f5f5f5",
		},
		{
			title: "調候與策略",
			icon: "🎯",
			content: analysis.strategies || "正在分析中...",
			bgColor: `${color}08`,
		},
		{
			title: "針對性建議",
			icon: "💡",
			content: analysis.suggestions || "正在分析中...",
			bgColor: "#fafafa",
		},
	];

	return (
		<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
			{/* Page Header */}
			<div className="text-center mb-10">
				<h1
					className="text-5xl font-bold mb-3"
					style={{ 
						color: color,
						fontFamily: "Noto Serif TC, serif" 
					}}
				>
					日主特性分析
				</h1>
				<p className="text-gray-600 text-lg">
					深入解讀您的性格特質與{concern}發展潛力
				</p>
			</div>

			{/* 4-Box Grid Layout */}
			<div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
				{sections.map((section, index) => (
					<div
						key={index}
						className="rounded-2xl p-8 border-2 min-h-[280px] flex flex-col"
						style={{
							borderColor: index % 2 === 0 ? color : "#ddd",
							backgroundColor: section.bgColor,
						}}
					>
						{/* Section Header */}
						<div className="flex items-center gap-3 mb-6">
							<span className="text-4xl">{section.icon}</span>
							<h2
								className="text-2xl font-bold"
								style={{ 
									color: index % 2 === 0 ? color : "#333",
									fontFamily: "Noto Serif TC, serif" 
								}}
							>
								{section.title}
							</h2>
						</div>

						{/* Section Content */}
						<div className="flex-1">
							<p
								className="text-gray-700 leading-relaxed text-base whitespace-pre-line"
								style={{ fontFamily: "Noto Sans TC, sans-serif" }}
							>
								{section.content}
							</p>
						</div>

						{/* Decorative Bottom Border */}
						{index % 2 === 0 && (
							<div
								className="h-1 w-20 rounded mt-6"
								style={{ backgroundColor: color }}
							></div>
						)}
					</div>
				))}
			</div>

			{/* Page Footer Note */}
			<div className="mt-12 text-center">
				<p className="text-gray-500 text-sm">
					* 以上分析基於您的八字命盤，結合{concern}關注點進行深度解讀
				</p>
			</div>
		</div>
	);
}
