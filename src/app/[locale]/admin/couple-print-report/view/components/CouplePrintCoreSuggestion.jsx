"use client";

import Image from "next/image";

/**
 * Page 6: 開運建議 — same content as web CoupleCoreSuggestion (關係發展建議, 能量提升建議, 感情關係禁忌).
 * Two pages: first 宜 (建議), second 禁 (禁忌). Uses parsed data from coupleCoreSuggestionParse.
 */
export default function CouplePrintCoreSuggestion({ data }) {
	const {
		relationshipDevelopment,
		energyEnhancement,
		relationshipTaboos,
		color,
	} = data;

	const hasRelationship =
		relationshipDevelopment?.type === "subsections" &&
		relationshipDevelopment.subsections?.length > 0;
	const hasEnergy = energyEnhancement?.type === "energy-enhancement";
	const hasTaboos =
		relationshipTaboos?.type === "relationship-taboos" &&
		relationshipTaboos.sections?.length > 0;

	const renderAccessories = (acc) => {
		if (Array.isArray(acc)) return acc.join("、");
		return acc ?? "";
	};

	return (
		<>
			{/* Page 1: 開運建議 | 關係發展建議 + 能量提升建議 (宜) */}
			<div
				className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative"
				style={{ padding: "8mm 20mm" }}
			>
				{/* Date - Top Right */}
				<div
					style={{
						position: "absolute",
						right: "20mm",
						top: "8mm",
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 400,
						fontSize: "18px",
						color: "#424242",
					}}
				>
					{new Date().toLocaleDateString("zh-TW").replace(/\//g, "/")}
				</div>

				{/* 關係發展建議 */}
				{hasRelationship && (
					<div className="mb-6">
						<h2
							className="mb-3 text-lg font-bold text-gray-800"
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							關係發展建議
						</h2>
						<div className="space-y-3">
							{relationshipDevelopment.subsections.map(
								(sub, idx) => (
									<div
										key={idx}
										className="border border-gray-200 rounded-lg overflow-hidden"
									>
										<div
											className="px-3 py-2 text-white font-medium text-sm"
											style={{
												backgroundColor: "#DEAB20",
												WebkitPrintColorAdjust: "exact",
												printColorAdjust: "exact",
											}}
										>
											{sub.title}
										</div>
										<div className="px-3 py-2 bg-gray-50">
											<p className="text-xs leading-relaxed text-gray-700 whitespace-pre-line">
												{sub.content}
											</p>
										</div>
									</div>
								),
							)}
						</div>
					</div>
				)}

				{/* 能量提升建議 */}
				{hasEnergy && (
					<div className="mb-4">
						<h2
							className="mb-3 text-lg font-bold text-gray-800"
							style={{ fontFamily: "Noto Serif TC, serif" }}
						>
							能量提升建議
						</h2>
						<div className="grid grid-cols-2 gap-4">
							{/* 男方 */}
							<div className="border-2 border-blue-200 rounded-lg overflow-hidden">
								<div
									className="px-3 py-2 text-white font-medium text-sm text-center"
									style={{
										backgroundColor: "#3b82f6",
										WebkitPrintColorAdjust: "exact",
										printColorAdjust: "exact",
									}}
								>
									{energyEnhancement.maleSection?.title ||
										"男方提升建議"}
								</div>
								<div className="px-3 py-2 space-y-2">
									<div>
										<p className="text-xs font-semibold text-blue-700">
											行動建議
										</p>
										{(
											energyEnhancement.maleSection
												?.actionAdvice || []
										).length > 0 ? (
											<ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">
												{energyEnhancement.maleSection.actionAdvice.map(
													(a, i) => (
														<li key={i}>{a}</li>
													),
												)}
											</ul>
										) : (
											<p className="text-xs text-gray-600">
												—
											</p>
										)}
									</div>
									<div>
										<p className="text-xs font-semibold text-blue-700">
											開運物
										</p>
										<p className="text-xs text-gray-700">
											{renderAccessories(
												energyEnhancement.maleSection
													?.accessories,
											)}
										</p>
									</div>
								</div>
							</div>
							{/* 女方 */}
							<div className="border-2 border-pink-200 rounded-lg overflow-hidden">
								<div
									className="px-3 py-2 text-white font-medium text-sm text-center"
									style={{
										backgroundColor: "#ec4899",
										WebkitPrintColorAdjust: "exact",
										printColorAdjust: "exact",
									}}
								>
									{energyEnhancement.femaleSection?.title ||
										"女方提升建議"}
								</div>
								<div className="px-3 py-2 space-y-2">
									<div>
										<p className="text-xs font-semibold text-pink-700">
											行動建議
										</p>
										{(
											energyEnhancement.femaleSection
												?.actionAdvice || []
										).length > 0 ? (
											<ul className="text-xs text-gray-700 list-disc pl-4 space-y-0.5">
												{energyEnhancement.femaleSection.actionAdvice.map(
													(a, i) => (
														<li key={i}>{a}</li>
													),
												)}
											</ul>
										) : (
											<p className="text-xs text-gray-600">
												—
											</p>
										)}
									</div>
									<div>
										<p className="text-xs font-semibold text-pink-700">
											開運物
										</p>
										<p className="text-xs text-gray-700">
											{renderAccessories(
												energyEnhancement.femaleSection
													?.accessories,
											)}
										</p>
									</div>
								</div>
							</div>
						</div>
						{/* 共同能量場 */}
						{energyEnhancement.sharedEnhancement && (
							<div className="mt-3 border-2 border-green-200 rounded-lg overflow-hidden bg-green-50">
								<div
									className="px-3 py-2 text-white font-medium text-sm text-center"
									style={{
										backgroundColor: "#22c55e",
										WebkitPrintColorAdjust: "exact",
										printColorAdjust: "exact",
									}}
								>
									{energyEnhancement.sharedEnhancement.title}
								</div>
								<div className="px-3 py-2">
									{energyEnhancement.sharedEnhancement
										.weeklyRitual?.content && (
										<>
											<p className="text-xs font-semibold text-green-700">
												{
													energyEnhancement
														.sharedEnhancement
														.weeklyRitual.title
												}
											</p>
											<p className="text-xs text-gray-700">
												{
													energyEnhancement
														.sharedEnhancement
														.weeklyRitual.content
												}
											</p>
										</>
									)}
									{energyEnhancement.sharedEnhancement
										.situations?.length > 0 && (
										<div className="mt-2 text-xs">
											<p className="font-semibold text-green-700 mb-1">
												場合色彩搭配
											</p>
											{energyEnhancement.sharedEnhancement.situations.map(
												(s, i) => (
													<div
														key={i}
														className="mb-1 text-gray-700"
													>
														<span className="font-medium">
															{s.title}
														</span>
														：男方{" "}
														{s.colors?.male?.[0]}
														；女方{" "}
														{s.colors?.female?.[0]}
														；{s.energyFunction}
													</div>
												),
											)}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Large 宜 */}
				<div
					className="absolute font-bold"
					style={{
						left: "30%",
						bottom: "0%",
						transform: "translateX(-50%)",
						color: "#13326F",
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "320px",
						opacity: 0.15,
						WebkitPrintColorAdjust: "exact",
						printColorAdjust: "exact",
					}}
				>
					宜
				</div>

				<div
					style={{
						position: "absolute",
						bottom: "15mm",
						left: "20mm",
					}}
				>
					<Image
						src="/images/report/bottom.png"
						alt=""
						width={30}
						height={10}
						style={{ objectFit: "contain" }}
					/>
				</div>
			</div>

			{/* Page 2: 開運建議 | 感情關係禁忌 (禁) */}
			<div
				className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative"
				style={{ padding: "8mm 20mm" }}
			>
				<div
					style={{
						position: "absolute",
						right: "20mm",
						top: "8mm",
						fontFamily: "Noto Serif TC, serif",
						fontWeight: 400,
						fontSize: "18px",
						color: "#424242",
					}}
				>
					{new Date().toLocaleDateString("zh-TW").replace(/\//g, "/")}
				</div>

				<div className="flex gap-6 mb-6">
					<div className="w-[2px] bg-gray-400" />
					<div>
						<p className="mb-1 text-xl font-bold text-red-600">
							感情關係禁忌
						</p>
						<p className="text-sm text-gray-500">
							溝通、行為、環境禁忌
						</p>
					</div>
				</div>

				{hasTaboos && (
					<div className="space-y-5">
						{relationshipTaboos.sections.map((section, sIdx) => (
							<div key={sIdx}>
								<div
									className="px-4 py-2 text-white font-bold text-center rounded-t-lg text-sm"
									style={{
										backgroundColor:
											sIdx === 0
												? "#db2777"
												: sIdx === 1
													? "#dc2626"
													: "#991b1b",
										WebkitPrintColorAdjust: "exact",
										printColorAdjust: "exact",
									}}
								>
									{section.title}
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-t-0 border-gray-200 rounded-b-lg p-3 bg-gray-50">
									{(section.subsections || []).map(
										(sub, subIdx) => (
											<div
												key={subIdx}
												className="border border-gray-200 rounded overflow-hidden bg-white"
											>
												<div
													className="px-2 py-1.5 text-white font-medium text-xs text-center"
													style={{
														backgroundColor:
															sIdx === 0
																? "#ec4899"
																: sIdx === 1
																	? "#22c55e"
																	: "#b91c1c",
														WebkitPrintColorAdjust:
															"exact",
														printColorAdjust:
															"exact",
													}}
												>
													{sub.title}
												</div>
												<div className="px-2 py-1.5">
													<p className="text-xs leading-relaxed text-gray-700">
														{sub.content}
													</p>
												</div>
											</div>
										),
									)}
								</div>
							</div>
						))}
						{relationshipTaboos.monthlyNote && (
							<div className="border-2 border-amber-200 rounded-lg p-3 bg-amber-50">
								<p className="text-xs font-semibold text-amber-800">
									{relationshipTaboos.monthlyNote.title}
								</p>
								<p className="text-xs text-gray-700 mt-1">
									{relationshipTaboos.monthlyNote.content}
								</p>
							</div>
						)}
					</div>
				)}

				<div
					className="absolute font-bold"
					style={{
						left: "30%",
						bottom: "0%",
						transform: "translateX(-50%)",
						color: "#50001B",
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "320px",
						opacity: 0.15,
						WebkitPrintColorAdjust: "exact",
						printColorAdjust: "exact",
					}}
				>
					禁
				</div>

				<div
					style={{
						position: "absolute",
						bottom: "15mm",
						left: "20mm",
					}}
				>
					<Image
						src="/images/report/bottom.png"
						alt=""
						width={30}
						height={10}
						style={{ objectFit: "contain" }}
					/>
				</div>
			</div>
		</>
	);
}
