import { useState } from 'react';
import { toast } from 'sonner';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { SUPPORTED_CURRENCIES } from '../../store/useCurrencyStore';
import { useTranslation } from '../../i18n';
import { todayISO } from '../../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AmountInput } from '../AmountInput';
import type { InvestmentFlow, InvestmentFlowType } from '../../types';

interface Props {
  flow?: InvestmentFlow | null;
  defaultPlatformId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InvestmentFlowForm = ({ flow, defaultPlatformId, onSuccess, onCancel }: Props) => {
  const { t } = useTranslation();
  const { platforms, addFlow, updateFlow } = useInvestmentStore();

  const [platformId, setPlatformId] = useState(flow?.platform_id ?? defaultPlatformId ?? platforms[0]?.id ?? '');
  const [type, setType] = useState<InvestmentFlowType>(flow?.type ?? 'deposit');
  const [amount, setAmount] = useState<number>(flow?.amount ?? 0);
  const [currency, setCurrency] = useState(flow?.currency ?? 'EUR');
  const [date, setDate] = useState(flow?.date ?? todayISO());
  const [note, setNote] = useState(flow?.note ?? '');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!platformId || !(amount > 0) || !date) {
      toast.error(t('investments.invalidForm'));
      return;
    }
    setSubmitting(true);
    try {
      const payload = { platform_id: platformId, type, amount, currency, date, note: note.trim() || null };
      if (flow) await updateFlow(flow.id, payload);
      else await addFlow(payload);
      toast.success(t('investments.flowSaved'));
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('investments.platformCol')}</Label>
        <Select value={platformId} onValueChange={setPlatformId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {platforms.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('investments.typeCol')}</Label>
          <Select value={type} onValueChange={(v) => setType(v as InvestmentFlowType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deposit">{t('investments.deposit')}</SelectItem>
              <SelectItem value="withdrawal">{t('investments.withdrawal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('investments.currency')}</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="flow-amount">{t('investments.amountCol')}</Label>
          <AmountInput id="flow-amount" value={amount} onValueChange={setAmount} placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="flow-date">{t('investments.dateCol')}</Label>
          <Input id="flow-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="flow-note">{t('investments.note')}</Label>
        <Input id="flow-note" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder={t('investments.notePlaceholder')} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button onClick={submit} disabled={submitting}>{submitting ? t('common.processing') : t('common.save')}</Button>
      </div>
    </div>
  );
};
