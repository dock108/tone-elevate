import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// IMPORTANT: Replace with your actual Stripe Price ID
const STRIPE_PRICE_ID = 'YOUR_STRIPE_PRICE_ID';

interface PremiumSubscriptionProps {
  // Add any props if needed, e.g., onSubscribed callback
}

const PremiumSubscription: React.FC<PremiumSubscriptionProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
     if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID === 'YOUR_STRIPE_PRICE_ID') {
        setError('Stripe Price ID is not configured.');
        return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Invoking create-checkout-session function...');
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }), // Stringify body for web
      });

      if (invokeError) throw invokeError;
      if (data && data.error) throw new Error(data.error);

      console.log('Checkout session data received:', data);

      // 3. Stripe Checkout Redirect (Web)
      if (data?.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);
        window.location.href = data.url; // Redirect the current window
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

  return (
    <div className="subscription-card">
      <h2>Upgrade to ToneSmith Premium</h2>
      <p>
        Unlock unlimited suggestions, access advanced tones, save custom templates, and enjoy an ad-free experience!
      </p>
      {error && <p className="error-message">Error: {error}</p>}
      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </div>
  );
};

export default PremiumSubscription; 
import { supabase } from '../lib/supabaseClient';

// IMPORTANT: Replace with your actual Stripe Price ID
const STRIPE_PRICE_ID = 'YOUR_STRIPE_PRICE_ID';

interface PremiumSubscriptionProps {
  // Add any props if needed, e.g., onSubscribed callback
}

const PremiumSubscription: React.FC<PremiumSubscriptionProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
     if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID === 'YOUR_STRIPE_PRICE_ID') {
        setError('Stripe Price ID is not configured.');
        return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Invoking create-checkout-session function...');
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }), // Stringify body for web
      });

      if (invokeError) throw invokeError;
      if (data && data.error) throw new Error(data.error);

      console.log('Checkout session data received:', data);

      // 3. Stripe Checkout Redirect (Web)
      if (data?.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);
        window.location.href = data.url; // Redirect the current window
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

  return (
    <div className="subscription-card">
      <h2>Upgrade to ToneSmith Premium</h2>
      <p>
        Unlock unlimited suggestions, access advanced tones, save custom templates, and enjoy an ad-free experience!
      </p>
      {error && <p className="error-message">Error: {error}</p>}
      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </div>
  );
};

export default PremiumSubscription; 