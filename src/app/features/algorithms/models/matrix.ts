import { TranslatableText } from '../../../core/i18n/translatable-text';

export type MatrixMode = 'floyd-warshall' | 'hungarian';

export type MatrixHeaderStatus = 'idle' | 'active' | 'pivot' | 'covered' | 'assignment';

export type MatrixCellStatus =
  | 'idle'
  | 'active'
  | 'candidate'
  | 'improved'
  | 'pivot'
  | 'covered'
  | 'assignment'
  | 'zero'
  | 'adjusted'
  | 'blocked';

export type MatrixTraceTag =
  | 'pivot'
  | 'active'
  | 'improved'
  | 'covered'
  | 'zero'
  | 'assignment'
  | 'row'
  | 'column'
  | 'adjusted'
  | 'infinite';

export interface MatrixHeader {
  readonly id: string;
  readonly label: string;
  readonly status: MatrixHeaderStatus;
}

export interface MatrixCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly rowLabel: string;
  readonly colLabel: string;
  readonly valueLabel: string;
  readonly metaLabel: TranslatableText | null;
  readonly status: MatrixCellStatus;
  readonly tags: readonly MatrixTraceTag[];
}

export interface MatrixComputation {
  readonly label: TranslatableText;
  readonly expression: TranslatableText;
  readonly result: TranslatableText | null;
  readonly decision: TranslatableText;
}

export interface MatrixTraceState {
  readonly mode: MatrixMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly dimensionsLabel: string;
  readonly activeRowLabel: string | null;
  readonly activeColLabel: string | null;
  readonly pivotLabel: string | null;
  readonly focusItemsLabel: TranslatableText;
  readonly focusItems: readonly TranslatableText[];
  readonly secondaryItemsLabel: TranslatableText;
  readonly secondaryItems: readonly TranslatableText[];
  readonly rowHeaders: readonly MatrixHeader[];
  readonly colHeaders: readonly MatrixHeader[];
  readonly cells: readonly MatrixCell[];
  readonly computation: MatrixComputation | null;
}
