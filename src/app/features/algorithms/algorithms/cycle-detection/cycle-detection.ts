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
import { graphLabel, graphSecondary } from '../graph-text';
import { RUNTIME_KEY } from '../../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.graph.cycleDetection;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.cycleDetection.descriptions.initialize'),
    cycleFound: t('features.algorithms.runtime.graph.cycleDetection.descriptions.cycleFound'),
    acyclic: t('features.algorithms.runtime.graph.cycleDetection.descriptions.acyclic'),
    enter: t('features.algorithms.runtime.graph.cycleDetection.descriptions.enter'),
    inspect: t('features.algorithms.runtime.graph.cycleDetection.descriptions.inspect'),
    descend: t('features.algorithms.runtime.graph.cycleDetection.descriptions.descend'),
    backEdge: t('features.algorithms.runtime.graph.cycleDetection.descriptions.backEdge'),
    closed: t('features.algorithms.runtime.graph.cycleDetection.descriptions.closed'),
    leave: t('features.algorithms.runtime.graph.cycleDetection.descriptions.leave'),
  },
  results: {
    new: t('features.algorithms.runtime.graph.cycleDetection.results.new'),
    stack: t('features.algorithms.runtime.graph.cycleDetection.results.stack'),
    done: t('features.algorithms.runtime.graph.cycleDetection.results.done'),
    cycle: t('features.algorithms.runtime.graph.cycleDetection.results.cycle'),
  },
  phases: {
    enter: t('features.algorithms.runtime.graph.cycleDetection.phases.enter'),
    inspect: t('features.algorithms.runtime.graph.cycleDetection.phases.inspect'),
    descend: t('features.algorithms.runtime.graph.cycleDetection.phases.descend'),
    evaluate: t('features.algorithms.runtime.graph.cycleDetection.phases.evaluate'),
    leave: t('features.algorithms.runtime.graph.cycleDetection.phases.leave'),
    complete: t('features.algorithms.runtime.graph.cycleDetection.phases.complete'),
    initialize: t('features.algorithms.runtime.graph.cycleDetection.phases.initialize'),
  },
} as const;

type ColorState = 'new' | 'stack' | 'done';

const COLOR_STATES: Readonly<Record<ColorState, TranslatableText>> = {
  new: graphSecondary('new'),
  stack: graphSecondary('onStack'),
  done: graphSecondary('done'),
};

const COLOR_RESULTS: Readonly<Record<ColorState, TranslatableText>> = {
  new: i18nText(I18N.results.new),
  stack: i18nText(I18N.results.stack),
  done: i18nText(I18N.results.done),
};

export function* cycleDetectionGenerator(graph: WeightedGraphData): Generator<SortStep> {
  const labelMap = new Map(graph.nodes.map((node) => [node.id, node.label]));
  const depthMap = new Map<string, number | null>(graph.nodes.map((node) => [node.id, null]));
  const previousMap = new Map<string, string | null>(graph.nodes.map((node) => [node.id, null]));
  const colorMap = new Map<string, ColorState>(graph.nodes.map((node) => [node.id, 'new']));
  const closed = new Set<string>();
  const stack: string[] = [];
  const order: string[] = [];
  let cyclePath: string | null = null;
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
    description: i18nText(I18N.descriptions.initialize),
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
      ? i18nText(I18N.descriptions.cycleFound, { path: cyclePath })
      : i18nText(I18N.descriptions.acyclic),
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
      description: i18nText(I18N.descriptions.enter, { node: labelOf(labelMap, nodeId) }),
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
        description: i18nText(I18N.descriptions.inspect, { from: labelOf(labelMap, nodeId), to: labelOf(labelMap, neighborId) }),
        activeCodeLine: 12,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: COLOR_STATES[color],
          result: COLOR_RESULTS[color],
          decision:
            color === 'new'
              ? i18nText(TEXT.decisions.visitNeighbor)
              : color === 'stack'
                ? i18nText(TEXT.decisions.backEdgeFound)
                : i18nText(TEXT.decisions.alreadyClosed),
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
          description: i18nText(I18N.descriptions.descend, { node: labelOf(labelMap, neighborId), from: labelOf(labelMap, nodeId) }),
          activeCodeLine: 15,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: COLOR_STATES.new,
            result: COLOR_RESULTS.stack,
            decision: i18nText(TEXT.decisions.descend),
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
          description: i18nText(I18N.descriptions.backEdge, { node: labelOf(labelMap, neighborId) }),
          activeCodeLine: 13,
          phase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelMap, neighborId),
            expression: COLOR_STATES.stack,
            result: i18nText(I18N.results.cycle),
            decision: cyclePath ?? '',
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
        description: i18nText(I18N.descriptions.closed, { node: labelOf(labelMap, neighborId) }),
        activeCodeLine: 14,
        phase: 'skip-relax',
        computation: {
          candidateLabel: labelOf(labelMap, neighborId),
          expression: COLOR_STATES.done,
          result: COLOR_RESULTS.done,
          decision: i18nText(TEXT.decisions.ignoreClosed),
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
      description: i18nText(I18N.descriptions.leave, { node: labelOf(labelMap, nodeId) }),
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
  readonly cyclePath: string | null;
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
  const frontierSet = new Set(args.stack);

  const nodes: GraphNodeSnapshot[] = args.graph.nodes.map((node) => {
    const state = args.colorMap.get(node.id) ?? 'new';
    return {
      ...node,
      distance: args.depthMap.get(node.id) ?? null,
      previousId: args.previousMap.get(node.id) ?? null,
      secondaryText: COLOR_STATES[state],
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
      phaseLabel: i18nText(phaseLabel(args.phase)),
      metricLabel: graphLabel('depth'),
      secondaryLabel: graphLabel('state'),
      frontierLabel: graphLabel('recursionStack'),
      frontierHeadLabel: graphLabel('stackTop'),
      completionLabel: graphLabel('closed'),
      frontierStatusLabel: graphLabel('statusStacked'),
      completionStatusLabel: graphLabel('statusClosed'),
      showEdgeWeights: false,
      detailLabel: graphLabel('cycle'),
      detailValue: args.cyclePath ?? i18nText(TEXT.details.searching),
      visitOrderLabel: graphLabel('closedOrder'),
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
      return I18N.phases.enter;
    case 'inspect-edge':
      return I18N.phases.inspect;
    case 'relax':
      return I18N.phases.descend;
    case 'skip-relax':
      return I18N.phases.evaluate;
    case 'settle-node':
      return I18N.phases.leave;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.initialize;
  }
}
