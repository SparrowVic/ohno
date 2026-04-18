import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import type { AStarScenario } from '../../utils/grid-scenarios/grid-scenarios';
import { cellId } from '../../utils/grid-scenarios/grid-scenarios';
import { aStarPathfindingGenerator } from './a-star-pathfinding';

function collectSteps(scenario: AStarScenario): SortStep[] {
  return [...aStarPathfindingGenerator(scenario)];
}

describe('a-star-pathfinding', () => {
  it('finds a shortest route around walls and reconstructs the final path', () => {
    const steps = collectSteps({
      kind: 'a-star',
      size: 4,
      walls: new Set([cellId(0, 1), cellId(1, 1), cellId(2, 1)]),
      startRow: 0,
      startCol: 0,
      goalRow: 3,
      goalCol: 3,
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.grid?.statusLabel).toBe('Path found');
    expect(finalStep?.grid?.resultCount).toBe(7);
    expect(finalStep?.description).toContain('Goal reached');
    expect(finalStep?.grid?.cells.find((cell) => cell.id === cellId(3, 3))?.status).toBe('path');
    expect(steps.some((step) => step.phase === 'relax')).toBe(true);
  });

  it('finishes with no path when the goal is sealed off', () => {
    const steps = collectSteps({
      kind: 'a-star',
      size: 3,
      walls: new Set([cellId(0, 1), cellId(1, 0)]),
      startRow: 0,
      startCol: 0,
      goalRow: 2,
      goalCol: 2,
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.grid?.statusLabel).toBe('No path found');
    expect(finalStep?.grid?.resultCount).toBe(0);
    expect(finalStep?.description).toContain('without reaching the goal');
  });
});
