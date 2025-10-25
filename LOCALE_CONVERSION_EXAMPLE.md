# 🌐 Chatbox Locale Conversion Implementation Guide

## Overview

This guide shows how to convert hardcoded Traditional Chinese responses to support both Traditional (zh-TW) and Simplified Chinese (zh-CN) based on user locale.

---

## ✅ What We've Done

### 1. Created Translation File: `src/lib/chatTranslations.js`

- Contains ALL user-facing text in both zh-TW and zh-CN
- Organized by function/category
- Includes helper functions for easy access

---

## 📋 Implementation Steps

### Step 1: Import Translations in Files

**In `src/lib/newConversationFlow.js`:**

```javascript
// Add at top of file
import { getTranslation, getRandomTranslation } from "./chatTranslations.js";
```

**In `src/app/api/chat/route.js`:**

```javascript
// Add at top of file
import { getTranslation, getRandomTranslation } from "@/lib/chatTranslations";
```

---

### Step 2: Add Locale Parameter to Methods

**BEFORE (Original):**

```javascript
static generateNaturalResponse(userState, message, concern, emotion, messageLength = 0) {
	if (conversationState === "initial" || !conversationState) {
		if (emotion === "平靜" && !concern) {
			return "你好呀～我係風鈴！✨ 有咩生活上嘅困擾想搵我傾傾呢？...";
		}
	}
}
```

**AFTER (With Locale):**

```javascript
static generateNaturalResponse(userState, message, concern, emotion, locale = 'zh-TW', messageLength = 0) {
	if (conversationState === "initial" || !conversationState) {
		if (emotion === "平靜" && !concern) {
			return getTranslation(locale, 'initialGreeting');
		}
	}
}
```

---

### Step 3: Real Refactoring Examples

#### Example 1: Simple String Replacement

**BEFORE:**

```javascript
return "你好呀～我係風鈴！✨ 有咩生活上嘅困擾想搵我傾傾呢？無論係工作、感情、財運定係健康，我都可以幫你分析風水運勢架～";
```

**AFTER:**

```javascript
return getTranslation(locale, "initialGreeting");
```

---

#### Example 2: Template Strings with Variables

**BEFORE:**

```javascript
return `哇～風鈴覺得你剛剛問的東西好有趣呢！😊

不過我們剛才不是在聊「${currentAreaName}」的問題嗎？風鈴想先幫你把這個處理好呢～

讓我們繼續聊「${currentAreaName}」的事情好嗎？這樣我才能給你最專業的風水建議哦！✨`;
```

**AFTER:**

```javascript
return getTranslation(locale, "topicDeviation.template", currentAreaName);
```

---

#### Example 3: Random Selection from Array

**BEFORE:**

```javascript
const responses = {
	工作: [
		"工作確實係人生好重要嘅一部分，我明白你嘅困擾。",
		"職場上嘅事情有時真係好複雜，我理解你嘅感受。",
	],
	// ... more
};

const concernResponses = responses[concern] || ["我明白你嘅關心。"];
const base =
	concernResponses[Math.floor(Math.random() * concernResponses.length)];
return base + "可以話俾我知具體係咩情況嗎？...";
```

**AFTER:**

```javascript
const base =
	getRandomTranslation(locale, `concernIntro.${concern}`) ||
	getRandomTranslation(locale, "concernIntro.default");
const followUp = getTranslation(locale, "concernIntro.followUp");
return base + followUp;
```

---

#### Example 4: Complex Object with Multiple Properties

**BEFORE:**

```javascript
static generateComfortAndPreAnalysis(concern, specificProblem) {
	const comfortMap = {
		工作: {
			comfort: "我完全理解你嘅工作壓力，職場上嘅困難確實令人感到疲憊。...",
			suggestion: "根據風水學，工作運勢同你嘅個人能量場有密切關係。...",
			question: "我可以為你做個詳細嘅八字分析，提供針對性嘅風水建議，..."
		},
		// ... more
	};

	const response = comfortMap[concern] || { comfort: "...", suggestion: "...", question: "..." };
	return `${response.comfort}\n\n${response.suggestion}\n\n${response.question}`;
}
```

