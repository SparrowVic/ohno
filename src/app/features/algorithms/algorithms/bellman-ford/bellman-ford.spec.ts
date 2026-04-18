import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { bellmanFordGenerator } from './bellman-ford';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...bellmanFordGenerator(graph)];
}

describe('bellman-ford', () => {
  it('propagates improvements across passes until distances stabilize', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
        { id: 'd', label: 'D', x: 3, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 4, directed: true },
        { id: 'ac', from: 'a', to: 'c', weight: 5, directed: true },
        { id: 'bc', from: 'b', to: 'c', weight: -2, directed: true },
        { id: 'bd', from: 'b', to: 'd', weight: 4, directed: true },
        { id: 'cd', from: 'c', to: 'd', weight: 3, directed: true },
      ],
    });
    const finalStep = steps.at(-1);
    const trace = finalStep?.graph?.traceRows ?? [];

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.description).toContain('Shortest paths remain stable');
    expect(finalStep?.graph?.visitOrder).toContain('Pass 1');
    expect(finalStep?.graph?.visitOrder).toContain('Pass 2');
    expect(trace.find((row) => row.nodeId === 'b')?.distance).toBe(4);
    expect(trace.find((row) => row.nodeId === 'c')?.distance).toBe(2);
    expect(trace.find((row) => row.nodeId === 'c')?.secondaryText).toBe('B');
    expect(trace.find((row) => row.nodeId === 'd')?.distance).toBe(5);
    expect(trace.find((row) => row.nodeId === 'd')?.secondaryText).toBe('C');
  });

  it('flags a reachable negative cycle during the extra verification scan', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 1, directed: true },
        { id: 'bc', from: 'b', to: 'c', weight: -2, directed: true },
        { id: 'cb', from: 'c', to: 'b', weight: -2, directed: true },
      ],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.description).toContain('negative cycle');
    expect(finalStep?.graph?.phaseLabel).toBe('Negative cycle found');
    expect(finalStep?.graph?.edges.some((edge) => edge.tone === 'critical')).toBe(true);
  });
});
