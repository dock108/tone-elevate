import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import * as Linking from 'expo-linking';

// IMPORTANT: Replace with your actual Stripe Price ID
const STRIPE_PRICE_ID = 'YOUR_STRIPE_PRICE_ID';

const PremiumSubscription = ({ onSubscribed }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID === 'YOUR_STRIPE_PRICE_ID') {
        Alert.alert('Error', 'Stripe Price ID is not configured.');
        return;
    }

    setLoading(true);
    try {
      console.log('Invoking create-checkout-session function...');
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: STRIPE_PRICE_ID },
      });

      if (invokeError) throw invokeError;
      if (data && data.error) throw new Error(data.error);

      console.log('Checkout session data received:', data);

      // 3. Stripe Checkout Redirect (Mobile)
      if (data?.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);
        // Open the Stripe Checkout URL in the device's browser
        await Linking.openURL(data.url);
        // Note: We don't get immediate confirmation here. Webhooks handle the update.
        // We might call onSubscribed() optimistically or wait for profile update.
        // For simplicity, let's assume webhook updates profile, and UI reflects that.
      } else {
        throw new Error('Could not retrieve Stripe Checkout URL.');
      }

    } catch (error) {
      console.error('Subscription Error:', error);
      Alert.alert('Subscription Error', error.message || 'Could not initiate subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to ToneSmith Premium</Text>
      <Text style={styles.description}>
        Unlock unlimited suggestions, access advanced tones, save custom templates, and enjoy an ad-free experience!
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button
          title="Subscribe Now"
          onPress={handleSubscribe}
          disabled={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
});

export default PremiumSubscription; 
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import * as Linking from 'expo-linking';

// IMPORTANT: Replace with your actual Stripe Price ID
const STRIPE_PRICE_ID = 'YOUR_STRIPE_PRICE_ID';

const PremiumSubscription = ({ onSubscribed }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!STRIPE_PRICE_ID || STRIPE_PRICE_ID === 'YOUR_STRIPE_PRICE_ID') {
        Alert.alert('Error', 'Stripe Price ID is not configured.');
        return;
    }

    setLoading(true);
    try {
      console.log('Invoking create-checkout-session function...');
      const { data, error: invokeError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: STRIPE_PRICE_ID },
      });

      if (invokeError) throw invokeError;
      if (data && data.error) throw new Error(data.error);

      console.log('Checkout session data received:', data);

      // 3. Stripe Checkout Redirect (Mobile)
      if (data?.url) {
        console.log('Redirecting to Stripe Checkout:', data.url);
        // Open the Stripe Checkout URL in the device's browser
        await Linking.openURL(data.url);
        // Note: We don't get immediate confirmation here. Webhooks handle the update.
        // We might call onSubscribed() optimistically or wait for profile update.
        // For simplicity, let's assume webhook updates profile, and UI reflects that.
      } else {
        throw new Error('Could not retrieve Stripe Checkout URL.');
      }

    } catch (error) {
      console.error('Subscription Error:', error);
      Alert.alert('Subscription Error', error.message || 'Could not initiate subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to ToneSmith Premium</Text>
      <Text style={styles.description}>
        Unlock unlimited suggestions, access advanced tones, save custom templates, and enjoy an ad-free experience!
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button
          title="Subscribe Now"
          onPress={handleSubscribe}
          disabled={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
});

export default PremiumSubscription; 