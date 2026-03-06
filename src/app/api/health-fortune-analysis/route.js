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
				error: "API key not configured",
				analysis: generateMockHealthAnalysis(userInfo, wuxingData),
			});
		}

		// Call DeepSeek API
		const response = await fetch(
			"https://api.deepseek.com/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
					Accept: "application/json",
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [
						{
							role: "system",
							content:
								"你是一位專業的中醫師和命理師，擅長根據八字進行健康分析。請嚴格按照要求的JSON格式回應，不要添加任何額外的文字說明。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 3500,
					temperature: 0.5,
				}),
			}
		);

		if (!response.ok) {
			console.warn(
				`⚠️ DeepSeek API error: ${response.status}, using mock data`
			);
			return NextResponse.json({
				error: `API error: ${response.status}`,
				analysis: generateMockHealthAnalysis(userInfo, wuxingData),
			});
		}

		const aiData = await response.json();
		const aiContent = aiData.choices[0]?.message?.content;

		if (!aiContent) {
			console.warn("⚠️ No content from DeepSeek API, using mock data");
			return NextResponse.json({
				error: "No AI content received",
				analysis: generateMockHealthAnalysis(userInfo, wuxingData),
			});
		}

		// Try to parse AI response as JSON with comprehensive cleaning
		let analysis;
		let isAIGenerated = true;

		try {
			// Remove potential markdown formatting
			let cleanContent = aiContent
				.replace(/```json\n?/g, "")
				.replace(/```\n?/g, "")
				.trim();

			analysis = JSON.parse(cleanContent);
			console.log("✅ Successfully generated AI health analysis");
		} catch (parseError) {
			console.warn("⚠️ First parse failed:", parseError.message);

			// Enhanced JSON cleaning for unterminated strings and other issues
			try {
				let cleanedContent = aiContent
					.replace(/```json\n?/g, "")
					.replace(/```\n?/g, "")
					.trim();

				// Count quotes to detect unterminated strings
				const quoteCount = (cleanedContent.match(/"/g) || []).length;
				console.log(
					`🔧 Fixing unterminated string (${quoteCount} quotes)`
				);

				// If odd number of quotes, add closing quote at end
				if (quoteCount % 2 !== 0) {
					cleanedContent += '"';
				}

				// Additional cleaning: trailing commas only (avoid appending "}" which can corrupt JSON)
				cleanedContent = cleanedContent
					.replace(/,\s*$/, "")
					.replace(/,(\s*[}\]])/g, "$1");

				console.log("🔧 Applied cleaning, trying parse again");
				analysis = JSON.parse(cleanedContent);
				console.log("✅ Parsed JSON successfully after cleaning");
			} catch (secondParseError) {
				console.warn(
					"⚠️ Failed to parse AI response after cleaning, using mock data:",
					secondParseError.message
				);
				console.warn(
					"📄 Raw AI content (first 300 chars):",
					aiContent.substring(0, 300)
				);
				analysis = generateMockHealthAnalysis(userInfo, wuxingData);
				isAIGenerated = false; // Mark as mock data
			}
		}

		return NextResponse.json({
			analysis,
			isAIGenerated,
			success: true,
		});
	} catch (error) {
		console.error("Health fortune analysis API error:", error);
		return NextResponse.json({
			error: "Analysis failed",
			analysis: generateMockHealthAnalysis(userInfo, wuxingData),
			isAIGenerated: false,
			success: false,
		});
	}
}

