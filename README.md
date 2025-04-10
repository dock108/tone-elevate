# ToneElevate

ToneElevate is an AI-powered communication assistant designed to help users generate well-toned messages suitable for various communication contexts.

## Overview

This application leverages AI (specifically GPT-4o) to take user input and generate a complete, polished message in the desired tone (e.g., professional, casual, persuasive), tailored for a specific context (e.g., Email, Teams Chat, LinkedIn), and formatted as either raw text or Markdown. It includes nuanced variations within the "Professional" tone category (e.g., C-Suite, Director, Peer Group, Boss, Subordinates, Interns) to better match the intended audience. It also offers user accounts, subscription management, and template saving (preferences component).

## MVP Features

-   AI-powered message generation based on user input, tone (including specific "Professional" variations), and context (`Email`, `Teams Chat`, `LinkedIn Post`, `GitHub Comment`, `General Text`, `Documentation`, `Text Message`). Output is formatted as raw text.
-   Basic message generation available without login.
-   **Polished two-column UI** for logged-in users (main content + info sidebar), single-column for logged-out.
-   Extracted components (`Header`, `InputSection`, `ConfigSection`, `ActionSection`, `OutputSection`, `InfoCard`, etc.) for better maintainability.
-   Clear display of generated message with copy-to-clipboard (including visual feedback) and input clearing.
-   User accounts (Supabase Auth).
-   **Saved Prompts:** (Logic exists, UI removed temporarily) Logged-in users can save frequently used prompts (input text, tone, context) and load them via a modal (`SavedPromptsModal`).
-   **Tone Comparison:** Logged-in users can select up to 3 tones (5 for Premium) and generate variations side-by-side (`ToneComparisonDisplay`).
-   **Content Length Selector:** Users can choose desired output length (Short, Medium, Long) influencing the generated text.
-   **Quick Start Templates:** Predefined templates provide examples and starting points for users.
-   **Email Sharing:** (Logic exists, UI removed temporarily) Logged-in users can share generated content via email.
-   **Premium Features (Requires Subscription):**
    -   **Refinement:** Modify generated messages with follow-up requests (e.g., "make it shorter").
    -   **Increased Comparison Limit:** Compare up to 5 tones (vs. 3 for free).
    -   Unlimited message generations.
-   Subscription management (Freemium model via Stripe) including upgrade and cancellation flows.
-   Improved user feedback using toast notifications (`react-hot-toast`).
-   Basic accessibility enhancements (semantic HTML, labels).

## Monetization

-   **Freemium Model:** Basic features are free with usage limits.
-   **Premium Subscription:** Access to Refinement, increased comparison limit, unlimited usage, and future premium features. Implemented via Stripe.
-   **Info Card:** Right sidebar dynamically shows upgrade prompts, premium status, feedback, and cancellation options based on user state.

## Technical Stack

-   **Frontend (Mobile):** React Native (Expo)
-   **Frontend (Web):** React.js (Vite) + Tailwind CSS + react-hot-toast
-   **Backend:** Supabase (Database, Auth, Edge Functions)
-   **AI Integration:** OpenAI GPT-4o API (called via Supabase Edge Functions)
-   **Payments Integration:** Stripe API (called via Supabase Edge Functions)
-   ~~**Backend:** Node.js (Express)~~ (Removed in favor of Supabase)
-   ~~**Database:** (To be decided - PostgreSQL, MongoDB recommended)~~ (Using Supabase Postgres)

## Getting Started

### Prerequisites

