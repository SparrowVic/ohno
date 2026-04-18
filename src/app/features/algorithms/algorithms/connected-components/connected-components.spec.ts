import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { connectedComponentsGenerator } from './connected-components';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...connectedComponentsGenerator(graph)];
}

describe('connected-components', () => {
  it('labels every disconnected region with its own component id', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
        { id: 'd', label: 'D', x: 3, y: 0 },
        { id: 'e', label: 'E', x: 4, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 1 },
        { id: 'bc', from: 'b', to: 'c', weight: 1 },
        { id: 'de', from: 'd', to: 'e', weight: 1 },
      ],
    });
    const finalStep = steps.at(-1);
    const byLabel = Object.fromEntries(
      (finalStep?.graph?.traceRows ?? []).map((row) => [row.label, row.distance]),
    );

    expect(finalStep?.phase).toBe('graph-complete');
    expect(finalStep?.description).toContain('Found 2 disconnected groups');
    expect(finalStep?.graph?.detailValue).toBe('C1: A, B, C · C2: D, E');
    expect(byLabel).toEqual({ A: 1, B: 1, C: 1, D: 2, E: 2 });
  });

  it('keeps a single isolated node as its own component', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
      ],
      edges: [],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.graph?.detailValue).toBe('C1: A · C2: B');
    expect(finalStep?.graph?.visitOrder).toEqual(['A', 'B']);
  });
});
