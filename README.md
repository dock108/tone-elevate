# ToneSmith

ToneSmith is an AI-powered communication assistant designed to help users generate well-toned messages suitable for various communication contexts.

## Overview

This application leverages AI (specifically GPT-4o) to take user input and generate a complete, polished message in the desired tone (e.g., professional, casual, persuasive), tailored for a specific context (e.g., Email, Teams Chat, LinkedIn), and formatted as either raw text or Markdown. It also offers user accounts, subscription management, and template saving (preferences component).

## MVP Features

-   AI-powered message generation based on user input, tone, context (`Email`, `Teams Chat`, `LinkedIn Post`, `GitHub Comment`, `General Text`, `Documentation`, `Text Message`), and output format (`Raw Text`/`Markdown`).
-   Basic message generation available without login.
-   Clear display of generated message with copy-to-clipboard.
-   User accounts (Supabase Auth) with optional preferences/template saving.
-   Subscription management (Freemium model via Stripe) for potential future premium features (currently, logged-in free users have a daily limit).

## Monetization

-   **Freemium Model:** Basic features are free.
-   **Premium Subscription:** Access to advanced AI models, unlimited usage, more template slots, and priority support. Implemented via Stripe.
-   **Initial Ad Integrations:** Exploring unobtrusive ad placements in the free tier.

## Technical Stack

-   **Frontend (Mobile):** React Native (Expo)
-   **Frontend (Web):** React.js (Vite) + Tailwind CSS
-   **Backend:** Supabase (Database, Auth, Edge Functions)
-   **AI Integration:** OpenAI GPT-4o API (likely called via Supabase Edge Functions)
-   **Payments Integration:** Stripe API (likely called via Supabase Edge Functions)
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
    -   Edge Functions (`tone-suggest`, `create-checkout-session`, `stripe-webhook`) have been implemented.
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

## Project Structure (Revised for Supabase)

```
root/
├── frontend/
│   ├── mobile/       # React Native (Expo) with Supabase client
│   └── web/          # React.js (Vite) with Supabase client
├── supabase/         # Supabase specific files (CLI config, migrations, functions)
│   ├── migrations/   # Database migrations managed by Supabase CLI
│   └── functions/    # Supabase Edge Functions (for OpenAI, Stripe, etc.)
│       ├── <function_name>/ # Directory per function
│       └── ...
├── docs/             # Documentation and references
├── scripts/          # Utility scripts (if any needed beyond Supabase)
├── README.md         # This file
└── TODO.md           # Next steps and tasks (Revised)
```

## Contribution

(Details on how to contribute will be added later) 