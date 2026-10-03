import { describe, expect, it } from 'vitest';

import { aStarPathfindingGenerator } from '../../algorithms/a-star-pathfinding/a-star-pathfinding';
import { floodFillGenerator } from '../../algorithms/flood-fill/flood-fill';
import { GridTraceState } from '../../models/grid';
import { SortStep } from '../../models/sort-step';
import { AStarScenario, FloodFillScenario } from '../../utils/scenarios/grid/grid-scenarios';
import {
  GRID_CELL_GAP,
  GRID_CELL_GAP_TIGHT,
  GRID_CELL_MAX,
  GRID_CELL_MAX_STACKED,
  GRID_CELL_MIN,
  GRID_VALUE_MIN_PX,
  GRID_VISIT_LIMIT,
  gridBoardMetrics,
  gridDecisionTone,
  gridDisplayCells,
  gridFrontierRows,
  gridPathOrder,
  gridPathRows,
  gridScores,
  gridShade,
  gridStatusTone,
  gridVisitRows,
} from './grid-display.utils';

const A_STAR: AStarScenario = {
  kind: 'a-star',
  size: 4,
  walls: new Set(['1:1', '2:1', '1:3']),
  startRow: 0,
  startCol: 0,
  goalRow: 3,
  goalCol: 3,
};

const FLOOD: FloodFillScenario = {
  kind: 'flood-fill',
  size: 4,
  cells: [
    [1, 1, 2, 2],
    [1, 1, 2, 3],
    [3, 1, 1, 3],
    [3, 3, 1, 4],
  ],
  startRow: 1,
  startCol: 1,
  sourceColor: 1,
  fillColor: 4,
};

function steps(generator: Generator<SortStep>): SortStep[] {
  return [...generator];
}

function grid(step: SortStep | undefined): GridTraceState {
  if (!step?.grid) throw new Error('missing grid state');
  return step.grid;
}

describe('gridScores', () => {
  it('reads g and f from the generator meta label and derives h', () => {
    expect(gridScores('g3 · f9')).toEqual({ g: 3, h: 6, f: 9 });
  });

  it('returns null for coordinate labels and missing labels', () => {
    expect(gridScores('r2 c3')).toBeNull();
    expect(gridScores(null)).toBeNull();
  });
});

describe('gridShade', () => {
  it('maps flood-fill colour tones onto four graphite shades', () => {
    expect(gridShade('color-3')).toBe(3);
    expect(gridShade('color-9')).toBe(4);
    expect(gridShade(null)).toBe(0);
    expect(gridShade('lime')).toBe(0);
  });
});

describe('gridStatusTone', () => {
  it('follows the semantic palette', () => {
    expect(gridStatusTone('current')).toBe('cyan');
    expect(gridStatusTone('frontier')).toBe('amber');
    expect(gridStatusTone('path')).toBe('lime');
    expect(gridStatusTone('filled')).toBe('lime');
    expect(gridStatusTone('source')).toBe('violet');
    expect(gridStatusTone('goal')).toBe('violet');
    expect(gridStatusTone('blocked')).toBe('red');
    expect(gridStatusTone('wall')).toBe('slate');
    expect(gridStatusTone('idle')).toBeNull();
  });
});

describe('gridBoardMetrics', () => {
  it('fits the board into the smaller of both spans', () => {
    const metrics = gridBoardMetrics(1000, 400, 10, 10);
    expect(metrics.cellSize).toBeLessThan(40);
    expect(metrics.detail).toBe('value');
  });

  it('caps the cell size and enables score tags on roomy boards', () => {
    const metrics = gridBoardMetrics(2000, 2000, 8, 8);
    expect(metrics.cellSize).toBe(GRID_CELL_MAX);
    expect(metrics.detail).toBe('full');
    expect(metrics.mark).toBe(true);
  });

  it('never drops below the minimum cell or the Doto floor', () => {
    const metrics = gridBoardMetrics(200, 200, 12, 12);
    expect(metrics.cellSize).toBe(GRID_CELL_MIN);
    expect(metrics.valueSize).toBeGreaterThanOrEqual(GRID_VALUE_MIN_PX);
    expect(metrics.mark).toBe(false);
    expect(metrics.dotCapacity).toBe(1);
  });

  it('fits two Doto digits once the cell has room', () => {
    expect(gridBoardMetrics(1000, 400, 10, 10).dotCapacity).toBeGreaterThanOrEqual(2);
  });

  it('tightens the gap on narrow boards and respects a stacked cap', () => {
    expect(gridBoardMetrics(290, 900, 12, 12).gap).toBe(GRID_CELL_GAP_TIGHT);
    expect(gridBoardMetrics(1200, 900, 8, 8).gap).toBe(GRID_CELL_GAP);
    expect(gridBoardMetrics(740, Number.POSITIVE_INFINITY, 12, 12, GRID_CELL_MAX_STACKED).cellSize).toBe(
      GRID_CELL_MAX_STACKED,
    );
  });

  it('ignores the height when the board may grow vertically', () => {
    const metrics = gridBoardMetrics(328, Number.POSITIVE_INFINITY, 10, 10);
    expect(metrics.cellSize).toBeGreaterThan(GRID_CELL_MIN);
  });
});

