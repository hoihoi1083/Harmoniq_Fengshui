# "其他" Category Flow Analysis

## Complete Reaction & Response Strategy

**Date:** 2025年11月10日  
**Analysis:** How the chatbot handles questions classified as "其他" (Other)

---

## 📊 Overview

When a user question is classified as `detectedTopic: "其他"`, the system treats it as **out-of-scope** (not directly related to feng shui/destiny services) and follows a **helpful + redirect** strategy.

**Key Philosophy:**
✅ **Always provide a helpful, useful answer first**  
✅ Then naturally guide the user to relevant feng shui/destiny services  
✅ Never reject or dismiss the user - stay friendly and engaging

---

## 🔄 Complete Flow Diagram

```
User asks question
        ↓
AITopicClassifier.analyzeMessage()
        ↓
detectedTopic: "其他"
        ↓
generateServiceGuidance()
        ↓
case "其他": → generateOutOfScopeResponse()
        ↓
┌─────────────────────────────────────┐
│ 1. Check conversation context      │
│    - irrelevantCount (how many)    │
│    - lastRelevantTopic             │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ 2. Determine redirect level        │
│    - gentle (default, count: 0-1)  │
│    - moderate (count: 2-3)         │
│    - firm (count: 4+)              │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ 3. Build custom prompt              │
│    buildRedirectPrompt()            │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ 4. Call DeepSeek API                │
│    Generate intelligent response    │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ 5. Return response to user          │
│    - Answer the question            │
│    - Connect to feng shui wisdom    │
│    - Recommend 1-2 services         │
└─────────────────────────────────────┘
```

---

## 🎯 Step-by-Step Breakdown

### **Step 1: Detection & Routing**

**File:** `src/app/api/smart-chat2/route.js` - Lines 2203-2207

```javascript
case "其他":
    // 🤖 「其他」話題使用智能回應
    return await this.generateOutOfScopeResponse(
        analysis,
        originalMessage,
        sessionId
    );
```

**What happens:**

- Question classified as "其他" (not 感情/財運/工作/健康/命理)
- Routes to `generateOutOfScopeResponse()` function
- Examples: "What should I eat for lunch?", "What's the weather?", "Tell me a joke"

---

### **Step 2: Context Analysis**

**File:** `src/app/api/smart-chat2/route.js` - Lines 2382-2388

```javascript
// 🧠 Check conversation context for redirect strategy
const context = this.getConversationContext(sessionId);
const redirectLevel = this.determineRedirectLevel(context);

console.log(
	`🎯 Redirect level: ${redirectLevel}, irrelevant count: ${context.irrelevantCount || 0}`
);
```

**What it checks:**

```javascript
getConversationContext(sessionId) {
    return {
        hasHistory: true/false,
        messageCount: number,
        recentMessages: [...last 3 messages],
        preferredTopic: string or null,
        irrelevantCount: number,  // 🔥 KEY METRIC
        lastRelevantTopic: string or null
    };
}
```

**Conversation Memory:**

- Stored in `this.conversationMemory` Map (Lines 790-828)
- Tracks each message: message, response, topic, timestamp, isRelevant
- Increments `irrelevantCount` when topic === "其他"
- Decrements count when user asks relevant question (reward good behavior)

---

### **Step 3: Redirect Level Determination**

**File:** `src/app/api/smart-chat2/route.js` - Lines 860-865

```javascript
determineRedirectLevel(context) {
    // Always use gentle approach - user prefers engaging, helpful responses
    // regardless of conversation history
    return "gentle"; // Always helpful answer + soft redirect
}
```

**Current Strategy:** ALWAYS "gentle" 🌸

**Historical Design (commented out):**

```javascript
// Original logic (not currently used):
if (!context.hasHistory || context.irrelevantCount === 0) {
	return "gentle";
} else if (context.irrelevantCount <= 2) {
	return "moderate";
} else {
	return "firm";
}
```

**Why always gentle?**

> "User prefers engaging, helpful responses regardless of conversation history"

This ensures **every user experience is positive and supportive**, even if they ask multiple off-topic questions.

---

### **Step 4: Build Custom AI Prompt**

**Function:** `buildRedirectPrompt(question, redirectLevel, context)`  
**File:** Lines 1035-1195

#### **Gentle Level (Default)**

**System Instructions:**

