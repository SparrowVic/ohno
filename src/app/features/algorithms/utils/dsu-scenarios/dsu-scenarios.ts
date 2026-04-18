import { WeightedGraphData, WeightedGraphEdge } from '../../models/graph';
import { generateDijkstraGraph } from '../dijkstra-graph/dijkstra-graph';

export interface UnionFindOperation {
  readonly kind: 'union' | 'find';
  readonly a: string;
  readonly b?: string;
}

export interface UnionFindScenario {
  readonly kind: 'union-find';
  readonly nodes: readonly { id: string; label: string }[];
  readonly operations: readonly UnionFindOperation[];
}

export interface KruskalScenario {
  readonly kind: 'kruskal';
  readonly graph: WeightedGraphData;
}

export function createUnionFindScenario(size: number): UnionFindScenario {
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const count = Math.min(Math.max(size, 6), 10);
  const nodes = Array.from({ length: count }, (_, index) => ({
    id: `node-${index}`,
    label: labels[index] ?? `N${index + 1}`,
  }));

  const baseOps: UnionFindOperation[] = [
    { kind: 'union', a: nodes[0]!.id, b: nodes[1]!.id },
    { kind: 'union', a: nodes[2]!.id, b: nodes[3]!.id },
    { kind: 'find', a: nodes[1]!.id },
    { kind: 'union', a: nodes[1]!.id, b: nodes[2]!.id },
    { kind: 'union', a: nodes[4]!.id, b: nodes[5]!.id },
    { kind: 'find', a: nodes[3]!.id },
  ];

  if (count >= 8) {
    baseOps.push(
      { kind: 'union', a: nodes[6]!.id, b: nodes[7]!.id },
      { kind: 'union', a: nodes[5]!.id, b: nodes[6]!.id },
      { kind: 'find', a: nodes[7]!.id },
    );
  }

  if (count >= 10) {
    baseOps.push(
      { kind: 'union', a: nodes[8]!.id, b: nodes[9]!.id },
      { kind: 'union', a: nodes[0]!.id, b: nodes[8]!.id },
      { kind: 'find', a: nodes[9]!.id },
    );
  } else {
    baseOps.push({ kind: 'union', a: nodes[0]!.id, b: nodes[count - 1]!.id });
  }

  return {
    kind: 'union-find',
    nodes,
    operations: baseOps,
  };
}

export function createKruskalScenario(size: number): KruskalScenario {
  const graph = generateDijkstraGraph(size);
  const edges = [...graph.edges]
    .sort((left, right) => {
      if (left.weight !== right.weight) return left.weight - right.weight;
      return left.id.localeCompare(right.id);
    })
    .map((edge, index) => ({ ...edge, weight: edge.weight + index % 2 }));

  return {
    kind: 'kruskal',
    graph: {
      ...graph,
      edges: normalizeEdges(edges),
    },
  };
}

function normalizeEdges(edges: readonly WeightedGraphEdge[]): readonly WeightedGraphEdge[] {
  return edges.map((edge, index) => ({
    ...edge,
    id: `${index}:${edge.id}`,
  }));
}
