import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRecurringExpenseStore } from '../../store/useRecurringExpenseStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTranslation } from '../../i18n';
import type { RecurringExpense } from '../../types';

export const useRecurringExpensesPage = () => {
  const { recurring, loading, fetchRecurring, deleteRecurring, toggleActive } = useRecurringExpenseStore();
  const { fetchCategories } = useCategoryStore();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen]   = useState(false);
  const [editing,   setEditing]     = useState<RecurringExpense | null>(null);
  const [deleteId,  setDeleteId]    = useState<string | null>(null);
  const [deleting,  setDeleting]    = useState(false);

  useEffect(() => {
    fetchRecurring();
    fetchCategories();
  }, [fetchRecurring, fetchCategories]);

  const openAdd = () => { setEditing(null); setModalOpen(true); };

  const openEdit = (r: RecurringExpense) => { setEditing(r); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteRecurring(deleteId);
      toast.success(t('recurring.deleteSuccess'));
    } catch {
      toast.error(t('recurring.deleteFailed'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggle = async (r: RecurringExpense) => {
    try {
      await toggleActive(r.id, !r.active);
    } catch {
      toast.error(t('recurring.toggleFailed'));
    }
  };

  return {
    recurring, loading,
    modalOpen, setModalOpen,
    editing,
    deleteId, setDeleteId,
    deleting,
    openAdd, openEdit,
    handleDelete, handleToggle,
    t,
  };
};
