import { I18N_KEY, RUNTIME_KEY } from '../../../core/i18n/i18n-keys';
import { I18nText, i18nText } from '../../../core/i18n/translatable-text';

const LABELS = I18N_KEY.features.algorithms.display.network.labels;
const FRONTIERS = RUNTIME_KEY.network.common.frontiers;

export type NetworkRackName = keyof typeof LABELS;
export type NetworkFrontierName = keyof typeof FRONTIERS;

export function networkRack(name: NetworkRackName): I18nText {
  return i18nText(LABELS[name]);
}

export function networkFrontier(name: NetworkFrontierName): I18nText {
  return i18nText(FRONTIERS[name]);
}
