import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Values for a Simplex task describing a standard-form linear
 *  program:
 *
 *     max  cᵀx
 *     s.t. Ax ≤ b,   x ≥ 0
 *
 *  - `objective` — whitespace-separated coefficients of the objective
 *    vector `c` (length equals the number of decision variables).
 *  - `constraints` — one row per ≤-constraint; whitespace separates
 *    the coefficient columns, `|` splits them from the right-hand
 *    side, `;` separates rows. Example for `x + y ≤ 12, 2x + y ≤ 16`
 *    the string is `"1 1 | 12; 2 1 | 16"`. Same format as the
 *    Gaussian-elimination system parser so students only learn one
 *    matrix-entry convention.
 *
 *  Non-negativity (`x ≥ 0`) is implicit for every variable. */
export interface SimplexAlgorithmTaskValues {
  readonly objective: string;
  readonly constraints: string;
}

export type SimplexAlgorithmTask = NotebookTask<SimplexAlgorithmTaskValues>;

export const SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA: TaskInputSchema<SimplexAlgorithmTaskValues> =
  {
    objective: {
      kind: 'string',
      label: t('features.algorithms.tasks.simplexAlgorithm.values.objective'),
      placeholder: t(
        'features.algorithms.tasks.simplexAlgorithm.values.objectivePlaceholder',
      ),
      pattern: /^\s*-?\d+(\.\d+)?(\s+-?\d+(\.\d+)?)*\s*$/,
      minLength: 1,
      maxLength: 120,
    },
    constraints: {
      kind: 'string',
      label: t('features.algorithms.tasks.simplexAlgorithm.values.constraints'),
      placeholder: t(
        'features.algorithms.tasks.simplexAlgorithm.values.constraintsPlaceholder',
      ),
      pattern: /^\s*[-\d.\s|]+(\s*;\s*[-\d.\s|]+)*\s*$/,
      minLength: 3,
      maxLength: 240,
    },
  };

/** Parsed LP input — objective coefficients, constraint matrix `A`
 *  (rows × variables), and right-hand side vector `b`. The variable
 *  count matches `objective.length`; every constraint row must share
 *  that width. */
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
  const tokens = raw.trim().split(/\s+/).filter((s) => s.length > 0);
  if (tokens.length === 0) return null;
  const out: number[] = [];
  for (const tok of tokens) {
    const value = Number.parseFloat(tok);
    if (!Number.isFinite(value)) return null;
    out.push(value);
  }
  return out;
}
