import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  AhoCorasickMatch,
  AhoCorasickNodeView,
  AhoCorasickTraceState,
} from '../../models/string';
import { AhoCorasickScenario } from '../../utils/string-scenarios/string-scenarios';

interface TrieNode {
  readonly id: number;
  readonly char: string;
  readonly parent: number | null;
  readonly depth: number;
  readonly next: Map<string, number>;
  fail: number;
  outputs: string[];
}

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.ahoCorasick.modeLabel'),
  phases: {
    buildTrie: t('features.algorithms.runtime.string.ahoCorasick.phases.buildTrie'),
    buildFailure: t('features.algorithms.runtime.string.ahoCorasick.phases.buildFailure'),
    scanText: t('features.algorithms.runtime.string.ahoCorasick.phases.scanText'),
    reportMatch: t('features.algorithms.runtime.string.ahoCorasick.phases.reportMatch'),
    complete: t('features.algorithms.runtime.string.ahoCorasick.phases.complete'),
  },
  insights: {
    patternsLabel: t('features.algorithms.runtime.string.ahoCorasick.insights.patternsLabel'),
    trieNodesLabel: t('features.algorithms.runtime.string.ahoCorasick.insights.trieNodesLabel'),
    activeStateLabel: t('features.algorithms.runtime.string.ahoCorasick.insights.activeStateLabel'),
    matchesLabel: t('features.algorithms.runtime.string.ahoCorasick.insights.matchesLabel'),
    countValue: t('features.algorithms.runtime.string.ahoCorasick.insights.countValue'),
    stateValue: t('features.algorithms.runtime.string.ahoCorasick.insights.stateValue'),
    noneValue: t('features.algorithms.runtime.string.ahoCorasick.insights.noneValue'),
  },
  descriptions: {
    init: t('features.algorithms.runtime.string.ahoCorasick.descriptions.init'),
    insertEdge: t('features.algorithms.runtime.string.ahoCorasick.descriptions.insertEdge'),
    reuseEdge: t('features.algorithms.runtime.string.ahoCorasick.descriptions.reuseEdge'),
    terminal: t('features.algorithms.runtime.string.ahoCorasick.descriptions.terminal'),
    setFailure: t('features.algorithms.runtime.string.ahoCorasick.descriptions.setFailure'),
    followFailure: t('features.algorithms.runtime.string.ahoCorasick.descriptions.followFailure'),
    advanceScan: t('features.algorithms.runtime.string.ahoCorasick.descriptions.advanceScan'),
    reportMatches: t('features.algorithms.runtime.string.ahoCorasick.descriptions.reportMatches'),
    complete: t('features.algorithms.runtime.string.ahoCorasick.descriptions.complete'),
  },
  decisions: {
    sharePrefixes: t('features.algorithms.runtime.string.ahoCorasick.decisions.sharePrefixes'),
    growTrie: t('features.algorithms.runtime.string.ahoCorasick.decisions.growTrie'),
    stitchFailureLinks: t(
      'features.algorithms.runtime.string.ahoCorasick.decisions.stitchFailureLinks',
    ),
    chaseFailureLinks: t(
      'features.algorithms.runtime.string.ahoCorasick.decisions.chaseFailureLinks',
    ),
    emitOutputs: t('features.algorithms.runtime.string.ahoCorasick.decisions.emitOutputs'),
    scanFinished: t('features.algorithms.runtime.string.ahoCorasick.decisions.scanFinished'),
  },
  computation: {
    labels: {
      transition: t('features.algorithms.runtime.string.ahoCorasick.computation.labels.transition'),
      failureLink: t(
        'features.algorithms.runtime.string.ahoCorasick.computation.labels.failureLink',
      ),
      outputSet: t('features.algorithms.runtime.string.ahoCorasick.computation.labels.outputSet'),
      textStep: t('features.algorithms.runtime.string.ahoCorasick.computation.labels.textStep'),
      finalSummary: t(
        'features.algorithms.runtime.string.ahoCorasick.computation.labels.finalSummary',
      ),
    },
    notes: {
      transition: t('features.algorithms.runtime.string.ahoCorasick.computation.notes.transition'),
      failureLink: t(
        'features.algorithms.runtime.string.ahoCorasick.computation.notes.failureLink',
      ),
      outputSet: t('features.algorithms.runtime.string.ahoCorasick.computation.notes.outputSet'),
      textStep: t('features.algorithms.runtime.string.ahoCorasick.computation.notes.textStep'),
      finalSummary: t(
        'features.algorithms.runtime.string.ahoCorasick.computation.notes.finalSummary',
      ),
    },
  },
  labels: {
    noMatchesYet: t('features.algorithms.runtime.string.ahoCorasick.labels.noMatchesYet'),
    matchesValue: t('features.algorithms.runtime.string.ahoCorasick.labels.matchesValue'),
  },
} as const;

