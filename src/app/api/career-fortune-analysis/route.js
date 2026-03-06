import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const { prompt, userInfo, wuxingData } = await request.json();

		const hasApiKey = !!(
			process.env.DEEPSEEK_API_KEY || process.env.API_KEY
		);
		console.log("🏢 Career Analysis Request:", {
			hasPrompt: !!prompt,
			userGender: userInfo?.gender,
			dayMaster: wuxingData?.dayStem,
			hasDeepSeekKey: hasApiKey,
			apiKeySource: process.env.DEEPSEEK_API_KEY
				? "DEEPSEEK_API_KEY"
				: process.env.API_KEY
					? "API_KEY"
					: "NONE",
		});

		const response = await generateCareerAnalysisWithAI(
			prompt,
			userInfo,
			wuxingData
		);

		console.log("✅ Career Analysis Generated Successfully");

		return NextResponse.json({
			success: true,
			analysis: response,
			isAIGenerated: hasApiKey,
		});
	} catch (error) {
		console.error("❌ Career Fortune Analysis API Error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to generate career analysis" },
			{ status: 500 }
		);
	}
}

async function generateCareerAnalysisWithAI(prompt, userInfo, wuxingData) {
	// DEEPSEEK AI INTEGRATION
	try {
		console.log("🔑 Attempting DeepSeek API call for career analysis...");

		const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
		console.log(
			"🔍 API Key found:",
			apiKey
				? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
				: "NOT FOUND"
		);

		if (!apiKey || apiKey === "your_actual_deepseek_api_key_here") {
			throw new Error("DeepSeek API key not configured");
		}

		const response = await fetch(
			"https://api.deepseek.com/v1/chat/completions",
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
								"你是一位專業的命理師和職業規劃師，擅長根據八字進行事業分析。請嚴格按照要求的JSON格式回應，不要添加任何額外的文字說明。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					temperature: 0.3,
					max_tokens: 4000,
					stream: false,
				}),
			}
		);

		console.log("📡 DeepSeek Response Status:", response.status);

		if (!response.ok) {
			const errorData = await response.text();
			console.log("❌ DeepSeek API Error:", errorData);
			throw new Error(
				`API request failed: ${response.status} - ${errorData}`
			);
		}

		const data = await response.json();
		console.log("✅ DeepSeek API Success for career analysis");

		if (data.choices && data.choices[0] && data.choices[0].message) {
			return parseAIResponse(
				data.choices[0].message.content,
				userInfo,
				wuxingData
			);
		} else {
			console.log(
				"⚠️ Unexpected response format:",
				JSON.stringify(data, null, 2)
			);
			throw new Error("Invalid API response format");
		}
	} catch (error) {
		console.log(
			"🔄 DeepSeek AI unavailable for career, using structured mock data:",
			error.message
		);
		// Fallback to intelligent mock data
		return generateMockResponse(userInfo, wuxingData);
	}
}

function parseAIResponse(aiResponse, userInfo, wuxingData) {
	try {
		// Try to parse JSON response from AI
		let parsedResponse;

		// Clean the response (remove code blocks if present)
		let cleanResponse = aiResponse.trim();
		if (cleanResponse.startsWith("```json")) {
			cleanResponse = cleanResponse
				.replace(/```json\n?/, "")
				.replace(/\n?```$/, "");
		} else if (cleanResponse.startsWith("```")) {
			cleanResponse = cleanResponse
				.replace(/```\n?/, "")
				.replace(/\n?```$/, "");
		}

		parsedResponse = JSON.parse(cleanResponse);

		// Validate the structure and add any missing fields
		return validateAndStructureCareerResponse(
			parsedResponse,
			userInfo,
			wuxingData
		);
	} catch (error) {
		console.log(
			"Error parsing AI career response, using fallback:",
			error.message
		);
		// If JSON parsing fails, return structured mock data
		return generateMockResponse(userInfo, wuxingData);
	}
}

function validateAndStructureCareerResponse(response, userInfo, wuxingData) {
	// Ensure the response has the correct structure
	const structured = {
		summary: {
			title: response.summary?.title || `傷官制殺，專業權威之路`,
			description:
				response.summary?.description || "基於八字分析的事業運勢總結",
		},
		talents: {
			天賦特質解碼: {
				title: "天賦特質解碼",
				description:
					response.talents?.["天賦特質解碼"]?.description || null,
				content: response.talents?.["天賦特質解碼"]?.content || [
					{
						name: `${wuxingData.yearStem}${wuxingData.yearBranch}傷官`,
						description: "核心優勢分析",
						attention: "注意事項說明",
					},
				],
			},
			二十年黃金賽道: {
				title: "二十年黃金賽道",
				content: response.talents?.["二十年黃金賽道"]?.content || {
					periods: [
						{
							years: "2025-2035",
							luck: "大運",
							action: "關鍵動作",
							bestYear: "最佳年份",
							warning: "風險預警",
						},
					],
				},
			},
			權力巔峰標誌: {
				title: "權力巔峰標誌",
				content: response.talents?.["權力巔峰標誌"]?.content || {
					peakYear: "巔峰年份",
					peakDescription: "權力表現",
					bestPartners: "最佳合作",
					avoidIndustries: "行業紅線",
				},
			},
		},
		strategies: {
			officeLayout: response.strategies?.officeLayout || {
				title: "辦公室佈局",
				description: "佈局建議",
				details: "詳細說明",
				warning: "禁忌事項",
			},
			annualStrategy: response.strategies?.annualStrategy || {
				title: "流年借力",
				year: "特定年份",
				description: "格局優勢",
				benefit: "利用方式",
			},
			lifelongTaboo: response.strategies?.lifelongTaboo || {
				title: "終身禁忌",
				warning: "禁忌行為",
				reason: "理論解釋",
			},
		},
	};

	return structured;
}

