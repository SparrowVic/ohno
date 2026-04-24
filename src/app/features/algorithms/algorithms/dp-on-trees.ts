import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { TreeDpScenario } from '../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.dpOnTrees.modeLabel'),
  phases: {
    initializeTree: t('features.algorithms.runtime.dp.dpOnTrees.phases.initializeTree'),
    inspectLeaf: t('features.algorithms.runtime.dp.dpOnTrees.phases.inspectLeaf'),
    aggregateChild: t('features.algorithms.runtime.dp.dpOnTrees.phases.aggregateChild'),
    commitStates: t('features.algorithms.runtime.dp.dpOnTrees.phases.commitStates'),
    backtrackChosen: t('features.algorithms.runtime.dp.dpOnTrees.phases.backtrackChosen'),
    complete: t('features.algorithms.runtime.dp.dpOnTrees.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.initialize'),
    inspectLeaf: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.inspectLeaf'),
    aggregateChild: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.aggregateChild'),
    commitStates: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.commitStates'),
    chooseNode: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.chooseNode'),
    skipParentTaken: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.skipParentTaken'),
    skipBetterState: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.skipBetterState'),
    complete: t('features.algorithms.runtime.dp.dpOnTrees.descriptions.complete'),
  },
  insights: {
    nodesLabel: t('features.algorithms.runtime.dp.dpOnTrees.insights.nodesLabel'),
    rootBestLabel: t('features.algorithms.runtime.dp.dpOnTrees.insights.rootBestLabel'),
    chosenLabel: t('features.algorithms.runtime.dp.dpOnTrees.insights.chosenLabel'),
    postorderLabel: t('features.algorithms.runtime.dp.dpOnTrees.insights.postorderLabel'),
    stripLabel: t('features.algorithms.runtime.dp.dpOnTrees.insights.stripLabel'),
  },
  labels: {
    resultBest: t('features.algorithms.runtime.dp.dpOnTrees.labels.resultBest'),
    activeNode: t('features.algorithms.runtime.dp.dpOnTrees.labels.activeNode'),
    pathValue: t('features.algorithms.runtime.dp.dpOnTrees.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.dpOnTrees.labels.pathPending'),
    treeEdgesLabel: t('features.algorithms.runtime.dp.dpOnTrees.labels.treeEdgesLabel'),
    postorderNodesLabel: t('features.algorithms.runtime.dp.dpOnTrees.labels.postorderNodesLabel'),
    pairLabel: t('features.algorithms.runtime.dp.dpOnTrees.labels.pairLabel'),
    bestLabel: t('features.algorithms.runtime.dp.dpOnTrees.labels.bestLabel'),
    postorderValue: t('features.algorithms.runtime.dp.dpOnTrees.labels.postorderValue'),
    stripValue: t('features.algorithms.runtime.dp.dpOnTrees.labels.stripValue'),
  },
  decisions: {
    leafDirect: t('features.algorithms.runtime.dp.dpOnTrees.decisions.leafDirect'),
    mergeChild: t('features.algorithms.runtime.dp.dpOnTrees.decisions.mergeChild'),
    takeDominates: t('features.algorithms.runtime.dp.dpOnTrees.decisions.takeDominates'),
    skipDominates: t('features.algorithms.runtime.dp.dpOnTrees.decisions.skipDominates'),
  },
} as const;