function createNode(id: number, char: string, parent: number | null, depth: number): TrieNode {
  return {
    id,
    char,
    parent,
    depth,
    next: new Map<string, number>(),
    fail: 0,
    outputs: [],
  };
}

function decorateNodes(
  nodes: readonly TrieNode[],
  activeNodeId: number,
  failurePath: readonly number[],
  matchNodeId: number | null,
): readonly AhoCorasickNodeView[] {
  const failureSet = new Set(failurePath);

  return nodes.map((node) => {
    let tone: AhoCorasickNodeView['tone'] = 'ready';
    if (node.id === 0) tone = 'root';
    if (failureSet.has(node.id)) tone = 'failure';
    if (node.id === activeNodeId) tone = 'active';
    if (matchNodeId === node.id && node.outputs.length > 0) tone = 'match';

    return {
      id: String(node.id),
      index: node.id,
      char: node.char,
      depth: node.depth,
      failId: node.id === 0 ? null : String(node.fail),
      outputs: node.outputs,
      tone,
    };
  });
}

function matchesLabel(matches: readonly AhoCorasickMatch[]): TranslatableText {
  return matches.length === 0
    ? I18N.labels.noMatchesYet
    : i18nText(I18N.labels.matchesValue, { count: matches.length });
}

function makeState(args: {
  readonly scenario: AhoCorasickScenario;
  readonly nodes: readonly TrieNode[];
  readonly phase: AhoCorasickTraceState['phase'];
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly currentTextIndex: number | null;
  readonly currentChar: string | null;
  readonly activeNodeId: number;
  readonly failurePath: readonly number[];
  readonly matches: readonly AhoCorasickMatch[];
  readonly computation: AhoCorasickTraceState['computation'];
  readonly matchNodeId?: number | null;
}): AhoCorasickTraceState {
  return {
    mode: 'aho-corasick',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: matchesLabel(args.matches),
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.patternsLabel,
        value: i18nText(I18N.insights.countValue, { count: args.scenario.patterns.length }),
        tone: 'accent',
      },
      {
        label: I18N.insights.trieNodesLabel,
        value: i18nText(I18N.insights.countValue, { count: args.nodes.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.activeStateLabel,
        value: i18nText(I18N.insights.stateValue, { state: args.activeNodeId }),
        tone: 'warning',
      },
      {
        label: I18N.insights.matchesLabel,
        value:
          args.matches.length === 0
            ? I18N.insights.noneValue
            : args.matches.map((match) => `${match.pattern}@${match.startIndex}`).join(', '),
        tone: args.matches.length === 0 ? 'info' : 'success',
      },
    ],
    phase: args.phase,
    text: args.scenario.text,
    patterns: args.scenario.patterns,
    nodes: decorateNodes(args.nodes, args.activeNodeId, args.failurePath, args.matchNodeId ?? null),
    currentTextIndex: args.currentTextIndex,
    currentChar: args.currentChar,
    activeNodeId: String(args.activeNodeId),
    failurePath: args.failurePath.map(String),
    matches: args.matches,
  };
}

