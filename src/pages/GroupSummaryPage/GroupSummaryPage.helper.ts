import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useGroupStore } from '../../store/useGroupStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../i18n';
import { getCurrentMonthYear, getDaysInMonth } from '../../utils';
import { fetchGroupSummaryData } from '../../services/groupService';
import type { Expense, Income } from '../../types';

export interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
  memberAmounts: Record<string, number>;
}

export const useGroupSummaryPage = () => {
  const { t } = useTranslation();
  const { members, splits, loading: groupLoading } = useGroupStore();
  const { categories, fetchCategories } = useCategoryStore();
  const user = useAuthStore((s) => s.user);

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear]   = useState(currentYear);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes]   = useState<Income[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const loadData = useCallback(async (m: number, y: number) => {
    setDataLoading(true);
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const endDate   = `${y}-${String(m).padStart(2, '0')}-${String(getDaysInMonth(y, m)).padStart(2, '0')}`;

    try {
      const { expenses: expData, incomes: incData } = await fetchGroupSummaryData(
        user?.id ?? '',
        startDate,
        endDate
      );
      setExpenses(expData);
      setIncomes(incData);
    } catch (err) {
      console.error('fetchGroupSummaryData error:', err);
      toast.error(t('common.error'));
      setExpenses([]);
      setIncomes([]);
    } finally {
      setDataLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    loadData(month, year);
  }, [month, year, loadData]);

  const splitsMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const s of splits) {
      if (!map[s.category_id]) map[s.category_id] = {};
      map[s.category_id][s.member_id] = s.percentage;
    }
    return map;
  }, [splits]);

  const { memberExpenses, memberIncomes, categoryRows, grandExpenses, grandIncome } = useMemo(() => {
    const expTotals: Record<string, number> = {};
    const incTotals: Record<string, number> = {};
    for (const m of members) { expTotals[m.id] = 0; incTotals[m.id] = 0; }

    // ── expense splits ──
    const rows: CategoryRow[] = [];
    let grandExp = 0;

    for (const cat of categories) {
      const catTotal = expenses
        .filter((e) => e.category_id === cat.id)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      if (catTotal === 0) continue;

      grandExp += catTotal;
      const memberAmounts: Record<string, number> = {};

      for (const m of members) {
        const pct = splitsMap[cat.id]?.[m.id] ?? (members.length > 0 ? 100 / members.length : 0);
        const share = (catTotal * pct) / 100;
        memberAmounts[m.id] = share;
        expTotals[m.id] = (expTotals[m.id] ?? 0) + share;
      }

      rows.push({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, total: catTotal, memberAmounts });
    }

    // ── income per member ──
    let grandInc = 0;
    for (const inc of incomes) {
      const amount = Number(inc.amount);
      grandInc += amount;
      if (inc.member_id && incTotals[inc.member_id] !== undefined) {
        incTotals[inc.member_id] += amount;
      }
    }

    return {
      memberExpenses: expTotals,
      memberIncomes:  incTotals,
      categoryRows:   rows,
      grandExpenses:  grandExp,
      grandIncome:    grandInc,
    };
  }, [expenses, incomes, categories, members, splitsMap]);

  // unassigned income = income with no member_id or member no longer exists
  const unassignedIncome = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.id));
    return incomes
      .filter((i) => !i.member_id || !memberIds.has(i.member_id))
      .reduce((sum, i) => sum + Number(i.amount), 0);
  }, [incomes, members]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years  = Array.from({ length: 5 },  (_, i) => currentYear - 2 + i);

  return {
    t, members,
    memberExpenses, memberIncomes, unassignedIncome,
    categoryRows, grandExpenses, grandIncome,
    month, year, setMonth, setYear,
    months, years,
    loading: groupLoading || dataLoading,
  };
};
