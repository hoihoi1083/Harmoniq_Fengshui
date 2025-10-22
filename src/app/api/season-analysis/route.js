// Set API timeout to 120 seconds for this route to handle heavy server load
export const maxDuration = 120;

export async function POST(req) {
	try {
		const { userInfo, currentDate, locale } = await req.json();

		if (!userInfo) {
			return Response.json(
				{ error: "Missing user information" },
				{ status: 400 }
			);
		}

		const { concern, birthday, gender, time } = userInfo;

		// Determine language based on locale
		const language =
			locale === "china" || locale === "zh-CN"
				? "simplified"
				: "traditional";
		const languageInstruction =
			language === "simplified" ? "请用简体中文回答" : "請用繁體中文回答";

		// Get current date information
		const currentYear = currentDate?.year || new Date().getFullYear();
		const currentMonth = currentDate?.month || new Date().getMonth() + 1;
		const currentSeasonName = currentDate?.currentSeason || "秋季";
		const relevantSeasons = currentDate?.relevantSeasons || [
			"秋季",
			"冬季",
			"春季",
			"夏季",
		];
		const isLatePart = currentDate?.isLatePart || false;

		// Create season analysis sections
		const seasonPeriods = {
			春季: "寅卯辰月，木旺",
			夏季: "巳午未月，火土極旺",
			秋季: "申酉戌月，金旺",
			冬季: "亥子丑月，水旺",
		};

		const createSeasonSection = (season, index) => {
			const isCurrentSeason = season === currentSeasonName;
			const priority = isCurrentSeason
				? "【當前季節 - 立即行動】"
				: index === 0
					? "【即將來臨】"
					: "【未來參考】";

			let focus = "";
			switch (season) {
				case "春季":
					focus = `八字中木的作用（印星、比劫、食傷等）、對${concern}的正面影響和風險、具體建議和注意事項（至少3條具體行動建議）、辰月的特殊性分析`;
					break;
				case "夏季":
					focus = `火旺對用戶八字的沖克情況、${concern}方面的危險和機遇、極致防護措施（至少3條具體措施）、未月土旺的特殊影響`;
					break;
				case "秋季":
					focus = `申月（金水）的影響和建議、酉月（純金）的最佳時機、戌月（土金）的注意事項、對${concern}的具體操作指導（至少3條建議）`;
					break;
				case "冬季":
					focus = `亥子月水旺的調候作用對${concern}的具體幫助、丑月土金庫的特殊性和機遇、對${concern}的修復和規劃建議（至少3條具體建議）、來年準備工作的具體指導、調候對整體命局的改善作用`;
					break;
			}

			let section = `#### **${priority} ${season}（${seasonPeriods[season]}）**：\n根據用戶八字分析${season}對其${concern}的具體影響。需包含：\n- ${focus}`;

			if (isCurrentSeason) {
				section += `\n- **當前${currentMonth}月${isLatePart ? "下旬" : "上旬"}的緊急注意事項**\n- **本月剩餘時間的具體行動計劃**`;
			}

			return section;
		};

		const seasonSections = relevantSeasons
			.map(createSeasonSection)
			.join("\n\n");

		// Enhanced prompt for comprehensive Season analysis based on 八字
		const prompt = `你是资深八字命理分析师。

**语言要求（最重要）**：
${
	language === "simplified"
		? `- 你必须将所有输出内容（包括标题、描述、所有文字）全部使用简体中文
- 绝对不可以使用繁体字
- 示例：季节、财运、事业、健康、时间、当前、建议（正确✓）
- 禁止：季節、財運、事業、健康、時間、當前、建議（错误✗）`
		: `- 你必須將所有輸出內容（包括標題、描述、所有文字）全部使用繁體中文
- 絕對不可以使用簡體字
- 示例：季節、財運、事業、健康、時間、當前、建議（正確✓）
- 禁止：季节、财运、事业、健康、时间、当前、建议（錯誤✗）`
}

${languageInstruction}，请为用户生成详细的四季运势分析，使用易懂的白话文：

用户信息：
- 生日：${birthday}
- 性别：${gender} 
- 时间：${time}
- 关注领域：${concern}

当前时间：${currentYear}年${currentMonth}月（${currentSeasonName}）

**重要要求：**
1. **使用白话文解释**，避免过于艰深的专业术语，让一般人都能理解
2. **季节顺序**：按当前季节开始，依次分析四季（${relevantSeasons.join(" → ")}）
3. **内容深度**：**每季节120-150字的深度分析，用简单易懂的语言解释五行理论**
4. **格式标准**：#### **季节名【状态标签】**（月份，五行特性）：详细分析内容
5. **⚠️ 关注领域限制**：用户关注「${concern}」，**绝对禁止提及其他领域的建议**
   - 如果是「事业」：只谈工作、职场、商业、合作、决策等
   - 如果是「感情」：只谈恋爱、婚姻、人际关系等  
   - 如果是「财运」：只谈投资、理财、收入、支出等
   - 如果是「健康」：只谈身体、养生、保健等
   - **严禁跨领域建议**：事业报告不可包含健康建议，健康报告不可包含财运建议等
6. **生活化解释**：用日常生活的例子来解释五行影响，而不是艰深的命理术语

**分析重点（每季节必须包含，但用白话文表达）：**
- **季节特性**：用简单语言解释该季节五行的基本特点（如：春天木旺就像树木生长，夏天火旺就像太阳很热）
- **对身体影响**：用白话解释五行对身体的影响机制（如：金克木就是说秋天的凉意会影响肝脏，因为中医认为肝属木）
- **对${concern}的影响**：用生活化的语言解释对关注领域的具体影响
- **时间重点**：提及重要时期但用白话说明（如：「白露之后」改为「9月中旬开始」）
- **具体建议**：提供3-4个简单易做的生活建议
- **简单禁忌**：基于五行原理但用白话表达的注意事项

**语言要求：**
- **避免过多专业术语**：如「七杀透干、偏印、财生杀攻身」等艰深词汇
- **用白话解释原理**：如「金克木」在「${concern}」方面的具体影响
- **生活化表达**：如「金气当令」改为「秋天金的能量最强」
- **简化时辰**：避免用「申时酉时」，改用「下午3-5点」等现代表达
- **实用建议**：提供与「${concern}」相关的容易执行方法

**${concern}領域專屬要求：**
${
	concern === "事業"
		? `
- 只談論：工作機會、職場發展、商業決策、團隊合作、客戶關係、業績提升
- 建議內容：開會時機、簽約建議、人脈建設、技能提升、職位晉升
- 禁止提及：身體健康、養生保健、感情關係、投資理財等其他領域`
		: concern === "感情"
			? `
- 只談論：戀愛機會、婚姻關係、人際交往、情感溝通、桃花運勢
- 建議內容：約會時機、表白建議、關係維護、感情發展、婚嫁時機
- 禁止提及：工作事業、身體健康、投資理財等其他領域`
			: concern === "財運"
				? `
- 只談論：投資機會、理財決策、收入增長、財富積累、金錢管理
- 建議內容：投資時機、理財建議、開源節流、商機把握、財務規劃
- 禁止提及：身體健康、工作事業、感情關係等其他領域`
				: concern === "健康"
					? `
- 只談論：身體保養、疾病預防、養生調理、體質改善、健康管理
- 建議內容：飲食調理、運動建議、作息調整、保健方法、體質調養
- 禁止提及：工作事業、感情關係、投資理財等其他領域`
					: `- 專注於「${concern}」相關的所有建議和分析`
}

**特别要求：**
- 当前季节${currentSeasonName}需要额外详细，包含"本月剩余时间的实用行动计划"
- 每个分析都要用白话解释"为什么"会这样影响，但保持专业性
- 使用现代人容易理解的表达方式
- 重点突出季节变化对日常生活的实际影响
- **确保内容丰富但易懂，每季节控制在120-150字范围内**

**五行季节对应关系（用白话解释）**：
- 春季（2-4月）：木的能量最强，就像植物生长，对肝脏最好，但可能影响脾胃
- 夏季（5-7月）：火的能量最强，就像夏日炎热，对心脏有影响，容易上火
- 秋季（8-10月）：金的能量最强，就像秋风凉爽，对肺部好，但可能伤肝
- 冬季（11-1月）：水的能量最强，就像冬季寒冷，对肾脏重要，要注意保暖

**最终检查要求：**
- 再次确认用户关注「${concern}」，所有建议必须100%聚焦于此领域
- 如果发现任何跨领域内容，立即修改为${concern}相关建议
- 每个季节分析都要明确说明对「${concern}」的具体影响和行动建议

**再次强调语言要求**：
${
	language === "simplified"
		? `你的回答必须100%使用简体中文，任何一个繁体字都不允许出现！`
		: `你的回答必須100%使用繁體中文，任何一個簡體字都不允許出現！`
}

请用白话文但保持专业内容，生成完整的四季分析，让一般人都能看懂并实际应用。`;

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
					max_tokens: 5000, // Balanced for detailed but accessible content
					temperature: 0.6, // More consistent for easier understanding
				}),
			}
		);

		if (!response.ok) {
			console.error(
				"DeepSeek API Error:",
				response.status,
				response.statusText
			);
			return Response.json(
				{ error: "AI analysis service unavailable" },
				{ status: 500 }
			);
		}

		const data = await response.json();
		const aiContent = data.choices?.[0]?.message?.content;

		if (!aiContent) {
			return Response.json(
				{ error: "No analysis generated" },
				{ status: 500 }
			);
		}

		// Parse the AI response to extract structured data
		const parsedContent = parseSeasonContent(
			aiContent,
			concern,
			currentSeasonName
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
		console.error("Season Analysis Error:", error);
		return Response.json(
			{ error: "Analysis generation failed" },
			{ status: 500 }
		);
	}
}

