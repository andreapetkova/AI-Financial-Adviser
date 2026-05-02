# Context Management

- This file is the source of truth — if context is lost, re-read CLAUDE.md before continuing
- Implement tasks following the docs/tasks.md file — before starting check the docs/summary.md to see last changes, mark each task as complete when done
- After completing a task, summarise what changed in one sentence in docs/summary.md, then stop and wait
- Run /clear manually between tasks to keep context lean

# Project

AI Financial Assistant — AI-powered SaaS app that analyzes bank statements, categorizes expenses via Claude AI, and provides budgeting tools and financial insights.

# Stack

- TypeScript (strict mode)
- React 19 + Next.js 16 (App Router)
- Supabase (PostgreSQL + Auth)
- Tailwind CSS v4 + shadcn/ui
- TanStack Query (server state)
- Recharts (data visualization)
- Zod (runtime validation), Papa Parse (CSV parsing)
- Anthropic SDK (Claude API via Next.js Route Handlers)
- Deployed on Vercel

# Structure

- `src/app/` — Next.js App Router (layouts, pages, API routes)
- `src/app/(auth)/` — public auth pages (login, signup) with redirect-if-authenticated layout
- `src/app/(app)/` — protected pages (dashboard, upload, transactions, budget, insights) with sidebar layout
- `src/app/api/` — Next.js Route Handlers (categorize, insights) — server-side Claude API calls
- `src/features/upload/` — CSV upload, parsing, column mapping, preview
- `src/features/transactions/` — transaction list, category editing (human-in-the-loop)
- `src/features/dashboard/` — spending charts, category breakdown, monthly comparison
- `src/features/budget/` — budget configuration, progress tracking per category
- `src/features/insights/` — AI-generated financial insights display
- `src/components/` — shared reusable UI components (ErrorBoundary, LoadingSpinner, form primitives)
- `src/lib/ai/` — Claude API service layer (prompts, parsing, retry, rules-based categorizer)
- `src/lib/validators/` — Zod schemas for transactions, budgets, API responses
- `src/lib/supabase/` — Supabase client singleton and typed query functions
- `src/lib/parsers/` — CSV parsing logic (Papa Parse → raw rows → Zod validation → typed `Transaction[]`)
- `src/lib/utils/` — pure utility functions
- `src/hooks/` — custom React hooks (including `useAuth()` backed by Supabase `onAuthStateChange`)
- `src/context/` — React Context providers (AuthContext — thin wrapper around Supabase auth state only)
- `src/types/` — shared TypeScript domain models (source of truth — kept in sync with Supabase-generated types)
- `tests/` — Playwright E2E tests

# Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Test: `npm test`
- Lint: `npm run lint`
- E2E: `npx playwright test`

# Verification

After every change, run in this order:

1. `npx tsc --noEmit` — fix type errors first (catches structural issues)
2. `npm test` — fix failing tests (catches behavioural issues)
3. `npm run lint` — fix lint errors (catches style issues)

# Git

- **Commit message format**: `TASK-N: short description` (e.g. `TASK-1: project scaffolding`) — every commit must be prefixed with the task number it belongs to

# Conventions

- **App Router structure**: pages live in `src/app/`, feature components live in `src/features/` — pages are thin wrappers that import feature components
- **Client components**: add `'use client'` directive to any component using hooks, state, event handlers, or browser APIs
- **Route protection**: handled via `(auth)` and `(app)` route group layouts — `(auth)/layout.tsx` redirects authenticated users, `(app)/layout.tsx` redirects unauthenticated users
- **Isolated AI layer**: all prompt construction, API calls, response parsing, retry logic lives in `src/lib/ai/` — components never call the AI API directly
- **Hybrid categorization**: regex rules for obvious categories (e.g., "Netflix" → subscriptions), Claude API only for ambiguous ones — cost-aware and latency-aware by design
- **Optimistic UI**: category edits update immediately, sync to Supabase in background
- **shadcn/ui components**: use shadcn primitives (owned in codebase), not external component libraries
- **Zod validation at boundaries**: validate CSV input, AI API responses, and user input with Zod schemas. CSV pipeline order is always: Papa Parse → raw rows → Zod validation → typed `Transaction[]`
- **TanStack Query for all server state**: no manual fetch/useEffect patterns for data fetching
- **Lazy loading**: chart components (Recharts) loaded with `React.lazy()` or `next/dynamic`
- **Error boundaries**: the AI insights feature and the upload flow each have their own isolated error boundary — a Claude API failure must never crash the dashboard. All error boundary fallback UIs are defined in `src/components/`
- **Type source of truth**: hand-written domain models in `src/types/` are the source of truth — Supabase-generated types must be kept in sync with them, not the other way around
- **Auth state**: managed via a single `useAuth()` hook in `src/hooks/` backed by Supabase's `onAuthStateChange` — AuthContext is a thin wrapper only, not a general-purpose state store
- **Descriptive naming**: prefer full, readable names over abbreviations and shorthands (e.g., `classnames` not `cn`, `handleSubmit` not `onSub`)
- **Extract components over long class strings**: when Tailwind utility strings get long or repeat, extract a small component to own the styles rather than duplicating inline class strings
- **Supabase auth listener ordering**: always register `onAuthStateChange` before calling `getSession()` — avoids a race where `getSession` overwrites a newer auth event
- **Guard both route directions**: public-only pages (login, signup) must redirect authenticated users away; protected pages must redirect unauthenticated users to login — handled by route group layouts
- **Handle async errors at call sites**: every user-triggered async action (sign out, save, delete) must have error handling — never fire-and-forget an awaited call that can throw
- **Consistent JSX string patterns**: use `{"string with apostrophe's"}` for inline text with special characters — avoid mixing `&apos;` entities and `{' '}` spacers
- **Environment variables**: use `NEXT_PUBLIC_` prefix for client-side env vars, no prefix for server-only (API routes)

# Don't

- Don't put AI logic in components — all AI calls go through `src/lib/ai/` service layer
- Don't call Supabase directly from components — use typed query functions in `src/lib/supabase/queries.ts`
- Don't skip Zod validation for external data (CSV rows, API responses) — always validate at system boundaries
- Don't use `useEffect` for data fetching — use TanStack Query hooks instead
- Don't install external component libraries — use shadcn/ui primitives and build from there
- Don't store API keys client-side — proxy all Claude API calls through Next.js Route Handlers in `src/app/api/`
- Don't add Zustand unless you feel genuine cross-cutting state pain that Context cannot solve — it is not in the stack by default
- Don't let a Claude API failure propagate to the full page — AI features must fail within their own error boundary
- Don't call Supabase-generated types your source of truth — sync them to `src/types/`, never the reverse
