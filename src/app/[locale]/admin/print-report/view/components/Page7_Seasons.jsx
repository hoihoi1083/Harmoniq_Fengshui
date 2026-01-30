// Page 7: 關鍵季節 - Four seasons analysis

export default function Page7_Seasons({ data }) {
	const { seasons: seasonsData, concern, color } = data;

	console.log("🌸 Page7_Seasons received data:", {
		hasSeasons: !!seasonsData,
		seasonsCount: seasonsData?.length,
		seasonsPreview: seasonsData?.[0],
	});

	// Use pre-parsed seasons data from API
	const seasons = seasonsData || [];

	// Legacy parsing function (kept for fallback)
	const parseSeasonalData = (text) => {
		if (!text) return [];

		const seasons = [];

		// Define season data
		const seasonConfig = {
			冬季: { badge: "玄子丑月，水旺", color: "#DC2626" },
			春季: { badge: "寅卯辰月，木旺", color: "#10B981" },
			夏季: { badge: "巳午未月，火土極旺", color: "#DC2626" },
			秋季: { badge: "申酉戌月，金旺", color: "#F59E0B" },
		};

		// Clean the text
		const cleanText = text.replace(/【關鍵季節[^】]*】/, "").trim();

		// Try to match the new format:
		// **冬季**
		// 玄子丑月，水旺
		// （2026年1月-3月）内容...
		const seasonPattern =
			/\*\*([冬春夏秋]季)\*\*\s*\n([^\n]+)\n([^*]+?)(?=\*\*[冬春夏秋]季\*\*|$)/g;

		let match;
		while ((match = seasonPattern.exec(cleanText)) !== null) {
			const seasonName = match[1]; // 冬季, 春季, etc.
			const badge = match[2].trim(); // 玄子丑月，水旺
			const fullContent = match[3].trim();

			// Extract time range from content (like （2026年1月-3月）)
			const timeMatch = fullContent.match(/[（(]([^）)]+)[）)]/);
			const timeRange = timeMatch ? timeMatch[1] : "";

			// Remove time range from content to get clean description
			const content = fullContent.replace(/[（(][^）)]+[）)]/, "").trim();

			if (content.length > 20) {
				seasons.push({
					name: seasonName,
					badge: badge,
					timeRange: timeRange,
					content: content,
					color: seasonConfig[seasonName]?.color || "#6B7280",
				});
			}
		}

		// Fallback: If no seasons found with new format, try old format
		if (seasons.length === 0) {
			const parts = cleanText.split(/(?=冬季|春季|夏季|秋季)/);

			for (const part of parts) {
				const nameMatch = part.match(/^([冬春夏秋]季)/);
				if (nameMatch) {
					const seasonName = nameMatch[1];
					const config = seasonConfig[seasonName];

					if (config) {
						// Extract content after the season name
						const content = part
							.replace(/^[冬春夏秋]季[^\n]*\n?/, "")
							.trim();
						const timeMatch = content.match(/[（(]([^）)]+)[）)]/);
						const timeRange = timeMatch ? timeMatch[1] : "";
						const cleanContent = content
							.replace(/[（(][^）)]+[）)]/, "")
							.trim();

						if (cleanContent.length > 20) {
							seasons.push({
								name: seasonName,
								badge: config.badge,
								timeRange: timeRange,
								content: cleanContent,
								color: config.color,
							});
						}
					}
				}
			}
		}

		return seasons;
	};

	// If we have no parsed seasons, show a placeholder
	if (!seasons || seasons.length === 0) {
		return (
			<div className="page-break bg-white px-16 py-12 min-h-[297mm]">
				<div className="mb-10 text-center">
					<h1
						className="mb-3 text-5xl font-bold"
						style={{
							color: color,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						關鍵季節
					</h1>
					<p className="text-lg text-gray-600">
						2026年{concern}方面的季節性建議
					</p>
				</div>
				<div className="py-20 text-center text-gray-500">
					正在分析季節性趨勢...
				</div>
			</div>
		);
	}

	// Determine current season
	const currentMonth = new Date().getMonth() + 1;
	let currentSeasonName = "冬季";
	if (currentMonth >= 2 && currentMonth <= 4) currentSeasonName = "春季";
	else if (currentMonth >= 5 && currentMonth <= 7) currentSeasonName = "夏季";
	else if (currentMonth >= 8 && currentMonth <= 10)
		currentSeasonName = "秋季";

	// Get season color and background
	const getSeasonStyle = (seasonName) => {
		const styles = {
			冬季: {
				color: "#568CB8", // Blue - matching web side
				bgColor: "#568CB8",
			},
			春季: {
				color: "#7cb856", // Green - matching web side
				bgColor: "#7cb856",
			},
			夏季: {
				color: "#B4003C", // Red - matching web side
				bgColor: "#B4003C",
			},
			秋季: {
				color: "#DEAB20", // Golden - matching web side
				bgColor: "#DEAB20",
			},
		};
		return styles[seasonName] || { color: "#6B7280", bgColor: "#6B7280" };
	};

	return (
		<div className="page-break bg-white px-8 py-12 min-h-[297mm] w-full">
			{/* Page Header - Title with Date */}
			<div className="flex items-start justify-between mb-8">
				<h1
					className="text-5xl font-bold"
					style={{
						color: color,
						fontFamily: "Noto Serif TC, serif",
					}}
				>
					關鍵季節
				</h1>
				<div className="mt-2 text-sm text-right text-gray-400">
					{new Date().getMonth() + 1}/{new Date().getDate()}/
					{new Date().getFullYear() % 100}
				</div>
			</div>

			{/* Seasons List */}
			<div className="space-y-6">
				{seasons.map((season, index) => {
					const cleanSeasonName = season.name.replace(/【[^】]*】/g, "");
				const isCurrentSeason = cleanSeasonName === currentSeasonName;
					const seasonStyle = getSeasonStyle(cleanSeasonName);
					const seasonChar = cleanSeasonName.charAt(0); // Get first character: 冬/春/夏/秋				
				console.log('🎨 Season debug:', { name: season.name, styleColor: seasonStyle.color, seasonColor: season.color });
					return (
						<div
							key={index}
							className="relative avoid-break min-h-[200px]"
						>
							{/* Large Background Season Character - Left Side - NO CONTAINER */}
							<div
								className="absolute top-0 left-0 flex items-start justify-center"
								style={{
									width: "160px",
									height: "100%",
									minHeight: "200px",
								}}
							>
								<div
									className="relative"
									style={{
										width: "160px",
										height: "200px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{/* Large Season Character - Season Color */}
									<span
										style={{
											fontSize: "140px",
											fontFamily: "Noto Serif TC, serif",
											background: `linear-gradient(to bottom, ${seasonStyle.color}, white)`,
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text",
											fontWeight: "bold",
										}}
									>
										{seasonChar}
									</span>
								</div>
							</div>

							{/* Content Box - Overlapping Right Side of Character - NO SHADOW, NO BORDER */}
							<div
								className="relative p-6 bg-white rounded-xl"
								style={{
									marginLeft: "110px",
								}}
							>
								{/* Current Season Indicator - Inside Content Box */}
								{isCurrentSeason && (
									<div
										style={{
											position: "absolute",
											top: "12px",
											right: "12px",
											width: "36px",
											height: "36px",
											backgroundColor: "#DC2626",
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											border: "2px solid white",
											boxShadow:
												"0 2px 4px rgba(0,0,0,0.2)",
											zIndex: 10,
										}}
									>
										<span
											style={{
												color: "white",
												fontSize: "14px",
												fontWeight: "bold",
											}}
										>
											現
										</span>
									</div>
								)}
								{/* Season period */}
								<div className="mb-4">
									<p className="mb-2 text-sm font-medium text-gray-600">
										{season.period || season.badge || ""}
									</p>
								</div>
								{/* Season Content */}
								<div className="prose-sm prose max-w-none">
									<p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
										{season.content}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
