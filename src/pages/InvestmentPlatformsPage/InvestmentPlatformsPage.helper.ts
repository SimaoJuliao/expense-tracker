import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { useTranslation } from '../../i18n';
import { CHART_COLORS } from '../../constants/colors';
import type { InvestmentPlatform } from '../../types';

export const PLATFORM_COLORS = CHART_COLORS;

interface PlatformForm {
  id: string | null;
  name: string;
  color: string;
}

const emptyForm = (): PlatformForm => ({ id: null, name: '', color: PLATFORM_COLORS[0] });

export const useInvestmentPlatformsPage = () => {
  const { platforms, fetchAll, addPlatform, updatePlatform, deletePlatform } = useInvestmentStore();
  const { t } = useTranslation();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PlatformForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => { setForm(emptyForm()); setModalOpen(true); };
  const openEdit = (p: InvestmentPlatform) => {
    setForm({ id: p.id, name: p.name, color: p.color ?? PLATFORM_COLORS[0] });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) { toast.error(t('investments.platformNameRequired')); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), icon: null, color: form.color };
      if (form.id) { await updatePlatform(form.id, payload); toast.success(t('investments.platformUpdated')); }
      else { await addPlatform(payload); toast.success(t('investments.platformAdded')); }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePlatform(deleteId);
      toast.success(t('investments.platformDeleted'));
    } catch {
      toast.error(t('investments.platformDeleteFailed'));
    } finally {
      setDeleteId(null);
    }
  };

  return {
    platforms,
    modalOpen, setModalOpen, form, setForm, openAdd, openEdit, submit, submitting,
    deleteId, setDeleteId, confirmDelete,
    t,
  };
};
