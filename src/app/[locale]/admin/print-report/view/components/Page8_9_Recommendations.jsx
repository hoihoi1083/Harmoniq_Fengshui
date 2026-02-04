// Page 8-9: 開運建議 (針對性建議) + 禁忌行為

import Image from "next/image";

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
							.toLocaleDateString("zh-TW")
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
							開運建議
						</h1>

						{/* Vertical divider */}
						<div className="w-[2px] bg-gray-400"></div>

						{/* Right: Title and description */}
						<div>
							<p className="mb-2 text-xl font-bold text-blue-600">
								建議方案
							</p>
							<p className="text-sm text-gray-500">
								針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。
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
												className="inline-block px-3 py-1 mb-3 text-sm font-medium text-white"
												style={{
													backgroundColor: "#3b82f6",
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
												className="inline-block px-3 py-1 mb-3 text-sm font-medium text-white"
												style={{
													backgroundColor: "#3b82f6",
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
							.toLocaleDateString("zh-TW")
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
							開運建議
						</h1>

						{/* Vertical divider */}
						<div className="w-[2px] bg-gray-400"></div>

						{/* Right: Title and description */}
						<div>
							<p className="mb-2 text-xl font-bold text-red-600">
								禁忌行為
							</p>
							<p className="text-sm text-gray-500">
								針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。
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
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
												{taboo.level || "警惕"}
											</span>
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
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
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
												{taboo.level || "警惕"}
											</span>
											<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600">
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
