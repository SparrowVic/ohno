import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { I18nText, I18nTextParams, i18nText } from '../../../core/i18n/translatable-text';

const LABELS = I18N_KEY.features.algorithms.display.graph.labels;
const SECONDARY = I18N_KEY.features.algorithms.display.graph.secondary;

export type GraphLabelName = keyof typeof LABELS;
export type GraphSecondaryName = keyof typeof SECONDARY;

export function graphLabel(name: GraphLabelName): I18nText {
  return i18nText(LABELS[name]);
}

export function graphSecondary(name: GraphSecondaryName, params?: I18nTextParams): I18nText {
  return i18nText(SECONDARY[name], params);
}
