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

type SteinerParent =
  | { readonly kind: 'base'; readonly terminalId: string }
  | { readonly kind: 'split'; readonly leftMask: number; readonly rightMask: number }
  | { readonly kind: 'move'; readonly viaId: string };

export function* steinerTreeGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelById = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const nodeIds = graph.nodes.map((node) => node.id);
  const terminals = selectTerminals(graph);
  const terminalSet = new Set(terminals);
  const shortest = computeAllPairsShortestPaths(graph);
  const fullMask = (1 << terminals.length) - 1;
  const dp = new Map<string, number>();
  const parent = new Map<string, SteinerParent>();
  const history: string[] = [];
  let bestRootId = graph.sourceId;

  yield createStep({
    graph,
    terminalSet,
    treeNodeIds: new Set(terminals),
    treeEdgeIds: new Set(),
    mask: 0,
    dp,
    parent,
    bestRootId,
    history,
    description: `Choose terminal set ${terminals.map((id) => labelOf(labelById, id)).join(', ')} and seed single-terminal shortest-path states.`,
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: 'Terminals',
      expression: terminals.map((id) => labelOf(labelById, id)).join(' · '),
      result: `${terminals.length} terminal(s)`,
      decision: 'Dreyfus-Wagner grows exact DP states over terminal subsets.',
    },
  });

  for (let terminalIndex = 0; terminalIndex < terminals.length; terminalIndex += 1) {
    const terminalId = terminals[terminalIndex]!;
    const mask = 1 << terminalIndex;

    for (const nodeId of nodeIds) {
      const distance = shortest.distance(nodeId, terminalId);
      setDp(dp, mask, nodeId, distance);
      parent.set(stateKey(mask, nodeId), { kind: 'base', terminalId });
    }

    history.push(`${maskLabel(mask, terminals, labelById)} ready`);

    yield createStep({
      graph,
      terminalSet,
      treeNodeIds: new Set(terminals),
      treeEdgeIds: new Set(pathEdgeIdsBetween(graph, shortest, graph.sourceId, terminalId)),
      mask,
      dp,
      parent,
      bestRootId: terminalId,
      history,
      currentNodeId: terminalId,
      description: `Seed all nodes with their shortest distance to terminal ${labelOf(labelById, terminalId)}.`,
      activeCodeLine: 3,
      phase: 'pick-node',
      computation: {
        candidateLabel: labelOf(labelById, terminalId),
        expression: `dist(*, ${labelOf(labelById, terminalId)})`,
        result: maskLabel(mask, terminals, labelById),
        decision: 'Single-terminal states are just shortest-path distances.',
      },
    });
  }

  for (let mask = 1; mask <= fullMask; mask += 1) {
    if ((mask & (mask - 1)) === 0) {
      continue;
    }

    const combineCost = new Map<string, number>(nodeIds.map((nodeId) => [nodeId, Number.POSITIVE_INFINITY]));

    for (const nodeId of nodeIds) {
      let best = Number.POSITIVE_INFINITY;
      let bestSplit: { leftMask: number; rightMask: number } | null = null;

      for (let leftMask = (mask - 1) & mask; leftMask > 0; leftMask = (leftMask - 1) & mask) {
        const rightMask = mask ^ leftMask;
        if (rightMask === 0 || leftMask > rightMask) continue;
        const leftCost = getDp(dp, leftMask, nodeId);
        const rightCost = getDp(dp, rightMask, nodeId);
        if (!Number.isFinite(leftCost) || !Number.isFinite(rightCost)) continue;

        const candidate = leftCost + rightCost;
        if (candidate < best) {
          best = candidate;
          bestSplit = { leftMask, rightMask };
        }
      }

      if (!bestSplit) continue;

      combineCost.set(nodeId, best);
      parent.set(stateKey(mask, nodeId), { kind: 'split', leftMask: bestSplit.leftMask, rightMask: bestSplit.rightMask });
      setDp(dp, mask, nodeId, best);

      history.push(`${maskLabel(mask, terminals, labelById)}@${labelOf(labelById, nodeId)} = ${best}`);

      yield createStep({
        graph,
        terminalSet,
        treeNodeIds: new Set(terminals),
        treeEdgeIds: new Set(),
        mask,
        dp,
        parent,
        bestRootId: nodeId,
        history,
        currentNodeId: nodeId,
        description: `Merge two smaller terminal groups at node ${labelOf(labelById, nodeId)}.`,
        activeCodeLine: 4,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelById, nodeId),
          expression: `${maskLabel(bestSplit.leftMask, terminals, labelById)} + ${maskLabel(bestSplit.rightMask, terminals, labelById)}`,
          result: String(best),
          decision: 'Two partial Steiner subtrees can meet at the same root node.',
        },
      });
    }

    for (const targetId of nodeIds) {
      let best = combineCost.get(targetId) ?? Number.POSITIVE_INFINITY;
      let bestViaId = targetId;

      for (const viaId of nodeIds) {
        const base = combineCost.get(viaId) ?? Number.POSITIVE_INFINITY;
        const routeCost = shortest.distance(viaId, targetId);
        if (!Number.isFinite(base) || !Number.isFinite(routeCost)) continue;

        const candidate = base + routeCost;
        if (candidate < best) {
          best = candidate;
          bestViaId = viaId;
        }
      }

      if (!Number.isFinite(best)) continue;
      const current = getDp(dp, mask, targetId);
      if (best >= current && bestViaId === targetId) continue;

      setDp(dp, mask, targetId, best);
      parent.set(
        stateKey(mask, targetId),
        bestViaId === targetId
          ? (parent.get(stateKey(mask, targetId)) ?? { kind: 'base', terminalId: terminals[0]! })
          : { kind: 'move', viaId: bestViaId },
      );

      history.push(`${maskLabel(mask, terminals, labelById)}→${labelOf(labelById, targetId)} = ${best}`);

      const routeEdgeIds = bestViaId === targetId
        ? new Set<string>()
        : new Set(pathEdgeIdsBetween(graph, shortest, bestViaId, targetId));

      yield createStep({
        graph,
        terminalSet,
        treeNodeIds: new Set(terminals),
        treeEdgeIds: routeEdgeIds,
        mask,
        dp,
        parent,
        bestRootId: targetId,
        history,
        currentNodeId: targetId,
        description: `Propagate the merged terminal subset through shortest paths so every node can serve as the root of this subset state.`,
        activeCodeLine: 5,
        phase: 'relax',
        computation: {
          candidateLabel: labelOf(labelById, targetId),
          expression: `${bestViaId === targetId ? 'stay' : labelOf(labelById, bestViaId)} + path`,
          result: String(best),
          decision: bestViaId === targetId ? 'meeting point already optimal' : 'move the subset root along the cheapest connector path',
        },
      });
    }
  }

  let bestCost = Number.POSITIVE_INFINITY;
  for (const nodeId of nodeIds) {
    const cost = getDp(dp, fullMask, nodeId);
    if (cost < bestCost) {
      bestCost = cost;
      bestRootId = nodeId;
    }
  }

  const finalTreeEdgeIds = new Set<string>();
  const finalTreeNodeIds = new Set<string>(terminals);
  collectTree(fullMask, bestRootId, parent, shortest, graph, finalTreeEdgeIds, finalTreeNodeIds);

  yield createStep({
    graph,
    terminalSet,
    treeNodeIds: finalTreeNodeIds,
    treeEdgeIds: finalTreeEdgeIds,
    mask: fullMask,
    dp,
    parent,
    bestRootId,
    history,
    description: `Steiner tree complete. Total cost ${bestCost} connects all terminals with only the necessary connector nodes.`,
    activeCodeLine: 6,
    phase: 'graph-complete',
    computation: {
      candidateLabel: 'Best root',
      expression: `${labelOf(labelById, bestRootId)} for ${maskLabel(fullMask, terminals, labelById)}`,
      result: `cost ${bestCost}`,
      decision: 'Teal edges form the exact minimum-cost tree for this terminal set.',
    },
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly terminalSet: ReadonlySet<string>;
  readonly treeNodeIds: ReadonlySet<string>;
  readonly treeEdgeIds: ReadonlySet<string>;
  readonly mask: number;
  readonly dp: ReadonlyMap<string, number>;
  readonly parent: ReadonlyMap<string, SteinerParent>;
  readonly bestRootId: string;
  readonly history: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const labelById = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const currentNodeId = args.currentNodeId ?? null;

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const cost = args.mask === 0 ? null : normalizedCost(getDp(args.dp, args.mask, node.id));
    const parentInfo = args.parent.get(stateKey(args.mask, node.id));
    const secondaryText =
      args.terminalSet.has(node.id)
        ? 'terminal'
        : args.treeNodeIds.has(node.id)
          ? 'steiner'
          : parentInfo?.kind === 'move'
            ? `via ${labelOf(labelById, parentInfo.viaId)}`
            : parentInfo?.kind === 'split'
              ? 'split'
              : 'idle';

    return {
      ...node,
      distance: cost,
      previousId: null,
      secondaryText,
      isSource: node.id === args.graph.sourceId,
      isCurrent: node.id === currentNodeId,
      isSettled: args.treeNodeIds.has(node.id),
      isFrontier: args.mask !== 0 && !args.treeNodeIds.has(node.id) && cost !== null,
      tone: args.terminalSet.has(node.id)
        ? 'terminal'
        : args.treeNodeIds.has(node.id)
          ? 'steiner'
          : null,
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: false,
    isRelaxed: false,
    isTree: args.treeEdgeIds.has(edge.id),
  }));

  const queue: GraphQueueEntry[] = args.graph.nodes
    .map((node) => ({
      nodeId: node.id,
      label: node.label,
      distance: args.mask === 0 ? null : normalizedCost(getDp(args.dp, args.mask, node.id)),
    }))
    .filter((entry) => entry.distance !== null)
    .sort((left, right) => (left.distance ?? Number.POSITIVE_INFINITY) - (right.distance ?? Number.POSITIVE_INFINITY))
    .slice(0, 6);

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
    sourceId: args.graph.sourceId,
    phaseLabel: phaseLabel(args.phase),
    metricLabel: 'Cost',
    secondaryLabel: 'Role / Via',
    frontierLabel: 'Best roots',
    frontierHeadLabel: 'Cheapest root',
    completionLabel: 'Tree nodes',
    frontierStatusLabel: 'candidate',
    completionStatusLabel: 'in-tree',
    showEdgeWeights: true,
    detailLabel: 'Steiner tree',
    detailValue: args.mask === 0 ? 'Seeding terminals' : `Subset ${args.mask.toString(2)} @ ${labelOf(labelById, args.bestRootId)}`,
    visitOrderLabel: 'Subset journal',
    currentNodeId,
    activeEdgeId: null,
    queue,
    visitOrder: args.history.slice(-8),
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

