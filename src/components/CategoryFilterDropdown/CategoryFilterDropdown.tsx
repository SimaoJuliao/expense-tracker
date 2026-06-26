import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '../../i18n';

/** Minimal shape shared by Category and IncomeCategory. */
interface CategoryOption {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface CategoryFilterDropdownProps {
  id?: string;
  categories: CategoryOption[];
  /** Category ids that are hidden. Empty = all shown. */
  excludedIds: string[];
  onToggle: (id: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

/**
 * Accessible multi-select dropdown for filtering an expense/income list by
 * category. Every category is checked (shown) by default; unchecking one adds
 * it to the excluded set.
 *
 * Design notes: each row's checkbox adopts that category's own colour, and an
 * excluded (hidden) category is rendered struck-through and dimmed so the
 * on/off state reads instantly. Built on native checkboxes + a disclosure
 * button, so it stays keyboard- and screen-reader-friendly with no extra deps.
 */
export const CategoryFilterDropdown = ({
  id, categories, excludedIds, onToggle, onShowAll, onHideAll,
}: CategoryFilterDropdownProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const total = categories.length;
  // Count only exclusions that still match an existing category, so a stale id
  // (a since-deleted category left in the persisted set) doesn't show a false
  // "filtering" state or an off-by-N / negative count.
  const idSet = new Set(categories.map((c) => c.id));
  const validExcluded = excludedIds.reduce((n, id) => (idSet.has(id) ? n + 1 : n), 0);
  const selected = total - validExcluded;
  const isFiltering = validExcluded > 0;
  const label = isFiltering
    ? t('expenses.categoryFilterSelected', { selected, total })
    : t('expenses.allCategories');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm transition-colors',
          'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isFiltering ? 'border-primary/50' : 'border-input hover:border-muted-foreground/40'
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
              isFiltering ? 'bg-primary' : 'bg-muted-foreground/40'
            )}
          />
          <span className="line-clamp-1 text-left">{label}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="group"
          aria-label={t('expenses.categoryFilterLabel')}
          className={cn(
            'absolute inset-x-0 z-50 mt-2 origin-top rounded-xl border border-border p-1.5',
            'bg-popover/95 text-popover-foreground shadow-xl shadow-black/5 backdrop-blur-sm dark:shadow-black/40',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150'
          )}
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide tabular-nums text-muted-foreground">
              {t('expenses.categoryFilterSelected', { selected, total })}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={onShowAll}
                className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {t('expenses.categoryFilterSelectAll')}
              </button>
              <button
                type="button"
                onClick={onHideAll}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t('expenses.categoryFilterClearAll')}
              </button>
            </div>
          </div>

          <div className="mx-2 my-1 h-px bg-border" />

          <ul className="max-h-64 space-y-0.5 overflow-auto pr-0.5">
            {categories.map((c) => {
              const checked = !excludedIds.includes(c.id);
              const color = c.color ?? 'hsl(var(--primary))';
              return (
                <li key={c.id}>
                  <label className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(c.id)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      style={checked ? { backgroundColor: color, borderColor: color } : undefined}
                      className={cn(
                        'relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-all',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-popover',
                        !checked && 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                      )}
                    >
                      <Check
                        className={cn('h-3 w-3 text-white transition-opacity', checked ? 'opacity-100' : 'opacity-0')}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>
                    {c.icon && (
                      <span className="text-base leading-none shrink-0" aria-hidden="true">{c.icon}</span>
                    )}
                    <span
                      className={cn(
                        'line-clamp-1 text-sm transition-colors',
                        checked
                          ? 'text-foreground'
                          : 'text-muted-foreground line-through decoration-muted-foreground/40'
                      )}
                    >
                      {c.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
