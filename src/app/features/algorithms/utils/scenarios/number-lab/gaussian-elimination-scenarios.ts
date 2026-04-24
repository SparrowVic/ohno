import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import {
  type AugmentedRow,
  DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID,
  GAUSSIAN_ELIMINATION_TASKS,
  type GaussianEliminationNotebookFlow,
  type GaussianEliminationTask,
  type GaussianEliminationTaskValues,
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
  readonly notebookFlow: GaussianEliminationNotebookFlow;
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
  const values: GaussianEliminationTaskValues = {
    ...task.defaultValues,
    ...customValues,
  };
  const parsed = parseGaussianSystem(values.system) ??
    parseGaussianSystem(task.defaultValues.system) ?? { matrix: [[1, 0]], variableCount: 1 };
  return {
    kind: 'gaussian-elimination',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, parsed.matrix, parsed.variableCount),
    notebookFlow: task.notebookFlow,
    matrix: parsed.matrix,
    variableCount: parsed.variableCount,
  };
}

function buildTaskPrompt(
  flow: GaussianEliminationNotebookFlow,
  matrix: readonly AugmentedRow[],
  variableCount: number,
): TranslatableText {
  const equations = formatSystemForPrompt(matrix, variableCount);
  switch (flow.kind) {
    case 'basic-2x2':
      return [
        'Rozwiąż układ równań metodą eliminacji Gaussa:',
        '',
        equations,
        '',
        'Pokaż eliminację w przód, eliminację wstecz, sprawdzenie i wynik.',
      ].join('\n');
    case 'row-swap':
      return [
        'Rozwiąż układ 3x3 metodą eliminacji Gaussa:',
        '',
        equations,
        '',
        'Pierwszy pivot w kolumnie x jest zerowy, więc zacznij od zamiany wierszy.',
      ].join('\n');
    case 'fraction-pivots':
      return [
        'Rozwiąż układ 3x3 metodą Gaussa-Jordana:',
        '',
        equations,
        '',
        'Zapisz normalizacje pivotów oraz ułamki pojawiające się w macierzy.',
      ].join('\n');
    case 'infinite-solutions':
      return [
        'Zbadaj układ zależny metodą eliminacji Gaussa:',
        '',
        equations,
        '',
        'Jeżeli pojawi się zmienna wolna, zapisz rodzinę rozwiązań z parametrem.',
      ].join('\n');
    case 'inconsistent-system':
      return [
        'Sprawdź, czy układ ma rozwiązanie:',
        '',
        equations,
        '',
        'Zakończ obliczenia, gdy eliminacja doprowadzi do sprzecznego wiersza.',
      ].join('\n');
  }
}

function formatSystemForPrompt(matrix: readonly AugmentedRow[], variableCount: number): string {
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
    return `[[math]]${lhs} = ${rhs}[[/math]]`;
  });
  return rendered.join('\n');
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  // Keep at most 4 decimal places; trim trailing zeros.
  return value.toFixed(4).replace(/\.?0+$/, '');
}
