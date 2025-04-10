# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Project:** Initial Supabase directory structure (`supabase/migrations`, `supabase/functions`).
- **Project:** Supabase client library (`@supabase/supabase-js`) to frontend projects.
- **Project:** Updated `.env.example` files for frontends to include Supabase variables.
- **Frontend (Web):** Tailwind CSS (v3) dependency and configuration files (`tailwind.config.js`, `postcss.config.js`).
- **Frontend (Web):** `@tailwindcss/postcss` and `tailwindcss` dependencies.
- **Frontend (Web):** `@tailwindcss/typography` plugin for Markdown styling.
- **Project:** `engines` field specifying Node.js >= v21 to `frontend/web/package.json`.
- **Backend (Edge Function `tone-suggest`):** Input parsing step using a secondary LLM call to extract intent, tone, and message from raw `userInput`.
- **Backend (Edge Function `tone-suggest`):** Post-processing step to remove common AI introductory phrases from the generated output.
- **Frontend (Web):** Ad placeholder slots (right sidebar and fixed bottom banner).
- **Frontend (Web):** Hover, active, focus, and disabled states with transitions for buttons and input fields.
- **Frontend (Web):** Improved loading spinner within the Generate Message button.
- **Frontend (Web):** Fade-in transition for the generated message section.
- **Backend (Edge Function `tone-suggest`):** Recipient-specific tone variations for "Professional" (C-Suite, Director, Boss, Peer Group, Subordinates, Interns) with tailored AI instructions.
- **Backend:** Centralized tone registry (`supabase/functions/_shared/tones.ts`) defining tone IDs, labels, and specific instructions.
- **Frontend (Web):** Extracted UI sections (`Header`, `InputSection`, `ConfigSection`, `ActionSection`, `OutputSection`) from monolithic `App.tsx` into separate components.
- **Frontend (Web):** Implemented input validation (disable button, inline message) in `ActionSection`.
- **Frontend (Web):** Added `react-hot-toast` for user feedback (loading, success, error notifications).
- **Frontend (Web):** Added state to Copy button for temporary "Copied ✓" feedback in `OutputSection`.
- **Frontend (Web):** Added state (`hasJustGenerated`) to prevent duplicate submissions by briefly disabling the Generate button.
- **Frontend (Web):** Added Clear Input button to `InputSection`.
- **Frontend (Web):** Set up lazy loading with `React.lazy` and `Suspense` for `PremiumSubscription` and `UserPreferences` components in `App.tsx`.
- **Frontend (Web):** Added semantic HTML elements (`<main>`, `<section>`) and screen-reader-only headings in `App.tsx` for improved accessibility.
- **Database (Supabase):** Created `saved_prompts` table with columns (`id`, `user_id`, `created_at`, `label`, `prompt_text`, `tone_id`, `context`) and appropriate foreign key constraints (`user_id` -> `auth.users.id`).
- **Database (Supabase):** Implemented Row-Level Security (RLS) policies on `saved_prompts` table to ensure users can only access/modify their own prompts (SELECT, INSERT, DELETE).
- **Frontend (Web):** Created Supabase API helper functions (`fetchSavedPrompts`, `saveNewPrompt`, `deletePrompt`) in `src/lib/savedPromptsApi.ts` for interacting with the `saved_prompts` table.
- **Frontend (Web):** Integrated Saved Prompts state management (`savedPrompts`, `isLoadingPrompts`, `showSavedPromptsModal`) and handlers (`handleFetchSavedPrompts`, `handleSaveCurrentPrompt`, etc.) into `App.tsx`.
- **Frontend (Web):** Added conditional "Save Prompt" and "Load Prompts" buttons to `InputSection.tsx`, visible only to logged-in users.
- **Frontend (Web):** Created `SavedPromptsModal.tsx` component (lazy-loaded) to display, select, and delete saved prompts.
- **Frontend (Web):** Updated `App.tsx` to fetch saved prompts on user session change and pass relevant state/handlers to `InputSection` and `SavedPromptsModal`.
- **Frontend (Web):** Implemented basic Auth UI (`AuthModal.tsx` using Supabase UI) and integrated visibility toggling via `Header.tsx`.
- **Frontend (Web):** Added `MultiToneSelector.tsx` component for logged-in users to select multiple tones for comparison.
- **Frontend (Web):** Added `ToneComparisonDisplay.tsx` component to display multiple generated variations side-by-side.
- **Backend (Edge Function `tone-suggest`):** Updated function to accept and utilize `outputLength` parameter in prompt generation.
- **Frontend (Web):** Added `ContentLengthSelector.tsx` component to allow users to select desired output length (Short, Medium, Long).
- **Backend (Edge Function):** Outlined `send-email` Edge Function structure (requires external email provider like Resend/SendGrid).
- **Frontend (Web):** Created `EmailShareButton.tsx` component with modal for logged-in users to send generated content via email.
- **SEO (Web):** Added `react-helmet-async` dependency for managing document head tags.
- **SEO (Web):** Implemented dynamic `<title>` and `<meta name="description">` tags in `App.tsx` via Helmet.
- **SEO (Web):** Replaced text header with logo image (`tone-elevate-logo-full.png`) in `Header.tsx` and added descriptive alt text.
- **SEO (Web):** Updated favicon link in `index.html` to use `tone-elevate-logo-icon.png`.
- **SEO (Web):** Added a visually hidden (`sr-only`) but accessible `<h1>` tag to `App.tsx` for improved semantics and SEO.
- **Project:** Created `frontend/web/public/robots.txt` file to allow search engine crawling.

