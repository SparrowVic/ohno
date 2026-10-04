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
} from '../models/graph';
import { SortStep } from '../models/sort-step';
import { graphLabel } from './graph-text';
import { RUNTIME_KEY } from '../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.graph.dominatorTree;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.graph.dominatorTree.descriptions.initialize'),
    pick: t('features.algorithms.runtime.graph.dominatorTree.descriptions.pick'),
    intersect: t('features.algorithms.runtime.graph.dominatorTree.descriptions.intersect'),
    shrink: t('features.algorithms.runtime.graph.dominatorTree.descriptions.shrink'),
    stable: t('features.algorithms.runtime.graph.dominatorTree.descriptions.stable'),
    immediate: t('features.algorithms.runtime.graph.dominatorTree.descriptions.immediate'),
    complete: t('features.algorithms.runtime.graph.dominatorTree.descriptions.complete'),
  },
  results: {
    othersAll: t('features.algorithms.runtime.graph.dominatorTree.results.othersAll'),
    unchanged: t('features.algorithms.runtime.graph.dominatorTree.results.unchanged'),
    entry: t('features.algorithms.runtime.graph.dominatorTree.results.entry'),
    treeReady: t('features.algorithms.runtime.graph.dominatorTree.results.treeReady'),
  },
  phases: {
    seed: t('features.algorithms.runtime.graph.dominatorTree.phases.seed'),
    pick: t('features.algorithms.runtime.graph.dominatorTree.phases.pick'),
    intersect: t('features.algorithms.runtime.graph.dominatorTree.phases.intersect'),
    shrink: t('features.algorithms.runtime.graph.dominatorTree.phases.shrink'),
    stable: t('features.algorithms.runtime.graph.dominatorTree.phases.stable'),
    immediate: t('features.algorithms.runtime.graph.dominatorTree.phases.immediate'),
    complete: t('features.algorithms.runtime.graph.dominatorTree.phases.complete'),
    step: t('features.algorithms.runtime.graph.dominatorTree.phases.step'),
  },
} as const;

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
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 2,
    phase: 'init',
    computation: {
      candidateLabel: labelOf(labelById, graph.sourceId),
      expression: `${labelOf(labelById, graph.sourceId)} = {${labelOf(labelById, graph.sourceId)}}`,
      result: i18nText(I18N.results.othersAll),
      decision: i18nText(TEXT.decisions.iterate),
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
        description: i18nText(I18N.descriptions.pick, { node: labelOf(labelById, nodeId) }),
        activeCodeLine: 4,
        phase: 'pick-node',
        computation: {
          candidateLabel: labelOf(labelById, nodeId),
          expression: predecessorLabel(preds, labelById),
          result: setLabel(intersection, labelById),
          decision: i18nText(TEXT.decisions.startPredecessor),
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
          description: i18nText(I18N.descriptions.intersect, { node: labelOf(labelById, predId) }),
          activeCodeLine: 5,
          phase: 'inspect-edge',
          computation: {
            candidateLabel: labelOf(labelById, nodeId),
            expression: `${setLabel(intersection, labelById)} ∩ ${setLabel(predSet, labelById)}`,
            result: setLabel(nextIntersection, labelById),
            decision: i18nText(TEXT.decisions.commonBlocks),
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
          description: i18nText(I18N.descriptions.shrink, { node: labelOf(labelById, nodeId) }),
          activeCodeLine: 6,
          phase: 'relax',
          computation: {
            candidateLabel: labelOf(labelById, nodeId),
            expression: `${setLabel(intersection, labelById)} ∪ {${labelOf(labelById, nodeId)}}`,
            result: setLabel(nextSet, labelById),
            decision: i18nText(TEXT.decisions.setChanged),
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
          description: i18nText(I18N.descriptions.stable, { node: labelOf(labelById, nodeId) }),
          activeCodeLine: 6,
          phase: 'skip-relax',
          computation: {
            candidateLabel: labelOf(labelById, nodeId),
            expression: setLabel(nextSet, labelById),
            result: i18nText(I18N.results.unchanged),
            decision: i18nText(TEXT.decisions.stable),
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
      description: i18nText(I18N.descriptions.immediate, { node: labelOf(labelById, nodeId) }),
      activeCodeLine: 8,
      phase: 'settle-node',
      computation: {
        candidateLabel: labelOf(labelById, nodeId),
        expression: setLabel(new Set(strictDominators), labelById),
        result: immediate ? labelOf(labelById, immediate) : i18nText(I18N.results.entry),
        decision: i18nText(TEXT.decisions.immediateParent),
      },
    });
  }

  yield createStep({
    graph,
    domSets,
    idomByNode,
    queueOrder,
    currentPass: pass,
    description: i18nText(I18N.descriptions.complete),
    activeCodeLine: 9,
    phase: 'graph-complete',
    computation: {
      candidateLabel: graphLabel('immediateDominators'),
      expression: queueOrder.map((nodeId) => `${labelOf(labelById, nodeId)}←${labelOf(labelById, idomByNode.get(nodeId) ?? graph.sourceId)}`).join(' · '),
      result: i18nText(I18N.results.treeReady),
      decision: i18nText(TEXT.decisions.treeDone),
    },
  });
}

function createStep(args: {
  readonly graph: WeightedGraphData;
  readonly domSets: ReadonlyMap<string, ReadonlySet<string>>;
  readonly idomByNode: ReadonlyMap<string, string | null>;
  readonly queueOrder: readonly string[];
  readonly currentPass: number;
  readonly description: TranslatableText;
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
    metricLabel: graphLabel('dominatorCount'),
    secondaryLabel: graphLabel('idomSet'),
    frontierLabel: graphLabel('worklist'),
    frontierHeadLabel: graphLabel('nextBlock'),
    completionLabel: graphLabel('fixed'),
    frontierStatusLabel: graphLabel('statusPending'),
    completionStatusLabel: graphLabel('statusFixed'),
    showEdgeWeights: false,
    detailLabel: graphLabel('dominatorTree'),
    detailValue: i18nText(RUNTIME_KEY.graph.common.passLabel, { pass: args.currentPass }),
    visitOrderLabel: graphLabel('immediateDominators'),
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

function phaseLabel(phase: SortStep['phase'], pass: number): TranslatableText {
  switch (phase) {
    case 'init':
      return i18nText(I18N.phases.seed);
    case 'pick-node':
      return i18nText(I18N.phases.pick, { pass });
    case 'inspect-edge':
      return i18nText(I18N.phases.intersect, { pass });
    case 'relax':
      return i18nText(I18N.phases.shrink, { pass });
    case 'skip-relax':
      return i18nText(I18N.phases.stable, { pass });
    case 'settle-node':
      return i18nText(I18N.phases.immediate);
    case 'graph-complete':
      return i18nText(I18N.phases.complete);
    default:
      return i18nText(I18N.phases.step);
  }
}
