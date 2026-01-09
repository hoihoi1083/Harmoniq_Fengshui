"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

const Choose = () => {
	const router = useRouter();
	const params = useParams();
	const locale = params?.locale || "zh-TW";

	const [selectedMode, setSelectedMode] = useState("fengshui"); // Default to feng shui as shown in image
	const [showModal, setShowModal] = useState(false);
	const [modalStep, setModalStep] = useState(1); // Step for feng shui modal

	// Modal form states for personal
	const [gender, setGender] = useState("");
	const [year, setYear] = useState("");
	const [month, setMonth] = useState("");
	const [day, setDay] = useState("");
	const [hour, setHour] = useState("");

	// Modal form states for feng shui
	const [selectedRoomType, setSelectedRoomType] = useState("");
	const [selectedHouseDirection, setSelectedHouseDirection] = useState("");
	const [selectedRoomDirection, setSelectedRoomDirection] = useState("");

	// Room types mapping
	const roomTypes = [
		{ key: "living_room", name: "客廳", image: "客廳.png" },
		{ key: "dining_room", name: "飯廳", image: "飯廳.png" },
		{ key: "bedroom", name: "睡房", image: "睡房.png" },
		{ key: "bathroom", name: "浴室", image: "浴室.png" },
		{ key: "kitchen", name: "廚房", image: "廚房.png" },
		{ key: "storage_room", name: "雜物房", image: "雜物房.png" },
		{ key: "study_room", name: "書房", image: "書房.png" },
		{ key: "garage", name: "車庫", image: "客廳.png" }, // placeholder
		{ key: "balcony", name: "陽台", image: "陽台.png" },
	];

	// Directions mapping
	const directions = [
		{ key: "north", name: "N", image: "North.png" },
		{ key: "northWest", name: "NW", image: "NorthWest.png" },
		{ key: "west", name: "W", image: "West.png" },
		{ key: "southWest", name: "SW", image: "SouthWest.png" },
		{ key: "south", name: "S", image: "South.png" },
		{ key: "southEast", name: "SE", image: "SouthEast.png" },
		{ key: "east", name: "E", image: "East.png" },
		{ key: "northEast", name: "NE", image: "NorthEast.png" },
	];

	// Generate arrays for dropdowns
	const years = Array.from({ length: new Date().getFullYear() - 1926 + 1 }, (_, i) => 1926 + i);
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	const days = Array.from({ length: 31 }, (_, i) => i + 1);
	const hours = Array.from({ length: 24 }, (_, i) => i + 1);

	const handleModeSelect = (mode) => {
		setSelectedMode(mode);
	};

	const handleStartCalculation = () => {
		if (selectedMode === "personal") {
			setModalStep(1);
			setShowModal(true);
		} else if (selectedMode === "fengshui") {
			setModalStep(1);
			setShowModal(true);
		}
	};

	const handleModalSubmit = () => {
		if (selectedMode === "personal") {
			// Validate form
			if (!gender || !year || !month || !day || !hour) {
				alert("請填寫所有資料");
				return;
			}

			// Format the birthday data as expected by PersonalReportDisplay
			const birthDateTime = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hour.toString().padStart(2, "0")}:00:00`;

			const personalData = {
				gender: gender,
				birthDateTime: birthDateTime,
			};

			// Save to sessionStorage as expected by PersonalReportDisplay
			sessionStorage.setItem(
				"personalReportUserData",
				JSON.stringify(personalData)
			);

			// Close modal
			setShowModal(false);

			// Navigate to PersonalReport page
			router.push(`/${locale}/personalReport`);
		} else if (selectedMode === "fengshui") {
			// Handle feng shui modal steps
			if (modalStep === 1) {
				// Step 1: Room type selection
				if (!selectedRoomType) {
					alert("請選擇房間類型");
					return;
				}
				setModalStep(2);
			} else if (modalStep === 2) {
				// Step 2: Birthday selection
				if (!gender || !year || !month || !day || !hour) {
					alert("請填寫所有資料");
					return;
				}
				setModalStep(3);
			} else if (modalStep === 3) {
				// Step 3: House direction selection
				if (!selectedHouseDirection) {
					alert("請選擇房屋朝向");
					return;
				}
				setModalStep(4);
			} else if (modalStep === 4) {
				// Step 4: Room direction selection
				if (!selectedRoomDirection) {
					alert("請選擇房間朝向");
					return;
				}

				// Format the data as expected by FreeHousingDisplay
				const birthDateTime = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hour.toString().padStart(2, "0")}:00:00`;

				const fengShuiData = {
					gender: gender,
					birthDateTime: birthDateTime,
					roomType: selectedRoomType,
					direction: selectedRoomDirection,
					houseDirection: selectedHouseDirection,
				};

				// Save to sessionStorage as expected by FreeHousingDisplay
				sessionStorage.setItem(
					"freeReportUserData",
					JSON.stringify(fengShuiData)
				);

				// Close modal
				setShowModal(false);

				// Navigate to FreeHousing page
				router.push(`/${locale}/freeHousing`);
			}
		}
	};

	const handleModalBack = () => {
		if (selectedMode === "fengshui" && modalStep > 1) {
			setModalStep(modalStep - 1);
		} else {
			setShowModal(false);
		}
	};

	const handleModalClose = () => {
		setShowModal(false);
	};

	return (
		<div
			className="relative flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 overflow-hidden text-center sm:px-6 lg:px-8 sm:py-12"
			style={{
				backgroundImage: "url('/images/report/freebg.png')",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "right center",
				backgroundSize: "contain",
			}}
		>
			{/* Mobile background overlay with blur */}
			<div
				className="absolute inset-0 bg-white/20 backdrop-blur-sm md:hidden"
				style={{ zIndex: 1 }}
			></div>

			{/* Main content */}
			<div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl min-h-screen mx-auto">
				{/* Title */}
				<div className="mb-8 text-center sm:mb-12 lg:mb-16">
					<h1
						className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-4xl"
						style={{
							fontFamily: '"Noto Serif TC", serif',
							fontWeight: 900,
							color: "#374A37",
						}}
					>
						請選擇測算模式
					</h1>
				</div>

				{/* Mode selection circles */}
				<div className="flex flex-col items-center justify-center gap-8 mb-8 sm:mb-12 lg:mb-16 sm:gap-12 md:gap-16 lg:gap-28 sm:flex-row">
					{/* 命理測算 (Numerology) */}
					<div className="flex flex-col items-center">
						<button
							onClick={() => handleModeSelect("personal")}
							className="flex items-center justify-center w-32 h-32 transition-all duration-300 border-4 rounded-full hover:scale-105 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52"
							style={{
								backgroundColor:
									selectedMode === "personal"
										? "#A3B116"
										: "#BCBCBC",
								borderColor:
									selectedMode === "personal"
										? "#A3B116"
										: "#BCBCBC",
							}}
						>
							<div className="text-center">
								<div className="flex items-center justify-center w-12 h-12 mx-auto sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20">
									<Image
										src="/images/report/personal.png"
										alt="Personal"
										width={102}
										height={102}
										className="object-contain"
									/>
								</div>
								<span className="mt-1 text-sm font-extrabold text-white sm:text-lg md:text-xl lg:text-2xl sm:mt-2">
									命理測算
								</span>
							</div>
						</button>
					</div>

					{/* 風水測算 (Feng Shui) */}
					<div className="flex flex-col items-center">
						<button
							onClick={() => handleModeSelect("fengshui")}
							className="flex items-center justify-center w-32 h-32 transition-all duration-300 border-4 rounded-full hover:scale-105 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52"
							style={{
								backgroundColor:
									selectedMode === "fengshui"
										? "#A3B116"
										: "#BCBCBC",
								borderColor:
									selectedMode === "fengshui"
										? "#A3B116"
										: "#BCBCBC",
							}}
						>
							<div className="text-center">
								<div className="flex items-center justify-center w-12 h-12 mx-auto sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20">
									<Image
										src="/images/report/home.png"
										alt="Home"
										width={102}
										height={102}
										className="object-contain"
									/>
								</div>
								<span className="mt-1 text-sm font-extrabold text-white sm:text-lg md:text-xl lg:text-2xl sm:mt-2">
									風水測算
								</span>
							</div>
						</button>
					</div>
				</div>

				{/* Start button */}
				<div className="w-full max-w-md text-center">
					<button
						onClick={handleStartCalculation}
						className="w-full px-8 py-3 text-lg font-bold text-white transition-all duration-200 shadow-lg sm:px-12 md:px-16 lg:px-20 sm:py-4 sm:text-xl md:text-2xl rounded-xl hover:scale-105 hover:shadow-xl active:scale-95"
						style={{ backgroundColor: "#A3B116" }}
					>
						開始免費測算
					</button>
				</div>
			</div>

			{/* Modal for Personal Information */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/20">
					<div className="relative w-full max-w-2xl mx-auto bg-[#EFEFEF] shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
						{/* Progress Bar */}
						<div className="p-4 border-b sm:p-6">
							<div className="w-16 h-1 mx-auto mb-4 bg-gray-300 rounded sm:w-20"></div>
							{selectedMode === "fengshui" && (
								<div className="flex justify-center mb-4">
									<div className="flex space-x-1 sm:space-x-2">
										{[1, 2, 3, 4].map((step) => (
											<div
												key={step}
												className={`h-2 rounded-full transition-all duration-300 ${
													step <= modalStep
														? "bg-[#A3B116]"
														: "bg-gray-300"
												}`}
												style={{
													width:
														step <= modalStep
															? "60px"
															: "20px",
												}}
											></div>
										))}
									</div>
								</div>
							)}
							<h2
								className="text-xl font-bold text-center sm:text-xl md:text-2xl lg:text-3xl"
								style={{
									fontFamily: '"Noto Serif TC", serif',
									color: "#374A37",
								}}
							>
								{step === 1 ||
								(selectedMode === "fengshui" && step === 1)
									? "請輸入你的生日"
									: step === 2
										? "請選擇你的房間類型"
										: step === 3
											? "請輸入你的生日"
											: step === 4
												? "請選擇你的房屋朝向"
												: "請選擇你的房間方位"}
							</h2>
						</div>

						{/* Modal Content */}
						<div className="p-4 space-y-4 sm:p-6 sm:space-y-6">
							{/* Personal Mode or Feng Shui Step 2 (Birthday) */}
							{(selectedMode === "personal" ||
								(selectedMode === "fengshui" &&
									modalStep === 2)) && (
								<>
									{/* Gender Selection */}
									<div className="space-y-3">
										<label
											className="block text-lg font-semibold sm:text-xl md:text-xl"
											style={{
												fontFamily:
													'"Noto Serif TC", serif',
												color: "#374A37",
											}}
										>
											性別
										</label>
										<div className="flex justify-center space-x-6 sm:space-x-8">
											<label className="flex items-center cursor-pointer">
												<input
													type="radio"
													name="gender"
													value="male"
													checked={gender === "male"}
													onChange={(e) =>
														setGender(
															e.target.value
														)
													}
													className="sr-only"
												/>
												<div
													className="w-5 h-5 mr-2 border-2 rounded-full sm:w-6 sm:h-6"
													style={{
														backgroundColor:
															gender === "male"
																? "#A3B116"
																: "transparent",
														borderColor:
															gender === "male"
																? "#A3B116"
																: "#D9D9D9",
													}}
												></div>
												<span
													className="text-lg sm:text-xl md:text-xl"
													style={{
														fontFamily:
															'"Noto Serif TC", serif',
													}}
												>
													男
												</span>
											</label>
											<label className="flex items-center cursor-pointer">
												<input
													type="radio"
													name="gender"
													value="female"
													checked={
														gender === "female"
													}
													onChange={(e) =>
														setGender(
															e.target.value
														)
													}
													className="sr-only"
												/>
												<div
													className="w-5 h-5 mr-2 border-2 rounded-full sm:w-6 sm:h-6"
													style={{
														backgroundColor:
															gender === "female"
																? "#A3B116"
																: "transparent",
														borderColor:
															gender === "female"
																? "#A3B116"
																: "#D9D9D9",
													}}
												></div>
												<span
													className="text-lg sm:text-xl md:text-xl"
													style={{
														fontFamily:
															'"Noto Serif TC", serif',
													}}
												>
													女
												</span>
											</label>
										</div>
									</div>

									{/* Birth Date Time */}
									<div className="space-y-3">
										<label
											className="block text-lg font-semibold sm:text-xl md:text-xl"
											style={{
												fontFamily:
													'"Noto Serif TC", serif',
												color: "#374A37",
											}}
										>
											出生日期時間
										</label>
										<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
											<select
												className="px-2 py-2 text-sm bg-gray-100 border-0 rounded-full sm:px-2 sm:py-2 sm:text-md md:text-md focus:outline-none"
												style={{
													fontFamily:
														'"Noto Serif TC", serif',
													boxShadow:
														"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
												}}
												value={year}
												onChange={(e) =>
													setYear(e.target.value)
												}
											>
												<option value="">年</option>
												{years.map((y) => (
													<option key={y} value={y}>
														{y}
													</option>
												))}
											</select>
											<select
												className="px-2 py-2 text-sm bg-gray-100 border-0 rounded-full sm:px-2 sm:py-2 sm:text-md md:text-md focus:outline-none"
												style={{
													fontFamily:
														'"Noto Serif TC", serif',
													boxShadow:
														"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
												}}
												value={month}
												onChange={(e) =>
													setMonth(e.target.value)
												}
											>
												<option value="">月</option>
												{months.map((m) => (
													<option key={m} value={m}>
														{m}
													</option>
												))}
											</select>
											<select
												className="px-2 py-2 text-sm bg-gray-100 border-0 rounded-full sm:px-2 sm:py-2 sm:text-md md:text-md focus:outline-none"
												style={{
													fontFamily:
														'"Noto Serif TC", serif',
													boxShadow:
														"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
												}}
												value={day}
												onChange={(e) =>
													setDay(e.target.value)
												}
											>
												<option value="">日</option>
												{days.map((d) => (
													<option key={d} value={d}>
														{d}
													</option>
												))}
											</select>
											<select
												className="px-2 py-2 text-sm bg-gray-100 border-0 rounded-full sm:px-2 sm:py-2 sm:text-md md:text-md focus:outline-none"
												style={{
													fontFamily:
														'"Noto Serif TC", serif',
													boxShadow:
														"inset 0 1px 4px rgba(0, 0, 0, 0.25)",
												}}
												value={hour}
												onChange={(e) =>
													setHour(e.target.value)
												}
											>
												<option value="">
													時（24時制）
												</option>
												{hours.map((h) => (
													<option key={h} value={h}>
														{h}
													</option>
												))}
											</select>
										</div>
									</div>
								</>
							)}

							{/* Feng Shui Step 1: Room Type Selection */}
							{selectedMode === "fengshui" && modalStep === 1 && (
								<div className="space-y-4 sm:space-y-6">
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
										{roomTypes.map((room) => (
											<div
												key={room.key}
												className="flex flex-col items-center"
											>
												<button
													onClick={() =>
														setSelectedRoomType(
															room.key
														)
													}
													className={`w-20 h-20 sm:w-28 sm:h-28 md:w-30 md:h-30 lg:w-30 lg:h-30 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-105 ${
														selectedRoomType ===
														room.key
															? "border-[#A3B116] bg-[#A3B116]/10"
															: "border-gray-300 hover:border-[#A3B116]/50"
													}`}
												>
													<Image
														src={`/images/rooms/${room.image}`}
														alt={room.name}
														width={70}
														height={70}
														className="object-contain w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
													/>
												</button>
												<span
													className="mt-1 text-xs text-center sm:mt-2 sm:text-sm md:text-base lg:text-lg"
													style={{
														fontFamily:
															'"Noto Serif TC", serif',
													}}
												>
													{room.name}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Feng Shui Step 3: House Direction Selection */}
							{selectedMode === "fengshui" && modalStep === 3 && (
								<div className="space-y-2 sm:space-y-2">
									<div className="flex items-center justify-center mb-2 sm:mb-2">
										<div className="p-2 sm:p-2">
											<Image
												src="/images/report/floor-plan.png"
												alt="Floor Plan"
												width={200}
												height={200}
												className="object-contain w-48 h-48 sm:w-64 sm:h-60 md:w-60 md:h-80"
											/>
										</div>
									</div>
									<div className="grid max-w-md grid-cols-4 gap-2 mx-auto sm:gap-3 md:gap-4">
										{directions.map((direction) => (
											<div
												key={direction.key}
												className="flex flex-col items-center"
											>
												<button
													onClick={() =>
														setSelectedHouseDirection(
															direction.key
														)
													}
													className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-20 lg:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-105 ${
														selectedHouseDirection ===
														direction.key
															? "border-[#A3B116] bg-[#A3B116]"
															: "border-gray-300 hover:border-[#A3B116]/50 bg-white"
													}`}
												>
													<Image
														src={`/images/directions/${direction.image}`}
														alt={direction.name}
														width={50}
														height={50}
														className={`object-contain w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-14 lg:h-14 transition-all duration-300 ${
															selectedHouseDirection ===
															direction.key
																? ""
																: "brightness-0"
														}`}
													/>
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Feng Shui Step 4: Room Direction Selection */}
							{selectedMode === "fengshui" && modalStep === 4 && (
								<div className="space-y-4 sm:space-y-6">
									<div className="flex items-center justify-center mb-4 sm:mb-6">
										<div className="p-2 sm:p-4">
											<Image
												src="/images/report/room-plan.png"
												alt="Room Plan"
												width={300}
												height={300}
												className="object-contain w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80"
											/>
										</div>
									</div>

									<div className="grid max-w-md grid-cols-4 gap-2 mx-auto sm:gap-3 md:gap-4">
										{directions.map((direction) => (
											<div
												key={direction.key}
												className="flex flex-col items-center"
											>
												<button
													onClick={() =>
														setSelectedRoomDirection(
															direction.key
														)
													}
													className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-20 lg:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-105 ${
														selectedRoomDirection ===
														direction.key
															? "border-[#A3B116] bg-[#A3B116]"
															: "border-gray-300 hover:border-[#A3B116]/50 bg-white"
													}`}
												>
													<Image
														src={`/images/directions/${direction.image}`}
														alt={direction.name}
														width={60}
														height={60}
														className={`object-contain w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 lg:w-14 lg:h-14 transition-all duration-300 ${
															selectedRoomDirection ===
															direction.key
																? ""
																: "brightness-0"
														}`}
													/>
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Modal Footer */}
						<div className="flex flex-col justify-between gap-3 p-4 pt-0 sm:flex-row sm:gap-0 sm:p-6">
							<button
								onClick={handleModalBack}
								className="order-2 px-6 py-3 font-bold text-gray-700 transition-colors bg-gray-300 rounded-full text-md sm:px-8 sm:text-xl md:text-xl hover:bg-gray-400 sm:order-1"
								style={{ fontFamily: '"Noto Serif TC", serif' }}
							>
								{selectedMode === "fengshui" && modalStep > 1
									? "上一步"
									: "退出"}
							</button>
							<button
								onClick={handleModalSubmit}
								className="order-1 px-6 py-3 text-lg font-bold text-white transition-colors rounded-full sm:px-8 sm:text-xl md:text-xl sm:order-2"
								style={{
									backgroundColor: "#A3B116",
									fontFamily: '"Noto Serif TC", serif',
								}}
							>
								下一步
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Choose;
