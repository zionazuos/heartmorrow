import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { en, type MessageKey } from './locales/en';
import { ptBR } from './locales/pt-BR';

/**
 * A tiny, dependency-free localization layer.
 *
 * Why hand-rolled instead of react-i18next? The app is deliberately minimal
 * (zero runtime deps it doesn't need), the catalogue is a flat key→string map,
 * and we only need lookup + `{placeholder}` interpolation + a locale switch.
 * That's a few dozen lines — not worth a library.
 *
 * Usage:
 *   const t = useT();
 *   <h1>{t('nav.settings')}</h1>
 *   <span>{t('app.dateInProgress.title', { name })}</span>
 */

/** Display names for the locale picker. Add an entry per supported language. */
export const LOCALES = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = 'en';

/** Each locale's catalogue. `en` is the source; others are typed against it. */
const CATALOGUES: Record<Locale, Record<MessageKey, string>> = {
  en,
  'pt-BR': ptBR,
};

const STORAGE_KEY = 'dsim.locale';

function isLocale(value: string): value is Locale {
  return value in LOCALES;
}

/** Saved preference wins; otherwise fall back to the browser language. */
function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isLocale(saved)) return saved;
  } catch {
    /* localStorage may be unavailable (private mode) — ignore. */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  if (nav.startsWith('pt')) return 'pt-BR';
  return DEFAULT_LOCALE;
}

/** Replace `{token}` occurrences with the matching param (left as-is if absent). */
function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

export type TParams = Record<string, string | number>;
export type TFunc = (key: MessageKey, params?: TParams) => string;

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunc;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  // Keep <html lang> in sync for accessibility / correct hyphenation.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore persistence failures */
    }
  }, []);

  const t = useCallback<TFunc>(
    (key, params) => {
      // Fall back to English, then to the raw key, so a missing translation is
      // never a blank string — at worst you see the English text.
      const template = CATALOGUES[locale][key] ?? en[key] ?? key;
      return interpolate(template, params);
    },
    [locale],
  );

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an <I18nProvider>');
  return ctx;
}

/** Convenience hook when you only need the translate function. */
export function useT(): TFunc {
  return useI18n().t;
}
