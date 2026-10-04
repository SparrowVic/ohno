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
import { graphLabel } from '../graph-text';
import { RUNTIME_KEY } from '../../../../core/i18n/i18n-keys';

const GRAPH_TEXT = RUNTIME_KEY.graph.common;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.bellmanFord.descriptions.initialize'),
    startPass: t('features.algorithms.runtime.graph.bellmanFord.descriptions.startPass'),
    inspect: t('features.algorithms.runtime.graph.bellmanFord.descriptions.inspect'),
    unreachable: t('features.algorithms.runtime.graph.bellmanFord.descriptions.unreachable'),
    relax: t('features.algorithms.runtime.graph.bellmanFord.descriptions.relax'),
    keep: t('features.algorithms.runtime.graph.bellmanFord.descriptions.keep'),
    passUpdated: t('features.algorithms.runtime.graph.bellmanFord.descriptions.passUpdated'),
    passStable: t('features.algorithms.runtime.graph.bellmanFord.descriptions.passStable'),
    negativeEvidence: t('features.algorithms.runtime.graph.bellmanFord.descriptions.negativeEvidence'),
    negativeCycle: t('features.algorithms.runtime.graph.bellmanFord.descriptions.negativeCycle'),
    complete: t('features.algorithms.runtime.graph.bellmanFord.descriptions.complete'),
  },
  phases: {
    startPass: t('features.algorithms.runtime.graph.bellmanFord.phases.startPass'),
    inspect: t('features.algorithms.runtime.graph.bellmanFord.phases.inspect'),
    relax: t('features.algorithms.runtime.graph.bellmanFord.phases.relax'),
    negativeEvidence: t('features.algorithms.runtime.graph.bellmanFord.phases.negativeEvidence'),
    keep: t('features.algorithms.runtime.graph.bellmanFord.phases.keep'),
    closePass: t('features.algorithms.runtime.graph.bellmanFord.phases.closePass'),
    negativeCycle: t('features.algorithms.runtime.graph.bellmanFord.phases.negativeCycle'),
    stable: t('features.algorithms.runtime.graph.bellmanFord.phases.stable'),
    initialize: t('features.algorithms.runtime.graph.bellmanFord.phases.initialize'),
  },
} as const;

