"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

function PrintReportInputForm() {
	const router = useRouter();
	const locale = useLocale();
	const searchParams = useSearchParams();
	const concern = searchParams.get("concern") || "財運";

	const [formData, setFormData] = useState({
		gender: "male",
		birthday: "",
		birthTime: "",
		question: "",
	});

	const [isGenerating, setIsGenerating] = useState(false);

	const concernColors = {
		財運: "#AD7F00",
		健康: "#389D7D",
		感情: "#D94075",
		事業: "#567156",
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsGenerating(true);

		// Generate a unique report ID
		const reportId = `${Date.now()}_${concern}_${formData.gender}`;

		// Navigate to print report page with parameters
		const params = new URLSearchParams({
			concern,
			gender: formData.gender,
			birthday: formData.birthday,
			birthTime: formData.birthTime,
			question: formData.question,
		});

		router.push(`/${locale}/admin/print-report/view?${params.toString()}`);
	};

	return (
		<div className="min-h-screen bg-[#EFEFEF] p-8">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
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
							color: concernColors[concern],
							fontFamily: "Noto Serif TC, serif",
						}}
					>
						{concern}報告生成
					</h1>
					<p className="text-gray-600">請填寫以下資料以生成專業格式報告</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
					{/* Gender */}
					<div className="mb-6">
						<label className="block text-gray-700 font-medium mb-3">
							性別
						</label>
						<div className="flex gap-4">
							<label className="flex items-center cursor-pointer">
								<input
									type="radio"
									name="gender"
									value="male"
									checked={formData.gender === "male"}
									onChange={(e) =>
										setFormData({ ...formData, gender: e.target.value })
									}
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
									onChange={(e) =>
										setFormData({ ...formData, gender: e.target.value })
									}
									className="w-5 h-5 mr-2"
								/>
								<span>女</span>
							</label>
						</div>
					</div>

					{/* Birthday */}
					<div className="mb-6">
						<label className="block text-gray-700 font-medium mb-3">
							出生日期
						</label>
						<input
							type="date"
							required
							value={formData.birthday}
							onChange={(e) =>
								setFormData({ ...formData, birthday: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2"
							style={{ focusRingColor: concernColors[concern] }}
						/>
					</div>

					{/* Birth Time */}
					<div className="mb-6">
						<label className="block text-gray-700 font-medium mb-3">
							出生時辰
						</label>
						<select
							required
							value={formData.birthTime}
							onChange={(e) =>
								setFormData({ ...formData, birthTime: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2"
						>
							<option value="">請選擇時辰</option>
							<option value="子時 (23:00-01:00)">子時 (23:00-01:00)</option>
							<option value="丑時 (01:00-03:00)">丑時 (01:00-03:00)</option>
							<option value="寅時 (03:00-05:00)">寅時 (03:00-05:00)</option>
							<option value="卯時 (05:00-07:00)">卯時 (05:00-07:00)</option>
							<option value="辰時 (07:00-09:00)">辰時 (07:00-09:00)</option>
							<option value="巳時 (09:00-11:00)">巳時 (09:00-11:00)</option>
							<option value="午時 (11:00-13:00)">午時 (11:00-13:00)</option>
							<option value="未時 (13:00-15:00)">未時 (13:00-15:00)</option>
							<option value="申時 (15:00-17:00)">申時 (15:00-17:00)</option>
							<option value="酉時 (17:00-19:00)">酉時 (17:00-19:00)</option>
							<option value="戌時 (19:00-21:00)">戌時 (19:00-21:00)</option>
							<option value="亥時 (21:00-23:00)">亥時 (21:00-23:00)</option>
						</select>
					</div>

					{/* Question */}
					<div className="mb-8">
						<label className="block text-gray-700 font-medium mb-3">
							具體問題（選填）
						</label>
						<textarea
							value={formData.question}
							onChange={(e) =>
								setFormData({ ...formData, question: e.target.value })
							}
							rows={4}
							placeholder={`請描述您在${concern}方面的具體問題或關注點...`}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 resize-none"
						/>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isGenerating}
						className="w-full py-4 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ backgroundColor: concernColors[concern] }}
					>
						{isGenerating ? "生成中..." : "生成報告"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default function PrintReportInput() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PrintReportInputForm />
		</Suspense>
	);
}
