import { useEffect, useMemo, useState } from 'react';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from '../../i18n';
import type { InvestmentPlatform } from '../../types';

export interface CurrencyMetrics {
  currency: string;
  netInvested: number;
  currentValue: number | null;
  pnl: number | null;
  roi: number | null;
}

export interface PlatformBreakdown {
  platform: InvestmentPlatform;
  currencies: CurrencyMetrics[];
}

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
  estimated: boolean; // true when based on net invested (no snapshot)
}

export const useInvestmentsPage = () => {
  const { platforms, flows, snapshots, loading, fetchAll } = useInvestmentStore();
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotDefaults, setSnapshotDefaults] = useState<{ platformId?: string; currency?: string }>({});
  const [allocCurrency, setAllocCurrency] = useState<string | null>(null);

  const platformById = useMemo(() => new Map(platforms.map((p) => [p.id, p])), [platforms]);

  const {
    currencyTotals, platformBreakdowns, allocationByCurrency, currencies, staleCount,
  } = useMemo(() => {
    // net invested per (platform, currency)
    const netInvested = new Map<string, number>();
    for (const f of flows) {
      const key = `${f.platform_id}|${f.currency}`;
      netInvested.set(key, (netInvested.get(key) ?? 0) + (f.type === 'deposit' ? Number(f.amount) : -Number(f.amount)));
    }

    // latest snapshot value per (platform, currency)
    const latest = new Map<string, { value: number; date: string; created_at: string }>();
    for (const sn of snapshots) {
      const key = `${sn.platform_id}|${sn.currency}`;
      const cur = latest.get(key);
      if (!cur || sn.date > cur.date || (sn.date === cur.date && sn.created_at > cur.created_at)) {
        latest.set(key, { value: Number(sn.value), date: sn.date, created_at: sn.created_at });
      }
    }

    // one metric row per (platform, currency), computed once and reused below
    const rows = [...new Set([...netInvested.keys(), ...latest.keys()])].map((key) => {
      const [platformId, currency] = key.split('|');
      const invested = netInvested.get(key) ?? 0;
      const currentValue = latest.get(key)?.value ?? null;
      const pnl = currentValue === null ? null : currentValue - invested;
      const roi = pnl === null || invested === 0 ? null : pnl / invested;
      return { platformId, m: { currency, netInvested: invested, currentValue, pnl, roi } as CurrencyMetrics };
    });

    const staleCount = rows.filter(({ m }) => m.currentValue === null && m.netInvested > 0).length;

    // per platform
    const perPlatform = new Map<string, CurrencyMetrics[]>();
    for (const { platformId, m } of rows) {
      if (!perPlatform.has(platformId)) perPlatform.set(platformId, []);
      perPlatform.get(platformId)!.push(m);
    }
    const platformBreakdowns: PlatformBreakdown[] = platforms
      .filter((p) => perPlatform.has(p.id))
      .map((p) => ({ platform: p, currencies: (perPlatform.get(p.id) ?? []).sort((a, b) => a.currency.localeCompare(b.currency)) }));

    // per currency totals
    const byCurrency = new Map<string, { netInvested: number; currentValue: number; hasSnapshot: boolean }>();
    for (const { m } of rows) {
      const agg = byCurrency.get(m.currency) ?? { netInvested: 0, currentValue: 0, hasSnapshot: false };
      agg.netInvested += m.netInvested;
      if (m.currentValue !== null) { agg.currentValue += m.currentValue; agg.hasSnapshot = true; }
      byCurrency.set(m.currency, agg);
    }
    const currencyTotals: CurrencyMetrics[] = [...byCurrency.entries()].map(([currency, agg]) => {
      const currentValue = agg.hasSnapshot ? agg.currentValue : null;
      const pnl = currentValue === null ? null : currentValue - agg.netInvested;
      const roi = pnl === null || agg.netInvested === 0 ? null : pnl / agg.netInvested;
      return { currency, netInvested: agg.netInvested, currentValue, pnl, roi };
    }).sort((a, b) => a.currency.localeCompare(b.currency));

    // allocation per currency (current value when available, else net invested)
    const allocationByCurrency = new Map<string, AllocationSlice[]>();
    for (const { platformId, m } of rows) {
      const value = m.currentValue ?? m.netInvested;
      if (value <= 0) continue;
      const platform = platformById.get(platformId);
      const slices = allocationByCurrency.get(m.currency) ?? [];
      slices.push({ name: platform?.name ?? '—', value, color: platform?.color ?? '#6366f1', estimated: m.currentValue === null });
      allocationByCurrency.set(m.currency, slices);
    }
    for (const slices of allocationByCurrency.values()) slices.sort((a, b) => b.value - a.value);

    const currencies = currencyTotals.map((c) => c.currency);
    return { currencyTotals, platformBreakdowns, allocationByCurrency, currencies, staleCount };
  }, [flows, snapshots, platforms, platformById]);

  const activeAllocCurrency = allocCurrency && currencies.includes(allocCurrency) ? allocCurrency : (currencies[0] ?? null);
  const allocation = activeAllocCurrency ? (allocationByCurrency.get(activeAllocCurrency) ?? []) : [];
  const allocationTotal = allocation.reduce((s, a) => s + a.value, 0);

  const recentFlows = useMemo(() => flows.slice(0, 5), [flows]);
  const hasData = flows.length > 0 || platformBreakdowns.length > 0;

  const openSnapshot = (platformId?: string, currency?: string) => {
    setSnapshotDefaults({ platformId, currency });
    setSnapshotModalOpen(true);
  };

  const isDark = theme === 'dark';
  const tooltipBg = isDark ? '#27272a' : '#ffffff';
  const tooltipText = isDark ? '#fafafa' : '#18181b';
  const chartGrid = isDark ? '#3f3f46' : '#e4e4e7';

  return {
    loading, hasData, platforms, platformById,
    currencyTotals, platformBreakdowns,
    allocation, allocationTotal, currencies, activeAllocCurrency, setAllocCurrency,
    staleCount,
    recentFlows,
    flowModalOpen, setFlowModalOpen,
    snapshotModalOpen, setSnapshotModalOpen, snapshotDefaults, openSnapshot,
    tooltipBg, tooltipText, chartGrid,
    t,
  };
};