function parseSeasonContent(content, concern, currentSeasonName = "秋季") {
	try {
		// Get season context for time-aware content
		const getSeasonContext = (season) => {
			if (season === currentSeasonName) {
				return "【當前季節】";
			} else {
				return "【未來參考】";
			}
		};

		// Extract season sections with time context
		const baseSeasonsData = [
			{
				name: "春季",
				period: "寅卯辰月，木旺",
				icon: "🌸",
				color: "bg-green-500",
				keyPoints: ["印星助學", "寅卯辰月", "木旺"],
			},
			{
				name: "夏季",
				period: "巳午未月，火土極旺",
				icon: "☀️",
				color: "bg-red-500",
				keyPoints: ["極端防護", "巳午未月", "火旺"],
			},
			{
				name: "秋季",
				period: "申酉戌月，金旺",
				icon: "🍂",
				color: "bg-yellow-500",
				keyPoints: ["黃金收穫", "申酉戌月", "金旺"],
			},
			{
				name: "冬季",
				period: "亥子丑月，水旺",
				icon: "❄️",
				color: "bg-blue-500",
				keyPoints: ["黃金修復期", "亥子丑月", "水旺"],
			},
		];

		// Reorder seasons: current first, then chronological future seasons
		const currentIndex = baseSeasonsData.findIndex(
			(s) => s.name === currentSeasonName
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
					`【${originalSeasonName}[^】]*】[：:]?\\s*([\\s\\S]*?)(?=【(?:春季|夏季|秋季|冬季)|####(?:(?:春季|夏季|秋季|冬季))|$)`,
					"g"
				),
				// Pattern 2: **春季（寅卯辰月，木旺）**：
				new RegExp(
					`\\*\\*${originalSeasonName}[^*]*\\*\\*[：:]?\\s*([\\s\\S]*?)(?=\\*\\*(?:春季|夏季|秋季|冬季)|####\\s*\\*\\*(?:春季|夏季|秋季|冬季)|$)`,
					"g"
				),
				// Pattern 3: #### **春季（寅卯辰月，木旺）**：
				new RegExp(
					`####\\s*\\*\\*${originalSeasonName}[^*]*\\*\\*[：:]?\\s*([\\s\\S]*?)(?=####\\s*\\*\\*(?:春季|夏季|秋季|冬季)|$)`,
					"g"
				),
				// Pattern 4: 春季（寅卯辰月，木旺）：
				new RegExp(
					`${originalSeasonName}（[^）]*）[：:]?\\s*([\\s\\S]*?)(?=(?:春季|夏季|秋季|冬季)（|####\\s*(?:春季|夏季|秋季|冬季)|$)`,
					"g"
				),
				// Pattern 5: More flexible - season name followed by content (allow ### subsections)
				new RegExp(
					`${originalSeasonName}[^\\n]*[：:]([\\s\\S]*?)(?=(?:春季|夏季|秋季|冬季)【|(?:春季|夏季|秋季|冬季)（|####\\s*(?:春季|夏季|秋季|冬季)|$)`,
					"g"
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
						`${originalSeasonName}[^\\n]*\\n([\\s\\S]{50,500}?)(?=(?:春季|夏季|秋季|冬季)|$)`,
						"g"
					),
					new RegExp(
						`${originalSeasonName}[^。]*。([\\s\\S]{30,400}?)(?=(?:春季|夏季|秋季|冬季)|$)`,
						"g"
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
					.replace(/^####\s*/gm, "") // Remove markdown header markers but keep content
					.replace(/^###\s*/gm, "") // Remove markdown header markers but keep content
					.replace(/^\s*[-•]\s*/gm, "") // Remove bullet points at line start
					.replace(/\s*。\s*(?=。)/g, "") // Remove duplicate periods
					.replace(/\n\s*\n\s*\n/g, "\n\n") // Collapse triple+ newlines to double
					.trim();

				// Keep detailed AI-generated content for comprehensive analysis
				// Only trim if excessively long (over 1500 characters for single season)
				if (seasonContent.length > 1500) {
					// Find a good breaking point near 1200 characters
					const sentences = seasonContent.split(/[。！？]/);
					let trimmed = "";
					for (let sentence of sentences) {
						if (trimmed.length + sentence.length < 1200) {
							trimmed += sentence + "。";
						} else {
							break;
						}
					}
					seasonContent =
						trimmed || seasonContent.substring(0, 1200) + "...";
				}

				season.content = seasonContent;
			} else {
				// Use enhanced fallback content based on concern
				season.content = getFallbackSeasonContent(
					originalSeasonName,
					concern,
					currentSeasonName
				);
			}
		});

		return {
			seasons: seasons,
			fullContent: content,
			title: `關鍵季節&注意事項 (${concern}指南)`,
		};
	} catch (error) {
		console.error("Season content parsing error:", error);
		return getFallbackSeasonData(concern, currentSeasonName);
	}
}