### Changed
- **Project:** Migrated backend from Node.js/Express/Prisma to Supabase (Database, Auth, Edge Functions).
- **Project:** Updated `README.md` to reflect Supabase migration (Stack, Setup, Structure).
- **Project:** Revised `TODO.md` to align with Supabase backend approach.
- **Backend (Edge Function `tone-suggest`):** Added `Documentation` and `Text Message` to valid contexts.
- **Backend (Edge Function `tone-suggest`):** Modified authentication logic to allow anonymous requests while still checking limits for logged-in users.
- **Backend (Edge Function `tone-suggest`):** Refined OpenAI prompt to improve contextual structure adaptation.
- **Backend (Edge Function `tone-suggest`):** Further refined the system prompt for generation to more aggressively target and forbid specific clichés (e.g., "hope this finds you well") and generic email opening fluff.
- **Frontend (Web & Mobile):** Added `Documentation` and `Text Message` context options and alphabetized dropdowns.
- **Frontend (Web):** Major UI/UX redesign in `App.tsx` implementing modern styling, branding, colors, typography, and layout using Tailwind CSS.
- **Frontend (Web):** Reorganized layout into Header, Input Section, Config Section, Output Section.
- **Frontend (Web):** Updated button styles and added loading/copied feedback states.
- **Frontend (Web):** Implemented two-column layout (main content + right ad sidebar) on wider screens.
- **Frontend (Web):** Configured PostCSS (`postcss.config.js`) and Vite (`vite.config.ts`) for Tailwind v3.
- **Frontend (Web):** Removed application-specific styles from `App.css` in favor of Tailwind.
- **Project:** Updated `README.md` and `TODO.md` with recent changes.
- **Project:** Updated root `.gitignore` file with comprehensive rules.
- **Backend (Edge Function `tone-suggest`):** Modified the primary input from separate `text` and `tone` fields to a single `userInput` field.
- **Backend (Edge Function `tone-suggest`):** Updated the system prompt for the main generation LLM call to emphasize natural language, avoid clichés, and focus on intent/tone/context adherence.
- **Backend (Edge Function `tone-suggest`):** Updated the user prompt for the main generation LLM call to incorporate the parsed intent, tone, and message.
- **Backend (Edge Function `tone-suggest`):** Refactored to use the shared tone registry, improving fallback logic to use a default tone if parsing fails or the tone is invalid.
- **Backend (Edge Function `tone-suggest`):** Separated message generation logic into a dedicated `generateMessage` function.
- **Backend (Edge Function `tone-suggest`):** Increased `MAX_INPUT_LENGTH` to 8192 characters.
- **Frontend (Web):** Updated tone dropdown in `App.tsx` to use structured `id`/`label` options and list professional tones hierarchically.
- **Frontend (Web):** Set default selected tone to "Professional - Boss.
- **Frontend (Web):** Refactored `App.tsx` to act as a container component passing state and handlers to child components.
- **Frontend (Web):** Removed Markdown output format option and related dependencies (`react-markdown`, `react-syntax-highlighter`). Application now defaults to and only uses "Raw Text" output.
- **Frontend (Web):** Replaced state-based error/success display (`generationError`, `copySuccess`) with `react-hot-toast` notifications.
- **Frontend (Web):** Changed Raw Text output element from `<pre>` to `<div>` in `OutputSection` for better font consistency, while retaining `whitespace-pre-wrap`.
- **Frontend (Web):** Updated API call in `App.tsx` to send `{ userInput, context, outputFormat }` in the body, matching `tone-suggest` function expectations.
- **Frontend (Web):** Simplified `ConfigSection` by removing the Output Format dropdown.
- **Frontend (Web):** Updated `InputSection.tsx` props interface to include `isLoggedIn`, `onSavePrompt`, `onLoadPrompt`.
- **Frontend (Web):** Updated `App.tsx` to manage authentication state (`session`) directly for use with Saved Prompts feature.
- **Frontend (Web):** Updated `App.tsx` generation handler (`handleGenerateOrCompare`) to support multiple API calls (`Promise.all`) for tone comparison.
- **Frontend (Web):** Updated `App.tsx` to conditionally render single output (`OutputSection`) or comparison output (`ToneComparisonDisplay`).
- **Frontend (Web):** Updated `App.tsx` to conditionally render `MultiToneSelector` (logged-in) or `ConfigSection` (logged-out).
- **Frontend (Web):** Updated `App.tsx` to integrate `selectedLength` state and pass it to the generation handler.
- **Frontend (Web):** Updated `App.tsx` to integrate `handleSendEmail` handler and pass necessary props to `OutputSection`.
- **Frontend (Web):** Updated `OutputSection.tsx` to conditionally render `EmailShareButton` for logged-in users.
- **Frontend (Web):** Updated `Header.tsx` to display user email/logout button or login/signup button based on session state.
- **UI Layout (Web):** Moved `ToneTemplates` component above `InputSection` and implemented horizontal scrolling.
- **UI Layout (Web):** Moved `ActionSection` to a fixed position at the bottom of the viewport (above ad banner).
- **UI Layout (Web):** Increased bottom padding on the main content area (`pb-64`) for better scroll visibility.
- **UI Layout (Web):** Updated `ActionSection` to display comparison count info separately from the main button text.

