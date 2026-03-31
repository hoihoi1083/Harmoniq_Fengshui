// Page 8-9: 開運建議 (針對性建議) + 禁忌行為

import Image from "next/image";

export default function Page8_9_Recommendations({ data, locale = "zh-TW" }) {
	const isCn = locale === "zh-CN";
	const dateLocale = locale === "zh-CN" ? "zh-CN" : "zh-TW";
	const { summary, concern, color } = data;

	// Extract suggestions and taboos from the API response
	// API format: { parsed: { suggestions: [...], taboos: [...] } }
	const suggestions = summary?.suggestions || [];
	const taboos = summary?.taboos || [];

	// Fallback suggestions if API returns empty
	const defaultSuggestions = [
		{
			title: isCn ? "方位调整" : "方位調整",
			description: isCn
				? "根据您的八字，建议在2026年多往有利方位活动..."
				: "根據您的八字，建議在2026年多往有利方位活動...",
			icon: "🎯",
			category: isCn ? "核心型" : "核心型",
		},
		{
			title: isCn ? "时机把握" : "時機把握",
			description: isCn
				? "把握关键时段，可以事半功倍..."
				: "把握關鍵時段，可以事半功倍...",
			icon: "💡",
			category: isCn ? "实用型" : "實用型",
		},
		{
			title: isCn ? "人际互动" : "人際互動",
			description: isCn
				? "注意人际关系的经营，贵人相助..."
				: "注意人際關係的經營，貴人相助...",
			icon: "⭐",
			category: isCn ? "提升型" : "提升型",
		},
		{
			title: isCn ? "自我提升" : "自我提升",
			description: isCn
				? "持续学习和提升自我能力..."
				: "持續學習和提升自我能力...",
			icon: "🚀",
			category: isCn ? "突破型" : "突破型",
		},
		{
			title: isCn ? "健康调养" : "健康調養",
			description: isCn
				? "注意身心健康的平衡..."
				: "注意身心健康的平衡...",
			icon: "🔮",
			category: isCn ? "智慧型" : "智慧型",
		},
	];

	// Fallback taboos if API returns empty
	const defaultTaboos = [
		{
			title: isCn ? "避免冲动决策" : "避免衝動決策",
			description: isCn
				? "在重要决定前，建议三思而后行..."
				: "在重要決定前，建議三思而後行...",
			icon: "⚠️",
			severity: isCn ? "高" : "高",
		},
		{
			title: isCn ? "注意健康问题" : "注意健康問題",
			description: isCn
				? "避免过度劳累，注意作息规律..."
				: "避免過度勞累，注意作息規律...",
			icon: "⚠️",
			severity: isCn ? "中" : "中",
		},
		{
			title: isCn ? "慎选合作对象" : "慎選合作對象",
			description: isCn
				? "合作需谨慎评估，避免不必要的损失..."
				: "合作需謹慎評估，避免不必要的損失...",
			icon: "⚠️",
			severity: isCn ? "中" : "中",
		},
		{
			title: isCn ? "远离是非口舌" : "遠離是非口舌",
			description: isCn
				? "保持低调，避免卷入不必要的争端..."
				: "保持低調，避免捲入不必要的爭端...",
			icon: "⚠️",
			severity: isCn ? "高" : "高",
		},
		{
			title: isCn ? "控制财务风险" : "控制財務風險",
			description: isCn
				? "避免高风险投资，稳健理财为上..."
				: "避免高風險投資，穩健理財為上...",
			icon: "⚠️",
			severity: isCn ? "高" : "高",
		},
	];

	const displaySuggestions =
		suggestions.length > 0 ? suggestions : defaultSuggestions;
	const displayTaboos = taboos.length > 0 ? taboos : defaultTaboos;

	return (
		<>
			{/* Page 8: 開運建議 | 建議方案 */}
			<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative">
				{/* Page Header */}
				<div className="relative pb-6 mb-10">
					{/* Date - Top Right */}
					<div
						style={{
							position: "absolute",
							right: "0",
							top: "0",
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 400,
							fontSize: "20px",
							color: "#424242",
							textAlign: "right",
						}}
					>
						{new Date()
							.toLocaleDateString(dateLocale)
							.replace(/\//g, "/")}
					</div>

					{/* Main header content */}
					<div className="flex gap-6">
						{/* Left: 開運建議 */}
						<h1
							className="text-4xl font-bold"
							style={{
								color: color,
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							}}
						>
							{isCn ? "开运建议" : "開運建議"}
						</h1>

						{/* Vertical divider */}
						<div className="w-[2px] bg-gray-400"></div>

						{/* Right: Title and description */}
						<div>
							<p className="mb-2 text-xl font-bold text-blue-600">
								{isCn ? "建议方案" : "建議方案"}
							</p>
							<p className="text-sm text-gray-500">
								{isCn
									? "针对您当前的具体困扰提供实用解决方案，帮助您应对眼前挑战。"
									: "針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。"}
							</p>
						</div>
					</div>
				</div>

				{/* Two-column layout for suggestions */}
				<div className="grid grid-cols-2 gap-8">
					{/* Left column: 01, 02 */}
					<div className="space-y-10">
						{[0, 1].map((index) => {
							const suggestion = displaySuggestions[index];
							if (!suggestion) return null;

							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="mb-2 text-3xl font-bold">
											{String(index + 1).padStart(2, "0")}
										</h2>
										<h3
											className="mb-3 text-xl font-bold"
											style={{
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											{suggestion.title}
										</h3>
										{suggestion.category && (
											<span
												className="inline-block px-3 py-1 mb-3 text-sm font-medium text-white page-8-9-badge page-8-9-badge-suggestion"
												style={{
													backgroundColor: "#3b82f6",
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												{suggestion.category}
											</span>
										)}
									</div>
									<div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
										{suggestion.description}
									</div>
									{/* Horizontal line - 1/4 width */}
									<div className="w-1/4 h-[2px] bg-gray-300 mt-4"></div>
								</div>
							);
						})}
					</div>

					{/* Right column: 03, 04, 05 */}
					<div className="space-y-10">
						{[2, 3, 4].map((index) => {
							const suggestion = displaySuggestions[index];
							if (!suggestion) return null;

							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="mb-2 text-3xl font-bold">
											{String(index + 1).padStart(2, "0")}
										</h2>
										<h3
											className="mb-3 text-xl font-bold"
											style={{
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											{suggestion.title}
										</h3>
										{suggestion.category && (
											<span
												className="inline-block px-3 py-1 mb-3 text-sm font-bold text-white page-8-9-badge page-8-9-badge-suggestion"
												style={{
													backgroundColor: "#3b82f6",
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												{suggestion.category}
											</span>
										)}
									</div>
									<div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
										{suggestion.description}
									</div>
									{/* Horizontal line - 1/4 width */}
									<div className="w-1/4 h-[2px] bg-gray-300 mt-4"></div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Large decorative character at bottom */}
				<div
					className="absolute font-bold"
					style={{
						left: "30%",
						bottom: "0%",
						transform: "translateX(-50%)",
						color: "#13326F",
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "400px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: 0.15,
					}}
				>
					宜
				</div>

				{/* Footer with bottom.png image */}
				<div
					style={{
						position: "absolute",
						bottom: "15mm",
						left: "10mm",
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

			{/* Page 9: 開運建議 | 禁忌行為 */}
			<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative">
				{/* Page Header */}
				<div className="relative pb-6 mb-10">
					{/* Date - Top Right */}
					<div
						style={{
							position: "absolute",
							right: "0",
							top: "0",
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 400,
							fontSize: "20px",
							color: "#424242",
							textAlign: "right",
						}}
					>
						{new Date()
							.toLocaleDateString(dateLocale)
							.replace(/\//g, "/")}
					</div>

					{/* Main header content */}
					<div className="flex gap-6">
						{/* Left: 開運建議 */}
						<h1
							className="text-4xl font-bold"
							style={{
								color: color,
								fontFamily:
									"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							}}
						>
							{isCn ? "开运建议" : "開運建議"}
						</h1>

						{/* Vertical divider */}
						<div className="w-[2px] bg-gray-400"></div>

						{/* Right: Title and description */}
						<div>
							<p className="mb-2 text-xl font-bold text-red-600">
								{isCn ? "禁忌行为" : "禁忌行為"}
							</p>
							<p className="text-sm text-gray-500">
								{isCn
									? "针对您当前的具体困扰提供实用解决方案，帮助您应对眼前挑战。"
									: "針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。"}
							</p>
						</div>
					</div>
				</div>

				{/* Two-column layout for taboos */}
				<div className="grid grid-cols-2 gap-8">
					{/* Left column: 01, 02 */}
					<div className="space-y-8">
						{[0, 1].map((index) => {
							const taboo = displayTaboos[index];
							if (!taboo) return null;

							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="mb-2 text-3xl font-bold">
											{String(index + 1).padStart(2, "0")}
										</h2>
										<h3
											className="mb-3 text-xl font-bold"
											style={{
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											{taboo.title}
										</h3>
										<div className="flex gap-2 mb-3">
											<span
												className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600 page-8-9-badge page-8-9-badge-taboo"
												style={{
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												{taboo.level || "警惕"}
											</span>
											<span
												className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600 page-8-9-badge page-8-9-badge-taboo"
												style={{
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												⚠️ 後果：
												{taboo.consequence ||
													"影響運勢"}
											</span>
										</div>
									</div>
									<div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
										{taboo.description}
									</div>
									{/* Horizontal line - 1/4 width */}
									<div className="w-1/4 h-[2px] bg-gray-300 mt-4"></div>
								</div>
							);
						})}
					</div>

					{/* Right column: 03, 04, 05 */}
					<div className="space-y-8">
						{[2, 3, 4].map((index) => {
							const taboo = displayTaboos[index];
							if (!taboo) return null;

							return (
								<div key={index} className="avoid-break">
									<div className="mb-4">
										<h2 className="mb-2 text-3xl font-bold">
											{String(index + 1).padStart(2, "0")}
										</h2>
										<h3
											className="mb-3 text-xl font-bold"
											style={{
												fontFamily:
													"Noto Serif TC, serif",
											}}
										>
											{taboo.title}
										</h3>
										<div className="flex gap-2 mb-3">
											<span
												className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600 page-8-9-badge page-8-9-badge-taboo"
												style={{
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												{taboo.level || "警惕"}
											</span>
											<span
												className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600 page-8-9-badge page-8-9-badge-taboo"
												style={{
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												⚠️ 後果：
												{taboo.consequence ||
													"影響運勢"}
											</span>
										</div>
									</div>
									<div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
										{taboo.description}
									</div>
									{/* Horizontal line - 1/4 width */}
									<div className="w-1/4 h-[2px] bg-gray-300 mt-4"></div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Large decorative character at bottom */}
				<div
					className="absolute font-bold"
					style={{
						left: "30%",
						bottom: "0%",
						transform: "translateX(-50%)",
						color: "#50001B",
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "400px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: 0.15,
					}}
				>
					禁
				</div>

				{/* Footer with bottom.png image */}
				<div
					style={{
						position: "absolute",
						bottom: "15mm",
						left: "10mm",
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
		</>
	);
}
