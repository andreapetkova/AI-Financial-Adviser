AI Financial Assistant - Implementation Plan                                                                                                                                                                                                                                                                                                             
 Context

 Building a production-grade AI-powered financial assistant SaaS app for portfolio/interview purposes (targeting Remote.com senior frontend roles). The app analyzes bank
 statements, categorizes expenses via Claude AI, and provides budgeting tools and insights.

 Key decisions made:
 - API Layer: Vercel Serverless Functions (for Claude API proxy)
 - Storage: Supabase (PostgreSQL + real-time)
 - Auth: Supabase Auth (email/password + OAuth)
 - Testing: Jest + React Testing Library (unit/integration), Playwright (E2E)

 ---
 Task 1: Project Scaffolding & Configuration

 Goal: Set up the Vite + React + TypeScript project with all tooling configured.

 Steps:
 1. Scaffold with npm create vite@latest (React + TypeScript template)
 2. Install and configure dependencies:
   - Tailwind CSS v4 + PostCSS
   - shadcn/ui (init + base components: Button, Input, Card, Dialog, Toast)
   - React Router v6
   - TanStack Query
   - Zustand
   - Recharts
   - Zod
   - Supabase client (@supabase/supabase-js)
   - Anthropic SDK (@anthropic-ai/sdk - for serverless functions)
   - Papa Parse (CSV parsing)
 3. Configure TypeScript strict mode
 4. Set up folder structure per spec:
 /src
   /features/upload, /transactions, /dashboard, /budget, /insights
   /components
   /lib/ai, /lib/validators, /lib/utils, /lib/supabase
   /hooks
   /context
   /types
 /api          ← Vercel serverless functions
 /tests        ← Playwright E2E (later)
 5. Configure ESLint + Prettier
 6. Set up .env.local with placeholder keys (Supabase URL/key, Anthropic key)
 7. Add .gitignore, vercel.json
 8. Initialize git repo, first commit

 Verification: npm run dev starts without errors, folder structure in place.

 ---
 Task 2: Core Domain Models, Types & Zod Schemas

 Goal: Define the TypeScript types and Zod validation schemas that everything else builds on.

 Steps:
 1. Create /src/types/index.ts — domain models:
   - Transaction, Category, Budget, Insight (as specified in project doc)
   - ParsedCSVRow (raw CSV input before validation)
   - AICategorizationResponse, AIInsightResponse (API response shapes)
   - User type (extending Supabase user)
 2. Create /src/lib/validators/transaction.ts — Zod schemas:
   - csvRowSchema — validates a single parsed CSV row
   - transactionSchema — validates a full Transaction object
   - categorizationResponseSchema — validates Claude API categorization response
   - insightResponseSchema — validates Claude API insight response
 3. Create /src/lib/validators/budget.ts — Zod schemas for budget input

 Verification: Types compile, Zod schemas parse sample data correctly.

 ---
 Task 3: Supabase Setup (Database & Client)

 Goal: Set up Supabase project, database schema, and client integration.

 Steps:
 1. Create Supabase project (manual step — user sets up on supabase.com)
 2. Create database migration SQL for tables:
   - profiles (id, email, created_at)
   - transactions (id, user_id, date, description, amount, currency, category, confidence, manually_edited, upload_batch_id, created_at)
   - budgets (id, user_id, category, limit_amount, month, created_at)
   - insights (id, user_id, message, type, generated_at, month)
   - uploads (id, user_id, filename, row_count, created_at)
 3. Set up Row Level Security (RLS) policies — users can only access their own data
 4. Create /src/lib/supabase/client.ts — Supabase client singleton
 5. Create /src/lib/supabase/queries.ts — typed query functions:
   - getTransactions(), upsertTransactions(), updateTransactionCategory()
   - getBudgets(), upsertBudget()
   - getInsights(), saveInsights()

 Verification: Can connect to Supabase from the app, run basic queries.

 ---
 Task 4: Authentication (Supabase Auth)

 Goal: Implement auth flow with protected routes.

 Steps:
 1. Create /src/context/AuthContext.tsx — auth state provider:
   - useAuth() hook: user, session, loading, signIn, signUp, signOut
   - Listen to Supabase auth state changes
 2. Create /src/features/auth/LoginPage.tsx — email/password login form
 3. Create /src/features/auth/SignUpPage.tsx — registration form
 4. Create /src/components/ProtectedRoute.tsx — redirects to login if not authenticated
 5. Create /src/components/Layout.tsx — app shell with navigation sidebar:
   - Links: Upload, Dashboard, Transactions, Budget, Insights
   - User avatar/menu with sign out
 6. Set up React Router in App.tsx:
   - Public routes: /login, /signup
   - Protected routes: /upload, /dashboard, /transactions, /budget, /insights
   - Default redirect: /dashboard

 Verification: Can sign up, log in, see protected pages, get redirected when not authenticated.

 ---
 Task 5: CSV Upload & Parsing

 Goal: Upload bank statement CSV files, parse and validate them into transactions.

 Files to modify/create:
 - /src/features/upload/UploadPage.tsx
 - /src/features/upload/components/FileDropzone.tsx
 - /src/features/upload/components/ParsePreview.tsx
 - /src/features/upload/components/ColumnMapper.tsx
 - /src/lib/parsers/csv.ts
 - /src/hooks/useFileUpload.ts

 Steps:
 1. Create csv.ts parser:
   - Use Papa Parse to parse CSV to rows
   - Auto-detect column mapping (date, description, amount) using heuristics
   - Validate each row with csvRowSchema (Zod)
   - Return { valid: Transaction[], errors: ValidationError[] }
 2. Create FileDropzone — drag-and-drop + click file input (shadcn + Tailwind)
 3. Create ColumnMapper — let user confirm/adjust column mapping if auto-detect fails
 4. Create ParsePreview — show table of parsed transactions before confirming
   - Highlight validation errors per row
   - Show count: "42 valid, 3 errors"
 5. Create UploadPage — orchestrates the flow:
   - Step 1: Drop file → Step 2: Map columns → Step 3: Preview → Step 4: Confirm & save
 6. On confirm: save transactions to Supabase, trigger AI categorization (Task 6)

 Verification: Upload a sample CSV, see preview table, confirm, data saved to Supabase.

 ---
 Task 6: AI Service Layer (Vercel Serverless + Claude API)

 Goal: Build the AI backend (serverless functions) and frontend service layer.

 Serverless functions (in /api):
 1. /api/categorize.ts — receives transactions, returns categories:
   - Hybrid approach: regex rules for obvious categories (e.g., "Netflix" → subscriptions)
   - Claude API for ambiguous ones (batch, to reduce API calls)
   - Returns { transactionId, category, confidence }[]
   - Validates response with Zod schema
 2. /api/insights.ts — receives categorized transaction data, returns insights:
   - Constructs prompt with spending summary
   - Returns structured insights (warning/saving/info)

 Frontend service layer (/src/lib/ai/):
 3. Create categorizer.ts:
 - categorizeTransactions(transactions) — calls /api/categorize
 - Handles batching (chunk large sets)
 - Retry logic with exponential backoff
 4. Create insights.ts:
   - generateInsights(transactions, budgets) — calls /api/insights
 5. Create rules.ts:
   - Rule-based categorizer for obvious patterns (runs client-side first)
   - Maps: merchant keywords → categories
 6. Create TanStack Query hooks:
   - useCategorizeMutation() — triggers categorization
   - useInsightsQuery() — fetches/generates insights

 Verification: Upload CSV → transactions get auto-categorized with confidence scores.

 ---
 Task 7: Transaction Management

 Goal: View, filter, and edit transaction categories (human-in-the-loop).

 Files:
 - /src/features/transactions/TransactionsPage.tsx
 - /src/features/transactions/components/TransactionTable.tsx
 - /src/features/transactions/components/CategoryBadge.tsx
 - /src/features/transactions/components/CategoryEditor.tsx
 - /src/features/transactions/components/TransactionFilters.tsx

 Steps:
 1. TransactionTable — virtualized table (for large datasets):
   - Columns: Date, Description, Amount, Category, Confidence, Actions
   - Sort by any column
   - Inline category editing
 2. CategoryBadge — colored badge showing category + confidence indicator:
   - Low confidence (< 0.7): yellow border, "AI suggested" tooltip
   - High confidence: solid badge
   - Manually edited: checkmark icon
 3. CategoryEditor — dropdown to change category:
   - Optimistic UI update (update immediately, sync to Supabase in background)
   - Mark as manuallyEdited: true
 4. TransactionFilters — filter by category, date range, amount range
 5. Wire up TanStack Query for data fetching + mutations

 Verification: View transactions, change a category, see optimistic update, filter works.

 ---
 Task 8: Dashboard (Charts & Overview)

 Goal: Build the main dashboard with spending visualizations.

 Files:
 - /src/features/dashboard/DashboardPage.tsx
 - /src/features/dashboard/components/SpendingChart.tsx
 - /src/features/dashboard/components/CategoryBreakdown.tsx
 - /src/features/dashboard/components/MonthlyComparison.tsx
 - /src/features/dashboard/components/SummaryCards.tsx

 Steps:
 1. SummaryCards — top-level metrics:
   - Total spending, transaction count, top category, budget status
 2. SpendingChart (Recharts) — line/bar chart of daily/weekly spending
   - Lazy loaded (React.lazy)
 3. CategoryBreakdown (Recharts) — pie/donut chart of spending by category
   - Click on slice → filter transactions
 4. MonthlyComparison — bar chart comparing current vs previous month
 5. DashboardPage — responsive grid layout of all widgets
 6. Data derivation hooks:
   - useSpendingSummary(transactions) — memoized calculations
   - useCategoryBreakdown(transactions) — grouped totals

 Verification: Dashboard shows charts with real data after uploading a CSV.

 ---
 Task 9: Budgeting System

 Goal: Set budgets per category and track spending against them.

 Files:
 - /src/features/budget/BudgetPage.tsx
 - /src/features/budget/components/BudgetForm.tsx
 - /src/features/budget/components/BudgetProgressCard.tsx
 - /src/features/budget/components/BudgetOverview.tsx

 Steps:
 1. BudgetForm — set/edit budget for each category:
   - Category selector, amount input, month picker
   - Zod validation on input
 2. BudgetProgressCard — per-category progress:
   - Progress bar (green → yellow → red as approaching/exceeding limit)
   - "X% used" / "Over budget by $Y"
   - Alert icon when > 90%
 3. BudgetOverview — grid of all budget cards for selected month
 4. TanStack Query hooks: useBudgets(), useUpsertBudget()
 5. Integrate with dashboard — budget status in summary cards

 Verification: Set a budget, see progress bar reflect actual spending from transactions.

 ---
 Task 10: AI Insights

 Goal: Display AI-generated financial insights.

 Files:
 - /src/features/insights/InsightsPage.tsx
 - /src/features/insights/components/InsightCard.tsx
 - /src/features/insights/components/InsightsList.tsx

 Steps:
 1. InsightCard — styled card per insight:
   - Icon by type (warning ⚠, saving 💡, info ℹ) — using Lucide icons not emoji
   - Message text, generated date
 2. InsightsList — list of insight cards
   - Loading skeleton while generating
   - Empty state: "Upload transactions to get insights"
 3. InsightsPage:
   - "Generate Insights" button → triggers /api/insights
   - Caches results per month (TanStack Query)
   - Shows streaming/loading state during generation
 4. Handle edge cases:
   - Not enough data → helpful message
   - API error → error boundary with retry

 Verification: Generate insights from categorized transactions, see cards rendered.

 ---
 Task 11: UX Polish & Error Handling

 Goal: Production-grade UX: error boundaries, loading states, empty states, performance.

 Steps:
 1. Create /src/components/ErrorBoundary.tsx — generic + per-feature error boundaries
 2. Create /src/components/LoadingSkeleton.tsx — skeleton screens for each page
 3. Create /src/components/EmptyState.tsx — reusable empty state component
 4. Add loading states to all pages (TanStack Query isLoading / isPending)
 5. Add toast notifications (shadcn Toast) for:
   - Upload success/failure
   - Category update confirmation
   - Budget saved
   - AI errors
 6. Performance optimizations:
   - React.lazy() for chart components (Recharts is heavy)
   - useMemo / useCallback for derived data computations
   - Virtualized transaction table (if not done in Task 7)
 7. Responsive design pass — mobile-friendly layouts
 8. Accessibility pass — keyboard navigation, ARIA labels, focus management

 Verification: Test all error states (disconnect network, invalid data), check mobile layout, run Lighthouse.

 ---
 Task 12: Unit & Integration Tests

 Goal: Comprehensive test coverage for business logic and component behavior.

 Setup:
 - Jest + React Testing Library + jest-dom
 - Mock Supabase client
 - Mock fetch for API routes

 Test areas:
 1. CSV Parsing (/src/lib/parsers/csv.test.ts):
   - Valid CSV → correct Transaction objects
   - Malformed CSV → validation errors
   - Missing columns → helpful error messages
   - Edge cases: empty file, single row, special characters
 2. Zod Schemas (/src/lib/validators/*.test.ts):
   - Valid data passes, invalid data fails with correct errors
   - Edge cases for each field
 3. AI Service Layer (/src/lib/ai/*.test.ts):
   - Rule-based categorizer correctness
   - API response parsing + validation
   - Retry logic behavior
   - Error handling for malformed API responses
 4. Component Tests:
   - FileDropzone — file selection, drag events, file type validation
   - TransactionTable — renders data, sorting, filtering
   - CategoryEditor — optimistic update behavior
   - BudgetProgressCard — correct visual states (under/near/over budget)
   - InsightCard — renders different insight types
   - LoginPage — form validation, submit behavior
 5. Integration Tests:
   - Upload flow: file → parse → preview → confirm
   - Category edit: click → change → optimistic update → sync
   - Budget: set budget → see progress update
   - Auth flow: login → redirect to dashboard

 Verification: npm test passes, coverage report shows key paths covered.

 ---
 Task 13: E2E Tests (Playwright) — Triggered separately on confirmation

 Goal: Test critical user journeys end-to-end.

 Setup:
 - Playwright configured with test Supabase instance (or mocked backend)
 - Sample CSV fixtures

 Test flows:
 1. Sign up → Upload → Categorize → Dashboard
   - New user registers, uploads CSV, sees categories assigned, views dashboard
 2. Edit category → Verify update
   - Change a transaction's category, verify it persists on reload
 3. Set budget → Check progress
   - Create budget, verify progress bar reflects actual spending
 4. Generate insights
   - Trigger insight generation, verify cards appear
 5. Error scenarios
   - Upload invalid file → see error message
   - Network failure during categorization → see retry option

 Verification: npx playwright test passes all flows.

 ---
 Summary of Task Dependencies

 Task 1 (Setup)
   → Task 2 (Types/Schemas)
     → Task 3 (Supabase)
       → Task 4 (Auth)
         → Task 5 (Upload/Parse)
           → Task 6 (AI Layer)
             → Task 7 (Transactions)
               → Task 8 (Dashboard)
                 → Task 9 (Budget)
                   → Task 10 (Insights)
                     → Task 11 (Polish)
                       → Task 12 (Unit/Integration Tests)
                         → Task 13 (E2E Tests) ← only on confirmation