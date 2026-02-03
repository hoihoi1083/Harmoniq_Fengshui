import Image from "next/image";
import { getConcernColor } from "@/utils/colorTheme";

export default function CoverPage({ concern, productName }) {
	// Get current date for the report
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	// Map concern to Chinese text
	const concernTextMap = {
		財運: "財運",
		事業: "事業",
		感情: "感情",
		健康: "健康",
	};

	const concernText = concernTextMap[concern] || concern;

	return (
		<div
			className="page-break print-report-cover bg-white"
			style={{
				width: "210mm",
				height: "297mm",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "white",
			}}
		>
			{/* Central light rectangle block */}
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

			{/* Large background characters: 命理報告 on four corners of the rectangle */}
			{/* Top-left: 命 */}
			<div
				style={{
					position: "absolute",
					top: "6mm",
					left: "10mm",
					fontSize: "220px",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				命
			</div>
			{/* Top-right: 理 */}
			<div
				style={{
					position: "absolute",
					top: "6mm",
					right: "5mm",
					fontSize: "220px",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				理
			</div>
			{/* Bottom-left: 報 */}
			<div
				style={{
					position: "absolute",
					bottom: "6mm",
					left: "10mm",
					fontSize: "220px",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				報
			</div>
			{/* Bottom-right: 告 */}
			<div
				style={{
					position: "absolute",
					bottom: "6mm",
					right: "5mm",
					fontSize: "220px",
					fontFamily:
						"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
					fontWeight: 900,
					color: "#DADDE4",
					opacity: 0.9,
					zIndex: 0,
				}}
			>
				告
			</div>

			{/* Top Left Section */}
			<div
				style={{
					position: "absolute",
					top: "30mm",
					left: "25mm",
					zIndex: 2,
				}}
			>
				{/* Header text */}
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "18px",
						fontWeight: 400,
						letterSpacing: "0.8em",
						color: "#000000",
						marginBottom: "0px",
					}}
				>
					個人化訂製專屬
				</div>

				{/* Main title - 命理報告 */}
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "130px",
						fontWeight: 900,
						color: getConcernColor(concern),
						lineHeight: "1.1",
						letterSpacing: "0.05em",
						marginBottom: "28px",
					}}
				>
					命理
					<br />
					報告
				</div>

				{/* Subtitle - Report types */}
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "18px",
						fontWeight: 400,
						letterSpacing: "0.5em",
						color: "#000000",
						marginBottom: "30px",
					}}
				>
					財運、事業、感情、健康報告
				</div>

				{/* Report type label */}
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "20px",
						fontWeight: 400,
						letterSpacing: "0.5em",
						color: "#000000",
					}}
				>
					{concernText}運報告
				</div>
			</div>

			{/* Bottom Left Section - Product Info */}
			<div
				style={{
					position: "absolute",
					bottom: "40mm",
					left: "35mm",
					zIndex: 2,
				}}
			>
				{/* Product label with underline */}
				<div style={{ marginBottom: "12px" }}>
					<span
						style={{
							fontFamily:
								"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
							fontSize: "24px",
							fontWeight: 500,
							color: "#000000",
							letterSpacing: "0.3em",
							borderBottom: "2px solid #000000",
							paddingBottom: "4px",
						}}
					>
						產品
					</span>
				</div>

				{/* Product name in Chinese */}
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "16px",
						fontWeight: 400,
						color: "#000000",
						marginBottom: "12px",
					}}
				>
					{productName || "梨花木龜狀砭砂掛墜"}
				</div>

				{/* Product name in English */}
				<div
					style={{
						fontFamily: "serif",
						fontSize: "22px",
						fontWeight: 700,
						color: "#000000",
						letterSpacing: "0.05em",
					}}
				>
					HarmoniQ Bell
				</div>
			</div>

			{/* Right Side - Vertical Year and Date, matching reference layout */}
			<div
				style={{
					position: "absolute",
					top: "35mm",
					right: "18mm",
					bottom: "35mm",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "space-between",
					zIndex: 2,
				}}
			>
				{/* Year rotated along the right edge */}
				<div
					style={{
						fontFamily: "serif",
						fontSize: "90px",
						fontWeight: 900,
						color: "#000000",
						transform: "rotate(90deg)",
						transformOrigin: "center",
						letterSpacing: "0.15em",
					}}
				>
					{year}
				</div>

				{/* Vertical divider line */}
				<div
					style={{
						width: "2px",
						flexGrow: 1,
						backgroundColor: "#000000",
						margin: "18px 0",
					}}
				/>

				{/* Date (month.day) rotated at bottom */}
				<div
					style={{
						fontFamily: "serif",
						fontSize: "90px",
						fontWeight: 900,
						color: "#000000",
						transform: "rotate(90deg)",
						transformOrigin: "center",
						letterSpacing: "0.1em",
					}}
				>
					{month}.{day}
				</div>
			</div>
		</div>
	);
}
