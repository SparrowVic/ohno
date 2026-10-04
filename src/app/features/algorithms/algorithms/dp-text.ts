import { I18N_KEY, RUNTIME_KEY } from '../../../core/i18n/i18n-keys';
import { I18nText, I18nTextParams, i18nText } from '../../../core/i18n/translatable-text';

const DISPLAY = I18N_KEY.features.algorithms.display;

const LABELS = {
  ...DISPLAY.dp.labels,
  base: DISPLAY.racks.base,
  skip: DISPLAY.notes.skip,
  ...RUNTIME_KEY.dp.common.labels,
} as const;

const CAPTIONS = DISPLAY.dp.captions;

export type DpLabelName = keyof typeof LABELS;
export type DpCaptionName = keyof typeof CAPTIONS;

export function dpLabel(name: DpLabelName, params?: I18nTextParams): I18nText {
  return i18nText(LABELS[name], params);
}

export function dpCaption(name: DpCaptionName, params: I18nTextParams): I18nText {
  return i18nText(CAPTIONS[name], params);
}
