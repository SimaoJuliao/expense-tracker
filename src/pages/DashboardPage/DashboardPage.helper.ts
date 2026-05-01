import { useEffect, useMemo, useState } from 'react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from '../../i18n';
import { getMonthName, getDaysInMonth } from '../../utils';
import { supabase } from '../../lib/supabase';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

export const useDashboardPage = () => {
  const { expenses, loading: expLoading, filters, fetchExpenses, resetFilters } = useExpenseStore();
  const { fetchCategories, seedDefaultCategories } = useCategoryStore();
  const { fetchIncomeCategories, seedDefaultIncomeCategories } = useIncomeCategoryStore();
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeLoading, setIncomeLoading] = useState(true);

  const loading = expLoading || incomeLoading;

  const chartText   = theme === 'dark' ? 'hsl(215 16% 57%)' : 'hsl(220 9% 46%)';
  const chartGrid   = theme === 'dark' ? 'hsl(224 22% 18%)' : 'hsl(220 13% 87%)';
  const tooltipBg   = theme === 'dark' ? 'hsl(224 22% 13%)' : '#ffffff';
  const primaryColor = theme === 'dark' ? 'hsl(160, 84%, 45%)' : 'hsl(160, 84%, 39%)';

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      await seedDefaultCategories();
      await fetchIncomeCategories();
      await seedDefaultIncomeCategories();
      useExpenseStore.getState().resetFilters();
      await fetchExpenses();
    };
    init();
  }, [fetchCategories, seedDefaultCategories, fetchIncomeCategories, seedDefaultIncomeCategories, fetchExpenses, resetFilters]);

  useEffect(() => {
    const fetchMonthIncome = async () => {
      setIncomeLoading(true);
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
      const endDate   = `${y}-${String(m).padStart(2, '0')}-${String(getDaysInMonth(y, m)).padStart(2, '0')}`;
      const { data } = await supabase
        .from('incomes')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate);
      setTotalIncome((data ?? []).reduce((sum, r) => sum + Number(r.amount), 0));
      setIncomeLoading(false);
    };
    fetchMonthIncome();
  }, []);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const netBalance   = totalIncome - totalSpent;
  const isSurplus    = netBalance >= 0;
  const savingsRate  = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : null;

  const daysInMonth = useMemo(() => {
    const today = new Date();
    return filters.month === today.getMonth() + 1 && filters.year === today.getFullYear()
      ? today.getDate()
      : new Date(filters.year, filters.month, 0).getDate();
  }, [filters.month, filters.year]);

  const avgDailySpend = daysInMonth > 0 ? totalSpent / daysInMonth : 0;

  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; icon: string; color: string; total: number }>();
    for (const e of expenses) {
      const cat = e.category;
      if (!cat) continue;
      const existing = map.get(cat.id);
      if (existing) { existing.total += Number(e.amount); }
      else { map.set(cat.id, { name: cat.name, icon: cat.icon ?? '', color: cat.color ?? COLORS[map.size % COLORS.length], total: Number(e.amount) }); }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const topCategory = byCategory[0];

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) { map.set(e.date, (map.get(e.date) ?? 0) + Number(e.amount)); }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date: date.split('-')[2], total: Number(total.toFixed(2)) }));
  }, [expenses]);

  const recentExpenses = useMemo(() => expenses.slice(0, 8), [expenses]);

  const monthName = getMonthName(filters.month);

  return {
    expenses, loading, filters,
    totalSpent, totalIncome, netBalance, isSurplus, savingsRate,
    avgDailySpend, topCategory,
    byCategory, byDay, recentExpenses,
    monthName,
    chartText, chartGrid, tooltipBg, primaryColor,
    t,
  };
};
