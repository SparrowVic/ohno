import type { SortItemSnapshot } from '../../models/sort-step';
import {
  RadixBin,
  RadixDigit,
  RadixState,
  isSettledPhase,
  radixBins,
  radixDigitAt,
  radixDigits,
  radixPad,
} from '../radix-strip-visualization/radix-digits.utils';

export type RadixMatrixTone = 'idle' | 'cyan' | 'pink';

export type RadixMatrixDigitTone = 'idle' | 'band' | 'cyan' | 'pink' | 'lime';

export type RadixMatrixBucketTone = 'idle' | 'dim' | 'cyan' | 'pink';

export type RadixMatrixOrderTone = 'lime' | 'fresh';

export type RadixMatrixBandTone = 'cyan' | 'lime';

export interface RadixMatrixDigit extends RadixDigit {
  readonly tone: RadixMatrixDigitTone;
}

export interface RadixMatrixRow {
  readonly id: string;
  readonly index: number;
  readonly label: string;
  readonly value: number;
  readonly tone: RadixMatrixTone;
  readonly digits: readonly RadixMatrixDigit[];
  readonly bucket: number | null;
  readonly bucketTone: RadixMatrixBucketTone;
  readonly order: string | null;
  readonly orderTone: RadixMatrixOrderTone;
}

export interface RadixMatrixColumn {
  readonly exponent: number;
  readonly place: number | null;
  readonly tone: RadixMatrixBandTone | null;
}

export interface RadixMatrixBand {
  readonly column: number;
  readonly tone: RadixMatrixBandTone;
}

export interface RadixMatrixView {
  readonly rows: readonly RadixMatrixRow[];
  readonly columns: readonly RadixMatrixColumn[];
  readonly band: RadixMatrixBand | null;
  readonly bins: readonly RadixBin[];
}

export interface RadixMatrixGroup {
  readonly index: number;
  readonly rows: readonly RadixMatrixRow[];
}

export interface RadixMatrixLayout {
  readonly groups: number;
  readonly rowsPerGroup: number;
  readonly cell: number;
  readonly row: number;
  readonly font: 14 | 16 | 18 | null;
  readonly scrolls: boolean;
}

export const RADIX_MATRIX_METRICS = {
  index: 24,
  side: 54,
  gap: 4,
  gutter: 28,
  inset: 6,
  caption: 16,
  head: 16,
  minCell: 24,
  maxCell: 48,
  monoRow: 16,
  minRow: 20,
  comfortRow: 24,
  maxRow: 34,
} as const;

const RADIX_PLACE_VALUE_LIMIT = 3;

interface LayoutOption {
  readonly groups: number;
  readonly rows: number;
  readonly cell: number;
  readonly row: number;
}

export function radixMatrixView(state: RadixState): RadixMatrixView {
  const bandTone: RadixMatrixBandTone | null =
    state.exponent === null ? null : isSettledPhase(state.phase) ? 'lime' : 'cyan';
  const columns = Array.from({ length: state.maxDigits }, (_, column) => {
    const exponent = state.maxDigits - column - 1;
    return {
      exponent,
      place: exponent <= RADIX_PLACE_VALUE_LIMIT ? 10 ** exponent : null,
      tone: exponent === state.exponent ? bandTone : null,
    };
  });
  const bandColumn = columns.findIndex((column) => column.tone !== null);
  return {
    rows: matrixRows(state),
    columns,
    band: bandTone !== null && bandColumn >= 0 ? { column: bandColumn, tone: bandTone } : null,
    bins: radixBins(state),
  };
}

export function radixMatrixGroups(rows: readonly RadixMatrixRow[], perGroup: number): RadixMatrixGroup[] {
  const size = Math.max(1, Math.floor(perGroup));
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => ({
    index,
    rows: rows.slice(index * size, (index + 1) * size),
  }));
}

