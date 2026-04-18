import { describe, expect, it } from 'vitest';

import type { WeightedGraphData } from '../../models/graph';
import type { SortStep } from '../../models/sort-step';
import { cycleDetectionGenerator } from './cycle-detection';

function collectSteps(graph: WeightedGraphData): SortStep[] {
  return [...cycleDetectionGenerator(graph)];
}

describe('cycle-detection', () => {
  it('reports the first back-edge cycle found in a directed graph', () => {
    const steps = collectSteps({
      sourceId: 'a',
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 1, y: 0 },
        { id: 'c', label: 'C', x: 2, y: 0 },
      ],
      edges: [
        { id: 'ab', from: 'a', to: 'b', weight: 1, directed: true },
        { id: 'bc', from: 'b', to: 'c', weight: 1, directed: true },
        { id: 'ca', from: 'c', to: 'a', weight: 1, directed: true },
      ],
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.description).toContain('Cycle detected');
    expect(finalStep?.graph?.detailValue).toBe('A → B → C → A');
    expect(steps.some((step) => step.phase === 'skip-relax')).toBe(true);
  });

  it('finishes cleanly when every directed path closes without a back edge', () => {
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

    expect(finalStep?.description).toContain('The graph is acyclic');
    expect(finalStep?.graph?.visitOrder).toHaveLength(4);
  });
});
