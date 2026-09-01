import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal } from '../../components/Modal';
import { PlatformAvatar } from '../../components/PlatformAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useInvestmentPlatformsPage, PLATFORM_COLORS } from './InvestmentPlatformsPage.helper';

export const InvestmentPlatformsPage = () => {
  const {
    platforms,
    modalOpen, setModalOpen, form, setForm, openAdd, openEdit, submit, submitting,
    deleteId, setDeleteId, confirmDelete,
    t,
  } = useInvestmentPlatformsPage();

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('investments.platforms')}</h1>
          <p className="text-muted-foreground mt-1">{t('investments.platformsHint')}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('investments.newPlatform')}
        </Button>
      </header>

      {platforms.length === 0 ? (
        <EmptyState
          icon="🏦"
          title={t('investments.noPlatformsTitle')}
          message={t('investments.noPlatformsMessage')}
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('investments.newPlatform')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {platforms.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4 flex items-center gap-3">
                <PlatformAvatar name={p.name} color={p.color} className="h-10 w-10 rounded-xl text-base" />
                <span className="font-semibold flex-1 min-w-0 truncate">{p.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}
                    aria-label={t('investments.editPlatform')} className="h-8 w-8">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}
                    aria-label={t('investments.deletePlatform')}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={form.id ? t('investments.editPlatform') : t('investments.newPlatform')}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="platform-name">{t('investments.platformName')}</Label>
            <Input id="platform-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('investments.newPlatformPlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('investments.color')}</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('investments.color')}>
              {PLATFORM_COLORS.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={form.color === c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn('h-8 w-8 rounded-full flex items-center justify-center transition-transform',
                    form.color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : '')}
                  style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 0 2px ${c}` : undefined }}>
                  {form.color === c && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
                  <span className="sr-only">{c}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? t('common.processing') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('investments.deletePlatform')}
        message={t('investments.deletePlatformMessage')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
      />
    </div>
  );
};
