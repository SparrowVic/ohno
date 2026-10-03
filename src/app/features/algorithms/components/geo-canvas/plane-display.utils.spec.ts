import { describe, expect, it } from 'vitest';

import {
  chipWidth,
  eventProgress,
  eventRows,
  formatNumber,
  formatSigned,
  planeBounds,
  planeFrame,
  planeGrid,
  project,
  projectLength,
  turnArcPath,
} from './plane-display.utils';

describe('plane-display.utils', () => {
  it('snaps bounds to a nice step that covers every finite point', () => {
    const bounds = planeBounds([
      { x: 12, y: 7 },
      { x: 88, y: 63 },
      { x: Number.NaN, y: 4 },
    ]);
    expect(bounds).toEqual({ minX: 10, maxX: 90, minY: 0, maxY: 70, step: 10 });
  });

  it('falls back to the 0..100 plane without points', () => {
    expect(planeBounds([])).toEqual({ minX: 0, maxX: 100, minY: 0, maxY: 100, step: 10 });
  });

  it('keeps a span for a single point and handles negative coordinates', () => {
    const single = planeBounds([{ x: 5, y: 5 }]);
    expect(single.maxX).toBeGreaterThan(single.minX);
    const negative = planeBounds([
      { x: -14, y: -3 },
      { x: 6, y: 9 },
    ]);
    expect(negative.minX).toBeLessThanOrEqual(-14);
    expect(negative.maxY).toBeGreaterThanOrEqual(9);
  });

  it('scales the plane uniformly into the box and centres it', () => {
    const frame = planeFrame({ minX: 0, maxX: 100, minY: 0, maxY: 50, step: 10 }, { width: 600, height: 400 });
    expect(frame.scale).toBeCloseTo((600 - 44) / 100);
    expect(frame.plotWidth).toBeCloseTo(556);
    expect(frame.plotHeight).toBeCloseTo(278);
    expect(frame.top).toBeGreaterThan(14);
    expect(frame.left + frame.plotWidth).toBeLessThanOrEqual(600);
    expect(frame.top + frame.plotHeight).toBeLessThanOrEqual(400);
  });

  it('flips y so larger values sit higher on screen', () => {
    const frame = planeFrame({ minX: 0, maxX: 10, minY: 0, maxY: 10, step: 1 }, { width: 300, height: 300 });
    const low = project(frame, { x: 0, y: 0 });
    const high = project(frame, { x: 10, y: 10 });
    expect(high.y).toBeLessThan(low.y);
    expect(high.x).toBeGreaterThan(low.x);
    expect(projectLength(frame, 2)).toBeCloseTo(2 * frame.scale, 1);
  });

  it('builds one grid line per tick and labels the axes', () => {
    const frame = planeFrame({ minX: 0, maxX: 100, minY: 0, maxY: 60, step: 10 }, { width: 640, height: 420 });
    const grid = planeGrid(frame);
    expect(grid.lines).toHaveLength(11 + 7);
    expect(grid.lines.filter((line) => line.edge)).toHaveLength(4);
    expect(grid.xTicks.map((tick) => tick.label)).toEqual(['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']);
    expect(grid.yTicks[0]!.label).toBe('0');
    expect(grid.viewBox).toBe('0 0 640 420');
  });

  it('formats numbers with a typographic minus', () => {
    expect(formatNumber(-3.25, 1)).toBe('−3.3');
    expect(formatNumber(4, 2)).toBe('4');
    expect(formatSigned(412)).toBe('+412');
    expect(formatSigned(-96)).toBe('−96');
    expect(formatSigned(0)).toBe('0');
  });

  it('draws the turn arc only for a real angle', () => {
    const vertex = { x: 0, y: 0 };
    expect(turnArcPath({ x: -10, y: 0 }, vertex, { x: 0, y: -10 }, 5)).toMatch(/^M .* A 5 5 0 0 [01] /);
    expect(turnArcPath({ x: 10, y: 0 }, vertex, { x: 20, y: 0 }, 5)).toBeNull();
  });

  it('maps event chips to rack rows and counts the finished ones', () => {
    const events = [
      { id: 'a', label: 'A', x: 1, kind: 'start' as const, tone: 'done' as const },
      { id: 'b', label: 'B', x: 2, kind: 'start' as const, tone: 'current' as const },
      { id: 'c', label: 'C', x: 3, kind: 'end' as const, tone: 'queued' as const },
    ];
    const rows = eventRows(events, (event) => event.label, (event) => String(event.x), (event) => `#${event.id}`);
    expect(rows.map((row) => [row.led, row.current, row.tone, row.body])).toEqual([
      ['lime', false, 'default', '#a'],
      ['cyan', true, 'head', '#b'],
      ['slate', false, 'default', '#c'],
    ]);
    expect(eventProgress(events)).toBe('1/3');
  });

  it('sizes a chip from its text length', () => {
    expect(chipWidth('r = 12')).toBeGreaterThan(chipWidth('3'));
  });
});
