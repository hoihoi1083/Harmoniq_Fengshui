"use client";

/**
 * Print: 專屬問題解決方案 — same content & layout as web when 問題類型：感情降溫類.
 * With subsections: 盤面診斷 (女方/男方 + 關鍵合盤徵象), 風水急救 (72小時內行動方案), 重啟默契 (破冰儀式建議).
 * Without subsections: problem type + question + 女方分析/男方分析 from base API.
 */
const COUPLE_COLOR = "#B4003C";
const COUPLE_ACCENT = "#D09900";
const WEB_PINK = "#C74772";
const WEB_BLUE = "#3263C4";
const SECTION_TITLE_COLOR = "#374A37";
const GRADIENT_PINK_GOLD = "linear-gradient(135deg, #C74772 0%, #D09900 100%)";

function categorizeProblem(problem) {
	if (!problem || typeof problem !== "string") return null;
	const p = problem.trim().toLowerCase();
	if (/冷戰|降溫|疏遠|冷淡|感情淡|不理我/.test(p))
		return { categoryKey: "emotionCooling", label: "感情降溫類" };
	if (/異地|長距離|工作|家庭|父母|環境|壓力/.test(p)) return { categoryKey: "specialSituation", label: "特殊情境類" };
	if (/朋友/.test(p) && !/男朋友|女朋友/.test(p)) return { categoryKey: "specialSituation", label: "特殊情境類" };
	if (/說錯話|話術|溝通|誤會|爭吵|口角|吵架|禁忌/.test(p))
		return { categoryKey: "tabooBreaking", label: "禁忌破解話術" };
	return { categoryKey: "emotionCooling", label: "感情降溫類" };
}

function stripMarkdown(s) {
	if (!s || typeof s !== "string") return s;
	return s.replace(/\*\*/g, "").trim();
}

function SectionTitle({ children }) {
	return (
		<h2
			style={{
				fontFamily: "Noto Serif TC, serif",
				fontWeight: 700,
				fontSize: "18px",
				color: SECTION_TITLE_COLOR,
				marginBottom: "8px",
				marginTop: "4px",
			}}
		>
			{children}
		</h2>
	);
}

