# Couple Report → Print Report: Analysis & Page Division

## 1. Couple report (web) – format and content

### 1.1 Where it lives
- **Page:** `src/app/[locale]/couple-report/page.jsx`
- **Data:** URL params (birthday, birthday2, gender, gender2, time, time2, problem) or saved report by `sessionId` (from `/api/couple-complete-report`).
- **Saved report structure** (used for historical view and for print data source):
  - `metadata`: birthday, birthday2, gender, gender2, problem, reportGeneratedAt
  - `annualAnalysis`, `mingJuAnalysis`, `godExplanation`, `seasonAnalysis`, `coreSuggestions`, `problemSolution`

### 1.2 Two tabs and components (in order)

**Tab 1 – 姻緣合盤流年分析報告 (analysis)**

| Order | Component | Content |
|-------|-----------|--------|
| 1 | **CoupleAnnualAnalysis** | 流年合盤：雙方八字、五行、年度策略、契合度、元素互動建議 |
| 2 | **CoupleMingJu** | 命局分析：雙方日主、命局特質、關係中的角色（類似 fortune 的 MingJu，雙人版） |
| 3 | ~~CoupleGodExplain~~ | （目前註解掉）十神/用神解釋 |
| 4 | **CoupleSeason** | 關鍵季節：四季流年對感情的影響（雙人） |
| 5 | **CoupleCoreSuggestion** | 核心建議：開運建議 + 禁忌行為（感情向） |
| 6 | **CoupleOverallSummary** | 關係總結：破關成蝶風格的年終總結 |

**Tab 2 – 專屬問題解決方案 (solution)**

| Order | Component | Content |
|-------|-----------|--------|
| 7 | **EnhancedCoupleSpecificProblemSolution** | 用戶問題 + 分類解決方案（感情降溫 / 特殊情境 / 禁忌破解等） |

So the **full couple report** = Tab1 (6 blocks) + Tab2 (1 block). All of this should be reflected in the print version.

---

## 2. Fortune print-report (admin) – how it works

### 2.1 Entry and flow
- **Selection:** `/[locale]/admin/print-report` → choose 財運/健康/感情/事業.
- **Input:** `/[locale]/admin/print-report/input?concern=xxx` → enter name, birthday, birthTime, question, productName.
- **View:** `/[locale]/admin/print-report/view?concern=...&name=...&birthday=...&birthTime=...&question=...&productName=...`  
  View page loads all data from APIs (no sessionId); then renders A4 pages and supports **列印報告** (window.print).

### 2.2 Fortune print page structure (view/page.jsx)
- **Cover** → **Page1** → **MingJu (P2–P3)** → **Page4** → **Page7** → **Page8_9** → **Page10**
- Each content block is a single **A4 page** (or 2 pages for MingJu): same structure every time.

| Page | Component | Content |
|------|-----------|--------|
| Cover | CoverPage | 個人化訂製專屬 · {concern}報告；產品名稱；日期；命理報告水印 |
| 1 | Page1_BasicAnalysis | 基礎分析：姓名、生日、時辰、八字四柱、問題、AI 重點分析 |
| 2–3 | MingJu (print) | 日主特性 + 財星/綜合定位 |
| 4 | Page4_2026Overview | 流年/干支分析 |
| 7 | Page7_Seasons | 關鍵季節（四季） |
| 8–9 | Page8_9_Recommendations | 開運建議 + 禁忌行為 |
| 10 | Page10_Summary | 破關成蝶，格局煥新 |

