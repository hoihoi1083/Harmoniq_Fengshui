// 財運發展通用模型 Prompt Generator

export function generateWealthFortunePrompt(userInfo, wuxingData) {
	const birthDate = new Date(userInfo.birthDateTime);
	const currentYear = new Date().getFullYear();
	const age = currentYear - birthDate.getFullYear();

	// Extract essential bazi information
	const yearStem = wuxingData.yearStem || "壬";
	const yearBranch = wuxingData.yearBranch || "子";
	const monthStem = wuxingData.monthStem || "癸";
	const monthBranch = wuxingData.monthBranch || "丑";
	const dayStem = wuxingData.dayStem || "壬";
	const dayBranch = wuxingData.dayBranch || "子";
	const hourStem = wuxingData.hourStem || "庚";
	const hourBranch = wuxingData.hourBranch || "申";

	const dayMasterElement = wuxingData.dayStemWuxing || "水";
	const gender = userInfo.gender || "男";

	const prompt = `# 財運發展通用模型分析

## 用戶基本信息
- 姓名：${userInfo.name}
- 性別：${gender}
- 出生日期：${userInfo.birthDateTime}
- 當前年齡：${age}歲

## 八字信息
- 年柱：${yearStem}${yearBranch}
- 月柱：${monthStem}${monthBranch}
- 日柱：${dayStem}${dayBranch}（日主：${dayStem}${dayMasterElement}）
- 時柱：${hourStem}${hourBranch}

## 分析要求

請基於以上八字信息，按照以下JSON格式生成詳細的財運分析：

\`\`\`json
{
  "summary": {
    "title": "一句話總結財運命格特點（不超過12字）",
    "description": "結合八字結構分析財運獲取方式和總體特徵，150字左右"
  },
  "threeStages": {
    "奠基期": {
      "title": "奠基期",
      "ageRange": "具體年齡範圍",
      "fortune": "對應大運",
      "content": {
        "phase1": {
          "name": "第一階段大運名稱（含年份區間）",
          "description": "該大運期間財運特點分析（2-3句話）",
          "keyYear": "關鍵年份及其重要事件預測（可2-3句話說明）",
          "trapYear": "需要特別注意的危險年份及風險提醒（可2-3句話說明）"
        },
        "phase2": {
          "name": "第二階段大運名稱", 
          "description": "該大運期間財運特點分析（2-3句話）",
          "warning": "重要警示年份及注意事項（可2-3句話說明）"
        }
      }
    },
    "爆發期": {
      "title": "爆發期",
      "ageRange": "具體年齡範圍",
      "fortune": "對應大運",
      "content": {
        "description": "財運爆發期的核心特徵（2-3句話）",
        "keyYear": "最佳投資年份及具體收益預測（可2-3句話說明）",
        "industries": "最適合的核心投資領域（可簡述原因或2-3句話）",
        "peakYear": "財富峰值年份及投資建議（可2-3句話說明）"
      }
    },
    "守成期": {
      "title": "守成期", 
      "ageRange": "具體年齡範圍",
      "fortune": "對應大運",
      "content": {
        "description": "守成期財運管理特點（2-3句話）",
        "keyYear": "重要理財決策年份（可2-3句話說明）",
        "avoidIndustries": "需要避免的投資領域（可簡述原因或2-3句話）"
      }
    }
  },
  "wealthRules": {
    "assetAllocation": {
      "title": "資產配比",
      "realEstate": "不動產投資建議及比例",
      "preciousMetals": "貴金屬投資建議及比例", 
      "cash": "現金流動性管理建議及比例"
    },
    "partnerships": {
      "title": "合作禁忌",
      "zodiacA": {
        "animal": "不宜合作的生肖A",
        "description": "基於八字分析為什麼不宜合作"
      },
      "zodiacB": {
        "animal": "不宜合作的生肖B", 
        "description": "基於八字分析為什麼不宜合作"
      }
    },
    "wealthDirection": {
      "title": "催財方位",
      "location": "具體的催財方位",
      "description": "該方位的風水布局建議",
      "warning": "注意事項和禁忌"
    }
  }
}
\`\`\`

## 分析重點：
1. 基於八字結構分析財星位置和強弱
2. 結合大運流年推算三個主要財運階段
3. 提供具體的投資建議和風險提醒
4. 給出實用的風水催財方位指導
5. 所有預測都要有具體的八字理論依據
6. 各階段底下的每個要點（如關鍵年份、致命陷阱、核心領域等）請盡量以 2–3 句話說明，使內容完整可讀。

請確保分析內容專業、準確，符合傳統八字命理學理論。`;

	return prompt;
}

// 生成簡化版本的 Prompt（用於測試）
export function generateSimpleWealthPrompt(userInfo, wuxingData) {
	return `分析${userInfo.name}的財運發展，生成包含奠基期、爆發期、守成期的三階段財運分析，並提供資產配比、合作禁忌、催財方位等實用建議。`;
}