function generateMockHealthAnalysis(userInfo, wuxingData) {
	const birthDate = new Date(userInfo.birthDateTime);
	const currentYear = new Date().getFullYear();
	const age = currentYear - birthDate.getFullYear();
	const dayMaster = wuxingData.dayStem || "癸";
	const dayMasterElement = wuxingData.dayStemWuxing || "水";
	const gender = userInfo.gender === "male" ? "男" : "女";

	// Get dynamic fortune periods
	const fortunePeriods = userInfo?.birthDateTime
		? getCurrentFortunePeriods(userInfo.birthDateTime, userInfo.gender)
		: null;
	const periods = fortunePeriods?.periods || [];
	const futurePeriod =
		periods.find((p) => p.status === "future") || periods[2];

	return {
		summary: {
			title: `${dayMasterElement}${dayMaster}交戰，養腎固本為要`,
			description: `日主${dayMaster}${dayMasterElement}坐${wuxingData.dayBranch || "丑"}土七殺，生於${wuxingData.monthBranch || "巳"}月火旺之時，時柱${wuxingData.hourStem || "壬"}${wuxingData.hourBranch || "子"}劫財助身。月支${wuxingData.monthBranch || "巳"}火生旺己土七殺，形成「火生土→土剋${dayMasterElement}」的攻身格局，健康需重點調和${dayMasterElement}土矛盾。`,
		},
		systems: {
			腎骨系統核心: {
				title: "腎骨系統核心",
				content: {
					description: `${dayMaster}${dayMasterElement}通腎，日支${wuxingData.dayBranch || "丑"}土為濕土晦火存${dayMasterElement}，雖有調和作用，但月柱己巳火土熾烈。`,
					advantages: `時柱${wuxingData.hourStem || "壬"}${wuxingData.hourBranch || "子"}強根護持，骨骼密度佳，傷口癒合能力強`,
					risks: [
						{
							period: `${gender}性青年期 (20 - 35歲)`,
							description: `火土運旺易耗${dayMasterElement === "水" ? "腎陰" : "肝血"}，可能出現${gender === "女" ? "經期不準、" : ""}腰肌勞損`,
						},
						{
							period: `${futurePeriod?.yearRange || "2040年後"}${futurePeriod?.dayun || "丙寅"}運`,
							description: `${futurePeriod?.dayun?.[1] || "寅"}巳申三刑，需防關節退行性病變`,
						},
					],
					keyYears: `${currentYear + 2}年丙午（火極）、${currentYear + 14}年戊午（三合火局）避免高溫曝曬`,
				},
			},
			代謝循環特質: {
				title: "代謝循環特質",
				content: {
					description: `${wuxingData.monthBranch || "巳"}火當令透己土，火土旺而${dayMasterElement}受制：`,
					bloodCharacteristics: `血粘稠度易偏高（火煉金→金生${dayMasterElement}不足），${currentYear + 7}年後需定期檢測血脂`,
					digestiveFeatures: `${wuxingData.dayBranch || "丑"}土為濕土，常現脾胃濕熱（食慾好但消化滯緩），忌冰飲加重濕氣`,
					skinConcerns: `己土七殺主皮膚屏障弱，換季易發蕁麻疹（${currentYear}年${wuxingData.dayBranch || "辰"}${wuxingData.dayBranch || "丑"}破尤甚）`,
				},
			},
			神經免疫平衡: {
				title: "神經免疫平衡",
				content: {
					description: `月令${wuxingData.monthBranch || "巳"}火主心神，七殺攻身易心緒不寧：`,
					mentalState: `${wuxingData.yearStem}${wuxingData.yearBranch}劫財奪${dayMasterElement}，思慮過度，夜間易失眠（尤其亥時23-1點）`,
					immuneSystem: `日坐七殺土燥${dayMasterElement}，免疫力呈週期性波動，秋冬（申酉月）抵抗力較弱`,
					seasonalCare: `春天（寅卯月）肝${dayMasterElement}同源，是調理最佳時機，建議針灸或艾灸。`,
				},
			},
		},
		advice: {
			diet: `飲食宜${dayMasterElement === "水" ? "黑色補腎" : "綠色養肝"}：黑豆、海帶、紫菜（補${dayMasterElement}制火）；忌辛辣上火食品，每餐後散步15分鐘助消化。`,
			exercise: `游泳最合適（一周2-3次，每次30-45分鐘），補${dayMasterElement}又降火，增強體力；中午11點到1點別劇烈運動，免得傷心氣。`,
			lifeStageReminder: `${periods[1]?.startYear || currentYear + 5}年開始走${periods[1]?.dayun || "丙寅"}運，春天（3-5月）要做肝膽排毒（像喝蒲公英茶或找專業調理），幫肝臟順氣，順應節氣變化。`,
		},
	};
}
