/**
 * Payment Panel Component
 * Manages subscription and payment UI
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PaymentPanelProps {
  onSubscriptionChange?: () => void;
}

export default function PaymentPanel({ onSubscriptionChange }: PaymentPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro-monthly' | 'pro-yearly' | null>(null);

  // Fetch subscription and features
  const { data: subscription, isLoading: subLoading } = trpc.payment.getSubscription.useQuery();
  const { data: features } = trpc.payment.getFeatures.useQuery();
  const { data: paymentHistory } = trpc.payment.getPaymentHistory.useQuery({ limit: 5 });

  // Mutations
  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();
  const cancelSubscriptionMutation = trpc.payment.cancelSubscription.useMutation();

  const handleUpgradeClick = async (plan: 'pro-monthly' | 'pro-yearly') => {
    setIsLoading(true);
    setSelectedPlan(plan);

    try {
      const priceId = plan === 'pro-monthly' ? 'price_pro_monthly' : 'price_pro_yearly';
      const successUrl = `${window.location.origin}/account?tab=billing&success=true`;
      const cancelUrl = `${window.location.origin}/account?tab=billing`;

      const result = await createCheckoutMutation.mutateAsync({
        priceId,
        successUrl,
        cancelUrl,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await cancelSubscriptionMutation.mutateAsync();
      toast.success('Subscription canceled');
      onSubscriptionChange?.();
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error(error);
    }
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const isPro = subscription?.plan === 'pro';
  const isEnterprise = subscription?.plan === 'enterprise';

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold capitalize">{subscription?.plan || 'Free'}</p>
            <p className="text-sm text-muted-foreground">
              {isPro && 'Unlimited conversions, color editor, multi-format export'}
              {isEnterprise && 'Enterprise features with priority support'}
              {!isPro && !isEnterprise && '100 conversions/month, basic features'}
            </p>
          </div>
          {isPro && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Active</span>
            </div>
          )}
        </div>
      </Card>

      {/* Features */}
      {features && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Features & Limits</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Color Editor</span>
              {features.hasColorEditor ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Multi-Format Export (EPS, PDF, AI, DXF)</span>
              {features.hasMultiFormatExport ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Bulk Processing</span>
              {features.hasBulkProcessing ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Conversions</span>
                <span className="font-semibold">
                  {features.monthlyConversionsUsed} / {features.monthlyConversions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(features.monthlyConversionsUsed / features.monthlyConversions) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Options */}
      {!isPro && !isEnterprise && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Upgrade to Pro</h3>
          <p className="text-sm text-gray-700 mb-4">
            Get unlimited conversions, color editing, and multi-format export.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleUpgradeClick('pro-monthly')}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && selectedPlan === 'pro-monthly' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              $9.99/month
            </Button>
            <Button
              onClick={() => handleUpgradeClick('pro-yearly')}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading && selectedPlan === 'pro-yearly' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              $99.99/year
            </Button>
          </div>
        </Card>
      )}

      {/* Cancel Subscription */}
      {isPro && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold mb-2 text-red-900">Manage Subscription</h3>
          <p className="text-sm text-red-800 mb-4">
            You can cancel your subscription at any time. You will lose access to premium features.
          </p>
          <Button
            onClick={handleCancelSubscription}
            disabled={cancelSubscriptionMutation.isPending}
            variant="destructive"
          >
            {cancelSubscriptionMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Cancel Subscription
          </Button>
        </Card>
      )}

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{payment.description || 'Payment'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${parseFloat(payment.amount).toFixed(2)}
                  </p>
                  <p className={`text-sm capitalize ${payment.status === 'succeeded' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
