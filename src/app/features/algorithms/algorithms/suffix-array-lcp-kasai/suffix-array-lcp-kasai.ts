import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  StringSuffixRow,
  SuffixArrayLcpTraceState,
} from '../../models/string';
import { SuffixArrayLcpScenario } from '../../utils/scenarios/string/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.suffixArrayLcp.modeLabel'),
  phases: {
    seedOrder: t('features.algorithms.runtime.string.suffixArrayLcp.phases.seedOrder'),
    kasaiScan: t('features.algorithms.runtime.string.suffixArrayLcp.phases.kasaiScan'),
    complete: t('features.algorithms.runtime.string.suffixArrayLcp.phases.complete'),
  },
  insights: {
    suffixesLabel: t('features.algorithms.runtime.string.suffixArrayLcp.insights.suffixesLabel'),
    activePairLabel: t('features.algorithms.runtime.string.suffixArrayLcp.insights.activePairLabel'),
    overlapLabel: t('features.algorithms.runtime.string.suffixArrayLcp.insights.overlapLabel'),
    readyLcpLabel: t('features.algorithms.runtime.string.suffixArrayLcp.insights.readyLcpLabel'),
    countValue: t('features.algorithms.runtime.string.suffixArrayLcp.insights.countValue'),
    pairValue: t('features.algorithms.runtime.string.suffixArrayLcp.insights.pairValue'),
    noneValue: t('features.algorithms.runtime.string.suffixArrayLcp.insights.noneValue'),
  },
  descriptions: {
    seed: t('features.algorithms.runtime.string.suffixArrayLcp.descriptions.seed'),
    compare: t('features.algorithms.runtime.string.suffixArrayLcp.descriptions.compare'),
    complete: t('features.algorithms.runtime.string.suffixArrayLcp.descriptions.complete'),
  },
  decisions: {
    reuseOverlap: t('features.algorithms.runtime.string.suffixArrayLcp.decisions.reuseOverlap'),
    compareNeighbors: t(
      'features.algorithms.runtime.string.suffixArrayLcp.decisions.compareNeighbors',
    ),
    lcpReady: t('features.algorithms.runtime.string.suffixArrayLcp.decisions.lcpReady'),
  },
  computation: {
    labels: {
      suffixArray: t('features.algorithms.runtime.string.suffixArrayLcp.computation.labels.suffixArray'),
      kasaiStep: t('features.algorithms.runtime.string.suffixArrayLcp.computation.labels.kasaiStep'),
      finalLcp: t('features.algorithms.runtime.string.suffixArrayLcp.computation.labels.finalLcp'),
    },
    notes: {
      suffixArray: t('features.algorithms.runtime.string.suffixArrayLcp.computation.notes.suffixArray'),
      kasaiStep: t('features.algorithms.runtime.string.suffixArrayLcp.computation.notes.kasaiStep'),
      finalLcp: t('features.algorithms.runtime.string.suffixArrayLcp.computation.notes.finalLcp'),
    },
  },
  labels: {
    pendingLcp: t('features.algorithms.runtime.string.suffixArrayLcp.labels.pendingLcp'),
    readyValue: t('features.algorithms.runtime.string.suffixArrayLcp.labels.readyValue'),
  },
} as const;

interface RankTuple {
  readonly first: number;
  readonly second: number;
}

function buildSuffixArray(source: string): readonly number[] {
  const n = source.length;
  let ranks = Array.from(source, (char) => char.codePointAt(0) ?? 0);
  let suffixArray = Array.from({ length: n }, (_, index) => index);
  let stepSize = 1;

  while (stepSize < n) {
    const tuples = new Map<number, RankTuple>(
      Array.from({ length: n }, (_, index) => [
        index,
        {
          first: ranks[index] ?? -1,
          second: index + stepSize < n ? (ranks[index + stepSize] ?? -1) : -1,
        },
      ]),
    );

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

    ranks = nextRanks;
    if (rank === n - 1) break;
    stepSize *= 2;
  }

  return suffixArray;
}

function buildRows(
  source: string,
  suffixArray: readonly number[],
  lcpValues: readonly number[],
  activeSuffixes: readonly number[],
): readonly StringSuffixRow[] {
  const active = new Set(activeSuffixes);

  return suffixArray.map((startIndex, order) => ({
    id: `suffix-${startIndex}`,
    startIndex,
    suffix: source.slice(startIndex),
    pairLabel: `rank ${order}`,
    rank: order,
    order,
    lcp: order < suffixArray.length - 1 ? (lcpValues[order] ?? 0) : null,
    tone: active.has(startIndex) ? 'active' : 'sorted',
  }));
}

function resultLabel(lcpValues: readonly number[]): TranslatableText {
  const meaningful = lcpValues.slice(0, Math.max(lcpValues.length - 1, 0));
  return meaningful.length === 0
    ? I18N.labels.pendingLcp
    : i18nText(I18N.labels.readyValue, { values: meaningful.join(', ') });
}

