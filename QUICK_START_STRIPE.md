# 🚀 Quick Start - Test Stripe Checkout

## Immediate Testing (3 Steps)

### Step 1: Add Stripe Keys to .env.local

Create or update `.env.local` file in the root directory:

```bash
# Add these lines to your .env.local file
STRIPE_SECRET_KEY=sk_test_51QgESSD5oj2PJ0zwXiDjOjM0qfT0qfT0qfT0qfT0qfT0qfT0qfT0qfT0qfT0qfT0qfT
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret_here
```

**Get your Stripe test keys:**

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the "Secret key" (starts with `sk_test_`)
3. Paste it as `STRIPE_SECRET_KEY`

### Step 2: Run Your Development Server

```bash
npm run dev
```

### Step 3: Test the Checkout Flow

1. **Browse Shop**: http://localhost:3000/zh-CN/shop
2. **Add to Cart**: Click any product → "加入購物車"
3. **View Cart**: Click cart icon or go to `/zh-CN/cart`
4. **Checkout**: Click "前往結帳"
5. **Fill Form**: Complete shipping information
6. **Pay**: Click "前往支付" - redirects to Stripe
7. **Use Test Card**:
    - Card: `4242 4242 4242 4242`
    - Expiry: `12/34` (any future date)
    - CVC: `123` (any 3 digits)
    - Postal: `12345` (any)
8. **Success**: You'll see the success page!

## 🧪 Test Cards

| Card Number           | Result                                 |
| --------------------- | -------------------------------------- |
| `4242 4242 4242 4242` | ✅ Success                             |
| `4000 0025 0000 3155` | 🔐 3D Secure (requires authentication) |
| `4000 0000 0000 9995` | ❌ Declined                            |

## ⚡ Setup Webhooks (For Full Flow)

### For Local Development:

1. Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other systems: https://stripe.com/docs/stripe-cli
```

2. Login:

```bash
stripe login
```

3. Forward webhooks (run in separate terminal):

```bash
stripe listen --forward-to localhost:3000/api/shop/webhook
```

4. Copy the webhook secret (starts with `whsec_`) and add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

### Without Webhook (Testing Only):

You can test payments WITHOUT webhooks, but:

- ❌ Orders won't automatically update to "paid"
- ❌ Stock won't decrease
- ❌ Cart won't clear

Manual workaround: Check order status in your database and update manually.

## ✅ What Works Now

- ✅ Complete checkout flow
- ✅ Stripe secure payment page
- ✅ Order creation
- ✅ Beautiful success page
- ✅ Multi-currency support
- ✅ Product validation
- ✅ Stock checking

## 🔄 Complete Flow (With Webhooks):

- ✅ All above +
- ✅ Automatic order status update to "paid"
- ✅ Automatic stock reduction
- ✅ Cart clearing after payment
- ✅ Payment confirmation in database

## 🎯 URL Routes

- Shop: `/[locale]/shop`
- Cart: `/[locale]/cart`
- Checkout: `/[locale]/checkout`
- Success: `/[locale]/shop/success`
- Order Detail: `/[locale]/orders/[orderId]`

## 📝 Quick Checklist

- [ ] Add `STRIPE_SECRET_KEY` to `.env.local`
- [ ] Run `npm run dev`
- [ ] Add product to cart
- [ ] Go to checkout
- [ ] Pay with test card `4242 4242 4242 4242`
- [ ] See success page
- [ ] (Optional) Setup Stripe CLI for webhooks

## 🐛 Common Issues

**Issue**: "Unauthorized" error

- **Fix**: Make sure you're logged in (NextAuth)

**Issue**: Payment succeeds but order not updated

- **Fix**: Setup webhooks using Stripe CLI

**Issue**: "Invalid Stripe key"

- **Fix**: Check `.env.local` has correct `STRIPE_SECRET_KEY`

**Issue**: Redirect fails

- **Fix**: Check `NEXTAUTH_URL` in `.env.local`

## 🎉 You're Ready!

Just add your Stripe test key and start testing! The complete payment flow is working.

**Need your Stripe keys?** → https://dashboard.stripe.com/test/apikeys