### 2.3 Fortune print styling (to replicate for couple)
- **Wrapper:** `className="page-break"` + A4 size: `width: 210mm`, `minHeight: 297mm`, `maxHeight: 297mm`, `overflow: hidden`.
- **Padding:** e.g. `15mm 20mm` or `px-12 py-10`; some pages use `print-report-page1`, `page-7-seasons`, `page-10-summary` for specific spacing.
- **Typography:** `var(--font-noto-serif-sc), 'Noto Serif SC', serif`; title color from `getConcernColor(concern)` (感情 = #D94075 或類似).
- **Print CSS:** `@media print` hides `.no-print`, uses `print-color-adjust: exact`, `@page { size: A4; margin: 0; }`.
- **Screen preview:** `.page-break` has shadow, 210mm width, min/max height 297mm so each block looks like one A4.

So: **one logical section = one (or two) fixed-height A4 “page-break” divs**, with the same layout and class pattern.

---

## 3. Suggested couple print report – page division (with cover)

Keep the same **fortune-print style** (A4, page-break, Noto Serif SC, concern color) and map couple content like this:

| Page | Suggested title / content | Data source | Note |
|------|----------------------------|-------------|------|
| **Cover** | 個人化訂製專屬 · **姻緣合盤報告**（或「感情報告」）；產品；日期 | - | Same layout as CoverPage, couple theme color #D91A5A |
| **1** | **基礎分析** | Two names, two birthdays, two birth times, 想問的問題；雙方八字四柱；簡短重點（可從 annual 或 question 來） | Like Page1_BasicAnalysis but two columns / two blocks for 2 people |
| **2** | **命局分析（一）** | CoupleMingJu – 日主特性 / 命局特質（男方） | Print mode of existing MingJu or new wrapper |
| **3** | **命局分析（二）** | CoupleMingJu – 日主特性 / 命局特質（女方）；或「關係中的角色」 | Same component, second person + relation |
| **4** | **流年合盤** | CoupleAnnualAnalysis – 契合度、元素互動、年度策略摘要 | One A4; if too long split to 4a/4b |
| **5** | **關鍵季節** | CoupleSeason – 四季對感情的影響 | Same structure as Page7_Seasons, couple data |
| **6** | **核心建議** | CoupleCoreSuggestion – 開運建議 + 禁忌 | Same structure as Page8_9_Recommendations, couple data |
| **7** | **關係總結** | CoupleOverallSummary – 破關成蝶風格 | Same structure as Page10_Summary, couple color |
| **8** | **專屬問題解決方案** | EnhancedCoupleSpecificProblemSolution – 問題 + 分類解決方案 | One page; if very long split to 8a 問題診斷、8b 解決方案 |

**Total: 1 cover + 8 content pages** (or 9 if you split 4 or 8 into two pages).

---

## 4. How to make couple print “same as” fortune print

### 4.1 Structure
- Add **admin print-report for couple** (e.g. `/[locale]/admin/print-report/couple/...` or add “姻緣” on existing print-report selection and branch by type).
- **Input:** Two birthdays, two times, two genders, 想問的問題, product name (optional). No need for sessionId if you want “fill form → generate print” like fortune; optionally support sessionId to load saved report.
- **View:** One route that receives params (or sessionId), loads the same data the web couple-report uses (annual, mingJu, season, coreSuggestion, overallSummary, problemSolution), then renders the 8–9 pages in order.

### 4.2 Styling (align with fortune)
- Reuse **same CSS pattern**: `.page-break`, `210mm × 297mm`, `15mm 20mm` padding, `overflow: hidden`.
- Reuse **same typography**: Noto Serif SC, same heading sizes (e.g. 34px 基礎分析, 48px 大標).
- **Theme color:** Use couple color (e.g. `#D91A5A` or `getConcernColor('感情')`) for titles and accents instead of other concerns.
- Reuse **same print `<style jsx global>`** from fortune view: `.no-print`, `@page`, `print-color-adjust`, and any `.print-report-page*` overrides you need for couple (e.g. `.print-report-couple-page1`).
- **Cover:** Copy CoverPage layout; replace “{concern}報告” with “姻緣合盤報告” and product/date as now.

### 4.3 Data loading (view)
- **Option A (like fortune):** View has no sessionId; only URL params. Call existing couple APIs (e.g. couple-annual, couple-mingju, couple-season, couple-core-suggestion, couple-overall-summary, couple-specific-problem-analysis) with the two users’ info and problem; then pass responses into the print page components.
- **Option B (from saved report):** View accepts `sessionId`; call `/api/couple-complete-report?sessionId=xxx`; map `annualAnalysis`, `mingJuAnalysis`, `seasonAnalysis`, `coreSuggestions`, `problemSolution` (and overall summary if stored) into the same print components.

Either way, the **content** of each block should be the same as on the web (CoupleAnnualAnalysis, CoupleMingJu, etc.); only the **layout** is A4, page-break, and styled like the fortune print.

### 4.4 Components to add or reuse
- **Cover:** New `CouplePrintCoverPage.jsx` (or reuse CoverPage with type=couple and title “姻緣合盤報告”).
- **Page 1:** New `CouplePrintPage1_BasicAnalysis.jsx` – two users’ basics + dual BaZi + question.
- **Page 2–3:** Use existing **MingJu** in print mode for two people, or new **CouplePrintMingJu** that renders two “日主/命局” blocks (same content as CoupleMingJu, different layout).
- **Page 4:** New **CouplePrintAnnual.jsx** – from CoupleAnnualAnalysis data (compatibility, elements, strategy).
- **Page 5:** New **CouplePrintSeason.jsx** – from CoupleSeason data (same structure as Page7_Seasons).
- **Page 6:** New **CouplePrintCoreSuggestion.jsx** – from CoupleCoreSuggestion (same structure as Page8_9_Recommendations).
- **Page 7:** New **CouplePrintOverallSummary.jsx** – from CoupleOverallSummary (same structure as Page10_Summary).
- **Page 8:** New **CouplePrintProblemSolution.jsx** – from EnhancedCoupleSpecificProblemSolution (problem + solutions by category).

All of these should receive **data** in the same shape as the web components (or a simple transform from saved report / API responses) and render with **fortune-print** layout and classes.

---

## 5. Summary

- **Couple report content** = 6 blocks in “分析” tab + 1 block in “專屬問題解決方案” tab; all can be driven by the same saved report or the same APIs.
- **Fortune print** = fixed A4 pages, page-break divs, Noto Serif SC, concern color, and a single view that loads all data then renders Cover → P1 → … → P10.
- **Suggested couple print:** 1 cover + 8 content pages (or 9 with splits), same styling and data flow pattern as fortune, with new couple-specific print components that mirror the existing fortune print components’ layout and structure.

If you tell me whether you prefer **URL-param-only** (like fortune) or **sessionId-based** (saved report) for the couple print view, the next step is to implement the route and the first 2–3 components (e.g. cover, Page1, MingJu) so the rest can follow the same pattern.

---

## 6. 專屬問題解決方案 (Tab 2) – Full analysis

This section documents **everything** in the "專屬問題解決方案" tab: the single parent component, all child sections, APIs, data flow, and saved structure, so you can mirror it in the couple print report.

### 6.1 Parent component: EnhancedCoupleSpecificProblemSolution

- **File:** `src/components/EnhancedCoupleSpecificProblemSolution.jsx`
- **Props:**
  - `user1`, `user2`: each `{ birthDateTime, gender, name? }`
  - `specificProblem`: string (e.g. "我們冷戰很久了" or "異地戀如何維繫")
  - `isSimplified`: boolean (zh-CN vs zh-TW)

**Logic (high level):**
- Derives `femaleUser` / `maleUser` from `user1`/`user2` by `gender`.
- **Problem category:** `categorizeLocalProblem(specificProblem)` (client-side) → one of three categories (see below). Stored in state `problemCategory`.
- **Compatibility score:** From `useCoupleAnalysis()` context, or fallback `calculateBasicCompatibilityScore` from `calculateUnifiedElements` for both users. Used for display only (optional circle; can be omitted in print).
- **Base analysis:** Calls `POST /api/couple-specific-problem-analysis` with `{ femaleUser, maleUser, specificProblem, isSimplified }` → sets `analysisData` (female/male BaZi + descriptions).
- **Subsections:** Child sections call their own APIs and report back via `onDataReady(sectionName, data)`. Parent aggregates into `subsectionData` and, after a short delay, saves the full payload via `saveComponentContentWithUser(..., "enhancedCoupleSpecificProblemSolution", { ...analysisData, subsections: subsectionData, completedAt })`.
- **Historical load:** If `getCoupleComponentData("enhancedCoupleSpecificProblemSolution")` returns data (e.g. from `window.coupleComponentDataStore` after loading saved report), that is used as `analysisData` and `subsectionData` so no API calls are made.

**Rendered UI:**
1. **Problem type badge:** "問題類型：{categoryLabel}" + `specificProblem` text.
2. **Dynamic sections:** `renderSectionsByCategory()` renders different subsection components depending on `problemCategory.category`.

---

### 6.2 Problem categorization (client-side)

**Function:** `categorizeLocalProblem(problem)` inside `EnhancedCoupleSpecificProblemSolution.jsx`.

| Category (key)        | categoryKey (i18n) | Keywords (examples) | UI color / icon |
|-----------------------|-------------------|----------------------|-----------------|
| **感情降溫類**         | emotionCooling    | 冷戰、降溫、疏遠、冷淡、感情淡、不理我 | Pink / Heart   |
| **特殊情境類**         | specialSituation  | 異地、長距離、工作、家庭、父母、朋友、環境、壓力 | Blue / Globe (Users) |
| **禁忌破解話術**       | tabooBreaking     | 說錯話、話術、溝通、誤會、爭吵、口角、吵架、禁忌 | Purple / Shield (Target) |

Default if no keyword matches: **感情降溫類**.

---

### 6.3 Main API: couple-specific-problem-analysis

- **Route:** `POST /api/couple-specific-problem-analysis`
- **Request body:** `{ femaleUser, maleUser, specificProblem, isSimplified }`
- **Behavior:** Uses `BaziCalculator` to compute four pillars for both users; builds a prompt (Traditional or Simplified) with both BaZis and `specificProblem`; calls **DeepSeek** (`deepseek-chat`); parses AI response into structured `female` and `male` blocks.
- **Response (success):** `{ success: true, female: { birthDate, bazi, description, pillars, realBazi? }, male: { ... }, rawResponse }`
- **Response (fallback on error):** Still returns `female` and `male` with at least calculated BaZi; may set `success: false`.

No subsection content is returned here; subsections are filled by the child components and their APIs.

---

### 6.4 Subsection components and APIs by category

Each subsection either uses `savedData` (from parent's `subsectionData`) or calls its own API with `analysisData.female/male` (bazi, pillars, etc.) and `femaleUser`/`maleUser`.

**Category 1: 感情降溫類 (emotion_cooling)**

| Section title (examples) | Component | API | requestType | Data shape (typical) |
|--------------------------|-----------|-----|-------------|------------------------|
| 盤面診斷 (chartDiagnosis) | ChartDiagnosisSection | POST /api/chart-diagnosis | chart_diagnosis | female/male titles + content, keySymptoms |
| 風水急救 | EmergencyFengShuiSection | POST /api/emergency-feng-shui | emergency_feng_shui | recommendations[] (title, description, color) |
| 重啟默契 | RestartChemistrySection | POST /api/restart-chemistry | restart_chemistry | methods, timing, activities (or similar) |

**Category 2: 特殊情境類 (special_situation)**

| Section title | Component | API | requestType | Data shape (typical) |
|---------------|-----------|-----|-------------|------------------------|
| 星盤指引 (starChartGuidance) | StarChartGuidanceSection | POST /api/star-chart-guidance | star_chart_guidance | guidances[] (title, analysis, impact, solution, gradient) |
| 風水轉化 (fengShuiTransformation) | FengShuiTransformationSection | POST /api/feng-shui-transformation | (in body) | transformations, environmentChanges, energyAdjustments |
| 相處心法 | RelationshipMethodSection | POST /api/relationship-method | (in body) | methods, communication, principles |

**Category 3: 禁忌破解話術 (taboo_breaking)**

| Section title | Component | API | requestType | Data shape (typical) |
|---------------|-----------|-----|-------------|------------------------|
| 關鍵分析 | KeyAnalysisSection | POST /api/key-analysis | key_analysis | fiveElementsCompatibility, keyAnalysis, taboos, etc. |
| 針對性建議 (targetedSuggestions) | TargetedSuggestionsSection | POST /api/targeted-suggestions | targeted_suggestions | suggestions, scripts, timing, elementBalance, etc. |
| 重啟默契 | RestartChemistrySection | (same as above) | restart_chemistry | (same as emotion_cooling) |

All subsection APIs receive at least: `femaleUser`, `maleUser`, `femaleBazi`, `maleBazi`, `femalePillars`, `malePillars`, and often `requestType` and `isSimplified`.

---

### 6.5 Saved structure: problemSolution

- **Where saved:** `CoupleContent` collection, `componentName === "enhancedCoupleSpecificProblemSolution"`.
- **Retrieved as:** `report.problemSolution` from `GET /api/couple-complete-report?sessionId=xxx` (see §1.1).
- **Shape:** The object saved by `saveComponentContentWithUser`:
  - **Base:** same as API response from `/api/couple-specific-problem-analysis`: `female`, `male` (birthDate, bazi, description, pillars, realBazi?).
  - **subsections:** `{ chartDiagnosis?, emergencyFengShui?, restartChemistry?, ... }` — one key per subsection that called `onDataReady`. Each value is the API response (or fallback) for that section.
  - **completedAt:** ISO string.

So for **print (or historical view)** you only need `report.problemSolution`: it already contains both base analysis and all subsection data; no need to call subsection APIs again if you have a saved report.

---

### 6.6 How 專屬問題解決方案 fits into the couple print report

- **Data source for print:** Use `report.problemSolution` when loading by `sessionId`. If you implement "print without sessionId" (form-only), you would need to call `/api/couple-specific-problem-analysis` and then either call each subsection API in sequence or generate a simplified print view from base data only (no subsections).
- **Suggested page division for Tab 2 content:**
  - **Page 8a – 專屬問題與類型**  
    - 問題類型：{感情降溫類 / 特殊情境類 / 禁忌破解話術}  
    - 具體問題：{specificProblem}  
    - Optional: short base analysis (female/male birthDate + BaZi one-liner) from `problemSolution.female` / `problemSolution.male`.
  - **Page 8b – 解決方案（一）**  
    - First 1–2 subsections of the category (e.g. 盤面診斷 + 風水急救 for emotion_cooling; 星盤指引 + 風水轉化 for special_situation; 關鍵分析 + 針對性建議 for taboo_breaking). Use `problemSolution.subsections.*` and render in fortune-print style (A4, page-break, same typography).
  - **Page 8c – 解決方案（二）** (if content overflows)  
    - Remaining subsections (e.g. 重啟默契; 相處心法). Same data source, same styling.

So **專屬問題解決方案** in print = **1 intro page (problem + type + optional base)** + **1–2 solution pages** (all subsections for the chosen category), using the same A4/page-break/Noto Serif SC/couple color rules as the rest of the couple print report.

---

### 6.7 Summary table: 專屬問題解決方案

| Item | Detail |
|------|--------|
| **Parent component** | EnhancedCoupleSpecificProblemSolution |
| **Props** | user1, user2, specificProblem, isSimplified |
| **Main API** | POST /api/couple-specific-problem-analysis → female, male (BaZi + description) |
| **Category logic** | categorizeLocalProblem(specificProblem) → emotion_cooling / special_situation / taboo_breaking |
| **Subsection APIs** | /api/chart-diagnosis, /api/emergency-feng-shui, /api/restart-chemistry, /api/star-chart-guidance, /api/feng-shui-transformation, /api/relationship-method, /api/key-analysis, /api/targeted-suggestions |
| **Saved as** | CoupleContent, componentName "enhancedCoupleSpecificProblemSolution"; content = { female, male, subsections, completedAt } |
| **Print data** | report.problemSolution (from /api/couple-complete-report) |
| **Print pages** | 8a: 問題與類型 (+ optional base); 8b (and 8c if needed): 解決方案 by category, from subsections |
