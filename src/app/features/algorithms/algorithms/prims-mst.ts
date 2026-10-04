import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  GraphComputation,
  GraphEdgeSnapshot,
  GraphNodeSnapshot,
  GraphQueueEntry,
  GraphTraceRow,
  WeightedGraphData,
} from '../models/graph';
import { SortStep } from '../models/sort-step';
import { graphLabel } from './graph-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const GRAPH_TEXT = RUNTIME_KEY.graph.common;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.prim.descriptions.initialize'),
    pick: t('features.algorithms.runtime.graph.prim.descriptions.pick'),
    inspect: t('features.algorithms.runtime.graph.prim.descriptions.inspect'),
    update: t('features.algorithms.runtime.graph.prim.descriptions.update'),
    keep: t('features.algorithms.runtime.graph.prim.descriptions.keep'),
    lock: t('features.algorithms.runtime.graph.prim.descriptions.lock'),
    complete: t('features.algorithms.runtime.graph.prim.descriptions.complete'),
  },
  phases: {
    pick: t('features.algorithms.runtime.graph.prim.phases.pick'),
    inspect: t('features.algorithms.runtime.graph.prim.phases.inspect'),
    update: t('features.algorithms.runtime.graph.prim.phases.update'),
    keep: t('features.algorithms.runtime.graph.prim.phases.keep'),
    lock: t('features.algorithms.runtime.graph.prim.phases.lock'),
    complete: t('features.algorithms.runtime.graph.prim.phases.complete'),
    initialize: t('features.algorithms.runtime.graph.prim.phases.initialize'),
  },
} as const;

