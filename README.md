# Expense Tracker

A full-stack monthly expense tracking web application built with React, TypeScript, Vite, Supabase, Tailwind CSS, and Zustand.

## Features

- **Authentication** — Email/password login and registration via Supabase Auth
- **Dashboard** — Monthly overview with summary cards, daily spending bar chart, category pie chart, and recent transactions
- **Expenses** — Full CRUD with month/year/category/search filters, inline editing via modal
- **Categories** — Manage custom categories with emoji icons and colour pickers; default categories seeded on first login
- **Settings** — Account info, category management link, CSV export for current month
- **Accessibility** — WCAG 2.1 AA compliant: semantic HTML, ARIA, keyboard navigation, focus trapping in modals, screen-reader live regions
- **Responsive** — Mobile-first design with collapsible sidebar

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript (strict) |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| State | Zustand 5 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Charts | Recharts |
| Notifications | react-hot-toast |

## Getting Started

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase dashboard, navigate to **SQL Editor**.
3. Paste the entire contents of `supabase/migrations.sql` and click **Run**.
   This creates the `categories` and `expenses` tables with Row Level Security policies.

### 2. Configure environment variables

Copy `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local .env.local   # already exists — just edit it
```

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are found in **Project Settings → API** in the Supabase dashboard.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Project Structure

```
src/
  components/     # Reusable UI components (Modal, ExpenseForm, ConfirmDialog, …)
  pages/          # Route-level page components
  store/          # Zustand stores (useAuthStore, useExpenseStore, useCategoryStore)
  lib/            # Supabase client setup
  types/          # TypeScript interfaces
  utils/          # Helper functions (formatCurrency, formatDate, exportToCSV, …)
  index.css       # Tailwind directives + sr-only utility
  App.tsx         # Router setup + Toaster
  main.tsx        # React DOM entry point

supabase/
  migrations.sql  # Full schema + RLS policies — run in Supabase SQL Editor
```

## Accessibility (WCAG 2.1 AA)

This application has been built to meet WCAG 2.1 Level AA. Key implementations:

- **Skip link** — first focusable element on every page skips to `#main-content`
- **Semantic HTML** — `<main>`, `<nav>`, `<header>`, `<section>`, `<table>` with `<th scope>`, `<ul>` for lists
- **ARIA** — `aria-label`, `aria-live`, `aria-expanded`, `aria-current="page"`, `role="dialog"` with `aria-modal`, `aria-labelledby`, `aria-describedby`
- **Focus trapping** — modals trap focus and restore it on close; Escape closes modals
- **Visible focus indicators** — custom `:focus-visible` ring on all interactive elements
- **Form labels** — every input has an associated `<label>` via `htmlFor`/`id`; errors use `role="alert"` and `aria-describedby`
- **Charts** — all Recharts visualisations have a collapsible `<table>` text alternative
- **Colour contrast** — all text meets 4.5:1 ratio; colour is never the sole indicator of state
- **Screen reader announcements** — toast container uses `aria-live="polite"`

### Recommended testing tools

| Tool | Purpose |
|------|---------|
| [axe DevTools](https://www.deque.com/axe/devtools/) browser extension | Automated WCAG audit |
| [NVDA](https://www.nvaccess.org/) (Windows) / VoiceOver (macOS/iOS) | Manual screen reader testing |
| Chrome Lighthouse (Accessibility tab) | Quick automated score |
| [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) | Manual contrast verification |

## Database Schema

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, `gen_random_uuid()` |
| user_id | uuid | FK → `auth.users` |
| name | text | Required |
| icon | text | Optional emoji |
| color | text | Optional hex colour |
| created_at | timestamptz | Default `now()` |

### `expenses`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, `gen_random_uuid()` |
| user_id | uuid | FK → `auth.users` |
| amount | numeric(12,2) | Required, must be > 0 |
| description | text | Required |
| category_id | uuid | FK → `categories` |
| date | date | Required |
| created_at | timestamptz | Default `now()` |

RLS policies ensure each user can only access their own rows.

## Currency & Locale

- All amounts displayed in **EUR (€)** with 2 decimal places using `de-DE` locale formatting
- Dates displayed in **DD/MM/YYYY** (European) format