```
你是友善的小鈴，用戶問了一個與風水命理無關的問題。
請給用戶實用回答，然後積極引導他們了解你的專業服務。

當前日期：2025年11月10日（僅作為內部參考，不需要在每個回應中都提及具體日期）
當前生肖年：2025年是乙巳蛇年（Snake Year），不是馬年（Horse Year）

重要指示：
- 必須使用簡體中文/繁體中文（based on locale）
- 2025年是蛇年，不要誤稱為馬年
- 不要包含字數統計標記
```

**Response Style Requirements:**

```
回應風格：
✅ 先給出實用的答案或建議（要具體有用）
✅ 然後巧妙連結問題與命理運勢的關係
✅ 說明專業分析能提供更深入的幫助
✅ 推薦最相關的服務並強調能解決的問題
✅ 用小鈴的親切語氣，但要展現專業權威性
✅ 用自然對話的方式，避免機械式列點回應
```

**Available Services:**

```
現有服務範圍：
- 感情運勢分析（桃花運、合婚配對）
- 工作事業分析（職場運勢、事業發展）
- 財運分析（投資理財、收入提升）
- 健康運勢（身心調理、養生建議）
- 命理分析（八字解讀、流年運勢）
```

**Professional Terminology Guidelines:**

```
專業術語運用：
🍜 飲食相關問題 → 提及五行元素（金木水火土）與食材對應關係
🎨 顏色/材質/方位問題 → 引用風水五行理論
📚 用專業但易懂的方式說明五行與日常生活的關聯
```

**Ending Format:**

```
結尾要求：
1️⃣ 根據用戶問題，推薦1-2個最相關的服務
2️⃣ 使用格式：「想要開始分析的話，請輸入：『XXX分析』」
3️⃣ 添加吸引人的結語（分類別提供選項）
4️⃣ 最後可選擇添加多樣化結尾句
5️⃣ 不要列出所有5個服務，只推薦最相關的
```

**Contextual Closing Phrases:**

**禮物/購物相關：**

- "讓小鈴用專業視角幫你選出最開運的選擇吧！"
- "一起為他挑選帶來好運的心意禮物～"
- "讓每份禮物都成為幸運的開始！"

**飲食/健康相關：**

- "讓我為你找出最適合的養生搭配，提升整體運勢！"
- "一起用五行智慧打造專屬你的健康食譜～"
- "讓每一餐都成為滋養運勢的能量來源！"

**工作/事業相關：**

- "助你找到事業發展的最佳時機和策略！"
- "讓小鈴為你的職場路指引明燈～"
- "一起開創屬於你的成功運勢！"

**感情/關係相關：**

- "讓小鈴幫你解開感情迷霧，找到真愛方向！"
- "一起為你的愛情運勢注入正能量～"
- "讓每段緣分都開花結果！"

**其他生活問題：**

- "讓專業命理為你的生活帶來更多好運！"
- "一起用古老智慧解決現代煩惱～"
- "讓小鈴成為你人生路上的貴人！"

**General closing variations:**

- "或有任何其他疑問，都可以直接同我講"
- "有什麼想了解的，隨時找小鈴聊聊～"
- "期待為你解答更多人生疑惑！"
- "小鈴隨時在這裡為你服務呢！"
- "或者你也可以跟我分享其他想法～"

---

### **Step 5: DeepSeek API Call**

**File:** Lines 2405-2420

```javascript
const aiAnswer = await this.callDeepSeekAPI([
	{
		role: "system",
		content:
			"你是親切可愛的小鈴，善於先回答用戶問題再自然地介紹自己的專業服務...",
	},
	{
		role: "user",
		content: answerPrompt, // The custom prompt built in Step 4
	},
]);
```

**API Parameters:**

- Model: `deepseek-chat`
- Temperature: `0.3` (default, can be adjusted)
- Max tokens: `1000` (default)

**Response Processing:**

```javascript
// Extract response text from various possible formats
if (typeof aiAnswer === "string" && aiAnswer.trim()) {
	responseText = aiAnswer.trim();
} else if (aiAnswer && aiAnswer.choices && aiAnswer.choices[0]) {
	responseText = aiAnswer.choices[0].message?.content?.trim();
} else if (aiAnswer && aiAnswer.content) {
	responseText = aiAnswer.content.trim();
}

// Apply text processing
responseText = this.diversifyTransitionPhrases(responseText);
return cleanLunarCalendarTerms(responseText);
```

