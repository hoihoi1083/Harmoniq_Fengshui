// Page 5-6: 總流年{Concern} - Detailed analysis with numbered sections and large decorative characters

export default function Page5_6_CareerDetailed({ data }) {
	const { jixiong, concern, color } = data;

	// Extract jixiong (吉象 and 凶象) data
	// The data structure is: { jixiang: [{title, content}], xiongxiang: [{title, content}] }
	const auspiciousItems = jixiong?.jixiang || jixiong?.auspicious || [];
	const inauspiciousItems = jixiong?.xiongxiang || jixiong?.inauspicious || [];

	// Convert to array format if they're already arrays, otherwise parse strings
	const getItemsArray = (items) => {
		if (Array.isArray(items) && items.length > 0 && items[0].title) {
			// Already in correct format: [{title, content}, ...]
			return items;
		}
		if (typeof items === 'string') {
			// Legacy string format, parse it
			const lines = items.split("\n").filter((line) => line.trim());
			return lines
				.filter((line) => line.includes("•") || line.match(/^\d+\./))
				.map((line, index) => ({
					title: `要點 ${index + 1}`,
					content: line.replace(/^•\s*/, "").replace(/^\d+\.\s*/, "").trim()
				}));
		}
		return [];
	};

	const auspiciousPoints = getItemsArray(auspiciousItems);
	const inauspiciousPoints = getItemsArray(inauspiciousItems);

	const concernChinese = {
		財運: "財運",
		健康: "健康",
		感情: "感情",
		事業: "事業",
	};

	return (
		<>
			{/* Page 5: 吉象 (Auspicious) */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Page Header with large decorative character */}
				<div className="text-center mb-10 relative">
					<div
						className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-[200px] opacity-5 font-bold"
						style={{ 
							color: color,
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						吉
					</div>
					<h1
						className="text-5xl font-bold mb-3 relative z-10"
						style={{ 
							color: color,
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						總流年{concernChinese[concern]} · 吉象
					</h1>
					<p className="text-gray-600 text-lg">
						2026年{concern}方面的有利趨勢
					</p>
				</div>

				{/* Numbered sections */}
				<div className="space-y-8">
					{auspiciousPoints.length > 0 ? (
						auspiciousPoints.map((item, index) => (
							<div
								key={index}
								className="flex gap-6 items-start p-6 rounded-xl avoid-break"
								style={{ backgroundColor: `${color}08` }}
							>
								{/* Number badge */}
								<div
									className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
									style={{ backgroundColor: color }}
								>
									{index + 1}
								</div>

								{/* Content */}
								<div className="flex-1">
									{item.title && (
										<h3 className="text-xl font-bold mb-3" style={{ color: color }}>
											{item.title}
										</h3>
									)}
									<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
										{item.content}
									</p>
								</div>
							</div>
						))
					) : (
						<div
							className="p-8 rounded-xl text-center"
							style={{ backgroundColor: `${color}08` }}
						>
							<p className="text-gray-600">正在分析吉象...</p>
						</div>
					)}
				</div>

				{/* Footer note */}
				<div className="mt-12 text-center">
					<p className="text-gray-500 text-sm">
						* 以上吉象可作為您在{concern}規劃時的參考依據
					</p>
				</div>
			</div>

			{/* Page 6: 凶象 (Inauspicious) */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Page Header with large decorative character */}
				<div className="text-center mb-10 relative">
					<div
						className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-[200px] opacity-5 font-bold text-gray-400"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						凶
					</div>
					<h1
						className="text-5xl font-bold mb-3 relative z-10"
						style={{ 
							color: "#666",
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						總流年{concernChinese[concern]} · 凶象
					</h1>
					<p className="text-gray-600 text-lg">
						2026年{concern}方面需要留意的挑戰
					</p>
				</div>

				{/* Numbered sections */}
				<div className="space-y-8">
					{inauspiciousPoints.length > 0 ? (
						inauspiciousPoints.map((item, index) => (
							<div
								key={index}
								className="flex gap-6 items-start p-6 rounded-xl avoid-break bg-gray-50 border-2 border-gray-200"
							>
								{/* Number badge */}
								<div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-400 text-white font-bold text-xl">
									{index + 1}
								</div>

								{/* Content */}
								<div className="flex-1">
									{item.title && (
										<h3 className="text-xl font-bold mb-3 text-gray-700">
											{item.title}
										</h3>
									)}
									<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
										{item.content}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="p-8 rounded-xl text-center bg-gray-50">
							<p className="text-gray-600">正在分析凶象...</p>
						</div>
					)}
				</div>

				{/* Footer note */}
				<div className="mt-12 text-center">
					<p className="text-gray-500 text-sm">
						* 提前了解凶象，可以更好地規避風險，化解不利影響
					</p>
				</div>
			</div>
		</>
	);
}
