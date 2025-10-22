// Set API timeout to 120 seconds for this route to handle heavy server load
export const maxDuration = 120;

export async function POST(req) {
	try {
		const { userInfo, locale } = await req.json();

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

		// Enhanced prompt for comprehensive JiXiong analysis with 4-character titles
		const currentMonth = new Date().getMonth() + 1;
		const currentYear = new Date().getFullYear();

		const prompt = `你是专业的八字命理分析师。

**语言要求（最重要）**：
${
	language === "simplified"
		? `- 你必须将所有输出内容（包括标题、描述、所有文字）全部使用简体中文
- 绝对不可以使用繁体字
- 示例：财运、事业、健康、时间、当前、关注、信息（正确✓）
- 禁止：財運、事業、健康、時間、當前、關注、信息（错误✗）`
		: `- 你必須將所有輸出內容（包括標題、描述、所有文字）全部使用繁體中文
- 絕對不可以使用簡體字
- 示例：財運、事業、健康、時間、當前、關注、信息（正確✓）
- 禁止：财运、事业、健康、时间、当前、关注、信息（錯誤✗）`
}

${languageInstruction}，根据以下信息进行精准的吉凶分析：

用户信息：
- 生日：${birthday}
- 性别：${gender}
- 时间：${time}
- 关注领域：${concern}
- 当前时间：${currentYear}年${currentMonth}月

**重要时间标示规则**：
1. 当前是${currentYear}年${currentMonth}月，所有建议必须针对未来时间
2. 提及未来月份时必须明确标示"明年"（如：明年2月、明年春季）
3. 使用季节词汇时须注明具体月份范围（如：春季指明年3-5月、夏季指6-8月）
4. 使用节气时必须标注约略日期（如：谷雨（约4月19日）、霜降（约10月23日））
5. 使用时辰时须标注具体时间范围（如：午时（11-13时）、子时（23-1时））

**时间标示示例**：
✅ 正确：今年霜降（10月23日）后每日饮用蜂蜜柠檬水
✅ 正确：明年谷雨（约4月19日）前后进行中医调理
✅ 正确：夏季（6-8月）午时（11-13时）安排午休15分钟
✅ 正确：明年春季（3-5月）是事业发展的关键期
❌ 错误：2月适合投资（应标示：明年2月适合投资）
❌ 错误：春季注意健康（应标示：明年春季（3-5月）注意健康）
❌ 错误：谷雨前后调理（应标示：明年谷雨（约4月19日）前后调理）

请按照以下格式提供 ${concern} 的吉凶分析：

【3个吉象与3个凶象】

【3个吉象（被动防护，需极致保守方能显现）】：
请提供3个具体的吉象，每个必须包含：
- 标题（必须是有意义的四字词语，如：贵人暗助、厚积薄发、稳中得财、暗中得助、技能避险、根基稳固）
- 详细内容（150-200字，完整描述）

重要：标题必须是经典的四字成语或风水术语，绝对不可以是句子的前四个字！

吉象四字词语示例：
- 贵人暗助（有长辈或专业人士的帮助）
- 厚积薄发（通过长期积累获得收益）
- 稳中得财（保守策略下的财富增长）
- 暗中得助（意外的帮助或机会）
- 技能避险（专业技能带来的保护）
- 根基稳固（基础牢固，稳定发展）

格式如下：
① [有意义的四字词语]：[详细内容...]
② [有意义的四字词语]：[详细内容...]  
③ [有意义的四字词语]：[详细内容...]

【3个凶象（主导致命，强力影响）】：
请提供3个具体的凶象，每个必须包含：
- 标题（必须是有意义的四字词语，如：比劫夺财、小人妨害、决策失误、官非口舌、刑冲动荡、破财损耗）
- 详细内容（150-200字，完整描述）

凶象四字词语示例：
- 比劫夺财（竞争者抢夺利益）
- 小人妨害（有人从中作梗）
- 决策失误（判断错误导致损失）
- 官非口舌（法律纠纷或争执）
- 刑冲动荡（环境变化带来不稳定）
- 破财损耗（意外支出或投资亏损）

格式如下：
① [有意义的四字词语]：[详细内容...]
② [有意义的四字词语]：[详细内容...]
③ [有意义的四字词语]：[详细内容...]

【关键季节&注意事项】：
- 最危险的时期（必须标示具体月份和年份，如：明年3-5月、今年11-12月）
- 相对安全的时期（必须标示具体月份和年份）
- 具体的预防措施（若提及时间点，必须明确标注）

严格要求：
1. 基于真实的八字分析，${concern === "工作" ? "请按事业运势分析" : ""}
2. 针对 ${concern} 领域提供专业且具体的建议
3. 每个标题必须是有意义的四字词语，绝对不可以是文章前四个字！
4. 标题必须是成语、专业术语或有完整意义的词组
5. 语言要专业但易懂，避免过于深奥的术语
6. 总字数控制在800-1000字内
7. **所有时间建议必须针对未来，当前是${currentMonth}月，请只提供${currentMonth}月之后的时间建议**
8. **使用月份时必须标示"今年"或"明年"，使用季节必须标注月份范围，使用节气必须标注日期**

请务必确保每个标题都是完整有意义的四字词语，而不是句子片段！
请务必确保所有时间相关的建议都清楚标示是今年还是明年，并包含具体月份或日期！

**再次强调语言要求**：
${
	language === "simplified"
		? `你的回答必须100%使用简体中文，任何一个繁体字都不允许出现！`
		: `你的回答必須100%使用繁體中文，任何一個簡體字都不允許出現！`
}`;

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
					max_tokens: 2000, // Optimized for server performance under load
					temperature: 0.6,
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
		const parsedContent = parseJiXiongContent(aiContent);

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
		console.error("JiXiong Analysis Error:", error);
		return Response.json(
			{ error: "Analysis generation failed" },
			{ status: 500 }
		);
	}
}

