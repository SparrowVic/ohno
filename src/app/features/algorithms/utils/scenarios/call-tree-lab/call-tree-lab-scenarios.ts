import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface CallTreeLabPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface NQueensScenario extends BaseScenario {
  readonly kind: 'n-queens';
  readonly n: number;
}

export interface MinimaxScenario extends BaseScenario {
  readonly kind: 'minimax-alpha-beta';
  /** The toy game tree's leaf values (left-to-right, fixed depth). */
  readonly leaves: readonly number[];
  /** Branching factor — all non-leaf nodes spawn this many children.
   *  Combined with `leaves.length` it implies tree depth. */
  readonly branching: number;
}

export interface McTsScenario extends BaseScenario {
  readonly kind: 'mcts';
  /** Branching factor of the explore tree. */
  readonly branching: number;
  /** Number of MCTS iterations (select→expand→simulate→backprop). */
  readonly iterations: number;
  /** UCB exploration constant (typical √2 ≈ 1.41). */
  readonly c: number;
  /** Reward distribution per leaf — deterministic so the trace is
   *  reproducible. Length must be ≥ branching ^ tree depth. */
  readonly leafRewards: readonly number[];
}

export type CallTreeLabScenario = NQueensScenario | MinimaxScenario | McTsScenario;

interface PresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): PresetKeys {
  return { label: t(`${baseKey}.label`), description: t(`${baseKey}.description`) };
}

const K = {
  backtracking: {
    tiny: presetKeys('features.algorithms.scenarios.callTreeLab.backtracking.tiny'),
    classic: presetKeys('features.algorithms.scenarios.callTreeLab.backtracking.classic'),
    challenge: presetKeys('features.algorithms.scenarios.callTreeLab.backtracking.challenge'),
  },
  minimax: {
    balanced: presetKeys('features.algorithms.scenarios.callTreeLab.minimax.balanced'),
    prunable: presetKeys('features.algorithms.scenarios.callTreeLab.minimax.prunable'),
    wide: presetKeys('features.algorithms.scenarios.callTreeLab.minimax.wide'),
  },
  mcts: {
    shallow: presetKeys('features.algorithms.scenarios.callTreeLab.mcts.shallow'),
    classic: presetKeys('features.algorithms.scenarios.callTreeLab.mcts.classic'),
    deep: presetKeys('features.algorithms.scenarios.callTreeLab.mcts.deep'),
  },
} as const;

// ---- N-QUEENS ---------------------------------------------------------
export const N_QUEENS_PRESETS: readonly CallTreeLabPresetOption[] = [
  {
    id: 'tiny',
    label: K.backtracking.tiny.label,
    description: K.backtracking.tiny.description,
  },
  {
    id: 'classic',
    label: K.backtracking.classic.label,
    description: K.backtracking.classic.description,
  },
  {
    id: 'challenge',
    label: K.backtracking.challenge.label,
    description: K.backtracking.challenge.description,
  },
];

export const DEFAULT_N_QUEENS_PRESET_ID = 'classic';

export function createNQueensScenario(size: number, presetId: string | null): NQueensScenario {
  const id = presetId ?? DEFAULT_N_QUEENS_PRESET_ID;
  switch (id) {
    case 'tiny':
      return {
        kind: 'n-queens',
        presetId: 'tiny',
        presetLabel: K.backtracking.tiny.label,
        presetDescription: K.backtracking.tiny.description,
        n: 4,
      };
    case 'challenge':
      return {
        kind: 'n-queens',
        presetId: 'challenge',
        presetLabel: K.backtracking.challenge.label,
        presetDescription: K.backtracking.challenge.description,
        n: Math.max(6, Math.min(size, 6)),
      };
    case 'classic':
    default:
      return {
        kind: 'n-queens',
        presetId: 'classic',
        presetLabel: K.backtracking.classic.label,
        presetDescription: K.backtracking.classic.description,
        n: Math.max(4, Math.min(size, 5)),
      };
  }
}

