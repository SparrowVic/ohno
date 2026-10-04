import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphStepState,
  GraphTraceRow,
  WeightedGraphData,
} from '../../models/graph';
import { SortStep } from '../../models/sort-step';
import { graphLabel } from '../graph-text';
import { RUNTIME_KEY } from '../../../../core/i18n/i18n-keys';

const GRAPH_TEXT = RUNTIME_KEY.graph.common;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.dijkstra.descriptions.initialize'),
    pick: t('features.algorithms.runtime.graph.dijkstra.descriptions.pick'),
    inspect: t('features.algorithms.runtime.graph.dijkstra.descriptions.inspect'),
    relax: t('features.algorithms.runtime.graph.dijkstra.descriptions.relax'),
    keep: t('features.algorithms.runtime.graph.dijkstra.descriptions.keep'),
    settle: t('features.algorithms.runtime.graph.dijkstra.descriptions.settle'),
    complete: t('features.algorithms.runtime.graph.dijkstra.descriptions.complete'),
  },
  phases: {
    pick: t('features.algorithms.runtime.graph.dijkstra.phases.pick'),
    inspect: t('features.algorithms.runtime.graph.dijkstra.phases.inspect'),
    relax: t('features.algorithms.runtime.graph.dijkstra.phases.relax'),
    keep: t('features.algorithms.runtime.graph.dijkstra.phases.keep'),
    settle: t('features.algorithms.runtime.graph.dijkstra.phases.settle'),
    complete: t('features.algorithms.runtime.graph.dijkstra.phases.complete'),
    initialize: t('features.algorithms.runtime.graph.dijkstra.phases.initialize'),
  },
} as const;

