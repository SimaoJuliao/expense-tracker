import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTranslation } from '../../i18n';
import type { Category, NewCategory } from '../../types';

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

export const useCategoriesPage = () => {
  const { categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory, getExpenseCountForCategory } =
    useCategoryStore();
  const { t } = useTranslation();

  const emptyForm: CategoryFormData = { name: '', icon: '', color: '#3b82f6' };

  const [showAddModal,       setShowAddModal]       = useState(false);
  const [editCategory,       setEditCategory]       = useState<Category | null>(null);
  const [deleteId,           setDeleteId]           = useState<string | null>(null);
  const [deleteExpenseCount, setDeleteExpenseCount] = useState(0);
  const [deleting,           setDeleting]           = useState(false);
  const [submitting,         setSubmitting]         = useState(false);
  const [formData,           setFormData]           = useState<CategoryFormData>(emptyForm);
  const [formErrors,         setFormErrors]         = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const validateForm = (): boolean => {
    const e: Partial<Record<keyof CategoryFormData, string>> = {};
    if (!formData.name.trim()) e.name = t('categories.nameRequired');
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const cat: NewCategory = { name: formData.name.trim(), icon: formData.icon || null, color: formData.color || null };
      await addCategory(cat);
      toast.success(t('categories.addSuccess'));
      setShowAddModal(false);
      setFormData(emptyForm);
    } catch { toast.error(t('categories.addFailed')); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editCategory || !validateForm()) return;
    setSubmitting(true);
    try {
      await updateCategory(editCategory.id, { name: formData.name.trim(), icon: formData.icon || null, color: formData.color || null });
      toast.success(t('categories.updateSuccess'));
      setEditCategory(null);
    } catch { toast.error(t('categories.updateFailed')); }
    finally { setSubmitting(false); }
  };

  const handleDeleteClick = async (id: string) => {
    const count = await getExpenseCountForCategory(id);
    setDeleteExpenseCount(count);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      toast.success(t('categories.deleteSuccess'));
    } catch { toast.error(t('categories.deleteFailed')); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormData({ name: cat.name, icon: cat.icon ?? '', color: cat.color ?? '#3b82f6' });
    setFormErrors({});
  };

  const openAdd = () => { setFormData(emptyForm); setFormErrors({}); setShowAddModal(true); };

  return {
    categories, loading,
    showAddModal, setShowAddModal,
    editCategory, setEditCategory,
    deleteId, setDeleteId,
    deleteExpenseCount,
    deleting, submitting,
    formData, setFormData,
    formErrors,
    handleAdd, handleEdit,
    handleDeleteClick, handleDeleteConfirm,
    openEdit, openAdd,
    t,
  };
};
