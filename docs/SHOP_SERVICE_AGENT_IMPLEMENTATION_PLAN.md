# Shop Service Agent – Implementation Plan

## Goal

A **conversation-first** shop assistant that can:

1. **Talk like a normal human** — free conversation on any topic (weather, life, non–feng shui questions). Do **not** force every reply toward products or feng shui.
2. **Wait for the right moment** — suggest products only when the customer asks for recommendations, mentions a need (e.g. 想招財 / 送禮 / 感情), or the conversation naturally leads there. Never be pushy or salesy.
3. **Answer customer questions** about the shop when asked (shipping, payment, products, feng shui).
4. **Use customer birthday** (when shared) to do a **lightweight 八字/五行 analysis** and recommend products by **element** and **tags** when a suggestion is appropriate.

All powered by **DeepSeek**, reusing your existing APIs and logic where possible.

---

## What You Already Have (Reuse)

| Piece | Location | Use in agent |
|-------|----------|--------------|
| **DeepSeek client** | `src/lib/deepseekClient.js` | `callDeepSeekAPI(messages, options, process.env.DEEPSEEK_API_KEY)` |
| **Product list API** | `GET /api/shop/products` | Fetch active products; filter by `elementType`, `tags`, `category`, `search` |
| **Product model** | `src/models/Product.js` | `name.zh_TW/zh_CN`, `description`, `price`, `elementType`, `tags`, `benefits` |
| **Birthday detection** | `ImprovedConversationFlow.detectBirthdayInfo(message)` in `src/lib/newConversationFlow.js` | Detect if user message contains a date |
| **Date parsing** | `parseFlexibleDate(dateString)` in `src/app/api/smart-chat2/route.js` | Parse "1990年5月1日", "1990-05-01", etc. to `Date` |
| **Bazi / element from birthday** | `src/lib/baziCalculator.js` (BaziCalculator), `src/lib/enhancedInitialAnalysis.js` (EnhancedInitialAnalysis.calculateBazi, getChineseZodiac) | Year/day element (金木水火土) → map to product `elementType` (metal, wood, water, fire, earth) |
| **Design doc** | `docs/SHOP_ASSISTANT_INTELLIGENT_DESIGN.md` | Conversation-first, no state machine; product list in context; optional `RECOMMEND_PRODUCTS: id1,id2` |

---

## Architecture Overview

```
User message
    ↓
POST /api/shop-assistant
    ├── 1. Load or create session (conversation history, optional stored birthday)
    ├── 2. Detect birthday in message (if not yet stored) → parse → store in session
    ├── 3. If birthday available: compute 八字/五行 (element) via BaziCalculator / EnhancedInitialAnalysis
    ├── 4. Fetch products: all active, or filter by elementType + tags (from concern inferred from conversation)
    ├── 5. Build system prompt: role + product list string + rules + (optional) "User's element: 金, suggest 金/土 products"
    ├── 6. Messages = [system, ...history, user]
    ├── 7. DeepSeek one call → natural reply
    ├── 8. Parse RECOMMEND_PRODUCTS: id1,id2 from reply (if present) → resolve to product objects
    ├── 9. Save user + assistant messages to history
    └── 10. Return { response, recommendedProducts, userElement? }
```

No multi-step state machine: **one LLM turn per user message**, with full history and product context.

---

## Step-by-Step Implementation

### 1. New API route: `POST /api/shop-assistant`

**File:** `src/app/api/shop-assistant/route.js`

**Request body:**

```json
{
  "message": "用戶輸入的內容",
  "sessionId": "optional-session-id",
  "locale": "zh-TW",
  "region": "HK",
  "birthday": "optional YYYY-MM-DD if already known"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "助理回覆的自然語言內容",
    "recommendedProducts": [{ "_id", "productId", "name", "price", "images", "elementType", "tags", ... }],
    "userElement": "metal",
    "parsedBirthday": "1990-05-01"
  }
}
```

**Logic outline:**

