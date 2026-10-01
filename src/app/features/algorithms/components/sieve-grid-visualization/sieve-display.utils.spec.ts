import { describe, expect, it } from 'vitest';

import { sieveOfEratosthenesGenerator } from '../../algorithms/sieve-of-eratosthenes/sieve-of-eratosthenes';
import { SieveCellState, SieveGridCell, SieveGridTraceState } from '../../models/sieve-grid';
import { createEratosthenesScenario } from '../../utils/scenarios/sieve-grid/sieve-grid-scenarios';
import {
  SIEVE_BOARD_METRICS,
  sieveBoardLayout,
  sieveBoardRows,
  sieveCellTone,
  sieveFocusValue,
  sievePrimeChips,
  sieveStatRows,
  sieveStatTone,
  sieveVisibleCells,
  smallestFactor,
} from './sieve-display.utils';

function cell(value: number, state: SieveCellState, factorLabel: string | null = null): SieveGridCell {
  return { value, state, factorLabel };
}

function trace(cells: SieveGridCell[]): SieveGridTraceState {
  return {
    mode: 'eratosthenes',
    modeLabel: '',
    phaseLabel: '',
    decisionLabel: '',
    presetLabel: '',
    tone: 'mark',
    cells,
    activePrime: 2,
    bound: 3,
    stats: [],
    resultLabel: null,
    iteration: 0,
  };
}

function states(upper: number): SieveGridTraceState[] {
  const scenario = createEratosthenesScenario(upper, 'classic', { upper });
  return [...sieveOfEratosthenesGenerator(scenario)].map((step) => step.sieveGrid!);
}

