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

16. **[UI-Web]** Setup Tailwind CSS for Web Frontend. [✅ COMPLETE]
17. **[UI-Web]** Refactor `App.tsx` with Tailwind CSS for modern UI/UX. [✅ COMPLETE]
18. **[UI-Web]** **[BUG]** Troubleshoot and fix Tailwind CSS styling/build issues (related to v4 alpha). [✅ COMPLETE]
19. **[UI-Web]** Install and configure `@tailwindcss/typography` plugin for Markdown styling. [✅ COMPLETE]
20. **[UI-Web/Mobile]** Ensure UI is responsive and looks good on various screen sizes. [✅ COMPLETE]
21. **[UI-Web/Mobile]** Refine UI/UX based on testing and feedback (new design implemented). [✅ COMPLETE]
22. **[Testing]** Write tests for Supabase Edge Functions (e.g., using Deno test runner). [⏳ PENDING]
23. **[Testing]** Perform end-to-end testing for core flows (Auth, Message Generation, Subscription, Preferences). [⏳ PENDING]
24. **[Refinement]** Review and optimize Supabase RLS policies and database queries. [⏳ PENDING]
25. **[Deployment]** Deploy Supabase Edge Function changes (`npx supabase functions deploy tone-suggest`). [✅ COMPLETE]
26. **[Deployment]** Plan deployment for frontends (Vercel/Netlify for web, EAS for mobile). [⏳ PENDING]

## Phase 3.5: Free Tier Enhancement (Single-Shot Mode) [IN PROGRESS]

27. **[AI]** Update system prompt for GPT-4o: [✅ IMPLEMENTED]
    - Clarify role: rewrite/generate clear, natural communication.
    - Avoid corporate clichés.
    - Respect user-provided tone and intent.
28. **[AI/Parsing]** Build/refine input parsing logic for single-shot mode: [✅ IMPLEMENTED]
    - Extract intent, tone (default: professional but natural), and input message.
    - Handle unstructured text robustly.
29. **[AI/Prompting]** Format prompt sent to the model: [✅ IMPLEMENTED]
    - Prepend structured intent + tone + message context.
30. **[AI/Post-Processing]** Add post-processing to isolate the rewritten message: [✅ IMPLEMENTED]
    - Remove any AI assistant chatter or disclaimers.
31. **[Testing]** Create a test suite for single-shot mode validation: [⏳ PENDING]
    - Use real-world inputs.
    - Validate intent detection, tone matching, and output quality (clean, concise, human-sounding).
    - **Example Test Cases:**
        - **Simple Follow-up:** `userInput`: "follow up on the invoice i sent to Acme Corp last Tuesday" (Expected: Polite follow-up message)
        - **Messy Apology:** `userInput`: "omg sorry i completely forgot about our 1:1 today, something urgent came up. need to apologize to Dave" (Expected: Concise apology for Teams/Email)
        - **Explicit Tone:** `userInput`: "write a quick note to the team congratulating them on the successful product launch make it celebratory" (Expected: Celebratory team message)
        - **Rewrite Request:** `userInput`: "this sounds too harsh: \"Your report is late and lacks detail.\" make it softer" (Expected: Gentler, constructive feedback)
        - **Ambiguous Request:** `userInput`: "meeting notes from yesterday?" (Expected: Clear request for notes)
        - **Anxious Unavailability:** `userInput`: "Hey team, so sorry but I won't be online today, had to go to the ER last night with my kid, don't worry it's nothing serious just an allergy thing we think? But they kept us for observation and I barely slept, totally exhausted. Anyway I won't be able to make the 10am sync or probably any meetings, I'll try to check email later if I can but no promises LOL. Again, really sorry, hope it doesn't mess things up too much. It's probably fine. Let me know if anything explodes." (Expected: Concise, professional unavailability notice, filtering anxiety/TMI)
        - **Formal Generation:** `userInput`: "draft an announcement about the new parental leave policy for the company blog. key points: effective Sept 1, 16 weeks fully paid for primary caregiver, 8 weeks for secondary, applies retroactively to births/adoptions since July 1. make it sound supportive and aligned with our company values of work-life balance." (Expected: Well-structured formal announcement)
        - **Professional Rewrite (Client):** `userInput`: "My internal note on the client feedback is: \"They hated the mockups, said colours were garish and layout confusing. Wants total redo by Friday - LOL yeah right. Need to push back hard, deadline impossible, maybe offer minor tweaks?\". Can you turn this into a professional email reply to the client acknowledging feedback but managing expectations on timeline/scope? Tone should be firm but polite, solution-oriented." (Expected: Client-facing email acknowledging feedback, managing expectations politely but firmly)

## Phase 3.75: Hierarchical Professional Tones [PENDING]

32. **[AI/Prompting]** Define specific tone strings (e.g., `professional-c_suite`, `professional-boss`, `professional-peer`, `professional-direct_report`). [⏳ PENDING]
33. **[AI/Prompting]** Modify generation system prompt in `tone-suggest` function to dynamically adjust formality, directness, and cliché avoidance based on the hierarchical professional tone input. [⏳ PENDING]
34. **[UI-Web/Mobile]** Update Tone Selection UI to include options for the new hierarchical professional levels (e.g., grouped under "Professional"). [⏳ PENDING]
35. **[Integration]** Ensure frontend passes the selected hierarchical tone string correctly to the `tone-suggest` function. [⏳ PENDING]

## Phase 4: Post-Launch & Iteration [PENDING]

36. **[Monitoring]** Monitor Supabase usage and function performance. [⏳ PENDING]
37. **[Feedback]** Gather user feedback on generation quality and usability. [⏳ PENDING]
38. **[Iteration]** Implement further features based on feedback (e.g., more tones/contexts, advanced preferences, history of generated messages). [⏳ PENDING] 