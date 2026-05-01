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
import { RecurringIncomeForm } from '../../components/RecurringIncomeForm';
import { useRecurringIncomePage } from './RecurringIncomePage.helper';

export const RecurringIncomePage = () => {
  const {
    recurring, loading,
    modalOpen, setModalOpen, editing,
    deleteId, setDeleteId, deleting,
    openAdd, openEdit, handleDelete, handleToggle, t,
  } = useRecurringIncomePage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 mt-0.5 shrink-0">
            <Link to="/income" aria-label={t('recurringIncome.backToIncome')}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('recurringIncome.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('recurringIncome.subtitle')}</p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('recurringIncome.addRecurring')}
        </Button>
      </header>

      {loading && recurring.length === 0 ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label={t('recurringIncome.loading')} />
        </div>
      ) : recurring.length === 0 ? (
        <EmptyState
          icon="🔄"
          title={t('recurringIncome.noTitle')}
          message={t('recurringIncome.noMessage')}
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('recurringIncome.addRecurring')}
            </Button>
          }
        />
      ) : (
        <Card>
          <Table aria-label={t('recurringIncome.title')}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">{t('recurringIncome.dayCol')}</TableHead>
                <TableHead scope="col">{t('income.descriptionColHeader')}</TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">{t('income.categoryColHeader')}</TableHead>
                <TableHead scope="col" className="text-right">{t('income.amountColHeader')}</TableHead>
                <TableHead scope="col">{t('recurringIncome.statusCol')}</TableHead>
                <TableHead scope="col"><span className="sr-only">{t('income.actionsColHeader')}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurring.map((r) => (
                <TableRow key={r.id} className={!r.active ? 'opacity-50' : undefined}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                    {t('recurringIncome.dayBadge', { day: r.day_of_month })}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{r.description}</p>
                    {r.income_category && (
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {r.income_category.icon && (
                          <span role="img" aria-label={r.income_category.name}>{r.income_category.icon} </span>
                        )}
                        {r.income_category.name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {r.income_category && (
                      <Badge
                        variant="outline"
                        className="gap-1"
                        style={{
                          borderColor: r.income_category.color ?? undefined,
                          color: r.income_category.color ?? undefined,
                        }}
                      >
                        {r.income_category.icon && (
                          <span role="img" aria-label={r.income_category.name}>{r.income_category.icon}</span>
                        )}
                        {r.income_category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-right font-semibold whitespace-nowrap font-mono text-emerald-600 dark:text-emerald-400"
                    aria-label={`+${formatCurrency(Number(r.amount))}`}
                  >
                    +{formatCurrency(Number(r.amount))}
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
                      aria-label={r.active ? t('recurringIncome.deactivate') : t('recurringIncome.activate')}
                    >
                      {r.active ? t('recurringIncome.active') : t('recurringIncome.paused')}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                        aria-label={t('recurringIncome.editAriaLabel', { name: r.description })}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(r.id)}
                        aria-label={t('recurringIncome.deleteAriaLabel', { name: r.description })}
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
        title={editing ? t('recurringIncome.editRecurring') : t('recurringIncome.addRecurring')}
        description={editing ? t('recurringIncome.editDescription') : t('recurringIncome.addDescription')}
      >
        <RecurringIncomeForm
          recurringIncome={editing ?? undefined}
          onSuccess={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('recurringIncome.deleteTitle')}
        message={t('recurringIncome.deleteMessage')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};
