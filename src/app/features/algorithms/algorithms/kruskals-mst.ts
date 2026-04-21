import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DsuEdgeTrace } from '../models/dsu';
import { SortStep } from '../models/sort-step';
import { KruskalScenario } from '../utils/dsu-scenarios/dsu-scenarios';
import { createDsuStep, DsuBaseNode } from './dsu-step';

const I18N = {
  statuses: {
    sortedEdgeScan: t('features.algorithms.runtime.dsu.kruskalsMst.statuses.sortedEdgeScan'),
    inspectNextEdge: t('features.algorithms.runtime.dsu.kruskalsMst.statuses.inspectNextEdge'),
    rejectCycleEdge: t('features.algorithms.runtime.dsu.kruskalsMst.statuses.rejectCycleEdge'),
    acceptEdge: t('features.algorithms.runtime.dsu.kruskalsMst.statuses.acceptEdge'),
    complete: t('features.algorithms.runtime.dsu.kruskalsMst.statuses.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dsu.kruskalsMst.descriptions.initialize'),
    inspectEdge: t('features.algorithms.runtime.dsu.kruskalsMst.descriptions.inspectEdge'),
    rejectEdge: t('features.algorithms.runtime.dsu.kruskalsMst.descriptions.rejectEdge'),
    acceptEdge: t('features.algorithms.runtime.dsu.kruskalsMst.descriptions.acceptEdge'),
    complete: t('features.algorithms.runtime.dsu.kruskalsMst.descriptions.complete'),
  },
  decisions: {
    acceptNextCheapest: t(
      'features.algorithms.runtime.dsu.kruskalsMst.decisions.acceptNextCheapest',
    ),
    rootCompare: t('features.algorithms.runtime.dsu.kruskalsMst.decisions.rootCompare'),
    shareRoot: t('features.algorithms.runtime.dsu.kruskalsMst.decisions.shareRoot'),
    treeWeightGrows: t('features.algorithms.runtime.dsu.kruskalsMst.decisions.treeWeightGrows'),
    pendingEdgesWorse: t(
      'features.algorithms.runtime.dsu.kruskalsMst.decisions.pendingEdgesWorse',
    ),
  },
  labels: {
    mstWeight: t('features.algorithms.runtime.dsu.kruskalsMst.labels.mstWeight'),
    acceptedEdges: t('features.algorithms.runtime.dsu.kruskalsMst.labels.acceptedEdges'),
    sortedEdges: t('features.algorithms.runtime.dsu.kruskalsMst.labels.sortedEdges'),
  },
} as const;

