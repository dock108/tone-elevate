// supabase/functions/cancel-subscription/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Updated Stripe import for better Deno compatibility if needed, check esm.sh for latest recommendations
import Stripe from 'https://esm.sh/stripe@12.17.0?target=deno&no-check'; // Example version, ensure compatibility
import { corsHeaders } from '../_shared/cors.ts';

// Initialize Stripe client using the secret key from environment variables
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore: Necessary for Deno runtime
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15', // Pin API version
});

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client to verify JWT and fetch user data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role to query profiles table securely
    );

    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify JWT and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
        console.error("Auth error:", userError);
        return new Response(JSON.stringify({ error: 'Authentication failed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
        });
    }

    // Fetch the user's profile to get their subscription ID
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_id') // Select only the needed field
      .eq('id', user.id)
      .single(); // Expect only one profile per user

    if (profileError) {
        console.error(`Profile fetch error for user ${user.id}:`, profileError);
         // Handle specific case where profile might not exist
         if (profileError.code === 'PGRST116') { // row not found
             return new Response(JSON.stringify({ error: 'User profile not found.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404,
            });
         }
         // For other database errors
         return new Response(JSON.stringify({ error: 'Database error fetching profile.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
        });
    }

    // Check if a subscription ID exists
    if (!profileData?.subscription_id) {
        console.warn(`User ${user.id} has no subscription_id in profile.`);
         return new Response(JSON.stringify({ error: 'No active subscription found.' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
         });
    }

    const subscriptionId = profileData.subscription_id;

    // Tell Stripe to cancel the subscription at the end of the current billing period
    console.log(`Requesting cancellation at period end for subscription: ${subscriptionId}`);
    const subscription = await stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true }
    );

    console.log(`Subscription ${subscriptionId} set to cancel at period end. Status: ${subscription.status}`);

    // Return success response
    // The is_premium flag in the database is NOT changed here.
    // It should be updated via a webhook listening to subscription events (e.g., customer.subscription.deleted).
    return new Response(JSON.stringify({ success: true, message: 'Subscription scheduled for cancellation at period end.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (error) {
    console.error("Cancellation Function Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    // Avoid exposing sensitive details in the error message if possible
    let clientErrorMessage = 'Failed to process subscription cancellation.';
    if (error.type === 'StripeCardError') {
         // Handle specific Stripe errors if needed, though less likely for cancellation
         clientErrorMessage = 'There was an issue with the payment method on file.';
    }
    return new Response(JSON.stringify({ error: clientErrorMessage }), { // Return a generic error message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
}); 