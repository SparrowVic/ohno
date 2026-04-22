import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Generic trace state for algorithms that build an explicit decision
 * tree during search — Backtracking (N-Queens), Minimax with α/β
 * pruning, Monte Carlo Tree Search. The viz draws:
 *
 *   - A **tree canvas** of discovered nodes (each with a state badge
 *     and a compact stat strip inside the card).
 *   - An **active path** ribbon — ids of the nodes on the current
 *     exploration path, drawn with a thicker stroke and warm tint.
 *   - An optional **sidecar board** for algorithms with a physical
 *     position to render alongside the tree (N-Queens chessboard,
 *     tic-tac-toe grid). Cells carry per-cell state so the viz can
 *     paint placed pieces, conflicts, and "just-tried" hints.
 */

export type CallTreeLabMode = 'backtracking' | 'minimax' | 'mcts';

export type CallTreeNodePhase =
  | 'pending'
  | 'exploring'
  | 'explored'
  | 'solution'
  | 'conflict'
  | 'pruned'
  | 'current'
  | 'backtracked';

export interface CallTreeNodeStat {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'route';
}

export interface CallTreeNode {
  readonly id: string;
  readonly parentId: string | null;
  /** Main label — "row=2, col=4", "MAX(d=3)", "UCB=1.24". Mono font. */
  readonly title: string;
  /** Optional caption shown beneath the title — e.g. "α=3, β=5" or
   *  "w/n = 3/7". */
  readonly subtitle: TranslatableText | null;
  /** Short tag rendered as a badge in the top-right of the card —
   *  "✓" for solutions, "✗" for conflicts, "skip" for pruned, etc. */
  readonly badge: string | null;
  readonly phase: CallTreeNodePhase;
  readonly stats: readonly CallTreeNodeStat[];
  /** Label on the incoming edge from the parent — "col=3", "left",
   *  "α-cut". Null for the root or unlabelled edges. */
  readonly edgeLabel: string | null;
}

export type BoardCellState =
  | 'idle'
  | 'placed'
  | 'current'
  | 'candidate'
  | 'attacked'
  | 'conflict'
  | 'solution';

export interface BoardCell {
  readonly row: number;
  readonly col: number;
  /** Rendered value — "Q", "×", "" for empty. */
  readonly value: string;
  readonly state: BoardCellState;
}

export interface CallTreeSidecarBoard {
  /** Short eyebrow label above the grid — "N-Queens board". */
  readonly title: TranslatableText;
  readonly rows: number;
  readonly cols: number;
  /** Flat list of cells in row-major order. */
  readonly cells: readonly BoardCell[];
  /** Optional footer line under the board — "2 / 8 queens placed". */
  readonly footer: TranslatableText | null;
}

export interface CallTreeStat {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'info' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface CallTreeLabTraceState {
  readonly mode: CallTreeLabMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly tone: 'idle' | 'descend' | 'prune' | 'solve' | 'return' | 'complete';
  readonly nodes: readonly CallTreeNode[];
  /** Ordered node ids from root → current frontier. Used by the viz
   *  to paint the glowing active path. Empty when idle. */
  readonly activePath: readonly string[];
  readonly rootId: string | null;
  readonly stats: readonly CallTreeStat[];
  /** Optional physical-state companion (chessboard, game grid…). */
  readonly sidecar: CallTreeSidecarBoard | null;
  readonly resultLabel: TranslatableText | null;
  readonly iteration: number;
}
