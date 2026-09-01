import { useState, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { parseAmount, isAmountInput } from '../../utils';

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number;
  onValueChange: (value: number) => void;
};

/**
 * Decimal amount input that accepts both ',' and '.' as the decimal separator
 * (natural for European locales). Holds the raw text internally and emits the
 * parsed number, so partial input like "10," stays put while typing.
 */
export const AmountInput = ({ value, onValueChange, ...props }: Props) => {
  const [raw, setRaw] = useState(() => (value ? String(value) : ''));
  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={(e) => {
        const next = e.target.value;
        if (!isAmountInput(next)) return; // digits + at most one separator
        setRaw(next);
        onValueChange(parseAmount(next));
      }}
    />
  );
};