function getFallbackSeasonContent(
	seasonName,
	concern,
	currentSeasonName = "秋季"
) {
	const getSeasonContext = (season) => {
		if (season === currentSeasonName) {
			return "【當前季節】";
		} else {
			return "【未來參考】";
		}
	};

	const fallbacks = {
		財運: {
			春季: `${getSeasonContext("春季")} 春季是木的能量最強的時候，就像春天樹木開始發芽生長一樣。這個時候最適合學習新技能和建立人脈關係，因為木代表成長和學習。不過要小心的是，木太旺會影響到土（脾胃），所以在投資理財方面要保守一點，不要太衝動。春天的木氣會慢慢生出火氣，讓人想法變多，但也容易變得太樂觀而做出冒險的決定。建議：制定今年的財務目標、多學習理財知識、維持好的工作關係、小心評估新的投資機會。這三個月是為全年打基礎的重要時期。`,
			夏季: `${getSeasonContext("夏季")} 夏季火的能量最強，就像大太陽很熱一樣，這時候最容易破財！火太旺會讓人情緒激動、容易衝動，很容易因為一時衝動而亂花錢或做錯投資決定。中醫說火克金，金代表錢財，所以夏天是一年中最容易漏財的時候。5-7月期間一定要：嚴格控制開支、絕對不要投機炒股、不要借錢給別人或跟別人合夥、努力保住工作、多存一些緊急備用金。特別是6-7月火氣最旺的時候，更要小心。這段時間保守一點總比後悔好。`,
			秋季: `${getSeasonContext("秋季")} 秋季金的能量最強，就像秋風涼爽、適合收穫一樣，這是一年中財運最好的時候！金代表收穫和理性思考，這時候頭腦會比較清楚，不容易做錯決定。金克木，可以壓制春夏時期累積的衝動情緒，讓人變得理性。8月開始適合：收回別人欠你的錢、整理投資狀況、尋找穩定的理財方式、談重要的合作案。9月是最好的時機，適合簽合約賺錢。10月要開始為長期做規劃。要好好把握這三個月的黃金時期，為明年的財運打好基礎。`,
			冬季: `${getSeasonContext("冬季")} 冬季水的能量最強，就像冬天要儲存能量一樣，這是學習理財智慧的好時機。水代表智慧和深度思考，這時候適合冷靜地分析和規劃。水能滅火，可以幫助平復夏天累積的浮躁情緒，讓人重新變得理性。11-1月適合：深入學習投資理財知識、研究市場趨勢、制定明年的財務目標、修復之前因為衝動而搞壞的財務關係。特別是12月最適合做總結和規劃。水有流動的特性，這時候可以調整資產配置。重點是培養理財的智慧和耐心，為明年創造財富做好準備。`,
		},
		健康: {
			春季: `${getSeasonContext("春季")} 春季木氣旺盛，就像春天萬物生長一樣，這是養肝最好的時候。中醫說肝屬木，春天木的能量強，所以肝臟功能會比較活躍，有助於身體排毒和新陳代謝。不過木太旺可能會影響脾胃（土），所以要注意飲食。春天陽氣上升，容易肝火旺，情緒起伏會比較大。建議：多到戶外運動曬太陽、多吃綠色蔬菜養肝、保持規律作息不要熬夜、學會管理情緒不要太急躁。4月天氣變化大，適合做身體調理。要順應春天向上生長的特性，多活動少坐著，為全年健康打好基礎。`,
			夏季: `${getSeasonContext("夏季")} 夏季火氣最旺，就像大熱天一樣，對健康是最大的考驗！火太旺會讓心血管系統壓力很大，容易高血壓、心跳快等問題。中醫說火克金，金主肺，所以呼吸系統也容易出問題。火旺還會消耗身體的水分，容易口乾、失眠。一定要：避免在大太陽下曝曬、不要做太激烈的運動、多喝水防止脫水、保持心情平靜不要太激動、規律睡眠不要熬夜、少吃辣的油炸食物。6-7月最熱的時候特別要注意心臟保養。這是一年中最需要小心養生的時期。`,
			秋季: `${getSeasonContext("秋季")} 秋季金氣當令，就像秋天涼爽乾燥一樣，最適合養肺。中醫說肺屬金，秋天金的能量強，可以幫助修復夏天火熱對肺部造成的傷害。金生水，也開始為冬天的腎臟保養做準備。不過要注意秋燥，皮膚和呼吸道容易乾燥。8月開始適合：吃一些滋潤的食物如梨子、白木耳、多做深呼吸運動強化肺部、注意皮膚保濕、適量進補為冬天做準備。9月是調理肺部的最佳時機。10月要注意保暖。要把握秋天收斂的特性，適度運動但不要太劇烈，為冬天儲存健康能量。`,
			冬季: `${getSeasonContext("冬季")} 冬季水氣旺盛，就像冬天需要保暖儲存能量一樣，這是養腎的關鍵時期。中醫說腎屬水，冬天水的能量強，腎臟功能會比較活躍。水克火，可以平衡全年火氣對身體的傷害，是修復元氣的最好時機。水生木，也為明年春天做準備。不過要注意保暖，水太寒會影響脾胃。11-1月適合：多吃溫熱的食物如羊肉湯、早睡晚起順應自然、做溫和的運動不要大汗、泡腳保暖。12月是調理腎臟的最佳時期。要順應冬天收藏的特性，多休息少消耗，為明年的健康儲備充足的活力。`,
		},
		事業: {
			春季: `${getSeasonContext("春季")} 春季木氣生發，就像春天植物開始生長一樣，這是學習和發展的好時機。木代表成長和學習，這時候學東西會比較快，也容易得到貴人幫助。木主仁慈，人際關係會比較和諧，適合建立工作上的人脈。不過要注意木旺克土，執行力可能會弱一點，想法很多但要努力去實現。建議：制定今年的職業發展計劃、積極參加訓練課程學習新技能、主動認識同行建立人脈、開始有價值的新專案。4月是把想法變成行動的好時機。要把握春天向上發展的能量，為全年事業打好基礎。`,
			夏季: `${getSeasonContext("夏季")} 夏季火氣旺盛，就像夏天太熱容易讓人煩躁一樣，在職場上是最危險的時期！火太旺會讓人情緒激動，很容易跟同事或老闆發生衝突，嚴重影響工作關係。火克金，金代表決策力，這時候容易做錯重要決定。火旺還會讓人野心太大，容易因為太急躁而做出錯誤的職業選擇。一定要：控制脾氣避免職場衝突、暫時不要做重大的職業決定、專心把現在的工作做好、維護好現有的人際關係、絕對不要在這時候換工作或創業。6-7月火氣最旺時要特別小心。保持穩定最重要。`,
			秋季: `${getSeasonContext("秋季")} 秋季金氣當令，就像秋天收穫一樣，這是事業發展的黃金時期！金代表收穫和理性判斷，這時候頭腦清楚，決策能力會大幅提升，是職業突破的最好時機。金克木，可以控制春夏累積的浮躁心情，讓人更專注更有執行力。8月開始適合：總結工作成果爭取老闆認可、積極申請升職加薪、尋找更好的工作機會、展示專業能力。9月是做重要職業決定的最佳時機。10月適合制定長期的職業規劃。要好好把握這個收穫的季節，實現事業上的重要突破。`,
			冬季: `${getSeasonContext("冬季")} 冬季水氣旺盛，就像冬天需要儲存能量一樣，這是培養職業智慧的關鍵時期。水代表智慧和深度思考，適合學習和規劃。水生木，為明年春天的事業發展做準備。水主流動變化，適合調整職業方向。11-1月適合：深入學習專業知識、關注行業趨勢變化、制定明年的職業目標、養成長期學習的習慣。12月是總結經驗、規劃未來的重要時期。水代表智慧謀略，這時候制定的職業規劃通常比較有遠見。要培養職業智慧和戰略思維，深思熟慮為明年的事業成功做好充分準備。`,
		},
		感情: {
			春季: `${getSeasonContext("春季")} 春季木氣生發，就像春天花開一樣，這是感情萌芽的美好時機。木代表生長和包容，這時候感情容易有新的開始，也容易增進彼此的感情。木主仁愛，會讓人更有愛心和包容心，有助於理解對方。不過要注意木旺克土，感情雖然美好但可能不夠穩定，需要加強感情的基礎。建議：多安排戶外約會活動、真誠地表達自己的想法、一起規劃美好的未來、培養共同的興趣愛好。單身的人容易遇到好的對象，有伴的人感情會升溫。4月適合深入了解對方。要把握春天浪漫的氣氛，讓感情自然成長。`,
			夏季: `${getSeasonContext("夏季")} 夏季火氣旺盛，就像夏天炎熱一樣，感情容易有劇烈的波動！火太旺會讓人情緒激動，很容易因為小事情吵架，感情關係面臨考驗。火克金，理性思考能力下降，容易做出傷害感情的衝動決定。火旺還會讓人佔有欲和控制欲變強，可能因為嫉妒而破壞和諧。一定要：控制脾氣避免激烈爭吵、給彼此一些冷靜的空間、暫時不要做分手或結婚等重大決定、多看對方的優點、避免在情緒激動時討論敏感話題。6-7月火氣最旺時特別需要情緒管理。這是感情最危險的考驗期。`,
			秋季: `${getSeasonContext("秋季")} 秋季金氣當令，就像秋天成熟收穫一樣，這是感情深化的好時機。金代表成熟和理性，能夠客觀地看待感情關係，做出明智的感情決定。金克木，可以調節春夏累積的感情波動，讓關係變得穩定成熟。8月開始適合：深入地溝通化解誤會、重新思考感情的未來、考慮訂婚結婚等重要承諾、規劃共同的人生目標。9月是做重要感情決定的最佳時機。10月適合建立穩固的感情基礎。金雖然利於收穫，但要注意不要太冷漠，要保持感情的溫度。把握成熟的秋天，讓感情關係更上一層樓。`,
			冬季: `${getSeasonContext("冬季")} 冬季水氣旺盛，就像冬天深沉寧靜一樣，這是感情修復和深化的關鍵時期。水代表深情和智慧，能夠包容一切，有助於修復感情創傷和增進理解。水生木，為明年春天感情的新發展做準備。水主變化，適合調整相處的方式。11-1月適合：深夜談心增進理解、分享真實的內心想法、一起修復過去的感情創傷、培養更深的情感連結。12月是總結感情經驗、規劃長期關係的重要時期。水代表智慧和包容，這時候培養的感情深度會影響一輩子。要培養真摯的深情，為明年的感情幸福打好基礎。`,
		},
	};

	return (
		fallbacks[concern]?.[seasonName] ||
		`${seasonName}期間請根據個人情況謹慎分析。`
	);
}

