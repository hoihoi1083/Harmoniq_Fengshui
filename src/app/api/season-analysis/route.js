// Set API timeout to 120 seconds for this route to handle heavy server load
export const maxDuration = 120;

export async function POST(req) {
	try {
		const { userInfo, currentDate, locale } = await req.json();

		if (!userInfo) {
			return Response.json(
				{ error: "Missing user information" },
				{ status: 400 },
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
3. **内容深度**：**每季节包含主要说明、具体建议、简单禁忌的完整分析**
4. **严格格式标准**：每个季节必须遵循以下结构
   - 标题行：#### **【季节标签】季节名（月份，五行特性）**
   - 主要说明：1个段落，100-120字，解释该季节如何影响${concern}
   - 具体建议部分：以"**具体建议：**"开头，列举3条建议，每条以"- "开头
   - 简单禁忌部分：以"**简单禁忌：**"开头，列举1条禁忌，以"- "开头
5. **⚠️ 关注领域限制**：用户关注「${concern}」，**绝对禁止提及其他领域的建议**
   - 如果是「事业」：只谈工作、职场、商业、合作、决策等
   - 如果是「感情」：只谈恋爱、婚姻、人际关系等  
   - 如果是「财运」：只谈投资、理财、收入、支出等
   - 如果是「健康」：只谈身体、养生、保健等
   - **严禁跨领域建议**：事业报告不可包含健康建议，健康报告不可包含财运建议等
6. **生活化解释**：用日常生活的例子来解释五行影响，而不是艰深的命理术语

**分析重点（每季节必须包含，但用白话文表达）：**
- **季节特性**：用简单语言解释该季节五行的基本特点
- **对${concern}的影响**：用生活化的语言解释对关注领域的具体影响
- **具体建议**：提供3个简短明确的建议，每条建议只用一句话（15-20字以内）
- **简单禁忌**：提供1个最关键的需要避免的注意事项

**必须的格式化结构（每个季节严格按以下格式）：**
每个季节的分析必须包含以下部分：
1. 标题行：#### **【季节标签】季节名（月份，五行特性）**
2. 主要说明：1个段落，100-120字，解释该季节如何影响${concern}
3. 具体建议部分：以"**具体建议：**"开头，列举3条简短建议（每条15-20字）
4. 简单禁忌部分：以"**简单禁忌：**"开头，列举3条禁忌

示例格式（每个季节必须包含这四部分）：
【当前季节】秋季（申酉戌月，金旺）
秋季是金气最强的时候，就像秋天收获一样。金代表理性和判断，这个时候特别适合做重要的${concern}决定...

**具体建议：**
- 整理财务，收回欠款
- 研究有潜力的投资标的
- 增加紧急备用金储蓄

**简单禁忌：**
- 禁忌：最关键的需要避免的事项

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
		let aiContent = data.choices?.[0]?.message?.content;

		if (!aiContent) {
			return Response.json(
				{ error: "No analysis generated" },
				{ status: 500 },
			);
		}

		// Log AI response for debugging
		console.log("🤖 AI Raw Response (first 500 chars):", aiContent.substring(0, 500));

		// Remove disclaimer text if present
		aiContent = aiContent.replace(
			/（以上分析僅基於傳統五行理論，提供生活化建議，實際決策請結合個人情況與專業財務顧問意見。）/g,
			"",
		);
		aiContent = aiContent.replace(
			/\(以上分析仅基于传统五行理论，提供生活化建议，实际决策请结合个人情况与专业财务顾问意见。\)/g,
			"",
		);

		// Parse the AI response to extract structured data
		const parsedContent = parseSeasonContent(
			aiContent,
			concern,
			currentSeasonName,
		);

		console.log("📊 Parsed Seasons Count:", parsedContent.seasons.length);
		parsedContent.seasons.forEach((s, idx) => {
			console.log(`  Season ${idx + 1}: "${s.name}" - Content length: ${s.content?.length || 0}, Suggestions: ${s.suggestions?.length || 0}, Taboos: ${s.taboos?.length || 0}`);
		});

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
			{ status: 500 },
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
		seasons.forEach((season, seasonIdx) => {
			let seasonContent = "";
			let suggestions = [];
			let taboos = [];

			// Use original season name without time context for parsing
			const originalSeasonName = season.name.replace(/【[^】]*】/, "");

			console.log(`\n📍 Parsing season ${seasonIdx + 1}: ${originalSeasonName}`);

			// Try to extract full structured content first
			// Primary pattern: matches 【Season Label】Season Name（months, element） format
			// Supports both: ### **【】Season**  and  【】Season（）
			const structuredPattern = new RegExp(
				`(?:###\\s*)?\\*\\*?【[^】]*】${originalSeasonName}[（(][^）)]*[）)]\\*\\*?\\s*([\\s\\S]*?)(?=###\\s*\\*\\*【|【[^】]*】(?:春季|夏季|秋季|冬季)|####|$)`,
				"g",
			);

			let structuredMatch = null;
			structuredPattern.lastIndex = 0;
			let match;
			while ((match = structuredPattern.exec(content)) !== null) {
				if (match[1]) {
					structuredMatch = match[1].trim();
					console.log(`✅ Found structured content (Pattern 1) for ${originalSeasonName}`);
					break;
				}
			}

			if (!structuredMatch) {
				console.log(`❌ No structured content found (Pattern 1) for ${originalSeasonName}, trying Pattern 2...`);
				// Fallback Pattern 2: Try simpler format with just season name
				const altPattern = new RegExp(
					`(?:###|####)?\\s*\\*\\*?【[^】]*】${originalSeasonName}[^\\n]*\\n([\\s\\S]*?)(?=###|####|【|$)`,
					"g",
				);
				altPattern.lastIndex = 0;
				let altMatch;
				while ((altMatch = altPattern.exec(content)) !== null) {
					if (altMatch[1]) {
						structuredMatch = altMatch[1].trim();
						console.log(`✅ Found structured content (Pattern 2) for ${originalSeasonName}`);
						break;
					}
				}
			}

			if (structuredMatch) {
				// Parse structured content
				const lines = structuredMatch.split("\n");
				let mainText = "";
				let readingMain = true;

				for (let i = 0; i < lines.length; i++) {
					let line = lines[i].trim();
					
					if (line.includes("具体建议") || line.includes("具體建議")) {
						readingMain = false;
						// Extract suggestions from lines after this header
						for (let j = i + 1; j < lines.length; j++) {
							const suggLine = lines[j].trim();
							if (
								suggLine.includes("简单禁忌") ||
								suggLine.includes("簡單禁忌")
							) {
								break;
							}
							// Match bullet points (-•*) or numbered lists (1. 2. 3.)
							if (suggLine) {
								let cleanSugg = suggLine
									.replace(/^[-•*·]\s*/, "") // Remove bullet
									.replace(/^\d+[.。]\s*/, "") // Remove numbering
									.trim();
								if (cleanSugg && cleanSugg.length > 2) {
									suggestions.push(cleanSugg);
								}
							}
						}
					} else if (
						line.includes("简单禁忌") ||
						line.includes("簡單禁忌")
					) {
						readingMain = false;
						// Extract taboos from lines after this header
						for (let j = i + 1; j < lines.length; j++) {
							const tabooLine = lines[j].trim();
							if (tabooLine.startsWith("【") || tabooLine.startsWith("####")) {
								break;
							}
							if (tabooLine) {
								let cleanTaboo = tabooLine
									.replace(/^[-•*·]\s*/, "") // Remove bullet
									.replace(/^\d+[.。]\s*/, "") // Remove numbering
									.trim();
								if (cleanTaboo && cleanTaboo.length > 2) {
									taboos.push(cleanTaboo);
								}
							}
						}
					}

					if (readingMain && line && !line.startsWith("#")) {
						mainText += line + " ";
					}
				}

				seasonContent = mainText
					.replace(/【[^】]*】/g, "")
					.replace(/\*\*/g, "")
					.replace(/\n/g, " ")
					.trim();
				
				if (seasonContent && suggestions.length > 0) {
					console.log(`✅ Extracted structured data for ${originalSeasonName}: content=${seasonContent.length}chars, suggestions=${suggestions.length}, taboos=${taboos.length}`);
				}
			}

			// Fallback: Try different patterns if structured parsing didn't work
			if (!seasonContent) {
				console.log(`\t→ Trying fallback patterns for ${originalSeasonName}...`);
				const patterns = [
					// Pattern 1: 【春季（寅卯辰月，木旺）】：
					new RegExp(
						`【${originalSeasonName}[^】]*】[：:]?\\s*([\\s\\S]*?)(?=【(?:春季|夏季|秋季|冬季)|####(?:(?:春季|夏季|秋季|冬季))|$)`,
						"g",
					),
					// Pattern 2: **春季（寅卯辰月，木旺）**：
					new RegExp(
						`\\*\\*${originalSeasonName}[^*]*\\*\\*[：:]?\\s*([\\s\\S]*?)(?=\\*\\*(?:春季|夏季|秋季|冬季)|####\\s*\\*\\*(?:春季|夏季|秋季|冬季)|$)`,
						"g",
					),
					// Pattern 3: #### **春季（寅卯辰月，木旺）**：
					new RegExp(
						`####\\s*\\*\\*${originalSeasonName}[^*]*\\*\\*[：:]?\\s*([\\s\\S]*?)(?=####\\s*\\*\\*(?:春季|夏季|秋季|冬季)|$)`,
						"g",
					),
					// Pattern 4: 春季（寅卯辰月，木旺）：
					new RegExp(
						`${originalSeasonName}（[^）]*）[：:]?\\s*([\\s\\S]*?)(?=(?:春季|夏季|秋季|冬季)（|####\\s*(?:春季|夏季|秋季|冬季)|$)`,
						"g",
					),
					// Pattern 5: More flexible - season name followed by content (allow ### subsections)
					new RegExp(
						`${originalSeasonName}[^\\n]*[：:]([\\s\\S]*?)(?=(?:春季|夏季|秋季|冬季)【|(?:春季|夏季|秋季|冬季)（|####\\s*(?:春季|夏季|秋季|冬季)|$)`,
						"g",
					),
					// Pattern 6: SUPER aggressive - just grab anything after season name with 50+ chars
					new RegExp(
						`${originalSeasonName}[\\s\\S]{0,100}[\\s\\S]{50,}?(?=(?:春季|夏季|秋季|冬季)|$)`,
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
								console.log(`\t✓ Fallback pattern found content for ${originalSeasonName}: ${rawContent.substring(0, 60)}...`);
								break;
							}
						} else if (match[0] && match[0].length > 80) {
							// Fallback: use whole match if capture group is empty
							seasonContent = match[0].replace(originalSeasonName, "").trim();
							console.log(`\t✓ Fallback pattern found content (no capture) for ${originalSeasonName}`);
							break;
						}
					}
					if (seasonContent) break;
				}

				// FINAL FALLBACK: If still nothing, look for any paragraph with 100+ chars
				if (!seasonContent) {
					console.log(`\t→ No patterns matched, trying aggressive text extraction...`);
					const afterSeason = content.split(originalSeasonName);
					if (afterSeason.length > 1) {
						// Take next 500 chars after season name
						const textAfter = afterSeason[1].substring(0, 500);
						// Find first paragraph (ends with 。 or ！or ？)
						const paragraphMatch = textAfter.match(/([^。！？]*[。！？])/);
						if (paragraphMatch) {
							seasonContent = paragraphMatch[1]
								.trim()
								.substring(0, 200)
								.trim();
							console.log(`\t⚠ Using extracted paragraph for ${originalSeasonName}`);
						}
					}
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
				season.suggestions = suggestions;
				season.taboos = taboos;
				console.log(`✨ Using AI content for ${originalSeasonName}`);
			} else {
				// Use enhanced fallback content based on concern
				console.log(`🔄 Using FALLBACK for ${originalSeasonName} - no structured or flexible content found`);
				const fallbackContent = getFallbackSeasonContent(
					originalSeasonName,
					concern,
					currentSeasonName,
				);
				season.content = fallbackContent.content;
				season.suggestions = fallbackContent.suggestions;
				season.taboos = fallbackContent.taboos;
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
	currentSeasonName = "秋季",
) {
	const fallbackData = {
		財運: {
			春季: {
				content: `春季是木的能量最強的時候，就像春天樹木開始發芽生長一樣。這個時候最適合學習新技能和建立人脈關係，因為木代表成長和學習。不過要小心的是，木太旺會影響到土（脾胃），所以在投資理財方面要保守一點。`,
				suggestions: ["制定財務目標", "學習理財知識", "維持工作關係"],
				taboos: ["避免衝動投資"],
			},
			夏季: {
				content: `夏季火的能量最強，就像大太陽很熱一樣，這時候最容易破財！火太旺會讓人情緒激動、容易衝動，很容易因為一時衝動而亂花錢或做錯投資決定。中醫說火克金，金代表錢財，所以夏天是一年中最容易漏財的時候。`,
				suggestions: ["控制開支預算", "增加緊急備用金", "穩定工作收入"],
				taboos: ["避免衝動消費"],
			},
			秋季: {
				content: `秋季金的能量最強，就像秋風涼爽、適合收穫一樣，這是一年中財運最好的時候！金代表收穫和理性思考，這時候頭腦會比較清楚，不容易做錯決定。金克木，可以壓制春夏時期累積的衝動情緒，讓人變得理性。`,
				suggestions: ["收回欠款", "整理投資狀況", "尋找穩定理財方式"],
				taboos: ["謹慎評估新機會"],
			},
			冬季: {
				content: `冬季水的能量最強，就像冬天要儲存能量一樣，這是學習理財智慧的好時機。水代表智慧和深度思考，這時候適合冷靜地分析和規劃。水能滅火，可以幫助平復夏天累積的浮躁情緒，讓人重新變得理性。`,
				suggestions: ["學習理財知識", "研究市場趨勢", "制定財務目標"],
				taboos: ["謹慎調整資產配置"],
			},
		},
		健康: {
			春季: {
				content: `春季木氣旺盛，就像春天萬物生長一樣，這是養肝最好的時候。中醫說肝屬木，春天木的能量強，所以肝臟功能會比較活躍，有助於身體排毒和新陳代謝。不過木太旺可能會影響脾胃（土），所以要注意飲食。`,
				suggestions: ["多到戶外運動", "多吃綠色蔬菜", "保持規律作息"],
				taboos: ["避免過度疲勞"],
			},
			夏季: {
				content: `夏季火氣最旺，就像大熱天一樣，對健康是最大的考驗！火太旺會讓心血管系統壓力很大，容易高血壓、心跳快等問題。中醫說火克金，金主肺，所以呼吸系統也容易出問題。火旺還會消耗身體的水分，容易口乾、失眠。`,
				suggestions: ["多喝水防脫水", "保持心情平靜", "規律睡眠"],
				taboos: ["避免在大太陽下曝曬"],
			},
			秋季: {
				content: `秋季金氣當令，就像秋天涼爽乾燥一樣，最適合養肺。中醫說肺屬金，秋天金的能量強，可以幫助修復夏天火熱對肺部造成的傷害。金生水，也開始為冬天的腎臟保養做準備。不過要注意秋燥，皮膚和呼吸道容易乾燥。`,
				suggestions: ["吃滋潤食物如梨子", "多做深呼吸運動", "注意皮膚保濕"],
				taboos: ["避免過度乾燥"],
			},
			冬季: {
				content: `冬季水氣旺盛，就像冬天需要保暖儲存能量一樣，這是養腎的關鍵時期。中醫說腎屬水，冬天水的能量強，腎臟功能會比較活躍。水克火，可以平衡全年火氣對身體的傷害，是修復元氣的最好時機。`,
				suggestions: ["多吃溫熱食物", "早睡晚起", "泡腳保暖"],
				taboos: ["避免過度疲勞"],
			},
		},
		事業: {
			春季: {
				content: `春季木氣生發，就像春天植物開始生長一樣，這是學習和發展的好時機。木代表成長和學習，這時候學東西會比較快，也容易得到貴人幫助。木主仁慈，人際關係會比較和諧，適合建立工作上的人脈。`,
				suggestions: ["制定職業發展計劃", "學習新技能", "主動建立人脈"],
				taboos: ["避免執行力弱"],
			},
			夏季: {
				content: `夏季火氣旺盛，就像夏天太熱容易讓人煩躁一樣，在職場上是最危險的時期！火太旺會讓人情緒激動，很容易跟同事或老闆發生衝突，嚴重影響工作關係。火克金，金代表決策力，這時候容易做錯重要決定。`,
				suggestions: ["控制脾氣避免衝突", "專心做好工作", "維護人際關係"],
				taboos: ["絕對不要在這時候換工作或創業"],
			},
			秋季: {
				content: `秋季金氣當令，就像秋天收穫一樣，這是事業發展的黃金時期！金代表收穫和理性判斷，這時候頭腦清楚，決策能力會大幅提升，是職業突破的最好時機。金克木，可以控制春夏累積的浮躁心情，讓人更專注更有執行力。`,
				suggestions: ["總結工作成果", "申請升職加薪", "展示專業能力"],
				taboos: ["避免過度自信"],
			},
			冬季: {
				content: `冬季水氣旺盛，就像冬天需要儲存能量一樣，這是培養職業智慧的關鍵時期。水代表智慧和深度思考，適合學習和規劃。水生木，為明年春天的事業發展做準備。水主流動變化，適合調整職業方向。`,
				suggestions: ["深入學習專業", "關注行業趨勢", "制定職業目標"],
				taboos: ["避免匆促改變"],
			},
		},
		感情: {
			春季: {
				content: `春季木氣生發，就像春天花開一樣，這是感情萌芽的美好時機。木代表生長和包容，這時候感情容易有新的開始，也容易增進彼此的感情。木主仁愛，會讓人更有愛心和包容心，有助於理解對方。`,
				suggestions: ["安排戶外約會", "真誠表達想法", "一起規劃未來"],
				taboos: ["避免感情不穩定"],
			},
			夏季: {
				content: `夏季火氣旺盛，就像夏天炎熱一樣，感情容易有劇烈的波動！火太旺會讓人情緒激動，很容易因為小事情吵架，感情關係面臨考驗。火克金，理性思考能力下降，容易做出傷害感情的衝動決定。`,
				suggestions: ["控制脾氣避免爭吵", "給彼此冷靜空間", "多看對方優點"],
				taboos: ["絕對不要在激動時做分手決定"],
			},
			秋季: {
				content: `秋季金氣當令，就像秋天成熟收穫一樣，這是感情深化的好時機。金代表成熟和理性，能夠客觀地看待感情關係，做出明智的感情決定。金克木，可以調節春夏累積的感情波動，讓關係變得穩定成熟。`,
				suggestions: ["深入溝通化解誤會", "重新思考感情未來", "考慮訂婚結婚"],
				taboos: ["避免過度理性冷漠"],
			},
			冬季: {
				content: `冬季水氣旺盛，就像冬天深沉寧靜一樣，這是感情修復和深化的關鍵時期。水代表深情和智慧，能夠包容一切，有助於修復感情創傷和增進理解。水生木，為明年春天感情的新發展做準備。`,
				suggestions: ["深夜談心增進理解", "分享真實想法", "修復感情創傷"],
				taboos: ["避免過度沉溺"],
			},
		},
	};

	return (
		fallbackData[concern]?.[seasonName] || {
			content: `${seasonName}期間請根據個人情況謹慎分析。`,
			suggestions: [],
			taboos: [],
		}
	);
}

function getFallbackSeasonData(concern, currentSeasonName = "秋季") {
	const baseSeasonsData = [
		{ name: "春季", period: "寅卯辰月，木旺" },
		{ name: "夏季", period: "巳午未月，火土極旺" },
		{ name: "秋季", period: "申酉戌月，金旺" },
		{ name: "冬季", period: "亥子丑月，水旺" },
	];

	const seasons = baseSeasonsData.map((s) => {
		const fallbackContent = getFallbackSeasonContent(s.name, concern, currentSeasonName);
		return {
			name: s.name,
			period: s.period,
			content: fallbackContent.content,
			suggestions: fallbackContent.suggestions,
			taboos: fallbackContent.taboos,
		};
	});

	return {
		seasons: seasons,
		title: `關鍵季節&注意事項 (${concern}指南)`,
		fullContent: "使用基礎季節分析。",
	};
}
