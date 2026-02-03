// Page 7: 關鍵季節 - Four seasons analysis
import Image from "next/image";

export default function Page7_Seasons({ data }) {
	const { seasons: seasonsData, concern, color } = data;

	console.log("🌸 Page7_Seasons received data:", {
		hasSeasons: !!seasonsData,
		seasonsCount: seasonsData?.length,
		seasonsPreview: seasonsData?.[0],
		seasonsType: typeof seasonsData,
		seasonsIsArray: Array.isArray(seasonsData),
	});

	// Use pre-parsed seasons data from API - ensure it's an array
	const seasons = Array.isArray(seasonsData) ? seasonsData : [];

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
			<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden">
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
				color: "#6383C2", // Blue - matching web side
				bgColor: "#6383C2",
			},
			春季: {
				color: "#80882E", // Green - matching web side
				bgColor: "#80882E",
			},
			夏季: {
				color: "#6E0B2C", // Red - matching web side
				bgColor: "#6E0B2C",
			},
			秋季: {
				color: "#A17E20", // Golden - matching web side
				bgColor: "#A17E20",
			},
		};
		return styles[seasonName] || { color: "#6B7280", bgColor: "#6B7280" };
	};

	// Split seasons into two pages (2 seasons per page)
	const firstPageSeasons = seasons.slice(0, 2);
	const secondPageSeasons = seasons.slice(2, 4);

	// Function to render a season page
	const renderSeasonPage = (seasonsToRender, pageNumber) => (
		<div
			className="page-break page-7-seasons bg-white h-[297mm] overflow-hidden w-full"
			style={{ position: "relative", padding: "15mm 20mm" }}
		>
			{/* Page Header - Title with Date (no border/line) */}
			<div
				className="mb-8 page-7-header"
				style={{ border: "none", outline: "none" }}
			>
				<div
					className="flex items-start justify-between"
					style={{ border: "none", outline: "none" }}
				>
					<h1
						className="text-5xl font-bold page-7-title"
						style={{
							color: color,
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							border: "none",
							boxShadow: "none",
							textDecoration: "none",
						}}
					>
						關鍵季節 {pageNumber === 2 ? "(續)" : ""}
					</h1>
					<div
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontStyle: "extrabold",
							fontWeight: 400,
							fontSize: "20px",
							lineHeight: "14px",
							color: "#424242",
							textAlign: "right",
						}}
					>
						{new Date()
							.toLocaleDateString("zh-TW")
							.replace(/\//g, "/")}
					</div>
				</div>
			</div>
			{/* Seasons List */}
			<div className="space-y-10">
				{seasonsToRender.map((season, index) => {
					const cleanSeasonName = season.name.replace(
						/【[^】]*】/g,
						""
					);
					const isCurrentSeason =
						cleanSeasonName === currentSeasonName;
					const seasonStyle = getSeasonStyle(cleanSeasonName);
					const seasonChar = cleanSeasonName.charAt(0); // Get first character: 冬/春/夏/秋

					console.log("🎨 Season debug:", {
						name: season.name,
						styleColor: seasonStyle.color,
						seasonColor: season.color,
					});

					// Clean content by removing disclaimers and core reminders
					const cleanContent = (season.content || "")
						.replace(/四季財運核心提醒：[\s\S]*?(?=四季|$)/g, "")
						.replace(/您的命局喜[\s\S]*?(?=免責聲明|$)/g, "")
						.replace(/財運與五行[\s\S]*?(?=免責聲明|$)/g, "")
						.replace(/所有建議[\s\S]*?(?=免責聲明|$)/g, "")
						.replace(/免責聲明：[\s\S]*$/g, "")
						.replace(/以上分析[\s\S]*?(?=--|$)/g, "")
						.replace(/--\s*$/g, "")
						.trim();

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
											fontSize: "180px",
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											backgroundImage: `linear-gradient(to bottom, ${seasonStyle.color}, #C5C5C5)`,
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
								className="relative px-1 py-6 bg-white rounded-xl"
								style={{
									marginLeft: "110px",
								}}
							>
								{/* Current Season Indicator - Inside Content Box */}
								{isCurrentSeason && (
									<div
										style={{
											position: "absolute",
											top: "15px",
											right: "12px",
											width: "36px",
											height: "36px",
											backgroundColor: "#DC2626",
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
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
								<div className="mb-2">
									<strong className="mb-2 font-bold text-black text-md">
										{season.period || season.badge || ""}
									</strong>
								</div>
								{/* Season Content */}
								<div className="prose-sm prose max-w-none">
									<p className="text-sm leading-relaxed text-black whitespace-pre-wrap">
										{cleanContent}
									</p>
								</div>
							</div>
						</div>
					);
				})}
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

	return (
		<>
			{renderSeasonPage(firstPageSeasons, 1)}
			{renderSeasonPage(secondPageSeasons, 2)}
		</>
	);
}
