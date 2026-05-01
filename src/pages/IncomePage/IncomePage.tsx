import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getMonthName } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal } from '../../components/Modal';
import { IncomeForm } from '../../components/IncomeForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useIncomePage, YEARS, MONTHS } from './IncomePage.helper';

export const IncomePage = () => {
  const {
    filtered, loading, filters, setFilters,
    incomeCategories,
    deleteId, setDeleteId, deleting,
    editIncome, setEditIncome,
    addModalOpen, setAddModalOpen,
    applying, pendingRecurring,
    monthName, total,
    handleDelete, handleApplyRecurring,
    t,
  } = useIncomePage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('income.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {filters.month === 0 ? filters.year : `${monthName} ${filters.year}`}
            {filtered.length > 0 && ` · ${t('income.transactionCount', { count: filtered.length })}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/income/recurring">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('recurringIncome.manageLink')}
            </Link>
          </Button>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('income.addIncome')}
          </Button>
        </div>
      </header>

      {pendingRecurring.length > 0 && (
        <div
          role="status"
          className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>
              {t('recurringIncome.pendingBanner', {
                count: pendingRecurring.length,
                month: monthName,
                year: filters.year,
              })}
            </span>
          </div>
          <Button size="sm" onClick={handleApplyRecurring} disabled={applying}>
            {applying ? t('common.processing') : t('recurringIncome.applyAll')}
          </Button>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <h2 className="sr-only" id="filters-heading">{t('income.filtersHeading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-month">{t('income.monthLabel')}</Label>
              <Select
                value={String(filters.month)}
                onValueChange={(v) => setFilters({ month: Number(v) })}
              >
                <SelectTrigger id="filter-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('income.allMonths')}</SelectItem>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-year">{t('income.yearLabel')}</Label>
              <Select
                value={String(filters.year)}
                onValueChange={(v) => setFilters({ year: Number(v) })}
              >
                <SelectTrigger id="filter-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-category">{t('income.categoryFilterLabel')}</Label>
              <Select
                value={filters.categoryId ?? 'all'}
                onValueChange={(v) => setFilters({ categoryId: v === 'all' ? null : v })}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('income.allCategories')}</SelectItem>
                  {incomeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-search">{t('income.searchLabel')}</Label>
              <Input
                id="filter-search"
                type="search"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder={t('income.searchPlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && filtered.length === 0 ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label={t('income.loading')} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💰"
          title={t('income.noIncomeTitle')}
          message={
            filters.search || filters.categoryId
              ? t('income.noIncomeFiltered')
              : filters.month === 0
              ? t('income.noIncomeYear', { year: filters.year })
              : t('income.noIncomeMonth', { month: monthName, year: filters.year })
          }
          action={
            incomeCategories.length === 0 ? (
              <Button asChild variant="outline">
                <Link to="/settings/categories">{t('income.manageCategories')}</Link>
              </Button>
            ) : (
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('income.addIncome')}
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <Table aria-label={t('income.title')}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">{t('income.dateColHeader')}</TableHead>
                <TableHead scope="col">{t('income.descriptionColHeader')}</TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">{t('income.categoryColHeader')}</TableHead>
                <TableHead scope="col" className="text-right">{t('income.amountColHeader')}</TableHead>
                <TableHead scope="col"><span className="sr-only">{t('income.actionsColHeader')}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(inc.date)}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{inc.description}</p>
                    {inc.income_category && (
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {inc.income_category.icon && (
                          <span role="img" aria-label={inc.income_category.name}>{inc.income_category.icon} </span>
                        )}
                        {inc.income_category.name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {inc.income_category && (
                      <Badge
                        variant="outline"
                        className="gap-1"
                        style={{
                          borderColor: inc.income_category.color ?? undefined,
                          color: inc.income_category.color ?? undefined,
                        }}
                      >
                        {inc.income_category.icon && (
                          <span role="img" aria-label={inc.income_category.name}>{inc.income_category.icon}</span>
                        )}
                        {inc.income_category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap font-mono text-emerald-600 dark:text-emerald-400">
                    <span aria-label={`+${formatCurrency(Number(inc.amount))}`}>
                      +{formatCurrency(Number(inc.amount))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditIncome(inc)}
                        aria-label={t('income.editAriaLabel', { name: inc.description })}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(inc.id)}
                        aria-label={t('income.deleteAriaLabel', { name: inc.description })}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">{t('income.total')}</TableCell>
                <TableCell
                  className="text-right font-bold font-mono text-emerald-600 dark:text-emerald-400"
                  aria-label={`Total: +${formatCurrency(total)}`}
                >
                  +{formatCurrency(total)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('income.deleteTitle')}
        message={t('income.deleteMessage')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        loading={deleting}
      />

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={t('income.addIncome')}
        description={t('income.newSubtitle')}
      >
        <IncomeForm
          onSuccess={() => setAddModalOpen(false)}
          onCancel={() => setAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editIncome}
        onClose={() => setEditIncome(null)}
        title={t('income.editIncome')}
        description={t('income.editDescription')}
      >
        {editIncome && (
          <IncomeForm
            income={editIncome}
            onSuccess={() => setEditIncome(null)}
            onCancel={() => setEditIncome(null)}
          />
        )}
      </Modal>
    </div>
  );
};
