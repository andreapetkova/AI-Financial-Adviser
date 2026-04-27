# 💰 AI Financial Assistant (Flagship SaaS Project)

## 🧠 Concept

An AI-powered financial assistant that analyzes bank statements, categorizes expenses, and provides actionable insights and budgeting recommendations.

---

## 🎯 Goal

Build a production-grade SaaS frontend that demonstrates:

- Senior-level frontend architecture
- AI-integrated product thinking
- Data-heavy UI and UX
- Real-world usability

Targeted at: **Remote.com** senior frontend engineering roles.

---

## 🚀 Core Features

### 1. Upload & Parsing

- Upload bank statement (CSV/PDF)
- Parse transactions into structured data
- Runtime validation of parsed data with Zod
- Graceful handling of malformed or unexpected input

### 2. AI Categorization

- Automatically categorize transactions (food, rent, subscriptions, etc.)
- Handle ambiguous entries with confidence scoring
- Allow manual correction (human-in-the-loop)
- Isolated AI service layer — no AI logic inside components

### 3. Dashboard

- Spending breakdown (charts)
- Category distribution
- Monthly comparisons

### 4. AI Insights (KEY FEATURE)

- "You spent 30% more on X this month"
- "Potential savings opportunities"
- "Subscription increases detected"

### 5. Budgeting System

- Set monthly budgets per category
- Track actual vs planned spending
- Visual feedback (progress bars, alerts)

---

## 🧩 UX Challenges (Important)

- Handling incorrect AI predictions gracefully
- Editable categories with optimistic UI updates
- Loading + streaming states as first-class UI concerns
- Partial results handling
- Error boundaries for AI and parsing failures

---

## 🧱 Tech Stack

### Core

- **Vite** — build tool (fast, zero-magic, explicit)
- **React 18** — UI library
- **TypeScript** — strict mode on from day one

### Routing

- **React Router v6**

### Data & Server State

- **TanStack Query** — server state, caching, background refetch

### Client State

- **React Context** — for lightweight shared state
- **Zustand** — only if cross-cutting state becomes genuinely complex

### UI

- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible, unstyled primitives owned in the codebase
- **Recharts** — data visualisation (spending charts, category breakdown)

### Data Validation

- **Zod** — runtime validation for CSV parsing and AI API responses

### AI Integration

- **Claude API** (Anthropic) — categorization + insight generation
- Clean, isolated service layer (`/lib/ai`) — all prompt logic, parsing, retry, and error handling lives here, not in components

### Testing

- **Jest** — unit tests
- **React Testing Library** — component tests
- **Playwright** — E2E tests

### Deployment

- **Vercel**

---

## 🤖 AI Integration Strategy

### Categorization

- Input: transaction description + amount
- Output: category + confidence score
- Hybrid approach: rules/regex for obvious categories, Claude API only for ambiguous ones (reduces cost and latency)

### Insight Generation

- Input: full categorized transaction dataset
- Output: human-readable financial insights

### Human-in-the-loop

- User can edit any AI-assigned category
- Corrections feed back into re-processing where relevant

### AI Service Layer (`/lib/ai`)

- All prompt construction, API calls, response parsing, retry logic, and error handling in one place
- Components never call the AI API directly
- Enables easy model-swapping or mock responses in tests

---

## 🧪 Testing Strategy

- Unit tests for CSV parsing logic and Zod schemas (highest failure risk)
- Unit tests for AI prompt construction and response parsing
- Component tests for key UI states: loading, error, empty, populated
- E2E tests (Playwright) for critical user flows: upload → categorize → view dashboard

---

## ⚡ Performance Considerations

- Lazy loading for chart components (heavy bundles)
- Memoization (`useMemo`, `useCallback`) for expensive derived data
- TanStack Query caching to avoid redundant AI API calls
- Virtualized list for large transaction tables

---

## 📁 Folder Structure

```
/src
  /features
    /upload         # CSV upload, parsing, Zod validation
    /transactions   # Transaction list, category editing
    /dashboard      # Charts, spending breakdown
    /budget         # Budget configuration, progress tracking
    /insights       # AI-generated insights display
  /components       # Shared, reusable UI components
  /lib
    /ai             # Claude API service layer (prompts, parsing, retry)
    /validators     # Zod schemas
    /utils          # Pure utility functions
  /hooks            # Custom React hooks
  /context          # React Context providers
  /types            # Shared TypeScript domain models
  /tests            # Playwright E2E tests
```

---

## 📐 Core Domain Models (TypeScript)

Define these first — everything flows from them:

```ts
type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: Category | null;
  confidence: number | null;
  manuallyEdited: boolean;
};

type Category =
  | "food"
  | "rent"
  | "subscriptions"
  | "transport"
  | "utilities"
  | "entertainment"
  | "other";

type Budget = {
  category: Category;
  limit: number;
  spent: number;
};

type Insight = {
  id: string;
  message: string;
  type: "warning" | "saving" | "info";
};
```

---

## 🖥️ Pages

- `/upload` — CSV upload and parsing
- `/dashboard` — spending overview and charts
- `/transactions` — full transaction list with editable categories
- `/budget` — monthly budget configuration and tracking
- `/insights` — AI-generated financial insights

---

## 🏆 What Makes This Staff-Level

It is NOT the stack. It is:

- **Architecture** — clean feature-based structure, explicit decisions, isolated AI layer
- **Edge case handling** — malformed CSV, AI failures, empty states, error boundaries
- **Product thinking** — built as if shipping to real users, not just completing a task
- **Explainability** — every decision has a reason you can articulate in an interview

---

## 💡 Future Enhancements (Optional)

- Subscription detection and renewal alerts
- Multi-currency support
- Notifications for budget overruns
- Mobile optimisation
- Multi-user / team support

---

## 🧭 Positioning

This project demonstrates:

- SaaS product thinking aligned with Remote.com's domain (complex data, global users)
- AI-native frontend development with clean abstraction
- Real-world data handling and validation
- Senior engineering practices: testing, performance, error handling

---

## 🔥 Tagline

"Understand your money instantly — powered by AI."
