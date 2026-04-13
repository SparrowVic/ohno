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
  readonly metaLabel: string | null;
  readonly status: MatrixCellStatus;
  readonly tags: readonly MatrixTraceTag[];
}

export interface MatrixComputation {
  readonly label: string;
  readonly expression: string;
  readonly result: string | null;
  readonly decision: string;
}

export interface MatrixTraceState {
  readonly mode: MatrixMode;
  readonly modeLabel: string;
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly dimensionsLabel: string;
  readonly activeRowLabel: string | null;
  readonly activeColLabel: string | null;
  readonly pivotLabel: string | null;
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly secondaryItemsLabel: string;
  readonly secondaryItems: readonly string[];
  readonly rowHeaders: readonly MatrixHeader[];
  readonly colHeaders: readonly MatrixHeader[];
  readonly cells: readonly MatrixCell[];
  readonly computation: MatrixComputation | null;
}