1. **Session / history**  
   - Use `sessionId` to load last N messages (e.g. 20) from DB or in-memory store.  
   - If no `sessionId`, create one (e.g. `shop-{timestamp}-{random}`).  
   - You can store history in MongoDB (e.g. `ShopAssistantSession` with `sessionId`, `messages[]`, `birthday`, `userElement`, `updatedAt`).

2. **Birthday**  
   - If `birthday` in body, use it.  
   - Else run `ImprovedConversationFlow.detectBirthdayInfo(message)`. If `hasBirthday`, parse with `parseFlexibleDate(birthdayInfo.rawText)`.  
   - Store in session for next turns.

3. **Element from birthday**  
   - Use `BaziCalculator.getYearPillar(birthDate)` (or full bazi if you have hour) to get `element` (金/木/水/火/土).  
   - Map to DB: 金→metal, 木→wood, 水→water, 火→fire, 土→earth.  
   - Optional: use `EnhancedInitialAnalysis.generatePersonalAnalysis(birthday, "綜合", "", locale)` for a short text summary to put in context (or skip to keep latency low and only pass element + 生肖).

4. **Product list**  
   - `GET /api/shop/products` internally (or `Product.find({ isActive: true }).lean()`) with optional filters:  
     - `elementType`: user’s element (and optionally 相生, e.g. 金→土).  
     - `tags`: if you infer 財運/感情/事業/健康 from conversation, filter by `tags`.  
   - Build a string for the prompt, e.g. one line per product:  
     `id: productId, name: name.zh_TW, price: price, element: elementType, tags: tags.join(','), benefits: benefits.slice(0,2).join('; ')`

5. **System prompt (concise)**  
   - Role: 你是 HarmoniQ 風水開運商店的客服助理，親切、專業，用繁體/簡體根據 locale 回覆。  
   - Product list: 僅可推薦以下商品，不可虛構。  
   - Optional: 用戶生日已提供，其五行屬性為 {userElement}，可優先推薦與其相合或補足的商品（參考 elementType 與 tags）。  
   - Rules: 自然對話；可回答店鋪問題（運費、付款、退換）；若適合則推薦 1–3 件商品並簡短說明原因；結尾若推薦了商品，請另起一行寫 `RECOMMEND_PRODUCTS: productId1, productId2`（用英文逗號分隔，不要其他文字）。  
   - 若用戶只是打招呼或閒聊，自然回應即可，不必強推商品。

6. **Messages**  
   - `[{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }]`.  
   - Trim history to last 10–20 turns to stay within token limits.

7. **DeepSeek call**  
   - Use `callDeepSeekAPI` from `@/lib/deepseekClient` with `process.env.DEEPSEEK_API_KEY`.  
   - `temperature`: 0.7–0.8 for natural replies; `max_tokens`: 800–1000.

8. **Parse recommendations**  
   - In assistant reply, look for line `RECOMMEND_PRODUCTS: id1, id2, id3`.  
   - Extract product IDs, resolve with `Product.find({ productId: { $in: ids } })`, return as `recommendedProducts`.  
   - Remove that line from `response` before returning (so the user doesn’t see it).

9. **Save history**  
   - Append `{ role: "user", content: message }` and `{ role: "assistant", content: response }` to session; save.

10. **Return**  
    - `{ success: true, data: { response, recommendedProducts, userElement?, parsedBirthday? } }`.

---

### 2. Birthday → element (concrete reuse)

- **Parse date:** use `parseFlexibleDate` from `src/app/api/smart-chat2/route.js` (or copy into a small util so shop-assistant can import).
- **Bazi element:**  
  - `BaziCalculator.getYearPillar(birthDate)` returns `{ element }` (e.g. 金).  
  - Map 金→metal, 木→wood, 水→water, 火→fire, 土→earth.  
- **Optional short analysis text:**  
  - `EnhancedInitialAnalysis.generatePersonalAnalysis(birthday, "綜合", "", locale)` returns a block of text you can put in the system prompt as “User’s brief analysis (use only to inform product suggestions).”

---

### 3. Product filtering for “initial analysis + suggest”

