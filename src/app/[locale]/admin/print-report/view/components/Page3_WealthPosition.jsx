// Page 3: 財星定位 - Wealth Star Analysis (only for 財運 concern)

export default function Page3_WealthPosition({ data }) {
	const { wealth, color } = data;

	// Extract wealth analysis data
	const wealthData = wealth?.analysis || {};

	return (
		<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden">
			{/* Page Header with decorative element */}
			<div className="text-center mb-12 relative">
				<div
					className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-[120px] opacity-5 font-bold"
					style={{ 
						color: color,
						fontFamily: "Noto Serif TC, serif" 
					}}
				>
					財
				</div>
				<h1
					className="text-5xl font-bold mb-3 relative z-10"
					style={{ 
						color: color,
						fontFamily: "Noto Serif TC, serif" 
					}}
				>
					財星定位分析
				</h1>
				<p className="text-gray-600 text-lg">解析您的財運基礎與累積方式</p>
			</div>

			{/* Wealth Star Position */}
			<div className="mb-10">
				<div
					className="inline-block px-6 py-3 rounded-full mb-6"
					style={{ 
						backgroundColor: `${color}20`,
						border: `2px solid ${color}`
					}}
				>
					<span className="font-bold text-lg" style={{ color: color }}>
						財星位置
					</span>
				</div>
				<div
					className="p-8 rounded-2xl"
					style={{ backgroundColor: `${color}08` }}
				>
					<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
						{wealthData.position || "正在分析您的財星位置..."}
					</p>
				</div>
			</div>

			{/* Wealth Characteristics */}
			<div className="mb-10">
				<div
					className="inline-block px-6 py-3 rounded-full mb-6"
					style={{ 
						backgroundColor: `${color}20`,
						border: `2px solid ${color}`
					}}
				>
					<span className="font-bold text-lg" style={{ color: color }}>
						財運特質
					</span>
				</div>
				<div
					className="p-8 rounded-2xl"
					style={{ backgroundColor: `${color}08` }}
				>
					<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
						{wealthData.characteristics || "正在分析您的財運特質..."}
					</p>
				</div>
			</div>

			{/* Wealth Accumulation Methods */}
			<div className="mb-10">
				<div
					className="inline-block px-6 py-3 rounded-full mb-6"
					style={{ 
						backgroundColor: `${color}20`,
						border: `2px solid ${color}`
					}}
				>
					<span className="font-bold text-lg" style={{ color: color }}>
						財富累積方式
					</span>
				</div>
				<div
					className="p-8 rounded-2xl"
					style={{ backgroundColor: `${color}08` }}
				>
					<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
						{wealthData.methods || "正在分析您的財富累積方式..."}
					</p>
				</div>
			</div>

			{/* Key Advice Box */}
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
					💎 核心建議
				</h3>
				<p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
					{wealthData.keyAdvice || "根據您的財星配置，建議順勢而為，把握最佳時機。"}
				</p>
			</div>
		</div>
	);
}
