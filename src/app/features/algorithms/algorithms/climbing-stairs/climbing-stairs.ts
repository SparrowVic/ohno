import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep } from '../dp-step';
import { DpComputation, DpInsight } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { ClimbingStairsScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.climbingStairs.modeLabel'),
  phases: {
    initializeLandings: t(
      'features.algorithms.runtime.dp.climbingStairs.phases.initializeLandings',
    ),
    inspectParents: t('features.algorithms.runtime.dp.climbingStairs.phases.inspectParents'),
    commitCount: t('features.algorithms.runtime.dp.climbingStairs.phases.commitCount'),
    complete: t('features.algorithms.runtime.dp.climbingStairs.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.climbingStairs.descriptions.initialize'),
    inspectParents: t(
      'features.algorithms.runtime.dp.climbingStairs.descriptions.inspectParents',
    ),
    commitCount: t('features.algorithms.runtime.dp.climbingStairs.descriptions.commitCount'),
    complete: t('features.algorithms.runtime.dp.climbingStairs.descriptions.complete'),
  },
  insights: {
    stairsLabel: t('features.algorithms.runtime.dp.climbingStairs.insights.stairsLabel'),
    waysLabel: t('features.algorithms.runtime.dp.climbingStairs.insights.waysLabel'),
    lastPairLabel: t('features.algorithms.runtime.dp.climbingStairs.insights.lastPairLabel'),
    baseLabel: t('features.algorithms.runtime.dp.climbingStairs.insights.baseLabel'),
    stripLabel: t('features.algorithms.runtime.dp.climbingStairs.insights.stripLabel'),
  },
  labels: {
    resultValue: t('features.algorithms.runtime.dp.climbingStairs.labels.resultValue'),
    activeStep: t('features.algorithms.runtime.dp.climbingStairs.labels.activeStep'),
    pathValue: t('features.algorithms.runtime.dp.climbingStairs.labels.pathValue'),
    landingIndicesLabel: t(
      'features.algorithms.runtime.dp.climbingStairs.labels.landingIndicesLabel',
    ),
    computedWaysLabel: t(
      'features.algorithms.runtime.dp.climbingStairs.labels.computedWaysLabel',
    ),
    stepFormula: t('features.algorithms.runtime.dp.climbingStairs.labels.stepFormula'),
    lastPairValue: t('features.algorithms.runtime.dp.climbingStairs.labels.lastPairValue'),
    seedValue: t('features.algorithms.runtime.dp.climbingStairs.labels.seedValue'),
    baseValue: t('features.algorithms.runtime.dp.climbingStairs.labels.baseValue'),
    stripValue: t('features.algorithms.runtime.dp.climbingStairs.labels.stripValue'),
  },
  decisions: {
    addArrivals: t('features.algorithms.runtime.dp.climbingStairs.decisions.addArrivals'),
    recurrenceCommitted: t(
      'features.algorithms.runtime.dp.climbingStairs.decisions.recurrenceCommitted',
    ),
  },
} as const;

