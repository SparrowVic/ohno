import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DsuEdgeTrace } from '../models/dsu';
import { SortStep } from '../models/sort-step';
import { UnionFindOperation, UnionFindScenario } from '../utils/scenarios/dsu/dsu-scenarios';
import { createDsuStep, DsuBaseNode } from './dsu-step';

const I18N = {
  statuses: {
    ready: t('features.algorithms.runtime.dsu.unionFind.statuses.ready'),
    findRepresentative: t(
      'features.algorithms.runtime.dsu.unionFind.statuses.findRepresentative',
    ),
    pathCompression: t('features.algorithms.runtime.dsu.unionFind.statuses.pathCompression'),
    compareRoots: t('features.algorithms.runtime.dsu.unionFind.statuses.compareRoots'),
    unionSkipped: t('features.algorithms.runtime.dsu.unionFind.statuses.unionSkipped'),
    unionByRank: t('features.algorithms.runtime.dsu.unionFind.statuses.unionByRank'),
    complete: t('features.algorithms.runtime.dsu.unionFind.statuses.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dsu.unionFind.descriptions.initialize'),
    followPath: t('features.algorithms.runtime.dsu.unionFind.descriptions.followPath'),
    compressPath: t('features.algorithms.runtime.dsu.unionFind.descriptions.compressPath'),
    alreadyCompressed: t(
      'features.algorithms.runtime.dsu.unionFind.descriptions.alreadyCompressed',
    ),
    compareRoots: t('features.algorithms.runtime.dsu.unionFind.descriptions.compareRoots'),
    skipMerge: t('features.algorithms.runtime.dsu.unionFind.descriptions.skipMerge'),
    attachRoot: t('features.algorithms.runtime.dsu.unionFind.descriptions.attachRoot'),
    complete: t('features.algorithms.runtime.dsu.unionFind.descriptions.complete'),
  },
  decisions: {
    singletonRoots: t('features.algorithms.runtime.dsu.unionFind.decisions.singletonRoots'),
    currentPath: t('features.algorithms.runtime.dsu.unionFind.decisions.currentPath'),
    representativeIs: t(
      'features.algorithms.runtime.dsu.unionFind.decisions.representativeIs',
    ),
    representativePair: t(
      'features.algorithms.runtime.dsu.unionFind.decisions.representativePair',
    ),
    noStructuralChange: t(
      'features.algorithms.runtime.dsu.unionFind.decisions.noStructuralChange',
    ),
    newRootRepresents: t(
      'features.algorithms.runtime.dsu.unionFind.decisions.newRootRepresents',
    ),
    finalStable: t('features.algorithms.runtime.dsu.unionFind.decisions.finalStable'),
  },
  labels: {
    singletonSets: t('features.algorithms.runtime.dsu.unionFind.labels.singletonSets'),
    activeSets: t('features.algorithms.runtime.dsu.unionFind.labels.activeSets'),
    operationQueue: t('features.algorithms.runtime.dsu.unionFind.labels.operationQueue'),
  },
} as const;

