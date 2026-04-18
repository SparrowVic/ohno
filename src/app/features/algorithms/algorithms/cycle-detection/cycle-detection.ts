import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../../models/graph';
import { SortStep } from '../../models/sort-step';

type ColorState = 'new' | 'stack' | 'done';

export function* cycleDetectionGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const depthMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const colorMap = new Map<string, ColorState>(graph.nodes.map((node) => [node.id, 'new']));
  const closed = new Set<string>();
  const stack: string[] = [];
  const order: string[] = [];
  let cyclePath = 'searching...';
  let foundCycle = false;

  yield createStep({
    graph,
    depthMap,
    previousMap,
    colorMap,
    closed,
    stack,
    order,
    cyclePath,
    description: 'Initialize every node as unvisited and start a DFS over the directed graph.',
    activeCodeLine: 4,
    phase: 'init',
  });

  for (const node of graph.nodes) {
    if ((colorMap.get(node.id) ?? 'new') !== 'new') {
      continue;
    }

    const found = yield* visit(node.id, 0);
    if (found) {
      foundCycle = true;
      break;
    }
  }

  yield createStep({
    graph,
    depthMap,
    previousMap,
    colorMap,
    closed,
    stack,
    order,
    cyclePath,
    description: foundCycle
      ? `Cycle detected: ${cyclePath}.`
      : 'No directed cycle found. The graph is acyclic.',
    activeCodeLine: 9,
    phase: 'graph-complete',
  });

  return;

  function* visit(nodeId: string, depth: number): Generator<SortStep, boolean> {
    colorMap.set(nodeId, 'stack');
    depthMap.set(nodeId, depth);
    stack.push(nodeId);

    yield createStep({
      graph,
      depthMap,
      previousMap,
      colorMap,
      closed,
      stack,
      order,
      cyclePath,
      currentNodeId: nodeId,
      description: `Enter ${labelOf(labelMap, nodeId)} and push it onto the recursion stack.`,
      activeCodeLine: 11,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, nodeId)) {
      const neighborId = edge.to;
      const color = colorMap.get(neighborId) ?? 'new';

      yield createStep({
        graph,
        depthMap,
        previousMap,
        colorMap,
        closed,
        stack,
        order,
        cyclePath,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: `Inspect ${labelOf(labelMap, nodeId)} → ${labelOf(labelMap, neighborId)}.`,
        activeCodeLine: 12,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: color,
          result: color,
          decision:
            color === 'new'
              ? 'visit neighbor'
              : color === 'stack'
                ? 'back edge found'
                : 'already closed',
        },
      });

      if (color === 'new') {
        previousMap.set(neighborId, nodeId);
        yield createStep({
          graph,
          depthMap,
          previousMap,
          colorMap,
          closed,
          stack,
          order,
          cyclePath,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: `Go deeper into ${labelOf(labelMap, neighborId)} from ${labelOf(labelMap, nodeId)}.`,
          activeCodeLine: 15,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: 'new',
            result: 'stack',
            decision: 'descend recursively',
          },
        });

        const found = yield* visit(neighborId, depth + 1);
        if (found) {
          return true;
        }
        continue;
      }

      if (color === 'stack') {
        cyclePath = describeCycle(nodeId, neighborId, previousMap, labelMap);
        yield createStep({
          graph,
          depthMap,
          previousMap,
          colorMap,
          closed,
          stack,
          order,
          cyclePath,
          currentNodeId: nodeId,
          activeEdgeId: edge.id,
          description: `Back edge to ${labelOf(labelMap, neighborId)} found while it is still on the recursion stack.`,
          activeCodeLine: 13,
          phase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: 'stack',
            result: 'cycle',
            decision: cyclePath,
          },
        });
        return true;
      }

      yield createStep({
        graph,
        depthMap,
        previousMap,
        colorMap,
        closed,
        stack,
        order,
        cyclePath,
        currentNodeId: nodeId,
        activeEdgeId: edge.id,
        description: `${labelOf(labelMap, neighborId)} is already closed, so this edge cannot create a new cycle.`,
        activeCodeLine: 14,
        phase: 'skip-relax',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: 'done',
          result: 'done',
          decision: 'ignore closed node',
        },
      });
    }

    stack.pop();
    colorMap.set(nodeId, 'done');
    closed.add(nodeId);
    order.push(nodeId);

    yield createStep({
      graph,
      depthMap,
      previousMap,
      colorMap,
      closed,
      stack,
      order,
      cyclePath,
      currentNodeId: nodeId,
      description: `Leave ${labelOf(labelMap, nodeId)} and mark it as closed.`,
      activeCodeLine: 18,
      phase: 'settle-node',
    });

    return false;
  }
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly depthMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly colorMap: ReadonlyMap<string, ColorState>;
  readonly closed: ReadonlySet<string>;
  readonly stack: readonly string[];
  readonly order: readonly string[];
  readonly cyclePath: string;
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

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const state = args.colorMap.get(node.id) ?? 'new';
    return {
      ...node,
      distance: args.depthMap.get(node.id) ?? null,
      previousId: args.previousMap.get(node.id) ?? null,
      secondaryText: state.toUpperCase(),
      isSource: node.id === args.graph.sourceId,
      isCurrent: node.id === currentNodeId,
      isSettled: args.closed.has(node.id),
      isFrontier: frontierSet.has(node.id),
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.previousMap.get(edge.to) === edge.from,
  }));

  const queue: GraphQueueEntry[] = [...args.stack]
    .reverse()
    .map((nodeId) => ({
      nodeId,
      label: labelOf(labelMap, nodeId),
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
      secondaryLabel: 'State',
      frontierLabel: 'Recursion stack',
      frontierHeadLabel: 'Stack top',
      completionLabel: 'Closed',
      frontierStatusLabel: 'stacked',
      completionStatusLabel: 'closed',
      showEdgeWeights: false,
      detailLabel: 'Cycle',
      detailValue: args.cyclePath,
      visitOrderLabel: 'Closed order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: args.order.map((nodeId) => labelOf(labelMap, nodeId)),
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function outgoingEdges(graph: WeightedGraphData, nodeId: string) {
  return graph.edges
    .filter((edge) => edge.from === nodeId)
    .sort((left, right) => left.to.localeCompare(right.to));
}

function labelOf(map: ReadonlyMap<string, string>, nodeId: string): string {
  return map.get(nodeId) ?? nodeId;
}

function describeCycle(
  currentId: string,
  targetId: string,
  previousMap: ReadonlyMap<string, string | null>,
  labelMap: ReadonlyMap<string, string>,
): string {
  const path: string[] = [labelOf(labelMap, targetId)];
  let nodeId: string | null = currentId;
  let hops = 0;
  while (nodeId && nodeId !== targetId && hops < labelMap.size + 1) {
    path.unshift(labelOf(labelMap, nodeId));
    nodeId = previousMap.get(nodeId) ?? null;
    hops++;
  }
  path.unshift(labelOf(labelMap, targetId));
  return path.join(' → ');
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return 'Enter recursion';
    case 'inspect-edge':
      return 'Inspect directed edge';
    case 'relax':
      return 'Descend deeper';
    case 'skip-relax':
      return 'Evaluate cycle evidence';
    case 'settle-node':
      return 'Leave recursion';
    case 'graph-complete':
      return 'Cycle analysis ready';
    default:
      return 'Initialize DFS states';
  }
}
