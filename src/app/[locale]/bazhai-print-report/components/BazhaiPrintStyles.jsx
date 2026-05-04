export default function BazhaiPrintStyles() {
	return (
		<style jsx global>{`
			@media print {
				.no-print,
				nav {
					display: none !important;
				}
				@page {
					size: A4;
					margin: 0;
				}
				body {
					margin: 0 !important;
					padding: 0 !important;
					background: white !important;
					print-color-adjust: exact !important;
					-webkit-print-color-adjust: exact !important;
				}
				.print-report-pages {
					background: white !important;
					padding: 0 !important;
					margin: 0 !important;
				}
				.cover-page {
					page-break-after: always;
					width: 210mm !important;
					height: 297mm !important;
					margin: 0 !important;
					box-sizing: border-box !important;
					box-shadow: none !important;
					border: none !important;
					overflow: hidden !important;
				}
				.page-break {
					page-break-after: always;
					page-break-inside: avoid;
					width: 210mm !important;
					height: 297mm !important;
					margin: 0 !important;
					box-sizing: border-box !important;
					box-shadow: none !important;
					border: none !important;
					border-radius: 0 !important;
					overflow: hidden !important;
				}
				.print-page-content {
					flex: 1 1 auto;
					min-height: 0;
					overflow: visible;
				}
			}
			@media screen {
				.cover-page {
					width: 210mm;
					height: 297mm;
					margin: 0 auto 20px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
					border: 1px solid #d1d5db;
					box-sizing: border-box;
					background: white;
				}
				.page-break {
					width: 210mm;
					height: 297mm;
					margin: 0 auto 20px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
					border: 1px solid #d1d5db;
					box-sizing: border-box;
					background: white;
					overflow: hidden;
				}
				.print-page-content {
					flex: 1 1 auto;
					min-height: 0;
					overflow: visible;
				}
			}
			.print-scale-95,
			.print-scale-93,
			.print-scale-90,
			.print-scale-88,
			.print-scale-85 {
				transform-origin: top left;
				overflow: visible;
			}
			.print-scale-95 {
				transform: scale(0.95);
				width: calc(100% / 0.95);
			}
			.print-scale-93 {
				transform: scale(0.93);
				width: calc(100% / 0.93);
			}
			.print-scale-90 {
				transform: scale(0.9);
				width: calc(100% / 0.9);
			}
			.print-scale-88 {
				transform: scale(0.88);
				width: calc(100% / 0.88);
			}
			.print-scale-85 {
				transform: scale(0.85);
				width: calc(100% / 0.85);
			}
		`}</style>
	);
}
