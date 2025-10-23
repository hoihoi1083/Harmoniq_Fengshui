import { NextResponse } from "next/server";

// Calculate BaZi data from birth info
function calculateBaZi(birthDate) {
	try {
		const date = new Date(birthDate);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();

		// Heavenly Stems (天干)
		const heavenlyStems = [
			"甲",
			"乙",
			"丙",
			"丁",
			"戊",
			"己",
			"庚",
			"辛",
			"壬",
			"癸",
		];
		// Earthly Branches (地支)
		const earthlyBranches = [
			"子",
			"丑",
			"寅",
			"卯",
			"辰",
			"巳",
			"午",
			"未",
			"申",
			"酉",
			"戌",
			"亥",
		];

		// Calculate year pillar
		const yearStemIndex = (year - 4) % 10; // 甲子年为公元4年
		const yearBranchIndex = (year - 4) % 12;
		const yearPillar =
			heavenlyStems[yearStemIndex] + earthlyBranches[yearBranchIndex];

		// Calculate month pillar (simplified)
		const monthStemIndex = (yearStemIndex * 2 + month) % 10;
		const monthBranchIndex = (month + 1) % 12;
		const monthPillar =
			heavenlyStems[monthStemIndex] + earthlyBranches[monthBranchIndex];

		// Calculate day pillar (simplified - using days since epoch)
		const daysSinceEpoch = Math.floor(
			date.getTime() / (1000 * 60 * 60 * 24)
		);
		const dayStemIndex = (daysSinceEpoch + 4) % 10;
		const dayBranchIndex = (daysSinceEpoch + 4) % 12;
		const dayPillar =
			heavenlyStems[dayStemIndex] + earthlyBranches[dayBranchIndex];

		// Hour pillar would need actual birth hour
		const hourPillar = "甲子"; // Default for now

		return {
			year: yearPillar,
			month: monthPillar,
			day: dayPillar,
			hour: hourPillar,
		};
	} catch (error) {
		console.error("BaZi calculation error:", error);
		return null;
	}
}

