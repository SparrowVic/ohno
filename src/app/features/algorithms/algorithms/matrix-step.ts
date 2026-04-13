import {
  MatrixCell,
  MatrixCellStatus,
  MatrixComputation,
  MatrixHeader,
  MatrixHeaderStatus,
  MatrixTraceState,
  MatrixTraceTag,
} from '../models/matrix';
import { SortPhase, SortStep } from '../models/sort-step';

export interface MatrixStepArgs {
  readonly mode: MatrixTraceState['mode'];
  readonly rowLabels: readonly string[];
  readonly colLabels: readonly string[];
  readonly values: readonly (readonly (number | null)[])[];
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly secondaryItemsLabel: string;
  readonly secondaryItems: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortPhase;
  readonly activeRow?: number | null;
  readonly activeCol?: number | null;
  readonly pivotIndex?: number | null;
  readonly cellStatuses?: ReadonlyMap<string, MatrixCellStatus>;
  readonly cellTags?: ReadonlyMap<string, readonly MatrixTraceTag[]>;
  readonly coveredRows?: ReadonlySet<number>;
  readonly coveredCols?: ReadonlySet<number>;
  readonly assignmentCells?: ReadonlySet<string>;
  readonly computation?: MatrixComputation | null;
  readonly metaLabels?: ReadonlyMap<string, string>;
}

export function createMatrixStep(args: MatrixStepArgs): SortStep {
  const rowHeaders: MatrixHeader[] = args.rowLabels.map((label, rowIndex) => ({
    id: `row-${rowIndex}`,
    label,
    status: headerStatus({
      index: rowIndex,
      activeIndex: args.activeRow ?? null,
      pivotIndex: args.pivotIndex ?? null,
      covered: args.coveredRows?.has(rowIndex) ?? false,
    }),
  }));

  const colHeaders: MatrixHeader[] = args.colLabels.map((label, colIndex) => ({
    id: `col-${colIndex}`,
    label,
    status: headerStatus({
      index: colIndex,
      activeIndex: args.activeCol ?? null,
      pivotIndex: args.pivotIndex ?? null,
      covered: args.coveredCols?.has(colIndex) ?? false,
    }),
  }));

  const cells: MatrixCell[] = [];
  for (let row = 0; row < args.values.length; row++) {
    for (let col = 0; col < (args.values[row]?.length ?? 0); col++) {
      const id = cellId(row, col);
      const value = args.values[row]?.[col] ?? null;
      const baseTags = new Set<MatrixTraceTag>(args.cellTags?.get(id) ?? []);
      if (row === args.activeRow) baseTags.add('row');
      if (col === args.activeCol) baseTags.add('column');
      if (row === args.pivotIndex || col === args.pivotIndex) baseTags.add('pivot');
      if (args.coveredRows?.has(row) || args.coveredCols?.has(col)) baseTags.add('covered');
      if (args.assignmentCells?.has(id)) baseTags.add('assignment');
      if (value === null) baseTags.add('infinite');
      if (value === 0) baseTags.add('zero');

      cells.push({
        id,
        row,
        col,
        rowLabel: args.rowLabels[row] ?? `R${row + 1}`,
        colLabel: args.colLabels[col] ?? `C${col + 1}`,
        valueLabel: formatValue(value),
        metaLabel: args.metaLabels?.get(id) ?? null,
        status: resolveCellStatus({
          row,
          col,
          value,
          status: args.cellStatuses?.get(id) ?? null,
          activeRow: args.activeRow ?? null,
          activeCol: args.activeCol ?? null,
          pivotIndex: args.pivotIndex ?? null,
          coveredRows: args.coveredRows,
          coveredCols: args.coveredCols,
          assignmentCells: args.assignmentCells,
        }),
        tags: [...baseTags],
      });
    }
  }

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    matrix: {
      mode: args.mode,
      modeLabel: args.mode === 'floyd-warshall' ? 'Floyd-Warshall' : 'Hungarian Algorithm',
      phaseLabel: args.phaseLabel,
      statusLabel: args.statusLabel,
      resultLabel: args.resultLabel,
      dimensionsLabel: `${args.rowLabels.length}×${args.colLabels.length}`,
      activeRowLabel: args.activeRow === null || args.activeRow === undefined ? null : args.rowLabels[args.activeRow] ?? null,
      activeColLabel: args.activeCol === null || args.activeCol === undefined ? null : args.colLabels[args.activeCol] ?? null,
      pivotLabel: args.pivotIndex === null || args.pivotIndex === undefined ? null : args.rowLabels[args.pivotIndex] ?? null,
      focusItemsLabel: args.focusItemsLabel,
      focusItems: args.focusItems,
      secondaryItemsLabel: args.secondaryItemsLabel,
      secondaryItems: args.secondaryItems,
      rowHeaders,
      colHeaders,
      cells,
      computation: args.computation ?? null,
    },
  };
}

export function cellId(row: number, col: number): string {
  return `r${row}c${col}`;
}

function formatValue(value: number | null): string {
  return value === null ? '∞' : String(value);
}

function headerStatus(args: {
  readonly index: number;
  readonly activeIndex: number | null;
  readonly pivotIndex: number | null;
  readonly covered: boolean;
}): MatrixHeaderStatus {
  if (args.covered) return 'covered';
  if (args.index === args.activeIndex) return 'active';
  if (args.index === args.pivotIndex) return 'pivot';
  return 'idle';
}

function resolveCellStatus(args: {
  readonly row: number;
  readonly col: number;
  readonly value: number | null;
  readonly status: MatrixCellStatus | null;
  readonly activeRow: number | null;
  readonly activeCol: number | null;
  readonly pivotIndex: number | null;
  readonly coveredRows?: ReadonlySet<number>;
  readonly coveredCols?: ReadonlySet<number>;
  readonly assignmentCells?: ReadonlySet<string>;
}): MatrixCellStatus {
  if (args.status) return args.status;

  if (args.assignmentCells?.has(cellId(args.row, args.col))) return 'assignment';
  if (args.row === args.activeRow && args.col === args.activeCol) return 'active';
  if (args.row === args.pivotIndex || args.col === args.pivotIndex) return 'pivot';
  if (args.coveredRows?.has(args.row) || args.coveredCols?.has(args.col)) return 'covered';
  if (args.value === 0) return 'zero';
  return 'idle';
}