---

### **Step 6: Fallback Response**

If DeepSeek API fails, uses minimal fallback:

```javascript
let response = "謝謝你跟我分享這個！😊";
response += `\n\n雖然這個話題很有趣，不過小鈴主要專精於風水命理方面的分析哦～`;

// If bazi input detected, add service menu
if (isBaziInput) {
	return response + this.generateServiceMenu();
}

return response;
```

---

## 📝 Example Scenarios

### **Scenario 1: Food Question (First Time)**

**User:** "今天應該吃什麼？"

**Context:**

- `irrelevantCount: 0` → Redirect level: "gentle"
- First irrelevant question

**Expected Response Structure:**

```
[實用答案]
根據當天的情緒和身體需求，今天如果感覺疲累，可以選擇溫暖滋補的食物...

[連結五行智慧]
其實從命理角度來看，飲食與五行能量息息相關呢！不同的食材對應不同五行屬性...

[服務推薦]
如果想了解你的五行體質和最適合的飲食搭配，小鈴可以為你進行「健康運勢分析」...

想要開始分析的話，請輸入：「健康運勢分析」

讓我為你找出最適合的養生搭配，提升整體運勢！
有什麼想了解的，隨時找小鈴聊聊～
```

**Conversation Memory Update:**

```javascript
{
    irrelevantCount: 1,  // Incremented
    messages: [
        {
            message: "今天應該吃什麼？",
            topic: "其他",
            isRelevant: false
        }
    ]
}
```

---

### **Scenario 2: Weather Question (Second Irrelevant)**

**User:** "明天天氣如何？"

**Context:**

- `irrelevantCount: 1` → Still "gentle" (always gentle)
- Second irrelevant question in a row

**Expected Response:**

```
[實用答案]
明天的天氣資訊建議查看氣象預報哦...

[自然轉折]
不過從風水命理角度來看，天氣變化也會影響個人運勢呢！...

[服務推薦]
如果想了解未來運勢走向和適合的外出時機，可以試試「命理分析」...
```

---

### **Scenario 3: Returns to Relevant Topic**

**User:** "我想了解今年的財運"

**Context:**

- `irrelevantCount: 2` → Will be decremented to 1
- Relevant question detected

**Response:**

- Routes to `generateWealthFlow()` (not out-of-scope)
- Conversation memory updated: `irrelevantCount = max(0, 2-1) = 1`
- **Rewards user for asking relevant question** 🎉

---

## 🎨 Response Quality Features

### **1. Diverse Transition Phrases**

**Function:** `diversifyTransitionPhrases(text)` - Lines 2481-2515

Replaces repetitive phrases with varied alternatives:

```javascript
"不過，從風水命理角度來看"
    → Can be replaced with:
        - "從命理的角度分析"
        - "其實在風水學中"
        - "以專業命理觀點來說"
        - "根據風水智慧"
        - "從五行能量的角度"
```

**Goal:** Make responses feel natural and non-robotic.

---

### **2. Smart Service Recommendations**

**Function:** `generateSmartServiceRecommendation()` - Lines 2486-2643

Maps question types to relevant services:

**Food/Diet → Health + Fate**

```javascript
food: {
    keywords: ["吃", "食物", "料理", "菜", "餐廳", "美食", "營養", "飲食"],
    services: { 健康: 3, 命理: 2 }  // Scores
}
```

**Shopping/Gifts → Fate + Wealth**

```javascript
shopping: {
    keywords: ["買", "購物", "禮物", "商品", "推薦", "選擇"],
    services: { 命理: 3, 財運: 2 }
}
```

**Travel/Weather → Fate**

```javascript
travel: {
    keywords: ["旅行", "出遊", "天氣", "氣候", "假期"],
    services: { 命理: 3 }
}
```

**Contextual Boost:**
If user previously discussed a topic (e.g., 工作), that topic gets +2 priority in recommendations.

---

### **3. Lunar Calendar Term Cleaning**

**Function:** `cleanLunarCalendarTerms(text)` - At module level

Removes prohibited lunar calendar terms:

```javascript
"農曆十月" → "10月"
"陰曆八月" → "8月"
"農曆四月" → "4月"
```

**Why:** System strictly uses Gregorian calendar (西曆/公曆) to avoid confusion.

---

## 🔍 Monitoring & Logging

