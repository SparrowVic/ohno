import { describe, expect, it } from 'vitest';

import { kadaneGenerator } from '../../algorithms/kadane/kadane';
import { palindromeCheckGenerator } from '../../algorithms/palindrome-check/palindrome-check';
import { slidingWindowGenerator } from '../../algorithms/sliding-window/sliding-window';
import { twoPointersGenerator } from '../../algorithms/two-pointers/two-pointers';
import { PointerLabTraceState } from '../../models/pointer-lab';
import { SortStep } from '../../models/sort-step';
import { TapeLayout } from '../../utils/helpers/tape-layout/tape-layout.utils';
import {
  createKadaneScenario,
  createPalindromeScenario,
  createSlidingWindowScenario,
  createTwoPointersScenario,
} from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import {
  isDotValue,
  pointerBand,
  pointerChars,
  pointerCursors,
  pointerFocus,
  pointerGlyph,
  pointerLanes,
  pointerStatRows,
  pointerTapeView,
} from './pointer-lab-display.utils';

const LAYOUT: TapeLayout = { cell: 40, font: 20, pitch: 45, scrolls: false };

function states(steps: Generator<SortStep>): PointerLabTraceState[] {
  return [...steps].map((step) => step.pointerLab).filter((state): state is PointerLabTraceState => !!state);
}

function withPointers(state: PointerLabTraceState, pointers: PointerLabTraceState['pointers']): PointerLabTraceState {
  return { ...state, pointers };
}

describe('pointerTapeView', () => {
  const trace = states(twoPointersGenerator(createTwoPointersScenario(1, null)));

  it('maps every cell and centres the focus between the pointers', () => {
    const first = trace[0]!;
    const view = pointerTapeView(first);
    expect(view.cells).toHaveLength(first.cells.length);
    expect(view.focus).toBe(Math.round((first.cells.length - 1) / 2));
    expect(view.cells.filter((cell) => cell.focus)).toHaveLength(1);
  });

  it('maps statuses onto tape tones', () => {
    const base = trace[0]!;
    const state: PointerLabTraceState = {
      ...base,
      mode: 'reverse',
      cells: [
        { index: 0, value: '1', status: 'left', overlay: null },
        { index: 1, value: '2', status: 'mismatch', overlay: null },
        { index: 2, value: '3', status: 'settled', overlay: null },
        { index: 3, value: ' ', status: 'best', overlay: 'end' },
      ],
    };
    const view = pointerTapeView(state);
    expect(view.cells.map((cell) => cell.tone)).toEqual(['cyan', 'red', 'settled', 'lime']);
    expect(view.cells[3]).toMatchObject({ glyph: '␣', overlay: 'end' });
    expect(pointerTapeView({ ...state, mode: 'two-pointers' }).cells[2]?.tone).toBe('dim');
  });
});

describe('pointerCursors', () => {
  const base = states(twoPointersGenerator(createTwoPointersScenario(1, null)))[0]!;

  it('tints chips by pointer tone and centres them on cells', () => {
    const cursors = pointerCursors(base, LAYOUT);
    expect(cursors.map((cursor) => [cursor.label, cursor.tone])).toEqual([
      ['L', 'cyan'],
      ['R', 'pink'],
    ]);
    expect(cursors[0]?.x).toBe(20);
  });

  it('stacks two chips that share a cell on one side', () => {
    const state = withPointers(base, [
      { id: 'L', label: 'L', index: 2, side: 'top', tone: 'accent' },
      { id: 'R', label: 'R', index: 2, side: 'top', tone: 'warm' },
    ]);
    const cursors = pointerCursors(state, LAYOUT);
    expect(cursors.map((cursor) => cursor.lane)).toEqual([0, 1]);
    expect(pointerLanes(cursors)).toEqual({ top: 2, bottom: 1 });
  });

  it('clamps pointers that walked off the tape and flags them', () => {
    const state = withPointers(base, [{ id: 'R', label: 'R', index: -1, side: 'bottom', tone: 'muted' }]);
    const [cursor] = pointerCursors(state, LAYOUT);
    expect(cursor).toMatchObject({ index: 0, off: true, tone: 'slate', side: 'bottom' });
  });

  it('keeps palindrome pointers on separate sides when they meet', () => {
    const trace = states(palindromeCheckGenerator(createPalindromeScenario(1, null)));
    const met = trace.find((state) => state.pointers[0]?.index === state.pointers[1]?.index);
    if (met) {
      const sides = pointerCursors(met, LAYOUT).map((cursor) => cursor.side);
      expect(new Set(sides).size).toBe(2);
    }
    expect(trace.length).toBeGreaterThan(0);
  });
});

describe('pointerBand', () => {
  it('spans the sliding window in the window tone', () => {
    const trace = states(slidingWindowGenerator(createSlidingWindowScenario(1, null)));
    const windowed = trace.find((state) => state.window !== null)!;
    const band = pointerBand(windowed.window, windowed.cells.length, LAYOUT);
    expect(band).not.toBeNull();
    expect(band!.from).toBe(Math.min(windowed.window!.left, windowed.window!.right));
    expect(['cyan', 'lime', 'amber']).toContain(band!.tone);
    expect(band!.width).toBeGreaterThan(0);
  });

  it('returns nothing without a window or cells', () => {
    expect(pointerBand(null, 4, LAYOUT)).toBeNull();
    expect(pointerBand({ left: 0, right: 2, tone: 'best' }, 0, LAYOUT)).toBeNull();
    expect(pointerBand({ left: 3, right: 1, tone: 'preview' }, 5, LAYOUT)).toMatchObject({
      from: 1,
      to: 3,
      tone: 'amber',
    });
  });
});

describe('stats and glyphs', () => {
  it('prints numeric stats in Doto and keys or prose in mono', () => {
    expect(isDotValue('12')).toBe(true);
    expect(isDotValue('-3')).toBe(true);
    expect(isDotValue('5  @[2..4]')).toBe(false);
    expect(isDotValue('features.algorithms.runtime.pointerLab.palindrome.stats.verdictPending')).toBe(false);
    expect(isDotValue({ key: 'a.b' })).toBe(false);
  });

  it('maps stat tones onto LED colours', () => {
    const trace = states(kadaneGenerator(createKadaneScenario(1, null)));
    const rows = pointerStatRows(trace[0]!);
    expect(rows.length).toBe(trace[0]!.stats.length);
    expect(rows.every((row) => ['slate', 'cyan', 'amber', 'lime', 'red'].includes(row.led))).toBe(true);
  });

  it('measures the widest glyph and shows hidden characters', () => {
    const trace = states(kadaneGenerator(createKadaneScenario(1, null)));
    expect(pointerChars(trace[0]!)).toBeGreaterThanOrEqual(2);
    expect(pointerGlyph('')).toBe('·');
    expect(pointerGlyph('a')).toBe('a');
  });

  it('has no focus without pointers', () => {
    const base = states(kadaneGenerator(createKadaneScenario(1, null)))[0]!;
    expect(pointerFocus({ ...base, pointers: [] })).toBeNull();
  });
});
