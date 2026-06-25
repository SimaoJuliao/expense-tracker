import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../i18n';
import { getMonthName, getDaysInMonth, exportToCSV } from '../../utils';
import type { Income } from '../../types';

export const YEARS  = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export const useIncomePage = () => {
  const { incomes, loading, filters, fetchIncomes, deleteIncome, setFilters } = useIncomeStore();
  const { incomeCategories, fetchIncomeCategories } = useIncomeCategoryStore();
  const { recurring, fetchRecurring } = useRecurringIncomeStore();
  const { t } = useTranslation();

  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [editIncome, setEditIncome]     = useState<Income | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [applying, setApplying]         = useState(false);

  useEffect(() => { fetchIncomeCategories(); }, [fetchIncomeCategories]);

  // Category exclusion is applied client-side, so we only refetch on month/year.
  useEffect(() => { fetchIncomes(); }, [filters.month, filters.year, fetchIncomes]);
  useEffect(() => { fetchRecurring(); }, [fetchRecurring]);

  const filtered = useMemo(() => {
    const excluded = new Set(filters.excludedCategoryIds);
    let result = excluded.size > 0
      ? incomes.filter((e) => !excluded.has(e.income_category_id))
      : incomes;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.income_category?.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [incomes, filters.search, filters.excludedCategoryIds]);

  const toggleCategoryFilter = (id: string) => {
    const excluded = filters.excludedCategoryIds;
    setFilters({
      excludedCategoryIds: excluded.includes(id)
        ? excluded.filter((x) => x !== id)
        : [...excluded, id],
    });
  };
  const showAllCategories = () => setFilters({ excludedCategoryIds: [] });
  const hideAllCategories = () => setFilters({ excludedCategoryIds: incomeCategories.map((c) => c.id) });

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount), 0),
    [filtered]
  );

  const pendingRecurring = useMemo(() => {
    if (filters.month === 0) return [];
    const monthPrefix = `${filters.year}-${String(filters.month).padStart(2, '0')}`;
    const applied = new Set(
      incomes
        .filter((i) => i.date.startsWith(monthPrefix))
        .map((i) => `${i.description}|${i.income_category_id}|${Number(i.amount)}`)
    );
    return recurring.filter(
      (r) => r.active && !applied.has(`${r.description}|${r.income_category_id}|${Number(r.amount)}`)
    );
  }, [recurring, incomes, filters.month, filters.year]);

  const monthName = filters.month === 0 ? t('income.allMonths') : getMonthName(filters.month);

  const handleExport = () => {
    if (filtered.length === 0) { toast.error(t('income.exportNoData')); return; }
    const data = filtered.map((i) => ({
      date: i.date,
      description: i.description,
      category: i.income_category?.name ?? 'Unknown',
      amount: Number(i.amount),
    }));
    const filename = filters.month === 0
      ? `income-${filters.year}.csv`
      : `income-${filters.year}-${String(filters.month).padStart(2, '0')}.csv`;
    exportToCSV(data, filename);
    toast.success(t('income.exportSuccess', { count: data.length, filename }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteIncome(deleteId);
      toast.success(t('income.deleteSuccess'));
    } catch {
      toast.error(t('income.deleteFailed'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleApplyRecurring = async () => {
    if (pendingRecurring.length === 0) return;
    setApplying(true);
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const rows = pendingRecurring.map((r) => {
        const day = Math.min(r.day_of_month, getDaysInMonth(filters.year, filters.month));
        return {
          description:        r.description,
          amount:             r.amount,
          income_category_id: r.income_category_id,
          member_id:          null,
          date: `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          user_id: user.id,
        };
      });
      await useIncomeStore.getState().bulkAddIncomes(rows);
      toast.success(t('recurringIncome.applySuccess', { count: pendingRecurring.length }));
    } catch {
      toast.error(t('recurringIncome.applyFailed'));
    } finally {
      setApplying(false);
    }
  };

  return {
    filtered, loading, filters, setFilters,
    incomeCategories,
    toggleCategoryFilter, showAllCategories, hideAllCategories,
    deleteId, setDeleteId, deleting,
    editIncome, setEditIncome,
    addModalOpen, setAddModalOpen,
    applying,
    pendingRecurring,
    monthName, total,
    handleDelete, handleExport, handleApplyRecurring,
    t,
  };
};
