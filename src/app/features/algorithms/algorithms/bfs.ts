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

export function* bfsGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const levelMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const visited = new Set<string>();
  const discovered = new Set<string>([graph.sourceId]);
  const queue: string[] = [graph.sourceId];
  const visitOrder: string[] = [];

  levelMap.set(graph.sourceId, 0);

  yield createStep({
    graph,
    levelMap,
    previousMap,
    discovered,
    visited,
    frontierOrder: queue,
    visitOrder,
    description: `Initialize queue with ${labelOf(nodeMap, graph.sourceId)} and set its level to 0.`,
    activeCodeLine: 2,
    phase: 'init',
  });

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    const currentLevel = levelMap.get(currentNodeId) ?? 0;

    yield createStep({
      graph,
      levelMap,
      previousMap,
      discovered,
      visited,
      frontierOrder: queue,
      visitOrder,
      currentNodeId,
      description: `Dequeue ${labelOf(nodeMap, currentNodeId)} and expand its neighbors breadth-first.`,
      activeCodeLine: 6,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, currentNodeId)) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      const neighborLabel = labelOf(nodeMap, neighborId);

      yield createStep({
        graph,
        levelMap,
        previousMap,
        discovered,
        visited,
        frontierOrder: queue,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        description: `Inspect ${labelOf(nodeMap, currentNodeId)} → ${neighborLabel}.`,
        activeCodeLine: 7,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: neighborLabel,
          expression: `${currentLevel} + 1`,
          result: `${currentLevel + 1}`,
          decision: discovered.has(neighborId) ? 'already discovered' : 'enqueue neighbor',
        },
      });

      if (discovered.has(neighborId)) {
        yield createStep({
          graph,
          levelMap,
          previousMap,
          discovered,
          visited,
          frontierOrder: queue,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: `Skip ${neighborLabel}; BFS already discovered it earlier.`,
          activeCodeLine: 8,
          phase: 'skip-relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `${currentLevel} + 1`,
            result: `${currentLevel + 1}`,
            decision: 'keep existing discovery',
          },
        });
        continue;
      }

      discovered.add(neighborId);
      levelMap.set(neighborId, currentLevel + 1);
      previousMap.set(neighborId, currentNodeId);
      queue.push(neighborId);

      yield createStep({
        graph,
        levelMap,
        previousMap,
        discovered,
        visited,
        frontierOrder: queue,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        relaxedEdgeId: edge.id,
        description: `Discover ${neighborLabel} at level ${currentLevel + 1} and enqueue it.`,
        activeCodeLine: 10,
        phase: 'relax',
        computation: {
          candidateLabel: neighborLabel,
          expression: `${currentLevel} + 1`,
          result: `${currentLevel + 1}`,
          decision: 'added to queue',
        },
      });
    }

    visited.add(currentNodeId);
    visitOrder.push(currentNodeId);

    yield createStep({
      graph,
      levelMap,
      previousMap,
      discovered,
      visited,
      frontierOrder: queue,
      visitOrder,
      currentNodeId,
      description: `Mark ${labelOf(nodeMap, currentNodeId)} as visited and continue with the next queue node.`,
      activeCodeLine: 13,
      phase: 'settle-node',
    });
  }

  yield createStep({
    graph,
    levelMap,
    previousMap,
    discovered,
    visited,
    frontierOrder: queue,
    visitOrder,
    description: `BFS complete. Every reachable node has been visited level by level from ${labelOf(nodeMap, graph.sourceId)}.`,
    activeCodeLine: 15,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly levelMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly discovered: ReadonlySet<string>;
  readonly visited: ReadonlySet<string>;
  readonly frontierOrder: readonly string[];
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
  const frontierSet = new Set(args.frontierOrder);

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.levelMap.get(node.id) ?? null,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.previousMap.get(node.id)
      ? (labelMap.get(args.previousMap.get(node.id) as string) ?? null)
      : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.visited.has(node.id),
    isFrontier: frontierSet.has(node.id),
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

  const queue: GraphQueueEntry[] = args.frontierOrder.map((nodeId) => ({
    nodeId,
    label: labelMap.get(nodeId) ?? nodeId,
    distance: args.levelMap.get(nodeId) ?? null,
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
      metricLabel: 'Level',
      secondaryLabel: 'Prev',
      frontierLabel: 'Queue',
      frontierHeadLabel: 'Queue head',
      completionLabel: 'Visited',
      frontierStatusLabel: 'queued',
      completionStatusLabel: 'visited',
      showEdgeWeights: false,
      detailLabel: 'Layer path',
      detailValue: currentNodeId ? describePath(currentNodeId, args.previousMap, labelMap) : 'No active node',
      visitOrderLabel: 'Visit order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder].map((nodeId) => labelMap.get(nodeId) ?? nodeId),
      traceRows,
      computation: args.computation ?? null,
    },
  };
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

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return 'Dequeue node';
    case 'inspect-edge':
      return 'Inspect edge';
    case 'relax':
      return 'Enqueue neighbor';
    case 'skip-relax':
      return 'Skip visited neighbor';
    case 'settle-node':
      return 'Close current node';
    case 'graph-complete':
      return 'Traversal complete';
    default:
      return 'Initialize BFS';
  }
}