function parseJiXiongContent(content) {
	try {
		console.log("🔍 Parsing AI content, length:", content.length);
		console.log("📄 Content preview:", content.substring(0, 500));

		// Parse 吉象 (Auspicious signs) - try multiple patterns
		const jixiangPatterns = [
			/【3個吉象[^】]*】([\s\S]*?)(?=【3個凶象|【關鍵季節|$)/,
			/【\d+个吉象[^】]*】([\s\S]*?)(?=【\d+个凶象|【關鍵季節|$)/,
			/吉象[^】]*】([\s\S]*?)(?=凶象|【關鍵季節|$)/,
			// New pattern for the actual format we're seeing
			/①\s*\*\*([^*]+)\*\*[：:]([\s\S]*?)(?=②|【|$)/,
		];

		let jixiangContent = "";
		for (const pattern of jixiangPatterns) {
			const match = content.match(pattern);
			if (match) {
				jixiangContent = match[0];
				console.log("✅ Found jixiang content with pattern");
				break;
			}
		}

		// Parse 凶象 (Inauspicious signs) - try multiple patterns
		const xiongxiangPatterns = [
			/【3個凶象[^】]*】([\s\S]*?)(?=【關鍵季節|$)/,
			/【\d+个凶象[^】]*】([\s\S]*?)(?=【關鍵季節|$)/,
			/凶象[^】]*】([\s\S]*?)(?=【關鍵季節|$)/,
		];

		let xiongxiangContent = "";
		for (const pattern of xiongxiangPatterns) {
			const match = content.match(pattern);
			if (match) {
				xiongxiangContent = match[0];
				console.log("✅ Found xiongxiang content with pattern");
				break;
			}
		}

		// If we can't find the sections, try to extract from the full content directly
		if (!jixiangContent && !xiongxiangContent) {
			console.log(
				"🔄 Trying to extract items directly from full content"
			);
			const allItems = extractNumberedItems(content);

			if (allItems.length >= 3) {
				console.log(
					`✅ Extracted ${allItems.length} items from full content`
				);

				// Split items between jixiang and xiongxiang
				const midPoint = Math.ceil(allItems.length / 2);
				const jixiang = allItems.slice(0, midPoint);
				const xiongxiang = allItems.slice(midPoint);

				return {
					jixiang:
						jixiang.length > 0 ? jixiang : getFallbackJixiang(),
					xiongxiang:
						xiongxiang.length > 0
							? xiongxiang
							: getFallbackXiongxiang(),
					seasonInfo: "【關鍵季節】請根據個人八字具體分析關鍵時期。",
					fullContent: content,
				};
			}
		}

		// Parse 關鍵季節 (Key seasons)
		const seasonPattern = /【關鍵季節[^】]*】[\s\S]*$/;
		const seasonMatch = content.match(seasonPattern);
		const seasonContent = seasonMatch ? seasonMatch[0] : "";

		console.log("🎭 Jixiang content found:", !!jixiangContent);
		console.log("⚡ Xiongxiang content found:", !!xiongxiangContent);

		// Extract individual 吉象 items
		const jixiang = jixiangContent
			? extractItems(jixiangContent, "吉象")
			: [];
		console.log("✅ Extracted jixiang items:", jixiang.length);

		// Extract individual 凶象 items
		const xiongxiang = xiongxiangContent
			? extractItems(xiongxiangContent, "凶象")
			: [];
		console.log("❌ Extracted xiongxiang items:", xiongxiang.length);

		// Only use fallback if we have absolutely no content
		if (jixiang.length === 0 && xiongxiang.length === 0) {
			console.log(
				"⚠️ No content extracted, checking if AI response was truncated"
			);

			// Check if the response seems truncated
			const lastChar = content.trim().slice(-1);
			const seemsTruncated = !lastChar.match(/[。！？】}]/);

			if (seemsTruncated) {
				console.log(
					"� Response seems truncated, returning error instead of fallback"
				);
				return {
					error: "AI response was truncated, please try again",
					jixiang: [],
					xiongxiang: [],
					seasonInfo: "",
					fullContent: content,
				};
			}
		}

		return {
			jixiang: jixiang.length > 0 ? jixiang : [],
			xiongxiang: xiongxiang.length > 0 ? xiongxiang : [],
			seasonInfo:
				seasonContent || "【關鍵季節】請根據個人八字具體分析關鍵時期。",
			fullContent: content,
		};
	} catch (error) {
		console.error("Content parsing error:", error);
		return {
			error: "Content parsing failed",
			jixiang: [],
			xiongxiang: [],
			seasonInfo: "",
			fullContent: content,
		};
	}
}