// ---- MINIMAX ----------------------------------------------------------
export const MINIMAX_PRESETS: readonly CallTreeLabPresetOption[] = [
  {
    id: 'balanced',
    label: K.minimax.balanced.label,
    description: K.minimax.balanced.description,
  },
  {
    id: 'prunable',
    label: K.minimax.prunable.label,
    description: K.minimax.prunable.description,
  },
  { id: 'wide', label: K.minimax.wide.label, description: K.minimax.wide.description },
];

export const DEFAULT_MINIMAX_PRESET_ID = 'prunable';

export function createMinimaxScenario(_size: number, presetId: string | null): MinimaxScenario {
  const id = presetId ?? DEFAULT_MINIMAX_PRESET_ID;
  switch (id) {
    case 'balanced':
      return {
        kind: 'minimax-alpha-beta',
        presetId: 'balanced',
        presetLabel: K.minimax.balanced.label,
        presetDescription: K.minimax.balanced.description,
        leaves: [3, 5, 6, 9, 1, 2, 0, -1],
        branching: 2,
      };
    case 'wide':
      return {
        kind: 'minimax-alpha-beta',
        presetId: 'wide',
        presetLabel: K.minimax.wide.label,
        presetDescription: K.minimax.wide.description,
        leaves: [2, 4, 3, 1, 8, 5, 9, 6, 7, 2, 1, 0, 3, 5, 4, 6, 2, 7, 1, 3, 0, 4, 6, 8, 1, 3, 5],
        branching: 3,
      };
    case 'prunable':
    default:
      return {
        kind: 'minimax-alpha-beta',
        presetId: 'prunable',
        presetLabel: K.minimax.prunable.label,
        presetDescription: K.minimax.prunable.description,
        leaves: [3, 12, 8, 2, 4, 6, 14, 5, 2],
        branching: 3,
      };
  }
}

// ---- MCTS -------------------------------------------------------------
export const MCTS_PRESETS: readonly CallTreeLabPresetOption[] = [
  { id: 'shallow', label: K.mcts.shallow.label, description: K.mcts.shallow.description },
  { id: 'classic', label: K.mcts.classic.label, description: K.mcts.classic.description },
  { id: 'deep', label: K.mcts.deep.label, description: K.mcts.deep.description },
];

export const DEFAULT_MCTS_PRESET_ID = 'classic';

export function createMcTsScenario(_size: number, presetId: string | null): McTsScenario {
  const id = presetId ?? DEFAULT_MCTS_PRESET_ID;
  switch (id) {
    case 'shallow':
      return {
        kind: 'mcts',
        presetId: 'shallow',
        presetLabel: K.mcts.shallow.label,
        presetDescription: K.mcts.shallow.description,
        branching: 2,
        iterations: 6,
        c: Math.SQRT2,
        leafRewards: [0.8, 0.3, 0.9, 0.4, 0.7, 0.2, 0.6, 0.5],
      };
    case 'deep':
      return {
        kind: 'mcts',
        presetId: 'deep',
        presetLabel: K.mcts.deep.label,
        presetDescription: K.mcts.deep.description,
        branching: 3,
        iterations: 12,
        c: Math.SQRT2,
        leafRewards: [
          0.6, 0.3, 0.8, 0.5, 0.2, 0.7, 0.4, 0.9, 0.1, 0.55, 0.35, 0.65, 0.45, 0.75, 0.25, 0.85,
          0.15, 0.95, 0.5, 0.3, 0.7, 0.4, 0.6, 0.2, 0.8, 0.5, 0.3,
        ],
      };
    case 'classic':
    default:
      return {
        kind: 'mcts',
        presetId: 'classic',
        presetLabel: K.mcts.classic.label,
        presetDescription: K.mcts.classic.description,
        branching: 2,
        iterations: 10,
        c: Math.SQRT2,
        leafRewards: [0.7, 0.2, 0.8, 0.4, 0.5, 0.9, 0.3, 0.6, 0.75, 0.35, 0.85, 0.45, 0.55, 0.65, 0.15, 0.25],
      };
  }
}
