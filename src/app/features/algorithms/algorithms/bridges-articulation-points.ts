import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

export function* bridgesArticulationPointsGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const discMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const lowMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const closed = new Set<string>();
  const stack: string[] = [];
  const order: string[] = [];
  const articulation = new Set<string>();
  const bridges = new Set<string>();
  let time = 0;

  yield createStep({
    graph,
    discMap,
    lowMap,
    previousMap,
    closed,
    stack,
    order,
    articulation,
    bridges,
    description: 'Initialize discovery and low-link values, then run DFS to reveal critical cuts.',
    activeCodeLine: 2,
    phase: 'init',
  });

  for (const node of graph.nodes) {
    if (discMap.get(node.id) !== null) continue;
    yield* visit(node.id, null);
  }

  yield createStep({
    graph,
    discMap,
    lowMap,
    previousMap,
    closed,
    stack,
    order,
    articulation,
    bridges,
    description: `Bridge scan complete. Found ${bridges.size} bridge(s) and ${articulation.size} articulation point(s).`,
    activeCodeLine: 16,
    phase: 'graph-complete',
  });

  function* visit(nodeId: string, parentId: string | null): Generator<SortStep> {
    time += 1;
    discMap.set(nodeId, time);
    lowMap.set(nodeId, time);
    stack.push(nodeId);
    let childCount = 0;

    yield createStep({
      graph,
      discMap,
      lowMap,
      previousMap,
      closed,
      stack,
      order,
      articulation,
      bridges,
      currentNodeId: nodeId,
      description: `Enter ${labelOf(labelMap, nodeId)} with discovery time ${time}.`,
      activeCodeLine: 4,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, nodeId)) {
      const neighborId = edge.from === nodeId ? edge.to : edge.from;
      if (neighborId === parentId) {
        continue;
      }

      yield createStep({
        graph,
        discMap,
        lowMap,
        previousMap,
        closed,
        stack,
        order,
        articulation,
        bridges,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: `Inspect edge ${labelOf(labelMap, nodeId)} ↔ ${labelOf(labelMap, neighborId)}.`,
        activeCodeLine: 7,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: discMap.get(neighborId) === null ? 'unvisited' : `disc=${discMap.get(neighborId)}`,
          result: discMap.get(neighborId) === null ? 'tree edge' : 'back edge',
          decision: discMap.get(neighborId) === null ? 'descend into child' : 'update low-link',
        },
      });

      if (discMap.get(neighborId) === null) {
        childCount += 1;
        previousMap.set(neighborId, nodeId);

        yield createStep({
          graph,
          discMap,
          lowMap,
          previousMap,
          closed,
          stack,
          order,
          articulation,
          bridges,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: `Tree edge found. Descend from ${labelOf(labelMap, nodeId)} to ${labelOf(labelMap, neighborId)}.`,
          activeCodeLine: 10,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: 'tree edge',
            result: 'dfs(child)',
            decision: 'discover child subtree',
          },
        });

        yield* visit(neighborId, nodeId);

        lowMap.set(nodeId, Math.min(lowMap.get(nodeId) ?? Number.POSITIVE_INFINITY, lowMap.get(neighborId) ?? Number.POSITIVE_INFINITY));
        const nodeDisc = discMap.get(nodeId) ?? 0;
        const childLow = lowMap.get(neighborId) ?? 0;
        const isBridge = childLow > nodeDisc;
        const isArticulation = parentId === null ? childCount > 1 : childLow >= nodeDisc;

        if (isBridge) {
          bridges.add(edge.id);
        }
        if (isArticulation) {
          articulation.add(nodeId);
        }

        yield createStep({
          graph,
          discMap,
          lowMap,
          previousMap,
          closed,
          stack,
          order,
          articulation,
          bridges,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          description: isBridge
            ? `${labelOf(labelMap, edge.from)} ↔ ${labelOf(labelMap, edge.to)} is a bridge because low[child] > disc[parent].`
            : isArticulation
              ? `${labelOf(labelMap, nodeId)} is an articulation point because one child cannot reach above it.`
              : `Update low[${labelOf(labelMap, nodeId)}] after returning from ${labelOf(labelMap, neighborId)}.`,
          activeCodeLine: isBridge || isArticulation ? 13 : 12,
          phase: 'settle-node',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `min(${lowMap.get(nodeId)}, ${childLow})`,
            result: `${lowMap.get(nodeId)}`,
            decision: isBridge ? 'bridge found' : isArticulation ? 'articulation found' : 'low-link propagated',
          },
        });
        continue;
      }

      lowMap.set(nodeId, Math.min(lowMap.get(nodeId) ?? Number.POSITIVE_INFINITY, discMap.get(neighborId) ?? Number.POSITIVE_INFINITY));

      yield createStep({
        graph,
        discMap,
        lowMap,
        previousMap,
        closed,
        stack,
        order,
        articulation,
        bridges,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: `Back edge to ${labelOf(labelMap, neighborId)} lowers low[${labelOf(labelMap, nodeId)}] if needed.`,
        activeCodeLine: 8,
        phase: 'skip-relax',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: `min(${lowMap.get(nodeId)}, ${discMap.get(neighborId)})`,
          result: `${lowMap.get(nodeId)}`,
          decision: 'back edge keeps component connected',
        },
      });
    }

    stack.pop();
    closed.add(nodeId);
    order.push(nodeId);

    yield createStep({
      graph,
      discMap,
      lowMap,
      previousMap,
      closed,
      stack,
      order,
      articulation,
      bridges,
      currentNodeId: nodeId,
      description: `Leave ${labelOf(labelMap, nodeId)} with disc=${discMap.get(nodeId)} and low=${lowMap.get(nodeId)}.`,
      activeCodeLine: 15,
      phase: 'settle-node',
    });
  }
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly discMap: ReadonlyMap<string, number | null>;
  readonly lowMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly closed: ReadonlySet<string>;
  readonly stack: readonly string[];
  readonly order: readonly string[];
  readonly articulation: ReadonlySet<string>;
  readonly bridges: ReadonlySet<string>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly relaxedEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const currentNodeId = args.currentNodeId ?? null;
  const activeEdgeId = args.activeEdgeId ?? null;
  const relaxedEdgeId = args.relaxedEdgeId ?? null;
  const labelMap = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const frontierSet = new Set(args.stack);

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.discMap.get(node.id) ?? null,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.lowMap.get(node.id) === null ? null : String(args.lowMap.get(node.id)),
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.closed.has(node.id),
    isFrontier: frontierSet.has(node.id),
    tone: args.articulation.has(node.id) ? 'critical' : null,
  }));

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.previousMap.get(edge.to) === edge.from || args.previousMap.get(edge.from) === edge.to,
    tone: args.bridges.has(edge.id) ? 'bridge' : null,
  }));

  const queue: GraphQueueEntry[] = [...args.stack]
    .reverse()
    .map((nodeId) => ({
      nodeId,
      label: labelOf(labelMap, nodeId),
      distance: args.discMap.get(nodeId) ?? null,
    }));

  const traceRows: GraphTraceRow[] = nodes.map((node) => ({
    nodeId: node.id,
    label: node.label,
    distance: node.distance,
    secondaryText: node.secondaryText,
    isSource: node.isSource,
    isCurrent: node.isCurrent,
    isSettled: node.isSettled,
    isFrontier: node.isFrontier,
  }));

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    graph: {
      nodes,
      edges,
      sourceId: args.graph.sourceId,
      phaseLabel: phaseLabel(args.phase),
      metricLabel: 'Disc',
      secondaryLabel: 'Low',
      frontierLabel: 'DFS stack',
      frontierHeadLabel: 'Stack top',
      completionLabel: 'Closed',
      frontierStatusLabel: 'stacked',
      completionStatusLabel: 'closed',
      showEdgeWeights: false,
      detailLabel: 'Critical links',
      detailValue: describeCritical(args.bridges, args.articulation, labelMap),
      visitOrderLabel: 'Exit order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: args.order.map((nodeId) => labelOf(labelMap, nodeId)),
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function describeCritical(
  bridges: ReadonlySet<string>,
  articulation: ReadonlySet<string>,
  labelMap: ReadonlyMap<string, string>,
): string {
  const articulationLabels = [...articulation].map((nodeId) => labelOf(labelMap, nodeId)).sort();
  const bridgeLabels = [...bridges]
    .map((edgeId) => edgeId.split('__').map((nodeId) => labelOf(labelMap, nodeId)).join('–'))
    .sort();

  return `Bridges: ${bridgeLabels.join(', ') || '—'} · Articulation: ${articulationLabels.join(', ') || '—'}`;
}

function outgoingEdges(graph: WeightedGraphData, nodeId: string) {
  return graph.edges
    .filter((edge) => edge.from === nodeId || edge.to === nodeId)
    .sort((left, right) => {
      const leftNeighbor = left.from === nodeId ? left.to : left.from;
      const rightNeighbor = right.from === nodeId ? right.to : right.from;
      return leftNeighbor.localeCompare(rightNeighbor);
    });
}

function labelOf(map: ReadonlyMap<string, string>, nodeId: string): string {
  return map.get(nodeId) ?? nodeId;
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return 'Enter DFS node';
    case 'inspect-edge':
      return 'Inspect DFS edge';
    case 'relax':
      return 'Descend to child';
    case 'skip-relax':
      return 'Update low-link';
    case 'settle-node':
      return 'Propagate low-link';
    case 'graph-complete':
      return 'Critical cuts ready';
    default:
      return 'Initialize low-link scan';
  }
}
