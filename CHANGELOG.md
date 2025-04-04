# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Project:** Initial Supabase directory structure (`supabase/migrations`, `supabase/functions`).
- **Project:** Supabase client library (`@supabase/supabase-js`) to frontend projects.
- **Project:** Updated `.env.example` files for frontends to include Supabase variables.
- **Frontend (Web):** Tailwind CSS dependency and configuration files (`tailwind.config.js`, `postcss.config.js`).
- **Frontend (Web):** `@tailwindcss/postcss` dependency.
- **Project:** `engines` field specifying Node.js >= v21 to `frontend/web/package.json`.

### Changed
- **Project:** Migrated backend from Node.js/Express/Prisma to Supabase (Database, Auth, Edge Functions).
- **Project:** Updated `README.md` to reflect Supabase migration (Stack, Setup, Structure).
- **Project:** Revised `TODO.md` to align with Supabase backend approach.
- **Backend (Edge Function `tone-suggest`):** Added `Documentation` and `Text Message` to valid contexts.
- **Backend (Edge Function `tone-suggest`):** Modified authentication logic to allow anonymous requests while still checking limits for logged-in users.
- **Backend (Edge Function `tone-suggest`):** Refined OpenAI prompt to improve contextual structure adaptation.
- **Frontend (Web & Mobile):** Added `Documentation` and `Text Message` context options and alphabetized dropdowns.
- **Frontend (Web):** Refactored `App.tsx` structure and styling using Tailwind CSS utility classes.
- **Frontend (Web):** Updated `postcss.config.js` to use `@tailwindcss/postcss`.
- **Frontend (Web):** Removed application-specific styles from `App.css`.
- **Project:** Updated `README.md` and `TODO.md` with recent changes.
- **Project:** Updated root `.gitignore` file with comprehensive rules.
- **Frontend (Web):** Attempted various fixes for Tailwind CSS styles not applying (clearing cache, updating configs).

### Fixed
- **Backend (Edge Function `tone-suggest`):** Corrected syntax error in `userPrompt` template literal.

### Removed
- **Backend:** Removed `backend/` directory and all Node.js/Express/Prisma code.
- **Backend:** Removed backend-specific entries from `.env.example` (now handled by Supabase secrets).

## [0.4.0] - YYYY-MM-DD <PLACEHOLDER_DATE>

### Changed
- **Core Functionality:** Refactored the core AI feature from providing "suggestions" to generating complete messages.
- **Backend (Edge Function `tone-suggest`):**
    - Changed input parameters from `{text, tone}` to `{text, tone, context, outputFormat}`.
    - Updated OpenAI prompt to generate full messages based on all inputs.
    - Simplified response format to return `{ generatedMessage: "..." }` directly.
    - Adjusted rate limiting logic to query the `profiles` table via Admin client.
    - Implemented JWT verification within the function using Admin client.
- **Frontend (Web & Mobile):**
    - Added UI controls (select/picker) for selecting `Context` (Email, Teams, etc.) and `Output Format` (Raw Text, Markdown).
    - Renamed state variables and UI labels from "Suggestions" to "Generate Message" (e.g., `isSuggesting` -> `isGenerating`, `handleGetSuggestions` -> `handleGenerateMessage`).
    - Updated the API call (`supabase.functions.invoke`) to send the new parameters (`context`, `outputFormat`).
    - Modified the output display area to show a single generated message instead of a list of suggestions.
    - Added "Copy to Clipboard" functionality for the generated message.
- **Frontend (Web):** Integrated `react-markdown` library to render Markdown formatted messages.
- **Project:** Updated `README.md` and `TODO.md` to reflect the shift to message generation.

## [0.3.1] - 2025-04-03

### Changed
- **Frontend (Web):** Refactored `App.tsx` layout to always show the main editor/suggestions view, supporting a freemium model.
- **Frontend (Web):** Moved authentication form (`Auth` component) into a modal triggered from the header.
- **Frontend (Web):** Header now dynamically shows Login/Sign Up buttons or user status/Sign Out based on session.
- **Frontend (Web):** Removed requirement for login before attempting to get AI suggestions (rate limits/auth handled by Edge Function).

