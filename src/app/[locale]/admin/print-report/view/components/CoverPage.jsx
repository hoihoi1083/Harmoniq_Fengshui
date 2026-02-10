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
			className="bg-white page-break"
			style={{
				width: "210mm",
				height: "297mm",
				position: "relative",
				overflow: "hidden",
				backgroundColor: "white",
			}}
		>
			{/* Background watermark pattern */}
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
						fontSize: "25px",
						fontWeight: 700,
						letterSpacing: "1.8em",
						color: "#000000",
						marginBottom: "0px",
					}}
				>
					個人化訂製專屬
				</div>

				{/* Report type label */}
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
					{concernText}
					<br />
					報告
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
						fontSize: "25px",
						fontWeight: 900,
						color: "#000000",
						letterSpacing: "0.05em",
					}}
				>
					風鈴開運吉物
				</div>
			</div>

			{/* Right Side - Vertical Year and Date, matching reference layout */}
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
				{/* Year rotated along the right edge */}
				{/* <div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
						fontSize: "90px",
						fontWeight: 900,
						color: "#000000",
						transformOrigin: "center",
						letterSpacing: "0.15em",
						transform: "rotate(-90deg)",
					}}
				>
					{year}
				</div> */}

				{/* Vertical divider line */}
				<div
					style={{
						width: "2px",
						flexGrow: 1,
						backgroundColor: "#000000",
						margin: "0px 0px 90px 20px",
					}}
				/>

				{/* Date (month.day) rotated at bottom */}
				<div
					style={{
						fontFamily:
							"var(--font-noto-serif-sc), 'Noto Serif SC', serif",
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
