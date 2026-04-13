import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphStepState,
  GraphTraceRow,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

export function* dijkstraGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const distanceMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const settled = new Set<string>();
  const frontier = new Set<string>();
  const visitOrder: string[] = [];

  distanceMap.set(graph.sourceId, 0);
  frontier.add(graph.sourceId);

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    settled,
    frontier,
    visitOrder,
    description: `Initialize ${labelOf(nodeMap, graph.sourceId)} with distance 0 and mark every other node as ∞.`,
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    const currentNodeId = nextNode(graph, distanceMap, settled);
    if (!currentNodeId) break;

    frontier.delete(currentNodeId);

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      settled,
      frontier,
      visitOrder,
      currentNodeId,
      description: `Pick ${labelOf(nodeMap, currentNodeId)} as the next closest unsettled node.`,
      activeCodeLine: 5,
      phase: 'pick-node',
    });

    const currentDistance = distanceMap.get(currentNodeId) ?? null;
    if (currentDistance === null) {
      break;
    }

    for (const edge of outgoingEdges(graph, currentNodeId)) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      if (settled.has(neighborId)) {
        continue;
      }

      const neighborLabel = labelOf(nodeMap, neighborId);
      const candidateDistance = currentDistance + edge.weight;
      const previousDistance = distanceMap.get(neighborId) ?? null;

      yield createStep({
        graph,
        distanceMap,
        previousMap,
        settled,
        frontier,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        description: `Inspect edge ${labelOf(nodeMap, currentNodeId)} → ${neighborLabel} with weight ${edge.weight}.`,
        activeCodeLine: 7,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: neighborLabel,
          expression: `${currentDistance} + ${edge.weight}`,
          result: `${candidateDistance}`,
          decision:
            previousDistance === null
              ? `${candidateDistance} < ∞`
              : `${candidateDistance} < ${previousDistance}`,
        },
      });

      if (previousDistance === null || candidateDistance < previousDistance) {
        distanceMap.set(neighborId, candidateDistance);
        previousMap.set(neighborId, currentNodeId);
        frontier.add(neighborId);

        yield createStep({
          graph,
          distanceMap,
          previousMap,
          settled,
          frontier,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: `Relax ${neighborLabel}: update distance to ${candidateDistance} via ${labelOf(nodeMap, currentNodeId)}.`,
          activeCodeLine: 9,
          phase: 'relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `${currentDistance} + ${edge.weight}`,
            result: `${candidateDistance}`,
            decision:
              previousDistance === null
                ? `better than ∞`
                : `better than ${previousDistance}`,
          },
        });
      } else {
        yield createStep({
          graph,
          distanceMap,
          previousMap,
          settled,
          frontier,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: `Skip ${neighborLabel}: current best ${previousDistance} stays better than ${candidateDistance}.`,
          activeCodeLine: 8,
          phase: 'skip-relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `${currentDistance} + ${edge.weight}`,
            result: `${candidateDistance}`,
            decision: `keep ${previousDistance}`,
          },
        });
      }
    }

    settled.add(currentNodeId);
    visitOrder.push(currentNodeId);

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      settled,
      frontier,
      visitOrder,
      currentNodeId,
      description: `Settle ${labelOf(nodeMap, currentNodeId)}. Its shortest distance is now final.`,
      activeCodeLine: 12,
      phase: 'settle-node',
    });
  }

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    settled,
    frontier,
    visitOrder,
    description: `Dijkstra complete. Shortest paths from ${labelOf(nodeMap, graph.sourceId)} are finalized.`,
    activeCodeLine: 14,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly distanceMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly settled: ReadonlySet<string>;
  readonly frontier: ReadonlySet<string>;
  readonly visitOrder: readonly string[];
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

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.distanceMap.get(node.id) ?? null,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.previousMap.get(node.id)
      ? (labelMap.get(args.previousMap.get(node.id) as string) ?? null)
      : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.settled.has(node.id),
    isFrontier: args.frontier.has(node.id),
  }));

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => {
    const fromPrev = args.previousMap.get(edge.from);
    const toPrev = args.previousMap.get(edge.to);
    return {
      ...edge,
      isActive: edge.id === activeEdgeId,
      isRelaxed: edge.id === relaxedEdgeId,
      isTree: fromPrev === edge.to || toPrev === edge.from,
    };
  });

  const queue = buildQueue(nodes);
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
      metricLabel: 'Distance',
      secondaryLabel: 'Prev',
      frontierLabel: 'Priority queue',
      frontierHeadLabel: 'Queue head',
      completionLabel: 'Settled',
      frontierStatusLabel: 'queued',
      completionStatusLabel: 'settled',
      showEdgeWeights: true,
      detailLabel: 'Path',
      detailValue: currentNodeId ? describePath(currentNodeId, args.previousMap, labelMap) : 'No active node',
      visitOrderLabel: 'Settled order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder].map((nodeId) => labelMap.get(nodeId) ?? nodeId),
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return 'Pick next node';
    case 'inspect-edge':
      return 'Inspect edge';
    case 'relax':
      return 'Relax edge';
    case 'skip-relax':
      return 'Keep current best';
    case 'settle-node':
      return 'Finalize node';
    case 'graph-complete':
      return 'Shortest paths ready';
    default:
      return 'Initialize graph';
  }
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

function nextNode(
  graph: WeightedGraphData,
  distanceMap: ReadonlyMap<string, number | null>,
  settled: ReadonlySet<string>,
): string | null {
  return graph.nodes
    .filter((node) => !settled.has(node.id) && distanceMap.get(node.id) !== null)
    .sort((left, right) => {
      const leftDistance = distanceMap.get(left.id) ?? Number.POSITIVE_INFINITY;
      const rightDistance = distanceMap.get(right.id) ?? Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      return left.label.localeCompare(right.label);
    })[0]?.id ?? null;
}

function buildQueue(nodes: readonly GraphNodeSnapshot[]): GraphQueueEntry[] {
  return nodes
    .filter((node) => node.isFrontier || node.isCurrent)
    .sort((left, right) => {
      const leftDistance = left.distance ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distance ?? Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      return left.label.localeCompare(right.label);
    })
    .map((node) => ({
      nodeId: node.id,
      label: node.label,
      distance: node.distance,
    }));
}

function labelOf(nodes: ReadonlyMap<string, { readonly label: string }>, nodeId: string): string {
  return nodes.get(nodeId)?.label ?? nodeId;
}

function describePath(
  nodeId: string,
  previousMap: ReadonlyMap<string, string | null>,
  labelMap: ReadonlyMap<string, string>,
): string {
  const path: string[] = [];
  let currentId: string | null = nodeId;
  let hops = 0;
  while (currentId && hops < labelMap.size + 1) {
    path.unshift(labelMap.get(currentId) ?? currentId);
    currentId = previousMap.get(currentId) ?? null;
    hops++;
  }
  return path.join(' → ');
}
