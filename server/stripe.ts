/**
 * Stripe Payment Integration
 * Handles payment processing, subscriptions, and webhooks
 */

import Stripe from 'stripe';
import { ENV } from './_core/env';

// Lazy initialization of Stripe client
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(apiKey);
  }
  return stripeInstance;
}

export const stripe = {
  get customers() {
    return getStripeInstance().customers;
  },
  get checkout() {
    return getStripeInstance().checkout;
  },
  get paymentIntents() {
    return getStripeInstance().paymentIntents;
  },
  get subscriptions() {
    return getStripeInstance().subscriptions;
  },
  get paymentMethods() {
    return getStripeInstance().paymentMethods;
  },
  get invoices() {
    return getStripeInstance().invoices;
  },
  get webhooks() {
    return getStripeInstance().webhooks;
  },
} as any;

export interface CreateCheckoutSessionParams {
  userId: number;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentIntentParams {
  userId: number;
  amount: number;
  currency?: string;
  description?: string;
}

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
) {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  return await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: String(userId),
    },
  });
}

/**
 * Create a payment intent for one-time payment
 */
export async function createPaymentIntent({
  userId,
  amount,
  currency = 'usd',
  description,
}: CreatePaymentIntentParams) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    description,
    metadata: {
      userId: String(userId),
    },
  });
}

/**
 * Retrieve a customer by Stripe customer ID
 */
export async function getStripeCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId);
}

/**
 * Retrieve subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Get payment method from Stripe
 */
export async function getPaymentMethod(paymentMethodId: string) {
  return await stripe.paymentMethods.retrieve(paymentMethodId);
}

/**
 * List invoices for a customer
 */
export async function getCustomerInvoices(customerId: string, limit = 10) {
  return await stripe.invoices.list({
    customer: customerId,
    limit,
  });
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(subscriptionId: string) {
  const subscription = await getSubscription(subscriptionId);
  const sub = subscription as any;
  return {
    id: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
  };
}

/**
 * Stripe product and price IDs (should be configured in environment or database)
 */
export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: {
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    name: 'Pro Monthly',
    amount: 9.99,
  },
  PRO_YEARLY: {
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    name: 'Pro Yearly',
    amount: 99.99,
  },
  ENTERPRISE: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    name: 'Enterprise',
    amount: 299.99,
  },
};
