import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import {
  DEFAULT_EUCLIDEAN_GCD_TASK_ID,
  EUCLIDEAN_GCD_TASKS,
  parseNumberList,
} from './euclidean-gcd';
import type { GcdNotebookFlow, GcdTask, GcdTaskValues } from './euclidean-gcd';

export interface NumberLabPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

/** Discriminated-union scenario shape. Each algorithm family in the
 *  number-lab group picks its own kind; the view-config dispatches to
 *  the right generator based on `kind`. */
export type NumberLabScenario = FibonacciScenario | FactorialScenario | EuclideanGcdScenario;

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
  readonly values: EuclideanGcdResolvedValues;
  readonly notebookFlow: GcdNotebookFlow;
  /** Exam-style prompt pulled from the active task (NotebookTask
   *  `instruction` field). Rendered as a "Task:" block atop the
   *  scratchpad. Null when the task did not declare a prompt. */
  readonly taskPrompt: TranslatableText | null;
}

export interface EuclideanGcdResolvedValues {
  readonly a: number;
  readonly b: number;
  readonly values: readonly number[];
  readonly numerator: number;
  readonly denominator: number;
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
/* The authoritative task roster lives in `../gcd-tasks/` — one file per
 *  task, each carrying its own title / summary / instruction / hints.
 *  Everything below is a thin adapter: the legacy preset-option shape
 *  is derived from the task list so the scratchpad per-viz picker (if
 *  still mounted anywhere) keeps working, and the scenario factory
 *  resolves task ids against the same list instead of a local switch. */
export const EUCLIDEAN_GCD_PRESETS: readonly NumberLabPresetOption[] = EUCLIDEAN_GCD_TASKS.map(
  (task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }),
);
export const DEFAULT_EUCLIDEAN_GCD_PRESET_ID = DEFAULT_EUCLIDEAN_GCD_TASK_ID;
export { EUCLIDEAN_GCD_TASKS, DEFAULT_EUCLIDEAN_GCD_TASK_ID };
export type EuclideanGcdValues = GcdTask['defaultValues'];

export function createEuclideanGcdScenario(
  _size: number,
  presetId: string | null,
  customValues?: EuclideanGcdValues,
): EuclideanGcdScenario {
  const id = presetId ?? DEFAULT_EUCLIDEAN_GCD_TASK_ID;
  const task =
    EUCLIDEAN_GCD_TASKS.find((candidate) => candidate.id === id) ??
    EUCLIDEAN_GCD_TASKS.find((candidate) => candidate.id === DEFAULT_EUCLIDEAN_GCD_TASK_ID) ??
    EUCLIDEAN_GCD_TASKS[0];
  const values: GcdTaskValues = { ...task.defaultValues, ...customValues };
  const resolved = resolveGcdValues(values, task.defaultValues);
  return {
    kind: 'euclidean-gcd',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildGcdTaskPrompt(task.notebookFlow, resolved),
    notebookFlow: task.notebookFlow,
    values: resolved,
    a: resolved.a,
    b: resolved.b,
  };
}

function resolveGcdValues(
  values: GcdTaskValues,
  defaults: GcdTaskValues,
): EuclideanGcdResolvedValues {
  const list = listValue(values.values, defaults.values, [252, 198, 126, 90]);
  const numerator = numberValue(values.numerator, numberValue(defaults.numerator, 4620));
  const denominator = numberValue(values.denominator, numberValue(defaults.denominator, 1078));
  return {
    a: numberValue(values.a, numberValue(defaults.a, list[0] ?? numerator)),
    b: numberValue(values.b, numberValue(defaults.b, list[1] ?? denominator)),
    values: list,
    numerator,
    denominator,
  };
}

function buildGcdTaskPrompt(
  flow: GcdNotebookFlow,
  values: EuclideanGcdResolvedValues,
): TranslatableText {
  switch (flow.kind) {
    case 'basic':
      return [
        'Oblicz:',
        '',
        `[[math]]gcd(${values.a}, ${values.b})[[/math]]`,
        '',
        'używając klasycznego algorytmu Euklidesa z dzieleniem z resztą.',
      ].join('\n');
    case 'fibonacci-worst-case':
      return [
        'Oblicz:',
        '',
        `[[math]]gcd(${values.a}, ${values.b})[[/math]]`,
        '',
        'Pokaż pełny łańcuch dzielenia. Zauważ, że kolejne liczby Fibonacciego dają bardzo długi przebieg algorytmu Euklidesa.',
      ].join('\n');
    case 'multi-number-fold':
      return [
        'Oblicz największy wspólny dzielnik liczb:',
        '',
        `[[math]]${values.values.join(', ')}[[/math]]`,
        '',
        'Użyj własności:',
        '',
        '[[math]]gcd(a, b, c, d) = gcd(gcd(gcd(a, b), c), d)[[/math]]',
      ].join('\n');
    case 'fraction-reduction':
      return [
        'Skróć ułamek:',
        '',
        `[[math]]${values.numerator} / ${values.denominator}[[/math]]`,
        '',
        `Najpierw oblicz [[math]]gcd(${values.numerator}, ${values.denominator})[[/math]], a potem podziel licznik i mianownik przez otrzymany NWD.`,
      ].join('\n');
    case 'subtractive-to-division':
      return [
        'Oblicz:',
        '',
        `[[math]]gcd(${values.a}, ${values.b})[[/math]]`,
        '',
        `Najpierw pokaż wersję przez powtarzane odejmowanie, a potem zapisz ten sam proces krócej jako dzielenie z resztą. Na końcu zinterpretuj wynik jako największy rozmiar kwadratowego kafelka dla prostokąta [[math]]${values.a} x ${values.b}[[/math]].`,
      ].join('\n');
  }
}

function listValue(
  input: string | undefined,
  fallbackInput: string | undefined,
  hardFallback: readonly number[],
): readonly number[] {
  const parsed = parseNumberList(input);
  if (parsed.length > 0) return parsed;
  const fallback = parseNumberList(fallbackInput);
  return fallback.length > 0 ? fallback : hardFallback;
}

function numberValue(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
