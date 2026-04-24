import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import {
  DEFAULT_SIMPLEX_ALGORITHM_TASK_ID,
  SIMPLEX_ALGORITHM_TASKS,
  parseLinearProgram,
} from './simplex-algorithm';
import type {
  SimplexAlgorithmTask,
  SimplexAlgorithmTaskValues,
  SimplexNotebookFlow,
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
  readonly notebookFlow: SimplexNotebookFlow;
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
  const values: SimplexAlgorithmTaskValues = {
    ...task.defaultValues,
    ...customValues,
  };
  const parsed =
    parseLinearProgram(values.objective, values.constraints) ??
    parseLinearProgram(task.defaultValues.objective, task.defaultValues.constraints);
  const fallbackParsed = parsed ??
    parseLinearProgram('40 30', '1 1 | 12; 2 1 | 16') ?? {
      objective: [1],
      constraintMatrix: [[1]],
      rhs: [0],
    };

  return {
    kind: 'simplex-algorithm',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, fallbackParsed),
    notebookFlow: task.notebookFlow,
    objective: fallbackParsed.objective,
    constraintMatrix: fallbackParsed.constraintMatrix,
    rhs: fallbackParsed.rhs,
  };
}

function buildTaskPrompt(
  flow: SimplexNotebookFlow,
  parsed: {
    readonly objective: readonly number[];
    readonly constraintMatrix: readonly (readonly number[])[];
    readonly rhs: readonly number[];
  },
): TranslatableText {
  const objective = formatObjectiveForPrompt(parsed.objective);
  const constraints = formatConstraintsForPrompt(parsed.constraintMatrix, parsed.rhs);
  switch (flow.kind) {
    case 'basic-max-profit':
      return [
        'Rozwiąż metodą simplex klasyczny problem maksymalizacji:',
        '',
        objective,
        constraints,
        '',
        'Pokaż wybór kolumny wchodzącej, test ilorazów, pivoty i odczyt optimum.',
      ].join('\n');
    case 'slack-non-binding':
      return [
        'Rozwiąż LP metodą simplex i wskaż zasób, który nie zostanie w pełni wykorzystany:',
        '',
        objective,
        constraints,
        '',
        'Po optimum odczytaj dodatni slack jako niewiążące ograniczenie.',
      ].join('\n');
    case 'degenerate-tie':
      return [
        'Rozwiąż LP z remisem w teście ilorazów i degeneracją:',
        '',
        objective,
        constraints,
        '',
        'Zwróć uwagę na pivot z ilorazem 0 i brak poprawy wartości celu.',
      ].join('\n');
    case 'alternative-optimum':
      return [
        'Rozwiąż LP i sprawdź, czy optimum jest jednoznaczne:',
        '',
        objective,
        constraints,
        '',
        'Na końcu sprawdź zerowy koszt zredukowany zmiennej niebazowej.',
      ].join('\n');
    case 'unbounded-ray':
      return [
        'Wykryj przypadek nieograniczony metodą simplex:',
        '',
        objective,
        constraints,
        '',
        'Jeśli kolumna wchodząca nie ma dodatnich elementów, test ilorazów nie wybiera wiersza wychodzącego.',
      ].join('\n');
  }
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;

function formatObjectiveForPrompt(objective: readonly number[]): string {
  return `[[math]]max\\ z = ${formatLinearCombination(objective)}[[/math]]`;
}

function formatConstraintsForPrompt(
  matrix: readonly (readonly number[])[],
  rhs: readonly number[],
): string {
  const lines = matrix.map(
    (row, i) => `[[math]]${formatLinearCombination(row)} \\le ${formatNumber(rhs[i])}[[/math]]`,
  );
  return lines.join('\n');
}

function formatLinearCombination(coefficients: readonly number[]): string {
  const parts: string[] = [];
  for (let j = 0; j < coefficients.length; j++) {
    const coeff = coefficients[j];
    if (coeff === 0) continue;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
    const coeffStr = absCoeff === 1 ? '' : formatNumber(absCoeff);
    const name = VARIABLE_NAMES[j] ?? `x_{${j + 1}}`;
    parts.push(`${sign} ${coeffStr}${name}`.trim());
  }
  return parts.join(' ') || '0';
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.?0+$/, '');
}
