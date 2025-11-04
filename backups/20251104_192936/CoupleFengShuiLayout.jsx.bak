"use client";

import { useState, useEffect } from "react";
import { Home, Heart, Compass, Palette, Lightbulb, MapPin } from "lucide-react";
import { useCoupleAnalysis } from "@/contexts/CoupleAnalysisContext";

const CoupleFengShuiLayout = ({
	user1,
	user2,
	calculateWuxingAnalysis,
	analyzeWuxingStrength,
	determineUsefulGods,
}) => {
	const { analysisData, loading: aiLoading, error } = useCoupleAnalysis();
	const [layoutData, setLayoutData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (analysisData) {
			// Use available AI data to generate feng shui layout recommendations
			setLayoutData({
				// AI-based structure
				bedroom: {
					layout: generateBedroomLayoutFromAI(analysisData),
					colors: generateBedroomColorsFromAI(analysisData),
					furniture: generateBedroomFurnitureFromAI(analysisData),
					decorations: generateBedroomDecorationsFromAI(analysisData),
				},
				livingRoom: {
					layout: generateLivingRoomLayoutFromAI(analysisData),
					colors: generateLivingRoomColorsFromAI(analysisData),
					furniture: generateLivingRoomFurnitureFromAI(analysisData),
					decorations:
						generateLivingRoomDecorationsFromAI(analysisData),
				},
				kitchen: {
					layout: generateKitchenLayoutFromAI(analysisData),
					colors: generateKitchenColorsFromAI(analysisData),
					appliances: generateKitchenAppliancesFromAI(analysisData),
				},
				general: {
					directions: generateDirectionsFromAI(analysisData),
					elements: generateElementsFromAI(analysisData),
					plants: generatePlantsFromAI(analysisData),
					crystals: generateCrystalsFromAI(analysisData),
				},
				// JSX-expected structure
				bedroomLayout: {
					bedPosition: `根據你們的配對分析(評分${analysisData.compatibility?.score || 75}分)，建議床位擺放在房間的東南角`,
					bedHeadDirection: "床頭朝向東方或南方，有利於感情和諧",
					colors: ["粉紅色", "淺藍色", "米色", "淺綠色"],
					enhancements: [
						"在床頭放置一對水晶",
						"使用柔和的燈光營造浪漫氛圍",
						"在床邊擺放鮮花增加生氣",
						"選擇成雙的裝飾品象徵和諧",
					],
					decorations: [
						"成對的檯燈或蠟燭",
						"情侶照片或藝術品",
						"柔軟的抱枕和毯子",
						"香薰蠟燭營造浪漫氣氛",
					],
					taboos: [
						"避免床頭對著鏡子",
						"避免床下堆放雜物",
						"避免在床頭擺放電子設備",
						"避免使用過於鮮豔的顏色",
					],
				},
				livingRoomLayout: {
					sofaPosition: "沙發建議面向窗戶擺放，背靠實牆",
					tvPosition: "電視擺放在沙發對面，避免反光",
					lighting: "使用暖色調燈光，營造溫馨氛圍",
					decorations: [
						"在茶几上擺放鮮花",
						"使用暖色調的抱枕",
						"掛上寓意美好的藝術品",
						"擺放象徵愛情的裝飾品",
					],
					plants: [
						"綠蘿 - 淨化空氣，增進感情",
						"發財樹 - 招財進寶，事業順利",
						"玫瑰花 - 象徵愛情，增進浪漫",
						"薰衣草 - 舒緩壓力，促進和諧",
					],
				},
				colors: {
					primary: ["粉紅色", "淺藍色", "米色"],
					secondary: ["淺綠色", "淡紫色", "珍珠白"],
					accent: ["金色", "銀色", "玫瑰金"],
					avoid: ["深黑色", "暗紅色", "灰色"],
				},
				directions: {
					favorable: analysisData.strengths
						?.slice(0, 3)
						.map((strength) => `${strength}方向有利`) || [
						"東南方向 - 有利感情發展",
						"西南方向 - 增進夫妻和睦",
						"正南方向 - 提升桃花運",
					],
					avoid: analysisData.challenges
						?.slice(0, 2)
						.map((challenge) => `避免${challenge}相關方向`) || [
						"正北方向 - 避免冷淡",
						"西北方向 - 避免權力鬥爭",
					],
				},
				decorations: {
					romantic: [
						"成對的燭台或香薰",
						"心形或圓形的裝飾品",
						"柔軟質感的布藝用品",
						"象徵永恆的裝飾元素",
					],
					elements: [
						"水晶球或水晶擺件",
						"木質相框和裝飾品",
						"金屬質感的花瓶",
						"陶瓷或石質雕塑",
					],
				},
				plants: {
					bedroom: [
						"薰衣草 - 促進睡眠和放鬆",
						"茉莉花 - 增進愛情運勢",
						"綠蘿 - 淨化空氣，帶來生機",
					],
					livingRoom: [
						"富貴竹 - 招財進寶",
						"發財樹 - 事業興旺",
						"鳳尾竹 - 家庭和睦",
						"君子蘭 - 品格高雅",
					],
				},
			});
			setLoading(false);
		} else if (!aiLoading && !analysisData) {
			// Fallback to basic analysis if AI data is not available
			if (user1?.birthDateTime && user2?.birthDateTime) {
				generateLayoutFallback();
			}
		}
	}, [analysisData, aiLoading, user1, user2]);

	// Helper functions to generate feng shui recommendations from AI data
	const generateBedroomLayoutFromAI = (aiData) => {
		const score = aiData.compatibility?.score || 75;
		return `根據${score}分的配對分析，建議臥室床頭朝向有利方位，${aiData.strengths?.[0] || "營造和諧氛圍"}，避免${aiData.challenges?.[0] || "尖銳物品"}`;
	};

	const generateBedroomColorsFromAI = (aiData) => {
		const baseColors = ["粉紅色", "米色", "淺藍色"];
		return baseColors.concat(
			aiData.strengths?.includes("溫和") ? ["淺綠色"] : ["暖黃色"]
		);
	};

	const generateBedroomFurnitureFromAI = (aiData) => {
		return `選擇圓潤造型的家具，避免尖角，${aiData.advice?.[0] || "營造溫馨舒適的環境"}`;
	};

	const generateBedroomDecorationsFromAI = (aiData) => {
		return [
			"成對的裝飾品象徵愛情美滿",
			`根據分析建議：${aiData.strengths?.[0] || "選擇溫馨裝飾"}`,
			"避免單一或破損的物品",
		];
	};

	const generateLivingRoomLayoutFromAI = (aiData) => {
		return `客廳布局以促進${aiData.strengths?.[0] || "溝通交流"}為主，避免${aiData.challenges?.[0] || "對立座椅配置"}`;
	};

	const generateLivingRoomColorsFromAI = (aiData) => {
		return ["溫暖的米色", "柔和的綠色", "淺橙色"];
	};

	const generateLivingRoomFurnitureFromAI = (aiData) => {
		return `選擇促進${aiData.strengths?.[0] || "交流互動"}的家具配置，避免背對背的座椅安排`;
	};

	const generateLivingRoomDecorationsFromAI = (aiData) => {
		return [
			"擺放成雙的裝飾品",
			`突出${aiData.strengths?.[0] || "和諧美好"}的主題`,
			"使用溫馨的照明",
		];
	};

	const generateKitchenLayoutFromAI = (aiData) => {
		return `廚房設計注重${aiData.compatibility?.level || "和諧實用"}，避免火水相沖的配置`;
	};

	const generateKitchenColorsFromAI = (aiData) => {
		return ["溫暖的黃色", "清新的綠色", "純淨的白色"];
	};

	const generateKitchenAppliancesFromAI = (aiData) => {
		return `電器擺放避免沖突，營造${aiData.strengths?.[0] || "和諧烹飪"}環境`;
	};

	const generateDirectionsFromAI = (aiData) => {
		const score = aiData.compatibility?.score || 75;
		return `根據${score}分配對分析，建議重要家具朝向東南或西南方位，有利於${aiData.strengths?.[0] || "感情發展"}`;
	};

	const generateElementsFromAI = (aiData) => {
		return [
			"土元素 - 增加穩定性",
			"水元素 - 促進流動和諧",
			"木元素 - 帶來生機活力",
		];
	};

	const generatePlantsFromAI = (aiData) => {
		return [
			"玫瑰 - 象徵愛情",
			"百合 - 代表純潔",
			`綠蘿 - 促進${aiData.strengths?.[0] || "生機勃勃"}`,
		];
	};

	const generateCrystalsFromAI = (aiData) => {
		return [
			"粉水晶 - 增進愛情運",
			"紫水晶 - 提升理解力",
			"白水晶 - 淨化能量",
		];
	};

	const generateOverallColorsFromAI = (aiData) => {
		const allColors = [
			...generateBedroomColorsFromAI(aiData),
			...generateLivingRoomColorsFromAI(aiData),
			...generateKitchenColorsFromAI(aiData),
		];
		return [...new Set(allColors)]; // Remove duplicates
	};

	const generateLayoutFallback = () => {
		// Combine colors from all rooms for a unified color scheme
		const allColors = [
			...(fengShuiData.bedroom?.colors || []),
			...(fengShuiData.livingRoom?.colors || []),
			...(fengShuiData.kitchen?.colors || []),
		];
		// Remove duplicates and return unique colors
		return [...new Set(allColors)];
	};

	const generateFengShuiLayoutFallback = () => {
		try {
			const user1Analysis = calculateWuxingAnalysis(user1);
			const user2Analysis = calculateWuxingAnalysis(user2);

			if (!user1Analysis || !user2Analysis) {
				setLoading(false);
				return;
			}

			const user1UsefulGods = determineUsefulGods(user1Analysis);
			const user2UsefulGods = determineUsefulGods(user2Analysis);

			// Generate combined feng shui recommendations
			const bedroomLayout = generateBedroomLayout(
				user1Analysis.dominantElement,
				user2Analysis.dominantElement,
				user1UsefulGods,
				user2UsefulGods
			);

			const livingRoomLayout = generateLivingRoomLayout(
				user1Analysis.dominantElement,
				user2Analysis.dominantElement,
				user1UsefulGods,
				user2UsefulGods
			);

			const colors = generateColorScheme(
				user1UsefulGods,
				user2UsefulGods
			);

			const directions = generateDirections(
				user1Analysis.dominantElement,
				user2Analysis.dominantElement
			);

			const decorations = generateDecorations(
				user1UsefulGods,
				user2UsefulGods
			);

			const plants = generatePlants(user1UsefulGods, user2UsefulGods);

			const lighting = generateLighting(
				user1Analysis.dominantElement,
				user2Analysis.dominantElement
			);

			setLayoutData({
				bedroomLayout,
				livingRoomLayout,
				colors,
				directions,
				decorations,
				plants,
				lighting,
			});

			setLoading(false);
		} catch (error) {
			console.error("Error generating feng shui layout:", error);
			setLoading(false);
		}
	};

	const generateBedroomLayout = (
		element1,
		element2,
		usefulGods1,
		usefulGods2
	) => {
		const combinedUsefulGods = [
			...new Set([...usefulGods1, ...usefulGods2]),
		];

		return {
			bedPosition: generateBedPosition(element1, element2),
			bedHeadDirection: generateBedHeadDirection(element1, element2),
			colors: getElementColors(combinedUsefulGods).slice(0, 3),
			decorations: [
				"成對擺放的物品增進感情",
				"避免鏡子直對床鋪",
				"保持房間整潔和空氣流通",
			],
			taboos: ["床頭不要靠窗", "避免梁壓床", "不要在床下堆積雜物"],
			enhancements: generateBedroomEnhancements(combinedUsefulGods),
		};
	};

	const generateLivingRoomLayout = (
		element1,
		element2,
		usefulGods1,
		usefulGods2
	) => {
		const combinedUsefulGods = [
			...new Set([...usefulGods1, ...usefulGods2]),
		];

		return {
			sofaPosition: "沙發背靠實牆，面向房門，營造安全感",
			tvPosition: "電視不要正對沙發，稍微偏移角度",
			colors: getElementColors(combinedUsefulGods).slice(0, 4),
			decorations: [
				"客廳放置雙數的裝飾品",
				"使用圓形或橢圓形茶几增進和諧",
				"保持客廳明亮和整潔",
			],
			plants: generateLivingRoomPlants(combinedUsefulGods),
			lighting: "使用溫暖的燈光，避免過於刺眼",
		};
	};

	const generateBedPosition = (element1, element2) => {
		const positionMap = {
			金: "床頭朝西或西北，有利於感情穩定",
			木: "床頭朝東或東南，促進感情成長",
			水: "床頭朝北，增進親密關係",
			火: "床頭朝南，增加感情熱度",
			土: "床頭朝西南或東北，穩固關係",
		};

		// 優先考慮主導元素較強的一方
		return positionMap[element1] || "床頭朝東南，平衡雙方能量";
	};

	const generateBedHeadDirection = (element1, element2) => {
		const directionAdvice = {
			金金: "西方或西北方，增強共同目標",
			金木: "東南方，平衡雙方差異",
			金水: "北方，促進深度交流",
			金火: "東北方，化解衝突",
			金土: "西南方，穩定關係",
			木木: "東方，共同成長",
			木水: "東方，相互滋養",
			木火: "南方，激發熱情",
			木土: "東南方，包容理解",
			水水: "北方，深化感情",
			水火: "東北方，平衡冷熱",
			水土: "西北方，增進穩定",
			火火: "南方，保持激情",
			火土: "西南方，溫暖踏實",
			土土: "中央，穩固基礎",
		};

		const key1 = element1 + element2;
		const key2 = element2 + element1;

		return (
			directionAdvice[key1] || directionAdvice[key2] || "東南方，促進和諧"
		);
	};

	const generateBedroomEnhancements = (usefulGods) => {
		const enhancementMap = {
			金: ["放置金屬風鈴", "使用白色或金色床品", "擺放圓形鏡子"],
			木: ["放置綠色植物", "使用木質家具", "掛畫花草圖案"],
			水: ["放置小水景", "使用藍色系床品", "擺放波浪形裝飾"],
			火: ["使用暖色調燈光", "放置紅色裝飾", "擺放三角形物品"],
			土: ["使用黃色系床品", "放置陶瓷裝飾", "使用方形家具"],
		};

		const enhancements = [];
		usefulGods.forEach((element) => {
			if (enhancementMap[element]) {
				enhancements.push(...enhancementMap[element]);
			}
		});

		return [...new Set(enhancements)].slice(0, 5);
	};

	const generateColorScheme = (usefulGods1, usefulGods2) => {
		const combinedUsefulGods = [
			...new Set([...usefulGods1, ...usefulGods2]),
		];

		return {
			primary: getElementColors(combinedUsefulGods).slice(0, 2),
			secondary: getElementColors(combinedUsefulGods).slice(2, 4),
			accent: ["粉紅色", "玫瑰金"], // 固定的感情色彩
			avoid: getConflictColors(combinedUsefulGods),
		};
	};

	const generateDirections = (element1, element2) => {
		return {
			favorable: getFavorableDirections([element1, element2]),
			bedroom: generateBedHeadDirection(element1, element2),
			study: "書桌朝向有利方位，提升事業運勢",
			dining: "餐桌位置促進家庭和諧",
			avoid: getUnfavorableDirections([element1, element2]),
		};
	};

	const generateDecorations = (usefulGods1, usefulGods2) => {
		const combinedUsefulGods = [
			...new Set([...usefulGods1, ...usefulGods2]),
		];

		return {
			romantic: [
				"成對的愛情鳥裝飾",
				"心形或圓形的裝飾品",
				"雙人合照放在桃花位",
				"粉紅色或紅色的花朵",
			],
			elements: getElementDecorations(combinedUsefulGods),
			symbols: [
				"龍鳳配的圖案",
				"鴛鴦戲水的裝飾",
				"百合花象徵百年好合",
				"玫瑰石英增進愛情運",
			],
			avoid: [
				"單獨的人物畫像",
				"刀劍等尖銳物品",
				"破碎或有裂痕的物品",
				"仙人掌等帶刺植物",
			],
		};
	};

	const generatePlants = (usefulGods1, usefulGods2) => {
		const combinedUsefulGods = [
			...new Set([...usefulGods1, ...usefulGods2]),
		];

		return {
			bedroom: [
				"薰衣草 - 促進睡眠和放鬆",
				"茉莉花 - 增進愛情運勢",
				"玫瑰 - 象徵愛情美滿",
			],
			livingRoom: [
				"富貴竹 - 增進家庭和諧",
				"蘭花 - 提升感情品質",
				"百合 - 象徵百年好合",
				"牡丹 - 代表富貴吉祥",
			],
			elements: getElementPlants(combinedUsefulGods),
			care: [
				"保持植物健康生長",
				"及時澆水和施肥",
				"避免枯萎或死亡的植物",
				"定期修剪保持美觀",
			],
		};
	};

	const generateLivingRoomPlants = (usefulGods) => {
		const plantMap = {
			金: ["白色花卉", "金桂花", "白蘭花"],
			木: ["綠蘿", "發財樹", "富貴竹"],
			水: ["水仙花", "蓮花", "水竹"],
			火: ["紅掌", "一品紅", "火鶴花"],
			土: ["黃菊花", "向日葵", "土豆花"],
		};

		const plants = [];
		usefulGods.forEach((element) => {
			if (plantMap[element]) {
				plants.push(...plantMap[element]);
			}
		});

		return [...new Set(plants)].slice(0, 4);
	};

	const generateLighting = (element1, element2) => {
		return {
			bedroom: {
				main: "柔和的暖白光，營造溫馨氛圍",
				accent: "床頭使用可調光的檯燈",
				romantic: "偶爾使用燭光增進浪漫",
			},
			livingRoom: {
				main: "明亮但不刺眼的白光",
				accent: "使用多層次照明設計",
				evening: "晚上使用暖色調燈光",
			},
			elements: getElementLighting([element1, element2]),
			avoid: [
				"避免過於刺眼的強光",
				"不要使用閃爍的燈光",
				"避免燈光直射眼部",
			],
		};
	};

	const getElementColors = (elements) => {
		const colorMap = {
			金: ["白色", "銀色", "金色", "米白色"],
			木: ["綠色", "青色", "翠綠色", "橄欖綠"],
			水: ["藍色", "黑色", "深藍色", "海藍色"],
			火: ["紅色", "紫色", "橙色", "粉紅色"],
			土: ["黃色", "褐色", "土色", "米黃色"],
		};

		const colors = [];
		elements.forEach((element) => {
			if (colorMap[element]) {
				colors.push(...colorMap[element]);
			}
		});

		return [...new Set(colors)];
	};

	const getConflictColors = (usefulGods) => {
		// 返回可能與用神衝突的顏色
		return ["過於鮮豔的顏色", "過於陰暗的顏色", "對比過強的配色"];
	};

	const getFavorableDirections = (elements) => {
		const directionMap = {
			金: ["西方", "西北方"],
			木: ["東方", "東南方"],
			水: ["北方"],
			火: ["南方"],
			土: ["西南方", "東北方", "中央"],
		};

		const directions = [];
		elements.forEach((element) => {
			if (directionMap[element]) {
				directions.push(...directionMap[element]);
			}
		});

		return [...new Set(directions)];
	};

	const getUnfavorableDirections = (elements) => {
		// 根據五行相剋關係確定不利方位
		const conflictMap = {
			金: ["南方"], // 火克金
			木: ["西方"], // 金克木
			水: ["西南方"], // 土克水
			火: ["北方"], // 水克火
			土: ["東方"], // 木克土
		};

		const unfavorable = [];
		elements.forEach((element) => {
			if (conflictMap[element]) {
				unfavorable.push(...conflictMap[element]);
			}
		});

		return [...new Set(unfavorable)];
	};

	const getElementDecorations = (elements) => {
		const decorationMap = {
			金: ["金屬風鈴", "圓形鏡子", "金色相框"],
			木: ["木質雕刻", "竹子裝飾", "綠色掛畫"],
			水: ["小型噴泉", "魚缸", "波浪形裝飾"],
			火: ["蠟燭", "三角形裝飾", "暖色調畫作"],
			土: ["陶瓷花瓶", "方形裝飾", "石頭擺件"],
		};

		const decorations = [];
		elements.forEach((element) => {
			if (decorationMap[element]) {
				decorations.push(...decorationMap[element]);
			}
		});

		return [...new Set(decorations)];
	};

	const getElementPlants = (elements) => {
		const plantMap = {
			金: ["白色花卉", "金桂", "白玫瑰"],
			木: ["綠色植物", "竹子", "常春藤"],
			水: ["水生植物", "蓮花", "水仙"],
			火: ["紅色花卉", "向日葵", "辣椒"],
			土: ["多肉植物", "仙人掌", "土豆"],
		};

		const plants = [];
		elements.forEach((element) => {
			if (plantMap[element]) {
				plants.push(...plantMap[element]);
			}
		});

		return [...new Set(plants)];
	};

	const getElementLighting = (elements) => {
		const lightingMap = {
			金: "柔和的白光或金色光",
			木: "自然的綠色調光線",
			水: "藍色調或月白色光",
			火: "溫暖的紅色或橙色光",
			土: "穩重的黃色調光線",
		};

		return elements.map((element) => lightingMap[element] || "中性白光");
	};

	if (loading) {
		return (
			<div className="w-full p-8 bg-white rounded-lg shadow-lg">
				<div className="flex items-center justify-center">
					<div className="w-8 h-8 border-b-2 border-green-500 rounded-full animate-spin"></div>
					<span className="ml-2 text-gray-600">
						生成風水布局中...
					</span>
				</div>
			</div>
		);
	}

	if (!layoutData) {
		return (
			<div className="w-full p-8 bg-white rounded-lg shadow-lg">
				<div className="text-center text-gray-500">
					<Home className="w-12 h-12 mx-auto mb-2 text-gray-300" />
					<p>無法生成風水布局，請檢查出生資料</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="w-full bg-white p-8 rounded-[45px]"
			style={{ boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)" }}
		>
			{/* Header */}
			<div className="p-6">
				<h2
					className="flex items-center text-2xl font-bold"
					style={{
						fontFamily: "Noto Serif TC, Serif",
						color: "#D91A5A",
						fontSize: "40px",
					}}
				>
					<Home className="w-8 h-8 mr-3" />
					愛情風水布局
				</h2>
			</div>

			{/* Content */}
			<div className="p-8">
				{/* Bedroom Layout */}
				<div className="mb-8">
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Heart className="w-5 h-5 mr-2" />
							臥室風水布局
						</h3>
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						<div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								床位擺放
							</h4>
							<p
								className="text-black mb-3"
								style={{ fontSize: "15px" }}
							>
								{layoutData.bedroomLayout?.bedPosition ||
									"建議床位擺放在房間的安靜角落"}
							</p>
							<p
								className="text-black mb-3"
								style={{ fontSize: "15px" }}
							>
								<span className="font-medium">床頭方向：</span>
								{layoutData.bedroomLayout?.bedHeadDirection ||
									"朝向有利方位"}
							</p>
							<div>
								<p
									className="font-medium text-gray-700 mb-2"
									style={{ fontSize: "15px" }}
								>
									建議顏色：
								</p>
								<div className="flex flex-wrap gap-2">
									{(
										layoutData.bedroomLayout?.colors || []
									).map((color, index) => (
										<span
											key={index}
											className="px-3 py-2 bg-pink-100 text-pink-700 rounded"
											style={{ fontSize: "14px" }}
										>
											{color}
										</span>
									))}
								</div>
							</div>
						</div>

						<div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								增運布置
							</h4>
							<div className="space-y-2">
								{(
									layoutData.bedroomLayout?.enhancements || []
								).map((enhancement, index) => (
									<div
										key={index}
										className="flex items-start"
									>
										<Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{enhancement}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="mt-6 grid gap-6 md:grid-cols-2">
						<div className="bg-green-50 rounded-lg p-6 border border-green-200">
							<h4
								className="font-medium text-green-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								宜放置
							</h4>
							<div className="space-y-2">
								{(
									layoutData.bedroomLayout?.decorations || []
								).map((decoration, index) => (
									<div
										key={index}
										className="text-black"
										style={{ fontSize: "15px" }}
									>
										{decoration}
									</div>
								))}
							</div>
						</div>
						<div className="bg-red-50 rounded-lg p-6 border border-red-200">
							<h4
								className="font-medium text-red-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								忌擺放
							</h4>
							<div className="space-y-2">
								{(layoutData.bedroomLayout?.taboos || []).map(
									(taboo, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{taboo}
										</div>
									)
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Living Room Layout */}
				<div className="mb-8">
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Home className="w-5 h-5 mr-2" />
							客廳風水布局
						</h3>
					</div>
					<div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<h4
									className="font-medium text-gray-800 mb-3"
									style={{ fontSize: "15px" }}
								>
									家具擺放
								</h4>
								<div className="space-y-2">
									<p
										className="text-black"
										style={{ fontSize: "15px" }}
									>
										{layoutData.livingRoomLayout
											?.sofaPosition ||
											"沙發建議靠牆擺放"}
									</p>
									<p
										className="text-black"
										style={{ fontSize: "15px" }}
									>
										{layoutData.livingRoomLayout
											?.tvPosition || "電視適當擺放"}
									</p>
									<p
										className="text-black"
										style={{ fontSize: "15px" }}
									>
										{layoutData.livingRoomLayout
											?.lighting || "使用柔和燈光"}
									</p>
								</div>
							</div>
							<div>
								<h4
									className="font-medium text-gray-800 mb-3"
									style={{ fontSize: "15px" }}
								>
									裝飾建議
								</h4>
								<div className="space-y-2">
									{(
										layoutData.livingRoomLayout
											?.decorations || []
									).map((decoration, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{decoration}
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="mt-6">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								推薦植物
							</h4>
							<div className="flex flex-wrap gap-2">
								{(
									layoutData.livingRoomLayout?.plants || []
								).map((plant, index) => (
									<span
										key={index}
										className="px-3 py-2 bg-green-100 text-green-700 rounded"
										style={{ fontSize: "14px" }}
									>
										{plant}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Color Scheme */}
				<div className="mb-8">
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Palette className="w-5 h-5 mr-2" />
							色彩搭配方案
						</h3>
					</div>
					<div className="grid gap-6 md:grid-cols-4">
						<div className="bg-gray-50 rounded-lg p-6">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								主色調
							</h4>
							<div className="space-y-2">
								{(layoutData.colors?.primary || []).map(
									(color, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{color}
										</div>
									)
								)}
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-6">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								輔助色
							</h4>
							<div className="space-y-2">
								{(layoutData.colors?.secondary || []).map(
									(color, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{color}
										</div>
									)
								)}
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-6">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								點綴色
							</h4>
							<div className="space-y-2">
								{(layoutData.colors?.accent || []).map(
									(color, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{color}
										</div>
									)
								)}
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-6">
							<h4
								className="font-medium text-gray-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								避免色彩
							</h4>
							<div className="space-y-2">
								{(layoutData.colors?.avoid || []).map(
									(color, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{color}
										</div>
									)
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Directions */}
				<div className="mb-8">
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Compass className="w-5 h-5 mr-2" />
							方位指導
						</h3>
					</div>
					<div className="grid gap-6 md:grid-cols-2">
						<div className="bg-green-50 rounded-lg p-6 border border-green-200">
							<h4
								className="font-medium text-green-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								有利方位
							</h4>
							<div className="flex flex-wrap gap-2">
								{(layoutData.directions?.favorable || []).map(
									(direction, index) => (
										<span
											key={index}
											className="px-3 py-2 bg-green-100 text-green-700 rounded"
											style={{ fontSize: "14px" }}
										>
											{direction}
										</span>
									)
								)}
							</div>
						</div>
						<div className="bg-red-50 rounded-lg p-6 border border-red-200">
							<h4
								className="font-medium text-red-800 mb-3"
								style={{ fontSize: "15px" }}
							>
								避免方位
							</h4>
							<div className="flex flex-wrap gap-2">
								{(layoutData.directions?.avoid || []).map(
									(direction, index) => (
										<span
											key={index}
											className="px-3 py-2 bg-red-100 text-red-700 rounded"
											style={{ fontSize: "14px" }}
										>
											{direction}
										</span>
									)
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Decorations and Plants */}
				<div className="grid gap-8 md:grid-cols-2">
					<div>
						<div
							className="px-4 py-2 mb-4 rounded"
							style={{ backgroundColor: "#D91A5A" }}
						>
							<h3 className="flex items-center text-lg text-white">
								<MapPin className="w-5 h-5 mr-2" />
								裝飾擺設
							</h3>
						</div>
						<div className="space-y-6">
							<div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
								<h4
									className="font-medium text-yellow-800 mb-3"
									style={{ fontSize: "15px" }}
								>
									愛情裝飾
								</h4>
								<div className="space-y-2">
									{(
										layoutData.decorations?.romantic || []
									).map((decoration, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{decoration}
										</div>
									))}
								</div>
							</div>
							<div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
								<h4
									className="font-medium text-blue-800 mb-3"
									style={{ fontSize: "15px" }}
								>
									五行裝飾
								</h4>
								<div className="space-y-2">
									{(
										layoutData.decorations?.elements || []
									).map((decoration, index) => (
										<div
											key={index}
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{decoration}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div>
						<div
							className="px-4 py-2 mb-4 rounded"
							style={{ backgroundColor: "#D91A5A" }}
						>
							<h3 className="flex items-center text-lg text-white">
								<Lightbulb className="w-5 h-5 mr-2" />
								植物配置
							</h3>
						</div>
						<div className="space-y-6">
							<div className="bg-green-50 rounded-lg p-6 border border-green-200">
								<h4
									className="font-medium text-green-800 mb-3"
									style={{ fontSize: "15px" }}
								>
									臥室植物
								</h4>
								<div className="space-y-2">
									{(layoutData.plants?.bedroom || []).map(
										(plant, index) => (
											<div
												key={index}
												className="text-black"
												style={{ fontSize: "15px" }}
											>
												{plant}
											</div>
										)
									)}
								</div>
							</div>
							<div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
								<h4
									className="font-medium text-teal-800 mb-3"
									style={{ fontSize: "15px" }}
								>
									客廳植物
								</h4>
								<div className="space-y-2">
									{(layoutData.plants?.livingRoom || []).map(
										(plant, index) => (
											<div
												key={index}
												className="text-black"
												style={{ fontSize: "15px" }}
											>
												{plant}
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoupleFengShuiLayout;