**AFTER:**

```javascript
static generateComfortAndPreAnalysis(concern, specificProblem, locale = 'zh-TW') {
	const comfortKey = `comfortAndPreAnalysis.${concern}` || 'comfortAndPreAnalysis.default';
	const comfort = getTranslation(locale, `${comfortKey}.comfort`);
	const suggestion = getTranslation(locale, `${comfortKey}.suggestion`);
	const question = getTranslation(locale, `${comfortKey}.question`);

	return `${comfort}\n\n${suggestion}\n\n${question}`;
}
```

---

#### Example 5: Conditional Analysis Type

**BEFORE:**

```javascript
if (relationshipAnalysisType === "individual") {
	return (
		"好！我會為你進行個人感情分析 🌸\n\n" +
		"為咗更準確分析你嘅感情運勢，我需要你嘅出生日期。\n" +
		"請提供：出生年月日（例如：1990年5月15日）"
	);
} else if (relationshipAnalysisType === "couple") {
	return (
		"好！我會為你哋進行合婚配對分析 💕\n\n" +
		"為咗分析你哋嘅八字合配度，我需要兩個人嘅出生資料：\n" +
		"1️⃣ 首先請提供你嘅出生年月日（例如：1990年5月15日）\n" +
		"2️⃣ 之後會請你提供伴侶嘅出生資料"
	);
}
```

**AFTER:**

```javascript
if (relationshipAnalysisType === "individual") {
	return getTranslation(locale, "relationshipAnalysis.individualChoice");
} else if (relationshipAnalysisType === "couple") {
	return getTranslation(locale, "relationshipAnalysis.coupleChoice");
}
```

---

### Step 4: Update API Route to Accept and Pass Locale

**In `src/app/api/chat/route.js`:**

```javascript
export async function POST(request) {
	try {
		const body = await request.json();
		const {
			messages,
			userId,
			intentTracker,
			locale = 'zh-TW'  // ✅ Add locale parameter with default
		} = body;

		// ... existing code ...

		// ✅ Pass locale to response generation functions
		const response = ImprovedConversationFlow.generateNaturalResponse(
			userState,
			lastMessage,
			concern,
			emotion,
			locale,  // ✅ Pass locale here
			messages.length
		);

		// ... rest of code ...
	}
}
```

---

### Step 5: Update Frontend to Send Locale

**In `src/app/[locale]/page.tsx`:**

```javascript
const handleSend = async () => {
	// ... existing code ...

	const response = await fetch("/api/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			messages: updatedMessages,
			userId: userId,
			intentTracker: intentTrackerRef.current,
			locale: currentLocale, // ✅ Send current locale
		}),
	});

	// ... rest of code ...
};
```

---

## 🔧 Complete Refactoring Checklist

### In `newConversationFlow.js`:

- [ ] Add `locale` parameter to `generateNaturalResponse()`
- [ ] Add `locale` parameter to `generateConcernIntroResponse()`
- [ ] Add `locale` parameter to `generateEmotionalComfort()`
- [ ] Add `locale` parameter to `generateSpecificQuestionProbe()`
- [ ] Add `locale` parameter to `generateComfortAndPreAnalysis()`
- [ ] Add `locale` parameter to `generateModalTriggerResponse()`
- [ ] Add `locale` parameter to `generateBirthdayReceivedResponse()`
- [ ] Add `locale` parameter to `generateReportGenerationResponse()`
- [ ] Add `locale` parameter to `generateOfferDetailedAnalysis()`
- [ ] Add `locale` parameter to `generateComfortAndBirthdayRequest()`
- [ ] Add `locale` parameter to `analyzeNonCoreUserInput()`
- [ ] Add `locale` parameter to `handleNonCoreInput()`
- [ ] Add `locale` parameter to `handleTopicDeviation()`
- [ ] Add `locale` parameter to `analyzeAndGuideToCore()`

