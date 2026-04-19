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
  total: number;
}

export interface YearlyData {
  key: string;
  label: string;
  year: number;
  total: number;
}

export const useAnalysisPage = () => {
  const [viewMode, setViewMode]   = useState<ViewMode>('monthly');
  const [monthCount, setMonthCount] = useState(6);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [yearlyData, setYearlyData]   = useState<YearlyData[]>([]);
  const [loading, setLoading]     = useState(true);
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  const chartText   = theme === 'dark' ? 'hsl(215 16% 57%)' : 'hsl(220 9% 46%)';
  const chartGrid   = theme === 'dark' ? 'hsl(224 22% 18%)' : 'hsl(220 13% 87%)';
  const tooltipBg   = theme === 'dark' ? 'hsl(224 22% 13%)' : '#ffffff';
  const primaryColor = theme === 'dark' ? 'hsl(160, 84%, 45%)' : 'hsl(160, 84%, 39%)';

  // ── Monthly load ────────────────────────────────────────────────────────────
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

      const { data: rows } = await supabase
        .from('expenses')
        .select('date, amount')
        .gte('date', startDate)
        .lte('date', endDate);

      const byMonth = new Map<string, number>();
      for (const e of rows ?? []) {
        const [y, m] = e.date.split('-');
        byMonth.set(`${y}-${m}`, (byMonth.get(`${y}-${m}`) ?? 0) + Number(e.amount));
      }

      const result: MonthlyData[] = [];
      for (let i = monthCount - 1; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y   = d.getFullYear();
        const m   = d.getMonth() + 1;
        const key = `${y}-${String(m).padStart(2, '0')}`;
        result.push({
          key,
          label: `${getMonthName(m).slice(0, 3)} '${String(y).slice(2)}`,
          month: m,
          year: y,
          total: Number((byMonth.get(key) ?? 0).toFixed(2)),
        });
      }
      setMonthlyData(result);
      setLoading(false);
    };
    load();
  }, [viewMode, monthCount]);

  // ── Yearly load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'yearly') return;
    const load = async () => {
      setLoading(true);
      const { data: rows } = await supabase
        .from('expenses')
        .select('date, amount');

      const byYear = new Map<number, number>();
      for (const e of rows ?? []) {
        const y = Number(e.date.split('-')[0]);
        byYear.set(y, (byYear.get(y) ?? 0) + Number(e.amount));
      }

      const years = Array.from(byYear.keys()).sort();
      const result: YearlyData[] = years.map((y) => ({
        key: String(y),
        label: String(y),
        year: y,
        total: Number((byYear.get(y) ?? 0).toFixed(2)),
      }));

      setYearlyData(result);
      setLoading(false);
    };
    load();
  }, [viewMode]);

  // ── Monthly derived ─────────────────────────────────────────────────────────
  const monthlyTotal = useMemo(() => monthlyData.reduce((s, d) => s + d.total, 0), [monthlyData]);
  const monthlyAvg   = monthlyData.length > 0 ? monthlyTotal / monthlyData.length : 0;
  const bestMonth    = useMemo(
    () => monthlyData.filter((d) => d.total > 0).reduce<MonthlyData | null>((b, d) => (!b || d.total < b.total ? d : b), null),
    [monthlyData]
  );
  const worstMonth   = useMemo(
    () => monthlyData.reduce<MonthlyData | null>((w, d) => (!w || d.total > w.total ? d : w), null),
    [monthlyData]
  );

  // ── Yearly derived ──────────────────────────────────────────────────────────
  const yearlyTotal = useMemo(() => yearlyData.reduce((s, d) => s + d.total, 0), [yearlyData]);
  const yearlyAvg   = yearlyData.length > 0 ? yearlyTotal / yearlyData.length : 0;
  const bestYear    = useMemo(
    () => yearlyData.filter((d) => d.total > 0).reduce<YearlyData | null>((b, d) => (!b || d.total < b.total ? d : b), null),
    [yearlyData]
  );
  const worstYear   = useMemo(
    () => yearlyData.reduce<YearlyData | null>((w, d) => (!w || d.total > w.total ? d : w), null),
    [yearlyData]
  );

  const hasMonthlyData = monthlyData.some((d) => d.total > 0);
  const hasYearlyData  = yearlyData.some((d) => d.total > 0);

  return {
    viewMode, setViewMode,
    monthCount, setMonthCount,
    monthlyData, yearlyData,
    loading,
    // monthly
    monthlyTotal, monthlyAvg, bestMonth, worstMonth, hasMonthlyData,
    // yearly
    yearlyTotal, yearlyAvg, bestYear, worstYear, hasYearlyData,
    // chart
    chartText, chartGrid, tooltipBg, primaryColor,
    t,
  };
};
