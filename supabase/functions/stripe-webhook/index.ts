// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.2.0';

console.log('stripe-webhook function deployed!');

// Initialize Stripe (ensure STRIPE_SECRET_KEY is set)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore - Use Deno fetch
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-08-16',
});

// Get the webhook signing secret (ensure STRIPE_WEBHOOK_SECRET is set via `supabase secrets set`)
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  // Stripe requires the raw body for signature verification.
  const requestBody = await req.text();
  const signature = req.headers.get('Stripe-Signature');

  // --- Initialize Supabase Admin Client ---
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Missing Stripe signature or webhook secret.');
    }

    // 1. Verify webhook signature and construct event
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        requestBody,
        signature,
        webhookSecret,
        undefined,
        // @ts-ignore - Use Deno crypto
        Stripe.createSubtleCryptoProvider()
      );
      console.log(`Received valid Stripe event: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // 2. Handle the event
    const relevantEvents = new Set([
      'checkout.session.completed',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ]);

    if (relevantEvents.has(event.type)) {
      let customerId: string | null = null;
      let subscriptionId: string | null = null;
      let subscriptionStatus: string | null = null;

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
          subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
          const supabaseUserId = session.client_reference_id; // Get Supabase user ID

          console.log(`Processing checkout.session.completed for sub ${subscriptionId}, user ${supabaseUserId}`);

          // Payment is successful, user should get premium access.
          subscriptionStatus = 'active'; // Assuming immediate activation

          // Update is_premium based on Supabase User ID
          if (supabaseUserId) {
            const { error: premiumUpdateError } = await supabaseAdmin
              .from('profiles')
              .update({ is_premium: true })
              .eq('id', supabaseUserId);

            if (premiumUpdateError) {
              console.error(`Failed to update is_premium for user ${supabaseUserId}:`, premiumUpdateError);
              // Continue processing, but log the error
            } else {
              console.log(`Successfully set is_premium=true for user ${supabaseUserId}`);
            }
          } else {
            console.error('checkout.session.completed event missing client_reference_id (Supabase User ID).');
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null;
          subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id ?? null;
          console.log(`Processing invoice.payment_succeeded for sub ${subscriptionId}`);
          // Confirms payment for an ongoing subscription (or initial setup)
          subscriptionStatus = 'active';
          break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null;
            subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id ?? null;
            console.log(`Processing invoice.payment_failed for sub ${subscriptionId}`);
            // Payment failed, access should likely be restricted.
            subscriptionStatus = 'past_due'; // Or 'inactive'
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null;
            subscriptionId = subscription.id;
            subscriptionStatus = subscription.status; // e.g., 'active', 'past_due', 'canceled'
            console.log(`Processing customer.subscription.updated for sub ${subscriptionId} to status ${subscriptionStatus}`);
            break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null;
          subscriptionId = subscription.id;
          console.log(`Processing customer.subscription.deleted for sub ${subscriptionId}`);
          // Subscription ended (cancelled or failed payments exhausted)
          subscriptionStatus = 'inactive'; // Or 'canceled'
          break;
        }
        default:
            console.log(`Unhandled relevant event type: ${event.type}`);
            break;
      }

      // 3. Update Supabase profile if we have relevant info (Subscription Status)
      if (customerId && subscriptionStatus) {
        console.log(`Updating profile for stripe_customer_id ${customerId} to status ${subscriptionStatus}`);
        // Update status and sub id based on Stripe Customer ID
        // Note: is_premium update happens specifically in checkout.session.completed based on supabaseUserId
        const updateData: { subscription_status: string; subscription_id?: string | null } = {
          subscription_status: subscriptionStatus
        };
        if (subscriptionId) {
          updateData.subscription_id = subscriptionId;
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error(`Failed to update profile for Stripe Customer ${customerId}:`, updateError);
          // Still return 200 to Stripe, but log the error
        } else {
            console.log(`Profile updated successfully for Stripe Customer ${customerId}`);
        }
      } else {
          console.log("No customerId or status derived from event, skipping profile update.");
      }
    }

    // 4. Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error('Error in stripe-webhook function:', error);
    // Don't send detailed errors back to Stripe, just a failure status
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});

/* To invoke locally:

  1. Use the Stripe CLI to forward webhooks to your local function:
     stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

  2. Trigger a Stripe event (e.g., complete a test checkout session).

  Reference: https://supabase.com/docs/guides/functions/testing#testing-stripe-webhooks
*/
