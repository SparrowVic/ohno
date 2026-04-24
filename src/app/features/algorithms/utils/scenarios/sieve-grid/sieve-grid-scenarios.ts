import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { Task } from '../../../models/task';

export interface SieveGridPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface SieveEratosthenesScenario extends BaseScenario {
  readonly kind: 'eratosthenes';
  readonly upper: number;
}

export type SieveGridScenario = SieveEratosthenesScenario;

interface PresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): PresetKeys {
  return { label: t(`${baseKey}.label`), description: t(`${baseKey}.description`) };
}

const K = {
  eratosthenes: {
    compact: presetKeys('features.algorithms.scenarios.sieveGrid.eratosthenes.compact'),
    classic: presetKeys('features.algorithms.scenarios.sieveGrid.eratosthenes.classic'),
    wide: presetKeys('features.algorithms.scenarios.sieveGrid.eratosthenes.wide'),
  },
} as const;

export const ERATOSTHENES_PRESETS: readonly SieveGridPresetOption[] = [
  {
    id: 'compact',
    label: K.eratosthenes.compact.label,
    description: K.eratosthenes.compact.description,
  },
  {
    id: 'classic',
    label: K.eratosthenes.classic.label,
    description: K.eratosthenes.classic.description,
  },
  { id: 'wide', label: K.eratosthenes.wide.label, description: K.eratosthenes.wide.description },
];

export const DEFAULT_ERATOSTHENES_PRESET_ID = 'classic';

export interface EratosthenesValues {
  readonly upper: number;
}

/** Task-shape source of truth for Sieve of Eratosthenes. The old
 *  (size × preset) axis is collapsed — the preset now fully describes
 *  the run (named range), and a custom-values override lets students
 *  dial `upper` freely without fighting the size select. */
export const ERATOSTHENES_TASKS: readonly Task<EratosthenesValues>[] = [
  {
    id: 'compact',
    name: K.eratosthenes.compact.label,
    defaultValues: { upper: 24 },
    inputSchema: {
      upper: {
        kind: 'int',
        label: t('features.algorithms.tasks.sieveEratosthenes.values.upper'),
        min: 2,
        max: 400,
      },
    },
    codeSnippetId: 'eratosthenes',
  },
  {
    id: 'classic',
    name: K.eratosthenes.classic.label,
    defaultValues: { upper: 48 },
    inputSchema: {
      upper: {
        kind: 'int',
        label: t('features.algorithms.tasks.sieveEratosthenes.values.upper'),
        min: 2,
        max: 400,
      },
    },
    codeSnippetId: 'eratosthenes',
  },
  {
    id: 'wide',
    name: K.eratosthenes.wide.label,
    defaultValues: { upper: 96 },
    inputSchema: {
      upper: {
        kind: 'int',
        label: t('features.algorithms.tasks.sieveEratosthenes.values.upper'),
        min: 2,
        max: 400,
      },
    },
    codeSnippetId: 'eratosthenes',
  },
];
export const DEFAULT_ERATOSTHENES_TASK_ID = 'classic';

export function createEratosthenesScenario(
  size: number,
  presetId: string | null,
  customValues?: EratosthenesValues,
): SieveEratosthenesScenario {
  const id = presetId ?? DEFAULT_ERATOSTHENES_PRESET_ID;
  const base = resolveEratosthenesBase(id, size);
  return {
    kind: 'eratosthenes',
    presetId: base.presetId,
    presetLabel: base.presetLabel,
    presetDescription: base.presetDescription,
    upper: customValues?.upper ?? base.upper,
  };
}

function resolveEratosthenesBase(
  id: string,
  size: number,
): Omit<SieveEratosthenesScenario, 'kind'> {
  switch (id) {
    case 'compact':
      return {
        presetId: 'compact',
        presetLabel: K.eratosthenes.compact.label,
        presetDescription: K.eratosthenes.compact.description,
        upper: Math.max(20, Math.min(size, 30)),
      };
    case 'wide':
      return {
        presetId: 'wide',
        presetLabel: K.eratosthenes.wide.label,
        presetDescription: K.eratosthenes.wide.description,
        upper: Math.max(80, Math.min(size, 120)),
      };
    case 'classic':
    default:
      return {
        presetId: 'classic',
        presetLabel: K.eratosthenes.classic.label,
        presetDescription: K.eratosthenes.classic.description,
        upper: Math.max(40, Math.min(size, 60)),
      };
  }
}