function selectTerminals(graph: WeightedGraphData): readonly string[] {
  const ids = graph.nodes.map((node) => node.id);
  if (ids.length >= 10) {
    return [ids[0]!, ids[4]!, ids[7]!, ids[9]!];
  }
  if (ids.length >= 8) {
    return [ids[0]!, ids[3]!, ids[7]!];
  }
  return [ids[0]!, ids[2]!, ids[5]!];
}

function computeAllPairsShortestPaths(graph: WeightedGraphData) {
  const adjacency = new Map<string, { edge: WeightedGraphEdge; neighborId: string }[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push({ edge, neighborId: edge.to });
    adjacency.get(edge.to)?.push({ edge, neighborId: edge.from });
  }

  const distanceBySource = new Map<string, Map<string, number>>();
  const previousBySource = new Map<string, Map<string, string | null>>();

  for (const source of graph.nodes) {
    const distance = new Map<string, number>(graph.nodes.map((node) => [node.id, Number.POSITIVE_INFINITY]));
    const previous = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
    const visited = new Set<string>();
    distance.set(source.id, 0);

    while (visited.size < graph.nodes.length) {
      let currentId: string | null = null;
      let currentDist = Number.POSITIVE_INFINITY;
      for (const node of graph.nodes) {
        const nodeDist = distance.get(node.id) ?? Number.POSITIVE_INFINITY;
        if (!visited.has(node.id) && nodeDist < currentDist) {
          currentDist = nodeDist;
          currentId = node.id;
        }
      }
      if (!currentId) break;

      visited.add(currentId);
      for (const entry of adjacency.get(currentId) ?? []) {
        const candidate = currentDist + entry.edge.weight;
        if (candidate < (distance.get(entry.neighborId) ?? Number.POSITIVE_INFINITY)) {
          distance.set(entry.neighborId, candidate);
          previous.set(entry.neighborId, currentId);
        }
      }
    }

    distanceBySource.set(source.id, distance);
    previousBySource.set(source.id, previous);
  }

  return {
    distance(sourceId: string, targetId: string): number {
      return distanceBySource.get(sourceId)?.get(targetId) ?? Number.POSITIVE_INFINITY;
    },
    path(sourceId: string, targetId: string): readonly string[] {
      const previous = previousBySource.get(sourceId);
      if (!previous) return [];
      const path: string[] = [];
      let cursor: string | null = targetId;
      while (cursor) {
        path.push(cursor);
        if (cursor === sourceId) break;
        cursor = previous.get(cursor) ?? null;
      }
      return path.reverse();
    },
  };
}

