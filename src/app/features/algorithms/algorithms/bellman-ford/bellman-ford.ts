import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../../models/graph';
import { SortStep } from '../../models/sort-step';

export function* bellmanFordGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const distanceMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const reached = new Set<string>();
  const visitOrder: string[] = [];
  const maxPasses = Math.max(0, graph.nodes.length - 1);
  let frontier = new Set<string>([graph.sourceId]);
  let currentPass = 0;
  let negativeCycleEdgeId: string | null = null;

  distanceMap.set(graph.sourceId, 0);
  reached.add(graph.sourceId);

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    reached,
    frontier,
    visitOrder,
    currentPass,
    maxPasses,
    description: `Initialize ${labelOf(labelMap, graph.sourceId)} with distance 0 and all other nodes as ∞.`,
    activeCodeLine: 2,
    phase: 'init',
    negativeCycleEdgeId,
  });

  for (let pass = 1; pass <= maxPasses; pass++) {
    currentPass = pass;
    let relaxedInPass = false;
    frontier = new Set<string>();

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      reached,
      frontier,
      visitOrder,
      currentPass,
      maxPasses,
      description: `Start pass ${pass} and scan every edge for a better distance.`,
      activeCodeLine: 5,
      phase: 'pick-node',
      negativeCycleEdgeId,
    });

    for (const edge of graph.edges) {
      const fromDistance = distanceMap.get(edge.from) ?? null;
      const toDistance = distanceMap.get(edge.to) ?? null;
      const candidate = fromDistance === null ? null : fromDistance + edge.weight;

      yield createStep({
        graph,
        distanceMap,
        previousMap,
        reached,
        frontier,
        visitOrder,
        currentPass,
        maxPasses,
        currentNodeId: edge.from,
        activeEdgeId: edge.id,
        description: `Inspect ${labelOf(labelMap, edge.from)} → ${labelOf(labelMap, edge.to)} with weight ${edge.weight}.`,
        activeCodeLine: 7,
        phase: 'inspect-edge',
        negativeCycleEdgeId,
        computation: {
          candidateLabel: labelOf(labelMap, edge.to),
          expression: fromDistance === null ? `∞ + ${edge.weight}` : `${fromDistance} + ${edge.weight}`,
          result: candidate === null ? '∞' : `${candidate}`,
          decision:
            fromDistance === null
              ? 'source still unreachable'
              : toDistance === null
                ? 'better than ∞'
                : `${candidate} < ${toDistance}`,
        },
      });

      if (fromDistance === null || candidate === null) {
        yield createStep({
          graph,
          distanceMap,
          previousMap,
          reached,
          frontier,
          visitOrder,
          currentPass,
          maxPasses,
          currentNodeId: edge.from,
          activeEdgeId: edge.id,
          description: `Skip ${labelOf(labelMap, edge.to)} because ${labelOf(labelMap, edge.from)} is still unreachable.`,
          activeCodeLine: 8,
          phase: 'skip-relax',
          negativeCycleEdgeId,
          computation: {
            candidateLabel: labelOf(labelMap, edge.to),
            expression: `∞ + ${edge.weight}`,
            result: '∞',
            decision: 'keep unreachable state',
          },
        });
        continue;
      }

      if (toDistance === null || candidate < toDistance) {
        distanceMap.set(edge.to, candidate);
        previousMap.set(edge.to, edge.from);
        frontier.add(edge.to);
        reached.add(edge.to);
        relaxedInPass = true;

        yield createStep({
          graph,
          distanceMap,
          previousMap,
          reached,
          frontier,
          visitOrder,
          currentPass,
          maxPasses,
          currentNodeId: edge.from,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: `Relax ${labelOf(labelMap, edge.to)} to distance ${candidate} via ${labelOf(labelMap, edge.from)}.`,
          activeCodeLine: 9,
          phase: 'relax',
          negativeCycleEdgeId,
          computation: {
            candidateLabel: labelOf(labelMap, edge.to),
            expression: `${fromDistance} + ${edge.weight}`,
            result: `${candidate}`,
            decision: toDistance === null ? 'first finite distance' : `better than ${toDistance}`,
          },
        });
      } else {
        yield createStep({
          graph,
          distanceMap,
          previousMap,
          reached,
          frontier,
          visitOrder,
          currentPass,
          maxPasses,
          currentNodeId: edge.from,
          activeEdgeId: edge.id,
          description: `Keep the current best distance for ${labelOf(labelMap, edge.to)}.`,
          activeCodeLine: 8,
          phase: 'skip-relax',
          negativeCycleEdgeId,
          computation: {
            candidateLabel: labelOf(labelMap, edge.to),
            expression: `${fromDistance} + ${edge.weight}`,
            result: `${candidate}`,
            decision: `keep ${toDistance}`,
          },
        });
      }
    }

    visitOrder.push(`Pass ${pass}`);

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      reached,
      frontier,
      visitOrder,
      currentPass,
      maxPasses,
      description: relaxedInPass
        ? `Pass ${pass} finished with updates.`
        : `Pass ${pass} made no updates, so the distances are already stable.`,
      activeCodeLine: 12,
      phase: 'settle-node',
      negativeCycleEdgeId,
    });

    if (!relaxedInPass) {
      break;
    }
  }

  for (const edge of graph.edges) {
    const fromDistance = distanceMap.get(edge.from) ?? null;
    const toDistance = distanceMap.get(edge.to) ?? null;
    if (fromDistance === null) continue;
    const candidate = fromDistance + edge.weight;
    if (toDistance === null || candidate < toDistance) {
      negativeCycleEdgeId = edge.id;

      yield createStep({
        graph,
        distanceMap,
        previousMap,
        reached,
        frontier: new Set([edge.to]),
        visitOrder,
        currentPass,
        maxPasses,
        currentNodeId: edge.from,
        activeEdgeId: edge.id,
        description: `Extra scan still improves ${labelOf(labelMap, edge.to)}, so a negative cycle is reachable.`,
        activeCodeLine: 14,
        phase: 'skip-relax',
        negativeCycleEdgeId,
        computation: {
          candidateLabel: labelOf(labelMap, edge.to),
          expression: `${fromDistance} + ${edge.weight}`,
          result: `${candidate}`,
          decision: `still better than ${toDistance ?? '∞'}`,
        },
      });
      break;
    }
  }

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    reached,
    frontier: negativeCycleEdgeId ? new Set<string>() : frontier,
    visitOrder,
    currentPass,
    maxPasses,
    description: negativeCycleEdgeId
      ? 'Bellman-Ford found a reachable negative cycle.'
      : 'Bellman-Ford complete. Shortest paths remain stable after the final check.',
    activeCodeLine: 16,
    phase: 'graph-complete',
    negativeCycleEdgeId,
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly distanceMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly reached: ReadonlySet<string>;
  readonly frontier: ReadonlySet<string>;
  readonly visitOrder: readonly string[];
  readonly currentPass: number;
  readonly maxPasses: number;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly negativeCycleEdgeId: string | null;
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
      ? labelOf(labelMap, args.previousMap.get(node.id) as string)
      : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.reached.has(node.id),
    isFrontier: args.frontier.has(node.id),
  }));

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.previousMap.get(edge.to) === edge.from,
    tone: edge.id === args.negativeCycleEdgeId ? 'critical' : null,
  }));

  const queue = buildQueue(nodes, args.frontier);
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
      phaseLabel: phaseLabel(args.phase, args.currentPass, args.maxPasses, args.negativeCycleEdgeId !== null),
      metricLabel: 'Distance',
      secondaryLabel: 'Prev',
      frontierLabel: 'Updated this pass',
      frontierHeadLabel: 'Latest update',
      completionLabel: 'Reached',
      frontierStatusLabel: 'updated',
      completionStatusLabel: 'reached',
      showEdgeWeights: true,
      detailLabel: 'Path',
      detailValue: `Pass ${Math.max(args.currentPass, 0)} of ${args.maxPasses}`,
      visitOrderLabel: 'Pass log',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder],
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function buildQueue(nodes: readonly GraphNodeSnapshot[], frontier: ReadonlySet<string>): GraphQueueEntry[] {
  return nodes
    .filter((node) => frontier.has(node.id))
    .sort((left, right) => {
      const leftDistance = left.distance ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distance ?? Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return left.label.localeCompare(right.label);
    })
    .map((node) => ({
      nodeId: node.id,
      label: node.label,
      distance: node.distance,
    }));
}

function labelOf(map: ReadonlyMap<string, string>, nodeId: string): string {
  return map.get(nodeId) ?? nodeId;
}

function phaseLabel(
  phase: SortStep['phase'],
  currentPass: number,
  maxPasses: number,
  hasNegativeCycle: boolean,
): string {
  switch (phase) {
    case 'pick-node':
      return `Start pass ${currentPass}`;
    case 'inspect-edge':
      return `Inspect edge in pass ${currentPass}`;
    case 'relax':
      return 'Relax distance';
    case 'skip-relax':
      return hasNegativeCycle ? 'Negative-cycle evidence' : 'Keep current best';
    case 'settle-node':
      return `Close pass ${currentPass}`;
    case 'graph-complete':
      return hasNegativeCycle ? 'Negative cycle found' : `Stable after ${Math.min(currentPass, maxPasses)} pass(es)`;
    default:
      return 'Initialize Bellman-Ford';
  }
}
