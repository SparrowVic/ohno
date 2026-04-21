import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  PalindromicTreeNodeView,
  PalindromicTreeTraceState,
} from '../../models/string';
import { PalindromicTreeScenario } from '../../utils/string-scenarios/string-scenarios';

interface EertreeNode {
  readonly id: number;
  readonly length: number;
  link: number;
  readonly next: Map<string, number>;
  occ: number;
  firstEnd: number;
}

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.palindromicTree.modeLabel'),
  phases: {
    roots: t('features.algorithms.runtime.string.palindromicTree.phases.roots'),
    followLink: t('features.algorithms.runtime.string.palindromicTree.phases.followLink'),
    reuseNode: t('features.algorithms.runtime.string.palindromicTree.phases.reuseNode'),
    insertNode: t('features.algorithms.runtime.string.palindromicTree.phases.insertNode'),
    complete: t('features.algorithms.runtime.string.palindromicTree.phases.complete'),
  },
  insights: {
    distinctLabel: t('features.algorithms.runtime.string.palindromicTree.insights.distinctLabel'),
    activeLabel: t('features.algorithms.runtime.string.palindromicTree.insights.activeLabel'),
    longestSuffixLabel: t(
      'features.algorithms.runtime.string.palindromicTree.insights.longestSuffixLabel',
    ),
    processedLabel: t('features.algorithms.runtime.string.palindromicTree.insights.processedLabel'),
    countValue: t('features.algorithms.runtime.string.palindromicTree.insights.countValue'),
    nodeValue: t('features.algorithms.runtime.string.palindromicTree.insights.nodeValue'),
    noneValue: t('features.algorithms.runtime.string.palindromicTree.insights.noneValue'),
  },
  descriptions: {
    init: t('features.algorithms.runtime.string.palindromicTree.descriptions.init'),
    followLink: t('features.algorithms.runtime.string.palindromicTree.descriptions.followLink'),
    reuseNode: t('features.algorithms.runtime.string.palindromicTree.descriptions.reuseNode'),
    insertNode: t('features.algorithms.runtime.string.palindromicTree.descriptions.insertNode'),
    complete: t('features.algorithms.runtime.string.palindromicTree.descriptions.complete'),
  },
  decisions: {
    chaseSuffixLinks: t(
      'features.algorithms.runtime.string.palindromicTree.decisions.chaseSuffixLinks',
    ),
    reuseExistingNode: t(
      'features.algorithms.runtime.string.palindromicTree.decisions.reuseExistingNode',
    ),
    addNewPalindrome: t(
      'features.algorithms.runtime.string.palindromicTree.decisions.addNewPalindrome',
    ),
    treeReady: t('features.algorithms.runtime.string.palindromicTree.decisions.treeReady'),
  },
  computation: {
    labels: {
      suffixLink: t('features.algorithms.runtime.string.palindromicTree.computation.labels.suffixLink'),
      newNode: t('features.algorithms.runtime.string.palindromicTree.computation.labels.newNode'),
      occurrenceCount: t(
        'features.algorithms.runtime.string.palindromicTree.computation.labels.occurrenceCount',
      ),
      finalSummary: t(
        'features.algorithms.runtime.string.palindromicTree.computation.labels.finalSummary',
      ),
    },
    notes: {
      suffixLink: t('features.algorithms.runtime.string.palindromicTree.computation.notes.suffixLink'),
      newNode: t('features.algorithms.runtime.string.palindromicTree.computation.notes.newNode'),
      occurrenceCount: t(
        'features.algorithms.runtime.string.palindromicTree.computation.notes.occurrenceCount',
      ),
      finalSummary: t(
        'features.algorithms.runtime.string.palindromicTree.computation.notes.finalSummary',
      ),
    },
  },
  labels: {
    pendingTree: t('features.algorithms.runtime.string.palindromicTree.labels.pendingTree'),
    distinctValue: t('features.algorithms.runtime.string.palindromicTree.labels.distinctValue'),
  },
} as const;

function createNode(id: number, length: number, link: number, firstEnd: number): EertreeNode {
  return {
    id,
    length,
    link,
    next: new Map<string, number>(),
    occ: 0,
    firstEnd,
  };
}

function extractPalindrome(source: string, node: EertreeNode): string {
  if (node.length < 0) return 'odd-root';
  if (node.length === 0) return 'ε';
  return source.slice(node.firstEnd - node.length + 1, node.firstEnd + 1);
}