function collectTree(
  mask: number,
  nodeId: string,
  parent: ReadonlyMap<string, SteinerParent>,
  shortest: ReturnType<typeof computeAllPairsShortestPaths>,
  graph: WeightedGraphData,
  edgeIds: Set<string>,
  nodeIds: Set<string>,
): void {
  const state = parent.get(stateKey(mask, nodeId));
  if (!state) return;

  if (state.kind === 'base') {
    addPath(shortest.path(nodeId, state.terminalId), graph, edgeIds, nodeIds);
    return;
  }

  if (state.kind === 'split') {
    collectTree(state.leftMask, nodeId, parent, shortest, graph, edgeIds, nodeIds);
    collectTree(state.rightMask, nodeId, parent, shortest, graph, edgeIds, nodeIds);
    return;
  }

  collectTree(mask, state.viaId, parent, shortest, graph, edgeIds, nodeIds);
  addPath(shortest.path(state.viaId, nodeId), graph, edgeIds, nodeIds);
}

function addPath(
  pathNodeIds: readonly string[],
  graph: WeightedGraphData,
  edgeIds: Set<string>,
  nodeIds: Set<string>,
): void {
  for (const nodeId of pathNodeIds) {
    nodeIds.add(nodeId);
  }
  for (let index = 0; index < pathNodeIds.length - 1; index += 1) {
    const fromId = pathNodeIds[index]!;
    const toId = pathNodeIds[index + 1]!;
    const edge = graph.edges.find(
      (item) => (item.from === fromId && item.to === toId) || (item.from === toId && item.to === fromId),
    );
    if (edge) {
      edgeIds.add(edge.id);
    }
  }
}

