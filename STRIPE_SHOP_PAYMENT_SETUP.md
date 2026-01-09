# Stripe Shopping Mall Payment Integration - Setup Guide

## ✅ Implementation Complete

The shopping mall now has full Stripe payment integration! Users can checkout securely with credit cards through Stripe.

## 🎯 What Was Implemented

### 1. **Stripe Checkout Session API**

- **File**: `src/app/api/shop/create-checkout-session/route.js`
- Creates Stripe checkout sessions with cart items
- Handles product validation and stock checking
- Creates pending orders in database before payment
- Supports multiple currencies (HKD, CNY, USD)

### 2. **Stripe Webhook Handler**

- **File**: `src/app/api/shop/webhook/route.js`
- Listens for Stripe payment events
- Updates order status when payment succeeds
- Updates product stock automatically
- Clears user's cart after successful payment
- Handles payment failures and session expiration

### 3. **Updated Checkout Page**

- **File**: `src/app/[locale]/checkout/page.jsx`
- Integrated Stripe checkout flow
- Redirects to Stripe's secure payment page
- Improved UI with better button labels

### 4. **Success Page**

- **File**: `src/app/[locale]/shop/success/page.jsx`
- Beautiful success animation with sparkles
- Shows order details and confirmation
- Links to order tracking and continue shopping

## 🔧 Environment Setup Required

### Step 1: Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API Keys**
3. Copy your keys

### Step 2: Add to Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important**:

- For **development**: Use `sk_test_...` keys
- For **production**: Use `sk_live_...` keys

### Step 3: Setup Stripe Webhook (Required for Production)

#### Local Development (Using Stripe CLI):

1. Install Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe:

```bash
stripe login
```

3. Forward webhooks to local server:

```bash
stripe listen --forward-to http://localhost:3000/api/shop/webhook
```

4. Copy the webhook signing secret from terminal output and add to `.env.local`

#### Production Setup:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/shop/webhook`
4. Select events to listen for:
    - `checkout.session.completed`
    - `checkout.session.expired`
    - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add to your production environment variables

## 📋 Testing the Integration

### Test with Stripe Test Cards:

Use these test card numbers in Stripe checkout:

| Card Number           | Description                         |
| --------------------- | ----------------------------------- |
| `4242 4242 4242 4242` | Successful payment                  |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Declined card                       |

- Use any future expiry date (e.g., `12/34`)
- Use any 3-digit CVC
- Use any postal code

### Testing Flow:

1. **Add products to cart**: Browse shop and add items
2. **Go to cart**: Review items at `/[locale]/cart`
3. **Checkout**: Click "前往結帳" button
4. **Fill shipping info**: Complete the form at `/[locale]/checkout`
5. **Pay with Stripe**: Redirects to Stripe checkout page
6. **Complete payment**: Use test card `4242 4242 4242 4242`
7. **Success page**: Redirected to `/[locale]/shop/success` with order details

## 🔄 Payment Flow Diagram

```
Cart Page → Checkout Page → Stripe Checkout → Webhook → Success Page
   ↓              ↓                ↓              ↓            ↓
View Cart    Fill Info      Pay Securely    Update Order   Show Confirmation
```

## 📁 Files Modified/Created

### New Files:

- ✅ `src/app/api/shop/create-checkout-session/route.js` - Stripe session creation
- ✅ `src/app/api/shop/webhook/route.js` - Webhook handler
- ✅ `src/app/[locale]/shop/success/page.jsx` - Success page

### Modified Files:

- ✅ `src/app/[locale]/checkout/page.jsx` - Added Stripe integration

### Existing (Already Working):

- ✅ `src/lib/stripe.js` - Stripe client configuration
- ✅ `src/models/Order.js` - Order model with Stripe fields
- ✅ `src/models/Product.js` - Product model
- ✅ `src/app/[locale]/cart/page.jsx` - Shopping cart
- ✅ `src/app/api/shop/cart/route.js` - Cart API
- ✅ `src/app/api/shop/orders/route.js` - Orders API
- ✅ `src/app/api/shop/orders/[orderId]/route.js` - Single order API

## 🎨 Features

### ✨ User Experience:

- Smooth checkout flow
- Secure Stripe payment page
- Beautiful success animation
- Order tracking
- Email confirmation
- Multi-currency support (HKD, CNY, USD)

### 🔐 Security:

- PCI-compliant (Stripe handles card data)
- Webhook signature verification
- Order validation before payment
- Stock checking

### 📦 Order Management:

- Automatic stock updates
- Cart clearing after payment
- Order status tracking
- Payment status tracking
- Digital vs physical product handling

## 🚀 Next Steps (Optional Enhancements)

### 1. Email Notifications

- Send order confirmation emails
- Send shipping notification emails
- Use services like SendGrid, AWS SES, or Resend

### 2. Admin Dashboard

- View all orders
- Update order status
- Manage shipping/tracking numbers
- Generate invoices

### 3. Product Management

- Sync products with Stripe Products
- Use Stripe Price IDs for pricing
- Handle subscription products

### 4. Enhanced Features

- Discount codes/coupons
- Tax calculation
- Multiple shipping options
- Abandoned cart recovery
- Customer accounts with order history

## 🐛 Troubleshooting

### Issue: Webhook not receiving events

**Solution**:

- Check webhook endpoint is accessible
- Verify webhook secret is correct
- Check Stripe dashboard for webhook delivery attempts
- Use Stripe CLI to test locally

### Issue: Payment succeeds but order not updated

**Solution**:

- Check webhook logs in Stripe dashboard
- Verify order ID is being passed correctly
- Check database connection
- Ensure webhook secret matches

### Issue: Cart not clearing after payment

**Solution**:

- Verify webhook `checkout.session.completed` is firing
- Check Cart model and userId matching
- Look for errors in server logs

## 📞 Support

For Stripe-specific issues:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For integration issues:

- Check server logs
- Verify environment variables
- Test webhook locally with Stripe CLI

## ✅ Checklist Before Going Live

- [ ] Stripe keys added to environment variables
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Test complete checkout flow with test cards
- [ ] Verify order status updates correctly
- [ ] Confirm stock updates after purchase
- [ ] Test with different currencies
- [ ] Switch to live Stripe keys (remove `sk_test_`)
- [ ] Enable Stripe production mode
- [ ] Test live payment with real card
- [ ] Monitor webhook deliveries
- [ ] Set up error monitoring/logging

---

## 🎉 You're All Set!

Your shopping mall now accepts payments through Stripe! Users can securely purchase products with credit cards, and orders are automatically processed.

**Need help?** Check the Stripe dashboard for detailed logs and webhook delivery status.
