import PrintPageFooter from "./PrintPageFooter";

export default function PageLayoutAnalysis({
	normalizedLayout,
	roomLabelLookup,
	starPanels,
	pageNum,
	totalPages,
}) {
	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className="text-4xl font-bold text-[#374A37] mb-6"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				居室布局分析
			</h2>
			<div className="print-page-content print-scale-90">
				<div
					className="relative border border-gray-200 rounded-xl bg-[#FAFAFA] overflow-hidden"
					style={{ height: "122mm" }}
				>
				<div className="relative w-full h-full">
					{normalizedLayout.rooms.length === 0 && (
						<div className="absolute inset-0 flex items-center justify-center text-sm text-[#6B7280]">
							未偵測到可顯示的房間布局資料
						</div>
					)}
					{normalizedLayout.rooms.map((room) => (
						<div
							key={`room-${room.id || room._idx}`}
							className="absolute border border-[#8FA16E] bg-[#F3F8EB] z-20"
							style={{
								left: `${room.left}%`,
								top: `${room.top}%`,
								width: `${room.w}%`,
								height: `${room.h}%`,
							}}
						>
							<div className="absolute top-1 left-1 max-w-[58%] text-[10px] px-1 py-[1px] rounded bg-white/90 text-[#1F2937] truncate">
								{room.roomType || room.data?.label || "房間"}
							</div>
							<div className="absolute top-1 right-1 text-[9px] px-1 py-[1px] rounded bg-gray-800/80 text-white">
								{roomLabelLookup[room.id || room._idx]?.directionZh || "未標註"}
							</div>
							<div className="absolute bottom-1 left-1 right-1 z-30 flex flex-col gap-[2px]">
								<div className="w-fit max-w-full text-[9px] leading-tight px-1 py-[1px] rounded bg-white/95 text-[#1F2937] whitespace-normal break-words">
									<span
										className={`inline-block w-2 h-2 rounded-full mr-1 ${
											(roomLabelLookup[room.id || room._idx]?.bazhaiFortune || "").includes(
												"吉",
											)
												? "bg-[#22c55e]"
												: "bg-[#f43f5e]"
										}`}
									/>
									八宅：
									{roomLabelLookup[room.id || room._idx]?.bazhaiName || "未定"}
								</div>
								<div className="w-fit max-w-full text-[9px] leading-tight px-1 py-[1px] rounded bg-white/95 text-[#1F2937] whitespace-normal break-words">
									<span
										className={`inline-block w-2 h-2 rounded-full mr-1 ${
											roomLabelLookup[room.id || room._idx]?.starType === "吉"
												? "bg-[#3b82f6]"
												: "bg-[#7e22ce]"
										}`}
									/>
									流年：{roomLabelLookup[room.id || room._idx]?.starName || "未知"}
								</div>
							</div>
						</div>
					))}
					{normalizedLayout.furniture.map((item) => {
						const iconSrc =
							item.activeIcon ||
							item.data?.activeIcon ||
							item.data?.icon ||
							item.icon;
						if (!iconSrc) return null;
						return (
							<img
								key={`fur-${item.id || item._idx}`}
								src={iconSrc}
								alt={item.data?.label || "furniture"}
								className="absolute object-contain z-[25]"
								style={{
									left: `${item.left}%`,
									top: `${item.top}%`,
									width: `${Math.max(item.w, 1.8)}%`,
									height: `${Math.max(item.h, 1.8)}%`,
									transform:
										item.rotation != null ? `rotate(${item.rotation}deg)` : "none",
									transformOrigin: "center",
								}}
							/>
						);
					})}
				</div>
				</div>
				<div className="mt-3 grid grid-cols-2 gap-3 text-[15px] text-[#1F2937]">
				<div className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
					<span className="font-semibold">八宅吉凶：</span>
					<span className="inline-flex items-center gap-2">
						<span className="w-4 h-4 rounded-full bg-[#22c55e] inline-block" />
						吉位
					</span>
					<span className="inline-flex items-center gap-2">
						<span className="w-4 h-4 rounded-full bg-[#f43f5e] inline-block" />
						凶位
					</span>
				</div>
				<div className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
					<span className="font-semibold">流年吉凶：</span>
					<span className="inline-flex items-center gap-2">
						<span className="w-4 h-4 rounded-full bg-[#3b82f6] inline-block" />
						吉星
					</span>
					<span className="inline-flex items-center gap-2">
						<span className="w-4 h-4 rounded-full bg-[#7e22ce] inline-block" />
						凶星
					</span>
				</div>
				</div>
				<div className="mt-3 grid grid-cols-1 gap-3 text-[13px]">
				<div className="rounded-2xl border border-gray-200 p-3 shadow-sm">
					<div
						className="text-[32px] font-bold text-[#6B7D00] mb-2"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						四吉位&流年飛星
					</div>
					<div className="space-y-1.5">
						{starPanels.lucky.map((row, idx) => (
							<div
								key={`lucky-${idx}`}
								className="grid grid-cols-[1.6fr_0.9fr_1.3fr_0.7fr] gap-1"
							>
								<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#374A37] font-semibold">
									{row.name}
								</div>
								<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 text-center font-semibold text-[#374A37]">
									{row.directionZh}
								</div>
								<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#374A37] font-semibold">
									{row.star}
								</div>
								<div className="bg-[#A0B10F] text-white rounded-lg px-2 py-1 text-center font-bold">吉</div>
							</div>
						))}
					</div>
				</div>
				<div className="rounded-2xl border border-gray-200 p-3 shadow-sm">
					<div
						className="text-[32px] font-bold text-[#AF004A] mb-2"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						四凶位&流年飛星
					</div>
					<div className="space-y-1.5">
						{starPanels.unlucky.map((row, idx) => (
							<div
								key={`bad-${idx}`}
								className="grid grid-cols-[1.6fr_0.9fr_1.3fr_0.7fr] gap-1"
							>
								<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#9B1C4D] font-semibold">
									{row.name}
								</div>
								<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 text-center font-semibold text-[#9B1C4D]">
									{row.directionZh}
								</div>
								<div className="bg-[#F3F4F6] rounded-lg px-2 py-1 truncate text-[#9B1C4D] font-semibold">
									{row.star}
								</div>
								<div className="bg-[#A0B10F] text-white rounded-lg px-2 py-1 text-center font-bold">凶</div>
							</div>
						))}
					</div>
				</div>
				</div>
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