// New function to extract numbered items from any format
function extractNumberedItems(content) {
	const items = [];
	console.log("🔍 Extracting numbered items from content");

	// Enhanced patterns to catch various formats
	const patterns = [
		// Pattern 1: ① **title**: content format (what we're actually seeing)
		/[①②③④⑤⑥]\s*\*\*([^*]+)\*\*[：:]\s*([^①②③④⑤⑥]*?)(?=[①②③④⑤⑥]|【|$)/gs,
		// Pattern 2: ① title: content format
		/[①②③④⑤⑥]\s*([^：\n*]{2,8})[：:]\s*([^①②③④⑤⑥]*?)(?=[①②③④⑤⑥]|【|$)/gs,
		// Pattern 3: 1. **title**: content format
		/\d+[\.、]\s*\*\*([^*]+)\*\*[：:]\s*([^0-9\.].*?)(?=\d+[\.、]|【|$)/gs,
		// Pattern 4: 1. title: content format
		/\d+[\.、]\s*([^：\n]{2,8})[：:]\s*([^0-9\.].*?)(?=\d+[\.、]|【|$)/gs,
		// Pattern 5: Direct **title**: content format
		/\*\*([贵人暗助|厚积薄发|稳中得财|技能避险|根基稳固|印星护持|比劫夺财|小人妨害|决策失误|官非口舌|刑冲动荡|破财损耗|暗中得助|细水长流|稳中求进][^*]*)\*\*[：:]\s*([^*]{50,}?)(?=\*\*[贵人暗助|厚积薄发|稳中得财|技能避险|根基稳固|印星护持|比劫夺财|小人妨害|决策失误|官非口舌|刑冲动荡|破财损耗|暗中得助|细水长流|稳中求进]|【|$)/gs,
	];

	for (const pattern of patterns) {
		let match;
		console.log(
			`🔍 Trying pattern: ${pattern.toString().substring(0, 50)}...`
		);

		while ((match = pattern.exec(content)) !== null && items.length < 6) {
			const title = match[1]?.trim();
			const description = match[2]?.trim();

			console.log(
				`📝 Found match - Title: "${title}", Description length: ${description?.length}`
			);

			if (title && description && description.length > 30) {
				// Clean up title to ensure it's meaningful
				let cleanTitle = title
					.replace(/\*\*/g, "")
					.replace(/【|】/g, "")
					.trim();

				// If title is too long, try to extract 4-character phrase
				if (cleanTitle.length > 8) {
					const fourCharMatch =
						cleanTitle.match(/[\u4e00-\u9fff]{4}/);
					if (fourCharMatch) {
						cleanTitle = fourCharMatch[0];
					} else {
						cleanTitle = cleanTitle.substring(0, 4);
					}
				}

				// Clean up description
				const cleanDescription = description
					.replace(/\*\*/g, "")
					.replace(/[\r\n]+/g, " ")
					.trim();

				console.log(
					`✅ Adding item: "${cleanTitle}" - ${cleanDescription.substring(0, 100)}...`
				);

				items.push({
					title: cleanTitle,
					content: cleanDescription,
				});
			}
		}

		if (items.length >= 6) {
			console.log(
				`✅ Found enough items (${items.length}), stopping extraction`
			);
			break;
		}
	}

	console.log(`📊 Total extracted items: ${items.length}`);
	return items;
}

