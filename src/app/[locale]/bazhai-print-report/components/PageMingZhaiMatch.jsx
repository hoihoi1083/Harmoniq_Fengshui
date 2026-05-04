import PrintPageFooter from "./PrintPageFooter";

export default function PageMingZhaiMatch({
	analysisData,
	personalCardData,
	personalTraitAnalysis,
	houseDirectionInfo,
	mingZhaiResult,
	pageNum,
	totalPages,
}) {
	const genderText = analysisData?.userProfile?.gender || "未提供";
	const birthdayText = analysisData?.userProfile?.birthYear
		? `${analysisData.userProfile.birthYear}年${analysisData.userProfile.birthMonth || ""}月${analysisData.userProfile.birthDay || ""}日`
		: "生日未提供";
	const pillars = personalCardData?.pillars || [
		"年柱－-",
		"月柱－-",
		"日柱－-",
		"時柱－-",
	];

	return (
		<div className="page-break bg-white p-[15mm] sm:p-[20mm] relative flex flex-col">
			<h2
				className="text-4xl font-bold text-[#374A37] mb-6"
				style={{ fontFamily: "Noto Serif TC, serif" }}
			>
				命卦與命宅匹配
			</h2>
			<div className="space-y-4 print-page-content print-scale-93">
				<div className="border border-gray-200 rounded-2xl p-5 personal-card-print page-two-personal">
					<div className="grid grid-cols-[100px_1fr] gap-4">
						<div
							className="text-[56px] leading-[1.05] font-bold text-[#A3B116] tracking-[0.05em]"
							style={{
								fontFamily: "Noto Serif TC, serif",
								writingMode: "vertical-rl",
								textOrientation: "upright",
							}}
						>
							個人命卦
						</div>
						<div className="space-y-3">
							<div className="grid grid-cols-[170px_1fr_110px] gap-3 items-stretch personal-card-top">
								<div className="rounded-xl border border-[#D9E4CC] bg-[#F7FAF2] p-3 flex flex-col justify-between">
									<div className="space-y-2">
										<div className="h-2.5 bg-[#99B99C] rounded-sm" />
										<div className="h-2.5 bg-[#99B99C] rounded-sm w-[82%]" />
										<div className="h-2.5 bg-[#99B99C] rounded-sm w-[70%]" />
									</div>
									<div
										className="text-[72px] leading-[0.95] font-bold text-black text-center mt-2"
										style={{ fontFamily: "Noto Serif TC, serif" }}
									>
										{analysisData?.mingGuaInfo?.name || "未提供"}
									</div>
								</div>

								<div className="rounded-xl border border-gray-200 bg-white p-3 flex flex-col justify-between">
									<div className="grid grid-cols-[88px_1fr] gap-2 mb-2">
										<div className="text-center py-1.5 bg-[#EFEFEF] rounded-full font-semibold text-sm">
											{genderText}
										</div>
										<div className="text-center py-1.5 bg-[#EFEFEF] rounded-full font-semibold text-sm">
											{birthdayText}
										</div>
									</div>
									<div
										className="text-center py-3 rounded-full bg-[#5E7E5E] text-white text-[42px] leading-none font-bold"
										style={{ fontFamily: "Noto Serif TC, serif" }}
									>
										{analysisData?.mingGuaInfo?.group || "未提供"}
									</div>
									<p className="mt-2 text-[12px] text-[#4B5563] leading-relaxed">
										命卦主能量影響居住偏好，建議優先以命卦吉位安排主要活動區。
									</p>
								</div>

								<div className="border border-[#A3B116] rounded-xl flex flex-col items-center justify-center py-2 relative overflow-hidden bg-[#FCFDF8]">
									<div
										className="absolute inset-0 bg-no-repeat opacity-35"
										style={{
											backgroundImage: `url(/images/elements/${
												analysisData?.mingGuaInfo?.element || "水"
											}.png)`,
											backgroundSize: "62px 62px",
											backgroundPosition: "center 70%",
										}}
									/>
									<div className="text-[26px] font-bold text-[#374A37] relative z-10">五行</div>
									<div
										className="text-[64px] leading-none text-[#bcbcbc] relative z-10"
										style={{ fontFamily: "Noto Serif TC, serif" }}
									>
										{analysisData?.mingGuaInfo?.element || "－"}
									</div>
								</div>
							</div>

							<div className="border border-gray-200 rounded-full px-5 py-2 text-sm text-[#4B5563] flex items-center justify-between personal-elements-row">
								{["金", "木", "水", "火", "土"].map((el) => (
									<span key={el} className="inline-flex items-center gap-1.5">
										<img
											src={`/images/elements/${el}.png`}
											alt={el}
											className="w-4 h-4 object-contain opacity-70"
										/>
										{el} {personalCardData?.elementCounts?.[el] ?? "-"}
									</span>
								))}
							</div>
							<div className="grid grid-cols-4 gap-2">
								{pillars.map((item) => (
									<div
										key={item}
										className="text-center py-1.5 bg-[#EFEFEF] rounded-full text-[24px] font-semibold leading-none"
										style={{ fontFamily: "Noto Serif TC, serif" }}
									>
										{item}
									</div>
								))}
							</div>
							<div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
								<h4
									className="mb-2 text-[18px] text-black"
									style={{
										fontFamily: "Noto Sans HK",
										fontWeight: 500,
										WebkitTextStroke: "0.3px black",
									}}
								>
									個人特質分析
								</h4>
								<p className="text-[13px] leading-relaxed text-[#374151]">
									{personalTraitAnalysis ||
										personalCardData?.summary ||
										"分析資料載入中..."}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="border border-gray-200 rounded-2xl p-5 house-card-print">
					<div className="grid grid-cols-[74px_130px_1fr] gap-3 items-center">
						<div
							className="text-[52px] leading-[1.02] font-bold text-[#A3B116] tracking-[0.05em] text-center"
							style={{
								fontFamily: "Noto Serif TC, serif",
								writingMode: "vertical-rl",
								textOrientation: "upright",
							}}
						>
							宅卦
						</div>
						<div className="text-center">
							<img
								src={`/images/directions/${houseDirectionInfo.directionImage}.png`}
								alt={houseDirectionInfo.faceDirection.chinese}
								className="object-contain w-[96px] h-[96px] mx-auto"
								style={{ filter: "brightness(0)" }}
							/>
							<div
								className="mt-2 text-[22px] font-bold text-[#A3B116]"
								style={{ fontFamily: "Noto Serif TC, serif" }}
							>
								{houseDirectionInfo.description}
							</div>
						</div>
						<div>
							<div className="grid grid-cols-2 gap-2 mb-3">
								<div className="text-center py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
									坐：{houseDirectionInfo.sitDirection.chinese}-{houseDirectionInfo.sitTrigramName}
								</div>
								<div className="text-center py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
									向：{houseDirectionInfo.faceDirection.chinese}-{houseDirectionInfo.faceTrigramName}
								</div>
							</div>
							<div
								className="text-center py-3 rounded-full bg-[#A3B116] text-white text-[34px] font-bold"
								style={{ fontFamily: "Noto Serif TC, serif" }}
							>
								屬{houseDirectionInfo.houseName}（{houseDirectionInfo.houseGroup}）
							</div>
						</div>
					</div>
				</div>

				<div className="border border-gray-200 rounded-2xl p-5 mingzhai-card-print">
					<div className="grid grid-cols-[74px_1fr_1fr] gap-3 items-center">
						<div
							className="text-[52px] leading-[1.02] font-bold text-[#A3B116] tracking-[0.05em] text-center"
							style={{
								fontFamily: "Noto Serif TC, serif",
								writingMode: "vertical-rl",
								textOrientation: "upright",
							}}
						>
							命宅
						</div>
						<div className="col-span-2">
							<div className="grid grid-cols-3 gap-2 items-center mb-3">
								<div className="text-center">
									<div
										className="mb-2 text-[22px] font-bold text-[#374A37]"
										style={{ fontFamily: "Noto Serif TC, serif" }}
									>
										屋主
									</div>
									<div className="py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
										{analysisData?.mingGuaInfo?.group || "未提供"}
									</div>
								</div>
								<div className="text-center text-[34px] font-bold text-gray-400">VS</div>
								<div className="text-center">
									<div
										className="mb-2 text-[22px] font-bold text-[#374A37]"
										style={{ fontFamily: "Noto Serif TC, serif" }}
									>
										宅卦
									</div>
									<div className="py-2 border-2 border-[#A3B116] rounded-full font-semibold text-[18px] text-[#464646]">
										{houseDirectionInfo.houseGroup}
									</div>
								</div>
							</div>
							<div
								className={`w-full text-center py-3 rounded-full font-bold mb-3 ${
									mingZhaiResult.isCompatible
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
								style={{ fontSize: "32px", fontFamily: "Noto Serif TC, serif" }}
							>
								{mingZhaiResult.isCompatible ? "✅ 命宅相配" : "⚠️ 命宅不配"}
							</div>
							<p
								className="text-[15px] leading-relaxed text-[#374151] font-semibold"
								style={{ fontFamily: "Noto Serif TC, serif" }}
							>
								{mingZhaiResult.isCompatible
									? `${analysisData?.userProfile?.gender === "男" ? "男主" : "女主"}命卦與宅卦相配，屬於理想的風水格局。此配置有利於整體運勢，建議延續現有布局並強化吉位能量。`
									: `${analysisData?.userProfile?.gender === "男" ? "男主" : "女主"}命卦與宅卦不相配，建議優先調整主活動空間，並加強吉位、化解凶位以改善整體風水。`}
							</p>
						</div>
					</div>
				</div>
			</div>
			<PrintPageFooter pageNum={pageNum} totalPages={totalPages} />
		</div>
	);
}
