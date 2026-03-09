import { NextResponse } from "next/server";
import {
	getCurrentFortunePeriods,
	formatFortunePeriod,
} from "@/lib/fortunePeriodCalculator";

export async function POST(request) {
	try {
		const { prompt, userInfo, wuxingData } = await request.json();

		// Use existing DeepSeek API key from environment
		const apiKey = process.env.DEEPSEEK_API_KEY;

		if (!apiKey) {
			console.warn("⚠️ DEEPSEEK_API_KEY not found, using mock data");
			return NextResponse.json({
				success: true,
				analysis: generateMockWealthAnalysis(userInfo, wuxingData),
				isAIGenerated: false,
			});
		}

		try {
			// Call DeepSeek API
			const response = await fetch(
				"https://api.deepseek.com/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model: "deepseek-chat",
						messages: [
						{
							role: "system",
							content:
								"你是一位專業的八字命理師，專精財運分析。請基於用戶的八字信息，提供準確、詳細的財運發展分析。請嚴格按照要求的JSON格式回應，不要添加任何額外的文字說明或 markdown 代碼塊。",
							},
							{
								role: "user",
								content: prompt,
							},
						],
						temperature: 0.5,
						max_tokens: 3500,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.text();
				console.error(
					"❌ DeepSeek API Error:",
					response.status,
					errorData
				);
				throw new Error(`DeepSeek API error: ${response.status}`);
			}

			const data = await response.json();
			const aiContent = data.choices[0]?.message?.content;

			if (!aiContent) {
				throw new Error("No content in AI response");
			}

			// Parse JSON with same robust cleaning as health/career (fixes truncation, unterminated strings)
			let parsedAnalysis;
			try {
				let cleanContent = aiContent
					.replace(/```json\n?/g, "")
					.replace(/```\n?/g, "")
					.trim();
				parsedAnalysis = JSON.parse(cleanContent);
				console.log("✅ Successfully generated AI wealth analysis");
			} catch (parseError) {
				console.warn("⚠️ Wealth first parse failed:", parseError.message);
				try {
					let cleanedContent = aiContent
						.replace(/```json\n?/g, "")
						.replace(/```\n?/g, "")
						.trim();
					const quoteCount = (cleanedContent.match(/"/g) || []).length;
					if (quoteCount % 2 !== 0) cleanedContent += '"';
					cleanedContent = cleanedContent
						.replace(/,\s*$/, "")
						.replace(/,(\s*[}\]])/g, "$1");
					parsedAnalysis = JSON.parse(cleanedContent);
					console.log("✅ Wealth JSON parsed after cleaning");
				} catch (secondErr) {
					console.warn(
						"⚠️ Wealth parse failed after cleaning, using mock:",
						secondErr.message
					);
					console.warn(
						"📄 Wealth raw (first 400 chars):",
						aiContent.substring(0, 400)
					);
					throw new Error("Invalid JSON from AI");
				}
			}

			// Validate required structure
			if (
				!parsedAnalysis.summary ||
				!parsedAnalysis.threeStages ||
				!parsedAnalysis.wealthRules
			) {
				console.warn(
					"⚠️ AI response missing required fields, using mock data"
				);
				throw new Error("Invalid response structure");
			}

			return NextResponse.json({
				success: true,
				analysis: parsedAnalysis,
				isAIGenerated: true,
			});
		} catch (apiError) {
			console.warn(
				"🔄 AI API failed, falling back to mock data:",
				apiError.message
			);
			return NextResponse.json({
				success: true,
				analysis: generateMockWealthAnalysis(userInfo, wuxingData),
				isAIGenerated: false,
				error: apiError.message,
			});
		}
	} catch (error) {
		console.error("💥 Wealth analysis API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

function generateMockWealthAnalysis(userInfo, wuxingData) {
	const birthDate = new Date(userInfo.birthDateTime);
	const currentYear = new Date().getFullYear();
	const age = currentYear - birthDate.getFullYear();
	const dayMaster = wuxingData.dayStem || "壬";
	const dayMasterElement = wuxingData.dayStemWuxing || "水";

	// Get dynamic fortune periods
	const fortunePeriods = userInfo?.birthDateTime
		? getCurrentFortunePeriods(userInfo.birthDateTime, userInfo.gender)
		: null;
	const periods = fortunePeriods?.periods || [];
	const foundationPeriod = periods[0] || {
		dayun: "丙寅",
		yearRange: "2025-2034",
		ageRange: "25-34歲",
	};
	const explosivePeriod = periods[1] || {
		dayun: "丁卯",
		yearRange: "2035-2044",
		ageRange: "35-44歲",
	};
	const conservativePeriod = periods[2] || {
		dayun: "壬戌",
		yearRange: "2045-2054",
		ageRange: "45-54歲",
	};

	return {
		summary: {
			title: `劫財奪財，置業守成為上`,
			description: `月干${wuxingData.monthStem}土七殺透出，時柱${dayMaster}${wuxingData.dayBranch}劫財坐旺，全局無明財星，財富需通過制殺獲取（金製木→木疏土→土生金循環）。`,
		},
		threeStages: {
			奠基期: {
				title: "奠基期",
				ageRange: foundationPeriod.ageRange,
				fortune: `${foundationPeriod.dayun}運`,
				content: {
					phase1: {
						name: formatFortunePeriod(foundationPeriod),
						description: `${foundationPeriod.dayun[0]}火偏財虛透，${foundationPeriod.dayun[1]}木食神生財，主勞力得財`,
						keyYear: `${foundationPeriod.startYear + 3}年：利考金融證照（證券/基金從業資格）`,
						trapYear: `致命陷阱：${foundationPeriod.startYear + 6}年慎防P2P理財`,
					},
					phase2: {
						name: `次階段（${foundationPeriod.startYear + 5} - ${foundationPeriod.endYear}）`,
						description: `${foundationPeriod.dayun[0]}火正財合身，${foundationPeriod.dayun[1]}木傷官生財，收入躍升但開支激增`,
						warning: `${foundationPeriod.endYear - 2}年：合作投資需謹慎`,
					},
				},
			},
			爆發期: {
				title: "爆發期",
				ageRange: explosivePeriod.ageRange,
				fortune: `${explosivePeriod.dayun}運`,
				content: {
					description: `${explosivePeriod.dayun[0]}木傷官制殺，${explosivePeriod.dayun[1]}水祿神助身`,
					keyYear: `${explosivePeriod.startYear + 5}年：不動產增值收益可觀`,
					industries: `核心領域：${explosivePeriod.dayun[1] === "子" ? "水處理工程" : "相關行業"}、法律服務`,
					peakYear: `財富峰值：${explosivePeriod.endYear - 2}年，利資源貿易`,
				},
			},
			守成期: {
				title: "守成期",
				ageRange: conservativePeriod.ageRange,
				fortune: `${conservativePeriod.dayun}運`,
				content: {
					description: `${conservativePeriod.dayun[1]}土制劫財開財庫，財運穩定`,
					keyYear: `${conservativePeriod.startYear + 5}年：金水相生，可建立家族信託基金`,
					avoidIndustries: "忌諱產業：餐飲（火）、林業（木剋土）",
				},
			},
		},
		wealthRules: {
			assetAllocation: {
				title: "資產配比",
				realEstate: "70%不動產：投資房地產，確保穩健回報",
				preciousMetals:
					"20%貴金屬：購買黃金、銀條或相關ETF，作為抗通脹保值資產",
				cash: "10%流動現金：保留現金或貨幣基金，應對緊急需求或短期投資機會",
			},
			partnerships: {
				title: "合作禁忌",
				zodiacA: {
					animal: "生肖馬（午沖子）",
					description:
						"屬馬者五行屬火，與子鼠相沖，合作易生衝突，導致決策分歧或財務損失。",
				},
				zodiacB: {
					animal: "生肖兔（卯刑子）",
					description:
						"屬兔者五行屬木，與子鼠相刑，易引發信任危機或隱性競爭，影響財運。",
				},
			},
			wealthDirection: {
				title: "催財方位",
				location: "臥室西北角（戌位）",
				description:
					"西北角屬乾卦，主財運與貴人運。擺放白水晶簇，可聚財旺氣，增強正財運勢。",
				warning:
					"注意事項：西北角避免堆放雜物，保持通風明亮；忌擺放尖銳物品或電子產品，以免破壞財氣場。",
			},
		},
	};
}
