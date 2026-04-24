import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { Task } from '../../../models/task';

export interface PointerLabPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export type PointerLabScenario =
  | TwoPointersScenario
  | SlidingWindowScenario
  | PalindromeCheckScenario
  | ReverseScenario
  | KadaneScenario;

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

export interface KadaneScenario extends BaseScenario {
  readonly kind: 'kadane';
  /** Integer array — generator expects at least one negative value to
   *  motivate the "reset vs. extend" decision. */
  readonly values: readonly number[];
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
  kadane: {
    classic: presetKeys('features.algorithms.scenarios.pointerLab.kadane.classic'),
    mostlyNegative: presetKeys('features.algorithms.scenarios.pointerLab.kadane.mostlyNegative'),
    allNegative: presetKeys('features.algorithms.scenarios.pointerLab.kadane.allNegative'),
    zigzag: presetKeys('features.algorithms.scenarios.pointerLab.kadane.zigzag'),
  },
} as const;

// ---- TWO POINTERS ------------------------------------------------------
export const TWO_POINTERS_PRESETS: readonly PointerLabPresetOption[] = [
  { id: 'classic', label: K.twoPointers.classic.label, description: K.twoPointers.classic.description },
  { id: 'edgeHit', label: K.twoPointers.edgeHit.label, description: K.twoPointers.edgeHit.description },
  { id: 'noMatch', label: K.twoPointers.noMatch.label, description: K.twoPointers.noMatch.description },
];
export const DEFAULT_TWO_POINTERS_PRESET_ID = 'classic';

/** `target` is the only customizable scalar — the sorted array stays
 *  fixed per preset. Student can test "does my chosen target exist in
 *  THIS array?" without having to rebuild the array itself. */
export interface TwoPointersValues {
  readonly target: number;
}

const TWO_POINTERS_TARGET_SCHEMA = {
  target: {
    kind: 'int' as const,
    label: t('features.algorithms.tasks.pointerLab.twoPointers.target'),
  },
};

export const TWO_POINTERS_TASKS: readonly Task<TwoPointersValues>[] = [
  {
    id: 'classic',
    name: K.twoPointers.classic.label,
    defaultValues: { target: 14 },
    inputSchema: TWO_POINTERS_TARGET_SCHEMA,
    codeSnippetId: 'two-pointers',
  },
  {
    id: 'edgeHit',
    name: K.twoPointers.edgeHit.label,
    defaultValues: { target: 13 },
    inputSchema: TWO_POINTERS_TARGET_SCHEMA,
    codeSnippetId: 'two-pointers',
  },
  {
    id: 'noMatch',
    name: K.twoPointers.noMatch.label,
    defaultValues: { target: 15 },
    inputSchema: TWO_POINTERS_TARGET_SCHEMA,
    codeSnippetId: 'two-pointers',
  },
];
export const DEFAULT_TWO_POINTERS_TASK_ID = 'classic';

export function createTwoPointersScenario(
  _size: number,
  presetId: string | null,
  customValues?: TwoPointersValues,
): TwoPointersScenario {
  const id = presetId ?? DEFAULT_TWO_POINTERS_PRESET_ID;
  const base = resolveTwoPointersBase(id);
  return {
    kind: 'two-pointers',
    presetId: base.presetId,
    presetLabel: base.presetLabel,
    presetDescription: base.presetDescription,
    values: base.values,
    target: customValues?.target ?? base.target,
  };
}