export function* bellmanFordGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const distanceMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const reached = new Set<string>();
  const visitOrder: TranslatableText[] = [];
  const maxPasses = Math.max(0, graph.nodes.length - 1);
  let frontier = new Set<string>([graph.sourceId]);
  let currentPass = 0;
  let negativeCycleEdgeId: string | null = null;

  distanceMap.set(graph.sourceId, 0);
  reached.add(graph.sourceId);

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    reached,
    frontier,
    visitOrder,
    currentPass,
    maxPasses,
    description: i18nText(I18N.descriptions.initialize, { source: labelOf(labelMap, graph.sourceId) }),
    activeCodeLine: 2,
    phase: 'init',
    negativeCycleEdgeId,
  });

  for (let pass = 1; pass <= maxPasses; pass++) {
    currentPass = pass;
    let relaxedInPass = false;
    frontier = new Set<string>();

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      reached,
      frontier,
      visitOrder,
      currentPass,
      maxPasses,
      description: i18nText(I18N.descriptions.startPass, { pass }),
      activeCodeLine: 5,
      phase: 'pick-node',
      negativeCycleEdgeId,
    });

    for (const edge of graph.edges) {
      const fromDistance = distanceMap.get(edge.from) ?? null;
      const toDistance = distanceMap.get(edge.to) ?? null;
      const candidate = fromDistance === null ? null : fromDistance + edge.weight;

      yield createStep({
        graph,
        distanceMap,
        previousMap,
        reached,
        frontier,
        visitOrder,
        currentPass,
        maxPasses,
        currentNodeId: edge.from,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.inspect, { from: labelOf(labelMap, edge.from), to: labelOf(labelMap, edge.to), weight: edge.weight }),
        activeCodeLine: 7,
        phase: 'inspect-edge',
        negativeCycleEdgeId,
        computation: {
          candidateLabel: labelOf(labelMap, edge.to),
          expression: fromDistance === null ? `∞ + ${edge.weight}` : `${fromDistance} + ${edge.weight}`,
          result: candidate === null ? '∞' : `${candidate}`,
          decision:
            fromDistance === null
              ? i18nText(GRAPH_TEXT.sourceUnreachable)
              : toDistance === null
                ? i18nText(GRAPH_TEXT.betterThan, { value: '∞' })
                : `${candidate} < ${toDistance}`,
        },
      });

      if (fromDistance === null || candidate === null) {
        yield createStep({
          graph,
          distanceMap,
          previousMap,
          reached,
          frontier,
          visitOrder,
          currentPass,
          maxPasses,
          currentNodeId: edge.from,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.unreachable, { node: labelOf(labelMap, edge.to), from: labelOf(labelMap, edge.from) }),
          activeCodeLine: 8,
          phase: 'skip-relax',
          negativeCycleEdgeId,
          computation: {
            candidateLabel: labelOf(labelMap, edge.to),
            expression: `∞ + ${edge.weight}`,
            result: '∞',
            decision: i18nText(GRAPH_TEXT.keepUnreachable),
          },
        });
        continue;
      }

      if (toDistance === null || candidate < toDistance) {
        distanceMap.set(edge.to, candidate);
        previousMap.set(edge.to, edge.from);
        frontier.add(edge.to);
        reached.add(edge.to);
        relaxedInPass = true;

        yield createStep({
          graph,
          distanceMap,
          previousMap,
          reached,
          frontier,
          visitOrder,
          currentPass,
          maxPasses,
          currentNodeId: edge.from,
          activeEdgeId: edge.id,
          relaxedEdgeId: edge.id,
          description: i18nText(I18N.descriptions.relax, { node: labelOf(labelMap, edge.to), distance: candidate, via: labelOf(labelMap, edge.from) }),
          activeCodeLine: 9,
          phase: 'relax',
          negativeCycleEdgeId,
          computation: {
            candidateLabel: labelOf(labelMap, edge.to),
            expression: `${fromDistance} + ${edge.weight}`,
            result: `${candidate}`,
            decision: toDistance === null ? i18nText(GRAPH_TEXT.firstFiniteDistance) : i18nText(GRAPH_TEXT.betterThan, { value: toDistance }),
          },
        });
      } else {
        yield createStep({
          graph,
          distanceMap,
          previousMap,
          reached,
          frontier,
          visitOrder,
          currentPass,
          maxPasses,
          currentNodeId: edge.from,
          activeEdgeId: edge.id,
          description: i18nText(I18N.descriptions.keep, { node: labelOf(labelMap, edge.to) }),
          activeCodeLine: 8,
          phase: 'skip-relax',
          negativeCycleEdgeId,
          computation: {
            candidateLabel: labelOf(labelMap, edge.to),
            expression: `${fromDistance} + ${edge.weight}`,
            result: `${candidate}`,
            decision: i18nText(GRAPH_TEXT.keep, { value: toDistance }),
          },
        });
      }
    }

    visitOrder.push(i18nText(GRAPH_TEXT.passLabel, { pass }));

    yield createStep({
      graph,
      distanceMap,
      previousMap,
      reached,
      frontier,
      visitOrder,
      currentPass,
      maxPasses,
      description: relaxedInPass
        ? i18nText(I18N.descriptions.passUpdated, { pass })
        : i18nText(I18N.descriptions.passStable, { pass }),
      activeCodeLine: 12,
      phase: 'settle-node',
      negativeCycleEdgeId,
    });

    if (!relaxedInPass) {
      break;
    }
  }

  for (const edge of graph.edges) {
    const fromDistance = distanceMap.get(edge.from) ?? null;
    const toDistance = distanceMap.get(edge.to) ?? null;
    if (fromDistance === null) continue;
    const candidate = fromDistance + edge.weight;
    if (toDistance === null || candidate < toDistance) {
      negativeCycleEdgeId = edge.id;

      yield createStep({
        graph,
        distanceMap,
        previousMap,
        reached,
        frontier: new Set([edge.to]),
        visitOrder,
        currentPass,
        maxPasses,
        currentNodeId: edge.from,
        activeEdgeId: edge.id,
        description: i18nText(I18N.descriptions.negativeEvidence, { node: labelOf(labelMap, edge.to) }),
        activeCodeLine: 14,
        phase: 'skip-relax',
        negativeCycleEdgeId,
        computation: {
          candidateLabel: labelOf(labelMap, edge.to),
          expression: `${fromDistance} + ${edge.weight}`,
          result: `${candidate}`,
          decision: i18nText(GRAPH_TEXT.stillBetterThan, { value: toDistance ?? '∞' }),
        },
      });
      break;
    }
  }

  yield createStep({
    graph,
    distanceMap,
    previousMap,
    reached,
    frontier: negativeCycleEdgeId ? new Set<string>() : frontier,
    visitOrder,
    currentPass,
    maxPasses,
    description: negativeCycleEdgeId
      ? i18nText(I18N.descriptions.negativeCycle)
      : i18nText(I18N.descriptions.complete),
    activeCodeLine: 16,
    phase: 'graph-complete',
    negativeCycleEdgeId,
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly distanceMap: ReadonlyMap<string, number | null>;
  readonly previousMap: ReadonlyMap<string, string | null>;
  readonly reached: ReadonlySet<string>;
  readonly frontier: ReadonlySet<string>;
  readonly visitOrder: readonly TranslatableText[];
  readonly currentPass: number;
  readonly maxPasses: number;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase: SortStep['phase'];
  readonly negativeCycleEdgeId: string | null;
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
      ? labelOf(labelMap, args.previousMap.get(node.id) as string)
      : null,
    isSource: node.id === args.graph.sourceId,
    isCurrent: node.id === currentNodeId,
    isSettled: args.reached.has(node.id),
    isFrontier: args.frontier.has(node.id),
  }));

  const edges: GraphEdgeSnapshot[] = args.graph.edges.map((edge) => ({
    ...edge,
    isActive: edge.id === activeEdgeId,
    isRelaxed: edge.id === relaxedEdgeId,
    isTree: args.previousMap.get(edge.to) === edge.from,
    tone: edge.id === args.negativeCycleEdgeId ? 'critical' : null,
  }));

  const queue = buildQueue(nodes, args.frontier);
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
      phaseLabel: phaseLabel(args.phase, args.currentPass, args.maxPasses, args.negativeCycleEdgeId !== null),
      metricLabel: graphLabel('distance'),
      secondaryLabel: graphLabel('previous'),
      frontierLabel: graphLabel('updatedThisPass'),
      frontierHeadLabel: graphLabel('latestUpdate'),
      completionLabel: graphLabel('reached'),
      frontierStatusLabel: graphLabel('statusUpdated'),
      completionStatusLabel: graphLabel('statusReached'),
      showEdgeWeights: true,
      detailLabel: graphLabel('path'),
      detailValue: i18nText(GRAPH_TEXT.passOf, { pass: Math.max(args.currentPass, 0), total: args.maxPasses }),
      visitOrderLabel: graphLabel('passLog'),
      currentNodeId,
      activeEdgeId,
      queue,
      visitOrder: [...args.visitOrder],
      traceRows,
      computation: args.computation ?? null,
    },
  };
}

