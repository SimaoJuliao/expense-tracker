import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { supabase } from '../../lib/supabase';
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

  useEffect(() => { fetchIncomes(); }, [filters.month, filters.year, filters.categoryId, fetchIncomes]);
  useEffect(() => { fetchRecurring(); }, [fetchRecurring]);

  const filtered = useMemo(() => {
    if (!filters.search) return incomes;
    const q = filters.search.toLowerCase();
    return incomes.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.income_category?.name.toLowerCase().includes(q)
    );
  }, [incomes, filters.search]);

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
          date: `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          user_id: user.id,
        };
      });
      const { error } = await supabase.from('incomes').insert(rows);
      if (error) throw error;
      await fetchIncomes();
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
