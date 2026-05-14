import { useId, useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategoriesPage, PRESET_COLORS } from './CategoriesPage.helper';
import type { CategoryFormData } from './CategoriesPage.helper';
import type { GroupMember } from '../../types';

const CategoryFormFields = ({
  data,
  onChange,
  errors,
}: {
  data: CategoryFormData;
  onChange: (updates: Partial<CategoryFormData>) => void;
  errors: Partial<Record<keyof CategoryFormData, string>>;
}) => {
  const uid = useId();
  const nameId = `${uid}-name`;
  const iconId = `${uid}-icon`;
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>
          {t('categories.nameLabel')} <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>
        </Label>
        <Input
          id={nameId}
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
          aria-required="true"
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          aria-invalid={!!errors.name}
          className={errors.name ? 'border-destructive' : ''}
          placeholder={t('categories.namePlaceholder')}
        />
        {errors.name && (
          <p id={`${nameId}-error`} role="alert" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={iconId}>
          {t('categories.iconLabel')} <span className="text-muted-foreground font-normal">{t('common.optional')}</span>
        </Label>
        <Input
          id={iconId}
          type="text"
          value={data.icon}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder={t('categories.iconPlaceholder')}
          maxLength={4}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">
          {t('categories.colorLabel')} <span className="text-muted-foreground font-normal">{t('common.optional')}</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('categories.colorAriaLabel')}>
          {PRESET_COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="category-color"
                value={color}
                checked={data.color === color}
                onChange={() => onChange({ color })}
                className="sr-only"
              />
              <span
                className="block w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: color,
                  borderColor: data.color === color ? '#1e293b' : 'transparent',
                  boxShadow: data.color === color ? '0 0 0 2px white, 0 0 0 4px #1e293b' : 'none',
                }}
                aria-hidden="true"
              />
              <span className="sr-only">{t('categories.colorValue', { value: color })}</span>
            </label>
          ))}
          <label className="cursor-pointer flex items-center">
            <input
              type="color"
              value={data.color || '#6b7280'}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-8 h-8 rounded-full cursor-pointer border border-input"
              aria-label={t('categories.customColorLabel')}
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
};

interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  user_id: string;
  created_at: string;
}

