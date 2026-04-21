import { TranslatableText } from '../../../core/i18n/translatable-text';

export type DpMode =
  | 'knapsack-01'
  | 'longest-common-subsequence'
  | 'edit-distance'
  | 'matrix-chain'
  | 'coin-change'
  | 'subset-sum'
  | 'longest-palindromic-subsequence'
  | 'burst-balloons'
  | 'wildcard-matching'
  | 'longest-increasing-subsequence'
  | 'climbing-stairs'
  | 'fibonacci-dp'
  | 'regex-matching-dp'
  | 'traveling-salesman-dp'
  | 'dp-on-trees'
  | 'dp-with-bitmask'
  | 'dp-convex-hull-trick'
  | 'divide-conquer-dp-optimization'
  | 'knuth-dp-optimization'
  | 'sos-dp'
  | 'profile-dp';

export interface DpPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export type DpHeaderStatus = 'idle' | 'active' | 'source' | 'target' | 'accent';

export type DpCellStatus =
  | 'idle'
  | 'base'
  | 'blocked'
  | 'active'
  | 'candidate'
  | 'improved'
  | 'chosen'
  | 'backtrack'
  | 'match';

export type DpTraceTag =
  | 'active'
  | 'base'
  | 'take'
  | 'skip'
  | 'match'
  | 'insert'
  | 'delete'
  | 'replace'
  | 'split'
  | 'best'
  | 'path'
  | 'blocked';

export interface DpHeader {
  readonly id: string;
  readonly label: string;
  readonly status: DpHeaderStatus;
  readonly metaLabel: string | null;
}

export interface DpCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly rowLabel: string;
  readonly colLabel: string;
  readonly valueLabel: string;
  readonly metaLabel: string | null;
  readonly status: DpCellStatus;
  readonly tags: readonly DpTraceTag[];
}

export interface DpInsight {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'info' | 'accent' | 'success' | 'warning';
}

export interface DpComputation {
  readonly label: TranslatableText;
  readonly expression: TranslatableText;
  readonly result: string | null;
  readonly decision: TranslatableText;
}

export interface DpTraceState {
  readonly mode: DpMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly presetDescription: TranslatableText;
  readonly dimensionsLabel: string;
  readonly activeLabel: TranslatableText | null;
  readonly pathLabel: TranslatableText;
  readonly primaryItemsLabel: TranslatableText;
  readonly primaryItems: readonly TranslatableText[];
  readonly secondaryItemsLabel: TranslatableText;
  readonly secondaryItems: readonly TranslatableText[];
  readonly insights: readonly DpInsight[];
  readonly rowHeaders: readonly DpHeader[];
  readonly colHeaders: readonly DpHeader[];
  readonly cells: readonly DpCell[];
  readonly tableShape: 'full' | 'upper-triangle';
  readonly computation: DpComputation | null;
}
