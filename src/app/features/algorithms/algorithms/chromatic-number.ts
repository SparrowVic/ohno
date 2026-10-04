import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
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
import { graphLabel, graphSecondary } from './graph-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.graph.chromaticNumber;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.initialize'),
    tryPalette: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.tryPalette'),
    paletteFailed: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.paletteFailed'),
    complete: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.complete'),
    pick: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.pick'),
    test: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.test'),
    assign: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.assign'),
    backtrack: t('features.algorithms.runtime.graph.chromaticNumber.descriptions.backtrack'),
  },
  results: {
    startWith: t('features.algorithms.runtime.graph.chromaticNumber.results.startWith'),
    palette: t('features.algorithms.runtime.graph.chromaticNumber.results.palette'),
    candidates: t('features.algorithms.runtime.graph.chromaticNumber.results.candidates'),
    conflict: t('features.algorithms.runtime.graph.chromaticNumber.results.conflict'),
    fail: t('features.algorithms.runtime.graph.chromaticNumber.results.fail'),
    legal: t('features.algorithms.runtime.graph.chromaticNumber.results.legal'),
    undo: t('features.algorithms.runtime.graph.chromaticNumber.results.undo'),
  },
  phases: {
    order: t('features.algorithms.runtime.graph.chromaticNumber.phases.order'),
    select: t('features.algorithms.runtime.graph.chromaticNumber.phases.select'),
    test: t('features.algorithms.runtime.graph.chromaticNumber.phases.test'),
    commit: t('features.algorithms.runtime.graph.chromaticNumber.phases.commit'),
    backtrack: t('features.algorithms.runtime.graph.chromaticNumber.phases.backtrack'),
    decision: t('features.algorithms.runtime.graph.chromaticNumber.phases.decision'),
    step: t('features.algorithms.runtime.graph.chromaticNumber.phases.step'),
  },
} as const;

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
    description: i18nText(I18N.descriptions.initialize, { count: startLimit }),
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: i18nText(TEXT.decisions.lowerBound),
      expression: `ω(G) = ${cliqueLowerBound}`,
      result: i18nText(I18N.results.startWith, { count: startLimit }),
      decision: i18nText(TEXT.decisions.cliqueBound),
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
      description: i18nText(I18N.descriptions.tryPalette, { count: limit }),
      activeCodeLine: 3,
      phase: 'pick-node',
      computation: {
        candidateLabel: `χ ≤ ${limit}`,
        expression: i18nText(TEXT.decisions.nodeCount, { count: order.length }),
        result: i18nText(I18N.results.palette, { count: limit }),
        decision: i18nText(TEXT.decisions.backtrackPlan),
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
      description: i18nText(I18N.descriptions.paletteFailed, { count: limit }),
      activeCodeLine: 8,
      phase: 'graph-complete',
      computation: {
        candidateLabel: `χ ≤ ${limit}`,
        expression: i18nText(TEXT.decisions.exhausted),
        result: i18nText(I18N.results.fail),
        decision: i18nText(TEXT.decisions.needMore),
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
    description: i18nText(I18N.descriptions.complete, { count: bestK ?? COLOR_TONES.length }),
    activeCodeLine: 9,
    phase: 'graph-complete',
    computation: {
      candidateLabel: i18nText(TEXT.decisions.chromaticNumber),
      expression: `χ(G) = ${bestK ?? COLOR_TONES.length}`,
      result: colorSummary(order, colorByNode, labelById),
      decision: i18nText(TEXT.decisions.smallestPalette),
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
      description: i18nText(I18N.descriptions.pick, { node: nodeLabel }),
      activeCodeLine: 4,
      phase: 'pick-node',
      computation: {
        candidateLabel: nodeLabel,
        expression: i18nText(TEXT.decisions.forbidden, { colors: `{${[...forbidden].sort((a, b) => a - b).join(', ')}}` }),
        result: i18nText(I18N.results.candidates, { count: limit - forbidden.size }),
        decision: i18nText(TEXT.decisions.tryPalette),
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
        description: i18nText(I18N.descriptions.test, { color, node: nodeLabel }),
        activeCodeLine: 5,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: nodeLabel,
          expression: i18nText(TEXT.decisions.tryColor, { color }),
          result: conflictNeighborId ? i18nText(I18N.results.conflict, { node: labelById.get(conflictNeighborId) ?? conflictNeighborId }) : i18nText(I18N.results.legal),
          decision: conflictNeighborId ? i18nText(TEXT.decisions.rejectColor) : i18nText(TEXT.decisions.commitColor),
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
        description: i18nText(I18N.descriptions.assign, { color, node: nodeLabel }),
        activeCodeLine: 6,
        phase: 'relax',
        computation: {
          candidateLabel: nodeLabel,
          expression: `${nodeLabel} = ${color}`,
          result: colorSummary(stack, colorByNode, labelById),
          decision: i18nText(TEXT.decisions.partialValid),
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
        description: i18nText(I18N.descriptions.backtrack, { node: nodeLabel, color }),
        activeCodeLine: 7,
        phase: 'settle-node',
        computation: {
          candidateLabel: nodeLabel,
          expression: `${nodeLabel} = ${color}`,
          result: i18nText(I18N.results.undo),
          decision: i18nText(TEXT.decisions.branchDead),
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
  readonly description: TranslatableText;
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
      secondaryText: color !== null ? `c${color}` : graphSecondary('degree', { degree }),
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
    phaseLabel: i18nText(phaseLabel(args.phase)),
    metricLabel: graphLabel('color'),
    secondaryLabel: graphLabel('state'),
    frontierLabel: graphLabel('uncolored'),
    frontierHeadLabel: graphLabel('nextNode'),
    completionLabel: graphLabel('colored'),
    frontierStatusLabel: graphLabel('statusPending'),
    completionStatusLabel: graphLabel('statusColored'),
    showEdgeWeights: false,
    detailLabel: graphLabel('colorSearch'),
    detailValue: args.bestK
      ? `χ(G) = ${args.bestK}`
      : i18nText(TEXT.details.trying, { limit: args.limit, bound: args.cliqueLowerBound }),
    visitOrderLabel: graphLabel('colorStack'),
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
      return I18N.phases.order;
    case 'pick-node':
      return I18N.phases.select;
    case 'inspect-edge':
      return I18N.phases.test;
    case 'relax':
      return I18N.phases.commit;
    case 'settle-node':
      return I18N.phases.backtrack;
    case 'graph-complete':
      return I18N.phases.decision;
    default:
      return I18N.phases.step;
  }
}
