import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAnalysisPage } from './AnalysisPage.helper';

export const AnalysisPage = () => {
  const {
    viewMode, setViewMode,
    monthCount, setMonthCount,
    monthlyData, yearlyData,
    loading,
    monthlyExpTotal, monthlyIncTotal,
    bestMonth, worstMonth, hasMonthlyData,
    yearlyExpTotal, yearlyIncTotal,
    bestYear, worstYear, hasYearlyData,
    chartText, chartGrid, tooltipBg, incomeColor, expenseColor,
    t,
  } = useAnalysisPage();

  // This page supports two granularities (monthly/yearly). To avoid repeating
  // conditional branches in the JSX, we normalize the mode-derived values here.
  const isYearly  = viewMode === 'yearly';
  const chartData = isYearly ? yearlyData : monthlyData;
  const hasData   = isYearly ? hasYearlyData : hasMonthlyData;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" label={t('analysis.loading')} />
      </div>
    );
  }

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('analysis.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('analysis.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <div role="tablist" aria-label="View mode" className="flex bg-muted rounded-lg p-0.5">
            {(['monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                role="tab"
                aria-selected={viewMode === mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                  viewMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {mode === 'monthly' ? t('analysis.viewMonthly') : t('analysis.viewYearly')}
              </button>
            ))}
          </div>

          {!isYearly && (
            <div className="flex items-center gap-2">
              <Label htmlFor="months-select" className="text-sm whitespace-nowrap">
                {t('analysis.monthsBack')}
              </Label>
              <Select value={String(monthCount)} onValueChange={(v) => setMonthCount(Number(v))}>
                <SelectTrigger id="months-select" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">{t('analysis.months3')}</SelectItem>
                  <SelectItem value="6">{t('analysis.months6')}</SelectItem>
                  <SelectItem value="12">{t('analysis.months12')}</SelectItem>
                  <SelectItem value="24">{t('analysis.months24')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('analysis.incomeCol')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(isYearly ? yearlyIncTotal : monthlyIncTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isYearly
                ? `${yearlyData.length} ${t('analysis.yearCol').toLowerCase()}s`
                : `${monthCount} ${t('analysis.monthsLabel')}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('analysis.expensesCol')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold font-mono text-destructive">
              {formatCurrency(isYearly ? yearlyExpTotal : monthlyExpTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isYearly ? t('analysis.perYear') : t('analysis.perMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isYearly ? t('analysis.bestYear') : t('analysis.bestMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isYearly ? bestYear : bestMonth) ? (
              <>
                <p className="text-xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency((isYearly ? bestYear : bestMonth)!.expenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(isYearly ? bestYear : bestMonth)!.label}
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isYearly ? t('analysis.worstYear') : t('analysis.worstMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isYearly ? worstYear : worstMonth) ? (
              <>
                <p className="text-xl font-semibold font-mono text-destructive">
                  {formatCurrency((isYearly ? worstYear : worstMonth)!.expenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(isYearly ? worstYear : worstMonth)!.label}
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grouped bar chart: Income vs Expenses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {t('analysis.incomeVsExpenses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <>
              {/* The chart is treated as decorative for screen readers; the same data is
                  provided below as a table (via <details>). */}
              <ResponsiveContainer width="100%" height={280} aria-hidden="true">
                <BarChart data={chartData} barCategoryGap="25%" barGap={2}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: chartText }}
                    axisLine={{ stroke: chartGrid }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: chartText }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) => [
                      formatCurrency(v),
                      name === 'income' ? t('analysis.incomeLabel') : t('analysis.expensesLabel'),
                    ]}
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${chartGrid}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: chartGrid }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs">
                        {value === 'income' ? t('analysis.incomeLabel') : t('analysis.expensesLabel')}
                      </span>
                    )}
                  />
                  <Bar dataKey="income"   name="income"   fill={incomeColor}  radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="expenses" fill={expenseColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* SR-only data table */}
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  {t('dashboard.viewDataTable')}
                </summary>
                <table className="mt-2 w-full text-xs" aria-label={t('analysis.incomeVsExpenses')}>
                  <thead>
                    <tr>
                      <th scope="col" className="text-left py-1 text-muted-foreground">
                        {isYearly ? t('analysis.yearCol') : t('analysis.monthCol')}
                      </th>
                      <th scope="col" className="text-right py-1 text-muted-foreground">{t('analysis.incomeCol')}</th>
                      <th scope="col" className="text-right py-1 text-muted-foreground">{t('analysis.expensesCol')}</th>
                      <th scope="col" className="text-right py-1 text-muted-foreground">{t('analysis.netCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((d) => (
                      <tr key={d.key}>
                        <td className="py-0.5">{d.label}</td>
                        <td className="py-0.5 text-right text-emerald-600 dark:text-emerald-400">+{formatCurrency(d.income)}</td>
                        <td className="py-0.5 text-right text-destructive">{formatCurrency(d.expenses)}</td>
                        <td className={`py-0.5 text-right font-medium ${d.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                          {d.net >= 0 ? '+' : ''}{formatCurrency(d.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">{t('analysis.noData')}</p>
          )}
        </CardContent>
      </Card>

      {/* Breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isYearly ? t('analysis.yearlyBreakdown') : t('analysis.monthlyBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left px-6 py-3 font-medium text-muted-foreground">
                  {isYearly ? t('analysis.yearCol') : t('analysis.monthCol')}
                </th>
                <th scope="col" className="text-right px-6 py-3 font-medium text-muted-foreground">
                  {t('analysis.incomeCol')}
                </th>
                <th scope="col" className="text-right px-6 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  {t('analysis.expensesCol')}
                </th>
                <th scope="col" className="text-right px-6 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  {t('analysis.netCol')}
                </th>
                <th scope="col" className="text-right px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  {isYearly ? t('analysis.changeColYear') : t('analysis.changeCol')}
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d, i) => {
                // Change vs previous period:
                // - `prev` only exists when there is a previous item
                // - percentage only makes sense when `prev > 0` (avoids division by zero)
                const prev   = i > 0 ? chartData[i - 1].expenses : null;
                const diff   = prev !== null ? d.expenses - prev : null;
                const pct    = prev !== null && prev > 0 ? ((d.expenses - prev) / prev) * 100 : null;
                const isUp   = diff !== null && diff > 0;
                const isDown = diff !== null && diff < 0;
                const isSurplus = d.net >= 0;

                return (
                  <tr key={d.key} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium">{d.label}</td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {d.income > 0
                        ? <span aria-label={`+${formatCurrency(d.income)}`}>+{formatCurrency(d.income)}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-3 text-right font-mono hidden sm:table-cell">
                      {d.expenses > 0 ? formatCurrency(d.expenses) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-3 text-right font-mono hidden sm:table-cell">
                      {d.income === 0 && d.expenses === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}
                          // The UI uses +/− and color; this label ensures an explicit reading for
                          // assistive tech while keeping the value as a positive magnitude.
                          aria-label={`${isSurplus ? t('dashboard.surplus') : t('dashboard.deficit')}: ${formatCurrency(Math.abs(d.net))}`}
                        >
                          {isSurplus ? '+' : '-'}{formatCurrency(Math.abs(d.net))}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right hidden md:table-cell">
                      {/* If there's no previous period (or `prev` is invalid), or the change is 0,
                          we show “—” to avoid visual noise. */}
                      {pct === null || pct === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          isUp ? 'text-destructive' : isDown ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}>
                          {isUp
                            ? <TrendingUp className="h-3 w-3" aria-hidden="true" />
                            : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                          {isUp ? '+' : ''}{pct.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
