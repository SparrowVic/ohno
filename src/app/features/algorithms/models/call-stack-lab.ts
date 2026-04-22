import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Generic trace state for algorithms that make their recursion explicit
 * — Recursion Call Stack (classic Fibonacci demo), Backtracking,
 * Minimax, MCTS. The viz draws a vertical stack of frames growing from
 * bottom up, with the top frame "active". Completed frames flash their
 * return value before popping. A side rail tallies total calls, max
 * depth reached, and (optionally) cache hits once memoization lands.
 */

export type CallStackLabMode =
  | 'recursion-call-stack'
  | 'backtracking'
  | 'minimax'
  | 'mcts';

export type CallStackFramePhase =
  | 'entering'
  | 'active'
  | 'descending-left'
  | 'descending-right'
  | 'combining'
  | 'returning'
  | 'cached'
  | 'pruned';

export interface CallStackFrameLocal {
  /** Short key for the local — "n", "depth", "acc". */
  readonly label: string;
  /** Rendered value as a string. */
  readonly value: string;
  readonly tone: 'default' | 'arg' | 'result' | 'active';
}

export interface CallStackFrame {
  /** Stable id so frames track through push/pop animations. */
  readonly id: string;
  /** Header — "fib(5)", "solve(row=2)", "minimax(MAX, d=3)". */
  readonly title: string;
  /** Sub-header shown in smaller text under the title. */
  readonly subtitle: TranslatableText | null;
  /** Key-value chips rendered in a two-column grid. */
  readonly locals: readonly CallStackFrameLocal[];
  /** Depth index from 0 (root). Used for the depth rail indicator. */
  readonly depth: number;
  readonly phase: CallStackFramePhase;
  /** When phase is `returning`, the callout string shown briefly
   *  above the frame right before it pops — e.g. "→ 5". */
  readonly returnValue: string | null;
}

export interface CallStackEdge {
  /** Parent frame id — null for the bootstrap (first) call. */
  readonly fromFrameId: string | null;
  /** Child frame id. */
  readonly toFrameId: string;
  /** Label shown on the arrow — "left", "right", "branch 2", "retry". */
  readonly label: TranslatableText | null;
}

export interface CallStackStat {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'info' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface CallStackReturnedFrame {
  /** Stable id — matches a previously-popped frame. Drives the
   *  "breadcrumb" rail of recent returns. */
  readonly id: string;
  readonly title: string;
  readonly returnValue: string;
  /** Index from the top of the return rail (0 = most recent). */
  readonly age: number;
}

export interface CallStackLabTraceState {
  readonly mode: CallStackLabMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly tone: 'idle' | 'descend' | 'combine' | 'return' | 'complete';
  /** Live stack — bottom-first order (frame[0] is root). */
  readonly frames: readonly CallStackFrame[];
  /** Directed edges between frames for the call-tree side panel. */
  readonly edges: readonly CallStackEdge[];
  /** Recently-popped frames (most recent first, typically 4–6 long). */
  readonly recentReturns: readonly CallStackReturnedFrame[];
  readonly stats: readonly CallStackStat[];
  readonly resultLabel: TranslatableText | null;
  readonly iteration: number;
}