export function* dpOnTreesGenerator(scenario: TreeDpScenario): Generator<SortStep> {
  const nodes = scenario.nodes;
  const count = nodes.length;
  const indexById = new Map(nodes.map((node, index) => [node.id, index]));
  const children = Array.from({ length: count }, () => [] as number[]);
  const rootIndex = indexById.get(scenario.rootId) ?? 0;

  for (const [index, node] of nodes.entries()) {
    if (!node.parentId) continue;
    const parentIndex = indexById.get(node.parentId);
    if (parentIndex !== undefined) {
      children[parentIndex]!.push(index);
    }
  }

  const take = Array.from({ length: count }, () => 0);
  const skip = Array.from({ length: count }, () => 0);
  const best = Array.from({ length: count }, () => 0);
  const chosen = new Set<number>();
  const postorder: number[] = [];

  buildPostorder(rootIndex);

  yield createStep({
    scenario,
    take,
    skip,
    best,
    children,
    chosen,
    postorder,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeTree,
    phase: 'init',
  });

  for (const nodeIndex of postorder) {
    let takeValue = nodes[nodeIndex]!.weight;
    let skipValue = 0;

    if (children[nodeIndex]!.length === 0) {
      yield createStep({
        scenario,
        take,
        skip,
        best,
        children,
        chosen,
        postorder,
        activeIndex: nodeIndex,
        description: i18nText(I18N.descriptions.inspectLeaf, {
          node: nodes[nodeIndex]!.label,
          weight: nodes[nodeIndex]!.weight,
        }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.inspectLeaf,
        phase: 'compare',
        computation: {
          label: nodes[nodeIndex]!.label,
          expression: `take = ${nodes[nodeIndex]!.weight}, skip = 0`,
          result: String(nodes[nodeIndex]!.weight),
          decision: I18N.decisions.leafDirect,
        },
      });
    }

    for (const childIndex of children[nodeIndex]!) {
      yield createStep({
        scenario,
        take,
        skip,
        best,
        children,
        chosen,
        postorder,
        activeIndex: nodeIndex,
        candidateIndex: childIndex,
        description: i18nText(I18N.descriptions.aggregateChild, {
          node: nodes[nodeIndex]!.label,
          child: nodes[childIndex]!.label,
        }),
        activeCodeLine: 6,
        phaseLabel: I18N.phases.aggregateChild,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.pairLabel, {
            node: nodes[nodeIndex]!.label,
            child: nodes[childIndex]!.label,
          }),
          expression: `take += skip[${nodes[childIndex]!.label}] (${skip[childIndex]!}), skip += best[${nodes[childIndex]!.label}] (${Math.max(take[childIndex]!, skip[childIndex]!)})`,
          result: `${takeValue + skip[childIndex]!} / ${skipValue + Math.max(take[childIndex]!, skip[childIndex]!)}`,
          decision: I18N.decisions.mergeChild,
        },
      });

      takeValue += skip[childIndex]!;
      skipValue += Math.max(take[childIndex]!, skip[childIndex]!);
    }

    take[nodeIndex] = takeValue;
    skip[nodeIndex] = skipValue;
    best[nodeIndex] = Math.max(takeValue, skipValue);

    yield createStep({
      scenario,
      take,
      skip,
      best,
      children,
      chosen,
      postorder,
      activeIndex: nodeIndex,
      activeStatus: 'improved',
      description: i18nText(I18N.descriptions.commitStates, {
        node: nodes[nodeIndex]!.label,
      }),
      activeCodeLine: 8,
      phaseLabel: I18N.phases.commitStates,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.bestLabel, { node: nodes[nodeIndex]!.label }),
        expression: `max(${takeValue}, ${skipValue})`,
        result: String(best[nodeIndex]!),
        decision: takeValue >= skipValue ? I18N.decisions.takeDominates : I18N.decisions.skipDominates,
      },
    });
  }

  yield* trace(rootIndex, false);

  yield createStep({
    scenario,
    take,
    skip,
    best,
    children,
    chosen,
    postorder,
    description: I18N.descriptions.complete,
    activeCodeLine: 12,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });

  function buildPostorder(nodeIndex: number): void {
    for (const child of children[nodeIndex]!) buildPostorder(child);
    postorder.push(nodeIndex);
  }

  function* trace(nodeIndex: number, parentTaken: boolean): Generator<SortStep> {
    const takeNode = !parentTaken && take[nodeIndex]! >= skip[nodeIndex]!;
    if (takeNode) {
      chosen.add(nodeIndex);
    }

    yield createStep({
      scenario,
      take,
      skip,
      best,
      children,
      chosen,
      postorder,
      activeIndex: nodeIndex,
      activeStatus: 'backtrack',
      description: takeNode
        ? i18nText(I18N.descriptions.chooseNode, {
            node: nodes[nodeIndex]!.label,
          })
        : parentTaken
          ? i18nText(I18N.descriptions.skipParentTaken, {
              node: nodes[nodeIndex]!.label,
            })
          : i18nText(I18N.descriptions.skipBetterState, {
              node: nodes[nodeIndex]!.label,
            }),
      activeCodeLine: 11,
      phaseLabel: I18N.phases.backtrackChosen,
      phase: 'relax',
      computation: {
        label: nodes[nodeIndex]!.label,
        expression: parentTaken ? 'parent selected' : `${take[nodeIndex]!} vs ${skip[nodeIndex]!}`,
        result: takeNode ? 'take' : 'skip',
        decision: independentSetLabel(scenario, chosen),
      },
    });

    for (const childIndex of children[nodeIndex]!) {
      yield* trace(childIndex, takeNode);
    }
  }
}