describe('sieve display utils', () => {
  it('maps every cell state onto a display tone', () => {
    expect(sieveCellTone('unchecked')).toBe('ink');
    expect(sieveCellTone('skipped')).toBe('dim');
    expect(sieveCellTone('prime')).toBe('lime');
    expect(sieveCellTone('composite')).toBe('crossed');
    expect(sieveCellTone('current')).toBe('cyan');
    expect(sieveCellTone('current-prime')).toBe('violet');
    expect(sieveCellTone('marking')).toBe('pink');
    expect(sieveCellTone('just-marked')).toBe('pink');
  });

  it('maps stat chip tones onto semantic colours', () => {
    expect(sieveStatTone('info')).toBe('cyan');
    expect(sieveStatTone('accent')).toBe('pink');
    expect(sieveStatTone('success')).toBe('lime');
    expect(sieveStatTone('warning')).toBe('amber');
    expect(sieveStatTone('danger')).toBe('red');
  });

  it('finds the smallest prime factor of composites only', () => {
    expect(smallestFactor(1)).toBeNull();
    expect(smallestFactor(2)).toBeNull();
    expect(smallestFactor(3)).toBeNull();
    expect(smallestFactor(4)).toBe(2);
    expect(smallestFactor(35)).toBe(5);
    expect(smallestFactor(49)).toBe(7);
    expect(smallestFactor(97)).toBeNull();
    expect(smallestFactor(391)).toBe(17);
  });

  it('focuses the cell being crossed before the pivot and the checked cell', () => {
    expect(sieveFocusValue([cell(2, 'current-prime'), cell(4, 'marking')])).toBe(4);
    expect(sieveFocusValue([cell(2, 'prime'), cell(3, 'current-prime')])).toBe(3);
    expect(sieveFocusValue([cell(4, 'current')])).toBe(4);
    expect(sieveFocusValue([cell(2, 'prime'), cell(3, 'unchecked')])).toBeNull();
  });

  it('drops zero, lays rows from 1 and tags crossed cells', () => {
    const rows = sieveBoardRows(
      trace([
        cell(0, 'skipped'),
        cell(1, 'skipped'),
        cell(2, 'current-prime'),
        cell(3, 'unchecked'),
        cell(4, 'composite'),
        cell(5, 'unchecked'),
        cell(6, 'marking', '×3'),
      ]),
      5,
    );
    expect(rows.map((row) => row.base)).toEqual([0, 5]);
    expect(rows[0]!.cells.map((item) => item.value)).toEqual([1, 2, 3, 4, 5]);
    const four = rows[0]!.cells[3]!;
    expect(four).toMatchObject({ tone: 'crossed', struck: true, tag: '÷2', factor: 2, row: 0, column: 3 });
    const six = rows[1]!.cells[0]!;
    expect(six).toMatchObject({ tone: 'pink', struck: true, tag: '×3', focus: true, stateName: 'marking' });
    expect(rows[0]!.cells[1]).toMatchObject({ tone: 'violet', stateName: 'pivot', focus: false, tag: null });
    expect(rows[0]!.cells[0]).toMatchObject({ tone: 'dim', struck: false });
  });

  it('prefers ten columns, falls back to five, then to whatever fits', () => {
    const { rowHead, gap, inset } = SIEVE_BOARD_METRICS;
    const wide = sieveBoardLayout(48, 900, 480);
    expect(wide.columns).toBe(10);
    expect(wide.rows).toBe(5);
    expect(wide.cell).toBeLessThanOrEqual(SIEVE_BOARD_METRICS.maxCell);
    expect(wide.scrolls).toBe(false);

    const phone = sieveBoardLayout(48, 300, 380);
    expect(phone.columns).toBe(5);
    expect(phone.cell).toBeGreaterThanOrEqual(SIEVE_BOARD_METRICS.minCell);
    expect(phone.scrolls).toBe(true);

    const narrow = sieveBoardLayout(48, rowHead + gap + inset * 2 + 3 * 34 + 2 * gap, 300);
    expect(narrow.columns).toBe(3);

    expect(sieveBoardLayout(400, 1000, 500).columns).toBe(20);
    expect(sieveBoardLayout(400, 600, 500).columns).toBe(10);
  });

  it('widens to twelve columns when that keeps the whole board in view', () => {
    const fitted = sieveBoardLayout(96, 605, 360);
    expect(fitted.columns).toBe(12);
    expect(fitted.rows).toBe(8);
    expect(fitted.scrolls).toBe(false);
    expect(sieveBoardLayout(96, 605, 600).columns).toBe(10);
    expect(sieveBoardLayout(400, 605, 360).columns).toBe(10);
  });

  it('keeps Doto at 14px or more and hides tags in small cells', () => {
    const small = sieveBoardLayout(400, 420, 300);
    expect(small.cell).toBe(SIEVE_BOARD_METRICS.minCell);
    expect(small.font).toBe(14);
    expect(small.tags).toBe(false);
    const large = sieveBoardLayout(24, 900, 500);
    expect(large.font).toBe(18);
    expect(large.tags).toBe(true);
  });

  it('lists primes with the pivot, else the newest, as head', () => {
    const live = sievePrimeChips([cell(2, 'prime'), cell(3, 'current-prime'), cell(5, 'unchecked')]);
    expect(live).toEqual([
      { value: 2, head: false, pivot: false },
      { value: 3, head: true, pivot: true },
    ]);
    const done = sievePrimeChips([cell(2, 'prime'), cell(3, 'prime'), cell(4, 'composite')]);
    expect(done.map((chip) => chip.head)).toEqual([false, true]);
    expect(sievePrimeChips([cell(4, 'composite')])).toEqual([]);
  });

  it('marks only plain digit stat values as numeric', () => {
    const rows = sieveStatRows([
      { label: 'a', value: '12', tone: 'success' },
      { label: 'b', value: '3 × 4', tone: 'accent' },
      { label: 'c', value: '—', tone: 'info' },
      { label: 'd', value: { key: 'x', params: {} }, tone: 'danger' },
    ]);
    expect(rows.map((row) => row.numeric)).toEqual([true, false, false, false]);
    expect(rows.map((row) => row.tone)).toEqual(['lime', 'pink', 'cyan', 'red']);
  });

  it('keeps every board consistent across a whole run', () => {
    for (const upper of [24, 48, 96]) {
      const run = states(upper);
      for (const current of run) {
        const visible = sieveVisibleCells(current.cells);
        const rows = sieveBoardRows(current, 10);
        expect(rows.flatMap((row) => row.cells).length).toBe(visible.length);
        expect(rows.flatMap((row) => row.cells).filter((item) => item.focus).length).toBeLessThanOrEqual(1);
        for (const item of rows.flatMap((row) => row.cells)) {
          if (item.tone === 'crossed') expect(item.factor).not.toBeNull();
        }
      }
      const last = run[run.length - 1]!;
      const primes = sievePrimeChips(last.cells).map((chip) => chip.value);
      expect(primes.every((value) => smallestFactor(value) === null && value > 1)).toBe(true);
      expect(primes.length).toBe(last.cells.filter((item) => item.state === 'prime').length);
    }
  });
});
