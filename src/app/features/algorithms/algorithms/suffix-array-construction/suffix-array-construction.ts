import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  StringSuffixRow,
  SuffixArrayConstructionTraceState,
} from '../../models/string';
import { SuffixArrayScenario } from '../../utils/string-scenarios/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.suffixArray.modeLabel'),
  phases: {
    seedRanks: t('features.algorithms.runtime.string.suffixArray.phases.seedRanks'),
    sortPairs: t('features.algorithms.runtime.string.suffixArray.phases.sortPairs'),
    assignRanks: t('features.algorithms.runtime.string.suffixArray.phases.assignRanks'),
    complete: t('features.algorithms.runtime.string.suffixArray.phases.complete'),
  },
  insights: {
    suffixesLabel: t('features.algorithms.runtime.string.suffixArray.insights.suffixesLabel'),
    strideLabel: t('features.algorithms.runtime.string.suffixArray.insights.strideLabel'),
    distinctRanksLabel: t(
      'features.algorithms.runtime.string.suffixArray.insights.distinctRanksLabel',
    ),
    orderLabel: t('features.algorithms.runtime.string.suffixArray.insights.orderLabel'),
    countValue: t('features.algorithms.runtime.string.suffixArray.insights.countValue'),
    strideValue: t('features.algorithms.runtime.string.suffixArray.insights.strideValue'),
    noneValue: t('features.algorithms.runtime.string.suffixArray.insights.noneValue'),
  },
  descriptions: {
    seed: t('features.algorithms.runtime.string.suffixArray.descriptions.seed'),
    sortPairs: t('features.algorithms.runtime.string.suffixArray.descriptions.sortPairs'),
    assignRanks: t('features.algorithms.runtime.string.suffixArray.descriptions.assignRanks'),
    complete: t('features.algorithms.runtime.string.suffixArray.descriptions.complete'),
  },
  decisions: {
    compareRankPairs: t('features.algorithms.runtime.string.suffixArray.decisions.compareRankPairs'),
    compressClasses: t('features.algorithms.runtime.string.suffixArray.decisions.compressClasses'),
    orderReady: t('features.algorithms.runtime.string.suffixArray.decisions.orderReady'),
  },
  computation: {
    labels: {
      initialRanks: t('features.algorithms.runtime.string.suffixArray.computation.labels.initialRanks'),
      rankPairs: t('features.algorithms.runtime.string.suffixArray.computation.labels.rankPairs'),
      reorderedSuffixes: t(
        'features.algorithms.runtime.string.suffixArray.computation.labels.reorderedSuffixes',
      ),
      newRanks: t('features.algorithms.runtime.string.suffixArray.computation.labels.newRanks'),
      finalArray: t('features.algorithms.runtime.string.suffixArray.computation.labels.finalArray'),
    },
    notes: {
      initialRanks: t('features.algorithms.runtime.string.suffixArray.computation.notes.initialRanks'),
      rankPairs: t('features.algorithms.runtime.string.suffixArray.computation.notes.rankPairs'),
      reorderedSuffixes: t(
        'features.algorithms.runtime.string.suffixArray.computation.notes.reorderedSuffixes',
      ),
      newRanks: t('features.algorithms.runtime.string.suffixArray.computation.notes.newRanks'),
      finalArray: t('features.algorithms.runtime.string.suffixArray.computation.notes.finalArray'),
    },
  },
  labels: {
    pendingArray: t('features.algorithms.runtime.string.suffixArray.labels.pendingArray'),
    readyValue: t('features.algorithms.runtime.string.suffixArray.labels.readyValue'),
  },
} as const;

interface RankTuple {
  readonly index: number;
  readonly first: number;
  readonly second: number;
}

function tupleLabel(tuple: RankTuple): string {
  return `(${tuple.first}, ${tuple.second})`;
}