export function* unionFindGenerator(scenario: UnionFindScenario): Generator<SortStep> {
  const nodes = scenario.nodes;
  const parent = new Map<string, string>(nodes.map((node) => [node.id, node.id]));
  const rank = new Map<string, number>(nodes.map((node) => [node.id, 0]));
  const size = new Map<string, number>(nodes.map((node) => [node.id, 1]));
  const statuses = new Map<number, DsuEdgeTrace['status']>(scenario.operations.map((_, index) => [index, 'pending']));

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    operations: scenario.operations,
    statuses,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    statusLabel: I18N.statuses.ready,
    decision: I18N.decisions.singletonRoots,
    resultLabel: i18nText(I18N.labels.singletonSets, { count: nodes.length }),
    operationsLabel: I18N.labels.operationQueue,
  });

  for (let index = 0; index < scenario.operations.length; index++) {
    const operation = scenario.operations[index]!;
    statuses.set(index, 'active');

    if (operation.kind === 'find') {
      const path = collectPath(operation.a, parent);

      yield createStep({
        nodes,
        parent,
        rank,
        size,
        operations: scenario.operations,
        statuses,
        description: i18nText(I18N.descriptions.followPath, {
          label: labelOf(nodes, operation.a),
        }),
        activeCodeLine: 5,
        statusLabel: I18N.statuses.findRepresentative,
        decision: i18nText(I18N.decisions.currentPath, {
          path: labelsFor(nodes, path).join(' → '),
        }),
        resultLabel: i18nText(I18N.labels.activeSets, { count: componentCount(parent) }),
        operationsLabel: I18N.labels.operationQueue,
        activeIds: path,
        queryIds: [operation.a],
      });

      const root = path[path.length - 1]!;
      const compressed = path.slice(0, -1).filter((nodeId) => (parent.get(nodeId) ?? nodeId) !== root);
      for (const nodeId of compressed) {
        parent.set(nodeId, root);
      }

      statuses.set(index, 'accepted');
      yield createStep({
        nodes,
        parent,
        rank,
        size,
        operations: scenario.operations,
        statuses,
        description:
          compressed.length > 0
            ? i18nText(I18N.descriptions.compressPath, { root: labelOf(nodes, root) })
            : i18nText(I18N.descriptions.alreadyCompressed, {
                node: labelOf(nodes, operation.a),
                root: labelOf(nodes, root),
              }),
        activeCodeLine: 6,
        statusLabel: I18N.statuses.pathCompression,
        decision: i18nText(I18N.decisions.representativeIs, { root: labelOf(nodes, root) }),
        resultLabel: i18nText(I18N.labels.activeSets, { count: componentCount(parent) }),
        operationsLabel: I18N.labels.operationQueue,
        activeIds: [root],
        compressedIds: compressed,
        queryIds: [operation.a],
      });
      continue;
    }

    const leftPath = collectPath(operation.a, parent);
    const rightPath = collectPath(operation.b!, parent);
    const leftRoot = leftPath[leftPath.length - 1]!;
    const rightRoot = rightPath[rightPath.length - 1]!;

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      operations: scenario.operations,
      statuses,
      description: i18nText(I18N.descriptions.compareRoots, {
        left: labelOf(nodes, operation.a),
        right: labelOf(nodes, operation.b!),
      }),
      activeCodeLine: 8,
      statusLabel: I18N.statuses.compareRoots,
      decision: i18nText(I18N.decisions.representativePair, {
        left: labelOf(nodes, operation.a),
        leftRoot: labelOf(nodes, leftRoot),
        right: labelOf(nodes, operation.b!),
        rightRoot: labelOf(nodes, rightRoot),
      }),
      resultLabel: i18nText(I18N.labels.activeSets, { count: componentCount(parent) }),
      operationsLabel: I18N.labels.operationQueue,
      activeIds: [operation.a, operation.b!],
      queryIds: [...new Set([...leftPath, ...rightPath])],
    });

    if (leftRoot === rightRoot) {
      statuses.set(index, 'rejected');
      yield createStep({
        nodes,
        parent,
        rank,
        size,
        operations: scenario.operations,
        statuses,
        description: i18nText(I18N.descriptions.skipMerge, { root: labelOf(nodes, leftRoot) }),
        activeCodeLine: 9,
        statusLabel: I18N.statuses.unionSkipped,
        decision: I18N.decisions.noStructuralChange,
        resultLabel: i18nText(I18N.labels.activeSets, { count: componentCount(parent) }),
        operationsLabel: I18N.labels.operationQueue,
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
    statuses.set(index, 'accepted');

    yield createStep({
      nodes,
      parent,
      rank,
      size,
      operations: scenario.operations,
      statuses,
      description: i18nText(I18N.descriptions.attachRoot, {
        attach: labelOf(nodes, attachRoot),
        keep: labelOf(nodes, keepRoot),
      }),
      activeCodeLine: 10,
      statusLabel: I18N.statuses.unionByRank,
      decision: i18nText(I18N.decisions.newRootRepresents, {
        root: labelOf(nodes, keepRoot),
        count: size.get(keepRoot),
      }),
      resultLabel: i18nText(I18N.labels.activeSets, { count: componentCount(parent) }),
      operationsLabel: I18N.labels.operationQueue,
      activeIds: [keepRoot],
      mergedIds: [attachRoot],
    });
  }

  yield createStep({
    nodes,
    parent,
    rank,
    size,
    operations: scenario.operations,
    statuses,
    description: i18nText(I18N.descriptions.complete, { count: componentCount(parent) }),
    activeCodeLine: 12,
    phase: 'graph-complete',
    statusLabel: I18N.statuses.complete,
    decision: I18N.decisions.finalStable,
    resultLabel: i18nText(I18N.labels.activeSets, { count: componentCount(parent) }),
    operationsLabel: I18N.labels.operationQueue,
  });
}

function createStep(args: {
  readonly nodes: readonly DsuBaseNode[];
  readonly parent: ReadonlyMap<string, string>;
  readonly rank: ReadonlyMap<string, number>;
  readonly size: ReadonlyMap<string, number>;
  readonly operations: readonly UnionFindOperation[];
  readonly statuses: ReadonlyMap<number, DsuEdgeTrace['status']>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly statusLabel: TranslatableText;
  readonly decision: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly operationsLabel: TranslatableText;
  readonly activeIds?: readonly string[];
  readonly mergedIds?: readonly string[];
  readonly compressedIds?: readonly string[];
  readonly queryIds?: readonly string[];
}): SortStep {
  return createDsuStep({
    mode: 'union-find',
    nodes: args.nodes,
    parent: args.parent,
    rank: args.rank,
    size: args.size,
    edges: args.operations.map((operation, index) => ({
      id: `op-${index}`,
      fromId: operation.a,
      fromLabel: labelOf(args.nodes, operation.a),
      toId: operation.b ?? operation.a,
      toLabel: operation.kind === 'find' ? 'find' : labelOf(args.nodes, operation.b ?? operation.a),
      weight: null,
      status: args.statuses.get(index) ?? 'pending',
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
    compressedIds: args.compressedIds,
    queryIds: args.queryIds,
  });
}

function collectPath(nodeId: string, parent: ReadonlyMap<string, string>): readonly string[] {
  const path: string[] = [nodeId];
  let current = nodeId;
  let hops = 0;
  while ((parent.get(current) ?? current) !== current && hops < parent.size + 1) {
    current = parent.get(current) ?? current;
    path.push(current);
    hops++;
  }
  return path;
}

function componentCount(parent: ReadonlyMap<string, string>): number {
  return new Set([...parent.keys()].map((nodeId) => collectPath(nodeId, parent).at(-1) ?? nodeId)).size;
}

function labelOf(nodes: readonly DsuBaseNode[], nodeId: string): string {
  return nodes.find((node) => node.id === nodeId)?.label ?? nodeId;
}

function labelsFor(nodes: readonly DsuBaseNode[], ids: readonly string[]): readonly string[] {
  return ids.map((id) => labelOf(nodes, id));
}
