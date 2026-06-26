import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatCurrency } from '../utils';

interface CurrencyStore {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'EUR',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'expense-tracker-currency' }
  )
);

export const useFormatCurrency = () => {
  const currency = useCurrencyStore((s) => s.currency);
  return (amount: number) => formatCurrency(amount, currency);
};

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'BRL', label: 'Brazilian Real (BRL)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', label: 'Australian Dollar (AUD)' },
  { code: 'PLN', label: 'Polish Złoty (PLN)' },
  { code: 'SEK', label: 'Swedish Krona (SEK)' },
  { code: 'NOK', label: 'Norwegian Krone (NOK)' },
  { code: 'DKK', label: 'Danish Krone (DKK)' },
];
