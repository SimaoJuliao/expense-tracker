import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useIncomeForm } from './IncomeForm.helper';
import type { IncomeFormProps } from './IncomeForm.helper';

export const IncomeForm = (props: IncomeFormProps) => {
  const {
    form, setForm, errors, loading,
    handleSubmit,
    amountId, descId, categoryId, dateId,
    incomeCategories,
    onCancel, t,
  } = useIncomeForm(props);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={amountId}>
          {t('income.amountLabel')} <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Input
          id={amountId}
          type="number"
          step="0.01"
          min="0"
          value={form.amount || ''}
          onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
          required
          aria-required="true"
          aria-describedby={errors.amount ? `${amountId}-error` : undefined}
          aria-invalid={!!errors.amount}
          className={errors.amount ? 'border-destructive' : ''}
          placeholder={t('income.amountPlaceholder')}
        />
        {errors.amount && (
          <p id={`${amountId}-error`} role="alert" className="text-sm text-destructive">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descId}>
          {t('income.descriptionLabel')} <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Input
          id={descId}
          type="text"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
          aria-required="true"
          aria-describedby={errors.description ? `${descId}-error` : undefined}
          aria-invalid={!!errors.description}
          className={errors.description ? 'border-destructive' : ''}
          placeholder={t('income.descriptionPlaceholder')}
        />
        {errors.description && (
          <p id={`${descId}-error`} role="alert" className="text-sm text-destructive">
            {errors.description}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={categoryId}>
          {t('income.categoryLabel')} <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Select
          value={form.income_category_id}
          onValueChange={(v) => setForm((f) => ({ ...f, income_category_id: v }))}
        >
          <SelectTrigger
            id={categoryId}
            aria-describedby={errors.income_category_id ? `${categoryId}-error` : undefined}
            aria-invalid={!!errors.income_category_id}
            className={errors.income_category_id ? 'border-destructive' : ''}
          >
            <SelectValue placeholder={t('income.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.income_category_id && (
          <p id={`${categoryId}-error`} role="alert" className="text-sm text-destructive">
            {errors.income_category_id}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={dateId}>
          {t('income.dateLabel')} <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Input
          id={dateId}
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
          aria-required="true"
          aria-describedby={errors.date ? `${dateId}-error` : undefined}
          aria-invalid={!!errors.date}
          className={errors.date ? 'border-destructive' : ''}
        />
        {errors.date && (
          <p id={`${dateId}-error`} role="alert" className="text-sm text-destructive">
            {errors.date}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">* {t('common.requiredFields')}</p>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} aria-busy={loading} className="flex-1">
          {loading ? t('common.saving') : props.income ? t('common.save') : t('income.addIncome')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
};