// Parse emergency feng shui recommendations
function parseEmergencyFengShui(content, isSimplified = false) {
	try {
		if (!content || typeof content !== "string") {
			console.log("⚠️ Invalid content provided to parser");
			return null;
		}

		console.log("🔍 Parsing content:", content.substring(0, 200) + "...");

		// Colors for different recommendations
		const colors = ["#B08D57", "#C4839F", "#7B8B5C"];

		// Split content into sections by common patterns
		const sections = content
			.split(/\n\s*\n/)
			.filter((section) => section.trim().length > 0);
		console.log("📝 Found sections:", sections.length);

		const recommendations = [];

		for (
			let i = 0;
			i < sections.length && recommendations.length < 3;
			i++
		) {
			const section = sections[i].trim();
			const lines = section
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			if (lines.length >= 2) {
				// First line is likely the title, rest is description
				const title = lines[0]
					.replace(/^\d+[\.\)]\s*/, "")
					.replace(/^【|】$/g, "");
				const description = lines.slice(1).join(" ");

				if (title.length > 0 && description.length > 0) {
					recommendations.push({
						title: title,
						description: description,
						color: colors[recommendations.length],
					});
				}
			}
		}

		console.log("✅ Parsed recommendations:", recommendations.length);

		// If we still don't have enough, try a different approach
		if (recommendations.length === 0) {
			// Try to extract any lines that look like feng shui recommendations
			const allLines = content
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 20);

			for (
				let i = 0;
				i < allLines.length && recommendations.length < 3;
				i++
			) {
				const line = allLines[i];
				// Match both Traditional and Simplified Chinese keywords
				if (
					line.includes("擺放") ||
					line.includes("摆放") ||
					line.includes("點燃") ||
					line.includes("点燃") ||
					line.includes("放置") ||
					line.includes("鋪設") ||
					line.includes("铺设")
				) {
					// This looks like a feng shui action
					const nextLine = allLines[i + 1];
					recommendations.push({
						title: line,
						description:
							nextLine ||
							"具體的風水改善建議，有助於提升感情和諧。",
						color: colors[recommendations.length],
					});
				}
			}
		}

		// If no recommendations were parsed, return null to trigger fallback
		if (recommendations.length === 0) {
			console.log("⚠️ No recommendations parsed from AI response");
			return null;
		}

		// Ensure we have at least 3 recommendations with proper fallback
		while (recommendations.length < 3) {
			const traditionalFallbacks = [
				{
					title: "臥室擺放金屬風鈴",
					description:
						"在臥室東側掛置小型金屬風鈴，調和五行能量，增強感情和諧，每日清晨輕撥一次。",
					color: colors[0],
				},
				{
					title: "客廳點燃暖色蠟燭",
					description:
						"每晚點燃暖黃色蠟燭30分鐘，營造溫馨氛圍，促進深度溝通，建議使用天然蜂蠟。",
					color: colors[1],
				},
				{
					title: "床頭放置紅色元素",
					description:
						"在床頭擺放紅色靠枕或花朵，激活愛情能量，增強彼此感情連結。",
					color: colors[2],
				},
			];

			const simplifiedFallbacks = [
				{
					title: "卧室摆放金属风铃",
					description:
						"在卧室东侧挂置小型金属风铃，调和五行能量，增强感情和谐，每日清晨轻拨一次。",
					color: colors[0],
				},
				{
					title: "客厅点燃暖色蜡烛",
					description:
						"每晚点燃暖黄色蜡烛30分钟，营造温馨氛围，促进深度沟通，建议使用天然蜂蜡。",
					color: colors[1],
				},
				{
					title: "床头放置红色元素",
					description:
						"在床头摆放红色靠枕或花朵，激活爱情能量，增强彼此感情连结。",
					color: colors[2],
				},
			];

			const fallbackRecs = isSimplified
				? simplifiedFallbacks
				: traditionalFallbacks;
			recommendations.push(fallbackRecs[recommendations.length]);
		}

		return {
			recommendations: recommendations.slice(0, 3), // Maximum 3 recommendations
		};
	} catch (error) {
		console.error("Parsing error:", error);
		return null;
	}
}

