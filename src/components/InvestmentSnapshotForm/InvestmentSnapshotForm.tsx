import { useState } from 'react';
import { toast } from 'sonner';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { SUPPORTED_CURRENCIES } from '../../store/useCurrencyStore';
import { useTranslation } from '../../i18n';
import { todayISO, parseAmount, isAmountInput } from '../../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  defaultPlatformId?: string;
  defaultCurrency?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InvestmentSnapshotForm = ({ defaultPlatformId, defaultCurrency, onSuccess, onCancel }: Props) => {
  const { t } = useTranslation();
  const { platforms, addSnapshot } = useInvestmentStore();

  const [platformId, setPlatformId] = useState(defaultPlatformId ?? platforms[0]?.id ?? '');
  const [currency, setCurrency] = useState(defaultCurrency ?? 'EUR');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const val = parseAmount(value);
    if (!platformId || value.trim() === '' || !(val >= 0) || !date) {
      toast.error(t('investments.invalidForm'));
      return;
    }
    setSubmitting(true);
    try {
      await addSnapshot({ platform_id: platformId, currency, value: val, date });
      toast.success(t('investments.snapshotSaved'));
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
        <div className="space-y-1.5">
          <Label htmlFor="snap-date">{t('investments.dateCol')}</Label>
          <Input id="snap-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="snap-value">{t('investments.currentValueLabel')}</Label>
        <Input id="snap-value" type="text" inputMode="decimal"
          value={value}
          onChange={(e) => { const n = e.target.value; if (isAmountInput(n)) setValue(n); }}
          placeholder="0.00" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button onClick={submit} disabled={submitting}>{submitting ? t('common.processing') : t('common.save')}</Button>
      </div>
    </div>
  );
};