## [0.3.0] - 2025-04-03

### Added
- **Project:** Initial Supabase directory structure (`supabase/migrations`, `supabase/functions`).
- **Project:** Supabase client library (`@supabase/supabase-js`) to `frontend/mobile` and `frontend/web`.
- **Project:** Supabase client initialization code (`lib/supabaseClient.js`, `src/lib/supabaseClient.ts`) in frontends.
- **Project:** Updated `.env.example` files for frontends to include Supabase variables.
- **Frontend:** ESLint and Prettier configurations for both `frontend/mobile` and `frontend/web`.
- **Frontend:** Lint and format scripts added to `package.json` for both frontends.
- **Frontend:** Placeholder `Auth` component UI added to both `App.js` (mobile) and `App.tsx` (web).
- **Frontend:** Basic session handling logic (`onAuthStateChange`) added to both `App.js` and `App.tsx`.
- **Backend (Supabase):** Deployed `tone-suggest` Edge Function for OpenAI integration (with rate limiting).
- **Backend (Supabase):** Deployed `create-checkout-session` Edge Function for Stripe checkout initiation.
- **Backend (Supabase):** Deployed `stripe-webhook` Edge Function to handle Stripe events and update user profiles.
- **Frontend:** Integrated AI suggestion feature (`handleGetSuggestions`) with `tone-suggest` Edge Function.
- **Frontend:** Integrated Auth UI (`Auth` component) with Supabase Auth methods (`signInWithPassword`, `signUp`).
- **Frontend:** Added `PremiumSubscription` component (Mobile/Web) to trigger checkout function.
- **Frontend:** Added `UserPreferences` component (Mobile/Web) for template CRUD operations via Supabase client.
- **Frontend:** Implemented profile fetching and Supabase Realtime subscription for profile updates.

### Changed
- **Project:** Migrated backend strategy from Node.js/Express/Prisma to Supabase (Database, Auth, Edge Functions).
- **Project:** Updated `README.md` to reflect Supabase migration (Stack, Setup, Structure, Code Style).
- **Project:** Revised `TODO.md` to align with Supabase backend approach and marked Phase 1 & 2 as complete.

### Removed
- **Backend:** Removed `backend/` directory and all associated Node.js/Express/Prisma code.
- **Backend:** Removed backend-specific entries from `.env.example`.

## [0.2.0] - 2025-04-03

### Added
- **Backend:** ESLint and Prettier setup with Airbnb config.
- **Backend:** Structured API routes (`/api/ai`, `/api/payments`, `/api/users`).
- **Backend:** Basic error handling middleware.
- **Backend:** OpenAI library and basic GPT-4o service (`gptService.js`) implementation.
- **Backend:** Updated `/api/ai/suggest` route to use `gptService`.
- **Backend:** Stripe library and basic service (`stripeService.js`) for checkout sessions and webhooks.
- **Backend:** Updated `/api/payments` routes to use `stripeService`.
- **Backend:** Prisma setup with PostgreSQL provider.
- **Backend:** Defined `User` and `Preference` models in `schema.prisma`.
- **Backend:** Database connection logic using Prisma Client (`db.js`).
- **Backend:** Integrated database connection call into `server.js`.
- **Backend:** Added Prisma migration, generation, and studio scripts to `package.json`.
- **Backend:** Added Stripe redirect URLs to `.env.example`.

### Changed
- **Backend:** Updated `server.js` main entry point in `package.json`.
- **Backend:** Refined placeholder routes to integrate service calls.

## [0.1.0] - 2025-04-03

### Added
- Initial project structure with frontend (React Native/Expo, React/Vite) and backend (Node.js/Express) directories.
- Basic Express server setup with CORS and JSON parsing.
- Placeholder services for AI (GPT-4o) and Payments (Stripe).
- Initialized React Native (Expo) and React (Vite) projects.
- Basic UI boilerplate for mobile and web apps (editor, suggestions display).
- Configuration example files (`.env.example`) for backend, mobile, and web.
- `README.md` with project overview, setup, stack, and development guidelines.
- `TODO.md` outlining MVP development phases and tasks.
- `CHANGELOG.md` (this file) to track project changes. 