function buildNodeViews(
  source: string,
  nodes: readonly EertreeNode[],
  activeNodeId: number,
  suffixPath: readonly number[],
  newestNodeId: number | null,
): readonly PalindromicTreeNodeView[] {
  const suffixSet = new Set(suffixPath);

  return nodes.map((node) => {
    let tone: PalindromicTreeNodeView['tone'] = node.id <= 1 ? 'root' : 'ready';
    if (suffixSet.has(node.id)) tone = 'suffix';
    if (node.id === newestNodeId) tone = 'new';
    if (node.id === activeNodeId) tone = 'active';

    return {
      id: String(node.id),
      palindrome: extractPalindrome(source, node),
      length: node.length,
      suffixLinkId: node.id === 0 ? null : String(node.link),
      occurrences: node.occ,
      tone,
    };
  });
}

function resultLabel(distinctCount: number): TranslatableText {
  return distinctCount === 0
    ? I18N.labels.pendingTree
    : i18nText(I18N.labels.distinctValue, { count: distinctCount });
}

function makeState(args: {
  readonly scenario: PalindromicTreeScenario;
  readonly phase: PalindromicTreeTraceState['phase'];
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly source: string;
  readonly processedIndex: number;
  readonly currentChar: string | null;
  readonly activeNodeId: number;
  readonly suffixPath: readonly number[];
  readonly newestNodeId: number | null;
  readonly nodes: readonly EertreeNode[];
  readonly computation: PalindromicTreeTraceState['computation'];
}): PalindromicTreeTraceState {
  const distinctCount = Math.max(args.nodes.length - 2, 0);

  return {
    mode: 'palindromic-tree',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: resultLabel(distinctCount),
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.distinctLabel,
        value: i18nText(I18N.insights.countValue, { count: distinctCount }),
        tone: 'accent',
      },
      {
        label: I18N.insights.activeLabel,
        value: i18nText(I18N.insights.nodeValue, { node: args.activeNodeId }),
        tone: 'warning',
      },
      {
        label: I18N.insights.longestSuffixLabel,
        value:
          args.activeNodeId <= 1
            ? I18N.insights.noneValue
            : extractPalindrome(args.source, args.nodes[args.activeNodeId]!),
        tone: args.activeNodeId <= 1 ? 'info' : 'success',
      },
      {
        label: I18N.insights.processedLabel,
        value: i18nText(I18N.insights.countValue, { count: Math.max(args.processedIndex + 1, 0) }),
        tone: 'info',
      },
    ],
    phase: args.phase,
    source: args.source,
    processedIndex: args.processedIndex,
    currentChar: args.currentChar,
    activeNodeId: String(args.activeNodeId),
    suffixPath: args.suffixPath.map(String),
    nodes: buildNodeViews(
      args.source,
      args.nodes,
      args.activeNodeId,
      args.suffixPath,
      args.newestNodeId,
    ),
    longestSuffix:
      args.activeNodeId <= 1 ? '' : extractPalindrome(args.source, args.nodes[args.activeNodeId]!),
    distinctCount,
  };
}

function findSuffixNode(
  source: string,
  nodes: readonly EertreeNode[],
  startNode: number,
  index: number,
  char: string,
): readonly number[] {
  const path = [startNode];
  let current = startNode;

  while (true) {
    const mirrorIndex = index - 1 - nodes[current]!.length;
    if (mirrorIndex >= 0 && source[mirrorIndex] === char) {
      return path;
    }
    current = nodes[current]!.link;
    path.push(current);
  }
}