function pathEdgeIdsBetween(
  graph: WeightedGraphData,
  shortest: ReturnType<typeof computeAllPairsShortestPaths>,
  fromId: string,
  toId: string,
): readonly string[] {
  const result = new Set<string>();
  addPath(shortest.path(fromId, toId), graph, result, new Set<string>());
  return [...result];
}

function stateKey(mask: number, nodeId: string): string {
  return `${mask}:${nodeId}`;
}

function setDp(dp: Map<string, number>, mask: number, nodeId: string, value: number): void {
  dp.set(stateKey(mask, nodeId), value);
}

function getDp(dp: ReadonlyMap<string, number>, mask: number, nodeId: string): number {
  return dp.get(stateKey(mask, nodeId)) ?? Number.POSITIVE_INFINITY;
}

function normalizedCost(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

function maskLabel(mask: number, terminals: readonly string[], labelById: ReadonlyMap<string, string>): string {
  const labels = terminals
    .filter((_, index) => (mask & (1 << index)) !== 0)
    .map((nodeId) => labelOf(labelById, nodeId));
  return `{${labels.join(', ')}}`;
}

function labelOf(labelById: ReadonlyMap<string, string>, nodeId: string): string {
  return labelById.get(nodeId) ?? nodeId;
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'init':
      return 'Seed terminal states';
    case 'pick-node':
      return 'Single-terminal base';
    case 'inspect-edge':
      return 'Merge terminal subsets';
    case 'relax':
      return 'Propagate subset root';
    case 'graph-complete':
      return 'Exact Steiner tree';
    default:
      return 'Steiner step';
  }
}
