import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Lightweight trace state for matrix-pivoting algorithms (Gaussian
 * elimination, Simplex). Distinct from `models/matrix.ts` which is
 * sized for Floyd-Warshall / Hungarian — those carry per-cell labels,
 * computations and assignment overlays. This shape is leaner: a
 * scrollable cell grid with state-based tinting and an optional
 * vertical divider for the augmented column.
 */

export type MatrixGridMode = 'gaussian-elimination' | 'simplex';

export type MatrixGridCellState =
  /** Resting cell, no semantic role this step. */
  | 'idle'
  /** Pivot cell being acted on right now. */
  | 'pivot'
  /** Cell sits in the active pivot row (current scaling / source row). */
  | 'pivot-row'
  /** Cell sits in the active pivot column. */
  | 'pivot-col'
  /** Row currently being eliminated (reduced) against the pivot row. */
  | 'eliminating'
  /** Cell just updated by the latest row operation. */
  | 'updated'
  /** Pivot column whose elimination already finished — locked in. */
  | 'leading'
  /** Column corresponds to a free variable in the result. */
  | 'free'
  /** Right-hand-side cell (after the augmented divider). */
  | 'rhs';

export interface MatrixGridCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  /** Pre-formatted display string. The generator keeps full numeric
   *  precision; this is the "what the student sees in the cell" value
   *  (e.g. "1", "1/2", "-3", "0"). */
  readonly value: string;
  readonly state: MatrixGridCellState;
}

export type MatrixGridTone = 'idle' | 'compute' | 'pivot' | 'eliminate' | 'complete' | 'fail';

export interface MatrixGridTraceState {
  readonly mode: MatrixGridMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText | null;
  readonly tone: MatrixGridTone;
  readonly rows: number;
  readonly cols: number;
  /** Column index where the augmented vertical divider sits, or null
   *  when the matrix has no augmented part. For Gaussian on a
   *  rows × (vars + 1) augmented matrix this is `vars`; cells at
   *  col = dividerCol are RHS values. */
  readonly dividerCol: number | null;
  readonly cells: readonly MatrixGridCell[];
  /** Optional plain-text label of the current row operation, e.g.
   *  "R₂ ← R₂ − 3 · R₁" or "R₁ ↔ R₃". Renderered above the grid. */
  readonly operationLabel: TranslatableText | null;
  readonly resultLabel: TranslatableText | null;
  readonly iteration: number;
}