function getFallbackSeasonData(concern, currentSeasonName = "秋季") {
	const seasons = [
		{
			name: "春季",
			period: "寅卯辰月，木旺",
			icon: "🌸",
			color: "bg-green-500",
			content: getFallbackSeasonContent(
				"春季",
				concern,
				currentSeasonName
			),
			keyPoints: ["印星助學", "寅卯辰月", "木旺"],
		},
		{
			name: "夏季",
			period: "巳午未月，火土極旺",
			icon: "☀️",
			color: "bg-red-500",
			content: getFallbackSeasonContent(
				"夏季",
				concern,
				currentSeasonName
			),
			keyPoints: ["極端防護", "巳午未月", "火旺"],
		},
		{
			name: "秋季",
			period: "申酉戌月，金旺",
			icon: "🍂",
			color: "bg-yellow-500",
			content: getFallbackSeasonContent(
				"秋季",
				concern,
				currentSeasonName
			),
			keyPoints: ["黃金收穫", "申酉戌月", "金旺"],
		},
		{
			name: "冬季",
			period: "亥子丑月，水旺",
			icon: "❄️",
			color: "bg-blue-500",
			content: getFallbackSeasonContent(
				"冬季",
				concern,
				currentSeasonName
			),
			keyPoints: ["黃金修復期", "亥子丑月", "水旺"],
		},
	];

	return {
		seasons: seasons,
		title: `關鍵季節&注意事項 (${concern}指南)`,
		fullContent: "使用基礎季節分析。",
	};
}
