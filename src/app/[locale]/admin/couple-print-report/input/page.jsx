"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const COUPLE_COLOR = "#D94075";
const BIRTH_TIME_OPTIONS = [
	"子時 (23:00-01:00)",
	"丑時 (01:00-03:00)",
	"寅時 (03:00-05:00)",
	"卯時 (05:00-07:00)",
	"辰時 (07:00-09:00)",
	"巳時 (09:00-11:00)",
	"午時 (11:00-13:00)",
	"未時 (13:00-15:00)",
	"申時 (15:00-17:00)",
	"酉時 (17:00-19:00)",
	"戌時 (19:00-21:00)",
	"亥時 (21:00-23:00)",
];

function CouplePrintReportInputForm() {
	const router = useRouter();
	const locale = useLocale();
	const [isGenerating, setIsGenerating] = useState(false);
	const [formData, setFormData] = useState({
		name1: "",
		name2: "",
		gender1: "male",
		gender2: "female",
		birthday1: "",
		birthday2: "",
		birthTime1: "",
		birthTime2: "",
		productName: "梨花木鑰匙珠砂掛墜",
		question: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsGenerating(true);

		const params = new URLSearchParams({
			gender1: formData.gender1,
			gender2: formData.gender2,
			birthday1: formData.birthday1,
			birthday2: formData.birthday2,
			birthTime1: formData.birthTime1,
			birthTime2: formData.birthTime2,
			question: formData.question || "感情關係和諧改善建議",
		});
		if (formData.name1) params.set("name1", formData.name1);
		if (formData.name2) params.set("name2", formData.name2);
		if (formData.productName) params.set("productName", formData.productName);

		router.push(`/${locale}/admin/couple-print-report/view?${params.toString()}`);
	};

	return (
		<div className="min-h-screen bg-[#EFEFEF] p-8">
			<div className="max-w-3xl mx-auto">
				<div className="mb-8">
					<button
						onClick={() => router.back()}
						className="text-gray-600 hover:text-gray-800 mb-4"
					>
						← 返回
					</button>
					<h1
						className="text-4xl font-bold mb-2"
						style={{
							color: COUPLE_COLOR,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						姻緣合盤報告生成
					</h1>
					<p className="text-gray-600">請填寫雙方資料與具體問題以生成專業格式報告</p>
				</div>

				<form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
					{/* Product Name */}
					<div>
						<label className="block text-gray-700 font-medium mb-3">產品名稱</label>
						<input
							type="text"
							value={formData.productName}
							onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
							placeholder="例：梨花木鑰匙珠砂掛墜（顯示於封面）"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2"
							style={{ focusRingColor: COUPLE_COLOR }}
						/>
					</div>

					{/* === 第一人 === */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-bold mb-4" style={{ color: COUPLE_COLOR }}>第一人</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-gray-700 font-medium mb-2">姓名（選填）</label>
								<input
									type="text"
									value={formData.name1}
									onChange={(e) => setFormData({ ...formData, name1: e.target.value })}
									placeholder="男方或第一人"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">性別</label>
								<div className="flex gap-4">
									<label className="flex items-center cursor-pointer">
										<input
											type="radio"
											name="gender1"
											value="male"
											checked={formData.gender1 === "male"}
											onChange={(e) => setFormData({ ...formData, gender1: e.target.value })}
											className="w-5 h-5 mr-2"
										/>
										<span>男</span>
									</label>
									<label className="flex items-center cursor-pointer">
										<input
											type="radio"
											name="gender1"
											value="female"
											checked={formData.gender1 === "female"}
											onChange={(e) => setFormData({ ...formData, gender1: e.target.value })}
											className="w-5 h-5 mr-2"
										/>
										<span>女</span>
									</label>
								</div>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">出生日期 *</label>
								<input
									type="date"
									required
									value={formData.birthday1}
									onChange={(e) => setFormData({ ...formData, birthday1: e.target.value })}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">出生時辰 *</label>
								<select
									required
									value={formData.birthTime1}
									onChange={(e) => setFormData({ ...formData, birthTime1: e.target.value })}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg"
								>
									<option value="">請選擇時辰</option>
									{BIRTH_TIME_OPTIONS.map((opt) => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* === 第二人 === */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-bold mb-4" style={{ color: COUPLE_COLOR }}>第二人</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-gray-700 font-medium mb-2">姓名（選填）</label>
								<input
									type="text"
									value={formData.name2}
									onChange={(e) => setFormData({ ...formData, name2: e.target.value })}
									placeholder="女方或第二人"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">性別</label>
								<div className="flex gap-4">
									<label className="flex items-center cursor-pointer">
										<input
											type="radio"
											name="gender2"
											value="male"
											checked={formData.gender2 === "male"}
											onChange={(e) => setFormData({ ...formData, gender2: e.target.value })}
											className="w-5 h-5 mr-2"
										/>
										<span>男</span>
									</label>
									<label className="flex items-center cursor-pointer">
										<input
											type="radio"
											name="gender2"
											value="female"
											checked={formData.gender2 === "female"}
											onChange={(e) => setFormData({ ...formData, gender2: e.target.value })}
											className="w-5 h-5 mr-2"
										/>
										<span>女</span>
									</label>
								</div>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">出生日期 *</label>
								<input
									type="date"
									required
									value={formData.birthday2}
									onChange={(e) => setFormData({ ...formData, birthday2: e.target.value })}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg"
								/>
							</div>
							<div>
								<label className="block text-gray-700 font-medium mb-2">出生時辰 *</label>
								<select
									required
									value={formData.birthTime2}
									onChange={(e) => setFormData({ ...formData, birthTime2: e.target.value })}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg"
								>
									<option value="">請選擇時辰</option>
									{BIRTH_TIME_OPTIONS.map((opt) => (
										<option key={opt} value={opt}>{opt}</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* 具體問題 */}
					<div>
						<label className="block text-gray-700 font-medium mb-3">具體問題（選填）</label>
						<textarea
							value={formData.question}
							onChange={(e) => setFormData({ ...formData, question: e.target.value })}
							rows={4}
							placeholder="請描述雙方感情方面的具體問題或關注點，例如：冷戰、異地、溝通爭吵等..."
							className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
						/>
					</div>

					<button
						type="submit"
						disabled={isGenerating}
						className="w-full py-4 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ backgroundColor: COUPLE_COLOR }}
					>
						{isGenerating ? "生成中..." : "生成報告"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default function CouplePrintReportInput() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CouplePrintReportInputForm />
		</Suspense>
	);
}
