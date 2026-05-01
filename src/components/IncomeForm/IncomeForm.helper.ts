import { useState, useId } from 'react';
import { toast } from 'sonner';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useTranslation } from '../../i18n';
import type { Income } from '../../types';

export interface IncomeFormProps {
  income?: Income;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useIncomeForm = ({ income, onSuccess, onCancel }: IncomeFormProps) => {
  const addIncome    = useIncomeStore((s) => s.addIncome);
  const updateIncome = useIncomeStore((s) => s.updateIncome);
  const loading      = useIncomeStore((s) => s.loading);
  const incomeCategories = useIncomeCategoryStore((s) => s.incomeCategories);
  const { t } = useTranslation();

  const uid = useId();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    amount:             income?.amount ?? 0,
    description:        income?.description ?? '',
    income_category_id: income?.income_category_id ?? (incomeCategories[0]?.id ?? ''),
    date:               income?.date ?? today,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!form.amount || form.amount <= 0) e.amount = t('income.amountError');
    if (!form.description.trim()) e.description = t('income.descriptionError');
    if (!form.income_category_id) e.income_category_id = t('income.categoryError');
    if (!form.date) e.date = t('income.dateError');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const data = {
        amount:             form.amount,
        description:        form.description.trim(),
        income_category_id: form.income_category_id,
        date:               form.date,
      };
      if (income) {
        await updateIncome(income.id, data);
        toast.success(t('income.updateSuccess'));
      } else {
        await addIncome(data);
        toast.success(t('income.addSuccess'));
      }
      onSuccess?.();
    } catch {
      toast.error(t('income.saveFailed'));
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
    dateId:     `${uid}-date`,
    incomeCategories,
    onCancel,
    t,
  };
};
