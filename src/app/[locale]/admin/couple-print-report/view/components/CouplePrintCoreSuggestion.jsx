"use client";

import Image from "next/image";

/**
 * Page 6: 開運建議 — same content as web CoupleCoreSuggestion.
 * Page 1: 關係發展建議 only (宜), styled to match MingJu print (title bar + body). Page 2: 能量提升建議 + 感情關係禁忌 (禁).
 */
/** MingJu-style: bar and title accent for 關係發展建議 */
const CORE_ACCENT = "#A47584";
const CORE_BAR_BG = "#8B7355";
const CORE_BAR_TEXT = "#fff";
const CORE_BODY_SIZE = "13px";
const CORE_BODY_LINE_HEIGHT = 1.7;

/** Page 2 (能量提升建議 + 感情關係禁忌) — design from reference */
const P2_BG = "#f8f8f8";
const P2_SECTION_TITLE_COLOR = "#991b1b";
const P2_PANEL_BORDER = "#333";
const P2_PANEL_INNER_BG = "#faf9f7";
/** Male panel: 行動建議 / 開運物 bar — blue-grey */
const P2_ACTION_BAR_MALE = "#597E9C";
/** Female panel: 行動建議 / 開運物 bar — muted rose/mauve */
const P2_ACTION_BAR_FEMALE = "#AA7C8C";
const P2_TABOO_HEADER_COLORS = [
	"#2563eb",
	"#db2777",
	"#16a34a",
	"#dc2626",
	"#64748b",
];

/** 溝通禁忌 / 行為禁忌 — match reference image (title #A47584, cards with icons, behavior panels) */
const TABOO_ACCENT = "#A47584";
const TABOO_CARD_BORDER = "#666";
const TABOO_MALE_ICON = "#CADCE4";
const TABOO_FEMALE_ICON = "#E0B0B8";
const TABOO_BEHAVIOR_HEADERS = {
	春季: { bg: "#8BC34A", color: "#fff" },
	夏季: { bg: "#B71C1C", color: "#fff" },
	戊月: { bg: "#E0E0E0", color: "#333" },
	戌月: { bg: "#E0E0E0", color: "#333" },
};

/** Chinese color names → hex for 共同能量場 table circles (longest first for match order) */
const COLOR_NAME_TO_HEX = [
	["深藍色", "#1e3a5f"],
	["淺綠色", "#90c695"],
	["淡紫色", "#d8bfd8"],
	["淺藍色", "#93c5fd"],
	["墨綠色", "#2d5a27"],
	["銀白色", "#e8e8e8"],
	["深藍", "#1e3a5f"],
	["米色", "#c9b896"],
	["白色", "#ffffff"],
	["銀色", "#c0c0c0"],
	["藍色", "#2563eb"],
	["粉色", "#ffb6c1"],
	["棕色", "#8b4513"],
	["綠色", "#22c55e"],
	["紫色", "#a855f7"],
	["紅色", "#ef4444"],
	["黃色", "#eab308"],
	["黑色", "#1f2937"],
	["珍珠", "#f0e6d8"],
	["橙紅", "#ea580c"],
	["竹製", "#7cb342"],
	["絲綢", "#fce7f3"],
];