-   Node.js (v21 or later recommended - see `engines` field in `frontend/web/package.json`)
-   npm (v8 or later recommended)
-   Expo Go app (for mobile development testing)
-   Stripe Account (for payment integration testing)
-   OpenAI API Key
-   Supabase Account & Project (Free tier available)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd tonesmith
    ```
2.  **Set up Supabase Project:**
    -   Go to [supabase.com](https://supabase.com/) and create a new project.
    -   Navigate to **Project Settings > API**.
    -   Find your **Project URL** and **anon key**. You will need these for environment variables.
    -   Optionally, set up Supabase CLI for local development: [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
3.  **Install Frontend (Mobile) Dependencies:**
    ```bash
    cd frontend/mobile
    npm install
    # Install Supabase client
    npm install @supabase/supabase-js
    cd ../..
    ```
4.  **Install Frontend (Web) Dependencies:**
    ```bash
    cd frontend/web
    npm install
    # Install Supabase client
    npm install @supabase/supabase-js
    cd ../..
    ```
5.  **Set up Supabase Edge Functions (if needed):**
    -   Follow Supabase docs to set up the functions directory (e.g., `supabase/functions`).
    -   We will likely place OpenAI and Stripe interactions here.
    -   Edge Functions (`tone-suggest`, `refine-output`, `cancel-subscription`, `create-checkout-session`, `stripe-webhook`) have been implemented.
6.  **Environment Variables & Secrets:**
    -   **Frontend (.env):**
        -   Create `.env` files in `frontend/mobile` and `frontend/web` based on respective `.env.example` files.
        -   Add your Supabase **Project URL** (e.g., `EXPO_PUBLIC_SUPABASE_URL` or `VITE_SUPABASE_URL`) and **anon key** (e.g., `EXPO_PUBLIC_SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY`).
    -   **Supabase Secrets (Edge Functions):**
        -   Set the following secrets using the Supabase CLI (`npx supabase secrets set <NAME> <VALUE>`):
            -   `OPENAI_API_KEY`: Your OpenAI API key.
            -   `STRIPE_SECRET_KEY`: Your Stripe Secret Key (use Test key for development).
            -   `STRIPE_WEBHOOK_SECRET`: Your Stripe Webhook Signing Secret for the `stripe-webhook` endpoint.
            -   `SUPABASE_URL`: Your Supabase project URL (needed for Admin client).
            -   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (needed for Admin client, found in API settings).
            -   `(Optional) STRIPE_SUCCESS_URL`: Frontend URL for successful payment redirect.
            -   `(Optional) STRIPE_CANCEL_URL`: Frontend URL for cancelled payment redirect.

### Running the Application

-   **Backend:** (Handled by Supabase)
-   **Frontend (Mobile):**
    ```bash
    cd frontend/mobile
    npx expo start
    ```
-   **Frontend (Web):**
    ```bash
    cd frontend/web
    npm run dev
    ```

## Development Guidelines

### Branching Strategy

We use a Gitflow-like branching model:

-   `main`: Production-ready code. Only merge `develop` into `main` for releases.
-   `develop`: Integration branch for features. This is the primary development branch.
-   `feature/<feature-name>`: Branches for new features (e.g., `feature/frontend-ui`, `feature/backend-gpt-integration`). Create from `develop` and merge back into `develop`.
-   `fix/<fix-name>`: Branches for bug fixes. Create from `develop` (or `main` for hotfixes) and merge back.
-   `release/<version>`: Branches for release preparation. Create from `develop`.

### Commits

-   Follow conventional commit messages (e.g., `feat: add user login`, `fix: resolve payment processing error`).

### Code Style

-   Follow standard JavaScript/TypeScript style guides.
-   Use linters (ESLint) and formatters (Prettier) - configurations added for both frontend projects.
-   Run `npm run lint` and `npm run format` within `frontend/mobile` or `frontend/web` to check and fix styles.
-   Components extracted into `frontend/web/src/components/` for modularity.

## Project Structure (Revised for Supabase)

```
root/
├── frontend/
│   ├── mobile/       # React Native (Expo) with Supabase client
│   └── web/          # React.js (Vite) with Supabase client
│       ├── public/
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   │   ├── Header.tsx
│       │   │   ├── AuthModal.tsx
│       │   │   ├── InputSection.tsx
│       │   │   ├── ConfigSection.tsx
│       │   │   ├── MultiToneSelector.tsx
│       │   │   ├── ContentLengthSelector.tsx
│       │   │   ├── ToneTemplates.tsx
│       │   │   ├── ActionSection.tsx
│       │   │   ├── OutputSection.tsx
│       │   │   ├── ToneComparisonDisplay.tsx
│       │   │   ├── InfoCard.tsx # New Info Sidebar Card
│       │   │   ├── EmailShareButton.tsx (Deprecated/Removed UI)
│       │   │   ├── SavedPromptsModal.tsx (Deprecated/Removed UI)
│       │   │   ├── PremiumSubscription.tsx (Lazy-loaded)
│       │   │   └── UserPreferences.tsx (Lazy-loaded)
│       │   ├── lib/        # Supabase client setup, API helpers, data (e.g., savedPromptsApi.ts, toneTemplatesData.ts)
│       │   ├── assets/     # Static assets
│       │   ├── App.tsx     # Main application container
│       │   ├── main.tsx    # Entry point
│       │   └── index.css   # Global styles
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── vite.config.ts
│       └── package.json
├── supabase/         # Supabase specific files (CLI config, migrations, functions)
│   ├── migrations/   # Contains SQL for creating tables like 'saved_prompts', 'profiles'
│   └── functions/
│       ├── _shared/
│       ├── tone-suggest/ # Handles generation, including length param
│       ├── refine-output/ # Handles message refinement for premium users
│       ├── cancel-subscription/ # Handles Stripe cancellation
│       ├── send-email/   # Handles sending email (requires setup)
│       ├── create-checkout-session/
│       └── stripe-webhook/
├── docs/
├── scripts/
├── README.md         # This file
└── TODO.md           # Next steps and tasks (Revised)
```

## Contribution

(Details on how to contribute will be added later) 
