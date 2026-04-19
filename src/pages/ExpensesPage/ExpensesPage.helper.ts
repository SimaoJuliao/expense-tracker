import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useRecurringExpenseStore } from '../../store/useRecurringExpenseStore';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../i18n';
import { getMonthName, getDaysInMonth, exportToCSV } from '../../utils';
import type { Expense } from '../../types';

export const YEARS  = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export const useExpensesPage = () => {
  const { expenses, loading, filters, fetchExpenses, deleteExpense, setFilters } = useExpenseStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { recurring, fetchRecurring } = useRecurringExpenseStore();
  const { t } = useTranslation();

  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [applying, setApplying]       = useState(false);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchExpenses();   }, [filters, fetchExpenses]);
  useEffect(() => { fetchRecurring();  }, [fetchRecurring]);

  const filtered = useMemo(() => {
    if (!filters.search) return expenses;
    const q = filters.search.toLowerCase();
    return expenses.filter(
      (e) => e.description.toLowerCase().includes(q) || e.category?.name.toLowerCase().includes(q)
    );
  }, [expenses, filters.search]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount), 0),
    [filtered]
  );

  const pendingRecurring = useMemo(() => {
    if (filters.month === 0) return [];
    return recurring.filter((r) => {
      if (!r.active) return false;
      return !expenses.some(
        (e) =>
          e.description === r.description &&
          e.category_id === r.category_id &&
          Number(e.amount) === Number(r.amount) &&
          e.date.startsWith(`${filters.year}-${String(filters.month).padStart(2, '0')}`)
      );
    });
  }, [recurring, expenses, filters.month, filters.year]);

  const monthName = filters.month === 0 ? t('expenses.allMonths') : getMonthName(filters.month);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteId);
      toast.success(t('expenses.deleteSuccess'));
    } catch {
      toast.error(t('expenses.deleteFailed'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) { toast.error(t('settings.exportNoData')); return; }
    const data = filtered.map((e) => ({
      date: e.date,
      description: e.description,
      category: e.category?.name ?? 'Unknown',
      amount: Number(e.amount),
    }));
    const filename = filters.month === 0
      ? `expenses-${filters.year}.csv`
      : `expenses-${filters.year}-${String(filters.month).padStart(2, '0')}.csv`;
    exportToCSV(data, filename);
    toast.success(t('settings.exportSuccess', { count: data.length, filename }));
  };

  const handleApplyRecurring = async () => {
    if (pendingRecurring.length === 0) return;
    setApplying(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const rows = pendingRecurring.map((r) => {
        const day = Math.min(r.day_of_month, getDaysInMonth(filters.year, filters.month));
        return {
          description: r.description,
          amount: r.amount,
          category_id: r.category_id,
          date: `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          user_id: userData.user!.id,
        };
      });
      const { error } = await supabase.from('expenses').insert(rows);
      if (error) throw error;
      await fetchExpenses();
      toast.success(t('recurring.applySuccess', { count: pendingRecurring.length }));
    } catch {
      toast.error(t('recurring.applyFailed'));
    } finally {
      setApplying(false);
    }
  };

  return {
    filtered, loading, filters, setFilters, categories,
    deleteId, setDeleteId, deleting,
    editExpense, setEditExpense,
    addModalOpen, setAddModalOpen,
    applying,
    pendingRecurring,
    monthName, total,
    handleDelete, handleExport, handleApplyRecurring,
    t,
  };
};
