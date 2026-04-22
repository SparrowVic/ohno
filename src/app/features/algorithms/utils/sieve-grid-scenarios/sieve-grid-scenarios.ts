import { marker as t } from '@jsverse/transloco-keys-manager/marker';

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

export function createEratosthenesScenario(
  size: number,
  presetId: string | null,
): SieveEratosthenesScenario {
  const id = presetId ?? DEFAULT_ERATOSTHENES_PRESET_ID;
  switch (id) {
    case 'compact':
      return {
        kind: 'eratosthenes',
        presetId: 'compact',
        presetLabel: K.eratosthenes.compact.label,
        presetDescription: K.eratosthenes.compact.description,
        upper: Math.max(20, Math.min(size, 30)),
      };
    case 'wide':
      return {
        kind: 'eratosthenes',
        presetId: 'wide',
        presetLabel: K.eratosthenes.wide.label,
        presetDescription: K.eratosthenes.wide.description,
        upper: Math.max(80, Math.min(size, 120)),
      };
    case 'classic':
    default:
      return {
        kind: 'eratosthenes',
        presetId: 'classic',
        presetLabel: K.eratosthenes.classic.label,
        presetDescription: K.eratosthenes.classic.description,
        upper: Math.max(40, Math.min(size, 60)),
      };
  }
}
