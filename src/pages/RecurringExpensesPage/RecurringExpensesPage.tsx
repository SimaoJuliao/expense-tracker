import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ExpenseForm } from '../../components/ExpenseForm';
import { useRecurringExpensesPage } from './RecurringExpensesPage.helper';

export const RecurringExpensesPage = () => {
  const {
    recurring, loading,
    modalOpen, setModalOpen, editing,
    deleteId, setDeleteId, deleting,
    openAdd, openEdit, handleDelete, handleToggle, t,
  } = useRecurringExpensesPage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 mt-0.5 shrink-0">
            <Link to="/expenses" aria-label={t('expenses.backToExpenses')}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('recurring.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('recurring.subtitle')}</p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('recurring.addRecurring')}
        </Button>
      </header>

      {loading && recurring.length === 0 ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label={t('recurring.loading')} />
        </div>
      ) : recurring.length === 0 ? (
        <EmptyState
          icon="🔄"
          title={t('recurring.noTitle')}
          message={t('recurring.noMessage')}
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('recurring.addRecurring')}
            </Button>
          }
        />
      ) : (
        <Card>
          <Table aria-label={t('recurring.title')}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">{t('recurring.dayCol')}</TableHead>
                <TableHead scope="col">{t('expenses.descriptionColHeader')}</TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">{t('expenses.categoryColHeader')}</TableHead>
                <TableHead scope="col" className="text-right">{t('expenses.amountColHeader')}</TableHead>
                <TableHead scope="col">{t('recurring.statusCol')}</TableHead>
                <TableHead scope="col"><span className="sr-only">{t('expenses.actionsColHeader')}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.map((r) => (
                <TableRow key={r.id} className={!r.active ? 'opacity-50' : undefined}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                    {t('recurring.dayBadge', { day: r.day_of_month })}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{r.description}</p>
                    {r.category && (
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {r.category.icon && <span role="img" aria-label={r.category.name}>{r.category.icon} </span>}
                        {r.category.name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {r.category && (
                      <Badge
                        variant="outline"
                        className="gap-1"
                        style={{
                          borderColor: r.category.color ?? undefined,
                          color: r.category.color ?? undefined,
                        }}
                      >
                        {r.category.icon && (
                          <span role="img" aria-label={r.category.name}>{r.category.icon}</span>
                        )}
                        {r.category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap font-mono">
                    {formatCurrency(Number(r.amount))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(r)}
                      className={
                        r.active
                          ? 'h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                          : 'h-7 text-xs'
                      }
                      aria-label={r.active ? t('recurring.deactivate') : t('recurring.activate')}
                    >
                      {r.active ? t('recurring.active') : t('recurring.paused')}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                        aria-label={t('recurring.editAriaLabel', { name: r.description })}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(r.id)}
                        aria-label={t('recurring.deleteAriaLabel', { name: r.description })}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('recurring.editRecurring') : t('recurring.addRecurring')}
        description={editing ? t('recurring.editDescription') : t('recurring.addDescription')}
      >
        <ExpenseForm
          mode="recurring"
          recurringExpense={editing ?? undefined}
          onSuccess={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('recurring.deleteTitle')}
        message={t('recurring.deleteMessage')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};
