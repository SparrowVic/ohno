import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createKruskalScenario,
  createUnionFindScenario,
} from './dsu-scenarios';

describe('dsu-scenarios', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clamps small union-find scenarios to a readable minimum size', () => {
    const scenario = createUnionFindScenario(4);

    expect(scenario.nodes).toHaveLength(6);
    expect(scenario.operations.at(-1)).toEqual({
      kind: 'union',
      a: 'node-0',
      b: 'node-5',
    });
  });

  it('adds larger union-find operations when more nodes are available', () => {
    const scenario = createUnionFindScenario(10);

    expect(scenario.nodes).toHaveLength(10);
    expect(scenario.operations).toEqual(
      expect.arrayContaining([
        { kind: 'union', a: 'node-8', b: 'node-9' },
        { kind: 'find', a: 'node-9' },
      ]),
    );
  });

  it('normalizes Kruskal edge ids after sorting weighted graph edges', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const scenario = createKruskalScenario(6);

    expect(scenario.graph.nodes).toHaveLength(6);
    expect(
      scenario.graph.edges.every((edge, index) => edge.id.startsWith(`${index}:`)),
    ).toBe(true);
    expect(new Set(scenario.graph.edges.map((edge) => edge.id)).size).toBe(
      scenario.graph.edges.length,
    );
  });
});