export function* dijkstraGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const distanceMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const settled = new Set<string>();
  const frontier = new Set<string>();
  const visitOrder: string[] = [];

  distanceMap.set(graph.sourceId, 0);
  frontier.add(graph.sourceId);

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    settled,
    frontier,
    visitOrder,
    description: i18nText(I18N.descriptions.initialize, { source: labelOf(nodeMap, graph.sourceId) }),
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    const currentNodeId = nextNode(graph, distanceMap, settled);
    if (!currentNodeId) break;

    frontier.delete(currentNodeId);

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      settled,
      frontier,
      visitOrder,
      currentNodeId,
      description: i18nText(I18N.descriptions.pick, { node: labelOf(nodeMap, currentNodeId) }),
      activeCodeLine: 5,
      phase: 'pick-node',
    });

    const currentDistance = distanceMap.get(currentNodeId) ?? null;
    if (currentDistance === null) {
      break;
    }

    for (const edge of outgoingEdges(graph, currentNodeId)) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      if (settled.has(neighborId)) {
        continue;
      }

      const neighborLabel = labelOf(nodeMap, neighborId);
      const candidateDistance = currentDistance + edge.weight;
      const previousDistance = distanceMap.get(neighborId) ?? null;

      yield createStep({
        graph,
        distanceMap,
        previousMap,
        settled,
        frontier,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.inspect, { from: labelOf(nodeMap, currentNodeId), to: neighborLabel, weight: edge.weight }),
        activeCodeLine: 7,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: neighborLabel,
          expression: `${currentDistance} + ${edge.weight}`,
          result: `${candidateDistance}`,
          decision:
            previousDistance === null
              ? `${candidateDistance} < ∞`
              : `${candidateDistance} < ${previousDistance}`,
        },
      });

      if (previousDistance === null || candidateDistance < previousDistance) {
        distanceMap.set(neighborId, candidateDistance);
        previousMap.set(neighborId, currentNodeId);
        frontier.add(neighborId);

        yield createStep({
          graph,
          distanceMap,
          previousMap,
          settled,
          frontier,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: i18nText(I18N.descriptions.relax, { node: neighborLabel, distance: candidateDistance, via: labelOf(nodeMap, currentNodeId) }),
          activeCodeLine: 9,
          phase: 'relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `${currentDistance} + ${edge.weight}`,
            result: `${candidateDistance}`,
            decision: i18nText(GRAPH_TEXT.betterThan, { value: previousDistance ?? '∞' }),
          },
        });
      } else {
        yield createStep({
          graph,
          distanceMap,
          previousMap,
          settled,
          frontier,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.keep, { node: neighborLabel, best: previousDistance, candidate: candidateDistance }),
          activeCodeLine: 8,
          phase: 'skip-relax',
          computation: {
            candidateLabel: neighborLabel,
            expression: `${currentDistance} + ${edge.weight}`,
            result: `${candidateDistance}`,
            decision: i18nText(GRAPH_TEXT.keep, { value: previousDistance }),
          },
        });
      }
    }

    settled.add(currentNodeId);
    visitOrder.push(currentNodeId);

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      settled,
      frontier,
      visitOrder,
      currentNodeId,
      description: i18nText(I18N.descriptions.settle, { node: labelOf(nodeMap, currentNodeId) }),
      activeCodeLine: 12,
      phase: 'settle-node',
    });
  }

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    settled,
    frontier,
    visitOrder,
    description: i18nText(I18N.descriptions.complete, { source: labelOf(nodeMap, graph.sourceId) }),
    activeCodeLine: 14,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly distanceMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly settled: ReadonlySet<string>;
  readonly frontier: ReadonlySet<string>;
  readonly visitOrder: readonly string[];
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

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => ({
    ...node,
    distance: args.distanceMap.get(node.id) ?? null,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.previousMap.get(node.id)
      ? (labelMap.get(args.previousMap.get(node.id) as string) ?? null)
      : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.settled.has(node.id),
    isFrontier: args.frontier.has(node.id),
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

  const queue = buildQueue(nodes);
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
      metricLabel: graphLabel('distance'),
      secondaryLabel: graphLabel('previous'),
      frontierLabel: graphLabel('priorityQueue'),
      frontierHeadLabel: graphLabel('queueHead'),
      completionLabel: graphLabel('settled'),
      frontierStatusLabel: graphLabel('statusQueued'),
      completionStatusLabel: graphLabel('statusSettled'),
      showEdgeWeights: true,
      detailLabel: graphLabel('path'),
      detailValue: currentNodeId ? describePath(currentNodeId, args.previousMap, labelMap) : i18nText(GRAPH_TEXT.noActiveNode),
      visitOrderLabel: graphLabel('settledOrder'),
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder].map((nodeId) => labelMap.get(nodeId) ?? nodeId),
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return I18N.phases.pick;
    case 'inspect-edge':
      return I18N.phases.inspect;
    case 'relax':
      return I18N.phases.relax;
    case 'skip-relax':
      return I18N.phases.keep;
    case 'settle-node':
      return I18N.phases.settle;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.initialize;
  }
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

function nextNode(
  graph: WeightedGraphData,
  distanceMap: ReadonlyMap<string, number | null>,
  settled: ReadonlySet<string>,
): string | null {
  return graph.nodes
    .filter((node) => !settled.has(node.id) && distanceMap.get(node.id) !== null)
    .sort((left, right) => {
      const leftDistance = distanceMap.get(left.id) ?? Number.POSITIVE_INFINITY;
      const rightDistance = distanceMap.get(right.id) ?? Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      return left.label.localeCompare(right.label);
    })[0]?.id ?? null;
}

function buildQueue(nodes: readonly GraphNodeSnapshot[]): GraphQueueEntry[] {
  return nodes
    .filter((node) => node.isFrontier || node.isCurrent)
    .sort((left, right) => {
      const leftDistance = left.distance ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distance ?? Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      return left.label.localeCompare(right.label);
    })
    .map((node) => ({
      nodeId: node.id,
      label: node.label,
      distance: node.distance,
    }));
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
