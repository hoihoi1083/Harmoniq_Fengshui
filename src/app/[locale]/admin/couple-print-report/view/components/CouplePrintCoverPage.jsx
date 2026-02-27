"use client";

/**
 * Couple print report cover page - A4, same layout as fortune CoverPage
 * Title: 姻緣合盤報告
 */
const COUPLE_COLOR = "#D94075";

export default function CouplePrintCoverPage({ productName }) {
	const now = new Date();
	const year = now.getFullYear();

	return (
		<div
			className="bg-white page-break"
			style={{
				width: "210mm",
				height: "297mm",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "white",
			}}
		>
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
				命
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
				理
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
				報
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
				告
			</div>

			<div style={{ position: "absolute", top: "30mm", left: "25mm", zIndex: 2 }}>
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
					個人化訂製專屬
				</div>
				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "130px",
						fontWeight: 900,
						color: COUPLE_COLOR,
						lineHeight: "1.1",
						letterSpacing: "0.05em",
						marginBottom: "28px",
					}}
				>
					姻緣合盤
					<br />
					報告
				</div>
			</div>

			<div style={{ position: "absolute", bottom: "40mm", left: "35mm", zIndex: 2 }}>
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
						產品
					</span>
				</div>
				<div
					style={{
						fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "16px",
						fontWeight: 400,
						color: "#000000",
						marginBottom: "12px",
					}}
				>
					{productName || "梨花木鑰匙珠砂掛墜"}
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
					風鈴開運吉物
				</div>
			</div>

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
