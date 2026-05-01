import { useState, useId } from 'react';
import { toast } from 'sonner';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useTranslation } from '../../i18n';
import type { RecurringIncome } from '../../types';

export interface RecurringIncomeFormProps {
  recurringIncome?: RecurringIncome;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useRecurringIncomeForm = ({ recurringIncome, onSuccess, onCancel }: RecurringIncomeFormProps) => {
  const { addRecurring, updateRecurring, loading } = useRecurringIncomeStore();
  const incomeCategories = useIncomeCategoryStore((s) => s.incomeCategories);
  const { t } = useTranslation();

  const uid = useId();

  const [form, setForm] = useState({
    amount:             recurringIncome?.amount ?? 0,
    description:        recurringIncome?.description ?? '',
    income_category_id: recurringIncome?.income_category_id ?? (incomeCategories[0]?.id ?? ''),
    day_of_month:       recurringIncome?.day_of_month ?? 1,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!form.amount || form.amount <= 0) e.amount = t('income.amountError');
    if (!form.description.trim()) e.description = t('income.descriptionError');
    if (!form.income_category_id) e.income_category_id = t('income.categoryError');
    if (form.day_of_month < 1 || form.day_of_month > 28) e.day_of_month = t('recurringIncome.dayError');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const data = {
        description:        form.description.trim(),
        amount:             form.amount,
        income_category_id: form.income_category_id,
        day_of_month:       form.day_of_month,
        active:             recurringIncome?.active ?? true,
      };
      if (recurringIncome) {
        await updateRecurring(recurringIncome.id, data);
        toast.success(t('recurringIncome.updateSuccess'));
      } else {
        await addRecurring(data);
        toast.success(t('recurringIncome.addSuccess'));
      }
      onSuccess?.();
    } catch {
      toast.error(recurringIncome ? t('recurringIncome.updateFailed') : t('recurringIncome.addFailed'));
    }
  };

  return {
    form, setForm,
    errors,
    loading,
    handleSubmit,
    uid,
    amountId:   `${uid}-amount`,
    descId:     `${uid}-description`,
    categoryId: `${uid}-category`,
    dayId:      `${uid}-day`,
    incomeCategories,
    onCancel,
    t,
  };
};