function extractItems(content, type) {
	const items = [];
	console.log(
		`🔍 Extracting ${type} items from content length:`,
		content.length
	);

	// First, try to extract meaningful 4-character idioms from content
	const extractMeaningfulTitles = (text) => {
		// Common 4-character feng shui and fortune-related idioms
		const fengShuiIdioms = [
			"貴人暗助",
			"厚積薄發",
			"穩中得財",
			"印星護持",
			"技能避險",
			"根基穩固",
			"財源廣進",
			"事業有成",
			"步步高升",
			"福星高照",
			"龍鳳呈祥",
			"金玉滿堂",
			"比劫奪財",
			"小人妨害",
			"決策失誤",
			"官非口舌",
			"刑沖動盪",
			"五行失衡",
			"破財損耗",
			"是非纏身",
			"競爭激烈",
			"變動頻繁",
			"壓力沉重",
			"阻礙重重",
			"暗中得助",
			"無心插柳",
			"細水長流",
			"積少成多",
			"謹慎有餘",
			"保守得益",
			"默默耕耘",
			"潛龍在淵",
			"厚德載物",
			"溫和致遠",
			"韜光養晦",
			"靜水流深",
		];

		// Look for these idioms in the text
		for (const idiom of fengShuiIdioms) {
			if (text.includes(idiom)) {
				console.log(`✅ Found idiom: ${idiom}`);
				return idiom;
			}
		}

		// If no predefined idiom found, try to extract meaningful 4-character phrases
		const phrases = text.match(/[\u4e00-\u9fff]{4}/g) || [];
		for (const phrase of phrases) {
			// Filter out meaningless phrases (starting with articles, conjunctions, etc.)
			if (
				!/^[命局中雖此在因若當的是有為但和與或者其實際上因為所以然而]./.test(
					phrase
				)
			) {
				// Check if it's a meaningful phrase by looking at common patterns
				if (
					/[助發財星技根源進成升照祥滿劫害誤非沖衡耗身爭變壓礙]/.test(
						phrase
					)
				) {
					console.log(`✅ Found meaningful phrase: ${phrase}`);
					return phrase;
				}
			}
		}

		return null;
	};

	// Generate contextual title based on content
	const generateContextualTitle = (content, index, isJixiang) => {
		const jixiangTitles = [
			"貴人暗助",
			"厚積薄發",
			"穩中得財",
			"潛力顯現",
			"保守得益",
			"謹慎有餘",
		];
		const xiongxiangTitles = [
			"比劫奪財",
			"小人妨害",
			"決策失誤",
			"阻礙重重",
			"壓力沉重",
			"謹防損失",
		];

		// Analyze content for keywords to generate appropriate title
		if (isJixiang) {
			if (content.includes("印星") || content.includes("貴人"))
				return "貴人暗助";
			if (content.includes("積累") || content.includes("細流"))
				return "厚積薄發";
			if (content.includes("保守") || content.includes("穩健"))
				return "穩中得財";
			if (content.includes("技能") || content.includes("專業"))
				return "技能避險";
			if (content.includes("根基") || content.includes("基礎"))
				return "根基穩固";
			if (content.includes("隱藏") || content.includes("無心"))
				return "暗中得助";
			return jixiangTitles[index] || "福星高照";
		} else {
			if (content.includes("比劫") || content.includes("競爭"))
				return "比劫奪財";
			if (content.includes("小人") || content.includes("妨害"))
				return "小人妨害";
			if (content.includes("決策") || content.includes("失誤"))
				return "決策失誤";
			if (content.includes("官非") || content.includes("口舌"))
				return "官非口舌";
			if (content.includes("刑沖") || content.includes("動盪"))
				return "刑沖動盪";
			if (content.includes("風險") || content.includes("虧損"))
				return "破財損耗";
			return xiongxiangTitles[index] || "阻礙重重";
		}
	};

	// If content is empty or too short, return early with contextual titles
	if (!content || content.length < 50) {
		console.log(
			`⚠️ Content too short for ${type}, using contextual titles`
		);
		for (let i = 0; i < 3; i++) {
			const title = generateContextualTitle("", i, type === "吉象");
			const fallbackContent =
				type === "吉象"
					? "此為有利因素，建議在適當時機謹慎把握，以穩健方式促進發展。"
					: "此為不利因素，需要特別注意防範相關風險，謹慎應對挑戰。";

			items.push({
				title: title,
				content: fallbackContent,
			});
		}
		return items;
	}

	// Enhanced extraction strategies
	const strategies = [
		// Strategy 1: Numbered format ①②③ or 1.2.3.
		() => {
			console.log(`🔍 Trying numbered format extraction for ${type}`);
			const patterns = [
				/[①②③]\s*([^：\n]{2,8})[：:]\s*([^①②③]{30,}?)(?=[①②③]|【|$)/gs,
				/\d+[\.、]\s*([^：\n]{2,8})[：:]\s*([^0-9]{30,}?)(?=\d+[\.、]|【|$)/gs,
			];

			for (const pattern of patterns) {
				let match;
				while (
					(match = pattern.exec(content)) !== null &&
					items.length < 3
				) {
					const rawTitle = match[1]?.trim();
					const description = match[2]?.trim();

					if (rawTitle && description) {
						console.log(`📝 Found numbered item: ${rawTitle}`);

						// First try to extract meaningful title from the raw title or description
						let title = extractMeaningfulTitles(
							rawTitle + description
						);

						// If no meaningful title found, use the raw title or generate one
						if (!title) {
							// Clean the raw title
							title = rawTitle
								.replace(/\*\*/g, "")
								.replace(/【|】/g, "")
								.trim();

							// If still not good, generate contextual title
							if (
								title.length < 2 ||
								/^[命局中雖此在因若當的是有為但和與或者其實際上因為所以然而]/.test(
									title
								)
							) {
								title = generateContextualTitle(
									description,
									items.length,
									type === "吉象"
								);
							}
						}

						items.push({
							title: title,
							content: description
								.replace(/\*\*/g, "")
								.replace(/---.*$/gs, "")
								.replace(/###.*$/gs, "")
								.trim(),
						});
					}
				}
				if (items.length >= 3) break;
			}
		},

		// Strategy 2: Direct colon format
		() => {
			if (items.length < 3) {
				console.log(`🔍 Trying colon format extraction for ${type}`);
				const colonPattern =
					/([^：\n。]{2,8})[：:]\s*([^：\n]{50,}?)(?=\n[^：\n。]{2,8}[：:]|\n\n|【|$)/gs;

				let match;
				while (
					(match = colonPattern.exec(content)) !== null &&
					items.length < 3
				) {
					const rawTitle = match[1]?.trim();
					const description = match[2]?.trim();

					if (rawTitle && description) {
						console.log(`📝 Found colon item: ${rawTitle}`);

						let title = extractMeaningfulTitles(
							rawTitle + description
						);

						if (!title) {
							title = rawTitle
								.replace(/\*\*/g, "")
								.replace(/【|】/g, "")
								.trim();
							if (
								title.length < 2 ||
								/^[命局中雖此在因若當的是有為但和與或者其實際上因為所以然而]/.test(
									title
								)
							) {
								title = generateContextualTitle(
									description,
									items.length,
									type === "吉象"
								);
							}
						}

						items.push({
							title: title,
							content: description.replace(/\*\*/g, "").trim(),
						});
					}
				}
			}
		},
	];

	// Try each strategy
	for (const strategy of strategies) {
		if (items.length < 3) {
			strategy();
		}
	}

	// If still not enough items, create fallback items with proper titles
	while (items.length < 3) {
		console.log(
			`⚠️ Creating fallback item ${items.length + 1} for ${type}`
		);
		const title = generateContextualTitle(
			"",
			items.length,
			type === "吉象"
		);
		const fallbackContent =
			type === "吉象"
				? "此為有利因素，建議在適當時機謹慎把握，以穩健方式促進發展。根據個人八字特點，此象需要耐心等待時機成熟。"
				: "此為不利因素，需要特別注意防範相關風險，謹慎應對挑戰。建議提前做好準備，化解不利影響。";

		items.push({
			title: title,
			content: fallbackContent,
		});
	}

	console.log(`✅ Final ${type} items:`, items.length);
	return items.slice(0, 3);
}

function getFallbackJixiang() {
	return [
		{
			title: "印星護持",
			content:
				"通過提升個人資質、信用、專業形象獲得保護，利於穩定收入來源。建議投資學習、考證提升競爭力，靠專業能力和口碑獲得機會。",
		},
		{
			title: "技能避險",
			content:
				"在保守前提下，依靠核心專業技能獲得相對可控的報酬，避免冒險創新。專注本職工作，穩扎穩打是最安全的策略。",
		},
		{
			title: "根基穩固",
			content:
				"若已有良好基礎，在謹慎策略下可能維持現狀。避免大幅變動和擴張行為，以守為攻，保護現有成果。",
		},
	];
}

function getFallbackXiongxiang() {
	return [
		{
			title: "比劫奪財",
			content:
				"競爭激烈導致利益受損，收入可能銳減，意外支出增加。需防範合作風險、同行競爭，以及被騙被盜的可能性。",
		},
		{
			title: "刑沖動盪",
			content:
				"流年刑沖造成不穩定因素劇增，容易出現意外變故、收入中斷、合作破裂等問題。根基動搖，需格外謹慎。",
		},
		{
			title: "五行失衡",
			content:
				"命局配置不當導致該領域問題叢生，風險投資極易虧損，任何冒險行為都可能帶來嚴重後果。",
		},
	];
}
