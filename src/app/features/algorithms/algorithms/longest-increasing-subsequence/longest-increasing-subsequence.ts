import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { LisScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.modeLabel'),
  phases: {
    initializeSingletons: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.initializeSingletons',
    ),
    inspectPredecessor: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.inspectPredecessor',
    ),
    commitPredecessor: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.commitPredecessor',
    ),
    lockIndexResult: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.lockIndexResult',
    ),
    chooseEndpoint: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.chooseEndpoint',
    ),
    backtrackPath: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.backtrackPath',
    ),
    complete: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.initialize'),
    canExtend: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.canExtend'),
    blocked: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.blocked'),
    commitPredecessor: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.commitPredecessor',
    ),
    lockResult: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.lockResult'),
    chooseEndpoint: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.chooseEndpoint',
    ),
    backtrack: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.backtrack'),
    complete: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.descriptions.complete'),
  },
  insights: {
    valuesLabel: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.insights.valuesLabel'),
    bestLengthLabel: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.insights.bestLengthLabel',
    ),
    chosenRouteLabel: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.insights.chosenRouteLabel',
    ),
    peakValueLabel: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.insights.peakValueLabel',
    ),
    stripLabel: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.insights.stripLabel'),
  },
  labels: {
    blocked: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.blocked'),
    idxValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.idxValue'),
    inputValuesLabel: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.inputValuesLabel',
    ),
    currentLengthsLabel: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.currentLengthsLabel',
    ),
    activeIndex: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.activeIndex'),
    resultLength: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.resultLength'),
    pathValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.pathPending'),
    edgeLabel: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.edgeLabel'),
    lenIndex: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.lenIndex'),
    finishValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.finishValue'),
    bestEndpoint: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.bestEndpoint',
    ),
    traceValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.traceValue'),
    prevValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.prevValue'),
    startValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.startValue'),
    stripValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.stripValue'),
  },
  decisions: {
    newBestPredecessor: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.newBestPredecessor',
    ),
    keepPreviousBest: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.keepPreviousBest',
    ),
    skipCandidate: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.skipCandidate',
    ),
    routeFlowsThrough: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.routeFlowsThrough',
    ),
    singleValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.singleValue'),
    bestPredecessorKept: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.bestPredecessorKept',
    ),
    lengthValue: t('features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.lengthValue'),
    sequenceOrigin: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.sequenceOrigin',
    ),
    jumpToPredecessor: t(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.decisions.jumpToPredecessor',
    ),
  },
} as const;

