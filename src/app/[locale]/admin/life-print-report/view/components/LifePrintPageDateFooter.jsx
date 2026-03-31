"use client";

/**
 * Date (top-right) + footer image (bottom-left) for each print page.
 * Use on every page except the cover. Match couple-print-report style.
 */
import Image from "next/image";
import { useLocale } from "next-intl";

const dateStyle = {
	fontFamily: "Noto Serif TC, serif",
	fontWeight: 400,
	fontSize: "20px",
	lineHeight: "14px",
	color: "#424242",
	textAlign: "right",
};

export function getReportDateString(locale = "zh-TW") {
	const dateLocale = locale === "zh-CN" ? "zh-CN" : "zh-TW";
	return new Date().toLocaleDateString(dateLocale).replace(/\//g, "/");
}

export default function LifePrintPageDateFooter() {
	const locale = useLocale();
	return (
		<>
			<div
				style={{
					position: "absolute",
					right: "18mm",
					top: "8mm",
					...dateStyle,
				}}
			>
				{getReportDateString(locale)}
			</div>
			<div
				style={{
					position: "absolute",
					bottom: "20mm",
					left: "5mm",
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
		</>
	);
}
