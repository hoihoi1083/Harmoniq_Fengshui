export async function POST(req) {
	try {
		const {
			user1Info,
			user2Info,
			currentYear,
			currentDate,
			concern = "感情",
			isSimplified = false,
		} = await req.json();

		if (!user1Info || !user2Info) {
			return Response.json(
				{ error: "Missing couple information" },
				{ status: 400 },
			);
		}

		const { birthday: birthday1, gender: gender1, name: name1 } = user1Info;
		const { birthday: birthday2, gender: gender2, name: name2 } = user2Info;

		console.log("🌸 Couple Season Analysis API called with:");
		console.log("Male:", birthday1, gender1, name1);
		console.log("Female:", birthday2, gender2, name2);

		// Get current date information for season prioritization
		const currentMonth = currentDate?.month || new Date().getMonth() + 1;
		const currentSeasonName = currentDate?.currentSeason || "秋季";
		const relevantSeasons = currentDate?.relevantSeasons || [
			"秋季",
			"冬季",
			"春季",
			"夏季",
		];

		// Enhanced date-aware prompt for couple season analysis with simplified language
		const prompt = isSimplified
			? `你是亲切的风水师「小铃」，我理解每对夫妻都想知道如何在一年四季中更好地经营感情。让我用最简单的语言，为你们分析不同季节的相处之道：

夫妻基本信息：
- ${name1}生日：${birthday1}，性别：${gender1}
- ${name2}生日：${birthday2}，性别：${gender2}
- 分析年份：${currentYear}
- 当前时间：${currentYear}年${currentMonth}月，当前季节：${currentSeasonName}
- 关注重点：夫妻${concern}

**重要：请用简单白话文，避免过多专业术语。当前是${currentSeasonName}（${currentMonth}月），请重点分析当前和未来季节。分析顺序：${relevantSeasons.join("→")}**

请用浅显易懂的语言分析夫妻在四个季节的相处重点。**每个季节内容要简洁实用，约80-100字：**

【夫妻四季相处指南】

#### **春季（2-4月，万物复苏）**：
请用简单易懂的语言分析夫妻在春天的相处情况：
- 春天对你们关系的好处和需要注意的地方
- 这个季节容易出现什么问题，如何预防
- 给夫妻的实用建议（2-3个简单方法）
- 春季夫妻互动重点和注意事项

💡 **实际场景示例：**
- 周末一起去公园赏花散步，呼吸新鲜空气，聊聊未来计划
- 春季大扫除：一起整理家居，扔掉旧物，为新的一年创造清爽空间
- 种植小盆栽：共同照顾一株植物，见证生命成长也象征关系成长

**内容长度：约100字**

#### **夏季（5-7月，天气炎热）**：
请用简单易懂的语言分析夫妻在夏天的相处情况：
- 夏天对你们关系的影响（好的和不好的）
- 天气热的时候容易吵架吗？如何避免
- 给夫妻的实用建议（2-3个简单方法）

💡 **实际场景示例：**
- 天气热容易烦躁：约定吵架冷静期，先各自冷静30分钟再沟通
- 一起做清凉甜品：制作冰淇淋或水果沙拉，在厨房里享受协作的乐趣
- 晚上到河边散步：避开白天的燥热，在凉爽的夜晚牵手聊天

#### **秋季（8-10月，天气凉爽）**：
请用简单易懂的语言分析夫妻在秋天的相处情况：
- 秋天对你们关系的影响
- 这个季节需要特别注意什么
- 给夫妻的实用建议（2-3个简单方法）

💡 **实际场景示例：**
- 周末一起采摘水果：体验秋收的喜悦，顺便拍些甜蜜合照
- 准备过冬衣物：一起整理衣柜，为对方挑选保暖衣物表达关心
- 制定年度总结：回顾这一年的收获与遗憾，规划剩余时光

#### **冬季（11-1月，天气寒冷）**：
请用简单易懂的语言分析夫妻在冬天的相处情况：
- 冬天对你们关系的影响
- 天气冷的时候如何维持感情温度
- 给夫妻的实用建议（2-3个简单方法）

💡 **实际场景示例：**
- 一起煮火锅或汤品：在温暖的厨房里共同准备美食，享受暖心时刻
- 窝在沙发看电影：寒冷的晚上，盖着毛毯依偎在一起看电影
- 计划新年愿望：在跨年前一起写下对来年的期待和承诺

参考白话文风格（要简单易懂）：

夫妻感情示例：
春季（2-4月，春暖花开）：春天是感情开始变好的时候。${name1}比较容易理解对方，${name2}情绪比较活泼，要注意表达方式。建议：多到户外走走增进感情、敞开心胸多聊天、一起计划今年的目标。3月份天气稳定，最适合深入了解对方。

夏季（5-7月，天气炎热）：夏天是感情考验期！天气热容易吵架，双方都比较容易激动。一定要：控制脾气不要大吵、给对方一些冷静空间、重要决定等天凉再讨论、多看对方的好处。7月份压力大，要特别注意钱的问题不要影响感情。

秋季（8-10月，秋高气爽）：秋天是感情收获期。8月份最适合沟通，可以深入聊天、化解误会、重建信任。9月份感情最稳定，适合做重要承诺、规划未来、增加亲密感。10月份要注意家务分工，不要因为小事影响感情。

冬季（11-1月，天气寒冷）：冬天是感情加深期！天气冷反而感情可以更深，最适合修复关系、增进理解。11-12月最好：多深谈（晚上聊心事、分享内心想法）、培养共同爱好、规划未来梦想、化解以前的伤害。1月份适合总结感情经验、制定长期感情目标。

夫妻婚姻示例：
春季（寅卯辰月，木旺）：婚姻新生期，木气生发利于婚姻关系更新。双方印星互助，利于相互支持、共同成长。建议：重新审视婚姻目标、增加夫妻共同活动、改善沟通方式。辰月适合处理婚姻中的实际问题。

夏季（巳午未月，火土极旺）：婚姻危机期！火旺冲克，易发生婚姻冲突。务必：避免提及敏感话题、暂缓重大婚姻决定、寻求专业婚姻咨询、加强家庭责任感。未月注意经济压力对婚姻的影响。

白话文要求：
1. 用简单易懂的语言分析夫妻在不同季节的相处
2. 针对夫妻${concern}给出实用的季节建议
3. 每个季节用格式：#### **季节名（几月，天气特色）**：
4. **四个季节内容长度要差不多**，每季节约80-100字，包含：
   - 这季节对夫妻关系有什么影响（用大白话）
   - 可能遇到什么问题
   - 给夫妻的实用建议（2-3个简单方法）
   - 这季节要特别注意什么
5. 内容要实用，让人看了就知道怎么做
6. 语言要亲切自然，不要太多专业术语
7. 重点说明什么时候要小心，什么时候是好时机
8. 提供具体实例和操作建议，避免空泛的概念性描述
9. **确保四个季节的内容都完整且长度相近，平衡详细程度**
10. 分析中要体现${name1}和${name2}的个性化特点和相处模式
11. 每季节控制在80-120字范围内，保持内容密度一致

请确保每个季节的夫妻分析都足够详细深入，为夫妻双方提供真正有价值的个人化感情经营指导。`
			: `你是親切的風水師「小鈴」，我理解每對夫妻都想知道如何在一年四季中更好地經營感情。讓我用最簡單的語言，為你們分析不同季節的相處之道：

夫妻基本信息：
- ${name1}生日：${birthday1}，性別：${gender1}
- ${name2}生日：${birthday2}，性別：${gender2}
- 分析年份：${currentYear}
- 當前時間：${currentYear}年${currentMonth}月，當前季節：${currentSeasonName}
- 關注重點：夫妻${concern}

**重要：請用簡單白話文，避免過多專業術語。當前是${currentSeasonName}（${currentMonth}月），請重點分析當前和未來季節。分析順序：${relevantSeasons.join("→")}**

請用淺顯易懂的語言分析夫妻在四個季節的相處重點。**每個季節內容要簡潔實用，約80-100字：**

【夫妻四季相處指南】

#### **春季（2-4月，萬物復甦）**：
請用簡單易懂的語言分析夫妻在春天的相處情況：
- 春天對你們關係的好處和需要注意的地方
- 這個季節容易出現什麼問題，如何預防
- 給夫妻的實用建議（2-3個簡單方法）
- 春季夫妻互動重點和注意事項

💡 **實際場景示例：**
- 週末一起去公園賞花散步，呼吸新鮮空氣，聊聊未來計畫
- 春季大掃除：一起整理家居，扔掉舊物，為新的一年創造清爽空間
- 種植小盆栽：共同照顧一株植物，見證生命成長也象徵關係成長

**內容長度：約100字**

#### **夏季（5-7月，天氣炎熱）**：
請用簡單易懂的語言分析夫妻在夏天的相處情況：
- 夏天對你們關係的影響（好的和不好的）
- 天氣熱的時候容易吵架嗎？如何避免
- 給夫妻的實用建議（2-3個簡單方法）

💡 **實際場景示例：**
- 天氣熱容易煩躁：約定吵架冷靜期，先各自冷靜30分鐘再溝通
- 一起做清涼甜品：製作冰淇淋或水果沙拉，在廚房裡享受協作的樂趣
- 晚上到河邊散步：避開白天的燥熱，在涼爽的夜晚牽手聊天

#### **秋季（8-10月，天氣涼爽）**：
請用簡單易懂的語言分析夫妻在秋天的相處情況：
- 秋天對你們關係的影響
- 這個季節需要特別注意什麼
- 給夫妻的實用建議（2-3個簡單方法）

💡 **實際場景示例：**
- 週末一起採摘水果：體驗秋收的喜悅，順便拍些甜蜜合照
- 準備過冬衣物：一起整理衣櫃，為對方挑選保暖衣物表達關心
- 制定年度總結：回顧這一年的收穫與遺憾，規劃剩餘時光

#### **冬季（11-1月，天氣寒冷）**：
請用簡單易懂的語言分析夫妻在冬天的相處情況：
- 冬天對你們關係的影響
- 天氣冷的時候如何維持感情溫度
- 給夫妻的實用建議（2-3個簡單方法）

💡 **實際場景示例：**
- 一起煮火鍋或湯品：在溫暖的廚房裡共同準備美食，享受暖心時刻
- 窩在沙發看電影：寒冷的晚上，蓋著毛毯依偎在一起看電影
- 計劃新年願望：在跨年前一起寫下對來年的期待和承諾

參考白話文風格（要簡單易懂）：

夫妻感情示例：
春季（2-4月，春暖花開）：春天是感情開始變好的時候。${name1}比較容易理解對方，${name2}情緒比較活潑，要注意表達方式。建議：多到戶外走走增進感情、敞開心胸多聊天、一起計劃今年的目標。3月份天氣穩定，最適合深入了解對方。

夏季（5-7月，天氣炎熱）：夏天是感情考驗期！天氣熱容易吵架，雙方都比較容易激動。一定要：控制脾氣不要大吵、給對方一些冷靜空間、重要決定等天涼再討論、多看對方的好處。7月份壓力大，要特別注意錢的問題不要影響感情。

秋季（8-10月，秋高氣爽）：秋天是感情收穫期。8月份最適合溝通，可以深入聊天、化解誤會、重建信任。9月份感情最穩定，適合做重要承諾、規劃未來、增加親密感。10月份要注意家務分工，不要因為小事影響感情。

冬季（11-1月，天氣寒冷）：冬天是感情加深期！天氣冷反而感情可以更深，最適合修復關係、增進理解。11-12月最好：多深談（晚上聊心事、分享內心想法）、培養共同愛好、規劃未來夢想、化解以前的傷害。1月份適合總結感情經驗、制定長期感情目標。

夫妻婚姻示例：
春季（寅卯辰月，木旺）：婚姻新生期，木氣生發利於婚姻關係更新。雙方印星互助，利於相互支持、共同成長。建議：重新審視婚姻目標、增加夫妻共同活動、改善溝通方式。辰月適合處理婚姻中的實際問題。

夏季（巳午未月，火土極旺）：婚姻危機期！火旺沖克，易發生婚姻衝突。務必：避免提及敏感話題、暫緩重大婚姻決定、尋求專業婚姻諮詢、加強家庭責任感。未月注意經濟壓力對婚姻的影響。

白話文要求：
1. 用簡單易懂的語言分析夫妻在不同季節的相處
2. 針對夫妻${concern}給出實用的季節建議
3. 每個季節用格式：#### **季節名（幾月，天氣特色）**：
4. **四個季節內容長度要差不多**，每季節約80-100字，包含：
   - 這季節對夫妻關係有什麼影響（用大白話）
   - 可能遇到什麼問題
   - 給夫妻的實用建議（2-3個簡單方法）
   - 這季節要特別注意什麼
5. 內容要實用，讓人看了就知道怎麼做
6. 語言要親切自然，不要太多專業術語
7. 重點說明什麼時候要小心，什麼時候是好時機
8. 提供具體實例和操作建議，避免空泛的概念性描述
9. **確保四個季節的內容都完整且長度相近，平衡詳細程度**
10. 分析中要體現${name1}和${name2}的個性化特點和相處模式
11. 每季節控制在80-120字範圍內，保持內容密度一致

請確保每個季節的夫妻分析都足夠詳細深入，為夫妻雙方提供真正有價值的個人化感情經營指導。`;

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
							role: "user",
							content: prompt,
						},
					],
					stream: false,
					max_tokens: 6000,
					temperature: 0.6,
				}),
			},
		);

		if (!response.ok) {
			console.error(
				"DeepSeek API Error:",
				response.status,
				response.statusText,
			);
			return Response.json(
				{ error: "AI analysis service unavailable" },
				{ status: 500 },
			);
		}

		const data = await response.json();
		const aiContent = data.choices?.[0]?.message?.content;

		if (!aiContent) {
			return Response.json(
				{ error: "No couple season analysis generated" },
				{ status: 500 },
			);
		}

		// Parse the AI response to extract structured data
		const parsedContent = parseCoupleSeasonContent(
			aiContent,
			concern,
			user1Info,
			user2Info,
			currentSeasonName,
			isSimplified,
		);

		return Response.json({
			success: true,
			analysis: {
				concern: concern,
				content: aiContent,
				parsed: parsedContent,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Couple Season Analysis Error:", error);
		return Response.json(
			{ error: "Couple season analysis generation failed" },
			{ status: 500 },
		);
	}
}

function parseCoupleSeasonContent(
	content,
	concern,
	user1Info,
	user2Info,
	currentSeasonName = "秋季",
	isSimplified = false,
) {
	try {
		// Get season context for time-aware content
		const getSeasonContext = (season) => {
			if (season === currentSeasonName) {
				return isSimplified ? "【当前季节】" : "【當前季節】";
			} else {
				return isSimplified ? "【未来参考】" : "【未來參考】";
			}
		};

		// Extract season sections with time context
		const baseSeasonsData = [
			{
				name: "春季",
				period: "寅卯辰月，木旺",
				icon: "🌸",
				color: "bg-green-500",
				keyPoints: isSimplified
					? ["感情萌芽", "寅卯辰月", "木旺生发"]
					: ["感情萌芽", "寅卯辰月", "木旺生發"],
			},
			{
				name: "夏季",
				period: "巳午未月，火土極旺",
				icon: "☀️",
				color: "bg-red-500",
				keyPoints: isSimplified
					? ["情感考验", "巳午未月", "火旺冲克"]
					: ["情感考驗", "巳午未月", "火旺沖克"],
			},
			{
				name: "秋季",
				period: "申酉戌月，金旺",
				icon: "🍂",
				color: "bg-yellow-500",
				keyPoints: isSimplified
					? ["感情收获", "申酉戌月", "金旺调和"]
					: ["感情收穫", "申酉戌月", "金旺調和"],
			},
			{
				name: "冬季",
				period: "亥子丑月，水旺",
				icon: "❄️",
				color: "bg-blue-500",
				keyPoints: isSimplified
					? ["感情修复", "亥子丑月", "水旺调候"]
					: ["感情修復", "亥子丑月", "水旺調候"],
			},
		];

		// Reorder seasons: current first, then chronological future seasons
		const currentIndex = baseSeasonsData.findIndex(
			(s) => s.name === currentSeasonName,
		);
		const orderedSeasonsData =
			currentIndex >= 0
				? [
						...baseSeasonsData.slice(currentIndex),
						...baseSeasonsData.slice(0, currentIndex),
					]
				: baseSeasonsData;

		// Add time context to season names
		const seasons = orderedSeasonsData.map((season) => ({
			...season,
			name: season.name + getSeasonContext(season.name),
		}));

		// Parse content for each season - try multiple formats
		seasons.forEach((season) => {
			let seasonContent = "";

			// Use original season name without time context for parsing
			const originalSeasonName = season.name.replace(/【[^】]*】/, "");

			// Try different patterns that AI might use
			const patterns = [
				// Pattern 1: 【春季（寅卯辰月，木旺）】：
				new RegExp(
					`【${originalSeasonName}[^】]*】[：:]?\\s*([\\s\\S]*?)(?=【|####|$)`,
					"g",
				),
				// Pattern 2: **春季（寅卯辰月，木旺）**：
				new RegExp(
					`\\*\\*${originalSeasonName}[^*]*\\*\\*[：:]?\\s*([\\s\\S]*?)(?=\\*\\*|####|$)`,
					"g",
				),
				// Pattern 3: #### **春季（寅卯辰月，木旺）**：
				new RegExp(
					`####\\s*\\*\\*${originalSeasonName}[^*]*\\*\\*[：:]?\\s*([\\s\\S]*?)(?=####|$)`,
					"g",
				),
				// Pattern 4: 春季（寅卯辰月，木旺）：
				new RegExp(
					`${originalSeasonName}（[^）]*）[：:]?\\s*([\\s\\S]*?)(?=(?:春季|夏季|秋季|冬季)（|####|$)`,
					"g",
				),
				// Pattern 5: More flexible - season name followed by content
				new RegExp(
					`${originalSeasonName}[^\\n]*[：:]([\\s\\S]*?)(?=(?:春季|夏季|秋季|冬季)|###|$)`,
					"g",
				),
			];

			// Try each pattern until we find substantial content
			for (let pattern of patterns) {
				pattern.lastIndex = 0; // Reset regex
				let match;
				while ((match = pattern.exec(content)) !== null) {
					if (match[1]) {
						let rawContent = match[1].trim();
						// Look for substantial content (more than 50 characters)
						if (rawContent.length > 50) {
							seasonContent = rawContent;
							break;
						}
					}
				}
				if (seasonContent) break;
			}

			// If still no good content, try more aggressive extraction
			if (!seasonContent || seasonContent.length < 50) {
				// Find any occurrence of season name and extract following content
				const flexiblePatterns = [
					new RegExp(
						`${originalSeasonName}[^\\n]*\\n([\\s\\S]{50,400}?)(?=(?:春季|夏季|秋季|冬季)|$)`,
						"g",
					),
					new RegExp(
						`${originalSeasonName}[^。]*。([\\s\\S]{30,400}?)(?=(?:春季|夏季|秋季|冬季)|$)`,
						"g",
					),
				];

				for (let pattern of flexiblePatterns) {
					pattern.lastIndex = 0;
					let match;
					while ((match = pattern.exec(content)) !== null) {
						if (match[1] && match[1].trim().length > 30) {
							seasonContent = match[1].trim();
							break;
						}
					}
					if (seasonContent) break;
				}
			}

			// Clean up the content if found
			if (seasonContent && seasonContent.length > 20) {
				// Remove formatting and clean up
				seasonContent = seasonContent
					.replace(/^[：:]\s*/, "") // Remove leading colon
					.replace(/^[。．]\s*/, "") // Remove leading period
					.replace(/【[^】]*】/g, "") // Remove bracketed headers
					.replace(/\*\*/g, "") // Remove bold markers
					.replace(/####/g, "") // Remove markdown headers
					.replace(/^\s*[-•]\s*/gm, "") // Remove bullet points at line start
					.replace(/\s*。\s*(?=。)/g, "") // Remove duplicate periods
					.replace(/\n\s*\n/g, "\n") // Collapse multiple newlines
					.trim();

				// Allow full content display without truncation
				if (seasonContent.length < 200) {
					// If content is too short, try to expand with fallback
					const fallbackContent = getCoupleFallbackSeasonContent(
						originalSeasonName,
						concern,
						user1Info,
						user2Info,
						isSimplified,
					);
					// Combine original and fallback if needed - allowing full content
					if (
						seasonContent.length < 150 &&
						fallbackContent.length > 100
					) {
						seasonContent = seasonContent + " " + fallbackContent;
					}
				}

				season.content = seasonContent;
			} else {
				// Use enhanced fallback content for couples
				season.content = getCoupleFallbackSeasonContent(
					originalSeasonName,
					concern,
					user1Info,
					user2Info,
					isSimplified,
				);
			}
		});

		return {
			seasons: seasons,
			fullContent: content,
			title: `夫妻關鍵季節&注意事項 (${concern}指南)`,
		};
	} catch (error) {
		console.error("Couple season content parsing error:", error);
		return getCoupleFallbackSeasonData(
			concern,
			user1Info,
			user2Info,
			isSimplified,
		);
	}
}

function getCoupleFallbackSeasonContent(
	seasonName,
	concern,
	user1Info,
	user2Info,
	isSimplified = false,
) {
	const name1 = user1Info.name || (isSimplified ? "男方" : "男方");
	const name2 = user2Info.name || (isSimplified ? "女方" : "女方");

	const fallbacksSimplified = {
		感情: {
			春季: `${name1}与${name2}在春季木旺期间，感情迎来新的萌芽机会。木主生发，利于双方开放沟通、增进理解。建议：1）多进行户外活动增进感情，2）共同制定年度感情目标，3）辰月适合深入了解彼此内心世界。春季宜主动表达关爱，为全年感情发展奠定基础。`,
			夏季: `${name1}与${name2}在夏季需特别注意情绪管理。火旺易引发争执，双方应保持理性。建议：1）控制脾气避免激烈争吵，2）给彼此适当空间冷静思考，3）重大决定延后到秋季讨论。未月注意家庭经济压力对感情的影响，多关注对方优点维护感情稳定。`,
			秋季: `${name1}与${name2}迎来感情收获期。金气收敛利于感情关系稳定发展。建议：1）申月适合深度交流化解前期误会，2）酉月感情巩固可做重要承诺规划未来，3）戌月注意家庭责任分工避免摩擦。秋季是感情关系成熟和收获的最佳时机，把握机会巩固感情基础。`,
			冬季: `${name1}与${name2}进入感情深化黄金期！水旺调候最利修复感情裂痕。建议：1）亥子月加强情感交流培养共同兴趣，2）共同规划未来蓝图制定长期目标，3）丑月总结感情经验为来年发展做准备。冬季深度沟通效果最佳，是修复关系和增进理解的关键时期。`,
		},
		婚姻: {
			春季: `${name1}与${name2}迎来婚姻新生期，木气生发利于婚姻关系更新发展。建议：1）重新审视婚姻目标调整相处模式，2）增加夫妻共同活动增进亲密度，3）改善沟通方式提升理解品质。辰月适合处理婚姻中的实际问题，为全年婚姻和谐奠定基础。`,
			夏季: `${name1}与${name2}面临婚姻考验期。火旺冲克易发生冲突，需要谨慎应对。建议：1）避免讨论敏感话题减少争执，2）暂缓重大婚姻决定等待理性时机，3）加强家庭责任感共同面对挑战。未月特别注意经济压力对婚姻和谐的影响，多展现关爱支持。`,
			秋季: `${name1}与${name2}进入婚姻稳定期。金气收敛有助婚姻关系成熟发展。建议：1）申月利于解决婚姻中的实际问题，2）酉月适合巩固夫妻关系做出长期承诺，3）戌月注意家务分工维护家庭和谐。秋季是婚姻关系巩固和升华的最佳时机。`,
			冬季: `${name1}与${name2}迎来婚姻修复最佳期！水旺调候利于重建和谐夫妻关系。建议：1）制定夫妻沟通规则改善互动品质，2）重新分配家庭责任实现公平合理，3）规划婚姻长期目标加强亲密关系。丑月总结婚姻经验制定来年发展计划，为婚姻长久幸福做准备。`,
		},
	};

	const fallbacksTraditional = {
		感情: {
			春季: `${name1}與${name2}在春季木旺期間，感情迎來新的萌芽機會。木主生發，利於雙方開放溝通、增進理解。建議：1）多進行戶外活動增進感情，2）共同制定年度感情目標，3）辰月適合深入了解彼此內心世界。春季宜主動表達關愛，為全年感情發展奠定基礎。`,
			夏季: `${name1}與${name2}在夏季需特別注意情緒管理。火旺易引發爭執，雙方應保持理性。建議：1）控制脾氣避免激烈爭吵，2）給彼此適當空間冷靜思考，3）重大決定延後到秋季討論。未月注意家庭經濟壓力對感情的影響，多關注對方優點維護感情穩定。`,
			秋季: `${name1}與${name2}迎來感情收穫期。金氣收斂利於感情關係穩定發展。建議：1）申月適合深度交流化解前期誤會，2）酉月感情鞏固可做重要承諾規劃未來，3）戌月注意家庭責任分工避免摩擦。秋季是感情關係成熟和收穫的最佳時機，把握機會鞏固感情基礎。`,
			冬季: `${name1}與${name2}進入感情深化黃金期！水旺調候最利修復感情裂痕。建議：1）亥子月加強情感交流培養共同興趣，2）共同規劃未來藍圖制定長期目標，3）丑月總結感情經驗為來年發展做準備。冬季深度溝通效果最佳，是修復關係和增進理解的關鍵時期。`,
		},
		婚姻: {
			春季: `${name1}與${name2}迎來婚姻新生期，木氣生發利於婚姻關係更新發展。建議：1）重新審視婚姻目標調整相處模式，2）增加夫妻共同活動增進親密度，3）改善溝通方式提升理解品質。辰月適合處理婚姻中的實際問題，為全年婚姻和諧奠定基礎。`,
			夏季: `${name1}與${name2}面臨婚姻考驗期。火旺沖克易發生衝突，需要謹慎應對。建議：1）避免討論敏感話題減少爭執，2）暫緩重大婚姻決定等待理性時機，3）加強家庭責任感共同面對挑戰。未月特別注意經濟壓力對婚姻和諧的影響，多展現關愛支持。`,
			秋季: `${name1}與${name2}進入婚姻穩定期。金氣收斂有助婚姻關係成熟發展。建議：1）申月利於解決婚姻中的實際問題，2）酉月適合鞏固夫妻關係做出長期承諾，3）戌月注意家務分工維護家庭和諧。秋季是婚姻關係鞏固和升華的最佳時機。`,
			冬季: `${name1}與${name2}迎來婚姻修復最佳期！水旺調候利於重建和諧夫妻關係。建議：1）制定夫妻溝通規則改善互動品質，2）重新分配家庭責任實現公平合理，3）規劃婚姻長期目標加強親密關係。丑月總結婚姻經驗制定來年發展計劃，為婚姻長久幸福做準備。`,
		},
	};

	const fallbacks = isSimplified ? fallbacksSimplified : fallbacksTraditional;

	return (
		fallbacks[concern]?.[seasonName] ||
		(isSimplified
			? `${name1}与${name2}在${seasonName}期间请根据双方具体情况谨慎分析夫妻关系发展。建议加强沟通理解，共同面对季节性的关系挑战，把握有利时机促进感情发展。`
			: `${name1}與${name2}在${seasonName}期間請根據雙方具體情況謹慎分析夫妻關係發展。建議加強溝通理解，共同面對季節性的關係挑戰，把握有利時機促進感情發展。`)
	);
}

function getCoupleFallbackSeasonData(
	concern,
	user1Info,
	user2Info,
	isSimplified = false,
) {
	const name1 = user1Info.name || (isSimplified ? "男方" : "男方");
	const name2 = user2Info.name || (isSimplified ? "女方" : "女方");

	const seasons = [
		{
			name: "春季",
			period: "寅卯辰月，木旺",
			icon: "🌸",
			color: "bg-green-500",
			content: getCoupleFallbackSeasonContent(
				"春季",
				concern,
				user1Info,
				user2Info,
				isSimplified,
			),
			keyPoints: isSimplified
				? ["感情萌芽", "寅卯辰月", "木旺生发"]
				: ["感情萌芽", "寅卯辰月", "木旺生發"],
		},
		{
			name: "夏季",
			period: "巳午未月，火土極旺",
			icon: "☀️",
			color: "bg-red-500",
			content: getCoupleFallbackSeasonContent(
				"夏季",
				concern,
				user1Info,
				user2Info,
				isSimplified,
			),
			keyPoints: isSimplified
				? ["情感考验", "巳午未月", "火旺冲克"]
				: ["情感考驗", "巳午未月", "火旺沖克"],
		},
		{
			name: "秋季",
			period: "申酉戌月，金旺",
			icon: "🍂",
			color: "bg-yellow-500",
			content: getCoupleFallbackSeasonContent(
				"秋季",
				concern,
				user1Info,
				user2Info,
				isSimplified,
			),
			keyPoints: isSimplified
				? ["感情收获", "申酉戌月", "金旺调和"]
				: ["感情收穫", "申酉戌月", "金旺調和"],
		},
		{
			name: "冬季",
			period: "亥子丑月，水旺",
			icon: "❄️",
			color: "bg-blue-500",
			content: getCoupleFallbackSeasonContent(
				"冬季",
				concern,
				user1Info,
				user2Info,
				isSimplified,
			),
			keyPoints: isSimplified
				? ["感情修复", "亥子丑月", "水旺调候"]
				: ["感情修復", "亥子丑月", "水旺調候"],
		},
	];

	return {
		seasons: seasons,
		title: isSimplified
			? `夫妻关键季节&注意事项 (${concern}指南)`
			: `夫妻關鍵季節&注意事項 (${concern}指南)`,
		fullContent: isSimplified
			? `${name1}与${name2}的夫妻季节分析基础版本。`
			: `${name1}與${name2}的夫妻季節分析基礎版本。`,
	};
}