function buildQueue(nodes: readonly GraphNodeSnapshot[], frontier: ReadonlySet<string>): GraphQueueEntry[] {
  return nodes
    .filter((node) => frontier.has(node.id))
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

function labelOf(map: ReadonlyMap<string, string>, nodeId: string): string {
  return map.get(nodeId) ?? nodeId;
}

function phaseLabel(
  phase: SortStep['phase'],
  currentPass: number,
  maxPasses: number,
  hasNegativeCycle: boolean,
): TranslatableText {
  switch (phase) {
    case 'pick-node':
      return i18nText(I18N.phases.startPass, { pass: currentPass });
    case 'inspect-edge':
      return i18nText(I18N.phases.inspect, { pass: currentPass });
    case 'relax':
      return i18nText(I18N.phases.relax);
    case 'skip-relax':
      return i18nText(hasNegativeCycle ? I18N.phases.negativeEvidence : I18N.phases.keep);
    case 'settle-node':
      return i18nText(I18N.phases.closePass, { pass: currentPass });
    case 'graph-complete':
      return hasNegativeCycle
        ? i18nText(I18N.phases.negativeCycle)
        : i18nText(I18N.phases.stable, { passes: Math.min(currentPass, maxPasses) });
    default:
      return i18nText(I18N.phases.initialize);
  }
}
