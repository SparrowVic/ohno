import { SortPhase } from './sort-step';

/** Row-level status in the sort trace table — mirrors the `data-state`
 *  a bar/tile carries on the canvas so the Trace tab reads the same
 *  semantic as the visualization. */
export type SortTraceStatus = 'unsorted' | 'comparing' | 'swapping' | 'sorted';

/** Tag icons shown in the per-row "Tags" cell. */
export type SortTraceTag = 'compare' | 'swap' | 'sorted';

/** Coarse tone used by the Trace panel to colour the phase badge. */
export type SortPhaseTone = 'idle' | 'compare' | 'swap' | 'settle' | 'distribute' | 'complete';

export interface SortTraceRow {
  readonly index: number;
  readonly value: number;
  readonly status: SortTraceStatus;
  readonly tags: readonly SortTraceTag[];
}

export interface SortTracePair {
  readonly indexA: number;
  readonly valueA: number;
  readonly indexB: number;
  readonly valueB: number;
}

export interface SortTraceBucketSummary {
  readonly bucket: number;
  readonly count: number;
  readonly active: boolean;
}

export interface SortTraceState {
  readonly phase: SortPhase;
  readonly phaseLabel: string;
  readonly phaseTone: SortPhaseTone;
  readonly description: string;
  readonly comparing: SortTracePair | null;
  readonly swapping: SortTracePair | null;
  readonly sortedCount: number;
  readonly unsortedCount: number;
  readonly boundary: number;
  readonly rows: readonly SortTraceRow[];
  /** Radix-style digit pass position, if the algorithm emits one. */
  readonly digit: { readonly index: number; readonly max: number } | null;
  /** Radix / bucket-sort lane distribution, if present. */
  readonly buckets: readonly SortTraceBucketSummary[];
}
