import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Download, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate, getMonthName } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal } from '../../components/Modal';
import { ExpenseForm } from '../../components/ExpenseForm';
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
import { useExpensesPage, YEARS, MONTHS } from './ExpensesPage.helper';

export const ExpensesPage = () => {
  const {
    filtered, loading, filters, setFilters, categories,
    deleteId, setDeleteId, deleting,
    editExpense, setEditExpense, addModalOpen, setAddModalOpen, applying,
    pendingRecurring, monthName, total,
    handleDelete, handleExport, handleApplyRecurring, t,
  } = useExpensesPage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('expenses.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {filters.month === 0 ? filters.year : `${monthName} ${filters.year}`}
            {filtered.length > 0 && ` · ${t('expenses.transactionCount', { count: filtered.length })}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/expenses/recurring">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('recurring.manageLink')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('settings.exportCsv')}
          </Button>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('expenses.addExpense')}
          </Button>
        </div>
      </header>

      {pendingRecurring.length > 0 && (
        <div
          role="status"
          className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span>
              {t('recurring.pendingBanner', {
                count: pendingRecurring.length,
                month: monthName,
                year: filters.year,
              })}
            </span>
          </div>
          <Button size="sm" onClick={handleApplyRecurring} disabled={applying}>
            {applying ? t('common.processing') : t('recurring.applyAll')}
          </Button>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-4">
          <h2 className="sr-only" id="filters-heading">{t('expenses.filtersHeading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-month">{t('expenses.monthLabel')}</Label>
              <Select
                value={String(filters.month)}
                onValueChange={(v) => setFilters({ month: Number(v) })}
              >
                <SelectTrigger id="filter-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('expenses.allMonths')}</SelectItem>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-year">{t('expenses.yearLabel')}</Label>
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
              <Label htmlFor="filter-category">{t('expenses.categoryFilterLabel')}</Label>
              <Select
                value={filters.categoryId ?? 'all'}
                onValueChange={(v) => setFilters({ categoryId: v === 'all' ? null : v })}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('expenses.allCategories')}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-search">{t('expenses.searchLabel')}</Label>
              <Input
                id="filter-search"
                type="search"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder={t('expenses.searchPlaceholder')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && filtered.length === 0 ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label={t('expenses.loading')} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💸"
          title={t('expenses.noExpensesTitle')}
          message={
            filters.search || filters.categoryId
              ? t('expenses.noExpensesFiltered')
              : filters.month === 0
              ? t('expenses.noExpensesYear', { year: filters.year })
              : t('expenses.noExpensesMonth', { month: monthName, year: filters.year })
          }
          action={
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('expenses.addExpense')}
            </Button>
          }
        />
      ) : (
        <Card>
          <Table aria-label="Expenses list">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">{t('expenses.dateColHeader')}</TableHead>
                <TableHead scope="col">{t('expenses.descriptionColHeader')}</TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">{t('expenses.categoryColHeader')}</TableHead>
                <TableHead scope="col" className="text-right">{t('expenses.amountColHeader')}</TableHead>
                <TableHead scope="col"><span className="sr-only">{t('expenses.actionsColHeader')}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{expense.description}</p>
                    {expense.category && (
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {expense.category.icon && (
                          <span role="img" aria-label={expense.category.name}>{expense.category.icon} </span>
                        )}
                        {expense.category.name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {expense.category && (
                      <Badge
                        variant="outline"
                        className="gap-1"
                        style={{
                          borderColor: expense.category.color ?? undefined,
                          color: expense.category.color ?? undefined,
                        }}
                      >
                        {expense.category.icon && (
                          <span role="img" aria-label={expense.category.name}>{expense.category.icon}</span>
                        )}
                        {expense.category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap font-mono">
                    {formatCurrency(Number(expense.amount))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditExpense(expense)}
                        aria-label={t('expenses.editAriaLabel', { name: expense.description })}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(expense.id)}
                        aria-label={t('expenses.deleteAriaLabel', { name: expense.description })}
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
                <TableCell colSpan={3} className="font-semibold">{t('expenses.total')}</TableCell>
                <TableCell className="text-right font-bold font-mono">{formatCurrency(total)}</TableCell>
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
        title={t('expenses.deleteTitle')}
        message={t('expenses.deleteMessage')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        loading={deleting}
      />

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={t('expenses.addExpense')}
        description={t('expenses.newSubtitle')}
      >
        <ExpenseForm
          onSuccess={() => setAddModalOpen(false)}
          onCancel={() => setAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editExpense}
        onClose={() => setEditExpense(null)}
        title={t('expenses.editExpense')}
        description={t('expenses.editDescription')}
      >
        {editExpense && (
          <ExpenseForm
            expense={editExpense}
            onSuccess={() => setEditExpense(null)}
            onCancel={() => setEditExpense(null)}
          />
        )}
      </Modal>
    </div>
  );
};