export function radixMatrixLayout(
  count: number,
  maxDigits: number,
  width: number,
  height: number,
): RadixMatrixLayout {
  const metrics = RADIX_MATRIX_METRICS;
  const total = Math.max(1, count);
  const digits = Math.max(1, maxDigits);
  const frame = metrics.index + metrics.side * 2 + metrics.gap * (digits + 2);
  const header = metrics.caption + metrics.head + metrics.gap * 2;
  const usableWidth = width - metrics.inset * 2;
  const usableHeight = height - metrics.inset * 2 - header;
  const options: LayoutOption[] = [1, 2, 3].map((groups) => {
    const rows = Math.ceil(total / groups);
    return {
      groups,
      rows,
      cell: Math.floor((usableWidth - groups * frame - (groups - 1) * metrics.gutter) / (groups * digits)),
      row: Math.floor((usableHeight - (rows - 1) * metrics.gap) / rows),
    };
  });
  const wide = (option: LayoutOption) => option.cell >= metrics.minCell;
  const dotted = options.filter((option) => wide(option) && option.row >= metrics.minRow);
  const compact = options.filter((option) => wide(option) && option.row >= metrics.monoRow);
  const chosen =
    dotted.find((option) => option.row >= metrics.comfortRow) ??
    roomiest(dotted) ??
    roomiest(compact) ??
    [...options].reverse().find(wide) ??
    options[0]!;
  const fits = compact.includes(chosen);
  const floor = fits && !dotted.includes(chosen) ? metrics.monoRow : metrics.minRow;
  const row = clamp(chosen.row, floor, metrics.maxRow);
  return {
    groups: chosen.groups,
    rowsPerGroup: chosen.rows,
    cell: clamp(chosen.cell, metrics.minCell, metrics.maxCell),
    row,
    font: row < metrics.minRow ? null : row >= 30 ? 18 : row >= 25 ? 16 : 14,
    scrolls: !fits,
  };
}

function roomiest(options: readonly LayoutOption[]): LayoutOption | null {
  return options.reduce<LayoutOption | null>(
    (best, option) => (best !== null && best.row >= option.row ? best : option),
    null,
  );
}

function matrixRows(state: RadixState): RadixMatrixRow[] {
  const bucketOf = new Map<string, number>();
  state.buckets.forEach((items, bucket) => items.forEach((item) => bucketOf.set(item.id, bucket)));
  const orderOf = new Map<string, number>();
  if (state.phase === 'gather' || isSettledPhase(state.phase)) {
    state.output.forEach((item, index) => orderOf.set(item.id, index));
  }
  const width = Math.max(2, String(state.source.length).length);
  return state.source.map((item, index) =>
    matrixRow(item, index, state, bucketOf.get(item.id) ?? null, orderOf.get(item.id) ?? null, width),
  );
}

function matrixRow(
  item: SortItemSnapshot,
  index: number,
  state: RadixState,
  bucket: number | null,
  order: number | null,
  width: number,
): RadixMatrixRow {
  const working = state.phase === 'distribute' || state.phase === 'gather';
  const active = working && item.id === state.activeId;
  const tone: RadixMatrixTone = !active ? 'idle' : state.phase === 'distribute' ? 'pink' : 'cyan';
  return {
    id: item.id,
    index,
    label: radixPad(index, width),
    value: item.value,
    tone,
    digits: radixDigits(item.value, state.maxDigits).map((digit) => ({
      ...digit,
      tone: digitTone(digit, state, tone),
    })),
    ...destination(item, state, bucket, order, tone),
    order: order === null ? null : radixPad(order + 1, width),
    orderTone: tone === 'cyan' ? 'fresh' : 'lime',
  };
}

function digitTone(digit: RadixDigit, state: RadixState, tone: RadixMatrixTone): RadixMatrixDigitTone {
  if (state.phase === 'complete') return digit.lead ? 'idle' : 'lime';
  if (digit.exponent !== state.exponent) return 'idle';
  if (state.phase === 'pass-complete') return 'lime';
  return tone === 'idle' ? 'band' : tone;
}

function destination(
  item: SortItemSnapshot,
  state: RadixState,
  bucket: number | null,
  order: number | null,
  tone: RadixMatrixTone,
): Pick<RadixMatrixRow, 'bucket' | 'bucketTone'> {
  if (state.phase === 'distribute' && bucket !== null) {
    return { bucket, bucketTone: tone === 'pink' ? 'pink' : 'idle' };
  }
  if (state.phase === 'gather' && state.exponent !== null) {
    if (bucket !== null) return { bucket, bucketTone: 'idle' };
    if (order !== null) {
      return { bucket: radixDigitAt(item.value, state.exponent), bucketTone: tone === 'cyan' ? 'cyan' : 'dim' };
    }
  }
  return { bucket: null, bucketTone: 'idle' };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
