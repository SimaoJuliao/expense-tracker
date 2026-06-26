import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useCurrencyStore, SUPPORTED_CURRENCIES } from '../../store/useCurrencyStore';
import { useTranslation, useI18nStore } from '../../i18n';
import type { Locale } from '../../i18n';

export const useSettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const { locale, setLocale } = useI18nStore();
  const { theme, setTheme } = useThemeStore();
  const { currency, setCurrency } = useCurrencyStore();

  return {
    user, t,
    locale, setLocale: setLocale as (v: Locale) => void,
    theme, setTheme,
    currency, setCurrency, currencies: SUPPORTED_CURRENCIES,
  };
};
