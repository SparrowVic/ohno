import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

/** Values for a Gaussian-elimination task. The augmented matrix is
 *  entered as a free-form string — rows separated by `;`, `|` marks
 *  the split between coefficient columns and the right-hand side,
 *  whitespace separates numbers. Example: `"1 1 | 5; 1 -1 | 1"`
 *  encodes the 2×2 system `x + y = 5, x − y = 1`. */
export interface GaussianEliminationTaskValues {
  readonly system: string;
}

export type GaussianEliminationNotebookFlow =
  | { readonly kind: 'basic-2x2' }
  | { readonly kind: 'row-swap' }
  | { readonly kind: 'fraction-pivots' }
  | { readonly kind: 'infinite-solutions' }
  | { readonly kind: 'inconsistent-system' };

export interface GaussianEliminationTask extends NotebookTask<GaussianEliminationTaskValues> {
  readonly notebookFlow: GaussianEliminationNotebookFlow;
}

export const GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA: TaskInputSchema<GaussianEliminationTaskValues> =
  {
    system: {
      kind: 'string',
      label: t('features.algorithms.tasks.gaussianElimination.values.system'),
      placeholder: t('features.algorithms.tasks.gaussianElimination.values.systemPlaceholder'),
      pattern: /^\s*[-\d.\s|]+(\s*;\s*[-\d.\s|]+)*\s*$/,
      minLength: 3,
      maxLength: 360,
    },
  };

/** One row of an augmented matrix: the last cell is the right-hand
 *  side, the preceding cells are the coefficients. Stored as a flat
 *  array for simpler in-place row operations. */
export type AugmentedRow = readonly number[];

/** Parsed augmented matrix. `variableCount` is the column index where
 *  `|` splits coefficients from the RHS — used by the renderer to
 *  draw the vertical divider in the KaTeX snapshot. */
export interface ParsedSystem {
  readonly matrix: readonly AugmentedRow[];
  readonly variableCount: number;
}

/** Parse the `"r1c1 r1c2 | r1rhs; r2c1 r2c2 | r2rhs"` form. Returns
 *  `null` when the system is malformed or rows have mismatched
 *  widths — the scenario factory falls back to the task default in
 *  that case so an invalid popover state never crashes the viz. */
export function parseGaussianSystem(input: string): ParsedSystem | null {
  if (!input.trim()) return null;
  const rows: number[][] = [];
  let variableCount = -1;
  for (const rawRow of input.split(';')) {
    const [coeffPart, rhsPart] = rawRow.split('|');
    if (coeffPart === undefined || rhsPart === undefined) return null;
    const coeffs = parseNumbers(coeffPart);
    const rhs = parseNumbers(rhsPart);
    if (coeffs === null || rhs === null) return null;
    if (rhs.length !== 1) return null;
    if (variableCount < 0) variableCount = coeffs.length;
    else if (variableCount !== coeffs.length) return null;
    rows.push([...coeffs, rhs[0]]);
  }
  if (rows.length === 0 || variableCount <= 0) return null;
  return { matrix: rows, variableCount };
}

function parseNumbers(raw: string): readonly number[] | null {
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