function makeState(args: {
  readonly scenario: SuffixArrayLcpScenario;
  readonly phase: SuffixArrayLcpTraceState['phase'];
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly source: string;
  readonly suffixArray: readonly number[];
  readonly rankArray: readonly number[];
  readonly lcpValues: readonly number[];
  readonly activeSuffixes: readonly number[];
  readonly activeOrder: number | null;
  readonly compareWith: number | null;
  readonly currentMatchLength: number;
  readonly computation: SuffixArrayLcpTraceState['computation'];
}): SuffixArrayLcpTraceState {
  return {
    mode: 'suffix-array-lcp-kasai',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: resultLabel(args.lcpValues),
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.suffixesLabel,
        value: i18nText(I18N.insights.countValue, { count: args.suffixArray.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.activePairLabel,
        value:
          args.activeSuffixes.length === 2
            ? i18nText(I18N.insights.pairValue, {
                left: args.activeSuffixes[0]!,
                right: args.activeSuffixes[1]!,
              })
            : I18N.insights.noneValue,
        tone: args.activeSuffixes.length === 2 ? 'accent' : 'info',
      },
      {
        label: I18N.insights.overlapLabel,
        value: String(args.currentMatchLength),
        tone: 'warning',
      },
      {
        label: I18N.insights.readyLcpLabel,
        value: i18nText(I18N.insights.countValue, {
          count: Math.max(args.lcpValues.length - 1, 0),
        }),
        tone: 'success',
      },
    ],
    phase: args.phase,
    source: args.source,
    suffixArray: args.suffixArray,
    rankArray: args.rankArray,
    lcpValues: args.lcpValues,
    rows: buildRows(args.source, args.suffixArray, args.lcpValues, args.activeSuffixes),
    activeSuffixes: args.activeSuffixes,
    activeOrder: args.activeOrder,
    compareWith: args.compareWith,
    currentMatchLength: args.currentMatchLength,
  };
}

export function* suffixArrayLcpKasaiGenerator(
  scenario: SuffixArrayLcpScenario,
): Generator<SortStep> {
  const source = scenario.source;
  const suffixArray = buildSuffixArray(source);
  const rankArray = Array.from({ length: source.length }, () => 0);
  const lcpValues = Array.from({ length: source.length }, () => 0);

  for (let order = 0; order < suffixArray.length; order += 1) {
    rankArray[suffixArray[order]!] = order;
  }

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.seed, {
      suffixArray: suffixArray.join(', '),
      text: source,
    }),
    phase: 'init',
    string: makeState({
      scenario,
      phase: 'seed',
      phaseLabel: I18N.phases.seedOrder,
      activeLabel: `sa = [${suffixArray.join(', ')}]`,
      decisionLabel: I18N.decisions.reuseOverlap,
      source,
      suffixArray,
      rankArray,
      lcpValues,
      activeSuffixes: [],
      activeOrder: null,
      compareWith: null,
      currentMatchLength: 0,
      computation: {
        label: I18N.computation.labels.suffixArray,
        expression: `sa = [${suffixArray.join(', ')}]`,
        result: `rank = [${rankArray.join(', ')}]`,
        note: I18N.computation.notes.suffixArray,
      },
    }),
  });

  let overlap = 0;
  for (let index = 0; index < source.length; index += 1) {
    const order = rankArray[index]!;
    if (order === suffixArray.length - 1) {
      overlap = 0;
      continue;
    }

    const nextSuffix = suffixArray[order + 1]!;
    while (
      index + overlap < source.length &&
      nextSuffix + overlap < source.length &&
      source[index + overlap] === source[nextSuffix + overlap]
    ) {
      overlap += 1;
    }

    lcpValues[order] = overlap;

    yield createStringStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.compare, {
        left: index,
        right: nextSuffix,
        overlap,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phase: 'scan',
        phaseLabel: I18N.phases.kasaiScan,
        activeLabel: `lcp[${order}] = ${overlap}`,
        decisionLabel: I18N.decisions.compareNeighbors,
        source,
        suffixArray,
        rankArray,
        lcpValues: [...lcpValues],
        activeSuffixes: [index, nextSuffix],
        activeOrder: order,
        compareWith: nextSuffix,
        currentMatchLength: overlap,
        computation: {
          label: I18N.computation.labels.kasaiStep,
          expression: `lcp(${index}, ${nextSuffix}) = ${overlap}`,
          result: `lcp[${order}] = ${overlap}`,
          note: I18N.computation.notes.kasaiStep,
        },
      }),
    });

    if (overlap > 0) {
      overlap -= 1;
    }
  }

  yield createStringStep({
    activeCodeLine: 5,
    description: i18nText(I18N.descriptions.complete, {
      values: lcpValues.slice(0, Math.max(lcpValues.length - 1, 0)).join(', '),
    }),
    phase: 'complete',
    string: makeState({
      scenario,
      phase: 'complete',
      phaseLabel: I18N.phases.complete,
      activeLabel: `lcp = [${lcpValues.join(', ')}]`,
      decisionLabel: I18N.decisions.lcpReady,
      source,
      suffixArray,
      rankArray,
      lcpValues,
      activeSuffixes: [],
      activeOrder: null,
      compareWith: null,
      currentMatchLength: 0,
      computation: {
        label: I18N.computation.labels.finalLcp,
        expression: `lcp = [${lcpValues.join(', ')}]`,
        result: null,
        note: I18N.computation.notes.finalLcp,
      },
    }),
  });
}
