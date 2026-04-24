import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Generic trace state for grid-based number-theory algorithms that
 * evolve a per-cell state while scanning a dense number line —
 * Sieve of Eratosthenes, Linear Sieve, Smallest Prime Factor, Mobius
 * precompute… The viz lays the cells out in a responsive grid (columns
 * derived from viewport width) with a header track showing the active
 * prime and the running primes-found tally.
 */

export type SieveGridMode = 'eratosthenes' | 'linear' | 'smallest-factor';

export type SieveCellState =
  | 'unchecked'
  | 'skipped'
  | 'prime'
  | 'composite'
  | 'current'
  | 'current-prime'
  | 'marking'
  | 'just-marked';

export interface SieveGridCell {
  /** The integer value displayed in the cell — always `index + start`. */
  readonly value: number;
  readonly state: SieveCellState;
  /** Optional factor annotation — e.g. "×2" when the cell is being
   *  marked as a multiple of 2. Rendered as a faint subscript. */
  readonly factorLabel: string | null;
}

export interface SieveStatChip {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'info' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface SieveGridTraceState {
  readonly mode: SieveGridMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly tone: 'idle' | 'pick' | 'mark' | 'settle' | 'complete';
  /** All cells in row-major order. Cells for values below the sieve's
   *  start (typically 0 and 1) are included and flagged `skipped`. */
  readonly cells: readonly SieveGridCell[];
  /** The prime currently driving the outer loop, when one is active. */
  readonly activePrime: number | null;
  /** Bound the outer loop stops at (typically floor(sqrt(n))). */
  readonly bound: number;
  readonly stats: readonly SieveStatChip[];
  readonly resultLabel: TranslatableText | null;
  readonly iteration: number;
}
