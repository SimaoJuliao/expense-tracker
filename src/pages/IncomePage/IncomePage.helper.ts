import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../i18n';
import { getMonthName, getDaysInMonth } from '../../utils';
import type { Income } from '../../types';

export const YEARS  = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export const useIncomePage = () => {
  const { incomes, loading, filters, fetchIncomes, deleteIncome, setFilters } = useIncomeStore();
  const { incomeCategories, fetchIncomeCategories, seedDefaultIncomeCategories } = useIncomeCategoryStore();
  const { recurring, fetchRecurring } = useRecurringIncomeStore();
  const { t } = useTranslation();

  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [editIncome, setEditIncome]     = useState<Income | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [applying, setApplying]         = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchIncomeCategories();
      await seedDefaultIncomeCategories();
    };
    init();
  }, [fetchIncomeCategories, seedDefaultIncomeCategories]);

  useEffect(() => { fetchIncomes();   }, [filters, fetchIncomes]);
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
    return recurring.filter((r) => {
      if (!r.active) return false;
      return !incomes.some(
        (e) =>
          e.description === r.description &&
          e.income_category_id === r.income_category_id &&
          Number(e.amount) === Number(r.amount) &&
          e.date.startsWith(`${filters.year}-${String(filters.month).padStart(2, '0')}`)
      );
    });
  }, [recurring, incomes, filters.month, filters.year]);

  const monthName = filters.month === 0 ? t('income.allMonths') : getMonthName(filters.month);

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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const rows = pendingRecurring.map((r) => {
        const day = Math.min(r.day_of_month, getDaysInMonth(filters.year, filters.month));
        return {
          description:        r.description,
          amount:             r.amount,
          income_category_id: r.income_category_id,
          date: `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          user_id: userData.user!.id,
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
    handleDelete, handleApplyRecurring,
    t,
  };
};
