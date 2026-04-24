import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import type { FloydWarshallScenario } from '../../utils/scenarios/matrix/matrix-scenarios';
import { floydWarshallGenerator } from './floyd-warshall';

function collectSteps(scenario: FloydWarshallScenario): SortStep[] {
  return [...floydWarshallGenerator(scenario)];
}

function cellValue(step: SortStep | undefined, row: number, col: number): string | undefined {
  return step?.matrix?.cells.find((cell) => cell.row === row && cell.col === col)?.valueLabel;
}

describe('floyd-warshall', () => {
  it('computes all-pairs shortest paths on the compact classic matrix', () => {
    const steps = collectSteps({
      kind: 'floyd-warshall',
      labels: ['A', 'B', 'C', 'D', 'E'],
      matrix: [
        [0, 3, 8, null, 7],
        [8, 0, 2, 5, null],
        [5, null, 0, 1, null],
        [2, null, null, 0, 1],
        [null, null, 3, 2, 0],
      ],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.matrix?.resultLabel).toBe('updates 22');
    expect(cellValue(finalStep, 0, 3)).toBe('6');
    expect(cellValue(finalStep, 1, 0)).toBe('5');
    expect(cellValue(finalStep, 4, 1)).toBe('7');
    expect(steps.some((step) => step.phase === 'relax')).toBe(true);
  });

  it('keeps unreachable pairs at infinity when no pivot can connect them', () => {
    const steps = collectSteps({
      kind: 'floyd-warshall',
      labels: ['A', 'B', 'C'],
      matrix: [
        [0, 2, null],
        [null, 0, null],
        [null, null, 0],
      ],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.matrix?.resultLabel).toBe('updates 0');
    expect(cellValue(finalStep, 0, 2)).toBe('∞');
    expect(cellValue(finalStep, 2, 0)).toBe('∞');
  });
});
