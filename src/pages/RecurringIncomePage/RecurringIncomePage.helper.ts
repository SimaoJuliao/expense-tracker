import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useTranslation } from '../../i18n';
import type { RecurringIncome } from '../../types';

export const useRecurringIncomePage = () => {
  const { recurring, loading, fetchRecurring, deleteRecurring, toggleActive } = useRecurringIncomeStore();
  const { fetchIncomeCategories } = useIncomeCategoryStore();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<RecurringIncome | null>(null);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    fetchRecurring();
    fetchIncomeCategories();
  }, [fetchRecurring, fetchIncomeCategories]);

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r: RecurringIncome) => { setEditing(r); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteRecurring(deleteId);
      toast.success(t('recurringIncome.deleteSuccess'));
    } catch {
      toast.error(t('recurringIncome.deleteFailed'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggle = async (r: RecurringIncome) => {
    try {
      await toggleActive(r.id, !r.active);
    } catch {
      toast.error(t('recurringIncome.toggleFailed'));
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
