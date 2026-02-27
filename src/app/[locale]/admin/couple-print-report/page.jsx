"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const COUPLE_COLOR = "#D94075";

export default function CouplePrintReportSelection() {
	const router = useRouter();
	const locale = useLocale();

	const handleGoToInput = () => {
		router.push(`/${locale}/admin/couple-print-report/input`);
	};

	return (
		<div className="min-h-screen bg-[#EFEFEF] p-8">
			<div className="max-w-6xl mx-auto">
				<div className="mb-12 text-center">
					<h1
						className="text-4xl font-bold text-gray-800 mb-4"
						style={{ fontFamily: "Noto Serif TC, serif" }}
					>
						姻緣合盤報告生成
					</h1>
					<p className="text-gray-600 text-lg">
						填寫雙方資料與具體問題，生成專業格式姻緣合盤報告
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<button
						onClick={handleGoToInput}
						className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
						style={{ borderTop: `6px solid ${COUPLE_COLOR}` }}
					>
						<div className="text-center">
							<div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
								❤️
							</div>
							<h2
								className="text-3xl font-bold mb-2"
								style={{
									color: COUPLE_COLOR,
									fontFamily: "Noto Serif TC, serif",
								}}
							>
								姻緣合盤報告
							</h2>
							<p className="text-gray-500 text-sm">點擊填寫資料生成報告</p>
						</div>
					</button>
				</div>

				<div className="mt-12 text-center">
					<button
						onClick={() => router.push(`/${locale}/admin`)}
						className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
					>
						返回管理後台
					</button>
				</div>
			</div>
		</div>
	);
}
