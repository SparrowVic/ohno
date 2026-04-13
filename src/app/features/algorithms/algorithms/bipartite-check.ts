import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

type Partition = 0 | 1;

export function* bipartiteCheckGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const colorMap = new Map<string, Partition | null>(graph.nodes.map((node) => [node.id, null]));
  const levelMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const closed = new Set<string>();
  const visitOrder: string[] = [];
  let queue: string[] = [];
  let conflictEdgeId: string | null = null;
  let conflictNodes = new Set<string>();

  yield createStep({
    graph,
    colorMap,
    levelMap,
    previousMap,
    closed,
    frontierOrder: queue,
    visitOrder,
    description: 'Initialize every node without a side and try to two-color each connected region.',
    activeCodeLine: 2,
    phase: 'init',
    conflictEdgeId,
    conflictNodes,
  });

  for (const node of graph.nodes) {
    if (colorMap.get(node.id) !== null) {
      continue;
    }

    colorMap.set(node.id, 0);
    levelMap.set(node.id, 0);
    queue = [node.id];

    yield createStep({
      graph,
      colorMap,
      levelMap,
      previousMap,
      closed,
      frontierOrder: queue,
      visitOrder,
      currentNodeId: node.id,
      description: `Start a new BFS wave at ${labelOf(labelMap, node.id)} and color it side 0.`,
      activeCodeLine: 5,
      phase: 'pick-node',
      conflictEdgeId,
      conflictNodes,
    });

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      const currentColor = colorMap.get(currentNodeId) ?? 0;
      const nextColor = currentColor === 0 ? 1 : 0;
      const currentLevel = levelMap.get(currentNodeId) ?? 0;

      yield createStep({
        graph,
        colorMap,
        levelMap,
        previousMap,
        closed,
        frontierOrder: queue,
        visitOrder,
        currentNodeId,
        description: `Expand ${labelOf(labelMap, currentNodeId)} and force all neighbors to the opposite side.`,
        activeCodeLine: 7,
        phase: 'pick-node',
        conflictEdgeId,
        conflictNodes,
      });

      for (const edge of outgoingEdges(graph, currentNodeId)) {
        const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
        const neighborColor = colorMap.get(neighborId) ?? null;

        yield createStep({
          graph,
          colorMap,
          levelMap,
          previousMap,
          closed,
          frontierOrder: queue,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: `Inspect ${labelOf(labelMap, currentNodeId)} ↔ ${labelOf(labelMap, neighborId)}.`,
          activeCodeLine: 8,
          phase: 'inspect-edge',
          conflictEdgeId,
          conflictNodes,
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `${currentColor} xor 1`,
            result: `${nextColor}`,
            decision:
              neighborColor === null
                ? 'assign opposite side'
                : neighborColor === currentColor
                  ? 'same-side conflict'
                  : 'edge crosses partitions',
          },
        });

        if (neighborColor === null) {
          colorMap.set(neighborId, nextColor);
          levelMap.set(neighborId, currentLevel + 1);
          previousMap.set(neighborId, currentNodeId);
          queue.push(neighborId);

          yield createStep({
            graph,
            colorMap,
            levelMap,
            previousMap,
            closed,
            frontierOrder: queue,
            visitOrder,
            currentNodeId,
            activeEdgeId: edge.id,
            relaxedEdgeId: edge.id,
            description: `Color ${labelOf(labelMap, neighborId)} side ${nextColor} and enqueue it.`,
            activeCodeLine: 10,
            phase: 'relax',
            conflictEdgeId,
            conflictNodes,
            computation: {
              candidateLabel: labelOf(labelMap, neighborId),
              expression: `${currentColor} xor 1`,
              result: `${nextColor}`,
              decision: 'consistent opposite side',
            },
          });
          continue;
        }

        if (neighborColor === currentColor) {
          conflictEdgeId = edge.id;
          conflictNodes = new Set([currentNodeId, neighborId]);

          yield createStep({
            graph,
            colorMap,
            levelMap,
            previousMap,
            closed,
            frontierOrder: queue,
            visitOrder,
            currentNodeId,
            activeEdgeId: edge.id,
            description: `Conflict: ${labelOf(labelMap, currentNodeId)} and ${labelOf(labelMap, neighborId)} share side ${currentColor}.`,
            activeCodeLine: 12,
            phase: 'skip-relax',
            conflictEdgeId,
            conflictNodes,
            computation: {
              candidateLabel: labelOf(labelMap, neighborId),
              expression: `${currentColor} = ${neighborColor}`,
              result: 'invalid',
              decision: 'odd cycle / same-side edge found',
            },
          });

          yield createStep({
            graph,
            colorMap,
            levelMap,
            previousMap,
            closed,
            frontierOrder: queue,
            visitOrder,
            description: `Bipartite check failed on edge ${labelOf(labelMap, currentNodeId)} ↔ ${labelOf(labelMap, neighborId)}.`,
            activeCodeLine: 15,
            phase: 'graph-complete',
            conflictEdgeId,
            conflictNodes,
          });
          return;
        }

        yield createStep({
          graph,
          colorMap,
          levelMap,
          previousMap,
          closed,
          frontierOrder: queue,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: `Edge ${labelOf(labelMap, currentNodeId)} ↔ ${labelOf(labelMap, neighborId)} correctly crosses the two partitions.`,
          activeCodeLine: 13,
          phase: 'skip-relax',
          conflictEdgeId,
          conflictNodes,
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `${currentColor} → ${neighborColor}`,
            result: 'valid',
            decision: 'keep current coloring',
          },
        });
      }

      closed.add(currentNodeId);
      visitOrder.push(currentNodeId);

      yield createStep({
        graph,
        colorMap,
        levelMap,
        previousMap,
        closed,
        frontierOrder: queue,
        visitOrder,
        currentNodeId,
        description: `Close ${labelOf(labelMap, currentNodeId)} after checking all incident edges.`,
        activeCodeLine: 14,
        phase: 'settle-node',
        conflictEdgeId,
        conflictNodes,
      });
    }
  }

  yield createStep({
    graph,
    colorMap,
    levelMap,
    previousMap,
    closed,
    frontierOrder: [],
    visitOrder,
    description: 'Bipartite check complete. Every edge connects opposite sides.',
    activeCodeLine: 15,
    phase: 'graph-complete',
    conflictEdgeId,
    conflictNodes,
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly colorMap: ReadonlyMap<string, Partition | null>;
  readonly levelMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly closed: ReadonlySet<string>;
  readonly frontierOrder: readonly string[];
  readonly visitOrder: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly conflictEdgeId: string | null;
  readonly conflictNodes: ReadonlySet<string>;
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

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const color = args.colorMap.get(node.id) ?? null;
    return {
      ...node,
      distance: color,
      previousId: args.previousMap.get(node.id) ?? null,
      secondaryText: color === null ? null : color === 0 ? 'BLUE' : 'AMBER',
      isSource: node.id === args.graph.sourceId,
      isCurrent: node.id === currentNodeId,
      isSettled: args.closed.has(node.id),
      isFrontier: frontierSet.has(node.id),
      tone: args.conflictNodes.has(node.id) ? 'critical' : color === 0 ? 'left' : color === 1 ? 'right' : null,
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.previousMap.get(edge.to) === edge.from || args.previousMap.get(edge.from) === edge.to,
    tone: edge.id === args.conflictEdgeId ? 'critical' : null,
  }));

  const queue: GraphQueueEntry[] = args.frontierOrder.map((nodeId) => ({
    nodeId,
    label: labelOf(labelMap, nodeId),
    distance: args.colorMap.get(nodeId) ?? null,
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
      metricLabel: 'Side',
      secondaryLabel: 'Color',
      frontierLabel: 'Color queue',
      frontierHeadLabel: 'Queue head',
      completionLabel: 'Colored',
      frontierStatusLabel: 'queued',
      completionStatusLabel: 'colored',
      showEdgeWeights: false,
      detailLabel: 'Partition check',
      detailValue: describePartitions(args.colorMap, labelMap, args.conflictEdgeId ? args.conflictNodes : null),
      visitOrderLabel: 'Color order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: args.visitOrder.map((nodeId) => labelOf(labelMap, nodeId)),
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function describePartitions(
  colorMap: ReadonlyMap<string, Partition | null>,
  labelMap: ReadonlyMap<string, string>,
  conflictNodes: ReadonlySet<string> | null,
): string {
  if (conflictNodes && conflictNodes.size > 0) {
    return `Conflict: ${[...conflictNodes].map((nodeId) => labelOf(labelMap, nodeId)).join(' ↔ ')}`;
  }

  const left: string[] = [];
  const right: string[] = [];
  for (const [nodeId, color] of colorMap.entries()) {
    if (color === 0) left.push(labelOf(labelMap, nodeId));
    if (color === 1) right.push(labelOf(labelMap, nodeId));
  }
  return `Left: ${left.sort().join(', ') || '—'} · Right: ${right.sort().join(', ') || '—'}`;
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
      return 'Color next node';
    case 'inspect-edge':
      return 'Inspect partition edge';
    case 'relax':
      return 'Assign opposite side';
    case 'skip-relax':
      return 'Validate or reject coloring';
    case 'settle-node':
      return 'Close colored node';
    case 'graph-complete':
      return 'Bipartite verdict ready';
    default:
      return 'Initialize partition scan';
  }
}
