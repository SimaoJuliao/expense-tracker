-- ============================================================
-- One-off cleanup: remove duplicate seeded categories and add the
-- UNIQUE guards so seeding can never duplicate again.
--
-- Safe for BOTH environments:
--   * works whether or not the group tables (category_splits) exist yet
--   * re-points expenses/incomes instead of deleting them (no data loss)
--   * takes a backup table first
--   * wrapped in a transaction (rolls back fully on any error)
--
-- RUN ORDER for a release:
--   1) (recommended) run the PREVIEW block below first — read-only
--   2) run this whole script
--   3) THEN run migrations.sql (creates group tables; the UNIQUE indexes
--      become no-ops because they already exist)
--   4) then deploy the frontend
-- ============================================================

-- ------------------------------------------------------------
-- PREVIEW (read-only) — run this on its own FIRST to see the impact.
-- Nothing here changes data.
-- ------------------------------------------------------------
-- SELECT 'expense category' AS kind, name, count(*) AS copies, count(*) - 1 AS will_remove
-- FROM public.categories GROUP BY user_id, name HAVING count(*) > 1
-- UNION ALL
-- SELECT 'income category', name, count(*), count(*) - 1
-- FROM public.income_categories GROUP BY user_id, name HAVING count(*) > 1
-- ORDER BY 1, 2;


BEGIN;

-- ---- 0. Backups (drop-and-recreate so it's re-runnable) ----
DROP TABLE IF EXISTS backup_categories;
DROP TABLE IF EXISTS backup_income_categories;
CREATE TABLE backup_categories        AS SELECT * FROM public.categories;
CREATE TABLE backup_income_categories AS SELECT * FROM public.income_categories;

-- ---- 1. Expense categories: keep the earliest row per (user_id, name) ----
CREATE TEMP TABLE cat_dupes ON COMMIT DROP AS
SELECT id AS dupe_id,
       first_value(id) OVER (PARTITION BY user_id, name ORDER BY created_at, id) AS keep_id
FROM public.categories;
DELETE FROM cat_dupes WHERE dupe_id = keep_id;

-- Re-point rows referencing a duplicate (these FKs are ON DELETE RESTRICT)
UPDATE public.expenses e
  SET category_id = d.keep_id FROM cat_dupes d WHERE e.category_id = d.dupe_id;
UPDATE public.recurring_expenses r
  SET category_id = d.keep_id FROM cat_dupes d WHERE r.category_id = d.dupe_id;

-- Only touch category_splits if that table exists (it doesn't in prod yet).
-- Splits on a duplicate are reconfigurable, so we drop them to avoid clashes.
DO $$
BEGIN
  IF to_regclass('public.category_splits') IS NOT NULL THEN
    DELETE FROM public.category_splits s USING cat_dupes d WHERE s.category_id = d.dupe_id;
  END IF;
END $$;

DELETE FROM public.categories c USING cat_dupes d WHERE c.id = d.dupe_id;

-- ---- 2. Income categories: same treatment ----
CREATE TEMP TABLE inc_dupes ON COMMIT DROP AS
SELECT id AS dupe_id,
       first_value(id) OVER (PARTITION BY user_id, name ORDER BY created_at, id) AS keep_id
FROM public.income_categories;
DELETE FROM inc_dupes WHERE dupe_id = keep_id;

UPDATE public.incomes i
  SET income_category_id = d.keep_id FROM inc_dupes d WHERE i.income_category_id = d.dupe_id;
UPDATE public.recurring_incomes r
  SET income_category_id = d.keep_id FROM inc_dupes d WHERE r.income_category_id = d.dupe_id;

DELETE FROM public.income_categories c USING inc_dupes d WHERE c.id = d.dupe_id;

COMMIT;

-- ---- 3. Add the UNIQUE guards (now that duplicates are gone) ----
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_id_name_key        ON public.categories(user_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS income_categories_user_id_name_key ON public.income_categories(user_id, name);

-- Once everything is verified, you may drop the backups:
--   DROP TABLE IF EXISTS backup_categories;
--   DROP TABLE IF EXISTS backup_income_categories;
