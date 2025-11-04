// 🎭 自然對話響應生成器
// Natural Conversation Response Generator

class NaturalConversationGenerator {
	constructor() {
		this.conversationStyles = {
			supportive: {
				openings: [
					"哎呀，聽起來你遇到了一些挑戰呢...",
					"我能理解你現在的心情...",
					"這確實是個讓人煩惱的問題...",
				],
				transitions: [
					"不過別擔心，",
					"其實從命理角度來看，",
					"讓小鈴來幫你分析一下，",
				],
				encouragements: [
					"每個困難都是成長的機會！",
					"運勢總是在變化的，現在的低潮不會持續太久",
					"相信自己，好事正在來的路上！",
				],
			},
			professional: {
				openings: [
					"根據你提供的資訊，",
					"從專業角度分析，",
					"這是個很好的問題，",
				],
				explanations: [
					"在風水命理中，",
					"傳統理論認為，",
					"根據八字分析，",
				],
				conclusions: ["綜合來看，", "因此建議，", "最佳策略是"],
			},
			friendly: {
				greetings: ["哇！", "太好了！", "很棒的問題呢！"],
				exclamations: ["✨", "🌟", "💫", "🔮", "💕", "🌸", "🎯", "💡"],
				connectors: ["順便說一下，", "對了，", "另外，"],
			},
		};

		this.responseTemplates = {
			bazi_analysis: {
				introduction: [
					"哇！你直接提供八字，太專業了！✨",
					"看到你的八字命盤，讓我來為你詳細分析！",
					"根據你提供的八字「{bazi}」，我有一些有趣的發現...",
				],
				analysis_intro: [
					"從你的命盤來看：",
					"你的八字顯示：",
					"命理分析結果：",
				],
			},
			contextual_problem: {
				empathy: [
					"聽到這個情況，我很能理解你的感受...",
					"這確實是個讓人困擾的問題...",
					"生活中遇到這樣的挑戰很不容易...",
				],
				hope: [
					"不過，每個結束都是新開始的機會！",
					"困難往往是轉機的前兆",
					"從命理角度來看，這可能是運勢轉換的信號",
				],
			},
			knowledge_explanation: {
				enthusiasm: [
					"哇！你問了個很棒的問題！",
					"這個我最拿手了！",
					"很高興能和你分享這個知識！",
				],
				teaching: [
					"讓我來詳細解釋一下：",
					"簡單來說：",
					"你可以這樣理解：",
				],
			},
		};
	}

	// 主要生成函數
	generateNaturalResponse(analysisResult, context = {}) {
		const { analysisType } = analysisResult;

		switch (analysisType) {
			case "bazi_direct":
				return this.generateBaziResponse(analysisResult, context);
			case "contextual":
				return this.generateContextualResponse(analysisResult, context);
			case "knowledge_explanation":
				return this.generateKnowledgeResponse(analysisResult, context);
			case "service_explanation":
				return this.generateServiceResponse(analysisResult, context);
			default:
				return this.enhanceExistingResponse(
					analysisResult.response,
					context
				);
		}
	}

	// 生成八字分析回應
	generateBaziResponse(analysisResult, context) {
		const { baziData, detectedTopic } = analysisResult;
		const introduction = this.randomSelect(
			this.responseTemplates.bazi_analysis.introduction
		);

		let response = introduction.replace("{bazi}", baziData.baziString);

		// 添加專業分析
		response += `\n\n📊 **你的命盤組合：**\n`;
		response += `年柱：${baziData.pillars.year}  月柱：${baziData.pillars.month}\n`;
		response += `日柱：${baziData.pillars.day}  時柱：${baziData.pillars.hour}\n`;

		// 根據關注領域提供分析
		if (detectedTopic === "財運") {
			response += this.generateWealthBaziAnalysis(baziData);
		} else if (detectedTopic === "感情") {
			response += this.generateLoveBaziAnalysis(baziData);
		} else {
			response += this.generateGeneralBaziAnalysis(baziData);
		}

		// 添加行動呼籲
		response += this.generateActionCall(detectedTopic);

		return response;
	}

	// 生成情境回應
	generateContextualResponse(analysisResult, context) {
		const { contextData } = analysisResult;
		const { problem, birthday, problemType } = contextData;

		// 情感支持開頭
		const empathy = this.randomSelect(
			this.responseTemplates.contextual_problem.empathy
		);
		let response = `${empathy} 🤗\n\n`;

		// 分析生日信息
		const birthYear = this.extractYear(birthday);
		const age = new Date().getFullYear() - birthYear;
		const lifeStage = this.getLifeStage(age);

		response += `從你的生日 **${birthday}** 來看，你現在${age}歲，正值${lifeStage}的重要階段！\n\n`;

		// 根據問題類型提供針對性建議
		response += this.generateProblemSpecificAdvice(
			problem,
			problemType,
			age
		);

		// 添加希望和鼓勵
		const hope = this.randomSelect(
			this.responseTemplates.contextual_problem.hope
		);
		response += `\n💫 ${hope}\n\n`;

		// 服務引導
		response += this.generateServiceGuidance(problemType);

		return response;
	}

