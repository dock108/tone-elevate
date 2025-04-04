# ToneSmith - Next Steps (MVP) - Supabase Backend

This document outlines the initial tasks required to build the MVP for ToneSmith using Supabase.

## Phase 1: Supabase Setup & Frontend Initialization [✅ COMPLETE]

1.  ✅ **[Supabase]** Create Supabase project on [supabase.com](https://supabase.com/). (Assumed complete by user)
2.  ✅ **[Supabase]** Define Database Schema in Supabase Studio (or via migrations if using CLI): (SQL provided)
    -   ✅ Create `profiles` table (linked to `auth.users`).
    -   ✅ Create `preferences` table.
    -   ✅ Enable Row Level Security (RLS) and define initial policies.
3.  ✅ **[Frontend-Mobile/Web]** Install Supabase client library (`@supabase/supabase-js`).
4.  ✅ **[Frontend-Mobile/Web]** Configure Supabase client initialization (`lib/supabaseClient`, using `.env` variables).
5.  ✅ **[Frontend-Mobile/Web]** Set up Linters/Formatters (ESLint, Prettier).
6.  ✅ **[Frontend-Mobile/Web]** Create basic UI components for the main editor screen (Input, Tone Selection, Output - Initial structure in `App.js`/`App.tsx`).
7.  ✅ **[Frontend-Mobile/Web]** Create basic User Authentication UI components (Login/Signup placeholder in `App.js`/`App.tsx`).

## Phase 2: Core Feature Implementation (Supabase Integration) [✅ COMPLETE]

8.  ✅ **[Auth]** Implement User Authentication using Supabase Auth client:
    -   ✅ Integrate Login/Signup UI with `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`.
    -   ✅ Implement session handling/user state management based on `supabase.auth.onAuthStateChange()`.
    -   (Optional) Add social login providers.
9.  ✅ **[AI]** Refactor Supabase Edge Function (`tone-suggest`) for **Message Generation**:
    -   ✅ Function receives `text`, `tone`, `context`, `outputFormat`.
    -   ✅ Securely accesses OpenAI API key (using Supabase secrets).
    -   ✅ Calls OpenAI API (`gpt-4o`) with a refined prompt for generation.
    -   ✅ Returns generated message string `{ generatedMessage: "..." }`.
    -   ✅ Set up function permissions (e.g., require authenticated user - via JWT verification in function).
    -   ✅ Implemented rate limiting for free tier (checks `profiles` table).
10. ✅ **[Integration]** Refactor Frontend to use **Message Generation**:
    -   ✅ Add UI elements for `context` and `outputFormat` selection.
    -   ✅ Update API call: Use `supabase.functions.invoke('tone-suggest', ...)` with new parameters.
    -   ✅ Rename states/UI from "suggestions" to "generation".
    -   ✅ Handle loading states and display single `generatedMessage`/errors in UI.
    -   ✅ Implement Copy-to-Clipboard feature.
    -   ✅ Add `react-markdown` (web) for Markdown rendering.
11. ✅ **[Payments]** Create Supabase Edge Function (`create-checkout-session`) for Stripe integration:
    -   ✅ Function receives `priceId`.
    -   ✅ Securely accesses Stripe secret key.
    -   ✅ Retrieves or creates Stripe Customer ID (linked to `profiles` table).
    -   ✅ Calls `stripe.checkout.sessions.create`.
    -   ✅ Returns session ID/URL.
    -   ✅ Set up function permissions (via JWT verification setting).
12. ✅ **[Payments]** Create Supabase Edge Function (`stripe-webhook`) to handle Stripe events:
    -   ✅ Handles webhook signature verification (using `STRIPE_WEBHOOK_SECRET`).
    -   ✅ Processes relevant events (`checkout.session.completed`, etc.).
    -   ✅ Updates user's `subscription_status`/`subscription_id` in the Supabase `profiles` table.
13. ✅ **[Frontend-Mobile/Web]** Implement UI for Premium Subscription purchase flow:
    -   ✅ Calls `create-checkout-session` function.
    -   ✅ Redirects user to Stripe Checkout.
    -   ✅ Handles success/cancel URLs (can redirect back to app pages) - *Basic setup done, pages/routes may need refinement.*
14. ✅ **[Database]** Implement logic for saving/retrieving user preferences using Supabase client:
    -   ✅ Use `supabase.from('preferences').select()` / `.insert()` / `.update()`.
    -   ✅ Ensure RLS policies allow correct access.
15. ✅ **[Frontend-Mobile/Web]** Implement UI for managing saved templates/preferences.

## Phase 3: UI Overhaul, Refinement & Testing [IN PROGRESS]

16. **[UI-Web]** Setup Tailwind CSS for Web Frontend. [✅ COMPLETE - Config done]
17. **[UI-Web]** Refactor `App.tsx` with Tailwind CSS for modern UI/UX. [IN PROGRESS - Code applied]
18. **[UI-Web]** **[BUG]** Troubleshoot and fix Tailwind CSS styling not applying in Vite dev server. [⏳ PENDING]
19. **[UI-Web]** Install and configure `@tailwindcss/typography` plugin for Markdown styling. [⏳ PENDING]
20. **[UI-Web/Mobile]** Ensure UI is responsive and looks good on various screen sizes. [⏳ PENDING]
21. **[UI-Web/Mobile]** Refine UI/UX based on testing and feedback (e.g., loading indicators, spacing, component styling). [⏳ PENDING]
22. **[Testing]** Write tests for Supabase Edge Functions (e.g., using Deno test runner). [⏳ PENDING]
23. **[Testing]** Perform end-to-end testing for core flows (Auth, Message Generation, Subscription, Preferences). [⏳ PENDING]
24. **[Refinement]** Review and optimize Supabase RLS policies and database queries. [⏳ PENDING]
25. **[Deployment]** Deploy Supabase Edge Function changes (`npx supabase functions deploy tone-suggest`). [✅ COMPLETE]
26. **[Deployment]** Plan deployment for frontends (Vercel/Netlify for web, EAS for mobile). [⏳ PENDING]

## Phase 4: Post-Launch & Iteration [PENDING]

27. **[Monitoring]** Monitor Supabase usage and function performance.
28. **[Feedback]** Gather user feedback on generation quality and usability.
29. **[Iteration]** Implement further features based on feedback (e.g., more tones/contexts, advanced preferences, history of generated messages). 