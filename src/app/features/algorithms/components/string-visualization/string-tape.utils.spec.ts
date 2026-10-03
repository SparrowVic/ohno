import { describe, expect, it } from 'vitest';

import {
  EMPTY_GLYPH,
  ROW_HEIGHTS,
  band,
  cell,
  charCells,
  occurrences,
  row,
  stringCellMetrics,
  stringGridLines,
  valueCells,
} from './string-tape.utils';

describe('string tape utils', () => {
  it('builds character cells at an offset with indices', () => {
    const cells = charCells('p', 'ABC', 4, (index) => (index === 1 ? 'cyan' : 'idle'));
    expect(cells.map((item) => item.column)).toEqual([4, 5, 6]);
    expect(cells.map((item) => item.index)).toEqual(['0', '1', '2']);
    expect(cells[1]?.tone).toBe('cyan');
  });

  it('renders unknown values as the empty glyph', () => {
    const cells = valueCells('l', [0, null, 2], 0, () => 'amber', (index) => index === 2);
    expect(cells.map((item) => item.glyph)).toEqual(['0', EMPTY_GLYPH, '2']);
    expect(cells[2]?.strong).toBe(true);
    expect(cell('x', 0, '', 'dim').glyph).toBe(EMPTY_GLYPH);
  });

  it('assigns caption and body grid lines and counts columns', () => {
    const rows = [
      row('text', 'tape', charCells('t', 'ABCDE', 0, () => 'idle'), { caption: 'T' }),
      row('pattern', 'tape', charCells('p', 'CD', 6, () => 'idle'), { caption: 'P' }),
      row('lps', 'values', valueCells('l', [0, 0], 6, () => 'amber')),
    ];
    const lines = stringGridLines(rows);
    expect(lines.caption).toEqual({ text: 1, pattern: 3 });
    expect(lines.body).toEqual({ text: 2, pattern: 4, lps: 5 });
    expect(lines.columns).toBe(8);
    expect(lines.template).toBe(
      `${ROW_HEIGHTS.caption}px ${ROW_HEIGHTS.tape}px ${ROW_HEIGHTS.caption}px ${ROW_HEIGHTS.tape}px ${ROW_HEIGHTS.values}px`,
    );
  });

  it('fits cells between the minimum and maximum width', () => {
    expect(stringCellMetrics(1000, 10, false).width).toBe(40);
    expect(stringCellMetrics(300, 30, false).width).toBe(22);
    expect(stringCellMetrics(602, 23, false).width).toBe(22);
    const mid = stringCellMetrics(640, 19, false);
    expect(mid.width).toBeGreaterThanOrEqual(22);
    expect(mid.width).toBeLessThanOrEqual(40);
    expect(stringCellMetrics(300, 30, false).font).toBeGreaterThanOrEqual(14);
  });

  it('orders band columns', () => {
    const marker = band('b', 'violet', 'r', 7, 3);
    expect([marker.fromColumn, marker.toColumn]).toEqual([3, 7]);
    expect(marker.toRow).toBe('r');
  });

  it('finds overlapping occurrences', () => {
    expect(occurrences('AAAA', 'AA')).toEqual([0, 1, 2]);
    expect(occurrences('ABC', 'ABCD')).toEqual([]);
  });
});
