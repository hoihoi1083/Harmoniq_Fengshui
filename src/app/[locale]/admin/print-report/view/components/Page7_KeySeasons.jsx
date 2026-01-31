// Page 7: 關鍵季節 - Seasonal analysis with large decorative seasonal characters

export default function Page7_KeySeasons({ data }) {
	const { seasons, concern, color } = data;

	// Extract seasonal data
	const seasonalData = seasons?.seasons || {};

	const seasonInfo = [
		{
			name: "春季",
			months: "農曆 1-3 月",
			character: "春",
			data: seasonalData.spring || {},
			icon: "🌸",
		},
		{
			name: "夏季",
			months: "農曆 4-6 月",
			character: "夏",
			data: seasonalData.summer || {},
			icon: "☀️",
		},
		{
			name: "秋季",
			months: "農曆 7-9 月",
			character: "秋",
			data: seasonalData.autumn || {},
			icon: "🍂",
		},
		{
			name: "冬季",
			months: "農曆 10-12 月",
			character: "冬",
			data: seasonalData.winter || {},
			icon: "❄️",
		},
	];

	return (
		<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
			{/* Page Header */}
			<div className="text-center mb-12">
				<h1
					className="text-5xl font-bold mb-3"
					style={{
						color: color,
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					關鍵季節分析
				</h1>
				<p className="text-gray-600 text-lg">
					2026年四季{concern}運勢詳解
				</p>
			</div>

			{/* Seasons Grid */}
			<div className="space-y-8">
				{seasonInfo.map((season, index) => (
					<div key={index} className="avoid-break">
						<div className="flex gap-6">
							{/* Decorative large character */}
							<div
								className="flex-shrink-0 w-32 h-32 rounded-2xl flex items-center justify-center text-7xl font-bold text-white"
								style={{
									backgroundColor: color,
									fontFamily: "Noto Serif TC, serif",
								}}
							>
								{season.character}
							</div>

							{/* Season content */}
							<div className="flex-1">
								{/* Season header */}
								<div className="flex items-center gap-3 mb-4">
									<span className="text-3xl">
										{season.icon}
									</span>
									<div>
										<h2
											className="text-3xl font-bold"
											style={{
												color: color,
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											{season.name}
										</h2>
										<p className="text-gray-600 text-sm">
											{season.months}
										</p>
									</div>
								</div>

								{/* Season analysis */}
								<div
									className="p-6 rounded-xl"
									style={{ backgroundColor: `${color}08` }}
								>
									<div className="space-y-3">
										<div>
											<h3
												className="font-bold text-lg mb-2"
												style={{ color: color }}
											>
												運勢概況
											</h3>
											<p className="text-gray-800 leading-relaxed">
												{season.data.overview ||
													"季節分析中..."}
											</p>
										</div>

										<div>
											<h3
												className="font-bold text-lg mb-2"
												style={{ color: color }}
											>
												{concern}重點
											</h3>
											<p className="text-gray-800 leading-relaxed">
												{season.data.concernFocus ||
													`${concern}分析中...`}
											</p>
										</div>

										<div>
											<h3
												className="font-bold text-lg mb-2"
												style={{ color: color }}
											>
												行動建議
											</h3>
											<p className="text-gray-800 leading-relaxed">
												{season.data.advice ||
													"建議分析中..."}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Footer note */}
			<div className="mt-12 text-center">
				<p className="text-gray-500 text-sm">
					* 根據季節變化調整策略，可以更好地把握{concern}機遇
				</p>
			</div>
		</div>
	);
}