export function* kruskalsMstGenerator(scenario: KruskalScenario): Generator<SortStep> {
  const nodes: readonly DsuBaseNode[] = scenario.graph.nodes.map((node) => ({ id: node.id, label: node.label }));
  const parent = new Map<string, string>(nodes.map((node) => [node.id, node.id]));
  const rank = new Map<string, number>(nodes.map((node) => [node.id, 0]));
  const size = new Map<string, number>(nodes.map((node) => [node.id, 1]));
  const sortedEdges = [...scenario.graph.edges].sort((left, right) => {
    if (left.weight !== right.weight) return left.weight - right.weight;
    return left.id.localeCompare(right.id);
  });
  const statuses = new Map<string, DsuEdgeTrace['status']>(sortedEdges.map((edge) => [edge.id, 'pending']));
  let acceptedWeight = 0;
  let acceptedCount = 0;

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    edges: sortedEdges,
    statuses,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    statusLabel: I18N.statuses.sortedEdgeScan,
    decision: I18N.decisions.acceptNextCheapest,
    resultLabel: i18nText(I18N.labels.mstWeight, { weight: 0 }),
    operationsLabel: I18N.labels.sortedEdges,
  });

  for (const edge of sortedEdges) {
    statuses.set(edge.id, 'active');
    const leftRoot = findRoot(edge.from, parent);
    const rightRoot = findRoot(edge.to, parent);

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      edges: sortedEdges,
      statuses,
      description: i18nText(I18N.descriptions.inspectEdge, {
        from: labelOf(nodes, edge.from),
        to: labelOf(nodes, edge.to),
        weight: edge.weight,
      }),
      activeCodeLine: 5,
      statusLabel: I18N.statuses.inspectNextEdge,
      decision: i18nText(I18N.decisions.rootCompare, {
        from: labelOf(nodes, edge.from),
        fromRoot: labelOf(nodes, leftRoot),
        to: labelOf(nodes, edge.to),
        toRoot: labelOf(nodes, rightRoot),
      }),
      resultLabel: i18nText(I18N.labels.mstWeight, { weight: acceptedWeight }),
      operationsLabel: i18nText(I18N.labels.acceptedEdges, {
        count: acceptedCount,
        total: Math.max(0, nodes.length - 1),
      }),
      activeIds: [edge.from, edge.to],
      queryIds: [leftRoot, rightRoot],
    });

    if (leftRoot === rightRoot) {
      statuses.set(edge.id, 'rejected');
      yield createStep({
        nodes,
        parent,
        rank,
        size,
        edges: sortedEdges,
        statuses,
        description: i18nText(I18N.descriptions.rejectEdge, {
          from: labelOf(nodes, edge.from),
          to: labelOf(nodes, edge.to),
        }),
        activeCodeLine: 6,
        statusLabel: I18N.statuses.rejectCycleEdge,
        decision: I18N.decisions.shareRoot,
        resultLabel: i18nText(I18N.labels.mstWeight, { weight: acceptedWeight }),
        operationsLabel: i18nText(I18N.labels.acceptedEdges, {
          count: acceptedCount,
          total: Math.max(0, nodes.length - 1),
        }),
        activeIds: [leftRoot],
      });
      continue;
    }

    let attachRoot = leftRoot;
    let keepRoot = rightRoot;
    const leftRank = rank.get(leftRoot) ?? 0;
    const rightRank = rank.get(rightRoot) ?? 0;
    if (leftRank > rightRank || (leftRank === rightRank && leftRoot.localeCompare(rightRoot) < 0)) {
      attachRoot = rightRoot;
      keepRoot = leftRoot;
    }

    parent.set(attachRoot, keepRoot);
    size.set(keepRoot, (size.get(keepRoot) ?? 1) + (size.get(attachRoot) ?? 1));
    if (leftRank === rightRank) {
      rank.set(keepRoot, (rank.get(keepRoot) ?? 0) + 1);
    }
    statuses.set(edge.id, 'accepted');
    acceptedWeight += edge.weight;
    acceptedCount += 1;

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      edges: sortedEdges,
      statuses,
      description: i18nText(I18N.descriptions.acceptEdge, {
        from: labelOf(nodes, edge.from),
        to: labelOf(nodes, edge.to),
      }),
      activeCodeLine: 7,
      statusLabel: I18N.statuses.acceptEdge,
      decision: i18nText(I18N.decisions.treeWeightGrows, { weight: acceptedWeight }),
      resultLabel: i18nText(I18N.labels.mstWeight, { weight: acceptedWeight }),
      operationsLabel: i18nText(I18N.labels.acceptedEdges, {
        count: acceptedCount,
        total: Math.max(0, nodes.length - 1),
      }),
      activeIds: [keepRoot],
      mergedIds: [attachRoot],
    });
  }

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    edges: sortedEdges,
    statuses,
    description: i18nText(I18N.descriptions.complete, {
      count: acceptedCount,
      weight: acceptedWeight,
    }),
    activeCodeLine: 9,
    phase: 'graph-complete',
    statusLabel: I18N.statuses.complete,
    decision: I18N.decisions.pendingEdgesWorse,
    resultLabel: i18nText(I18N.labels.mstWeight, { weight: acceptedWeight }),
    operationsLabel: i18nText(I18N.labels.acceptedEdges, {
      count: acceptedCount,
      total: Math.max(0, nodes.length - 1),
    }),
  });
}

function createStep(args: {
  readonly nodes: readonly DsuBaseNode[];
  readonly parent: ReadonlyMap<string, string>;
  readonly rank: ReadonlyMap<string, number>;
  readonly size: ReadonlyMap<string, number>;
  readonly edges: readonly { id: string; from: string; to: string; weight: number }[];
  readonly statuses: ReadonlyMap<string, DsuEdgeTrace['status']>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly statusLabel: TranslatableText;
  readonly decision: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly operationsLabel: TranslatableText;
  readonly activeIds?: readonly string[];
  readonly mergedIds?: readonly string[];
  readonly queryIds?: readonly string[];
}): SortStep {
  return createDsuStep({
    mode: 'kruskal',
    nodes: args.nodes,
    parent: args.parent,
    rank: args.rank,
    size: args.size,
    edges: args.edges.map((edge) => ({
      id: edge.id,
      fromId: edge.from,
      fromLabel: labelOf(args.nodes, edge.from),
      toId: edge.to,
      toLabel: labelOf(args.nodes, edge.to),
      weight: edge.weight,
      status: args.statuses.get(edge.id) ?? 'pending',
    })),
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    statusLabel: args.statusLabel,
    decision: args.decision,
    resultLabel: args.resultLabel,
    operationsLabel: args.operationsLabel,
    activeIds: args.activeIds,
    mergedIds: args.mergedIds,
    queryIds: args.queryIds,
  });
}

function findRoot(nodeId: string, parent: ReadonlyMap<string, string>): string {
  let current = nodeId;
  let hops = 0;
  while ((parent.get(current) ?? current) !== current && hops < parent.size + 1) {
    current = parent.get(current) ?? current;
    hops++;
  }
  return current;
}

function labelOf(nodes: readonly DsuBaseNode[], nodeId: string): string {
  return nodes.find((node) => node.id === nodeId)?.label ?? nodeId;
}
