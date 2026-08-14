# FinanceAI

AI-powered personal finance assistant. Upload your bank statement PDF, get your transactions automatically extracted and categorized by Claude AI, then explore your spending through charts, budgets, and AI-generated insights.

## Features

- **PDF import** — drop a bank statement PDF; Claude reads it directly and extracts every transaction regardless of format, language, or layout
- **AI categorization** — hybrid approach: instant regex rules for obvious merchants (Netflix, Spotify, Shell), Claude API for everything ambiguous
- **Human-in-the-loop editing** — override any AI category; manually-edited rows are protected from future AI overwrites
- **Dashboard** — daily spending chart, category breakdown pie, 6-month comparison bar chart, all updating per selected month
- **Budgets** — set monthly spending limits per category, track progress with color-coded bars
- **AI insights** — one-click financial analysis: overspending warnings, saving opportunities, spending trends

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript strict
- **Database / Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Anthropic Claude API (via Next.js Route Handlers — key never touches the client)
- **State**: TanStack Query for server state, React Context for auth
- **UI**: Tailwind CSS v4 + shadcn/ui primitives
- **Charts**: Recharts (lazy-loaded)
- **Validation**: Zod at all external boundaries (PDF parse output, AI API responses, user input)
- **Tests**: Vitest + React Testing Library (118 tests)

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your Anthropic API key at **console.anthropic.com → API Keys**.

Optionally pin the Claude model (defaults to `claude-sonnet-4-6`):

```env
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

Haiku is ~20x cheaper and fast enough for most bank statements. Use Sonnet for complex or multi-page PDFs.

### 3. Set up the database

Run both migrations against your Supabase project. You can do this in the Supabase dashboard under **SQL Editor**:

```
supabase/migrations/00001_initial_schema.sql
supabase/migrations/00002_fix_profile_trigger.sql
```

This creates the `profiles`, `transactions`, `budgets`, `insights`, and `uploads` tables with Row Level Security enabled — each user can only ever see their own data.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and upload a bank statement PDF.

## Project structure

```
src/
  app/                  # Next.js App Router
    (auth)/             # Public pages (login, signup) — redirects away if logged in
    (app)/              # Protected pages (dashboard, upload, transactions, budget, insights)
    api/                # Route Handlers — all Claude API calls live here (server-only)
  features/             # Feature components (upload, transactions, dashboard, budget, insights)
  lib/
    ai/                 # Claude service layer: prompts, parsing, retry, rules-based categorizer
    parsers/            # PDF/CSV parsing utilities and types
    supabase/           # Client singleton + typed query functions
    validators/         # Zod schemas for all external data
  hooks/                # Custom React hooks (useAuth, useTransactions, useBudgets, etc.)
  components/           # Shared UI components (ErrorBoundary, LoadingSpinner, etc.)
  context/              # Auth context (thin wrapper around Supabase onAuthStateChange)
  types/                # Domain models — source of truth, kept in sync with Supabase
```

## Development commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm test             # Run unit tests (Vitest)
npm run lint         # ESLint
npx tsc --noEmit     # Type check only
```

## Architecture notes

**AI calls are server-only.** The Anthropic API key is never sent to the browser. All three Claude routes (`/api/parse-csv`, `/api/categorize`, `/api/insights`) authenticate the caller via Supabase bearer token before touching the AI.

**PDF parsing uses Claude's native document API.** The PDF is read as base64 in the browser and sent to the route, which passes it to Claude as a `document` content block. This means Claude sees the actual PDF structure — tables, columns, multi-line records — not just extracted plain text.

**Hybrid categorization keeps costs low.** A regex rule set handles well-known merchants instantly with zero API calls. Only genuinely ambiguous transactions go to Claude, batched to minimize round trips.

**Optimistic UI on category edits.** Category changes update the UI immediately and sync to Supabase in the background, with automatic rollback on failure.

**AI failures are isolated.** The insights feature and the upload flow each have their own error boundary — a Claude API error never crashes the dashboard or any other page.