export function* longestIncreasingSubsequenceGenerator(scenario: LisScenario): Generator<SortStep> {
  const values = scenario.values;
  const count = values.length;
  const lengths = Array.from({ length: count }, () => 1);
  const prev = Array.from({ length: count }, () => null as number | null);
  const chosenIndices = new Set<number>();

  yield createStep({
    scenario,
    lengths,
    prev,
    chosenIndices,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeSingletons,
    phase: 'init',
  });

  for (let index = 0; index < count; index++) {
    for (let candidate = 0; candidate < index; candidate++) {
      const canExtend = values[candidate]! < values[index]!;
      const candidateLength = canExtend ? lengths[candidate]! + 1 : lengths[index]!;

      yield createStep({
        scenario,
        lengths,
        prev,
        chosenIndices,
        activeIndex: index,
        candidateIndex: candidate,
        description: canExtend
          ? i18nText(I18N.descriptions.canExtend, {
              from: values[candidate],
              to: values[index],
              length: lengths[candidate],
            })
          : i18nText(I18N.descriptions.blocked, {
              from: values[candidate],
              to: values[index],
            }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.inspectPredecessor,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.edgeLabel, {
            from: values[candidate],
            to: values[index],
          }),
          expression: canExtend ? `${lengths[candidate]} + 1` : `${values[candidate]} >= ${values[index]}`,
          result: canExtend ? String(candidateLength) : I18N.labels.blocked,
          decision: canExtend && candidateLength > lengths[index]!
            ? I18N.decisions.newBestPredecessor
            : canExtend
              ? I18N.decisions.keepPreviousBest
              : I18N.decisions.skipCandidate,
        },
      });

      if (canExtend && candidateLength > lengths[index]!) {
        lengths[index] = candidateLength;
        prev[index] = candidate;

        yield createStep({
          scenario,
          lengths,
          prev,
          chosenIndices,
          activeIndex: index,
          candidateIndex: candidate,
          activeStatus: 'improved',
          description: i18nText(I18N.descriptions.commitPredecessor, {
            index: index + 1,
            length: candidateLength,
            predecessor: candidate + 1,
          }),
          activeCodeLine: 6,
          phaseLabel: I18N.phases.commitPredecessor,
          phase: 'settle-node',
          computation: {
            label: i18nText(I18N.labels.lenIndex, { index: index + 1 }),
            expression: `prev = ${candidate + 1}`,
            result: String(candidateLength),
            decision: i18nText(I18N.decisions.routeFlowsThrough, {
              value: values[candidate],
            }),
          },
        });
      }
    }

    yield createStep({
      scenario,
      lengths,
      prev,
      chosenIndices,
      activeIndex: index,
      activeStatus: 'chosen',
      description: i18nText(I18N.descriptions.lockResult, { index: index + 1 }),
      activeCodeLine: 8,
      phaseLabel: I18N.phases.lockIndexResult,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.finishValue, { value: values[index] }),
        expression: `len = ${lengths[index]}`,
        result:
          prev[index] === null
            ? I18N.labels.startValue
            : i18nText(I18N.labels.prevValue, { value: values[prev[index]!] }),
        decision: prev[index] === null ? I18N.decisions.singleValue : I18N.decisions.bestPredecessorKept,
      },
    });
  }

  let bestIndex = 0;
  for (let index = 1; index < count; index++) {
    if (lengths[index]! > lengths[bestIndex]!) bestIndex = index;
  }

  yield createStep({
    scenario,
    lengths,
    prev,
    chosenIndices,
    activeIndex: bestIndex,
    activeStatus: 'improved',
    description: i18nText(I18N.descriptions.chooseEndpoint, { index: bestIndex + 1 }),
    activeCodeLine: 10,
    phaseLabel: I18N.phases.chooseEndpoint,
    phase: 'compare',
    computation: {
      label: I18N.labels.bestEndpoint,
      expression: lengths.map((value, index) => `i${index + 1}:${value}`).join(' · '),
      result: `i${bestIndex + 1}`,
      decision: i18nText(I18N.decisions.lengthValue, { value: lengths[bestIndex] }),
    },
  });

  let cursor: number | null = bestIndex;
  while (cursor !== null) {
    chosenIndices.add(cursor);

    yield createStep({
      scenario,
      lengths,
      prev,
      chosenIndices,
      activeIndex: cursor,
      activeStatus: 'backtrack',
      description: i18nText(I18N.descriptions.backtrack, { index: cursor + 1 }),
      activeCodeLine: 11,
      phaseLabel: I18N.phases.backtrackPath,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.traceValue, { value: values[cursor] }),
        expression:
          prev[cursor] === null
            ? I18N.labels.startValue
            : `prev = ${values[prev[cursor]!]} `,
        result: lisLabel(scenario, chosenIndices),
        decision: prev[cursor] === null ? I18N.decisions.sequenceOrigin : I18N.decisions.jumpToPredecessor,
      },
    });

    cursor = prev[cursor];
  }

  yield createStep({
    scenario,
    lengths,
    prev,
    chosenIndices,
    description: i18nText(I18N.descriptions.complete, { length: lengths[bestIndex]! }),
    activeCodeLine: 12,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: LisScenario;
  readonly lengths: readonly number[];
  readonly prev: readonly (number | null)[];
  readonly chosenIndices: ReadonlySet<number>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndex?: number;
  readonly activeStatus?: 'active' | 'improved' | 'chosen' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const colHeaders: DpHeaderConfig[] = args.scenario.values.map((value, index) => ({
    id: `col-${index}`,
    label: `${index + 1}`,
    status: (args.activeIndex === index ? 'active' : args.candidateIndex === index ? 'accent' : 'idle') as DpHeaderConfig['status'],
    metaLabel: `${value}`,
  }));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-values', label: 'value', status: 'source', metaLabel: 'input' },
    { id: 'row-len', label: 'len', status: 'accent', metaLabel: 'best' },
    { id: 'row-prev', label: 'prev', status: 'target', metaLabel: 'link' },
  ];

  const cells: DpCellConfig[] = [];
  for (let index = 0; index < args.scenario.values.length; index++) {
    const isChosen = args.chosenIndices.has(index);
    const isActive = args.activeIndex === index;
    const isCandidate = args.candidateIndex === index;

    const valueTags: DpTraceTag[] = [];
    if (isCandidate) valueTags.push('take');
    if (isChosen) valueTags.push('path');
    if (isActive) valueTags.push('active');

    const lenTags: DpTraceTag[] = ['best'];
    if (isCandidate) lenTags.push('take');
    if (isChosen) lenTags.push('path');
    if (isActive) lenTags.push('active');

    const prevTags: DpTraceTag[] = [];
    if (args.prev[index] !== null) prevTags.push('skip');
    if (isChosen) prevTags.push('path');
    if (isActive) prevTags.push('active');

    cells.push({
      row: 0,
      col: index,
      rowLabel: 'value',
      colLabel: `${index + 1}`,
      valueLabel: String(args.scenario.values[index]!),
      metaLabel: isChosen ? 'LIS' : null,
      status: isChosen ? 'backtrack' : isCandidate ? 'candidate' : 'base',
      tags: valueTags,
    });

    cells.push({
      row: 1,
      col: index,
      rowLabel: 'len',
      colLabel: `${index + 1}`,
      valueLabel: String(args.lengths[index]!),
      metaLabel: `i${index + 1}`,
      status: isChosen
        ? 'backtrack'
        : isActive
          ? (args.activeStatus ?? 'active')
          : isCandidate
            ? 'candidate'
            : 'chosen',
      tags: lenTags,
    });

    cells.push({
      row: 2,
      col: index,
      rowLabel: 'prev',
      colLabel: `${index + 1}`,
      valueLabel: args.prev[index] === null ? '—' : String(args.prev[index]! + 1),
      metaLabel: args.prev[index] === null ? 'start' : `${args.scenario.values[args.prev[index]!]}`,
      status: isChosen ? 'backtrack' : isActive ? 'active' : args.prev[index] === null ? 'base' : 'idle',
      tags: prevTags,
    });
  }

  const bestLength = Math.max(...args.lengths);
  const insights: DpInsight[] = [
    { label: I18N.insights.valuesLabel, value: String(args.scenario.values.length), tone: 'accent' },
    { label: I18N.insights.bestLengthLabel, value: String(bestLength), tone: 'success' },
    { label: I18N.insights.chosenRouteLabel, value: String(args.chosenIndices.size), tone: 'warning' },
    { label: I18N.insights.peakValueLabel, value: String(Math.max(...args.scenario.values)), tone: 'info' },
    { label: I18N.insights.stripLabel, value: I18N.labels.stripValue, tone: 'info' },
  ];

  return createDpStep({
    mode: 'longest-increasing-subsequence',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultLength, { value: bestLength }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `3 × ${args.scenario.values.length}`,
    activeLabel: args.activeIndex === undefined
      ? null
      : i18nText(I18N.labels.activeIndex, {
          index: args.activeIndex + 1,
          value: args.scenario.values[args.activeIndex]!,
        }),
    pathLabel: lisLabel(args.scenario, args.chosenIndices),
    primaryItemsLabel: I18N.labels.inputValuesLabel,
    primaryItems: args.scenario.values.map((value, index) => `${index + 1}:${value}`),
    secondaryItemsLabel: I18N.labels.currentLengthsLabel,
    secondaryItems: args.lengths.map((value, index) => `i${index + 1}=${value}`),
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function lisLabel(
  scenario: LisScenario,
  chosenIndices: ReadonlySet<number>,
): TranslatableText {
  const ordered = Array.from(chosenIndices).sort((left, right) => left - right).map((index) => scenario.values[index]!);
  return ordered.length > 0
    ? i18nText(I18N.labels.pathValue, { values: ordered.join(' → ') })
    : I18N.labels.pathPending;
}
