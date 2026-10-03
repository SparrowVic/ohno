import type { SieveCellState, SieveGridCell, SieveGridTraceState, SieveStatChip } from '../../models/sieve-grid';
import type { TranslatableText } from '../../../../core/i18n/translatable-text';

export type SieveCellTone = 'ink' | 'dim' | 'crossed' | 'cyan' | 'pink' | 'lime' | 'violet';

export type SieveStatTone = 'cyan' | 'pink' | 'lime' | 'amber' | 'red';

export type SieveStateName = 'unchecked' | 'skipped' | 'prime' | 'composite' | 'current' | 'pivot' | 'marking';

export interface SieveBoardCell {
  readonly value: number;
  readonly tone: SieveCellTone;
  readonly stateName: SieveStateName;
  readonly tag: string | null;
  readonly factor: number | null;
  readonly struck: boolean;
  readonly focus: boolean;
  readonly row: number;
  readonly column: number;
}

export interface SieveBoardRow {
  readonly index: number;
  readonly base: number;
  readonly cells: readonly SieveBoardCell[];
}

export interface SieveBoardLayout {
  readonly columns: number;
  readonly rows: number;
  readonly cell: number;
  readonly font: 14 | 16 | 18;
  readonly tags: boolean;
  readonly scrolls: boolean;
}

export interface SievePrimeChip {
  readonly value: number;
  readonly head: boolean;
  readonly pivot: boolean;
}

export interface SieveStatRow {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: SieveStatTone;
  readonly numeric: boolean;
}

export const SIEVE_BOARD_METRICS = {
  minCell: 34,
  maxCell: 56,
  gap: 4,
  rowHead: 26,
  columnHead: 16,
  inset: 2,
} as const;

const CELL_TONES: Readonly<Record<SieveCellState, SieveCellTone>> = {
  unchecked: 'ink',
  skipped: 'dim',
  prime: 'lime',
  composite: 'crossed',
  current: 'cyan',
  'current-prime': 'violet',
  marking: 'pink',
  'just-marked': 'pink',
};

const STATE_NAMES: Readonly<Record<SieveCellState, SieveStateName>> = {
  unchecked: 'unchecked',
  skipped: 'skipped',
  prime: 'prime',
  composite: 'composite',
  current: 'current',
  'current-prime': 'pivot',
  marking: 'marking',
  'just-marked': 'marking',
};

const STAT_TONES: Readonly<Record<SieveStatChip['tone'], SieveStatTone>> = {
  info: 'cyan',
  accent: 'pink',
  success: 'lime',
  warning: 'amber',
  danger: 'red',
};

const WIDER_COLUMNS: readonly number[] = [12, 15, 16, 20, 24, 25, 30];

const FOCUS_ORDER:readonly SieveCellState[] = ['marking', 'just-marked', 'current-prime', 'current'];

export function sieveCellTone(state: SieveCellState): SieveCellTone {
  return CELL_TONES[state];
}

export function sieveStatTone(tone: SieveStatChip['tone']): SieveStatTone {
  return STAT_TONES[tone];
}

export function sieveFocusValue(cells: readonly SieveGridCell[]): number | null {
  for (const state of FOCUS_ORDER) {
    const cell = cells.find((item) => item.state === state);
    if (cell) return cell.value;
  }
  return null;
}

export function sieveVisibleCells(cells: readonly SieveGridCell[]): readonly SieveGridCell[] {
  return cells.filter((cell) => cell.value >= 1);
}

export function sieveBoardRows(state: SieveGridTraceState, columns: number): SieveBoardRow[] {
  const visible = sieveVisibleCells(state.cells);
  const focus = sieveFocusValue(visible);
  const width = Math.max(1, Math.floor(columns));
  const first = visible[0]?.value ?? 1;
  const rowCount = Math.ceil(visible.length / width);
  return Array.from({ length: rowCount }, (_, row) => ({
    index: row,
    base: first - 1 + row * width,
    cells: visible
      .slice(row * width, (row + 1) * width)
      .map((cell, column) => boardCell(cell, row, column, focus)),
  }));
}

function boardCell(cell: SieveGridCell, row: number, column: number, focus: number | null): SieveBoardCell {
  const crossedNow = cell.state === 'marking' || cell.state === 'just-marked';
  const factor = cell.state === 'composite' || cell.state === 'current' ? cell.markedBy : null;
  return {
    value: cell.value,
    tone: sieveCellTone(cell.state),
    stateName: STATE_NAMES[cell.state],
    tag: crossedNow ? cell.factorLabel : factor === null ? null : `÷${factor}`,
    factor,
    struck: crossedNow || cell.state === 'composite',
    focus: cell.value === focus,
    row,
    column,
  };
}

export function sieveBoardLayout(count: number, width: number, height: number): SieveBoardLayout {
  const { minCell, maxCell, gap, rowHead, columnHead, inset } = SIEVE_BOARD_METRICS;
  const total = Math.max(1, count);
  const usableWidth = Math.max(0, width - rowHead - gap - inset * 2);
  const usableHeight = Math.max(0, height - columnHead - gap - inset * 2);
  const span = (columns: number) => (usableWidth - gap * (columns - 1)) / columns;
  const fitsWidth = (columns: number) => span(columns) >= minCell;
  const fitsHeight = (columns: number) => {
    const rows = Math.ceil(total / columns);
    return rows * minCell + (rows - 1) * gap <= usableHeight;
  };
  const preferred = total > 150 ? [20, 10, 5] : [10, 5];
  const base =
    preferred.find(fitsWidth) ?? Math.max(1, Math.floor((usableWidth + gap) / (minCell + gap)));
  const columns =
    preferred.find((candidate) => fitsWidth(candidate) && fitsHeight(candidate)) ??
    WIDER_COLUMNS.find((candidate) => candidate > base && fitsWidth(candidate) && fitsHeight(candidate)) ??
    base;
  const rows = Math.ceil(total / columns);
  const byHeight = (usableHeight - gap * (rows - 1)) / rows;
  const cell = Math.floor(Math.min(maxCell, Math.max(minCell, Math.min(span(columns), byHeight))));
  return {
    columns,
    rows,
    cell,
    font: cell >= 46 ? 18 : cell >= 40 ? 16 : 14,
    tags: cell >= 38,
    scrolls: columnHead + gap + rows * cell + (rows - 1) * gap + inset * 2 > height,
  };
}

export function sievePrimeChips(cells: readonly SieveGridCell[]): SievePrimeChip[] {
  const primes = cells.filter((cell) => cell.state === 'prime' || cell.state === 'current-prime');
  const pivot = primes.find((cell) => cell.state === 'current-prime')?.value ?? null;
  const head = pivot ?? primes[primes.length - 1]?.value ?? null;
  return primes.map((cell) => ({
    value: cell.value,
    head: cell.value === head,
    pivot: cell.value === pivot,
  }));
}

export function sieveStatRows(stats: readonly SieveStatChip[]): SieveStatRow[] {
  return stats.map((stat) => ({
    label: stat.label,
    value: stat.value,
    tone: sieveStatTone(stat.tone),
    numeric: typeof stat.value === 'string' && /^\d+$/.test(stat.value),
  }));
}