function generateMockResponse(userInfo, wuxingData) {
	const birthDate = new Date(userInfo.birthDateTime);
	const currentYear = new Date().getFullYear();
	const age = currentYear - birthDate.getFullYear();
	const dayMaster = wuxingData.dayStem || "甲";
	const dayMasterElement = wuxingData.dayStemWuxing || "木";
	const gender = userInfo.gender === "male" ? "男" : "女";

	return {
		summary: {
			title: `傷官制殺，專業權威之路`,
			description: `年柱${wuxingData.yearStem}${wuxingData.yearBranch}傷官駕殺（制${wuxingData.monthStem}中${wuxingData.monthBranch}金），月柱${wuxingData.monthStem}${wuxingData.monthBranch}七殺透干，構成「傷官制殺」貴格，適合金性權威職業。`,
		},
		talents: {
			天賦特質解碼: {
				title: "天賦特質解碼",
				description: null,
				content: [
					{
						name: `${wuxingData.yearStem}${wuxingData.yearBranch}傷官`,
						description: `${wuxingData.yearStem}${dayMasterElement}代表生發與創新，傷官格賦予顛覆性思維，擅長打破常規，轉化危機為機會，能在混亂中快速識別問題核心，提出獨到解決方案。`,
						attention: `注意事項：傷官過旺易招是非，職場中謹言慎行。可佩戴綠玉吊墜，化傷為財，穩定情緒。`,
					},
					{
						name: `${wuxingData.monthStem}${wuxingData.monthBranch}七殺`,
						description: `${wuxingData.monthStem}土穩重厚實，七殺主權威與壓力，賦予極強抗壓能力與執行力，適合高壓行業。能在緊迫環境中保持冷靜，高效決策。`,
						attention: `注意事項：七殺為忌時易生疲勞，注意休息；辦公桌右後方（白虎位）放置黑曜石球，化殺生身，防小人干擾。`,
					},
					{
						name: `${wuxingData.hourStem}${wuxingData.hourBranch}正印`,
						description: `${wuxingData.hourStem}${wuxingData.hourStemWuxing}柔韌滲透，代表智慧與洞察，主滲透分析力，利於情報分析、市場調研或數據挖掘，能深入挖掘隱藏信息，預測趨勢。`,
						attention: `注意事項：${wuxingData.hourStemWuxing}喜流動，避久坐辦公；家中北方位（坎位）擺放流水景觀（小魚缸，3-5條魚），旺水氣，助思維敏捷。`,
					},
				],
			},
			二十年黃金賽道: {
				title: "二十年黃金賽道",
				content: {
					periods: [
						{
							years: `${currentYear} - ${currentYear + 10}`,
							luck: "丁卯運",
							action: "考取司法/醫師資格",
							bestYear: `${currentYear + 2}丁未年最佳`,
							warning: `${currentYear + 6}辛亥年慎言辭職`,
						},
						{
							years: `${currentYear + 10} - ${currentYear + 20}`,
							luck: "丙寅運",
							action: "組建專業團隊",
							bestYear: `${currentYear + 13}戊午年契機`,
							warning: "避開東南亞市場（寅巳申三刑）",
						},
						{
							years: `${currentYear + 20} - ${currentYear + 30}`,
							luck: "乙丑運",
							action: "創立行業標準",
							bestYear: `${currentYear + 21}丙寅年`,
							warning: "防下屬背叛（丑戌刑）",
						},
					],
				},
			},
			權力巔峰標誌: {
				title: "權力巔峰標誌",
				content: {
					peakYear: `${currentYear + 24}己巳年`,
					peakDescription: "己土殺星透干，掌機構決策權",
					bestPartners: "猴（申）、鼠（子）、龍（辰）三合水局",
					avoidIndustries:
						"遠離地產業（土重剋水）、娛樂業（火旺耗身）",
				},
			},
		},
		strategies: {
			officeLayout: {
				title: "辦公室佈局",
				description: "正西放銅質文昌塔（申金位）",
				details:
					"銅質文昌塔，放置於辦公桌正西或辦公室西牆邊，底座穩固，塔尖朝上，增強文昌星能量，助思考敏捷與職場表現。",
				warning:
					"正西避免放置紅色物品（如紅色文件夾或裝飾），以免火剋金，削弱文昌塔功效；保持該區域整潔，避免雜物堆積。",
			},
			annualStrategy: {
				title: "流年借力",
				year: `${currentYear + 4}年為己酉年`,
				description:
					"天干己土（印星）與地支酉金（七殺）形成殺印相生格局",
				benefit: `利於權力提升與職場突破。此年你的${dayMaster}${dayMasterElement}日主得印星生助，思維清晰，決策果斷，適合競聘管理職位或承擔更高責任。`,
			},
			lifelongTaboo: {
				title: "終身禁忌",
				warning: "勿與上司發生戀情（七殺為忌神）",
				reason: "七殺為忌神，代表壓力與權威，若與上司發展戀情，易因權力不平衡引發職場危機，影響事業前途，甚至導致名譽損失或職位不穩。",
			},
		},
	};
}
