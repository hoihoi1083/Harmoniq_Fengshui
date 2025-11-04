"use client";

import { useState, useEffect, useContext } from "react";
import getWuxingData from "../../lib/nayin.js";
import Image from "next/image";
import RoomCanvas from "../report/RoomCanvas";
import { useImage } from "../../context/ImageContext";

export default function OverallBazhaiAnalysis({
	analysis,
	mingGuaInfo,
	userProfile,
	designSummary,
	roomAnalyses,
	yearlyAdvice,
}) {
	const [activeSection, setActiveSection] = useState("overview");
	const [activeRoomIndex, setActiveRoomIndex] = useState(0); // Set first room as active by default
	const [localPersonalData, setLocalPersonalData] = useState(null);
	const [personalAnalysisSummary, setPersonalAnalysisSummary] =
		useState(null);
	const [isLoadingPersonalSummary, setIsLoadingPersonalSummary] =
		useState(false);

	// State for expandable sections
	const [expandedSections, setExpandedSections] = useState({
		yearlyFocus: false,
		nineMovement: false,
		personalAdvice: false,
	});

	const toggleSection = (section) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// Room canvas state variables
	const [activeRoom, setActiveRoom] = useState(null);
	const [designData, setDesignData] = useState(null);
	const [roomList, setRoomList] = useState([]);

	// Overlay layer states
	const [showBazhaiLayer, setShowBazhaiLayer] = useState(false);
	const [showFlyingStarLayer, setShowFlyingStarLayer] = useState(false);
	const [showDirectionLayer, setShowDirectionLayer] = useState(false);

	// Get the uploaded layout image from ImageContext
	const { preview: layoutImage } = useImage();

	// Room canvas helper functions
	const fetchDesignData = (designData) => {
		setDesignData(designData);
	};

	const fetchRoomList = (roomList) => {
		setRoomList(roomList);
	};

	const onSetActiveRoom = (room) => {
		setActiveRoom(room);
	};

	// 命卦映射 (from bazhai-analysis/route.js)
	const mingGuaMapping = {
		1: {
			trigram: "坎",
			group: "東四命",
			element: "水",
			direction: "north",
			name: "坎卦",
		},
		2: {
			trigram: "坤",
			group: "西四命",
			element: "土",
			direction: "southWest",
			name: "坤卦",
		},
		3: {
			trigram: "震",
			group: "東四命",
			element: "木",
			direction: "east",
			name: "震卦",
		},
		4: {
			trigram: "巽",
			group: "東四命",
			element: "木",
			direction: "southEast",
			name: "巽卦",
		},
		6: {
			trigram: "乾",
			group: "西四命",
			element: "金",
			direction: "northWest",
			name: "乾卦",
		},
		7: {
			trigram: "兌",
			group: "西四命",
			element: "金",
			direction: "west",
			name: "兌卦",
		},
		8: {
			trigram: "艮",
			group: "西四命",
			element: "土",
			direction: "northEast",
			name: "艮卦",
		},
		9: {
			trigram: "離",
			group: "東四命",
			element: "火",
			direction: "south",
			name: "離卦",
		},
	};

	// 命卦計算函數 (from bazhai-analysis/route.js)
	const calculateMingGua = (birthYear, gender) => {
		const year = parseInt(birthYear);
		let remainder;

		if (gender === "男") {
			// 男性公式: (100 - (年份後兩位)) % 9，如果為0則為9
			remainder = (100 - (year % 100)) % 9;
			return remainder === 0 ? 9 : remainder;
		} else {
			// 女性公式: ((年份後兩位) - 4) % 9，如果為0則為9
			remainder = ((year % 100) - 4) % 9;
			return remainder === 0 ? 9 : remainder;
		}
	};

	// 計算五行數量和狀態
	const calculateWuxingCount = (wuxingData) => {
		const elements = {
			金: 0,
			木: 0,
			水: 0,
			火: 0,
			土: 0,
		};

		// 統計年月日時柱的天干地支五行
		const wuxingElements = [
			wuxingData.yearStemWuxing,
			wuxingData.yearBranchWuxing,
			wuxingData.monthStemWuxing,
			wuxingData.monthBranchWuxing,
			wuxingData.dayStemWuxing,
			wuxingData.dayBranchWuxing,
			wuxingData.hourStemWuxing,
			wuxingData.hourBranchWuxing,
		];

		wuxingElements.forEach((element) => {
			if (elements.hasOwnProperty(element)) {
				elements[element]++;
			}
		});

		// 檢查是否齊全
		const missingElements = Object.keys(elements).filter(
			(key) => elements[key] === 0
		);
		const status =
			missingElements.length === 0
				? "五行齊全"
				: `缺${missingElements.join("、")}`;

		return { elements, status };
	};

	// 生成個人分析AI提示
	const generatePersonalAnalysisPrompt = (wuxingData, mingGuaInfo) => {
		// Add null checking for mingGuaInfo
		if (!mingGuaInfo) {
			return "根據八字信息生成個人分析，但命卦信息不完整。";
		}

		const wuxingCount = calculateWuxingCount(wuxingData);

		return `根據以下八字信息，生成一段分析，描述該人的五行特徵、主要元素、性格特徵、潜在的優勢與劣勢，以及相應的建議來平衡五行。請包括具體的顏色、物品或佈局建議。

八字信息：
年柱：${wuxingData.year}
月柱：${wuxingData.month}  
日柱：${wuxingData.day}
時柱：${wuxingData.hour}
命卦：${mingGuaInfo.name}（${mingGuaInfo.group}，${mingGuaInfo.element}）
五行分佈：金${wuxingCount.elements.金}、木${wuxingCount.elements.木}、水${wuxingCount.elements.水}、火${wuxingCount.elements.火}、土${wuxingCount.elements.土}
五行狀態：${wuxingCount.status}
納音：${wuxingData.nayin}

請用繁體中文生成約150字的分析，格式如下範例：
您八字木火旺盛，主元素為木。火能助木生髮，表現為熱情積極、充滿活力，但五行中土元素缺乏，穩定性和耐力較弱。金元素雖有存在，但較弱。建議補充土的能量，如黃色、褐色飾品及生活環境中註重土屬性佈局，以平衡五行，助於身心健康和運勢提升。整體個性堅韌樂觀，富有進取心與責任感。`;
	};

	// 獲取個人分析（保留AI調用 - 八字分析需要專業知識）
	// Fetch AI room analysis from the new bazhai-analysis API
	const fetchAIRoomAnalysis = async (roomsData, userProfileData) => {
		if (!roomsData || !userProfileData || !roomsData.length) {
			return;
		}

		// Enhance userProfileData with locally calculated mingGuaInfo if available
		const enhancedUserProfile = {
			...userProfileData,
			mingGuaInfo:
				localPersonalData?.mingGuaInfo || userProfileData.mingGuaInfo,
			wuxingData:
				localPersonalData?.wuxingData || userProfileData.wuxingData,
		};

		setIsLoadingPersonalSummary(true);
		try {
			const response = await fetch("/api/bazhai-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					rooms: roomsData,
					userProfile: enhancedUserProfile,
				}),
			});

			if (response.ok) {
				const data = await response.json();

				// Update the analysis state with AI results
				if (
					data.data.roomAnalyses &&
					data.data.roomAnalyses.length > 0
				) {
					// Set AI-generated overall analysis
					if (data.data.overallAnalysis) {
						try {
							const overallAI = JSON.parse(
								data.data.overallAnalysis
							);
							setPersonalAnalysisSummary(
								overallAI.overallAnalysis ||
									overallAI.personalMingGuaAnalysis ||
									"AI分析完成"
							);
						} catch (e) {
							setPersonalAnalysisSummary(
								data.data.overallAnalysis
							);
						}
					}

					// Store AI room analyses for use in the component
					// (This would require parent component to update roomAnalyses prop)
				}
			} else {
				const fallbackAnalysis = generateBasicPersonalAnalysis(
					wuxingData || localPersonalData?.wuxingData,
					mingGuaInfo || localPersonalData?.mingGuaInfo
				);
				setPersonalAnalysisSummary(fallbackAnalysis);
			}
		} catch (error) {
			const fallbackAnalysis = generateBasicPersonalAnalysis(
				wuxingData || localPersonalData?.wuxingData,
				mingGuaInfo || localPersonalData?.mingGuaInfo
			);
			setPersonalAnalysisSummary(fallbackAnalysis);
		} finally {
			setIsLoadingPersonalSummary(false);
		}
	};

	const fetchPersonalAnalysisSummary = async (wuxingData, mingGuaInfo) => {
		console.log("fetchPersonalAnalysisSummary called with:", {
			wuxingData,
			mingGuaInfo,
			personalAnalysisSummary,
		});
		console.log("roomAnalyses:", roomAnalyses);

		if (!wuxingData || !mingGuaInfo) {
			console.log("Early return due to missing data:", {
				noWuxingData: !wuxingData,
				noMingGuaInfo: !mingGuaInfo,
			});
			return;
		}

		// Skip if already has personal analysis
		if (personalAnalysisSummary) {
			console.log("Already has personal analysis, skipping");
			return;
		}

		console.log("Starting personal analysis API call...");
		setIsLoadingPersonalSummary(true);
		try {
			const prompt = generatePersonalAnalysisPrompt(
				wuxingData,
				mingGuaInfo
			);

			console.log("Generated prompt:", prompt);

			const response = await fetch("/api/personal-analysis", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					userProfile: {
						...userProfile,
						wuxingData,
						mingGuaInfo,
					},
				}),
			});

			console.log("API response status:", response.status);

			if (response.ok) {
				const data = await response.json();
				console.log("API response data:", data);
				setPersonalAnalysisSummary(data.analysis);
			} else {
				console.log("API failed, using fallback");
				// Fallback to basic analysis if AI fails
				const fallbackAnalysis = generateBasicPersonalAnalysis(
					wuxingData,
					mingGuaInfo
				);
				setPersonalAnalysisSummary(fallbackAnalysis);
			}
		} catch (error) {
			console.error("Error in fetchPersonalAnalysisSummary:", error);
			// Fallback to basic analysis if AI fails
			const fallbackAnalysis = generateBasicPersonalAnalysis(
				wuxingData,
				mingGuaInfo
			);
			console.log("Using fallback analysis:", fallbackAnalysis);
			setPersonalAnalysisSummary(fallbackAnalysis);
		} finally {
			console.log("Setting loading to false");
			setIsLoadingPersonalSummary(false);
		}
	};

	// 基於五行和命卦生成基礎個人分析
	const generateBasicPersonalAnalysis = (wuxingData, mingGuaInfo) => {
		// Add null checking for mingGuaInfo
		if (!mingGuaInfo) {
			return "個人命卦信息不完整，無法生成詳細分析。";
		}

		const elementStrengths = {
			木: wuxingData.wood || 0,
			火: wuxingData.fire || 0,
			土: wuxingData.earth || 0,
			金: wuxingData.metal || 0,
			水: wuxingData.water || 0,
		};

		// 找出主要元素和缺乏元素
		const mainElement = Object.entries(elementStrengths).reduce((a, b) =>
			elementStrengths[a[0]] > elementStrengths[b[0]] ? a : b
		)[0];
		const weakElement = Object.entries(elementStrengths).reduce((a, b) =>
			elementStrengths[a[0]] < elementStrengths[b[0]] ? a : b
		)[0];

		const elementDescriptions = {
			木: "性格堅韌積極，富有成長性和創造力",
			火: "熱情奔放，充滿活力和進取心",
			土: "穩重踏實，具有包容性和責任感",
			金: "理性堅毅，具有決斷力和正義感",
			水: "智慧靈活，具有適應性和洞察力",
		};

		return `您的命卦為${mingGuaInfo.name}，五行以${mainElement}為主導，${elementDescriptions[mainElement]}。${weakElement}元素相對較弱，建議在生活中適當補充${weakElement}的能量，如選擇對應顏色的飾品或居家佈置。納音為${wuxingData.nayin}，整體運勢${mingGuaInfo.group === "東四命" ? "偏向東方吉位" : "偏向西方吉位"}，適合相應的風水佈局來提升整體運勢。`;
	};

	// 計算本地個人數據
	useEffect(() => {
		console.log("useEffect triggered with userProfile:", userProfile);

		// Handle different userProfile formats
		const birthDate =
			userProfile?.birthDate ||
			userProfile?.birthDateTime ||
			(userProfile?.birthYear
				? new Date(
						userProfile.birthYear,
						(userProfile.birthMonth || 1) - 1,
						userProfile.birthDay || 1,
						userProfile.birthHour || 12
					)
				: null);

		const gender = userProfile?.gender;

		console.log("Extracted data:", { birthDate, gender });

		if (birthDate && gender) {
			console.log("Processing wuxing calculation...");
			try {
				// 使用本地計算函數獲取八字和五行數據
				const birthDateTime = new Date(birthDate);

				// Handle gender conversion
				const genderForWuxing =
					gender === "男" || gender === "male" ? "male" : "female";
				const genderForMingGua =
					gender === "male" || gender === "female"
						? gender === "male"
							? "男"
							: "女"
						: gender;

				const wuxingData = getWuxingData(
					birthDateTime,
					genderForWuxing
				);

				// 計算命卦
				const birthYear = birthDateTime.getFullYear();
				const mingGuaNumber = calculateMingGua(
					birthYear,
					genderForMingGua
				);
				const mingGuaInfo = mingGuaMapping[mingGuaNumber];

				console.log("Calculation results:", {
					wuxingData,
					mingGuaInfo,
					mingGuaNumber,
				});

				// Add validation and error handling
				if (wuxingData && mingGuaInfo && mingGuaNumber) {
					console.log(
						"Setting localPersonalData and calling fetchPersonalAnalysisSummary"
					);
					setLocalPersonalData({
						wuxingData,
						mingGuaInfo,
						mingGuaNumber,
					});

					// 獲取AI個人分析摘要
					fetchPersonalAnalysisSummary(wuxingData, mingGuaInfo);
				} else {
					console.log("Missing data for AI analysis:", {
						hasWuxingData: !!wuxingData,
						hasMingGuaInfo: !!mingGuaInfo,
						hasMingGuaNumber: !!mingGuaNumber,
					});
				}
			} catch (error) {
				console.error("Error in local calculation:", error);
			}
		} else {
			console.log("Missing birthDate or gender, not processing");
		}
	}, [userProfile]);

	// 2025年飛星數據
	const flyingStars2025 = {
		northEast: {
			star: "五黃廉貞星",
			element: "土",
			type: "凶",
			color: "bg-red-500",
		},
		east: {
			star: "九紫右弼星",
			element: "火",
			type: "吉",
			color: "bg-green-500",
		},
		southEast: {
			star: "一白貪狼星",
			element: "水",
			type: "吉",
			color: "bg-green-500",
		},
		south: {
			star: "二黑巨門星",
			element: "土",
			type: "凶",
			color: "bg-red-500",
		},
		southWest: {
			star: "八白左輔星",
			element: "土",
			type: "吉",
			color: "bg-green-500",
		},
		west: {
			star: "七赤破軍星",
			element: "金",
			type: "凶",
			color: "bg-red-500",
		},
		northWest: {
			star: "三碧祿存星",
			element: "木",
			type: "凶",
			color: "bg-red-500",
		},
		north: {
			star: "四綠文曲星",
			element: "木",
			type: "吉",
			color: "bg-green-500",
		},
		center: {
			star: "六白武曲星",
			element: "金",
			type: "吉",
			color: "bg-green-500",
		},
	};

	// 八宅方位對應 (西南201°住宅)
	const bazhaiMapping = {
		northEast: "生氣",
		east: "五鬼",
		southEast: "禍害",
		south: "六煞",
		southWest: "伏位",
		west: "延年",
		northWest: "天醫",
		north: "絕命",
		center: "中宮", // Center position
	};

	const getCompatibilityScore = () => {
		const totalRooms = designSummary.totalRooms;
		const auspiciousRooms = designSummary.auspiciousRooms;
		if (totalRooms === 0) return 0;
		return Math.round((auspiciousRooms / totalRooms) * 100);
	};

	// 動態生成四吉位和四凶位數據
	const generateBazhaiPositions = () => {
		const allDirections = [
			"northEast",
			"east",
			"southEast",
			"south",
			"southWest",
			"west",
			"northWest",
			"north",
			"center",
		];
		const directionNames = {
			northEast: "東北",
			east: "正東",
			southEast: "東南",
			south: "正南",
			southWest: "西南",
			west: "正西",
			northWest: "西北",
			north: "正北",
			center: "中宮",
		};

		// 西南201°住宅的八宅吉凶分類
		const auspiciousPositions = [
			"northEast",
			"west",
			"northWest",
			"southWest",
			"center",
		]; // 生氣、延年、天醫、伏位、中宮
		const inauspiciousPositions = ["east", "southEast", "south", "north"]; // 五鬼、禍害、六煞、絕命

		const auspiciousData = auspiciousPositions.map((direction) => {
			const starInfo = flyingStars2025[direction];
			const bazhaiName = bazhaiMapping[direction];
			return {
				position: getBazhaiDescription(bazhaiName),
				direction: directionNames[direction],
				star: starInfo?.star || "未知",
				type: starInfo?.type || "未知",
			};
		});

		const inauspiciousData = inauspiciousPositions.map((direction) => {
			const starInfo = flyingStars2025[direction];
			const bazhaiName = bazhaiMapping[direction];
			return {
				position: getBazhaiDescription(bazhaiName),
				direction: directionNames[direction],
				star: starInfo?.star || "未知",
				type: starInfo?.type || "未知",
			};
		});

		return { auspiciousData, inauspiciousData };
	};

	// 八宅方位描述
	const getBazhaiDescription = (bazhaiName) => {
		const descriptions = {
			生氣: "生氣-健康事業",
			延年: "延年-長壽人緣",
			天醫: "天醫-健康",
			伏位: "伏位-安定",
			五鬼: "五鬼-意外災禍",
			禍害: "禍害-是非口舌",
			六煞: "六煞-感情破財",
			絕命: "絕命-重大凶險",
		};
		return descriptions[bazhaiName] || bazhaiName;
	};

	const { auspiciousData, inauspiciousData } = generateBazhaiPositions();

	// 計算房屋方位信息
	const calculateHouseDirectionInfo = () => {
		// 從 designSummary 獲取房屋方向信息
		const compassRotation = designSummary?.compassRotation || 0;

		// 將羅盤度數轉換為八宅方位
		const getDirectionFromRotation = (rotation) => {
			const normalizedRotation = ((rotation % 360) + 360) % 360;

			if (normalizedRotation >= 337.5 || normalizedRotation < 22.5)
				return { direction: "north", chinese: "正北", degree: "0°" };
			else if (normalizedRotation >= 22.5 && normalizedRotation < 67.5)
				return {
					direction: "northEast",
					chinese: "東北",
					degree: "45°",
				};
			else if (normalizedRotation >= 67.5 && normalizedRotation < 112.5)
				return { direction: "east", chinese: "正東", degree: "90°" };
			else if (normalizedRotation >= 112.5 && normalizedRotation < 157.5)
				return {
					direction: "southEast",
					chinese: "東南",
					degree: "135°",
				};
			else if (normalizedRotation >= 157.5 && normalizedRotation < 202.5)
				return { direction: "south", chinese: "正南", degree: "180°" };
			else if (normalizedRotation >= 202.5 && normalizedRotation < 247.5)
				return {
					direction: "southWest",
					chinese: "西南",
					degree: "225°",
				};
			else if (normalizedRotation >= 247.5 && normalizedRotation < 292.5)
				return { direction: "west", chinese: "正西", degree: "270°" };
			else
				return {
					direction: "northWest",
					chinese: "西北",
					degree: "315°",
				};
		};

		const houseDirection = getDirectionFromRotation(compassRotation);

		// 獲取坐向信息 (坐向是相對180度)
		const oppositeRotation = (compassRotation + 180) % 360;
		const sitDirection = getDirectionFromRotation(oppositeRotation);

		// 根據坐向判斷宅卦類型 - 使用正統八宅風水原理
		// 八個宅卦及其對應的坐向和分組
		const houseTrigramMapping = {
			// 東四宅組
			north: {
				trigram: "坎",
				group: "東四宅",
				name: "坎宅",
				description: "坎宅（坐北向南）",
				element: "水",
			},
			east: {
				trigram: "震",
				group: "東四宅",
				name: "震宅",
				description: "震宅（坐東向西）",
				element: "木",
			},
			southEast: {
				trigram: "巽",
				group: "東四宅",
				name: "巽宅",
				description: "巽宅（坐東南向西北）",
				element: "木",
			},
			south: {
				trigram: "離",
				group: "東四宅",
				name: "離宅",
				description: "離宅（坐南向北）",
				element: "火",
			},
			// 西四宅組
			southWest: {
				trigram: "坤",
				group: "西四宅",
				name: "坤宅",
				description: "坤宅（坐西南向東北）",
				element: "土",
			},
			west: {
				trigram: "兌",
				group: "西四宅",
				name: "兌宅",
				description: "兌宅（坐西向東）",
				element: "金",
			},
			northWest: {
				trigram: "乾",
				group: "西四宅",
				name: "乾宅",
				description: "乾宅（坐西北向東南）",
				element: "金",
			},
			northEast: {
				trigram: "艮",
				group: "西四宅",
				name: "艮宅",
				description: "艮宅（坐東北向西南）",
				element: "土",
			},
		};

		// 獲取當前房屋的宅卦信息
		const currentHouseTrigram = houseTrigramMapping[sitDirection.direction];
		const houseType = currentHouseTrigram?.group || "未知宅型";
		const houseName = currentHouseTrigram?.name || "未知宅";
		const houseElement = currentHouseTrigram?.element || "未知";

		// 獲取對應的八卦名稱
		const directionTrigrams = {
			north: "坎山",
			northEast: "艮山",
			east: "震山",
			southEast: "巽山",
			south: "離山",
			southWest: "坤山",
			west: "兌山",
			northWest: "乾山",
		};

		const directionTrigramsToward = {
			north: "坎向",
			northEast: "艮向",
			east: "震向",
			southEast: "巽向",
			south: "離向",
			southWest: "坤向",
			west: "兌向",
			northWest: "乾向",
		};

		return {
			facing: houseDirection,
			sitting: sitDirection,
			houseType,
			houseName,
			houseElement,
			houseTrigram: currentHouseTrigram?.trigram || "未知",
			sitTrigramName:
				directionTrigrams[sitDirection.direction] || "未知山",
			faceTrigramName:
				directionTrigramsToward[houseDirection.direction] || "未知向",
			compassRotation: Math.round(compassRotation),
			description: `${houseDirection.chinese}${Math.round(compassRotation)}°`,
		};
	};

	const houseDirectionInfo = calculateHouseDirectionInfo();

	// Generate detailed Ba Zhai explanation based on house type
	const generateBaZhaiExplanation = (houseInfo) => {
		const { houseType, houseName, houseElement, houseTrigram } = houseInfo;

		const explanations = {
			坎宅: {
				characteristics:
					"坎宅屬水，主智慧與流動性。居住者通常具有靈活的思維和強烈的直覺力，善於適應環境變化。",
				benefits:
					"有利於學習、研究和創意工作。水元素帶來財運流動，但需注意理財規劃。",
				challenges:
					"可能較為情緒化，需要穩定的土元素來平衡。避免過度的變動和不確定性。",
			},
			震宅: {
				characteristics:
					"震宅屬木，主成長與發展。居住者富有進取心和創造力，喜歡開創新事物。",
				benefits:
					"極利事業發展和個人成長。木元素帶來蓬勃生機，有助於健康和活力。",
				challenges:
					"可能較為衝動急躁，需要金元素來節制。注意肝膽和神經系統健康。",
			},
			巽宅: {
				characteristics:
					"巽宅屬木，主溫和與滲透。居住者通常性格溫和，善於溝通和人際關係。",
				benefits:
					"有利於人際交往和商業發展。柔性的木元素帶來和諧的家庭關係。",
				challenges:
					"可能意志力較弱，需要火元素來加強決斷力。避免過度優柔寡斷。",
			},
			離宅: {
				characteristics:
					"離宅屬火，主光明與熱情。居住者性格熱情開朗，具有領導才能和表現欲。",
				benefits:
					"有利於名聲和事業成就。火元素帶來旺盛的精力和社交能力。",
				challenges:
					"可能較為急躁易怒，需要水元素來冷卻。注意心血管和眼部健康。",
			},
			坤宅: {
				characteristics:
					"坤宅屬土，主穩重與包容。居住者通常性格溫和包容，重視家庭和傳統價值。",
				benefits:
					"有利於家庭和諧和財富積累。土元素帶來穩定的基礎和持續的發展。",
				challenges:
					"可能較為保守固執，需要木元素來帶來變化。避免過度的安逸和停滯。",
			},
			兌宅: {
				characteristics:
					"兌宅屬金，主收穫與表達。居住者通常口才好，善於表達和社交活動。",
				benefits:
					"有利於溝通表達和商業活動。金元素帶來財富運和人際魅力。",
				challenges:
					"可能較為重視物質享受，需要水元素來調和。注意呼吸系統和皮膚健康。",
			},
			乾宅: {
				characteristics:
					"乾宅屬金，主權威與領導。居住者通常具有領導能力和強烈的責任感。",
				benefits: "極利事業成就和社會地位。金元素帶來權威性和決斷力。",
				challenges:
					"可能較為剛強固執，需要水元素來柔化。避免過度的控制欲和壓力。",
			},
			艮宅: {
				characteristics:
					"艮宅屬土，主穩定與累積。居住者通常踏實穩重，善於積累和保持。",
				benefits:
					"有利於學習研究和財富積累。土元素帶來堅實的基礎和持久的發展。",
				challenges:
					"可能較為內向保守，需要木元素來增加活力。避免過度的固化和惰性。",
			},
		};

		const explanation = explanations[houseName] || {
			characteristics: "此宅卦的特性正在分析中...",
			benefits: "正在分析此宅卦的優勢...",
			challenges: "正在分析需要注意的方面...",
		};

		return {
			groupDescription:
				houseType === "東四宅"
					? "東四宅包括坎、震、巽、離四個卦，對應北、東、東南、南四個方位。東四宅的居住者通常性格較為靈活、有活力，適合動態的生活方式。"
					: "西四宅包括坤、兌、乾、艮四個卦，對應西南、西、西北、東北四個方位。西四宅的居住者通常性格較為穩重、有耐性，適合穩定的生活方式。",
			houseSpecific: explanation,
		};
	};

	const baZhaiExplanation = generateBaZhaiExplanation(houseDirectionInfo);

	// Generate dynamic room analysis based on feng shui data
	const generateRoomAnalysis = (
		room,
		roomIndex,
		starInfo,
		bazhaiName,
		directionName
	) => {
		const isLucky = starInfo?.type === "吉";
		const element = starInfo?.element;
		const roomType = room.roomType;
		const direction = room.direction;

		// Generate room-specific 2025年總結 with enhanced detail
		const generateRoomSpecific2025Summary = (
			roomType,
			directionName,
			starInfo,
			element,
			isLucky
		) => {
			const baseRoomType =
				roomType.includes("睡房") ||
				roomType.includes("臥室") ||
				roomType.includes("bedroom")
					? "臥室"
					: roomType.includes("客廳") || roomType.includes("living")
						? "客廳"
						: roomType.includes("飯廳") ||
							  roomType.includes("餐廳") ||
							  roomType.includes("dining")
							? "餐廳"
							: roomType.includes("廚房") ||
								  roomType.includes("kitchen")
								? "廚房"
								: roomType.includes("浴室") ||
									  roomType.includes("廁所") ||
									  roomType.includes("bathroom")
									? "浴室"
									: roomType.includes("書房") ||
										  roomType.includes("study")
										? "書房"
										: "房間";

			let summary = `${baseRoomType}位於${directionName}方，2025年飛星${starInfo?.star}屬${element}，為${isLucky ? "吉星" : "凶星"}方位。`;

			if (isLucky) {
				const roomSpecificBenefits = {
					臥室: `睡眠品質將顯著提升，有助於身心靈的深度修復和再生。此方位特別利於夫妻感情和諧發展，單身者亦有機會遇到理想伴侶。2025年在此休息將增強個人磁場和魅力，促進身體健康恢復，特別對神經系統和內分泌有良好調節作用。建議善用此吉位進行冥想或靜心活動，有助於提升直覺力和靈性成長。`,
					客廳: `家庭和諧氣場將大幅提升，成為聚集正能量的重要場所。此方位極利於人際關係發展，容易吸引貴人相助和商業機會。2025年家庭聚會將特別愉快融洽，親子關係也會因此方位的正面影響而更加親密。建議多在此處接待客人和舉辦慶祝活動，善用吉星能量來拓展人脈網絡和社會地位。`,
					餐廳: `用餐氛圍將異常溫馨和諧，食物的營養價值和美味程度都會因正向能量而提升。此方位有助於促進家人之間的深度交流和情感連結，用餐時光將成為家庭凝聚力的重要來源。2025年在此進餐有利於消化吸收和身體健康，特別對腸胃功能有正面影響。`,
					廚房: `烹飪過程將充滿創意和靈感，製作的食物會帶有特別的正能量和療癒效果。此方位極利於女主人的整體運勢提升，包括健康、財運和家庭地位。2025年透過用心烹飪，不僅能滋養家人身體，更能增進家庭和睦與財富累積。建議多在此處準備重要節日的餐點。`,
					浴室: `雖為水氣重地，但吉星的正面影響能有效化解濕氣過重的問題，轉化為淨化身心的神聖空間。此方位有助於個人的深度清潔和能量淨化，洗浴過程將成為釋放負面情緒和重新充電的重要儀式。2025年善用此空間進行身心靈的調理和修復，有助於提升個人魅力和健康水準。`,
					書房: `文昌運勢達到巢峯狀態，學習和工作效率將有顯著提升。此方位極利於創意發想、重要決策和知識吸收，是2025年事業發展的重要助力。無論是學生考試、職場升遷或創業規劃，都能在此獲得智慧啟發和靈感指導。建議將重要文件和獎狀放置於此，強化文昌氣場。`,
				};

				summary +=
					roomSpecificBenefits[baseRoomType] ||
					"此方位蘊含強大的正向能量，將為居住者帶來各方面的運勢提升和生活品質改善。建議多加利用此空間進行重要活動，讓吉星的正面影響發揮最大效用。";
			} else {
				const roomSpecificChallenges = {
					臥室: `睡眠品質可能受到干擾，容易出現失眠、惡夢或睡不安穩的狀況。此方位對感情運勢也有不利影響，夫妻間可能產生誤解或冷戰，單身者桃花運較為低迷。2025年需特別注意身體健康，尤其是神經系統和心血管方面的問題。建議調整床位朝向，避免頭部直接面對此凶方，並加強房間的正向能量布置。`,
					客廳: `家庭氛圍容易緊張，成員間的意見分歧和爭執頻率可能增加。此方位對人際關係有負面影響，容易與親友產生摩擦，商業往來也可能遇到阻礙或欺詐。2025年需謹慎處理家庭聚會和社交活動，避免在此進行重要談判或簽約。建議保持空間明亮整潔，並擺放化煞物品來平衡負面氣場。`,
					餐廳: `用餐氣氛可能較為沉悶或緊張，家人聚餐時容易發生爭執或不愉快。此方位對消化系統有不良影響，可能導致食慾不振、消化不良或腸胃疾病。2025年需注意飲食衛生和營養均衡，避免在心情不佳時進食。建議改善餐廳照明和通風，並在用餐前進行簡單的淨化儀式。`,
					廚房: `烹飪過程容易發生意外，如燙傷、切傷或火災等安全問題。此方位對食物品質有負面影響，容易導致食材變質或烹調失敗。2025年需特別注意廚房安全和衛生，定期檢查瓦斯管線和電器設備。建議加強通風除濕，並在爐灶附近放置化煞物品。`,
					浴室: `濕氣和負能量容易累積，可能導致細菌滋生、異味產生或排水不良等問題。此方位對身體健康有不利影響，特別是皮膚疾病、呼吸道問題或泌尿系統疾病。2025年需加強通風除濕和定期深度清潔，避免長時間逗留。建議安裝強力排風扇，並定期更換防霉材料。`,
					書房: `學習和工作效率明顯下降，容易分心、記憶力衰退或決策錯誤。此方位對事業發展有阻礙作用，可能遇到小人陷害或重要機會流失。2025年需謹慎處理重要文件和合約，避免在此進行關鍵決策。建議重新規劃工作區域，並透過風水調理來提升文昌運勢。`,
				};

				summary +=
					roomSpecificChallenges[baseRoomType] ||
					"此方位的負面能量可能對日常生活造成各種不便和困擾。2025年需要透過適當的風水化解和空間調整，來減輕凶星帶來的不利影響。";
			}

			return summary;
		};

		const yearSummary = generateRoomSpecific2025Summary(
			roomType,
			directionName,
			starInfo,
			element,
			isLucky
		);

		// Generate specific recommendations based on room type, direction, element and luck
		const getSpecificRecommendations = (
			roomType,
			direction,
			element,
			isLucky,
			starName
		) => {
			const baseRoomType =
				roomType.includes("睡房") || roomType.includes("臥室")
					? "睡房"
					: roomType.includes("客廳")
						? "客廳"
						: roomType.includes("飯廳") || roomType.includes("餐廳")
							? "飯廳"
							: roomType.includes("廚房")
								? "廚房"
								: roomType.includes("浴室") ||
									  roomType.includes("廁所")
									? "浴室"
									: "客廳";

			if (isLucky) {
				// Lucky position recommendations
				const recommendations = {
					睡房: {
						furniture: [
							`床頭宜靠${directionName}牆擺放，充分吸收吉星能量`,
							"選用天然材質床具，如實木床架增強穩定氣場",
							"設置柔和床頭燈，營造溫馨休息環境",
							"保持臥室整潔有序，利於正能量流通",
						],
						colors:
							element === "金"
								? [
										"使用白色、金色床單被套增強金氣",
										"配置水晶擺件或金屬裝飾",
									]
								: element === "木"
									? [
											"採用綠色、青色系寢具強化木元素",
											"擺放小型綠植淨化空氣",
										]
									: element === "水"
										? [
												"選用藍色、黑色調營造寧靜氛圍",
												"可放置小型流水擺設",
											]
										: element === "火"
											? [
													"使用暖色調寢具如紅色、橙色",
													"增設溫暖照明提升火能量",
												]
											: [
													"採用黃色、米色系營造穩重感",
													"配置陶瓷或石材小擺件",
												],
						habits: [
							"保持規律作息時間，充分利用吉位能量",
							"睡前可進行冥想或閱讀等正面活動",
							"定期更換床單被套，保持清潔磁場",
							"早晨起床後立即開窗通風",
						],
						items:
							element === "金"
								? [
										"擺放銅製風鈴或金屬工藝品",
										"使用白水晶球增強正能量",
									]
								: element === "木"
									? [
											"放置富貴竹或綠蘿等生命力強植物",
											"擺放木質香薰盒",
										]
									: element === "水"
										? [
												"可設置小型魚缸或水晶球",
												"使用藍寶石等水性寶石",
											]
										: element === "火"
											? [
													"擺放紅瑪瑙或紫水晶",
													"設置暖色調檯燈",
												]
											: [
													"放置黃水晶或瑪瑙擺件",
													"使用檀香或沉香淨化空間",
												],
					},
					客廳: {
						furniture: [
							`沙發背靠${directionName}實牆，面向室內開闊空間`,
							"茶几選用圓形或橢圓形，促進氣場流通",
							"設置充足採光，保持空間明亮開闊",
							"家具排列有序，避免阻礙氣流",
						],
						colors:
							element === "金"
								? [
										"使用白色、銀色系沙發和窗簾",
										"配置金屬材質茶几或裝飾",
									]
								: element === "木"
									? [
											"採用綠色系抱枕和植栽裝飾",
											"選用實木家具增強木氣",
										]
									: element === "水"
										? [
												"使用深藍、黑色系裝飾品",
												"可設置水景或魚缸",
											]
										: element === "火"
											? [
													"採用紅色、紫色抱枕增添活力",
													"使用溫暖色調燈具",
												]
											: [
													"選用黃色、咖啡色系家具",
													"配置陶瓷或石材裝飾品",
												],
						habits: [
							"增加在客廳的家庭聚會時間",
							"定期播放輕鬆音樂提升氣場",
							"保持空間整潔，定期清潔打掃",
							"多在此進行正面社交活動",
						],
						items:
							element === "金"
								? [
										"擺放銅製裝飾品或金屬雕塑",
										"使用白色或金色花瓶",
									]
								: element === "木"
									? [
											"放置大型綠植如發財樹",
											"擺放木雕或竹製工藝品",
										]
									: element === "水"
										? [
												"設置流水擺設或水晶球",
												"可養觀賞魚增添生氣",
											]
										: element === "火"
											? [
													"擺放紅色花卉或暖色裝飾",
													"使用蠟燭或香薰燈",
												]
											: [
													"放置黃水晶或瑪瑙球",
													"擺設陶瓷或石製工藝品",
												],
					},
					飯廳: {
						furniture: [
							`餐桌宜置於${directionName}方位，增強用餐正能量`,
							"選用圓形或橢圓形餐桌促進和諧",
							"餐廳照明充足明亮，營造溫馨用餐環境",
							"餐具櫃整齊收納，保持空間有序",
						],
						colors:
							element === "金"
								? [
										"使用白色或米色餐具增強金氣",
										"配置金屬餐具或裝飾",
									]
								: element === "木"
									? [
											"採用綠色餐墊或木質餐具",
											"擺放綠色植物淨化用餐環境",
										]
									: element === "水"
										? [
												"選用藍色或黑色餐具",
												"可設置小型水景裝飾",
											]
										: element === "火"
											? [
													"使用紅色餐具或暖色桌布",
													"增設溫暖用餐燈光",
												]
											: [
													"採用黃色、咖啡色系餐具",
													"配置陶瓷餐具增強土氣",
												],
						habits: [
							"增加家庭共餐時間，促進感情交流",
							"用餐時播放柔和音樂營造和諧氛圍",
							"餐後及時清潔，保持餐廳整潔",
							"多準備營養豐富的食物",
						],
						items:
							element === "金"
								? [
										"擺放金屬水果盤或裝飾品",
										"使用銀質或不鏽鋼餐具",
									]
								: element === "木"
									? [
											"放置小型盆栽或鮮花",
											"使用木質托盤或餐具",
										]
									: element === "水"
										? [
												"可設置小水缸或水晶擺設",
												"使用深色陶瓷餐具",
											]
										: element === "火"
											? [
													"擺放紅色花卉或暖色裝飾",
													"使用暖色調桌燈",
												]
											: [
													"放置黃色花卉或水果",
													"使用陶瓷或土製餐具",
												],
					},
					廚房: {
						furniture: [
							`爐灶面向${directionName}吉方，增強烹飪正能量`,
							"廚具整齊收納在櫃中，保持檯面清潔",
							"設置充足照明和良好通風設備",
							"工作動線流暢，避免過於擁擠",
						],
						colors:
							element === "金"
								? [
										"使用不鏽鋼廚具增強金屬能量",
										"採用白色系廚房用品",
									]
								: element === "木"
									? ["選用綠色系廚房用品", "可擺放香草植物"]
									: element === "水"
										? ["使用深色系廚具", "保持充足清水供應"]
										: element === "火"
											? [
													"採用紅色系廚房用品增強火氣",
													"使用溫暖色調照明",
												]
											: [
													"選用黃色、咖啡色廚具",
													"使用陶瓷或土製用品",
												],
						habits: [
							"多在家烹飪健康營養食物",
							"使用新鮮食材，避免過期食品",
							"烹飪後立即清潔，保持廚房整潔",
							"定期清理油煙，保持空氣清新",
						],
						items:
							element === "金"
								? ["使用優質不鏽鋼鍋具", "擺放金屬風鈴或裝飾"]
								: element === "木"
									? [
											"種植香草或小型蔬菜",
											"使用木質砧板和餐具",
										]
									: element === "水"
										? ["保持充足飲用水", "可放置小型淨水器"]
										: element === "火"
											? [
													"使用紅色廚房用品",
													"保持爐火旺盛整潔",
												]
											: [
													"使用陶瓷鍋具和器皿",
													"可放置小型鹽燈",
												],
					},
					浴室: {
						furniture: [
							"保持浴室乾燥通風，安裝良好排氣設備",
							"鏡子保持清潔明亮，增強正能量反射",
							"使用防滑地墊，確保安全舒適",
							"毛巾和用品整齊收納",
						],
						colors:
							element === "金"
								? ["使用白色或銀色浴室用品", "配置金屬材質配件"]
								: element === "木"
									? ["採用綠色系毛巾和用品", "可放置耐濕植物"]
									: element === "水"
										? [
												"天然適合水元素，使用藍色系裝飾",
												"保持良好水流",
											]
										: element === "火"
											? [
													"使用暖色調毛巾和裝飾",
													"增設暖色照明",
												]
											: [
													"採用黃色、米色系用品",
													"使用天然石材裝飾",
												],
						habits: [
							"定期泡澡放鬆身心，吸收吉位能量",
							"使用天然沐浴用品護膚養生",
							"保持整潔乾爽，定期深度清潔",
							"用後及時通風除濕",
						],
						items:
							element === "金"
								? [
										"使用金屬香皂盒或配件",
										"可放置白水晶淨化空間",
									]
								: element === "木"
									? [
											"放置小型耐濕植物如竹子",
											"使用木質浴室配件",
										]
									: element === "水"
										? [
												"保持良好水質，可用濾水器",
												"使用藍寶石或水晶",
											]
										: element === "火"
											? [
													"使用暖色毛巾和浴簾",
													"可點燃香薰蠟燭",
												]
											: [
													"使用天然石材或陶瓷配件",
													"可放置鹽燈淨化",
												],
					},
				};
				return recommendations[baseRoomType] || recommendations["客廳"];
			} else {
				// Inauspicious position remedies
				const remedies = {
					睡房: {
						furniture: [
							`盡量避免床頭靠${directionName}牆，如無法調整請使用厚重床頭板阻隔`,
							"床位遠離門窗直沖，使用屏風或布簾遮擋",
							"使用厚重窗簾阻擋外來煞氣",
							"減少在此房間的停留時間，避免長期睡眠",
						],
						colors:
							element === "金"
								? [
										"避免過多白色金屬裝飾，減少金氣過盛",
										"不宜擺放銳利金屬物品",
									]
								: element === "木"
									? [
											"避免過多綠色植物，防止木氣過旺",
											"勿放置大型植栽",
										]
									: element === "水"
										? [
												"避免深藍黑色系寢具，防水氣過重",
												"勿設置魚缸水景",
											]
										: element === "火"
											? [
													"避免紅色橙色等火系顏色",
													"減少暖色調燈光照明",
												]
											: [
													"避免過多黃色土色系裝飾",
													"勿擺放厚重石材擺件",
												],
						habits: [
							"減少在此房間的停留和休息時間",
							"避免在床上做重要決策或工作",
							"早睡早起，調整作息避開凶時",
							"定期更換床單，保持清潔磁場",
						],
						items:
							element === "金"
								? [
										"擺放植物化解金煞，如綠蘿吸收負能量",
										"使用木質擺件平衡金氣",
									]
								: element === "木"
									? [
											"放置金屬風鈴化解木煞",
											"使用白水晶平衡木氣",
										]
									: element === "水"
										? [
												"擺放陶瓷或土製品吸收水氣",
												"可用黃水晶化解",
											]
										: element === "火"
											? [
													"放置水晶球或水景化解火煞",
													"使用藍色物品降火氣",
												]
											: [
													"擺放金屬風鈴或銅製品化土煞",
													"使用白色物品平衡土氣",
												],
					},
					客廳: {
						furniture: [
							`避免沙發背靠${directionName}牆，改為側向擺放`,
							"家具避免尖角設計，選用圓潤造型",
							"保持通道暢通，避免氣流阻塞",
							"減少在此區域的聚會活動時間",
						],
						colors:
							element === "金"
								? [
										"減少白色銀色裝飾，避免金氣過盛",
										"不宜大量金屬傢俱",
									]
								: element === "木"
									? ["避免過多綠色系裝飾", "減少大型木質家具"]
									: element === "水"
										? [
												"避免深藍黑色系裝飾",
												"勿設置大型水景",
											]
										: element === "火"
											? [
													"避免紅色紫色等暖色調",
													"減少強烈照明",
												]
											: [
													"避免過多黃褐色系",
													"減少厚重石材裝飾",
												],
						habits: [
							"減少長時間在此區域聚會",
							"避免激烈討論或爭吵",
							"定期清潔淨化空間磁場",
							"播放柔和音樂緩解負能量",
						],
						items:
							element === "金"
								? ["擺放綠色植物化金煞", "使用木質屏風遮擋"]
								: element === "木"
									? [
											"放置金屬擺件平衡木氣",
											"使用白色裝飾化解",
										]
									: element === "水"
										? [
												"擺放黃水晶或土製品",
												"使用暖色燈光平衡",
											]
										: element === "火"
											? [
													"放置水晶球或藍色物品",
													"可用小型水景降火",
												]
											: [
													"擺放銅製風鈴或金屬品",
													"使用白色物品化土煞",
												],
					},
					飯廳: {
						furniture: [
							`餐桌避免正對${directionName}方，改為斜向擺放`,
							"選用圓桌化解尖角煞氣",
							"餐廳燈光柔和，避免過於強烈",
							"減少在此用餐的頻率",
						],
						colors:
							element === "金"
								? ["避免全白色或金屬色餐具", "減少銀質裝飾品"]
								: element === "木"
									? [
											"避免過多木色或綠色餐具",
											"勿擺放大型植物",
										]
									: element === "水"
										? ["避免深色系餐具", "勿設置水景裝飾"]
										: element === "火"
											? [
													"避免紅色系餐具桌布",
													"減少暖色調照明",
												]
											: [
													"避免黃色土色系餐具",
													"減少陶瓷重器皿",
												],
						habits: [
							"簡化用餐方式，快速用餐",
							"避免長時間聚餐聊天",
							"餐後立即清潔，不留剩菜",
							"用餐時保持安靜祥和",
						],
						items:
							element === "金"
								? ["擺放綠色植物化解金煞", "使用木製餐具平衡"]
								: element === "木"
									? ["放置小型金屬擺件", "使用白色餐具化解"]
									: element === "水"
										? [
												"擺放黃色花卉或水果",
												"使用陶瓷餐具平衡",
											]
										: element === "火"
											? [
													"放置藍色裝飾或小水缸",
													"使用冷色調餐具",
												]
											: [
													"擺放金屬風鈴化土煞",
													"使用白色或金色餐具",
												],
					},
					廚房: {
						furniture: [
							`爐灶避開${directionName}方位，如無法調整需加裝遮擋`,
							"保持廚房乾淨整潔，避免油污積聚",
							"加強通風設備，快速排除油煙",
							"減少複雜烹飪，簡化料理方式",
						],
						colors:
							element === "金"
								? ["避免過多不鏽鋼廚具", "減少銀白色用品"]
								: element === "木"
									? ["避免過多木質用品", "勿擺放大型植物"]
									: element === "水"
										? [
												"控制用水量，避免積水",
												"勿設置額外水景",
											]
										: element === "火"
											? [
													"避免紅色廚具，控制火候",
													"減少暖色照明",
												]
											: [
													"避免過多陶瓷土製品",
													"減少厚重器皿",
												],
						habits: [
							"簡化烹飪方式，避免油炸煎炒",
							"烹飪時間縮短，快進快出",
							"立即清潔，不留過夜污垢",
							"定期深度清潔，淨化磁場",
						],
						items:
							element === "金"
								? ["擺放小型植物化金煞", "使用木質砧板平衡"]
								: element === "木"
									? ["放置小型金屬擺件", "使用白色廚具化解"]
									: element === "水"
										? [
												"擺放鹽燈或土製品",
												"使用黃色廚具平衡",
											]
										: element === "火"
											? [
													"放置小水缸或藍色用品",
													"使用冷色廚具降火",
												]
											: [
													"擺放銅製品或金屬風鈴",
													"使用白色廚具化土煞",
												],
					},
					浴室: {
						furniture: [
							"加強排風除濕，避免濕氣積聚產生陰煞",
							"鏡子避免正對門口，可用簾子遮擋",
							"保持乾燥整潔，定期深度清潔消毒",
							"縮短在浴室的停留時間",
						],
						colors:
							element === "金"
								? ["避免全白色裝飾", "減少金屬配件使用"]
								: element === "木"
									? ["避免過多綠色裝飾", "勿放置植物"]
									: element === "水"
										? [
												"雖為水空間但需控制水氣",
												"避免深藍黑色過多",
											]
										: element === "火"
											? ["避免紅色暖色調", "減少暖色照明"]
											: [
													"避免過多黃色土色",
													"減少厚重陶瓷裝飾",
												],
						habits: [
							"縮短洗浴時間，快速清潔",
							"避免長時間泡澡放鬆",
							"加強通風換氣，立即排濕",
							"定期用鹽水或白醋清潔消毒",
						],
						items:
							element === "金"
								? ["擺放小型綠植化金煞", "使用木質配件平衡"]
								: element === "木"
									? ["放置小型金屬配件", "使用白色用品化解"]
									: element === "水"
										? [
												"擺放鹽燈或陶瓷品",
												"使用黃色毛巾平衡",
											]
										: element === "火"
											? [
													"放置藍色配件或小水晶",
													"使用冷色調用品",
												]
											: [
													"擺放銅製配件化土煞",
													"使用白色或金色用品",
												],
					},
				};
				return remedies[baseRoomType] || remedies["客廳"];
			}
		};

		const recommendations = getSpecificRecommendations(
			roomType,
			direction,
			element,
			isLucky,
			starInfo?.star
		);

		// Generate comprehensive advice combining feng shui principles
		const comprehensiveAdvice = generateComprehensiveAdvice(
			roomType,
			direction,
			element,
			isLucky,
			starInfo,
			bazhaiName
		);

		return {
			yearSummary,
			recommendations,
			comprehensiveAdvice,
			isLucky,
		};
	};

	// Generate comprehensive and elaborate feng shui advice for each room
	const generateComprehensiveAdvice = (
		roomType,
		direction,
		element,
		isLucky,
		starInfo,
		bazhaiName
	) => {
		const baseRoomType =
			roomType.includes("睡房") ||
			roomType.includes("臥室") ||
			roomType.includes("bedroom")
				? "臥室"
				: roomType.includes("客廳") || roomType.includes("living")
					? "客廳"
					: roomType.includes("飯廳") ||
						  roomType.includes("餐廳") ||
						  roomType.includes("dining")
						? "餐廳"
						: roomType.includes("廚房") ||
							  roomType.includes("kitchen")
							? "廚房"
							: roomType.includes("浴室") ||
								  roomType.includes("廁所") ||
								  roomType.includes("bathroom")
								? "浴室"
								: roomType.includes("書房") ||
									  roomType.includes("study")
									? "書房"
									: "房間";

		const directionNames = {
			north: "北方",
			south: "南方",
			east: "東方",
			west: "西方",
			northEast: "東北方",
			southEast: "東南方",
			southWest: "西南方",
			northWest: "西北方",
		};

		const directionChinese = directionNames[direction] || direction;

		// Generate comprehensive advice with 3 detailed sections
		const advice = {
			overall: "",
			seasonal: "",
			personal: "",
		};

		// Overall 2025 year influence analysis (200+ characters)
		if (isLucky) {
			advice.overall = `根據2025年玄空飛星分析，此${baseRoomType}位於${directionChinese}的${starInfo?.star}吉星位置，將為居住者帶來顯著的正面影響。${element}屬性的吉星能量與${baseRoomType}的功能完美結合，創造出極為有利的風水環境。預期在使用此空間時，將會感受到明顯的能量提升和生活品質改善，各項活動都能獲得宇宙正能量的加持和支持，是2025年的重要吉利方位。`;
		} else {
			advice.overall = `2025年此${baseRoomType}位於${directionChinese}的${starInfo?.star}凶星影響下，需要特別謹慎處理和積極化解。${element}屬性的負面能量可能對${baseRoomType}的正常使用造成干擾，影響居住者的身心健康和運勢發展。透過適當的風水調理和空間改善，可以有效減輕凶星的不利影響，甚至轉化為成長和學習的機會，關鍵在於正確理解和應對。`;
		}

		// Seasonal adjustments (120+ characters)
		advice.seasonal = isLucky
			? `春季(2-4月)是強化此${baseRoomType}正能量的最佳時期，建議進行空間重新布置和能量淨化。夏季(5-7月)保持涼爽通風，善用自然光照增強吉星效應。秋季(8-10月)適合添置新的風水擺設，鞏固全年的正面影響。冬季(11-1月)注重保溫和照明，維持穩定的正向氣場，準備迎接下一年的好運。`
			: `春季(2-4月)需要進行徹底的負能量清理，建議大掃除並更換陳舊物品。夏季(5-7月)特別注意通風除濕，防止凶星能量在悶熱環境中加劇。秋季(8-10月)是化解凶煞的關鍵時期，可請專業風水師指導調整。冬季(11-1月)加強照明和保暖，避免陰冷環境強化負面影響。`;

		// Personal cultivation recommendations (150+ characters)
		advice.personal = isLucky
			? `善用此${baseRoomType}的吉星能量來進行個人修養和靈性成長。建議定期在此進行冥想、祈福或正念練習，讓正能量深入潛意識層面。可以將個人的重要願望和目標寫下來放置在此，借助吉星力量加速實現。培養感恩心態，每次使用此空間時都心懷感謝，強化與宇宙正能量的連結。透過積極正面的心念和行為，與此方位的吉星產生良性互動。`
			: `面對此${baseRoomType}的凶星影響，需要加強個人的心理調適和能量防護。建議培養堅韌不拔的意志力，將挑戰視為成長的機會。定期進行心理清理，釋放負面情緒和壓力。可以透過誦經、禱告或正向肯定來提升個人振動頻率，抵禦凶星的負面影響。保持樂觀積極的心態，相信困難終將過去，好運即將到來。`;

		return advice;
	};

	// Parse AI analysis text into structured format
	// Parse AI analysis response - completely rely on AI generated JSON
	const parseAIAnalysis = (
		aiText,
		room,
		starInfo,
		bazhaiName,
		directionName
	) => {
		try {
			// Try to parse JSON response from AI first
			let aiData;
			try {
				// Multiple strategies to extract JSON from AI response
				let jsonContent = aiText;

				// Strategy 1: Look for complete JSON object
				let jsonMatch = aiText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					jsonContent = jsonMatch[0];
				} else {
					// Strategy 2: Look for JSON after prompt instruction
					const afterPrompt =
						aiText.split("請按以下嚴格的JSON格式輸出：")[1];
					if (afterPrompt) {
						jsonMatch = afterPrompt.match(/\{[\s\S]*\}/);
						if (jsonMatch) {
							jsonContent = jsonMatch[0];
						}
					}
				}

				// Strategy 3: Try to clean up incomplete JSON
				if (!jsonMatch) {
					// Look for JSON that starts but might be truncated
					const startMatch = aiText.match(/\{[\s\S]*$/);
					if (startMatch) {
						jsonContent = startMatch[0];
						// Try to close incomplete JSON
						const openBraces = (jsonContent.match(/\{/g) || [])
							.length;
						const closeBraces = (jsonContent.match(/\}/g) || [])
							.length;
						if (openBraces > closeBraces) {
							jsonContent += "}".repeat(openBraces - closeBraces);
						}
					}
				}
				aiData = JSON.parse(jsonContent);
			} catch (parseError) {
				// Advanced text extraction as fallback
				aiData = extractStructuredContent(aiText, room, starInfo);
			}

			// Validate and return structured analysis
			const validated = validateAIStructure(aiData, room, starInfo);
			return validated;
		} catch (error) {
			// Return minimal loading structure - no hardcoded content
			return createLoadingStructure(room, starInfo);
		}
	};

	// Advanced text extraction when JSON parsing fails
	const extractStructuredContent = (aiText, room, starInfo) => {
		const data = {
			yearSummary: "",
			recommendations: {
				furniture: [],
				colors: [],
				habits: [],
				items: [],
			},
			comprehensiveAdvice: {
				overall: "",
				seasonal: "",
				personal: "",
			},
		};

		// Extract year summary - look for comprehensive patterns
		const yearPatterns = [
			/2025年[^。]*。/,
			new RegExp(`${room.roomType}位於[^。]*。`, "g"),
			/飛星[^。]*屬[^。]*。/,
			/八宅位置[^。]*。/,
		];

		for (const pattern of yearPatterns) {
			const match = aiText.match(pattern);
			if (match) {
				data.yearSummary = match[0];
				break;
			}
		}

		// Extract recommendations using advanced parsing
		const extractRecommendationSection = (sectionName, keywords) => {
			const results = [];
			keywords.forEach((keyword) => {
				// Look for sections with headers and bullet points
				const sectionRegex = new RegExp(
					`${keyword}[：:]([\\s\\S]*?)(?=\\n\\s*[\\w\\u4e00-\\u9fa5]+[：:]|$)`,
					"g"
				);
				const matches = aiText.match(sectionRegex);
				if (matches) {
					matches.forEach((match) => {
						// Extract bullet points or numbered items
						const items = match.match(
							/[•·▪▫\-\d+\.]\s*([^•·▪▫\-\n]+)/g
						);
						if (items) {
							items.forEach((item) => {
								const cleaned = item
									.replace(/[•·▪▫\-\d+\.]\s*/, "")
									.trim();
								if (cleaned.length > 15) results.push(cleaned);
							});
						}
					});
				}
			});
			return results.length > 0
				? results
				: [`正在生成${room.roomType}${sectionName}建議...`];
		};

		// Extract each recommendation category
		data.recommendations.furniture = extractRecommendationSection("家具", [
			"家具擺放",
			"擺放建議",
			"配置建議",
			"朝向建議",
		]);
		data.recommendations.colors = extractRecommendationSection("色彩", [
			"色彩建議",
			"顏色搭配",
			"元素色彩",
			"配色方案",
		]);
		data.recommendations.habits = extractRecommendationSection("習慣", [
			"生活習慣",
			"行為建議",
			"日常指導",
			"個人化行為",
		]);
		data.recommendations.items = extractRecommendationSection("物品", [
			"風水用品",
			"擺設建議",
			"化煞物品",
			"調理物品",
		]);

		// Extract comprehensive advice sections
		const adviceExtraction = (key, keywords) => {
			for (const keyword of keywords) {
				const regex = new RegExp(`${keyword}[：:]([^。]*[。])`, "g");
				const match = aiText.match(regex);
				if (match && match[0]) {
					return match[0].replace(/[^：:]*[：:]/, "").trim();
				}
			}
			return `正在生成${room.roomType}${key}分析...`;
		};

		data.comprehensiveAdvice.overall = adviceExtraction("整體", [
			"整體格局分析",
			"格局分析",
			"整體分析",
		]);
		data.comprehensiveAdvice.seasonal = adviceExtraction("季節", [
			"季節性注意事項",
			"季節建議",
			"四季調整",
		]);
		data.comprehensiveAdvice.personal = adviceExtraction("個人", [
			"個人化建議",
			"個人建議",
			"專屬建議",
		]);

		return data;
	};

	// Validate AI structure and ensure completeness
	const validateAIStructure = (aiData, room, starInfo) => {
		const validated = {
			yearSummary:
				aiData.yearSummary ||
				`正在為${room.roomType}生成2025年AI風水分析...`,
			recommendations: {
				furniture: ensureArray(
					aiData.recommendations?.furniture,
					`${room.roomType}家具建議`
				),
				colors: ensureArray(
					aiData.recommendations?.colors,
					`${room.roomType}色彩建議`
				),
				habits: ensureArray(
					aiData.recommendations?.habits,
					`${room.roomType}習慣建議`
				),
				items: ensureArray(
					aiData.recommendations?.items,
					`${room.roomType}物品建議`
				),
			},
			comprehensiveAdvice: {
				overall:
					aiData.comprehensiveAdvice?.overall ||
					`正在深度分析${room.roomType}整體風水格局...`,
				seasonal:
					aiData.comprehensiveAdvice?.seasonal ||
					`正在生成${room.roomType}季節性風水建議...`,
				personal:
					aiData.comprehensiveAdvice?.personal ||
					`正在結合命卦生成個人化建議...`,
			},
			isLucky: starInfo?.type === "吉",
		};

		return validated;
	};

	// Ensure array format for recommendations
	const ensureArray = (data, fallbackPrefix) => {
		if (Array.isArray(data) && data.length > 0) {
			return data;
		}
		return [`正在生成${fallbackPrefix}...`];
	};

	// Create loading structure when AI completely fails
	const createLoadingStructure = (room, starInfo) => {
		return {
			yearSummary: `正在連接AI為${room.roomType}生成專業風水分析，請稍候...`,
			recommendations: {
				furniture: [`正在生成${room.roomType}專業家具擺放建議...`],
				colors: [`正在生成${room.roomType}專業色彩風水建議...`],
				habits: [`正在生成${room.roomType}個人化生活指導...`],
				items: [`正在生成${room.roomType}專業風水用品建議...`],
			},
			comprehensiveAdvice: {
				overall: `正在進行${room.roomType}深度風水格局分析，請稍候...`,
				seasonal: `正在生成${room.roomType}四季風水調整指南...`,
				personal: `正在結合您的個人命卦生成專屬建議...`,
			},
			isLucky: starInfo?.type === "吉",
		};
	};
	// System now completely relies on AI analysis - no hardcoded fallbacks

	// Helper function for room-specific 2025 summary (moved from generateRoomAnalysis)
	const generateRoomSpecific2025Summary = (
		roomType,
		directionName,
		starInfo,
		element,
		isLucky
	) => {
		const baseRoomType =
			roomType.includes("睡房") ||
			roomType.includes("臥室") ||
			roomType.includes("bedroom")
				? "臥室"
				: roomType.includes("客廳") || roomType.includes("living")
					? "客廳"
					: roomType.includes("飯廳") ||
						  roomType.includes("餐廳") ||
						  roomType.includes("dining")
						? "餐廳"
						: roomType.includes("廚房") ||
							  roomType.includes("kitchen")
							? "廚房"
							: roomType.includes("浴室") ||
								  roomType.includes("廁所") ||
								  roomType.includes("bathroom")
								? "浴室"
								: roomType.includes("書房") ||
									  roomType.includes("study")
									? "書房"
									: "房間";

		if (isLucky) {
			const roomSpecificBenefits = {
				臥室: "有助於提升睡眠品質和夫妻感情和諧，特別利於身體健康恢復和精神能量補充",
				客廳: "促進家庭和睦與人際關係，增強家庭凝聚力和社交運勢，有利於接待貴人",
				餐廳: "有利於家庭用餐氣氛和食物營養吸收，促進家人之間情感交流和身體健康",
				廚房: "增強烹飪食物的正能量，有利於家人健康和財運累積，特別助益女主人運勢",
				浴室: "雖為水氣重地，但吉星可化解水氣過重問題，有助於個人清潔淨化和健康維護",
				書房: "極利文昌運勢和學習工作效率，有助於智慧開發和事業進展，適合重要決策",
			};

			return `${baseRoomType}位於${directionName}方，2025年飛星${starInfo?.star}屬${element}，為吉星方位。${roomSpecificBenefits[baseRoomType] || "此方位有利於提升整體運勢"}，建議善用此空間的正向能量，可作為日常重要活動區域。`;
		} else {
			const roomSpecificConcerns = {
				臥室: "可能影響睡眠品質和身體健康，需特別注意化解負能量以避免失眠或情緒不穩",
				客廳: "容易導致家庭糾紛和人際關係緊張，需要化解煞氣以維護家庭和諧",
				餐廳: "可能影響食慾和消化系統，也容易在用餐時產生爭執，需要調和氣場",
				廚房: "容易導致烹飪意外和食物變質，也可能影響女主人健康和家庭財運",
				浴室: "雖本為污穢之地，但凶星加重負面影響，需加強清潔和化解濕氣煞氣",
				書房: "不利學習和工作效率，容易分心或決策錯誤，需要化解煞氣以維持清晰思維",
			};

			return `${baseRoomType}位於${directionName}方，2025年飛星${starInfo?.star}屬${element}，為凶星方位。${roomSpecificConcerns[baseRoomType] || "此方位可能產生不利影響"}，需要特別注意化解負面能量和調整使用方式。`;
		}
	};

	// Handle room tag click to scroll to corresponding room section
	const scrollToRoom = (roomIndex) => {
		setActiveRoomIndex(roomIndex);
	};

	// 計算個人命卦信息
	const calculatePersonalInfo = () => {
		const birthYear = parseInt(userProfile.birthYear);
		const birthMonth = parseInt(userProfile.birthMonth) || 6;
		const birthDay = parseInt(userProfile.birthDay) || 26;
		// Don't convert gender if it's already in Chinese
		const gender =
			userProfile.gender === "male"
				? "男"
				: userProfile.gender === "female"
					? "女"
					: userProfile.gender;

		return {
			birthYear,
			birthMonth,
			birthDay,
			gender,
			age: 2025 - birthYear,
			yearlyAdvice: yearlyAdvice || null,
		};
	};

	const personalInfo = calculatePersonalInfo();

	const compatibilityScore = getCompatibilityScore();

	return (
		<div
			className="w-full sm:w-[95%] lg:w-[85%] mt-6 sm:mt-8 lg:mt-10 min-h-screen p-3 sm:p-4 lg:p-6"
			style={{ backgroundColor: "#EFEFEF" }}
		>
			{/* Header Section */}
			<div className="p-3 mb-4 sm:p-4 lg:p-6">
				<div className="flex flex-col items-center justify-center lg:flex-row lg:items-start lg:justify-start">
					<h1
						style={{
							fontFamily: "Noto Serif TC, serif",
							fontWeight: 900,
							fontSize: "clamp(32px, 8vw, 56px)",
							color: "#374A37",
							lineHeight: 1.1,
							WebkitTextStroke: "1px #374A37",
						}}
						className="mb-4 text-center lg:text-left lg:mb-10"
					>
						全屋風水分析
					</h1>
				</div>
				<div className="w-full px-3 pb-6 mx-auto mb-1 text-center sm:px-4 lg:px-5 sm:pb-8 lg:text-left">
					<p
						style={{
							fontFamily: "Noto Sans HK, sans-serif",
							fontWeight: 400,
							fontSize: "clamp(16px, 4vw, 20px)",
							color: "#000000",
							lineHeight: "clamp(1.6, 2vw, 2.0)",
						}}
					>
						屋主的個人八宅吉位是根本，八宅吉位不會因流年凶星而失效。流年凶星僅是提醒在特定時段內，相關方位需要更加謹慎防範和化解，以避免凶煞激發帶來的不利影響。風水調理是一種動態與靜態的結合，類似於醫療中對長期體質和季節性流感的關係，需要針對性地進行調整，兩者相輔相成，並不是彼此替代的關係。
					</p>
				</div>
			</div>
			{/* 個人命卦 Section */}
			<div
				className="p-3 mb-4 bg-white sm:p-4 lg:p-6"
				style={{
					borderRadius: "clamp(25px, 6vw, 45px)",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
				}}
			>
				{/* Main content with white background and responsive radius */}
				<div className="p-4 bg-white sm:p-6 lg:p-8">
					<div className="flex flex-col lg:flex-row">
						{/* Left side - vertical text (hidden on mobile, 10% on desktop) */}
						<div className="hidden lg:flex lg:w-[10%] items-start justify-center">
							<div
								className="text-[96px] font-extrabold leading-none"
								style={{
									fontFamily: "Noto Serif TC, serif",
									fontWeight: 800,
									color: "#A3B116",
									writingMode: "vertical-rl",
									textOrientation: "upright",
									WebkitTextStroke: "1px #A3B116",
								}}
							>
								個人命卦
							</div>
						</div>

						{/* Right side - responsive width */}
						<div className="w-full lg:w-[90%] lg:pl-8">
							{/* Top section - responsive layout */}
							<div className="flex flex-col gap-4 mb-6 md:flex-row">
								{/* Left part - Trigram */}
								<div className="flex items-center justify-center md:justify-start">
									<img
										src={`/images/life/${localPersonalData?.mingGuaInfo?.trigram || mingGuaInfo.trigram}.png`}
										alt={`${localPersonalData?.mingGuaInfo?.trigram || mingGuaInfo.trigram}卦`}
										className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] object-contain"
									/>
								</div>

								{/* Middle part - Gender and Birthday */}
								<div className="flex-1 space-y-3 sm:space-y-4">
									{/* Top row - Gender and Birthday */}
									<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
										{/* Gender container */}
										<div
											className="w-full sm:w-[154px] h-[60px] sm:h-[89px] rounded-[1000px] flex items-center justify-center"
											style={{
												backgroundColor: "#EFEFEF",
											}}
										>
											<span
												className="text-[24px] sm:text-[32px] font-extrabold"
												style={{
													fontFamily: "Noto Serif TC",
													fontWeight: 800,
													color: "#515151",
												}}
											>
												{personalInfo.gender}
											</span>
										</div>

										{/* Birthday container */}
										<div
											className="flex-1 h-[60px] sm:h-[89px] rounded-[1000px] flex items-center justify-center"
											style={{
												backgroundColor: "#EFEFEF",
											}}
										>
											<span
												className="text-[20px] sm:text-[24px] lg:text-[32px] font-extrabold"
												style={{
													fontFamily: "Noto Serif TC",
													fontWeight: 800,
													color: "#515151",
												}}
											>
												{personalInfo.birthYear}年
												{personalInfo.birthMonth}月
												{personalInfo.birthDay}日
											</span>
										</div>
									</div>

									{/* Bottom row - Group */}
									<div
										className="rounded-[1000px] flex items-center justify-center h-[60px] sm:h-[89px]"
										style={{ backgroundColor: "#567156" }}
									>
										<span
											className="text-[32px] sm:text-[48px] lg:text-[64px] font-extrabold text-white"
											style={{
												fontFamily:
													"Noto Serif TC, serif",
												fontWeight: 800,
												WebkitTextStroke: "1px white",
											}}
										>
											{localPersonalData?.mingGuaInfo
												?.group || mingGuaInfo.group}
										</span>
									</div>
								</div>

								{/* Right part - Element (responsive positioning) */}
								<div
									className="w-full sm:w-[200px] md:w-[150px] border-2 rounded-lg flex flex-col items-center justify-center relative overflow-hidden mx-auto"
									style={{
										borderColor: "#A3B116",
										height: "200px",
									}}
								>
									{/* Element background image */}
									<div
										className="absolute inset-0 bg-no-repeat opacity-50"
										style={{
											backgroundImage: `url(/images/elements/${localPersonalData?.mingGuaInfo?.element || mingGuaInfo.element}.png)`,
											backgroundSize: "80px 80px",
											backgroundPosition: "center 70%",
											zIndex: 0,
										}}
									/>
									<div
										className="text-[24px] sm:text-[32px] mb-2 relative z-10"
										style={{
											color: "#374A37",
											fontFamily: "Noto Serif TC, serif",
											fontWeight: 800,
											WebkitTextStroke: "1px #374A37",
											top: "0%",
											transform: "translateY(-50%)",
										}}
									>
										五行
									</div>
									<div
										className="text-[48px] sm:text-[64px] font-black relative z-10"
										style={{
											fontFamily: "Noto Serif TC, serif",
											fontWeight: 900,
											top: "10%",
											left: "10%",
											color: (() => {
												const element =
													localPersonalData
														?.mingGuaInfo
														?.element ||
													mingGuaInfo.element;
												const elementColors = {
													土: "#DEAB20", // yellow-600
													木: "#567156", // green-600
													水: "#939393", // blue-600
													火: "#B4003C", // red-600
													金: "#B2A062", // yellow-500
												};
												return (
													elementColors[element] ||
													"#567156"
												);
											})(),
											WebkitTextStroke: `1px ${(() => {
												const element =
													localPersonalData
														?.mingGuaInfo
														?.element ||
													mingGuaInfo.element;
												const elementColors = {
													土: "#DEAB20", // yellow-600
													木: "#567156", // green-600
													水: "#939393", // blue-600
													火: "#B4003C", // red-600
													金: "#B2A062", // yellow-500
												};
												return (
													elementColors[element] ||
													"#567156"
												);
											})()}`,
										}}
									>
										{localPersonalData?.mingGuaInfo
											?.element || mingGuaInfo.element}
									</div>
								</div>
							</div>

							{/* Full width element numbers and status */}
							<div className="flex justify-center">
								<div
									className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-25 px-3 sm:px-4 lg:px-5 py-4 sm:py-6 mb-6 sm:mb-8 w-full lg:w-[90%] rounded-full"
									style={{
										boxShadow:
											"0 2px 5.3px rgba(0, 0, 0, 0.25)",
									}}
								>
									{/* Elements section */}
									<div className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:gap-4 lg:gap-6 lg:mb-0">
										{(() => {
											// Calculate wuxing data directly from userProfile
											const birthDateTime =
												userProfile?.birthDate ||
												userProfile?.birthDateTime ||
												(userProfile?.birthYear
													? new Date(
															userProfile.birthYear,
															(userProfile.birthMonth ||
																1) - 1,
															userProfile.birthDay ||
																1,
															userProfile.birthHour ||
																12
														)
													: null);

											if (
												!birthDateTime ||
												!userProfile?.gender
											)
												return (
													<div className="text-sm sm:text-base">
														資料不完整
													</div>
												);

											const genderForWuxing =
												userProfile.gender === "男" ||
												userProfile.gender === "male"
													? "male"
													: "female";
											const currentWuxingData =
												getWuxingData(
													birthDateTime,
													genderForWuxing
												);

											if (!currentWuxingData)
												return (
													<div className="text-sm sm:text-base">
														計算中...
													</div>
												);

											const wuxingCount =
												calculateWuxingCount(
													currentWuxingData
												);
											const elements = [
												{
													name: "土",
													count: wuxingCount.elements
														.土,
													icon: "/images/elements/土.png",
													color: "#DEAB20",
												},
												{
													name: "木",
													count: wuxingCount.elements
														.木,
													icon: "/images/elements/木.png",
													color: "#567156",
												},
												{
													name: "水",
													count: wuxingCount.elements
														.水,
													icon: "/images/elements/水.png",
													color: "#939393",
												},
												{
													name: "火",
													count: wuxingCount.elements
														.火,
													icon: "/images/elements/火.png",
													color: "#B4003C",
												},
												{
													name: "金",
													count: wuxingCount.elements
														.金,
													icon: "/images/elements/金.png",
													color: "#B2A062",
												},
											];

											return elements.map(
												(element, index) => (
													<div
														key={index}
														className="flex items-center space-x-1"
													>
														<img
															src={element.icon}
															alt={element.name}
															className="w-6 h-6 sm:w-8 sm:h-8"
														/>
														<span className="text-sm font-medium text-gray-600 sm:text-md">
															{element.name}
														</span>
														<span
															className={`text-lg sm:text-xl font-bold`}
															style={{
																color: element.color,
															}}
														>
															{element.count}
														</span>
													</div>
												)
											);
										})()}
									</div>

									{/* Status section */}
									<div className="text-sm text-gray-600">
										{(() => {
											// Calculate wuxing data directly from userProfile
											const birthDateTime =
												userProfile?.birthDate ||
												userProfile?.birthDateTime ||
												(userProfile?.birthYear
													? new Date(
															userProfile.birthYear,
															(userProfile.birthMonth ||
																1) - 1,
															userProfile.birthDay ||
																1,
															userProfile.birthHour ||
																12
														)
													: null);

											if (
												!birthDateTime ||
												!userProfile?.gender
											)
												return <div>資料不完整</div>;

											const genderForWuxing =
												userProfile.gender === "男" ||
												userProfile.gender === "male"
													? "male"
													: "female";
											const currentWuxingData =
												getWuxingData(
													birthDateTime,
													genderForWuxing
												);

											if (!currentWuxingData)
												return <div>計算中...</div>;

											const wuxingCount =
												calculateWuxingCount(
													currentWuxingData
												);

											// Check if all elements have at least count 1
											const allElementsPresent =
												Object.values(
													wuxingCount.elements
												).every((count) => count >= 1);

											if (allElementsPresent) {
												return (
													<div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-2">
														<span
															className="text-[24px] sm:text-[30px] font-bold"
															style={{
																color: "#A3B116",
																fontFamily:
																	"Noto Serif TC, serif",
																WebkitTextStroke:
																	"0.5px #A3B116",
															}}
														>
															五行齊全
														</span>
														<span
															className="text-[18px] sm:text-[20px] lg:text-[25px] text-center lg:text-left"
															style={{
																color: "#515151",
																fontFamily:
																	"Noto Serif TC, serif",
															}}
														>
															-
															沒有嚴重缺失某一元素
														</span>
													</div>
												);
											} else {
												// Find missing elements
												const missingElements =
													Object.entries(
														wuxingCount.elements
													)
														.filter(
															([
																element,
																count,
															]) => count === 0
														)
														.map(
															([element]) =>
																element
														);

												const elementColors = {
													土: "#DEAB20", // yellow-600
													木: "#567156", // green-600
													水: "#939393", // blue-600
													火: "#B4003C", // red-600
													金: "#B2A062", // yellow-500
												};

												return (
													<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
														{missingElements.map(
															(
																element,
																index
															) => (
																<div
																	key={
																		element
																	}
																	className="flex items-center space-x-1"
																>
																	<span
																		className="text-[24px] sm:text-[30px] font-bold"
																		style={{
																			color: elementColors[
																				element
																			],
																		}}
																	>
																		{
																			element
																		}
																	</span>
																	<span
																		className="text-[18px] sm:text-[20px] lg:text-[25px]"
																		style={{
																			color: "#515151",
																		}}
																	>
																		缺失
																	</span>
																	{index <
																		missingElements.length -
																			1 && (
																		<span
																			className="text-[18px] sm:text-[20px] lg:text-[25px] mx-1"
																			style={{
																				color: "#515151",
																			}}
																		>
																			、
																		</span>
																	)}
																</div>
															)
														)}
													</div>
												);
											}
										})()}
									</div>
								</div>
							</div>

							{/* Four Pillars section */}
							<div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:mb-8">
								{(() => {
									// Calculate wuxing data directly from userProfile
									const birthDateTime =
										userProfile?.birthDate ||
										userProfile?.birthDateTime ||
										(userProfile?.birthYear
											? new Date(
													userProfile.birthYear,
													(userProfile.birthMonth ||
														1) - 1,
													userProfile.birthDay || 1,
													userProfile.birthHour || 12
												)
											: null);

									if (!birthDateTime || !userProfile?.gender)
										return Array.from({ length: 4 }).map(
											(_, index) => (
												<div
													key={index}
													className="w-full h-[45px] sm:h-[55px] flex items-center justify-center animate-pulse rounded-full"
													style={{
														backgroundColor:
															"#EBEAEA",
													}}
												>
													<div className="w-3/4 h-4 bg-gray-300 rounded sm:h-6"></div>
												</div>
											)
										);

									const genderForWuxing =
										userProfile.gender === "男" ||
										userProfile.gender === "male"
											? "male"
											: "female";
									const currentWuxingData = getWuxingData(
										birthDateTime,
										genderForWuxing
									);

									if (!currentWuxingData)
										return Array.from({ length: 4 }).map(
											(_, index) => (
												<div
													key={index}
													className="w-full h-[45px] sm:h-[55px] flex items-center justify-center animate-pulse rounded-full"
													style={{
														backgroundColor:
															"#EBEAEA",
													}}
												>
													<div className="w-3/4 h-4 bg-gray-300 rounded sm:h-6"></div>
												</div>
											)
										);

									return (
										<>
											<div
												className="w-full h-[45px] sm:h-[55px] flex items-center justify-center rounded-full"
												style={{
													backgroundColor: "#EBEAEA",
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												<span
													className="text-[18px] sm:text-[24px] lg:text-[32px] font-extrabold text-black"
													style={{
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
													}}
												>
													年柱 -{" "}
													{currentWuxingData.year}
												</span>
											</div>
											<div
												className="w-full h-[45px] sm:h-[55px] flex items-center justify-center rounded-full"
												style={{
													backgroundColor: "#EBEAEA",
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												<span
													className="text-[18px] sm:text-[24px] lg:text-[32px] font-extrabold text-black"
													style={{
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
													}}
												>
													月柱 -{" "}
													{currentWuxingData.month}
												</span>
											</div>
											<div
												className="w-full h-[45px] sm:h-[55px] flex items-center justify-center rounded-full"
												style={{
													backgroundColor: "#EBEAEA",
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												<span
													className="text-[18px] sm:text-[24px] lg:text-[32px] font-extrabold text-black"
													style={{
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
													}}
												>
													日柱 -{" "}
													{currentWuxingData.day}
												</span>
											</div>

											<div
												className="w-full h-[45px] sm:h-[55px] flex items-center justify-center rounded-full"
												style={{
													backgroundColor: "#EBEAEA",
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												<span
													className="text-[18px] sm:text-[24px] lg:text-[32px] font-extrabold text-black"
													style={{
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
													}}
												>
													時柱 -{" "}
													{currentWuxingData.hour}
												</span>
											</div>
										</>
									);
								})()}
							</div>

							{/* 個人特質分析 */}
							<div>
								<h4
									className="mb-3 sm:mb-4 text-[20px] sm:text-[24px] lg:text-[28px] text-black"
									style={{
										fontFamily: "Noto Sans HK",
										fontWeight: 400,
										WebkitTextStroke: "0.5px black",
									}}
								>
									個人特質分析
								</h4>
								{isLoadingPersonalSummary ? (
									<div className="animate-pulse">
										<div className="w-full h-2 mb-2 bg-gray-200 rounded sm:h-3"></div>
										<div className="w-4/5 h-2 mb-2 bg-gray-200 rounded sm:h-3"></div>
										<div className="w-5/6 h-2 bg-gray-200 rounded sm:h-3"></div>
									</div>
								) : personalAnalysisSummary ? (
									<p className="text-base leading-relaxed text-black sm:text-lg">
										{personalAnalysisSummary}
									</p>
								) : (
									<p className="text-gray-600">
										正在分析個人特質...
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			{/*宅卦  Section */}
			<div
				className="w-full p-4 mb-4 bg-white sm:p-6 lg:p-8"
				style={{
					borderRadius: "clamp(25px, 6vw, 45px)",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
				}}
			>
				<div className="flex flex-col w-full gap-4 lg:flex-row lg:gap-0">
					{/* First section - vertical 宅卦 text (hidden on mobile) */}
					<div className="hidden lg:flex lg:w-[10%] lg:ml-4 items-center justify-center">
						<div
							className="text-[96px] font-extrabold leading-none"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 800,
								color: "#A3B116",
								writingMode: "vertical-rl",
								textOrientation: "upright",
								WebkitTextStroke: "1px #A3B116",
							}}
						>
							宅卦
						</div>
					</div>

					{/* Mobile title for 宅卦 */}
					<div className="block mb-4 text-center lg:hidden">
						<h3
							className="text-[32px] font-extrabold"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 800,
								color: "#A3B116",
								WebkitTextStroke: "1px #A3B116",
							}}
						>
							宅卦
						</h3>
					</div>

					{/* Second section - direction image and description */}
					<div className="w-full lg:w-[20%] flex flex-col items-center justify-center px-2 sm:px-4">
						<div className="mb-3 sm:mb-4">
							<img
								src={`/images/directions/${(() => {
									const desc = houseDirectionInfo.description;
									if (desc.includes("正北")) return "North";
									if (desc.includes("正南")) return "South";
									if (desc.includes("正東")) return "East";
									if (desc.includes("正西")) return "West";
									if (desc.includes("東北"))
										return "NorthEast";
									if (desc.includes("西北"))
										return "NorthWest";
									if (desc.includes("東南"))
										return "SouthEast";
									if (desc.includes("西南"))
										return "SouthWest";
									return "North"; // fallback
								})()}.png`}
								alt={houseDirectionInfo.description}
								className="object-contain w-[40px] h-[40px] sm:w-[120px] sm:h-[120px]"
								style={{ filter: "brightness(0)" }}
							/>
						</div>
						<div
							className="text-[20px] sm:text-[24px] lg:text-[32px] font-[800] text-center"
							style={{
								fontFamily: "Noto Serif TC",
								color: "#9AAA00",
							}}
						>
							{houseDirectionInfo.description}
						</div>
					</div>

					{/* Third section - remaining width */}
					<div className="w-full lg:w-[70%] flex flex-col justify-center px-2 sm:px-4 lg:px-6">
						{/* Top row - two sections */}
						<div className="flex flex-col gap-3 mb-4 sm:flex-row sm:gap-4 sm:mb-6">
							<div
								className="flex-1 bg-white border-[2px] sm:border-[3px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center"
								style={{
									borderColor: "#A3B116",
									borderRadius: "100px",
								}}
							>
								<div
									className="text-[18px] sm:text-[24px] lg:text-[32px] font-[800]"
									style={{
										fontFamily: "Noto Serif TC",
										color: "#464646",
									}}
								>
									坐：{houseDirectionInfo.sitting.chinese}-
									{houseDirectionInfo.sitTrigramName}
								</div>
							</div>
							<div
								className="flex-1 bg-white border-[2px] sm:border-[3px] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center"
								style={{
									borderColor: "#A3B116",
									borderRadius: "100px",
								}}
							>
								<div
									className="text-[18px] sm:text-[24px] lg:text-[32px] font-[800]"
									style={{
										fontFamily: "Noto Serif TC",
										color: "#464646",
									}}
								>
									向：{houseDirectionInfo.facing.chinese}-
									{houseDirectionInfo.faceTrigramName}
								</div>
							</div>
						</div>

						{/* Bottom row - house type information */}
						<div className="flex flex-col">
							<div
								className="flex flex-col items-center justify-center w-full px-4 py-3 sm:flex-row sm:px-6 lg:px-8 sm:py-4"
								style={{
									backgroundColor: "#A3B116",
									borderRadius: "100px",
								}}
							>
								<div
									className="text-[28px] sm:text-[36px] lg:text-[48px] font-[800] text-center"
									style={{
										fontFamily: "Noto Serif TC",
										color: "#FFFFFF",
									}}
								>
									屬{houseDirectionInfo.houseName}
								</div>
								<div
									className="text-[28px] sm:text-[36px] lg:text-[48px] font-[800] text-center"
									style={{
										fontFamily: "Noto Serif TC",
										color: "#FFFFFF",
									}}
								>
									({houseDirectionInfo.houseType})
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 宅卦詳細解析 Section */}
			{/* <div
				className="w-full p-8 mb-4 bg-white"
				style={{
					borderRadius: "45px",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
				}}
			>
				<div className="mb-6">
					<h3
						className="mb-4 text-2xl font-bold"
						style={{
							fontFamily: "Noto Serif TC",
							color: "#A3B116",
						}}
					>
						{houseDirectionInfo.houseName}詳細解析
					</h3>
 */}
			{/* 宅卦組別說明 */}
			{/* <div
						className="p-4 mb-6 rounded-lg"
						style={{ backgroundColor: "#F8F9FA" }}
					>
						<h4
							className="mb-2 text-lg font-semibold"
							style={{ color: "#567156" }}
						>
							{houseDirectionInfo.houseType}特性
						</h4>
						<p className="leading-relaxed text-gray-700">
							{baZhaiExplanation.groupDescription}
						</p>
					</div> */}

			{/* 具體宅卦特性 */}
			{/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "#E8F5E8" }}
						>
							<h5
								className="mb-2 font-semibold"
								style={{ color: "#2D5016" }}
							>
								性格特徵
							</h5>
							<p className="text-sm text-gray-700">
								{
									baZhaiExplanation.houseSpecific
										.characteristics
								}
							</p>
						</div>

						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "#E8F2FF" }}
						>
							<h5
								className="mb-2 font-semibold"
								style={{ color: "#1B4B8C" }}
							>
								有利方面
							</h5>
							<p className="text-sm text-gray-700">
								{baZhaiExplanation.houseSpecific.benefits}
							</p>
						</div>

						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "#FFF4E6" }}
						>
							<h5
								className="mb-2 font-semibold"
								style={{ color: "#8B5A00" }}
							>
								注意事項
							</h5>
							<p className="text-sm text-gray-700">
								{baZhaiExplanation.houseSpecific.challenges}
							</p>
						</div>
					</div>
				</div>
			</div>
 */}
			{/* 命宅相配分析 Section */}
			<div
				className="w-full p-3 mb-4 bg-white rounded-[65px] sm:p-6 lg:p-8"
				style={{
					borderRadius: "20px sm:45px",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
				}}
			>
				<div className="flex flex-col w-full gap-4 lg:flex-row lg:gap-0">
					{/* First section - Mobile title, Desktop vertical text */}
					<div className="w-full lg:w-[10%] lg:ml-4 flex items-center justify-center lg:justify-center">
						{/* Mobile horizontal title */}
						<div className="block mb-4 lg:hidden">
							<h2
								style={{
									fontFamily: "Noto Serif TC, serif",
									fontWeight: 800,
									fontSize: "clamp(28px, 6vw, 40px)",
									color: "#A3B116",
									textAlign: "center",
								}}
							>
								命宅相配分析
							</h2>
						</div>
						{/* Desktop vertical text */}
						<div
							className="hidden font-extrabold leading-none lg:block"
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontWeight: 800,
								fontSize: "clamp(60px, 8vw, 96px)",
								color: "#A3B116",
								writingMode: "vertical-rl",
								textOrientation: "upright",
								WebkitTextStroke: "1px #A3B116",
							}}
						>
							命宅
						</div>
					</div>

					{/* Second section - middle section with comparison */}
					<div className="w-full lg:w-[45%] flex items-center justify-center px-3 sm:px-6 lg:px-10 mb-6 lg:mb-0">
						<div className="grid items-center w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-2">
							{/* 屋主命卦 */}
							<div className="text-center">
								<div className="mb-4">
									<span
										style={{
											fontFamily: "Noto Serif TC, serif",
											color: "#374A37",
											WebkitTextStroke: "1px #374A37",
											fontSize: "clamp(24px, 5vw, 32px)",
											fontWeight: 800,
										}}
									>
										屋主
									</span>
								</div>
								<div
									className="px-4 sm:px-6 py-3 text-center bg-white border-[3px] mx-auto max-w-[200px]"
									style={{
										borderColor: "#A3B116",
										borderRadius: "100px",
									}}
								>
									<span
										style={{
											fontFamily: "Noto Serif TC",
											color: "#464646",
											fontSize: "clamp(16px, 4vw, 24px)",
											fontWeight: 800,
										}}
									>
										{localPersonalData?.mingGuaInfo
											?.group ||
											mingGuaInfo?.group ||
											"計算中..."}
									</span>
								</div>
							</div>

							{/* VS 符號 */}
							<div className="order-first text-center sm:order-none">
								<div
									className="font-bold text-gray-400"
									style={{
										fontSize: "clamp(32px, 6vw, 40px)",
									}}
								>
									VS
								</div>
							</div>

							{/* 宅卦 */}
							<div className="text-center">
								<div className="mb-4">
									<span
										style={{
											fontFamily: "Noto Serif TC, serif",
											color: "#374A37",
											WebkitTextStroke: "1px #374A37",
											fontSize: "clamp(24px, 5vw, 32px)",
											fontWeight: 800,
										}}
									>
										宅卦
									</span>
								</div>
								<div
									className="px-4 sm:px-6 py-3 text-center bg-white border-[3px] mx-auto max-w-[200px]"
									style={{
										borderColor: "#A3B116",
										borderRadius: "100px",
									}}
								>
									<span
										style={{
											fontFamily: "Noto Serif TC",
											color: "#464646",
											fontSize: "clamp(16px, 4vw, 20px)",
											fontWeight: 800,
										}}
									>
										{houseDirectionInfo.houseType}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Third section - 相配結果分析 */}
					<div className="w-full lg:w-[45%] flex items-center justify-center px-3 sm:px-6">
						<div className="w-full">
							{(() => {
								const ownerGroup =
									localPersonalData?.mingGuaInfo?.group ||
									mingGuaInfo?.group;
								const houseGroup = houseDirectionInfo.houseType;

								// 判斷是否相配
								const isCompatible =
									(ownerGroup === "東四命" &&
										houseGroup === "東四宅") ||
									(ownerGroup === "西四命" &&
										houseGroup === "西四宅");

								const genderText =
									personalInfo.gender === "男"
										? "男主"
										: "女主";

								return (
									<div className="text-center">
										<div
											className={`inline-flex items-center w-full justify-center py-3 sm:py-5 rounded-full font-bold mb-4 ${
												isCompatible
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
											style={{
												fontSize:
													"clamp(18px, 4vw, 32px)",
											}}
										>
											{isCompatible
												? "✅ 命宅相配"
												: "⚠️ 命宅不配"}
										</div>

										<p
											className="leading-relaxed"
											style={{
												fontFamily: "Noto Serif TC",
												fontWeight: 800,
												fontSize:
													"clamp(14px, 3vw, 20px)",
												color: "#374A37",
											}}
										>
											{isCompatible
												? `${genderText}命卦與宅卦相配，屬於理想的風水格局。此配置有利於居住者的整體運勢，能充分發揮住宅的吉利效應，建議繼續保持現有布局並適當加強吉位的能量。`
												: `${genderText}命卦與宅卦不相配，需特別重視凶方化解與吉方增強。建議通過五行調和、方位布局優化等方式來改善居住環境的風水效應。`}
										</p>
									</div>
								);
							})()}
						</div>
					</div>
				</div>
			</div>

			{/* 居室布局分析 Section */}
			<div
				className="w-full p-3 mb-4 bg-white rounded-[65px] sm:p-6 lg:p-8"
				style={{
					borderRadius: "20px sm:45px",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
				}}
			>
				<div className="mb-6">
					<h2
						className="mb-4 font-bold text-center sm:text-left"
						style={{
							fontFamily: "Noto Serif TC, serif",
							color: "#A3B116",
							WebkitTextStroke: "1px #A3B116",
							fontSize: "clamp(24px, 5vw, 52px)",
						}}
					>
						居室布局分析
					</h2>

					{/* Layer Toggle Buttons */}
					<div className="flex flex-col justify-center gap-3 mb-6 sm:flex-row sm:gap-6">
						<button
							onClick={() => setShowBazhaiLayer(!showBazhaiLayer)}
							className={`px-4 sm:px-8 py-3 sm:py-4 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
								showBazhaiLayer
									? "border-green-500 bg-green-100 text-green-700 shadow-lg shadow-green-200"
									: "border-gray-300 bg-white text-gray-600 hover:border-green-400 shadow-md hover:shadow-lg"
							}`}
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(14px, 3vw, 18px)",
								fontWeight: "700",
								boxShadow: showBazhaiLayer
									? "0 8px 25px rgba(34, 197, 94, 0.3)"
									: "0 4px 15px rgba(0, 0, 0, 0.1)",
							}}
						>
							八宅吉凶
						</button>
						<button
							onClick={() =>
								setShowFlyingStarLayer(!showFlyingStarLayer)
							}
							className={`px-4 sm:px-8 py-3 sm:py-4 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
								showFlyingStarLayer
									? "border-blue-500 bg-blue-100 text-blue-700 shadow-lg shadow-blue-200"
									: "border-gray-300 bg-white text-gray-600 hover:border-blue-400 shadow-md hover:shadow-lg"
							}`}
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(14px, 3vw, 18px)",
								fontWeight: "700",
								boxShadow: showFlyingStarLayer
									? "0 8px 25px rgba(59, 130, 246, 0.3)"
									: "0 4px 15px rgba(0, 0, 0, 0.1)",
							}}
						>
							流年吉凶
						</button>
						<button
							onClick={() =>
								setShowDirectionLayer(!showDirectionLayer)
							}
							className={`px-4 sm:px-8 py-3 sm:py-4 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
								showDirectionLayer
									? "border-gray-500 bg-gray-100 text-gray-700 shadow-lg shadow-gray-200"
									: "border-gray-300 bg-white text-gray-600 hover:border-gray-400 shadow-md hover:shadow-lg"
							}`}
							style={{
								fontFamily: "Noto Serif TC, serif",
								fontSize: "clamp(14px, 3vw, 18px)",
								fontWeight: "700",
								boxShadow: showDirectionLayer
									? "0 8px 25px rgba(107, 114, 128, 0.3)"
									: "0 4px 15px rgba(0, 0, 0, 0.1)",
							}}
						>
							簡易指南
						</button>
					</div>

					{/* Color Legend - Show when layers are active */}
					{(showBazhaiLayer || showFlyingStarLayer) && (
						<div className="flex flex-col justify-center gap-4 mb-4 sm:flex-row sm:gap-8">
							{showBazhaiLayer && (
								<div className="flex flex-col items-center gap-4 px-4 py-3 bg-white border border-gray-200 shadow-lg sm:flex-row sm:px-6 rounded-2xl">
									<h4
										className="font-bold text-center text-gray-700 sm:text-left"
										style={{
											fontFamily: "Noto Serif TC, serif",
											fontSize: "clamp(14px, 3vw, 16px)",
										}}
									>
										八宅吉凶:
									</h4>
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-md"></div>
											<span
												className="text-sm font-medium text-gray-600"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												吉位
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-md"></div>
											<span
												className="text-sm font-medium text-gray-600"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												凶位
											</span>
										</div>
									</div>
								</div>
							)}
							{showFlyingStarLayer && (
								<div className="flex flex-col items-center gap-4 px-4 py-3 bg-white border border-gray-200 shadow-lg sm:flex-row sm:px-6 rounded-2xl">
									<h4
										className="font-bold text-center text-gray-700 sm:text-left"
										style={{
											fontFamily: "Noto Serif TC, serif",
											fontSize: "clamp(14px, 3vw, 16px)",
										}}
									>
										流年吉凶:
									</h4>
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
											<span
												className="text-sm font-medium text-gray-600"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												吉星
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 bg-purple-600 border-2 border-white rounded-full shadow-md"></div>
											<span
												className="text-sm font-medium text-gray-600"
												style={{
													fontFamily:
														"Noto Serif TC, serif",
												}}
											>
												凶星
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<style jsx>{`
					.roomcanvas-container :global(.canvasImage > div) {
						height: 1200px !important;
						overflow: visible !important;
					}
					.roomcanvas-container :global(.h-135) {
						height: 1200px !important;
						overflow: visible !important;
					}
				`}</style>
			</div>

			{/* 四吉位&流年飛星 和 四凶位&流年飛星 */}
			<div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
				{/* 四吉位 */}
				<div
					className="p-6 bg-white"
					style={{
						borderRadius: "45px",
						boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
					}}
				>
					<h3
						className="mb-4"
						style={{
							fontFamily: "Noto Serif TC",
							fontWeight: 800,
							fontSize: "35px",
							color: "#A3B116",
						}}
					>
						四吉位&流年飛星
					</h3>
					<div className="space-y-3">
						{auspiciousData.map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-2"
							>
								{/* Position - 30% width */}
								<div
									className="w-[30%] px-3 py-2 text-center"
									style={{
										backgroundColor: "#EFEFEF",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "#3E5513",
										}}
									>
										{item.position}
									</div>
								</div>

								{/* Direction - 20% width */}
								<div
									className="w-[20%] px-3 py-2 text-center"
									style={{
										backgroundColor: "#EFEFEF",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "#3E5513",
										}}
									>
										{item.direction}
									</div>
								</div>

								{/* Star - 30% width */}
								<div
									className="w-[30%] px-3 py-2 text-center"
									style={{
										backgroundColor: "#EFEFEF",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "#3E5513",
										}}
									>
										{item.star}
									</div>
								</div>

								{/* Type - 20% width */}
								<div
									className="w-[20%] px-3 py-2 text-center"
									style={{
										backgroundColor:
											item.type === "吉"
												? "#A3B116"
												: "#B4003C",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "white",
										}}
									>
										{item.type}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* 四凶位 */}
				<div
					className="p-6 bg-white"
					style={{
						borderRadius: "45px",
						boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
					}}
				>
					<h3
						className="mb-4"
						style={{
							fontFamily: "Noto Serif TC",
							fontWeight: 800,
							fontSize: "35px",
							color: "#B4003C",
						}}
					>
						四凶位&流年飛星
					</h3>
					<div className="space-y-3">
						{inauspiciousData.map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-2"
							>
								{/* Position - 30% width */}
								<div
									className="w-[30%] px-3 py-2 text-center"
									style={{
										backgroundColor: "#EFEFEF",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "#B4003C",
										}}
									>
										{item.position}
									</div>
								</div>

								{/* Direction - 20% width */}
								<div
									className="w-[20%] px-3 py-2 text-center"
									style={{
										backgroundColor: "#EFEFEF",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "#B4003C",
										}}
									>
										{item.direction}
									</div>
								</div>

								{/* Star - 30% width */}
								<div
									className="w-[30%] px-3 py-2 text-center"
									style={{
										backgroundColor: "#EFEFEF",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "#B4003C",
										}}
									>
										{item.star}
									</div>
								</div>

								{/* Type - 20% width */}
								<div
									className="w-[20%] px-3 py-2 text-center"
									style={{
										backgroundColor:
											item.type === "吉"
												? "#A3B116"
												: "#B4003C",
										borderRadius: "10px",
									}}
								>
									<div
										style={{
											fontFamily: "Noto Serif TC",
											fontWeight: 800,
											fontSize: "18px",
											color: "white",
										}}
									>
										{item.type}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Room Type Tags - moved outside and styled */}
			{roomAnalyses && roomAnalyses.length > 0 && (
				<div className="flex flex-wrap justify-center gap-2 mb-6 sm:gap-4 sm:justify-start">
					{roomAnalyses.map((room, index) => {
						const starInfo = flyingStars2025[room.direction];
						const isLucky = starInfo?.type === "吉";
						const isActive = activeRoomIndex === index;

						return (
							<button
								key={index}
								onClick={() => setActiveRoomIndex(index)}
								className={`px-4 sm:px-8 lg:px-10 py-2 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer ${
									isActive
										? "shadow-xl scale-105"
										: "hover:shadow-md"
								}`}
								style={{
									backgroundColor: isLucky
										? "#A3B116"
										: "#B4003C",
									color: "white",
									fontFamily: "Noto Serif TC",
									fontSize: "clamp(14px, 3vw, 20px)",
									fontWeight: 800,
									border: isActive
										? "3px solid white"
										: "none",
									boxShadow: isActive
										? "0 0 0 3px rgba(0,0,0,0.2)"
										: "0 4px 8px rgba(0,0,0,0.15)",
								}}
							>
								{(() => {
									// Get the room type
									const roomType =
										room.roomType &&
										room.roomType !== "房間"
											? room.roomType
											: room.data?._type ||
												room.type ||
												"房間";

									// Add room number (index + 1) to the room type
									return `${roomType}${index + 1}`;
								})()}
							</button>
						);
					})}
				</div>
			)}

			{/* 詳細方位分析 */}
			<div
				className="relative p-3 mb-4 overflow-hidden rounded-[65px] bg-white sm:p-6"
				style={{
					borderRadius: "20px sm:45px",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
					backgroundImage:
						"url('/images/report/housing-report-bg.png')",
					backgroundPosition: "right bottom",
					backgroundRepeat: "no-repeat",
					backgroundSize: "clamp(50%, 70%, 90%)",
				}}
			>
				{/* Show only active room */}
				{roomAnalyses &&
					roomAnalyses.length > 0 &&
					activeRoomIndex !== null &&
					roomAnalyses[activeRoomIndex] && (
						<div className="space-y-6">
							{(() => {
								const room = roomAnalyses[activeRoomIndex];
								const index = activeRoomIndex;

								const directionNames = {
									northEast: "東北",
									east: "東",
									southEast: "東南",
									south: "南",
									southWest: "西南",
									west: "西",
									northWest: "西北",
									north: "北",
								};

								const starInfo =
									flyingStars2025[room.direction];
								const bazhaiName =
									bazhaiMapping[room.direction];
								const isLucky = starInfo?.type === "吉";
								const directionName =
									directionNames[room.direction];

								// Use AI analysis if available, otherwise generate dynamic analysis
								let roomAnalysis;

								// Try to find matching AI analysis for this room
								const aiRoomAnalysis = roomAnalyses?.find(
									(aiRoom) => {
										// Priority matching: exact roomId first, then index fallback
										if (aiRoom.roomId === room.roomId) {
											return true; // Exact room ID match (highest priority)
										}

										// If no exact room ID match, use array index as fallback
										// This ensures each room gets a unique analysis
										return (
											roomAnalyses.indexOf(aiRoom) ===
											index
										);
									}
								);

								if (
									aiRoomAnalysis &&
									aiRoomAnalysis.aiAnalysis
								) {
									// Use AI analysis - parse the structured content
									roomAnalysis = parseAIAnalysis(
										aiRoomAnalysis.aiAnalysis,
										room,
										starInfo,
										bazhaiName,
										directionName
									);
								} else {
									// Show loading state until AI analysis completes
									roomAnalysis = createLoadingStructure(
										room,
										starInfo
									);
								}

								return (
									<div
										key={index}
										id={`room-${index}`}
										className="transition-all duration-300 rounded-xl"
									>
										{/* Room Header - Left and Right sections */}
										<div className="flex flex-col items-start justify-start gap-4 p-3 mb-4 sm:flex-row sm:items-center sm:gap-10 sm:p-6">
											{/* Left section - Room Type */}
											<div>
												<span
													style={{
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
														fontSize:
															"clamp(20px, 5vw, 30px)",
														color: "#374A37",
													}}
												>
													{aiRoomAnalysis?.roomType ||
														room.roomType}
												</span>
											</div>

											{/* Right section - Direction and Star */}
											<div
												className="w-full px-3 py-2 sm:px-6 sm:w-auto"
												style={{
													borderRadius: "100px",
													border: `3px solid ${isLucky ? "#A3B116" : "#B4003C"}`,
													backgroundColor: "white",
												}}
											>
												<span
													style={{
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
														fontSize:
															"clamp(14px, 3vw, 18px)",
														color: "#374A37",
													}}
												>
													{directionName} -{" "}
													{starInfo?.star}
												</span>
											</div>
										</div>

										{/* 2025年總結 */}
										<div className="px-3 mb-4 sm:px-6">
											<h5
												style={{
													fontFamily: "Noto Sans HK",
													fontWeight: 400,
													fontSize:
														"clamp(16px, 3.5vw, 20px)",
													color: "black",
													marginBottom: "12px",
												}}
											>
												2025年總結
											</h5>
											<div className="mb-4">
												<div>
													<p
														style={{
															fontFamily:
																"Noto Sans HK",
															fontWeight: 400,
															fontSize:
																"clamp(14px, 3vw, 20px)",
															color: "black",
														}}
														className="leading-relaxed"
													>
														{
															roomAnalysis.yearSummary
														}
													</p>
												</div>
											</div>
										</div>

										{/* Direction, Element, and Bazhai Info */}
										<div className="flex flex-wrap items-center gap-2 px-3 mb-6 sm:px-6 sm:gap-4">
											<span
												style={{
													fontFamily: "Noto Serif TC",
													fontWeight: 800,
													fontSize:
														"clamp(20px, 5vw, 30px)",
													color: "#374A37",
												}}
											>
												{directionName}
											</span>

											{/* Element with image */}
											<img
												src={`/images/elements/${starInfo?.element}.png`}
												alt={starInfo?.element}
												className="object-contain"
												style={{
													width: "clamp(24px, 6vw, 30px)",
													height: "clamp(24px, 6vw, 30px)",
												}}
											/>

											{/* Lucky/Unlucky circle */}
											<div
												className="flex items-center justify-center rounded-full"
												style={{
													backgroundColor: isLucky
														? "#A3B116"
														: "#B4003C",
													width: "clamp(32px, 8vw, 40px)",
													height: "clamp(32px, 8vw, 40px)",
												}}
											>
												<span
													style={{
														color: "white",
														fontFamily:
															"Noto Serif TC",
														fontWeight: 800,
														fontSize:
															"clamp(14px, 3vw, 18px)",
													}}
												>
													{isLucky ? "吉" : "凶"}
												</span>
											</div>

											<span
												style={{
													fontFamily: "Noto Serif TC",
													fontWeight: 800,
													fontSize:
														"clamp(16px, 4vw, 30px)",
													color: "#374A37",
												}}
												className="w-full sm:w-auto"
											>
												八宅:{" "}
												{getBazhaiDescription(
													bazhaiName
												)}
											</span>
										</div>

										{/* 整體格局分析 */}
										<div className="px-3 mb-4 sm:px-6">
											<h6
												className="flex items-center mb-2"
												style={{
													fontFamily: "Noto Sans HK",
													fontWeight: 400,
													fontSize:
														"clamp(16px, 3.5vw, 20px)",
													color: "black",
												}}
											>
												<span className="mr-2">🏠</span>
												整體格局分析
											</h6>
											<p
												className="leading-relaxed text-gray-600"
												style={{
													fontSize:
														"clamp(14px, 3vw, 16px)",
												}}
											>
												{roomAnalysis
													.comprehensiveAdvice
													?.overall || "分析中..."}
											</p>
										</div>

										{/* 建議區塊 */}
										<div className="px-3 sm:px-6">
											<h5
												style={{
													fontFamily: "Noto Serif TC",
													fontWeight: 800,
													fontSize:
														"clamp(20px, 5vw, 30px)",
													color: isLucky
														? "#A3B116"
														: "#B4003C",
												}}
												className="mb-3"
											>
												{isLucky
													? "強化建議"
													: "化解建議"}
											</h5>
											<div className="grid grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 lg:grid-cols-4">
												{[
													{
														title: isLucky
															? "家具擺放"
															: "環境調整",
														color: "bg-[#EFEFEF] border-gray-200",
														items: roomAnalysis
															.recommendations
															.furniture,
													},
													{
														title: isLucky
															? "元素色彩"
															: "擺件禁忌",
														color: "bg-[#EFEFEF] border-gray-200",
														items: roomAnalysis
															.recommendations
															.colors,
													},
													{
														title: isLucky
															? "生活習慣"
															: "行為禁忌",
														color: "bg-[#EFEFEF] border-gray-200",
														items: roomAnalysis
															.recommendations
															.habits,
													},
													{
														title: isLucky
															? "能量強化"
															: "化煞措施",
														color: "bg-[#EFEFEF] border-gray-200",
														items: roomAnalysis
															.recommendations
															.items,
													},
												].map((category, catIndex) => (
													<div
														key={catIndex}
														className={`${category.color} border rounded-lg p-3 sm:p-4`}
													>
														{catIndex === 0 ||
														catIndex === 1 ||
														catIndex === 2 ||
														catIndex === 3 ? (
															<div className="flex justify-start mb-3">
																<div
																	style={{
																		width: "clamp(120px, 30vw, 140px)",
																		height: "32px",
																		borderRadius:
																			"18px",
																		backgroundColor:
																			catIndex ===
																			3
																				? "#A3B116" // Always green for fourth card
																				: isLucky
																					? "#A3B116"
																					: "#B4003C",
																		fontFamily:
																			"Noto Serif TC",
																		fontWeight: 800,
																		fontSize:
																			"clamp(14px, 3.5vw, 20px)",
																		color: "#FFFFFF",
																	}}
																	className="flex items-center justify-center rounded"
																>
																	{
																		category.title
																	}
																</div>
															</div>
														) : (
															<div
																className="mb-3 font-bold text-center"
																style={{
																	fontSize:
																		"clamp(14px, 3.5vw, 16px)",
																}}
															>
																{category.title}
															</div>
														)}
														<ul className="space-y-2">
															{category.items.map(
																(
																	item,
																	itemIndex
																) => (
																	<li
																		key={
																			itemIndex
																		}
																		className="flex items-start"
																		style={
																			catIndex ===
																				0 ||
																			catIndex ===
																				1 ||
																			catIndex ===
																				2 ||
																			catIndex ===
																				3
																				? {
																						fontSize:
																							"clamp(12px, 3vw, 16px)",
																					}
																				: {}
																		}
																	>
																		<span className="mr-2">
																			•
																		</span>
																		<span>
																			{
																				item
																			}
																		</span>
																	</li>
																)
															)}
														</ul>
													</div>
												))}
											</div>
										</div>

										{/* 詳細風水分析 */}
										{roomAnalysis.comprehensiveAdvice && (
											<div className="p-3 mt-3 sm:p-6">
												<div className="space-y-5 text-sm">
													{/* 季節性注意事項 */}
													<div className="w-full">
														<div
															className="p-3 rounded-lg shadow-sm sm:p-4"
															style={{
																backgroundColor:
																	"#F3E5F5",
																border: "2px solid #CE93D8",
															}}
														>
															<h6
																style={{
																	fontFamily:
																		"Noto Sans HK",
																	fontWeight: 400,
																	fontSize:
																		"clamp(16px, 3.5vw, 20px)",
																	color: "#7B1FA2",
																	marginBottom:
																		"12px",
																}}
																className="flex items-center"
															>
																<span className="mr-2">
																	🌸
																</span>
																季節性注意事項
															</h6>
															<p
																style={{
																	fontFamily:
																		"Noto Sans HK",
																	fontWeight: 400,
																	fontSize:
																		"clamp(14px, 3vw, 16px)",
																	color: "#4A148C",
																}}
																className="leading-relaxed"
															>
																{roomAnalysis
																	.comprehensiveAdvice
																	?.seasonal ||
																	"分析中..."}
															</p>
														</div>
													</div>

													{/* 個人化建議 */}
													<div
														className="p-3 rounded-lg shadow-sm sm:p-4"
														style={{
															backgroundColor:
																"#E8F5E8",
															border: "2px solid #81C784",
														}}
													>
														<h6
															style={{
																fontFamily:
																	"Noto Sans HK",
																fontWeight: 400,
																fontSize:
																	"clamp(16px, 3.5vw, 20px)",
																color: "#2E7D32",
																marginBottom:
																	"12px",
															}}
															className="flex items-center"
														>
															<span className="mr-2">
																👤
															</span>
															個人化建議
														</h6>
														<p
															style={{
																fontFamily:
																	"Noto Sans HK",
																fontWeight: 400,
																fontSize:
																	"clamp(14px, 3vw, 16px)",
																color: "#1B5E20",
															}}
															className="leading-relaxed"
														>
															{roomAnalysis
																.comprehensiveAdvice
																?.personal ||
																"分析中..."}
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								);
							})()}
						</div>
					)}

				{/* Fallback when no room data */}
				{(!roomAnalyses || roomAnalyses.length === 0) && (
					<div className="py-8 text-center text-gray-500">
						<p>暫無房間分析數據</p>
					</div>
				)}
			</div>

			{/* 流年提醒 */}
			<div
				className="p-5 mb-4 bg-white rounded-[65px] sm:p-8"
				style={{
					borderRadius: "20px sm:45px",
					boxShadow: "0 4px 5.3px rgba(0, 0, 0, 0.25)",
				}}
			>
				<div className="flex items-center mb-4">
					<h2
						className="font-bold text-gray-800"
						style={{
							fontSize: "clamp(18px, 4vw, 30px)",
						}}
					>
						流年提醒 2024~2043-下元九運
					</h2>
				</div>

				<div className="space-y-6">
					{/* 動態年度建議 */}
					{personalInfo?.yearlyAdvice && (
						<>
							{/* 按鈕區域 - 水平排列 */}
							<div className="flex flex-row justify-center gap-2 mb-8 sm:gap-6">
								{/* 2025年度重點提醒按鈕 */}
								<div
									className="flex flex-col items-center p-3 text-center transition-opacity cursor-pointer sm:p-4 hover:opacity-80"
									onClick={() => toggleSection("yearlyFocus")}
								>
									<div className="flex items-center justify-center w-12 h-12 mb-3 bg-red-100 border-red-300 rounded-full sm:w-16 sm:h-16 border-3">
										<Image
											src="/images/report/personal-1.png"
											alt="2025重點提醒"
											width={10}
											height={10}
											className="object-contain"
										/>
									</div>
									<h4
										className="font-bold text-red-700"
										style={{
											fontSize: "clamp(12px, 3vw, 14px)",
										}}
									>
										2025重點提醒
									</h4>
								</div>

								{/* 下元九運影響按鈕 */}
								<div
									className="flex flex-col items-center p-3 text-center transition-opacity cursor-pointer sm:p-4 hover:opacity-80"
									onClick={() =>
										toggleSection("nineMovement")
									}
								>
									<div className="flex items-center justify-center w-12 h-12 mb-3 bg-blue-100 border-blue-300 rounded-full sm:w-16 sm:h-16 border-3">
										<Image
											src="/images/report/personal-2.png"
											alt="下元九運影響"
											width={34}
											height={34}
											className="object-contain"
										/>
									</div>
									<h4
										className="font-bold text-blue-700"
										style={{
											fontSize: "clamp(12px, 3vw, 14px)",
										}}
									>
										下元九運影響
									</h4>
								</div>

								{/* 個人化年度建議按鈕 */}
								<div
									className="flex flex-col items-center p-3 text-center transition-opacity cursor-pointer sm:p-4 hover:opacity-80"
									onClick={() =>
										toggleSection("personalAdvice")
									}
								>
									<div className="flex items-center justify-center w-12 h-12 mb-3 bg-yellow-100 border-yellow-400 rounded-full sm:w-16 sm:h-16 border-3">
										<Image
											src="/images/report/personal-3.png"
											alt="個人化年度建議"
											width={34}
											height={34}
											className="object-contain"
										/>
									</div>
									<h4
										className="font-bold text-yellow-700"
										style={{
											fontSize: "clamp(12px, 3vw, 14px)",
										}}
									>
										個人化年度建議
									</h4>
								</div>
							</div>

							{/* 內容區域 - 顯示選中的內容 */}
							{expandedSections.yearlyFocus && (
								<div className="p-3 rounded-lg sm:p-6 bg-gradient-to-r from-red-50 to-pink-50">
									<h3
										className="mb-4 font-bold text-red-700"
										style={{
											fontSize:
												"clamp(16px, 3.5vw, 18px)",
										}}
									>
										2025年度重點提醒
									</h3>
									<p
										style={{
											fontFamily: "Noto Sans HK",
											fontWeight: 400,
											fontSize: "clamp(14px, 3vw, 16px)",
											color: "#374151",
										}}
										className="leading-relaxed"
									>
										{personalInfo.yearlyAdvice
											.currentYear || "分析中..."}
									</p>
								</div>
							)}

							{expandedSections.nineMovement && (
								<div className="p-3 rounded-lg sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
									<h3
										className="mb-4 font-bold text-blue-700"
										style={{
											fontSize:
												"clamp(16px, 3.5vw, 18px)",
										}}
									>
										下元九運影響
									</h3>
									<p
										style={{
											fontFamily: "Noto Sans HK",
											fontWeight: 400,
											fontSize: "clamp(14px, 3vw, 16px)",
											color: "#374151",
										}}
										className="leading-relaxed"
									>
										{personalInfo.yearlyAdvice
											.nineStarCycle || "分析中..."}
									</p>
								</div>
							)}

							{expandedSections.personalAdvice && (
								<div className="p-3 rounded-lg sm:p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
									<h3
										className="mb-4 font-bold text-yellow-700"
										style={{
											fontSize:
												"clamp(16px, 3.5vw, 18px)",
										}}
									>
										個人化年度建議
									</h3>
									<p
										style={{
											fontFamily: "Noto Sans HK",
											fontWeight: 400,
											fontSize: "clamp(14px, 3vw, 16px)",
											color: "#374151",
										}}
										className="leading-relaxed"
									>
										{personalInfo.yearlyAdvice
											.personalizedAdvice || "分析中..."}
									</p>
								</div>
							)}
						</>
					)}

					{/* 當沒有年度建議數據時顯示載入狀態 */}
					{!personalInfo?.yearlyAdvice && (
						<div className="p-3 rounded-lg sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100">
							<div className="flex flex-col items-center justify-center sm:flex-row">
								<div className="w-6 h-6 mb-2 mr-0 border-b-2 border-purple-600 rounded-full sm:mr-3 sm:mb-0 animate-spin"></div>
								<p
									style={{
										fontFamily: "Noto Sans HK",
										fontWeight: 400,
										fontSize: "clamp(14px, 3vw, 16px)",
										color: "#6B7280",
									}}
									className="text-center sm:text-left"
								>
									正在生成個人化年度風水建議...
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
