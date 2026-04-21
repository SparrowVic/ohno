import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep } from '../dp-step';
import { DpComputation, DpInsight } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { FibonacciScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.fibonacci.modeLabel'),
  phases: {
    initializeBaseTerms: t('features.algorithms.runtime.dp.fibonacci.phases.initializeBaseTerms'),
    inspectParents: t('features.algorithms.runtime.dp.fibonacci.phases.inspectParents'),
    commitTerm: t('features.algorithms.runtime.dp.fibonacci.phases.commitTerm'),
    complete: t('features.algorithms.runtime.dp.fibonacci.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.fibonacci.descriptions.initialize'),
    inspectParents: t('features.algorithms.runtime.dp.fibonacci.descriptions.inspectParents'),
    commitTerm: t('features.algorithms.runtime.dp.fibonacci.descriptions.commitTerm'),
    complete: t('features.algorithms.runtime.dp.fibonacci.descriptions.complete'),
  },
  insights: {
    nLabel: t('features.algorithms.runtime.dp.fibonacci.insights.nLabel'),
    resultLabel: t('features.algorithms.runtime.dp.fibonacci.insights.resultLabel'),
    growthLabel: t('features.algorithms.runtime.dp.fibonacci.insights.growthLabel'),
    baseLabel: t('features.algorithms.runtime.dp.fibonacci.insights.baseLabel'),
    stripLabel: t('features.algorithms.runtime.dp.fibonacci.insights.stripLabel'),
  },
  labels: {
    resultValue: t('features.algorithms.runtime.dp.fibonacci.labels.resultValue'),
    activeTerm: t('features.algorithms.runtime.dp.fibonacci.labels.activeTerm'),
    pathValue: t('features.algorithms.runtime.dp.fibonacci.labels.pathValue'),
    termIndicesLabel: t('features.algorithms.runtime.dp.fibonacci.labels.termIndicesLabel'),
    cachedValuesLabel: t('features.algorithms.runtime.dp.fibonacci.labels.cachedValuesLabel'),
    growthPair: t('features.algorithms.runtime.dp.fibonacci.labels.growthPair'),
    seedValue: t('features.algorithms.runtime.dp.fibonacci.labels.seedValue'),
    baseValue: t('features.algorithms.runtime.dp.fibonacci.labels.baseValue'),
    stripValue: t('features.algorithms.runtime.dp.fibonacci.labels.stripValue'),
    termFormula: t('features.algorithms.runtime.dp.fibonacci.labels.termFormula'),
  },
  decisions: {
    combineAdjacentCachedTerms: t(
      'features.algorithms.runtime.dp.fibonacci.decisions.combineAdjacentCachedTerms',
    ),
    cacheFilledForFutureTerms: t(
      'features.algorithms.runtime.dp.fibonacci.decisions.cacheFilledForFutureTerms',
    ),
  },
} as const;

export function* fibonacciDpGenerator(scenario: FibonacciScenario): Generator<SortStep> {
  const fib = Array.from({ length: scenario.n + 1 }, () => 0);
  if (scenario.n >= 1) fib[1] = 1;

  yield createStep({
    scenario,
    fib,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBaseTerms,
    phase: 'init',
  });

  for (let index = 2; index <= scenario.n; index++) {
    yield createStep({
      scenario,
      fib,
      activeIndex: index,
      candidateIndexes: [index - 1, index - 2],
      description: i18nText(I18N.descriptions.inspectParents, { index }),
      activeCodeLine: 4,
      phaseLabel: I18N.phases.inspectParents,
      phase: 'compare',
      computation: {
        label: i18nText(I18N.labels.termFormula, { index }),
        expression: `${fib[index - 1]!} + ${fib[index - 2]!}`,
        result: String(fib[index - 1]! + fib[index - 2]!),
        decision: I18N.decisions.combineAdjacentCachedTerms,
      },
    });

    fib[index] = fib[index - 1]! + fib[index - 2]!;

    yield createStep({
      scenario,
      fib,
      activeIndex: index,
      candidateIndexes: [index - 1, index - 2],
      activeStatus: 'improved',
      description: i18nText(I18N.descriptions.commitTerm, { index }),
      activeCodeLine: 5,
      phaseLabel: I18N.phases.commitTerm,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.termFormula, { index }),
        expression: `${fib[index - 1]!} + ${fib[index - 2]!}`,
        result: String(fib[index]!),
        decision: I18N.decisions.cacheFilledForFutureTerms,
      },
    });
  }

  yield createStep({
    scenario,
    fib,
    activeIndex: scenario.n,
    activeStatus: 'chosen',
    description: i18nText(I18N.descriptions.complete, { index: scenario.n }),
    activeCodeLine: 6,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: FibonacciScenario;
  readonly fib: readonly number[];
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
  const rowHeaders: DpHeaderConfig[] = [{ id: 'row-fib', label: 'fib', status: 'accent', metaLabel: 'cache' }];
  const colHeaders: DpHeaderConfig[] = args.fib.map((_, index) => ({
    id: `col-${index}`,
    label: String(index),
    status: (args.activeIndex === index ? 'active' : candidateSet.has(index) ? 'accent' : index <= 1 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: index <= 1 ? 'base' : 'term',
  }));

  const cells: DpCellConfig[] = args.fib.map((value, index) => ({
    row: 0,
    col: index,
    rowLabel: 'fib',
    colLabel: `${index}`,
    valueLabel: String(value),
    metaLabel: index === args.scenario.n ? 'target' : null,
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
    { label: I18N.insights.nLabel, value: String(args.scenario.n), tone: 'accent' },
    {
      label: I18N.insights.resultLabel,
      value: String(args.fib[args.scenario.n] ?? 0),
      tone: 'success',
    },
    {
      label: I18N.insights.growthLabel,
      value:
        args.activeIndex && args.activeIndex >= 2
          ? i18nText(I18N.labels.growthPair, {
              left: args.fib[args.activeIndex - 2],
              right: args.fib[args.activeIndex - 1],
            })
          : I18N.labels.seedValue,
      tone: 'warning',
    },
    { label: I18N.insights.baseLabel, value: I18N.labels.baseValue, tone: 'info' },
    {
      label: I18N.insights.stripLabel,
      value: i18nText(I18N.labels.stripValue, { length: args.fib.length }),
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'fibonacci-dp',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultValue, {
      index: args.scenario.n,
      value: args.fib[args.scenario.n] ?? 0,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `1 × ${args.fib.length}`,
    activeLabel:
      args.activeIndex === undefined
        ? null
        : i18nText(I18N.labels.activeTerm, { index: args.activeIndex }),
    pathLabel: i18nText(I18N.labels.pathValue, { sequence: args.fib.join(' · ') }),
    primaryItemsLabel: I18N.labels.termIndicesLabel,
    primaryItems: args.fib.map((_, index) => `F(${index})`),
    secondaryItemsLabel: I18N.labels.cachedValuesLabel,
    secondaryItems: args.fib.map((value, index) => `F${index}=${value}`),
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
