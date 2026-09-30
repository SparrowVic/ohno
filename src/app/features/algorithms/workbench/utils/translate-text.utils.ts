import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { I18nTextParams, isI18nText, TranslatableText } from '../../../../core/i18n/translatable-text';

export type KeyTranslator = (key: string, params?: I18nTextParams) => string;

export function resolveTranslatableText(text: TranslatableText, translate: KeyTranslator): string {
  if (isI18nText(text)) return translate(text.key, text.params);
  return looksLikeI18nKey(text) ? translate(text) : text;
}
