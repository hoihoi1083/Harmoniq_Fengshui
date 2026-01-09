"use client";

import { useState } from "react";

const compassDirections = [
	{
		direction: "north",
		trigram: "坎宮",
		element: "水",
		star: "七赤破軍星",
		angle: 0,
		chinese: "北",
	},
	{
		direction: "northEast",
		trigram: "艮宮",
		element: "土",
		star: "五黃廉貞星",
		angle: 45,
		chinese: "東北",
	},
	{
		direction: "east",
		trigram: "震宮",
		element: "木",
		star: "九紫右弼星",
		angle: 90,
		chinese: "東",
	},
	{
		direction: "southEast",
		trigram: "巽宮",
		element: "木",
		star: "一白貪狼星",
		angle: 135,
		chinese: "東南",
	},
	{
		direction: "south",
		trigram: "離宮",
		element: "火",
		star: "二黑巨門星",
		angle: 180,
		chinese: "南",
	},
	{
		direction: "southWest",
		trigram: "坤宮",
		element: "土",
		star: "四綠文曲星",
		angle: 225,
		chinese: "西南",
	},
	{
		direction: "west",
		trigram: "兌宮",
		element: "金",
		star: "三碧祿存星",
		angle: 270,
		chinese: "西",
	},
	{
		direction: "northWest",
		trigram: "乾宮",
		element: "金",
		star: "六白武曲星",
		angle: 315,
		chinese: "西北",
	},
];

