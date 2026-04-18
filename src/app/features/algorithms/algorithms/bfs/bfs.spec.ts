import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { bfsGenerator } from './bfs';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...bfsGenerator(graph)];
}

function createTraversalGraph(): WeightedGraphData {
  return {
    sourceId: 'a',
    nodes: [
      { id: 'a', label: 'A', x: 0, y: 0 },
      { id: 'b', label: 'B', x: 1, y: 0 },
      { id: 'c', label: 'C', x: 2, y: 0 },
      { id: 'd', label: 'D', x: 3, y: 0 },
    ],
    edges: [
      { id: 'ab', from: 'a', to: 'b', weight: 1 },
      { id: 'ac', from: 'a', to: 'c', weight: 1 },
      { id: 'bd', from: 'b', to: 'd', weight: 1 },
      { id: 'cd', from: 'c', to: 'd', weight: 1 },
    ],
  };
}

describe('bfs', () => {
  it('visits reachable nodes level by level and records the first shortest parent', () => {
    const steps = collectSteps(createTraversalGraph());
    const finalStep = steps.at(-1);
    const dRow = finalStep?.graph?.traceRows.find((row) => row.nodeId === 'd');

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.graph?.visitOrder).toEqual(['A', 'B', 'C', 'D']);
    expect(dRow?.distance).toBe(2);
    expect(dRow?.secondaryText).toBe('B');
    expect(steps.some((step) => step.phase === 'relax')).toBe(true);
    expect(steps.some((step) => step.phase === 'skip-relax')).toBe(true);
  });

  it('keeps unreachable nodes outside the visit order and frontier', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
      ],
      edges: [{ id: 'ab', from: 'a', to: 'b', weight: 1 }],
    });
    const finalStep = steps.at(-1);
    const cRow = finalStep?.graph?.traceRows.find((row) => row.nodeId === 'c');

    expect(finalStep?.graph?.visitOrder).toEqual(['A', 'B']);
    expect(cRow?.distance).toBeNull();
    expect(cRow?.isSettled).toBe(false);
  });
});