export async function POST(request) {
	try {
		const {
			femaleUser,
			maleUser,
			femaleBazi,
			maleBazi,
			requestType,
			isSimplified = false,
		} = await request.json();

		console.log(
			"📥 /api/emergency-feng-shui received isSimplified:",
			isSimplified
		);

		if (!femaleUser || !maleUser) {
			return NextResponse.json(
				{ error: "Missing user data" },
				{ status: 400 }
			);
		}

		// Calculate BaZi if not provided
		const femaleBaziData =
			femaleBazi || calculateBaZi(femaleUser.birthDate);
		const maleBaziData = maleBazi || calculateBaZi(maleUser.birthDate);

		if (!femaleBaziData || !maleBaziData) {
			return NextResponse.json(
				{ error: "Failed to calculate BaZi data" },
				{ status: 400 }
			);
		}

		// Create prompt for emergency feng shui recommendations
		const traditionalPrompt = `
作為專業風水師，請為這對情侶提供72小時內的緊急風水改善方案。

女方八字：${femaleBaziData.year} ${femaleBaziData.month} ${femaleBaziData.day} ${femaleBaziData.hour}
男方八字：${maleBaziData.year} ${maleBaziData.month} ${maleBaziData.day} ${maleBaziData.hour}

請提供3個具體的風水改善建議，每個建議需要：
1. 具體的行動方案（標題）
2. 詳細的操作說明和風水原理（內容）

要求：
- 每個建議都要具體可執行
- 說明風水原理和效果
- 重點關注感情和和諧
- 內容控制在80-100字內
- 不要使用標題符號或格式符號
- 請使用繁體中文回答

請直接提供3個建議：
`;

		const simplifiedPrompt = `
作为专业风水师，请为这对情侣提供72小时内的紧急风水改善方案。

女方八字：${femaleBaziData.year} ${femaleBaziData.month} ${femaleBaziData.day} ${femaleBaziData.hour}
男方八字：${maleBaziData.year} ${maleBaziData.month} ${maleBaziData.day} ${maleBaziData.hour}

请提供3个具体的风水改善建议，每个建议需要：
1. 具体的行动方案（标题）
2. 详细的操作说明和风水原理（内容）

要求：
- 每个建议都要具体可执行
- 说明风水原理和效果
- 重点关注感情和和谐
- 内容控制在80-100字内
- 不要使用标题符号或格式符号
- 请只使用简体中文回答

请直接提供3个建议：
`;

		const prompt = isSimplified ? simplifiedPrompt : traditionalPrompt;
		console.log(
			"🎯 /api/emergency-feng-shui using prompt:",
			isSimplified ? "SIMPLIFIED (简体)" : "TRADITIONAL (繁體)"
		);

		const response = await fetch(
			"https://api.deepseek.com/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [
						{
							role: "system",
							content: isSimplified
								? "你是专业的风水师，专门提供实用的风水改善建议。回答要具体、实用、易于执行。请只使用简体中文。"
								: "你是專業的風水師，專門提供實用的風水改善建議。回答要具體、實用、易於執行。請使用繁體中文。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					temperature: 0.7,
					max_tokens: 1000,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`DeepSeek API error: ${response.status}`);
		}

		const data = await response.json();
		const aiContent = data.choices?.[0]?.message?.content;

		if (!aiContent) {
			throw new Error("No content received from AI");
		}

		console.log("🤖 AI Response:", aiContent);

		// Parse the AI response
		const parsedData = parseEmergencyFengShui(aiContent, isSimplified);
		console.log("📊 Parsed Data:", parsedData);

		if (!parsedData) {
			// Return fallback data
			const traditionalFallback = {
				recommendations: [
					{
						title: "臥室擺放金屬擺件",
						description:
							"在臥室東側放置小型銅製飾品，能調和五行能量，增強感情穩定性，建議每晚睡前整理一次。",
						color: "#B08D57",
					},
					{
						title: "床頭點燃暖色蠟燭",
						description:
							"每晚點燃暖黃色蠟燭約30分鍾，營造溫馨氛圍，暖光能柔化彼此情緒，促進深度溝通。",
						color: "#C4839F",
					},
					{
						title: "客廳西南角鋪紅毯",
						description:
							"在客廳西南方向鋪設小塊紅色地毯，激活坤土能量，增強家庭和諧與包容心。",
						color: "#7B8B5C",
					},
				],
			};

			const simplifiedFallback = {
				recommendations: [
					{
						title: "卧室摆放金属摆件",
						description:
							"在卧室东侧放置小型铜制饰品，能调和五行能量，增强感情稳定性，建议每晚睡前整理一次。",
						color: "#B08D57",
					},
					{
						title: "床头点燃暖色蜡烛",
						description:
							"每晚点燃暖黄色蜡烛约30分钟，营造温馨氛围，暖光能柔化彼此情绪，促进深度沟通。",
						color: "#C4839F",
					},
					{
						title: "客厅西南角铺红毯",
						description:
							"在客厅西南方向铺设小块红色地毯，激活坤土能量，增强家庭和谐与包容心。",
						color: "#7B8B5C",
					},
				],
			};

			return NextResponse.json(
				isSimplified ? simplifiedFallback : traditionalFallback
			);
		}

		return NextResponse.json(parsedData);
	} catch (error) {
		console.error("Emergency Feng Shui API error:", error);
		return NextResponse.json(
			{
				recommendations: [
					{
						title: "生成建議中",
						description: "正在分析您的風水配置，請稍候片刻...",
						color: "#B08D57",
					},
				],
			},
			{ status: 200 }
		);
	}
}