function buildRows(
  source: string,
  suffixArray: readonly number[],
  ranks: readonly number[],
  tuples: ReadonlyMap<number, RankTuple>,
  activeSuffixes: readonly number[],
): readonly StringSuffixRow[] {
  const active = new Set(activeSuffixes);

  return suffixArray.map((startIndex, order) => ({
    id: `suffix-${startIndex}`,
    startIndex,
    suffix: source.slice(startIndex),
    pairLabel: tupleLabel(
      tuples.get(startIndex) ?? {
        index: startIndex,
        first: ranks[startIndex] ?? -1,
        second: -1,
      },
    ),
    rank: ranks[startIndex] ?? -1,
    order,
    lcp: null,
    tone: active.has(startIndex) ? 'active' : 'sorted',
  }));
}

function resultLabel(suffixArray: readonly number[]): TranslatableText {
  return suffixArray.length === 0
    ? I18N.labels.pendingArray
    : i18nText(I18N.labels.readyValue, { order: suffixArray.join(', ') });
}

function makeState(args: {
  readonly scenario: SuffixArrayScenario;
  readonly phase: SuffixArrayConstructionTraceState['phase'];
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly source: string;
  readonly stepSize: number;
  readonly round: number;
  readonly suffixArray: readonly number[];
  readonly ranks: readonly number[];
  readonly tuples: ReadonlyMap<number, RankTuple>;
  readonly activeSuffixes: readonly number[];
  readonly computation: SuffixArrayConstructionTraceState['computation'];
}): SuffixArrayConstructionTraceState {
  const distinctRanks = args.ranks.length === 0 ? 0 : Math.max(...args.ranks) + 1;

  return {
    mode: 'suffix-array-construction',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: resultLabel(args.suffixArray),
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.suffixesLabel,
        value: i18nText(I18N.insights.countValue, { count: args.source.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.strideLabel,
        value: i18nText(I18N.insights.strideValue, { size: args.stepSize }),
        tone: 'warning',
      },
      {
        label: I18N.insights.distinctRanksLabel,
        value: i18nText(I18N.insights.countValue, { count: distinctRanks }),
        tone: 'accent',
      },
      {
        label: I18N.insights.orderLabel,
        value:
          args.suffixArray.length === 0
            ? I18N.insights.noneValue
            : args.suffixArray.slice(0, 5).join(', '),
        tone: args.suffixArray.length === 0 ? 'info' : 'success',
      },
    ],
    phase: args.phase,
    source: args.source,
    stepSize: args.stepSize,
    round: args.round,
    suffixArray: args.suffixArray,
    ranks: args.ranks,
    rows: buildRows(args.source, args.suffixArray, args.ranks, args.tuples, args.activeSuffixes),
    activeSuffixes: args.activeSuffixes,
    distinctRanks,
  };
}