export default function CouplePrintProblemSolution({ data, subsections }) {
	if (!data) return null;

	const { question, female, male, raw } = data;
	const category = categorizeProblem(question);
	const isEmotionCooling = category?.categoryKey === "emotionCooling";
	const hasSubsections =
		isEmotionCooling &&
		subsections &&
		(subsections?.chartDiagnosis || subsections?.emergencyFengShui || subsections?.restartChemistry);

	const chartDiagnosis = hasSubsections ? subsections.chartDiagnosis : null;
	const emergencyFengShui = hasSubsections ? subsections.emergencyFengShui : null;
	const restartChemistry = hasSubsections ? subsections.restartChemistry : null;

	const femaleDesc = stripMarkdown(female?.description || "");
	const maleDesc = stripMarkdown(male?.description || "");
	const hasBaseContent = femaleDesc || maleDesc || (raw && raw.trim());
	if (!hasBaseContent && !question && !chartDiagnosis && !emergencyFengShui && !restartChemistry) return null;

	const pageStyle = {
		width: "210mm",
		minHeight: "297mm",
		maxWidth: "210mm",
		padding: "12mm 18mm",
		boxSizing: "border-box",
		backgroundColor: "#fff",
	};

	return (
		<div className="mx-auto bg-white page-break" style={pageStyle}>
			<h2
				style={{
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					fontSize: "24px",
					letterSpacing: "0.15em",
					color: COUPLE_COLOR,
					marginBottom: "10px",
				}}
			>
				專屬問題解決方案
			</h2>

			{question && (
				<div
					style={{
						background: `linear-gradient(135deg, ${COUPLE_COLOR}, ${COUPLE_ACCENT})`,
						padding: "2px",
						borderRadius: "9999px",
						marginBottom: "12px",
					}}
				>
					<div style={{ background: "white", borderRadius: "9999px", padding: "8px 14px" }}>
						{category && (
							<div style={{ fontSize: "11px", color: "#666", marginBottom: "2px", textAlign: "center" }}>
								問題類型：{category.label}
							</div>
						)}
						<p style={{ fontSize: "13px", lineHeight: 1.4, color: "#333", textAlign: "center", margin: 0 }}>
							{question}
						</p>
					</div>
				</div>
			)}

			{/* 盤面診斷 */}
			{chartDiagnosis && (
				<>
					<SectionTitle>盤面診斷</SectionTitle>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
						<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
							<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
								<span style={{ fontWeight: 700, fontSize: "14px", color: WEB_PINK }}>女方</span>
								<span style={{ padding: "3px 8px", borderRadius: "9999px", border: `2px solid ${WEB_PINK}`, background: "#fff", fontSize: "10px", color: WEB_PINK }}>
									{chartDiagnosis.female?.title || "命局"}
								</span>
							</div>
							<div style={{ padding: "8px", background: "#f3f4f6", borderRadius: "6px", fontSize: "11px", lineHeight: 1.5, color: "#333" }}>
								{chartDiagnosis.female?.content || ""}
							</div>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
							<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
								<span style={{ fontWeight: 700, fontSize: "14px", color: WEB_BLUE }}>男方</span>
								<span style={{ padding: "3px 8px", borderRadius: "9999px", border: `2px solid ${WEB_BLUE}`, background: "#fff", fontSize: "10px", color: WEB_BLUE }}>
									{chartDiagnosis.male?.title || "命局"}
								</span>
							</div>
							<div style={{ padding: "8px", background: "#f3f4f6", borderRadius: "6px", fontSize: "11px", lineHeight: 1.5, color: "#333" }}>
								{chartDiagnosis.male?.content || ""}
							</div>
						</div>
					</div>
					{chartDiagnosis.keySymptoms && (
						<>
							<div style={{ marginBottom: "4px" }}>
								<span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "9999px", background: WEB_PINK, color: "#fff", fontWeight: 700, fontSize: "12px" }}>
									關鍵合盤徵象
								</span>
							</div>
							<div style={{ padding: "8px", background: "#f3f4f6", borderRadius: "6px", fontSize: "11px", lineHeight: 1.5, color: "#333", marginBottom: "12px" }}>
								{stripMarkdown(chartDiagnosis.keySymptoms)}
							</div>
						</>
					)}
				</>
			)}

			{/* Fallback: base 女方分析/男方分析 when no chartDiagnosis */}
			{!chartDiagnosis && (femaleDesc || maleDesc) && (
				<div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
					{femaleDesc && (
						<div style={{ border: `2px solid ${COUPLE_COLOR}`, borderRadius: "10px", overflow: "hidden", backgroundColor: "#FDF2F8" }}>
							<div style={{ background: COUPLE_COLOR, color: "#fff", fontWeight: 700, fontSize: "12px", padding: "6px 12px" }}>
								女方分析
								{female?.birthDate && <span style={{ fontWeight: 400, fontSize: "10px", opacity: 0.9, marginLeft: "6px" }}>{female.birthDate}{female.bazi ? ` · ${female.bazi}` : ""}</span>}
							</div>
							<div style={{ padding: "10px 12px", fontSize: "11px", lineHeight: 1.6, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{femaleDesc}</div>
						</div>
					)}
					{maleDesc && (
						<div style={{ border: `2px solid ${COUPLE_ACCENT}`, borderRadius: "10px", overflow: "hidden", backgroundColor: "#FFFBEB" }}>
							<div style={{ background: COUPLE_ACCENT, color: "#fff", fontWeight: 700, fontSize: "12px", padding: "6px 12px" }}>
								男方分析
								{male?.birthDate && <span style={{ fontWeight: 400, fontSize: "10px", opacity: 0.9, marginLeft: "6px" }}>{male.birthDate}{male.bazi ? ` · ${male.bazi}` : ""}</span>}
							</div>
							<div style={{ padding: "10px 12px", fontSize: "11px", lineHeight: 1.6, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{maleDesc}</div>
						</div>
					)}
				</div>
			)}
			{!chartDiagnosis && raw?.trim() && !femaleDesc && !maleDesc && (
				<div style={{ marginBottom: "12px", fontSize: "11px", lineHeight: 1.65, color: "#424242", whiteSpace: "pre-wrap" }}>
					{stripMarkdown(raw).substring(0, 3000)}
				</div>
			)}

			{/* 風水急救 — 72小時內行動方案 */}
			{emergencyFengShui?.recommendations?.length > 0 && (
				<>
					<SectionTitle>風水急救</SectionTitle>
					<div style={{ marginBottom: "8px" }}>
						<h3 style={{ fontWeight: 700, fontSize: "14px", color: WEB_PINK, fontFamily: "Noto Serif TC, serif" }}>72小時內行動方案</h3>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
						{emergencyFengShui.recommendations.map((item, index) => (
							<div key={index} style={{ background: "#EFEFEF", borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
								<div style={{ background: GRADIENT_PINK_GOLD, color: "#fff", fontWeight: 600, fontSize: "11px", padding: "6px 10px", textAlign: "center" }}>{item.title}</div>
								<div style={{ padding: "8px", fontSize: "10px", lineHeight: 1.5, color: "#333" }}>{item.description}</div>
							</div>
						))}
					</div>
				</>
			)}

			{/* 重啟默契 — 破冰儀式建議 */}
			{restartChemistry?.iceBreakers?.length > 0 && (
				<>
					<SectionTitle>重啟默契</SectionTitle>
					<div style={{ marginBottom: "8px" }}>
						<h3 style={{ fontWeight: 700, fontSize: "14px", color: WEB_PINK, fontFamily: "Noto Serif TC, serif" }}>破冰儀式建議</h3>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
						{restartChemistry.iceBreakers.map((item, index) => (
							<div key={index} style={{ background: "#EFEFEF", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
								<div style={{ background: item.gradient || GRADIENT_PINK_GOLD, color: "#fff", fontWeight: 700, fontSize: "11px", padding: "5px 10px", borderRadius: "9999px", textAlign: "center" }}>{item.title}</div>
								<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
									{item.steps?.map((step, i) => (
										<div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
											<span style={{ width: "16px", height: "16px", borderRadius: "50%", background: GRADIENT_PINK_GOLD, color: "#fff", fontSize: "9px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
											<span style={{ fontSize: "10px", lineHeight: 1.4, color: "#333" }}>{step}</span>
										</div>
									))}
								</div>
								{item.principle && (
									<div style={{ padding: "6px", borderRadius: "6px", background: "linear-gradient(to right, #fef2f2, #fefce8)", border: "1px solid #fecaca", fontSize: "9px", lineHeight: 1.4, color: "#b91c1c", textAlign: "center", fontWeight: 500 }}>
										{item.principle}
									</div>
								)}
							</div>
						))}
					</div>
					{restartChemistry.generalAdvice && (
						<div style={{ padding: "10px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "linear-gradient(to right, #f9fafb, #eff6ff)", fontSize: "11px", lineHeight: 1.5, color: "#374151" }}>
							{restartChemistry.generalAdvice}
						</div>
					)}
				</>
			)}
		</div>
	);
}
