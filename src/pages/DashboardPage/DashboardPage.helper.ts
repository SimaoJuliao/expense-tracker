import { useEffect, useMemo, useState } from 'react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from '../../i18n';
import { getMonthName, getDaysInMonth, getCurrentMonthYear } from '../../utils';
import { fetchIncomeTotalForRange } from '../../services/incomeService';
import { CHART_COLORS } from '../../constants/colors';

export const useDashboardPage = () => {
  const { expenses, loading: expLoading, filters, fetchExpenses } = useExpenseStore();
  const { fetchCategories } = useCategoryStore();
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
      const { month: m, year: y } = getCurrentMonthYear();
      const store = useExpenseStore.getState();
      const alreadyLoaded = store.filters.month === m && store.filters.year === y && store.filters.categoryId === null;

      useExpenseStore.getState().setFilters({ month: m, year: y, categoryId: null, search: '' });

      const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
      const endDate   = `${y}-${String(m).padStart(2, '0')}-${String(getDaysInMonth(y, m)).padStart(2, '0')}`;

      setIncomeLoading(true);
      const [, incomeTotal] = await Promise.all([
        alreadyLoaded ? fetchCategories() : Promise.all([fetchCategories(), fetchExpenses()]),
        fetchIncomeTotalForRange(startDate, endDate),
      ]);
      setTotalIncome(incomeTotal);
      setIncomeLoading(false);
    };
    init();
  }, [fetchCategories, fetchExpenses]);

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
      else { map.set(cat.id, { name: cat.name, icon: cat.icon ?? '', color: cat.color ?? CHART_COLORS[map.size % CHART_COLORS.length], total: Number(e.amount) }); }
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
