import React, { useState } from "react";

const BirthdayModal = ({
	isOpen,
	onClose,
	onSubmit,
	concern,
	isCoupleAnalysis = false,
}) => {
	// 單人資料
	const [birthday, setBirthday] = useState("");
	const [gender, setGender] = useState("");

	// 雙人資料（合盤分析用）
	const [userBirthday, setUserBirthday] = useState("");
	const [userGender, setUserGender] = useState("");
	const [partnerBirthday, setPartnerBirthday] = useState("");
	const [partnerGender, setPartnerGender] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();

		console.log("🔍 Form submission attempt:");
		console.log("isCoupleAnalysis:", isCoupleAnalysis);
		console.log("userBirthday:", userBirthday);
		console.log("userGender:", userGender);
		console.log("partnerBirthday:", partnerBirthday);
		console.log("partnerGender:", partnerGender);

		if (isCoupleAnalysis) {
			// 合盤分析：需要雙方資料
			if (
				userBirthday &&
				userGender &&
				partnerBirthday &&
				partnerGender
			) {
				console.log(
					"✅ All couple analysis fields filled, submitting..."
				);
				onSubmit({
					userBirthday,
					userGender,
					partnerBirthday,
					partnerGender,
					isCoupleAnalysis: true,
				});
				// 清空表單
				setUserBirthday("");
				setUserGender("");
				setPartnerBirthday("");
				setPartnerGender("");
			} else {
				console.log("❌ Missing required fields for couple analysis:");
				console.log("- userBirthday:", userBirthday ? "✓" : "✗");
				console.log("- userGender:", userGender ? "✓" : "✗");
				console.log("- partnerBirthday:", partnerBirthday ? "✓" : "✗");
				console.log("- partnerGender:", partnerGender ? "✓" : "✗");
			}
		} else {
			// 個人分析：只需要個人資料
			if (birthday && gender) {
				console.log(
					"✅ All individual analysis fields filled, submitting..."
				);
				onSubmit({ birthday, gender, isCoupleAnalysis: false });
				setBirthday("");
				setGender("");
			} else {
				console.log(
					"❌ Missing required fields for individual analysis:"
				);
				console.log("- birthday:", birthday ? "✓" : "✗");
				console.log("- gender:", gender ? "✓" : "✗");
			}
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<h3 className="text-xl font-bold mb-4 text-center">
					📅 {isCoupleAnalysis ? "合盤分析資料收集" : "生辰資料收集"}
				</h3>

				<p className="text-gray-600 mb-6 text-center">
					為了為你{isCoupleAnalysis ? "們" : ""}提供更精準嘅{concern}
					分析，需要{isCoupleAnalysis ? "雙方" : "你"}嘅基本資料：
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isCoupleAnalysis ? (
						// 合盤分析：雙人表單
						<>
							{/* 用戶資料 */}
							<div className="border-l-4 border-blue-500 pl-4">
								<h4 className="font-semibold text-gray-800 mb-3">
									👤 你的資料
								</h4>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											出生日期 *
										</label>
										<input
											type="date"
											value={userBirthday}
											onChange={(e) =>
												setUserBirthday(e.target.value)
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											性別 *
										</label>
										<div className="flex space-x-4">
											<label className="flex items-center">
												<input
													type="radio"
													value="male"
													checked={
														userGender === "male"
													}
													onChange={(e) =>
														setUserGender(
															e.target.value
														)
													}
													className="mr-2"
													required
												/>
												男性
											</label>
											<label className="flex items-center">
												<input
													type="radio"
													value="female"
													checked={
														userGender === "female"
													}
													onChange={(e) =>
														setUserGender(
															e.target.value
														)
													}
													className="mr-2"
													required
												/>
												女性
											</label>
										</div>
									</div>
								</div>
							</div>

							{/* 伴侶資料 */}
							<div className="border-l-4 border-pink-500 pl-4">
								<h4 className="font-semibold text-gray-800 mb-3">
									💕 對方資料
								</h4>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											出生日期 *
										</label>
										<input
											type="date"
											value={partnerBirthday}
											onChange={(e) =>
												setPartnerBirthday(
													e.target.value
												)
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											性別 *
										</label>
										<div className="flex space-x-4">
											<label className="flex items-center">
												<input
													type="radio"
													value="male"
													checked={
														partnerGender === "male"
													}
													onChange={(e) =>
														setPartnerGender(
															e.target.value
														)
													}
													className="mr-2"
													required
												/>
												男性
											</label>
											<label className="flex items-center">
												<input
													type="radio"
													value="female"
													checked={
														partnerGender ===
														"female"
													}
													onChange={(e) =>
														setPartnerGender(
															e.target.value
														)
													}
													className="mr-2"
													required
												/>
												女性
											</label>
										</div>
									</div>
								</div>
							</div>
						</>
					) : (
						// 個人分析：單人表單
						<>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									出生日期 *
								</label>
								<input
									type="date"
									value={birthday}
									onChange={(e) =>
										setBirthday(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									性別 *
								</label>
								<div className="flex space-x-4">
									<label className="flex items-center">
										<input
											type="radio"
											value="male"
											checked={gender === "male"}
											onChange={(e) =>
												setGender(e.target.value)
											}
											className="mr-2"
											required
										/>
										男性
									</label>
									<label className="flex items-center">
										<input
											type="radio"
											value="female"
											checked={gender === "female"}
											onChange={(e) =>
												setGender(e.target.value)
											}
											className="mr-2"
											required
										/>
										女性
									</label>
								</div>
							</div>
						</>
					)}

					<div className="bg-blue-50 p-3 rounded-md">
						<p className="text-sm text-blue-800">
							📋 我們會根據你嘅八字五行提供：
							<br />
							• 個人性格分析
							<br />• {concern}運勢評估
							<br />
							• 具體改善建議
							<br />• 風水方案
						</p>
					</div>

					<div className="flex space-x-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							稍後再說
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							提交資料
						</button>
					</div>
				</form>

				<p className="text-xs text-gray-500 mt-4 text-center">
					🔒 你嘅個人資料會被安全保護
				</p>
			</div>
		</div>
	);
};

export default BirthdayModal;
