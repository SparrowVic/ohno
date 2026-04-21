import { I18nKey } from './i18n-keys';

const I18N_KEY_SEGMENT = /^[a-z0-9]+(?:[A-Z][a-z0-9]*)*$/;

export function looksLikeI18nKey(value: string | null | undefined): value is I18nKey {
  if (!value) {
    return false;
  }

  const segments = value.split('.');
  return segments.length > 1 && segments.every((segment) => I18N_KEY_SEGMENT.test(segment));
}
