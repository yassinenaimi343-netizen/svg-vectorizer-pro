/**
 * Payment Router
 * tRPC routes for payment processing and subscription management
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { stripe, createCheckoutSession, createPaymentIntent, getSubscriptionStatus } from '../stripe';
import {
  getOrCreateSubscription,
  getSubscriptionByUserId,
  recordPayment,
  getOrCreateUserFeatures,
  getUserFeatures,
  upgradeUserToPro,
  downgradeUserToFree,
  getUserPayments,
} from '../payment-db';
import { TRPCError } from '@trpc/server';

export const paymentRouter = router({
  /**
   * Get current subscription status
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getSubscriptionByUserId(ctx.user.id);
    if (!subscription) {
      // Create default free subscription
      return await getOrCreateSubscription(ctx.user.id, '');
    }
    return subscription;
  }),

  /**
   * Get user features and limits
   */
  getFeatures: protectedProcedure.query(async ({ ctx }) => {
    const features = await getOrCreateUserFeatures(ctx.user.id);
    return features || {
      hasColorEditor: false,
      hasMultiFormatExport: false,
      hasBulkProcessing: true,
      monthlyConversions: 100,
      monthlyConversionsUsed: 0,
      maxImagesPerBatch: 100,
    };
  }),

  /**
   * Create checkout session for subscription
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure user has Stripe customer ID
        let subscription = await getSubscriptionByUserId(ctx.user.id);
        if (!subscription || !subscription.stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || '',
            metadata: {
              userId: String(ctx.user.id),
            },
          });
          subscription = await getOrCreateSubscription(ctx.user.id, customer.id);
        }

        const session = await createCheckoutSession({
          userId: ctx.user.id,
          email: ctx.user.email || '',
          priceId: input.priceId,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error('Checkout session creation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        });
      }
    }),

  /**
   * Create payment intent for one-time payment
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default('usd'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const paymentIntent = await createPaymentIntent({
          userId: ctx.user.id,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } catch (error) {
        console.error('Payment intent creation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent',
        });
      }
    }),

  /**
   * Confirm payment and update subscription
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        subscriptionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment not succeeded',
          });
        }

        // Record payment in database
        await recordPayment({
          userId: ctx.user.id,
          stripePaymentIntentId: paymentIntent.id,
          stripeInvoiceId: input.subscriptionId,
          amount: (paymentIntent.amount / 100).toString(),
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntent.description,
        });

        // If subscription ID provided, upgrade user
        if (input.subscriptionId) {
          await upgradeUserToPro(ctx.user.id, input.subscriptionId);
        }

        return { success: true };
      } catch (error) {
        console.error('Payment confirmation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm payment',
        });
      }
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await getSubscriptionByUserId(ctx.user.id);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active subscription',
        });
      }

      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      await downgradeUserToFree(ctx.user.id);

      return { success: true };
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cancel subscription',
      });
    }
  }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getUserPayments(ctx.user.id, input.limit);
    }),

  /**
   * Get subscription status from Stripe
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscription = await getSubscriptionByUserId(ctx.user.id);
      if (!subscription || !subscription.stripeSubscriptionId) {
        return null;
      }

      return await getSubscriptionStatus(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return null;
    }
  }),
});
