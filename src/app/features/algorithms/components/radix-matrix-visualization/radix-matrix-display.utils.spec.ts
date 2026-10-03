import { describe, expect, it } from 'vitest';

import { radixSortGenerator } from '../../algorithms/radix-sort';
import { SortStep } from '../../models/sort-step';
import { radixState } from '../radix-strip-visualization/radix-digits.utils';
import {
  RADIX_MATRIX_METRICS,
  RadixMatrixRow,
  radixMatrixGroups,
  radixMatrixLayout,
  radixMatrixView,
} from './radix-matrix-display.utils';

const VALUES = [31, 12, 42, 5, 70];

function run(values: readonly number[] = VALUES): SortStep[] {
  return [...radixSortGenerator(values)];
}

function viewAt(step: SortStep) {
  return radixMatrixView(radixState(step, step.array));
}

function tones(row: RadixMatrixRow): string[] {
  return row.digits.map((digit) => digit.tone);
}

describe('radix matrix display utils', () => {
  it('lays out one row per value with padded labels and no band before the first pass', () => {
    const view = viewAt(run()[0]!);
    expect(view.band).toBeNull();
    expect(view.columns).toEqual([
      { exponent: 1, place: 10, tone: null },
      { exponent: 0, place: 1, tone: null },
    ]);
    expect(view.rows.map((row) => row.label)).toEqual(['00', '01', '02', '03', '04']);
    expect(view.rows.map((row) => row.value)).toEqual(VALUES);
    expect(view.rows.every((row) => row.tone === 'idle' && row.bucket === null && row.order === null)).toBe(true);
    expect(view.rows[3]!.digits.map((digit) => digit.lead)).toEqual([true, false]);
  });

  it('puts the focused place under a cyan band', () => {
    const focus = run().find((step) => step.phase === 'focus-digit' && step.digitIndex === 1)!;
    const view = viewAt(focus);
    expect(view.band).toEqual({ column: 0, tone: 'cyan' });
    expect(view.columns.map((column) => column.tone)).toEqual(['cyan', null]);
    expect(view.rows.map(tones)).toEqual(VALUES.map(() => ['band', 'idle']));
  });

  it('turns the routed row pink and fills the destination column as values scatter', () => {
    const scatter = run().find((step) => step.phase === 'distribute' && step.activeItemId === 'rdx-2')!;
    const view = viewAt(scatter);
    expect(view.rows.map((row) => row.tone)).toEqual(['idle', 'idle', 'pink', 'idle', 'idle']);
    expect(tones(view.rows[2]!)).toEqual(['idle', 'pink']);
    expect(view.rows.map((row) => row.bucket)).toEqual([1, 2, 2, null, null]);
    expect(view.rows.map((row) => row.bucketTone)).toEqual(['idle', 'idle', 'pink', 'idle', 'idle']);
    expect(view.rows.every((row) => row.order === null)).toBe(true);
    expect(view.bins[2]).toMatchObject({ tone: 'pink', count: 2 });
  });

  it('numbers gathered rows in lime and marks the newest one', () => {
    const gather = run().find((step) => step.phase === 'gather' && step.activeItemId === 'rdx-1')!;
    const view = viewAt(gather);
    expect(view.rows.map((row) => row.order)).toEqual(['02', '03', null, null, '01']);
    expect(view.rows[1]).toMatchObject({ tone: 'cyan', orderTone: 'fresh', bucket: 2, bucketTone: 'cyan' });
    expect(tones(view.rows[1]!)).toEqual(['idle', 'cyan']);
    expect(view.rows[0]).toMatchObject({ tone: 'idle', orderTone: 'lime', bucket: 1, bucketTone: 'dim' });
    expect(view.rows[2]).toMatchObject({ order: null, bucket: 2, bucketTone: 'idle' });
    expect(view.rows[3]).toMatchObject({ order: null, bucket: 5, bucketTone: 'idle' });
    expect(view.bins[2]).toMatchObject({ tone: 'cyan', count: 1 });
  });

  it('settles the band and the output column in lime after a pass and everything at the end', () => {
    const steps = run();
    const pass = viewAt(steps.find((step) => step.phase === 'pass-complete')!);
    expect(pass.band).toEqual({ column: 1, tone: 'lime' });
    expect(pass.rows.map((row) => row.value)).toEqual([70, 31, 12, 42, 5]);
    expect(pass.rows.map((row) => row.order)).toEqual(['01', '02', '03', '04', '05']);
    expect(pass.rows.map(tones)).toEqual(VALUES.map(() => ['idle', 'lime']));
    expect(pass.rows.every((row) => row.bucket === null)).toBe(true);

    const done = viewAt(steps[steps.length - 1]!);
    expect(done.band).toEqual({ column: 0, tone: 'lime' });
    expect(done.rows.map((row) => row.value)).toEqual([5, 12, 31, 42, 70]);
    expect(tones(done.rows[0]!)).toEqual(['idle', 'lime']);
    expect(tones(done.rows[4]!)).toEqual(['lime', 'lime']);
  });

  it('keeps every frame consistent across a whole run', () => {
    const values = [918, 74, 301, 556, 12, 840, 377, 69, 205, 990, 13, 488];
    for (const step of run(values)) {
      const view = viewAt(step);
      expect(view.rows).toHaveLength(values.length);
      expect(view.rows.filter((row) => row.tone !== 'idle').length).toBeLessThanOrEqual(1);
      expect(view.band === null).toBe(step.phase === 'idle');
      const orders = view.rows.map((row) => row.order).filter((order) => order !== null);
      expect(new Set(orders).size).toBe(orders.length);
      for (const row of view.rows) {
        if (row.bucket !== null && step.digitIndex !== null && step.digitIndex !== undefined) {
          expect(row.bucket).toBe(Math.floor(row.value / 10 ** step.digitIndex) % 10);
        }
      }
    }
  });

  it('names places by value up to thousands and by power beyond', () => {
    const wide = radixMatrixView(radixState(null, [12345]));
    expect(wide.columns.map((column) => column.place)).toEqual([null, 1000, 100, 10, 1]);
    expect(wide.columns[0]!.exponent).toBe(4);
  });

  it('splits rows into groups of the chosen height', () => {
    const rows = viewAt(run()[0]!).rows;
    expect(radixMatrixGroups(rows, 2).map((group) => group.rows.map((row) => row.value))).toEqual([
      [31, 12],
      [42, 5],
      [70],
    ]);
    expect(radixMatrixGroups(rows, 0)).toHaveLength(5);
  });

  it('prefers one comfortable group, splits into columns when rows get short and scrolls as a last resort', () => {
    const { minRow, maxRow, minCell, maxCell } = RADIX_MATRIX_METRICS;
    expect(radixMatrixLayout(8, 3, 608, 382)).toMatchObject({ groups: 1, rowsPerGroup: 8, scrolls: false });
    expect(radixMatrixLayout(12, 3, 608, 382)).toMatchObject({ groups: 2, rowsPerGroup: 6, row: maxRow, font: 18 });
    expect(radixMatrixLayout(18, 3, 608, 382)).toMatchObject({ groups: 2, rowsPerGroup: 9, font: 18, scrolls: false });
    const wide = radixMatrixLayout(24, 3, 608, 382);
    expect(wide).toMatchObject({ groups: 2, rowsPerGroup: 12, font: 14, scrolls: false });
    expect(wide.row).toBeGreaterThanOrEqual(minRow);
    expect(wide.cell).toBeGreaterThanOrEqual(minCell);
    expect(wide.cell).toBeLessThanOrEqual(maxCell);
    const phone = radixMatrixLayout(24, 3, 272, 412);
    expect(phone).toMatchObject({ groups: 1, rowsPerGroup: 24, row: minRow, font: 14, scrolls: true });
    expect(phone.cell).toBeGreaterThanOrEqual(minCell);
    expect(radixMatrixLayout(18, 3, 652, 420)).toMatchObject({ groups: 2, scrolls: false });
  });

  it('falls back to mono digits in compact rows before it resorts to scrolling', () => {
    const { monoRow } = RADIX_MATRIX_METRICS;
    expect(radixMatrixLayout(18, 3, 662, 228)).toMatchObject({ groups: 2, row: monoRow, font: null, scrolls: false });
    expect(radixMatrixLayout(18, 3, 662, 270).font).toBe(14);
  });
});
