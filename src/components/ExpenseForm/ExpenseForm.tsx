import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useExpenseForm } from './ExpenseForm.helper';
import type { ExpenseFormProps } from './ExpenseForm.helper';

export const ExpenseForm = (props: ExpenseFormProps) => {
  const {
    form, setForm, errors, setErrors, loading,
    handleSubmit, uid, amountId, descId, dateId, dayId,
    isRecurring, editing, categories, navigate, onCancel, t,
  } = useExpenseForm(props);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={editing
        ? (isRecurring ? t('recurring.editRecurring') : t('expenses.editExpense'))
        : (isRecurring ? t('recurring.addRecurring') : t('expenses.addExpense'))
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={amountId}>
            {isRecurring ? t('recurring.amountLabel') : t('expenses.amountLabel')}{' '}
            <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>
          </Label>
          <Input
            id={amountId}
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount || ''}
            onChange={(e) => {
              setForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }));
              if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }));
            }}
            required
            aria-required="true"
            aria-invalid={!!errors.amount}
            className={errors.amount ? 'border-destructive' : ''}
            placeholder={t('expenses.amountPlaceholder')}
          />
          {errors.amount && <p role="alert" className="text-sm text-destructive">{errors.amount}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={descId}>
            {t('expenses.descriptionLabel')}{' '}
            <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>
          </Label>
          <Input
            id={descId}
            type="text"
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              if (errors.description) setErrors((p) => ({ ...p, description: undefined }));
            }}
            required
            aria-required="true"
            aria-invalid={!!errors.description}
            className={errors.description ? 'border-destructive' : ''}
            placeholder={t('expenses.descriptionPlaceholder')}
          />
          {errors.description && <p role="alert" className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-category`}>
            {t('expenses.categoryLabel')}{' '}
            <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>
          </Label>
          <Select
            value={form.category_id}
            onValueChange={(val) => {
              setForm((p) => ({ ...p, category_id: val }));
              if (errors.category_id) setErrors((p) => ({ ...p, category_id: undefined }));
            }}
          >
            <SelectTrigger
              id={`${uid}-category`}
              aria-required="true"
              aria-invalid={!!errors.category_id}
              className={errors.category_id ? 'border-destructive' : ''}
            >
              <SelectValue placeholder={t('expenses.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p role="alert" className="text-sm text-destructive">{errors.category_id}</p>}
        </div>

        {isRecurring ? (
          <div className="space-y-1.5">
            <Label htmlFor={dayId}>
              {t('recurring.dayLabel')}{' '}
              <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>
            </Label>
            <Input
              id={dayId}
              type="number"
              min="1"
              max="28"
              value={form.day_of_month}
              onChange={(e) => {
                setForm((p) => ({ ...p, day_of_month: parseInt(e.target.value) || 1 }));
                if (errors.day_of_month) setErrors((p) => ({ ...p, day_of_month: undefined }));
              }}
              required
              aria-required="true"
              aria-invalid={!!errors.day_of_month}
              className={errors.day_of_month ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">{t('recurring.dayHint')}</p>
            {errors.day_of_month && <p role="alert" className="text-sm text-destructive">{errors.day_of_month}</p>}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor={dateId}>
              {t('expenses.dateLabel')}{' '}
              <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>
            </Label>
            <Input
              id={dateId}
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm((p) => ({ ...p, date: e.target.value }));
                if (errors.date) setErrors((p) => ({ ...p, date: undefined }));
              }}
              required
              aria-required="true"
              aria-invalid={!!errors.date}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && <p role="alert" className="text-sm text-destructive">{errors.date}</p>}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          <span aria-hidden="true" className="text-destructive">{t('common.requiredMark')}</span>{' '}
          {t('common.requiredFields')}
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={loading} aria-busy={loading} className="flex-1">
          {loading
            ? t('common.saving')
            : editing
            ? t('common.save')
            : isRecurring
            ? t('recurring.addRecurring')
            : t('expenses.addExpense')}
        </Button>
        {(onCancel || !editing) && (
          <Button type="button" variant="outline" onClick={onCancel ?? (() => navigate('/expenses'))}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
};
