import { getBazhaiNameByGroup } from "@/lib/bazhaiConfig";
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
				className="text-4xl font-bold text-[#374A37] mb-6"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				居室重點分析（第 {chunkIndex + 1} 頁）
			</h2>
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
					const pillColor = starType === "吉" ? "#A3B116" : "#B4003C";
					const bazhaiName = getBazhaiNameByGroup(
						mingGuaGroup || "西四命",
						room.direction,
					);
					const bazhaiDesc = bazhaiName || "未定";
					const annualText = `流年：${starType === "吉" ? "吉星" : "凶星"}`;
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
										color:
											starType === "吉"
												? "#A3B116"
												: "#B4003C",
									}}
								>
									{starType === "吉"
										? "強化建議"
										: "化解建議"}
								</div>
								<div className="grid grid-cols-2 gap-2">
									{[
										{
											title:
												starType === "吉"
													? "家具擺放"
													: "環境調整",
											key: "furniture",
										},
										{
											title:
												starType === "吉"
													? "元素色彩"
													: "擺件禁忌",
											key: "colors",
										},
										{
											title:
												starType === "吉"
													? "生活習慣"
													: "行為禁忌",
											key: "habits",
										},
										{
											title:
												starType === "吉"
													? "能量強化"
													: "化煞措施",
											key: "items",
										},
									].map((section) => {
										const list =
											parsed?.recommendationGroups?.[
												section.key
											] || [];
										return (
											<div
												key={section.key}
												className="rounded-lg bg-[#EFEFEF] border border-gray-200 p-2"
											>
												<div
													className="inline-flex items-center justify-center px-2 py-[2px] rounded text-white text-[11px] font-semibold mb-1 min-w-[74px]"
													style={{
														backgroundColor:
															section.key ===
															"items"
																? "#A3B116"
																: starType ===
																	  "吉"
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
