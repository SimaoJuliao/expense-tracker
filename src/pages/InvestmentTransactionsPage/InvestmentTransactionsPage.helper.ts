import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { useTranslation } from '../../i18n';
import type { InvestmentFlow } from '../../types';

export const YEARS = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const PAGE_SIZE = 25;

export const useInvestmentTransactionsPage = () => {
  const { platforms, flows, fetchAll, deleteFlow } = useInvestmentStore();
  const { t } = useTranslation();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [platformId, setPlatformId] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [type, setType] = useState('all');
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0); // 0 = all years
  const [page, setPage] = useState(1);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editFlow, setEditFlow] = useState<InvestmentFlow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const platformById = useMemo(() => new Map(platforms.map((p) => [p.id, p])), [platforms]);
  const currencies = useMemo(() => [...new Set(flows.map((f) => f.currency))].sort(), [flows]);

  const filtered = useMemo(() => {
    return flows.filter((f) => {
      if (platformId !== 'all' && f.platform_id !== platformId) return false;
      if (currency !== 'all' && f.currency !== currency) return false;
      if (type !== 'all' && f.type !== type) return false;
      if (year !== 0 && String(f.date).slice(0, 4) !== String(year)) return false;
      if (month !== 0 && Number(f.date.slice(5, 7)) !== month) return false;
      return true;
    });
  }, [flows, platformId, currency, type, month, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [platformId, currency, type, month, year]);

  const resetFilters = () => {
    setPlatformId('all'); setCurrency('all'); setType('all');
    setMonth(0); setYear(0);
  };
  const hasActiveFilters = platformId !== 'all' || currency !== 'all' || type !== 'all' || month !== 0 || year !== 0;

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFlow(deleteId);
      toast.success(t('investments.flowDeleted'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setDeleteId(null);
    }
  };

  return {
    platforms, platformById, currencies,
    filtered, pageItems, page: safePage, totalPages, setPage, count: filtered.length,
    platformId, setPlatformId, currency, setCurrency, type, setType,
    month, setMonth, year, setYear, resetFilters, hasActiveFilters,
    addModalOpen, setAddModalOpen, editFlow, setEditFlow,
    deleteId, setDeleteId, confirmDelete,
    t,
  };
};
