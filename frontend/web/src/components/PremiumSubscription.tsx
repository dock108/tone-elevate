import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// IMPORTANT: Replace with your actual Stripe Price ID
const STRIPE_PRICE_ID = 'YOUR_STRIPE_PRICE_ID';

interface PremiumSubscriptionProps {
  userId: string;
  currentStatus?: string | null;
}

const PremiumSubscription: React.FC<PremiumSubscriptionProps> = ({ userId, currentStatus }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
     if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID === 'YOUR_STRIPE_PRICE_ID') {
        setError('Stripe Price ID is not configured.');
        return;
    }
    if (!userId) {
      setError('User ID is not available.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Invoking create-checkout-session function...');
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: STRIPE_PRICE_ID, userId: userId },
      });

      if (invokeError) throw invokeError;
      if (data && data.error) throw new Error(data.error);

      console.log('Checkout session data received:', data);

      // Stripe Checkout Redirect (Web)
      if (data?.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('Could not retrieve Stripe Checkout URL.');
      }

    } catch (err) {
      console.error('Subscription Error:', err);
      setError(err instanceof Error ? err.message : 'Could not initiate subscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-portal-session', {
          body: { userId: userId },
      });
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Could not retrieve Stripe Portal URL.');
      }
    } catch (err) {
      console.error('Portal Error:', err);
      setError(err instanceof Error ? err.message : 'Could not open customer portal.');
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = currentStatus === 'premium' || currentStatus === 'active';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {isSubscribed ? 'Manage Subscription' : 'Upgrade to Premium'}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {isSubscribed
          ? 'View your billing history or update your payment method.'
          : 'Unlock unlimited suggestions, advanced tones, custom templates, and an ad-free experience!'}
      </p>
      {error && <p className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">Error: {error}</p>}
      
      {isSubscribed ? (
        <button 
          onClick={handleManageSubscription} 
          disabled={loading} 
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-gray-500 dark:hover:bg-gray-400 dark:focus:ring-offset-gray-900"
        >
          {loading ? 'Loading Portal...' : 'Manage Billing'}
        </button>
      ) : (
        <button 
          onClick={handleSubscribe} 
          disabled={loading} 
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      )}
    </div>
  );
};

export default PremiumSubscription; 