/** Render cell text with small colored circles next to recognized color names */
function renderWithColorCircles(text) {
	if (!text || typeof text !== "string") return text;
	let remaining = text;
	const segments = [];
	while (remaining.length > 0) {
		let matched = false;
		for (const [name, hex] of COLOR_NAME_TO_HEX) {
			const idx = remaining.indexOf(name);
			if (idx >= 0) {
				if (idx > 0)
					segments.push({
						type: "text",
						value: remaining.slice(0, idx),
					});
				segments.push({ type: "color", value: name, hex });
				remaining = remaining.slice(idx + name.length);
				matched = true;
				break;
			}
		}
		if (!matched) {
			segments.push({ type: "text", value: remaining });
			break;
		}
	}
	if (segments.length === 0) return text;
	return segments.map((seg, i) =>
		seg.type === "color" ? (
			<span
				key={i}
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					marginRight: "4px",
				}}
			>
				<span
					style={{
						display: "inline-block",
						width: "10px",
						height: "10px",
						borderRadius: "50%",
						backgroundColor: seg.hex,
						border:
							seg.hex === "#ffffff" ? "1px solid #ccc" : "none",
						flexShrink: 0,
						WebkitPrintColorAdjust: "exact",
						printColorAdjust: "exact",
					}}
					aria-hidden
				/>
				{seg.value}
			</span>
		) : (
			<span key={i}>{seg.value}</span>
		),
	);
}

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
			{/* Page 1: 關係發展建議 only */}
			{hasRelationship && (
				<div
					className="page-break bg-white px-12 py-10 h-[297mm] overflow-hidden relative"
					style={{ padding: "8mm 20mm" }}
				>
					{/* Date - Top Right (same as CouplePrintSeason) */}
					<div
						style={{
							position: "absolute",
							right: "20mm",
							top: "8mm",
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

					{/* Page title: MingJu-style (like 五行氣機修補) */}
					<h2
						className="mb-6"
						style={{
							fontSize: "35px",
							letterSpacing: "0.20em",
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontWeight: 700,
							color: CORE_ACCENT,
							WebkitPrintColorAdjust: "exact",
							printColorAdjust: "exact",
						}}
					>
						關係發展建議
					</h2>

					{/* Subsections: title bar + body (MingJu style) */}
					<div
						style={{
							fontFamily: "system-ui, -apple-system, sans-serif",
						}}
					>
						{relationshipDevelopment.subsections.map((sub, idx) => (
							<div key={idx} style={{ marginBottom: "20px" }}>
								<div
									style={{
										width: "35%",
										textAlign: "center",
										backgroundColor: CORE_BAR_BG,
										color: CORE_BAR_TEXT,
										padding: "8px 12px",
										fontSize: "17px",
										fontWeight: 900,
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										borderRadius: "6px",
										marginBottom: "8px",
										WebkitPrintColorAdjust: "exact",
										printColorAdjust: "exact",
									}}
								>
									{sub.title}
								</div>
								<p
									style={{
										fontSize: CORE_BODY_SIZE,
										lineHeight: CORE_BODY_LINE_HEIGHT,
										color: "#333",
										margin: 0,
										textAlign: "justify",
										whiteSpace: "pre-line",
									}}
								>
									{sub.content}
								</p>
							</div>
						))}
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
			)}

			{/* Page 2: 能量提升建議 + 感情關係禁忌 — reference design */}
			{(hasEnergy || hasTaboos) && (
				<div
					className="page-break h-[297mm] overflow-hidden relative"
					style={{
						padding: "8mm 20mm",
						boxSizing: "border-box",
					}}
				>
					{/* Page header: 開運建議 | 建議方案 — match reference (beige header, A47584 title, dark separator, subtitle + description) */}
					<div
						style={{
							padding: "12px 16px 14px",
							marginBottom: "16px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "flex-start",
								gap: "14px",
							}}
						>
							<h2
								style={{
									fontSize: "28px",
									fontWeight: 700,
									color: "#A47584",
									fontFamily:
										"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
									margin: 0,
									lineHeight: 1.2,
									letterSpacing: "0.08em",
									WebkitPrintColorAdjust: "exact",
									printColorAdjust: "exact",
								}}
							>
								開運建議
							</h2>
							<div
								style={{
									width: "1px",
									height: "32px",
									backgroundColor: "#333",
									flexShrink: 0,
								}}
							/>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontSize: "15px",
										fontWeight: 600,
										color: "#4a3728",
										fontFamily:
											"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										marginBottom: "4px",
									}}
								>
									建議方案
								</div>
								<p
									style={{
										fontSize: "12px",
										color: "#4a3728",
										margin: 0,
										lineHeight: 1.5,
										fontFamily: "system-ui, sans-serif",
									}}
								>
									針對您當前的具體困擾提供實用解決方案，幫助您應對眼前挑戰。
								</p>
							</div>
							<span
								style={{
									fontFamily: "Noto Serif TC, serif",
									fontStyle: "extrabold",
									fontWeight: 400,
									fontSize: "20px",
									lineHeight: "14px",
									color: "#424242",
									flexShrink: 0,
								}}
							>
								{new Date()
									.toLocaleDateString("zh-TW")
									.replace(/\//g, "/")}
							</span>
						</div>
					</div>

					{/* 能量提升建議 */}
					{hasEnergy && (
						<div style={{ marginBottom: "20px" }}>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "16px",
								}}
							>
								{/* 男方 */}
								<div
									style={{
										border: `1px solid ${P2_PANEL_BORDER}`,
										borderRadius: "10px",
										overflow: "hidden",
									}}
								>
									<div
										style={{
											padding: "8px 12px",
											fontSize: "14px",
											fontWeight: 700,
											color: P2_SECTION_TITLE_COLOR,
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										}}
									>
										{energyEnhancement.maleSection?.title ||
											"男方提升建議"}
									</div>
									<div style={{ padding: "10px 12px" }}>
										<div style={{ marginBottom: "10px" }}>
											<div
												style={{
													backgroundColor:
														P2_ACTION_BAR_MALE,
													color: "#fff",
													padding: "4px 8px",
													fontSize: "11px",
													fontWeight: 600,
													width: "30%",
													textAlign: "center",
													marginBottom: "6px",
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												行動建議
											</div>
											{(
												energyEnhancement.maleSection
													?.actionAdvice || []
											).length > 0 ? (
												<ul
													style={{
														margin: 0,
														fontSize: "11px",
														lineHeight: 1.6,
														color: "#111",
													}}
												>
													{energyEnhancement.maleSection.actionAdvice.map(
														(a, i) => (
															<li key={i}>{a}</li>
														),
													)}
												</ul>
											) : (
												<p
													style={{
														margin: 0,
														fontSize: "11px",
														color: "#6b7280",
													}}
												>
													—
												</p>
											)}
										</div>
										<div>
											<div
												style={{
													backgroundColor:
														P2_ACTION_BAR_MALE,
													color: "#fff",
													padding: "4px 8px",
													fontSize: "11px",
													width: "30%",
													textAlign: "center",

													fontWeight: 600,
													marginBottom: "6px",
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												開運物
											</div>
											<p
												style={{
													margin: 0,
													fontSize: "11px",
													lineHeight: 1.5,
													color: "#111",
												}}
											>
												{renderAccessories(
													energyEnhancement
														.maleSection
														?.accessories,
												) || "—"}
											</p>
										</div>
									</div>
								</div>
								{/* 女方 */}
								<div
									style={{
										border: `1px solid ${P2_PANEL_BORDER}`,
										borderRadius: "10px",
										overflow: "hidden",
									}}
								>
									<div
										style={{
											padding: "8px 12px",
											fontSize: "14px",
											fontWeight: 700,
											color: P2_SECTION_TITLE_COLOR,
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										}}
									>
										{energyEnhancement.femaleSection
											?.title || "女方提升建議"}
									</div>
									<div style={{ padding: "10px 12px" }}>
										<div style={{ marginBottom: "10px" }}>
											<div
												style={{
													backgroundColor:
														P2_ACTION_BAR_FEMALE,
													color: "#fff",
													padding: "4px 8px",
													width: "30%",
													textAlign: "center",

													fontSize: "11px",
													fontWeight: 600,
													marginBottom: "6px",
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												行動建議
											</div>
											{(
												energyEnhancement.femaleSection
													?.actionAdvice || []
											).length > 0 ? (
												<ul
													style={{
														margin: 0,
														fontSize: "11px",
														lineHeight: 1.6,
														color: "#111",
													}}
												>
													{energyEnhancement.femaleSection.actionAdvice.map(
														(a, i) => (
															<li key={i}>{a}</li>
														),
													)}
												</ul>
											) : (
												<p
													style={{
														margin: 0,
														fontSize: "11px",
														color: "#6b7280",
													}}
												>
													—
												</p>
											)}
										</div>
										<div>
											<div
												style={{
													backgroundColor:
														P2_ACTION_BAR_FEMALE,
													color: "#fff",
													padding: "4px 8px",
													fontSize: "11px",
													width: "30%",
													textAlign: "center",

													fontWeight: 600,
													marginBottom: "6px",
													WebkitPrintColorAdjust:
														"exact",
													printColorAdjust: "exact",
												}}
											>
												開運物
											</div>
											<p
												style={{
													margin: 0,
													fontSize: "11px",
													lineHeight: 1.5,
													color: "#111",
												}}
											>
												{renderAccessories(
													energyEnhancement
														.femaleSection
														?.accessories,
												) || "—"}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* 共同能量場強化 — table */}
							{energyEnhancement.sharedEnhancement?.situations
								?.length > 0 && (
								<div style={{ marginTop: "14px" }}>
									<h3
										style={{
											fontSize: "20px",
											fontWeight: 700,
											color: TABOO_ACCENT,
											letterSpacing: "0.08em",
											marginBottom: "12px",
											fontFamily:
												"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										}}
									>
										{energyEnhancement.sharedEnhancement
											.title || "共同能量場強化"}
									</h3>
									<div
										style={{
											border: `1px solid ${P2_PANEL_BORDER}`,
											borderRadius: "8px",
											overflow: "hidden",
											backgroundColor: "#fff",
											fontSize: "11px",
										}}
									>
										<div
											style={{
												display: "grid",
												gridTemplateColumns:
													"0.7fr 0.8fr 0.8fr 1.2fr",
												fontWeight: 600,
												color: "#111",
											}}
										>
											<div
												style={{
													padding: "8px 10px",
													borderRight: `1px solid ${P2_PANEL_BORDER}`,
													fontSize: "14px",
													fontWeight: 700,
												}}
											>
												衝突類型
											</div>
											<div
												style={{
													padding: "8px 10px",
													borderRight: `1px solid ${P2_PANEL_BORDER}`,
													fontSize: "14px",
													fontWeight: 700,
												}}
											>
												男方主色
											</div>
											<div
												style={{
													padding: "8px 10px",
													borderRight: `1px solid ${P2_PANEL_BORDER}`,
													fontSize: "14px",
													fontWeight: 700,
												}}
											>
												女方主色
											</div>
											<div
												style={{
													padding: "8px 10px",
													fontSize: "14px",
													fontWeight: 700,
												}}
											>
												溝通策略
											</div>
										</div>
										{energyEnhancement.sharedEnhancement.situations.map(
											(s, i) => (
												<div
													key={i}
													style={{
														display: "grid",
														gridTemplateColumns:
															"0.7fr 0.8fr 0.8fr 1.2fr",
														borderTop: `1px solid ${P2_PANEL_BORDER}`,
													}}
												>
													<div
														style={{
															padding: "8px 10px",
															borderRight: `1px solid ${P2_PANEL_BORDER}`,
															fontSize: "14px",
															fontWeight: 700,
														}}
													>
														{s.title}
													</div>
													<div
														style={{
															padding: "8px 10px",
															borderRight: `1px solid ${P2_PANEL_BORDER}`,
															fontSize: "11px",
															lineHeight: 1.5,
															color: "#111",
														}}
													>
														{s.colors?.male?.[0]
															? renderWithColorCircles(
																	s.colors
																		.male[0],
																)
															: "—"}
													</div>
													<div
														style={{
															padding: "8px 10px",
															borderRight: `1px solid ${P2_PANEL_BORDER}`,
															fontSize: "11px",
															lineHeight: 1.5,
															color: "#111",
														}}
													>
														{s.colors?.female?.[0]
															? renderWithColorCircles(
																	s.colors
																		.female[0],
																)
															: "—"}
													</div>
													<div
														style={{
															padding: "8px 10px",
														}}
													>
														{s.energyFunction ??
															"—"}
													</div>
												</div>
											),
										)}
									</div>
									{/* {energyEnhancement.sharedEnhancement
										.weeklyRitual?.content && (
										<p
											style={{
												marginTop: "8px",
												fontSize: "11px",
												lineHeight: 1.5,
												color: "#374151",
											}}
										>
											{
												energyEnhancement
													.sharedEnhancement
													.weeklyRitual.title
											}
											：
											{
												energyEnhancement
													.sharedEnhancement
													.weeklyRitual.content
											}
										</p>
									)} */}
								</div>
							)}
							{energyEnhancement.sharedEnhancement &&
								!energyEnhancement.sharedEnhancement.situations
									?.length &&
								energyEnhancement.sharedEnhancement.weeklyRitual
									?.content && (
									<div style={{ marginTop: "14px" }}>
										<h3
											style={{
												fontSize: "20px",
												fontWeight: 700,
												color: TABOO_ACCENT,
												letterSpacing: "0.08em",
												marginBottom: "12px",
												fontFamily:
													"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
											}}
										>
											{energyEnhancement.sharedEnhancement
												.title || "共同能量場強化"}
										</h3>
										<p
											style={{
												fontSize: "11px",
												lineHeight: 1.5,
												color: "#374151",
												margin: 0,
											}}
										>
											{
												energyEnhancement
													.sharedEnhancement
													.weeklyRitual.title
											}
											：
											{
												energyEnhancement
													.sharedEnhancement
													.weeklyRitual.content
											}
										</p>
									</div>
								)}
						</div>
					)}

					{/* 感情關係禁忌 — 溝通禁忌 / 行為禁忌 per reference image */}
					{hasTaboos && (
						<div style={{ marginTop: "20px" }}>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "20px",
								}}
							>
								{relationshipTaboos.sections.map(
									(section, sIdx) => {
										const subs = section.subsections || [];
										const isCommunication =
											section.title === "溝通禁忌";
										const isBehavior =
											section.title === "行為禁忌";

										// 溝通禁忌: two cards (男方 left, 女方 right), icon + label + content
										if (isCommunication) {
											const ordered = [...subs].sort(
												(a, b) => {
													if (a.title === "男方忌用")
														return -1;
													if (b.title === "男方忌用")
														return 1;
													return 0;
												},
											);
											return (
												<div key={sIdx}>
													<h4
														style={{
															fontSize: "20px",
															fontWeight: 700,
															color: TABOO_ACCENT,
															letterSpacing:
																"0.08em",
															marginBottom:
																"12px",
															fontFamily:
																"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
														}}
													>
														{section.title}
													</h4>
													<div
														style={{
															display: "flex",
															gap: "12px",
														}}
													>
														{ordered.map(
															(sub, subIdx) => {
																const isMale =
																	sub.title ===
																	"男方忌用";
																const iconBg =
																	isMale
																		? TABOO_MALE_ICON
																		: TABOO_FEMALE_ICON;
																return (
																	<div
																		key={
																			subIdx
																		}
																		style={{
																			flex: 1,
																			border: `1px solid ${TABOO_CARD_BORDER}`,
																			borderRadius:
																				"8px",
																			backgroundColor:
																				"#fff",
																			overflow:
																				"hidden",
																			display:
																				"flex",
																			minWidth: 0,
																		}}
																	>
																		<div
																			style={{
																				width: "40px",
																				minWidth:
																					"40px",
																				display:
																					"flex",
																				alignItems:
																					"center",
																				justifyContent:
																					"center",
																				WebkitPrintColorAdjust:
																					"exact",
																				printColorAdjust:
																					"exact",
																			}}
																			aria-hidden
																		>
																			<Image
																				src={
																					isMale
																						? "/images/report-print/male.png"
																						: "/images/report-print/female.png"
																				}
																				alt=""
																				width={
																					28
																				}
																				height={
																					36
																				}
																				style={{
																					objectFit:
																						"contain",
																				}}
																			/>
																		</div>
																		<div
																			style={{
																				flex: 1,
																				padding:
																					"10px 12px",
																			}}
																		>
																			<div
																				style={{
																					fontSize:
																						"13px",
																					fontWeight: 700,
																					color: "#333",
																					marginBottom:
																						"6px",
																				}}
																			>
																				{
																					sub.title
																				}
																			</div>
																			<p
																				style={{
																					margin: 0,
																					fontSize:
																						"11px",
																					lineHeight: 1.6,
																					color: "#333",
																				}}
																			>
																				{
																					sub.content
																				}
																			</p>
																		</div>
																	</div>
																);
															},
														)}
													</div>
												</div>
											);
										}

										// 行為禁忌: three panels with colored headers (春季/夏季/戌月)
										if (isBehavior) {
											return (
												<div key={sIdx}>
													<h4
														style={{
															fontSize: "20px",
															fontWeight: 700,
															color: TABOO_ACCENT,
															letterSpacing:
																"0.08em",
															marginBottom:
																"12px",
															fontFamily:
																"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
														}}
													>
														{section.title}
													</h4>
													<div
														style={{
															display: "grid",
															gridTemplateColumns: `repeat(${Math.min(
																subs.length,
																3,
															)}, 1fr)`,
															gap: "12px",
														}}
													>
														{subs.map(
															(sub, subIdx) => {
																const headerStyle =
																	TABOO_BEHAVIOR_HEADERS[
																		sub
																			.title
																	] || {
																		bg: "#E0E0E0",
																		color: "#333",
																	};
																return (
																	<div
																		key={
																			subIdx
																		}
																		style={{
																			overflow:
																				"hidden",
																			backgroundColor:
																				"#fff",
																		}}
																	>
																		<div
																			style={{
																				backgroundColor:
																					headerStyle.bg,
																				color: headerStyle.color,
																				padding:
																					"8px 10px",
																				fontSize:
																					"13px",
																				fontWeight: 700,
																				width: "40%",
																				textAlign:
																					"center",
																				WebkitPrintColorAdjust:
																					"exact",
																				printColorAdjust:
																					"exact",
																			}}
																		>
																			{
																				sub.title
																			}
																		</div>
																		<div
																			style={{
																				padding:
																					"10px 12px",
																			}}
																		>
																			<p
																				style={{
																					margin: 0,
																					fontSize:
																						"11px",
																					lineHeight: 1.6,
																					color: "#333",
																				}}
																			>
																				{sub.content &&
																				!sub.content.startsWith(
																					"•",
																				)
																					? `• ${sub.content}`
																					: sub.content}
																			</p>
																		</div>
																	</div>
																);
															},
														)}
													</div>
												</div>
											);
										}

										// 環境禁忌 or other: keep card layout with generic header color
										// return (
										// 	<div key={sIdx}>
										// 		<h4
										// 			style={{
										// 				fontSize: "20px",
										// 				fontWeight: 700,
										// 				color: TABOO_ACCENT,
										// 				letterSpacing: "0.08em",
										// 				marginBottom: "12px",
										// 				fontFamily:
										// 					"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
										// 			}}
										// 		>
										// 			{section.title}
										// 		</h4>
										// 		<div
										// 			style={{
										// 				display: "grid",
										// 				gridTemplateColumns: `repeat(${Math.min(
										// 					subs.length,
										// 					3,
										// 				)}, 1fr)`,
										// 				gap: "12px",
										// 			}}
										// 		>
										// 			{subs.map((sub, subIdx) => (
										// 				<div
										// 					key={subIdx}
										// 					style={{
										// 						border: `1px solid ${TABOO_CARD_BORDER}`,
										// 						borderRadius:
										// 							"8px",
										// 						overflow:
										// 							"hidden",
										// 						backgroundColor:
										// 							"#fff",
										// 					}}
										// 				>
										// 					<div
										// 						style={{
										// 							backgroundColor:
										// 								P2_TABOO_HEADER_COLORS[
										// 									subIdx %
										// 										P2_TABOO_HEADER_COLORS.length
										// 								],
										// 							color: "#fff",
										// 							padding:
										// 								"6px 10px",
										// 							fontSize:
										// 								"12px",
										// 							fontWeight: 600,
										// 							textAlign:
										// 								"center",
										// 							WebkitPrintColorAdjust:
										// 								"exact",
										// 							printColorAdjust:
										// 								"exact",
										// 						}}
										// 					>
										// 						{sub.title}
										// 					</div>
										// 					<div
										// 						style={{
										// 							padding:
										// 								"10px",
										// 						}}
										// 					>
										// 						<p
										// 							style={{
										// 								margin: 0,
										// 								fontSize:
										// 									"11px",
										// 								lineHeight: 1.6,
										// 								color: "#333",
										// 							}}
										// 						>
										// 							{
										// 								sub.content
										// 							}
										// 						</p>
										// 					</div>
										// 				</div>
										// 			))}
										// 		</div>
										// 	</div>
										// );
									},
								)}
								{/* {relationshipTaboos.monthlyNote && (
									<div
										style={{
											border: `1px solid #fcd34d`,
											borderRadius: "8px",
											padding: "10px 12px",
											backgroundColor: "#fffbeb",
										}}
									>
										<p
											style={{
												fontSize: "12px",
												fontWeight: 600,
												color: "#92400e",
												margin: "0 0 4px 0",
											}}
										>
											{
												relationshipTaboos.monthlyNote
													.title
											}
										</p>
										<p
											style={{
												fontSize: "11px",
												lineHeight: 1.5,
												color: "#374151",
												margin: 0,
											}}
										>
											{
												relationshipTaboos.monthlyNote
													.content
											}
										</p>
									</div>
								)} */}
							</div>
						</div>
					)}

					{/* Footer — same as CouplePrintSeason */}
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
			)}
		</>
	);
}
