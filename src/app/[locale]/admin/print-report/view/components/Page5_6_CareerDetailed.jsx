// Page 5-6: 總流年{Concern} - Detailed analysis with numbered sections and large decorative characters
import Image from "next/image";

export default function Page5_6_CareerDetailed({ data }) {
	const { jixiong, concern, color } = data;

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
					{new Date().toLocaleDateString("zh-TW").replace(/\//g, "/")}
				</div>

				{/* Page Header with large decorative character */}
				<div className="relative mb-6">
					<div
						className="absolute font-bold"
						style={{
							left: "0%",
							top: "255.96%",
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
						<div style={{ display: "flex", gap: "4px" }}>
							<h2
								style={{
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontStyle: "normal",
									fontWeight: 900,
									fontSize: "48px",
									color: "#666",
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
									color: color,
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									fontWeight: 900,

									fontSize: "48px",
								}}
							>
								流年{concernChinese[concern]}
							</h1>
						</div>
					</div>
				</div>

				{/* Numbered sections */}
				<div className="space-y-5" style={{ marginLeft: "100px" }}>
					{auspiciousPoints.length > 0 ? (
						auspiciousPoints.map((item, index) => (
							<div
								key={index}
								className="flex items-start rounded-xl avoid-break"
								style={{
									backgroundColor: `${color}08`,
									gap: "16px",
									padding: "16px",
								}}
							>
								{/* Content */}
								<div className="flex-1 ">
									<div className="flex items-center gap-3">
										<div
											className="flex-shrink-0 font-bold"
											style={{
												color: color,
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
													color: color,
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
														marginBottom: "8px",
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
			<div className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden">
				{/* Page Header with large decorative character */}
				<div className="relative mb-6 text-center">
					<div
						className="absolute top-0 font-bold text-gray-400 transform -translate-x-1/2 -translate-y-8 left-1/2 opacity-5"
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontSize: "140px",
						}}
					>
						凶
					</div>
					<h1
						className="relative z-10 mb-2 font-bold"
						style={{
							color: "#666",
							fontFamily: "Noto Serif TC, serif",
							fontSize: "32px",
						}}
					>
						總流年{concernChinese[concern]} · 凶象
					</h1>
					<p className="text-gray-600" style={{ fontSize: "14px" }}>
						2026年{concern}方面需要留意的挑戰
					</p>
				</div>

				{/* Numbered sections */}
				<div className="space-y-5">
					{inauspiciousPoints.length > 0 ? (
						inauspiciousPoints.map((item, index) => (
							<div
								key={index}
								className="flex items-start border-2 border-gray-200 rounded-xl avoid-break bg-gray-50"
								style={{
									gap: "16px",
									padding: "16px",
								}}
							>
								{/* Number badge */}
								<div
									className="flex items-center justify-center flex-shrink-0 font-bold text-white bg-gray-400 rounded-full"
									style={{
										width: "36px",
										height: "36px",
										fontSize: "16px",
									}}
								>
									{index + 1}
								</div>

								{/* Content */}
								<div className="flex-1">
									{item.title && (
										<h3
											className="font-bold text-gray-700"
											style={{
												fontSize: "15px",
												marginBottom: "8px",
											}}
										>
											{item.title}
										</h3>
									)}
									<p
										className="text-gray-800 whitespace-pre-line"
										style={{
											fontSize: "13px",
											lineHeight: "1.6",
										}}
									>
										{item.content}
									</p>
								</div>
							</div>
						))
					) : (
						<div
							className="text-center rounded-xl bg-gray-50"
							style={{ padding: "24px" }}
						>
							<p className="text-gray-600">正在分析凶象...</p>
						</div>
					)}
				</div>

				{/* Footer note */}
				<div className="mt-8 text-center">
					<p className="text-gray-500" style={{ fontSize: "11px" }}>
						* 提前了解凶象，可以更好地規避風險，化解不利影響
					</p>
				</div>
			</div>
		</>
	);
}
