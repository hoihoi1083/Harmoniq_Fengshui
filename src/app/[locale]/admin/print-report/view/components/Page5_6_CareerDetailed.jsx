// Page 5-6: 總流年{Concern} - Detailed analysis with numbered sections and large decorative characters
import Image from "next/image";

export default function Page5_6_CareerDetailed({ data, locale = "zh-TW" }) {
	const dateLocale = locale === "zh-CN" ? "zh-CN" : "zh-TW";
	const { jixiong, concern, color } = data;

	// Debug logging
	console.log("📄 Page5_6_CareerDetailed received data:", {
		jixiong,
		jixiangCount: jixiong?.jixiang?.length,
		xiongxiangCount: jixiong?.xiongxiang?.length,
	});

	// Log first item details with FULL content
	if (jixiong?.jixiang?.[0]) {
		console.log("🎯 First 吉象 item FULL CONTENT:", {
			title: jixiong.jixiang[0].title,
			contentLength: jixiong.jixiang[0].content?.length,
			FULL_CONTENT: jixiong.jixiang[0].content, // Show EVERYTHING
		});

		// Show what split produces
		const splitResult = jixiong.jixiang[0].content
			.replace(/^•\s*/, "")
			.split(/(?=原理：|時機：|做法：)/g)
			.filter((part) => part.trim());
		console.log("📋 Split result:", splitResult);
	}

	if (jixiong?.xiongxiang?.[0]) {
		console.log("⚠️ First 凶象 item FULL CONTENT:", {
			title: jixiong.xiongxiang[0].title,
			contentLength: jixiong.xiongxiang[0].content?.length,
			FULL_CONTENT: jixiong.xiongxiang[0].content, // Show EVERYTHING
		});

		// Show what split produces
		const splitResult = jixiong.xiongxiang[0].content
			.replace(/^•\s*/, "")
			.split(/(?=原理：|時機：|風險：|預防：)/g)
			.filter((part) => part.trim());
		console.log("📋 Split result:", splitResult);
	}

	// Extract jixiong (吉象 and 凶象) data
	// The data structure is: { jixiang: [{title, content}], xiongxiang: [{title, content}] }
	const auspiciousItems = jixiong?.jixiang || jixiong?.auspicious || [];
	const inauspiciousItems =
		jixiong?.xiongxiang || jixiong?.inauspicious || [];

	// Convert to array format if they're already arrays, otherwise parse strings
	const getItemsArray = (items) => {
		if (Array.isArray(items) && items.length > 0 && items[0].title) {
			// Already in correct format: [{title, content}, ...]
			return items;
		}
		if (typeof items === "string") {
			// Legacy string format, parse it
			const lines = items.split("\n").filter((line) => line.trim());
			return lines
				.filter((line) => line.includes("•") || line.match(/^\d+\./))
				.map((line, index) => ({
					title: `要點 ${index + 1}`,
					content: line
						.replace(/^•\s*/, "")
						.replace(/^\d+\.\s*/, "")
						.trim(),
				}));
		}
		return [];
	};

	const auspiciousPoints = getItemsArray(auspiciousItems);
	const inauspiciousPoints = getItemsArray(inauspiciousItems);

	const concernChinese = {
		財運: "財運",
		健康: "健康",
		感情: "感情",
		事業: "事業",
	};

	return (
		<>
			{/* Page 5: 吉象 (Auspicious) */}
			<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative">
				{/* Date in top right */}
				<div
					style={{
						position: "absolute",
						top: "50px",
						right: "30px",
						color: "#666",
					}}
				>
					{new Date().toLocaleDateString(dateLocale).replace(/\//g, "/")}
				</div>

				{/* Page Header with large decorative character */}
				<div className="relative mb-6">
					<div
						className="absolute font-bold"
						style={{
							left: "0%",
							top: "300.96%",
							bottom: "67.7%",
							color: "#13326F",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "200px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							opacity: 0.15,
						}}
					>
						吉
					</div>

					{/* Header with vertical 總 and horizontal text */}
					<div
						style={{
							display: "flex",
							gap: "10px",
							marginBottom: "90px",
						}}
					>
						<div
							style={{
								display: "flex",
								gap: "4px",
								flex: "0 0 auto",
								minWidth: "48px",
							}}
						>
							<h2
								style={{
									display: "block",
									width: "48px",
									minWidth: "48px",
									maxWidth: "48px",
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontStyle: "normal",
									fontWeight: 900,
									fontSize: "48px",
									color: "#666",
									lineHeight: "1",
									printColorAdjust: "exact",
									WebkitPrintColorAdjust: "exact",
								}}
							>
								總
							</h2>
						</div>

						<div
							style={{
								flex: 1,
								borderLeft: "2px solid #d1d5db",
								paddingLeft: "30px",
								display: "flex",
							}}
						>
							<h1
								className="relative z-10 font-bold"
								style={{
									color: "#7F8CA6",
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontWeight: 900,

									fontSize: "48px",
									lineHeight: "1",
									printColorAdjust: "exact",
									WebkitPrintColorAdjust: "exact",
								}}
							>
								流年{concernChinese[concern]}
							</h1>
						</div>
					</div>
				</div>

				{/* Numbered sections */}
				<div className="space-y-1" style={{ marginLeft: "100px" }}>
					{auspiciousPoints.length > 0 ? (
						auspiciousPoints.map((item, index) => (
							<div
								key={index}
								className="flex items-start rounded-xl avoid-break"
								style={{
									gap: "16px",
									padding: "20px",
								}}
							>
								{/* Content */}
								<div className="flex-1 ">
									<div className="flex items-center gap-3">
										<div
											className="flex-shrink-0 font-bold"
											style={{
												color: "#7F8CA6",
												fontSize: "30px",
												fontFamily:
													"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												minWidth: "30px",
											}}
										>
											{String(index + 1).padStart(2, "0")}
										</div>
										{item.title && (
											<h3
												className="font-bold"
												style={{
													color: "#7F8CA6",
													fontSize: "25px",
													fontFamily:
														"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												}}
											>
												{item.title}
											</h3>
										)}
									</div>
									<div
										className="text-gray-800"
										style={{
											fontSize: "14px",
											lineHeight: "1.6",
											marginLeft: "45px",
										}}
									>
										{item.content
											.replace(/^•\s*/, "")
											.split(/(?=原理：|時機：|做法：)/g)
											.filter((part) => part.trim())
											.map((part, idx) => (
												<p
													key={idx}
													style={{
														marginBottom: "1px",
													}}
												>
													• {part.trim()}
												</p>
											))}
									</div>
								</div>
							</div>
						))
					) : (
						<div
							className="text-center rounded-xl"
							style={{
								backgroundColor: `${color}08`,
								padding: "24px",
							}}
						>
							<p className="text-gray-600">正在分析吉象...</p>
						</div>
					)}
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

			{/* Page 6: 凶象 (Inauspicious) */}
			<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative">
				{/* Date in top right */}
				<div
					style={{
						position: "absolute",
						top: "50px",
						right: "30px",
						color: "#666",
					}}
				>
					{new Date().toLocaleDateString(dateLocale).replace(/\//g, "/")}
				</div>

				{/* Page Header with large decorative character */}
				<div className="relative mb-6">
					<div
						className="absolute font-bold"
						style={{
							left: "0%",
							top: "300.96%",
							bottom: "67.7%",
							color: "#50001B",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "200px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							opacity: 0.15,
						}}
					>
						凶
					</div>

					{/* Header with vertical 總 and horizontal text */}
					<div
						style={{
							display: "flex",
							gap: "10px",
							marginBottom: "90px",
						}}
					>
						<div
							style={{
								display: "flex",
								gap: "4px",
								flex: "0 0 auto",
								minWidth: "48px",
							}}
						>
							<h2
								style={{
									display: "block",
									width: "48px",
									minWidth: "48px",
									maxWidth: "48px",
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontStyle: "normal",
									fontWeight: 900,
									fontSize: "48px",
									color: "#666",
									lineHeight: "1",
									printColorAdjust: "exact",
									WebkitPrintColorAdjust: "exact",
								}}
							>
								總
							</h2>
						</div>

						<div
							style={{
								flex: 1,
								borderLeft: "2px solid #d1d5db",
								paddingLeft: "30px",
								display: "flex",
							}}
						>
							<h1
								className="relative z-10 font-bold"
								style={{
									color: "#50001B",
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontWeight: 900,

									fontSize: "48px",
									lineHeight: "1",
									printColorAdjust: "exact",
									WebkitPrintColorAdjust: "exact",
								}}
							>
								流年{concernChinese[concern]}
							</h1>
						</div>
					</div>
				</div>

				{/* Numbered sections */}
				<div className="space-y-1" style={{ marginLeft: "100px" }}>
					{inauspiciousPoints.length > 0 ? (
						inauspiciousPoints.map((item, index) => (
							<div
								key={index}
								className="flex items-start rounded-xl avoid-break"
								style={{
									gap: "16px",
									padding: "10px",
								}}
							>
								{/* Content */}
								<div className="flex-1 ">
									<div className="flex items-center gap-3">
										<div
											className="flex-shrink-0 font-bold"
											style={{
												color: "#50001B",
												fontSize: "30px",
												fontFamily:
													"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												minWidth: "30px",
											}}
										>
											{String(index + 1).padStart(2, "0")}
										</div>
										{item.title && (
											<h3
												className="font-bold"
												style={{
													color: "#50001B",
													fontSize: "25px",
													fontFamily:
														"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
												}}
											>
												{item.title}
											</h3>
										)}
									</div>
									<div
										className="text-gray-800"
										style={{
											fontSize: "14px",
											lineHeight: "1.6",
											marginLeft: "45px",
										}}
									>
										{item.content
											.replace(/^•\s*/, "")
											.split(
												/(?=原理：|時機：|風險：|預防：)/g,
											)
											.filter((part) => part.trim())
											.map((part, idx) => (
												<p
													key={idx}
													style={{
														marginBottom: "1px",
													}}
												>
													• {part.trim()}
												</p>
											))}
									</div>
								</div>
							</div>
						))
					) : (
						<div
							className="text-center rounded-xl"
							style={{
								backgroundColor: "#50001B08",
								padding: "24px",
							}}
						>
							<p className="text-gray-600">正在分析凶象...</p>
						</div>
					)}
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
		</>
	);
}
