import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphStepState,
  GraphTraceRow,
  GraphTone,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';

const COLOR_TONES: readonly GraphTone[] = ['component-a', 'component-b', 'component-c', 'component-d'];

export function* chromaticNumberGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelById = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const adjacency = buildAdjacency(graph);
  const order = [...graph.nodes]
    .sort((left, right) => {
      const degreeDiff = (adjacency.get(right.id)?.length ?? 0) - (adjacency.get(left.id)?.length ?? 0);
      if (degreeDiff !== 0) return degreeDiff;
      return left.label.localeCompare(right.label);
    })
    .map((node) => node.id);
  const colorByNode = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const stack: string[] = [];
  const degreeByNode = new Map(graph.nodes.map((node) => [node.id, adjacency.get(node.id)?.length ?? 0]));
  const cliqueLowerBound = maxCliqueSize(graph);
  const startLimit = Math.max(2, cliqueLowerBound - 1);
  let bestK: number | null = null;
  let successfulColors = new Map<string, number | null>(colorByNode);

  yield createStep({
    graph,
    order,
    limit: startLimit,
    bestK,
    cliqueLowerBound,
    colorByNode,
    degreeByNode,
    stack,
    description: `Order nodes by degree, then test whether the graph fits into ${startLimit} color classes before increasing the palette.`,
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: 'Lower bound',
      expression: `ω(G) = ${cliqueLowerBound}`,
      result: `start with ${startLimit}`,
      decision: 'A clique gives the minimum number of colors worth trying first.',
    },
  });

  for (let limit = startLimit; limit <= COLOR_TONES.length; limit += 1) {
    for (const nodeId of colorByNode.keys()) {
      colorByNode.set(nodeId, null);
    }
    stack.length = 0;

    yield createStep({
      graph,
      order,
      limit,
      bestK,
      cliqueLowerBound,
      colorByNode,
      degreeByNode,
      stack,
      description: `Try to color the graph with only ${limit} color${limit === 1 ? '' : 's'}.`,
      activeCodeLine: 3,
      phase: 'pick-node',
      computation: {
        candidateLabel: `χ ≤ ${limit}`,
        expression: `${order.length} node(s)`,
        result: `${limit} color palette`,
        decision: 'Backtracking will attempt colors in node order and undo assignments on conflicts.',
      },
    });

    const solved = yield* search(0, limit);
    if (solved) {
      bestK = limit;
      successfulColors = new Map(colorByNode);
      break;
    }

    yield createStep({
      graph,
      order,
      limit,
      bestK,
      cliqueLowerBound,
      colorByNode,
      degreeByNode,
      stack,
      description: `${limit} colors are not enough for this graph, so increase the palette and restart the search.`,
      activeCodeLine: 8,
      phase: 'graph-complete',
      computation: {
        candidateLabel: `χ ≤ ${limit}`,
        expression: 'backtracking exhausted',
        result: 'fail',
        decision: 'At least one more color is necessary.',
      },
    });
  }

  for (const [nodeId, color] of successfulColors.entries()) {
    colorByNode.set(nodeId, color);
  }

  yield createStep({
    graph,
    order,
    limit: bestK ?? COLOR_TONES.length,
    bestK,
    cliqueLowerBound,
    colorByNode,
    degreeByNode,
    stack: order.filter((nodeId) => (colorByNode.get(nodeId) ?? null) !== null),
    description: `Chromatic search complete. The graph needs ${bestK ?? COLOR_TONES.length} color${bestK === 1 ? '' : 's'}.`,
    activeCodeLine: 9,
    phase: 'graph-complete',
    computation: {
      candidateLabel: 'Chromatic number',
      expression: `χ(G) = ${bestK ?? COLOR_TONES.length}`,
      result: colorSummary(order, colorByNode, labelById),
      decision: 'This is the smallest palette that colors every adjacent pair differently.',
    },
  });

  function* search(index: number, limit: number): Generator<SortStep, boolean> {
    if (index >= order.length) {
      return true;
    }

    const nodeId = order[index]!;
    const nodeLabel = labelById.get(nodeId) ?? nodeId;
    const forbidden = new Set<number>();
    for (const neighborId of adjacency.get(nodeId) ?? []) {
      const neighborColor = colorByNode.get(neighborId);
      if (neighborColor !== null && neighborColor !== undefined) {
        forbidden.add(neighborColor);
      }
    }

    yield createStep({
      graph,
      order,
      limit,
      bestK,
      cliqueLowerBound,
      colorByNode,
      degreeByNode,
      stack,
      currentNodeId: nodeId,
      description: `Choose a legal color for ${nodeLabel}. Colors used by adjacent nodes are temporarily forbidden.`,
      activeCodeLine: 4,
      phase: 'pick-node',
      computation: {
        candidateLabel: nodeLabel,
        expression: `forbidden = {${[...forbidden].sort((a, b) => a - b).join(', ')}}`,
        result: `${limit - forbidden.size} candidate(s)`,
        decision: 'Try palette slots from left to right and backtrack on dead ends.',
      },
    });

    for (let color = 1; color <= limit; color += 1) {
      const conflictNeighborId = firstConflictNeighbor(nodeId, color, adjacency, colorByNode);
      const conflictEdgeId = conflictNeighborId ? edgeId(graph, nodeId, conflictNeighborId) : null;

      yield createStep({
        graph,
        order,
        limit,
        bestK,
        cliqueLowerBound,
        colorByNode,
        degreeByNode,
        stack,
        currentNodeId: nodeId,
        activeEdgeId: conflictEdgeId,
        activeColor: color,
        description: `Test color ${color} for ${nodeLabel}.`,
        activeCodeLine: 5,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: nodeLabel,
          expression: `try color ${color}`,
          result: conflictNeighborId ? `conflicts with ${labelById.get(conflictNeighborId) ?? conflictNeighborId}` : 'legal',
          decision: conflictNeighborId ? 'reject this color and keep searching' : 'commit color and recurse',
        },
      });

      if (conflictNeighborId) {
        continue;
      }

      colorByNode.set(nodeId, color);
      stack.push(nodeId);

      yield createStep({
        graph,
        order,
        limit,
        bestK,
        cliqueLowerBound,
        colorByNode,
        degreeByNode,
        stack,
        currentNodeId: nodeId,
        activeColor: color,
        description: `Assign color ${color} to ${nodeLabel} and continue with the next uncolored node.`,
        activeCodeLine: 6,
        phase: 'relax',
        computation: {
          candidateLabel: nodeLabel,
          expression: `${nodeLabel} = ${color}`,
          result: colorSummary(stack, colorByNode, labelById),
          decision: 'The current partial coloring is still valid.',
        },
      });

      const solved = yield* search(index + 1, limit);
      if (solved) {
        return true;
      }

      colorByNode.set(nodeId, null);
      stack.pop();

      yield createStep({
        graph,
        order,
        limit,
        bestK,
        cliqueLowerBound,
        colorByNode,
        degreeByNode,
        stack,
        currentNodeId: nodeId,
        activeColor: color,
        description: `Backtrack from ${nodeLabel}: deeper recursion failed, so release color ${color} and try the next option.`,
        activeCodeLine: 7,
        phase: 'settle-node',
        computation: {
          candidateLabel: nodeLabel,
          expression: `${nodeLabel} = ${color}`,
          result: 'undo',
          decision: 'This branch cannot finish a legal coloring.',
        },
      });
    }

    return false;
  }
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly order: readonly string[];
  readonly limit: number;
  readonly bestK: number | null;
  readonly cliqueLowerBound: number;
  readonly colorByNode: ReadonlyMap<string, number | null>;
  readonly degreeByNode: ReadonlyMap<string, number>;
  readonly stack: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly activeColor?: number | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const labelById = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const currentNodeId = args.currentNodeId ?? null;
  const activeEdgeId = args.activeEdgeId ?? null;
  const stackSet = new Set(args.stack);
  const orderIndex = new Map(args.order.map((nodeId, index) => [nodeId, index]));

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const color = args.colorByNode.get(node.id) ?? null;
    const degree = args.degreeByNode.get(node.id) ?? 0;
    const remainingOrder = (orderIndex.get(node.id) ?? 0) + 1;
    return {
      ...node,
      distance: color,
      previousId: null,
      secondaryText: color !== null ? `c${color}` : `deg ${degree}`,
      isSource: node.id === args.order[0],
      isCurrent: node.id === currentNodeId,
      isSettled: color !== null,
      isFrontier: stackSet.has(node.id) && node.id !== currentNodeId,
      tone: color !== null ? colorTone(color) : null,
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: false,
    isTree: false,
    tone: edge.id === activeEdgeId ? 'critical' : null,
  }));

  const queue: GraphQueueEntry[] = args.order
    .filter((nodeId) => (args.colorByNode.get(nodeId) ?? null) === null)
    .map((nodeId) => ({
      nodeId,
      label: labelById.get(nodeId) ?? nodeId,
      distance: availableColorCount(nodeId, args.limit, args.graph, args.colorByNode),
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

  const graphState: GraphStepState = {
    nodes,
    edges,
    sourceId: args.order[0] ?? args.graph.sourceId,
    phaseLabel: phaseLabel(args.phase),
    metricLabel: 'Color',
    secondaryLabel: 'State',
    frontierLabel: 'Uncolored',
    frontierHeadLabel: 'Next node',
    completionLabel: 'Colored',
    frontierStatusLabel: 'pending',
    completionStatusLabel: 'colored',
    showEdgeWeights: false,
    detailLabel: 'Color search',
    detailValue: args.bestK
      ? `χ(G) = ${args.bestK}`
      : `Trying χ ≤ ${args.limit} · bound ${args.cliqueLowerBound}`,
    visitOrderLabel: 'Color stack',
    currentNodeId,
    activeEdgeId,
    queue,
    visitOrder: args.stack.map((nodeId) => {
      const color = args.colorByNode.get(nodeId) ?? 0;
      return `${labelById.get(nodeId) ?? nodeId}:c${color}`;
    }),
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

function buildAdjacency(graph: WeightedGraphData): ReadonlyMap<string, readonly string[]> {
  const map = new Map<string, string[]>();
  for (const node of graph.nodes) {
    map.set(node.id, []);
  }
  for (const edge of graph.edges) {
    map.get(edge.from)?.push(edge.to);
    map.get(edge.to)?.push(edge.from);
  }
  for (const list of map.values()) {
    list.sort();
  }
  return map;
}

function maxCliqueSize(graph: WeightedGraphData): number {
  const nodes = graph.nodes.map((node) => node.id);
  let best = 1;
  for (let mask = 1; mask < 1 << nodes.length; mask += 1) {
    const subset = nodes.filter((_, index) => (mask & (1 << index)) !== 0);
    if (subset.length <= best) continue;
    if (isClique(subset, graph)) {
      best = subset.length;
    }
  }
  return best;
}

function isClique(subset: readonly string[], graph: WeightedGraphData): boolean {
  for (let i = 0; i < subset.length; i += 1) {
    for (let j = i + 1; j < subset.length; j += 1) {
      if (!edgeId(graph, subset[i]!, subset[j]!)) {
        return false;
      }
    }
  }
  return true;
}

function firstConflictNeighbor(
  nodeId: string,
  color: number,
  adjacency: ReadonlyMap<string, readonly string[]>,
  colorByNode: ReadonlyMap<string, number | null>,
): string | null {
  for (const neighborId of adjacency.get(nodeId) ?? []) {
    if ((colorByNode.get(neighborId) ?? null) === color) {
      return neighborId;
    }
  }
  return null;
}

function availableColorCount(
  nodeId: string,
  limit: number,
  graph: WeightedGraphData,
  colorByNode: ReadonlyMap<string, number | null>,
): number {
  const forbidden = new Set<number>();
  for (const edge of graph.edges) {
    const neighborId = edge.from === nodeId ? edge.to : edge.to === nodeId ? edge.from : null;
    if (!neighborId) continue;
    const color = colorByNode.get(neighborId) ?? null;
    if (color !== null) forbidden.add(color);
  }
  return Math.max(0, limit - forbidden.size);
}

function edgeId(graph: WeightedGraphData, a: string, b: string): string | null {
  const edge = graph.edges.find(
    (item) => (item.from === a && item.to === b) || (item.from === b && item.to === a),
  );
  return edge?.id ?? null;
}

function colorTone(color: number): GraphTone | null {
  return COLOR_TONES[color - 1] ?? null;
}

function colorSummary(
  nodeIds: readonly string[],
  colorByNode: ReadonlyMap<string, number | null>,
  labelById: ReadonlyMap<string, string>,
): string {
  return nodeIds
    .filter((nodeId) => (colorByNode.get(nodeId) ?? null) !== null)
    .map((nodeId) => `${labelById.get(nodeId) ?? nodeId}:c${colorByNode.get(nodeId)}`)
    .join(' · ');
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'init':
      return 'Order by degree';
    case 'pick-node':
      return 'Select next node';
    case 'inspect-edge':
      return 'Test color';
    case 'relax':
      return 'Commit color';
    case 'settle-node':
      return 'Backtrack';
    case 'graph-complete':
      return 'Palette decision';
    default:
      return 'Color step';
  }
}
