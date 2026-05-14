import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { getMonthName } from '../../utils';
import { useFormatCurrency } from '../../store/useCurrencyStore';
import { useGroupSummaryPage } from './GroupSummaryPage.helper';

export const GroupSummaryPage = () => {
  const formatCurrency = useFormatCurrency();
  const {
    t, members,
    memberExpenses, memberIncomes, unassignedIncome,
    categoryRows, grandExpenses, grandIncome,
    month, year, setMonth, setYear,
    months, years, loading,
  } = useGroupSummaryPage();

  if (loading && members.length === 0) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" label={t('group.loading')} /></div>;
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title={t('group.noMembers')}
        message={t('group.noMembersMessage')}
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('group.summaryTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('group.summarySubtitle')}</p>
      </header>

      {/* ── Filters ── */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <div className="space-y-1.5">
              <Label htmlFor="summary-month">{t('expenses.monthLabel')}</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger id="summary-month"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="summary-year">{t('expenses.yearLabel')}</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger id="summary-year"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Member summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {members.map((m) => {
          const income   = memberIncomes[m.id]  ?? 0;
          const expenses = memberExpenses[m.id] ?? 0;
          const net      = income - expenses;
          return (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{m.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('group.incomeLabel')}</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(income)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('group.expensesLabel')}</span>
                  <span className="font-medium text-red-500 dark:text-red-400">{formatCurrency(expenses)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-1.5 mt-1.5">
                  <span className="font-medium">{t('group.netLabel')}</span>
                  <span className={`font-semibold ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {net >= 0 ? '+' : ''}{formatCurrency(net)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Totals card */}
        <Card className="bg-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('group.totalLabel')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('group.incomeLabel')}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(grandIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('group.expensesLabel')}</span>
              <span className="font-medium text-red-500 dark:text-red-400">{formatCurrency(grandExpenses)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-1.5 mt-1.5">
              <span className="font-medium">{t('group.netLabel')}</span>
              <span className={`font-semibold ${grandIncome - grandExpenses >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {grandIncome - grandExpenses >= 0 ? '+' : ''}{formatCurrency(grandIncome - grandExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned income notice */}
      {unassignedIncome > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {t('group.unassignedIncome', { amount: formatCurrency(unassignedIncome) })}
        </p>
      )}

      {/* ── Expense category breakdown ── */}
      {categoryRows.length === 0 ? (
        <EmptyState icon="📊" title={t('group.noExpenses')} message={t('group.noExpenses')} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('group.categoryCol')}</th>
                  {members.map((m) => (
                    <th key={m.id} className="text-right px-4 py-3 font-medium text-muted-foreground">{m.name}</th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('group.totalLabel')}</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {row.icon && <span aria-hidden="true">{row.icon}</span>}
                        {row.name}
                      </span>
                    </td>
                    {members.map((m) => (
                      <td key={m.id} className="text-right px-4 py-3 tabular-nums">
                        {formatCurrency(row.memberAmounts[m.id] ?? 0)}
                      </td>
                    ))}
                    <td className="text-right px-4 py-3 font-medium tabular-nums">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="px-4 py-3">{t('group.totalLabel')}</td>
                  {members.map((m) => (
                    <td key={m.id} className="text-right px-4 py-3 tabular-nums">
                      {formatCurrency(memberExpenses[m.id] ?? 0)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-3 tabular-nums">{formatCurrency(grandExpenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
