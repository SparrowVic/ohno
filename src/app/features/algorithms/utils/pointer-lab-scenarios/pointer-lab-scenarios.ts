import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface PointerLabPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export type PointerLabScenario =
  | TwoPointersScenario
  | SlidingWindowScenario
  | PalindromeCheckScenario
  | ReverseScenario;

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface TwoPointersScenario extends BaseScenario {
  readonly kind: 'two-pointers';
  /** Sorted array of integers. */
  readonly values: readonly number[];
  readonly target: number;
}

export interface SlidingWindowScenario extends BaseScenario {
  readonly kind: 'sliding-window';
  readonly values: readonly number[];
  /** Fixed window width. Generator picks the max-sum window of that size. */
  readonly windowSize: number;
}

export interface PalindromeCheckScenario extends BaseScenario {
  readonly kind: 'palindrome-check';
  readonly word: string;
}

export interface ReverseScenario extends BaseScenario {
  readonly kind: 'reverse';
  readonly values: readonly string[];
}

interface PresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): PresetKeys {
  return { label: t(`${baseKey}.label`), description: t(`${baseKey}.description`) };
}

const K = {
  twoPointers: {
    classic: presetKeys('features.algorithms.scenarios.pointerLab.twoPointers.classic'),
    edgeHit: presetKeys('features.algorithms.scenarios.pointerLab.twoPointers.edgeHit'),
    noMatch: presetKeys('features.algorithms.scenarios.pointerLab.twoPointers.noMatch'),
  },
  slidingWindow: {
    gains: presetKeys('features.algorithms.scenarios.pointerLab.slidingWindow.gains'),
    dips: presetKeys('features.algorithms.scenarios.pointerLab.slidingWindow.dips'),
    tail: presetKeys('features.algorithms.scenarios.pointerLab.slidingWindow.tail'),
  },
  palindrome: {
    classic: presetKeys('features.algorithms.scenarios.pointerLab.palindrome.classic'),
    odd: presetKeys('features.algorithms.scenarios.pointerLab.palindrome.odd'),
    nope: presetKeys('features.algorithms.scenarios.pointerLab.palindrome.nope'),
  },
  reverse: {
    word: presetKeys('features.algorithms.scenarios.pointerLab.reverse.word'),
    digits: presetKeys('features.algorithms.scenarios.pointerLab.reverse.digits'),
  },
} as const;

// ---- TWO POINTERS ------------------------------------------------------
export const TWO_POINTERS_PRESETS: readonly PointerLabPresetOption[] = [
  { id: 'classic', label: K.twoPointers.classic.label, description: K.twoPointers.classic.description },
  { id: 'edgeHit', label: K.twoPointers.edgeHit.label, description: K.twoPointers.edgeHit.description },
  { id: 'noMatch', label: K.twoPointers.noMatch.label, description: K.twoPointers.noMatch.description },
];
export const DEFAULT_TWO_POINTERS_PRESET_ID = 'classic';

export function createTwoPointersScenario(
  _size: number,
  presetId: string | null,
): TwoPointersScenario {
  const id = presetId ?? DEFAULT_TWO_POINTERS_PRESET_ID;
  switch (id) {
    case 'edgeHit':
      return {
        kind: 'two-pointers',
        presetId: 'edgeHit',
        presetLabel: K.twoPointers.edgeHit.label,
        presetDescription: K.twoPointers.edgeHit.description,
        values: [1, 2, 3, 7, 9, 12],
        target: 13,
      };
    case 'noMatch':
      return {
        kind: 'two-pointers',
        presetId: 'noMatch',
        presetLabel: K.twoPointers.noMatch.label,
        presetDescription: K.twoPointers.noMatch.description,
        values: [2, 4, 6, 8, 10],
        target: 15,
      };
    case 'classic':
    default:
      return {
        kind: 'two-pointers',
        presetId: 'classic',
        presetLabel: K.twoPointers.classic.label,
        presetDescription: K.twoPointers.classic.description,
        values: [1, 3, 5, 7, 9, 11, 13, 15],
        target: 14,
      };
  }
}

