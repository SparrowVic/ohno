import { describe, expect, it } from 'vitest';

import {
  TapeMetrics,
  assignLanes,
  cellNeed,
  chipWidth,
  clampIndex,
  maxChars,
  tapeCenter,
  tapeLayout,
  tapeSpan,
} from './tape-layout.utils';

const METRICS: TapeMetrics = {
  gap: 4,
  inset: 10,
  minCell: 30,
  maxCell: 48,
  pad: 10,
  advance: 0.6,
  fonts: [18, 16, 14],
};

describe('tapeLayout', () => {
  it('caps the cell at maxCell when the tape is roomy', () => {
    const layout = tapeLayout(6, 2, 900, METRICS);
    expect(layout).toEqual({ cell: 48, font: 18, pitch: 52, scrolls: false });
  });

  it('shrinks the font before it starts scrolling', () => {
    const layout = tapeLayout(24, 2, 24 * 34 + 20 + 23 * 4, METRICS);
    expect(layout.scrolls).toBe(false);
    expect(layout.font).toBe(18);
    const tighter = tapeLayout(24, 3, 24 * 40 + 20 + 23 * 4, METRICS);
    expect(tighter.font).toBe(16);
    expect(tighter.scrolls).toBe(false);
  });

  it('scrolls at the smallest font when nothing fits', () => {
    const layout = tapeLayout(64, 3, 360, METRICS);
    expect(layout.scrolls).toBe(true);
    expect(layout.font).toBe(14);
    expect(layout.cell).toBe(cellNeed(3, 14, METRICS));
  });

  it('never reports a cell below minCell', () => {
    expect(cellNeed(1, 14, METRICS)).toBe(30);
  });
});

describe('tape geometry', () => {
  const layout = { cell: 40, font: 18, pitch: 44, scrolls: false };

  it('spans a range of cells edge to edge', () => {
    expect(tapeSpan(2, 4, layout)).toEqual({ left: 88, width: 128 });
    expect(tapeSpan(4, 2, layout, 3)).toEqual({ left: 85, width: 134 });
  });

  it('centres a cursor on its cell', () => {
    expect(tapeCenter(3, layout)).toBe(152);
  });

  it('clamps pointers that walked off the tape', () => {
    expect(clampIndex(-1, 5)).toBe(0);
    expect(clampIndex(7, 5)).toBe(4);
    expect(clampIndex(2, 0)).toBe(0);
  });
});

describe('assignLanes', () => {
  it('keeps far chips on one lane and stacks colliding ones', () => {
    const width = chipWidth('L');
    expect(assignLanes([{ index: 0, width }, { index: 4, width }], 40)).toEqual([0, 0]);
    expect(assignLanes([{ index: 3, width }, { index: 3, width }], 40)).toEqual([0, 1]);
  });

  it('returns lanes in input order', () => {
    const width = chipWidth('mid');
    expect(assignLanes([{ index: 5, width }, { index: 5, width }, { index: 0, width }], 40)).toEqual([0, 1, 0]);
  });
});

describe('maxChars', () => {
  it('measures the longest printed value', () => {
    expect(maxChars([3, -12, 7])).toBe(3);
    expect(maxChars([])).toBe(1);
  });
});
