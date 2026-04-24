import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  AugmentedRow,
  DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID,
  GAUSSIAN_ELIMINATION_TASKS,
  GaussianEliminationTask,
  parseGaussianSystem,
} from './gaussian-elimination';

export interface GaussianEliminationPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface GaussianEliminationScenario extends BaseScenario {
  readonly kind: 'gaussian-elimination';
  /** Parsed augmented matrix, rows × (variableCount + 1) cells. */
  readonly matrix: readonly AugmentedRow[];
  /** Column index at which the vertical divider sits (coefficients
   *  to the left, RHS to the right). Always `matrix[0].length - 1`. */
  readonly variableCount: number;
  readonly taskPrompt: TranslatableText | null;
}

export const GAUSSIAN_ELIMINATION_PRESETS: readonly GaussianEliminationPresetOption[] =
  GAUSSIAN_ELIMINATION_TASKS.map((task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }));

export const DEFAULT_GAUSSIAN_ELIMINATION_PRESET_ID = DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID;
export { GAUSSIAN_ELIMINATION_TASKS, DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID };
export type GaussianEliminationValues = GaussianEliminationTask['defaultValues'];

export function createGaussianEliminationScenario(
  _size: number,
  presetId: string | null,
  customValues?: GaussianEliminationValues,
): GaussianEliminationScenario {
  const id = presetId ?? DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID;
  const task =
    GAUSSIAN_ELIMINATION_TASKS.find((candidate) => candidate.id === id) ??
    GAUSSIAN_ELIMINATION_TASKS.find(
      (candidate) => candidate.id === DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID,
    ) ??
    GAUSSIAN_ELIMINATION_TASKS[0];
  const values = customValues ?? task.defaultValues;
  const parsed =
    parseGaussianSystem(values.system) ??
    parseGaussianSystem(task.defaultValues.system) ??
    { matrix: [[1, 0]], variableCount: 1 };
  return {
    kind: 'gaussian-elimination',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      system: formatSystemForPrompt(parsed.matrix, parsed.variableCount),
    }),
    matrix: parsed.matrix,
    variableCount: parsed.variableCount,
  };
}

/** Format the augmented matrix as a readable list of equations for
 *  the "Zadanie:" block — `3x + 2y = 7, x − y = 1`. Works for any
 *  variable count, so 3×3 / 4×4 tasks can reuse the scenario adapter
 *  without touching the prompt renderer. */
function formatSystemForPrompt(
  matrix: readonly AugmentedRow[],
  variableCount: number,
): string {
  const varNames = VARIABLE_NAMES;
  const rendered = matrix.map((row) => {
    const parts: string[] = [];
    for (let j = 0; j < variableCount; j++) {
      const coeff = row[j];
      if (coeff === 0) continue;
      const absCoeff = Math.abs(coeff);
      const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
      const coeffStr = absCoeff === 1 ? '' : formatNumber(absCoeff);
      parts.push(`${sign} ${coeffStr}${varNames[j] ?? `x_{${j + 1}}`}`);
    }
    const lhs = parts.join(' ').trim() || '0';
    const rhs = formatNumber(row[variableCount]);
    return `${lhs} = ${rhs}`;
  });
  return `[[math]]${rendered.join(', \\quad ')}[[/math]]`;
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  // Keep at most 4 decimal places; trim trailing zeros.
  return value.toFixed(4).replace(/\.?0+$/, '');
}
