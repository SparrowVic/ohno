import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  cellId,
  createAStarScenario,
  createFloodFillScenario,
  labelForCell,
  neighbors,
} from './grid-scenarios';

describe('grid-scenarios', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats grid ids, labels and neighbor lists predictably', () => {
    expect(cellId(2, 3)).toBe('2:3');
    expect(labelForCell(2, 3)).toBe('r2 c3');
    expect(neighbors(1, 1, 4)).toEqual([
      [0, 1],
      [1, 2],
      [2, 1],
      [1, 0],
    ]);
    expect(neighbors(0, 0, 4)).toEqual([
      [0, 1],
      [1, 0],
    ]);
  });

  it('builds a deterministic flood-fill scenario when randomness is mocked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const scenario = createFloodFillScenario(5);

    expect(scenario.kind).toBe('flood-fill');
    expect(scenario.cells.flat().every((value) => value === 1)).toBe(true);
    expect(scenario.startRow).toBe(1);
    expect(scenario.startCol).toBe(1);
    expect(scenario.sourceColor).toBe(1);
    expect(scenario.fillColor).toBe(3);
  });

  it('keeps the reserved A* route clear and start/goal unblocked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const scenario = createAStarScenario(5);

    expect(scenario.kind).toBe('a-star');
    expect(scenario.startRow).toBe(0);
    expect(scenario.startCol).toBe(0);
    expect(scenario.goalRow).toBe(4);
    expect(scenario.goalCol).toBe(4);
    expect(scenario.walls.size).toBe(0);
    expect(scenario.walls.has(cellId(0, 0))).toBe(false);
    expect(scenario.walls.has(cellId(4, 4))).toBe(false);
  });
});
