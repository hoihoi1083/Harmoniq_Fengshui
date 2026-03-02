"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const LIFE_REPORT_COLOR = "#0d9488";
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

function LifePrintReportInputForm() {
	const router = useRouter();
	const locale = useLocale();
	const [isGenerating, setIsGenerating] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		productName: "梨花木鑰匙珠砂掛墜",
		gender: "male",
		birthday: "",
		birthTime: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsGenerating(true);

		const params = new URLSearchParams({
			gender: formData.gender,
			birthday: formData.birthday,
			birthTime: formData.birthTime,
		});
		if (formData.name) params.set("name", formData.name);
		if (formData.productName) params.set("productName", formData.productName);

		router.push(`/${locale}/admin/life-print-report/view?${params.toString()}`);
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
							color: LIFE_REPORT_COLOR,
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						命理報告列印
					</h1>
					<p className="text-gray-600">
						請填寫出生資料以生成命理測算報告列印版（與網頁版命理報告一致，無需填寫關注領域或具體問題）
					</p>
				</div>

				<form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
					<div>
						<label className="block text-gray-700 font-medium mb-3">姓名（選填）</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="請輸入報告對象姓名（顯示於封面與基礎分析）"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
						/>
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-3">產品名稱（選填）</label>
						<input
							type="text"
							value={formData.productName}
							onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
							placeholder="例：梨花木鑰匙珠砂掛墜（顯示於封面）"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
						/>
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-3">性別 <span className="text-red-500">*</span></label>
						<div className="flex gap-4">
							<label className="flex items-center cursor-pointer">
								<input
									type="radio"
									name="gender"
									value="male"
									checked={formData.gender === "male"}
									onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
									className="w-5 h-5 mr-2"
								/>
								<span>男</span>
							</label>
							<label className="flex items-center cursor-pointer">
								<input
									type="radio"
									name="gender"
									value="female"
									checked={formData.gender === "female"}
									onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
									className="w-5 h-5 mr-2"
								/>
								<span>女</span>
							</label>
						</div>
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-3">出生日期 <span className="text-red-500">*</span></label>
						<input
							type="date"
							required
							value={formData.birthday}
							onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
						/>
					</div>

					<div>
						<label className="block text-gray-700 font-medium mb-3">出生時辰 <span className="text-red-500">*</span></label>
						<select
							required
							value={formData.birthTime}
							onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
						>
							<option value="">請選擇時辰</option>
							{BIRTH_TIME_OPTIONS.map((opt) => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>

					<button
						type="submit"
						disabled={isGenerating}
						className="w-full py-4 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ backgroundColor: LIFE_REPORT_COLOR }}
					>
						{isGenerating ? "生成中..." : "生成命理報告"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default function LifePrintReportInput() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
			<LifePrintReportInputForm />
		</Suspense>
	);
}
