import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useGroupStore } from '../../store/useGroupStore';
import { useTranslation } from '../../i18n';
import type { Category, IncomeCategory, NewCategory, NewIncomeCategory } from '../../types';

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

const emptyForm: CategoryFormData = { name: '', icon: '', color: '#3b82f6' };

export const useCategoriesPage = () => {
  const {
    categories, loading: expLoading,
    fetchCategories, addCategory, updateCategory, deleteCategory, getExpenseCountForCategory,
  } = useCategoryStore();
  const {
    incomeCategories, loading: incLoading,
    fetchIncomeCategories, addIncomeCategory, updateIncomeCategory, deleteIncomeCategory, getIncomeCountForCategory,
  } = useIncomeCategoryStore();
  const { accountType, members, splits, saveSplits } = useGroupStore();
  const { t } = useTranslation();

  const loading = expLoading || incLoading;
  const isGroupAccount = accountType === 'group';

  // ── Expense category state ───────────────────────────────────────────────────
  const [showAddModal,       setShowAddModal]       = useState(false);
  const [editCategory,       setEditCategory]       = useState<Category | null>(null);
  const [deleteId,           setDeleteId]           = useState<string | null>(null);
  const [deleteExpenseCount, setDeleteExpenseCount] = useState(0);
  const [deleting,           setDeleting]           = useState(false);
  const [submitting,         setSubmitting]         = useState(false);
  const [formData,           setFormData]           = useState<CategoryFormData>(emptyForm);
  const [formErrors,         setFormErrors]         = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  // ── Income category state ────────────────────────────────────────────────────
  const [showIncomeAddModal,    setShowIncomeAddModal]    = useState(false);
  const [editIncomeCategory,    setEditIncomeCategory]    = useState<IncomeCategory | null>(null);
  const [incomeDeleteId,        setIncomeDeleteId]        = useState<string | null>(null);
  const [incomeDeleteCount,     setIncomeDeleteCount]     = useState(0);
  const [incomeDeleting,        setIncomeDeleting]        = useState(false);
  const [incomeSubmitting,      setIncomeSubmitting]      = useState(false);
  const [incomeFormData,        setIncomeFormData]        = useState<CategoryFormData>(emptyForm);
  const [incomeFormErrors,      setIncomeFormErrors]      = useState<Partial<Record<keyof CategoryFormData, string>>>({});

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchIncomeCategories(); }, [fetchIncomeCategories]);

  // ── Splits state ─────────────────────────────────────────────────────────────
  type SplitsMap = Record<string, Record<string, number>>;

  const defaultSplits = useMemo<SplitsMap>(() => {
    const map: SplitsMap = {};
    const equalPct = members.length > 0 ? parseFloat((100 / members.length).toFixed(2)) : 0;
    for (const cat of categories) {
      map[cat.id] = {};
      for (const m of members) {
        const stored = splits.find((s) => s.category_id === cat.id && s.member_id === m.id);
        map[cat.id][m.id] = stored ? stored.percentage : equalPct;
      }
    }
    return map;
  }, [categories, members, splits]);

  const [localSplits, setLocalSplits] = useState<SplitsMap>({});
  const [savingSplits, setSavingSplits] = useState(false);

  useEffect(() => {
    setLocalSplits(defaultSplits);
  }, [defaultSplits]);

  const setSplitValue = (categoryId: string, memberId: string, value: number) => {
    setLocalSplits((prev) => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] ?? {}), [memberId]: value },
    }));
  };

  const handleSaveSplits = async () => {
    for (const cat of categories) {
      const catSplits = localSplits[cat.id] ?? {};
      const total = Object.values(catSplits).reduce((s, v) => s + v, 0);
      if (Math.abs(total - 100) > 0.5) {
        toast.error(t('group.splitsError'));
        return;
      }
    }
    setSavingSplits(true);
    try {
      const rows = categories.flatMap((cat) =>
        members.map((m) => ({
          category_id: cat.id,
          member_id: m.id,
          percentage: localSplits[cat.id]?.[m.id] ?? 0,
        }))
      );
      await saveSplits(rows);
      toast.success(t('group.splitsSuccess'));
    } catch {
      toast.error(t('group.splitsFailed'));
    } finally {
      setSavingSplits(false);
    }
  };

  // ── Expense category handlers ────────────────────────────────────────────────
  const validateForm = (data: CategoryFormData, setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof CategoryFormData, string>>>>): boolean => {
    const e: Partial<Record<keyof CategoryFormData, string>> = {};
    if (!data.name.trim()) e.name = t('categories.nameRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm(formData, setFormErrors)) return;
    setSubmitting(true);
    try {
      const cat: NewCategory = { name: formData.name.trim(), icon: formData.icon || null, color: formData.color || null };
      await addCategory(cat);
      toast.success(t('categories.addSuccess'));
      setShowAddModal(false);
      setFormData(emptyForm);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      console.error('addCategory error:', err);
      toast.error(msg || t('categories.addFailed'));
    }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editCategory || !validateForm(formData, setFormErrors)) return;
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

  // ── Income category handlers ─────────────────────────────────────────────────
  const handleIncomeAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm(incomeFormData, setIncomeFormErrors)) return;
    setIncomeSubmitting(true);
    try {
      const cat: NewIncomeCategory = { name: incomeFormData.name.trim(), icon: incomeFormData.icon || null, color: incomeFormData.color || null };
      await addIncomeCategory(cat);
      toast.success(t('incomeCategories.addSuccess'));
      setShowIncomeAddModal(false);
      setIncomeFormData(emptyForm);
    } catch { toast.error(t('incomeCategories.addFailed')); }
    finally { setIncomeSubmitting(false); }
  };

  const handleIncomeEdit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editIncomeCategory || !validateForm(incomeFormData, setIncomeFormErrors)) return;
    setIncomeSubmitting(true);
    try {
      await updateIncomeCategory(editIncomeCategory.id, { name: incomeFormData.name.trim(), icon: incomeFormData.icon || null, color: incomeFormData.color || null });
      toast.success(t('incomeCategories.updateSuccess'));
      setEditIncomeCategory(null);
    } catch { toast.error(t('incomeCategories.updateFailed')); }
    finally { setIncomeSubmitting(false); }
  };

  const handleIncomeDeleteClick = async (id: string) => {
    const count = await getIncomeCountForCategory(id);
    setIncomeDeleteCount(count);
    setIncomeDeleteId(id);
  };

  const handleIncomeDeleteConfirm = async () => {
    if (!incomeDeleteId) return;
    setIncomeDeleting(true);
    try {
      await deleteIncomeCategory(incomeDeleteId);
      toast.success(t('incomeCategories.deleteSuccess'));
    } catch { toast.error(t('incomeCategories.deleteFailed')); }
    finally { setIncomeDeleting(false); setIncomeDeleteId(null); }
  };

  const openIncomeEdit = (cat: IncomeCategory) => {
    setEditIncomeCategory(cat);
    setIncomeFormData({ name: cat.name, icon: cat.icon ?? '', color: cat.color ?? '#10b981' });
    setIncomeFormErrors({});
  };

  const openIncomeAdd = () => { setIncomeFormData({ ...emptyForm, color: '#10b981' }); setIncomeFormErrors({}); setShowIncomeAddModal(true); };

  return {
    // shared
    loading, t,
    // group splits
    isGroupAccount, members, localSplits, setSplitValue, handleSaveSplits, savingSplits,
    // expense categories
    categories,
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
    // income categories
    incomeCategories,
    showIncomeAddModal, setShowIncomeAddModal,
    editIncomeCategory, setEditIncomeCategory,
    incomeDeleteId, setIncomeDeleteId,
    incomeDeleteCount,
    incomeDeleting, incomeSubmitting,
    incomeFormData, setIncomeFormData,
    incomeFormErrors,
    handleIncomeAdd, handleIncomeEdit,
    handleIncomeDeleteClick, handleIncomeDeleteConfirm,
    openIncomeEdit, openIncomeAdd,
  };
};
