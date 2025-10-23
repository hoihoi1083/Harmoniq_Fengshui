"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
	Heart,
	AlertTriangle,
	CheckCircle,
	Users,
	Target,
	Lightbulb,
} from "lucide-react";
import { useCoupleAnalysis } from "@/contexts/CoupleAnalysisContext";

const CoupleSpecificProblemSolution = ({
	user1,
	user2,
	specificProblem,
	calculateWuxingAnalysis,
	analyzeWuxingStrength,
	determineUsefulGods,
	isSimplified = false,
}) => {
	const t = useTranslations("coupleReport.coupleSpecificProblemSolution");
	const { analysisData, loading: aiLoading, error } = useCoupleAnalysis();
	const [solution, setSolution] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (analysisData) {
			// Use available AI data to generate specific problem solutions
			setSolution({
				problemAnalysis: generateProblemAnalysisFromAI(
					analysisData,
					specificProblem
				),
				rootCause: generateRootCauseFromAI(
					analysisData,
					specificProblem
				),
				solutions: generateSolutionsFromAI(
					analysisData,
					specificProblem
				),
				emotionalSupport: {
					comfort:
						generateHealingAdviceFromAI(analysisData)[0] ||
						"根據AI分析，為您提供情感療癒建議",
					hope:
						generateRecoveryAdviceFromAI(analysisData)[0] ||
						"逐步重建信任和理解，相信關係的恢復潛力",
					strength:
						generateStrengtheningAdviceFromAI(analysisData)[0] ||
						"發揮雙方優勢，持續加強關係基礎",
				},
				preventiveMeasures:
					generatePreventiveMeasuresFromAI(analysisData),
				problemType: analyzeProblemTypeFromAI(
					specificProblem,
					analysisData
				),
				relationshipStatus:
					analyzeRelationshipStatusFromAI(analysisData),
				compatibility: analysisData.compatibility || null,
				targetedAdvice:
					generateTargetedAdviceFromCompatibility(analysisData),
				actionPlan: generateActionPlanFromCompatibility(analysisData),
				practicalAdvice: generatePracticalAdviceFromAI(
					analysisData,
					specificProblem
				),
				spiritualGuidance: generateSpiritualGuidanceFromAI(
					analysisData,
					specificProblem
				),
				successIndicators: generateSuccessIndicatorsFromAI(
					analysisData,
					specificProblem
				),
				timeline: generateTimelineFromAI(analysisData, specificProblem),
				whenToMoveOn: generateMoveOnAdviceFromAI(
					analysisData,
					specificProblem
				),
			});
			setLoading(false);
		} else if (!aiLoading && !analysisData) {
			// Fallback to basic analysis if AI data is not available
			if (user1?.birthDateTime && user2?.birthDateTime) {
				generateSpecificSolutionFallback();
			}
		}
	}, [analysisData, aiLoading, user1, user2, specificProblem]);

	// Helper functions to generate solutions from available AI data
	const generateProblemAnalysisFromAI = (aiData, problem) => {
		const score = aiData.compatibility?.score || 75;
		const challenges = aiData.challenges || [];

		if (problem) {
			return `根據AI分析，您的關係評分為${score}分。關於「${problem}」這個問題，主要源於：${challenges.join("、") || "溝通理解差異"}。`;
		}
		return `整體關係分析：配對評分${score}分，${aiData.compatibility?.level || "關係良好"}。主要挑戰包括：${challenges.join("、") || "需要加強溝通"}。`;
	};

	const generateRootCauseFromAI = (aiData, problem) => {
		const challenges = aiData.challenges || ["溝通不足"];
		return `根本原因分析：${challenges[0] || "溝通方式需要改善"}，建議從${aiData.advice?.[0] || "加強理解"}開始改善。`;
	};

	const generateSolutionsFromAI = (aiData, problem) => {
		const advice = aiData.advice || [];
		const strengths = aiData.strengths || [];

		const solutions = [
			{
				type: "immediate",
				title: "即時改善方案",
				description: advice[0] || "立即開始更好的溝通",
				steps: [
					"認真傾聽對方的想法",
					"表達自己的真實感受",
					"尋求共同解決方案",
				],
			},
			{
				type: "long-term",
				title: "長期發展策略",
				description: `發揮${strengths[0] || "相互理解"}的優勢`,
				steps: [
					advice[1] || "建立定期溝通機制",
					"共同制定關係目標",
					"持續改善互動模式",
				],
			},
		];

		if (problem && problem.includes("溝通")) {
			solutions.push({
				type: "communication",
				title: "溝通專項改善",
				description: "針對溝通問題的專門方案",
				steps: [
					"學習有效溝通技巧",
					"避免指責性語言",
					"增加正面互動時間",
				],
			});
		}

		return solutions;
	};

	const generateHealingAdviceFromAI = (aiData) => {
		const score = aiData.compatibility?.score || 75;
		const advice = aiData.advice || [];

		return [
			`根據${score}分的配對分析，建議情感療癒方式：給予彼此充分的理解與支持`,
			advice[0] || "在這個階段，最重要的是保持開放的溝通和耐心",
			`發揮${aiData.strengths?.[0] || "相互支持"}的優勢進行療癒，建立更深層的情感連結`,
		];
	};

	const generateRecoveryAdviceFromAI = (aiData) => {
		const advice = aiData.advice || [];

		return [
			"逐步重建信任和理解，從日常生活的小細節開始改善",
			advice[1] || "通過持續的關愛行動，證明彼此在關係中的重要性",
			`利用${aiData.strengths?.[0] || "共同興趣和價值觀"}促進關係恢復，創造更多正面的共同回憶`,
		];
	};

	const generateStrengtheningAdviceFromAI = (aiData) => {
		const strengths = aiData.strengths || ["相互理解", "共同目標"];
		const baseAdvice = strengths
			.map((strength) => `強化${strength}以增進關係`)
			.concat([
				"定期回顧關係進展，慶祝每一個小成就",
				"保持個人成長的同時，也要共同成長",
			]);

		return baseAdvice.slice(0, 3); // Return first 3 pieces of advice
	};

	const generatePreventiveMeasuresFromAI = (aiData) => {
		const challenges = aiData.challenges || [];
		return challenges
			.map((challenge) => `預防${challenge}的再次發生`)
			.concat([
				"建立健康的溝通習慣",
				"定期關係健康檢查",
				"維持個人成長和關係平衡",
			]);
	};

	const generateTargetedAdviceFromCompatibility = (aiData) => {
		return [
			`配對評分${aiData.compatibility?.score || 75}分，關係基礎${aiData.compatibility?.level || "良好"}`,
			...(aiData.advice || ["建議加強溝通理解"]),
			`發揮優勢：${(aiData.strengths || ["相互支持"]).join("、")}`,
		];
	};

	const generateActionPlanFromCompatibility = (aiData) => {
		const advice = aiData.advice || [];
		const strengths = aiData.strengths || [];

		return [
			{
				phase: "第一階段",
				duration: "1-2週",
				goals: [advice[0] || "多花時間了解對方的想法和感受"],
				actions: ["每日分享感受", "練習積極傾聽"],
			},
			{
				phase: "第二階段",
				duration: "3-4週",
				goals: [
					`強化${strengths[0] || "性格互補，能夠相互學習和成長"}`,
				],
				actions: ["增加共同活動", "建立關係儀式"],
			},
			{
				phase: "第三階段",
				duration: "持續進行",
				goals: ["維持關係健康發展"],
				actions: ["定期關係評估", "持續成長學習"],
			},
		];
	};

	const analyzeProblemTypeFromAI = (problem, aiData) => {
		// Analyze problem type based on AI analysis and user input
		if (!problem) return "general";

		const problemLower = problem.toLowerCase();
		if (problemLower.includes("分手") || problemLower.includes("離婚"))
			return "breakup";
		if (problemLower.includes("溝通") || problemLower.includes("交流"))
			return "communication";
		if (problemLower.includes("信任") || problemLower.includes("背叛"))
			return "trust";
		if (problemLower.includes("距離") || problemLower.includes("異地"))
			return "distance";
		if (problemLower.includes("家庭") || problemLower.includes("父母"))
			return "family";
		return "general";
	};

	const analyzeRelationshipStatusFromAI = (aiData) => {
		// Determine relationship status from compatibility score
		const score =
			parseInt(
				aiData?.compatibility?.score ||
					aiData?.compatibility?.overallScore
			) || 50;
		if (score >= 80) return "strong";
		if (score >= 60) return "stable";
		if (score >= 40) return "challenging";
		return "critical";
	};

	const generatePracticalAdviceFromAI = (aiData, problem) => {
		// Generate practical advice based on AI analysis and advice
		const advice = aiData?.advice || [];
		const practicalAdvice = [
			"建立固定的溝通時間，每日分享彼此的想法和感受",
			"練習積極聆聽，給予對方完整的注意力",
			"設定共同目標，一起努力達成並慶祝成功",
		];

		// Add advice from AI analysis
		if (advice.length > 0) {
			advice.forEach((item) => {
				if (item.interaction || item.communication) {
					practicalAdvice.push(
						item.interaction || item.communication
					);
				}
			});
		}

		// Add problem-specific advice
		if (problem) {
			const problemLower = problem.toLowerCase();
			if (problemLower.includes("溝通")) {
				practicalAdvice.push("使用「我」語句表達感受，避免指責性語言");
			} else if (problemLower.includes("信任")) {
				practicalAdvice.push("保持透明度，分享日常生活和想法");
			} else if (problemLower.includes("距離")) {
				practicalAdvice.push("制定固定的視訊時間，保持情感連結");
			}
		}

		return practicalAdvice.slice(0, 5); // Limit to 5 practical pieces
	};

	const generateSpiritualGuidanceFromAI = (aiData, problem) => {
		// Generate spiritual guidance based on compatibility and challenges
		const challenges = aiData?.challenges || [];
		const spiritualGuidance = [
			"保持內心平靜，用愛與耐心對待關係中的挑戰",
			"相信緣分，尊重彼此的成長和改變",
			"以感恩的心珍惜相處的每一刻",
		];

		// Add challenge-specific spiritual guidance
		challenges.forEach((challenge) => {
			if (challenge.includes("情緒")) {
				spiritualGuidance.push("學會情緒管理，以慈悲心對待自己和伴侶");
			} else if (challenge.includes("價值觀")) {
				spiritualGuidance.push("尊重差異，在多元中尋找和諧統一");
			}
		});

		// Add problem-specific spiritual guidance
		if (problem) {
			const problemLower = problem.toLowerCase();
			if (problemLower.includes("分手")) {
				spiritualGuidance.push("放下執著，相信一切都是最好的安排");
			} else if (problemLower.includes("背叛")) {
				spiritualGuidance.push("學會寬恕，為自己的心靈找到平靜");
			}
		}

		return spiritualGuidance.slice(0, 4); // Limit to 4 spiritual pieces
	};

	const generateSuccessIndicatorsFromAI = (aiData, problem) => {
		// Generate success indicators based on strengths and compatibility
		const strengths = aiData?.strengths || [];
		const indicators = [
			"雙方溝通變得更加開放和誠實",
			"衝突解決時間明顯縮短",
			"彼此支持和理解程度提升",
		];

		// Add strength-based indicators
		strengths.forEach((strength) => {
			if (strength.includes("溝通")) {
				indicators.push("能夠輕鬆討論敏感話題");
			} else if (strength.includes("信任")) {
				indicators.push("彼此分享更多個人想法");
			}
		});

		// Add problem-specific indicators
		if (problem) {
			const problemLower = problem.toLowerCase();
			if (problemLower.includes("溝通")) {
				indicators.push("爭吵頻率明顯減少");
			} else if (problemLower.includes("信任")) {
				indicators.push("願意分享更多私人資訊");
			}
		}

		return indicators.slice(0, 5); // Limit to 5 indicators
	};

	const generateTimelineFromAI = (aiData, problem) => {
		// Generate timeline based on problem severity and compatibility
		const score =
			parseInt(
				aiData?.compatibility?.score ||
					aiData?.compatibility?.overallScore
			) || 50;

		if (score >= 70) {
			return "2-4 週內可見明顯改善，3-6 個月達到穩定狀態";
		} else if (score >= 50) {
			return "1-2 個月開始看到進展，6-12 個月達到理想狀態";
		} else {
			return "3-6 個月的持續努力，12-18 個月建立穩固基礎";
		}
	};

	const generateMoveOnAdviceFromAI = (aiData, problem) => {
		// Generate advice on when to consider moving on
		const score =
			parseInt(
				aiData?.compatibility?.score ||
					aiData?.compatibility?.overallScore
			) || 50;

		if (score < 30) {
			return "如果在 6 個月的努力後仍然沒有改善，可能需要重新評估這段關係的未來";
		} else if (score < 50) {
			return "給彼此 12 個月的時間努力，如果核心問題持續存在且無法解決，考慮是否適合繼續";
		} else {
			return "建議持續努力至少 18 個月，大多數關係問題都可以通過時間和努力得到改善";
		}
	};

	const generateTargetedAdviceFromAI = (solutionData) => {
		// Combine all solution advice into targeted recommendations
		const allSolutions = solutionData?.solutions || [];
		return allSolutions.map((solution) => ({
			category: solution.type || "建議",
			advice: solution.description || "建議生成中...",
			urgency: solution.timeline?.includes("立即") ? "high" : "medium",
		}));
	};

	const generateActionPlanFromAI = (solutionData) => {
		// Create step-by-step action plan from AI solutions
		const solutions = solutionData?.solutions || [];
		const actionPlan = [];

		solutions.forEach((solution, index) => {
			if (solution.steps) {
				solution.steps.forEach((step, stepIndex) => {
					actionPlan.push({
						step: `${index + 1}.${stepIndex + 1}`,
						action: step,
						timeline: solution.timeline || "持續進行",
						category: solution.type || "行動方案",
					});
				});
			}
		});

		return actionPlan;
	};

	const generateSpecificSolutionFallback = () => {
		try {
			const user1Analysis = calculateWuxingAnalysis(user1);
			const user2Analysis = calculateWuxingAnalysis(user2);

			if (!user1Analysis || !user2Analysis) {
				setLoading(false);
				return;
			}

			// Analyze the specific problem type
			const problemAnalysis = analyzeSpecificProblem(specificProblem);

			// Calculate couple compatibility
			const compatibility = calculateCoupleCompatibility(
				user1Analysis,
				user2Analysis
			);

			// Generate targeted solution
			const targetedSolution = generateTargetedSolution(
				problemAnalysis,
				compatibility,
				user1Analysis,
				user2Analysis
			);

			setSolution({
				problemType: problemAnalysis.type,
				relationshipStatus: problemAnalysis.status,
				compatibility: compatibility,
				emotionalSupport: generateEmotionalSupport(problemAnalysis),
				practicalAdvice: targetedSolution.practical,
				spiritualGuidance: targetedSolution.spiritual,
				actionPlan: targetedSolution.actionPlan,
				timeline: targetedSolution.timeline,
				successIndicators: targetedSolution.successIndicators,
				whenToMoveOn: targetedSolution.whenToMoveOn,
			});

			setLoading(false);
		} catch (error) {
			console.error("Error generating specific solution:", error);
			setLoading(false);
		}
	};

	const analyzeSpecificProblem = (problem) => {
		if (!problem || typeof problem !== "string") {
			return {
				type: "general",
				status: "strengthen",
				keywords: [],
			};
		}

		const problemText = problem.toLowerCase();

		// Keywords for different problem types
		const breakupKeywords = [
			"分手",
			"分開",
			"分離",
			"離開",
			"結束",
			"break",
			"separated",
		];
		const cheatingKeywords = [
			"出軌",
			"劈腿",
			"第三者",
			"外遇",
			"背叛",
			"cheat",
			"affair",
		];
		const distanceKeywords = [
			"疏遠",
			"冷漠",
			"冷戰",
			"不理",
			"距離",
			"distant",
			"cold",
		];
		const strengthenKeywords = [
			"增進",
			"改善",
			"更好",
			"提升",
			"深化",
			"strengthen",
			"improve",
		];
		const commitmentKeywords = [
			"結婚",
			"訂婚",
			"承諾",
			"未來",
			"穩定",
			"marriage",
			"commitment",
		];

		let type = "general";
		let status = "strengthen";
		let keywords = [];

		if (breakupKeywords.some((keyword) => problemText.includes(keyword))) {
			type = "breakup";
			status = "repair";
			keywords.push("分手修復");
		}

		if (cheatingKeywords.some((keyword) => problemText.includes(keyword))) {
			type = "infidelity";
			status = "repair";
			keywords.push("出軌修復");
		}

		if (distanceKeywords.some((keyword) => problemText.includes(keyword))) {
			type = "emotional_distance";
			status = "repair";
			keywords.push("感情疏遠");
		}

		if (
			strengthenKeywords.some((keyword) => problemText.includes(keyword))
		) {
			type = "strengthen";
			status = "strengthen";
			keywords.push("關係增進");
		}

		if (
			commitmentKeywords.some((keyword) => problemText.includes(keyword))
		) {
			type = "commitment";
			status = "strengthen";
			keywords.push("承諾發展");
		}

		return { type, status, keywords };
	};

	const calculateCoupleCompatibility = (user1Analysis, user2Analysis) => {
		const element1 = user1Analysis.dominantElement;
		const element2 = user2Analysis.dominantElement;

		// Five elements compatibility matrix
		const compatibilityMatrix = {
			金金: { score: 75, relationship: "同元素共鳴" },
			金木: { score: 40, relationship: "金克木" },
			金水: { score: 85, relationship: "金生水" },
			金火: { score: 30, relationship: "火克金" },
			金土: { score: 80, relationship: "土生金" },
			木木: { score: 75, relationship: "同元素共鳴" },
			木水: { score: 85, relationship: "水生木" },
			木火: { score: 80, relationship: "木生火" },
			木土: { score: 40, relationship: "木克土" },
			水水: { score: 75, relationship: "同元素共鳴" },
			水火: { score: 35, relationship: "水火相剋" },
			水土: { score: 30, relationship: "土克水" },
			火火: { score: 75, relationship: "同元素共鳴" },
			火土: { score: 80, relationship: "火生土" },
			土土: { score: 75, relationship: "同元素共鳴" },
		};

		const key1 = element1 + element2;
		const key2 = element2 + element1;

		return (
			compatibilityMatrix[key1] ||
			compatibilityMatrix[key2] || { score: 60, relationship: "中性" }
		);
	};

	const generateEmotionalSupport = (problemAnalysis) => {
		const supportMessages = {
			breakup: {
				comfort:
					"分手雖然痛苦，但這可能是宇宙為你們安排的一個重新檢視關係的機會。",
				hope: "真正的愛情經得起考驗，如果你們有緣分，星象會指引你們重新相聚。",
				strength:
					"這段時間專注於自我成長，讓自己成為更好的人，才能吸引對方回來。",
			},
			infidelity: {
				comfort: "背叛帶來的傷痛很深，但請記住，這不代表你不夠好。",
				hope: "有些關係經過修復後會變得更加堅固，但前提是雙方都願意真心改變。",
				strength:
					"無論結果如何，這都是你學會自愛和設立界限的重要課程。",
			},
			emotional_distance: {
				comfort:
					"感情的起伏是自然的，就像月圓月缺一樣，這只是一個階段。",
				hope: "透過五行調和，你們可以重新找回彼此的共鳴頻率。",
				strength: "真誠的溝通和耐心是破冰的最好方法。",
			},
			strengthen: {
				comfort:
					"你們的感情已經有很好的基礎，現在是深化關係的絕佳時機。",
				hope: "根據你們的八字配對，這段關係有很大的成長潛力。",
				strength: "持續的關愛和理解會讓你們的感情越來越穩固。",
			},
			commitment: {
				comfort: "想要進一步承諾是美好的，這代表你們對這段關係有信心。",
				hope: "星象顯示，你們有建立長久關係的潛力。",
				strength: "慢慢來，讓關係自然發展到下一個階段。",
			},
		};

		return (
			supportMessages[problemAnalysis.type] ||
			supportMessages["strengthen"]
		);
	};

	const generateTargetedSolution = (
		problemAnalysis,
		compatibility,
		user1Analysis,
		user2Analysis
	) => {
		if (problemAnalysis.status === "repair") {
			return generateRepairSolution(
				problemAnalysis,
				compatibility,
				user1Analysis,
				user2Analysis
			);
		} else {
			return generateStrengthenSolution(
				problemAnalysis,
				compatibility,
				user1Analysis,
				user2Analysis
			);
		}
	};

	const generateRepairSolution = (
		problemAnalysis,
		compatibility,
		user1Analysis,
		user2Analysis
	) => {
		const baseScore = compatibility.score;
		const isRepairable = baseScore >= 50;

		if (!isRepairable && problemAnalysis.type === "infidelity") {
			// Low compatibility + infidelity = recommend moving on
			return {
				practical: [
					"根據你們的五行配對，這段關係的修復難度較大",
					"建議專注於自我療癒和成長",
					"考慮尋求專業心理諮詢師的幫助",
					"給自己充分的時間處理情感創傷",
				],
				spiritual: [
					"進行冥想和內觀，釋放負面情緒",
					"使用水晶療癒（如玫瑰石英）撫平心靈創傷",
					"在個人空間放置鮮花，提升正能量",
					"避免過度糾結於過去，把注意力轉向未來",
				],
				actionPlan: [
					"第1-2週：專注於情緒穩定和自我照顧",
					"第3-4週：開始重建自信和社交圈",
					"第1-2個月：探索新的興趣和目標",
					"第3個月後：考慮重新開始新的感情",
				],
				timeline: "建議給自己3-6個月的療癒期",
				successIndicators: [
					"能夠平靜地談論這段關係",
					"重新找回對生活的熱情",
					"對未來有明確的規劃和期待",
				],
				whenToMoveOn:
					"如果3個月後對方仍無真心悔改或重複犯錯，建議果斷放手。",
			};
		} else if (isRepairable) {
			// Repairable relationship
			return {
				practical: [
					"根據你們的五行搭配，這段關係還有修復的可能",
					"建議雙方暫時保持適當距離，冷靜思考",
					"透過書信或第三方傳達真心話",
					"設定明確的重建關係條件和底線",
				],
				spiritual: [
					`多使用${compatibility.relationship}的調和方法`,
					"在共同空間放置成對的物品象徵重歸於好",
					"選擇雙方五行互補的顏色作為和解象徵",
					"進行感恩練習，回憶美好時光",
				],
				actionPlan: [
					"第1週：各自反思和冷靜",
					"第2週：間接表達關懷和歉意",
					"第3-4週：嘗試輕鬆的互動和溝通",
					"第1-2個月：重建信任和親密感",
				],
				timeline: "修復期大約需要2-4個月",
				successIndicators: [
					"雙方願意坦誠溝通問題",
					"開始重建日常生活的連結",
					"對未來有共同的規劃討論",
				],
				whenToMoveOn:
					"如果2個月後關係仍無明顯改善，且對方不願配合，建議重新評估。",
			};
		}

		return {
			practical: ["請尋求專業感情諮詢師的協助"],
			spiritual: ["進行內心平靜的修練"],
			actionPlan: ["給自己時間思考"],
			timeline: "需要時間評估",
			successIndicators: ["內心平靜"],
			whenToMoveOn: "聽從內心的聲音",
		};
	};

	const generateStrengthenSolution = (
		problemAnalysis,
		compatibility,
		user1Analysis,
		user2Analysis
	) => {
		return {
			practical: [
				"定期安排約會時間，保持新鮮感",
				"學習彼此的愛的語言，用對方喜歡的方式表達愛",
				"建立共同目標和未來規劃",
				"保持個人成長，成為更好的自己",
			],
			spiritual: [
				`善用${compatibility.relationship}的優勢，增強感情連結`,
				"在臥室放置粉紅色或紅色物品增進浪漫",
				"一起進行感恩練習，珍惜彼此",
				"使用雙方五行相合的元素裝飾共同空間",
			],
			actionPlan: [
				"每週安排一次特別的約會",
				"每月進行一次深度談話分享",
				"每季度規劃一次小旅行或新體驗",
				"每年設定新的感情成長目標",
			],
			timeline: "持續進行，感情會穩步提升",
			successIndicators: [
				"彼此更加了解和支持",
				"衝突減少，溝通更加順暢",
				"對未來有明確共同願景",
			],
			whenToMoveOn: "當雙方成長方向不同且無法調和時，理性考慮未來。",
		};
	};

	if (loading) {
		return (
			<div className="w-full p-8 bg-white rounded-lg shadow-lg">
				<div className="flex items-center justify-center">
					<div className="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"></div>
					<span className="ml-2 text-gray-600">
						{t("loadingMessage")}
					</span>
				</div>
			</div>
		);
	}

	if (!solution) {
		return (
			<div className="w-full p-8 bg-white rounded-lg shadow-lg">
				<div className="text-center text-gray-500">
					<Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
					<p>{t("noDataMessage")}</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="w-full bg-white rounded-[45px] p-15"
			style={{
				boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
			}}
		>
			{/* Header */}
			<div className="px-4 py-2 mb-6 rounded">
				<h2
					className="flex items-center text-[#D91A5A] font-bold"
					style={{
						fontFamily: "Noto Serif TC, Serif",
						fontSize: "40px",
					}}
				>
					<Target className="w-8 h-8 mr-3" />
					{t("title")}
				</h2>
			</div>

			{/* Problem Analysis */}
			<div className="space-y-6">
				<div>
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Users className="w-5 h-5 mr-2" />
							{t("problemAnalysisTitle")}
						</h3>
					</div>
					<div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<h4
									className="mb-3 font-medium text-purple-800"
									style={{ fontSize: "15px" }}
								>
									{t("relationshipStatus")}
								</h4>
								<p
									className="mb-4 text-black"
									style={{ fontSize: "15px" }}
								>
									{solution.relationshipStatus === "repair"
										? t("statusRepair")
										: t("statusStrengthen")}
								</p>
								<h4
									className="mb-3 font-medium text-purple-800"
									style={{ fontSize: "15px" }}
								>
									{t("compatibilityScore")}
								</h4>
								<div className="flex items-center">
									<div className="w-24 h-2 mr-3 bg-gray-200 rounded-full">
										<div
											className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
											style={{
												width: `${solution.compatibility?.score || 50}%`,
											}}
										></div>
									</div>
									<span
										className="font-medium text-black"
										style={{ fontSize: "15px" }}
									>
										{solution.compatibility?.score || 50}%
									</span>
								</div>
								<p
									className="mt-2 text-gray-600"
									style={{ fontSize: "15px" }}
								>
									{solution.compatibility?.relationship ||
										"關係評估中..."}
								</p>
							</div>
							<div>
								<h4
									className="mb-3 font-medium text-purple-800"
									style={{ fontSize: "15px" }}
								>
									{t("problemType")}
								</h4>
								<p
									className="text-black"
									style={{ fontSize: "15px" }}
								>
									{solution.problemType === "breakup" &&
										t("problemTypes.breakup")}
									{solution.problemType === "infidelity" &&
										t("problemTypes.infidelity")}
									{solution.problemType ===
										"emotional_distance" &&
										t("problemTypes.emotional_distance")}
									{solution.problemType === "strengthen" &&
										t("problemTypes.strengthen")}
									{solution.problemType === "commitment" &&
										t("problemTypes.commitment")}
									{solution.problemType === "general" &&
										t("problemTypes.general")}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Emotional Support */}
				<div>
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Heart className="w-5 h-5 mr-2" />
							{t("emotionalSupportTitle")}
						</h3>
					</div>
					<div className="p-6 border border-pink-200 rounded-lg bg-pink-50">
						<div className="space-y-6">
							<div>
								<h4
									className="mb-3 font-medium text-pink-800"
									style={{ fontSize: "15px" }}
								>
									{t("hopeAndConfidence")}
								</h4>
								<p
									className="text-black"
									style={{ fontSize: "15px" }}
								>
									{solution.emotionalSupport?.hope ||
										"希望與信心建議生成中..."}
								</p>
							</div>
							<div>
								<h4
									className="mb-3 font-medium text-pink-800"
									style={{ fontSize: "15px" }}
								>
									{t("strengthAndGrowth")}
								</h4>
								<p
									className="text-black"
									style={{ fontSize: "15px" }}
								>
									{solution.emotionalSupport?.strength ||
										"力量與成長建議生成中..."}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Practical Advice */}
				<div>
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<CheckCircle className="w-5 h-5 mr-2" />
							{t("practicalAdviceTitle")}
						</h3>
					</div>
					<div className="p-6 border border-green-200 rounded-lg bg-green-50">
						<div className="space-y-4">
							{(solution.practicalAdvice || []).map(
								(advice, index) => (
									<div
										key={index}
										className="flex items-start"
									>
										<CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{advice}
										</span>
									</div>
								)
							)}
						</div>
					</div>
				</div>

				{/* Spiritual Guidance */}
				<div>
					<div
						className="px-4 py-2 mb-4 rounded"
						style={{ backgroundColor: "#D91A5A" }}
					>
						<h3 className="flex items-center text-lg text-white">
							<Lightbulb className="w-5 h-5 mr-2" />
							{t("spiritualGuidanceTitle")}
						</h3>
					</div>
					<div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50">
						<div className="space-y-4">
							{(solution.spiritualGuidance || []).map(
								(guidance, index) => (
									<div
										key={index}
										className="flex items-start"
									>
										<Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
										<span
											className="text-black"
											style={{ fontSize: "15px" }}
										>
											{guidance}
										</span>
									</div>
								)
							)}
						</div>
					</div>
				</div>

				{/* Action Plan & Timeline */}
				<div className="grid gap-6 md:grid-cols-2">
					<div>
						<div
							className="px-4 py-2 mb-4 rounded"
							style={{ backgroundColor: "#D91A5A" }}
						>
							<h3 className="flex items-center text-lg text-white">
								<Target className="w-5 h-5 mr-2" />
								{t("actionPlanTitle")}
							</h3>
						</div>
						<div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
							<div className="space-y-4">
								{(solution.actionPlan || []).map(
									(step, index) => (
										<div
											key={index}
											className="flex items-start"
										>
											<div className="flex items-center justify-center flex-shrink-0 w-6 h-6 mr-3 text-xs font-bold text-white bg-blue-500 rounded-full">
												{index + 1}
											</div>
											<div
												className="text-black"
												style={{ fontSize: "15px" }}
											>
												{typeof step === "string" ? (
													step
												) : (
													<div>
														<div
															className="mb-2 font-medium text-blue-800"
															style={{
																fontSize:
																	"15px",
															}}
														>
															{step.phase} (
															{step.duration})
														</div>
														{step.goals &&
															step.goals.length >
																0 && (
																<div className="mb-2">
																	<span
																		className="font-medium"
																		style={{
																			fontSize:
																				"15px",
																		}}
																	>
																		目標：
																	</span>
																	<span
																		style={{
																			fontSize:
																				"15px",
																		}}
																	>
																		{step.goals.join(
																			", "
																		)}
																	</span>
																</div>
															)}
														{step.actions &&
															step.actions
																.length > 0 && (
																<div>
																	<span
																		className="font-medium"
																		style={{
																			fontSize:
																				"15px",
																		}}
																	>
																		行動：
																	</span>
																	<span
																		style={{
																			fontSize:
																				"15px",
																		}}
																	>
																		{step.actions.join(
																			", "
																		)}
																	</span>
																</div>
															)}
													</div>
												)}
											</div>
										</div>
									)
								)}
							</div>
							<div className="pt-4 mt-6 border-t border-blue-200">
								<h4
									className="mb-3 font-medium text-blue-800"
									style={{ fontSize: "15px" }}
								>
									{t("expectedTimeline")}
								</h4>
								<p
									className="text-black"
									style={{ fontSize: "15px" }}
								>
									{solution.timeline || "時間規劃生成中..."}
								</p>
							</div>
						</div>
					</div>

					<div>
						<div
							className="px-4 py-2 mb-4 rounded"
							style={{ backgroundColor: "#D91A5A" }}
						>
							<h3 className="flex items-center text-lg text-white">
								<AlertTriangle className="w-5 h-5 mr-2" />
								{t("successIndicatorsTitle")}
							</h3>
						</div>
						<div className="p-6 border border-orange-200 rounded-lg bg-orange-50">
							<div className="mb-6">
								<h4
									className="mb-3 font-medium text-orange-800"
									style={{ fontSize: "15px" }}
								>
									{t("successIndicators")}
								</h4>
								<div className="space-y-3">
									{(solution.successIndicators || []).map(
										(indicator, index) => (
											<div
												key={index}
												className="flex items-start"
											>
												<div className="w-2 h-2 bg-orange-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
												<span
													className="text-black"
													style={{
														fontSize: "15px",
													}}
												>
													{indicator}
												</span>
											</div>
										)
									)}
								</div>
							</div>
							<div className="pt-4 border-t border-orange-200">
								<h4
									className="mb-3 font-medium text-orange-800"
									style={{ fontSize: "15px" }}
								>
									{t("whenToMoveOn")}
								</h4>
								<p
									className="text-black"
									style={{ fontSize: "15px" }}
								>
									{solution.whenToMoveOn ||
										"建議評估準則生成中..."}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoupleSpecificProblemSolution;
