import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Generic trace state for array / string algorithms that work with
 * one or two moving indices — Two Pointers, Sliding Window,
 * Palindrome Check, Reverse String/Array, and the scan-half of
 * Kadane's Algorithm. The viz draws a linear row of cells, overlays
 * pointer markers + an optional highlighted window, and carries a
 * small stat card for aggregate state (sum, best so far, match
 * verdict…).
 */

export type PointerLabMode =
  | 'two-pointers'
  | 'sliding-window'
  | 'palindrome-check'
  | 'reverse'
  | 'kadane';

export type PointerLabCellStatus =
  | 'idle'
  | 'left'
  | 'right'
  | 'window'
  | 'match'
  | 'mismatch'
  | 'swap'
  | 'settled'
  | 'best';

export interface PointerLabCell {
  /** 0-based index in the canonical array. */
  readonly index: number;
  /** The value displayed inside the cell (string so we can show
   *  characters for palindrome-check and digits for numeric cases). */
  readonly value: string;
  readonly status: PointerLabCellStatus;
  /** Optional small label that sits above or below the cell (e.g.
   *  "L", "R", "start", "end"). */
  readonly overlay: string | null;
}

export interface PointerLabPointer {
  /** Stable id so Angular's track-by keeps the marker when it moves. */
  readonly id: string;
  /** Human-readable name — "L", "R", "i", "j". Rendered mono. */
  readonly label: string;
  /** Index the pointer currently sits on. Can be outside [0, len-1]
   *  when the algorithm has walked off the end — the viz caps the
   *  visual position at the boundary. */
  readonly index: number;
  /** Side where the label chip is drawn — above the cell by default,
   *  below when two pointers share a cell so they don't overlap. */
  readonly side: 'top' | 'bottom';
  readonly tone: 'accent' | 'warm' | 'route' | 'hit' | 'muted';
}

export interface PointerLabWindow {
  /** Inclusive left index of the highlighted run. */
  readonly left: number;
  /** Inclusive right index. */
  readonly right: number;
  readonly tone: 'active' | 'best' | 'preview';
}

export interface PointerLabStat {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'info' | 'accent' | 'warning' | 'success' | 'danger';
}

export interface PointerLabTraceState {
  readonly mode: PointerLabMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly tone: 'idle' | 'compare' | 'swap' | 'settle' | 'complete';
  /** The row of cells — always the full input array, even when the
   *  algorithm has moved its pointers past some of them. The viz
   *  uses status flags to paint consumed / unconsumed ranges. */
  readonly cells: readonly PointerLabCell[];
  readonly pointers: readonly PointerLabPointer[];
  readonly window: PointerLabWindow | null;
  readonly stats: readonly PointerLabStat[];
  readonly resultLabel: TranslatableText | null;
  readonly iteration: number;
}