	// 生成知識解釋回應
	generateKnowledgeResponse(analysisResult, context) {
		const { knowledgeData } = analysisResult;
		const { term } = knowledgeData;

		const enthusiasm = this.randomSelect(
			this.responseTemplates.knowledge_explanation.enthusiasm
		);
		const teaching = this.randomSelect(
			this.responseTemplates.knowledge_explanation.teaching
		);

		return analysisResult.response; // 保持原有的知識回應，已經很好了
	}

	// 生成服務說明回應
	generateServiceResponse(analysisResult, context) {
		return analysisResult.response; // 保持原有的服務回應
	}

	// 增強現有回應
	enhanceExistingResponse(originalResponse, context) {
		if (!originalResponse) return originalResponse;

		// 添加更多表情符號和自然語言
		let enhanced = originalResponse;

		// 如果回應太過正式，增加一些親和力
		if (!enhanced.includes("小鈴") && !enhanced.includes("我")) {
			enhanced = enhanced.replace(/^/, "小鈴來幫你分析一下！\n\n");
		}

		// 確保有適當的表情符號
		if (!/[✨🌟💫🔮💕🌸🎯💡]/.test(enhanced)) {
			enhanced += " ✨";
		}

		return enhanced;
	}

	// 輔助方法
	randomSelect(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	extractYear(birthday) {
		const match = birthday.match(/(\d{4})/);
		return match ? parseInt(match[1]) : new Date().getFullYear() - 25;
	}

	getLifeStage(age) {
		if (age < 25) return "青春活力";
		if (age < 35) return "事業起步";
		if (age < 45) return "事業發展";
		if (age < 55) return "成熟穩重";
		return "智慧人生";
	}

	generateWealthBaziAnalysis(baziData) {
		return `\n💰 **財運分析：**
• 命中金氣較旺，適合金融、科技等現代產業
• 財星透出明顯，有不錯的賺錢天賦
• 目前大運走向，整體財運呈上升趨勢

**具體建議：**
🎯 投資策略：穩健型為主，可考慮基金定投
🌟 事業方向：發揮分析判斷能力，適合管理職
💡 開運方法：辦公桌放黃色小物件，錢包使用金色系`;
	}

	generateLoveBaziAnalysis(baziData) {
		return `\n💕 **感情運勢：**
• 你的桃花星位於月柱，感情運勢很不錯
• 命中帶有深情特質，容易遇到真心對象
• 今年感情運勢整體向好，特別是下半年

**感情建議：**
🌸 最佳桃花期：春秋兩季，特別注意3月和9月
🎭 理想對象：溫和穩重、有共同興趣的人
💫 開運tips：多穿粉色或淺藍色，增強親和力`;
	}

	generateGeneralBaziAnalysis(baziData) {
		return `\n🌟 **整體運勢：**
• 你的命格顯示有很好的適應能力
• 天賦在於分析判斷和人際協調
• 人生運勢呈波浪式上升，晚年運特別好

**發展建議：**
🎯 適合領域：管理、諮詢、教育、服務業
💪 能力發揮：善用你的組織協調天賦
⭐ 注意時機：重要決定宜在上午做出`;
	}

	generateProblemSpecificAdvice(problem, problemType, age) {
		const advice = {
			work_problem: `🎯 **關於工作問題：**
這個年齡遇到職業轉換很正常，其實是個重新定位的好機會！
• 你的年紀正適合學習新技能或轉換跑道
• 建議考慮線上工作或新興產業
• 面試穿著建議：深藍色或灰色增加專業感`,

			relationship_issue: `💕 **關於感情問題：**
${age}歲的感情經歷都是成長的養分，別太擔心！
• 這個階段重點是提升自己，好的感情自然會來
• 多參與興趣活動，容易遇到合適的人
• 心態調整：保持開放但不急躁`,

			financial_concern: `💰 **關於財務問題：**
經濟困難是暫時的，重要的是建立正確的理財觀念！
• 優先處理必要支出，減少不必要消費
• 考慮發展副業或提升技能增加收入
• 投資自己永遠是最好的投資`,

			health_worry: `🌿 **關於健康問題：**
身體是革命的本錢，要好好照顧自己！
• 規律作息比補品更重要
• 適度運動，找到適合自己的方式
• 定期體檢，預防勝於治療`,
		};

		return (
			advice[problemType] ||
			`🌟 面對這個問題，重要的是保持正面心態和積極行動！`
		);
	}

	generateServiceGuidance(problemType) {
		const mappings = {
			work_problem: "工作事業",
			relationship_issue: "感情運勢",
			financial_concern: "財運分析",
			health_worry: "健康運勢",
		};

		const serviceName = mappings[problemType] || "整體運勢";

		return `🔮 **專業建議：**
想要更詳細的${serviceName}分析和解決方案嗎？

我的專業報告包含：
📊 深度命理分析
🎯 個人化改善建議
🏠 相關風水調整
⭐ 最佳行動時機

只需要告訴我你的性別，就能為你生成專屬的${serviceName}指導報告！`;
	}

	generateActionCall(topic) {
		return `\n\n🎯 **下一步建議：**
想要更深入的${topic}分析嗎？我可以為你製作詳細報告，包含：
📈 運勢走向預測
🏠 相關風水佈局
💡 具體改善方案
⏰ 重要時機把握

現在就開始為你準備專業分析報告嗎？`;
	}
}

module.exports = NaturalConversationGenerator;
