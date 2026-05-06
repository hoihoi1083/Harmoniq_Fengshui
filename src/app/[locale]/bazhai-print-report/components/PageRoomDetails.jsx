import {
	getBazhaiFortuneByGroup,
	getBazhaiNameByGroup,
} from "@/lib/bazhaiConfig";
import {
	DIRECTION_ZH,
	localizeDirectionText,
	parseRoomAI,
} from "../bazhaiPrintHelpers";
import PrintPageFooter from "./PrintPageFooter";

export default function PageRoomDetails({
	rooms,
	chunkIndex,
	mingGuaGroup,
	pageNum,
	totalPages,
}) {
	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className={`text-4xl font-bold text-[#374A37] ${chunkIndex === 0 ? "mb-3" : "mb-6"}`}
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				居室重點分析（第 {chunkIndex + 1} 頁）
			</h2>
			{chunkIndex === 0 ? (
				<div
					className="mb-2 rounded-lg border border-gray-200 bg-[#F9FAFB] px-2 py-1.5 leading-tight print-scale-88"
					style={{ fontFamily: "Noto Serif TC, serif" }}
				>
					<div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-[#374151]">
						<span className="font-bold text-[#1F2937]">膠囊</span>
						<span className="inline-flex items-center gap-0.5">
							<span
								className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
								style={{ backgroundColor: "#A3B116" }}
								aria-hidden
							/>
							綠＝流年吉且八宅吉
						</span>
						<span className="text-[#D1D5DB]" aria-hidden>
							·
						</span>
						<span className="inline-flex items-center gap-0.5">
							<span
								className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
								style={{ backgroundColor: "#B45309" }}
								aria-hidden
							/>
							琥珀＝流年吉、宅非吉
						</span>
						<span className="text-[#D1D5DB]" aria-hidden>
							·
						</span>
						<span className="inline-flex items-center gap-0.5">
							<span
								className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
								style={{ backgroundColor: "#B4003C" }}
								aria-hidden
							/>
							紅＝流年凶
						</span>
					</div>
					<p className="mt-0.5 text-[10px] text-[#6B7280] leading-snug">
						流年＝當年飛星；八宅＝命卦方位。出現棕框＝兩層不一樣，以「化解」為主、勿加碼。
					</p>
				</div>
			) : null}
			<div className="space-y-4 print-page-content print-scale-88">
				{rooms.slice(0, 2).map((room, i) => {
					const parsed = parseRoomAI(room.aiAnalysis);
					const directionZh =
						DIRECTION_ZH[room.direction] ||
						localizeDirectionText(room.direction) ||
						"未標註";
					const starName =
						room?.fengShuiData?.flyingStar ||
						room?.fengShuiData?.star ||
						"未知";
					const starType =
						room?.fengShuiData?.starType ||
						room?.fengShuiData?.type ||
						"凶";
					const roomName = room.roomType || "房間";
					const bazhaiFortune = getBazhaiFortuneByGroup(
						mingGuaGroup || "西四命",
						room.direction,
					);
					const bazhaiAuspicious =
						String(bazhaiFortune || "").includes("吉");
					/** 強化語境：流年與八宅皆吉；避免八宅凶位卻顯示「強化」 */
					const useEnhancement =
						starType === "吉" && bazhaiAuspicious;
					const pillColor = useEnhancement
						? "#A3B116"
						: starType === "吉"
							? "#B45309"
							: "#B4003C";
					const bazhaiName = getBazhaiNameByGroup(
						mingGuaGroup || "西四命",
						room.direction,
					);
					const bazhaiDesc = bazhaiName || "未定";
					const annualText = `流年：${starType === "吉" ? "吉星" : "凶星"}`;
					const showBazhaiConflictNote =
						starType === "吉" &&
						String(bazhaiFortune || "").includes("凶");
					return (
						<div
							key={`room-${room.roomId || i}`}
							className="border border-gray-200 rounded-[22px] p-4 flex flex-col"
							style={{
								boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
							}}
						>
							<div className="flex items-center justify-between gap-3 mb-2">
								<div
									className="text-[26px] font-bold text-[#374A37]"
									style={{
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									{roomName}
								</div>
								<div
									className="px-4 py-2 rounded-[18px] text-white font-bold text-[13px] leading-snug min-w-[280px]"
									style={{
										backgroundColor: pillColor,
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									<div>
										{directionZh} ｜ {starName}
									</div>
									<div>
										八宅：{bazhaiDesc} ｜ {annualText}
									</div>
								</div>
							</div>

							<div className="px-1 mb-2">
								<h6 className="flex items-center mb-1 text-[14px] text-black">
									<span className="mr-2">🏠</span>
									整體格局分析
								</h6>
								<p className="leading-relaxed text-[#4B5563] text-[12px]">
									{localizeDirectionText(
										parsed.overallAdvice ||
											parsed.yearSummary ||
											"分析中...",
									)}
								</p>
							</div>

							<div className="rounded-xl border border-[#E5E7EB] p-3">
								<div
									className="text-[20px] font-bold mb-2"
									style={{
										fontFamily: "Noto Serif TC, serif",
										color: useEnhancement
											? "#A3B116"
											: "#B4003C",
									}}
								>
									{useEnhancement
										? "強化建議"
										: "化解建議"}
								</div>
								{showBazhaiConflictNote ? (
									<p
										className="mb-2 rounded border border-amber-200/70 bg-amber-50/80 px-2 py-1 text-[10px] leading-snug text-[#78350F]"
										style={{
											fontFamily: "Noto Serif TC, serif",
										}}
									>
										<span className="font-bold text-[#92400E]">
											雙層提醒：
										</span>
										流年雖吉，八宅仍視為凶位——依下方化解調整，勿因流年好就加強使用。
									</p>
								) : null}
								<div className="grid grid-cols-2 gap-2">
									{[
										{
											title: useEnhancement
												? "家具擺放"
												: "環境調整",
											key: "furniture",
										},
										{
											title: useEnhancement
												? "元素色彩"
												: "擺件禁忌",
											key: "colors",
										},
										{
											title: useEnhancement
												? "生活習慣"
												: "行為禁忌",
											key: "habits",
										},
										{
											title: useEnhancement
												? "能量強化"
												: "化煞措施",
											key: "items",
										},
									].map((section) => {
										const list =
											parsed?.recommendationGroups?.[
												section.key
											] || [];
										const tagGreen = useEnhancement;
										return (
											<div
												key={section.key}
												className="rounded-lg bg-[#EFEFEF] border border-gray-200 p-2"
											>
												<div
													className="inline-flex items-center justify-center px-2 py-[2px] rounded text-white text-[11px] font-semibold mb-1 min-w-[74px]"
													style={{
														backgroundColor:
															tagGreen
																? "#A3B116"
																: "#B4003C",
													}}
												>
													{section.title}
												</div>
												<div className="text-[12px] leading-relaxed text-[#374151]">
													{localizeDirectionText(
														list.length > 0
															? list[0]
															: "暫無建議",
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
							{/* <div className="mt-2 rounded-xl border border-[#CFE8D1] bg-[#F4FBF5] p-3">
								<h6 className="flex items-center mb-1 text-[14px] text-[#2F5D35] font-semibold">
									<span className="mr-2">👤</span>
									個人化建議
								</h6>
								<p className="text-[12px] leading-relaxed text-[#2F5D35]">
									{localizeDirectionText(
										parsed.personalAdvice ||
											"暫無個人化建議，請依命卦與宅卦整體配置優先調整。",
									)}
								</p>
							</div> */}
						</div>
					);
				})}
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
