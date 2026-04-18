import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { bipartiteCheckGenerator } from './bipartite-check';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...bipartiteCheckGenerator(graph)];
}

describe('bipartite-check', () => {
  it('two-colors a valid bipartite graph across both partitions', () => {
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
        { id: 'ac', from: 'a', to: 'c', weight: 1 },
        { id: 'db', from: 'd', to: 'b', weight: 1 },
        { id: 'dc', from: 'd', to: 'c', weight: 1 },
      ],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.description).toContain('Every edge connects opposite sides');
    expect(finalStep?.graph?.detailValue).toBe('Left: A, D · Right: B, C');
    expect(steps.some((step) => step.phase === 'skip-relax')).toBe(true);
  });

  it('stops immediately when it finds an odd-cycle same-side conflict', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 1 },
        { id: 'ac', from: 'a', to: 'c', weight: 1 },
        { id: 'bc', from: 'b', to: 'c', weight: 1 },
      ],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.description).toContain('Bipartite check failed');
    expect(finalStep?.graph?.detailValue).toBe('Conflict: B ↔ C');
    expect(
      finalStep?.graph?.nodes.filter((node) => node.tone === 'critical').map((node) => node.label),
    ).toEqual(['B', 'C']);
  });
});
