# AI Prompt and Page 4 Organization Update

## Changes Made

### 1. AI Prompt Update (ganzhi-analysis/route.js)

Updated the **流年實際表現** section prompt to generate more organized, structured content:

#### New Structure Requirements:

**時間點與變化** (Time Points and Changes):

- Now divided into 4 clear time periods:
    - 年初（1-3月）- Early year
    - 年中（4-6月）- Mid year
    - 下半年（7-9月）- Second half
    - 年末（10-12月）- Year end

**Format Requirements:**

1. Each time period must have:

    - Period title: `年初（1-3月）：`
    - Description paragraph explaining the trends and characteristics
    - `💡 實際場景：` followed by 2-3 specific actionable suggestions with exact months

2. **影響程度與形式** (Impact Level and Form):

    - Overall description of impact degree and manifestation
    - `💡 實際場景：` with specific examples

3. **可能情況與挑戰** (Possible Situations and Challenges):
    - List of potential situations and challenges throughout the year
    - `💡 實際場景：` with specific month-based advice

#### Example Format:

```
在事業領域的具體表現：

- **時間點與變化**：

年初（1-3月）：描述此時期的運勢特點和變化趨勢
💡 實際場景：1月適合制定年度計劃，2月留意新合作機會，3月可主動爭取升遷

年中（4-6月）：描述此時期的運勢特點和變化趨勢
💡 實際場景：4月宜穩健保守，5月適合學習進修，6月注意人際溝通

下半年（7-9月）：描述此時期的運勢特點和變化趨勢
💡 實際場景：7月可能有財務波動需謹慎，8月適合調整策略，9月關注健康

年末（10-12月）：描述此時期的運勢特點和變化趨勢
💡 實際場景：10月評估全年成果，11月處理重要事務，12月規劃明年方向

- **影響程度與形式**：
描述整體影響的程度和具體表現方式
💡 實際場景：工作壓力可能增加30%，需提前做好時間管理；人際互動頻繁，建議保持積極態度

- **可能情況與挑戰**：
列出全年可能遇到的主要情況或挑戰
💡 實際場景：3月可能有職位調動機會需慎重評估，7月注意健康檢查，11月可能面臨重大決策
```

### 2. Page 4 Parser Update (Page4_2026Overview.jsx)

Updated the parser to handle the new structured format:

#### Changes:

1. **Time Period Detection**:

    - New regex: `/(?:年初|年中|下半年|年末|\*\*明年\*\*[^：]*?)（\d+-?\d*月）：?/g`
    - Matches standardized time period markers

2. **Content Parsing**:

    - Splits content by `💡 實際場景：` marker
    - Separates main description from scenario advice
    - Handles multiple scenario items separated by commas

3. **Rendering Updates**:
    - Time period titles now use theme color (instead of gray)
    - Main content is conditionally rendered (only if exists)
    - All scenarios combined in a single highlighted box
    - Scenarios joined with Chinese comma `，` for better readability
    - Added background color `#f9f9f9` with rounded corners for scenario box
    - Bold `💡 實際場景：` label with `fontWeight: 900`

#### Visual Improvements:

- **Before**: Each scenario as separate paragraph, inconsistent formatting
- **After**:
    - Clear time period headers in theme color
    - Organized description text
    - Single highlighted box with all scenarios
    - Better spacing and visual hierarchy

### 3. Benefits

1. **Consistency**: AI now generates predictable, structured content
2. **Organization**: Clear 4-period division makes content easier to scan
3. **Actionability**: Each period has specific month-based advice
4. **Visual Clarity**: Better formatting with highlighted scenario boxes
5. **Maintainability**: Simpler parser logic, easier to debug

### 4. What to Test

After regenerating AI content, verify:

- [ ] All 4 time periods appear (年初, 年中, 下半年, 年末)
- [ ] Each period has description + 💡 實際場景
- [ ] Scenarios are properly formatted with specific months
- [ ] 影響程度與形式 section has content + scenarios
- [ ] 可能情況與挑戰 section has content + scenarios
- [ ] Visual formatting looks clean and organized

### 5. Files Modified

1. `/src/app/api/ganzhi-analysis/route.js` - Lines 331-360 (AI prompt)
2. `/src/app/[locale]/admin/print-report/view/components/Page4_2026Overview.jsx` - Lines 75-115 (parser), 265-310 (rendering)

## Next Steps

To see the improved organization:

1. Generate new AI analysis (the updated prompt will be used automatically)
2. View the print report Page 4
3. Content should now be clearly organized with 4 time periods and structured scenarios
