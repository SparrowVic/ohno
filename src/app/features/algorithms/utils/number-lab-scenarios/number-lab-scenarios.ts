import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface NumberLabPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

/** Discriminated-union scenario shape. Each algorithm family in the
 *  number-lab group picks its own kind; the view-config dispatches to
 *  the right generator based on `kind`. */
export type NumberLabScenario =
  | FibonacciScenario
  | FactorialScenario
  | EuclideanGcdScenario;

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface FibonacciScenario extends BaseScenario {
  readonly kind: 'fibonacci-iterative';
  /** Terminal index to compute F(n). */
  readonly n: number;
}

export interface FactorialScenario extends BaseScenario {
  readonly kind: 'factorial';
  readonly n: number;
}

export interface EuclideanGcdScenario extends BaseScenario {
  readonly kind: 'euclidean-gcd';
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

const K = {
  fibonacci: {
    classic: presetKeys('features.algorithms.scenarios.numberLab.fibonacci.classic'),
    deep: presetKeys('features.algorithms.scenarios.numberLab.fibonacci.deep'),
  },
  factorial: {
    small: presetKeys('features.algorithms.scenarios.numberLab.factorial.small'),
    growing: presetKeys('features.algorithms.scenarios.numberLab.factorial.growing'),
  },
  gcd: {
    coprime: presetKeys('features.algorithms.scenarios.numberLab.gcd.coprime'),
    shared: presetKeys('features.algorithms.scenarios.numberLab.gcd.shared'),
    large: presetKeys('features.algorithms.scenarios.numberLab.gcd.large'),
  },
} as const;

// ---- FIBONACCI ---------------------------------------------------------
export const FIBONACCI_PRESETS: readonly NumberLabPresetOption[] = [
  { id: 'classic', label: K.fibonacci.classic.label, description: K.fibonacci.classic.description },
  { id: 'deep', label: K.fibonacci.deep.label, description: K.fibonacci.deep.description },
];
export const DEFAULT_FIBONACCI_PRESET_ID = 'classic';

export function createFibonacciScenario(size: number, presetId: string | null): FibonacciScenario {
  const id = presetId ?? DEFAULT_FIBONACCI_PRESET_ID;
  if (id === 'deep') {
    return {
      kind: 'fibonacci-iterative',
      presetId: 'deep',
      presetLabel: K.fibonacci.deep.label,
      presetDescription: K.fibonacci.deep.description,
      n: Math.max(size, 15),
    };
  }
  return {
    kind: 'fibonacci-iterative',
    presetId: 'classic',
    presetLabel: K.fibonacci.classic.label,
    presetDescription: K.fibonacci.classic.description,
    n: Math.min(size, 10),
  };
}

// ---- FACTORIAL ---------------------------------------------------------
export const FACTORIAL_PRESETS: readonly NumberLabPresetOption[] = [
  { id: 'small', label: K.factorial.small.label, description: K.factorial.small.description },
  { id: 'growing', label: K.factorial.growing.label, description: K.factorial.growing.description },
];
export const DEFAULT_FACTORIAL_PRESET_ID = 'small';

export function createFactorialScenario(size: number, presetId: string | null): FactorialScenario {
  const id = presetId ?? DEFAULT_FACTORIAL_PRESET_ID;
  if (id === 'growing') {
    return {
      kind: 'factorial',
      presetId: 'growing',
      presetLabel: K.factorial.growing.label,
      presetDescription: K.factorial.growing.description,
      n: Math.max(size, 10),
    };
  }
  return {
    kind: 'factorial',
    presetId: 'small',
    presetLabel: K.factorial.small.label,
    presetDescription: K.factorial.small.description,
    n: Math.min(size, 6),
  };
}

// ---- EUCLIDEAN GCD -----------------------------------------------------
export const EUCLIDEAN_GCD_PRESETS: readonly NumberLabPresetOption[] = [
  { id: 'coprime', label: K.gcd.coprime.label, description: K.gcd.coprime.description },
  { id: 'shared', label: K.gcd.shared.label, description: K.gcd.shared.description },
  { id: 'large', label: K.gcd.large.label, description: K.gcd.large.description },
];
export const DEFAULT_EUCLIDEAN_GCD_PRESET_ID = 'shared';

export function createEuclideanGcdScenario(
  _size: number,
  presetId: string | null,
): EuclideanGcdScenario {
  const id = presetId ?? DEFAULT_EUCLIDEAN_GCD_PRESET_ID;
  switch (id) {
    case 'coprime':
      return {
        kind: 'euclidean-gcd',
        presetId: 'coprime',
        presetLabel: K.gcd.coprime.label,
        presetDescription: K.gcd.coprime.description,
        a: 35,
        b: 17,
      };
    case 'large':
      return {
        kind: 'euclidean-gcd',
        presetId: 'large',
        presetLabel: K.gcd.large.label,
        presetDescription: K.gcd.large.description,
        a: 462,
        b: 1071,
      };
    case 'shared':
    default:
      return {
        kind: 'euclidean-gcd',
        presetId: 'shared',
        presetLabel: K.gcd.shared.label,
        presetDescription: K.gcd.shared.description,
        a: 48,
        b: 36,
      };
  }
}
