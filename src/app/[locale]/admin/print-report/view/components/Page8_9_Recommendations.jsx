// Page 8-9: 開運建議 (針對性建議) + 禁忌行為

export default function Page8_9_Recommendations({ data }) {
	const { summary, concern, color } = data;

	// Extract suggestions and taboos from the API response
	// API format: { parsed: { suggestions: [...], taboos: [...] } }
	const suggestions = summary?.suggestions || [];
	const taboos = summary?.taboos || [];

	// Fallback suggestions if API returns empty
	const defaultSuggestions = [
		{
			title: "方位調整",
			description: "根據您的八字，建議在2026年多往有利方位活動...",
			icon: "🎯",
			category: "核心型",
		},
		{
			title: "時機把握",
			description: "把握關鍵時段，可以事半功倍...",
			icon: "💡",
			category: "實用型",
		},
		{
			title: "人際互動",
			description: "注意人際關係的經營，貴人相助...",
			icon: "⭐",
			category: "提升型",
		},
		{
			title: "自我提升",
			description: "持續學習和提升自我能力...",
			icon: "🚀",
			category: "突破型",
		},
		{
			title: "健康調養",
			description: "注意身心健康的平衡...",
			icon: "🔮",
			category: "智慧型",
		},
	];

	// Fallback taboos if API returns empty
	const defaultTaboos = [
		{
			title: "避免衝動決策",
			description: "在重要決定前，建議三思而後行...",
			icon: "⚠️",
			severity: "高",
		},
		{
			title: "注意健康問題",
			description: "避免過度勞累，注意作息規律...",
			icon: "⚠️",
			severity: "中",
		},
		{
			title: "慎選合作對象",
			description: "合作需謹慎評估，避免不必要的損失...",
			icon: "⚠️",
			severity: "中",
		},
		{
			title: "遠離是非口舌",
			description: "保持低調，避免捲入不必要的爭端...",
			icon: "⚠️",
			severity: "高",
		},
		{
			title: "控制財務風險",
			description: "避免高風險投資，穩健理財為上...",
			icon: "⚠️",
			severity: "高",
		},
	];

	const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;
	const displayTaboos = taboos.length > 0 ? taboos : defaultTaboos;

	return (
		<>
			{/* Page 8: 開運建議 | 建議方案 */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Page Header */}
				<div className="flex items-start justify-between mb-10 pb-6 border-b-2 border-gray-200">
					<div>
						<h1
							className="text-4xl font-bold mb-2"
							style={{ 
								color: color,
								fontFamily: "Noto Serif TC, serif" 
							}}
						>
							開運建議
						</h1>
						<p className="text-gray-600">針對{concern}運勢的實用方法</p>
					</div>
					<div className="text-right">
						<p className="text-2xl font-bold">建議方案</p>
						<p className="text-sm text-gray-500">針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。</p>
					</div>
				</div>

				{/* Two-column layout for suggestions */}
				<div className="grid grid-cols-2 gap-8">
					{/* Left column: 01, 03, 05 */}
					<div className="space-y-10">
						{[0, 2, 4].map((index) => {
							const suggestion = displaySuggestions[index];
							if (!suggestion) return null;
							
							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="text-3xl font-bold mb-2">
											{String(index + 1).padStart(2, '0')}
										</h2>
										<h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Noto Serif TC, serif" }}>
											{suggestion.title}
										</h3>
										{suggestion.category && (
											<span
												className="inline-block px-3 py-1 text-sm font-medium text-white mb-3"
												style={{ backgroundColor: "#3b82f6" }}
											>
												{suggestion.category}
											</span>
										)}
									</div>
									<div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
										{suggestion.description}
									</div>
								</div>
							);
						})}
					</div>

					{/* Right column: 02, 04 */}
					<div className="space-y-10">
						{[1, 3].map((index) => {
							const suggestion = displaySuggestions[index];
							if (!suggestion) return null;
							
							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="text-3xl font-bold mb-2">
											{String(index + 1).padStart(2, '0')}
										</h2>
										<h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Noto Serif TC, serif" }}>
											{suggestion.title}
										</h3>
										{suggestion.category && (
											<span
												className="inline-block px-3 py-1 text-sm font-medium text-white mb-3"
												style={{ backgroundColor: "#3b82f6" }}
											>
												{suggestion.category}
											</span>
										)}
									</div>
									<div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
										{suggestion.description}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Page 9: 開運建議 | 禁忌行為 */}
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				{/* Page Header */}
				<div className="flex items-start justify-between mb-10 pb-6 border-b-2 border-gray-200">
					<div>
						<h1
							className="text-4xl font-bold mb-2"
							style={{ 
								color: color,
								fontFamily: "Noto Serif TC, serif" 
							}}
						>
							開運建議
						</h1>
						<p className="text-gray-600">針對{concern}運勢的實用方法</p>
					</div>
					<div className="text-right">
						<p className="text-2xl font-bold text-red-600">禁忌行為</p>
						<p className="text-sm text-gray-500">針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。</p>
					</div>
				</div>

				{/* Two-column layout for taboos */}
				<div className="grid grid-cols-2 gap-8">
					{/* Left column: 01, 03, 05 */}
					<div className="space-y-10">
						{[0, 2, 4].map((index) => {
							const taboo = displayTaboos[index];
							if (!taboo) return null;
							
							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="text-3xl font-bold mb-2">
											{String(index + 1).padStart(2, '0')}
										</h2>
										<h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Noto Serif TC, serif" }}>
											{taboo.title}
										</h3>
										<div className="flex gap-2 mb-3">
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
												{taboo.level || "警惕"}
											</span>
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
												⚠️ 後果：{taboo.consequence || "影響運勢"}
											</span>
										</div>
									</div>
									<div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
										{taboo.description}
									</div>
								</div>
							);
						})}
					</div>

					{/* Right column: 02, 04 */}
					<div className="space-y-10">
						{[1, 3].map((index) => {
							const taboo = displayTaboos[index];
							if (!taboo) return null;
							
							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="text-3xl font-bold mb-2">
											{String(index + 1).padStart(2, '0')}
										</h2>
										<h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Noto Serif TC, serif" }}>
											{taboo.title}
										</h3>
										<div className="flex gap-2 mb-3">
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
												{taboo.level || "警惕"}
											</span>
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
												⚠️ 後果：{taboo.consequence || "影響運勢"}
											</span>
										</div>
									</div>
									<div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
										{taboo.description}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}
