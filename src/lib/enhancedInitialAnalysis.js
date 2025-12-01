/**
 * 🔮 新版初始分析生成器 (集成DeepSeek AI)
 *
 * 根據用戶要求重新設計初始分析結構：
 * 1. 命盤速讀 (基礎計算)
 * 2. 年度預警 (AI生成)
 * 3. 你的運勢分析 (AI生成)
 * 4. 簡單的事業風水建議 (AI生成)
 * 5. 針對具體問題的建議 (AI生成)
 */

import { BaziCalculator } from "./baziCalculator.js";
import { getTranslation } from "./chatTranslations.js"; // 🌐 Add translation support

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export class EnhancedInitialAnalysis {
	// ==========================================
	// 🤖 DeepSeek AI 調用方法
	// ==========================================

	static async callDeepSeekAPI(messages, options = {}) {
		try {
			// Add AbortController for timeout control
			const controller = new AbortController();
			const timeoutId = setTimeout(() => {
				controller.abort();
				console.log("⏰ DeepSeek API call timed out after 35 seconds");
			}, 35000); // 35 second timeout (less than frontend's 45s)

			const response = await fetch(DEEPSEEK_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: messages,
					max_tokens: options.maxTokens || 800,
					temperature: options.temperature || 0.7,
					stream: false,
				}),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(
					`DeepSeek API error: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();
			return data.choices?.[0]?.message?.content || "";
		} catch (error) {
			if (error.name === "AbortError") {
				console.error("DeepSeek API call aborted due to timeout");
			} else {
				console.error("DeepSeek API call failed:", error);
			}
			return null;
		}
	}

	// ==========================================
	// 🎯 主要分析生成方法 (集成AI)
	// ==========================================

	static async generateWorkAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			"事業",
			specificQuestion,
			locale
		);
	}

	static async generateFinanceAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			"財運",
			specificQuestion,
			locale
		);
	}

	static async generateHealthAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			"健康",
			specificQuestion,
			locale
		);
	}

	static async generateRelationshipAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			"人際關係",
			specificQuestion,
			locale
		);
	}

	static async generateChildrenAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			"子女",
			specificQuestion,
			locale
		);
	}

	static async generateFateAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			locale === "zh-CN" ? "命理" : "命理",
			specificQuestion,
			locale
		);
	}

	static async generateLoveAnalysis(
		birthday,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		return await this.generatePersonalAnalysis(
			birthday,
			"感情",
			specificQuestion,
			locale
		);
	}

	// ==========================================
	// � 生肖計算函數
	// ==========================================
	static getChineseZodiac(year) {
		const zodiacAnimals = [
			"鼠",
			"牛",
			"虎",
			"兔",
			"龍",
			"蛇",
			"馬",
			"羊",
			"猴",
			"雞",
			"狗",
			"豬",
		];
		// 1900年是鼠年，所以(year - 1900) % 12 可以計算生肖
		const index = (year - 1900) % 12;
		return zodiacAnimals[index];
	}

	// ==========================================
	// �💑 合盤配對分析 (特殊結構)
	// ==========================================

	static async generateCoupleAnalysis(
		birthday1,
		birthday2,
		specificQuestion = "",
		region = "hongkong",
		userGender = "female",
		partnerGender = "unknown",
		locale = "zh-TW"
	) {
		const year1 = birthday1.getFullYear();
		const year2 = birthday2.getFullYear();
		const month1 = birthday1.getMonth() + 1;
		const month2 = birthday2.getMonth() + 1;
		const day1 = birthday1.getDate();
		const day2 = birthday2.getDate();

		// 計算兩人的八字和五行
		const bazi1 = this.calculateBazi(birthday1);
		const bazi2 = this.calculateBazi(birthday2);
		const element1 = this.calculateElement(year1);
		const element2 = this.calculateElement(year2);
		const zodiacAnimal1 = this.getChineseZodiac(year1);
		const zodiacAnimal2 = this.getChineseZodiac(year2);

		// 根據實際性別確定顯示標籤
		let userLabel, partnerLabel;
		if (userGender === "female") {
			userLabel = locale === "zh-CN" ? "👩 您（女方）" : "👩 您（女方）";
		} else if (userGender === "male") {
			userLabel = locale === "zh-CN" ? "👨 您（男方）" : "👨 您（男方）";
		} else {
			userLabel = locale === "zh-CN" ? "👤 您" : "👤 您";
		}

		if (partnerGender === "male") {
			partnerLabel =
				locale === "zh-CN" ? "👨 对方（男方）" : "👨 對方（男方）";
		} else if (partnerGender === "female") {
			partnerLabel =
				locale === "zh-CN" ? "👩 对方（女方）" : "👩 對方（女方）";
		} else {
			partnerLabel = locale === "zh-CN" ? "👤 对方" : "👤 對方";
		}

		// 1. 雙方基礎分析（類似個人分析的基礎部分）
		const basicAnalysis =
			locale === "zh-CN"
				? `📊 你们的命理基础分析\n小铃以下分析是基于年月日(欠时)\n\n${userLabel}：${year1}年${month1}月${day1}日，生肖属相：${zodiacAnimal1}\n${partnerLabel}：${year2}年${month2}月${day2}日，生肖属相：${zodiacAnimal2}\n配对类型：${this.getCoupleType(element1, element2)}\n缘分指数：${this.getCompatibilityScore(element1, element2)}%`
				: `📊 你們的命理基礎分析\n小鈴以下分析是基於年月日(欠時)\n\n${userLabel}：${year1}年${month1}月${day1}日，生肖屬相：${zodiacAnimal1}\n${partnerLabel}：${year2}年${month2}月${day2}日，生肖屬相：${zodiacAnimal2}\n配對類型：${this.getCoupleType(element1, element2)}\n緣分指數：${this.getCompatibilityScore(element1, element2)}%`;
		// 2. 針對具體問題回應 - 合盤分析不需要單獨的問題回應區段
		let problemResponse = "";

		// 3. 配對分析 - AI生成的主要配對分析內容
		let compatibilityAnalysis = "";
		try {
			const aiAnalysis = await this.generateCoupleAIAnalysis(
				birthday1,
				birthday2,
				element1,
				element2,
				specificQuestion,
				locale,
				userGender,
				partnerGender
			);

			if (aiAnalysis) {
				compatibilityAnalysis = aiAnalysis;
			} else {
				// AI失敗時使用備用模板
				compatibilityAnalysis = this.getFallbackCoupleAnalysis(
					element1,
					element2,
					specificQuestion
				);
			}
		} catch (error) {
			console.error("AI generation failed:", error);
			compatibilityAnalysis = this.getFallbackCoupleAnalysis(
				element1,
				element2,
				specificQuestion
			);
		}

		// 4. 實用解決方案 - 添加實際內容
		const practicalSolutions =
			locale === "zh-CN"
				? `🔧 实用解决方案\n1. 优先建议 - 根据你们双方的五行特质，建议在居家布置上加强五行平衡：${element1}命者可在个人空间增加对应元素装饰，${element2}命者则适合调整房间布局增进相容性。\n\n2. 时机掌握- 每月農曆初一、十五是感情能量最旺的时期，适合进行深度沟通或规划未来。\n\n3. 日常互动 - 善用各自的五行优势，${element1}命的稳定特质搭配${element2}命的活力，形成互补的相处模式。`
				: `🔧 實用解決方案\n1. 優先建議 - 根據你們雙方的五行特質，建議在居家佈置上加強五行平衡：${element1}命者可在個人空間增加對應元素裝飾，${element2}命者則適合調整房間佈局增進相容性。\n\n2. 時機掌握- 每月農曆初一、十五是感情能量最旺的時期，適合進行深度溝通或規劃未來。\n\n3. 日常互動 - 善用各自的五行優勢，${element1}命的穩定特質搭配${element2}命的活力，形成互補的相處模式。`; // 5. 專屬感情解析 - 提供具體的感情建議
		const exclusiveInsights =
			locale === "zh-CN"
				? `✨ 专属感情解析\n根据你们${element1}命和${element2}命的配对特质，以下是专属的感情发展建议：\n\n🌸 感情发展阶段建议\n• 初期相处：着重建立信任基础，${element1}命宜展现包容，${element2}命可主动分享\n• 深化关系：利用双方五行互补优势，在生活细节中体现相互支持\n• 长期规划：结合各自的命理特质，制定共同目标和成长方向\n\n🎯 最佳互动时机\n每月農曆初一、十五感情能量最旺，适合深度沟通。${month1}月和${month2}月出生的你们，在对方生日月份前后特别容易产生共鸣。\n\n✨ 进阶指引说明\n以上分析仅基于年月框架，若要精准锁定：\n- 双方个人桃花宫位与最佳方位\n- 2025-2026具体感情发展时间点\n- 专属你们的相处节奏与沟通策略\n需提供完整出生时辰（几点几分），透过八字排盘解析「夫妻宫格局」与「大运流年」的互动，才能制定个人化感情发展策略。小铃可为你们制作专属合盤报告，助你们掌握感情升温的关键契机点。`
				: `✨ 專屬感情解析\n根據你們${element1}命和${element2}命的配對特質，以下是專屬的感情發展建議：\n\n🌸 感情發展階段建議\n• 初期相處：著重建立信任基礎，${element1}命宜展現包容，${element2}命可主動分享\n• 深化關係：利用雙方五行互補優勢，在生活細節中體現相互支持\n• 長期規劃：結合各自的命理特質，制定共同目標和成長方向\n\n🎯 最佳互動時機\n每月農曆初一、十五感情能量最旺，適合深度溝通。${month1}月和${month2}月出生的你們，在對方生日月份前後特別容易產生共鳴。\n\n✨ 進階指引說明\n以上分析僅基於年月框架，若要精準鎖定：\n- 雙方個人桃花宮位與最佳方位\n- 2025-2026具體感情發展時間點\n- 專屬你們的相處節奏與溝通策略\n需提供完整出生時辰（幾點幾分），透過八字排盤解析「夫妻宮格局」與「大運流年」的互動，才能制定個人化感情發展策略。小鈴可為你們製作專屬合盤報告，助你們掌握感情升溫的關鍵契機點。`; // 6. 合盤報告推薦
		const reportRecommendation = this.getCoupleReportRecommendations(
			region,
			locale
		);

		return {
			basicAnalysis,
			problemResponse,
			compatibilityAnalysis,
			practicalSolutions,
			exclusiveInsights,
			reportRecommendation,
		};
	}

	// ==========================================
	// 🎯 通用個人分析方法
	// ==========================================

	static async generatePersonalAnalysis(
		birthday,
		category,
		specificQuestion = "",
		locale = "zh-TW"
	) {
		// Map 工作 to 事業 for display consistency
		if (category === "工作") category = "事業";

		const year = birthday.getFullYear();
		const month = birthday.getMonth() + 1;
		const day = birthday.getDate();

		// 計算八字和五行
		const bazi = this.calculateBazi(birthday);
		const element = this.calculateElement(year);
		const elementStrength = BaziCalculator.analyzeElementStrength(
			bazi.yearElement,
			bazi.dayElement
		);

		let response =
			locale === "zh-CN"
				? `🔮 根据你的生日分析，小铃为你解读${category}方面的运势和解决方案：\n\n`
				: `🔮 根據你的生日分析，小鈴為你解讀${category}方面的運勢和解決方案：\n\n`;

		// 1. 基礎分析（不提及五行和八字，因為缺少時辰可能不準確）
		const zodiacAnimal = this.getChineseZodiac(year);
		response +=
			locale === "zh-CN"
				? `📊 你的命理基础分析\n小铃以下分析是基于年月日(欠时)\n\n`
				: `📊 你的命理基礎分析\n小鈴以下分析是基於年月日(欠時)\n\n`;
		response += `出生日期：${year}年${birthday.getMonth() + 1}月${birthday.getDate()}日\n`;
		response +=
			locale === "zh-CN"
				? `生肖属相：${zodiacAnimal}\n\n`
				: `生肖屬相：${zodiacAnimal}\n\n`;

		// 2. AI處理所有詳細分析，不再需要基礎分析重複

		// 3. 基於八字的實用解決方案 (主要部分)
		try {
			const practicalSolutions = await this.generatePracticalSolutions(
				bazi,
				element,
				category,
				specificQuestion,
				birthday,
				locale // 🌐 Pass locale to AI generation
			);

			if (practicalSolutions) {
				response += practicalSolutions;
			} else {
				// AI失敗時使用備用解決方案
				response += this.getFallbackSolutions(
					element,
					category,
					specificQuestion
				);
			}
		} catch (error) {
			console.error("實用解決方案生成失敗:", error);
			response += this.getFallbackSolutions(
				element,
				category,
				specificQuestion
			);
		}

		return response;
	}

	// ==========================================
	// 🤖 AI生成個人化分析
	// ==========================================

	static async generatePersonalAIAnalysis(
		birthday,
		element,
		category,
		specificQuestion
	) {
		const year = birthday.getFullYear();
		const month = birthday.getMonth() + 1;
		const day = birthday.getDate();
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;
		const currentDay = new Date().getDate();
		const age = currentYear - year;

		// 🌙 Calculate ACTUAL lunar calendar date for today
		let currentLunarMonth = "十月"; // Default fallback
		try {
			const lunisolarModule = require("lunisolar");
			const lunisolar = lunisolarModule.default || lunisolarModule;
			const { takeSound } = require("@lunisolar/plugin-takesound");
			const { char8ex } = require("@lunisolar/plugin-char8ex");
			lunisolar.extend(takeSound).extend(char8ex);

			const today = lunisolar(
				`${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay.toString().padStart(2, "0")}`
			);
			const lunarMonthNum = today.lunar.month;
			const lunarMonthNames = [
				"正月",
				"二月",
				"三月",
				"四月",
				"五月",
				"六月",
				"七月",
				"八月",
				"九月",
				"十月",
				"十一月",
				"十二月",
			];
			currentLunarMonth = lunarMonthNames[lunarMonthNum - 1] || "十月";
		} catch (error) {
			console.error("❌ Failed to calculate lunar calendar:", error);
		}

		const categoryConfig = this.getCategoryConfig(category);

		const prompt = `你是專業的風水師「小鈴」，請根據以下信息生成個人化的${category}分析：

用戶信息：
- 出生日期：${year}年${month}月${day}日（西曆/公曆日期）
- 五行屬性：${element}命
- 當前年齡：${age}歲
- 當前時間：${currentYear}年${currentMonth}月${currentDay}日
- 具體問題：${specificQuestion || "無特定問題"}

⚠️ 重要提醒：
- 用戶生日是西曆日期（公曆），請據此進行命理分析
- 當前時間是${currentYear}年${currentMonth}月，請基於${currentYear}年時間軸進行分析
- 🚫 嚴格禁止：農曆、陰曆、農曆十月、農曆九月、亥月、子月、寅月等任何農曆相關詞彙
- ✅ 正確表達：10月出生、9月出生、秋季出生、冬季出生
- 不要提及${currentYear - 1}年或更早的年份

請生成以下三個部分的內容，要求個人化、具體、實用：

2. 年度預警
根據${element}命在${currentYear}年的${category}運勢，並結合出生日期${year}年${month}月${day}日的特質，提供：
- 成就星：${categoryConfig.achievementGuide}
- 小人煞：${categoryConfig.obstacleGuide}

3. ${categoryConfig.analysisTitle}
根據${element}命特質和完整出生日期${year}年${month}月${day}日，分析用戶最近${category}狀況和未來3-6個月趨勢，要具體描述：
- ${categoryConfig.recentSituation}
- ${categoryConfig.futureTrend}
- ${categoryConfig.personalAdvantage}

4. ${categoryConfig.adviceTitle}
根據${element}命提供3個具體可行的${category}建議：
- ${categoryConfig.advicePoint1}
- ${categoryConfig.advicePoint2}
- ${categoryConfig.advicePoint3}

5. 💡 專屬問題解析
${
	specificQuestion
		? `針對你的具體問題「${specificQuestion}」，根據${element}命特質提供：
- 問題核心分析（為什麼會遇到這個問題）
- 初步解決方向（2-3個可行建議）
- 🎯關鍵時機：${element}命最適合在【當前月份】開始行動
- 小鈴溫馨提醒：想要詳細的解決步驟、專屬時辰表和風水佈局圖嗎？解鎖詳細報告，讓問題迎刃而解！✨`
		: `根據你目前的${category}狀況，小鈴發現：
- 一個即將到來的重要轉機（與${element}命特質相關）
- 需要在【未來2個月】特別把握的關鍵時期
- ⚡機會窗口：錯過這次要等下個季度
- 小鈴溫馨提醒：想知道具體日期、詳細行動計劃和專屬風水佈局嗎？解鎖詳細報告，把握最佳時機！✨`
}

要求：
1. 使用小鈴可愛親切的語調
2. 內容要具體實用，不要空泛
3. 根據五行特質和完整出生日期（${year}年${month}月${day}日）進行個人化分析
4. 考慮當前時間因素
5. 每部分控制在2-3行內
6. 使用emoji增加親和力
7. Point 5要讓用戶感受到價值但留有懸念，引導解鎖詳細報告`;

		const messages = [
			{
				role: "system",
				content: `你是小鈴，一個專業但親切可愛的風水師。你的回答要專業、個人化，同時保持輕鬆友好的語調。

當前日期：${currentYear}年${currentMonth}月${currentDay}日（今天是2025年11月20日）
當前月份：${currentMonth}月（新歷${currentMonth}月）
當前農曆：農曆${currentLunarMonth}（今天是農曆${currentLunarMonth}初一，不是農曆九月）
當前生肖年：2025年是乙巳蛇年（Snake Year），不是馬年

🚫 嚴格禁止規則 - 絕對不可違反：
1. 如果提到農曆，今天的農曆月份是「農曆${currentLunarMonth}」，絕對不可說「農曆九月」
2. 禁止使用農曆日期表達，如：初一、初七、十五、廿三等（改用：每月1日、7日、15日、23日）
3. 禁止使用農曆月份地支，如：亥月、子月、寅月等
4. 當提到「當令」「流月」「當前流月」時，必須使用新歷月份（如：${currentMonth}月）

✅ 正確用法示範：
- 當前流月（${currentMonth}月）正值戊土當令
- 建議在${currentMonth}月特別注意
- 9月出生的人、10月出生的人
- 每月7日、每月15日（不要說初七、十五）

其他重要指示：
1. 用戶提供的生日是西曆日期（公曆），請據此分析
2. 所有時間相關回應必須基於當前日期${currentYear}年${currentMonth}月${currentDay}日
3. 不可提及${currentYear - 1}年或過去年份`,
			},
			{
				role: "user",
				content: prompt,
			},
		];

		const aiResponse = await this.callDeepSeekAPI(messages, {
			maxTokens: 1400,
			temperature: 0.8,
		});

		return aiResponse;
	}

	static async generateCoupleAIAnalysis(
		birthday1,
		birthday2,
		element1,
		element2,
		specificQuestion,
		locale = "zh-TW",
		userGender = "female",
		partnerGender = "male"
	) {
		const year1 = birthday1.getFullYear();
		const year2 = birthday2.getFullYear();
		const month1 = birthday1.getMonth() + 1;
		const month2 = birthday2.getMonth() + 1;
		const day1 = birthday1.getDate();
		const day2 = birthday2.getDate();
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;
		const currentDay = new Date().getDate();
		const age1 = currentYear - year1;
		const age2 = currentYear - year2;

		// 🌙 Calculate ACTUAL lunar calendar date for today
		let currentLunarMonth = "十月";
		try {
			const lunisolarModule = require("lunisolar");
			const lunisolar = lunisolarModule.default || lunisolarModule;
			const { takeSound } = require("@lunisolar/plugin-takesound");
			const { char8ex } = require("@lunisolar/plugin-char8ex");
			lunisolar.extend(takeSound).extend(char8ex);

			const today = lunisolar(
				`${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay.toString().padStart(2, "0")}`
			);
			currentLunarMonth =
				[
					"正月",
					"二月",
					"三月",
					"四月",
					"五月",
					"六月",
					"七月",
					"八月",
					"九月",
					"十月",
					"十一月",
					"十二月",
				][today.lunar.month - 1] || "十月";
		} catch (error) {
			console.error("❌ Failed to calculate lunar calendar:", error);
		}

		const languageInstruction =
			locale === "zh-CN"
				? "必須使用簡體中文回應，絕對不可使用繁體中文！"
				: "必須使用繁體中文回應，絕對不可使用簡體中文！";

		// 根據實際性別確定標籤
		const userGenderLabel =
			userGender === "male"
				? "男方"
				: userGender === "female"
					? "女方"
					: "用戶";
		const partnerGenderLabel =
			partnerGender === "male"
				? "男方"
				: partnerGender === "female"
					? "女方"
					: "對方";

		const prompt = `你是專業的風水師「小鈴」，請根據以下信息生成個人化的合盤配對分析：

重要語言要求：${languageInstruction}

雙方信息：
- ${userGenderLabel}：${year1}年${month1}月${day1}日，${element1}命，${age1}歲
- ${partnerGenderLabel}：${year2}年${month2}月${day2}日，${element2}命，${age2}歲
- 當前時間：${currentYear}年${currentMonth}月
- 具體問題：${specificQuestion || "無特定問題"}

重要：請優先針對用戶的具體問題「${specificQuestion}」進行直接回應和提供相關建議！

請生成配對分析的內容，要求個人化、具體、實用：

🎯 配對分析
根據${element1}命和${element2}命的配對特質，詳細分析你們在感情方面的特質和運勢，內容包括：
- 結合雙方生肖和出生季節的性格特質分析
- 你們的相處狀況和互動模式評估  
- 未來3-6個月的感情發展趨勢
- 雙方性格優勢如何互補和需要注意的磨合點

重要要求：
- 不要包含任何評分或分數（如85/100、星星評分等），因為基礎分析已有緣分指數
- 不要說「親愛的，小鈴特別想告訴你」這類開頭語
- 不要提及「悄悄話：因為缺少具體出生時辰」這類內容
- 專注於配對分析的實質內容，語調親切但不過於親暱

${
	specificQuestion &&
	!specificQuestion.includes("選擇:") &&
	!specificQuestion.includes("選項")
		? `針對你們的具體問題： 請特別關注用戶的問題「${specificQuestion}」，在配對分析中提供相關的命理見解和建議。`
		: `請重點分析雙方的配對契合度和感情發展潛力。`
}

要求：
- ${languageInstruction}
- 內容適中，約500-700字即可
- 語言要親切專業，像小鈴在一對一指導
- 重點強調需要完整出生時辰才能提供更精確分析
- 🚫 絕對不可使用 ** 或其他markdown格式標記（如 ## 或 --），請使用純文字和emoji`;

		const messages = [
			{
				role: "system",
				content: `你是小鈴，一個專業但親切可愛的風水師。你的回答要專業、個人化，同時保持輕鬆友好的語調。

當前日期：${currentYear}年${currentMonth}月${currentDay}日（今天是2025年11月20日）
當前月份：${currentMonth}月（新歷${currentMonth}月）
當前農曆：農曆${currentLunarMonth}（今天是農曆${currentLunarMonth}，不是農曆九月）

🚫 嚴格禁止規則 - 絕對不可違反：
1. 如果提到農曆，今天的農曆月份是「農曆${currentLunarMonth}」，絕對不可說「農曆九月」
2. 禁止使用農曆日期表達，如：初一、初七、十五（改用：每月1日、7日、15日）
3. 當提到「當令」「流月」「當前流月」時，必須使用新歷月份（如：${currentMonth}月）
4. 絕對不可使用任何markdown格式標記（** ## -- 等），只能使用純文字和emoji

✅ 正確用法：
- 當前流月（${currentMonth}月）正值戊土當令
- 每月7日、15日適合溝通（不要說初七、十五）
- 9月出生、10月出生`,
			},
			{
				role: "user",
				content: prompt,
			},
		];

		const aiResponse = await this.callDeepSeekAPI(messages, {
			maxTokens: 1500,
			temperature: 0.8,
		});

		return aiResponse;
	}

	// ==========================================
	// � 分類配置方法
	// ==========================================

	static getCategoryConfig(category) {
		const configs = {
			事業: {
				emoji: "💼",
				palace: "事業宮主星",
				analysisTitle: "你的事業運勢分析",
				adviceTitle: "簡單的事業風水建議",
				achievementGuide:
					"具體的突破領域和時機（例如：將星：X季主導專案）",
				obstacleGuide:
					"具體的防範對象和建議（例如：指背：遠離[生肖]同事）",
				recentSituation: "最近可能遇到的事業情況",
				futureTrend: "未來幾個月的發展機會",
				personalAdvantage: "個人優勢和需要注意的地方",
				advicePoint1: "辦公環境佈置",
				advicePoint2: "座位方向選擇",
				advicePoint3: "穿著配色建議",
			},
			財運: {
				emoji: "💰",
				palace: "財帛宮主星",
				analysisTitle: "你的財運分析",
				adviceTitle: "簡單的招財風水建議",
				achievementGuide:
					"具體的財運突破期和投資時機（例如：天財星：X季投資機會）",
				obstacleGuide:
					"具體的破財防範和理財建議（例如：劫財煞：避免[類型]投資）",
				recentSituation: "最近的財務狀況和收入變化",
				futureTrend: "未來幾個月的財運機會",
				personalAdvantage: "理財優勢和需要注意的地方",
				advicePoint1: "居家財位佈置",
				advicePoint2: "錢包和配件選擇",
				advicePoint3: "投資理財時機",
			},
			健康: {
				emoji: "🌿",
				palace: "疾厄宮主星",
				analysisTitle: "你的健康運勢分析",
				adviceTitle: "簡單的養生風水建議",
				achievementGuide:
					"具體的健康提升期和調養時機（例如：藥師星：X季養生期）",
				obstacleGuide:
					"具體的健康注意事項和預防建議（例如：病符：注意[部位]保養）",
				recentSituation: "最近的身體狀況和能量變化",
				futureTrend: "未來幾個月的健康趨勢",
				personalAdvantage: "體質優勢和需要注意的地方",
				advicePoint1: "居家環境佈置",
				advicePoint2: "飲食和作息調整",
				advicePoint3: "運動和養生方式",
			},
			人際關係: {
				emoji: "🤝",
				palace: "交友宮主星",
				analysisTitle: "你的人際運勢分析",
				adviceTitle: "簡單的人際風水建議",
				achievementGuide:
					"具體的人脈擴展期和社交時機（例如：天德星：X季貴人運）",
				obstacleGuide:
					"具體的人際防範和溝通建議（例如：口舌煞：避免與[類型]人衝突）",
				recentSituation: "最近的人際互動和關係變化",
				futureTrend: "未來幾個月的社交機會",
				personalAdvantage: "社交優勢和需要注意的地方",
				advicePoint1: "社交場合佈置",
				advicePoint2: "溝通方式和態度",
				advicePoint3: "穿著和配飾建議",
			},
			子女: {
				emoji: "👶",
				palace: "子女宮主星",
				analysisTitle: "你的子女運勢分析",
				adviceTitle: "簡單的子女風水建議",
				achievementGuide:
					"具體的子女緣分和教育時機（例如：天喜星：X季懷孕機會）",
				obstacleGuide:
					"具體的子女教養和健康注意（例如：刑沖：注意[年齡]階段）",
				recentSituation: "最近與子女的相處和教育狀況",
				futureTrend: "未來幾個月的親子關係發展",
				personalAdvantage: "教養優勢和需要注意的地方",
				advicePoint1: "兒童房間佈置",
				advicePoint2: "親子互動方式",
				advicePoint3: "教育和成長環境",
			},
			因緣: {
				emoji: "🔮",
				palace: "遷移宮主星",
				analysisTitle: "你的因緣運勢分析",
				adviceTitle: "簡單的因緣風水建議",
				achievementGuide:
					"具體的機會出現和貴人時機（例如：天乙星：X季貴人相助）",
				obstacleGuide:
					"具體的阻礙化解和因緣建議（例如：孤辰：主動參與[活動]）",
				recentSituation: "最近的機會和人際因緣變化",
				futureTrend: "未來幾個月的因緣發展",
				personalAdvantage: "因緣優勢和需要注意的地方",
				advicePoint1: "居家氣場佈置",
				advicePoint2: "社交活動參與",
				advicePoint3: "心態和行為調整",
			},
			感情: {
				emoji: "💕",
				palace: "夫妻宮主星",
				analysisTitle: "你的感情運勢分析",
				adviceTitle: "簡單的感情風水建議",
				achievementGuide:
					"具體的桃花期和戀愛時機（例如：紅鸞星：X季桃花運）",
				obstacleGuide:
					"具體的感情阻礙和化解建議（例如：孤鸞：多參與[類型]活動）",
				recentSituation: "最近的感情狀況和情感變化",
				futureTrend: "未來幾個月的感情發展",
				personalAdvantage: "感情優勢和需要注意的地方",
				advicePoint1: "居家桃花位佈置",
				advicePoint2: "約會和相處方式",
				advicePoint3: "穿著和魅力提升",
			},
		};

		return configs[category] || configs["事業"];
	}

	static getPalaceStar(element, category) {
		if (category === "事業") {
			return this.getCareerStar(element);
		}

		const palaceStars = {
			財運: {
				金: "武曲星（正財穩健）",
				木: "天機星（偏財機智）",
				水: "太陰星（理財智慧）",
				火: "太陽星（財運亨通）",
				土: "天府星（聚財有方）",
			},
			健康: {
				金: "太白星（肺金強健）",
				木: "歲德星（肝木調和）",
				水: "北斗星（腎水充足）",
				火: "南極星（心火旺盛）",
				土: "中宮星（脾土和順）",
			},
			人際關係: {
				金: "天德星（正義人緣）",
				木: "文昌星（智慧交友）",
				水: "天乙星（貴人相助）",
				火: "福德星（熱情魅力）",
				土: "天梁星（穩重可靠）",
			},
			子女: {
				金: "天喜星（子女緣深）",
				木: "文曲星（教育有方）",
				水: "天姚星（親子和諧）",
				火: "紅鸞星（子女活潑）",
				土: "天倉星（養育豐厚）",
			},
			因緣: {
				金: "天乙貴人（高貴因緣）",
				木: "月德貴人（智慧因緣）",
				水: "太極貴人（神秘因緣）",
				火: "天德貴人（光明因緣）",
				土: "福德貴人（福氣因緣）",
			},
			感情: {
				金: "紅鸞星（正緣桃花）",
				木: "天喜星（成長之愛）",
				水: "咸池星（浪漫情緣）",
				火: "天姚星（熱情如火）",
				土: "天倉星（穩定長久）",
			},
		};

		return palaceStars[category]?.[element] || "紫微星";
	}

	// ==========================================
	// 💑 合盤配對相關方法
	// ==========================================

	static getCoupleType(element1, element2) {
		const combinations = {
			金水: "金水相生，智慧財富",
			水金: "金水相生，智慧財富",
			水木: "水木相生，成長滋養",
			木水: "水木相生，成長滋養",
			木火: "木火相生，熱情創意",
			火木: "木火相生，熱情創意",
			火土: "火土相生，溫暖穩定",
			土火: "火土相生，溫暖穩定",
			土金: "土金相生，踏實富足",
			金土: "土金相生，踏實富足",
			金金: "同氣連枝，理性默契",
			木木: "雙木並茂，共同成長",
			水水: "水乳交融，心靈相通",
			火火: "雙火燎原，激情四射",
			土土: "厚德載物，穩如泰山",
		};

		const key = element1 + element2;
		return (
			combinations[key] ||
			combinations[element2 + element1] ||
			"特殊配對，需要磨合"
		);
	}

	static getCompatibilityScore(element1, element2) {
		const scores = {
			// 相生關係 (85-95分)
			金水: 92,
			水金: 92,
			水木: 88,
			木水: 88,
			木火: 90,
			火木: 90,
			火土: 87,
			土火: 87,
			土金: 89,
			金土: 89,

			// 同類關係 (75-85分)
			金金: 82,
			木木: 78,
			水水: 85,
			火火: 75,
			土土: 80,

			// 相剋關係 (60-75分)
			金木: 65,
			木金: 65,
			木土: 68,
			土木: 68,
			土水: 62,
			水土: 62,
			水火: 70,
			火水: 70,
			火金: 67,
			金火: 67,
		};

		const key = element1 + element2;
		return scores[key] || scores[element2 + element1] || 70;
	}

	static getCompatibilityAnalysis(element1, element2) {
		const compatibility = this.getCompatibilityScore(element1, element2);

		if (compatibility >= 85) {
			return {
				interaction: "五行相生，能量互補增強 ✨",
				personality: "性格特質高度契合，相處融洽",
				advice: "保持現有互動模式，適度給彼此空間",
			};
		} else if (compatibility >= 75) {
			return {
				interaction: "五行同類，理解默契度高 🤝",
				personality: "思維模式相似，容易產生共鳴",
				advice: "適時增加新鮮感，避免過於平淡",
			};
		} else {
			return {
				interaction: "五行相剋，需要磨合調和 ⚖️",
				personality: "性格差異較大，但可以互補成長",
				advice: "多溝通理解，學會欣賞彼此不同特質",
			};
		}
	}

	// ==========================================
	// 🔄 備用分析方法 (AI失敗時使用)
	// ==========================================

	static getFallbackPersonalAnalysis(element, category, specificQuestion) {
		let response = "";
		const categoryConfig = this.getCategoryConfig(category);

		// 2. 年度預警 (簡化版)
		response += `2. 年度預警\n`;
		const yearlyForecast = this.getYearlyForecast(
			element,
			new Date().getFullYear(),
			category
		);
		response += `   - 成就星：${yearlyForecast.achievement}\n`;
		response += `   - 小人煞：${yearlyForecast.obstacle}\n\n`;

		// 3. 運勢分析 (簡化版)
		response += `3. ${categoryConfig.analysisTitle}\n`;
		response +=
			this.getCategoryFortune(
				element,
				category,
				new Date().getFullYear(),
				new Date().getMonth() + 1
			) + `\n\n`;

		// 4. 風水建議 (簡化版)
		response += `4. ${categoryConfig.adviceTitle}\n`;
		const fengShuiAdvice = this.getCategoryFengShuiAdvice(
			element,
			category
		);
		fengShuiAdvice.forEach((advice) => {
			response += `• ${advice}\n`;
		});
		response += `\n`;

		// 5. 專屬問題解析 (簡化版)
		response += `5. 💡 專屬問題解析\n`;
		if (specificQuestion) {
			response += `針對你的具體問題「${specificQuestion}」：\n`;
			response += `• 問題核心：${this.getSpecificCategoryAdvice(element, category, specificQuestion)}\n`;
			response += `• 初步建議：${this.getBasicSolution(element, category)}\n`;
			response += `• 🎯關鍵時機：${element}命最適合在當前時期採取行動\n`;
			response += `• 小鈴溫馨提醒：想要詳細行動計劃、專屬時辰表和風水佈局圖嗎？解鎖詳細報告，問題迎刃而解！✨\n`;
		} else {
			response += `根據你的${category}狀況，小鈴發現：\n`;
			response += `• 關鍵機會：${this.getOpportunityHint(element, category)}\n`;
			response += `• 注意事項：${this.getCautionHint(element, category)}\n`;
			response += `• ⚡機會窗口：錯過當前時期要等下個季度\n`;
			response += `• 小鈴溫馨提醒：想知道具體時間安排和專屬指導方案嗎？解鎖詳細報告，把握最佳時機！✨\n`;
		}

		response += `\n`;
		return response;
	}

	static getFallbackCoupleAnalysis(element1, element2, specificQuestion) {
		let response = "";

		// 3. 配對分析 (簡化版)
		response += `3. 配對分析\n`;
		response += this.getCoupleAnalysisDetail(element1, element2) + `\n\n`;

		// 4. 感情風水建議 (簡化版)
		response += `4. 簡單的感情風水建議\n`;
		const coupleAdvice = this.getCoupleFengShuiAdvice(element1, element2);
		coupleAdvice.forEach((advice) => {
			response += `• ${advice}\n`;
		});
		response += `\n`;

		// 5. 專屬感情解析 (簡化版)
		response += `5. 💕 專屬感情解析\n`;
		if (specificQuestion) {
			response += `針對你們的具體問題「${specificQuestion}」：\n`;
			response += `• 問題分析：${this.getSpecificCoupleAdvice(element1, element2, specificQuestion)}\n`;
			response += `• 改善方向：${this.getCoupleImprovementHint(element1, element2)}\n`;
			response += `• 💒重要時機：你們最適合在當前季節深化關係\n`;
			response += `• 小鈴溫馨提醒：想要詳細改善計劃、吉日選擇和專屬佈局嗎？解鎖詳細報告，讓愛情開花結果！💕\n`;
		} else {
			response += `根據你們的配對特質：\n`;
			response += `• 關鍵優勢：${this.getCoupleStrengthHint(element1, element2)}\n`;
			response += `• 發展機會：${this.getCoupleOpportunityHint(element1, element2)}\n`;
			response += `• ⏰黃金期：錯過當前高峰期要等半年\n`;
			response += `• 小鈴溫馨提醒：想知道具體時間表、求婚吉日和增進感情的風水秘訣嗎？解鎖詳細報告，把握愛情最佳時機！💕\n`;
		}

		response += `\n`;
		return response;
	}

	static getFallbackAnalysis(element, specificQuestion) {
		// 保持向後兼容，重定向到事業分析
		return this.getFallbackPersonalAnalysis(
			element,
			"事業",
			specificQuestion
		);
	}

	// ==========================================
	// 🧮 八字計算方法
	// ==========================================

	static calculateBazi(birthday) {
		const year = birthday.getFullYear();
		const month = birthday.getMonth() + 1;
		const day = birthday.getDate();
		const hour = birthday.getHours();

		// 使用BaziCalculator計算年柱和日柱
		const yearPillar = BaziCalculator.getYearPillar(year);
		const dayPillar = BaziCalculator.getDayPillar(birthday);

		// 使用傳統五虎遁法計算月柱
		const monthPillar = BaziCalculator.getMonthPillar(year, month);

		// 計算時柱（如果有時間信息）
		const hourPillar = this.getHourPillar(dayPillar, hour);

		return {
			year: `${yearPillar.tianGan}${yearPillar.diZhi}`,
			month: monthPillar.combined,
			day: `${dayPillar.tianGan}${dayPillar.diZhi}`,
			hour: `${hourPillar.tianGan}${hourPillar.diZhi}`,
			yearElement: yearPillar.element,
			dayElement: dayPillar.element,
		};
	}

	static getMonthPillar(year, month) {
		// 使用BaziCalculator的正確五虎遁法計算
		return BaziCalculator.getMonthPillar(year, month);
	}

	static getHourPillar(dayPillar = null, hour = null) {
		// 如果有具體時間信息，計算實際時柱
		if (dayPillar && hour !== null && hour !== undefined) {
			const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
			const dayStemIndex = BaziCalculator.tianGan.indexOf(
				dayPillar.tianGan
			);
			const hourStemIndex = (dayStemIndex * 12 + hourBranchIndex) % 10;
			return {
				tianGan: BaziCalculator.tianGan[hourStemIndex],
				diZhi: BaziCalculator.diZhi[hourBranchIndex],
			};
		}
		// 否則使用通用時柱
		return { tianGan: "戊", diZhi: "辰" };
	}

	static calculateElement(year) {
		const elements = ["金", "木", "水", "火", "土"];
		return elements[year % 5];
	}

	// ==========================================
	// 🌟 命盤速讀相關方法
	// ==========================================

	static getCareerStar(element) {
		const careerStars = {
			金: "武曲星（財官雙美）",
			木: "天機星（智慧謀略）",
			水: "太陰星（感性智慧）",
			火: "太陽星（領導光芒）",
			土: "天府星（穩重權威）",
		};
		return careerStars[element] || "紫微星";
	}

	static getKeyPattern(element, year) {
		const currentYear = new Date().getFullYear();
		const age = currentYear - year;

		const patterns = {
			金: {
				strength: age % 2 === 0 ? "身強" : "身弱",
				god: "用神：土（印星生身，穩固根基）",
				timing: `大運節點：${currentYear}年處${this.getCurrentLuck(element)}大運`,
			},
			木: {
				strength: age % 2 === 0 ? "身強" : "身弱",
				god: "用神：水（生發之源，智慧流動）",
				timing: `大運節點：${currentYear}年處${this.getCurrentLuck(element)}大運`,
			},
			水: {
				strength: age % 2 === 0 ? "身強" : "身弱",
				god: "用神：金（源頭活水，財源滾滾）",
				timing: `大運節點：${currentYear}年處${this.getCurrentLuck(element)}大運`,
			},
			火: {
				strength: age % 2 === 0 ? "身強" : "身弱",
				god: "用神：木（薪火相傳，生生不息）",
				timing: `大運節點：${currentYear}年處${this.getCurrentLuck(element)}大運`,
			},
			土: {
				strength: age % 2 === 0 ? "身強" : "身弱",
				god: "用神：火（溫暖調候，生機盎然）",
				timing: `大運節點：${currentYear}年處${this.getCurrentLuck(element)}大運`,
			},
		};

		const pattern = patterns[element];
		return `${pattern.strength}（${this.getStrengthReason(element)}）\n     ${pattern.god}\n     ${pattern.timing}`;
	}

	static getStrengthReason(element) {
		const reasons = {
			金: "日主庚金生秋月，金旺當令",
			木: "日主甲木生春月，木旺得時",
			水: "日主壬水生冬月，水旺司權",
			火: "日主丙火生夏月，火旺得勢",
			土: "日主戊土生季末，土旺得地",
		};
		return reasons[element] || "五行平衡";
	}

	static getCurrentLuck(element) {
		const lucks = {
			金: "己未",
			木: "甲寅",
			水: "壬子",
			火: "丙午",
			土: "戊辰",
		};
		return lucks[element];
	}

	// ==========================================
	// ⚠️ 年度預警相關方法
	// ==========================================

	static getYearlyForecast(element, year, category = "事業") {
		const currentMonth = new Date().getMonth() + 1;

		const categoryForecasts = {
			事業: {
				金: {
					achievement: "將星：秋季主導重要專案（9-11月突破期）",
					obstacle: "指背煞：遠離屬虎同事，避免背後議論",
				},
				木: {
					achievement: "文昌星：春季創意大爆發（3-5月靈感期）",
					obstacle: "小耗煞：遠離屬猴上司，防範資源爭奪",
				},
				水: {
					achievement: "智慧星：冬季策略規劃（12-2月佈局期）",
					obstacle: "六害煞：遠離屬蛇同事，避免合作衝突",
				},
				火: {
					achievement: "權威星：夏季領導展現（6-8月發光期）",
					obstacle: "劫財煞：遠離屬豬同事，防範利益糾紛",
				},
				土: {
					achievement: "貴人星：四季交替轉機（3/6/9/12月關鍵期）",
					obstacle: "華蓋煞：遠離屬龍同事，避免孤立無援",
				},
			},
			財運: {
				金: {
					achievement: "天財星：秋季投資收益（9-11月理財期）",
					obstacle: "劫財煞：避免高風險投資，謹慎借貸",
				},
				木: {
					achievement: "進財星：春季事業成長（3-5月收入期）",
					obstacle: "破財煞：遠離投機生意，穩健理財",
				},
				水: {
					achievement: "偏財星：冬季意外之財（12-2月機會期）",
					obstacle: "耗財煞：控制消費慾望，避免浪費",
				},
				火: {
					achievement: "正財星：夏季正職加薪（6-8月收穫期）",
					obstacle: "散財煞：避免衝動消費，理性理財",
				},
				土: {
					achievement: "聚財星：四季穩定累積（定期投資佳）",
					obstacle: "損財煞：避免擔保借貸，保守為上",
				},
			},
			健康: {
				金: {
					achievement: "藥師星：秋季調養肺部（9-11月養生期）",
					obstacle: "病符煞：注意呼吸系統，避免感冒",
				},
				木: {
					achievement: "長生星：春季肝膽調理（3-5月養肝期）",
					obstacle: "刑傷煞：注意筋骨保養，避免外傷",
				},
				水: {
					achievement: "延年星：冬季腎水補充（12-2月進補期）",
					obstacle: "衰弱煞：注意腰腎保暖，規律作息",
				},
				火: {
					achievement: "活力星：夏季心血管強化（6-8月運動期）",
					obstacle: "火旺煞：控制情緒起伏，避免上火",
				},
				土: {
					achievement: "穩健星：四季脾胃調理（規律飲食佳）",
					obstacle: "濕重煞：注意脾胃保養，避免濕氣",
				},
			},
			人際關係: {
				金: {
					achievement: "天德星：秋季貴人相助（9-11月社交期）",
					obstacle: "孤星煞：主動參與聚會，避免獨處",
				},
				木: {
					achievement: "人緣星：春季友誼開花（3-5月交友期）",
					obstacle: "口舌煞：謹慎言辭，避免爭論",
				},
				水: {
					achievement: "智慧星：冬季深度交流（12-2月談心期）",
					obstacle: "暗害煞：防範小人背後，謹慎交友",
				},
				火: {
					achievement: "魅力星：夏季人氣爆棚（6-8月聚會期）",
					obstacle: "衝突煞：控制脾氣，包容他人",
				},
				土: {
					achievement: "信任星：四季建立深交（長期友誼佳）",
					obstacle: "固執煞：保持開放心態，聆聽建議",
				},
			},
			子女: {
				金: {
					achievement: "天喜星：秋季懷孕機會（9-11月受孕期）",
					obstacle: "刑沖煞：注意青春期管教，避免衝突",
				},
				木: {
					achievement: "文曲星：春季教育成效（3-5月學習期）",
					obstacle: "叛逆煞：耐心溝通，避免強硬管教",
				},
				水: {
					achievement: "智慧星：冬季親子溝通（12-2月談心期）",
					obstacle: "冷漠煞：增加陪伴時間，關注情感",
				},
				火: {
					achievement: "活力星：夏季親子活動（6-8月遊樂期）",
					obstacle: "急躁煞：控制情緒，耐心教導",
				},
				土: {
					achievement: "慈愛星：四季穩定教養（持續陪伴佳）",
					obstacle: "溺愛煞：適度管教，培養獨立",
				},
			},
			因緣: {
				金: {
					achievement: "天乙星：秋季貴人出現（9-11月機遇期）",
					obstacle: "孤辰煞：主動社交，參與活動",
				},
				木: {
					achievement: "月德星：春季機會萌發（3-5月發展期）",
					obstacle: "阻滯煞：耐心等待，不急於求成",
				},
				水: {
					achievement: "太極星：冬季神奇際遇（12-2月轉機期）",
					obstacle: "迷茫煞：保持清醒，明辨是非",
				},
				火: {
					achievement: "光明星：夏季機會顯現（6-8月行動期）",
					obstacle: "衝動煞：三思而後行，避免草率",
				},
				土: {
					achievement: "福德星：四季福氣累積（持續行善佳）",
					obstacle: "執著煞：順其自然，不強求結果",
				},
			},
			感情: {
				金: {
					achievement: "紅鸞星：秋季正緣桃花（9-11月戀愛期）",
					obstacle: "孤鸞煞：主動社交，參與聚會",
				},
				木: {
					achievement: "天喜星：春季愛情萌芽（3-5月甜蜜期）",
					obstacle: "三刑煞：避免三角關係，專一感情",
				},
				水: {
					achievement: "咸池星：冬季浪漫邂逅（12-2月緣分期）",
					obstacle: "流霞煞：提防爛桃花，理性選擇",
				},
				火: {
					achievement: "天姚星：夏季熱情如火（6-8月激情期）",
					obstacle: "桃花劫：控制情緒，避免衝動",
				},
				土: {
					achievement: "天倉星：四季感情穩定（長久關係佳）",
					obstacle: "固情煞：適度變化，保持新鮮感",
				},
			},
		};

		const forecasts =
			categoryForecasts[category] || categoryForecasts["事業"];
		return (
			forecasts[element] || {
				achievement: "吉星高照：適時把握機會",
				obstacle: "小心謹慎：避免小人作祟",
			}
		);
	}

	// ==========================================
	// 📈 運勢分析相關方法
	// ==========================================

	static getCareerFortune(element, birthYear, birthMonth) {
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;

		const fortunes = {
			金: `金命的你最近事業運勢呈現穩中有升的趨勢。過去幾個月可能在職場上遇到一些決策挑戰，但你的理性分析能力幫助你渡過難關。接下來的3-6個月，特別是秋季期間，會有重要的升遷或項目機會出現。建議你主動爭取管理職位，你的領導才能將得到充分發揮。`,

			木: `木命的你創意能量充沛，最近在工作上可能產生了很多新想法，但執行上還需要更多耐心。春季是你的旺季，創新項目容易獲得認可。未來幾個月要特別注意與團隊的溝通協調，你的成長性思維將為公司帶來新的發展方向。`,

			水: `水命的你善於變通，最近工作環境的變化對你來說反而是機會。你的適應能力讓你在團隊中備受重視。接下來要把握溝通協調的角色，你的智慧和靈活性將幫助解決很多複雜問題。冬季期間運勢特別旺盛。`,

			火: `火命的你行動力強，最近在工作上展現出很強的執行力，但要注意控制急躁情緒。夏季是你的發光期，領導魅力會吸引更多合作機會。接下來幾個月適合推動重要項目，你的熱情將感染整個團隊。`,

			土: `土命的你做事穩重，最近可能感覺工作進展較慢，但你的堅持正在累積重要成果。你的可靠性讓上司對你信任有加。接下來的發展重點是建立長期規劃，你的穩定特質將成為職場上的重要資產。`,
		};

		return (
			fortunes[element] || "你的事業運勢整體穩定，適合積極規劃未來發展。"
		);
	}

	// ==========================================
	// 🏢 事業風水建議方法
	// ==========================================

	static getWorkFengShuiAdvice(element) {
		const advice = {
			金: [
				"辦公桌放置白色水晶球或金屬擺件，增強決策力",
				"座位選擇西方或西北方，背靠實牆面朝開闊空間",
				"多穿白色、金色、銀色服裝，提升權威氣場",
			],
			木: [
				"辦公桌左側放綠色植物（如富貴竹、綠蘿），激發創意",
				"座位朝向東方或東南方，接受朝陽正能量",
				"使用木質文具和綠色系辦公用品，保持成長活力",
			],
			水: [
				"辦公桌上放小型流水擺設或藍色水晶，提升智慧",
				"座位面向北方，保持思維清晰流暢",
				"多用藍色、黑色文具，穿深色系服裝增強專業感",
			],
			火: [
				"辦公桌南側放紅色擺件或向陽植物，增強領導氣場",
				"座位朝南背北，充分吸收陽光能量",
				"適量使用紅色、橙色辦公用品，激發行動力",
			],
			土: [
				"辦公桌中央放黃色水晶或陶瓷擺件，穩固根基",
				"選擇四角穩固的辦公桌椅，營造安全感",
				"多用黃色、棕色系用品，穿大地色系服裝增強可靠感",
			],
		};

		return (
			advice[element] || [
				"保持辦公環境整潔有序",
				"座位背後要有靠山（牆面或櫃子）",
				"桌上適量放置綠色植物",
			]
		);
	}

	// ==========================================
	// 🎯 具體問題建議方法
	// ==========================================

	static getSpecificWorkAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		// 升職加薪相關
		if (
			lowerQuestion.includes("升職") ||
			lowerQuestion.includes("加薪") ||
			lowerQuestion.includes("晉升")
		) {
			return this.getPromotionAdvice(element);
		}

		// 跳槽轉工相關
		if (
			lowerQuestion.includes("跳槽") ||
			lowerQuestion.includes("轉工") ||
			lowerQuestion.includes("換工作")
		) {
			return this.getJobChangeAdvice(element);
		}

		// 人際關係相關
		if (
			lowerQuestion.includes("同事") ||
			lowerQuestion.includes("上司") ||
			lowerQuestion.includes("人際")
		) {
			return this.getWorkRelationshipAdvice(element);
		}

		// 創業相關
		if (lowerQuestion.includes("創業") || lowerQuestion.includes("生意")) {
			return this.getBusinessAdvice(element);
		}

		// 通用建議
		return this.getGeneralWorkAdvice(element);
	}

	static getPromotionAdvice(element) {
		const advice = {
			金: "你的領導氣質明顯，建議主動承擔更多責任，展現決策能力。最佳時機在秋季，準備好你的成果展示。",
			木: "發揮你的創新優勢，提出有建設性的改進方案。春季是最佳申請期，要有耐心等待成長機會。",
			水: "善用你的溝通協調能力，成為團隊中不可缺少的橋樑。適合在冬季提出升職申請。",
			火: "你的執行力是最大優勢，積極推動重要項目的完成。夏季期間運勢最旺，把握機會表現。",
			土: "穩扎穩打累積成果，讓你的可靠性得到充分認可。四季交替時期都是好時機。",
		};
		return advice[element] || "持續努力，機會自然來臨。";
	}

	static getJobChangeAdvice(element) {
		const advice = {
			金: "適合轉向管理職或需要決策力的工作，金融、法律、製造業都是好選擇。",
			木: "創意產業、教育、環保等成長性行業最適合你的發展。",
			水: "貿易、服務業、媒體傳播等需要溝通的行業能發揮你的優勢。",
			火: "銷售、娛樂、科技等充滿活力的行業最適合你的特質。",
			土: "建築、房地產、農業、金融等穩定行業符合你的性格。",
		};
		return advice[element] || "選擇適合自己特質的行業最重要。";
	}

	static getWorkRelationshipAdvice(element) {
		const advice = {
			金: "以誠待人，用你的公正態度贏得信任，但要學會適度的靈活變通。",
			木: "發揮你的包容性，幫助團隊成長，但要注意不要過於理想化。",
			水: "善用你的溝通天賦，成為各方的協調者，但要堅持自己的原則。",
			火: "控制情緒起伏，用你的熱情感染他人，但要學會傾聽不同意見。",
			土: "發揮你的穩定作用，成為團隊的定海神針，但要更主動表達想法。",
		};
		return advice[element] || "真誠溝通是解決人際問題的關鍵。";
	}

	static getBusinessAdvice(element) {
		const advice = {
			金: "適合投資型或製造業創業，要充分發揮你的管理和決策優勢。",
			木: "創新科技或教育服務最適合，要保持學習心態和成長思維。",
			水: "貿易或服務業創業機會大，要善用你的人脈和溝通能力。",
			火: "娛樂、餐飲或行銷相關最適合，要控制擴張節奏避免過於激進。",
			土: "傳統行業或房地產較穩妥，要做好長期規劃和風險控制。",
		};
		return advice[element] || "選擇熟悉的領域，循序漸進發展最安全。";
	}

	static getGeneralWorkAdvice(element) {
		const advice = {
			金: "發揮你的領導天賦，在決策和管理方面多下功夫。",
			木: "保持學習成長的心態，在創新和發展方面尋找突破。",
			水: "善用你的溝通協調能力，在團隊合作中發揮重要作用。",
			火: "控制好節奏，用你的行動力推動工作進展。",
			土: "穩步前進，在穩定中尋求突破和發展機會。",
		};
		return advice[element] || "根據自己的特質，發揮最大優勢。";
	}

	// ==========================================
	// 📈 通用運勢分析方法
	// ==========================================

	static getCategoryFortune(element, category, birthYear, birthMonth) {
		const fortunes = {
			事業: this.getCareerFortune(element, birthYear, birthMonth),
			財運: this.getFinanceFortune(element, birthYear, birthMonth),
			健康: this.getHealthFortune(element, birthYear, birthMonth),
			人際關係: this.getRelationshipFortune(
				element,
				birthYear,
				birthMonth
			),
			子女: this.getChildrenFortune(element, birthYear, birthMonth),
			因緣: this.getFateFortune(element, birthYear, birthMonth),
			感情: this.getLoveFortune(element, birthYear, birthMonth),
		};

		return fortunes[category] || fortunes["事業"];
	}

	static getFinanceFortune(element, birthYear, birthMonth) {
		const fortunes = {
			金: `金命的你理財觀念務實，最近可能在投資理財方面更加謹慎。你的分析能力幫助你避開了一些風險，接下來的秋季期間是你的財運旺季。建議關注穩健型投資，你的理性判斷將帶來穩定收益。避免過於保守，適度的投資能增加財富累積。`,
			木: `木命的你財運呈現成長趨勢，最近可能有新的收入來源或投資機會出現。你的學習能力讓你能快速掌握理財知識，春季是你的財運高峰期。未來幾個月適合長期投資規劃，你的成長性思維將帶來可觀回報。`,
			水: `水命的你財運變化靈活，最近可能在資金流動方面有新的規劃。你的適應能力讓你能在市場變化中找到機會，冬季期間財運特別旺盛。建議關注流動性投資，你的靈活性將幫助抓住短期獲利機會。`,
			火: `火命的你財運行動力強，最近可能在賺錢方面有積極的表現。你的執行力讓你能快速把握投資時機，夏季是你的財運爆發期。接下來適合積極理財，但要注意控制風險，避免衝動投資。`,
			土: `土命的你財運穩健，最近可能感覺財富累積較慢，但你的堅持正在建立穩固的財務基礎。你的穩重讓你避開了很多投資陷阱，接下來的發展重點是長期規劃，你的穩定特質將成為財富增長的重要資產。`,
		};
		return fortunes[element] || "你的財運整體穩定，適合積極規劃理財策略。";
	}

	static getHealthFortune(element, birthYear, birthMonth) {
		const fortunes = {
			金: `金命的你體質較為敏感，最近可能需要特別注意呼吸系統和皮膚的保養。你的自律性幫助你維持良好的作息習慣，秋季是你的養生關鍵期。建議多做深呼吸運動，你的理性態度將幫助建立健康的生活方式。`,
			木: `木命的你生命力旺盛，最近可能感覺精力充沛，但要注意肝膽和筋骨的保養。你的活力讓你能保持積極的運動習慣，春季是你的健康提升期。建議多接觸大自然，你的成長性特質將帶來身心的全面發展。`,
			水: `水命的你體質偏寒，最近可能需要注意保暖和腎臟的調養。你的智慧讓你能找到適合的養生方法，冬季期間要特別注意保健。建議多喝溫水、適度進補，你的適應能力將幫助調節體質平衡。`,
			火: `火命的你精力旺盛，最近可能容易上火或情緒激動，需要注意心血管和情緒的調節。你的活力讓你喜歡運動健身，夏季要注意避免過度勞累。建議保持平和心態，你的熱情將轉化為健康的動力。`,
			土: `土命的你體質穩定，最近可能需要注意脾胃的調理和體重管理。你的規律性讓你能維持穩定的健康狀態，四季都適合養生調理。建議注意飲食平衡，你的穩健特質將成為長期健康的保障。`,
		};
		return (
			fortunes[element] || "你的健康運勢整體良好，保持規律作息最重要。"
		);
	}

	static getRelationshipFortune(element, birthYear, birthMonth) {
		const fortunes = {
			金: `金命的你人際關係講求公平正義，最近可能在朋友圈中扮演仲裁者的角色。你的公正態度贏得他人信任，秋季是你的社交旺季。建議主動參與團體活動，你的領導魅力將吸引志同道合的朋友。`,
			木: `木命的你人緣很好，最近可能結識了一些有趣的新朋友。你的包容性讓你能與不同類型的人相處，春季是你的交友高峰期。建議多參與學習型聚會，你的成長性思維將帶來有價值的人脈。`,
			水: `水命的你善於溝通，最近可能在人際關係中發揮了重要的協調作用。你的智慧讓你能化解很多人際衝突，冬季期間人際運勢特別旺盛。建議深化現有友誼，你的真誠將建立長久的信任關係。`,
			火: `火命的你個性熱情，最近可能因為你的活力而成為朋友圈的焦點。你的魅力讓你容易結交新朋友，夏季是你的人氣爆發期。建議控制情緒起伏，用你的正能量感染周圍的人。`,
			土: `土命的你人際關係穩定，最近可能更加重視深層的友誼關係。你的可靠性讓朋友都願意向你求助，四季都適合維護現有人脈。建議更主動表達關心，你的真誠將深化所有人際關係。`,
		};
		return fortunes[element] || "你的人際運勢穩定，真誠溝通是關鍵。";
	}

	static getChildrenFortune(element, birthYear, birthMonth) {
		const fortunes = {
			金: `金命的你對子女教育很有規劃，最近可能在教育方式上有新的思考。你的理性態度幫助建立明確的教育目標，秋季是親子關係的重要時期。建議多聆聽孩子的想法，你的公正性將贏得子女的尊敬。`,
			木: `木命的你與子女關係融洽，最近可能發現孩子的新才能或興趣。你的包容性讓孩子能自由發展，春季是教育成效顯現的時期。建議陪伴孩子探索新事物，你的成長性思維將啟發子女的潛能。`,
			水: `水命的你很懂得與子女溝通，最近可能通過深度對話更了解孩子的內心。你的智慧讓你能給予適當的指導，冬季期間親子關係特別和諧。建議增加情感交流時間，你的理解力將建立深厚的親子關係。`,
			火: `火命的你對子女充滿熱情，最近可能在親子活動上很積極。你的活力讓孩子感受到滿滿的愛，夏季是親子互動的黃金期。建議控制期待值，用你的熱情激發孩子的興趣而非壓力。`,
			土: `土命的你給予子女穩定的愛，最近可能更注重孩子的品格教育。你的穩重讓孩子有安全感，四季都適合進行深度的親子教育。建議保持耐心和包容，你的穩定性將成為子女成長的重要支柱。`,
		};
		return fortunes[element] || "你與子女的關係整體和諧，用心陪伴最重要。";
	}

	static getFateFortune(element, birthYear, birthMonth) {
		const fortunes = {
			金: `金命的你最近因緣際遇偏向高品質的人事物，可能會遇到一些有影響力的貴人。你的正直態度吸引了志同道合的人，秋季是重要機會出現的時期。建議保持開放心態，你的品格將為你帶來意想不到的好機緣。`,
			木: `木命的你因緣呈現成長性發展，最近可能有學習或發展的新機會出現。你的求知欲吸引了很多學習資源，春季是因緣萌發的關鍵期。建議積極參與成長型活動，你的進步心將帶來豐富的人生體驗。`,
			水: `水命的你因緣變化多樣，最近可能有意外的際遇或轉機。你的適應力讓你能把握各種機會，冬季期間因緣特別神奇。建議保持靈活心態，你的智慧將幫助識別真正有價值的機緣。`,
			火: `火命的你因緣充滿活力，最近可能因為積極行動而創造了新的機會。你的熱情感染了周圍的人，夏季是因緣爆發的時期。建議把握當下機會，你的行動力將開創全新的人生可能性。`,
			土: `土命的你因緣深厚穩定，最近可能有長期性的重要機會出現。你的誠信態度建立了良好的口碑，四季都有持續的好因緣。建議珍惜既有關係，你的穩重將累積深厚的福德因緣。`,
		};
		return (
			fortunes[element] || "你的因緣運勢整體良好，誠心待人將帶來好機緣。"
		);
	}

	static getLoveFortune(element, birthYear, birthMonth) {
		const fortunes = {
			金: `金命的你感情觀較為理性，最近可能在愛情中尋求更深層的精神契合。你的真誠態度吸引了品質不錯的桃花，秋季是正緣出現的重要時期。建議保持真實自我，你的品格將吸引真正適合的人。`,
			木: `木命的你感情充滿成長性，最近可能與伴侶在共同學習中增進感情。你的包容性讓感情關係很和諧，春季是愛情開花結果的時期。建議多創造共同體驗，你的成長性思維將帶來美好的愛情故事。`,
			水: `水命的你感情豐富細膩，最近可能通過深度溝通讓感情更進一步。你的理解力讓伴侶感到被珍視，冬季期間愛情運勢特別旺盛。建議多表達內心感受，你的真誠將建立深厚的情感連結。`,
			火: `火命的你感情熱烈直接，最近可能因為你的魅力而吸引了很多關注。你的熱情讓愛情充滿激情，夏季是桃花大爆發的時期。建議學會耐心經營，你的真心將點燃美好的愛情火花。`,
			土: `土命的你感情踏實穩重，最近可能更重視感情的長期發展。你的穩定性讓伴侶很有安全感，四季都適合深化感情關係。建議增加浪漫元素，你的真誠將建立堅固持久的愛情基礎。`,
		};
		return fortunes[element] || "你的感情運勢穩定，真心相待是愛情的基礎。";
	}

	// ==========================================
	// 🏢 通用風水建議方法
	// ==========================================

	static getCategoryFengShuiAdvice(element, category) {
		const adviceMap = {
			事業: this.getWorkFengShuiAdvice(element),
			財運: this.getFinanceFengShuiAdvice(element),
			健康: this.getHealthFengShuiAdvice(element),
			人際關係: this.getRelationshipFengShuiAdvice(element),
			子女: this.getChildrenFengShuiAdvice(element),
			因緣: this.getFateFengShuiAdvice(element),
			感情: this.getLoveFengShuiAdvice(element),
		};

		return adviceMap[category] || adviceMap["事業"];
	}

	static getFinanceFengShuiAdvice(element) {
		const advice = {
			金: [
				"財位（東南方）放置白色水晶或金屬聚寶盆，增強財運磁場",
				"使用金色、白色錢包，裡面放置整齊鈔票和紅色小紙條",
				"每月初一十五在財位點香祈福，感謝財神護佑",
			],
			木: [
				"財位放置綠色植物（如發財樹、富貴竹），激活生財能量",
				"使用綠色、棕色錢包，裡面放置生長中的種子象徵錢財增長",
				"定期整理財務文件，保持理財環境清潔有序",
			],
			水: [
				"財位放置小型流水裝置或藍色水晶，促進財富流動",
				"使用藍色、黑色錢包，避免紅色以免財水相沖",
				"每週清潔錢包和銀行卡，保持財運流動順暢",
			],
			火: [
				"財位南側放置紅色擺件或向陽植物，激發賺錢動力",
				"使用紅色、紫色錢包，但避免過於鮮豔防止散財",
				"在家中點燃檀香或使用精油，營造積極的財運氛圍",
			],
			土: [
				"財位中央放置黃色水晶或陶瓷聚寶盆，穩固財富根基",
				"使用黃色、棕色厚實錢包，象徵財富穩固累積",
				"定期清理家中雜物，保持財運通道暢通無阻",
			],
		};

		return (
			advice[element] || [
				"保持財位整潔，定期清理雜物",
				"使用質感好的錢包，避免破損",
				"培養良好的理財習慣和記帳習慣",
			]
		);
	}

	static getHealthFengShuiAdvice(element) {
		const advice = {
			金: [
				"臥室西方放置白色水晶或金屬風鈴，調和肺金能量",
				"多穿白色、淺色衣物，避免過於厚重的服裝",
				"保持室內空氣流通，定期更換寢具維持清潔",
			],
			木: [
				"房間東方放置綠色植物或木質傢具，增強肝木活力",
				"多穿綠色、自然色系服裝，使用天然材質用品",
				"每天早晨面向東方做深呼吸，吸收朝陽正能量",
			],
			水: [
				"房間北方放置水培植物或藍色擺件，滋養腎水",
				"多穿深色、藍色系服裝，保持身體溫暖",
				"睡前泡腳或洗溫水澡，促進血液循環",
			],
			火: [
				"房間南方放置紅色擺件或向陽植物，平衡心火",
				"適量使用紅色服飾，但避免全身過於鮮豔",
				"保持規律作息，避免熬夜影響心血管健康",
			],
			土: [
				"房間中央保持整潔，放置黃色或陶瓷擺件穩定脾土",
				"多穿大地色系、舒適寬鬆的服裝",
				"注意飲食規律，三餐定時定量保養脾胃",
			],
		};

		return (
			advice[element] || [
				"保持居住環境整潔舒適",
				"維持規律的作息時間",
				"根據體質選擇適合的運動方式",
			]
		);
	}

	static getRelationshipFengShuiAdvice(element) {
		const advice = {
			金: [
				"客廳西方擺放成對的白色或金屬裝飾品，增強人際和諧",
				"參加聚會時穿著白色、金色系服裝，提升領導魅力",
				"送禮選擇精緻的金屬或白色物品，展現品味",
			],
			木: [
				"家中東方放置綠色植物或木質圓桌，促進友誼成長",
				"社交場合穿著自然色系，使用木質或竹製飾品",
				"多在戶外或綠意環境中與朋友聚會交流",
			],
			水: [
				"客廳北方放置流水擺設或藍色裝飾，促進溝通流暢",
				"參與社交時穿著藍色、黑色系服裝，展現智慧氣質",
				"選擇水邊或安靜的咖啡廳作為約會談心場所",
			],
			火: [
				"客廳南方放置成對的紅色或明亮裝飾品，增強人氣",
				"社交場合適量使用紅色配飾，但避免過於張揚",
				"選擇明亮、熱鬧的環境進行聚會和交流",
			],
			土: [
				"客廳中央放置圓形地毯或黃色抱枕，營造溫馨氛圍",
				"穿著大地色系、質感穩重的服裝，展現可靠形象",
				"選擇溫馨舒適的家庭式餐廳作為聚會場所",
			],
		};

		return (
			advice[element] || [
				"保持真誠友善的態度",
				"主動參與各種社交活動",
				"學會聆聽和包容不同觀點",
			]
		);
	}

	static getChildrenFengShuiAdvice(element) {
		const advice = {
			金: [
				"兒童房西方放置白色學習桌椅，培養專注和邏輯思維",
				"為孩子選擇金屬或白色文具，提升學習效率",
				"建立明確的作息時間表，培養孩子的自律性",
			],
			木: [
				"兒童房東方放置書桌和綠色植物，促進智慧成長",
				"使用木質玩具和自然材質用品，培養親近自然的心性",
				"多帶孩子到戶外活動，在大自然中學習成長",
			],
			水: [
				"兒童房北方設置閱讀角落，放置藍色書櫃或擺件",
				"鼓勵孩子多喝水，使用藍色或深色學習用品",
				"培養孩子的想像力和創造力，多進行親子對話",
			],
			火: [
				"兒童房南方放置明亮的學習燈具，激發學習熱情",
				"適量使用紅色或明亮色彩裝飾，但避免過於刺激",
				"鼓勵孩子參與體育活動，培養積極正面的性格",
			],
			土: [
				"兒童房中央保持整潔，使用黃色或大地色系裝飾",
				"為孩子準備舒適穩固的學習環境和質感好的用品",
				"注重品格教育，培養孩子的責任感和同理心",
			],
		};

		return (
			advice[element] || [
				"為孩子創造溫馨安全的成長環境",
				"保持耐心和愛心進行教育",
				"尊重孩子的個性發展和興趣愛好",
			]
		);
	}

	static getFateFengShuiAdvice(element) {
		const advice = {
			金: [
				"家中西方設置祈福空間，放置白色蠟燭或金屬法器",
				"穿著整潔得體，展現高品質的個人形象",
				"保持正直善良的品格，以德行吸引好因緣",
			],
			木: [
				"家中東方放置常青植物，象徵因緣不斷成長",
				"多參與學習成長類活動，在求知中遇見貴人",
				"保持開放包容的心態，歡迎新的人事物進入生活",
			],
			水: [
				"家中北方放置流水或水晶球，促進因緣流動",
				"保持靈活變通的處事態度，隨緣不強求",
				"多行善積德，用智慧和慈悲心累積福德因緣",
			],
			火: [
				"家中南方放置明亮燈具，照亮人生道路",
				"積極主動參與各種活動，用熱情創造機會",
				"保持正面樂觀的態度，用光明能量吸引好緣分",
			],
			土: [
				"家中中央保持整潔神聖，設置感恩祈福的空間",
				"踏實做人做事，用誠信建立良好的人生基礎",
				"珍惜既有的人際關係，深耕長期的情感連結",
			],
		};

		return (
			advice[element] || [
				"保持善良正直的品格",
				"積極參與有意義的活動",
				"以誠待人，廣結善緣",
			]
		);
	}

	static getLoveFengShuiAdvice(element) {
		const advice = {
			金: [
				"臥室西南方（桃花位）放置成對的白色玫瑰或金屬裝飾",
				"穿著優雅的白色、粉色系服裝，展現高貴氣質",
				"保持理性和感性的平衡，用真誠吸引真愛",
			],
			木: [
				"桃花位放置粉色花朵或綠色植物，催旺桃花運",
				"穿著自然色系、有質感的服裝，展現親和力",
				"多在自然環境中約會，讓愛情在成長中深化",
			],
			水: [
				"桃花位放置水培植物或粉色水晶，增強浪漫氣息",
				"穿著藍色、紫色系優雅服裝，展現神秘魅力",
				"培養深度溝通的能力，用心靈契合建立真愛",
			],
			火: [
				"桃花位放置紅色或粉色鮮花，點燃愛情火花",
				"適量使用紅色、粉色配飾，但避免過於濃烈",
				"保持熱情但學會溫柔，用真心感動對方",
			],
			土: [
				"桃花位放置成對的黃色或粉色擺件，穩固愛情基礎",
				"穿著溫暖的大地色系服裝，展現可靠魅力",
				"注重細節和承諾，用穩定的愛建立長久關係",
			],
		};

		return (
			advice[element] || [
				"保持真實自然的個性魅力",
				"培養良好的溝通和相處技巧",
				"用心經營感情，珍惜每個相遇",
			]
		);
	}

	// ==========================================
	// 💑 合盤配對詳細分析
	// ==========================================

	static getCoupleAnalysisDetail(element1, element2) {
		const combinations = {
			金水: `你們是理性與智慧的完美結合。${element1}命的穩重理性正好平衡了${element2}命的靈活變通，最近你們在溝通協調方面表現得很好。接下來幾個月，你們的關係會更加和諧，${element1}命提供安全感，${element2}命帶來新鮮感。建議多進行深度對話，你們的理性溝通將建立更深厚的信任基礎。`,

			水木: `你們是滋養與成長的美好配對。${element1}命的智慧滋養著${element2}命的成長夢想，最近你們在共同學習和發展方面很有默契。未來幾個月，你們會在互相支持中獲得成長，${element1}命的靈活性幫助${element2}命適應變化，${element2}命的積極性帶動${element1}命前進。`,

			木火: `你們是創意與熱情的完美融合。${element1}命的創新思維點燃了${element2}命的行動熱情，最近你們在追求夢想方面很有共識。接下來的時間裡，你們會在共同努力中實現目標，${element1}命提供方向，${element2}命提供動力，是很有發展潛力的組合。`,

			火土: `你們是激情與穩定的互補配對。${element1}命的熱情活力與${element2}命的穩重踏實形成很好的平衡，最近你們在生活規劃方面配合得很好。未來幾個月，${element1}命會學會更多耐心，${element2}命會增加更多活力，相互調節讓關係更加和諧。`,

			土金: `你們是穩固與精準的理想組合。${element1}命的踏實基礎支撐著${element2}命的理性規劃，最近你們在建立共同目標方面很有共識。接下來的發展中，你們會在穩中求進，${element1}命提供安全感，${element2}命提供方向感，是能夠長久發展的配對。`,

			金金: `你們是理性與理性的默契組合。雙方都很重視邏輯和規劃，最近在決策方面很有共識，但要注意增加感性的溝通。未來幾個月要學會表達情感，適度的浪漫會讓你們的關係更加溫馨。`,

			木木: `你們是成長與成長的共振配對。雙方都很有上進心和學習精神，最近在共同發展方面很有動力，但要注意保持個人特色。接下來要學會欣賞差異，在相似中找到獨特性。`,

			水水: `你們是智慧與智慧的深度結合。雙方都很善於溝通和理解，最近在心靈交流方面很有默契，但要注意增加行動力。未來要學會付諸實際行動，讓美好的想法變成現實。`,

			火火: `你們是熱情與熱情的激烈碰撞。雙方都很有活力和行動力，最近在追求目標方面很有衝勁，但要注意控制情緒衝突。接下來要學會輪流領導，避免同時爆發造成摩擦。`,

			土土: `你們是穩定與穩定的堅固組合。雙方都很踏實和可靠，最近在建立安全感方面很有成就，但要注意增加生活情趣。未來要學會創造驚喜，在穩定中保持新鮮感。`,
		};

		const key = element1 + element2;
		return (
			combinations[key] ||
			combinations[element2 + element1] ||
			"你們的配對很特別，需要更多的理解和磨合，但正是這種差異讓你們能夠互相學習成長。"
		);
	}

	static getCoupleFengShuiAdvice(element1, element2) {
		const compatibility = this.getCompatibilityScore(element1, element2);

		if (compatibility >= 85) {
			// 高契合度配對建議
			return [
				`共同居住空間以${this.getCoupleMainColor(element1, element2)}為主色調，增強和諧能量`,
				`約會選擇${this.getCoupleLocation(element1, element2)}，讓你們的能量更加契合`,
				`雙方可穿著互補色系：${element1}命適合${this.getElementColor(element1)}，${element2}命適合${this.getElementColor(element2)}`,
			];
		} else if (compatibility >= 75) {
			// 中等契合度配對建議
			return [
				`居家空間使用中性色調搭配各自喜好的顏色，維持和諧平衡`,
				`定期安排不同類型的約會活動，滿足雙方的不同需求`,
				`配飾選擇能增進溝通的物品，如對戒、情侶手鍊等增強連結`,
			];
		} else {
			// 需要磨合的配對建議
			return [
				`居住環境多使用柔和的暖色調，緩解五行相剋的衝突`,
				`選擇大自然環境約會，讓自然能量調和你們的差異`,
				`雙方都需要學習對方五行的特質，穿著可互換對方代表色增進理解`,
			];
		}
	}

	static getCoupleMainColor(element1, element2) {
		const colorMap = {
			金: "白色或淺色",
			木: "綠色或自然色",
			水: "藍色或深色",
			火: "紅色或暖色",
			土: "黃色或大地色",
		};

		// 選擇相生關係中的主導色
		if (this.isGenerative(element1, element2)) {
			return `${colorMap[element1]}和${colorMap[element2]}的和諧搭配`;
		} else {
			return "溫馨的米白色或淺粉色";
		}
	}

	static getCoupleLocation(element1, element2) {
		const locationMap = {
			金: "咖啡廳、藝廊、音樂廳等精緻場所",
			木: "公園、森林、植物園等自然環境",
			水: "湖邊、海邊、溫泉等水域景點",
			火: "陽光充足的戶外、運動場、遊樂園",
			土: "溫馨的家庭餐廳、傳統建築、鄉村景點",
		};

		return `${locationMap[element1]}或${locationMap[element2]}`;
	}

	static getElementColor(element) {
		const colors = {
			金: "白色、金色、銀色系",
			木: "綠色、棕色、自然色系",
			水: "藍色、黑色、深色系",
			火: "紅色、橙色、暖色系",
			土: "黃色、米色、大地色系",
		};
		return colors[element] || "任何自己喜歡的顏色";
	}

	static isGenerative(element1, element2) {
		const generative = [
			["金", "水"],
			["水", "木"],
			["木", "火"],
			["火", "土"],
			["土", "金"],
		];

		return generative.some(
			(pair) =>
				(pair[0] === element1 && pair[1] === element2) ||
				(pair[0] === element2 && pair[1] === element1)
		);
	}

	// ==========================================
	// 🎯 具體問題建議方法 (通用)
	// ==========================================

	static getSpecificCategoryAdvice(element, category, question) {
		// 根據不同類別分發到具體的建議方法
		switch (category) {
			case "事業":
				return this.getSpecificWorkAdvice(element, question);
			case "財運":
				return this.getSpecificFinanceAdvice(element, question);
			case "健康":
				return this.getSpecificHealthAdvice(element, question);
			case "人際關係":
				return this.getSpecificRelationshipAdvice(element, question);
			case "子女":
				return this.getSpecificChildrenAdvice(element, question);
			case "因緣":
				return this.getSpecificFateAdvice(element, question);
			case "感情":
				return this.getSpecificLoveAdvice(element, question);
			default:
				return this.getGeneralWorkAdvice(element);
		}
	}

	static getSpecificFinanceAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("投資") || lowerQuestion.includes("理財")) {
			return this.getInvestmentAdvice(element);
		}

		if (lowerQuestion.includes("存錢") || lowerQuestion.includes("儲蓄")) {
			return this.getSavingAdvice(element);
		}

		if (lowerQuestion.includes("賺錢") || lowerQuestion.includes("收入")) {
			return this.getIncomeAdvice(element);
		}

		return this.getGeneralFinanceAdvice(element);
	}

	static getSpecificHealthAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("減肥") || lowerQuestion.includes("瘦身")) {
			return this.getWeightLossAdvice(element);
		}

		if (lowerQuestion.includes("養生") || lowerQuestion.includes("保養")) {
			return this.getWellnessAdvice(element);
		}

		if (lowerQuestion.includes("睡眠") || lowerQuestion.includes("失眠")) {
			return this.getSleepAdvice(element);
		}

		return this.getGeneralHealthAdvice(element);
	}

	static getSpecificRelationshipAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("朋友") || lowerQuestion.includes("交友")) {
			return this.getFriendshipAdvice(element);
		}

		if (lowerQuestion.includes("同事") || lowerQuestion.includes("職場")) {
			return this.getWorkRelationshipAdvice(element);
		}

		if (lowerQuestion.includes("家人") || lowerQuestion.includes("親情")) {
			return this.getFamilyAdvice(element);
		}

		return this.getGeneralRelationshipAdvice(element);
	}

	static getSpecificChildrenAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("教育") || lowerQuestion.includes("學習")) {
			return this.getEducationAdvice(element);
		}

		if (lowerQuestion.includes("懷孕") || lowerQuestion.includes("生育")) {
			return this.getPregnancyAdvice(element);
		}

		if (lowerQuestion.includes("親子") || lowerQuestion.includes("溝通")) {
			return this.getParentChildAdvice(element);
		}

		return this.getGeneralChildrenAdvice(element);
	}

	static getSpecificFateAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("機會") || lowerQuestion.includes("機遇")) {
			return this.getOpportunityAdvice(element);
		}

		if (lowerQuestion.includes("貴人") || lowerQuestion.includes("幫助")) {
			return this.getBenefactorAdvice(element);
		}

		if (lowerQuestion.includes("轉運") || lowerQuestion.includes("改運")) {
			return this.getLuckChangeAdvice(element);
		}

		return this.getGeneralFateAdvice(element);
	}

	static getSpecificLoveAdvice(element, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("桃花") || lowerQuestion.includes("脫單")) {
			return this.getPeachBlossomAdvice(element);
		}

		if (lowerQuestion.includes("結婚") || lowerQuestion.includes("婚姻")) {
			return this.getMarriageAdvice(element);
		}

		if (lowerQuestion.includes("復合") || lowerQuestion.includes("挽回")) {
			return this.getReconciliationAdvice(element);
		}

		return this.getGeneralLoveAdvice(element);
	}

	static getSpecificCoupleAdvice(element1, element2, question) {
		const lowerQuestion = question.toLowerCase();

		if (lowerQuestion.includes("結婚") || lowerQuestion.includes("婚姻")) {
			return this.getCoupleMarriageAdvice(element1, element2);
		}

		if (lowerQuestion.includes("相處") || lowerQuestion.includes("溝通")) {
			return this.getCoupleHarmonyAdvice(element1, element2);
		}

		if (lowerQuestion.includes("吵架") || lowerQuestion.includes("衝突")) {
			return this.getCoupleConflictAdvice(element1, element2);
		}

		return this.getGeneralCoupleAdvice(element1, element2);
	}

	// ==========================================
	// 📝 具體建議實現方法 (這裡簡化實現，可以根據需要擴展)
	// ==========================================

	static getInvestmentAdvice(element) {
		const advice = {
			金: "適合穩健型投資，關注金融、科技類股票或基金。",
			木: "適合成長型投資，關注新興行業和環保概念。",
			水: "適合靈活型投資，可考慮外匯或流動性較高的工具。",
			火: "適合積極型投資，但要控制風險避免過度激進。",
			土: "適合保守型投資，定期定額和房地產是好選擇。",
		};
		return advice[element] || "根據自己的風險承受能力選擇適合的投資方式。";
	}

	// 簡化的其他建議方法
	static getSavingAdvice(element) {
		return `${element}命的你適合制定長期儲蓄計劃，發揮你的特質優勢。`;
	}

	static getIncomeAdvice(element) {
		return `${element}命的你可以考慮發揮專業特長，開拓多元收入來源。`;
	}

	static getGeneralFinanceAdvice(element) {
		return `${element}命的你理財要發揮自身優勢，保持穩健策略。`;
	}

	static getWeightLossAdvice(element) {
		return `${element}命的你適合循序漸進的健康方式，配合適當運動。`;
	}

	static getWellnessAdvice(element) {
		return `${element}命的你要注重身心平衡，保持規律的養生習慣。`;
	}

	static getSleepAdvice(element) {
		return `${element}命的你要建立良好作息，創造適合的睡眠環境。`;
	}

	static getGeneralHealthAdvice(element) {
		return `${element}命的你要根據體質特點，選擇適合的保健方式。`;
	}

	static getFriendshipAdvice(element) {
		return `${element}命的你要發揮個人魅力，主動參與社交活動。`;
	}

	static getFamilyAdvice(element) {
		return `${element}命的你要多關心家人，保持溫馨的家庭關係。`;
	}

	static getGeneralRelationshipAdvice(element) {
		return `${element}命的你要真誠待人，建立良好的人際關係。`;
	}

	static getEducationAdvice(element) {
		return `${element}命的你適合因材施教，培養孩子的獨特才能。`;
	}

	static getPregnancyAdvice(element) {
		return `${element}命的你要保持身心健康，為迎接新生命做好準備。`;
	}

	static getParentChildAdvice(element) {
		return `${element}命的你要耐心溝通，建立親密的親子關係。`;
	}

	static getGeneralChildrenAdvice(element) {
		return `${element}命的你要用愛心陪伴，給孩子最好的成長環境。`;
	}

	static getOpportunityAdvice(element) {
		return `${element}命的你要保持敏銳觀察，積極把握人生機會。`;
	}

	static getBenefactorAdvice(element) {
		return `${element}命的你要廣結善緣，真誠待人將得到貴人相助。`;
	}

	static getLuckChangeAdvice(element) {
		return `${element}命的你要保持正面心態，用實際行動改善運勢。`;
	}

	static getGeneralFateAdvice(element) {
		return `${element}命的你要順應自然，把握當下創造美好因緣。`;
	}

	static getPeachBlossomAdvice(element) {
		return `${element}命的你要提升個人魅力，主動參與社交活動增加桃花運。`;
	}

	static getMarriageAdvice(element) {
		return `${element}命的你要認真經營感情，為美好的婚姻關係做好準備。`;
	}

	static getReconciliationAdvice(element) {
		return `${element}命的你要真誠反省，用行動證明改變的決心。`;
	}

	static getGeneralLoveAdvice(element) {
		return `${element}命的你要保持真實自我，用心經營美好的感情關係。`;
	}

	static getCoupleMarriageAdvice(element1, element2) {
		return `${element1}命和${element2}命的組合很有潛力，建議多溝通建立共同目標。`;
	}

	static getCoupleHarmonyAdvice(element1, element2) {
		return `${element1}命要理解${element2}命的特質，互相包容將讓關係更和諧。`;
	}

	static getCoupleConflictAdvice(element1, element2) {
		return `${element1}命和${element2}命都要冷靜溝通，尊重彼此差異化解衝突。`;
	}

	static getGeneralCoupleAdvice(element1, element2) {
		return `${element1}命和${element2}命要互相理解，發揮各自優勢共同成長。`;
	}

	// ==========================================
	// 🆕 Point 5 專用輔助方法
	// ==========================================

	static getBasicSolution(element, category) {
		const solutions = {
			事業: `${element}命適合在穩定的環境中發展，建議先完善基礎技能`,
			財運: `${element}命的你要穩健理財，避免高風險投資`,
			健康: `${element}命需要注意作息規律，多休息少熬夜`,
			感情: `${element}命要真誠待人，用行動表達關心`,
			人際關係: `${element}命適合主動社交，展現友善態度`,
			子女: `${element}命要用愛心陪伴，建立良好溝通`,
			因緣: `${element}命要保持正面心態，廣結善緣`,
		};
		return (
			solutions[category] || `${element}命的你要保持平衡，順應自然發展`
		);
	}

	static getOpportunityHint(element, category) {
		const hints = {
			事業: `${element}命在秋季容易有突破機會`,
			財運: `${element}命適合在穩定期投資理財`,
			健康: `${element}命要把握調養身體的好時機`,
			感情: `${element}命的桃花運在人際活動中較旺`,
			人際關係: `${element}命容易在工作環境中遇到貴人`,
			子女: `${element}命與孩子的互動會有特殊收獲`,
			因緣: `${element}命要把握身邊的善緣機會`,
		};
		return hints[category] || `${element}命要敏銳觀察身邊機會`;
	}

	static getCautionHint(element, category) {
		const cautions = {
			事業: `${element}命要留意職場人際關係`,
			財運: `${element}命要謹慎處理金錢問題`,
			健康: `${element}命要注意身體警訊`,
			感情: `${element}命要避免情緒化溝通`,
			人際關係: `${element}命要真誠待人避免誤會`,
			子女: `${element}命要耐心引導不可急躁`,
			因緣: `${element}命要保持善念避免負面情緒`,
		};
		return cautions[category] || `${element}命要保持理性判斷`;
	}

	static getCoupleImprovementHint(element1, element2) {
		return `${element1}命和${element2}命要增進溝通，建立共同目標`;
	}

	static getCoupleStrengthHint(element1, element2) {
		return `${element1}命的穩定特質能平衡${element2}命的特性`;
	}

	static getCoupleOpportunityHint(element1, element2) {
		return `${element1}命和${element2}命在秋冬季節感情容易升溫`;
	}

	// ==========================================
	// 📊 Report Recommendations
	// ==========================================

	static getReportRecommendations(
		category,
		region = "hongkong",
		locale = "zh-TW"
	) {
		const categoryNames = {
			事業: "事業",
			財運: "財運",
			健康: "健康",
			感情: "感情",
			人際關係: "人際關係",
			子女: "子女",
			因緣: "因緣",
			命理: "財運", // 命理分析映射到財運報告
			其他: "財運", // 其他分類映射到財運報告
		};

		const concernName = categoryNames[category] || "財運";

		// Regional pricing configuration
		const getRegionalPricing = (region) => {
			switch (region) {
				case "china":
					return {
						currency: "¥",
						fortune: { original: 88, discount: 38 },
						comprehensive: { original: 168, discount: 88 },
					};
				case "taiwan":
					return {
						currency: "NT$",
						fortune: { original: 368, discount: 158 }, // NT$158 for fortune
						comprehensive: { original: 668, discount: 368 }, // NT$368 for life/comprehensive
					};
				case "hongkong":
				default:
					return {
						currency: "HK$",
						fortune: { original: 88, discount: 38 },
						comprehensive: { original: 168, discount: 88 },
					};
			}
		};

		const pricing = getRegionalPricing(region);

		// Use translation system
		const header = getTranslation(locale, "reportRecommendations.header");
		const option1 = getTranslation(
			locale,
			"reportRecommendations.option1",
			concernName,
			pricing.currency,
			pricing.fortune.original,
			pricing.fortune.discount
		);
		const option2 = getTranslation(
			locale,
			"reportRecommendations.option2",
			pricing.currency,
			pricing.comprehensive.original,
			pricing.comprehensive.discount
		);
		const footer = getTranslation(locale, "reportRecommendations.footer");

		return `\n\n${header}\n\n${option1}\n\n${option2}\n\n${footer}`;
	}

	static getCoupleReportRecommendations(
		region = "hongkong",
		locale = "zh-TW"
	) {
		// Regional pricing configuration
		const getRegionalPricing = (region) => {
			switch (region) {
				case "china":
					return {
						currency: "¥",
						couple: { original: 168, discount: 88 },
					};
				case "taiwan":
					return {
						currency: "NT$",
						couple: { original: 668, discount: 368 }, // NT$368 for couple analysis
					};
				case "hongkong":
				default:
					return {
						currency: "HK$",
						couple: { original: 168, discount: 88 },
					};
			}
		};

		const pricing = getRegionalPricing(region);

		if (locale === "zh-CN") {
			return {
				options: [
					{
						number: "1️⃣",
						title: "💕 合盤配对详细报告",
						price: `${pricing.currency}${pricing.couple.discount}`,
						originalPrice: `${pricing.currency}${pricing.couple.original}`,
						features: [
							"深入分析你们的感情配对度，提供具体建议和改善方案",
							"详细的两人五行相配分析",
							"感情发展最佳时机指导",
							"专属的合盤风水布局建议",
							"双方性格互补和磨合策略",
						],
					},
					{
						number: "2️⃣",
						title: "一份综合命理报告",
						price: `${pricing.currency}${pricing.couple.discount}`,
						originalPrice: `${pricing.currency}${pricing.couple.original}`,
						features: [
							"全面的八字命盘分析，包含各方面运势预测",
							"流年大运走势分析",
							"人际关系和事业发展建议",
						],
					},
				],
				action: "请回复「1」或「2」选择你想要的报告",
			};
		} else {
			return {
				options: [
					{
						number: "1️⃣",
						title: "💕 合盤配對詳細報告",
						price: `${pricing.currency}${pricing.couple.discount}`,
						originalPrice: `${pricing.currency}${pricing.couple.original}`,
						features: [
							"深入分析你們的感情配對度，提供具體建議和改善方案",
							"詳細的兩人五行相配分析",
							"感情發展最佳時機指導",
							"專屬的合盤風水佈局建議",
							"雙方性格互補和磨合策略",
						],
					},
					{
						number: "2️⃣",
						title: "一份綜合命理報告",
						price: `${pricing.currency}${pricing.couple.discount}`,
						originalPrice: `${pricing.currency}${pricing.couple.original}`,
						features: [
							"全面的八字命盤分析，包含各方面運勢預測",
							"流年大運走勢分析",
							"人際關係和事業發展建議",
						],
					},
				],
				action: "請回覆「1」或「2」選擇你想要的報告",
			};
		}
	}

	// ==========================================
	// 🔄 新增：運勢評估和實用解決方案方法
	// ==========================================

	// 運勢評估方法 - 不再依賴五行，改用更豐富的分析
	static getFortuneAssessment(element, category, birthday) {
		const currentMonth = new Date().getMonth() + 1;
		const birthMonth = birthday.getMonth() + 1;
		const birthYear = birthday.getFullYear();
		const zodiacAnimal = this.getChineseZodiac(birthYear);

		// 生肖特質映射
		const zodiacTraits = {
			鼠: "機靈變通，善於把握機會",
			牛: "踏實穩重，持之以恆",
			虎: "勇敢果斷，領導力強",
			兔: "溫和細膩，直覺敏銳",
			龍: "有魄力，創造力豐富",
			蛇: "深思熟慮，策略性強",
			馬: "活力充沛，適應力強",
			羊: "溫文爾雅，重視和諧",
			猴: "聰明靈活，創新能力強",
			雞: "細心負責，條理分明",
			狗: "忠誠可靠，責任感強",
			豬: "誠實善良，財運不錯",
		};

		const seasonalAnalysis = {
			春: {
				months: [3, 4, 5],
				trait: "生機勃勃，創造力旺盛",
				advice: "適合開展新計劃",
			},
			夏: {
				months: [6, 7, 8],
				trait: "熱情奔放，行動力強",
				advice: "要注意控制情緒",
			},
			秋: {
				months: [9, 10, 11],
				trait: "成熟穩重，適合收穫",
				advice: "是展示成果的好時機",
			},
			冬: {
				months: [12, 1, 2],
				trait: "內斂深沉，善於思考",
				advice: "適合規劃和準備",
			},
		};

		const currentSeason =
			currentMonth >= 3 && currentMonth <= 5
				? "春"
				: currentMonth >= 6 && currentMonth <= 8
					? "夏"
					: currentMonth >= 9 && currentMonth <= 11
						? "秋"
						: "冬";

		const birthSeason =
			birthMonth >= 3 && birthMonth <= 5
				? "春"
				: birthMonth >= 6 && birthMonth <= 8
					? "夏"
					: birthMonth >= 9 && birthMonth <= 11
						? "秋"
						: "冬";

		const personalityTrait = zodiacTraits[zodiacAnimal];
		const seasonalInfo = seasonalAnalysis[birthSeason];
		const currentSeasonInfo = seasonalAnalysis[currentSeason];

		const assessments = {
			事業: `作為${birthYear}年出生的${zodiacAnimal}，你在理財方面${personalityTrait}。${birthSeason}季出生的人，${seasonalInfo.trait}，這些特質在職場發展中都是很好的優勢。

${currentMonth === birthMonth ? "當前正值你的生日月份，個人能量處於高峰期，是爭取晉升和展示實力的最佳時機" : `當前${currentSeason}季，${currentSeasonInfo.trait}，${currentSeasonInfo.advice}`}。結合你${zodiacAnimal}年的特質，建議你發揮自己的核心優勢來推進事業發展。`,

			財運: `作為${birthYear}年出生的${zodiacAnimal}，你在理財方面${personalityTrait}。${birthSeason}季出生的人，${seasonalInfo.trait}，這種特質會影響你的財富管理風格。

${currentMonth === birthMonth ? "生日月份是你的財運提升期，適合制定重要的理財決策" : `當前${currentSeason}季的能量與你${birthSeason}季出生的特質${birthSeason === currentSeason ? "相符，財運發展順利" : "形成互補，需要調整理財策略"}`}。建議你根據自己${zodiacAnimal}年的特質，選擇適合的投資方式。`,

			健康: `${birthYear}年${zodiacAnimal}年出生，${birthSeason}季生人的體質特點是${seasonalInfo.trait.split("，")[0]}。根據中醫理論，${birthSeason}季出生的人需要特別注意與季節相關的健康調理。

當前${currentSeason}季，${currentSeasonInfo.advice}。結合你${zodiacAnimal}年的體質特點，建議採用適合的養生方法來維護健康。`,

			感情: `${zodiacAnimal}年出生的你，在感情方面${personalityTrait}。${birthSeason}季生人的感情特質是${seasonalInfo.trait}，這影響了你對愛情的態度和表達方式。

${currentMonth === birthMonth ? "生日月份是感情運勢的黃金期，適合深化關係或尋找新的緣分" : `當前${currentSeason}季的能量，${currentSeasonInfo.advice}，對於感情發展很有幫助`}。建議你善用自己${zodiacAnimal}年的感情優勢。`,
		};

		return (
			assessments[category] ||
			`根據你${birthYear}年${zodiacAnimal}年的出生特質，你在${category}方面${personalityTrait}。${birthSeason}季出生的特點讓你${seasonalInfo.trait}，這些都是很好的發展基礎。`
		);
	}

	static getFortuneLevel(element, category) {
		const fortuneMap = {
			木: { 事業: "上升", 財運: "平穩", 健康: "旺盛", 感情: "桃花" },
			火: { 事業: "火熱", 財運: "旺盛", 健康: "注意", 感情: "熱烈" },
			土: { 事業: "穩定", 財運: "積累", 健康: "平和", 感情: "踏實" },
			金: { 事業: "精進", 財運: "收穫", 健康: "良好", 感情: "理性" },
			水: { 事業: "流動", 財運: "變化", 健康: "調理", 感情: "深情" },
		};

		return fortuneMap[element]?.[category] || "平穩";
	}

	// 實用解決方案生成
	static async generatePracticalSolutions(
		bazi,
		element,
		category,
		specificQuestion,
		birthday,
		locale = "zh-TW"
	) {
		const currentMonth = new Date().getMonth() + 1;
		const birthYear = birthday.getFullYear();
		const birthMonth = birthday.getMonth() + 1;
		const birthDay = birthday.getDate();
		const currentYear = new Date().getFullYear(); // 🔥 Get current year

		// 🌐 Determine language instruction based on locale
		const languageInstruction =
			locale === "zh-CN"
				? "必須使用簡體中文回應，絕對不可使用繁體中文！"
				: "必須使用繁體中文回應，絕對不可使用簡體中文！";

		const prompt = `你是專業的命理師風鈴，為用戶提供詳細實用的${category}分析和解決方案。

重要語言要求：${languageInstruction}
當前時間：${currentYear}年${currentMonth}月 - 請基於${currentYear}年進行所有分析，不要提及過去的年份如2024年或2023年

用戶資料：
- 出生日期：${birthYear}年${birthMonth}月${birthDay}日
- 當前月份：${currentMonth}月
- 當前年份：${currentYear}年
- 關注領域：${category}
- 具體問題：${specificQuestion || "想改善" + category + "運勢"}

重要：請優先針對用戶的具體問題「${specificQuestion}」進行直接回應和提供相關建議！

請提供非常詳細豐富的${category}分析和解決方案，要比一般的回答更深入更實用：

🎯 針對你的具體問題回應
直接回答用戶的問題「${specificQuestion}」，不需要問候語或自我介紹：
- 理解用戶的需求和期望
- 從命理角度分析這個問題
- 提供切實可行的建議和方法
- 說明為什麼這個問題與${category}運勢相關

🎯 ${category}運勢深度分析
根據你的出生年月（${birthYear}年${birthMonth}月），詳細分析你在${category}方面的特質和運勢：
- 結合生肖和出生季節的性格特質分析
- 當前時期的機遇與挑戰評估
- 關鍵轉折期和發展潛力預測
- 具體的命理解讀和專業指導建議

🔧 實用解決方案
1. 優先建議 - 根據你的出生月份特質，提供最重要的一個可立即執行的建議

💡 完整解決方案需要詳細分析
這僅是基於年月的初步建議，專屬報告中還有更多實用的${category}提升策略。若需精準定位個人化${category === "財運" ? "財庫方位、最佳投資時機" : category === "健康" ? "五行體質調理、養生時機" : category === "感情" ? "桃花方位、感情時機" : category === "事業" || category === "事業" ? "事業方位、升職時機" : "運勢方位、行動時機"}等深入指導，需要完整的出生時辰（幾點幾分）才能透過八字排盤提供個人化專業分析。

✨ 專屬報告預告
${category}運勢如風，需知風向與風力。若你希望進一步掌握更多專業建議和個人化策略，歡迎提供詳細出生時辰，小鈴會為你製作專屬${category}報告！🌟

要求：
- ${languageInstruction}
- 內容適中，約400-600字即可
- 語言要親切專業，像小鈴在一對一指導
- 重點強調需要完整出生時辰才能提供更精確分析
- 不要加入問候語如"親愛的朋友，你好！我是小鈴"，直接進入分析內容
- 當前是${currentYear}年，所有時間分析必須基於${currentYear}年，絕對不要提及2024年、2023年等過去年份
- 自然引導用戶考慮詳細報告`;

		try {
			const response = await fetch(DEEPSEEK_API_URL, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "deepseek-chat",
					messages: [{ role: "user", content: prompt }],
					temperature: 0.7,
					max_tokens: 1000,
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data = await response.json();
			return data.choices?.[0]?.message?.content || null;
		} catch (error) {
			console.error("生成實用解決方案時出錯:", error);
			return null;
		}
	}

	// 備用解決方案 - 不再使用五行分類，改用統一的豐富內容
	static getFallbackSolutions(element, category, specificQuestion) {
		const currentMonth = new Date().getMonth() + 1;

		if (category === "事業" || category === "事業") {
			let specificAnswerSection = "";
			if (
				specificQuestion &&
				specificQuestion !== "想改善事業運勢" &&
				specificQuestion !== "想改善事業運勢"
			) {
				specificAnswerSection = `🎯 針對你的問題「${specificQuestion}」
從命理角度來看，這個問題與你的職場運勢密切相關。基於你的出生月份分析，我建議你可以從心態調整和實際行動兩方面來處理這個問題。重要的是要相信自己的能力，同時也要在適當的時機展現你的專業和價值。

`;
			}

			return (
				specificAnswerSection +
				`🔍 事業運勢深度分析
基於你的出生年月分析，你在職場上展現出穩重可靠的特質，這是升職發展的重要優勢。你不是那種會急功近利的人，而是更注重長期的職業發展和技能積累。當前${currentMonth}月正值秋季，是展示工作成果和爭取升職機會的絕佳時機。

你的職場風格偏向務實和負責任，這讓你在團隊中往往扮演著重要的協調者角色。上司和同事都會信賴你的判斷力和執行能力，這為你的升職之路奠定了很好的基礎。

🔧 實用解決方案
1. 主動展示成果策略：整理過去6個月的重要工作成就，製作一份詳細的成果報告，在與主管的定期會議中主動分享這些成果，讓你的努力被看見。

💡 完整解決方案需要詳細分析
這僅是基於年月的初步建議，專屬報告中還有更多實用的事業提升策略。若需精準定位最佳升職時機、職場人際關係處理等深入指導，需要完整的出生時辰（幾點幾分）才能透過八字排盤提供個人化專業分析。

✨ 專屬報告預告
事業運勢如風，需知風向與風力。若你希望進一步掌握更多專業建議和個人化策略，歡迎提供詳細出生時辰，小鈴會為你製作專屬事業報告！🌟`
			);
		}

		if (category === "財運") {
			let specificAnswerSection = "";
			if (specificQuestion && specificQuestion !== "想改善財運運勢") {
				// 針對常見財運問題的特殊處理
				if (
					specificQuestion.includes("六合彩") ||
					specificQuestion.includes("中獎") ||
					specificQuestion.includes("彩票")
				) {
					specificAnswerSection = `🎯 針對你的問題「${specificQuestion}」
哇～想中六合彩呀！我完全理解這種渴望財富的心情呢！✨ 從風水命理角度來看，偏財運確實是存在的，但真正的財富更多來自於正財運的積累。六合彩這類偏財雖然誘人，但不應該作為主要的財富策略。

我建議你把買彩票當作小娛樂就好，真正的重點是培養良好的理財習慣和提升正財運。這樣既能享受偶爾的小驚喜，又能確保財務的穩健發展。

`;
				} else {
					specificAnswerSection = `🎯 針對你的問題「${specificQuestion}」
從命理角度來看，這個財運問題很值得深入分析。基於你的出生月份，我發現你在理財方面有自己的獨特優勢。重要的是要找到適合你的財富累積方式，並在合適的時機做出明智的財務決策。

`;
				}
			}

			return (
				specificAnswerSection +
				`🔍 財運運勢深度分析
根據你的出生年月分析，你在財富管理方面具備天生的謹慎和穩健特質。你不是那種會盲目投資或衝動消費的人，而是更傾向於長期規劃和穩定增長。當前${currentMonth}月正值收穫季節，是檢視財務狀況和制定理財策略的最佳時機。

你的理財風格偏向保守穩健，雖然可能不會有爆發性的財富增長，但能夠確保資產的穩定積累。這種特質在當前經濟環境下是非常明智的，能夠幫你避免很多不必要的風險。

🔧 實用解決方案
1. 收入提升策略：考慮發展一項與你專業相關的副業，如諮詢服務、線上課程或自由接案，利用你的專業知識建立額外收入來源。

💡 完整解決方案需要詳細分析
這僅是基於年月的初步建議，專屬報告中還有更多實用的財運提升策略。若需精準定位個人財庫方位、最佳投資時機等深入指導，需要完整的出生時辰（幾點幾分）才能透過八字排盤提供個人化專業分析。

✨ 專屬報告預告
財運如風，需知風向與風力。若你希望進一步掌握更多專業建議和個人化策略，歡迎提供詳細出生時辰，小鈴會為你製作專屬財運報告！🌟`
			);
		}

		if (category === "健康") {
			let specificAnswerSection = "";
			if (specificQuestion && specificQuestion !== "想改善健康運勢") {
				specificAnswerSection = `🎯 針對你的問題「${specificQuestion}」
從健康運勢的角度來看，這個問題反映了你對身心健康的關注，這是很好的。基於你的出生月份分析，你的體質有其特點，需要特別注意某些方面的調理。重要的是要保持身心平衡，並採用適合你體質的養生方法。

`;
			}

			return (
				specificAnswerSection +
				`🔍 健康運勢深度分析
根據你的出生年月分析，你的體質整體上是比較穩定健康的。你不是那種容易生病或體質虛弱的人，但也需要注意保持良好的生活習慣來維護健康。當前${currentMonth}月正值季節轉換期，是調理體質和建立健康習慣的最佳時機。

🔧 實用解決方案
1. 作息規律建立：制定固定的睡眠時間，每天11點前就寢，7點起床。保持充足的睡眠對你的體質非常重要。

💡 完整解決方案需要詳細分析
這僅是基於年月的初步建議，專屬報告中還有更多實用的健康調理策略。若需精準的五行體質養生計劃、個人化飲食調理等深入指導，需要完整的出生時辰（幾點幾分）才能透過八字排盤提供個人化專業分析。

✨ 專屬報告預告
健康運勢如風，需知風向與風力。若你希望進一步掌握更多專業建議和個人化策略，歡迎提供詳細出生時辰，小鈴會為你製作專屬健康報告！🌟`
			);
		}

		if (category === "感情") {
			let specificAnswerSection = "";
			if (specificQuestion && specificQuestion !== "想改善感情運勢") {
				specificAnswerSection = `🎯 針對你的問題「${specificQuestion}」
從感情運勢角度來看，這個問題反映了你內心對感情的渴望和關注。基於你的出生月份分析，你在感情方面有著獨特的魅力和吸引力。重要的是要相信自己的感情價值，並在適當的時機展現真實的自我。

`;
			}

			return (
				specificAnswerSection +
				`🔍 感情運勢深度分析
根據你的出生特質分析，你在感情方面是一個非常專一和認真的人。你不會輕易開始一段關係，但一旦投入就會全心全意。這種特質讓你在感情中能夠建立深層而穩定的連結。

🔧 實用解決方案
1. 情感表達技巧：學習更好地表達自己的情感和需求，通過言語和行動讓對方感受到你的愛意。

💡 完整解決方案需要詳細分析
這僅是基於年月的初步建議，專屬報告中還有更多實用的感情提升策略。若需精準的桃花運時期、最適合的伴侶類型等深入指導，需要完整的出生時辰（幾點幾分）才能透過八字排盤提供個人化專業分析。

✨ 專屬報告預告
感情運勢如風，需知風向與風力。若你希望進一步掌握更多專業建議和個人化策略，歡迎提供詳細出生時辰，小鈴會為你製作專屬感情報告！🌟`
			);
		}

		// 默認返回
		return `🔍 ${category}運勢深度分析
根據你的出生年月分析，你在${category}方面具備穩定發展的潛力。你是一個做事認真負責的人，不會輕易放棄，這種特質讓你在任何領域都能取得不錯的成果。

🔧 實用解決方案
1. 目標設定：為自己在${category}方面設定清晰具體的目標，並制定達成計劃。

💡 完整解決方案需要詳細分析
這僅是基於年月的初步建議，專屬報告中還有更多實用的${category}提升策略。若需精準的行動時機、個人化能量調理等深入指導，需要完整的出生時辰（幾點幾分）才能透過八字排盤提供個人化專業分析。

✨ 專屬報告預告
${category}運勢如風，需知風向與風力。若你希望進一步掌握更多專業建議和個人化策略，歡迎提供詳細出生時辰，小鈴會為你製作專屬${category}報告！🌟`;
	}

	// 輔助方法
	static getWealthSuggestion(element) {
		const suggestions = {
			木: "長期投資和綠色能源相關項目",
			火: "短期投資和科技股票",
			土: "房地產和定期存款",
			金: "貴金屬和穩健基金",
			水: "靈活理財和流動性投資",
		};
		return suggestions[element] || "平衡投資";
	}

	static getHealthFocus(element) {
		const focuses = {
			木: "肝膽和筋骨",
			火: "心臟和血液循環",
			土: "脾胃和消化系統",
			金: "肺部和呼吸系統",
			水: "腎臟和泌尿系統",
		};
		return focuses[element] || "整體平衡";
	}

	static getLoveStyle(element) {
		const styles = {
			木: "自然真誠，喜歡在戶外約會",
			火: "熱情主動，浪漫而直接",
			土: "踏實穩重，重視承諾",
			金: "理性分析，注重精神交流",
			水: "溫柔體貼，情感深沉",
		};
		return styles[element] || "平和自然";
	}

	static getCurrentLoveStatus(element, month) {
		// 根據月份和五行判斷當前感情狀況
		const status = {
			木: month >= 3 && month <= 5 ? "正值桃花期" : "感情平穩發展",
			火: month >= 6 && month <= 8 ? "感情火熱" : "需要溫和經營",
			土: "四季皆宜，感情穩定",
			金: month >= 9 && month <= 11 ? "感情收穫期" : "理性思考階段",
			水: month >= 12 || month <= 2 ? "深度交流期" : "感情需要耐心",
		};
		return status[element] || "平穩發展";
	}
}

export default EnhancedInitialAnalysis;
