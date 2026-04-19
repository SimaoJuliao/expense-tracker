import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useRecurringExpenseStore } from '../../store/useRecurringExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTranslation } from '../../i18n';
import type { Expense, RecurringExpense } from '../../types';

export interface ExpenseFormProps {
  mode?: 'expense' | 'recurring';
  expense?: Expense;
  recurringExpense?: RecurringExpense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useExpenseForm = ({ mode = 'expense', expense, recurringExpense, onSuccess, onCancel }: ExpenseFormProps) => {
  const navigate = useNavigate();
  const addExpense    = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const expenseLoading = useExpenseStore((s) => s.loading);
  const { addRecurring, updateRecurring, loading: recurringLoading } = useRecurringExpenseStore();
  const categories = useCategoryStore((s) => s.categories);
  const { t } = useTranslation();

  const uid = useId();
  const isRecurring = mode === 'recurring';
  const loading     = isRecurring ? recurringLoading : expenseLoading;
  const editing     = isRecurring ? recurringExpense : expense;

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    amount:       editing?.amount ?? 0,
    description:  editing?.description ?? '',
    category_id:  editing?.category_id ?? (categories[0]?.id ?? ''),
    date:         expense?.date ?? today,
    day_of_month: recurringExpense?.day_of_month ?? 1,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!form.amount || form.amount <= 0) e.amount = t('expenses.amountError');
    if (!form.description.trim()) e.description = t('expenses.descriptionError');
    if (!form.category_id) e.category_id = t('expenses.categoryError');
    if (isRecurring) {
      if (form.day_of_month < 1 || form.day_of_month > 28) e.day_of_month = t('recurring.dayError');
    } else {
      if (!form.date) e.date = t('expenses.dateError');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (isRecurring) {
        const data = {
          description:  form.description.trim(),
          amount:       form.amount,
          category_id:  form.category_id,
          day_of_month: form.day_of_month,
          active:       recurringExpense?.active ?? true,
        };
        if (recurringExpense) {
          await updateRecurring(recurringExpense.id, data);
          toast.success(t('recurring.updateSuccess'));
        } else {
          await addRecurring(data);
          toast.success(t('recurring.addSuccess'));
        }
      } else {
        const data = {
          amount:      form.amount,
          description: form.description.trim(),
          category_id: form.category_id,
          date:        form.date,
        };
        if (expense) {
          await updateExpense(expense.id, data);
          toast.success(t('expenses.updateSuccess'));
        } else {
          await addExpense(data);
          toast.success(t('expenses.addSuccess'));
        }
      }
      onSuccess ? onSuccess() : navigate('/expenses');
    } catch {
      toast.error(t('expenses.saveFailed'));
    }
  };

  return {
    form, setForm,
    errors, setErrors,
    loading,
    handleSubmit,
    uid,
    amountId:  `${uid}-amount`,
    descId:    `${uid}-description`,
    dateId:    `${uid}-date`,
    dayId:     `${uid}-day`,
    isRecurring, editing,
    categories,
    navigate,
    onCancel,
    t,
  };
};
