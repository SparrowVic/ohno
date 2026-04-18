import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { topologicalSortKahnGenerator } from './topological-sort-kahn';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...topologicalSortKahnGenerator(graph)];
}

describe('topological-sort-kahn', () => {
  it('builds a valid topological order by unlocking zero in-degree nodes', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
        { id: 'd', label: 'D', x: 3, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 1, directed: true },
        { id: 'ac', from: 'a', to: 'c', weight: 1, directed: true },
        { id: 'bd', from: 'b', to: 'd', weight: 1, directed: true },
        { id: 'cd', from: 'c', to: 'd', weight: 1, directed: true },
      ],
    });
    const finalStep = steps.at(-1);
    const dRow = finalStep?.graph?.traceRows.find((row) => row.nodeId === 'd');

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.graph?.visitOrder).toEqual(['A', 'B', 'C', 'D']);
    expect(finalStep?.graph?.detailValue).toBe('A → B → C → D');
    expect(dRow?.secondaryText).toBe('#4');
    expect(steps.some((step) => step.phase === 'skip-relax')).toBe(true);
  });

  it('preserves queue order when multiple roots start with in-degree zero', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
      ],
      edges: [{ id: 'ac', from: 'a', to: 'c', weight: 1, directed: true }],
    });

    expect(steps.at(-1)?.graph?.visitOrder).toEqual(['A', 'B', 'C']);
  });
});