export function* suffixArrayConstructionGenerator(
  scenario: SuffixArrayScenario,
): Generator<SortStep> {
  const source = scenario.source;
  const n = source.length;
  let ranks = Array.from(source, (char) => char.codePointAt(0) ?? 0);
  let suffixArray = Array.from({ length: n }, (_, index) => index);
  let tuples = new Map<number, RankTuple>(
    suffixArray.map((index) => [
      index,
      {
        index,
        first: ranks[index] ?? -1,
        second: -1,
      },
    ]),
  );

  suffixArray = [...suffixArray].sort((left, right) => {
    if (source[left] === source[right]) return left - right;
    return source[left]!.localeCompare(source[right]!);
  });

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.seed, { text: source }),
    phase: 'init',
    string: makeState({
      scenario,
      phase: 'seed',
      phaseLabel: I18N.phases.seedRanks,
      activeLabel: 'rank[i] = code(text[i])',
      decisionLabel: I18N.decisions.compareRankPairs,
      source,
      stepSize: 1,
      round: 1,
      suffixArray,
      ranks,
      tuples,
      activeSuffixes: [],
      computation: {
        label: I18N.computation.labels.initialRanks,
        expression: `ranks = [${ranks.join(', ')}]`,
        result: null,
        note: I18N.computation.notes.initialRanks,
      },
    }),
  });

  let stepSize = 1;
  let round = 1;

  while (stepSize < n) {
    tuples = new Map<number, RankTuple>(
      Array.from({ length: n }, (_, index) => [
        index,
        {
          index,
          first: ranks[index] ?? -1,
          second: index + stepSize < n ? (ranks[index + stepSize] ?? -1) : -1,
        },
      ]),
    );

    yield createStringStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.sortPairs, {
        round,
        stepSize,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phase: 'sort',
        phaseLabel: I18N.phases.sortPairs,
        activeLabel: `k = ${stepSize}`,
        decisionLabel: I18N.decisions.compareRankPairs,
        source,
        stepSize,
        round,
        suffixArray,
        ranks,
        tuples,
        activeSuffixes: suffixArray.slice(0, Math.min(3, suffixArray.length)),
        computation: {
          label: I18N.computation.labels.rankPairs,
          expression: suffixArray.map((index) => `${index}:${tupleLabel(tuples.get(index)!)} `).join(''),
          result: null,
          note: I18N.computation.notes.rankPairs,
        },
      }),
    });

    suffixArray = [...suffixArray].sort((left, right) => {
      const leftTuple = tuples.get(left)!;
      const rightTuple = tuples.get(right)!;
      if (leftTuple.first !== rightTuple.first) return leftTuple.first - rightTuple.first;
      if (leftTuple.second !== rightTuple.second) return leftTuple.second - rightTuple.second;
      return left - right;
    });

    const nextRanks = Array.from({ length: n }, () => 0);
    let rank = 0;
    nextRanks[suffixArray[0]!] = 0;

    for (let order = 1; order < suffixArray.length; order += 1) {
      const current = tuples.get(suffixArray[order]!)!;
      const previous = tuples.get(suffixArray[order - 1]!)!;
      if (current.first !== previous.first || current.second !== previous.second) {
        rank += 1;
      }
      nextRanks[suffixArray[order]!] = rank;
    }

    yield createStringStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.assignRanks, {
        round,
        classes: rank + 1,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phase: 'rank',
        phaseLabel: I18N.phases.assignRanks,
        activeLabel: `classes = ${rank + 1}`,
        decisionLabel: I18N.decisions.compressClasses,
        source,
        stepSize,
        round,
        suffixArray,
        ranks: nextRanks,
        tuples,
        activeSuffixes: suffixArray.slice(0, Math.min(3, suffixArray.length)),
        computation: {
          label: I18N.computation.labels.newRanks,
          expression: `sa = [${suffixArray.join(', ')}]`,
          result: `ranks = [${nextRanks.join(', ')}]`,
          note: I18N.computation.notes.newRanks,
        },
      }),
    });

    ranks = nextRanks;
    if (rank === n - 1) {
      break;
    }

    stepSize *= 2;
    round += 1;
  }

  yield createStringStep({
    activeCodeLine: 6,
    description: i18nText(I18N.descriptions.complete, { order: suffixArray.join(', ') }),
    phase: 'complete',
    string: makeState({
      scenario,
      phase: 'complete',
      phaseLabel: I18N.phases.complete,
      activeLabel: `sa = [${suffixArray.join(', ')}]`,
      decisionLabel: I18N.decisions.orderReady,
      source,
      stepSize,
      round,
      suffixArray,
      ranks,
      tuples,
      activeSuffixes: suffixArray.slice(0, Math.min(3, suffixArray.length)),
      computation: {
        label: I18N.computation.labels.finalArray,
        expression: `sa = [${suffixArray.join(', ')}]`,
        result: `ranks = [${ranks.join(', ')}]`,
        note: I18N.computation.notes.finalArray,
      },
    }),
  });
}
