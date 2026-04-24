import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface CallStackLabPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface RecursiveFibonacciScenario extends BaseScenario {
  readonly kind: 'recursive-fibonacci';
  /** Argument to fib(n) — depth grows linearly, call count exponentially. */
  readonly n: number;
}

export type CallStackLabScenario = RecursiveFibonacciScenario;

interface PresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): PresetKeys {
  return { label: t(`${baseKey}.label`), description: t(`${baseKey}.description`) };
}

const K = {
  fibonacci: {
    tiny: presetKeys('features.algorithms.scenarios.callStackLab.fibonacci.tiny'),
    classic: presetKeys('features.algorithms.scenarios.callStackLab.fibonacci.classic'),
    bushy: presetKeys('features.algorithms.scenarios.callStackLab.fibonacci.bushy'),
  },
} as const;

export const RECURSIVE_FIBONACCI_PRESETS: readonly CallStackLabPresetOption[] = [
  { id: 'tiny', label: K.fibonacci.tiny.label, description: K.fibonacci.tiny.description },
  {
    id: 'classic',
    label: K.fibonacci.classic.label,
    description: K.fibonacci.classic.description,
  },
  { id: 'bushy', label: K.fibonacci.bushy.label, description: K.fibonacci.bushy.description },
];

export const DEFAULT_RECURSIVE_FIBONACCI_PRESET_ID = 'classic';

export function createRecursiveFibonacciScenario(
  size: number,
  presetId: string | null,
): RecursiveFibonacciScenario {
  const id = presetId ?? DEFAULT_RECURSIVE_FIBONACCI_PRESET_ID;
  const clamp = (n: number) => Math.max(2, Math.min(n, 7));
  switch (id) {
    case 'tiny':
      return {
        kind: 'recursive-fibonacci',
        presetId: 'tiny',
        presetLabel: K.fibonacci.tiny.label,
        presetDescription: K.fibonacci.tiny.description,
        n: clamp(Math.min(size, 3)),
      };
    case 'bushy':
      return {
        kind: 'recursive-fibonacci',
        presetId: 'bushy',
        presetLabel: K.fibonacci.bushy.label,
        presetDescription: K.fibonacci.bushy.description,
        n: clamp(Math.max(size, 6)),
      };
    case 'classic':
    default:
      return {
        kind: 'recursive-fibonacci',
        presetId: 'classic',
        presetLabel: K.fibonacci.classic.label,
        presetDescription: K.fibonacci.classic.description,
        n: clamp(Math.max(size, 5)),
      };
  }
}
