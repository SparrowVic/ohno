import { TranslatableText } from '../../../core/i18n/translatable-text';

export type GridTraceMode = 'flood-fill' | 'a-star';

export type GridCellStatus =
  | 'idle'
  | 'wall'
  | 'source'
  | 'goal'
  | 'frontier'
  | 'current'
  | 'filled'
  | 'closed'
  | 'path'
  | 'blocked';

export type GridTraceTag =
  | 'seed'
  | 'goal'
  | 'frontier'
  | 'current'
  | 'filled'
  | 'closed'
  | 'path'
  | 'wall'
  | 'blocked'
  | 'candidate';

export interface GridTraceCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly status: GridCellStatus;
  readonly tags: readonly GridTraceTag[];
  readonly valueLabel: string;
  readonly metaLabel: string | null;
  readonly tone?: string | null;
}

export interface GridTraceState {
  readonly mode: GridTraceMode;
  readonly modeLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly decision: TranslatableText | null;
  readonly rows: number;
  readonly cols: number;
  readonly sourceCellId: string | null;
  readonly targetCellId: string | null;
  readonly activeCellId: string | null;
  readonly frontierCount: number;
  readonly visitedCount: number;
  readonly resultCount: number;
  readonly sourceLabel: TranslatableText;
  readonly targetLabel: TranslatableText;
  readonly visitOrder: readonly string[];
  readonly cells: readonly GridTraceCell[];
}
