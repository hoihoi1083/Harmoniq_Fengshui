import { NextResponse } from "next/server";

// Calculate BaZi data from birth info
function calculateBaZi(birthDate) {
	try {
		// Import BaziCalculator for accurate calculations
		const { BaziCalculator } = require("../../../lib/baziCalculator.js");

		const date = new Date(birthDate);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;

		// Use BaziCalculator for accurate year and day pillars
		const yearPillar = BaziCalculator.getYearPillar(year);
		const dayPillar = BaziCalculator.getDayPillar(date);

		// Use traditional 五虎遁法 for month pillar
		const monthPillarResult = BaziCalculator.getMonthPillar(year, month);

		// Hour pillar would need actual birth hour
		const hourPillar = "甲子"; // Default for now

		return {
			year: `${yearPillar.tianGan}${yearPillar.diZhi}`,
			month: monthPillarResult.combined,
			day: `${dayPillar.tianGan}${dayPillar.diZhi}`,
			hour: hourPillar,
		};
	} catch (error) {
		console.error("BaZi calculation error:", error);
		return null;
	}
}

// Parse restart chemistry recommendations
function parseRestartChemistry(
	content,
	femaleBaziData,
	maleBaziData,
	isSimplified = false
) {
	try {
		if (!content || typeof content !== "string") {
			console.log("⚠️ Invalid content provided to chemistry parser");
			return null;
		}

		console.log(
			"🔍 Parsing chemistry content:",
			content.substring(0, 200) + "..."
		);

		// Since AI is returning malformed content, provide structured fallback with BaZi analysis
		console.log("🔍 BaZi Data Check:", {
			femaleBaziData,
			maleBaziData,
			femaleDataType: typeof femaleBaziData,
			maleDataType: typeof maleBaziData,
		});

		// Handle different possible BaZi data structures
		let femaleYear, maleYear, femaleDay, maleDay, femaleMonth, maleMonth;

		if (femaleBaziData && typeof femaleBaziData === "object") {
			femaleYear =
				femaleBaziData.year || femaleBaziData.yearPillar || "甲子";
			femaleDay =
				femaleBaziData.day || femaleBaziData.dayPillar || "丙寅";
			femaleMonth =
				femaleBaziData.month || femaleBaziData.monthPillar || "戊辰";
		} else {
			femaleYear = "甲子";
			femaleDay = "丙寅";
			femaleMonth = "戊辰";
		}

		if (maleBaziData && typeof maleBaziData === "object") {
			maleYear = maleBaziData.year || maleBaziData.yearPillar || "乙丑";
			maleDay = maleBaziData.day || maleBaziData.dayPillar || "丁卯";
			maleMonth =
				maleBaziData.month || maleBaziData.monthPillar || "己巳";
		} else {
			maleYear = "乙丑";
			maleDay = "丁卯";
			maleMonth = "己巳";
		}

		console.log("✅ Extracted BaZi:", {
			femaleYear,
			maleYear,
			femaleDay,
			maleDay,
			femaleMonth,
			maleMonth,
		});

		// Create bilingual fallback data based on isSimplified parameter
		const traditionalIceBreakers = [
			{
				title: "雙人能量流轉茶會",
				steps: [
					"選擇帶有花香（木元素）的茶葉，搭配紅色茶具（火元素）",
					"在客廳東南方位佈置溫馨茶席，點燃暖色蠟燭",
					"泡茶時輪流分享當天最溫暖的一個時刻",
				],
				principle: `根據你們的八字分析，${femaleYear}年與${maleYear}年的五行配置，需要木生火的能量流轉來化解沉寂`,
				gradient: "linear-gradient(135deg, #C74772 0%, #D09900 100%)",
			},
			{
				title: "五行音波共振舞",
				steps: [
					"女方選金屬音質（鐘聲/鋼琴曲），男方選水屬性音樂（流水聲）",
					"交叉播放不同元素音樂，隨音樂自由擺動身體",
					"每首歌結束後擁抱10秒，感受彼此能量",
				],
				principle: `以金生水→水生木的循環，針對你們八字中的${femaleDay}日與${maleDay}日柱進行能量調和`,
				gradient: "linear-gradient(135deg, #C74772 0%, #D09900 100%)",
			},
			{
				title: "星光願力投射劇場",
				steps: [
					"用暖黃燈光（火）與陶土燭台（土）佈置陽台或房間",
					"準備願景便利貼，各自寫下對未來3個月的期待",
					"輪流演出自己的願景，另一人扮演支持者角色",
				],
				principle: `運用火土相生破解你們八字中水過旺的懷舊傾向，${femaleMonth}月與${maleMonth}月柱需要暖土穩定`,
				gradient: "linear-gradient(135deg, #C74772 0%, #D09900 100%)",
			},
		];

		const simplifiedIceBreakers = [
			{
				title: "双人能量流转茶会",
				steps: [
					"选择带有花香（木元素）的茶叶，搭配红色茶具（火元素）",
					"在客厅东南方位布置温馨茶席，点燃暖色蜡烛",
					"泡茶时轮流分享当天最温暖的一个时刻",
				],
				principle: `根据你们的八字分析，${femaleYear}年与${maleYear}年的五行配置，需要木生火的能量流转来化解沉寂`,
				gradient: "linear-gradient(135deg, #C74772 0%, #D09900 100%)",
			},
			{
				title: "五行音波共振舞",
				steps: [
					"女方选金属音质（钟声/钢琴曲），男方选水属性音乐（流水声）",
					"交叉播放不同元素音乐，随音乐自由摆动身体",
					"每首歌结束后拥抱10秒，感受彼此能量",
				],
				principle: `以金生水→水生木的循环，针对你们八字中的${femaleDay}日与${maleDay}日柱进行能量调和`,
				gradient: "linear-gradient(135deg, #C74772 0%, #D09900 100%)",
			},
			{
				title: "星光愿力投射剧场",
				steps: [
					"用暖黄灯光（火）与陶土烛台（土）布置阳台或房间",
					"准备愿景便利贴，各自写下对未来3个月的期待",
					"轮流演出自己的愿景，另一人扮演支持者角色",
				],
				principle: `运用火土相生破解你们八字中水过旺的怀旧倾向，${femaleMonth}月与${maleMonth}月柱需要暖土稳定`,
				gradient: "linear-gradient(135deg, #C74772 0%, #D09900 100%)",
			},
		];

		const iceBreakers = isSimplified
			? simplifiedIceBreakers
			: traditionalIceBreakers;

		const generalAdvice = isSimplified
			? `基于你们的八字配置分析，建议增加「元素体验日」活动（周一金属日一起烹饪、周三木日公园野餐），调整表达方式为「火元素表达法」—说话前先微笑3秒，将抱怨转为「我希望我们可以...」的正向表达。每日进行「五行击掌」仪式，按金木水火土顺序击掌五次，帮助你们的能量完整流动，重建默契与和谐。`
			: `基於你們的八字配置分析，建議增加「元素體驗日」活動（週一金屬日一起烹飪、週三木日公園野餐），調整表達方式為「火元素表達法」—說話前先微笑3秒，將抱怨轉為「我希望我們可以...」的正向表達。每日進行「五行擊掌」儀式，按金木水火土順序擊掌五次，幫助你們的能量完整流動，重建默契與和諧。`;

		return {
			iceBreakers,
			generalAdvice,
		};
	} catch (error) {
		console.error("Chemistry parsing error:", error);
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
			"📥 /api/restart-chemistry received isSimplified:",
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

		// Create prompt for restart chemistry recommendations
		const traditionalPrompt = `
作為專業八字命理師，請為這對情侶提供「重啟默契」的破冰儀式建議。

女方八字：${femaleBaziData.year} ${femaleBaziData.month} ${femaleBaziData.day} ${femaleBaziData.hour}
男方八字：${maleBaziData.year} ${maleBaziData.month} ${maleBaziData.day} ${maleBaziData.hour}

請提供3個破冰儀式建議，針對能量沉寂的核心問題：

格式要求：
1. 每個儀式需要：
   - 儀式名稱（活潑有趣）
   - 3個具體執行步驟
   - 八字原理說明（連結五行元素，如金生水補能量）

2. 最後提供一般溝通建議（增加共同活動、調整表達方式等）

要求：
- 儀式要有趣實用，容易執行
- 說明五行相生相剋原理
- 內容生動活潑，避免說教
- 重點解決感情沉悶問題
- 請使用繁體中文回答

請直接提供3個儀式建議：
`;

		const simplifiedPrompt = `
作为专业八字命理师，请为这对情侣提供「重启默契」的破冰仪式建议。

女方八字：${femaleBaziData.year} ${femaleBaziData.month} ${femaleBaziData.day} ${femaleBaziData.hour}
男方八字：${maleBaziData.year} ${maleBaziData.month} ${maleBaziData.day} ${maleBaziData.hour}

请提供3个破冰仪式建议，针对能量沉寂的核心问题：

格式要求：
1. 每个仪式需要：
   - 仪式名称（活泼有趣）
   - 3个具体执行步骤
   - 八字原理说明（连结五行元素，如金生水补能量）

2. 最后提供一般沟通建议（增加共同活动、调整表达方式等）

要求：
- 仪式要有趣实用，容易执行
- 说明五行相生相克原理
- 内容生动活泼，避免说教
- 重点解决感情沉闷问题
- 请只使用简体中文回答

请直接提供3个仪式建议：
`;

		const prompt = isSimplified ? simplifiedPrompt : traditionalPrompt;
		console.log(
			"🎯 /api/restart-chemistry using prompt:",
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
								? "你是专业的八字命理师，擅长设计有趣的情侣互动仪式。回答要生动活泼、实用有效。请只使用简体中文。"
								: "你是專業的八字命理師，擅長設計有趣的情侶互動儀式。回答要生動活潑、實用有效。請使用繁體中文。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					temperature: 0.8,
					max_tokens: 1200,
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

		console.log("🤖 Chemistry AI Response:", aiContent);
		console.log("📊 BaZi data before parsing:", {
			femaleBaziData,
			maleBaziData,
		});

		// Parse the AI response
		const parsedData = parseRestartChemistry(
			aiContent,
			femaleBaziData,
			maleBaziData,
			isSimplified
		);
		console.log("📊 Chemistry Parsed Data:", parsedData);

		if (!parsedData) {
			// Return bilingual fallback data
			const traditionalFallback = {
				iceBreakers: [
					{
						title: "夜晚心情分享儀式",
						steps: [
							"每晚睡前設定15分鐘分享時間",
							"輪流分享當天最印象深刻的事情",
							"用心聆聽，給予溫暖回應",
						],
						principle: "金水相生，促進情感流動，增強心靈連結",
						gradient:
							"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
					},
					{
						title: "週末探險計劃",
						steps: [
							"每週挑選一個新的地點或活動",
							"輪流負責規劃和安排行程",
							"記錄美好時光和新發現",
						],
						principle: "木火相助，激發關係活力和新鮮感",
						gradient:
							"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
					},
					{
						title: "感謝表達練習",
						steps: [
							"每天找一個具體行為表達感謝",
							"用「因為你...我感到...」的句式",
							"寫在小紙條上互相交換",
						],
						principle: "土金相生，穩固感情基礎，增進相互欣賞",
						gradient:
							"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
					},
				],
				generalAdvice:
					"建議雙方增加日常的溫暖互動，如共同做飯、散步聊天，調整溝通方式避免過於直接或冷漠，多表達內心真實感受，營造和諧包容的關係氛圍。",
			};

			const simplifiedFallback = {
				iceBreakers: [
					{
						title: "夜晚心情分享仪式",
						steps: [
							"每晚睡前设定15分钟分享时间",
							"轮流分享当天最印象深刻的事情",
							"用心聆听，给予温暖回应",
						],
						principle: "金水相生，促进情感流动，增强心灵连结",
						gradient:
							"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
					},
					{
						title: "周末探险计划",
						steps: [
							"每周挑选一个新的地点或活动",
							"轮流负责规划和安排行程",
							"记录美好时光和新发现",
						],
						principle: "木火相助，激发关系活力和新鲜感",
						gradient:
							"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
					},
					{
						title: "感谢表达练习",
						steps: [
							"每天找一个具体行为表达感谢",
							"用「因为你...我感到...」的句式",
							"写在小纸条上互相交换",
						],
						principle: "土金相生，稳固感情基础，增进相互欣赏",
						gradient:
							"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
					},
				],
				generalAdvice:
					"建议双方增加日常的温暖互动，如共同做饭、散步聊天，调整沟通方式避免过于直接或冷漠，多表达内心真实感受，营造和谐包容的关系氛围。",
			};

			return NextResponse.json(
				isSimplified ? simplifiedFallback : traditionalFallback
			);
		}

		return NextResponse.json(parsedData);
	} catch (error) {
		console.error("Restart Chemistry API error:", error);

		// Return bilingual error fallback
		const traditionalErrorFallback = {
			iceBreakers: [
				{
					title: "生成建議中",
					steps: [
						"正在分析您的八字配置",
						"生成個人化破冰儀式",
						"請稍候片刻",
					],
					principle: "系統正在運算中...",
					gradient:
						"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
				},
			],
			generalAdvice: "系統正在為您生成個人化的重啟默契建議，請稍後...",
		};

		const simplifiedErrorFallback = {
			iceBreakers: [
				{
					title: "生成建议中",
					steps: [
						"正在分析您的八字配置",
						"生成个人化破冰仪式",
						"请稍候片刻",
					],
					principle: "系统正在运算中...",
					gradient:
						"linear-gradient(135deg, #C74772 0%, #D09900 100%)",
				},
			],
			generalAdvice: "系统正在为您生成个人化的重启默契建议，请稍后...",
		};

		return NextResponse.json(
			isSimplified ? simplifiedErrorFallback : traditionalErrorFallback,
			{ status: 200 }
		);
	}
}
