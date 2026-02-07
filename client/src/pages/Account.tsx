/**
 * Account Page
 * User account management, billing, and subscription
 */

import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, CreditCard, LogOut, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import PaymentPanel from '@/components/PaymentPanel';

export default function Account() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4">Not Logged In</h2>
          <p className="text-center text-muted-foreground mb-6">
            Please log in to access your account.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full"
          >
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and subscription</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{user.name || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{user.email || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account ID</label>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm">
                    <p>{user.id}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Member Since</label>
                  <div className="p-3 bg-muted rounded-md">
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold mb-2 text-red-900">Danger Zone</h3>
              <p className="text-sm text-red-800 mb-4">
                Logging out will end your current session.
              </p>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <PaymentPanel onSubscriptionChange={() => {}} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
