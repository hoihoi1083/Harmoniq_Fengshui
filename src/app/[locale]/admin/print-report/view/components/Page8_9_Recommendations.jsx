// Page 8-9: 開運建議 - 5 recommendation boxes with tags

export default function Page8_9_Recommendations({ data }) {
	const { summary, concern, color } = data;

	// Extract recommendations from summary or create default structure
	const recommendations = summary?.recommendations || [];

	// If no recommendations, create sample structure
	const defaultRecommendations = [
		{
			title: "方位調整",
			tags: ["風水", "環境"],
			content: "根據您的八字，建議在2026年多往有利方位活動...",
		},
		{
			title: "時機把握",
			tags: ["時間", "規劃"],
			content: "把握關鍵時段，可以事半功倍...",
		},
		{
			title: "人際互動",
			tags: ["人脈", "關係"],
			content: "注意人際關係的經營，貴人相助...",
		},
		{
			title: "自我提升",
			tags: ["學習", "成長"],
			content: "持續學習和提升自我能力...",
		},
		{
			title: "健康調養",
			tags: ["養生", "保健"],
			content: "注意身心健康的平衡...",
		},
	];

	const displayRecommendations = recommendations.length > 0 
		? recommendations 
		: defaultRecommendations;

	return (
		<>
			{/* Page 8: First 3 recommendations */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Page Header */}
				<div className="text-center mb-12 relative">
					<div
						className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-[150px] opacity-5 font-bold"
						style={{ 
							color: color,
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						運
					</div>
					<h1
						className="text-5xl font-bold mb-3 relative z-10"
						style={{ 
							color: color,
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						開運建議
					</h1>
					<p className="text-gray-600 text-lg">
						提升{concern}運勢的實用方法
					</p>
				</div>

				{/* First 3 Recommendation Boxes */}
				<div className="space-y-8">
					{displayRecommendations.slice(0, 3).map((rec, index) => (
						<div
							key={index}
							className="avoid-break"
						>
							<div
								className="p-8 rounded-2xl border-2"
								style={{ 
									borderColor: color,
									backgroundColor: `${color}05`
								}}
							>
								{/* Number badge and title */}
								<div className="flex items-center gap-4 mb-4">
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
										style={{ backgroundColor: color }}
									>
										{index + 1}
									</div>
									<h2
										className="text-2xl font-bold"
										style={{ 
											color: color,
											fontFamily: "Noto Serif TC, serif" 
										}}
									>
										{rec.title}
									</h2>
								</div>

								{/* Tags */}
								{rec.tags && rec.tags.length > 0 && (
									<div className="flex gap-2 mb-4">
										{rec.tags.map((tag, tagIndex) => (
											<span
												key={tagIndex}
												className="px-3 py-1 rounded-full text-sm font-medium text-white"
												style={{ backgroundColor: color }}
											>
												{tag}
											</span>
										))}
									</div>
								)}

								{/* Content */}
								<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
									{rec.content}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Page 9: Last 2 recommendations */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Continued header */}
				<div className="text-center mb-12">
					<h1
						className="text-4xl font-bold mb-3"
						style={{ 
							color: color,
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						開運建議（續）
					</h1>
				</div>

				{/* Last 2 Recommendation Boxes */}
				<div className="space-y-8">
					{displayRecommendations.slice(3, 5).map((rec, index) => (
						<div
							key={index}
							className="avoid-break"
						>
							<div
								className="p-8 rounded-2xl border-2"
								style={{ 
									borderColor: color,
									backgroundColor: `${color}05`
								}}
							>
								{/* Number badge and title */}
								<div className="flex items-center gap-4 mb-4">
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
										style={{ backgroundColor: color }}
									>
										{index + 4}
									</div>
									<h2
										className="text-2xl font-bold"
										style={{ 
											color: color,
											fontFamily: "Noto Serif TC, serif" 
										}}
									>
										{rec.title}
									</h2>
								</div>

								{/* Tags */}
								{rec.tags && rec.tags.length > 0 && (
									<div className="flex gap-2 mb-4">
										{rec.tags.map((tag, tagIndex) => (
											<span
												key={tagIndex}
												className="px-3 py-1 rounded-full text-sm font-medium text-white"
												style={{ backgroundColor: color }}
											>
												{tag}
											</span>
										))}
									</div>
								)}

								{/* Content */}
								<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
									{rec.content}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Summary note box */}
				<div
					className="mt-12 p-8 rounded-2xl border-l-8"
					style={{
						borderColor: color,
						backgroundColor: `${color}15`,
					}}
				>
					<h3
						className="text-2xl font-bold mb-4"
						style={{ 
							color: color,
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						💡 實踐要點
					</h3>
					<p className="text-gray-800 text-lg leading-relaxed">
						以上建議需要結合您的實際情況靈活運用，持之以恆地實踐，才能真正發揮開運效果。
						建議定期回顧並調整策略，順應時勢變化。
					</p>
				</div>
			</div>
		</>
	);
}
