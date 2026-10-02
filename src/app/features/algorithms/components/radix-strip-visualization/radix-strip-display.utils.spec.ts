import { describe, expect, it } from 'vitest';

import { radixSortGenerator } from '../../algorithms/radix-sort';
import { SortStep } from '../../models/sort-step';
import { radixState } from './radix-digits.utils';
import {
  RADIX_TAPE_METRICS,
  RadixStripCell,
  radixBinColumns,
  radixCellWidth,
  radixStripView,
  radixTapeLayout,
} from './radix-strip-display.utils';

const VALUES = [31, 12, 42, 5, 70];

function run(values: readonly number[] = VALUES): SortStep[] {
  return [...radixSortGenerator(values)];
}

function viewAt(step: SortStep) {
  return radixStripView(radixState(step, step.array));
}

function marked(cell: RadixStripCell): string[] {
  return cell.digits.filter((digit) => digit.tone !== 'idle').map((digit) => `${digit.exponent}:${digit.tone}`);
}

describe('radix strip display utils', () => {
  it('shows the input without highlights before the first pass', () => {
    const view = viewAt(run()[0]!);
    expect(view.lane).toBe('input');
    expect(view.placeTone).toBeNull();
    expect(view.head).toBeNull();
    expect(view.cells.map((cell) => cell.value)).toEqual(VALUES);
    expect(view.cells.every((cell) => cell.tone === 'idle' && marked(cell).length === 0)).toBe(true);
    expect(view.cells[3]!.digits.map((digit) => digit.lead)).toEqual([true, false]);
  });

  it('marks the focused digit of every card in cyan', () => {
    const focus = run().find((step) => step.phase === 'focus-digit' && step.digitIndex === 1)!;
    const view = viewAt(focus);
    expect(view.placeTone).toBe('cyan');
    expect(view.cells.every((cell) => cell.tone === 'idle')).toBe(true);
    expect(view.cells.map(marked)).toEqual(VALUES.map(() => ['1:cyan']));
  });

  it('empties scattered slots, keeps the routed card pink under the head and the rest waiting', () => {
    const scatter = run().find((step) => step.phase === 'distribute' && step.activeItemId === 'rdx-2')!;
    const view = viewAt(scatter);
    expect(view.lane).toBe('input');
    expect(view.head).toEqual({ slot: 2, bucket: 2, tone: 'pink', arrow: '↓' });
    expect(view.cells.map((cell) => cell.value)).toEqual([null, null, 42, 5, 70]);
    expect(view.cells[0]).toMatchObject({ key: 'slot-0', id: null, tone: 'idle', head: false, digits: [] });
    expect(view.cells[2]).toMatchObject({ key: 'rdx-2', tone: 'pink', head: true });
    expect(marked(view.cells[2]!)).toEqual(['0:pink']);
    expect(view.cells[3]).toMatchObject({ tone: 'idle', head: false });
    expect(marked(view.cells[3]!)).toEqual(['0:cyan']);
  });

  it('writes gathered cards from the left with the newest under a cyan head', () => {
    const gather = run().find((step) => step.phase === 'gather' && step.activeItemId === 'rdx-1')!;
    const view = viewAt(gather);
    expect(view.lane).toBe('output');
    expect(view.head).toEqual({ slot: 2, bucket: 2, tone: 'cyan', arrow: '↑' });
    expect(view.cells.map((cell) => cell.value)).toEqual([70, 31, 12, null, null]);
    expect(view.cells.map((cell) => cell.tone)).toEqual(['lime', 'lime', 'cyan', 'idle', 'idle']);
    expect(marked(view.cells[0]!)).toEqual(['0:lime']);
    expect(marked(view.cells[2]!)).toEqual(['0:cyan']);
  });

  it('settles the tape in lime after each pass and lights every real digit at the end', () => {
    const steps = run();
    const pass = steps.find((step) => step.phase === 'pass-complete')!;
    const passView = viewAt(pass);
    expect(passView.placeTone).toBe('lime');
    expect(passView.head).toBeNull();
    expect(passView.cells.map((cell) => cell.value)).toEqual([70, 31, 12, 42, 5]);
    expect(passView.cells.every((cell) => cell.tone === 'lime')).toBe(true);
    expect(passView.cells.map(marked)).toEqual(VALUES.map(() => ['0:lime']));

    const done = viewAt(steps[steps.length - 1]!);
    expect(done.cells.map((cell) => cell.value)).toEqual([5, 12, 31, 42, 70]);
    expect(done.cells[0]!.digits.map((digit) => digit.tone)).toEqual(['idle', 'lime']);
    expect(done.cells[4]!.digits.map((digit) => digit.tone)).toEqual(['lime', 'lime']);
  });

  it('conserves every card between the tape and the bins across a whole run', () => {
    for (const values of [VALUES, [918, 74, 301, 556, 12, 840, 377, 69, 205, 990, 13, 488]]) {
      for (const step of run(values)) {
        const view = viewAt(step);
        const onTape = view.cells.filter((cell) => cell.value !== null).length;
        const inBins = view.bins.reduce((sum, bin) => sum + bin.count, 0);
        const doubled = step.phase === 'distribute' ? 1 : 0;
        expect(view.cells).toHaveLength(values.length);
        expect(onTape + inBins).toBe(values.length + doubled);
        expect(view.cells.filter((cell) => cell.head).length).toBe(view.head ? 1 : 0);
      }
    }
  });

  it('sizes tape cells so Doto stays at 14px or more and scrolls instead of shrinking', () => {
    const { inset, gap } = RADIX_TAPE_METRICS;
    expect(radixCellWidth(3, 14)).toBe(30);
    expect(radixCellWidth(3, 18)).toBe(37);
    expect(radixTapeLayout(24, 3, 826)).toEqual({ cell: 30, font: 14, scrolls: false });
    expect(radixTapeLayout(18, 3, 826)).toMatchObject({ font: 18, scrolls: false });
    expect(radixTapeLayout(12, 3, 826)).toEqual({ cell: 64, font: 18, scrolls: false });
    expect(radixTapeLayout(24, 3, 272)).toEqual({ cell: 30, font: 14, scrolls: true });
    const tight = inset * 2 + 24 * 31 + 23 * gap;
    expect(radixTapeLayout(24, 3, tight)).toMatchObject({ cell: 31, font: 14, scrolls: false });
    expect(radixTapeLayout(10, 6, 300).cell).toBe(radixCellWidth(6, 14));
  });

  it('drops to two rows of five bins when ten do not fit', () => {
    expect(radixBinColumns(826, 3)).toBe(10);
    expect(radixBinColumns(652, 3)).toBe(10);
    expect(radixBinColumns(272, 3)).toBe(5);
  });
});