export function* ahoCorasickGenerator(
  scenario: AhoCorasickScenario,
): Generator<SortStep> {
  const nodes: TrieNode[] = [createNode(0, 'root', null, 0)];
  const matches: AhoCorasickMatch[] = [];

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.init, {
      patterns: scenario.patterns.join(', '),
      text: scenario.text,
    }),
    phase: 'init',
    string: makeState({
      scenario,
      nodes,
      phase: 'build',
      phaseLabel: I18N.phases.buildTrie,
      activeLabel: 'state 0',
      decisionLabel: I18N.decisions.sharePrefixes,
      currentTextIndex: null,
      currentChar: null,
      activeNodeId: 0,
      failurePath: [],
      matches,
      computation: {
        label: I18N.computation.labels.transition,
        expression: 'root = 0',
        result: scenario.patterns.join(', '),
        note: I18N.computation.notes.transition,
      },
    }),
  });

  for (const pattern of scenario.patterns) {
    let state = 0;

    for (const char of pattern) {
      const next = nodes[state]!.next.get(char);

      if (next !== undefined) {
        state = next;
        yield createStringStep({
          activeCodeLine: 2,
          description: i18nText(I18N.descriptions.reuseEdge, {
            char,
            pattern,
            state,
          }),
          phase: 'compare',
          string: makeState({
            scenario,
            nodes,
            phase: 'build',
            phaseLabel: I18N.phases.buildTrie,
            activeLabel: `state ${state}`,
            decisionLabel: I18N.decisions.sharePrefixes,
            currentTextIndex: null,
            currentChar: char,
            activeNodeId: state,
            failurePath: [],
            matches,
            computation: {
              label: I18N.computation.labels.transition,
              expression: `${nodes[state]!.parent ?? 0} -${char}-> ${state}`,
              result: null,
              note: I18N.computation.notes.transition,
            },
          }),
        });
        continue;
      }

      const nodeId = nodes.length;
      nodes.push(createNode(nodeId, char, state, nodes[state]!.depth + 1));
      nodes[state]!.next.set(char, nodeId);
      state = nodeId;

      yield createStringStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.insertEdge, {
          char,
          pattern,
          state,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          nodes,
          phase: 'build',
          phaseLabel: I18N.phases.buildTrie,
          activeLabel: `state ${state}`,
          decisionLabel: I18N.decisions.growTrie,
          currentTextIndex: null,
          currentChar: char,
          activeNodeId: state,
          failurePath: [],
          matches,
          computation: {
            label: I18N.computation.labels.transition,
            expression: `${nodes[state]!.parent ?? 0} -${char}-> ${state}`,
            result: null,
            note: I18N.computation.notes.transition,
          },
        }),
      });
    }

    if (!nodes[state]!.outputs.includes(pattern)) {
      nodes[state]!.outputs = [...nodes[state]!.outputs, pattern];
    }

    yield createStringStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.terminal, { pattern, state }),
      phase: 'compare',
      string: makeState({
        scenario,
        nodes,
        phase: 'build',
        phaseLabel: I18N.phases.buildTrie,
        activeLabel: `output(${state})`,
        decisionLabel: I18N.decisions.sharePrefixes,
        currentTextIndex: null,
        currentChar: null,
        activeNodeId: state,
        failurePath: [],
        matches,
        computation: {
          label: I18N.computation.labels.outputSet,
          expression: `output[${state}] = {${nodes[state]!.outputs.join(', ')}}`,
          result: null,
          note: I18N.computation.notes.outputSet,
        },
        matchNodeId: state,
      }),
    });
  }

  const queue: number[] = [];
  for (const child of nodes[0]!.next.values()) {
    nodes[child]!.fail = 0;
    queue.push(child);

    yield createStringStep({
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.setFailure, {
        state: child,
        target: 0,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        nodes,
        phase: 'link',
        phaseLabel: I18N.phases.buildFailure,
        activeLabel: `fail(${child}) = 0`,
        decisionLabel: I18N.decisions.stitchFailureLinks,
        currentTextIndex: null,
        currentChar: null,
        activeNodeId: child,
        failurePath: [child, 0],
        matches,
        computation: {
          label: I18N.computation.labels.failureLink,
          expression: `fail[${child}] = 0`,
          result: null,
          note: I18N.computation.notes.failureLink,
        },
      }),
    });
  }

  while (queue.length > 0) {
    const state = queue.shift()!;

    for (const [char, next] of nodes[state]!.next.entries()) {
      let failure = nodes[state]!.fail;
      const path = [state, failure];

      while (failure !== 0 && !nodes[failure]!.next.has(char)) {
        failure = nodes[failure]!.fail;
        path.push(failure);
      }

      const target = nodes[failure]!.next.get(char) ?? 0;
      nodes[next]!.fail = target;
      nodes[next]!.outputs = [...new Set([...nodes[next]!.outputs, ...nodes[target]!.outputs])];
      queue.push(next);

      yield createStringStep({
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.setFailure, {
          state: next,
          target,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          nodes,
          phase: 'link',
          phaseLabel: I18N.phases.buildFailure,
          activeLabel: `fail(${next}) = ${target}`,
          decisionLabel: I18N.decisions.stitchFailureLinks,
          currentTextIndex: null,
          currentChar: char,
          activeNodeId: next,
          failurePath: [...path, next, target],
          matches,
          computation: {
            label: I18N.computation.labels.failureLink,
            expression: `fail[${next}] = ${target}`,
            result: nodes[next]!.outputs.join(', ') || null,
            note: I18N.computation.notes.failureLink,
          },
        }),
      });
    }
  }

  let state = 0;
  for (let index = 0; index < scenario.text.length; index += 1) {
    const char = scenario.text[index]!;

    while (state !== 0 && !nodes[state]!.next.has(char)) {
      const previous = state;
      state = nodes[state]!.fail;

      yield createStringStep({
        activeCodeLine: 8,
        description: i18nText(I18N.descriptions.followFailure, {
          char,
          from: previous,
          target: state,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          nodes,
          phase: 'scan',
          phaseLabel: I18N.phases.scanText,
          activeLabel: `fail ${previous} -> ${state}`,
          decisionLabel: I18N.decisions.chaseFailureLinks,
          currentTextIndex: index,
          currentChar: char,
          activeNodeId: state,
          failurePath: [previous, state],
          matches,
          computation: {
            label: I18N.computation.labels.failureLink,
            expression: `state = fail[${previous}]`,
            result: `state ${state}`,
            note: I18N.computation.notes.failureLink,
          },
        }),
      });
    }

    state = nodes[state]!.next.get(char) ?? 0;

    yield createStringStep({
      activeCodeLine: 7,
      description: i18nText(I18N.descriptions.advanceScan, {
        char,
        index,
        state,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        nodes,
        phase: 'scan',
        phaseLabel: I18N.phases.scanText,
        activeLabel: `text[${index}] = '${char}'`,
        decisionLabel: I18N.decisions.growTrie,
        currentTextIndex: index,
        currentChar: char,
        activeNodeId: state,
        failurePath: [],
        matches,
        computation: {
          label: I18N.computation.labels.textStep,
          expression: `state = goto(${state}, '${char}')`,
          result: `state ${state}`,
          note: I18N.computation.notes.textStep,
        },
      }),
    });

    if (nodes[state]!.outputs.length === 0) {
      continue;
    }

    for (const pattern of nodes[state]!.outputs) {
      matches.push({
        pattern,
        startIndex: index - pattern.length + 1,
        endIndex: index,
      });
    }

    yield createStringStep({
      activeCodeLine: 9,
      description: i18nText(I18N.descriptions.reportMatches, {
        count: nodes[state]!.outputs.length,
        patterns: nodes[state]!.outputs.join(', '),
        state,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        nodes,
        phase: 'scan',
        phaseLabel: I18N.phases.reportMatch,
        activeLabel: `output(${state})`,
        decisionLabel: I18N.decisions.emitOutputs,
        currentTextIndex: index,
        currentChar: char,
        activeNodeId: state,
        failurePath: [],
        matches,
        computation: {
          label: I18N.computation.labels.outputSet,
          expression: `output[${state}] = {${nodes[state]!.outputs.join(', ')}}`,
          result: matches.map((match) => `${match.pattern}@${match.startIndex}`).join(', '),
          note: I18N.computation.notes.outputSet,
        },
        matchNodeId: state,
      }),
    });
  }

  yield createStringStep({
    activeCodeLine: 10,
    description: i18nText(I18N.descriptions.complete, { count: matches.length }),
    phase: 'complete',
    string: makeState({
      scenario,
      nodes,
      phase: 'complete',
      phaseLabel: I18N.phases.complete,
      activeLabel: `matches = ${matches.length}`,
      decisionLabel: I18N.decisions.scanFinished,
      currentTextIndex: null,
      currentChar: null,
      activeNodeId: state,
      failurePath: [],
      matches,
      computation: {
        label: I18N.computation.labels.finalSummary,
        expression: `matches = ${matches.length}`,
        result: matches.map((match) => `${match.pattern}@${match.startIndex}`).join(', ') || null,
        note: I18N.computation.notes.finalSummary,
      },
    }),
  });
}