const MEMBER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CategoryCard = ({
  cat,
  totalCount,
  onEdit,
  onDelete,
  editAriaLabel,
  deleteAriaLabel,
  cannotDeleteLastMsg,
  members,
  splits,
  onSplitChange,
}: {
  cat: CategoryItem;
  totalCount: number;
  onEdit: (item: CategoryItem) => void;
  onDelete: (id: string) => void;
  editAriaLabel: string;
  deleteAriaLabel: string;
  cannotDeleteLastMsg: string;
  members?: GroupMember[];
  splits?: Record<string, number>;
  onSplitChange?: (memberId: string, value: number) => void;
}) => {
  const { t } = useTranslation();
  const showSplits = members && members.length > 0 && splits !== undefined && onSplitChange;
  const total = showSplits ? Object.values(splits).reduce((s, v) => s + v, 0) : 100;
  const invalid = showSplits && Math.abs(total - 100) > 0.5;

  return (
    <Card>
      <CardContent className="py-3 px-4">
        {/* ── Category row ── */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: cat.color ? `${cat.color}25` : 'hsl(var(--muted))' }}
            aria-hidden="true"
          >
            {cat.icon ? (
              <span role="img" aria-label={cat.name}>{cat.icon}</span>
            ) : (
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color ?? 'hsl(var(--muted-foreground))' }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{cat.name}</p>
            {cat.color && (
              <Badge variant="outline" className="text-xs mt-0.5" style={{ borderColor: cat.color, color: cat.color }}>
                {cat.color}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(cat)}
              aria-label={editAriaLabel}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(cat.id)}
              disabled={totalCount <= 1}
              aria-label={deleteAriaLabel}
              aria-disabled={totalCount <= 1}
              title={totalCount <= 1 ? cannotDeleteLastMsg : undefined}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* ── Inline splits (group accounts only) ── */}
        {showSplits && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {members.map((m, idx) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: MEMBER_COLORS[idx % MEMBER_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{m.name}</span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={splits[m.id] ?? 0}
                      onChange={(e) => onSplitChange(m.id, parseFloat(e.target.value) || 0)}
                      className={`w-16 h-7 rounded-md border px-2 pr-5 text-right text-xs bg-background focus:outline-none focus:ring-2 focus:ring-ring ${invalid ? 'border-destructive' : 'border-input'}`}
                      aria-label={`${m.name} share for ${cat.name}`}
                    />
                    <span className="absolute right-1.5 text-xs text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
              ))}
              <span className={`ml-auto text-xs font-medium tabular-nums ${invalid ? 'text-destructive' : 'text-muted-foreground'}`}>
                {t('group.totalLabel')}: {Math.round(total)}%
              </span>
            </div>

            {/* Visual split bar */}
            <div
              className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden flex bg-muted"
              role="img"
              aria-label={`Split distribution for ${cat.name}`}
            >
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  style={{
                    width: `${Math.min(splits[m.id] ?? 0, 100)}%`,
                    backgroundColor: MEMBER_COLORS[idx % MEMBER_COLORS.length],
                    transition: 'width 150ms ease',
                  }}
                />
              ))}
            </div>

            {invalid && (
              <p className="text-xs text-destructive mt-1.5">{t('group.splitsError')}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CategoryList = ({
  items,
  totalCount,
  onEdit,
  onDelete,
  editAriaLabel,
  deleteAriaLabel,
  cannotDeleteLastMsg,
  members,
  splits,
  onSplitChange,
}: {
  items: CategoryItem[];
  totalCount: number;
  onEdit: (item: CategoryItem) => void;
  onDelete: (id: string) => void;
  editAriaLabel: (name: string) => string;
  deleteAriaLabel: (name: string) => string;
  cannotDeleteLastMsg: string;
  members?: GroupMember[];
  splits?: Record<string, Record<string, number>>;
  onSplitChange?: (categoryId: string, memberId: string, value: number) => void;
}) => (
  <ul role="list" className="space-y-2">
    {items.map((cat) => (
      <li key={cat.id}>
        <CategoryCard
          cat={cat}
          totalCount={totalCount}
          onEdit={onEdit}
          onDelete={onDelete}
          editAriaLabel={editAriaLabel(cat.name)}
          deleteAriaLabel={deleteAriaLabel(cat.name)}
          cannotDeleteLastMsg={cannotDeleteLastMsg}
          members={members}
          splits={splits?.[cat.id]}
          onSplitChange={onSplitChange ? (memberId, value) => onSplitChange(cat.id, memberId, value) : undefined}
        />
      </li>
    ))}
  </ul>
);

export const CategoriesPage = () => {
  const {
    categories, loading, t,
    showAddModal, setShowAddModal, editCategory, setEditCategory,
    deleteId, setDeleteId, deleteExpenseCount, deleting, submitting,
    formData, setFormData, formErrors,
    handleAdd, handleEdit, handleDeleteClick, handleDeleteConfirm, openEdit, openAdd,
    incomeCategories,
    showIncomeAddModal, setShowIncomeAddModal, editIncomeCategory, setEditIncomeCategory,
    incomeDeleteId, setIncomeDeleteId, incomeDeleteCount, incomeDeleting, incomeSubmitting,
    incomeFormData, setIncomeFormData, incomeFormErrors,
    handleIncomeAdd, handleIncomeEdit, handleIncomeDeleteClick, handleIncomeDeleteConfirm,
    openIncomeEdit, openIncomeAdd,
    isGroupAccount, members, localSplits, setSplitValue, handleSaveSplits, savingSplits,
  } = useCategoriesPage();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  if (loading && categories.length === 0 && incomeCategories.length === 0) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" label={t('categories.loading')} /></div>;
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('categories.subtitle')}</p>
      </header>

      {/* ── Tab bar ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex rounded-lg border border-border bg-muted/40 p-1">
          <button
            onClick={() => setActiveTab('expense')}
            aria-selected={activeTab === 'expense'}
            role="tab"
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'expense'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('categories.expenseCategoriesHeading')}
          </button>
          <button
            onClick={() => setActiveTab('income')}
            aria-selected={activeTab === 'income'}
            role="tab"
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'income'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('categories.incomeCategoriesHeading')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'expense' && isGroupAccount && categories.length > 0 && members.length > 0 && (
            <Button onClick={handleSaveSplits} disabled={savingSplits} variant="outline" size="sm" className="gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              {savingSplits ? t('group.savingSplits') : t('group.saveSplits')}
            </Button>
          )}
          <Button onClick={activeTab === 'expense' ? openAdd : openIncomeAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {activeTab === 'expense' ? t('categories.addCategory') : t('incomeCategories.addCategory')}
          </Button>
        </div>
      </div>

      {/* ── Expense tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'expense' && (
        <section aria-label={t('categories.expenseCategoriesHeading')}>
          {isGroupAccount && members.length > 0 && categories.length > 0 && (
            <p className="text-sm text-muted-foreground mb-3">{t('group.splitsSubtitle')}</p>
          )}
          {categories.length === 0 ? (
            <EmptyState
              icon="📁"
              title={t('categories.noTitle')}
              message={t('categories.noMessage')}
              action={
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('categories.addCategory')}
                </Button>
              }
            />
          ) : (
            <CategoryList
              items={categories}
              totalCount={categories.length}
              onEdit={openEdit}
              onDelete={handleDeleteClick}
              editAriaLabel={(name) => t('categories.editAriaLabel', { name })}
              deleteAriaLabel={(name) => t('categories.deleteAriaLabel', { name })}
              cannotDeleteLastMsg={t('categories.cannotDeleteLast')}
              members={isGroupAccount ? members : undefined}
              splits={isGroupAccount ? localSplits : undefined}
              onSplitChange={isGroupAccount ? setSplitValue : undefined}
            />
          )}
        </section>
      )}

      {/* ── Income tab ────────────────────────────────────────────────────────── */}
      {activeTab === 'income' && (
        <section aria-label={t('categories.incomeCategoriesHeading')}>
          {incomeCategories.length === 0 ? (
            <EmptyState
              icon="💼"
              title={t('incomeCategories.noTitle')}
              message={t('incomeCategories.noMessage')}
              action={
                <Button onClick={openIncomeAdd}>
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('incomeCategories.addCategory')}
                </Button>
              }
            />
          ) : (
            <CategoryList
              items={incomeCategories}
              totalCount={incomeCategories.length}
              onEdit={openIncomeEdit}
              onDelete={handleIncomeDeleteClick}
              editAriaLabel={(name) => t('incomeCategories.editAriaLabel', { name })}
              deleteAriaLabel={(name) => t('incomeCategories.deleteAriaLabel', { name })}
              cannotDeleteLastMsg={t('incomeCategories.cannotDeleteLast')}
            />
          )}
        </section>
      )}

      {/* ── Expense category modals ───────────────────────────────────────────── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('categories.addCategory')} description={t('categories.addDescription')}>
        <form onSubmit={handleAdd} noValidate>
          <CategoryFormFields data={formData} onChange={(u) => setFormData((p) => ({ ...p, ...u }))} errors={formErrors} />
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={submitting} aria-busy={submitting} className="flex-1">
              {submitting ? t('categories.adding') : t('categories.addCategory')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editCategory} onClose={() => setEditCategory(null)} title={t('categories.editCategory')} description={t('categories.editDescription')}>
        <form onSubmit={handleEdit} noValidate>
          <CategoryFormFields data={formData} onChange={(u) => setFormData((p) => ({ ...p, ...u }))} errors={formErrors} />
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={submitting} aria-busy={submitting} className="flex-1">
              {submitting ? t('categories.saving') : t('categories.saveChanges')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditCategory(null)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteExpenseCount > 0 ? () => setDeleteId(null) : handleDeleteConfirm}
        title={deleteExpenseCount > 0 ? t('categories.deleteBlockedTitle') : t('categories.deleteTitle')}
        message={
          deleteExpenseCount > 0
            ? t('categories.deleteBlockedMessage', { count: deleteExpenseCount })
            : t('categories.deleteMessage')
        }
        confirmLabel={deleteExpenseCount > 0 ? 'OK' : t('common.delete')}
        confirmVariant={deleteExpenseCount > 0 ? 'primary' : 'danger'}
        loading={deleting}
      />

      {/* ── Income category modals ────────────────────────────────────────────── */}
      <Modal isOpen={showIncomeAddModal} onClose={() => setShowIncomeAddModal(false)} title={t('incomeCategories.addCategory')} description={t('incomeCategories.addDescription')}>
        <form onSubmit={handleIncomeAdd} noValidate>
          <CategoryFormFields data={incomeFormData} onChange={(u) => setIncomeFormData((p) => ({ ...p, ...u }))} errors={incomeFormErrors} />
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={incomeSubmitting} aria-busy={incomeSubmitting} className="flex-1">
              {incomeSubmitting ? t('incomeCategories.adding') : t('incomeCategories.addCategory')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowIncomeAddModal(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editIncomeCategory} onClose={() => setEditIncomeCategory(null)} title={t('incomeCategories.editCategory')} description={t('incomeCategories.editDescription')}>
        <form onSubmit={handleIncomeEdit} noValidate>
          <CategoryFormFields data={incomeFormData} onChange={(u) => setIncomeFormData((p) => ({ ...p, ...u }))} errors={incomeFormErrors} />
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={incomeSubmitting} aria-busy={incomeSubmitting} className="flex-1">
              {incomeSubmitting ? t('incomeCategories.saving') : t('incomeCategories.saveChanges')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditIncomeCategory(null)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!incomeDeleteId}
        onClose={() => setIncomeDeleteId(null)}
        onConfirm={incomeDeleteCount > 0 ? () => setIncomeDeleteId(null) : handleIncomeDeleteConfirm}
        title={incomeDeleteCount > 0 ? t('incomeCategories.deleteBlockedTitle') : t('incomeCategories.deleteTitle')}
        message={
          incomeDeleteCount > 0
            ? t('incomeCategories.deleteBlockedMessage', { count: incomeDeleteCount })
            : t('incomeCategories.deleteMessage')
        }
        confirmLabel={incomeDeleteCount > 0 ? 'OK' : t('common.delete')}
        confirmVariant={incomeDeleteCount > 0 ? 'primary' : 'danger'}
        loading={incomeDeleting}
      />
    </div>
  );
};