// ---- SLIDING WINDOW ----------------------------------------------------
export const SLIDING_WINDOW_PRESETS: readonly PointerLabPresetOption[] = [
  { id: 'gains', label: K.slidingWindow.gains.label, description: K.slidingWindow.gains.description },
  { id: 'dips', label: K.slidingWindow.dips.label, description: K.slidingWindow.dips.description },
  { id: 'tail', label: K.slidingWindow.tail.label, description: K.slidingWindow.tail.description },
];
export const DEFAULT_SLIDING_WINDOW_PRESET_ID = 'gains';

export function createSlidingWindowScenario(
  _size: number,
  presetId: string | null,
): SlidingWindowScenario {
  const id = presetId ?? DEFAULT_SLIDING_WINDOW_PRESET_ID;
  switch (id) {
    case 'dips':
      return {
        kind: 'sliding-window',
        presetId: 'dips',
        presetLabel: K.slidingWindow.dips.label,
        presetDescription: K.slidingWindow.dips.description,
        values: [5, 2, 8, 1, 9, 3, 7, 4],
        windowSize: 3,
      };
    case 'tail':
      return {
        kind: 'sliding-window',
        presetId: 'tail',
        presetLabel: K.slidingWindow.tail.label,
        presetDescription: K.slidingWindow.tail.description,
        values: [1, 1, 2, 2, 3, 3, 8, 9],
        windowSize: 3,
      };
    case 'gains':
    default:
      return {
        kind: 'sliding-window',
        presetId: 'gains',
        presetLabel: K.slidingWindow.gains.label,
        presetDescription: K.slidingWindow.gains.description,
        values: [2, 1, 5, 1, 3, 2, 6, 4],
        windowSize: 3,
      };
  }
}

// ---- PALINDROME CHECK --------------------------------------------------
export const PALINDROME_PRESETS: readonly PointerLabPresetOption[] = [
  { id: 'classic', label: K.palindrome.classic.label, description: K.palindrome.classic.description },
  { id: 'odd', label: K.palindrome.odd.label, description: K.palindrome.odd.description },
  { id: 'nope', label: K.palindrome.nope.label, description: K.palindrome.nope.description },
];
export const DEFAULT_PALINDROME_PRESET_ID = 'classic';

export function createPalindromeScenario(
  _size: number,
  presetId: string | null,
): PalindromeCheckScenario {
  const id = presetId ?? DEFAULT_PALINDROME_PRESET_ID;
  switch (id) {
    case 'odd':
      return {
        kind: 'palindrome-check',
        presetId: 'odd',
        presetLabel: K.palindrome.odd.label,
        presetDescription: K.palindrome.odd.description,
        word: 'radar',
      };
    case 'nope':
      return {
        kind: 'palindrome-check',
        presetId: 'nope',
        presetLabel: K.palindrome.nope.label,
        presetDescription: K.palindrome.nope.description,
        word: 'palette',
      };
    case 'classic':
    default:
      return {
        kind: 'palindrome-check',
        presetId: 'classic',
        presetLabel: K.palindrome.classic.label,
        presetDescription: K.palindrome.classic.description,
        word: 'kayak',
      };
  }
}

// ---- REVERSE -----------------------------------------------------------
export const REVERSE_PRESETS: readonly PointerLabPresetOption[] = [
  { id: 'word', label: K.reverse.word.label, description: K.reverse.word.description },
  { id: 'digits', label: K.reverse.digits.label, description: K.reverse.digits.description },
];
export const DEFAULT_REVERSE_PRESET_ID = 'word';

export function createReverseScenario(_size: number, presetId: string | null): ReverseScenario {
  const id = presetId ?? DEFAULT_REVERSE_PRESET_ID;
  if (id === 'digits') {
    return {
      kind: 'reverse',
      presetId: 'digits',
      presetLabel: K.reverse.digits.label,
      presetDescription: K.reverse.digits.description,
      values: ['9', '3', '7', '1', '4', '8'],
    };
  }
  return {
    kind: 'reverse',
    presetId: 'word',
    presetLabel: K.reverse.word.label,
    presetDescription: K.reverse.word.description,
    values: ['f', 'l', 'o', 'w', 'e', 'r'],
  };
}
