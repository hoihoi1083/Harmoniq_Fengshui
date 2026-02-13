# Intelligent Shop Assistant – Design (Conversation-First)

## Why the current chat feels mechanical

The existing smart-chat2 flow is **state-machine driven**:

1. **Rigid steps**: Detect topic → ask for birthday → user must reply "1" or "2" → run analysis → suggest report → ask for payment. The code has many branches (`conversationState`: `birthday_collection`, `awaiting_birthday_choice`, `asking_detailed_report`, etc.). Users who don’t follow the expected path get scripted prompts.

2. **AI used for classification, not conversation**: The model is asked to return **JSON** (e.g. `detectedTopic`, `specificProblem`, `aiResponse`). The **code** then decides the next step (e.g. “ask for birthday”, “show report link”). So the “conversation” is really: AI classifies → code picks a template or fixed path. The LLM doesn’t freely decide how to respond.

3. **Template replies**: Many answers are fixed strings (“請選擇 1️⃣ 使用這個生日…”). That makes every conversation feel like a form.

4. **Single goal**: The flow is optimized for “collect birthday → generate report → payment”. Any other user need (e.g. “I just want a quick tip”, “I don’t want to give birthday”) doesn’t fit the tree well.

So: **different users with unlimited, varied requests** are forced into the same steps, which feels mechanical.

---

## What “more intelligent” means here

- **Human-like**: Natural, warm, varied wording; can chat, empathize, or go straight to advice depending on what the user said.
- **Flexible**: Handles greetings, vague questions, detailed problems, “I don’t want to share birthday”, topic changes, follow-ups — without forcing a fixed sequence.
- **Still goal-oriented**: The assistant should still **suggest products when it fits** (after understanding the problem and optionally birthday), but the **model** decides when and how, not a state machine.

---

## Approach: conversation-first, one LLM turn per message

### Core idea

- **No state machine** for the shop assistant. No “step 1: collect birthday, step 2: suggest report”.
- Every turn: send **full conversation history** + **current product catalog (or filtered)** + **system instructions** to the LLM. The model produces **one natural-language reply** and, when appropriate, **recommends products from the list**.
- **Goal is in the prompt**, not in code: “You are a warm feng shui shop assistant. When it fits, suggest 1–3 products from the list and explain why. Never be pushy. If they’re just chatting, chat.”

### Data flow (per user message)

1. **Input**: `message`, optional `sessionId` (for history), optional `locale`/`region`.
2. **Load**: Conversation history for `sessionId` (last N turns, e.g. 10 or 20 messages).
3. **Context**:
   - If user ever shared a birthday in this conversation (or we have it from profile), compute simple feng shui hint (e.g. element) and optionally **filter products** by `elementType` / `tags`. Otherwise use a broader product set (e.g. by topic tags inferred from last message or whole conversation).
   - Build a **product list string** (id, name, price, benefits/tags) for the model.
4. **System prompt** (fixed + dynamic parts):
   - Role: friendly feng shui shop assistant; reply in 繁體/簡體 per locale.
   - Available products: [product list].
   - Optional: “User’s birthday (if known): …; suggested element/theme: ….”
   - Rules: Be natural and human; when it fits, recommend 1–3 products from the list with short reason; never invent products; never be pushy; if they only say hi, say hi back and offer help; handle any question or mood.
5. **Messages to API**: `[ { role: "system", content: systemPrompt }, ...historyMessages, { role: "user", content: message } ]`.
6. **One DeepSeek call** → single natural-language `response`.
7. **Product recommendations**: Either:
   - **Option A**: Ask the model to end the reply with a line like `RECOMMEND_PRODUCTS: id1, id2, id3` and parse that to return `recommendedProducts: [{ productId, ... }]` for the UI; or
   - **Option B**: Second small LLM call or structured prompt: “Given your last reply and the product list, which product IDs did you recommend?” and return those IDs.  
   Option A is simpler and keeps one call.
8. **Return**: `{ response, recommendedProducts }`. Frontend shows the reply and, if `recommendedProducts.length > 0`, shows product cards with “Add to cart”.

### Why this is more “intelligent”

- **No rigid steps**: User can say anything; the model adapts (answer, empathize, ask a clarifying question, or recommend products when it makes sense).
- **Unlimited requests**: New topics, vague questions, “I don’t want to give birthday”, “just browsing” — all handled by the same endpoint; the LLM decides the tone and content.
- **Same ultimate goal**: By putting “when it fits, suggest products from the list” in the system prompt, the assistant still moves toward product suggestions without forcing a fixed path.
- **Truly conversational**: History is in the context, so the model can refer to earlier messages and maintain continuity.

---

## Implementation outline

1. **New API route**: `POST /api/shop-assistant` (or `/api/intelligent-shop-chat`).
   - Body: `{ message, sessionId?, locale?, region?, birthday? }`.
   - Load conversation history (from DB or in-memory by sessionId; cap at 20 messages).
   - Optional: extract or accept `birthday`; compute element; filter products by `elementType` + `tags` (from concern inferred from conversation or message).
   - Fetch product list (all active or filtered); build product list string.
   - Build system prompt as above (role + product list + rules + optional birthday/element).
   - Messages = [system, ...history, user].
   - Call `callDeepSeekAPI` from `@/lib/deepseekClient`.
   - Parse `RECOMMEND_PRODUCTS: id1, id2` from the end of the reply (or use a short structured extraction); resolve to product objects; remove that line from the displayed `response`.
   - Save assistant message (and user message) to history for next turn.
   - Return `{ response, recommendedProducts }`.

2. **Frontend**: Shop page (or dedicated “shop assistant” page) with a chat UI:
   - Input + send; on send, POST to `/api/shop-assistant` with `message` and `sessionId`.
   - Append user message and assistant reply to the thread; if `recommendedProducts` exists, render product cards below the message with “Add to cart”.

3. **Optional**: If you want the main chat (smart-chat2) to feel more intelligent too, you can later add a “simple mode” or a separate endpoint that uses this same pattern (conversation-first, full history, one LLM reply per turn, goal in prompt) without the product list and without the report funnel. That would serve users who want a freer dialogue while keeping the current flow for users who prefer the guided report path.

---

## Summary

| Current (mechanical)              | Intelligent (proposed)                    |
|-----------------------------------|------------------------------------------|
| State machine drives next step    | LLM decides next reply from context     |
| AI returns JSON → code branches   | AI returns natural text (+ product IDs)  |
| Fixed templates for many replies  | One natural reply per turn              |
| One path: topic → birthday → report | Many paths; goal in prompt, not in code |
| Hard to satisfy varied requests   | Same API handles unlimited request types |

You can achieve a more intelligent shop assistant by **reusing** your existing pieces (DeepSeek client, product API, optional Bazi/element logic for filtering) and **changing the control flow**: from “state machine + classification” to “conversation-first with full history + product context and a clear, goal-aware system prompt.”
