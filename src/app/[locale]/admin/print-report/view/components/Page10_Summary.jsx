// Page 10: 破關成蝶，格局煥新 - Overall Summary

export default function Page10_Summary({ data }) {
	const { summary, concern, color } = data;

	if (!summary) {
		return null;
	}

	const currentYear = new Date().getFullYear();

	return (
		<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden flex flex-col">
			{/* Page Number - Top Right */}
			<div className="text-right text-gray-400 text-sm mb-6">
				12/12/12
			</div>

			{/* Title Section */}
			<div className="mb-8">
				<h1 className="text-6xl font-bold mb-3" style={{ fontFamily: "Noto Serif TC, serif" }}>
					我的 <span style={{ color: "#DC2626" }}>{currentYear}</span>
				</h1>
				<h2 
					className="text-4xl font-bold"
					style={{ 
						color: "#1E40AF",
						fontFamily: "Noto Serif TC, serif" 
					}}
				>
					{summary.keyPhrase || "破關成蝶 / 格局煥新"}
				</h2>
			</div>

			{/* Horizontal Divider */}
			<div className="border-t-2 border-gray-800 mb-10"></div>

			{/* Main Content Grid: Core Insights (Left) + Quote (Right) */}
			<div className="grid grid-cols-2 gap-10 mb-10">
				{/* Left: Core Insights */}
				<div>
					<h3 
						className="text-3xl font-bold mb-6"
						style={{ 
							color: "#1E40AF",
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						核<br/>心<br/>洞<br/>察
					</h3>
					<div className="space-y-6">
						{(summary.coreThemes || []).map((theme, index) => (
							<div key={index} className="flex items-start gap-3">
								<span className="text-2xl">•</span>
								<p className="text-gray-900 text-base leading-relaxed pt-1 font-medium">
									{theme}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Right: Quote Bubble */}
				<div className="flex items-center justify-center">
					<div 
						className="relative w-80 h-80 rounded-full flex items-center justify-center p-8"
						style={{ backgroundColor: "#93C5FD" }}
					>
						<p className="text-gray-800 text-center leading-relaxed text-base font-medium">
							<span className="text-2xl">"</span>
							{summary.shareableQuote || "2026年，是打破舊有框架、迎接全新自我的時刻。每一次勇敢的改變，都在為更廣闊的人生鋪路"}
							<span className="text-2xl">"</span>
						</p>
					</div>
				</div>
			</div>

			{/* Year Overview Section */}
			<div className="mb-10">
				<h3 
					className="text-2xl font-bold mb-4"
					style={{ 
						color: "#1E40AF",
						fontFamily: "Noto Serif TC, serif" 
					}}
				>
					全年展望
				</h3>
				<p className="text-gray-800 text-base leading-relaxed">
					{summary.yearOverview || "2026年是你人生格局煥然一新的一年。整體運勢呈現「先破後立」的態勢，上半年可能面臨一些舊有模式的結束或挫戰，這正是為下半年的新生鋪出空間。事業與個人發展將迎來重要的轉折點，需要你拿出勇氣做出選擇。財運上有意想不到的機會，但伴隨風險，需理性分析。人際關係將歷練洗牌，真誠的夥伴將成為你前進的助力。這一年，主動擁抱變化將定成功的關鍵。"}
				</p>
			</div>

			{/* Lucky Colors and Accessories - Bottom Section */}
			<div className="grid grid-cols-2 gap-12 mt-auto">
				{/* Lucky Colors */}
				<div>
					<h3 
						className="text-2xl font-bold mb-6"
						style={{ 
							color: "#1E40AF",
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						開運色彩
					</h3>
					<div className="flex gap-6">
						{(summary.luckyColors || ["金色", "墨綠色", "紫色"]).map((colorName, index) => (
							<div key={index} className="text-center">
								<div 
									className="w-20 h-20 rounded-full mb-2"
									style={{ 
										backgroundColor: colorName === "金色" ? "#B8860B" : 
														colorName === "墨綠色" || colorName === "綠色" ? "#2F4F4F" :
														colorName === "紫色" ? "#663399" :
														colorName === "黑色" ? "#000000" :
														colorName === "白色" ? "#FFFFFF" :
														colorName === "藍色" ? "#1E40AF" : "#808080",
										border: colorName === "白色" ? "2px solid #E5E7EB" : "none"
									}}
								></div>
								<p className="text-sm text-gray-700 font-medium">{colorName}</p>
							</div>
						))}
					</div>
				</div>

				{/* Lucky Accessories */}
				<div>
					<h3 
						className="text-2xl font-bold mb-6"
						style={{ 
							color: "#1E40AF",
							fontFamily: "Noto Serif TC, serif" 
						}}
					>
						開運配飾
					</h3>
					<div className="flex gap-6">
						{(summary.luckyAccessories || ["黃水晶飾品", "金屬錢幣掛飾", "檀木手串"]).map((accessory, index) => (
							<div key={index} className="text-center">
								<div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
									<span className="text-gray-400 text-sm font-medium">{accessory}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-8 text-left">
				<p className="text-gray-500 text-sm font-medium" style={{ fontFamily: "serif" }}>
					HarmoniQ Bell
				</p>
			</div>
		</div>
	);
}
