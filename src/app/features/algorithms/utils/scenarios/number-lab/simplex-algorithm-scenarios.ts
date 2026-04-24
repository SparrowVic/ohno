import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_SIMPLEX_ALGORITHM_TASK_ID,
  SIMPLEX_ALGORITHM_TASKS,
  SimplexAlgorithmTask,
  parseLinearProgram,
} from './simplex-algorithm';

export interface SimplexAlgorithmPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface SimplexAlgorithmScenario extends BaseScenario {
  readonly kind: 'simplex-algorithm';
  readonly objective: readonly number[];
  readonly constraintMatrix: readonly (readonly number[])[];
  readonly rhs: readonly number[];
  readonly taskPrompt: TranslatableText | null;
}

export const SIMPLEX_ALGORITHM_PRESETS: readonly SimplexAlgorithmPresetOption[] =
  SIMPLEX_ALGORITHM_TASKS.map((task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }));

export const DEFAULT_SIMPLEX_ALGORITHM_PRESET_ID = DEFAULT_SIMPLEX_ALGORITHM_TASK_ID;
export { SIMPLEX_ALGORITHM_TASKS, DEFAULT_SIMPLEX_ALGORITHM_TASK_ID };
export type SimplexAlgorithmValues = SimplexAlgorithmTask['defaultValues'];

export function createSimplexAlgorithmScenario(
  _size: number,
  presetId: string | null,
  customValues?: SimplexAlgorithmValues,
): SimplexAlgorithmScenario {
  const id = presetId ?? DEFAULT_SIMPLEX_ALGORITHM_TASK_ID;
  const task =
    SIMPLEX_ALGORITHM_TASKS.find((candidate) => candidate.id === id) ??
    SIMPLEX_ALGORITHM_TASKS.find(
      (candidate) => candidate.id === DEFAULT_SIMPLEX_ALGORITHM_TASK_ID,
    ) ??
    SIMPLEX_ALGORITHM_TASKS[0];
  const values = customValues ?? task.defaultValues;
  const parsed =
    parseLinearProgram(values.objective, values.constraints) ??
    parseLinearProgram(
      task.defaultValues.objective,
      task.defaultValues.constraints,
    );
  const fallback: SimplexAlgorithmScenario = {
    kind: 'simplex-algorithm',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      objective: '0',
      constraints: '',
    }),
    objective: [1],
    constraintMatrix: [[1]],
    rhs: [0],
  };
  if (!parsed) return fallback;
  return {
    kind: 'simplex-algorithm',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      objective: formatObjectiveForPrompt(parsed.objective),
      constraints: formatConstraintsForPrompt(
        parsed.constraintMatrix,
        parsed.rhs,
      ),
    }),
    objective: parsed.objective,
    constraintMatrix: parsed.constraintMatrix,
    rhs: parsed.rhs,
  };
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;

function formatObjectiveForPrompt(objective: readonly number[]): string {
  const parts: string[] = [];
  for (let j = 0; j < objective.length; j++) {
    const coeff = objective[j];
    if (coeff === 0) continue;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
    const coeffStr = absCoeff === 1 ? '' : formatNumber(absCoeff);
    const name = VARIABLE_NAMES[j] ?? `x_{${j + 1}}`;
    parts.push(`${sign} ${coeffStr}${name}`);
  }
  const body = parts.join(' ').trim() || '0';
  return `[[math]]z = ${body}[[/math]]`;
}

function formatConstraintsForPrompt(
  matrix: readonly (readonly number[])[],
  rhs: readonly number[],
): string {
  const lines = matrix.map((row, i) => {
    const parts: string[] = [];
    for (let j = 0; j < row.length; j++) {
      const coeff = row[j];
      if (coeff === 0) continue;
      const absCoeff = Math.abs(coeff);
      const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
      const coeffStr = absCoeff === 1 ? '' : formatNumber(absCoeff);
      const name = VARIABLE_NAMES[j] ?? `x_{${j + 1}}`;
      parts.push(`${sign} ${coeffStr}${name}`);
    }
    const lhs = parts.join(' ').trim() || '0';
    return `${lhs} \\leq ${formatNumber(rhs[i])}`;
  });
  return `[[math]]${lines.join(', \\quad ')}[[/math]]`;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.?0+$/, '');
}
