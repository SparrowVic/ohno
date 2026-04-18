import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  generateBellmanFordGraph,
  generateBipartiteGraph,
  generateBridgesGraph,
  generateColoringGraph,
  generateConnectedComponentsGraph,
  generateCycleDetectionGraph,
  generateDagGraph,
  generateDijkstraGraph,
  generateDominatorGraph,
  generateEulerGraph,
  generateSccGraph,
  generateSteinerGraph,
  generateTraversalGraph,
} from './dijkstra-graph';
import type { WeightedGraphData } from '../../models/graph';

function expectGraphBasics(graph: WeightedGraphData, size: number): void {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));

  expect(graph.nodes).toHaveLength(size);
  expect(graph.edges.length).toBeGreaterThan(0);
  expect(graph.sourceId).toBe(graph.nodes[0]?.id ?? '');
  expect(new Set(graph.nodes.map((node) => node.id)).size).toBe(graph.nodes.length);
  expect(
    graph.edges.every(
      (edge) =>
        nodeIds.has(edge.from) &&
        nodeIds.has(edge.to) &&
        Number.isFinite(edge.weight),
    ),
  ).toBe(true);
}

describe('dijkstra-graph utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds valid graph data for the exported generator variants', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const generators = [
      generateDijkstraGraph,
      generateTraversalGraph,
      generateDagGraph,
      generateConnectedComponentsGraph,
      generateBipartiteGraph,
      generateBellmanFordGraph,
      generateBridgesGraph,
      generateSccGraph,
      generateEulerGraph,
      generateColoringGraph,
      generateSteinerGraph,
      generateDominatorGraph,
    ];

    for (const generator of generators) {
      expectGraphBasics(generator(6), 6);
      expectGraphBasics(generator(10), 10);
    }
  });

  it('keeps traversal edges unit-weight and dag edges directed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const traversal = generateTraversalGraph(8);
    const dag = generateDagGraph(8);

    expect(traversal.edges.every((edge) => edge.weight === 1)).toBe(true);
    expect(dag.edges.every((edge) => edge.directed)).toBe(true);
  });

  it('adds a dedicated cycle edge and optional bipartite conflict edge when randomness is high', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const dag = generateDagGraph(8);
    const cyclic = generateCycleDetectionGraph(8);
    const bipartite = generateBipartiteGraph(6);

    expect(cyclic.edges).toHaveLength(dag.edges.length + 1);
    expect(cyclic.edges.some((edge) => edge.from === 'node-6' && edge.to === 'node-2')).toBe(true);
    expect(
      bipartite.edges.some(
        (edge) =>
          (edge.from === 'node-0' && edge.to === 'node-1') ||
          (edge.from === 'node-1' && edge.to === 'node-0'),
      ),
    ).toBe(true);
  });

  it('omits the optional bipartite conflict edge when randomness is low', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const bipartite = generateBipartiteGraph(6);

    expect(
      bipartite.edges.some(
        (edge) =>
          (edge.from === 'node-0' && edge.to === 'node-1') ||
          (edge.from === 'node-1' && edge.to === 'node-0'),
      ),
    ).toBe(false);
  });
});
