import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from './locales/en';
import { pt } from './locales/pt';
import type { Translations } from './locales/en';

export type Locale = 'en' | 'pt';

const locales: Record<Locale, Translations> = { en, pt };

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'expense-tracker-locale' }
  )
);

type PathsToLeaves<T> = T extends string
  ? []
  : { [K in keyof T]: [K, ...PathsToLeaves<T[K]>] }[keyof T];

type Join<T extends unknown[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F extends string
    ? F
    : never
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<R, D>}`
    : never
  : never;

export type TranslationKey = Join<PathsToLeaves<Translations>, '.'>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}

export const t = (
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string => {
  const translations = locales[locale] as unknown as Record<string, unknown>;
  let value = getNestedValue(translations, key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
};

export const useTranslation = () => {
  const locale = useI18nStore((s) => s.locale);
  return {
    t: (key: TranslationKey, vars?: Record<string, string | number>) =>
      t(locale, key, vars),
    locale,
  };
};
