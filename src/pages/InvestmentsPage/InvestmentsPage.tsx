import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { InvestmentFlowForm } from '../../components/InvestmentFlowForm';
import { InvestmentSnapshotForm } from '../../components/InvestmentSnapshotForm';
import { PlatformAvatar } from '../../components/PlatformAvatar';
import { ChartErrorBoundary } from '../../components/ChartErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CHART_COLORS } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { useInvestmentsPage } from './InvestmentsPage.helper';
import type { CurrencyMetrics } from './InvestmentsPage.helper';

const pnlClass = (v: number | null) =>
  v === null ? '' : v > 0 ? 'text-emerald-600 dark:text-emerald-400' : v < 0 ? 'text-destructive' : '';
const formatRoi = (roi: number | null) => (roi === null ? '—' : `${roi >= 0 ? '+' : ''}${(roi * 100).toFixed(1)}%`);

export const InvestmentsPage = () => {
  const {
    loading, hasData, platforms,
    currencyTotals, platformBreakdowns,
    allocation, allocationTotal, currencies, activeAllocCurrency, setAllocCurrency,
    staleCount,
    recentFlows, platformById,
    flowModalOpen, setFlowModalOpen,
    snapshotModalOpen, setSnapshotModalOpen, snapshotDefaults, openSnapshot,
    tooltipBg, tooltipText, chartGrid,
    t,
  } = useInvestmentsPage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('investments.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('investments.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => openSnapshot()} disabled={platforms.length === 0}>
            <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('investments.updateValue')}
          </Button>
          <Button onClick={() => setFlowModalOpen(true)} disabled={platforms.length === 0}>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('investments.addFlow')}
          </Button>
        </div>
      </header>

      {loading && !hasData ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label={t('investments.loading')} />
        </div>
      ) : !hasData ? (
        <EmptyState
          icon="📈"
          title={t('investments.emptyTitle')}
          message={t('investments.emptyMessage')}
          action={
            <Button onClick={() => setFlowModalOpen(true)} disabled={platforms.length === 0}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('investments.addFlow')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {staleCount > 0 && (
            <div role="status" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
                <span>{t('investments.staleBanner', { count: staleCount })}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => openSnapshot()}>{t('investments.updateValue')}</Button>
            </div>
          )}

          {/* ---- KPI row per currency ---- */}
          <section aria-label={t('investments.byCurrency')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currencyTotals.map((m) => <KpiCard key={m.currency} m={m} />)}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ---- allocation donut ---- */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('investments.allocation')}
                  </h2>
                  {currencies.length > 1 && (
                    <div className="flex gap-1" role="group" aria-label={t('investments.currency')}>
                      {currencies.map((c) => (
                        <button key={c} type="button" onClick={() => setAllocCurrency(c)}
                          className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                            c === activeAllocCurrency ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                          }`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {allocation.length > 0 ? (
                  <>
                    <ChartErrorBoundary>
                      <ResponsiveContainer width="100%" height={230} aria-hidden="true">
                        <PieChart>
                          <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%"
                            innerRadius={58} outerRadius={90} paddingAngle={3}>
                            {allocation.map((a, i) => (
                              <Cell key={a.name} fill={a.color || CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                          <Tooltip
                            formatter={(v: number) => formatCurrency(v, activeAllocCurrency ?? 'EUR')}
                            contentStyle={{ background: tooltipBg, border: `1px solid ${chartGrid}`, borderRadius: '8px', fontSize: '12px', color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                            labelStyle={{ color: tooltipText }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartErrorBoundary>
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">{t('investments.viewDataTable')}</summary>
                      <table className="mt-2 w-full text-xs" aria-label={t('investments.allocation')}>
                        <thead><tr>
                          <th scope="col" className="text-left py-1 text-muted-foreground">{t('investments.platformCol')}</th>
                          <th scope="col" className="text-right py-1 text-muted-foreground">{t('investments.value')}</th>
                          <th scope="col" className="text-right py-1 text-muted-foreground">%</th>
                        </tr></thead>
                        <tbody>{allocation.map((a) => (
                          <tr key={a.name}>
                            <td className="py-0.5">{a.name}{a.estimated && <span className="text-muted-foreground"> *</span>}</td>
                            <td className="py-0.5 text-right font-mono">{formatCurrency(a.value, activeAllocCurrency ?? 'EUR')}</td>
                            <td className="py-0.5 text-right text-muted-foreground">{allocationTotal > 0 ? Math.round((a.value / allocationTotal) * 100) : 0}%</td>
                          </tr>
                        ))}</tbody>
                      </table>
                      <p className="text-[11px] text-muted-foreground mt-1">{t('investments.estimatedHint')}</p>
                    </details>
                  </>
                ) : <p className="text-muted-foreground text-sm py-8 text-center">{t('investments.noAllocation')}</p>}
              </CardContent>
            </Card>

            {/* ---- per-platform breakdown ---- */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('investments.byPlatform')}</h2>
              <Card>
                <ul className="divide-y divide-border max-h-[460px] overflow-y-auto" role="list">
                  {platformBreakdowns.map(({ platform, currencies: rows }) => (
                    <li key={platform.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformAvatar name={platform.name} color={platform.color} className="h-6 w-6 rounded-md text-[11px]" />
                        <p className="font-semibold text-sm">{platform.name}</p>
                      </div>
                      <div className="space-y-1">
                        {rows.map((m) => (
                          <div key={m.currency} className="flex items-center justify-between text-sm gap-2">
                            <span className="font-medium w-10 shrink-0">{m.currency}</span>
                            <span className="font-mono text-xs text-muted-foreground flex-1 text-right whitespace-nowrap">
                              {formatCurrency(m.netInvested, m.currency)}
                            </span>
                            {m.currentValue === null ? (
                              <button onClick={() => openSnapshot(platform.id, m.currency)}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0">
                                {t('investments.setValue')}
                              </button>
                            ) : (
                              <span className={`flex items-center justify-end gap-2 font-mono text-xs shrink-0 ${pnlClass(m.pnl)}`}>
                                <span className="whitespace-nowrap">
                                  {(m.pnl ?? 0) >= 0 ? '+' : ''}{formatCurrency(m.pnl ?? 0, m.currency)}
                                </span>
                                <span className="whitespace-nowrap w-14 text-right">{formatRoi(m.roi)}</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* ---- recent movements preview ---- */}
          <section aria-label={t('investments.movements')}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('investments.movements')}</h2>
              <Button variant="link" asChild className="h-auto p-0 text-sm">
                <Link to="/investments/transactions">{t('common.viewAll')}</Link>
              </Button>
            </div>
            {recentFlows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('investments.noMovements')}</p>
            ) : (
              <Card>
                <ul role="list" className="divide-y">
                  {recentFlows.map((f) => {
                    const p = platformById.get(f.platform_id);
                    const isDeposit = f.type === 'deposit';
                    return (
                      <li key={f.id} className="flex items-center gap-3 py-3 px-4">
                        <PlatformAvatar name={p?.name ?? '—'} color={p?.color} className="h-9 w-9 rounded-full text-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">
                            {isDeposit ? t('investments.deposit') : t('investments.withdrawal')} · {formatDate(f.date)}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold shrink-0 font-mono ${isDeposit ? '' : 'text-destructive'}`}>
                          {isDeposit ? '' : '−'}{formatCurrency(Number(f.amount), f.currency)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </section>
        </div>
      )}

      <Modal isOpen={flowModalOpen} onClose={() => setFlowModalOpen(false)}
        title={t('investments.addFlow')} description={t('investments.flowFormHint')}>
        <InvestmentFlowForm onSuccess={() => setFlowModalOpen(false)} onCancel={() => setFlowModalOpen(false)} />
      </Modal>

      <Modal isOpen={snapshotModalOpen} onClose={() => setSnapshotModalOpen(false)}
        title={t('investments.updateValue')} description={t('investments.snapshotFormHint')}>
        <InvestmentSnapshotForm
          defaultPlatformId={snapshotDefaults.platformId}
          defaultCurrency={snapshotDefaults.currency}
          onSuccess={() => setSnapshotModalOpen(false)}
          onCancel={() => setSnapshotModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const KpiCard = ({ m }: { m: CurrencyMetrics }) => {
  const { t } = useTranslation();
  const up = m.pnl !== null && m.pnl > 0;
  const down = m.pnl !== null && m.pnl < 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{m.currency}</span>
        {m.roi !== null && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold font-mono ${pnlClass(m.roi)}`}>
            {up && <ArrowUp className="h-3 w-3" aria-hidden="true" />}
            {down && <ArrowDown className="h-3 w-3" aria-hidden="true" />}
            {formatRoi(m.roi)}
          </span>
        )}
      </div>
      <p className={`text-2xl font-semibold font-mono tracking-tight ${m.currentValue === null ? 'text-muted-foreground' : ''}`}>
        {m.currentValue === null ? formatCurrency(m.netInvested, m.currency) : formatCurrency(m.currentValue, m.currency)}
      </p>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-muted-foreground">
          {m.currentValue === null ? t('investments.invested') : t('investments.value')}
        </span>
        {m.pnl !== null && (
          <span className={`font-mono ${pnlClass(m.pnl)}`}>
            {m.pnl >= 0 ? '+' : ''}{formatCurrency(m.pnl, m.currency)}
          </span>
        )}
      </div>
    </div>
  );
};
