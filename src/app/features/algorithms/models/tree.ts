import { TranslatableText } from '../../../core/i18n/translatable-text';

/** Traversal order the generator is currently animating. Four common
 *  orders share the same tree layout + output tape — the order tag
 *  only drives visit sequence, which the UI highlights via step tags. */
export type TreeTraversalOrder = 'preorder' | 'inorder' | 'postorder' | 'level-order';

export interface TreePresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export type TreeNodeStatus =
  | 'idle'
  | 'onStack'
  | 'current'
  | 'visited'
  | 'backtrack'
  | 'queued';

export interface TreeNode {
  /** Stable id used for tracking and animation selectors. */
  readonly id: string;
  /** Human-readable label (1-2 chars for compactness). */
  readonly label: string;
  /** Optional numeric value shown under the label. */
  readonly value: number | null;
  /** Parent id or null for the root. */
  readonly parentId: string | null;
  /** Depth (root = 0). Used for layout + styling. */
  readonly depth: number;
  /** Horizontal position in logical tree coordinates (assigned by
   *  the layout helper so the UI can render a straight SVG). */
  readonly x: number;
  /** Vertical position in logical tree coordinates. */
  readonly y: number;
  readonly status: TreeNodeStatus;
}

export interface TreeEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly isOnPath: boolean;
  readonly isTraversed: boolean;
}

export interface TreeComputation {
  readonly label: TranslatableText;
  readonly expression: TranslatableText;
  readonly note: TranslatableText;
}

/** State shape shared across all four traversal orders. The `order`
 *  discriminator tells the header which phase badge to render; the
 *  `stack` / `queue` fields are both present but one of them is empty
 *  per-order (DFS uses stack, BFS uses queue). The `output` tape is
 *  the sequence the algorithm has emitted so far. */
export interface TreeTraversalTraceState {
  readonly order: TreeTraversalOrder;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly presetDescription: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly nodes: readonly TreeNode[];
  readonly edges: readonly TreeEdge[];
  readonly stack: readonly string[];
  readonly queue: readonly string[];
  readonly output: readonly string[];
  readonly currentNodeId: string | null;
  readonly rootId: string | null;
  readonly totalNodes: number;
  readonly visitedCount: number;
  readonly computation: TreeComputation | null;
}
