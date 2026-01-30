"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function PrintReportSelection() {
	const router = useRouter();
	const locale = useLocale();

	const concerns = [
		{ id: "財運", label: "財運", color: "#AD7F00", icon: "💰" },
		{ id: "健康", label: "健康", color: "#389D7D", icon: "🏥" },
		{ id: "感情", label: "感情", color: "#D94075", icon: "❤️" },
		{ id: "事業", label: "事業", color: "#567156", icon: "💼" },
	];

	const handleSelectConcern = (concernId) => {
		router.push(`/${locale}/admin/print-report/input?concern=${concernId}`);
	};

	return (
		<div className="min-h-screen bg-[#EFEFEF] p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-12 text-center">
					<h1 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Noto Serif TC, serif" }}>
						報告生成系統
					</h1>
					<p className="text-gray-600 text-lg">
						選擇報告類型以開始生成專業格式報告
					</p>
				</div>

				{/* Concern Selection Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{concerns.map((concern) => (
						<button
							key={concern.id}
							onClick={() => handleSelectConcern(concern.id)}
							className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
							style={{
								borderTop: `6px solid ${concern.color}`,
							}}
						>
							<div className="text-center">
								<div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
									{concern.icon}
								</div>
								<h2
									className="text-3xl font-bold mb-2"
									style={{
										color: concern.color,
										fontFamily: "Noto Serif TC, serif",
									}}
								>
									{concern.label}
								</h2>
								<p className="text-gray-500 text-sm">點擊生成報告</p>
							</div>
						</button>
					))}
				</div>

				{/* Back Button */}
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