- When you have **userElement** (e.g. metal):  
  - Query products with `elementType: userElement` (or `elementType: { $in: [userElement, complementaryElement] }` if you define 相生, e.g. 金→土).  
- When you infer **concern** (財運/感情/事業/健康) from last message or history:  
  - Map to tags: 財運→wealth, 感情→love, 事業→career, 健康→health.  
  - Filter `tags: { $in: [mappedTag] }`.  
- Combine: e.g. `{ isActive: true, $or: [ { elementType: userElement }, { tags: { $in: inferredTags } } ] }` or two separate fetches and merge.  
- Cap list at ~30–50 products and pass that to the prompt; increase `max_tokens` if the product list is long.

---

### 4. Frontend (shop assistant UI)

- **Where:**  
  - Option A: Dedicated page `/[locale]/shop/assistant` (or `/shop/chat`).  
  - Option B: Floating chat widget on shop/shop category pages that opens a drawer or modal.
- **Behavior:**  
  - Input + Send; on send, `POST /api/shop-assistant` with `message`, `sessionId` (from state or generate once), `locale`.  
  - Append user message and assistant `response` to the thread.  
  - If `recommendedProducts.length > 0`, render product cards below the message with “加入購物車” (reuse `ProductCard` or similar).  
  - Optional: show a small “根據你的生日已為你推薦” when `userElement` is present.

---

### 5. Conversation storage

- **Option A – MongoDB:**  
  - Collection `shop_assistant_sessions`: `{ sessionId, messages: [{ role, content }], birthday?, userElement?, updatedAt }`.  
  - TTL index on `updatedAt` (e.g. 24h) to auto-delete old sessions.
- **Option B – In-memory (Map):**  
  - For MVP, store by `sessionId` in a global Map; sessions lost on restart.  
  - Then migrate to MongoDB when you need persistence.

---

## Human-like conversation and when to suggest

The AI should feel like a **friendly, real person** who works at the shop — not a bot that steers every message to products.

- **Free conversation:** The customer can talk about anything (hello, weather, work stress, where is the shop, do you have gift recommendations, I want to boost wealth…). Reply naturally. If they only say hi or chat, reply in kind (e.g. 你好呀，有什麼可以幫到你？). Do **not** immediately push products or feng shui.
- **Topics need not be feng shui:** Life, mood, work, relationships, general shopping questions are fine. Answer like a human; bring in products or 八字 only when it fits (e.g. they ask for something to give as a gift or want to boost 財運).
- **Suggest only when it fits:** Suggest products when they ask for recommendations, mention a need (送禮、招財、感情、健康、事業), or the conversation naturally leads there. Do **not** suggest when they are only greeting, venting, or asking unrelated questions. Keep tone warm and never pushy; wait for the right moment.

---

## Prompt Design (Summary)

- **System:**  
  - Role + product list (id, name, price, element, tags, short benefits).  
  - If birthday known: “User’s element: 金 (metal); prefer suggesting products with elementType metal or 土.”  
  - Rules: natural conversation, answer shop questions, suggest 1–3 products when appropriate, output `RECOMMEND_PRODUCTS: id1,id2` when recommending, never invent products.
- **User/Assistant:**  
  - Only conversation history + current user message.

**Key instruction to include in the system prompt:**  
"只有在客人明確詢問推薦、或提到需求（例如送禮、招財、感情、健康）、或話題自然帶到想買東西時，才推薦商品；否則就像一般人一樣自然對話即可。語氣親切、不硬銷、不強推。"

---

## What Stays the Same

- **DeepSeek** for all assistant replies (single model, one call per message).  
- **Product data** from existing Product model and `/api/shop/products` (or direct DB in the same app).  
- **Birthday/八字 logic** from BaziCalculator + optional EnhancedInitialAnalysis; no new AI for “initial analysis” — only structured data (element + optional short summary) passed into the prompt.  
- **Price range** and **filters** already in your products API; the agent can mention “我們有不同價位的商品” and rely on the product list you inject.

---

## Suggested Order of Work

1. **API route**  
   - Implement `POST /api/shop-assistant` with: no history first (single turn), no birthday; product list from DB; system prompt; DeepSeek call; parse `RECOMMEND_PRODUCTS` and return `response` + `recommendedProducts`.
