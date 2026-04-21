export type I18nTextParam = string | number | boolean | null | undefined;
export type I18nTextParams = Readonly<Record<string, I18nTextParam>>;

export interface I18nText {
  readonly key: string;
  readonly params?: I18nTextParams;
}

export type TranslatableText = string | I18nText;

export function i18nText(key: string, params?: I18nTextParams): I18nText {
  return { key, params };
}

export function isI18nText(value: unknown): value is I18nText {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    typeof value.key === 'string'
  );
}
