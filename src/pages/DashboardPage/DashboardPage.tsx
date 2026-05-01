import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Percent, Tag, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardPage } from './DashboardPage.helper';

export const DashboardPage = () => {
  const {
    expenses, loading, filters,
    totalSpent, totalIncome, netBalance, isSurplus, savingsRate,
    topCategory,
    byCategory, byDay, recentExpenses,
    monthName,
    chartText, chartGrid, tooltipBg, primaryColor,
    t,
  } = useDashboardPage();

  if (loading && expenses.length === 0) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" label={t('dashboard.loading')} /></div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('dashboard.overview', { month: monthName, year: filters.year })}
        </p>
      </header>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">{t('dashboard.summaryHeading')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('dashboard.totalIncome')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p
                className="text-2xl font-semibold font-mono tracking-tight text-emerald-600 dark:text-emerald-400"
                aria-label={`${t('dashboard.totalIncome')}: +${formatCurrency(totalIncome)}`}
              >
                +{formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{monthName} {filters.year}</p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('dashboard.totalExpenses')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p
                className="text-2xl font-semibold font-mono tracking-tight text-destructive"
                aria-label={`${t('dashboard.totalExpenses')}: ${formatCurrency(totalSpent)}`}
              >
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{monthName} {filters.year}</p>
            </CardContent>
          </Card>

          {/* Net Balance */}
          <Card className={isSurplus ? 'border-emerald-200 dark:border-emerald-800' : 'border-destructive/30'}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('dashboard.netBalance')}
              </CardTitle>
              {isSurplus
                ? <ArrowUp className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                : <ArrowDown className="h-4 w-4 text-destructive" aria-hidden="true" />}
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-semibold font-mono tracking-tight ${isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                aria-label={`${t('dashboard.netBalance')}: ${isSurplus ? t('dashboard.surplus') : t('dashboard.deficit')}, ${formatCurrency(Math.abs(netBalance))}`}
              >
                {isSurplus ? '+' : '-'}{formatCurrency(Math.abs(netBalance))}
              </p>
              <p className={`text-xs font-medium mt-1 ${isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {isSurplus ? t('dashboard.surplus') : t('dashboard.deficit')}
              </p>
            </CardContent>
          </Card>

          {/* Savings Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('dashboard.savingsRate')}
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              {savingsRate !== null ? (
                <>
                  <p
                    className={`text-2xl font-semibold font-mono tracking-tight ${savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                    aria-label={savingsRate >= 0
                      ? t('dashboard.savedPercent', { pct: Math.round(savingsRate) })
                      : t('dashboard.overspentPercent', { pct: Math.round(Math.abs(savingsRate)) })}
                  >
                    {savingsRate >= 0
                      ? t('dashboard.savedPercent', { pct: Math.round(savingsRate) })
                      : t('dashboard.overspentPercent', { pct: Math.round(Math.abs(savingsRate)) })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{monthName} {filters.year}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-muted-foreground">—</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('dashboard.noIncomeData')}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {expenses.length === 0 && totalIncome === 0 ? (
        <EmptyState
          icon="📊"
          title={t('dashboard.noExpensesTitle')}
          message={t('dashboard.noExpensesMessage', { month: monthName, year: filters.year })}
          action={
            <Button asChild>
              <Link to="/expenses/new">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('dashboard.addFirstExpense')}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base" id="daily-chart-title">{t('dashboard.dailySpending')}</CardTitle>
            </CardHeader>
            <CardContent>
              {byDay.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220} aria-hidden="true">
                    <BarChart data={byDay} barCategoryGap="30%">
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartText }} axisLine={{ stroke: chartGrid }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: chartText }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        labelFormatter={(l) => `${t('common.day')} ${l}`}
                        contentStyle={{ background: tooltipBg, border: `1px solid ${chartGrid}`, borderRadius: '8px', fontSize: '12px' }}
                        cursor={{ fill: chartGrid }}
                      />
                      <Bar dataKey="total" fill={primaryColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">{t('dashboard.viewDataTable')}</summary>
                    <table className="mt-2 w-full text-xs" aria-label={t('dashboard.dailyDataLabel')}>
                      <thead><tr><th scope="col" className="text-left py-1 text-muted-foreground">{t('common.day')}</th><th scope="col" className="text-right py-1 text-muted-foreground">{t('common.amount')}</th></tr></thead>
                      <tbody>{byDay.map((d) => (<tr key={d.date}><td className="py-0.5">{d.date}</td><td className="py-0.5 text-right">{formatCurrency(d.total)}</td></tr>))}</tbody>
                    </table>
                  </details>
                </>
              ) : <p className="text-muted-foreground text-sm">{t('common.noData')}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base" id="category-chart-title">{t('dashboard.spendingByCategory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {byCategory.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220} aria-hidden="true">
                    <PieChart>
                      <Pie data={byCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {byCategory.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.color || ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'][index % 10]} />
                        ))}
                      </Pie>
                      <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">{t('dashboard.viewDataTable')}</summary>
                    <table className="mt-2 w-full text-xs" aria-label={t('dashboard.categoryDataLabel')}>
                      <thead><tr><th scope="col" className="text-left py-1 text-muted-foreground">{t('expenses.categoryColHeader')}</th><th scope="col" className="text-right py-1 text-muted-foreground">{t('common.amount')}</th><th scope="col" className="text-right py-1 text-muted-foreground">{t('common.percentage')}</th></tr></thead>
                      <tbody>{byCategory.map((c) => (<tr key={c.name}><td className="py-0.5">{c.icon && <span role="img" aria-label={c.name}>{c.icon} </span>}{c.name}</td><td className="py-0.5 text-right">{formatCurrency(c.total)}</td><td className="py-0.5 text-right text-muted-foreground">{totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0}{t('common.percentage')}</td></tr>))}</tbody>
                    </table>
                  </details>
                </>
              ) : <p className="text-muted-foreground text-sm">{t('common.noData')}</p>}
            </CardContent>
          </Card>

          {topCategory && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.topCategory')}</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold flex items-center gap-2">
                  {topCategory.icon && <span role="img" aria-label={topCategory.name}>{topCategory.icon}</span>}
                  {topCategory.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{formatCurrency(topCategory.total)}</p>
              </CardContent>
            </Card>
          )}

          <Card className={topCategory ? '' : 'lg:col-span-2'}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base" id="recent-heading">{t('dashboard.recentTransactions')}</CardTitle>
              <Button variant="link" asChild className="h-auto p-0 text-sm">
                <Link to="/expenses">{t('common.viewAll')}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul role="list" className="divide-y">
                {recentExpenses.map((expense) => (
                  <li key={expense.id} className="flex items-center gap-3 py-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: expense.category?.color ? `${expense.category.color}20` : 'hsl(var(--muted))' }}
                    >
                      {expense.category?.icon
                        ? <span role="img" aria-label={expense.category.name}>{expense.category.icon}</span>
                        : <span aria-hidden="true">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.category?.name} · {formatDate(expense.date)}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0 font-mono">{formatCurrency(Number(expense.amount))}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