2. **Add history**  
   - Add in-memory or MongoDB session storage; pass last N turns to DeepSeek.
3. **Add birthday**  
   - Detect and parse birthday; store in session; compute element; filter products by `elementType`; add to system prompt.
4. **Optional short analysis**  
   - Call `EnhancedInitialAnalysis.generatePersonalAnalysis` when birthday is first set; cache result in session; add summary to system prompt.
5. **Frontend**  
   - Add shop assistant page or widget; call API; show messages and recommended product cards.

---

## Risks and Mitigations

- **Token limit:** Long product list + long history can exceed context. Mitigate: cap history (e.g. 20 messages), summarize very old turns, or pass only product IDs + short names and fetch full product details when rendering recommendations.
- **Wrong product IDs in reply:** Model might hallucinate IDs. Mitigate: in prompt list only valid `productId` values; after parsing, filter `recommendedProducts` to only those that exist in DB.
- **Latency:** One DeepSeek call + optional analysis can be 2–5s. Mitigate: show “正在回覆…” in UI; optional: stream response if DeepSeek supports it later.

---

## Limitations of This Plan

1. **Model behavior is not guaranteed** — The AI follows “talk like a human, suggest only when needed” only as well as the model allows. It may occasionally suggest when you’d prefer it didn’t, or stay too passive. Mitigation: tune the prompt and add example turns.

2. **Context / token limits** — History + product list + system prompt can hit DeepSeek’s context limit. You may need to cap history (e.g. 20 messages), limit products in the prompt (e.g. 30–50), or shorten descriptions. Long chats may “forget” early context.

3. **Product list is a snapshot** — The agent sees products at request time. It does not see real-time stock or price changes unless you inject that into the prompt or refresh per request.

4. **No actions beyond suggestion** — The agent only returns text + recommended product IDs. It cannot add to cart, create orders, check order status, or access user account data. The frontend must call your existing cart/checkout APIs.

5. **Birthday without hour = year pillar only** — Using only date (no time) gives year-pillar 五行, which is less precise than full 八字. The “initial analysis” is lightweight (element-based suggestion), not full 命理.

6. **Single AI provider** — The plan assumes DeepSeek only. There is no built-in fallback if the API is down or rate-limited; you’d add error handling and optional fallback yourself.

7. **No streaming** — The flow is one request → one full reply. Streaming (typing effect) would require DeepSeek `stream: true` and SSE handling.

8. **Hallucination risk** — The model might invent product IDs or wrong shop info. Mitigation: list only real productIds in the prompt; filter returned recommendations to existing DB products; put accurate shop policies in the system prompt.

9. **No required auth** — Anyone can chat. That can mean higher cost if abused, and no built-in link to “this user’s orders” unless you pass user id and fetch order data into context. You can add auth or rate limiting.

10. **Out of scope unless extended** — Order status, refunds, account-specific data, multi-step form filling, and proactive messages are not in the plan. Adding them needs extra APIs, context, and prompt updates.

11. **Language** — The plan assumes 繁體/簡體. Other locales (e.g. English) need prompt and product-field adjustments (e.g. name.en).

12. **No formal evaluation** — There is no defined metric for “correct moment to suggest” or “human-like tone”; quality is judged by reading conversations and iterating.

---

## Summary

You already have the right building blocks (DeepSeek client, products API, birthday detection, Bazi/element calculation, and a clear design doc). The main work is:

1. One new API route that composes: session/history → birthday/element → product list → system prompt → DeepSeek → parse recommendations → save history → return.  
2. Reuse `parseFlexibleDate`, `detectBirthdayInfo`, `BaziCalculator`, and optionally `EnhancedInitialAnalysis` for “initial analysis” context.  
3. A simple chat UI that calls this API and displays messages + recommended product cards.

This gives you a single service agent that answers shop questions, holds normal conversation, uses birthday-based 八字/五行 to tailor product suggestions, and recommends only real products from your database, all using DeepSeek.
