import { describe, expect, it } from 'vitest';

import {
  createDinicScenario,
  createEdmondsKarpScenario,
  createHopcroftKarpScenario,
  createMinCostMaxFlowScenario,
} from './network-scenarios';

describe('network-scenarios', () => {
  it('builds compact and large flow networks with source and sink lanes', () => {
    const compact = createDinicScenario(8);
    const large = createEdmondsKarpScenario(10);

    expect(compact.nodes).toHaveLength(8);
    expect(compact.sourceId).toBe('s');
    expect(compact.sinkId).toBe('t');
    expect(compact.edges.every((edge) => edge.directed && typeof edge.capacity === 'number')).toBe(
      true,
    );

    expect(large.nodes).toHaveLength(10);
    expect(large.edges.every((edge) => edge.directed)).toBe(true);
  });

  it('creates bipartite matching scenarios with separated partitions', () => {
    const scenario = createHopcroftKarpScenario(10);

    expect(scenario.leftIds).toHaveLength(5);
    expect(scenario.rightIds).toHaveLength(5);
    expect(
      scenario.nodes.filter((node) => node.lane === 'left').map((node) => node.id),
    ).toEqual(scenario.leftIds);
    expect(
      scenario.nodes.filter((node) => node.lane === 'right').map((node) => node.id),
    ).toEqual(scenario.rightIds);
    expect(
      scenario.edges.every(
        (edge) =>
          scenario.leftIds.includes(edge.fromId) && scenario.rightIds.includes(edge.toId),
      ),
    ).toBe(true);
  });

  it('includes numeric costs in min-cost max-flow scenarios', () => {
    const scenario = createMinCostMaxFlowScenario(8);

    expect(scenario.sourceId).toBe('s');
    expect(scenario.sinkId).toBe('t');
    expect(scenario.edges.every((edge) => typeof edge.cost === 'number')).toBe(true);
    expect(new Set(scenario.nodes.map((node) => node.id)).size).toBe(scenario.nodes.length);
  });
});
