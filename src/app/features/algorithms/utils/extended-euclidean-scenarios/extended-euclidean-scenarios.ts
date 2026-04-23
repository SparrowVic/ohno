import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface ExtendedEuclideanPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface ExtendedEuclideanScenario extends BaseScenario {
  readonly kind: 'extended-euclidean';
  readonly a: number;
  readonly b: number;
}

interface PresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): PresetKeys {
  return { label: t(`${baseKey}.label`), description: t(`${baseKey}.description`) };
}

/* Carefully chosen preset pairs. The forward chain length matters —
 *  short scenarios land a clean story; longer ones showcase how the
 *  back-substitution compounds coefficients across many steps. */
const K = {
  short: presetKeys('features.algorithms.scenarios.extendedEuclidean.short'),
  classic: presetKeys('features.algorithms.scenarios.extendedEuclidean.classic'),
  large: presetKeys('features.algorithms.scenarios.extendedEuclidean.large'),
} as const;

export const EXTENDED_EUCLIDEAN_PRESETS: readonly ExtendedEuclideanPresetOption[] = [
  { id: 'short', label: K.short.label, description: K.short.description },
  { id: 'classic', label: K.classic.label, description: K.classic.description },
  { id: 'large', label: K.large.label, description: K.large.description },
];

export const DEFAULT_EXTENDED_EUCLIDEAN_PRESET_ID = 'classic';

export function createExtendedEuclideanScenario(
  _size: number,
  presetId: string | null,
): ExtendedEuclideanScenario {
  const id = presetId ?? DEFAULT_EXTENDED_EUCLIDEAN_PRESET_ID;
  switch (id) {
    case 'short':
      /* 60 / 48 → gcd 12, a single back-sub. Entry-level scenario for
       *  students meeting Bézout for the first time. */
      return {
        kind: 'extended-euclidean',
        presetId: 'short',
        presetLabel: K.short.label,
        presetDescription: K.short.description,
        a: 60,
        b: 48,
      };
    case 'large':
      /* 1071 / 462 — mirrors Euclidean's "large" preset so students can
       *  watch the extra back-substitution unfold on top of a chain
       *  they already recognise from the dashboard view. */
      return {
        kind: 'extended-euclidean',
        presetId: 'large',
        presetLabel: K.large.label,
        presetDescription: K.large.description,
        a: 1071,
        b: 462,
      };
    case 'classic':
    default:
      /* 240 / 46 — the textbook example. Five-step forward chain
       *  produces a richly layered back-substitution (Bézout
       *  coefficients emerge only after four rewrites). */
      return {
        kind: 'extended-euclidean',
        presetId: 'classic',
        presetLabel: K.classic.label,
        presetDescription: K.classic.description,
        a: 240,
        b: 46,
      };
  }
}
