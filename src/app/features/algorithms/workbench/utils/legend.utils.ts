import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { LedColor } from '../../../../shared/instrument/led/led.types';

const COLOR_LEDS: readonly (readonly [string, LedColor])[] = [
  ['--viz-state-compare', 'cyan'],
  ['--viz-state-swap', 'pink'],
  ['--viz-state-sorted', 'lime'],
  ['--viz-state-default', 'slate'],
  ['--violet', 'violet'],
  ['--amber', 'amber'],
  ['--red', 'red'],
  ['--lime', 'lime'],
  ['--cyan', 'cyan'],
  ['--pink', 'pink'],
  ['--signal', 'signal'],
  ['--easy', 'easy'],
];

export function legendLedColor(cssColor: string): LedColor {
  return COLOR_LEDS.find(([token]) => cssColor.includes(token))?.[1] ?? 'slate';
}

export function legendLabelKey(label: string): string | null {
  return looksLikeI18nKey(label) ? label : null;
}
