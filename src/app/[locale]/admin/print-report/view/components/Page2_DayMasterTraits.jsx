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
		<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden">
			{/* Page Header */}
			<div className="mb-10 text-center">
				<h1
					className="mb-3 text-5xl font-bold"
					style={{
						color: color,
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					日主特性分析
				</h1>
				<p className="text-lg text-gray-600">
					深入解讀您的性格特質與{concern}發展潛力
				</p>
			</div>

			{/* 4-Box Grid Layout */}
			<div className="grid max-w-6xl grid-cols-2 gap-8 mx-auto">
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
									fontFamily: "Noto Serif TC, serif",
								}}
							>
								{section.title}
							</h2>
						</div>

						{/* Section Content */}
						<div className="flex-1">
							<p
								className="text-base leading-relaxed text-gray-700 whitespace-pre-line"
								style={{
									fontFamily: "Noto Sans TC, sans-serif",
								}}
							>
								{section.content}
							</p>
						</div>

						{/* Decorative Bottom Border */}
						{index % 2 === 0 && (
							<div
								className="w-20 h-1 mt-6 rounded"
								style={{ backgroundColor: color }}
							></div>
						)}
					</div>
				))}
			</div>

			{/* Page Footer Note */}
			<div className="mt-12 text-center">
				<p className="text-sm text-gray-500">
					* 以上分析基於您的八字命盤，結合{concern}關注點進行深度解讀
				</p>
			</div>
		</div>
	);
}
