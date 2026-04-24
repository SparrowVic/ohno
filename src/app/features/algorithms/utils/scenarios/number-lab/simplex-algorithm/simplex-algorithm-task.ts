import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

export interface SimplexAlgorithmTaskValues {
  readonly objective: string;
  readonly constraints: string;
}

export type SimplexNotebookFlow =
  | { readonly kind: 'basic-max-profit' }
  | { readonly kind: 'slack-non-binding' }
  | { readonly kind: 'degenerate-tie' }
  | { readonly kind: 'alternative-optimum' }
  | { readonly kind: 'unbounded-ray' };

export interface SimplexAlgorithmTask extends NotebookTask<SimplexAlgorithmTaskValues> {
  readonly notebookFlow: SimplexNotebookFlow;
}

export const SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA: TaskInputSchema<SimplexAlgorithmTaskValues> = {
  objective: {
    kind: 'string',
    label: 'objective',
    pattern: /^\s*-?\d+(\.\d+)?(\s+-?\d+(\.\d+)?)*\s*$/,
    minLength: 1,
    maxLength: 120,
  },
  constraints: {
    kind: 'string',
    label: 'constraints',
    pattern: /^\s*[-\d.| \t\r\n\f\v]+(?:\s*;\s*[-\d.| \t\r\n\f\v]+)*\s*$/,
    minLength: 3,
    maxLength: 320,
  },
};

export interface ParsedLinearProgram {
  readonly objective: readonly number[];
  readonly constraintMatrix: readonly (readonly number[])[];
  readonly rhs: readonly number[];
}

export function parseLinearProgram(
  objectiveText: string,
  constraintsText: string,
): ParsedLinearProgram | null {
  const objective = parseNumbers(objectiveText);
  if (!objective || objective.length === 0) return null;
  const constraintMatrix: number[][] = [];
  const rhs: number[] = [];
  for (const rawRow of constraintsText.split(';')) {
    if (!rawRow.trim()) return null;
    const [coeffPart, rhsPart] = rawRow.split('|');
    if (coeffPart === undefined || rhsPart === undefined) return null;
    const coeffs = parseNumbers(coeffPart);
    const rhsValues = parseNumbers(rhsPart);
    if (!coeffs || !rhsValues) return null;
    if (rhsValues.length !== 1) return null;
    if (coeffs.length !== objective.length) return null;
    constraintMatrix.push(coeffs);
    rhs.push(rhsValues[0]);
  }
  if (constraintMatrix.length === 0) return null;
  return { objective, constraintMatrix, rhs };
}

function parseNumbers(raw: string): number[] | null {
  const tokens = raw
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0);
  if (tokens.length === 0) return null;
  const out: number[] = [];
  for (const tok of tokens) {
    const value = Number.parseFloat(tok);
    if (!Number.isFinite(value)) return null;
    out.push(value);
  }
  return out;
}
