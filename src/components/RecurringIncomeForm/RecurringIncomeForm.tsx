import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useRecurringIncomeForm } from './RecurringIncomeForm.helper';
import type { RecurringIncomeFormProps } from './RecurringIncomeForm.helper';

export const RecurringIncomeForm = (props: RecurringIncomeFormProps) => {
  const {
    form, setForm, errors, loading,
    handleSubmit,
    amountId, descId, categoryId, dayId,
    incomeCategories,
    onCancel, t,
  } = useRecurringIncomeForm(props);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={amountId}>
          {t('recurringIncome.amountLabel')} <span aria-hidden="true" className="text-destructive">*</span>
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
          placeholder="0.00"
        />
        {errors.amount && (
          <p id={`${amountId}-error`} role="alert" className="text-sm text-destructive">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descId}>
          {t('recurringIncome.descriptionLabel')} <span aria-hidden="true" className="text-destructive">*</span>
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
          placeholder="e.g. Monthly salary"
        />
        {errors.description && (
          <p id={`${descId}-error`} role="alert" className="text-sm text-destructive">
            {errors.description}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={categoryId}>
          {t('recurringIncome.categoryLabel')} <span aria-hidden="true" className="text-destructive">*</span>
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
        <Label htmlFor={dayId}>
          {t('recurringIncome.dayLabel')} <span aria-hidden="true" className="text-destructive">*</span>
        </Label>
        <Input
          id={dayId}
          type="number"
          min="1"
          max="28"
          value={form.day_of_month}
          onChange={(e) => setForm((f) => ({ ...f, day_of_month: parseInt(e.target.value) || 1 }))}
          required
          aria-required="true"
          aria-describedby={`${dayId}-hint${errors.day_of_month ? ` ${dayId}-error` : ''}`}
          aria-invalid={!!errors.day_of_month}
          className={errors.day_of_month ? 'border-destructive' : ''}
        />
        <p id={`${dayId}-hint`} className="text-xs text-muted-foreground">
          {t('recurringIncome.dayHint')}
        </p>
        {errors.day_of_month && (
          <p id={`${dayId}-error`} role="alert" className="text-sm text-destructive">
            {errors.day_of_month}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">* {t('common.requiredFields')}</p>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} aria-busy={loading} className="flex-1">
          {loading
            ? t('common.saving')
            : props.recurringIncome
            ? t('common.save')
            : t('recurringIncome.addRecurring')}
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
