import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../../models/graph';
import { SortStep } from '../../models/sort-step';

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.topologicalSort.descriptions.initialize'),
    dequeue: t('features.algorithms.runtime.graph.topologicalSort.descriptions.dequeue'),
    removeEdge: t('features.algorithms.runtime.graph.topologicalSort.descriptions.removeEdge'),
    unlock: t('features.algorithms.runtime.graph.topologicalSort.descriptions.unlock'),
    blocked: t('features.algorithms.runtime.graph.topologicalSort.descriptions.blocked'),
    commit: t('features.algorithms.runtime.graph.topologicalSort.descriptions.commit'),
    complete: t('features.algorithms.runtime.graph.topologicalSort.descriptions.complete'),
  },
  phases: {
    dequeue: t('features.algorithms.runtime.graph.topologicalSort.phases.dequeue'),
    removeEdge: t('features.algorithms.runtime.graph.topologicalSort.phases.removeEdge'),
    unlock: t('features.algorithms.runtime.graph.topologicalSort.phases.unlock'),
    blocked: t('features.algorithms.runtime.graph.topologicalSort.phases.blocked'),
    commit: t('features.algorithms.runtime.graph.topologicalSort.phases.commit'),
    complete: t('features.algorithms.runtime.graph.topologicalSort.phases.complete'),
    initialize: t('features.algorithms.runtime.graph.topologicalSort.phases.initialize'),
  },
} as const;

export function* topologicalSortKahnGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const inDegreeMap = new Map<string, number>(graph.nodes.map((node) => [node.id, 0]));
  const orderMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const removed = new Set<string>();
  const queue: string[] = [];
  const topoOrder: string[] = [];

  for (const edge of graph.edges) {
    inDegreeMap.set(edge.to, (inDegreeMap.get(edge.to) ?? 0) + 1);
  }

  for (const node of graph.nodes) {
    if ((inDegreeMap.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
    }
  }

  yield createStep({
    graph,
    inDegreeMap,
    orderMap,
    previousMap,
    removed,
    queue,
    topoOrder,
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 8,
    phase: 'init',
  });

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    topoOrder.push(currentNodeId);
    orderMap.set(currentNodeId, topoOrder.length);

    yield createStep({
      graph,
      inDegreeMap,
      orderMap,
      previousMap,
      removed,
      queue,
      topoOrder,
      currentNodeId,
      description: i18nText(I18N.descriptions.dequeue, { node: labelOf(labelMap, currentNodeId) }),
      activeCodeLine: 10,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, currentNodeId)) {
      const neighborId = edge.to;
      const nextInDegree = Math.max(0, (inDegreeMap.get(neighborId) ?? 0) - 1);

      yield createStep({
        graph,
        inDegreeMap,
        orderMap,
        previousMap,
        removed,
        queue,
        topoOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.removeEdge, { from: labelOf(labelMap, currentNodeId), to: labelOf(labelMap, neighborId) }),
        activeCodeLine: 13,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: `${inDegreeMap.get(neighborId) ?? 0} - 1`,
          result: `${nextInDegree}`,
          decision: nextInDegree === 0 ? 'enqueue when it reaches 0' : 'still blocked',
        },
      });

      inDegreeMap.set(neighborId, nextInDegree);
      previousMap.set(neighborId, currentNodeId);

      if (nextInDegree === 0) {
        queue.push(neighborId);
        yield createStep({
          graph,
          inDegreeMap,
          orderMap,
          previousMap,
          removed,
          queue,
          topoOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: i18nText(I18N.descriptions.unlock, { node: labelOf(labelMap, neighborId) }),
          activeCodeLine: 15,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `${inDegreeMap.get(neighborId) ?? 0}`,
            result: '0',
            decision: 'added to queue',
          },
        });
      } else {
        yield createStep({
          graph,
          inDegreeMap,
          orderMap,
          previousMap,
          removed,
          queue,
          topoOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.blocked, { node: labelOf(labelMap, neighborId), inDegree: nextInDegree }),
          activeCodeLine: 14,
          phase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `${nextInDegree}`,
            result: `${nextInDegree}`,
            decision: 'wait for more incoming edges to disappear',
          },
        });
      }
    }

    removed.add(currentNodeId);

    yield createStep({
      graph,
      inDegreeMap,
      orderMap,
      previousMap,
      removed,
      queue,
      topoOrder,
      currentNodeId,
      description: i18nText(I18N.descriptions.commit, { node: labelOf(labelMap, currentNodeId) }),
      activeCodeLine: 17,
      phase: 'settle-node',
    });
  }

  yield createStep({
    graph,
    inDegreeMap,
    orderMap,
    previousMap,
    removed,
    queue,
    topoOrder,
    description: i18nText(I18N.descriptions.complete, { order: topoOrder.map((id) => labelOf(labelMap, id)).join(' → ') }),
    activeCodeLine: 18,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly inDegreeMap: ReadonlyMap<string, number>;
  readonly orderMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly removed: ReadonlySet<string>;
  readonly queue: readonly string[];
  readonly topoOrder: readonly string[];
  readonly description: TranslatableText;
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
  const frontierSet = new Set(args.queue);

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.inDegreeMap.get(node.id) ?? 0,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.orderMap.get(node.id) ? `#${args.orderMap.get(node.id)}` : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.removed.has(node.id),
    isFrontier: frontierSet.has(node.id),
  }));

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.previousMap.get(edge.to) === edge.from,
  }));

  const queue: GraphQueueEntry[] = args.queue.map((nodeId) => ({
    nodeId,
    label: labelOf(labelMap, nodeId),
    distance: args.inDegreeMap.get(nodeId) ?? 0,
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
      phaseLabel: i18nText(phaseLabel(args.phase)),
      metricLabel: 'InDeg',
      secondaryLabel: 'Order',
      frontierLabel: 'Zero in-degree queue',
      frontierHeadLabel: 'Queue head',
      completionLabel: 'Ordered',
      frontierStatusLabel: 'queued',
      completionStatusLabel: 'ordered',
      showEdgeWeights: false,
      detailLabel: 'Topo order',
      detailValue: args.topoOrder.length > 0
        ? args.topoOrder.map((nodeId) => labelOf(labelMap, nodeId)).join(' → ')
        : 'pending',
      visitOrderLabel: 'Topo order',
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: args.topoOrder.map((nodeId) => labelOf(labelMap, nodeId)),
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

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return I18N.phases.dequeue;
    case 'inspect-edge':
      return I18N.phases.removeEdge;
    case 'relax':
      return I18N.phases.unlock;
    case 'skip-relax':
      return I18N.phases.blocked;
    case 'settle-node':
      return I18N.phases.commit;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.initialize;
  }
}
