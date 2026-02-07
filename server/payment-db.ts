/**
 * Payment Database Queries
 * Handles subscription, payment, and user feature database operations
 */

import { eq, and } from 'drizzle-orm';
import { subscriptions, payments, userFeatures, Subscription, Payment, UserFeatures, InsertSubscription, InsertPayment, InsertUserFeatures } from '../drizzle/schema';
import { getDb } from './db';

/**
 * Get or create subscription for user
 */
export async function getOrCreateSubscription(userId: number, stripeCustomerId: string): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new subscription record
  await db.insert(subscriptions).values({
    userId,
    stripeCustomerId,
    plan: 'free',
    status: 'active',
  });

  return getSubscriptionByUserId(userId);
}

/**
 * Get subscription by user ID
 */
export async function getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update subscription
 */
export async function updateSubscription(
  userId: number,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(subscriptions)
    .set(updates)
    .where(eq(subscriptions.userId, userId));

  return getSubscriptionByUserId(userId);
}

/**
 * Record a payment
 */
export async function recordPayment(payment: InsertPayment): Promise<Payment | null> {
  const db = await getDb();
  if (!db) return null;

  await db.insert(payments).values(payment);

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, payment.stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get payment by Stripe payment intent ID
 */
export async function getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get user payments
 */
export async function getUserPayments(userId: number, limit = 10): Promise<Payment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .limit(limit);
}

/**
 * Get or create user features
 */
export async function getOrCreateUserFeatures(userId: number): Promise<UserFeatures | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(userFeatures)
    .where(eq(userFeatures.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user features record
  await db.insert(userFeatures).values({
    userId,
    hasColorEditor: false,
    hasMultiFormatExport: false,
    hasBulkProcessing: true,
    monthlyConversions: 100,
    monthlyConversionsUsed: 0,
    maxImagesPerBatch: 100,
  });

  return getUserFeatures(userId);
}

/**
 * Get user features
 */
export async function getUserFeatures(userId: number): Promise<UserFeatures | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userFeatures)
    .where(eq(userFeatures.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update user features
 */
export async function updateUserFeatures(
  userId: number,
  updates: Partial<UserFeatures>
): Promise<UserFeatures | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(userFeatures)
    .set(updates)
    .where(eq(userFeatures.userId, userId));

  return getUserFeatures(userId);
}

/**
 * Increment monthly conversions used
 */
export async function incrementConversionsUsed(userId: number, count = 1): Promise<UserFeatures | null> {
  const db = await getDb();
  if (!db) return null;

  const features = await getUserFeatures(userId);
  if (!features) return null;

  const newUsed = Math.min(features.monthlyConversionsUsed + count, features.monthlyConversions);

  return updateUserFeatures(userId, {
    monthlyConversionsUsed: newUsed,
  });
}

/**
 * Reset monthly conversions (should be called on monthly basis)
 */
export async function resetMonthlyConversions(userId: number): Promise<UserFeatures | null> {
  return updateUserFeatures(userId, {
    monthlyConversionsUsed: 0,
  });
}

/**
 * Check if user has reached monthly limit
 */
export async function hasReachedMonthlyLimit(userId: number): Promise<boolean> {
  const features = await getUserFeatures(userId);
  if (!features) return false;

  return features.monthlyConversionsUsed >= features.monthlyConversions;
}

/**
 * Upgrade user to pro plan
 */
export async function upgradeUserToPro(userId: number, stripeSubscriptionId: string): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(subscriptions)
    .set({
      plan: 'pro',
      status: 'active',
      stripeSubscriptionId,
    })
    .where(eq(subscriptions.userId, userId));

  // Update user features for pro plan
  await updateUserFeatures(userId, {
    hasColorEditor: true,
    hasMultiFormatExport: true,
    monthlyConversions: 1000,
    maxImagesPerBatch: 100,
  });

  return getSubscriptionByUserId(userId);
}

/**
 * Downgrade user to free plan
 */
export async function downgradeUserToFree(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(subscriptions)
    .set({
      plan: 'free',
      status: 'canceled',
      stripeSubscriptionId: null,
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));

  // Update user features for free plan
  await updateUserFeatures(userId, {
    hasColorEditor: false,
    hasMultiFormatExport: false,
    monthlyConversions: 100,
    maxImagesPerBatch: 100,
  });

  return getSubscriptionByUserId(userId);
}
