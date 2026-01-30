// Page 1: 基礎分析 - Four Pillars Chart, Five Elements, Inspirational Quote

export default function Page1_BasicAnalysis({ data }) {
	const { bazi, concern, color } = data;

	// Extract bazi data
	const fourPillars = bazi?.fourPillars || {};
	const fiveElements = bazi?.fiveElements || {};
	const dayMaster = fourPillars.day?.heavenly || "未知";

	// Concern-specific quotes
	const quotes = {
		財運: "財富不是擁有很多，而是需要很少。智慧地累積，才能持久豐盛。",
		健康: "健康是人生最大的財富，養生之道在於順應自然，調和陰陽。",
		感情: "情感的真諦在於相互理解與支持，珍惜眼前人，方得圓滿。",
		事業: "成功不是偶然，而是準備與機遇的結合。順勢而為，方能事半功倍。",
	};

	return (
		<div className="px-16 bg-white page-break pt-4">
			{/* Header with concern color accent */}
			<div className="mb-8 text-center">
				<div
					className="inline-block px-8 py-3 mb-4 font-bold text-white rounded-full"
					style={{ backgroundColor: color, fontSize: "30px" }}
				>
					{concern}運勢分析報告
				</div>
				<h1
					className="mb-2 font-bold"
					style={{
						color: color,
						fontFamily: "Noto Serif TC, serif",
						fontSize: "40px",
						lineHeight: "1.5",
					}}
				>
					2026 年度命理分析
				</h1>
				<p
					className="text-gray-600"
					style={{ fontSize: "16px", lineHeight: "1.6" }}
				>
					基於八字命盤的專業解讀
				</p>
			</div>

			{/* Four Pillars Chart */}
			<div className="mb-12">
				<h2
					className="mb-6 font-bold text-center"
					style={{
						color: color,
						fontFamily: "Noto Serif TC, serif",
						fontSize: "30px",
						lineHeight: "1.5",
					}}
				>
					四柱命盤
				</h2>

				<div className="grid max-w-4xl grid-cols-4 gap-4 mx-auto">
					{["year", "month", "day", "hour"].map((pillar, index) => {
						const pillarData = fourPillars[pillar] || {};
						const labels = ["年柱", "月柱", "日柱", "時柱"];

						return (
							<div
								key={pillar}
								className="p-6 text-center border-4 rounded-lg"
								style={{
									borderColor: color,
									backgroundColor: `${color}08`,
								}}
							>
								<div
									className="py-1 mb-3 font-medium text-white rounded"
									style={{
										backgroundColor: color,
										fontSize: "16px",
									}}
								>
									{labels[index]}
								</div>
								<div className="space-y-3">
									<div
										className="font-bold"
										style={{
											color: color,
											fontFamily: "Noto Serif TC, serif",
											fontSize: "32px",
										}}
									>
										{pillarData.heavenly || "?"}
									</div>
									<div className="h-px mx-4 bg-gray-300"></div>
									<div
										className="font-bold"
										style={{
											color: color,
											fontFamily: "Noto Serif TC, serif",
										}}
									>
										{pillarData.earthly || "?"}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-6 text-center">
					<span
						style={{ fontSize: "16px", lineHeight: "1.6" }}
						className="text-gray-700"
					>
						日主：
						<span
							className="ml-2 font-bold"
							style={{
								color: color,
								fontFamily: "Noto Serif TC, serif",
								fontSize: "30px",
							}}
						>
							{dayMaster}
						</span>
					</span>
				</div>
			</div>

			{/* Five Elements */}
			<div className="mb-12">
				<h2
					className="mb-6 font-bold text-center"
					style={{
						color: color,
						fontFamily: "Noto Serif TC, serif",
						fontSize: "30px",
						lineHeight: "1.5",
					}}
				>
					五行分佈
				</h2>

				<div className="max-w-3xl mx-auto">
					{Object.entries(fiveElements).map(([element, count]) => {
						const elementNames = {
							wood: "木",
							fire: "火",
							earth: "土",
							metal: "金",
							water: "水",
						};

						const elementColors = {
							wood: "#4CAF50",
							fire: "#F44336",
							earth: "#9C6644",
							metal: "#9E9E9E",
							water: "#2196F3",
						};

						const percentage = (count / 8) * 100;

						return (
							<div key={element} className="mb-4">
								<div className="flex items-center justify-between mb-2">
									<span
										className="font-medium"
										style={{ fontSize: "20px" }}
									>
										{elementNames[element]}
									</span>
									<span
										className="font-bold"
										style={{
											color: elementColors[element],
											fontSize: "20px",
										}}
									>
										{count}
									</span>
								</div>
								<div className="w-full h-6 overflow-hidden bg-gray-200 rounded-full">
									<div
										className="h-full transition-all duration-500 rounded-full"
										style={{
											width: `${percentage}%`,
											backgroundColor:
												elementColors[element],
										}}
									></div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Inspirational Quote */}
			<div
				className="max-w-3xl p-8 mx-auto border-l-8 rounded-2xl"
				style={{
					borderColor: color,
					backgroundColor: `${color}08`,
				}}
			>
				<p
					className="text-center"
					style={{
						fontFamily: "Noto Serif TC, serif",
						color: "#333",
						fontSize: "20px",
						lineHeight: "1.6",
					}}
				>
					「{quotes[concern]}」
				</p>
			</div>
		</div>
	);
}