export function* climbingStairsGenerator(scenario: ClimbingStairsScenario): Generator<SortStep> {
  const ways = Array.from({ length: scenario.steps + 1 }, () => 0);
  ways[0] = 1;
  if (scenario.steps >= 1) ways[1] = 1;

  yield createStep({
    scenario,
    ways,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeLandings,
    phase: 'init',
  });

  for (let step = 2; step <= scenario.steps; step++) {
    yield createStep({
      scenario,
      ways,
      activeIndex: step,
      candidateIndexes: [step - 1, step - 2],
      description: i18nText(I18N.descriptions.inspectParents, {
        step,
        prev: step - 1,
        prevPrev: step - 2,
      }),
      activeCodeLine: 4,
      phaseLabel: I18N.phases.inspectParents,
      phase: 'compare',
      computation: {
        label: i18nText(I18N.labels.stepFormula, { step }),
        expression: `${ways[step - 1]!} + ${ways[step - 2]!}`,
        result: String(ways[step - 1]! + ways[step - 2]!),
        decision: I18N.decisions.addArrivals,
      },
    });

    ways[step] = ways[step - 1]! + ways[step - 2]!;

    yield createStep({
      scenario,
      ways,
      activeIndex: step,
      candidateIndexes: [step - 1, step - 2],
      activeStatus: 'improved',
      description: i18nText(I18N.descriptions.commitCount, { step }),
      activeCodeLine: 5,
      phaseLabel: I18N.phases.commitCount,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.stepFormula, { step }),
        expression: `${ways[step - 1]!} + ${ways[step - 2]!}`,
        result: String(ways[step]!),
        decision: I18N.decisions.recurrenceCommitted,
      },
    });
  }

  yield createStep({
    scenario,
    ways,
    activeIndex: scenario.steps,
    activeStatus: 'chosen',
    description: i18nText(I18N.descriptions.complete, { step: scenario.steps }),
    activeCodeLine: 6,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: ClimbingStairsScenario;
  readonly ways: readonly number[];
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndexes?: readonly number[];
  readonly activeStatus?: 'active' | 'improved' | 'chosen';
  readonly computation?: DpComputation | null;
}): SortStep {
  const candidateSet = new Set(args.candidateIndexes ?? []);
  const rowHeaders: DpHeaderConfig[] = [{ id: 'row-ways', label: 'ways', status: 'accent', metaLabel: 'count' }];
  const colHeaders: DpHeaderConfig[] = args.ways.map((_, index) => ({
    id: `col-${index}`,
    label: String(index),
    status: (args.activeIndex === index ? 'active' : candidateSet.has(index) ? 'accent' : index <= 1 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: index === 0 ? 'ground' : 'step',
  }));

  const cells: DpCellConfig[] = args.ways.map((value, index) => ({
    row: 0,
    col: index,
    rowLabel: 'ways',
    colLabel: `${index}`,
    valueLabel: String(value),
    metaLabel: index === 0 ? 'base' : index === args.scenario.steps ? 'goal' : null,
    status:
      args.activeIndex === index
        ? (args.activeStatus ?? 'active')
        : index <= 1
          ? 'base'
          : candidateSet.has(index)
            ? 'candidate'
            : index < (args.activeIndex ?? 0)
              ? 'chosen'
              : 'idle',
    tags: [
      ...(index <= 1 ? (['base'] as const) : []),
      ...(candidateSet.has(index) ? (['best'] as const) : []),
      ...(args.activeIndex === index ? (['active'] as const) : []),
    ],
  }));

  const insights: DpInsight[] = [
    { label: I18N.insights.stairsLabel, value: String(args.scenario.steps), tone: 'accent' },
    {
      label: I18N.insights.waysLabel,
      value: String(args.ways[args.scenario.steps] ?? 0),
      tone: 'success',
    },
    {
      label: I18N.insights.lastPairLabel,
      value:
        args.activeIndex && args.activeIndex >= 2
          ? i18nText(I18N.labels.lastPairValue, {
              left: args.ways[args.activeIndex - 1],
              right: args.ways[args.activeIndex - 2],
            })
          : I18N.labels.seedValue,
      tone: 'warning',
    },
    { label: I18N.insights.baseLabel, value: I18N.labels.baseValue, tone: 'info' },
    {
      label: I18N.insights.stripLabel,
      value: i18nText(I18N.labels.stripValue, { length: args.ways.length }),
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'climbing-stairs',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultValue, {
      value: args.ways[args.scenario.steps] ?? 0,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `1 × ${args.ways.length}`,
    activeLabel:
      args.activeIndex === undefined
        ? null
        : i18nText(I18N.labels.activeStep, { step: args.activeIndex }),
    pathLabel: i18nText(I18N.labels.pathValue, { sequence: args.ways.join(' · ') }),
    primaryItemsLabel: I18N.labels.landingIndicesLabel,
    primaryItems: args.ways.map((_, index) => `step ${index}`),
    secondaryItemsLabel: I18N.labels.computedWaysLabel,
    secondaryItems: args.ways.map((value, index) => `w${index}=${value}`),
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
