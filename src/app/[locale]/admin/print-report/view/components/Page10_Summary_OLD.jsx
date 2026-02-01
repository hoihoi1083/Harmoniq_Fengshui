// Page 10: 破關成蝶，格局煥新 - Overall Summary

import Image from "next/image";

export default function Page10_Summary({ data }) {
	const { summary, concern, color } = data;

	if (!summary) {
		return null;
	}

	// Debug: Check if AI generated content exists
	console.log("📊 Page10 Summary Data:", {
		hasLuckyAccessories: !!summary.luckyAccessories,
		luckyAccessories: summary.luckyAccessories,
		hasLuckyColors: !!summary.luckyColors,
		luckyColors: summary.luckyColors,
	});

	const currentYear = new Date().getFullYear();

	// Color mapping for lucky colors
	const colorMap = {
		金色: "#B8860B",
		墨綠色: "#2F4F4F",
		綠色: "#2F4F4F",
		紫色: "#663399",
		黑色: "#000000",
		白色: "#FFFFFF",
		藍色: "#1E40AF",
		紅色: "#DC2626",
		橙色: "#EA580C",
		黃色: "#FBBF24",
		粉色: "#EC4899",
		棕色: "#92400E",
		灰色: "#808080",
	};

	return (
		<div className="page-break relative bg-white px-12 py-10 h-[297mm] overflow-hidden flex flex-col">
			{/* Page Number - Top Right */}
			<div
				style={{
					fontSize: "20px",
					color: "#666",
					fontFamily: "Noto Serif TC, serif",
					textAlign: "right",
				}}
			>
				{new Date().toLocaleDateString("zh-TW").replace(/\//g, "/")}
			</div>

			{/* Title Section */}
			<div className="mb-8">
				<h1
				style={{
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					letterSpacing: "0.2em",
					fontSize: "72px",
					fontWeight: "bold",
					marginBottom: "40px",
				}}
			>
				我的
				<span
					style={{
						background:
							"linear-gradient(to bottom, #C43A3A, #880000)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
					}}
				>
					{currentYear}
				</span>
			</h1>
			<h2
				style={{
					color: "#002C84",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontSize: "48px",
					fontWeight: "bold",
				</h2>
			</div>

			{/* Horizontal Divider */}
			<div className="mb-10 border-t-2 border-gray-800"></div>

			{/* Main Content Grid: Core Insights (Left) + Quote (Right) */}
			<div className="grid grid-cols-2 gap-8 mb-10">
				{/* Left: Core Insights */}
				<div className="flex gap-6">
					<h3
						className="text-5xl font-bold"
						style={{
							background:
								"linear-gradient(to bottom, #002C84, #8595B5)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							writingMode: "vertical-rl",
						}}
					>
						核心洞察
					</h3>
					<div className="flex gap-8 ml-5">
						{(summary.coreThemes || []).map((theme, index) => (
							<div
								key={index}
								className="flex flex-col items-center"
							>
								<span
									className="mb-2 text-2xl"
									style={{ color: "#002C84" }}
								>
									•
								</span>
								<p
									className="text-base font-medium"
									style={{
										writingMode: "vertical-lr",

										color: "#333",
										maxHeight: "150px",
										lineHeight: "1.8",
									}}
								>
									{theme}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Right: Quote Bubble */}
				<div className="flex items-center justify-center">
					<div
						className="relative flex items-center justify-center p-5 rounded-full w-55 h-55"
						style={{ backgroundColor: "#93C5FD" }}
					>
						<p className="text-base font-medium leading-relaxed text-center text-gray-800">
							<span className="text-xl">"</span>
							{summary.shareableQuote ||
								"2026年，是打破舊有框架、迎接全新自我的時刻。每一次勇敢的改變，都在為更廣阔的人生铺路。"}
							<span className="text-2xl">"</span>
						</p>
					</div>
				</div>
			</div>
			{/* Horizontal Divider */}
			<div className="mb-5 border-t-2 border-gray-800"></div>

			{/* Year Overview Section */}
			<div className="flex gap-6 mb-1">
				<h3
					className="text-3xl font-bold"
					style={{
						color: "#002C84",
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						borderRight: "2px solid #002C84",
						paddingRight: "20px",
						letterSpacing: "0.2em",
					}}
				>
					全年展望
				</h3>
				<p className="flex-1 text-base leading-relaxed text-gray-800">
					{summary.yearOverview ||
						"2026年是你人生格局煥然一新的一年。整體運勢呈現「先破後立」的態勢，上半年可能面臨一些舊有模式的結束或挫戰，這正是為下半年的新生鋪出空間。事業與個人發展將迎來重要的轉折點，需要你拿出勇氣做出選擇。財運上有意想不到的機會，但伴隨風險，需理性分析。人際關係將歷練洗牌，真誠的夥伴將成為你前進的助力。這一年，主動擁抱變化將定成功的關鍵。"}
				</p>
			</div>

			{/* Lucky Colors and Accessories - Bottom Section */}
			<div className="grid grid-cols-2 gap-12 mt-8 mb-16">
				{/* Lucky Colors */}
				<div>
					<h3
						className="mb-6 text-2xl font-bold"
						style={{
							color: "#002C84",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							letterSpacing: "0.2em",
						}}
					>
						開運色彩
					</h3>
					<div className="flex gap-6">
						{(
							summary.luckyColors || ["金色", "墨綠色", "紫色"]
						).map((colorName, index) => (
							<div key={index} className="text-center">
								<div
									className="mb-2 rounded-full"
									style={{
										width: "90px",
										height: "90px",
										backgroundColor:
											colorMap[colorName] || "#808080",
										border:
											colorName === "白色"
												? "2px solid #E5E7EB"
												: "none",
									}}
								></div>
								<p style={{
									fontSize: "14px",
									fontWeight: "500",
									color: "#6B7280",
								}}>
									{colorName}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Lucky Accessories */}
				<div>
					<h3
						className="mb-6 text-2xl font-bold"
						style={{
							color: "#002C84",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							letterSpacing: "0.2em",
						}}
					>
						開運配飾
					</h3>
					<div className="flex gap-6">
						{(
							summary.luckyAccessories || [
								"黃水晶飾品",
								"金屬錢幣掛飾",
								"檀木手串",
							]
						).map((accessory, index) => (
							<div key={index} className="text-center">
								<div 
									className="flex items-center justify-center rounded-full"
									style={{
										backgroundColor: "#E5E7EB",
										width: "110px",
										height: "110px",
										padding: "12px"
									}}
								>
									<span 
										className="text-sm font-medium"
										style={{ color: "#6B7280" }}
									>
										{accessory}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer with bottom.png image */}
			<div
				style={{
					position: "absolute",
					bottom: "15mm",
					left: "20mm",
					width: "auto",
					height: "auto",
				}}
			>
				<Image
					src="/images/report/bottom.png"
					alt="Footer decoration"
					width={30}
					height={10}
					style={{
						objectFit: "contain",
					}}
				/>
			</div>
		</div>
	);
}
