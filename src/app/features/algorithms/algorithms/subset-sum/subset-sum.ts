import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { SubsetSumScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.subsetSum.modeLabel'),
  phases: {
    initializeBooleanTable: t(
      'features.algorithms.runtime.dp.subsetSum.phases.initializeBooleanTable',
    ),
    checkSubsetBranches: t(
      'features.algorithms.runtime.dp.subsetSum.phases.checkSubsetBranches',
    ),
    commitReachableState: t(
      'features.algorithms.runtime.dp.subsetSum.phases.commitReachableState',
    ),
    noSubsetFound: t('features.algorithms.runtime.dp.subsetSum.phases.noSubsetFound'),
    backtrackSkip: t('features.algorithms.runtime.dp.subsetSum.phases.backtrackSkip'),
    backtrackTake: t('features.algorithms.runtime.dp.subsetSum.phases.backtrackTake'),
    subsetReady: t('features.algorithms.runtime.dp.subsetSum.phases.subsetReady'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.subsetSum.descriptions.initialize'),
    compareBranches: t('features.algorithms.runtime.dp.subsetSum.descriptions.compareBranches'),
    forcedSkip: t('features.algorithms.runtime.dp.subsetSum.descriptions.forcedSkip'),
    storeReachability: t(
      'features.algorithms.runtime.dp.subsetSum.descriptions.storeReachability',
    ),
    impossible: t('features.algorithms.runtime.dp.subsetSum.descriptions.impossible'),
    backtrackSkip: t('features.algorithms.runtime.dp.subsetSum.descriptions.backtrackSkip'),
    backtrackTake: t('features.algorithms.runtime.dp.subsetSum.descriptions.backtrackTake'),
    complete: t('features.algorithms.runtime.dp.subsetSum.descriptions.complete'),
  },
  insights: {
    targetLabel: t('features.algorithms.runtime.dp.subsetSum.insights.targetLabel'),
    valuesLabel: t('features.algorithms.runtime.dp.subsetSum.insights.valuesLabel'),
    reachableLabel: t('features.algorithms.runtime.dp.subsetSum.insights.reachableLabel'),
    chosenLabel: t('features.algorithms.runtime.dp.subsetSum.insights.chosenLabel'),
    gridLabel: t('features.algorithms.runtime.dp.subsetSum.insights.gridLabel'),
  },
  labels: {
    resultTarget: t('features.algorithms.runtime.dp.subsetSum.labels.resultTarget'),
    subsetPath: t('features.algorithms.runtime.dp.subsetSum.labels.subsetPath'),
    subsetPending: t('features.algorithms.runtime.dp.subsetSum.labels.subsetPending'),
    activeCell: t('features.algorithms.runtime.dp.subsetSum.labels.activeCell'),
    numbersLabel: t('features.algorithms.runtime.dp.subsetSum.labels.numbersLabel'),
    currentLensLabel: t('features.algorithms.runtime.dp.subsetSum.labels.currentLensLabel'),
    booleanReachability: t(
      'features.algorithms.runtime.dp.subsetSum.labels.booleanReachability',
    ),
    skipValue: t('features.algorithms.runtime.dp.subsetSum.labels.skipValue'),
    takeValue: t('features.algorithms.runtime.dp.subsetSum.labels.takeValue'),
    takeUnavailable: t('features.algorithms.runtime.dp.subsetSum.labels.takeUnavailable'),
    valueForSumComputation: t(
      'features.algorithms.runtime.dp.subsetSum.labels.valueForSumComputation',
    ),
    dpCellComputation: t(
      'features.algorithms.runtime.dp.subsetSum.labels.dpCellComputation',
    ),
    skipValueComputation: t(
      'features.algorithms.runtime.dp.subsetSum.labels.skipValueComputation',
    ),
    takeValueComputation: t(
      'features.algorithms.runtime.dp.subsetSum.labels.takeValueComputation',
    ),
    rowValue: t('features.algorithms.runtime.dp.subsetSum.labels.rowValue'),
  },
  decisions: {
    takeOpensNewReachableSum: t(
      'features.algorithms.runtime.dp.subsetSum.decisions.takeOpensNewReachableSum',
    ),
    skipAlreadyReaches: t(
      'features.algorithms.runtime.dp.subsetSum.decisions.skipAlreadyReaches',
    ),
    sumStaysUnreachable: t(
      'features.algorithms.runtime.dp.subsetSum.decisions.sumStaysUnreachable',
    ),
    reachable: t('features.algorithms.runtime.dp.subsetSum.decisions.reachable'),
    stillImpossible: t('features.algorithms.runtime.dp.subsetSum.decisions.stillImpossible'),
    skipValue: t('features.algorithms.runtime.dp.subsetSum.decisions.skipValue'),
    includeValueInSubset: t(
      'features.algorithms.runtime.dp.subsetSum.decisions.includeValueInSubset',
    ),
  },
} as const;

export function* subsetSumGenerator(scenario: SubsetSumScenario): Generator<SortStep> {
  const count = scenario.numbers.length;
  const target = scenario.target;
  const table = Array.from({ length: count + 1 }, () => Array.from({ length: target + 1 }, () => false));
  table[0]![0] = true;
  const chosenIndexes = new Set<number>();
  const backtrackCells = new Set<string>();

  yield createStep({
    scenario,
    table,
    chosenIndexes,
    backtrackCells,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBooleanTable,
    phase: 'init',
  });

  for (let row = 1; row <= count; row++) {
    const value = scenario.numbers[row - 1]!;

    for (let sum = 0; sum <= target; sum++) {
      const skipReachable = table[row - 1]![sum]!;
      const canTake = value <= sum;
      const takeReachable = canTake ? table[row - 1]![sum - value]! : false;

      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        candidateCells: canTake ? [[row - 1, sum], [row - 1, sum - value]] : [[row - 1, sum]],
        secondaryItems: [
          i18nText(I18N.labels.skipValue, { value: boolLabel(skipReachable) }),
          canTake
            ? i18nText(I18N.labels.takeValue, { value: boolLabel(takeReachable) })
            : I18N.labels.takeUnavailable,
        ],
        description: canTake
          ? i18nText(I18N.descriptions.compareBranches, { sum, value })
          : i18nText(I18N.descriptions.forcedSkip, { value, sum }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.checkSubsetBranches,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.valueForSumComputation, { value, sum }),
          expression: canTake
            ? `dp[${row - 1}][${sum}] OR dp[${row - 1}][${sum - value}]`
            : `${value} > ${sum}`,
          result: boolLabel(skipReachable || takeReachable),
          decision: takeReachable && !skipReachable
            ? I18N.decisions.takeOpensNewReachableSum
            : skipReachable
              ? I18N.decisions.skipAlreadyReaches
              : I18N.decisions.sumStaysUnreachable,
        },
      });

      table[row]![sum] = skipReachable || takeReachable;

      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        candidateCells: canTake ? [[row - 1, sum], [row - 1, sum - value]] : [[row - 1, sum]],
        activeCellStatus: table[row]![sum]! ? (takeReachable && !skipReachable ? 'improved' : 'chosen') : 'blocked',
        description: i18nText(I18N.descriptions.storeReachability, { sum, row }),
        activeCodeLine: 8,
        phaseLabel: I18N.phases.commitReachableState,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCellComputation, { row, sum }),
          expression: `${boolLabel(skipReachable)} | ${boolLabel(takeReachable)}`,
          result: boolLabel(table[row]![sum]!),
          decision: table[row]![sum]! ? I18N.decisions.reachable : I18N.decisions.stillImpossible,
        },
      });
    }
  }

  if (!table[count]![target]!) {
    yield createStep({
      scenario,
      table,
      chosenIndexes,
      backtrackCells,
      description: i18nText(I18N.descriptions.impossible, { target }),
      activeCodeLine: 15,
      phaseLabel: I18N.phases.noSubsetFound,
      phase: 'complete',
    });
    return;
  }

  let row = count;
  let sum = target;
  while (row > 0 && sum >= 0) {
    backtrackCells.add(dpCellId(row, sum));
    const value = scenario.numbers[row - 1]!;
    if (table[row - 1]![sum]!) {
      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        activeCellStatus: 'backtrack',
        pathLabel: subsetLabel(scenario, chosenIndexes),
        description: i18nText(I18N.descriptions.backtrackSkip, { sum, value }),
        activeCodeLine: 13,
        phaseLabel: I18N.phases.backtrackSkip,
        phase: 'skip-relax',
        computation: {
          label: i18nText(I18N.labels.skipValueComputation, { value }),
          expression: 'reachable above',
          result: i18nText(I18N.labels.rowValue, { row: row - 1 }),
          decision: I18N.decisions.skipValue,
        },
      });
      row -= 1;
      continue;
    }

    if (sum >= value && table[row - 1]![sum - value]!) {
      chosenIndexes.add(row - 1);
      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        activeCellStatus: 'backtrack',
        pathLabel: subsetLabel(scenario, chosenIndexes),
        description: i18nText(I18N.descriptions.backtrackTake, {
          value,
          sum: sum - value,
        }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.backtrackTake,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.takeValueComputation, { value }),
          expression: `sum ${sum} -> ${sum - value}`,
          result: boolLabel(true),
          decision: I18N.decisions.includeValueInSubset,
        },
      });
      sum -= value;
      row -= 1;
      continue;
    }

    row -= 1;
  }

  yield createStep({
    scenario,
    table,
    chosenIndexes,
    backtrackCells,
    pathLabel: subsetLabel(scenario, chosenIndexes),
    description: i18nText(I18N.descriptions.complete, { target }),
    activeCodeLine: 15,
    phaseLabel: I18N.phases.subsetReady,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: SubsetSumScenario;
  readonly table: readonly (readonly boolean[])[];
  readonly chosenIndexes: ReadonlySet<number>;
  readonly backtrackCells: ReadonlySet<string>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'improved' | 'chosen' | 'blocked' | 'backtrack';
  readonly secondaryItems?: readonly TranslatableText[];
  readonly pathLabel?: TranslatableText;
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-0', label: 'no nums', status: 'source', metaLabel: 'base' },
    ...args.scenario.numbers.map((value, index) => ({
      id: `row-${index + 1}`,
      label: `${value}`,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : args.chosenIndexes.has(index) ? 'accent' : 'idle') as DpHeaderConfig['status'],
      metaLabel: 'value',
    })),
  ];
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.scenario.target + 1 }, (_, sum) => ({
    id: `col-${sum}`,
    label: String(sum),
    status: (args.activeCell?.[1] === sum ? 'active' : sum === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: sum === 0 ? 'base' : 'sum',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let sum = 0; sum < args.table[row]!.length; sum++) {
      const id = dpCellId(row, sum);
      const reachable = args.table[row]![sum]!;
      const isBase = row === 0 || sum === 0;
      const isBacktrack = args.backtrackCells.has(id);
      const tags = [
        ...(isBase ? (['base'] as const) : []),
        ...(candidateIds.has(id) ? (['best'] as const) : []),
        ...(id === activeCellId ? (['active'] as const) : []),
        ...(isBacktrack ? (['path'] as const) : []),
      ];

      cells.push({
        row,
        col: sum,
        rowLabel: row === 0 ? 'no nums' : `${args.scenario.numbers[row - 1]!}`,
        colLabel: `${sum}`,
        valueLabel: boolLabel(reachable),
        metaLabel: isBacktrack ? 'subset' : reachable ? 'yes' : 'no',
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeCellStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : isBase
                ? 'base'
                : reachable
                  ? 'chosen'
                  : 'blocked',
        tags,
      });
    }
  }

  const best = args.table[args.scenario.numbers.length]![args.scenario.target]!;
  const insights: DpInsight[] = [
    { label: I18N.insights.targetLabel, value: String(args.scenario.target), tone: 'accent' },
    { label: I18N.insights.valuesLabel, value: args.scenario.numbers.join(', '), tone: 'info' },
    {
      label: I18N.insights.reachableLabel,
      value: boolLabel(best),
      tone: best ? 'success' : 'warning',
    },
    { label: I18N.insights.chosenLabel, value: String(args.chosenIndexes.size), tone: 'warning' },
    { label: I18N.insights.gridLabel, value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'subset-sum',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultTarget, { value: boolLabel(best) }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell
      ? i18nText(I18N.labels.activeCell, { row: args.activeCell[0], sum: args.activeCell[1] })
      : null,
    pathLabel: args.pathLabel ?? subsetLabel(args.scenario, args.chosenIndexes),
    primaryItemsLabel: I18N.labels.numbersLabel,
    primaryItems: args.scenario.numbers.map((value) => `${value}`),
    secondaryItemsLabel: I18N.labels.currentLensLabel,
    secondaryItems: args.secondaryItems ?? [I18N.labels.booleanReachability],
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'full',
    computation: args.computation ?? null,
  });
}

function subsetLabel(
  scenario: SubsetSumScenario,
  chosenIndexes: ReadonlySet<number>,
): TranslatableText {
  const chosen = [...chosenIndexes]
    .sort((left, right) => left - right)
    .map((index) => scenario.numbers[index]!);
  return chosen.length > 0
    ? i18nText(I18N.labels.subsetPath, { values: chosen.join(' + ') })
    : I18N.labels.subsetPending;
}

function boolLabel(value: boolean): string {
  return value ? 'T' : 'F';
}
