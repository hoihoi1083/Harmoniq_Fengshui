// Page 10-11: 我的2026 - Final summary with quote, lucky colors, and accessories

export default function Page10_11_MySummary({ data, locale = "zh-TW" }) {
	const dateLocale = locale === "zh-CN" ? "zh-CN" : "zh-TW";
	const { summary, concern, color, birthday, gender } = data;

	// Extract summary data
	const summaryContent = summary?.content || "正在生成您的年度總結...";
	const luckyColors = summary?.luckyColors || ["紅色", "金色", "紫色"];
	const luckyAccessories = summary?.luckyAccessories || [
		"紅繩手鍊",
		"金屬飾品",
		"玉石吊墜",
	];
	const yearQuote =
		summary?.quote || "順勢而為，把握機遇，2026年必將收穫滿滿。";

	const concernEmoji = {
		財運: "💰",
		健康: "🏥",
		感情: "❤️",
		事業: "💼",
	};

	return (
		<>
			{/* Page 10: Main Summary */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Date - Top Right */}
				<div className="text-right text-gray-400 text-sm mb-6">
					{new Date().toLocaleDateString(dateLocale).replace(/\//g, "/")}
				</div>

				{/* Page Header with large decorative year */}
				<div className="text-center mb-12 relative">
					<div
						className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-[180px] opacity-5 font-bold"
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						我
					</div>
					<h1
						className="text-6xl font-bold mb-3 relative z-10"
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						我的 2026
					</h1>
					<p className="text-gray-600 text-xl">
						{concernEmoji[concern]} {concern}運勢總結
					</p>
				</div>

				{/* Year Summary Content */}
				<div
					className="p-10 rounded-2xl mb-12"
					style={{ backgroundColor: `${color}10` }}
				>
					<p
						className="text-gray-800 text-xl leading-loose whitespace-pre-line"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						{summaryContent}
					</p>
				</div>

				{/* Lucky Colors Section */}
				<div className="mb-10">
					<h2
						className="text-3xl font-bold mb-6 flex items-center gap-3"
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						<span className="text-4xl">🎨</span>
						開運顏色
					</h2>
					<div className="flex gap-6 justify-center">
						{luckyColors.map((colorName, index) => {
							// Map Chinese color names to hex values
							const colorMap = {
								紅色: "#E53935",
								橙色: "#FB8C00",
								黃色: "#FDD835",
								金色: "#FFD700",
								綠色: "#43A047",
								青色: "#00ACC1",
								藍色: "#1E88E5",
								紫色: "#8E24AA",
								粉色: "#EC407A",
								白色: "#FFFFFF",
								黑色: "#212121",
								灰色: "#757575",
								棕色: "#6D4C41",
							};

							const displayColor = colorMap[colorName] || color;

							return (
								<div key={index} className="text-center">
									<div
										className="w-24 h-24 rounded-full mx-auto mb-3 border-4"
										style={{
											backgroundColor: displayColor,
											borderColor: color,
										}}
									></div>
									<p
										className="font-bold text-lg"
										style={{ color: color }}
									>
										{colorName}
									</p>
								</div>
							);
						})}
					</div>
				</div>

				{/* Lucky Accessories Section */}
				<div className="mb-10">
					<h2
						className="text-3xl font-bold mb-6 flex items-center gap-3"
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						<span className="text-4xl">✨</span>
						開運配飾
					</h2>
					<div className="grid grid-cols-3 gap-6">
						{luckyAccessories.map((accessory, index) => (
							<div
								key={index}
								className="p-6 rounded-xl border-2 text-center"
								style={{
									borderColor: color,
									backgroundColor: `${color}05`,
								}}
							>
								<p
									className="text-lg font-medium"
									style={{ color: color }}
								>
									{accessory}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Page 11: Final Quote and Closing */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm] flex flex-col justify-between">
				{/* Inspirational Quote */}
				<div className="flex-1 flex items-center justify-center">
					<div
						className="max-w-3xl p-12 rounded-3xl border-8"
						style={{
							borderColor: color,
							backgroundColor: `${color}08`,
						}}
					>
						<p
							className="text-3xl leading-loose text-center mb-8"
							style={{
								fontFamily: "Noto Serif TC, serif",
								color: "#333",
							}}
						>
							「{yearQuote}」
						</p>
						<div className="text-center">
							<div
								className="inline-block px-6 py-2 rounded-full text-white font-bold"
								style={{ backgroundColor: color }}
							>
								2026 丙午年
							</div>
						</div>
					</div>
				</div>

				{/* Footer Information */}
				<div className="text-center space-y-6">
					<div
						className="inline-block w-32 h-1 rounded"
						style={{ backgroundColor: color }}
					></div>

					<div className="text-gray-600">
						<p className="text-lg mb-2">出生日期：{birthday}</p>
						<p className="text-lg mb-2">
							性別：{gender === "male" ? "男" : "女"}
						</p>
						<p className="text-lg">分析類別：{concern}</p>
					</div>

					<div
						className="inline-block w-32 h-1 rounded"
						style={{ backgroundColor: color }}
					></div>

					<p className="text-gray-500 text-sm mt-6">
						本報告基於傳統八字命理學原理生成，僅供參考。
					</p>
					<p className="text-gray-500 text-sm">
						實際運勢受多方因素影響，建議結合實際情況靈活運用。
					</p>

					<div className="mt-8">
						<p
							className="text-2xl font-bold"
							style={{
								color: color,
								fontFamily: "Noto Serif TC, serif",
							}}
						>
							祝您 2026 年順遂安康！
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
