// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.2.0'; // Use esm.sh version for Deno

console.log('create-checkout-session function deployed!');

// Initialize Stripe (ensure STRIPE_SECRET_KEY is set via `supabase secrets set`)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore - Use Deno fetch
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-08-16', // Use a fixed API version
});

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Initialize Supabase Admin Client ---
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    // 2. Verify User Authentication (Check Authorization header)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Deno.errors.PermissionDenied("Invalid JWT.");
    const userId = user.id;
    const userEmail = user.email;
    console.log('Request authenticated for user:', userId, userEmail);

    // 3. Parse Request Body for Price ID
    const { priceId } = await req.json();
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('Missing or invalid required field: priceId (string)');
    }
    console.log(`Received request for priceId: ${priceId}`);

    // 4. Get or Create Stripe Customer
    // Fetch user profile to check for existing stripe_customer_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`);
    if (!profile) throw new Error('User profile not found.'); // Should not happen

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log(`Creating new Stripe customer for user ${userId}`);
      const customer = await stripe.customers.create({
        email: userEmail, // Use user's email
        metadata: {
          supabase_user_id: userId, // Link back to Supabase user ID
        },
      });
      stripeCustomerId = customer.id;

      // Store the new Stripe Customer ID back in the user's profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) throw new Error(`Failed to update profile with Stripe Customer ID: ${updateError.message}`);
      console.log(`Stripe customer created and profile updated: ${stripeCustomerId}`);
    } else {
      console.log(`Using existing Stripe customer ID: ${stripeCustomerId}`);
    }

    // 5. Create Stripe Checkout Session
    const successUrl = Deno.env.get('STRIPE_SUCCESS_URL') || 'http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}'; // Get from secrets or use default
    const cancelUrl = Deno.env.get('STRIPE_CANCEL_URL') || 'http://localhost:5173/payment-cancelled';

    console.log(`Creating Checkout session for customer ${stripeCustomerId}, price ${priceId}`);
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Optionally pass Supabase user ID to metadata for webhook verification
      // metadata: {
      //   supabase_user_id: userId
      // }
    });

    console.log(`Checkout session created: ${session.id}`);

    // 6. Return Session URL/ID to Frontend
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    const status = error instanceof Deno.errors.PermissionDenied ? 403 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/


  try {
    // 2. Verify User Authentication (Check Authorization header)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Deno.errors.PermissionDenied("Invalid JWT.");
    const userId = user.id;
    const userEmail = user.email;
    console.log('Request authenticated for user:', userId, userEmail);

    // 3. Parse Request Body for Price ID
    const { priceId } = await req.json();
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('Missing or invalid required field: priceId (string)');
    }
    console.log(`Received request for priceId: ${priceId}`);

    // 4. Get or Create Stripe Customer
    // Fetch user profile to check for existing stripe_customer_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`);
    if (!profile) throw new Error('User profile not found.'); // Should not happen

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log(`Creating new Stripe customer for user ${userId}`);
      const customer = await stripe.customers.create({
        email: userEmail, // Use user's email
        metadata: {
          supabase_user_id: userId, // Link back to Supabase user ID
        },
      });
      stripeCustomerId = customer.id;

      // Store the new Stripe Customer ID back in the user's profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) throw new Error(`Failed to update profile with Stripe Customer ID: ${updateError.message}`);
      console.log(`Stripe customer created and profile updated: ${stripeCustomerId}`);
    } else {
      console.log(`Using existing Stripe customer ID: ${stripeCustomerId}`);
    }

    // 5. Create Stripe Checkout Session
    const successUrl = Deno.env.get('STRIPE_SUCCESS_URL') || 'http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}'; // Get from secrets or use default
    const cancelUrl = Deno.env.get('STRIPE_CANCEL_URL') || 'http://localhost:5173/payment-cancelled';

    console.log(`Creating Checkout session for customer ${stripeCustomerId}, price ${priceId}`);
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Optionally pass Supabase user ID to metadata for webhook verification
      // metadata: {
      //   supabase_user_id: userId
      // }
    });

    console.log(`Checkout session created: ${session.id}`);

    // 6. Return Session URL/ID to Frontend
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    const status = error instanceof Deno.errors.PermissionDenied ? 403 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