function createStep(args: {
  readonly scenario: TreeDpScenario;
  readonly take: readonly number[];
  readonly skip: readonly number[];
  readonly best: readonly number[];
  readonly children: readonly (readonly number[])[];
  readonly chosen: ReadonlySet<number>;
  readonly postorder: readonly number[];
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndex?: number;
  readonly activeStatus?: 'active' | 'improved' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const headers: DpHeaderConfig[] = args.scenario.nodes.map((node, index) => ({
    id: `col-${node.id}`,
    label: node.label,
    status: (args.activeIndex === index ? 'active' : args.candidateIndex === index ? 'accent' : 'idle') as DpHeaderConfig['status'],
    metaLabel: `w${node.weight}`,
  }));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-weight', label: 'weight', status: 'source', metaLabel: 'node' },
    { id: 'row-take', label: 'take', status: 'accent', metaLabel: 'include' },
    { id: 'row-skip', label: 'target', status: 'accent', metaLabel: 'exclude' },
    { id: 'row-best', label: 'best', status: 'target', metaLabel: 'max' },
  ];

  const cells: DpCellConfig[] = [];
  for (let index = 0; index < args.scenario.nodes.length; index++) {
    const node = args.scenario.nodes[index]!;
    const isChosen = args.chosen.has(index);
    const isActive = args.activeIndex === index;
    const isCandidate = args.candidateIndex === index;

    cells.push({
      row: 0,
      col: index,
      rowLabel: 'weight',
      colLabel: node.label,
      valueLabel: String(node.weight),
      metaLabel: args.children[index]!.length === 0 ? 'leaf' : `${args.children[index]!.length} kids`,
      status: isChosen ? 'backtrack' : 'base',
      tags: [...(isChosen ? (['path'] as const) : []), ...(isActive ? (['active'] as const) : [])],
    });

    cells.push({
      row: 1,
      col: index,
      rowLabel: 'take',
      colLabel: node.label,
      valueLabel: String(args.take[index]!),
      metaLabel: isChosen ? 'picked' : null,
      status: isChosen
        ? 'backtrack'
        : isActive
          ? (args.activeStatus ?? 'active')
          : isCandidate
            ? 'candidate'
            : args.take[index]! > 0
              ? 'chosen'
              : 'idle',
      tags: [
        'take',
        ...(isCandidate ? (['best'] as const) : []),
        ...(isChosen ? (['path'] as const) : []),
        ...(isActive ? (['active'] as const) : []),
      ],
    });

    cells.push({
      row: 2,
      col: index,
      rowLabel: 'skip',
      colLabel: node.label,
      valueLabel: String(args.skip[index]!),
      metaLabel: isChosen ? 'blocked by parent?' : null,
      status: isChosen ? 'backtrack' : isCandidate ? 'candidate' : args.skip[index]! > 0 ? 'chosen' : 'idle',
      tags: [
        'skip',
        ...(isCandidate ? (['best'] as const) : []),
        ...(isChosen ? (['path'] as const) : []),
        ...(isActive ? (['active'] as const) : []),
      ],
    });

    const bestTags: DpTraceTag[] = ['best'];
    if (isChosen) bestTags.push('path');
    if (isActive) bestTags.push('active');

    cells.push({
      row: 3,
      col: index,
      rowLabel: 'best',
      colLabel: node.label,
      valueLabel: String(args.best[index]!),
      metaLabel: args.take[index]! >= args.skip[index]! ? 'take' : 'skip',
      status: isChosen ? 'backtrack' : isActive ? (args.activeStatus ?? 'active') : args.best[index]! > 0 ? 'improved' : 'idle',
      tags: bestTags,
    });
  }

  const rootIndex = args.scenario.nodes.findIndex((node) => node.id === args.scenario.rootId);
  const insights: DpInsight[] = [
    { label: I18N.insights.nodesLabel, value: String(args.scenario.nodes.length), tone: 'accent' },
    {
      label: I18N.insights.rootBestLabel,
      value: rootIndex >= 0 ? String(args.best[rootIndex] ?? 0) : '0',
      tone: 'success',
    },
    { label: I18N.insights.chosenLabel, value: String(args.chosen.size), tone: 'warning' },
    {
      label: I18N.insights.postorderLabel,
      value: i18nText(I18N.labels.postorderValue, {
        value: args.postorder.map((index) => args.scenario.nodes[index]!.label).join(' → '),
      }),
      tone: 'info',
    },
    {
      label: I18N.insights.stripLabel,
      value: i18nText(I18N.labels.stripValue, { length: args.scenario.nodes.length }),
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'dp-on-trees',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultBest, {
      value: rootIndex >= 0 ? args.best[rootIndex] ?? 0 : 0,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `4 × ${args.scenario.nodes.length}`,
    activeLabel:
      args.activeIndex === undefined
        ? null
        : i18nText(I18N.labels.activeNode, {
            node: args.scenario.nodes[args.activeIndex]!.label,
          }),
    pathLabel: independentSetLabel(args.scenario, args.chosen),
    primaryItemsLabel: I18N.labels.treeEdgesLabel,
    primaryItems: args.scenario.nodes
      .filter((node) => node.parentId !== null)
      .map((node) => `${node.parentId}→${node.label}`),
    secondaryItemsLabel: I18N.labels.postorderNodesLabel,
    secondaryItems: args.postorder.map((index) => args.scenario.nodes[index]!.label),
    insights,
    rowHeaders,
    colHeaders: headers,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function independentSetLabel(
  scenario: TreeDpScenario,
  chosen: ReadonlySet<number>,
): TranslatableText {
  const labels = Array.from(chosen)
    .sort((left, right) => left - right)
    .map((index) => scenario.nodes[index]!.label);
  return labels.length > 0
    ? i18nText(I18N.labels.pathValue, { nodes: labels.join(' · ') })
    : I18N.labels.pathPending;
}