### In `smartConversationFlow.js`:

- [ ] Add `locale` parameter to all response generation methods

### In `chat/route.js`:

- [ ] Extract locale from request body
- [ ] Pass locale to all response generation functions
- [ ] Update EMOTIONAL_SYSTEM_PROMPTS to use translations
- [ ] Update fallback responses to use translations

---

## 🎯 Key Benefits

1. **Separation of Concerns**: Logic vs. Content
2. **Easy Maintenance**: All text in one place
3. **Scalability**: Easy to add more locales later
4. **Consistency**: Same structure across all responses
5. **Type Safety**: Centralized translation keys

---

## 🚀 Testing Plan

1. **Test zh-TW (Traditional Chinese)**:

    - Set locale to 'zh-TW' in frontend
    - Verify all responses show Traditional Chinese with Cantonese terms

2. **Test zh-CN (Simplified Chinese)**:

    - Set locale to 'zh-CN' in frontend
    - Verify all responses show Simplified Chinese with Mandarin terms

3. **Test Locale Switching**:
    - Change locale mid-conversation
    - Verify subsequent responses use new locale

---

## 📝 Example Implementation of One Complete Method

```javascript
// BEFORE
static generateNaturalResponse(userState, message, concern, emotion, messageLength = 0) {
	const { conversationState, primaryConcern, hasBirthday, hasSpecificProblem } = userState;

	// Initial greeting
	if (conversationState === "initial" || !conversationState) {
		if (emotion === "平靜" && !concern) {
			return "你好呀～我係風鈴！✨ 有咩生活上嘅困擾想搵我傾傾呢？無論係工作、感情、財運定係健康，我都可以幫你分析風水運勢架～";
		} else if (concern) {
			return this.generateConcernIntroResponse(concern, emotion);
		} else {
			return this.generateEmotionalComfort(emotion) + "可以話俾我知發生咩事嗎？我會用心聆聽。";
		}
	}

	// More states...
}

// AFTER
static generateNaturalResponse(userState, message, concern, emotion, locale = 'zh-TW', messageLength = 0) {
	const { conversationState, primaryConcern, hasBirthday, hasSpecificProblem } = userState;

	// Initial greeting
	if (conversationState === "initial" || !conversationState) {
		if (emotion === "平靜" && !concern) {
			return getTranslation(locale, 'initialGreeting');
		} else if (concern) {
			return this.generateConcernIntroResponse(concern, emotion, locale);
		} else {
			const comfort = this.generateEmotionalComfort(emotion, locale);
			const prompt = locale === 'zh-TW' ?
				"可以話俾我知發生咩事嗎？我會用心聆聽。" :
				"可以告诉我发生什么事吗？我会用心聆听。";
			return comfort + prompt;
		}
	}

	// More states...
}
```

---

## ⚠️ Important Notes

1. **Detection Keywords Stay in Traditional**: Keywords for detecting user intent (工作, 感情, etc.) should stay as-is in arrays - they're for DETECTION, not OUTPUT.

2. **Only Output Text Changes**: Only text that's SHOWN to users needs translation.

3. **Default Locale**: Always default to 'zh-TW' for backward compatibility.

4. **Emoji Consistency**: Keep emoji the same across both locales.

5. **Formatting**: Maintain markdown formatting, bullet points, and line breaks consistently.

---

## 📊 Progress Tracking

| File                       | Total Methods | Refactored | Status     |
| -------------------------- | ------------- | ---------- | ---------- |
| `chatTranslations.js`      | -             | -          | ✅ Created |
| `newConversationFlow.js`   | ~15 methods   | 0          | ⏳ Pending |
| `smartConversationFlow.js` | ~5 methods    | 0          | ⏳ Pending |
| `chat/route.js`            | ~10 sections  | 0          | ⏳ Pending |
| Frontend `page.tsx`        | 1 update      | 0          | ⏳ Pending |

---

Would you like me to proceed with the actual refactoring?
