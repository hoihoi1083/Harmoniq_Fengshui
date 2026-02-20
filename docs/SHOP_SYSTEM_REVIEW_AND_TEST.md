# Shop System Review & Test Guide

## 1. System Review (Issues Found & Fixes Applied)

### 1.1 Currency & region (fixed)

- **Issue:** Order detail page (invoice) and cart always showed "HK$"; invoice summary and line items did not support TWD; confirmation email showed "CNY $88" instead of "¥88".
- **Fix:** Order detail page now uses `getOrderCurrencySymbol(order.currency)` so CNY → ¥, HKD → HK$, TWD → NT$. Cart page uses `getProductDisplayPrice(product, region)` and shows region-based symbol. Confirmation email uses `getCurrencySymbol(order.currency)` for all amounts.

### 1.2 Gift report (verified)

- **Flow:** Product has `giftReportTypes` (admin). On product page user selects one → stored in cart as `giftReportType` → checkout sends it → order items store `giftReportType` → order detail and admin order detail show "贈送報告: 財運/感情/事業/健康".
- **Fix:** Cart page now displays gift report label when present (`贈送報告: 財運` etc.).

### 1.3 Admin notification (added)

- **Issue:** No automatic notice to admin when a new order was placed; admin had to open the orders list.
- **Fix:** Optional admin email on new paid shop order. Set `ADMIN_ORDER_NOTIFY_EMAIL` in `.env` to the admin email; when a shop payment completes (Stripe webhook), that address receives a short "新訂單" email with order ID, customer email, total, and link to admin orders.

### 1.4 Cart & checkout consistency (fixed)

- Cart page now uses region (中/港/台) for prices and subtotal/total symbol, matching checkout and Stripe.

### 1.5 Stripe currency (already fixed earlier)

- Checkout sends `region`; create-checkout-session uses CNY/HKD/TWD and region-specific prices for Stripe and order.

---

## 2. Manual Test Checklist (Full Shop Flow)

Use this to test the entire shop system end-to-end.

### Prerequisites

- [ ] Dev server running: `npm run dev`
- [ ] Logged in as a normal user (for cart/checkout)
- [ ] Stripe in test mode: use test card `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] (Optional) Stripe webhook for local: `stripe listen --forward-to localhost:3000/api/webhook` and set `WHSEC` in env

---

### 2.1 Product & gift report

- [ ] Open a product that has **gift report types** set in admin (e.g. 財運, 感情, 事業, 健康).
- [ ] Select a **size** (if applicable) and a **gift report** option.
- [ ] Add to cart.
- [ ] Open cart: the line shows the **gift report label** (e.g. 贈送報告: 財運).
- [ ] Change region (中/港/台) in navbar: cart **prices and total** change (¥ / HK$ / NT$).

### 2.2 Cart

- [ ] Cart shows **region-based prices** and symbol (中 → ¥, 港 → HK$, 台 → NT$).
- [ ] Update quantity (e.g. 2): subtotal/total update.
- [ ] Remove item: cart updates.
- [ ] Click **checkout** (結帳): redirects to checkout page.

### 2.3 Checkout

- [ ] Checkout shows **same region** and **same currency symbol** as cart.
- [ ] Order summary shows correct **per-item price** and **total** for current region.
- [ ] Fill **shipping** (name, phone, address, city, country).
- [ ] Submit: redirects to **Stripe Checkout**.
- [ ] Stripe page shows **correct currency** (CNY / HKD / TWD) and amount matching selected region.

### 2.4 Payment & order

- [ ] Complete payment (test card 4242...).
- [ ] Redirect to **success** page with order ID.
- [ ] Open **My Orders** (or link in success): new order appears with status **已支付**.
- [ ] Open **order detail** (invoice view):
    - [ ] **Currency symbol** correct (¥ / HK$ / NT$) for subtotal, shipping, total.
    - [ ] **Gift report** shown per item if selected (贈送報告: 財運/感情/事業/健康).
    - [ ] **Print** (列印訂單): layout is acceptable for printing.

### 2.5 Customer email

- [ ] Customer receives **order confirmation email** (if Resend is configured).
- [ ] Email shows **correct currency symbol** (¥ / HK$ / NT$) and amounts, not "CNY $".

### 2.6 Admin

- [ ] Log in as **admin**.
- [ ] Open **Admin → Orders** (or `/admin/orders`): new order appears.
- [ ] Open **order detail**: items, amounts, **gift report** (贈送報告), shipping, currency all correct.
- [ ] (If `ADMIN_ORDER_NOTIFY_EMAIL` is set) Admin inbox received **new order notification** email when payment completed.

### 2.7 Region switching

- [ ] With **中** selected: add product → checkout → Stripe shows **CNY**.
- [ ] With **台** selected: add product → checkout → Stripe shows **TWD**.
- [ ] With **港** selected: add product → checkout → Stripe shows **HKD**.

---

## 3. Jest Tests (Shop)

The project includes Jest tests for the shop. Run:

```bash
npm test
```

### 3.1 What’s covered

- **`src/__tests__/lib/shopCheckout.test.js`** – `getStripeCurrencyForRegion` (china → cny, taiwan → twd, hongkong → hkd) and `getPriceForRegion` (priceCNY/priceHKD/priceTWD and fallbacks).
- **`src/__tests__/lib/productPrice.test.js`** – `getProductDisplayPrice` (region, symbol ¥/HK$/NT$, discountedPrice).
- **`src/__tests__/api/shop/cart.test.js`** – POST cart returns 401 when unauthenticated, 400 when productId/quantity missing, 404 when product not found; GET cart returns 401 when unauthenticated.
- **`src/__tests__/api/shop/create-checkout-session.test.js`** – POST returns 401 without auth, 400 when items empty or shipping missing; with valid payload and `region: "china"` / `"taiwan"` / `"hongkong"`, Stripe session is created with correct `currency` (cny/twd/hkd) and `unit_amount` from region-specific price.

### 3.2 Optional: E2E (Playwright)

For full browser flow (login → product → cart → checkout), you can add Playwright later: `npm i -D @playwright/test`.

---

## 4. Env / Config Checklist

- [ ] `STRIPE_SECRET_KEY` – Stripe secret (test key for testing).
- [ ] `WHSEC` – Stripe webhook signing secret (for payment completion and admin email).
- [ ] `RESEND_API_KEY` – For order confirmation and (optional) admin email.
- [ ] `ADMIN_ORDER_NOTIFY_EMAIL` – (Optional) Admin email for new order notifications.

---

## 5. Summary

| Area             | Status | Notes                                               |
| ---------------- | ------ | --------------------------------------------------- |
| Gift report      | OK     | Product → cart → checkout → order → invoice & admin |
| Order / invoice  | Fixed  | Currency symbol (CNY/HKD/TWD) everywhere            |
| Cart             | Fixed  | Region-based price + gift label                     |
| Checkout         | OK     | Region sent; Stripe uses correct currency           |
| Customer email   | Fixed  | Correct symbol (¥ / HK$ / NT$)                      |
| Admin notice     | Added  | Optional email via `ADMIN_ORDER_NOTIFY_EMAIL`       |
| Admin order view | OK     | Shows gift report and correct data                  |

Use the **Manual Test Checklist** above to verify the full flow including gift report, order, invoice, and admin notification.