**Console Logs:**

```javascript
🎯 Redirect level: gentle, irrelevant count: 1
🚀 準備調用 DeepSeek API 測算備用回應...
🤖 DeepSeek 備用回應: {...}
📝 提取的備用回應文字: ...
✅ 使用 DeepSeek 智能回應（備用方案）
```

**Conversation History Tracking:**

```javascript
💭 Conversation history updated for smart-chat2-xxx: 3 messages, irrelevant: 2
```

---

## 📊 Key Metrics Tracked

1. **irrelevantCount** - How many consecutive "其他" questions
2. **lastRelevantTopic** - What was the last on-topic discussion
3. **messageCount** - Total conversation length
4. **preferredTopic** - User's most discussed topic
5. **isRelevant** - Boolean for each message

---

## 🎯 Design Philosophy

### **Core Principles:**

1. **Never Reject** ❌🚫

    - No "I can't help with that"
    - Always provide useful answer first

2. **Always Connect** 🔗

    - Link any question to feng shui/fate wisdom
    - Use five elements (五行) as bridge

3. **Soft Sell** 💼

    - Recommend 1-2 services max (not all 5)
    - Make it feel natural, not pushy
    - Use varied, engaging language

4. **Context Aware** 🧠

    - Remember conversation history
    - Prioritize previously discussed topics
    - Reward relevant questions

5. **Positive Tone** 😊
    - Always friendly and supportive
    - Use emojis appropriately
    - Make user feel heard and valued

---

## 🚨 Edge Cases Handled

### **1. Bazi Input Detection**

If user provides eight characters (八字) in their "other" question:

```javascript
const isBaziInput = this.detectBaziInput(originalMessage);

if (isBaziInput) {
	return response + this.generateServiceMenu();
}
```

**Adds full service menu:**

```
我可以為你分析以下領域：
🌸 感情 - 桃花運、姻緣配對
💼 工作 - 事業發展、職場運勢
💰 財運 - 投資理財、收入提升
🌿 健康 - 身心調理、養生建議
🔮 命理 - 八字分析、流年運勢
```

### **2. Empty/Null Message**

Gracefully handles edge cases:

```javascript
if (!message || typeof message !== "string") {
	return {
		isWithinScope: true,
		detectedTopic: "感情",
		specificProblem: "生日資料收集",
		confidence: 0.8,
	};
}
```

### **3. API Failure**

If DeepSeek API fails, returns minimal but friendly fallback response instead of error.

---

## 📈 Optimization Opportunities

### **Current State:**

- ✅ Always gentle approach
- ✅ Helpful answers before redirects
- ✅ Smart service matching
- ✅ Diverse language patterns

### **Potential Enhancements:**

1. **A/B Testing Redirect Levels**

    - Test moderate/firm strategies
    - Measure conversion rates

2. **Personalization**

    - Track user preferences over sessions
    - Remember which services they're interested in

3. **Analytics Integration**

    - Track which "other" topics lead to conversions
    - Identify popular questions

4. **Response Templates**
    - Pre-generate common responses
    - Reduce API calls for frequently asked questions

---

## 📚 Related Files

| File                               | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `src/app/api/smart-chat2/route.js` | Main chat logic (7912 lines)         |
| Lines 595-900                      | AITopicClassifier class              |
| Lines 860-865                      | determineRedirectLevel()             |
| Lines 790-828                      | updateConversationHistory()          |
| Lines 835-850                      | getConversationContext()             |
| Lines 1035-1195                    | buildRedirectPrompt()                |
| Lines 2370-2484                    | generateOutOfScopeResponse()         |
| Lines 2486-2643                    | generateSmartServiceRecommendation() |
| Lines 2481-2515                    | diversifyTransitionPhrases()         |

---

## ✅ Summary

**"其他" category = Out-of-scope questions**

**Strategy:**

1. ✅ Provide helpful, useful answer
2. ✅ Connect to feng shui/five elements wisdom
3. ✅ Recommend 1-2 most relevant services
4. ✅ Use engaging, varied language
5. ✅ Track conversation context
6. ✅ Always stay positive and supportive

**Result:**

- User feels heard and helped
- Natural transition to services
- High engagement, low friction
- Converts "other" topics into service opportunities

---

_Analysis completed: 2025年11月10日_  
_Based on codebase version with 命理 category fixes applied_