describe('A* display', () => {
  const trace = steps(aStarPathfindingGenerator(A_STAR));
  const last = grid(trace.at(-1));

  it('orders the final path from the source', () => {
    const order = gridPathOrder(last);
    expect(order.get('0:0')).toBe(0);
    expect(order.get('3:3')).toBe(last.resultCount - 1);
    expect(order.size).toBe(last.resultCount);
  });

  it('lists the path rack with source and goal roles', () => {
    const rows = gridPathRows(last);
    expect(rows[0]).toMatchObject({ id: '0:0', role: 'source', value: '0', tone: 'done' });
    expect(rows.at(-1)).toMatchObject({ id: '3:3', role: 'goal' });
  });

  it('shows path indices on path cells and keeps S / G glyphs', () => {
    const cells = gridDisplayCells(last);
    const start = cells.find((cell) => cell.id === '0:0');
    const goal = cells.find((cell) => cell.id === '3:3');
    expect(start).toMatchObject({ value: 'S', numeric: false, isSource: true });
    expect(goal).toMatchObject({ value: 'G', isTarget: true, status: 'path' });
    const middle = cells.filter((cell) => cell.status === 'path' && !cell.isTarget);
    expect(middle.every((cell) => cell.numeric)).toBe(true);
  });

  it('renders walls without a value and idle cells as a dot', () => {
    const cells = gridDisplayCells(grid(trace[0]));
    expect(cells.find((cell) => cell.id === '1:1')).toMatchObject({ status: 'wall', value: '', tone: 'slate' });
    expect(cells.find((cell) => cell.id === '3:0')?.value).toBe('·');
  });

  it('sorts the open set by f with the cheapest entry as head', () => {
    const state = trace.map(grid).find((item) => item.cells.filter((cell) => cell.status === 'frontier').length >= 2);
    expect(state).toBeDefined();
    const rows = gridFrontierRows(state ?? null);
    const values = rows.filter((row) => row.tone !== 'now').map((row) => Number(row.value));
    expect(values).toEqual([...values].sort((left, right) => left - right));
    expect(rows.some((row) => row.tone === 'head' || row.tone === 'now')).toBe(true);
    expect(rows.every((row) => row.detail === null || /^g\d+ h\d+$/.test(row.detail))).toBe(true);
  });

  it('counts the active cell in the open set when the generator hides it', () => {
    const state = grid(trace[1]);
    const rows = gridFrontierRows(state);
    expect(rows.length).toBe(state.frontierCount);
    expect(rows[0]).toMatchObject({ id: '0:0', tone: 'now', role: 'source' });
  });

  it('marks an unknown active cell with a question glyph', () => {
    const state = trace.map(grid).find((item) => {
      const active = item.cells.find((cell) => cell.id === item.activeCellId);
      return active && active.valueLabel === '·';
    });
    expect(state).toBeDefined();
    const active = gridDisplayCells(state ?? null).find((cell) => cell.isCurrent);
    expect(active?.value).toBe('?');
  });
});

describe('flood-fill display', () => {
  const trace = steps(floodFillGenerator(FLOOD));
  const last = grid(trace.at(-1));

  it('has no path order and shades idle cells by colour', () => {
    expect(gridPathOrder(last).size).toBe(0);
    const cells = gridDisplayCells(grid(trace[0]));
    expect(cells.find((cell) => cell.id === '0:2')?.shade).toBe(2);
    expect(cells.find((cell) => cell.id === '3:3')?.shade).toBe(4);
  });

  it('paints the filled region lime with the fill colour', () => {
    const filled = gridDisplayCells(last).filter((cell) => cell.status === 'filled');
    expect(filled.length).toBe(last.resultCount);
    expect(filled.every((cell) => cell.tone === 'lime' && cell.value === '4')).toBe(true);
  });

  it('lists the most recent visits first, numbered from one', () => {
    const rows = gridVisitRows(last);
    expect(rows[0]?.value).toBe(String(last.visitOrder.length));
    expect(rows.at(-1)?.value).toBe('1');
    expect(rows.every((row) => row.tone === 'done')).toBe(true);
  });

  it('caps the visit rack to the latest entries', () => {
    const order = Array.from({ length: GRID_VISIT_LIMIT + 5 }, (_, index) => `r0 c${index}`);
    const rows = gridVisitRows({ ...last, visitOrder: order });
    expect(rows).toHaveLength(GRID_VISIT_LIMIT);
    expect(rows[0]?.value).toBe(String(order.length));
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
  });

  it('keeps the queue in reading order without a head', () => {
    const state = trace.map(grid).find((item) => item.cells.filter((cell) => cell.status === 'frontier').length >= 2);
    const rows = gridFrontierRows(state ?? null);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.some((row) => row.tone === 'head')).toBe(false);
  });
});

describe('gridDecisionTone', () => {
  const floodState = grid(steps(floodFillGenerator(FLOOD))[0]);
  const aStarLast = grid(steps(aStarPathfindingGenerator(A_STAR)).at(-1));

  it('maps step phases onto the semantic palette', () => {
    expect(gridDecisionTone('init', floodState)).toBe('violet');
    expect(gridDecisionTone('pick-node', floodState)).toBe('cyan');
    expect(gridDecisionTone('relax', floodState)).toBe('pink');
    expect(gridDecisionTone('skip-relax', floodState)).toBe('red');
    expect(gridDecisionTone('skip-relax', aStarLast)).toBe('amber');
    expect(gridDecisionTone('graph-complete', aStarLast)).toBe('lime');
    expect(gridDecisionTone('graph-complete', { ...aStarLast, resultCount: 0 })).toBe('red');
    expect(gridDecisionTone(undefined, null)).toBe('slate');
  });
});
