import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from '../../i18n';
import { getMonthName, getDaysInMonth } from '../../utils';

export type ViewMode = 'monthly' | 'yearly';

export interface MonthlyData {
  key: string;
  label: string;
  month: number;
  year: number;
  expenses: number;
  income: number;
  net: number;
}

export interface YearlyData {
  key: string;
  label: string;
  year: number;
  expenses: number;
  income: number;
  net: number;
}

export const useAnalysisPage = () => {
  const [viewMode, setViewMode]     = useState<ViewMode>('monthly');
  const [monthCount, setMonthCount] = useState(6);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyData, setYearlyData]   = useState<YearlyData[]>([]);
  const [loading, setLoading]       = useState(true);
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  const chartText    = theme === 'dark' ? 'hsl(215 16% 57%)' : 'hsl(220 9% 46%)';
  const chartGrid    = theme === 'dark' ? 'hsl(224 22% 18%)' : 'hsl(220 13% 87%)';
  const tooltipBg    = theme === 'dark' ? 'hsl(224 22% 13%)' : '#ffffff';
  const primaryColor = theme === 'dark' ? 'hsl(160, 84%, 45%)' : 'hsl(160, 84%, 39%)';
  const incomeColor  = theme === 'dark' ? 'hsl(160, 84%, 45%)' : 'hsl(160, 84%, 39%)';
  const expenseColor = theme === 'dark' ? 'hsl(0, 84%, 60%)' : 'hsl(0, 72%, 51%)';

  // ── Monthly load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'monthly') return;
    const load = async () => {
      setLoading(true);
      const now    = new Date();
      const startD = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);
      const startDate = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-01`;
      const endDate   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
      ).padStart(2, '0')}`;

      const [expResult, incResult] = await Promise.all([
        supabase.from('expenses').select('date, amount').gte('date', startDate).lte('date', endDate),
        supabase.from('incomes').select('date, amount').gte('date', startDate).lte('date', endDate),
      ]);

      const byMonthExp = new Map<string, number>();
      for (const e of expResult.data ?? []) {
        const [y, m] = e.date.split('-');
        byMonthExp.set(`${y}-${m}`, (byMonthExp.get(`${y}-${m}`) ?? 0) + Number(e.amount));
      }
      const byMonthInc = new Map<string, number>();
      for (const e of incResult.data ?? []) {
        const [y, m] = e.date.split('-');
        byMonthInc.set(`${y}-${m}`, (byMonthInc.get(`${y}-${m}`) ?? 0) + Number(e.amount));
      }

      const result: MonthlyData[] = [];
      for (let i = monthCount - 1; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y   = d.getFullYear();
        const m   = d.getMonth() + 1;
        const key = `${y}-${String(m).padStart(2, '0')}`;
        const exp = Number((byMonthExp.get(key) ?? 0).toFixed(2));
        const inc = Number((byMonthInc.get(key) ?? 0).toFixed(2));
        result.push({
          key,
          label: `${getMonthName(m).slice(0, 3)} '${String(y).slice(2)}`,
          month: m,
          year: y,
          expenses: exp,
          income: inc,
          net: Number((inc - exp).toFixed(2)),
        });
      }
      setMonthlyData(result);
      setLoading(false);
    };
    load();
  }, [viewMode, monthCount]);

  // ── Yearly load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'yearly') return;
    const load = async () => {
      setLoading(true);
      const [expResult, incResult] = await Promise.all([
        supabase.from('expenses').select('date, amount'),
        supabase.from('incomes').select('date, amount'),
      ]);

      const byYearExp = new Map<number, number>();
      for (const e of expResult.data ?? []) {
        const y = Number(e.date.split('-')[0]);
        byYearExp.set(y, (byYearExp.get(y) ?? 0) + Number(e.amount));
      }
      const byYearInc = new Map<number, number>();
      for (const e of incResult.data ?? []) {
        const y = Number(e.date.split('-')[0]);
        byYearInc.set(y, (byYearInc.get(y) ?? 0) + Number(e.amount));
      }

      const allYears = Array.from(new Set([...byYearExp.keys(), ...byYearInc.keys()])).sort();
      const result: YearlyData[] = allYears.map((y) => {
        const exp = Number((byYearExp.get(y) ?? 0).toFixed(2));
        const inc = Number((byYearInc.get(y) ?? 0).toFixed(2));
        return { key: String(y), label: String(y), year: y, expenses: exp, income: inc, net: Number((inc - exp).toFixed(2)) };
      });

      setYearlyData(result);
      setLoading(false);
    };
    load();
  }, [viewMode]);

  // ── Monthly derived ───────────────────────────────────────────────────────────
  const monthlyExpTotal = useMemo(() => monthlyData.reduce((s, d) => s + d.expenses, 0), [monthlyData]);
  const monthlyIncTotal = useMemo(() => monthlyData.reduce((s, d) => s + d.income, 0), [monthlyData]);
  const monthlyExpAvg   = monthlyData.length > 0 ? monthlyExpTotal / monthlyData.length : 0;
  const monthlyIncAvg   = monthlyData.length > 0 ? monthlyIncTotal / monthlyData.length : 0;

  const bestMonth  = useMemo(
    () => monthlyData.filter((d) => d.expenses > 0).reduce<MonthlyData | null>((b, d) => (!b || d.expenses < b.expenses ? d : b), null),
    [monthlyData]
  );
  const worstMonth = useMemo(
    () => monthlyData.reduce<MonthlyData | null>((w, d) => (!w || d.expenses > w.expenses ? d : w), null),
    [monthlyData]
  );

  // ── Yearly derived ────────────────────────────────────────────────────────────
  const yearlyExpTotal = useMemo(() => yearlyData.reduce((s, d) => s + d.expenses, 0), [yearlyData]);
  const yearlyIncTotal = useMemo(() => yearlyData.reduce((s, d) => s + d.income, 0), [yearlyData]);
  const yearlyExpAvg   = yearlyData.length > 0 ? yearlyExpTotal / yearlyData.length : 0;

  const bestYear  = useMemo(
    () => yearlyData.filter((d) => d.expenses > 0).reduce<YearlyData | null>((b, d) => (!b || d.expenses < b.expenses ? d : b), null),
    [yearlyData]
  );
  const worstYear = useMemo(
    () => yearlyData.reduce<YearlyData | null>((w, d) => (!w || d.expenses > w.expenses ? d : w), null),
    [yearlyData]
  );

  const hasMonthlyData = monthlyData.some((d) => d.expenses > 0 || d.income > 0);
  const hasYearlyData  = yearlyData.some((d) => d.expenses > 0 || d.income > 0);

  return {
    viewMode, setViewMode,
    monthCount, setMonthCount,
    monthlyData, yearlyData,
    loading,
    // monthly
    monthlyExpTotal, monthlyIncTotal, monthlyExpAvg, monthlyIncAvg,
    bestMonth, worstMonth, hasMonthlyData,
    // yearly
    yearlyExpTotal, yearlyIncTotal, yearlyExpAvg,
    bestYear, worstYear, hasYearlyData,
    // chart
    chartText, chartGrid, tooltipBg, primaryColor, incomeColor, expenseColor,
    t,
  };
};
