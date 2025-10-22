# 🌏 Traditional vs Simplified Chinese Switching Guide

## How the i18n System Works

### 1. **User Region Detection**

The system detects the user's region and stores it in `localStorage`:

```javascript
// In your app, user selects region
localStorage.setItem("userRegion", "china"); // For Mainland China
localStorage.setItem("userRegion", "hongkong"); // For Hong Kong
localStorage.setItem("userRegion", "taiwan"); // For Taiwan
```

### 2. **Locale Mapping**

Next.js automatically maps the region to the appropriate locale:

- **`china`** → **`zh-CN`** (Simplified Chinese / 简体中文)
- **`hongkong`** → **`zh-TW`** (Traditional Chinese / 繁體中文)
- **`taiwan`** → **`zh-TW`** (Traditional Chinese / 繁體中文)

### 3. **Translation Files**

The system loads the correct translation file based on locale:

```
messages/
├── zh-TW.json  ← Traditional Chinese (繁體中文)
└── zh-CN.json  ← Simplified Chinese (简体中文)
```

### 4. **Component Usage**

Components use `useTranslations` hook to get localized text:

```jsx
import { useTranslations } from "next-intl";

function MyComponent() {
	const t = useTranslations("fengShuiReport.components.zodiac");

	return (
		<div>
			{t("loadingText")}
			{/* Shows: "風水妹已經在運算八字分析中，請稍候" (zh-TW) */}
			{/* Shows: "风水妹已经在运算八字分析中，请稍候" (zh-CN) */}
		</div>
	);
}
```

## 📝 Examples in Practice

### Example 1: Loading Text

**Component Code:**

```jsx
{
	t("loadingText");
}
```

**zh-TW.json (Traditional):**

```json
{
	"fengShuiReport": {
		"components": {
			"zodiac": {
				"loadingText": "風水妹已經在運算八字分析中，請稍候"
			}
		}
	}
}
```

**zh-CN.json (Simplified):**

```json
{
	"fengShuiReport": {
		"components": {
			"zodiac": {
				"loadingText": "风水妹已经在运算八字分析中，请稍候"
			}
		}
	}
}
```

**Result:**

- **Hong Kong user sees:** "風水妹已經在運算八字分析中，請稍候"
- **China user sees:** "风水妹已经在运算八字分析中，请稍候"

### Example 2: Dynamic Content with Variables

**Component Code:**

```jsx
t("adviceTemplate", {
	primaryGod: "木",
	auxiliaryGod: "水",
	strategy: "補足所缺",
});
```

**zh-TW.json:**

```json
{
	"adviceTemplate": "根據你的五行配置分析，建議以「{primaryGod}」為首選用神，「{auxiliaryGod}」為輔助用神。透過{strategy}的策略..."
}
```

**zh-CN.json:**

```json
{
	"adviceTemplate": "根据你的五行配置分析，建议以「{primaryGod}」为首选用神，「{auxiliaryGod}」为辅助用神。透过{strategy}的策略..."
}
```

**Result:**

- **Traditional:** "根據你的五行配置分析，建議以「木」為首選用神..."
- **Simplified:** "根据你的五行配置分析，建议以「木」为首选用神..."

## 🎯 Key Differences Between Traditional & Simplified

| Traditional (zh-TW) | Simplified (zh-CN) | Meaning          |
| ------------------- | ------------------ | ---------------- |
| 風水妹              | 风水妹             | Feng Shui Sister |
| 運算                | 运算               | Computing        |
| 已經                | 已经               | Already          |
| 請稍候              | 请稍候             | Please wait      |
| 根據                | 根据               | According to     |
| 建議                | 建议               | Suggest          |
| 透過                | 透过               | Through          |
| 調節                | 调节               | Adjust           |
| 達到                | 达到               | Achieve          |
| 運勢                | 运势               | Fortune          |
| 發展                | 发展               | Development      |
| 顏色                | 颜色               | Color            |

## 🔄 How Switching Happens

### Step-by-Step Flow:

1. **User selects region** (China/Hong Kong/Taiwan)

    ```javascript
    localStorage.setItem("userRegion", "china");
    ```

2. **Next.js middleware detects locale**

    ```javascript
    // middleware.js
    const locale = region === "china" ? "zh-CN" : "zh-TW";
    ```

3. **Page loads with correct locale**

    ```
    /zh-CN/feng-shui-report  ← China users
    /zh-TW/feng-shui-report  ← HK/Taiwan users
    ```

4. **Components auto-load correct translations**

    ```jsx
    const t = useTranslations("namespace");
    // Automatically uses zh-CN.json or zh-TW.json
    ```

5. **All text displays in correct variant**
    - Buttons, labels, messages
    - Error messages
    - Loading states
    - Section titles
    - AI-generated content

## 🛠️ Implementation Checklist

- [x] **Page.jsx**: All hardcoded text replaced with `t()` calls
- [x] **FiveElement.jsx**: Fully internationalized
- [x] **Zodiac.jsx**: Fully internationalized
- [ ] **QuestionFocus.jsx**: Pending
- [ ] **MingJu.jsx**: Pending
- [ ] **GanZhi.jsx**: Pending
- [ ] **JiXiong.jsx**: Pending
- [ ] **Season.jsx**: Pending
- [ ] **CoreSuggestion.jsx**: Pending
- [ ] **SpecificSuggestion.jsx**: Pending

## 📦 Translation File Structure

```json
{
	"fengShuiReport": {
		"page": {
			"loadingTitle": "...",
			"errorReturn": "...",
			"sectionBasicAnalysis": "..."
			// ... page-level translations
		},
		"components": {
			"fiveElement": {
				"loadingText": "...",
				"allElementsPresent": "..."
				// ... component-specific translations
			},
			"zodiac": {
				"loadingText": "...",
				"defaultAdvice": "...",
				"adviceTemplate": "...",
				"strategy_補缺": "..."
				// ... zodiac translations
			}
		}
	}
}
```

## 🚀 Testing the Switching

### Method 1: Change localStorage

```javascript
// In browser console
localStorage.setItem("userRegion", "china");
location.reload(); // Shows Simplified Chinese

localStorage.setItem("userRegion", "hongkong");
location.reload(); // Shows Traditional Chinese
```

### Method 2: Change URL

```
https://yoursite.com/zh-CN/feng-shui-report  ← Simplified
https://yoursite.com/zh-TW/feng-shui-report  ← Traditional
```

## 💡 Best Practices

1. **Always use t() function** - Never hardcode Chinese text
2. **Keep translation keys semantic** - Use descriptive names like `loadingText`, not `text1`
3. **Use same structure** - zh-TW.json and zh-CN.json should have identical key structure
4. **Test both variants** - Always verify text displays correctly in both languages
5. **Dynamic content** - Use template variables for dynamic text: `{variableName}`

## 🔍 Debugging Tips

If text doesn't switch:

1. Check localStorage has correct `userRegion`
2. Verify URL has correct locale (`/zh-CN/` or `/zh-TW/`)
3. Ensure translation key exists in both JSON files
4. Check console for missing translation warnings
5. Verify `useTranslations` hook is imported and used correctly

---

**Summary**: The system automatically displays Traditional Chinese (繁體中文) for Hong Kong/Taiwan users and Simplified Chinese (简体中文) for China users, with all translations centrally managed in JSON files.