function resolveTwoPointersBase(id: string): Omit<TwoPointersScenario, 'kind'> {
  switch (id) {
    case 'edgeHit':
      return {
        presetId: 'edgeHit',
        presetLabel: K.twoPointers.edgeHit.label,
        presetDescription: K.twoPointers.edgeHit.description,
        values: [1, 2, 3, 7, 9, 12],
        target: 13,
      };
    case 'noMatch':
      return {
        presetId: 'noMatch',
        presetLabel: K.twoPointers.noMatch.label,
        presetDescription: K.twoPointers.noMatch.description,
        values: [2, 4, 6, 8, 10],
        target: 15,
      };
    case 'classic':
    default:
      return {
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

export interface SlidingWindowValues {
  readonly windowSize: number;
}

const SLIDING_WINDOW_SIZE_SCHEMA = {
  windowSize: {
    kind: 'int' as const,
    label: t('features.algorithms.tasks.pointerLab.slidingWindow.windowSize'),
    min: 1,
    max: 10,
  },
};

export const SLIDING_WINDOW_TASKS: readonly Task<SlidingWindowValues>[] = [
  {
    id: 'gains',
    name: K.slidingWindow.gains.label,
    defaultValues: { windowSize: 3 },
    inputSchema: SLIDING_WINDOW_SIZE_SCHEMA,
    codeSnippetId: 'sliding-window',
  },
  {
    id: 'dips',
    name: K.slidingWindow.dips.label,
    defaultValues: { windowSize: 3 },
    inputSchema: SLIDING_WINDOW_SIZE_SCHEMA,
    codeSnippetId: 'sliding-window',
  },
  {
    id: 'tail',
    name: K.slidingWindow.tail.label,
    defaultValues: { windowSize: 3 },
    inputSchema: SLIDING_WINDOW_SIZE_SCHEMA,
    codeSnippetId: 'sliding-window',
  },
];
export const DEFAULT_SLIDING_WINDOW_TASK_ID = 'gains';

export function createSlidingWindowScenario(
  _size: number,
  presetId: string | null,
  customValues?: SlidingWindowValues,
): SlidingWindowScenario {
  const id = presetId ?? DEFAULT_SLIDING_WINDOW_PRESET_ID;
  const base = resolveSlidingWindowBase(id);
  return {
    kind: 'sliding-window',
    presetId: base.presetId,
    presetLabel: base.presetLabel,
    presetDescription: base.presetDescription,
    values: base.values,
    windowSize: customValues?.windowSize ?? base.windowSize,
  };
}

function resolveSlidingWindowBase(id: string): Omit<SlidingWindowScenario, 'kind'> {
  switch (id) {
    case 'dips':
      return {
        presetId: 'dips',
        presetLabel: K.slidingWindow.dips.label,
        presetDescription: K.slidingWindow.dips.description,
        values: [5, 2, 8, 1, 9, 3, 7, 4],
        windowSize: 3,
      };
    case 'tail':
      return {
        presetId: 'tail',
        presetLabel: K.slidingWindow.tail.label,
        presetDescription: K.slidingWindow.tail.description,
        values: [1, 1, 2, 2, 3, 3, 8, 9],
        windowSize: 3,
      };
    case 'gains':
    default:
      return {
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

/** `word` is a string — v1 popover only supports int fields, so the
 *  schema stays empty and the ✎ button auto-hides. Adds back in v2
 *  once string fields land (candidate for every algorithm here). */
export type PalindromeValues = Record<string, never>;

export const PALINDROME_TASKS: readonly Task<PalindromeValues>[] = [
  {
    id: 'classic',
    name: K.palindrome.classic.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'palindrome-check',
  },
  {
    id: 'odd',
    name: K.palindrome.odd.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'palindrome-check',
  },
  {
    id: 'nope',
    name: K.palindrome.nope.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'palindrome-check',
  },
];
export const DEFAULT_PALINDROME_TASK_ID = 'classic';

export function createPalindromeScenario(
  _size: number,
  presetId: string | null,
  _customValues?: PalindromeValues,
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

export type ReverseValues = Record<string, never>;

export const REVERSE_TASKS: readonly Task<ReverseValues>[] = [
  {
    id: 'word',
    name: K.reverse.word.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'reverse',
  },
  {
    id: 'digits',
    name: K.reverse.digits.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'reverse',
  },
];
export const DEFAULT_REVERSE_TASK_ID = 'word';

export function createReverseScenario(
  _size: number,
  presetId: string | null,
  _customValues?: ReverseValues,
): ReverseScenario {
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

// ---- KADANE ------------------------------------------------------------
export const KADANE_PRESETS: readonly PointerLabPresetOption[] = [
  { id: 'classic', label: K.kadane.classic.label, description: K.kadane.classic.description },
  {
    id: 'mostlyNegative',
    label: K.kadane.mostlyNegative.label,
    description: K.kadane.mostlyNegative.description,
  },
  {
    id: 'allNegative',
    label: K.kadane.allNegative.label,
    description: K.kadane.allNegative.description,
  },
  { id: 'zigzag', label: K.kadane.zigzag.label, description: K.kadane.zigzag.description },
];
export const DEFAULT_KADANE_PRESET_ID = 'classic';

export type KadaneValues = Record<string, never>;

export const KADANE_TASKS: readonly Task<KadaneValues>[] = [
  {
    id: 'classic',
    name: K.kadane.classic.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'kadane',
  },
  {
    id: 'mostlyNegative',
    name: K.kadane.mostlyNegative.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'kadane',
  },
  {
    id: 'allNegative',
    name: K.kadane.allNegative.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'kadane',
  },
  {
    id: 'zigzag',
    name: K.kadane.zigzag.label,
    defaultValues: {},
    inputSchema: {},
    codeSnippetId: 'kadane',
  },
];
export const DEFAULT_KADANE_TASK_ID = 'classic';

export function createKadaneScenario(
  _size: number,
  presetId: string | null,
  _customValues?: KadaneValues,
): KadaneScenario {
  const id = presetId ?? DEFAULT_KADANE_PRESET_ID;
  switch (id) {
    case 'mostlyNegative':
      return {
        kind: 'kadane',
        presetId: 'mostlyNegative',
        presetLabel: K.kadane.mostlyNegative.label,
        presetDescription: K.kadane.mostlyNegative.description,
        values: [-3, -1, 4, -1, -2, -5, 2, -4],
      };
    case 'allNegative':
      return {
        kind: 'kadane',
        presetId: 'allNegative',
        presetLabel: K.kadane.allNegative.label,
        presetDescription: K.kadane.allNegative.description,
        values: [-8, -3, -6, -2, -5, -7],
      };
    case 'zigzag':
      return {
        kind: 'kadane',
        presetId: 'zigzag',
        presetLabel: K.kadane.zigzag.label,
        presetDescription: K.kadane.zigzag.description,
        values: [4, -1, 5, -8, 3, -2, 7, -3, 2],
      };
    case 'classic':
    default:
      return {
        kind: 'kadane',
        presetId: 'classic',
        presetLabel: K.kadane.classic.label,
        presetDescription: K.kadane.classic.description,
        values: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      };
  }
}
