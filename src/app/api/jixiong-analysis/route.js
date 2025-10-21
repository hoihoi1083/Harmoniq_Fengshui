// Set API timeout to 120 seconds for this route to handle heavy server load
export const maxDuration = 120;

export async function POST(req) {
	try {
		const { userInfo } = await req.json();

		if (!userInfo) {
			return Response.json(
				{ error: "Missing user information" },
				{ status: 400 }
			);
		}

		const { concern, birthday, gender, time } = userInfo;

		// Enhanced prompt for comprehensive JiXiong analysis with 4-character titles
		const currentMonth = new Date().getMonth() + 1;
		const currentYear = new Date().getFullYear();

		const prompt = `你是專業的八字命理分析師。請用繁體中文回答，根據以下信息進行精準的吉凶分析：

用戶信息：
- 生日：${birthday}
- 性別：${gender}
- 時間：${time}
- 關注領域：${concern}
- 當前時間：${currentYear}年${currentMonth}月

**重要時間標示規則**：
1. 當前是${currentYear}年${currentMonth}月，所有建議必須針對未來時間
2. 提及未來月份時必須明確標示"明年"（如：明年2月、明年春季）
3. 使用季節詞彙時須註明具體月份範圍（如：春季指明年3-5月、夏季指6-8月）
4. 使用節氣時必須標註約略日期（如：穀雨（約4月19日）、霜降（約10月23日））
5. 使用時辰時須標註具體時間範圍（如：午時（11-13時）、子時（23-1時））

**時間標示示例**：
✅ 正確：今年霜降（10月23日）後每日飲用蜂蜜檸檬水
✅ 正確：明年穀雨（約4月19日）前後進行中醫調理
✅ 正確：夏季（6-8月）午時（11-13時）安排午休15分鐘
✅ 正確：明年春季（3-5月）是事業發展的關鍵期
❌ 錯誤：2月適合投資（應標示：明年2月適合投資）
❌ 錯誤：春季注意健康（應標示：明年春季（3-5月）注意健康）
❌ 錯誤：穀雨前後調理（應標示：明年穀雨（約4月19日）前後調理）

請按照以下格式提供 ${concern} 的吉凶分析：

【3個吉象與3個凶象】

【3個吉象（被動防護，需極致保守方能顯現）】：
請提供3個具體的吉象，每個必須包含：
- 標題（必須是有意義的四字詞語，如：貴人暗助、厚積薄發、穩中得財、暗中得助、技能避險、根基穩固）
- 詳細內容（150-200字，完整描述）

重要：標題必須是經典的四字成語或風水術語，絕對不可以是句子的前四個字！

吉象四字詞語示例：
- 貴人暗助（有長輩或專業人士的幫助）
- 厚積薄發（通過長期積累獲得收益）
- 穩中得財（保守策略下的財富增長）
- 暗中得助（意外的幫助或機會）
- 技能避險（專業技能帶來的保護）
- 根基穩固（基礎牢固，穩定發展）

格式如下：
① [有意義的四字詞語]：[詳細內容...]
② [有意義的四字詞語]：[詳細內容...]  
③ [有意義的四字詞語]：[詳細內容...]

【3個凶象（主導致命，強力影響）】：
請提供3個具體的凶象，每個必須包含：
- 標題（必須是有意義的四字詞語，如：比劫奪財、小人妨害、決策失誤、官非口舌、刑沖動盪、破財損耗）
- 詳細內容（150-200字，完整描述）

凶象四字詞語示例：
- 比劫奪財（競爭者搶奪利益）
- 小人妨害（有人從中作梗）
- 決策失誤（判斷錯誤導致損失）
- 官非口舌（法律糾紛或爭執）
- 刑沖動盪（環境變化帶來不穩定）
- 破財損耗（意外支出或投資虧損）

格式如下：
① [有意義的四字詞語]：[詳細內容...]
② [有意義的四字詞語]：[詳細內容...]
③ [有意義的四字詞語]：[詳細內容...]

【關鍵季節&注意事項】：
- 最危險的時期（必須標示具體月份和年份，如：明年3-5月、今年11-12月）
- 相對安全的時期（必須標示具體月份和年份）
- 具體的預防措施（若提及時間點，必須明確標註）

嚴格要求：
1. 基於真實的八字分析，${concern === "工作" ? "請按事業運勢分析" : ""}
2. 針對 ${concern} 領域提供專業且具體的建議
3. 每個標題必須是有意義的四字詞語，絕對不可以是文章前四個字！
4. 標題必須是成語、專業術語或有完整意義的詞組
5. 語言要專業但易懂，避免過於深奧的術語
6. 總字數控制在800-1000字內
7. **所有時間建議必須針對未來，當前是${currentMonth}月，請只提供${currentMonth}月之後的時間建議**
8. **使用月份時必須標示"今年"或"明年"，使用季節必須標註月份範圍，使用節氣必須標註日期**

請務必確保每個標題都是完整有意義的四字詞語，而不是句子片段！
請務必確保所有時間相關的建議都清楚標示是今年還是明年，並包含具體月份或日期！`;

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
