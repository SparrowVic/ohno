export const APP_LANG = {
  PL: 'pl',
  EN: 'en',
} as const;

export type AppLang = (typeof APP_LANG)[keyof typeof APP_LANG];

export interface AppLangOption {
  readonly value: AppLang;
  readonly label: string;
}

export const DEFAULT_APP_LANG: AppLang = APP_LANG.PL;
export const FALLBACK_APP_LANG: AppLang = APP_LANG.EN;

export const APP_LANG_OPTIONS: readonly AppLangOption[] = [
  { value: APP_LANG.PL, label: 'PL' },
  { value: APP_LANG.EN, label: 'EN' },
];

export function isAppLang(value: string | null | undefined): value is AppLang {
  return value === APP_LANG.PL || value === APP_LANG.EN;
}
