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

export function* dominatorTreeGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelById = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const nodeIds = graph.nodes.map((node) => node.id);
  const predecessors = buildPredecessorMap(graph);
  const domSets = new Map<string, Set<string>>();
  const idomByNode = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const queueOrder = nodeIds.filter((nodeId) => nodeId !== graph.sourceId);
  let pass = 0;
  let stable = false;

  for (const nodeId of nodeIds) {
    domSets.set(
      nodeId,
      nodeId === graph.sourceId ? new Set([nodeId]) : new Set(nodeIds),
    );
  }

  yield createStep({
    graph,
    domSets,
    idomByNode,
    queueOrder,
    currentPass: pass,
    description: 'Initialize the entry block to dominate only itself, while every other block starts with the full node set.',
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: labelOf(labelById, graph.sourceId),
      expression: `${labelOf(labelById, graph.sourceId)} = {${labelOf(labelById, graph.sourceId)}}`,
      result: 'others = all nodes',
      decision: 'Iterative intersection will now remove impossible dominators.',
    },
  });

  while (!stable) {
    pass += 1;
    stable = true;

    for (const nodeId of queueOrder) {
      const preds = predecessors.get(nodeId) ?? [];
      if (preds.length === 0) continue;

      let intersection = new Set(domSets.get(preds[0]!) ?? []);
      let activeEdgeId: string | null = edgeId(graph, preds[0]!, nodeId);

      yield createStep({
        graph,
        domSets,
        idomByNode,
        queueOrder,
        currentPass: pass,
        currentNodeId: nodeId,
        activeEdgeId,
        description: `Recompute dominators of ${labelOf(labelById, nodeId)} from the intersection of all predecessor dominator sets.`,
        activeCodeLine: 4,
        phase: 'pick-node',
        computation: {
          candidateLabel: labelOf(labelById, nodeId),
          expression: predecessorLabel(preds, labelById),
          result: setLabel(intersection, labelById),
          decision: 'Start from the first predecessor and keep intersecting.',
        },
      });

      for (let index = 1; index < preds.length; index += 1) {
        const predId = preds[index]!;
        activeEdgeId = edgeId(graph, predId, nodeId);
        const predSet = domSets.get(predId) ?? new Set<string>();
        const nextIntersection = intersect(intersection, predSet);

        yield createStep({
          graph,
          domSets,
          idomByNode,
          queueOrder,
          currentPass: pass,
          currentNodeId: nodeId,
          activeEdgeId,
          description: `Intersect with the dominators of predecessor ${labelOf(labelById, predId)}.`,
          activeCodeLine: 5,
          phase: 'inspect-edge',
          computation: {
            candidateLabel: labelOf(labelById, nodeId),
            expression: `${setLabel(intersection, labelById)} ∩ ${setLabel(predSet, labelById)}`,
            result: setLabel(nextIntersection, labelById),
            decision: 'Only blocks common to all predecessor paths can dominate this node.',
          },
        });

        intersection = nextIntersection;
      }

      const nextSet = new Set(intersection);
      nextSet.add(nodeId);
      const previousSet = domSets.get(nodeId) ?? new Set<string>();

      if (!sameSet(previousSet, nextSet)) {
        domSets.set(nodeId, nextSet);
        stable = false;

        yield createStep({
          graph,
          domSets,
          idomByNode,
          queueOrder,
          currentPass: pass,
          currentNodeId: nodeId,
          activeEdgeId,
          description: `${labelOf(labelById, nodeId)} shrinks to a tighter dominator set after this pass.`,
          activeCodeLine: 6,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelById, nodeId),
            expression: `${setLabel(intersection, labelById)} ∪ {${labelOf(labelById, nodeId)}}`,
            result: setLabel(nextSet, labelById),
            decision: 'The set changed, so another global pass is still required.',
          },
        });
      } else {
        yield createStep({
          graph,
          domSets,
          idomByNode,
          queueOrder,
          currentPass: pass,
          currentNodeId: nodeId,
          activeEdgeId,
          description: `${labelOf(labelById, nodeId)} keeps the same dominator set on this pass.`,
          activeCodeLine: 6,
          phase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelById, nodeId),
            expression: setLabel(nextSet, labelById),
            result: 'unchanged',
            decision: 'This block is already stable for the current predecessor information.',
          },
        });
      }
    }
  }

  for (const nodeId of queueOrder) {
    const strictDominators = [...(domSets.get(nodeId) ?? new Set<string>())].filter((candidate) => candidate !== nodeId);
    const immediate = strictDominators.find((candidate) =>
      strictDominators.every((other) => other === candidate || !(domSets.get(other)?.has(candidate) ?? false)),
    ) ?? null;

    idomByNode.set(nodeId, immediate);

    yield createStep({
      graph,
      domSets,
      idomByNode,
      queueOrder,
      currentPass: pass,
      currentNodeId: nodeId,
      activeEdgeId: immediate ? edgeId(graph, immediate, nodeId) : null,
      description: `Choose the deepest strict dominator of ${labelOf(labelById, nodeId)} as its immediate dominator.`,
      activeCodeLine: 8,
      phase: 'settle-node',
      computation: {
        candidateLabel: labelOf(labelById, nodeId),
        expression: setLabel(new Set(strictDominators), labelById),
        result: immediate ? labelOf(labelById, immediate) : 'entry',
        decision: 'The immediate dominator becomes the parent in the dominator tree.',
      },
    });
  }

  yield createStep({
    graph,
    domSets,
    idomByNode,
    queueOrder,
    currentPass: pass,
    description: 'Dominator analysis complete. Teal arrows now show the final immediate-dominator tree over the control-flow graph.',
    activeCodeLine: 9,
    phase: 'graph-complete',
    computation: {
      candidateLabel: 'Immediate dominators',
      expression: queueOrder.map((nodeId) => `${labelOf(labelById, nodeId)}←${labelOf(labelById, idomByNode.get(nodeId) ?? graph.sourceId)}`).join(' · '),
      result: 'tree ready',
      decision: 'Every reachable block now has exactly one parent in the dominator tree.',
    },
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly domSets: ReadonlyMap<string, ReadonlySet<string>>;
  readonly idomByNode: ReadonlyMap<string, string | null>;
  readonly queueOrder: readonly string[];
  readonly currentPass: number;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly currentNodeId?: string | null;
  readonly activeEdgeId?: string | null;
  readonly computation?: GraphComputation | null;
}): SortStep {
  const labelById = new Map(args.graph.nodes.map((node) => [node.id, node.label]));
  const currentNodeId = args.currentNodeId ?? null;
  const activeEdgeId = args.activeEdgeId ?? null;
  const finalizedNodes = new Set(
    [...args.idomByNode.entries()].filter(([nodeId, parentId]) => nodeId === args.graph.sourceId || parentId !== null).map(([nodeId]) => nodeId),
  );

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const domSet = args.domSets.get(node.id) ?? new Set<string>();
    const idom = args.idomByNode.get(node.id) ?? null;
    return {
      ...node,
      distance: domSet.size,
      previousId: idom,
      secondaryText: idom ? labelOf(labelById, idom) : setLabel(domSet, labelById),
      isSource: node.id === args.graph.sourceId,
      isCurrent: node.id === currentNodeId,
      isSettled: finalizedNodes.has(node.id),
      isFrontier: !finalizedNodes.has(node.id) && node.id !== currentNodeId,
    };
  });

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: false,
    isTree: args.idomByNode.get(edge.to) === edge.from,
  }));

  const queue: GraphQueueEntry[] = args.queueOrder.map((nodeId) => ({
    nodeId,
    label: labelOf(labelById, nodeId),
    distance: args.domSets.get(nodeId)?.size ?? null,
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
    sourceId: args.graph.sourceId,
    phaseLabel: phaseLabel(args.phase, args.currentPass),
    metricLabel: 'Dom#',
    secondaryLabel: 'IDom / Set',
    frontierLabel: 'Worklist',
    frontierHeadLabel: 'Next block',
    completionLabel: 'Fixed',
    frontierStatusLabel: 'pending',
    completionStatusLabel: 'fixed',
    showEdgeWeights: false,
    detailLabel: 'Dominator tree',
    detailValue: `Pass ${args.currentPass}`,
    visitOrderLabel: 'Immediate dominators',
    currentNodeId,
    activeEdgeId,
    queue,
    visitOrder: [...args.idomByNode.entries()]
      .filter(([nodeId, idom]) => nodeId !== args.graph.sourceId && idom !== null)
      .map(([nodeId, idom]) => `${labelOf(labelById, nodeId)}←${labelOf(labelById, idom ?? args.graph.sourceId)}`),
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

function buildPredecessorMap(graph: WeightedGraphData): ReadonlyMap<string, readonly string[]> {
  const map = new Map<string, string[]>();
  for (const node of graph.nodes) {
    map.set(node.id, []);
  }
  for (const edge of graph.edges) {
    map.get(edge.to)?.push(edge.from);
  }
  for (const list of map.values()) {
    list.sort();
  }
  return map;
}

function intersect(left: ReadonlySet<string>, right: ReadonlySet<string>): Set<string> {
  const result = new Set<string>();
  for (const item of left) {
    if (right.has(item)) result.add(item);
  }
  return result;
}

function sameSet(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  if (left.size !== right.size) return false;
  for (const item of left) {
    if (!right.has(item)) return false;
  }
  return true;
}

function predecessorLabel(predecessors: readonly string[], labelById: ReadonlyMap<string, string>): string {
  return predecessors.map((predId) => labelOf(labelById, predId)).join(' ∩ ');
}

function setLabel(nodeIds: ReadonlySet<string>, labelById: ReadonlyMap<string, string>): string {
  const labels = [...nodeIds].map((nodeId) => labelOf(labelById, nodeId)).sort();
  if (labels.length <= 3) return `{${labels.join(', ')}}`;
  return `{${labels.slice(0, 3).join(', ')}, +${labels.length - 3}}`;
}

function edgeId(graph: WeightedGraphData, fromId: string, toId: string): string | null {
  return graph.edges.find((edge) => edge.from === fromId && edge.to === toId)?.id ?? null;
}

function labelOf(labelById: ReadonlyMap<string, string>, nodeId: string): string {
  return labelById.get(nodeId) ?? nodeId;
}

function phaseLabel(phase: SortStep['phase'], pass: number): string {
  switch (phase) {
    case 'init':
      return 'Seed dominator sets';
    case 'pick-node':
      return `Pass ${pass} · pick block`;
    case 'inspect-edge':
      return `Pass ${pass} · intersect predecessor`;
    case 'relax':
      return `Pass ${pass} · set shrinks`;
    case 'skip-relax':
      return `Pass ${pass} · set stable`;
    case 'settle-node':
      return 'Extract immediate dominator';
    case 'graph-complete':
      return 'Dominator tree ready';
    default:
      return 'Dominator step';
  }
}
