import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { Task } from '../../models/task';

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

export interface ExtendedEuclideanValues {
  readonly a: number;
  readonly b: number;
}

/** Task-shape source of truth for Extended Euclidean. For now all three
 *  tasks share the same `bezout` code snippet — same algorithm, three
 *  different input pairs. The additional problem-type variants
 *  (modular inverse, `ax + by = c` linear Diophantine) are tracked in
 *  the migration spec and will arrive as tasks with their own
 *  `codeSnippetId`s once their generator branches are authored. */
export const EXTENDED_EUCLIDEAN_TASKS: readonly Task<ExtendedEuclideanValues>[] = [
  {
    id: 'short',
    name: K.short.label,
    defaultValues: { a: 60, b: 48 },
    inputSchema: {
      a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
      b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
    },
    codeSnippetId: 'extended-euclidean',
  },
  {
    id: 'classic',
    name: K.classic.label,
    defaultValues: { a: 240, b: 46 },
    inputSchema: {
      a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
      b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
    },
    codeSnippetId: 'extended-euclidean',
  },
  {
    id: 'large',
    name: K.large.label,
    defaultValues: { a: 1071, b: 462 },
    inputSchema: {
      a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
      b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
    },
    codeSnippetId: 'extended-euclidean',
  },
];
export const DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID = 'classic';

export function createExtendedEuclideanScenario(
  _size: number,
  presetId: string | null,
  customValues?: ExtendedEuclideanValues,
): ExtendedEuclideanScenario {
  const id = presetId ?? DEFAULT_EXTENDED_EUCLIDEAN_PRESET_ID;
  const base = resolveExtendedEuclideanBase(id);
  return {
    kind: 'extended-euclidean',
    presetId: base.presetId,
    presetLabel: base.presetLabel,
    presetDescription: base.presetDescription,
    a: customValues?.a ?? base.a,
    b: customValues?.b ?? base.b,
  };
}

function resolveExtendedEuclideanBase(id: string): Omit<ExtendedEuclideanScenario, 'kind'> {
  switch (id) {
    case 'short':
      return {
        presetId: 'short',
        presetLabel: K.short.label,
        presetDescription: K.short.description,
        a: 60,
        b: 48,
      };
    case 'large':
      return {
        presetId: 'large',
        presetLabel: K.large.label,
        presetDescription: K.large.description,
        a: 1071,
        b: 462,
      };
    case 'classic':
    default:
      return {
        presetId: 'classic',
        presetLabel: K.classic.label,
        presetDescription: K.classic.description,
        a: 240,
        b: 46,
      };
  }
}
