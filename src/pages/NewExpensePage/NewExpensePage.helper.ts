import { useEffect } from 'react';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTranslation } from '../../i18n';

export const useNewExpensePage = () => {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const { t } = useTranslation();

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return { categories, loading, t };
};