export function* primsMstGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const keyMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const inTree = new Set<string>();
  const frontier = new Set<string>();
  const visitOrder: string[] = [];

  keyMap.set(graph.sourceId, 0);
  frontier.add(graph.sourceId);

  yield createStep({
    graph,
    keyMap,
    previousMap,
    inTree,
    frontier,
    visitOrder,
    description: i18nText(I18N.descriptions.initialize, { source: labelOf(labelMap, graph.sourceId) }),
    activeCodeLine: 2,
    phase: 'init',
  });

  while (true) {
    const currentNodeId = nextNode(graph, keyMap, inTree);
    if (!currentNodeId) break;

    frontier.delete(currentNodeId);

    yield createStep({
      graph,
      keyMap,
      previousMap,
      inTree,
      frontier,
      visitOrder,
      currentNodeId,
      description: i18nText(I18N.descriptions.pick, { node: labelOf(labelMap, currentNodeId) }),
      activeCodeLine: 5,
      phase: 'pick-node',
    });

    for (const edge of outgoingEdges(graph, currentNodeId)) {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      if (inTree.has(neighborId)) continue;

      const knownCost = keyMap.get(neighborId) ?? null;

      yield createStep({
        graph,
        keyMap,
        previousMap,
        inTree,
        frontier,
        visitOrder,
        currentNodeId,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.inspect, { from: labelOf(labelMap, currentNodeId), to: labelOf(labelMap, neighborId), weight: edge.weight }),
        activeCodeLine: 7,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: `${edge.weight}`,
          result: `${edge.weight}`,
          decision: knownCost === null ? i18nText(GRAPH_TEXT.bestVsInfinity) : `${edge.weight} < ${knownCost}`,
        },
      });

      if (knownCost === null || edge.weight < knownCost) {
        keyMap.set(neighborId, edge.weight);
        previousMap.set(neighborId, currentNodeId);
        frontier.add(neighborId);

        yield createStep({
          graph,
          keyMap,
          previousMap,
          inTree,
          frontier,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: i18nText(I18N.descriptions.update, { node: labelOf(labelMap, neighborId), via: labelOf(labelMap, currentNodeId), cost: edge.weight }),
          activeCodeLine: 9,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `${edge.weight}`,
            result: `${edge.weight}`,
            decision: knownCost === null ? i18nText(GRAPH_TEXT.firstConnection) : i18nText(GRAPH_TEXT.betterThan, { value: knownCost }),
          },
        });
      } else {
        yield createStep({
          graph,
          keyMap,
          previousMap,
          inTree,
          frontier,
          visitOrder,
          currentNodeId,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.keep, { node: labelOf(labelMap, neighborId) }),
          activeCodeLine: 8,
          phase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: `${edge.weight}`,
            result: `${edge.weight}`,
            decision: i18nText(GRAPH_TEXT.keep, { value: knownCost }),
          },
        });
      }
    }

    inTree.add(currentNodeId);
    visitOrder.push(currentNodeId);

    yield createStep({
      graph,
      keyMap,
      previousMap,
      inTree,
      frontier,
      visitOrder,
      currentNodeId,
      description: i18nText(I18N.descriptions.lock, { node: labelOf(labelMap, currentNodeId) }),
      activeCodeLine: 12,
      phase: 'settle-node',
    });
  }

  yield createStep({
    graph,
    keyMap,
    previousMap,
    inTree,
    frontier,
    visitOrder,
    description: i18nText(I18N.descriptions.complete, { weight: totalWeight(keyMap, inTree) }),
    activeCodeLine: 14,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly keyMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly inTree: ReadonlySet<string>;
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
    distance: args.keyMap.get(node.id) ?? null,
    previousId: args.previousMap.get(node.id) ?? null,
    secondaryText: args.previousMap.get(node.id)
      ? labelOf(labelMap, args.previousMap.get(node.id) as string)
      : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.inTree.has(node.id),
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
      metricLabel: graphLabel('best'),
      secondaryLabel: graphLabel('previous'),
      frontierLabel: graphLabel('candidateQueue'),
      frontierHeadLabel: graphLabel('cheapestNext'),
      completionLabel: graphLabel('inTree'),
      frontierStatusLabel: graphLabel('statusCandidate'),
      completionStatusLabel: graphLabel('statusInTree'),
      showEdgeWeights: true,
      detailLabel: graphLabel('mstTree'),
      detailValue: i18nText(GRAPH_TEXT.treeWeight, { weight: totalWeight(args.keyMap, args.inTree) }),
      visitOrderLabel: graphLabel('treeOrder'),
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder].map((nodeId) => labelOf(labelMap, nodeId)),
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

function nextNode(
  graph: WeightedGraphData,
  keyMap: ReadonlyMap<string, number | null>,
  inTree: ReadonlySet<string>,
): string | null {
  return graph.nodes
    .filter((node) => !inTree.has(node.id) && keyMap.get(node.id) !== null)
    .sort((left, right) => {
      const leftKey = keyMap.get(left.id) ?? Number.POSITIVE_INFINITY;
      const rightKey = keyMap.get(right.id) ?? Number.POSITIVE_INFINITY;
      if (leftKey !== rightKey) return leftKey - rightKey;
      return left.label.localeCompare(right.label);
    })[0]?.id ?? null;
}

function buildQueue(nodes: readonly GraphNodeSnapshot[]): GraphQueueEntry[] {
  return nodes
    .filter((node) => node.isFrontier || node.isCurrent)
    .sort((left, right) => {
      const leftDistance = left.distance ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distance ?? Number.POSITIVE_INFINITY;
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return left.label.localeCompare(right.label);
    })
    .map((node) => ({
      nodeId: node.id,
      label: node.label,
      distance: node.distance,
    }));
}

function totalWeight(keyMap: ReadonlyMap<string, number | null>, inTree: ReadonlySet<string>): number {
  let total = 0;
  for (const nodeId of inTree) {
    total += keyMap.get(nodeId) ?? 0;
  }
  return total;
}

function labelOf(map: ReadonlyMap<string, string>, nodeId: string): string {
  return map.get(nodeId) ?? nodeId;
}

function phaseLabel(phase: SortStep['phase']): string {
  switch (phase) {
    case 'pick-node':
      return I18N.phases.pick;
    case 'inspect-edge':
      return I18N.phases.inspect;
    case 'relax':
      return I18N.phases.update;
    case 'skip-relax':
      return I18N.phases.keep;
    case 'settle-node':
      return I18N.phases.lock;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.initialize;
  }
}
