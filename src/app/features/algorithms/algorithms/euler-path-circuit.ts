import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
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
import { graphLabel, graphSecondary } from './graph-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.graph.eulerTrail;

const I18N = {
  descriptions: {
    circuitStart: t('features.algorithms.runtime.graph.eulerTrail.descriptions.circuitStart'),
    pathStart: t('features.algorithms.runtime.graph.eulerTrail.descriptions.pathStart'),
    inspectTop: t('features.algorithms.runtime.graph.eulerTrail.descriptions.inspectTop'),
    chooseEdge: t('features.algorithms.runtime.graph.eulerTrail.descriptions.chooseEdge'),
    traverse: t('features.algorithms.runtime.graph.eulerTrail.descriptions.traverse'),
    sealCircuit: t('features.algorithms.runtime.graph.eulerTrail.descriptions.sealCircuit'),
    sealPath: t('features.algorithms.runtime.graph.eulerTrail.descriptions.sealPath'),
    completeCircuit: t('features.algorithms.runtime.graph.eulerTrail.descriptions.completeCircuit'),
    completePath: t('features.algorithms.runtime.graph.eulerTrail.descriptions.completePath'),
  },
  results: {
    circuit: t('features.algorithms.runtime.graph.eulerTrail.results.circuit'),
    path: t('features.algorithms.runtime.graph.eulerTrail.results.path'),
    backtrack: t('features.algorithms.runtime.graph.eulerTrail.results.backtrack'),
    unused: t('features.algorithms.runtime.graph.eulerTrail.results.unused'),
  },
  phases: {
    prepare: t('features.algorithms.runtime.graph.eulerTrail.phases.prepare'),
    inspectTop: t('features.algorithms.runtime.graph.eulerTrail.phases.inspectTop'),
    chooseEdge: t('features.algorithms.runtime.graph.eulerTrail.phases.chooseEdge'),
    extend: t('features.algorithms.runtime.graph.eulerTrail.phases.extend'),
    backtrack: t('features.algorithms.runtime.graph.eulerTrail.phases.backtrack'),
    complete: t('features.algorithms.runtime.graph.eulerTrail.phases.complete'),
    step: t('features.algorithms.runtime.graph.eulerTrail.phases.step'),
  },
} as const;

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
  const isCircuit = oddNodeIds.length === 0;
  const trailKind = graphLabel(isCircuit ? 'eulerCircuit' : 'eulerPath');
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
        ? i18nText(I18N.descriptions.circuitStart, { node: labelOf(labelById, startId) })
        : i18nText(I18N.descriptions.pathStart, { start: labelOf(labelById, startId), end: labelOf(labelById, endId) }),
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: i18nText(oddNodeIds.length === 0 ? TEXT.decisions.degreeCheck : TEXT.decisions.oddEndpoints),
      expression:
        oddNodeIds.length === 0
          ? i18nText(TEXT.decisions.allEven)
          : i18nText(TEXT.decisions.oddPair, { start: labelOf(labelById, startId), end: labelOf(labelById, endId) }),
      result: i18nText(isCircuit ? I18N.results.circuit : I18N.results.path),
      decision: i18nText(TEXT.decisions.plan),
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
      description: i18nText(I18N.descriptions.inspectTop, { node: labelOf(labelById, currentNodeId) }),
      activeCodeLine: 4,
      phase: 'pick-node',
      computation: {
        candidateLabel: labelOf(labelById, currentNodeId),
        expression: i18nText(TEXT.decisions.unusedIncident, { count: available.length }),
        result: available.length > 0 ? labelOf(labelById, available[0]!.neighborId) : i18nText(I18N.results.backtrack),
        decision: available.length > 0 ? i18nText(TEXT.decisions.extend) : i18nText(TEXT.decisions.seal),
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
        description: i18nText(I18N.descriptions.chooseEdge, { from: labelOf(labelById, currentNodeId), to: labelOf(labelById, next.neighborId) }),
        activeCodeLine: 5,
        phase: 'inspect-edge',
        computation: {
          candidateLabel: labelOf(labelById, currentNodeId),
          expression: `${labelOf(labelById, currentNodeId)} → ${labelOf(labelById, next.neighborId)}`,
          result: i18nText(I18N.results.unused),
          decision: i18nText(TEXT.decisions.traverse),
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
        description: i18nText(I18N.descriptions.traverse, { from: labelOf(labelById, currentNodeId), to: labelOf(labelById, next.neighborId) }),
        activeCodeLine: 6,
        phase: 'relax',
        computation: {
          candidateLabel: labelOf(labelById, next.neighborId),
          expression: i18nText(TEXT.decisions.stackDepth, { depth: stack.length - 1 }),
          result: String(stack.length),
          decision: i18nText(TEXT.decisions.keepWalking),
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
      description: i18nText(isCircuit ? I18N.descriptions.sealCircuit : I18N.descriptions.sealPath, { node: labelOf(labelById, sealedNodeId) }),
      activeCodeLine: 8,
      phase: 'settle-node',
      computation: {
        candidateLabel: labelOf(labelById, sealedNodeId),
        expression: i18nText(TEXT.decisions.unusedIncident, { count: 0 }),
        result: describeTrail(trail, labelById),
        decision: i18nText(TEXT.decisions.fixSuffix),
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
    description: i18nText(isCircuit ? I18N.descriptions.completeCircuit : I18N.descriptions.completePath, { route: describeTrail(finalTrail, labelById) }),
    activeCodeLine: 9,
    phase: 'graph-complete',
    computation: {
      candidateLabel: trailKind,
      expression: i18nText(TEXT.decisions.allUsed, { count: graph.edges.length }),
      result: describeTrail(finalTrail, labelById),
      decision: i18nText(TEXT.decisions.finish),
    },
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly startId: string;
  readonly endId: string;
  readonly trailKind: TranslatableText;
  readonly degreeByNode: ReadonlyMap<string, number>;
  readonly adjacency: ReadonlyMap<string, readonly EulerAdjacencyEntry[]>;
  readonly usedEdgeIds: ReadonlySet<string>;
  readonly stack: readonly string[];
  readonly trail: readonly string[];
  readonly description: TranslatableText;
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
          ? graphSecondary('startFinish')
          : graphSecondary('start')
        : node.id === args.endId
          ? graphSecondary('finish')
          : node.id === currentNodeId && nextNeighbor
            ? graphSecondary('next', { node: labelOf(labelById, nextNeighbor) })
            : remaining === 0 && sealedSet.has(node.id)
              ? graphSecondary('sealed')
              : graphSecondary('used', { used: usedCountByNode.get(node.id) ?? 0, total }),
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
    phaseLabel: i18nText(phaseLabel(args.phase)),
    metricLabel: graphLabel('unused'),
    secondaryLabel: graphLabel('state'),
    frontierLabel: graphLabel('stack'),
    frontierHeadLabel: graphLabel('top'),
    completionLabel: graphLabel('sealed'),
    frontierStatusLabel: graphLabel('statusStacked'),
    completionStatusLabel: graphLabel('statusSealed'),
    showEdgeWeights: false,
    detailLabel: args.trailKind,
    detailValue:
      displayTrail.length > 0
        ? describeTrail(displayTrail, labelById)
        : i18nText(TEXT.details.trailPending),
    visitOrderLabel: graphLabel('finalTrail'),
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
      return I18N.phases.prepare;
    case 'pick-node':
      return I18N.phases.inspectTop;
    case 'inspect-edge':
      return I18N.phases.chooseEdge;
    case 'relax':
      return I18N.phases.extend;
    case 'settle-node':
      return I18N.phases.backtrack;
    case 'graph-complete':
      return I18N.phases.complete;
    default:
      return I18N.phases.step;
  }
}