export function* palindromicTreeGenerator(
  scenario: PalindromicTreeScenario,
): Generator<SortStep> {
  const nodes: EertreeNode[] = [createNode(0, -1, 0, -1), createNode(1, 0, 0, -1)];
  let activeNode = 1;

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.init, { text: scenario.source }),
    phase: 'init',
    string: makeState({
      scenario,
      phase: 'roots',
      phaseLabel: I18N.phases.roots,
      activeLabel: 'root(-1), root(0)',
      decisionLabel: I18N.decisions.chaseSuffixLinks,
      source: scenario.source,
      processedIndex: -1,
      currentChar: null,
      activeNodeId: activeNode,
      suffixPath: [0, 1],
      newestNodeId: null,
      nodes,
      computation: {
        label: I18N.computation.labels.newNode,
        expression: 'odd root = -1, even root = 0',
        result: null,
        note: I18N.computation.notes.newNode,
      },
    }),
  });

  for (let index = 0; index < scenario.source.length; index += 1) {
    const char = scenario.source[index]!;
    const suffixPath = findSuffixNode(scenario.source, nodes, activeNode, index, char);
    let current = suffixPath.at(-1)!;

    if (suffixPath.length > 1) {
      yield createStringStep({
        activeCodeLine: 2,
        description: i18nText(I18N.descriptions.followLink, {
          char,
          hops: suffixPath.length - 1,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          phase: 'followLink',
          phaseLabel: I18N.phases.followLink,
          activeLabel: `char '${char}'`,
          decisionLabel: I18N.decisions.chaseSuffixLinks,
          source: scenario.source,
          processedIndex: index,
          currentChar: char,
          activeNodeId: current,
          suffixPath,
          newestNodeId: null,
          nodes,
          computation: {
            label: I18N.computation.labels.suffixLink,
            expression: suffixPath.join(' -> '),
            result: `state ${current}`,
            note: I18N.computation.notes.suffixLink,
          },
        }),
      });
    }

    const existing = nodes[current]!.next.get(char);
    if (existing !== undefined) {
      activeNode = existing;
      nodes[activeNode]!.occ += 1;

      yield createStringStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.reuseNode, {
          palindrome: extractPalindrome(scenario.source, nodes[activeNode]!),
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          phase: 'reuse',
          phaseLabel: I18N.phases.reuseNode,
          activeLabel: `node ${activeNode}`,
          decisionLabel: I18N.decisions.reuseExistingNode,
          source: scenario.source,
          processedIndex: index,
          currentChar: char,
          activeNodeId: activeNode,
          suffixPath,
          newestNodeId: null,
          nodes,
          computation: {
            label: I18N.computation.labels.occurrenceCount,
            expression: `occ[${activeNode}] += 1`,
            result: `occ = ${nodes[activeNode]!.occ}`,
            note: I18N.computation.notes.occurrenceCount,
          },
        }),
      });
      continue;
    }

    const newNodeId = nodes.length;
    const newLength = nodes[current]!.length + 2;
    const newNode = createNode(newNodeId, newLength, 1, index);
    newNode.occ = 1;
    nodes[current]!.next.set(char, newNodeId);
    nodes.push(newNode);

    if (newLength === 1) {
      newNode.link = 1;
    } else {
      const linkPath = findSuffixNode(scenario.source, nodes, nodes[current]!.link, index, char);
      const linkSource = linkPath.at(-1)!;
      newNode.link = nodes[linkSource]!.next.get(char) ?? 1;
    }

    activeNode = newNodeId;

    yield createStringStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.insertNode, {
        palindrome: extractPalindrome(scenario.source, newNode),
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phase: 'insert',
        phaseLabel: I18N.phases.insertNode,
        activeLabel: `node ${newNodeId}`,
        decisionLabel: I18N.decisions.addNewPalindrome,
        source: scenario.source,
        processedIndex: index,
        currentChar: char,
        activeNodeId: activeNode,
        suffixPath: [...suffixPath, newNode.link],
        newestNodeId: newNodeId,
        nodes,
        computation: {
          label: I18N.computation.labels.newNode,
          expression: `len = ${newLength}, link = ${newNode.link}`,
          result: extractPalindrome(scenario.source, newNode),
          note: I18N.computation.notes.newNode,
        },
      }),
    });
  }

  const orderByLength = [...nodes.keys()]
    .filter((id) => id > 1)
    .sort((left, right) => nodes[right]!.length - nodes[left]!.length);
  for (const id of orderByLength) {
    nodes[nodes[id]!.link]!.occ += nodes[id]!.occ;
  }

  yield createStringStep({
    activeCodeLine: 5,
    description: i18nText(I18N.descriptions.complete, {
      count: Math.max(nodes.length - 2, 0),
    }),
    phase: 'complete',
    string: makeState({
      scenario,
      phase: 'complete',
      phaseLabel: I18N.phases.complete,
      activeLabel: `distinct = ${Math.max(nodes.length - 2, 0)}`,
      decisionLabel: I18N.decisions.treeReady,
      source: scenario.source,
      processedIndex: scenario.source.length - 1,
      currentChar: null,
      activeNodeId: activeNode,
      suffixPath: [activeNode, nodes[activeNode]!.link],
      newestNodeId: null,
      nodes,
      computation: {
        label: I18N.computation.labels.finalSummary,
        expression: `distinct = ${Math.max(nodes.length - 2, 0)}`,
        result: extractPalindrome(scenario.source, nodes[activeNode]!),
        note: I18N.computation.notes.finalSummary,
      },
    }),
  });
}