export default function BazhaiCompass({
	roomAnalyses,
	mingGuaInfo,
	compassRotation = 0,
}) {
	const [selectedDirection, setSelectedDirection] = useState(null);
	const [showFlyingStars, setShowFlyingStars] = useState(true);

	const getRoomCountForDirection = (direction) => {
		return roomAnalyses.filter((room) => room.direction === direction)
			.length;
	};

	const getDirectionInfo = (direction) => {
		return compassDirections.find((d) => d.direction === direction);
	};

	const getDirectionFortune = (direction) => {
		if (mingGuaInfo.group === "東四命") {
			return ["east", "south", "north", "southEast"].includes(direction)
				? "吉"
				: "凶";
		} else {
			return ["west", "northWest", "southWest", "northEast"].includes(
				direction
			)
				? "吉"
				: "凶";
		}
	};

	const getFortuneColor = (direction) => {
		const fortune = getDirectionFortune(direction);
		return fortune === "吉" ? "#10B981" : "#EF4444"; // green : red
	};

	const getRoomTypesForDirection = (direction) => {
		return (
			roomAnalyses
				.filter((room) => room.direction === direction)
				.map((room) => room.roomType)
				.join("、") || "無房間"
		);
	};

	return (
		<div className="bg-white rounded-xl shadow-lg p-8">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-amber-800">
					八宅風水羅盤 - {mingGuaInfo.name}
				</h2>
				<div className="flex items-center space-x-4">
					<div className="flex items-center">
						<span className="text-sm text-gray-600 mr-2">
							顯示飛星：
						</span>
						<button
							onClick={() => setShowFlyingStars(!showFlyingStars)}
							className={`px-3 py-1 rounded text-sm ${
								showFlyingStars
									? "bg-purple-500 text-white"
									: "bg-gray-200 text-gray-600"
							}`}
						>
							{showFlyingStars ? "開啟" : "關閉"}
						</button>
					</div>
					<div
						className={`px-3 py-1 rounded text-sm font-medium text-white ${
							mingGuaInfo.group === "東四命"
								? "bg-green-500"
								: "bg-blue-500"
						}`}
					>
						{mingGuaInfo.group}
					</div>
				</div>
			</div>

			{/* 羅盤 SVG */}
			<div className="flex justify-center mb-8">
				<div className="relative w-96 h-96">
					<svg viewBox="0 0 400 400" className="w-full h-full">
						{/* 外圓 */}
						<circle
							cx="200"
							cy="200"
							r="190"
							fill="none"
							stroke="#8B4513"
							strokeWidth="4"
						/>

						{/* 中心圓 */}
						<circle
							cx="200"
							cy="200"
							r="50"
							fill="#FFD700"
							stroke="#8B4513"
							strokeWidth="2"
						/>
						<text
							x="200"
							y="195"
							textAnchor="middle"
							className="text-xs font-bold"
						>
							太極
						</text>
						<text
							x="200"
							y="210"
							textAnchor="middle"
							className="text-xs font-bold"
						>
							{mingGuaInfo.trigram}
						</text>

						{/* 方位扇形 */}
						{compassDirections.map((dir, index) => {
							const roomCount = getRoomCountForDirection(
								dir.direction
							);
							const fortune = getDirectionFortune(dir.direction);
							const fortuneColor = getFortuneColor(dir.direction);

							const startAngle =
								dir.angle - 22.5 + compassRotation;
							const endAngle = dir.angle + 22.5 + compassRotation;

							const startRad = (startAngle * Math.PI) / 180;
							const endRad = (endAngle * Math.PI) / 180;

							const x1 = 200 + 50 * Math.cos(startRad);
							const y1 = 200 + 50 * Math.sin(startRad);
							const x2 = 200 + 190 * Math.cos(startRad);
							const y2 = 200 + 190 * Math.sin(startRad);
							const x3 = 200 + 190 * Math.cos(endRad);
							const y3 = 200 + 190 * Math.sin(endRad);
							const x4 = 200 + 50 * Math.cos(endRad);
							const y4 = 200 + 50 * Math.sin(endRad);

							const midAngle = dir.angle + compassRotation;
							const midRad = (midAngle * Math.PI) / 180;
							const textX = 200 + 120 * Math.cos(midRad);
							const textY = 200 + 120 * Math.sin(midRad);

							return (
								<g key={dir.direction}>
									{/* 扇形區域 */}
									<path
										d={`M ${x1} ${y1} L ${x2} ${y2} A 190 190 0 0 1 ${x3} ${y3} L ${x4} ${y4} A 50 50 0 0 0 ${x1} ${y1}`}
										fill={
											selectedDirection === dir.direction
												? "#FFA500"
												: fortune === "吉"
													? "#F0FDF4"
													: "#FEF2F2"
										}
										stroke="#8B4513"
										strokeWidth="1"
										className="cursor-pointer hover:fill-orange-200 transition-colors"
										onClick={() =>
											setSelectedDirection(
												selectedDirection ===
													dir.direction
													? null
													: dir.direction
											)
										}
									/>

									{/* 宮位名稱 */}
									<text
										x={textX}
										y={textY - 15}
										textAnchor="middle"
										className="text-xs font-bold fill-amber-800"
									>
										{dir.trigram}
									</text>

									{/* 方位 */}
									<text
										x={textX}
										y={textY - 2}
										textAnchor="middle"
										className="text-xs fill-amber-700"
									>
										{dir.chinese}
									</text>

									{/* 五行 */}
									<text
										x={textX}
										y={textY + 12}
										textAnchor="middle"
										className="text-xs fill-amber-700"
									>
										{dir.element}
									</text>

									{/* 流年飛星 */}
									{showFlyingStars && (
										<text
											x={textX}
											y={textY + 25}
											textAnchor="middle"
											className="text-xs fill-purple-600"
										>
											{dir.star.slice(0, 2)}
										</text>
									)}

									{/* 吉凶標示 */}
									<circle
										cx={textX + 30}
										cy={textY - 15}
										r="8"
										fill={fortuneColor}
									/>
									<text
										x={textX + 30}
										y={textY - 11}
										textAnchor="middle"
										className="text-xs fill-white font-bold"
									>
										{fortune}
									</text>

									{/* 房間數量 */}
									{roomCount > 0 && (
										<>
											<circle
												cx={textX - 30}
												cy={textY - 15}
												r="8"
												fill="#FF6B6B"
											/>
											<text
												x={textX - 30}
												y={textY - 11}
												textAnchor="middle"
												className="text-xs fill-white font-bold"
											>
												{roomCount}
											</text>
										</>
									)}
								</g>
							);
						})}

						{/* 北方指示器 */}
						<g transform={`rotate(${-compassRotation}, 200, 200)`}>
							<path
								d="M 200 20 L 210 40 L 200 35 L 190 40 Z"
								fill="#FF0000"
							/>
							<text
								x="200"
								y="15"
								textAnchor="middle"
								className="text-sm font-bold fill-red-600"
							>
								N
							</text>
						</g>
					</svg>
				</div>
			</div>

			{/* 選中方位的詳細信息 */}
			{selectedDirection && (
				<div className="mt-6 p-6 bg-amber-50 rounded-lg border-2 border-amber-200">
					<div className="flex justify-between items-start mb-4">
						<h3 className="text-xl font-bold text-amber-800">
							{getDirectionInfo(selectedDirection)?.trigram}{" "}
							詳細信息
						</h3>
						<div
							className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
								getDirectionFortune(selectedDirection) === "吉"
									? "bg-green-500"
									: "bg-red-500"
							}`}
						>
							{mingGuaInfo.name}{" "}
							{getDirectionFortune(selectedDirection) === "吉"
								? "吉方"
								: "凶方"}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="space-y-2">
							<h4 className="font-medium text-gray-800">
								基本信息
							</h4>
							<p>
								<strong>方位：</strong>
								{getDirectionInfo(selectedDirection)?.chinese}
							</p>
							<p>
								<strong>五行：</strong>
								{getDirectionInfo(selectedDirection)?.element}
							</p>
							<p>
								<strong>八宅吉凶：</strong>
								<span
									className={`ml-1 font-bold ${
										getDirectionFortune(
											selectedDirection
										) === "吉"
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{getDirectionFortune(selectedDirection) ===
									"吉"
										? "大吉方"
										: "大凶方"}
								</span>
							</p>
						</div>

						<div className="space-y-2">
							<h4 className="font-medium text-gray-800">
							流年飛星
							</h4>
							<p>
								<strong>飛星：</strong>
								{getDirectionInfo(selectedDirection)?.star}
							</p>
							<p>
								<strong>房間數量：</strong>
								{getRoomCountForDirection(selectedDirection)} 間
							</p>
							<p>
								<strong>房間類型：</strong>
								{getRoomTypesForDirection(selectedDirection)}
							</p>
						</div>

						<div className="space-y-2">
							<h4 className="font-medium text-gray-800">
								風水建議
							</h4>
							{getDirectionFortune(selectedDirection) === "吉" ? (
								<div className="text-green-700 text-sm">
									<p>• 適合作為主臥室使用</p>
									<p>• 可設置辦公區域</p>
									<p>• 有利於健康和財運</p>
								</div>
							) : (
								<div className="text-red-700 text-sm">
									<p>• 避免長時間停留</p>
									<p>• 不宜作為主臥室</p>
									<p>• 需要風水化解</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* 圖例說明 */}
			<div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
				<div className="flex items-center">
					<div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
					<span>命卦吉方</span>
				</div>
				<div className="flex items-center">
					<div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
					<span>命卦凶方</span>
				</div>
				<div className="flex items-center">
					<div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
					<span>房間數量</span>
				</div>
				<div className="flex items-center">
					<div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
					<span>流年飛星</span>
				</div>
			</div>

			<div className="mt-4 text-center text-xs text-gray-500">
				<p>
					點擊羅盤扇形區域查看詳細風水信息 |
					羅盤已根據實際指北針方向調整
				</p>
			</div>
		</div>
	);
}
