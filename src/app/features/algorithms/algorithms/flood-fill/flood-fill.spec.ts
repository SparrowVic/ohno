import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { FloodFillScenario } from '../../utils/scenarios/grid/grid-scenarios';
import { floodFillGenerator } from './flood-fill';

function collectSteps(scenario: FloodFillScenario): SortStep[] {
  return [...floodFillGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('flood-fill', () => {
  it('fills the whole connected source-color region and blocks the rest', () => {
    const steps = collectSteps({
      kind: 'flood-fill',
      size: 3,
      cells: [
        [1, 1, 2],
        [1, 2, 2],
        [1, 2, 3],
      ],
      startRow: 0,
      startCol: 0,
      sourceColor: 1,
      fillColor: 4,
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.phase).toBe('graph-complete');
    expect(keyOf(finalStep?.grid?.statusLabel)).toBe(
      'features.algorithms.runtime.grid.floodFill.statuses.regionComplete',
    );
    expect(finalStep?.grid?.resultCount).toBe(4);
    expect(finalStep?.grid?.visitOrder).toEqual(['r0 c0', 'r0 c1', 'r1 c0', 'r2 c0']);
    expect(finalStep?.grid?.cells.filter((cell) => cell.status === 'filled')).toHaveLength(4);
    expect(steps.some((step) => step.phase === 'inspect-edge')).toBe(true);
  });

  it('stays on the seed when no neighbor matches the source color', () => {
    const steps = collectSteps({
      kind: 'flood-fill',
      size: 2,
      cells: [
        [1, 2],
        [3, 4],
      ],
      startRow: 0,
      startCol: 0,
      sourceColor: 1,
      fillColor: 9,
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.grid?.resultCount).toBe(1);
    expect(finalStep?.grid?.visitOrder).toEqual(['r0 c0']);
  });

  it('exposes the FIFO queue with the oldest entry first', () => {
    const steps = collectSteps({
      kind: 'flood-fill',
      size: 3,
      cells: [
        [1, 1, 1],
        [1, 1, 2],
        [2, 2, 2],
      ],
      startRow: 1,
      startCol: 1,
      sourceColor: 1,
      fillColor: 5,
    });

    expect(steps[0]?.grid?.frontierOrder).toEqual(['1:1']);
    const queued = steps.filter((step) => step.phase === 'inspect-edge').map((step) => step.grid?.frontierOrder ?? []);
    expect(queued[0]).toEqual(['0:1']);
    expect(queued[1]).toEqual(['0:1', '1:0']);
    const nextPick = steps.find((step, index) => index > 0 && step.phase === 'pick-node' && step.grid?.activeCellId === '0:1');
    expect(nextPick?.grid?.frontierOrder).toEqual(['1:0']);
  });
});
