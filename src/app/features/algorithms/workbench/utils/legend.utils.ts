import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { LedColor } from '../../../../shared/instrument/led/led.types';

const COLOR_LEDS: readonly (readonly [string, LedColor])[] = [
  ['--viz-state-compare', 'cyan'],
  ['--viz-state-swap', 'pink'],
  ['--viz-state-sorted', 'lime'],
  ['--viz-state-default', 'slate'],
  ['--chrome-accent', 'violet'],
  ['--viz-accent', 'violet'],
  ['--viz-warning', 'amber'],
  ['--viz-hit', 'amber'],
  ['--viz-danger', 'red'],
  ['--viz-success', 'lime'],
  ['--viz-route', 'cyan'],
  ['--viz-ember', 'signal'],
  ['--violet', 'violet'],
  ['--amber', 'amber'],
  ['--red', 'red'],
  ['--lime', 'lime'],
  ['--cyan', 'cyan'],
  ['--pink', 'pink'],
  ['--signal', 'signal'],
  ['--easy', 'easy'],
];

const LABEL_KEYS: Readonly<Record<string, string>> = {
  Unsorted: I18N_KEY.features.algorithms.workbench.legend.unsorted,
  Comparing: I18N_KEY.features.algorithms.workbench.legend.comparing,
  Swapping: I18N_KEY.features.algorithms.workbench.legend.swapping,
  Sorted: I18N_KEY.features.algorithms.workbench.legend.sorted,
  Pivot: I18N_KEY.features.algorithms.workbench.legend.pivot,
  Boundary: I18N_KEY.features.algorithms.workbench.legend.boundary,
  'Input stream': I18N_KEY.features.algorithms.workbench.legend.inputStream,
  'Active digit': I18N_KEY.features.algorithms.workbench.legend.activeDigit,
  'Bucket lane': I18N_KEY.features.algorithms.workbench.legend.bucketLane,
  'Gathered output': I18N_KEY.features.algorithms.workbench.legend.gatheredOutput,
};

export function legendLedColor(cssColor: string): LedColor {
  return COLOR_LEDS.find(([token]) => cssColor.includes(token))?.[1] ?? 'slate';
}

export function legendLabelKey(label: string): string | null {
  return LABEL_KEYS[label] ?? null;
}
