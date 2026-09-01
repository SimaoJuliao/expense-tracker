import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, getMonthName } from '../../utils';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal } from '../../components/Modal';
import { PlatformAvatar } from '../../components/PlatformAvatar';
import { InvestmentFlowForm } from '../../components/InvestmentFlowForm';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useInvestmentTransactionsPage, YEARS, MONTHS } from './InvestmentTransactionsPage.helper';

export const InvestmentTransactionsPage = () => {
  const {
    platforms, platformById, currencies,
    pageItems, page, totalPages, setPage, count,
    platformId, setPlatformId, currency, setCurrency, type, setType,
    month, setMonth, year, setYear, resetFilters, hasActiveFilters,
    addModalOpen, setAddModalOpen, editFlow, setEditFlow,
    deleteId, setDeleteId, confirmDelete,
    t,
  } = useInvestmentTransactionsPage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('investments.movements')}</h1>
          <p className="text-muted-foreground mt-1">{t('investments.movementsCount', { count })}</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} disabled={platforms.length === 0}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('investments.addFlow')}
        </Button>
      </header>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label>{t('investments.platformCol')}</Label>
              <Select value={platformId} onValueChange={setPlatformId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('investments.allPlatforms')}</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('investments.currency')}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('investments.allCurrencies')}</SelectItem>
                  {currencies.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('investments.typeCol')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('investments.allTypes')}</SelectItem>
                  <SelectItem value="deposit">{t('investments.deposit')}</SelectItem>
                  <SelectItem value="withdrawal">{t('investments.withdrawal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('investments.month')}</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('investments.allMonths')}</SelectItem>
                  {MONTHS.map((m) => (<SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('investments.year')}</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('investments.allYears')}</SelectItem>
                  {YEARS.map((y) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {count === 0 ? (
        <EmptyState
          icon="💸"
          title={t('investments.noMovementsTitle')}
          message={hasActiveFilters ? t('investments.noMovementsFiltered') : t('investments.emptyMessage')}
          action={
            hasActiveFilters
              ? <Button variant="outline" onClick={resetFilters}>{t('investments.clearFilters')}</Button>
              : <Button onClick={() => setAddModalOpen(true)} disabled={platforms.length === 0}>
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('investments.addFlow')}
                </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table aria-label={t('investments.movements')}>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t('investments.dateCol')}</TableHead>
                  <TableHead scope="col">{t('investments.platformCol')}</TableHead>
                  <TableHead scope="col">{t('investments.typeCol')}</TableHead>
                  <TableHead scope="col" className="text-right">{t('investments.amountCol')}</TableHead>
                  <TableHead scope="col"><span className="sr-only">{t('investments.actionsCol')}</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((f) => {
                  const p = platformById.get(f.platform_id);
                  const isDeposit = f.type === 'deposit';
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(f.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <PlatformAvatar name={p?.name ?? '—'} color={p?.color} className="h-5 w-5 rounded text-[10px]" />
                          {p?.name ?? '—'}
                        </span>
                        {f.note && <span className="block text-xs text-muted-foreground ml-7">{f.note}</span>}
                      </TableCell>
                      <TableCell>
                        <span className={isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                          {isDeposit ? t('investments.deposit') : t('investments.withdrawal')}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-mono whitespace-nowrap ${isDeposit ? '' : 'text-destructive'}`}>
                        {isDeposit ? '' : '−'}{formatCurrency(Number(f.amount), f.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditFlow(f)}
                            aria-label={t('investments.editFlow')} className="h-8 w-8">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)}
                            aria-label={t('investments.deleteFlow')}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">{t('investments.pageOf', { page, total: totalPages })}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(page - 1)}
                  disabled={page <= 1} aria-label={t('investments.prevPage')}>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages} aria-label={t('investments.nextPage')}>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}
        title={t('investments.addFlow')} description={t('investments.flowFormHint')}>
        <InvestmentFlowForm onSuccess={() => setAddModalOpen(false)} onCancel={() => setAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editFlow} onClose={() => setEditFlow(null)}
        title={t('investments.editFlow')} description={t('investments.flowFormHint')}>
        {editFlow && (
          <InvestmentFlowForm flow={editFlow} onSuccess={() => setEditFlow(null)} onCancel={() => setEditFlow(null)} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('investments.deleteFlow')}
        message={t('investments.deleteFlowMessage')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
      />
    </div>
  );
};
