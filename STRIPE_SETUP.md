# Stripe Payment Integration Setup

This guide explains how to set up Stripe payment processing for the SVG Bulk Vectorizer application.

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Access to Stripe Dashboard
3. Node.js and pnpm installed locally

## Step 1: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** → **API Keys**
3. You'll see two keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

⚠️ **Important**: Never share your Secret Key publicly. It will be stored securely in your environment variables.

## Step 2: Create Products and Prices in Stripe

### Create Pro Monthly Plan

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Fill in:
   - **Name**: Pro Monthly
   - **Description**: Unlimited conversions, color editor, multi-format export
   - **Type**: Service
4. Click **Create product**
5. Under **Pricing**, click **Add price**
   - **Price**: $9.99
   - **Billing period**: Monthly
   - Copy the **Price ID** (starts with `price_`)

### Create Pro Yearly Plan

1. Repeat the above steps with:
   - **Name**: Pro Yearly
   - **Price**: $99.99
   - **Billing period**: Yearly
   - Copy the **Price ID**

### Create Enterprise Plan (Optional)

1. Repeat with:
   - **Name**: Enterprise
   - **Price**: $299.99
   - **Billing period**: Monthly
   - Copy the **Price ID**

## Step 3: Configure Environment Variables

The Stripe keys are managed through the Manus platform's built-in secrets system. You'll need to configure:

1. **STRIPE_SECRET_KEY** - Your Stripe Secret Key (sk_...)
2. **VITE_STRIPE_PUBLISHABLE_KEY** - Your Stripe Publishable Key (pk_...)
3. **STRIPE_PRICE_PRO_MONTHLY** - Price ID for Pro Monthly plan
4. **STRIPE_PRICE_PRO_YEARLY** - Price ID for Pro Yearly plan
5. **STRIPE_PRICE_ENTERPRISE** - Price ID for Enterprise plan (optional)

These should be added through the Manus Management UI under **Settings** → **Secrets**.

## Step 4: Set Up Webhook (Optional but Recommended)

Webhooks allow Stripe to notify your application about payment events.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 5: Test the Integration

### Test Cards

Use these test card numbers in Stripe's test mode:

- **Successful payment**: 4242 4242 4242 4242
- **Requires authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

Use any future expiration date and any 3-digit CVC.

### Testing Locally

1. Start the dev server: `pnpm dev`
2. Navigate to `/account` page
3. Click "Upgrade to Pro"
4. You'll be redirected to Stripe Checkout
5. Use test card numbers above
6. Complete the payment flow

## Database Schema

The integration uses these tables:

### `subscriptions`
- Tracks user subscription status
- Stores Stripe customer and subscription IDs
- Records plan type and billing period

### `payments`
- Records all payment transactions
- Stores payment intent and invoice IDs
- Tracks payment status (succeeded, failed, etc.)

### `userFeatures`
- Tracks which features user has access to
- Stores usage limits and monthly conversion counts
- Automatically updated when subscription changes

## API Routes

### Payment Routes (tRPC)

All routes are under `/api/trpc/payment.*`:

#### `payment.getSubscription`
Get current user's subscription status

#### `payment.getFeatures`
Get user's available features and usage limits

#### `payment.createCheckoutSession`
Create a Stripe Checkout session for subscription

#### `payment.createPaymentIntent`
Create a payment intent for one-time payments

#### `payment.confirmPayment`
Confirm a payment and update subscription

#### `payment.cancelSubscription`
Cancel user's subscription

#### `payment.getPaymentHistory`
Get user's payment history

## Feature Gating

Features are automatically gated based on subscription plan:

### Free Plan
- 100 conversions/month
- Basic bulk upload (up to 100 images)
- SVG output only
- No color editor
- No multi-format export

### Pro Plan
- 1000 conversions/month
- Color editor enabled
- Multi-format export (EPS, PDF, AI, DXF)
- Priority processing

### Enterprise Plan
- Unlimited conversions
- All Pro features
- Custom integrations
- Priority support

## Troubleshooting

### "Neither apiKey nor config.authenticator provided"

This error occurs when `STRIPE_SECRET_KEY` is not set. Make sure to:
1. Add the secret to Manus Management UI
2. Restart the dev server
3. Check that the environment variable is loaded

### Webhook Signature Verification Failed

1. Ensure `STRIPE_WEBHOOK_SECRET` is correct
2. Check that the endpoint URL is accessible
3. Verify the webhook is enabled in Stripe Dashboard

### Test Cards Not Working

1. Make sure you're in Stripe's **Test Mode**
2. Use the test card numbers provided above
3. Check that the card is not expired

## Production Deployment

Before deploying to production:

1. Switch from Test Mode to Live Mode in Stripe Dashboard
2. Update environment variables with live API keys
3. Update webhook endpoint to production URL
4. Test with real credit cards (use small amounts)
5. Monitor Stripe Dashboard for any issues

## Support

For issues with Stripe integration:
- Check [Stripe Documentation](https://stripe.com/docs)
- Review [Stripe API Reference](https://stripe.com/docs/api)
- Contact [Stripe Support](https://support.stripe.com)

For issues with the SVG Bulk Vectorizer:
- Check the main [README.md](./README.md)
- Review [ATTRIBUTION.md](./ATTRIBUTION.md) for GPL compliance
