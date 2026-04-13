import { DsuEdgeTrace } from '../models/dsu';
import { SortStep } from '../models/sort-step';
import { KruskalScenario } from '../utils/dsu-scenarios';
import { createDsuStep, DsuBaseNode } from './dsu-step';

export function* kruskalsMstGenerator(scenario: KruskalScenario): Generator<SortStep> {
  const nodes: readonly DsuBaseNode[] = scenario.graph.nodes.map((node) => ({ id: node.id, label: node.label }));
  const parent = new Map<string, string>(nodes.map((node) => [node.id, node.id]));
  const rank = new Map<string, number>(nodes.map((node) => [node.id, 0]));
  const size = new Map<string, number>(nodes.map((node) => [node.id, 1]));
  const sortedEdges = [...scenario.graph.edges].sort((left, right) => {
    if (left.weight !== right.weight) return left.weight - right.weight;
    return left.id.localeCompare(right.id);
  });
  const statuses = new Map<string, DsuEdgeTrace['status']>(sortedEdges.map((edge) => [edge.id, 'pending']));
  let acceptedWeight = 0;
  let acceptedCount = 0;

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    edges: sortedEdges,
    statuses,
    description: 'Sort all edges by weight and initialize each vertex as its own component.',
    activeCodeLine: 2,
    statusLabel: 'Sorted edge scan',
    decision: 'Kruskal will accept the next cheapest edge that does not create a cycle.',
    resultLabel: `MST weight 0`,
    operationsLabel: 'Sorted edges',
  });

  for (const edge of sortedEdges) {
    statuses.set(edge.id, 'active');
    const leftRoot = findRoot(edge.from, parent);
    const rightRoot = findRoot(edge.to, parent);

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      edges: sortedEdges,
      statuses,
      description: `Check edge ${labelOf(nodes, edge.from)}–${labelOf(nodes, edge.to)} with weight ${edge.weight}.`,
      activeCodeLine: 5,
      statusLabel: 'Inspect next edge',
      decision: `${labelOf(nodes, edge.from)} is in ${labelOf(nodes, leftRoot)}, ${labelOf(nodes, edge.to)} is in ${labelOf(nodes, rightRoot)}.`,
      resultLabel: `MST weight ${acceptedWeight}`,
      operationsLabel: `Accepted ${acceptedCount}/${Math.max(0, nodes.length - 1)}`,
      activeIds: [edge.from, edge.to],
      queryIds: [leftRoot, rightRoot],
    });

    if (leftRoot === rightRoot) {
      statuses.set(edge.id, 'rejected');
      yield createStep({
        nodes,
        parent,
        rank,
        size,
        edges: sortedEdges,
        statuses,
        description: `Reject ${labelOf(nodes, edge.from)}–${labelOf(nodes, edge.to)} because it would close a cycle.`,
        activeCodeLine: 6,
        statusLabel: 'Reject cycle edge',
        decision: 'Endpoints already share the same DSU root.',
        resultLabel: `MST weight ${acceptedWeight}`,
        operationsLabel: `Accepted ${acceptedCount}/${Math.max(0, nodes.length - 1)}`,
        activeIds: [leftRoot],
      });
      continue;
    }

    let attachRoot = leftRoot;
    let keepRoot = rightRoot;
    const leftRank = rank.get(leftRoot) ?? 0;
    const rightRank = rank.get(rightRoot) ?? 0;
    if (leftRank > rightRank || (leftRank === rightRank && leftRoot.localeCompare(rightRoot) < 0)) {
      attachRoot = rightRoot;
      keepRoot = leftRoot;
    }

    parent.set(attachRoot, keepRoot);
    size.set(keepRoot, (size.get(keepRoot) ?? 1) + (size.get(attachRoot) ?? 1));
    if (leftRank === rightRank) {
      rank.set(keepRoot, (rank.get(keepRoot) ?? 0) + 1);
    }
    statuses.set(edge.id, 'accepted');
    acceptedWeight += edge.weight;
    acceptedCount += 1;

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      edges: sortedEdges,
      statuses,
      description: `Accept ${labelOf(nodes, edge.from)}–${labelOf(nodes, edge.to)} and merge the two components.`,
      activeCodeLine: 7,
      statusLabel: 'Accept edge into MST',
      decision: `Tree weight grows to ${acceptedWeight}.`,
      resultLabel: `MST weight ${acceptedWeight}`,
      operationsLabel: `Accepted ${acceptedCount}/${Math.max(0, nodes.length - 1)}`,
      activeIds: [keepRoot],
      mergedIds: [attachRoot],
    });
  }

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    edges: sortedEdges,
    statuses,
    description: `Kruskal complete. The minimum spanning tree uses ${acceptedCount} edge(s) with total weight ${acceptedWeight}.`,
    activeCodeLine: 9,
    phase: 'graph-complete',
    statusLabel: 'MST complete',
    decision: 'Every remaining pending edge is more expensive or cycle-forming.',
    resultLabel: `MST weight ${acceptedWeight}`,
    operationsLabel: `Accepted ${acceptedCount}/${Math.max(0, nodes.length - 1)}`,
  });
}

function createStep(args: {
  readonly nodes: readonly DsuBaseNode[];
  readonly parent: ReadonlyMap<string, string>;
  readonly rank: ReadonlyMap<string, number>;
  readonly size: ReadonlyMap<string, number>;
  readonly edges: readonly { id: string; from: string; to: string; weight: number }[];
  readonly statuses: ReadonlyMap<string, DsuEdgeTrace['status']>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly statusLabel: string;
  readonly decision: string;
  readonly resultLabel: string;
  readonly operationsLabel: string;
  readonly activeIds?: readonly string[];
  readonly mergedIds?: readonly string[];
  readonly queryIds?: readonly string[];
}): SortStep {
  return createDsuStep({
    mode: 'kruskal',
    nodes: args.nodes,
    parent: args.parent,
    rank: args.rank,
    size: args.size,
    edges: args.edges.map((edge) => ({
      id: edge.id,
      fromId: edge.from,
      fromLabel: labelOf(args.nodes, edge.from),
      toId: edge.to,
      toLabel: labelOf(args.nodes, edge.to),
      weight: edge.weight,
      status: args.statuses.get(edge.id) ?? 'pending',
    })),
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    statusLabel: args.statusLabel,
    decision: args.decision,
    resultLabel: args.resultLabel,
    operationsLabel: args.operationsLabel,
    activeIds: args.activeIds,
    mergedIds: args.mergedIds,
    queryIds: args.queryIds,
  });
}

function findRoot(nodeId: string, parent: ReadonlyMap<string, string>): string {
  let current = nodeId;
  let hops = 0;
  while ((parent.get(current) ?? current) !== current && hops < parent.size + 1) {
    current = parent.get(current) ?? current;
    hops++;
  }
  return current;
}

function labelOf(nodes: readonly DsuBaseNode[], nodeId: string): string {
  return nodes.find((node) => node.id === nodeId)?.label ?? nodeId;
}
