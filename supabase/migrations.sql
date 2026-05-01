-- ============================================================
-- Expense Tracker - Supabase Schema & RLS Migrations
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ---- CATEGORIES ----

CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  icon       text,
  color      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- ---- EXPENSES ----

CREATE TABLE IF NOT EXISTS public.expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      numeric(12, 2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  date        date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ---- INDEXES (performance) ----

CREATE INDEX IF NOT EXISTS expenses_user_id_date_idx ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx  ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx    ON public.categories(user_id);

-- ---- RECURRING EXPENSES ----

CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description  text NOT NULL,
  amount       numeric(12, 2) NOT NULL CHECK (amount > 0),
  category_id  uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  day_of_month integer NOT NULL CHECK (day_of_month BETWEEN 1 AND 28),
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own recurring expenses"
  ON public.recurring_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring expenses"
  ON public.recurring_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring expenses"
  ON public.recurring_expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring expenses"
  ON public.recurring_expenses FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS recurring_expenses_user_id_idx ON public.recurring_expenses(user_id);

-- ---- INCOME CATEGORIES ----

CREATE TABLE IF NOT EXISTS public.income_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  icon       text,
  color      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.income_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own income categories"
  ON public.income_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income categories"
  ON public.income_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income categories"
  ON public.income_categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income categories"
  ON public.income_categories FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS income_categories_user_id_idx ON public.income_categories(user_id);

-- ---- INCOMES ----

CREATE TABLE IF NOT EXISTS public.incomes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount             numeric(12, 2) NOT NULL CHECK (amount > 0),
  description        text NOT NULL,
  income_category_id uuid NOT NULL REFERENCES public.income_categories(id) ON DELETE RESTRICT,
  date               date NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own incomes"
  ON public.incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes"
  ON public.incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes"
  ON public.incomes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes"
  ON public.incomes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS incomes_user_id_date_idx ON public.incomes(user_id, date DESC);
CREATE INDEX IF NOT EXISTS incomes_category_id_idx  ON public.incomes(income_category_id);

-- ---- RECURRING INCOMES ----

CREATE TABLE IF NOT EXISTS public.recurring_incomes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description        text NOT NULL,
  amount             numeric(12, 2) NOT NULL CHECK (amount > 0),
  income_category_id uuid NOT NULL REFERENCES public.income_categories(id) ON DELETE RESTRICT,
  day_of_month       integer NOT NULL CHECK (day_of_month BETWEEN 1 AND 28),
  active             boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own recurring incomes"
  ON public.recurring_incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring incomes"
  ON public.recurring_incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring incomes"
  ON public.recurring_incomes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring incomes"
  ON public.recurring_incomes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS recurring_incomes_user_id_idx ON public.recurring_incomes(user_id);
