import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphStepState,
  GraphTraceRow,
  WeightedGraphData,
  WeightedGraphEdge,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

interface EulerAdjacencyEntry {
  readonly edge: WeightedGraphEdge;
  readonly neighborId: string;
}

export function* eulerPathCircuitGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelById = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const adjacency = buildAdjacency(graph);
  const degreeByNode = new Map<string, number>(graph.nodes.map((node) => [node.id, adjacency.get(node.id)?.length ?? 0]));
  const oddNodeIds = graph.nodes.filter((node) => ((degreeByNode.get(node.id) ?? 0) & 1) === 1).map((node) => node.id);
  const startId = oddNodeIds[0] ?? graph.sourceId;
  const endId = oddNodeIds[1] ?? startId;
  const trailKind = oddNodeIds.length === 0 ? 'Euler circuit' : 'Euler path';
  const usedEdgeIds = new Set<string>();
  const stack: string[] = [startId];
  const trail: string[] = [];

  yield createStep({
    graph,
    startId,
    endId,
    trailKind,
    degreeByNode,
    adjacency,
    usedEdgeIds,
    stack,
    trail,
    description:
      oddNodeIds.length === 0
        ? `All node degrees are even, so start Hierholzer from ${labelOf(labelById, startId)} and expect a circuit.`
        : `Only ${labelOf(labelById, startId)} and ${labelOf(labelById, endId)} have odd degree, so the walk must start and end there.`,
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: oddNodeIds.length === 0 ? 'Degree check' : 'Odd endpoints',
      expression:
        oddNodeIds.length === 0
          ? 'every degree is even'
          : `${labelOf(labelById, startId)} / ${labelOf(labelById, endId)} are odd`,
      result: trailKind,
      decision: 'Hierholzer will grow a live stack and backtrack to lock the final trail.',
    },
  });

  while (stack.length > 0) {
    const currentNodeId = stack[stack.length - 1]!;
    const available = availableEdges(currentNodeId, adjacency, usedEdgeIds, labelById);

    yield createStep({
      graph,
      startId,
      endId,
      trailKind,
      degreeByNode,
      adjacency,
      usedEdgeIds,
      stack,
      trail,
      currentNodeId,
      description: `Look at the stack top ${labelOf(labelById, currentNodeId)} and decide whether the trail can still extend from it.`,
      activeCodeLine: 4,
      phase: 'pick-node',
      computation: {
        candidateLabel: labelOf(labelById, currentNodeId),
        expression: `unused incident edges = ${available.length}`,
        result: available.length > 0 ? labelOf(labelById, available[0]!.neighborId) : 'backtrack',
        decision: available.length > 0 ? 'extend trail' : 'seal this node into the final route',
      },
    });

    if (available.length > 0) {
      const next = available[0]!;

      yield createStep({
        graph,
        startId,
        endId,
        trailKind,
        degreeByNode,
        adjacency,
        usedEdgeIds,
        stack,
        trail,
        currentNodeId,
        activeEdgeId: next.edge.id,
        description: `Choose the next unused edge ${labelOf(labelById, currentNodeId)} → ${labelOf(labelById, next.neighborId)} from the current stack top.`,
        activeCodeLine: 5,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelById, currentNodeId),
          expression: `${labelOf(labelById, currentNodeId)} → ${labelOf(labelById, next.neighborId)}`,
          result: 'unused',
          decision: 'Traverse it now and remove it from future choices.',
        },
      });

      usedEdgeIds.add(next.edge.id);
      stack.push(next.neighborId);

      yield createStep({
        graph,
        startId,
        endId,
        trailKind,
        degreeByNode,
        adjacency,
        usedEdgeIds,
        stack,
        trail,
        currentNodeId: next.neighborId,
        activeEdgeId: next.edge.id,
        relaxedEdgeId: next.edge.id,
        description: `Traverse ${labelOf(labelById, currentNodeId)} → ${labelOf(labelById, next.neighborId)} and push ${labelOf(labelById, next.neighborId)} onto the live stack.`,
        activeCodeLine: 6,
        phase: 'relax',
        computation: {
          candidateLabel: labelOf(labelById, next.neighborId),
          expression: `stack depth ${stack.length - 1} + 1`,
          result: String(stack.length),
          decision: 'The live walk keeps growing until the top node runs out of unused edges.',
        },
      });

      continue;
    }

    const sealedNodeId = stack.pop()!;
    trail.push(sealedNodeId);

    yield createStep({
      graph,
      startId,
      endId,
      trailKind,
      degreeByNode,
      adjacency,
      usedEdgeIds,
      stack,
      trail,
      currentNodeId: sealedNodeId,
      description: `${labelOf(labelById, sealedNodeId)} has no unused incident edge left, so pop it into the final ${trailKind.toLowerCase()}.`,
      activeCodeLine: 8,
      phase: 'settle-node',
      computation: {
        candidateLabel: labelOf(labelById, sealedNodeId),
        expression: 'unused incident edges = 0',
        result: describeTrail(trail, labelById),
        decision: 'Backtracking fixes this node permanently in the finished route suffix.',
      },
    });
  }

  const finalTrail = [...trail].reverse();
  yield createStep({
    graph,
    startId,
    endId,
    trailKind,
    degreeByNode,
    adjacency,
    usedEdgeIds,
    stack,
    trail,
    description: `${trailKind} complete. The route ${describeTrail(finalTrail, labelById)} uses every edge exactly once.`,
    activeCodeLine: 9,
    phase: 'graph-complete',
    computation: {
      candidateLabel: trailKind,
      expression: `${graph.edges.length} edge(s) used exactly once`,
      result: describeTrail(finalTrail, labelById),
      decision: 'Hierholzer finishes once both the live stack and the unused-edge set are empty.',
    },
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly startId: string;
  readonly endId: string;
  readonly trailKind: string;
  readonly degreeByNode: ReadonlyMap<string, number>;
  readonly adjacency: ReadonlyMap<string, readonly EulerAdjacencyEntry[]>;
  readonly usedEdgeIds: ReadonlySet<string>;
  readonly stack: readonly string[];
  readonly trail: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly relaxedEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const labelById = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const currentNodeId = args.currentNodeId ?? null;
  const activeEdgeId = args.activeEdgeId ?? null;
  const relaxedEdgeId = args.relaxedEdgeId ?? null;
  const stackSet = new Set(args.stack);
  const sealedSet = new Set(args.trail);
  const remainingByNode = buildRemainingMap(args.graph, args.usedEdgeIds);
  const usedCountByNode = new Map<string, number>();

  for (const node of args.graph.nodes) {
    const total = args.degreeByNode.get(node.id) ?? 0;
    const remaining = remainingByNode.get(node.id) ?? 0;
    usedCountByNode.set(node.id, total - remaining);
  }

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const remaining = remainingByNode.get(node.id) ?? 0;
    const total = args.degreeByNode.get(node.id) ?? 0;
    const nextNeighbor = availableEdges(node.id, args.adjacency, args.usedEdgeIds, labelById)[0]?.neighborId ?? null;

    return {
      ...node,
      distance: remaining,
      previousId: null,
      secondaryText: node.id === args.startId
        ? args.startId === args.endId
          ? 'start / finish'
          : 'start'
        : node.id === args.endId
          ? 'finish'
          : node.id === currentNodeId && nextNeighbor
            ? `next ${labelOf(labelById, nextNeighbor)}`
            : remaining === 0 && sealedSet.has(node.id)
              ? 'sealed'
              : `${usedCountByNode.get(node.id) ?? 0}/${total} used`,
      isSource: node.id === args.startId,
      isCurrent: node.id === currentNodeId,
      isSettled: sealedSet.has(node.id),
      isFrontier: stackSet.has(node.id) && node.id !== currentNodeId,
      tone:
        node.id === args.startId && args.startId !== args.endId
          ? 'left'
          : node.id === args.endId && args.startId !== args.endId
            ? 'right'
            : null,
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.usedEdgeIds.has(edge.id),
  }));

  const queue: GraphQueueEntry[] = args.stack.map((nodeId) => ({
    nodeId,
    label: labelOf(labelById, nodeId),
    distance: remainingByNode.get(nodeId) ?? 0,
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

  const displayTrail = [...args.trail].reverse();

  const graphState: GraphStepState = {
    nodes,
    edges,
    sourceId: args.startId,
    phaseLabel: phaseLabel(args.phase),
    metricLabel: 'Unused',
    secondaryLabel: 'State',
    frontierLabel: 'Stack',
    frontierHeadLabel: 'Top',
    completionLabel: 'Sealed',
    frontierStatusLabel: 'stacked',
    completionStatusLabel: 'sealed',
    showEdgeWeights: false,
    detailLabel: args.trailKind,
    detailValue:
      displayTrail.length > 0
        ? describeTrail(displayTrail, labelById)
        : 'Trail order appears during backtracking.',
    visitOrderLabel: 'Final trail',
    currentNodeId,
    activeEdgeId,
    queue,
    visitOrder: displayTrail.map((nodeId) => labelOf(labelById, nodeId)),
    traceRows,
    computation: args.computation ?? null,
  };

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    graph: graphState,
  };
}

function buildAdjacency(graph: WeightedGraphData): Map<string, readonly EulerAdjacencyEntry[]> {
  const map = new Map<string, EulerAdjacencyEntry[]>();
  for (const node of graph.nodes) {
    map.set(node.id, []);
  }
  for (const edge of graph.edges) {
    map.get(edge.from)?.push({ edge, neighborId: edge.to });
    map.get(edge.to)?.push({ edge, neighborId: edge.from });
  }
  for (const entries of map.values()) {
    entries.sort((left, right) => right.neighborId.localeCompare(left.neighborId));
  }
  return map;
}

function availableEdges(
  nodeId: string,
  adjacency: ReadonlyMap<string, readonly EulerAdjacencyEntry[]>,
  usedEdgeIds: ReadonlySet<string>,
  labelById: ReadonlyMap<string, string>,
): readonly EulerAdjacencyEntry[] {
  return [...(adjacency.get(nodeId) ?? [])]
    .filter((entry) => !usedEdgeIds.has(entry.edge.id))
    .sort((left, right) => labelOf(labelById, left.neighborId).localeCompare(labelOf(labelById, right.neighborId)));
}

function buildRemainingMap(
  graph: WeightedGraphData,
  usedEdgeIds: ReadonlySet<string>,
): ReadonlyMap<string, number> {
  const remaining = new Map<string, number>(graph.nodes.map((node) => [node.id, 0]));
  for (const edge of graph.edges) {
    if (usedEdgeIds.has(edge.id)) continue;
    remaining.set(edge.from, (remaining.get(edge.from) ?? 0) + 1);
    remaining.set(edge.to, (remaining.get(edge.to) ?? 0) + 1);
  }
  return remaining;
}

function describeTrail(
  trail: readonly string[],
  labelById: ReadonlyMap<string, string>,
): string {
  return trail.map((nodeId) => labelOf(labelById, nodeId)).join(' → ');
}

function labelOf(labelById: ReadonlyMap<string, string>, nodeId: string): string {
  return labelById.get(nodeId) ?? nodeId;
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'init':
      return 'Prepare degrees';
    case 'pick-node':
      return 'Inspect stack top';
    case 'inspect-edge':
      return 'Choose next edge';
    case 'relax':
      return 'Extend live walk';
    case 'settle-node':
      return 'Backtrack into trail';
    case 'graph-complete':
      return 'Euler trail complete';
    default:
      return 'Euler step';
  }
}
