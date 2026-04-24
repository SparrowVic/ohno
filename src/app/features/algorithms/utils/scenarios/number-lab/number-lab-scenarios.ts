import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_EUCLIDEAN_GCD_TASK_ID,
  EUCLIDEAN_GCD_TASKS,
  GcdTask,
} from './euclidean-gcd';

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
  /** Exam-style prompt pulled from the active task (NotebookTask
   *  `instruction` field). Rendered as a "Task:" block atop the
   *  scratchpad. Null when the task did not declare a prompt. */
  readonly taskPrompt: TranslatableText | null;
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
  const a = customValues?.a ?? task.defaultValues.a;
  const b = customValues?.b ?? task.defaultValues.b;
  return {
    kind: 'euclidean-gcd',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, { a, b }),
    a,
    b,
  };
}
