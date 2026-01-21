# GanZhi AI Content Format Guide

## ✅ Correct Format for AI-Generated Content

The AI must generate content in **exactly** this structure for proper display:

```markdown
### 1. 【流年干支作用】

分析2026年丙午對原局的整體作用：
您的日主為甲木，生於寅月，木氣正旺，為建祿格。八字身強...

### 2. 【天干丙效應】

天干丙為**食神**
天干丙觸發三重效應

1. **食神生財**：丙火食神透出天干，直接生助您日支戌土（偏財）...
2. **合絆辛官**：流年丙火與您時柱天干辛金「正官」相合（丙辛合）...
3. **洩秀過度**：丙火強力洩耗甲木日主。雖然身強喜洩...

實際表現
在財運領域的具體表現：

- **上半年（尤其明年農曆4月巳火、5月午火）**：食傷能量達到高峰...
- **實際影響**：財運有明顯的「主動創造」特徵，而非被動等待...
- **可能挑戰**：丙辛合，需注意合約、文書上的細節疏漏...

### 3. 【地支午效應】

地支午為**傷官**
地支午觸發三重效應

1. **寅午戌三合火局**：流年午火與您月支寅木、日支戌土，形成...
2. **午未六合土**：流年午火與您時支未土「正財」相合...
3. **傷官旺相**：地支傷官代表內在的野心、不滿與冒險精神...

實際表現
在財運領域的具體表現：

- **關鍵時間點在明年農曆5月（午月，約國曆6月）**：三合局力量最強...
- **實際影響**：財運有「爆發」潛力，但過程伴隨高風險...
- **可能挑戰**：傷官合動財星，需防範因判斷過於主觀樂觀...

### 4. 【注意事項】

風險
針對財運領域可能出現的具體風險，包括：

- **時間節點**：需特別警惕**明年農曆7月（申月，約國曆8月）**...
- **困難障礙**：全年火旺，切忌因一時衝動進行超出自身承受能力...
- **避免行為**：避免與朋友、同事進行不清晰的合夥投資...

建議
針對財運領域的具體建議：

- **最佳行動時機**：將主要財務規劃與行動集中在**明年春季...**
- **化解不利**：面對丙辛合官，建議將新想法、新財路與正職工作...
- **具體步驟**：因財庫被合動，今年是設立清晰財務目標...

總結
結合八字和流年特點，總結財運在2026年的整體運勢走向...
2026年對您而言是「機遇與風險並存」的財運年份...
```

## 🔑 Key Structure Requirements

### Section 2 & 3 Must Include:

1. **Title line**: `天干X為**十神**` or `地支X為**十神**`
2. **Subtitle**: `天干X觸發三重效應` or `地支X觸發三重效應`
3. **3 Numbered Effects**:
    ```
    1. **效應名稱**：詳細說明...
    2. **效應名稱**：詳細說明...
    3. **效應名稱**：詳細說明...
    ```
4. **實際表現 subsection** (CRITICAL - previously missing):
    ```
    實際表現
    在XXX領域的具體表現：
    - **時間點**: 具體時間...
    - **實際影響**: 具體影響...
    - **可能挑戰**: 具體挑戰...
    ```

### Section 4 Must Include:

1. **風險** subsection
2. **建議** subsection
3. **總結** subsection

## ❌ Common Mistakes to Avoid

1. ❌ Missing "實際表現" subsection in Section 2 or 3
2. ❌ Placing all practical results at the end instead of within each section
3. ❌ Not using bold `**text**` for effect titles
4. ❌ Inconsistent numbering (1., 2., 3.)
5. ❌ Missing the 十神 relationship in title line

## ✅ What Changed

**Before**:

- AI generated "實際表現" content mixed with effect descriptions
- No clear separation between TianGan and DiZhi practical results

**After**:

- Each section (TianGan & DiZhi) now has its own "實際表現" subsection
- Frontend properly parses and displays each section's practical results separately
- Better organization and readability

## 📊 Frontend Display Structure

```
[流年干支作用] - Full width description

[天干 / 地支 Toggle Buttons]

When "天干" selected:
├── Title: "天干X觸發三重效應"
├── 3 Cards showing the 3 effects
└── 實際表現 section (from tianGan.practicalResults)

When "地支" selected:
├── Title: "地支X觸發三重效應"
├── 3 Cards showing the 3 effects
└── 實際表現 section (from diZhi.practicalResults)

[Overall 實際表現] - Optional global section

[注意事項]
├── 風險
├── 建議
└── 總結
```

## 🎯 Testing Your AI Content

To verify your AI-generated content will display correctly:

1. ✅ Check Section 2 has "實際表現" before Section 3
2. ✅ Check Section 3 has "實際表現" before Section 4
3. ✅ Verify each "實際表現" has bullet points or detailed content
4. ✅ Ensure all 3 numbered effects are present in both sections
5. ✅ Confirm 風險/建議/總結 are all present in Section 4

---

**Date**: 2026-01-20  
**Updated by**: GitHub Copilot  
**Status**: ✅ Implementation Complete
