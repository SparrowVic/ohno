import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { dijkstraGenerator } from './dijkstra';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...dijkstraGenerator(graph)];
}

describe('dijkstra', () => {
  it('settles nodes in shortest-distance order and keeps the best predecessor chain', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
        { id: 'd', label: 'D', x: 3, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 1 },
        { id: 'ac', from: 'a', to: 'c', weight: 4 },
        { id: 'bc', from: 'b', to: 'c', weight: 1 },
        { id: 'bd', from: 'b', to: 'd', weight: 2 },
        { id: 'cd', from: 'c', to: 'd', weight: 5 },
      ],
    });
    const finalStep = steps.at(-1);
    const trace = finalStep?.graph?.traceRows ?? [];

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.graph?.visitOrder).toEqual(['A', 'B', 'C', 'D']);
    expect(trace.find((row) => row.nodeId === 'b')?.distance).toBe(1);
    expect(trace.find((row) => row.nodeId === 'c')?.distance).toBe(2);
    expect(trace.find((row) => row.nodeId === 'c')?.secondaryText).toBe('B');
    expect(trace.find((row) => row.nodeId === 'd')?.distance).toBe(3);
    expect(trace.find((row) => row.nodeId === 'd')?.secondaryText).toBe('B');
    expect(steps.some((step) => step.phase === 'skip-relax')).toBe(true);
  });

  it('leaves unreachable nodes at infinity and out of the settled order', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
      ],
      edges: [{ id: 'ab', from: 'a', to: 'b', weight: 2 }],
    });
    const finalStep = steps.at(-1);
    const cRow = finalStep?.graph?.traceRows.find((row) => row.nodeId === 'c');

    expect(finalStep?.graph?.visitOrder).toEqual(['A', 'B']);
    expect(cRow?.distance).toBeNull();
    expect(cRow?.isSettled).toBe(false);
  });
});