### Fixed
- **Backend (Edge Function `tone-suggest`):** Corrected syntax error in `userPrompt` template literal.
- **Frontend (Web):** Installed missing `tailwindcss` dependency.
- **Frontend (Web):** Resolved build errors in `App.tsx` related to unused variables/imports and incorrect `ReactMarkdown` styling props after initial Tailwind refactor.
- **Frontend (Web):** Downgraded Tailwind CSS from v4 alpha to stable v3 (`^3.4.6`) to resolve build errors and issues with responsive styles not applying.
- **Frontend (Web):** Corrected PostCSS configuration for Tailwind v3.
- **Frontend (Web):** Resolved Vite `command not found` error by cleaning cache and reinstalling dependencies.
- **Frontend (Web):** Ensured Tailwind CSS styles (including responsive variants) are correctly applied.
- **Frontend (Web):** Added padding to generated message content area to prevent text overlapping the copy button.
- **Backend (Edge Function `tone-suggest`):** Corrected parsing error in `_shared/tones.ts` caused by escaped newline characters during file creation.
- **Frontend (Web):** Corrected API request body sent to `tone-suggest` Edge Function to resolve `non-2xx` errors.
- **Frontend (Web):** Fixed `react-markdown` error by removing `className` prop and applying styles to a wrapper element (before Markdown support was removed).
- **Frontend (Web):** Added `overflow-x-auto` to output display (`OutputSection`) to handle long unbreakable strings without breaking page layout.
- **Frontend (Web):** Added missing component imports in `App.tsx` after refactoring, resolving `ReferenceError`.
- **Frontend (Web):** Corrected Supabase auth listener unsubscribe call in `App.tsx` (`authListener?.subscription?.unsubscribe()`).

### Removed
- **Backend:** Removed `backend/` directory and all Node.js/Express/Prisma code.
- **Backend:** Removed backend-specific entries from `.env.example` (now handled by Supabase secrets).
- **Frontend (Web):** Removed floating tooltip feedback for copy-to-clipboard (using button state only).
- **Frontend (Web):** Removed `outputFormat` state and related handler from `App.tsx`.
- **Frontend (Web):** Removed `react-markdown` and `react-syntax-highlighter` dependencies (pending `npm uninstall`).
- **Frontend (Web):** Removed `generationError` and `copySuccess` state variables from `App.tsx`.

## [0.4.0] - 2025-04-09

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