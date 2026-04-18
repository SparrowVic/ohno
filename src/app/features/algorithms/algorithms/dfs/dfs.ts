import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../../models/graph';
import { SortStep } from '../../models/sort-step';

export function* dfsGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const depthMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const visited = new Set<string>();
  const discovered = new Set<string>([graph.sourceId]);
  const stack: string[] = [graph.sourceId];
  const visitOrder: string[] = [];

  depthMap.set(graph.sourceId, 0);

  yield createStep({
    graph,
    depthMap,
    previousMap,
    discovered,
    visited,
    stackOrder: stack,
    visitOrder,
    description: `Initialize stack with ${labelOf(nodeMap, graph.sourceId)} and set its depth to 0.`,
    activeCodeLine: 2,
    phase: 'init',
  });

  while (stack.length > 0) {
    const currentNodeId = stack.pop()!;
    const currentDepth = depthMap.get(currentNodeId) ?? 0;

    yield createStep({
      graph,
      depthMap,
      previousMap,
      discovered,
      visited,
      stackOrder: stack,
      visitOrder,
      currentNodeId,
      description: `Pop ${labelOf(nodeMap, currentNodeId)} and dive deeper before backtracking.`,
      activeCodeLine: 6,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, currentNodeId)) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      const neighborLabel = labelOf(nodeMap, neighborId);

      yield createStep({
        graph,
        depthMap,
        previousMap,
        discovered,
        visited,
        stackOrder: stack,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        description: `Inspect ${labelOf(nodeMap, currentNodeId)} → ${neighborLabel}.`,
        activeCodeLine: 7,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: neighborLabel,
          expression: `${currentDepth} + 1`,
          result: `${currentDepth + 1}`,
          decision: discovered.has(neighborId) ? 'already discovered' : 'push neighbor',
        },
      });

      if (discovered.has(neighborId)) {
        yield createStep({
          graph,
          depthMap,
          previousMap,
          discovered,
          visited,
          stackOrder: stack,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: `Skip ${neighborLabel}; DFS has already seen it.`,
          activeCodeLine: 8,
          phase: 'skip-relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `${currentDepth} + 1`,
            result: `${currentDepth + 1}`,
            decision: 'keep existing discovery',
          },
        });
        continue;
      }

      discovered.add(neighborId);
      depthMap.set(neighborId, currentDepth + 1);
      previousMap.set(neighborId, currentNodeId);
      stack.push(neighborId);

      yield createStep({
        graph,
        depthMap,
        previousMap,
        discovered,
        visited,
        stackOrder: stack,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        relaxedEdgeId: edge.id,
        description: `Discover ${neighborLabel} at depth ${currentDepth + 1} and push it onto the stack.`,
        activeCodeLine: 10,
        phase: 'relax',
        computation: {
          candidateLabel: neighborLabel,
          expression: `${currentDepth} + 1`,
          result: `${currentDepth + 1}`,
          decision: 'pushed to stack',
        },
      });
    }

    visited.add(currentNodeId);
    visitOrder.push(currentNodeId);

    yield createStep({
      graph,
      depthMap,
      previousMap,
      discovered,
      visited,
      stackOrder: stack,
      visitOrder,
      currentNodeId,
      description: `Finish ${labelOf(nodeMap, currentNodeId)} and backtrack to the current stack top.`,
      activeCodeLine: 13,
      phase: 'settle-node',
    });
  }

  yield createStep({
    graph,
    depthMap,
    previousMap,
    discovered,
    visited,
    stackOrder: stack,
    visitOrder,
    description: `DFS complete. Every reachable node has been explored depth-first from ${labelOf(nodeMap, graph.sourceId)}.`,
    activeCodeLine: 15,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly depthMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly discovered: ReadonlySet<string>;
  readonly visited: ReadonlySet<string>;
  readonly stackOrder: readonly string[];
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
  const frontierSet = new Set(args.stackOrder);

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.depthMap.get(node.id) ?? null,
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

  const queue: GraphQueueEntry[] = [...args.stackOrder]
    .reverse()
    .map((nodeId) => ({
      nodeId,
      label: labelMap.get(nodeId) ?? nodeId,
      distance: args.depthMap.get(nodeId) ?? null,
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
      metricLabel: 'Depth',
      secondaryLabel: 'Prev',
      frontierLabel: 'Stack',
      frontierHeadLabel: 'Stack top',
      completionLabel: 'Visited',
      frontierStatusLabel: 'stacked',
      completionStatusLabel: 'visited',
      showEdgeWeights: false,
      detailLabel: 'Depth path',
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
      return rightNeighbor.localeCompare(leftNeighbor);
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
      return 'Pop stack top';
    case 'inspect-edge':
      return 'Inspect edge';
    case 'relax':
      return 'Push neighbor';
    case 'skip-relax':
      return 'Skip discovered neighbor';
    case 'settle-node':
      return 'Backtrack';
    case 'graph-complete':
      return 'Traversal complete';
    default:
      return 'Initialize DFS';
  }
}
