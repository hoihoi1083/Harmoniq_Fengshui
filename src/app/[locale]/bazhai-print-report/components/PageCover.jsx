/** Bazhai print cover — layout aligned with admin `CoverPage.jsx` (print-report). */
const ACCENT = "#5E7E5E";

export default function PageCover({ analysisData, locale = "zh-TW" }) {
	const isCn = locale === "zh-CN";
	const reportDate = analysisData?.analysisDate
		? new Date(analysisData.analysisDate)
		: new Date();
	const year = reportDate.getFullYear();

	const mingName = analysisData?.mingGuaInfo?.name || "未提供";
	const mingGroup = analysisData?.mingGuaInfo?.group || "未提供";
	const ownerLine = `${mingName} · ${mingGroup}`;

	return (
		<div
			className="bg-white page-break cover-page"
			style={{
				width: "210mm",
				height: "297mm",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "white",
			}}
		>
			{/* Background watermark panel — same as admin cover */}
			<div
				style={{
					position: "absolute",
					top: "35mm",
					left: "35mm",
					width: "135mm",
					height: "210mm",
					backgroundColor: "#EDEDED",
					zIndex: 0,
				}}
			/>

			{/* Corner characters: 八宅風水 */}
			<div
				style={{
					position: "absolute",
					top: "6mm",
					left: "10mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				八
			</div>
			<div
				style={{
					position: "absolute",
					top: "6mm",
					right: "5mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				宅
			</div>
			<div
				style={{
					position: "absolute",
					bottom: "6mm",
					left: "10mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				風
			</div>
			<div
				style={{
					position: "absolute",
					bottom: "6mm",
					right: "5mm",
					fontSize: "220px",
					fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				水
			</div>

			{/* Top left — header + report type (admin structure) */}
			<div
				style={{
					position: "absolute",
					top: "30mm",
					left: "25mm",
					zIndex: 2,
				}}
			>
				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "25px",
						fontWeight: 700,
						letterSpacing: "1.8em",
						color: "#000000",
						marginBottom: "0px",
					}}
				>
					{isCn ? "个性化订制专属" : "個人化訂製專屬"}
				</div>

				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "130px",
						fontWeight: 900,
						color: ACCENT,
						lineHeight: "1.1",
						letterSpacing: "0.05em",
						marginBottom: "28px",
					}}
				>
					{isCn ? "八宅风水" : "八宅風水"}
					<br />
					{isCn ? "报告" : "報告"}
				</div>
			</div>

			{/* Bottom left — replaces product block with 命主 / 戶型重點 */}
			<div
				style={{
					position: "absolute",
					bottom: "40mm",
					left: "35mm",
					zIndex: 2,
					maxWidth: "120mm",
				}}
			>
				<div style={{ marginBottom: "12px" }}>
					<span
						style={{
							fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "25px",
							fontWeight: 700,
							color: "#000000",
							letterSpacing: "0.3em",
							paddingBottom: "4px",
						}}
					>
						{isCn ? "命主" : "命主"}
					</span>
				</div>

				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "16px",
						fontWeight: 400,
						color: "#000000",
						marginBottom: "12px",
						lineHeight: 1.5,
					}}
				>
					{ownerLine}
				</div>

				<div
					style={{
						fontFamily: "serif",
						fontSize: "25px",
						fontWeight: 900,
						color: "#000000",
						letterSpacing: "0.05em",
					}}
				>
					HARMONIQ BAZHAI
				</div>
			</div>

			{/* Right — vertical rule + year (admin layout) */}
			<div
				style={{
					position: "absolute",
					top: "35mm",
					right: "5mm",
					bottom: "35mm",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "space-between",
					zIndex: 2,
				}}
			>
				<div
					style={{
						width: "2px",
						flexGrow: 1,
						backgroundColor: "#000000",
						margin: "0px 0px 90px 20px",
					}}
				/>

				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "90px",
						fontWeight: 900,
						color: "#000000",
						transformOrigin: "center",
						letterSpacing: "0.15em",
						transform: "rotate(-90deg)",
					}}
				>
					{year}
				</div>
			</div>
		</div>
	);
}
